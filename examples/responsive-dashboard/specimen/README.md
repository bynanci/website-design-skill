# Harbor Account Workspace — executable synthetic specimen

Open index.html in a modern browser (no build system, API, tracking, fonts
or backend dependencies). All names and numbers are fictional.

The public specimen implements the optional design contracts proposed in
PR #5 and Issue #7. It preserves:

- Account identity and four KPI tiles
- Four ordered AI observations with evidence links and meeting questions
- Revenue composition and service trend charts
- Two explicitly unconfirmed opportunity hypotheses
- Three case records with always-visible actions
- A human note form with an **honest local-only** save status

Two visual directions are switchable, share the same DOM content, and use
CSS semantic tokens instead of page-specific styling overrides.
Responsive layout uses a dashboard container and intentional reflow.
Charts expose keyboard-focusable SVG points and accessible data tables.
The native dialog supports Escape and focus restoration. The note form
does not persist or send anything.

Use ../qa/README.md to generate browser screenshots and QA data.
Rendered output and accessibility require observed evidence; a CI pass
is NOT screen-reader conformance or production readiness.

This is a functional demonstration, not a real customer dashboard,
authenticated product, or performance-tested deployment.
