import { _ as resolveStateDir } from "./paths-Dvv9VRAc.js";
import { t as requireNodeSqlite } from "./node-sqlite-Vqjevi9y.js";
import process$1 from "node:process";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { HttpsProxyAgent } from "https-proxy-agent";
import { gunzipSync, gzipSync } from "node:zlib";
//#region src/proxy-capture/paths.ts
function resolveDebugProxyRootDir(env = process.env) {
	return path.join(resolveStateDir(env), "debug-proxy");
}
function resolveDebugProxyDbPath(env = process.env) {
	return path.join(resolveDebugProxyRootDir(env), "capture.sqlite");
}
function resolveDebugProxyBlobDir(env = process.env) {
	return path.join(resolveDebugProxyRootDir(env), "blobs");
}
function resolveDebugProxyCertDir(env = process.env) {
	return path.join(resolveDebugProxyRootDir(env), "certs");
}
//#endregion
//#region src/proxy-capture/env.ts
const OPENCLAW_DEBUG_PROXY_ENABLED = "OPENCLAW_DEBUG_PROXY_ENABLED";
const OPENCLAW_DEBUG_PROXY_URL = "OPENCLAW_DEBUG_PROXY_URL";
const OPENCLAW_DEBUG_PROXY_DB_PATH = "OPENCLAW_DEBUG_PROXY_DB_PATH";
const OPENCLAW_DEBUG_PROXY_BLOB_DIR = "OPENCLAW_DEBUG_PROXY_BLOB_DIR";
const OPENCLAW_DEBUG_PROXY_CERT_DIR = "OPENCLAW_DEBUG_PROXY_CERT_DIR";
const OPENCLAW_DEBUG_PROXY_SESSION_ID = "OPENCLAW_DEBUG_PROXY_SESSION_ID";
const OPENCLAW_DEBUG_PROXY_REQUIRE = "OPENCLAW_DEBUG_PROXY_REQUIRE";
let cachedImplicitSessionId;
function isTruthy(value) {
	return value === "1" || value === "true" || value === "yes" || value === "on";
}
function resolveDebugProxySettings(env = process$1.env) {
	const enabled = isTruthy(env[OPENCLAW_DEBUG_PROXY_ENABLED]);
	const sessionId = (env["OPENCLAW_DEBUG_PROXY_SESSION_ID"]?.trim() || void 0) ?? (cachedImplicitSessionId ??= randomUUID());
	return {
		enabled,
		required: isTruthy(env[OPENCLAW_DEBUG_PROXY_REQUIRE]),
		proxyUrl: env["OPENCLAW_DEBUG_PROXY_URL"]?.trim() || void 0,
		dbPath: env["OPENCLAW_DEBUG_PROXY_DB_PATH"]?.trim() || resolveDebugProxyDbPath(env),
		blobDir: env["OPENCLAW_DEBUG_PROXY_BLOB_DIR"]?.trim() || resolveDebugProxyBlobDir(env),
		certDir: env["OPENCLAW_DEBUG_PROXY_CERT_DIR"]?.trim() || resolveDebugProxyCertDir(env),
		sessionId,
		sourceProcess: "openclaw"
	};
}
function applyDebugProxyEnv(env, params) {
	return {
		...env,
		[OPENCLAW_DEBUG_PROXY_ENABLED]: "1",
		[OPENCLAW_DEBUG_PROXY_REQUIRE]: "1",
		[OPENCLAW_DEBUG_PROXY_URL]: params.proxyUrl,
		[OPENCLAW_DEBUG_PROXY_DB_PATH]: params.dbPath ?? resolveDebugProxyDbPath(env),
		[OPENCLAW_DEBUG_PROXY_BLOB_DIR]: params.blobDir ?? resolveDebugProxyBlobDir(env),
		[OPENCLAW_DEBUG_PROXY_CERT_DIR]: params.certDir ?? resolveDebugProxyCertDir(env),
		[OPENCLAW_DEBUG_PROXY_SESSION_ID]: params.sessionId,
		HTTP_PROXY: params.proxyUrl,
		HTTPS_PROXY: params.proxyUrl,
		ALL_PROXY: params.proxyUrl
	};
}
function createDebugProxyWebSocketAgent(settings) {
	if (!settings.enabled || !settings.proxyUrl) return;
	return new HttpsProxyAgent(settings.proxyUrl);
}
function resolveEffectiveDebugProxyUrl(configuredProxyUrl) {
	const explicit = configuredProxyUrl?.trim();
	if (explicit) return explicit;
	const settings = resolveDebugProxySettings();
	return settings.enabled ? settings.proxyUrl : void 0;
}
//#endregion
//#region src/proxy-capture/blob-store.ts
function ensureDir(dir) {
	fs.mkdirSync(dir, { recursive: true });
}
function writeCaptureBlob(params) {
	ensureDir(params.blobDir);
	const sha256 = createHash("sha256").update(params.data).digest("hex");
	const blobId = sha256.slice(0, 24);
	const outputPath = path.join(params.blobDir, `${blobId}.bin.gz`);
	if (!fs.existsSync(outputPath)) fs.writeFileSync(outputPath, gzipSync(params.data));
	return {
		blobId,
		path: outputPath,
		encoding: "gzip",
		sizeBytes: params.data.byteLength,
		sha256,
		...params.contentType ? { contentType: params.contentType } : {}
	};
}
function readCaptureBlobText(blobPath) {
	return gunzipSync(fs.readFileSync(blobPath)).toString("utf8");
}
//#endregion
//#region src/proxy-capture/store.sqlite.ts
function ensureParentDir(filePath) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
}
function openDatabase(dbPath) {
	ensureParentDir(dbPath);
	const { DatabaseSync } = requireNodeSqlite();
	const db = new DatabaseSync(dbPath);
	db.exec("PRAGMA journal_mode = WAL");
	db.exec("PRAGMA busy_timeout = 5000");
	db.exec(`
    CREATE TABLE IF NOT EXISTS capture_sessions (
      id TEXT PRIMARY KEY,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      mode TEXT NOT NULL,
      source_scope TEXT NOT NULL,
      source_process TEXT NOT NULL,
      proxy_url TEXT,
      db_path TEXT NOT NULL,
      blob_dir TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS capture_events (
      id INTEGER PRIMARY KEY,
      session_id TEXT NOT NULL,
      ts INTEGER NOT NULL,
      source_scope TEXT NOT NULL,
      source_process TEXT NOT NULL,
      protocol TEXT NOT NULL,
      direction TEXT NOT NULL,
      kind TEXT NOT NULL,
      flow_id TEXT NOT NULL,
      method TEXT,
      host TEXT,
      path TEXT,
      status INTEGER,
      close_code INTEGER,
      content_type TEXT,
      headers_json TEXT,
      data_text TEXT,
      data_blob_id TEXT,
      data_sha256 TEXT,
      error_text TEXT,
      meta_json TEXT
    );
    CREATE INDEX IF NOT EXISTS capture_events_session_ts_idx ON capture_events(session_id, ts);
    CREATE INDEX IF NOT EXISTS capture_events_flow_idx ON capture_events(flow_id, ts);
  `);
	return db;
}
function serializeJson(value) {
	return value == null ? null : JSON.stringify(value);
}
function parseMetaJson(metaJson) {
	if (typeof metaJson !== "string" || metaJson.trim().length === 0) return null;
	try {
		const parsed = JSON.parse(metaJson);
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch {
		return null;
	}
}
function normalizeObservedValue(value) {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function sortObservedCounts(counts) {
	return [...counts.entries()].map(([value, count]) => ({
		value,
		count
	})).toSorted((left, right) => right.count - left.count || left.value.localeCompare(right.value));
}
var DebugProxyCaptureStore = class {
	constructor(dbPath, blobDir) {
		this.dbPath = dbPath;
		this.blobDir = blobDir;
		this.db = openDatabase(dbPath);
	}
	close() {
		this.db.close();
	}
	upsertSession(session) {
		this.db.prepare(`INSERT INTO capture_sessions (
          id, started_at, ended_at, mode, source_scope, source_process, proxy_url, db_path, blob_dir
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          ended_at=excluded.ended_at,
          proxy_url=excluded.proxy_url,
          source_process=excluded.source_process`).run(session.id, session.startedAt, session.endedAt ?? null, session.mode, session.sourceScope, session.sourceProcess, session.proxyUrl ?? null, session.dbPath, session.blobDir);
	}
	endSession(sessionId, endedAt = Date.now()) {
		this.db.prepare(`UPDATE capture_sessions SET ended_at = ? WHERE id = ?`).run(endedAt, sessionId);
	}
	persistPayload(data, contentType) {
		return writeCaptureBlob({
			blobDir: this.blobDir,
			data,
			contentType
		});
	}
	recordEvent(event) {
		this.db.prepare(`INSERT INTO capture_events (
          session_id, ts, source_scope, source_process, protocol, direction, kind, flow_id,
          method, host, path, status, close_code, content_type, headers_json,
          data_text, data_blob_id, data_sha256, error_text, meta_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(event.sessionId, event.ts, event.sourceScope, event.sourceProcess, event.protocol, event.direction, event.kind, event.flowId, event.method ?? null, event.host ?? null, event.path ?? null, event.status ?? null, event.closeCode ?? null, event.contentType ?? null, event.headersJson ?? null, event.dataText ?? null, event.dataBlobId ?? null, event.dataSha256 ?? null, event.errorText ?? null, event.metaJson ?? null);
	}
	listSessions(limit = 50) {
		return this.db.prepare(`SELECT
           s.id,
           s.started_at AS startedAt,
           s.ended_at AS endedAt,
           s.mode,
           s.source_process AS sourceProcess,
           s.proxy_url AS proxyUrl,
           COUNT(e.id) AS eventCount
         FROM capture_sessions s
         LEFT JOIN capture_events e ON e.session_id = s.id
         GROUP BY s.id
         ORDER BY s.started_at DESC
         LIMIT ?`).all(limit);
	}
	getSessionEvents(sessionId, limit = 500) {
		return this.db.prepare(`SELECT
           id, session_id AS sessionId, ts, source_scope AS sourceScope, source_process AS sourceProcess,
           protocol, direction, kind, flow_id AS flowId, method, host, path, status, close_code AS closeCode,
           content_type AS contentType, headers_json AS headersJson, data_text AS dataText,
           data_blob_id AS dataBlobId, data_sha256 AS dataSha256, error_text AS errorText, meta_json AS metaJson
         FROM capture_events
         WHERE session_id = ?
         ORDER BY ts DESC, id DESC
         LIMIT ?`).all(sessionId, limit);
	}
	summarizeSessionCoverage(sessionId) {
		const rows = this.db.prepare(`SELECT host, meta_json AS metaJson
         FROM capture_events
         WHERE session_id = ?`).all(sessionId);
		const providers = /* @__PURE__ */ new Map();
		const apis = /* @__PURE__ */ new Map();
		const models = /* @__PURE__ */ new Map();
		const hosts = /* @__PURE__ */ new Map();
		const localPeers = /* @__PURE__ */ new Map();
		let unlabeledEventCount = 0;
		for (const row of rows) {
			const meta = parseMetaJson(row.metaJson);
			const provider = normalizeObservedValue(meta?.provider);
			const api = normalizeObservedValue(meta?.api);
			const model = normalizeObservedValue(meta?.model);
			const host = normalizeObservedValue(row.host);
			if (!provider && !api && !model) unlabeledEventCount += 1;
			if (provider) providers.set(provider, (providers.get(provider) ?? 0) + 1);
			if (api) apis.set(api, (apis.get(api) ?? 0) + 1);
			if (model) models.set(model, (models.get(model) ?? 0) + 1);
			if (host) {
				hosts.set(host, (hosts.get(host) ?? 0) + 1);
				if (host === "127.0.0.1:11434" || host.startsWith("127.0.0.1:") || host.startsWith("localhost:")) localPeers.set(host, (localPeers.get(host) ?? 0) + 1);
			}
		}
		return {
			sessionId,
			totalEvents: rows.length,
			unlabeledEventCount,
			providers: sortObservedCounts(providers),
			apis: sortObservedCounts(apis),
			models: sortObservedCounts(models),
			hosts: sortObservedCounts(hosts),
			localPeers: sortObservedCounts(localPeers)
		};
	}
	readBlob(blobId) {
		const row = this.db.prepare(`SELECT data_blob_id AS blobId FROM capture_events WHERE data_blob_id = ? LIMIT 1`).get(blobId);
		if (!row?.blobId) return null;
		const blobPath = path.join(this.blobDir, `${row.blobId}.bin.gz`);
		return fs.existsSync(blobPath) ? readCaptureBlobText(blobPath) : null;
	}
	queryPreset(preset, sessionId) {
		const sessionWhere = sessionId ? "AND session_id = ?" : "";
		const args = sessionId ? [sessionId] : [];
		switch (preset) {
			case "double-sends": return this.db.prepare(`SELECT host, path, method, COUNT(*) AS duplicateCount
             FROM capture_events
             WHERE kind = 'request' ${sessionWhere}
             GROUP BY host, path, method, data_sha256
             HAVING COUNT(*) > 1
             ORDER BY duplicateCount DESC, host ASC`).all(...args);
			case "retry-storms": return this.db.prepare(`SELECT host, path, COUNT(*) AS errorCount
             FROM capture_events
             WHERE kind = 'response' AND status >= 429 ${sessionWhere}
             GROUP BY host, path
             HAVING COUNT(*) > 1
             ORDER BY errorCount DESC, host ASC`).all(...args);
			case "cache-busting": return this.db.prepare(`SELECT host, path, COUNT(*) AS variantCount
             FROM capture_events
             WHERE kind = 'request'
               AND (path LIKE '%?%' OR headers_json LIKE '%cache-control%' OR headers_json LIKE '%pragma%')
               ${sessionWhere}
             GROUP BY host, path
             ORDER BY variantCount DESC, host ASC`).all(...args);
			case "ws-duplicate-frames": return this.db.prepare(`SELECT host, path, COUNT(*) AS duplicateFrames
             FROM capture_events
             WHERE kind = 'ws-frame' AND direction = 'outbound' ${sessionWhere}
             GROUP BY host, path, data_sha256
             HAVING COUNT(*) > 1
             ORDER BY duplicateFrames DESC, host ASC`).all(...args);
			case "missing-ack": return this.db.prepare(`SELECT flow_id AS flowId, host, path, COUNT(*) AS outboundFrames
             FROM capture_events
             WHERE kind = 'ws-frame' AND direction = 'outbound' ${sessionWhere}
               AND flow_id NOT IN (
                 SELECT flow_id FROM capture_events
                 WHERE kind = 'ws-frame' AND direction = 'inbound' ${sessionId ? "AND session_id = ?" : ""}
               )
             GROUP BY flow_id, host, path
             ORDER BY outboundFrames DESC`).all(...sessionId ? [sessionId, sessionId] : []);
			case "error-bursts": return this.db.prepare(`SELECT host, path, COUNT(*) AS errorCount
             FROM capture_events
             WHERE kind = 'error' ${sessionWhere}
             GROUP BY host, path
             ORDER BY errorCount DESC, host ASC`).all(...args);
			default: return [];
		}
	}
	purgeAll() {
		const sessionCount = this.db.prepare(`SELECT COUNT(*) AS count FROM capture_sessions`).get().count ?? 0;
		const eventCount = this.db.prepare(`SELECT COUNT(*) AS count FROM capture_events`).get().count ?? 0;
		this.db.exec(`DELETE FROM capture_events; DELETE FROM capture_sessions;`);
		let blobs = 0;
		if (fs.existsSync(this.blobDir)) for (const entry of fs.readdirSync(this.blobDir)) {
			fs.rmSync(path.join(this.blobDir, entry), { force: true });
			blobs += 1;
		}
		return {
			sessions: sessionCount,
			events: eventCount,
			blobs
		};
	}
	deleteSessions(sessionIds) {
		const uniqueSessionIds = [...new Set(sessionIds.map((id) => id.trim()).filter(Boolean))];
		if (uniqueSessionIds.length === 0) return {
			sessions: 0,
			events: 0,
			blobs: 0
		};
		const placeholders = uniqueSessionIds.map(() => "?").join(", ");
		const blobRows = this.db.prepare(`SELECT DISTINCT data_blob_id AS blobId
         FROM capture_events
         WHERE session_id IN (${placeholders})
           AND data_blob_id IS NOT NULL`).all(...uniqueSessionIds);
		const eventCount = this.db.prepare(`SELECT COUNT(*) AS count
             FROM capture_events
             WHERE session_id IN (${placeholders})`).get(...uniqueSessionIds).count ?? 0;
		const sessionCount = this.db.prepare(`SELECT COUNT(*) AS count
             FROM capture_sessions
             WHERE id IN (${placeholders})`).get(...uniqueSessionIds).count ?? 0;
		this.db.prepare(`DELETE FROM capture_events WHERE session_id IN (${placeholders})`).run(...uniqueSessionIds);
		this.db.prepare(`DELETE FROM capture_sessions WHERE id IN (${placeholders})`).run(...uniqueSessionIds);
		const candidateBlobIds = blobRows.map((row) => row.blobId?.trim()).filter((blobId) => Boolean(blobId));
		const remainingBlobRefs = candidateBlobIds.length > 0 ? new Set(this.db.prepare(`SELECT DISTINCT data_blob_id AS blobId
                   FROM capture_events
                   WHERE data_blob_id IN (${candidateBlobIds.map(() => "?").join(", ")})
                     AND data_blob_id IS NOT NULL`).all(...candidateBlobIds).map((row) => row.blobId?.trim()).filter((blobId) => Boolean(blobId))) : /* @__PURE__ */ new Set();
		let blobs = 0;
		for (const row of blobRows) {
			const blobId = row.blobId?.trim();
			if (!blobId || remainingBlobRefs.has(blobId)) continue;
			const blobPath = path.join(this.blobDir, `${blobId}.bin.gz`);
			if (fs.existsSync(blobPath)) {
				fs.rmSync(blobPath, { force: true });
				blobs += 1;
			}
		}
		return {
			sessions: sessionCount,
			events: eventCount,
			blobs
		};
	}
};
let cachedStore = null;
let cachedKey = "";
function getDebugProxyCaptureStore(dbPath, blobDir) {
	const key = `${dbPath}:${blobDir}`;
	if (!cachedStore || cachedKey !== key) {
		cachedStore = new DebugProxyCaptureStore(dbPath, blobDir);
		cachedKey = key;
	}
	return cachedStore;
}
function closeDebugProxyCaptureStore() {
	if (!cachedStore) return;
	cachedStore.close();
	cachedStore = null;
	cachedKey = "";
}
function persistEventPayload(store, params) {
	if (params.data == null) return {};
	const buffer = Buffer.isBuffer(params.data) ? params.data : Buffer.from(params.data);
	const previewLimit = params.previewLimit ?? 8192;
	const blob = store.persistPayload(buffer, params.contentType);
	return {
		dataText: buffer.subarray(0, previewLimit).toString("utf8"),
		dataBlobId: blob.blobId,
		dataSha256: blob.sha256
	};
}
function safeJsonString(value) {
	return serializeJson(value) ?? void 0;
}
//#endregion
//#region src/proxy-capture/runtime.ts
const DEBUG_PROXY_FETCH_PATCH_KEY = Symbol.for("openclaw.debugProxy.fetchPatch");
function protocolFromUrl(rawUrl) {
	try {
		switch (new URL(rawUrl).protocol) {
			case "https:": return "https";
			case "wss:": return "wss";
			case "ws:": return "ws";
			default: return "http";
		}
	} catch {
		return "http";
	}
}
function resolveUrlString(input) {
	if (input instanceof URL) return input.toString();
	if (typeof input === "string") return input;
	if (typeof Request !== "undefined" && input instanceof Request) return input.url;
	return null;
}
function installDebugProxyGlobalFetchPatch(settings) {
	if (typeof globalThis.fetch !== "function") return;
	const patched = globalThis;
	if (patched[DEBUG_PROXY_FETCH_PATCH_KEY]) return;
	const originalFetch = globalThis.fetch.bind(globalThis);
	patched[DEBUG_PROXY_FETCH_PATCH_KEY] = { originalFetch };
	globalThis.fetch = (async (input, init) => {
		const url = resolveUrlString(input);
		try {
			const response = await originalFetch(input, init);
			if (url && /^https?:/i.test(url)) captureHttpExchange({
				url,
				method: (typeof Request !== "undefined" && input instanceof Request ? input.method : void 0) ?? init?.method ?? "GET",
				requestHeaders: (typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0) ?? init?.headers,
				requestBody: (typeof Request !== "undefined" && input instanceof Request ? input.body : void 0) ?? init?.body ?? null,
				response,
				transport: "http",
				meta: {
					captureOrigin: "global-fetch",
					source: settings.sourceProcess
				}
			});
			return response;
		} catch (error) {
			if (url && /^https?:/i.test(url)) {
				const store = getDebugProxyCaptureStore(settings.dbPath, settings.blobDir);
				const parsed = new URL(url);
				store.recordEvent({
					sessionId: settings.sessionId,
					ts: Date.now(),
					sourceScope: "openclaw",
					sourceProcess: settings.sourceProcess,
					protocol: protocolFromUrl(url),
					direction: "local",
					kind: "error",
					flowId: randomUUID(),
					method: (typeof Request !== "undefined" && input instanceof Request ? input.method : void 0) ?? init?.method ?? "GET",
					host: parsed.host,
					path: `${parsed.pathname}${parsed.search}`,
					errorText: error instanceof Error ? error.message : String(error),
					metaJson: safeJsonString({ captureOrigin: "global-fetch" })
				});
			}
			throw error;
		}
	});
}
function uninstallDebugProxyGlobalFetchPatch() {
	const patched = globalThis;
	const state = patched[DEBUG_PROXY_FETCH_PATCH_KEY];
	if (!state) return;
	globalThis.fetch = state.originalFetch;
	delete patched[DEBUG_PROXY_FETCH_PATCH_KEY];
}
function isDebugProxyGlobalFetchPatchInstalled() {
	return Boolean(globalThis[DEBUG_PROXY_FETCH_PATCH_KEY]);
}
function initializeDebugProxyCapture(mode, resolved) {
	const settings = resolved ?? resolveDebugProxySettings();
	if (!settings.enabled) return;
	getDebugProxyCaptureStore(settings.dbPath, settings.blobDir).upsertSession({
		id: settings.sessionId,
		startedAt: Date.now(),
		mode,
		sourceScope: "openclaw",
		sourceProcess: settings.sourceProcess,
		proxyUrl: settings.proxyUrl,
		dbPath: settings.dbPath,
		blobDir: settings.blobDir
	});
	installDebugProxyGlobalFetchPatch(settings);
}
function finalizeDebugProxyCapture(resolved) {
	const settings = resolved ?? resolveDebugProxySettings();
	if (!settings.enabled) return;
	getDebugProxyCaptureStore(settings.dbPath, settings.blobDir).endSession(settings.sessionId);
	uninstallDebugProxyGlobalFetchPatch();
	closeDebugProxyCaptureStore();
}
function captureHttpExchange(params) {
	const settings = resolveDebugProxySettings();
	if (!settings.enabled) return;
	const store = getDebugProxyCaptureStore(settings.dbPath, settings.blobDir);
	const flowId = params.flowId ?? randomUUID();
	const url = new URL(params.url);
	const requestPayload = persistEventPayload(store, {
		data: typeof params.requestBody === "string" || Buffer.isBuffer(params.requestBody) ? params.requestBody : null,
		contentType: params.requestHeaders instanceof Headers ? params.requestHeaders.get("content-type") ?? void 0 : params.requestHeaders?.["content-type"]
	});
	store.recordEvent({
		sessionId: settings.sessionId,
		ts: Date.now(),
		sourceScope: "openclaw",
		sourceProcess: settings.sourceProcess,
		protocol: params.transport ?? protocolFromUrl(params.url),
		direction: "outbound",
		kind: "request",
		flowId,
		method: params.method,
		host: url.host,
		path: `${url.pathname}${url.search}`,
		contentType: params.requestHeaders instanceof Headers ? params.requestHeaders.get("content-type") ?? void 0 : params.requestHeaders?.["content-type"],
		headersJson: safeJsonString(params.requestHeaders instanceof Headers ? Object.fromEntries(params.requestHeaders.entries()) : params.requestHeaders),
		metaJson: safeJsonString(params.meta),
		...requestPayload
	});
	if (!(params.response && typeof params.response.clone === "function" && typeof params.response.arrayBuffer === "function")) {
		store.recordEvent({
			sessionId: settings.sessionId,
			ts: Date.now(),
			sourceScope: "openclaw",
			sourceProcess: settings.sourceProcess,
			protocol: params.transport ?? protocolFromUrl(params.url),
			direction: "inbound",
			kind: "response",
			flowId,
			method: params.method,
			host: url.host,
			path: `${url.pathname}${url.search}`,
			status: params.response.status,
			contentType: typeof params.response.headers?.get === "function" ? params.response.headers.get("content-type") ?? void 0 : void 0,
			headersJson: params.response.headers && typeof params.response.headers.entries === "function" ? safeJsonString(Object.fromEntries(params.response.headers.entries())) : void 0,
			metaJson: safeJsonString({
				...params.meta,
				bodyCapture: "unavailable"
			})
		});
		return;
	}
	params.response.clone().arrayBuffer().then((buffer) => {
		const responsePayload = persistEventPayload(store, {
			data: Buffer.from(buffer),
			contentType: params.response.headers.get("content-type") ?? void 0
		});
		store.recordEvent({
			sessionId: settings.sessionId,
			ts: Date.now(),
			sourceScope: "openclaw",
			sourceProcess: settings.sourceProcess,
			protocol: params.transport ?? protocolFromUrl(params.url),
			direction: "inbound",
			kind: "response",
			flowId,
			method: params.method,
			host: url.host,
			path: `${url.pathname}${url.search}`,
			status: params.response.status,
			contentType: params.response.headers.get("content-type") ?? void 0,
			headersJson: safeJsonString(Object.fromEntries(params.response.headers.entries())),
			metaJson: safeJsonString(params.meta),
			...responsePayload
		});
	}).catch((error) => {
		store.recordEvent({
			sessionId: settings.sessionId,
			ts: Date.now(),
			sourceScope: "openclaw",
			sourceProcess: settings.sourceProcess,
			protocol: params.transport ?? protocolFromUrl(params.url),
			direction: "local",
			kind: "error",
			flowId,
			method: params.method,
			host: url.host,
			path: `${url.pathname}${url.search}`,
			errorText: error instanceof Error ? error.message : String(error)
		});
	});
}
function captureWsEvent(params) {
	const settings = resolveDebugProxySettings();
	if (!settings.enabled) return;
	const store = getDebugProxyCaptureStore(settings.dbPath, settings.blobDir);
	const url = new URL(params.url);
	const payload = persistEventPayload(store, {
		data: params.payload,
		contentType: "application/json"
	});
	store.recordEvent({
		sessionId: settings.sessionId,
		ts: Date.now(),
		sourceScope: "openclaw",
		sourceProcess: settings.sourceProcess,
		protocol: protocolFromUrl(params.url),
		direction: params.direction,
		kind: params.kind,
		flowId: params.flowId,
		host: url.host,
		path: `${url.pathname}${url.search}`,
		closeCode: params.closeCode,
		errorText: params.errorText,
		metaJson: safeJsonString(params.meta),
		...payload
	});
}
//#endregion
export { isDebugProxyGlobalFetchPatchInstalled as a, getDebugProxyCaptureStore as c, resolveDebugProxySettings as d, resolveEffectiveDebugProxyUrl as f, initializeDebugProxyCapture as i, applyDebugProxyEnv as l, captureWsEvent as n, DebugProxyCaptureStore as o, finalizeDebugProxyCapture as r, closeDebugProxyCaptureStore as s, captureHttpExchange as t, createDebugProxyWebSocketAgent as u };
