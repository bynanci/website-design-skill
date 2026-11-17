# Controller observation record

Operator: Codex assistant controlling the user-authorized ChatGPT web UI; this was not a human participant study.

The controller directly observed and selected the settings below. These observations describe the real UI execution; they are not provider-signed or exhaustive backend attestations.

## Supplied inputs and context boundary

Each case began in a separate new Temporary chat. Before sending, the UI showed **Unpersonalized** and said it would ignore memory, plugins and custom instructions. The controller selected the literal model label shown in this run metadata, with Medium effort. Only the case-specific unchanged pinned ZIP was attached; the controller sent the same preserved `generation-prompt.txt`. No full checkout, rubric, evaluator reference, prior answer, reviewer feedback or other case was provided to the tested context. The model ran in the remote chat environment, not the controller’s local evaluator worktree.

## Observed case receipts

| Context | Send lower-bound UTC | Completion/download observed UTC | Original artifact SHA-256 |
|---|---|---|---|
| https://chatgpt.com/c/6afc5617-2d98-83ec-a51c-b449e16c2fab?temporary-chat=true | 2026-11-17T13:26:57.845Z | 2026-11-17T13:31:46.482Z | `ab987db5fabf1d16d1e8605e0c04ce86c29ef15524be806801a0f59ecbc44ea0` |
| https://chatgpt.com/c/6afc56bc-2190-83ee-af01-1936e24a8e93?temporary-chat=true | 2026-11-17T13:29:32.307Z | 2026-11-17T13:31:49.193Z | `8a13523c5add6cddb1b714ac523e9afaa38cfae0c7d99e9c0ec6f5aa5ebf9cc5` |
| https://chatgpt.com/c/6afc572b-2010-83ec-819d-5ef0983ab564?temporary-chat=true | 2026-11-17T13:31:23.406Z | 2026-11-17T13:34:42.704Z | `227b621493a991fda7a1f17297a2aa4b9d26e7d6234c46764922affb5898c5c6` |

The timestamps bound the observed UI activity. They are not claimed to be exact provider-internal generation start/finish timestamps. Each completed Markdown artifact was downloaded through the UI, then copied byte-for-byte. The original downloads remain available for the current review. No source answer was rewritten, trimmed, regenerated after feedback, or filled from another run. Original Markdown hard-break spaces and visible-UI export whitespace were retained.

## Visibility and archive limits

The expanded visible activity summaries describe packet inspection and artifact creation; no web/connector/evaluator access was surfaced. The outputs also declare their packet materials and evidence limits. These are visible UI summaries and model declarations, not an exhaustive provider tool/filesystem trace. The selected interface model label is recorded literally; the hidden backend revision is unknown.

For the first GPT-6 three cases, pre-send settings/model actions were directly observed in the controller tool history, but a separate pre-send screenshot was not saved for every case. For GPT-5.6 Sol IA, saved model/pre snapshots are accessibility diffs and omit some previously observed settings. Full per-case pre-send archives exist for its component and end-to-end cases. Post-completion UI transcripts and the stored download receipts supplement these contemporaneous controller observations; they do not retroactively create missing screenshots.

Temporary chats were left unsaved to avoid changing their personalization/history behavior. Their identifiers are execution records, not public share links. Raw artifacts and archived UI text remain the preserved evidence even if an ephemeral chat later expires.

A separate evaluator reviewed the outputs only after generation. Eligibility and scores remain review judgments under the repository protocol; consistent hashes or a fresh-chat label alone do not certify independence.
