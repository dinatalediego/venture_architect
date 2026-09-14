import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ArchitectureFitnessTests(unittest.TestCase):
    def test_budget_is_explicit(self):
        budget = json.loads((ROOT / "data/architecture_budget.json").read_text(encoding="utf-8"))
        self.assertEqual(budget["phase"], "v0.1_validation")
        self.assertEqual(budget["new_paid_dependencies_without_external_evidence"], 0)
        self.assertIn("GitHub", budget["current_infrastructure_dependencies"])
        self.assertIn("Vercel", budget["current_infrastructure_dependencies"])
        self.assertIn("Supabase", budget["current_infrastructure_dependencies"])
        self.assertIn("openai", budget["forbidden_code_imports_until_budget_change"])

    def test_fitness_gate_passes_current_repo(self):
        proc = subprocess.run(
            [sys.executable, str(ROOT / "scripts/architecture_fitness.py")],
            cwd=ROOT,
            text=True,
            capture_output=True,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertIn("ARCHITECTURE FITNESS: PASS", proc.stdout)

    def test_ai_policy_requires_baseline_and_evaluation(self):
        policy = (ROOT / "docs/ai-automation-policy.md").read_text(encoding="utf-8")
        for phrase in [
            "deterministic baseline",
            "evaluation dataset",
            "fallback behavior",
            "human-review requirement",
        ]:
            self.assertIn(phrase, policy)


if __name__ == "__main__":
    unittest.main()
