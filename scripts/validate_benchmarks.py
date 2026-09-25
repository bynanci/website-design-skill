#!/usr/bin/env python3

from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BENCH = ROOT / "benchmarks"
MANIFEST_PATH = BENCH / "manifest.json"
RESULTS_DIR = BENCH / "results"

EXPECTED_CASE_IDS = {
    "ia-audit-001",
    "component-reuse-001",
    "end-to-end-b2b-001",
}


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    sys.exit(1)


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"Missing JSON file: {path.relative_to(ROOT)}")
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {path.relative_to(ROOT)}: {exc}")


def validate_manifest():
    manifest = load_json(MANIFEST_PATH)

    required = {
        "suite_name",
        "suite_version",
        "skill_path",
        "rubric_path",
        "cases",
        "total_max_score",
    }
    missing = required - manifest.keys()
    if missing:
        fail("Benchmark manifest missing keys: " + ", ".join(sorted(missing)))

    if manifest["total_max_score"] != 40:
        fail("Benchmark manifest total_max_score must be 40.")

    if not (ROOT / manifest["skill_path"]).exists():
        fail(f"Benchmark skill_path does not exist: {manifest['skill_path']}")

    if not (ROOT / manifest["rubric_path"]).exists():
        fail(f"Benchmark rubric_path does not exist: {manifest['rubric_path']}")

    case_ids = set()
    max_total = 0

    for case in manifest["cases"]:
        for key in (
            "id",
            "type",
            "input_paths",
            "evaluator_reference_paths",
            "rubric_criteria",
            "max_score",
        ):
            if key not in case:
                fail(f"Benchmark case missing {key}: {case}")

        case_id = case["id"]
        if case_id in case_ids:
            fail(f"Duplicate benchmark case id: {case_id}")
        case_ids.add(case_id)

        expected_max = len(case["rubric_criteria"]) * 2
        if case["max_score"] != expected_max:
            fail(
                f"{case_id} max_score={case['max_score']} but "
                f"{len(case['rubric_criteria'])} criteria imply {expected_max}."
            )

        max_total += case["max_score"]

        for rel in case["input_paths"] + case["evaluator_reference_paths"]:
            if not (ROOT / rel).exists():
                fail(f"{case_id} references missing path: {rel}")

    if case_ids != EXPECTED_CASE_IDS:
        fail(
            "Canonical case ids changed unexpectedly. Found: "
            + ", ".join(sorted(case_ids))
        )

    if max_total != manifest["total_max_score"]:
        fail(
            f"Case max-score sum {max_total} does not match "
            f"manifest total {manifest['total_max_score']}."
        )

    return manifest


def validate_result(run_dir: Path, result: dict, manifest: dict) -> None:
    rel_dir = run_dir.relative_to(ROOT)

    required = {
        "schema_version",
        "run_id",
        "status",
        "repository_commit",
        "suite_version",
        "agent",
        "environment",
        "manual_edit",
        "cases",
        "aggregate",
    }
    missing = required - result.keys()
    if missing:
        fail(f"{rel_dir}/result.json missing keys: {', '.join(sorted(missing))}")

    if result["schema_version"] != "1.0":
        fail(f"{rel_dir}: unsupported schema_version.")

    if result["run_id"] != run_dir.name:
        fail(f"{rel_dir}: run_id must equal directory name.")

    if result["status"] not in {"official", "exploratory"}:
        fail(f"{rel_dir}: status must be official or exploratory.")

    if not re.fullmatch(r"[0-9a-f]{40}", result["repository_commit"]):
        fail(f"{rel_dir}: repository_commit must be a 40-character SHA.")

    if result["suite_version"] != manifest["suite_version"]:
        fail(
            f"{rel_dir}: suite_version {result['suite_version']} does not match "
            f"manifest {manifest['suite_version']}."
        )

    if result["status"] == "official" and result["manual_edit"] is not False:
        fail(f"{rel_dir}: official runs require manual_edit=false.")

    canonical = {case["id"]: case for case in manifest["cases"]}
    seen = set()
    aggregate_score = 0

    for case_result in result["cases"]:
        for key in ("id", "raw_output_path", "scores", "notes"):
            if key not in case_result:
                fail(f"{rel_dir}: case result missing {key}.")

        case_id = case_result["id"]
        if case_id not in canonical:
            fail(f"{rel_dir}: unknown case id {case_id}.")
        if case_id in seen:
            fail(f"{rel_dir}: duplicate case result {case_id}.")
        seen.add(case_id)

        raw_path = ROOT / case_result["raw_output_path"]
        if not raw_path.exists():
            fail(f"{rel_dir}: missing raw output {case_result['raw_output_path']}.")

        expected_criteria = set(canonical[case_id]["rubric_criteria"])
        actual_criteria = set(case_result["scores"].keys())
        if actual_criteria != expected_criteria:
            fail(
                f"{rel_dir}: {case_id} score keys must exactly match "
                f"{sorted(expected_criteria)}."
            )

        for criterion, score in case_result["scores"].items():
            if type(score) is not int or score < 0 or score > 2:
                fail(f"{rel_dir}: {case_id}/{criterion} score must be 0, 1, or 2.")

        aggregate_score += sum(case_result["scores"].values())

    if seen != set(canonical):
        fail(f"{rel_dir}: result does not contain all canonical cases.")

    aggregate = result["aggregate"]
    if aggregate.get("max_score") != manifest["total_max_score"]:
        fail(f"{rel_dir}: aggregate max_score mismatch.")

    if aggregate.get("score") != aggregate_score:
        fail(
            f"{rel_dir}: aggregate score {aggregate.get('score')} "
            f"does not equal criterion sum {aggregate_score}."
        )

    if not isinstance(aggregate.get("interpretation"), str) or not aggregate["interpretation"].strip():
        fail(f"{rel_dir}: aggregate interpretation is required.")


def validate_results(manifest: dict) -> None:
    if not RESULTS_DIR.exists():
        fail("benchmarks/results directory is missing.")

    run_dirs = sorted(
        path for path in RESULTS_DIR.iterdir()
        if path.is_dir() and not path.name.startswith(".")
    )

    for run_dir in run_dirs:
        result_path = run_dir / "result.json"
        if not result_path.exists():
            fail(f"{run_dir.relative_to(ROOT)} is missing result.json.")
        validate_result(run_dir, load_json(result_path), manifest)


def main() -> None:
    manifest = validate_manifest()
    validate_results(manifest)
    print("Benchmark validation passed.")


if __name__ == "__main__":
    main()
