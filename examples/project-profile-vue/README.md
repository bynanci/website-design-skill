# Synthetic Vue project-profile fixture

[繁體中文](README.zh-TW.md)

This fixture gives the read-only inspector a reproducible Vue project shape:

- Declared Vue, Vite, TypeScript, Sass and Pinia versions in `package.json`.
- A root `tsconfig.json` with JSONC comments, a trailing comma and the `@/*` alias.
- SCSS token declarations and a dark-theme CSS override.
- A Vue status component, a Pinia store and an API service boundary.
- A Vite configuration whose dynamic values are inventoried but never evaluated.

The fixture manifest declares its dependencies. The optional [Vue profile pilot](../../integrations/vue-project-profile/README.md) pins the matching compiler/runtime and a production-build/render harness in its own lockfile.

Run from the repository root:

```sh
python3 scripts/inspect_project_profile.py examples/project-profile-vue \
  --task "Inspect the dashboard status banner" \
  --affected-path src/components/StatusBanner.vue \
  --required-alias "@/components" \
  --required-alias "@missing" \
  --required-token=--color-warning \
  --required-token=--color-destructive \
  --required-token=--missing-token
```

The recorded `expected-profile.json` is the output for this command. It confirms static file digests and candidate inventory. The regression suite compares this output and checks that a changed source file receives a fresh digest. This Python snapshot keeps semantic roles, computed themes, component APIs and state ownership unknown. The optional pilot adds source-level evidence for the roles in `profile-contract.json`, extracts the component props and existing Pinia/service owner, and runs separate browser checks for both theme consumers. Browser checks cover this status fixture; full dashboard quality and state-transition behavior require their own evidence.

Run the focused regression tests from the repository root:

```sh
python3 -m unittest discover -s tests -p 'test_project_profile_inspector.py' -v
```

## Parsed and rendered evidence

`profile-contract.json` is the reviewed intent contract. It maps warning and destructive-action roles to different observed tokens, names both themes, identifies the component and existing state/API owner, and scopes the one approved border-width literal. It supplies no runtime permission.

Follow the optional pilot guide to install tooling, inspect the source graph and run the production render checks. CI preserves the generated profile, actual runtime versions, source hashes and captures. A missing browser or failed run remains an explicit failure or unrun condition.
