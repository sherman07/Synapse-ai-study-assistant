import base64
import json
import mimetypes
import os
import re
import urllib.request
from io import BytesIO
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pypdf import PdfReader

try:
    from docx import Document
except Exception:
    Document = None

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ANALYSIS_MODEL = os.getenv("OPENAI_ANALYSIS_MODEL", "gpt-4o-mini")
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")

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
stored_connections = []
stored_brainstorm = {}

SYSTEM_PROMPT = """
You are Synapse, an elite academic tutor and intellectual mentor.
You behave like a demanding but supportive professor, not a generic chatbot.
Teach, challenge, connect ideas, and guide the student toward deeper understanding.
Use structured academic explanations, clear headings, and concise but deep analysis.
"""


def generate_chat(messages, model=CHAT_MODEL, temperature=0.45, max_tokens=4500):
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is missing. Add it to your .env file.")

    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        messages=messages,
    )
    return response.choices[0].message.content or ""


def extract_pdf(data: bytes) -> str:
    reader = PdfReader(BytesIO(data))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text.strip()


def extract_docx(data: bytes) -> str:
    if Document is None:
        return "DOCX support is not installed. Run: pip install python-docx"

    document = Document(BytesIO(data))
    paragraphs = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    return "\n".join(paragraphs).strip()


def extract_text_file(data: bytes) -> str:
    return data.decode("utf-8", errors="ignore").strip()


def clean_html(raw: str) -> str:
    raw = re.sub(r"<script[\s\S]*?</script>", " ", raw, flags=re.I)
    raw = re.sub(r"<style[\s\S]*?</style>", " ", raw, flags=re.I)
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = re.sub(r"\s+", " ", raw)
    return raw.strip()


def fetch_link(url: str) -> str:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            raw = response.read(100000).decode("utf-8", errors="ignore")
        return clean_html(raw)[:12000]
    except Exception as error:
        return f"Could not fetch link {url}: {error}"


def file_to_content(name: str, content_type: str, data: bytes):
    lower_name = name.lower()

    if content_type and content_type.startswith("image/"):
        encoded = base64.b64encode(data).decode("utf-8")
        return {
            "type": "image_url",
            "image_url": {"url": f"data:{content_type};base64,{encoded}"}
        }

    if lower_name.endswith(".pdf") or content_type == "application/pdf":
        text = extract_pdf(data)
    elif lower_name.endswith(".docx"):
        text = extract_docx(data)
    else:
        text = extract_text_file(data)

    if not text:
        text = "No readable text was extracted from this file."

    return {
        "type": "text",
        "text": f"\n\nSOURCE FILE: {name}\n{text[:18000]}"
    }


@app.post("/analyze")
async def analyze_materials(
    files: List[UploadFile] = File(default=[]),
    links: str = Form(default="[]")
):
    try:
        global stored_summary, stored_sections, stored_connections, stored_brainstorm

        content_parts = []
        source_names = []

        for uploaded in files:
            data = await uploaded.read()
            if not data:
                continue

            content_type = (
                uploaded.content_type
                or mimetypes.guess_type(uploaded.filename or "")[0]
                or "application/octet-stream"
            )
            filename = uploaded.filename or "uploaded file"
            source_names.append(filename)
            content_parts.append(file_to_content(filename, content_type, data))

        try:
            parsed_links = json.loads(links) if links else []
        except Exception:
            parsed_links = []

        for url in parsed_links:
            if not isinstance(url, str) or not url.strip():
                continue
            url = url.strip()
            source_names.append(url)
            content_parts.append({
                "type": "text",
                "text": f"\n\nSOURCE LINK: {url}\n{fetch_link(url)}"
            })

        if not content_parts:
            return {"error": "No readable files or links were provided."}

        task = f"""
Analyse these study materials as a private academic tutor.

Return:
# Synapse Summary
A concise synthesis of all uploaded/linked materials.

## Core Argument
The central argument or purpose.

## Key Ideas
Important concepts, definitions, and claims.

## Connections
How the ideas connect across sources.

## Tutor Explanation
Explain the material like a supportive professor.

## Critical Thinking
Questions and possible critiques.

## Brainstorm Map
List 6-8 short node labels for a visual brainstorm map.

Use markdown. Be clear, structured, and academically useful.
Sources: {', '.join(source_names)}
"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [{"type": "text", "text": task}] + content_parts}
        ]

        stored_summary = generate_chat(
            messages,
            model=ANALYSIS_MODEL,
            temperature=0.35,
            max_tokens=6000
        )
        stored_sections = parse_sections(stored_summary)
        stored_connections = generate_connections(stored_sections)
        stored_brainstorm = generate_brainstorm(stored_summary)

        return {
            "summary": stored_summary,
            "sections": stored_sections,
            "connections": stored_connections,
            "brainstorm": stored_brainstorm
        }

    except Exception as error:
        return {"error": str(error)}


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    return await analyze_materials(files=[file], links="[]")


def generate_connections(sections):
    if len(sections) < 2:
        return []

    overview = "\n".join([
        f"{title}: {content[:500]}"
        for title, content in list(sections.items())[:8]
    ])

    prompt = f"""
Return only valid JSON with 4-6 conceptual connections:
{{"connections":[{{"from":"...","to":"...","label":"...","description":"..."}}]}}
Sections:\n{overview}
"""

    raw = generate_chat([
        {"role": "system", "content": "Return only valid JSON. No markdown."},
        {"role": "user", "content": prompt}
    ], model=CHAT_MODEL, temperature=0.2, max_tokens=1200)

    try:
        return json.loads(raw).get("connections", [])
    except Exception:
        return []


def generate_brainstorm(summary):
    prompt = f"""
Return only valid JSON for a brainstorm map:
{{"center":"Main Topic","nodes":["node 1","node 2","node 3","node 4","node 5","node 6"]}}
Summary:\n{summary[:5000]}
"""

    raw = generate_chat([
        {"role": "system", "content": "Return only valid JSON. No markdown."},
        {"role": "user", "content": prompt}
    ], model=CHAT_MODEL, temperature=0.25, max_tokens=700)

    try:
        parsed = json.loads(raw)
        if not isinstance(parsed.get("nodes"), list):
            raise ValueError("Invalid brainstorm JSON")
        return parsed
    except Exception:
        return {"center": "Core Ideas", "nodes": list(stored_sections.keys())[:6]}


@app.post("/ask")
async def ask_question(data: dict):
    try:
        question = data.get("question", "")
        selected_section = data.get("selected_section", "")
        chat_history = data.get("chat_history", [])
        section_context = stored_sections.get(selected_section, "")

        context = f"""
Current study context:
Selected section: {selected_section if selected_section else 'Full document'}
Section content: {section_context[:3000]}
Full summary: {stored_summary[:7000]}
"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context},
            {"role": "assistant", "content": "I will tutor the student using this material."}
        ]

        for message in chat_history[-8:]:
            role = message.get("role", "user")
            if role not in {"user", "assistant", "system"}:
                role = "user"
            messages.append({"role": role, "content": message.get("content", "")})

        messages.append({"role": "user", "content": question})

        answer = generate_chat(
            messages,
            model=CHAT_MODEL,
            temperature=0.6,
            max_tokens=1600
        )
        return {"answer": answer}

    except Exception as error:
        return {"error": str(error)}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "analysis_model": ANALYSIS_MODEL,
        "chat_model": CHAT_MODEL,
        "api_key_loaded": bool(os.getenv("OPENAI_API_KEY"))
    }


def parse_sections(summary: str):
    sections = {}
    current_heading = "Overview"
    current_content = []

    for line in summary.split("\n"):
        if line.startswith("## "):
            if current_content:
                sections[current_heading] = "\n".join(current_content).strip()
            current_heading = line.replace("## ", "", 1).strip()
            current_content = []
        else:
            current_content.append(line)

    if current_content:
        sections[current_heading] = "\n".join(current_content).strip()

    return {key: value for key, value in sections.items() if value.strip()}
