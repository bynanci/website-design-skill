"""Unit tests: clean packets never leak evaluator materials or vary by time."""

import hashlib
import json
from pathlib import Path
import re
import tempfile
import unittest
from unittest import mock
from zipfile import ZipFile

from scripts import build_clean_packets as pack


REF = "7" * 40


class PacketDocumentationTests(unittest.TestCase):
    def test_public_packet_uses_the_official_release_baseline(self):
        root = Path(__file__).resolve().parents[1]
        policy = json.loads((root / "benchmarks/release-policy.json").read_text(encoding="utf-8"))
        packet = (root / "benchmarks/clean-run-packet.md").read_text(encoding="utf-8")
        documented_commit = re.search(r"Core commit:\s*`([0-9a-f]{40})`", packet)

        self.assertIsNotNone(documented_commit, "Public packet must identify its core commit.")
        self.assertEqual(documented_commit.group(1), policy["required_repository_commit"])


class CleanPacketTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        (self.root / "benchmarks").mkdir()
        (self.root / "benchmarks/release-policy.json").write_text(
            json.dumps({"required_repository_commit": REF, "required_suite_version": "0.1.0"}),
            encoding="utf-8",
        )
        manifest = {
            "suite_version": "0.1.0",
            "cases": [
                {
                    "id": "ia-audit-001",
                    "input_paths": ["evals/ia-audit/case-001/input.md"],
                    "evaluator_reference_paths": ["evals/ia-audit/case-001/expected.md"],
                },
            ],
        }
        self.blobs = {
            "benchmarks/manifest.json": json.dumps(manifest).encode(),
            "SKILL.md": b"# Governing skill",
            "benchmarks/runner-instruction.md": b"Complete only the case.",
            "evals/ia-audit/case-001/input.md": b"# Case input",
        }
        root_patch = mock.patch.object(pack, "ROOT", self.root)
        guide_patch = mock.patch.object(pack, "ALLOWED_GUIDANCE", [
            "SKILL.md",
            "benchmarks/runner-instruction.md",
        ])
        fetch_patch = mock.patch.object(
            pack, "read_pinned", side_effect=lambda ref, path: self.blobs[path]
        )
        for p in (root_patch, guide_patch, fetch_patch):
            p.start()
            self.addCleanup(p.stop)

    def test_clean_zip_has_only_approved_files(self):
        result = pack.build_packets(self.root / "out")
        self.assertEqual(len(result), 1)
        with ZipFile(self.root / "out" / result[0]["filename"]) as z:
            self.assertEqual(
                set(z.namelist()),
                {
                    "SKILL.md",
                    "benchmarks/runner-instruction.md",
                    "evals/ia-audit/case-001/input.md",
                    "packet.json",
                },
            )
            self.assertNotIn(b"expected.md", z.read("SKILL.md"))
            manifest = json.loads(z.read("packet.json"))
            self.assertNotIn("rubric_path", manifest)
            self.assertNotIn("evaluator_reference_paths", manifest)
            self.assertNotIn("evals/ia-audit/case-001/expected.md", manifest["files"])
            self.assertEqual(manifest["source_commit"], REF)

    def test_packet_archive_and_checksums_are_reproducible(self):
        first = pack.build_packets(self.root / "first")
        second = pack.build_packets(self.root / "second")
        self.assertEqual(first, second)
        self.assertEqual(
            (self.root / "first" / first[0]["filename"]).read_bytes(),
            (self.root / "second" / second[0]["filename"]).read_bytes()
        )
        digest = hashlib.sha256((self.root / "first" / first[0]["filename"]).read_bytes()).hexdigest()
        self.assertEqual(first[0]["sha256"], digest)

    def test_evaluator_file_in_guide_is_rejected(self):
        pack.ALLOWED_GUIDANCE.append("evals/ia-audit/case-001/expected.md")
        with self.assertRaises(ValueError):
            pack.build_packets(self.root / "out")


if __name__ == "__main__":
    unittest.main()
