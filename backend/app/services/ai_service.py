# app/services/ai_service.py

import httpx
import json
import pdfplumber
from fastapi import HTTPException, UploadFile
from app.core.config import settings
from datetime import date
from typing import List, Dict


async def generate_schedule_from_syllabus(file: UploadFile) -> List[Dict]:
    """
    Extracts text from a syllabus PDF and calls Gemini API to generate a course schedule.
    Returns a list of dictionaries with keys: topic_name, topic_description, end_date.
    """
    # --- Extract text from PDF ---
    try:
        with pdfplumber.open(file.file) as pdf:
            text = "".join(page.extract_text() or "" for page in pdf.pages)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file.")

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF. The file might be empty or image-based."
        )

    # --- Prepare API request ---
    api_url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-2.5-flash-preview-05-20:generateContent?key={settings.GEMINI_API_KEY}"
    )

    current_date = date.today().strftime("%Y-%m-%d")

    system_prompt = f"""
    You are an expert curriculum designer. Based on the following syllabus text, break it down into distinct, sequential topics for a 12-week course.
    - Provide a logical name for each topic.
    - Provide a brief one-sentence description for each topic.
    - Distribute the topics evenly, assigning a realistic end_date for each, starting from {current_date}.
    - Respond with ONLY a valid JSON array of objects. Each object must have keys: "topic_name" (string), "topic_description" (string), "end_date" (string in YYYY-MM-DD format).
    - Do not include any text or markdown formatting before or after the JSON array.
    """

    payload = {
        "contents": [{"parts": [{"text": text}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]}
    }

    # --- Call the AI API ---
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, json=payload, timeout=60.0)
            response.raise_for_status()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to communicate with AI service: {e}"
        )

    # --- Parse API response ---
    try:
        result = response.json()
        candidates = result.get("candidates", [])
        if not candidates:
            raise HTTPException(status_code=500, detail="AI returned no content")

        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        content_text = content_text.strip()

        # Remove markdown fences if present
        if content_text.startswith("```json"):
            content_text = content_text.removeprefix("```json").removesuffix("```").strip()

        # Parse JSON
        schedule_data = json.loads(content_text)

        # Validate structure
        if (
            not isinstance(schedule_data, list)
            or not all(
                isinstance(item, dict) and 
                "topic_name" in item and 
                "topic_description" in item and 
                "end_date" in item
                for item in schedule_data
            )
        ):
            raise ValueError("LLM returned malformed data")

        return schedule_data

    except (json.JSONDecodeError, KeyError, IndexError, ValueError) as e:
        print("AI Response causing error:", content_text)
        raise HTTPException(
            status_code=500,
            detail="Failed to parse schedule from AI response. The model may have returned an unexpected format."
        )
