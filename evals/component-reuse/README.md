# Component Reuse Eval

This evaluation checks whether an agent respects the component-governance order:

```text
Reuse → Extend → Variant → Compose → New
```

The goal is to prevent page-by-page component invention.

## Contract

Given the fixture in `case-001/input.md`, a passing response should:

- inspect the existing component inventory first;
- map requested sections to existing components where responsibilities already fit;
- use variants or composition before introducing new primitives;
- justify every new component;
- avoid page-specific duplicate names.

Exact component names do not need to match the reference answer.
