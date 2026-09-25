---
name: website-design
description: >
  Analyze, restructure, redesign, systemize, implement, or validate an existing
  website. Use for information architecture, navigation, page hierarchy,
  wireframing, visual direction, design systems, reusable components,
  redesign implementation, and redesign review. Remain platform-agnostic:
  do not assume a specific AI model, design application, frontend framework,
  CMS, or hosting provider.
---

# Website Design

Use this skill to redesign an existing website as a coherent system rather than as a collection of independently styled pages.

## Operating principles

1. **Structure before styling.** Resolve content, information architecture, navigation, page hierarchy, and wireframes before detailed visual treatment.
2. **System before pages.** Extract reusable patterns, tokens, and component contracts before scaling implementation.
3. **Evidence before preference.** Separate observed evidence, design hypotheses, and subjective preference.
4. **Preserve content integrity.** Every important existing content item must be preserved, intentionally transformed, moved, merged, or explicitly removed.
5. **Reuse before invention.** Prefer reuse → extension → variant → composition → new component.
6. **Tool independence.** Reason in capabilities, not product names.
7. **Validate every transition.** Do not advance a phase simply because an artifact exists.

## Workflow router

Determine the earliest unstable layer and start there:

```text
DISCOVER
  ↓
STRUCTURE
  ↓
WIREFRAME
  ↓
EXPLORE
  ↓
SYSTEMIZE
  ↓
IMPLEMENT
  ↓
VALIDATE
```

Do not jump directly to polished implementation if upstream structure is still unclear.

### DISCOVER

Use when project goals, users, constraints, content, or current-site problems are not yet explicit.

Expected artifacts:
- project context
- current-site audit
- content inventory
- known constraints and unknowns

### STRUCTURE

Use for information architecture, sitemap, taxonomy, navigation, page grouping, or competitor-structure analysis.

Read:
- `references/workflow.md`

Expected artifacts:
- current IA map
- observed structural problems
- proposed IA
- navigation comparison
- locked navigation structure

### WIREFRAME

Use after the relevant structure is stable.

Expected artifacts:
- page goal
- section hierarchy
- content flow
- CTA hierarchy
- low-fidelity page specification
- content coverage matrix

### EXPLORE

Use to compare visual directions while preserving the locked structure.

Vary:
- typography
- spacing
- grid
- color logic
- image treatment
- border/container strategy
- motion principles

Do not silently rewrite information architecture during visual exploration.

### SYSTEMIZE

Extract stable design rules into:
- design tokens
- layout patterns
- component contracts
- component variants
- interaction rules
- responsive behavior

Before creating a component, check:
```text
reuse → extend → variant → compose → create
```

### IMPLEMENT

Use the project's existing technology and conventions unless migration is explicitly required.

Implementation priority:
```text
semantic structure
→ content correctness
→ layout
→ responsive behavior
→ typography
→ visual treatment
→ interaction
→ motion
→ polish
```

### VALIDATE

Verify:
- content coverage
- navigation/findability
- hierarchy
- component reuse
- responsive behavior
- accessibility
- consistency
- accidental regressions
- unnecessary one-off styles

## Required page output contract

For page-level redesign work, produce or maintain:

1. Page goal
2. Current problems
3. Proposed structure
4. Content coverage matrix
5. Component mapping
6. New component requirements
7. Risks / assumptions
8. Validation checklist

Use `templates/page-spec.md` where useful.

## Change-scope rule

When correcting a recurring design problem, prefer changing the highest reusable layer:

```text
token
→ component
→ pattern
→ page
→ one-off override
```

One-off overrides are exceptional.

## Capability-based tool use

Do not require named products.

When capabilities exist:
- use browsing/research capability to inspect relevant references;
- use repository access to inspect existing components and conventions;
- use visual/prototyping capability to explore or preserve design artifacts;
- use code execution to implement and validate;
- use screenshot or rendered-output inspection to detect regressions.

If a capability is unavailable, continue with structured artifacts rather than inventing results.

## Context strategy

Keep context layered:

**Stable context**
- project goals
- design principles
- navigation
- design tokens
- component contracts

**Task context**
- current page
- relevant content
- relevant wireframe
- relevant components

**Temporary context**
- current bug
- current visual issue
- current experiment

Avoid repeatedly rebuilding stable research from scratch.

## Definition of done

A redesign is not done because pages look polished.

It is done when:
- information architecture is coherent;
- important content is accounted for;
- core page patterns are established;
- design rules are reusable;
- components have clear responsibilities;
- responsive behavior is defined;
- accessibility is checked;
- implementation can scale without page-by-page reinvention.

For the full phase model, read `references/workflow.md`.
