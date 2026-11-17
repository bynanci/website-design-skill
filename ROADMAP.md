# Roadmap

[繁體中文版本](ROADMAP.zh-TW.md)

Website Design Skill is developed as a platform-agnostic redesign methodology with explicit artifact contracts and behavioral evaluation.

The roadmap separates **core contract stability** from **optional ecosystem integrations** so adoption can grow without coupling the skill to a specific model, design tool, frontend framework, CMS, or hosting platform.

## Current integration work — Context-aware UI collaboration

The integration layer is proposed to become a UI collaborator that understands
the existing project's design system, components, state/API ownership and edit
boundaries. The [architecture](integrations/context-aware-ui/README.md) defines
five capability contracts: token/component fit, AST-guided patches, applicable
state transitions, bounded responsive repair and declarative runtime UI.

Start with inspectable project context and one Vue adapter. Generalize across
frameworks after shared contracts survive independent adapter fixtures. Dynamic
runtime UI is a separate P2 experiment with a host-controlled registry and
fallback, not a prerequisite for design-time adoption.

The [Issue #8 umbrella](https://github.com/bynanci/website-design-skill/issues/8) is an index only. Child issues #11–#15 are the source of truth for scope and acceptance criteria.

Release gates remain independently verifiable. Main contains the bilingual contracts, portable profile schema and read-only inventory. Issue #11 now has a synthetic Vue fixture, bounded AST/source inspection, an explicit semantic-role contract, source/API ownership checks, scoped drift checks and a production-build/theme-render harness. The [pilot guide](integrations/vue-project-profile/README.md) defines its supported syntax and evidence. CI and Issue #11 record the actual verification results.

The scoped Vue pilots #11–#13 and runtime recovery #15 are implemented on main. Recovery uses strict data validation, host-issued one-use actions, text-only rendering and a static fallback. Its actual browser/build evidence is recorded in #15; live model transport remains unrun.

The optional PR #5 preview contains the reusable eight-group dashboard, a 32-condition matrix and separate actual 200% native-window captures (#7). Issue #14 adds one source-preserving CSS restoration operation, at most two patch/recheck iterations, frozen source/runtime evidence and finite time/process/capture limits. The same dashboard runner measures its passing reference, injected failing baseline and candidates; it does not provide general CSS repair. Dated bilingual evidence records identify the actual acceptance state.

Issue #6 now has isolated versioned packets, a criterion rubric, strict result validation and integrity tests. It still has zero independent results. Issue #1 also requires two eligible clean agent signatures. Draft PR #5 remains under those independent release gates; implementation and browser tests do not replace them.

## Deployment and external checks

[Issue #29](https://github.com/bynanci/website-design-skill/issues/29) tracks the incorrect Vite tooling root, duplicate Vercel projects and provider rate limits. The explicit static showcase build and production-output smoke are separate from core release readiness. Inspect external deployment statuses as well as GitHub Actions; only an actual source-bound READY deployment can close that acceptance item. See [deployment operations](docs/DEPLOYMENT.md).

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

### v0.2 opt-in pilot artifacts

The first optional preview defines inspectable output contracts for visual
direction comparison, responsive/container/zoom behavior, and design-token
extraction; it also includes a synthetic dashboard example and new behavioral
pilot cases for responsive layout and accessibility.

They are **not** required by the v0.1 skill, do **not** change canonical
v0.1 benchmark inputs or rubric, and must not be scored as official v0.1
compatibility evidence. The isolated v0.2 rubric and packets are versioned
separately under #6. Broader fixtures, future criterion changes and core routing
changes require their own versioned decisions and release review.

## v0.3 — Interoperability and adapters

Goal: make the core easier to adopt in different environments without moving platform-specific logic into the core skill.

Candidate work:

- documented adapter contract under `integrations/`;
- scoped project profiles with token/component provenance and state/API ownership;
- project-aware Vue 3 + SCSS guidance, with Tauri desktop behavior kept optional;
- AST-guided edits with revision checks, protected regions and idempotence;
- applicable UI state/transition contracts that reuse existing stores and services;
- a capability-gated browser-render / screenshot / visual-review loop with explicit evidence states;
- an MCP adapter contract that separates read-only inspection, patch proposals, bounded execution, and authorized writes;
- examples for repository-aware agents, visual/prototyping tools, and browser-capable research agents;
- research-dashboard and short-lived schema-driven UI pilots using synthetic or approved data;
- optional machine-readable artifact metadata;
- compatibility reports across a wider agent set.

These are optional integration candidates, not core defaults or implemented runtime features. The Vue/Tauri, visual-validation, and MCP contracts are tracked under `integrations/`. The OpenFilm-style editor, research CSV dashboard, and dynamic UI scenarios are examples for later pilots.

Adapters must remain optional. The core must still work using structured text artifacts when specialized capabilities are unavailable. An adapter may claim rendered, measured, visually reviewed, or applied results only when it preserves evidence from those actual operations.

## v0.4 — Quality and migration discipline

Goal: make redesign execution safer for larger existing systems.

Candidate work:

- bounded multi-condition repair with stopping, regression and rollback rules;
- token drift and state-transition regression evidence on real adapter fixtures;
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
