# Vue project-profile pilot

[繁體中文](README.zh-TW.md)

This optional adapter inspects one bounded Vue source form. It combines the portable Python profile with parsed local imports, declared semantic roles, component props, and the existing Pinia/service boundary. The core skill still runs without Node dependencies.

## Supported inputs

- A root TypeScript JSONC file with one static target per alias; no `extends`.
- Local `.ts`, `.js`, `.vue`, `.css` and `.scss` imports from one explicit entry point.
- CSS custom properties under explicit theme selectors. SCSS expressions remain source expressions until the build resolves them.
- One `script setup` component with a local `defineProps` type literal and primitive or local string-union types.
- One exported Pinia options store, an existing action with one imported service call, and one consumer store call.
- A reviewed `profile-contract.json` that names the roles, selectors, consumers and owner to verify. This contract supplies intent; source evidence must confirm each declaration and use.

Unsupported or ambiguous syntax remains unknown or causes refusal. This pilot does not claim Tailwind, arbitrary Sass module semantics, React, Svelte, inherited aliases or native-shell support.

## Install and inspect

Use Node 22 or later and Python 3. Install the optional dependencies in this directory:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
node inspect.mjs ../../examples/project-profile-vue \
  --entry src/main.ts --contract profile-contract.json
```

The command writes JSON to standard output. `profile` follows the existing schema version 0.1. `evidence` records the local import graph, source declarations, consumer locations, component props, owner/action calls, drift findings and unsupported cases. The inspector never executes target configuration or project code. It reads sources again on each invocation and creates no persistent cache.

The contract maps warning and destructive-action roles independently. A missing declaration, consumer or theme is a finding. Conflicting roles are explicit. Literal exceptions require an exact source path, property, value and reason; the same value at another location is not approved.

## Build and render the supplied fixture

The separate render harness runs trusted, fixed Vite configuration with the pinned Vue/Sass toolchain. It does not evaluate the target's dynamic `vite.config.ts`.

```sh
npx playwright install --with-deps chromium
node render.mjs ../../examples/project-profile-vue
```

For an installed Chromium binary, set `CHROMIUM_EXECUTABLE_PATH`. A production build must pass. Browser checks then measure both warning and destructive consumers in light and dark themes. They compare computed foreground, background and status-border colors to the fixture's expected values, measure contrast, record runtime errors, and confirm fixture source files were not modified.

Output is written under `artifacts/`: the production build, two captures and `render-results.json`. The report contains source hashes, tooling hashes, installed versions, actual browser version, checks and unrun conditions. The GitHub Actions workflow preserves the JSON and captures under `vue-profile-evidence`. CI results and artifact links belong in the corresponding PR or Issue #11.

Static role evidence and browser measurements are separate records. A passing theme check does not establish full dashboard quality, state-transition behavior, assistive-technology support or official cross-agent release evidence.

Scoped external Vue styles remain unsupported; they cannot establish global theme declarations.
