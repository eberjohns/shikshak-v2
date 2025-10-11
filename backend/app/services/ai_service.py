# app/services/ai_service.py

import httpx
import json
import pdfplumber
from fastapi import HTTPException, UploadFile
from app.core.config import settings
from datetime import date
from typing import List, Dict, Any

from app.schemas.feedback import AIFeedback

# --- New Grading Functions ---

async def grade_single_answer(
    question_text: str,
    answer_text: str,
    grading_rules: str
) -> AIFeedback:
    """
    Calls Gemini API to grade a single student answer based on the teacher's rules.
    This function enforces a strict JSON output using a response schema.
    """
    api_url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-2.5-flash-preview-05-20:generateContent?key={settings.GEMINI_API_KEY}"
    )

    system_prompt = f"""
    You are an expert AI teaching assistant. Your task is to grade a student's answer for a subjective exam question.
    - You will be given the Question, the Student's Answer, and the Teacher's Grading Rules.
    - Adhere strictly to the Teacher's Grading Rules when evaluating the answer.
    - Provide a score from 0 to 10.
    - Provide concise, constructive feedback explaining the score.
    - Categorize the answer's primary error type from the provided list. If the answer is good, use 'correct'.

    The student's answer might be a high-quality response, a flawed answer, or somewhere in between. Evaluate it impartially based on the rules.

    Teacher's Grading Rules: "{grading_rules}"
    """
    
    user_prompt = f"""
    Question: "{question_text}"
    Student's Answer: "{answer_text}"
    """

    payload = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": AIFeedback.model_json_schema()
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, json=payload, timeout=90.0)
            response.raise_for_status()
            
        result = response.json()
        content_text = result['candidates'][0]['content']['parts'][0]['text']
        feedback_data = json.loads(content_text)
        
        # Validate the received data against our Pydantic schema
        return AIFeedback(**feedback_data)

    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise HTTPException(status_code=502, detail=f"AI service communication error: {e}")
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI feedback response: {e}")
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"An unexpected error occurred during AI grading: {e}")


async def generate_overall_feedback(
    graded_answers: List[Dict[str, Any]],
    overall_score: float
) -> str:
    """
    Calls Gemini API to generate summary feedback for an entire exam submission.
    """
    api_url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-2.5-flash-preview-05-20:generateContent?key={settings.GEMINI_API_KEY}"
    )
    
    system_prompt = """
    You are an encouraging and insightful AI teaching assistant.
    Based on a student's performance on an exam, your task is to write a brief, one-paragraph summary.
    - Start by acknowledging their overall performance based on the score.
    - Highlight one or two key areas where they did well.
    - Point out the main concept or type of error they struggled with, based on the feedback for their incorrect answers.
    - End with a positive and encouraging closing statement.
    """
    
    # Prepare a condensed version of the graded answers for the prompt
    performance_summary = ""
    for item in graded_answers:
        performance_summary += (
            f"Question: {item['question']}\n"
            f"Feedback: {item['feedback']}\n"
            f"Error Type: {item['error_type']}\n\n"
        )
    
    user_prompt = f"""
    Student's Overall Score: {overall_score:.1f}/10
    
    Performance on each question:
    {performance_summary}
    
    Please provide the summary feedback paragraph now.
    """

    payload = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]}
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, json=payload, timeout=90.0)
            response.raise_for_status()
        
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']

    except Exception:
        # If summary generation fails, return a generic message instead of crashing.
        return "Your submission has been graded. Please review the feedback for each question."

# --- Existing Functions ---

async def generate_schedule_from_syllabus(file: UploadFile) -> List[Dict]:
    """
    Extracts text from a syllabus PDF and calls Gemini API to generate a course schedule.
    """
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

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, json=payload, timeout=60.0)
            response.raise_for_status()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to communicate with AI service: {e}"
        )

    try:
        result = response.json()
        content_text = result['candidates'][0]['content']['parts'][0]['text']
        if content_text.startswith("```json"):
            content_text = content_text.removeprefix("```json").removesuffix("```").strip()
        schedule_data = json.loads(content_text)
        if (
            not isinstance(schedule_data, list)
            or not all(
                isinstance(item, dict) and "topic_name" in item
                for item in schedule_data
            )
        ):
            raise ValueError("LLM returned malformed data")
        return schedule_data
    except (json.JSONDecodeError, KeyError, IndexError, ValueError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse schedule from AI response: {e}"
        )


async def generate_exam_questions(course_name: str, topic_name: str) -> List[str]:
    """
    Calls Gemini API to generate 10 subjective exam questions for a given topic.
    """
    api_url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-2.5-flash-preview-05-20:generateContent?key={settings.GEMINI_API_KEY}"
    )

    system_prompt = f"""
    You are a university-level academic assistant. Your task is to create a 10-question subjective, open-ended exam for the course '{course_name}' focusing specifically on the topic '{topic_name}'.
    - The questions should encourage critical thinking and detailed explanations, not simple one-word answers.
    - Respond with ONLY a valid JSON array of 10 strings. Each string in the array is a single question text.
    - Do not include numbers like "1." or "2." in the strings themselves.
    - Do not include any text, markdown, or explanations before or after the JSON array.
    """

    payload = {
        "contents": [{"parts": [{"text": f"Generate exam for course {course_name}, topic {topic_name}"}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]}
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, json=payload, timeout=90.0)
            response.raise_for_status()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to communicate with AI service: {e}"
        )

    try:
        result = response.json()
        content_text = result['candidates'][0]['content']['parts'][0]['text']
        if content_text.startswith("```json"):
            content_text = content_text.removeprefix("```json").removesuffix("```").strip()
        questions_list = json.loads(content_text)
        if not isinstance(questions_list, list) or not all(isinstance(q, str) for q in questions_list):
             raise ValueError("LLM returned malformed data, not a list of strings.")
        return questions_list
    except (json.JSONDecodeError, KeyError, IndexError, ValueError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse questions from AI response: {e}"
        )
