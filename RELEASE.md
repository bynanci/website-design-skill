# Release Process

The repository uses explicit release gates. A release is not considered ready because the documents look complete.

## v0.1 release gate

The canonical policy lives in:

`benchmarks/release-policy.json`

For v0.1, release readiness currently requires:

- at least 2 official benchmark runs;
- every official run uses the exact frozen commit declared in `benchmarks/release-policy.json`;
- raw evidence is non-empty, stays in its own run directory, and cannot be shared across benchmark cases;
- at least 2 distinct agent signatures;
- each official run scores at least 30/40;
- all official runs use benchmark suite `0.1.0`;
- all official runs have `manual_edit=false`;
- no criterion receives a score of 0 from two or more official runs;
- repository skill validation passes;
- benchmark validation passes.

A repeated zero-score criterion is treated as evidence that the core contract or fixture may be ambiguous. Fix the platform-agnostic contract first, then re-run clean benchmarks.

## Check current readiness

Run:

```bash
python3 scripts/validate_skill.py
python3 scripts/validate_benchmarks.py
python3 scripts/release_status.py
```

The release-status command is diagnostic and exits successfully when valid evidence exists but the release is not ready. It first validates benchmark evidence and exits nonzero for malformed evidence, even without `--require-ready`.

To use it as a hard gate:

```bash
python3 scripts/release_status.py --require-ready
```

## Release candidate procedure

1. Freeze the benchmark suite version.
2. Pin the exact core commit used for clean runs.
3. Collect official runs under `benchmarks/results/`.
4. Validate raw outputs and result metadata.
5. Review shared criterion failures.
6. If a shared failure indicates contract ambiguity, fix core and repeat the affected clean runs.
7. Run the hard release gate.
8. Update `CHANGELOG.md`.
9. Create the version tag only after all gates pass.
10. Publish release notes describing:
   - core methodology status;
   - benchmark suite version;
   - compatibility evidence;
   - known limitations;
   - breaking-contract risks for the next version.

## Reviewed release requests

The `Publish reviewed release` workflow publishes a versioned request merged into
main. It uses GitHub's short-lived repository token; maintainers do not need to
provide a personal token or sign in through an automation browser. Only the publish
job has `contents: write`. Read-only candidate checks use `checks: read` and
`statuses: read`; no secret, OIDC or workflow-write permission is requested.

Publication has two steps:

1. Merge release infrastructure and final GitHub-ready notes. Wait for the exact
   main candidate's validation, browser smoke and canonical Vercel status to pass.
   The candidate's frozen benchmark evidence must also pass the hard release gate.
2. Add `.github/release-requests/v0.1.0.json` in a separate reviewed change. Set
   `candidate_sha` to that prior full commit SHA and `notes_sha256` to the SHA-256
   of its tracked UTF-8 `docs/releases/v0.1.0.github.md` file. Merge the request only
   after its read-only validation passes.

```json
{
  "tag": "v0.1.0",
  "candidate_sha": "FULL_40_CHARACTER_CANDIDATE_SHA",
  "notes_path": "docs/releases/v0.1.0.github.md",
  "notes_sha256": "FULL_64_CHARACTER_NOTES_SHA256"
}
```

The example contains placeholders and is not a valid publish request. The runner
accepts one new versioned request per change and rejects edits, deletions, unknown
fields, abbreviated SHAs, symlinks, relative release-body links and mismatched
notes hashes. The candidate must be an ancestor of current main and precede the
request commit. Its workflow tree must equal current main's workflow tree: GitHub's
repository token cannot create releases whose target changes workflow files
relative to the default branch. See [GitHub's release API permission rule](https://docs.github.com/en/rest/releases/releases#create-a-release).

The runner reuses the unchanged repository validators and exact-commit readiness
inspector. It requires successful real Actions `validate` and `smoke` checks plus
`Vercel – vue-project-profile`, with every other observed context also successful.
Because the publication target precedes its request, the publisher does not wait
on its own running job. A moved main branch stops publication before mutation.

An existing tag or published release is accepted only when it has the requested
commit and exact notes body. Conflicting tags, draft/prerelease states or body
changes stop the process; the workflow never force-moves tags or overwrites a
public release. API errors stop without automatic retry. After a timeout or partial
failure, inspect the remote tag and release before requesting another attempt.
Repeated execution of an identical completed request is a verified no-op.

Pull requests run boundary tests and read-only request validation. Only a push to
main that adds a request can publish. A token-created tag/release does not trigger
additional workflows automatically; all required tests run before publication.
The initial supported release policy is the existing v0.1 line; other lines need
an explicit policy and version review.

## Versioning

Use Semantic Versioning for public artifact contracts.

### Patch

Use for:
- wording clarification that does not alter behavior;
- typo fixes;
- validator bug fixes that do not change contracts;
- documentation corrections.

### Minor

Use for:
- new optional references/templates;
- new backward-compatible evals;
- new benchmark cases;
- new optional integrations;
- new component/design methodology that preserves existing contracts.

### Major

Use when changing:
- core workflow semantics;
- required artifact contracts;
- benchmark result format incompatibly;
- phase responsibilities in a way that breaks existing consumers.

## Benchmark version vs release version

The skill release version and benchmark suite version are related but not identical.

A skill release may update without changing the benchmark suite when behavioral contracts remain compatible.

Increment the benchmark suite when canonical cases, scoring criteria, or expected behavior change materially.

## No self-certification from contaminated context

A benchmark run is not official when the tested agent has already seen:
- expected answers;
- evaluator references;
- rubric scoring criteria for the same cases;
- another agent's scored outputs used as hints.

Such runs may be preserved as `exploratory` only.
