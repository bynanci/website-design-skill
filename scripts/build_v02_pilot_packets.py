#!/usr/bin/env python3
"""Build reproducible v0.2 case packets from a fixed preview commit."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile

try:
    from scripts.build_clean_packets import stable_zip_item
    from scripts.validate_v02_pilot import PIN, ROOT, VERSION, validate_manifest, safe_relative
except ModuleNotFoundError:
    from build_clean_packets import stable_zip_item
    from validate_v02_pilot import PIN, ROOT, VERSION, validate_manifest, safe_relative


def read_pinned(root, relative):
    safe_relative(relative, "packet source")
    listing = subprocess.run(["git", "-C", str(root), "ls-tree", PIN, "--", relative], capture_output=True, check=False)
    row = listing.stdout.decode("utf-8").strip().split()
    if listing.returncode or len(row) < 4 or row[0] not in {"100644", "100755"} or row[1] != "blob" or row[3] != relative:
        raise ValueError(f"Pinned source must be a regular tracked file: {relative}; fetch the pinned commit first")
    result = subprocess.run(["git", "-C", str(root), "show", f"{PIN}:{relative}"], capture_output=True, check=False)
    if result.returncode:
        raise ValueError(f"Cannot read pinned source: {relative}")
    result.stdout.decode("utf-8")
    if not result.stdout.strip():
        raise ValueError(f"Empty pinned runner input: {relative}")
    return result.stdout


def build_packets(out_dir, root=ROOT):
    manifest = validate_manifest(root)
    out_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    for case in manifest["cases"]:
        paths = list(dict.fromkeys(manifest["guidance_paths"] + case["input_paths"]))
        forbidden = set(case["evaluator_reference_paths"])
        if any(path in forbidden or any(word in path.lower() for word in ("expected", "rubric", "results/", "evaluator")) for path in paths):
            raise ValueError("Evaluator material cannot enter a runner packet")
        blobs = {relative: read_pinned(root, relative) for relative in paths}
        packet = {
            "packet_version": VERSION,
            "suite_version": VERSION,
            "source_repository": manifest["source_repository"],
            "source_commit": PIN,
            "case_id": case["id"],
            "input_paths": case["input_paths"],
            "reference_paths": manifest["guidance_paths"],
            "files": {relative: {"sha256": hashlib.sha256(raw).hexdigest(), "size_bytes": len(raw)} for relative, raw in sorted(blobs.items())},
            "runner_instructions": [
                "Use SKILL.md and only this case's input. Produce the requested planning artifact; do not implement an application.",
                "The optional responsive, visual-direction and token templates are public guidance, not test evidence.",
                "Keep the existing case facts, workflow, content and reusable-component boundaries. Carry unknowns forward explicitly.",
                "Do not load expected files, scoring rubrics, prior outputs, reviewer notes or other case packets before generation.",
                "Preserve the complete raw response without manual edits; record provider/product/model identity and actual capabilities.",
                "This generated packet metadata is protocol 0.2-pilot.1; all skill, guidance and case source bytes come from source_commit.",
                "This packet is not official v0.1 evidence and does not itself prove an independent agent run.",
            ],
        }
        packet_bytes = (json.dumps(packet, sort_keys=True, indent=2) + "\n").encode("utf-8")
        name = f"{case['id']}-{VERSION}-{PIN[:12]}.zip"
        destination = out_dir / name
        with ZipFile(destination, "w") as archive:
            for relative in sorted(blobs):
                stable_zip_item(relative, blobs[relative], archive)
            stable_zip_item("packet.json", packet_bytes, archive)
        with ZipFile(destination) as archive:
            if set(archive.namelist()) != set(blobs) | {"packet.json"}:
                raise ValueError("Packet entries differ from the approved source list")
            for relative, raw in blobs.items():
                if archive.read(relative) != raw:
                    raise ValueError(f"Packet content changed: {relative}")
        rows.append({"case_id": case["id"], "filename": name, "source_commit": PIN, "sha256": hashlib.sha256(destination.read_bytes()).hexdigest()})
    report = {"suite_version": VERSION, "source_commit": PIN, "official_v01_evidence": False, "packets": rows}
    (out_dir / "packet-checksums.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=Path("/tmp/website-v02-pilot-packets"))
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    try:
        report = build_packets(args.output_dir.resolve(), args.root.resolve())
    except (ValueError, OSError, UnicodeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
