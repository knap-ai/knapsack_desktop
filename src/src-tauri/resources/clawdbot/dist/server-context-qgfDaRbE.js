import { i as formatErrorMessage, r as extractErrorCode } from "./errors-D8p6rxH8.js";
import { d as readStringValue, i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-eyAoWbVe.js";
import { a as loadConfig, g as writeConfigFile, r as createConfigIO } from "./io-5pxHCi7V.js";
import { n as asNullableRecord } from "./record-coerce-Bls3blVy.js";
import { r as getRuntimeConfigSnapshot } from "./runtime-snapshot-BwqEmc6G.js";
import { t as parseBooleanValue } from "./boolean-C7EklDWC.js";
import { a as getImageMetadata, l as resizeToJpeg, r as buildImageResizeSideGrid, t as IMAGE_REDUCE_QUALITY_STEPS } from "./image-ops-f0rEOT4L.js";
import { a as ensureMediaDir, l as saveMediaBuffer } from "./store-CFeRgpZO.js";
import { n as deriveDefaultBrowserCdpPortRange } from "./port-defaults-BdplfuBS.js";
import "./text-runtime-DTMxvodz.js";
import "./browser-config-runtime-Db5LKdcQ.js";
import "./browser-setup-tools-B1frXn0-.js";
import { C as ACT_MAX_WAIT_TIME_MS, D as matchBrowserUrlPattern, S as ACT_MAX_CLICK_DELAY_MS, _ as normalizeCdpWsUrl, a as resolveOpenClawUserDataDir, b as normalizeBrowserFormField, d as CONTENT_ROLES, f as INTERACTIVE_ROLES, h as createTargetViaCdp, i as launchOpenClawChrome, l as getRoleSnapshotStats, m as captureScreenshot, n as isChromeCdpReady, o as stopOpenClawChrome, p as STRUCTURAL_ROLES, r as isChromeReachable, v as snapshotAria, w as normalizeActBoundedNonNegativeMs } from "./chrome-DKrTqDG1.js";
import { c as DEFAULT_DOWNLOAD_DIR, d as resolveExistingPathsWithinRoot, l as DEFAULT_TRACE_DIR, n as DEFAULT_AI_SNAPSHOT_MAX_CHARS, p as resolveWritablePathWithinRoot, t as DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS, u as DEFAULT_UPLOAD_DIR } from "./utils-DSPbCLVw.js";
import { n as normalizeString } from "./record-shared-DQoQZOFY.js";
import { A as BrowserTargetAmbiguousError, D as BrowserResetUnsupportedError, E as BrowserProfileUnavailableError, I as assertBrowserNavigationResultAllowed, L as requiresInspectableBrowserNavigationRedirectsForUrl, M as toBrowserErrorResponse, N as InvalidBrowserNavigationUrlError, O as BrowserResourceExhaustedError, P as assertBrowserNavigationAllowed, R as withBrowserNavigationPolicy, S as usesFastLoopbackCdpProbeClass, T as BrowserProfileNotFoundError, _ as CHROME_MCP_ATTACH_READY_WINDOW_MS, a as fetchOk, c as normalizeCdpHttpBaseForJsonEndpoints, i as fetchJson, j as BrowserValidationError, k as BrowserTabNotFoundError, n as assertCdpEndpointAllowed, p as CDP_JSON_NEW_TIMEOUT_MS, t as appendCdpPath, u as parseBrowserHttpUrl, w as BrowserConflictError, x as resolveCdpReachabilityTimeouts } from "./cdp.helpers-CJUeV0SO.js";
import { r as resolveBrowserExecutableForPlatform } from "./chrome.executables-WqX45Anh.js";
import "./control-auth-hABiqRrk.js";
import { n as resolveProfile, t as resolveBrowserConfig } from "./config-DldYxDHs.js";
import { t as movePathToTrash } from "./trash-992BjVhp.js";
import fs from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
import crypto, { randomUUID } from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
//#region extensions/browser/src/browser/chrome-mcp.ts
const DEFAULT_CHROME_MCP_COMMAND = "npx";
const DEFAULT_CHROME_MCP_ARGS = [
	"-y",
	"chrome-devtools-mcp@latest",
	"--autoConnect",
	"--experimentalStructuredContent",
	"--experimental-page-id-routing"
];
const CHROME_MCP_NEW_PAGE_TIMEOUT_MS = 5e3;
const CHROME_MCP_NAVIGATE_TIMEOUT_MS = 2e4;
const sessions = /* @__PURE__ */ new Map();
const pendingSessions = /* @__PURE__ */ new Map();
let sessionFactory = null;
function asPages(value) {
	if (!Array.isArray(value)) return [];
	const out = [];
	for (const entry of value) {
		const record = asNullableRecord(entry);
		if (!record || typeof record.id !== "number") continue;
		out.push({
			id: record.id,
			url: readStringValue(record.url),
			selected: record.selected === true
		});
	}
	return out;
}
function parsePageId(targetId) {
	const parsed = Number.parseInt(targetId.trim(), 10);
	if (!Number.isFinite(parsed)) throw new BrowserTabNotFoundError();
	return parsed;
}
function toBrowserTabs(pages) {
	return pages.map((page) => ({
		targetId: String(page.id),
		title: "",
		url: page.url ?? "",
		type: "page"
	}));
}
function extractStructuredContent(result) {
	return asNullableRecord(result.structuredContent) ?? {};
}
function extractTextContent(result) {
	return (Array.isArray(result.content) ? result.content : []).map((entry) => {
		const record = asNullableRecord(entry);
		return record && typeof record.text === "string" ? record.text : "";
	}).filter(Boolean);
}
function extractTextPages(result) {
	const pages = [];
	for (const block of extractTextContent(result)) for (const line of block.split(/\r?\n/)) {
		const match = line.match(/^\s*(\d+):\s+(.+?)(?:\s+\[(selected)\])?\s*$/i);
		if (!match) continue;
		pages.push({
			id: Number.parseInt(match[1] ?? "", 10),
			url: normalizeOptionalString(match[2]),
			selected: Boolean(match[3])
		});
	}
	return pages;
}
function extractStructuredPages(result) {
	const structured = asPages(extractStructuredContent(result).pages);
	return structured.length > 0 ? structured : extractTextPages(result);
}
function extractSnapshot(result) {
	const snapshot = asNullableRecord(extractStructuredContent(result).snapshot);
	if (!snapshot) throw new Error("Chrome MCP snapshot response was missing structured snapshot data.");
	return snapshot;
}
function extractJsonBlock(text) {
	const raw = text.match(/```json\s*([\s\S]*?)\s*```/i)?.[1]?.trim() || text.trim();
	return raw ? JSON.parse(raw) : null;
}
function extractMessageText(result) {
	const message = extractStructuredContent(result).message;
	if (typeof message === "string" && message.trim()) return message;
	return extractTextContent(result).find((block) => block.trim()) ?? "";
}
function extractToolErrorMessage(result, name) {
	return extractMessageText(result).trim() || `Chrome MCP tool "${name}" failed.`;
}
function extractJsonMessage(result) {
	const candidates = [extractMessageText(result), ...extractTextContent(result)].filter((text) => text.trim());
	let lastError;
	for (const candidate of candidates) try {
		return extractJsonBlock(candidate);
	} catch (err) {
		lastError = err;
	}
	if (lastError) throw lastError;
	return null;
}
function normalizeChromeMcpUserDataDir(userDataDir) {
	const trimmed = userDataDir?.trim();
	return trimmed ? trimmed : void 0;
}
function buildChromeMcpSessionCacheKey(profileName, userDataDir) {
	return JSON.stringify([profileName, normalizeChromeMcpUserDataDir(userDataDir) ?? ""]);
}
function cacheKeyMatchesProfileName(cacheKey, profileName) {
	try {
		const parsed = JSON.parse(cacheKey);
		return Array.isArray(parsed) && parsed[0] === profileName;
	} catch {
		return false;
	}
}
async function closeChromeMcpSessionsForProfile(profileName, keepKey) {
	let closed = false;
	for (const key of Array.from(pendingSessions.keys())) if (key !== keepKey && cacheKeyMatchesProfileName(key, profileName)) {
		pendingSessions.delete(key);
		closed = true;
	}
	for (const [key, session] of Array.from(sessions.entries())) if (key !== keepKey && cacheKeyMatchesProfileName(key, profileName)) {
		sessions.delete(key);
		closed = true;
		await session.client.close().catch(() => {});
	}
	return closed;
}
function buildChromeMcpArgs(userDataDir) {
	const normalizedUserDataDir = normalizeChromeMcpUserDataDir(userDataDir);
	return normalizedUserDataDir ? [
		...DEFAULT_CHROME_MCP_ARGS,
		"--userDataDir",
		normalizedUserDataDir
	] : [...DEFAULT_CHROME_MCP_ARGS];
}
async function createRealSession(profileName, userDataDir) {
	const transport = new StdioClientTransport({
		command: DEFAULT_CHROME_MCP_COMMAND,
		args: buildChromeMcpArgs(userDataDir),
		stderr: "pipe"
	});
	const client = new Client({
		name: "openclaw-browser",
		version: "0.0.0"
	}, {});
	return {
		client,
		transport,
		ready: (async () => {
			try {
				await client.connect(transport);
				if (!(await client.listTools()).tools.some((tool) => tool.name === "list_pages")) throw new Error("Chrome MCP server did not expose the expected navigation tools.");
			} catch (err) {
				await client.close().catch(() => {});
				throw new BrowserProfileUnavailableError(`Chrome MCP existing-session attach failed for profile "${profileName}". Make sure ${userDataDir ? `the configured Chromium user data dir (${userDataDir})` : "Google Chrome's default profile"} is running locally with remote debugging enabled. Details: ${String(err)}`);
			}
		})()
	};
}
async function getSession(profileName, userDataDir) {
	const cacheKey = buildChromeMcpSessionCacheKey(profileName, userDataDir);
	await closeChromeMcpSessionsForProfile(profileName, cacheKey);
	let session = sessions.get(cacheKey);
	if (session && session.transport.pid === null) {
		sessions.delete(cacheKey);
		session = void 0;
	}
	if (!session) {
		let pending = pendingSessions.get(cacheKey);
		if (!pending) {
			pending = (async () => {
				const created = await (sessionFactory ?? createRealSession)(profileName, userDataDir);
				if (pendingSessions.get(cacheKey) === pending) sessions.set(cacheKey, created);
				else await created.client.close().catch(() => {});
				return created;
			})();
			pendingSessions.set(cacheKey, pending);
		}
		try {
			session = await pending;
		} finally {
			if (pendingSessions.get(cacheKey) === pending) pendingSessions.delete(cacheKey);
		}
	}
	try {
		await session.ready;
		return session;
	} catch (err) {
		if (sessions.get(cacheKey)?.transport === session.transport) sessions.delete(cacheKey);
		throw err;
	}
}
async function callTool(profileName, userDataDir, name, args = {}) {
	const cacheKey = buildChromeMcpSessionCacheKey(profileName, userDataDir);
	const session = await getSession(profileName, userDataDir);
	let result;
	try {
		result = await session.client.callTool({
			name,
			arguments: args
		});
	} catch (err) {
		sessions.delete(cacheKey);
		await session.client.close().catch(() => {});
		throw err;
	}
	if (result.isError) throw new Error(extractToolErrorMessage(result, name));
	return result;
}
async function withTempFile(fn) {
	const dir = await fs$1.mkdtemp(path.join(resolvePreferredOpenClawTmpDir(), "openclaw-chrome-mcp-"));
	const filePath = path.join(dir, randomUUID());
	try {
		return await fn(filePath);
	} finally {
		await fs$1.rm(dir, {
			recursive: true,
			force: true
		}).catch(() => {});
	}
}
async function findPageById(profileName, pageId, userDataDir) {
	const page = (await listChromeMcpPages(profileName, userDataDir)).find((entry) => entry.id === pageId);
	if (!page) throw new BrowserTabNotFoundError();
	return page;
}
async function ensureChromeMcpAvailable(profileName, userDataDir) {
	await getSession(profileName, userDataDir);
}
function getChromeMcpPid(profileName) {
	for (const [key, session] of sessions.entries()) if (cacheKeyMatchesProfileName(key, profileName)) return session.transport.pid ?? null;
	return null;
}
async function closeChromeMcpSession(profileName) {
	return await closeChromeMcpSessionsForProfile(profileName);
}
async function listChromeMcpPages(profileName, userDataDir) {
	return extractStructuredPages(await callTool(profileName, userDataDir, "list_pages"));
}
async function listChromeMcpTabs(profileName, userDataDir) {
	return toBrowserTabs(await listChromeMcpPages(profileName, userDataDir));
}
async function openChromeMcpTab(profileName, url, userDataDir) {
	const targetUrl = url.trim() || "about:blank";
	const pages = extractStructuredPages(await callTool(profileName, userDataDir, "new_page", {
		url: "about:blank",
		timeout: CHROME_MCP_NEW_PAGE_TIMEOUT_MS
	}));
	const chosen = pages.find((page) => page.selected) ?? pages.at(-1);
	if (!chosen) throw new Error("Chrome MCP did not return the created page.");
	const targetId = String(chosen.id);
	return {
		targetId,
		title: "",
		url: targetUrl === "about:blank" ? chosen.url ?? targetUrl : (await navigateChromeMcpPage({
			profileName,
			userDataDir,
			targetId,
			url: targetUrl,
			timeoutMs: CHROME_MCP_NAVIGATE_TIMEOUT_MS
		})).url,
		type: "page"
	};
}
async function focusChromeMcpTab(profileName, targetId, userDataDir) {
	await callTool(profileName, userDataDir, "select_page", {
		pageId: parsePageId(targetId),
		bringToFront: true
	});
}
async function closeChromeMcpTab(profileName, targetId, userDataDir) {
	await callTool(profileName, userDataDir, "close_page", { pageId: parsePageId(targetId) });
}
async function navigateChromeMcpPage(params) {
	await callTool(params.profileName, params.userDataDir, "navigate_page", {
		pageId: parsePageId(params.targetId),
		type: "url",
		url: params.url,
		...typeof params.timeoutMs === "number" ? { timeout: params.timeoutMs } : {}
	});
	return { url: (await findPageById(params.profileName, parsePageId(params.targetId), params.userDataDir)).url ?? params.url };
}
async function takeChromeMcpSnapshot(params) {
	return extractSnapshot(await callTool(params.profileName, params.userDataDir, "take_snapshot", { pageId: parsePageId(params.targetId) }));
}
async function takeChromeMcpScreenshot(params) {
	return await withTempFile(async (filePath) => {
		await callTool(params.profileName, params.userDataDir, "take_screenshot", {
			pageId: parsePageId(params.targetId),
			filePath,
			format: params.format ?? "png",
			...params.uid ? { uid: params.uid } : {},
			...params.fullPage ? { fullPage: true } : {}
		});
		return await fs$1.readFile(filePath);
	});
}
async function clickChromeMcpElement(params) {
	await callTool(params.profileName, params.userDataDir, "click", {
		pageId: parsePageId(params.targetId),
		uid: params.uid,
		...params.doubleClick ? { dblClick: true } : {}
	});
}
async function fillChromeMcpElement(params) {
	await callTool(params.profileName, params.userDataDir, "fill", {
		pageId: parsePageId(params.targetId),
		uid: params.uid,
		value: params.value
	});
}
async function fillChromeMcpForm(params) {
	await callTool(params.profileName, params.userDataDir, "fill_form", {
		pageId: parsePageId(params.targetId),
		elements: params.elements
	});
}
async function hoverChromeMcpElement(params) {
	await callTool(params.profileName, params.userDataDir, "hover", {
		pageId: parsePageId(params.targetId),
		uid: params.uid
	});
}
async function dragChromeMcpElement(params) {
	await callTool(params.profileName, params.userDataDir, "drag", {
		pageId: parsePageId(params.targetId),
		from_uid: params.fromUid,
		to_uid: params.toUid
	});
}
async function uploadChromeMcpFile(params) {
	await callTool(params.profileName, params.userDataDir, "upload_file", {
		pageId: parsePageId(params.targetId),
		uid: params.uid,
		filePath: params.filePath
	});
}
async function pressChromeMcpKey(params) {
	await callTool(params.profileName, params.userDataDir, "press_key", {
		pageId: parsePageId(params.targetId),
		key: params.key
	});
}
async function resizeChromeMcpPage(params) {
	await callTool(params.profileName, params.userDataDir, "resize_page", {
		pageId: parsePageId(params.targetId),
		width: params.width,
		height: params.height
	});
}
async function evaluateChromeMcpScript(params) {
	return extractJsonMessage(await callTool(params.profileName, params.userDataDir, "evaluate_script", {
		pageId: parsePageId(params.targetId),
		function: params.fn,
		...params.args?.length ? { args: params.args } : {}
	}));
}
//#endregion
//#region extensions/browser/src/browser/profile-capabilities.ts
function getBrowserProfileCapabilities(profile) {
	if (profile.driver === "existing-session") return {
		mode: "local-existing-session",
		isRemote: false,
		usesChromeMcp: true,
		usesPersistentPlaywright: false,
		supportsPerTabWs: false,
		supportsJsonTabEndpoints: false,
		supportsReset: false,
		supportsManagedTabLimit: false
	};
	if (!profile.cdpIsLoopback) return {
		mode: "remote-cdp",
		isRemote: true,
		usesChromeMcp: false,
		usesPersistentPlaywright: true,
		supportsPerTabWs: false,
		supportsJsonTabEndpoints: false,
		supportsReset: false,
		supportsManagedTabLimit: false
	};
	return {
		mode: "local-managed",
		isRemote: false,
		usesChromeMcp: false,
		usesPersistentPlaywright: false,
		supportsPerTabWs: true,
		supportsJsonTabEndpoints: true,
		supportsReset: true,
		supportsManagedTabLimit: true
	};
}
function resolveDefaultSnapshotFormat(params) {
	if (params.explicitFormat) return params.explicitFormat;
	if (params.mode === "efficient") return "ai";
	if (getBrowserProfileCapabilities(params.profile).mode === "local-existing-session") return "ai";
	return params.hasPlaywright ? "ai" : "aria";
}
function shouldUsePlaywrightForScreenshot(params) {
	return !params.wsUrl || Boolean(params.ref) || Boolean(params.element);
}
function shouldUsePlaywrightForAriaSnapshot(params) {
	return !params.wsUrl;
}
//#endregion
//#region extensions/browser/src/browser/pw-ai-module.ts
let pwAiModuleSoft = null;
let pwAiModuleStrict = null;
function isModuleNotFoundError(err) {
	if (extractErrorCode(err) === "ERR_MODULE_NOT_FOUND") return true;
	const msg = formatErrorMessage(err);
	return msg.includes("Cannot find module") || msg.includes("Cannot find package") || msg.includes("Failed to resolve import") || msg.includes("Failed to resolve entry for package") || msg.includes("Failed to load url");
}
async function loadPwAiModule(mode) {
	try {
		return await import("./pw-ai-BJRFEth4.js");
	} catch (err) {
		if (mode === "soft") return null;
		if (isModuleNotFoundError(err)) return null;
		throw err;
	}
}
async function getPwAiModule$1(opts) {
	if ((opts?.mode ?? "soft") === "soft") {
		if (!pwAiModuleSoft) pwAiModuleSoft = loadPwAiModule("soft");
		return await pwAiModuleSoft;
	}
	if (!pwAiModuleStrict) pwAiModuleStrict = loadPwAiModule("strict");
	return await pwAiModuleStrict;
}
//#endregion
//#region extensions/browser/src/browser/routes/utils.ts
/**
* Extract profile name from query string or body and get profile context.
* Query string takes precedence over body for consistency with GET routes.
*/
function getProfileContext(req, ctx) {
	let profileName;
	if (typeof req.query.profile === "string") profileName = normalizeOptionalString(req.query.profile);
	if (!profileName && req.body && typeof req.body === "object") {
		const body = req.body;
		if (typeof body.profile === "string") profileName = normalizeOptionalString(body.profile);
	}
	try {
		return ctx.forProfile(profileName);
	} catch (err) {
		return {
			error: String(err),
			status: 404
		};
	}
}
function jsonError(res, status, message) {
	res.status(status).json({ error: message });
}
function toStringOrEmpty(value) {
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return normalizeOptionalString(String(value)) ?? "";
	return "";
}
function toNumber(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	const normalized = typeof value === "string" ? normalizeOptionalString(value) : void 0;
	if (normalized) {
		const parsed = Number(normalized);
		return Number.isFinite(parsed) ? parsed : void 0;
	}
}
function toBoolean(value) {
	return parseBooleanValue(value, {
		truthy: [
			"true",
			"1",
			"yes"
		],
		falsy: [
			"false",
			"0",
			"no"
		]
	});
}
function toStringArray(value) {
	if (!Array.isArray(value)) return;
	const strings = value.map((v) => toStringOrEmpty(v)).filter(Boolean);
	return strings.length ? strings : void 0;
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.shared.ts
const SELECTOR_UNSUPPORTED_MESSAGE = [
	"Error: 'selector' is not supported. Use 'ref' from snapshot instead.",
	"",
	"Example workflow:",
	"1. snapshot action to get page state with refs",
	"2. act with ref: \"e123\" to interact with element",
	"",
	"This is more reliable for modern SPAs."
].join("\n");
function readBody(req) {
	const body = req.body;
	if (!body || typeof body !== "object" || Array.isArray(body)) return {};
	return body;
}
function resolveTargetIdFromBody(body) {
	return (normalizeOptionalString(body.targetId) ?? "") || void 0;
}
function resolveTargetIdFromQuery(query) {
	return (normalizeOptionalString(query.targetId) ?? "") || void 0;
}
function handleRouteError(ctx, res, err) {
	const mapped = ctx.mapTabError(err);
	if (mapped) return jsonError(res, mapped.status, mapped.message);
	const browserMapped = toBrowserErrorResponse(err);
	if (browserMapped) return jsonError(res, browserMapped.status, browserMapped.message);
	jsonError(res, 500, String(err));
}
function resolveProfileContext(req, res, ctx) {
	const profileCtx = getProfileContext(req, ctx);
	if ("error" in profileCtx) {
		jsonError(res, profileCtx.status, profileCtx.error);
		return null;
	}
	return profileCtx;
}
async function getPwAiModule() {
	return await getPwAiModule$1({ mode: "soft" });
}
async function requirePwAi(res, feature) {
	const mod = await getPwAiModule();
	if (mod) return mod;
	jsonError(res, 501, [
		`Playwright is not available in this gateway build; '${feature}' is unsupported.`,
		"Install the full Playwright package (not playwright-core) and restart the gateway, or reinstall with browser support.",
		"Docs: /tools/browser#playwright-requirement"
	].join("\n"));
	return null;
}
async function withRouteTabContext(params) {
	const profileCtx = resolveProfileContext(params.req, params.res, params.ctx);
	if (!profileCtx) return;
	try {
		const tab = await profileCtx.ensureTabAvailable(params.targetId);
		return await params.run({
			profileCtx,
			tab,
			cdpUrl: profileCtx.profile.cdpUrl
		});
	} catch (err) {
		handleRouteError(params.ctx, params.res, err);
		return;
	}
}
async function withPlaywrightRouteContext(params) {
	return await withRouteTabContext({
		req: params.req,
		res: params.res,
		ctx: params.ctx,
		targetId: params.targetId,
		run: async ({ profileCtx, tab, cdpUrl }) => {
			const pw = await requirePwAi(params.res, params.feature);
			if (!pw) return;
			return await params.run({
				profileCtx,
				tab,
				cdpUrl,
				pw
			});
		}
	});
}
//#endregion
//#region extensions/browser/src/browser/routes/existing-session-limits.ts
const EXISTING_SESSION_LIMITS = {
	act: {
		clickSelector: "existing-session click does not support selector targeting yet; use ref.",
		clickButtonOrModifiers: "existing-session click currently supports left-click only (no button overrides/modifiers).",
		typeSelector: "existing-session type does not support selector targeting yet; use ref.",
		typeSlowly: "existing-session type does not support slowly=true; use fill/press instead.",
		pressDelay: "existing-session press does not support delayMs.",
		hoverSelector: "existing-session hover does not support selector targeting yet; use ref.",
		hoverTimeout: "existing-session hover does not support timeoutMs overrides.",
		scrollSelector: "existing-session scrollIntoView does not support selector targeting yet; use ref.",
		scrollTimeout: "existing-session scrollIntoView does not support timeoutMs overrides.",
		dragSelector: "existing-session drag does not support selector targeting yet; use startRef/endRef.",
		dragTimeout: "existing-session drag does not support timeoutMs overrides.",
		selectSelector: "existing-session select does not support selector targeting yet; use ref.",
		selectSingleValue: "existing-session select currently supports a single value only.",
		selectTimeout: "existing-session select does not support timeoutMs overrides.",
		fillTimeout: "existing-session fill does not support timeoutMs overrides.",
		waitNetworkIdle: "existing-session wait does not support loadState=networkidle yet.",
		evaluateTimeout: "existing-session evaluate does not support timeoutMs overrides.",
		batch: "existing-session batch is not supported yet; send actions individually."
	},
	hooks: {
		uploadElement: "existing-session file uploads do not support element selectors; use ref/inputRef.",
		uploadSingleFile: "existing-session file uploads currently support one file at a time.",
		uploadRefRequired: "existing-session file uploads require ref or inputRef.",
		dialogTimeout: "existing-session dialog handling does not support timeoutMs."
	},
	download: {
		waitUnsupported: "download waiting is not supported for existing-session profiles yet.",
		downloadUnsupported: "downloads are not supported for existing-session profiles yet."
	},
	snapshot: {
		pdfUnsupported: "pdf is not supported for existing-session profiles yet; use screenshot/snapshot instead.",
		screenshotElement: "element screenshots are not supported for existing-session profiles; use ref from snapshot.",
		snapshotSelector: "selector/frame snapshots are not supported for existing-session profiles; snapshot the whole page and use refs."
	},
	responseBody: "response body is not supported for existing-session profiles yet."
};
//#endregion
//#region extensions/browser/src/browser/routes/output-paths.ts
async function ensureOutputRootDir(rootDir) {
	await fs$1.mkdir(rootDir, { recursive: true });
}
async function resolveWritableOutputPathOrRespond(params) {
	if (params.ensureRootDir) await ensureOutputRootDir(params.rootDir);
	const pathResult = await resolveWritablePathWithinRoot({
		rootDir: params.rootDir,
		requestedPath: params.requestedPath,
		scopeLabel: params.scopeLabel,
		defaultFileName: params.defaultFileName
	});
	if (!pathResult.ok) {
		params.res.status(400).json({ error: pathResult.error });
		return null;
	}
	return pathResult.path;
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.act.download.ts
function buildDownloadRequestBase(cdpUrl, targetId, timeoutMs) {
	return {
		cdpUrl,
		targetId,
		timeoutMs: timeoutMs ?? void 0
	};
}
function registerBrowserAgentActDownloadRoutes(app, ctx) {
	app.post("/wait/download", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const out = toStringOrEmpty(body.path) || "";
		const timeoutMs = toNumber(body.timeoutMs);
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) return jsonError(res, 501, EXISTING_SESSION_LIMITS.download.waitUnsupported);
				const pw = await requirePwAi(res, "wait for download");
				if (!pw) return;
				await ensureOutputRootDir(DEFAULT_DOWNLOAD_DIR);
				let downloadPath;
				if (out.trim()) {
					const resolvedDownloadPath = await resolveWritableOutputPathOrRespond({
						res,
						rootDir: DEFAULT_DOWNLOAD_DIR,
						requestedPath: out,
						scopeLabel: "downloads directory"
					});
					if (!resolvedDownloadPath) return;
					downloadPath = resolvedDownloadPath;
				}
				const requestBase = buildDownloadRequestBase(cdpUrl, tab.targetId, timeoutMs);
				const result = await pw.waitForDownloadViaPlaywright({
					...requestBase,
					path: downloadPath
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					download: result
				});
			}
		});
	});
	app.post("/download", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const ref = toStringOrEmpty(body.ref);
		const out = toStringOrEmpty(body.path);
		const timeoutMs = toNumber(body.timeoutMs);
		if (!ref) return jsonError(res, 400, "ref is required");
		if (!out) return jsonError(res, 400, "path is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) return jsonError(res, 501, EXISTING_SESSION_LIMITS.download.downloadUnsupported);
				const pw = await requirePwAi(res, "download");
				if (!pw) return;
				await ensureOutputRootDir(DEFAULT_DOWNLOAD_DIR);
				const downloadPath = await resolveWritableOutputPathOrRespond({
					res,
					rootDir: DEFAULT_DOWNLOAD_DIR,
					requestedPath: out,
					scopeLabel: "downloads directory"
				});
				if (!downloadPath) return;
				const requestBase = buildDownloadRequestBase(cdpUrl, tab.targetId, timeoutMs);
				const result = await pw.downloadViaPlaywright({
					...requestBase,
					ref,
					path: downloadPath
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					download: result
				});
			}
		});
	});
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.act.errors.ts
const ACT_ERROR_CODES = {
	kindRequired: "ACT_KIND_REQUIRED",
	invalidRequest: "ACT_INVALID_REQUEST",
	selectorUnsupported: "ACT_SELECTOR_UNSUPPORTED",
	evaluateDisabled: "ACT_EVALUATE_DISABLED",
	unsupportedForExistingSession: "ACT_EXISTING_SESSION_UNSUPPORTED",
	targetIdMismatch: "ACT_TARGET_ID_MISMATCH"
};
function jsonActError(res, status, code, message) {
	res.status(status).json({
		error: message,
		code
	});
}
function browserEvaluateDisabledMessage(action) {
	return [action === "wait" ? "wait --fn is disabled by config (browser.evaluateEnabled=false)." : "act:evaluate is disabled by config (browser.evaluateEnabled=false).", "Docs: /gateway/configuration#browser-openclaw-managed-browser"].join("\n");
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.act.hooks.ts
function registerBrowserAgentActHookRoutes(app, ctx) {
	app.post("/hooks/file-chooser", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const ref = toStringOrEmpty(body.ref) || void 0;
		const inputRef = toStringOrEmpty(body.inputRef) || void 0;
		const element = toStringOrEmpty(body.element) || void 0;
		const paths = toStringArray(body.paths) ?? [];
		const timeoutMs = toNumber(body.timeoutMs);
		if (!paths.length) return jsonError(res, 400, "paths are required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				const uploadPathsResult = await resolveExistingPathsWithinRoot({
					rootDir: DEFAULT_UPLOAD_DIR,
					requestedPaths: paths,
					scopeLabel: `uploads directory (${DEFAULT_UPLOAD_DIR})`
				});
				if (!uploadPathsResult.ok) {
					res.status(400).json({ error: uploadPathsResult.error });
					return;
				}
				const resolvedPaths = uploadPathsResult.paths;
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					if (element) return jsonError(res, 501, EXISTING_SESSION_LIMITS.hooks.uploadElement);
					if (resolvedPaths.length !== 1) return jsonError(res, 501, EXISTING_SESSION_LIMITS.hooks.uploadSingleFile);
					const uid = inputRef || ref;
					if (!uid) return jsonError(res, 501, EXISTING_SESSION_LIMITS.hooks.uploadRefRequired);
					await uploadChromeMcpFile({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						uid,
						filePath: resolvedPaths[0] ?? ""
					});
					return res.json({ ok: true });
				}
				const pw = await requirePwAi(res, "file chooser hook");
				if (!pw) return;
				if (inputRef || element) {
					if (ref) return jsonError(res, 400, "ref cannot be combined with inputRef/element");
					await pw.setInputFilesViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						inputRef,
						element,
						paths: resolvedPaths
					});
				} else {
					await pw.armFileUploadViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						paths: resolvedPaths,
						timeoutMs: timeoutMs ?? void 0
					});
					if (ref) await pw.clickViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						ssrfPolicy: ctx.state().resolved.ssrfPolicy,
						ref
					});
				}
				res.json({ ok: true });
			}
		});
	});
	app.post("/hooks/dialog", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const accept = toBoolean(body.accept);
		const promptText = toStringOrEmpty(body.promptText) || void 0;
		const timeoutMs = toNumber(body.timeoutMs);
		if (accept === void 0) return jsonError(res, 400, "accept is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					if (timeoutMs) return jsonError(res, 501, EXISTING_SESSION_LIMITS.hooks.dialogTimeout);
					await evaluateChromeMcpScript({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						fn: `() => {
              const state = (window.__openclawDialogHook ??= {});
              if (!state.originals) {
                state.originals = {
                  alert: window.alert.bind(window),
                  confirm: window.confirm.bind(window),
                  prompt: window.prompt.bind(window),
                };
              }
              const originals = state.originals;
              const restore = () => {
                window.alert = originals.alert;
                window.confirm = originals.confirm;
                window.prompt = originals.prompt;
                delete window.__openclawDialogHook;
              };
              window.alert = (...args) => {
                try {
                  return undefined;
                } finally {
                  restore();
                }
              };
              window.confirm = (...args) => {
                try {
                  return ${accept ? "true" : "false"};
                } finally {
                  restore();
                }
              };
              window.prompt = (...args) => {
                try {
                  return ${accept ? JSON.stringify(promptText ?? "") : "null"};
                } finally {
                  restore();
                }
              };
              return true;
            }`
					});
					return res.json({ ok: true });
				}
				const pw = await requirePwAi(res, "dialog hook");
				if (!pw) return;
				await pw.armDialogViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					accept,
					promptText,
					timeoutMs: timeoutMs ?? void 0
				});
				res.json({ ok: true });
			}
		});
	});
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.act.shared.ts
const ACT_KINDS = [
	"batch",
	"click",
	"close",
	"drag",
	"evaluate",
	"fill",
	"hover",
	"scrollIntoView",
	"press",
	"resize",
	"select",
	"type",
	"wait"
];
function isActKind(value) {
	if (typeof value !== "string") return false;
	return ACT_KINDS.includes(value);
}
const ALLOWED_CLICK_MODIFIERS = new Set([
	"Alt",
	"Control",
	"ControlOrMeta",
	"Meta",
	"Shift"
]);
function parseClickButton(raw) {
	if (raw === "left" || raw === "right" || raw === "middle") return raw;
}
function parseClickModifiers(raw) {
	if (raw.filter((m) => !ALLOWED_CLICK_MODIFIERS.has(m)).length) return { error: "modifiers must be Alt|Control|ControlOrMeta|Meta|Shift" };
	return { modifiers: raw.length ? raw : void 0 };
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.act.normalize.ts
function normalizeActKind(raw) {
	const kind = toStringOrEmpty(raw);
	if (!isActKind(kind)) throw new Error("kind is required");
	return kind;
}
function countBatchActions(actions) {
	let count = 0;
	for (const action of actions) {
		count += 1;
		if (action.kind === "batch") count += countBatchActions(action.actions);
	}
	return count;
}
function validateBatchTargetIds(actions, targetId) {
	for (const action of actions) {
		if (action.targetId && action.targetId !== targetId) return "batched action targetId must match request targetId";
		if (action.kind === "batch") {
			const nestedError = validateBatchTargetIds(action.actions, targetId);
			if (nestedError) return nestedError;
		}
	}
	return null;
}
function normalizeFields(rawFields) {
	return (Array.isArray(rawFields) ? rawFields : []).map((field) => {
		if (!field || typeof field !== "object") return null;
		return normalizeBrowserFormField(field);
	}).filter((field) => field !== null);
}
function normalizeBatchAction(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("batch actions must be objects");
	return normalizeActRequest(value, { source: "batch" });
}
function normalizeActRequest(body, options) {
	const source = options?.source ?? "request";
	const kind = normalizeActKind(body.kind);
	switch (kind) {
		case "click": {
			const ref = toStringOrEmpty(body.ref) || void 0;
			const selector = toStringOrEmpty(body.selector) || void 0;
			if (!ref && !selector) throw new Error("click requires ref or selector");
			const buttonRaw = toStringOrEmpty(body.button);
			const button = buttonRaw ? parseClickButton(buttonRaw) : void 0;
			if (buttonRaw && !button) throw new Error("click button must be left|right|middle");
			const parsedModifiers = parseClickModifiers(toStringArray(body.modifiers) ?? []);
			if (parsedModifiers.error) throw new Error(parsedModifiers.error);
			const doubleClick = toBoolean(body.doubleClick);
			const delayMs = normalizeActBoundedNonNegativeMs(toNumber(body.delayMs), "click delayMs", ACT_MAX_CLICK_DELAY_MS);
			const timeoutMs = toNumber(body.timeoutMs);
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			return {
				kind,
				...ref ? { ref } : {},
				...selector ? { selector } : {},
				...targetId ? { targetId } : {},
				...doubleClick !== void 0 ? { doubleClick } : {},
				...button ? { button } : {},
				...parsedModifiers.modifiers ? { modifiers: parsedModifiers.modifiers } : {},
				...delayMs !== void 0 ? { delayMs } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "type": {
			const ref = toStringOrEmpty(body.ref) || void 0;
			const selector = toStringOrEmpty(body.selector) || void 0;
			const text = body.text;
			if (!ref && !selector) throw new Error("type requires ref or selector");
			if (typeof text !== "string") throw new Error("type requires text");
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			const submit = toBoolean(body.submit);
			const slowly = toBoolean(body.slowly);
			const timeoutMs = toNumber(body.timeoutMs);
			return {
				kind,
				...ref ? { ref } : {},
				...selector ? { selector } : {},
				text,
				...targetId ? { targetId } : {},
				...submit !== void 0 ? { submit } : {},
				...slowly !== void 0 ? { slowly } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "press": {
			const key = toStringOrEmpty(body.key);
			if (!key) throw new Error("press requires key");
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			const delayMs = toNumber(body.delayMs);
			return {
				kind,
				key,
				...targetId ? { targetId } : {},
				...delayMs !== void 0 ? { delayMs } : {}
			};
		}
		case "hover":
		case "scrollIntoView": {
			const ref = toStringOrEmpty(body.ref) || void 0;
			const selector = toStringOrEmpty(body.selector) || void 0;
			if (!ref && !selector) throw new Error(`${kind} requires ref or selector`);
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			const timeoutMs = toNumber(body.timeoutMs);
			return {
				kind,
				...ref ? { ref } : {},
				...selector ? { selector } : {},
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "drag": {
			const startRef = toStringOrEmpty(body.startRef) || void 0;
			const startSelector = toStringOrEmpty(body.startSelector) || void 0;
			const endRef = toStringOrEmpty(body.endRef) || void 0;
			const endSelector = toStringOrEmpty(body.endSelector) || void 0;
			if (!startRef && !startSelector) throw new Error("drag requires startRef or startSelector");
			if (!endRef && !endSelector) throw new Error("drag requires endRef or endSelector");
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			const timeoutMs = toNumber(body.timeoutMs);
			return {
				kind,
				...startRef ? { startRef } : {},
				...startSelector ? { startSelector } : {},
				...endRef ? { endRef } : {},
				...endSelector ? { endSelector } : {},
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "select": {
			const ref = toStringOrEmpty(body.ref) || void 0;
			const selector = toStringOrEmpty(body.selector) || void 0;
			const values = toStringArray(body.values);
			if (!ref && !selector || !values?.length) throw new Error("select requires ref/selector and values");
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			const timeoutMs = toNumber(body.timeoutMs);
			return {
				kind,
				...ref ? { ref } : {},
				...selector ? { selector } : {},
				values,
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "fill": {
			const fields = normalizeFields(body.fields);
			if (!fields.length) throw new Error("fill requires fields");
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			const timeoutMs = toNumber(body.timeoutMs);
			return {
				kind,
				fields,
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "resize": {
			const width = toNumber(body.width);
			const height = toNumber(body.height);
			if (width === void 0 || height === void 0 || width <= 0 || height <= 0) throw new Error("resize requires positive width and height");
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			return {
				kind,
				width,
				height,
				...targetId ? { targetId } : {}
			};
		}
		case "wait": {
			const loadStateRaw = toStringOrEmpty(body.loadState);
			const loadState = loadStateRaw === "load" || loadStateRaw === "domcontentloaded" || loadStateRaw === "networkidle" ? loadStateRaw : void 0;
			const timeMs = normalizeActBoundedNonNegativeMs(toNumber(body.timeMs), "wait timeMs", ACT_MAX_WAIT_TIME_MS);
			const text = toStringOrEmpty(body.text) || void 0;
			const textGone = toStringOrEmpty(body.textGone) || void 0;
			const selector = toStringOrEmpty(body.selector) || void 0;
			const url = toStringOrEmpty(body.url) || void 0;
			const fn = toStringOrEmpty(body.fn) || void 0;
			if (timeMs === void 0 && !text && !textGone && !selector && !url && !loadState && !fn) throw new Error("wait requires at least one of: timeMs, text, textGone, selector, url, loadState, fn");
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			const timeoutMs = toNumber(body.timeoutMs);
			return {
				kind,
				...timeMs !== void 0 ? { timeMs } : {},
				...text ? { text } : {},
				...textGone ? { textGone } : {},
				...selector ? { selector } : {},
				...url ? { url } : {},
				...loadState ? { loadState } : {},
				...fn ? { fn } : {},
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "evaluate": {
			const fn = toStringOrEmpty(body.fn);
			if (!fn) throw new Error("evaluate requires fn");
			const ref = toStringOrEmpty(body.ref) || void 0;
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			const timeoutMs = toNumber(body.timeoutMs);
			return {
				kind,
				fn,
				...ref ? { ref } : {},
				...targetId ? { targetId } : {},
				...timeoutMs !== void 0 ? { timeoutMs } : {}
			};
		}
		case "close": {
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			return {
				kind,
				...targetId ? { targetId } : {}
			};
		}
		case "batch": {
			const actions = Array.isArray(body.actions) ? body.actions.map(normalizeBatchAction) : [];
			if (!actions.length) throw new Error(source === "batch" ? "batch requires actions" : "actions are required");
			if (countBatchActions(actions) > 100) throw new Error(`batch exceeds maximum of 100 actions`);
			const targetId = toStringOrEmpty(body.targetId) || void 0;
			const stopOnError = toBoolean(body.stopOnError);
			return {
				kind,
				actions,
				...targetId ? { targetId } : {},
				...stopOnError !== void 0 ? { stopOnError } : {}
			};
		}
	}
	throw new Error("Unsupported browser act kind");
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.act.ts
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
const EXISTING_SESSION_INTERACTION_NAVIGATION_RECHECK_DELAYS_MS = [
	0,
	250,
	500
];
async function readExistingSessionLocationHref(params) {
	const currentUrl = await evaluateChromeMcpScript({
		profileName: params.profileName,
		userDataDir: params.userDataDir,
		targetId: params.targetId,
		fn: "() => window.location.href"
	});
	if (typeof currentUrl !== "string") throw new Error("Location probe returned a non-string result");
	const normalizedUrl = currentUrl.trim();
	if (!normalizedUrl) throw new Error("Location probe returned an empty URL");
	return normalizedUrl;
}
async function assertExistingSessionPostInteractionNavigationAllowed(params) {
	const ssrfPolicyOpts = withBrowserNavigationPolicy(params.ssrfPolicy);
	if (!ssrfPolicyOpts.ssrfPolicy) return;
	const listTabs = params.listTabs;
	const initialTabTargetIds = params.initialTabTargetIds;
	const assertNewTabsAllowed = async () => {
		const tabs = await listTabs();
		for (const tab of tabs) {
			if (initialTabTargetIds.has(tab.targetId)) continue;
			await assertBrowserNavigationResultAllowed({
				url: tab.url,
				...ssrfPolicyOpts
			});
		}
	};
	let lastObservedUrl;
	let sawStableAllowedUrl = false;
	for (const delayMs of EXISTING_SESSION_INTERACTION_NAVIGATION_RECHECK_DELAYS_MS) {
		if (delayMs > 0) await sleep(delayMs);
		let currentUrl;
		try {
			currentUrl = await readExistingSessionLocationHref(params);
		} catch {
			sawStableAllowedUrl = false;
			continue;
		}
		await assertBrowserNavigationResultAllowed({
			url: currentUrl,
			...ssrfPolicyOpts
		});
		if (currentUrl === lastObservedUrl) sawStableAllowedUrl = true;
		else sawStableAllowedUrl = false;
		lastObservedUrl = currentUrl;
	}
	if (sawStableAllowedUrl) {
		await assertNewTabsAllowed();
		return;
	}
	if (lastObservedUrl) {
		const lastDelay = EXISTING_SESSION_INTERACTION_NAVIGATION_RECHECK_DELAYS_MS[EXISTING_SESSION_INTERACTION_NAVIGATION_RECHECK_DELAYS_MS.length - 1];
		await sleep(lastDelay);
		try {
			const followUpUrl = await readExistingSessionLocationHref(params);
			await assertBrowserNavigationResultAllowed({
				url: followUpUrl,
				...ssrfPolicyOpts
			});
			if (followUpUrl === lastObservedUrl) {
				await assertNewTabsAllowed();
				return;
			}
		} catch {}
	}
	throw new Error("Unable to verify stable post-interaction navigation");
}
async function runExistingSessionActionWithNavigationGuard(params) {
	let actionError;
	let result;
	try {
		result = await params.execute();
	} catch (error) {
		actionError = error;
	}
	if (params.guard) await assertExistingSessionPostInteractionNavigationAllowed(params.guard);
	if (actionError) throw actionError;
	return result;
}
function buildExistingSessionWaitPredicate(params) {
	const checks = [];
	if (params.text) checks.push(`Boolean(document.body?.innerText?.includes(${JSON.stringify(params.text)}))`);
	if (params.textGone) checks.push(`!document.body?.innerText?.includes(${JSON.stringify(params.textGone)})`);
	if (params.selector) checks.push(`Boolean(document.querySelector(${JSON.stringify(params.selector)}))`);
	if (params.loadState === "domcontentloaded") checks.push(`document.readyState === "interactive" || document.readyState === "complete"`);
	else if (params.loadState === "load") checks.push(`document.readyState === "complete"`);
	if (params.fn) checks.push(`Boolean(await (${params.fn})())`);
	if (checks.length === 0) return null;
	return checks.length === 1 ? checks[0] : checks.map((check) => `(${check})`).join(" && ");
}
async function waitForExistingSessionCondition(params) {
	if (params.timeMs && params.timeMs > 0) await sleep(params.timeMs);
	const predicate = buildExistingSessionWaitPredicate(params);
	if (!predicate && !params.url) return;
	const timeoutMs = Math.max(250, params.timeoutMs ?? 1e4);
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		let ready = true;
		if (predicate) ready = Boolean(await evaluateChromeMcpScript({
			profileName: params.profileName,
			userDataDir: params.userDataDir,
			targetId: params.targetId,
			fn: `async () => ${predicate}`
		}));
		if (ready && params.url) {
			const currentUrl = await evaluateChromeMcpScript({
				profileName: params.profileName,
				userDataDir: params.userDataDir,
				targetId: params.targetId,
				fn: "() => window.location.href"
			});
			ready = typeof currentUrl === "string" && matchBrowserUrlPattern(params.url, currentUrl);
		}
		if (ready) return;
		await sleep(250);
	}
	throw new Error("Timed out waiting for condition");
}
const SELECTOR_ALLOWED_KINDS = new Set([
	"batch",
	"click",
	"drag",
	"hover",
	"scrollIntoView",
	"select",
	"type",
	"wait"
]);
function getExistingSessionUnsupportedMessage(action) {
	switch (action.kind) {
		case "click":
			if (action.selector) return EXISTING_SESSION_LIMITS.act.clickSelector;
			if (action.button && action.button !== "left" || Array.isArray(action.modifiers) && action.modifiers.length > 0) return EXISTING_SESSION_LIMITS.act.clickButtonOrModifiers;
			return null;
		case "type":
			if (action.selector) return EXISTING_SESSION_LIMITS.act.typeSelector;
			if (action.slowly) return EXISTING_SESSION_LIMITS.act.typeSlowly;
			return null;
		case "press": return action.delayMs ? EXISTING_SESSION_LIMITS.act.pressDelay : null;
		case "hover":
			if (action.selector) return EXISTING_SESSION_LIMITS.act.hoverSelector;
			return action.timeoutMs ? EXISTING_SESSION_LIMITS.act.hoverTimeout : null;
		case "scrollIntoView":
			if (action.selector) return EXISTING_SESSION_LIMITS.act.scrollSelector;
			return action.timeoutMs ? EXISTING_SESSION_LIMITS.act.scrollTimeout : null;
		case "drag":
			if (action.startSelector || action.endSelector) return EXISTING_SESSION_LIMITS.act.dragSelector;
			return action.timeoutMs ? EXISTING_SESSION_LIMITS.act.dragTimeout : null;
		case "select":
			if (action.selector) return EXISTING_SESSION_LIMITS.act.selectSelector;
			if (action.values.length !== 1) return EXISTING_SESSION_LIMITS.act.selectSingleValue;
			return action.timeoutMs ? EXISTING_SESSION_LIMITS.act.selectTimeout : null;
		case "fill": return action.timeoutMs ? EXISTING_SESSION_LIMITS.act.fillTimeout : null;
		case "wait": return action.loadState === "networkidle" ? EXISTING_SESSION_LIMITS.act.waitNetworkIdle : null;
		case "evaluate": return action.timeoutMs !== void 0 ? EXISTING_SESSION_LIMITS.act.evaluateTimeout : null;
		case "batch": return EXISTING_SESSION_LIMITS.act.batch;
		case "resize":
		case "close": return null;
	}
	throw new Error("Unsupported browser act kind");
}
function registerBrowserAgentActRoutes(app, ctx) {
	app.post("/act", async (req, res) => {
		const body = readBody(req);
		const kindRaw = toStringOrEmpty(body.kind);
		if (!isActKind(kindRaw)) return jsonActError(res, 400, ACT_ERROR_CODES.kindRequired, "kind is required");
		const kind = kindRaw;
		let action;
		try {
			action = normalizeActRequest(body);
		} catch (err) {
			return jsonActError(res, 400, ACT_ERROR_CODES.invalidRequest, formatErrorMessage(err));
		}
		const targetId = resolveTargetIdFromBody(body);
		if (Object.hasOwn(body, "selector") && !SELECTOR_ALLOWED_KINDS.has(kind)) return jsonActError(res, 400, ACT_ERROR_CODES.selectorUnsupported, SELECTOR_UNSUPPORTED_MESSAGE);
		const earlyFn = action.kind === "wait" || action.kind === "evaluate" ? action.fn : "";
		if ((action.kind === "evaluate" || action.kind === "wait" && earlyFn) && !ctx.state().resolved.evaluateEnabled) return jsonActError(res, 403, ACT_ERROR_CODES.evaluateDisabled, browserEvaluateDisabledMessage(action.kind === "evaluate" ? "evaluate" : "wait"));
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				const evaluateEnabled = ctx.state().resolved.evaluateEnabled;
				const ssrfPolicy = ctx.state().resolved.ssrfPolicy;
				if (action.targetId && action.targetId !== tab.targetId) return jsonActError(res, 403, ACT_ERROR_CODES.targetIdMismatch, "action targetId must match request targetId");
				const isExistingSession = getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp;
				const profileName = profileCtx.profile.name;
				if (isExistingSession) {
					const initialTabTargetIds = withBrowserNavigationPolicy(ssrfPolicy).ssrfPolicy ? new Set((await profileCtx.listTabs()).map((currentTab) => currentTab.targetId)) : /* @__PURE__ */ new Set();
					const existingSessionNavigationGuard = {
						profileName,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						ssrfPolicy,
						listTabs: () => profileCtx.listTabs(),
						initialTabTargetIds
					};
					const unsupportedMessage = getExistingSessionUnsupportedMessage(action);
					if (unsupportedMessage) return jsonActError(res, 501, ACT_ERROR_CODES.unsupportedForExistingSession, unsupportedMessage);
					switch (action.kind) {
						case "click":
							await runExistingSessionActionWithNavigationGuard({
								execute: () => clickChromeMcpElement({
									profileName,
									userDataDir: profileCtx.profile.userDataDir,
									targetId: tab.targetId,
									uid: action.ref,
									doubleClick: action.doubleClick ?? false
								}),
								guard: existingSessionNavigationGuard
							});
							return res.json({
								ok: true,
								targetId: tab.targetId,
								url: tab.url
							});
						case "type":
							await runExistingSessionActionWithNavigationGuard({
								execute: async () => {
									await fillChromeMcpElement({
										profileName,
										userDataDir: profileCtx.profile.userDataDir,
										targetId: tab.targetId,
										uid: action.ref,
										value: action.text
									});
									if (action.submit) await pressChromeMcpKey({
										profileName,
										userDataDir: profileCtx.profile.userDataDir,
										targetId: tab.targetId,
										key: "Enter"
									});
								},
								guard: existingSessionNavigationGuard
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						case "press":
							await runExistingSessionActionWithNavigationGuard({
								execute: () => pressChromeMcpKey({
									profileName,
									userDataDir: profileCtx.profile.userDataDir,
									targetId: tab.targetId,
									key: action.key
								}),
								guard: existingSessionNavigationGuard
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						case "hover":
							await runExistingSessionActionWithNavigationGuard({
								execute: () => hoverChromeMcpElement({
									profileName,
									userDataDir: profileCtx.profile.userDataDir,
									targetId: tab.targetId,
									uid: action.ref
								}),
								guard: existingSessionNavigationGuard
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						case "scrollIntoView":
							await runExistingSessionActionWithNavigationGuard({
								execute: () => evaluateChromeMcpScript({
									profileName,
									userDataDir: profileCtx.profile.userDataDir,
									targetId: tab.targetId,
									fn: `(el) => { el.scrollIntoView({ block: "center", inline: "center" }); return true; }`,
									args: [action.ref]
								}),
								guard: existingSessionNavigationGuard
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						case "drag":
							await runExistingSessionActionWithNavigationGuard({
								execute: () => dragChromeMcpElement({
									profileName,
									userDataDir: profileCtx.profile.userDataDir,
									targetId: tab.targetId,
									fromUid: action.startRef,
									toUid: action.endRef
								}),
								guard: existingSessionNavigationGuard
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						case "select":
							await runExistingSessionActionWithNavigationGuard({
								execute: () => fillChromeMcpElement({
									profileName,
									userDataDir: profileCtx.profile.userDataDir,
									targetId: tab.targetId,
									uid: action.ref,
									value: action.values[0] ?? ""
								}),
								guard: existingSessionNavigationGuard
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						case "fill":
							await runExistingSessionActionWithNavigationGuard({
								execute: () => fillChromeMcpForm({
									profileName,
									userDataDir: profileCtx.profile.userDataDir,
									targetId: tab.targetId,
									elements: action.fields.map((field) => ({
										uid: field.ref,
										value: String(field.value ?? "")
									}))
								}),
								guard: existingSessionNavigationGuard
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						case "resize":
							await resizeChromeMcpPage({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								width: action.width,
								height: action.height
							});
							return res.json({
								ok: true,
								targetId: tab.targetId,
								url: tab.url
							});
						case "wait":
							await waitForExistingSessionCondition({
								profileName,
								userDataDir: profileCtx.profile.userDataDir,
								targetId: tab.targetId,
								timeMs: action.timeMs,
								text: action.text,
								textGone: action.textGone,
								selector: action.selector,
								url: action.url,
								loadState: action.loadState,
								fn: action.fn,
								timeoutMs: action.timeoutMs
							});
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						case "evaluate": {
							const result = await runExistingSessionActionWithNavigationGuard({
								execute: () => evaluateChromeMcpScript({
									profileName,
									userDataDir: profileCtx.profile.userDataDir,
									targetId: tab.targetId,
									fn: action.fn,
									args: action.ref ? [action.ref] : void 0
								}),
								guard: existingSessionNavigationGuard
							});
							return res.json({
								ok: true,
								targetId: tab.targetId,
								url: tab.url,
								result
							});
						}
						case "close":
							await closeChromeMcpTab(profileName, tab.targetId, profileCtx.profile.userDataDir);
							return res.json({
								ok: true,
								targetId: tab.targetId
							});
						case "batch": return jsonActError(res, 501, ACT_ERROR_CODES.unsupportedForExistingSession, EXISTING_SESSION_LIMITS.act.batch);
					}
				}
				const pw = await requirePwAi(res, `act:${kind}`);
				if (!pw) return;
				if (action.kind === "batch") {
					const targetIdError = validateBatchTargetIds(action.actions, tab.targetId);
					if (targetIdError) return jsonActError(res, 403, ACT_ERROR_CODES.targetIdMismatch, targetIdError);
				}
				const result = await pw.executeActViaPlaywright({
					cdpUrl,
					action,
					targetId: tab.targetId,
					evaluateEnabled,
					ssrfPolicy,
					signal: req.signal
				});
				switch (action.kind) {
					case "batch": return res.json({
						ok: true,
						targetId: tab.targetId,
						results: result.results ?? []
					});
					case "evaluate": return res.json({
						ok: true,
						targetId: tab.targetId,
						url: tab.url,
						result: result.result
					});
					case "click":
					case "resize": return res.json({
						ok: true,
						targetId: tab.targetId,
						url: tab.url
					});
					default: return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
			}
		});
	});
	registerBrowserAgentActHookRoutes(app, ctx);
	registerBrowserAgentActDownloadRoutes(app, ctx);
	app.post("/response/body", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const url = toStringOrEmpty(body.url);
		const timeoutMs = toNumber(body.timeoutMs);
		const maxChars = toNumber(body.maxChars);
		if (!url) return jsonError(res, 400, "url is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) return jsonError(res, 501, EXISTING_SESSION_LIMITS.responseBody);
				const pw = await requirePwAi(res, "response body");
				if (!pw) return;
				const result = await pw.responseBodyViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					url,
					timeoutMs: timeoutMs ?? void 0,
					maxChars: maxChars ?? void 0
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					response: result
				});
			}
		});
	});
	app.post("/highlight", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const ref = toStringOrEmpty(body.ref);
		if (!ref) return jsonError(res, 400, "ref is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, cdpUrl, tab }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					await evaluateChromeMcpScript({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						args: [ref],
						fn: `(el) => {
              if (!(el instanceof Element)) {
                return false;
              }
              el.scrollIntoView({ block: "center", inline: "center" });
              const previousOutline = el.style.outline;
              const previousOffset = el.style.outlineOffset;
              el.style.outline = "3px solid #FF4500";
              el.style.outlineOffset = "2px";
              setTimeout(() => {
                el.style.outline = previousOutline;
                el.style.outlineOffset = previousOffset;
              }, 2000);
              return true;
            }`
					});
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				const pw = await requirePwAi(res, "highlight");
				if (!pw) return;
				await pw.highlightViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					ref
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.debug.ts
function registerBrowserAgentDebugRoutes(app, ctx) {
	app.get("/console", async (req, res) => {
		const targetId = resolveTargetIdFromQuery(req.query);
		const level = typeof req.query.level === "string" ? req.query.level : "";
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "console messages",
			run: async ({ cdpUrl, tab, pw }) => {
				const messages = await pw.getConsoleMessagesViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					level: normalizeOptionalString(level)
				});
				res.json({
					ok: true,
					messages,
					targetId: tab.targetId
				});
			}
		});
	});
	app.get("/errors", async (req, res) => {
		const targetId = resolveTargetIdFromQuery(req.query);
		const clear = toBoolean(req.query.clear) ?? false;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "page errors",
			run: async ({ cdpUrl, tab, pw }) => {
				const result = await pw.getPageErrorsViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					clear
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					...result
				});
			}
		});
	});
	app.get("/requests", async (req, res) => {
		const targetId = resolveTargetIdFromQuery(req.query);
		const filter = typeof req.query.filter === "string" ? req.query.filter : "";
		const clear = toBoolean(req.query.clear) ?? false;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "network requests",
			run: async ({ cdpUrl, tab, pw }) => {
				const result = await pw.getNetworkRequestsViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					filter: normalizeOptionalString(filter),
					clear
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					...result
				});
			}
		});
	});
	app.post("/trace/start", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const screenshots = toBoolean(body.screenshots) ?? void 0;
		const snapshots = toBoolean(body.snapshots) ?? void 0;
		const sources = toBoolean(body.sources) ?? void 0;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "trace start",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.traceStartViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					screenshots,
					snapshots,
					sources
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/trace/stop", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const out = toStringOrEmpty(body.path) || "";
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "trace stop",
			run: async ({ cdpUrl, tab, pw }) => {
				const tracePath = await resolveWritableOutputPathOrRespond({
					res,
					rootDir: DEFAULT_TRACE_DIR,
					requestedPath: out,
					scopeLabel: "trace directory",
					defaultFileName: `browser-trace-${crypto.randomUUID()}.zip`,
					ensureRootDir: true
				});
				if (!tracePath) return;
				await pw.traceStopViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					path: tracePath
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					path: path.resolve(tracePath)
				});
			}
		});
	});
}
//#endregion
//#region extensions/browser/src/browser/chrome-mcp.snapshot.ts
function normalizeRole(node) {
	return normalizeLowercaseStringOrEmpty(node.role) || "generic";
}
function escapeQuoted(value) {
	return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
function shouldIncludeNode(params) {
	if (params.options?.interactive && !INTERACTIVE_ROLES.has(params.role)) return false;
	if (params.options?.compact && STRUCTURAL_ROLES.has(params.role) && !params.name) return false;
	return true;
}
function shouldCreateRef(role, name) {
	return INTERACTIVE_ROLES.has(role) || CONTENT_ROLES.has(role) && Boolean(name);
}
function createDuplicateTracker() {
	return {
		counts: /* @__PURE__ */ new Map(),
		keysByRef: /* @__PURE__ */ new Map(),
		duplicates: /* @__PURE__ */ new Set()
	};
}
function registerRef(tracker, ref, role, name) {
	const key = `${role}:${name ?? ""}`;
	const count = tracker.counts.get(key) ?? 0;
	tracker.counts.set(key, count + 1);
	tracker.keysByRef.set(ref, key);
	if (count > 0) {
		tracker.duplicates.add(key);
		return count;
	}
}
function flattenChromeMcpSnapshotToAriaNodes(root, limit = 500) {
	const boundedLimit = Math.max(1, Math.min(2e3, Math.floor(limit)));
	const out = [];
	const visit = (node, depth) => {
		if (out.length >= boundedLimit) return;
		const ref = normalizeString(node.id);
		if (ref) out.push({
			ref,
			role: normalizeRole(node),
			name: normalizeString(node.name) ?? "",
			value: normalizeString(node.value),
			description: normalizeString(node.description),
			depth
		});
		for (const child of node.children ?? []) {
			visit(child, depth + 1);
			if (out.length >= boundedLimit) return;
		}
	};
	visit(root, 0);
	return out;
}
function buildAiSnapshotFromChromeMcpSnapshot(params) {
	const refs = {};
	const tracker = createDuplicateTracker();
	const lines = [];
	const visit = (node, depth) => {
		const role = normalizeRole(node);
		const name = normalizeString(node.name);
		const value = normalizeString(node.value);
		const description = normalizeString(node.description);
		const maxDepth = params.options?.maxDepth;
		if (maxDepth !== void 0 && depth > maxDepth) return;
		if (shouldIncludeNode({
			role,
			name,
			options: params.options
		})) {
			let line = `${"  ".repeat(depth)}- ${role}`;
			if (name) line += ` "${escapeQuoted(name)}"`;
			const ref = normalizeString(node.id);
			if (ref && shouldCreateRef(role, name)) {
				const nth = registerRef(tracker, ref, role, name);
				refs[ref] = nth === void 0 ? {
					role,
					name
				} : {
					role,
					name,
					nth
				};
				line += ` [ref=${ref}]`;
			}
			if (value) line += ` value="${escapeQuoted(value)}"`;
			if (description) line += ` description="${escapeQuoted(description)}"`;
			lines.push(line);
		}
		for (const child of node.children ?? []) visit(child, depth + 1);
	};
	visit(params.root, 0);
	for (const [ref, data] of Object.entries(refs)) {
		const key = tracker.keysByRef.get(ref);
		if (key && !tracker.duplicates.has(key)) delete data.nth;
	}
	let snapshot = lines.join("\n");
	let truncated = false;
	const maxChars = typeof params.maxChars === "number" && Number.isFinite(params.maxChars) && params.maxChars > 0 ? Math.floor(params.maxChars) : void 0;
	if (maxChars && snapshot.length > maxChars) {
		snapshot = `${snapshot.slice(0, maxChars)}\n\n[...TRUNCATED - page too large]`;
		truncated = true;
	}
	const stats = getRoleSnapshotStats(snapshot, refs);
	return truncated ? {
		snapshot,
		truncated,
		refs,
		stats
	} : {
		snapshot,
		refs,
		stats
	};
}
//#endregion
//#region extensions/browser/src/browser/screenshot.ts
const DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE = 2e3;
const DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;
async function normalizeBrowserScreenshot(buffer, opts) {
	const maxSide = Math.max(1, Math.round(opts?.maxSide ?? 2e3));
	const maxBytes = Math.max(1, Math.round(opts?.maxBytes ?? 5242880));
	const meta = await getImageMetadata(buffer);
	const width = meta?.width ?? 0;
	const height = meta?.height ?? 0;
	const maxDim = Math.max(width, height);
	if (buffer.byteLength <= maxBytes && (maxDim === 0 || width <= maxSide && height <= maxSide)) return { buffer };
	const sideGrid = buildImageResizeSideGrid(maxSide, maxDim > 0 ? Math.min(maxSide, maxDim) : maxSide);
	let smallest = null;
	for (const side of sideGrid) for (const quality of IMAGE_REDUCE_QUALITY_STEPS) {
		const out = await resizeToJpeg({
			buffer,
			maxSide: side,
			quality,
			withoutEnlargement: true
		});
		if (!smallest || out.byteLength < smallest.size) smallest = {
			buffer: out,
			size: out.byteLength
		};
		if (out.byteLength <= maxBytes) return {
			buffer: out,
			contentType: "image/jpeg"
		};
	}
	const best = smallest?.buffer ?? buffer;
	throw new Error(`Browser screenshot could not be reduced below ${(maxBytes / (1024 * 1024)).toFixed(0)}MB (got ${(best.byteLength / (1024 * 1024)).toFixed(2)}MB)`);
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.snapshot.plan.ts
function resolveSnapshotPlan(params) {
	const mode = params.query.mode === "efficient" ? "efficient" : void 0;
	const labels = toBoolean(params.query.labels) ?? void 0;
	const explicitFormat = params.query.format === "aria" ? "aria" : params.query.format === "ai" ? "ai" : void 0;
	const format = resolveDefaultSnapshotFormat({
		profile: params.profile,
		hasPlaywright: params.hasPlaywright,
		explicitFormat,
		mode
	});
	const limitRaw = readStringValue(params.query.limit);
	const hasMaxChars = Object.hasOwn(params.query, "maxChars");
	const maxCharsRaw = readStringValue(params.query.maxChars);
	const limit = Number.isFinite(Number(limitRaw)) ? Number(limitRaw) : void 0;
	const maxChars = Number.isFinite(Number(maxCharsRaw)) && Number(maxCharsRaw) > 0 ? Math.floor(Number(maxCharsRaw)) : void 0;
	const resolvedMaxChars = format === "ai" ? hasMaxChars ? maxChars : mode === "efficient" ? DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS : DEFAULT_AI_SNAPSHOT_MAX_CHARS : void 0;
	const interactiveRaw = toBoolean(params.query.interactive);
	const compactRaw = toBoolean(params.query.compact);
	const depthRaw = toNumber(params.query.depth);
	const refsModeRaw = toStringOrEmpty(params.query.refs).trim();
	const refsMode = refsModeRaw === "aria" ? "aria" : refsModeRaw === "role" ? "role" : void 0;
	const interactive = interactiveRaw ?? (mode === "efficient" ? true : void 0);
	const compact = compactRaw ?? (mode === "efficient" ? true : void 0);
	const depth = depthRaw ?? (mode === "efficient" ? 6 : void 0);
	const selectorValue = normalizeOptionalString(toStringOrEmpty(params.query.selector));
	const frameSelectorValue = normalizeOptionalString(toStringOrEmpty(params.query.frame));
	return {
		format,
		mode,
		labels,
		limit,
		resolvedMaxChars,
		interactive,
		compact,
		depth,
		refsMode,
		selectorValue,
		frameSelectorValue,
		wantsRoleSnapshot: labels === true || mode === "efficient" || interactive === true || compact === true || depth !== void 0 || Boolean(selectorValue) || Boolean(frameSelectorValue)
	};
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.snapshot.ts
const CHROME_MCP_OVERLAY_ATTR = "data-openclaw-mcp-overlay";
async function clearChromeMcpOverlay(params) {
	await evaluateChromeMcpScript({
		profileName: params.profileName,
		userDataDir: params.userDataDir,
		targetId: params.targetId,
		fn: `() => {
      document.querySelectorAll("[${CHROME_MCP_OVERLAY_ATTR}]").forEach((node) => node.remove());
      return true;
    }`
	}).catch(() => {});
}
async function renderChromeMcpLabels(params) {
	const refList = JSON.stringify(params.refs);
	const result = await evaluateChromeMcpScript({
		profileName: params.profileName,
		userDataDir: params.userDataDir,
		targetId: params.targetId,
		args: params.refs,
		fn: `(...elements) => {
      const refs = ${refList};
      document.querySelectorAll("[${CHROME_MCP_OVERLAY_ATTR}]").forEach((node) => node.remove());
      const root = document.createElement("div");
      root.setAttribute("${CHROME_MCP_OVERLAY_ATTR}", "labels");
      root.style.position = "fixed";
      root.style.inset = "0";
      root.style.pointerEvents = "none";
      root.style.zIndex = "2147483647";
      let labels = 0;
      let skipped = 0;
      elements.forEach((el, index) => {
        if (!(el instanceof Element)) {
          skipped += 1;
          return;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 && rect.height <= 0) {
          skipped += 1;
          return;
        }
        labels += 1;
        const badge = document.createElement("div");
        badge.setAttribute("${CHROME_MCP_OVERLAY_ATTR}", "label");
        badge.textContent = refs[index] || String(labels);
        badge.style.position = "fixed";
        badge.style.left = \`\${Math.max(0, rect.left)}px\`;
        badge.style.top = \`\${Math.max(0, rect.top)}px\`;
        badge.style.transform = "translateY(-100%)";
        badge.style.padding = "2px 6px";
        badge.style.borderRadius = "999px";
        badge.style.background = "#FF4500";
        badge.style.color = "#fff";
        badge.style.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
        badge.style.boxShadow = "0 2px 6px rgba(0,0,0,0.35)";
        badge.style.whiteSpace = "nowrap";
        root.appendChild(badge);
      });
      document.documentElement.appendChild(root);
      return { labels, skipped };
    }`
	});
	return {
		labels: result && typeof result === "object" && typeof result.labels === "number" ? result.labels : 0,
		skipped: result && typeof result === "object" && typeof result.skipped === "number" ? result.skipped : 0
	};
}
async function saveNormalizedScreenshotResponse(params) {
	const normalized = await normalizeBrowserScreenshot(params.buffer, {
		maxSide: DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE,
		maxBytes: DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES
	});
	await saveBrowserMediaResponse({
		res: params.res,
		buffer: normalized.buffer,
		contentType: normalized.contentType ?? `image/${params.type}`,
		maxBytes: DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES,
		targetId: params.targetId,
		url: params.url
	});
}
async function saveBrowserMediaResponse(params) {
	await ensureMediaDir();
	const saved = await saveMediaBuffer(params.buffer, params.contentType, "browser", params.maxBytes);
	params.res.json({
		ok: true,
		path: path.resolve(saved.path),
		targetId: params.targetId,
		url: params.url
	});
}
/** Resolve the correct targetId after a navigation that may trigger a renderer swap. */
async function resolveTargetIdAfterNavigate(opts) {
	let currentTargetId = opts.oldTargetId;
	try {
		const pickReplacement = (tabs, options) => {
			if (tabs.some((tab) => tab.targetId === opts.oldTargetId)) return opts.oldTargetId;
			const byUrl = tabs.filter((tab) => tab.url === opts.navigatedUrl);
			if (byUrl.length === 1) return byUrl[0]?.targetId ?? opts.oldTargetId;
			const uniqueReplacement = byUrl.filter((tab) => tab.targetId !== opts.oldTargetId);
			if (uniqueReplacement.length === 1) return uniqueReplacement[0]?.targetId ?? opts.oldTargetId;
			if (options?.allowSingleTabFallback && tabs.length === 1) return tabs[0]?.targetId ?? opts.oldTargetId;
			return opts.oldTargetId;
		};
		currentTargetId = pickReplacement(await opts.listTabs());
		if (currentTargetId === opts.oldTargetId) {
			await new Promise((r) => setTimeout(r, 800));
			currentTargetId = pickReplacement(await opts.listTabs(), { allowSingleTabFallback: true });
		}
	} catch {}
	return currentTargetId;
}
function registerBrowserAgentSnapshotRoutes(app, ctx) {
	app.post("/navigate", async (req, res) => {
		const body = readBody(req);
		const url = toStringOrEmpty(body.url);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		if (!url) return jsonError(res, 400, "url is required");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, tab, cdpUrl }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					const ssrfPolicyOpts = withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy);
					await assertBrowserNavigationAllowed({
						url,
						...ssrfPolicyOpts
					});
					const result = await navigateChromeMcpPage({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						url
					});
					await assertBrowserNavigationResultAllowed({
						url: result.url,
						...ssrfPolicyOpts
					});
					return res.json({
						ok: true,
						targetId: tab.targetId,
						...result
					});
				}
				const pw = await requirePwAi(res, "navigate");
				if (!pw) return;
				const result = await pw.navigateViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					url,
					...withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy)
				});
				const currentTargetId = await resolveTargetIdAfterNavigate({
					oldTargetId: tab.targetId,
					navigatedUrl: result.url,
					listTabs: () => profileCtx.listTabs()
				});
				res.json({
					ok: true,
					targetId: currentTargetId,
					...result
				});
			}
		});
	});
	app.post("/pdf", async (req, res) => {
		const targetId = toStringOrEmpty(readBody(req).targetId) || void 0;
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) return jsonError(res, 501, EXISTING_SESSION_LIMITS.snapshot.pdfUnsupported);
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "pdf",
			run: async ({ cdpUrl, tab, pw }) => {
				const pdf = await pw.pdfViaPlaywright({
					cdpUrl,
					targetId: tab.targetId
				});
				await saveBrowserMediaResponse({
					res,
					buffer: pdf.buffer,
					contentType: "application/pdf",
					maxBytes: pdf.buffer.byteLength,
					targetId: tab.targetId,
					url: tab.url
				});
			}
		});
	});
	app.post("/screenshot", async (req, res) => {
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const fullPage = toBoolean(body.fullPage) ?? false;
		const ref = toStringOrEmpty(body.ref) || void 0;
		const element = toStringOrEmpty(body.element) || void 0;
		const type = body.type === "jpeg" ? "jpeg" : "png";
		if (fullPage && (ref || element)) return jsonError(res, 400, "fullPage is not supported for element screenshots");
		await withRouteTabContext({
			req,
			res,
			ctx,
			targetId,
			run: async ({ profileCtx, tab, cdpUrl }) => {
				if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
					const ssrfPolicyOpts = withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy);
					if (element) return jsonError(res, 400, EXISTING_SESSION_LIMITS.snapshot.screenshotElement);
					if (ssrfPolicyOpts.ssrfPolicy) await assertBrowserNavigationResultAllowed({
						url: tab.url,
						...ssrfPolicyOpts
					});
					await saveNormalizedScreenshotResponse({
						res,
						buffer: await takeChromeMcpScreenshot({
							profileName: profileCtx.profile.name,
							userDataDir: profileCtx.profile.userDataDir,
							targetId: tab.targetId,
							uid: ref,
							fullPage,
							format: type
						}),
						type,
						targetId: tab.targetId,
						url: tab.url
					});
					return;
				}
				let buffer;
				if (shouldUsePlaywrightForScreenshot({
					profile: profileCtx.profile,
					wsUrl: tab.wsUrl,
					ref,
					element
				})) {
					const pw = await requirePwAi(res, "screenshot");
					if (!pw) return;
					buffer = (await pw.takeScreenshotViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						ref,
						element,
						fullPage,
						type
					})).buffer;
				} else buffer = await captureScreenshot({
					wsUrl: tab.wsUrl ?? "",
					fullPage,
					format: type,
					quality: type === "jpeg" ? 85 : void 0
				});
				await saveNormalizedScreenshotResponse({
					res,
					buffer,
					type,
					targetId: tab.targetId,
					url: tab.url
				});
			}
		});
	});
	app.get("/snapshot", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const targetId = typeof req.query.targetId === "string" ? req.query.targetId.trim() : "";
		const hasPlaywright = Boolean(await getPwAiModule());
		const plan = resolveSnapshotPlan({
			profile: profileCtx.profile,
			query: req.query,
			hasPlaywright
		});
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId || void 0);
			if ((plan.labels || plan.mode === "efficient") && plan.format === "aria") return jsonError(res, 400, "labels/mode=efficient require format=ai");
			if (getBrowserProfileCapabilities(profileCtx.profile).usesChromeMcp) {
				const ssrfPolicyOpts = withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy);
				if (plan.selectorValue || plan.frameSelectorValue) return jsonError(res, 400, EXISTING_SESSION_LIMITS.snapshot.snapshotSelector);
				if (ssrfPolicyOpts.ssrfPolicy) await assertBrowserNavigationResultAllowed({
					url: tab.url,
					...ssrfPolicyOpts
				});
				const snapshot = await takeChromeMcpSnapshot({
					profileName: profileCtx.profile.name,
					userDataDir: profileCtx.profile.userDataDir,
					targetId: tab.targetId
				});
				if (plan.format === "aria") return res.json({
					ok: true,
					format: "aria",
					targetId: tab.targetId,
					url: tab.url,
					nodes: flattenChromeMcpSnapshotToAriaNodes(snapshot, plan.limit)
				});
				const built = buildAiSnapshotFromChromeMcpSnapshot({
					root: snapshot,
					options: {
						interactive: plan.interactive ?? void 0,
						compact: plan.compact ?? void 0,
						maxDepth: plan.depth ?? void 0
					},
					maxChars: plan.resolvedMaxChars
				});
				if (plan.labels) {
					const refs = Object.keys(built.refs);
					const labelResult = await renderChromeMcpLabels({
						profileName: profileCtx.profile.name,
						userDataDir: profileCtx.profile.userDataDir,
						targetId: tab.targetId,
						refs
					});
					try {
						const normalized = await normalizeBrowserScreenshot(await takeChromeMcpScreenshot({
							profileName: profileCtx.profile.name,
							userDataDir: profileCtx.profile.userDataDir,
							targetId: tab.targetId,
							format: "png"
						}), {
							maxSide: DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE,
							maxBytes: DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES
						});
						await ensureMediaDir();
						const saved = await saveMediaBuffer(normalized.buffer, normalized.contentType ?? "image/png", "browser", DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES);
						return res.json({
							ok: true,
							format: "ai",
							targetId: tab.targetId,
							url: tab.url,
							labels: true,
							labelsCount: labelResult.labels,
							labelsSkipped: labelResult.skipped,
							imagePath: path.resolve(saved.path),
							imageType: normalized.contentType?.includes("jpeg") ? "jpeg" : "png",
							...built
						});
					} finally {
						await clearChromeMcpOverlay({
							profileName: profileCtx.profile.name,
							userDataDir: profileCtx.profile.userDataDir,
							targetId: tab.targetId
						});
					}
				}
				return res.json({
					ok: true,
					format: "ai",
					targetId: tab.targetId,
					url: tab.url,
					...built
				});
			}
			if (plan.format === "ai") {
				const pw = await requirePwAi(res, "ai snapshot");
				if (!pw) return;
				const roleSnapshotArgs = {
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					selector: plan.selectorValue,
					frameSelector: plan.frameSelectorValue,
					refsMode: plan.refsMode,
					ssrfPolicy: ctx.state().resolved.ssrfPolicy,
					options: {
						interactive: plan.interactive ?? void 0,
						compact: plan.compact ?? void 0,
						maxDepth: plan.depth ?? void 0
					}
				};
				const snap = plan.wantsRoleSnapshot ? await pw.snapshotRoleViaPlaywright(roleSnapshotArgs) : await pw.snapshotAiViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					ssrfPolicy: ctx.state().resolved.ssrfPolicy,
					...typeof plan.resolvedMaxChars === "number" ? { maxChars: plan.resolvedMaxChars } : {}
				}).catch(async (err) => {
					if (String(err).toLowerCase().includes("_snapshotforai")) return await pw.snapshotRoleViaPlaywright(roleSnapshotArgs);
					throw err;
				});
				if (plan.labels) {
					const labeled = await pw.screenshotWithLabelsViaPlaywright({
						cdpUrl: profileCtx.profile.cdpUrl,
						targetId: tab.targetId,
						refs: "refs" in snap ? snap.refs : {},
						type: "png"
					});
					const normalized = await normalizeBrowserScreenshot(labeled.buffer, {
						maxSide: DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE,
						maxBytes: DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES
					});
					await ensureMediaDir();
					const saved = await saveMediaBuffer(normalized.buffer, normalized.contentType ?? "image/png", "browser", DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES);
					const imageType = normalized.contentType?.includes("jpeg") ? "jpeg" : "png";
					return res.json({
						ok: true,
						format: plan.format,
						targetId: tab.targetId,
						url: tab.url,
						labels: true,
						labelsCount: labeled.labels,
						labelsSkipped: labeled.skipped,
						imagePath: path.resolve(saved.path),
						imageType,
						...snap
					});
				}
				return res.json({
					ok: true,
					format: plan.format,
					targetId: tab.targetId,
					url: tab.url,
					...snap
				});
			}
			const snap = shouldUsePlaywrightForAriaSnapshot({
				profile: profileCtx.profile,
				wsUrl: tab.wsUrl
			}) ? requirePwAi(res, "aria snapshot").then(async (pw) => {
				if (!pw) return null;
				return await pw.snapshotAriaViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					limit: plan.limit,
					ssrfPolicy: ctx.state().resolved.ssrfPolicy
				});
			}) : snapshotAria({
				wsUrl: tab.wsUrl ?? "",
				limit: plan.limit
			});
			const resolved = await Promise.resolve(snap);
			if (!resolved) return;
			return res.json({
				ok: true,
				format: plan.format,
				targetId: tab.targetId,
				url: tab.url,
				...resolved
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.storage.ts
function parseStorageKind(raw) {
	if (raw === "local" || raw === "session") return raw;
	return null;
}
function parseStorageMutationRequest(kindParam, body) {
	return {
		kind: parseStorageKind(toStringOrEmpty(kindParam)),
		targetId: resolveTargetIdFromBody(body)
	};
}
function parseRequiredStorageMutationRequest(kindParam, body) {
	const parsed = parseStorageMutationRequest(kindParam, body);
	if (!parsed.kind) return null;
	return {
		kind: parsed.kind,
		targetId: parsed.targetId
	};
}
function parseStorageMutationOrRespond(res, kindParam, body) {
	const parsed = parseRequiredStorageMutationRequest(kindParam, body);
	if (!parsed) {
		jsonError(res, 400, "kind must be local|session");
		return null;
	}
	return parsed;
}
function parseStorageMutationFromRequest(req, res) {
	const body = readBody(req);
	const parsed = parseStorageMutationOrRespond(res, req.params.kind, body);
	if (!parsed) return null;
	return {
		body,
		parsed
	};
}
function registerBrowserAgentStorageRoutes(app, ctx) {
	app.get("/cookies", async (req, res) => {
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId: resolveTargetIdFromQuery(req.query),
			feature: "cookies",
			run: async ({ cdpUrl, tab, pw }) => {
				const result = await pw.cookiesGetViaPlaywright({
					cdpUrl,
					targetId: tab.targetId
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					...result
				});
			}
		});
	});
	app.post("/cookies/set", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const cookie = body.cookie && typeof body.cookie === "object" && !Array.isArray(body.cookie) ? body.cookie : null;
		if (!cookie) return jsonError(res, 400, "cookie is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "cookies set",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.cookiesSetViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					cookie: {
						name: toStringOrEmpty(cookie.name),
						value: toStringOrEmpty(cookie.value),
						url: toStringOrEmpty(cookie.url) || void 0,
						domain: toStringOrEmpty(cookie.domain) || void 0,
						path: toStringOrEmpty(cookie.path) || void 0,
						expires: toNumber(cookie.expires) ?? void 0,
						httpOnly: toBoolean(cookie.httpOnly) ?? void 0,
						secure: toBoolean(cookie.secure) ?? void 0,
						sameSite: cookie.sameSite === "Lax" || cookie.sameSite === "None" || cookie.sameSite === "Strict" ? cookie.sameSite : void 0
					}
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/cookies/clear", async (req, res) => {
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId: resolveTargetIdFromBody(readBody(req)),
			feature: "cookies clear",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.cookiesClearViaPlaywright({
					cdpUrl,
					targetId: tab.targetId
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.get("/storage/:kind", async (req, res) => {
		const kind = parseStorageKind(toStringOrEmpty(req.params.kind));
		if (!kind) return jsonError(res, 400, "kind must be local|session");
		const targetId = resolveTargetIdFromQuery(req.query);
		const key = toStringOrEmpty(req.query.key);
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "storage get",
			run: async ({ cdpUrl, tab, pw }) => {
				const result = await pw.storageGetViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					kind,
					key: normalizeOptionalString(key)
				});
				res.json({
					ok: true,
					targetId: tab.targetId,
					...result
				});
			}
		});
	});
	app.post("/storage/:kind/set", async (req, res) => {
		const mutation = parseStorageMutationFromRequest(req, res);
		if (!mutation) return;
		const key = toStringOrEmpty(mutation.body.key);
		if (!key) return jsonError(res, 400, "key is required");
		const value = typeof mutation.body.value === "string" ? mutation.body.value : "";
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId: mutation.parsed.targetId,
			feature: "storage set",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.storageSetViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					kind: mutation.parsed.kind,
					key,
					value
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/storage/:kind/clear", async (req, res) => {
		const mutation = parseStorageMutationFromRequest(req, res);
		if (!mutation) return;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId: mutation.parsed.targetId,
			feature: "storage clear",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.storageClearViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					kind: mutation.parsed.kind
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/offline", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const offline = toBoolean(body.offline);
		if (offline === void 0) return jsonError(res, 400, "offline is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "offline",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setOfflineViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					offline
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/headers", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const headers = body.headers && typeof body.headers === "object" && !Array.isArray(body.headers) ? body.headers : null;
		if (!headers) return jsonError(res, 400, "headers is required");
		const parsed = {};
		for (const [k, v] of Object.entries(headers)) if (typeof v === "string") parsed[k] = v;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "headers",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setExtraHTTPHeadersViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					headers: parsed
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/credentials", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const clear = toBoolean(body.clear) ?? false;
		const username = toStringOrEmpty(body.username) || void 0;
		const password = readStringValue(body.password);
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "http credentials",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setHttpCredentialsViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					username,
					password,
					clear
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/geolocation", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const clear = toBoolean(body.clear) ?? false;
		const latitude = toNumber(body.latitude);
		const longitude = toNumber(body.longitude);
		const accuracy = toNumber(body.accuracy) ?? void 0;
		const origin = toStringOrEmpty(body.origin) || void 0;
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "geolocation",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setGeolocationViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					latitude,
					longitude,
					accuracy,
					origin,
					clear
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/media", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const schemeRaw = toStringOrEmpty(body.colorScheme);
		const colorScheme = schemeRaw === "dark" || schemeRaw === "light" || schemeRaw === "no-preference" ? schemeRaw : schemeRaw === "none" ? null : void 0;
		if (colorScheme === void 0) return jsonError(res, 400, "colorScheme must be dark|light|no-preference|none");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "media emulation",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.emulateMediaViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					colorScheme
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/timezone", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const timezoneId = toStringOrEmpty(body.timezoneId);
		if (!timezoneId) return jsonError(res, 400, "timezoneId is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "timezone",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setTimezoneViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					timezoneId
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/locale", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const locale = toStringOrEmpty(body.locale);
		if (!locale) return jsonError(res, 400, "locale is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "locale",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setLocaleViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					locale
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
	app.post("/set/device", async (req, res) => {
		const body = readBody(req);
		const targetId = resolveTargetIdFromBody(body);
		const name = toStringOrEmpty(body.name);
		if (!name) return jsonError(res, 400, "name is required");
		await withPlaywrightRouteContext({
			req,
			res,
			ctx,
			targetId,
			feature: "device emulation",
			run: async ({ cdpUrl, tab, pw }) => {
				await pw.setDeviceViaPlaywright({
					cdpUrl,
					targetId: tab.targetId,
					name
				});
				res.json({
					ok: true,
					targetId: tab.targetId
				});
			}
		});
	});
}
//#endregion
//#region extensions/browser/src/browser/routes/agent.ts
function registerBrowserAgentRoutes(app, ctx) {
	registerBrowserAgentSnapshotRoutes(app, ctx);
	registerBrowserAgentActRoutes(app, ctx);
	registerBrowserAgentDebugRoutes(app, ctx);
	registerBrowserAgentStorageRoutes(app, ctx);
}
const PROFILE_NAME_REGEX = /^[a-z0-9][a-z0-9-]*$/;
function isValidProfileName(name) {
	if (!name || name.length > 64) return false;
	return PROFILE_NAME_REGEX.test(name);
}
function allocateCdpPort(usedPorts, range) {
	const start = range?.start ?? 18800;
	const end = range?.end ?? 18899;
	if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0) return null;
	if (start > end) return null;
	for (let port = start; port <= end; port++) if (!usedPorts.has(port)) return port;
	return null;
}
function getUsedPorts(profiles) {
	if (!profiles) return /* @__PURE__ */ new Set();
	const used = /* @__PURE__ */ new Set();
	for (const profile of Object.values(profiles)) {
		if (typeof profile.cdpPort === "number") {
			used.add(profile.cdpPort);
			continue;
		}
		const rawUrl = profile.cdpUrl?.trim();
		if (!rawUrl) continue;
		try {
			const parsed = new URL(rawUrl);
			const port = parsed.port && Number.parseInt(parsed.port, 10) > 0 ? Number.parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
			if (!Number.isNaN(port) && port > 0 && port <= 65535) used.add(port);
		} catch {}
	}
	return used;
}
const PROFILE_COLORS = [
	"#FF4500",
	"#0066CC",
	"#00AA00",
	"#9933FF",
	"#FF6699",
	"#00CCCC",
	"#FF9900",
	"#6666FF",
	"#CC3366",
	"#339966"
];
function allocateColor(usedColors) {
	for (const color of PROFILE_COLORS) if (!usedColors.has(color.toUpperCase())) return color;
	return PROFILE_COLORS[usedColors.size % PROFILE_COLORS.length] ?? PROFILE_COLORS[0];
}
function getUsedColors(profiles) {
	if (!profiles) return /* @__PURE__ */ new Set();
	return new Set(Object.values(profiles).map((p) => p.color.toUpperCase()));
}
//#endregion
//#region extensions/browser/src/browser/profiles-service.ts
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const cdpPortRange = (resolved) => {
	const start = resolved.cdpPortRangeStart;
	const end = resolved.cdpPortRangeEnd;
	if (typeof start === "number" && Number.isFinite(start) && Number.isInteger(start) && typeof end === "number" && Number.isFinite(end) && Number.isInteger(end) && start > 0 && end >= start && end <= 65535) return {
		start,
		end
	};
	return deriveDefaultBrowserCdpPortRange(resolved.controlPort);
};
function createBrowserProfilesService(ctx) {
	const listProfiles = async () => {
		return await ctx.listProfiles();
	};
	const createProfile = async (params) => {
		const name = params.name.trim();
		const rawCdpUrl = normalizeOptionalString(params.cdpUrl);
		const rawUserDataDir = normalizeOptionalString(params.userDataDir);
		const normalizedUserDataDir = rawUserDataDir ? resolveUserPath(rawUserDataDir) : void 0;
		const driver = params.driver === "existing-session" ? "existing-session" : void 0;
		if (!isValidProfileName(name)) throw new BrowserValidationError("invalid profile name: use lowercase letters, numbers, and hyphens only");
		const state = ctx.state();
		const resolvedProfiles = state.resolved.profiles;
		if (name in resolvedProfiles) throw new BrowserConflictError(`profile "${name}" already exists`);
		const cfg = loadConfig();
		const rawProfiles = cfg.browser?.profiles ?? {};
		if (name in rawProfiles) throw new BrowserConflictError(`profile "${name}" already exists`);
		const usedColors = getUsedColors(resolvedProfiles);
		const profileColor = params.color && HEX_COLOR_RE.test(params.color) ? params.color : allocateColor(usedColors);
		let profileConfig;
		if (normalizedUserDataDir && driver !== "existing-session") throw new BrowserValidationError("driver=existing-session is required when userDataDir is provided");
		if (normalizedUserDataDir && !fs.existsSync(normalizedUserDataDir)) throw new BrowserValidationError(`browser user data directory not found: ${normalizedUserDataDir}`);
		if (rawCdpUrl) {
			if (driver === "existing-session") throw new BrowserValidationError("driver=existing-session does not accept cdpUrl; it attaches via the Chrome MCP auto-connect flow");
			let parsed;
			try {
				parsed = parseBrowserHttpUrl(rawCdpUrl, "browser.profiles.cdpUrl");
				await assertCdpEndpointAllowed(parsed.normalized, state.resolved.ssrfPolicy);
			} catch (err) {
				throw new BrowserValidationError(formatErrorMessage(err));
			}
			profileConfig = {
				cdpUrl: parsed.normalized,
				...driver ? { driver } : {},
				color: profileColor
			};
		} else if (driver === "existing-session") profileConfig = {
			driver,
			attachOnly: true,
			...normalizedUserDataDir ? { userDataDir: normalizedUserDataDir } : {},
			color: profileColor
		};
		else {
			const cdpPort = allocateCdpPort(getUsedPorts(resolvedProfiles), cdpPortRange(state.resolved));
			if (cdpPort === null) throw new BrowserResourceExhaustedError("no available CDP ports in range");
			profileConfig = {
				cdpPort,
				...driver ? { driver } : {},
				color: profileColor
			};
		}
		await writeConfigFile({
			...cfg,
			browser: {
				...cfg.browser,
				profiles: {
					...rawProfiles,
					[name]: profileConfig
				}
			}
		});
		state.resolved.profiles[name] = profileConfig;
		const resolved = resolveProfile(state.resolved, name);
		if (!resolved) throw new BrowserProfileNotFoundError(`profile "${name}" not found after creation`);
		const capabilities = getBrowserProfileCapabilities(resolved);
		return {
			ok: true,
			profile: name,
			transport: capabilities.usesChromeMcp ? "chrome-mcp" : "cdp",
			cdpPort: capabilities.usesChromeMcp ? null : resolved.cdpPort,
			cdpUrl: capabilities.usesChromeMcp ? null : resolved.cdpUrl,
			userDataDir: resolved.userDataDir ?? null,
			color: resolved.color,
			isRemote: !resolved.cdpIsLoopback
		};
	};
	const deleteProfile = async (nameRaw) => {
		const name = nameRaw.trim();
		if (!name) throw new BrowserValidationError("profile name is required");
		if (!isValidProfileName(name)) throw new BrowserValidationError("invalid profile name");
		const state = ctx.state();
		const cfg = loadConfig();
		const profiles = cfg.browser?.profiles ?? {};
		if (name === (cfg.browser?.defaultProfile ?? state.resolved.defaultProfile)) throw new BrowserValidationError(`cannot delete the default profile "${name}"; change browser.defaultProfile first`);
		if (!(name in profiles)) throw new BrowserProfileNotFoundError(`profile "${name}" not found`);
		let deleted = false;
		const resolved = resolveProfile(state.resolved, name);
		if (resolved?.cdpIsLoopback && resolved.driver === "openclaw") {
			try {
				await ctx.forProfile(name).stopRunningBrowser();
			} catch {}
			const userDataDir = resolveOpenClawUserDataDir(name);
			const profileDir = path.dirname(userDataDir);
			if (fs.existsSync(profileDir)) {
				await movePathToTrash(profileDir);
				deleted = true;
			}
		}
		const { [name]: _removed, ...remainingProfiles } = profiles;
		await writeConfigFile({
			...cfg,
			browser: {
				...cfg.browser,
				profiles: remainingProfiles
			}
		});
		delete state.resolved.profiles[name];
		state.profiles.delete(name);
		return {
			ok: true,
			profile: name,
			deleted
		};
	};
	return {
		listProfiles,
		createProfile,
		deleteProfile
	};
}
//#endregion
//#region extensions/browser/src/browser/routes/basic.ts
function handleBrowserRouteError(res, err) {
	const mapped = toBrowserErrorResponse(err);
	if (mapped) return jsonError(res, mapped.status, mapped.message);
	jsonError(res, 500, String(err));
}
async function withBasicProfileRoute(params) {
	const profileCtx = resolveProfileContext(params.req, params.res, params.ctx);
	if (!profileCtx) return;
	try {
		await params.run(profileCtx);
	} catch (err) {
		return handleBrowserRouteError(params.res, err);
	}
}
async function withProfilesServiceMutation(params) {
	try {
		const service = createBrowserProfilesService(params.ctx);
		const result = await params.run(service);
		params.res.json(result);
	} catch (err) {
		return handleBrowserRouteError(params.res, err);
	}
}
function registerBrowserBasicRoutes(app, ctx) {
	app.get("/profiles", async (_req, res) => {
		try {
			const profiles = await createBrowserProfilesService(ctx).listProfiles();
			res.json({ profiles });
		} catch (err) {
			jsonError(res, 500, String(err));
		}
	});
	app.get("/", async (req, res) => {
		let current;
		try {
			current = ctx.state();
		} catch {
			return jsonError(res, 503, "browser server not started");
		}
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		try {
			const [cdpHttp, cdpReady] = await Promise.all([profileCtx.isHttpReachable(300), profileCtx.isReachable(600)]);
			const profileState = current.profiles.get(profileCtx.profile.name);
			const capabilities = getBrowserProfileCapabilities(profileCtx.profile);
			let detectedBrowser = null;
			let detectedExecutablePath = null;
			let detectError = null;
			try {
				const detected = resolveBrowserExecutableForPlatform(current.resolved, process.platform);
				if (detected) {
					detectedBrowser = detected.kind;
					detectedExecutablePath = detected.path;
				}
			} catch (err) {
				detectError = String(err);
			}
			res.json({
				enabled: current.resolved.enabled,
				profile: profileCtx.profile.name,
				driver: profileCtx.profile.driver,
				transport: capabilities.usesChromeMcp ? "chrome-mcp" : "cdp",
				running: cdpReady,
				cdpReady,
				cdpHttp,
				pid: capabilities.usesChromeMcp ? getChromeMcpPid(profileCtx.profile.name) : profileState?.running?.pid ?? null,
				cdpPort: capabilities.usesChromeMcp ? null : profileCtx.profile.cdpPort,
				cdpUrl: capabilities.usesChromeMcp ? null : profileCtx.profile.cdpUrl,
				chosenBrowser: profileState?.running?.exe.kind ?? null,
				detectedBrowser,
				detectedExecutablePath,
				detectError,
				userDataDir: profileState?.running?.userDataDir ?? profileCtx.profile.userDataDir ?? null,
				color: profileCtx.profile.color,
				headless: current.resolved.headless,
				noSandbox: current.resolved.noSandbox,
				executablePath: current.resolved.executablePath ?? null,
				attachOnly: profileCtx.profile.attachOnly
			});
		} catch (err) {
			const mapped = toBrowserErrorResponse(err);
			if (mapped) return jsonError(res, mapped.status, mapped.message);
			jsonError(res, 500, String(err));
		}
	});
	app.post("/start", async (req, res) => {
		await withBasicProfileRoute({
			req,
			res,
			ctx,
			run: async (profileCtx) => {
				await profileCtx.ensureBrowserAvailable();
				res.json({
					ok: true,
					profile: profileCtx.profile.name
				});
			}
		});
	});
	app.post("/stop", async (req, res) => {
		await withBasicProfileRoute({
			req,
			res,
			ctx,
			run: async (profileCtx) => {
				const result = await profileCtx.stopRunningBrowser();
				res.json({
					ok: true,
					stopped: result.stopped,
					profile: profileCtx.profile.name
				});
			}
		});
	});
	app.post("/reset-profile", async (req, res) => {
		await withBasicProfileRoute({
			req,
			res,
			ctx,
			run: async (profileCtx) => {
				const result = await profileCtx.resetProfile();
				res.json({
					ok: true,
					profile: profileCtx.profile.name,
					...result
				});
			}
		});
	});
	app.post("/profiles/create", async (req, res) => {
		const name = toStringOrEmpty(req.body?.name);
		const color = toStringOrEmpty(req.body?.color);
		const cdpUrl = toStringOrEmpty(req.body?.cdpUrl);
		const userDataDir = toStringOrEmpty(req.body?.userDataDir);
		const driver = toStringOrEmpty(req.body?.driver);
		if (!name) return jsonError(res, 400, "name is required");
		if (driver && driver !== "openclaw" && driver !== "clawd" && driver !== "existing-session") return jsonError(res, 400, `unsupported profile driver "${driver}"; use "openclaw", "clawd", or "existing-session"`);
		await withProfilesServiceMutation({
			res,
			ctx,
			run: async (service) => await service.createProfile({
				name,
				color: color || void 0,
				cdpUrl: cdpUrl || void 0,
				userDataDir: userDataDir || void 0,
				driver: driver === "existing-session" ? "existing-session" : driver === "openclaw" || driver === "clawd" ? "openclaw" : void 0
			})
		});
	});
	app.delete("/profiles/:name", async (req, res) => {
		const name = toStringOrEmpty(req.params.name);
		if (!name) return jsonError(res, 400, "profile name is required");
		await withProfilesServiceMutation({
			res,
			ctx,
			run: async (service) => await service.deleteProfile(name)
		});
	});
}
//#endregion
//#region extensions/browser/src/browser/target-id.ts
function resolveTargetIdFromTabs(input, tabs) {
	const needle = input.trim();
	if (!needle) return {
		ok: false,
		reason: "not_found"
	};
	const exact = tabs.find((t) => t.targetId === needle);
	if (exact) return {
		ok: true,
		targetId: exact.targetId
	};
	const lower = normalizeLowercaseStringOrEmpty(needle);
	const matches = tabs.map((t) => t.targetId).filter((id) => normalizeLowercaseStringOrEmpty(id).startsWith(lower));
	const only = matches.length === 1 ? matches[0] : void 0;
	if (only) return {
		ok: true,
		targetId: only
	};
	if (matches.length === 0) return {
		ok: false,
		reason: "not_found"
	};
	return {
		ok: false,
		reason: "ambiguous",
		matches
	};
}
//#endregion
//#region extensions/browser/src/browser/routes/tabs.ts
function resolveTabsProfileContext(req, res, ctx) {
	const profileCtx = getProfileContext(req, ctx);
	if ("error" in profileCtx) {
		jsonError(res, profileCtx.status, profileCtx.error);
		return null;
	}
	return profileCtx;
}
function handleTabsRouteError(ctx, res, err, opts) {
	if (opts?.mapTabError) {
		const mapped = ctx.mapTabError(err);
		if (mapped) return jsonError(res, mapped.status, mapped.message);
	}
	return jsonError(res, 500, String(err));
}
async function withTabsProfileRoute(params) {
	const profileCtx = resolveTabsProfileContext(params.req, params.res, params.ctx);
	if (!profileCtx) return;
	try {
		await params.run(profileCtx);
	} catch (err) {
		handleTabsRouteError(params.ctx, params.res, err, { mapTabError: params.mapTabError });
	}
}
async function ensureBrowserRunning(profileCtx, res) {
	if (!await profileCtx.isReachable(300)) {
		jsonError(res, new BrowserProfileUnavailableError("browser not running").status, "browser not running");
		return false;
	}
	return true;
}
async function redactBlockedTabUrls(params) {
	const ssrfPolicyOpts = withBrowserNavigationPolicy(params.ssrfPolicy);
	if (!ssrfPolicyOpts.ssrfPolicy) return params.tabs;
	const redactedTabs = [];
	for (const tab of params.tabs) try {
		await assertBrowserNavigationResultAllowed({
			url: tab.url,
			...ssrfPolicyOpts
		});
		redactedTabs.push(tab);
	} catch {
		redactedTabs.push({
			...tab,
			url: ""
		});
	}
	return redactedTabs;
}
function resolveIndexedTab(tabs, index) {
	return typeof index === "number" ? tabs[index] : tabs.at(0);
}
function parseRequiredTargetId(res, rawTargetId) {
	const targetId = toStringOrEmpty(rawTargetId);
	if (!targetId) {
		jsonError(res, 400, "targetId is required");
		return null;
	}
	return targetId;
}
async function runTabTargetMutation(params) {
	await withTabsProfileRoute({
		req: params.req,
		res: params.res,
		ctx: params.ctx,
		mapTabError: true,
		run: async (profileCtx) => {
			if (!await ensureBrowserRunning(profileCtx, params.res)) return;
			await params.mutate(profileCtx, params.targetId);
			params.res.json({ ok: true });
		}
	});
}
function registerBrowserTabRoutes(app, ctx) {
	app.get("/tabs", async (req, res) => {
		await withTabsProfileRoute({
			req,
			res,
			ctx,
			run: async (profileCtx) => {
				if (!await profileCtx.isReachable(300)) return res.json({
					running: false,
					tabs: []
				});
				const tabs = await redactBlockedTabUrls({
					tabs: await profileCtx.listTabs(),
					ssrfPolicy: ctx.state().resolved.ssrfPolicy
				});
				res.json({
					running: true,
					tabs
				});
			}
		});
	});
	app.post("/tabs/open", async (req, res) => {
		const url = toStringOrEmpty(req.body?.url);
		if (!url) return jsonError(res, 400, "url is required");
		await withTabsProfileRoute({
			req,
			res,
			ctx,
			mapTabError: true,
			run: async (profileCtx) => {
				await assertBrowserNavigationAllowed({
					url,
					...withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy)
				});
				await profileCtx.ensureBrowserAvailable();
				const tab = await profileCtx.openTab(url);
				res.json(tab);
			}
		});
	});
	app.post("/tabs/focus", async (req, res) => {
		const targetId = parseRequiredTargetId(res, req.body?.targetId);
		if (!targetId) return;
		await runTabTargetMutation({
			req,
			res,
			ctx,
			targetId,
			mutate: async (profileCtx, id) => {
				const tabs = await profileCtx.listTabs();
				const resolved = resolveTargetIdFromTabs(id, tabs);
				if (!resolved.ok) {
					if (resolved.reason === "ambiguous") throw new BrowserTargetAmbiguousError();
					throw new BrowserTabNotFoundError();
				}
				const tab = tabs.find((currentTab) => currentTab.targetId === resolved.targetId);
				if (!tab) throw new BrowserTabNotFoundError();
				const ssrfPolicyOpts = withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy);
				if (ssrfPolicyOpts.ssrfPolicy) await assertBrowserNavigationResultAllowed({
					url: tab.url,
					...ssrfPolicyOpts
				});
				await profileCtx.focusTab(resolved.targetId);
			}
		});
	});
	app.delete("/tabs/:targetId", async (req, res) => {
		const targetId = parseRequiredTargetId(res, req.params.targetId);
		if (!targetId) return;
		await runTabTargetMutation({
			req,
			res,
			ctx,
			targetId,
			mutate: async (profileCtx, id) => {
				await profileCtx.closeTab(id);
			}
		});
	});
	app.post("/tabs/action", async (req, res) => {
		const action = toStringOrEmpty(req.body?.action);
		const index = toNumber(req.body?.index);
		await withTabsProfileRoute({
			req,
			res,
			ctx,
			mapTabError: true,
			run: async (profileCtx) => {
				if (action === "list") {
					if (!await profileCtx.isReachable(300)) return res.json({
						ok: true,
						tabs: []
					});
					const tabs = await redactBlockedTabUrls({
						tabs: await profileCtx.listTabs(),
						ssrfPolicy: ctx.state().resolved.ssrfPolicy
					});
					return res.json({
						ok: true,
						tabs
					});
				}
				if (action === "new") {
					await profileCtx.ensureBrowserAvailable();
					const tab = await profileCtx.openTab("about:blank");
					return res.json({
						ok: true,
						tab
					});
				}
				if (action === "close") {
					if (!await ensureBrowserRunning(profileCtx, res)) return;
					const target = resolveIndexedTab(await profileCtx.listTabs(), index);
					if (!target) throw new BrowserTabNotFoundError();
					await profileCtx.closeTab(target.targetId);
					return res.json({
						ok: true,
						targetId: target.targetId
					});
				}
				if (action === "select") {
					if (typeof index !== "number") return jsonError(res, 400, "index is required");
					if (!await ensureBrowserRunning(profileCtx, res)) return;
					const target = (await profileCtx.listTabs())[index];
					if (!target) throw new BrowserTabNotFoundError();
					const ssrfPolicyOpts = withBrowserNavigationPolicy(ctx.state().resolved.ssrfPolicy);
					if (ssrfPolicyOpts.ssrfPolicy) await assertBrowserNavigationResultAllowed({
						url: target.url,
						...ssrfPolicyOpts
					});
					await profileCtx.focusTab(target.targetId);
					return res.json({
						ok: true,
						targetId: target.targetId
					});
				}
				return jsonError(res, 400, "unknown tab action");
			}
		});
	});
}
//#endregion
//#region extensions/browser/src/browser/routes/index.ts
function registerBrowserRoutes(app, ctx) {
	registerBrowserBasicRoutes(app, ctx);
	registerBrowserTabRoutes(app, ctx);
	registerBrowserAgentRoutes(app, ctx);
}
//#endregion
//#region extensions/browser/src/browser/cdp-reachability-policy.ts
function resolveCdpReachabilityPolicy(profile, ssrfPolicy) {
	if (!getBrowserProfileCapabilities(profile).isRemote && profile.cdpIsLoopback && profile.driver === "openclaw") return;
	return ssrfPolicy;
}
const resolveCdpControlPolicy = resolveCdpReachabilityPolicy;
//#endregion
//#region extensions/browser/src/browser/config-refresh-source.ts
function loadBrowserConfigForRuntimeRefresh() {
	return getRuntimeConfigSnapshot() ?? createConfigIO().loadConfig();
}
//#endregion
//#region extensions/browser/src/browser/resolved-config-refresh.ts
function changedProfileInvariants(current, next) {
	const changed = [];
	if (current.cdpUrl !== next.cdpUrl) changed.push("cdpUrl");
	if (current.cdpPort !== next.cdpPort) changed.push("cdpPort");
	if (current.driver !== next.driver) changed.push("driver");
	if (current.attachOnly !== next.attachOnly) changed.push("attachOnly");
	if (current.cdpIsLoopback !== next.cdpIsLoopback) changed.push("cdpIsLoopback");
	if ((current.userDataDir ?? "") !== (next.userDataDir ?? "")) changed.push("userDataDir");
	return changed;
}
function applyResolvedConfig(current, freshResolved) {
	current.resolved = {
		...freshResolved,
		evaluateEnabled: current.resolved.evaluateEnabled
	};
	for (const [name, runtime] of current.profiles) {
		const nextProfile = resolveProfile(freshResolved, name);
		if (nextProfile) {
			const changed = changedProfileInvariants(runtime.profile, nextProfile);
			if (changed.length > 0) {
				runtime.reconcile = {
					previousProfile: runtime.profile,
					reason: `profile invariants changed: ${changed.join(", ")}`
				};
				runtime.lastTargetId = null;
			}
			runtime.profile = nextProfile;
			continue;
		}
		runtime.reconcile = {
			previousProfile: runtime.profile,
			reason: "profile removed from config"
		};
		runtime.lastTargetId = null;
		if (!runtime.running) current.profiles.delete(name);
	}
}
function refreshResolvedBrowserConfigFromDisk(params) {
	if (!params.refreshConfigFromDisk) return;
	const cfg = loadBrowserConfigForRuntimeRefresh();
	const freshResolved = resolveBrowserConfig(cfg.browser, cfg);
	applyResolvedConfig(params.current, freshResolved);
}
function resolveBrowserProfileWithHotReload(params) {
	refreshResolvedBrowserConfigFromDisk({
		current: params.current,
		refreshConfigFromDisk: params.refreshConfigFromDisk,
		mode: "cached"
	});
	let profile = resolveProfile(params.current.resolved, params.name);
	if (profile) return profile;
	refreshResolvedBrowserConfigFromDisk({
		current: params.current,
		refreshConfigFromDisk: params.refreshConfigFromDisk,
		mode: "fresh"
	});
	profile = resolveProfile(params.current.resolved, params.name);
	return profile;
}
//#endregion
//#region extensions/browser/src/browser/server-context.constants.ts
const OPEN_TAB_DISCOVERY_WINDOW_MS = 2e3;
const CDP_READY_AFTER_LAUNCH_WINDOW_MS = 8e3;
//#endregion
//#region extensions/browser/src/browser/server-context.lifecycle.ts
function resolveIdleProfileStopOutcome(profile) {
	const capabilities = getBrowserProfileCapabilities(profile);
	if (profile.attachOnly || capabilities.isRemote) return {
		stopped: true,
		closePlaywright: true
	};
	return {
		stopped: false,
		closePlaywright: false
	};
}
async function closePlaywrightBrowserConnectionForProfile$1(cdpUrl) {
	try {
		await (await import("./pw-ai-BJRFEth4.js")).closePlaywrightBrowserConnection(cdpUrl ? { cdpUrl } : void 0);
	} catch {}
}
//#endregion
//#region extensions/browser/src/browser/server-context.availability.ts
function createProfileAvailability({ opts, profile, state, getProfileState, setProfileRunning }) {
	const capabilities = getBrowserProfileCapabilities(profile);
	const resolveTimeouts = (timeoutMs) => resolveCdpReachabilityTimeouts({
		profileIsLoopback: profile.cdpIsLoopback,
		attachOnly: profile.attachOnly,
		timeoutMs,
		remoteHttpTimeoutMs: state().resolved.remoteCdpTimeoutMs,
		remoteHandshakeTimeoutMs: state().resolved.remoteCdpHandshakeTimeoutMs
	});
	const getCdpReachabilityPolicy = () => resolveCdpReachabilityPolicy(profile, state().resolved.ssrfPolicy);
	const isReachable = async (timeoutMs) => {
		if (capabilities.usesChromeMcp) {
			await listChromeMcpTabs(profile.name, profile.userDataDir);
			return true;
		}
		const { httpTimeoutMs, wsTimeoutMs } = resolveTimeouts(timeoutMs);
		return await isChromeCdpReady(profile.cdpUrl, httpTimeoutMs, wsTimeoutMs, getCdpReachabilityPolicy());
	};
	const isHttpReachable = async (timeoutMs) => {
		if (capabilities.usesChromeMcp) return await isReachable(timeoutMs);
		const { httpTimeoutMs } = resolveTimeouts(timeoutMs);
		return await isChromeReachable(profile.cdpUrl, httpTimeoutMs, getCdpReachabilityPolicy());
	};
	const attachRunning = (running) => {
		setProfileRunning(running);
		running.proc.on("exit", () => {
			if (!opts.getState()) return;
			if (getProfileState().running?.pid === running.pid) setProfileRunning(null);
		});
	};
	const reconcileProfileRuntime = async () => {
		const profileState = getProfileState();
		const reconcile = profileState.reconcile;
		if (!reconcile) return;
		profileState.reconcile = null;
		profileState.lastTargetId = null;
		const previousProfile = reconcile.previousProfile;
		if (profileState.running) {
			await stopOpenClawChrome(profileState.running).catch(() => {});
			setProfileRunning(null);
		}
		if (getBrowserProfileCapabilities(previousProfile).usesChromeMcp) await closeChromeMcpSession(previousProfile.name).catch(() => false);
		await closePlaywrightBrowserConnectionForProfile$1(previousProfile.cdpUrl);
		if (previousProfile.cdpUrl !== profile.cdpUrl) await closePlaywrightBrowserConnectionForProfile$1(profile.cdpUrl);
	};
	const waitForCdpReadyAfterLaunch = async () => {
		const deadlineMs = Date.now() + CDP_READY_AFTER_LAUNCH_WINDOW_MS;
		while (Date.now() < deadlineMs) {
			const remainingMs = Math.max(0, deadlineMs - Date.now());
			if (await isReachable(Math.max(75, Math.min(250, remainingMs)))) return;
			await new Promise((r) => setTimeout(r, 100));
		}
		throw new Error(`Chrome CDP websocket for profile "${profile.name}" is not reachable after start.`);
	};
	const waitForChromeMcpReadyAfterAttach = async () => {
		const deadlineMs = Date.now() + CHROME_MCP_ATTACH_READY_WINDOW_MS;
		let lastError;
		while (Date.now() < deadlineMs) {
			try {
				await listChromeMcpTabs(profile.name, profile.userDataDir);
				return;
			} catch (err) {
				lastError = err;
			}
			await new Promise((r) => setTimeout(r, 200));
		}
		const detail = lastError instanceof Error ? ` Last error: ${lastError.message}` : "";
		throw new BrowserProfileUnavailableError(`Chrome MCP existing-session attach for profile "${profile.name}" timed out waiting for tabs to become available. Approve the browser attach prompt, keep the browser open, and retry.${detail}`);
	};
	const ensureBrowserAvailable = async () => {
		await reconcileProfileRuntime();
		if (capabilities.usesChromeMcp) {
			if (profile.userDataDir && !fs.existsSync(profile.userDataDir)) throw new BrowserProfileUnavailableError(`Browser user data directory not found for profile "${profile.name}": ${profile.userDataDir}`);
			await ensureChromeMcpAvailable(profile.name, profile.userDataDir);
			await waitForChromeMcpReadyAfterAttach();
			return;
		}
		const current = state();
		const remoteCdp = capabilities.isRemote;
		const attachOnly = profile.attachOnly;
		const profileState = getProfileState();
		if (!await isHttpReachable()) {
			if ((attachOnly || remoteCdp) && opts.onEnsureAttachTarget) {
				await opts.onEnsureAttachTarget(profile);
				if (await isHttpReachable(1200)) return;
			}
			if (!attachOnly && !remoteCdp && profile.cdpIsLoopback && !profileState.running) {
				if (await isHttpReachable(1200) && await isReachable(1200)) return;
			}
			if (attachOnly || remoteCdp) throw new BrowserProfileUnavailableError(remoteCdp ? `Remote CDP for profile "${profile.name}" is not reachable at ${profile.cdpUrl}.` : `Browser attachOnly is enabled and profile "${profile.name}" is not running.`);
			const launched = await launchOpenClawChrome(current.resolved, profile);
			attachRunning(launched);
			try {
				await waitForCdpReadyAfterLaunch();
			} catch (err) {
				await stopOpenClawChrome(launched).catch(() => {});
				setProfileRunning(null);
				throw err;
			}
			return;
		}
		if (await isReachable()) return;
		if (attachOnly || remoteCdp) {
			if (opts.onEnsureAttachTarget) {
				await opts.onEnsureAttachTarget(profile);
				if (await isReachable(1200)) return;
			}
			if (remoteCdp && await isReachable(1200)) return;
			throw new BrowserProfileUnavailableError(remoteCdp ? `Remote CDP websocket for profile "${profile.name}" is not reachable.` : `Browser attachOnly is enabled and CDP websocket for profile "${profile.name}" is not reachable.`);
		}
		if (!profileState.running) throw new BrowserProfileUnavailableError(`Port ${profile.cdpPort} is in use for profile "${profile.name}" but not by openclaw. Run action=reset-profile profile=${profile.name} to kill the process.`);
		await stopOpenClawChrome(profileState.running);
		setProfileRunning(null);
		attachRunning(await launchOpenClawChrome(current.resolved, profile));
		if (!await isReachable(600)) throw new Error(`Chrome CDP websocket for profile "${profile.name}" is not reachable after restart.`);
	};
	const stopRunningBrowser = async () => {
		await reconcileProfileRuntime();
		if (capabilities.usesChromeMcp) return { stopped: await closeChromeMcpSession(profile.name) };
		const profileState = getProfileState();
		if (!profileState.running) {
			const idleStop = resolveIdleProfileStopOutcome(profile);
			if (idleStop.closePlaywright) await closePlaywrightBrowserConnectionForProfile$1(profile.cdpUrl);
			return { stopped: idleStop.stopped };
		}
		await stopOpenClawChrome(profileState.running);
		setProfileRunning(null);
		return { stopped: true };
	};
	return {
		isHttpReachable,
		isReachable,
		ensureBrowserAvailable,
		stopRunningBrowser
	};
}
//#endregion
//#region extensions/browser/src/browser/server-context.reset.ts
async function closePlaywrightBrowserConnectionForProfile(cdpUrl) {
	try {
		await (await import("./pw-ai-BJRFEth4.js")).closePlaywrightBrowserConnection(cdpUrl ? { cdpUrl } : void 0);
	} catch {}
}
function createProfileResetOps({ profile, getProfileState, stopRunningBrowser, isHttpReachable, resolveOpenClawUserDataDir }) {
	const capabilities = getBrowserProfileCapabilities(profile);
	const resetProfile = async () => {
		if (!capabilities.supportsReset) throw new BrowserResetUnsupportedError(`reset-profile is only supported for local profiles (profile "${profile.name}" is remote).`);
		const userDataDir = resolveOpenClawUserDataDir(profile.name);
		const profileState = getProfileState();
		if (await isHttpReachable(300) && !profileState.running) await closePlaywrightBrowserConnectionForProfile(profile.cdpUrl);
		if (profileState.running) await stopRunningBrowser();
		await closePlaywrightBrowserConnectionForProfile(profile.cdpUrl);
		if (!fs.existsSync(userDataDir)) return {
			moved: false,
			from: userDataDir
		};
		return {
			moved: true,
			from: userDataDir,
			to: await movePathToTrash(userDataDir)
		};
	};
	return { resetProfile };
}
//#endregion
//#region extensions/browser/src/browser/server-context.selection.ts
function createProfileSelectionOps({ profile, getProfileState, getCdpControlPolicy, ensureBrowserAvailable, listTabs, openTab }) {
	const cdpHttpBase = normalizeCdpHttpBaseForJsonEndpoints(profile.cdpUrl);
	const capabilities = getBrowserProfileCapabilities(profile);
	const ensureTabAvailable = async (targetId) => {
		await ensureBrowserAvailable();
		const profileState = getProfileState();
		if ((await listTabs()).length === 0) await openTab("about:blank");
		const tabs = await listTabs();
		const candidates = capabilities.supportsPerTabWs ? tabs.filter((t) => Boolean(t.wsUrl)) : tabs;
		const resolveById = (raw) => {
			const resolved = resolveTargetIdFromTabs(raw, candidates);
			if (!resolved.ok) {
				if (resolved.reason === "ambiguous") return "AMBIGUOUS";
				return null;
			}
			return candidates.find((t) => t.targetId === resolved.targetId) ?? null;
		};
		const pickDefault = () => {
			const last = normalizeOptionalString(profileState.lastTargetId) ?? "";
			const lastResolved = last ? resolveById(last) : null;
			if (lastResolved && lastResolved !== "AMBIGUOUS") return lastResolved;
			return candidates.find((t) => (t.type ?? "page") === "page") ?? candidates.at(0) ?? null;
		};
		const chosen = targetId ? resolveById(targetId) : pickDefault();
		if (chosen === "AMBIGUOUS") throw new BrowserTargetAmbiguousError();
		if (!chosen) throw new BrowserTabNotFoundError();
		profileState.lastTargetId = chosen.targetId;
		return chosen;
	};
	const resolveTargetIdOrThrow = async (targetId) => {
		const resolved = resolveTargetIdFromTabs(targetId, await listTabs());
		if (!resolved.ok) {
			if (resolved.reason === "ambiguous") throw new BrowserTargetAmbiguousError();
			throw new BrowserTabNotFoundError();
		}
		return resolved.targetId;
	};
	const focusTab = async (targetId) => {
		const resolvedTargetId = await resolveTargetIdOrThrow(targetId);
		if (capabilities.usesChromeMcp) {
			await focusChromeMcpTab(profile.name, resolvedTargetId, profile.userDataDir);
			const profileState = getProfileState();
			profileState.lastTargetId = resolvedTargetId;
			return;
		}
		if (capabilities.usesPersistentPlaywright) {
			const focusPageByTargetIdViaPlaywright = (await getPwAiModule$1({ mode: "strict" }))?.focusPageByTargetIdViaPlaywright;
			if (typeof focusPageByTargetIdViaPlaywright === "function") {
				await focusPageByTargetIdViaPlaywright({
					cdpUrl: profile.cdpUrl,
					targetId: resolvedTargetId,
					ssrfPolicy: getCdpControlPolicy()
				});
				const profileState = getProfileState();
				profileState.lastTargetId = resolvedTargetId;
				return;
			}
		}
		await fetchOk(appendCdpPath(cdpHttpBase, `/json/activate/${resolvedTargetId}`), void 0, void 0, getCdpControlPolicy());
		const profileState = getProfileState();
		profileState.lastTargetId = resolvedTargetId;
	};
	const closeTab = async (targetId) => {
		const resolvedTargetId = await resolveTargetIdOrThrow(targetId);
		if (capabilities.usesChromeMcp) {
			await closeChromeMcpTab(profile.name, resolvedTargetId, profile.userDataDir);
			return;
		}
		if (capabilities.usesPersistentPlaywright) {
			const closePageByTargetIdViaPlaywright = (await getPwAiModule$1({ mode: "strict" }))?.closePageByTargetIdViaPlaywright;
			if (typeof closePageByTargetIdViaPlaywright === "function") {
				await closePageByTargetIdViaPlaywright({
					cdpUrl: profile.cdpUrl,
					targetId: resolvedTargetId,
					ssrfPolicy: getCdpControlPolicy()
				});
				return;
			}
		}
		await fetchOk(appendCdpPath(cdpHttpBase, `/json/close/${resolvedTargetId}`), void 0, void 0, getCdpControlPolicy());
	};
	return {
		ensureTabAvailable,
		focusTab,
		closeTab
	};
}
//#endregion
//#region extensions/browser/src/browser/server-context.tab-ops.ts
/**
* Normalize a CDP WebSocket URL to use the correct base URL.
*/
function normalizeWsUrl(raw, cdpBaseUrl) {
	if (!raw) return;
	try {
		return normalizeCdpWsUrl(raw, cdpBaseUrl);
	} catch {
		return raw;
	}
}
function createProfileTabOps({ profile, state, getProfileState }) {
	const cdpHttpBase = normalizeCdpHttpBaseForJsonEndpoints(profile.cdpUrl);
	const capabilities = getBrowserProfileCapabilities(profile);
	const getCdpControlPolicy = () => resolveCdpControlPolicy(profile, state().resolved.ssrfPolicy);
	const listTabs = async () => {
		if (capabilities.usesChromeMcp) return await listChromeMcpTabs(profile.name, profile.userDataDir);
		if (capabilities.usesPersistentPlaywright) {
			const listPagesViaPlaywright = (await getPwAiModule$1({ mode: "strict" }))?.listPagesViaPlaywright;
			if (typeof listPagesViaPlaywright === "function") {
				const ssrfPolicy = getCdpControlPolicy();
				await assertCdpEndpointAllowed(profile.cdpUrl, ssrfPolicy);
				return (await listPagesViaPlaywright({
					cdpUrl: profile.cdpUrl,
					ssrfPolicy
				})).map((p) => ({
					targetId: p.targetId,
					title: p.title,
					url: p.url,
					type: p.type
				}));
			}
		}
		return (await fetchJson(appendCdpPath(cdpHttpBase, "/json/list"), void 0, void 0, getCdpControlPolicy())).map((t) => ({
			targetId: t.id ?? "",
			title: t.title ?? "",
			url: t.url ?? "",
			wsUrl: normalizeWsUrl(t.webSocketDebuggerUrl, profile.cdpUrl),
			type: t.type
		})).filter((t) => Boolean(t.targetId));
	};
	const enforceManagedTabLimit = async (keepTargetId) => {
		const profileState = getProfileState();
		if (!capabilities.supportsManagedTabLimit || state().resolved.attachOnly || !profileState.running) return;
		const pageTabs = await listTabs().then((tabs) => tabs.filter((tab) => (tab.type ?? "page") === "page")).catch(() => []);
		if (pageTabs.length <= 8) return;
		const candidates = pageTabs.filter((tab) => tab.targetId !== keepTargetId);
		const excessCount = pageTabs.length - 8;
		for (const tab of candidates.slice(0, excessCount)) fetchOk(appendCdpPath(cdpHttpBase, `/json/close/${tab.targetId}`), void 0, void 0, getCdpControlPolicy()).catch(() => {});
	};
	const triggerManagedTabLimit = (keepTargetId) => {
		enforceManagedTabLimit(keepTargetId).catch(() => {});
	};
	const openTab = async (url) => {
		const ssrfPolicyOpts = withBrowserNavigationPolicy(state().resolved.ssrfPolicy);
		if (capabilities.usesChromeMcp) {
			await assertBrowserNavigationAllowed({
				url,
				...ssrfPolicyOpts
			});
			const page = await openChromeMcpTab(profile.name, url, profile.userDataDir);
			const profileState = getProfileState();
			profileState.lastTargetId = page.targetId;
			await assertBrowserNavigationResultAllowed({
				url: page.url,
				...ssrfPolicyOpts
			});
			return page;
		}
		if (capabilities.usesPersistentPlaywright) {
			const createPageViaPlaywright = (await getPwAiModule$1({ mode: "strict" }))?.createPageViaPlaywright;
			if (typeof createPageViaPlaywright === "function") {
				const page = await createPageViaPlaywright({
					cdpUrl: profile.cdpUrl,
					url,
					...ssrfPolicyOpts
				});
				const profileState = getProfileState();
				profileState.lastTargetId = page.targetId;
				triggerManagedTabLimit(page.targetId);
				return {
					targetId: page.targetId,
					title: page.title,
					url: page.url,
					type: page.type
				};
			}
		}
		if (requiresInspectableBrowserNavigationRedirectsForUrl(url, state().resolved.ssrfPolicy)) throw new InvalidBrowserNavigationUrlError("Navigation blocked: strict browser SSRF policy requires Playwright-backed redirect-hop inspection");
		const createdViaCdp = await createTargetViaCdp({
			cdpUrl: profile.cdpUrl,
			url,
			ssrfPolicy: getCdpControlPolicy()
		}).then((r) => r.targetId).catch(() => null);
		if (createdViaCdp) {
			const profileState = getProfileState();
			profileState.lastTargetId = createdViaCdp;
			const deadline = Date.now() + OPEN_TAB_DISCOVERY_WINDOW_MS;
			while (Date.now() < deadline) {
				const found = (await listTabs().catch(() => [])).find((t) => t.targetId === createdViaCdp);
				if (found) {
					await assertBrowserNavigationResultAllowed({
						url: found.url,
						...ssrfPolicyOpts
					});
					triggerManagedTabLimit(found.targetId);
					return found;
				}
				await new Promise((r) => setTimeout(r, 100));
			}
			triggerManagedTabLimit(createdViaCdp);
			return {
				targetId: createdViaCdp,
				title: "",
				url,
				type: "page"
			};
		}
		const encoded = encodeURIComponent(url);
		const endpointUrl = new URL(appendCdpPath(cdpHttpBase, "/json/new"));
		await assertBrowserNavigationAllowed({
			url,
			...ssrfPolicyOpts
		});
		const endpoint = endpointUrl.search ? (() => {
			endpointUrl.searchParams.set("url", url);
			return endpointUrl.toString();
		})() : `${endpointUrl.toString()}?${encoded}`;
		const created = await fetchJson(endpoint, CDP_JSON_NEW_TIMEOUT_MS, { method: "PUT" }, getCdpControlPolicy()).catch(async (err) => {
			if (String(err).includes("HTTP 405")) return await fetchJson(endpoint, CDP_JSON_NEW_TIMEOUT_MS, void 0, getCdpControlPolicy());
			throw err;
		});
		if (!created.id) throw new Error("Failed to open tab (missing id)");
		const profileState = getProfileState();
		profileState.lastTargetId = created.id;
		const resolvedUrl = created.url ?? url;
		await assertBrowserNavigationResultAllowed({
			url: resolvedUrl,
			...ssrfPolicyOpts
		});
		triggerManagedTabLimit(created.id);
		return {
			targetId: created.id,
			title: created.title ?? "",
			url: resolvedUrl,
			wsUrl: normalizeWsUrl(created.webSocketDebuggerUrl, profile.cdpUrl),
			type: created.type
		};
	};
	return {
		listTabs,
		openTab
	};
}
//#endregion
//#region extensions/browser/src/browser/server-context.ts
function listKnownProfileNames(state) {
	const names = new Set(Object.keys(state.resolved.profiles));
	for (const name of state.profiles.keys()) names.add(name);
	return [...names];
}
/**
* Create a profile-scoped context for browser operations.
*/
function createProfileContext(opts, profile) {
	const state = () => {
		const current = opts.getState();
		if (!current) throw new Error("Browser server not started");
		return current;
	};
	const getProfileState = () => {
		const current = state();
		let profileState = current.profiles.get(profile.name);
		if (!profileState) {
			profileState = {
				profile,
				running: null,
				lastTargetId: null,
				reconcile: null
			};
			current.profiles.set(profile.name, profileState);
		}
		return profileState;
	};
	const setProfileRunning = (running) => {
		const profileState = getProfileState();
		profileState.running = running;
	};
	const { listTabs, openTab } = createProfileTabOps({
		profile,
		state,
		getProfileState
	});
	const { ensureBrowserAvailable, isHttpReachable, isReachable, stopRunningBrowser } = createProfileAvailability({
		opts,
		profile,
		state,
		getProfileState,
		setProfileRunning
	});
	const { ensureTabAvailable, focusTab, closeTab } = createProfileSelectionOps({
		profile,
		getProfileState,
		getCdpControlPolicy: () => resolveCdpControlPolicy(profile, state().resolved.ssrfPolicy),
		ensureBrowserAvailable,
		listTabs,
		openTab
	});
	const { resetProfile } = createProfileResetOps({
		profile,
		getProfileState,
		stopRunningBrowser,
		isHttpReachable,
		resolveOpenClawUserDataDir
	});
	return {
		profile,
		ensureBrowserAvailable,
		ensureTabAvailable,
		isHttpReachable,
		isReachable,
		listTabs,
		openTab,
		focusTab,
		closeTab,
		stopRunningBrowser,
		resetProfile
	};
}
function createBrowserRouteContext(opts) {
	const refreshConfigFromDisk = opts.refreshConfigFromDisk === true;
	const state = () => {
		const current = opts.getState();
		if (!current) throw new Error("Browser server not started");
		return current;
	};
	const forProfile = (profileName) => {
		const current = state();
		const name = profileName ?? current.resolved.defaultProfile;
		const profile = resolveBrowserProfileWithHotReload({
			current,
			refreshConfigFromDisk,
			name
		});
		if (!profile) throw new BrowserProfileNotFoundError(`Profile "${name}" not found. Available profiles: ${Object.keys(current.resolved.profiles).join(", ") || "(none)"}`);
		return createProfileContext(opts, profile);
	};
	const listProfiles = async () => {
		const current = state();
		refreshResolvedBrowserConfigFromDisk({
			current,
			refreshConfigFromDisk,
			mode: "cached"
		});
		const result = [];
		for (const name of listKnownProfileNames(current)) {
			const profileState = current.profiles.get(name);
			const profile = resolveProfile(current.resolved, name) ?? profileState?.profile;
			if (!profile) continue;
			const capabilities = getBrowserProfileCapabilities(profile);
			let tabCount = 0;
			let running = false;
			const profileCtx = createProfileContext(opts, profile);
			if (capabilities.usesChromeMcp) try {
				running = await profileCtx.isReachable(300);
				if (running) tabCount = (await profileCtx.listTabs()).filter((t) => t.type === "page").length;
			} catch {}
			else if (profileState?.running) {
				running = true;
				try {
					tabCount = (await profileCtx.listTabs()).filter((t) => t.type === "page").length;
				} catch {}
			} else try {
				const probeTimeoutMs = usesFastLoopbackCdpProbeClass({
					profileIsLoopback: profile.cdpIsLoopback,
					attachOnly: profile.attachOnly
				}) ? 200 : current.resolved.remoteCdpTimeoutMs;
				if (await isChromeReachable(profile.cdpUrl, probeTimeoutMs, resolveCdpReachabilityPolicy(profile, current.resolved.ssrfPolicy))) {
					running = true;
					tabCount = (await profileCtx.listTabs().catch(() => [])).filter((t) => t.type === "page").length;
				}
			} catch {}
			result.push({
				name,
				transport: capabilities.usesChromeMcp ? "chrome-mcp" : "cdp",
				cdpPort: capabilities.usesChromeMcp ? null : profile.cdpPort,
				cdpUrl: capabilities.usesChromeMcp ? null : profile.cdpUrl,
				color: profile.color,
				driver: profile.driver,
				running,
				tabCount,
				isDefault: name === current.resolved.defaultProfile,
				isRemote: !profile.cdpIsLoopback,
				missingFromConfig: !(name in current.resolved.profiles) || void 0,
				reconcileReason: profileState?.reconcile?.reason ?? null
			});
		}
		return result;
	};
	const getDefaultContext = () => forProfile();
	const mapTabError = (err) => {
		const browserMapped = toBrowserErrorResponse(err);
		if (browserMapped) return browserMapped;
		return null;
	};
	return {
		state,
		forProfile,
		listProfiles,
		ensureBrowserAvailable: () => getDefaultContext().ensureBrowserAvailable(),
		ensureTabAvailable: (targetId) => getDefaultContext().ensureTabAvailable(targetId),
		isHttpReachable: (timeoutMs) => getDefaultContext().isHttpReachable(timeoutMs),
		isReachable: (timeoutMs) => getDefaultContext().isReachable(timeoutMs),
		listTabs: () => getDefaultContext().listTabs(),
		openTab: (url) => getDefaultContext().openTab(url),
		focusTab: (targetId) => getDefaultContext().focusTab(targetId),
		closeTab: (targetId) => getDefaultContext().closeTab(targetId),
		stopRunningBrowser: () => getDefaultContext().stopRunningBrowser(),
		resetProfile: () => getDefaultContext().resetProfile(),
		mapTabError
	};
}
//#endregion
export { getBrowserProfileCapabilities as i, listKnownProfileNames as n, registerBrowserRoutes as r, createBrowserRouteContext as t };
