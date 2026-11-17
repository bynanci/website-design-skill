# Synthetic media-library transition fixture

[繁體中文](README.zh-TW.md)

This Vue/Pinia fixture implements the bounded media-library transition slice of Issue #13. It uses synthetic item names and durations. It does not read media files, call a native service, send network requests, persist edits, or modify the frozen v0.1 benchmark.

## Owner and supported states

`src/stores/media-library.js` is the single UI state owner. The view calls that store; the store calls the read-only `listMedia` boundary in `src/services/media-api.js`. The service accepts an `AbortSignal` and the current filter, and returns `{ items, partial }`. An injected local source supplies deterministic responses for tests. No second store or direct view-to-service request is introduced.

| Condition | Observed behavior |
|---|---|
| Before first load | `idle` with an empty list |
| Delayed initial read | `loading`, with an announced status |
| Empty result | `success` plus an empty-state explanation |
| Complete or partial result | Usable items and a partial-data notice when declared by the service |
| Transient read failure | `error`, a safe message, and a native retry button |
| Permission denial or invalid response | Non-retryable error; the recovery control and form submit do not resubmit it |
| Background refresh failure | Existing items, selection, filter and partial-data information remain available |
| Replacement, filter edit or cancel | The old request is aborted; a sequence guard ignores late results even if the source ignores abort |
| Component unmount | The owner is disposed; pending or subsequent reads cannot update its state |

Retry coalesces repeated calls into one in-flight read. The service has no writes, so write idempotency and duplicate mutation protection are inapplicable to this specimen. A real media adapter must define those rules before it adds side effects. The fixture does not model a changing authorization session, persistence, playhead, file import, or native shell behavior.

The view reuses the profile fixture's warning/destructive status pattern and token names. `profile-contract.json` records its component API, role consumers, state/action/service ownership and scoped literal exceptions. The source adapter can inspect this record without executing target configuration.

## Runtime verification

Install the optional tooling from `integrations/vue-project-profile/` using its pinned lockfile. From that tooling directory, run:

```sh
node --test media.test.mjs
node inspect.mjs ../../examples/media-library-vue --entry src/main.js --contract profile-contract.json
```

The tests execute the actual Pinia owner and injected read service. They cover delayed load, empty and partial results, retry coalescing, permission denial, failed refresh preservation, stale responses, filter changes, abort, disposal, invalid responses, safe error text and source ownership. These tests alone do not verify rendered keyboard behavior or image quality. The shared optional build/browser harness owns those checks and records their commands, runtime and evidence separately.

## Browser scenario control

For deterministic browser evidence, set `globalThis.__MEDIA_TEST_CONTROL__ = true` before the entry module runs. The fixture entry then installs a deferred source and exposes the trusted local `globalThis.__MEDIA_FIXTURE__` controller. It is not a production or model-facing API.

The controller provides `pending()`, `requests()`, `resolve(id, { items, partial })`, `reject(id, code)`, `snapshot()`, `load({ replace })`, `cancel()`, `dispose()`, `setFilter(value)`, `select(id)` and `unmount()`. Supported failure codes are `unavailable`, `permission_denied` and `invalid_response`.

Initial mount queues request 1. Resolve it to show a list, reject it to show an error, or leave it pending to inspect loading. A later `load()` starts background refresh; `load({ replace: true })` aborts an earlier request. This deferred source deliberately ignores abort so a browser test can settle a cancelled request and verify that the owner ignores its result.

Stable selectors are `media-panel`, `media-filter`, `media-load`, `media-cancel`, `media-status`, `media-items`, `media-empty` and `media-selection` through `data-testid`. The recovery button remains the same DOM element across loading, error, retry and success. Native buttons, radio controls and a labeled input provide keyboard access; errors use `role="alert"`, progress uses `role="status"`, and reduced-motion CSS disables animation and transition.

The shared optional browser harness builds this fixture and exercises initial loading, empty output, retry, success/partial data, failed refresh, non-retryable permission, stale response, cancellation and unmount. It records actual owner/service requests, keyboard focus, reduced motion, screenshots and source/runtime hashes.

```sh
node integrations/vue-project-profile/render-media.mjs
```

A session-wide permission denial remains blocked across filter edits, cancel and direct load attempts. A trusted new session must create a fresh owner; editing input does not reset permission state.
