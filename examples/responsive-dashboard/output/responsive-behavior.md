# Harbor Dashboard — responsive behavior contract

[繁體中文](responsive-behavior.zh-TW.md)

The current native specimen implements the behavior below. The [2026-11-17 QA record](qa-review-2026-11-17.md) tracks results for its exact candidate. Earlier measured heights in the 2026-11-16 report remain historical; do not reuse them as measurements of this revised layout.

## Content priority and equivalence

| Group | Wide behavior | Narrow behavior | Invariant |
|---|---|---|---|
| Account summary | Full identity and contact fields | Wrap without truncating names | Identity/contact remain reachable |
| Metrics | Four-column strip where space permits | Two-column grid | Preserve labels, values and units |
| Observations | Primary reading column | Full-width ordered list and direct mobile shortcut | Preserve all claims, evidence and questions |
| Revenue mix | Supporting chart/legend region | Legend reflows; table remains available | All five categories and exact values survive |
| Revenue trend | Multi-series graphic and key | Scales within container with table alternative | Preserve all three series and eighteen points |
| Opportunities | Supporting panel | Full-width list | Keep uncertainty explicit |
| Cases | Full table with visible buttons | Local horizontal scroll | Preserve each field and action |
| Notes | Beside the observation workflow | Follows primary content | Preserve the mounted field through synthetic recovery |

Container thresholds at 1190, 875, 525 and 340 CSS px are implementation choices for this fixture. They are not universal breakpoints. The floating acceptance panel reserves desktop space and enters document flow at narrower viewport widths; required visible actions must remain unobscured.

## State and interaction ownership

The synthetic read owner renders loading, empty, error and success, with a keyboard-operable retry and status/alert semantics. Unavailable content is hidden and inert. Repeated refresh calls coalesce; recovery preserves the note input. Persisted page-transition probes suspend/resume the retained owner; nonpersisted hide disposes it. This does not test a production API or real BFCache navigation.

Charts offer one roving Tab stop each, Arrow/Home/End navigation, local named feedback and full numeric tables. The runner exercises real exposed pointer targets rather than assuming an SVG bounding-box center is interactive. Dialog focus enters its title, stays within explicit Tab boundaries and returns to the trigger after close. Emulated touch checks tap-visible chart/case controls.

## Declared condition matrix

Twenty viewport/direction/theme combinations plus twelve interaction, state, container, floating, touch and long-copy conditions make the 32-condition browser matrix. Two separate headed Chromium captures check actual native 200% page zoom for editorial light/dark. The 683px effective-width proxy is retained as a different condition.

Six axe-core scans cover editorial at 1366/390/320 CSS px in both themes. Raw Navigation/Paint Timing fields are observations from this file fixture, with no speed or production budget claim. The dated report must identify completed, failed and unrun checks before acceptance.

## Desktop scrolling and open decisions

Editorial remains the author's default for observation/evidence reading. Full-content single-screen operation at 1366×768 is not promised. Keep required text, data and actions, then record a human decision about scrolling and density using current captures.

Not tested: physical devices, screen readers, native Tauri shell, real authentication/API/persistence, production performance, arbitrary locales/content, native zoom in cockpit, and real user task outcomes. Other hosts must inspect their own components/tokens and provide case-dialog actions before claiming integration.

## Scope and rollback

All styles belong to this standalone fixture; no production stylesheet is overridden. Direction and theme attributes select reviewed local rules; restore `editorial` and `light` to return to the default. Closing the floating panel restores its reserved space. Narrow-container and long-copy stress injections exist only in disposable QA pages. The bounded repair experiment edits only its copied `.mix-body` declaration and preserves exact before/after bytes; source conflicts stop rollback rather than overwriting another edit.
