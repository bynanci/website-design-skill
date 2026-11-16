# MCP Adapter Contract

Status: **proposed architecture; no MCP server package is implemented**.

## Goal

Expose selected website-design capabilities through Model Context Protocol so a compatible host can request a project audit, design artifact, preview, or patch. The adapter is a separate integration package; the core skill remains usable without MCP.

MCP offers server capabilities such as tools, resources, and prompts. This proposal does not prescribe a transport or SDK until a runnable implementation is selected. See the [MCP TypeScript SDK server guide](https://ts.sdk.modelcontextprotocol.io/v2/).

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

A zero-shot settings or debugging surface should be schema-driven and short-lived:

1. The host supplies a minimized state snapshot and an approved UI schema, not a dump of the entire process environment.
2. The adapter returns a declarative layout assembled from a fixed component allowlist.
3. The host renders that data in a sandboxed surface with strict input validation and no arbitrary code execution.
4. The surface receives only the fields needed for the current task and has an explicit expiration / dismissal path.
5. Any action that changes application state is previewed and confirmed through the host's normal authorization flow.

Do not use `eval`, dynamically import generated modules into the privileged application, expose secrets to the model, or persist generated forms as trusted code. This design keeps the initial application shell light while avoiding arbitrary remote code execution.

## Acceptance gates before shipping

- tool schemas reject unknown fields and invalid paths;
- root and symlink escape cases are covered;
- reads and writes are separated and auditable;
- command execution is disabled unless configured and bounded;
- data handling, network access, and persistence are explicit;
- the host can display source/evidence, exact diffs, and authorization prompts;
- a conformance test verifies structured outputs without requiring a particular model;
- security review covers the actual transport, SDK, and host permission model.

