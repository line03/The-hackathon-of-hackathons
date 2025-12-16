# main.py
import os
from typing import List, Optional
from enum import Enum
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
VECTOR_STORE_ID = os.getenv("VECTOR_STORE_ID")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY missing in .env")
if not VECTOR_STORE_ID:
    raise RuntimeError("VECTOR_STORE_ID missing in .env (run ingest_kb.py first)")

client = OpenAI(api_key=OPENAI_API_KEY)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str

# Quiz analysis models
class AnswerOption(BaseModel):
    text: str
    isCorrect: bool
    rationale: str


class QuizQuestion(BaseModel):
    question: str
    answerOptions: List[AnswerOption]
    # True if the user got it right, False if they got it wrong
    user_answer: bool



# Personalization Enums
class UnderstandingStyle(str, Enum):
    LOGIC = "step-by-step logic"
    SHORT = "short explanation"
    STORY = "real-life example / story"
    COMPARE = "compare right vs wrong"

class CorrectionStyle(str, Enum):
    GENTLE = "gentle encouragement"
    DIRECT = "direct correction"

class ComplexityLevel(str, Enum):
    SIMPLE = "very simple"
    NORMAL = "normal"
    TECHNICAL = "technical"

class StartWith(str, Enum):
    RULE = "The rule"
    EXAMPLE = "An example"

class VisualPreference(str, Enum):
    NONE = "no visuals"
    DIAGRAMS = "diagrams (mermaid)"

class UserPreferences(BaseModel):
    understanding_style: Optional[UnderstandingStyle] = None
    correction_style: Optional[CorrectionStyle] = None
    complexity: Optional[ComplexityLevel] = ComplexityLevel.NORMAL
    start_with: Optional[StartWith] = None
    visual_preference: Optional[VisualPreference] = VisualPreference.NONE


class QuizAnalysisRequest(BaseModel):
    quiz: List[QuizQuestion]
    preferences: Optional[UserPreferences] = None


class PerQuestionExplanation(BaseModel):
    # 1-based index of the wrong question within the list of wrong answers
    question_index: int
    # Original question text (for frontend display / debugging)
    question: str
    # Correct answer text
    correct_answer: str
    # Short teaching explanation for what the user missed (2–4 sentences)
    explanation: str
    # Optional: name of the most relevant file in the KB (internal reference only)
    filename: Optional[str] = None


class QuizAnalysisResponse(BaseModel):
    per_question: List[PerQuestionExplanation]
    overall_summary: str


@app.post("/ask", response_model=AnswerResponse)
async def ask(req: QuestionRequest):
    try:
        response = client.responses.create(
            model="gpt-5.1-mini",
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "You are an assistant that ONLY answers using "
                                "the knowledge from the attached files. "
                                "If something is not covered, reply exactly with: "
                                "'I don’t know based on the current knowledge base.'"
                            ),
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": req.question}
                    ],
                },
            ],
            tools=[{"type": "file_search"}],
            tool_resources={
                "file_search": {
                    "vector_store_ids": [VECTOR_STORE_ID]
                }
            },
        )

        # Extract answer text from response
        content_items = response.output[0].content
        answer_parts = [
            c.text for c in content_items
            if c.type == "output_text"
        ]
        answer = "\n".join(answer_parts).strip()

        return AnswerResponse(answer=answer)

    except Exception as e:
        # For debugging, you can print(e)
        raise HTTPException(status_code=500, detail="Error talking to OpenAI")

def build_style_instructions(prefs: Optional[UserPreferences]) -> str:
    """
    Convert UserPreferences into a plain English instruction block for the system prompt.
    """
    if not prefs:
        return ""

    instructions = []

    # 1. Complexity
    if prefs.complexity == ComplexityLevel.SIMPLE:
        instructions.append("Make the explanation VERY SIMPLE and easy to understand (beginner level). Avoid jargon.")
    elif prefs.complexity == ComplexityLevel.TECHNICAL:
        instructions.append("Use PRECISE TECHNICAL terminology and explain the mechanics in detail.")

    # 2. Understanding Style
    if prefs.understanding_style == UnderstandingStyle.LOGIC:
        instructions.append("Explain using STEP-BY-STEP LOGIC found in the knowledge base.")
    elif prefs.understanding_style == UnderstandingStyle.SHORT:
        instructions.append("Keep the explanation short and concise.")
    elif prefs.understanding_style == UnderstandingStyle.STORY:
        instructions.append("Use a REAL-LIFE EXAMPLE or ANALOGY (if available in the docs) to explain.")
    elif prefs.understanding_style == UnderstandingStyle.COMPARE:
        instructions.append("Compare the user's WRONG answer with the CORRECT answer to highlight the difference.")

    # 3. Correction Style
    if prefs.correction_style == CorrectionStyle.GENTLE:
        instructions.append("Be GENTLE and ENCOURAGING. Acknowledge effort.")
    elif prefs.correction_style == CorrectionStyle.DIRECT:
        instructions.append("Be DIRECT and straight to the point about the error.")

    # 4. Starting preference
    if prefs.start_with == StartWith.RULE:
        instructions.append("Start with the RULE or principle from the knowledge base.")
    elif prefs.start_with == StartWith.EXAMPLE:
        instructions.append("Start with an EXAMPLE of the concept first.")

    # 5. Visuals
    if prefs.visual_preference == VisualPreference.DIAGRAMS:
        instructions.append(
            "Include a MERMAID.JS diagram (using ```mermaid ... ``` syntax) if it helps explain the concept logic or flow."
        )

    if not instructions:
        return ""

    return "STYLE INSTRUCTIONS (FOLLOW STRICTLY):\n- " + "\n- ".join(instructions)

@app.post("/analyze-quiz", response_model=QuizAnalysisResponse)
async def analyze_quiz(req: QuizAnalysisRequest):
    """
    Analyze quiz results:
    - Find questions the user got wrong (user_answer == False)
    - Use the KB (via file_search) to generate:
        * A short teaching explanation per wrong question
        * An overall summary of what the user should review
    All explanations must be grounded ONLY in the knowledge base files.
    """
    # Build personalization string
    style_prompt = build_style_instructions(req.preferences)

    try:
        # Filter for wrong answers (where user_answer is False)
        wrong_answers: List[QuizQuestion] = [
            q for q in req.quiz if q.user_answer is False
        ]

        if not wrong_answers:
            # Nothing wrong: return an empty list and a positive summary
            return QuizAnalysisResponse(
                per_question=[],
                overall_summary=(
                    "All of your answers are correct based on the current quiz. "
                    "There is nothing specific you need to review from the knowledge base for this set."
                ),
            )

        # Build a single prompt describing all wrong answers with the correct answers/rationales
        # so the assistant can generate targeted explanations.
        wrong_blocks: List[str] = []
        for idx, question in enumerate(wrong_answers, 1):
            correct_answer = next(
                (opt for opt in question.answerOptions if opt.isCorrect), None
            )

            block = [
                f"Question {idx}:",
                f"Text: {question.question}",
                f"Correct answer: {correct_answer.text if correct_answer else 'N/A'}",
                f"Correct rationale: {correct_answer.rationale if correct_answer else 'N/A'}",
            ]
            wrong_blocks.append("\n".join(block))

        wrong_questions_section = "\n\n---\n\n".join(wrong_blocks)

        # Instruct the assistant to respond with a strict JSON object so we can parse it.
        analysis_query = (
            "You are an educational tutor that ONLY uses information from the attached knowledge base "
            "files (accessed via file_search). Do NOT use any outside knowledge.\n\n"
            f"{style_prompt}\n\n"
            "The user has answered some quiz questions incorrectly. For each wrong question, "
            "you must generate a **comprehensive and helpful teaching explanation** that fully clarifies the concept. "
            "Do NOT be constrained by length; explain as much as needed to ensure understanding.\n"
            "If the user requested diagrams, you MUST include a valid mermaid.js block (e.g. ```mermaid graph ...```) "
            "within the explanation string.\n\n"
            "Here are the wrong questions with their correct answers and rationales:\n\n"
            f"{wrong_questions_section}\n\n"
            "Now, using ONLY the knowledge from the attached files:\n"
            "1. Produce a JSON object with this exact structure:\n"
            "{\n"
            '  \"per_question\": [\n'
            "    {\n"
            "      \"question_index\": <number, 1-based index matching the order above>,\n"
            "      \"question\": \"<the question text>\",\n"
            "      \"explanation\": \"<detailed teaching explanation complying with style instructions>\",\n"
            "      \"filename\": \"<name of the most relevant KB file (e.g., some_file.pdf)>\" // or null if unsure\n"
            "    },\n"
            "    ...\n"
            "  ],\n"
            "  \"overall_summary\": \"<summary of the main ideas the user should review, grounded in the KB>\"\n"
            "}\n\n"
            "2. Respond with JSON ONLY. Do not include any extra commentary or formatting.\n"
        )
        print(f"DEBUG FULL PROMPT:\n{analysis_query}\n-------------------")

        # Use Assistants API with file_search and the configured vector store
        import time
        import json

        try:
            assistant = client.beta.assistants.create(
                name="Quiz Teaching Assistant",
                instructions=(
                    "You are an educational assistant that analyzes quiz performance and teaches concepts "
                    "using ONLY the attached knowledge base files. Always ground explanations in the KB and "
                    "follow the requested JSON output format exactly."
                ),
                model="gpt-4o-mini",
                tools=[{"type": "file_search"}],
                tool_resources={
                    "file_search": {
                        "vector_store_ids": [VECTOR_STORE_ID],
                    }
                },
            )

            thread = client.beta.threads.create()
            client.beta.threads.messages.create(
                thread_id=thread.id,
                role="user",
                content=analysis_query,
            )

            run = client.beta.threads.runs.create(
                thread_id=thread.id,
                assistant_id=assistant.id,
            )

            # Poll until the run is complete or times out
            max_wait_seconds = 180
            waited = 0
            while run.status in ("queued", "in_progress") and waited < max_wait_seconds:
                time.sleep(2)
                waited += 2
                run = client.beta.threads.runs.retrieve(
                    thread_id=thread.id,
                    run_id=run.id,
                )

            if run.status != "completed":
                detail = (
                    run.last_error.message
                    if getattr(run, "last_error", None)
                    else f"Assistant run status: {run.status}"
                )
                raise HTTPException(
                    status_code=500,
                    detail=f"Assistant run did not complete successfully: {detail}",
                )

            # Get the latest message from the assistant
            messages = client.beta.threads.messages.list(thread_id=thread.id)
            # messages.data is typically in reverse chronological order
            assistant_message = next(
                (m for m in messages.data if m.role == "assistant"), messages.data[0]
            )
            answer_text = assistant_message.content[0].text.value

            # Try to parse the JSON structure
            parsed = json.loads(answer_text)

            raw_per_question = parsed.get("per_question", [])
            overall_summary = parsed.get(
                "overall_summary",
                "Review the key concepts in the knowledge base related to these questions.",
            )

            per_question_explanations: List[PerQuestionExplanation] = []
            for idx, item in enumerate(raw_per_question, 1):
                # Fallbacks if fields are missing
                q_idx = item.get("question_index", idx)
                # Map back to the wrong_answers list if possible
                q_obj = wrong_answers[q_idx - 1] if 0 < q_idx <= len(wrong_answers) else None
                question_text = item.get(
                    "question",
                    q_obj.question if q_obj is not None else "",
                )
                explanation = item.get(
                    "explanation",
                    "Please review the relevant section in the knowledge base for more details.",
                )
                filename = item.get("filename")
                
                # Extract correct answer from the question object
                correct_answer_text = "N/A"
                if q_obj is not None:
                    correct_option = next(
                        (opt for opt in q_obj.answerOptions if opt.isCorrect), None
                    )
                    if correct_option:
                        correct_answer_text = correct_option.text

                per_question_explanations.append(
                    PerQuestionExplanation(
                        question_index=q_idx,
                        question=question_text,
                        correct_answer=correct_answer_text,
                        explanation=explanation,
                        filename=filename,
                    )
                )

            # If the assistant didn't return any per_question data, create generic entries
            if not per_question_explanations:
                for idx, q in enumerate(wrong_answers, 1):
                    # Extract correct answer
                    correct_option = next(
                        (opt for opt in q.answerOptions if opt.isCorrect), None
                    )
                    correct_answer_text = correct_option.text if correct_option else "N/A"
                    
                    per_question_explanations.append(
                        PerQuestionExplanation(
                            question_index=idx,
                            question=q.question,
                            correct_answer=correct_answer_text,
                            explanation=(
                                "Please review the relevant section in the knowledge base for this topic. "
                                "The system could not generate a detailed explanation."
                            ),
                            filename=None,
                        )
                    )

            return QuizAnalysisResponse(
                per_question=per_question_explanations,
                overall_summary=overall_summary,
            )

        except HTTPException:
            # Re-raise HTTP errors as-is so FastAPI can handle them
            raise
        except Exception as e:
            # For debugging
            import traceback

            print(f"Error in analyze_quiz (assistant call): {str(e)}")
            print(traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail=f"Error analyzing quiz with knowledge base: {str(e)}",
            )

    except HTTPException:
        # Let HTTPException bubble up unchanged
        raise
    except Exception as e:
        # Catch-all for unexpected errors
        import traceback

        print(f"Unexpected error in analyze_quiz: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error analyzing quiz: {str(e)}",
        )


# ============================================================
# Academia Reflection Analysis Endpoint
# ============================================================

class ReflectionFeedback(BaseModel):
    strengths: List[str]
    missing_points: List[str]
    improved_sentence: str


class ReflectionAnalysisResponse(BaseModel):
    actors: List[str]
    action: str
    benefit_receiver: str
    type_of_corruption: List[str]
    harm: List[str]
    rule_or_duty_breached: str
    score: float
    feedback: ReflectionFeedback


class ReflectionRequest(BaseModel):
    module_number: int
    student_response: str


REFLECTION_ANALYSIS_PROMPT = """You are a strict but fair tutor. Analyze the student's story about corruption.

STUDENT'S STORY:
{student_response}

INSTRUCTIONS:
1. Extract: actors, action, who benefited, who was harmed, what duty or rule was breached.

2. Classify the likely corruption type from: bribery, nepotism, conflict of interest, abuse of functions, embezzlement, extortion, favoritism, fraud, other.

3. Score out of 10 using:
   - Clarity of situation (3 points)
   - Identification of benefit and harm (3 points)
   - Corruption mechanism identification (2 points)
   - Rule or duty breach identification (2 points)

4. Provide:
   - 2 strengths in the student's analysis
   - 2 missing or unclear points
   - One improved sentence the student could write

Output ONLY valid JSON in the following schema:
{{
  "actors": ["person/role 1", "person/role 2"],
  "action": "description of the corrupt action",
  "benefit_receiver": "who benefited from the corruption",
  "type_of_corruption": ["type1", "type2"],
  "harm": ["harm 1", "harm 2"],
  "rule_or_duty_breached": "description of rule or duty violated",
  "score": 7.5,
  "feedback": {{
    "strengths": ["strength 1", "strength 2"],
    "missing_points": ["missing point 1", "missing point 2"],
    "improved_sentence": "An example of how the student could better express their analysis"
  }}
}}
"""


@app.post("/analyze-reflection", response_model=ReflectionAnalysisResponse)
async def analyze_reflection(req: ReflectionRequest):
    """
    Analyze a student's reflection story about corruption.
    Uses GPT-4o-mini to extract corruption elements and provide educational feedback.
    """
    import json

    if not req.student_response or len(req.student_response.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Please provide a more detailed story (at least 20 characters).",
        )

    try:
        prompt = REFLECTION_ANALYSIS_PROMPT.format(student_response=req.student_response)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an educational tutor that analyzes student reflections about corruption. Always respond with valid JSON only, no additional text.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.3,
            max_tokens=1000,
        )

        answer_text = response.choices[0].message.content.strip()
        
        # Clean up potential markdown code blocks
        if answer_text.startswith("```json"):
            answer_text = answer_text[7:]
        if answer_text.startswith("```"):
            answer_text = answer_text[3:]
        if answer_text.endswith("```"):
            answer_text = answer_text[:-3]
        answer_text = answer_text.strip()

        parsed = json.loads(answer_text)

        return ReflectionAnalysisResponse(
            actors=parsed.get("actors", []),
            action=parsed.get("action", ""),
            benefit_receiver=parsed.get("benefit_receiver", ""),
            type_of_corruption=parsed.get("type_of_corruption", []),
            harm=parsed.get("harm", []),
            rule_or_duty_breached=parsed.get("rule_or_duty_breached", ""),
            score=parsed.get("score", 0),
            feedback=ReflectionFeedback(
                strengths=parsed.get("feedback", {}).get("strengths", []),
                missing_points=parsed.get("feedback", {}).get("missing_points", []),
                improved_sentence=parsed.get("feedback", {}).get("improved_sentence", ""),
            ),
        )

    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {str(e)}")
        print(f"Raw response: {answer_text}")
        raise HTTPException(
            status_code=500,
            detail="Failed to parse AI response. Please try again.",
        )
    except Exception as e:
        import traceback
        print(f"Error in analyze_reflection: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing reflection: {str(e)}",
        )