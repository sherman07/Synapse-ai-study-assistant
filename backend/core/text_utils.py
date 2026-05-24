import hashlib
import re
from typing import List, Optional
from urllib.parse import parse_qs, urlparse

try:
    from core.config import MAX_SOURCE_CHARS
except ModuleNotFoundError:
    from backend.core.config import MAX_SOURCE_CHARS


URL_PATTERN = re.compile(r"https?://[^\s<>()\"']+", re.I)
TRAILING_URL_PUNCTUATION = ".,;:!?)]}”’\""
YOUTUBE_VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")
YOUTUBE_URL_VIDEO_ID_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?(?:youtube(?:-nocookie)?\.com/"
    r"(?:watch\?[^<>\s\"']*?v=|embed/|shorts/|live/)|youtu\.be/)"
    r"([A-Za-z0-9_-]{11})",
    re.I,
)


class TextHasher:
    """Builds stable fingerprints for source and cache identity."""

    def sha256_text(self, value: str) -> str:
        return hashlib.sha256((value or "").encode("utf-8", errors="ignore")).hexdigest()

    def sha256_bytes(self, data: bytes) -> str:
        return hashlib.sha256(data or b"").hexdigest()


class TextNormalizer:
    """Owns text cleanup rules that are independent of source type."""

    def normalise_space(self, text: str) -> str:
        return re.sub(r"\s+", " ", text or "").strip()

    def truncate(self, text: str, limit: int = MAX_SOURCE_CHARS) -> str:
        text = text or ""
        return text[:limit].strip()

    def clean_html(self, raw: str) -> str:
        raw = re.sub(r"<script[\s\S]*?</script>", " ", raw, flags=re.I)
        raw = re.sub(r"<style[\s\S]*?</style>", " ", raw, flags=re.I)
        raw = re.sub(r"<[^>]+>", " ", raw)
        return self.normalise_space(raw)

    def remove_urls(self, text: str) -> str:
        text = re.sub(r"https?://[^\s<>()]+", " ", text or "")
        return self.normalise_space(text)


class UrlDetector:
    """Extracts plain web URLs while trimming punctuation from surrounding prose."""

    def __init__(self, normalizer: TextNormalizer):
        self.normalizer = normalizer

    def clean_detected_url(self, raw_url: str) -> str:
        return (raw_url or "").strip().rstrip(TRAILING_URL_PUNCTUATION)

    def extract_urls(self, text: str) -> List[str]:
        urls: List[str] = []
        seen = set()
        for raw_url in URL_PATTERN.findall(text or ""):
            cleaned = self.clean_detected_url(raw_url)
            if not cleaned or cleaned in seen:
                continue
            seen.add(cleaned)
            urls.append(cleaned)
        return urls


class YouTubeUrlParser:
    """Owns YouTube id detection and canonical watch URL generation."""

    def __init__(self, url_detector: UrlDetector):
        self.url_detector = url_detector

    def normalise_video_id(self, raw_value: str) -> Optional[str]:
        value = (raw_value or "").strip()
        if YOUTUBE_VIDEO_ID_PATTERN.fullmatch(value):
            return value
        match = re.match(r"([A-Za-z0-9_-]{11})", value)
        return match.group(1) if match else None

    def get_video_id(self, url: str) -> Optional[str]:
        text = (url or "").strip()
        if not text:
            return None

        identity_match = re.match(r"^youtube:([A-Za-z0-9_-]{11})$", text, re.I)
        if identity_match:
            return identity_match.group(1)

        direct_match = YOUTUBE_URL_VIDEO_ID_PATTERN.search(text)
        if direct_match:
            return self.normalise_video_id(direct_match.group(1))

        parsed = urlparse(text)
        host = parsed.netloc.lower()

        if "youtube.com" in host:
            if parsed.path.startswith("/shorts/"):
                return self.normalise_video_id(parsed.path.split("/shorts/", 1)[1].split("/", 1)[0])
            if parsed.path.startswith("/embed/"):
                return self.normalise_video_id(parsed.path.split("/embed/", 1)[1].split("/", 1)[0])
            if parsed.path.startswith("/live/"):
                return self.normalise_video_id(parsed.path.split("/live/", 1)[1].split("/", 1)[0])
            return self.normalise_video_id(parse_qs(parsed.query).get("v", [None])[0] or "")

        if "youtu.be" in host:
            return self.normalise_video_id(parsed.path.strip("/").split("/", 1)[0])

        return None

    def canonical_watch_url(self, url: str) -> str:
        video_id = self.get_video_id(url)
        if not video_id:
            return self.url_detector.clean_detected_url(url)
        return f"https://www.youtube.com/watch?v={video_id}"

    def extract_urls(self, text: str) -> List[str]:
        urls: List[str] = []
        seen_video_ids = set()
        for match in YOUTUBE_URL_VIDEO_ID_PATTERN.finditer(text or ""):
            video_id = self.normalise_video_id(match.group(1))
            if not video_id or video_id in seen_video_ids:
                continue
            seen_video_ids.add(video_id)
            urls.append(f"https://www.youtube.com/watch?v={video_id}")
        return urls


text_hasher = TextHasher()
text_normalizer = TextNormalizer()
url_detector = UrlDetector(text_normalizer)
youtube_url_parser = YouTubeUrlParser(url_detector)


def sha256_text(value: str) -> str:
    return text_hasher.sha256_text(value)


def sha256_bytes(data: bytes) -> str:
    return text_hasher.sha256_bytes(data)


def normalise_space(text: str) -> str:
    return text_normalizer.normalise_space(text)


def truncate_text(text: str, limit: int = MAX_SOURCE_CHARS) -> str:
    return text_normalizer.truncate(text, limit)


def clean_html(raw: str) -> str:
    return text_normalizer.clean_html(raw)


def remove_urls_from_text(text: str) -> str:
    return text_normalizer.remove_urls(text)


def clean_detected_url(raw_url: str) -> str:
    return url_detector.clean_detected_url(raw_url)


def normalise_youtube_video_id(raw_value: str) -> Optional[str]:
    return youtube_url_parser.normalise_video_id(raw_value)


def get_youtube_video_id(url: str) -> Optional[str]:
    return youtube_url_parser.get_video_id(url)


def extract_urls_from_text(text: str) -> List[str]:
    return url_detector.extract_urls(text)


def canonicalize_youtube_watch_url(url: str) -> str:
    return youtube_url_parser.canonical_watch_url(url)


def extract_youtube_urls_from_text(text: str) -> List[str]:
    return youtube_url_parser.extract_urls(text)
