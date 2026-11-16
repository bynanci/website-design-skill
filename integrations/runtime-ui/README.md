# Declarative Runtime UI Experiment

[繁體中文版本](integrations/runtime-ui/README.zh-TW.md)

Status: **proposed P2 experiment; no runtime renderer or microfrontend system is implemented**.

## Purpose

A host may request a temporary troubleshooting or settings panel for a specific state. The model proposes a declarative UI tree; the host validates and renders it using already trusted components and action handlers.

This is a separate runtime boundary from design-time source editing. MCP is one possible transport, not a requirement for the renderer or an authorization mechanism by itself.

Vue's [security guidance](https://vuejs.org/guide/best-practices/security) explains why untrusted component templates can execute code. Treat model output and error logs as untrusted data. Do not compile generated Vue templates, JSX, JavaScript, arbitrary HTML, CSS, expressions, module URLs or native commands inside the application.

## Host contract

- Negotiate an explicit schema version, registered component versions, allowed tokens and action capabilities.
- Supply a minimized, redacted state snapshot with a stable error code and correlation identifier.
- Treat log text as data, never as instructions that can enlarge the tool/action allowlist.
- Validate every nested node, property, enum, length, count and depth; reject unknown fields.
- Resolve component names through a fixed registry; each component has its own allowed props.
- Select actions from a registry with typed parameters and per-request host authorization. A model-supplied action ID is a request, not permission.
- Re-check the current state/version before any mutation. Block stale or replayed actions and use the host's confirmation rules.
- Use a bounded, dismissible surface. Keep focus placement/restoration, keyboard navigation, errors and reduced motion consistent with the application.
- Fall back to a static error panel if generation times out, is unavailable, or fails validation. A user must be able to dismiss the panel and continue the supported recovery workflow.
- Use trusted local illustrations selected by asset ID when useful; raw model HTML, arbitrary images and remote URLs are not accepted.

## Illustrative response

This example documents intent only. A future implementation must provide a strict schema and host-side validation before consuming it.

```json
{
  "schemaVersion": "ui-panel/0.1",
  "requestId": "synthetic-case-01",
  "stateVersion": "media-state-4",
  "expiresAfterMs": 60000,
  "nodes": [
    {
      "type": "Notice",
      "props": {
        "tone": "warning",
        "title": "Media preview unavailable",
        "text": "The selected item could not be previewed."
      }
    },
    {
      "type": "ActionButton",
      "props": {
        "label": "Show troubleshooting details"
      },
      "action": {
        "id": "showTroubleshootingDetails",
        "params": {
          "errorId": "synthetic-error-01"
        }
      }
    }
  ]
}
```

The host clamps expiry to its configured budget. The action registry binds this error ID to the current request and determines whether details may be displayed. Component tone resolves through approved design tokens. All displayed strings are rendered as text.

Errors expose only approved details; generated diagnoses are labelled as suggestions and linked to trusted diagnostic evidence where available.

## Research-test error pilot

For a future N-01 troubleshooting experiment, first obtain the actual case's input/error/recovery contract. This proposal does not assume what N-01 means or invent study evidence.

Use a synthetic exception and a pre-registered safe action. Check valid rendering, unknown components/actions/props, nested oversized payloads, malicious log text, injected code/URL fields, expired/replayed actions, unavailable model and focus restoration. Keep raw participant data outside the request unless explicitly approved.

## Runtime cost and support gate

A dynamic panel can add model latency, network dependency, schema/registry code and maintenance cost. A smaller initial bundle is a hypothesis to measure, not a guaranteed result.

Before a runtime pilot is accepted, record schema conformance, static-fallback availability, latency/cost budget, payload limits, accessibility behavior and the actual host isolation/permission boundary. Benchmark against a static recovery panel.

To call this a microfrontend system would require additional packaging, dependency isolation, lifecycle, deployment and version-compatibility contracts. This experiment establishes only a declarative panel boundary.
