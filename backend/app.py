import os
import json
from io import BytesIO

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from openai import OpenAI

# ----------------------
# Setup
# ----------------------
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------
# Memory Stores (MVP)
# ----------------------
stored_summary = ""
stored_sections = {}
stored_connections = []


# ----------------------
# PROFESSOR-STYLE SYSTEM PROMPT
# ----------------------
SYSTEM_PROMPT = """
You are Synapse, an elite academic tutor and intellectual mentor.

You do NOT behave like a generic chatbot.
You behave like a demanding but supportive professor.

Your teaching principles:

1. Teach, do not merely answer.
2. Push students toward understanding, not memorisation.
3. Explain concepts deeply and clearly.
4. Reveal relationships between ideas across readings.
5. Challenge weak assumptions or incomplete reasoning.
6. Ask guiding questions when useful.
7. When appropriate, act like a tutor preparing a student for exams.
8. Prioritise conceptual mastery.

Response style:
- Use structured academic explanations.
- Use headings and bullet points where useful.
- Define important concepts.
- Connect ideas across sections.
- Include examples or analogies where helpful.
- When relevant include:
   * Why it matters
   * How it links to bigger ideas
   * Potential critique or debate

When a student asks a question:
- First answer clearly.
- Then deepen the answer.
- Then extend their thinking.

Tone:
Supportive, rigorous, professor-like.
Never generic.
"""


# ----------------------
# OPENAI HELPERS
# ----------------------

def generate_chat(messages,
                  model="gpt-4o-mini",
                  temperature=0.5,
                  max_tokens=4000):

    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        messages=messages,
    )

    return response.choices[0].message.content


# ----------------------
# PDF Upload + Note Generation
# ----------------------
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    global stored_summary
    global stored_sections
    global stored_connections

    pdf_bytes = await file.read()

    reader = PdfReader(BytesIO(pdf_bytes))

    extracted_text = ""

    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text + "\n"


    reading = extracted_text[:20000]

    user_prompt = f"""
Create professor-quality academic study notes.

Return notes in this structure:

## Overview
Brief synthesis of whole reading

## Major Themes
Identify central arguments/themes

## Key Concepts
Define important ideas clearly

## Section Notes
Use multiple ## headings.
Each section should:
- explain ideas
- show conceptual relationships
- include examples
- highlight debates where relevant

## Connections Across Ideas
Show how major concepts relate.

## Critical Questions
Generate deeper thinking questions.

## Possible Exam Questions
Generate 5 strong exam questions.

Use markdown headings.
Use **bold** for key terms.
Aim for depth over summary.

Reading:
{reading}
"""

    stored_summary = generate_chat(
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        model="gpt-4o",
        temperature=0.35,
        max_tokens=6000
    )

    stored_sections = parse_sections(stored_summary)

    stored_connections = await generate_connections(
        stored_sections
    )

    return {
        "summary": stored_summary,
        "sections": stored_sections,
        "connections": stored_connections
    }


# ----------------------
# Generate Concept Connections
# ----------------------
async def generate_connections(sections):

    if len(sections) < 2:
        return []

    section_overview = "\n".join([
        f"Section: {title}\n{content[:700]}"
        for title, content in list(sections.items())[:8]
    ])

    prompt = f"""
Identify 4-6 conceptual links across these sections.

Return valid JSON only:

{{
 "connections": [
   {{
      "from":"...",
      "to":"...",
      "label":"...",
      "description":"..."
   }}
 ]
}}

Sections:
{section_overview}
"""

    raw = generate_chat(
        messages=[
            {
                "role":"system",
                "content":"Return only valid JSON."
            },
            {
                "role":"user",
                "content":prompt
            }
        ],
        model="gpt-4o-mini",
        temperature=0.2,
        max_tokens=1200
    )

    try:
        parsed = json.loads(raw)
        return parsed.get("connections", [])
    except Exception:
        return []


# ----------------------
# Tutor Chat Endpoint
# ----------------------
@app.post("/ask")
async def ask_question(data: dict):

    question = data.get(
        "question",
        ""
    )

    selected_section = data.get(
        "selected_section",
        ""
    )

    chat_history = data.get(
        "chat_history",
        []
    )

    section_context = stored_sections.get(
        selected_section,
        ""
    )

    context_prompt = f"""
Academic context:

Selected section:
{selected_section if selected_section else 'Full document'}

Section content:
{section_context[:3000]}

Document overview:
{stored_summary[:8000]}

Tutor behaviour:
Respond like a professor tutoring a serious student.
Do not simply give answers.
Teach.
"""

    messages = [
        {
            "role":"system",
            "content":SYSTEM_PROMPT
        },
        {
            "role":"user",
            "content":context_prompt
        },
        {
            "role":"assistant",
            "content":"Understood. I have the academic context and will tutor the student accordingly."
        }
    ]


    for msg in chat_history[-8:]:
        messages.append(
            {
                "role": msg["role"],
                "content": msg["content"]
            }
        )


    messages.append(
        {
            "role":"user",
            "content":question
        }
    )


    answer = generate_chat(
        messages,
        model="gpt-4o-mini",
        temperature=0.6,
        max_tokens=1500
    )

    return {
        "answer": answer
    }


# ----------------------
# Connections Route
# ----------------------
@app.get("/connections")
def get_connections():
    return {
        "connections": stored_connections
    }


# ----------------------
# Health Check
# ----------------------
@app.get("/health")
def health():
    return {
        "status":"ok",
        "summary_model":"gpt-4o",
        "chat_model":"gpt-4o-mini"
    }


# ----------------------
# Parse Headings
# ----------------------
def parse_sections(summary):

    sections = {}

    current_heading = "Overview"
    current_content = []

    for line in summary.split("\n"):

        if line.startswith("## "):

            if current_content:
                sections[current_heading] = (
                    "\n".join(current_content).strip()
                )

            current_heading = (
                line.replace("## ", "").strip()
            )

            current_content = []

        else:
            current_content.append(line)


    if current_content:
        sections[current_heading] = (
            "\n".join(current_content).strip()
        )

    return sections