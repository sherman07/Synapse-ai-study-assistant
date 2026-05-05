import base64
import hashlib
import json
import mimetypes
import ssl
import os
import re
import tempfile
import time
import urllib.request
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pypdf import PdfReader


try:
    import certifi
except Exception:
    certifi = None

try:
    from bs4 import BeautifulSoup
except Exception:
    BeautifulSoup = None

try:
    from docx import Document
except Exception:
    Document = None

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except Exception:
    YouTubeTranscriptApi = None

try:
    import yt_dlp
except Exception:
    yt_dlp = None

try:
    import cv2
except Exception:
    cv2 = None

try:
    import fitz  # PyMuPDF: used to render PDF pages as visual evidence
except Exception:
    fitz = None

try:
    from pptx import Presentation
except Exception:
    Presentation = None

import logging
logging.getLogger("pypdf").setLevel(logging.ERROR)

# -------------------------
# Environment + app setup
# -------------------------
BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")
load_dotenv()

OPENAI_API_KEY = (os.getenv("OPENAI_API_KEY") or "").strip()
OPENAI_ORG_ID = (os.getenv("OPENAI_ORG_ID") or "").strip() or None
OPENAI_PROJECT_ID = (os.getenv("OPENAI_PROJECT_ID") or "").strip() or None

client = OpenAI(
    api_key=OPENAI_API_KEY,
    organization=OPENAI_ORG_ID,
    project=OPENAI_PROJECT_ID,
) if OPENAI_API_KEY else None

ANALYSIS_MODEL = os.getenv("OPENAI_ANALYSIS_MODEL", "gpt-4o")
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
TRANSCRIBE_MODEL = os.getenv("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe")
ENABLE_TUTOR_WEB_RESEARCH = os.getenv("ENABLE_TUTOR_WEB_RESEARCH", "true").lower() not in {"0", "false", "no"}
MAX_TUTOR_SEARCH_RESULTS = int(os.getenv("MAX_TUTOR_SEARCH_RESULTS", "4"))
MAX_TUTOR_RESEARCH_CHARS = int(os.getenv("MAX_TUTOR_RESEARCH_CHARS", "9000"))

MAX_AUDIO_BYTES = int(os.getenv("MAX_AUDIO_BYTES", str(24 * 1024 * 1024)))
MAX_VIDEO_BYTES = int(os.getenv("MAX_VIDEO_BYTES", str(60 * 1024 * 1024)))
MAX_SOURCE_CHARS = int(os.getenv("MAX_SOURCE_CHARS", "90000"))
MAX_VIDEO_FRAMES = int(os.getenv("MAX_VIDEO_FRAMES", "8"))
MAX_VISUAL_IMAGES_PER_SOURCE = int(os.getenv("MAX_VISUAL_IMAGES_PER_SOURCE", "10"))
MAX_MULTI_SOURCE_VISUAL_IMAGES = int(os.getenv("MAX_MULTI_SOURCE_VISUAL_IMAGES", "64"))
MULTISOURCE_VISUAL_GALLERY_LIMIT = int(os.getenv("MULTISOURCE_VISUAL_GALLERY_LIMIT", "36"))
MULTISOURCE_SYNTHESIS_PART_TOKENS = int(os.getenv("MULTISOURCE_SYNTHESIS_PART_TOKENS", "6500"))
ENABLE_MULTI_SOURCE_DIGESTS = os.getenv("ENABLE_MULTI_SOURCE_DIGESTS", "true").lower() not in {"0", "false", "no"}
MULTISOURCE_SOURCE_DIGEST_TOKENS = int(os.getenv("MULTISOURCE_SOURCE_DIGEST_TOKENS", "9000"))
MULTISOURCE_SOURCE_CHARS = int(os.getenv("MULTISOURCE_SOURCE_CHARS", "500000"))
ANALYSIS_CACHE_TTL_SECONDS = int(os.getenv("ANALYSIS_CACHE_TTL_SECONDS", str(7 * 24 * 60 * 60)))
CACHE_PATH = BACKEND_DIR / "synapse_analysis_cache.json"
CACHE_VERSION = "source_identity_mindmap_v27_worldclass_multisource_visual_professor"

app = FastAPI(title="Synapse Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "api_key_loaded": bool(OPENAI_API_KEY),
        "api_key_prefix": (OPENAI_API_KEY[:12] + "...") if OPENAI_API_KEY else "",
        "org_id_loaded": bool(OPENAI_ORG_ID),
        "project_id_loaded": bool(OPENAI_PROJECT_ID),
        "analysis_model": ANALYSIS_MODEL,
        "chat_model": CHAT_MODEL,
        "transcribe_model": TRANSCRIBE_MODEL,
        "cache_version": CACHE_VERSION,
        "tutor_web_research_enabled": ENABLE_TUTOR_WEB_RESEARCH,
        "multi_source_digests_enabled": ENABLE_MULTI_SOURCE_DIGESTS,
        "max_visual_images_per_source": MAX_VISUAL_IMAGES_PER_SOURCE,
        "max_multi_source_visual_images": MAX_MULTI_SOURCE_VISUAL_IMAGES,
        "multi_source_visual_gallery_limit": MULTISOURCE_VISUAL_GALLERY_LIMIT,
        "multi_source_synthesis_part_tokens": MULTISOURCE_SYNTHESIS_PART_TOKENS,
    }


@app.get("/health/openai")
def health_openai():
    try:
        require_openai()
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": "Reply with OK only."}],
            temperature=0,
            max_tokens=5,
        )
        return {
            "status": "ok",
            "model": CHAT_MODEL,
            "reply": (response.choices[0].message.content or "").strip(),
            "org_id_loaded": bool(OPENAI_ORG_ID),
            "project_id_loaded": bool(OPENAI_PROJECT_ID),
        }
    except Exception as error:
        return {
            "status": "error",
            "message": str(error),
            "hint": "Check OPENAI_API_KEY, OPENAI_ORG_ID, OPENAI_PROJECT_ID, billing, project access, and model access.",
        }

stored_summary = ""
stored_sections: Dict[str, str] = {}
stored_connections: List[dict] = []
stored_mind_map: dict = {}
stored_title = "Generated Study Notes"
stored_source_identity = ""

# -------------------------
# Core prompts
# -------------------------
SYSTEM_PROMPT = """
You are Synapse, a source-faithful academic tutor.

Brand rule: Synapse is a product name. Never translate Synapse into another language, including Chinese. Do not write 突触, 突觸, synapse-as-a-body-part, or any translated version when referring to the product name.

You must reconstruct what the provided material ACTUALLY contains.
You are not allowed to guess a different document, lesson, law, or topic.

Strict source identity rules:
- First identify the source from explicit evidence only: title, heading, URL metadata, file name, visible text, transcript, or extracted content.
- If the source is a webpage and metadata says a specific title, use that exact title.
- If the source is a New Zealand legislation page, never substitute a different Act just because the year or act number looks familiar.
- If the source identity is uncertain, say it is uncertain. Do not hallucinate.
- If the same source appears again, keep the same identity and overall interpretation.

Teaching rules:
- Be clear, concrete, detailed, and faithful to the source.
- Do not produce a minimal answer when the source contains rich detail.
- For multi-source uploads, your main task is synthesis: identify shared ideas, recurring theories, repeated evidence, differences, and how the sources build one larger learning picture.
- For lecture slides and PDFs, explicitly explain important visuals, diagrams, tables, slide images, page/slide titles, and image-text relationships when they are provided.
- For laws, policies, reports, articles, slides, videos, and textbook material, preserve the actual structure and important subpoints.
- For maths or technical material, explain formulas, definitions, worked steps, and likely mistakes.
- If material is inaccessible or partial, say exactly what is missing.
- Use the source's main language unless the user requested otherwise.
"""

ANALYSIS_PROMPT = """
Analyse the material as a private university tutor and return markdown using this high-detail study-guide style.

Your output must feel like a careful professor-style learning guide, not a minimal AI summary. The best output should help a student understand, revise, and connect the material without needing to re-open every file.

Base structure for one source:

# Overview
Identify the exact source/topic and explain what the material is trying to teach. Include the learning focus, the main problem/question, and why the topic matters.

## Core Argument
Explain the central purpose, logic, or learning objective in depth. Use substantial explanation when needed. Include the source's actual scope, key mechanism, and why it matters.

## Key Ideas
Create a detailed concept-by-concept explanation. For each major idea:
- name the concept clearly
- define it in student-friendly language
- connect it to the actual source wording, page/slide title, section, example, formula, image, diagram, or table when available
- explain why it matters

## Step-by-step Breakdown
Reconstruct the source in a logical learning order. This must be detailed enough for a student who has not read the source.
For lecture slides: follow the lecture flow and explain why each section comes next.
For laws/documents: break down the legal structure by part, subpart, section, definition, exception, duty, consequence, and transition rule when present.
For maths/problems: show every calculation step, why each formula is used, what each line means, and how to check the result.
For videos/transcripts: reconstruct the teaching sequence, including corrections, repeated calculations, or unclear moments.

## Visual / Diagram-Based Explanation
If slides, PDFs, screenshots, figures, tables, or diagrams are provided, explain them directly.
For each important visual/table/diagram:
- identify the page/slide/source if visible
- describe what the visual shows
- explain what concept it is teaching
- connect it to the surrounding text
- explain what a student should notice
If no visual information is available, say that the extracted material did not provide usable visuals.

## Worked Example / Evidence From Source
Use actual examples, studies, page/slide references, section numbers, calculations, table values, scenarios, or evidence from the uploaded/source material whenever available.
If the source contains both source examples and external examples, include both under clear subheadings.
If the source contains no explicit worked example, create a clearly labelled external real-world example that applies the source concept, and explain the connection step by step.

## Tutor Explanation
Teach it like a strong tutor. Explain the difficult parts slowly, including why the rule/formula/process works, how the ideas connect, and how to remember them. Use analogies only when they help accuracy.

## Common Mistakes
List realistic mistakes a learner could make. For each mistake:
- explain the wrong assumption
- explain the correct understanding
- show how to avoid it
Use source-specific mistakes, not generic filler.

## Critical Thinking
Provide conceptual, application, comparison, and verification questions. Add brief guidance on what a strong answer should consider.

Quality rules:
- Do not invent a different source.
- If source evidence is insufficient, say exactly what is missing, but still explain what can be reliably learned from the available evidence.
- Follow the requested output language for the ENTIRE response, including headings, explanations, examples, mistakes, questions, tables, and visual explanation.
- Never translate the brand/product name Synapse. Use Synapse exactly.
- If Simplified Chinese is requested, write the whole response in Simplified Chinese, while keeping short key English academic terms in brackets only when useful.
- If Traditional Chinese is requested, write the whole response in Traditional Chinese, while keeping short key English terms in brackets only when useful.
- Use concrete source details whenever available.
- Do not replace the actual source with a generic textbook topic.
- Prefer detailed teaching over polished vagueness.
- For complex or multi-source uploads, do not compress important ideas just to be short.
"""



REFERENCE_STYLE_PROFILE = """
Reference-style target for high-quality multi-source notes:
- Write like a detailed university tutor preparing lecture revision notes, not like a generic summary.
- The output should feel like the user paid for a complete study pack: detailed, organized, source-faithful, and useful for exam revision.
- Imitate the supplied reference style at the STRUCTURAL level: title + framing idea, lecture blocks, concept definitions, comparison tables, study/case breakdowns, visual explanations, and final revision focus.
- Do not imitate by using generic filler. The value must come from the uploaded sources.
- For each lecture/source, use a deep teaching pattern: what the source is about -> what problem/question it answers -> key concepts -> examples/studies/cases/calculations -> visual/table explanation -> what students often misunderstand -> how it connects to the wider course.
- When a study/case/experiment appears, explain it using: research question, method/procedure, result/finding, interpretation, limitation, exam use.
- When a formula/calculation appears, reconstruct the teaching sequence: given information, formula, substitution, working, answer, verification, common error.
- When a law/policy source appears, reconstruct the legal logic: purpose, definitions, sections/parts, duties/powers, exceptions, tests, consequences, practical example.
- When a design/art/literature/history source appears, explain context, formal features, evidence/examples, interpretation, tensions, and assessment use.
- Use structured comparison tables whenever the source compares theories, methods, groups, technologies, experiments, cases, time periods, artists, or concepts.
- Explain visuals as teaching devices: what the picture/table/diagram is showing, why it is placed there, and what the student should learn from it.
- For multiple resources, first preserve detailed source-by-source learning, then build a course-level synthesis: shared concepts, repeated tensions, methodological patterns, cross-source evidence, differences, and revision priorities.
- Maintain the selected output language throughout. Keep short English academic terms in brackets when useful.
- The final answer should be long enough that a student can revise from it without reopening every file.
- For multi-source packs, do not end with only a learning scaffold. Actually write the detailed common ideas, evidence matrix, visual explanations, and high-scoring answer frameworks.
- Avoid shallow headings like “important” without substance. Every paragraph must teach something specific.
"""

MULTISOURCE_REFERENCE_STRUCTURE = """
For multi-source uploads, imitate this learning-note architecture. This is a DEEP professor-style pack, not a summary:

# 🧠 Integrated Study Guide: specific course/topic title
A short framing paragraph explaining the whole source pack and the larger learning problem it helps solve.

## 1. Course-Level Big Picture
Explain the central question of the uploaded set, the main subject area, and how the sources fit together.

## 2. Source-by-Source Guided Notes
For EACH source, create a rich lecture/source card:
- Source title and learning focus
- Lecture/source outline in order
- Key concepts with definitions and plain-language explanation
- Important named researchers/studies/cases/examples/calculations
- Method/result/meaning where research or worked examples are discussed
- Important visuals/diagrams/tables and what they teach
- What the student should remember from this source
- How this source connects to the rest of the set

## 3. Common Ideas Across Sources
Do not be generic. Identify recurring conceptual threads that actually appear across the files.
For each shared idea:
- explain the idea clearly
- identify which sources support it
- compare how each source treats it
- explain why it matters for the course

## 4. Cross-Source Connections
Explain how the lectures/sources build on each other. Use progressions such as biological mechanism -> behaviour -> cognition -> social context -> measurement -> application, or the equivalent for the subject.

## 5. Differences, Tensions, and Debates
Show where sources disagree or emphasise different sides, such as nature vs nurture, mechanism vs application, theory vs evidence, qualitative vs quantitative change, biological vs social explanation, structure vs function, source text vs external example.

## 6. Visual and Diagram-Based Explanation
Explain key diagrams/images/tables from the uploaded slides/pages. Use page or slide markers when visible. If screenshots/visual evidence are limited, explain the extracted visual/textual cues instead.

## 7. Cross-Source Evidence Table
Use markdown tables. Include columns such as Theme, Sources, Evidence/Example, What it proves, Exam/Application use.

## 8. Deep Revision Guide
Give likely exam questions, what a strong answer should include, and common traps. Include “how to compare sources” prompts.

## 9. Memory Hooks / Learning Strategy
Provide compact memory aids, concept clusters, and revision priorities.
"""


# -------------------------
# Adaptive learning-depth system
# -------------------------
# The goal is learning clarity, not saving tokens for its own sake.
# Short/simple inputs receive focused notes so the result is easier to read.
# Long/complex sources still receive detailed or comprehensive notes.
DEPTH_CONFIG = {
    "focused": {
        "label": "Focused",
        "max_output_tokens": int(os.getenv("FOCUSED_MAX_OUTPUT_TOKENS", "1800")),
        "source_chars": int(os.getenv("FOCUSED_SOURCE_CHARS", "9000")),
        "mindmap_branches": 4,
        "mindmap_points": 3,
        "instruction": (
            "Create a focused, easy-to-understand study note. Do not pad the answer. "
            "Cover the actual idea, the essential steps, one useful example if needed, and common mistakes. "
            "This is concise because the source is simple or short, not because detail is being sacrificed."
        ),
        "sections": ["Overview", "Key Ideas", "Step-by-step Breakdown", "Worked Example / Evidence From Source", "Common Mistakes"],
    },
    "standard": {
        "label": "Standard",
        "max_output_tokens": int(os.getenv("STANDARD_MAX_OUTPUT_TOKENS", "4200")),
        "source_chars": int(os.getenv("STANDARD_SOURCE_CHARS", "24000")),
        "mindmap_branches": 5,
        "mindmap_points": 4,
        "instruction": (
            "Create clear study notes with moderate detail. Explain the key concepts, source structure, examples, "
            "step-by-step logic, and likely misunderstandings. Avoid unnecessary expansion, but include all important source-supported points."
        ),
        "sections": ["Overview", "Core Argument", "Key Ideas", "Step-by-step Breakdown", "Worked Example / Evidence From Source", "Tutor Explanation", "Common Mistakes", "Critical Thinking"],
    },
    "detailed": {
        "label": "Detailed",
        "max_output_tokens": int(os.getenv("DETAILED_MAX_OUTPUT_TOKENS", "8000")),
        "source_chars": int(os.getenv("DETAILED_SOURCE_CHARS", "65000")),
        "mindmap_branches": 6,
        "mindmap_points": 5,
        "instruction": (
            "Create a detailed source-faithful study guide. Preserve important subpoints, examples, definitions, formulas, evidence, "
            "and reasoning. Explain not only what the source says, but how a student should understand and apply it."
        ),
        "sections": ["Overview", "Core Argument", "Key Ideas", "Step-by-step Breakdown", "Worked Example / Evidence From Source", "External Real-World Example", "Tutor Explanation", "Common Mistakes", "Critical Thinking"],
    },
    "comprehensive": {
        "label": "Comprehensive",
        "max_output_tokens": int(os.getenv("COMPREHENSIVE_MAX_OUTPUT_TOKENS", "20000")),
        "source_chars": int(os.getenv("COMPREHENSIVE_SOURCE_CHARS", "500000")),
        "mindmap_branches": 7,
        "mindmap_points": 7,
        "instruction": (
            "Create a comprehensive high-detail study guide. Use this only when the source is long, dense, technical, legal, academic, "
            "or multi-section. Cover structure, definitions, exceptions, procedures, implications, examples, verification checks, and learning strategy."
        ),
        "sections": ["Overview", "Core Argument", "Detailed Content Breakdown", "Definitions and Key Terms", "Step-by-step Breakdown", "Evidence From Source", "External Real-World Example", "Tutor Explanation", "Common Mistakes", "Critical Thinking", "Revision Checklist"],
    },
}

DEPTH_ALIASES = {
    "auto": "auto",
    "brief": "focused",
    "short": "focused",
    "focused": "focused",
    "standard": "standard",
    "normal": "standard",
    "detailed": "detailed",
    "detail": "detailed",
    "deep": "comprehensive",
    "comprehensive": "comprehensive",
}


def normalise_detail_level(detail_level: str) -> str:
    key = (detail_level or "auto").strip().lower().replace("-", "_").replace(" ", "_")
    return DEPTH_ALIASES.get(key, "auto")


def estimate_learning_depth(source_text: str, source_units: Optional[List[dict]] = None) -> dict:
    """Estimate how much detail helps learning. This is not a pure token-saving rule."""
    text = source_text or ""
    lower = text.lower()
    char_count = len(text)
    word_count = len(re.findall(r"\w+", text))
    section_markers = len(re.findall(r"\b(part|subpart|section|clause|chapter|article|schedule|definition|rule|regulation)\b|\n\s*\d+[.)]", lower, re.I))
    formula_markers = len(re.findall(r"\\frac|\\sqrt|\\langle|\b(sqrt|sin|cos|tan|derivative|integral|matrix|vector|curvature)\b|[=^√]", text, re.I))
    legal_markers = len(re.findall(r"\b(act|law|section|liability|partner|partnership|duty|shall|must|offence|rights|obligation|regulation|legislation|court)\b", lower))
    academic_markers = len(re.findall(r"\b(theory|evidence|methodology|analysis|argument|concept|framework|case study|source|artist|historical)\b", lower))
    table_like = len(re.findall(r"\|.*\||\t|\btable\b|\bfigure\b", text, re.I))
    source_count = len(source_units or [])

    score = 0
    if char_count >= 1200:
        score += 1
    if char_count >= 7000:
        score += 1
    if char_count >= 22000:
        score += 1
    if char_count >= 55000:
        score += 1
    if section_markers >= 4:
        score += 1
    if section_markers >= 12:
        score += 1
    if formula_markers >= 3:
        score += 1
    if legal_markers >= 8 or academic_markers >= 8:
        score += 1
    if table_like >= 2:
        score += 1
    if source_count >= 2:
        score += 2
    if source_count >= 4:
        score += 2

    if char_count < 900 and score <= 1:
        depth = "focused"
    elif score <= 2:
        depth = "standard"
    elif score <= 5:
        depth = "detailed"
    else:
        depth = "comprehensive"

    if (legal_markers >= 12 or section_markers >= 10) and depth in {"focused", "standard"}:
        depth = "detailed"
    if source_count >= 2:
        # Multi-source analysis is the core product feature. For this mode, quality and
        # cross-source synthesis are prioritised over token saving.
        depth = "comprehensive"
    if char_count >= 45000 and (legal_markers >= 15 or section_markers >= 15):
        depth = "comprehensive"

    reason_bits = []
    if char_count < 900:
        reason_bits.append("short source")
    if char_count >= 7000:
        reason_bits.append("long source")
    if char_count >= 22000:
        reason_bits.append("very long source")
    if section_markers >= 4:
        reason_bits.append("structured sections")
    if formula_markers >= 3:
        reason_bits.append("mathematical or technical notation")
    if legal_markers >= 8:
        reason_bits.append("legal concepts")
    if academic_markers >= 8:
        reason_bits.append("academic analysis")
    if table_like >= 2:
        reason_bits.append("table or figure content")
    if source_count >= 2:
        reason_bits.append("multiple sources requiring cross-source synthesis")
    if source_count >= 4:
        reason_bits.append("large source set")

    return {
        "depth": depth,
        "char_count": char_count,
        "word_count": word_count,
        "score": score,
        "section_markers": section_markers,
        "formula_markers": formula_markers,
        "legal_markers": legal_markers,
        "academic_markers": academic_markers,
        "source_count": source_count,
        "reason": ", ".join(reason_bits) if reason_bits else "general study material",
        "auto_selected": True,
    }


def choose_learning_depth(source_text: str, source_units: List[dict], requested_detail_level: str = "auto") -> dict:
    """
    Automatically choose the clearest learning depth.

    The user should not manually choose output length. The system decides depth
    from the source complexity so simple sources stay readable and dense sources
    remain detailed. The `requested_detail_level` argument is intentionally
    ignored except for metadata/backwards compatibility.
    """
    estimate = estimate_learning_depth(source_text, source_units)
    estimate["override"] = False
    estimate["requested_detail_level"] = "auto"
    estimate["ignored_user_detail_level"] = requested_detail_level or "auto"
    estimate["config"] = DEPTH_CONFIG[estimate["depth"]]
    return estimate


def limit_text_parts_for_depth(content_parts: List[dict], max_chars: int) -> List[dict]:
    """Balanced source limiting for multi-file analysis.

    The previous version spent the whole source budget from the beginning of the
    combined text. With multiple files that can silently exclude later files,
    making the model unable to find common ideas across sources. This version
    gives every text source a fair base allocation first, then uses remaining
    budget for extra detail.
    """
    text_indices: List[int] = []
    text_values: List[str] = []
    for idx, part in enumerate(content_parts or []):
        if isinstance(part, dict) and part.get("type") == "text":
            text_indices.append(idx)
            text_values.append(part.get("text") or "")

    if not text_values:
        return list(content_parts or [])

    max_chars = max(1200, int(max_chars or MAX_SOURCE_CHARS))
    n = len(text_values)

    # Guarantee each uploaded/linked source has a visible sample. This is the key
    # to cross-source comparison quality.
    base_each = min(22000, max(6000, max_chars // max(n * 2, 1)))
    selected = [""] * n
    used = 0

    for i, text in enumerate(text_values):
        take = min(len(text), base_each, max_chars - used)
        if take <= 0:
            break
        selected[i] = text[:take]
        used += take

    # Distribute remaining capacity round-robin so no single long file dominates.
    cursor = [len(x) for x in selected]
    while used < max_chars:
        progressed = False
        for i, text in enumerate(text_values):
            if used >= max_chars:
                break
            if cursor[i] >= len(text):
                continue
            chunk = min(3500, len(text) - cursor[i], max_chars - used)
            selected[i] += text[cursor[i]:cursor[i] + chunk]
            cursor[i] += chunk
            used += chunk
            progressed = True
        if not progressed:
            break

    output: List[dict] = []
    text_counter = 0
    for part in content_parts or []:
        if not isinstance(part, dict) or part.get("type") != "text":
            output.append(part)
            continue
        limited_text = selected[text_counter]
        original_len = len(text_values[text_counter])
        text_counter += 1
        if original_len > len(limited_text):
            limited_text += f"\n\n[System note: this source was truncated from {original_len} to {len(limited_text)} characters for model context. Other sources were also preserved for comparison.]"
        output.append({**part, "text": limited_text})
    return output



def cap_image_parts(parts: List[dict], max_images: int) -> List[dict]:
    """Keep text parts but cap image_url parts for very large multi-file uploads."""
    output: List[dict] = []
    image_count = 0
    skip_next_visual_label = False
    for part in parts or []:
        if isinstance(part, dict) and part.get("type") == "image_url":
            if image_count < max_images:
                output.append(part)
                image_count += 1
            else:
                skip_next_visual_label = False
            continue
        output.append(part)
    return output

def build_multisource_instruction(source_units: List[dict], preferred_language: str) -> str:
    """Prompt block that turns multiple uploads into a true comparative analysis."""
    if len(source_units or []) < 2:
        return ""

    source_list = []
    for i, unit in enumerate(source_units, start=1):
        source_list.append(f"Source {i}: {unit.get('display_name')} | title/topic: {unit.get('title_candidate')}")

    return f"""
MULTI-SOURCE PROFESSOR SYNTHESIS MODE IS ACTIVE.
The user provided {len(source_units)} sources. This is the core product feature. Quality is more important than token saving in this mode.

Sources provided:
{chr(10).join(source_list)}

Reference style to imitate:
{REFERENCE_STYLE_PROFILE}

Required architecture:
{MULTISOURCE_REFERENCE_STRUCTURE}

Non-negotiable quality requirements:
- Do NOT produce a short overview. Produce a full professor-style learning guide.
- Do NOT write generic sentences such as “these sources discuss psychology”. Name exact concepts, named researchers, studies, methods, evidence, examples, and visuals.
- Each uploaded file/source must appear in the Source-by-Source Guided Notes section unless it has no readable content.
- For lecture slides, explain the lecture flow: why the lecture starts with the opening question, how the examples build the concept, and what students should take from each section.
- For studies/experiments, use the mini-format: Question → Method → Result → Meaning.
- For comparisons, use markdown tables.
- For visuals, describe what is visible and explain its teaching purpose.
- For cross-source synthesis, identify shared ideas, not just shared topics.
- Keep the whole answer in the selected output language.
- Keep Synapse as Synapse. Never translate the brand.
"""

def model_for_depth(depth: str) -> str:
    if depth == "focused":
        return os.getenv("OPENAI_FOCUSED_MODEL", os.getenv("OPENAI_BRIEF_MODEL", ANALYSIS_MODEL))
    if depth == "standard":
        return os.getenv("OPENAI_STANDARD_MODEL", ANALYSIS_MODEL)
    if depth == "detailed":
        return os.getenv("OPENAI_DETAILED_MODEL", ANALYSIS_MODEL)
    return os.getenv("OPENAI_COMPREHENSIVE_MODEL", os.getenv("OPENAI_DEEP_MODEL", ANALYSIS_MODEL))

# -------------------------
# Small helpers
# -------------------------
def has_openai() -> bool:
    return bool(OPENAI_API_KEY and client is not None)


def require_openai() -> None:
    if not has_openai():
        raise RuntimeError(
            "OPENAI_API_KEY is missing. Create backend/.env and add OPENAI_API_KEY=your_key_here, then restart uvicorn."
        )


def sha256_text(value: str) -> str:
    return hashlib.sha256((value or "").encode("utf-8", errors="ignore")).hexdigest()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data or b"").hexdigest()


def normalise_space(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def truncate_text(text: str, limit: int = MAX_SOURCE_CHARS) -> str:
    text = text or ""
    return text[:limit].strip()


def clean_html(raw: str) -> str:
    raw = re.sub(r"<script[\s\S]*?</script>", " ", raw, flags=re.I)
    raw = re.sub(r"<style[\s\S]*?</style>", " ", raw, flags=re.I)
    raw = re.sub(r"<[^>]+>", " ", raw)
    return normalise_space(raw)


def remove_urls_from_text(text: str) -> str:
    text = re.sub(r"https?://[^\s<>()]+", " ", text or "")
    return normalise_space(text)


def image_part_from_bytes(data: bytes, content_type: str = "image/jpeg"):
    encoded = base64.b64encode(data).decode("utf-8")
    return {
        "type": "image_url",
        "image_url": {"url": f"data:{content_type};base64,{encoded}"},
    }


def extract_pdf(data: bytes) -> str:
    """Extract PDF text with page markers so the model can cite/explain page-level flow."""
    reader = PdfReader(BytesIO(data), strict=False)
    pages = []
    for page_index, page in enumerate(reader.pages, start=1):
        page_text = page.extract_text() or ""
        page_text = page_text.strip()
        if page_text:
            pages.append(f"[PDF PAGE {page_index}]\n{page_text}")
    extracted = "\n\n".join(pages).strip()
    if len(extracted) < 300:
        extracted += "\n\n[System note: Very little text was extractable. This PDF may be scanned, image-based, or partially corrupted.]"
    return extracted


def render_pdf_visual_parts(data: bytes, source_name: str, max_pages: Optional[int] = None) -> List[dict]:
    """Render selected PDF pages as images for visual/diagram-based explanation.

    This lets the model see slide/page layout, diagrams, tables, and images that
    plain PDF text extraction misses. It is intentionally capped to avoid sending
    every page from very large PDFs.
    """
    if fitz is None:
        return []
    max_pages = int(max_pages or MAX_VISUAL_IMAGES_PER_SOURCE)
    if max_pages <= 0:
        return []
    parts: List[dict] = []
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        total = len(doc)
        if total <= 0:
            return []
        selected = []
        # Prefer title/outline pages and early teaching pages. If the document is
        # long, add one middle page so the visual sample is not only the cover.
        for p in [0, 1, 2, 3]:
            if 0 <= p < total and p not in selected:
                selected.append(p)
        if total > 8 and len(selected) < max_pages:
            mid = total // 2
            if mid not in selected:
                selected.append(mid)
        selected = selected[:max_pages]
        for p in selected:
            page = doc.load_page(p)
            pix = page.get_pixmap(matrix=fitz.Matrix(1.2, 1.2), alpha=False)
            img_bytes = pix.tobytes("jpeg")
            parts.append({"type": "text", "text": f"\n\nVISUAL EVIDENCE FROM {source_name} — PDF page {p + 1}. Explain any visible diagrams, tables, images, or slide layout if relevant."})
            parts.append(image_part_from_bytes(img_bytes, "image/jpeg"))
        doc.close()
    except Exception:
        return []
    return parts


def extract_pptx(data: bytes, source_name: str = "presentation") -> Tuple[str, List[dict]]:
    """Extract slide text and embedded images from PPTX.

    python-pptx cannot render the whole slide like PowerPoint, but it can recover
    slide text and important embedded images. The prompt then asks the model to
    explain image-text relationships.
    """
    if Presentation is None:
        return "PPTX support is not installed. Run: pip install python-pptx", []
    prs = Presentation(BytesIO(data))
    slide_texts: List[str] = []
    visual_parts: List[dict] = []
    visual_count = 0
    for slide_index, slide in enumerate(prs.slides, start=1):
        lines: List[str] = []
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text and shape.text.strip():
                lines.append(shape.text.strip())
            if visual_count < MAX_VISUAL_IMAGES_PER_SOURCE and hasattr(shape, "image"):
                try:
                    blob = shape.image.blob
                    content_type = shape.image.content_type or "image/png"
                    visual_count += 1
                    visual_parts.append({"type": "text", "text": f"\n\nVISUAL EVIDENCE FROM {source_name} — PPT slide {slide_index}. Explain how this image supports the slide text if relevant."})
                    visual_parts.append(image_part_from_bytes(blob, content_type))
                except Exception:
                    pass
        if lines:
            slide_texts.append(f"[PPT SLIDE {slide_index}]\n" + "\n".join(lines))
    return "\n\n".join(slide_texts).strip(), visual_parts


def source_unit_visual_parts(unit: dict, max_images: Optional[int] = None) -> List[dict]:
    """Return a safe subset of multimodal visual evidence parts for one source.

    Source cards should be allowed to *see* diagrams/slides/images. The earlier
    versions only gave the source-card model text excerpts, so slide-heavy
    sources collapsed into “readable text was limited”. This helper keeps the
    image_url parts paired with their preceding text labels.
    """
    raw_parts = unit.get("visual_parts") or []
    if not raw_parts:
        return []
    limit = int(max_images or MAX_VISUAL_IMAGES_PER_SOURCE)
    selected: List[dict] = []
    image_count = 0
    pending_label = None
    for part in raw_parts:
        if not isinstance(part, dict):
            continue
        if part.get("type") == "text":
            pending_label = part
            continue
        if part.get("type") == "image_url":
            if image_count >= limit:
                break
            if pending_label:
                selected.append(pending_label)
                pending_label = None
            selected.append(part)
            image_count += 1
    return selected


def build_visual_gallery(source_units: List[dict]) -> List[dict]:
    """Build a front-end visual evidence gallery from uploaded PDFs/PPTs/images.

    This does not replace the notes. It gives the user actual source visuals
    beside the professor explanation, closer to the reference product style.
    """
    gallery: List[dict] = []
    max_items = MULTISOURCE_VISUAL_GALLERY_LIMIT
    for source_index, unit in enumerate(source_units or [], start=1):
        title = unit.get("title_candidate") or unit.get("display_name") or f"Source {source_index}"
        label = ""
        for part in unit.get("visual_parts") or []:
            if not isinstance(part, dict):
                continue
            if part.get("type") == "text":
                label = normalise_space(part.get("text") or "")
            elif part.get("type") == "image_url":
                image_url = (part.get("image_url") or {}).get("url")
                if image_url:
                    gallery.append({
                        "source_index": source_index,
                        "source_title": title,
                        "caption": label[:220] if label else f"Visual evidence from Source {source_index}",
                        "url": image_url,
                    })
                    if len(gallery) >= max_items:
                        return gallery
    return gallery

def extract_docx(data: bytes) -> str:
    if Document is None:
        return "DOCX support is not installed. Run: pip install python-docx"
    document = Document(BytesIO(data))
    paragraphs = [p.text.strip() for p in document.paragraphs if p.text and p.text.strip()]
    return "\n".join(paragraphs).strip()


def extract_text_file(data: bytes) -> str:
    return data.decode("utf-8", errors="ignore").strip()


def generate_chat(messages: List[dict], model: str = CHAT_MODEL, temperature: float = 0, max_tokens: int = 4500) -> str:
    require_openai()
    try:
        response = client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=messages,
        )
    except Exception:
        fallback_model = "gpt-4o-mini"
        if model != fallback_model:
            response = client.chat.completions.create(
                model=fallback_model,
                temperature=temperature,
                max_tokens=max_tokens,
                messages=messages,
            )
        else:
            raise
    return response.choices[0].message.content or ""


def content_text_length(content_parts: List[dict]) -> int:
    total = 0
    for part in content_parts or []:
        if isinstance(part, dict) and part.get("type") == "text":
            total += len(part.get("text") or "")
    return total


def source_unit_text_excerpt(unit: dict, limit: int = 42000) -> str:
    return (unit.get("text_excerpt") or "")[:limit]


def source_card_min_units(unit: dict) -> int:
    """Minimum richness expected for a multi-source source card.

    This is intentionally higher than single-source notes because multi-source
    analysis is the core product feature. The threshold scales gently with
    available extracted text, but it avoids punishing short handouts.
    """
    text_len = len(unit.get("text_excerpt") or "")
    if text_len >= 60000:
        return int(os.getenv("MULTISOURCE_LONG_CARD_MIN_UNITS", "2600"))
    if text_len >= 20000:
        return int(os.getenv("MULTISOURCE_MEDIUM_CARD_MIN_UNITS", "1900"))
    if text_len >= 5000:
        return int(os.getenv("MULTISOURCE_SHORT_CARD_MIN_UNITS", "1300"))
    return int(os.getenv("MULTISOURCE_TINY_CARD_MIN_UNITS", "850"))


def generate_individual_source_digest(index: int, unit: dict, language_rule: str) -> str:
    """Create a deep professor-style lecture/source card before final synthesis.

    This stage must be detailed. The final cross-source synthesis depends on it,
    so this function is designed to preserve concrete source evidence rather
    than compressing the source into a generic summary.
    """
    excerpt_limit = int(os.getenv("MULTISOURCE_SOURCE_CARD_CHARS", "120000"))
    excerpt = source_unit_text_excerpt(unit, limit=excerpt_limit)
    title = unit.get('title_candidate') or unit.get('display_name') or f"Source {index}"
    min_units = source_card_min_units(unit)

    if not excerpt or len(excerpt) < 120:
        return f"### Source {index}: {title}\nReadable text was limited. Use filename/title and any visual evidence available."

    prompt = f"""
Create a DEEP professor-style source card for Source {index}. This card will be inserted into the final multi-source study guide, so it must be detailed enough for a student to revise this source without reopening the original file.

Language requirement: {language_rule}
Never translate the product name Synapse.

Reference style to imitate structurally:
{REFERENCE_STYLE_PROFILE}

Source identity:
- Display name: {unit.get('display_name')}
- Title/topic: {title}
- Extracted text length: {len(excerpt)} characters

Return markdown using this exact architecture. Localise headings into the selected language, but keep the structure and depth:

### Source {index}: specific readable lecture/source title

#### Opening frame / central question
Write a strong opening that identifies the main question/problem this source teaches. If the source has a quote, objective, outline, or title, use it to frame the explanation.

#### Source structure / lecture flow
Walk through the source in order. Use the actual outline, headings, slide sequence, sections, cases, formulas, diagrams, or examples. Do not skip subtopics that appear in the excerpt.

#### Key concepts and definitions
Create detailed concept notes. For each concept:
- define it accurately
- explain it in simple language
- show how it appears in the source
- explain why it matters
Use a table if there are multiple related concepts.

#### Important studies / examples / cases / calculations
Use this mini-format whenever relevant:
- **Question:** what the study/example/case/calculation asks
- **Method / process:** what was done or how it works
- **Result / answer:** what happened or what the source concludes
- **Meaning:** what it demonstrates conceptually
- **Exam use:** how a student could use it in an answer

#### Visual / diagram / table explanation
Explain visible diagrams, tables, formulas, slide images, or visual cues. Do not only say “there is a diagram”; explain what it teaches and how it supports the concept.

#### Connections to other possible sources
Explain how this source could connect to other course materials, theories, applications, methods, or debates.

#### Common misunderstandings
Name realistic student mistakes and correct them. Make them source-specific.

#### Exam / revision use
Give revision priorities, likely question types, and what a strong answer should include.

Depth rules:
- Be concrete, source-faithful, and detailed. Do not collapse this into five generic bullets.
- Preserve named researchers, studies, terms, values, tasks, examples, formulas, legal sections, cases, artists, theories, and slide/page flow when present.
- If the source is a psychology lecture, write like lecture notes from a strong tutor: theory -> evidence -> method -> result -> significance -> exam angle.
- If the source is mathematical/technical, show the full logic and verification, not just the formula.
- If the source is legal/formal, preserve definitions, section logic, duties, exceptions, consequences, and examples.
- If the source is art/design/literature/history, preserve context, formal features, evidence, interpretation, and assessment use.
- Use markdown tables when comparing concepts.
- Minimum expected richness for this source card: {min_units} readable units. If the source is long, be substantially longer.

Source excerpt:
{truncate_text(excerpt, excerpt_limit)}
"""
    try:
        visual_parts = source_unit_visual_parts(unit, MAX_VISUAL_IMAGES_PER_SOURCE)
        user_content = [{"type": "text", "text": prompt}] + visual_parts if visual_parts else prompt
        digest = generate_chat([
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ], model=model_for_depth("comprehensive"), temperature=0, max_tokens=MULTISOURCE_SOURCE_DIGEST_TOKENS).strip()
        if digest and not is_refusal_or_useless_response(digest) and count_readable_units(digest) >= min_units:
            return digest

        repair_prompt = prompt + f"""

The previous source card was too short, too generic, or not usable. Rewrite it with MUCH MORE source-specific teaching detail.
Important repair requirements:
- Keep the same output language.
- Expand the source structure / lecture flow.
- Add more named concepts, studies, cases, formulas, examples, visual explanations, and exam-use notes from the source excerpt.
- Do not refuse.
- Do not apologise.
- Minimum readable units: {min_units}.
"""
        repair_content = [{"type": "text", "text": repair_prompt}] + visual_parts if visual_parts else repair_prompt
        repaired = generate_chat([
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": repair_content},
        ], model=model_for_depth("comprehensive"), temperature=0, max_tokens=MULTISOURCE_SOURCE_DIGEST_TOKENS).strip()
        if repaired and not is_refusal_or_useless_response(repaired) and count_readable_units(repaired) >= max(850, int(min_units * 0.75)):
            return repaired
        raise RuntimeError("source card was too short")
    except Exception as error:
        # Last-resort fallback should still preserve more evidence than a tiny error box.
        safe_excerpt = truncate_text(excerpt, int(os.getenv("MULTISOURCE_FALLBACK_EXCERPT_CHARS", "9000")))
        return f"### Source {index}: {title}\n\n#### Learning focus\nThis source could not be fully expanded by the model, so Synapse preserves a large readable evidence excerpt for review.\n\n#### Readable source evidence\n{safe_excerpt}\n\n#### Revision use\nUse this source evidence when comparing the uploaded materials. Identify definitions, examples, diagrams, tasks, and repeated concepts before building cross-source links."

def generate_source_digests_for_multisource(source_units: List[dict], language_rule: str) -> str:
    if not ENABLE_MULTI_SOURCE_DIGESTS or len(source_units or []) < 2:
        return ""
    digests = []
    for index, unit in enumerate(source_units, start=1):
        digests.append(generate_individual_source_digest(index, unit, language_rule))
    return "\n\n".join(digests).strip()



def is_weak_multisource_response(text: str, source_count: int) -> bool:
    """Reject shallow multi-source outputs before they pollute cache/history."""
    if source_count < 2:
        return False
    value = text or ""
    lowered = value.lower()
    cjk_count = len(re.findall(r"[\u4e00-\u9fff]", value))
    word_count = len(re.findall(r"\w+", value))
    effective_length = cjk_count + word_count
    required_markers = [
        "source-by-source", "common ideas", "connections", "evidence table", "exam",
        "逐项", "来源", "共同", "连接", "差异", "表", "考试", "复习", "证据",
        "來源", "共同點", "連接", "差異", "證據",
    ]
    marker_count = sum(1 for marker in required_markers if marker in lowered or marker in value)
    # The threshold is intentionally high because multi-file analysis is the main product feature.
    if effective_length < int(os.getenv("MULTISOURCE_MIN_EFFECTIVE_LENGTH", "5200")):
        return True
    if marker_count < 4:
        return True
    return False


def assemble_reference_style_multisource_output(source_digest_block: str, synthesis: str, preferred_language: str) -> str:
    """Preserve detailed per-source cards instead of letting the final model compress them.

    The competing product's strength is that it keeps detailed lecture-by-lecture
    notes and then adds synthesis. This helper guarantees that structure.
    """
    if not source_digest_block:
        return synthesis
    key = normalise_language_key(preferred_language)
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        title = "# 🧠 综合学习指南"
        source_heading = "## 1. 逐项资源精讲"
        synthesis_heading = "## 2. 跨资源综合分析"
        note = "以下内容先保留每份资源的详细讲解，再进行共同主题、差异、连接关系、图文证据和复习重点的综合。"
    elif key == "traditional_chinese":
        title = "# 🧠 綜合學習指南"
        source_heading = "## 1. 逐項資源精講"
        synthesis_heading = "## 2. 跨資源綜合分析"
        note = "以下內容先保留每份資源的詳細講解，再進行共同主題、差異、連接關係、圖文證據和複習重點的綜合。"
    else:
        title = "# 🧠 Integrated Study Guide"
        source_heading = "## 1. Source-by-Source Guided Notes"
        synthesis_heading = "## 2. Cross-Source Professor Synthesis"
        note = "The guide first preserves detailed notes for each source, then synthesises shared ideas, differences, connections, visual evidence, and revision priorities."

    clean_synthesis = synthesis.strip()
    # Avoid two competing top-level titles from the model.
    clean_synthesis = re.sub(r"(?m)^#\s+Integrated Study Guide\s*$", "", clean_synthesis).strip()
    clean_synthesis = re.sub(r"(?m)^#\s*🧠\s*Integrated Study Guide[:：]?.*$", "", clean_synthesis).strip()
    clean_synthesis = re.sub(r"(?m)^#\s*🧠\s*综合学习指南[:：]?.*$", "", clean_synthesis).strip()
    clean_synthesis = re.sub(r"(?m)^#\s*综合学习指南[:：]?.*$", "", clean_synthesis).strip()

    return f"{title}\n\n{note}\n\n{source_heading}\n\n{source_digest_block.strip()}\n\n{synthesis_heading}\n\n{clean_synthesis}"



def count_readable_units(text: str) -> int:
    """Approximate content richness without being tied to one language or heading style."""
    text = text or ""
    cjk = len(re.findall(r"[\u4e00-\u9fff]", text))
    words = len(re.findall(r"\b[\w'-]+\b", text))
    headings = len(re.findall(r"(?m)^#{1,4}\s+", text))
    bullets = len(re.findall(r"(?m)^\s*[-*•]\s+|^\s*\d+[.)]\s+", text))
    tables = text.count("|---") + text.count("| ---")
    return cjk + words + headings * 25 + bullets * 8 + tables * 80


def is_usable_multisource_text(text: str, source_count: int) -> bool:
    """Quality gate for multi-source outputs across languages and subjects."""
    if source_count < 2:
        return bool(text and not is_refusal_or_useless_response(text))
    if not text or is_refusal_or_useless_response(text):
        return False
    units = count_readable_units(text)
    has_table = "|" in text and ("---" in text or text.count("|") >= 12)
    has_many_sections = len(re.findall(r"(?m)^#{1,4}\s+", text or "")) >= 4
    has_source_mentions = len(re.findall(r"\bSource\s*\d+\b|来源\s*\d+|資源\s*\d+|第\s*\d+\s*(份|个|個)", text or "", flags=re.I)) >= min(2, source_count)
    has_synthesis_terms = bool(re.search(r"common|connection|difference|synthesis|evidence|exam|theme|shared|共同|连接|連接|差异|差異|综合|綜合|证据|證據|考试|考試|复习|複習", text or "", flags=re.I))
    return units >= int(os.getenv("MULTISOURCE_SYNTHESIS_MIN_UNITS", "3600")) and (has_many_sections or has_table) and (has_source_mentions or has_synthesis_terms)


def fallback_multisource_synthesis_from_digests(source_digest_block: str, source_units: List[dict], preferred_language: str) -> str:
    """Deterministic safety net so multi-source uploads never collapse into an error."""
    key = normalise_language_key(preferred_language)
    titles = []
    for i, unit in enumerate(source_units or [], start=1):
        titles.append(unit.get("title_candidate") or unit.get("display_name") or f"Source {i}")

    if key in {"simplified_chinese", "mixed_chinese_english"}:
        title = "## 跨资源综合分析"
        intro = "Synapse 已保留每份资源的详细讲解，并生成以下跨资源学习框架。你可以从上方逐项资源精讲中复习具体内容，再用下方框架建立共同主题和差异。"
        source_list_heading = "### 资源范围"
        common_heading = "### 共同 idea 的寻找方式"
        connection_heading = "### 如何建立跨资源连接"
        table_heading = "### 跨资源复习表"
        exam_heading = "### 复习与考试使用方式"
        rows = ["| 复习任务 | 你应该做什么 |", "|---|---|",
                "| 找共同点 | 比较每份资源反复出现的核心概念、方法、理论争论或案例。 |",
                "| 找差异 | 注意不同资源是否从不同层次解释同一问题，例如生物、行为、社会、历史、法律或技术层次。 |",
                "| 找证据 | 把每份资源中的例子、研究、数据、图表或步骤放到共同主题下面。 |",
                "| 准备考试 | 用“概念定义 → 来源证据 → 比较 → 应用”的结构回答。 |"]
    elif key == "traditional_chinese":
        title = "## 跨資源綜合分析"
        intro = "模型綜合部分未能穩定生成，因此 Synapse 保留了每份資源的詳細講解，並自動生成以下跨資源學習框架。你仍然可以從上方逐項資源精講中複習具體內容。"
        source_list_heading = "### 資源範圍"
        common_heading = "### 共同 idea 的尋找方式"
        connection_heading = "### 如何建立跨資源連接"
        table_heading = "### 跨資源複習表"
        exam_heading = "### 複習與考試使用方式"
        rows = ["| 複習任務 | 你應該做什麼 |", "|---|---|",
                "| 找共同點 | 比較每份資源反覆出現的核心概念、方法、理論爭論或案例。 |",
                "| 找差異 | 注意不同資源是否從不同層次解釋同一問題，例如生物、行為、社會、歷史、法律或技術層次。 |",
                "| 找證據 | 把每份資源中的例子、研究、數據、圖表或步驟放到共同主題下面。 |",
                "| 準備考試 | 用「概念定義 → 來源證據 → 比較 → 應用」的結構回答。 |"]
    else:
        title = "## Cross-Source Professor Synthesis"
        intro = "Synapse preserved the detailed source cards and generated this cross-source learning scaffold. Use the source-by-source notes above for specific content, then use this section to build shared themes and differences."
        source_list_heading = "### Source scope"
        common_heading = "### How to identify shared ideas"
        connection_heading = "### How to build cross-source connections"
        table_heading = "### Cross-source revision table"
        exam_heading = "### Exam and revision use"
        rows = ["| Revision task | What to do |", "|---|---|",
                "| Find common ideas | Compare repeated concepts, methods, debates, cases, or mechanisms across sources. |",
                "| Find differences | Notice whether each source explains the topic at a different level, such as biological, behavioural, social, historical, legal, or technical. |",
                "| Find evidence | Place each study, example, table, diagram, calculation, or section under a shared theme. |",
                "| Prepare for exams | Answer using the structure: concept definition → source evidence → comparison → application. |"]

    source_lines = "\n".join(f"- Source {i}: {t}" for i, t in enumerate(titles, start=1))
    return f"{title}\n\n{intro}\n\n{source_list_heading}\n{source_lines}\n\n{common_heading}\n- Look for repeated terms, repeated theories, repeated methods, and repeated examples.\n- Treat differences as learning value, not as a problem: different files often explain the same larger topic from different angles.\n\n{connection_heading}\n- Start from the most basic mechanism or definition.\n- Then connect it to examples, applications, debates, and evidence across the other sources.\n- Finish by explaining what the whole source set teaches that one file alone would not show.\n\n{table_heading}\n" + "\n".join(rows) + f"\n\n{exam_heading}\n- Build revision answers that explicitly name at least two sources.\n- Use specific examples from the source cards above rather than generic wording.\n- When a question asks for evaluation, include both shared ideas and tensions between sources."


def generate_multisource_synthesis_section(
    heading: str,
    instruction: str,
    source_digest_block: str,
    source_units: List[dict],
    preferred_language: str,
) -> str:
    """Generate one deep synthesis section at a time.

    v17 asked the model to create the entire cross-source professor synthesis in
    one huge call. When the source pack was large, the model often returned a
    safe but useless scaffold. v18 generates independent, concrete sections and
    then assembles them, which is more stable and much more detailed.
    """
    language_rule = language_instruction_for(preferred_language)
    source_list = "\n".join(
        f"Source {i}: {u.get('title_candidate') or u.get('display_name')}"
        for i, u in enumerate(source_units or [], start=1)
    )
    prompt = f"""
You are writing ONE section of a world-class multi-source study guide.

Language requirement: {language_rule}
Never translate the product name Synapse.

Section to write: {heading}

Sources in this pack:
{source_list}

Your task:
{instruction}

Non-negotiable quality rules:
- Be concrete. Name exact concepts, researchers, studies, cases, formulas, tables, diagrams, images, examples, page/slide cues, and source numbers when available.
- Do not write generic scaffold instructions such as “look for repeated terms”. Actually perform the comparison using the source cards.
- Write like a professor/tutor explaining the material to a student who wants to revise deeply.
- Use markdown tables when they improve clarity.
- Include enough detail that this section is useful on its own.
- For visual material, explain what the image/table/diagram shows, what the student should notice, and how it supports the concept.
- For every cross-source claim, mention which source(s) support it.
- If the source pack is psychology, use research-question → method → result → meaning → exam-use where appropriate. For other subjects, use the equivalent discipline-specific reasoning.

Detailed source cards:
{truncate_text(source_digest_block, int(os.getenv('MULTISOURCE_DIGEST_CONTEXT_CHARS', '220000')))}
"""
    try:
        result = generate_chat([
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ], model=model_for_depth("comprehensive"), temperature=0, max_tokens=MULTISOURCE_SYNTHESIS_PART_TOKENS).strip()
        if result and not is_refusal_or_useless_response(result) and count_readable_units(result) >= int(os.getenv("MULTISOURCE_SECTION_MIN_UNITS", "900")):
            # Remove duplicate heading if the model already wrote it with a different level.
            result = re.sub(r"(?m)^#{1,4}\s*" + re.escape(heading).strip("# ") + r"\s*$", "", result).strip()
            return f"## {heading.strip('# ')}\n\n{result}"
    except Exception:
        pass
    return "".strip()


def generate_multisource_synthesis_from_digests(source_digest_block: str, source_units: List[dict], preferred_language: str, depth_plan: dict) -> str:
    """Generate a deep, all-subject cross-source synthesis from source cards.

    This is intentionally multi-pass. The product requirement is depth, not low
    token usage. Each section is generated separately so the model cannot escape
    with a generic scaffold.
    """
    key = normalise_language_key(preferred_language)
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        sections = [
            ("课程级大图景", "说明这组资料共同在教什么。不要只说主题名称，要解释它们如何从基础机制、理论争论、研究方法、证据、应用或考试要求共同组成一个学习单元。"),
            ("逐项来源之间的共同 idea", "找出至少 5 个真正重复或互相支持的共同 idea。每个 idea 都要解释含义、出现在哪些 source、每个 source 如何处理它、为什么重要。"),
            ("概念群组与知识地图", "把资料整理成 4–7 个 concept clusters。每个 cluster 要包含核心概念、对应来源、内部关系、容易混淆点。"),
            ("研究、案例、实验与证据对照", "用表格和解释整理所有重要研究/案例/实验/计算/法律条文/图像证据。每项都要写 Question/Method/Result/Meaning/Exam use 或该学科等价结构。"),
            ("图像、幻灯片、表格与 diagram 讲解", "集中解释 source cards 中出现的视觉材料：图片、表格、流程图、坐标图、实验图、slide layout。说明图上有什么、为什么放在这里、学生应该从图中学到什么。"),
            ("差异、张力与争论", "比较来源之间的不同强调：理论 vs 证据、机制 vs 行为、天性 vs 教养、方法差异、层次差异、限制与批判。不要编造冲突，要解释 nuance。"),
            ("如何写出高分答案", "给出可直接用于考试/作业的答题模板。包括定义型、比较型、评价型、应用型、图表解释型问题。每个模板都要说明应该引用哪些 source evidence。"),
            ("深度复习清单与记忆策略", "生成详细复习优先级、易错点、记忆 hook、考前检查问题。必须具体到这组资料的概念和研究。"),
        ]
    elif key == "traditional_chinese":
        sections = [
            ("課程級大圖景", "說明這組資料共同在教什麼。不要只說主題名稱，要解釋它們如何共同組成一個學習單元。"),
            ("逐項來源之間的共同 idea", "找出至少 5 個真正重複或互相支持的共同 idea。每個 idea 都要解釋含義、出現在哪些 source、每個 source 如何處理它、為什麼重要。"),
            ("概念群組與知識地圖", "把資料整理成 4–7 個 concept clusters。每個 cluster 要包含核心概念、對應來源、內部關係、容易混淆點。"),
            ("研究、案例、實驗與證據對照", "用表格和解釋整理所有重要研究/案例/實驗/計算/法律條文/圖像證據。"),
            ("圖像、投影片、表格與 diagram 講解", "集中解釋 source cards 中出現的視覺材料：圖片、表格、流程圖、座標圖、實驗圖、slide layout。"),
            ("差異、張力與爭論", "比較來源之間的不同強調、限制與批判。不要編造衝突，要解釋 nuance。"),
            ("如何寫出高分答案", "給出可直接用於考試/作業的答題模板，並說明應引用哪些 source evidence。"),
            ("深度複習清單與記憶策略", "生成詳細複習優先級、易錯點、記憶 hook、考前檢查問題。"),
        ]
    else:
        sections = [
            ("Course-Level Big Picture", "Explain what this source pack teaches as a whole. Go beyond topic naming: show how the sources combine mechanisms, theories, methods, evidence, applications, visuals, and exam priorities into one learning unit."),
            ("Common Ideas Across Sources", "Identify at least five real shared ideas. For each: define it, name the sources that support it, compare how each source treats it, and explain why it matters."),
            ("Concept Clusters / Knowledge Map", "Organise the materials into 4–7 concept clusters. Each cluster needs core concepts, supporting sources, internal relationships, and likely confusion points."),
            ("Studies, Cases, Experiments, and Evidence Matrix", "Use tables and explanation to organise important studies/cases/experiments/calculations/legal clauses/visual evidence. Use Question/Method/Result/Meaning/Exam use or the equivalent structure for the subject."),
            ("Visual, Slide, Table, and Diagram Explanation", "Explain visual material from the source cards: images, tables, process diagrams, graphs, experimental figures, slide layouts. State what is visible, why it is included, and what the student should learn from it."),
            ("Differences, Tensions, and Debates", "Compare differences in emphasis: theory vs evidence, mechanism vs behaviour, nature vs nurture, methodological differences, levels of analysis, limitations, and critiques. Explain nuance; do not invent conflict."),
            ("How to Write High-Scoring Answers", "Give exam/assignment answer frameworks: define/explain, compare/contrast, evaluate, apply-to-example, and visual/table interpretation. Say which source evidence to use."),
            ("Deep Revision Checklist and Memory Strategy", "Create detailed revision priorities, traps, memory hooks, and pre-exam checking questions specific to this source pack."),
        ]

    generated_sections = []
    for heading, instruction in sections:
        part = generate_multisource_synthesis_section(heading, instruction, source_digest_block, source_units, preferred_language)
        if part:
            generated_sections.append(part)

    result = "\n\n".join(generated_sections).strip()
    if result and count_readable_units(result) >= int(os.getenv("MULTISOURCE_SYNTHESIS_MIN_UNITS", "5200")):
        return result

    # Last resort: do not return a generic scaffold. Preserve concrete cards and add a warning.
    warning = "## Cross-Source Synthesis Notice\n\nThe model could not complete every synthesis section, so Synapse preserved the detailed source cards above. Use them as the primary study notes and regenerate with a stronger model or higher token limits for a fuller cross-source synthesis."
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        warning = "## 跨资源综合提示\n\n模型没有稳定完成每一个综合部分，因此 Synapse 已保留上方逐项资源精讲。请优先使用这些 source cards 复习；如果需要更完整的跨资源综合，请使用更强模型或更高 token 上限重新生成。"
    elif key == "traditional_chinese":
        warning = "## 跨資源綜合提示\n\n模型沒有穩定完成每一個綜合部分，因此 Synapse 已保留上方逐項資源精講。請優先使用這些 source cards 複習；若需要更完整的跨資源綜合，請使用更強模型或更高 token 上限重新生成。"
    return (result + "\n\n" + warning).strip() if result else warning


def generate_reference_style_multisource_notes(source_units: List[dict], preferred_language: str, depth_plan: dict) -> str:
    """Robust two-stage multi-source guide for all subjects.

    Stage 1: detailed card for each source.
    Stage 2: cross-source synthesis from cards.
    This avoids one huge generation call collapsing into a refusal/basic summary.
    """
    language_rule = language_instruction_for(preferred_language)
    source_digest_block = generate_source_digests_for_multisource(source_units, language_rule)
    if not source_digest_block or count_readable_units(source_digest_block) < 600:
        cards = []
        for idx, unit in enumerate(source_units or [], start=1):
            title = unit.get("title_candidate") or unit.get("display_name") or f"Source {idx}"
            excerpt = truncate_text(unit.get("text_excerpt") or "", 7000)
            cards.append(f"### Source {idx}: {title}\n\n#### Learning focus\n{excerpt if excerpt else 'Readable text was limited for this source.'}")
        source_digest_block = "\n\n".join(cards)
    synthesis = generate_multisource_synthesis_from_digests(source_digest_block, source_units, preferred_language, depth_plan)
    return assemble_reference_style_multisource_output(source_digest_block, synthesis, preferred_language)

def is_refusal_or_useless_response(text: str) -> bool:
    value = normalise_space(text or "").lower()
    if not value:
        return True

    refusal_patterns = [
        "i can’t assist", "i can't assist", "i cannot assist", "i’m sorry", "i'm sorry",
        "cannot help with that", "can't help with that", "unable to assist",
        "抱歉，我无法", "抱歉，无法", "我无法协助", "无法协助处理", "不能协助",
        "對不起，我無法", "無法協助", "申し訳ありません", "도와드릴 수 없습니다",
    ]
    if any(pattern in value for pattern in refusal_patterns):
        return True

    # A high-quality study guide should contain multiple required sections.
    required_markers = ["overview", "core", "key", "step", "example", "tutor", "mistake", "critical",
                        "概述", "核心", "关键", "關鍵", "分步", "步驟", "实例", "例子", "教师", "導師", "常见", "常見", "批判"]
    marker_count = sum(1 for marker in required_markers if marker.lower() in value)
    if len(value) < 450 and marker_count < 3:
        return True

    return False


def build_refusal_repair_messages(original_messages: List[dict], language_rule: str, title_hint: str, source_units: List[dict]) -> List[dict]:
    identity_lines = []
    for index, unit in enumerate(source_units, start=1):
        identity_lines.append(
            f"Source {index}: display_name={unit.get('display_name')} | stable_identity={unit.get('source_identity')} | title_candidate={unit.get('title_candidate')}"
        )

    repair_prompt = f"""
The previous attempt produced a refusal or an unusably short answer. Retry as an educational study-note generator.

This is allowed content: the user is asking for academic study notes about material they provided. You are not giving professional legal, medical, financial, or safety instructions. For legal/policy material, explain the text for study purposes only and include a short note that this is not legal advice if appropriate.

Mandatory output language: {language_rule}
Never translate the product name Synapse.

Most likely source title/topic from explicit evidence: {title_hint}
Stable source identity list:
{chr(10).join(identity_lines)}

Output a detailed study guide using EXACTLY these headings, translated/localised into the selected language where appropriate:
# Overview
## Core Argument
## Key Ideas
## Step-by-step Breakdown
## Worked Example / Evidence From Source
## Tutor Explanation
## Common Mistakes
## Critical Thinking

Quality requirements:
- Do not refuse.
- Do not write “I cannot assist”.
- Do not output a one-sentence answer.
- Be source-faithful and detailed.
- Use the actual source title, sections, definitions, formulas, examples, and calculations where visible.
- If some source content is missing, explain what is available and what is missing, but still produce useful study notes from the readable evidence.
"""
    repaired = list(original_messages)
    repaired.insert(1, {"role": "user", "content": repair_prompt})
    return repaired


def generate_study_notes_with_quality_guard(
    messages: List[dict],
    preferred_language: str,
    title_hint: str,
    source_units: List[dict],
    content_parts: List[dict],
    depth_plan: Optional[dict] = None,
) -> str:
    if content_text_length(content_parts) < 80:
        raise RuntimeError("The source was not readable enough to generate notes. Check the URL/file extraction or paste the text directly.")

    language_rule = language_instruction_for(preferred_language)
    depth_plan = depth_plan or {"depth": "detailed", "config": DEPTH_CONFIG["detailed"]}
    depth = depth_plan.get("depth", "detailed")
    config = depth_plan.get("config", DEPTH_CONFIG.get(depth, DEPTH_CONFIG["detailed"]))
    analysis_model = model_for_depth(depth)
    first = generate_chat(messages, model=analysis_model, temperature=0, max_tokens=int(config.get("max_output_tokens", 8000)))
    if not is_refusal_or_useless_response(first) and not is_weak_multisource_response(first, len(source_units or [])):
        return first

    retry_messages = build_refusal_repair_messages(messages, language_rule, title_hint, source_units)
    if len(source_units or []) >= 2:
        retry_messages.insert(1, {"role": "user", "content": f"""
The previous multi-source answer was too shallow. Regenerate as a full professor-style multi-source learning guide.

Use this style target:
{REFERENCE_STYLE_PROFILE}

Use this structure:
{MULTISOURCE_REFERENCE_STRUCTURE}

Important: include source-by-source detail, named studies/examples, visual explanations, common ideas across sources, cross-source evidence table, and exam/revision focus. Do not shorten for token saving.
"""})
    second = generate_chat(retry_messages, model=analysis_model, temperature=0, max_tokens=int(config.get("max_output_tokens", 8000)))
    if not is_refusal_or_useless_response(second) and not is_weak_multisource_response(second, len(source_units or [])):
        return second

    # Do not silently save a refusal into cache/history. Surface a clear error.
    raise RuntimeError(
        "The model returned a refusal or unusably short response twice. Try a less restrictive model, confirm the source text is readable, or paste the text directly."
    )


# -------------------------
# URL / source identity helpers
# -------------------------
def canonicalize_url(url: str) -> Tuple[str, str]:
    parsed = urlparse((url or "").strip())
    scheme = parsed.scheme or "https"
    netloc = parsed.netloc.lower()
    path = re.sub(r"/+", "/", parsed.path or "/")

    query_pairs = parse_qs(parsed.query, keep_blank_values=False)
    drop_keys = {
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "fbclid", "gclid", "active_tab", "spm", "igshid"
    }
    filtered_query = []
    for key in sorted(query_pairs):
        if key.lower() in drop_keys:
            continue
        for value in query_pairs[key]:
            filtered_query.append((key, value))
    query = urlencode(filtered_query)

    canonical = urlunparse((scheme, netloc, path.rstrip("/") or "/", "", query, ""))

    identity = canonical
    if netloc.endswith("legislation.govt.nz"):
        match = re.search(r"/act/public/(\d{4})/(\d+)", path)
        if match:
            identity = f"nzl_act:{match.group(1)}:{match.group(2)}"
    return canonical, identity


def detect_legislation_title(text: str) -> Optional[str]:
    patterns = [
        r"([A-Z][A-Za-z0-9'’(),/&\- ]+ Act \d{4})",
        r"([A-Z][A-Za-z0-9'’(),/&\- ]+ Amendment Act \d{4})",
        r"([A-Z][A-Za-z0-9'’(),/&\- ]+ Order \d{4})",
        r"([A-Z][A-Za-z0-9'’(),/&\- ]+ Regulations \d{4})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text or "")
        if match:
            return normalise_space(match.group(1))
    return None


def detect_course_or_topic_title(text: str) -> Optional[str]:
    patterns = [
        r"\b(FINEARTS\s*\d{3,4}[A-Z]?(?:\s*[-–—:]\s*[^\n.,;:]{1,60})?)",
        r"\b(WTRENG\s*\d{3,4}[A-Z]?(?:\s*[-–—:]\s*[^\n.,;:]{1,60})?)",
        r"\b([A-Z]{2,}\s*\d{3,4}[A-Z]?(?:\s*[-–—:]\s*[^\n.,;:]{1,60})?)",
        r"\b(Pythagorean Theorem)\b",
        r"\b(Cross Product)\b",
        r"\b(Curvature of Vector Function)\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text or "", flags=re.I)
        if match:
            return normalise_space(match.group(1))
    return None


def choose_best_source_title(candidates: List[str]) -> str:
    cleaned = [normalise_space(c) for c in candidates if c and normalise_space(c)]
    cleaned = [c for c in cleaned if len(c) >= 3]
    if not cleaned:
        return "Generated Study Notes"

    for candidate in cleaned:
        law = detect_legislation_title(candidate)
        if law:
            return law
    for candidate in cleaned:
        topic = detect_course_or_topic_title(candidate)
        if topic:
            return topic
    for candidate in cleaned:
        if len(candidate) <= 72:
            return candidate
    return cleaned[0][:72].strip()


def extract_title_candidates_from_html(raw_html: str) -> List[str]:
    results: List[str] = []
    if BeautifulSoup is None:
        title_match = re.search(r"<title>(.*?)</title>", raw_html or "", flags=re.I | re.S)
        if title_match:
            results.append(clean_html(title_match.group(1)))
        h1_match = re.search(r"<h1[^>]*>(.*?)</h1>", raw_html or "", flags=re.I | re.S)
        if h1_match:
            results.append(clean_html(h1_match.group(1)))
        return [r for r in results if r]

    soup = BeautifulSoup(raw_html or "", "html.parser")
    metas = [
        soup.find("meta", attrs={"property": "og:title"}),
        soup.find("meta", attrs={"name": "title"}),
        soup.find("meta", attrs={"name": "dc.title"}),
        soup.find("meta", attrs={"name": "DC.Title"}),
    ]
    for meta in metas:
        if meta and meta.get("content"):
            results.append(normalise_space(meta.get("content")))

    if soup.title and soup.title.string:
        results.append(normalise_space(soup.title.string))

    for tag in soup.find_all(["h1", "h2"], limit=5):
        text = normalise_space(tag.get_text(" ", strip=True))
        if text:
            results.append(text)
    return [r for r in results if r]


def extract_main_html_text(raw_html: str) -> str:
    if BeautifulSoup is None:
        return clean_html(raw_html)

    soup = BeautifulSoup(raw_html or "", "html.parser")

    for tag in soup(["script", "style", "noscript", "svg", "form"]):
        tag.decompose()

    for selector in [
        "nav", "header", "footer", "aside", ".sidebar", ".breadcrumb", ".search", ".toolbar", ".menu", ".related",
    ]:
        for tag in soup.select(selector):
            tag.decompose()

    selectors = [
        "#legislation-content",
        ".legislation-content",
        "main",
        "article",
        "[role='main']",
        "#content",
        ".content",
        ".main-content",
        ".article-content",
        ".entry-content",
    ]

    chunks = []
    for selector in selectors:
        for tag in soup.select(selector):
            text = normalise_space(tag.get_text(" ", strip=True))
            if len(text) > 300:
                chunks.append(text)
        if chunks:
            break

    if not chunks:
        body = soup.body or soup
        body_text = normalise_space(body.get_text(" ", strip=True))
        if body_text:
            chunks.append(body_text)

    seen = set()
    unique_chunks = []
    for chunk in chunks:
        key = chunk[:500]
        if key not in seen:
            seen.add(key)
            unique_chunks.append(chunk)

    text = "\n\n".join(unique_chunks)
    return text.strip()



def urlopen_bytes(request_or_url, timeout: int = 20, max_bytes: Optional[int] = None) -> bytes:
    """Fetch URL bytes with certifi SSL support and a clear fallback.
    This fixes macOS/Python CERTIFICATE_VERIFY_FAILED issues while still trying
    normal certificate verification first.
    """
    contexts = []
    if certifi is not None:
        try:
            contexts.append(ssl.create_default_context(cafile=certifi.where()))
        except Exception:
            pass
    try:
        contexts.append(ssl.create_default_context())
    except Exception:
        pass

    last_error = None
    for context in contexts or [None]:
        try:
            kwargs = {"timeout": timeout}
            if context is not None:
                kwargs["context"] = context
            with urllib.request.urlopen(request_or_url, **kwargs) as response:
                return response.read(max_bytes) if max_bytes else response.read()
        except Exception as error:
            last_error = error

    raise last_error or RuntimeError("Failed to fetch URL")


def fetch_webpage(url: str) -> Tuple[str, dict]:
    canonical_url, base_identity = canonicalize_url(url)
    req = urllib.request.Request(canonical_url, headers={"User-Agent": "Mozilla/5.0"})
    raw_bytes = urlopen_bytes(req, timeout=20, max_bytes=900000)
    raw_html = raw_bytes.decode("utf-8", errors="ignore")

    title_candidates = extract_title_candidates_from_html(raw_html)
    main_text = extract_main_html_text(raw_html)
    combined_title_text = " | ".join(title_candidates)

    detected_title = detect_legislation_title(combined_title_text) or detect_legislation_title(main_text[:5000])
    if not detected_title:
        detected_title = choose_best_source_title(title_candidates)

    source_identity = base_identity
    if base_identity.startswith("nzl_act:") and detected_title and detected_title != "Generated Study Notes":
        source_identity = f"{base_identity}:{detected_title}"

    metadata = {
        "url": canonical_url,
        "source_identity": source_identity,
        "detected_title": detected_title,
        "title_candidates": title_candidates[:6],
        "content_hash": sha256_text(main_text[:40000]),
    }
    return main_text, metadata


def get_youtube_video_id(url: str) -> Optional[str]:
    parsed = urlparse(url)
    host = parsed.netloc.lower()

    if "youtube.com" in host:
        if parsed.path.startswith("/shorts/"):
            return parsed.path.split("/shorts/", 1)[1].split("/", 1)[0]
        if parsed.path.startswith("/embed/"):
            return parsed.path.split("/embed/", 1)[1].split("/", 1)[0]
        return parse_qs(parsed.query).get("v", [None])[0]

    if "youtu.be" in host:
        return parsed.path.strip("/") or None

    return None


def transcript_item_text(item) -> str:
    if isinstance(item, dict):
        return item.get("text", "") or ""
    return getattr(item, "text", "") or ""


def fetch_youtube_caption_transcript(url: str) -> str:
    video_id = get_youtube_video_id(url)
    if not video_id or YouTubeTranscriptApi is None:
        return ""

    preferred_languages = [
        "zh-Hans", "zh-CN", "zh", "zh-Hant", "zh-TW",
        "en", "en-US", "en-GB",
    ]

    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript = None
        for finder in (
            lambda: transcript_list.find_transcript(preferred_languages),
            lambda: transcript_list.find_generated_transcript(preferred_languages),
        ):
            try:
                transcript = finder()
                break
            except Exception:
                pass
        if transcript is None:
            transcript = next(iter(transcript_list))
        fetched = transcript.fetch()
        lines = [transcript_item_text(item).strip() for item in fetched]
        return "\n".join(line for line in lines if line)
    except Exception:
        return ""


def transcribe_media_bytes(filename: str, data: bytes) -> str:
    require_openai()
    if not data:
        return "No audio/video data was provided."
    if len(data) > MAX_AUDIO_BYTES:
        size_mb = len(data) / (1024 * 1024)
        limit_mb = MAX_AUDIO_BYTES / (1024 * 1024)
        return (
            f"The audio/video file is too large to transcribe directly ({size_mb:.1f}MB). "
            f"The current limit is about {limit_mb:.0f}MB. Upload a shorter clip or paste the transcript."
        )

    suffix = Path(filename or "audio.webm").suffix or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(data)
        temp_path = temp_file.name
    try:
        with open(temp_path, "rb") as audio_file:
            try:
                result = client.audio.transcriptions.create(
                    model=TRANSCRIBE_MODEL,
                    file=audio_file,
                    prompt="Academic tutorial or lecture. Preserve formulas, numbers, mixed Chinese-English, and correction steps.",
                )
            except Exception:
                audio_file.seek(0)
                result = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    prompt="Academic lecture/tutorial. Preserve formulas and numbers.",
                )
        return getattr(result, "text", str(result)).strip()
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass


def extract_video_frames_from_file(video_path: str, max_frames: int = MAX_VIDEO_FRAMES) -> List[dict]:
    if cv2 is None:
        return []
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    if frame_count <= 0:
        cap.release()
        return []

    if max_frames <= 1:
        indices = [frame_count // 2]
    else:
        start = int(frame_count * 0.1)
        end = int(frame_count * 0.9)
        step = max(1, (end - start) // max(1, max_frames - 1))
        indices = [min(frame_count - 1, start + i * step) for i in range(max_frames)]

    parts = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue
        height, width = frame.shape[:2]
        max_side = 1200
        scale = min(1.0, max_side / max(width, height))
        if scale < 1.0:
            frame = cv2.resize(frame, (int(width * scale), int(height * scale)))
        ok, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
        if ok:
            parts.append(image_part_from_bytes(buffer.tobytes(), "image/jpeg"))
    cap.release()
    return parts


def download_youtube_media(url: str) -> Optional[str]:
    if yt_dlp is None:
        return None
    temp_dir = tempfile.mkdtemp(prefix="synapse_yt_")
    output_template = os.path.join(temp_dir, "%(id)s.%(ext)s")
    ydl_opts = {
        "format": "best[height<=720][ext=mp4]/best[height<=720]/bestvideo[height<=720]+bestaudio/best",
        "outtmpl": output_template,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "max_filesize": MAX_VIDEO_BYTES,
        "merge_output_format": "mp4",
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            downloaded = ydl.prepare_filename(info)
    except Exception:
        return None
    candidates = [downloaded]
    candidates.extend(str(path) for path in Path(temp_dir).glob("*"))
    return next((path for path in candidates if os.path.exists(path) and os.path.getsize(path) > 0), None)


def analyse_youtube_url(url: str) -> Tuple[str, List[dict], dict]:
    transcript = fetch_youtube_caption_transcript(url)
    frame_parts: List[dict] = []
    media_path = None
    if yt_dlp is not None or not transcript:
        media_path = download_youtube_media(url)
    if media_path:
        frame_parts = extract_video_frames_from_file(media_path)
        if len(transcript.strip()) < 500 and has_openai():
            try:
                with open(media_path, "rb") as media_file:
                    media_bytes = media_file.read(MAX_AUDIO_BYTES + 1)
                transcribed = transcribe_media_bytes(os.path.basename(media_path), media_bytes)
                if transcribed and not transcribed.lower().startswith("the audio/video file is too large"):
                    transcript = transcribed
            except Exception:
                pass
    if not transcript:
        transcript = "No readable YouTube transcript could be accessed."
    video_id = get_youtube_video_id(url) or "unknown"
    meta = {
        "url": url,
        "source_identity": f"youtube:{video_id}",
        "detected_title": f"YouTube video {video_id}",
        "content_hash": sha256_text(transcript),
    }
    return transcript, frame_parts, meta


# -------------------------
# Cache helpers
# -------------------------
def load_analysis_cache() -> dict:
    try:
        if CACHE_PATH.exists():
            return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    except Exception:
        pass
    return {}


def save_analysis_cache(cache: dict) -> None:
    try:
        now = time.time()
        cleaned = {
            key: value for key, value in cache.items()
            if now - float(value.get("created_at", now)) <= ANALYSIS_CACHE_TTL_SECONDS
        }
        CACHE_PATH.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass


def cache_get(fingerprint: str):
    if not fingerprint:
        return None
    cache = load_analysis_cache()
    item = cache.get(fingerprint)
    if not item:
        return None
    if time.time() - float(item.get("created_at", 0)) > ANALYSIS_CACHE_TTL_SECONDS:
        cache.pop(fingerprint, None)
        save_analysis_cache(cache)
        return None
    return item.get("result")


def cache_set(fingerprint: str, result: dict) -> None:
    if not fingerprint:
        return
    cache = load_analysis_cache()
    cache[fingerprint] = {"created_at": time.time(), "result": result}
    save_analysis_cache(cache)


# -------------------------
# Parsing / title / mind map helpers
# -------------------------
def parse_sections(summary: str) -> Dict[str, str]:
    """
    Parse both # and ## headings so the first heading can be localised.
    This fixes the old issue where the first navigation item stayed as English "Overview"
    when the selected output language was not English.
    """
    sections: Dict[str, str] = {}
    current_heading = "Overview"
    current_content: List[str] = []
    heading_seen = False

    for raw_line in (summary or "").split("\n"):
        line = raw_line.rstrip()
        heading_match = re.match(r"^#{1,3}\s+(.+?)\s*$", line)

        if heading_match:
            heading = normalise_space(heading_match.group(1))
            heading = heading.strip("# ").strip()
            # Ignore empty headings and accidental markdown titles that are too long.
            if heading and len(heading) <= 90:
                if current_content:
                    sections[current_heading] = "\n".join(current_content).strip()
                elif heading_seen and current_heading not in sections:
                    sections[current_heading] = ""
                current_heading = heading
                current_content = []
                heading_seen = True
                continue

        current_content.append(line)

    if current_content:
        sections[current_heading] = "\n".join(current_content).strip()

    return {key: value for key, value in sections.items() if value.strip()}




_SUBSCRIPT_MAP = str.maketrans({
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "i": "ᵢ", "j": "ⱼ", "k": "ₖ", "m": "ₘ", "n": "ₙ",
})


def readable_subscripts(value: str) -> str:
    """Turn v_1 / v_{m} into v₁ / vₘ for compact mind-map display."""
    if not value:
        return ""

    def repl_braced(match: re.Match) -> str:
        return match.group(1).translate(_SUBSCRIPT_MAP)

    def repl_simple(match: re.Match) -> str:
        return match.group(1).translate(_SUBSCRIPT_MAP)

    value = re.sub(r"_\{([0-9ijkmn]+)\}", repl_braced, value)
    value = re.sub(r"_([0-9ijkmn])\b", repl_simple, value)
    return value


def matrix_latex_to_readable(raw: str) -> str:
    """Convert LaTeX matrices into compact readable forms for mind maps.

    Example:
    \begin{bmatrix} v_1 \\ v_2 \\ v_m \end{bmatrix}
    -> [v₁; v₂; vₘ]
    """
    if not raw:
        return ""

    def convert_body(body: str) -> str:
        body = body.strip()
        body = body.replace(r"\ldots", "…").replace(r"\dots", "…").replace(r"\cdots", "…")
        rows = re.split(r"\\\\|\\cr", body)
        cleaned_rows = []
        for row in rows:
            cells = [readable_subscripts(clean_mindmap_text(cell)) for cell in row.split("&")]
            cells = [cell for cell in cells if cell]
            if cells:
                cleaned_rows.append(", ".join(cells))
        if not cleaned_rows:
            return "[]"
        if len(cleaned_rows) == 1:
            return "[" + cleaned_rows[0] + "]"
        return "[" + "; ".join(cleaned_rows) + "]"

    pattern = re.compile(r"\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\}([\s\S]*?)\\end\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\}")
    return pattern.sub(lambda m: convert_body(m.group(1)), raw)


def plain_matrix_words_to_readable(value: str) -> str:
    """Clean model outputs such as 'bmatrix v_1 v_2 v_m bmatrix'."""
    if not value:
        return ""

    value = re.sub(r"\b(?:begin|end)?\s*bmatrix\b", " ", value, flags=re.I)
    value = re.sub(r"\b(?:begin|end)?\s*pmatrix\b", " ", value, flags=re.I)
    value = re.sub(r"\b(?:begin|end)?\s*matrix\b", " ", value, flags=re.I)
    value = value.replace("\\\\", "; ").replace("&", ", ")
    value = readable_subscripts(value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def clean_mindmap_text(text: str) -> str:
    """Clean markdown / LaTeX-ish text so the visual mind map stays readable."""
    if not text:
        return ""
    value = str(text)
    value = matrix_latex_to_readable(value)

    # Remove markdown wrappers first.
    value = re.sub(r"```[\s\S]*?```", " ", value)
    value = re.sub(r"`([^`]*)`", r"\1", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"\1", value)
    value = re.sub(r"__([^_]+)__", r"\1", value)
    value = re.sub(r"\*([^*]+)\*", r"\1", value)

    # Remove common LaTeX math delimiters.
    value = re.sub(r"\$\$([\s\S]*?)\$\$", r"\1", value)
    value = re.sub(r"\$([^$]+)\$", r"\1", value)
    value = value.replace(r"\(", "").replace(r"\)", "")
    value = value.replace(r"\[", "").replace(r"\]", "")

    # Convert readable LaTeX constructs before stripping slashes.
    value = re.sub(r"\\(?:mathbf|mathrm|mathbb|mathit|textbf|textit)\{([^{}]*)\}", r"\1", value)
    value = re.sub(r"\\sqrt\{([^{}]+)\}", r"√(\1)", value)
    value = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"(\1)/(\2)", value)
    value = re.sub(r"([A-Za-z0-9\)])\^\{([^{}]+)\}", r"\1^\2", value)
    value = re.sub(r"([A-Za-z0-9\)])\^([A-Za-z0-9])", r"\1^\2", value)

    replacements = {
        r"\left": "",
        r"\right": "",
        r"\langle": "<",
        r"\rangle": ">",
        r"\times": "×",
        r"\cdot": "·",
        r"\to": "→",
        r"\le": "≤",
        r"\ge": "≥",
        r"\neq": "≠",
        r"\approx": "≈",
        r"\infty": "∞",
        r"\theta": "θ",
        r"\alpha": "α",
        r"\beta": "β",
        r"\gamma": "γ",
        r"\Delta": "Δ",
        r"\nabla": "∇",
        r"\ldots": "…",
        r"\dots": "…",
        r"\cdots": "…",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)

    # Remove remaining LaTeX command words, but preserve the content around them.
    value = re.sub(r"\\[a-zA-Z]+", "", value)
    value = value.replace("{", "").replace("}", "")
    value = value.replace("\\", "")
    value = plain_matrix_words_to_readable(value)
    value = readable_subscripts(value)

    value = re.sub(r"\s+", " ", value)
    value = value.strip(" -•*\t\n")
    value = value.replace(" **", "").replace("**", "")
    return value.strip()


def short_mindmap_text(text: str, limit: int = 70) -> str:
    value = clean_mindmap_text(text)
    if len(value) <= limit:
        return value
    return value[: limit - 1].rstrip(" ,;:") + "…"


def first_good_sentence(text: str, limit: int = 190) -> str:
    value = clean_mindmap_text(text)
    sentences = re.split(r"(?<=[.!?。！？])\s+", value)
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) >= 12:
            return short_mindmap_text(sentence, limit)
    return short_mindmap_text(value, limit)


def extract_branch_items(section_text: str, max_points: int = 5) -> List[dict]:
    """
    Fallback structured mind-map point extractor.
    Returns point objects instead of raw strings so the frontend can display clean labels + details.
    """
    if not section_text:
        return []

    lines = [line.strip() for line in str(section_text).splitlines() if line.strip()]
    items: List[dict] = []
    current: Optional[dict] = None

    def push_current() -> None:
        nonlocal current
        if not current:
            return
        label = short_mindmap_text(current.get("label") or current.get("detail") or "", 58)
        detail = short_mindmap_text(current.get("detail") or current.get("label") or "", 260)
        if label:
            items.append({
                "id": sha256_text(label + detail)[:10],
                "label": label,
                "detail": detail,
            })
        current = None

    for raw in lines:
        line = clean_mindmap_text(raw)
        if not line or line.startswith("#"):
            continue

        line = re.sub(r"^[\-•*]\s*", "", line).strip()
        numbered = re.match(r"^\d+[.)]\s*(.+)$", line)
        heading_like = line.endswith((":", "：")) and len(line) < 95
        formula_like = any(token in raw for token in ["\\", "=", "^", "_", "sqrt", "frac", "√"])

        if numbered:
            push_current()
            content = numbered.group(1).strip()
            current = {"label": content, "detail": content}
            continue

        if heading_like:
            push_current()
            content = line[:-1].strip()
            current = {"label": content, "detail": content}
            continue

        if current:
            if formula_like or len(line) < 130:
                current["detail"] = (current.get("detail", "") + " " + line).strip()
            else:
                push_current()
                current = {"label": line, "detail": line}
        else:
            current = {"label": line, "detail": line}

        if len(items) >= max_points:
            break

    push_current()

    if not items:
        value = clean_mindmap_text(section_text)
        for sentence in re.split(r"(?<=[.!?。！？])\s+", value):
            sentence = sentence.strip()
            if len(sentence) < 10:
                continue
            items.append({
                "id": sha256_text(sentence)[:10],
                "label": short_mindmap_text(sentence, 58),
                "detail": short_mindmap_text(sentence, 260),
            })
            if len(items) >= max_points:
                break

    return items[:max_points]


def generate_connections_from_sections(sections: Dict[str, str]) -> List[dict]:
    order = [
        ("Overview", "Core Argument", "frames"),
        ("Core Argument", "Key Ideas", "introduces concepts for"),
        ("Key Ideas", "Step-by-step Breakdown", "becomes the process in"),
        ("Step-by-step Breakdown", "Worked Example / Evidence From Source", "is applied in"),
        ("Worked Example / Evidence From Source", "Common Mistakes", "highlights errors checked in"),
        ("Common Mistakes", "Critical Thinking", "prepares the student for"),
    ]
    results = []
    for source, target, label in order:
        if source in sections and target in sections:
            results.append({
                "from": source,
                "to": target,
                "label": label,
                "description": f"{source} naturally leads into {target} in the study flow.",
            })
    if results:
        return results

    keys = list(sections.keys())
    for i in range(min(len(keys) - 1, 5)):
        results.append({
            "from": keys[i],
            "to": keys[i + 1],
            "label": "connects to",
            "description": f"{keys[i]} connects to {keys[i + 1]} in the notes.",
        })
    return results


def generate_mind_map(title: str, sections: Dict[str, str], depth: str = "detailed") -> dict:
    """Rule-based fallback mind map; AI map generator can refine this."""
    preferred_order = [
        "Overview",
        "Core Argument",
        "Key Ideas",
        "Step-by-step Breakdown",
        "Worked Example / Evidence From Source",
        "Common Mistakes",
        "Critical Thinking",
    ]
    ordered_names = [name for name in preferred_order if name in sections]
    ordered_names += [name for name in sections.keys() if name not in ordered_names]

    limits = DEPTH_CONFIG.get(depth, DEPTH_CONFIG["detailed"])
    max_branches = int(limits.get("mindmap_branches", 6))
    max_points = int(limits.get("mindmap_points", 5))

    branches = []
    for section_name in ordered_names[:max_branches]:
        section_text = sections.get(section_name, "")
        label = "Summary" if section_name == "Overview" else section_name
        branches.append({
            "id": sha256_text(section_name)[:10],
            "label": short_mindmap_text(label, 48),
            "section": section_name,
            "summary": first_good_sentence(section_text, 190),
            "points": extract_branch_items(section_text, max_points=max_points),
        })

    center_title = short_mindmap_text(title or "Study Notes", 80) or "Study Notes"
    return {"center": center_title, "branches": branches}


def extract_json_object(text: str) -> Optional[dict]:
    if not text:
        return None
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.I)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        parsed = json.loads(cleaned)
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        pass

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        try:
            parsed = json.loads(match.group(0))
            return parsed if isinstance(parsed, dict) else None
        except Exception:
            return None
    return None


def normalise_ai_mind_map(raw_map: dict, fallback_map: dict, depth: str = "detailed") -> dict:
    if not isinstance(raw_map, dict):
        return fallback_map

    center = short_mindmap_text(raw_map.get("center") or fallback_map.get("center") or "Study Notes", 80)
    raw_branches = raw_map.get("branches") if isinstance(raw_map.get("branches"), list) else []
    fallback_branches = fallback_map.get("branches", []) or []
    fallback_by_section = {b.get("section"): b for b in fallback_branches}

    limits = DEPTH_CONFIG.get(depth, DEPTH_CONFIG["detailed"])
    max_branches = int(limits.get("mindmap_branches", 6))
    max_points = int(limits.get("mindmap_points", 5))

    branches: List[dict] = []
    for index, branch in enumerate(raw_branches[:max_branches]):
        if not isinstance(branch, dict):
            continue
        section = clean_mindmap_text(branch.get("section") or branch.get("label") or "")
        fallback_branch = fallback_by_section.get(section) or (fallback_branches[min(index, len(fallback_branches) - 1)] if fallback_branches else {})
        label = short_mindmap_text(branch.get("label") or fallback_branch.get("label") or section or f"Branch {index + 1}", 48)
        summary = short_mindmap_text(branch.get("summary") or fallback_branch.get("summary") or "", 190)

        raw_points = branch.get("points") if isinstance(branch.get("points"), list) else []
        points: List[dict] = []
        for point in raw_points[:max_points]:
            if isinstance(point, str):
                label_text = point
                detail_text = point
            elif isinstance(point, dict):
                label_text = point.get("label") or point.get("title") or point.get("text") or point.get("detail") or ""
                detail_text = point.get("detail") or point.get("explanation") or point.get("text") or label_text
            else:
                continue
            label_clean = short_mindmap_text(label_text, 58)
            detail_clean = short_mindmap_text(detail_text, 260)
            if label_clean:
                points.append({
                    "id": sha256_text(section + label_clean + detail_clean)[:10],
                    "label": label_clean,
                    "detail": detail_clean or label_clean,
                })
        if not points:
            points = fallback_branch.get("points", [])[:max_points]

        branches.append({
            "id": sha256_text(section or label)[:10],
            "label": label,
            "section": section or fallback_branch.get("section") or label,
            "summary": summary,
            "points": points,
        })

    if not branches:
        return fallback_map
    return {"center": center, "branches": branches}


def generate_ai_mind_map(title: str, sections: Dict[str, str], preferred_language: str = "auto", depth: str = "detailed") -> dict:
    """
    Ask the model to design a visual mind map specifically.
    Falls back to a deterministic rule-based map if the model output is invalid.
    """
    fallback = generate_mind_map(title, sections, depth)
    if not sections:
        return fallback

    compact_sections = []
    for name, content in list(sections.items())[:7]:
        compact_sections.append(f"SECTION: {name}\n{truncate_text(content, 2200)}")

    # Match mind-map size to the selected/adaptive depth.
    # This fixes the yellow underline / runtime NameError for {max_branches} and {max_points}.
    limits = DEPTH_CONFIG.get(depth, DEPTH_CONFIG["detailed"])
    max_branches = int(limits.get("mindmap_branches", 6))
    max_points = int(limits.get("mindmap_points", 5))

    language_instruction = language_instruction_for(preferred_language)

    prompt = f"""
Create a visual mind map JSON for a study app.
{language_instruction}

Important design rules:
- Do NOT copy long paragraphs directly.
- Make the center title readable and specific.
- Use no more than {max_branches} main branches.
- Each branch should have no more than {max_points} short points. Use fewer points if that makes the map clearer.
- Each point needs a short label and a useful detail sentence that contains the key substance, not just a title.
- For math/technical content, DO NOT output Markdown bold, raw LaTeX, or escaped delimiters like \( ... \).
- Convert formulas into readable plain text, for example: r'(t)=<1,2,6t>, √(180)=6√(5), curvature k = |r'×r''| / |r'|^3. For matrices, use compact readable notation like v=[v₁; v₂; …; vₘ] or v+w=[v₁+w₁; v₂+w₂; …; vₘ+wₘ]. Never output bmatrix, pmatrix, begin/end matrix text, or plain sqrt(180).
- Point labels must be human-readable phrase titles in the selected language, not raw formulas. Put formulas in detail only when needed.
- Branch labels, point labels, summaries, and details must follow the selected language.
- Never translate the brand name Synapse. If you need a summary branch, use the selected-language equivalent of Overview/Summary, not a translation of Synapse.
- The map should be simple first, then expandable by clicking points.
- Return JSON only. No markdown.

JSON schema:
{{
  "center": "specific readable topic title",
  "branches": [
    {{
      "label": "short branch title",
      "section": "matching section name from notes",
      "summary": "one sentence branch summary",
      "points": [
        {{"label": "short point", "detail": "more detail shown after clicking"}}
      ]
    }}
  ]
}}

Current note title: {title}

Notes:
{chr(10).join(compact_sections)}
"""
    try:
        raw = generate_chat([
            {"role": "system", "content": "You create accurate, compact, visual study mind maps as strict JSON. Never use markdown bold or raw LaTeX in mind map labels. Never translate the brand name Synapse."},
            {"role": "user", "content": prompt},
        ], model=ANALYSIS_MODEL, temperature=0, max_tokens=3800)
        parsed = extract_json_object(raw)
        return normalise_ai_mind_map(parsed or {}, fallback, depth)
    except Exception:
        return fallback


def make_notes_title(summary: str, source_title_candidates: List[str]) -> str:
    picked = choose_best_source_title(source_title_candidates)
    if picked != "Generated Study Notes":
        return picked

    text = normalise_space(summary)
    for pattern in [
        r"(?:source material|material|document|lesson|video|workshop|case study)\s+(?:is|was|appears to be|focuses on|examines|explores|discusses|covers|teaches|is related to)\s+(?:a|an|the)?\s*([^.;\n]{10,110})",
        r"(?:focuses on|examines|explores|discusses|covers|teaches|demonstrates|shows)\s+(?:how to\s+)?(?:a|an|the)?\s*([^.;\n]{10,110})",
    ]:
        match = re.search(pattern, text, flags=re.I)
        if match:
            return match.group(1).strip()[:72]
    first_sentence = next((part.strip() for part in re.split(r"[.!?。！？]", text) if len(part.strip()) > 8), "")
    return first_sentence[:72] if first_sentence else "Generated Study Notes"


# -------------------------
# Source-unit builders
# -------------------------
def file_to_source_unit(name: str, content_type: str, data: bytes) -> Tuple[List[dict], dict]:
    lower_name = (name or "").lower()
    parts: List[dict] = []
    source_meta = {
        "display_name": name or "uploaded file",
        "source_identity": f"file:{sha256_bytes(data)}",
        "title_candidate": name or "uploaded file",
        "content_hash": sha256_bytes(data),
    }

    if content_type and content_type.startswith("image/"):
        parts.append({
            "type": "text",
            "text": f"\n\nSOURCE FILE: {name}\nThis is an uploaded image. Use the attached image as primary evidence.",
        })
        parts.append(image_part_from_bytes(data, content_type))
        source_meta["text_excerpt"] = f"Uploaded image file: {name}. Visual analysis should use the attached image."
        source_meta["visual_parts"] = [parts[-1]]
        return parts, source_meta

    is_audio_video = (
        (content_type and (content_type.startswith("audio/") or content_type.startswith("video/")))
        or lower_name.endswith((".mp3", ".m4a", ".wav", ".webm", ".mp4", ".mov", ".m4v", ".avi", ".mkv"))
    )

    frame_parts: List[dict] = []
    if is_audio_video:
        transcript = transcribe_media_bytes(name, data) if has_openai() else "Audio/video transcription requires a valid OPENAI_API_KEY."
        text = transcript
        if lower_name.endswith((".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv")):
            suffix = Path(name or "video.mp4").suffix or ".mp4"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(data)
                temp_path = temp_file.name
            try:
                frame_parts = extract_video_frames_from_file(temp_path)
            finally:
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
    elif lower_name.endswith(".pdf") or content_type == "application/pdf":
        text = extract_pdf(data)
        frame_parts = render_pdf_visual_parts(data, name, MAX_VISUAL_IMAGES_PER_SOURCE)
    elif lower_name.endswith(".pptx"):
        text, frame_parts = extract_pptx(data, name)
    elif lower_name.endswith(".docx"):
        text = extract_docx(data)
    else:
        text = extract_text_file(data)

    detected_title = detect_legislation_title(text[:4000]) or detect_course_or_topic_title(text[:2500]) or (name or "uploaded file")
    source_meta["title_candidate"] = detected_title
    source_meta["content_hash"] = sha256_text(text[:50000])
    source_meta["source_identity"] = f"file_text:{source_meta['content_hash']}"
    source_meta["text_excerpt"] = truncate_text(text, 60000)
    source_meta["visual_parts"] = frame_parts

    parts.append({
        "type": "text",
        "text": (
            f"\n\nSOURCE FILE: {name}\n"
            f"Detected title/topic: {detected_title}\n"
            f"Extracted content:\n{truncate_text(text)}"
        ),
    })
    parts.extend(frame_parts)
    return parts, source_meta


def link_to_source_unit(url: str) -> Tuple[List[dict], dict]:
    if get_youtube_video_id(url):
        transcript, frame_parts, meta = analyse_youtube_url(url)
        parts = [{
            "type": "text",
            "text": (
                f"\n\nSOURCE YOUTUBE VIDEO: {url}\n"
                f"Stable identity: {meta['source_identity']}\n"
                f"Transcript:\n{truncate_text(transcript)}"
            ),
        }]
        parts.extend(frame_parts)
        return parts, {
            "display_name": url,
            "source_identity": meta["source_identity"],
            "title_candidate": meta["detected_title"],
            "content_hash": meta["content_hash"],
            "text_excerpt": transcript,
        }

    parsed = urlparse(url)
    lower_path = parsed.path.lower()
    if lower_path.endswith((".mp3", ".m4a", ".wav", ".mp4", ".webm", ".mov", ".avi", ".mkv")):
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        data = urlopen_bytes(req, timeout=20, max_bytes=MAX_VIDEO_BYTES + 1)
        transcript = transcribe_media_bytes(Path(parsed.path).name or "linked-media", data) if has_openai() else "Media transcription requires a valid OPENAI_API_KEY."
        return [{"type": "text", "text": f"\n\nSOURCE MEDIA LINK: {url}\nTranscript:\n{truncate_text(transcript)}"}], {
            "display_name": url,
            "source_identity": canonicalize_url(url)[1],
            "title_candidate": Path(parsed.path).name or "linked media",
            "content_hash": sha256_text(transcript),
            "text_excerpt": transcript,
        }

    try:
        webpage_text, meta = fetch_webpage(url)
        detected_title = meta.get("detected_title") or url
        parts = [{
            "type": "text",
            "text": (
                f"\n\nSOURCE WEBPAGE: {meta['url']}\n"
                f"Stable identity: {meta['source_identity']}\n"
                f"Detected title: {detected_title}\n"
                f"Main webpage text:\n{truncate_text(webpage_text)}"
            ),
        }]
        return parts, {
            "display_name": meta["url"],
            "source_identity": meta["source_identity"],
            "title_candidate": detected_title,
            "content_hash": meta["content_hash"],
            "text_excerpt": webpage_text,
        }
    except Exception as error:
        canonical_url, stable_identity = canonicalize_url(url)
        message = (
            f"\n\nSOURCE WEBPAGE: {canonical_url}\n"
            f"Stable identity: {stable_identity}\n"
            f"The webpage could not be accessed by the backend. Error: {str(error)}\n"
            "Do not guess the content of this webpage. Analyse only this access failure and any other uploaded sources."
        )
        return [{"type": "text", "text": message}], {
            "display_name": canonical_url,
            "source_identity": f"inaccessible:{stable_identity}",
            "title_candidate": canonical_url,
            "content_hash": sha256_text(str(error)),
            "text_excerpt": message,
        }


def build_analysis_fingerprint(preferred_language: str, units: List[dict], depth: str = "auto") -> str:
    identity_bits = [f"cache:{globals().get('CACHE_VERSION', 'v0')}", f"lang:{preferred_language or 'auto'}", f"depth:{depth or 'auto'}"]
    for unit in units:
        source_identity = unit.get("source_identity") or ""
        content_hash = unit.get("content_hash") or ""
        if source_identity.startswith("nzl_act:"):
            identity_bits.append(f"id:{source_identity}")
        else:
            identity_bits.append(f"id:{source_identity}|hash:{content_hash}")
    return sha256_text("||".join(identity_bits))




def normalise_plain_sqrt_text(text: str) -> str:
    """Make plain sqrt(...) readable when a model returns non-LaTeX math."""
    if not text:
        return ""
    value = str(text)
    value = re.sub(r"(?i)sqrt\s*\(\s*([^()\n]+?)\s*\)", r"√(\1)", value)
    value = re.sub(r"(?i)sqrt\s*([0-9A-Za-z]+)", r"√(\1)", value)
    value = re.sub(r"\(\s*√\(([^()]+)\)\s*\)\s*\^\s*([0-9]+)", r"(√(\1))^\2", value)
    value = re.sub(r"\s+", " ", value) if "\n" not in value else value
    return value



LANGUAGE_POLICIES = {
    "auto": {
        "name": "the source's main language",
        "instruction": "Use the source's dominant language. If the source is mixed-language, use the language that best helps the learner.",
        "rewrite": False,
    },
    "english": {
        "name": "English",
        "instruction": "Write everything in English.",
        "rewrite": True,
    },
    "simplified_chinese": {
        "name": "Simplified Chinese",
        "instruction": "Write everything in Simplified Chinese. Keep short key English technical terms in brackets only when helpful.",
        "rewrite": True,
    },
    "traditional_chinese": {
        "name": "Traditional Chinese",
        "instruction": "Write everything in Traditional Chinese. Keep short key English technical terms in brackets only when helpful.",
        "rewrite": True,
    },
    "mixed_chinese_english": {
        "name": "mainly Chinese with key English academic terms in brackets",
        "instruction": "Write mainly in Chinese and keep important academic or technical terms in English brackets when useful.",
        "rewrite": True,
    },
    "japanese": {"name": "Japanese", "instruction": "Write everything in Japanese.", "rewrite": True},
    "korean": {"name": "Korean", "instruction": "Write everything in Korean.", "rewrite": True},
    "french": {"name": "French", "instruction": "Write everything in French.", "rewrite": True},
    "spanish": {"name": "Spanish", "instruction": "Write everything in Spanish.", "rewrite": True},
    "german": {"name": "German", "instruction": "Write everything in German.", "rewrite": True},
    "italian": {"name": "Italian", "instruction": "Write everything in Italian.", "rewrite": True},
    "portuguese": {"name": "Portuguese", "instruction": "Write everything in Portuguese.", "rewrite": True},
    "arabic": {"name": "Arabic", "instruction": "Write everything in Arabic.", "rewrite": True},
    "hindi": {"name": "Hindi", "instruction": "Write everything in Hindi.", "rewrite": True},
    "vietnamese": {"name": "Vietnamese", "instruction": "Write everything in Vietnamese.", "rewrite": True},
    "thai": {"name": "Thai", "instruction": "Write everything in Thai.", "rewrite": True},
    "indonesian": {"name": "Indonesian", "instruction": "Write everything in Indonesian.", "rewrite": True},
    "malay": {"name": "Malay", "instruction": "Write everything in Malay.", "rewrite": True},
    "russian": {"name": "Russian", "instruction": "Write everything in Russian.", "rewrite": True},
}


def normalise_language_key(preferred_language: str) -> str:
    key = (preferred_language or "auto").strip().lower().replace("-", "_")
    aliases = {
        "en": "english",
        "eng": "english",
        "zh": "simplified_chinese",
        "zh_cn": "simplified_chinese",
        "zh_hans": "simplified_chinese",
        "simplified": "simplified_chinese",
        "zh_tw": "traditional_chinese",
        "zh_hant": "traditional_chinese",
        "traditional": "traditional_chinese",
        "ja": "japanese",
        "jp": "japanese",
        "ko": "korean",
        "kr": "korean",
        "fr": "french",
        "es": "spanish",
        "de": "german",
        "it": "italian",
        "pt": "portuguese",
        "ar": "arabic",
        "hi": "hindi",
        "vi": "vietnamese",
        "th": "thai",
        "id": "indonesian",
        "ms": "malay",
        "ru": "russian",
    }
    key = aliases.get(key, key)
    return key if key in LANGUAGE_POLICIES else "auto"


def target_language_name(preferred_language: str) -> str:
    key = normalise_language_key(preferred_language)
    return LANGUAGE_POLICIES[key]["name"]


def language_instruction_for(preferred_language: str) -> str:
    key = normalise_language_key(preferred_language)
    return LANGUAGE_POLICIES[key]["instruction"]

def localized_overview_heading(preferred_language: str) -> str:
    key = normalise_language_key(preferred_language)
    mapping = {
        "english": "Overview",
        "simplified_chinese": "概述",
        "traditional_chinese": "概覽",
        "mixed_chinese_english": "概述",
        "japanese": "概要",
        "korean": "개요",
        "french": "Vue d’ensemble",
        "spanish": "Resumen general",
        "german": "Überblick",
        "italian": "Panoramica",
        "portuguese": "Visão geral",
        "arabic": "نظرة عامة",
        "hindi": "अवलोकन",
        "vietnamese": "Tổng quan",
        "thai": "ภาพรวม",
        "indonesian": "Gambaran Umum",
        "malay": "Gambaran Keseluruhan",
        "russian": "Обзор",
    }
    return mapping.get(key, "Overview")


def protect_synapse_brand_and_first_heading(summary: str, preferred_language: str) -> str:
    """Protect the Synapse brand and remove the awkward translated heading 突触总结."""
    if not summary:
        return summary
    overview = localized_overview_heading(preferred_language)
    value = summary

    # Specific heading fixes first.
    value = re.sub(r"(?im)^\s*#{1,3}\s*(突触总结|突觸總結|突触概要|突觸概要)\s*$", f"# {overview}", value)
    value = re.sub(r"(?im)^\s*#{1,3}\s*Synapse\s+Summary\s*$", f"# {overview}", value)

    # Protect brand references elsewhere. Do not translate the product name.
    value = value.replace("突触", "Synapse")
    value = value.replace("突觸", "Synapse")

    # If the model produced notes without a first heading, add a localised overview heading.
    stripped = value.lstrip()
    if stripped and not stripped.startswith("#"):
        value = f"# {overview}\n" + value

    return value


def should_rewrite_for_language(preferred_language: str) -> bool:
    key = normalise_language_key(preferred_language)
    return bool(LANGUAGE_POLICIES[key].get("rewrite"))


def contains_enough_chinese(text: str) -> bool:
    if not text:
        return False
    cjk = len(re.findall(r"[\u4e00-\u9fff]", text))
    latin_words = len(re.findall(r"\b[A-Za-z]{3,}\b", text))
    return cjk >= 80 or cjk >= latin_words * 0.35


def enforce_requested_language(summary: str, preferred_language: str) -> str:
    """
    Universal language enforcement.
    If the user selects any specific output language, rewrite the whole notes into that language.
    This keeps Generated Content, headings, examples, common mistakes, and critical-thinking questions consistent.
    """
    key = normalise_language_key(preferred_language)
    if key == "auto" or not summary:
        return summary

    language_name = target_language_name(key)
    language_rule = language_instruction_for(key)
    prompt = f"""
Rewrite the following study notes so they fully follow the selected output language.

Selected language: {language_name}
Language rule: {language_rule}

Strict requirements:
- Preserve the same study meaning and source facts.
- Preserve the same markdown structure using headings with # or ##.
- Translate/rewrite headings, explanations, examples, common mistakes, and critical-thinking questions into the selected language.
- Never translate the product name Synapse. If a heading says "Synapse Summary", rewrite it as the selected-language equivalent of "Overview" instead of translating Synapse.
- Do not add new facts.
- Do not remove important facts, examples, subsections, section numbers, legal duties, calculations, exceptions, or caveats.
- Keep the same level of detail as the original analysis; do not compress the notes during rewriting.
- Keep official names, formulas, code, and short technical terms unchanged only when translation would reduce accuracy.
- Keep mathematical notation readable: use √(x), (a)/(b), r'(t)=<1,2,6t>, and never raw escaped LaTeX like \\( ... \\).
- Output only the rewritten notes.

NOTES TO REWRITE:
{summary}
"""
    try:
        rewritten = generate_chat([
            {"role": "system", "content": "You are a precise multilingual academic editor. You rewrite study notes into the user's selected language while preserving structure, meaning, source faithfulness, and the exact brand name Synapse."},
            {"role": "user", "content": prompt},
        ], model=ANALYSIS_MODEL, temperature=0, max_tokens=12000)
        return rewritten or summary
    except Exception:
        return summary


def localise_title_if_needed(title: str, preferred_language: str) -> str:
    key = normalise_language_key(preferred_language)
    if key in {"auto", "english"} or not title:
        return title
    language_name = target_language_name(key)
    try:
        result = generate_chat([
            {"role": "system", "content": "Translate or localise a short study-note title. Return only the title, no punctuation around it."},
            {"role": "user", "content": f"Translate/localise this title into {language_name}. Keep official legal act names understandable and concise. Never translate the brand name Synapse. Title: {title}"},
        ], model=ANALYSIS_MODEL, temperature=0, max_tokens=80)
        return normalise_space(result)[:90] or title
    except Exception:
        return title



@app.post("/analyze")
async def analyze_materials(
    files: List[UploadFile] = File(default=[]),
    links: str = Form(default="[]"),
    free_text: str = Form(default=""),
    preferred_language: str = Form(default="auto"),
    detail_level: str = Form(default="auto"),
    client_fingerprint: str = Form(default=""),
):
    del client_fingerprint  # server now uses stable source identity instead
    global stored_summary, stored_sections, stored_connections, stored_mind_map, stored_title, stored_source_identity

    try:
        require_openai()

        content_parts: List[dict] = []
        source_units: List[dict] = []
        title_candidates: List[str] = []

        for uploaded in files:
            data = await uploaded.read()
            if not data:
                continue
            content_type = uploaded.content_type or mimetypes.guess_type(uploaded.filename or "")[0] or "application/octet-stream"
            parts, meta = file_to_source_unit(uploaded.filename or "uploaded file", content_type, data)
            content_parts.extend(parts)
            source_units.append(meta)
            title_candidates.append(meta.get("title_candidate") or meta.get("display_name") or "")

        try:
            parsed_links = json.loads(links) if links else []
        except Exception:
            parsed_links = []

        for url in parsed_links:
            if not isinstance(url, str) or not url.strip():
                continue
            parts, meta = link_to_source_unit(url.strip())
            content_parts.extend(parts)
            source_units.append(meta)
            title_candidates.append(meta.get("title_candidate") or meta.get("display_name") or "")

        cleaned_free_text = remove_urls_from_text(free_text)
        if cleaned_free_text:
            inferred_title = detect_legislation_title(cleaned_free_text[:4000]) or detect_course_or_topic_title(cleaned_free_text[:2500]) or "Pasted text"
            content_hash = sha256_text(cleaned_free_text)
            content_parts.append({
                "type": "text",
                "text": (
                    f"\n\nUSER PROVIDED TEXT\n"
                    f"Detected title/topic: {inferred_title}\n"
                    f"Content:\n{truncate_text(cleaned_free_text)}"
                ),
            })
            source_units.append({
                "display_name": "pasted text",
                "source_identity": f"text:{content_hash}",
                "title_candidate": inferred_title,
                "content_hash": content_hash,
                "text_excerpt": truncate_text(cleaned_free_text, 60000),
            })
            title_candidates.append(inferred_title)

        if not content_parts:
            return {"error": "No readable files, links, or text were provided."}

        combined_source_text = "\n\n".join(
            part.get("text", "") for part in content_parts
            if isinstance(part, dict) and part.get("type") == "text"
        )
        depth_plan = choose_learning_depth(combined_source_text, source_units, "auto")
        depth = depth_plan["depth"]
        depth_config = depth_plan["config"]
        if len(source_units) >= 2:
            depth = "comprehensive"
            depth_config = DEPTH_CONFIG["comprehensive"]
            depth_plan["depth"] = depth
            depth_plan["config"] = depth_config
            depth_plan["reason"] = (depth_plan.get("reason", "") + ", professor-level multi-source synthesis").strip(", ")

        source_fingerprint = build_analysis_fingerprint(preferred_language, source_units, depth)
        cached_result = cache_get(source_fingerprint)
        if cached_result:
            stored_summary = cached_result.get("summary", "")
            stored_sections = cached_result.get("sections", {})
            stored_connections = cached_result.get("connections", [])
            stored_mind_map = cached_result.get("mind_map", {})
            stored_title = cached_result.get("title", "Generated Study Notes")
            stored_source_identity = cached_result.get("primary_source_identity", "")
            return {**cached_result, "cached": True, "source_fingerprint": source_fingerprint}

        language_rule = language_instruction_for(preferred_language)

        source_identity_lines = []
        for index, unit in enumerate(source_units, start=1):
            source_identity_lines.append(
                f"Source {index}: display_name={unit.get('display_name')} | stable_identity={unit.get('source_identity')} | title_candidate={unit.get('title_candidate')}"
            )

        title_hint = choose_best_source_title(title_candidates)
        source_digest_block = generate_source_digests_for_multisource(source_units, language_rule)
        analysis_task = f"""
{ANALYSIS_PROMPT}

MANDATORY output language for the entire notes: {language_rule}
Do not answer in another language. The full Generated Content must obey this language choice: all headings, explanations, examples, real-world examples, common mistakes, tutor explanations, and critical-thinking questions.

Reference-style target to imitate:
{REFERENCE_STYLE_PROFILE}

For multi-source uploads, use this architecture:
{MULTISOURCE_REFERENCE_STRUCTURE}

Adaptive learning-depth decision:
- Selected depth: {depth_config.get('label', depth)} ({depth}).
- Reasoning data: characters={depth_plan.get('char_count')}, score={depth_plan.get('score')}, sections={depth_plan.get('section_markers')}, formulas={depth_plan.get('formula_markers')}, legal_terms={depth_plan.get('legal_markers')}.
- Depth philosophy: choose the amount of detail that makes the content easiest to understand. Do NOT be brief just to save tokens. If the material is dense, preserve depth. If the material is simple, stay focused and avoid padding.
- Depth instruction: {depth_config.get('instruction')}
- Required section plan for this depth: {', '.join(depth_config.get('sections', []))}.

MANDATORY depth requirement:
- Match the explanation length to the actual complexity of the source, not to an arbitrary fixed word count.
- If the source is a law or formal document, cover definitions, key sections, exceptions, duties, liabilities, procedures, and consequences.
- If the source is a math/video lesson, reconstruct the full teaching sequence, formulas, calculations, verification steps, and common errors.
- Use the source structure wherever visible: parts, sections, headings, tables, transcript sequence, examples, or diagrams.
- If examples exist inside the source, include them. If no example exists, add a clearly labelled external real-world example and explain how it applies.
- Avoid generic filler such as “this is important for understanding”. Every paragraph should teach a specific point.
- For psychology lecture packs, include named theories, named researchers, named experiments, research question/method/result/meaning, diagrams/tables, and exam application.
- If a source contains lecture objectives, outline, or review questions, turn them into revision priorities and exam guidance.
- When there are multiple files, the final output must be much closer to detailed lecture notes than a summary.

Most likely source title/topic from explicit evidence: {title_hint}

Stable source identity list:
{chr(10).join(source_identity_lines)}

Professor source-card preanalysis for multi-source synthesis:
{source_digest_block if source_digest_block else "Not required for single-source mode."}

{build_multisource_instruction(source_units, preferred_language)}

Consistency requirement:
- The same source must not become two different documents.
- If the source is a legislation page, preserve the exact act identity.
- If the source title says Partnership Law Act 2019, do NOT change it to Arms Legislation Act 2019 or any other act.
"""

        if len(source_units) >= 2:
            # Robust all-subject multi-source mode: preserve detailed per-source notes first,
            # then synthesize shared ideas from those notes. This avoids one huge generation
            # call collapsing into a refusal or a basic summary.
            stored_summary = generate_reference_style_multisource_notes(source_units, preferred_language, depth_plan)
        else:
            source_budget = int(depth_config.get("source_chars", MAX_SOURCE_CHARS))
            limited_parts = limit_text_parts_for_depth(content_parts, source_budget)
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": [{"type": "text", "text": analysis_task}] + limited_parts},
            ]
            stored_summary = generate_study_notes_with_quality_guard(messages, preferred_language, title_hint, source_units, content_parts, depth_plan)

        stored_summary = enforce_requested_language(stored_summary, preferred_language)
        stored_summary = protect_synapse_brand_and_first_heading(stored_summary, preferred_language)
        stored_summary = normalise_plain_sqrt_text(stored_summary)
        stored_sections = parse_sections(stored_summary)
        stored_title = make_notes_title(stored_summary, title_candidates)
        if len(source_units) >= 2:
            # Avoid naming the whole analysis after only the first file.
            shared_title_hint = detect_course_or_topic_title(combined_source_text[:5000]) or "Multi-Source Study Synthesis"
            if stored_title in title_candidates or len(stored_title) < 18:
                stored_title = shared_title_hint
        stored_title = localise_title_if_needed(stored_title, preferred_language)
        stored_connections = generate_connections_from_sections(stored_sections)
        stored_mind_map = generate_ai_mind_map(stored_title, stored_sections, preferred_language, depth)
        stored_source_identity = source_units[0].get("source_identity", "") if source_units else ""

        result = {
            "title": stored_title,
            "summary": stored_summary,
            "sections": stored_sections,
            "connections": stored_connections,
            "mind_map": stored_mind_map,
            "visual_gallery": build_visual_gallery(source_units),
            "primary_source_identity": stored_source_identity,
            "source_count": len(source_units),
            "sources": [
                {
                    "index": i + 1,
                    "display_name": unit.get("display_name", ""),
                    "title_candidate": unit.get("title_candidate", ""),
                    "source_identity": unit.get("source_identity", ""),
                }
                for i, unit in enumerate(source_units)
            ],
            "source_fingerprint": source_fingerprint,
            "detail_level": depth,
            "generation_depth": depth,
            "depth_label": depth_config.get("label", depth),
            "depth_reason": depth_plan.get("reason", ""),
            "detail_plan": {k: v for k, v in depth_plan.items() if k != "config"},
            "cached": False,
        }
        # Do not persist large base64 visual images in the JSON cache. The
        # current response can show them, but cached notes stay lightweight.
        cache_result = {**result, "visual_gallery": []}
        cache_set(source_fingerprint, cache_result)
        return result

    except Exception as error:
        return {"error": str(error)}


# -------------------------
# Tutor language + external research helpers
# -------------------------
def detect_question_language(question: str, fallback_language: str = "auto") -> str:
    """Lightweight language detector for tutor replies.
    The tutor should answer in the language used by the user's current question,
    not necessarily the language used for the generated notes.
    """
    q = question or ""
    if re.search(r"[\u4e00-\u9fff]", q):
        # Chinese characters are enough for choosing Chinese output; simplify by default.
        return "Simplified Chinese"
    if re.search(r"[\u3040-\u30ff]", q):
        return "Japanese"
    if re.search(r"[\uac00-\ud7af]", q):
        return "Korean"
    if re.search(r"[\u0600-\u06ff]", q):
        return "Arabic"
    if re.search(r"[\u0900-\u097f]", q):
        return "Hindi"
    if re.search(r"[\u0e00-\u0e7f]", q):
        return "Thai"
    if re.search(r"[\u0400-\u04ff]", q):
        return "Russian"

    # For Latin-script languages, let the model infer from the user text.
    # This avoids false certainty between English/French/Spanish/etc.
    if q.strip():
        return "the same language as the user's latest question"

    language_name = target_language_name(fallback_language)
    return language_name or "the same language as the user's latest question"


def safe_unquote_duckduckgo_url(url: str) -> str:
    parsed = urlparse(url or "")
    if "duckduckgo.com" in parsed.netloc and parsed.path.startswith("/l/"):
        qs = parse_qs(parsed.query)
        if qs.get("uddg"):
            return qs["uddg"][0]
    return url


def search_web_duckduckgo(query: str, max_results: int = 4) -> List[dict]:
    """Small no-key web search fallback for tutor mode.
    For production you can replace this with SerpAPI/Tavily/Brave Search, but this keeps
    the local prototype functional without another paid API.
    """
    query = normalise_space(query)
    if not query or not ENABLE_TUTOR_WEB_RESEARCH:
        return []

    search_url = "https://duckduckgo.com/html/?" + urlencode({"q": query})
    request = urllib.request.Request(search_url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        raw = urlopen_bytes(request, timeout=15, max_bytes=2_000_000)
        html = raw.decode("utf-8", errors="ignore")
    except Exception:
        return []

    results: List[dict] = []
    seen = set()

    if BeautifulSoup is not None:
        soup = BeautifulSoup(html, "html.parser")
        for link in soup.select("a.result__a"):
            title = clean_html(str(link))
            href = safe_unquote_duckduckgo_url(link.get("href") or "")
            if not title or not href or href in seen:
                continue
            seen.add(href)
            snippet = ""
            parent = link.find_parent(class_="result")
            if parent:
                snippet_tag = parent.select_one(".result__snippet")
                if snippet_tag:
                    snippet = normalise_space(snippet_tag.get_text(" ", strip=True))
            results.append({"title": title, "url": href, "snippet": snippet})
            if len(results) >= max_results:
                break
    else:
        for match in re.finditer(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', html, flags=re.I | re.S):
            href = safe_unquote_duckduckgo_url(match.group(1))
            title = clean_html(match.group(2))
            if title and href and href not in seen:
                seen.add(href)
                results.append({"title": title, "url": href, "snippet": ""})
            if len(results) >= max_results:
                break

    return results


def fetch_research_result_text(result: dict, max_chars: int = 2200) -> dict:
    url = result.get("url") or ""
    output = dict(result)
    output["content"] = ""
    if not url or not url.startswith(("http://", "https://")):
        return output
    try:
        raw = urlopen_bytes(
            urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}),
            timeout=15,
            max_bytes=1_500_000,
        )
        html = raw.decode("utf-8", errors="ignore")
        content = extract_main_html_text(html) if "extract_main_html_text" in globals() else clean_html(html)
        output["content"] = truncate_text(content, max_chars)
    except Exception:
        output["content"] = result.get("snippet") or ""
    return output


def build_tutor_search_query(question: str, selected_section: str, source_identity: str, title: str) -> str:
    parts = [question or ""]
    if selected_section:
        parts.append(selected_section)
    if source_identity:
        parts.append(source_identity)
    elif title:
        parts.append(title)
    query = normalise_space(" ".join(parts))
    return query[:280]


def gather_tutor_web_research(question: str, selected_section: str, source_identity: str, title: str) -> Tuple[str, List[dict]]:
    """Search the web for additional context when the stored notes are incomplete.
    Returns a compact research context and result metadata.
    """
    if not ENABLE_TUTOR_WEB_RESEARCH:
        return "", []

    query = build_tutor_search_query(question, selected_section, source_identity, title)
    results = search_web_duckduckgo(query, max_results=MAX_TUTOR_SEARCH_RESULTS)
    enriched = []
    total = 0
    for item in results:
        enriched_item = fetch_research_result_text(item, max_chars=2400)
        content = enriched_item.get("content") or enriched_item.get("snippet") or ""
        total += len(content)
        enriched.append(enriched_item)
        if total >= MAX_TUTOR_RESEARCH_CHARS:
            break

    if not enriched:
        return "", []

    blocks = []
    for i, item in enumerate(enriched, 1):
        blocks.append(
            f"Source {i}: {item.get('title','Untitled')}\n"
            f"URL: {item.get('url','')}\n"
            f"Snippet: {item.get('snippet','')}\n"
            f"Extracted content: {truncate_text(item.get('content',''), 2400)}"
        )
    return "\n\n".join(blocks), enriched

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    return await analyze_materials(files=[file], links="[]", free_text="", preferred_language="auto", client_fingerprint="")


@app.post("/ask")
async def ask_question(data: dict):
    try:
        require_openai()
        question = data.get("question", "")
        selected_section = data.get("selected_section", "")
        chat_history = data.get("chat_history", [])
        preferred_language = data.get("preferred_language", "auto")
        section_context = stored_sections.get(selected_section, "")
        answer_language = detect_question_language(question, preferred_language)

        research_context, research_results = gather_tutor_web_research(
            question=question,
            selected_section=selected_section,
            source_identity=stored_source_identity,
            title=stored_title,
        )

        context = f"""
Current study context:
Title: {stored_title}
Primary source identity: {stored_source_identity}
Selected section: {selected_section if selected_section else 'Full document'}
Section content: {section_context[:4500]}
Full summary: {stored_summary[:11000]}

External research context, use only when the notes/source context do not contain enough information:
{research_context[:MAX_TUTOR_RESEARCH_CHARS] if research_context else 'No external research results were available.'}

Tutor rules:
- Answer in {answer_language}. If the user wrote in Chinese, answer in Chinese. If they wrote in English, answer in English. Match the user question language, not just the notes language.
- Stay consistent with the already generated notes when the notes provide enough evidence.
- Do not claim that information is unavailable until you have checked both the note context and the external research context above.
- If the answer uses external research because the uploaded source does not contain the point, clearly say it is "external research" / "外部资料" and explain how it connects back to the study topic.
- Do not switch to a different source identity. If external research discusses a broader act/topic, connect it carefully to the current source identity.
- Be a helpful academic tutor: explain the concept, give context, give a concrete example when useful, and avoid minimal one-sentence answers.
- Never translate the brand name Synapse.
"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT + "\n\nTutor chat must answer in the language used by the user's latest question. Use external research context when the notes do not contain enough information."},
            {"role": "user", "content": context},
            {"role": "assistant", "content": "I will answer as a source-faithful tutor and use external research only when needed."},
        ]

        for message in chat_history[-8:]:
            role = message.get("role", "user")
            if role not in {"user", "assistant", "system"}:
                role = "user"
            messages.append({"role": role, "content": message.get("content", "")})

        messages.append({"role": "user", "content": question})
        answer = generate_chat(messages, model=CHAT_MODEL, temperature=0.2, max_tokens=2400)

        # Guard against the exact bad behavior shown in the screenshot: refusing because the notes alone are incomplete.
        if is_refusal_or_useless_response(answer) and research_context:
            repair_messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"""
The previous tutor answer was too short or refused to answer. Rewrite it properly.

Answer language: {answer_language}
User question: {question}
Current source title: {stored_title}
Selected section: {selected_section}
Source notes excerpt: {section_context[:3000]}
External research context:
{research_context[:MAX_TUTOR_RESEARCH_CHARS]}

Requirements:
- Answer in {answer_language}.
- Use the external research context if the notes are missing the detail.
- Label external information clearly.
- Explain the point directly and helpfully.
- Do not say you cannot answer unless neither notes nor research contains relevant information.
"""},
            ]
            answer = generate_chat(repair_messages, model=CHAT_MODEL, temperature=0.15, max_tokens=2400)

        return {
            "answer": answer,
            "used_external_research": bool(research_context),
            "research_sources": [
                {"title": item.get("title"), "url": item.get("url")} for item in research_results[:MAX_TUTOR_SEARCH_RESULTS]
            ],
        }
    except Exception as error:
        return {"error": str(error)}
