# Standard Runner Instruction

Use the repository's `SKILL.md` as the governing skill.

Complete the benchmark case using only:
- the case input files declared in `benchmarks/manifest.json`;
- repository references/templates that the skill itself directs you to load;
- capabilities available in your environment.

Do not read:
- evaluator reference files;
- `benchmarks/rubric.md`;
- another agent's benchmark outputs.

Do not invent unavailable evidence.

Return a complete task result suitable for evaluation.

If a capability required by the task is unavailable, state the limitation and continue with the strongest valid artifact you can produce without fabricating results.
