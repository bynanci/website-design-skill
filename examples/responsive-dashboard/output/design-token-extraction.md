# Harbor Dashboard — observed token inventory

[繁體中文](design-token-extraction.zh-TW.md)

The current fixture has an inspected CSS source. Target-product **inventory pending**: these public values do not establish tokens, aliases or component compatibility in another repository.

## Sources and scopes

`specimen/index.html` directly loads `styles.css`. Its root declares light defaults and `:root[data-theme=dark]` overrides dark values. `components.js` creates SVG marks that reference `--chart-*` properties. `app.js` changes the root theme attribute; it does not compile or fetch styles.

The current source is tracked by the [2026-11-17 evidence record](qa-review-2026-11-17.md). Use the source digests in its final raw artifact before comparing values. The older stylesheet digest in the 2026-11-16 report identifies only that historical version.

| Observed tokens | Light / dark examples | Consumers |
|---|---|---|
| `--canvas`, `--surface` | `#f6f7f6` / `#111a19`; `#fff` / `#182522` | Page, panels, controls and dialog |
| `--ink`, `--muted` | `#1c2d31` / `#edf5f0`; `#52625d` / `#b7c9bf` | Main text, metadata, feedback and SVG labels |
| `--accent`, `--accent-ink`, `--on-accent` | Accent `#165e59` / `#9cd8bd`; on-accent `#fff` / `#102c21` | Buttons, active direction, links and brand mark |
| `--focus`, `--control-line` | Focus `#026ebc` / `#85c8ff`; boundary `#6b8178` / `#789c88` | Focus outline and control borders |
| `--warning-ink`, `--warning-bg` | Ink `#906420` / `#f5d68c`; background `#fff8e9` / `#443715` | Observation caution and case status |
| `--danger-ink`, `--danger-bg` | Ink `#a45733` / `#ffc2a4`; background `#fff2eb` / `#4b2c23` | Error feedback and high-priority case badges |
| `--chart-1` … `--chart-5`, `--chart-track` | Five category/series colors and a track value per theme | Revenue graphics and legend chips |
| `--radius` | Editorial `12px`; cockpit `7px` | Panel/metric radius inside the dashboard |

Warning and high-priority/error styles have distinct tokens. The specimen has no destructive operation; the `danger` name does not prove delete/irreversible-action semantics. Numeric tables and named feedback retain chart meaning independently of color.

## Reuse and remaining drift scope

The eight native factories package the account, metrics, observations, charts, opportunities, cases and notes responsibilities. The host owns theme preference and dialog/read behavior. This is actual native template reuse within the specimen; integration with an external Vue/React component inventory is still unrun.

Editorial and cockpit now share the theme palette. Cockpit changes density, radius, border treatment and spacing. Typography, layout sizes and some decorative/shadow values remain CSS literals. There is no SCSS, Tailwind configuration, token interchange file or claim of complete literal elimination.

Before migration, inspect the target product's import chain and component APIs, map each requested role, approve any new token or local exception, then compare affected consumers in every declared theme/state. Preserve the prior candidate and source hashes for rollback. The current QA matrix and six tagged axe scans are scoped evidence; they do not certify all token use or contrast combinations.

## Evidence status

- [x] Token declarations, theme selectors and representative consumers inspected.
- [x] Native component and host ownership boundaries recorded.
- [ ] Current candidate's complete matrix/native-zoom CI result linked and reviewed in the dated report.
- [ ] External product token/component mapping, scoped drift denominator and migration approval completed.
- [ ] Screen-reader, physical-device and production-theme evidence collected where required.
