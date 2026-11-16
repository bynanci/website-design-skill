# Synthetic Vue project-profile fixture

[繁體中文](README.zh-TW.md)

This fixture gives the read-only inspector a reproducible Vue project shape:

- Declared Vue, Vite, TypeScript, Sass and Pinia versions in `package.json`.
- A root `tsconfig.json` with JSONC comments, a trailing comma and the `@/*` alias.
- SCSS token declarations and a dark-theme CSS override.
- A Vue status component, a Pinia store and an API service boundary.
- A Vite configuration whose dynamic values are inventoried but never evaluated.

The dependency versions are declarations in a synthetic manifest. No lockfile, installed modules, build or runtime is provided.

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

The recorded `expected-profile.json` is the output for this command. It confirms static file digests and candidate inventory. The regression suite compares this output and checks that a changed source file receives a fresh digest. Token roles, CSS import resolution, the final dark-theme values, component public API, state ownership and rendered behavior remain unknown. The fixture does not claim visual, accessibility or browser validation.

Run the focused regression tests from the repository root:

```sh
python3 -m unittest discover -s tests -p 'test_project_profile_inspector.py' -v
```
