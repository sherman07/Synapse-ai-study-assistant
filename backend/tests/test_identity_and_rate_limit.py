import types
import unittest
from unittest.mock import patch

from starlette.datastructures import Headers
from fastapi.testclient import TestClient

from backend import app as appmod


def make_request(headers):
    return types.SimpleNamespace(headers=Headers(headers))


class DemoAuthGateTests(unittest.TestCase):
    def test_user_id_header_does_not_impersonate_when_demo_auth_disabled(self):
        with patch.object(appmod, "SYNAPSE_ALLOW_LOCAL_DEMO_AUTH", False):
            identity = appmod.database_identity_from_request(
                make_request({"x-synapse-user-id": "victim-account-123"})
            )
        self.assertEqual(identity["auth_provider"], "anonymous")
        self.assertNotEqual(identity["auth_subject"], "victim-account-123")

    def test_user_id_header_is_trusted_only_when_demo_auth_enabled(self):
        with patch.object(appmod, "SYNAPSE_ALLOW_LOCAL_DEMO_AUTH", True):
            identity = appmod.database_identity_from_request(
                make_request({"x-synapse-user-id": "dev-account-123"})
            )
        self.assertEqual(identity["auth_provider"], "local_demo")
        self.assertEqual(identity["auth_subject"], "dev-account-123")

    def test_client_id_maps_to_self_scoped_anonymous_bucket(self):
        identity = appmod.database_identity_from_request(
            make_request({"x-synapse-client-id": "browser-client-abc"})
        )
        self.assertEqual(identity["auth_provider"], "anonymous")
        self.assertEqual(identity["auth_subject"], "browser-client-abc")


class GenerationRateLimitTests(unittest.TestCase):
    def test_generation_endpoint_rate_limits_a_single_client(self):
        client = TestClient(appmod.app)
        with patch.object(appmod, "GENERATION_RATE_LIMIT", 3), \
                patch.object(appmod, "_RATE_EXEMPT_HOSTS", set()):
            appmod._rate_limit_hits.clear()
            statuses = []
            for _ in range(4):
                response = client.post(
                    "/analyze",
                    data={},
                    headers={"X-Forwarded-For": "198.51.100.7"},
                )
                statuses.append(response.status_code)
            appmod._rate_limit_hits.clear()
        # The empty payload is rejected with 400 until the limit is exceeded,
        # after which the limiter short-circuits with 429.
        self.assertNotIn(429, statuses[:3])
        self.assertEqual(statuses[-1], 429)

    def test_loopback_and_test_clients_are_exempt(self):
        client = TestClient(appmod.app)
        with patch.object(appmod, "GENERATION_RATE_LIMIT", 2):
            appmod._rate_limit_hits.clear()
            statuses = [client.post("/analyze", data={}).status_code for _ in range(4)]
            appmod._rate_limit_hits.clear()
        self.assertNotIn(429, statuses)


if __name__ == "__main__":
    unittest.main()
