"""Regression tests for the frozen v0.1 benchmark evidence contract."""

from contextlib import redirect_stdout
import io
from pathlib import Path
import tempfile
import unittest
from unittest import mock

from scripts import validate_benchmarks as validator


PINNED_SHA = "7d64090710ef20f1d24cea6b46199391d3c09c18"


class BenchmarkEvidenceIntegrityTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.run_dir = self.root / "benchmarks" / "results" / "clean-test"
        self.run_dir.mkdir(parents=True)

        root_patch = mock.patch.object(validator, "ROOT", self.root)
        root_patch.start()
        self.addCleanup(root_patch.stop)

        self.raw_rel = "benchmarks/results/clean-test/ia-audit.md"
        self.raw = self.root / self.raw_rel
        self.raw.write_text("# Agent response\nA usable answer.\n", encoding="utf-8")

        self.manifest = {
            "suite_version": "0.1.0",
            "cases": [{"id": "ia-audit-001", "rubric_criteria": ["A1"]}],
            "total_max_score": 2,
        }
        self.policy = {"required_repository_commit": PINNED_SHA}

    def result(self):
        return {
            "schema_version": "1.0",
            "run_id": "clean-test",
            "status": "official",
            "repository_commit": PINNED_SHA,
            "suite_version": "0.1.0",
            "agent": {
                "provider": "Example",
                "product": "Test Runner",
                "model": "model-1",
            },
            "environment": {
                "run_date": "2026-11-16",
                "interface": "isolated test environment",
                "capabilities": {"code_execution": True},
            },
            "manual_edit": False,
            "cases": [
                {
                    "id": "ia-audit-001",
                    "raw_output_path": self.raw_rel,
                    "scores": {"A1": 2},
                    "notes": "",
                }
            ],
            "aggregate": {
                "score": 2,
                "max_score": 2,
                "interpretation": "Fixture for validator unit tests only.",
            },
        }

    def assert_rejected(self, action):
        with redirect_stdout(io.StringIO()):
            with self.assertRaises(SystemExit) as failure:
                action()
        self.assertEqual(failure.exception.code, 1)

    def validate(self, result):
        validator.validate_result(self.run_dir, result, self.manifest, self.policy)

    def test_valid_pinned_official_result_is_accepted(self):
        self.validate(self.result())

    def test_exploratory_result_may_use_other_commit(self):
        result = self.result()
        result["status"] = "exploratory"
        result["repository_commit"] = "0" * 40
        self.validate(result)

    def test_official_result_requires_pinned_commit(self):
        result = self.result()
        result["repository_commit"] = "0" * 40
        self.assert_rejected(lambda: self.validate(result))

    def test_official_result_requires_agent_identity(self):
        result = self.result()
        result["agent"]["model"] = ""
        self.assert_rejected(lambda: self.validate(result))

    def test_official_result_requires_capability_profile(self):
        result = self.result()
        result["environment"]["capabilities"] = {}
        self.assert_rejected(lambda: self.validate(result))

    def test_official_result_requires_valid_date(self):
        result = self.result()
        result["environment"]["run_date"] = "2026-02-30"
        self.assert_rejected(lambda: self.validate(result))

    def test_rejects_parent_traversal(self):
        self.assert_rejected(
            lambda: validator.validate_raw_output_path(
                self.run_dir, "benchmarks/results/clean-test/../../outside.md"
            )
        )

    def test_rejects_absolute_path(self):
        self.assert_rejected(
            lambda: validator.validate_raw_output_path(self.run_dir, str(self.raw))
        )

    def test_rejects_cross_run_reference(self):
        other = self.root / "benchmarks/results/other"
        other.mkdir()
        (other / "ia-audit.md").write_text("Other runner content", encoding="utf-8")
        self.assert_rejected(
            lambda: validator.validate_raw_output_path(
                self.run_dir, "benchmarks/results/other/ia-audit.md"
            )
        )

    def test_rejects_empty_raw_evidence(self):
        self.raw.write_text(" \n\t ", encoding="utf-8")
        self.assert_rejected(lambda: validator.validate_raw_output_path(self.run_dir, self.raw_rel))

    def test_rejects_symlink_to_external_file(self):
        external = self.root / "outside.md"
        external.write_text("External evidence", encoding="utf-8")
        (self.run_dir / "linked.md").symlink_to(external)
        self.assert_rejected(
            lambda: validator.validate_raw_output_path(
                self.run_dir, "benchmarks/results/clean-test/linked.md"
            )
        )

    def test_rejects_one_raw_file_for_multiple_cases(self):
        result = self.result()
        self.manifest["cases"].append(
            {"id": "component-reuse-001", "rubric_criteria": ["B1"]}
        )
        self.manifest["total_max_score"] = 4
        result["cases"].append(
            {
                "id": "component-reuse-001",
                "raw_output_path": self.raw_rel,
                "scores": {"B1": 2},
                "notes": "",
            }
        )
        result["aggregate"]["max_score"] = 4
        result["aggregate"]["score"] = 4
        self.assert_rejected(lambda: self.validate(result))


if __name__ == "__main__":
    unittest.main()
