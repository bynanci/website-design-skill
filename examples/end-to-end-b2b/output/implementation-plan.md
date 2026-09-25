# Atlas Grid — Implementation Plan

This fixture does not prescribe a frontend framework.

## Inputs locked for implementation

- project context;
- site audit;
- proposed navigation;
- homepage specification;
- component mapping.

## Implementation sequence

### 1. Content preparation

- rewrite hero copy without changing unsupported product claims;
- gather existing Observe / Automate copy;
- move existing Kubernetes content into the technology-context section;
- identify existing enterprise proof that is actually supported;
- preserve the three reliability metrics exactly unless source data changes;
- select an existing case study;
- select Blog / Docs resources.

### 2. Navigation

Implement the approved grouping model using the project's existing navigation primitives.

Do not introduce a new navigation interaction model unless required by content volume or accessibility.

### 3. Homepage composition

Compose the page using the mapped existing components.

No new homepage-specific component is allowed by default.

### 4. Responsive verification

Verify:

- navigation hierarchy remains understandable;
- CTAs remain accessible;
- card grids stack intentionally;
- metrics do not overflow;
- resource cards preserve hierarchy;
- content order remains meaningful.

### 5. Accessibility verification

Verify:

- semantic heading order;
- keyboard navigation;
- focus visibility;
- CTA accessible names;
- logo alt/accessible treatment;
- metric semantics;
- link purpose;
- reduced-motion behavior if motion is later added.

### 6. Visual refinement

Only after structural implementation is correct:

- typography;
- spacing;
- color treatment;
- imagery;
- interaction;
- motion.

## Explicit non-goals

- frontend framework migration;
- CMS migration;
- new analytics claims;
- invented customer proof;
- new component family without a demonstrated gap.
