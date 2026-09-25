# Atlas Grid — Component Mapping

## Decision order

`Reuse → Extend → Variant → Compose → New`

## Mapping

| Section | Existing component(s) | Action | Rationale |
|---|---|---|---|
| Hero | HeroSection | Reuse | Responsibility already matches page-level message + CTA |
| Customer Proof | LogoWall | Reuse | Exact proof pattern already exists |
| Product | SectionHeader + ProductCard | Compose | Existing primitives cover the section |
| Use Cases | SectionHeader + FeatureCard | Compose | Existing card responsibility matches one use case |
| Kubernetes Context | SectionHeader + FeatureCard | Compose | No technology-specific component is required |
| Reliability Proof | MetricBand | Reuse | Existing metric responsibility matches |
| Enterprise Proof | SectionHeader + FeatureCard / MetricBand | Compose | Enterprise is content context, not a new UI primitive |
| Featured Case Study | CaseStudyFeature | Reuse | Exact pattern exists |
| Resources | SectionHeader + ContentCard | Compose | Existing resource cards cover blog/docs previews |
| Final CTA | CTASection | Reuse | Existing conversion pattern matches |

## New component requirements

None.

The homepage can be composed entirely from the current inventory.

## Token changes

None justified by the structural specification.

Visual exploration may later reveal token changes, but no token change should be inferred from IA or wireframe work alone.

## Component gate

- [x] Every section has an explicit mapping
- [x] No page-specific duplicate component was introduced
- [x] New component count: 0
- [x] Existing responsibilities remain intact
- [x] Visual styling decisions remain downstream
