# Harbor Account Workspace — Observed Tokens and Integration Plan

Status: the synthetic specimen's CSS tokens are observed. Target-product
**inventory pending**: no private or production design system has been supplied.
The values below belong to this public fixture and must not be treated as
tokens already available in another repository.

## Source evidence

- Token source: `specimen/styles.css` at baseline `e62209463e89665131b8c015542d60c53ce83294`.
- Stylesheet SHA-256: `e069b511f40e5fa8f5ebf2e26b9d1076d7ab30f2e83ea0cfedabf69c919285c4`.
- `specimen/index.html` loads the stylesheet directly; `specimen/app.js`
  uses the chart variables when it creates SVG marks.
- Consumers are DOM/CSS responsibilities in a standalone specimen. Proposed
  names such as AccountHeader or NotesEditor do not establish real framework
  component APIs or reuse.
- The root declares `color-scheme: light`. Editorial and cockpit are visual
  directions, not light/dark theme modes. No dark-theme implementation exists.

## Observed specimen mapping

| Observed source | Specimen role / default value | Consumers | Evidence and limit |
|---|---|---|---|
| `--canvas`, `--surface` | Page `#f6f7f6`; surface `#fff` | Root, panels and metrics | Cockpit overrides `--canvas` inside the dashboard; root background remains outside that scope |
| `--ink`, `--muted` | Primary `#1c2d31`; secondary `#52625d` | Root text, metadata and feedback | Several selectors retain literal text colors; this is not complete token coverage |
| `--accent`, `--accent-ink` | Accent `#165e59`; link `#10564e` | Buttons, links and headings | Cockpit uses `#285778` / `#225273` in its dashboard scope |
| `--focus` | Focus indicator `#026ebc` | Shared `:focus-visible` rule | Prior keyboard checks do not establish visibility in every condition |
| `--chart-1` to `--chart-5` | Five declared series/category colors | SVG marks, legend chips | The two directions use different values; tables preserve all numeric values |
| `--line`, `--soft`, `--chart-track` | Borders, subtle surface, chart track | Panels, chart and disclosure | Literal borders/backgrounds still exist and need scoped review before migration |
| `--radius` | Editorial `12px`; cockpit `7px` | Panels and metrics | Not every control radius uses this variable |

Spacing and typography currently use CSS literals. There is no SCSS source,
token interchange file or approved mapping to an external design system.
Do not add a second token namespace merely to match this example.

## Reuse and migration decision

1. Inspect the target repository's styles, imports and reusable component APIs.
2. Map each needed role to an observed target token or approved component variant.
3. Review remaining fixture literals in the affected scope before claiming token coverage.
4. Preserve current appearance and component behavior; justify each proposed alias.
5. Verify the target's declared themes and hover/focus, asynchronous and chart states.
6. Preserve before/after evidence and rollback if shared consumers regress.

## Gate

- [x] Synthetic source token file/revision and stylesheet digest recorded.
- [x] Representative specimen consumers and scope limits recorded.
- [ ] Target-product token/component inventory and approved alias mapping completed.
- [ ] Scoped literal/drift report and near-duplicate review completed.
- [ ] Every supported target theme and affected state verified.
- [ ] Migration and rollback accepted by the product owner.

The [QA review](qa-review-2026-11-16.md) preserves prior responsive captures and
automated accessibility observations for the fixture. It does not establish
production token compatibility, complete contrast coverage or dark-theme parity.
