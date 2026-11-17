# Applicable UI State and Transition Contract

[繁體中文版本](state-contract.zh-TW.md)

Status: **proposed contract for optional adapters**, not an implemented state-management package.

## Applicability before generation

Loading, empty, error and success are a baseline for asynchronous data surfaces. Apply them at the responsible boundary, not to every button or decorative primitive. Document a reason for each inapplicable state.

Keep existing interaction states such as focus, selected, expanded, dragging and disabled. Inspect permission, offline, partial-success and background-refresh behavior when the feature requires them. A four-way rendering branch alone is not a complete state machine.

The adapter must reuse the existing store/composable/query owner. Do not introduce a second source of truth or change a service API merely to fit this record.

## Ownership record

- Feature and user task:
- Existing state owner and source revision:
- Initial state, including idle/not-requested if applicable:
- Request/action entry point and response/error contract:
- Derived presentation state:
- Selection/input state that must survive updates:
- Side effects and protected services:
- Applicable states and justified omissions:

## Media-library pilot transitions

This is a synthetic example. Map it to the real project's events and data types before implementing.

| Current state | Event / guard | Next state or retained data | Side effect / user feedback |
|---|---|---|---|
| Idle | Panel opens / query required | Loading with request identity | Call existing load action once |
| Loading | Latest request resolves with items | Success | Render stable item keys and full labels |
| Loading | Latest request resolves with no items | Empty | Show the existing import action |
| Loading | Latest request fails | Error | Show sanitized actionable message |
| Error | Retry and retry is safe | Loading | Retry through existing owner; no duplicate import |
| Empty | Import chosen | Existing import workflow | Reflect its completion/error contract |
| Success | Refresh begins | Keep items, mark refreshing | Avoid replacing usable content with a full skeleton |
| Success/refreshing | Refresh fails | Retain items with a stale/error indicator | Offer safe retry; preserve selection |
| Any pending state | Cancellation or feature unmount | Owner-defined settled/retained state | Abort or ignore completion; no late UI overwrite |
| Any pending state | Older request finishes after a newer one | No overwrite from the old response | Enforce owner request identity/version rule |

## Presentation and accessibility

| State | Content and actions | Interaction checks |
|---|---|---|
| Loading | Appropriate progress/skeleton, cancel if supported | Preserve useful focus; announce status without repeated noise; honor reduced motion |
| Empty | Reason for absence and valid next action | Distinguish no search matches, no imported items and no permission |
| Error | Accessible error information and a safe recovery path | Preserve input and focus; a data error is not automatically a component/render exception |
| Success | Required data and selection affordances | Keyboard and pointer parity; long strings and large lists retain access |
| Refresh/partial data | Existing usable data plus progress/limitations | No misleading completion or lost selection |

Use the project's established status, alert and error-boundary mechanisms. Do not promise that one component-level error handler catches every asynchronous, network, or native failure.

## Retry and concurrency rules

- Identify whether an operation reads data or mutates/imports media. A retry button does not make a mutation idempotent.
- Define request identity, cancellation and stale-response handling at the existing owner.
- Prevent duplicate submissions and expose whether recovery is retry, cancel, change input, reauthorize, or inspect details.
- Preserve selection and edited input unless the established product contract intentionally clears them.
- Define background-refresh failure separately from an initial failure.
- Keep sensitive paths, tokens and raw native stack traces out of user-visible error text.

## Acceptance evidence for an implementation

Exercise transitions through the actual public owner/API boundary using controllable synthetic fixtures, rather than rendering four disconnected screenshots.

Required cases include: delayed initial load; empty response; recoverable error and retry; non-retryable failure; out-of-order completion; unmount/cancel; refresh failure with existing data; keyboard recovery and focus preservation. Include applicable permission and partial-data conditions.

Record which transition was exercised, its expected invariant, runtime result and remaining gap. Screenshot evidence can support state presentation; behavior assertions are needed for transitions and side-effect counts.

## Executable media-library fixture

The [synthetic media-library fixture](../../examples/media-library-vue/README.md) exercises these transitions through one observed Pinia owner and an injectable read-only service. Its runtime tests and shared browser harness cover delayed loading, empty/success/partial responses, safe and non-retryable failure, duplicate-read coalescing, preserved data/selection/input, stale requests, cancellation and disposal. Browser evidence records native keyboard recovery, focus, status/error semantics and reduced motion. Native media services and side-effecting writes remain outside this fixture.
