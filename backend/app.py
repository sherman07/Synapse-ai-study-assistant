import base64
import html
import json
import mimetypes
import ssl
import os
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap
import time
import urllib.request
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

import requests
from fastapi import FastAPI, File, Form, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware

BACKEND_PACKAGE_DIR = Path(__file__).resolve().parent
if str(BACKEND_PACKAGE_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_PACKAGE_DIR))

from core.analysis_cache import cache_get, cache_set
from core.config import (
    ANALYSIS_MODEL,
    CACHE_PATH,
    CACHE_VERSION,
    CHAT_MODEL,
    CORS_ALLOW_CREDENTIALS,
    CORS_ALLOW_ORIGIN_REGEX,
    CORS_ALLOW_ORIGINS,
    ENABLE_LOCAL_PPTX_APP_RENDER,
    ENABLE_MULTI_SOURCE_DIGESTS,
    ENABLE_PPTX_SLIDE_RENDER,
    ENABLE_PPTX_SVG_FALLBACK_RENDER,
    ENABLE_SOURCE_PPTX_PREVIEW_RENDER,
    ENABLE_TUTOR_WEB_RESEARCH,
    FALLBACK_MODEL,
    MAX_AUDIO_BYTES,
    MAX_MULTI_SOURCE_VISUAL_IMAGES,
    MAX_SOURCE_CHARS,
    MAX_TUTOR_RESEARCH_CHARS,
    MAX_TUTOR_SEARCH_RESULTS,
    MAX_UPLOAD_BYTES,
    MAX_VIDEO_BYTES,
    MAX_VIDEO_FRAMES,
    MAX_VISUAL_IMAGES_PER_SOURCE,
    MINDMAP_MODEL,
    MULTISOURCE_CONNECTION_TOKENS,
    MULTISOURCE_SOURCE_CHARS,
    MULTISOURCE_SOURCE_DIGEST_TOKENS,
    MULTISOURCE_SYNTHESIS_PART_TOKENS,
    MULTISOURCE_VISUAL_GALLERY_LIMIT,
    OPENAI_API_KEY,
    OPENAI_ORG_ID,
    OPENAI_PROJECT_ID,
    OPENAI_TIMEOUT_SECONDS,
    REALTIME_MODEL,
    REALTIME_VOICE,
    SOURCE_PREVIEW_MAX_EMBEDDED_IMAGES,
    SOURCE_PREVIEW_MAX_PDF_PAGES,
    SOURCE_PREVIEW_MAX_SLIDES,
    SOURCE_PREVIEW_PPTX_CONVERT_TIMEOUT,
    SOURCE_PREVIEW_RENDER_DPI,
    TITLE_MODEL,
    TRANSCRIBE_MODEL,
    VISUAL_ARGUMENT_CARD_LIMIT,
    VISUAL_ARGUMENT_TOKENS,
    VISUAL_IMAGE_GUIDE_MODEL,
    VISUAL_IMAGE_GUIDE_QUALITY,
    VISUAL_IMAGE_GUIDE_SIZE,
    VISUAL_RENDER_DPI,
    VOICE_TUTOR_CONTEXT_CHARS,
    VOICE_TUTOR_HISTORY_LIMIT,
    VOICE_TUTOR_REALTIME_CONTEXT_CHARS,
    VOICE_TUTOR_TOKENS,
    client,
    env_int,
    has_openai,
    model_for_depth,
    require_openai,
)
from core.request_limits import read_upload_bytes
from core.section_loader import AppSectionLoader
from core.note_prompt_modes import (
    DEFAULT_NOTE_PROMPT_MODE,
    load_note_prompt_mode_text,
    normalise_note_prompt_mode,
    note_prompt_mode_allows_expansion,
    note_prompt_mode_label,
    note_prompt_mode_min_units,
    note_prompt_mode_options,
)
from core.source_extractors import (
    extract_docx,
    extract_pdf,
    extract_text_file,
    source_unit_visual_parts,
)
from core.url_security import normalize_public_http_url
from core.text_utils import (
    canonicalize_youtube_watch_url,
    clean_detected_url,
    clean_html,
    extract_urls_from_text,
    extract_youtube_urls_from_text,
    get_youtube_video_id,
    normalise_space,
    normalise_youtube_video_id,
    remove_urls_from_text,
    sha256_bytes,
    sha256_text,
    truncate_text,
)


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

# Defensive literals for LaTeX environments inside f-string prompts. If a
# prompt accidentally contains "\begin{bmatrix}" instead of escaped braces,
# Python would otherwise try to interpolate a variable named bmatrix.
for _latex_env_name in (
    "bmatrix", "pmatrix", "matrix", "vmatrix", "Vmatrix", "Bmatrix",
    "smallmatrix", "array", "cases", "aligned", "align", "gathered",
    "gather", "split", "equation",
):
    globals()[_latex_env_name] = "{" + _latex_env_name + "}"
del _latex_env_name

app = FastAPI(title="Synapse Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_origin_regex=CORS_ALLOW_ORIGIN_REGEX,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

APP_SECTION_FILES = (
    "01_health.py",
    "02_build_refusal_repair_messages.py",
    "03_download_youtube_media.py",
    "04_file_to_source_unit.py",
    "05_analyze.py",
    "06_source_preview.py",
    "07_v22_visual_rank_keywords.py",
    "08_convert_pptx_to_pdf_with_powerpoint.py",
    "09_v23_meaningful_card_text.py",
    "10_parse_quiz_type_plan.py",
    "11_timeline_generate.py",
    "12_flashcards_generate.py",
)

AppSectionLoader(BACKEND_PACKAGE_DIR, APP_SECTION_FILES).load(globals())
