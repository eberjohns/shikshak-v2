**registering a teacher:**
```JSON
{
  "email": "teacher@mail.com",
  "full_name": "Teacher D",
  "password": "teach",
  "role": "teacher"
}
```
**registering a student:**
```JSON
{
  "email": "student@mail.com",
  "full_name": "Student D",
  "password": "stud",
  "role": "student"
}
```
## The Purpose of Grading Rules
Think of the ```grading_rules``` field as your direct instructions to the AI grader. You are telling the AI what to look for and how to score the subjective answers. The more specific and clear you are, the better the AI's evaluation will be.

The format is a simple string, but you should structure that string with clear, actionable points.

### Examples of What to Type
Here are a few scenarios with copy-pasteable JSON payloads for testing. Let's use the "Software Project Management" course as an example.

**Scenario 1: Keyword and Concept-Based Rules**

Let's say the topic is "Software Process Models and Agile Development". You want the AI to look for specific terms and ideas.

*What to type in the request body:*
```JSON
{
  "status": "published",
  "grading_rules": "Grading instructions for the AI:\n- Award full points if the answer correctly defines and compares 'Agile' and 'Waterfall' models.\n- Look for keywords such as 'sprints', 'iterations', 'scrum', 'user stories', and 'backlog'.\n- The answer must mention that Agile is adaptive and Waterfall is sequential.\n- Deduct points if the answer only defines one model without comparison."
}
```
Why this is a good example: It gives the AI positive keywords, key concepts (comparison), and negative constraints (what to penalize).

**Scenario 2: Structure and Depth-Based Rules**

Let's say the topic is "Software Requirements Engineering". You care more about the structure of the answer than specific keywords.

*What to type in the request body:*
```JSON
{
  "status": "published",
  "grading_rules": "A good answer must do the following:\n1. Clearly distinguish between functional and non-functional requirements.\n2. Provide at least one real-world example for each type (e.g., 'A login button is a functional requirement, while system performance is non-functional').\n3. Explain the importance of requirements elicitation. Simple definitions are not sufficient."
}
```
Why this is a good example: It tells the AI to evaluate the quality and structure of the argument, not just the presence of words.

**Scenario 3: Simple Case (Just Publishing)**

You might just want to publish the exam for now and add rules later.

*What to type in the request body:*
```JSON
{
  "status": "published"
}
```
Why this works: Since ```grading_rules``` is an optional field, you don't have to provide it. The exam will be published, and the field will remain ```null```.

## How to Test That It's Working
Here is the simple, two-step process to verify your update:
1. Execute the ```PATCH``` Request:
- Use the ```PATCH /teacher/exams/{exam_id}``` endpoint.
- Paste in one of the JSON examples above.
- When you execute it, look at the response body. You should immediately see your new rules and the updated status reflected in the JSON that comes back. This confirms the update operation itself worked.

2. Verify with a GET Request:
- Now, go to the ```GET /teacher/exams``` endpoint.
- Execute it.
- Find the exam you just updated in the list. You should see that the ```status``` is now "published" and the ```grading_rules``` field contains the exact text you entered. This proves the data was saved correctly in the database.

By providing clear, structured rules now, you're setting up the AI for success when it comes time to grade the student submissions.



# Example 1

## Exam generated

```JSON
[
  {
    "id": "07a83659-458e-48f6-a8e3-3c69cbf0f79a",
    "title": "Draft Exam: Introduction to Software Engineering and SDLC",
    "status": "draft",
    "grading_rules": null,
    "topic_id": "8869f2cb-2d40-4139-941a-d4bfb7a64bbe",
    "questions": [
      {
        "id": "6c286ec5-a1af-49a3-8aee-36ede8d5f2eb",
        "question_text": "Elaborate on the fundamental distinction between \"programming\" and \"software engineering,\" and explain why a disciplined engineering approach is crucial for developing complex, reliable, and maintainable software systems."
      },
      {
        "id": "549301f6-1184-4fda-92dc-66d23df69310",
        "question_text": "Discuss the primary goals and objectives of software engineering. How do these goals address common challenges in software development projects, particularly concerning quality, cost, and schedule?"
      },
      {
        "id": "ef5b3d34-c257-4c15-9496-ff841cd04312",
        "question_text": "Explain the significance of a well-defined Software Development Life Cycle (SDLC) in managing software projects. What are the potential consequences and risks of omitting or poorly executing one or more SDLC phases?"
      },
      {
        "id": "7e9b6844-170f-41f7-9b90-9e977822fc7b",
        "question_text": "Describe the typical phases of a generic SDLC. For each phase, identify its main activities, key deliverables, and explain how its outputs serve as essential inputs for subsequent phases."
      },
      {
        "id": "fc50356a-7ccc-4f8c-bc1b-7b04707d8b6c",
        "question_text": "Compare and contrast two distinct SDLC models (e.g., Waterfall vs. Agile), highlighting their core principles, advantages, and disadvantages. Discuss specific project characteristics that would make one model more suitable than the other."
      },
      {
        "id": "23f2caf8-c2b2-4ee8-810b-1b67c1bb26b5",
        "question_text": "Critically analyze the importance of the requirements gathering and analysis phase in the SDLC. What specific risks and challenges arise from incomplete, ambiguous, or volatile requirements, and how can these be effectively mitigated?"
      },
      {
        "id": "fb4dfecf-6837-41a5-882c-9fc80341cd81",
        "question_text": "Beyond initial development, software undergoes a significant maintenance phase. Describe the different types of software maintenance (e.g., corrective, adaptive, perfective, preventive) and explain why this phase often consumes a substantial portion of a software system's total lifecycle cost."
      },
      {
        "id": "9dfc14ec-0c20-43e4-a316-f44f9d68445b",
        "question_text": "As a project manager, what key factors would you consider when selecting an appropriate SDLC model for a new software project? Illustrate your answer with specific project examples that would lead you to favor certain models over others."
      },
      {
        "id": "bfa00574-6c22-44d5-b5e2-d36fc68d1695",
        "question_text": "Discuss the role and importance of testing throughout the various stages of the SDLC, not just at the end. Why is early and continuous testing emphasized in modern software development methodologies, and what benefits does it provide?"
      },
      {
        "id": "192f546f-d44e-4931-9a5e-cfc85a2ed506",
        "question_text": "Reflect on the ethical considerations inherent in software engineering and project management within the SDLC. Provide examples of potential ethical dilemmas that might arise during different phases and discuss how a responsible software professional should navigate them."
      }
    ]
  }
]
```

## Exam updated

```JSON
{
  "status": "published",
  "grading_rules": "AI Grading Instructions:\n\n**Overall Goal:** Evaluate the student's comprehensive understanding of the Software Development Life Cycle (SDLC) and core software engineering principles. High marks should be given for answers that demonstrate critical thinking and the ability to compare concepts, not just define them.\n\n**Key Concepts to Look For Across All Answers:**\n- Correct differentiation between 'programming' (an activity) and 'software engineering' (a discipline).\n- Identification of core SDLC phases: Requirements, Design, Implementation, Testing, Maintenance.\n- Accurate comparison of Waterfall (sequential, rigid) vs. Agile (iterative, flexible).\n- Mention of key Agile terms like 'sprints', 'iterations', or 'scrum' where appropriate.\n- Understanding of different software maintenance types (e.g., corrective, adaptive, perfective).\n\n**Specific Guidance for Key Questions:**\n- **For question 5 (Waterfall vs. Agile):** The answer MUST actively compare and contrast the two models. Simply defining them in isolation is not sufficient for full marks.\n- **For question 8 (Project Manager's view):** The answer should connect the choice of an SDLC model to specific project characteristics (e.g., 'Use Waterfall for projects with stable, well-understood requirements' or 'Use Agile for projects where requirements are expected to change').\n- **For question 9 (Testing):** Reward answers that emphasize testing as a continuous activity throughout the SDLC, not just a final phase.\n\n**Scoring Instructions:**\n- Award maximum points for well-structured answers that use relevant examples to support their claims.\n- Deduct points for answers that are purely definitional without providing context or analysis.\n- Be lenient on minor grammatical errors, but the core concepts must be communicated clearly."
}
```

### Why These Rules are Effective
1. **Clear Goal**: It starts with a high-level objective, telling the AI what the overall purpose of the exam is.

2. **Keywords and Concepts**: It provides a checklist of essential terms and ideas the AI should look for, which helps ground its analysis.

3. **Actionable Instructions**: It gives specific, actionable rules for certain questions (e.g., "the answer MUST compare...").

4. **Positive and Negative Reinforcement**: It tells the AI what to reward ("use of examples") and what to penalize ("purely definitional answers").

5. **Formatting**: Using newlines (```\n```) and bullet points (```-```) makes the instructions more readable and structured, which helps the AI process them more effectively.

## Answer submission

```JSON
{
  "answers": [
    {
      "question_id": "6c286ec5-a1af-49a3-8aee-36ede8d5f2eb",
      "answer_text": "Programming is the act of writing code to perform a specific task. Software engineering, on the other hand, is a much broader discipline that encompasses the entire lifecycle of a software product. It includes programming, but also involves requirements analysis, system design, testing, maintenance, and project management. A disciplined engineering approach is crucial because it provides structure and predictability, ensuring that complex systems are not only functional but also reliable, scalable, and maintainable over time, which prevents chaotic development and reduces long-term costs."
    },
    {
      "question_id": "549301f6-1184-4fda-92dc-66d23df69310",
      "answer_text": "The primary goals of software engineering are to create high-quality software on time and within budget. Quality means the software should work correctly. Being on time and budget is important for business success."
    },
    {
      "question_id": "ef5b3d34-c257-4c15-9496-ff841cd04312",
      "answer_text": "A well-defined SDLC is significant because it provides a clear roadmap for the development team. It breaks down the massive task of building software into smaller, manageable phases. Omitting a phase, like proper testing, can lead to a buggy product and user dissatisfaction. Poorly executing the requirements phase can result in building the wrong product altogether, wasting significant time and resources."
    },
    {
      "question_id": "7e9b6844-170f-41f7-9b90-9e977822fc7b",
      "answer_text": "The typical phases are Requirements Gathering, where you figure out what the user wants. Then there's Implementation, where the code is written. After that is the Design phase, where you plan the architecture. Then comes Maintenance to fix bugs, and finally Testing to make sure everything works. The output of one phase is the input for the next."
    },
    {
      "question_id": "fc50356a-7ccc-4f8c-bc1b-7b04707d8b6c",
      "answer_text": "The Waterfall model is a traditional, sequential approach where each phase must be fully completed before the next begins. Its advantage is its simplicity and strict control, making it suitable for projects with stable, well-understood requirements, like building a simple inventory management system. Its main disadvantage is its rigidity; changes are very costly. In contrast, the Agile model is iterative and flexible. It works in short cycles called sprints, delivering working software frequently. Its advantage is its ability to adapt to changing requirements, making it ideal for projects where the final scope is unclear, like a new social media app. Its disadvantage is that it requires more customer involvement and can be less predictable in terms of final delivery date and cost."
    },
    {
      "question_id": "23f2caf8-c2b2-4ee8-810b-1b67c1bb26b5",
      "answer_text": "The requirements gathering phase is the most critical part of the SDLC because it sets the foundation for the entire project. If the requirements are wrong, ambiguous, or incomplete, the team will build the wrong system, regardless of how well they code or test. The biggest risk is a complete project failure. These risks can be mitigated through techniques like creating detailed prototypes, holding regular stakeholder meetings, and employing a rigorous change control process to manage any new or volatile requirements."
    },
    {
      "question_id": "fb4dfecf-6837-41a5-882c-9fc80341cd81",
      "answer_text": "The types of software maintenance are corrective, which involves adding new features to the software; adaptive, which is modifying the software to work in a new environment; perfective, which is improving performance or maintainability; and preventive, which is fixing issues before they become major problems. It consumes a large part of the cost because software lives for a long time and must constantly be updated to meet new business needs and fix bugs that are discovered over time."
    },
    {
      "question_id": "9dfc14ec-0c20-43e4-a316-f44f9d68445b",
      "answer_text": "As a project manager, the most important factor is the stability of the project's requirements. For a project with very clear, fixed, and well-documented requirements, such as a government tax calculation system, I would choose the Waterfall model because it provides a structured and predictable path. However, for a project where the requirements are expected to evolve, such as a startup developing a new mobile game, I would choose an Agile model to allow for flexibility and quick feedback from users."
    },
    {
      "question_id": "bfa00574-6c22-44d5-b5e2-d36fc68d1695",
      "answer_text": "There are many types of testing. Unit testing checks individual components of the code. Integration testing checks if these components work together correctly. System testing evaluates the entire system against the requirements. Finally, user acceptance testing is done by the client to confirm the system meets their needs. These are all important parts of the quality assurance process."
    },
    {
      "question_id": "192f546f-d44e-4931-9a5e-cfc85a2ed506",
      "answer_text": "Ethical considerations are important in software engineering. For example, during the requirements phase, a professional must be honest about what can be realistically achieved within the budget and timeframe, rather than overpromising. During the testing phase, it is unethical to hide known bugs from the client. A responsible professional should always prioritize user privacy and data security, and be transparent with stakeholders about project status and risks."
    }
  ]
}
```

### Breakdown of Answer Types for Your Testing:
- **High-Quality Answers**: Questions 1, 5, 6, 8, 10. These closely follow the grading rules.

- **Vague/Incomplete Answer**: Question 2. It's not wrong, but it lacks depth.

- **Procedural Error**: Question 4. The SDLC phases are listed in the wrong order.

- **Conceptual Error**: Question 7. It incorrectly defines "corrective" maintenance.

- **Interpretational Error**: Question 9. It correctly describes types of testing but fails to answer the core part of the question about why testing throughout the SDLC is important.
