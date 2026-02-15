import { extractErrorCode, formatErrorMessage } from "../infra/errors.js";
import { loadConfig } from "../config/config.js";
import { formatCliCommand } from "../cli/command-format.js";
import { resolveBrowserConfig } from "./config.js";
let cachedConfigToken = undefined;
function getBrowserControlToken() {
    const env = process.env.CLAWDBOT_BROWSER_CONTROL_TOKEN?.trim();
    if (env)
        return env;
    if (cachedConfigToken !== undefined)
        return cachedConfigToken;
    try {
        const cfg = loadConfig();
        const resolved = resolveBrowserConfig(cfg.browser);
        const token = resolved.controlToken?.trim() || "";
        cachedConfigToken = token ? token : null;
    }
    catch {
        cachedConfigToken = null;
    }
    return cachedConfigToken;
}
function unwrapCause(err) {
    if (!err || typeof err !== "object")
        return null;
    const cause = err.cause;
    return cause ?? null;
}
function enhanceBrowserFetchError(url, err, timeoutMs) {
    const cause = unwrapCause(err);
    const code = extractErrorCode(cause) ?? extractErrorCode(err) ?? "";
    const msg = formatErrorMessage(err);
    const hint = `Start (or restart) the Clawdbot gateway (Clawdbot.app menubar, or \`${formatCliCommand("clawdbot gateway")}\`) and try again.`;
    if (code === "ECONNREFUSED") {
        return new Error(`Can't reach the clawd browser control server at ${url} (connection refused). ${hint}`);
    }
    if (code === "ETIMEDOUT" || code === "UND_ERR_CONNECT_TIMEOUT") {
        return new Error(`Can't reach the clawd browser control server at ${url} (timed out after ${timeoutMs}ms). ${hint}`);
    }
    if (msg.toLowerCase().includes("abort")) {
        return new Error(`Can't reach the clawd browser control server at ${url} (timed out after ${timeoutMs}ms). ${hint}`);
    }
    // Detect SSL/TLS certificate errors
    if (msg.toLowerCase().includes("cert") || msg.toLowerCase().includes("ssl") || msg.toLowerCase().includes("tls") || code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" || code === "CERT_HAS_EXPIRED" || code === "ERR_TLS_CERT_ALTNAME_INVALID" || code === "DEPTH_ZERO_SELF_SIGNED_CERT" || code === "SELF_SIGNED_CERT_IN_CHAIN") {
        return new Error(`Can't reach the clawd browser control server at ${url} (SSL/TLS certificate error: ${msg}). If using a local server, ensure it is configured for HTTP or set NODE_TLS_REJECT_UNAUTHORIZED=0 for development.`);
    }
    return new Error(`Can't reach the clawd browser control server at ${url}. ${hint} (${msg})`);
}
export async function fetchBrowserJson(url, init) {
    const timeoutMs = init?.timeoutMs ?? 5000;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    let res;
    try {
        const token = getBrowserControlToken();
        const mergedHeaders = (() => {
            if (!token)
                return init?.headers;
            const h = new Headers(init?.headers ?? {});
            if (!h.has("Authorization")) {
                h.set("Authorization", `Bearer ${token}`);
            }
            return h;
        })();
        res = await fetch(url, {
            ...init,
            ...(mergedHeaders ? { headers: mergedHeaders } : {}),
            signal: ctrl.signal,
        });
    }
    catch (err) {
        throw enhanceBrowserFetchError(url, err, timeoutMs);
    }
    finally {
        clearTimeout(t);
    }
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text ? `${res.status}: ${text}` : `HTTP ${res.status}`);
    }
    return (await res.json());
}
