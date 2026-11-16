# Harbor Account Workspace — Token Extraction Plan

Status: **inventory pending**. No CSS/SCSS files or actual token values were
provided. This document avoids presenting invented tokens as existing assets.

## Source evidence

- Existing source tokens: **unknown**, repository stylesheet not provided.
- Component consumers: AccountHeader, MetricTile, ObservationPanel,
  RevenueCompositionChart, RevenueTrendChart, OpportunityList, CasesTable,
  NotesEditor, SectionHeader, Disclosure.
- Theme modes and contrast targets: **not supplied**.

## Proposed semantic mapping (not implemented)

| Observed source | Candidate semantic role | Consumers | Decision |
|---|---|---|---|
| Unknown | text.primary / text.muted | Observations, notes, metrics | Inspect existing before alias |
| Unknown | surface.page / surface.raised | Panels, editor, dialog | Inspect existing before alias |
| Unknown | space.section / space.component | Page hierarchy, charts | Check tokens and density |
| Unknown | type.heading / type.body / type.data | Observations, chart labels | Check legibility across locales |
| Unknown | chart.series / chart.grid / chart.label | Revenue charts | Preserve category/series distinction |
| Unknown | action.focus / status.error | Controls and save states | Check non-color indicators |
| Unknown | motion.feedback / motion.reduced | Loading, disclosures | Test motion preference |
| Unknown | layout.content / layout.sidebar | Dashboard grid | Prefer layout pattern over page-only value |

Names are illustrative **candidate roles**, not a mandate to introduce a
second naming scheme. Map to existing project semantics first.

## Reuse and migration decision

1. Inspect the actual style settings and search their consumers.
2. Note repeated literal values separately from semantic roles.
3. Preserve current appearance while adding aliases where appropriate.
4. Refactor shared components before layout-specific overrides.
5. Validate light/dark, hover/focus, empty/loading/error and chart states.
6. Capture before/after screenshots; rollback if shared components regress.

## Gate

- [ ] Source token file/revision linked — not yet.
- [ ] Every proposed alias has a consumer and reason — pending.
- [ ] No redundant near-duplicate tokens — not yet verified.
- [ ] Responsive and theme output visually compared — not yet.
- [ ] Migration and rollback accepted by owner — pending.
