# Contributing

Thanks for helping improve Website Design Skill.

## Contribution principles

Contributions should strengthen at least one of:

- portability across tools and agents
- clarity of the redesign workflow
- artifact quality
- validation quality
- testability
- accessibility
- maintainability

Avoid introducing mandatory dependencies on a specific AI model, design tool, framework, CMS, or hosting provider.

## Before proposing a change

Ask:

1. Is this a core methodology change or a platform-specific adapter?
2. Can the change be expressed as a reusable rule instead of a one-off preference?
3. Does it preserve existing artifact contracts?
4. Can it be evaluated?
5. Does it create unnecessary component/process complexity?

## Pull requests

A useful PR should explain:

- problem
- proposed change
- why the change belongs in core or an integration
- affected artifacts
- validation performed
- compatibility implications

For methodology changes, include or update an evaluation fixture when practical.

## Benchmark result contributions

Cross-agent benchmark submissions belong under:

```text
benchmarks/results/<run-id>/
```

Before submitting a result:

1. pin the exact repository commit used by the tested agent;
2. use the suite version from `benchmarks/manifest.json`;
3. follow `benchmarks/runner-instruction.md`;
4. keep evaluator references and the rubric hidden from the tested agent;
5. preserve raw outputs without cleanup;
6. set `manual_edit=false` for official runs;
7. score after generation using `benchmarks/rubric.md`;
8. run both repository validators.

Do not submit an official run from a context that already saw the expected answers.

If a run is useful but not clean/reproducible, mark it `exploratory`.

## Scope

Use:
- `SKILL.md` for concise agent operating rules;
- `references/` for deeper methodology;
- `templates/` for reusable artifacts;
- `examples/` for inspectable workflows;
- `evals/` for behavioral validation;
- `benchmarks/` for cross-agent compatibility protocol and results;
- `integrations/` for platform-specific adapters.

Keep the core small.
