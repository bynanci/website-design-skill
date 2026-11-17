/** Same-origin data/authorization boundary, not a process or script sandbox. */
import { COMPONENT_VERSIONS, LIMITS, REGISTRY_VERSION, SCHEMA_VERSION, validatePayload } from "./contract.js";

const clone = value => JSON.parse(JSON.stringify(value));
const bounded = (value, low, high, name) => {
  if (!Number.isSafeInteger(value) || value < low || value > high) throw new TypeError(`Invalid host ${name}`);
  return value;
};
const uuid = () => globalThis.crypto.randomUUID();
const authorized = snapshot => !snapshot.disposed && snapshot.status === "error" && snapshot.error?.code === "unavailable" && snapshot.error.retryable === true;
const messages = Object.freeze({
  unavailable: "The media list is temporarily unavailable. You can retry the existing read operation.",
  permission_denied: "This session cannot read the media list. A trusted new session is required.",
  invalid_response: "The media service returned an invalid response. This session cannot retry that response automatically.",
});

export function createRecoveryHost({ snapshot, retry, generate, now = Date.now, timeoutMs = 1000, maxActionTtlMs = 30000, requestIdFactory = () => `recovery-${uuid()}`, onChange = () => {} }) {
  if (typeof snapshot !== "function" || typeof retry !== "function" || typeof now !== "function" || typeof requestIdFactory !== "function" || typeof onChange !== "function") throw new TypeError("Host callbacks are required");
  bounded(timeoutMs, 1, 10000, "timeout");
  bounded(maxActionTtlMs, 1, LIMITS.expiryMs, "action expiry");
  let lastClock = -1;
  const clock = () => {
    const value = now();
    if (!Number.isSafeInteger(value) || value > Number.MAX_SAFE_INTEGER - LIMITS.expiryMs || value < lastClock || value < 0) throw new TypeError("Invalid or regressing host clock");
    lastClock = value;
    return value;
  };
  let revision = -1;
  let sequence = 0;
  let disposed = false;
  let pending = null;
  const capabilities = new Map();
  const stats = { producerCalls: 0, producerFailures: 0, validatedPayloads: 0, payloadBytes: 0, actionAttempts: 0, activated: 0, refused: 0 };
  let state = { mode: "dismissed", reason: null, requestId: null, stateVersion: null, expiresAt: null, nodes: [] };

  const read = () => {
    const live = snapshot();
    if (!live || !Number.isSafeInteger(live.revision) || live.revision < revision || live.revision < 0 || !["idle", "loading", "refreshing", "error", "success"].includes(live.status)) throw new TypeError("Invalid or regressing owner revision");
    revision = live.revision;
    const error = live.error && Object.hasOwn(messages, live.error.code) ? { code: live.error.code, retryable: live.error.retryable === true } : null;
    return { revision: live.revision, status: live.status, error, hasUsableData: Array.isArray(live.items) && live.items.length > 0, disposed: live.disposed === true };
  };
  const notify = () => { try { onChange(clone(state)); } catch { /* Observer errors cannot grant capabilities. */ } };
  const binding = live => {
    const requestId = requestIdFactory();
    if (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{1,80}$/.test(requestId)) throw new TypeError("Invalid host request identifier");
    return { requestId, stateVersion: `media-state-${live.revision}`, revision: live.revision, expiresAt: clock() + maxActionTtlMs };
  };
  const decorate = (nodes, context) => nodes.map(node => {
    if (node.type === "Group") return { ...node, props: { ...node.props }, children: decorate(node.children, context) };
    if (node.type !== "ActionButton") return { ...node, props: { ...node.props } };
    const token = uuid();
    capabilities.set(token, { ...context, action: "retryMediaRead" });
    return { ...node, props: { ...node.props }, action: { id: "retryMediaRead", params: {}, token } };
  });
  const interrupt = () => {
    // Revoke capabilities before AbortSignal listeners can synchronously reenter.
    const active = pending;
    sequence++;
    pending = null;
    capabilities.clear();
    active?.controller.abort();
  };
  const staticState = (reason, live, context = binding(live), mode = "static") => {
    capabilities.clear();
    const nodes = [{ type: "Notice", props: { tone: "error", title: "Media recovery", text: messages[live.error?.code] || "The recovery request is no longer applicable. Continue with the current media panel." } }];
    if (authorized(live)) nodes.push({ type: "ActionButton", props: { label: "Retry media read" }, action: { id: "retryMediaRead", params: {} } });
    state = { mode, reason, requestId: context.requestId, stateVersion: context.stateVersion, expiresAt: context.expiresAt, nodes: decorate(nodes, context) };
    notify();
    return clone(state);
  };
  const safeStatic = reason => {
    interrupt();
    if (disposed) { state = { mode: "dismissed", reason: "disposed", requestId: null, stateVersion: null, expiresAt: null, nodes: [] }; notify(); return clone(state); }
    try { return staticState(reason, read()); }
    catch { state = { mode: "static", reason: "invalid-owner-state", requestId: null, stateVersion: null, expiresAt: null, nodes: [{ type: "Notice", props: { tone: "error", title: "Recovery unavailable", text: "Continue with the existing media panel." } }] }; notify(); return clone(state); }
  };

  async function request() {
    if (disposed) return clone(state);
    if (pending) return pending.promise;
    let live;
    let context;
    try { live = read(); context = binding(live); }
    catch { return safeStatic("invalid-owner-state"); }
    interrupt();
    const ticket = sequence;
    if (live.status !== "error" || live.disposed) return staticState("not-applicable", live, context);
    if (typeof generate !== "function") return staticState("unavailable", live, context);
    const controller = new AbortController();
    staticState(null, live, context, "pending");
    const input = Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      registryVersion: REGISTRY_VERSION,
      componentVersions: COMPONENT_VERSIONS,
      requestId: context.requestId,
      stateVersion: context.stateVersion,
      expiresAfterMs: maxActionTtlMs,
      context: Object.freeze({ errorCode: live.error?.code || null, hasUsableData: live.hasUsableData, retryAllowed: authorized(live) }),
    });
    let timer;
    let abort;
    const aborted = new Promise((_, reject) => {
      abort = () => reject(Object.assign(new Error("Generation cancelled"), { code: "cancelled" }));
      controller.signal.addEventListener("abort", abort, { once: true });
    });
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error("Generation timed out"), { code: "timeout" })), timeoutMs); });
    const operation = Promise.resolve().then(() => {
      if (disposed || ticket !== sequence || controller.signal.aborted) throw Object.assign(new Error("Generation cancelled"), { code: "cancelled" });
      stats.producerCalls++;
      return generate(input, { signal: controller.signal });
    });
    const promise = (async () => {
      try {
        const serialized = await Promise.race([operation, timeout, aborted]);
        if (disposed || ticket !== sequence || controller.signal.aborted) return clone(state);
        const current = read();
        if (current.revision !== context.revision || current.status !== live.status || current.error?.code !== live.error?.code || current.error?.retryable !== live.error?.retryable) return safeStatic("stale-state");
        if (clock() >= context.expiresAt) return safeStatic("expired");
        const validated = validatePayload(serialized, { ...context, retryAllowed: authorized(current) });
        stats.validatedPayloads++;
        stats.payloadBytes += validated.measurements.payloadBytes;
        capabilities.clear();
        const expiresAt = Math.min(context.expiresAt, clock() + validated.payload.expiresAfterMs);
        state = { mode: "generated", reason: null, requestId: context.requestId, stateVersion: context.stateVersion, expiresAt, nodes: decorate(validated.payload.nodes, { ...context, expiresAt }) };
        notify();
        return clone(state);
      } catch (error) {
        if (disposed || ticket !== sequence) return clone(state);
        controller.abort();
        stats.producerFailures++;
        return safeStatic(error?.code === "timeout" ? "timeout" : error instanceof TypeError ? "invalid-payload" : "unavailable");
      } finally {
        clearTimeout(timer);
        controller.signal.removeEventListener("abort", abort);
        if (pending?.ticket === ticket) pending = null;
      }
    })();
    pending = { ticket, controller, promise };
    return promise;
  }

  function activate(token, params = {}) {
    stats.actionAttempts++;
    const capability = capabilities.get(token);
    capabilities.delete(token); // A capability is consumed before any owner call.
    if (disposed) { stats.refused++; return { status: "refused", reason: "disposed" }; }
    let live;
    let currentTime;
    try { live = read(); currentTime = clock(); }
    catch { stats.refused++; safeStatic("invalid-owner-state"); return { status: "refused", reason: "invalid-owner-state" }; }
    const validParams = params !== null && typeof params === "object" && !Array.isArray(params) && Object.getPrototypeOf(params) === Object.prototype && Object.keys(params).length === 0;
    const reason = !validParams ? "invalid-parameters" : !capability ? "unknown-or-replayed-action" : currentTime >= capability.expiresAt ? "expired" : live.revision !== capability.revision ? "stale-state" : !authorized(live) ? "not-authorized" : null;
    if (reason) { stats.refused++; safeStatic(reason); return { status: "refused", reason }; }
    interrupt();
    state = { mode: "dismissed", reason: "action-submitted", requestId: capability.requestId, stateVersion: capability.stateVersion, expiresAt: null, nodes: [] };
    notify();
    try {
      // Abort and observer callbacks run synchronously. Re-read authorization
      // after those callouts, then dispatch without another callback in between.
      const dispatchTime = clock();
      const current = read();
      const dispatchReason = disposed ? "disposed" : state.mode !== "dismissed" || state.reason !== "action-submitted" || state.requestId !== capability.requestId || state.stateVersion !== capability.stateVersion ? "stale-request" : dispatchTime >= capability.expiresAt ? "expired" : current.revision !== capability.revision ? "stale-state" : !authorized(current) ? "not-authorized" : null;
      if (dispatchReason) {
        stats.refused++;
        safeStatic(dispatchReason);
        return { status: "refused", reason: dispatchReason };
      }
      const result = retry();
      stats.activated++;
      Promise.resolve(result).catch(() => { if (!disposed) safeStatic("action-failed"); });
      return { status: "activated", action: "retryMediaRead", result };
    } catch {
      stats.refused++;
      safeStatic("action-failed");
      return { status: "refused", reason: "action-failed" };
    }
  }

  return Object.freeze({
    request, activate,
    view: () => clone(state),
    metrics: () => ({ ...stats }),
    cancel: () => safeStatic("cancelled"),
    invalidate: (reason = "state-changed") => safeStatic(typeof reason === "string" ? reason : "state-changed"),
    dismiss: () => { interrupt(); state = { mode: "dismissed", reason: "dismissed", requestId: null, stateVersion: null, expiresAt: null, nodes: [] }; notify(); return clone(state); },
    dispose: () => { disposed = true; interrupt(); state = { mode: "dismissed", reason: "disposed", requestId: null, stateVersion: null, expiresAt: null, nodes: [] }; notify(); },
  });
}
