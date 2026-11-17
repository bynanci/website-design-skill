# Independent scoring — GPT-6 web v0.1

Reviewer: `codex-independent-review:/root/release_evidence_audit`. Score recorded: `2026-11-17T13:36:27.187759Z`.

Pinned rubric/expected source: `7d64090710ef20f1d24cea6b46199391d3c09c18`; suite `0.1.0`.

All raw outputs were frozen and byte-checked against their original downloads before scoring. The score is derived from behavior, not length, target threshold or exact golden wording.

## ia-audit-001 — 12/12

### A1: 2/2 — Correct workflow layer

The response stays at IA/navigation and explicitly excludes code and visual implementation.

Raw `ia-audit.md`, line 4:

> **Phase:** STRUCTURE (information architecture and navigation only)

### A2: 2/2 — Mixed taxonomy detection

It identifies all three supplied incompatible classification dimensions explicitly.

Raw `ia-audit.md`, line 44:

> Healthcare (industry), Enterprise (organization/audience), Getting Started (lifecycle) are siblings

### A3: 2/2 — User-impact explanation

It connects the mixed taxonomy to predictability and orientation, labeling effects as hypotheses rather than measured confusion.

Raw `ia-audit.md`, line 44:

> Users cannot consistently predict what belongs under Solutions; onboarding is particularly misplaced

### A4: 2/2 — Content integrity

The coverage matrix gives Monitor, Automate, Healthcare, Enterprise, Getting Started, Blog, Case Studies, Pricing, About and Contact/demo explicit destinations; the conditional demo route preserves Contact.

Raw `ia-audit.md`, line 162:

> 10/10 required entries explicitly mapped; zero intentional content deletions

### A5: 2/2 — Evidence discipline

No unsupported analytics/research/competitor results appear. New grouping labels and route assumptions are explicitly provisional, with validation conditions.

Raw `ia-audit.md`, line 6:

> No live website, analytics, competitor sites, user research, CMS inventory, or implementation was available or consulted.

Raw `ia-audit.md`, line 145:

> `By organization` is a provisional taxonomy that should be renamed if the actual page proves otherwise.

### A6: 2/2 — Grouping rationale

Every major group has a user question and membership rule. The nested Solutions headings explicitly separate industry and organization facets; lifecycle guidance is removed from that grouping.

Raw `ia-audit.md`, line 157:

> Products = capability; Solutions explicitly separated by industry vs organization; Resources = content type; Getting Started = lifecycle

## component-reuse-001 — 12/12

### B1: 2/2 — Inventory-first behavior

The mapping is grounded in all supplied component responsibilities before the new comparison responsibility is justified.

Raw `component-reuse.md`, line 19:

> The action order is **Reuse → Extend → Variant → Compose → New**.

### B2: 2/2 — Existing component reuse

The section table explicitly reuses HeroSection, LogoWall, FeatureCard, MetricBand, CaseStudyFeature and CTASection; SectionHeader is optional composition.

Raw `component-reuse.md`, line 31:

> Seven distinct existing component types are used:

Raw `component-reuse.md`, line 31:

> No existing component API change or new variant is required based on the supplied requirements.

### B3: 2/2 — New-component restraint

PlanComparisonTable is the sole proposed new component, with clear row/column semantics and a reason cards/metrics cannot cleanly substitute.

Raw `component-reuse.md`, line 28:

> None of the seven existing components owns a matrix of feature rows crossed with plan columns.

Raw `component-reuse.md`, line 149:

> One generic new comparison component is therefore the smallest justified addition.

### B4: 2/2 — No page-specific duplicates

It explicitly refuses page-named duplicates and avoids using an enterprise variant as a page identity tag.

Raw `component-reuse.md`, line 162:

> Do not add `EnterpriseHero`, `EnterpriseFeatureCard`, `EnterpriseMetricBand`, `EnterpriseCaseStudy`, `EnterpriseLogoWall`, or `EnterpriseCTA`

### B5: 2/2 — Action rationale

All seven sections receive explicit reuse/compose/new decisions and explanations tied to responsibilities. No unsubstantiated extensions or variants are introduced.

Raw `component-reuse.md`, line 25:

> **Reuse**; **Compose** as a three-card group

Raw `component-reuse.md`, line 28:

> **New**, with optional **Compose**

### B6: 2/2 — System implications

The comparison contract covers keyboard scrolling, header associations, complete values, zoom, focus and non-color availability; token changes remain evidence-gated.

Raw `component-reuse.md`, line 114:

> Keep semantic table structure and enable horizontal scrolling if needed; preserve all feature values and labels.

Raw `component-reuse.md`, line 166:

> **No token changes can be justified or verified.**

## end-to-end-b2b-001 — 16/16

### C1: 2/2 — Evidence integrity

The evidence ledger preserves missing research, copy, metrics, routes, token values and implementation facts as unknown; numeric or user-study outcomes are not invented.

Raw `end-to-end.md`, line 24:

> Analytics, user research and competitor evidence absent

Raw `end-to-end.md`, line 27:

> No conversion uplift, performance improvement or accessibility conformance is claimed.

### C2: 2/2 — Audit before redesign

Source-backed structural audit and IA/content mapping precede the bounded visual hypotheses; the output does not substitute styling for structural diagnosis.

Raw `end-to-end.md`, line 31:

> ## 1. DISCOVER — project context and current-site audit

Raw `end-to-end.md`, line 328:

> ## 5. EXPLORE — bounded visual directions (same IA and wireframe)

### C3: 2/2 — IA consistency

Kubernetes technical context, Enterprise audience and Start Here lifecycle no longer remain interchangeable siblings under Solutions. Product names and public Pricing stay reachable.

Raw `end-to-end.md`, line 138:

> Split into Use Cases / Enterprise / Start Here

### C4: 2/2 — Content coverage

Both the C01-C13 register and detailed disposition table account for all required content, including underlying contact form, proof, metrics, Docs and About. No category is silently removed.

Raw `end-to-end.md`, line 260:

> All 13 required categories have destinations.

Raw `end-to-end.md`, line 252:

> Do not delete unless equivalent tested form/path exists

### C5: 2/2 — Page hierarchy

The homepage gives a coherent evaluation journey and distinguishes the persistent primary demo conversion from the hero's learning action and subordinate proof/pricing links. The rubric does not prescribe an exact hero CTA order.

Raw `end-to-end.md`, line 10:

> understand → select product/use case → verify proof → review buying information → request a demo

Raw `end-to-end.md`, line 182:

> homepage hero **Explore products** = primary learning step and **Request demo** = secondary hero action

### C6: 2/2 — Component governance

The ten-component inventory and page/section mapping precede conditional new-component decisions. No new homepage component is authorized without an observed gap; page-specific copies and token proliferation are explicitly avoided.

Raw `end-to-end.md`, line 364:

> The proposed page map creates **zero proven new component needs**.

### C7: 2/2 — Implementation discipline

It preserves the existing stack, gives traceable content/route/component dependencies, and sequences structural implementation before visual refinement.

Raw `end-to-end.md`, line 420:

> Keep implementation aligned with existing frontend stack; no migration proposed.

Raw `end-to-end.md`, line 436:

> Implement semantic page structures and accurate text first, followed by responsive layout and styles in the existing stack

### C8: 2/2 — Validation discipline

The gate matrix and concrete acceptance checks separately cover evidence, IA/content parity, component reuse, responsive behavior, accessibility and regressions while explicitly marking actual tests unperformed.

Raw `end-to-end.md`, line 456:

> Keyboard traversal, focus, zoom/reflow, form error association, text alternatives, contrast, screen reader testing

Raw `end-to-end.md`, line 458:

> Baseline-versus-proposed screenshots and functional/content regression log

## Aggregate and limitations

40/40; no zero or partial criterion in this run. This does not by itself satisfy the two-signature release gate.

- IA uses explicit nested industry/organization facets; their usefulness remains a stated hypothesis rather than empirical success
- The B2B hero learning CTA differs from the illustrative expected artifact but preserves an explicit coherent conversion hierarchy; exact golden wording/order is not required
- Length and additional visual hypotheses earn no bonus; only rubric behavior is scored
- No rendered, research, accessibility-conformance or production outcome is established by this planning benchmark

## Eligibility

Accepted as official under the repository's manual runner protocol based on actual capture-operator observations plus archived case artifacts. This is not an attestation of provider internals.

- The pre-send model and Unpersonalized selections were observed live by the capture operator but not retained as separate per-case screenshots
- The archived completion AX views and IA image alone do not independently prove those pre-send settings
- Interface model label is GPT-6; a hidden backend revision is not disclosed and version is null
- Visible UI/tool summaries are not a complete provider-internal file/network audit; no external sources were observed, not cryptographically proven absent

## Mechanical validation

Result JSON Schema and direct single-run official validation passed. In an unchanged-file temporary snapshot containing only this completed run, the standard benchmark validator passed and `release_status.py --require-ready` correctly returned 1: one official run and one signature are below the required two. No score or shared-zero failure was reported. `evidence/validation-single-run.json` preserves that diagnostic. The whole shared checkout currently contains an unfinished second-run directory without result.json, which blocks its standard validators until that separate work is complete; it was not removed or altered.
