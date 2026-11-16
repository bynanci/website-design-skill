# Design Token Extraction & Migration (Optional v0.2 Preview)

Capture the **existing** token contract before proposing a new one. Work from
observed CSS/design sources; do not fabricate brand values or imply a token has
been adopted without implementation evidence.

## Sources and constraints

- Repository / design source and revision:
- Existing settings, theme files, or token inventory:
- Component inventory:
- Brand / accessibility requirements:
- Light, dark, high-contrast or other modes in scope:
- Existing naming scheme and consumer paths:
- Unknowns / evidence gaps:

## Inventory and semantic mapping

| Category | Observed source token / literal | Current consumers | Proposed semantic role | Action | Evidence |
|---|---|---|---|---|---|
| Color / foreground | | | | Reuse / Alias / Migrate / Retain | |
| Color / surface | | | | | |
| Typography | | | | | |
| Spacing | | | | | |
| Radius / border | | | | | |
| Elevation / shadow | | | | | |
| Motion / duration / easing | | | | | |
| Layout / container | | | | | |
| Chart palette / state | | | | | |

## Layer model and naming

- Primitives / raw values (existing, with source):
- Semantic tokens (purpose, not color name):
- Component-level aliases (only when behavior is truly unique):
- Responsive or container-scoped variants:
- Theme-mode mapping:
- Fallback behavior:
- Naming collisions or deprecated aliases:

## Candidate token decisions

| Token | Default reference | Other theme / state | Component consumers | Reason | Compatibility risk | Decision |
|---|---|---|---|---|---|---|
| | | | | | | Proposed / Approved / Rejected |

Do not add a token merely because a single page looks different. Prefer a
shared token or existing variant; justify every new semantic role.

## Migration plan

1. Record source files and exact current usages.
2. Introduce aliases with existing visual output unchanged where feasible.
3. Migrate shared components before page-specific overrides.
4. Verify theme, density, responsive, interaction, and contrast states.
5. Deprecate only after consumer search and regression checks.
6. Document rollback and any visual change separately from refactoring.

## Validation matrix

| Component / state | Existing behavior | New behavior | Theme / viewport / zoom | Method / evidence | Result |
|---|---|---|---|---|---|
| | | | | | Not tested / Pass / Fail |

- [ ] Source values and assumptions are distinguishable.
- [ ] Semantic roles are stable across themes and components.
- [ ] No unnecessary near-duplicate tokens or one-off overrides were introduced.
- [ ] Interactive, disabled, hover, focus, and data-visualization states are covered.
- [ ] Regressions are checked on multiple pages, not just the redesigned page.
- [ ] Changes are reversible and the migration owner is identified.
