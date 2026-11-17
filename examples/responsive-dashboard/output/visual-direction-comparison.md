# Harbor Dashboard — visual direction decision

[繁體中文](visual-direction-comparison.zh-TW.md)

Both directions are implemented on the same eight native components and frozen synthetic data. Task-fit claims remain **hypotheses**: no account-manager study, usage analytics or product-owner acceptance is supplied.

## Shared baseline

`fixture-data.js` supplies text and values. The runner compares normalized required-content text across five widths, both directions and both themes. Both directions preserve observation order, evidence, questions, charts, tables, cases and notes. The [dated QA record](qa-review-2026-11-17.md) carries the current candidate's verification state.

| Direction | Implemented difference | Trade-off |
|---|---|---|
| Editorial / 閱讀優先 | Default 12px panel radius and more reading space | Longer page; supporting sections require scrolling |
| Cockpit / 營運總覽 | 7px panel radius, tighter panel/observation spacing and stronger metric border | Higher density may make extended observation reading harder |

Light/dark theme is an independent preference. Both directions use the same semantic palette in each theme; cockpit no longer introduces a separate chart palette. No content is hidden to create the visual difference.

## Author's default selection

Keep **editorial** as the specimen default. The supplied primary task is to read the highest-priority observation, inspect evidence, prepare a question and record a human decision. Additional reading space supports that stated sequence, while the mobile shortcut makes observations directly reachable.

This is the author's design judgment based on the supplied task. It is not a user-study result or stakeholder approval. Cockpit remains selectable for comparison. A product team can change the default after it records task outcomes and accepts the scrolling/density trade-off.

## Review and limits

The declared matrix compares content/geometry across both directions and themes; current CI outcome belongs in the dated report. Native 200% zoom currently checks editorial in light/dark, not every direction/theme combination. Independent chart/note instances are tested through supplied data and interaction. Native factories do not prove compatibility with another frontend framework.

Before a product rollout, inspect actual captures, compare reading and evidence-discovery tasks with users, review screen-reader/manual keyboard behavior and confirm real content lengths. Preserve source hashes and the known passing candidate if a visual experiment regresses.
