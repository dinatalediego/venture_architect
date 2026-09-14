import json
import os
import unittest
import urllib.error
import urllib.request

PROD = os.getenv("VENTURE_PROD_URL", "https://venture-architect-seven.vercel.app")
SUPABASE = "https://tlyczyfsboqrtrdpwizp.supabase.co/functions/v1"


def request(url, method="GET", payload=None, headers=None):
    body = None
    h = dict(headers or {})
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    with urllib.request.urlopen(req, timeout=15) as res:
        return res.status, res.headers, res.read().decode("utf-8")


class ProductionSmokeTests(unittest.TestCase):
    def test_landing_is_reachable(self):
        status, headers, body = request(PROD + "/")
        self.assertEqual(status, 200)
        self.assertIn("Revenue Intelligence OS", body)
        self.assertIn("lead-form", body)
        self.assertIn("text/html", headers.get("content-type", ""))

    def test_demo_is_reachable(self):
        status, _, body = request(PROD + "/demo.html")
        self.assertEqual(status, 200)
        self.assertIn("CONTROL ROOM", body)
        self.assertIn("SYNTHETIC DEMO", body)

    def test_static_client_config_is_reachable(self):
        status, _, body = request(PROD + "/config.js")
        self.assertEqual(status, 200)
        self.assertIn("venture-lead-capture", body)
        self.assertIn("venture-event-capture", body)

    def test_public_metrics_are_aggregate_only(self):
        status, _, body = request(SUPABASE + "/venture-public-metrics")
        self.assertEqual(status, 200)
        data = json.loads(body)
        self.assertIn("funnel", data)
        self.assertIn("pipeline", data)
        serialized = json.dumps(data).lower()
        for pii_key in ["email", "phone", "full_name"]:
            self.assertNotIn(pii_key, serialized)

    def test_lead_endpoint_cors_preflight(self):
        status, headers, _ = request(
            SUPABASE + "/venture-lead-capture",
            method="OPTIONS",
            headers={"Origin": PROD},
        )
        self.assertEqual(status, 200)
        self.assertIn("*", headers.get("access-control-allow-origin", ""))

    def test_honeypot_does_not_require_real_lead(self):
        # Safe endpoint-path test: the honeypot exits before any DB write.
        status, _, body = request(
            SUPABASE + "/venture-lead-capture",
            method="POST",
            payload={"website": "automated-smoke-test.invalid"},
        )
        self.assertEqual(status, 200)
        data = json.loads(body)
        self.assertTrue(data.get("accepted"))


if __name__ == "__main__":
    unittest.main()
