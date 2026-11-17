# Isolated v0.2 pilot

[繁體中文](README.zh-TW.md)

Status: **two real ChatGPT web runs generated and independently reviewed on 2026-11-17**. This pilot covers the responsive-layout and accessibility planning cases in draft PR #5. It is separate from the frozen v0.1 benchmark and release policy.

| Contract | Value |
|---|---|
| Suite/protocol version | `0.2-pilot.1` |
| Source commit | `7f7148a0752718ba3fb363c019441a6d5ca91f15` |
| Cases | `responsive-layout-001`, `accessibility-001` |
| Scoring | 9 criteria per case, 0–2 each; separate total 36 |
| Public release threshold | None; compare criterion-level findings and critical errors |
| Completed real runs | 2; one fresh generation context per case in each run |

The source commit fixes the public skill, optional templates and case inputs. The packager generates only operational metadata outside those pinned bytes. A source/prompt/criterion change requires a reviewed pilot version decision; do not silently move this pin. The validator rejects a different source commit.

## Prepare isolated inputs

Fetch repository history so the fixed commit is available. Run from the repository root:

```sh
python3 scripts/validate_v02_pilot.py
python3 scripts/build_v02_pilot_packets.py --output-dir /tmp/website-v02-pilot-packets
```

The builder reads source bytes with Git from the fixed commit. It creates one ZIP per case and `packet-checksums.json`. Each ZIP contains only its input, the exact reviewed public skill/reference/template allowlist, and generated `packet.json`. Expected files, this rubric, result records, reviewer notes and other cases are excluded. ZIP timestamps/order are deterministic; SHA-256 values identify the exact packet and its files.

A packet does not prove runner eligibility or generate compatibility evidence. The currently exposed conversation and its inherited agents must not be presented as clean executions.

## Execute and preserve

1. Select at least two independently started agent execution contexts. Record actual provider, product, model and capabilities; do not infer a hidden model identity. Each case starts in a fresh generation context.
2. Give the runner only one ZIP. Verify its checksum and restrict file access to that extracted packet. Do not provide evaluator files, scores, prior responses or another case's output.
3. Follow `packet.json` and the public skill. Preserve the complete raw response without manual edits, including failures and uncertainty.
4. Save `isolation.md` with the observed execution/context IDs for each case, exact packet checksums, supplied/read files, capability/access limits, start/finish times and evidence of isolation. Record unavailable tools separately from plan quality.
5. After generation, a reviewer may read [the evaluator rubric](rubric.md) and the pinned case `expected.md`. Score the exact criterion IDs, retain output quotes and critical-error notes. Preserve the generation/scoring order.
6. Store one run under `results/<run-id>/` with `result.json`, `isolation.md`, `raw/responsive-layout-001.md` and `raw/accessibility-001.md`. Compute raw/isolation SHA-256 from saved bytes. Do not reuse a raw file across cases.
7. Validate the record. Review the execution log and isolation claims as well as the mechanical validator result before accepting it.

The [strict result schema](result.schema.json) defines all metadata. A completed record requires observed agent identity, explicit capabilities, independent/evaluator-isolated declarations, generation and scoring timestamps, both raw outputs, 18 criterion-level scores, critical findings and the recomputed aggregate. Every nonzero score needs a quote from the saved raw response.

Unavailable records use `status="unavailable"`, an explicit access/capability reason, a real attempt/isolation record, no generated outputs, no reviewer and no score. A subscription block, missing model identity, unsupported environment or evaluator contamination is not a skill compatibility failure.

## Validate and compare

```sh
python3 scripts/validate_v02_pilot.py
python3 -m unittest discover -s tests -p 'test_v02_pilot.py' -v
```

The zero-dependency validator checks strict properties, the fixed version/pin, identity/capabilities, isolation record, timestamps, per-case paths, UTF-8/nonempty raw files, symlink/escape protection, content hashes, reused raw content, exact criteria, integer scores, source quotes and totals. The optional JSON Schema cross-check uses `jsonschema` when installed. A validation pass proves record consistency; it cannot independently certify a provider's context isolation or scoring quality.

Compare at least two eligible contexts without averaging away critical errors. Preserve failures and any shared critical issue. Review the reusable contract before rerunning; do not hide shared failures with agent-specific instructions. Availability records contribute no compatibility score. No pilot result becomes official v0.1 evidence.

## Submitted findings — 2026-11-17

| Visible interface model | Responsive layout | Accessibility | Pilot total | Listed critical errors |
|---|---:|---:|---:|---|
| [GPT-6](results/chatgpt-web-gpt-6-v02-20261117/result.json) | 18/18 | 18/18 | 36/36 | None found |
| [GPT-5.6 Sol](results/chatgpt-web-gpt-5-6-sol-v02-20261117/result.json) | 18/18 | 15/18 | 33/36 | None found |

Both runs used the no-API ChatGPT web interface at Medium effort. Every case started in a fresh Temporary/Unpersonalized chat with only its unchanged pinned ZIP and the same standard generation prompt. Reviewers checked each raw artifact against its original browser download and each packet source file against the pinned Git bytes. Exact criterion quotes, generation-before-scoring timestamps, context IDs, settings evidence, hashes, eligibility judgments and evidence limits are retained in each run's `result.json`, `isolation.md` and `evidence/` files. The pilot validator, all 24 pilot tests and the JSON Schema cross-check passed.

Three GPT-5.6 Sol accessibility criteria remain partial (1/2 each), with follow-up findings retained rather than repaired in the raw output:

- **AX-01:** Keyboard access is explicit, but a persistent/tabular data alternative is conditional. Require an explicit equivalent that remains available independently of transient chart detail.
- **AX-02:** Grayscale/color-perception checks are present; verification across product themes is missing. Add a theme-specific category-meaning check.
- **AX-03:** Focus placement, containment and restoration are explicit, but Escape is checked only if already supported. Specify Escape behavior and its acceptance check.

No shared listed critical failure was found. These are two model-labeled planning runs, not a statistical comparison or a release threshold. The visible model labels do not disclose a hidden backend revision (`version: null` in capture sidecars), and expanded UI activity summaries are not exhaustive provider access logs. Eligibility is supported by the retained settings, packet boundary and controller observations, subject to those limits. Neither score establishes real-product rendering, device behavior, human assistive-technology testing or accessibility conformance. No pilot score becomes official v0.1 evidence or inherits its 30/40 threshold. These submissions provide real outputs and reviewer scores for the pilot evidence requirement tracked in Issue #6; issue/release disposition remains a separate decision.

Completed runs cannot reuse raw file content or file identity across runs, even if the run ID or provider metadata changes. Identical outputs require a separate protocol review before they can support an independence claim; the validator does not silently count them as new executions.
