#!/usr/bin/env python3
import ast
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUDGET = json.loads((ROOT / "data/architecture_budget.json").read_text(encoding="utf-8"))

violations = []

for relative in BUDGET.get("forbidden_artifacts_until_budget_change", []):
    if (ROOT / relative).exists():
        violations.append(
            f"Forbidden architecture artifact in phase {BUDGET['phase']}: {relative}. "
            "Update the architecture budget with evidence before adding it."
        )

blocked_imports = set(BUDGET.get("forbidden_code_imports_until_budget_change", []))
scan_roots = [ROOT / "scripts", ROOT / "app"]
for scan_root in scan_roots:
    if not scan_root.exists():
        continue
    for path in scan_root.rglob("*.py"):
        try:
            tree = ast.parse(path.read_text(encoding="utf-8"))
        except SyntaxError as exc:
            violations.append(f"Python parse failure in {path.relative_to(ROOT)}: {exc}")
            continue
        for node in ast.walk(tree):
            names = []
            if isinstance(node, ast.Import):
                names = [alias.name.split(".")[0] for alias in node.names]
            elif isinstance(node, ast.ImportFrom) and node.module:
                names = [node.module.split(".")[0]]
            for name in names:
                if name in blocked_imports:
                    violations.append(
                        f"Blocked import '{name}' in {path.relative_to(ROOT)} during phase {BUDGET['phase']}."
                    )

if BUDGET.get("new_paid_dependencies_without_external_evidence") != 0:
    violations.append("v0.1 budget must keep unearned paid dependencies at zero.")

if violations:
    print("ARCHITECTURE FITNESS: FAIL")
    for violation in violations:
        print(f"- {violation}")
    raise SystemExit(1)

print(
    "ARCHITECTURE FITNESS: PASS — "
    f"phase={BUDGET['phase']} "
    f"infrastructure={','.join(BUDGET['current_infrastructure_dependencies'])}"
)
