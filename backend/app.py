import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from pypdf import PdfReader
from io import BytesIO

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stored_summary = ""
stored_sections = {}

SYSTEM_PROMPT = """
You are an advanced academic study assistant.
Focus on academic comprehension, structured notes, and connections between ideas.
"""

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    global stored_summary, stored_sections

    pdf_bytes = await file.read()
    reader = PdfReader(BytesIO(pdf_bytes))

    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    prompt = f"""
Generate structured academic study notes.

Rules:
- Use ## headings
- Explain key concepts clearly
- Include connections across the reading
- Include possible exam questions

Reading:
{text[:20000]}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
    )

    stored_summary = response.choices[0].message.content
    stored_sections = parse_sections(stored_summary)

    return {
        "summary": stored_summary,
        "sections": stored_sections
    }


@app.post("/ask")
async def ask_question(data: dict):
    question = data.get("question", "")
    selected_section = data.get("selected_section", "")

    section_content = stored_sections.get(selected_section, "")

    prompt = f"""
Current selected section:
{selected_section}

Section content:
{section_content}

Full summary:
{stored_summary[:12000]}

Question:
{question}

Answer academically and connect ideas where useful.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
    )

    return {
        "answer": response.choices[0].message.content
    }


def parse_sections(summary):
    sections = {}
    current_heading = "Overview"
    current_content = []

    for line in summary.split("\n"):
        if line.startswith("## "):
            if current_content:
                sections[current_heading] = "\n".join(current_content)

            current_heading = line.replace("## ", "").strip()
            current_content = []
        else:
            current_content.append(line)

    if current_content:
        sections[current_heading] = "\n".join(current_content)

    return sections