# Information Architecture

Use this reference when the task involves sitemap, navigation, taxonomy, page grouping, findability, or content organization.

## Goal

Design an information model that users can predict without needing internal company knowledge.

The objective is not to make the sitemap look tidy. It is to reduce uncertainty about:

- where information lives;
- what each category means;
- what path a user should take;
- how the structure grows over time.

## Inputs

Use the strongest evidence available:

1. primary user tasks;
2. existing content inventory;
3. current navigation and sitemap;
4. behavioral evidence or analytics;
5. stakeholder/business requirements;
6. competitor/reference patterns;
7. technical or CMS constraints.

Mark unavailable evidence explicitly. Do not invent it.

## Audit the current IA

Inspect:

- top-level navigation;
- secondary navigation;
- utility navigation;
- page hierarchy;
- duplicate destinations;
- overlapping categories;
- ambiguous labels;
- mixed taxonomy;
- orphan pages;
- inconsistent naming;
- excessive depth;
- organization-centric language.

For each major group, identify its organizing model.

Common models:

- product;
- user goal;
- use case;
- industry;
- audience;
- lifecycle stage;
- content type;
- geography;
- organization structure.

A group should normally have one dominant model.

## Detect mixed taxonomy

Example of unstable grouping:

```text
Solutions
├── Healthcare        # industry
├── Automation        # capability
├── Enterprise        # audience
└── Getting Started   # lifecycle
```

The children answer different questions. Resolve by choosing a dominant user-facing model or separating concerns into different navigation areas.

## Competitor research

Competitors are evidence of conventions, not templates to copy.

For each relevant reference, capture:

- global navigation structure;
- naming;
- grouping model;
- navigation depth;
- conversion paths;
- resource organization;
- account/contact/search placement;
- mobile implications.

Classify findings as common, useful, differentiating, or avoid.

## Synthesize the proposed IA

Use:

```text
User Tasks
+ Content Inventory
+ Current IA Problems
+ Business Goals
+ Relevant Market Conventions
→ Proposed IA
```

Do not let competitor structure override the target site's actual content or user goals.

## Navigation comparison

Use `templates/navigation-comparison.md`.

Every proposed group should explain:

- what question it answers;
- why items belong together;
- what mental model it uses;
- how it scales.

## Naming rules

Prefer labels that are concrete, mutually distinguishable, familiar to users, concise, and stable.

Avoid labels that depend on internal department names, unexplained jargon, vague catch-alls, or overlap with sibling labels.

## Depth rules

There is no universal maximum depth.

Evaluate depth through:

- predictability;
- interaction cost;
- number of sibling choices;
- mobile behavior;
- content volume;
- task criticality.

A shallow but ambiguous structure can be worse than a deeper but predictable one.

## Lock gate

Do not lock IA until:

- [ ] important destinations are predictable;
- [ ] each major group has a clear organizing model;
- [ ] duplicate destinations are intentional or removed;
- [ ] labels are understandable externally;
- [ ] future content has a plausible home;
- [ ] mobile navigation can preserve the same mental model;
- [ ] unresolved structural risks are documented.

## Output

Minimum useful output:

1. current IA;
2. structural findings;
3. competitor/reference observations where relevant;
4. proposed IA;
5. comparison table;
6. rationale;
7. unresolved risks;
8. validation result.
