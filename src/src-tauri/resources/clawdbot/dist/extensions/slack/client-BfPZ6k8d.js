import { WebClient } from "@slack/web-api";
import { HttpsProxyAgent } from "https-proxy-agent";
import { resolveEnvHttpProxyUrl } from "openclaw/plugin-sdk/infra-runtime";
//#region extensions/slack/src/client.ts
const SLACK_DEFAULT_RETRY_OPTIONS = {
	retries: 2,
	factor: 2,
	minTimeout: 500,
	maxTimeout: 3e3,
	randomize: true
};
const SLACK_WRITE_RETRY_OPTIONS = { retries: 0 };
/**
* Check whether a hostname is excluded from proxying by `NO_PROXY` / `no_proxy`.
* Supports comma-separated entries with optional leading dots (e.g. `.slack.com`).
*/
function isHostExcludedByNoProxy(hostname, env = process.env) {
	const raw = env.no_proxy ?? env.NO_PROXY;
	if (!raw) return false;
	const entries = raw.split(/[,\s]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
	const lower = hostname.toLowerCase();
	for (const entry of entries) {
		if (entry === "*") return true;
		const bare = entry.startsWith("*.") ? entry.slice(2) : entry.startsWith(".") ? entry.slice(1) : entry;
		if (lower === bare || lower.endsWith(`.${bare}`)) return true;
	}
	return false;
}
/**
* Build an HTTPS proxy agent from env vars (HTTPS_PROXY, HTTP_PROXY, etc.)
* for use as the `agent` option in Slack WebClient and Socket Mode connections.
*
* When set, this agent is forwarded through @slack/bolt → @slack/socket-mode →
* SlackWebSocket as the `httpAgent`, which the `ws` library uses to tunnel the
* WebSocket upgrade request through the proxy.  This fixes Socket Mode in
* environments where outbound traffic must go through an HTTP CONNECT proxy.
*
* Respects `NO_PROXY` / `no_proxy` — if `*.slack.com` (or a matching pattern)
* appears in the exclusion list, returns `undefined` so the connection is direct.
*
* Returns `undefined` when no proxy env var is configured or when Slack hosts
* are excluded by `NO_PROXY`.
*/
function resolveSlackProxyAgent() {
	const proxyUrl = resolveEnvHttpProxyUrl("https");
	if (!proxyUrl) return;
	if (isHostExcludedByNoProxy("slack.com")) return;
	try {
		return new HttpsProxyAgent(proxyUrl);
	} catch {
		return;
	}
}
function resolveSlackWebClientOptions(options = {}) {
	return {
		...options,
		agent: options.agent ?? resolveSlackProxyAgent(),
		retryConfig: options.retryConfig ?? SLACK_DEFAULT_RETRY_OPTIONS
	};
}
function resolveSlackWriteClientOptions(options = {}) {
	return {
		...options,
		agent: options.agent ?? resolveSlackProxyAgent(),
		retryConfig: options.retryConfig ?? SLACK_WRITE_RETRY_OPTIONS
	};
}
function createSlackWebClient(token, options = {}) {
	return new WebClient(token, resolveSlackWebClientOptions(options));
}
function createSlackWriteClient(token, options = {}) {
	return new WebClient(token, resolveSlackWriteClientOptions(options));
}
//#endregion
export { resolveSlackWebClientOptions as a, createSlackWriteClient as i, SLACK_WRITE_RETRY_OPTIONS as n, resolveSlackWriteClientOptions as o, createSlackWebClient as r, SLACK_DEFAULT_RETRY_OPTIONS as t };
