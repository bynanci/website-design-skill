#!/usr/bin/env python3
"""Publish an immutable v0.1 release request after existing evidence gates pass."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from check_merge_readiness import GitHubClient, ReadinessError, inspect

ROOT = Path(__file__).resolve().parents[1]
SHA = re.compile(r"[0-9a-f]{40}")
TAG = re.compile(r"v0\.1\.(0|[1-9][0-9]*)")
REQUIRED_CHECKS = ("validate", "smoke", "Vercel – vue-project-profile")
FROZEN_CORE = "7d64090710ef20f1d24cea6b46199391d3c09c18"
REQUEST_DIR = ".github/release-requests/"


class ReleaseError(ValueError):
    pass


def git(*args, root=ROOT):
    result = subprocess.run(["git", "-C", str(root), *args], capture_output=True, check=False)
    if result.returncode:
        raise ReleaseError("Git evidence could not be verified")
    return result.stdout


def blob(commit, path, root=ROOT):
    row = git("ls-tree", commit, "--", path, root=root).decode().strip()
    if not row.startswith("100644 blob ") or row.split("\t", 1)[-1] != path:
        raise ReleaseError("Release inputs must be tracked regular files")
    return git("show", f"{commit}:{path}", root=root)


def validate_request(data, path):
    if not isinstance(data, dict) or set(data) != {"tag", "candidate_sha", "notes_path", "notes_sha256"}:
        raise ReleaseError("Request keys must be tag, candidate_sha, notes_path, notes_sha256")
    if not isinstance(data["tag"], str) or not TAG.fullmatch(data["tag"]):
        raise ReleaseError("Only v0.1 patch releases are supported by this evidence policy")
    if path != f"{REQUEST_DIR}{data['tag']}.json":
        raise ReleaseError("Request filename must match its version tag")
    if not isinstance(data["candidate_sha"], str) or not SHA.fullmatch(data["candidate_sha"]):
        raise ReleaseError("candidate_sha must be a full lowercase commit SHA")
    if data["notes_path"] != f"docs/releases/{data['tag']}.github.md":
        raise ReleaseError("Release notes must use the versioned GitHub-notes path")
    if not isinstance(data["notes_sha256"], str) or not re.fullmatch(r"[a-f0-9]{64}", data["notes_sha256"]):
        raise ReleaseError("notes_sha256 must be a full lowercase SHA-256")
    return data


def verify_candidate(data, main_sha, request_head, root=ROOT):
    candidate = data["candidate_sha"]
    if not SHA.fullmatch(main_sha) or not SHA.fullmatch(request_head) or candidate == request_head:
        raise ReleaseError("Candidate must precede the request commit")
    git("merge-base", "--is-ancestor", candidate, main_sha, root=root)
    if git("rev-parse", f"{candidate}:.github/workflows", root=root) != git("rev-parse", f"{main_sha}:.github/workflows", root=root):
        raise ReleaseError("Candidate and current main must have identical workflow trees")
    notes = blob(candidate, data["notes_path"], root=root)
    if not notes.strip() or hashlib.sha256(notes).hexdigest() != data["notes_sha256"]:
        raise ReleaseError("Candidate release notes do not match the requested hash")
    body = notes.decode("utf-8")
    if re.search(r"(?im)^#.*\bDraft\b", body):
        raise ReleaseError("GitHub release body must not be a draft")
    if re.search(r"\]\((?!https://|#|mailto:)[^)]+\)", body):
        raise ReleaseError("GitHub release body links must be absolute HTTPS links")
    policy = json.loads(blob(candidate, "benchmarks/release-policy.json", root=root))
    if policy.get("required_repository_commit") != FROZEN_CORE or policy.get("required_suite_version") != "0.1.0":
        raise ReleaseError("Candidate must retain the accepted frozen v0.1 policy")
    return body


def validate_evidence(candidate, root=ROOT):
    # Candidate code is trusted main ancestry and receives no repository API token.
    environment = {k: v for k, v in os.environ.items() if k not in {"GH_TOKEN", "GITHUB_TOKEN"}}
    with tempfile.TemporaryDirectory(prefix="release-evidence-") as parent:
        checkout = Path(parent) / "candidate"
        git("worktree", "add", "--detach", str(checkout), candidate, root=root)
        try:
            for command in (["scripts/validate_skill.py"], ["scripts/validate_benchmarks.py"], ["scripts/release_status.py", "--require-ready"]):
                result = subprocess.run([sys.executable, *command], cwd=checkout, env=environment, check=False)
                if result.returncode:
                    raise ReleaseError("Candidate's existing release evidence gate failed")
        finally:
            git("worktree", "remove", "--force", str(checkout), root=root)


class ReleaseClient(GitHubClient):
    def optional(self, endpoint):
        # Only a genuine 404 means absent. Other errors must stop publication.
        return self.request("GET", endpoint, absent_ok=True)

    def request(self, method, endpoint, body=None, *, absent_ok=False):
        if method != "GET" and not self.token:
            raise ReleaseError("Publishing requires the workflow's repository token")
        headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "website-design-skill-release"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        raw = None if body is None else json.dumps(body).encode()
        if raw is not None:
            headers["Content-Type"] = "application/json"
        request = Request("https://api.github.com" + endpoint, data=raw, headers=headers, method=method)
        try:
            with urlopen(request, timeout=30) as response:
                content = response.read(2_000_001)
                if len(content) > 2_000_000:
                    raise ReleaseError("Release API response exceeded the read limit")
                return json.loads(content)
        except HTTPError as error:
            if absent_ok and error.code == 404:
                return None
            # Never print headers, token values, or arbitrary response bodies.
            raise ReleaseError(f"Release API returned HTTP {error.code}; stop without retrying") from None
        except (URLError, TimeoutError, OSError, UnicodeError, json.JSONDecodeError):
            raise ReleaseError("Release API outcome is unverified; inspect remote state before retrying") from None


def tag_commit(client, repo, tag):
    ref = client.optional(f"/repos/{repo}/git/ref/tags/{quote(tag, safe='')}")
    if ref is None:
        return None
    obj = ref.get("object", {})
    for _ in range(4):
        if obj.get("type") == "commit" and isinstance(obj.get("sha"), str) and SHA.fullmatch(obj["sha"]):
            return obj["sha"]
        if obj.get("type") != "tag" or not SHA.fullmatch(str(obj.get("sha"))):
            break
        obj = client.request("GET", f"/repos/{repo}/git/tags/{obj['sha']}").get("object", {})
    raise ReleaseError("Existing tag does not resolve to a bounded commit object")


def verify_existing(data, body, target, release):
    if target is not None and target != data["candidate_sha"]:
        raise ReleaseError("Existing tag points to another commit; never move it")
    if release is not None:
        if target != data["candidate_sha"] or release.get("tag_name") != data["tag"] or release.get("body") != body or release.get("draft") is not False or release.get("prerelease") is not False or not release.get("published_at"):
            raise ReleaseError("Existing release conflicts with the request; never overwrite it")
        return True
    return False


def process_request(path, repo, main_sha, head_sha, *, publish=False, client=None, root=ROOT):
    data = validate_request(json.loads(blob(head_sha, path, root=root)), path)
    body = verify_candidate(data, main_sha, head_sha, root=root)
    validate_evidence(data["candidate_sha"], root=root)
    client = client or ReleaseClient()
    report = inspect(repo, data["candidate_sha"], REQUIRED_CHECKS, client=client)
    if not report["ready"]:
        raise ReleaseError("Exact candidate checks/statuses are not all successful")
    actual_actions = {entry["name"] for entry in report["github_actions"] if entry["passed"]}
    if not {"validate", "smoke"} <= actual_actions:
        raise ReleaseError("Candidate requires successful real Actions validate and smoke checks")
    existing = client.optional(f"/repos/{repo}/releases/tags/{data['tag']}")
    target = tag_commit(client, repo, data["tag"])
    complete = verify_existing(data, body, target, existing)
    if not publish or complete:
        return {"tag": data["tag"], "candidate_sha": data["candidate_sha"], "published": complete, "action": "verified-existing" if complete else "validated-only"}
    current, _ = client.get(f"/repos/{repo}/git/ref/heads/main")
    if current.get("object", {}).get("sha") != head_sha or main_sha != head_sha:
        raise ReleaseError("Main advanced since request checkout; stop before publication")
    # Create-release creates a missing lightweight tag at this exact SHA. It also
    # handles a pre-existing matching tag; no force update or public body edit.
    client.request("POST", f"/repos/{repo}/releases", {"tag_name": data["tag"], "target_commitish": data["candidate_sha"], "name": data["tag"], "body": body, "draft": False, "prerelease": False, "generate_release_notes": False, "make_latest": "true"})
    release = client.optional(f"/repos/{repo}/releases/tags/{data['tag']}")
    if not verify_existing(data, body, tag_commit(client, repo, data["tag"]), release):
        raise ReleaseError("Published release could not be verified")
    return {"tag": data["tag"], "candidate_sha": data["candidate_sha"], "published": True, "action": "published", "url": release.get("html_url")}


def changed_requests(base, head, root=ROOT):
    if not SHA.fullmatch(base) or not SHA.fullmatch(head):
        raise ReleaseError("Event must identify exact base and head commits")
    rows = git("diff", "--name-status", "--no-renames", base, head, "--", REQUEST_DIR, root=root).decode().splitlines()
    paths = []
    for row in rows:
        status, path = row.split("\t", 1)
        if status != "A" or not re.fullmatch(r"\.github/release-requests/v0\.1\.(0|[1-9][0-9]*)\.json", path):
            raise ReleaseError("Release requests are immutable versioned additions")
        paths.append(path)
    if len(paths) > 1:
        raise ReleaseError("Submit one release request per change")
    return paths


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--event-file", required=True)
    parser.add_argument("--publish", action="store_true")
    args = parser.parse_args(argv)
    try:
        event = json.loads(Path(args.event_file).read_text())
        repo = os.environ.get("GITHUB_REPOSITORY", "")
        if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo):
            raise ReleaseError("GITHUB_REPOSITORY must identify owner/name")
        pull = event.get("pull_request")
        if pull:
            base, head = pull["base"]["sha"], pull["head"]["sha"]
        else:
            base, head = event.get("before", ""), event.get("after", "")
        if args.publish and (pull or event.get("ref") != "refs/heads/main"):
            raise ReleaseError("Only a main push can publish a release")
        main_sha = git("rev-parse", "refs/remotes/origin/main").decode().strip()
        records = [process_request(path, repo, main_sha, head, publish=args.publish) for path in changed_requests(base, head)]
        print(json.dumps({"requests": records, "mode": "publish" if args.publish else "validate"}, indent=2))
        return 0
    except (ReleaseError, ReadinessError, KeyError, UnicodeError, json.JSONDecodeError) as error:
        print(json.dumps({"published": False, "error": str(error)}))
        return 1


if __name__ == "__main__":
    sys.exit(main())
