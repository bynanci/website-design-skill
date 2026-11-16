# Accessibility Review — Case 001 (Optional v0.2 Pilot)

## Context

You are asked to review a fictional analytics/account page before visual
polish. The following defects were reported by internal manual testers:

- A revenue trend tooltip opens only on mouse hover; no keyboard path.
- The pie chart uses color alone to identify categories.
- A filter dialog opens, but keyboard focus remains behind it.
- After closing the dialog, focus does not return to the trigger.
- A form field has placeholder text but no visible or programmatic label.
- A decorative loading animation has no reduced-motion behavior.
- A text link showing an AI observation's evidence source is visually
  present, but its label is simply "here".

No contrast measurements, screen-reader transcripts, automated scan results,
specific browser matrix, or public conformance audit were provided.

The team wants a modern, visually refined redesign. They prefer reusing
TrendChart, PieChart, FilterDialog, TextField, Link, and LoadingIndicator.

## Task

Produce a prioritized accessibility remediation plan that names the
responsible component layer, proposes checks for keyboard/screen reader/
visual behavior, and lists missing verification evidence. Do not change the
business content or claim that WCAG conformance has been established.

Distinguish:
- reported defects;
- plausible causes not yet verified;
- fixes proposed at a shared reusable layer;
- manual/automated validation still required.
