# Roadmap

Website Design Skill evolves as a platform-agnostic redesign methodology. Core contracts stay independent of any named AI model, design tool, frontend framework, CMS, or hosting provider.

## v0.1 — Public MVP

Goal: ship a small core that another agent can execute, inspect, and evaluate.

Required scope:

- `SKILL.md` with the phase router and operating rules
- reusable references and templates
- focused behavioral evals
- one complete end-to-end fixture
- benchmark protocol and result contract
- validation scripts and CI
- contribution, governance, security, versioning, and release guidance

Release criteria remain defined by `benchmarks/release-policy.json` and `RELEASE.md`. Until clean cross-agent evidence satisfies that gate, the repository remains a release candidate.

## v0.2 — Coverage

Focus on additional failure modes while keeping v0.1 contracts compatible.

Candidates:

- accessibility evaluation
- responsive-layout evaluation
- editorial/content-heavy fixture
- commerce/catalog IA fixture
- authenticated-product/dashboard fixture
- visual-direction comparison template
- responsive behavior template
- design-token extraction template

Rule: important new methodology should have either an explicit artifact contract or an evaluation path.

## v0.3 — Interoperability

Keep environment-specific behavior outside core.

Candidates:

- adapter contract under `integrations/`
- repository-aware agent examples
- visual/prototyping adapter examples
- browser/research adapter examples
- optional machine-readable artifact metadata
- broader compatibility reports

## v0.4 — Migration quality

Candidates:

- regression checklist
- component migration planning
- design-system drift review
- legacy one-off style audit
- content parity checks
- accessibility regression checks
- rollout and deprecation templates

## v1.0 — Stable contracts

Target conditions:

- repeated clean cross-agent evidence
- stable phase semantics
- stable required artifact contracts
- documented deprecation behavior
- backward-compatible validators
- multiple independent fixtures
- durable separation between core and integrations

## Prioritization

1. Fix ambiguous core contracts exposed by independent evaluation.
2. Improve evidence integrity and validation.
3. Add reusable artifacts that reduce recurring redesign failures.
4. Add representative fixtures and evals.
5. Add optional integrations.
6. Add convenience features only after reliability work.

## Non-goals

This project is not a component library, framework starter, hosted design application, or replacement for research, analytics, brand strategy, and stakeholder judgment.
