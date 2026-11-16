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

Examples must not depend on one specific AI model, design application, or frontend framework.
