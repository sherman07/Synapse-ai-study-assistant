import base64
import hashlib
import json
import mimetypes
import ssl
import os
import re
import shutil
import tempfile
import time
import urllib.request
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, Response, UploadFile
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
REALTIME_MODEL = os.getenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2")
REALTIME_VOICE = os.getenv("OPENAI_REALTIME_VOICE", "marin")
ENABLE_TUTOR_WEB_RESEARCH = os.getenv("ENABLE_TUTOR_WEB_RESEARCH", "true").lower() not in {"0", "false", "no"}
MAX_TUTOR_SEARCH_RESULTS = int(os.getenv("MAX_TUTOR_SEARCH_RESULTS", "4"))
MAX_TUTOR_RESEARCH_CHARS = int(os.getenv("MAX_TUTOR_RESEARCH_CHARS", "9000"))
VOICE_TUTOR_HISTORY_LIMIT = int(os.getenv("VOICE_TUTOR_HISTORY_LIMIT", "24"))
VOICE_TUTOR_CONTEXT_CHARS = int(os.getenv("VOICE_TUTOR_CONTEXT_CHARS", "18000"))
VOICE_TUTOR_TOKENS = int(os.getenv("VOICE_TUTOR_TOKENS", "2200"))
VOICE_TUTOR_REALTIME_CONTEXT_CHARS = int(os.getenv("VOICE_TUTOR_REALTIME_CONTEXT_CHARS", "16000"))

MAX_AUDIO_BYTES = int(os.getenv("MAX_AUDIO_BYTES", str(24 * 1024 * 1024)))
MAX_VIDEO_BYTES = int(os.getenv("MAX_VIDEO_BYTES", str(60 * 1024 * 1024)))
MAX_SOURCE_CHARS = int(os.getenv("MAX_SOURCE_CHARS", "90000"))
MAX_VIDEO_FRAMES = int(os.getenv("MAX_VIDEO_FRAMES", "8"))
MAX_VISUAL_IMAGES_PER_SOURCE = int(os.getenv("MAX_VISUAL_IMAGES_PER_SOURCE", "10"))
MAX_MULTI_SOURCE_VISUAL_IMAGES = int(os.getenv("MAX_MULTI_SOURCE_VISUAL_IMAGES", "64"))
MULTISOURCE_VISUAL_GALLERY_LIMIT = int(os.getenv("MULTISOURCE_VISUAL_GALLERY_LIMIT", "36"))
MULTISOURCE_SYNTHESIS_PART_TOKENS = int(os.getenv("MULTISOURCE_SYNTHESIS_PART_TOKENS", "9000"))
MULTISOURCE_CONNECTION_TOKENS = int(os.getenv("MULTISOURCE_CONNECTION_TOKENS", "14000"))
VISUAL_ARGUMENT_CARD_LIMIT = int(os.getenv("VISUAL_ARGUMENT_CARD_LIMIT", "18"))
VISUAL_ARGUMENT_TOKENS = int(os.getenv("VISUAL_ARGUMENT_TOKENS", "1100"))
VISUAL_RENDER_DPI = int(os.getenv("VISUAL_RENDER_DPI", "170"))
ENABLE_PPTX_SLIDE_RENDER = os.getenv("ENABLE_PPTX_SLIDE_RENDER", "true").lower() not in {"0", "false", "no"}
ENABLE_MULTI_SOURCE_DIGESTS = os.getenv("ENABLE_MULTI_SOURCE_DIGESTS", "true").lower() not in {"0", "false", "no"}
MULTISOURCE_SOURCE_DIGEST_TOKENS = int(os.getenv("MULTISOURCE_SOURCE_DIGEST_TOKENS", "9000"))
MULTISOURCE_SOURCE_CHARS = int(os.getenv("MULTISOURCE_SOURCE_CHARS", "500000"))
ANALYSIS_CACHE_TTL_SECONDS = int(os.getenv("ANALYSIS_CACHE_TTL_SECONDS", str(7 * 24 * 60 * 60)))
CACHE_PATH = BACKEND_DIR / "synapse_analysis_cache.json"
CACHE_VERSION = "source_identity_mindmap_v50_isolated_tutor_language_quality_gate"

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
        "org_id_loaded": bool(OPENAI_ORG_ID),
        "project_id_loaded": bool(OPENAI_PROJECT_ID),
        "analysis_model": ANALYSIS_MODEL,
        "chat_model": CHAT_MODEL,
        "transcribe_model": TRANSCRIBE_MODEL,
        "cache_version": CACHE_VERSION,
        "tutor_web_research_enabled": ENABLE_TUTOR_WEB_RESEARCH,
        "multi_source_digests_enabled": ENABLE_MULTI_SOURCE_DIGESTS,
        "max_visual_images_per_source": MAX_VISUAL_IMAGES_PER_SOURCE,
        "max_pdf_visual_candidates_per_source": globals().get("PDF_VISUAL_CANDIDATE_LIMIT", MAX_VISUAL_IMAGES_PER_SOURCE),
        "max_multi_source_visual_images": MAX_MULTI_SOURCE_VISUAL_IMAGES,
        "multi_source_visual_gallery_limit": MULTISOURCE_VISUAL_GALLERY_LIMIT,
        "multi_source_synthesis_part_tokens": MULTISOURCE_SYNTHESIS_PART_TOKENS,
        "multi_source_connection_tokens": MULTISOURCE_CONNECTION_TOKENS,
        "visual_argument_card_limit": VISUAL_ARGUMENT_CARD_LIMIT,
        "visual_render_dpi": VISUAL_RENDER_DPI,
        "pptx_slide_render_enabled": ENABLE_PPTX_SLIDE_RENDER,
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
- For each lecture/source, use a deep teaching pattern: what the source is about -> what problem/question it answers -> key concepts -> examples/studies/cases/calculations with any relevant source screenshots embedded in the same flow -> what students often misunderstand -> how it connects to the wider course.
- When a study/case/experiment appears, explain it using: research question, method/procedure, result/finding, interpretation, limitation, exam use.
- When a formula/calculation appears, reconstruct the teaching sequence: given information, formula, substitution, working, answer, verification, common error.
- When a law/policy source appears, reconstruct the legal logic: purpose, definitions, sections/parts, duties/powers, exceptions, tests, consequences, practical example.
- When a design/art/literature/history source appears, explain context, formal features, evidence/examples, interpretation, tensions, and assessment use.
- Use structured comparison tables whenever the source compares theories, methods, groups, technologies, experiments, cases, time periods, artists, or concepts.
- When the uploaded source contains a useful picture/table/diagram, integrate it directly beside the concept it teaches rather than creating a separate visual section.
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

## 6. Cross-Source Evidence Table
Use markdown tables. Include columns such as Theme, Sources, Evidence/Example, What it proves, Exam/Application use.

## 7. Deep Revision Guide
Give likely exam questions, what a strong answer should include, and common traps. Include “how to compare sources” prompts.

## 8. Memory Hooks / Learning Strategy
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
        "mindmap_branches": 5,
        "mindmap_points": 4,
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
        "mindmap_branches": 7,
        "mindmap_points": 5,
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
        "mindmap_branches": 9,
        "mindmap_points": 7,
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
        "mindmap_branches": 11,
        "mindmap_points": 8,
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


URL_PATTERN = re.compile(r"https?://[^\s<>()\"']+", re.I)
TRAILING_URL_PUNCTUATION = ".,;:!?)]}”’\""


def clean_detected_url(raw_url: str) -> str:
    return (raw_url or "").strip().rstrip(TRAILING_URL_PUNCTUATION)


def extract_urls_from_text(text: str) -> List[str]:
    urls: List[str] = []
    seen = set()
    for raw_url in URL_PATTERN.findall(text or ""):
        cleaned = clean_detected_url(raw_url)
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        urls.append(cleaned)
    return urls


def canonicalize_youtube_watch_url(url: str) -> str:
    video_id = get_youtube_video_id(url)
    if not video_id:
        return clean_detected_url(url)
    return f"https://www.youtube.com/watch?v={video_id}"


def extract_youtube_urls_from_text(text: str) -> List[str]:
    urls: List[str] = []
    seen_video_ids = set()
    for url in extract_urls_from_text(text):
        video_id = get_youtube_video_id(url)
        if not video_id or video_id in seen_video_ids:
            continue
        seen_video_ids.add(video_id)
        urls.append(canonicalize_youtube_watch_url(url))
    return urls


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

#### Source images inside the concept notes
When a visible diagram, table, formula, slide image, or visual cue teaches a concept, explain it inside the relevant concept/example note. Do not create a standalone visual section.

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
            ("研究、案例、实验与证据对照", "用表格和解释整理所有重要研究/案例/实验/计算/法律条文。相关源文件截图必须穿插在对应概念或例子旁边，不要做单独图片区。每项都要写 Question/Method/Result/Meaning/Exam use 或该学科等价结构。"),
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


def format_duration(seconds) -> str:
    try:
        total_seconds = int(float(seconds))
    except Exception:
        return ""
    hours, remainder = divmod(total_seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def fetch_youtube_metadata(url: str) -> dict:
    if yt_dlp is None:
        return {}
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "skip_download": True,
        "socket_timeout": 12,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
        if not isinstance(info, dict):
            return {}
        return {
            "title": normalise_space(info.get("title") or ""),
            "channel": normalise_space(info.get("uploader") or info.get("channel") or ""),
            "duration": format_duration(info.get("duration")),
            "webpage_url": info.get("webpage_url") or url,
        }
    except Exception:
        return {}


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
        "noprogress": True,
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
    canonical_url = canonicalize_youtube_watch_url(url)
    metadata = fetch_youtube_metadata(canonical_url)
    transcript = fetch_youtube_caption_transcript(canonical_url)
    frame_parts: List[dict] = []
    media_path = None

    extract_frames = os.getenv("YOUTUBE_EXTRACT_FRAMES", "0").lower() in {"1", "true", "yes"}
    needs_audio_fallback = len(transcript.strip()) < 500
    if yt_dlp is not None and (extract_frames or needs_audio_fallback):
        media_path = download_youtube_media(canonical_url)
    if media_path:
        try:
            if extract_frames:
                frame_parts = extract_video_frames_from_file(media_path)
            if needs_audio_fallback and has_openai():
                try:
                    with open(media_path, "rb") as media_file:
                        media_bytes = media_file.read(MAX_AUDIO_BYTES + 1)
                    transcribed = transcribe_media_bytes(os.path.basename(media_path), media_bytes)
                    if transcribed and not transcribed.lower().startswith("the audio/video file is too large"):
                        transcript = transcribed
                except Exception:
                    pass
        finally:
            try:
                shutil.rmtree(Path(media_path).parent, ignore_errors=True)
            except Exception:
                pass
    if not transcript:
        transcript = "No readable YouTube transcript could be accessed."
    metadata_lines = []
    if metadata.get("title"):
        metadata_lines.append(f"Video title: {metadata['title']}")
    if metadata.get("channel"):
        metadata_lines.append(f"Channel: {metadata['channel']}")
    if metadata.get("duration"):
        metadata_lines.append(f"Duration: {metadata['duration']}")
    if metadata_lines:
        transcript = "[YouTube metadata]\n" + "\n".join(metadata_lines) + "\n\n[Transcript]\n" + transcript
    video_id = get_youtube_video_id(canonical_url) or "unknown"
    detected_title = metadata.get("title") or f"YouTube video {video_id}"
    meta = {
        "url": canonical_url,
        "source_identity": f"youtube:{video_id}",
        "detected_title": detected_title,
        "content_hash": sha256_text(transcript),
        "metadata": metadata,
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

    promoted_heading_pattern = re.compile(
        r"^\s*(?:"
        r"Learning question|Source and argument map|Core notes|Key terms(?: and mechanisms)?|Sources? \(|Sources?:|Core argument|Key ideas?|Concepts? explained|"
        r"Source evidence|Reading the source evidence|Worked examples?|Evidence matrix|Comparison table|"
        r"Exam strategy|Common mistakes|Revision(?: checklist)?|Conclusion|"
        r"学习问题|来源与论点地图|來源與論點地圖|核心笔记|核心筆記|关键术语与机制|關鍵術語與機制|核心论点|关键概念|源内证据|源內證據|证据矩阵|例子与证据|概念比较表|"
        r"考试策略|考試策略|常见错误|常見錯誤|复习|復習|结论|結論"
        r")\b.*$",
        flags=re.I,
    )

    for raw_line in (summary or "").split("\n"):
        line = raw_line.rstrip()
        heading_match = re.match(r"^#{1,3}\s+(.+?)\s*$", line)
        promoted_heading_match = None if heading_match else promoted_heading_pattern.match(line)

        if heading_match or promoted_heading_match:
            heading = normalise_space(heading_match.group(1) if heading_match else line)
            heading = heading.strip("# ").strip()
            # Ignore empty headings and accidental markdown titles that are too long.
            if heading and len(heading) <= 140:
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
    r"""Convert LaTeX matrices into compact readable forms for mind maps.

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
        summary = short_mindmap_text(branch.get("summary") or fallback_branch.get("summary") or "", 280)

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
            detail_clean = short_mindmap_text(detail_text, 420)
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

    # Match mind-map size to the selected/adaptive depth.
    # This fixes the yellow underline / runtime NameError for {max_branches} and {max_points}.
    limits = DEPTH_CONFIG.get(depth, DEPTH_CONFIG["detailed"])
    max_branches = int(limits.get("mindmap_branches", 6))
    max_points = int(limits.get("mindmap_points", 5))
    section_limit = max(7, min(max_branches + 2, 12))

    compact_sections = []
    for name, content in list(sections.items())[:section_limit]:
        compact_sections.append(f"SECTION: {name}\n{truncate_text(content, 3200)}")

    language_instruction = language_instruction_for(preferred_language)

    prompt = f"""
Create a visual mind map JSON for a study app.
{language_instruction}

Important design rules:
- Do NOT copy long paragraphs directly.
- Make the center title readable and specific.
- Use no more than {max_branches} main branches.
- Use more branches when the notes contain distinct concepts, methods, evidence, examples, or exam themes.
- Each branch should have no more than {max_points} points. Use fewer points only if the source truly has less material.
- Each point needs a short label and 1-2 concrete detail sentences with source substance: definition, mechanism, evidence, example, common confusion, or exam use.
- For math/technical content, DO NOT output Markdown bold, raw LaTeX, or escaped delimiters like \\( ... \\).
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
        ], model=ANALYSIS_MODEL, temperature=0, max_tokens=5600)
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
                f"\n\nSOURCE YOUTUBE VIDEO: {meta.get('url') or url}\n"
                f"Stable identity: {meta['source_identity']}\n"
                f"Detected title/topic: {meta['detected_title']}\n"
                f"Transcript:\n{truncate_text(transcript)}"
            ),
        }]
        parts.extend(frame_parts)
        return parts, {
            "display_name": meta.get("url") or url,
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


def youtube_source_key(url: str) -> Optional[str]:
    video_id = get_youtube_video_id(url)
    return f"youtube:{video_id}" if video_id else None


def expand_embedded_youtube_sources(text: str, parent_meta: dict, seen_youtube_sources: set) -> Tuple[List[dict], List[dict], List[str]]:
    """Turn YouTube URLs found inside an uploaded file's extracted text into real source units."""
    embedded_parts: List[dict] = []
    embedded_units: List[dict] = []
    embedded_titles: List[str] = []
    parent_name = parent_meta.get("display_name") or parent_meta.get("title_candidate") or "uploaded source"

    for url in extract_youtube_urls_from_text(text):
        key = youtube_source_key(url)
        if not key or key in seen_youtube_sources:
            continue
        seen_youtube_sources.add(key)
        parts, meta = link_to_source_unit(url)
        title = meta.get("title_candidate") or meta.get("display_name") or url
        embedded_parts.append({
            "type": "text",
            "text": (
                f"\n\nEMBEDDED YOUTUBE LINK DETECTED IN SOURCE FILE: {parent_name}\n"
                f"Synapse expanded this link into an analyzable transcript source instead of treating it as plain slide text.\n"
                f"Embedded URL: {url}\n"
                f"Video source title/topic: {title}"
            ),
        })
        embedded_parts.extend(parts)
        meta["display_name"] = f"Embedded YouTube from {parent_name}: {title}"
        meta["parent_source"] = parent_name
        meta["embedded_url"] = url
        embedded_units.append(meta)
        embedded_titles.append(title)

    return embedded_parts, embedded_units, embedded_titles


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
        "instruction": "Use only the source's dominant language. If the source is English, write only English. Do not add bilingual headings, Chinese translations, or mixed-language section titles unless the source itself is mixed-language.",
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


def detect_dominant_source_language_key(source_text: str) -> str:
    """Best-effort language detection for Auto output without adding dependencies."""
    text = source_text or ""
    if not text.strip():
        return "english"
    chinese_chars = len(re.findall(r"[\u4e00-\u9fff]", text))
    japanese_chars = len(re.findall(r"[\u3040-\u30ff]", text))
    korean_chars = len(re.findall(r"[\uac00-\ud7af]", text))
    arabic_chars = len(re.findall(r"[\u0600-\u06ff]", text))
    latin_words = len(re.findall(r"\b[A-Za-z]{3,}\b", text))

    if japanese_chars >= 30 and japanese_chars >= chinese_chars * 0.4:
        return "japanese"
    if korean_chars >= 30:
        return "korean"
    if arabic_chars >= 30:
        return "arabic"
    if chinese_chars >= 80 and chinese_chars >= max(30, latin_words * 0.25):
        return "simplified_chinese"
    if latin_words >= 30:
        return "english"
    return "english"


def resolve_generation_language_key(preferred_language: str, source_text: str = "") -> str:
    key = normalise_language_key(preferred_language)
    if key != "auto":
        return key
    return detect_dominant_source_language_key(source_text)


def language_instruction_for_generation(preferred_language: str, source_text: str = "") -> str:
    requested_key = normalise_language_key(preferred_language)
    if requested_key != "auto":
        return language_instruction_for(requested_key)
    detected_key = resolve_generation_language_key(preferred_language, source_text)
    detected_name = target_language_name(detected_key)
    return (
        f"Auto language detected from the uploaded source as {detected_name}. "
        f"{LANGUAGE_POLICIES[detected_key]['instruction']} "
        "Keep the entire generated notes page in this one language. "
        "Do not use bilingual headings or add translations from another language."
    )


def note_structure_for_language(preferred_language: str, source_text: str = "") -> str:
    key = resolve_generation_language_key(preferred_language, source_text)
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        return "\n".join([
            "# [具体主题标题]",
            "## 学习问题",
            "## 来源与论点地图",
            "## 核心笔记",
            "## 关键术语与机制",
            "## 结合源内证据讲解概念",
            "## 源内证据怎么读",
            "## 例子与证据表",
            "## 考试策略与常见错误",
            "## 复习清单",
        ])
    if key == "traditional_chinese":
        return "\n".join([
            "# [具體主題標題]",
            "## 學習問題",
            "## 來源與論點地圖",
            "## 核心筆記",
            "## 關鍵術語與機制",
            "## 結合源內證據講解概念",
            "## 源內證據怎麼讀",
            "## 例子與證據表",
            "## 考試策略與常見錯誤",
            "## 複習清單",
        ])
    return "\n".join([
        "# [specific topic title]",
        "## Learning Question",
        "## Source and Argument Map",
        "## Core Notes",
        "## Key Terms and Mechanisms",
        "## Concepts Explained With Source Evidence",
        "## Reading the Source Evidence",
        "## Worked Examples and Evidence Matrix",
        "## Exam Strategy and Common Mistakes",
        "## Revision Checklist",
    ])


def remove_auto_bilingual_heading_leakage(summary: str, preferred_language: str, source_text: str = "") -> str:
    """When Auto detects English, remove accidental Chinese translations from headings."""
    if not summary or normalise_language_key(preferred_language) != "auto":
        return summary
    if resolve_generation_language_key(preferred_language, source_text) != "english":
        return summary

    cleaned_lines: List[str] = []
    for line in summary.splitlines():
        heading_match = re.match(r"^(\s*#{1,4}\s+)(.+?)\s*$", line)
        if not heading_match:
            cleaned_lines.append(line)
            continue
        prefix, heading = heading_match.groups()
        if "/" in heading:
            left, right = [part.strip() for part in heading.split("/", 1)]
            if re.search(r"[A-Za-z]", left) and re.search(r"[\u4e00-\u9fff]", right):
                heading = left
        cleaned_lines.append(prefix + heading)
    return "\n".join(cleaned_lines)


def markdown_table_count(text: str) -> int:
    return len(re.findall(r"(?m)^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$", text or ""))


def markdown_heading_count(text: str) -> int:
    return len(re.findall(r"(?m)^\s*#{1,4}\s+\S+", text or ""))


def source_looks_academic_or_dense(source_context: str) -> bool:
    value = (source_context or "").lower()
    signals = len(re.findall(
        r"\b(lecture|slide|chapter|study|experiment|method|results?|figure|table|data|theory|model|"
        r"evidence|correlation|comparison|definition|exam|limitation|critique|argument|hypothesis|"
        r"psychology|biology|genetics|neuroscience|law|formula|equation)\b|图|表|实验|数据|理论|模型|证据|比较|局限|定义",
        value,
        flags=re.I,
    ))
    return count_readable_units(source_context) >= 1800 or signals >= 14


def advanced_notes_quality_flags(summary: str, source_context: str) -> List[str]:
    """Return detail gaps that should trigger a targeted expansion pass."""
    flags: List[str] = []
    text = summary or ""
    lower = text.lower()
    units = count_readable_units(text)
    headings = markdown_heading_count(text)
    tables = markdown_table_count(text)
    dense_source = source_looks_academic_or_dense(source_context)

    if units < RICH_INLINE_MIN_OUTPUT_UNITS:
        flags.append("too short for advanced study notes")
    if dense_source and headings < ADVANCED_NOTES_MIN_HEADINGS:
        flags.append("too few navigable teaching sections")
    if dense_source and tables < ADVANCED_NOTES_MIN_TABLES and re.search(
        r"\b(table|figure|graph|chart|correlation|comparison|data|results?|study|experiment|mean|median|rate|percentage)\b|图|表|数据|实验|结果|对比",
        source_context or "",
        flags=re.I,
    ):
        flags.append("missing comparison/evidence tables")

    required_signals = {
        "evidence": r"\b(evidence|source|data|study|experiment|result|finding|example)\b|证据|数据|实验|例子",
        "limitation": r"\b(limitation|caveat|critique|problem|weakness|misleading|cannot|does not prove)\b|局限|限制|误区|不能证明",
        "exam use": r"\b(exam|essay|answer|revision|remember|application|use this)\b|考试|答题|复习|应用",
        "mechanism": r"\b(mechanism|process|because|therefore|works by|leads to|explains why)\b|机制|过程|因为|所以",
    }
    for label, pattern in required_signals.items():
        if not re.search(pattern, lower, flags=re.I):
            flags.append(f"missing {label}")
    return flags


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
        seen_youtube_sources = set()

        for uploaded in files:
            data = await uploaded.read()
            if not data:
                continue
            content_type = uploaded.content_type or mimetypes.guess_type(uploaded.filename or "")[0] or "application/octet-stream"
            parts, meta = file_to_source_unit(uploaded.filename or "uploaded file", content_type, data)
            content_parts.extend(parts)
            source_units.append(meta)
            title_candidates.append(meta.get("title_candidate") or meta.get("display_name") or "")
            embedded_parts, embedded_units, embedded_titles = expand_embedded_youtube_sources(
                meta.get("text_excerpt", ""),
                meta,
                seen_youtube_sources,
            )
            if embedded_units:
                content_parts.extend(embedded_parts)
                source_units.extend(embedded_units)
                title_candidates.extend(embedded_titles)

        try:
            parsed_links = json.loads(links) if links else []
        except Exception:
            parsed_links = []

        for url in parsed_links:
            if not isinstance(url, str) or not url.strip():
                continue
            cleaned_url = clean_detected_url(url.strip())
            if get_youtube_video_id(cleaned_url):
                cleaned_url = canonicalize_youtube_watch_url(cleaned_url)
                key = youtube_source_key(cleaned_url)
                if key in seen_youtube_sources:
                    continue
                seen_youtube_sources.add(key)
            parts, meta = link_to_source_unit(cleaned_url)
            content_parts.extend(parts)
            source_units.append(meta)
            title_candidates.append(meta.get("title_candidate") or meta.get("display_name") or "")

        for url in extract_youtube_urls_from_text(free_text):
            key = youtube_source_key(url)
            if not key or key in seen_youtube_sources:
                continue
            seen_youtube_sources.add(key)
            parts, meta = link_to_source_unit(url)
            meta["display_name"] = f"YouTube link from pasted text: {meta.get('title_candidate') or url}"
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
        resolved_language_key = resolve_generation_language_key(preferred_language, combined_source_text)
        postprocess_language = resolved_language_key if normalise_language_key(preferred_language) == "auto" else preferred_language
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
            # Rebuild live visual cards from the freshly uploaded files. The cache
            # intentionally does not store large base64 images, but the current
            # request still has the source_units needed to recreate them.
            cached_summary = attach_visual_argument_section(cached_result.get("summary", ""), source_units, postprocess_language)
            cached_summary = remove_auto_bilingual_heading_leakage(cached_summary, preferred_language, combined_source_text)
            cached_result = {**cached_result, "summary": cached_summary, "visual_gallery": build_visual_gallery(source_units)}
            stored_summary = cached_summary
            stored_sections = parse_sections(stored_summary)
            cached_result["sections"] = stored_sections
            stored_connections = cached_result.get("connections", [])
            stored_mind_map = cached_result.get("mind_map", {})
            stored_title = cached_result.get("title", "Generated Study Notes")
            stored_source_identity = cached_result.get("primary_source_identity", "")
            return {**cached_result, "cached": True, "source_fingerprint": source_fingerprint, "output_language": postprocess_language}

        language_rule = language_instruction_for_generation(preferred_language, combined_source_text)

        source_identity_lines = []
        for index, unit in enumerate(source_units, start=1):
            source_identity_lines.append(
                f"Source {index}: display_name={unit.get('display_name')} | stable_identity={unit.get('source_identity')} | title_candidate={unit.get('title_candidate')}"
            )

        title_hint = choose_best_source_title(title_candidates)
        # v42: use the controlled advanced tutor generator for both single and
        # multi-source uploads. This avoids an expensive source-digest prepass
        # and prevents the old single-source path from producing thin notes that
        # need visual cards patched on afterward.
        source_digest_block = ""
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
- If an uploaded PDF, PPT, DOC, or text source contains an embedded YouTube URL, Synapse expands it into a SOURCE YOUTUBE VIDEO transcript source. Treat that video as part of the original source context, analyze what it teaches, and connect it back to the slide/page/concept where the link appeared.
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

{build_multisource_instruction(source_units, postprocess_language)}

Consistency requirement:
- The same source must not become two different documents.
- If the source is a legislation page, preserve the exact act identity.
- If the source title says Partnership Law Act 2019, do NOT change it to Arms Legislation Act 2019 or any other act.
"""

        stored_summary = generate_reference_style_multisource_notes(source_units, preferred_language, depth_plan)

        stored_summary = enforce_requested_language(stored_summary, preferred_language)
        stored_summary = remove_auto_bilingual_heading_leakage(stored_summary, preferred_language, combined_source_text)
        stored_summary = protect_synapse_brand_and_first_heading(stored_summary, postprocess_language)
        stored_summary = normalise_plain_sqrt_text(stored_summary)
        # Add source screenshots / slide visuals directly into the generated notes.
        # This is not decorative: each visual is converted into an argument card
        # that explains what it shows and how it supports a cross-source idea.
        stored_summary = attach_visual_argument_section(stored_summary, source_units, postprocess_language)
        stored_summary = remove_auto_bilingual_heading_leakage(stored_summary, preferred_language, combined_source_text)
        stored_sections = parse_sections(stored_summary)
        stored_title = make_notes_title(stored_summary, title_candidates)
        if len(source_units) >= 2:
            # Avoid naming the whole analysis after only the first file.
            shared_title_hint = detect_course_or_topic_title(combined_source_text[:5000]) or "Multi-Source Study Synthesis"
            if stored_title in title_candidates or len(stored_title) < 18:
                stored_title = shared_title_hint
        stored_title = localise_title_if_needed(stored_title, postprocess_language)
        stored_connections = generate_connections_from_sections(stored_sections)
        stored_mind_map = generate_ai_mind_map(stored_title, stored_sections, postprocess_language, depth)
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
            "output_language": postprocess_language,
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


def parse_json_list(value: str) -> List[dict]:
    try:
        parsed = json.loads(value or "[]")
    except Exception:
        return []
    return parsed if isinstance(parsed, list) else []


def parse_json_dict(value: str) -> dict:
    try:
        parsed = json.loads(value or "{}")
    except Exception:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def normalise_voice_tutor_history(history: List[dict]) -> List[dict]:
    turns: List[dict] = []
    for item in history or []:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role") or "").strip().lower()
        if role not in {"user", "assistant"}:
            continue
        text = normalise_space(str(item.get("text") or item.get("content") or ""))
        if not text:
            continue
        turn = {
            "role": role,
            "text": truncate_text(text, 1400),
        }
        if item.get("state"):
            turn["state"] = str(item.get("state"))
        if item.get("mastery") is not None:
            turn["mastery"] = item.get("mastery")
        turns.append(turn)
    return turns[-VOICE_TUTOR_HISTORY_LIMIT:]


def voice_tutor_context_from_sections(sections: dict, selected_section: str) -> str:
    if not isinstance(sections, dict):
        return ""
    if selected_section and sections.get(selected_section):
        return f"Selected section: {selected_section}\n{truncate_text(str(sections.get(selected_section)), 4500)}"
    blocks = []
    for title, content in list(sections.items())[:10]:
        text = normalise_space(str(content))
        if text:
            blocks.append(f"{title}: {truncate_text(text, 900)}")
    return "\n".join(blocks)


def normalise_voice_tutor_json(parsed: dict, fallback_reply: str, transcript: str, history: List[dict]) -> dict:
    if not isinstance(parsed, dict):
        parsed = {}
    try:
        mastery = int(float(parsed.get("mastery", 0)))
    except Exception:
        mastery = 0
    mastery = max(0, min(100, mastery))
    state = normalise_space(str(parsed.get("state") or "diagnose")).lower().replace("-", "_")
    if state not in {"diagnose", "teach", "practice", "hint", "review", "mastered"}:
        state = "diagnose"
    reply = normalise_space(str(parsed.get("reply") or fallback_reply or "Tell me what you understand so far, and I will guide you from there."))
    next_prompt = normalise_space(str(parsed.get("next_prompt") or ""))
    if state != "mastered" and not next_prompt:
        next_prompt = "Answer the next question in your own words."
    exercise = parsed.get("exercise") if isinstance(parsed.get("exercise"), dict) else {}
    exercise = {
        "type": normalise_space(str(exercise.get("type") or "short_answer")),
        "question": normalise_space(str(exercise.get("question") or next_prompt)),
        "expected_answer": normalise_space(str(exercise.get("expected_answer") or "")),
    }
    suggestions = parsed.get("suggested_actions") if isinstance(parsed.get("suggested_actions"), list) else []
    suggestions = [normalise_space(str(item)) for item in suggestions if normalise_space(str(item))][:4]
    if not suggestions:
        suggestions = ["Give me a hint", "Ask a simpler question", "Give me another example"]
        if state == "mastered" or mastery >= 85:
            suggestions.append("End session")
    can_end = bool(parsed.get("can_end")) or state == "mastered" or mastery >= 88
    return {
        "transcript": transcript,
        "reply": reply,
        "state": "mastered" if can_end and mastery >= 85 else state,
        "mastery": mastery,
        "student_level": normalise_space(str(parsed.get("student_level") or "unclear")),
        "diagnosis": normalise_space(str(parsed.get("diagnosis") or "")),
        "next_prompt": "" if can_end and mastery >= 85 else next_prompt,
        "hint": normalise_space(str(parsed.get("hint") or "")),
        "exercise": exercise,
        "can_end": can_end,
        "suggested_actions": suggestions,
        "turn_count": len(history) + (1 if transcript else 0),
    }


def realtime_tutor_instructions(
    title: str,
    note_summary: str,
    section_context: str,
    topic_title: str,
    topic_context: str,
    topic_scope: str,
    history: List[dict],
    preferred_language: str,
    source_identity: str,
) -> str:
    focused_topic = normalise_space(topic_title) or normalise_space(title) or "current study topic"
    focused_context = str(topic_context or "").strip() or str(section_context or "").strip()
    language_source_text = focused_context or note_summary or section_context
    language_name = target_language_name(resolve_generation_language_key(preferred_language, language_source_text))
    recent_history = "\n".join(
        f"{turn.get('role', 'user')}: {normalise_space(str(turn.get('text', '')))}"
        for turn in history[-10:]
    ) or "No prior voice tutor turns."
    broader_note_context = truncate_text(note_summary, 2800 if focused_context else VOICE_TUTOR_REALTIME_CONTEXT_CHARS)
    return f"""
You are Synapse Realtime Voice Tutor, a live speech-to-speech academic tutor.

Voice persona:
- Sound like a young adult female academic tutor in a modern chat app.
- Warm, natural, gentle, curious, encouraging, and conversational.
- Use a light smile in the voice and small natural pauses.
- Do not sound like a narrator, audiobook reader, news anchor, customer-service bot, or corporate assistant.
- Avoid long monologues. Speak in short, human turns.

Language:
- Speak in {language_name}.
- Match the learner's language if they speak differently, but do not randomly mix languages.
- Never translate the product name Synapse.

Current note:
Title: {normalise_space(title) or 'current study topic'}
Primary source identity: {source_identity or 'current uploaded material'}

Current focused topic:
Topic title: {focused_topic}
Topic scope: {normalise_space(topic_scope) or 'current visible generated topic'}
Topic context:
{truncate_text(focused_context, 6500) if focused_context else 'No focused topic was sent. Use the note overview carefully.'}

Opening line:
- On the first assistant turn of the live session, start exactly with: "Hi, I'm your Synapse tutor for {focused_topic}. We'll build this step by step."

Small broader-note guardrail:
{broader_note_context}

Conversation memory:
{recent_history}

Strict scope rule:
- Treat the Current focused topic as the primary lesson scope.
- Answer about this topic only. Use the broader-note guardrail only for one-sentence connections if helpful.
- Never ask what subject, course, material, or topic the learner is working on. You already know the focused topic above.
- If the learner says "I have no idea", "I don't know", "I'm lost", or gives a very short answer, start teaching the focused topic directly from basics. Do not ask them to pick a subject.
- If the learner asks something outside this generated topic, briefly say it is outside the current topic and bring them back to this topic.
- Do not lecture through the whole note unless the current topic is the whole note overview.
- Every assistant turn must end with exactly one clear next step: a short question, a prompt for the learner to continue explaining, or a mini-example for them to try. Never end a tutoring turn with only a statement.

Adaptive tutoring loop:
1. Start the session with the exact opening line above, then ask the learner what they already understand about that exact topic. Do not ask for the subject.
2. Listen to the learner's explanation and diagnose gaps.
3. Ask exactly one focused question or mini-example at a time.
4. If the learner is stuck or wrong, give a gentle hint or micro-lesson, then ask a simpler question.
5. If the learner is doing well, ask a transfer/application question using the uploaded source material.
6. Only end when the learner shows stable understanding across definition, source evidence/example, and application.
7. Do not say they have mastered it just because they say they are done.

When useful, mention the source evidence naturally, but do not read long notes aloud. Be interactive.
""".strip()


@app.post("/voice-tutor/realtime-call")
async def voice_tutor_realtime_call(
    sdp: str = Form(...),
    history: str = Form(default="[]"),
    title: str = Form(default=""),
    summary: str = Form(default=""),
    sections: str = Form(default="{}"),
    selected_section: str = Form(default=""),
    topic_title: str = Form(default=""),
    topic_context: str = Form(default=""),
    topic_scope: str = Form(default=""),
    preferred_language: str = Form(default="auto"),
    source_identity: str = Form(default=""),
):
    try:
        require_openai()
        parsed_history = normalise_voice_tutor_history(parse_json_list(history))
        sections_dict = parse_json_dict(sections)
        note_summary = str(summary or "").strip()
        focused_topic_context = str(topic_context or "").strip()
        if not note_summary and not sections_dict and not focused_topic_context:
            return Response(
                content=json.dumps({"error": "No current note context was provided. Open or generate the note before starting voice tutor."}),
                media_type="application/json",
                status_code=400,
            )

        section_context = voice_tutor_context_from_sections(sections_dict, selected_section)
        session_config = {
            "type": "realtime",
            "model": REALTIME_MODEL,
            "output_modalities": ["audio"],
            "instructions": realtime_tutor_instructions(
                title=title,
                note_summary=note_summary,
                section_context=section_context,
                topic_title=topic_title,
                topic_context=focused_topic_context,
                topic_scope=topic_scope,
                history=parsed_history,
                preferred_language=preferred_language,
                source_identity=source_identity,
            ),
            "audio": {
                "output": {"voice": REALTIME_VOICE},
                "input": {
                    "transcription": {"model": TRANSCRIBE_MODEL},
                    "noise_reduction": {"type": "near_field"},
                    "turn_detection": {
                        "type": "server_vad",
                        "threshold": 0.45,
                        "prefix_padding_ms": 300,
                        "silence_duration_ms": 650,
                        "create_response": True,
                        "interrupt_response": True,
                    },
                },
            },
        }
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        if OPENAI_ORG_ID:
            headers["OpenAI-Organization"] = OPENAI_ORG_ID
        if OPENAI_PROJECT_ID:
            headers["OpenAI-Project"] = OPENAI_PROJECT_ID
        response = requests.post(
            "https://api.openai.com/v1/realtime/calls",
            headers=headers,
            files={
                "sdp": (None, sdp),
                "session": (None, json.dumps(session_config)),
            },
            timeout=30,
        )
        if response.status_code >= 400:
            return Response(
                content=response.text,
                media_type=response.headers.get("content-type", "text/plain"),
                status_code=response.status_code,
            )
        return Response(
            content=response.text,
            media_type="application/sdp",
            headers={"Cache-Control": "no-store"},
        )
    except Exception as error:
        return Response(
            content=json.dumps({"error": str(error)}),
            media_type="application/json",
            status_code=500,
        )


@app.post("/voice-tutor/respond")
async def voice_tutor_respond(
    audio: Optional[UploadFile] = File(default=None),
    transcript: str = Form(default=""),
    history: str = Form(default="[]"),
    title: str = Form(default=""),
    summary: str = Form(default=""),
    sections: str = Form(default="{}"),
    selected_section: str = Form(default=""),
    preferred_language: str = Form(default="auto"),
    source_identity: str = Form(default=""),
):
    try:
        require_openai()
        parsed_history = normalise_voice_tutor_history(parse_json_list(history))
        sections_dict = parse_json_dict(sections)
        note_summary = str(summary or "").strip()
        if not note_summary and not sections_dict:
            return {"error": "No current note context was provided. Open or generate the note before starting voice tutor."}

        transcript_text = normalise_space(transcript)
        if audio is not None and audio.filename:
            audio_bytes = await audio.read()
            if audio_bytes:
                transcript_text = normalise_space(transcribe_media_bytes(audio.filename, audio_bytes))
        is_opening_turn = not transcript_text and not parsed_history

        section_context = voice_tutor_context_from_sections(sections_dict, selected_section)
        topic = normalise_space(title) or "the current study topic"
        language_source_text = note_summary or section_context
        answer_language = (
            detect_question_language(transcript_text, preferred_language)
            if transcript_text else
            target_language_name(resolve_generation_language_key(preferred_language, language_source_text))
        )
        history_lines = "\n".join(
            f"{turn['role']}: {turn['text']}" + (f" [state={turn.get('state')}, mastery={turn.get('mastery')}]" if turn.get("state") else "")
            for turn in parsed_history[-VOICE_TUTOR_HISTORY_LIMIT:]
        ) or "No prior voice tutor turns."
        opening_instruction = (
            "This is the opening turn. Ask the learner to explain what they already understand about the topic before teaching. "
            "Do not lecture yet. Give a warm, short diagnostic prompt."
            if is_opening_turn else
            "Evaluate the learner's latest answer, then decide whether to teach, hint, ask a simpler question, ask a harder transfer question, or end."
        )

        prompt = f"""
You are Synapse Voice Tutor, an adaptive spoken academic tutor.

Speak in: {answer_language}
Never translate the product name Synapse.

Current note:
Title: {topic}
Primary source identity: {source_identity or 'current uploaded material'}
Selected section context:
{section_context[:5000] if section_context else 'Full note context is used.'}

Generated notes context:
{truncate_text(note_summary, VOICE_TUTOR_CONTEXT_CHARS)}

Voice tutor conversation so far:
{history_lines}

Latest learner answer transcript:
{transcript_text or '[No learner answer yet]'}

Tutor mission:
- Start by asking what the learner already understands about this topic.
- Use the learner's first explanation as a diagnostic baseline.
- Keep asking one focused question or example at a time.
- If the learner is vague, wrong, or stuck, give a hint, a simpler question, or a short micro-lesson before asking again.
- If the learner is doing well, ask a harder transfer/example question, not just recall.
- End only when the learner has shown stable understanding across definition, evidence/example, and application.
- Do not mark mastery just because the learner says they are done.
- Keep the reply speakable: short paragraphs, no markdown tables, no long lists.
- Write the reply like a natural voice-chat script from a warm young female academic tutor. Use conversational phrasing, not textbook prose.
- In English, use natural contractions where appropriate. Do not use headings like "Diagnosis:" or "Question:" in the spoken reply.
- Use the source notes as the authority. Do not invent facts outside the uploaded material.
- Ask exactly one main question at the end unless can_end is true.
- If can_end is true, give a brief mastery summary and tell the learner they can finish or ask for one final challenge.

Current instruction:
{opening_instruction}

Return JSON only:
{{
  "reply": "what the voice tutor should say aloud",
  "state": "diagnose | teach | practice | hint | review | mastered",
  "mastery": 0,
  "student_level": "unclear | beginner | developing | secure | strong",
  "diagnosis": "brief private-facing diagnosis for UI",
  "next_prompt": "the one question the learner should answer next, empty if mastered",
  "hint": "short hint if useful",
  "exercise": {{"type":"short_answer | explain | example | compare | apply | correct_mistake","question":"...","expected_answer":"..."}},
  "can_end": false,
  "suggested_actions": ["Give me a hint", "Ask a simpler question", "Give me another example"]
}}
"""
        raw = generate_chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT + "\n\nYou are running a spoken tutoring loop. Return compact JSON only."},
                {"role": "user", "content": prompt},
            ],
            model=CHAT_MODEL,
            temperature=0.25,
            max_tokens=VOICE_TUTOR_TOKENS,
        )
        try:
            parsed = extract_json_object(raw)
        except Exception:
            parsed = {}
        fallback = "Tell me what you already understand about this topic. Start with the main idea, then one example or source detail you remember."
        return normalise_voice_tutor_json(parsed, fallback, transcript_text, parsed_history)
    except Exception as error:
        return {"error": str(error)}

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
        request_sections = data.get("sections") if isinstance(data.get("sections"), dict) else {}
        context_sections = {
            str(key): str(value)
            for key, value in request_sections.items()
            if str(value).strip()
        }
        request_summary = str(data.get("summary") or "").strip()
        request_title = str(data.get("title") or "").strip()
        request_source_identity = str(data.get("source_identity") or "").strip()
        if not request_summary and not context_sections:
            return {"error": "No current note context was provided. Open or generate the note again before asking the tutor."}

        context_summary = request_summary
        context_title = request_title or "Current Notes"
        context_source_identity = request_source_identity
        section_context = context_sections.get(selected_section, "")
        answer_language = detect_question_language(question, preferred_language)

        research_context, research_results = gather_tutor_web_research(
            question=question,
            selected_section=selected_section,
            source_identity=context_source_identity,
            title=context_title,
        )

        context = f"""
Current study context:
Title: {context_title}
Primary source identity: {context_source_identity}
Selected section: {selected_section if selected_section else 'Full document'}
Section content: {section_context[:4500]}
Full summary: {context_summary[:11000]}

External research context, use only when the notes/source context do not contain enough information:
{research_context[:MAX_TUTOR_RESEARCH_CHARS] if research_context else 'No external research results were available.'}

Tutor rules:
- Answer in {answer_language}. If the user wrote in Chinese, answer in Chinese. If they wrote in English, answer in English. Match the user question language, not just the notes language.
- Stay consistent with the already generated notes when the notes provide enough evidence.
- Do not claim that information is unavailable until you have checked both the note context and the external research context above.
- If the answer uses external research because the uploaded source does not contain the point, clearly say it is "external research" / "外部资料" and explain how it connects back to the study topic.
- Do not switch to a different source identity. If external research discusses a broader act/topic, connect it carefully to the current source identity.
- Be an advanced academic tutor: answer the question directly, then explain the idea, the evidence, the reasoning chain, and the likely misunderstanding.
- Use a compact markdown table when the user asks for a comparison, a list of studies/evidence, steps, or differences.
- For "explain" questions, use: short answer -> detailed explanation -> example/source evidence -> common mistake -> how to remember/use it.
- For "summarise" questions, prioritise the central argument and evidence over a list of headings.
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
        answer = generate_chat(messages, model=CHAT_MODEL, temperature=0.2, max_tokens=3200)

        # Guard against the exact bad behavior shown in the screenshot: refusing because the notes alone are incomplete.
        if is_refusal_or_useless_response(answer) and research_context:
            repair_messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"""
The previous tutor answer was too short or refused to answer. Rewrite it properly.

Answer language: {answer_language}
User question: {question}
Current source title: {context_title}
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


# -----------------------------------------------------------------------------
# v19 Multisource Visual Professor Engine overrides
# -----------------------------------------------------------------------------
# These definitions intentionally appear late in the module. Python resolves the
# global function names at request time, so these replace the earlier v18 helpers
# without requiring a full rewrite of the existing app. The goal is to turn the
# app from a summary generator into a source-grounded, visual, cross-source
# teaching engine.


def env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except Exception:
        return default


def worldclass_language_labels(preferred_language: str) -> dict:
    key = normalise_language_key(preferred_language)
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        return {
            "guide_title": "# 🧠 综合学习指南",
            "intro": "这份学习指南先逐项深入讲解每个 source，再明确整理 source 之间的 connection points、来源图表、差异争论和考试应用。",
            "source_heading": "## 1. 逐项资源精讲",
            "connection_heading": "## 2. 跨资源 Connection Points",
            "visual_heading": "",
            "synthesis_heading": "## 4. 教授式综合讲解",
            "visual_intro": "",
            "connection_intro": "下面不是告诉你“如何找共同点”，而是直接把这组资料之间真正的共同 ideas、互相补充关系、差异和证据整理出来。",
            "visual_card_title": "来源图表",
            "source_label": "来源",
            "what_shows": "图中/表中显示",
            "argument": "为什么放在这里",
            "connection": "连接到其他 source",
            "how_to_read": "阅读方法",
            "exam_use": "考试/复习用途",
        }
    if key == "traditional_chinese":
        return {
            "guide_title": "# 🧠 綜合學習指南",
            "intro": "這份學習指南先逐項深入講解每個 source，再明確整理 source 之間的 connection points、來源圖表、差異爭論和考試應用。",
            "source_heading": "## 1. 逐項資源精講",
            "connection_heading": "## 2. 跨資源 Connection Points",
            "visual_heading": "",
            "synthesis_heading": "## 4. 教授式綜合講解",
            "visual_intro": "",
            "connection_intro": "下面不是告訴你「如何找共同點」，而是直接把這組資料之間真正的共同 ideas、互相補充關係、差異和證據整理出來。",
            "visual_card_title": "來源圖表",
            "source_label": "來源",
            "what_shows": "圖中/表中顯示",
            "argument": "為什麼放在這裡",
            "connection": "連接到其他 source",
            "how_to_read": "閱讀方法",
            "exam_use": "考試/複習用途",
        }
    return {
        "guide_title": "# 🧠 Integrated Study Guide",
        "intro": "This guide teaches the concepts in normal note flow, embedding uploaded source screenshots directly beside the concepts they explain.",
        "source_heading": "## 1. Source-by-Source Professor Notes",
        "connection_heading": "## 2. Cross-Source Connection Points",
        "visual_heading": "",
        "synthesis_heading": "## 3. Professor-Style Synthesis",
        "visual_intro": "",
        "connection_intro": "This section does not tell you how to find connections; it directly maps the real shared ideas, extensions, differences, and evidence across the sources.",
        "visual_card_title": "Source figure",
        "source_label": "Source",
        "what_shows": "What this source figure shows",
        "argument": "Why it matters here",
        "connection": "Connection to other sources",
        "how_to_read": "How to read it",
        "exam_use": "Exam / revision use",
    }


def image_url_from_part(part: dict) -> str:
    if not isinstance(part, dict):
        return ""
    return ((part.get("image_url") or {}).get("url") or "").strip()


def image_part_from_url(url: str) -> dict:
    return {"type": "image_url", "image_url": {"url": url}}


def visual_source_location_from_label(label: str) -> Tuple[str, str]:
    label = normalise_space(label or "")
    source = ""
    location = ""
    m = re.search(r"FROM\s+(.+?)\s+—\s+(.+?)(?:\.|$)", label, flags=re.I)
    if m:
        source = m.group(1).strip()
        location = m.group(2).strip()
    else:
        page = re.search(r"PDF page\s*(\d+)", label, flags=re.I)
        slide = re.search(r"PPT slide\s*(\d+)", label, flags=re.I)
        if page:
            location = f"PDF page {page.group(1)}"
        elif slide:
            location = f"PPT slide {slide.group(1)}"
    return source, location


def score_visual_text(text: str, index: int = 0) -> int:
    """Rank pages/slides that are likely to contain useful teaching visuals."""
    value = normalise_space(text or "").lower()
    score = 0
    high_value = [
        "figure", "fig.", "table", "graph", "diagram", "model", "experiment", "method", "results", "data",
        "comparison", "compare", "versus", "vs", "effect", "mechanism", "process", "steps", "study",
        "case", "example", "formula", "calculation", "matrix", "chart", "scatter", "boxplot", "bar graph",
        "brain", "neuron", "action potential", "heritability", "chimpanzee", "bonobo", "ultimatum", "dictator",
        "图", "表", "模型", "实验", "研究", "结果", "对比", "比較", "机制", "機制", "步骤", "步驟", "案例", "公式",
    ]
    for kw in high_value:
        if kw in value:
            score += 3
    # Title and early overview slides are useful, but not more useful than actual diagrams.
    if index <= 2:
        score += 2
    # Dense text can still be valuable, but pure title slides should not dominate.
    if len(value) > 350:
        score += 2
    if len(value) < 30:
        score -= 2
    return score


def selected_indices_by_score(texts: List[str], limit: int) -> List[int]:
    if not texts or limit <= 0:
        return []
    scored = [(score_visual_text(text, i), i) for i, text in enumerate(texts)]
    # Always retain the first slide/page if there is room, because it often gives context/title.
    selected = []
    if texts:
        selected.append(0)
    for _, idx in sorted(scored, key=lambda x: (-x[0], x[1])):
        if idx not in selected:
            selected.append(idx)
        if len(selected) >= limit:
            break
    return sorted(selected)


def render_pdf_visual_parts(data: bytes, source_name: str, max_pages: Optional[int] = None) -> List[dict]:
    """Render high-value PDF pages as screenshots for visual reasoning and inline notes."""
    if fitz is None:
        return []
    max_pages = int(max_pages or MAX_VISUAL_IMAGES_PER_SOURCE)
    if max_pages <= 0:
        return []
    parts: List[dict] = []
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        page_texts = []
        for page in doc:
            try:
                page_texts.append(page.get_text("text") or "")
            except Exception:
                page_texts.append("")
        selected = selected_indices_by_score(page_texts, max_pages)
        matrix = fitz.Matrix(max(1.0, VISUAL_RENDER_DPI / 72), max(1.0, VISUAL_RENDER_DPI / 72))
        for idx in selected:
            page = doc.load_page(idx)
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            img_bytes = pix.tobytes("jpeg")
            preview = truncate_text(normalise_space(page_texts[idx]), 420)
            label = (
                f"VISUAL EVIDENCE FROM {source_name} — PDF page {idx + 1}. "
                f"This is an actual screenshot from the source. Page text preview: {preview}"
            )
            parts.append({"type": "text", "text": label})
            parts.append(image_part_from_bytes(img_bytes, "image/jpeg"))
        doc.close()
    except Exception:
        return []
    return parts


def find_libreoffice_binary() -> Optional[str]:
    candidates = [
        os.getenv("LIBREOFFICE_PATH", ""),
        "libreoffice", "soffice",
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
        "/usr/bin/libreoffice", "/usr/local/bin/libreoffice", "/opt/homebrew/bin/libreoffice",
    ]
    import shutil
    for candidate in candidates:
        if not candidate:
            continue
        resolved = shutil.which(candidate) if not candidate.startswith("/") else candidate
        if resolved and Path(resolved).exists():
            return resolved
    return None


def render_pptx_slide_screenshots(data: bytes, source_name: str, slide_texts: List[str], max_slides: int) -> List[dict]:
    """Convert PPTX to PDF with LibreOffice and render selected slides.

    python-pptx can extract embedded pictures but cannot render a whole slide.
    This method creates actual slide screenshots, which is what users expect from
    a visual study guide. If LibreOffice is unavailable, callers fall back to
    embedded-image extraction.
    """
    if not ENABLE_PPTX_SLIDE_RENDER or fitz is None:
        return []
    soffice = find_libreoffice_binary()
    if not soffice:
        return []
    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        pptx_path = tmpdir / "input.pptx"
        pptx_path.write_bytes(data)
        try:
            import subprocess
            subprocess.run(
                [soffice, "--headless", "--convert-to", "pdf", "--outdir", str(tmpdir), str(pptx_path)],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=60,
            )
        except Exception:
            return []
        pdf_candidates = list(tmpdir.glob("*.pdf"))
        if not pdf_candidates:
            return []
        try:
            doc = fitz.open(str(pdf_candidates[0]))
            if len(doc) <= 0:
                return []
            selected = selected_indices_by_score(slide_texts or ["" for _ in range(len(doc))], max_slides)
            selected = [i for i in selected if i < len(doc)] or list(range(min(max_slides, len(doc))))
            matrix = fitz.Matrix(max(1.0, VISUAL_RENDER_DPI / 72), max(1.0, VISUAL_RENDER_DPI / 72))
            parts: List[dict] = []
            for idx in selected:
                page = doc.load_page(idx)
                pix = page.get_pixmap(matrix=matrix, alpha=False)
                img_bytes = pix.tobytes("jpeg")
                preview = truncate_text(normalise_space(slide_texts[idx] if idx < len(slide_texts) else ""), 420)
                label = (
                    f"VISUAL EVIDENCE FROM {source_name} — PPT slide {idx + 1}. "
                    f"This is an actual rendered screenshot of the slide. Slide text preview: {preview}"
                )
                parts.append({"type": "text", "text": label})
                parts.append(image_part_from_bytes(img_bytes, "image/jpeg"))
            doc.close()
            return parts
        except Exception:
            return []


def extract_pptx(data: bytes, source_name: str = "presentation") -> Tuple[str, List[dict]]:
    """Extract PPTX text and, when possible, actual slide screenshots."""
    if Presentation is None:
        return "PPTX support is not installed. Run: pip install python-pptx", []
    prs = Presentation(BytesIO(data))
    slide_texts: List[str] = []
    embedded_parts: List[dict] = []
    embedded_count = 0
    for slide_index, slide in enumerate(prs.slides, start=1):
        lines: List[str] = []
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text and shape.text.strip():
                lines.append(shape.text.strip())
            if embedded_count < max(2, MAX_VISUAL_IMAGES_PER_SOURCE // 2) and hasattr(shape, "image"):
                try:
                    blob = shape.image.blob
                    content_type = shape.image.content_type or "image/png"
                    embedded_count += 1
                    embedded_parts.append({
                        "type": "text",
                        "text": f"VISUAL EVIDENCE FROM {source_name} — embedded image on PPT slide {slide_index}. This is an image extracted from the slide, not the full slide screenshot.",
                    })
                    embedded_parts.append(image_part_from_bytes(blob, content_type))
                except Exception:
                    pass
        slide_texts.append(f"[PPT SLIDE {slide_index}]\n" + "\n".join(lines))
    full_slide_parts = render_pptx_slide_screenshots(data, source_name, slide_texts, MAX_VISUAL_IMAGES_PER_SOURCE)
    visual_parts = full_slide_parts if full_slide_parts else embedded_parts
    return "\n\n".join(slide_texts).strip(), visual_parts


def iter_visual_candidates(source_units: List[dict]) -> List[dict]:
    candidates: List[dict] = []
    for source_index, unit in enumerate(source_units or [], start=1):
        title = unit.get("title_candidate") or unit.get("display_name") or f"Source {source_index}"
        label = ""
        visual_number = 0
        for part in unit.get("visual_parts") or []:
            if not isinstance(part, dict):
                continue
            if part.get("type") == "text":
                label = normalise_space(part.get("text") or "")
                continue
            if part.get("type") == "image_url":
                url = image_url_from_part(part)
                if not url:
                    continue
                visual_number += 1
                _, location = visual_source_location_from_label(label)
                candidates.append({
                    "source_index": source_index,
                    "source_title": title,
                    "display_name": unit.get("display_name", title),
                    "caption": label[:420] if label else f"Visual evidence from Source {source_index}",
                    "location": location or f"visual {visual_number}",
                    "url": url,
                    "score": score_visual_text(label + " " + title, visual_number),
                })
    return candidates


def select_visual_candidates_for_argument(source_units: List[dict], limit: Optional[int] = None) -> List[dict]:
    limit = int(limit or VISUAL_ARGUMENT_CARD_LIMIT)
    candidates = iter_visual_candidates(source_units)
    if not candidates:
        return []
    # Keep coverage across sources first, then fill remaining slots by score.
    by_source = {}
    for cand in sorted(candidates, key=lambda c: (-c.get("score", 0), c.get("source_index", 0))):
        by_source.setdefault(cand["source_index"], cand)
    selected = list(by_source.values())
    for cand in sorted(candidates, key=lambda c: (-c.get("score", 0), c.get("source_index", 0))):
        if cand not in selected:
            selected.append(cand)
        if len(selected) >= limit:
            break
    return selected[:limit]


def extract_json_object(text: str) -> dict:
    text = (text or "").strip()
    if not text:
        return {}
    try:
        return json.loads(text)
    except Exception:
        pass
    # Pull JSON from fenced code or mixed prose.
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text, flags=re.I)
    if m:
        try:
            return json.loads(m.group(1).strip())
        except Exception:
            pass
    start = text.find("{")
    end = text.rfind("}")
    if 0 <= start < end:
        try:
            return json.loads(text[start:end + 1])
        except Exception:
            return {}
    return {}


def fallback_visual_card(candidate: dict, index: int, labels: dict) -> dict:
    title_label = labels.get("figure_title") or labels.get("visual_card_title") or "Source figure"
    return {
        "index": index,
        "source_index": candidate.get("source_index"),
        "source_title": candidate.get("source_title", ""),
            "location": candidate.get("location", ""),
            "caption": clean_source_figure_caption(candidate.get("caption", "")),
            "url": candidate.get("url", ""),
            "title": f"{title_label} {index + 1}",
            "what_shows": clean_source_figure_caption(candidate.get("caption", "")) or "This source figure comes from the uploaded source.",
        "argument_supported": "Use this source figure as direct support for the nearby concept in the notes.",
        "cross_source_connection": "Connect this source figure to the source's main concept and compare it with related concepts from the other uploaded materials.",
        "how_to_read": "Start with the title/labels, then identify what is being compared, measured, sequenced, or illustrated.",
        "exam_use": "Refer to this source figure when explaining evidence, interpreting a diagram, or comparing sources in an exam answer.",
    }


def generate_visual_argument_cards(source_units: List[dict], source_digest_block: str, preferred_language: str) -> List[dict]:
    """Create source-grounded visual cards that can be embedded in the notes.

    Each card is built from an actual screenshot/image from the uploaded source and
    asks the model to explain the visual as evidence for a concept/argument. The
    output stays structured so the front end can render image + argument together.
    """
    existing = []
    for unit in source_units or []:
        existing.extend(unit.get("visual_argument_cards") or [])
    if existing:
        return existing

    labels = source_figure_labels(preferred_language)
    candidates = select_visual_candidates_for_argument(source_units, VISUAL_ARGUMENT_CARD_LIMIT)
    if not candidates:
        return []

    language_rule = language_instruction_for(preferred_language)
    context = truncate_text(source_digest_block or "\n\n".join(u.get("text_excerpt", "") for u in source_units or []), env_int("VISUAL_ARGUMENT_CONTEXT_CHARS", 50000))
    cards: List[dict] = []
    for idx, cand in enumerate(candidates):
        prompt = f"""
You are creating a visual evidence card for a world-class study guide.

Language requirement: {language_rule}
Never translate the product name Synapse.

You must inspect the attached source screenshot/image and explain how it teaches or supports an argument. Do not describe it generically.

Source visual metadata:
- Source number: {cand.get('source_index')}
- Source title: {cand.get('source_title')}
- Location: {cand.get('location')}
- Existing caption/context: {cand.get('caption')}

Relevant source-card context:
{context}

Return JSON only with these fields:
{{
  "title": "short title for this visual",
  "what_shows": "what is visibly shown in the image; mention table/graph/diagram/experiment/slide if applicable",
  "argument_supported": "the specific concept or argument this visual supports",
  "cross_source_connection": "how this visual connects to at least one other source or broader course theme",
  "how_to_read": "how a student should read the image step by step",
  "exam_use": "how to use this visual in an exam/assignment answer"
}}
"""
        try:
            raw = generate_chat([
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": [{"type": "text", "text": prompt}, image_part_from_url(cand["url"])]},
            ], model=model_for_depth("comprehensive"), temperature=0, max_tokens=VISUAL_ARGUMENT_TOKENS)
            parsed = extract_json_object(raw)
            if not parsed:
                card = fallback_visual_card(cand, idx, labels)
            else:
                card = {
                    "index": idx,
                    "source_index": cand.get("source_index"),
                    "source_title": cand.get("source_title", ""),
                    "location": cand.get("location", ""),
                    "caption": cand.get("caption", ""),
                    "url": cand.get("url", ""),
                    "title": parsed.get("title") or f"{labels['visual_card_title']} {idx + 1}",
                    "what_shows": parsed.get("what_shows") or cand.get("caption", ""),
                    "argument_supported": parsed.get("argument_supported") or "",
                    "cross_source_connection": parsed.get("cross_source_connection") or "",
                    "how_to_read": parsed.get("how_to_read") or "",
                    "exam_use": parsed.get("exam_use") or "",
                }
        except Exception:
            card = fallback_visual_card(cand, idx, labels)
        cards.append(card)

    # Store on the first source unit so build_visual_gallery can return the same order.
    if source_units:
        source_units[0]["visual_argument_cards"] = cards
    return cards


def visual_argument_markdown(cards: List[dict], preferred_language: str) -> str:
    labels = source_figure_labels(preferred_language)
    if not cards:
        return ""
    chunks = [f"{labels['visual_heading']}\n\n{labels['visual_intro']}"]
    for i, card in enumerate(cards):
        chunks.append(
            f"### {labels['visual_card_title']} {i + 1}: {card.get('title', '')}\n\n"
            f"[[VISUAL:{i}]]\n\n"
            f"**{labels['source_label']}:** Source {card.get('source_index', '')} — {card.get('source_title', '')} ({card.get('location', '')})\n\n"
            f"**{labels['what_shows']}:** {card.get('what_shows', '')}\n\n"
            f"**{labels['argument']}:** {card.get('argument_supported', '')}\n\n"
            f"**{labels['connection']}:** {card.get('cross_source_connection', '')}\n\n"
            f"**{labels['how_to_read']}:** {card.get('how_to_read', '')}\n\n"
            f"**{labels['exam_use']}:** {card.get('exam_use', '')}"
        )
    return "\n\n".join(chunks).strip()


def build_visual_gallery(source_units: List[dict]) -> List[dict]:
    """Return visual argument cards first; fall back to raw screenshot gallery."""
    argument_cards = []
    for unit in source_units or []:
        argument_cards.extend(unit.get("visual_argument_cards") or [])
    if argument_cards:
        return argument_cards[:MULTISOURCE_VISUAL_GALLERY_LIMIT]

    # Fallback raw gallery for cases where notes were not generated yet.
    gallery: List[dict] = []
    max_items = MULTISOURCE_VISUAL_GALLERY_LIMIT
    for cand in iter_visual_candidates(source_units):
        gallery.append({
            "source_index": cand.get("source_index"),
            "source_title": cand.get("source_title", ""),
            "caption": cand.get("caption", ""),
            "location": cand.get("location", ""),
            "url": cand.get("url", ""),
            "title": cand.get("location") or "Source visual",
            "what_shows": cand.get("caption", ""),
            "argument_supported": "",
            "cross_source_connection": "",
            "how_to_read": "",
            "exam_use": "",
        })
        if len(gallery) >= max_items:
            break
    return gallery


def generate_connection_points_block(source_digest_block: str, source_units: List[dict], preferred_language: str, visual_cards: Optional[List[dict]] = None) -> str:
    if len(source_units or []) < 2 or not source_digest_block:
        return ""
    labels = worldclass_language_labels(preferred_language)
    language_rule = language_instruction_for(preferred_language)
    source_list = "\n".join(f"Source {i}: {u.get('title_candidate') or u.get('display_name')}" for i, u in enumerate(source_units, start=1))
    visual_context = "\n".join(
        f"Visual {i+1}: Source {c.get('source_index')} {c.get('location')} — {c.get('title')} — {c.get('argument_supported')}"
        for i, c in enumerate(visual_cards or [])
    )
    prompt = f"""
You are writing the most important section of Synapse: explicit cross-source connection points.

Language requirement: {language_rule}
Never translate Synapse.

Sources:
{source_list}

Detailed source cards:
{truncate_text(source_digest_block, env_int('MULTISOURCE_DIGEST_CONTEXT_CHARS', 300000))}

Source screenshots available for inline concept support:
{visual_context if visual_context else 'No source screenshots available.'}

Task:
Write a deep, concrete connection map. Do NOT write advice such as "look for repeated terms". Actually identify the real connections.

For each connection point, include:
1. Connection point title
2. Core question this connection answers
3. Shared idea
4. Source-by-source contribution table with columns: Source, What it contributes, How it connects, Specific evidence, Useful source image if relevant
5. Agreement / extension / tension
6. Why this connection matters for learning
7. How to use it in an exam or assignment

Quality rules:
- Produce at least 6 connection points when the source pack is large enough.
- Every connection must mention at least two sources.
- Use specific names, theories, studies, figures, slides, tables, laws, formulas, cases, or examples from the source cards.
- Use uploaded source screenshots as evidence only inside the relevant concept/example explanation.
- If a source has limited readable text, connect it through its title, visible slide/page evidence, or source screenshot, but label uncertainty clearly.
- Write in a professor-style teaching voice: concept → evidence → comparison → implication.
"""
    try:
        result = generate_chat([
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ], model=model_for_depth("comprehensive"), temperature=0, max_tokens=MULTISOURCE_CONNECTION_TOKENS).strip()
        if result and not is_refusal_or_useless_response(result) and count_readable_units(result) >= env_int("MULTISOURCE_CONNECTION_MIN_UNITS", 3500):
            result = re.sub(r"(?m)^#{1,4}\s*" + re.escape(labels["connection_heading"].lstrip("# ")) + r"\s*$", "", result).strip()
            return f"{labels['connection_heading']}\n\n{labels['connection_intro']}\n\n{result}"
    except Exception:
        return ""
    return ""


def assemble_worldclass_multisource_output(source_digest_block: str, connection_block: str, visual_block: str, synthesis: str, preferred_language: str) -> str:
    labels = worldclass_language_labels(preferred_language)
    parts = [
        labels["guide_title"],
        labels["intro"],
        labels["source_heading"],
        source_digest_block.strip(),
    ]
    if connection_block:
        parts.append(connection_block.strip())
    if visual_block:
        parts.append(visual_block.strip())
    clean_synthesis = synthesis.strip()
    clean_synthesis = re.sub(r"(?m)^#\s+.*Integrated Study Guide.*$", "", clean_synthesis).strip()
    if clean_synthesis:
        parts.append(f"{labels['synthesis_heading']}\n\n{clean_synthesis}")
    return "\n\n".join(part for part in parts if part).strip()


def generate_reference_style_multisource_notes(source_units: List[dict], preferred_language: str, depth_plan: dict) -> str:
    """v19 world-class multi-source + visual professor pipeline.

    Stage 1: Build deep source cards, with screenshots/images visible to the model.
    Stage 2: Generate visual argument cards from actual source screenshots.
    Stage 3: Generate explicit source-to-source connection points.
    Stage 4: Generate broader professor synthesis sections.
    Stage 5: Assemble into one study guide without compressing away details.
    """
    language_rule = language_instruction_for(preferred_language)
    source_digest_block = generate_source_digests_for_multisource(source_units, language_rule)
    if not source_digest_block or count_readable_units(source_digest_block) < 900:
        cards = []
        for idx, unit in enumerate(source_units or [], start=1):
            title = unit.get("title_candidate") or unit.get("display_name") or f"Source {idx}"
            excerpt = truncate_text(unit.get("text_excerpt") or "", env_int("MULTISOURCE_FALLBACK_EXCERPT_CHARS", 16000))
            cards.append(f"### Source {idx}: {title}\n\n#### Learning focus\n{excerpt if excerpt else 'Readable text was limited for this source. Use visual evidence where available.'}")
        source_digest_block = "\n\n".join(cards)

    visual_cards = generate_visual_argument_cards(source_units, source_digest_block, preferred_language)
    visual_block = visual_argument_markdown(visual_cards, preferred_language)
    connection_block = generate_connection_points_block(source_digest_block, source_units, preferred_language, visual_cards)
    synthesis = generate_multisource_synthesis_from_digests(source_digest_block, source_units, preferred_language, depth_plan)
    return assemble_worldclass_multisource_output(source_digest_block, connection_block, visual_block, synthesis, preferred_language)


def attach_visual_argument_section(summary: str, source_units: List[dict], preferred_language: str) -> str:
    """Ensure generated content itself contains source screenshots/visual cards.

    The visual gallery alone is not enough. This function appends inline visual
    markers and explanations into the notes, and stores card data on source_units
    for the front end to render the actual image at each marker.
    """
    summary = summary or ""
    source_digest_context = summary[:env_int("VISUAL_ARGUMENT_CONTEXT_CHARS", 50000)]
    cards = generate_visual_argument_cards(source_units, source_digest_context, preferred_language)
    if not cards:
        return summary
    # If markers already exist from cached notes, only rebuild card data.
    if "[[VISUAL:" in summary:
        return summary
    visual_block = visual_argument_markdown(cards, preferred_language)
    if not visual_block:
        return summary
    return (summary.rstrip() + "\n\n" + visual_block).strip()

# v19 compatibility override: supports newer chat models that may prefer
# max_completion_tokens or reject explicit temperature. This keeps the existing
# app code stable while allowing stronger models to be used in .env.
def generate_chat(messages: List[dict], model: str = CHAT_MODEL, temperature: float = 0, max_tokens: int = 4500) -> str:
    require_openai()
    models_to_try = [model]
    fallback_model = os.getenv("OPENAI_FALLBACK_MODEL", "gpt-4o-mini")
    if fallback_model and fallback_model not in models_to_try:
        models_to_try.append(fallback_model)

    last_error = None
    for model_name in models_to_try:
        attempts = [
            {"model": model_name, "messages": messages, "temperature": temperature, "max_tokens": max_tokens},
            {"model": model_name, "messages": messages, "max_tokens": max_tokens},
            {"model": model_name, "messages": messages, "temperature": temperature, "max_completion_tokens": max_tokens},
            {"model": model_name, "messages": messages, "max_completion_tokens": max_tokens},
        ]
        for kwargs in attempts:
            try:
                response = client.chat.completions.create(**kwargs)
                return response.choices[0].message.content or ""
            except Exception as error:
                last_error = error
                continue
    raise last_error if last_error else RuntimeError("OpenAI chat request failed")

# -----------------------------------------------------------------------------
# v20 WORLD-CLASS SOURCE-GROUNDED VISUAL PROFESSOR OVERRIDES
# -----------------------------------------------------------------------------
# These late definitions intentionally override earlier helper functions.
# Goal: multi-source analysis must not become a generic summary. It must:
# 1) deep-read every source, even visual-heavy PPT/PDF sources;
# 2) build explicit source-to-source connection points;
# 3) embed actual source screenshots/slides into the generated notes;
# 4) use the screenshots as evidence for arguments, not decoration.


def v20_visual_parts_count(unit: dict) -> int:
    count = 0
    for part in unit.get("visual_parts") or []:
        if isinstance(part, dict) and part.get("type") == "image_url":
            count += 1
    return count


def v20_source_has_visuals(unit: dict) -> bool:
    return v20_visual_parts_count(unit) > 0


def source_card_min_units(unit: dict) -> int:
    """v20: demand deeper source cards, especially for multi-source packs.

    Previous versions allowed slide-heavy sources to collapse into the sentence
    'Readable text was limited'. That is no longer acceptable when screenshots or
    embedded images are available: the model must inspect visuals and teach them.
    """
    text_len = len(unit.get("text_excerpt") or "")
    visual_bonus = v20_visual_parts_count(unit)
    if text_len >= 90000:
        return env_int("MULTISOURCE_LONG_CARD_MIN_UNITS", 3600)
    if text_len >= 35000:
        return env_int("MULTISOURCE_MEDIUM_CARD_MIN_UNITS", 2800)
    if text_len >= 8000:
        return env_int("MULTISOURCE_SHORT_CARD_MIN_UNITS", 1900)
    if visual_bonus:
        return env_int("MULTISOURCE_VISUAL_ONLY_CARD_MIN_UNITS", 1400)
    return env_int("MULTISOURCE_TINY_CARD_MIN_UNITS", 950)


def v20_source_visual_brief(unit: dict, limit: int = 8) -> str:
    rows = []
    for cand in iter_visual_candidates([unit])[:limit]:
        rows.append(f"- {cand.get('location')}: {cand.get('caption')}")
    return "\n".join(rows) if rows else "No visual candidates extracted."


def generate_individual_source_digest(index: int, unit: dict, language_rule: str) -> str:
    """v20: create a deep source card from text AND screenshots.

    Important change: if text extraction is weak but visuals exist, we still send
    the screenshots to the model and require a visual-led source card. This fixes
    PPT/PDF sources that previously appeared as 'Readable text was limited'.
    """
    excerpt_limit = env_int("MULTISOURCE_SOURCE_CARD_CHARS", 180000)
    excerpt = source_unit_text_excerpt(unit, limit=excerpt_limit)
    title = unit.get("title_candidate") or unit.get("display_name") or f"Source {index}"
    min_units = source_card_min_units(unit)
    visual_parts = source_unit_visual_parts(unit, MAX_VISUAL_IMAGES_PER_SOURCE)
    has_visuals = bool(visual_parts)

    if (not excerpt or len(excerpt) < 120) and not has_visuals:
        safe_title = title or f"Source {index}"
        return (
            f"### Source {index}: {safe_title}\n\n"
            f"#### Extraction status\nReadable text and usable visuals were limited for this source. "
            f"Use the filename/title cautiously and regenerate after providing a text-readable PDF/PPT export if possible.\n\n"
            f"#### Revision use\nTreat this source as low-confidence evidence until more text or visuals are available."
        )

    prompt = f"""
You are generating a DEEP professor-style source card for Source {index}.

Language requirement: {language_rule}
Never translate the product name Synapse.

This source card will be placed into a multi-source study guide. It must be detailed enough that a student can revise this source without reopening the original file.

Source identity:
- Source number: {index}
- Display name: {unit.get('display_name')}
- Title/topic: {title}
- Extracted text length: {len(excerpt)} characters
- Screenshot / image evidence count available to you: {v20_visual_parts_count(unit)}

Visual candidates extracted from this source:
{v20_source_visual_brief(unit)}

Reference style to imitate structurally:
{REFERENCE_STYLE_PROFILE}

Return markdown using this architecture. Localise headings into the selected language, but keep the academic depth:

### Source {index}: specific readable lecture/source title

#### Opening frame / central question
Identify the main question/problem this source is teaching. Make it specific, not generic.

#### Source structure / lecture flow
Walk through the source in order. Use actual slide/page titles, sections, cases, diagrams, tables, formulas, examples, or study sequence. If the source is a lecture, write it like detailed lecture notes.

#### Key concepts and definitions
Create a concept table. For each concept: definition, simple explanation, where it appears in this source, why it matters.

#### Important studies / examples / cases / calculations
For every important study/example/case/calculation, use:
- **Question:**
- **Method / process:**
- **Result / answer:**
- **Meaning:**
- **Exam use:**

#### Source images inside the concept notes
If screenshots/images are attached, explain useful diagrams/tables/graphs/slides inside the relevant concept, study, or example note. Do not create a standalone visual section.

#### What this source uniquely contributes
Explain the distinctive role of this source in the whole source pack: theory, evidence, method, case, mechanism, counterpoint, application, visual explanation, etc.

#### Connections to other sources in the pack
Predict explicit links to other sources. Use connection verbs: supports, extends, contrasts, complicates, applies, provides mechanism for, provides evidence for.

#### Common misunderstandings
Name realistic student mistakes and correct them. Make them source-specific.

#### Exam / revision use
Give revision priorities, likely question types, and what a high-scoring answer should include.

Depth rules:
- Do not output a basic summary.
- Use named researchers, theories, studies, examples, diagrams, slide titles, data tables, formulas, cases, and page/slide flow whenever visible.
- If the source is visual-heavy, use the screenshots as primary evidence.
- Minimum expected richness: {min_units} readable units.

Extracted text excerpt:
{truncate_text(excerpt, excerpt_limit) if excerpt else '[Text extraction was limited. Use the attached screenshots/images as the main evidence.]'}
"""

    def call(prompt_text: str, tokens: int) -> str:
        user_content = [{"type": "text", "text": prompt_text}] + visual_parts if visual_parts else prompt_text
        return generate_chat([
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ], model=model_for_depth("comprehensive"), temperature=0, max_tokens=tokens).strip()

    try:
        digest = call(prompt, MULTISOURCE_SOURCE_DIGEST_TOKENS)
        if digest and not is_refusal_or_useless_response(digest) and count_readable_units(digest) >= min_units:
            return digest

        repair_prompt = prompt + f"""

The previous source card was too short or too generic.
Rewrite it as a substantially deeper professor note.
Repair requirements:
- Keep the selected output language.
- If screenshots are attached, explain at least 3 visible slides/pages/images where possible.
- Add specific connection predictions to other sources.
- Add source-specific exam/revision guidance.
- Do not apologise and do not say the source is inaccessible if screenshots or text are present.
- Minimum readable units: {min_units}.
"""
        repaired = call(repair_prompt, max(MULTISOURCE_SOURCE_DIGEST_TOKENS, env_int("MULTISOURCE_SOURCE_REPAIR_TOKENS", 11000)))
        if repaired and not is_refusal_or_useless_response(repaired):
            # Return repaired even if slightly below threshold. A concrete but shorter card
            # is better than hiding source evidence behind a generic fallback.
            if count_readable_units(repaired) >= max(800, int(min_units * 0.55)):
                return repaired
        raise RuntimeError("source card was too short")
    except Exception:
        safe_excerpt = truncate_text(excerpt or "", env_int("MULTISOURCE_FALLBACK_EXCERPT_CHARS", 16000))
        visual_note = v20_source_visual_brief(unit, 10)
        return (
            f"### Source {index}: {title}\n\n"
            f"#### Preserved source evidence\n{safe_excerpt if safe_excerpt else 'Text extraction was limited.'}\n\n"
            f"#### Extracted visual evidence available\n{visual_note}\n\n"
            f"#### Revision use\nUse this preserved evidence and visual list when connecting this source to the rest of the uploaded pack."
        )


def generate_visual_argument_cards(source_units: List[dict], source_digest_block: str, preferred_language: str) -> List[dict]:
    """v20: create visual cards from real PDF/PPT screenshots and images.

    The card must explain: what the image shows, what argument it supports, and
    which other sources it connects to. This turns source screenshots into visual
    evidence inside the generated content.
    """
    existing = []
    for unit in source_units or []:
        existing.extend(unit.get("visual_argument_cards") or [])
    if existing:
        return existing

    labels = worldclass_language_labels(preferred_language)
    candidates = select_visual_candidates_for_argument(source_units, VISUAL_ARGUMENT_CARD_LIMIT)
    if not candidates:
        return []

    language_rule = language_instruction_for(preferred_language)
    context = truncate_text(source_digest_block or "\n\n".join(u.get("text_excerpt", "") for u in source_units or []), env_int("VISUAL_ARGUMENT_CONTEXT_CHARS", 90000))
    source_titles = "\n".join(
        f"Source {i}: {u.get('title_candidate') or u.get('display_name')}"
        for i, u in enumerate(source_units or [], start=1)
    )

    cards: List[dict] = []
    for idx, cand in enumerate(candidates):
        prompt = f"""
You are creating a visual evidence card for a world-class multi-source study guide.

Language requirement: {language_rule}
Never translate the product name Synapse.

You MUST inspect the attached screenshot/image from the uploaded source. Do not answer generically.

All sources in the pack:
{source_titles}

Current visual metadata:
- Visual number: {idx + 1}
- Source number: {cand.get('source_index')}
- Source title: {cand.get('source_title')}
- Location: {cand.get('location')}
- Caption/context extracted by system: {cand.get('caption')}

Relevant source-card context:
{context}

Return JSON only:
{{
  "title": "short, specific title for this visual",
  "what_shows": "describe exactly what is visible: labels, table columns, graph axes, diagram parts, experimental layout, comparison, formula, or slide structure",
  "argument_supported": "state the exact concept/claim/argument this visual supports inside its own source",
  "cross_source_connection": "connect this visual to at least one other source by source number/title and explain whether it supports, extends, contrasts, or provides mechanism/evidence",
  "how_to_read": "give step-by-step guidance for reading the visual",
  "exam_use": "explain how to use this visual as evidence in an exam/assignment answer"
}}
"""
        try:
            raw = generate_chat([
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": [{"type": "text", "text": prompt}, image_part_from_url(cand["url"])]},
            ], model=model_for_depth("comprehensive"), temperature=0, max_tokens=max(VISUAL_ARGUMENT_TOKENS, env_int("VISUAL_ARGUMENT_TOKENS", 1600)))
            parsed = extract_json_object(raw)
            if not parsed:
                card = fallback_visual_card(cand, idx, labels)
            else:
                card = {
                    "index": idx,
                    "source_index": cand.get("source_index"),
                    "source_title": cand.get("source_title", ""),
                    "location": cand.get("location", ""),
                    "caption": cand.get("caption", ""),
                    "url": cand.get("url", ""),
                    "title": parsed.get("title") or f"{labels['visual_card_title']} {idx + 1}",
                    "what_shows": parsed.get("what_shows") or cand.get("caption", ""),
                    "argument_supported": parsed.get("argument_supported") or "",
                    "cross_source_connection": parsed.get("cross_source_connection") or "",
                    "how_to_read": parsed.get("how_to_read") or "",
                    "exam_use": parsed.get("exam_use") or "",
                }
        except Exception:
            card = fallback_visual_card(cand, idx, labels)
        cards.append(card)

    # Store on first source unit so /analyze can return them to the frontend.
    if source_units:
        source_units[0]["visual_argument_cards"] = cards
    return cards


def visual_argument_markdown(cards: List[dict], preferred_language: str) -> str:
    labels = worldclass_language_labels(preferred_language)
    if not cards:
        return ""
    chunks = [f"{labels['visual_heading']}\n\n{labels['visual_intro']}"]
    for i, card in enumerate(cards):
        chunks.append(
            f"### {labels['visual_card_title']} {i + 1}: {card.get('title', '')}\n\n"
            f"[[VISUAL:{i}]]\n\n"
            f"**{labels['source_label']}:** Source {card.get('source_index', '')} — {card.get('source_title', '')} ({card.get('location', '')})\n\n"
            f"**{labels['what_shows']}:** {card.get('what_shows', '')}\n\n"
            f"**{labels['argument']}:** {card.get('argument_supported', '')}\n\n"
            f"**{labels['connection']}:** {card.get('cross_source_connection', '')}\n\n"
            f"**{labels['how_to_read']}:** {card.get('how_to_read', '')}\n\n"
            f"**{labels['exam_use']}:** {card.get('exam_use', '')}"
        )
    return "\n\n".join(chunks).strip()


def generate_connection_points_block(source_digest_block: str, source_units: List[dict], preferred_language: str, visual_cards: Optional[List[dict]] = None) -> str:
    """v20: produce actual source-to-source connection points, not advice.

    Earlier outputs said things like 'look for repeated terms'. This function now
    forces concrete source roles, evidence, visual argument links, and source-by-
    source contribution tables.
    """
    if len(source_units or []) < 2 or not source_digest_block:
        return ""
    labels = worldclass_language_labels(preferred_language)
    language_rule = language_instruction_for(preferred_language)
    source_list = "\n".join(
        f"Source {i}: {u.get('title_candidate') or u.get('display_name')}"
        for i, u in enumerate(source_units, start=1)
    )
    visual_context = "\n".join(
        f"Visual {i+1}: Source {c.get('source_index')} {c.get('location')} — {c.get('title')} — argument: {c.get('argument_supported')} — connection: {c.get('cross_source_connection')}"
        for i, c in enumerate(visual_cards or [])
    )

    prompt = f"""
You are writing the CENTRAL section of Synapse: explicit cross-source connection points.

Language requirement: {language_rule}
Never translate Synapse.

Sources:
{source_list}

Detailed source cards:
{truncate_text(source_digest_block, env_int('MULTISOURCE_DIGEST_CONTEXT_CHARS', 420000))}

Visual evidence cards available:
{visual_context if visual_context else 'No visual cards available.'}

Your task is NOT to give advice about finding connections. Your task is to actually identify and explain the real connections.

Write a deep connection map with at least {env_int('MULTISOURCE_REQUIRED_CONNECTION_POINTS', 7)} major connection points if the source pack supports it.

For EACH connection point, use this exact architecture:

### Connection Point X: specific conceptual title

**Core question:** What bigger course question does this connection answer?

**Shared idea:** Explain the idea in professor-level detail.

**Source-by-source contribution table:**
| Source | What it contributes | How it connects | Specific evidence | Useful source image |
|---|---|---|---|---|

**Agreement / extension / tension:** Explain whether sources agree, extend one another, contrast, or complicate the topic.

**Image-supported explanation:** If a source screenshot/slide/table/diagram supports this connection, explain it directly as part of the concept. Do not create a separate visual section.

**Why it matters:** Explain why this connection changes the student's understanding.

**Exam / assignment use:** Give a sentence frame or answer strategy using multiple sources.

Quality rules:
- Every connection point must mention at least two sources.
- Across the section, every uploaded source should appear at least once unless it has no readable text or usable source screenshot.
- Use names, theories, studies, cases, formulas, page/slide visuals, tables, diagrams, examples, or sections from the source cards.
- Do not write generic lines such as 'these sources all discuss psychology'.
- Prefer specific relationships: Source A provides mechanism; Source B provides evolutionary explanation; Source C provides developmental evidence; Source D provides method/measurement; Source E provides an image-supported example.
- If a source has limited readable text, connect it through visible screenshots, slide titles, or filename/title, and label uncertainty.
"""

    def call_connection(p: str, tokens: int) -> str:
        return generate_chat([
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": p},
        ], model=model_for_depth("comprehensive"), temperature=0, max_tokens=tokens).strip()

    try:
        result = call_connection(prompt, max(MULTISOURCE_CONNECTION_TOKENS, env_int("MULTISOURCE_CONNECTION_TOKENS", 16000)))
        if result and not is_refusal_or_useless_response(result):
            units = count_readable_units(result)
            has_tables = result.count("|") >= 20
            has_connections = len(re.findall(r"Connection Point|连接点|連接點|共同|connection", result, flags=re.I)) >= 3
            if units >= env_int("MULTISOURCE_CONNECTION_MIN_UNITS", 3200) and (has_tables or has_connections):
                result = re.sub(r"(?m)^#{1,4}\s*" + re.escape(labels["connection_heading"].lstrip("# ")) + r"\s*$", "", result).strip()
                return f"{labels['connection_heading']}\n\n{labels['connection_intro']}\n\n{result}"

            repair_prompt = prompt + f"""

The previous connection map was too shallow or too short.
Rewrite with MORE SPECIFIC SOURCE-TO-SOURCE CONNECTIONS.
Mandatory repair:
- Do not explain how to find connections; write the connections themselves.
- Add source-by-source contribution tables.
- Use visual evidence cards where relevant.
- Mention every usable source at least once.
- Add at least 7 concrete connection points if possible.
"""
            repaired = call_connection(repair_prompt, max(MULTISOURCE_CONNECTION_TOKENS, env_int("MULTISOURCE_CONNECTION_REPAIR_TOKENS", 18000)))
            if repaired and not is_refusal_or_useless_response(repaired):
                repaired = re.sub(r"(?m)^#{1,4}\s*" + re.escape(labels["connection_heading"].lstrip("# ")) + r"\s*$", "", repaired).strip()
                return f"{labels['connection_heading']}\n\n{labels['connection_intro']}\n\n{repaired}"
    except Exception:
        pass

    # Deterministic but concrete fallback: source list + visual evidence list. This
    # is not as strong as the LLM connection map, but it avoids generic empty prose.
    visual_rows = "\n".join(
        f"| Visual {i+1} | Source {c.get('source_index')} | {c.get('location')} | {c.get('title')} | {c.get('argument_supported')} |"
        for i, c in enumerate(visual_cards or [])
    ) or "| No visual card | - | - | - | - |"
    fallback = f"""
### Connection Point 1: Source roles across the uploaded pack

**Core question:** What does each source contribute to the larger learning problem?

| Source | Likely role | How to connect it | Evidence basis |
|---|---|---|---|
"""
    for i, u in enumerate(source_units or [], start=1):
        title = u.get('title_candidate') or u.get('display_name') or f'Source {i}'
        visual_status = f"{v20_visual_parts_count(u)} extracted visuals" if v20_source_has_visuals(u) else "text/title evidence only"
        fallback += f"| Source {i} | {title} | Connect this source to repeated concepts, methods, examples, and visuals identified in the source card. | {visual_status} |\n"
    fallback += f"""

### Extracted visual evidence that should be used for arguments

| Visual | Source | Location | Visual title | Argument supported |
|---|---|---|---|---|
{visual_rows}
"""
    return f"{labels['connection_heading']}\n\n{labels['connection_intro']}\n\n{fallback.strip()}"


def assemble_worldclass_multisource_output(source_digest_block: str, connection_block: str, visual_block: str, synthesis: str, preferred_language: str) -> str:
    """v20 order: source notes -> visual evidence -> connection points -> synthesis."""
    labels = worldclass_language_labels(preferred_language)
    parts = [
        labels["guide_title"],
        labels["intro"],
        labels["source_heading"],
        source_digest_block.strip(),
    ]
    if visual_block:
        parts.append(visual_block.strip())
    if connection_block:
        parts.append(connection_block.strip())
    clean_synthesis = synthesis.strip()
    clean_synthesis = re.sub(r"(?m)^#\s+.*Integrated Study Guide.*$", "", clean_synthesis).strip()
    if clean_synthesis:
        parts.append(f"{labels['synthesis_heading']}\n\n{clean_synthesis}")
    return "\n\n".join(part for part in parts if part).strip()


def generate_reference_style_multisource_notes(source_units: List[dict], preferred_language: str, depth_plan: dict) -> str:
    """v20 source-grounded visual professor pipeline.

    Stage 1: Deep card for each source, using text + screenshots.
    Stage 2: Visual argument cards from actual PDF/PPT/page screenshots.
    Stage 3: Explicit source-to-source connection points.
    Stage 4: Broader professor synthesis.
    Stage 5: Assemble without compressing or removing visual evidence.
    """
    language_rule = language_instruction_for(preferred_language)
    source_digest_block = generate_source_digests_for_multisource(source_units, language_rule)
    if not source_digest_block or count_readable_units(source_digest_block) < 900:
        cards = []
        for idx, unit in enumerate(source_units or [], start=1):
            title = unit.get("title_candidate") or unit.get("display_name") or f"Source {idx}"
            excerpt = truncate_text(unit.get("text_excerpt") or "", env_int("MULTISOURCE_FALLBACK_EXCERPT_CHARS", 22000))
            visuals = v20_source_visual_brief(unit, 10)
            cards.append(
                f"### Source {idx}: {title}\n\n"
                f"#### Preserved text evidence\n{excerpt if excerpt else 'Readable text was limited.'}\n\n"
                f"#### Extracted visual evidence\n{visuals}"
            )
        source_digest_block = "\n\n".join(cards)

    visual_cards = generate_visual_argument_cards(source_units, source_digest_block, preferred_language)
    visual_block = visual_argument_markdown(visual_cards, preferred_language)
    connection_block = generate_connection_points_block(source_digest_block, source_units, preferred_language, visual_cards)
    synthesis = generate_multisource_synthesis_from_digests(source_digest_block, source_units, preferred_language, depth_plan)
    return assemble_worldclass_multisource_output(source_digest_block, connection_block, visual_block, synthesis, preferred_language)


def attach_visual_argument_section(summary: str, source_units: List[dict], preferred_language: str) -> str:
    """v20: guarantee inline visual evidence markers in generated content.

    If a multi-source answer was generated before v20 or returned without visual
    cards, this appends a visual evidence section with [[VISUAL:n]] markers that
    the frontend renders as actual screenshots/slides.
    """
    summary = summary or ""
    source_digest_context = summary[:env_int("VISUAL_ARGUMENT_CONTEXT_CHARS", 90000)]
    cards = generate_visual_argument_cards(source_units, source_digest_context, preferred_language)
    if not cards:
        return summary
    if "[[VISUAL:" in summary:
        return summary
    visual_block = visual_argument_markdown(cards, preferred_language)
    if not visual_block:
        return summary
    return (summary.rstrip() + "\n\n" + visual_block).strip()


# -----------------------------------------------------------------------------
# v21 Token Optimisation Layer
# -----------------------------------------------------------------------------
# This layer reduces unnecessary API cost WITHOUT reducing study-guide depth.
# It does not minify the final user-facing notes. It only optimises:
#   1) internal model prompts, especially stable system prompts;
#   2) internal JSON outputs such as mind-map JSON and visual-card JSON;
#   3) cache storage / network payload size;
#   4) observability of token usage.
# Final generated content remains readable and detailed.

TOKEN_OPTIMIZATION_ENABLED = (os.getenv("ENABLE_TOKEN_OPTIMIZATION", "true").lower() not in {"0", "false", "no"})
COMPACT_SYSTEM_PROMPTS = (os.getenv("COMPACT_SYSTEM_PROMPTS", "true").lower() not in {"0", "false", "no"})
MINIFY_MODEL_JSON = (os.getenv("MINIFY_MODEL_JSON", "true").lower() not in {"0", "false", "no"})
MINIFY_CACHE_JSON = (os.getenv("MINIFY_CACHE_JSON", "true").lower() not in {"0", "false", "no"})
LOG_TOKEN_USAGE = (os.getenv("LOG_TOKEN_USAGE", "true").lower() not in {"0", "false", "no"})
ADD_JSON_MINIFY_HINT = (os.getenv("ADD_JSON_MINIFY_HINT", "true").lower() not in {"0", "false", "no"})

TOKEN_USAGE_WINDOW: List[dict] = []
TOKEN_USAGE_WINDOW_LIMIT = env_int("TOKEN_USAGE_WINDOW_LIMIT", 60)

_JSON_MINIFY_RULE = (
    "When the required output is JSON, return ONLY valid minified JSON on one line: "
    "no markdown fences, no comments, no indentation, no unnecessary whitespace. "
    "Use compact keys only when the schema already allows them."
)


def _v21_is_json_task(messages: List[dict]) -> bool:
    """Detect internal JSON-generation tasks so we can add a minified-JSON rule.

    We intentionally do not apply this to normal study-guide generation because
    user-facing content must remain readable.
    """
    try:
        combined = "\n".join(str(m.get("content", "")) for m in messages if isinstance(m, dict))
    except Exception:
        return False
    lowered = combined.lower()
    return (
        "strict json" in lowered
        or "valid json" in lowered
        or "json object" in lowered
        or "return json" in lowered
        or "mind map json" in lowered
        or "visual evidence card" in lowered and '"title"' in combined
    )


def _v21_compact_instruction_text(text: str) -> str:
    """Compact only instruction text, not source excerpts.

    This removes repeated blank lines and extra spaces from stable instructions,
    which helps exact-prefix prompt caching and reduces input tokens. It avoids
    rewriting mathematical/source content by applying mostly to system messages.
    """
    if not text or not TOKEN_OPTIMIZATION_ENABLED or not COMPACT_SYSTEM_PROMPTS:
        return text
    text = str(text).replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _v21_compact_message_content(content):
    """Compact system strings and text parts while preserving images.

    Multimodal image parts are passed through unchanged. User text containing
    long source excerpts is preserved more carefully; only excessive blank lines
    are trimmed to avoid damaging slide structure.
    """
    if isinstance(content, str):
        return _v21_compact_instruction_text(content)
    if isinstance(content, list):
        new_parts = []
        for part in content:
            if not isinstance(part, dict):
                new_parts.append(part)
                continue
            if part.get("type") == "text":
                value = str(part.get("text", ""))
                value = value.replace("\r\n", "\n").replace("\r", "\n")
                # Preserve source/slide line breaks, but remove very excessive gaps.
                value = re.sub(r"\n{4,}", "\n\n", value).strip()
                new_part = {**part, "text": value}
                new_parts.append(new_part)
            else:
                new_parts.append(part)
        return new_parts
    return content


def _v21_optimise_messages(messages: List[dict]) -> List[dict]:
    if not TOKEN_OPTIMIZATION_ENABLED:
        return messages
    optimised = []
    for message in messages:
        if not isinstance(message, dict):
            optimised.append(message)
            continue
        role = message.get("role")
        content = message.get("content")
        # Compact system/developer prompts aggressively. Preserve user sources more.
        if role in {"system", "developer"}:
            content = _v21_compact_message_content(content)
        elif isinstance(content, list):
            content = _v21_compact_message_content(content)
        elif isinstance(content, str):
            content = re.sub(r"\n{4,}", "\n\n", content).strip()
        optimised.append({**message, "content": content})

    if MINIFY_MODEL_JSON and ADD_JSON_MINIFY_HINT and _v21_is_json_task(optimised):
        # Put the rule at the beginning so it can benefit from prompt caching.
        optimised = [{"role": "system", "content": _JSON_MINIFY_RULE}] + optimised
    return optimised


def _v21_record_usage(response, model_name: str, purpose: str = "chat") -> None:
    if not LOG_TOKEN_USAGE:
        return
    try:
        usage = getattr(response, "usage", None)
        if usage is None:
            return
        item = {
            "ts": int(time.time()),
            "purpose": purpose,
            "model": model_name,
            "prompt_tokens": getattr(usage, "prompt_tokens", None),
            "completion_tokens": getattr(usage, "completion_tokens", None),
            "total_tokens": getattr(usage, "total_tokens", None),
        }
        TOKEN_USAGE_WINDOW.append(item)
        del TOKEN_USAGE_WINDOW[:-TOKEN_USAGE_WINDOW_LIMIT]
        print(
            f"[token-usage] model={model_name} prompt={item['prompt_tokens']} "
            f"completion={item['completion_tokens']} total={item['total_tokens']}",
            flush=True,
        )
    except Exception:
        return


# Override existing helper. Keeps backwards compatibility with old calls.
def generate_chat(messages: List[dict], model: str = CHAT_MODEL, temperature: float = 0, max_tokens: int = 4500) -> str:
    if client is None:
        raise RuntimeError("OPENAI_API_KEY is not configured. Add it to backend/.env and restart the backend.")

    model_name = model or CHAT_MODEL
    optimised_messages = _v21_optimise_messages(messages)

    # Some newer models may reject temperature or prefer max_completion_tokens.
    # Try several compatible payload shapes, preserving the previous robustness.
    payloads = [
        {"model": model_name, "messages": optimised_messages, "temperature": temperature, "max_tokens": max_tokens},
        {"model": model_name, "messages": optimised_messages, "max_tokens": max_tokens},
        {"model": model_name, "messages": optimised_messages, "temperature": temperature, "max_completion_tokens": max_tokens},
        {"model": model_name, "messages": optimised_messages, "max_completion_tokens": max_tokens},
    ]
    last_error = None
    for kwargs in payloads:
        try:
            response = client.chat.completions.create(**kwargs)
            _v21_record_usage(response, model_name)
            content = response.choices[0].message.content or ""
            # If the task is JSON and the model still pretty-printed JSON, compact it.
            if MINIFY_MODEL_JSON and _v21_is_json_task(optimised_messages):
                try:
                    parsed = extract_json_object(content)
                    if isinstance(parsed, dict):
                        return json.dumps(parsed, ensure_ascii=False, separators=(",", ":"))
                except Exception:
                    pass
            return content
        except Exception as exc:
            last_error = exc
            msg = str(exc).lower()
            if "temperature" in msg or "max_tokens" in msg or "max_completion_tokens" in msg or "unsupported" in msg:
                continue
            raise
    raise last_error if last_error else RuntimeError("OpenAI request failed.")


# Override cache writer to avoid bloated indent whitespace in stored JSON.
def save_analysis_cache(cache: dict) -> None:
    try:
        now = time.time()
        cleaned = {}
        for key, value in (cache or {}).items():
            if not isinstance(value, dict):
                continue
            ts = float(value.get("created_at", now))
            if now - ts <= ANALYSIS_CACHE_TTL_SECONDS:
                cleaned[key] = value
        if MINIFY_CACHE_JSON:
            CACHE_PATH.write_text(json.dumps(cleaned, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        else:
            CACHE_PATH.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass


@app.get("/health/token-optimization")
def health_token_optimization():
    """Quick dashboard for checking whether token optimisation is active."""
    return {
        "status": "ok",
        "enabled": TOKEN_OPTIMIZATION_ENABLED,
        "compact_system_prompts": COMPACT_SYSTEM_PROMPTS,
        "minify_model_json": MINIFY_MODEL_JSON,
        "minify_cache_json": MINIFY_CACHE_JSON,
        "json_minify_hint": ADD_JSON_MINIFY_HINT,
        "log_token_usage": LOG_TOKEN_USAGE,
        "recent_usage": TOKEN_USAGE_WINDOW[-10:],
        "cache_file": str(CACHE_PATH),
        "cache_version": CACHE_VERSION,
        "note": "Final user-facing study guides are not minified; only internal JSON/prompts/cache are optimised.",
    }

# -----------------------------------------------------------------------------
# v22 Controlled Inline Visual Professor Mode
# -----------------------------------------------------------------------------
# Purpose:
# - Keep the existing HTML/CSS/loading animation unchanged.
# - Shorten waiting time by replacing the old multi-pass source-card + synthesis
#   pipeline with a controlled one-pass study guide plus one batched visual pass.
# - Put useful PDF/PPT visuals directly inside the generated content with
#   [[VISUAL:n]] markers; the existing frontend renderer turns those markers into
#   inline image cards.
# - Prefer fewer, better visuals and tighter writing over endless generation.

CONTROLLED_INLINE_VISUAL_MODE = os.getenv("CONTROLLED_INLINE_VISUAL_MODE", "true").lower() not in {"0", "false", "no"}
CONTROLLED_MAX_VISUALS = max(1, env_int("CONTROLLED_MAX_VISUALS", 5))
CONTROLLED_MAX_SOURCE_CONTEXT_CHARS = env_int("CONTROLLED_MAX_SOURCE_CONTEXT_CHARS", 110000)
CONTROLLED_MAX_CHARS_PER_SOURCE = env_int("CONTROLLED_MAX_CHARS_PER_SOURCE", 18000)
CONTROLLED_OUTPUT_TOKENS = env_int("CONTROLLED_OUTPUT_TOKENS", 9000)
CONTROLLED_VISUAL_CARD_TOKENS = env_int("CONTROLLED_VISUAL_CARD_TOKENS", 2200)
CONTROLLED_VISUAL_RENDER_DPI = env_int("CONTROLLED_VISUAL_RENDER_DPI", 115)
CONTROLLED_MAX_PDF_PAGES_PER_SOURCE = env_int("CONTROLLED_MAX_PDF_PAGES_PER_SOURCE", 6)
CONTROLLED_MAX_PPTX_SLIDES_PER_SOURCE = env_int("CONTROLLED_MAX_PPTX_SLIDES_PER_SOURCE", 6)
CONTROLLED_INCLUDE_SOURCE_CARDS = os.getenv("CONTROLLED_INCLUDE_SOURCE_CARDS", "false").lower() not in {"0", "false", "no"}

# Move runtime cache outside backend/ so uvicorn --reload does not restart after
# cache writes. This prevents the common "tokens spent but frontend failed" bug.
try:
    PROJECT_ROOT = BACKEND_DIR.parent
    RUNTIME_DIR = PROJECT_ROOT / ".synapse_runtime"
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_PATH = RUNTIME_DIR / "synapse_analysis_cache.json"
except Exception:
    pass


def _v22_visual_rank_keywords() -> List[str]:
    return [
        "figure", "fig.", "table", "graph", "chart", "diagram", "model", "results", "data", "comparison",
        "compare", "versus", "vs", "experiment", "method", "procedure", "effect", "mechanism", "process",
        "steps", "study", "case", "example", "formula", "calculation", "matrix", "boxplot", "scatter",
        "bar graph", "line graph", "distribution", "brain", "neuron", "synapse", "action potential", "resting potential",
        "mri", "fmri", "eeg", "heritability", "genotype", "phenotype", "pku", "maoa", "chimpanzee", "bonobo",
        "dictator", "ultimatum", "language", "tool", "natural selection", "图", "表", "统计", "数据", "曲线", "坐标",
        "模型", "实验", "研究", "结果", "对比", "比較", "机制", "機制", "步骤", "步驟", "案例", "公式",
    ]


def score_visual_text(text: str, index: int = 0) -> int:
    """v22 override: rank visuals for teaching value, not just early-page position."""
    value = normalise_space(text or "").lower()
    score = 0
    for kw in _v22_visual_rank_keywords():
        if kw in value:
            score += 4
    if 80 <= len(value) <= 1100:
        score += 3
    if len(value) > 1100:
        score += 1
    if index == 0:
        score += 1
    if len(value) < 35 and index != 0:
        score -= 4
    if re.search(r"\b(overview|agenda|outline|today|contents|learning objective)s?\b", value):
        score -= 1
    return score


def selected_indices_by_score(texts: List[str], limit: int) -> List[int]:
    """v22 override: select a small, high-value spread of pages/slides."""
    if not texts or limit <= 0:
        return []
    scored = [(score_visual_text(text, i), i) for i, text in enumerate(texts)]
    selected: List[int] = []
    # Include the first page/slide only when there is enough visual budget.
    if limit >= 3 and texts:
        selected.append(0)
    for _, idx in sorted(scored, key=lambda pair: (-pair[0], pair[1])):
        if idx not in selected:
            selected.append(idx)
        if len(selected) >= limit:
            break
    return sorted(selected)


def _v22_resize_image_bytes(data: bytes, content_type: str = "image/jpeg", max_width: int = 1280, quality: int = 78) -> Tuple[bytes, str]:
    """Compress visual payloads before sending to the model/frontend."""
    try:
        from PIL import Image
        img = Image.open(BytesIO(data)).convert("RGB")
        if img.width > max_width:
            ratio = max_width / float(img.width)
            img = img.resize((max_width, max(1, int(img.height * ratio))))
        out = BytesIO()
        img.save(out, format="JPEG", quality=quality, optimize=True)
        return out.getvalue(), "image/jpeg"
    except Exception:
        return data, content_type or "image/jpeg"


def image_part_from_bytes(data: bytes, content_type: str = "image/jpeg"):
    """v22 override: keep visual payloads smaller without changing frontend code."""
    data, content_type = _v22_resize_image_bytes(data, content_type)
    encoded = base64.b64encode(data).decode("utf-8")
    return {"type": "image_url", "image_url": {"url": f"data:{content_type};base64,{encoded}"}}


def render_pdf_visual_parts(data: bytes, source_name: str, max_pages: Optional[int] = None) -> List[dict]:
    """v22 override: render only the best few PDF pages for inline evidence."""
    if fitz is None:
        return []
    requested_pages = int(max_pages or MAX_VISUAL_IMAGES_PER_SOURCE)
    max_pages = min(max(requested_pages, CONTROLLED_MAX_PDF_PAGES_PER_SOURCE), CONTROLLED_MAX_PDF_PAGES_PER_SOURCE)
    if max_pages <= 0:
        return []
    parts: List[dict] = []
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        page_texts = []
        for page in doc:
            try:
                page_texts.append(page.get_text("text") or "")
            except Exception:
                page_texts.append("")
        selected = selected_indices_by_score(page_texts, max_pages)
        matrix = fitz.Matrix(max(1.0, CONTROLLED_VISUAL_RENDER_DPI / 72), max(1.0, CONTROLLED_VISUAL_RENDER_DPI / 72))
        for idx in selected:
            page = doc.load_page(idx)
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            img_bytes = pix.tobytes("jpeg")
            preview = truncate_text(normalise_space(page_texts[idx] if idx < len(page_texts) else ""), 520)
            label = (
                f"IN-TEXT SOURCE FIGURE FROM {source_name} — PDF page {idx + 1}. "
                f"Actual source screenshot selected for its likely diagram/table/chart/figure value. "
                f"Page text preview: {preview}"
            )
            parts.append({"type": "text", "text": label})
            parts.append(image_part_from_bytes(img_bytes, "image/jpeg"))
        doc.close()
    except Exception:
        return []
    return parts


def render_pptx_slide_screenshots(data: bytes, source_name: str, slide_texts: List[str], max_slides: int) -> List[dict]:
    """v22 override: optional full-slide screenshots, capped hard to avoid long waits."""
    if not ENABLE_PPTX_SLIDE_RENDER or fitz is None:
        return []
    soffice = find_libreoffice_binary()
    if not soffice:
        return []
    requested_slides = int(max_slides or MAX_VISUAL_IMAGES_PER_SOURCE)
    max_slides = min(max(requested_slides, CONTROLLED_MAX_PPTX_SLIDES_PER_SOURCE), CONTROLLED_MAX_PPTX_SLIDES_PER_SOURCE)
    if max_slides <= 0:
        return []
    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        pptx_path = tmpdir / "input.pptx"
        pptx_path.write_bytes(data)
        try:
            import subprocess
            subprocess.run(
                [soffice, "--headless", "--convert-to", "pdf", "--outdir", str(tmpdir), str(pptx_path)],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=35,
            )
        except Exception:
            return []
        pdf_candidates = list(tmpdir.glob("*.pdf"))
        if not pdf_candidates:
            return []
        try:
            doc = fitz.open(str(pdf_candidates[0]))
            selected = selected_indices_by_score(slide_texts or ["" for _ in range(len(doc))], max_slides)
            selected = [i for i in selected if i < len(doc)] or list(range(min(max_slides, len(doc))))
            matrix = fitz.Matrix(max(1.0, CONTROLLED_VISUAL_RENDER_DPI / 72), max(1.0, CONTROLLED_VISUAL_RENDER_DPI / 72))
            parts: List[dict] = []
            for idx in selected:
                page = doc.load_page(idx)
                pix = page.get_pixmap(matrix=matrix, alpha=False)
                img_bytes = pix.tobytes("jpeg")
                preview = truncate_text(normalise_space(slide_texts[idx] if idx < len(slide_texts) else ""), 520)
                label = (
                    f"IN-TEXT SOURCE FIGURE FROM {source_name} — PPT slide {idx + 1}. "
                    f"Actual rendered slide screenshot selected for diagram/table/chart/figure value. "
                    f"Slide text preview: {preview}"
                )
                parts.append({"type": "text", "text": label})
                parts.append(image_part_from_bytes(img_bytes, "image/jpeg"))
            doc.close()
            return parts
        except Exception:
            return []


def balanced_source_excerpt(text: str, budget: int) -> str:
    """Keep long sources representative without sending the entire file."""
    value = (text or "").strip()
    budget = max(1200, int(budget or 0))
    if len(value) <= budget:
        return value

    signal_pattern = re.compile(
        r"\b(table|figure|fig\.|graph|chart|plot|correlation|experiment|study|results?|data|mean|median|"
        r"percentage|rate|comparison|versus|vs|method|sample|case|example|formula|calculation|"
        r"genotype|phenotype|heritability|maoa|pku|gwas|flynn|iq|twin|ultimatum|dictator|chimp|bonobo)\b"
        r"|图|表|数据|实验|结果|对比|案例|公式|基因|遗传|相关",
        flags=re.I,
    )
    seen = set()
    signal_blocks: List[str] = []
    for block in re.split(r"\n{2,}", value):
        clean = normalise_space(block)
        if len(clean) < 50 or not signal_pattern.search(clean):
            continue
        key = sha256_text(clean[:600])
        if key in seen:
            continue
        seen.add(key)
        signal_blocks.append(truncate_text(block.strip(), 900))
        if len("\n\n".join(signal_blocks)) >= int(budget * 0.38):
            break

    signal_text = truncate_text("\n\n".join(signal_blocks), int(budget * 0.38)) if signal_blocks else ""
    remaining = budget - len(signal_text) - 220
    if remaining < 2400:
        return truncate_text(value, budget)

    head_len = max(700, remaining // 3)
    mid_len = max(700, remaining // 3)
    tail_len = max(700, remaining - head_len - mid_len)
    midpoint = max(0, len(value) // 2 - mid_len // 2)

    chunks = [
        "[Opening excerpt]\n" + value[:head_len].strip(),
    ]
    if signal_text:
        chunks.append("[High-signal source excerpts: tables, figures, studies, examples]\n" + signal_text.strip())
    chunks.extend([
        "[Middle excerpt]\n" + value[midpoint: midpoint + mid_len].strip(),
        "[Ending excerpt]\n" + value[-tail_len:].strip(),
    ])
    return truncate_text("\n\n".join(chunk for chunk in chunks if chunk.strip()), budget)


def _v22_source_context(source_units: List[dict]) -> str:
    """Balanced source context so every source is represented without huge prompts."""
    units = source_units or []
    if not units:
        return ""
    total_budget = CONTROLLED_MAX_SOURCE_CONTEXT_CHARS
    per_source = max(5000, min(CONTROLLED_MAX_CHARS_PER_SOURCE, total_budget // max(1, len(units))))
    blocks = []
    for i, unit in enumerate(units, start=1):
        title = unit.get("title_candidate") or unit.get("display_name") or f"Source {i}"
        text = balanced_source_excerpt(unit.get("text_excerpt") or "", per_source)
        visual_count = len([p for p in unit.get("visual_parts") or [] if isinstance(p, dict) and p.get("type") == "image_url"])
        blocks.append(
            f"SOURCE {i}: {title}\n"
            f"File/name: {unit.get('display_name', '')}\n"
            f"Visuals extracted: {visual_count}\n"
            f"Text excerpt:\n{text if text else '[No readable text excerpt; rely on title/source figures if available.]'}"
        )
    return "\n\n---\n\n".join(blocks)


def _v22_parse_visual_cards(raw: str, candidates: List[dict], labels: dict) -> List[dict]:
    parsed = extract_json_object(raw)
    cards_raw = []
    if isinstance(parsed, dict):
        value = parsed.get("cards")
        if isinstance(value, list):
            cards_raw = value
        elif all(k in parsed for k in ("title", "what_shows")):
            cards_raw = [parsed]
    cards: List[dict] = []
    for idx, cand in enumerate(candidates):
        item = cards_raw[idx] if idx < len(cards_raw) and isinstance(cards_raw[idx], dict) else {}
        card = {
            "index": idx,
            "source_index": cand.get("source_index"),
            "source_title": cand.get("source_title", ""),
            "location": cand.get("location", ""),
            "caption": cand.get("caption", ""),
            "url": cand.get("url", ""),
            "title": normalise_space(item.get("title") or f"{labels['visual_card_title']} {idx + 1}"),
            "what_shows": normalise_space(item.get("what_shows") or cand.get("caption", "")),
            "argument_supported": normalise_space(item.get("argument_supported") or "This visual provides direct evidence from the uploaded material."),
            "cross_source_connection": normalise_space(item.get("cross_source_connection") or "Use this visual to connect the source's concrete evidence to the wider study theme."),
            "how_to_read": normalise_space(item.get("how_to_read") or "Read the title/labels first, then identify what is compared, sequenced, measured, or illustrated."),
            "exam_use": normalise_space(item.get("exam_use") or "Use it as visual evidence when explaining or comparing the concept."),
        }
        cards.append(card)
    return cards


def generate_visual_argument_cards(source_units: List[dict], source_digest_block: str, preferred_language: str) -> List[dict]:
    """v22 override: one batched visual-analysis call instead of one API call per image."""
    existing = []
    for unit in source_units or []:
        existing.extend(unit.get("visual_argument_cards") or [])
    if existing:
        return existing

    labels = worldclass_language_labels(preferred_language)
    limit = max(0, min(CONTROLLED_MAX_VISUALS, VISUAL_ARGUMENT_CARD_LIMIT, MAX_MULTI_SOURCE_VISUAL_IMAGES))
    candidates = select_visual_candidates_for_argument(source_units, limit)
    if not candidates:
        return []

    language_rule = language_instruction_for(preferred_language)
    context = truncate_text(source_digest_block or _v22_source_context(source_units), env_int("VISUAL_ARGUMENT_CONTEXT_CHARS", 35000))
    metadata = []
    for idx, cand in enumerate(candidates):
        metadata.append(
            f"Visual {idx}: Source {cand.get('source_index')} | {cand.get('source_title')} | "
            f"{cand.get('location')} | {cand.get('caption')}"
        )

    prompt = f"""
You are creating inline visual evidence cards for a study guide.

Language requirement: {language_rule}
Never translate the product name Synapse.

Task:
- Inspect each attached image/screenshot.
- Explain only useful information: diagram, table, graph, figure, statistical chart, experiment layout, formula, comparison, or important slide structure.
- Do not over-write. Each card must be concise but specific.
- Use the image as evidence inside the notes, not as decoration.

Source context:
{context}

Visual metadata:
{chr(10).join(metadata)}

Return JSON only, minified if possible:
{{"cards":[{{"title":"...","what_shows":"...","argument_supported":"...","cross_source_connection":"...","how_to_read":"...","exam_use":"..."}}]}}
The cards array must have exactly {len(candidates)} items and keep the same order as Visual 0, Visual 1, etc.
"""
    content = [{"type": "text", "text": prompt}]
    for idx, cand in enumerate(candidates):
        content.append({"type": "text", "text": f"Attached Visual {idx}: Source {cand.get('source_index')} — {cand.get('location')}"})
        content.append(image_part_from_url(cand["url"]))

    try:
        raw = generate_chat(
            [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": content}],
            model=model_for_depth("detailed"),
            temperature=0,
            max_tokens=CONTROLLED_VISUAL_CARD_TOKENS,
        )
        cards = _v22_parse_visual_cards(raw, candidates, labels)
    except Exception:
        cards = [fallback_visual_card(cand, idx, labels) for idx, cand in enumerate(candidates)]

    if source_units:
        source_units[0]["visual_argument_cards"] = cards
    return cards


def build_visual_gallery(source_units: List[dict]) -> List[dict]:
    """v22 override: frontend receives visual argument cards, not plain gallery images."""
    cards = []
    for unit in source_units or []:
        cards.extend(unit.get("visual_argument_cards") or [])
    if cards:
        return cards[:max(1, min(CONTROLLED_MAX_VISUALS, MULTISOURCE_VISUAL_GALLERY_LIMIT))]

    # Fallback raw gallery if no cards were generated.
    gallery: List[dict] = []
    max_items = max(1, min(CONTROLLED_MAX_VISUALS, MULTISOURCE_VISUAL_GALLERY_LIMIT))
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
                        "index": len(gallery),
                        "source_index": source_index,
                        "source_title": title,
                        "caption": label[:240] if label else f"In-text source figure from Source {source_index}",
                        "url": image_url,
                        "title": f"Source figure from {title}",
                        "what_shows": label[:320] if label else "Extracted source figure.",
                        "argument_supported": "Use this as direct support for the relevant concept in the notes.",
                        "cross_source_connection": "Connect this source figure to the relevant concept in the notes.",
                    })
                    if len(gallery) >= max_items:
                        return gallery
    return gallery


def _v22_visual_context_for_prompt(cards: List[dict]) -> str:
    lines = []
    for i, card in enumerate(cards or []):
        lines.append(
            f"Source figure {i}: Source {card.get('source_index')} {card.get('location')} | "
            f"Title: {card.get('title')} | Shows: {card.get('what_shows')} | "
            f"Argument: {card.get('argument_supported')} | Connection: {card.get('cross_source_connection')}"
        )
    return "\n".join(lines)


def _v22_ensure_visual_markers(summary: str, cards: List[dict], preferred_language: str) -> str:
    summary = summary or ""
    if not cards:
        return summary
    present = {int(x) for x in re.findall(r"\[\[VISUAL:(\d+)\]\]", summary)}
    missing = [i for i in range(len(cards)) if i not in present]
    if not missing:
        return summary
    labels = worldclass_language_labels(preferred_language)
    chunks = [summary.rstrip(), f"\n\n## {labels['visual_card_title']} in Context"]
    for i in missing:
        c = cards[i]
        chunks.append(
            f"\n\n### {c.get('title') or labels['visual_card_title']}\n\n"
            f"[[VISUAL:{i}]]\n\n"
            f"**{labels['what_shows']}:** {c.get('what_shows','')}\n\n"
            f"**{labels['argument']}:** {c.get('argument_supported','')}\n\n"
            f"**{labels['connection']}:** {c.get('cross_source_connection','')}"
        )
    return "".join(chunks).strip()


def generate_reference_style_multisource_notes(source_units: List[dict], preferred_language: str, depth_plan: dict) -> str:
    """v22 controlled multi-source notes: one visual pass + one final notes pass."""
    if not CONTROLLED_INLINE_VISUAL_MODE:
        # Safety: if disabled, fall back to the latest previous functions if present.
        return generate_multisource_synthesis_from_digests(
            generate_source_digests_for_multisource(source_units, language_instruction_for(preferred_language)),
            source_units,
            preferred_language,
            depth_plan,
        )

    language_rule = language_instruction_for(preferred_language)
    source_context = _v22_source_context(source_units)
    visual_cards = generate_visual_argument_cards(source_units, source_context, preferred_language)
    visual_context = _v22_visual_context_for_prompt(visual_cards)
    source_list = "\n".join(
        f"Source {i}: {u.get('title_candidate') or u.get('display_name')}"
        for i, u in enumerate(source_units or [], start=1)
    )

    source_card_rule = "" if CONTROLLED_INCLUDE_SOURCE_CARDS else "Do NOT create a long full card for every source. Mention every source, but prioritise integrated themes and evidence."
    prompt = f"""
You are Synapse, a controlled inline-visual professor note generator.

Language requirement: {language_rule}
Never translate the product name Synapse.

Goal:
Generate ONE complete study guide that is detailed but controlled. It should be useful within 3-5 minutes of generation, not an endless report.

Source list:
{source_list}

Balanced extracted source context:
{source_context}

Visual evidence cards created from actual uploaded PDF/PPT/image screenshots:
{visual_context if visual_context else 'No useful visual cards were extracted.'}

Non-negotiable output rules:
- Return final user-facing markdown directly.
- Length target: detailed but compact. Prefer strong paragraphs and tables over long repetition.
- Use the selected language for all headings and explanations.
- Identify real common ideas and connection points. Do not write advice about how to find them.
- Mention every source at least once if it has readable text or visual evidence.
- Use markdown tables for comparison, evidence matrix, methods/results, or concept differences.
- Images must be in the text, not only at the end. Insert [[VISUAL:n]] immediately after the paragraph/table that the visual supports.
- After each [[VISUAL:n]], explain in prose what it shows and how it supports the argument. Use Visual numbers only from 0 to {max(0, len(visual_cards)-1)}.
- {source_card_rule}
- For research/studies: use Question → Method → Result → Meaning.
- For technical/math content: use given info → formula → substitution → result → check.
- For law/policy: use purpose → definitions → duties/tests → consequences → example.
- Include at least one comparison table and one evidence/application table when the source supports it.
- Do not create a separate decorative visual gallery.
- If a visual is unclear, say exactly what can and cannot be read.

Required structure:
# Integrated Study Guide: specific topic title
## 1. Big Picture
## 2. Main Themes and Source Connections
## 3. Key Concepts, Evidence, and Examples
## 4. Visual Arguments Inside the Content
## 5. Comparison / Evidence Tables
## 6. Exam or Assignment Use
## 7. Common Misunderstandings

Quality standard:
The notes should feel like a smart tutor selected the most useful material, inserted the most useful source images in context, and explained them clearly. Shorter than the previous version, but not shallow.
"""
    try:
        result = generate_chat(
            [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
            model=model_for_depth("detailed"),
            temperature=0,
            max_tokens=CONTROLLED_OUTPUT_TOKENS,
        ).strip()
        if not result or is_refusal_or_useless_response(result) or count_readable_units(result) < env_int("CONTROLLED_MIN_OUTPUT_UNITS", 1200):
            raise RuntimeError("Controlled notes were too short or unusable.")
    except Exception:
        # Deterministic fallback that still returns useful notes and inline visual cards.
        labels = worldclass_language_labels(preferred_language)
        rows = []
        for i, unit in enumerate(source_units or [], start=1):
            title = unit.get("title_candidate") or unit.get("display_name") or f"Source {i}"
            excerpt = truncate_text(normalise_space(unit.get("text_excerpt") or ""), 850)
            rows.append(f"| Source {i} | {title} | {excerpt or 'Readable text limited; use extracted visuals if available.'} |")
        result = (
            f"# Integrated Study Guide\n\n"
            f"## 1. Big Picture\n\nThis source pack contains {len(source_units or [])} materials. Synapse extracted text and selected the most useful visuals for direct explanation.\n\n"
            f"## 2. Source Overview Table\n\n| Source | Topic | Useful evidence |\n|---|---|---|\n" + "\n".join(rows) + "\n\n"
            f"## 3. Inline Visual Arguments\n\n"
        )
        for i, card in enumerate(visual_cards or []):
            result += (
                f"### {card.get('title') or labels['visual_card_title']}\n\n[[VISUAL:{i}]]\n\n"
                f"**{labels['what_shows']}:** {card.get('what_shows','')}\n\n"
                f"**{labels['argument']}:** {card.get('argument_supported','')}\n\n"
                f"**{labels['connection']}:** {card.get('cross_source_connection','')}\n\n"
            )

    return enforce_thetawave_inline_note_format(result, visual_cards, preferred_language)


def attach_visual_argument_section(summary: str, source_units: List[dict], preferred_language: str) -> str:
    """v22 override: do not add a second visual section if final notes already use inline visuals."""
    summary = summary or ""
    cards = []
    for unit in source_units or []:
        cards.extend(unit.get("visual_argument_cards") or [])
    if not cards:
        cards = generate_visual_argument_cards(source_units, summary[:env_int("VISUAL_ARGUMENT_CONTEXT_CHARS", 35000)], preferred_language)
    if not cards:
        return summary
    return _v22_ensure_visual_markers(summary, cards, preferred_language)


@app.get("/health/v22")
def health_v22():
    return {
        "status": "ok",
        "mode": "controlled_inline_visual_professor",
        "html_css_changed": False,
        "controlled_inline_visual_mode": CONTROLLED_INLINE_VISUAL_MODE,
        "controlled_max_visuals": CONTROLLED_MAX_VISUALS,
        "controlled_output_tokens": CONTROLLED_OUTPUT_TOKENS,
        "controlled_max_source_context_chars": CONTROLLED_MAX_SOURCE_CONTEXT_CHARS,
        "controlled_visual_render_dpi": CONTROLLED_VISUAL_RENDER_DPI,
        "cache_path": str(CACHE_PATH),
        "note": "Uses fewer model calls, batched visual-card generation, and inline [[VISUAL:n]] markers rendered by the existing frontend.",
    }


# -----------------------------------------------------------------------------
# v23 Relevant In-Text Teaching Images
# -----------------------------------------------------------------------------
# The user wants images like textbook/lecture-note in-text figures: diagrams,
# data tables, charts, experiment sequences, and statistical evidence that help
# understanding. Decorative screenshots, title slides, logos, presenter photos,
# stock photos, and purely atmospheric images should be ignored whenever useful
# teaching visuals exist.

RELEVANT_VISUAL_MODE = os.getenv("RELEVANT_VISUAL_MODE", "true").lower() not in {"0", "false", "no"}
RELEVANT_VISUAL_POOL_LIMIT = env_int("RELEVANT_VISUAL_POOL_LIMIT", 10)
RELEVANT_VISUAL_MIN_SCORE = env_int("RELEVANT_VISUAL_MIN_SCORE", 8)
PDF_VISUAL_CANDIDATE_LIMIT = env_int("PDF_VISUAL_CANDIDATE_LIMIT", max(10, RELEVANT_VISUAL_POOL_LIMIT, CONTROLLED_MAX_PDF_PAGES_PER_SOURCE))
RICH_INLINE_MIN_OUTPUT_UNITS = env_int("RICH_INLINE_MIN_OUTPUT_UNITS", 3400)
ADVANCED_NOTES_MIN_TABLES = env_int("ADVANCED_NOTES_MIN_TABLES", 2)
ADVANCED_NOTES_MIN_HEADINGS = env_int("ADVANCED_NOTES_MIN_HEADINGS", 7)


def source_figure_labels(preferred_language: str) -> dict:
    key = normalise_language_key(preferred_language)
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        return {
            "figure_title": "来源图表",
            "visual_card_title": "来源图表",
            "what_shows": "图中/表中显示",
            "argument": "为什么放在这里",
            "connection": "和知识点的连接",
            "how_to_read": "阅读方法",
            "exam_use": "考试/复习用途",
        }
    if key == "traditional_chinese":
        return {
            "figure_title": "來源圖表",
            "visual_card_title": "來源圖表",
            "what_shows": "圖中/表中顯示",
            "argument": "為什麼放在這裡",
            "connection": "和知識點的連接",
            "how_to_read": "閱讀方法",
            "exam_use": "考試/複習用途",
        }
    return {
        "figure_title": "Source figure",
        "visual_card_title": "Source figure",
        "what_shows": "What the image shows",
        "argument": "Why it matters here",
        "connection": "Connection to the concept",
        "how_to_read": "How to read it",
        "exam_use": "Exam / revision use",
    }


def clean_source_figure_caption(text: str) -> str:
    value = normalise_space(text or "")
    value = re.sub(r"\b(?:IN-TEXT SOURCE FIGURE|VISUAL EVIDENCE)\s+FROM\s+.+?\s+—\s+", "", value, flags=re.I)
    value = re.sub(r"\b(?:PDF page|PPT slide|slide|page|p\.)\s*\d+\.?\s*", "", value, flags=re.I)
    value = re.sub(r"\b(?:Actual source screenshot|Actual rendered slide screenshot)\s+selected\s+for\s+.+?\.\s*", "", value, flags=re.I)
    value = re.sub(r"\bThis is an image extracted from the slide, not the full slide screenshot\.?\s*", "", value, flags=re.I)
    value = re.sub(r"\bTeaching-signal-count=\d+;\s*decorative-signal-count=\d+\.?\s*", "", value, flags=re.I)
    value = re.sub(r"\bImage-count=\d+;\s*drawing-count=\d+;\s*visual-score=-?\d+\.?\s*", "", value, flags=re.I)
    value = re.sub(r"\bUse only if the actual image is\b.*$", "", value, flags=re.I)
    value = re.sub(r"\b(?:Current slide text preview|Nearby slide context|Page text preview|Slide text preview)\s*:\s*", "", value, flags=re.I)
    return normalise_space(value)


def _v23_scoring_text(text: str) -> str:
    value = normalise_space(text or "")
    value = re.sub(r"^(?:IN-TEXT SOURCE FIGURE|VISUAL EVIDENCE)\s+FROM\s+.+?\s+—\s+", "", value, flags=re.I)
    value = re.sub(r"Use only if the image is .*?$", "", value, flags=re.I)
    value = re.sub(r"Use only if the actual image is .*?$", "", value, flags=re.I)
    value = re.sub(r"Actual source screenshot selected for .*? value\.", "", value, flags=re.I)
    value = re.sub(r"Actual rendered slide screenshot selected for .*? value\.", "", value, flags=re.I)
    value = re.sub(r"Teaching-signal-count=\d+;\s*decorative-signal-count=\d+\.", "", value, flags=re.I)
    value = re.sub(r"Image-count=\d+;\s*drawing-count=\d+;\s*visual-score=-?\d+\.", "", value, flags=re.I)
    value = re.sub(r"This is an image extracted from the slide, not the full slide screenshot\.", "", value, flags=re.I)
    return normalise_space(value)


def _v23_signal_counts(text: str) -> dict:
    value = _v23_scoring_text(text).lower()
    teaching_patterns = [
        r"\b(table|figure|fig\.|graph|chart|plot|diagram|schema|schematic|model|flow|process|timeline)\b",
        r"\b(map|anatomy|structure|cycle|pathway|network|framework|architecture|flowchart|decision tree)\b",
        r"\b(data|results?|statistics?|mean|median|weighted|correlation|axis|axes|distribution|percentage|rate)\b",
        r"\b(regression|histogram|boxplot|scatter|sample|cohort|survey|risk|ratio|odds|confidence interval|p[- ]?value)\b",
        r"\b(experiment|method|procedure|trial|task|condition|control|sample|participant|stimulus|response)\b",
        r"\b(case study|worked example|source evidence|primary evidence|dataset|measurement|variables?)\b",
        r"\b(event|habituation|observed|possible|impossible|violation|looking time|occlusion|screen|object permanence)\b",
        r"\b(ultimatum|dictator|proposer|responder|equal split|selfish split|fairness|chimp|banana|token|warfare mortality|bowles|gintis)\b",
        r"\b(formula|equation|calculation|matrix|vector|mri|fmri|eeg|bold|action potential|resting potential|synapse)\b",
        r"\b(comparison|compare|versus|vs|difference|contrast|mechanism|evidence|case study)\b",
        r"\b(gene|genotype|phenotype|allele|chromosome|dna|snp|maoa|pku|phenylketonuria|heritability|monozygotic|dizygotic|twin|iq|flynn|gwas|genome-wide|lewontin|maltreatment)\b",
        r"(图|表|图表|统计|数据|结果|实验|流程|步骤|机制|模型|公式|对比|比较|證據|證据|坐标|曲线)",
    ]
    decorative_patterns = [
        r"\b(title slide|cover|agenda|outline|contents|today|welcome|overview|learning objectives?)\b",
        r"\b(lecturer|professor|dr\.|email|contact|office|university|department|course code|canvas)\b",
        r"\b(photo|photograph|portrait|headshot|people|person|speaker|presenter|biography|about me)\b",
        r"\b(logo|brand|stock|getty|unsplash|image credit|copyright|decorative|background)\b",
        r"(封面|目录|大纲|学习目标|照片|头像|人物照|装饰|背景|作者|讲师|联系方式|邮箱|学校|标志)",
    ]
    teaching = sum(len(re.findall(pattern, value, flags=re.I)) for pattern in teaching_patterns)
    decorative = sum(len(re.findall(pattern, value, flags=re.I)) for pattern in decorative_patterns)
    return {"teaching": teaching, "decorative": decorative, "text_len": len(value)}


def _has_strong_visual_teaching_terms(value: str) -> bool:
    return bool(re.search(
        r"\b("
        r"table|figure|fig\.|graph|chart|plot|diagram|schema|schematic|map|timeline|flowchart|"
        r"data|results?|statistics?|mean|median|percentage|rate|regression|histogram|boxplot|scatter|distribution|axis|axes|"
        r"experiment|method|procedure|protocol|trial|task|condition|control|sample|participant|stimulus|response|measurement|"
        r"formula|equation|calculation|matrix|vector|model|mechanism|pathway|network|architecture|"
        r"process|flow|cycle|framework|structure|anatomy|comparison|compare|versus|vs|difference|contrast|"
        r"case study|worked example|source evidence|primary evidence|dataset|variables?|classification|taxonomy"
        r")\b|图|表|图表|统计|数据|结果|实验|流程|机制|模型|公式|地图|时间线|案例",
        value or "",
        flags=re.I,
    ))


def score_visual_text(text: str, index: int = 0) -> int:
    """v23 override: strongly prefer diagrams/data/figures and demote decoration."""
    counts = _v23_signal_counts(text)
    score = counts["teaching"] * 7 - counts["decorative"] * 8
    value = normalise_space(text or "").lower()
    if 60 <= counts["text_len"] <= 1200:
        score += 4
    if counts["text_len"] > 1200:
        score += 2
    if index == 0:
        score -= 3
    if "table" in value and re.search(r"\b(mean|median|rate|data|results?|percentage|weighted|arithmetic)\b", value):
        score += 10
    if re.search(r"\b(graph|chart|plot|diagram|schema|schematic|flowchart|map|timeline|model|mechanism|pathway|network)\b", value):
        score += 10
    if re.search(r"\b(regression|histogram|boxplot|scatter|distribution|axis|axes|confidence interval|p[- ]?value|odds ratio|risk ratio)\b", value):
        score += 12
    if re.search(r"\b(experiment|method|procedure|protocol|trial|task|condition|control|participant|stimulus|response|measurement)\b", value):
        score += 10
    if re.search(r"\b(formula|equation|calculation|matrix|model|simulation|worked example|case study)\b", value):
        score += 10
    if re.search(r"\b(comparison|compare|versus|vs|difference|contrast|classification|taxonomy|structure|anatomy)\b", value):
        score += 8
    if re.search(r"\b(habituation|possible event|impossible event|observed by all infants|violation)\b", value):
        score += 14
    if re.search(r"\b(ultimatum|dictator|equal split|selfish split|proposer|responder|fairness|chimp)\b", value):
        score += 16
    if re.search(r"\b(dna|chromosome|allele|locus|genotype|phenotype|homozygous|heterozygous|dominant|recessive)\b", value):
        score += 14
    if re.search(r"\b(maoa|warrior gene|maltreatment|childhood experience|antisocial|serotonin|dopamine)\b", value):
        score += 16
    if re.search(r"\b(heritability|monozygotic|dizygotic|identical twins?|adoption|shared genes|iq)\b", value):
        score += 14
    if re.search(r"\b(gwas|genome-wide|snp|single nucleotide polymorphisms?|association)\b", value):
        score += 16
    if re.search(r"\b(flynn effect|iq gain|lewontin|within-group|between-group|within vs between|different causes)\b", value):
        score += 16
    if re.search(r"\b(correlation|causation|scatter|height|weight|axis|axes)\b", value):
        score += 12
    if re.search(r"\b(title slide|cover|about me|lecturer|email|contact)\b", value):
        score -= 12
    if re.search(r"\b(learning objectives?|lecture plan|outline|agenda|overview checklist)\b", value) and not _has_strong_visual_teaching_terms(value):
        score = min(score - 60, -12)
    return score


def selected_indices_by_score(texts: List[str], limit: int) -> List[int]:
    """v23 override: no automatic cover slide; choose high-value teaching pages."""
    if not texts or limit <= 0:
        return []
    scored = [(score_visual_text(text, i), i) for i, text in enumerate(texts)]
    positive = [(score, idx) for score, idx in scored if score >= RELEVANT_VISUAL_MIN_SCORE]
    ranked = positive if positive else scored
    selected = [idx for _, idx in sorted(ranked, key=lambda pair: (-pair[0], pair[1]))[:limit]]
    return sorted(selected)


def pptx_table_to_markdown(table) -> str:
    rows: List[List[str]] = []
    try:
        for row in table.rows:
            cells = [normalise_space(cell.text).replace("|", "/") for cell in row.cells]
            if any(cells):
                rows.append(cells)
    except Exception:
        return ""
    if not rows:
        return ""
    width = max(len(row) for row in rows)
    rows = [row + [""] * (width - len(row)) for row in rows]
    lines = [
        "| " + " | ".join(rows[0]) + " |",
        "| " + " | ".join(["---"] * width) + " |",
    ]
    for row in rows[1:]:
        lines.append("| " + " | ".join(row) + " |")
    return "\n".join(lines)


def pptx_chart_to_text(shape, slide_index: int) -> str:
    try:
        if not getattr(shape, "has_chart", False):
            return ""
        chart = shape.chart
    except Exception:
        return ""
    title = ""
    try:
        if chart.has_title and chart.chart_title and chart.chart_title.text_frame:
            title = normalise_space(chart.chart_title.text_frame.text)
    except Exception:
        title = ""
    lines = [f"[PPT SLIDE {slide_index} CHART] {title}".strip()]
    try:
        for plot_index, plot in enumerate(chart.plots, start=1):
            try:
                categories = [normalise_space(str(category)) for category in plot.categories]
            except Exception:
                categories = []
            for series in plot.series:
                name = normalise_space(getattr(series, "name", "") or f"Series {plot_index}")
                try:
                    values = list(series.values)
                except Exception:
                    values = []
                if categories and values and len(categories) == len(values):
                    lines.append(f"- {name}: " + ", ".join(f"{cat}: {value}" for cat, value in zip(categories, values)))
                elif values:
                    lines.append(f"- {name}: " + ", ".join(str(value) for value in values))
    except Exception:
        pass
    return "\n".join(lines).strip() if len(lines) > 1 or title else ""


def extract_pptx(data: bytes, source_name: str = "presentation") -> Tuple[str, List[dict]]:
    """v23 override: include current and nearby slide context in embedded-image labels."""
    if Presentation is None:
        return "PPTX support is not installed. Run: pip install python-pptx", []
    try:
        prs = Presentation(BytesIO(data))
    except Exception:
        return "PPTX parsing failed. Convert this presentation to PDF or paste slide text for richer extraction.", []

    slide_infos: List[dict] = []
    for slide_index, slide in enumerate(prs.slides, start=1):
        lines: List[str] = []
        image_blobs: List[Tuple[bytes, str]] = []
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text and shape.text.strip():
                lines.append(shape.text.strip())
            if getattr(shape, "has_table", False):
                table_md = pptx_table_to_markdown(shape.table)
                if table_md:
                    lines.append(f"[PPT SLIDE {slide_index} TABLE]\n{table_md}")
            chart_text = pptx_chart_to_text(shape, slide_index)
            if chart_text:
                lines.append(chart_text)
            if hasattr(shape, "image"):
                try:
                    image_blobs.append((shape.image.blob, shape.image.content_type or "image/png"))
                except Exception:
                    pass
        slide_infos.append({
            "index": slide_index,
            "text": "\n".join(lines),
            "images": image_blobs,
        })

    slide_texts = [f"[PPT SLIDE {info['index']}]\n{info['text']}" for info in slide_infos]
    full_slide_parts = render_pptx_slide_screenshots(data, source_name, slide_texts, MAX_VISUAL_IMAGES_PER_SOURCE)
    if full_slide_parts:
        return "\n\n".join(slide_texts).strip(), full_slide_parts

    embedded_candidates: List[dict] = []
    embedded_limit = max(MAX_VISUAL_IMAGES_PER_SOURCE, RELEVANT_VISUAL_POOL_LIMIT)

    for idx, info in enumerate(slide_infos):
        current_preview = truncate_text(normalise_space(info.get("text") or ""), 700)
        prev_preview = truncate_text(normalise_space(slide_infos[idx - 1].get("text") or ""), 360) if idx > 0 else ""
        next_preview = truncate_text(normalise_space(slide_infos[idx + 1].get("text") or ""), 360) if idx + 1 < len(slide_infos) else ""
        context_preview = normalise_space(" ".join(part for part in (prev_preview, current_preview, next_preview) if part))
        signal = _v23_signal_counts(context_preview or current_preview)
        slide_score = score_visual_text(context_preview or current_preview, idx)
        for image_index, (blob, content_type) in enumerate(info.get("images") or [], start=1):
            label = (
                f"IN-TEXT SOURCE FIGURE FROM {source_name} — embedded image on PPT slide {info['index']}. "
                f"Current slide text preview: {current_preview}. "
                f"Nearby slide context: previous={prev_preview}; next={next_preview}. "
                f"Teaching-signal-count={signal['teaching']}; decorative-signal-count={signal['decorative']}; visual-score={slide_score}. "
                "Use only if the actual image is a relevant teaching figure, chart, data display, diagram, experiment sequence, or method/result image."
            )
            embedded_candidates.append({
                "slide_index": info["index"],
                "image_index": image_index,
                "score": slide_score,
                "label": label,
                "blob": blob,
                "content_type": content_type,
            })

    selected_embedded = sorted(
        embedded_candidates,
        key=lambda item: (-item["score"], item["slide_index"], item["image_index"]),
    )[:embedded_limit]
    selected_embedded = sorted(selected_embedded, key=lambda item: (item["slide_index"], item["image_index"]))
    embedded_parts: List[dict] = []
    for item in selected_embedded:
        embedded_parts.append({"type": "text", "text": item["label"]})
        embedded_parts.append(image_part_from_bytes(item["blob"], item["content_type"]))

    return "\n\n".join(slide_texts).strip(), embedded_parts


def _v23_visual_kind(label: str) -> str:
    value = _v23_scoring_text(label).lower()
    if re.search(r"\b(table|mean|median|rate|statistics?|data|results?|percentage|sample|cohort|survey|risk ratio|odds ratio|confidence interval|p[- ]?value)\b|表|统计|数据|结果", value):
        return "data/table"
    if re.search(r"\b(graph|chart|plot|axis|axes|distribution|curve|regression|histogram|boxplot|scatter)\b|图表|坐标|曲线", value):
        return "graph/chart"
    if re.search(r"\b(correlation|scatter|height|weight|iq gain|flynn effect|gwas|genome-wide|snp|association)\b", value):
        return "graph/chart"
    if re.search(r"\b(diagram|model|process|flow|mechanism|schema|schematic|map|timeline|flowchart|cycle|pathway|network|framework|architecture|structure|anatomy|classification|taxonomy)\b|模型|机制|流程", value):
        return "diagram/model"
    if re.search(r"\b(dna|chromosome|allele|locus|genotype|phenotype|homozygous|heterozygous|dominant|recessive|pku|phenylketonuria)\b", value):
        return "diagram/model"
    if re.search(r"\b(experiment|method|procedure|protocol|trial|task|event|condition|control|participant|stimulus|response|measurement|habituation|possible|impossible|observed|violation|ultimatum|dictator|proposer|responder|equal split|selfish split|fairness|chimp|token)\b|实验|事件", value):
        return "experiment/event"
    if re.search(r"\b(maoa|warrior gene|maltreatment|childhood experience|antisocial|role of genotype|environment)\b", value):
        return "method/result figure"
    if re.search(r"\b(heritability|monozygotic|dizygotic|identical twins?|adoption|shared genes|lewontin|within-group|between-group)\b", value):
        return "method/result figure"
    if re.search(r"\b(formula|equation|calculation|matrix|vector)\b|公式", value):
        return "formula/calculation"
    if re.search(r"\b(mri|fmri|eeg|bold|activation|neuroimaging|brain scan|biomarker|network|applications? in research)\b|脑成像|神经影像|激活", value):
        return "method/result figure"
    return "unknown"


def _pdf_page_visual_counts(page) -> Tuple[int, int]:
    try:
        image_count = len(page.get_images(full=True))
    except Exception:
        image_count = 0
    try:
        drawing_count = len(page.get_drawings())
    except Exception:
        drawing_count = 0
    return image_count, drawing_count


def _is_overview_or_admin_page(text: str) -> bool:
    value = normalise_space(text or "").lower()
    return bool(re.search(r"\b(learning objectives?|lecture plan|agenda|outline|overview checklist|course information|contact)\b", value))


def score_pdf_page_visual_value(page, text: str, index: int = 0) -> Tuple[int, int, int]:
    """Rank rendered PDF pages by real teaching-image value, not by page order."""
    image_count, drawing_count = _pdf_page_visual_counts(page)
    if _is_overview_or_admin_page(text) and image_count == 0 and drawing_count <= 4:
        return -60, image_count, drawing_count
    text_score = score_visual_text(text, index)
    visual_bonus = min(image_count, 6) * 6 + min(max(drawing_count - 2, 0), 90) // 5
    value = normalise_space(text or "").lower()
    has_teaching_terms = _has_strong_visual_teaching_terms(value)

    if image_count >= 1 and has_teaching_terms:
        visual_bonus += 10
    if drawing_count >= 8 and has_teaching_terms:
        visual_bonus += 10
    if image_count >= 1 and not _is_overview_or_admin_page(text) and len(normalise_space(text or "")) < 120:
        # Some useful lecture figures are a mostly image-only PDF page.
        # Keep them in the candidate pool so the vision model can judge them.
        visual_bonus += 8
    if drawing_count >= 18 and not _is_overview_or_admin_page(text):
        visual_bonus += 8
    if image_count >= 1 and re.search(r"\b(dna|chromosome|allele|maoa|gwas|snp|flynn|iq|heritability|correlation|lewontin|pku|maltreatment)\b", value):
        visual_bonus += 12
    if drawing_count >= 20 and re.search(r"\b(correlation|plot|axis|height|weight|iq|curve|regression|scatter|histogram|boxplot|distribution)\b", value):
        visual_bonus += 18
    if re.search(r"\b(fig\.|figure|table|graph|chart|plot|diagram|schema|schematic|correlation|experiment|procedure|model|mechanism|pathway|timeline|flowchart|role of genotype|genome-wide|flynn effect|within vs between|shared genes)\b", value):
        visual_bonus += 10
    if image_count >= 2 and re.search(r"\b(gwas|genome-wide complex trait analysis|snp-based associations?|manhattan plot)\b", value):
        visual_bonus += 42
    if len(normalise_space(text or "")) < 25 and image_count == 0 and drawing_count < 8:
        visual_bonus -= 18
    return text_score + visual_bonus, image_count, drawing_count


def selected_pdf_visual_indices(doc, limit: int) -> List[int]:
    scored: List[Tuple[int, int, int, int, str]] = []
    for index, page in enumerate(doc):
        try:
            text = page.get_text("text") or ""
        except Exception:
            text = ""
        score, image_count, drawing_count = score_pdf_page_visual_value(page, text, index)
        if _is_overview_or_admin_page(text) and score < 20:
            continue
        scored.append((score, index, image_count, drawing_count, text))

    threshold = max(RELEVANT_VISUAL_MIN_SCORE, 12)
    useful = [item for item in scored if item[0] >= threshold]
    ranked = useful if useful else scored
    selected = [
        index for score, index, image_count, drawing_count, text in sorted(
            ranked,
            key=lambda item: (-item[0], item[1]),
        )[:limit]
    ]
    return sorted(selected)


def render_pdf_visual_parts(data: bytes, source_name: str, max_pages: Optional[int] = None) -> List[dict]:
    """v39: scan the whole PDF and render the pages with the strongest teaching visuals."""
    if fitz is None:
        return []
    requested_pages = int(max_pages or MAX_VISUAL_IMAGES_PER_SOURCE)
    max_pages_to_render = min(
        max(requested_pages, CONTROLLED_MAX_PDF_PAGES_PER_SOURCE, RELEVANT_VISUAL_POOL_LIMIT),
        PDF_VISUAL_CANDIDATE_LIMIT,
    )
    if max_pages_to_render <= 0:
        return []
    parts: List[dict] = []
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        selected = selected_pdf_visual_indices(doc, max_pages_to_render)
        matrix = fitz.Matrix(max(1.0, CONTROLLED_VISUAL_RENDER_DPI / 72), max(1.0, CONTROLLED_VISUAL_RENDER_DPI / 72))
        for idx in selected:
            page = doc.load_page(idx)
            page_text = page.get_text("text") or ""
            score, image_count, drawing_count = score_pdf_page_visual_value(page, page_text, idx)
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            img_bytes = pix.tobytes("jpeg")
            preview = truncate_text(normalise_space(page_text), 680)
            label = (
                f"IN-TEXT SOURCE FIGURE FROM {source_name} — PDF page {idx + 1}. "
                f"Actual source screenshot selected for its teaching figure/graph/data value. "
                f"Image-count={image_count}; drawing-count={drawing_count}; visual-score={score}. "
                f"Page text preview: {preview}"
            )
            parts.append({"type": "text", "text": label})
            parts.append(image_part_from_bytes(img_bytes, "image/jpeg"))
        doc.close()
    except Exception:
        return []
    return parts


def iter_visual_candidates(source_units: List[dict]) -> List[dict]:
    """v23 override: attach relevance metadata for sorting and model filtering."""
    candidates: List[dict] = []
    for source_index, unit in enumerate(source_units or [], start=1):
        title = unit.get("title_candidate") or unit.get("display_name") or f"Source {source_index}"
        label = ""
        visual_number = 0
        for part in unit.get("visual_parts") or []:
            if not isinstance(part, dict):
                continue
            if part.get("type") == "text":
                label = normalise_space(part.get("text") or "")
                continue
            if part.get("type") != "image_url":
                continue
            url = image_url_from_part(part)
            if not url:
                continue
            visual_number += 1
            _, location = visual_source_location_from_label(label)
            label_score = re.search(r"\bvisual-score=(-?\d+)\b", label, flags=re.I)
            if label_score:
                try:
                    score = int(label_score.group(1))
                except Exception:
                    score = score_visual_text(f"{label} {title}", visual_number)
            else:
                score = score_visual_text(f"{label} {title}", visual_number)
            kind = _v23_visual_kind(label)
            signals = _v23_signal_counts(label)
            is_unusable_unknown = kind == "unknown" and signals["teaching"] <= 0
            candidates.append({
                "source_index": source_index,
                "source_title": title,
                "display_name": unit.get("display_name", title),
                "caption": label[:620] if label else f"In-text source figure from Source {source_index}",
                "location": location or f"figure {visual_number}",
                "url": url,
                "score": score,
                "visual_kind": kind,
                "teaching_signals": signals["teaching"],
                "decorative_signals": signals["decorative"],
                "is_likely_decorative": is_unusable_unknown or (signals["decorative"] > signals["teaching"] and score < RELEVANT_VISUAL_MIN_SCORE),
            })
    return candidates


def select_visual_candidates_for_argument(source_units: List[dict], limit: Optional[int] = None) -> List[dict]:
    limit = int(limit or CONTROLLED_MAX_VISUALS or VISUAL_ARGUMENT_CARD_LIMIT)
    candidates = iter_visual_candidates(source_units)
    if not candidates or limit <= 0:
        return []

    useful = [
        cand for cand in candidates
        if cand.get("score", 0) >= RELEVANT_VISUAL_MIN_SCORE
        and not cand.get("is_likely_decorative")
        and cand.get("visual_kind") != "unknown"
    ]
    non_decorative = [
        cand for cand in candidates
        if not cand.get("is_likely_decorative") and cand.get("visual_kind") != "unknown"
    ]
    pool = useful if useful else non_decorative
    if not pool:
        return []

    def location_key(cand: dict) -> Tuple[int, str]:
        location = normalise_space(cand.get("location") or cand.get("caption") or "")
        return int(cand.get("source_index") or 0), location.lower()[:120]

    def append_unique(cand: dict, selected: List[dict], seen_locations: set) -> bool:
        key = location_key(cand)
        if key in seen_locations:
            return False
        selected.append(cand)
        seen_locations.add(key)
        return True

    ranked = sorted(pool, key=lambda c: (-c.get("score", 0), c.get("source_index", 0), c.get("location", "")))
    selected: List[dict] = []
    seen_sources = set()
    seen_locations = set()

    # First pass: give each uploaded source a fair chance, but do not let one
    # slide/page with several extracted images fill the whole vision budget.
    for cand in ranked:
        if cand["source_index"] not in seen_sources and append_unique(cand, selected, seen_locations):
            seen_sources.add(cand["source_index"])
        if len(selected) >= limit:
            return selected[:limit]

    # Second pass: add the best remaining distinct page/slide from any source.
    for cand in ranked:
        if cand not in selected:
            append_unique(cand, selected, seen_locations)
        if len(selected) >= limit:
            break

    return selected[:limit]


def _v23_parse_relevant_visual_cards(raw: str, candidates: List[dict], labels: dict) -> List[dict]:
    parsed = extract_json_object(raw)
    raw_cards = parsed.get("cards") if isinstance(parsed, dict) else []
    cards: List[dict] = []
    if not isinstance(raw_cards, list):
        raw_cards = []
    for item in raw_cards:
        if not isinstance(item, dict):
            continue
        try:
            cand_index = int(item.get("visual_index", len(cards)))
        except Exception:
            cand_index = len(cards)
        if cand_index < 0 or cand_index >= len(candidates):
            continue
        cand = candidates[cand_index]
        if cand.get("is_likely_decorative") or cand.get("visual_kind") == "unknown":
            continue
        useful = item.get("is_useful")
        if useful is not True:
            continue
        reason = normalise_space(item.get("why_relevant") or item.get("argument_supported") or "")
        if not reason or re.search(r"\b(direct support|nearby concept|uploaded material|source figure|visual evidence)\b", reason, flags=re.I):
            continue
        visible = normalise_space(item.get("what_shows") or "")
        if not visible or re.search(r"\b(image|picture|source figure|visual)\b$", visible, flags=re.I):
            continue
        card = {
            "index": len(cards),
            "source_index": cand.get("source_index"),
            "source_title": cand.get("source_title", ""),
            "location": cand.get("location", ""),
            "caption": clean_source_figure_caption(cand.get("caption", "")),
            "url": cand.get("url", ""),
            "title": normalise_space(item.get("title") or f"{labels['figure_title']} {len(cards) + 1}"),
            "what_shows": normalise_space(item.get("what_shows") or clean_source_figure_caption(cand.get("caption", ""))),
            "argument_supported": normalise_space(item.get("argument_supported") or reason),
            "cross_source_connection": normalise_space(item.get("cross_source_connection") or ""),
            "how_to_read": normalise_space(item.get("how_to_read") or "Read the labels/title first, then identify the relationship, comparison, sequence, or values."),
            "exam_use": normalise_space(item.get("exam_use") or ""),
            "visual_kind": cand.get("visual_kind", ""),
        }
        cards.append(card)
        if len(cards) >= CONTROLLED_MAX_VISUALS:
            break
    return cards


def generate_visual_argument_cards(source_units: List[dict], source_digest_block: str, preferred_language: str) -> List[dict]:
    """v23 override: model filters decorative candidates and keeps only teaching images."""
    existing = []
    for unit in source_units or []:
        existing.extend(unit.get("visual_argument_cards") or [])
    if existing:
        return existing

    labels = source_figure_labels(preferred_language)
    hard_limit = max(1, min(CONTROLLED_MAX_VISUALS, VISUAL_ARGUMENT_CARD_LIMIT, MAX_MULTI_SOURCE_VISUAL_IMAGES))
    candidate_pool = select_visual_candidates_for_argument(source_units, hard_limit)
    if not candidate_pool:
        return []

    language_rule = language_instruction_for(preferred_language)
    context = truncate_text(source_digest_block or _v22_source_context(source_units), env_int("VISUAL_ARGUMENT_CONTEXT_CHARS", 35000))
    metadata = []
    for idx, cand in enumerate(candidate_pool):
        metadata.append(
            f"Candidate {idx}: Source {cand.get('source_index')} | {cand.get('source_title')} | {cand.get('location')} | "
            f"kind={cand.get('visual_kind')} | score={cand.get('score')} | decorative={cand.get('is_likely_decorative')} | "
            f"caption={cand.get('caption')}"
        )

    prompt = f"""
You are selecting in-text source figures for a professor-style study guide.

Language requirement: {language_rule}
Never translate the product name Synapse.

Choose ONLY source figures that help students understand:
- diagrams, experiment/event sequences, tables, charts, graphs, statistical evidence, formulas, process models, or method/result figures.

Reject images that are mainly:
- cover/title slides, portraits, lecturer photos, logos, stock photos, decorative backgrounds, contact/about-me slides, or generic pictures without teaching value.
- literal photos of a child/person using an object, product photos, phone photos, landscape photos, and generic illustrative photos, even if the surrounding slide text mentions an important concept.
- images that merely decorate a concept. The image itself must contain teachable structure: labels, axes, values, experimental layout, steps, comparison, formula, or a source-data display.

Source context:
{context}

Candidate metadata:
{chr(10).join(metadata)}

Inspect every attached candidate image. Return JSON only:
{{"cards":[{{"visual_index":0,"is_useful":true,"title":"...","why_relevant":"...","what_shows":"...","argument_supported":"...","cross_source_connection":"...","how_to_read":"...","exam_use":"..."}}]}}

Rules:
- Return at most {hard_limit} cards.
- Do not include decorative images.
- Prefer data/charts/diagrams/experiment sequences over photos.
- If an image is a generic stock/product/person photo, set is_useful=false or omit it.
- If the image does not visibly add information beyond nearby text, set is_useful=false or omit it.
- why_relevant must name the specific concept/data relationship shown; generic phrases such as "supports the nearby concept" are invalid.
- Titles should name the concept shown in the figure, not the page/slide number.
- For PDF/PPT pages, treat the attached image as the source screenshot that should be placed into the notes.
- Keep the same order as their educational usefulness, not necessarily candidate order.
- If none are useful, return {{"cards":[]}}.
"""
    content = [{"type": "text", "text": prompt}]
    for idx, cand in enumerate(candidate_pool):
        content.append({"type": "text", "text": f"Candidate image {idx}: Source {cand.get('source_index')} — {cand.get('location')} — {cand.get('visual_kind')}"})
        content.append(image_part_from_url(cand["url"]))

    try:
        raw = generate_chat(
            [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": content}],
            model=model_for_depth("detailed"),
            temperature=0,
            max_tokens=CONTROLLED_VISUAL_CARD_TOKENS,
        )
        cards = _v23_parse_relevant_visual_cards(raw, candidate_pool, labels)
    except Exception:
        cards = []

    if not cards:
        cards = _v23_fallback_visual_cards(candidate_pool, labels, preferred_language)

    if source_units:
        source_units[0]["visual_argument_cards"] = cards
    return cards


def _v23_keywords_for_card(card: dict) -> List[str]:
    text = " ".join(
        str(card.get(key, ""))
        for key in ("title", "what_shows", "argument_supported", "cross_source_connection", "caption", "visual_kind", "location")
    ).lower()
    words = re.findall(r"[A-Za-z][A-Za-z-]{3,}|[\u4e00-\u9fff]{2,}", text)
    stop = {
        "this", "that", "with", "from", "source", "visual", "image", "shows", "supports", "student",
        "concept", "evidence", "uploaded", "material", "direct", "table", "figure", "diagram",
        "这个", "图像", "图片", "来源", "显示", "支持", "概念", "材料", "证据",
    }
    unique = []
    for word in words:
        w = word.lower()
        if w not in stop and w not in unique:
            unique.append(w)
    return unique[:18]


def _v23_location_terms(card: dict) -> List[str]:
    terms: List[str] = []
    location = normalise_space(card.get("location", ""))
    for number in re.findall(r"\b\d+\b", location):
        terms.extend([
            f"slide {number}",
            f"page {number}",
            f"p.{number}",
            f"p. {number}",
            f"p {number}",
            f"第{number}页",
            f"第 {number} 页",
        ])
    return terms


def _v23_remove_visible_slide_refs(text: str) -> str:
    cleaned = re.sub(r"\s*\((?:[^)]*\b(?:slide|slides|page|pages|p\.)\s*\d+[^)]*)\)", "", text, flags=re.I)
    cleaned = re.sub(r"\s*（(?:[^）]*(?:slide|slides|page|pages|p\.|第\s*\d+\s*页)[^）]*)）", "", cleaned, flags=re.I)
    cleaned = re.sub(r"\b(?:as used on the slide|from the slide|on the slide)\b", "", cleaned, flags=re.I)
    return normalise_space(cleaned) if "\n" not in cleaned else cleaned


def _v23_meaningful_card_text(value: str) -> str:
    text = normalise_space(value or "")
    if not text:
        return ""
    if re.search(
        r"\b("
        r"direct support|nearby concept|uploaded material|source figure|visual evidence|"
        r"connect this source figure|main concept|other uploaded materials|read the labels/title first"
        r")\b",
        text,
        flags=re.I,
    ):
        return ""
    return clean_source_figure_caption(text)


def _v23_default_how_to_read(kind: str, preferred_language: str) -> str:
    key = normalise_language_key(preferred_language)
    kind = normalise_space(kind or "")
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        mapping = {
            "data/table": "先看行列分别在比较什么，再抓住最大/最小值、均值/比例和组间差异；最后问这些数字支持或限制了哪个论点。",
            "graph/chart": "先读标题和坐标轴，再看趋势方向、组间差异、异常点和变量关系；不要只记图形，要说清它证明了什么。",
            "diagram/model": "按标签、箭头或空间位置读图：先确定组成部分，再解释它们之间的关系和机制。",
            "experiment/event": "先分清参与者、条件、步骤和结果，再说明这个实验设计如何检验一个理论假设。",
            "formula/calculation": "先识别每个变量代表什么，再看公式如何把变量关系转化为可计算的结论。",
            "method/result figure": "先看研究方法或测量对象，再把结果与讲义中的理论主张连接起来，同时注意样本和方法限制。",
        }
    elif key == "traditional_chinese":
        mapping = {
            "data/table": "先看行列分別在比較什麼，再抓住最大/最小值、均值/比例和組間差異；最後問這些數字支持或限制了哪個論點。",
            "graph/chart": "先讀標題和座標軸，再看趨勢方向、組間差異、異常點和變量關係；不要只記圖形，要說清它證明了什麼。",
            "diagram/model": "按標籤、箭頭或空間位置讀圖：先確定組成部分，再解釋它們之間的關係和機制。",
            "experiment/event": "先分清參與者、條件、步驟和結果，再說明這個實驗設計如何檢驗一個理論假設。",
            "formula/calculation": "先識別每個變量代表什麼，再看公式如何把變量關係轉化為可計算的結論。",
            "method/result figure": "先看研究方法或測量對象，再把結果與講義中的理論主張連接起來，同時注意樣本和方法限制。",
        }
    else:
        mapping = {
            "data/table": "Read the rows and columns first, then identify the key values, contrasts, and limits. Ask what claim the numbers support or qualify.",
            "graph/chart": "Read the title and axes first, then describe the trend, group difference, outlier, or variable relationship before interpreting it.",
            "diagram/model": "Follow the labels, arrows, or spatial layout: identify the parts, then explain the relationship or mechanism between them.",
            "experiment/event": "Identify the participants, conditions, sequence, and result, then explain how the design tests the theory.",
            "formula/calculation": "Identify what each variable means, then explain how the formula turns the relationship into a usable conclusion.",
            "method/result figure": "Read the method or measurement first, then connect the result to the lecture claim and note any sample or method limit.",
        }
    return mapping.get(kind, mapping.get("diagram/model", "Read the labels and relationship first, then connect the visual to the claim it is meant to support."))


def _v23_source_figure_note_block(card: dict, marker_index: int, preferred_language: str) -> str:
    key = normalise_language_key(preferred_language)
    title = _v23_meaningful_card_text(card.get("title")) or (f"来源图表 {marker_index + 1}" if key in {"simplified_chinese", "mixed_chinese_english"} else f"Source figure {marker_index + 1}")
    what = _v23_meaningful_card_text(card.get("what_shows")) or _v23_meaningful_card_text(card.get("caption"))
    why = _v23_meaningful_card_text(card.get("argument_supported")) or _v23_meaningful_card_text(card.get("cross_source_connection"))
    how = _v23_meaningful_card_text(card.get("how_to_read")) or _v23_default_how_to_read(card.get("visual_kind"), preferred_language)
    exam = _v23_meaningful_card_text(card.get("exam_use"))
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        lines = [f"**源内图表讲解：{title}**", f"[[VISUAL:{marker_index}]]"]
        if what:
            lines.append(f"- **图表在说明什么：** {what}")
        lines.append(f"- **怎么读：** {how}")
        if why:
            lines.append(f"- **为什么放在这里：** {why}")
        if exam:
            lines.append(f"- **复习/考试用法：** {exam}")
    elif key == "traditional_chinese":
        lines = [f"**源內圖表講解：{title}**", f"[[VISUAL:{marker_index}]]"]
        if what:
            lines.append(f"- **圖表在說明什麼：** {what}")
        lines.append(f"- **怎麼讀：** {how}")
        if why:
            lines.append(f"- **為什麼放在這裡：** {why}")
        if exam:
            lines.append(f"- **複習/考試用法：** {exam}")
    else:
        lines = [f"**Source-figure reading note: {title}**", f"[[VISUAL:{marker_index}]]"]
        if what:
            lines.append(f"- **What the figure shows:** {what}")
        lines.append(f"- **How to read it:** {how}")
        if why:
            lines.append(f"- **Why it matters here:** {why}")
        if exam:
            lines.append(f"- **Exam / revision use:** {exam}")
    return "\n\n" + "\n".join(lines) + "\n\n"


def ensure_markdown_note_headings(summary: str, preferred_language: str) -> str:
    """Promote common note labels to markdown headings so navigation is stable."""
    if not summary:
        return summary
    heading_pattern = re.compile(
        r"^\s*(?:"
        r"Learning question|Source and argument map|Core notes|Key terms(?: and mechanisms)?|Core argument|Key ideas?|Concepts? explained|"
        r"Sources? \(|Sources?:|Source evidence|Reading the source evidence|Worked examples?|Evidence matrix|Comparison table|"
        r"Exam strategy|Common mistakes|Revision(?: checklist)?|Conclusion|"
        r"学习问题|来源与论点地图|來源與論點地圖|核心笔记|核心筆記|关键术语与机制|關鍵術語與機制|核心论点|关键概念|源内证据|源內證據|证据矩阵|例子与证据|概念比较表|"
        r"考试策略|考試策略|常见错误|常見錯誤|复习|復習|结论|結論"
        r")\b.*$",
        flags=re.I,
    )
    lines: List[str] = []
    heading_count = 0
    for raw_line in summary.splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()
        if re.match(r"^#{1,4}\s+", stripped):
            heading_count += 1
            lines.append(line)
            continue
        if heading_pattern.match(stripped) and len(stripped) <= 140:
            heading_count += 1
            lines.append(f"## {stripped}")
        else:
            lines.append(line)

    text = "\n".join(lines).strip()
    if heading_count <= 1:
        key = normalise_language_key(preferred_language)
        heading = "## 核心笔记" if key in {"simplified_chinese", "mixed_chinese_english"} else "## Core Notes"
        first_heading = re.search(r"^#\s+.+$", text, flags=re.M)
        if first_heading:
            insert_at = first_heading.end()
            text = text[:insert_at] + "\n\n" + heading + text[insert_at:]
        else:
            text = heading + "\n\n" + text
    return text


def _v23_fallback_visual_cards(candidates: List[dict], labels: dict, preferred_language: str = "auto") -> List[dict]:
    """Guarantee source figures render when the vision filter is overly cautious."""
    cards: List[dict] = []
    for cand in candidates or []:
        if cand.get("is_likely_decorative") or cand.get("visual_kind") == "unknown" or not cand.get("url"):
            continue
        caption = clean_source_figure_caption(cand.get("caption") or "")
        kind = normalise_space(cand.get("visual_kind") or "")
        location = normalise_space(cand.get("location") or "")
        title_bits = [bit for bit in (kind.replace("/", " / ").title(), location) if bit]
        title = " — ".join(title_bits) or f"{labels['figure_title']} {len(cards) + 1}"
        cards.append({
            "index": len(cards),
            "source_index": cand.get("source_index"),
            "source_title": cand.get("source_title", ""),
            "location": location,
            "caption": caption,
            "url": cand.get("url", ""),
            "title": title,
            "what_shows": caption,
            "argument_supported": "Use this source figure to read the source evidence directly, then connect the visible data, labels, or comparison back to the nearby concept in the notes.",
            "cross_source_connection": "",
            "how_to_read": _v23_default_how_to_read(kind, preferred_language),
            "exam_use": "Use the figure as source evidence: describe what is visible, interpret it, then state the limitation or implication.",
            "visual_kind": kind,
        })
        if len(cards) >= CONTROLLED_MAX_VISUALS:
            break
    return cards


def _v23_marker_block(card: dict, marker_index: int, preferred_language: str) -> str:
    return _v23_source_figure_note_block(card, marker_index, preferred_language)


def _v23_ensure_visual_note_blocks(summary: str, cards: List[dict], preferred_language: str) -> str:
    """Replace bare visual markers with inline source-figure reading notes."""
    text = summary or ""
    for marker_index, card in enumerate(cards or []):
        marker = f"[[VISUAL:{marker_index}]]"
        if marker not in text:
            continue
        pos = text.find(marker)
        window_before = text[max(0, pos - 360):pos]
        if re.search(r"Source-figure reading note|源内图表讲解|源內圖表講解", window_before, flags=re.I):
            continue
        text = text.replace(marker, _v23_source_figure_note_block(card, marker_index, preferred_language).strip(), 1)
    return text


def remove_standalone_visual_diagram_headings(summary: str) -> str:
    """Remove old standalone visual-feature headings so figures stay fused into notes."""
    visual_heading_pattern = re.compile(
        r"^#{1,4}\s*(?:"
        r"visual\s*(?:/|and)?\s*diagram(?:-based)?(?:\s*explanation)?|"
        r"visual\s*evidence(?:\s*in\s*context)?|"
        r"source\s*figures(?:\s*in\s*context)?|"
        r"source\s*visuals|"
        r"diagram(?:-based)?\s*explanation|"
        r"图像证据|圖像證據|视觉证据|視覺證據|来源图表|來源圖表|图表说明|圖表說明"
        r")\b.*$",
        flags=re.I,
    )
    kept: List[str] = []
    for line in (summary or "").splitlines():
        if visual_heading_pattern.match(line.strip()):
            continue
        kept.append(line)
    text = "\n".join(kept)
    text = re.sub(r"\bVisual evidence in Context\b", "", text, flags=re.I)
    text = re.sub(r"\bVisual evidence\b", "Source example", text, flags=re.I)
    text = re.sub(r"图像证据|圖像證據", "来源例子", text)
    return re.sub(r"\n{4,}", "\n\n\n", text).strip()


def enforce_thetawave_inline_note_format(summary: str, cards: List[dict], preferred_language: str) -> str:
    summary = _v22_ensure_visual_markers(summary or "", cards or [], preferred_language)
    return remove_standalone_visual_diagram_headings(summary)


def _v22_ensure_visual_markers(summary: str, cards: List[dict], preferred_language: str) -> str:
    """v23 override: insert missing visuals near relevant text, not in an end gallery."""
    summary = summary or ""
    if not cards:
        return summary
    existing = {int(x) for x in re.findall(r"\[\[VISUAL:(\d+)\]\]", summary)}
    missing = [i for i in range(len(cards)) if i not in existing]
    if not missing:
        return summary

    blocks = re.split(r"(\n{2,})", summary.rstrip())
    paragraph_indices = [i for i in range(0, len(blocks), 2) if blocks[i].strip()]
    used_paragraphs = set()
    for marker_index in missing:
        card = cards[marker_index]
        keywords = _v23_keywords_for_card(card)
        location_terms = _v23_location_terms(card)
        best_i = None
        best_score = -1
        for i in paragraph_indices:
            if i in used_paragraphs or f"[[VISUAL:{marker_index}]]" in blocks[i]:
                continue
            text = blocks[i].lower()
            if text.startswith("#"):
                continue
            score = sum(1 for keyword in keywords if keyword and keyword in text)
            score += 4 * sum(1 for term in location_terms if term and term.lower() in text)
            if "visual" in text or "图" in text or "表" in text:
                score += 1
            if re.search(r"\b(ultimatum|dictator|bowles|gintis|correlation|maoa|genotype|heritability|chimp|公平|最后通牒|独裁者|相关|基因|遗传)\b", text, flags=re.I):
                score += 2
            if score > best_score:
                best_score = score
                best_i = i
        if best_i is None or best_score <= 0:
            # Prefer the visual-argument section if the model created one.
            for i in paragraph_indices:
                if re.search(r"Source Figures|来源图表|图像|圖像|Diagram|图表|圖表|Data|数据", blocks[i], flags=re.I):
                    best_i = i
                    break
        if best_i is None:
            best_i = paragraph_indices[min(marker_index, len(paragraph_indices) - 1)] if paragraph_indices else 0
        blocks[best_i] = _v23_remove_visible_slide_refs(blocks[best_i]).rstrip() + _v23_marker_block(card, marker_index, preferred_language)
        used_paragraphs.add(best_i)
    return "".join(blocks).strip()


def expand_sparse_inline_summary(
    summary: str,
    source_context: str,
    visual_context: str,
    preferred_language: str,
    min_units: int,
    force: bool = False,
    quality_gaps: Optional[List[str]] = None,
) -> str:
    """Expand notes only when the first pass became too thin after adding visuals."""
    if not summary or (not force and count_readable_units(summary) >= min_units):
        return summary
    language_rule = language_instruction_for(preferred_language)
    prompt = f"""
You are Synapse, improving a source-grounded study-note page.

Language requirement: {language_rule}
Never translate the product name Synapse.

Problem:
The current notes may be too thin, too image-dependent, or missing useful comparison/evidence tables from the source.
Detected quality gaps: {", ".join(quality_gaps or []) if quality_gaps else "not enough advanced tutor detail"}

Your task:
- Expand the notes into a richer tutor-style study guide while keeping the same clean notes-page feel.
- Preserve every existing [[VISUAL:n]] marker exactly. Do not delete, rename, renumber, or move markers far away from the concept they explain.
- Do not add new visual markers.
- Do not create a separate visual gallery or "Visual evidence" section.
- Do not merely restate the visual card caption. Add real teaching text: definitions, reasoning, worked examples, comparisons, source evidence, exam use, and common mistakes.
- Keep images as supporting evidence. The prose must still be understandable if the image card is temporarily unavailable.
- Add enough detail for a student to revise from the page: concept -> source evidence -> interpretation -> why it matters -> exam/application.
- Use markdown tables where a comparison or evidence summary would make the explanation clearer.
- Upgrade short bullet lists into proper teaching notes: explain mechanisms, causal logic, assumptions, limitations, and what students usually confuse.
- For each major concept, include a source-grounded example or data point when the source provides one.
- Add at least one comparison/evidence table and one revision/exam-use table when the source supports it.
- Avoid shallow one-line entries such as "Definition / Why / Exam use" without explanation.

Source context:
{truncate_text(source_context, 45000)}

Available visual card context:
{visual_context if visual_context else 'No visual card metadata.'}

Current notes to expand:
{summary}

Return the expanded final markdown only.
"""
    try:
        expanded = generate_chat(
            [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
            model=model_for_depth("detailed"),
            temperature=0,
            max_tokens=CONTROLLED_OUTPUT_TOKENS,
        ).strip()
        original_units = count_readable_units(summary)
        expanded_units = count_readable_units(expanded)
        original_markers = set(re.findall(r"\[\[VISUAL:\d+\]\]", summary))
        expanded_markers = set(re.findall(r"\[\[VISUAL:\d+\]\]", expanded))
        minimum_units = max(int(min_units * 0.85), int(original_units * 0.9)) if force else max(original_units + 500, int(min_units * 0.85))
        if (
            expanded
            and not is_refusal_or_useless_response(expanded)
            and expanded_units >= minimum_units
            and original_markers.issubset(expanded_markers)
        ):
            return expanded
    except Exception:
        pass
    return summary


def generate_reference_style_multisource_notes(source_units: List[dict], preferred_language: str, depth_plan: dict) -> str:
    """v23: controlled notes with relevant in-text diagrams/tables/charts only."""
    source_context = _v22_source_context(source_units)
    generation_language = resolve_generation_language_key(preferred_language, source_context)
    language_rule = language_instruction_for_generation(preferred_language, source_context)
    recommended_structure = note_structure_for_language(generation_language, source_context)
    visual_cards = generate_visual_argument_cards(source_units, source_context, generation_language)
    visual_context = _v22_visual_context_for_prompt(visual_cards)
    source_list = "\n".join(
        f"Source {i}: {u.get('title_candidate') or u.get('display_name')}"
        for i, u in enumerate(source_units or [], start=1)
    )
    prompt = f"""
You are Synapse, an advanced study tutor and source-grounded lecturer.

Language requirement: {language_rule}
Never translate the product name Synapse.

Mission:
Create a genuinely useful lecture-notes page, not a summary report. The page should feel like a sharp tutor has read the uploaded source, decided what the student actually needs to understand, and then taught the ideas in the right order.

Style:
- write like real class notes: concept title, short definition, explanation in your own words, source example/data, implication, limitation/misunderstanding, and exam use;
- clear lecture-note page, with short headings, compact paragraphs, bullets only where they help, and tables for comparison/evidence;
- explain every major idea in detail: definition -> why it matters -> evidence/example -> limitation/mistake -> exam use;
- do not only list facts. Show the reasoning chain and the relationships between ideas;
- do not jump straight to overview tables. Teach the ideas first, then use tables to consolidate them;
- do not overuse slide/page numbers. Teach the concept directly.

Source-image rules:
- Use images for diagrams, data tables, charts, scatter plots, correlation figures, genotype/environment graphs, experiment setups, game-theory examples, method/result figures, or formulas.
- Reject decorative cover photos, portraits, logos, stock photos, lecturer/contact slides, and random pictures.
- If selected source figures exist, use them as source-reading moments inside the notes. Insert [[VISUAL:n]] only where the figure actually helps.
- Around every [[VISUAL:n]], write an inline source-figure explanation: what question the figure answers, how to read the figure/table/graph, what evidence it gives, and what a student should remember.
- The page/slide number is internal provenance only. Do not put it in headings.

Sources:
{source_list}

Balanced extracted source context:
{source_context}

Relevant in-text source figures selected from the uploaded files:
{visual_context if visual_context else 'No relevant source figures were selected. Do not invent image markers.'}

Output requirements:
- Return final markdown only.
- Write in the selected language.
- Use the same "notes page" feel as the reference image: clean headings, strong paragraphs, helpful tables, and source screenshots embedded only when useful.
- This is the Notes tab, not only the Summary section. It should be detailed enough to study from directly.
- Do not shrink the summary because images are present. Images should add evidence; they must not replace definitions, reasoning, examples, or source interpretation.
- Insert [[VISUAL:n]] immediately after the concept/example/data point it explains. Use each available source figure at most once.
- Before each [[VISUAL:n]], write enough concept text for the student to know what problem/question the image answers.
- After each [[VISUAL:n]], continue the explanation naturally with what the source figure teaches. Do not leave a bare image without explanation.
- Do not use page/slide numbers as the visible teaching device.
- Include at least two markdown tables when supported by the source:
  1. a concept comparison table;
  2. a source evidence / example table with columns like concept, source evidence, interpretation, limitation, exam use.
- Mention every usable source at least once.
- Do not include "Visual evidence", "图像证据", "Source Figures", or a standalone image section title.
- Target richer content than a quick summary: include the core claim, key terms, source evidence, worked examples, limitations/misunderstandings, and exam/application use when the source supports them.
- Avoid generic filler such as "this is important". Every point must say what the student should understand or do.
- For every major idea, teach it in depth: define the concept, explain the mechanism or reasoning chain, show the source example/data, state what the evidence can and cannot prove, then give exam/revision use.
- Do not compress a complex lecture into a list of one-line bullets. Use short paragraphs under bullets when needed.
- If the source contains named studies, theorists, experiments, cases, graphs, or tables, explain what each one contributes to the argument rather than merely naming it.
- Build table(s) from source material when it helps: theory comparison, evidence matrix, key term table, case/example table, or exam-use table.
- Include "common student mistake" notes for concepts that are easy to confuse.
- End with a practical revision checklist that tells the student what they should be able to explain, compare, calculate, or critique.

Recommended structure:
{recommended_structure}

Quality bar:
- A student should be able to answer "what is the point?", "what evidence supports it?", "what can be confused?", and "how do I use this in an exam?" after reading the page.
- If the source contains a table/data/example like animal language, Piaget tasks, correlations, genetics, methods, or case studies, reconstruct it as a markdown table even if no image is used.
- Prefer source-grounded explanation over broad general textbook filler.
"""
    try:
        result = generate_chat(
            [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
            model=model_for_depth("detailed"),
            temperature=0,
            max_tokens=CONTROLLED_OUTPUT_TOKENS,
        ).strip()
        if not result or is_refusal_or_useless_response(result):
            raise RuntimeError("Relevant visual notes were too short or unusable.")
        if count_readable_units(result) < env_int("CONTROLLED_MIN_OUTPUT_UNITS", 1200):
            raise RuntimeError("Relevant visual notes were too short or unusable.")
        source_has_table_or_data = bool(re.search(
            r"\b(table|figure|fig\.|graph|chart|plot|correlation|experiment|study|results?|data|mean|median|percentage|rate|comparison)\b|图|表|数据|实验|结果|对比",
            source_context,
            flags=re.I,
        ))
        table_count = markdown_table_count(result)
        quality_gaps = advanced_notes_quality_flags(result, source_context)
        should_expand = (
            os.getenv("ENABLE_CONDITIONAL_NOTE_EXPANSION", "true").lower() not in {"0", "false", "no"}
            and (
                bool(quality_gaps)
                or (source_has_table_or_data and table_count < ADVANCED_NOTES_MIN_TABLES)
            )
        )
        if should_expand:
            result = expand_sparse_inline_summary(
                result,
                source_context,
                visual_context,
                generation_language,
                RICH_INLINE_MIN_OUTPUT_UNITS,
                force=bool(quality_gaps) or (source_has_table_or_data and table_count < ADVANCED_NOTES_MIN_TABLES),
                quality_gaps=quality_gaps,
            )
    except Exception:
        rows = []
        for i, unit in enumerate(source_units or [], start=1):
            title = unit.get("title_candidate") or unit.get("display_name") or f"Source {i}"
            excerpt = truncate_text(normalise_space(unit.get("text_excerpt") or ""), 850)
            rows.append(f"| Source {i} | {title} | {excerpt or 'Readable text limited; use extracted source figures if available.'} |")
        result = (
            "# Integrated Study Guide\n\n"
            "## Big Picture\n\nSynapse extracted source text and will place useful uploaded screenshots directly beside the concepts they explain.\n\n"
            "## Source Evidence Table\n\n| Source | Topic | Useful evidence |\n|---|---|---|\n" + "\n".join(rows) + "\n\n"
            "## Source Examples and Evidence\n\n"
        )
        for i, card in enumerate(visual_cards or []):
            result += (
                f"### {card.get('title')}\n\n"
                f"The following source figure is included because it supports the nearby concept rather than acting as decoration."
                f"{_v23_marker_block(card, i, generation_language)}"
            )
    result = remove_auto_bilingual_heading_leakage(result, preferred_language, source_context)
    result = ensure_markdown_note_headings(result, generation_language)
    final_result = _v22_ensure_visual_markers(result, visual_cards, generation_language)
    final_result = _v23_ensure_visual_note_blocks(final_result, visual_cards, generation_language)
    return remove_standalone_visual_diagram_headings(final_result)


def attach_visual_argument_section(summary: str, source_units: List[dict], preferred_language: str) -> str:
    """v36: keep uploaded source screenshots fused into normal note text."""
    cards = []
    for unit in source_units or []:
        cards.extend(unit.get("visual_argument_cards") or [])
    if not cards:
        cards = generate_visual_argument_cards(source_units, summary[:env_int("VISUAL_ARGUMENT_CONTEXT_CHARS", 35000)], preferred_language)
    return enforce_thetawave_inline_note_format(summary or "", cards, preferred_language)


@app.get("/health/v23")
def health_v23():
    return {
        "status": "ok",
        "mode": "relevant_in_text_teaching_images",
        "html_css_changed": False,
        "relevant_visual_mode": RELEVANT_VISUAL_MODE,
        "candidate_pool_limit": RELEVANT_VISUAL_POOL_LIMIT,
        "pdf_visual_candidate_limit": PDF_VISUAL_CANDIDATE_LIMIT,
        "rich_inline_min_output_units": RICH_INLINE_MIN_OUTPUT_UNITS,
        "min_score": RELEVANT_VISUAL_MIN_SCORE,
        "max_in_text_visuals": CONTROLLED_MAX_VISUALS,
        "rejects_decorative_visuals": True,
        "prioritises": ["data tables", "charts/graphs", "diagrams", "experiment/event sequences", "formulas/process models"],
    }


def _v23_card_text(card: dict) -> str:
    return normalise_space(" ".join(
        str(card.get(key, ""))
        for key in (
            "title",
            "caption",
            "what_shows",
            "argument_supported",
            "cross_source_connection",
            "how_to_read",
            "exam_use",
            "location",
            "visual_kind",
        )
    ))


def _v23_card_is_teaching_figure(card: dict) -> bool:
    if not isinstance(card, dict) or not card.get("url"):
        return False
    if card.get("is_likely_decorative") or card.get("visual_kind") == "unknown":
        return False
    text = _v23_card_text(card)
    if re.search(r"\b(stock|dreamstime|getty|unsplash|product photo|phone photo|generic photo|decorative photo)\b", text, flags=re.I):
        return False
    kind = card.get("visual_kind")
    if kind in {"data/table", "graph/chart", "diagram/model", "experiment/event", "formula/calculation", "method/result figure"}:
        return True
    signals = _v23_signal_counts(text)
    return signals["teaching"] > 0 and signals["decorative"] <= signals["teaching"]


def build_visual_gallery(source_units: List[dict]) -> List[dict]:
    """v23 final override: return only in-text source figures, never a raw gallery."""
    cards: List[dict] = []
    for unit in source_units or []:
        cards.extend(unit.get("visual_argument_cards") or [])
    if not cards:
        cards = generate_visual_argument_cards(source_units, _v22_source_context(source_units), "auto")

    cleaned: List[dict] = []
    max_items = max(0, min(CONTROLLED_MAX_VISUALS, MULTISOURCE_VISUAL_GALLERY_LIMIT, MAX_MULTI_SOURCE_VISUAL_IMAGES))
    for card in cards or []:
        if not _v23_card_is_teaching_figure(card):
            continue
        item = dict(card)
        try:
            item["index"] = int(item.get("index", len(cleaned)))
        except Exception:
            item["index"] = len(cleaned)
        item["title"] = normalise_space(item.get("title") or f"Source figure {len(cleaned) + 1}")
        item["caption"] = clean_source_figure_caption(item.get("caption") or item.get("what_shows") or "")
        item["what_shows"] = clean_source_figure_caption(item.get("what_shows") or item.get("caption") or "")
        # Keep inline cards lightweight. The full explanation belongs in the
        # surrounding notes, not repeated in the figure chrome.
        item["argument_supported"] = ""
        item["cross_source_connection"] = ""
        item["exam_use"] = ""
        cleaned.append(item)
        if len(cleaned) >= max_items:
            break
    return cleaned


# -----------------------------------------------------------------------------
# Quiz generation
# -----------------------------------------------------------------------------

QUIZ_TYPE_LABELS = {
    "single_choice": "Single choice",
    "multiple_choice": "Multiple choice",
    "true_false": "True / False",
    "short_answer": "Short answer",
    "case_analysis": "Case analysis",
    "essay": "Essay",
}

QUIZ_TYPE_ALIASES = {
    "single": "single_choice",
    "single_choice": "single_choice",
    "choice": "single_choice",
    "mcq": "single_choice",
    "单选题": "single_choice",
    "单选": "single_choice",
    "multiple": "multiple_choice",
    "multiple_choice": "multiple_choice",
    "多选题": "multiple_choice",
    "多选": "multiple_choice",
    "true_false": "true_false",
    "truefalse": "true_false",
    "tf": "true_false",
    "判断题": "true_false",
    "判断": "true_false",
    "short": "short_answer",
    "short_answer": "short_answer",
    "简答题": "short_answer",
    "简答": "short_answer",
    "case": "case_analysis",
    "case_analysis": "case_analysis",
    "案例分析题": "case_analysis",
    "案例分析": "case_analysis",
    "essay": "essay",
    "论述题": "essay",
    "论述": "essay",
}

QUIZ_LANGUAGE_ALIASES = {
    "multi": "multi_language",
    "multilingual": "multi_language",
    "multi_language": "multi_language",
    "multi-language": "multi_language",
    "multiple_languages": "multi_language",
    "多语言": "multi_language",
    "多語言": "multi_language",
}


def normalise_quiz_language(value: str) -> str:
    raw = str(value or "english").strip()
    key = raw.lower().replace("-", "_").replace(" ", "_")
    if key in QUIZ_LANGUAGE_ALIASES:
        return QUIZ_LANGUAGE_ALIASES[key]
    language_key = normalise_language_key(key)
    return language_key if language_key != "auto" else "english"


def quiz_language_instruction(preferred_language: str) -> str:
    key = normalise_quiz_language(preferred_language)
    if key == "multi_language":
        return (
            "Use the same dominant language as the generated notes. If the notes mix languages, "
            "write clear bilingual-friendly quiz content and preserve important source academic terms "
            "in their original language when useful."
        )
    return language_instruction_for(key)


def normalise_quiz_type(value: str) -> str:
    key = normalise_space(str(value or "")).lower().replace("-", "_").replace(" ", "_")
    return QUIZ_TYPE_ALIASES.get(key) or QUIZ_TYPE_ALIASES.get(str(value or "").strip()) or "single_choice"


def clamp_quiz_count(value, default: int = 1) -> int:
    try:
        number = int(value)
    except Exception:
        number = default
    return max(1, min(number, env_int("QUIZ_MAX_QUESTIONS", 30)))


def parse_quiz_type_plan(data: dict) -> List[dict]:
    raw_types = data.get("question_types") or data.get("types") or []
    plan: List[dict] = []
    if isinstance(raw_types, list):
        for item in raw_types:
            if isinstance(item, dict):
                qtype = normalise_quiz_type(item.get("type") or item.get("value") or item.get("label"))
                count = clamp_quiz_count(item.get("count"), 1)
            else:
                qtype = normalise_quiz_type(str(item))
                count = 1
            plan.append({"type": qtype, "count": count})

    if not plan:
        total = clamp_quiz_count(data.get("total_questions") or data.get("question_count"), 6)
        plan = [{"type": "single_choice", "count": total}]

    max_questions = env_int("QUIZ_MAX_QUESTIONS", 30)
    trimmed: List[dict] = []
    used = 0
    for item in plan:
        if used >= max_questions:
            break
        count = min(item["count"], max_questions - used)
        if count > 0:
            trimmed.append({"type": item["type"], "count": count})
            used += count
    return trimmed or [{"type": "single_choice", "count": 6}]


def expand_quiz_type_plan(plan: List[dict]) -> List[str]:
    desired: List[str] = []
    for item in plan:
        desired.extend([item["type"]] * item["count"])
    return desired


def quiz_sections_context(sections_payload) -> str:
    source = sections_payload if isinstance(sections_payload, dict) and sections_payload else stored_sections
    if not isinstance(source, dict):
        return ""
    blocks = []
    for name, content in list(source.items())[:12]:
        blocks.append(f"## {normalise_space(name)}\n{truncate_text(str(content or ''), 2600)}")
    return "\n\n".join(blocks)


def quiz_summary_context(data: dict) -> str:
    summary = data.get("summary") or stored_summary or ""
    sections_context = quiz_sections_context(data.get("sections"))
    combined = f"{summary}\n\n{sections_context}".strip()
    combined = re.sub(r"\[\[VISUAL:\d+\]\]", "[source image inserted in notes]", combined)
    return truncate_text(combined, env_int("QUIZ_CONTEXT_CHARS", 70000))


# -----------------------------------------------------------------------------
# Timeline generation
# -----------------------------------------------------------------------------

TIMELINE_TYPE_ALIASES = {
    "warm_up": "warm_up",
    "overview": "warm_up",
    "flow": "warm_up",
    "lecture": "warm_up",
    "lecture_flow": "warm_up",
    "sequence": "warm_up",
    "learn": "learn",
    "concept": "learn",
    "definition": "learn",
    "mechanism": "learn",
    "method": "learn",
    "apply": "apply",
    "evidence": "apply",
    "data": "apply",
    "figure": "apply",
    "experiment": "apply",
    "study": "apply",
    "example": "apply",
    "case": "apply",
    "application": "apply",
    "check": "check",
    "exam": "check",
    "assessment": "check",
    "test": "check",
    "revise": "revise",
    "revision": "revise",
    "review": "revise",
    "mistake": "revise",
}


def normalise_timeline_type(value: str) -> str:
    key = normalise_space(str(value or "")).lower().replace("-", "_").replace(" ", "_")
    return TIMELINE_TYPE_ALIASES.get(key, "learn")


STUDY_PATH_QUESTION_TYPE_ALIASES = {
    "short": "short_answer",
    "short_answer": "short_answer",
    "short_response": "short_answer",
    "open": "short_answer",
    "open_ended": "short_answer",
    "single": "single_choice",
    "choice": "single_choice",
    "mcq": "single_choice",
    "single_choice": "single_choice",
    "multiple": "multiple_choice",
    "multi": "multiple_choice",
    "multiple_choice": "multiple_choice",
    "true_false": "true_false",
    "truefalse": "true_false",
    "tf": "true_false",
    "true_or_false": "true_false",
    "case": "case_analysis",
    "case_analysis": "case_analysis",
    "scenario": "case_analysis",
    "application": "case_analysis",
    "compare": "compare",
    "comparison": "compare",
    "compare_contrast": "compare",
    "essay": "essay_outline",
    "outline": "essay_outline",
    "essay_outline": "essay_outline",
    "diagram": "diagram_prompt",
    "figure": "diagram_prompt",
    "visual": "diagram_prompt",
    "graph": "diagram_prompt",
    "chart": "diagram_prompt",
    "diagram_prompt": "diagram_prompt",
}


def normalise_study_path_question_type(value: str) -> str:
    key = normalise_space(str(value or "")).lower().replace("-", "_").replace(" ", "_")
    return STUDY_PATH_QUESTION_TYPE_ALIASES.get(key, "short_answer")


def fallback_study_path_question(event_type: str, title: str, summary: str, source_reference: str = "") -> dict:
    clean_title = clean_quiz_string(title, "this checkpoint")
    clean_summary = clean_quiz_string(summary, "the key idea in this checkpoint")
    if event_type == "apply":
        qtype = "case_analysis"
        prompt = f"How does this evidence or example support the concept: {clean_title}?"
    elif event_type == "check":
        qtype = "essay_outline"
        prompt = f"What would be the first three points in an exam answer about {clean_title}?"
    elif event_type == "revise":
        qtype = "true_false"
        prompt = f"True or false: {clean_summary[:150]}"
    elif event_type == "learn":
        qtype = "short_answer"
        prompt = f"What does {clean_title} mean, and why is it important here?"
    else:
        qtype = "short_answer"
        prompt = f"What is the main question or goal of {clean_title}?"
    return {
        "type": qtype,
        "prompt": truncate_text(prompt, 280),
        "options": ["True", "False"] if qtype == "true_false" else [],
        "correct_option_indexes": [],
        "correct_boolean": True if qtype == "true_false" else None,
        "expected_answer": truncate_text(clean_summary, 420),
        "explanation": "A strong answer should use the task focus and connect it back to the notes, source evidence, or example.",
        "source_reference": truncate_text(source_reference or clean_title, 180),
    }


def normalise_study_path_practice_question(raw, fallback_event: dict, title: str, index: int) -> dict:
    fallback = fallback_event.get("practice_question") or fallback_study_path_question(
        normalise_timeline_type(fallback_event.get("type")),
        title or fallback_event.get("title") or f"Checkpoint {index + 1}",
        fallback_event.get("summary") or fallback_event.get("detail") or "",
        fallback_event.get("source_reference") or fallback_event.get("section") or "",
    )
    if isinstance(raw, str):
        source = {"prompt": raw}
    elif isinstance(raw, dict):
        source = raw
    else:
        source = {}

    qtype = normalise_study_path_question_type(
        source.get("type") or source.get("question_type") or source.get("questionType") or fallback.get("type")
    )
    prompt = clean_quiz_string(
        source.get("prompt") or source.get("question") or source.get("title"),
        fallback.get("prompt", ""),
    )
    options = source.get("options") if isinstance(source.get("options"), list) else source.get("choices")
    options = [clean_quiz_string(option) for option in options if clean_quiz_string(option)] if isinstance(options, list) else list(fallback.get("options") or [])
    options = options[:6]
    if qtype == "true_false" and len(options) < 2:
        options = ["True", "False"]
    if qtype not in {"single_choice", "multiple_choice", "true_false"}:
        options = []

    correct_indexes = coerce_option_indexes(
        source.get("correct_option_indexes", source.get("correctOptionIndexes", source.get("correct_indexes", source.get("answer_index", source.get("answer"))))),
        options,
    )
    fallback_indexes = fallback.get("correct_option_indexes") if isinstance(fallback.get("correct_option_indexes"), list) else []
    if qtype in {"single_choice", "multiple_choice"} and not correct_indexes:
        correct_indexes = [idx for idx in fallback_indexes if isinstance(idx, int) and 0 <= idx < len(options)]
    if qtype == "single_choice":
        correct_indexes = correct_indexes[:1]
    elif qtype == "multiple_choice" and len(correct_indexes) < 2 and len(options) >= 2:
        correct_indexes = correct_indexes or [0, 1]
    elif qtype not in {"single_choice", "multiple_choice"}:
        correct_indexes = []

    correct_boolean = coerce_boolean(source.get("correct_boolean", source.get("correctBoolean", source.get("answer"))))
    if qtype == "true_false" and correct_boolean is None:
        correct_boolean = coerce_boolean(fallback.get("correct_boolean"))
    if qtype != "true_false":
        correct_boolean = None

    return {
        "type": qtype,
        "prompt": truncate_text(prompt, 360),
        "options": [truncate_text(option, 180) for option in options],
        "correct_option_indexes": correct_indexes,
        "correct_boolean": correct_boolean,
        "expected_answer": truncate_text(clean_quiz_string(
            source.get("expected_answer") or source.get("expectedAnswer") or source.get("answer_guide") or source.get("answerGuide"),
            fallback.get("expected_answer", ""),
        ), 650),
        "explanation": truncate_text(clean_quiz_string(source.get("explanation") or source.get("rationale"), fallback.get("explanation", "")), 520),
        "source_reference": truncate_text(clean_quiz_string(
            source.get("source_reference") or source.get("sourceReference") or source.get("source"),
            fallback.get("source_reference", ""),
        ), 220),
    }


def fallback_timeline_from_context(title: str, sections: Dict[str, str], context: str) -> dict:
    ordered_names = list(sections.keys())[:10] if isinstance(sections, dict) else []
    if not ordered_names:
        snippets = [
            normalise_space(line.lstrip("#-0123456789. "))
            for line in context.splitlines()
            if len(normalise_space(line.lstrip("#-0123456789. "))) > 30
        ][:8]
        ordered_names = [f"Checkpoint {index + 1}" for index, _ in enumerate(snippets)]
        section_lookup = dict(zip(ordered_names, snippets))
    else:
        section_lookup = sections

    events = []
    for index, name in enumerate(ordered_names[:12]):
        text = section_lookup.get(name, "") if isinstance(section_lookup, dict) else ""
        summary = first_good_sentence(text, 180) or normalise_space(str(text))[:180] or "Review this stage in the notes."
        event_type = "warm_up"
        lowered = f"{name} {summary}".lower()
        if re.search(r"\b(table|figure|data|result|evidence|study|experiment|graph|chart)\b", lowered):
            event_type = "apply"
        elif re.search(r"\b(example|case|application)\b", lowered):
            event_type = "apply"
        elif re.search(r"\b(exam|revision|mistake|critical)\b", lowered):
            event_type = "check"
        elif re.search(r"\b(definition|concept|idea|method|model)\b", lowered):
            event_type = "learn"
        practice_question = fallback_study_path_question(event_type, name, summary, name)
        events.append({
            "id": sha256_text(f"{name}-{index}")[:10],
            "order": index + 1,
            "marker": f"Task {index + 1}",
            "type": event_type,
            "title": short_mindmap_text(name, 72),
            "section": name,
            "summary": summary,
            "detail": summary,
            "task": f"Read this part and write a two-sentence explanation of: {summary[:120]}",
            "active_prompt": f"Without looking, explain the key idea from {name}.",
            "practice_question": practice_question,
            "deliverable": "A short explanation in your own words.",
            "mastery_check": "You can explain the idea and connect it to one piece of source evidence.",
            "estimated_minutes": 8,
            "priority": "medium",
            "evidence": "",
            "why_it_matters": "This checkpoint helps organise the material into a learnable sequence.",
            "misconception": "",
            "exam_use": "Use it as a revision checkpoint before moving to the next concept.",
            "source_reference": name,
            "related_terms": [],
        })

    return {
        "title": clean_quiz_string(title, stored_title or "Study Path"),
        "summary": "A task-based study path that moves from orientation to practice and exam-ready revision.",
        "events": events,
    }


def normalise_timeline(raw: dict, fallback: dict) -> dict:
    if not isinstance(raw, dict):
        raw = {}
    raw_events = raw.get("events") if isinstance(raw.get("events"), list) else []
    fallback_events = fallback.get("events", []) or []
    events: List[dict] = []
    for index, event in enumerate(raw_events[: env_int("TIMELINE_MAX_EVENTS", 16)]):
        if not isinstance(event, dict):
            continue
        fallback_event = fallback_events[min(index, len(fallback_events) - 1)] if fallback_events else {}
        title = clean_quiz_string(event.get("title") or event.get("label"), fallback_event.get("title", f"Checkpoint {index + 1}"))
        summary = clean_quiz_string(event.get("summary") or event.get("what_happens"), fallback_event.get("summary", ""))
        detail = clean_quiz_string(event.get("detail") or event.get("explanation") or event.get("why"), fallback_event.get("detail", summary))
        evidence = clean_quiz_string(event.get("evidence") or event.get("source_evidence"), fallback_event.get("evidence", ""))
        try:
            estimated_minutes = int(event.get("estimated_minutes") or event.get("estimatedMinutes") or fallback_event.get("estimated_minutes") or 8)
        except Exception:
            estimated_minutes = 8
        estimated_minutes = max(3, min(estimated_minutes, 60))
        if not title or not (summary or detail or evidence):
            continue
        related_terms = event.get("related_terms") or event.get("relatedTerms") or []
        if not isinstance(related_terms, list):
            related_terms = []
        events.append({
            "id": clean_quiz_string(event.get("id"), sha256_text(f"{title}-{index}")[:10]),
            "order": index + 1,
            "marker": clean_quiz_string(event.get("marker") or event.get("time") or event.get("step"), f"Step {index + 1}"),
            "type": normalise_timeline_type(event.get("type") or fallback_event.get("type")),
            "title": truncate_text(title, 140),
            "section": clean_quiz_string(event.get("section"), fallback_event.get("section", "")),
            "summary": truncate_text(summary, 420),
            "detail": truncate_text(detail, 900),
            "task": truncate_text(clean_quiz_string(event.get("task") or event.get("action") or event.get("study_task"), fallback_event.get("task", detail or summary)), 650),
            "active_prompt": truncate_text(clean_quiz_string(event.get("active_prompt") or event.get("recall_prompt"), fallback_event.get("active_prompt", "")), 520),
            "practice_question": normalise_study_path_practice_question(
                event.get("practice_question") or event.get("practiceQuestion") or event.get("question"),
                fallback_event,
                title,
                index,
            ),
            "deliverable": truncate_text(clean_quiz_string(event.get("deliverable") or event.get("output"), fallback_event.get("deliverable", "")), 420),
            "mastery_check": truncate_text(clean_quiz_string(event.get("mastery_check") or event.get("checkpoint"), fallback_event.get("mastery_check", "")), 420),
            "estimated_minutes": estimated_minutes,
            "priority": clean_quiz_string(event.get("priority"), fallback_event.get("priority", "medium")).lower(),
            "evidence": truncate_text(evidence, 700),
            "why_it_matters": truncate_text(clean_quiz_string(event.get("why_it_matters") or event.get("whyItMatters"), fallback_event.get("why_it_matters", "")), 520),
            "misconception": truncate_text(clean_quiz_string(event.get("misconception") or event.get("common_mistake"), fallback_event.get("misconception", "")), 420),
            "exam_use": truncate_text(clean_quiz_string(event.get("exam_use") or event.get("examUse"), fallback_event.get("exam_use", "")), 420),
            "source_reference": truncate_text(clean_quiz_string(event.get("source_reference") or event.get("source"), fallback_event.get("source_reference", "")), 220),
            "related_terms": [truncate_text(clean_quiz_string(term), 48) for term in related_terms if clean_quiz_string(term)][:6],
        })

    if len(events) < 3:
        events = fallback_events[: env_int("TIMELINE_MAX_EVENTS", 16)]
    return {
        "title": clean_quiz_string(raw.get("title"), fallback.get("title", "Study Path")),
        "summary": truncate_text(clean_quiz_string(raw.get("summary"), fallback.get("summary", "")), 520),
        "events": events,
    }


@app.post("/timeline/generate")
async def generate_timeline(data: dict):
    try:
        require_openai()
        payload = data or {}
        title = clean_quiz_string(payload.get("title") if isinstance(payload, dict) else "", stored_title or "Study Path")
        context = quiz_summary_context(payload)
        if not context:
            return {"error": "No generated notes are available for timeline generation yet."}

        sections_payload = payload.get("sections") if isinstance(payload, dict) else {}
        sections_source = sections_payload if isinstance(sections_payload, dict) and sections_payload else stored_sections
        fallback = fallback_timeline_from_context(title, sections_source if isinstance(sections_source, dict) else {}, context)
        language_rule = language_instruction_for(payload.get("preferred_language", "auto") if isinstance(payload, dict) else "auto")

        prompt = f"""
Create an interactive Study Path for a learning app.
{language_rule}

This should NOT behave like a mind map and should NOT merely reorder the notes.
It must be an actionable sequence of study tasks. Each item should tell the student what to do next, how long to spend, how to actively recall, what output to produce, and how to know they have mastered it.

Return JSON only with this shape:
{{
  "title": "short study path title",
  "summary": "one sentence explaining how this path helps the learner study",
  "events": [
    {{
      "marker": "Task 1 / 10 min / First pass",
      "type": "warm_up | learn | apply | check | revise",
      "title": "short task title",
      "section": "matching section heading from the notes if possible",
      "summary": "why this task exists",
      "task": "specific action the student should do now",
      "active_prompt": "self-test prompt the student should answer from memory",
      "practice_question": {{
        "type": "short_answer | single_choice | multiple_choice | true_false | case_analysis | compare | essay_outline | diagram_prompt",
        "prompt": "one short, direct question the student can answer now",
        "options": ["only for single_choice, multiple_choice, or true_false"],
        "correct_option_indexes": [0],
        "correct_boolean": true,
        "expected_answer": "brief answer guide or key points",
        "explanation": "why this answer is right or how to approach it",
        "source_reference": "source evidence or concept used by the question"
      }},
      "deliverable": "what the student should produce",
      "mastery_check": "how the student knows they are ready to move on",
      "estimated_minutes": 8,
      "priority": "high | medium | low",
      "detail": "supporting explanation for the task",
      "evidence": "specific source evidence, figure, table, study, or example if relevant",
      "why_it_matters": "why this checkpoint matters",
      "misconception": "common mistake or confusion",
      "exam_use": "how to use this in an answer or revision",
      "source_reference": "source concept/evidence, not only a page number",
      "related_terms": ["term 1", "term 2"]
    }}
  ]
}}

Rules:
- Return 6 to 12 tasks unless the notes are very short.
- The first task should orient the learner; the middle tasks should practise concepts/evidence/examples; the final tasks should check exam readiness or revision.
- Every task must include practice_question. This is the explicit short question the student sees first, so it must make the student know exactly what to answer.
- Use a varied mix of practice_question types. Do not default to multiple choice. Prefer short_answer, case_analysis, compare, diagram_prompt, and essay_outline when those are better for understanding; use single_choice, multiple_choice, and true_false only when options genuinely help.
- Practice questions should be answerable from the notes and should be shorter than the supporting explanation.
- Use realistic estimated_minutes values from 5 to 25.
- Do not invent dates. If no real date exists, use Step markers.
- Use exact course concepts, named researchers, experiments, diagrams, tables, and data only when they appear in the notes context.
- Do not add external researchers, studies, citations, dates, or examples that are not present in the generated notes context.
- If a checkpoint has no explicit study/table/figure in the notes, keep evidence brief and say what the notes themselves state; do not fabricate a source.
- Do not ask the student to merely remember slide/page numbers.
- Keep every user-facing value in the required language.
- Keep task titles short enough for a vertical rail.
- Make tasks meaningfully different from each other; no duplicated checkpoints.
- Every task must be action-oriented, for example "draw", "compare", "explain from memory", "answer", "identify", "rewrite", "test yourself".

Current note title: {title}

Generated notes context:
{context}
"""
        raw = generate_chat(
            [
                {"role": "system", "content": "You generate rigorous source-grounded study timelines as strict JSON. Never include markdown fences or prose outside JSON."},
                {"role": "user", "content": prompt},
            ],
            model=model_for_depth("detailed"),
            temperature=float(os.getenv("TIMELINE_TEMPERATURE", "0.25")),
            max_tokens=env_int("TIMELINE_GENERATION_TOKENS", 6500),
        )
        parsed = extract_json_object(raw)
        timeline = normalise_timeline(parsed or {}, fallback)
        return {
            **timeline,
            "generated_at": datetime.utcnow().isoformat() + "Z",
        }
    except Exception as error:
        return {"error": str(error)}


def study_path_answer_text(answer_payload) -> str:
    if isinstance(answer_payload, dict):
        if isinstance(answer_payload.get("selected_options"), list) and answer_payload.get("selected_options"):
            return "; ".join(clean_quiz_string(item) for item in answer_payload.get("selected_options") if clean_quiz_string(item))
        return clean_quiz_string(answer_payload.get("text") or answer_payload.get("answer") or answer_payload.get("value"))
    if isinstance(answer_payload, list):
        return "; ".join(clean_quiz_string(item) for item in answer_payload if clean_quiz_string(item))
    return clean_quiz_string(answer_payload)


def study_path_selected_indexes(answer_payload, options: List[str]) -> List[int]:
    if isinstance(answer_payload, dict):
        raw = answer_payload.get("selected_indexes")
        if raw is None:
            raw = answer_payload.get("selectedIndexes")
        if raw is None:
            raw = answer_payload.get("selected_index")
        if raw is None:
            raw = answer_payload.get("answer")
        return coerce_option_indexes(raw, options)
    return coerce_option_indexes(answer_payload, options)


def study_path_local_correct(question: dict, answer_payload) -> Optional[bool]:
    qtype = normalise_study_path_question_type(question.get("type"))
    options = question.get("options") if isinstance(question.get("options"), list) else []
    options = [clean_quiz_string(option) for option in options if clean_quiz_string(option)]
    selected_indexes = study_path_selected_indexes(answer_payload, options)
    if qtype == "single_choice":
        correct_indexes = coerce_option_indexes(question.get("correct_option_indexes") or question.get("correctOptionIndexes"), options)
        return bool(correct_indexes) and selected_indexes[:1] == correct_indexes[:1]
    if qtype == "multiple_choice":
        correct_indexes = coerce_option_indexes(question.get("correct_option_indexes") or question.get("correctOptionIndexes"), options)
        return bool(correct_indexes) and sorted(selected_indexes) == sorted(correct_indexes)
    if qtype == "true_false":
        correct_boolean = coerce_boolean(question.get("correct_boolean", question.get("correctBoolean")))
        if correct_boolean is None:
            return None
        if selected_indexes:
            answer_boolean = selected_indexes[0] == 0
        else:
            answer_boolean = coerce_boolean(study_path_answer_text(answer_payload))
        return answer_boolean is not None and answer_boolean == correct_boolean
    return None


def fallback_replacement_study_path_question(event: dict, previous_question: dict, answer_text: str) -> dict:
    event_type = normalise_timeline_type(event.get("type"))
    title = clean_quiz_string(event.get("title") or event.get("section"), "this checkpoint")
    summary = clean_quiz_string(event.get("summary") or event.get("detail") or event.get("task"), previous_question.get("expected_answer", ""))
    replacement = fallback_study_path_question(event_type, title, summary, event.get("source_reference") or event.get("sourceReference") or title)
    previous_type = normalise_study_path_question_type(previous_question.get("type"))
    if previous_type == "single_choice":
        replacement.update({
            "type": "short_answer",
            "prompt": f"In one or two sentences, correct the misunderstanding in this answer: {truncate_text(answer_text, 120)}",
            "options": [],
            "correct_option_indexes": [],
            "correct_boolean": None,
        })
    elif previous_type in {"short_answer", "case_analysis", "compare"}:
        replacement.update({
            "type": "true_false",
            "prompt": f"True or false: {truncate_text(summary, 150)}",
            "options": ["True", "False"],
            "correct_option_indexes": [],
            "correct_boolean": True,
        })
    return replacement


def generate_replacement_study_path_question(event: dict, question: dict, answer_text: str, preferred_language: str) -> dict:
    language_rule = language_instruction_for(preferred_language or "auto")
    prompt = f"""
Create ONE new practice question for the same Study Path task because the student got the previous question wrong.
{language_rule}

Return JSON only:
{{
  "type": "short_answer | single_choice | multiple_choice | true_false | case_analysis | compare | essay_outline | diagram_prompt",
  "prompt": "short direct question",
  "options": ["only if needed"],
  "correct_option_indexes": [0],
  "correct_boolean": true,
  "expected_answer": "brief answer guide",
  "explanation": "why this answer is right",
  "source_reference": "source concept/evidence"
}}

Rules:
- Make it different from the previous question.
- Keep it directly about the same task, source concept, or evidence.
- Prefer a simpler diagnostic question if the previous answer shows confusion.
- Do not invent external examples or studies.
- Do not ask only for a page or slide number.

Study Path task:
Title: {clean_quiz_string(event.get("title"))}
Type: {normalise_timeline_type(event.get("type"))}
Summary: {truncate_text(clean_quiz_string(event.get("summary")), 700)}
Task: {truncate_text(clean_quiz_string(event.get("task")), 700)}
Evidence: {truncate_text(clean_quiz_string(event.get("evidence")), 700)}
Source reference: {clean_quiz_string(event.get("source_reference") or event.get("sourceReference"))}

Previous question:
{json.dumps(question, ensure_ascii=False)[:1800]}

Student's wrong answer:
{truncate_text(answer_text, 700)}
"""
    try:
        raw = generate_chat(
            [
                {"role": "system", "content": "You create concise source-grounded study practice questions as strict JSON."},
                {"role": "user", "content": prompt},
            ],
            model=model_for_depth("focused"),
            temperature=0.35,
            max_tokens=env_int("TIMELINE_CHECK_TOKENS", 1600),
        )
        parsed = extract_json_object(raw)
        if isinstance(parsed, dict):
            return normalise_study_path_practice_question(parsed, event, event.get("title", ""), 0)
    except Exception:
        pass
    return normalise_study_path_practice_question(
        fallback_replacement_study_path_question(event, question, answer_text),
        event,
        event.get("title", ""),
        0,
    )


@app.post("/timeline/check-answer")
async def check_timeline_answer(data: dict):
    try:
        require_openai()
        payload = data or {}
        raw_event = payload.get("event") if isinstance(payload.get("event"), dict) else {}
        raw_question = payload.get("question") if isinstance(payload.get("question"), dict) else {}
        preferred_language = payload.get("preferred_language", "auto")
        if not raw_question:
            return {"error": "No practice question was provided."}

        event = {
            "type": normalise_timeline_type(raw_event.get("type")),
            "title": clean_quiz_string(raw_event.get("title") or raw_event.get("section"), "Study task"),
            "section": clean_quiz_string(raw_event.get("section")),
            "summary": truncate_text(clean_quiz_string(raw_event.get("summary")), 700),
            "detail": truncate_text(clean_quiz_string(raw_event.get("detail")), 900),
            "task": truncate_text(clean_quiz_string(raw_event.get("task")), 700),
            "evidence": truncate_text(clean_quiz_string(raw_event.get("evidence")), 700),
            "source_reference": truncate_text(clean_quiz_string(raw_event.get("source_reference") or raw_event.get("sourceReference")), 220),
        }
        question = normalise_study_path_practice_question(raw_question, event, event.get("title", ""), 0)
        answer_payload = payload.get("answer")
        answer_text = study_path_answer_text(answer_payload)
        if not answer_text:
            return {"error": "Answer is empty."}

        local_correct = study_path_local_correct(question, answer_payload)
        feedback = ""
        correct = bool(local_correct) if local_correct is not None else False

        if local_correct is None:
            language_rule = language_instruction_for(preferred_language or "auto")
            context = quiz_summary_context(payload)
            prompt = f"""
Grade the student's answer to one Study Path practice question.
{language_rule}

Return JSON only:
{{
  "correct": true,
  "feedback": "one or two sentences explaining the judgement"
}}

Mark correct only if the answer captures the core idea accurately enough to move on.
Accept wording differences, but reject vague, contradictory, or source-unsupported answers.

Question:
{json.dumps(question, ensure_ascii=False)[:1800]}

Study Path task:
Title: {event['title']}
Summary: {event['summary']}
Task: {event['task']}
Evidence: {event['evidence']}

Student answer:
{truncate_text(answer_text, 1200)}

Notes context:
{truncate_text(context, 5000)}
"""
            raw = generate_chat(
                [
                    {"role": "system", "content": "You are a strict but helpful study-answer grader. Return strict JSON."},
                    {"role": "user", "content": prompt},
                ],
                model=model_for_depth("focused"),
                temperature=0,
                max_tokens=env_int("TIMELINE_CHECK_TOKENS", 1600),
            )
            parsed = extract_json_object(raw)
            if isinstance(parsed, dict):
                correct = bool(parsed.get("correct"))
                feedback = truncate_text(clean_quiz_string(parsed.get("feedback")), 420)

        if correct:
            if not feedback:
                feedback = "Correct. You can mark this task done."
            return {"correct": True, "feedback": feedback}

        new_question = generate_replacement_study_path_question(event, question, answer_text, preferred_language)
        if not feedback:
            feedback = "Not quite. Try the new question below before marking this task done."
        return {
            "correct": False,
            "feedback": feedback,
            "new_question": new_question,
        }
    except Exception as error:
        return {"error": str(error)}


def quiz_question_signature(value: str) -> str:
    text = normalise_space(str(value or "")).lower()
    text = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", " ", text)
    return normalise_space(text)[:220]


def extract_quiz_avoidance(data: dict) -> List[dict]:
    raw_items = []
    if isinstance(data, dict):
        for key in ["avoid_questions", "previous_questions"]:
            value = data.get(key)
            if isinstance(value, list):
                raw_items.extend(value)
        previous_quizzes = data.get("previous_quizzes")
        if isinstance(previous_quizzes, list):
            for quiz in previous_quizzes:
                if isinstance(quiz, dict) and isinstance(quiz.get("questions"), list):
                    raw_items.extend(quiz.get("questions") or [])

    items: List[dict] = []
    seen = set()
    for raw in raw_items:
        if isinstance(raw, str):
            question = clean_quiz_string(raw)
            qtype = ""
            source = ""
            options: List[str] = []
        elif isinstance(raw, dict):
            question = clean_quiz_string(raw.get("question") or raw.get("prompt"))
            qtype = normalise_quiz_type(raw.get("type") or "")
            source = clean_quiz_string(raw.get("source_reference") or raw.get("sourceReference") or raw.get("source"))
            raw_options = raw.get("options") if isinstance(raw.get("options"), list) else []
            options = [clean_quiz_string(option) for option in raw_options if clean_quiz_string(option)][:5]
        else:
            continue
        signature = quiz_question_signature(question)
        if not signature or signature in seen:
            continue
        seen.add(signature)
        items.append({
            "type": qtype,
            "question": truncate_text(question, 260),
            "source_reference": truncate_text(source, 160),
            "options": options,
            "signature": signature,
        })
        if len(items) >= env_int("QUIZ_AVOID_QUESTION_LIMIT", 80):
            break
    return items


def quiz_avoidance_prompt(items: List[dict]) -> str:
    if not items:
        return "No previous quiz questions were provided."
    lines = []
    for index, item in enumerate(items[: env_int("QUIZ_AVOID_PROMPT_LIMIT", 36)], start=1):
        details = []
        if item.get("type"):
            details.append(item["type"])
        if item.get("source_reference"):
            details.append(item["source_reference"])
        if item.get("options"):
            details.append("options: " + " | ".join(item["options"][:4]))
        suffix = f" ({'; '.join(details)})" if details else ""
        lines.append(f"{index}. {item['question']}{suffix}")
    return "\n".join(lines)


def coerce_option_indexes(value, options: List[str]) -> List[int]:
    if value is None:
        return []
    raw_values = value if isinstance(value, list) else [value]
    indexes = []
    for raw in raw_values:
        idx = None
        if isinstance(raw, int):
            idx = raw
        elif isinstance(raw, str):
            stripped = raw.strip()
            if stripped.isdigit():
                idx = int(stripped)
            elif len(stripped) == 1 and stripped.upper() in "ABCDE":
                idx = ord(stripped.upper()) - ord("A")
            else:
                for option_index, option in enumerate(options):
                    if normalise_space(option).lower() == normalise_space(stripped).lower():
                        idx = option_index
                        break
        if idx is not None and 0 <= idx < len(options) and idx not in indexes:
            indexes.append(idx)
    return indexes


def coerce_boolean(value) -> Optional[bool]:
    if isinstance(value, bool):
        return value
    text = normalise_space(str(value or "")).lower()
    if text in {"true", "t", "yes", "correct", "right", "对", "正确", "是"}:
        return True
    if text in {"false", "f", "no", "incorrect", "wrong", "错", "错误", "否"}:
        return False
    return None


def clean_quiz_string(value, fallback: str = "") -> str:
    cleaned = normalise_space(str(value or ""))
    return cleaned or fallback


def fallback_quiz_question(qtype: str, index: int, title: str, context: str) -> dict:
    topic = title or stored_title or "the uploaded material"
    snippets = [
        normalise_space(line.lstrip("#-0123456789. "))
        for line in context.splitlines()
        if len(normalise_space(line.lstrip("#-0123456789. "))) > 24
    ]
    focus = snippets[index % len(snippets)] if snippets else f"the main idea in {topic}"
    base = {
        "id": f"q{index + 1}",
        "type": qtype,
        "question": f"Using the study material, explain or judge this key point: {focus[:180]}",
        "options": [],
        "correct_option_indexes": [],
        "correct_boolean": None,
        "expected_answer": f"A strong answer should accurately explain: {focus[:220]}",
        "explanation": "This question checks whether you can connect the key concept to source evidence instead of memorising only a heading.",
        "source_reference": topic,
        "difficulty": "medium",
        "points": 1,
        "rubric": ["Use the relevant concept from the material", "Explain the reason or evidence", "Avoid vague general statements"],
    }
    if qtype == "single_choice":
        base.update({
            "question": f"Which option best matches this point from the material: {focus[:160]}",
            "options": [focus[:160], "A decorative detail unrelated to the topic", "Only the page number matters", "The material provides no evidence"],
            "correct_option_indexes": [0],
        })
    elif qtype == "multiple_choice":
        base.update({
            "question": f"Which statements are reasonable about this point from the material? {focus[:150]}",
            "options": [focus[:150], "It should be understood with source evidence", "The heading alone is enough for the full answer", "It can be explained with relevant examples or figures", "It is unrelated to the core course concepts"],
            "correct_option_indexes": [0, 1, 3],
        })
    elif qtype == "true_false":
        base.update({
            "question": f"True or false: this point should be understood with concrete evidence, not only by memorising a page number. Point: {focus[:140]}",
            "options": ["True", "False"],
            "correct_boolean": True,
        })
    elif qtype == "case_analysis":
        base.update({
            "points": 4,
            "question": f"Case analysis: if an exam asks you to explain \"{focus[:120]}\" using the material, how would you organise your answer?",
        })
    elif qtype == "essay":
        base.update({
            "points": 5,
            "question": f"Essay: write a structured response about \"{focus[:130]}\" using concepts, evidence, and examples from the material.",
        })
    elif qtype == "short_answer":
        base.update({"points": 2})
    return base


def normalise_quiz_questions(parsed: dict, desired_types: List[str], title: str, context: str, avoid_items: Optional[List[dict]] = None) -> List[dict]:
    raw_questions = parsed.get("questions") if isinstance(parsed, dict) else []
    if not isinstance(raw_questions, list):
        raw_questions = []

    questions: List[dict] = []
    used_signatures = {item.get("signature") for item in (avoid_items or []) if item.get("signature")}
    for index, desired_type in enumerate(desired_types):
        raw = raw_questions[index] if index < len(raw_questions) and isinstance(raw_questions[index], dict) else {}
        qtype = normalise_quiz_type(raw.get("type") or desired_type)
        if qtype != desired_type:
            qtype = desired_type
        fallback = fallback_quiz_question(qtype, index, title, context)

        options = raw.get("options") if isinstance(raw.get("options"), list) else fallback.get("options", [])
        options = [clean_quiz_string(option) for option in options if clean_quiz_string(option)]

        correct_indexes = coerce_option_indexes(
            raw.get("correct_option_indexes", raw.get("correct_indexes", raw.get("answer_index", raw.get("answer")))),
            options,
        )
        correct_boolean = coerce_boolean(raw.get("correct_boolean", raw.get("answer")))

        if qtype in {"single_choice", "multiple_choice"}:
            if len(options) < 2:
                options = fallback["options"]
            if not correct_indexes:
                correct_indexes = fallback.get("correct_option_indexes", [0])
            if qtype == "single_choice":
                correct_indexes = correct_indexes[:1] or [0]
            else:
                correct_indexes = correct_indexes[: max(2, min(len(correct_indexes), len(options)))]
                if len(correct_indexes) < 2 and len(options) >= 2:
                    correct_indexes = [0, 1]
        elif qtype == "true_false":
            options = ["True", "False"]
            if correct_boolean is None:
                correct_boolean = fallback.get("correct_boolean", True)
            correct_indexes = [0 if correct_boolean else 1]
        else:
            options = []
            correct_indexes = []
            correct_boolean = None

        question = {
            "id": f"q{index + 1}",
            "type": qtype,
            "label": QUIZ_TYPE_LABELS.get(qtype, qtype),
            "question": clean_quiz_string(raw.get("question") or raw.get("prompt"), fallback["question"]),
            "options": options,
            "correct_option_indexes": correct_indexes,
            "correct_boolean": correct_boolean,
            "expected_answer": clean_quiz_string(raw.get("expected_answer") or raw.get("answer_text"), fallback["expected_answer"]),
            "explanation": clean_quiz_string(raw.get("explanation"), fallback["explanation"]),
            "source_reference": clean_quiz_string(raw.get("source_reference") or raw.get("source"), fallback["source_reference"]),
            "difficulty": clean_quiz_string(raw.get("difficulty"), fallback["difficulty"]).lower(),
            "points": clamp_quiz_count(raw.get("points"), fallback.get("points", 1)),
            "rubric": raw.get("rubric") if isinstance(raw.get("rubric"), list) else fallback["rubric"],
        }
        signature = quiz_question_signature(question["question"])
        if signature in used_signatures:
            replacement = fallback_quiz_question(qtype, index + len(used_signatures), title, context)
            question.update({
                "question": replacement["question"],
                "options": replacement.get("options", []),
                "correct_option_indexes": replacement.get("correct_option_indexes", []),
                "correct_boolean": replacement.get("correct_boolean"),
                "expected_answer": replacement.get("expected_answer", question["expected_answer"]),
                "explanation": "This replacement avoids repeating a quiz question already generated for these notes.",
                "source_reference": replacement.get("source_reference", question["source_reference"]),
                "difficulty": replacement.get("difficulty", question["difficulty"]),
                "points": replacement.get("points", question["points"]),
                "rubric": replacement.get("rubric", question["rubric"]),
            })
            signature = quiz_question_signature(question["question"])
        used_signatures.add(signature)
        question["rubric"] = [clean_quiz_string(item) for item in question["rubric"] if clean_quiz_string(item)][:6]
        questions.append(question)
    return questions


@app.post("/quiz/generate")
async def generate_quiz(data: dict):
    try:
        require_openai()
        plan = parse_quiz_type_plan(data or {})
        desired_types = expand_quiz_type_plan(plan)
        title = clean_quiz_string(data.get("title") if isinstance(data, dict) else "", stored_title or "Study Quiz")
        preferred_language = normalise_quiz_language(data.get("preferred_language", "english") if isinstance(data, dict) else "english")
        exam_mode = bool(data.get("exam_mode", False)) if isinstance(data, dict) else False
        avoid_items = extract_quiz_avoidance(data or {})
        try:
            previous_quiz_count = int((data or {}).get("previous_quiz_count", len(avoid_items))) if isinstance(data, dict) else 0
        except Exception:
            previous_quiz_count = len(avoid_items)
        previous_quiz_count = max(0, min(previous_quiz_count, 200))
        variant_seed = clean_quiz_string((data or {}).get("variant_seed") if isinstance(data, dict) else "", "")
        context = quiz_summary_context(data or {})
        if not context:
            return {"error": "No generated notes are available for quiz generation yet."}
        if not variant_seed:
            variant_seed = sha256_text(f"{title}|{len(avoid_items)}|{context[:400]}")[:12]

        plan_lines = "\n".join(
            f"- {QUIZ_TYPE_LABELS.get(item['type'], item['type'])} ({item['type']}): {item['count']}"
            for item in plan
        )
        language_rule = quiz_language_instruction(preferred_language)
        avoid_prompt = quiz_avoidance_prompt(avoid_items)
        schema = """
Return JSON only with this exact shape. Keep JSON keys in English. Every user-facing value must follow the language requirement:
{
  "title": "short quiz title",
  "questions": [
    {
      "type": "single_choice | multiple_choice | true_false | short_answer | case_analysis | essay",
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correct_option_indexes": [0],
      "correct_boolean": true,
      "expected_answer": "model answer",
      "explanation": "explanation grounded in the uploaded material",
      "source_reference": "nearby concept/source evidence, not just a page number",
      "difficulty": "easy | medium | hard",
      "points": 1,
      "rubric": ["criterion 1", "criterion 2"]
    }
  ]
}
"""
        prompt = f"""
Create a high-quality study quiz from the generated notes below.

Language requirement: {language_rule}
Additional hard rule: all user-facing quiz content must follow the language requirement, including title, questions, options, explanations, expected answers, source_reference, and rubric.
Quiz title/topic: {title}
Exam mode enabled: {exam_mode}
Already generated quiz count for this note: {previous_quiz_count}
Variation seed: {variant_seed}

Question type plan. Return exactly {len(desired_types)} questions, in this order:
{plan_lines}

Previously generated questions for this exact note. Avoid repeating these question wordings, scenarios, answer options, and source angles:
{avoid_prompt}

Quality requirements:
- Test understanding, transfer, source evidence, and common confusions, not trivia.
- Use the student's uploaded-file content as the authority.
- Prefer concepts that were explained with concrete examples, diagrams, tables, data, experiments, or source images in the notes.
- If previous questions exist, choose different concepts, different examples, different source visuals/data, or a harder/different angle. Do not make a paraphrase of an old question.
- Do not ask "what page/slide number"; use the concept or image/data content directly.
- For single choice, provide exactly 4 plausible options and one correct index.
- For multiple choice, provide 5 plausible options and at least 2 correct indexes.
- For true/false, provide correct_boolean and a short explanation.
- For short answer, case analysis, and essay, provide expected_answer and a clear rubric.
- Keep each question self-contained and useful for revision.
- Use source_reference to name the concept/evidence, not only a page or slide number.

{schema}

Generated notes context:
{context}
"""
        raw = generate_chat(
            [
                {"role": "system", "content": "You generate rigorous, source-grounded quizzes as strict JSON. Never include markdown fences or prose outside JSON."},
                {"role": "user", "content": prompt},
            ],
            model=model_for_depth("detailed"),
            temperature=float(os.getenv("QUIZ_TEMPERATURE", "0.45")),
            max_tokens=env_int("QUIZ_GENERATION_TOKENS", 6500),
        )
        parsed = extract_json_object(raw)
        questions = normalise_quiz_questions(parsed, desired_types, title, context, avoid_items)
        return {
            "title": clean_quiz_string(parsed.get("title") if isinstance(parsed, dict) else "", f"{title} Quiz"),
            "exam_mode": exam_mode,
            "preferred_language": preferred_language,
            "total_questions": len(questions),
            "question_types": plan,
            "questions": questions,
        }
    except Exception as error:
        return {"error": str(error)}


# -----------------------------------------------------------------------------
# Flashcard generation
# -----------------------------------------------------------------------------

def clamp_flashcard_count(value, default: int = 16) -> int:
    try:
        number = int(value)
    except Exception:
        number = default
    return max(1, min(number, env_int("FLASHCARD_MAX_CARDS", 80)))


def resolve_flashcard_count(data: dict, context: str) -> Tuple[str, int]:
    mode = normalise_space(str(data.get("count_mode") or "auto")).lower().replace("-", "_")
    if mode in {"30", "thirty"}:
        return "30", clamp_flashcard_count(30)
    if mode in {"60", "sixty"}:
        return "60", clamp_flashcard_count(60)
    if mode == "custom":
        return "custom", clamp_flashcard_count(data.get("card_count") or data.get("count"), 20)

    section_count = len(data.get("sections") or {}) if isinstance(data.get("sections"), dict) else len(stored_sections or {})
    estimated = max(12, min(32, section_count * 3 if section_count else max(12, len(context) // 1800)))
    return "auto", clamp_flashcard_count(data.get("card_count"), estimated)


def fallback_flashcard_cards(title: str, context: str, count: int) -> List[dict]:
    topic = title or stored_title or "Study material"
    candidates = []
    for line in context.splitlines():
        cleaned = normalise_space(line.lstrip("#-0123456789. "))
        if 28 <= len(cleaned) <= 220 and not cleaned.lower().startswith(("source:", "generated notes context")):
            candidates.append(cleaned)
        if len(candidates) >= count:
            break
    if not candidates:
        candidates = [f"Main idea from {topic}"]

    cards = []
    for index in range(count):
        focus = candidates[index % len(candidates)]
        cards.append({
            "id": f"fc{index + 1}",
            "front": focus[:120],
            "back": f"Explain this using the source notes: {focus[:260]}",
            "hint": "Look for the definition, example, or evidence around this point.",
            "source_reference": topic,
            "difficulty": "medium",
            "tags": ["source notes"],
        })
    return cards


def normalise_flashcard_cards(parsed: dict, title: str, context: str, count: int) -> List[dict]:
    raw_cards = parsed.get("cards") if isinstance(parsed, dict) else []
    if not isinstance(raw_cards, list):
        raw_cards = []

    fallback_cards = fallback_flashcard_cards(title, context, count)
    cards: List[dict] = []
    for index in range(count):
        raw = raw_cards[index] if index < len(raw_cards) and isinstance(raw_cards[index], dict) else {}
        fallback = fallback_cards[index]
        tags = raw.get("tags") if isinstance(raw.get("tags"), list) else fallback["tags"]
        cards.append({
            "id": f"fc{index + 1}",
            "front": clean_quiz_string(raw.get("front") or raw.get("term") or raw.get("question"), fallback["front"]),
            "back": clean_quiz_string(raw.get("back") or raw.get("definition") or raw.get("answer"), fallback["back"]),
            "hint": clean_quiz_string(raw.get("hint"), fallback["hint"]),
            "source_reference": clean_quiz_string(raw.get("source_reference") or raw.get("source"), fallback["source_reference"]),
            "difficulty": clean_quiz_string(raw.get("difficulty"), fallback["difficulty"]).lower(),
            "tags": [clean_quiz_string(tag) for tag in tags if clean_quiz_string(tag)][:4],
        })
    return cards


@app.post("/flashcards/generate")
async def generate_flashcards(data: dict):
    try:
        require_openai()
        data = data or {}
        title = clean_quiz_string(data.get("title"), stored_title or "Study Flashcards")
        preferred_language = normalise_quiz_language(data.get("preferred_language", "english"))
        context = quiz_summary_context(data)
        if not context:
            return {"error": "No generated notes are available for flashcard generation yet."}

        count_mode, card_count = resolve_flashcard_count(data, context)
        language_rule = quiz_language_instruction(preferred_language)
        schema = """
Return JSON only with this exact shape. Keep JSON keys in English. Every user-facing value must follow the language requirement:
{
  "title": "short deck title",
  "cards": [
    {
      "front": "short recall prompt, term, contrast, or question",
      "back": "clear answer/explanation grounded in the notes",
      "hint": "small clue before revealing the answer",
      "source_reference": "nearby concept, example, source figure, or evidence",
      "difficulty": "easy | medium | hard",
      "tags": ["concept", "evidence"]
    }
  ]
}
"""
        prompt = f"""
Create a high-quality flashcard deck from the generated notes below.

Language requirement: {language_rule}
Deck title/topic: {title}
Card count mode: {count_mode}
Return exactly {card_count} cards.

Card-writing rules:
- Do not copy long paragraphs. Make each front side compact enough for active recall.
- The back side should be clear, specific, and usually 1-3 sentences.
- Cover definitions, contrasts, mechanisms, processes, examples, important studies/data, source images/figures, formulas, and common confusions when present.
- Prefer source-grounded cards over generic textbook cards.
- Do not make cards whose answer is only a page number or slide number.
- Include useful bilingual academic terms when the language requirement asks for mixed or multi-language output.
- Keep the deck varied: not every card should be a definition.

{schema}

Generated notes context:
{context}
"""
        raw = generate_chat(
            [
                {"role": "system", "content": "You generate concise, source-grounded flashcards as strict JSON. Never include markdown fences or prose outside JSON."},
                {"role": "user", "content": prompt},
            ],
            model=model_for_depth("detailed"),
            temperature=0,
            max_tokens=env_int("FLASHCARD_GENERATION_TOKENS", 8500),
        )
        parsed = extract_json_object(raw)
        cards = normalise_flashcard_cards(parsed or {}, title, context, card_count)
        return {
            "title": clean_quiz_string(parsed.get("title") if isinstance(parsed, dict) else "", f"{title} Flashcards"),
            "preferred_language": preferred_language,
            "count_mode": count_mode,
            "total_cards": len(cards),
            "cards": cards,
        }
    except Exception as error:
        return {"error": str(error)}
