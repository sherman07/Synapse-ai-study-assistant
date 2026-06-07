import json
import os
import time
from typing import Optional

try:
    from core.config import ANALYSIS_CACHE_TTL_SECONDS, CACHE_PATH
except ModuleNotFoundError:
    from backend.core.config import ANALYSIS_CACHE_TTL_SECONDS, CACHE_PATH


class AnalysisCacheStore:
    """Owns persistence, TTL cleanup, and lookup for generated analysis results."""

    def __init__(self, cache_path=CACHE_PATH, ttl_seconds: int = ANALYSIS_CACHE_TTL_SECONDS):
        self.cache_path = cache_path
        self.ttl_seconds = ttl_seconds

    def should_minify(self) -> bool:
        return os.getenv("MINIFY_CACHE_JSON", "true").lower() not in {"0", "false", "no"}

    def load(self) -> dict:
        try:
            if self.cache_path.exists():
                return json.loads(self.cache_path.read_text(encoding="utf-8"))
        except Exception:
            pass
        return {}

    def fresh_items(self, cache: dict) -> dict:
        now = time.time()
        cleaned = {}
        for key, value in (cache or {}).items():
            if not isinstance(value, dict):
                continue
            try:
                created_at = float(value.get("created_at", now))
            except Exception:
                created_at = now
            if now - created_at <= self.ttl_seconds:
                cleaned[key] = value
        return cleaned

    def save(self, cache: dict) -> None:
        temp_path = None
        try:
            cleaned = self.fresh_items(cache)
            if self.should_minify():
                payload = json.dumps(cleaned, ensure_ascii=False, separators=(",", ":"))
            else:
                payload = json.dumps(cleaned, ensure_ascii=False, indent=2)
            self.cache_path.parent.mkdir(parents=True, exist_ok=True)
            temp_path = self.cache_path.with_name(
                f".{self.cache_path.name}.{os.getpid()}.{int(time.time() * 1000)}.tmp"
            )
            temp_path.write_text(payload, encoding="utf-8")
            os.replace(temp_path, self.cache_path)
        except Exception:
            if temp_path:
                try:
                    temp_path.unlink(missing_ok=True)
                except Exception:
                    pass
            pass

    def get(self, fingerprint: str) -> Optional[dict]:
        if not fingerprint:
            return None
        cache = self.load()
        item = cache.get(fingerprint)
        if not item:
            return None
        try:
            created_at = float(item.get("created_at", 0))
        except Exception:
            created_at = 0
        if time.time() - created_at > self.ttl_seconds:
            cache.pop(fingerprint, None)
            self.save(cache)
            return None
        return item.get("result")

    def set(self, fingerprint: str, result: dict) -> None:
        if not fingerprint:
            return
        cache = self.load()
        cache[fingerprint] = {"created_at": time.time(), "result": result}
        self.save(cache)


analysis_cache_store = AnalysisCacheStore()


def load_analysis_cache() -> dict:
    return analysis_cache_store.load()


def save_analysis_cache(cache: dict) -> None:
    analysis_cache_store.save(cache)


def cache_get(fingerprint: str) -> Optional[dict]:
    return analysis_cache_store.get(fingerprint)


def cache_set(fingerprint: str, result: dict) -> None:
    analysis_cache_store.set(fingerprint, result)
