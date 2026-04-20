import { t as api_exports } from "./api.js";
import { resolveRequestClientIp } from "./runtime-api.js";
import { createRequire } from "node:module";
import { buildPluginConfigSchema } from "openclaw/plugin-sdk/plugin-entry";
import { z } from "openclaw/plugin-sdk/zod";
import path from "node:path";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Type } from "@sinclair/typebox";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { constants } from "node:fs";
import { chromium } from "playwright-core";
import { RegisteredCustomThemes, ResolvedThemes, ResolvingThemes, parsePatchFiles, resolveLanguage } from "@pierre/diffs";
import { preloadFileDiff, preloadMultiFileDiff } from "@pierre/diffs/ssr";
//#region extensions/diffs/src/types.ts
const DIFF_LAYOUTS = ["unified", "split"];
const DIFF_MODES = [
	"view",
	"image",
	"file",
	"both"
];
const DIFF_THEMES = ["light", "dark"];
const DIFF_INDICATORS = [
	"bars",
	"classic",
	"none"
];
const DIFF_IMAGE_QUALITY_PRESETS = [
	"standard",
	"hq",
	"print"
];
const DIFF_OUTPUT_FORMATS = ["png", "pdf"];
const DIFF_ARTIFACT_ID_PATTERN = /^[0-9a-f]{20}$/;
const DIFF_ARTIFACT_TOKEN_PATTERN = /^[0-9a-f]{48}$/;
//#endregion
//#region extensions/diffs/src/url.ts
const DEFAULT_GATEWAY_PORT = 18789;
function buildViewerUrl(params) {
	const normalizedBase = normalizeViewerBaseUrl(params.baseUrl?.trim() || resolveGatewayBaseUrl(params.config));
	const viewerPath = params.viewerPath.startsWith("/") ? params.viewerPath : `/${params.viewerPath}`;
	const parsedBase = new URL(normalizedBase);
	parsedBase.pathname = `${parsedBase.pathname === "/" ? "" : parsedBase.pathname.replace(/\/+$/, "")}${viewerPath}`;
	parsedBase.search = "";
	parsedBase.hash = "";
	return parsedBase.toString();
}
function normalizeViewerBaseUrl(raw, fieldName = "baseUrl") {
	let parsed;
	try {
		parsed = new URL(raw);
	} catch {
		throw new Error(`Invalid ${fieldName}: ${raw}`);
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error(`${fieldName} must use http or https: ${raw}`);
	if (parsed.search || parsed.hash) throw new Error(`${fieldName} must not include query/hash: ${raw}`);
	parsed.search = "";
	parsed.hash = "";
	parsed.pathname = parsed.pathname.replace(/\/+$/, "");
	return parsed.toString().replace(/\/+$/, "");
}
function resolveGatewayBaseUrl(config) {
	const scheme = config.gateway?.tls?.enabled ? "https" : "http";
	const port = typeof config.gateway?.port === "number" ? config.gateway.port : DEFAULT_GATEWAY_PORT;
	const customHost = config.gateway?.customBindHost?.trim();
	if (config.gateway?.bind === "custom" && customHost) return `${scheme}://${customHost}:${port}`;
	return `${scheme}://127.0.0.1:${port}`;
}
//#endregion
//#region extensions/diffs/src/config.ts
const DEFAULT_IMAGE_QUALITY_PROFILES = {
	standard: {
		scale: 2,
		maxWidth: 960,
		maxPixels: 8e6
	},
	hq: {
		scale: 2.5,
		maxWidth: 1200,
		maxPixels: 14e6
	},
	print: {
		scale: 3,
		maxWidth: 1400,
		maxPixels: 24e6
	}
};
const DEFAULT_DIFFS_TOOL_DEFAULTS = {
	fontFamily: "Fira Code",
	fontSize: 15,
	lineSpacing: 1.6,
	layout: "unified",
	showLineNumbers: true,
	diffIndicators: "bars",
	wordWrap: true,
	background: true,
	theme: "dark",
	fileFormat: "png",
	fileQuality: "standard",
	fileScale: DEFAULT_IMAGE_QUALITY_PROFILES.standard.scale,
	fileMaxWidth: DEFAULT_IMAGE_QUALITY_PROFILES.standard.maxWidth,
	mode: "both"
};
const DEFAULT_DIFFS_PLUGIN_SECURITY = { allowRemoteViewer: false };
const VIEWER_BASE_URL_JSON_SCHEMA = {
	type: "string",
	format: "uri",
	pattern: "^[Hh][Tt][Tt][Pp][Ss]?://",
	not: { pattern: "[?#]" }
};
const DiffsPluginJsonSchemaSource = z.strictObject({
	viewerBaseUrl: z.string().superRefine((value, ctx) => {
		try {
			normalizeViewerBaseUrl(value, "viewerBaseUrl");
		} catch (error) {
			ctx.addIssue({
				code: "custom",
				message: error instanceof Error ? error.message : "Invalid viewerBaseUrl"
			});
		}
	}).optional(),
	defaults: z.strictObject({
		fontFamily: z.string().default(DEFAULT_DIFFS_TOOL_DEFAULTS.fontFamily).optional(),
		fontSize: z.number().min(10).max(24).default(DEFAULT_DIFFS_TOOL_DEFAULTS.fontSize).optional(),
		lineSpacing: z.number().min(1).max(3).default(DEFAULT_DIFFS_TOOL_DEFAULTS.lineSpacing).optional(),
		layout: z.enum(DIFF_LAYOUTS).default(DEFAULT_DIFFS_TOOL_DEFAULTS.layout).optional(),
		showLineNumbers: z.boolean().default(DEFAULT_DIFFS_TOOL_DEFAULTS.showLineNumbers).optional(),
		diffIndicators: z.enum(DIFF_INDICATORS).default(DEFAULT_DIFFS_TOOL_DEFAULTS.diffIndicators).optional(),
		wordWrap: z.boolean().default(DEFAULT_DIFFS_TOOL_DEFAULTS.wordWrap).optional(),
		background: z.boolean().default(DEFAULT_DIFFS_TOOL_DEFAULTS.background).optional(),
		theme: z.enum(DIFF_THEMES).default(DEFAULT_DIFFS_TOOL_DEFAULTS.theme).optional(),
		fileFormat: z.enum(DIFF_OUTPUT_FORMATS).default(DEFAULT_DIFFS_TOOL_DEFAULTS.fileFormat).optional(),
		format: z.enum(DIFF_OUTPUT_FORMATS).optional(),
		fileQuality: z.enum(DIFF_IMAGE_QUALITY_PRESETS).default(DEFAULT_DIFFS_TOOL_DEFAULTS.fileQuality).optional(),
		fileScale: z.number().min(1).max(4).optional(),
		fileMaxWidth: z.number().min(640).max(2400).optional(),
		imageFormat: z.enum(DIFF_OUTPUT_FORMATS).optional(),
		imageQuality: z.enum(DIFF_IMAGE_QUALITY_PRESETS).optional(),
		imageScale: z.number().min(1).max(4).optional(),
		imageMaxWidth: z.number().min(640).max(2400).optional(),
		mode: z.enum(DIFF_MODES).default(DEFAULT_DIFFS_TOOL_DEFAULTS.mode).optional()
	}).optional(),
	security: z.strictObject({ allowRemoteViewer: z.boolean().default(DEFAULT_DIFFS_PLUGIN_SECURITY.allowRemoteViewer).optional() }).optional()
});
const diffsPluginConfigSchemaBase = buildPluginConfigSchema(DiffsPluginJsonSchemaSource, { safeParse(value) {
	if (value === void 0) return {
		success: true,
		data: void 0
	};
	const result = DiffsPluginJsonSchemaSource.safeParse(value);
	if (result.success) return {
		success: true,
		data: buildDiffsPluginConfigShape(result.data)
	};
	return {
		success: false,
		error: { issues: result.error.issues.map((issue) => ({
			path: issue.path.filter((segment) => {
				const kind = typeof segment;
				return kind === "string" || kind === "number";
			}),
			message: issue.message
		})) }
	};
} });
const diffsPluginConfigSchema = {
	...diffsPluginConfigSchemaBase,
	jsonSchema: {
		...diffsPluginConfigSchemaBase.jsonSchema,
		properties: {
			...diffsPluginConfigSchemaBase.jsonSchema.properties,
			viewerBaseUrl: VIEWER_BASE_URL_JSON_SCHEMA
		}
	}
};
function resolveConfiguredValue(options) {
	const alias = options.aliases.find((value) => value !== void 0);
	if (alias !== void 0 && options.primary === options.schemaDefault) return alias;
	return options.primary ?? alias;
}
function buildDiffsPluginConfigShape(config) {
	const viewerBaseUrl = resolveDiffsPluginViewerBaseUrl(config);
	return {
		...viewerBaseUrl !== void 0 ? { viewerBaseUrl } : {},
		...config.defaults !== void 0 ? { defaults: resolveDiffsPluginDefaults(config) } : {},
		...config.security !== void 0 ? { security: resolveDiffsPluginSecurity(config) } : {}
	};
}
function resolveDiffsPluginDefaults(config) {
	if (!config || typeof config !== "object" || Array.isArray(config)) return { ...DEFAULT_DIFFS_TOOL_DEFAULTS };
	const defaults = config.defaults;
	if (!defaults || typeof defaults !== "object" || Array.isArray(defaults)) return { ...DEFAULT_DIFFS_TOOL_DEFAULTS };
	const fileQuality = normalizeFileQuality$1(resolveConfiguredValue({
		primary: defaults.fileQuality,
		aliases: [defaults.imageQuality],
		schemaDefault: DEFAULT_DIFFS_TOOL_DEFAULTS.fileQuality
	}));
	const profile = DEFAULT_IMAGE_QUALITY_PROFILES[fileQuality];
	const fileFormat = resolveConfiguredValue({
		primary: defaults.fileFormat,
		aliases: [defaults.imageFormat, defaults.format],
		schemaDefault: DEFAULT_DIFFS_TOOL_DEFAULTS.fileFormat
	});
	const fileScale = resolveConfiguredValue({
		primary: defaults.fileScale,
		aliases: [defaults.imageScale]
	});
	const fileMaxWidth = resolveConfiguredValue({
		primary: defaults.fileMaxWidth,
		aliases: [defaults.imageMaxWidth]
	});
	return {
		fontFamily: normalizeFontFamily(defaults.fontFamily),
		fontSize: normalizeFontSize(defaults.fontSize),
		lineSpacing: normalizeLineSpacing(defaults.lineSpacing),
		layout: normalizeLayout$1(defaults.layout),
		showLineNumbers: defaults.showLineNumbers !== false,
		diffIndicators: normalizeDiffIndicators(defaults.diffIndicators),
		wordWrap: defaults.wordWrap !== false,
		background: defaults.background !== false,
		theme: normalizeTheme$1(defaults.theme),
		fileFormat: normalizeFileFormat(fileFormat),
		fileQuality,
		fileScale: normalizeFileScale(fileScale, profile.scale),
		fileMaxWidth: normalizeFileMaxWidth(fileMaxWidth, profile.maxWidth),
		mode: normalizeMode$1(defaults.mode)
	};
}
function resolveDiffsPluginSecurity(config) {
	if (!config || typeof config !== "object" || Array.isArray(config)) return { ...DEFAULT_DIFFS_PLUGIN_SECURITY };
	const security = config.security;
	if (!security || typeof security !== "object" || Array.isArray(security)) return { ...DEFAULT_DIFFS_PLUGIN_SECURITY };
	return { allowRemoteViewer: security.allowRemoteViewer === true };
}
function resolveDiffsPluginViewerBaseUrl(config) {
	if (!config || typeof config !== "object" || Array.isArray(config)) return;
	const viewerBaseUrl = config.viewerBaseUrl;
	if (typeof viewerBaseUrl !== "string") return;
	const normalized = viewerBaseUrl.trim();
	return normalized ? normalizeViewerBaseUrl(normalized) : void 0;
}
function normalizeFontFamily(fontFamily) {
	return fontFamily?.trim() || DEFAULT_DIFFS_TOOL_DEFAULTS.fontFamily;
}
function normalizeFontSize(fontSize) {
	if (fontSize === void 0 || !Number.isFinite(fontSize)) return DEFAULT_DIFFS_TOOL_DEFAULTS.fontSize;
	return Math.min(Math.max(Math.floor(fontSize), 10), 24);
}
function normalizeLineSpacing(lineSpacing) {
	if (lineSpacing === void 0 || !Number.isFinite(lineSpacing)) return DEFAULT_DIFFS_TOOL_DEFAULTS.lineSpacing;
	return Math.min(Math.max(lineSpacing, 1), 3);
}
function normalizeLayout$1(layout) {
	return layout && DIFF_LAYOUTS.includes(layout) ? layout : DEFAULT_DIFFS_TOOL_DEFAULTS.layout;
}
function normalizeDiffIndicators(diffIndicators) {
	return diffIndicators && DIFF_INDICATORS.includes(diffIndicators) ? diffIndicators : DEFAULT_DIFFS_TOOL_DEFAULTS.diffIndicators;
}
function normalizeTheme$1(theme) {
	return theme && DIFF_THEMES.includes(theme) ? theme : DEFAULT_DIFFS_TOOL_DEFAULTS.theme;
}
function normalizeFileFormat(fileFormat) {
	return fileFormat && DIFF_OUTPUT_FORMATS.includes(fileFormat) ? fileFormat : DEFAULT_DIFFS_TOOL_DEFAULTS.fileFormat;
}
function normalizeFileQuality$1(fileQuality) {
	return fileQuality && DIFF_IMAGE_QUALITY_PRESETS.includes(fileQuality) ? fileQuality : DEFAULT_DIFFS_TOOL_DEFAULTS.fileQuality;
}
function normalizeFileScale(fileScale, fallback) {
	if (fileScale === void 0 || !Number.isFinite(fileScale)) return fallback;
	const rounded = Math.round(fileScale * 100) / 100;
	return Math.min(Math.max(rounded, 1), 4);
}
function normalizeFileMaxWidth(fileMaxWidth, fallback) {
	if (fileMaxWidth === void 0 || !Number.isFinite(fileMaxWidth)) return fallback;
	return Math.min(Math.max(Math.round(fileMaxWidth), 640), 2400);
}
function normalizeMode$1(mode) {
	return mode && DIFF_MODES.includes(mode) ? mode : DEFAULT_DIFFS_TOOL_DEFAULTS.mode;
}
function resolveDiffImageRenderOptions(params) {
	const format = normalizeFileFormat(params.fileFormat ?? params.imageFormat ?? params.format ?? params.defaults.fileFormat);
	const qualityOverrideProvided = params.fileQuality !== void 0 || params.imageQuality !== void 0;
	const qualityPreset = normalizeFileQuality$1(params.fileQuality ?? params.imageQuality ?? params.defaults.fileQuality);
	const profile = DEFAULT_IMAGE_QUALITY_PROFILES[qualityPreset];
	return {
		format,
		qualityPreset,
		scale: normalizeFileScale(params.fileScale ?? params.imageScale, qualityOverrideProvided ? profile.scale : params.defaults.fileScale),
		maxWidth: normalizeFileMaxWidth(params.fileMaxWidth ?? params.imageMaxWidth, qualityOverrideProvided ? profile.maxWidth : params.defaults.fileMaxWidth),
		maxPixels: profile.maxPixels
	};
}
//#endregion
//#region extensions/diffs/src/viewer-assets.ts
const VIEWER_ASSET_PREFIX = "/plugins/diffs/assets/";
const VIEWER_LOADER_PATH = `${VIEWER_ASSET_PREFIX}viewer.js`;
const VIEWER_RUNTIME_PATH = `${VIEWER_ASSET_PREFIX}viewer-runtime.js`;
const VIEWER_RUNTIME_RELATIVE_IMPORT_PATH = "./viewer-runtime.js";
const VIEWER_RUNTIME_CANDIDATE_RELATIVE_PATHS = ["./assets/viewer-runtime.js", "../assets/viewer-runtime.js"];
let runtimeAssetCache = null;
function isMissingFileError(error) {
	return error instanceof Error && "code" in error && error.code === "ENOENT";
}
async function resolveViewerRuntimeFileUrl(params = {}) {
	const baseUrl = params.baseUrl ?? import.meta.url;
	const stat = params.stat ?? ((path) => fs.stat(path));
	let missingFileError = null;
	for (const relativePath of VIEWER_RUNTIME_CANDIDATE_RELATIVE_PATHS) {
		const candidateUrl = new URL(relativePath, baseUrl);
		try {
			await stat(fileURLToPath(candidateUrl));
			return candidateUrl;
		} catch (error) {
			if (isMissingFileError(error)) {
				missingFileError = error;
				continue;
			}
			throw error;
		}
	}
	if (missingFileError) throw missingFileError;
	throw new Error("viewer runtime asset candidates were not checked");
}
async function getServedViewerAsset(pathname) {
	if (pathname !== VIEWER_LOADER_PATH && pathname !== VIEWER_RUNTIME_PATH) return null;
	const assets = await loadViewerAssets();
	if (pathname === VIEWER_LOADER_PATH) return {
		body: assets.loaderBody,
		contentType: "text/javascript; charset=utf-8"
	};
	if (pathname === VIEWER_RUNTIME_PATH) return {
		body: assets.runtimeBody,
		contentType: "text/javascript; charset=utf-8"
	};
	return null;
}
async function loadViewerAssets() {
	const runtimePath = fileURLToPath(await resolveViewerRuntimeFileUrl());
	const runtimeStat = await fs.stat(runtimePath);
	if (runtimeAssetCache && runtimeAssetCache.mtimeMs === runtimeStat.mtimeMs) return runtimeAssetCache;
	const runtimeBody = await fs.readFile(runtimePath);
	const hash = crypto.createHash("sha1").update(runtimeBody).digest("hex").slice(0, 12);
	runtimeAssetCache = {
		mtimeMs: runtimeStat.mtimeMs,
		runtimeBody,
		loaderBody: `import "${VIEWER_RUNTIME_RELATIVE_IMPORT_PATH}?v=${hash}";\n`
	};
	return runtimeAssetCache;
}
//#endregion
//#region extensions/diffs/src/http.ts
const VIEW_PREFIX = "/plugins/diffs/view/";
const VIEWER_MAX_FAILURES_PER_WINDOW = 40;
const VIEWER_FAILURE_WINDOW_MS = 6e4;
const VIEWER_LOCKOUT_MS = 6e4;
const VIEWER_LIMITER_MAX_KEYS = 2048;
const VIEWER_CONTENT_SECURITY_POLICY = [
	"default-src 'none'",
	"script-src 'self'",
	"style-src 'unsafe-inline'",
	"img-src 'self' data:",
	"font-src 'self' data:",
	"connect-src 'none'",
	"base-uri 'none'",
	"frame-ancestors 'self'",
	"object-src 'none'"
].join("; ");
function createDiffsHttpHandler(params) {
	const viewerFailureLimiter = new ViewerFailureLimiter();
	return async (req, res) => {
		const parsed = parseRequestUrl(req.url);
		if (!parsed) return false;
		if (parsed.pathname.startsWith("/plugins/diffs/assets/")) return await serveAsset(req, res, parsed.pathname, params.logger);
		if (!parsed.pathname.startsWith(VIEW_PREFIX)) return false;
		const access = resolveViewerAccess(req, {
			trustedProxies: params.trustedProxies,
			allowRealIpFallback: params.allowRealIpFallback
		});
		if (!access.localRequest && params.allowRemoteViewer !== true) {
			respondText(res, 404, "Diff not found");
			return true;
		}
		if (req.method !== "GET" && req.method !== "HEAD") {
			respondText(res, 405, "Method not allowed");
			return true;
		}
		if (!access.localRequest) {
			const throttled = viewerFailureLimiter.check(access.remoteKey);
			if (!throttled.allowed) {
				res.statusCode = 429;
				setSharedHeaders(res, "text/plain; charset=utf-8");
				res.setHeader("Retry-After", String(Math.max(1, Math.ceil(throttled.retryAfterMs / 1e3))));
				res.end("Too Many Requests");
				return true;
			}
		}
		const pathParts = parsed.pathname.split("/").filter(Boolean);
		const id = pathParts[3];
		const token = pathParts[4];
		if (!id || !token || !DIFF_ARTIFACT_ID_PATTERN.test(id) || !DIFF_ARTIFACT_TOKEN_PATTERN.test(token)) {
			recordRemoteFailure(viewerFailureLimiter, access);
			respondText(res, 404, "Diff not found");
			return true;
		}
		if (!await params.store.getArtifact(id, token)) {
			recordRemoteFailure(viewerFailureLimiter, access);
			respondText(res, 404, "Diff not found or expired");
			return true;
		}
		try {
			const html = await params.store.readHtml(id);
			resetRemoteFailures(viewerFailureLimiter, access);
			res.statusCode = 200;
			setSharedHeaders(res, "text/html; charset=utf-8");
			res.setHeader("content-security-policy", VIEWER_CONTENT_SECURITY_POLICY);
			if (req.method === "HEAD") res.end();
			else res.end(html);
			return true;
		} catch (error) {
			recordRemoteFailure(viewerFailureLimiter, access);
			params.logger?.warn(`Failed to serve diff artifact ${id}: ${String(error)}`);
			respondText(res, 500, "Failed to load diff");
			return true;
		}
	};
}
function parseRequestUrl(rawUrl) {
	if (!rawUrl) return null;
	try {
		return new URL(rawUrl, "http://127.0.0.1");
	} catch {
		return null;
	}
}
async function serveAsset(req, res, pathname, logger) {
	if (req.method !== "GET" && req.method !== "HEAD") {
		respondText(res, 405, "Method not allowed");
		return true;
	}
	try {
		const asset = await getServedViewerAsset(pathname);
		if (!asset) {
			respondText(res, 404, "Asset not found");
			return true;
		}
		res.statusCode = 200;
		setSharedHeaders(res, asset.contentType);
		if (req.method === "HEAD") res.end();
		else res.end(asset.body);
		return true;
	} catch (error) {
		logger?.warn(`Failed to serve diffs asset ${pathname}: ${String(error)}`);
		respondText(res, 500, "Failed to load asset");
		return true;
	}
}
function respondText(res, statusCode, body) {
	res.statusCode = statusCode;
	setSharedHeaders(res, "text/plain; charset=utf-8");
	res.end(body);
}
function setSharedHeaders(res, contentType) {
	res.setHeader("cache-control", "no-store, max-age=0");
	res.setHeader("content-type", contentType);
	res.setHeader("x-content-type-options", "nosniff");
	res.setHeader("referrer-policy", "no-referrer");
}
function normalizeRemoteClientKey(remoteAddress) {
	const normalized = normalizeLowercaseStringOrEmpty(remoteAddress);
	if (!normalized) return "unknown";
	return normalized.startsWith("::ffff:") ? normalized.slice(7) : normalized;
}
function isLoopbackClientIp(clientIp) {
	return clientIp === "127.0.0.1" || clientIp === "::1";
}
function hasProxyForwardingHints(req) {
	const headers = req.headers ?? {};
	return Boolean(headers["x-forwarded-for"] || headers["x-real-ip"] || headers.forwarded || headers["x-forwarded-host"] || headers["x-forwarded-proto"]);
}
function resolveViewerAccess(req, params) {
	const proxyHintsPresent = hasProxyForwardingHints(req);
	const clientIp = proxyHintsPresent || (params.trustedProxies?.length ?? 0) > 0 ? resolveRequestClientIp(req, params.trustedProxies ? [...params.trustedProxies] : void 0, params.allowRealIpFallback === true) : req.socket?.remoteAddress;
	const remoteKey = normalizeRemoteClientKey(clientIp ?? req.socket?.remoteAddress);
	return {
		remoteKey,
		localRequest: !proxyHintsPresent && typeof clientIp === "string" && isLoopbackClientIp(remoteKey)
	};
}
function recordRemoteFailure(limiter, access) {
	if (!access.localRequest) limiter.recordFailure(access.remoteKey);
}
function resetRemoteFailures(limiter, access) {
	if (!access.localRequest) limiter.reset(access.remoteKey);
}
var ViewerFailureLimiter = class {
	constructor() {
		this.failures = /* @__PURE__ */ new Map();
	}
	check(key) {
		this.prune();
		const state = this.failures.get(key);
		if (!state) return {
			allowed: true,
			retryAfterMs: 0
		};
		const now = Date.now();
		if (state.lockUntilMs > now) return {
			allowed: false,
			retryAfterMs: state.lockUntilMs - now
		};
		if (now - state.windowStartMs >= VIEWER_FAILURE_WINDOW_MS) {
			this.failures.delete(key);
			return {
				allowed: true,
				retryAfterMs: 0
			};
		}
		return {
			allowed: true,
			retryAfterMs: 0
		};
	}
	recordFailure(key) {
		this.prune();
		const now = Date.now();
		const current = this.failures.get(key);
		const next = !current || now - current.windowStartMs >= VIEWER_FAILURE_WINDOW_MS ? {
			windowStartMs: now,
			failures: 1,
			lockUntilMs: 0
		} : {
			...current,
			failures: current.failures + 1
		};
		if (next.failures >= VIEWER_MAX_FAILURES_PER_WINDOW) next.lockUntilMs = now + VIEWER_LOCKOUT_MS;
		this.failures.set(key, next);
	}
	reset(key) {
		this.failures.delete(key);
	}
	prune() {
		if (this.failures.size < VIEWER_LIMITER_MAX_KEYS) return;
		const now = Date.now();
		for (const [key, state] of this.failures) {
			if (state.lockUntilMs <= now && now - state.windowStartMs >= VIEWER_FAILURE_WINDOW_MS) this.failures.delete(key);
			if (this.failures.size < VIEWER_LIMITER_MAX_KEYS) return;
		}
		if (this.failures.size >= VIEWER_LIMITER_MAX_KEYS) this.failures.clear();
	}
};
//#endregion
//#region extensions/diffs/src/prompt-guidance.ts
const DIFFS_AGENT_GUIDANCE = [
	"When you need to show edits as a real diff, prefer the `diffs` tool instead of writing a manual summary.",
	"It accepts either `before` + `after` text or a unified `patch`.",
	"`mode=view` returns `details.viewerUrl` for canvas use; `mode=file` returns `details.filePath`; `mode=both` returns both.",
	"If you need to send the rendered file, use the `message` tool with `path` or `filePath`.",
	"Include `path` when you know the filename, and omit presentation overrides unless needed."
].join("\n");
//#endregion
//#region extensions/diffs/src/store.ts
const DEFAULT_TTL_MS = 1800 * 1e3;
const MAX_TTL_MS = 360 * 60 * 1e3;
const SWEEP_FALLBACK_AGE_MS = 1440 * 60 * 1e3;
const DEFAULT_CLEANUP_INTERVAL_MS = 300 * 1e3;
const VIEWER_PREFIX = "/plugins/diffs/view";
var DiffArtifactStore = class {
	constructor(params) {
		this.cleanupInFlight = null;
		this.nextCleanupAt = 0;
		this.rootDir = path.resolve(params.rootDir);
		this.logger = params.logger;
		this.cleanupIntervalMs = params.cleanupIntervalMs === void 0 ? DEFAULT_CLEANUP_INTERVAL_MS : Math.max(0, Math.floor(params.cleanupIntervalMs));
	}
	async createArtifact(params) {
		await this.ensureRoot();
		const id = crypto.randomBytes(10).toString("hex");
		const token = crypto.randomBytes(24).toString("hex");
		const artifactDir = this.artifactDir(id);
		const htmlPath = path.join(artifactDir, "viewer.html");
		const ttlMs = normalizeTtlMs$1(params.ttlMs);
		const createdAt = /* @__PURE__ */ new Date();
		const expiresAt = new Date(createdAt.getTime() + ttlMs);
		const meta = {
			id,
			token,
			title: params.title,
			inputKind: params.inputKind,
			fileCount: params.fileCount,
			createdAt: createdAt.toISOString(),
			expiresAt: expiresAt.toISOString(),
			viewerPath: `${VIEWER_PREFIX}/${id}/${token}`,
			htmlPath,
			...params.context ? { context: params.context } : {}
		};
		await fs.mkdir(artifactDir, { recursive: true });
		await fs.writeFile(htmlPath, params.html, "utf8");
		await this.writeMeta(meta);
		this.scheduleCleanup();
		return meta;
	}
	async getArtifact(id, token) {
		const meta = await this.readMeta(id);
		if (!meta) return null;
		if (meta.token !== token) return null;
		if (isExpired(meta)) {
			await this.deleteArtifact(id);
			return null;
		}
		return meta;
	}
	async readHtml(id) {
		const meta = await this.readMeta(id);
		if (!meta) throw new Error(`Diff artifact not found: ${id}`);
		const htmlPath = this.normalizeStoredPath(meta.htmlPath, "htmlPath");
		return await fs.readFile(htmlPath, "utf8");
	}
	async updateFilePath(id, filePath) {
		const meta = await this.readMeta(id);
		if (!meta) throw new Error(`Diff artifact not found: ${id}`);
		const normalizedFilePath = this.normalizeStoredPath(filePath, "filePath");
		const next = {
			...meta,
			filePath: normalizedFilePath,
			imagePath: normalizedFilePath
		};
		await this.writeMeta(next);
		return next;
	}
	async updateImagePath(id, imagePath) {
		return this.updateFilePath(id, imagePath);
	}
	allocateFilePath(id, format = "png") {
		return path.join(this.artifactDir(id), `preview.${format}`);
	}
	async createStandaloneFileArtifact(params = {}) {
		await this.ensureRoot();
		const id = crypto.randomBytes(10).toString("hex");
		const artifactDir = this.artifactDir(id);
		const format = params.format ?? "png";
		const filePath = path.join(artifactDir, `preview.${format}`);
		const ttlMs = normalizeTtlMs$1(params.ttlMs);
		const createdAt = /* @__PURE__ */ new Date();
		const expiresAt = new Date(createdAt.getTime() + ttlMs).toISOString();
		const meta = {
			kind: "standalone_file",
			id,
			createdAt: createdAt.toISOString(),
			expiresAt,
			filePath: this.normalizeStoredPath(filePath, "filePath"),
			...params.context ? { context: params.context } : {}
		};
		await fs.mkdir(artifactDir, { recursive: true });
		await this.writeStandaloneMeta(meta);
		this.scheduleCleanup();
		return {
			id,
			filePath: meta.filePath,
			expiresAt: meta.expiresAt,
			...meta.context ? { context: meta.context } : {}
		};
	}
	allocateImagePath(id, format = "png") {
		return this.allocateFilePath(id, format);
	}
	scheduleCleanup() {
		this.maybeCleanupExpired();
	}
	async cleanupExpired() {
		await this.ensureRoot();
		const entries = await fs.readdir(this.rootDir, { withFileTypes: true }).catch(() => []);
		const now = Date.now();
		await Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
			const id = entry.name;
			const meta = await this.readMeta(id);
			if (meta) {
				if (isExpired(meta)) await this.deleteArtifact(id);
				return;
			}
			const standaloneMeta = await this.readStandaloneMeta(id);
			if (standaloneMeta) {
				if (isExpired(standaloneMeta)) await this.deleteArtifact(id);
				return;
			}
			const artifactPath = this.artifactDir(id);
			const stat = await fs.stat(artifactPath).catch(() => null);
			if (!stat) return;
			if (now - stat.mtimeMs > SWEEP_FALLBACK_AGE_MS) await this.deleteArtifact(id);
		}));
	}
	async ensureRoot() {
		await fs.mkdir(this.rootDir, { recursive: true });
	}
	maybeCleanupExpired() {
		const now = Date.now();
		if (this.cleanupInFlight || now < this.nextCleanupAt) return;
		this.nextCleanupAt = now + this.cleanupIntervalMs;
		const cleanupPromise = this.cleanupExpired().catch((error) => {
			this.nextCleanupAt = 0;
			this.logger?.warn(`Failed to clean expired diff artifacts: ${String(error)}`);
		}).finally(() => {
			if (this.cleanupInFlight === cleanupPromise) this.cleanupInFlight = null;
		});
		this.cleanupInFlight = cleanupPromise;
	}
	artifactDir(id) {
		return this.resolveWithinRoot(id);
	}
	async writeMeta(meta) {
		await this.writeJsonMeta(meta.id, "meta.json", meta);
	}
	async readMeta(id) {
		const parsed = await this.readJsonMeta(id, "meta.json", "diff artifact");
		if (!parsed) return null;
		return parsed;
	}
	async writeStandaloneMeta(meta) {
		await this.writeJsonMeta(meta.id, "file-meta.json", meta);
	}
	async readStandaloneMeta(id) {
		const parsed = await this.readJsonMeta(id, "file-meta.json", "standalone diff");
		if (!parsed) return null;
		try {
			const value = parsed;
			if (value.kind !== "standalone_file" || typeof value.id !== "string" || typeof value.createdAt !== "string" || typeof value.expiresAt !== "string" || typeof value.filePath !== "string") return null;
			return {
				kind: value.kind,
				id: value.id,
				createdAt: value.createdAt,
				expiresAt: value.expiresAt,
				filePath: this.normalizeStoredPath(value.filePath, "filePath"),
				...value.context ? { context: normalizeArtifactContext(value.context) } : {}
			};
		} catch (error) {
			this.logger?.warn(`Failed to normalize standalone diff metadata for ${id}: ${String(error)}`);
			return null;
		}
	}
	metaFilePath(id, fileName) {
		return path.join(this.artifactDir(id), fileName);
	}
	async writeJsonMeta(id, fileName, data) {
		await fs.writeFile(this.metaFilePath(id, fileName), JSON.stringify(data, null, 2), "utf8");
	}
	async readJsonMeta(id, fileName, context) {
		try {
			const raw = await fs.readFile(this.metaFilePath(id, fileName), "utf8");
			return JSON.parse(raw);
		} catch (error) {
			if (isFileNotFound(error)) return null;
			this.logger?.warn(`Failed to read ${context} metadata for ${id}: ${String(error)}`);
			return null;
		}
	}
	async deleteArtifact(id) {
		await fs.rm(this.artifactDir(id), {
			recursive: true,
			force: true
		}).catch(() => {});
	}
	resolveWithinRoot(...parts) {
		const candidate = path.resolve(this.rootDir, ...parts);
		this.assertWithinRoot(candidate);
		return candidate;
	}
	normalizeStoredPath(rawPath, label) {
		const candidate = path.isAbsolute(rawPath) ? path.resolve(rawPath) : path.resolve(this.rootDir, rawPath);
		this.assertWithinRoot(candidate, label);
		return candidate;
	}
	assertWithinRoot(candidate, label = "path") {
		const relative = path.relative(this.rootDir, candidate);
		if (relative === "" || !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)) return;
		throw new Error(`Diff artifact ${label} escapes store root: ${candidate}`);
	}
};
function normalizeTtlMs$1(value) {
	if (!Number.isFinite(value) || value === void 0) return DEFAULT_TTL_MS;
	const rounded = Math.floor(value);
	if (rounded <= 0) return DEFAULT_TTL_MS;
	return Math.min(rounded, MAX_TTL_MS);
}
function isExpired(meta) {
	const expiresAt = Date.parse(meta.expiresAt);
	if (!Number.isFinite(expiresAt)) return true;
	return Date.now() >= expiresAt;
}
function isFileNotFound(error) {
	return error instanceof Error && "code" in error && error.code === "ENOENT";
}
function normalizeArtifactContext(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return;
	const raw = value;
	const context = {
		agentId: normalizeOptionalString(raw.agentId),
		sessionId: normalizeOptionalString(raw.sessionId),
		messageChannel: normalizeOptionalString(raw.messageChannel),
		agentAccountId: normalizeOptionalString(raw.agentAccountId)
	};
	return Object.values(context).some((entry) => entry !== void 0) ? context : void 0;
}
//#endregion
//#region extensions/diffs/src/browser.ts
const DEFAULT_BROWSER_IDLE_MS = 3e4;
const SHARED_BROWSER_KEY = "__default__";
const IMAGE_SIZE_LIMIT_ERROR = "Diff frame did not render within image size limits.";
const PDF_REFERENCE_PAGE_HEIGHT_PX = 1056;
const MAX_PDF_PAGES = 50;
const LOCAL_VIEWER_BASE_HREF = "http://127.0.0.1/plugins/diffs/view/local/local";
let sharedBrowserState = null;
let executablePathCache = null;
var PlaywrightDiffScreenshotter = class {
	constructor(params) {
		this.config = params.config;
		this.browserIdleMs = params.browserIdleMs ?? DEFAULT_BROWSER_IDLE_MS;
	}
	async screenshotHtml(params) {
		await fs.mkdir(path.dirname(params.outputPath), { recursive: true });
		const lease = await acquireSharedBrowser({
			config: this.config,
			idleMs: this.browserIdleMs
		});
		let page;
		let currentScale = params.image.scale;
		const maxRetries = 2;
		try {
			for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
				page = await lease.browser.newPage({
					viewport: {
						width: Math.max(Math.ceil(params.image.maxWidth + 240), 1200),
						height: 900
					},
					deviceScaleFactor: currentScale,
					colorScheme: params.theme
				});
				await page.route("**/*", async (route) => {
					const requestUrl = route.request().url();
					if (requestUrl === "about:blank" || requestUrl.startsWith("data:")) {
						await route.continue();
						return;
					}
					let parsed;
					try {
						parsed = new URL(requestUrl);
					} catch {
						await route.abort();
						return;
					}
					if (parsed.protocol !== "http:" || parsed.hostname !== "127.0.0.1") {
						await route.abort();
						return;
					}
					if (!parsed.pathname.startsWith("/plugins/diffs/assets/")) {
						await route.abort();
						return;
					}
					const pathname = parsed.pathname;
					const asset = await getServedViewerAsset(pathname);
					if (!asset) {
						await route.abort();
						return;
					}
					await route.fulfill({
						status: 200,
						contentType: asset.contentType,
						body: asset.body
					});
				});
				await page.setContent(injectBaseHref(params.html), { waitUntil: "load" });
				await page.waitForFunction(() => {
					if (document.documentElement.dataset.openclawDiffsReady === "true") return true;
					return [...document.querySelectorAll("[data-openclaw-diff-host]")].every((element) => {
						return element instanceof HTMLElement && element.shadowRoot?.querySelector("[data-diffs]");
					});
				}, { timeout: 1e4 });
				await page.evaluate(async () => {
					await document.fonts.ready;
				});
				await page.evaluate(() => {
					const frame = document.querySelector(".oc-frame");
					if (frame instanceof HTMLElement) frame.dataset.renderMode = "image";
				});
				const frame = page.locator(".oc-frame");
				await frame.waitFor();
				const initialBox = await frame.boundingBox();
				if (!initialBox) throw new Error("Diff frame did not render.");
				const isPdf = params.image.format === "pdf";
				const padding = isPdf ? 0 : 20;
				const clipWidth = Math.ceil(initialBox.width + padding * 2);
				const clipHeight = Math.ceil(Math.max(initialBox.height + padding * 2, 320));
				await page.setViewportSize({
					width: Math.max(clipWidth + padding, 900),
					height: Math.max(clipHeight + padding, 700)
				});
				const box = await frame.boundingBox();
				if (!box) throw new Error("Diff frame was lost after resizing.");
				if (isPdf) {
					await page.emulateMedia({ media: "screen" });
					await page.evaluate(() => {
						const html = document.documentElement;
						const body = document.body;
						const frame = document.querySelector(".oc-frame");
						html.style.background = "transparent";
						body.style.margin = "0";
						body.style.padding = "0";
						body.style.background = "transparent";
						body.style.setProperty("-webkit-print-color-adjust", "exact");
						if (frame instanceof HTMLElement) frame.style.margin = "0";
					});
					const pdfBox = await frame.boundingBox();
					if (!pdfBox) throw new Error("Diff frame was lost before PDF render.");
					const pdfWidth = Math.max(Math.ceil(pdfBox.width), 1);
					const pdfHeight = Math.max(Math.ceil(pdfBox.height), 1);
					const estimatedPixels = pdfWidth * pdfHeight;
					const estimatedPages = Math.ceil(pdfHeight / PDF_REFERENCE_PAGE_HEIGHT_PX);
					if (estimatedPixels > params.image.maxPixels || estimatedPages > MAX_PDF_PAGES) throw new Error(IMAGE_SIZE_LIMIT_ERROR);
					await page.pdf({
						path: params.outputPath,
						width: `${pdfWidth}px`,
						height: `${pdfHeight}px`,
						printBackground: true,
						margin: {
							top: "0",
							right: "0",
							bottom: "0",
							left: "0"
						}
					});
					return params.outputPath;
				}
				const dpr = await page.evaluate(() => window.devicePixelRatio || 1);
				const rawX = Math.max(box.x - padding, 0);
				const rawY = Math.max(box.y - padding, 0);
				const rawRight = rawX + clipWidth;
				const rawBottom = rawY + clipHeight;
				const x = Math.floor(rawX * dpr) / dpr;
				const y = Math.floor(rawY * dpr) / dpr;
				const right = Math.ceil(rawRight * dpr) / dpr;
				const bottom = Math.ceil(rawBottom * dpr) / dpr;
				const cssWidth = Math.max(right - x, 1);
				const cssHeight = Math.max(bottom - y, 1);
				if (cssWidth * cssHeight * dpr * dpr > params.image.maxPixels) {
					if (currentScale > 1) {
						const maxScaleForPixels = Math.sqrt(params.image.maxPixels / (cssWidth * cssHeight));
						const reducedScale = Math.max(1, Math.round(Math.min(currentScale, maxScaleForPixels) * 100) / 100);
						if (reducedScale < currentScale - .01 && attempt < maxRetries) {
							await page.close().catch(() => {});
							page = void 0;
							currentScale = reducedScale;
							continue;
						}
					}
					throw new Error(IMAGE_SIZE_LIMIT_ERROR);
				}
				await page.screenshot({
					path: params.outputPath,
					type: "png",
					scale: "device",
					clip: {
						x,
						y,
						width: cssWidth,
						height: cssHeight
					}
				});
				return params.outputPath;
			}
			throw new Error(IMAGE_SIZE_LIMIT_ERROR);
		} catch (error) {
			if (error instanceof Error && error.message === IMAGE_SIZE_LIMIT_ERROR) throw error;
			const reason = formatErrorMessage(error);
			throw new Error(`Diff PNG/PDF rendering requires a Chromium-compatible browser. Set browser.executablePath or install Chrome/Chromium. ${reason}`, { cause: error });
		} finally {
			await page?.close().catch(() => {});
			await lease.release();
		}
	}
};
function injectBaseHref(html) {
	if (html.includes("<base ")) return html;
	return html.replace("<head>", `<head><base href="${LOCAL_VIEWER_BASE_HREF}" />`);
}
async function resolveBrowserExecutablePath(config) {
	const cacheKey = JSON.stringify({
		configPath: config.browser?.executablePath?.trim() || "",
		env: [
			process.env.OPENCLAW_BROWSER_EXECUTABLE_PATH ?? "",
			process.env.BROWSER_EXECUTABLE_PATH ?? "",
			process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? ""
		],
		path: process.env.PATH ?? ""
	});
	if (executablePathCache?.key === cacheKey) return await executablePathCache.valuePromise;
	const valuePromise = resolveBrowserExecutablePathUncached(config).catch((error) => {
		if (executablePathCache?.valuePromise === valuePromise) executablePathCache = null;
		throw error;
	});
	executablePathCache = {
		key: cacheKey,
		valuePromise
	};
	return await valuePromise;
}
async function resolveBrowserExecutablePathUncached(config) {
	const configPath = config.browser?.executablePath?.trim();
	if (configPath) {
		await assertExecutable(configPath, "browser.executablePath");
		return configPath;
	}
	const envCandidates = [
		process.env.OPENCLAW_BROWSER_EXECUTABLE_PATH,
		process.env.BROWSER_EXECUTABLE_PATH,
		process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
	].map((value) => value?.trim()).filter((value) => Boolean(value));
	for (const candidate of envCandidates) if (await isExecutable(candidate)) return candidate;
	for (const candidate of await collectExecutableCandidates()) if (await isExecutable(candidate)) return candidate;
}
async function acquireSharedBrowser(params) {
	const executablePath = await resolveBrowserExecutablePath(params.config);
	const desiredKey = executablePath || SHARED_BROWSER_KEY;
	if (sharedBrowserState && sharedBrowserState.key !== desiredKey) await closeSharedBrowser();
	if (!sharedBrowserState) {
		const browserPromise = chromium.launch({
			headless: true,
			...executablePath ? { executablePath } : {},
			args: ["--disable-dev-shm-usage"]
		}).then((browser) => {
			if (sharedBrowserState?.browserPromise === browserPromise) {
				sharedBrowserState.browser = browser;
				browser.on("disconnected", () => {
					if (sharedBrowserState?.browser === browser) {
						clearIdleTimer(sharedBrowserState);
						sharedBrowserState = null;
					}
				});
			}
			return browser;
		}).catch((error) => {
			if (sharedBrowserState?.browserPromise === browserPromise) sharedBrowserState = null;
			throw error;
		});
		sharedBrowserState = {
			browserPromise,
			idleTimer: null,
			key: desiredKey,
			users: 0
		};
	}
	clearIdleTimer(sharedBrowserState);
	const state = sharedBrowserState;
	const browser = await state.browserPromise;
	state.users += 1;
	let released = false;
	return {
		browser,
		release: async () => {
			if (released) return;
			released = true;
			state.users = Math.max(0, state.users - 1);
			if (state.users === 0) scheduleIdleBrowserClose(state, params.idleMs);
		}
	};
}
function scheduleIdleBrowserClose(state, idleMs) {
	clearIdleTimer(state);
	state.idleTimer = setTimeout(() => {
		if (sharedBrowserState === state && state.users === 0) closeSharedBrowser();
	}, idleMs);
}
function clearIdleTimer(state) {
	if (!state.idleTimer) return;
	clearTimeout(state.idleTimer);
	state.idleTimer = null;
}
async function closeSharedBrowser() {
	const state = sharedBrowserState;
	if (!state) return;
	sharedBrowserState = null;
	clearIdleTimer(state);
	await (state.browser ?? await state.browserPromise.catch(() => null))?.close().catch(() => {});
}
async function collectExecutableCandidates() {
	const candidates = /* @__PURE__ */ new Set();
	for (const command of pathCommandsForPlatform()) {
		const resolved = await findExecutableInPath(command);
		if (resolved) candidates.add(resolved);
	}
	for (const candidate of commonExecutablePathsForPlatform()) candidates.add(candidate);
	return [...candidates];
}
function pathCommandsForPlatform() {
	if (process.platform === "win32") return [
		"chrome.exe",
		"msedge.exe",
		"brave.exe"
	];
	if (process.platform === "darwin") return [
		"google-chrome",
		"chromium",
		"msedge",
		"brave-browser",
		"brave"
	];
	return [
		"chromium",
		"chromium-browser",
		"google-chrome",
		"google-chrome-stable",
		"msedge",
		"brave-browser",
		"brave"
	];
}
function commonExecutablePathsForPlatform() {
	if (process.platform === "darwin") return [
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		"/Applications/Chromium.app/Contents/MacOS/Chromium",
		"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
		"/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
	];
	if (process.platform === "win32") {
		const localAppData = process.env.LOCALAPPDATA ?? "";
		const programFiles = process.env.ProgramFiles ?? "C:\\Program Files";
		const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";
		return [
			path.join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
			path.join(programFiles, "Google", "Chrome", "Application", "chrome.exe"),
			path.join(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"),
			path.join(programFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
			path.join(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
			path.join(programFiles, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"),
			path.join(programFilesX86, "BraveSoftware", "Brave-Browser", "Application", "brave.exe")
		];
	}
	return [
		"/usr/bin/chromium",
		"/usr/bin/chromium-browser",
		"/usr/bin/google-chrome",
		"/usr/bin/google-chrome-stable",
		"/usr/bin/msedge",
		"/usr/bin/brave-browser",
		"/snap/bin/chromium"
	];
}
async function findExecutableInPath(command) {
	const pathValue = process.env.PATH;
	if (!pathValue) return;
	for (const directory of pathValue.split(path.delimiter)) {
		if (!directory) continue;
		const candidate = path.join(directory, command);
		if (await isExecutable(candidate)) return candidate;
	}
}
async function assertExecutable(candidate, label) {
	if (!await isExecutable(candidate)) throw new Error(`${label} not found or not executable: ${candidate}`);
}
async function isExecutable(candidate) {
	try {
		await fs.access(candidate, constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
//#endregion
//#region extensions/diffs/src/language-hints.ts
const PASSTHROUGH_LANGUAGE_HINTS = new Set(["ansi", "text"]);
function normalizeOptionalString$1(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed ? trimmed : void 0;
}
async function normalizeSupportedLanguageHint(value) {
	const normalized = normalizeOptionalString$1(value);
	if (!normalized) return;
	if (PASSTHROUGH_LANGUAGE_HINTS.has(normalized)) return normalized;
	try {
		await resolveLanguage(normalized);
		return normalized;
	} catch {
		return;
	}
}
async function normalizeSupportedLanguageHints(values, options) {
	const supported = /* @__PURE__ */ new Set();
	for (const value of values) {
		const normalized = await normalizeSupportedLanguageHint(value);
		if (!normalized) continue;
		supported.add(normalized);
	}
	if (options.fallbackToText && supported.size === 0) supported.add("text");
	return [...supported];
}
function collectDiffPayloadLanguageHints(payload) {
	const langs = /* @__PURE__ */ new Set();
	if (payload.fileDiff?.lang) langs.add(payload.fileDiff.lang);
	if (payload.oldFile?.lang) langs.add(payload.oldFile.lang);
	if (payload.newFile?.lang) langs.add(payload.newFile.lang);
	return [...langs];
}
async function normalizeDiffPayloadFileLanguage(file) {
	if (!file) return;
	if (typeof file.lang !== "string") return file;
	const normalized = await normalizeSupportedLanguageHint(file.lang);
	if (file.lang === normalized) return file;
	if (!normalized) return {
		...file,
		lang: "text"
	};
	return {
		...file,
		lang: normalized
	};
}
async function normalizeDiffViewerPayloadLanguages(payload) {
	const [fileDiff, oldFile, newFile, payloadLangs] = await Promise.all([
		normalizeDiffPayloadFileLanguage(payload.fileDiff),
		normalizeDiffPayloadFileLanguage(payload.oldFile),
		normalizeDiffPayloadFileLanguage(payload.newFile),
		normalizeSupportedLanguageHints(payload.langs, { fallbackToText: false })
	]);
	const langs = new Set(payloadLangs);
	for (const lang of collectDiffPayloadLanguageHints({
		fileDiff,
		oldFile,
		newFile
	})) langs.add(lang);
	if (langs.size === 0) langs.add("text");
	return {
		...payload,
		fileDiff,
		oldFile,
		newFile,
		langs: [...langs]
	};
}
//#endregion
//#region extensions/diffs/src/pierre-themes.ts
const themeRequire = createRequire(import.meta.url);
const PIERRE_THEME_SPECS = [["pierre-dark", "@pierre/theme/themes/pierre-dark.json"], ["pierre-light", "@pierre/theme/themes/pierre-light.json"]];
function createThemeLoader(themeName, themeSpecifier) {
	let cachedTheme;
	return async () => {
		if (cachedTheme) return cachedTheme;
		const themePath = themeRequire.resolve(themeSpecifier);
		cachedTheme = {
			...JSON.parse(await fs.readFile(themePath, "utf8")),
			name: themeName
		};
		return cachedTheme;
	};
}
const PIERRE_THEME_LOADERS = new Map(PIERRE_THEME_SPECS.map(([themeName, themeSpecifier]) => [themeName, createThemeLoader(themeName, themeSpecifier)]));
function ensurePierreThemesRegistered() {
	let replacedThemeLoader = false;
	for (const [themeName, loader] of PIERRE_THEME_LOADERS) if (RegisteredCustomThemes.get(themeName) !== loader) {
		RegisteredCustomThemes.set(themeName, loader);
		replacedThemeLoader = true;
	}
	if (!replacedThemeLoader) return;
	for (const [themeName] of PIERRE_THEME_LOADERS) {
		ResolvedThemes.delete(themeName);
		ResolvingThemes.delete(themeName);
	}
}
//#endregion
//#region extensions/diffs/src/render.ts
const DEFAULT_FILE_NAME = "diff.txt";
const MAX_PATCH_FILE_COUNT = 128;
const MAX_PATCH_TOTAL_LINES = 12e4;
const VIEWER_LOADER_DOCUMENT_PATH = "../../assets/viewer.js";
function escapeCssString(value) {
	return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
function escapeHtml(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function escapeJsonScript(value) {
	return JSON.stringify(value).replaceAll("<", "\\u003c");
}
function buildDiffTitle(input) {
	if (input.title?.trim()) return input.title.trim();
	if (input.kind === "before_after") return input.path?.trim() || "Text diff";
	return "Patch diff";
}
function resolveBeforeAfterFileName(params) {
	const { input, lang } = params;
	if (input.path?.trim()) return input.path.trim();
	if (lang && lang !== "text") return `diff.${lang.replace(/^\.+/, "")}`;
	return DEFAULT_FILE_NAME;
}
function buildDiffOptions(options) {
	const fontFamily = escapeCssString(options.presentation.fontFamily);
	const fontSize = Math.max(10, Math.floor(options.presentation.fontSize));
	const lineHeight = Math.max(20, Math.round(fontSize * options.presentation.lineSpacing));
	return {
		theme: {
			light: "pierre-light",
			dark: "pierre-dark"
		},
		diffStyle: options.presentation.layout,
		diffIndicators: options.presentation.diffIndicators,
		disableLineNumbers: !options.presentation.showLineNumbers,
		expandUnchanged: options.expandUnchanged,
		themeType: options.presentation.theme,
		backgroundEnabled: options.presentation.background,
		overflow: options.presentation.wordWrap ? "wrap" : "scroll",
		unsafeCSS: `
      :host {
        --diffs-font-family: "${fontFamily}", "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        --diffs-header-font-family: "${fontFamily}", "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        --diffs-font-size: ${fontSize}px;
        --diffs-line-height: ${lineHeight}px;
      }

      [data-diffs-header] {
        min-height: 64px;
        padding-inline: 18px 14px;
      }

      [data-header-content] {
        gap: 10px;
      }

      [data-metadata] {
        gap: 10px;
      }

      .oc-diff-toolbar {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-inline-start: 6px;
        flex: 0 0 auto;
      }

      .oc-diff-toolbar-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        margin: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        opacity: 0.6;
        line-height: 0;
        overflow: visible;
        transition: opacity 120ms ease;
        flex: 0 0 auto;
      }

      .oc-diff-toolbar-button:hover {
        opacity: 1;
      }

      .oc-diff-toolbar-button[data-active="true"] {
        opacity: 0.92;
      }

      .oc-diff-toolbar-button svg {
        display: block;
        width: 16px;
        height: 16px;
        min-width: 16px;
        min-height: 16px;
        overflow: visible;
        flex: 0 0 auto;
        color: inherit;
        fill: currentColor;
        pointer-events: none;
      }
    `
	};
}
function buildImageRenderOptions(options) {
	return {
		...options,
		presentation: {
			...options.presentation,
			fontSize: Math.max(16, options.presentation.fontSize)
		}
	};
}
function shouldRenderViewer(target) {
	return target === "viewer" || target === "both";
}
function shouldRenderImage(target) {
	return target === "image" || target === "both";
}
function buildRenderVariants(params) {
	return {
		...shouldRenderViewer(params.target) ? { viewerOptions: buildDiffOptions(params.options) } : {},
		...shouldRenderImage(params.target) ? { imageOptions: buildDiffOptions(buildImageRenderOptions(params.options)) } : {}
	};
}
function renderDiffCard(payload) {
	return `<section class="oc-diff-card">
    <diffs-container class="oc-diff-host" data-openclaw-diff-host>
      <template shadowrootmode="open">${payload.prerenderedHTML}</template>
    </diffs-container>
    <script type="application/json" data-openclaw-diff-payload>${escapeJsonScript(payload)}<\/script>
  </section>`;
}
function buildHtmlDocument(params) {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <title>${escapeHtml(params.title)}</title>
    <style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        min-height: 100%;
      }

      html {
        background: #05070b;
      }

      body {
        margin: 0;
        min-height: 100vh;
        padding: 22px;
        font-family:
          "Fira Code",
          "SF Mono",
          Monaco,
          Consolas,
          monospace;
        background: #05070b;
        color: #f8fafc;
      }

      body[data-theme="light"] {
        background: #f3f5f8;
        color: #0f172a;
      }

      .oc-frame {
        max-width: 1560px;
        margin: 0 auto;
      }

      .oc-frame[data-render-mode="image"] {
        max-width: ${Math.max(640, Math.round(params.imageMaxWidth))}px;
      }

      [data-openclaw-diff-root] {
        display: grid;
        gap: 18px;
      }

      .oc-diff-card {
        overflow: hidden;
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(15, 23, 42, 0.14);
        box-shadow: 0 18px 48px rgba(2, 6, 23, 0.22);
      }

      body[data-theme="light"] .oc-diff-card {
        border-color: rgba(148, 163, 184, 0.22);
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
      }

      .oc-diff-host {
        display: block;
      }

      .oc-frame[data-render-mode="image"] .oc-diff-card {
        min-height: 240px;
      }

      @media (max-width: 720px) {
        body {
          padding: 12px;
        }

        [data-openclaw-diff-root] {
          gap: 12px;
        }
      }
    </style>
  </head>
  <body data-theme="${params.theme}">
    <main class="oc-frame" data-render-mode="${params.runtimeMode}">
      <div data-openclaw-diff-root>
        ${params.bodyHtml}
      </div>
    </main>
    <script type="module" src="${VIEWER_LOADER_DOCUMENT_PATH}"><\/script>
  </body>
</html>`;
}
function buildRenderedSection(params) {
	return {
		...params.viewerPayload ? { viewer: renderDiffCard(params.viewerPayload) } : {},
		...params.imagePayload ? { image: renderDiffCard(params.imagePayload) } : {}
	};
}
function buildRenderedBodies(sections) {
	const viewerSections = sections.flatMap((section) => section.viewer ? [section.viewer] : []);
	const imageSections = sections.flatMap((section) => section.image ? [section.image] : []);
	return {
		...viewerSections.length > 0 ? { viewerBodyHtml: viewerSections.join("\n") } : {},
		...imageSections.length > 0 ? { imageBodyHtml: imageSections.join("\n") } : {}
	};
}
async function renderBeforeAfterDiff(input, options, target) {
	ensurePierreThemesRegistered();
	const lang = await normalizeSupportedLanguageHint(input.lang);
	const fileName = resolveBeforeAfterFileName({
		input,
		lang
	});
	const oldFile = {
		name: fileName,
		contents: input.before,
		...lang ? { lang } : {}
	};
	const newFile = {
		name: fileName,
		contents: input.after,
		...lang ? { lang } : {}
	};
	const { viewerOptions, imageOptions } = buildRenderVariants({
		options,
		target
	});
	const [viewerResult, imageResult] = await Promise.all([viewerOptions ? preloadMultiFileDiffWithFallback({
		oldFile,
		newFile,
		options: viewerOptions
	}) : Promise.resolve(void 0), imageOptions ? preloadMultiFileDiffWithFallback({
		oldFile,
		newFile,
		options: imageOptions
	}) : Promise.resolve(void 0)]);
	const [viewerPayload, imagePayload] = await Promise.all([viewerResult && viewerOptions ? normalizeDiffViewerPayloadLanguages({
		prerenderedHTML: viewerResult.prerenderedHTML,
		oldFile: viewerResult.oldFile,
		newFile: viewerResult.newFile,
		options: viewerOptions,
		langs: collectDiffPayloadLanguageHints({
			oldFile: viewerResult.oldFile,
			newFile: viewerResult.newFile
		})
	}) : Promise.resolve(void 0), imageResult && imageOptions ? normalizeDiffViewerPayloadLanguages({
		prerenderedHTML: imageResult.prerenderedHTML,
		oldFile: imageResult.oldFile,
		newFile: imageResult.newFile,
		options: imageOptions,
		langs: collectDiffPayloadLanguageHints({
			oldFile: imageResult.oldFile,
			newFile: imageResult.newFile
		})
	}) : Promise.resolve(void 0)]);
	return {
		...buildRenderedBodies([buildRenderedSection({
			...viewerPayload ? { viewerPayload } : {},
			...imagePayload ? { imagePayload } : {}
		})]),
		fileCount: 1
	};
}
async function renderPatchDiff(input, options, target) {
	ensurePierreThemesRegistered();
	const files = parsePatchFiles(input.patch).flatMap((entry) => entry.files ?? []);
	if (files.length === 0) throw new Error("Patch input did not contain any file diffs.");
	if (files.length > MAX_PATCH_FILE_COUNT) throw new Error(`Patch input contains too many files (max ${MAX_PATCH_FILE_COUNT}).`);
	if (files.reduce((sum, fileDiff) => {
		const splitLines = Number.isFinite(fileDiff.splitLineCount) ? fileDiff.splitLineCount : 0;
		const unifiedLines = Number.isFinite(fileDiff.unifiedLineCount) ? fileDiff.unifiedLineCount : 0;
		return sum + Math.max(splitLines, unifiedLines, 0);
	}, 0) > MAX_PATCH_TOTAL_LINES) throw new Error(`Patch input is too large to render (max ${MAX_PATCH_TOTAL_LINES} lines).`);
	const { viewerOptions, imageOptions } = buildRenderVariants({
		options,
		target
	});
	return {
		...buildRenderedBodies(await Promise.all(files.map(async (fileDiff) => {
			const [viewerResult, imageResult] = await Promise.all([viewerOptions ? preloadFileDiffWithFallback({
				fileDiff,
				options: viewerOptions
			}) : Promise.resolve(void 0), imageOptions ? preloadFileDiffWithFallback({
				fileDiff,
				options: imageOptions
			}) : Promise.resolve(void 0)]);
			const [viewerPayload, imagePayload] = await Promise.all([viewerResult && viewerOptions ? normalizeDiffViewerPayloadLanguages({
				prerenderedHTML: viewerResult.prerenderedHTML,
				fileDiff: viewerResult.fileDiff,
				options: viewerOptions,
				langs: collectDiffPayloadLanguageHints({ fileDiff: viewerResult.fileDiff })
			}) : Promise.resolve(void 0), imageResult && imageOptions ? normalizeDiffViewerPayloadLanguages({
				prerenderedHTML: imageResult.prerenderedHTML,
				fileDiff: imageResult.fileDiff,
				options: imageOptions,
				langs: collectDiffPayloadLanguageHints({ fileDiff: imageResult.fileDiff })
			}) : Promise.resolve(void 0)]);
			return buildRenderedSection({
				...viewerPayload ? { viewerPayload } : {},
				...imagePayload ? { imagePayload } : {}
			});
		}))),
		fileCount: files.length
	};
}
async function renderDiffDocument(input, options, target = "both") {
	const title = buildDiffTitle(input);
	const rendered = input.kind === "before_after" ? await renderBeforeAfterDiff(input, options, target) : await renderPatchDiff(input, options, target);
	return {
		...rendered.viewerBodyHtml ? { html: buildHtmlDocument({
			title,
			bodyHtml: rendered.viewerBodyHtml,
			theme: options.presentation.theme,
			imageMaxWidth: options.image.maxWidth,
			runtimeMode: "viewer"
		}) } : {},
		...rendered.imageBodyHtml ? { imageHtml: buildHtmlDocument({
			title,
			bodyHtml: rendered.imageBodyHtml,
			theme: options.presentation.theme,
			imageMaxWidth: options.image.maxWidth,
			runtimeMode: "image"
		}) } : {},
		title,
		fileCount: rendered.fileCount,
		inputKind: input.kind
	};
}
function shouldFallbackToClientHydration(error) {
	return error instanceof TypeError && error.message.includes("needs an import attribute of \"type: json\"");
}
async function preloadFileDiffWithFallback(params) {
	try {
		return await preloadFileDiff(params);
	} catch (error) {
		if (!shouldFallbackToClientHydration(error)) throw error;
		return {
			fileDiff: params.fileDiff,
			prerenderedHTML: ""
		};
	}
}
async function preloadMultiFileDiffWithFallback(params) {
	try {
		return await preloadMultiFileDiff(params);
	} catch (error) {
		if (!shouldFallbackToClientHydration(error)) throw error;
		return {
			oldFile: params.oldFile,
			newFile: params.newFile,
			prerenderedHTML: ""
		};
	}
}
//#endregion
//#region extensions/diffs/src/tool.ts
const MAX_BEFORE_AFTER_BYTES = 512 * 1024;
const MAX_PATCH_BYTES = 2 * 1024 * 1024;
const MAX_TITLE_BYTES = 1024;
const MAX_PATH_BYTES = 2048;
const MAX_LANG_BYTES = 128;
function stringEnum(values, description) {
	return Type.Unsafe({
		type: "string",
		enum: [...values],
		description
	});
}
const DiffsToolSchema = Type.Object({
	before: Type.Optional(Type.String({ description: "Original text content." })),
	after: Type.Optional(Type.String({ description: "Updated text content." })),
	patch: Type.Optional(Type.String({
		description: "Unified diff or patch text.",
		maxLength: MAX_PATCH_BYTES
	})),
	path: Type.Optional(Type.String({
		description: "Display path for before/after input.",
		maxLength: MAX_PATH_BYTES
	})),
	lang: Type.Optional(Type.String({
		description: "Optional language override for before/after input.",
		maxLength: MAX_LANG_BYTES
	})),
	title: Type.Optional(Type.String({
		description: "Optional title for the rendered diff.",
		maxLength: MAX_TITLE_BYTES
	})),
	mode: Type.Optional(stringEnum(DIFF_MODES, "Output mode: view, file, image (deprecated alias for file), or both. Default: both.")),
	theme: Type.Optional(stringEnum(DIFF_THEMES, "Viewer theme. Default: dark.")),
	layout: Type.Optional(stringEnum(DIFF_LAYOUTS, "Diff layout. Default: unified.")),
	fileQuality: Type.Optional(stringEnum(DIFF_IMAGE_QUALITY_PRESETS, "File quality preset: standard, hq, or print.")),
	fileFormat: Type.Optional(stringEnum(DIFF_OUTPUT_FORMATS, "Rendered file format: png or pdf.")),
	fileScale: Type.Optional(Type.Number({
		description: "Optional rendered-file device scale factor override (1-4).",
		minimum: 1,
		maximum: 4
	})),
	fileMaxWidth: Type.Optional(Type.Number({
		description: "Optional rendered-file max width in CSS pixels (640-2400).",
		minimum: 640,
		maximum: 2400
	})),
	imageQuality: Type.Optional(stringEnum(DIFF_IMAGE_QUALITY_PRESETS, "Deprecated alias for fileQuality.")),
	imageFormat: Type.Optional(stringEnum(DIFF_OUTPUT_FORMATS, "Deprecated alias for fileFormat.")),
	imageScale: Type.Optional(Type.Number({
		description: "Deprecated alias for fileScale.",
		minimum: 1,
		maximum: 4
	})),
	imageMaxWidth: Type.Optional(Type.Number({
		description: "Deprecated alias for fileMaxWidth.",
		minimum: 640,
		maximum: 2400
	})),
	expandUnchanged: Type.Optional(Type.Boolean({ description: "Expand unchanged sections instead of collapsing them." })),
	ttlSeconds: Type.Optional(Type.Number({
		description: "Artifact lifetime in seconds. Default: 1800. Maximum: 21600.",
		minimum: 1,
		maximum: 21600
	})),
	baseUrl: Type.Optional(Type.String({ description: "Optional gateway base URL override used when building the viewer URL. Overrides configured viewerBaseUrl, for example https://gateway.example.com." }))
}, { additionalProperties: false });
function createDiffsTool(params) {
	return {
		name: "diffs",
		label: "Diffs",
		description: "Create a read-only diff viewer from before/after text or a unified patch. Returns a gateway viewer URL for canvas use and can also render the same diff to a PNG or PDF.",
		parameters: DiffsToolSchema,
		execute: async (_toolCallId, rawParams) => {
			const toolParams = rawParams;
			const artifactContext = buildArtifactContext(params.context);
			const input = normalizeDiffInput(toolParams);
			const mode = normalizeMode(toolParams.mode, params.defaults.mode);
			const theme = normalizeTheme(toolParams.theme, params.defaults.theme);
			const layout = normalizeLayout(toolParams.layout, params.defaults.layout);
			const expandUnchanged = toolParams.expandUnchanged === true;
			const ttlMs = normalizeTtlMs(toolParams.ttlSeconds);
			const image = resolveDiffImageRenderOptions({
				defaults: params.defaults,
				fileFormat: normalizeOutputFormat(toolParams.fileFormat ?? toolParams.imageFormat ?? toolParams.format),
				fileQuality: normalizeFileQuality(toolParams.fileQuality ?? toolParams.imageQuality),
				fileScale: toolParams.fileScale ?? toolParams.imageScale,
				fileMaxWidth: toolParams.fileMaxWidth ?? toolParams.imageMaxWidth
			});
			const renderTarget = resolveRenderTarget(mode);
			const rendered = await renderDiffDocument(input, {
				presentation: {
					...params.defaults,
					layout,
					theme
				},
				image,
				expandUnchanged
			}, renderTarget);
			const screenshotter = params.screenshotter ?? new PlaywrightDiffScreenshotter({ config: params.api.config });
			if (isArtifactOnlyMode(mode)) {
				const artifactFile = await renderDiffArtifactFile({
					screenshotter,
					store: params.store,
					html: requireRenderedHtml(rendered.imageHtml, "image"),
					theme,
					image,
					ttlMs,
					context: artifactContext
				});
				return {
					content: [{
						type: "text",
						text: buildFileArtifactMessage({
							format: image.format,
							filePath: artifactFile.path
						})
					}],
					details: buildArtifactDetails({
						baseDetails: {
							...artifactFile.artifactId ? { artifactId: artifactFile.artifactId } : {},
							...artifactFile.expiresAt ? { expiresAt: artifactFile.expiresAt } : {},
							title: rendered.title,
							inputKind: rendered.inputKind,
							fileCount: rendered.fileCount,
							mode,
							...artifactContext ? { context: artifactContext } : {}
						},
						artifactFile,
						image
					})
				};
			}
			const artifact = await params.store.createArtifact({
				html: requireRenderedHtml(rendered.html, "viewer"),
				title: rendered.title,
				inputKind: rendered.inputKind,
				fileCount: rendered.fileCount,
				ttlMs,
				context: artifactContext
			});
			const viewerUrl = buildViewerUrl({
				config: params.api.config,
				viewerPath: artifact.viewerPath,
				baseUrl: normalizeBaseUrl(toolParams.baseUrl) ?? params.viewerBaseUrl
			});
			const baseDetails = {
				artifactId: artifact.id,
				viewerUrl,
				viewerPath: artifact.viewerPath,
				title: artifact.title,
				expiresAt: artifact.expiresAt,
				inputKind: artifact.inputKind,
				fileCount: artifact.fileCount,
				mode,
				...artifactContext ? { context: artifactContext } : {}
			};
			if (mode === "view") return {
				content: [{
					type: "text",
					text: `Diff viewer ready.\n${viewerUrl}`
				}],
				details: baseDetails
			};
			try {
				const artifactFile = await renderDiffArtifactFile({
					screenshotter,
					store: params.store,
					artifactId: artifact.id,
					html: requireRenderedHtml(rendered.imageHtml, "image"),
					theme,
					image
				});
				await params.store.updateFilePath(artifact.id, artifactFile.path);
				return {
					content: [{
						type: "text",
						text: buildFileArtifactMessage({
							format: image.format,
							filePath: artifactFile.path,
							viewerUrl
						})
					}],
					details: buildArtifactDetails({
						baseDetails,
						artifactFile,
						image
					})
				};
			} catch (error) {
				if (mode === "both") {
					const errorMessage = formatErrorMessage(error);
					return {
						content: [{
							type: "text",
							text: `Diff viewer ready.\n${viewerUrl}\nFile rendering failed: ${errorMessage}`
						}],
						details: {
							...baseDetails,
							fileError: errorMessage,
							imageError: errorMessage
						}
					};
				}
				throw error;
			}
		}
	};
}
function normalizeFileQuality(fileQuality) {
	return fileQuality && DIFF_IMAGE_QUALITY_PRESETS.includes(fileQuality) ? fileQuality : void 0;
}
function normalizeOutputFormat(format) {
	return format && DIFF_OUTPUT_FORMATS.includes(format) ? format : void 0;
}
function isArtifactOnlyMode(mode) {
	return mode === "image" || mode === "file";
}
function resolveRenderTarget(mode) {
	if (mode === "view") return "viewer";
	if (isArtifactOnlyMode(mode)) return "image";
	return "both";
}
function requireRenderedHtml(html, target) {
	if (html !== void 0) return html;
	throw new Error(`Missing ${target} render output.`);
}
function buildArtifactDetails(params) {
	return {
		...params.baseDetails,
		filePath: params.artifactFile.path,
		imagePath: params.artifactFile.path,
		path: params.artifactFile.path,
		fileBytes: params.artifactFile.bytes,
		imageBytes: params.artifactFile.bytes,
		format: params.image.format,
		fileFormat: params.image.format,
		fileQuality: params.image.qualityPreset,
		imageQuality: params.image.qualityPreset,
		fileScale: params.image.scale,
		imageScale: params.image.scale,
		fileMaxWidth: params.image.maxWidth,
		imageMaxWidth: params.image.maxWidth
	};
}
function buildFileArtifactMessage(params) {
	const lines = params.viewerUrl ? [`Diff viewer: ${params.viewerUrl}`] : [];
	lines.push(`Diff ${params.format.toUpperCase()} generated at: ${params.filePath}`);
	lines.push("Use the `message` tool with `path` or `filePath` to send this file.");
	return lines.join("\n");
}
async function renderDiffArtifactFile(params) {
	const standaloneArtifact = params.artifactId ? void 0 : await params.store.createStandaloneFileArtifact({
		format: params.image.format,
		ttlMs: params.ttlMs,
		context: params.context
	});
	const outputPath = params.artifactId ? params.store.allocateFilePath(params.artifactId, params.image.format) : standaloneArtifact.filePath;
	await params.screenshotter.screenshotHtml({
		html: params.html,
		outputPath,
		theme: params.theme,
		image: params.image
	});
	return {
		path: outputPath,
		bytes: (await fs.stat(outputPath)).size,
		...standaloneArtifact?.id ? { artifactId: standaloneArtifact.id } : {},
		...standaloneArtifact?.expiresAt ? { expiresAt: standaloneArtifact.expiresAt } : {}
	};
}
function buildArtifactContext(context) {
	if (!context) return;
	const artifactContext = {
		agentId: normalizeOptionalString(context.agentId),
		sessionId: normalizeOptionalString(context.sessionId),
		messageChannel: normalizeOptionalString(context.messageChannel),
		agentAccountId: normalizeOptionalString(context.agentAccountId)
	};
	return Object.values(artifactContext).some((value) => value !== void 0) ? artifactContext : void 0;
}
function normalizeDiffInput(params) {
	const patch = params.patch?.trim();
	const before = params.before;
	const after = params.after;
	if (patch) {
		assertMaxBytes(patch, "patch", MAX_PATCH_BYTES);
		if (before !== void 0 || after !== void 0) throw new PluginToolInputError("Provide either patch or before/after input, not both.");
		const title = params.title?.trim();
		if (title) assertMaxBytes(title, "title", MAX_TITLE_BYTES);
		return {
			kind: "patch",
			patch,
			title
		};
	}
	if (before === void 0 || after === void 0) throw new PluginToolInputError("Provide patch or both before and after text.");
	assertMaxBytes(before, "before", MAX_BEFORE_AFTER_BYTES);
	assertMaxBytes(after, "after", MAX_BEFORE_AFTER_BYTES);
	const path = normalizeOptionalString(params.path);
	const lang = normalizeOptionalString(params.lang);
	const title = normalizeOptionalString(params.title);
	if (path) assertMaxBytes(path, "path", MAX_PATH_BYTES);
	if (lang) assertMaxBytes(lang, "lang", MAX_LANG_BYTES);
	if (title) assertMaxBytes(title, "title", MAX_TITLE_BYTES);
	return {
		kind: "before_after",
		before,
		after,
		path,
		lang,
		title
	};
}
function assertMaxBytes(value, label, maxBytes) {
	if (Buffer.byteLength(value, "utf8") <= maxBytes) return;
	throw new PluginToolInputError(`${label} exceeds maximum size (${maxBytes} bytes).`);
}
function normalizeBaseUrl(baseUrl) {
	const normalized = baseUrl?.trim();
	if (!normalized) return;
	try {
		return normalizeViewerBaseUrl(normalized);
	} catch {
		throw new PluginToolInputError(`Invalid baseUrl: ${normalized}`);
	}
}
function normalizeMode(mode, fallback) {
	return mode && DIFF_MODES.includes(mode) ? mode : fallback;
}
function normalizeTheme(theme, fallback) {
	return theme && DIFF_THEMES.includes(theme) ? theme : fallback;
}
function normalizeLayout(layout, fallback) {
	return layout && DIFF_LAYOUTS.includes(layout) ? layout : fallback;
}
function normalizeTtlMs(ttlSeconds) {
	if (!Number.isFinite(ttlSeconds) || ttlSeconds === void 0) return;
	return Math.floor(ttlSeconds * 1e3);
}
var PluginToolInputError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "ToolInputError";
	}
};
//#endregion
//#region extensions/diffs/src/plugin.ts
function registerDiffsPlugin(api) {
	const defaults = resolveDiffsPluginDefaults(api.pluginConfig);
	const security = resolveDiffsPluginSecurity(api.pluginConfig);
	const viewerBaseUrl = resolveDiffsPluginViewerBaseUrl(api.pluginConfig);
	const store = new DiffArtifactStore({
		rootDir: path.join((0, api_exports.resolvePreferredOpenClawTmpDir)(), "openclaw-diffs"),
		logger: api.logger
	});
	api.registerTool((ctx) => createDiffsTool({
		api,
		store,
		defaults,
		viewerBaseUrl,
		context: ctx
	}), { name: "diffs" });
	api.registerHttpRoute({
		path: "/plugins/diffs",
		auth: "plugin",
		match: "prefix",
		handler: createDiffsHttpHandler({
			store,
			logger: api.logger,
			allowRemoteViewer: security.allowRemoteViewer,
			trustedProxies: api.config.gateway?.trustedProxies,
			allowRealIpFallback: api.config.gateway?.allowRealIpFallback === true
		})
	});
	api.on("before_prompt_build", async () => ({ prependSystemContext: DIFFS_AGENT_GUIDANCE }));
}
//#endregion
//#region extensions/diffs/index.ts
var diffs_default = (0, api_exports.definePluginEntry)({
	id: "diffs",
	name: "Diffs",
	description: "Read-only diff viewer and PNG/PDF renderer for agents.",
	configSchema: diffsPluginConfigSchema,
	register: registerDiffsPlugin
});
//#endregion
export { diffs_default as default };
