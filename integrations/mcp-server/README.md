# MCP Adapter Contract

[繁體中文版本](integrations/mcp-server/README.zh-TW.md)

Status: **proposed architecture; no MCP server package is implemented**.

## Goal

Expose selected website-design capabilities through Model Context Protocol so a compatible host can request a project audit, design artifact, preview, or patch. The adapter is a separate integration package; the core skill remains usable without MCP.

MCP offers server capabilities such as tools, resources, and prompts. This proposal does not prescribe a transport or SDK until a runnable implementation is selected. See the [MCP TypeScript SDK server guide](https://ts.sdk.modelcontextprotocol.io/v2/).

The shared [context-aware architecture](../context-aware-ui/README.md) defines
the project profile, change plan, patch and evidence records used by an adapter.
MCP transports those operations; it does not supply framework understanding,
semantic safety or authorization automatically.

## Suggested tool boundary

A first implementation should prefer small, typed operations:

| Operation | Side effect | Contract |
|---|---|---|
| `inspect_project` | Read-only | Return selected project metadata and relevant source excerpts under an approved root. |
| `create_design_plan` | Read-only | Return structured artifacts with evidence, assumptions, and unknowns. |
| `render_preview` | Executes a configured project command | Require an explicit command policy, timeout, and local-only target. |
| `review_capture` | Read-only | Review a supplied screenshot or report that image review is unavailable. |
| `propose_patch` | Read-only | Return a unified diff and affected paths without writing. |
| `apply_patch` | Writes files | Separate from proposal; require explicit host/user authorization and re-check the target revision. |

Do not expose a generic shell, unrestricted filesystem, arbitrary environment reader, or implicit deployment tool as a design capability.

## Workspace and data boundary

- Bind each request to an explicitly configured workspace root. Do not accept an arbitrary path as authority to expand access.
- Canonicalize paths and resolve symlinks before reading or writing. Reject traversal and any resolved path outside the approved root.
- Read only the files needed for the requested operation. Do not enumerate or return environment variables; read only specifically named, non-secret project settings when required.
- Exclude secrets, credentials, build artifacts, and personal/customer data by default. Redact tool output and logs.
- Keep generated previews local and time-bounded. Do not upload source files, screenshots, or CSV data to external services unless the user has explicitly authorized that destination.
- Require an explicit policy before installing dependencies, using the network, or running project scripts. Enforce command allowlists, timeouts, and process cleanup.
- Keep all file writes scoped to approved paths. Return the diff and changed paths so the host can show the exact mutation.

For remote transports, add authentication, per-user authorization, origin controls, and deployment-specific threat review before implementation. Local stdio is a candidate default, not a completed security decision.

## Dynamic UI pilot

Follow the separate [declarative runtime UI contract](../runtime-ui/README.md).
The host supplies a minimized state snapshot, schema/component versions and a
bounded action capability set. The adapter returns data, and the host validates
it before using registered components to render a temporary panel.

Generated templates/modules, raw HTML/CSS and arbitrary commands are outside
this interface. State-changing actions use existing host authorization and
re-check current state. Keep an accessible static fallback for invalid payloads,
timeouts or unavailable models. Measure latency, cost and bundle impact before
claiming that runtime generation makes an application lighter.

## Acceptance gates before shipping

- tool schemas reject unknown fields and invalid paths;
- root and symlink escape cases are covered;
- reads and writes are separated and auditable;
- command execution is disabled unless configured and bounded;
- data handling, network access, and persistence are explicit;
- the host can display source/evidence, exact diffs, and authorization prompts;
- a conformance test verifies structured outputs without requiring a particular model;
- security review covers the actual transport, SDK, and host permission model.

