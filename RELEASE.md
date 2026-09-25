# Release Process

The repository uses explicit release gates. A release is not considered ready because the documents look complete.

## v0.1 release gate

The canonical policy lives in:

`benchmarks/release-policy.json`

For v0.1, release readiness currently requires:

- at least 2 official benchmark runs;
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

The release-status command is diagnostic and exits successfully even when the release is not ready.

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
