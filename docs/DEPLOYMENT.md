# Static showcase deployment

[繁體中文](DEPLOYMENT.zh-TW.md)

The repository is an Agent Skill with an optional static showcase. It is not a root Vite or Next.js application. Deploying `integrations/vue-project-profile` as Vite fails because that tooling directory has no `index.html` entry.

## Build and scope

Run `node site/build.mjs` from repository root. No package installation, Python, browser or paid service is required to build the public files. Serve `dist/` to inspect the output.

Main produces the bilingual documentation landing page. A checkout containing the complete responsive dashboard also publishes its five approved static assets under `/demos/dashboard/`. The builder cleans old output; a main build must not retain an earlier preview's dashboard. The public manifest identifies the source and output file digests. Evaluation answers, raw benchmark results, logs, credentials and dependency directories are not public assets.

Building or deploying this showcase does not release the core skill, create a version tag or satisfy Issues #1/#6. PR #5 retains its release gates.

## Canonical Vercel project

| Setting | Value |
|---|---|
| Existing project | `vue-project-profile` in team `bynanci` |
| Root Directory | Repository root; empty/null in project settings |
| Framework Preset | Other (`null`) |
| Node.js | 22.x |
| Install Command | `node -e "process.exit(0)"` |
| Build Command | `node site/build.mjs` |
| Output Directory | `dist` |
| Ignored Build Step | `node scripts/vercel_ignore_build.mjs` |

The root `vercel.json` records the build/output behavior. Root Directory is a project setting, not a `vercel.json` property. Keep the project's existing access protection and domains.

The three duplicate projects (`-83bv`, `-o57d`, `-8ed8`) have preview builds paused and an ignored build step. Their tooling root also contains `git.deploymentEnabled: false`. Keep their deployment history; use the one canonical project for new work.

The ignore script skips only a verified diff with unchanged deployment inputs, including the dashboard directory whose presence selects the preview variant. The first deployment, missing shallow-history objects, inconsistent revisions or Git errors require a build. A skip is not a successful deployment. Vercel counts deployments canceled by an ignored build step toward deployment quotas; the skip saves build work, while disabling duplicate automatic deployments removes the duplicate triggers.

## Verification and merge

The static-site workflow builds main and the pinned complete dashboard variant, checks the output allowlist, local links/assets and MIME types, and exercises the served production output in Chromium. It preserves its artifacts and source identity. This is separate from Vercel's provider status.

Inspect all commit statuses and check runs for the exact candidate:

```sh
python3 scripts/check_merge_readiness.py \
  --repo bynanci/website-design-skill --sha <40-character-sha> \
  --required-check validate --required-check 'Vercel – vue-project-profile'
```

Exit 0 means every observed context and explicitly required name completed successfully. Exit 1 means blocking/missing evidence; exit 2 means API/identity/pagination evidence could not be verified. Neutral, skipped and successful preview-comment checks do not prove a successful deployment. The utility reports readiness; it does not enforce branch protection by itself.

For Vercel acceptance, record the exact source SHA, deployment ID, environment, `READY` state and actual HTTP/browser results. A deployment with a quota, build or access error remains unresolved. Preserve the provider's retry/reset information; do not repeatedly redeploy while rate limited or upgrade a plan implicitly. Historical red checks stay part of the audit trail.

## Incident and references

[Issue #29](https://github.com/bynanci/website-design-skill/issues/29) records the actual missing-entry failures, four duplicate deployment contexts, later rate-limit errors, configuration changes and latest verification. Until that issue records a verified `READY` deployment, local/CI build success must not be described as Vercel success.

Official behavior: [project configuration](https://vercel.com/docs/project-configuration/vercel-json), [Git deployment controls](https://vercel.com/docs/project-configuration/git-configuration), [project build settings](https://vercel.com/docs/project-configuration/project-settings), [limits](https://vercel.com/docs/limits).
