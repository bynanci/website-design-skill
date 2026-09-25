# Northstar Analytics — Navigation Comparison

## Structural findings

| Issue | Evidence | User impact | Severity |
|---|---|---|---|
| Mixed taxonomy | `Solutions` contains Healthcare, Enterprise, and Getting Started | Users must infer whether the group is organized by industry, audience, or lifecycle | High |
| Ambiguous label | `Enterprise` can mean audience, plan, or product tier | Visitors cannot predict what content they will get | High |
| Lifecycle content in solutions | `Getting Started` is onboarding/evaluation guidance | Weakens the meaning of `Solutions` | Medium |
| Conversion path split | Contact lives under Company while demo intent is product evaluation | CTA is structurally separated from the primary evaluation journey | Medium |

## Proposed grouping logic

- **Product** — what the platform does.
- **Solutions** — problems / use cases the platform solves.
- **Industries** — domain-specific applications.
- **Resources** — evidence and learning content.
- **Company** — organization information.
- **Get started** — conversion / evaluation actions.

## Comparison

| Area | Current | Proposed | Rationale |
|---|---|---|---|
| Products | Monitor, Automate | Product → Monitor, Automate | Keep capability grouping intact |
| Solutions | Healthcare, Enterprise, Getting Started | Solutions → Incident response, Workflow automation | Use one dominant model: user problem / use case |
| Industry content | Healthcare under Solutions | Industries → Healthcare | Separates industry taxonomy from use cases |
| Enterprise content | Enterprise under Solutions | Distributed into relevant solution/product pages; enterprise proof can be contextual | Avoid ambiguous top-level noun |
| Getting Started | Under Solutions | Get started / Demo CTA + onboarding resources | Lifecycle action should not define solution taxonomy |
| Resources | Blog, Case Studies | Resources → Blog, Case Studies | Existing grouping is coherent |
| Pricing | Top-level | Pricing | Keep high-intent destination predictable |
| Company | About, Contact | Company → About; Contact remains available but demo becomes primary CTA | Separate company info from evaluation CTA |

## Proposed navigation

```text
Home
├── Product
│   ├── Monitor
│   └── Automate
├── Solutions
│   ├── Incident Response
│   └── Workflow Automation
├── Industries
│   └── Healthcare
├── Resources
│   ├── Blog
│   └── Case Studies
├── Pricing
└── Company
    └── About

Primary CTA: Request Demo
Utility / footer: Contact, Getting Started
```

## Content preservation notes

- Monitor — preserved.
- Automate — preserved.
- Healthcare — moved to Industries.
- Enterprise-oriented content — not deleted; redistribute into relevant solution/product proof sections.
- Getting Started — moved from taxonomy into lifecycle / conversion guidance.
- Blog and Case Studies — preserved.
- Pricing — preserved.
- About — preserved.
- Contact — preserved as utility/footer route; Request Demo becomes primary evaluation CTA.

## Validation

- [x] Major groups use a clear organizing model
- [x] Ambiguous `Enterprise` label removed from global taxonomy
- [x] Required content has an explicit destination
- [x] Pricing remains easy to find
- [x] Conversion path is separated from company information
- [x] Mobile navigation can preserve the same hierarchy

## Remaining assumption

The proposed use-case labels (`Incident Response`, `Workflow Automation`) are synthetic placeholders derived from the fictional product capabilities. In a real project they would require evidence from actual user tasks, content, and product positioning before IA lock.
