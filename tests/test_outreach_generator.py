import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class OutreachGeneratorTests(unittest.TestCase):
    def run_generator(self, *extra):
        tmp = tempfile.TemporaryDirectory()
        output = Path(tmp.name) / "drafts.md"
        proc = subprocess.run(
            [sys.executable, str(ROOT / "scripts/generate_outreach.py"), "--output", str(output), *extra],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=True,
        )
        return tmp, proc, output.read_text(encoding="utf-8")

    def test_default_workbench_enforces_no_contact_policy(self):
        tmp, proc, text = self.run_generator()
        try:
            self.assertIn("(2 drafts", proc.stdout)
            self.assertEqual(text.count("\n## "), 2)
            self.assertIn("Selene Reque Ordoñez", text)
            self.assertIn("Jackeline Palomino", text)

            for blocked in [
                "Pamela Gálvez",
                "Luis Rafael Guillen Huamancaja",
                "Ditrenzzo",
                "Ciudaris",
            ]:
                self.assertNotIn(f"## {blocked}", text)
                if blocked in {"Pamela Gálvez", "Luis Rafael Guillen Huamancaja"}:
                    self.assertNotIn(blocked, text)
        finally:
            tmp.cleanup()

    def test_include_unenriched_never_bypasses_explicit_exclusions(self):
        tmp, proc, text = self.run_generator("--include-unenriched", "--limit", "20")
        try:
            self.assertNotIn("Pamela Gálvez", text)
            self.assertNotIn("Luis Rafael Guillen Huamancaja", text)
            self.assertNotIn("## Ditrenzzo", text)
            for blocked_geo_company in [
                "Ciudaris",
                "Desarrolladora",
            ]:
                self.assertNotIn(f"## {blocked_geo_company}", text)
            self.assertGreater(text.count("\n## "), 0)
        finally:
            tmp.cleanup()

    def test_policy_reports_exclusions_without_exposing_blocked_drafts(self):
        tmp, proc, text = self.run_generator("--include-unenriched", "--limit", "20")
        try:
            self.assertIn("excluded", proc.stdout)
            self.assertIn("Policy exclusions encountered", text)
            self.assertIn("Commercial exclusions are applied before", text)
        finally:
            tmp.cleanup()


if __name__ == "__main__":
    unittest.main()
