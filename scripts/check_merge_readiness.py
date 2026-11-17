#!/usr/bin/env python3
"""Read all observed commit statuses and checks before a merge; never mutate GitHub."""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen

MAX_PAGES = 10
PAGE_SIZE = 100
MAX_RESPONSE_BYTES = 8_000_000


class ReadinessError(ValueError):
    """Evidence was unavailable, incomplete or did not identify the requested commit."""


class GitHubClient:
    def __init__(self, token=None):
        self.token = token if token is not None else os.environ.get("GH_TOKEN")

    def get(self, endpoint):
        headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "website-design-skill-readiness"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        request = Request("https://api.github.com" + endpoint, headers=headers)
        try:
            with urlopen(request, timeout=20) as response:
                raw = response.read(MAX_RESPONSE_BYTES + 1)
                if len(raw) > MAX_RESPONSE_BYTES:
                    raise ReadinessError("GitHub API response exceeded the read limit")
                return json.loads(raw.decode("utf-8")), {key.lower(): value for key, value in response.headers.items()}
        except HTTPError as error:
            # Never print request headers, token values, or arbitrary API bodies.
            raise ReadinessError(f"GitHub API returned HTTP {error.code}; readiness is unverified") from None
        except (URLError, TimeoutError, OSError):
            raise ReadinessError("GitHub API could not be reached; readiness is unverified") from None
        except (UnicodeError, json.JSONDecodeError):
            raise ReadinessError("GitHub API returned invalid JSON; readiness is unverified") from None


def pages(client, endpoint, key=None, *, max_pages=MAX_PAGES, page_size=PAGE_SIZE):
    """Use only our fixed API endpoint, never an arbitrary URL from Link headers."""
    collected = []
    seen = set()
    expected_total = None
    for page in range(1, max_pages + 1):
        separator = "&" if "?" in endpoint else "?"
        payload, headers = client.get(f"{endpoint}{separator}per_page={page_size}&page={page}")
        if key is None:
            rows = payload
        else:
            if not isinstance(payload, dict) or type(payload.get("total_count")) is not int:
                raise ReadinessError("GitHub check-run pagination metadata is invalid")
            if expected_total is None:
                expected_total = payload["total_count"]
            if payload["total_count"] != expected_total or expected_total < 0:
                raise ReadinessError("GitHub checks changed during pagination; repeat the read")
            rows = payload.get(key)
        if not isinstance(rows, list) or len(rows) > page_size:
            raise ReadinessError("GitHub API pagination response is invalid")
        for row in rows:
            if not isinstance(row, dict) or type(row.get("id")) is not int or row["id"] <= 0 or row["id"] in seen:
                raise ReadinessError("GitHub pagination contains invalid or repeated evidence; repeat the read")
            seen.add(row["id"])
        collected.extend(rows)
        more = bool(re.search(r'rel="next"', headers.get("link", "")))
        if not more:
            if expected_total is not None and len(collected) != expected_total:
                raise ReadinessError("GitHub check-run pagination is incomplete")
            return collected
        if not rows:
            raise ReadinessError("GitHub pagination did not advance")
    raise ReadinessError("GitHub pagination exceeded the bounded page limit; readiness is unverified")


def summarize(repo, sha, statuses, checks, required=()):
    latest_statuses = {}
    latest_checks = {}
    for status in statuses:
        context = status.get("context")
        if not isinstance(context, str) or not context.strip():
            raise ReadinessError("A commit status has no context")
        if "sha" in status and status["sha"] != sha:
            raise ReadinessError("A commit status identifies another commit")
        if status.get("url"):
            expected = f"/repos/{repo}/statuses/{sha}"
            if urlparse(status["url"]).path.casefold() != expected.casefold():
                raise ReadinessError("A commit status URL identifies another repository or commit")
        previous = latest_statuses.get(context)
        if previous is None or status["id"] > previous["id"]:
            latest_statuses[context] = status
    for check in checks:
        app = check.get("app")
        suite = check.get("check_suite")
        if check.get("head_sha") != sha:
            raise ReadinessError("A check run identifies another commit")
        if not isinstance(check.get("name"), str) or not check["name"].strip() or not isinstance(app, dict) or type(app.get("id")) is not int:
            raise ReadinessError("A check run lacks its name or application identity")
        if not isinstance(suite, dict) or type(suite.get("id")) is not int or suite["id"] <= 0:
            raise ReadinessError("A check run lacks its check-suite identity; independent workflows cannot be collapsed")
        key = (app["id"], check["name"], suite["id"])
        previous = latest_checks.get(key)
        if previous is None or check["id"] > previous["id"]:
            latest_checks[key] = check

    report = {"repository": repo, "sha": sha, "ready": False, "github_actions": [], "external_checks": [], "commit_statuses": [], "blocking": []}
    names = set()
    for name, status in sorted(latest_statuses.items()):
        names.add(name)
        entry = {"name": name, "id": status["id"], "state": status.get("state"), "passed": status.get("state") == "success", "description": status.get("description"), "url": status.get("target_url")}
        report["commit_statuses"].append(entry)
        if not entry["passed"]:
            quota = name.casefold().startswith("vercel") and ("build-rate-limit" in str(entry["url"]) or "rate limit" in str(entry["description"]).casefold())
            report["blocking"].append({"kind": "commit-status", "name": name, "category": "vercel_build_rate_limit" if quota else "non-success-status", "state": entry["state"], "url": entry["url"]})
    for (_, name, suite_id), check in sorted(latest_checks.items()):
        names.add(name)
        app = check["app"]
        provider = app.get("slug") or str(app["id"])
        entry = {"name": name, "app": provider, "app_id": app["id"], "suite_id": suite_id, "id": check["id"], "status": check.get("status"), "conclusion": check.get("conclusion"), "passed": check.get("status") == "completed" and check.get("conclusion") == "success", "url": check.get("html_url") or check.get("details_url")}
        report["github_actions" if provider == "github-actions" else "external_checks"].append(entry)
        if not entry["passed"]:
            report["blocking"].append({"kind": "check-run", "name": name, "app": provider, "suite_id": suite_id, "status": entry["status"], "conclusion": entry["conclusion"], "url": entry["url"]})
    report["missing_required_checks"] = sorted(set(required) - names)
    if report["missing_required_checks"]:
        report["blocking"].append({"kind": "missing-required-checks", "names": report["missing_required_checks"]})
    if not latest_statuses and not latest_checks:
        report["blocking"].append({"kind": "missing-evidence", "message": "No commit statuses or check runs were observed"})
    report["ready"] = not report["blocking"]
    report["scope"] = "All observed contexts and explicitly required names for this exact commit; repository protection rules are not inferred. Only completed success checks pass; skipped or neutral checks are not proof of execution."
    report["observed_history"] = {"statuses": len(statuses), "check_runs": len(checks)}
    return report


def inspect(repo, sha=None, required=(), client=None):
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo) or any(part in {".", ".."} for part in repo.split("/")):
        raise ReadinessError("Repository must use owner/name form")
    if sha is not None and not re.fullmatch(r"[a-f0-9]{40}", sha):
        raise ReadinessError("--sha must be a full lowercase 40-character commit SHA")
    if any(not isinstance(name, str) or not name.strip() for name in required):
        raise ReadinessError("Required check names must be nonempty")
    client = client or GitHubClient()
    ref = sha
    if ref is None:
        repository, _ = client.get(f"/repos/{repo}")
        if not isinstance(repository, dict) or not isinstance(repository.get("default_branch"), str) or not repository["default_branch"]:
            raise ReadinessError("Cannot identify the repository default branch")
        ref = quote(repository["default_branch"], safe="")
    commit, _ = client.get(f"/repos/{repo}/commits/{ref}")
    resolved = commit.get("sha") if isinstance(commit, dict) else None
    if not isinstance(resolved, str) or not re.fullmatch(r"[a-f0-9]{40}", resolved) or sha is not None and resolved != sha:
        raise ReadinessError("GitHub did not identify the requested exact commit")
    statuses = pages(client, f"/repos/{repo}/commits/{resolved}/statuses")
    checks = pages(client, f"/repos/{repo}/commits/{resolved}/check-runs?filter=all", "check_runs")
    return summarize(repo, resolved, statuses, checks, required)


def main(argv=None, client=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, help="GitHub repository owner/name")
    parser.add_argument("--sha", help="Exact commit; defaults to the current default-branch commit")
    parser.add_argument("--required-check", action="append", default=[], help="Required status context or check name; repeat as needed")
    args = parser.parse_args(argv)
    try:
        report = inspect(args.repo, args.sha, args.required_check, client)
    except ReadinessError as error:
        print(json.dumps({"ready": False, "error": str(error)}, indent=2))
        return 2
    print(json.dumps(report, indent=2))
    return 0 if report["ready"] else 1


if __name__ == "__main__":
    sys.exit(main())
