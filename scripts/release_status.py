#!/usr/bin/env python3

from collections import Counter
from pathlib import Path
import argparse
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
BENCH = ROOT / "benchmarks"
RESULTS = BENCH / "results"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def official_results():
    runs = []
    if not RESULTS.exists():
        return runs

    for run_dir in sorted(path for path in RESULTS.iterdir() if path.is_dir()):
        result_path = run_dir / "result.json"
        if not result_path.exists():
            continue
        result = load_json(result_path)
        if result.get("status") == "official":
            runs.append(result)
    return runs


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--require-ready",
        action="store_true",
        help="Exit 1 when release gates are not satisfied.",
    )
    args = parser.parse_args()

    policy = load_json(BENCH / "release-policy.json")
    manifest = load_json(BENCH / "manifest.json")
    runs = official_results()

    failures = []
    warnings = []

    if policy["required_suite_version"] != manifest["suite_version"]:
        failures.append(
            "release policy suite version does not match benchmark manifest"
        )

    if len(runs) < policy["minimum_official_runs"]:
        failures.append(
            f"official runs: {len(runs)} < {policy['minimum_official_runs']}"
        )

    signatures = {
        (
            run["agent"].get("provider", ""),
            run["agent"].get("product", ""),
            run["agent"].get("model", ""),
        )
        for run in runs
    }

    if len(signatures) < policy["minimum_distinct_agent_signatures"]:
        failures.append(
            "distinct agent signatures: "
            f"{len(signatures)} < {policy['minimum_distinct_agent_signatures']}"
        )

    low_runs = []
    for run in runs:
        score = run["aggregate"]["score"]
        if score < policy["minimum_total_score_per_run"]:
            low_runs.append((run["run_id"], score))

        if run.get("suite_version") != policy["required_suite_version"]:
            failures.append(
                f"{run['run_id']} uses suite {run.get('suite_version')} "
                f"instead of {policy['required_suite_version']}"
            )

        if run.get("manual_edit") is not False:
            failures.append(f"{run['run_id']} is not clean: manual_edit != false")

    if low_runs:
        failures.append(
            "official run score below minimum: "
            + ", ".join(f"{run_id}={score}" for run_id, score in low_runs)
        )

    zero_counts = Counter()
    for run in runs:
        for case in run["cases"]:
            for criterion, score in case["scores"].items():
                if score == 0:
                    zero_counts[criterion] += 1

    shared_zeroes = {
        criterion: count
        for criterion, count in zero_counts.items()
        if count >= 2
    }

    if policy.get("block_on_shared_zero_criterion") and shared_zeroes:
        failures.append(
            "shared zero-score criteria: "
            + ", ".join(
                f"{criterion}({count})"
                for criterion, count in sorted(shared_zeroes.items())
            )
        )

    for criterion, count in sorted(zero_counts.items()):
        if count == 1:
            warnings.append(f"single-run zero criterion: {criterion}")

    ready = not failures

    status = {
        "release_line": policy["release_line"],
        "suite_version": manifest["suite_version"],
        "ready": ready,
        "official_runs": len(runs),
        "distinct_agent_signatures": len(signatures),
        "failures": failures,
        "warnings": warnings,
    }

    print(json.dumps(status, indent=2))

    if args.require_ready and not ready:
        sys.exit(1)


if __name__ == "__main__":
    main()
