import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-D-iPIX3C.js";
import { n as callGateway } from "./call-FZUZ5EU4.js";
import { n as withProgress } from "./progress-C4IJwa0T.js";

//#region src/cli/nodes-cli/format.ts
function parsePairingList(value) {
	const obj = typeof value === "object" && value !== null ? value : {};
	return {
		pending: Array.isArray(obj.pending) ? obj.pending : [],
		paired: Array.isArray(obj.paired) ? obj.paired : []
	};
}
function parseNodeList(value) {
	const obj = typeof value === "object" && value !== null ? value : {};
	return Array.isArray(obj.nodes) ? obj.nodes : [];
}
function formatPermissions(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const entries = Object.entries(raw).map(([key, value]) => [String(key).trim(), value === true]).filter(([key]) => key.length > 0).toSorted((a, b) => a[0].localeCompare(b[0]));
	if (entries.length === 0) return null;
	return `[${entries.map(([key, granted]) => `${key}=${granted ? "yes" : "no"}`).join(", ")}]`;
}

//#endregion
//#region src/cli/nodes-cli/rpc.ts
const nodesCallOpts = (cmd, defaults) => cmd.option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--timeout <ms>", "Timeout in ms", String(defaults?.timeoutMs ?? 1e4)).option("--json", "Output JSON", false);
const callGatewayCli = async (method, opts, params) => withProgress({
	label: `Nodes ${method}`,
	indeterminate: true,
	enabled: opts.json !== true
}, async () => await callGateway({
	url: opts.url,
	token: opts.token,
	method,
	params,
	timeoutMs: Number(opts.timeout ?? 1e4),
	clientName: GATEWAY_CLIENT_NAMES.CLI,
	mode: GATEWAY_CLIENT_MODES.CLI
}));
function unauthorizedHintForMessage(message) {
	const haystack = message.toLowerCase();
	if (haystack.includes("unauthorizedclient") || haystack.includes("bridge client is not authorized") || haystack.includes("unsigned bridge clients are not allowed")) return [
		"peekaboo bridge rejected the client.",
		"sign the peekaboo CLI (TeamID Y5PE65HELJ) or launch the host with",
		"PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1 for local dev."
	].join(" ");
	return null;
}
function normalizeNodeKey(value) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
}
async function resolveNodeId(opts, query) {
	const q = String(query ?? "").trim();
	if (!q) throw new Error("node required");
	let nodes = [];
	try {
		nodes = parseNodeList(await callGatewayCli("node.list", opts, {}));
	} catch {
		const { paired } = parsePairingList(await callGatewayCli("node.pair.list", opts, {}));
		nodes = paired.map((n) => ({
			nodeId: n.nodeId,
			displayName: n.displayName,
			platform: n.platform,
			version: n.version,
			remoteIp: n.remoteIp
		}));
	}
	const qNorm = normalizeNodeKey(q);
	const matches = nodes.filter((n) => {
		if (n.nodeId === q) return true;
		if (typeof n.remoteIp === "string" && n.remoteIp === q) return true;
		const name = typeof n.displayName === "string" ? n.displayName : "";
		if (name && normalizeNodeKey(name) === qNorm) return true;
		if (q.length >= 6 && n.nodeId.startsWith(q)) return true;
		return false;
	});
	if (matches.length === 1) return matches[0].nodeId;
	if (matches.length === 0) {
		const known = nodes.map((n) => n.displayName || n.remoteIp || n.nodeId).filter(Boolean).join(", ");
		throw new Error(`unknown node: ${q}${known ? ` (known: ${known})` : ""}`);
	}
	throw new Error(`ambiguous node: ${q} (matches: ${matches.map((n) => n.displayName || n.remoteIp || n.nodeId).join(", ")})`);
}

//#endregion
export { formatPermissions as a, unauthorizedHintForMessage as i, nodesCallOpts as n, parseNodeList as o, resolveNodeId as r, parsePairingList as s, callGatewayCli as t };