import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend import app as backend_app_module
from backend.app import app


class FakeSupabaseResponse:
    def __init__(self, status_code=200, payload=None, text=""):
        self.status_code = status_code
        self._payload = payload if payload is not None else {}
        self.text = text or "{}"

    def json(self):
        return self._payload


def signup_payload(email="New.User@Example.com", password="Strongpass1", confirm_password="Strongpass1"):
    return {
        "firstName": "New",
        "lastName": "User",
        "email": email,
        "role": "student",
        "password": password,
        "confirmPassword": confirm_password,
        "termsAccepted": True,
        "redirectTo": "http://localhost:5176/frontend/verify.html",
    }


class AuthSignupApiTests(unittest.TestCase):
    def setUp(self):
        self.previous_supabase_url = backend_app_module.SUPABASE_URL
        self.previous_anon_key = backend_app_module.SUPABASE_ANON_KEY
        self.previous_service_key = backend_app_module.SUPABASE_SERVICE_ROLE_KEY
        backend_app_module.SUPABASE_URL = "https://project.supabase.co"
        backend_app_module.SUPABASE_ANON_KEY = "anon-key"
        backend_app_module.SUPABASE_SERVICE_ROLE_KEY = "service-role-key"
        self.client = TestClient(app)

    def tearDown(self):
        backend_app_module.SUPABASE_URL = self.previous_supabase_url
        backend_app_module.SUPABASE_ANON_KEY = self.previous_anon_key
        backend_app_module.SUPABASE_SERVICE_ROLE_KEY = self.previous_service_key

    def test_new_email_creates_account_and_reports_confirmation_sent(self):
        def fake_get(*args, **kwargs):
            return FakeSupabaseResponse(payload={"users": []})

        def fake_post(url, **kwargs):
            self.assertTrue(url.endswith("/auth/v1/signup"))
            self.assertEqual(kwargs["json"]["email"], "new.user@example.com")
            self.assertEqual(kwargs["json"]["data"]["plan"], "free")
            self.assertEqual(kwargs["params"]["redirect_to"], "http://localhost:5176/frontend/verify.html")
            return FakeSupabaseResponse(payload={"user": {"id": "user-1", "email": "new.user@example.com"}})

        with patch("backend.app.requests.get", side_effect=fake_get), patch("backend.app.requests.post", side_effect=fake_post):
            response = self.client.post("/api/auth/signup", json=signup_payload())

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["ok"])
        self.assertEqual(data["state"], "created_confirmation_sent")
        self.assertEqual(data["email"], "new.user@example.com")

    def test_existing_confirmed_email_returns_login_action(self):
        existing = {
            "id": "user-1",
            "email": "student@example.com",
            "email_confirmed_at": "2026-07-01T00:00:00Z",
        }

        with patch("backend.app.requests.get", return_value=FakeSupabaseResponse(payload={"users": [existing]})):
            response = self.client.post("/api/auth/signup", json=signup_payload(email="STUDENT@example.com"))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["ok"])
        self.assertEqual(data["state"], "existing_confirmed")
        self.assertIn("login", data["actions"])
        self.assertIn("forgot_password", data["actions"])

    def test_existing_unconfirmed_email_returns_resend_action(self):
        existing = {
            "id": "user-1",
            "email": "pending@example.com",
            "confirmation_sent_at": "2026-07-01T00:00:00Z",
        }

        with patch("backend.app.requests.get", return_value=FakeSupabaseResponse(payload={"users": [existing]})):
            response = self.client.post("/api/auth/signup", json=signup_payload(email="pending@example.com"))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["ok"])
        self.assertEqual(data["state"], "existing_unconfirmed")
        self.assertIn("resend_confirmation", data["actions"])

    def test_existing_email_lookup_continues_past_first_admin_page(self):
        first_page_users = [{"id": f"user-{index}", "email": f"user{index}@example.com"} for index in range(1000)]
        confirmed = {
            "id": "user-target",
            "email": "target@example.com",
            "email_confirmed_at": "2026-07-01T00:00:00Z",
        }

        with patch("backend.app.requests.get", side_effect=[
            FakeSupabaseResponse(payload={"users": first_page_users}),
            FakeSupabaseResponse(payload={"users": [confirmed]}),
        ]):
            response = self.client.post("/api/auth/signup", json=signup_payload(email="target@example.com"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["state"], "existing_confirmed")

    def test_password_mismatch_returns_field_error(self):
        response = self.client.post(
            "/api/auth/signup",
            json=signup_payload(password="Strongpass1", confirm_password="Strongpass2"),
        )

        self.assertEqual(response.status_code, 422)
        data = response.json()
        self.assertEqual(data["state"], "validation_error")
        self.assertIn("confirmPassword", data["errors"])

    def test_short_email_name_is_allowed_inside_otherwise_strong_password(self):
        with (
            patch("backend.app.requests.get", return_value=FakeSupabaseResponse(payload={"users": []})),
            patch("backend.app.requests.post", return_value=FakeSupabaseResponse(payload={"user": {"id": "user-1", "email": "me@example.com"}})),
        ):
            response = self.client.post(
                "/api/auth/signup",
                json=signup_payload(email="me@example.com", password="meStrong1", confirm_password="meStrong1"),
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["state"], "created_confirmation_sent")

    def test_terms_unchecked_blocks_signup(self):
        payload = signup_payload()
        payload["termsAccepted"] = False

        response = self.client.post("/api/auth/signup", json=payload)

        self.assertEqual(response.status_code, 422)
        self.assertIn("terms", response.json()["errors"])

    def test_supabase_signup_failure_returns_clean_message(self):
        with (
            patch("backend.app.requests.get", return_value=FakeSupabaseResponse(payload={"users": []})),
            patch("backend.app.requests.post", return_value=FakeSupabaseResponse(500, text="smtp server exploded with private detail")),
        ):
            response = self.client.post("/api/auth/signup", json=signup_payload())

        self.assertEqual(response.status_code, 502)
        data = response.json()
        self.assertFalse(data["ok"])
        self.assertEqual(data["state"], "signup_failed")
        self.assertNotIn("private detail", data["message"])

    def test_signup_rejects_untrusted_confirmation_redirect_host(self):
        payload = signup_payload()
        payload["redirectTo"] = "https://evil.example/frontend/verify.html"

        def fake_post(url, **kwargs):
            self.assertEqual(kwargs["params"]["redirect_to"], "http://127.0.0.1:5175/frontend/verify.html")
            return FakeSupabaseResponse(payload={"user": {"id": "user-1", "email": "new.user@example.com"}})

        with (
            patch("backend.app.requests.get", return_value=FakeSupabaseResponse(payload={"users": []})),
            patch("backend.app.requests.post", side_effect=fake_post),
        ):
            response = self.client.post("/api/auth/signup", json=payload)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["state"], "created_confirmation_sent")

    def test_resend_confirmation_for_pending_account(self):
        existing = {
            "id": "user-1",
            "email": "pending@example.com",
            "confirmation_sent_at": "2026-07-01T00:00:00Z",
        }

        def fake_post(url, **kwargs):
            self.assertTrue(url.endswith("/auth/v1/resend"))
            self.assertEqual(kwargs["json"], {"type": "signup", "email": "pending@example.com"})
            return FakeSupabaseResponse(payload={})

        with (
            patch("backend.app.requests.get", return_value=FakeSupabaseResponse(payload={"users": [existing]})),
            patch("backend.app.requests.post", side_effect=fake_post),
        ):
            response = self.client.post(
                "/api/auth/resend-confirmation",
                json={"email": "pending@example.com", "redirectTo": "http://localhost:5176/frontend/verify.html"},
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["ok"])
        self.assertEqual(data["state"], "confirmation_resent")


if __name__ == "__main__":
    unittest.main()
