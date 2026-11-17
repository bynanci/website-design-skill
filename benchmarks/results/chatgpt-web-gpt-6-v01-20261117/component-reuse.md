# Enterprise Landing Page — Component Mapping and Reuse Decision

**Case:** `component-reuse-001`  
**Deliverable:** Design specification and component mapping; no implementation code.  
**Source boundary:** The packet's `SKILL.md`, declared case input, and skill-directed workflow/component architecture references and templates only. No live website, repository, implementation, content source, or external research was available or inspected.

## 1. Page goal and scope

**Page goal:** Present enterprise capabilities and credibility, support evaluation across three plans, and make requesting a demo the primary conversion path.

**Primary audience (inferred, not supplied):** People evaluating an enterprise offering and comparing plans. **Primary task:** Determine whether the offering meets enterprise needs, inspect comparative plan features, and request a demo. These are design hypotheses derived from the requested content, not researched user findings.

**Current problems:** No current Enterprise page, live design, usage metrics, or implementation was supplied. Existing problems therefore cannot be observed. The architecture risk to prevent is unnecessary component duplication, particularly creating page-named hero, feature, metric, logo, story, or CTA components and forcing tabular comparison into a card component.

**Structure status:** The seven-section order is supplied by the case and retained as the working wireframe. The actual facts, destination URLs, plan labels, and assets remain unprovided; the composition can be specified but its content cannot be validated as complete.

## 2. Section-to-component mapping and justification

The action order is **Reuse → Extend → Variant → Compose → New**. An existing variant selected without changing its contract counts as **Reuse**, not as creation of a new variant. Section layout/composition does not automatically imply a new component.

| # | Required section / pattern | Component mapping | Decision | Rationale and composition | Content / interaction requirements |
|---|---|---|---|---|---|
| 1 | Hero | `HeroSection` (`default` variant unless a centered layout is deliberately selected) | **Reuse** | Existing responsibility explicitly includes page heading, support copy, primary and secondary CTAs, and optional media. No extension or Enterprise-specific hero is justified. | Heading and description; primary **Request demo**; secondary **View pricing**. Media is optional, not presumed. |
| 2 | Customer trust logos | `LogoWall`; optionally precede with `SectionHeader` if editorial heading/copy is provided | **Reuse**; optional **Compose** | `LogoWall` already owns customer/partner-logo proof. A section heading, if needed, belongs to `SectionHeader`, not a new `EnterpriseLogoWall`. | Actual approved customer logos and accurate accessible names are required; no names or marks are invented. |
| 3 | Three enterprise capability cards | Three instances of `FeatureCard`, with optional `SectionHeader` | **Reuse**; **Compose** as a three-card group | `FeatureCard` already represents one capability/benefit, with optional icon/media/CTA. Existing `default`, `emphasized`, and `compact` variants suffice; there is no evidence a new variant is needed. `SectionHeader` supplies any shared section title or description. | Exactly three distinct capabilities; names, descriptions, media, and card links remain content inputs. Use consistent `default` cards unless evidence calls for emphasis. |
| 4 | Four scale/reliability metrics | One `MetricBand` instance | **Reuse** | The component explicitly supports a group of **2–6** metrics with labels and supporting notes; four fits its contract exactly. No custom grid or extension is warranted. | Exactly four verified metric values with labels, units, conditions/time frames, and notes as applicable. No numerical claims are supplied. |
| 5 | Featured customer case study | `CaseStudyFeature` | **Reuse** | Existing responsibility covers a featured customer story, summary, proof, and CTA. A generic feature card would weaken the story/proof contract. | Customer identity/permission, factual summary and evidence, and destination for its CTA remain outstanding. |
| 6 | Feature-by-plan comparison, three plan columns | **`PlanComparisonTable`** (new reusable component), optionally with `SectionHeader` | **New**, with optional **Compose** | None of the seven existing components owns a matrix of feature rows crossed with plan columns. `FeatureCard` compares one capability, `MetricBand` displays metrics, and `CTASection` presents conversion content; bending them into a data table would blur responsibilities and impair accessibility. A bounded, generic comparison table is warranted. | Three plan headers; feature rows; one value/status per plan per row. Plan names, feature values and any plan CTAs are not supplied and must not be invented. |
| 7 | Final demo CTA | `CTASection` (`default` unless compact density is justified) | **Reuse** | Existing responsibility is a final or mid-page conversion block. No page-specific CTA component or new variant is needed. | Primary action **Request demo**, with destination to be provided. Do not add an unrequested secondary CTA by default. |

**Reuse summary:** Seven distinct existing component types are used: `HeroSection`, `SectionHeader` (optional section composition), `FeatureCard`, `MetricBand`, `CTASection`, `CaseStudyFeature`, and `LogoWall`. One new shared component, `PlanComparisonTable`, is proposed. No existing component API change or new variant is required based on the supplied requirements. If section headings are not provided, omit optional `SectionHeader` instances rather than invent copy.

## 3. Low-fidelity page specification

| Order | Section purpose and hierarchy | Primary user-facing interaction | Responsive notes | Accessibility notes |
|---|---|---|---|---|
| 01 | **Hero** — single page-level heading, supporting description, primary and secondary actions | Request demo; View pricing | Allow CTAs to wrap/stack in reading order; optional media must not obscure text | One semantic `h1`; descriptive action labels; visible focus and adequate touch targets |
| 02 | **Trust** — optional section heading followed by logos | Logos are evidence; links only if meaningful and actually provided | Responsive wrapping without reducing marks to unreadable sizes | Customer names in text alternatives; avoid redundant repeated announcements; logos are not proof of endorsement beyond permitted use |
| 03 | **Capabilities** — optional heading and three cards | Optional card CTA only when actual destination exists | Three columns may reduce to two then one according to available width; preserve logical sequence | Use list/group semantics and hierarchical headings; card links have distinguishable accessible names |
| 04 | **Scale / reliability** — four-item metrics band | Primarily informational | Wrap or stack metrics; labels and qualifying notes remain adjacent to values | Expose numeric values and units as text; no evidence conveyed by color alone |
| 05 | **Customer story** — featured proof narrative | Case-study CTA if supplied | Reflow copy/media without changing reading order | Meaningful media alternatives and descriptive CTA; factual claims require substantiation |
| 06 | **Plan comparison** — heading, matrix with feature rows and three plan columns | Inspect differences; optional links only if provided | Prefer a horizontally scrollable semantic table or equivalent fully labeled accessible comparison, not silently truncated columns | Row and column headers must remain programmatically associated; keyboard access and visible overflow affordance |
| 07 | **Final demo CTA** — terminal conversion section | Request demo | Maintain legibility and obvious primary action across widths | Clear CTA name, focus indicator, contrast; no surprise navigation behavior |

**CTA hierarchy:** **Request demo** is primary in the hero and final section. **View pricing** is secondary in the hero. Capability/case-study links remain optional and subordinate; the plan comparison has no invented CTAs. The pricing destination might be a distinct route or the comparison section, but the supplied case does not establish which. Confirm destination behavior before implementation.

## 4. Content coverage matrix

This matrix covers **requested content**, not a current-site inventory: no existing site content was supplied. “Missing” identifies required copy/data not provided in the fixture, not omitted sections. All seven structural requirements are accounted for.

| Required content | Proposed location | Structural disposition | Content status | Notes / resolution needed |
|---|---|---|---|---|
| Hero heading and description | HeroSection | Preserved in proposed structure | **Missing — actual copy** | Supply approved heading and description. |
| Request demo primary CTA | HeroSection | Preserved | **Missing — target URL/action** | Label supplied; destination not supplied. |
| View pricing secondary CTA | HeroSection | Preserved | **Missing — target URL/action** | Label supplied; destination not supplied. |
| Customer logos | LogoWall | Preserved | **Missing — assets/permissions** | Supply approved customer assets/names and usage authorization. |
| Three enterprise capabilities | 3 × FeatureCard | Preserved | **Missing — capabilities/copy** | Exactly three items; content not supplied. |
| Four scale/reliability metrics | MetricBand | Preserved | **Missing — verified values** | Supply four facts with units and caveats. |
| Customer case study | CaseStudyFeature | Preserved | **Missing — story/proof** | Supply approved customer story, proof, and link. |
| Three-plan, feature-row comparison | PlanComparisonTable | Preserved | **Missing — actual matrix** | Supply three plan labels, feature rows and cells. |
| Final demo CTA | CTASection | Preserved | **Missing — destination/copy beyond label** | Reuse supplied demo action intent; supply destination and any approved support copy. |

**Intentional removals:** None. **Unintended structural omissions:** None. **Content readiness:** Not complete; unresolved entries above block factual implementation. No copy, metrics, brands, testimonials, prices, or plan entitlements are fabricated.

## 5. New component contract — `PlanComparisonTable`

### Component

- **Name:** `PlanComparisonTable`
- **Purpose:** Compare a set of named plans using shared feature rows and one value per plan per feature.
- **Status:** **Proposed / New**; reusable across product, subscription, service, or tier-comparison pages. Not named after Enterprise.

### Responsibility

Own the **structured tabular comparison** of features across plans, including row/column association, responsive reading, and optional explanatory notes. It does **not** own the page heading, global pricing navigation, card-based marketing benefits, general metric display, or checkout/demo workflow.

### Content model

| Field | Required | Type / shape | Notes |
|---|---|---|---|
| `caption` / accessible title | Yes | Short string, or equivalent external labeled heading | A clear accessible table name; avoid duplicating a visible SectionHeader in speech. |
| `plans` | Yes | Ordered list of exactly 3 plan records for this page | Each record has a unique identifier and visible plan name. Component contract may allow other counts later only when justified. |
| `features` | Yes | Nonempty ordered list of feature rows | Each row has a unique identifier and a feature label. |
| `values` | Yes | For each feature, a value for each of the 3 plan IDs | Values may be text, numbers with units, or explicit availability states; cannot silently omit intersections. |
| `featureDescription` | No | Text per row | Supplementary explanation, not replacement for feature label. |
| `planDescription` | No | Text per plan | Short qualifiers when needed. |
| `rowGroup` | No | Group labels or group IDs | Optional if the actual feature taxonomy warrants group headings. |
| `note` / qualifications | No | Text per row, plan, or entire table | Preserve material limitations and footnotes adjacent or associated. |
| `planAction` | No | Label and destination per plan | Only if real plan-specific actions are provided; not required by the case. |

**Content invariant:** Every displayed feature/plan intersection must be defined. An unavailable feature must use an explicit, accessible “Not included” (or source-approved equivalent), not a blank or color-only indicator. Unknown information should remain unresolved in content preparation, rather than masquerading as unavailable.

### Variants

| Variant | Purpose | Use | Avoid |
|---|---|---|---|
| `default` | Standard comparison matrix | This case; three plans, feature rows | Creating per-page or per-plan variants without a repeatable structural need |

No `enterprise` variant is proposed. A future density or orientation variant would need demonstrated repeated demand, not this fixture alone.

### States

- **Default:** All headers and values present and readable.
- **Focus:** Any actionable links/buttons have a clearly visible keyboard focus state.
- **Overflow / scroll:** At narrow widths, a discoverable scroll region retains access to all three plan columns.
- **Empty or incomplete content:** Prevent publishing a misleading partial matrix; show an appropriate editorial/integration state if the host system needs one.
- **Loading/error:** Not required for the static content described. Define these only if later connected to asynchronous data; do not add speculative behavior.

### Responsive behavior

| Condition | Behavior |
|---|---|
| Room for full matrix | Display feature-label column plus three aligned plan columns; avoid arbitrary truncation. |
| Narrow viewport / enlarged text | Keep semantic table structure and enable horizontal scrolling if needed; preserve all feature values and labels. |
| Horizontal overflow | Make scrolling perceivable (visible edge/overflow cue and/or short instruction); ensure keyboard users can reach the scrolling area and all content. |
| Dense or long text | Allow row height to grow, wrap copy within cells, preserve association and readable minimum column widths. |
| Reduced motion | No motion-dependent access to information; any optional scrolling effect respects motion preferences. |

A transformed card layout is **not** required: it risks duplicating plan labels and losing systematic row comparison. If later adopted, it must retain equivalent accessible feature/plan associations and complete coverage.

### Interaction

- **Trigger:** Primary use is reading/comparing. Optional plan-specific links are activated only if included in validated content.
- **Response:** Native link navigation for provided destinations; horizontal scrolling on constrained viewports.
- **Keyboard:** Standard link/button keyboard operation; a focusable scroll region when needed so clipped content is reachable without a pointer.
- **Focus:** Visible focus indicators; logical document and tab order; no hidden interactive controls.

### Accessibility

- **Semantic role:** Native HTML table semantics in eventual implementation (design contract only): caption, column headers for plans, row headers for features; row groups where needed. Avoid re-creating a data matrix with unrelated cards or generic grid roles.
- **Accessible name:** Via caption or explicitly associated section heading.
- **Keyboard:** Reach all horizontal content and actions; retain coherent focus order.
- **Visual requirements:** Adequate contrast, legible text at zoom, visible overflow and focus indicators, no color-only availability semantics.
- **Notes:** Where symbols are used, provide unambiguous accompanying or accessible text; associate qualifying notes and footnotes with corresponding values.
- **Motion:** No animation required.

### Composition rules

- **May contain:** Table caption, plan column headers, feature row headers, values/statuses, explanatory notes, optional plan action links.
- **May be contained by:** A generic page section with `SectionHeader` and standard layout wrappers.
- **Must not:** Replace `FeatureCard`, `MetricBand`, or `CTASection`; act as a whole-page Enterprise component; imply pricing or entitlements absent from supplied data; create individual plan-specific component copies.

### Reuse decision justification

- [x] `HeroSection`, `SectionHeader`, `FeatureCard`, `MetricBand`, `CTASection`, `CaseStudyFeature`, and `LogoWall` cannot represent aligned feature × plan data using their stated responsibilities.
- [x] Extending a marketing card or metric band with row/column semantics would create an unrelated second responsibility and unstable contract.
- [x] A presentational variant cannot solve the lack of a comparison data model.
- [x] Composition of the listed components can create side-by-side cards but not a clean, semantically coherent comparison matrix.
- [x] One generic new comparison component is therefore the smallest justified addition.

### Contract validation targets

- [ ] Three correctly labeled plans are displayed, with every required feature row and value.
- [ ] Screen-reader navigation communicates row and column headings.
- [ ] Narrow and zoomed viewports preserve all data and keyboard scroll access.
- [ ] Any included links have functioning and distinct labels/destinations.
- [ ] Unknown values are not accidentally displayed as negative availability.
- [ ] The component can be reused without page-specific naming or duplication.

## 6. System boundaries, migration impact, and tokens

**Existing components:** Reuse unchanged within the fixture's stated inventory. Do not add `EnterpriseHero`, `EnterpriseFeatureCard`, `EnterpriseMetricBand`, `EnterpriseCaseStudy`, `EnterpriseLogoWall`, or `EnterpriseCTA` and do not introduce a special `enterprise` variant merely to encode the page identity. Optional section headings use the existing `SectionHeader`. Arrange three card instances through normal composition/layout; no dedicated new component is warranted by evidence.

**New component:** Add just `PlanComparisonTable` to the shared library before composing section 06. Its data shape and semantics belong at component level; plan labels and values are page content. This is a design contract, not implemented or tested code.

**Tokens:** No existing token inventory or visual specifications were supplied. **No token changes can be justified or verified.** At implementation, use the project's shared typography, spacing, color, border, focus, and layout tokens; propose missing tokens only after inspecting actual repeated usage. Prefer token → component → pattern → page → one-off override when correcting a recurring issue.

**Migration impact:** No evidenced existing component migrations; the only proposed library addition is `PlanComparisonTable`. Actual repository compatibility, runtime API, browser support, and downstream consumers cannot be assessed from the fixture.

## 7. Risks, assumptions, and evidence gaps

| Item | Classification | Impact / decision |
|---|---|---|
| Seven sections in given order | Supplied requirement | Preserve order; do not restructure without evidence. |
| Three plans and feature rows | Supplied requirement | Build a matrix, not a collection of unrelated cards. |
| Exactly 3 capability cards and 4 metrics | Supplied requirement | Both fit existing component responsibilities. |
| Audience evaluating enterprise options | Design hypothesis | Useful for framing, not a validated research finding. |
| Default variants chosen where relevant | Design decision | Already exist; switch only when actual content/layout constraints warrant. |
| `SectionHeader` inclusion | Optional composition | Use when authored headings/descriptions exist; none supplied. |
| Pricing destination | Unknown | Must be confirmed; do not assume page anchor or route. |
| Metrics, logos, case-study proof, features, plan entitlements | Missing source content | Cannot populate with invented evidence. Get verified, approved inputs before publication. |
| Accessibility/responsive behavior of existing inventory | Unverified | Contracts suggest checks but actual components cannot be certified without implementation/rendered inspection. |
| Visual design tokens, layout grid, technical stack | Unavailable | Do not assert implementation details or visual compliance. |

## 8. Validation checklist and status

### Mapping / system gate

- [x] Every one of the seven requested sections has a proposed component mapping.
- [x] Each reuse/composition/new decision is justified against the actual inventory.
- [x] Existing responsibilities are respected; no speculative component API extensions.
- [x] New component has a bounded, reusable, non-page-specific responsibility and contract.
- [x] No extra new component or one-off override is proposed.
- [x] CTA priority and section order are explicit.
- [x] Responsive and accessibility expectations are documented for the new table and page sections.

### Content and implementation gate (not yet verifiable)

- [ ] Supply and approve actual hero copy, capability descriptions, logo assets, four qualified metrics, case-study evidence, and the three-plan comparison dataset.
- [ ] Confirm **Request demo**, **View pricing**, case-study, and any optional card/plan destinations.
- [ ] Verify approved customer/logo rights and claim substantiation.
- [ ] Inspect existing component implementations and token system for actual semantics, responsive behavior, and compatibility.
- [ ] Test full responsive behavior, zoom, keyboard focus and scrolling, screen-reader associations, contrast, and content order.
- [ ] Confirm navigation/findability and that no content disappears in the assembled page.
- [ ] Check the finished component library for near-duplicates or accidental page-specific styles.

**Outcome:** **Component mapping and reusable-component specification complete; implementation and factual-content validation not complete.** This is the strongest warranted result given the case's deliberately limited component inventory and absence of a running site, repository, design files, and approved content. No live test, rendered inspection, or external verification is claimed.
