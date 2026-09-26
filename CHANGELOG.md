# Changelog

All notable changes to this project will be documented here.

The project intends to follow Semantic Versioning once the public artifact contracts stabilize.

## [Unreleased]

### Added

- Initial platform-agnostic `SKILL.md`
- Core redesign workflow reference
- Information architecture reference
- Component architecture reference
- Project context and page specification templates
- Navigation comparison template
- Content coverage template
- Component contract template
- Synthetic SaaS redesign example
- End-to-end B2B redesign fixture
- IA audit behavioral evaluation fixture
- Component reuse behavioral evaluation fixture
- Cross-agent benchmark protocol and canonical manifest
- Criterion-level compatibility scoring rubric
- Benchmark result JSON schema and starter result template
- Standard benchmark runner instruction
- Frozen clean-run packet
- Runner eligibility requirements
- Runner availability matrix
- Compatibility matrix and result-submission structure
- Machine-readable v0.1 release policy
- Release readiness script
- Release process documentation
- Benchmark run GitHub Issue template
- v0.1.0 release-tracking Issue #1
- Zero-dependency skill and benchmark validators
- GitHub Actions validation and release-readiness reporting
- Integration boundary
- Open-source contribution guidelines
- Public roadmap from v0.1 MVP through v1.0 contract stability
- Lightweight project governance and deprecation policy
- Repository security reporting policy
- General bug-report and methodology-proposal issue forms

### Changed

- Core phase routing loads focused references and templates instead of relying only on the general workflow document
- Repository validation enforces complete eval case pairs and the required end-to-end artifact chain
- Benchmark validation enforces suite integrity, release-policy consistency, result-template consistency, raw-output preservation, canonical criteria, and aggregate-score consistency
- Evaluation documentation defines behavioral contracts instead of exact-output golden files
- Runner availability is tracked separately from skill compatibility so access/subscription failures are not mis-scored
- Contribution guidance defines clean vs exploratory benchmark submissions
- README documents the cross-agent compatibility suite, runner eligibility, release gates, and current v0.1 release-candidate state
- Repository validation requires roadmap, governance, and security documents as part of the public-maintenance baseline

### Runner evidence

- Replit Agent exploratory attempt produced no retrievable raw outputs
- A narrowed clean IA retry failed with `requires_active_subscription`
- Replit is therefore classified as unavailable in the current environment, not as a compatibility failure
- Superpowers was verified as installed and enabled, but it exposes methodology/skills behavior rather than an isolated agent execution context
- Superpowers is therefore classified as a non-runner and produces no compatibility score
