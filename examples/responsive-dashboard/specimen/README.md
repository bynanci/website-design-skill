# Harbor Account Workspace — executable component specimen

[繁體中文](README.zh-TW.md)

Open `index.html` directly. The load order is `fixture-data.js` → `components.js` → `app.js`. Trusted native `<template>` markup supplies structure; fixture values are assigned through text nodes and approved local evidence IDs.

## Reusable factories

`DashboardComponents.create(name, props, {idPrefix})` returns a detached element. Supply a unique prefix ending in `-` when mounting another instance; the factory rewrites its local IDs, labels and ARIA references. It does not prefix links to evidence owned by the page.

| Factory | Content responsibility | Main props |
|---|---|---|
| `AccountSummary` | Account identity and details | `name`, `summary`, `details` |
| `MetricGrid` | Four metric summaries | `items` |
| `InsightList` | Ordered claims, evidence and meeting questions | `items` |
| `RevenueMix` | Revenue categories, legend, exact table and local feedback | `title`, `mix` |
| `NotesEditor` | Labeled page-local note and save feedback | `title` |
| `RevenueTrend` | Series/month values, legend, exact table and local feedback | `title`, `months`, `trend` |
| `OpportunityList` | Explicitly unconfirmed opportunities | `items` |
| `CaseTable` | Case fields and visible action buttons | `items` |

Each factory packages an existing content responsibility from the synthetic brief. Chart builders, roving keyboard handlers and note-submit feedback close over their own roots. Additional instances are checked by the runner with different data and ID prefixes. Cases emit ordinary button clicks with `data-case`; the page host delegates dialog actions for initial and later-created tables, reads each instance’s rendered text and restores focus to its connected trigger. A different host must supply its own dialog/action binding.

## Host behavior

`app.js` owns the one-page direction switch, theme preference, floating acceptance panel, native case dialog and synthetic read owner. It exposes the test-only `__DASHBOARD_FIXTURE__` interface. Loading, empty and error conditions hide/inert the data surface; retry returns to the already mounted synthetic success data without deleting notes. Repeated in-flight reads coalesce. A persisted `pagehide` suspends pending work; `pageshow` resumes the retained owner. A nonpersisted hide disposes it.

Supported query examples are `?theme=dark`, `?floating=1` and `?state=error`. Native dialog Enter/Escape, explicit Tab containment and focus return are part of the declared checks. The floating panel reserves desktop space and reflows into normal document flow at narrower widths.

## Styling and evidence

Editorial and cockpit share the same component/data structure. They vary spacing, density and radius; light/dark themes provide semantic color values independently. Container queries reflow the dashboard while retaining full text, chart tables and case fields.

Use [the QA commands](../qa/README.md) and [current evidence record](../output/qa-review-2026-11-17.md). The new CI result is tracked there; the older dated report applies only to its earlier source. This specimen has no authentication, real service, persisted notes, external font dependency or production performance claim.
