import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { t as normalizeArrayBackedTrimmedStringList } from "./string-normalization-Cz5hTdB3.js";
import { n as createAsyncLock, o as writeJsonAtomic, r as readDurableJsonFile } from "./json-files-C6eUYM9r.js";
import { t as resolveNodePairApprovalScopes } from "./node-pairing-authz-BTHqePMo.js";
import { o as loadWorkspaceSkillEntries } from "./workspace-DjYIOmet.js";
import { t as bumpSkillsSnapshotVersion } from "./refresh-state-CW2abCyT.js";
import { t as listAgentWorkspaceDirs } from "./workspace-dirs-CL3dx6tV.js";
import { a as resolvePairingPaths, i as reconcilePendingPairingRequests, n as verifyPairingToken, o as resolveMissingRequestedScope, r as pruneExpiredPending, t as generatePairingToken } from "./pairing-token-Cv01Rz6k.js";
import { t as rejectPendingPairingRequest } from "./pairing-pending-csCQOXzS.js";
import { randomUUID } from "node:crypto";
//#region src/infra/node-pairing.ts
const PENDING_TTL_MS = 300 * 1e3;
const OPERATOR_ROLE = "operator";
const withLock = createAsyncLock();
function buildPendingNodePairingRequest(params) {
	return {
		requestId: params.requestId ?? randomUUID(),
		nodeId: params.req.nodeId,
		displayName: params.req.displayName,
		platform: params.req.platform,
		version: params.req.version,
		coreVersion: params.req.coreVersion,
		uiVersion: params.req.uiVersion,
		deviceFamily: params.req.deviceFamily,
		modelIdentifier: params.req.modelIdentifier,
		caps: normalizeArrayBackedTrimmedStringList(params.req.caps),
		commands: normalizeArrayBackedTrimmedStringList(params.req.commands),
		permissions: params.req.permissions,
		remoteIp: params.req.remoteIp,
		silent: params.req.silent,
		ts: Date.now()
	};
}
function refreshPendingNodePairingRequest(existing, incoming) {
	return {
		...existing,
		displayName: incoming.displayName ?? existing.displayName,
		platform: incoming.platform ?? existing.platform,
		version: incoming.version ?? existing.version,
		coreVersion: incoming.coreVersion ?? existing.coreVersion,
		uiVersion: incoming.uiVersion ?? existing.uiVersion,
		deviceFamily: incoming.deviceFamily ?? existing.deviceFamily,
		modelIdentifier: incoming.modelIdentifier ?? existing.modelIdentifier,
		caps: normalizeArrayBackedTrimmedStringList(incoming.caps) ?? existing.caps,
		commands: normalizeArrayBackedTrimmedStringList(incoming.commands) ?? existing.commands,
		permissions: incoming.permissions ?? existing.permissions,
		remoteIp: incoming.remoteIp ?? existing.remoteIp,
		silent: Boolean(existing.silent && incoming.silent),
		ts: Date.now()
	};
}
function resolveNodeApprovalRequiredScopes(pending) {
	return resolveNodePairApprovalScopes(Array.isArray(pending.commands) ? pending.commands : []);
}
function toPendingNodePairingEntry(pending) {
	return {
		...pending,
		requiredApproveScopes: resolveNodeApprovalRequiredScopes(pending)
	};
}
async function loadState(baseDir) {
	const { pendingPath, pairedPath } = resolvePairingPaths(baseDir, "nodes");
	const [pending, paired] = await Promise.all([readDurableJsonFile(pendingPath), readDurableJsonFile(pairedPath)]);
	const state = {
		pendingById: pending ?? {},
		pairedByNodeId: paired ?? {}
	};
	pruneExpiredPending(state.pendingById, Date.now(), PENDING_TTL_MS);
	return state;
}
async function persistState(state, baseDir) {
	const { pendingPath, pairedPath } = resolvePairingPaths(baseDir, "nodes");
	await Promise.all([writeJsonAtomic(pendingPath, state.pendingById), writeJsonAtomic(pairedPath, state.pairedByNodeId)]);
}
function normalizeNodeId(nodeId) {
	return nodeId.trim();
}
function newToken() {
	return generatePairingToken();
}
async function listNodePairing(baseDir) {
	const state = await loadState(baseDir);
	return {
		pending: Object.values(state.pendingById).toSorted((a, b) => b.ts - a.ts).map(toPendingNodePairingEntry),
		paired: Object.values(state.pairedByNodeId).toSorted((a, b) => b.approvedAtMs - a.approvedAtMs)
	};
}
async function getPairedNode(nodeId, baseDir) {
	return (await loadState(baseDir)).pairedByNodeId[normalizeNodeId(nodeId)] ?? null;
}
async function requestNodePairing(req, baseDir) {
	return await withLock(async () => {
		const state = await loadState(baseDir);
		const nodeId = normalizeNodeId(req.nodeId);
		if (!nodeId) throw new Error("nodeId required");
		const pendingForNode = Object.values(state.pendingById).filter((pending) => pending.nodeId === nodeId).toSorted((left, right) => right.ts - left.ts);
		return await reconcilePendingPairingRequests({
			pendingById: state.pendingById,
			existing: pendingForNode,
			incoming: {
				...req,
				nodeId
			},
			canRefreshSingle: () => true,
			refreshSingle: (existing, incoming) => refreshPendingNodePairingRequest(existing, incoming),
			buildReplacement: ({ existing, incoming }) => buildPendingNodePairingRequest({ req: {
				...incoming,
				silent: Boolean(incoming.silent && existing.every((pending) => pending.silent === true))
			} }),
			persist: async () => await persistState(state, baseDir)
		});
	});
}
async function approveNodePairing(requestId, options, baseDir) {
	return await withLock(async () => {
		const state = await loadState(baseDir);
		const pending = state.pendingById[requestId];
		if (!pending) return null;
		const missingScope = resolveMissingRequestedScope({
			role: OPERATOR_ROLE,
			requestedScopes: resolveNodeApprovalRequiredScopes(pending),
			allowedScopes: options.callerScopes ?? []
		});
		if (missingScope) return {
			status: "forbidden",
			missingScope
		};
		const now = Date.now();
		const existing = state.pairedByNodeId[pending.nodeId];
		const node = {
			nodeId: pending.nodeId,
			token: newToken(),
			displayName: pending.displayName,
			platform: pending.platform,
			version: pending.version,
			coreVersion: pending.coreVersion,
			uiVersion: pending.uiVersion,
			deviceFamily: pending.deviceFamily,
			modelIdentifier: pending.modelIdentifier,
			caps: pending.caps,
			commands: pending.commands,
			permissions: pending.permissions,
			remoteIp: pending.remoteIp,
			createdAtMs: existing?.createdAtMs ?? now,
			approvedAtMs: now
		};
		delete state.pendingById[requestId];
		state.pairedByNodeId[pending.nodeId] = node;
		await persistState(state, baseDir);
		return {
			requestId,
			node
		};
	});
}
async function rejectNodePairing(requestId, baseDir) {
	return await withLock(async () => {
		return await rejectPendingPairingRequest({
			requestId,
			idKey: "nodeId",
			loadState: () => loadState(baseDir),
			persistState: (state) => persistState(state, baseDir),
			getId: (pending) => pending.nodeId
		});
	});
}
async function removePairedNode(nodeId, baseDir) {
	return await withLock(async () => {
		const state = await loadState(baseDir);
		const normalized = normalizeNodeId(nodeId);
		if (!normalized || !state.pairedByNodeId[normalized]) return null;
		delete state.pairedByNodeId[normalized];
		await persistState(state, baseDir);
		return { nodeId: normalized };
	});
}
async function verifyNodeToken(nodeId, token, baseDir) {
	const state = await loadState(baseDir);
	const normalized = normalizeNodeId(nodeId);
	const node = state.pairedByNodeId[normalized];
	if (!node) return { ok: false };
	return verifyPairingToken(token, node.token) ? {
		ok: true,
		node
	} : { ok: false };
}
async function updatePairedNodeMetadata(nodeId, patch, baseDir) {
	await withLock(async () => {
		const state = await loadState(baseDir);
		const normalized = normalizeNodeId(nodeId);
		const existing = state.pairedByNodeId[normalized];
		if (!existing) return;
		const next = {
			...existing,
			displayName: patch.displayName ?? existing.displayName,
			platform: patch.platform ?? existing.platform,
			version: patch.version ?? existing.version,
			coreVersion: patch.coreVersion ?? existing.coreVersion,
			uiVersion: patch.uiVersion ?? existing.uiVersion,
			deviceFamily: patch.deviceFamily ?? existing.deviceFamily,
			modelIdentifier: patch.modelIdentifier ?? existing.modelIdentifier,
			remoteIp: patch.remoteIp ?? existing.remoteIp,
			caps: patch.caps ?? existing.caps,
			commands: patch.commands ?? existing.commands,
			bins: patch.bins ?? existing.bins,
			permissions: patch.permissions ?? existing.permissions,
			lastConnectedAtMs: patch.lastConnectedAtMs ?? existing.lastConnectedAtMs
		};
		state.pairedByNodeId[normalized] = next;
		await persistState(state, baseDir);
	});
}
async function renamePairedNode(nodeId, displayName, baseDir) {
	return await withLock(async () => {
		const state = await loadState(baseDir);
		const normalized = normalizeNodeId(nodeId);
		const existing = state.pairedByNodeId[normalized];
		if (!existing) return null;
		const trimmed = displayName.trim();
		if (!trimmed) throw new Error("displayName required");
		const next = {
			...existing,
			displayName: trimmed
		};
		state.pairedByNodeId[normalized] = next;
		await persistState(state, baseDir);
		return next;
	});
}
//#endregion
//#region src/infra/skills-remote.ts
const log = createSubsystemLogger("gateway/skills-remote");
const remoteNodes = /* @__PURE__ */ new Map();
const remoteBinProbeInflight = /* @__PURE__ */ new Map();
let remoteRegistry = null;
function describeNode(nodeId) {
	const record = remoteNodes.get(nodeId);
	const name = record?.displayName?.trim();
	const base = name && name !== nodeId ? `${name} (${nodeId})` : nodeId;
	const ip = record?.remoteIp?.trim();
	return ip ? `${base} @ ${ip}` : base;
}
function extractErrorMessage(err) {
	if (!err) return;
	if (typeof err === "string") return err;
	if (err instanceof Error) return err.message;
	if (typeof err === "object" && "message" in err && typeof err.message === "string") return err.message;
	if (typeof err === "number" || typeof err === "boolean" || typeof err === "bigint") return String(err);
	if (typeof err === "symbol") return err.toString();
	if (typeof err === "object") try {
		return JSON.stringify(err);
	} catch {
		return;
	}
}
function logRemoteBinProbeFailure(nodeId, err, context) {
	const message = extractErrorMessage(err);
	const label = describeNode(nodeId);
	const details = [
		context?.command ? `command=${context.command}` : void 0,
		typeof context?.timeoutMs === "number" ? `timeoutMs=${context.timeoutMs}` : void 0,
		typeof context?.requiredBinCount === "number" ? `requiredBins=${context.requiredBinCount}` : void 0,
		`connected=${remoteNodes.get(nodeId)?.connected === true ? "yes" : "no"}`
	].filter(Boolean).join(" ");
	if (message?.includes("node not connected") || message?.includes("node disconnected")) {
		log.info(`remote bin probe skipped: node unavailable (${label}; ${details})`);
		return;
	}
	if (message?.includes("invoke timed out") || message?.includes("timeout")) {
		log.warn(`remote bin probe timed out (${label}; ${details}); check node connectivity for ${label}`);
		return;
	}
	log.warn(`remote bin probe error (${label}; ${details}): ${message ?? "unknown"}`);
}
function isMacPlatform(platform, deviceFamily) {
	const platformNorm = normalizeLowercaseStringOrEmpty(platform);
	const familyNorm = normalizeLowercaseStringOrEmpty(deviceFamily);
	if (platformNorm.includes("mac")) return true;
	if (platformNorm.includes("darwin")) return true;
	if (familyNorm === "mac") return true;
	return false;
}
function supportsSystemRun(commands) {
	return Array.isArray(commands) && commands.includes("system.run");
}
function supportsSystemWhich(commands) {
	return Array.isArray(commands) && commands.includes("system.which");
}
function upsertNode(record) {
	const existing = remoteNodes.get(record.nodeId);
	const bins = new Set(record.bins ?? existing?.bins ?? []);
	remoteNodes.set(record.nodeId, {
		nodeId: record.nodeId,
		displayName: record.displayName ?? existing?.displayName,
		platform: record.platform ?? existing?.platform,
		deviceFamily: record.deviceFamily ?? existing?.deviceFamily,
		commands: record.commands ?? existing?.commands,
		remoteIp: record.remoteIp ?? existing?.remoteIp,
		bins,
		connected: record.connected ?? existing?.connected ?? false
	});
}
function clearRemoteNodeBins(nodeId) {
	const existing = remoteNodes.get(nodeId);
	if (!existing || existing.bins.size === 0) return false;
	existing.bins = /* @__PURE__ */ new Set();
	return true;
}
function setSkillsRemoteRegistry(registry) {
	remoteRegistry = registry;
}
async function primeRemoteSkillsCache() {
	try {
		const list = await listNodePairing();
		let sawMac = false;
		for (const node of list.paired) {
			upsertNode({
				nodeId: node.nodeId,
				displayName: node.displayName,
				platform: node.platform,
				deviceFamily: node.deviceFamily,
				commands: node.commands,
				remoteIp: node.remoteIp,
				bins: node.bins,
				connected: false
			});
			if (node.bins && node.bins.length > 0 && isMacPlatform(node.platform, node.deviceFamily) && supportsSystemRun(node.commands)) sawMac = true;
		}
		if (sawMac) bumpSkillsSnapshotVersion({ reason: "remote-node" });
	} catch (err) {
		log.warn(`failed to prime remote skills cache: ${String(err)}`);
	}
}
function recordRemoteNodeInfo(node) {
	upsertNode({
		...node,
		connected: true
	});
}
function recordRemoteNodeBins(nodeId, bins) {
	upsertNode({
		nodeId,
		bins
	});
}
function removeRemoteNodeInfo(nodeId) {
	const existing = remoteNodes.get(nodeId);
	remoteNodes.delete(nodeId);
	if (existing && isMacPlatform(existing.platform, existing.deviceFamily) && supportsSystemRun(existing.commands)) bumpSkillsSnapshotVersion({ reason: "remote-node" });
}
function collectRequiredBins(entries, targetPlatform) {
	const bins = /* @__PURE__ */ new Set();
	for (const entry of entries) {
		const os = entry.metadata?.os ?? [];
		if (os.length > 0 && !os.includes(targetPlatform)) continue;
		const required = entry.metadata?.requires?.bins ?? [];
		const anyBins = entry.metadata?.requires?.anyBins ?? [];
		for (const bin of required) if (bin.trim()) bins.add(bin.trim());
		for (const bin of anyBins) if (bin.trim()) bins.add(bin.trim());
	}
	return [...bins];
}
function buildBinProbeScript(bins) {
	return `for b in ${bins.map((bin) => `'${bin.replace(/'/g, `'\\''`)}'`).join(" ")}; do if command -v "$b" >/dev/null 2>&1; then echo "$b"; fi; done`;
}
function parseBinProbePayload(payloadJSON, payload) {
	if (!payloadJSON && !payload) return [];
	try {
		const parsed = payloadJSON ? JSON.parse(payloadJSON) : payload;
		if (Array.isArray(parsed.bins)) return parsed.bins.map((bin) => normalizeOptionalString(String(bin)) ?? "").filter(Boolean);
		if (parsed.bins && typeof parsed.bins === "object") return Object.entries(parsed.bins).filter(([, resolvedPath]) => normalizeOptionalString(resolvedPath) !== void 0).map(([bin]) => normalizeOptionalString(bin) ?? "").filter(Boolean);
		if (typeof parsed.stdout === "string") return parsed.stdout.split(/\r?\n/).map((line) => normalizeOptionalString(line) ?? "").filter(Boolean);
	} catch {
		return [];
	}
	return [];
}
function areBinSetsEqual(a, b) {
	if (!a) return false;
	if (a.size !== b.size) return false;
	for (const bin of b) if (!a.has(bin)) return false;
	return true;
}
async function refreshRemoteNodeBins(params) {
	const existing = remoteBinProbeInflight.get(params.nodeId);
	if (existing) {
		await existing;
		return;
	}
	const run = refreshRemoteNodeBinsUncoalesced(params).finally(() => {
		if (remoteBinProbeInflight.get(params.nodeId) === run) remoteBinProbeInflight.delete(params.nodeId);
	});
	remoteBinProbeInflight.set(params.nodeId, run);
	await run;
}
async function refreshRemoteNodeBinsUncoalesced(params) {
	if (!remoteRegistry) return;
	if (!isMacPlatform(params.platform, params.deviceFamily)) return;
	const canWhich = supportsSystemWhich(params.commands);
	const canRun = supportsSystemRun(params.commands);
	if (!canWhich && !canRun) return;
	const workspaceDirs = listAgentWorkspaceDirs(params.cfg);
	const requiredBins = /* @__PURE__ */ new Set();
	for (const workspaceDir of workspaceDirs) {
		const entries = loadWorkspaceSkillEntries(workspaceDir, { config: params.cfg });
		for (const bin of collectRequiredBins(entries, "darwin")) requiredBins.add(bin);
	}
	if (requiredBins.size === 0) return;
	const binsList = [...requiredBins];
	const timeoutMs = params.timeoutMs ?? 15e3;
	const command = canWhich ? "system.which" : "system.run";
	const logContext = {
		command,
		timeoutMs,
		requiredBinCount: binsList.length
	};
	try {
		const res = await remoteRegistry.invoke(canWhich ? {
			nodeId: params.nodeId,
			command,
			params: { bins: binsList },
			timeoutMs
		} : {
			nodeId: params.nodeId,
			command,
			params: { command: [
				"/bin/sh",
				"-lc",
				buildBinProbeScript(binsList)
			] },
			timeoutMs
		});
		if (!res.ok) {
			const cleared = clearRemoteNodeBins(params.nodeId);
			logRemoteBinProbeFailure(params.nodeId, res.error?.message ?? "unknown", logContext);
			if (cleared) bumpSkillsSnapshotVersion({ reason: "remote-node" });
			return;
		}
		const bins = parseBinProbePayload(res.payloadJSON, res.payload);
		const existingBins = remoteNodes.get(params.nodeId)?.bins;
		const hasChanged = !areBinSetsEqual(existingBins, new Set(bins));
		recordRemoteNodeBins(params.nodeId, bins);
		if (!hasChanged) return;
		await updatePairedNodeMetadata(params.nodeId, { bins });
		bumpSkillsSnapshotVersion({ reason: "remote-node" });
	} catch (err) {
		const cleared = clearRemoteNodeBins(params.nodeId);
		logRemoteBinProbeFailure(params.nodeId, err, logContext);
		if (cleared) bumpSkillsSnapshotVersion({ reason: "remote-node" });
	}
}
function getRemoteSkillEligibility(options) {
	const macNodes = [...remoteNodes.values()].filter((node) => node.connected && isMacPlatform(node.platform, node.deviceFamily) && supportsSystemRun(node.commands));
	if (macNodes.length === 0) return;
	const bins = /* @__PURE__ */ new Set();
	for (const node of macNodes) for (const bin of node.bins) bins.add(bin);
	const labels = macNodes.map((node) => node.displayName ?? node.nodeId).filter(Boolean);
	const note = options?.advertiseExecNode === false ? void 0 : labels.length > 0 ? `Remote macOS node available (${labels.join(", ")}). Run macOS-only skills via exec host=node on that node.` : "Remote macOS node available. Run macOS-only skills via exec host=node on that node.";
	return {
		platforms: ["darwin"],
		hasBin: (bin) => bins.has(bin),
		hasAnyBin: (required) => required.some((bin) => bins.has(bin)),
		...note ? { note } : {}
	};
}
async function refreshRemoteBinsForConnectedNodes(cfg) {
	if (!remoteRegistry) return;
	const connected = remoteRegistry.listConnected();
	for (const node of connected) await refreshRemoteNodeBins({
		nodeId: node.nodeId,
		platform: node.platform,
		deviceFamily: node.deviceFamily,
		commands: node.commands,
		cfg
	});
}
//#endregion
export { verifyNodeToken as _, refreshRemoteBinsForConnectedNodes as a, setSkillsRemoteRegistry as c, listNodePairing as d, rejectNodePairing as f, updatePairedNodeMetadata as g, requestNodePairing as h, recordRemoteNodeInfo as i, approveNodePairing as l, renamePairedNode as m, primeRemoteSkillsCache as n, refreshRemoteNodeBins as o, removePairedNode as p, recordRemoteNodeBins as r, removeRemoteNodeInfo as s, getRemoteSkillEligibility as t, getPairedNode as u };
