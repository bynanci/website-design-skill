# Component Architecture

Use this reference when translating wireframes or visual patterns into a reusable design and implementation system.

## Goal

Pages should be compositions of a small, coherent set of reusable patterns and components.

The goal is not maximum abstraction. The goal is controlled reuse with clear responsibilities.

## Inputs

Before changing component architecture, inspect:

- existing component inventory;
- existing design tokens;
- repeated page patterns;
- current naming conventions;
- responsive behavior;
- accessibility behavior;
- variants and states;
- duplicated styles;
- one-off page implementations.

## Reuse decision order

Always evaluate in this order:

```text
Reuse
→ Extend
→ Variant
→ Compose
→ New
```

### Reuse

Use an existing component unchanged when its responsibility and content model already fit.

### Extend

Expand an existing component when the added capability belongs to the same responsibility and does not create an unstable API.

### Variant

Add a bounded variant when the structure and responsibility remain the same but presentation or density changes predictably.

### Compose

Combine smaller primitives when the requested pattern is a composition rather than a new primitive.

### New

Create a component only when existing responsibilities cannot represent the pattern cleanly.

## Detect component explosion

Warning signs:

- names differ only by page context;
- markup is nearly identical;
- variants are encoded by copied files;
- styles differ by a few values;
- business nouns replace UI responsibility;
- page-level components leak into global libraries.

Example:

```text
FeatureCard
ProductFeatureCard
FeatureInfoCard
HomepageFeatureCard
EnterpriseFeatureCard
```

This usually indicates missing variants or unclear component boundaries.

## Responsibility rule

A reusable component should have one clear UI responsibility.

Good examples:

```text
FeatureCard
PricingTable
TestimonialQuote
SectionHeader
```

Risky example:

```text
HomepageEnterpriseSolutionFeatureWithCTA
```

Do not over-generalize either. A component with many unrelated modes may be a hidden page builder.

## Component contract

Use `templates/component-contract.md`.

A contract should define:

- purpose;
- content model;
- variants;
- states;
- responsive behavior;
- interaction;
- accessibility;
- composition rules.

## Token boundary

Repeated visual values should normally come from tokens before page overrides.

Prefer this correction order:

```text
Token
→ Component
→ Pattern
→ Page
→ One-off override
```

If the same issue appears on multiple pages, do not patch each page.

## Page mapping

Before implementation, map every section:

| Section | Pattern | Component | Action |
|---|---|---|---|
| Hero | Product hero | Hero | Reuse |
| Benefits | Feature grid | FeatureCard | Reuse |
| Metrics | Metric band | MetricBand | Extend |
| Comparison | Comparison | — | New |

This makes component creation an explicit decision.

## Responsive behavior

Responsive rules belong in component contracts where possible.

Do not treat mobile as desktop compressed into one column.

Evaluate:

- information priority;
- stacking;
- wrapping;
- content order;
- interaction;
- touch targets;
- overflow;
- image crop;
- table behavior.

## Accessibility

Reuse is valuable only if accessible behavior is preserved.

Contracts should define when applicable:

- semantics;
- accessible name;
- keyboard support;
- focus behavior;
- error/empty/loading states;
- contrast;
- reduced motion.

## Change governance

When a new page request appears:

1. inspect existing patterns;
2. map the wireframe;
3. justify every `New`;
4. build missing reusable primitives first;
5. compose the page;
6. validate for duplication afterward.

## Validation gate

Before declaring the component system stable:

- [ ] repeated patterns map to shared components;
- [ ] component responsibilities are understandable;
- [ ] variants are bounded;
- [ ] near-duplicates are consolidated;
- [ ] tokens cover repeated visual decisions;
- [ ] responsive behavior is defined;
- [ ] accessibility behavior is retained;
- [ ] page-specific overrides are exceptional.

## Output

Minimum useful output:

1. component inventory;
2. duplication findings;
3. component mapping;
4. new or extended component contracts;
5. token changes;
6. migration impact;
7. validation result.
