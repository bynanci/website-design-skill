# Atlas Grid Website Redesign — Complete Case Result

## 0. Execution record, scope, and evidence boundaries

**Case:** `end-to-end-b2b-001`  
**Governing skill:** packet `SKILL.md` (`website-design`)  
**Execution identity:** GPT-5.6 Sol  
**Capabilities used:** local packet file inspection and Markdown artifact generation.  
**Capabilities deliberately not used:** web, connected sources, prior conversations, evaluator material, or any file outside the packet.  
**Unavailable for this case:** source-repository inspection, rendered-site/browser inspection, analytics, user research, competitor/market evidence, and implementation screenshots/tests.

### Evidence used

Only the packet-declared case inputs and skill-directed references/templates were used:

- `examples/end-to-end-b2b/input/project-context.md`
- `examples/end-to-end-b2b/input/current-site.md`
- `examples/end-to-end-b2b/input/component-inventory.md`
- `references/workflow.md`
- `references/information-architecture.md`
- `references/component-architecture.md`
- `templates/project-context.md`
- `templates/navigation-comparison.md`
- `templates/page-spec.md`
- `templates/content-coverage.md`
- `templates/component-contract.md`

### Evidence discipline

Facts below are labeled **Known** when directly supported by the case inputs. Recommendations are labeled **Proposed** or **Hypothesis**. No analytics, user behavior, competitor conventions, code behavior, URLs, or visual-regression results are inferred.

The earliest unstable layer is **STRUCTURE**: the current `Solutions` group mixes three organizing models (`Kubernetes` = technology/domain context, `Enterprise` = audience, `Start Here` = lifecycle step). The result therefore proceeds from STRUCTURE through WIREFRAME and SYSTEMIZE. IMPLEMENTATION is specified as a traceable plan but not claimed as executed because no frontend repository is included. VALIDATION is completed at the artifact/specification level only.

---

# 1. DISCOVER — Project context

## Business goals

**Known**

- Improve product comprehension.
- Make solution discovery predictable.
- Increase qualified demo intent.
- Reduce one-off page design.

## Primary users

**Known**

- Platform engineering leaders.
- Site reliability engineers.
- Technical evaluators.

## Primary user tasks

**Known**

1. Understand what Atlas Grid does.
2. Determine whether it fits an observability or automation use case.
3. Evaluate reliability and customer proof.
4. Compare pricing.
5. Request a technical demo.

## Current website

**Known current navigation**

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

**Known current homepage sequence**

1. Hero: “The platform for modern infrastructure”
2. Product cards: Observe / Automate
3. Kubernetes section
4. Enterprise section
5. Three reliability metrics
6. Customer logos
7. Featured case study
8. Blog cards
9. Contact form

## Known problems

- `Solutions` has mixed taxonomy: technology/domain (`Kubernetes`), audience (`Enterprise`), lifecycle (`Start Here`).
- The business wants more predictable solution discovery and a clearer homepage evaluation journey.
- The business wants less one-off page design.

## Technical constraints

**Known**

- Existing frontend stack is out of scope for migration.
- Existing component system should be reused where possible.
- Existing shared spacing and typography tokens already exist.
- No new token family should be introduced without evidence.
- Responsive behavior exists for every component listed in the supplied component inventory.

## Brand constraints

**Unknown.** No brand positioning, visual identity rules, imagery rules, color rules, or tone-of-voice constraints are supplied.

## Content constraints

**Known**

- Existing product names `Observe` and `Automate` must remain.
- Pricing must remain publicly reachable.
- Existing case studies must remain discoverable.
- Required content may not disappear implicitly.

## Accessibility requirements

**Known:** accessibility is required.  
**Unknown:** target conformance level, current audit results, known defects, and existing component-level accessibility behavior are not supplied.

## Success criteria

**Known**

- Navigation uses coherent grouping logic.
- Homepage has one clear evaluation journey.
- No required content disappears.
- New pages reuse the existing component system where possible.
- All implementation decisions can be traced to an artifact.

## Unknowns / confidence limits

- Analytics are unavailable.
- User research is unavailable.
- Market/competitor evidence is intentionally omitted.
- Exact page URLs, page body content beyond the supplied homepage outline, and SEO constraints are unavailable.
- Current header/navigation component implementation is not listed in the component inventory.
- Current accessibility behavior is not described.

These gaps do not block structural work, but they limit claims about user preference, conversion impact, market convention, and implementation correctness.

---

# 2. STRUCTURE — Current IA audit

## 2.1 Current IA mental models

| Area | Current items | Dominant model | Finding |
|---|---|---|---|
| Platform | Observe, Automate | Product | Coherent; preserves required product names. |
| Solutions | Kubernetes, Enterprise, Start Here | Mixed | Unstable: domain/context + audience + lifecycle in one sibling set. |
| Customers | Customers | Customer proof/content destination | Coherent as a standalone destination. |
| Resources | Blog, Docs | Content type | Coherent. |
| Pricing | Pricing | Evaluation task/destination | Coherent and required to remain public. |
| About | About, Contact | Company information + conversion | Partly mixed: Contact is a task/conversion destination nested under company information. |

## 2.2 Observed structural problems

| Issue | Evidence | User impact | Severity |
|---|---|---|---|
| Mixed taxonomy in `Solutions` | Case input explicitly defines Kubernetes as domain context, Enterprise as audience, Start Here as lifecycle | Users cannot reliably predict what else belongs under `Solutions` or which path matches their question | High |
| Demo/contact path is structurally secondary | `Contact` is nested under `About`, while requesting a technical demo is a primary task | Primary conversion task is less direct than the stated business goal warrants | High |
| `Start Here` lifecycle guidance is grouped as a “solution” | Current navigation | New evaluators may not interpret onboarding/evaluation guidance as a solution category | Medium |
| Product and evaluation tasks are separated without an explicit journey | Homepage sequence plus stated success criterion | Users must infer how product fit, proof, pricing, and demo connect | Medium |

### Not claimed as problems

The supplied evidence does **not** establish that navigation depth, page count, mobile navigation, labels such as `Platform`, or resource organization are failing in practice. No analytics or research are available to support those claims.

## 2.3 Market/reference patterns

No market or competitor evidence is supplied, and outside research is prohibited for this run. Therefore no “observed market pattern” is asserted.

---

# 3. STRUCTURE — Proposed IA and navigation comparison

## 3.1 Structural decision

**Proposed:** remove the ambiguous `Solutions` catch-all and promote its three unlike children into explicit, non-competing navigation roles:

- `Kubernetes` remains a direct domain/context destination.
- `Enterprise` remains a direct audience-oriented destination.
- `Start Here` becomes evaluation/lifecycle guidance rather than a “solution.”

Preserve the coherent existing groups for products and resources. Make the demo path globally visible rather than dependent on navigating through `About`.

This proposal intentionally does **not** invent additional use-case, industry, or audience pages that are absent from the fixture.

## 3.2 Proposed primary navigation

```text
Home
├── Platform
│   ├── Observe
│   └── Automate
├── Kubernetes
├── Enterprise
├── Customers
├── Resources
│   ├── Blog
│   └── Docs
├── Pricing
└── Company
    ├── About
    └── Contact

Utility / conversion actions
├── Start Here
└── Request Demo → existing contact/demo path
```

### Important implementation note

`Request Demo → existing contact/demo path` is a **label and placement proposal**, not a claim that a separate demo URL or page exists. The supplied fixture only establishes a Contact/demo path and a homepage contact form. Implementation must reuse the existing destination unless a distinct demo destination is found in the actual repository/content system.

## 3.3 Navigation comparison

| Area | Current structure | Observed market pattern | Proposed structure | Rationale |
|---|---|---|---|---|
| Products | Platform → Observe, Automate | Not available | Platform → Observe, Automate | Existing product grouping is coherent and names must remain. |
| Technology/domain fit | Solutions → Kubernetes | Not available | Kubernetes (top-level) | Makes the supplied domain/context destination explicit instead of pretending it shares a taxonomy with audience/lifecycle content. |
| Audience fit | Solutions → Enterprise | Not available | Enterprise (top-level) | Makes the audience destination explicit and removes mixed siblings. |
| Lifecycle guidance | Solutions → Start Here | Not available | Utility action: Start Here | Represents its actual lifecycle role and improves findability for new evaluators. |
| Proof | Customers | Not available | Customers | Existing label is clear and supports the proof task. |
| Resources | Resources → Blog, Docs | Not available | Resources → Blog, Docs | Existing content-type grouping is coherent. |
| Pricing | Pricing | Not available | Pricing | Required to remain publicly reachable and directly supports a primary evaluation task. |
| Company/contact | About → Contact | Not available | Company → About, Contact; global Request Demo action | Keeps company information together while exposing the primary conversion path globally. |

## 3.4 Grouping logic

- **Platform** — mental model: **Product**. Answers “Which Atlas Grid product should I evaluate?”
- **Kubernetes** — mental model: **Technology/domain context**. Answers “Does Atlas Grid fit my Kubernetes environment?”
- **Enterprise** — mental model: **Audience/organization context**. Answers “Does Atlas Grid meet enterprise evaluation needs?”
- **Customers** — mental model: **Proof/content destination**. Answers “Who uses Atlas Grid and what outcomes/proof exist?”
- **Resources** — mental model: **Content type**. Answers “Where can I read documentation or ongoing content?”
- **Pricing** — mental model: **Evaluation task**. Answers “What does it cost?”
- **Company** — mental model: **Organization information**. Answers “Who is Atlas Grid and how do I contact the company?”
- **Start Here** — mental model: **Lifecycle stage**. Answers “I am new; where should I begin?”
- **Request Demo** — mental model: **Conversion task**. Answers “How do I request a technical demo?”

Different models coexist at the global level because they answer distinct top-level user questions; unlike the current `Solutions` submenu, they are not presented as if they are equivalent members of one taxonomy.

## 3.5 IA lock gate

- [x] Important supplied destinations have a predictable home.
- [x] Each grouped submenu has a clear dominant model (`Platform` = product, `Resources` = content type, `Company` = organization information).
- [x] No supplied destination is duplicated accidentally.
- [x] Labels use externally understandable terms already present in the fixture except `Company` and `Request Demo`, which are explicit proposed labels.
- [x] Pricing remains directly reachable.
- [x] Case studies remain discoverable through `Customers` and homepage proof.
- [x] Mobile can preserve the same mental model as an ordered list plus two utility actions; exact interaction cannot be validated without implementation.
- [ ] Scalability beyond the supplied content set is only partially validated because no future content roadmap is supplied.

**IA status: provisionally locked for this fixture**, with future scalability and implementation behavior documented as unresolved risks.

---

# 4. WIREFRAME — Homepage page specification

## Page

Homepage

## Goal

Help a technical evaluator understand Atlas Grid, identify the relevant product/context, verify reliability and customer proof, compare next-step options including pricing, and reach a technical demo path in one coherent evaluation journey.

## Primary audience

- Platform engineering leaders
- Site reliability engineers
- Technical evaluators

## Primary user task

Primary: understand product fit and decide whether to continue evaluation.  
Supporting: verify proof, access pricing, and request a technical demo.

## Current problems

1. The homepage contains the necessary evaluation ingredients, but their relationship is not explicitly organized as a decision journey.
2. Kubernetes and Enterprise inherit the ambiguity of the current mixed `Solutions` taxonomy.
3. `Start Here`, Docs, and Pricing are required site content / user-task destinations but are not represented in the supplied homepage sequence.
4. The contact form is the final conversion step, but the supplied structure does not establish a persistent, clearly named demo path.

## Proposed CTA hierarchy

- **Primary CTA:** Request Demo → existing contact/demo destination.
- **Secondary CTA near hero:** Start Here.
- **Contextual CTAs:** Learn about Observe, Learn about Automate, Explore Kubernetes, Explore Enterprise, View customer story/case studies, View Pricing, Read Docs/Blog.

The exact copy can be refined later; the hierarchy is the structural decision.

## Proposed structure

### Section 01 — Hero / orientation

- **Purpose:** Explain what Atlas Grid is and establish the two next-step paths: guided evaluation or demo.
- **Content:** Existing hero heading “The platform for modern infrastructure”; supporting copy must explain observability/workflow tooling using only approved product messaging when available; primary CTA Request Demo; secondary CTA Start Here.
- **Primary interaction:** Follow primary or secondary CTA.
- **Existing pattern/component:** `HeroSection` — **Reuse**.
- **Responsive notes:** Preserve heading, explanatory copy, and CTA priority; stack CTAs when width requires without reversing order.
- **Accessibility notes:** One page-level H1; CTA labels must be meaningful out of context; optional media must not precede essential text in reading order.

### Section 02 — Product choice: Observe / Automate

- **Purpose:** Let evaluators identify whether they need observability, automation, or both areas for further investigation.
- **Content:** Existing Observe and Automate product cards and existing product names.
- **Primary interaction:** Open product detail.
- **Existing pattern/component:** `SectionHeader` + two `ProductCard` instances — **Reuse**.
- **Responsive notes:** Two-column when space supports; stack without changing product order on narrow screens.
- **Accessibility notes:** Product names remain text headings; each CTA identifies its destination.

### Section 03 — Kubernetes context

- **Purpose:** Answer whether Atlas Grid fits the Kubernetes domain/context.
- **Content:** Existing Kubernetes content; no new claims added.
- **Primary interaction:** Explore Kubernetes destination.
- **Existing pattern/component:** `SectionHeader` + `FeatureCard` composition — **Compose/Reuse** depending supplied content shape.
- **Responsive notes:** Prioritize explanatory text before optional media; stack cards predictably.
- **Accessibility notes:** Icon/media is decorative unless it conveys unique information.

### Section 04 — Enterprise evaluation

- **Purpose:** Address enterprise-oriented evaluation needs and transition into evidence.
- **Content:** Existing enterprise-oriented proof; exact proof copy is not supplied and must be preserved from source content during implementation.
- **Primary interaction:** Explore Enterprise destination.
- **Existing pattern/component:** `SectionHeader` + `FeatureCard` (likely `emphasized` where justified by existing system) — **Reuse/Variant**.
- **Responsive notes:** Keep proof statements adjacent to their labels/source context.
- **Accessibility notes:** Do not encode proof significance by visual treatment alone.

### Section 05 — Reliability proof

- **Purpose:** Provide quantitative reliability evidence at the point where evaluators are judging technical credibility.
- **Content:** Existing three reliability metrics.
- **Primary interaction:** Primarily informational; any supporting link must use an existing destination if one exists.
- **Existing pattern/component:** `MetricBand` — **Reuse**.
- **Responsive notes:** Existing component responsive behavior is known to exist; retain all metric labels/notes when stacking or wrapping.
- **Accessibility notes:** Metrics require textual labels; do not rely on visual size alone.

### Section 06 — Customer proof

- **Purpose:** Establish adoption/social proof before the detailed story.
- **Content:** Existing customer logos.
- **Primary interaction:** Optional customer destination if existing content supports it.
- **Existing pattern/component:** `LogoWall` — **Reuse**.
- **Responsive notes:** Use existing responsive behavior.
- **Accessibility notes:** Logo alternatives should name organizations when logos convey customer identity; decorative duplication should be avoided.

### Section 07 — Featured case study

- **Purpose:** Convert general proof into a concrete customer story.
- **Content:** Existing featured case study and proof.
- **Primary interaction:** Open featured case study; secondary path to Customers/case studies where supported.
- **Existing pattern/component:** `CaseStudyFeature` — **Reuse**.
- **Responsive notes:** Keep story context and proof connected when stacked.
- **Accessibility notes:** CTA identifies the case study; media requires appropriate alternative treatment based on content role.

### Section 08 — Start Here guidance

- **Purpose:** Give evaluators who are not ready to choose a product or demo a clear lifecycle path.
- **Content:** Existing Start Here guidance/destination.
- **Primary interaction:** Open Start Here.
- **Existing pattern/component:** `CTASection` — **Reuse**.
- **Responsive notes:** Single clear action remains visually dominant.
- **Accessibility notes:** Avoid generic “Learn more” when multiple nearby links exist.

### Section 09 — Evaluation resources

- **Purpose:** Offer both ongoing content and technical documentation without mixing them into product choice.
- **Content:** Existing Blog content/cards and Docs destination.
- **Primary interaction:** Read Blog; open Docs.
- **Existing pattern/component:** `SectionHeader` + `ContentCard` for article/resource previews — **Reuse**. A Docs card may use `ContentCard` because its declared responsibility is an “article / resource preview”; no new card type is justified.
- **Responsive notes:** Cards stack/wrap using existing responsive behavior; preserve resource type labeling.
- **Accessibility notes:** Card link text must distinguish article titles and Docs destination.

### Section 10 — Pricing checkpoint

- **Purpose:** Support the primary user task of comparing pricing before conversion.
- **Content:** Link/prompt to existing public Pricing destination; do not invent price data on the homepage.
- **Primary interaction:** View Pricing.
- **Existing pattern/component:** `CTASection` — **Reuse**.
- **Responsive notes:** Keep pricing CTA before final demo conversion in document order.
- **Accessibility notes:** Destination must be explicit.

### Section 11 — Demo/contact conversion

- **Purpose:** Complete the evaluation journey with the existing contact/demo path.
- **Content:** Existing homepage contact form / contact-demo content.
- **Primary interaction:** Submit contact/demo request.
- **Existing pattern/component:** **Unknown from supplied component inventory.** The inventory includes `CTASection` but no form component. Preserve the existing form implementation if present; do not invent a replacement component without repository inspection.
- **Responsive notes:** Form fields must remain usable at narrow widths; exact behavior cannot be validated here.
- **Accessibility notes:** Inputs require programmatic labels, clear required status, keyboard operation, focus visibility, and accessible error/success feedback. Existing compliance is unknown and must be tested in implementation.

### Section 12 — Footer

- **Purpose:** Provide persistent access to secondary/site-wide destinations including About and Contact.
- **Content:** Required site links as supported by existing IA.
- **Primary interaction:** Navigate to destination.
- **Existing pattern/component:** `Footer` — **Reuse**.
- **Responsive notes:** Existing responsive behavior is known to exist.
- **Accessibility notes:** Use semantic navigation landmarks and descriptive link text in the implementation.

---

# 5. Content coverage matrix

## Homepage coverage

| Existing content | Existing location | Proposed location | Action | Status | Notes |
|---|---|---|---|---|---|
| Hero heading: “The platform for modern infrastructure” | Homepage §1 | Section 01 Hero | Preserve | Preserved | Supporting explanatory copy may be refined later only from approved source content. |
| Observe | Homepage §2 | Section 02 Product choice | Preserve | Preserved | Product name must remain. |
| Automate | Homepage §2 | Section 02 Product choice | Preserve | Preserved | Product name must remain. |
| Kubernetes content | Homepage §3 | Section 03 Kubernetes context | Move within sequence, preserve content | Moved | Structural framing changes; factual content must be preserved from source. |
| Enterprise section/proof | Homepage §4 | Section 04 Enterprise evaluation | Move within sequence, preserve content | Moved | Positioned directly before reliability/customer proof. |
| Three reliability metrics | Homepage §5 | Section 05 Reliability proof | Preserve | Preserved | No metric values were supplied in fixture, so none are invented here. |
| Customer logos | Homepage §6 | Section 06 Customer proof | Preserve | Preserved | Keep identities available in source implementation. |
| Featured case study | Homepage §7 | Section 07 Featured case study | Preserve | Preserved | Case studies remain discoverable. |
| Blog cards | Homepage §8 | Section 09 Evaluation resources | Preserve | Moved | Combined with Docs destination at resource stage. |
| Contact form | Homepage §9 | Section 11 Demo/contact conversion | Preserve | Moved | Retained as final conversion step; exact form component is unknown. |

## Required site-content coverage

| Required content | Proposed location | Action | Status | Notes |
|---|---|---|---|---|
| Observe | Platform nav + homepage §2 | Preserve | Preserved | Existing product name retained. |
| Automate | Platform nav + homepage §2 | Preserve | Preserved | Existing product name retained. |
| Kubernetes content | Top-level Kubernetes + homepage §3 | Move out of mixed Solutions group | Moved | No content removal. |
| Enterprise-oriented proof | Top-level Enterprise + homepage §§4–7 | Move out of mixed Solutions group | Moved | Proof retained. |
| Start Here guidance | Utility navigation + homepage §8 | Move out of mixed Solutions group | Moved | Lifecycle role made explicit. |
| Customer logos | Homepage §6 | Preserve | Preserved | — |
| Case studies | Customers destination + homepage §7 | Preserve discoverability | Preserved | Existing individual case-study inventory is not supplied. |
| Blog | Resources + homepage §9 | Preserve | Preserved | — |
| Docs | Resources + homepage §9 | Preserve and surface on homepage | Preserved | Homepage link is proposed; Docs destination already exists. |
| Pricing | Primary navigation + homepage §10 | Preserve and surface in journey | Preserved | Pricing data itself is not duplicated or invented. |
| About | Company submenu + Footer | Move under renamed company group | Moved | Destination retained. |
| Contact / demo path | Company submenu + global Request Demo + homepage §11 | Preserve; expose conversion path | Moved | No new destination assumed. |
| Reliability metrics | Homepage §5 | Preserve | Preserved | — |

## Missing-content review

There are **no unintended Missing items** in the supplied required-content list.

## Intentional removals

No required content is intentionally removed. The only structural removal is the ambiguous **`Solutions` container label/group**, while all three child destinations are retained and reassigned according to their actual roles.

---

# 6. SYSTEMIZE — Existing component inventory and mapping

## 6.1 Supplied component inventory

| Component | Supplied responsibility / content | Proposed disposition |
|---|---|---|
| `HeroSection` | Heading, supporting copy, primary/secondary CTA, optional media | Reuse |
| `SectionHeader` | Eyebrow, title, supporting copy | Reuse |
| `ProductCard` | Product name, description, optional CTA | Reuse |
| `FeatureCard` | Capability/benefit, optional icon/media, optional CTA; default/emphasized/compact | Reuse / existing variant |
| `MetricBand` | 2–6 metrics, label, supporting note | Reuse |
| `LogoWall` | Customer/partner logos | Reuse |
| `CaseStudyFeature` | Featured customer story, proof, CTA | Reuse |
| `ContentCard` | Article/resource preview | Reuse for Blog and Docs resource preview |
| `CTASection` | Conversion message, primary CTA, optional secondary CTA | Reuse for Start Here and Pricing checkpoint |
| `Footer` | Footer | Reuse |

## 6.2 Duplication findings

No duplicate component implementations can be established because source code is unavailable. At the specification level, the redesign deliberately avoids introducing page-specific versions such as `KubernetesCard`, `EnterpriseCard`, `PricingCTA`, or `StartHereCTA`; those needs fit existing component responsibilities.

## 6.3 Homepage component mapping

| Section | Pattern | Component | Action | Decision trace |
|---|---|---|---|---|
| Hero | Orientation/conversion hero | `HeroSection` | Reuse | Existing contract already supports heading, copy, two CTAs, optional media. |
| Product choice | Product cards | `SectionHeader` + `ProductCard` | Reuse | Exact content model match. |
| Kubernetes | Context/capability content | `SectionHeader` + `FeatureCard` | Compose/Reuse | Avoid domain-named one-off component. |
| Enterprise | Audience/proof content | `SectionHeader` + `FeatureCard` | Reuse/Variant | Existing emphasized variant is available if source content warrants emphasis. |
| Reliability | Metric band | `MetricBand` | Reuse | Supports three metrics directly. |
| Customer logos | Logo wall | `LogoWall` | Reuse | Exact fit. |
| Featured story | Case-study feature | `CaseStudyFeature` | Reuse | Exact fit. |
| Start Here | Guided next step | `CTASection` | Reuse | Exact conversion-message responsibility. |
| Resources | Resource cards | `SectionHeader` + `ContentCard` | Reuse | Declared to support article/resource previews. |
| Pricing | Evaluation CTA | `CTASection` | Reuse | No pricing table is required by supplied homepage content. |
| Demo/contact | Form conversion | Existing form implementation if present | Inspect before change | No form component is supplied; creating one without repository evidence would violate reuse-first governance. |
| Footer | Site footer | `Footer` | Reuse | Existing. |

## 6.4 New component requirements

### A. SiteHeader / global navigation — conditional requirement

The supplied component inventory does not list a header/navigation component, even though the current site necessarily has navigation content. Therefore this is a **conditional** requirement:

- First inspect the real repository for an existing header/navigation pattern.
- If one exists, **reuse or extend it** to express the locked IA.
- Only if none exists should the following proposed contract be created.

#### Component contract — SiteHeader

- **Name:** `SiteHeader`
- **Purpose:** Render global primary navigation and persistent lifecycle/conversion actions.
- **Status:** Proposed **only if repository inspection confirms no existing equivalent**.

**Responsibility:** Own global site navigation presentation and interaction, not page-specific content.

**Content model**

| Field | Required | Type / shape | Notes |
|---|---|---|---|
| primary navigation items | Yes | ordered nav item list; optional child list | Must represent locked IA. |
| utility actions | Yes | `Start Here`, `Request Demo` links/actions | Existing destinations only; no invented URLs. |
| brand/home link | Yes | link | Destination: Home. |

**Variants**

No visual variants are justified by the supplied evidence. Desktop/mobile are responsive states, not separate components.

**States**

- Default
- Hover where pointer input exists
- Focus
- Active/current page
- Expanded/collapsed submenu or mobile menu as applicable

**Responsive behavior**

| Condition | Behavior |
|---|---|
| Wide layout | Present primary navigation with child groups where applicable; keep utility actions visible. |
| Constrained layout | Collapse navigation into a keyboard-operable disclosure/menu while preserving item order and grouping logic; keep primary conversion action reachable without changing its meaning. |

**Interaction**

- Trigger: link activation; menu/disclosure activation where needed.
- Response: navigation or submenu/menu expansion.
- Keyboard behavior: all interactive controls reachable and operable by keyboard; Escape behavior for overlays/disclosures if used.
- Focus behavior: visible focus; focus must not be lost when menu states change.

**Accessibility**

- Semantic role: site header plus navigation landmark.
- Accessible name: navigation landmark must be distinguishable if multiple nav landmarks exist.
- Keyboard requirements: full navigation and disclosure operability.
- Contrast/visual requirements: current/focus states cannot depend on color alone.
- Motion considerations: any menu motion should respect reduced-motion preferences.

**Composition rules**

May contain navigation links, grouped child links, and utility actions.  
May be contained by the global application/site shell.  
Must not contain page-specific evaluation content or duplicate footer responsibilities.

**Reuse decision**

- [ ] Existing component cannot be reused unchanged — requires repository inspection.
- [ ] Existing component cannot be extended safely — requires repository inspection.
- [x] No supplied inventory component has global-navigation responsibility.
- [x] Composition of supplied content components does not replace a navigation primitive.

### B. Contact/demo form

No new component contract is justified from packet evidence. The homepage already has a contact form, so an implementation exists at some layer even though it is omitted from the supplied inventory. The correct next action is **inspect and reuse/extend the existing form implementation**, not invent a parallel component.

## 6.5 Token changes

**None proposed.** Existing shared spacing and typography tokens already exist, and the packet explicitly says not to introduce a new token family without evidence. No supplied evidence demonstrates a missing token category.

## 6.6 Migration impact

- Frontend stack migration: **none**; explicitly out of scope.
- IA/navigation: requires restructuring labels/grouping while preserving all supplied destinations.
- Homepage composition: primarily reorder/recompose existing components; no evidence supports wholesale component replacement.
- New reusable component risk: only global header/navigation is conditional because it is absent from the supplied inventory; repository inspection must precede creation.
- Existing form: preserve and audit before altering.

---

# 7. EXPLORE — Visual direction constraints, not fabricated design

The packet provides no brand system or visual reference evidence, so a polished visual direction cannot be responsibly “chosen.” The safe exploration brief is:

- Keep the **locked IA and homepage section order unchanged** during visual exploration.
- Reuse existing spacing and typography tokens rather than introducing new token families.
- Explore only variables the governing skill permits: typography application, spacing/density, grid, color logic, image treatment, border/container strategy, and motion principles.
- Any visual proposal must preserve the explicit evaluation hierarchy: orientation → product fit → Kubernetes/Enterprise fit → reliability/customer proof → Start Here/resources/pricing → demo.
- Reject any direction that requires page-specific components or content reclassification to look coherent.

**No final color, font, imagery, motion, or container style is asserted in this case** because no brand constraints or rendered design evidence are supplied.

---

# 8. IMPLEMENT — Traceable implementation plan

Actual implementation cannot be performed from this packet because it contains no frontend source repository. The strongest valid implementation artifact is the following ordered plan.

## 8.1 Implementation order

1. **Semantic structure:** update global navigation hierarchy to the locked IA; preserve all destinations.
2. **Content correctness:** verify every source content item against the content coverage matrix before moving it.
3. **Homepage layout:** compose Sections 01–12 using the component mapping.
4. **Responsive behavior:** retain supplied components’ existing responsive behavior; explicitly test new composition order and any header changes.
5. **Typography:** use existing typography tokens.
6. **Visual treatment:** use existing system patterns/tokens unless actual repository evidence justifies an extension.
7. **Interaction:** ensure navigation disclosures, CTAs, and existing contact form are keyboard operable.
8. **Motion:** keep optional and system-consistent; respect reduced motion.
9. **Polish:** only after content, responsiveness, and accessibility pass.

## 8.2 Traceability matrix

| Implementation decision | Source artifact |
|---|---|
| Remove mixed `Solutions` grouping | Current IA audit + known structural issue |
| Keep Observe/Automate names | Project content constraint + proposed IA |
| Keep public Pricing | Project constraint + proposed IA + homepage §10 |
| Keep case studies discoverable | Project constraint + Customers nav + homepage §7 |
| Surface Start Here as lifecycle action | IA grouping logic + homepage §8 |
| Expose demo action globally | Primary user task + business goal + proposed IA |
| Reuse existing content components | Existing component inventory + homepage component mapping |
| Do not create new token family | Existing design-system constraint + token decision |
| Inspect form before creating component | Missing component evidence + reuse governance |
| Preserve responsive behavior and add composition testing | Existing responsive component constraint + accessibility/responsive requirement |

---

# 9. VALIDATE — Artifact-level validation

## 9.1 IA gate

- [x] Categories/grouped submenus use understandable models.
- [x] Mixed `Solutions` children are no longer presented as equivalent siblings.
- [x] Required destinations remain present.
- [x] Pricing remains directly reachable.
- [x] Contact remains present and demo intent gains a direct action.
- [x] Mobile can preserve the same ordering/grouping model in principle.
- [ ] Real mobile interaction cannot be verified without implementation.
- [ ] Future-content scalability cannot be fully verified without a roadmap/content inventory beyond the fixture.

## 9.2 Wireframe gate

- [x] Homepage has one clear evaluation goal.
- [x] Section order follows an explicit evaluation journey.
- [x] CTA hierarchy is explicit.
- [x] Every supplied homepage content item has a disposition.
- [x] Every required content item remains discoverable.
- [x] No required content is removed implicitly.

## 9.3 Visual gate

- [ ] Brand fit cannot be validated because brand constraints and rendered designs are unavailable.
- [x] Structural hierarchy remains understandable without relying on decoration in the specification.
- [x] The proposal does not require new token families.

## 9.4 System gate

- [x] Repeated patterns map to supplied shared components wherever their responsibilities fit.
- [x] Page-context component proliferation is avoided.
- [x] Existing variants are preferred over page-specific components.
- [x] No token changes are proposed without evidence.
- [x] Responsive considerations are defined per section/spec.
- [ ] Actual component APIs, accessibility behavior, and duplicate implementations require repository inspection.

## 9.5 Implementation gate

- [x] Content coverage is complete at the specification level.
- [x] Reuse has been reviewed before proposing any new component.
- [ ] Responsive states cannot be rendered/tested from the packet.
- [ ] Accessibility cannot be technically audited from the packet.
- [ ] Visual regressions cannot be tested without a rendered implementation.
- [x] No unnecessary one-off style/component requirement is introduced by this specification.

---

# 10. Risks and assumptions

## Risks

1. **Navigation breadth:** promoting Kubernetes and Enterprise to top-level items increases the number of primary labels. Without analytics/user testing, the tradeoff between breadth and the current ambiguous grouping cannot be empirically measured.
2. **Future scalability:** if many new domains, industries, or audiences are planned, the proposed top-level structure may eventually require explicit grouped taxonomies. No roadmap is supplied, so the fixture should not invent those groups today.
3. **Demo semantics:** `Request Demo` is recommended as a visible task label, but the packet does not provide the actual destination or form semantics. It must point to the existing validated contact/demo path.
4. **Header component uncertainty:** the inventory omits a header/navigation component. Creating a new one without checking the actual codebase could duplicate an existing implementation.
5. **Form-system uncertainty:** the homepage has a contact form but the component inventory does not describe it. Reuse/accessibility cannot be confirmed until implementation is inspected.
6. **Visual uncertainty:** no brand or rendered-site evidence is supplied, so visual-system changes beyond existing tokens would be speculative.

## Assumptions used only to make the artifact actionable

- Existing destinations named in current navigation remain valid destinations.
- Existing homepage content can be moved without changing its factual meaning.
- The existing contact form is the supplied contact/demo conversion mechanism unless repository evidence shows otherwise.

No performance, conversion, customer, reliability, pricing, or accessibility results are assumed.

---

# 11. Definition-of-done assessment

| Governing-skill criterion | Result |
|---|---|
| IA is coherent | **Pass for supplied fixture**, with documented scalability risk. |
| Important content is accounted for | **Pass.** All supplied required content has an explicit disposition. |
| Core page patterns are established | **Pass at specification level.** Homepage section and CTA patterns are defined. |
| Design rules are reusable | **Pass at architecture level.** Existing tokens/components are reused; no visual system is fabricated. |
| Components have clear responsibilities | **Pass for supplied inventory/mapping.** Conditional SiteHeader contract is isolated. |
| Responsive behavior is defined | **Partial.** Section/component expectations are defined; rendered behavior cannot be verified. |
| Accessibility is checked | **Partial.** Requirements/checks are specified; technical audit is impossible without implementation. |
| Implementation can scale without page-by-page reinvention | **Pass as design intent/specification**, not empirically verified in code. |

## Final status

**Complete design/specification result for the evidence available in the packet.**

The structural redesign is ready to hand to an implementation phase: the mixed `Solutions` taxonomy is resolved, navigation is provisionally locked, the homepage has a traceable evaluation journey, all required content is covered, and every section has a reuse-first component decision. No claim is made that code, rendered responsiveness, accessibility conformance, or visual regressions were validated, because the required implementation artifacts/capabilities are not present in the packet.
