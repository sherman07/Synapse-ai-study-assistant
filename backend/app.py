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
from fastapi import FastAPI, File, Form, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

BACKEND_PACKAGE_DIR = Path(__file__).resolve().parent
if str(BACKEND_PACKAGE_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_PACKAGE_DIR))

from core.analysis_cache import cache_get, cache_set
from core.config import (
    ANALYSIS_MAX_SECONDS,
    ANALYSIS_MODEL,
    CACHE_PATH,
    CACHE_VERSION,
    CHAT_MODEL,
    CORS_ALLOW_CREDENTIALS,
    CORS_ALLOW_ORIGIN_REGEX,
    CORS_ALLOW_ORIGINS,
    DATABASE_PATH,
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
    PUBLIC_BACKEND_BASE_URL,
    REALTIME_MODEL,
    REALTIME_VOICE,
    RUNTIME_ASSETS_DIR,
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
from core.database import synapse_database
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

try:
    import stripe
except Exception:
    stripe = None

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
RUNTIME_ASSETS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/assets", StaticFiles(directory=str(RUNTIME_ASSETS_DIR)), name="synapse_assets")

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

SUPABASE_URL = (os.getenv("SUPABASE_URL") or os.getenv("SYNAPSE_SUPABASE_URL") or "").rstrip("/")
SUPABASE_ANON_KEY = (os.getenv("SUPABASE_ANON_KEY") or os.getenv("SYNAPSE_SUPABASE_ANON_KEY") or "").strip()
SUPABASE_SERVICE_ROLE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SYNAPSE_SUPABASE_SERVICE_ROLE_KEY")
    or ""
).strip()
STRIPE_SECRET_KEY = (os.getenv("STRIPE_SECRET_KEY") or "").strip()
STRIPE_WEBHOOK_SECRET = (os.getenv("STRIPE_WEBHOOK_SECRET") or "").strip()
SYNAPSE_ALLOW_UNSIGNED_STRIPE_WEBHOOK = (
    os.getenv("SYNAPSE_ALLOW_UNSIGNED_STRIPE_WEBHOOK", "false").lower() not in {"0", "false", "no"}
)
SYNAPSE_FRONTEND_BASE_URL = (
    os.getenv("SYNAPSE_FRONTEND_BASE_URL")
    or os.getenv("SYNAPSE_PUBLIC_FRONTEND_URL")
    or "http://127.0.0.1:5500/frontend"
).rstrip("/")
STRIPE_PRICE_IDS = {
    "starter": (os.getenv("STRIPE_PRICE_STARTER") or os.getenv("SYNAPSE_STRIPE_PRICE_STARTER") or "").strip(),
    "student": (os.getenv("STRIPE_PRICE_STUDENT") or os.getenv("SYNAPSE_STRIPE_PRICE_STUDENT") or "").strip(),
    "pro": (os.getenv("STRIPE_PRICE_PRO") or os.getenv("SYNAPSE_STRIPE_PRICE_PRO") or "").strip(),
}

if stripe and STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


def json_error(message: str, status_code: int = 400) -> Response:
    return Response(
        json.dumps({"error": message}),
        status_code=status_code,
        media_type="application/json",
    )


def runtime_path(name: str) -> Path:
    root = RUNTIME_ASSETS_DIR.parent
    root.mkdir(parents=True, exist_ok=True)
    return root / name


def read_runtime_json(name: str, fallback: Any) -> Any:
    path = runtime_path(name)
    try:
        if not path.exists():
            return fallback
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def write_runtime_json(name: str, value: Any) -> None:
    path = runtime_path(name)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def append_runtime_jsonl(name: str, value: Dict[str, Any]) -> None:
    path = runtime_path(name)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(value, ensure_ascii=False) + "\n")


def read_runtime_jsonl(name: str) -> List[Dict[str, Any]]:
    path = runtime_path(name)
    if not path.exists():
        return []
    items = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            parsed = json.loads(line)
            if isinstance(parsed, dict):
                items.append(parsed)
        except Exception:
            continue
    return items


def bearer_token_from_request(request: Request) -> str:
    header = request.headers.get("authorization", "")
    match = re.match(r"^Bearer\s+(.+)$", header.strip(), re.I)
    return match.group(1).strip() if match else ""


def verified_supabase_user(request: Request) -> Optional[Dict[str, Any]]:
    token = bearer_token_from_request(request)
    if not token:
        return None
    if not SUPABASE_URL or not (SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY):
        return None
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY,
    }
    try:
        response = requests.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers, timeout=12)
    except Exception:
        return None
    if response.status_code >= 400:
        return None
    user = response.json()
    if not user.get("id"):
        return None
    return user


def require_verified_user(request: Request) -> Any:
    user = verified_supabase_user(request)
    if not user:
        return json_error("Authentication is required. Configure Supabase and sign in again.", 401)
    return user


def public_user_payload(user: Dict[str, Any]) -> Dict[str, Any]:
    metadata = user.get("user_metadata") or {}
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "created_at": user.get("created_at"),
        "role": metadata.get("role") or "student",
        "display_name": (
            metadata.get("full_name")
            or metadata.get("name")
            or " ".join(
                item for item in [
                    metadata.get("first_name") or metadata.get("firstName"),
                    metadata.get("last_name") or metadata.get("lastName"),
                ]
                if item
            ).strip()
            or user.get("email")
        ),
    }


def _clean_identity_header(value: Any, limit: int = 180) -> str:
    return re.sub(r"[\r\n]+", " ", str(value or "").strip())[:limit]


def database_identity_from_verified_user(user: Dict[str, Any]) -> Dict[str, Any]:
    public = public_user_payload(user)
    return {
        "auth_provider": "supabase",
        "auth_subject": public.get("id") or public.get("email") or "unknown",
        "email": public.get("email") or "",
        "display_name": public.get("display_name") or "",
        "auth_mode": "supabase",
        "role": public.get("role") or "student",
        "metadata": {"supabase_user_id": public.get("id")},
    }


def database_identity_from_request(request: Optional[Request], client_fingerprint: str = "") -> Dict[str, Any]:
    if request is not None:
        supabase_user = verified_supabase_user(request)
        if supabase_user:
            return database_identity_from_verified_user(supabase_user)

        client_id = _clean_identity_header(request.headers.get("x-synapse-client-id"), 160)
        local_user_id = _clean_identity_header(request.headers.get("x-synapse-user-id"), 160)
        auth_mode = _clean_identity_header(request.headers.get("x-synapse-auth-mode"), 60) or "anonymous"
        if local_user_id or client_id:
            subject = local_user_id or client_id
            provider = "local_demo" if auth_mode == "local_demo" or local_user_id else "anonymous"
            return {
                "auth_provider": provider,
                "auth_subject": subject,
                "email": _clean_identity_header(request.headers.get("x-synapse-user-email"), 220).lower(),
                "display_name": _clean_identity_header(request.headers.get("x-synapse-user-name"), 180),
                "auth_mode": auth_mode,
                "role": _clean_identity_header(request.headers.get("x-synapse-user-role"), 80) or "student",
                "metadata": {"client_id": client_id},
            }

        user_agent = _clean_identity_header(request.headers.get("user-agent"), 260)
        fallback_subject = sha256_text(f"{client_fingerprint}|{user_agent}")[:32] if (client_fingerprint or user_agent) else "anonymous"
        return {
            "auth_provider": "anonymous",
            "auth_subject": fallback_subject,
            "email": "",
            "display_name": "Anonymous Synapse user",
            "auth_mode": "anonymous",
            "role": "student",
            "metadata": {},
        }

    fallback_subject = sha256_text(client_fingerprint or "direct-call")[:32]
    return {
        "auth_provider": "direct",
        "auth_subject": fallback_subject,
        "email": "",
        "display_name": "Direct backend call",
        "auth_mode": "direct",
        "role": "student",
        "metadata": {},
    }


def persist_generated_analysis_result(
    request: Optional[Request],
    result: Dict[str, Any],
    client_fingerprint: str = "",
) -> Dict[str, Any]:
    if not isinstance(result, dict) or result.get("error"):
        return {}
    try:
        identity = database_identity_from_request(request, client_fingerprint)
        return synapse_database.upsert_generated_content(identity, result, client_fingerprint)
    except Exception as error:
        print(f"[database] generated content persistence skipped: {error}", flush=True)
        return {}


def price_id_for_plan(plan_id: str, explicit_price_id: str = "") -> str:
    clean_plan = re.sub(r"[^a-z0-9_-]", "", str(plan_id or "").lower())
    clean_explicit = str(explicit_price_id or "").strip()
    configured_values = {value for value in STRIPE_PRICE_IDS.values() if value}
    if clean_explicit and clean_explicit in configured_values:
        return clean_explicit
    return STRIPE_PRICE_IDS.get(clean_plan, "")


def require_stripe_ready() -> Optional[Response]:
    if not stripe or not STRIPE_SECRET_KEY:
        return json_error("Stripe billing is not configured. Set STRIPE_SECRET_KEY and Stripe price IDs.", 503)
    return None


def billing_store() -> Dict[str, Any]:
    store = read_runtime_json("billing_customers.json", {})
    return store if isinstance(store, dict) else {}


def save_billing_store(store: Dict[str, Any]) -> None:
    write_runtime_json("billing_customers.json", store)


def get_billing_profile(user: Dict[str, Any]) -> Dict[str, Any]:
    store = billing_store()
    profile = store.get(user["id"])
    if isinstance(profile, dict):
        return profile
    profile = {
        "user_id": user["id"],
        "email": user.get("email"),
        "stripe_customer_id": "",
        "created_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "updated_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
    }
    store[user["id"]] = profile
    save_billing_store(store)
    return profile


def save_billing_profile(user_id: str, profile: Dict[str, Any]) -> None:
    store = billing_store()
    profile["updated_at"] = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    store[user_id] = profile
    save_billing_store(store)


def get_or_create_stripe_customer(user: Dict[str, Any]) -> str:
    profile = get_billing_profile(user)
    if profile.get("stripe_customer_id"):
        return profile["stripe_customer_id"]
    customer = stripe.Customer.create(
        email=user.get("email"),
        metadata={
            "synapse_user_id": user["id"],
            "source": "synapse",
        },
    )
    profile["stripe_customer_id"] = customer.id
    save_billing_profile(user["id"], profile)
    return customer.id


def _clean_contact_text(value: Any, limit: int) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())[:limit]


def _valid_contact_email(value: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value or ""))


@app.post("/contact")
async def submit_contact(request: Request) -> Dict[str, Any]:
    try:
        payload = await request.json()
    except Exception:
        payload = dict(await request.form())

    if _clean_contact_text(payload.get("company"), 160):
        return {"ok": True, "message": "Thanks, your enquiry has been received."}

    name = _clean_contact_text(payload.get("name"), 120)
    email = _clean_contact_text(payload.get("email"), 180).lower()
    interest = _clean_contact_text(payload.get("interest"), 80) or "general"
    message = _clean_contact_text(payload.get("message"), 4000)

    if not name:
        return Response(
            json.dumps({"error": "Name is required."}),
            status_code=422,
            media_type="application/json",
        )
    if not _valid_contact_email(email):
        return Response(
            json.dumps({"error": "A valid email address is required."}),
            status_code=422,
            media_type="application/json",
        )
    if len(message) < 12:
        return Response(
            json.dumps({"error": "Message must be at least 12 characters."}),
            status_code=422,
            media_type="application/json",
        )

    record = {
        "received_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "name": name,
        "email": email,
        "interest": interest,
        "message": message,
        "source": _clean_contact_text(payload.get("source"), 80) or "website",
        "user_agent": request.headers.get("user-agent", "")[:300],
    }
    contact_path = RUNTIME_ASSETS_DIR.parent / "contact_inquiries.jsonl"
    contact_path.parent.mkdir(parents=True, exist_ok=True)
    with contact_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")

    webhook_url = (os.getenv("SYNAPSE_CONTACT_WEBHOOK_URL") or "").strip()
    if webhook_url:
        try:
            requests.post(webhook_url, json=record, timeout=8)
        except Exception:
            return {
                "ok": True,
                "message": "Thanks, your enquiry has been saved. Email delivery is configured but the webhook did not respond.",
            }

    return {
        "ok": True,
        "message": "Thanks, your enquiry has been received.",
    }


@app.get("/db/status")
def database_status() -> Dict[str, Any]:
    try:
        counts = synapse_database.counts()
        return {
            "ok": True,
            "database_path": str(DATABASE_PATH),
            "users": counts.get("users", 0),
            "generated_contents": counts.get("generated_contents", 0),
        }
    except Exception as error:
        return {
            "ok": False,
            "database_path": str(DATABASE_PATH),
            "error": str(error),
        }


@app.get("/content/history")
async def list_generated_content_history(request: Request, limit: int = 50) -> Any:
    try:
        identity = database_identity_from_request(request)
        return {
            "ok": True,
            "items": synapse_database.list_generated_content(identity, limit),
        }
    except Exception as error:
        return json_error(f"Could not load generated content history: {error}", 500)


@app.get("/content/{content_id}")
async def get_generated_content_record(content_id: str, request: Request) -> Any:
    try:
        identity = database_identity_from_request(request)
        record = synapse_database.get_generated_content(identity, content_id)
        if not record:
            return json_error("Generated content was not found for this user.", 404)
        return {"ok": True, "content": record}
    except Exception as error:
        return json_error(f"Could not load generated content: {error}", 500)


@app.delete("/content/{content_id}")
async def delete_generated_content_record(content_id: str, request: Request) -> Any:
    try:
        identity = database_identity_from_request(request)
        deleted = synapse_database.delete_generated_content(identity, content_id)
        if not deleted:
            return json_error("Generated content was not found for this user.", 404)
        return {"ok": True, "deleted": True, "id": content_id}
    except Exception as error:
        return json_error(f"Could not delete generated content: {error}", 500)


@app.post("/billing/checkout")
async def create_billing_checkout(request: Request) -> Any:
    user_or_response = require_verified_user(request)
    if isinstance(user_or_response, Response):
        return user_or_response
    stripe_error = require_stripe_ready()
    if stripe_error:
        return stripe_error
    user = user_or_response
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    plan_id = _clean_contact_text(payload.get("plan_id"), 40) or "student"
    price_id = price_id_for_plan(plan_id, _clean_contact_text(payload.get("price_id"), 120))
    if not price_id:
        return json_error(f"No Stripe price is configured for the {plan_id} plan.", 422)

    success_url = _clean_contact_text(payload.get("success_url"), 500) or f"{SYNAPSE_FRONTEND_BASE_URL}/index.html?billing=success"
    cancel_url = _clean_contact_text(payload.get("cancel_url"), 500) or f"{SYNAPSE_FRONTEND_BASE_URL}/index.html?billing=cancelled"
    customer_id = get_or_create_stripe_customer(user)
    session = stripe.checkout.Session.create(
        customer=customer_id,
        client_reference_id=user["id"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "synapse_user_id": user["id"],
            "synapse_plan_id": plan_id,
            "synapse_price_id": price_id,
        },
        customer_update={"name": "auto"},
    )
    return {
        "ok": True,
        "id": session.id,
        "url": session.url,
        "customer_id": customer_id,
    }


@app.post("/billing/portal")
async def create_billing_portal(request: Request) -> Any:
    user_or_response = require_verified_user(request)
    if isinstance(user_or_response, Response):
        return user_or_response
    stripe_error = require_stripe_ready()
    if stripe_error:
        return stripe_error
    user = user_or_response
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    profile = get_billing_profile(user)
    customer_id = profile.get("stripe_customer_id")
    if not customer_id:
        return json_error("No Stripe customer exists for this account yet. Buy a credit pack first.", 404)
    return_url = _clean_contact_text(payload.get("return_url"), 500) or f"{SYNAPSE_FRONTEND_BASE_URL}/index.html"
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )
    return {
        "ok": True,
        "url": session.url,
        "customer_id": customer_id,
    }


@app.post("/billing/webhook")
async def stripe_billing_webhook(request: Request) -> Any:
    body = await request.body()
    try:
        if STRIPE_WEBHOOK_SECRET:
            if not stripe:
                return json_error("Stripe package is not installed.", 503)
            signature = request.headers.get("stripe-signature", "")
            event = stripe.Webhook.construct_event(body, signature, STRIPE_WEBHOOK_SECRET)
        elif not SYNAPSE_ALLOW_UNSIGNED_STRIPE_WEBHOOK:
            return json_error("Stripe webhook signing is not configured.", 503)
        else:
            event = json.loads(body.decode("utf-8") or "{}")
    except Exception:
        return json_error("Invalid Stripe webhook payload.", 400)

    event_type = event.get("type", "")
    event_object = (event.get("data") or {}).get("object") or {}
    record = {
        "received_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "event_id": event.get("id"),
        "type": event_type,
        "object_id": event_object.get("id"),
        "customer_id": event_object.get("customer"),
        "synapse_user_id": (event_object.get("metadata") or {}).get("synapse_user_id")
            or event_object.get("client_reference_id"),
        "plan_id": (event_object.get("metadata") or {}).get("synapse_plan_id"),
        "price_id": (event_object.get("metadata") or {}).get("synapse_price_id"),
        "payment_status": event_object.get("payment_status"),
        "amount_total": event_object.get("amount_total"),
        "currency": event_object.get("currency"),
    }
    append_runtime_jsonl("billing_ledger.jsonl", record)
    return {"ok": True, "received": True}


@app.get("/account/export")
async def export_account_data(request: Request) -> Any:
    user_or_response = require_verified_user(request)
    if isinstance(user_or_response, Response):
        return user_or_response
    user = user_or_response
    email = (user.get("email") or "").lower()
    profile = get_billing_profile(user)
    ledger = [
        item for item in read_runtime_jsonl("billing_ledger.jsonl")
        if item.get("synapse_user_id") == user["id"] or item.get("customer_id") == profile.get("stripe_customer_id")
    ]
    contacts = [
        item for item in read_runtime_jsonl("contact_inquiries.jsonl")
        if (item.get("email") or "").lower() == email
    ]
    deletions = [
        item for item in read_runtime_jsonl("account_deletions.jsonl")
        if item.get("synapse_user_id") == user["id"]
    ]
    database_identity = database_identity_from_verified_user(user)
    generated_content = synapse_database.export_user_content(database_identity)
    return {
        "ok": True,
        "exported_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "user": public_user_payload(user),
        "billing_profile": profile,
        "billing_ledger": ledger,
        "contact_inquiries": contacts,
        "deletion_requests": deletions,
        "generated_content": generated_content,
        "note": "Browser-local-only history is exported by the frontend. Server-generated content saved after this database feature is included here.",
    }


@app.post("/account/delete")
async def delete_account(request: Request) -> Any:
    user_or_response = require_verified_user(request)
    if isinstance(user_or_response, Response):
        return user_or_response
    user = user_or_response
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    if payload.get("confirm") is not True:
        return json_error("Account deletion requires confirm=true.", 422)

    profile = get_billing_profile(user)
    deletion_record = {
        "deleted_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "synapse_user_id": user["id"],
        "email": user.get("email"),
        "stripe_customer_id": profile.get("stripe_customer_id"),
        "generated_content_deleted": 0,
        "supabase_deleted": False,
        "stripe_marked_deleted": False,
    }
    try:
        deletion_record["generated_content_deleted"] = synapse_database.delete_user_content(
            database_identity_from_verified_user(user)
        )
    except Exception:
        deletion_record["generated_content_deleted"] = 0

    if stripe and STRIPE_SECRET_KEY and profile.get("stripe_customer_id"):
        try:
            stripe.Customer.modify(
                profile["stripe_customer_id"],
                metadata={
                    "synapse_user_id": user["id"],
                    "synapse_deleted_at": deletion_record["deleted_at"],
                },
            )
            deletion_record["stripe_marked_deleted"] = True
        except Exception:
            deletion_record["stripe_marked_deleted"] = False

    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        try:
            response = requests.delete(
                f"{SUPABASE_URL}/auth/v1/admin/users/{user['id']}",
                headers={
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                },
                timeout=15,
            )
            deletion_record["supabase_deleted"] = response.status_code < 400
            if response.status_code >= 400:
                deletion_record["supabase_delete_status"] = response.status_code
        except Exception:
            deletion_record["supabase_deleted"] = False

    append_runtime_jsonl("account_deletions.jsonl", deletion_record)
    return {
        "ok": True,
        "message": "Account deletion was processed. Local browser data should now be cleared by the client.",
        "deletion": deletion_record,
    }
