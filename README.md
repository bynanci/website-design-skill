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
5. Preserve the generated artifacts so later agents or contributors can continue from explicit state.

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
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
├── references/
├── templates/
├── examples/
├── evals/
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

## Example

A synthetic B2B SaaS example is available under:

`examples/saas-analytics/`

It demonstrates:

```text
current sitemap
→ structural audit
→ navigation comparison
→ homepage specification
→ content coverage
→ component mapping
```

The example intentionally contains mixed taxonomy so the reasoning can be inspected.

## Evaluations

The first behavioral fixture is:

`evals/ia-audit/case-001/`

It checks that an agent:

- detects mixed taxonomy;
- explains the user impact;
- preserves required content;
- distinguishes evidence from assumption;
- does not jump directly to styling or code.

The goal is behavioral consistency, not exact-output matching.

## Validation

Run the zero-dependency repository validator:

```bash
python3 scripts/validate_skill.py
```

The same validator runs in CI on pushes to `main` and pull requests.

It currently verifies:

- required v0.1 artifacts exist;
- `SKILL.md` has required frontmatter;
- local references used by `SKILL.md` resolve;
- the core skill does not accidentally name selected tool/platform-specific products;
- README and LICENSE remain aligned.

## Status

**v0.1 foundation in progress.**

The core methodology, first reusable templates, one synthetic example, one IA evaluation fixture, and repository validation are now present.

Before calling v0.1 stable, the next priorities are:

- add a component-reuse evaluation;
- add at least one full end-to-end redesign fixture;
- refine output contracts based on cross-agent runs;
- document compatibility without moving platform-specific behavior into the core.

See [SKILL.md](./SKILL.md) for the agent operating contract.

## License

MIT.
