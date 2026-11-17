# Declarative Runtime Recovery Pilot

[繁體中文](README.zh-TW.md)

Status: **bounded synthetic implementation**. The media fixture has a strict data validator, a host capability boundary, a trusted Vue renderer and static recovery. Live model transport and inference cost are not tested.

## Run the pilot

Install the optional [Vue tooling](../vue-project-profile/README.md), then run from the repository root:

```sh
node --test integrations/vue-project-profile/runtime.test.mjs
node integrations/vue-project-profile/render-runtime.mjs
```

The browser harness produces `artifacts/runtime-results.json` and captures. `--build-only` compares production bundles without claiming browser results. The fixture uses trusted local JSON producers for valid, malformed, oversized, unavailable, delayed and timed-out generation. The normal fixture defaults to static recovery.

## Host and permission boundary

`createRecoveryHost()` receives trusted callbacks for the current owner snapshot, existing `retry()` action, clock and optional generation service. It sends only an approved error code, a usable-data boolean, a retry-permission boolean, request/state identifiers and fixed version metadata. Item names, filters, logs, credentials and raw diagnostic text are excluded.

The host accepts only `ui-panel/0.1` with registry `media-recovery/0.1`. Components are fixed at version 1: `Group`, `Notice` and `ActionButton`. The only action is `retryMediaRead` with an empty parameter object. It delegates to the existing Pinia owner; it cannot add an API, filesystem or native command.

The host creates a one-use action token after validation. A token never comes from the producer. Activation checks the live owner revision, current error/permission, expiry and request capability. It revokes old capabilities before abort callbacks and checks authority again after synchronous observers. Clock rollback, stale/replayed actions and malformed parameters are refused.

This is a same-origin JavaScript boundary. It is not a process sandbox against other trusted application code. MCP can transport data but does not grant authority. A real host must enforce its own authentication, confirmation and isolation rules.

## Strict payload contract

See [runtime-payload.schema.json](runtime-payload.schema.json) and the executable validator in `examples/media-library-vue/src/runtime/contract.js`.

| Limit | Value |
|---|---:|
| Serialized UTF-8 payload | 8,192 bytes |
| Total nodes | 32 |
| Tree depth | 4 |
| Children per group or root | 8 |
| Aggregate text | 4,096 UTF-8 bytes |
| Producer expiry | 1–60,000 ms |
| Host action expiry | At most 30,000 ms in this fixture |
| UI generation timeout | 1,500 ms; shorter deterministic test cases |

Reject unknown properties at every level. Reject code/template/HTML/CSS/expression/URL/native-command fields, arbitrary components/actions and invalid versions. Bound the input length before allocating a UTF-8 buffer, then check the exact byte count.

All text remains opaque. Vue renders it with text interpolation; HTML-looking or expression-looking text is not compiled. There is no image component in this pilot, so remote images and asset URLs are unavailable. A later illustration feature needs a fixed local asset registry.

## Supported response

```json
{
  "schemaVersion": "ui-panel/0.1",
  "registryVersion": "media-recovery/0.1",
  "requestId": "synthetic-case-01",
  "stateVersion": "media-state-4",
  "expiresAfterMs": 30000,
  "nodes": [
    {"type":"Notice","props":{"tone":"warning","title":"Suggested recovery","text":"The existing read owner can retry the current request."}},
    {"type":"ActionButton","props":{"label":"Retry media read"},"action":{"id":"retryMediaRead","params":{}}}
  ]
}
```

The request and state values must match the host request. The host clamps expiry and adds its private token to the validated render view. That decorated view is an internal host record, not a producer payload. Generated guidance is labelled as a suggestion.

## Failure and keyboard behavior

Invalid payload, timeout, unavailable generation, expired actions and changed state fall back to current static recovery. Dismissal, cancellation and unmount invalidate pending generation even when a producer ignores abort. Non-retryable permission states provide no retry action.

The bounded native dialog has a stable close control, Escape dismissal, keyboard action access and focus restoration. If retry makes the opener unavailable, focus returns to the existing media-load control. The same shared browser harness checks text escaping, redacted inputs, native events, replay/expiry/permission refusal and the unmount microtask boundary.

## Cost and evidence

The harness builds the same production fixture twice, substituting a static recovery component for the dynamic component through a fixed trusted build alias. It records raw/gzip JS and CSS bytes. It measures cold opening separately, then two warmups and 20 open-to-Vue-DOM-commit samples for each build, with raw samples, median, p95 and range.

Declared gates are p95 at most 250 ms for the local fixture producer and at most 64 KiB additional gzip JavaScript. Payload limits and all correctness gates remain enforced. These are bounded prototype budgets, not a production performance claim or a promise of a smaller application bundle.

No external model is called. Fixture inference cost is zero; live model latency and monetary cost remain null with an explicit unrun reason. Source/tool hashes, actual runtime versions, commands, failure records and captures are preserved in the workflow artifact. Process isolation, live model integration, assistive technology, physical devices and native-shell parity require separate evidence.
