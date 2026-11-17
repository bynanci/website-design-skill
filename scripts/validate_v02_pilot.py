#!/usr/bin/env python3
"""Validate isolated v0.2 pilot records without changing v0.1 release evidence."""
from __future__ import annotations

import argparse
from datetime import date, datetime
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PILOT = Path("benchmarks/v02-pilot")
VERSION = "0.2-pilot.1"
PIN = "7f7148a0752718ba3fb363c019441a6d5ca91f15"
CASE_CRITERIA = {
    "responsive-layout-001": [f"RL-{n:02}" for n in range(1, 10)],
    "accessibility-001": [f"AX-{n:02}" for n in range(1, 10)],
}
GUIDANCE = [
    "SKILL.md", "references/workflow.md", "references/information-architecture.md",
    "references/component-architecture.md", "templates/project-context.md",
    "templates/page-spec.md", "templates/navigation-comparison.md",
    "templates/content-coverage.md", "templates/component-contract.md",
    "templates/responsive-behavior.md", "templates/visual-direction-comparison.md",
    "templates/design-token-extraction.md",
]
CAPABILITIES = {"file_read", "file_write", "code_execution", "browser", "image_review", "network"}
UNAVAILABLE_REASONS = {
    "subscription_blocked", "access_failure", "unsupported_environment",
    "model_identity_unavailable", "evaluator_context_contaminated",
}
MAX_RAW_BYTES = 5_000_000


def reject(message):
    raise ValueError(message)


def exact(value, keys, label):
    if not isinstance(value, dict) or set(value) != set(keys):
        reject(f"{label}: properties must exactly match {sorted(keys)}")


def string(value, label, nullable=False):
    if nullable and value is None:
        return
    if not isinstance(value, str) or not value.strip():
        reject(f"{label}: non-empty string required")


def load_json(path):
    def pairs(rows):
        value = {}
        for key, item in rows:
            if key in value:
                reject(f"Duplicate JSON property: {key}")
            value[key] = item
        return value
    if path.is_symlink() or path.resolve() != path.absolute():
        reject(f"JSON symlink path is unsupported: {path.name}")
    if not path.is_file():
        reject(f"JSON must be a regular file: {path.name}")
    if path.stat().st_size > MAX_RAW_BYTES:
        reject(f"JSON exceeds size limit: {path.name}")
    try:
        return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=pairs)
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        reject(f"Cannot read JSON {path.name}: {error}")


def sha(value, label):
    if not isinstance(value, str) or not re.fullmatch(r"[a-f0-9]{64}", value):
        reject(f"{label}: SHA-256 required")


def timestamp(value, label):
    string(value, label)
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        reject(f"{label}: ISO timestamp required")
    if parsed.tzinfo is None:
        reject(f"{label}: timezone required")
    return parsed


def safe_relative(value, label):
    if not isinstance(value, str) or "\\" in value or "\x00" in value:
        reject(f"{label}: POSIX relative path required")
    path = PurePosixPath(value)
    if path.is_absolute() or not path.parts or any(part in {".", ".."} for part in value.split("/")):
        reject(f"{label}: path must stay inside its root")
    return path


def read_evidence(run_dir, relative, label):
    if run_dir.is_symlink() or run_dir.resolve() != run_dir.absolute():
        reject(f"{label}: run directory cannot contain a symlink")
    path = safe_relative(relative, label)
    if path.suffix != ".md":
        reject(f"{label}: Markdown evidence required")
    candidate = run_dir.joinpath(*path.parts)
    # Reject every symlink in the chain, including in-root indirection.
    cursor = run_dir
    for part in path.parts:
        cursor = cursor / part
        if cursor.is_symlink():
            reject(f"{label}: symlink evidence is unsupported")
    if not candidate.is_file() or not candidate.resolve().is_relative_to(run_dir.resolve()):
        reject(f"{label}: missing evidence or path escapes this run")
    if candidate.stat().st_size > MAX_RAW_BYTES:
        reject(f"{label}: raw evidence exceeds the size limit")
    raw = candidate.read_bytes()
    try:
        text = raw.decode("utf-8")
    except UnicodeError:
        reject(f"{label}: UTF-8 evidence required")
    if not text.strip():
        reject(f"{label}: empty evidence")
    return raw, text


def validate_manifest(root=ROOT):
    manifest = load_json(root / PILOT / "manifest.json")
    exact(manifest, {"schema_version", "suite_version", "source_repository", "source_commit", "guidance_paths", "cases", "total_max_score", "release_gate"}, "manifest")
    if manifest["schema_version"] != VERSION or manifest["suite_version"] != VERSION or manifest["source_commit"] != PIN:
        reject("Pilot version or pinned source commit changed without a protocol revision")
    if manifest["source_repository"] != "bynanci/website-design-skill" or manifest["release_gate"] is not False or manifest["total_max_score"] != 36:
        reject("Pilot must remain separate from the official v0.1 release gate")
    guidance = manifest["guidance_paths"]
    if guidance != GUIDANCE:
        reject("guidance_paths must match the reviewed packet allowlist")
    for value in guidance:
        path = str(safe_relative(value, "guidance"))
        if path != "SKILL.md" and not path.startswith(("references/", "templates/")):
            reject("Only public skill-directed guidance may enter a pilot packet")
        if any(token in path.lower() for token in ("expected", "rubric", "result", "evaluator")):
            reject("Evaluator material cannot be runner guidance")
    cases = manifest["cases"]
    if not isinstance(cases, list) or not all(isinstance(case, dict) for case in cases) or [case.get("id") for case in cases] != list(CASE_CRITERIA):
        reject("Pilot cases/order changed")
    for case in cases:
        exact(case, {"id", "input_paths", "evaluator_reference_paths", "criteria", "critical_error_codes", "max_score"}, "case")
        folder = "responsive-layout" if case["id"] == "responsive-layout-001" else "accessibility"
        if case["input_paths"] != [f"evals/{folder}/case-001/input.md"] or case["evaluator_reference_paths"] != [f"evals/{folder}/case-001/expected.md"]:
            reject("Canonical pilot source paths changed")
        criteria = case["criteria"]
        if not isinstance(criteria, list) or not all(isinstance(criterion, dict) for criterion in criteria) or [criterion.get("id") for criterion in criteria] != CASE_CRITERIA[case["id"]]:
            reject("Criterion IDs/order changed")
        for criterion in criteria:
            exact(criterion, {"id", "description"}, "criterion")
            string(criterion["description"], "criterion description")
        if case["max_score"] != 18 or not isinstance(case["critical_error_codes"], list) or len(set(case["critical_error_codes"])) != len(case["critical_error_codes"]) or not case["critical_error_codes"]:
            reject("Invalid case score or critical-error codes")
        for code in case["critical_error_codes"]:
            if not isinstance(code, str) or not re.fullmatch(r"[a-z]+(?:-[a-z]+)+", code):
                reject("Invalid critical-error code")
    return manifest


def validate_result(run_dir, result, manifest):
    exact(result, {"schema_version", "suite_version", "run_id", "status", "source_commit", "agent", "environment", "manual_edit", "isolation", "availability", "generation_finished_at", "reviewer", "cases", "aggregate"}, "result")
    if result["schema_version"] != VERSION or result["suite_version"] != VERSION or result["source_commit"] != manifest["source_commit"]:
        reject("Result must use the pilot version and frozen source commit")
    if result["run_id"] != run_dir.name or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", result["run_id"]):
        reject("run_id must match its run directory")
    if result["status"] not in {"completed", "unavailable"} or result["manual_edit"] is not False:
        reject("Pilot records require completed/unavailable status and unmodified outputs")
    exact(result["agent"], {"provider", "product", "model"}, "agent")
    for key, value in result["agent"].items():
        string(value, f"agent.{key}", nullable=result["status"] == "unavailable")
    exact(result["environment"], {"run_date", "interface", "capabilities"}, "environment")
    try:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", result["environment"]["run_date"]):
            reject("run_date must be YYYY-MM-DD")
        date.fromisoformat(result["environment"]["run_date"])
    except (TypeError, ValueError):
        reject("Valid run_date required")
    string(result["environment"]["interface"], "environment.interface")
    capabilities = result["environment"]["capabilities"]
    exact(capabilities, CAPABILITIES, "capabilities")
    if any(value not in {"available", "unavailable", "unknown"} for value in capabilities.values()):
        reject("Invalid capability state")
    isolation = result["isolation"]
    exact(isolation, {"independent_context", "evaluator_files_exposed", "prior_outputs_exposed", "record_path", "record_sha256"}, "isolation")
    for key in ("independent_context", "evaluator_files_exposed", "prior_outputs_exposed"):
        if isolation[key] is not None and type(isolation[key]) is not bool:
            reject("Isolation states must be boolean or unknown/null")
    if isolation["record_path"] != "isolation.md":
        reject("Isolation evidence must use this run's isolation.md")
    record, _ = read_evidence(run_dir, isolation["record_path"], "isolation")
    sha(isolation["record_sha256"], "isolation digest")
    if hashlib.sha256(record).hexdigest() != isolation["record_sha256"]:
        reject("Isolation evidence digest mismatch")
    availability = result["availability"]
    exact(availability, {"status", "reason", "details"}, "availability")
    string(availability["details"], "availability details")
    if result["status"] == "unavailable":
        if availability["status"] != "unavailable" or availability["reason"] not in UNAVAILABLE_REASONS:
            reject("Unavailable records require an explicit access/capability reason")
        if result["generation_finished_at"] is not None or result["reviewer"] is not None or result["cases"] != [] or result["aggregate"] is not None:
            reject("Unavailable runners must not receive scores or generated-output claims")
        return
    if availability["status"] != "available" or availability["reason"] is not None:
        reject("Completed runs require available runner metadata")
    if isolation["independent_context"] is not True or isolation["evaluator_files_exposed"] is not False or isolation["prior_outputs_exposed"] is not False:
        reject("Completed pilot runs require independent, evaluator-isolated context")
    if any(value.strip().casefold() in {"unknown", "unspecified", "unavailable"} for value in result["agent"].values()):
        reject("Completed run requires observed provider/product/model identity")
    finished = timestamp(result["generation_finished_at"], "generation_finished_at")
    exact(result["reviewer"], {"id", "scored_at"}, "reviewer")
    string(result["reviewer"]["id"], "reviewer identity")
    if timestamp(result["reviewer"]["scored_at"], "scored_at") < finished:
        reject("Scoring must follow generation")
    if not isinstance(result["cases"], list) or not all(isinstance(case, dict) for case in result["cases"]) or [case.get("id") for case in result["cases"]] != list(CASE_CRITERIA):
        reject("Completed result must contain both pilot cases in manifest order")
    total = 0
    raw_hashes = set()
    canonical = {case["id"]: case for case in manifest["cases"]}
    for case in result["cases"]:
        exact(case, {"id", "raw_output_path", "raw_sha256", "scores", "critical_errors"}, "case result")
        if case["raw_output_path"] != f"raw/{case['id']}.md":
            reject("Each case must reference its own run-local raw output")
        raw, raw_text = read_evidence(run_dir, case["raw_output_path"], case["id"])
        digest = hashlib.sha256(raw).hexdigest()
        sha(case["raw_sha256"], "raw digest")
        if digest != case["raw_sha256"] or digest in raw_hashes:
            reject("Raw evidence changed or was reused across cases")
        raw_hashes.add(digest)
        scores = case["scores"]
        if not isinstance(scores, list) or not all(isinstance(score, dict) for score in scores) or [score.get("criterion") for score in scores] != CASE_CRITERIA[case["id"]]:
            reject("Exact criterion-level score IDs/order required")
        for score in scores:
            exact(score, {"criterion", "score", "evidence_quote", "note"}, "score")
            if type(score["score"]) is not int or not 0 <= score["score"] <= 2:
                reject("Criterion score must be integer 0, 1 or 2")
            if not isinstance(score["evidence_quote"], str) or score["evidence_quote"] and score["evidence_quote"] not in raw_text:
                reject("Score evidence quote must match unmodified raw output")
            if score["score"] > 0 and not score["evidence_quote"].strip():
                reject("Nonzero scores require a traceable raw-output quote")
            string(score["note"], "score note")
            total += score["score"]
        if not isinstance(case["critical_errors"], list):
            reject("critical_errors must be a list")
        for error in case["critical_errors"]:
            exact(error, {"code", "evidence_quote", "note"}, "critical error")
            if error["code"] not in canonical[case["id"]]["critical_error_codes"]:
                reject("Unknown critical-error code")
            if not isinstance(error["evidence_quote"], str) or error["evidence_quote"] and error["evidence_quote"] not in raw_text:
                reject("Critical-error quote must match raw output")
            string(error["note"], "critical-error note")
    exact(result["aggregate"], {"score", "max_score", "interpretation"}, "aggregate")
    if type(result["aggregate"]["score"]) is not int or result["aggregate"]["score"] != total or result["aggregate"]["max_score"] != 36:
        reject("Aggregate must match the separate 36-point pilot rubric")
    string(result["aggregate"]["interpretation"], "aggregate interpretation")


def validate(root=ROOT):
    manifest = validate_manifest(root)
    results = root / PILOT / "results"
    if not results.is_dir() or results.is_symlink() or results.resolve() != results.absolute():
        reject("Pilot results directory must exist and cannot be a symlink")
    counts = {"completed": 0, "unavailable": 0}
    signatures = set()
    raw_digest_owners = {}
    raw_inode_owners = {}
    for run_dir in sorted(results.iterdir()):
        if run_dir.is_symlink():
            reject("Result entries cannot be symlinks")
        if run_dir.name.startswith(".") or run_dir.is_file():
            continue
        if not run_dir.is_dir():
            reject("Run directories must be real directories")
        result = load_json(run_dir / "result.json")
        validate_result(run_dir, result, manifest)
        if result["status"] == "completed":
            # A renamed/copied record is not a new independent execution. Keep
            # byte and file-identity ownership global across completed runs.
            # Equal raw outputs require a separate protocol review; do not
            # silently infer independence from different metadata strings.
            for case in result["cases"]:
                raw_path = run_dir / case["raw_output_path"]
                stat = raw_path.stat(follow_symlinks=False)
                inode = (stat.st_dev, stat.st_ino)
                digest = case["raw_sha256"]
                previous = raw_digest_owners.get(digest) or raw_inode_owners.get(inode)
                if previous is not None:
                    reject(f"Duplicate raw evidence across runs requires independent review: {previous} and {run_dir.name}/{case['id']}")
                owner = f"{run_dir.name}/{case['id']}"
                raw_digest_owners[digest] = owner
                raw_inode_owners[inode] = owner
            signatures.add(tuple(result["agent"][key].strip().casefold() for key in ("provider", "product", "model")))
        counts[result["status"]] += 1
    return {"suite_version": VERSION, **counts, "distinct_agent_signatures": len(signatures), "official_v01_evidence": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    try:
        report = validate(args.root.resolve())
    except (ValueError, OSError, TypeError, KeyError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
