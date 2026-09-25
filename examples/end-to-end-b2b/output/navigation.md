# Atlas Grid — Proposed Navigation

## Grouping model

- **Product** — what the platform does.
- **Use Cases** — problems users are trying to solve.
- **Technology** — domain / environment context.
- **Resources** — learning, proof, and documentation.
- **Company** — organization information.
- **Get Started** — evaluation / conversion action.

## Proposed structure

```text
Home
├── Product
│   ├── Observe
│   └── Automate
├── Use Cases
│   ├── Observability
│   └── Workflow Automation
├── Technology
│   └── Kubernetes
├── Resources
│   ├── Case Studies
│   ├── Blog
│   └── Docs
├── Pricing
└── Company
    └── About

Primary CTA: Request Technical Demo
Utility / footer: Contact, Start Here
```

## Content disposition

| Existing content | Destination | Action |
|---|---|---|
| Observe | Product | Preserve |
| Automate | Product | Preserve |
| Kubernetes | Technology | Move |
| Enterprise content | Product / use-case proof sections | Redistribute |
| Start Here | Get Started / lifecycle guidance | Move |
| Customers / case studies | Resources → Case Studies | Preserve |
| Blog | Resources → Blog | Preserve |
| Docs | Resources → Docs | Preserve |
| Pricing | Pricing | Preserve |
| About | Company → About | Preserve |
| Contact | Utility / footer | Preserve |
| Demo intent | Primary CTA | Elevate |

## Assumptions

`Observability` and `Workflow Automation` are inferred from the existing product names and business context. In a real project they require validation before IA lock.

## IA gate

- [x] Major groups use one dominant mental model
- [x] Required content has an explicit disposition
- [x] Enterprise is no longer an ambiguous global-navigation noun
- [x] Lifecycle content is removed from solution taxonomy
- [x] Demo conversion is separated from company information
- [x] Structure can map to mobile navigation
