import { a as parseBooleanValue, et as resolvePreferredOpenClawTmpDir } from "./entry.js";
import { i as loadConfig, l as writeConfigFile } from "./config-BJWIHf6x.js";
import { a as resizeToJpeg, n as getImageMetadata } from "./image-ops-BuOO2fiP.js";
import { a as parseHttpUrl, c as allocateCdpPort, d as getUsedPorts, f as isValidProfileName, i as getPwAiModule$1, l as allocateColor, p as deriveDefaultBrowserCdpPortRange, r as movePathToTrash, s as resolveProfile, u as getUsedColors } from "./server-context-DSQVDg5o.js";
import { S as DEFAULT_BROWSER_DEFAULT_PROFILE_NAME, a as resolveOpenClawUserDataDir, b as DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS, c as captureScreenshot, f as snapshotAria, s as resolveBrowserExecutableForPlatform, x as DEFAULT_AI_SNAPSHOT_MAX_CHARS, y as DEFAULT_AI_SNAPSHOT_EFFICIENT_DEPTH } from "./chrome-Biwk6Xdw.js";
import { r as saveMediaBuffer, t as ensureMediaDir } from "./store-C2n2K571.js";
import path from "node:path";
import fs from "node:fs";
import fs$1 from "node:fs/promises";
import crypto from "node:crypto";

//#region src/browser/routes/agent.act.shared.ts
const ACT_KINDS = [
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
//#region src/browser/routes/utils.ts
/**
* Extract profile name from query string or body and get profile context.
* Query string takes precedence over body for consistency with GET routes.
*/
function getProfileContext(req, ctx) {
	let profileName;
	if (typeof req.query.profile === "string") profileName = req.query.profile.trim() || void 0;
	if (!profileName && req.body && typeof req.body === "object") {
		const body = req.body;
		if (typeof body.profile === "string") profileName = body.profile.trim() || void 0;
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
	if (typeof value === "string") return value.trim();
	if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
	return "";
}
function toNumber(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const parsed = Number(value);
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
//#region src/browser/routes/agent.shared.ts
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
function handleRouteError(ctx, res, err) {
	const mapped = ctx.mapTabError(err);
	if (mapped) return jsonError(res, mapped.status, mapped.message);
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

//#endregion
//#region src/browser/routes/path-output.ts
const DEFAULT_BROWSER_TMP_DIR = resolvePreferredOpenClawTmpDir();
const DEFAULT_TRACE_DIR = DEFAULT_BROWSER_TMP_DIR;
const DEFAULT_DOWNLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "downloads");
function resolvePathWithinRoot(params) {
	const root = path.resolve(params.rootDir);
	const raw = params.requestedPath.trim();
	if (!raw) {
		if (!params.defaultFileName) return {
			ok: false,
			error: "path is required"
		};
		return {
			ok: true,
			path: path.join(root, params.defaultFileName)
		};
	}
	const resolved = path.resolve(root, raw);
	const rel = path.relative(root, resolved);
	if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return {
		ok: false,
		error: `Invalid path: must stay within ${params.scopeLabel}`
	};
	return {
		ok: true,
		path: resolved
	};
}

//#endregion
//#region src/browser/routes/agent.act.ts
function registerBrowserAgentActRoutes(app, ctx) {
	app.post("/act", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const kindRaw = toStringOrEmpty(body.kind);
		if (!isActKind(kindRaw)) return jsonError(res, 400, "kind is required");
		const kind = kindRaw;
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		if (Object.hasOwn(body, "selector") && kind !== "wait") return jsonError(res, 400, SELECTOR_UNSUPPORTED_MESSAGE);
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const cdpUrl = profileCtx.profile.cdpUrl;
			const pw = await requirePwAi(res, `act:${kind}`);
			if (!pw) return;
			const evaluateEnabled = ctx.state().resolved.evaluateEnabled;
			switch (kind) {
				case "click": {
					const ref = toStringOrEmpty(body.ref);
					if (!ref) return jsonError(res, 400, "ref is required");
					const doubleClick = toBoolean(body.doubleClick) ?? false;
					const timeoutMs = toNumber(body.timeoutMs);
					const buttonRaw = toStringOrEmpty(body.button) || "";
					const button = buttonRaw ? parseClickButton(buttonRaw) : void 0;
					if (buttonRaw && !button) return jsonError(res, 400, "button must be left|right|middle");
					const parsedModifiers = parseClickModifiers(toStringArray(body.modifiers) ?? []);
					if (parsedModifiers.error) return jsonError(res, 400, parsedModifiers.error);
					const modifiers = parsedModifiers.modifiers;
					const clickRequest = {
						cdpUrl,
						targetId: tab.targetId,
						ref,
						doubleClick
					};
					if (button) clickRequest.button = button;
					if (modifiers) clickRequest.modifiers = modifiers;
					if (timeoutMs) clickRequest.timeoutMs = timeoutMs;
					await pw.clickViaPlaywright(clickRequest);
					return res.json({
						ok: true,
						targetId: tab.targetId,
						url: tab.url
					});
				}
				case "type": {
					const ref = toStringOrEmpty(body.ref);
					if (!ref) return jsonError(res, 400, "ref is required");
					if (typeof body.text !== "string") return jsonError(res, 400, "text is required");
					const text = body.text;
					const submit = toBoolean(body.submit) ?? false;
					const slowly = toBoolean(body.slowly) ?? false;
					const timeoutMs = toNumber(body.timeoutMs);
					const typeRequest = {
						cdpUrl,
						targetId: tab.targetId,
						ref,
						text,
						submit,
						slowly
					};
					if (timeoutMs) typeRequest.timeoutMs = timeoutMs;
					await pw.typeViaPlaywright(typeRequest);
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				case "press": {
					const key = toStringOrEmpty(body.key);
					if (!key) return jsonError(res, 400, "key is required");
					const delayMs = toNumber(body.delayMs);
					await pw.pressKeyViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						key,
						delayMs: delayMs ?? void 0
					});
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				case "hover": {
					const ref = toStringOrEmpty(body.ref);
					if (!ref) return jsonError(res, 400, "ref is required");
					const timeoutMs = toNumber(body.timeoutMs);
					await pw.hoverViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						ref,
						timeoutMs: timeoutMs ?? void 0
					});
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				case "scrollIntoView": {
					const ref = toStringOrEmpty(body.ref);
					if (!ref) return jsonError(res, 400, "ref is required");
					const timeoutMs = toNumber(body.timeoutMs);
					const scrollRequest = {
						cdpUrl,
						targetId: tab.targetId,
						ref
					};
					if (timeoutMs) scrollRequest.timeoutMs = timeoutMs;
					await pw.scrollIntoViewViaPlaywright(scrollRequest);
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				case "drag": {
					const startRef = toStringOrEmpty(body.startRef);
					const endRef = toStringOrEmpty(body.endRef);
					if (!startRef || !endRef) return jsonError(res, 400, "startRef and endRef are required");
					const timeoutMs = toNumber(body.timeoutMs);
					await pw.dragViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						startRef,
						endRef,
						timeoutMs: timeoutMs ?? void 0
					});
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				case "select": {
					const ref = toStringOrEmpty(body.ref);
					const values = toStringArray(body.values);
					if (!ref || !values?.length) return jsonError(res, 400, "ref and values are required");
					const timeoutMs = toNumber(body.timeoutMs);
					await pw.selectOptionViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						ref,
						values,
						timeoutMs: timeoutMs ?? void 0
					});
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				case "fill": {
					const fields = (Array.isArray(body.fields) ? body.fields : []).map((field) => {
						if (!field || typeof field !== "object") return null;
						const rec = field;
						const ref = toStringOrEmpty(rec.ref);
						const type = toStringOrEmpty(rec.type);
						if (!ref || !type) return null;
						const value = typeof rec.value === "string" || typeof rec.value === "number" || typeof rec.value === "boolean" ? rec.value : void 0;
						return value === void 0 ? {
							ref,
							type
						} : {
							ref,
							type,
							value
						};
					}).filter((field) => field !== null);
					if (!fields.length) return jsonError(res, 400, "fields are required");
					const timeoutMs = toNumber(body.timeoutMs);
					await pw.fillFormViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						fields,
						timeoutMs: timeoutMs ?? void 0
					});
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				case "resize": {
					const width = toNumber(body.width);
					const height = toNumber(body.height);
					if (!width || !height) return jsonError(res, 400, "width and height are required");
					await pw.resizeViewportViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						width,
						height
					});
					return res.json({
						ok: true,
						targetId: tab.targetId,
						url: tab.url
					});
				}
				case "wait": {
					const timeMs = toNumber(body.timeMs);
					const text = toStringOrEmpty(body.text) || void 0;
					const textGone = toStringOrEmpty(body.textGone) || void 0;
					const selector = toStringOrEmpty(body.selector) || void 0;
					const url = toStringOrEmpty(body.url) || void 0;
					const loadStateRaw = toStringOrEmpty(body.loadState);
					const loadState = loadStateRaw === "load" || loadStateRaw === "domcontentloaded" || loadStateRaw === "networkidle" ? loadStateRaw : void 0;
					const fn = toStringOrEmpty(body.fn) || void 0;
					const timeoutMs = toNumber(body.timeoutMs) ?? void 0;
					if (fn && !evaluateEnabled) return jsonError(res, 403, ["wait --fn is disabled by config (browser.evaluateEnabled=false).", "Docs: /gateway/configuration#browser-openclaw-managed-browser"].join("\n"));
					if (timeMs === void 0 && !text && !textGone && !selector && !url && !loadState && !fn) return jsonError(res, 400, "wait requires at least one of: timeMs, text, textGone, selector, url, loadState, fn");
					await pw.waitForViaPlaywright({
						cdpUrl,
						targetId: tab.targetId,
						timeMs,
						text,
						textGone,
						selector,
						url,
						loadState,
						fn,
						timeoutMs
					});
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				}
				case "evaluate": {
					if (!evaluateEnabled) return jsonError(res, 403, ["act:evaluate is disabled by config (browser.evaluateEnabled=false).", "Docs: /gateway/configuration#browser-openclaw-managed-browser"].join("\n"));
					const fn = toStringOrEmpty(body.fn);
					if (!fn) return jsonError(res, 400, "fn is required");
					const ref = toStringOrEmpty(body.ref) || void 0;
					const evalTimeoutMs = toNumber(body.timeoutMs);
					const evalRequest = {
						cdpUrl,
						targetId: tab.targetId,
						fn,
						ref,
						signal: req.signal
					};
					if (evalTimeoutMs !== void 0) evalRequest.timeoutMs = evalTimeoutMs;
					const result = await pw.evaluateViaPlaywright(evalRequest);
					return res.json({
						ok: true,
						targetId: tab.targetId,
						url: tab.url,
						result
					});
				}
				case "close":
					await pw.closePageViaPlaywright({
						cdpUrl,
						targetId: tab.targetId
					});
					return res.json({
						ok: true,
						targetId: tab.targetId
					});
				default: return jsonError(res, 400, "unsupported kind");
			}
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/hooks/file-chooser", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const ref = toStringOrEmpty(body.ref) || void 0;
		const inputRef = toStringOrEmpty(body.inputRef) || void 0;
		const element = toStringOrEmpty(body.element) || void 0;
		const paths = toStringArray(body.paths) ?? [];
		const timeoutMs = toNumber(body.timeoutMs);
		if (!paths.length) return jsonError(res, 400, "paths are required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "file chooser hook");
			if (!pw) return;
			if (inputRef || element) {
				if (ref) return jsonError(res, 400, "ref cannot be combined with inputRef/element");
				await pw.setInputFilesViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					inputRef,
					element,
					paths
				});
			} else {
				await pw.armFileUploadViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					paths,
					timeoutMs: timeoutMs ?? void 0
				});
				if (ref) await pw.clickViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					ref
				});
			}
			res.json({ ok: true });
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/hooks/dialog", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const accept = toBoolean(body.accept);
		const promptText = toStringOrEmpty(body.promptText) || void 0;
		const timeoutMs = toNumber(body.timeoutMs);
		if (accept === void 0) return jsonError(res, 400, "accept is required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "dialog hook");
			if (!pw) return;
			await pw.armDialogViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				accept,
				promptText,
				timeoutMs: timeoutMs ?? void 0
			});
			res.json({ ok: true });
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/wait/download", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const out = toStringOrEmpty(body.path) || "";
		const timeoutMs = toNumber(body.timeoutMs);
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "wait for download");
			if (!pw) return;
			let downloadPath;
			if (out.trim()) {
				const downloadPathResult = resolvePathWithinRoot({
					rootDir: DEFAULT_DOWNLOAD_DIR,
					requestedPath: out,
					scopeLabel: "downloads directory"
				});
				if (!downloadPathResult.ok) {
					res.status(400).json({ error: downloadPathResult.error });
					return;
				}
				downloadPath = downloadPathResult.path;
			}
			const result = await pw.waitForDownloadViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				path: downloadPath,
				timeoutMs: timeoutMs ?? void 0
			});
			res.json({
				ok: true,
				targetId: tab.targetId,
				download: result
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/download", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const ref = toStringOrEmpty(body.ref);
		const out = toStringOrEmpty(body.path);
		const timeoutMs = toNumber(body.timeoutMs);
		if (!ref) return jsonError(res, 400, "ref is required");
		if (!out) return jsonError(res, 400, "path is required");
		try {
			const downloadPathResult = resolvePathWithinRoot({
				rootDir: DEFAULT_DOWNLOAD_DIR,
				requestedPath: out,
				scopeLabel: "downloads directory"
			});
			if (!downloadPathResult.ok) {
				res.status(400).json({ error: downloadPathResult.error });
				return;
			}
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "download");
			if (!pw) return;
			const result = await pw.downloadViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				ref,
				path: downloadPathResult.path,
				timeoutMs: timeoutMs ?? void 0
			});
			res.json({
				ok: true,
				targetId: tab.targetId,
				download: result
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/response/body", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const url = toStringOrEmpty(body.url);
		const timeoutMs = toNumber(body.timeoutMs);
		const maxChars = toNumber(body.maxChars);
		if (!url) return jsonError(res, 400, "url is required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "response body");
			if (!pw) return;
			const result = await pw.responseBodyViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
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
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/highlight", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const ref = toStringOrEmpty(body.ref);
		if (!ref) return jsonError(res, 400, "ref is required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "highlight");
			if (!pw) return;
			await pw.highlightViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				ref
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
}

//#endregion
//#region src/browser/routes/agent.debug.ts
function registerBrowserAgentDebugRoutes(app, ctx) {
	app.get("/console", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const targetId = typeof req.query.targetId === "string" ? req.query.targetId.trim() : "";
		const level = typeof req.query.level === "string" ? req.query.level : "";
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId || void 0);
			const pw = await requirePwAi(res, "console messages");
			if (!pw) return;
			const messages = await pw.getConsoleMessagesViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				level: level.trim() || void 0
			});
			res.json({
				ok: true,
				messages,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.get("/errors", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const targetId = typeof req.query.targetId === "string" ? req.query.targetId.trim() : "";
		const clear = toBoolean(req.query.clear) ?? false;
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId || void 0);
			const pw = await requirePwAi(res, "page errors");
			if (!pw) return;
			const result = await pw.getPageErrorsViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				clear
			});
			res.json({
				ok: true,
				targetId: tab.targetId,
				...result
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.get("/requests", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const targetId = typeof req.query.targetId === "string" ? req.query.targetId.trim() : "";
		const filter = typeof req.query.filter === "string" ? req.query.filter : "";
		const clear = toBoolean(req.query.clear) ?? false;
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId || void 0);
			const pw = await requirePwAi(res, "network requests");
			if (!pw) return;
			const result = await pw.getNetworkRequestsViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				filter: filter.trim() || void 0,
				clear
			});
			res.json({
				ok: true,
				targetId: tab.targetId,
				...result
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/trace/start", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const screenshots = toBoolean(body.screenshots) ?? void 0;
		const snapshots = toBoolean(body.snapshots) ?? void 0;
		const sources = toBoolean(body.sources) ?? void 0;
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "trace start");
			if (!pw) return;
			await pw.traceStartViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				screenshots,
				snapshots,
				sources
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/trace/stop", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const out = toStringOrEmpty(body.path) || "";
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "trace stop");
			if (!pw) return;
			const id = crypto.randomUUID();
			const dir = DEFAULT_TRACE_DIR;
			await fs$1.mkdir(dir, { recursive: true });
			const tracePathResult = resolvePathWithinRoot({
				rootDir: dir,
				requestedPath: out,
				scopeLabel: "trace directory",
				defaultFileName: `browser-trace-${id}.zip`
			});
			if (!tracePathResult.ok) {
				res.status(400).json({ error: tracePathResult.error });
				return;
			}
			const tracePath = tracePathResult.path;
			await pw.traceStopViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				path: tracePath
			});
			res.json({
				ok: true,
				targetId: tab.targetId,
				path: path.resolve(tracePath)
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
}

//#endregion
//#region src/browser/screenshot.ts
const DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE = 2e3;
const DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;
async function normalizeBrowserScreenshot(buffer, opts) {
	const maxSide = Math.max(1, Math.round(opts?.maxSide ?? DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE));
	const maxBytes = Math.max(1, Math.round(opts?.maxBytes ?? DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES));
	const meta = await getImageMetadata(buffer);
	const width = Number(meta?.width ?? 0);
	const height = Number(meta?.height ?? 0);
	const maxDim = Math.max(width, height);
	if (buffer.byteLength <= maxBytes && (maxDim === 0 || width <= maxSide && height <= maxSide)) return { buffer };
	const qualities = [
		85,
		75,
		65,
		55,
		45,
		35
	];
	const sideGrid = [
		maxDim > 0 ? Math.min(maxSide, maxDim) : maxSide,
		1800,
		1600,
		1400,
		1200,
		1e3,
		800
	].map((v) => Math.min(maxSide, v)).filter((v, i, arr) => v > 0 && arr.indexOf(v) === i).toSorted((a, b) => b - a);
	let smallest = null;
	for (const side of sideGrid) for (const quality of qualities) {
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
//#region src/browser/routes/agent.snapshot.ts
function registerBrowserAgentSnapshotRoutes(app, ctx) {
	app.post("/navigate", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const url = toStringOrEmpty(body.url);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		if (!url) return jsonError(res, 400, "url is required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "navigate");
			if (!pw) return;
			const result = await pw.navigateViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				url
			});
			res.json({
				ok: true,
				targetId: tab.targetId,
				...result
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/pdf", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const targetId = toStringOrEmpty(readBody(req).targetId) || void 0;
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "pdf");
			if (!pw) return;
			const pdf = await pw.pdfViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId
			});
			await ensureMediaDir();
			const saved = await saveMediaBuffer(pdf.buffer, "application/pdf", "browser", pdf.buffer.byteLength);
			res.json({
				ok: true,
				path: path.resolve(saved.path),
				targetId: tab.targetId,
				url: tab.url
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/screenshot", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const fullPage = toBoolean(body.fullPage) ?? false;
		const ref = toStringOrEmpty(body.ref) || void 0;
		const element = toStringOrEmpty(body.element) || void 0;
		const type = body.type === "jpeg" ? "jpeg" : "png";
		if (fullPage && (ref || element)) return jsonError(res, 400, "fullPage is not supported for element screenshots");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			let buffer;
			if (profileCtx.profile.driver === "extension" || !tab.wsUrl || Boolean(ref) || Boolean(element)) {
				const pw = await requirePwAi(res, "screenshot");
				if (!pw) return;
				buffer = (await pw.takeScreenshotViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
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
			const normalized = await normalizeBrowserScreenshot(buffer, {
				maxSide: DEFAULT_BROWSER_SCREENSHOT_MAX_SIDE,
				maxBytes: DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES
			});
			await ensureMediaDir();
			const saved = await saveMediaBuffer(normalized.buffer, normalized.contentType ?? `image/${type}`, "browser", DEFAULT_BROWSER_SCREENSHOT_MAX_BYTES);
			res.json({
				ok: true,
				path: path.resolve(saved.path),
				targetId: tab.targetId,
				url: tab.url
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.get("/snapshot", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const targetId = typeof req.query.targetId === "string" ? req.query.targetId.trim() : "";
		const mode = req.query.mode === "efficient" ? "efficient" : void 0;
		const labels = toBoolean(req.query.labels) ?? void 0;
		const format = (req.query.format === "aria" ? "aria" : req.query.format === "ai" ? "ai" : void 0) ?? (mode ? "ai" : await getPwAiModule() ? "ai" : "aria");
		const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : void 0;
		const hasMaxChars = Object.hasOwn(req.query, "maxChars");
		const maxCharsRaw = typeof req.query.maxChars === "string" ? Number(req.query.maxChars) : void 0;
		const limit = Number.isFinite(limitRaw) ? limitRaw : void 0;
		const resolvedMaxChars = format === "ai" ? hasMaxChars ? typeof maxCharsRaw === "number" && Number.isFinite(maxCharsRaw) && maxCharsRaw > 0 ? Math.floor(maxCharsRaw) : void 0 : mode === "efficient" ? DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS : DEFAULT_AI_SNAPSHOT_MAX_CHARS : void 0;
		const interactiveRaw = toBoolean(req.query.interactive);
		const compactRaw = toBoolean(req.query.compact);
		const depthRaw = toNumber(req.query.depth);
		const refsModeRaw = toStringOrEmpty(req.query.refs).trim();
		const refsMode = refsModeRaw === "aria" ? "aria" : refsModeRaw === "role" ? "role" : void 0;
		const interactive = interactiveRaw ?? (mode === "efficient" ? true : void 0);
		const compact = compactRaw ?? (mode === "efficient" ? true : void 0);
		const depth = depthRaw ?? (mode === "efficient" ? DEFAULT_AI_SNAPSHOT_EFFICIENT_DEPTH : void 0);
		const selector = toStringOrEmpty(req.query.selector);
		const frameSelector = toStringOrEmpty(req.query.frame);
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId || void 0);
			if ((labels || mode === "efficient") && format === "aria") return jsonError(res, 400, "labels/mode=efficient require format=ai");
			if (format === "ai") {
				const pw = await requirePwAi(res, "ai snapshot");
				if (!pw) return;
				const snap = labels === true || mode === "efficient" || interactive === true || compact === true || depth !== void 0 || Boolean(selector.trim()) || Boolean(frameSelector.trim()) ? await pw.snapshotRoleViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					selector: selector.trim() || void 0,
					frameSelector: frameSelector.trim() || void 0,
					refsMode,
					options: {
						interactive: interactive ?? void 0,
						compact: compact ?? void 0,
						maxDepth: depth ?? void 0
					}
				}) : await pw.snapshotAiViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					...typeof resolvedMaxChars === "number" ? { maxChars: resolvedMaxChars } : {}
				}).catch(async (err) => {
					if (String(err).toLowerCase().includes("_snapshotforai")) return await pw.snapshotRoleViaPlaywright({
						cdpUrl: profileCtx.profile.cdpUrl,
						targetId: tab.targetId,
						selector: selector.trim() || void 0,
						frameSelector: frameSelector.trim() || void 0,
						refsMode,
						options: {
							interactive: interactive ?? void 0,
							compact: compact ?? void 0,
							maxDepth: depth ?? void 0
						}
					});
					throw err;
				});
				if (labels) {
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
						format,
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
					format,
					targetId: tab.targetId,
					url: tab.url,
					...snap
				});
			}
			const snap = profileCtx.profile.driver === "extension" || !tab.wsUrl ? requirePwAi(res, "aria snapshot").then(async (pw) => {
				if (!pw) return null;
				return await pw.snapshotAriaViaPlaywright({
					cdpUrl: profileCtx.profile.cdpUrl,
					targetId: tab.targetId,
					limit
				});
			}) : snapshotAria({
				wsUrl: tab.wsUrl ?? "",
				limit
			});
			const resolved = await Promise.resolve(snap);
			if (!resolved) return;
			return res.json({
				ok: true,
				format,
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
//#region src/browser/routes/agent.storage.ts
function registerBrowserAgentStorageRoutes(app, ctx) {
	app.get("/cookies", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const targetId = typeof req.query.targetId === "string" ? req.query.targetId.trim() : "";
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId || void 0);
			const pw = await requirePwAi(res, "cookies");
			if (!pw) return;
			const result = await pw.cookiesGetViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId
			});
			res.json({
				ok: true,
				targetId: tab.targetId,
				...result
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/cookies/set", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const cookie = body.cookie && typeof body.cookie === "object" && !Array.isArray(body.cookie) ? body.cookie : null;
		if (!cookie) return jsonError(res, 400, "cookie is required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "cookies set");
			if (!pw) return;
			await pw.cookiesSetViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
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
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/cookies/clear", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const targetId = toStringOrEmpty(readBody(req).targetId) || void 0;
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "cookies clear");
			if (!pw) return;
			await pw.cookiesClearViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.get("/storage/:kind", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const kind = toStringOrEmpty(req.params.kind);
		if (kind !== "local" && kind !== "session") return jsonError(res, 400, "kind must be local|session");
		const targetId = typeof req.query.targetId === "string" ? req.query.targetId.trim() : "";
		const key = typeof req.query.key === "string" ? req.query.key : "";
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId || void 0);
			const pw = await requirePwAi(res, "storage get");
			if (!pw) return;
			const result = await pw.storageGetViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				kind,
				key: key.trim() || void 0
			});
			res.json({
				ok: true,
				targetId: tab.targetId,
				...result
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/storage/:kind/set", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const kind = toStringOrEmpty(req.params.kind);
		if (kind !== "local" && kind !== "session") return jsonError(res, 400, "kind must be local|session");
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const key = toStringOrEmpty(body.key);
		if (!key) return jsonError(res, 400, "key is required");
		const value = typeof body.value === "string" ? body.value : "";
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "storage set");
			if (!pw) return;
			await pw.storageSetViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				kind,
				key,
				value
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/storage/:kind/clear", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const kind = toStringOrEmpty(req.params.kind);
		if (kind !== "local" && kind !== "session") return jsonError(res, 400, "kind must be local|session");
		const targetId = toStringOrEmpty(readBody(req).targetId) || void 0;
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "storage clear");
			if (!pw) return;
			await pw.storageClearViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				kind
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/set/offline", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const offline = toBoolean(body.offline);
		if (offline === void 0) return jsonError(res, 400, "offline is required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "offline");
			if (!pw) return;
			await pw.setOfflineViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				offline
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/set/headers", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const headers = body.headers && typeof body.headers === "object" && !Array.isArray(body.headers) ? body.headers : null;
		if (!headers) return jsonError(res, 400, "headers is required");
		const parsed = {};
		for (const [k, v] of Object.entries(headers)) if (typeof v === "string") parsed[k] = v;
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "headers");
			if (!pw) return;
			await pw.setExtraHTTPHeadersViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				headers: parsed
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/set/credentials", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const clear = toBoolean(body.clear) ?? false;
		const username = toStringOrEmpty(body.username) || void 0;
		const password = typeof body.password === "string" ? body.password : void 0;
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "http credentials");
			if (!pw) return;
			await pw.setHttpCredentialsViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				username,
				password,
				clear
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/set/geolocation", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const clear = toBoolean(body.clear) ?? false;
		const latitude = toNumber(body.latitude);
		const longitude = toNumber(body.longitude);
		const accuracy = toNumber(body.accuracy) ?? void 0;
		const origin = toStringOrEmpty(body.origin) || void 0;
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "geolocation");
			if (!pw) return;
			await pw.setGeolocationViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
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
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/set/media", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const schemeRaw = toStringOrEmpty(body.colorScheme);
		const colorScheme = schemeRaw === "dark" || schemeRaw === "light" || schemeRaw === "no-preference" ? schemeRaw : schemeRaw === "none" ? null : void 0;
		if (colorScheme === void 0) return jsonError(res, 400, "colorScheme must be dark|light|no-preference|none");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "media emulation");
			if (!pw) return;
			await pw.emulateMediaViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				colorScheme
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/set/timezone", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const timezoneId = toStringOrEmpty(body.timezoneId);
		if (!timezoneId) return jsonError(res, 400, "timezoneId is required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "timezone");
			if (!pw) return;
			await pw.setTimezoneViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				timezoneId
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/set/locale", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const locale = toStringOrEmpty(body.locale);
		if (!locale) return jsonError(res, 400, "locale is required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "locale");
			if (!pw) return;
			await pw.setLocaleViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				locale
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
	app.post("/set/device", async (req, res) => {
		const profileCtx = resolveProfileContext(req, res, ctx);
		if (!profileCtx) return;
		const body = readBody(req);
		const targetId = toStringOrEmpty(body.targetId) || void 0;
		const name = toStringOrEmpty(body.name);
		if (!name) return jsonError(res, 400, "name is required");
		try {
			const tab = await profileCtx.ensureTabAvailable(targetId);
			const pw = await requirePwAi(res, "device emulation");
			if (!pw) return;
			await pw.setDeviceViaPlaywright({
				cdpUrl: profileCtx.profile.cdpUrl,
				targetId: tab.targetId,
				name
			});
			res.json({
				ok: true,
				targetId: tab.targetId
			});
		} catch (err) {
			handleRouteError(ctx, res, err);
		}
	});
}

//#endregion
//#region src/browser/routes/agent.ts
function registerBrowserAgentRoutes(app, ctx) {
	registerBrowserAgentSnapshotRoutes(app, ctx);
	registerBrowserAgentActRoutes(app, ctx);
	registerBrowserAgentDebugRoutes(app, ctx);
	registerBrowserAgentStorageRoutes(app, ctx);
}

//#endregion
//#region src/browser/profiles-service.ts
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
function createBrowserProfilesService(ctx) {
	const listProfiles = async () => {
		return await ctx.listProfiles();
	};
	const createProfile = async (params) => {
		const name = params.name.trim();
		const rawCdpUrl = params.cdpUrl?.trim() || void 0;
		const driver = params.driver === "extension" ? "extension" : void 0;
		if (!isValidProfileName(name)) throw new Error("invalid profile name: use lowercase letters, numbers, and hyphens only");
		const state = ctx.state();
		const resolvedProfiles = state.resolved.profiles;
		if (name in resolvedProfiles) throw new Error(`profile "${name}" already exists`);
		const cfg = loadConfig();
		const rawProfiles = cfg.browser?.profiles ?? {};
		if (name in rawProfiles) throw new Error(`profile "${name}" already exists`);
		const usedColors = getUsedColors(resolvedProfiles);
		const profileColor = params.color && HEX_COLOR_RE.test(params.color) ? params.color : allocateColor(usedColors);
		let profileConfig;
		if (rawCdpUrl) profileConfig = {
			cdpUrl: parseHttpUrl(rawCdpUrl, "browser.profiles.cdpUrl").normalized,
			...driver ? { driver } : {},
			color: profileColor
		};
		else {
			const cdpPort = allocateCdpPort(getUsedPorts(resolvedProfiles), deriveDefaultBrowserCdpPortRange(state.resolved.controlPort));
			if (cdpPort === null) throw new Error("no available CDP ports in range");
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
		if (!resolved) throw new Error(`profile "${name}" not found after creation`);
		return {
			ok: true,
			profile: name,
			cdpPort: resolved.cdpPort,
			cdpUrl: resolved.cdpUrl,
			color: resolved.color,
			isRemote: !resolved.cdpIsLoopback
		};
	};
	const deleteProfile = async (nameRaw) => {
		const name = nameRaw.trim();
		if (!name) throw new Error("profile name is required");
		if (!isValidProfileName(name)) throw new Error("invalid profile name");
		const cfg = loadConfig();
		const profiles = cfg.browser?.profiles ?? {};
		if (!(name in profiles)) throw new Error(`profile "${name}" not found`);
		if (name === (cfg.browser?.defaultProfile ?? DEFAULT_BROWSER_DEFAULT_PROFILE_NAME)) throw new Error(`cannot delete the default profile "${name}"; change browser.defaultProfile first`);
		let deleted = false;
		const state = ctx.state();
		if (resolveProfile(state.resolved, name)?.cdpIsLoopback) {
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
//#region src/browser/routes/basic.ts
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
		const [cdpHttp, cdpReady] = await Promise.all([profileCtx.isHttpReachable(300), profileCtx.isReachable(600)]);
		const profileState = current.profiles.get(profileCtx.profile.name);
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
			running: cdpReady,
			cdpReady,
			cdpHttp,
			pid: profileState?.running?.pid ?? null,
			cdpPort: profileCtx.profile.cdpPort,
			cdpUrl: profileCtx.profile.cdpUrl,
			chosenBrowser: profileState?.running?.exe.kind ?? null,
			detectedBrowser,
			detectedExecutablePath,
			detectError,
			userDataDir: profileState?.running?.userDataDir ?? null,
			color: profileCtx.profile.color,
			headless: current.resolved.headless,
			noSandbox: current.resolved.noSandbox,
			executablePath: current.resolved.executablePath ?? null,
			attachOnly: current.resolved.attachOnly
		});
	});
	app.post("/start", async (req, res) => {
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		try {
			await profileCtx.ensureBrowserAvailable();
			res.json({
				ok: true,
				profile: profileCtx.profile.name
			});
		} catch (err) {
			jsonError(res, 500, String(err));
		}
	});
	app.post("/stop", async (req, res) => {
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		try {
			const result = await profileCtx.stopRunningBrowser();
			res.json({
				ok: true,
				stopped: result.stopped,
				profile: profileCtx.profile.name
			});
		} catch (err) {
			jsonError(res, 500, String(err));
		}
	});
	app.post("/reset-profile", async (req, res) => {
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		try {
			const result = await profileCtx.resetProfile();
			res.json({
				ok: true,
				profile: profileCtx.profile.name,
				...result
			});
		} catch (err) {
			jsonError(res, 500, String(err));
		}
	});
	app.post("/profiles/create", async (req, res) => {
		const name = toStringOrEmpty(req.body?.name);
		const color = toStringOrEmpty(req.body?.color);
		const cdpUrl = toStringOrEmpty(req.body?.cdpUrl);
		const driver = toStringOrEmpty(req.body?.driver);
		if (!name) return jsonError(res, 400, "name is required");
		try {
			const result = await createBrowserProfilesService(ctx).createProfile({
				name,
				color: color || void 0,
				cdpUrl: cdpUrl || void 0,
				driver: driver === "extension" ? "extension" : void 0
			});
			res.json(result);
		} catch (err) {
			const msg = String(err);
			if (msg.includes("already exists")) return jsonError(res, 409, msg);
			if (msg.includes("invalid profile name")) return jsonError(res, 400, msg);
			if (msg.includes("no available CDP ports")) return jsonError(res, 507, msg);
			if (msg.includes("cdpUrl")) return jsonError(res, 400, msg);
			jsonError(res, 500, msg);
		}
	});
	app.delete("/profiles/:name", async (req, res) => {
		const name = toStringOrEmpty(req.params.name);
		if (!name) return jsonError(res, 400, "profile name is required");
		try {
			const result = await createBrowserProfilesService(ctx).deleteProfile(name);
			res.json(result);
		} catch (err) {
			const msg = String(err);
			if (msg.includes("invalid profile name")) return jsonError(res, 400, msg);
			if (msg.includes("default profile")) return jsonError(res, 400, msg);
			if (msg.includes("not found")) return jsonError(res, 404, msg);
			jsonError(res, 500, msg);
		}
	});
}

//#endregion
//#region src/browser/routes/tabs.ts
function registerBrowserTabRoutes(app, ctx) {
	app.get("/tabs", async (req, res) => {
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		try {
			if (!await profileCtx.isReachable(300)) return res.json({
				running: false,
				tabs: []
			});
			const tabs = await profileCtx.listTabs();
			res.json({
				running: true,
				tabs
			});
		} catch (err) {
			jsonError(res, 500, String(err));
		}
	});
	app.post("/tabs/open", async (req, res) => {
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		const url = toStringOrEmpty(req.body?.url);
		if (!url) return jsonError(res, 400, "url is required");
		try {
			await profileCtx.ensureBrowserAvailable();
			const tab = await profileCtx.openTab(url);
			res.json(tab);
		} catch (err) {
			jsonError(res, 500, String(err));
		}
	});
	app.post("/tabs/focus", async (req, res) => {
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		const targetId = toStringOrEmpty(req.body?.targetId);
		if (!targetId) return jsonError(res, 400, "targetId is required");
		try {
			if (!await profileCtx.isReachable(300)) return jsonError(res, 409, "browser not running");
			await profileCtx.focusTab(targetId);
			res.json({ ok: true });
		} catch (err) {
			const mapped = ctx.mapTabError(err);
			if (mapped) return jsonError(res, mapped.status, mapped.message);
			jsonError(res, 500, String(err));
		}
	});
	app.delete("/tabs/:targetId", async (req, res) => {
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		const targetId = toStringOrEmpty(req.params.targetId);
		if (!targetId) return jsonError(res, 400, "targetId is required");
		try {
			if (!await profileCtx.isReachable(300)) return jsonError(res, 409, "browser not running");
			await profileCtx.closeTab(targetId);
			res.json({ ok: true });
		} catch (err) {
			const mapped = ctx.mapTabError(err);
			if (mapped) return jsonError(res, mapped.status, mapped.message);
			jsonError(res, 500, String(err));
		}
	});
	app.post("/tabs/action", async (req, res) => {
		const profileCtx = getProfileContext(req, ctx);
		if ("error" in profileCtx) return jsonError(res, profileCtx.status, profileCtx.error);
		const action = toStringOrEmpty(req.body?.action);
		const index = toNumber(req.body?.index);
		try {
			if (action === "list") {
				if (!await profileCtx.isReachable(300)) return res.json({
					ok: true,
					tabs: []
				});
				const tabs = await profileCtx.listTabs();
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
				const tabs = await profileCtx.listTabs();
				const target = typeof index === "number" ? tabs[index] : tabs.at(0);
				if (!target) return jsonError(res, 404, "tab not found");
				await profileCtx.closeTab(target.targetId);
				return res.json({
					ok: true,
					targetId: target.targetId
				});
			}
			if (action === "select") {
				if (typeof index !== "number") return jsonError(res, 400, "index is required");
				const target = (await profileCtx.listTabs())[index];
				if (!target) return jsonError(res, 404, "tab not found");
				await profileCtx.focusTab(target.targetId);
				return res.json({
					ok: true,
					targetId: target.targetId
				});
			}
			return jsonError(res, 400, "unknown tab action");
		} catch (err) {
			const mapped = ctx.mapTabError(err);
			if (mapped) return jsonError(res, mapped.status, mapped.message);
			jsonError(res, 500, String(err));
		}
	});
}

//#endregion
//#region src/browser/routes/index.ts
function registerBrowserRoutes(app, ctx) {
	registerBrowserBasicRoutes(app, ctx);
	registerBrowserTabRoutes(app, ctx);
	registerBrowserAgentRoutes(app, ctx);
}

//#endregion
export { registerBrowserRoutes as t };