# Benchmark Results

Store each run under:

```text
benchmarks/results/<run-id>/
├── result.json
├── ia-audit.md
├── component-reuse.md
└── end-to-end.md
```

## Run ID

Recommended:

```text
<provider>-<model>-<YYYYMMDD>-<short-id>
```

The directory name is an identifier, not a ranking label.

## Raw output rule

The Markdown files must preserve the raw agent output used for scoring.

Do not clean up, rewrite, or silently correct the output after generation.

## Official result requirements

An `official` result must:

- pin a 40-character repository commit SHA;
- use the exact suite version in `benchmarks/manifest.json`;
- include all canonical cases;
- preserve raw outputs;
- set `manual_edit` to `false`;
- pass `python3 scripts/validate_benchmarks.py`.

If any requirement is not met, mark the run `exploratory`.

## Scoring

Scores are reviewer-entered after the raw output is generated.

The reviewer should use:
- `benchmarks/rubric.md`;
- evaluator references declared in `benchmarks/manifest.json`.

The tested agent must not receive those evaluator materials during generation.

## Comparison

Do not compare aggregate scores without also checking:
- capability profile;
- repository commit;
- suite version;
- criterion-level failures;
- notes about context or tooling.

The benchmark is intended to reveal contract ambiguity and compatibility drift, not to produce a universal model leaderboard.
