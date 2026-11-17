# v0.1 Clean Run Submission Protocol (Issue #1)

This document describes how to collect **independent, verifiable evidence**.
An input packet, GitHub CI result or synthetic answer is not an official run.

## Inputs

Run the GitHub Actions workflow "Build pinned clean benchmark packets" or:

    python3 scripts/build_clean_packets.py

It packages each canonical case from the frozen baseline declared in
benchmarks/release-policy.json. The ZIP contains the governing SKILL.md,
allowlisted reference/template files, exactly one case's input, a standard
runner instruction and a machine-readable source-commit/checksum manifest.
The evaluator expected outputs and rubric are *never* packaged.

Do not give the tested agent the main repository checkout if evaluator files
would be available. Do not pass the benchmark rubric or scored answer through
a chat, context window, accessible retrieval tool or attached document.

## Eligibility

For each distinct agent signature, start in a fresh, independent context.
Record provider / product / model / version, interface, execution date,
available capabilities, access to tools, the pinned commit and packet SHA256.
The runner must be able to preserve raw unedited responses and execute tasks
from the supplied SKILL.md. Avoid runner prompts that hint at scoring criteria.

Run each of the three case packets separately in clean, isolated contexts.
Preserve the raw output of each case exactly, including incomplete responses,
errors and abstentions. Do not backfill missing answers from a different agent.

## Review

After raw generation is complete, a separate reviewer may load the evaluator
references, rubric and score the preserved responses. Record scores and
criterion-level evidence without modifying the original outputs. Keep the
environment and access limitations in the run metadata.

Assemble a result directory and validate:

    python3 scripts/validate_benchmarks.py
    python3 scripts/release_status.py --require-ready

Official data must satisfy the frozen commit policy, raw-file boundaries,
minimum distinct agent signatures and shared-zero criteria. The reviewer must
also verify actual input isolation and retained raw output: the JSON validator
alone cannot prove an agent's context was clean.

## Current limitations

As of 2026-11-17, two complete runs have passed independent review and
repository validation: [GPT-6](results/chatgpt-web-gpt-6-v01-20261117/) and
[GPT-5.6 Sol](results/chatgpt-web-gpt-5-6-sol-v01-20261117/), each 40/40.
Both used ChatGPT web, with a fresh Temporary, Unpersonalized chat per case
and no API key. They represent two selected model labels on one product,
not cross-vendor or all-platform compatibility. See the
[compatibility matrix](compatibility-matrix.md) for evidence limits.

These formal UI runs preserve raw downloads, isolation records, execution
metadata and separate criterion-level reviews. Informal manual tests do not
qualify merely because they use the same product. The local assistant or a
model that has read expected results or the rubric remains **contaminated**
for generating official evidence.

A blocked subscription or inaccessible model interface is **runner
unavailable**, not evidence of skill failure. The local strict release gate now
reports ready with two official runs and two distinct signatures, without
failures or warnings in the 2026-11-17 snapshot. Before publication, verify CI
and required external checks for the exact candidate, complete public merge
and follow [RELEASE.md](../RELEASE.md). [Issue #1](https://github.com/bynanci/website-design-skill/issues/1) and
[GitHub Releases](https://github.com/bynanci/website-design-skill/releases) are the publication record; local readiness alone does not establish publication.
