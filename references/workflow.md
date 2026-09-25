# Website Redesign Workflow

This document expands the core workflow referenced by `SKILL.md`.

## 1. Discover

Collect or infer, while explicitly marking unknowns:

- business goals
- primary users
- primary user tasks
- current sitemap and navigation
- content inventory
- analytics or behavioral evidence when available
- brand constraints
- technical constraints
- accessibility requirements
- stakeholder requirements
- success criteria

Do not block progress when information is missing. Record the gap and reduce confidence accordingly.

## 2. Structure

Audit the current information architecture.

Inspect:

- top-level navigation
- secondary navigation
- page hierarchy
- duplicated destinations
- ambiguous labels
- mixed taxonomies
- orphan pages
- unnecessary navigation depth
- inconsistent grouping logic

For each group, identify the underlying mental model, such as:

- product
- user goal
- industry
- use case
- audience
- lifecycle stage
- content type

Do not mix models without a clear reason.

### Competitive structure research

Use relevant competitors or adjacent references to extract principles, not appearances.

Separate findings into:

- common patterns
- useful patterns
- differentiating patterns
- patterns to avoid

Compare:

```text
Current IA
+ User Tasks
+ Content Inventory
+ Observed Market Patterns
+ Business Goals
→ Proposed IA
```

Before locking IA, verify:
- important destinations are predictable;
- major categories use understandable grouping logic;
- duplication is resolved;
- labels do not require internal company knowledge;
- the structure can scale;
- the same mental model can survive on mobile.

## 3. Wireframe

Start with high-impact pages.

For each page define:
- page goal
- audience
- user questions answered
- section sequence
- CTA hierarchy
- content requirements
- candidate component pattern

Create a content coverage matrix before locking the wireframe.

Valid content statuses:
- preserved
- rewritten
- merged
- moved
- removed intentionally
- missing

Resolve every unintended `missing` item.

## 4. Explore

Explore multiple visual directions against the same structural baseline.

Analyze:
- typography
- spacing
- grid
- color logic
- imagery
- density
- containers/borders
- interaction
- motion

Translate subjective feedback into explicit variables.

Example:

```text
Feedback: "too corporate"

Possible design variables:
- symmetry is too rigid
- card density is too high
- typography is too conventional
- image presence is too low
- color usage is too conservative
```

## 5. Systemize

Extract:
- design principles
- tokens
- reusable layout patterns
- component contracts
- component variants
- interaction states
- responsive rules

Every reusable component should define:
- purpose
- content model
- variants
- states
- responsive behavior
- interaction
- accessibility
- composition rules

Prevent near-duplicate component proliferation.

## 6. Implement

Map every wireframe section to an existing pattern or component before implementation.

Recommended mapping statuses:
- reuse
- extend
- variant
- compose
- new

Create required reusable primitives before embedding one-off versions inside a page.

Preserve existing project conventions unless the redesign explicitly includes architectural migration.

## 7. Validate

### IA gate
- understandable categories
- clear labels
- acceptable navigation depth
- no accidental duplicate destinations
- scalable structure
- feasible mobile navigation

### Wireframe gate
- one clear page goal
- coherent content hierarchy
- clear CTA hierarchy
- complete required content
- intentional section order

### Visual gate
- style supports brand position
- typography hierarchy is coherent
- density is appropriate
- layout remains understandable without decoration
- visual system can scale beyond one page

### System gate
- tokens are consistent
- component responsibilities are clear
- variants are controlled
- responsive behavior is defined
- similar components are consolidated

### Implementation gate
- content coverage complete
- component reuse reviewed
- responsive states verified
- accessibility checked
- no major visual regressions
- no accidental content loss
- no unnecessary one-off styles

## Iteration rule

Use:

```text
observe
→ identify problem
→ locate responsible layer
→ modify smallest reusable layer
→ validate
```

Possible layers:
- content
- information architecture
- navigation
- wireframe
- design pattern
- component
- token
- page composition
- implementation
