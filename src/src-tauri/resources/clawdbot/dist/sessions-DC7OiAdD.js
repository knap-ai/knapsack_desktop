import { _ as resolveStateDir } from "./paths-CD8i0MSg.js";
import { c as normalizeAgentId } from "./session-key-D7XpmyVq.js";
import { m as resolveDefaultAgentId, r as listAgentIds } from "./agent-scope-CYXg_wTS.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { a as normalizeStoreSessionKey, i as loadSessionStore } from "./store-BGmy-Wot.js";
import { i as resolveMainSessionKey } from "./main-session-CFwamLE8.js";
import { a as resolveSessionTranscriptPath, i as resolveSessionFilePathOptions, l as resolveStorePath, n as resolveDefaultSessionStorePath, r as resolveSessionFilePath, t as resolveAgentsDirFromSessionStorePath } from "./paths-DBIQqSpZ.js";
import { t as resolveAndPersistSessionFile } from "./session-file-B_sG4I7G.js";
import "./session-key-CrIfzXHI.js";
import { t as emitSessionTranscriptUpdate } from "./transcript-events-KFgKuvkB.js";
import { n as parseSessionThreadInfo } from "./delivery-info-C75W__fH.js";
import fsSync from "node:fs";
import path from "node:path";
import fs from "node:fs/promises";
import { CURRENT_SESSION_VERSION, SessionManager } from "@mariozechner/pi-coding-agent";
//#region src/config/sessions/main-session.runtime.ts
function resolveMainSessionKeyFromConfig() {
	return resolveMainSessionKey(loadConfig());
}
//#endregion
//#region src/config/sessions/transcript.ts
function stripQuery(value) {
	const noHash = value.split("#")[0] ?? value;
	return noHash.split("?")[0] ?? noHash;
}
function extractFileNameFromMediaUrl(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const cleaned = stripQuery(trimmed);
	try {
		const parsed = new URL(cleaned);
		const base = path.basename(parsed.pathname);
		if (!base) return null;
		try {
			return decodeURIComponent(base);
		} catch {
			return base;
		}
	} catch {
		const base = path.basename(cleaned);
		if (!base || base === "/" || base === ".") return null;
		return base;
	}
}
function resolveMirroredTranscriptText(params) {
	const mediaUrls = params.mediaUrls?.filter((url) => url && url.trim()) ?? [];
	if (mediaUrls.length > 0) {
		const names = mediaUrls.map((url) => extractFileNameFromMediaUrl(url)).filter((name) => Boolean(name && name.trim()));
		if (names.length > 0) return names.join(", ");
		return "media";
	}
	const trimmed = (params.text ?? "").trim();
	return trimmed ? trimmed : null;
}
async function ensureSessionHeader(params) {
	if (fsSync.existsSync(params.sessionFile)) return;
	await fsSync.promises.mkdir(path.dirname(params.sessionFile), { recursive: true });
	const header = {
		type: "session",
		version: CURRENT_SESSION_VERSION,
		id: params.sessionId,
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		cwd: process.cwd()
	};
	await fsSync.promises.writeFile(params.sessionFile, `${JSON.stringify(header)}\n`, {
		encoding: "utf-8",
		mode: 384
	});
}
async function resolveSessionTranscriptFile(params) {
	const sessionPathOpts = resolveSessionFilePathOptions({
		agentId: params.agentId,
		storePath: params.storePath
	});
	let sessionFile = resolveSessionFilePath(params.sessionId, params.sessionEntry, sessionPathOpts);
	let sessionEntry = params.sessionEntry;
	if (params.sessionStore && params.storePath) {
		const threadIdFromSessionKey = parseSessionThreadInfo(params.sessionKey).threadId;
		const fallbackSessionFile = !sessionEntry?.sessionFile ? resolveSessionTranscriptPath(params.sessionId, params.agentId, params.threadId ?? threadIdFromSessionKey) : void 0;
		const resolvedSessionFile = await resolveAndPersistSessionFile({
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			sessionStore: params.sessionStore,
			storePath: params.storePath,
			sessionEntry,
			agentId: sessionPathOpts?.agentId,
			sessionsDir: sessionPathOpts?.sessionsDir,
			fallbackSessionFile
		});
		sessionFile = resolvedSessionFile.sessionFile;
		sessionEntry = resolvedSessionFile.sessionEntry;
	}
	return {
		sessionFile,
		sessionEntry
	};
}
async function appendAssistantMessageToSessionTranscript(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return {
		ok: false,
		reason: "missing sessionKey"
	};
	const mirrorText = resolveMirroredTranscriptText({
		text: params.text,
		mediaUrls: params.mediaUrls
	});
	if (!mirrorText) return {
		ok: false,
		reason: "empty text"
	};
	const storePath = params.storePath ?? resolveDefaultSessionStorePath(params.agentId);
	const store = loadSessionStore(storePath, { skipCache: true });
	const entry = store[normalizeStoreSessionKey(sessionKey)] ?? store[sessionKey];
	if (!entry?.sessionId) return {
		ok: false,
		reason: `unknown sessionKey: ${sessionKey}`
	};
	let sessionFile;
	try {
		sessionFile = (await resolveAndPersistSessionFile({
			sessionId: entry.sessionId,
			sessionKey,
			sessionStore: store,
			storePath,
			sessionEntry: entry,
			agentId: params.agentId,
			sessionsDir: path.dirname(storePath)
		})).sessionFile;
	} catch (err) {
		return {
			ok: false,
			reason: err instanceof Error ? err.message : String(err)
		};
	}
	await ensureSessionHeader({
		sessionFile,
		sessionId: entry.sessionId
	});
	const existingMessageId = params.idempotencyKey ? await transcriptHasIdempotencyKey(sessionFile, params.idempotencyKey) : void 0;
	if (existingMessageId) return {
		ok: true,
		sessionFile,
		messageId: existingMessageId
	};
	const message = {
		role: "assistant",
		content: [{
			type: "text",
			text: mirrorText
		}],
		api: "openai-responses",
		provider: "openclaw",
		model: "delivery-mirror",
		usage: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			cost: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				total: 0
			}
		},
		stopReason: "stop",
		timestamp: Date.now(),
		...params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : {}
	};
	const messageId = SessionManager.open(sessionFile).appendMessage(message);
	emitSessionTranscriptUpdate({
		sessionFile,
		sessionKey,
		message,
		messageId
	});
	return {
		ok: true,
		sessionFile,
		messageId
	};
}
async function transcriptHasIdempotencyKey(transcriptPath, idempotencyKey) {
	try {
		const raw = await fsSync.promises.readFile(transcriptPath, "utf-8");
		for (const line of raw.split(/\r?\n/)) {
			if (!line.trim()) continue;
			try {
				const parsed = JSON.parse(line);
				if (parsed.message?.idempotencyKey === idempotencyKey && typeof parsed.id === "string" && parsed.id) return parsed.id;
			} catch {
				continue;
			}
		}
	} catch {
		return;
	}
}
//#endregion
//#region src/agents/session-dirs.ts
function mapAgentSessionDirs(agentsDir, entries) {
	return entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(agentsDir, entry.name, "sessions")).toSorted((a, b) => a.localeCompare(b));
}
async function resolveAgentSessionDirsFromAgentsDir(agentsDir) {
	let entries = [];
	try {
		entries = await fs.readdir(agentsDir, { withFileTypes: true });
	} catch (err) {
		if (err.code === "ENOENT") return [];
		throw err;
	}
	return mapAgentSessionDirs(agentsDir, entries);
}
function resolveAgentSessionDirsFromAgentsDirSync(agentsDir) {
	let entries = [];
	try {
		entries = fsSync.readdirSync(agentsDir, { withFileTypes: true });
	} catch (err) {
		if (err.code === "ENOENT") return [];
		throw err;
	}
	return mapAgentSessionDirs(agentsDir, entries);
}
async function resolveAgentSessionDirs(stateDir) {
	return await resolveAgentSessionDirsFromAgentsDir(path.join(stateDir, "agents"));
}
//#endregion
//#region src/config/sessions/targets.ts
const NON_FATAL_DISCOVERY_ERROR_CODES = new Set([
	"EACCES",
	"ELOOP",
	"ENOENT",
	"ENOTDIR",
	"EPERM",
	"ESTALE"
]);
function dedupeTargetsByStorePath(targets) {
	const deduped = /* @__PURE__ */ new Map();
	for (const target of targets) if (!deduped.has(target.storePath)) deduped.set(target.storePath, target);
	return [...deduped.values()];
}
function shouldSkipDiscoveryError(err) {
	const code = err?.code;
	return typeof code === "string" && NON_FATAL_DISCOVERY_ERROR_CODES.has(code);
}
function isWithinRoot(realPath, realRoot) {
	return realPath === realRoot || realPath.startsWith(`${realRoot}${path.sep}`);
}
function shouldSkipDiscoveredAgentDirName(dirName, agentId) {
	return agentId === "main" && dirName.trim().toLowerCase() !== "main";
}
function resolveValidatedDiscoveredStorePathSync(params) {
	const storePath = path.join(params.sessionsDir, "sessions.json");
	try {
		const stat = fsSync.lstatSync(storePath);
		if (stat.isSymbolicLink() || !stat.isFile()) return;
		const realStorePath = fsSync.realpathSync.native(storePath);
		return isWithinRoot(realStorePath, params.realAgentsRoot ?? fsSync.realpathSync.native(params.agentsRoot)) ? realStorePath : void 0;
	} catch (err) {
		if (shouldSkipDiscoveryError(err)) return;
		throw err;
	}
}
async function resolveValidatedDiscoveredStorePath(params) {
	const storePath = path.join(params.sessionsDir, "sessions.json");
	try {
		const stat = await fs.lstat(storePath);
		if (stat.isSymbolicLink() || !stat.isFile()) return;
		const realStorePath = await fs.realpath(storePath);
		return isWithinRoot(realStorePath, params.realAgentsRoot ?? await fs.realpath(params.agentsRoot)) ? realStorePath : void 0;
	} catch (err) {
		if (shouldSkipDiscoveryError(err)) return;
		throw err;
	}
}
function resolveSessionStoreDiscoveryState(cfg, env) {
	const configuredTargets = resolveSessionStoreTargets(cfg, { allAgents: true }, { env });
	const agentsRoots = /* @__PURE__ */ new Set();
	for (const target of configuredTargets) {
		const agentsDir = resolveAgentsDirFromSessionStorePath(target.storePath);
		if (agentsDir) agentsRoots.add(agentsDir);
	}
	agentsRoots.add(path.join(resolveStateDir(env), "agents"));
	return {
		configuredTargets,
		agentsRoots: [...agentsRoots]
	};
}
function toDiscoveredSessionStoreTarget(sessionsDir, storePath) {
	const dirName = path.basename(path.dirname(sessionsDir));
	const agentId = normalizeAgentId(dirName);
	if (shouldSkipDiscoveredAgentDirName(dirName, agentId)) return;
	return {
		agentId,
		storePath
	};
}
function resolveAllAgentSessionStoreTargetsSync(cfg, params = {}) {
	const { configuredTargets, agentsRoots } = resolveSessionStoreDiscoveryState(cfg, params.env ?? process.env);
	const realAgentsRoots = /* @__PURE__ */ new Map();
	const getRealAgentsRoot = (agentsRoot) => {
		const cached = realAgentsRoots.get(agentsRoot);
		if (cached !== void 0) return cached;
		try {
			const realAgentsRoot = fsSync.realpathSync.native(agentsRoot);
			realAgentsRoots.set(agentsRoot, realAgentsRoot);
			return realAgentsRoot;
		} catch (err) {
			if (shouldSkipDiscoveryError(err)) return;
			throw err;
		}
	};
	const validatedConfiguredTargets = configuredTargets.flatMap((target) => {
		const agentsRoot = resolveAgentsDirFromSessionStorePath(target.storePath);
		if (!agentsRoot) return [target];
		const realAgentsRoot = getRealAgentsRoot(agentsRoot);
		if (!realAgentsRoot) return [];
		const validatedStorePath = resolveValidatedDiscoveredStorePathSync({
			sessionsDir: path.dirname(target.storePath),
			agentsRoot,
			realAgentsRoot
		});
		return validatedStorePath ? [{
			...target,
			storePath: validatedStorePath
		}] : [];
	});
	const discoveredTargets = agentsRoots.flatMap((agentsDir) => {
		try {
			const realAgentsRoot = getRealAgentsRoot(agentsDir);
			if (!realAgentsRoot) return [];
			return resolveAgentSessionDirsFromAgentsDirSync(agentsDir).flatMap((sessionsDir) => {
				const validatedStorePath = resolveValidatedDiscoveredStorePathSync({
					sessionsDir,
					agentsRoot: agentsDir,
					realAgentsRoot
				});
				const target = validatedStorePath ? toDiscoveredSessionStoreTarget(sessionsDir, validatedStorePath) : void 0;
				return target ? [target] : [];
			});
		} catch (err) {
			if (shouldSkipDiscoveryError(err)) return [];
			throw err;
		}
	});
	return dedupeTargetsByStorePath([...validatedConfiguredTargets, ...discoveredTargets]);
}
async function resolveAllAgentSessionStoreTargets(cfg, params = {}) {
	const { configuredTargets, agentsRoots } = resolveSessionStoreDiscoveryState(cfg, params.env ?? process.env);
	const realAgentsRoots = /* @__PURE__ */ new Map();
	const getRealAgentsRoot = async (agentsRoot) => {
		const cached = realAgentsRoots.get(agentsRoot);
		if (cached !== void 0) return cached;
		try {
			const realAgentsRoot = await fs.realpath(agentsRoot);
			realAgentsRoots.set(agentsRoot, realAgentsRoot);
			return realAgentsRoot;
		} catch (err) {
			if (shouldSkipDiscoveryError(err)) return;
			throw err;
		}
	};
	const validatedConfiguredTargets = (await Promise.all(configuredTargets.map(async (target) => {
		const agentsRoot = resolveAgentsDirFromSessionStorePath(target.storePath);
		if (!agentsRoot) return target;
		const realAgentsRoot = await getRealAgentsRoot(agentsRoot);
		if (!realAgentsRoot) return;
		const validatedStorePath = await resolveValidatedDiscoveredStorePath({
			sessionsDir: path.dirname(target.storePath),
			agentsRoot,
			realAgentsRoot
		});
		return validatedStorePath ? {
			...target,
			storePath: validatedStorePath
		} : void 0;
	}))).filter((target) => Boolean(target));
	const discoveredTargets = (await Promise.all(agentsRoots.map(async (agentsDir) => {
		try {
			const realAgentsRoot = await getRealAgentsRoot(agentsDir);
			if (!realAgentsRoot) return [];
			const sessionsDirs = await resolveAgentSessionDirsFromAgentsDir(agentsDir);
			return (await Promise.all(sessionsDirs.map(async (sessionsDir) => {
				const validatedStorePath = await resolveValidatedDiscoveredStorePath({
					sessionsDir,
					agentsRoot: agentsDir,
					realAgentsRoot
				});
				return validatedStorePath ? toDiscoveredSessionStoreTarget(sessionsDir, validatedStorePath) : void 0;
			}))).filter((target) => Boolean(target));
		} catch (err) {
			if (shouldSkipDiscoveryError(err)) return [];
			throw err;
		}
	}))).flat();
	return dedupeTargetsByStorePath([...validatedConfiguredTargets, ...discoveredTargets]);
}
function resolveSessionStoreTargets(cfg, opts, params = {}) {
	const env = params.env ?? process.env;
	const defaultAgentId = resolveDefaultAgentId(cfg);
	const hasAgent = Boolean(opts.agent?.trim());
	const allAgents = opts.allAgents === true;
	if (hasAgent && allAgents) throw new Error("--agent and --all-agents cannot be used together");
	if (opts.store && (hasAgent || allAgents)) throw new Error("--store cannot be combined with --agent or --all-agents");
	if (opts.store) return [{
		agentId: defaultAgentId,
		storePath: resolveStorePath(opts.store, {
			agentId: defaultAgentId,
			env
		})
	}];
	if (allAgents) return dedupeTargetsByStorePath(listAgentIds(cfg).map((agentId) => ({
		agentId,
		storePath: resolveStorePath(cfg.session?.store, {
			agentId,
			env
		})
	})));
	if (hasAgent) {
		const knownAgents = listAgentIds(cfg);
		const requested = normalizeAgentId(opts.agent ?? "");
		if (!knownAgents.includes(requested)) throw new Error(`Unknown agent id "${opts.agent}". Use "openclaw agents list" to see configured agents.`);
		return [{
			agentId: requested,
			storePath: resolveStorePath(cfg.session?.store, {
				agentId: requested,
				env
			})
		}];
	}
	return [{
		agentId: defaultAgentId,
		storePath: resolveStorePath(cfg.session?.store, {
			agentId: defaultAgentId,
			env
		})
	}];
}
//#endregion
export { appendAssistantMessageToSessionTranscript as a, resolveMainSessionKeyFromConfig as c, resolveAgentSessionDirs as i, resolveAllAgentSessionStoreTargetsSync as n, resolveMirroredTranscriptText as o, resolveSessionStoreTargets as r, resolveSessionTranscriptFile as s, resolveAllAgentSessionStoreTargets as t };
