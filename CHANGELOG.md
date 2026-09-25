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

### Changed

- Core phase routing loads focused references and templates instead of relying only on the general workflow document
- Repository validation enforces complete eval case pairs and the required end-to-end artifact chain
- Benchmark validation enforces suite integrity, release-policy consistency, result-template consistency, raw-output preservation, canonical criteria, and aggregate-score consistency
- Evaluation documentation defines behavioral contracts instead of exact-output golden files
- Runner availability is tracked separately from skill compatibility so access/subscription failures are not mis-scored
- Contribution guidance defines clean vs exploratory benchmark submissions
- README documents the cross-agent compatibility suite, runner eligibility, release gates, and current v0.1 release-candidate state

### Runner evidence

- Replit Agent exploratory attempt produced no retrievable raw outputs
- A narrowed clean IA retry failed with `requires_active_subscription`
- Replit is therefore classified as unavailable in the current environment, not as a compatibility failure
