# Website Design Skill

A platform-agnostic Agent Skill for systematically redesigning existing websites.

It helps AI agents move through:

```text
audit → information architecture → wireframe → visual direction
→ design system → components → implementation → validation
```

The project is intentionally independent of any specific AI model, design tool, frontend framework, CMS, or hosting platform.

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
- `benchmarks/rubric.md` — criterion-level 0/1/2 scoring
- `benchmarks/result.schema.json` — portable result contract
- `benchmarks/result.template.json` — starter result payload
- `benchmarks/release-policy.json` — machine-readable v0.1 release gate
- `benchmarks/compatibility-matrix.md` — accepted-run summary
- `benchmarks/results/` — raw outputs and scored results

The tested agent must not receive evaluator reference files or the rubric during generation.

No official cross-agent result is committed until the raw output and metadata pass repository validation.

## Validation

Run:

```bash
python3 scripts/validate_skill.py
python3 scripts/validate_benchmarks.py
python3 scripts/release_status.py
```

All three commands run in CI. The first two are hard validators; `release_status.py` reports readiness without failing while official clean runs are still missing.

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

## Status

**v0.1 release candidate infrastructure.**

The methodology, artifacts, behavioral evals, end-to-end fixture, benchmark protocol, result contract, release gate, and CI enforcement are now present.

No official cross-agent runs are claimed yet. The repository should remain untagged until clean runs satisfy the release policy.

See [SKILL.md](./SKILL.md) for the agent operating contract.

## License

MIT.
