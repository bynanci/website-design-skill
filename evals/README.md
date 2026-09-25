# Evaluations

The goal of evals is to test redesign reasoning and system consistency, not visual taste alone.

Initial evaluation tracks:

## IA audit

Check whether an agent identifies:
- mixed taxonomy
- duplicated destinations
- ambiguous labels
- orphaned content
- excessive navigation depth

## Content coverage

Check whether important source content receives an explicit destination or intentional removal decision.

## Component reuse

Check whether an agent prefers:

```text
reuse → extend → variant → compose → new
```

instead of creating near-duplicate components.

## Design consistency

Check whether page-level work follows established tokens, patterns, and component contracts.

## Regression awareness

Check whether redesign changes accidentally remove content, accessibility behavior, responsive behavior, or essential interactions.

Future evals should include deterministic fixtures plus human-reviewed qualitative criteria.
