# Vue 3 + SCSS + Tauri Adapter

[繁體中文版本](integrations/vue3-tauri/README.zh-TW.md)

Status: **proposed integration contract; documentation only**. This directory does not contain a code generator or claim that generated UI has been run in Tauri.

## Purpose

Translate the portable design artifacts into the conventions of an existing Vue 3 project. The adapter is opt-in: use the Vue mapping when the target repository identifies Vue 3, follow its actual styling conventions, and enable the SCSS/Tauri guidance only where those technologies are present.

The adapter must fit the project it inspects. It must not impose one universal folder structure, alias table, component library, chart library, Tauri version, or desktop interaction model.

## Inspect before generating

Before proposing code, inspect the project root and the relevant files that are available:

- `package.json` and lockfile for Vue, TypeScript, SCSS, Tauri, and existing UI dependencies;
- `vite.config.*` and `tsconfig*.json` for actual import aliases;
- nearby Vue single-file components and their style conventions;
- existing design tokens, shared components, chart wrappers, and accessibility patterns;
- `src-tauri/tauri.conf.json` and Rust/plugin configuration when desktop capabilities matter.

Record missing files and unresolved details. Do not infer that a package, alias, runtime capability, or style token exists just because it would be convenient.

## Context, tokens, state and patch boundaries

Create a scoped [project profile](../context-aware-ui/project-profile.md) before
proposing source changes. Resolve visual roles to observed tokens/components;
record missing roles and theme/import evidence. Preserve the existing store,
composable and service ownership described by the
[state contract](../context-aware-ui/state-contract.md).

For edits to an existing SFC, follow the
[AST patch contract](../ast-patching/README.md): use the matching SFC/template/script
parsers, identify unambiguous targets, preserve protected source ranges, refuse
stale files, and verify behavior at the API boundary. MagicString is a source-range
editing utility, not an AST parser. Record unsupported syntax instead of
regenerating a whole file.

These are proposed behaviors for a future adapter; the current directory ships
guidance only.

## Project-aware output contract

For each proposed component, state:

- target file path, chosen from observed project conventions;
- responsibility and relationship to the page / feature contract;
- props, emitted events, and owned state;
- reusable components and tokens reused;
- keyboard, focus, pointer, and empty/error/loading behavior;
- SCSS scope and any new token or dependency;
- evidence still needed, such as a real Tauri run or screenshot.

Use `<script setup>`, TypeScript, composables, and scoped SCSS when they match the existing codebase. Follow the repository's actual conventions when they differ.

### Path aliases

Aliases such as `@viz` and `@common` are **project-specific examples**, not defaults. Resolve aliases from the current Vite / TypeScript configuration before using them. If an alias is missing or points elsewhere, use the verified path convention or propose a separate configuration change with its own rationale. Do not silently add aliases to make generated code appear to fit.

Example mapping, only after it has been verified in the target repository:

```ts
// Illustrative only: copy the values from the inspected project configuration.
import RevenueMix from "@viz/RevenueMix.vue";
import AppButton from "@common/components/AppButton.vue";
```

## Desktop interaction contract

Treat the desktop shell as a real target environment with its own window chrome, focus, input, and platform behavior.

- **Window dragging:** for Tauri, prefer the documented `data-tauri-drag-region` mechanism or the appropriate Tauri window API for the detected version. Ensure buttons and interactive controls are outside the drag region or explicitly excluded. Do not assume Electron's `-webkit-app-region: drag` is portable to every Tauri WebView.
- **Context menus:** preserve native text-input, link, and accessibility behavior unless the product requires a custom menu. Scope `contextmenu` handling to the relevant surface. A custom menu needs keyboard invocation, focus placement/restoration, Escape handling, and item semantics.
- **Text selection:** do not disable selection globally. Restrict `user-select: none` to non-content chrome such as a verified title bar or drag handle; keep text, code, transcript, captions, and editable regions selectable.
- **Window controls:** check hit targets, focus order, disabled states, keyboard navigation, zoom, high-DPI scaling, and reduced-motion behavior. Validate the actual supported operating systems and WebView runtimes before claiming parity.

Official Tauri reference: [Window customization](https://v2.tauri.app/learn/window-customization/).

## Desktop editor pilot: OpenFilm-style workspace

For a media editor prototype, map the approved task and content model before drawing panels. A representative decomposition is:

- media library and import state;
- preview / playback surface;
- timeline tracks and clip controls;
- inspector for the selected clip or story node;
- effects or story-node tree;
- transport controls and keyboard shortcuts.

Keep selection, playhead, zoom, and drag state explicit. Specify empty, loading, selected, disabled, and overflow states. A screenshot-based prototype is a visual proposal; it does not prove real media behavior, timeline performance, or native-window correctness.

## Exit criteria for a future implementation

A runnable adapter should not be called complete until:

1. generated paths and aliases match inspected project configuration;
2. the component contract is implemented without breaking existing page semantics;
3. the web build succeeds using the repository's documented command;
4. keyboard/focus and narrow-window states are reviewed;
5. desktop-only behavior is exercised in each claimed Tauri/WebView target;
6. screenshots and limitations are attached to the change.

