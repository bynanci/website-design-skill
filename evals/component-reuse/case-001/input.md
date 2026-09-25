# Component Reuse Fixture 001

Design the component mapping for a new "Enterprise" landing page.

Do not write implementation code.

## Existing component inventory

### HeroSection
Responsibility:
- page-level heading;
- supporting copy;
- primary and secondary CTA;
- optional media.

Variants:
- default
- centered

### SectionHeader
Responsibility:
- eyebrow;
- section title;
- supporting description.

### FeatureCard
Responsibility:
- one capability or benefit;
- optional icon/media;
- optional CTA.

Variants:
- default
- emphasized
- compact

### MetricBand
Responsibility:
- group 2–6 key metrics with labels and supporting notes.

### CTASection
Responsibility:
- final or mid-page conversion block.

Variants:
- default
- compact

### CaseStudyFeature
Responsibility:
- featured customer story with summary, proof, and CTA.

### LogoWall
Responsibility:
- customer / partner logo proof.

## Requested page

1. Hero with heading, description, "Request demo" CTA, and "View pricing" secondary CTA.
2. Trust section with customer logos.
3. Three enterprise capability cards.
4. Four scale / reliability metrics.
5. Customer case study.
6. Plan comparison table with rows for features and columns for three plans.
7. Final demo CTA.

## Constraints

- Reuse existing components whenever their responsibility already matches.
- A new component is allowed only when the existing inventory cannot represent the requirement cleanly.
- Do not create components named after this page unless the responsibility is truly page-specific.
- Output a section-to-component mapping and justify every action.
