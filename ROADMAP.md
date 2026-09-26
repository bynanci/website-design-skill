# Roadmap

Website Design Skill is developed as a platform-agnostic redesign methodology with explicit artifact contracts and behavioral evaluation.

The roadmap separates **core contract stability** from **optional ecosystem integrations** so adoption can grow without coupling the skill to a specific model, design tool, frontend framework, CMS, or hosting platform.

## v0.1 — Minimum viable public release

Goal: publish a small, defensible core that another agent can understand, execute, inspect, and evaluate.

### Included

- platform-agnostic `SKILL.md`
- phase-based redesign workflow
- information architecture guidance
- component architecture guidance
- reusable project/page/navigation/content/component templates
- focused behavioral eval fixtures
- end-to-end redesign example
- cross-agent benchmark protocol
- validation scripts and CI
- contribution, governance, security, versioning, and release policies

### Release gate

v0.1 is ready only when:

- repository validators pass;
- at least two clean official benchmark runs exist;
- at least two distinct agent signatures are represented;
- every official run meets the release score threshold;
- no shared zero-score criterion indicates an unresolved core-contract ambiguity.

Until those gates pass, the repository remains a release candidate rather than a tagged public release.

## v0.2 — Broader redesign coverage

Goal: improve coverage without breaking the v0.1 artifact contracts.

Candidate work:

- accessibility-focused evaluation cases;
- responsive-layout evaluation cases;
- content-heavy / editorial redesign fixture;
- commerce or catalog information-architecture fixture;
- dashboard / authenticated-product redesign fixture;
- stronger content migration and deletion-decision guidance;
- visual-direction comparison template;
- responsive behavior template;
- design-token extraction template;
- additional validation for artifact completeness and cross-link integrity.

Acceptance principle:

> New methodology should be accompanied by a concrete artifact contract or an evaluation path.

## v0.3 — Interoperability and adapters

Goal: make the core easier to adopt in different environments without moving platform-specific logic into the core skill.

Candidate work:

- documented adapter contract under `integrations/`;
- examples for repository-aware agents;
- examples for visual/prototyping tools;
- examples for browser-capable research agents;
- optional machine-readable artifact metadata;
- compatibility reports across a wider agent set.

Adapters must remain optional. The core must still work using structured text artifacts when specialized capabilities are unavailable.

## v0.4 — Quality and migration discipline

Goal: make redesign execution safer for larger existing systems.

Candidate work:

- regression-oriented redesign checklist;
- component migration planning;
- design-system drift detection guidance;
- legacy CSS / one-off override audit;
- content parity checks;
- accessibility regression checks;
- change-scope and rollout strategy;
- migration/deprecation artifact templates.

## v1.0 — Stable public contract

Goal: declare the core workflow and artifact contracts stable enough for downstream reuse.

Expected conditions:

- repeated clean cross-agent evidence;
- stable core phase semantics;
- stable required artifact contracts;
- documented deprecation policy;
- backward-compatible validator behavior;
- multiple independent examples covering materially different website classes;
- clear separation between core methodology and integrations.

## Non-goals

The project does not aim to become:

- a frontend component library;
- a design-system package;
- a prompt marketplace;
- a framework-specific starter;
- a hosted design application;
- a replacement for user research, analytics, brand strategy, or stakeholder judgment.

## Prioritization

Prefer work in this order:

1. fix ambiguous core contracts exposed by independent evaluation;
2. improve evidence integrity and validation;
3. add reusable artifacts that reduce redesign failure modes;
4. add new representative fixtures/evals;
5. add optional ecosystem integrations;
6. add convenience features that do not improve behavioral reliability.

## Compatibility rule

A roadmap item belongs in core only when it can be expressed without requiring a named model, design application, frontend framework, CMS, or hosting provider.

Platform-specific behavior belongs under `integrations/`.
