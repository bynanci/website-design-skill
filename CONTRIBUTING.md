# Contributing

Thanks for helping improve Website Design Skill.

## Contribution principles

Contributions should strengthen at least one of:

- portability across tools and agents
- clarity of the redesign workflow
- artifact quality
- validation quality
- testability
- accessibility
- maintainability

Avoid introducing mandatory dependencies on a specific AI model, design tool, framework, CMS, or hosting provider.

## Before proposing a change

Ask:

1. Is this a core methodology change or a platform-specific adapter?
2. Can the change be expressed as a reusable rule instead of a one-off preference?
3. Does it preserve existing artifact contracts?
4. Can it be evaluated?
5. Does it create unnecessary component/process complexity?

## Pull requests

A useful PR should explain:

- problem
- proposed change
- why the change belongs in core or an integration
- affected artifacts
- validation performed
- compatibility implications

For methodology changes, include or update an evaluation fixture when practical.

## Scope

Use:
- `SKILL.md` for concise agent operating rules;
- `references/` for deeper methodology;
- `templates/` for reusable artifacts;
- `examples/` for inspectable workflows;
- `evals/` for behavioral validation;
- `integrations/` for platform-specific adapters.

Keep the core small.
