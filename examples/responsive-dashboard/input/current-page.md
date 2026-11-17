# Harbor Account Workspace — Synthetic Input

## Goal and user task

A B2B account manager opens this dashboard before a customer meeting to:
identify the highest-priority account change, inspect supporting evidence,
prepare a follow-up question, and record a human decision.

All names and requirements below are fictional examples. No real customer data
or usage analytics are supplied.

## Required content

1. **Account summary:** company, contact owner, industry and account status.
2. **KPIs:** four summaries for total service revenue, revenue change, open
   cases and opportunity count.
3. **AI observations:** four ordered observations (01–04), each with a
   claim, source/evidence, confidence or unknowns, and a meeting question.
4. **Revenue mix:** multi-category proportion chart with legend.
5. **Service revenue trend:** time-series with several service lines.
6. **Opportunity notes:** two potential follow-ups, marked as suggestions.
7. **Cases:** data table with status, owner, priority and next action.
8. **Human note:** an editable field and save state for the account manager.

## Known current problems (supplied, not independently measured)

- AI observation text is cut off by fixed-height panels.
- Chart legends collide when the panel is narrow.
- Some case actions only appear on hover.
- The grid wastes vertical space at wide widths but compresses type at
  laptop widths.
- A stakeholder would prefer no page scrolling at 1366 x 768.

## Existing components / design boundaries

- AccountHeader
- MetricTile
- ObservationPanel
- RevenueCompositionChart
- RevenueTrendChart
- OpportunityList
- CasesTable
- NotesEditor
- SectionHeader
- Disclosure

Use the existing design tokens; no actual token file was provided in this
fixture. Do not invent current token values or say that implementation exists.

## Conditions to consider

- 1920 x 1080 and 1366 x 768 desktop.
- 768 CSS px split view, 390 and 320 CSS px mobile.
- 200% zoom on desktop; container narrower than viewport.
- Keyboard and touch inputs; hover cannot be the only path.
- Dense real-world text lengths, error/empty/loading data states.

## Open questions

- Minimum and maximum real content lengths.
- Whether any chart supplies an accessible data-table view.
- Design tokens, theme variants and typography metrics.
- Which desktop modules the owner explicitly permits to collapse.
- Whether the page must avoid all scrolling or only prioritize initial
  meeting-preparation information above the fold.

Do not treat open questions as measured results.
