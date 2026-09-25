# Compatibility Matrix

No official cross-agent runs have been committed yet.

| Run | Core commit | Suite | IA | Component reuse | End-to-end | Total | Status |
|---|---|---:|---:|---:|---:|---:|---|
| — | — | — | — | — | — | — | Awaiting official runs |

## Update rule

Only add a row after the corresponding result directory passes repository validation.

Do not infer compatibility from informal/manual tests.

## What to investigate

When two or more agents fail the same criterion, treat it as a likely contract-design problem before treating it as an agent-specific failure.

Common repair targets:

1. `SKILL.md` routing ambiguity
2. unclear reference instructions
3. underspecified output contracts
4. ambiguous fixture wording
5. rubric mismatch

Keep platform-specific workarounds outside the core methodology.
