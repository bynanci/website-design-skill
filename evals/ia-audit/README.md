# IA Audit Eval

This evaluation checks whether an agent identifies structural information-architecture problems before proposing visual or implementation changes.

## Contract

Given the fixture in `case-001/input.md`, a passing response should satisfy the behavioral expectations in `case-001/expected.md`.

The evaluator should focus on whether the reasoning is structurally correct, not whether the exact wording matches.

## Pass philosophy

A response does not need to reproduce the reference answer.

It should:
- detect the same class of taxonomy failures;
- preserve required source content;
- provide rationale for proposed grouping;
- avoid treating competitor conventions as proof;
- avoid jumping directly to UI styling or code.
