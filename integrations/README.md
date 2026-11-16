# Integrations

[繁體中文版本](README.zh-TW.md)

The core skill remains platform-agnostic. Optional adapters may translate its capability-based workflow into project- or tool-specific operations, but must not become dependencies of `SKILL.md` or redefine the methodology.

## Proposed architecture

[Context-aware UI collaboration](./context-aware-ui/README.md) connects the
portable methodology to a scoped project profile, semantic token/component
mapping, state transitions, bounded source edits and validation evidence.
Vue is the first proposed implementation target; React/Svelte support and
runtime rendering require their own evidence.

## Proposed adapter contracts

These documents specify adapter contracts. They do not imply an implemented generator, runner, server, or successful validation. A bounded read-only project-profile inspector is available at `scripts/inspect_project_profile.py`; its static findings remain candidates and do not establish semantic or runtime behavior.

- [Project profile and token mapping](./context-aware-ui/project-profile.md) — preserve source provenance, theme resolution, aliases and API/state ownership.
- [Applicable UI states](./context-aware-ui/state-contract.md) — specify transitions, recovery and cancellation at the existing owner.
- [AST-guided patching](./ast-patching/README.md) — locate supported syntax, preserve edit boundaries and refuse stale or ambiguous targets.
- [Declarative runtime UI](./runtime-ui/README.md) — propose a temporary panel using registered components/actions and a static fallback.
- [Vue 3 + SCSS + Tauri](./vue3-tauri/README.md) — inspect the target repository before mapping aliases, component paths, and desktop behavior.
- [Rendered visual validation](./visual-validation/README.md) — render and capture only when browser, execution, and image-review capabilities are available; preserve evidence and limitations.
- [MCP adapter](./mcp-server/README.md) — expose narrow design operations with explicit workspace, execution, and write boundaries.

## Pilot scenarios

The contracts are intended to support:

- OpenFilm-style desktop editor prototypes built from an approved task and component map;
- research dashboards derived from inspected, anonymized CSV fields and declared aggregations;
- temporary, schema-driven debugging or settings UIs rendered from a minimized state snapshot.

These scenarios remain proposals until a fixture, implementation, and acceptance evidence exist.

## Adapter rules

1. Keep core workflow terminology capability-based.
2. Inspect the target repository before selecting paths, aliases, dependencies, or conventions.
3. Keep portable design artifacts usable without an adapter.
4. Mark missing capabilities and unrun validation as unknown or `not run`.
5. Separate reads, command execution, patch proposals, and file writes.
6. Do not send source, screenshots, customer data, or environment values to external services without explicit authorization.
7. Treat generated dynamic UI as untrusted declarative data; do not execute generated code in a privileged host.
