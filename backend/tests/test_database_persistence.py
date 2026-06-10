import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app import app
from backend.core.database import SynapseDatabase


class SynapseDatabaseTests(unittest.TestCase):
    def sample_identity(self):
        return {
            "auth_provider": "local_demo",
            "auth_subject": "acct_test",
            "email": "student@example.com",
            "display_name": "Student Example",
            "auth_mode": "local_demo",
            "role": "student",
            "metadata": {"client_id": "client_test"},
        }

    def sample_result(self):
        return {
            "title": "Stored Study Notes",
            "summary": "# Overview\n\nStored generated notes with [[VISUAL:0]].",
            "sections": {"Overview": "Stored generated notes with [[VISUAL:0]]."},
            "connections": [{"from": "A", "to": "B", "label": "Connection"}],
            "mind_map": {"center": "Stored Study Notes", "branches": []},
            "visual_gallery": [{
                "index": 0,
                "url": "http://127.0.0.1:8001/assets/visuals/table.png",
                "title": "Evidence table",
            }],
            "sources": [{
                "display_name": "source.pdf",
                "source_identity": "file:abc",
                "text_excerpt": "Extracted source text",
            }],
            "source_fingerprint": "fingerprint-1",
            "language": "english",
            "detail_level": "detailed",
            "prompt_mode": "professor_mode",
            "source_count": 1,
        }

    def test_generated_content_round_trip(self):
        with tempfile.TemporaryDirectory() as tmp:
            database = SynapseDatabase(Path(tmp) / "synapse.sqlite3")
            saved = database.upsert_generated_content(
                self.sample_identity(),
                self.sample_result(),
                client_fingerprint="client-fingerprint",
            )

            items = database.list_generated_content(self.sample_identity())
            loaded = database.get_generated_content(self.sample_identity(), saved["id"])

            self.assertEqual(len(items), 1)
            self.assertEqual(items[0]["id"], saved["id"])
            self.assertEqual(loaded["title"], "Stored Study Notes")
            self.assertEqual(loaded["sections"]["Overview"], "Stored generated notes with [[VISUAL:0]].")
            self.assertEqual(loaded["visual_gallery"][0]["title"], "Evidence table")
            self.assertEqual(loaded["database_record"]["source_fingerprint"], "fingerprint-1")

            self.assertTrue(database.delete_generated_content(self.sample_identity(), saved["id"]))
            self.assertEqual(database.list_generated_content(self.sample_identity()), [])

    def test_content_history_endpoint_uses_request_identity(self):
        with tempfile.TemporaryDirectory() as tmp:
            database = SynapseDatabase(Path(tmp) / "synapse.sqlite3")
            identity = {
                "auth_provider": "anonymous",
                "auth_subject": "client_test",
                "email": "",
                "display_name": "",
                "auth_mode": "anonymous",
                "role": "student",
                "metadata": {"client_id": "client_test"},
            }
            database.upsert_generated_content(identity, self.sample_result())

            with patch("backend.app.synapse_database", database):
                response = TestClient(app).get(
                    "/content/history",
                    headers={"X-Synapse-Client-Id": "client_test"},
                )

            self.assertEqual(response.status_code, 200)
            payload = response.json()
            self.assertTrue(payload["ok"])
            self.assertEqual(len(payload["items"]), 1)
            self.assertEqual(payload["items"][0]["title"], "Stored Study Notes")


if __name__ == "__main__":
    unittest.main()
