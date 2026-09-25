# Atlas Grid — Homepage Specification

## Goal

Help a technical evaluator understand Atlas Grid, connect product capabilities to a relevant problem, verify reliability, and move to pricing or a technical demo.

## Proposed sections

### 01 — Hero
- Purpose: communicate core platform value.
- Content: H1, supporting copy, Request Technical Demo, View Pricing.
- Candidate component: `HeroSection`.

### 02 — Customer Proof
- Purpose: establish credibility early.
- Content: customer logos.
- Candidate component: `LogoWall`.

### 03 — Product
- Purpose: explain what Atlas Grid does.
- Content: Observe, Automate.
- Candidate components: `SectionHeader` + `ProductCard`.

### 04 — Use Cases
- Purpose: connect capabilities to evaluator problems.
- Content: Observability, Workflow Automation.
- Candidate components: `SectionHeader` + `FeatureCard`.

### 05 — Kubernetes Context
- Purpose: preserve technology-specific relevance without mixing taxonomy.
- Content: existing Kubernetes material.
- Candidate components: `SectionHeader` + existing feature/editorial composition.

### 06 — Reliability Proof
- Purpose: retain existing reliability evidence.
- Content: three existing metrics.
- Candidate component: `MetricBand`.

### 07 — Enterprise Proof
- Purpose: preserve enterprise-oriented content as evidence rather than navigation taxonomy.
- Content: scale, governance, reliability, or security claims only when supported by source content.
- Candidate components: existing feature/proof primitives.

### 08 — Featured Case Study
- Purpose: deeper customer evidence.
- Candidate component: `CaseStudyFeature`.

### 09 — Resources
- Purpose: support further evaluation.
- Content: selected Blog / Docs links.
- Candidate components: `SectionHeader` + `ContentCard`.

### 10 — Final CTA
- Purpose: make the primary next step explicit.
- Content: Request Technical Demo; optional Pricing link; Start Here guidance.
- Candidate component: `CTASection`.

## Content coverage

| Required content | Destination | Status |
|---|---|---|
| Observe | Product | Preserved |
| Automate | Product | Preserved |
| Kubernetes | Kubernetes Context | Moved |
| Enterprise proof | Enterprise Proof + contextual product/use-case sections | Moved |
| Start Here | Final CTA / lifecycle guidance | Moved |
| Customer logos | Customer Proof | Preserved |
| Case studies | Featured Case Study / Resources | Preserved |
| Blog | Resources | Preserved |
| Docs | Resources | Preserved |
| Pricing | Hero + navigation | Preserved |
| About | Global navigation / footer | Preserved |
| Contact / demo | Hero + Final CTA + utility route | Moved |
| Reliability metrics | Reliability Proof | Preserved |

## Wireframe gate

- [x] One primary evaluation journey
- [x] Required content accounted for
- [x] CTA hierarchy is explicit
- [x] IA taxonomy is not reintroduced in section hierarchy
- [x] Visual style remains intentionally unspecified
