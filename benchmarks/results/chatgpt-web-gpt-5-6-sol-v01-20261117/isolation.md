# Generation isolation and eligibility review

## Verdict

Eligible as an official v0.1 run under the current repository protocol. This reviewer separately scored preserved remote outputs after generation; no raw bytes were edited, reconstructed, corrected, or regenerated. The visible selected execution identity is OpenAI / ChatGPT web / GPT-5.6 Sol, effort Medium. Version remains null. This is a UI execution identity, not an inference about an undisclosed backend snapshot or routing.

## Independently checked from archived evidence and local bytes

- All three packet ZIPs were inspected. Every repository member equals its exact git blob at 7d64090710ef20f1d24cea6b46199391d3c09c18. packet.json membership, byte counts and SHA256 values match. Each contains exactly one canonical case and public allowlisted skill/reference/template files. No rubric, expected.md, example output, prior score, or other case input is present. Exact packet SHA256 values are in result.json.
- All three raw Markdown files equal both the original browser-download bytes at the recorded paths and the shared capture copies. Sizes and SHA256 equal generation-captures.json. Raw paths stay inside this run and the artifacts are nonempty complete UTF-8 Markdown documents.
- All three final UI archives have distinct conversation URLs, Temporary chat, a single case packet and the same standard packet-only prompt, 5.6 Medium, response complete, an expanded visible activity section, and a downloadable result. No follow-up correction prompt is present in these archived conversations.
- Each selected-model archive records GPT-5.6 Sol selected (Value: 1), with GPT-6 unselected. The component and B2B model/pre archives include full Temporary + Unpersonalized state; their screenshots independently show those settings and selected Sol.
- The IA model/pre archives are accessibility-tree diffs. They retain Temporary URL, selected Sol/5.6 Medium, its case ZIP and prompt, but do not independently retain a full Unpersonalized header or initial empty-chat tree. This evidence gap is not concealed.

## Attributed live-controller observations

The parent browser controller reports directly opening each of the three cases separately in a fresh Temporary + Unpersonalized web context, checking the literal selected model GPT-5.6 Sol at Medium, attaching only that case's unchanged ZIP, and submitting only the standard prompt. The controller reports no API key/API call, web or connector use, local checkout exposure, evaluator content, prior generated outputs, or cross-conversation material sent to the remote generation contexts. In particular the IA initial clean settings rely partly on that controller observation, not a complete archived initial settings screenshot. These are attributed observations, not fresh UI actions independently performed by this reviewer.

The local controller/reviewer can see evaluator files; that local visibility is deliberately separate from remote generation. Remote contexts were not given this checkout. Having the same ChatGPT account/session for multiple separate Temporary conversations is not proof of independent backend instances, but the current protocol requires independently isolated contexts and known model identity, not separate accounts or verified backend replicas.

## Limits of the evidence

The expanded final UI activity records contain human-visible summaries (packet inspection, reading references and constructing artifacts). They are not exhaustive low-level tool invocation logs or provider-internal audit telemetry. No hidden tool use can be positively ruled out from those summaries alone. Packet allowlisting, clean settings, controller observations, visible transcripts, preserved original downloads, and evidence-bound outputs jointly support eligibility under the current protocol. The JSON validator alone cannot establish isolation.

The B2B pre-submission archive was captured while its ZIP upload was still in progress (Send disabled); the final conversation archive confirms the correct completed attachment and task execution. No blocked access or subscription failure prevented this Sol run. A usage-limit notice for another model does not constitute a failed Sol execution when Sol is selected and all three cases completed.

Repository/browser-render/image capabilities were not available to the remote case in this packet-only test. Packet-local file inspection and Markdown creation are visible, but source code, a rendered site, frontend tests and independent analytics are absent. The run therefore evaluates structured design artifacts and validation plans, not production implementation or conformance results. Network/connectors were prohibited by the prompt and not observed used; no claim is made about server-side hard network sandbox enforcement.

## Time ordering

Generation start/completion-observed timestamps and original download provenance are retained unchanged in evidence/generation-captures.json. The latest completion-observed time is 2026-11-17T13:34:42.704Z, before this evaluator received all three frozen artifacts. Formal criterion recording time is in result.json and scoring-notes.md. Initial read-only review start was not independently clocked, so it is null rather than a fabricated retrospective timestamp. Completion-observed times are controller observations, not claimed server generation timestamps. No scoring feedback was sent to generation conversations.
