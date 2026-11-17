# Bounded track-reorder fixture

[繁體中文](README.zh-TW.md)

This synthetic fixture starts with two unbound native buttons. Its existing Pinia action owns the track order and calls the existing persistence service once per valid move. Selection and playhead are independent state. The source adapter adds only two Vue click bindings.

Use the optional [Vue pilot tooling](../../integrations/vue-project-profile/README.md). The patch API is in `integrations/vue-project-profile/patch.mjs`:

```js
const plan = proposeReorder(root, { expectedSha256 });
typeCheckReorder(root, plan);
applyReorder(root, plan, { exclusiveWorkspace: true });
```

The caller must provide the current raw source SHA-256. The proposal records exact original/candidate bytes, edit ranges, context digests and parser versions. Application repeats validation and requires a successful real TypeScript check before writing. A proposal alone does not mutate files. Reapplying the operation against the current digest returns a no-op.

Writing and rollback require an isolated checkout exclusively controlled by the host. The cooperative lock and repeated digests detect cooperating or already visible changes. They do not provide storage-level compare-and-swap against arbitrary external editors. Rollback refuses a changed target or context instead of overwriting it.

## Supported source form

- Vue/compiler 3.5.13 and TypeScript 5.7.3.
- One TypeScript `script setup` with static imports, supported prop declaration and a stable existing `const` store binding. Additional executable component code is refused.
- One existing exported Pinia options store, a typed `moveTrack(trackId, direction)` action accepting only `up`/`down`, and one observed persistence-service call.
- Exactly one native HTML `type="button"` target for each static `data-reorder="up"` and `data-reorder="down"` marker.
- No template aliases, `v-pre`, custom/SVG controls, object event bindings, conflicting existing handlers or unsupported source blocks.

Only the declared template insertion ranges may change. Comments, multiple supported style blocks, unrelated source bytes and service files remain protected. Malformed, ambiguous, stale or unsupported input is refused.

## Browser evidence

From the repository root, after installing the optional tooling and Playwright browser:

```sh
node integrations/vue-project-profile/render-reorder.mjs
```

The shared harness copies this fixture to a temporary exclusive workspace. It verifies the unbound baseline, applies and type-checks the patch, builds the actual Vue app, exercises pointer/Tab/Space/Enter events, checks action/persistence counts and selection/playhead, confirms a second application is a no-op, then verifies byte-identical rollback. `artifacts/reorder-results.json` preserves the exact plan, source/tool versions, captures, assertions and unrun conditions. The original fixture remains unchanged.

Persistence is an in-memory synthetic readback. No filesystem, media, FFmpeg or native-shell operation is exercised.

## Synthetic deployment build

The local `vercel.json` builds this unchanged synthetic fixture with the shared locked Vue tooling, rather than running the repository showcase command inside this directory. From this fixture directory, use:

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --prefix ../../integrations/vue-project-profile
node ../../integrations/vue-project-profile/build-fixture.mjs track-reorder-vue
```

The adapter accepts only the two reviewed fixture names, ignores target Vite configuration, preserves source files and writes the compiled entry/assets to this directory's `dist/`. This is a build of the original test baseline, not a production application or broader UI acceptance result. This configuration does not disable Git deployments; its ignored-build command requests a real build. See [deployment operations](../../docs/DEPLOYMENT.md).

The baseline reorder buttons remain intentionally unbound. This build does not apply the source patch or claim working reorder interactions; the separate isolated patch/browser harness owns that verification.
