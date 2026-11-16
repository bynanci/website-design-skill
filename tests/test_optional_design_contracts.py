"""Contract checks for opt-in v0.2 design artifacts and frozen v0.1 boundary."""

import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]

TEMPLATES = {
    "templates/visual-direction-comparison.md": (
        "## Locked baseline",
        "## Shared constraints",
        "## Comparison",
        "## Gate before token or component implementation",
    ),
    "templates/responsive-behavior.md": (
        "## Content priority and equivalence",
        "## Layout-condition matrix",
        "## Per-component behavior",
        "## Validation evidence",
    ),
    "templates/design-token-extraction.md": (
        "## Sources and constraints",
        "## Inventory and semantic mapping",
        "## Migration plan",
        "## Validation matrix",
    ),
}

PILOTS = ("responsive-layout", "accessibility")


class OptionalDesignContractTests(unittest.TestCase):
    def test_templates_define_inspectable_artifacts(self):
        for rel_path, headings in TEMPLATES.items():
            with self.subTest(template=rel_path):
                content = (ROOT / rel_path).read_text(encoding="utf-8")
                for heading in headings:
                    self.assertIn(heading, content)

    def test_pilots_are_complete_behavioral_pairs(self):
        for track in PILOTS:
            with self.subTest(track=track):
                base = ROOT / "evals" / track / "case-001"
                self.assertTrue((base / "input.md").is_file())
                self.assertTrue((base / "expected.md").is_file())
                self.assertIn("Failure", (base / "expected.md").read_text(encoding="utf-8"))

    def test_synthetic_example_has_all_proposed_artifacts(self):
        base = ROOT / "examples/responsive-dashboard"
        for path in (
            "README.md",
            "input/current-page.md",
            "output/responsive-behavior.md",
            "output/visual-direction-comparison.md",
            "output/design-token-extraction.md",
        ):
            with self.subTest(file=path):
                self.assertTrue((base / path).is_file())

    def test_preview_does_not_change_official_v01_benchmark(self):
        manifest = json.loads((ROOT / "benchmarks/manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["suite_version"], "0.1.0")
        self.assertEqual(manifest["total_max_score"], 40)
        self.assertEqual(
            [case["id"] for case in manifest["cases"]],
            ["ia-audit-001", "component-reuse-001", "end-to-end-b2b-001"],
        )
        core = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        for path in TEMPLATES:
            self.assertNotIn(path, core)

    def test_examples_do_not_claim_production_verification(self):
        base = ROOT / "examples/responsive-dashboard/output"
        responsive = (base / "responsive-behavior.md").read_text(encoding="utf-8")
        visual = (base / "visual-direction-comparison.md").read_text(encoding="utf-8")
        tokens = (base / "design-token-extraction.md").read_text(encoding="utf-8")
        self.assertIn("Not tested", responsive)
        self.assertIn("hypotheses", visual)
        self.assertIn("inventory pending", tokens)


if __name__ == "__main__":
    unittest.main()
