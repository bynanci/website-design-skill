# Cross-Agent Compatibility Benchmarks

This directory defines a reproducible protocol for testing the same Website Design Skill across different agent environments.

The benchmark layer may record concrete agent, model, or platform names in result metadata. The core `SKILL.md` remains platform-agnostic.

## Purpose

Cross-agent testing answers four questions:

1. Does the agent start from the correct workflow layer?
2. Does it preserve evidence and content integrity?
3. Does it follow component reuse governance?
4. Does it interpret the same artifact contracts consistently?

This is a compatibility benchmark, not a visual-taste leaderboard.

## Benchmark inputs

The initial suite references existing deterministic fixtures:

- `evals/ia-audit/case-001/`
- `evals/component-reuse/case-001/`
- `examples/end-to-end-b2b/`

See `manifest.json` for the canonical suite definition.

## Run protocol

For every run:

1. Pin the repository commit SHA.
2. Load the repository's `SKILL.md`.
3. Allow the skill to load repository references/templates normally.
4. Provide only the input files declared by the case.
5. Do not provide the expected-output contract to the tested agent.
6. Do not manually edit the agent output before evaluation.
7. Record which capabilities were available.
8. Save raw output separately from the scored result.
9. Evaluate against the rubric after generation.
10. Record deviations, ambiguity, and tool limitations.

## Capability profile

Record capabilities as booleans or short notes:

- repository_read
- repository_write
- web_research
- browser_render
- image_generation
- code_execution
- persistent_context
- other

A run with fewer capabilities is still valid if the case does not require them.

## Context policy

The benchmark should test the skill, not hidden prompt engineering.

Allowed:

- repository `SKILL.md`;
- files explicitly referenced by the skill;
- benchmark case input;
- minimal instruction to execute the case.

Not allowed:

- private corrective hints;
- hidden expected answers;
- manually inserted design conclusions;
- changing the fixture per agent.

## Output preservation

Recommended structure:

```text
benchmarks/results/<run-id>/
├── result.json
├── ia-audit.md
├── component-reuse.md
└── end-to-end.md
```

Raw outputs are evidence. Do not replace them with summaries.

## Scoring

Use `rubric.md`.

Each criterion is scored:

- `0` — fails or contradicts the contract;
- `1` — partially satisfies / ambiguous;
- `2` — clearly satisfies.

Do not award points for verbosity or aesthetic preference.

## Interpretation

A compatibility problem exists when multiple agents repeatedly misunderstand the same contract.

That usually indicates a problem in:

- `SKILL.md`;
- a reference document;
- a template;
- fixture ambiguity;
- evaluator wording.

Do not immediately add platform-specific instructions to core.

First ask whether the contract itself can be made clearer in a platform-agnostic way.

## Official vs local runs

A result is only an official repository benchmark result when:

- the exact core commit is recorded;
- the suite version is recorded;
- raw outputs are preserved;
- the result validates against repository rules;
- no post-generation manual correction occurred.

Local exploratory runs may still be useful but must be labeled `exploratory`.
