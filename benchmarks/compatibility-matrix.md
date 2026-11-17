# Compatibility Matrix

Two official runs passed independent review and repository validation on 2026-11-17. Both use frozen core commit `7d64090710ef20f1d24cea6b46199391d3c09c18` and suite `0.1.0`.

| Run | Product / selected model label | Core commit | Suite | IA | Component reuse | End-to-end | Total | Status |
|---|---|---|---|---:|---:|---:|---:|---|
| [GPT-6](results/chatgpt-web-gpt-6-v01-20261117/) | ChatGPT web / GPT-6 | `7d64090710ef` | `0.1.0` | 12/12 | 12/12 | 16/16 | 40/40 | Official; independently reviewed |
| [GPT-5.6 Sol](results/chatgpt-web-gpt-5-6-sol-v01-20261117/) | ChatGPT web / GPT-5.6 Sol | `7d64090710ef` | `0.1.0` | 12/12 | 12/12 | 16/16 | 40/40 | Official; independently reviewed |

Criterion-level rationale and review limits are retained in each run's [GPT-6 scoring notes](results/chatgpt-web-gpt-6-v01-20261117/scoring-notes.md) and [GPT-5.6 Sol scoring notes](results/chatgpt-web-gpt-5-6-sol-v01-20261117/scoring-notes.md). The local strict release gate reports ready: two official runs, two distinct signatures, no failures and no warnings. This is the 2026-11-17 evidence snapshot. Follow the [release procedure](../RELEASE.md) before publishing; [Issue #1](https://github.com/bynanci/website-design-skill/issues/1) and [GitHub Releases](https://github.com/bynanci/website-design-skill/releases) are the publication record.

## Evidence scope

- These are two selected model labels on one ChatGPT web product. They do not establish cross-vendor or all-platform compatibility. Hidden backend revisions are not disclosed.
- Each of the three cases per run used a fresh Temporary, Unpersonalized chat and an unchanged pinned ZIP packet. Execution used the web UI without an API key.
- Original Markdown downloads, isolation records and metadata are retained. Separate reviewers scored preserved outputs after generation. These are formal validated UI runs under the manual runner protocol, not informal manual tests.
- Eligibility relies on archived UI evidence and explicitly attributed live operator observations. Visible UI summaries are not a complete provider-internal execution audit.
- Scores measure the frozen planning-artifact criteria. They do not establish implemented UX outcomes, human/user-study results, rendered accessibility conformance or later adapter compatibility.
- Later main-branch adapters and tests are separate evidence and were not part of the frozen inputs.

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
