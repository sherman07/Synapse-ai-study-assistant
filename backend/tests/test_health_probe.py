import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app import app


class HealthOpenAIProbeTests(unittest.TestCase):
    def test_openai_health_does_not_call_model_by_default(self):
        with (
            patch("backend.app.require_text_ai") as require_text_ai,
            patch("backend.app.generate_chat", return_value="OK") as generate_chat,
        ):
            response = TestClient(app).get("/health/openai")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "ok")
        self.assertFalse(payload["probe"])
        require_text_ai.assert_called_once()
        generate_chat.assert_not_called()

    def test_openai_health_probe_query_calls_model_once(self):
        with (
            patch("backend.app.require_text_ai"),
            patch("backend.app.generate_chat", return_value="OK") as generate_chat,
        ):
            response = TestClient(app).get("/health/openai?probe=true")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "ok")
        self.assertTrue(payload["probe"])
        self.assertEqual(payload["reply"], "OK")
        generate_chat.assert_called_once()


if __name__ == "__main__":
    unittest.main()
