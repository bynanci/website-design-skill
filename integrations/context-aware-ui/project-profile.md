# Project Profile and Design-System Mapping

Status: **proposed, reusable inspection record**. Populate it from a target repository; it is not a preloaded set of Mark-specific aliases or tokens.

## Snapshot and scope

- Profile format version:
- Workspace identifier and allowed root:
- Repository revision and relevant working-file digests:
- Requested task and affected feature:
- Relevant source paths and line/symbol references:
- Inspected / unavailable / stale sources:
- Command, network and write capabilities already authorized by the host:
- Evidence gaps:

A repository commit does not identify uncommitted edits. Record content digests for the files that determine a patch. Reuse cached entries only while those source digests still match.

## Framework and conventions

| Item | Observed value | Source and revision | Unknown / unsupported |
|---|---|---|---|
| Framework, compiler and language versions | | package/lockfile | |
| Build and style toolchain | | configuration and imports | |
| Aliases and actual target paths | | build + type-check configuration | |
| Component/feature/composable paths | | existing neighboring modules | |
| Props, events, slots and naming | | existing public APIs | |
| State owner and data access | | store/composable/service | |
| Native commands, shell and supported platforms | | desktop configuration, if applicable | |
| Permitted build/check/render commands | | repository script and host policy | |

Reading a JavaScript configuration file is not permission to execute it. Parse static values when possible; mark dynamic values unresolved until an authorized evaluation or build provides evidence.

## Component inventory and reuse

| Responsibility | Existing component/API | Variants and states | Token source | Reuse decision and evidence |
|---|---|---|---|---|
| | | | | |

Use reuse → extend → variant → compose → new. Record why the preceding options are insufficient before adding a component. Discover import aliases from configuration instead of assuming `@common` or `@viz`.

## Token evidence

Inspect the actual styling system:

- CSS custom properties and their scoped/theme overrides;
- SCSS variables, modules, mixins and the import/injection chain;
- Tailwind configuration or CSS theme declarations, according to the installed version;
- existing token files or exports, including a design-token interchange format if the project uses one;
- existing shared components that already encode the desired visual role.

Tailwind's current [theme documentation](https://tailwindcss.com/docs/theme) describes CSS theme variables. Do not search only for a legacy configuration filename or migrate the project's style system implicitly.

### Semantic mapping

| User intent / design role | Observed token or component | Syntax used by consumers | Theme/scope/import evidence | Missing role or approved exception |
|---|---|---|---|---|
| Destructive action | | | | |
| Warning / caution | | | | |
| Surface and foreground | | | | |
| Spacing, type, radius and motion | | | | |

A warning and a destructive action may have different roles. Choose names from project evidence; `--color-danger` and `--spacing-md` are examples only. SCSS compile-time variables and runtime CSS custom properties have different loading/override behavior.

If a needed role is absent, first try an existing semantic component/variant. Otherwise propose a named token addition or a documented local exception with scope and rationale. Do not silently create a color literal or unresolved CSS-variable fallback.

### Verification and drift report

- Resolve the chosen token in every declared theme/scope through the actual build/render path.
- For foreground/background contrast, record the computed pair and measurement method; token existence alone is insufficient.
- Identify new literals, duplicated tokens and changed shared definitions in the affected scope.
- Declare the denominator when reporting token coverage; record allowed structural literals such as zero or a layout calculation separately.
- Distinguish static reference checks from computed/rendered validation.
- Preserve approved component variants and brand semantics rather than enforcing one global palette.

The adapter should enforce approved token use where the project defines a role. It cannot claim total visual equivalence solely by reusing token names.

## State, API and side-effect boundaries

| Feature | Owner | Inputs / events | Outputs / errors | Cancellation / retry / persistence |
|---|---|---|---|---|
| | | | | |

- Existing store/action/composable to reuse:
- API/native command contract and evidence:
- Protected files, symbols or ranges:
- Scope of any required owner/API change:
- Applicable [state contract](state-contract.md):
- Required keyboard/focus and content-preservation invariants:

## Capability and evidence matrix

| Capability | Available, unavailable or unknown | Method / policy | Evidence / limitation |
|---|---|---|---|
| Read relevant files | | | |
| Parse this syntax | | | |
| Propose/apply a patch | | | |
| Build/type-check | | | |
| Render web states | | | |
| Inspect actual captures | | | |
| Measure DOM/accessibility behavior | | | |
| Exercise native shell / browser zoom / assistive technology | | | |

A project profile may be useful while partially complete. Block only the operation whose missing evidence makes it unsafe or unsupported; carry the unknown forward explicitly.
