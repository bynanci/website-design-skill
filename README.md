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

## Repository structure

```text
.
├── SKILL.md
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
├── references/
├── templates/
├── examples/
├── evals/
└── integrations/
```

## Design principles

- Structure before styling
- System before pages
- Evidence before preference
- Preserve content integrity
- Reuse before invention
- Fix the highest reusable layer possible
- Keep the core tool- and platform-agnostic

## Status

This repository is in early development. The current goal is to establish a small, testable v0.1 core before adding tool-specific adapters.

See [SKILL.md](./SKILL.md) for the agent operating contract.

## License

Apache-2.0.
