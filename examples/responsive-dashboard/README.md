# Responsive Account Dashboard — optional v0.2 specimen

[繁體中文](README.zh-TW.md)

This public specimen applies the optional visual-direction, responsive and token contracts to synthetic account data. It provides eight reusable native template factories, two visual directions, light/dark themes and a synthetic loading/recovery owner.

The current browser runner declares 32 matrix conditions and two separate native 200% zoom captures. The [2026-11-17 evidence record](output/qa-review-2026-11-17.md) tracks the candidate and CI result. A declared check is not a passing result. The [2026-11-16 report](output/qa-review-2026-11-16.md) remains historical evidence for its earlier source.

## Start

Open [specimen/index.html](specimen/index.html) in a modern browser. No build, backend, external font or network request is required. All names, dates and amounts are fictional.

- [Synthetic input](input/current-page.md) preserves the original incomplete design brief.
- [Component and host contracts](specimen/README.md) describe reuse and ownership.
- [Responsive behavior](output/responsive-behavior.md) defines content parity and the test boundary.
- [Visual directions](output/visual-direction-comparison.md) record the author's editorial-default judgment.
- [Token inventory](output/design-token-extraction.md) maps actual CSS sources and consumers.
- [QA commands](qa/README.md) generate measurements, screenshots and failure records.

## Support boundary

The native factories are implemented in this standalone specimen. They do not establish Vue/React integration or compatibility with another product's component library. Account data, retries and page lifecycle are synthetic; notes remain in the mounted field and are never persisted or sent.

The specimen remains outside the official v0.1 40-point benchmark. Physical-device use, screen readers, native Tauri behavior, real customer integration and production performance are unrun. Human product acceptance remains separate from automated checks.
