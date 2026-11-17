# IA Audit Fixture 001 — Structural Navigation Audit

## Scope

- **Website / product:** Synthetic B2B analytics product fixture
- **Primary audience:** Evaluators comparing a B2B analytics product; technical buyers; operations leaders
- **Primary user tasks:** Understand capabilities; find a relevant solution; inspect proof; compare pricing; request a demo
- **Date:** Not supplied in the case input
- **Evidence sources:** Case input sitemap and requirements; packet-provided `references/workflow.md`; packet-provided `references/information-architecture.md`; packet-provided `templates/navigation-comparison.md`
- **Evidence limitations:** No analytics/behavioral data, business-goal detail beyond the listed user tasks, competitor/reference observations, technical/CMS constraints, mobile implementation constraints, accessibility requirements, or stakeholder requirements were supplied. No external research was performed.

## Current IA

```text
Home
├── Products
│   ├── Monitor
│   └── Automate
├── Solutions
│   ├── Healthcare
│   ├── Enterprise
│   └── Getting Started
├── Resources
│   ├── Blog
│   └── Case Studies
├── Pricing
└── Company
    ├── About
    └── Contact
```

## Structural findings

| Issue | Evidence | User impact | Severity |
|---|---|---|---|
| Mixed taxonomy inside **Solutions** | `Healthcare` is an industry; `Enterprise` is an audience/company segment; `Getting Started` is a lifecycle/guidance destination | Users cannot infer a single rule for what belongs under Solutions, reducing predictability and future scalability | High |
| Getting Started is grouped by an unrelated model | It sits beside an industry and an audience segment, despite functioning as guidance/lifecycle content | New or evaluating users may not look under Solutions for onboarding/getting-started guidance | High |
| Proof is not task-prominent | `Case Studies` is nested under Resources while “inspect proof” is a primary task | Evaluators may require an extra categorization guess to find customer proof | Medium |
| Demo intent is not explicit in navigation | The current sitemap exposes `Contact`, but the listed primary task is “request a demo” | A conversion-critical task depends on users interpreting a general contact destination as the demo path | High |
| Solutions does not scale cleanly | Adding more industries, audience segments, use cases, or lifecycle content at the same level would compound the mixed taxonomy | Navigation becomes less predictable as content grows | High |
| Company grouping is coherent but conversion and corporate contact are conflated by implication | `About` and `Contact` are organization-oriented destinations, but the task list separately emphasizes requesting a demo | Corporate information remains findable, but the purchase/evaluation path is under-signaled | Medium |

## Market / reference patterns

No competitor or external market references are available within the permitted case materials, so no market patterns are claimed.

| Pattern | Where observed | Why it may matter | Copy directly? |
|---|---|---|---|
| Not available | No competitor/reference evidence supplied | The proposed IA must be justified from user tasks, current content, and IA principles rather than market convention | No |

## Proposed navigation

```text
Home
├── Products
│   ├── Monitor
│   └── Automate
├── Solutions
│   ├── By Industry
│   │   └── Healthcare
│   └── By Company Size
│       └── Enterprise
├── Resources
│   ├── Getting Started
│   └── Blog
├── Case Studies
├── Pricing
├── Company
│   ├── About
│   └── Contact
└── Request a Demo  [prominent conversion action]
```

### Demo-path rule

`Request a Demo` should be presented as a prominent navigation/utility action because it maps directly to a primary user task. Based on the supplied content, it should route to the existing `Contact` destination **only if that destination actually supports demo requests**. If it does not, a dedicated demo destination would be required, but the case provides no content evidence from which to define that new page; that remains an unresolved requirement rather than an invented page.

## Navigation comparison

| Area | Current structure | Observed pattern | Proposed structure | Rationale |
|---|---|---|---|---|
| Product discovery | Products → Monitor, Automate | No external pattern available | Keep Products → Monitor, Automate | The current product grouping is coherent and directly supports understanding capabilities; there is no evidence that a rename would improve it |
| Solution discovery | Solutions → Healthcare, Enterprise, Getting Started | No external pattern available | Solutions → By Industry → Healthcare; By Company Size → Enterprise | Keeps Solutions as the discovery entry point while separating unlike mental models into explicitly labeled subgroups |
| Getting-started guidance | Under Solutions | No external pattern available | Move to Resources | Guidance is more predictable as educational/resource content than as a sibling of industry/audience solutions |
| Proof | Resources → Case Studies | No external pattern available | Promote Case Studies to a direct top-level destination | “Inspect proof” is a primary evaluation task; direct exposure reduces categorization and interaction cost without inventing new content |
| Pricing | Top-level Pricing | No external pattern available | Keep top-level Pricing | Already maps cleanly to the primary task “compare pricing” |
| Corporate information | Company → About, Contact | No external pattern available | Keep Company → About, Contact | This group has a coherent organization-information model and preserves both required destinations |
| Demo conversion | Implicit through Contact | No external pattern available | Add prominent Request a Demo action; use Contact only if it supports that intent | Makes a critical evaluation/conversion task explicit while avoiding fabrication of a new destination |

## Grouping logic

### Products
- **Mental model:** Product
- **Question answered:** “What product capabilities can I evaluate?”
- **Why items belong together:** Monitor and Automate are already defined by the current sitemap as products.
- **How it scales:** Additional product/module destinations can be added as siblings if they share the same product-level meaning.

### Solutions
- **Mental model:** Framed discovery group with explicitly separated submodels
- **Question answered:** “Which solution is relevant to my context?”
- **Why items belong together:** Healthcare and Enterprise both help users locate relevance, but they answer different classification questions. The proposal makes those distinctions explicit rather than leaving unlike items as siblings.
- **Subgroups:**
  - **By Industry** → Healthcare (**industry** model)
  - **By Company Size** → Enterprise (**audience/company-segment** model)
- **How it scales:** New industries belong under By Industry; new company-size/segment material belongs under By Company Size. If future content introduces materially different solution models such as use cases, it should receive a separate labeled subgroup rather than be mixed into the same sibling list.

### Resources
- **Mental model:** Educational/resource content
- **Question answered:** “How do I learn about or get started with the product?”
- **Why items belong together:** Getting Started and Blog both support learning/guidance rather than describing a market segment or product.
- **How it scales:** Additional educational guides or editorial material can be added here. If resource volume grows substantially, explicit resource-type subgroups may become necessary.

### Case Studies
- **Mental model:** Task-priority direct destination / proof content
- **Question answered:** “What proof can I inspect?”
- **Why it is top-level:** The case explicitly names proof inspection as a primary task. A direct destination avoids forcing evaluators to infer that proof lives under a broader Resources category.
- **How it scales:** If proof content expands beyond case studies, this may need to become a broader proof/customer-results group. No such additional content is supplied in the case, so no broader category is invented now.

### Pricing
- **Mental model:** Task-priority direct destination
- **Question answered:** “What does it cost / how can I compare pricing?”
- **Why it is top-level:** It directly corresponds to a primary task and is already structurally clear.

### Company
- **Mental model:** Organization information
- **Question answered:** “Who is the company and how do I contact it?”
- **Why items belong together:** About and Contact are organization-level destinations rather than product or solution content.
- **How it scales:** Additional organization-oriented content could fit here if introduced later.

### Request a Demo
- **Mental model:** Conversion action / primary user goal
- **Question answered:** “How do I request a demo?”
- **Why it is prominent:** The action maps exactly to a stated primary task and should not depend on interpreting a generic Company → Contact path.

## Required-content disposition

| Required content | Proposed disposition | Status | Notes |
|---|---|---|---|
| Monitor | Products → Monitor | Preserved | No structural change |
| Automate | Products → Automate | Preserved | No structural change |
| Healthcare | Solutions → By Industry → Healthcare | Moved | Same content; clearer industry grouping |
| Enterprise-oriented content | Solutions → By Company Size → Enterprise | Moved | Treats Enterprise as the supplied audience/company-segment concept; exact content scope is not provided |
| Getting Started guidance | Resources → Getting Started | Moved | Removed from mixed Solutions taxonomy; retained as guidance |
| Blog | Resources → Blog | Preserved | Remains resource content |
| Case Studies | Top-level Case Studies | Moved | Promoted for direct access to proof |
| Pricing | Top-level Pricing | Preserved | Directly supports pricing comparison |
| About | Company → About | Preserved | Coherent organization-information grouping |
| Contact/demo path | Company → Contact plus prominent Request a Demo action | Preserved / clarified | Demo action may reuse Contact only if Contact actually supports demo requests; otherwise a dedicated destination is an unresolved content requirement |

**Coverage result:** No required content is intentionally removed. Every required item is preserved or moved; the only unresolved item is whether the supplied Contact destination is functionally sufficient for the required demo path.

## Rationale

The earliest unstable layer is information architecture, specifically the current Solutions taxonomy and the discoverability of two primary tasks: inspecting proof and requesting a demo. The proposal therefore changes only structure and navigation.

The central correction is to stop presenting `Healthcare`, `Enterprise`, and `Getting Started` as equivalent siblings. Healthcare and Enterprise remain under Solutions because both support relevance-finding, but they are separated by explicit organizing labels. Getting Started moves to Resources because it serves guidance rather than solution segmentation. Case Studies becomes a direct destination because proof inspection is explicitly task-critical. Pricing remains direct. Company retains About and Contact. Request a Demo becomes an explicit conversion action without claiming that a new demo page exists.

This is intentionally a conservative restructure: it reuses existing labels and destinations wherever the current grouping is already coherent and introduces only the minimum structural labels/actions needed to make the mental models predictable.

## Unresolved risks and assumptions

1. **Demo destination capability is unknown.** The case does not state whether Contact supports demo requests. This must be verified before locking the conversion path.
2. **Enterprise semantics are not fully defined.** The proposal interprets the supplied “Enterprise-oriented content” as a company-size/audience segment because that is the strongest structural reading available. If the actual content is instead a use case, service tier, deployment model, or product package, it should be regrouped accordingly.
3. **No behavioral evidence is available.** There are no analytics, search logs, usability findings, or conversion data to validate current user failures or quantify improvement; severity is therefore an IA judgment based on the supplied tasks and sitemap.
4. **No competitor/reference research is available.** The proposal does not claim alignment with market conventions.
5. **Future content volume is unknown.** The proposed subgroups are scalable in principle, but actual thresholds for mega-menu treatment, deeper hierarchy, or resource subcategories cannot be determined from this fixture.
6. **Mobile constraints are unknown.** The same mental model can be represented on mobile, but no implementation-specific mobile behavior can be validated from the supplied evidence.

## Validation result

| Lock-gate check | Result | Basis |
|---|---|---|
| Important destinations are predictable | **Pass with condition** | Products, solution contexts, Getting Started, Case Studies, Pricing, About, and Contact have explicit homes; demo predictability depends on confirming its destination |
| Each major group has a clear organizing model | **Pass** | Products, Resources, Company, and direct task links are coherent; Solutions explicitly separates industry and company-size submodels |
| Duplicate destinations are intentional or removed | **Pass with condition** | Contact may serve both corporate contact and demo conversion only if that dual function is intentional and supported by the destination |
| Labels are understandable externally | **Pass** | Proposed labels use familiar user-facing concepts and avoid unexplained internal terminology based on available evidence |
| Future content has a plausible home | **Pass with limits** | Product, industry, company-size, educational resource, proof, pricing, and company content have clear placement; unknown future models would require reassessment |
| Navigation depth is reasonable | **Pass** | Most task-critical destinations remain one or two levels deep; Solutions adds one explicit classification level to gain predictability |
| Structure can scale | **Pass with limits** | Explicit solution subgroups prevent mixed sibling growth; unknown content volume may require later refinement |
| Mobile navigation can preserve the same mental model | **Pass conceptually / not implementation-validated** | The hierarchy does not rely on desktop-only semantics, but no mobile implementation or testing evidence is available |

### IA lock status

**Conditionally ready to lock.** The structural model is coherent enough to proceed once one blocking content/navigation fact is confirmed: whether the existing Contact destination supports a demo request. If it does, the proposed IA can use that destination for the prominent Request a Demo action. If it does not, the IA requires a dedicated demo destination whose content must be defined before lock.

No wireframe, visual-design, component, or implementation work is included because the case explicitly requests an IA audit and prohibits visual design or code implementation.
