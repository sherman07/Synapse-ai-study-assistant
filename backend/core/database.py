import hashlib
import json
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    from core.config import DATABASE_PATH
except ModuleNotFoundError:
    from backend.core.config import DATABASE_PATH


def utc_now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def json_dumps(value: Any) -> str:
    return json.dumps(value if value is not None else {}, ensure_ascii=False, separators=(",", ":"))


def json_loads(value: str, fallback: Any) -> Any:
    try:
        return json.loads(value) if value else fallback
    except Exception:
        return fallback


def short_hash(value: str, length: int = 24) -> str:
    return hashlib.sha256(str(value or "").encode("utf-8")).hexdigest()[:length]


class SynapseDatabase:
    """SQLite persistence for Synapse users and generated study content."""

    def __init__(self, path: Path = DATABASE_PATH):
        self.path = Path(path)
        self.initialise()

    def connect(self) -> sqlite3.Connection:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(str(self.path), timeout=30)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA busy_timeout = 5000")
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    @contextmanager
    def session(self):
        connection = self.connect()
        try:
            yield connection
            connection.commit()
        finally:
            connection.close()

    def initialise(self) -> None:
        with self.session() as connection:
            try:
                connection.execute("PRAGMA journal_mode = WAL")
            except sqlite3.OperationalError:
                pass
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    auth_provider TEXT NOT NULL,
                    auth_subject TEXT NOT NULL,
                    email TEXT,
                    display_name TEXT,
                    auth_mode TEXT,
                    role TEXT,
                    metadata_json TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    UNIQUE(auth_provider, auth_subject)
                );

                CREATE TABLE IF NOT EXISTS generated_contents (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    source_fingerprint TEXT NOT NULL,
                    client_fingerprint TEXT,
                    title TEXT,
                    summary TEXT NOT NULL,
                    language TEXT,
                    detail_level TEXT,
                    prompt_mode TEXT,
                    source_count INTEGER NOT NULL DEFAULT 0,
                    cached INTEGER NOT NULL DEFAULT 0,
                    sections_json TEXT NOT NULL DEFAULT '{}',
                    connections_json TEXT NOT NULL DEFAULT '[]',
                    mind_map_json TEXT NOT NULL DEFAULT '{}',
                    visual_gallery_json TEXT NOT NULL DEFAULT '[]',
                    sources_json TEXT NOT NULL DEFAULT '[]',
                    full_result_json TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE(user_id, source_fingerprint)
                );

                CREATE INDEX IF NOT EXISTS idx_generated_contents_user_updated
                    ON generated_contents(user_id, updated_at DESC);
                CREATE INDEX IF NOT EXISTS idx_generated_contents_fingerprint
                    ON generated_contents(source_fingerprint);
                """
            )

    def counts(self) -> Dict[str, int]:
        with self.session() as connection:
            users = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            generated = connection.execute("SELECT COUNT(*) FROM generated_contents").fetchone()[0]
        return {"users": int(users), "generated_contents": int(generated)}

    def user_id_for_identity(self, identity: Dict[str, Any]) -> str:
        provider = str(identity.get("auth_provider") or "anonymous").strip() or "anonymous"
        subject = str(identity.get("auth_subject") or identity.get("id") or "anonymous").strip() or "anonymous"
        return f"user_{short_hash(provider + ':' + subject)}"

    def upsert_user(self, identity: Dict[str, Any]) -> Dict[str, Any]:
        provider = str(identity.get("auth_provider") or "anonymous").strip() or "anonymous"
        subject = str(identity.get("auth_subject") or identity.get("id") or "anonymous").strip() or "anonymous"
        now = utc_now()
        user_id = str(identity.get("id") or self.user_id_for_identity(identity))
        payload = {
            "id": user_id,
            "auth_provider": provider,
            "auth_subject": subject,
            "email": str(identity.get("email") or "").strip().lower(),
            "display_name": str(identity.get("display_name") or "").strip(),
            "auth_mode": str(identity.get("auth_mode") or provider).strip(),
            "role": str(identity.get("role") or "student").strip(),
            "metadata_json": json_dumps(identity.get("metadata") or {}),
            "created_at": now,
            "updated_at": now,
        }
        with self.session() as connection:
            existing = connection.execute(
                "SELECT id, created_at FROM users WHERE auth_provider = ? AND auth_subject = ?",
                (provider, subject),
            ).fetchone()
            if existing:
                user_id = existing["id"]
                connection.execute(
                    """
                    UPDATE users
                    SET email = ?, display_name = ?, auth_mode = ?, role = ?, metadata_json = ?, updated_at = ?
                    WHERE id = ?
                    """,
                    (
                        payload["email"],
                        payload["display_name"],
                        payload["auth_mode"],
                        payload["role"],
                        payload["metadata_json"],
                        now,
                        user_id,
                    ),
                )
                payload["id"] = user_id
                payload["created_at"] = existing["created_at"]
            else:
                connection.execute(
                    """
                    INSERT INTO users (
                        id, auth_provider, auth_subject, email, display_name, auth_mode,
                        role, metadata_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        payload["id"],
                        payload["auth_provider"],
                        payload["auth_subject"],
                        payload["email"],
                        payload["display_name"],
                        payload["auth_mode"],
                        payload["role"],
                        payload["metadata_json"],
                        payload["created_at"],
                        payload["updated_at"],
                    ),
                )
        return payload

    def upsert_generated_content(
        self,
        identity: Dict[str, Any],
        result: Dict[str, Any],
        client_fingerprint: str = "",
    ) -> Dict[str, Any]:
        user = self.upsert_user(identity)
        source_fingerprint = str(result.get("source_fingerprint") or client_fingerprint or "").strip()
        if not source_fingerprint:
            source_fingerprint = short_hash(
                json_dumps({
                    "title": result.get("title"),
                    "summary": result.get("summary"),
                    "sources": result.get("sources"),
                }),
                64,
            )
        content_id = f"content_{short_hash(user['id'] + ':' + source_fingerprint)}"
        now = utc_now()
        title = str(result.get("title") or "Generated Study Notes").strip()
        summary = str(result.get("summary") or "").strip()
        visual_gallery = result.get("visual_gallery") or result.get("visuals") or []
        row = {
            "id": content_id,
            "user_id": user["id"],
            "source_fingerprint": source_fingerprint,
            "client_fingerprint": client_fingerprint or "",
            "title": title,
            "summary": summary,
            "language": str(result.get("output_language") or result.get("language") or "").strip(),
            "detail_level": str(result.get("generation_depth") or result.get("detail_level") or "").strip(),
            "prompt_mode": str(result.get("prompt_mode") or "").strip(),
            "source_count": int(result.get("source_count") or len(result.get("sources") or []) or 0),
            "cached": 1 if result.get("cached") else 0,
            "sections_json": json_dumps(result.get("sections") or {}),
            "connections_json": json_dumps(result.get("connections") or []),
            "mind_map_json": json_dumps(result.get("mind_map") or {}),
            "visual_gallery_json": json_dumps(visual_gallery),
            "sources_json": json_dumps(result.get("sources") or []),
            "full_result_json": json_dumps(result),
            "created_at": now,
            "updated_at": now,
        }
        with self.session() as connection:
            existing = connection.execute(
                "SELECT created_at FROM generated_contents WHERE user_id = ? AND source_fingerprint = ?",
                (user["id"], source_fingerprint),
            ).fetchone()
            if existing:
                row["created_at"] = existing["created_at"]
                connection.execute(
                    """
                    UPDATE generated_contents
                    SET client_fingerprint = ?, title = ?, summary = ?, language = ?, detail_level = ?,
                        prompt_mode = ?, source_count = ?, cached = ?, sections_json = ?, connections_json = ?,
                        mind_map_json = ?, visual_gallery_json = ?, sources_json = ?, full_result_json = ?,
                        updated_at = ?
                    WHERE user_id = ? AND source_fingerprint = ?
                    """,
                    (
                        row["client_fingerprint"],
                        row["title"],
                        row["summary"],
                        row["language"],
                        row["detail_level"],
                        row["prompt_mode"],
                        row["source_count"],
                        row["cached"],
                        row["sections_json"],
                        row["connections_json"],
                        row["mind_map_json"],
                        row["visual_gallery_json"],
                        row["sources_json"],
                        row["full_result_json"],
                        row["updated_at"],
                        user["id"],
                        source_fingerprint,
                    ),
                )
            else:
                connection.execute(
                    """
                    INSERT INTO generated_contents (
                        id, user_id, source_fingerprint, client_fingerprint, title, summary, language,
                        detail_level, prompt_mode, source_count, cached, sections_json, connections_json,
                        mind_map_json, visual_gallery_json, sources_json, full_result_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        row["id"],
                        row["user_id"],
                        row["source_fingerprint"],
                        row["client_fingerprint"],
                        row["title"],
                        row["summary"],
                        row["language"],
                        row["detail_level"],
                        row["prompt_mode"],
                        row["source_count"],
                        row["cached"],
                        row["sections_json"],
                        row["connections_json"],
                        row["mind_map_json"],
                        row["visual_gallery_json"],
                        row["sources_json"],
                        row["full_result_json"],
                        row["created_at"],
                        row["updated_at"],
                    ),
                )
        return {"id": content_id, "user_id": user["id"], "source_fingerprint": source_fingerprint, "updated_at": now}

    def list_generated_content(self, identity: Dict[str, Any], limit: int = 50) -> List[Dict[str, Any]]:
        user = self.upsert_user(identity)
        limit = max(1, min(int(limit or 50), 200))
        with self.session() as connection:
            rows = connection.execute(
                """
                SELECT id, title, language, detail_level, prompt_mode, source_count, cached,
                       source_fingerprint, client_fingerprint, created_at, updated_at,
                       substr(summary, 1, 360) AS summary_preview
                FROM generated_contents
                WHERE user_id = ?
                ORDER BY updated_at DESC
                LIMIT ?
                """,
                (user["id"], limit),
            ).fetchall()
        return [dict(row) for row in rows]

    def get_generated_content(self, identity: Dict[str, Any], content_id: str) -> Optional[Dict[str, Any]]:
        user = self.upsert_user(identity)
        with self.session() as connection:
            row = connection.execute(
                "SELECT * FROM generated_contents WHERE user_id = ? AND id = ?",
                (user["id"], content_id),
            ).fetchone()
        if not row:
            return None
        result = json_loads(row["full_result_json"], {})
        if not isinstance(result, dict):
            result = {}
        result.setdefault("title", row["title"])
        result.setdefault("summary", row["summary"])
        result.setdefault("sections", json_loads(row["sections_json"], {}))
        result.setdefault("connections", json_loads(row["connections_json"], []))
        result.setdefault("mind_map", json_loads(row["mind_map_json"], {}))
        result.setdefault("visual_gallery", json_loads(row["visual_gallery_json"], []))
        result.setdefault("visuals", result.get("visual_gallery") or [])
        result.setdefault("sources", json_loads(row["sources_json"], []))
        result["database_record"] = {
            "id": row["id"],
            "user_id": row["user_id"],
            "source_fingerprint": row["source_fingerprint"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
        return result

    def delete_generated_content(self, identity: Dict[str, Any], content_id: str) -> bool:
        user = self.upsert_user(identity)
        with self.session() as connection:
            cursor = connection.execute(
                "DELETE FROM generated_contents WHERE user_id = ? AND id = ?",
                (user["id"], content_id),
            )
            return cursor.rowcount > 0

    def export_user_content(self, identity: Dict[str, Any]) -> List[Dict[str, Any]]:
        user = self.upsert_user(identity)
        with self.session() as connection:
            rows = connection.execute(
                "SELECT full_result_json FROM generated_contents WHERE user_id = ? ORDER BY updated_at DESC",
                (user["id"],),
            ).fetchall()
        return [json_loads(row["full_result_json"], {}) for row in rows]

    def delete_user_content(self, identity: Dict[str, Any]) -> int:
        user = self.upsert_user(identity)
        with self.session() as connection:
            cursor = connection.execute("DELETE FROM generated_contents WHERE user_id = ?", (user["id"],))
            return int(cursor.rowcount or 0)


synapse_database = SynapseDatabase()
