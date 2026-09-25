# Benchmark Runner Requirements

A benchmark runner is an execution environment, not merely a repository tool.

## Minimum requirements

A runner used for an official result must support:

1. **Independent context**
   - The tested context must not have seen evaluator references, rubric, or scored outputs for the canonical cases.

2. **Pinned input**
   - It must consume the exact repository commit and canonical case inputs.

3. **Selective visibility**
   - It must be possible to withhold evaluator-only files during generation.

4. **Skill-driven reference loading**
   - The environment may load references/templates the skill instructs it to use, without being pre-fed expected answers.

5. **Raw output preservation**
   - The exact generated result for each case must be retrievable and storable unchanged.

6. **Identity**
   - Provider/product/model or equivalent execution identity must be recordable.

7. **Capability disclosure**
   - Repository, browsing, rendering, code execution, persistence, and other relevant capabilities must be recordable.

## Disqualifying conditions for official runs

A run cannot be official if:

- the agent saw evaluator materials before generation;
- raw output cannot be retrieved;
- output was manually reconstructed;
- the execution identity is unknown;
- canonical inputs were modified for that runner;
- the runner silently substituted another task;
- access/subscription failure prevented actual task execution.

Such attempts should be classified as `unavailable`, `contaminated`, or `exploratory`, not as compatibility failures.

## Why this matters

The benchmark is testing the skill contract across agents.

If the runner itself changes the task, hides outputs, or cannot preserve evidence, the measurement is about the runner rather than the skill.
