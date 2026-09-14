import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class KernelContractTests(unittest.TestCase):
    def load_json(self, relative):
        return json.loads((ROOT / relative).read_text(encoding="utf-8"))

    def test_contracts_are_versioned_and_parseable(self):
        for name in [
            "contracts/lead.v1.schema.json",
            "contracts/event.v1.schema.json",
            "contracts/experiment.v1.schema.json",
        ]:
            data = self.load_json(name)
            self.assertIn("$id", data)
            self.assertIn("v1", data["$id"])
            self.assertEqual(data["type"], "object")

    def test_lead_contract_preserves_core_fields(self):
        lead = self.load_json("contracts/lead.v1.schema.json")
        self.assertEqual(set(lead["required"]), {"full_name", "company", "pain_point"})
        props = lead["properties"]
        for key in ["email", "phone", "source", "utm_source", "session_id", "offer"]:
            self.assertIn(key, props)
        self.assertIn("anyOf", lead)

    def test_event_names_match_public_client(self):
        event = self.load_json("contracts/event.v1.schema.json")
        allowed = set(event["properties"]["event_name"]["enum"])
        js = (ROOT / "app/assets/app.js").read_text(encoding="utf-8")
        emitted = set(re.findall(r'track\("([a-z_]+)"', js))
        self.assertTrue(emitted, "No public events found in app.js")
        self.assertTrue(emitted.issubset(allowed), f"Uncontracted events: {emitted - allowed}")

    def test_endpoints_are_explicit_and_expected(self):
        cfg = (ROOT / "app/config.js").read_text(encoding="utf-8")
        for slug in [
            "venture-lead-capture",
            "venture-event-capture",
            "venture-public-metrics",
        ]:
            self.assertIn(slug, cfg)

    def test_acquisition_path_exists(self):
        index = (ROOT / "app/index.html").read_text(encoding="utf-8")
        demo = (ROOT / "app/demo.html").read_text(encoding="utf-8")
        self.assertIn('id="diagnostic"', index)
        self.assertIn('id="lead-form"', index)
        self.assertIn('href="demo.html"', index)
        self.assertIn('href="index.html#diagnostic"', demo)

    def test_experiments_are_falsifiable(self):
        data = self.load_json("data/experiments.json")
        experiments = data["experiments"]
        self.assertGreaterEqual(len(experiments), 3)
        ids = [e["id"] for e in experiments]
        self.assertEqual(len(ids), len(set(ids)), "Experiment IDs must be unique")
        required = {
            "id", "name", "status", "hypothesis", "riskiest_assumption",
            "metric", "target", "kill_criterion", "next_action"
        }
        for experiment in experiments:
            self.assertTrue(required.issubset(experiment), experiment.get("id"))
            self.assertTrue(experiment["kill_criterion"].strip())
            self.assertTrue(experiment["next_action"].strip())

    def test_scoreboard_keeps_day8_contract(self):
        scoreboard = self.load_json("data/scoreboard.json")
        self.assertEqual(scoreboard["day8_gate_date"], "2026-09-21")
        targets = scoreboard["targets"]
        self.assertGreaterEqual(targets["positive_or_qualified_conversations"], 3)
        self.assertGreaterEqual(targets["meetings_booked"], 1)
        self.assertGreaterEqual(targets["paid_pilots"], 1)

    def test_commercial_operating_contracts(self):
        offer = self.load_json("data/offer.json")
        objectives = self.load_json("data/objectives.json")
        self.assertEqual(offer["duration_days"], 14)
        self.assertGreater(offer["price_pen"], 0)
        self.assertTrue(offer["scope"])
        self.assertTrue(offer["not_in_scope"])
        self.assertEqual(objectives["objectives"][0]["deadline"], "2026-09-21")

    def test_prospect_workbench_is_usable(self):
        import csv
        with open(ROOT / "data/prospects.csv", encoding="utf-8") as handle:
            rows = list(csv.DictReader(handle))
        self.assertGreaterEqual(len(rows), 20)
        companies = [row["company"].strip() for row in rows]
        self.assertEqual(len(companies), len(set(companies)), "Prospect companies must be unique")
        for row in rows:
            self.assertTrue(row["company"].strip())
            self.assertIn(row["tier"], {"A", "B"})
            self.assertTrue(row["source_url"].startswith("http"))
            self.assertTrue(row["next_action"].strip())

    def test_decision_maker_enrichment_is_traceable(self):
        import csv
        path = ROOT / "data/decision_makers.csv"
        self.assertTrue(path.exists())
        with open(path, encoding="utf-8") as handle:
            rows = list(csv.DictReader(handle))
        self.assertGreaterEqual(len(rows), 5)
        companies = [row["company"].strip() for row in rows]
        self.assertEqual(len(companies), len(set(companies)))
        for row in rows:
            self.assertTrue(row["contact_name"].strip())
            self.assertTrue(row["role"].strip())
            self.assertTrue(row["evidence_url"].startswith("http"))
            self.assertEqual(row["verified_at"], "2026-09-14")
            self.assertTrue(row["outreach_hypothesis"].strip())

    def test_kernel_docs_exist(self):
        for name in ["KERNEL.md", "REGRESSIONS.md", "MAINTAINERS.md", "CONSTITUTION.md"]:
            self.assertTrue((ROOT / name).exists(), name)


if __name__ == "__main__":
    unittest.main()
