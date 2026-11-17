# Responsive Layout — Case 001 (Optional v0.2 Pilot)

## Context

Fictional B2B account dashboard. Account managers use it to decide which
customer issue to raise next. You are planning a redesign, not implementing
code. The source material is deliberately incomplete.

Current page contains these required modules:

1. Account identity and contact context.
2. Four KPI summaries (revenue, trend, cases, renewal status).
3. Four ordered AI observations, each with an evidence link and a suggested
   follow-up question.
4. Revenue composition chart with five categories and a legend.
5. Service revenue trend with multiple series.
6. Cases table with status, owner, due date and row actions.

Existing reusable components:
- AccountHeader, KPITile, ObservationCard, DonutChart, TrendChart,
  CaseTable, SectionHeading, DisclosurePanel.

Known issues provided by the product owner:
- At narrow widths, the chart legend overlaps data marks.
- AI observation descriptions are truncated in a fixed-height card.
- Table actions are available only on hover.
- Some sections are hidden in the current mobile stylesheet.

Product-owner preference: all six modules should ideally fit in a desktop
1366 x 768 viewport without page scrolling. This is a preference, **not**
permission to shrink type or delete content. Vertical scrolling is allowed
on mobile.

The redesign must consider 1920 x 1080, 1366 x 768, 390 CSS px, 320 CSS px,
200% desktop zoom, and a narrow embedded panel. No actual screenshots,
analytics, WCAG audit results, or device measurements are supplied.

## Task

Produce a responsive behavior contract and a small validation plan.

- Preserve the required information and account-manager workflow.
- Explain any single-screen/readability trade-off honestly.
- Choose behavior for narrow charts, tables, legend, multi-series data,
  evidence links, and row actions.
- Describe keyboard and non-hover access.
- Separate supplied facts, design hypotheses, and untested claims.
- Reuse existing components before proposing new ones.

Do not invent revenue values, test results, breakpoints proven by testing,
new UX research, or implementation completion.
