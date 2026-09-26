# Governance

Website Design Skill uses lightweight maintainer governance for a small open-source methodology project.

## Core and integrations

Core includes `SKILL.md`, `references/`, `templates/`, canonical `evals/`, canonical `benchmarks/`, and validation/release scripts. Core changes must remain platform-agnostic.

Environment-specific guidance belongs under `integrations/` and must remain optional.

## Decision criteria

Changes are judged by:

1. portability
2. evidence integrity
3. clarity
4. reuse
5. testability
6. backward compatibility
7. maintenance cost

Prefer rules that address recurring redesign failure modes over one-off preferences.

## Change classes

Documentation clarifications normally need no new evaluation.

Backward-compatible methodology additions should add evaluation coverage when they introduce important expected behavior.

Core behavioral changes require rationale, affected-contract analysis, evaluation updates, benchmark-suite review, and versioning review.

## Benchmark integrity

Official benchmark evidence must follow the clean-run protocol. Raw outputs stay unchanged before scoring. Contaminated contexts and runner-access failures do not count as official compatibility evidence.

Repeated failure of the same criterion across independent clean runs is a reason to review the core contract before adding environment-specific workarounds.

## Releases

A release is tagged only after the policy in `RELEASE.md` and `benchmarks/release-policy.json` is satisfied.

## Deprecation

Before removing or incompatibly changing a public artifact contract:

1. document the affected contract
2. provide a migration path
3. update `CHANGELOG.md`
4. apply Semantic Versioning
5. update validation and evaluation coverage

## Resolving ambiguity

When alternatives conflict, prefer the option that preserves platform independence, has clearer observable behavior, is easier to evaluate, and introduces less irreversible complexity.

When evidence is insufficient, document uncertainty instead of forcing it into the core contract.
