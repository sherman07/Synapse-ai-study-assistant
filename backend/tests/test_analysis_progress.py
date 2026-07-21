import time
import unittest

from fastapi.testclient import TestClient

from backend.app import (
    app,
    begin_analysis_progress,
    finish_analysis_progress,
    get_analysis_progress,
    update_analysis_progress,
)


class AnalysisProgressRegistryTests(unittest.TestCase):
    def test_progress_lifecycle_reports_safe_stage_and_elapsed_time(self):
        request_id = "analysis_test_123456789"

        self.assertIsNotNone(begin_analysis_progress(request_id))
        time.sleep(0.001)
        update_analysis_progress(request_id, "generation")

        snapshot = get_analysis_progress(request_id)
        self.assertEqual(snapshot["request_id"], request_id)
        self.assertEqual(snapshot["status"], "running")
        self.assertEqual(snapshot["stage"], "generation")
        self.assertEqual(snapshot["message"], "Drafting your tutor-style study notes")
        self.assertGreaterEqual(snapshot["elapsed_seconds"], 0)
        self.assertGreater(snapshot["progress_percent"], 0)
        self.assertNotIn("source", snapshot)

        finish_analysis_progress(request_id, "completed")
        completed = get_analysis_progress(request_id)
        self.assertEqual(completed["status"], "completed")
        self.assertEqual(completed["stage"], "completed")
        self.assertEqual(completed["progress_percent"], 100)

    def test_invalid_request_ids_are_not_recorded(self):
        self.assertIsNone(begin_analysis_progress("short"))
        self.assertIsNone(get_analysis_progress("short"))


class AnalysisProgressRouteTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_unknown_analysis_progress_returns_404(self):
        response = self.client.get("/analyze/progress/analysis_unknown_123456")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"error": "Analysis progress was not found."})

    def test_analysis_progress_route_returns_registry_snapshot(self):
        request_id = "analysis_route_123456789"
        begin_analysis_progress(request_id)
        update_analysis_progress(request_id, "source_preparation")

        response = self.client.get(f"/analyze/progress/{request_id}")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["request_id"], request_id)
        self.assertEqual(payload["stage"], "source_preparation")
        self.assertEqual(
            set(payload),
            {"request_id", "status", "stage", "progress_percent", "message", "elapsed_seconds"},
        )


if __name__ == "__main__":
    unittest.main()
