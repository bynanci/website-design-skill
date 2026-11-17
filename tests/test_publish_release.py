"""Boundary tests for irreversible tag/release publication; no network writes."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import publish_release as release

SHA = "a" * 40
OTHER = "b" * 40
BODY = "# v0.1.0\n\n[Evidence](https://github.com/bynanci/website-design-skill/issues/1)\n"
REQUEST = {"tag": "v0.1.0", "candidate_sha": SHA, "notes_path": "docs/releases/v0.1.0.github.md", "notes_sha256": hashlib.sha256(BODY.encode()).hexdigest()}
PATH = ".github/release-requests/v0.1.0.json"


class ReleaseBoundaries(unittest.TestCase):
    def test_request_rejects_placeholder_sha_extra_keys_and_path_escape(self):
        release.validate_request(REQUEST, PATH)
        for key, value in [("candidate_sha", "main"), ("candidate_sha", "a" * 39), ("notes_path", "../../secret"), ("notes_sha256", "todo"), ("tag", "v0.2.0")]:
            with self.subTest(key=key, value=value), self.assertRaises(release.ReleaseError):
                release.validate_request({**REQUEST, key: value}, PATH)
        with self.assertRaises(release.ReleaseError):
            release.validate_request({**REQUEST, "skip_checks": True}, PATH)
        with self.assertRaises(release.ReleaseError):
            release.validate_request(REQUEST, ".github/release-requests/other.json")

    def test_existing_tag_and_release_are_immutable(self):
        accepted = {"tag_name": "v0.1.0", "body": BODY, "draft": False, "prerelease": False, "published_at": "2026-11-18T00:00:00Z"}
        self.assertTrue(release.verify_existing(REQUEST, BODY, SHA, accepted))
        self.assertFalse(release.verify_existing(REQUEST, BODY, SHA, None))
        for tag, record in [(OTHER, None), (None, accepted), (SHA, {**accepted, "body": "changed"}), (SHA, {**accepted, "draft": True}), (SHA, {**accepted, "prerelease": True})]:
            with self.subTest(tag=tag, record=record), self.assertRaises(release.ReleaseError):
                release.verify_existing(REQUEST, BODY, tag, record)

    def test_requests_cannot_be_rewritten_deleted_or_renamed(self):
        for row in [f"M\t{PATH}\n", f"D\t{PATH}\n", "A\t.github/release-requests/unversioned.json\n"]:
            with patch.object(release, "git", return_value=row.encode()), self.assertRaises(release.ReleaseError):
                release.changed_requests(SHA, OTHER)
        with patch.object(release, "git", return_value=f"A\t{PATH}\n".encode()):
            self.assertEqual(release.changed_requests(SHA, OTHER), [PATH])

    def test_missing_candidate_check_stops_before_publication(self):
        for report in [{"ready": False}, {"ready": True, "github_actions": [{"name": "validate", "passed": True}]}]:
            client = FakeClient()
            with patch.object(release, "blob", return_value=json.dumps(REQUEST).encode()), patch.object(release, "verify_candidate", return_value=BODY), patch.object(release, "validate_evidence"), patch.object(release, "inspect", return_value=report):
                with self.assertRaises(release.ReleaseError):
                    release.process_request(PATH, "o/r", OTHER, OTHER, publish=True, client=client)
            self.assertEqual(client.writes, [])

    def test_post_is_not_retried_when_remote_verification_fails(self):
        class FailedVerificationClient(FakeClient):
            def get(self, endpoint):
                return {"object": {"sha": OTHER}}, {}

            def optional(self, endpoint):
                if "/git/ref/tags/" in endpoint:
                    return None if not self.writes else {"object": {"type": "commit", "sha": SHA}}
                return None

            def request(self, method, endpoint, body=None):
                self.writes.append((method, endpoint, body))
                return {}

        client = FailedVerificationClient()
        with patch.object(release, "blob", return_value=json.dumps(REQUEST).encode()), patch.object(release, "verify_candidate", return_value=BODY), patch.object(release, "validate_evidence"), patch.object(release, "inspect", return_value={"ready": True, "github_actions": [{"name": "validate", "passed": True}, {"name": "smoke", "passed": True}]}):
            with self.assertRaises(release.ReleaseError):
                release.process_request(PATH, "o/r", OTHER, OTHER, publish=True, client=client)
        self.assertEqual(len(client.writes), 1)
        self.assertEqual(client.writes[0][0], "POST")

    def test_matching_published_release_is_noop_and_dry_run_never_writes(self):
        for existing in (None, {"tag_name": "v0.1.0", "body": BODY, "draft": False, "prerelease": False, "published_at": "2026-11-18"}):
            client = FakeClient(existing)
            with patch.object(release, "blob", return_value=json.dumps(REQUEST).encode()), patch.object(release, "verify_candidate", return_value=BODY), patch.object(release, "validate_evidence"), patch.object(release, "inspect", return_value={"ready": True, "github_actions": [{"name": "validate", "passed": True}, {"name": "smoke", "passed": True}]}):
                result = release.process_request(PATH, "o/r", OTHER, OTHER, publish=False, client=client)
            self.assertEqual(result["published"], existing is not None)
            self.assertEqual(client.writes, [])

    def test_conflicting_tag_stops_before_release_post(self):
        client = FakeClient(target=OTHER)
        with patch.object(release, "blob", return_value=json.dumps(REQUEST).encode()), patch.object(release, "verify_candidate", return_value=BODY), patch.object(release, "validate_evidence"), patch.object(release, "inspect", return_value={"ready": True, "github_actions": [{"name": "validate", "passed": True}, {"name": "smoke", "passed": True}]}):
            with self.assertRaises(release.ReleaseError):
                release.process_request(PATH, "o/r", OTHER, OTHER, publish=True, client=client)
        self.assertEqual(client.writes, [])


class FakeClient:
    def __init__(self, existing=None, target=SHA):
        self.existing, self.target, self.writes = existing, target, []

    def optional(self, endpoint):
        if "/git/ref/tags/" in endpoint:
            return {"object": {"type": "commit", "sha": self.target}}
        return self.existing

    def request(self, method, endpoint, body=None):
        self.writes.append((method, endpoint, body))
        raise AssertionError("Unexpected API mutation")


class CandidateGitBoundaries(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.run_git("init", "-q")
        self.run_git("config", "user.name", "Release test")
        self.run_git("config", "user.email", "release@example.invalid")
        for name, content in {".github/workflows/test.yml": "name: fixture\n", REQUEST["notes_path"]: BODY, "benchmarks/release-policy.json": json.dumps({"required_repository_commit": release.FROZEN_CORE, "required_suite_version": "0.1.0"})}.items():
            file = self.root / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(content)
        self.candidate = self.commit()
        (self.root / "request.txt").write_text("request")
        self.main = self.commit()
        self.request = {**REQUEST, "candidate_sha": self.candidate}

    def run_git(self, *args):
        return subprocess.check_output(["git", "-C", str(self.root), *args], stderr=subprocess.DEVNULL).decode().strip()

    def commit(self):
        self.run_git("add", ".")
        self.run_git("commit", "-qm", "fixture")
        return self.run_git("rev-parse", "HEAD")

    def test_accepted_candidate_and_hash_are_exact(self):
        self.assertEqual(release.verify_candidate(self.request, self.main, self.main, root=self.root), BODY)
        with self.assertRaises(release.ReleaseError):
            release.verify_candidate({**self.request, "notes_sha256": "0" * 64}, self.main, self.main, root=self.root)

    def test_candidate_must_be_ancestor_and_not_request_itself(self):
        with self.assertRaises(release.ReleaseError):
            release.verify_candidate(self.request, self.candidate, self.candidate, root=self.root)
        with self.assertRaises(release.ReleaseError):
            release.verify_candidate({**self.request, "candidate_sha": self.main}, self.candidate, self.candidate, root=self.root)

    def test_workflow_tree_drift_and_symlink_notes_are_rejected(self):
        (self.root / ".github/workflows/test.yml").write_text("name: changed\n")
        changed = self.commit()
        with self.assertRaises(release.ReleaseError):
            release.verify_candidate(self.request, changed, changed, root=self.root)
        self.run_git("checkout", "--detach", self.candidate)
        notes = self.root / REQUEST["notes_path"]
        notes.unlink()
        notes.symlink_to("../../request.txt")
        symlink_commit = self.commit()
        (self.root / "new.txt").write_text("request")
        after = self.commit()
        with self.assertRaises(release.ReleaseError):
            release.verify_candidate({**self.request, "candidate_sha": symlink_commit}, after, after, root=self.root)


if __name__ == "__main__":
    unittest.main()
