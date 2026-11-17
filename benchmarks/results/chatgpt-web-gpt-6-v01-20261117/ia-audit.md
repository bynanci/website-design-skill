# IA Audit Fixture 001 — Structural Audit and Proposed Navigation

**Case:** `ia-audit-001`  
**Phase:** STRUCTURE (information architecture and navigation only)  
**Status:** Proposed IA ready for validation; **not locked**  
**Evidence boundary:** Only the supplied synthetic sitemap, specified primary users/tasks, required-content list, and the packet's governing skill, workflow and IA references/templates. No live website, analytics, competitor sites, user research, CMS inventory, or implementation was available or consulted. Any suggested behavior or user benefit is a hypothesis, not an observed outcome.

## 1. Scope and user tasks

**Product context:** Synthetic B2B analytics product, with named capabilities **Monitor** and **Automate**. No other product functionality is established by the input.

**Primary users:** Evaluators comparing B2B analytics products; technical buyers; operations leaders.

**Primary tasks:** Understand capabilities; find a relevant solution; inspect proof; compare pricing; request a demo.

**Audit goal:** Make those five tasks more predictable in the navigation while retaining every required destination and providing an explicit demo route. No visual design or code implementation is in scope.

## 2. Current IA (as supplied)

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

**Current organizing models:** Products = product/capability; Solutions = industry (**Healthcare**) + audience/organizational segment (**Enterprise**) + lifecycle stage (**Getting Started**); Resources = content type; Pricing = commercial decision; Company = organization and contact. The presence of a link in the sitemap does not establish its page contents, copy, interactions, traffic or effectiveness.

## 3. Structural audit

| Issue | Evidence in supplied sitemap | Likely task impact (inference, not user-tested) | Severity |
|---|---|---|---|
| Mixed taxonomy within Solutions | Healthcare (industry), Enterprise (organization/audience), Getting Started (lifecycle) are siblings | Users cannot consistently predict what belongs under Solutions; onboarding is particularly misplaced | High |
| Demo request is not explicitly signposted | Only `Company > Contact` appears; no named demo destination or CTA | Evaluators looking to request a demo may have to guess that Contact is the right path | High |
| Proof is nested under a generic content bucket | `Resources > Case Studies` | Buyers looking for evidence may not immediately recognize Resources as the location of proof | Medium |
| Getting Started sits apart from product learning | `Solutions > Getting Started` | Users seeking an introduction may search near Products or in a dedicated start path instead | Medium |
| Enterprise label has unclear intent | `Solutions > Enterprise` lacks a segment qualifier or description | Could be interpreted as a product tier, organization size, or industry-like solution | Medium |
| Company is a primary top-level group despite task priorities | About and Contact are nested under Company; main tasks emphasize evaluation, pricing and demo | Prominent space may not align with the stated evaluation tasks | Low–Medium |

**Not evidenced:** Duplicate pages/destinations, broken links, true orphan pages, actual user confusion, excessive interaction depth, mobile navigation problems, and traffic or conversion loss. The current sitemap is shallow; depth itself is **not** a demonstrated defect.

## 4. Proposed information architecture

The proposed navigation distinguishes capabilities, solution contexts, evidence, pricing, and early orientation. **Request a demo** is an action linked to the existing Contact destination **only if that page can support demo enquiries**; it is not represented as a known existing demo page.

```text
Home
├── Products                         [primary: capabilities]
│   ├── Monitor
│   └── Automate
├── Solutions                        [primary: application context]
│   ├── By industry                  [navigation grouping label, not a claimed page]
│   │   └── Healthcare
│   └── By organization              [navigation grouping label, not a claimed page]
│       └── Enterprise               [existing enterprise-oriented content]
├── Resources                        [primary: published evidence and learning]
│   ├── Case Studies
│   └── Blog
├── Pricing                          [primary: pricing destination]
└── Getting Started                  [primary: orientation/guidance]

Persistent header action:
└── Request a Demo                   [label/route proposal → existing Contact page,
                                     conditional on Contact accepting demo requests]

Footer / secondary company navigation:
├── About                            [existing About page]
└── Contact                          [existing Contact page; also header utility
                                     link if demo/contact are distinct tasks]
```

**Important distinctions:** `By industry` and `By organization` are **wayfinding headings**, not newly asserted content pages. Healthcare and Enterprise remain distinct existing destinations; no rewrite, merge or new product offering is presumed. `Getting Started` is promoted from Solutions to a directly reachable destination, not copied. `Request a Demo` is a proposed navigation label for the Contact route, subject to verifying that Contact genuinely supports that action. If it does not, retain **Contact** as the accurate header action and flag a demo workflow/content gap; do not claim that a demo is requestable.

### Navigation priority and findability

| User task | Proposed first choice | Destination / path | Why it is more predictable (hypothesis) |
|---|---|---|---|
| Understand capabilities | Products | Products → Monitor or Automate | Groups capability destinations without introducing unverified offerings |
| Find a relevant solution | Solutions | By industry → Healthcare; By organization → Enterprise | Explicit subcategories name the distinct classification dimensions |
| Inspect proof | Resources | Resources → Case Studies | Retains a direct evidence destination; position Case Studies first in Resources |
| Compare pricing | Pricing | Pricing | Maintains direct top-level access |
| Request a demo | Request a Demo header action, **if supported** | Existing Contact destination | Makes the intended action visible, without assuming a new form or page |
| Find introductory guidance | Getting Started | Direct top-level link | Removes lifecycle content from the Solutions taxonomy |
| Learn about the company or get in touch | Footer/secondary | About; Contact | Preserves both company-information routes without requiring them to compete with the five stated primary tasks |

## 5. Navigation comparison

| Area | Current structure | Market/reference observation | Proposed structure | Rationale |
|---|---|---|---|---|
| Capabilities | Products → Monitor, Automate | **Unavailable** — no external references inspected | Products → Monitor, Automate | Stable product/capability model; no unnecessary changes |
| Solution finding | Solutions → Healthcare, Enterprise, Getting Started | **Unavailable** | Solutions → By industry → Healthcare; By organization → Enterprise | Removes lifecycle mismatch and makes differing solution dimensions explicit |
| Onboarding/orientation | Solutions → Getting Started | **Unavailable** | Direct Getting Started link | Makes lifecycle guidance discoverable without classifying it as a solution |
| Evidence and learning | Resources → Blog, Case Studies | **Unavailable** | Resources → Case Studies, Blog | Gives proof prominence within an existing content-type group; does not duplicate or move case studies into a new page |
| Commercial evaluation | Pricing | **Unavailable** | Pricing | Preserves direct access |
| Company/contact | Company → About, Contact | **Unavailable** | About and Contact in secondary/footer; conditional header demo CTA to Contact | Prioritizes primary buyer tasks, retains company information and surfaces contact intent |

**Reference-pattern limitation:** The packet contains no competitor/reference navigation evidence, and external access was prohibited. Thus there are no observed market conventions to classify as common, useful, differentiating or avoid. The proposed structure is derived from the supplied user tasks and content only.

## 6. Grouping logic and growth rules

| Group / control | User question answered | Mental model | Membership rule and scaling |
|---|---|---|---|
| Products | “What can the product do?” | Capabilities/products | Monitor and Automate; future validated capabilities go here, not to Solutions |
| Solutions → By industry | “Does this apply to my industry?” | Industry | Healthcare; add real, evidenced industry pages under the same heading |
| Solutions → By organization | “Does this apply to my organization type?” | Organization/audience | Enterprise; add verified organization-segment pages here if needed |
| Resources | “Where can I find published evidence or articles?” | Content type | Case Studies, Blog; add distinct resource types only when real |
| Pricing | “What does it cost and how can I compare?” | Commercial task | Single direct destination; no invented tiers or plan details |
| Getting Started | “Where do I begin?” | Lifecycle / orientation | Single direct destination; do not force onboarding into Solutions |
| Request a Demo | “How do I speak to someone about a demo?” | Action | Header action mapped to Contact only after destination suitability is checked |
| About / Contact | “Who is behind this?” / “How do I reach them?” | Company / service | Secondary/footer destinations retained, with clear labels |

**Trade-off:** A direct `Getting Started` top-level item adds a primary navigation choice. It is a deliberate concession to its distinct lifecycle role and user orientation. If later testing shows low demand, place it as a visible header utility link or under a clearly labeled help/orientation group, **not** back under Solutions without justification. `Solutions` heading levels are conceptual; dropdowns and mobile menus should be able to display these as non-clickable section headings with Healthcare and Enterprise selectable below them. Avoid imposing unnecessary extra page transitions.

## 7. Required-content coverage

| Required existing item | Current location | Proposed location | Action | Status | Notes |
|---|---|---|---|---|---|
| Monitor | Products → Monitor | Products → Monitor | Preserve | Preserved | No content change established |
| Automate | Products → Automate | Products → Automate | Preserve | Preserved | No content change established |
| Healthcare | Solutions → Healthcare | Solutions → By industry → Healthcare | Move in navigation hierarchy | Moved | Same destination; no new industry content claimed |
| Enterprise-oriented content | Solutions → Enterprise | Solutions → By organization → Enterprise | Move in navigation hierarchy | Moved | Maintain enterprise-oriented material; confirm page purpose before relabeling |
| Getting Started guidance | Solutions → Getting Started | Getting Started (primary) | Move | Moved | Same guidance, not a new page |
| Blog | Resources → Blog | Resources → Blog | Preserve | Preserved | Listed second for proof priority |
| Case Studies | Resources → Case Studies | Resources → Case Studies | Preserve | Preserved | Listed first for evaluator proof task |
| Pricing | Pricing | Pricing | Preserve | Preserved | Direct nav link maintained |
| About | Company → About | Footer/secondary → About | Move in navigation | Moved | Still accessible; confirm whether a primary About link is warranted |
| Contact/demo path | Company → Contact | Footer/secondary → Contact; conditional header Request a Demo → Contact | Preserve and surface as conditional action | Preserved | Demo capability **unknown**; no invented demo page/form |

**Missing-content review:** No required listed destination is missing from the proposal. **Unverified requirement:** The input lists a contact/demo path but does not establish whether Contact has a demo request facility. Before using the header CTA wording, inspect or otherwise confirm the actual destination; if unsupported, label it Contact and separately identify a demo-request capability/content need. **Intentional removals:** None. The `Company` grouping label is removed from primary navigation, **not** the About or Contact content.

## 8. Risks, assumptions and unresolved questions

1. **Demo action (highest risk):** It is unknown whether Contact allows demo requests. A “Request a Demo” label could be misleading unless confirmed; fallback is “Contact.”
2. **Enterprise interpretation:** The input calls it enterprise-oriented content, but does not say whether it is an audience, organization size, deployment model, or pricing tier. `By organization` is a provisional taxonomy that should be renamed if the actual page proves otherwise.
3. **Navigation density:** Five primary choices plus one CTA may or may not fit particular screen widths. No responsive testing or implementation is performed. Mobile must preserve the section labels and direct paths without additional invented destinations.
4. **Company findability:** Moving About out of primary navigation trades first-level visibility for priority-task alignment. Validate whether visitors still readily find About and Contact.
5. **Proof discoverability:** Reordering Case Studies within Resources may not be enough if users expect proof under Solutions or on a relevant solution page. Do not duplicate content without a canonical destination and evidence for cross-links.
6. **Absent evidence:** No page inventory beyond the sitemap, analytics, search queries, testing, competitive structures, brand constraints, technical constraints, or stakeholder decisions. No claims about actual performance, content quality or mobile behavior are made.

## 9. IA validation gate

| Check | Desk-review result | Evidence / remaining step |
|---|---|---|
| Important destinations are predictable | **Provisional pass** | All required destinations have explicit paths; verify with target users |
| Labels understandable without internal knowledge | **Provisional pass** | Concrete labels used; validate whether Enterprise / By organization convey intended content |
| Coherent grouping logic | **Pass on proposed model** | Products = capability; Solutions explicitly separated by industry vs organization; Resources = content type; Getting Started = lifecycle |
| Duplicates resolved | **Pass in schematic** | Single canonical destination per existing page; demo CTA conditionally links to Contact, not a duplicate page |
| Navigation depth reasonable | **Provisional pass** | Paths generally one or two selections; solution subgroup headings must not become extra mandatory page visits |
| Structure can scale | **Provisional pass** | Explicit membership rules provided; revisit if many new industries or organization segments appear |
| Mobile mental model preserved | **Design requirement, not tested** | Keep same headings and destination order in compact navigation; test with a mobile prototype later |
| Required content accounted for | **Pass against provided list** | 10/10 required entries explicitly mapped; zero intentional content deletions |
| Demo request actually works | **Unverified / blocking for demo CTA label** | Verify Contact workflow or use accurate Contact label |

**Decision:** Accept as a **proposed structural baseline**, not as a locked or proven IA. Lock only after the demo destination, Enterprise meaning, navigation labels, secondary About/Contact access, and mobile feasibility have been checked. Appropriate next validation is a task-based tree test with representative evaluators, technical buyers and operations leaders (locate Monitor/Automate, Healthcare/Enterprise, Case Studies, Pricing and demo/contact) followed by a mobile navigation walkthrough. These tests are **recommended, not performed**.

## 10. Execution identity and scope

- **Execution:** ChatGPT (GPT-6), in this conversation; output composed as a UTF-8 Markdown artifact.
- **Available capability used:** Read the user-supplied ZIP packet and create a local Markdown file.
- **Capabilities intentionally not used:** Web, connected sources, other conversations, outside files, visual design, implementation, live-site inspection or user testing.
- **Governing materials read from this packet:** `SKILL.md`, `packet.json`, `evals/ia-audit/case-001/input.md`, `references/workflow.md`, `references/information-architecture.md`, `templates/navigation-comparison.md`, `templates/content-coverage.md`, `templates/project-context.md`, and `benchmarks/runner-instruction.md`.
- **Evidence status:** The packet is a synthetic audit fixture and is not independent-agent or real-world outcome evidence.
