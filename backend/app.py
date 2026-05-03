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

# -------------------------
# Environment + app setup
# -------------------------
BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")
load_dotenv()

OPENAI_API_KEY = (os.getenv("OPENAI_API_KEY") or "").strip().strip('"').strip("'")
OPENAI_ORG_ID = (os.getenv("OPENAI_ORG_ID") or os.getenv("OPENAI_ORGANIZATION") or "").strip().strip('"').strip("'")
OPENAI_PROJECT_ID = (os.getenv("OPENAI_PROJECT_ID") or os.getenv("OPENAI_PROJECT") or "").strip().strip('"').strip("'")

# Project keys normally work with only api_key. If you created multiple organisations/projects,
# setting OPENAI_ORG_ID and OPENAI_PROJECT_ID makes the request target the correct place.
def make_openai_client():
    if not OPENAI_API_KEY:
        return None
    kwargs = {"api_key": OPENAI_API_KEY}
    if OPENAI_ORG_ID:
        kwargs["organization"] = OPENAI_ORG_ID
    if OPENAI_PROJECT_ID:
        kwargs["project"] = OPENAI_PROJECT_ID
    return OpenAI(**kwargs)

client = make_openai_client()

ANALYSIS_MODEL = os.getenv("OPENAI_ANALYSIS_MODEL", "gpt-4o")
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
TRANSCRIBE_MODEL = os.getenv("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe")

MAX_AUDIO_BYTES = int(os.getenv("MAX_AUDIO_BYTES", str(24 * 1024 * 1024)))
MAX_VIDEO_BYTES = int(os.getenv("MAX_VIDEO_BYTES", str(60 * 1024 * 1024)))
MAX_SOURCE_CHARS = int(os.getenv("MAX_SOURCE_CHARS", "90000"))
MAX_VIDEO_FRAMES = int(os.getenv("MAX_VIDEO_FRAMES", "8"))
ANALYSIS_CACHE_TTL_SECONDS = int(os.getenv("ANALYSIS_CACHE_TTL_SECONDS", str(7 * 24 * 60 * 60)))
CACHE_PATH = BACKEND_DIR / "synapse_analysis_cache.json"
CACHE_VERSION = "source_identity_mindmap_v17_deep_academic_detail"

app = FastAPI(title="Synapse Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Synapse Backend",
        "health_url": "/health",
    }


@app.get("/health")
def health():
    """Simple backend + environment check. Does not call OpenAI."""
    return {
        "status": "ok",
        "api_key_loaded": bool(OPENAI_API_KEY),
        "api_key_prefix": OPENAI_API_KEY[:12] if OPENAI_API_KEY else "",
        "org_id_loaded": bool(OPENAI_ORG_ID),
        "org_id_prefix": OPENAI_ORG_ID[:10] if OPENAI_ORG_ID else "",
        "project_id_loaded": bool(OPENAI_PROJECT_ID),
        "project_id_prefix": OPENAI_PROJECT_ID[:12] if OPENAI_PROJECT_ID else "",
        "analysis_model": ANALYSIS_MODEL,
        "chat_model": CHAT_MODEL,
        "transcribe_model": TRANSCRIBE_MODEL,
        "env_file": str(BACKEND_DIR / ".env"),
    }


@app.get("/health/openai")
def health_openai():
    """Real OpenAI key check. Use this only when debugging key/org/project issues."""
    try:
        require_openai()
        # Very small request to prove the key, org, project, and model are valid.
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            temperature=0,
            max_tokens=5,
            messages=[{"role": "user", "content": "Reply OK only."}],
        )
        return {
            "status": "ok",
            "openai_connection": True,
            "model": CHAT_MODEL,
            "response": response.choices[0].message.content,
        }
    except Exception as error:
        return {
            "status": "error",
            "openai_connection": False,
            "error": str(error),
            "hint": "Check OPENAI_API_KEY, OPENAI_ORG_ID, OPENAI_PROJECT_ID, billing, and model access.",
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
- For laws, policies, reports, articles, slides, videos, and textbook material, preserve the actual structure and important subpoints.
- For maths or technical material, explain formulas, definitions, worked steps, and likely mistakes.
- If material is inaccessible or partial, say exactly what is missing.
- Use the source's main language unless the user requested otherwise.
"""

ANALYSIS_PROMPT = """
Analyse the material as a private tutor and return markdown using EXACTLY this structure:

# Overview
Write a detailed, source-faithful overview. Identify the exact source/topic, what it is for, and the main learning focus. Do not write a generic one-sentence summary.

## Core Argument
Explain the central purpose, logic, or learning objective in depth. Use 2-4 substantial paragraphs if needed. Include the source's actual scope, key mechanism, and why it matters.

## Key Ideas
Create a detailed concept-by-concept explanation. For each major idea:
- name the concept clearly
- define it in student-friendly language
- connect it to the actual source wording, section, example, formula, image, transcript moment, or evidence when available
- explain why it matters
For legal, policy, historical, scientific, or business material, cover the main parts/subparts/sections in order when the source supports it.
For maths/technical material, include formulas, variable meanings, conditions, and conceptual interpretation.

## Step-by-step Breakdown
Reconstruct the source in a logical learning order. This must be detailed enough for a student who has not read the source.
For laws/documents: break down the legal structure by part, subpart, section, definition, exception, duty, consequence, and transition rule when present.
For maths/problems: show every calculation step, why each formula is used, what each line means, and how to check the result.
For videos/transcripts: reconstruct the teaching sequence, including corrections, repeated calculations, or unclear moments.

## Worked Example / Evidence From Source
Use actual examples, quoted ideas, section numbers, calculations, table values, scenarios, or evidence from the uploaded/source material whenever available.
If the source contains no explicit worked example, create a clearly labelled external real-world example that applies the source concept, and explain the connection step by step.
If the source contains both source examples and external examples, include both under clear subheadings.

## Tutor Explanation
Teach it like a strong tutor. Explain the difficult parts slowly, including why the rule/formula/process works, how the ideas connect, and how to remember them. Use analogies only when they help accuracy.

## Common Mistakes
List realistic mistakes a learner could make. For each mistake:
- explain the wrong assumption
- explain the correct understanding
- show how to avoid it
Use source-specific mistakes, not generic filler.

## Critical Thinking
Provide at least:
- one conceptual question
- one application question
- one verification/checking question
Then add brief guidance on what a strong answer should consider.

Important quality rules:
- Do not invent a different source.
- If source evidence is insufficient, say exactly what is missing, but still explain what can be reliably learned from the available evidence.
- Follow the requested output language for the ENTIRE response, including all headings, explanations, examples, mistakes, and questions.
- Never translate the brand/product name Synapse. Use Synapse exactly.
- If Simplified Chinese is requested, write the whole response in Simplified Chinese, while keeping short key English terms in brackets only when useful.
- If Traditional Chinese is requested, write the whole response in Traditional Chinese, while keeping short key English terms in brackets only when useful.
- For mathematical notation in the main notes, use readable mathematical notation. Prefer MathJax-friendly LaTeX wrapped in \( ... \), e.g. \(\sqrt{76}\), \(\frac{a}{b}\), \(r'(t)=\langle 1,2,6t\rangle\). Do not write plain sqrt(76) in the main notes.
- Do not replace the actual source with a generic textbook topic.
- Keep the same source identity consistently throughout the whole answer.
- Use concrete source details whenever available.
- Be detailed. Avoid minimal summaries. The answer should feel like a high-quality study guide, not a short abstract.
- Prefer 900-1800 words for complex sources, unless the source is genuinely very short.
"""

# -------------------------
# Small helpers
# -------------------------
def has_openai() -> bool:
    return bool(OPENAI_API_KEY and client is not None)


def require_openai() -> None:
    if not has_openai():
        raise RuntimeError(
            "OPENAI_API_KEY is missing or empty. Create backend/.env, add OPENAI_API_KEY=your_key_here, then restart uvicorn. If you created a new organization/project, also add OPENAI_ORG_ID and OPENAI_PROJECT_ID when needed."
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
    reader = PdfReader(BytesIO(data))
    pages = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text.strip():
            pages.append(page_text.strip())
    return "\n\n".join(pages).strip()


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



def clean_mindmap_text(text: str) -> str:
    """Clean markdown / LaTeX-ish text so the visual mind map stays readable."""
    if not text:
        return ""
    value = str(text)

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
    }
    for old, new in replacements.items():
        value = value.replace(old, new)

    # Remove remaining LaTeX command words, but preserve the content around them.
    value = re.sub(r"\\[a-zA-Z]+", "", value)
    value = value.replace("{", "").replace("}", "")
    value = value.replace("\\", "")

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


def generate_mind_map(title: str, sections: Dict[str, str]) -> dict:
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

    branches = []
    for section_name in ordered_names[:6]:
        section_text = sections.get(section_name, "")
        label = "Summary" if section_name == "Overview" else section_name
        branches.append({
            "id": sha256_text(section_name)[:10],
            "label": short_mindmap_text(label, 48),
            "section": section_name,
            "summary": first_good_sentence(section_text, 190),
            "points": extract_branch_items(section_text, max_points=5),
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


def normalise_ai_mind_map(raw_map: dict, fallback_map: dict) -> dict:
    if not isinstance(raw_map, dict):
        return fallback_map

    center = short_mindmap_text(raw_map.get("center") or fallback_map.get("center") or "Study Notes", 80)
    raw_branches = raw_map.get("branches") if isinstance(raw_map.get("branches"), list) else []
    fallback_branches = fallback_map.get("branches", []) or []
    fallback_by_section = {b.get("section"): b for b in fallback_branches}

    branches: List[dict] = []
    for index, branch in enumerate(raw_branches[:6]):
        if not isinstance(branch, dict):
            continue
        section = clean_mindmap_text(branch.get("section") or branch.get("label") or "")
        fallback_branch = fallback_by_section.get(section) or (fallback_branches[min(index, len(fallback_branches) - 1)] if fallback_branches else {})
        label = short_mindmap_text(branch.get("label") or fallback_branch.get("label") or section or f"Branch {index + 1}", 48)
        summary = short_mindmap_text(branch.get("summary") or fallback_branch.get("summary") or "", 190)

        raw_points = branch.get("points") if isinstance(branch.get("points"), list) else []
        points: List[dict] = []
        for point in raw_points[:5]:
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
            points = fallback_branch.get("points", [])[:5]

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


def generate_ai_mind_map(title: str, sections: Dict[str, str], preferred_language: str = "auto") -> dict:
    """
    Ask the model to design a visual mind map specifically.
    Falls back to a deterministic rule-based map if the model output is invalid.
    """
    fallback = generate_mind_map(title, sections)
    if not sections:
        return fallback

    compact_sections = []
    for name, content in list(sections.items())[:7]:
        compact_sections.append(f"SECTION: {name}\n{truncate_text(content, 2200)}")

    language_instruction = language_instruction_for(preferred_language)

    prompt = f"""
Create a visual mind map JSON for a study app.
{language_instruction}

Important design rules:
- Do NOT copy long paragraphs directly.
- Make the center title readable and specific.
- Use 4 to 6 main branches only.
- Each branch should have 4 to 6 short points when the notes contain enough detail.
- Each point needs a short label and a useful detail sentence that contains the key substance, not just a title.
- For math/technical content, DO NOT output Markdown bold, raw LaTeX, or escaped delimiters like \( ... \).
- Convert formulas into readable plain text, for example: r'(t)=<1,2,6t>, √(180)=6√(5), curvature k = |r'×r''| / |r'|^3. Never write plain sqrt(180).
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
        return normalise_ai_mind_map(parsed or {}, fallback)
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
    elif lower_name.endswith(".docx"):
        text = extract_docx(data)
    else:
        text = extract_text_file(data)

    detected_title = detect_legislation_title(text[:4000]) or detect_course_or_topic_title(text[:2500]) or (name or "uploaded file")
    source_meta["title_candidate"] = detected_title
    source_meta["content_hash"] = sha256_text(text[:50000])
    source_meta["source_identity"] = f"file_text:{source_meta['content_hash']}"

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
        }


def build_analysis_fingerprint(preferred_language: str, units: List[dict]) -> str:
    identity_bits = [f"cache:{globals().get('CACHE_VERSION', 'v0')}", f"lang:{preferred_language or 'auto'}"]
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
            })
            title_candidates.append(inferred_title)

        if not content_parts:
            return {"error": "No readable files, links, or text were provided."}

        source_fingerprint = build_analysis_fingerprint(preferred_language, source_units)
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
        analysis_task = f"""
{ANALYSIS_PROMPT}

MANDATORY output language for the entire notes: {language_rule}
Do not answer in another language. The full Generated Content must obey this language choice: all headings, explanations, examples, real-world examples, common mistakes, tutor explanations, and critical-thinking questions.

MANDATORY depth requirement:
- Produce a detailed study guide, not a minimal summary.
- If the source is a law or formal document, cover definitions, key sections, exceptions, duties, liabilities, procedures, and consequences.
- If the source is a math/video lesson, reconstruct the full teaching sequence, formulas, calculations, verification steps, and common errors.
- Use the source structure wherever visible: parts, sections, headings, tables, transcript sequence, examples, or diagrams.
- If examples exist inside the source, include them. If no example exists, add a clearly labelled external real-world example and explain how it applies.
- Avoid generic filler such as “this is important for understanding”. Every paragraph should teach a specific point.

Most likely source title/topic from explicit evidence: {title_hint}

Stable source identity list:
{chr(10).join(source_identity_lines)}

Consistency requirement:
- The same source must not become two different documents.
- If the source is a legislation page, preserve the exact act identity.
- If the source title says Partnership Law Act 2019, do NOT change it to Arms Legislation Act 2019 or any other act.
"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [{"type": "text", "text": analysis_task}] + content_parts},
        ]

        stored_summary = generate_chat(messages, model=ANALYSIS_MODEL, temperature=0, max_tokens=12000)
        stored_summary = enforce_requested_language(stored_summary, preferred_language)
        stored_summary = protect_synapse_brand_and_first_heading(stored_summary, preferred_language)
        stored_summary = normalise_plain_sqrt_text(stored_summary)
        stored_sections = parse_sections(stored_summary)
        stored_title = make_notes_title(stored_summary, title_candidates)
        stored_title = localise_title_if_needed(stored_title, preferred_language)
        stored_connections = generate_connections_from_sections(stored_sections)
        stored_mind_map = generate_ai_mind_map(stored_title, stored_sections, preferred_language)
        stored_source_identity = source_units[0].get("source_identity", "") if source_units else ""

        result = {
            "title": stored_title,
            "summary": stored_summary,
            "sections": stored_sections,
            "connections": stored_connections,
            "mind_map": stored_mind_map,
            "primary_source_identity": stored_source_identity,
            "source_fingerprint": source_fingerprint,
            "cached": False,
        }
        cache_set(source_fingerprint, result)
        return result

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
        section_context = stored_sections.get(selected_section, "")

        context = f"""
Current study context:
Title: {stored_title}
Primary source identity: {stored_source_identity}
Selected section: {selected_section if selected_section else 'Full document'}
Section content: {section_context[:3500]}
Full summary: {stored_summary[:9000]}

Tutor rules:
- Stay consistent with the already generated notes.
- Do not switch to a different source.
- If the notes say the source is a specific act or lesson, keep that identity.
"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context},
            {"role": "assistant", "content": "I will answer as a source-faithful tutor."},
        ]

        for message in chat_history[-8:]:
            role = message.get("role", "user")
            if role not in {"user", "assistant", "system"}:
                role = "user"
            messages.append({"role": role, "content": message.get("content", "")})

        messages.append({"role": "user", "content": question})
        answer = generate_chat(messages, model=CHAT_MODEL, temperature=0.2, max_tokens=1800)
        return {"answer": answer}
    except Exception as error:
        return {"error": str(error)}
