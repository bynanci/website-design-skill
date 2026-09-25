# Runner Availability Matrix

This file tracks whether an environment can execute the benchmark protocol at all.

It is intentionally separate from `compatibility-matrix.md`.

A runner can be unavailable without implying anything about Website Design Skill compatibility.

| Runner | Independent context | Repo-readable | Can hide evaluator files | Raw output retrievable | Status | Notes |
|---|---|---|---|---|---|---|
| Replit Agent | Yes | Intended | Yes by instruction | Not reliably available in current environment | Unavailable | Clean-run attempt blocked by `requires_active_subscription`; earlier workspace retrieval also timed out |
| Current ChatGPT conversation | No | Yes | No | Yes | Contaminated | Current context has already seen rubric/expected material, so it cannot produce an official clean result |

## Status definitions

### Available

The environment can execute the canonical suite while keeping evaluator materials hidden and preserving raw outputs.

### Unavailable

The environment cannot currently complete the protocol because of access, subscription, connector, execution, or output-retrieval limitations.

This is a runner limitation, not a compatibility failure.

### Contaminated

The environment can execute tasks, but the current context has already seen evaluator materials for the canonical cases.

Results may be useful for local debugging but cannot be official.

### Unknown

The environment has not yet been tested for protocol requirements.

## Official-run eligibility

Before using a new environment for an official benchmark, confirm:

- [ ] fresh / independent context;
- [ ] exact repository commit can be pinned;
- [ ] `SKILL.md` and allowed references can be read;
- [ ] evaluator files can remain hidden;
- [ ] all canonical inputs can be supplied unchanged;
- [ ] all raw outputs can be retrieved without manual reconstruction;
- [ ] agent/model identity can be recorded;
- [ ] capability profile can be recorded;
- [ ] no post-generation correction is needed.

Only after these checks should the environment move from runner validation into compatibility scoring.
