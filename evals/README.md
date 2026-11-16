# Evaluations

The goal of evals is to test redesign reasoning and system consistency, not visual taste alone.

## Evaluation model

Each behavioral case uses:

```text
input.md
→ agent response
→ expected.md
```

`expected.md` defines required behaviors and failure conditions. It is not an exact-output golden file.

This allows different agents to produce different wording or structures while still being evaluated against the same redesign principles.

## IA audit

Path:

`evals/ia-audit/`

Checks whether an agent identifies:

- mixed taxonomy;
- duplicated or ambiguous destinations;
- broken grouping logic;
- content-integrity risks;
- unsupported assumptions.

The agent should repair structure before moving into visual design or implementation.

## Component reuse

Path:

`evals/component-reuse/`

Checks whether an agent follows:

```text
Reuse → Extend → Variant → Compose → New
```

instead of creating page-specific near-duplicate components.

A strong response should justify every new component and account for responsive/accessibility implications when the missing pattern requires them.

## Content coverage

Content integrity is evaluated across the fixtures.

Important source content must receive an explicit destination or intentional removal decision.

## Design consistency

Future cases should verify that page-level work follows established tokens, patterns, and component contracts.

## Regression awareness

Future cases should verify that redesign changes do not accidentally remove:

- content;
- accessibility behavior;
- responsive behavior;
- essential interactions;
- established component responsibilities.

## Optional v0.2 pilot cases

- Responsive-layout pilot: preserve dense dashboard content and actions across
  desktop, narrow containers, zoom, keyboard and touch conditions.
- Accessibility pilot: trace reported keyboard/semantic/visual defects to
  reusable components and specify verifiable remediations.

These pairs are additional behavioral fixtures only. The official v0.1
benchmark suite and its 40-point manifest remain unchanged. Do not include
pilot expected responses or evaluator files in a v0.1 clean-run input.

## Adding a case

Create:

```text
evals/<track>/case-XXX/
├── input.md
└── expected.md
```

The repository validator fails if a discovered `case-*` directory is missing either file.

Prefer deterministic synthetic fixtures plus human-reviewable behavioral criteria.
