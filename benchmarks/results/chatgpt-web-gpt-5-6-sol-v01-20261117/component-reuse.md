# Component Reuse Fixture 001 — Enterprise Landing Page Component Mapping

## Decision basis

This mapping follows the required decision order:

`Reuse → Extend → Variant → Compose → New`

The supplied inventory already covers the hero, logo proof, capability cards, metrics, case study, and final CTA. The only requested pattern whose responsibility is not represented is the three-plan feature comparison table.

No implementation code is included.

## 1. Existing component inventory

| Component | Existing responsibility | Relevant variants | Decision for this page |
|---|---|---|---|
| `HeroSection` | Page-level heading, supporting copy, primary/secondary CTA, optional media | `default`, `centered` | Reuse |
| `SectionHeader` | Eyebrow, section title, supporting description | — | Not required by the stated page content; compose only if section headings are later supplied |
| `FeatureCard` | One capability or benefit, optional icon/media, optional CTA | `default`, `emphasized`, `compact` | Reuse |
| `MetricBand` | Group 2–6 key metrics with labels/supporting notes | — | Reuse |
| `CTASection` | Final or mid-page conversion block | `default`, `compact` | Reuse |
| `CaseStudyFeature` | Featured customer story with summary, proof, and CTA | — | Reuse |
| `LogoWall` | Customer/partner logo proof | — | Reuse |

## 2. Duplication findings

No near-duplicate components are evident in the supplied inventory. The requested page does **not** justify Enterprise-specific versions such as `EnterpriseHero`, `EnterpriseFeatureCard`, or `EnterpriseCTASection`, because the existing components already own those UI responsibilities.

The plan comparison pattern is materially different from the responsibilities of the existing components. Folding it into `FeatureCard`, `MetricBand`, or another existing component would blur responsibility rather than increase coherent reuse.

## 3. Section-to-component mapping

| # | Requested section | Pattern | Component | Action | Justification |
|---|---|---|---|---|---|
| 1 | Hero with heading, description, “Request demo” primary CTA, and “View pricing” secondary CTA | Page hero | `HeroSection` | **Reuse** | The existing content model explicitly supports a page-level heading, supporting copy, and both primary and secondary CTAs. No extension or page-specific variant is required. Use an existing visual variant (`default` or `centered`) according to the page’s established layout direction; the fixture does not provide evidence to select one. |
| 2 | Trust section with customer logos | Logo proof | `LogoWall` | **Reuse** | Its stated responsibility is customer/partner logo proof, which exactly matches the requirement. |
| 3 | Three enterprise capability cards | Capability card group | 3 × `FeatureCard` | **Reuse / Compose** | Each item is one capability, exactly matching `FeatureCard`. The section is a composition of three existing cards; no `EnterpriseFeatureCard` is warranted. The fixture does not specify a need for `emphasized` or `compact`, so no new variant is justified. |
| 4 | Four scale/reliability metrics | Metric band | `MetricBand` | **Reuse** | `MetricBand` supports 2–6 metrics, so four metrics fit the existing responsibility and capacity unchanged. |
| 5 | Customer case study | Featured customer proof | `CaseStudyFeature` | **Reuse** | Its responsibility already covers a featured customer story with summary, proof, and CTA. |
| 6 | Plan comparison table with feature rows and three plan columns | Plan/feature comparison | `PricingTable` | **New** | No existing component represents a matrix/table comparing features across plans. Extending cards or metrics to own tabular comparison would create an unstable, mixed responsibility. A generic `PricingTable` is reusable beyond this page and follows the reference naming guidance. |
| 7 | Final demo CTA | Conversion block | `CTASection` | **Reuse** | A final conversion block is the component’s explicit responsibility. No Enterprise-specific component is needed. |

### Optional section-heading composition

If headings, eyebrows, or descriptions are later supplied for sections 2–6, compose the relevant section with the existing `SectionHeader`. None are specified in the fixture, so this mapping does not invent them.

## 4. New component contract

# Component Contract

## Component

- Name: `PricingTable`
- Purpose: Compare a defined set of features across multiple plans in a structured table.
- Status: Proposed

## Responsibility

Own the presentation of plan columns against feature rows so users can compare which features belong to which plans.

It must not absorb unrelated pricing-page responsibilities such as a page hero, testimonial content, general feature cards, or final conversion messaging.

## Content model

| Field | Required | Type / shape | Notes |
|---|---|---|---|
| `plans` | Yes | Ordered collection of plan objects | This fixture requires exactly three plan columns, but the reusable component should represent plan columns generically rather than encode Enterprise-page names. |
| `plans[].name` | Yes | Text | Column heading for the plan. Actual plan names are not supplied in the fixture. |
| `rows` | Yes | Ordered collection of feature rows | One row per compared feature. |
| `rows[].feature` | Yes | Text | Row heading/feature name. Actual feature names are not supplied. |
| `rows[].values` | Yes | Ordered values aligned to `plans` | Value/status for each plan. Exact value vocabulary is not supplied; do not assume checkmarks, text, limits, or prices without content evidence. |
| `caption` | No | Text | Optional accessible/visible table title when page content provides one. |

## Variants

No variant is justified by the supplied requirement. Add variants only when repeated future use demonstrates a bounded structural or presentation need.

## States

- Default

No loading, error, disabled, active, or other interactive state is required by the fixture because no dynamic data or table interaction is specified.

## Responsive behavior

| Breakpoint / condition | Behavior |
|---|---|
| Sufficient width for all columns | Render the full comparison matrix with feature labels and all plan columns visible together. |
| Width insufficient for a readable matrix | Preserve table semantics and column relationships; place the comparison in a horizontally scrollable region rather than collapsing it into ambiguous card stacks. Keep row and column headers understandable while scrolling. |

## Interaction

- Trigger: None required by the fixture.
- Response: Static comparison presentation.
- Keyboard behavior: If horizontal overflow is used, the overflow region must be keyboard reachable/operable where platform behavior requires it.
- Focus behavior: Do not add focusable elements unless the table later contains actual interactive controls or links.

## Accessibility

- Semantic role: Use native tabular semantics for the comparison matrix.
- Accessible name: Provide a caption or equivalent labelled relationship when a comparison title is supplied.
- Keyboard requirements: Any scroll container or future interactive controls must remain keyboard accessible.
- Header relationships: Plan names act as column headers; feature names act as row headers so values can be associated with both dimensions.
- Contrast / visual requirements: Do not rely on color alone to communicate feature availability or differences.
- Motion considerations: None required.

## Composition rules

May contain:
- plan column headers;
- feature row headers;
- per-plan comparison values.

May be contained by:
- a standard page section;
- a section composed with `SectionHeader` when heading content exists.

Must not:
- become an Enterprise-page-specific component;
- duplicate `FeatureCard`, `MetricBand`, or `CTASection` responsibilities;
- encode plan names or feature content that belongs to page data/content;
- require pricing values when the comparison is feature-only.

## Reuse decision

Before creating this component, verify:

- [x] Existing component cannot be reused unchanged
- [x] Existing component cannot be extended safely
- [x] A variant is insufficient
- [x] Composition of existing primitives is insufficient

Preferred order followed:

`Reuse → Extend → Variant → Compose → New`

## Validation

- [x] Responsibility is clear
- [x] API/content model is minimal for the supplied requirement
- [x] Variants are bounded (none introduced without evidence)
- [x] Responsive behavior is defined
- [x] Accessibility is defined
- [x] Near-duplicate components were considered

## 5. Token changes

**None required from the supplied evidence.**

The fixture provides no token inventory, visual specification, or repeated visual-value problem. Introducing new spacing, color, typography, border, or layout tokens would therefore be unsupported. If implementation later reveals a repeated visual decision not covered by existing tokens, address it at the token layer before adding page overrides.

## 6. Migration impact

- Add one reusable shared component: `PricingTable`.
- Reuse the six matching existing component responsibilities unchanged.
- Do not add Enterprise-specific copies or wrappers solely for naming/context.
- Do not change existing component APIs based on this fixture.
- `SectionHeader` remains available for composition if actual section-heading content is later provided; no such content is invented here.

## 7. Validation result

| Validation gate | Result | Basis |
|---|---|---|
| Repeated patterns map to shared components | Pass | Hero, logo proof, capability cards, metric band, case study, and CTA all map to existing shared components. |
| Component responsibilities are understandable | Pass | Every mapped component retains its stated responsibility; comparison is isolated in one clear new responsibility. |
| Variants are bounded | Pass | No new variants are introduced. |
| Near-duplicates are consolidated/avoided | Pass | No Enterprise-specific hero/card/CTA copies are proposed. |
| Tokens cover repeated visual decisions | Not assessable from fixture | No token inventory or visual styling evidence is supplied; no unsupported token changes are proposed. |
| Responsive behavior is defined | Pass for new component contract | `PricingTable` defines wide and constrained-width behavior. Existing component responsive contracts were not supplied and are not invented. |
| Accessibility behavior is retained/defined | Pass for new component contract | Native table semantics, header relationships, non-color-only communication, and overflow operability are specified. Existing component accessibility behavior was not supplied and is not rewritten. |
| Page-specific overrides are exceptional | Pass | None are proposed. |

## Final component composition

```text
Enterprise landing page
├─ HeroSection
├─ LogoWall
├─ FeatureCard × 3
├─ MetricBand
├─ CaseStudyFeature
├─ PricingTable          ← new reusable component
└─ CTASection
```

### Final decision

Create **one** new shared component, `PricingTable`. Reuse all other applicable components unchanged. This satisfies the requested page without component explosion, unsupported extensions, or page-specific naming.
