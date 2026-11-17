#!/usr/bin/env python3
"""Build reproducible, evaluator-isolated v0.1 benchmark case packets.

Reads *all runner inputs* from the exact release-policy commit, not from the
latest checkout. Output ZIPs contain no rubric, expected files, scored outputs
or other cases. This prepares eligible runners; it does not run any agent or
certify independent context.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_GUIDANCE = [
    "SKILL.md",
    "benchmarks/runner-instruction.md",
    "references/workflow.md",
    "references/information-architecture.md",
    "references/component-architecture.md",
    "templates/project-context.md",
    "templates/page-spec.md",
    "templates/navigation-comparison.md",
    "templates/content-coverage.md",
    "templates/component-contract.md",
]
FORBIDDEN_TOKENS = ("/expected.md", "rubric.md", "benchmarks/results/", "result.template.json")


def fail(message: str) -> None:
    raise ValueError(message)


def read_pinned(ref: str, path: str) -> bytes:
    if path.startswith("/") or ".." in Path(path).parts:
        fail(f"Unsafe repository path: {path}")
    process = subprocess.run(
        ["git", "-C", str(ROOT), "show", f"{ref}:{path}"],
        capture_output=True,
        check=False,
    )
    if process.returncode:
        fail(f"Cannot fetch pinned object {ref}:{path}: {process.stderr.decode(errors='replace')}")
    return process.stdout


def stable_zip_item(name: str, content: bytes, archive: ZipFile) -> None:
    info = ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
    info.compress_type = ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    archive.writestr(info, content)


def build_packets(out_dir: Path) -> list[dict]:
    policy = json.loads((ROOT / "benchmarks/release-policy.json").read_text(encoding="utf-8"))
    ref = policy["required_repository_commit"]
    if not re.fullmatch(r"[0-9a-f]{40}", ref):
        fail("Release policy must specify a pinned 40-digit SHA.")

    # The manifest is consumed by the packager only. Do not copy it to the
    # runner: its evaluator_reference_paths and rubric_path must remain hidden.
    manifest = json.loads(read_pinned(ref, "benchmarks/manifest.json"))
    if manifest["suite_version"] != policy["required_suite_version"]:
        fail("Pinned suite version does not match release policy.")
    results = []
    out_dir.mkdir(parents=True, exist_ok=True)
    for case in manifest["cases"]:
        case_id = case["id"]
        if not re.fullmatch(r"[a-z0-9-]+", case_id):
            fail(f"Unsafe case ID: {case_id}")
        paths = list(dict.fromkeys(ALLOWED_GUIDANCE + case["input_paths"]))
        prohibited = set(case["evaluator_reference_paths"])
        if any(
            path in prohibited or any(token in f"/{path}" for token in FORBIDDEN_TOKENS)
            for path in paths
        ):
            fail(f"Evaluator path accidentally included for {case_id}")

        entries = {}
        for path in paths:
            blob = read_pinned(ref, path)
            entries[path] = {
                "sha256": hashlib.sha256(blob).hexdigest(),
                "size_bytes": len(blob),
            }
        packet = {
            "packet_version": "1",
            "source_repository": "bynanci/website-design-skill",
            "source_commit": ref,
            "suite_version": manifest["suite_version"],
            "case_id": case_id,
            "input_paths": case["input_paths"],
            "reference_paths": [p for p in paths if p not in case["input_paths"]],
            "files": entries,
            "runner_notes": [
                "Use SKILL.md as the governing skill.",
                "Do not load evaluator references, expected.md, rubric.md, previous scores, or other case packets.",
                "Preserve the full raw response without manual edits and record execution identity/capabilities.",
                "This packet is not itself official independent-agent evidence.",
            ],
        }
        packet_name = f"{case_id}-pinned-{ref[:12]}.zip"
        destination = out_dir / packet_name
        with ZipFile(destination, "w") as archive:
            for path in sorted(paths):
                stable_zip_item(path, read_pinned(ref, path), archive)
            stable_zip_item("packet.json", (json.dumps(packet, sort_keys=True, indent=2) + "\n").encode(), archive)
        with ZipFile(destination, "r") as archive:
            archived = set(archive.namelist())
            if archived != set(paths) | {"packet.json"}:
                fail(f"Packet entries mismatch: {case_id}")
            for path, hashes in entries.items():
                if hashlib.sha256(archive.read(path)).hexdigest() != hashes["sha256"]:
                    fail(f"Packet checksum mismatch: {path}")
        results.append(
            {
                "case_id": case_id,
                "filename": packet_name,
                "source_commit": ref,
                "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
            }
        )
    summary = {"suite_version": manifest["suite_version"], "source_commit": ref, "packets": results}
    (out_dir / "packet-checksums.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, default=ROOT / "benchmarks/packets")
    args = parser.parse_args()
    try:
        result = build_packets(args.output_dir.resolve())
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1
    for row in result:
        print(f"{row['case_id']}: {row['filename']} sha256={row['sha256']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
