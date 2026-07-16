import base64
import hashlib
import os
import re
import threading
from pathlib import Path
from typing import List, Optional, Tuple
from urllib.parse import urlparse

import requests

try:
    from core.config import PUBLIC_BACKEND_BASE_URL, RUNTIME_ASSETS_DIR
except ModuleNotFoundError:
    from backend.core.config import PUBLIC_BACKEND_BASE_URL, RUNTIME_ASSETS_DIR


DATA_IMAGE_RE = re.compile(r"^data:(image/[A-Za-z0-9.+-]+)(?:;[^,]*)?;base64,(.+)$", re.S)
CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}
RASTER_IMAGE_TYPES = set(CONTENT_TYPE_EXTENSIONS)
LOCAL_FILESYSTEM_URL_RE = re.compile(
    r"^(?:file:|[A-Za-z]:[\\/]|\\\\|/(?:Users|home|var|tmp|private|Volumes|Applications|opt|usr)/)",
    re.I,
)
VISUAL_ASSET_BUCKET_DEFAULT = "synapse-visual-assets"
_storage_bucket_ready = False
_storage_bucket_lock = threading.Lock()


def durable_visual_storage_enabled() -> bool:
    return str(os.getenv("SYNAPSE_VISUAL_ASSET_STORAGE_ENABLED", "false")).strip().lower() in {
        "1", "true", "yes", "on"
    }


def durable_visual_storage_settings() -> Optional[Tuple[str, str, str]]:
    if not durable_visual_storage_enabled():
        return None
    supabase_url = str(os.getenv("SUPABASE_URL") or os.getenv("SYNAPSE_SUPABASE_URL") or "").rstrip("/")
    service_role_key = str(
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SYNAPSE_SUPABASE_SERVICE_ROLE_KEY")
        or ""
    ).strip()
    bucket = str(os.getenv("SYNAPSE_VISUAL_ASSET_BUCKET") or VISUAL_ASSET_BUCKET_DEFAULT).strip()
    if not supabase_url or not service_role_key or not bucket:
        return None
    return supabase_url, service_role_key, bucket


def durable_visual_storage_headers(service_role_key: str, content_type: str = "") -> dict:
    headers = {
        "Authorization": f"Bearer {service_role_key}",
        "apikey": service_role_key,
    }
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def ensure_durable_visual_asset_bucket() -> bool:
    global _storage_bucket_ready
    settings = durable_visual_storage_settings()
    if not settings:
        return False
    if _storage_bucket_ready:
        return True
    supabase_url, service_role_key, bucket = settings
    with _storage_bucket_lock:
        if _storage_bucket_ready:
            return True
        try:
            response = requests.post(
                f"{supabase_url}/storage/v1/bucket",
                headers=durable_visual_storage_headers(service_role_key, "application/json"),
                json={"id": bucket, "name": bucket, "public": False},
                timeout=4,
            )
            if response.status_code not in {200, 201, 409}:
                return False
        except requests.RequestException:
            return False
        _storage_bucket_ready = True
    return True


def durable_visual_asset_object_url(supabase_url: str, bucket: str, asset_name: str) -> str:
    return f"{supabase_url}/storage/v1/object/{bucket}/visuals/{asset_name}"


def persist_visual_asset_to_durable_storage(asset_name: str, content_type: str, data: bytes) -> bool:
    """Mirror source visuals to private Supabase Storage when production enables it."""
    settings = durable_visual_storage_settings()
    if not settings or not asset_name or not data or not ensure_durable_visual_asset_bucket():
        return False
    supabase_url, service_role_key, bucket = settings
    try:
        response = requests.post(
            durable_visual_asset_object_url(supabase_url, bucket, asset_name),
            headers={
                **durable_visual_storage_headers(service_role_key, content_type),
                "x-upsert": "true",
            },
            data=data,
            timeout=6,
        )
        return response.status_code in {200, 201}
    except requests.RequestException:
        return False


def fetch_visual_asset_from_durable_storage(asset_name: str) -> Optional[Tuple[bytes, str]]:
    settings = durable_visual_storage_settings()
    if not settings or not asset_name:
        return None
    supabase_url, service_role_key, bucket = settings
    try:
        response = requests.get(
            durable_visual_asset_object_url(supabase_url, bucket, asset_name),
            headers=durable_visual_storage_headers(service_role_key),
            timeout=6,
        )
    except requests.RequestException:
        return None
    if response.status_code != 200 or not response.content:
        return None
    content_type = response.headers.get("content-type", "application/octet-stream").split(";", 1)[0]
    return response.content, content_type


def durable_visual_asset_exists(asset_name: str) -> bool:
    settings = durable_visual_storage_settings()
    if not settings or not asset_name:
        return False
    supabase_url, service_role_key, bucket = settings
    try:
        response = requests.head(
            durable_visual_asset_object_url(supabase_url, bucket, asset_name),
            headers=durable_visual_storage_headers(service_role_key),
            timeout=4,
        )
        return response.status_code == 200
    except requests.RequestException:
        return False


def parse_image_data_url(url: str) -> Optional[Tuple[str, bytes]]:
    match = DATA_IMAGE_RE.match(str(url or "").strip())
    if not match:
        return None
    content_type = match.group(1).lower()
    try:
        data = base64.b64decode(match.group(2), validate=True)
    except Exception:
        return None
    if not data:
        return None
    return content_type, data


def visual_asset_url_for_browser(url: str) -> str:
    """Convert model-facing image data URLs into browser-served runtime assets."""
    value = str(url or "").strip()
    parsed = parse_image_data_url(value)
    if not parsed:
        lower_value = value.lower()
        if lower_value.startswith("data:image/"):
            return ""
        if LOCAL_FILESYSTEM_URL_RE.match(value):
            return ""
        parsed_url = urlparse(value)
        if parsed_url.scheme and parsed_url.scheme not in {"http", "https"}:
            return ""
        return value

    content_type, data = parsed
    if content_type not in RASTER_IMAGE_TYPES:
        return ""
    extension = CONTENT_TYPE_EXTENSIONS.get(content_type, "img")
    digest = hashlib.sha256(data).hexdigest()
    asset_dir = RUNTIME_ASSETS_DIR / "visuals"
    asset_path = asset_dir / f"{digest}.{extension}"
    try:
        asset_dir.mkdir(parents=True, exist_ok=True)
        if not asset_path.exists():
            asset_path.write_bytes(data)
        # Render's local disk is temporary. Production mirrors these private
        # source figures to Supabase and restores them through the same URL.
        persist_visual_asset_to_durable_storage(asset_path.name, content_type, data)
        return f"{PUBLIC_BACKEND_BASE_URL}/assets/visuals/{asset_path.name}"
    except Exception:
        return url


def runtime_visual_asset_path_for_browser_url(url: str) -> Optional[Path]:
    value = str(url or "").strip()
    if not value:
        return None

    parsed = urlparse(value)
    backend_base = urlparse(PUBLIC_BACKEND_BASE_URL)
    path = parsed.path
    if parsed.scheme or parsed.netloc:
        if parsed.scheme != backend_base.scheme or parsed.netloc != backend_base.netloc:
            return None

    prefix = "/assets/visuals/"
    if not path.startswith(prefix):
        return None
    asset_name = path[len(prefix):]
    if not asset_name or "/" in asset_name or "\\" in asset_name:
        return None
    return RUNTIME_ASSETS_DIR / "visuals" / asset_name


def runtime_asset_path_for_relative_path(asset_path: str) -> Optional[Path]:
    relative_path = str(asset_path or "").lstrip("/")
    if not relative_path:
        return None
    try:
        root = RUNTIME_ASSETS_DIR.resolve()
        candidate = (root / relative_path).resolve()
    except Exception:
        return None
    if candidate == root or root not in candidate.parents:
        return None
    return candidate


def visual_asset_url_is_available(url: str) -> bool:
    browser_url = visual_asset_url_for_browser(url)
    if not browser_url:
        return False
    asset_path = runtime_visual_asset_path_for_browser_url(browser_url)
    if asset_path is None:
        return True
    try:
        return asset_path.is_file() or durable_visual_asset_exists(asset_path.name)
    except Exception:
        return False


def filter_browser_visual_gallery(items: List[dict]) -> List[dict]:
    """Keep cached visual metadata only when the browser URL can still render."""
    cleaned: List[dict] = []
    for fallback_index, item in enumerate(items or []):
        if not isinstance(item, dict):
            continue
        browser_url = visual_asset_url_for_browser(item.get("url", ""))
        if not browser_url or not visual_asset_url_is_available(browser_url):
            continue
        cleaned_item = dict(item)
        cleaned_item["url"] = browser_url
        if "index" not in cleaned_item:
            marker_index = visual_marker_index(cleaned_item, fallback_index)
            if marker_index is not None:
                cleaned_item["index"] = marker_index
        cleaned.append(cleaned_item)
    return cleaned


def visual_marker_index(item: dict, fallback_index: int) -> Optional[int]:
    for key in ("index", "id"):
        try:
            value = item.get(key)
            if value is None or value == "":
                continue
            index = int(value)
        except Exception:
            continue
        if index >= 0:
            return index
    return fallback_index


def visual_marker_indexes(items: List[dict]) -> set:
    indexes = set()
    for fallback_index, item in enumerate(items or []):
        if not isinstance(item, dict):
            continue
        marker_index = visual_marker_index(item, fallback_index)
        if marker_index is not None:
            indexes.add(marker_index)
    return indexes


def prune_unavailable_visual_markers(summary: str, items: List[dict]) -> str:
    """Drop cached visual markers whose browser-safe visual card no longer exists."""
    text = str(summary or "")
    if not text:
        return text
    available_indexes = visual_marker_indexes(items)

    def keep_or_remove(match) -> str:
        try:
            marker_index = int(match.group(1))
        except Exception:
            return ""
        return match.group(0) if marker_index in available_indexes else ""

    text = re.sub(r"(?m)^\s*\[\[VISUAL:(\d+)\]\]\s*$", keep_or_remove, text)
    text = re.sub(r"\[\[VISUAL:(\d+)\]\]", keep_or_remove, text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
