# Controller observation record

Operator: Codex assistant controlling the user-authorized ChatGPT web UI; this was not a human participant study.

The controller directly observed and selected the settings below. These observations describe the real UI execution; they are not provider-signed or exhaustive backend attestations.

## Supplied inputs and context boundary

Each case began in a separate new Temporary chat. Before sending, the UI showed **Unpersonalized** and said it would ignore memory, plugins and custom instructions. The controller selected the literal model label shown in this run metadata, with Medium effort. Only the case-specific unchanged pinned ZIP was attached; the controller sent the same preserved `generation-prompt.txt`. No full checkout, rubric, evaluator reference, prior answer, reviewer feedback or other case was provided to the tested context. The model ran in the remote chat environment, not the controller’s local evaluator worktree.

## Observed case receipts

| Context | Send lower-bound UTC | Completion/download observed UTC | Original artifact SHA-256 |
|---|---|---|---|
| https://chatgpt.com/c/6afc5437-854c-83e8-ad12-21cfc13e6ea1?temporary-chat=true | 2026-11-17T13:19:37.293Z | 2026-11-17T13:22:27.644Z | `4dbf31af88620a30c8353b9e1d4fce60f4105990b903e94005f5be15b0556ed5` |
| https://chatgpt.com/c/6afc54b3-e728-83ee-91bc-90dcd7bb5a25?temporary-chat=true | 2026-11-17T13:20:58.268Z | 2026-11-17T13:25:36.281Z | `f71231d12956e268112d926121dab8c616ade47c0997ca792d37f9ac56a4f624` |
| https://chatgpt.com/c/6afc54da-6bec-83e8-ba3a-20efec232f27?temporary-chat=true | 2026-11-17T13:21:43.708Z | 2026-11-17T13:28:15.962Z | `89791553ebc0a9633cb2bc08a85c91d4a21f20998e57b235d5121fdd697e20cd` |

The timestamps bound the observed UI activity. They are not claimed to be exact provider-internal generation start/finish timestamps. Each completed Markdown artifact was downloaded through the UI, then copied byte-for-byte. The original downloads remain available for the current review. No source answer was rewritten, trimmed, regenerated after feedback, or filled from another run. Original Markdown hard-break spaces and visible-UI export whitespace were retained.

## Visibility and archive limits

The expanded visible activity summaries describe packet inspection and artifact creation; no web/connector/evaluator access was surfaced. The outputs also declare their packet materials and evidence limits. These are visible UI summaries and model declarations, not an exhaustive provider tool/filesystem trace. The selected interface model label is recorded literally; the hidden backend revision is unknown.

For the first GPT-6 three cases, pre-send settings/model actions were directly observed in the controller tool history, but a separate pre-send screenshot was not saved for every case. For GPT-5.6 Sol IA, saved model/pre snapshots are accessibility diffs and omit some previously observed settings. Full per-case pre-send archives exist for its component and end-to-end cases. Post-completion UI transcripts and the stored download receipts supplement these contemporaneous controller observations; they do not retroactively create missing screenshots.

Temporary chats were left unsaved to avoid changing their personalization/history behavior. Their identifiers are execution records, not public share links. Raw artifacts and archived UI text remain the preserved evidence even if an ephemeral chat later expires.

A separate evaluator reviewed the outputs only after generation. Eligibility and scores remain review judgments under the repository protocol; consistent hashes or a fresh-chat label alone do not certify independence.
