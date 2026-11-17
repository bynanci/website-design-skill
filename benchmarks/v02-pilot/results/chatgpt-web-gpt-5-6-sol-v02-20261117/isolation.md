# Isolation record — chatgpt-web-gpt-5-6-sol-v02-20261117

Protocol: `0.2-pilot.1`; source: `7f7148a0752718ba3fb363c019441a6d5ca91f15`.
Identity observed in the interface: OpenAI / ChatGPT web / **GPT-5.6 Sol**; effort **Medium**. The hidden model/backend revision is undisclosed (`version: null` in the capture sidecars).

## Execution eligibility

Eligible as two independently started, evaluator-isolated case contexts for this pilot, based on the retained browser evidence and controller observations. These are external fresh ChatGPT web Temporary/Unpersonalized chats, not this evaluator conversation or its inherited agents. Each pre-chat screenshot and full accessibility snapshot shows Temporary chat and Unpersonalized; the model-menu snapshot marks the stated model selected before submission. The interface states that this chat ignores memory, plugins and custom instructions. Each final URL has a distinct conversation ID and `temporary-chat=true`. The parent controller witnessed these settings live; this reviewer inspected the saved screenshots and snapshots.

Each case received exactly one attached ZIP plus the unchanged standard prompt in `evidence/generation-prompt.txt`. Pre-submit AX snapshots and final conversation snapshots show that case ZIP and the prompt. No evaluator checkout, expected files, rubric, prior output, other case ZIP or parent conversation was supplied. The runner was explicitly restricted to that packet. The common account/interface and public skill bytes are shared; case contexts and generated artifacts are distinct. This is not evidence of statistical independence or separate providers.

## Cases, times and bytes

| Case | Start (UTC) | Completion observed (UTC) | Context | Packet SHA-256 | Raw SHA-256 |
|---|---|---|---|---|---|
| responsive-layout-001 | 2026-11-17T13:34:02.112Z | 2026-11-17T13:36:59.992Z | https://chatgpt.com/c/6afc57c9-d038-83e8-b1eb-eff2a3c6b64c?temporary-chat=true | `d17dff51dba50a7a7036ca3604be1966bd361bdf37c3a947f71b137c6a8cd878` | `6b03b59045b65b19839db387842e34efbd6ed7e6c637dd9f8b42a7971d279368` |
| accessibility-001 | 2026-11-17T13:34:50.703Z | 2026-11-17T13:40:06.698Z | https://chatgpt.com/c/6afc57fa-7108-83ec-9b30-52239cce722b?temporary-chat=true | `592a0c5b7d316ac12c48f4a55875391f530162a65b75cee8cbeba61787b34539` | `b32693ddcc3feda08b6b6f8068ff81fb1bab7c1ba8a0c94442b6d3415dde0926` |

Completion times are actual controller observations after generation ended, not invented provider-internal end timestamps. `generation_finished_at` in the result uses the later observed completion of the two cases. All four original browser downloads and saved raw artifacts were present and hashed before this reviewer read evaluator criteria; every raw byte remains unchanged. Original paths, sizes and current independent byte comparisons appear in `evidence/reviewer-integrity.json`; original captured metadata remains in `evidence/generation-captures.json` and case sidecars.

## Supplied files and observed/claimed reads

For each case, the uploaded ZIP contains exactly the following pinned public files, plus generated `packet.json`. This reviewer checked every source entry against `git show` at the pin and its packet digest. No expected/rubric/result/reviewer or other-case file is present. The exact names and hashes are preserved in `evidence/reviewer-integrity.json`.

### responsive-layout-001

- `SKILL.md`
- `evals/responsive-layout/case-001/input.md`
- `references/component-architecture.md`
- `references/information-architecture.md`
- `references/workflow.md`
- `templates/component-contract.md`
- `templates/content-coverage.md`
- `templates/design-token-extraction.md`
- `templates/navigation-comparison.md`
- `templates/page-spec.md`
- `templates/project-context.md`
- `templates/responsive-behavior.md`
- `templates/visual-direction-comparison.md`
- `packet.json` (generated operational metadata)

### accessibility-001

- `SKILL.md`
- `evals/accessibility/case-001/input.md`
- `references/component-architecture.md`
- `references/information-architecture.md`
- `references/workflow.md`
- `templates/component-contract.md`
- `templates/content-coverage.md`
- `templates/design-token-extraction.md`
- `templates/navigation-comparison.md`
- `templates/page-spec.md`
- `templates/project-context.md`
- `templates/responsive-behavior.md`
- `templates/visual-direction-comparison.md`
- `packet.json` (generated operational metadata)

The final expanded activity summaries describe inspecting the packet, references/templates and creating the Markdown artifact. Artifact source/capability statements claim packet-only inspection. Full contents of a provider tool/file-access log are unavailable; neither those summaries nor a claimed source list prove an exhaustive per-file read trace. The protocol eligibility declaration is supported by the fresh-context settings, attachment boundary, unchanged prompt, archive inspection and visible activity; it is not a claim of independently audited provider internals.

## Capability and access boundary

- File read: available; the attached ZIP/case material was inspected. File write: available; the interface returned downloadable UTF-8 Markdown artifacts.
- Code execution, browsing, image-review and network tool availability: unknown from the retained provider activity; no capability is inferred from prose or a browser used by the controller.
- Web, connected sources, other conversations, external/evaluator files and prior outputs were prohibited by the submitted prompt and were not visibly supplied or used. This does not turn unobserved provider internals into a complete negative-access audit.
- No running fictional application, actual DOM, screenshots of the product, measurements, physical devices or assistive-technology execution were supplied. Those outcomes are unavailable and must not be confused with planning quality.
- Browser screenshots here show runner settings; they do not substantiate a product-layout or accessibility test.

## Review order and interpretation

The raw artifacts finished by 2026-11-17T13:40:06.698Z. This reviewer opened the v0.2 protocol/rubric and pinned expected files only after those generation observations; scoring was written after the byte-integrity check at 2026-11-17T13:46:42.302Z. The reviewer context may inspect evaluator material; none was sent back to any generation chat. Criterion-level judgments quote the unchanged raw artifact. No target score, v0.1 threshold or rescue prompt was used.

This run supplies pilot plan-quality evidence only. A mechanical validator pass checks record consistency, not hidden model revision, provider isolation guarantees, scoring correctness, rendered behavior or accessibility conformance.
