# Northstar Analytics — Homepage Specification

## Goal

Help a new evaluator understand the platform, identify a relevant problem/use case, verify credibility, and move toward pricing or a demo.

## Primary audience

Operations and technical evaluators.

## Current problems

- Industry, audience, and lifecycle content are mixed.
- Product cards appear before visitors understand the value proposition.
- Enterprise messaging is structurally ambiguous.
- Contact is used as a generic endpoint instead of a clear evaluation CTA.

## Proposed structure

### 01 — Hero

Purpose:
Explain the platform's core value and establish the primary evaluation path.

Content:
- value proposition;
- concise supporting copy;
- primary CTA: Request Demo;
- secondary CTA: View Pricing.

Component action:
- Reuse or extend the existing hero pattern if present.

### 02 — Credibility

Purpose:
Provide immediate evidence that reduces evaluation risk.

Content:
- customer proof;
- relevant quantitative evidence if verified;
- logos or trust signals if available.

Component action:
- Reuse existing proof / logo pattern.

### 03 — Product Capabilities

Purpose:
Explain what the platform does.

Content:
- Monitor;
- Automate.

Component action:
- Reuse existing product-card pattern.

### 04 — Solutions

Purpose:
Connect capabilities to user problems.

Content:
- Incident Response;
- Workflow Automation.

Component action:
- Prefer composition of existing section header + feature/card primitives.

### 05 — Industry Example

Purpose:
Show domain relevance without mixing industry taxonomy into Solutions.

Content:
- Healthcare.

Component action:
- Reuse existing feature/editorial section where possible.

### 06 — Enterprise Proof

Purpose:
Preserve enterprise-oriented content as evidence rather than an ambiguous navigation category.

Content:
- security / scale / governance claims only when supported by source content.

Component action:
- Reuse proof, metric, or feature components.

### 07 — Case Study

Purpose:
Provide deeper social proof.

Content:
- featured case study.

Component action:
- Reuse case-study component.

### 08 — Resources

Purpose:
Support visitors who need more information before conversion.

Content:
- selected blog content;
- link to Resources.

Component action:
- Reuse content-card pattern.

### 09 — Final CTA

Purpose:
Provide a clear evaluation next step.

Content:
- Request Demo;
- Pricing link;
- optional Getting Started guidance.

Component action:
- Reuse CTA section.

## Content coverage

| Existing content | Proposed location | Action | Status |
|---|---|---|---|
| Hero | Hero | Rewrite for clearer value proposition | Rewritten |
| Product cards | Product Capabilities | Preserve | Preserved |
| Healthcare section | Industry Example | Move | Moved |
| Enterprise section | Enterprise Proof + relevant product/solution sections | Redistribute | Moved |
| Customer quote | Credibility / Case Study | Preserve | Preserved |
| Blog posts | Resources | Preserve selectively | Preserved |
| Contact form | Final CTA / dedicated contact route | Change conversion role | Moved |
| Getting Started | Final CTA / lifecycle guidance | Move | Moved |
| Pricing | Hero secondary CTA + navigation | Preserve | Preserved |

## Component mapping

| Section | Pattern | Action |
|---|---|---|
| Hero | Hero | Reuse / Extend |
| Credibility | Proof band | Reuse / Compose |
| Product Capabilities | Product cards | Reuse |
| Solutions | Feature grid | Compose |
| Industry Example | Editorial feature | Reuse / Variant |
| Enterprise Proof | Proof / metrics | Compose |
| Case Study | Case study feature | Reuse |
| Resources | Content cards | Reuse |
| Final CTA | CTA section | Reuse |

## New component requirements

None are justified by this specification yet. Inspect the actual component inventory before creating anything new.

## Risks / assumptions

- Use-case names are synthetic and must be validated in a real project.
- Quantitative proof must not be invented.
- Enterprise claims must be grounded in existing product evidence.
- The visual system is intentionally unspecified at this stage.

## Validation

- [x] Homepage has one primary evaluation goal
- [x] Required source content has an explicit destination
- [x] Taxonomy problems are not reintroduced at page level
- [x] CTA hierarchy is explicit
- [x] No new component is created without inventory review
- [x] Visual styling remains downstream of structure
