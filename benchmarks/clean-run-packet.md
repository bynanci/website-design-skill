# Clean Agent Benchmark Packet

Use this packet to run the canonical benchmark suite in a fresh agent context.

## Pin

Repository:
`https://github.com/bynanci/website-design-skill`

Core commit:
`64d0d9dfe4d56c94f20a885369164335c5629fc9`

Suite:
`0.1.0`

## Governing skill

Load:

`SKILL.md`

The agent may load repository references/templates only when the skill itself directs it to do so.

## Standard instruction

Use:

`benchmarks/runner-instruction.md`

## Case 1 — IA Audit

Input only:

`evals/ia-audit/case-001/input.md`

Save raw output as:

`ia-audit.md`

## Case 2 — Component Reuse

Input only:

`evals/component-reuse/case-001/input.md`

Save raw output as:

`component-reuse.md`

## Case 3 — End-to-End B2B

Inputs only:

- `examples/end-to-end-b2b/input/project-context.md`
- `examples/end-to-end-b2b/input/current-site.md`
- `examples/end-to-end-b2b/input/component-inventory.md`

Save raw output as:

`end-to-end.md`

## Forbidden during generation

Do not expose to the tested agent:

- `benchmarks/rubric.md`
- `evals/ia-audit/case-001/expected.md`
- `evals/component-reuse/case-001/expected.md`
- any files under `examples/end-to-end-b2b/output/`
- scored outputs from another agent

## After generation

Only after all three raw outputs are frozen:

1. evaluate with `benchmarks/rubric.md`;
2. use evaluator references declared in `benchmarks/manifest.json`;
3. fill `benchmarks/result.template.json`;
4. place files under `benchmarks/results/<run-id>/`;
5. run repository validators.

## Clean-run requirement

If the tested agent has already seen the forbidden evaluator materials for these cases, the result cannot be `official`. Preserve it as `exploratory` instead.
