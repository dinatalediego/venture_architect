import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class OutreachGeneratorTests(unittest.TestCase):
    def test_default_workbench_is_small_and_enriched(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "drafts.md"
            proc = subprocess.run(
                [sys.executable, str(ROOT / "scripts/generate_outreach.py"), "--output", str(output)],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=True,
            )
            text = output.read_text(encoding="utf-8")
            self.assertIn("(5 drafts)", proc.stdout)
            self.assertEqual(text.count("\n## "), 5)
            for expected in ["Pamela Gálvez", "Selene Reque Ordoñez", "Luis Rafael Guillen Huamancaja", "Renato Vargas", "Jackeline Palomino"]:
                self.assertIn(expected, text)
            self.assertNotIn("decisor por identificar", text)
            self.assertIn("No message is sent", text)

    def test_unenriched_can_be_requested_explicitly(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "drafts.md"
            subprocess.run(
                [
                    sys.executable,
                    str(ROOT / "scripts/generate_outreach.py"),
                    "--output",
                    str(output),
                    "--include-unenriched",
                    "--limit",
                    "3",
                ],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=True,
            )
            text = output.read_text(encoding="utf-8")
            self.assertEqual(text.count("\n## "), 3)


if __name__ == "__main__":
    unittest.main()
