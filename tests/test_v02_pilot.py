"""Isolated pilot integrity tests; these fixtures are not agent evidence."""
import copy
import hashlib
import json
import os
import shutil
from pathlib import Path
import tempfile
import unittest
from unittest import mock
from zipfile import ZipFile

from scripts import build_v02_pilot_packets as packet
from scripts import validate_v02_pilot as pilot

REPOSITORY = Path(__file__).resolve().parents[1]


class PilotTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        base = self.root / pilot.PILOT
        (base / "results").mkdir(parents=True)
        (base / "manifest.json").write_text((REPOSITORY / pilot.PILOT / "manifest.json").read_text())
        self.manifest = pilot.validate_manifest(self.root)
        self.run = base / "results" / "test-run"
        self.run.mkdir()
        (self.run / "raw").mkdir()
        isolation = b"Unit-test isolation record, not an agent execution.\n"
        (self.run / "isolation.md").write_bytes(isolation)
        self.result = {
            "schema_version": pilot.VERSION, "suite_version": pilot.VERSION,
            "source_commit": pilot.PIN, "run_id": "test-run", "status": "completed",
            "agent": {"provider": "unit-test", "product": "synthetic fixture", "model": "fixture only"},
            "environment": {"run_date": "2026-11-17", "interface": "unit-test fixture", "capabilities": {key: "unavailable" for key in pilot.CAPABILITIES}},
            "manual_edit": False,
            "isolation": {"independent_context": True, "evaluator_files_exposed": False, "prior_outputs_exposed": False, "record_path": "isolation.md", "record_sha256": hashlib.sha256(isolation).hexdigest()},
            "availability": {"status": "available", "reason": None, "details": "Unit-test fixture; no real generation."},
            "generation_finished_at": "2026-11-17T00:00:00Z", "reviewer": {"id": "unit-test", "scored_at": "2026-11-17T00:01:00Z"},
            "cases": [], "aggregate": {"score": 36, "max_score": 36, "interpretation": "Synthetic fixture only; no compatibility claim."},
        }
        for canonical in self.manifest["cases"]:
            raw = f"Unit fixture for {canonical['id']}: traceable plan.\n".encode()
            relative = f"raw/{canonical['id']}.md"
            (self.run / relative).write_bytes(raw)
            self.result["cases"].append({"id": canonical["id"], "raw_output_path": relative, "raw_sha256": hashlib.sha256(raw).hexdigest(), "scores": [{"criterion": criterion["id"], "score": 2, "evidence_quote": "traceable plan", "note": "Unit-test rubric fixture only."} for criterion in canonical["criteria"]], "critical_errors": []})

    def check(self):
        pilot.validate_result(self.run, self.result, self.manifest)

    def test_completed_shape_and_zero_results_are_not_official_evidence(self):
        self.check()
        self.run.rename(self.root / "not-a-result-run")
        summary = pilot.validate(self.root)
        self.assertEqual(summary["completed"], 0)
        self.assertFalse(summary["official_v01_evidence"])

    def test_result_schema_agrees_with_completed_and_unavailable_shapes(self):
        try:
            import jsonschema
        except ImportError:
            self.skipTest("Optional schema cross-check; production validation has no dependency")
        schema = json.loads((REPOSITORY / pilot.PILOT / "result.schema.json").read_text())
        jsonschema.Draft202012Validator.check_schema(schema)
        jsonschema.validate(self.result, schema)
        unavailable = self.unavailable()
        jsonschema.validate(unavailable, schema)
        pilot.validate_result(self.run, unavailable, self.manifest)

    def unavailable(self):
        result = copy.deepcopy(self.result)
        result.update(status="unavailable", generation_finished_at=None, reviewer=None, cases=[], aggregate=None)
        result["agent"]["model"] = None
        result["availability"] = {"status": "unavailable", "reason": "subscription_blocked", "details": "Synthetic blocked-run fixture."}
        result["isolation"].update(independent_context=None, evaluator_files_exposed=None, prior_outputs_exposed=None)
        return result

    def test_unavailable_runner_has_no_compatibility_score(self):
        self.result = self.unavailable()
        self.check()
        self.result["aggregate"] = {"score": 0, "max_score": 36, "interpretation": "should fail"}
        with self.assertRaisesRegex(ValueError, "must not receive scores"):
            self.check()

    def test_pin_version_and_manual_edits_are_rejected(self):
        for key, value in [("source_commit", "f" * 40), ("suite_version", "0.1.0"), ("manual_edit", True)]:
            with self.subTest(key=key):
                original = self.result[key]
                self.result[key] = value
                with self.assertRaises(ValueError): self.check()
                self.result[key] = original

    def test_contaminated_or_unproven_execution_identity_is_rejected(self):
        self.result["isolation"]["evaluator_files_exposed"] = True
        with self.assertRaisesRegex(ValueError, "independent"):
            self.check()
        self.result["isolation"]["evaluator_files_exposed"] = False
        self.result["agent"]["model"] = "unknown"
        with self.assertRaisesRegex(ValueError, "observed"):
            self.check()

    def test_scoring_must_follow_generation_and_quotes_must_match_raw(self):
        self.result["reviewer"]["scored_at"] = "2026-11-16T23:59:00Z"
        with self.assertRaisesRegex(ValueError, "follow generation"): self.check()
        self.result["reviewer"]["scored_at"] = "2026-11-17T00:01:00Z"
        self.result["cases"][0]["scores"][0]["evidence_quote"] = "invented evidence"
        with self.assertRaisesRegex(ValueError, "quote"): self.check()

    def test_exact_criterion_ids_integer_scores_and_aggregate_are_required(self):
        self.result["cases"][0]["scores"][0]["score"] = True
        with self.assertRaisesRegex(ValueError, "integer"): self.check()
        self.result["cases"][0]["scores"][0]["score"] = 2
        self.result["aggregate"]["score"] = 35
        with self.assertRaisesRegex(ValueError, "Aggregate"): self.check()
        self.result["aggregate"]["score"] = 36
        self.result["cases"][0]["scores"][0]["criterion"] = "v01-criterion"
        with self.assertRaisesRegex(ValueError, "criterion-level"): self.check()

    def test_unknown_nested_properties_and_critical_codes_are_rejected(self):
        self.result["agent"]["unreviewed"] = True
        with self.assertRaisesRegex(ValueError, "exactly match"): self.check()
        del self.result["agent"]["unreviewed"]
        self.result["cases"][0]["critical_errors"] = [{"code": "made-up-error", "evidence_quote": "", "note": "Synthetic fixture."}]
        with self.assertRaisesRegex(ValueError, "Unknown critical"): self.check()

    def test_absolute_traversing_and_cross_run_paths_are_rejected(self):
        for raw in ["/tmp/output.md", "../other/raw.md", "raw/../../other.md", "../test-run/raw/responsive-layout-001.md", "raw\\responsive-layout-001.md"]:
            with self.subTest(raw=raw):
                self.result["cases"][0]["raw_output_path"] = raw
                with self.assertRaises(ValueError): self.check()

    def test_empty_missing_symlinked_or_modified_evidence_is_rejected(self):
        filename = self.run / self.result["cases"][0]["raw_output_path"]
        original = filename.read_bytes()
        filename.write_bytes(b" \n")
        with self.assertRaisesRegex(ValueError, "empty"): self.check()
        filename.unlink()
        with self.assertRaisesRegex(ValueError, "missing"): self.check()
        outside = self.root / "outside.md"
        outside.write_bytes(original)
        filename.symlink_to(outside)
        with self.assertRaisesRegex(ValueError, "symlink"): self.check()
        filename.unlink()
        filename.write_bytes(original + b"changed")
        with self.assertRaisesRegex(ValueError, "changed"): self.check()

    def test_parent_symlinks_and_cross_case_raw_reuse_are_rejected(self):
        raw = self.run / "raw"
        moved = self.root / "moved"
        raw.rename(moved)
        raw.symlink_to(moved, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "symlink"): self.check()
        raw.unlink()
        moved.rename(raw)
        first = self.result["cases"][0]
        second = self.result["cases"][1]
        (self.run / second["raw_output_path"]).write_bytes((self.run / first["raw_output_path"]).read_bytes())
        second["raw_sha256"] = first["raw_sha256"]
        with self.assertRaisesRegex(ValueError, "reused"): self.check()

    def test_result_json_symlink_cannot_read_an_external_record(self):
        outside = self.root / "outside.json"
        outside.write_text(json.dumps(self.result))
        (self.run / "result.json").symlink_to(outside)
        with self.assertRaisesRegex(ValueError, "symlink"):
            pilot.validate(self.root)

    def test_non_directory_symlink_in_results_is_not_silently_ignored(self):
        outside = self.root / "outside.md"
        outside.write_text("untrusted")
        (self.run.parent / "linked-record").symlink_to(outside)
        (self.run / "result.json").write_text(json.dumps(self.result))
        with self.assertRaisesRegex(ValueError, "symlink"):
            pilot.validate(self.root)

    def test_packet_zip_is_deterministic_and_never_contains_evaluators(self):
        with mock.patch.object(packet, "read_pinned", side_effect=lambda root, relative: (relative + "\n").encode()):
            first = packet.build_packets(self.root / "first", self.root)
            second = packet.build_packets(self.root / "second", self.root)
        self.assertEqual(first, second)
        self.assertEqual(len(first["packets"]), 2)
        for row in first["packets"]:
            a = self.root / "first" / row["filename"]
            b = self.root / "second" / row["filename"]
            self.assertEqual(a.read_bytes(), b.read_bytes())
            self.assertEqual(hashlib.sha256(a.read_bytes()).hexdigest(), row["sha256"])
            with ZipFile(a) as archive:
                names = archive.namelist()
                self.assertFalse(any(any(word in name.lower() for word in ("expected", "rubric", "evaluator", "results/")) for name in names))
                self.assertEqual(len([name for name in names if name.startswith("evals/")]), 1)
                meta = json.loads(archive.read("packet.json"))
                self.assertEqual(meta["source_commit"], pilot.PIN)
                self.assertNotIn("criteria", meta)

    def test_manifest_cannot_add_evaluator_guidance_or_advance_pin(self):
        path = self.root / pilot.PILOT / "manifest.json"
        for change in [lambda value: value["guidance_paths"].append("evals/accessibility/case-001/expected.md"), lambda value: value.update(source_commit="a" * 40)]:
            value = copy.deepcopy(self.manifest)
            change(value)
            path.write_text(json.dumps(value))
            with self.assertRaises(ValueError): pilot.validate_manifest(self.root)

    def test_malformed_nested_arrays_fail_as_validation_errors(self):
        self.result["cases"] = [None]
        with self.assertRaisesRegex(ValueError, "both pilot cases"):
            self.check()

    def test_recorded_byte_limits_are_enforced_before_read(self):
        filename = self.run / self.result["cases"][0]["raw_output_path"]
        filename.write_bytes(b"x" * (pilot.MAX_RAW_BYTES + 1))
        with self.assertRaisesRegex(ValueError, "size limit"):
            self.check()

    def test_unknown_identity_sentinels_are_rejected_after_whitespace_normalization(self):
        for key in ("provider", "product", "model"):
            original = self.result["agent"][key]
            for value in (" Unknown ", " UNSPECIFIED ", " unavailable\t"):
                with self.subTest(key=key, value=value):
                    self.result["agent"][key] = value
                    with self.assertRaisesRegex(ValueError, "observed"):
                        self.check()
            self.result["agent"][key] = original

    def second_run(self, hardlinks=False, unique=False):
        (self.run / "result.json").write_text(json.dumps(self.result))
        second = self.run.parent / "second-run"
        shutil.copytree(self.run, second, copy_function=os.link if hardlinks else shutil.copy2)
        result = copy.deepcopy(self.result)
        result["run_id"] = "second-run"
        result["agent"]["provider"] = "another-unit-provider"
        if unique:
            for case in result["cases"]:
                filename = second / case["raw_output_path"]
                filename.write_bytes(filename.read_bytes() + b"A distinct synthetic output.\n")
                case["raw_sha256"] = hashlib.sha256(filename.read_bytes()).hexdigest()
        if hardlinks:
            # Keep metadata files separate; the raw evidence remains linked.
            (second / "result.json").unlink()
        (second / "result.json").write_text(json.dumps(result))
        return second

    def test_copied_raw_evidence_cannot_be_counted_as_a_second_agent(self):
        self.second_run()
        with self.assertRaisesRegex(ValueError, "Duplicate raw evidence across runs"):
            pilot.validate(self.root)

    def test_hardlinked_raw_evidence_cannot_be_counted_as_a_second_agent(self):
        self.second_run(hardlinks=True)
        with self.assertRaisesRegex(ValueError, "Duplicate raw evidence across runs"):
            pilot.validate(self.root)

    def test_distinct_raw_evidence_can_be_consistently_recorded(self):
        self.second_run(unique=True)
        result = pilot.validate(self.root)
        self.assertEqual(result["completed"], 2)
        self.assertEqual(result["distinct_agent_signatures"], 2)
        self.assertFalse(result["official_v01_evidence"])

    def test_manifest_parent_symlink_is_refused_before_external_json_read(self):
        directory = self.root / pilot.PILOT
        outside = self.root / "outside-pilot"
        directory.rename(outside)
        directory.symlink_to(outside, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "symlink"):
            pilot.validate_manifest(self.root)

    @unittest.skipUnless(hasattr(os, "mkfifo"), "FIFO test requires POSIX")
    def test_json_special_files_are_refused_before_read(self):
        fifo = self.root / "record.json"
        os.mkfifo(fifo)
        with self.assertRaisesRegex(ValueError, "regular"):
            pilot.load_json(fifo)

    def test_duplicate_json_properties_are_rejected(self):
        path = self.root / "duplicates.json"
        path.write_text('{"status":"completed","status":"unavailable"}')
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            pilot.load_json(path)


if __name__ == "__main__":
    unittest.main()
