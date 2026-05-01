import base64
import json
import mimetypes
import os
import re
import tempfile
import urllib.request
from io import BytesIO
from pathlib import Path
from typing import List, Optional, Tuple
from urllib.parse import parse_qs, urlparse

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pypdf import PdfReader

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

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Use the stronger model for actual note generation. You can override these in .env.
ANALYSIS_MODEL = os.getenv("OPENAI_ANALYSIS_MODEL", "gpt-4o")
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
TRANSCRIBE_MODEL = os.getenv("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe")

MAX_AUDIO_BYTES = int(os.getenv("MAX_AUDIO_BYTES", str(24 * 1024 * 1024)))
MAX_VIDEO_BYTES = int(os.getenv("MAX_VIDEO_BYTES", str(60 * 1024 * 1024)))
MAX_SOURCE_CHARS = int(os.getenv("MAX_SOURCE_CHARS", "24000"))
MAX_VIDEO_FRAMES = int(os.getenv("MAX_VIDEO_FRAMES", "8"))

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
You are Synapse, an elite private academic tutor and source-faithful learning analyst.

You are not a generic summariser.
Your job is to reconstruct the actual learning content from messy materials: uploaded files, pasted notes, webpage text, YouTube captions, audio transcripts, and sampled video frames.

Core behaviour:
- Think like a careful human tutor who watched/read the material and is preparing revision notes for a student.
- Prioritise accuracy to the source over sounding impressive.
- Teach the student how to understand, calculate, verify, and avoid mistakes.
- Use the source evidence: visible formulas, numbers, diagrams, examples, spoken corrections, repeated attempts, and screen/board content.

Strict source rules:
- Never invent a topic, formula, example, or conclusion that is not supported by the source.
- If the source is inaccessible, incomplete, visually unclear, or the transcript is weak, say exactly what is missing.
- If evidence conflicts between transcript/audio and video frames, explain the uncertainty and prefer the clearer source evidence.
- Do not replace a source example with a generic textbook example unless the source example cannot be read.

Language rules:
- Use the main language of the source.
- If the source is Chinese or mixed Chinese-English, write mainly in Simplified Chinese and keep key terms in English in brackets.
- If the source is English, write in English.

Math / technical rules:
- Use proper LaTeX notation.
- Use \\( ... \\) for inline equations.
- Use \\[ ... \\] for displayed equations.
- Explain every formula in plain language after showing it.
- Define variables before using them.
- Show substitution, calculation, simplification, and verification.
- Identify common student errors and explain how to prevent them.

Quality standard:
The final notes should feel like they were written by a strong private tutor after carefully watching the lesson, not like an AI guessing from a title.
"""

ANALYSIS_INSTRUCTIONS = """
Analyse the provided study materials as a private academic tutor.

Your task is NOT to produce a generic summary.
Your task is to reconstruct the actual lesson/content from all available evidence:
- transcript / captions
- audio transcription
- webpage text
- uploaded files
- images
- sampled video frames

Before writing the final notes, internally identify:
1. What exact topic is being taught?
2. What specific formulas, definitions, examples, diagrams, or numbers appear?
3. What steps does the teacher/speaker follow?
4. Are there mistakes, repeated calculations, corrections, or verification attempts?
5. What would a confused student need explained?

Do not mention this internal checklist in the final answer.

Return markdown using this exact structure:

# Synapse Summary
Give a precise summary of what the source is actually teaching.
Mention the exact concept, not just the subject area.
If the source is a lesson/tutorial, state what skill the student is meant to learn.

## Core Argument
Explain the central purpose of the material in 2-4 clear sentences.
For a lesson, explain the learning objective.
For an argument-based text, explain the thesis.
For a worked example, explain what problem is being solved.

## Key Ideas
List the most important concepts from the source.
For each concept:
- define it clearly
- explain why it matters
- connect it directly to source evidence

## Step-by-step Breakdown
Reconstruct the teaching process from the source.
If it is mathematical, show each step using correct notation.
Do not skip intermediate steps.
Use this style when relevant:
1. Identify the given information.
2. Select the formula.
3. Substitute the values.
4. Calculate carefully.
5. Simplify the answer.
6. Verify the result.

## Worked Example / Evidence From Source
Use the actual example from the material.
Include, where available:
- given values
- formula used
- substitution
- calculation
- final answer
- verification
- visual/diagram evidence from frames
- spoken correction or repeated attempt

If the source contains an error, repeated calculation, or unclear working:
- state what happened in the source
- show the correct calculation
- explain how to avoid the mistake

## Tutor Explanation
Teach the material as if the student is confused.
Start simply, then deepen the explanation.
Explain the "why" behind each step, not only the procedure.
Use analogies only if they clarify the actual source content.

## Common Mistakes
List likely mistakes based on the material.
For each mistake:
- describe the mistake
- explain why it is wrong
- show the correct approach

## Critical Thinking
Give questions that push the student beyond memorisation.
Include at least:
- one conceptual question
- one application question
- one verification/checking question

Mathematical formatting rules:
- Use \\( ... \\) for inline formulas.
- Use \\[ ... \\] for important equations or worked calculations.
- After each displayed equation, explain in plain language what it means.
- Avoid raw LaTeX that would be unreadable without rendering.

Source reliability rules:
- If video/audio/transcript/frame information is insufficient, say so clearly.
- Never pretend inaccessible material was analysed.
- Never produce a broad textbook summary unless the source itself is broad.
- Prefer concrete source detail over polished generalisation.

Output language:
- If the source is mainly Chinese or mixed Chinese-English, write mainly in Simplified Chinese with key English academic terms in brackets.
- Otherwise write in English.
"""


def generate_chat(messages, model=CHAT_MODEL, temperature=0.45, max_tokens=4500):
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is missing. Add it to your .env file.")

    try:
        response = client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=messages,
        )
    except Exception:
        # If the user does not have access to the stronger model, fallback gracefully.
        if model != "gpt-4o-mini":
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                temperature=temperature,
                max_tokens=max_tokens,
                messages=messages,
            )
        else:
            raise

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
    paragraphs = [p.text for p in document.paragraphs if p.text.strip()]
    return "\n".join(paragraphs).strip()


def extract_text_file(data: bytes) -> str:
    return data.decode("utf-8", errors="ignore").strip()


def clean_html(raw: str) -> str:
    raw = re.sub(r"<script[\s\S]*?</script>", " ", raw, flags=re.I)
    raw = re.sub(r"<style[\s\S]*?</style>", " ", raw, flags=re.I)
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = re.sub(r"\s+", " ", raw)
    return raw.strip()


def remove_urls_from_text(text: str) -> str:
    text = re.sub(r"https?://[^\s<>()]+", " ", text or "")
    return re.sub(r"\s+", " ", text).strip()


def image_part_from_bytes(data: bytes, content_type: str = "image/jpeg"):
    encoded = base64.b64encode(data).decode("utf-8")
    return {
        "type": "image_url",
        "image_url": {"url": f"data:{content_type};base64,{encoded}"},
    }


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
    """youtube-transcript-api returns dicts in some versions and objects in others."""
    if isinstance(item, dict):
        return item.get("text", "") or ""
    return getattr(item, "text", "") or ""


def fetch_youtube_caption_transcript(url: str) -> str:
    video_id = get_youtube_video_id(url)
    if not video_id:
        return ""

    if YouTubeTranscriptApi is None:
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
            try:
                transcript = next(iter(transcript_list))
            except Exception:
                return ""

        fetched = transcript.fetch()
        lines = [transcript_item_text(item).strip() for item in fetched]
        return "\n".join(line for line in lines if line)
    except Exception:
        return ""


def transcribe_media_bytes(filename: str, data: bytes) -> str:
    if not data:
        return "No audio/video data was provided."

    if len(data) > MAX_AUDIO_BYTES:
        size_mb = len(data) / (1024 * 1024)
        limit_mb = MAX_AUDIO_BYTES / (1024 * 1024)
        return (
            f"The audio/video file is too large to transcribe directly ({size_mb:.1f}MB). "
            f"The current limit is about {limit_mb:.0f}MB. Upload a shorter clip, compressed audio, or paste the transcript."
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
                    prompt=(
                        "This is an academic lecture/tutorial. Preserve numbers, formulas, "
                        "math terms, Chinese/English mixed speech, corrections, and calculation steps."
                    ),
                )
            except Exception:
                audio_file.seek(0)
                result = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    prompt=(
                        "Academic lecture/tutorial with possible Chinese and English. "
                        "Preserve numbers, formulas, and calculation steps."
                    ),
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

    # Skip the first/last few frames because they are often intro/outro.
    if max_frames <= 1:
        indices = [frame_count // 2]
    else:
        start = int(frame_count * 0.08)
        end = int(frame_count * 0.92)
        step = max(1, (end - start) // (max_frames - 1))
        indices = [min(frame_count - 1, start + i * step) for i in range(max_frames)]

    parts = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue

        # Resize large frames to reduce request size while keeping equations readable.
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
    media_path = next((path for path in candidates if os.path.exists(path) and os.path.getsize(path) > 0), None)
    return media_path


def analyse_youtube_url(url: str) -> Tuple[str, List[dict]]:
    """Return transcript text plus sampled video frame image parts."""
    transcript = fetch_youtube_caption_transcript(url)
    frame_parts: List[dict] = []

    media_path = None
    # Even if captions exist, frames help with equations/diagrams that are not spoken aloud.
    if yt_dlp is not None or not transcript:
        media_path = download_youtube_media(url)

    if media_path:
        frame_parts = extract_video_frames_from_file(media_path)

        # If captions are missing or too thin, transcribe audio from the downloaded media.
        if len(transcript.strip()) < 500:
            try:
                with open(media_path, "rb") as media_file:
                    media_bytes = media_file.read(MAX_AUDIO_BYTES + 1)
                transcribed = transcribe_media_bytes(os.path.basename(media_path), media_bytes)
                if transcribed and not transcribed.lower().startswith("the audio/video file is too large"):
                    transcript = transcribed
            except Exception:
                pass

    if not transcript:
        transcript = (
            "No readable YouTube captions/transcript could be accessed, and audio fallback did not produce a transcript. "
            "Use the sampled video frames if available; otherwise ask the user to upload the video/audio or paste the transcript."
        )

    return transcript, frame_parts


def looks_like_direct_media_url(url: str) -> bool:
    lower_url = url.lower().split("?")[0]
    return lower_url.endswith((".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv", ".mp3", ".m4a", ".wav"))


def download_direct_media(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read(MAX_VIDEO_BYTES + 1)


def link_to_content_parts(url: str) -> List[dict]:
    parts: List[dict] = []

    if get_youtube_video_id(url):
        transcript, frame_parts = analyse_youtube_url(url)
        parts.append({
            "type": "text",
            "text": (
                f"\n\nSOURCE YOUTUBE VIDEO: {url}\n"
                f"TRANSCRIPT / AUDIO NOTES:\n{transcript[:MAX_SOURCE_CHARS]}\n\n"
                f"VIDEO FRAME NOTE: {len(frame_parts)} sampled frames are attached after this text. Use them to read visual equations/diagrams."
            ),
        })
        parts.extend(frame_parts)
        return parts

    if looks_like_direct_media_url(url):
        try:
            data = download_direct_media(url)
            transcript = transcribe_media_bytes(Path(urlparse(url).path).name or "linked-media", data)
            parts.append({
                "type": "text",
                "text": f"\n\nSOURCE AUDIO/VIDEO LINK: {url}\nTRANSCRIPT:\n{transcript[:MAX_SOURCE_CHARS]}",
            })
            return parts
        except Exception as error:
            return [{
                "type": "text",
                "text": (
                    f"\n\nSOURCE MEDIA LINK: {url}\n"
                    f"Synapse could not download/transcribe this direct media link: {error}. "
                    "Ask the user to upload the video/audio file or paste the transcript."
                ),
            }]

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            raw = response.read(100000).decode("utf-8", errors="ignore")
        text = clean_html(raw)[:12000]
        if not text:
            text = "No readable text was found on this webpage."
        return [{"type": "text", "text": f"\n\nSOURCE WEBPAGE: {url}\n{text}"}]
    except Exception as error:
        return [{"type": "text", "text": f"\n\nSOURCE WEBPAGE: {url}\nCould not fetch link: {error}"}]


def file_to_content_parts(name: str, content_type: str, data: bytes) -> List[dict]:
    lower_name = (name or "").lower()

    if content_type and content_type.startswith("image/"):
        return [image_part_from_bytes(data, content_type)]

    is_audio_video = (
        (content_type and (content_type.startswith("audio/") or content_type.startswith("video/")))
        or lower_name.endswith((".mp3", ".m4a", ".wav", ".webm", ".mp4", ".mov", ".m4v"))
    )

    source_label = "SOURCE FILE"
    frame_parts: List[dict] = []

    if is_audio_video:
        text = transcribe_media_bytes(name, data)
        source_label = "SOURCE AUDIO/VIDEO FILE"

        # For uploaded videos, also sample frames so visible formulas/diagrams are not lost.
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

    if not text:
        text = "No readable text was extracted from this file."

    parts = [{"type": "text", "text": f"\n\n{source_label}: {name}\n{text[:MAX_SOURCE_CHARS]}"}]
    if frame_parts:
        parts.append({"type": "text", "text": f"\n\nVIDEO FRAME NOTE: {len(frame_parts)} sampled frames are attached. Use them to read visual equations/diagrams."})
        parts.extend(frame_parts)
    return parts


@app.post("/analyze")
async def analyze_materials(
    files: List[UploadFile] = File(default=[]),
    links: str = Form(default="[]"),
    free_text: str = Form(default=""),
):
    try:
        global stored_summary, stored_sections, stored_connections, stored_brainstorm

        content_parts: List[dict] = []
        source_names: List[str] = []

        for uploaded in files:
            data = await uploaded.read()
            if not data:
                continue

            content_type = (
                uploaded.content_type
                or mimetypes.guess_type(uploaded.filename or "")[0]
                or "application/octet-stream"
            )
            source_names.append(uploaded.filename or "uploaded file")
            content_parts.extend(file_to_content_parts(uploaded.filename or "uploaded file", content_type, data))

        try:
            parsed_links = json.loads(links) if links else []
        except Exception:
            parsed_links = []

        for url in parsed_links:
            if not isinstance(url, str) or not url.strip():
                continue
            url = url.strip()
            source_names.append(url)
            content_parts.extend(link_to_content_parts(url))

        cleaned_free_text = remove_urls_from_text(free_text)
        if cleaned_free_text:
            source_names.append("pasted text")
            content_parts.append({
                "type": "text",
                "text": f"\n\nUSER PROVIDED TEXT:\n{cleaned_free_text[:MAX_SOURCE_CHARS]}",
            })

        if not content_parts:
            return {"error": "No readable files, links, or text were provided."}

        task = f"""
{ANALYSIS_INSTRUCTIONS}

Sources: {', '.join(source_names)}
"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [{"type": "text", "text": task}] + content_parts},
        ]

        stored_summary = generate_chat(
            messages,
            model=ANALYSIS_MODEL,
            temperature=0.18,
            max_tokens=7000,
        )
        stored_sections = parse_sections(stored_summary)
        stored_connections = generate_connections(stored_sections)
        stored_brainstorm = generate_brainstorm(stored_summary)

        return {
            "summary": stored_summary,
            "sections": stored_sections,
            "connections": stored_connections,
            "brainstorm": stored_brainstorm,
        }

    except Exception as error:
        return {"error": str(error)}


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    return await analyze_materials(files=[file], links="[]", free_text="")


def generate_connections(sections):
    if len(sections) < 2:
        return []

    overview = "\n".join([
        f"{title}: {content[:700]}"
        for title, content in list(sections.items())[:8]
    ])

    prompt = f"""
Return only valid JSON with 4-6 conceptual connections:
{{"connections":[{{"from":"...","to":"...","label":"...","description":"..."}}]}}
Make the connections specific, not generic.
Sections:\n{overview}
"""

    raw = generate_chat([
        {"role": "system", "content": "Return only valid JSON. No markdown."},
        {"role": "user", "content": prompt},
    ], model=CHAT_MODEL, temperature=0.2, max_tokens=1200)

    try:
        return json.loads(raw).get("connections", [])
    except Exception:
        return []


def generate_brainstorm(summary):
    prompt = f"""
Return only valid JSON for a brainstorm map:
{{"center":"Specific Main Topic","nodes":["node 1","node 2","node 3","node 4","node 5","node 6"]}}
The center and nodes must be specific to the actual material, not generic.
Summary:\n{summary[:6000]}
"""

    raw = generate_chat([
        {"role": "system", "content": "Return only valid JSON. No markdown."},
        {"role": "user", "content": prompt},
    ], model=CHAT_MODEL, temperature=0.2, max_tokens=700)

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
Section content: {section_context[:3500]}
Full summary: {stored_summary[:9000]}
"""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context},
            {"role": "assistant", "content": "I will tutor the student using this material."},
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
            temperature=0.5,
            max_tokens=1800,
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
        "transcribe_model": TRANSCRIBE_MODEL,
        "api_key_loaded": bool(os.getenv("OPENAI_API_KEY")),
        "youtube_transcript_api_loaded": YouTubeTranscriptApi is not None,
        "yt_dlp_loaded": yt_dlp is not None,
        "opencv_loaded": cv2 is not None,
        "max_audio_mb": round(MAX_AUDIO_BYTES / (1024 * 1024), 1),
        "max_video_mb": round(MAX_VIDEO_BYTES / (1024 * 1024), 1),
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
