/** Parse untrusted JSON data. No templates, URLs, commands or code are evaluated. */
export const SCHEMA_VERSION = "ui-panel/0.1";
export const REGISTRY_VERSION = "media-recovery/0.1";
export const COMPONENT_VERSIONS = Object.freeze({ Group: "1", Notice: "1", ActionButton: "1" });
export const LIMITS = Object.freeze({ payloadBytes: 8192, nodes: 32, depth: 4, children: 8, textBytes: 4096, expiryMs: 60000 });
const encoder = new TextEncoder();
const fail = message => { throw new TypeError(`Invalid recovery payload: ${message}`); };
const object = value => value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
function exact(value, keys, name) {
  if (!object(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) fail(`${name} properties`);
}
function string(value, max, name) {
  if (typeof value !== "string" || !value.length || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) fail(`${name} text`);
  return value;
}

export function validatePayload(serialized, expected) {
  if (typeof serialized !== "string") fail("a serialized JSON string is required");
  // UTF-8 bytes cannot be fewer than the UTF-16 code units in this string.
  // Refuse clearly oversized input before allocating its encoded copy.
  if (serialized.length > LIMITS.payloadBytes) fail("payload size");
  const payloadBytes = encoder.encode(serialized).length;
  if (payloadBytes > LIMITS.payloadBytes) fail("payload size");
  let payload;
  try { payload = JSON.parse(serialized); }
  catch { fail("JSON syntax"); }
  exact(payload, ["schemaVersion", "registryVersion", "requestId", "stateVersion", "expiresAfterMs", "nodes"], "panel");
  if (payload.schemaVersion !== SCHEMA_VERSION || payload.registryVersion !== REGISTRY_VERSION) fail("version negotiation");
  string(payload.requestId, 80, "requestId");
  string(payload.stateVersion, 80, "stateVersion");
  if (!/^[A-Za-z0-9_-]+$/.test(payload.requestId) || !/^media-state-[0-9]+$/.test(payload.stateVersion)) fail("binding format");
  if (!expected || payload.requestId !== expected.requestId || payload.stateVersion !== expected.stateVersion) fail("request/state binding");
  if (!Number.isSafeInteger(payload.expiresAfterMs) || payload.expiresAfterMs < 1 || payload.expiresAfterMs > LIMITS.expiryMs) fail("expiry budget");
  if (!Array.isArray(payload.nodes) || payload.nodes.length < 1 || payload.nodes.length > LIMITS.children) fail("root node count");
  let count = 0;
  let textBytes = 0;
  const addText = (value, max, name) => {
    string(value, max, name);
    textBytes += encoder.encode(value).length;
    if (textBytes > LIMITS.textBytes) fail("total text budget");
  };
  const visit = (node, depth) => {
    if (++count > LIMITS.nodes || depth > LIMITS.depth) fail("tree budget");
    if (!object(node) || !Object.hasOwn(node, "type") || !Object.hasOwn(COMPONENT_VERSIONS, node.type)) fail("component registry");
    if (node.type === "Group") {
      exact(node, ["type", "props", "children"], "Group");
      exact(node.props, ["label"], "Group props");
      addText(node.props.label, 120, "group label");
      if (!Array.isArray(node.children) || node.children.length < 1 || node.children.length > LIMITS.children) fail("group child count");
      node.children.forEach(child => visit(child, depth + 1));
    } else if (node.type === "Notice") {
      exact(node, ["type", "props"], "Notice");
      exact(node.props, ["tone", "title", "text"], "Notice props");
      if (!["info", "warning", "error"].includes(node.props.tone)) fail("notice tone");
      addText(node.props.title, 120, "notice title");
      addText(node.props.text, 1000, "notice body");
    } else {
      exact(node, ["type", "props", "action"], "ActionButton");
      exact(node.props, ["label"], "ActionButton props");
      addText(node.props.label, 80, "action label");
      exact(node.action, ["id", "params"], "action");
      exact(node.action.params, [], "retry parameters");
      if (node.action.id !== "retryMediaRead") fail("action registry");
      if (expected.retryAllowed !== true) fail("current action permission");
    }
  };
  payload.nodes.forEach(node => visit(node, 1));
  return { payload, measurements: { payloadBytes, nodes: count, textBytes } };
}
