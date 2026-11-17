# Atlas Grid — Evidence-Constrained Website Redesign Blueprint

**Case:** `end-to-end-b2b-001`  
**Deliverable:** Discovery, information architecture, page specifications, content coverage, reusable system design, implementation plan, and validation gates  
**Status:** Proposed design specification; **not** an implemented or usability-tested website  
**Evidence boundary:** Only the supplied packet's `SKILL.md`, declared case inputs, directed references and templates. No external market research, live-site inspection, analytics, user research, code repository, or rendered UI available. Atlas Grid is a **synthetic** company.

## 0. Executive decision and evidence ledger

**Recommended direction:** Organize core discovery around **Products (Observe / Automate)**, distinguish a **Kubernetes use case** from **Enterprise buyer/evaluation needs**, and give **Start Here**, **Pricing**, **Docs**, customer proof and **Request demo** predictable entry points. Present the homepage as one evaluation journey: *understand → select product/use case → verify proof → review buying information → request a demo*. Keep existing design tokens and reuse existing components before introducing variants or components.

**Evidence types:** **Observed** = stated in packet; **Proposal** = design decision based on observed inputs; **Unknown** = cannot be verified in packet. The proposed labels, section order, content roles and interaction patterns below are **not claimed to be customer-validated**.

| ID | Evidence or constraint | Classification | Source |
|---|---|---|---|
| E1 | Atlas Grid provides observability and workflow tooling for infrastructure teams | Observed | `input/project-context.md` |
| E2 | Audiences: platform engineering leaders, SREs, technical evaluators | Observed | `input/project-context.md` |
| E3 | Tasks: understand offering, assess observability/automation fit, evaluate reliability/customer proof, compare pricing, request technical demo | Observed | `input/project-context.md` |
| E4 | Business goals: comprehension, predictable discovery, qualified demo intent, fewer one-off designs | Observed | `input/project-context.md` |
| E5 | Preserve Observe/Automate names, public Pricing, discoverable case studies, existing frontend stack, responsive/accessibility | Observed | `input/project-context.md` |
| E6 | Current navigation, homepage order and 13 required content categories | Observed | `input/current-site.md` |
| E7 | “Solutions” combines Kubernetes (domain), Enterprise (audience), Start Here (lifecycle) | Observed | `input/current-site.md` |
| E8 | Ten existing components and shared spacing/typography tokens; all have responsive behavior | Observed | `input/component-inventory.md` |
| E9 | Analytics, user research and competitor evidence absent | Unknown / explicitly unavailable | `input/project-context.md` |
| E10 | Actual copy, images, metrics' numbers/definitions, customer permissions, case-study titles, prices/tiers, routes, component APIs, breakpoint values, stack details, and design token values absent | Unknown | Not supplied in case inputs |

**Decision confidence:** High that the current “Solutions” taxonomy is mixed (explicitly stated); moderate that separating by product/use case/audience/lifecycle will improve predictability (reasoned hypothesis); untested for actual users. No conversion uplift, performance improvement or accessibility conformance is claimed.

---

## 1. DISCOVER — project context and current-site audit

### 1.1 Project context

| Dimension | Record |
|---|---|
| Business | Observability and workflow tooling for infrastructure teams |
| Primary users | Platform engineering leaders; site reliability engineers; technical evaluators |
| Primary tasks | Understand offerings; find observability/automation fit; inspect reliability and customer proof; compare pricing; request technical demo |
| Goals | Improve comprehension and discovery; raise qualified demo intent; reduce unique page designs |
| Known constraints | Product names unchanged; Pricing publicly reachable; case studies discoverable; no frontend migration; accessible and responsive |
| Brand constraints | No brand palette, voice guide, imagery library or exact typography values supplied; preserve existing tokens until inspected |
| Content constraints | Retain each required content category, existing case studies and customer proof; do not fabricate statements or metrics |
| Accessibility | Required, but current conformance and implementation behavior unverified |
| Success criteria | Coherent grouping; one homepage evaluation journey; no missing required content; system reuse; traceable decisions |
| Unknowns | Research/analytics, market references, full site inventory, live URLs, detailed component API, implementation artifacts |

### 1.2 As-provided information architecture

```text
Home
├── Platform
│   ├── Observe
│   └── Automate
├── Solutions
│   ├── Kubernetes
│   ├── Enterprise
│   └── Start Here
├── Customers
├── Resources
│   ├── Blog
│   └── Docs
├── Pricing
└── About
    └── Contact
```

**Navigation audit:**

| Finding | Evidence | Likely effect / confidence | Severity |
|---|---|---|---|
| “Solutions” mixes domain, audience, and lifecycle | E7 | Visitors cannot reliably predict siblings / high structural confidence | High |
| “Start Here” is nested under a mismatched category | E6–E7 | Entry guidance is less findable for new evaluators / hypothesis | High |
| Demo/contact path sits under About | E6, E3 | Task-critical technical demo may require extra discovery / hypothesis | High |
| Customer proof landing exists, case studies not explicit in given nav | E6 and required content | Findability depends on Customers landing; detail inventory unknown | Medium |
| Docs located under Resources alongside Blog | E6 | Documentation and editorial reading have distinct user tasks / hypothesis | Medium |
| Pricing directly in global nav | E6 | Already supports public pricing discoverability; retain | Positive |
| Current site has at least two product names | E6 | Product labels are clear and must be kept | Positive |

**Homepage baseline:** hero “The platform for modern infrastructure”; Observe/Automate product cards; Kubernetes; Enterprise; three reliability metrics; customer logos; featured case study; blog cards; contact form. The broad hero does not explain the offering as specifically as E1 does (content hypothesis, not empirical usability finding). The contact form exists; submission flow and actual fields are not supplied.

**Inventory audit boundary:** Only the stated navigation, homepage sections and required categories are available. This is **not** a complete crawl; no unlisted pages can be asserted absent or present. No duplication counts, accessibility failures or mobile issues are inferred without code/rendered evidence.

### 1.3 Required content inventory

| Content ID | Required item | Current evidence | Treatment |
|---|---|---|---|
| C01 | Observe | Platform child + homepage product card | Preserve name; dedicated product page and homepage choice |
| C02 | Automate | Platform child + homepage product card | Preserve name; dedicated product page and homepage choice |
| C03 | Kubernetes | Solutions child + homepage section | Move to Use Cases and retain homepage teaser |
| C04 | Enterprise-oriented proof | Solutions child + homepage section | Move to Enterprise page; reference in trust/evaluation flow |
| C05 | Start Here guidance | Solutions child | Move to dedicated guide linked from primary nav or utility |
| C06 | Customer logos | Homepage section | Preserve as trust proof with permission checks |
| C07 | Case studies | Customers + featured homepage story | Keep case-study index and featured story |
| C08 | Blog | Resources > Blog + cards | Keep Resources > Blog and homepage previews |
| C09 | Docs | Resources > Docs | Keep Docs directly reachable via Resources and utility |
| C10 | Pricing | Global nav | Retain global nav and clear page |
| C11 | About | Global nav | Retain in company/utility grouping |
| C12 | Contact / demo path | About > Contact + homepage form | Preserve Contact; create prominent demo entry point routing to existing contact/demo mechanism |
| C13 | Reliability metrics | Three homepage metrics | Preserve exactly the existing three **verified** metrics; do not invent values or definitions |

---

## 2. STRUCTURE — navigation comparison and decision

### 2.1 Proposed sitemap (logical, not verified URL routes)

```text
Home
├── Products [product]
│   ├── Observe
│   └── Automate
├── Use Cases [technical context]
│   └── Kubernetes
├── Enterprise [buyer / audience evaluation]
├── Customers [proof]
│   └── Case Studies [index -> existing individual stories]
├── Resources [content type]
│   ├── Blog
│   └── Docs
├── Pricing [commercial evaluation]
├── Start Here [evaluation lifecycle guidance]
└── About [organization]
    └── Contact

Persistent action: Request demo -> contact / demo path
```

**Desktop navigation recommendation:** Logo/Home | **Products** (Observe, Automate) | **Use Cases** (Kubernetes) | **Enterprise** | **Customers** (Case Studies) | **Resources** (Blog, Docs) | **Pricing** | **Start Here** | **Request demo** (visually distinct primary action). **About** and **Contact** may live in utility/footer to contain width; **Contact** remains an accessible destination and the Request demo action must lead to the genuine contact/demo mechanism, not an invented endpoint. If desktop width is constrained, retain Start Here in visible utility and prioritise Pricing + Request demo. This is a proposed grouping, not a tested final label set.

**Grouping contract:** Products answers “Which offering?” (product); Use Cases “For which technical context?” (use case/domain); Enterprise “What does this mean for enterprise evaluation?” (audience); Customers “Who has evidence?” (proof content); Resources “What can I read or use?” (content type); Start Here “How do I evaluate?” (lifecycle); Pricing “What is the commercial model?” (buying task); About “Who is the company?” (organization). Singleton groups are deliberate: don't fill them with invented items. If more use cases/audiences emerge, first verify their real content.

### 2.2 Navigation comparison

| Area | Current | Observed market pattern | Proposed | Task rationale / tradeoff |
|---|---|---|---|---|
| Products | Platform > Observe / Automate | **Unavailable** (market evidence intentionally omitted) | Products > Observe / Automate | Keep names, improve product-category clarity; “Platform” could remain as a page only if real standalone platform content exists |
| Solutions | Kubernetes / Enterprise / Start Here together | Unavailable | Split into Use Cases / Enterprise / Start Here | Removes incompatible sibling meanings; more top-level choices, mitigate via progressive disclosure |
| Proof | Customers landing + homepage story | Unavailable | Customers > Case Studies, plus homepage proof | Explicit story findability; verify index exists or is feasible from current stories |
| Resources | Blog / Docs | Unavailable | Resources > Blog / Docs; Docs utility link | Maintains content type grouping, exposes task-critical docs |
| Pricing | Top-level | Unavailable | Top-level Pricing | Preserve publicly reachable direct access |
| Contact | About > Contact and homepage form | Unavailable | About > Contact; persistent Request demo | Maintains contact path and prioritizes buyer action |
| Start Here | Solutions > Start Here | Unavailable | Top-level/utility Start Here | Aligns with new evaluator task; prominence must be tested |

No market/reference patterns are presented as observed. A later competitive benchmark is optional discovery work, **not** a dependency for this evidence-limited specification.

### 2.3 Mobile navigation and route principles

Use one menu with the **same labels and grouping logic**; expand Products, Use Cases, Customers and Resources as accessible disclosure groups. Render Pricing, Enterprise, Start Here, About and Contact as direct links; include Request demo as a visible high-priority action, without duplicating its destination as an unexplained second item. Disclosures must support keyboard/screen reader activation, named expanded state, focus visibility and reasonable tap targets. No hover-only discovery. Respect existing responsive implementations; these are behavioral requirements, not claims of existing functionality.

URLs are **not provided**. Proposed path *patterns* such as `/products/observe`, `/use-cases/kubernetes`, `/customers/case-studies`, `/pricing`, `/start-here`, `/contact` are **illustrative only**; audit actual URLs, links and redirects before changing routing. Preserve deep links, canonical destinations and search indexing when implementing moves.

### 2.4 Task-to-destination walkthroughs

| User task | Suggested entry and path | Successful outcome |
|---|---|---|
| Understand Atlas Grid | Home > concise offering summary > Products | Can distinguish observability from workflow tooling |
| Evaluate observability vs automation | Products menu or home choice > Observe or Automate | Finds detailed product scope, not speculative claims |
| Check Kubernetes fit | Use Cases > Kubernetes > linked relevant product(s) | Context separated from product identity |
| Evaluate reliability and references | Homepage metrics/logos > Customers > Case Studies; Enterprise for buyer proof | Source-backed proof accessible, claims verified |
| Compare pricing | Header Pricing > actual pricing information | Pricing publicly reachable, missing detail explicitly identified |
| Request technical demo | Header Request demo or page CTA > known Contact/demo route | Real contact mechanism, accessible forms, no fictitious booking |
| Get started technically | Start Here > Docs and appropriate product page | Guidance without confusing it with a solution category |

### 2.5 IA lock gate

- **Desk review passes provisionally:** each required destination has a proposed home; grouping models are differentiated; nesting generally one level; mobile model is specified; no intentionally removed content.
- **Not locked for production:** there is no tree test, first-click test, stakeholder sign-off, page/URL inventory or analytics; Enterprise vs Use Cases and prominence of Start Here need validation. The **baseline structure is stable enough to draft wireframes** while holding these as explicit release gates.

---

## 3. WIREFRAME — homepage page specification

### Page: Home

**Goal:** In a single continuous evaluation flow, help infrastructure visitors understand what Atlas Grid does, select a relevant path, assess verifiable proof, and move to public Pricing or technical demo.

**Primary audience:** Platform engineering leaders, site reliability engineers, technical evaluators. **Primary task:** Discover offering and choose the right next step, with low-friction credibility evaluation.

**Current problems:** Generic hero obscures the distinction between products; homepage starts product cards before a clear audience/use-case interpretation; existing Kubernetes/Enterprise sections may repeat the flawed category grouping; terminal contact form lacks an explicit conversion journey from evaluation to request. These are **design interpretations** of the stated order, not usability-test findings.

**CTA hierarchy:** Persistent global **Request demo** = primary conversion; homepage hero **Explore products** = primary learning step and **Request demo** = secondary hero action (distinct styling may reverse visual emphasis after proof, but avoid two equally dominant CTA buttons). In proof/commercial sections, **View case studies** and **View pricing** are supporting actions. Footer can repeat Request demo. All CTA labels describe their destinations; do not substitute fake URLs.

### Proposed low-fidelity structure

```text
[Global navigation: grouped categories]                 [Request demo]

[01 HERO]
Atlas Grid: observability and workflow tooling for infrastructure teams
Brief explanation of Observe / Automate; avoid unverified outcomes
[Explore products]  [Request demo]

[02 PRODUCT CHOICE]
Which need are you evaluating?
[Observe: product summary -> detail] [Automate: product summary -> detail]

[03 CONTEXT AND ENTRY]
[Kubernetes: technical context -> use-case details]
[Start Here: guided evaluation -> docs/products]

[04 RELIABILITY SIGNALS]
[Three existing metrics, labeled and substantiated]
[Existing customer logo wall]

[05 CUSTOMER EVIDENCE]
[Featured existing case study -> full story] [View case studies]
[Enterprise evaluation/proof -> Enterprise]

[06 BUYING AND TECHNICAL NEXT STEPS]
[Pricing -> public Pricing]  [Docs -> documentation]

[07 RESOURCE CONTINUITY]
[Existing blog previews -> Blog]

[08 CONVERSION]
[Request a technical demo -> actual contact/demo path]
[Optional existing contact form only if implementation and compliance are validated]

[Footer: About, Contact, full navigation / policies as applicable]
```

### Section-level contract

| # | Purpose and content | Primary interaction | Component / reuse action | Responsive & accessibility requirements |
|---|---|---|---|---|
| 01 | State E1 clearly; distinguish names and tasks without invented features | Explore products; Request demo | `HeroSection` **reuse** (copy update) | Semantic single H1; CTA order reading order; optional media needs alt if meaningful |
| 02 | Offer Observe/Automate as distinct choices; factual copy pending | Visit product detail | `SectionHeader` + 2× `ProductCard` **compose** | Stack cards logically; each link has descriptive accessible name |
| 03 | Surface Kubernetes and Start Here as different destination types | View use case / Start Here | `SectionHeader` + `FeatureCard` **reuse/compose** | Explicit card labels; no categorical conflation |
| 04 | Preserve three existing reliability metrics and customer logos | Optional verified proof details | `MetricBand` + `LogoWall` **reuse** | Values read as text; labels/units/source context preserved; logos have correct text alternatives |
| 05 | Feature actual case study and Enterprise proof | Read case study / Enterprise | `CaseStudyFeature` + `FeatureCard` **compose** | Maintain content order and readable quotations/attributions where applicable |
| 06 | Expose buying and technical evaluation next steps | Pricing / Docs | `SectionHeader` + 2× `FeatureCard` **reuse** | Links distinct; no false price preview |
| 07 | Preserve editorial path with actual blog items | Blog and articles | `SectionHeader` + `ContentCard` **reuse** | Date/title metadata only if supplied; avoid placeholder content at launch |
| 08 | Convert evaluated visitors via existing genuine path | Request demo/contact | `CTASection` **reuse**; existing form may be composed only after inspection | Form labels, errors, confirmation and privacy requirements verified if embedded |
| Footer | Secondary wayfinding and Contact/About | Links | `Footer` **reuse** | Accessible landmarks and consistent mobile link set |

**Why reorder?** Product selection and start guidance precede proof, proof precedes commercial/demo action. Reliability metrics and customer logos remain together to avoid separating claims from credibility; case studies supply a deeper proof route. Blog remains accessible but does not interrupt the core evaluation path.

### Homepage content coverage matrix

| Existing content | Existing location | Proposed location | Action | Status | Integrity rule |
|---|---|---|---|---|---|
| Generic hero headline | Homepage hero | Home §01 | Rewrite | Rewritten (proposed) | Replace vagueness with E1; do not introduce performance claims |
| Observe | Platform child; homepage card | Products > Observe; Home §02 | Preserve / move label grouping | Preserved | Name unchanged |
| Automate | Platform child; homepage card | Products > Automate; Home §02 | Preserve / move label grouping | Preserved | Name unchanged |
| Kubernetes section | Home §03; Solutions child | Home §03; Use Cases > Kubernetes | Move | Moved (proposed) | Preserve all actual source detail upon implementation |
| Enterprise section and proof | Home §04; Solutions child | Home §05; Enterprise | Move | Moved (proposed) | Keep actual existing proof, not invented enterprise claims |
| Three reliability metrics | Home §05 | Home §04 | Move | Moved (proposed) | Preserve value/label/method and validate source; absent from packet |
| Customer logos | Home §06 | Home §04 | Move | Moved (proposed) | Validate rights and relevance |
| Featured case study | Home §07 | Home §05; Customers index | Move | Moved (proposed) | Existing title, claim and destination preserved |
| Blog cards | Home §08 | Home §07; Resources > Blog | Move | Moved (proposed) | Preserve real article links |
| Contact form | Home §09 | Home §08 or Contact/demo page | Preserve / move | Moved (conditional) | Do not delete unless equivalent tested form/path exists |
| Start Here guidance | Solutions > Start Here | Home §03; Start Here | Move | Moved (proposed) | Entire original guidance remains discoverable |
| Case studies collection | Customers (required) | Customers > Case Studies | Preserve / expose | Preserved (planned) | Do not infer story count or titles |
| Docs | Resources > Docs | Resources > Docs; Home §06; Start Here | Preserve / cross-link | Preserved |
| Pricing | Top-level | Top-level; Home §06 | Preserve | Preserved | Direct public access |
| About | Top-level | About / footer | Preserve | Preserved | Utility placement must not obscure it |
| Contact/demo path | About > Contact; Home form | About > Contact; Request demo action | Preserve / expose | Preserved (planned) | Must resolve to real functioning path |

**Coverage audit:** All 13 required categories have destinations. **No intentional removals.** Operational completeness remains **unverified** until the actual copy, metrics, stories, form, and destination URLs can be inspected. The table describes intentional dispositions, not completed migrations.

### New component requirements (homepage)

**None justified.** All eight content sections compose the 10 existing components. A shared navigation disclosure may need extension of the existing site header/navigation implementation, but that component is **not listed** in the supplied component inventory; do not assert a missing implementation or create it without inspecting the stack.

### Homepage risks and assumptions

1. Wording based on E1 should be reviewed for voice and accuracy; no product feature inventory exists.
2. Three metric values/units and customer/story proof are unavailable, so no numerical copy can be drafted reliably.
3. Contact form behavior, data handling, field definitions and success path are unknown.
4. Section order is a hypothesis, not an A/B-tested winner.
5. Existing responsive behavior is known to exist but its actual breakpoints and quality are not observable.

### Homepage validation checklist

- [x] Page goal, tasks, CTA hierarchy and section order specified
- [x] All required content mapped with intended disposition
- [x] Existing components mapped before proposing any new ones
- [x] Responsive and accessibility requirements described
- [ ] Original copy/proof audited against real site
- [ ] CTA/form destinations and successful submission verified
- [ ] Mobile/desktop renders tested
- [ ] Keyboard/screen reader and contrast evaluated
- [ ] Stakeholders/representative users verify comprehension and first clicks

---

## 4. Supporting page specifications — scalable patterns

These are **structural specifications**, not full copy decks. All page instances should use the same existing tokens and components. Where a page needs facts not in packet, specify a content slot and verification requirement instead of filling it with fiction.

| Page / primary task | Recommended sections in reading order | Primary CTA and secondary route | Existing component map | Key unknown / gate |
|---|---|---|---|---|
| **Observe** / assess observability fit | Product hero; actual feature/benefit inventory; relevant Kubernetes context if substantiated; verified proof; Docs/Pricing; demo | Request demo; Docs or Pricing | `HeroSection`, `SectionHeader`, `FeatureCard`, `CaseStudyFeature` where matching evidence exists, `CTASection` | Actual Observe capabilities, proof and technical details missing |
| **Automate** / assess workflow fit | Product hero; actual workflow/capabilities; relevant verified examples; proof; Docs/Pricing; demo | Request demo; Docs | Same shared product-page composition | Actual Automate capabilities/claims missing |
| **Kubernetes** / assess context fit | Context hero; user problem as verified; how actual product(s) apply; evidence; Docs; demo | Explore relevant product; Docs | `HeroSection`, `FeatureCard`, `CaseStudyFeature` only with matching story, `CTASection` | Do not claim integrations or support levels without evidence |
| **Enterprise** / evaluate buyer needs | Audience-specific hero; real enterprise-oriented proof; existing reliability signals; customer evidence; pricing/demo route | Request demo; View case studies | `HeroSection`, `MetricBand`, `LogoWall`, `CaseStudyFeature`, `CTASection` | Avoid invented security, compliance, SLA or procurement promises |
| **Customers / Case Studies** / assess proof | Index header; actual existing story cards; featured story where relevant; demo route | Read case study; Request demo | `HeroSection`, `ContentCard` (story-preview variant only if semantics suit), `CaseStudyFeature`, `CTASection` | Actual story count, metadata, URLs; no fabricated testimonials |
| **Start Here** / select evaluation path | Goal-oriented intro; choose Observe vs Automate; Kubernetes context; Docs / Pricing / demo decision points | Choose product; Docs | `HeroSection`, `ProductCard`, `FeatureCard`, `CTASection` | Genuine procedural instructions unknown; must link only to verified docs |
| **Pricing** / compare pricing | Pricing introduction; actual public pricing model and distinctions; explanatory notes; demo/contact path | Request demo (when appropriate); Docs | `HeroSection`, `SectionHeader`, `CTASection`; **potential** specialized pricing comparison only after real data is inspected | No tier/price/contract terms supplied; cannot spec a populated table |
| **Blog** / explore editorial material | Archive heading; actual resource cards; pagination/filter only if content volume warrants | Read article | `SectionHeader`, `ContentCard` | Editorial taxonomy and pagination unknown |
| **Docs** / technical reference | Existing documentation structure and navigation; product/context entry points | Open relevant doc | Respect actual docs implementation; do not replace it blindly | Documentation engine, search and hierarchy unknown |
| **About / Contact** / company and inquiry | About: verified company description; Contact: actual form or contact methods, expectation and privacy info; demo handoff | Contact or Request demo | `HeroSection`, `CTASection`, `Footer`; current form reuses existing code if verified | Form controls/components not inventoried; no email/address fabricated |

### Representative detailed page: Observe (required page-level contract)

- **Goal:** Enable technical evaluators to decide whether Observe warrants further investigation.
- **Current problems:** Only its menu position and homepage card are documented; no page-body audit possible.
- **Structure:** (1) product-specific `HeroSection` with known name and cautious explanation pending verified copy; (2) `SectionHeader` + `FeatureCard` grid populated from real feature evidence; (3) contextual links to Kubernetes *only if supported*; (4) applicable `MetricBand` or `CaseStudyFeature` with product attribution only when true; (5) `CTASection` to Docs, Pricing and demo.
- **Content coverage:** Existing Observe menu name and card are preserved on Products > Observe and Home §02; any unknown existing Observe page body remains **unaudited**, not implicitly removed.
- **Component mapping:** Hero = reuse; feature sections = compose; proof = reuse conditional; CTA = reuse. **New:** none.
- **Risks/assumptions:** Observe scope is not described beyond product name and business context; do not infer collection, dashboards, alerting, integrations or SLAs.
- **Validation:** Product-name integrity, complete page-body migration, accurate links and proof, focus/reading order, responsive feature-grid states must all pass before release.

### Representative detailed page: Pricing (required page-level contract)

- **Goal:** Let buyers access and compare actual public pricing, then request clarification or a demo.
- **Current problems:** No pricing page body supplied; only public top-level reachability is evidenced.
- **Structure:** (1) Pricing H1; (2) actual pricing options/comparison **only if existing pricing data is provided**; (3) known explanatory notes and terms from original page; (4) CTA to demo/contact.
- **Content coverage:** Existing public Pricing route preserved; original price/term details **unknown and must be audited**.
- **Component mapping:** `HeroSection`, `SectionHeader`, `CTASection` reuse; any comparison UI requires inventory check followed by extend/compose/new decision.
- **New:** No component authorized on current evidence. Specialized table is **conditional**; pricing data must precede API design.
- **Risks:** Replacing visible prices with “contact us” would violate the public-pricing intent if the current page already publishes prices. Never invent price amounts.
- **Validation:** Unauthenticated public reachability, exact prices/units/conditions, mobile comparison accessibility and correct CTA routing.

---

## 5. EXPLORE — bounded visual directions (same IA and wireframe)

No visual files, screenshots or brand colors were supplied. The following are **design hypotheses**, not approved design explorations or rendered mockups. Both keep the locked structural baseline and **existing typography/spacing token families**.

| Variable | Direction A — Technical clarity (**provisional recommendation**) | Direction B — Editorial confidence |
|---|---|---|
| Type hierarchy | Strong concise headers with utilitarian body hierarchy, existing type tokens | More expressive headline scale using existing type hierarchy |
| Spacing | Consistent modular gaps, slightly denser technical sections using existing spacing tokens | More whitespace around proof and narrative sections using same tokens |
| Grid | Predictable two-column product cards, single-column reading sequence on narrow screens | Alternating text/media alignment without reordering content |
| Color | Existing brand palette; restrained accents on actions and proof | Existing palette; differentiated surfaces via current semantic colors |
| Imagery | Product imagery only if verified assets exist; no fake screenshots | Customer/people imagery only if licensed, relevant assets exist |
| Borders / containers | Reuse current card and band treatments | Fewer visible card borders, more sectional separation where existing styles permit |
| Motion | Minimal purposeful transitions; reduced-motion fallback | Equally restrained; no meaning conveyed by animation only |
| Accessibility | Contrast, reading order, keyboard state preserved | Same non-negotiable requirements |

**Selection rationale:** Direction A provides a straightforward way to prioritize differentiation of Observe vs Automate and technical proof; this is a hypothesis aligned to E2/E3, **not** a measured user preference. Do not add tokens merely to achieve either direction. A visual comparison requires actual token values and rendered previews; neither exists here. **Visual gate: open.**

---

## 6. SYSTEMIZE — architecture and reusable contracts

### 6.1 Existing inventory and intended reuse

| Component | Existing responsibility (provided) | Proposed usage | Action | Concern to inspect |
|---|---|---|---|---|
| `HeroSection` | Heading, support, primary/secondary CTAs, optional media | Home and landing heroes | Reuse | H1 ownership, CTA order, media alt |
| `SectionHeader` | Eyebrow, title, support | All major sections | Reuse | Heading level from context |
| `ProductCard` | Product name, description, optional CTA | Observe/Automate choices | Reuse | Card link semantics |
| `FeatureCard` | Capability/benefit, optional icon/media/CTA; default/emphasized/compact | Use-case, entry, buyer and technical routes | Reuse current variants | Avoid variant names tied to pages |
| `MetricBand` | 2–6 metrics with label/note | Three verified reliability metrics | Reuse | Units and evidence, responsive wrapping |
| `LogoWall` | Customer/partner logos | Home/Enterprise proof | Reuse | Logo permission and alt names |
| `CaseStudyFeature` | Customer story, proof, CTA | Home/Enterprise/Customers | Reuse | Quote attribution and verified proof |
| `ContentCard` | Article/resource preview | Blog; possible case-study index after model check | Reuse or bounded extension | Content-type semantics, destination title |
| `CTASection` | Conversion message, CTA(s) | Cross-page demo conversion | Reuse | Intent and safe action destinations |
| `Footer` | Site footer | Every page | Reuse | Navigation completeness and accessible landmark |

**Duplication findings:** No duplicate implementations can be confirmed without repository files. **Design risk:** introducing `HomepageProductCard`, `EnterpriseFeatureCard`, `KubernetesCard` or similar copies would violate the existing responsibility and reuse model. The proposed page map creates **zero proven new component needs**.

### 6.2 Component contract — `ProductCard` (Existing / reuse)

- **Purpose / responsibility:** Present one named product and a single discoverable path to its detail; no feature list or comparison-table ownership.
- **Content model:** `name` (required string; *Observe* or *Automate*), `description` (required factual string), `ctaLabel` (optional string), `href` (required verified route). Actual property names must be adapted to existing API after code inspection; this is a conceptual content contract.
- **Variants:** Existing default if available; no newly invented variant. Do not create home-only or audience-only variants.
- **States:** Default; hover/focus for link; disabled/loading only if existing implementation legitimately supports them; missing route is an implementation error, not a disabled production card.
- **Responsive:** Maintain existing responsive rules; when narrow, stack cards in reading order with full readable link labels and no overflow.
- **Interaction:** Activate card CTA (or entire card only if link semantics and nested controls permit) to open its named product page; Enter activates link; visible focus indicator persists.
- **Accessibility:** Semantic heading within appropriate hierarchy; accessible link name distinguishes Observe vs Automate; no icon-only meaning; contrast and target sizes validated.
- **Composition:** May contain product text and CTA; may live under `SectionHeader` in product-choice grid. Must not embed Pricing details or arbitrary case-study fields.
- **Reuse decision:** Existing responsibility matches exactly ⇒ **Reuse**; no extension/variant/new justified.
- **Validation:** Check label integrity, links, focus, keyboard, narrow-screen stacking, lack of near-duplicate cards in implementation.

### 6.3 Component contract — `MetricBand` (Existing / reuse)

- **Responsibility:** Display a small group of verified metric/value + label + explanatory note; not a testimonial or source of automatically generated numbers.
- **Content model:** `items` (required 2–6 entries); each has a verified `value`, `label`, and `note` (source/context text where available). For homepage use the existing three items, without creating values.
- **Variants:** Existing behavior only; avoid a homepage-specific duplicate.
- **States:** Static default; optional links only if existing implementation intentionally supports metrics linking to evidence.
- **Responsive:** Wrap/stack without clipping values or disconnecting labels; preserve metric grouping and reading order.
- **Interaction:** Typically non-interactive; do not style as actionable unless links exist.
- **Accessibility:** Values and units accessible as text; metric meaning is not only color/icon; sufficient text contrast; no automatic rolling animations necessary.
- **Composition:** Inside proof section adjacent to `LogoWall` when narrative permits; avoid unsupported numerical claims.
- **Reuse decision:** Three items fall within existing 2–6-item responsibility ⇒ **Reuse**.
- **Validation:** Values, definitions and source verified by content owner; responsive and text zoom checks.

### 6.4 Component contract — `CTASection` (Existing / reuse)

- **Responsibility:** One clear conversion message with a primary CTA and optional secondary CTA.
- **Content model:** `message` (required), `primaryLabel` (required), `primaryHref` (required *verified* destination), `secondaryLabel`/`secondaryHref` (optional pair). Names represent conceptual fields, not confirmed code API.
- **Variants:** Current design only, unless an existing bounded presentation variant is found.
- **States:** Link default, hover, focus, active. Submission/loading/errors belong to the destination's form, not to a plain CTA link.
- **Responsive:** Stack CTAs without changing priority; preserve reading order; no horizontal overflow.
- **Interaction:** Primary link opens the true technical demo/contact path, secondary link opens Pricing or Docs as context requires. Keyboard link activation and visible focus.
- **Accessibility:** Region heading matches context; specific button/link names; no ambiguous “Learn more” repetition; contrast/focus tested.
- **Composition:** Final section on landing pages; can be repeated judiciously but not after every minor card. Must not contain an unvalidated form implementation.
- **Reuse decision:** Existing component already supports conversion message and CTAs ⇒ **Reuse**.
- **Validation:** Genuine URLs; no false booking promise; focus and mobile behavior.

### 6.5 Conditional component decisions — no automatic creation

| Need | Decision order | Current decision |
|---|---|---|
| Expandable grouped navigation | Check actual header implementation → extend its disclosures if needed → compose existing primitives → new only if genuinely absent | **Deferred**: `Header`/navigation API absent from provided inventory |
| Case-study index card | Reuse `ContentCard` if it can semantically preview case studies → bounded extension if not → compose | **Conditional reuse/extension**; no evidence for new primitive |
| Pricing comparison | Inspect actual pricing content and current UI first → reuse/extend/compose → new pricing component only if unique semantics required | **Deferred**: price model entirely absent |
| Contact/demo form | Inspect existing homepage form and Contact page first; preserve semantics and submission | **Reuse existing mechanism**, no invented form API |

### 6.6 Tokens, patterns, states, governance

- **Tokens:** Preserve existing spacing and typography tokens; **no new token families**. Existing color, radius, breakpoint and motion values have not been supplied, so no numeric values or new token names are asserted. After repository inspection, modify the highest reusable layer only if a repeated issue is evidenced.
- **Patterns:** Hero → task choices → contextual content → proof → evaluation links → CTA; product detail hero → factual capabilities → substantiated context/proof → next step; index page heading → reusable content cards → navigation.
- **Interactions:** Standard link states (hover/focus/active), meaningful accessible labels, keyboard-operable dropdowns, visible focus, disclosure expanded state, no motion dependency. Form validation (if present) must expose errors and feedback programmatically.
- **Responsive:** Use actual existing breakpoints once known; content priority should persist across sizes, product cards stack, metric band wraps, media never obscures text, navigation remains navigable without hover. Avoid arbitrarily specifying pixel thresholds.
- **Change scope:** Token → component → pattern → page → rare exception. Keep implementation aligned with existing frontend stack; no migration proposed.

**System gate:** Design mapping and conceptual contracts complete; API shape, tokens, accessibility implementation and duplication checks **not verified**.

---

## 7. IMPLEMENT — traceable sequence, not a false completion claim

### Dependency and rollout plan

| Order | Work | Traceability | Deliverable / acceptance gate |
|---|---|---|---|
| 1 | Inventory actual source copy, case studies, metrics, pricing, Contact form, URLs and existing component APIs | E5–E10, C01–C13 | Verified content + route register; no missing required item |
| 2 | Confirm proposed IA labels, group logic and public Pricing / demo paths | §2, E3/E7 | Signed navigation tree; desktop/mobile interaction spec; redirects plan |
| 3 | Approve homepage and representative product/Pricing wireframes | §§3–4 | Content-owner approvals; each item mapped, CTA hierarchy accepted |
| 4 | Inspect real tokens and reusable implementations; build only justified extensions | §6, E8 | Component API map; no near-duplicates; no token proliferation |
| 5 | Implement semantic page structures and accurate text first, followed by responsive layout and styles in the existing stack | §§3–6 | All real routes and links work; original content preserved |
| 6 | Validate navigation, content, focus, forms, responsive rendering and regressions | §8 | Recorded test evidence and fixes, then release decision |

**Migration traceability:** Proposed decisions M1 Products category ← E1/E3/E5/E6; M2 separate Kubernetes/Enterprise/Start Here ← E7; M3 prominent demo path ← E3/E4/E6; M4 keep top-level Pricing ← E3/E5/E6; M5 proof sequence ← E3/E6; M6 reuse existing components ← E8 and skill governance; M7 no new tokens ← E8. Each implementation change should record the relevant M-ID, original page/URL, target page/URL, content disposition, affected component and test result.

**No source code or design application files were provided.** Therefore no actual changes, screenshots, responsive tests, form submissions, accessibility audits or production validation have been executed. This specification is a build-ready planning artifact **only insofar as facts are available**; factual content integration remains gated.

---

## 8. VALIDATE — gate matrix and release criteria

| Gate | Desk result in this deliverable | Outstanding verification and method |
|---|---|---|
| Discovery | **Pass with gaps**: audience, task, business goals and constraints recorded | Obtain actual full page inventory; content/URL register; no invented research |
| IA | **Provisional pass**: clear separation of product, context, audience and lifecycle | Tree/first-click tests with target audiences, mobile nav review, route redirects, stakeholder approval |
| Wireframe | **Provisional pass**: one homepage journey, CTA hierarchy and content mapping | Validate original copy and all links; approve page ordering and detailed page content |
| Content coverage | **Planned complete (13/13 categories)**, no intentional removal | Confirm every actual item/story/metric/price/doc survives with factual integrity |
| Visual | **Not tested**: two directions specified without tokens/assets | Render both against actual brand assets/tokens; evaluate legibility, density, hierarchy |
| Component system | **Proposed mapping complete**, zero proven new component needs | Repository/API review, near-duplicate check, states, component-level responsive tests |
| Implementation | **Not performed** | Run existing stack build/tests; verify semantic HTML, links, forms, CMS data, redirects |
| Accessibility | **Requirements specified, not audited** | Keyboard traversal, focus, zoom/reflow, form error association, text alternatives, contrast, screen reader testing |
| Responsive | **Requirements specified, not tested** | Inspect at actual breakpoints and text zoom, including cards, metric band, nav and form |
| Regression | **Not tested** | Baseline-versus-proposed screenshots and functional/content regression log |

### Concrete acceptance tests

1. From Home, an evaluator can find Observe and Automate via a product-labeled group and distinguish their actual functions from verified copy.
2. Kubernetes is discoverable as a technical-context route, Enterprise as an audience/evaluation route, and Start Here as guidance—not three interchangeable “solutions.”
3. Pricing is accessible without login from global navigation and displays all existing verified public information.
4. A featured case study and an index of existing stories are findable without guessing a hidden category; logo and reliability claims match approved source data.
5. Request demo routes to a **real** contact/demo mechanism; if a form is used, labels, errors, confirmation and consent/privacy are checked.
6. Every C01–C13 required content category is accounted for in the implemented site, including all underlying real items not supplied here.
7. Mobile menu preserves grouping, exposes expanded states, supports keyboard and touch interaction and retains the primary action.
8. Existing shared tokens/components are preferred; any new component or variant is documented with a failed reuse/extend/variant/compose rationale.
9. No links, content, semantics or accessible behavior regress during route/content moves.
10. Claims about metric values, customer results, pricing, product functions and enterprise capabilities are not published until substantiated.

**Release status: NOT APPROVED / NOT VERIFIED.** This is an evidence-grounded redesign blueprint. Passing written checks here means the specification covers a decision, **not** that it was implemented or empirically validated.

---

## 9. Open decisions and owner actions

| Priority | Decision needed | Why it blocks release | Suggested owner / next action |
|---|---|---|---|
| P0 | Inventory real content and destination URLs | Prevents faithful migration, broken links and unsupported claims | Content + engineering: export page, story, metric, pricing and form details |
| P0 | Confirm actual public Pricing page contents and route | Mandatory public reachability and pricing accuracy | Product marketing + web owner: compare before/after |
| P0 | Confirm demo/contact form implementation and privacy copy | Request demo cannot promise an unverified flow | Web + legal/privacy: inspect and test actual mechanism |
| P0 | Verify metric sources and customer permissions | Reliability and logo proof must be substantiated | Content + customer marketing: approve claims/assets |
| P1 | Decide permanent placement of Start Here and Enterprise | Navigation volume and user mental model remain untested | Product/design: test first clicks and labels |
| P1 | Inspect frontend/component APIs, tokens and breakpoints | Exact implementation and variation decisions blocked | Engineering/design system: repository audit |
| P1 | Validate core tasks with representative audiences | Predicted findability is not evidence of actual use | UX: tree tests / usability sessions after approval |
| P2 | Select visual direction using actual brand inputs | Cannot truthfully approve unrendered treatments | Brand/design: compare same-content prototypes |

## 10. Final disposition

**Produced:** Project context; current IA and homepage audit; required content inventory; navigation comparison; proposed sitemap and grouping logic; responsive navigation requirements; task paths; complete homepage page specification and coverage matrix; scalable supporting page specs; two bounded visual hypotheses; full existing-component mapping and three component contracts; token and component governance; traced implementation sequence; and validation/test gates.

**Not produced (capability/evidence limits):** Live competitive observations, analytics findings, user-test outcomes, actual visual mockups, frontend code, measured responsive/accessibility results, real metrics/prices, deployed pages or verified functioning demo links. None are fabricated.

**Decision:** Proceed to verify real content and routing, then test/approve the proposed IA before implementing. The most important design change is **separating three incompatible meanings previously combined under “Solutions,” while protecting all required content and reusing the existing component system**.
