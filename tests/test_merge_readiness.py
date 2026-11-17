"""Regression proof that green Actions cannot hide a failed external deployment."""
import contextlib
from io import StringIO
import json
from urllib.error import HTTPError
from urllib.parse import parse_qs, urlparse
import unittest
from unittest import mock

from scripts import check_merge_readiness as guard

REPO = "owner/repository"
SHA = "a" * 40


def status(identifier, state="success", context="Vercel – project", **changes):
    return {"id": identifier, "context": context, "state": state,
            "url": f"https://api.github.com/repos/{REPO}/statuses/{SHA}",
            "description": "Deployment ready", "target_url": "https://example.invalid/deployment", **changes}


def check(identifier, conclusion="success", name="validate", app_id=1, app="github-actions", **changes):
    return {"id": identifier, "head_sha": SHA, "name": name, "status": "completed", "conclusion": conclusion,
            "app": {"id": app_id, "slug": app}, "check_suite": {"id": 10}, "html_url": "https://example.invalid/check", **changes}


class FakeClient:
    def __init__(self, statuses=(), checks=()):
        self.status_pages = [list(statuses)]
        self.check_pages = [list(checks)]
        self.calls = []
        self.commit_sha = SHA

    def get(self, endpoint):
        self.calls.append(endpoint)
        parsed = urlparse(endpoint)
        if parsed.path == f"/repos/{REPO}":
            return {"default_branch": "main"}, {}
        if parsed.path in {f"/repos/{REPO}/commits/{SHA}", f"/repos/{REPO}/commits/main"}:
            return {"sha": self.commit_sha}, {}
        number = int(parse_qs(parsed.query).get("page", ["1"])[0])
        collection = self.status_pages if parsed.path.endswith("/statuses") else self.check_pages
        rows = collection[number - 1] if number <= len(collection) else []
        headers = {"link": '<https://untrusted.invalid/do-not-follow>; rel="next"'} if number < len(collection) else {}
        if parsed.path.endswith("/statuses"):
            return rows, headers
        return {"total_count": sum(map(len, collection)), "check_runs": rows}, headers


class MergeReadinessTests(unittest.TestCase):
    def run_cli(self, client, *extra):
        output = StringIO()
        with contextlib.redirect_stdout(output):
            code = guard.main(["--repo", REPO, "--sha", SHA, *extra], client=client)
        return code, json.loads(output.getvalue())

    def test_green_actions_and_red_vercel_cannot_be_ready(self):
        quota = status(4, "failure", description="Deployment rate limited — retry in 24 hours.", target_url="https://vercel.com/team?upgradeToPro=build-rate-limit")
        code, report = self.run_cli(FakeClient([quota], [check(5)]))
        self.assertEqual(code, 1)
        self.assertFalse(report["ready"])
        self.assertTrue(report["github_actions"][0]["passed"])
        self.assertFalse(report["commit_statuses"][0]["passed"])
        self.assertEqual(report["blocking"][0]["category"], "vercel_build_rate_limit")

    def test_successful_preview_comments_do_not_override_failed_deployment(self):
        client = FakeClient([status(1, "failure")], [check(2), check(3, name="Vercel Preview Comments", app_id=2, app="vercel")])
        code, report = self.run_cli(client)
        self.assertEqual(code, 1)
        self.assertTrue(report["external_checks"][0]["passed"])
        self.assertFalse(report["commit_statuses"][0]["passed"])

    def test_later_context_success_supersedes_historical_failure_regardless_of_order(self):
        code, report = self.run_cli(FakeClient([status(9), status(3, "failure")], [check(4)]))
        self.assertEqual(code, 0)
        self.assertEqual(report["commit_statuses"][0]["id"], 9)
        self.assertEqual(report["observed_history"]["statuses"], 2)

    def test_newest_rerun_is_selected_within_the_same_suite_name_and_app(self):
        client = FakeClient([], [check(2), check(1, "failure"), check(3, "failure", app_id=2, app="external")])
        code, report = self.run_cli(client)
        self.assertEqual(code, 1)
        self.assertEqual(report["github_actions"][0]["id"], 2)
        self.assertEqual(report["external_checks"][0]["id"], 3)
        self.assertEqual(len(report["blocking"]), 1)

    def test_successful_independent_workflow_cannot_hide_failed_same_named_job(self):
        client = FakeClient([], [check(1, "failure", check_suite={"id": 10}), check(2, check_suite={"id": 20})])
        code, report = self.run_cli(client, "--required-check", "validate")
        self.assertEqual(code, 1)
        self.assertEqual(len(report["github_actions"]), 2)
        self.assertEqual(report["blocking"][0]["suite_id"], 10)
        self.assertEqual(report["missing_required_checks"], [])

    def test_missing_or_invalid_suite_identity_fails_closed(self):
        for suite in (None, {}, {"id": None}, {"id": True}, {"id": 0}):
            with self.subTest(suite=suite):
                client = FakeClient([], [check(1, "failure", check_suite=suite), check(2)])
                code, report = self.run_cli(client)
                self.assertEqual(code, 2)
                self.assertFalse(report["ready"])
                self.assertIn("check-suite identity", report["error"])

    def test_duplicate_names_in_two_apps_both_have_to_pass(self):
        code, report = self.run_cli(FakeClient([], [check(1), check(2, app_id=2, app="other")]), "--required-check", "validate")
        self.assertEqual(code, 0)
        self.assertEqual(len(report["github_actions"]), 1)
        self.assertEqual(len(report["external_checks"]), 1)

    def test_missing_required_external_context_is_not_success(self):
        code, report = self.run_cli(FakeClient([], [check(1)]), "--required-check", "validate", "--required-check", "Vercel – expected-project")
        self.assertEqual(code, 1)
        self.assertEqual(report["missing_required_checks"], ["Vercel – expected-project"])

    def test_empty_status_and_check_arrays_never_claim_green(self):
        code, report = self.run_cli(FakeClient())
        self.assertEqual(code, 1)
        self.assertFalse(report["ready"])
        self.assertEqual(report["blocking"][0]["kind"], "missing-evidence")

    def test_every_non_successful_status_stops_readiness(self):
        for state in ("failure", "error", "pending", None):
            with self.subTest(state=state):
                code, _ = self.run_cli(FakeClient([status(1, state)], [check(2)]))
                self.assertEqual(code, 1)

    def test_failed_cancelled_and_unexecuted_checks_stop_readiness(self):
        for conclusion in ("failure", "timed_out", "action_required", "cancelled", "stale", "skipped", "neutral", None):
            with self.subTest(conclusion=conclusion):
                code, _ = self.run_cli(FakeClient([], [check(1, conclusion)]))
                self.assertEqual(code, 1)
        code, _ = self.run_cli(FakeClient([], [check(1, status="in_progress")]))
        self.assertEqual(code, 1)

    def test_all_status_and_check_pages_are_read_without_following_link_host(self):
        client = FakeClient()
        client.status_pages = [[status(1, "failure")], [status(2)]]
        client.check_pages = [[check(3, "failure")], [check(4)]]
        report = guard.inspect(REPO, SHA, client=client)
        self.assertTrue(report["ready"])
        self.assertEqual(report["observed_history"], {"statuses": 2, "check_runs": 2})
        self.assertTrue(any("filter=all" in call and "page=2" in call for call in client.calls))
        self.assertFalse(any("untrusted.invalid" in call for call in client.calls))

    def test_excessive_pagination_is_refused_instead_of_truncated(self):
        client = FakeClient()
        client.status_pages = [[status(1)], [status(2)], [status(3)]]
        with self.assertRaisesRegex(guard.ReadinessError, "page limit"):
            guard.pages(client, f"/repos/{REPO}/commits/{SHA}/statuses", max_pages=2, page_size=1)

    def test_duplicate_page_evidence_is_refused(self):
        client = FakeClient()
        client.status_pages = [[status(1)], [status(1)]]
        with self.assertRaisesRegex(guard.ReadinessError, "repeated"):
            guard.inspect(REPO, SHA, client=client)

    def test_missing_page_metadata_cannot_hide_check_runs(self):
        class Incomplete(FakeClient):
            def get(self, endpoint):
                if "/check-runs?" in endpoint:
                    return {"total_count": 2, "check_runs": [check(1)]}, {}
                return super().get(endpoint)
        code, report = self.run_cli(Incomplete())
        self.assertEqual(code, 2)
        self.assertIn("incomplete", report["error"])

    def test_resolved_commit_and_each_check_must_match_requested_sha(self):
        client = FakeClient()
        client.commit_sha = "b" * 40
        code, report = self.run_cli(client)
        self.assertEqual(code, 2)
        self.assertIn("exact commit", report["error"])
        code, report = self.run_cli(FakeClient([], [check(1, head_sha="b" * 40)]))
        self.assertEqual(code, 2)
        self.assertIn("another commit", report["error"])

    def test_status_identity_cannot_come_from_another_repository_or_commit(self):
        for url in (f"https://api.github.com/repos/wrong/repository/statuses/{SHA}", f"https://api.github.com/repos/{REPO}/statuses/{'b' * 40}"):
            with self.subTest(url=url):
                code, report = self.run_cli(FakeClient([status(1, url=url)]))
                self.assertEqual(code, 2)
                self.assertFalse(report["ready"])

    def test_default_branch_is_resolved_once_to_an_exact_sha(self):
        client = FakeClient([], [check(1)])
        report = guard.inspect(REPO, client=client)
        self.assertEqual(report["sha"], SHA)
        self.assertEqual(client.calls[:2], [f"/repos/{REPO}", f"/repos/{REPO}/commits/main"])
        self.assertTrue(all(SHA in call for call in client.calls[2:]))

    def test_http_error_exits_nonzero_and_does_not_print_token_or_response(self):
        secret = "unit-test-secret-do-not-log"
        error = HTTPError("https://api.github.com", 403, secret, {}, None)
        with mock.patch.object(guard, "urlopen", side_effect=error):
            code, report = self.run_cli(guard.GitHubClient(token=secret))
        self.assertEqual(code, 2)
        self.assertFalse(report["ready"])
        self.assertIn("HTTP 403", report["error"])
        self.assertNotIn(secret, json.dumps(report))

    def test_invalid_repo_sha_or_blank_required_name_is_refused_before_network(self):
        for repo, sha, required in (("../bad", SHA, ()), (REPO, "main", ()), (REPO, SHA, (" ",))):
            client = FakeClient()
            with self.assertRaises(guard.ReadinessError):
                guard.inspect(repo, sha, required, client)
            self.assertEqual(client.calls, [])


if __name__ == "__main__":
    unittest.main()
