# Examples

[繁體中文](README.zh-TW.md)

Examples should demonstrate the skill using synthetic or redistributable inputs.

Planned example categories:

- corporate website
- SaaS/product website
- commerce website
- portfolio/editorial website

Each example should include enough artifacts to inspect the decision chain:

```text
input
→ audit
→ IA
→ page specification
→ component mapping
→ validation
```

## Available integration fixtures

- [Synthetic Vue project-profile fixture](project-profile-vue/README.md): static inputs and recorded evidence for the optional read-only inspector. It does not add a Vue dependency to the core skill or claim rendered validation.


- [Bounded track-reorder patch](track-reorder-vue/README.md): source-preserving edits and native event/action evidence.
- [Media-library transitions](media-library-vue/README.md): delayed reads, cancellation, stale-response protection and keyboard recovery.

Examples must not depend on one specific AI model, design application, or frontend framework.
