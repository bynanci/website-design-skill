# Visual Quality Review (Optional v0.2 Preview)

Use this reference to make high-quality visual design **inspectable**. Creative
quality is not determined by the amount of animation, decoration, or novelty.
The baseline is the approved page structure, content and user task.

Do not label a result award-winning, accessible, performant, or tested solely
because it follows these guidelines.

## Inspect the hierarchy

1. Identify what the reader must learn or do in the first seconds.
2. Compare dominant visual weight with actual task priority.
3. Check typography, measure, line breaks, and dense/empty states.
4. Check whether whitespace creates useful grouping rather than empty chrome.
5. Confirm important information stays visible when data or copy becomes long.

## Inspect the visual language

- **Typography:** deliberate scale, readable line length, language and numeral
  handling, stable heading semantics.
- **Layout:** coherent grid, proportion, whitespace rhythm and container
  transitions; composition must survive different screen sizes.
- **Color:** semantic roles, theme states, contrast, and non-color signals.
- **Surfaces:** border, shadow and radius only when they communicate grouping,
  depth or interaction; avoid layer-on-layer card clutter.
- **Imagery:** purpose, focal point, responsive crop, provenance, and asset rights.
- **Motion:** comprehension first; duration and easing consistent, interruptible,
  and reduced when the user requests reduced motion.
- **Data visualization:** chart selection follows the question, not novelty.
  Legends, labels, scales, focus, tooltips, and accessible data alternatives
  must preserve the intended meaning.

## Review by evidence

Give each dimension 0 / 1 / 2:
- 0: fails the documented task or constraint;
- 1: plausible but not validated;
- 2: supported by concrete evidence or a checked artifact.

A polished screenshot alone is insufficient evidence of responsive behavior,
interaction, performance or accessibility.

| Dimension | Baseline issue | Proposed improvement | Evidence / test | Score | Next correction |
|---|---|---|---:|---:|---|
| Information hierarchy | | | | | |
| Typographic craft | | | | | |
| Spatial composition | | | | | |
| Consistent components / tokens | | | | | |
| Interaction and focus | | | | | |
| Responsive and zoom resilience | | | | | |
| Content and data integrity | | | | | |
| Asset, motion and loading impact | | | | | |

## Order of correction

1. Content truth and accessible semantics.
2. Primary task visibility, hierarchy and navigation.
3. Component / token consistency at the highest reusable layer.
4. Responsive and interaction defects (including hover-only content).
5. Typography, image treatment and motion refinements.
6. Optional expression or micro-interactions that do not compromise the above.

Use the optional visual-direction comparison, responsive-behavior and
design-token-extraction templates for inspectable decisions.

This reference is advisory for v0.2 experiments; it is not a new v0.1 core
phase or an official v0.1 benchmark criterion.
