# AST-Guided UI Patch Contract

[繁體中文版本](integrations/ast-patching/README.zh-TW.md)

Status: **proposed optional integration; no parser or transform is implemented**.

## Purpose and limits

Use syntax-aware targets and narrowly scoped edits to reduce unintended changes when modifying an existing component. Parsing source does not establish that a change preserves application behavior.

Vue's [SFC compiler utilities](https://github.com/vuejs/core/blob/main/packages/compiler-sfc/README.md) provide single-file-component parsing and compilation operations. [MagicString](https://github.com/Rich-Harris/magic-string) edits source ranges and can preserve source mappings; it is not an AST parser. Use a matching language/template parser to identify supported nodes, then a range editor or suitable code printer to emit the change.

## Vue pilot pipeline

1. Read the target file and record its content digest.
2. Parse SFC block boundaries with a compiler matching the target project's Vue version.
3. Parse template and script using compatible parsers for the actual syntax, including TypeScript when present. Work in original source coordinates; compilation output offsets must not be reused as source offsets.
4. Locate a single intended template node and the relevant script bindings/imports through explicit structural predicates.
5. Resolve the requested change against existing handlers, imports, aliases, local scopes, props/emits and state owners.
6. Produce non-overlapping edits inside the declared allowed regions. Preserve bytes outside those regions, including unrelated comments, styles and business code.
7. Reparse the proposal, verify bindings and protected regions, and run the target project's applicable compile/type/behavior checks.
8. Present the diff and evidence. Before applying, re-check content digests and the host's existing write authorization.
9. Apply the operation atomically at the agreed file-set boundary, or leave it unapplied. A concurrent change requires a new plan.

Unsupported preprocessors, external SFC blocks or syntax should return an explicit unsupported result with a reviewable fallback proposal. Do not quietly switch to whole-file regeneration.

## Patch plan record

| Field | Required meaning |
|---|---|
| Profile / plan / operation ID | Bind the operation to a scoped project context |
| Target files and original digests | Refuse writes after any target content changes |
| Parser versions and supported syntax | Evidence for the selected adapter capability |
| Target predicate and match count | Identify the intended node; reject ambiguity |
| Existing bindings and handlers | Resolve shadowing, collisions and composition semantics |
| Allowed ranges / protected symbols | Describe editable regions and preserve unrelated logic |
| Edit list and diff | Review inserted, replaced and removed source |
| Expected postconditions | Includes imports, event/state ownership and API behavior |
| Verification results | Parse/build/type checks plus relevant behavioral regression |
| Reapplication rule | An identical request is a no-op, or reports an explicit conflict |

Inserts into imports and state declarations need their own allowed ranges; a template-target match alone does not authorize editing every script block.

## Timeline drag-sort example

For “add drag sorting to this track”, a pilot must:

- locate the actual repeated track/clip node and its stable key;
- reuse the store's existing reorder action and immutable identifiers;
- preserve any existing drag handlers and reject unclear event-composition semantics;
- add scoped drag state only if it is absent and its owner is clear;
- provide a keyboard-accessible reorder action alongside pointer interaction;
- leave FFmpeg invocation and persistence logic in their existing services;
- verify reorder arguments, side-effect counts, selection/playhead invariants and persisted ordering where in scope.

Do not infer correctness from seeing `@dragstart` and `ref` in the patch. Native drag/drop and any desktop-shell differences need their own execution evidence.

## Failure and rollback behavior

Return a proposed diff or a structured refusal for:

- malformed or unsupported source;
- zero or multiple matching targets;
- shadowed/conflicting bindings or an already different handler;
- stale digests, protected-region changes or overlapping edits;
- failed compile/type/behavior checks.

A failed proposal must leave project files untouched. If verification is performed after applying in an isolated worktree, retain the original state and revert only the operation's own changes when content still matches; report concurrent conflicts rather than overwriting them.

## Evidence before adapter support

A runnable Vue transform needs fixtures for TypeScript imports, local shadowing, existing handlers, comments, multiple style blocks, repeated/ambiguous nodes, malformed source, stale-file rejection, idempotent reapplication and rollback conflicts. Assert byte preservation outside edited ranges and behavior at the existing API boundary.

React/JSX and Svelte require separate parser adapters, scope rules and conformance fixtures. For example, the [Babel parser](https://babeljs.io/docs/babel-parser) supports JSX and TypeScript syntax, but parser availability alone does not prove a correct React transform.
