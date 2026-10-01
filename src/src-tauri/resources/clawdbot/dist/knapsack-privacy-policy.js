import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

// Read for every inference attempt, including fallback and compaction. Never
// accept a gateway/model setting as authority to weaken the desktop policy.
export function readDesktopPrivacyPolicy() {
  try {
    const policy = JSON.parse(readFileSync(join(homedir(), ".knapsack", "privacy-mode.json"), "utf8"));
    if (typeof policy.enabled !== "boolean" || ![1, 2].includes(policy.version)) throw new Error("invalid policy");
    return policy;
  } catch (error) {
    if (error?.code === "ENOENT") return { enabled: false };
    return { enabled: true, mode: "local-only" };
  }
}
export function authorizeDesktopModel(model, apiKey, policy = readDesktopPrivacyPolicy()) {
  if (!policy.enabled) return model;
  const reject = () => { throw new Error("Privacy Mode blocked this inference route. Choose an eligible zero-retention connection or on-device Ollama in Privacy settings."); };
  let url;
  try { url = new URL(model.baseUrl); } catch { return reject(); }
  if (url.username || url.password) return reject();
  if (model.provider === "ollama" && url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) && !String(model.id).split(/[:/]/).some(part => part.toLowerCase() === "cloud")) return model;
  if (policy.mode !== "zero-retention" || url.protocol !== "https:" || (url.port && url.port !== "443")) return reject();
  if (model.provider === "trustedrouter" && url.hostname === "api.trustedrouter.com") {
    // Keep the payload and provider model selection consistent. Selection must
    // use the hard-floor alias; never silently send an ordinary auto route.
    if (!["zdr", "trustedrouter/zdr"].includes(model.id)) return reject();
    return { ...model, id: "trustedrouter/zdr" };
  }
  if (model.provider === "groq" && url.hostname === "api.groq.com" && typeof apiKey === "string" && apiKey.trim() && !String(model.id).toLowerCase().includes("compound")) {
    const fingerprint = createHash("sha256").update(apiKey.trim()).digest("hex");
    if (policy.groq_zdr_fingerprint === fingerprint) return model;
  }
  return reject();
}
export function withDesktopPrivacy(streamFn, resolveKey = () => undefined, readPolicy = readDesktopPrivacyPolicy) {
  return (model, context, options) => {
    const approved = authorizeDesktopModel(model, options?.apiKey ?? resolveKey(model.provider), readPolicy());
    return streamFn(approved, context, options);
  };
}

// Last-mile guard: validate the actual endpoint, authorization and payload,
// including SDK retries. Model metadata alone is insufficient after transforms.
export function authorizeDesktopRequest(model, url, headers, body, policy = readDesktopPrivacyPolicy()) {
  if (!policy.enabled) return;
  let payload;
  try { payload = JSON.parse(body); } catch { throw new Error("Privacy Mode requires an inspectable inference request"); }
  if (typeof payload.model !== "string") throw new Error("Privacy Mode requires an explicit inference model");
  const auth = new Headers(headers).get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const approved = authorizeDesktopModel({ ...model, baseUrl: url, id: payload.model }, key, policy);
  if (approved.id !== payload.model) throw new Error("Privacy Mode requires the exact TrustedRouter ZDR route in the request");
}

export function requireStandardPrivacyMode(feature) {
  if (readDesktopPrivacyPolicy().enabled) throw new Error(`Privacy Mode: ${feature} has no approved private route. Use desktop voice or an eligible chat model instead.`);
}
