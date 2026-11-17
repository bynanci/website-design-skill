# Website Design Skill

[繁體中文](README.zh-TW.md)

A platform-agnostic Agent Skill for systematically redesigning existing websites.

It helps AI agents move through:

```text
audit → information architecture → wireframe → visual direction
→ design system → components → implementation → validation
```

The project is intentionally independent of any specific AI model, design tool, frontend framework, CMS, or hosting platform.

## Documentation languages

English and Traditional Chinese versions are available for the README, core skill, roadmap, change history, reference guides, templates, and optional UI-adapter contracts. Benchmark inputs, expected outputs, scoring rubric, raw evidence, and repository policy documents remain canonical English in this localization pass. English uses clear technical prose informed by ASD-STE100 Issue 9 where applicable; this repository does not claim formal compliance. ASD-STE100 does not define Traditional Chinese compliance. See [the bilingual writing policy](docs/WRITING-STYLE.md).

## Context-aware UI collaboration

The optional [integration architecture](integrations/context-aware-ui/README.md) connects project tokens, reusable components, state/API ownership and bounded source edits. Scoped Vue inspection, track-reorder editing, media transitions and declarative recovery now have executable fixtures and browser evidence on main. The v0.2 preview adds the rendered dashboard and one reviewed CSS restoration operation. Each capability has explicit syntax, host and evidence limits; other frameworks require separate adapters.

[Issue #8](https://github.com/bynanci/website-design-skill/issues/8) records these completed pilots. The 2026-11-17 evidence snapshot for the v0.1 benchmark gate in #1 contains two reviewed official runs. The separate [v0.2 pilot in #6](https://github.com/bynanci/website-design-skill/issues/6) has two completed, independently reviewed and validated runs merged in [PR #33](https://github.com/bynanci/website-design-skill/pull/33): GPT-6 scores 36/36 and GPT-5.6 Sol scores 33/36. GPT-5.6 Sol receives partial scores on AX-01, AX-02 and AX-03; neither run has a critical error. Issue #6 records its publication and merge state. Deployment is tracked separately in [#29](https://github.com/bynanci/website-design-skill/issues/29).

## Build the static showcase

```sh
node site/build.mjs
python3 -m http.server 8000 --directory dist
```

The builder uses Node built-ins and an explicit public-asset allowlist. It publishes the bilingual skill/documentation landing page and includes the synthetic dashboard only when its complete fixture is present. The optional Vue inspection/test directory is not a Vite application entry. Use repository root and the explicit [deployment guide](docs/DEPLOYMENT.md).

A successful GitHub Actions run does not establish a successful external deployment. Before merging, inspect all statuses and check runs for the exact candidate:

```sh
python3 scripts/check_merge_readiness.py --repo bynanci/website-design-skill --sha <full-commit-sha> --required-check validate
```

For a candidate expected to deploy on Vercel, also require `--required-check 'Vercel – vue-project-profile'`. The report fails on unsuccessful, pending, missing or incomplete evidence; it does not change provider statuses or repository protection rules.

## What this is

- A repeatable website-redesign operating system for AI agents
- A set of explicit workflow gates and reusable artifacts
- A methodology for turning redesign decisions into maintainable systems
- A foundation for cross-agent evaluation and contribution

## What this is not

- A UI framework
- A website template
- A prompt collection
- A tool-specific workflow
- A replacement for product, brand, or stakeholder judgment

## Core workflow

1. **Discover** — understand goals, users, content, constraints, and the existing site.
2. **Structure** — audit and redesign information architecture and navigation.
3. **Wireframe** — define page hierarchy and content flow before visual styling.
4. **Explore** — evaluate visual directions without changing the locked structure.
5. **Systemize** — extract design tokens, patterns, and component contracts.
6. **Implement** — compose pages from the system using the project's existing stack.
7. **Validate** — verify content coverage, consistency, responsiveness, and accessibility.

## Quick start

1. Load or install `SKILL.md` using the mechanism supported by your agent environment.
2. Provide the existing website, sitemap, content, repository, or other available project evidence.
3. State the redesign goal and constraints.
4. Let the skill start from the earliest unstable layer instead of forcing a visual redesign immediately.
5. Preserve generated artifacts so later agents or contributors can continue from explicit state.

For information-architecture work, the skill routes to:

- `references/information-architecture.md`
- `templates/navigation-comparison.md`

For page work:

- `templates/page-spec.md`
- `templates/content-coverage.md`

For reusable component work:

- `references/component-architecture.md`
- `templates/component-contract.md`

## Repository structure

```text
.
├── .github/
│   └── workflows/
├── SKILL.md
├── README.md
├── RELEASE.md
├── ROADMAP.md
├── GOVERNANCE.md
├── SECURITY.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
├── references/
├── templates/
├── examples/
├── evals/
├── benchmarks/
├── integrations/
└── scripts/
```

## Design principles

- Structure before styling
- System before pages
- Evidence before preference
- Preserve content integrity
- Reuse before invention
- Fix the highest reusable layer possible
- Keep the core tool- and platform-agnostic

## Examples

### Focused SaaS IA example

`examples/saas-analytics/`

Demonstrates:

```text
current sitemap
→ structural audit
→ navigation comparison
→ homepage specification
→ content coverage
→ component mapping
```

### End-to-end B2B fixture

`examples/end-to-end-b2b/`

Demonstrates:

```text
project context
→ current-site audit
→ information architecture
→ homepage specification
→ component mapping
→ implementation plan
→ validation
```

The fixture intentionally omits analytics, user research, and competitor evidence so unsupported assumptions are visible instead of silently invented.

## Optional v0.2 contracts (not part of the v0.1 release gate)

Three additional **opt-in** artifacts extend visual and responsive design work
without changing the frozen v0.1 core contract:

- [Visual direction comparison](templates/visual-direction-comparison.md)
- [Responsive behavior](templates/responsive-behavior.md)
- [Design token extraction / migration](templates/design-token-extraction.md)

The [visual quality reference](references/visual-quality.md) provides review
criteria. An [executable synthetic account dashboard](examples/responsive-dashboard/)
demonstrates the contracts, supported by [Chromium/axe-core QA evidence](examples/responsive-dashboard/output/qa-review-2026-11-17.md). Pilot behavioral cases cover
[responsive layout](evals/responsive-layout/) and
[accessibility](evals/accessibility/).

These are deliberately excluded from the official v0.1 40-point benchmark
manifest. Issue #7's scoped implementation is complete: eight reusable component
groups, a 32-condition acceptance matrix and an actual 200% native browser zoom
capture. [Issue #6](https://github.com/bynanci/website-design-skill/issues/6) is complete with two independent pilot runs and criterion-level reviews. These results remain separate from the v0.1 release gate. Physical-device, screen-reader and human task studies have not run.
The contracts are optional v0.2 additions tracked in [PR #5](https://github.com/bynanci/website-design-skill/pull/5); their evidence does not establish all-platform compatibility or production UX efficacy. Automated accessibility
observations apply only to the recorded synthetic specimen and runtime.

## Evaluations

Behavioral cases currently cover two independent failure modes.

### IA audit

`evals/ia-audit/case-001/`

Checks that an agent:

- detects mixed taxonomy;
- explains the user impact;
- preserves required content;
- distinguishes evidence from assumption;
- does not jump directly to styling or code.

### Component reuse

`evals/component-reuse/case-001/`

Checks that an agent follows:

```text
Reuse → Extend → Variant → Compose → New
```

and does not create page-specific duplicates when the existing component inventory already satisfies the responsibility.

The goal is behavioral consistency, not exact-output matching.

## Cross-agent compatibility

`benchmarks/` defines a reproducible compatibility suite for running the same skill and fixtures across different agent environments.

The initial suite contains:

| Case | Focus | Max |
|---|---|---:|
| IA Audit | workflow routing, taxonomy, evidence, content integrity | 12 |
| Component Reuse | inventory-first reuse and component restraint | 12 |
| End-to-End B2B | full artifact-chain discipline | 16 |
| **Total** |  | **40** |

Key files:

- `benchmarks/manifest.json` — canonical cases and suite version
- `benchmarks/runner-instruction.md` — standard test instruction
- `benchmarks/clean-run-packet.md` — frozen clean-run packet
- `benchmarks/runner-requirements.md` — runner eligibility contract
- `benchmarks/runner-matrix.md` — execution-environment availability
- `benchmarks/rubric.md` — criterion-level 0/1/2 scoring
- `benchmarks/result.schema.json` — portable result contract
- `benchmarks/result.template.json` — starter result payload
- `benchmarks/release-policy.json` — machine-readable v0.1 release gate
- `benchmarks/compatibility-matrix.md` — accepted compatibility results
- `benchmarks/results/` — raw outputs and scored results

Runner availability and skill compatibility are tracked separately. A subscription, connector, or raw-output retrieval failure is a runner problem and must not be scored as a skill failure.

The tested agent must not receive evaluator reference files or the rubric during generation.

As of 2026-11-17, two independently reviewed official runs pass repository validation: [GPT-6](benchmarks/results/chatgpt-web-gpt-6-v01-20261117/) and [GPT-5.6 Sol](benchmarks/results/chatgpt-web-gpt-5-6-sol-v01-20261117/), each scoring 40/40. These are two selected model labels on one product, ChatGPT web, not cross-vendor evidence. Each case used a fresh Temporary, Unpersonalized chat and a pinned input packet; no API key was used. See the [compatibility matrix](benchmarks/compatibility-matrix.md) for scores and evidence limits.

These formal UI runs preserve raw downloads, isolation records, metadata and separate criterion-level reviews. Informal manual tests do not qualify as official compatibility evidence.

## Validation

Run:

```bash
python3 scripts/validate_skill.py
python3 scripts/validate_benchmarks.py
python3 scripts/release_status.py
```

All three commands run in CI. The first two are hard validators. `release_status.py` validates evidence and reports readiness; use `--require-ready` to fail when the release gate is not met.

Validation covers:

- required v0.1 artifacts;
- `SKILL.md` frontmatter and local references;
- platform-agnostic core constraints;
- complete behavioral eval pairs;
- complete end-to-end artifact chain;
- benchmark manifest integrity;
- release-policy consistency;
- benchmark result-template consistency;
- benchmark score maxima and canonical cases;
- official result metadata;
- exact criterion score keys;
- preserved raw output paths;
- aggregate-score consistency.

## Release gate

The release procedure is documented in `RELEASE.md`.

For v0.1, the current gate requires:

- at least 2 official clean benchmark runs;
- at least 2 distinct agent signatures;
- at least 30/40 for every official run;
- suite version `0.1.0`;
- `manual_edit=false`;
- no criterion scored 0 by two or more official runs;
- both repository validators green.

Use the strict gate before tagging:

```bash
python3 scripts/release_status.py --require-ready
```

Release evidence is tracked in GitHub Issue #1.

## Project maintenance

- [ROADMAP.md](./ROADMAP.md) — public MVP and post-v0.1 roadmap
- [GOVERNANCE.md](./GOVERNANCE.md) — core boundaries, change classes, releases, and deprecation
- [SECURITY.md](./SECURITY.md) — repository security reporting policy
- [CONTRIBUTING.md](./CONTRIBUTING.md) — contribution and benchmark-result expectations
- [RELEASE.md](./RELEASE.md) — versioning and release procedure

Platform-specific adapters remain optional and outside the core methodology.

## Status

**[v0.1.0 is published](https://github.com/bynanci/website-design-skill/releases/tag/v0.1.0) (2026-11-18, Asia/Taipei). Optional v0.2 additions remain unreleased.**

The methodology, artifacts, behavioral evals, end-to-end fixture, benchmark protocol, result contract, release gate, and CI enforcement are now present.

The first external runner attempt established runner-availability evidence only: Replit Agent could not complete a reproducible run in the current environment because a narrowed retry required an active subscription. That attempt is not scored and does not count as compatibility evidence.

The strict local gate reports ready with two official runs, two distinct agent signatures, no failures and no warnings. Both runs evaluate suite `0.1.0` at frozen core commit `7d64090710ef20f1d24cea6b46199391d3c09c18`. Later adapters and tests on main are separate evidence and were not included in these benchmark inputs.

The [v0.1.0 release](https://github.com/bynanci/website-design-skill/releases/tag/v0.1.0) targets commit `e33c7414de44cf537c9a59113fd8f393352af5bc`. Its reviewed release request passed read-only validation before publication; the workflow verified the tag and exact release body. [Issue #1](https://github.com/bynanci/website-design-skill/issues/1) is closed. Later releases must follow the same exact-candidate checks in [RELEASE.md](RELEASE.md). [Deployment issue #29](https://github.com/bynanci/website-design-skill/issues/29) is closed: the accepted main and preview merge heads each have their own canonical READY deployment, matching source manifests and asset hashes, passing HTTP/browser checks and all-context readiness. The scheduled retry is paused. A later candidate must pass its own checks. See the [v0.1.0 release notes](docs/releases/v0.1.0.md) for the evidence scope and remaining work.

See [SKILL.md](./SKILL.md) for the agent operating contract.

## License

MIT.
