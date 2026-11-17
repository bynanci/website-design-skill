/** Synthetic, read-only service boundary. No network, filesystem or native calls. */
export class MediaServiceError extends Error {
  constructor(code) {
    const messages = {
      unavailable: "The media list is temporarily unavailable.",
      permission_denied: "This session does not have permission to read the media list.",
      invalid_response: "The media service returned an invalid response.",
    };
    super(messages[code] || messages.unavailable);
    this.name = "MediaServiceError";
    this.code = Object.hasOwn(messages, code) ? code : "unavailable";
    this.retryable = this.code === "unavailable";
  }
}

const fixtureItems = [
  { id: "clip-1", name: "Harbor arrival", duration: "00:12" },
  { id: "clip-2", name: "Evening walk", duration: "00:18" },
  { id: "clip-3", name: "Family conversation", duration: "00:24" },
];

function aborted() {
  return new DOMException("The request was cancelled.", "AbortError");
}

function defaultSource({ signal, filter }) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(aborted()); return; }
    const abort = () => { clearTimeout(timer); reject(aborted()); };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve({ items: fixtureItems.filter(item => item.name.toLowerCase().includes(filter.toLowerCase())), partial: false });
    }, 150);
    signal.addEventListener("abort", abort, { once: true });
  });
}

let source = defaultSource;

/** Configure only a trusted local fixture source before a test or mount. */
export function configureMediaSource(nextSource = defaultSource) {
  if (typeof nextSource !== "function") throw new TypeError("A media source function is required.");
  source = nextSource;
}

export function listMedia(request) {
  let response;
  try { response = source(request); }
  catch (error) { return Promise.reject(error); }
  return Promise.resolve(response).then(result => {
    if (!result || !Array.isArray(result.items) || typeof result.partial !== "boolean"
      || result.items.some(item => !item || typeof item.id !== "string" || typeof item.name !== "string" || typeof item.duration !== "string")
      || new Set(result.items.map(item => item.id)).size !== result.items.length) {
      throw new MediaServiceError("invalid_response");
    }
    return { items: result.items.map(item => ({ id: item.id, name: item.name, duration: item.duration })), partial: result.partial };
  });
}

/** Deferred read adapter for deterministic transition tests and browser evidence. */
export function createDeferredMediaSource({ respectAbort = true } = {}) {
  let sequence = 0;
  const requests = [];
  const pending = new Map();
  const deferredSource = request => new Promise((resolve, reject) => {
    const record = { id: ++sequence, filter: request.filter, aborted: request.signal.aborted, settled: false };
    requests.push(record);
    const abort = () => {
      record.aborted = true;
      if (respectAbort) finish(false, aborted());
    };
    const finish = (ok, value) => {
      if (record.settled) throw new Error("Request already settled.");
      record.settled = true;
      request.signal.removeEventListener("abort", abort);
      pending.delete(record.id);
      if (ok) resolve(value); else reject(value);
    };
    pending.set(record.id, finish);
    request.signal.addEventListener("abort", abort, { once: true });
    if (request.signal.aborted) abort();
  });
  return {
    source: deferredSource,
    requests: () => requests.map(record => ({ ...record })),
    pending: () => [...pending.keys()],
    resolve: (id, result) => {
      if (!pending.has(id)) throw new Error("Unknown or settled request.");
      pending.get(id)(true, result);
    },
    reject: (id, code = "unavailable") => {
      if (!pending.has(id)) throw new Error("Unknown or settled request.");
      pending.get(id)(false, new MediaServiceError(code));
    },
  };
}
