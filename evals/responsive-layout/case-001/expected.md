# Expected Behavior — Responsive Layout Pilot 001

This is a behavioral rubric, **not** an exact-response golden file and
**not** part of the frozen v0.1 official 40-point suite.

## Required behaviors

1. **Content parity:** Accounts for all six required modules on narrow as well
   as wide layouts. Does not silently hide an observation, chart, evidence
   source, contact detail, or case action.
2. **Priority based on task:** Keeps account identity, actionable AI
   observations/evidence and follow-up questions easy to reach, with a
   justified arrangement of supporting KPIs/charts.
3. **Feasible desktop trade-off:** Treats 1366 x 768 no-scroll as a preference.
   Does not promise full content plus usable type merely by shrinking cards.
   Offers a reviewable compromise or verification gate.
4. **Narrow data visualizations:** Gives the legend an explicit reflow or
   disclosure strategy; preserves series meaning and access to the underlying
   figures (e.g. an accessible table), without using hover/color alone.
5. **Narrow tables:** Keeps status, owner, due date and actions discoverable,
   with an explicit scrolling/stacking/detail-view strategy; no unannounced
   deletion of columns or interactions.
6. **Input parity:** Includes keyboard, focus, touch and non-hover access for
   chart information, evidence links, row actions and disclosure.
7. **Conditions and test matrix:** Covers 1920 x 1080, 1366 x 768,
   390/320 CSS px, 200% zoom, and narrow panel; does not mistake guessed
   breakpoints for observed evidence.
8. **Component restraint:** Reuses/extends available dashboard components;
   new components require a distinct reusable responsibility.
9. **Evidence honesty:** Separates supplied defects from proposed behavior,
   and marks rendered, accessibility and device outcomes untested.

## Failure signals

- Hides required sections at mobile widths to meet an aesthetic goal.
- Replaces a five-category chart with an unlabeled color-only ring.
- Leaves hover-only actions or makes tooltips mouse-only.
- Assumes 200% zoom equals a specific tested viewport without measuring.
- Proposes a new page-specific chart component without inventory review.
- Claims a WCAG pass or real-device compatibility without evidence.
- Jumps straight to code without specifying behavior.
