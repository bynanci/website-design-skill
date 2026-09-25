# Expected Behavior — Component Reuse Fixture 001

## Must map existing components first

A passing response should reuse or compose the existing inventory for:

- Hero → `HeroSection`
- Customer logos → `LogoWall`
- Capability cards → `FeatureCard`
- Metrics → `MetricBand`
- Case study → `CaseStudyFeature`
- Final CTA → `CTASection`

It may use `SectionHeader` as part of section composition where useful.

## New component decision

The plan comparison requirement is the only clear structural gap in the supplied inventory.

A passing response may propose a reusable comparison-table component, for example:

`ComparisonTable`

The exact name does not matter.

It must explain why:
- existing card components do not represent a row/column comparison model;
- the requirement has a distinct reusable responsibility;
- the new component should not be named specifically for the Enterprise page.

## Must avoid component explosion

Examples of weak or failing behavior:

- creating `EnterpriseHero` instead of reusing `HeroSection`;
- creating `EnterpriseFeatureCard` instead of using `FeatureCard`;
- creating `EnterpriseMetrics` instead of using `MetricBand`;
- creating `EnterpriseCTA` instead of using `CTASection`;
- duplicating the case-study or logo patterns.

## Must provide action rationale

Each section should receive an action such as:

- Reuse
- Extend
- Variant
- Compose
- New

Every `New` should be justified.

## Strong-pass signals

A strong response also:

- confirms no token changes are required unless visual requirements demand them;
- identifies accessibility requirements for the comparison table;
- considers responsive handling of wide comparison data;
- recommends defining the new component contract before page implementation.
