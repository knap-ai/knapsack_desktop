import { d as readStringValue, i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { _ as shortenHomePath } from "./utils-D5DtWkEu.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { t as formatDocsLink } from "./links-Dp5-Wbn2.js";
import { r as theme } from "./theme-D5sxSdHD.js";
import { n as inheritOptionFromParent } from "./command-options-0jYAGXoL.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { n as info, t as danger } from "./globals-De6QTwLG.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { nn as ErrorCodes, rn as errorShape } from "./protocol-C6T5DFc8.js";
import { t as parseBooleanValue } from "./boolean-C7EklDWC.js";
import { c as jsonResult, h as readStringParam, s as imageResultFromFile } from "./common-BWtun2If.js";
import { t as callGatewayTool } from "./gateway-B1XKgomf.js";
import { i as stringEnum, r as optionalStringEnum } from "./typebox-UTirCdtG.js";
import { a as selectDefaultNodeFromList, i as resolveNodeIdFromList, t as listNodes } from "./nodes-utils-DNtNBPA8.js";
import { i as wrapExternalContent } from "./external-content-Ds7ZVhiZ.js";
import { t as withTimeout } from "./with-timeout-DRw-t5uf.js";
import "./text-runtime-DTMxvodz.js";
import { t as startLazyPluginServiceModule } from "./lazy-service-module-C01vq5Ob.js";
import "./browser-config-runtime-Db5LKdcQ.js";
import { n as callGatewayFromCli, t as addGatewayClientOptions } from "./gateway-rpc-CgMJTGBP.js";
import { n as runCommandWithRuntime } from "./cli-utils-PbJDKJWK.js";
import { i as resolveNodeCommandAllowlist, n as isNodeCommandAllowed } from "./node-command-policy-inCkRZGC.js";
import { a as respondUnavailableOnNodeInvokeError, s as safeParseJson } from "./startup-auth-DJG2oyd0.js";
import "./browser-node-runtime-Cr9m9xwX.js";
import "./browser-security-runtime-DCYxvSMK.js";
import { t as formatHelpExamples } from "./help-format-DfEzE9Kd.js";
import "./browser-setup-tools-B1frXn0-.js";
import "./channel-actions-CkAP8jIY.js";
import { b as normalizeBrowserFormField, x as normalizeBrowserFormFieldValue } from "./chrome-DKrTqDG1.js";
import { d as resolveExistingPathsWithinRoot, n as DEFAULT_AI_SNAPSHOT_MAX_CHARS, u as DEFAULT_UPLOAD_DIR } from "./utils-DSPbCLVw.js";
import { d as redactCdpUrl } from "./cdp.helpers-CJUeV0SO.js";
import { i as getBrowserProfileCapabilities } from "./server-context-qgfDaRbE.js";
import { n as resolveProfile, t as resolveBrowserConfig } from "./config-DldYxDHs.js";
import { c as browserPdfSave, d as browserArmFileChooser, f as browserNavigate, i as isPersistentBrowserProfileMutation, l as browserAct, n as persistBrowserProxyFiles, o as resolveRequestedBrowserProfile, p as browserScreenshotAction, s as browserConsoleMessages, t as applyBrowserProxyPaths, u as browserArmDialog } from "./browser-runtime-BNxd-J_h.js";
import { c as browserOpenTab, d as browserSnapshot, f as browserStart, g as browserTabs, i as browserCloseTab, l as browserProfiles, m as browserStop, n as trackSessionBrowserTab, p as browserStatus, r as untrackSessionBrowserTab, s as browserFocusTab } from "./session-tab-registry-C-F_cimS.js";
import { a as createBrowserRouteDispatcher, r as startBrowserControlServiceFromConfig, t as createBrowserControlContext } from "./control-service-C6DCgn50.js";
import crypto from "node:crypto";
import { Type } from "@sinclair/typebox";
//#region extensions/browser/src/browser-tool.actions.ts
const browserToolActionDeps = {
	browserAct,
	browserConsoleMessages,
	browserSnapshot,
	browserTabs,
	imageResultFromFile,
	loadConfig
};
function wrapBrowserExternalJson(params) {
	return {
		wrappedText: wrapExternalContent(JSON.stringify(params.payload, null, 2), {
			source: "browser",
			includeWarning: params.includeWarning ?? true
		}),
		safeDetails: {
			ok: true,
			externalContent: {
				untrusted: true,
				source: "browser",
				kind: params.kind,
				wrapped: true
			}
		}
	};
}
function formatTabsToolResult(tabs) {
	const wrapped = wrapBrowserExternalJson({
		kind: "tabs",
		payload: { tabs },
		includeWarning: false
	});
	return {
		content: [{
			type: "text",
			text: wrapped.wrappedText
		}],
		details: {
			...wrapped.safeDetails,
			tabCount: tabs.length
		}
	};
}
function formatConsoleToolResult(result) {
	const wrapped = wrapBrowserExternalJson({
		kind: "console",
		payload: result,
		includeWarning: false
	});
	return {
		content: [{
			type: "text",
			text: wrapped.wrappedText
		}],
		details: {
			...wrapped.safeDetails,
			targetId: readStringValue(result.targetId),
			messageCount: Array.isArray(result.messages) ? result.messages.length : void 0
		}
	};
}
function isChromeStaleTargetError(profile, err) {
	if (!profile) return false;
	if (profile === "user") {
		const msg = String(err);
		return msg.includes("404:") && msg.includes("tab not found");
	}
	const cfg = browserToolActionDeps.loadConfig();
	const browserProfile = resolveProfile(resolveBrowserConfig(cfg.browser, cfg), profile);
	if (!browserProfile || !getBrowserProfileCapabilities(browserProfile).usesChromeMcp) return false;
	const msg = String(err);
	return msg.includes("404:") && msg.includes("tab not found");
}
function stripTargetIdFromActRequest(request) {
	if (!normalizeOptionalString(request.targetId)) return null;
	const retryRequest = { ...request };
	delete retryRequest.targetId;
	return retryRequest;
}
function canRetryChromeActWithoutTargetId(request) {
	const typedRequest = request;
	const kind = typeof typedRequest.kind === "string" ? typedRequest.kind : typeof typedRequest.action === "string" ? typedRequest.action : "";
	return kind === "hover" || kind === "scrollIntoView" || kind === "wait";
}
async function executeTabsAction(params) {
	const { baseUrl, profile, proxyRequest } = params;
	if (proxyRequest) return formatTabsToolResult((await proxyRequest({
		method: "GET",
		path: "/tabs",
		profile
	})).tabs ?? []);
	return formatTabsToolResult(await browserToolActionDeps.browserTabs(baseUrl, { profile }));
}
async function executeSnapshotAction(params) {
	const { input, baseUrl, profile, proxyRequest } = params;
	const snapshotDefaults = browserToolActionDeps.loadConfig().browser?.snapshotDefaults;
	const format = input.snapshotFormat === "ai" || input.snapshotFormat === "aria" ? input.snapshotFormat : void 0;
	const mode = input.mode === "efficient" ? "efficient" : format !== "aria" && snapshotDefaults?.mode === "efficient" ? "efficient" : void 0;
	const labels = typeof input.labels === "boolean" ? input.labels : void 0;
	const refs = input.refs === "aria" || input.refs === "role" ? input.refs : void 0;
	const hasMaxChars = Object.hasOwn(input, "maxChars");
	const targetId = normalizeOptionalString(input.targetId);
	const limit = typeof input.limit === "number" && Number.isFinite(input.limit) ? input.limit : void 0;
	const maxChars = typeof input.maxChars === "number" && Number.isFinite(input.maxChars) && input.maxChars > 0 ? Math.floor(input.maxChars) : void 0;
	const interactive = typeof input.interactive === "boolean" ? input.interactive : void 0;
	const compact = typeof input.compact === "boolean" ? input.compact : void 0;
	const depth = typeof input.depth === "number" && Number.isFinite(input.depth) ? input.depth : void 0;
	const selector = normalizeOptionalString(input.selector);
	const frame = normalizeOptionalString(input.frame);
	const resolvedMaxChars = format === "ai" ? hasMaxChars ? maxChars : mode === "efficient" ? void 0 : DEFAULT_AI_SNAPSHOT_MAX_CHARS : hasMaxChars ? maxChars : void 0;
	const snapshotQuery = {
		...format ? { format } : {},
		targetId,
		limit,
		...typeof resolvedMaxChars === "number" ? { maxChars: resolvedMaxChars } : {},
		refs,
		interactive,
		compact,
		depth,
		selector,
		frame,
		labels,
		mode
	};
	const snapshot = proxyRequest ? await proxyRequest({
		method: "GET",
		path: "/snapshot",
		profile,
		query: snapshotQuery
	}) : await browserToolActionDeps.browserSnapshot(baseUrl, {
		...snapshotQuery,
		profile
	});
	if (snapshot.format === "ai") {
		const wrappedSnapshot = wrapExternalContent(snapshot.snapshot ?? "", {
			source: "browser",
			includeWarning: true
		});
		const safeDetails = {
			ok: true,
			format: snapshot.format,
			targetId: snapshot.targetId,
			url: snapshot.url,
			truncated: snapshot.truncated,
			stats: snapshot.stats,
			refs: snapshot.refs ? Object.keys(snapshot.refs).length : void 0,
			labels: snapshot.labels,
			labelsCount: snapshot.labelsCount,
			labelsSkipped: snapshot.labelsSkipped,
			imagePath: snapshot.imagePath,
			imageType: snapshot.imageType,
			externalContent: {
				untrusted: true,
				source: "browser",
				kind: "snapshot",
				format: "ai",
				wrapped: true
			}
		};
		if (labels && snapshot.imagePath) return await browserToolActionDeps.imageResultFromFile({
			label: "browser:snapshot",
			path: snapshot.imagePath,
			extraText: wrappedSnapshot,
			details: safeDetails
		});
		return {
			content: [{
				type: "text",
				text: wrappedSnapshot
			}],
			details: safeDetails
		};
	}
	{
		const wrapped = wrapBrowserExternalJson({
			kind: "snapshot",
			payload: snapshot
		});
		return {
			content: [{
				type: "text",
				text: wrapped.wrappedText
			}],
			details: {
				...wrapped.safeDetails,
				format: "aria",
				targetId: snapshot.targetId,
				url: snapshot.url,
				nodeCount: snapshot.nodes.length,
				externalContent: {
					untrusted: true,
					source: "browser",
					kind: "snapshot",
					format: "aria",
					wrapped: true
				}
			}
		};
	}
}
async function executeConsoleAction(params) {
	const { input, baseUrl, profile, proxyRequest } = params;
	const level = normalizeOptionalString(input.level);
	const targetId = normalizeOptionalString(input.targetId);
	if (proxyRequest) return formatConsoleToolResult(await proxyRequest({
		method: "GET",
		path: "/console",
		profile,
		query: {
			level,
			targetId
		}
	}));
	return formatConsoleToolResult(await browserToolActionDeps.browserConsoleMessages(baseUrl, {
		level,
		targetId,
		profile
	}));
}
async function executeActAction(params) {
	const { request, baseUrl, profile, proxyRequest } = params;
	try {
		return jsonResult(proxyRequest ? await proxyRequest({
			method: "POST",
			path: "/act",
			profile,
			body: request
		}) : await browserToolActionDeps.browserAct(baseUrl, request, { profile }));
	} catch (err) {
		if (isChromeStaleTargetError(profile, err)) {
			const retryRequest = stripTargetIdFromActRequest(request);
			const tabs = proxyRequest ? (await proxyRequest({
				method: "GET",
				path: "/tabs",
				profile
			})).tabs ?? [] : await browserToolActionDeps.browserTabs(baseUrl, { profile }).catch(() => []);
			if (retryRequest && canRetryChromeActWithoutTargetId(request) && tabs.length === 1) try {
				return jsonResult(proxyRequest ? await proxyRequest({
					method: "POST",
					path: "/act",
					profile,
					body: retryRequest
				}) : await browserToolActionDeps.browserAct(baseUrl, retryRequest, { profile }));
			} catch {}
			if (!tabs.length) throw new Error(`No browser tabs found for profile="${profile}". Make sure the configured Chromium-based browser (v144+) is running and has open tabs, then retry.`, { cause: err });
			throw new Error(`Chrome tab not found (stale targetId?). Run action=tabs profile="${profile}" and use one of the returned targetIds.`, { cause: err });
		}
		throw err;
	}
}
//#endregion
//#region extensions/browser/src/browser-tool.schema.ts
const BROWSER_ACT_KINDS = [
	"click",
	"type",
	"press",
	"hover",
	"drag",
	"select",
	"fill",
	"resize",
	"wait",
	"evaluate",
	"close"
];
const BROWSER_TOOL_ACTIONS = [
	"status",
	"start",
	"stop",
	"profiles",
	"tabs",
	"open",
	"focus",
	"close",
	"snapshot",
	"screenshot",
	"navigate",
	"console",
	"pdf",
	"upload",
	"dialog",
	"act"
];
const BROWSER_TARGETS = [
	"sandbox",
	"host",
	"node"
];
const BROWSER_SNAPSHOT_FORMATS = ["aria", "ai"];
const BROWSER_SNAPSHOT_MODES = ["efficient"];
const BROWSER_SNAPSHOT_REFS = ["role", "aria"];
const BROWSER_IMAGE_TYPES = ["png", "jpeg"];
const BrowserActSchema = Type.Object({
	kind: stringEnum(BROWSER_ACT_KINDS),
	targetId: Type.Optional(Type.String()),
	ref: Type.Optional(Type.String()),
	doubleClick: Type.Optional(Type.Boolean()),
	button: Type.Optional(Type.String()),
	modifiers: Type.Optional(Type.Array(Type.String())),
	text: Type.Optional(Type.String()),
	submit: Type.Optional(Type.Boolean()),
	slowly: Type.Optional(Type.Boolean()),
	key: Type.Optional(Type.String()),
	delayMs: Type.Optional(Type.Number()),
	startRef: Type.Optional(Type.String()),
	endRef: Type.Optional(Type.String()),
	values: Type.Optional(Type.Array(Type.String())),
	fields: Type.Optional(Type.Array(Type.Object({}, { additionalProperties: true }))),
	width: Type.Optional(Type.Number()),
	height: Type.Optional(Type.Number()),
	timeMs: Type.Optional(Type.Number()),
	selector: Type.Optional(Type.String()),
	url: Type.Optional(Type.String()),
	loadState: Type.Optional(Type.String()),
	textGone: Type.Optional(Type.String()),
	timeoutMs: Type.Optional(Type.Number()),
	fn: Type.Optional(Type.String())
});
const BrowserToolSchema = Type.Object({
	action: stringEnum(BROWSER_TOOL_ACTIONS),
	target: optionalStringEnum(BROWSER_TARGETS),
	node: Type.Optional(Type.String()),
	profile: Type.Optional(Type.String()),
	targetUrl: Type.Optional(Type.String()),
	url: Type.Optional(Type.String()),
	targetId: Type.Optional(Type.String()),
	limit: Type.Optional(Type.Number()),
	maxChars: Type.Optional(Type.Number()),
	mode: optionalStringEnum(BROWSER_SNAPSHOT_MODES),
	snapshotFormat: optionalStringEnum(BROWSER_SNAPSHOT_FORMATS),
	refs: optionalStringEnum(BROWSER_SNAPSHOT_REFS),
	interactive: Type.Optional(Type.Boolean()),
	compact: Type.Optional(Type.Boolean()),
	depth: Type.Optional(Type.Number()),
	selector: Type.Optional(Type.String()),
	frame: Type.Optional(Type.String()),
	labels: Type.Optional(Type.Boolean()),
	fullPage: Type.Optional(Type.Boolean()),
	ref: Type.Optional(Type.String()),
	element: Type.Optional(Type.String()),
	type: optionalStringEnum(BROWSER_IMAGE_TYPES),
	level: Type.Optional(Type.String()),
	paths: Type.Optional(Type.Array(Type.String())),
	inputRef: Type.Optional(Type.String()),
	timeoutMs: Type.Optional(Type.Number()),
	accept: Type.Optional(Type.Boolean()),
	promptText: Type.Optional(Type.String()),
	kind: Type.Optional(stringEnum(BROWSER_ACT_KINDS)),
	doubleClick: Type.Optional(Type.Boolean()),
	button: Type.Optional(Type.String()),
	modifiers: Type.Optional(Type.Array(Type.String())),
	text: Type.Optional(Type.String()),
	submit: Type.Optional(Type.Boolean()),
	slowly: Type.Optional(Type.Boolean()),
	key: Type.Optional(Type.String()),
	delayMs: Type.Optional(Type.Number()),
	startRef: Type.Optional(Type.String()),
	endRef: Type.Optional(Type.String()),
	values: Type.Optional(Type.Array(Type.String())),
	fields: Type.Optional(Type.Array(Type.Object({}, { additionalProperties: true }))),
	width: Type.Optional(Type.Number()),
	height: Type.Optional(Type.Number()),
	timeMs: Type.Optional(Type.Number()),
	textGone: Type.Optional(Type.String()),
	loadState: Type.Optional(Type.String()),
	fn: Type.Optional(Type.String()),
	request: Type.Optional(BrowserActSchema)
});
//#endregion
//#region extensions/browser/src/browser-tool.ts
const browserToolDeps = {
	browserAct,
	browserArmDialog,
	browserArmFileChooser,
	browserCloseTab,
	browserFocusTab,
	browserNavigate,
	browserOpenTab,
	browserPdfSave,
	browserProfiles,
	browserScreenshotAction,
	browserStart,
	browserStatus,
	browserStop,
	imageResultFromFile,
	loadConfig,
	listNodes,
	callGatewayTool,
	trackSessionBrowserTab,
	untrackSessionBrowserTab
};
function readOptionalTargetAndTimeout(params) {
	return {
		targetId: normalizeOptionalString(params.targetId),
		timeoutMs: typeof params.timeoutMs === "number" && Number.isFinite(params.timeoutMs) ? params.timeoutMs : void 0
	};
}
function readTargetUrlParam(params) {
	return readStringParam(params, "targetUrl") ?? readStringParam(params, "url", {
		required: true,
		label: "targetUrl"
	});
}
const LEGACY_BROWSER_ACT_REQUEST_KEYS = [
	"targetId",
	"ref",
	"doubleClick",
	"button",
	"modifiers",
	"text",
	"submit",
	"slowly",
	"key",
	"delayMs",
	"startRef",
	"endRef",
	"values",
	"fields",
	"width",
	"height",
	"timeMs",
	"textGone",
	"selector",
	"url",
	"loadState",
	"fn",
	"timeoutMs"
];
function readActRequestParam(params) {
	const requestParam = params.request;
	if (requestParam && typeof requestParam === "object") return requestParam;
	const kind = readStringParam(params, "kind");
	if (!kind) return;
	const request = { kind };
	for (const key of LEGACY_BROWSER_ACT_REQUEST_KEYS) {
		if (!Object.hasOwn(params, key)) continue;
		request[key] = params[key];
	}
	return request;
}
const DEFAULT_BROWSER_PROXY_TIMEOUT_MS = 2e4;
const BROWSER_PROXY_GATEWAY_TIMEOUT_SLACK_MS = 5e3;
function isBrowserNode$1(node) {
	const caps = Array.isArray(node.caps) ? node.caps : [];
	const commands = Array.isArray(node.commands) ? node.commands : [];
	return caps.includes("browser") || commands.includes("browser.proxy");
}
async function resolveBrowserNodeTarget$1(params) {
	const policy = browserToolDeps.loadConfig().gateway?.nodes?.browser;
	const mode = policy?.mode ?? "auto";
	if (mode === "off") {
		if (params.target === "node" || params.requestedNode) throw new Error("Node browser proxy is disabled (gateway.nodes.browser.mode=off).");
		return null;
	}
	if (params.sandboxBridgeUrl?.trim() && params.target !== "node" && !params.requestedNode) return null;
	if (params.target && params.target !== "node") return null;
	if (mode === "manual" && params.target !== "node" && !params.requestedNode) return null;
	const browserNodes = (await browserToolDeps.listNodes({})).filter((node) => node.connected && isBrowserNode$1(node));
	if (browserNodes.length === 0) {
		if (params.target === "node" || params.requestedNode) throw new Error("No connected browser-capable nodes.");
		return null;
	}
	const requested = params.requestedNode?.trim() || policy?.node?.trim();
	if (requested) {
		const nodeId = resolveNodeIdFromList(browserNodes, requested, false);
		const node = browserNodes.find((entry) => entry.nodeId === nodeId);
		return {
			nodeId,
			label: node?.displayName ?? node?.remoteIp ?? nodeId
		};
	}
	const selected = selectDefaultNodeFromList(browserNodes, {
		preferLocalMac: false,
		fallback: "none"
	});
	if (params.target === "node") {
		if (selected) return {
			nodeId: selected.nodeId,
			label: selected.displayName ?? selected.remoteIp ?? selected.nodeId
		};
		throw new Error(`Multiple browser-capable nodes connected (${browserNodes.length}). Set gateway.nodes.browser.node or pass node=<id>.`);
	}
	if (mode === "manual") return null;
	if (selected) return {
		nodeId: selected.nodeId,
		label: selected.displayName ?? selected.remoteIp ?? selected.nodeId
	};
	return null;
}
async function callBrowserProxy(params) {
	const proxyTimeoutMs = typeof params.timeoutMs === "number" && Number.isFinite(params.timeoutMs) ? Math.max(1, Math.floor(params.timeoutMs)) : DEFAULT_BROWSER_PROXY_TIMEOUT_MS;
	const gatewayTimeoutMs = proxyTimeoutMs + BROWSER_PROXY_GATEWAY_TIMEOUT_SLACK_MS;
	const payload = await browserToolDeps.callGatewayTool("node.invoke", { timeoutMs: gatewayTimeoutMs }, {
		nodeId: params.nodeId,
		command: "browser.proxy",
		params: {
			method: params.method,
			path: params.path,
			query: params.query,
			body: params.body,
			timeoutMs: proxyTimeoutMs,
			profile: params.profile
		},
		idempotencyKey: crypto.randomUUID()
	});
	const parsed = payload?.payload ?? (typeof payload?.payloadJSON === "string" && payload.payloadJSON ? JSON.parse(payload.payloadJSON) : null);
	if (!parsed || typeof parsed !== "object" || !("result" in parsed)) throw new Error("browser proxy failed");
	return parsed;
}
async function persistProxyFiles$1(files) {
	return await persistBrowserProxyFiles(files);
}
function applyProxyPaths$1(result, mapping) {
	applyBrowserProxyPaths(result, mapping);
}
function resolveBrowserBaseUrl(params) {
	const cfg = loadConfig();
	const resolved = resolveBrowserConfig(cfg.browser, cfg);
	const normalizedSandbox = params.sandboxBridgeUrl?.trim() ?? "";
	if ((params.target ?? (normalizedSandbox ? "sandbox" : "host")) === "sandbox") {
		if (!normalizedSandbox) throw new Error("Sandbox browser is unavailable. Enable agents.defaults.sandbox.browser.enabled or use target=\"host\" if allowed.");
		return normalizedSandbox.replace(/\/$/, "");
	}
	if (params.allowHostControl === false) throw new Error("Host browser control is disabled by sandbox policy.");
	if (!resolved.enabled) throw new Error("Browser control is disabled. Set browser.enabled=true in ~/.openclaw/openclaw.json.");
}
function shouldPreferHostForProfile(profileName) {
	if (!profileName) return false;
	const cfg = browserToolDeps.loadConfig();
	const profile = resolveProfile(resolveBrowserConfig(cfg.browser, cfg), profileName);
	if (!profile) return false;
	return getBrowserProfileCapabilities(profile).usesChromeMcp;
}
function createBrowserTool(opts) {
	const targetDefault = opts?.sandboxBridgeUrl ? "sandbox" : "host";
	const hostHint = opts?.allowHostControl === false ? "Host target blocked by policy." : "Host target allowed.";
	return {
		label: "Browser",
		name: "browser",
		description: [
			"Control the browser via OpenClaw's browser control server (status/start/stop/profiles/tabs/open/snapshot/screenshot/actions).",
			"Browser choice: omit profile by default for the isolated OpenClaw-managed browser (`openclaw`).",
			"For the logged-in user browser on the local host, use profile=\"user\". A supported Chromium-based browser (v144+) must be running. Use only when existing logins/cookies matter and the user is present.",
			"When a node-hosted browser proxy is available, the tool may auto-route to it. Pin a node with node=<id|name> or target=\"node\".",
			"When using refs from snapshot (e.g. e12), keep the same tab: prefer passing targetId from the snapshot response into subsequent actions (act/click/type/etc).",
			"For stable, self-resolving refs across calls, use snapshot with refs=\"aria\" (Playwright aria-ref ids). Default refs=\"role\" are role+name-based.",
			"Use snapshot+act for UI automation. Avoid act:wait by default; use only in exceptional cases when no reliable UI state exists.",
			`target selects browser location (sandbox|host|node). Default: ${targetDefault}.`,
			hostHint
		].join(" "),
		parameters: BrowserToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const action = readStringParam(params, "action", { required: true });
			const profile = readStringParam(params, "profile");
			const requestedNode = readStringParam(params, "node");
			let target = readStringParam(params, "target");
			if (requestedNode && target && target !== "node") throw new Error("node is only supported with target=\"node\".");
			if (shouldPreferHostForProfile(profile)) {
				if (requestedNode || target === "node") throw new Error(`profile="${profile}" only supports the local host browser.`);
				if (target === "sandbox") throw new Error(`profile="${profile}" cannot use the sandbox browser; use target="host" or omit target.`);
				if (!target && !requestedNode) target = "host";
			}
			const nodeTarget = await resolveBrowserNodeTarget$1({
				requestedNode: requestedNode ?? void 0,
				target,
				sandboxBridgeUrl: opts?.sandboxBridgeUrl
			});
			const baseUrl = nodeTarget ? void 0 : resolveBrowserBaseUrl({
				target: target === "node" ? void 0 : target,
				sandboxBridgeUrl: opts?.sandboxBridgeUrl,
				allowHostControl: opts?.allowHostControl
			});
			const proxyRequest = nodeTarget ? async (opts) => {
				const proxy = await callBrowserProxy({
					nodeId: nodeTarget.nodeId,
					method: opts.method,
					path: opts.path,
					query: opts.query,
					body: opts.body,
					timeoutMs: opts.timeoutMs,
					profile: opts.profile
				});
				const mapping = await persistProxyFiles$1(proxy.files);
				applyProxyPaths$1(proxy.result, mapping);
				return proxy.result;
			} : null;
			switch (action) {
				case "status":
					if (proxyRequest) return jsonResult(await proxyRequest({
						method: "GET",
						path: "/",
						profile
					}));
					return jsonResult(await browserToolDeps.browserStatus(baseUrl, { profile }));
				case "start":
					if (proxyRequest) {
						await proxyRequest({
							method: "POST",
							path: "/start",
							profile
						});
						return jsonResult(await proxyRequest({
							method: "GET",
							path: "/",
							profile
						}));
					}
					await browserToolDeps.browserStart(baseUrl, { profile });
					return jsonResult(await browserToolDeps.browserStatus(baseUrl, { profile }));
				case "stop":
					if (proxyRequest) {
						await proxyRequest({
							method: "POST",
							path: "/stop",
							profile
						});
						return jsonResult(await proxyRequest({
							method: "GET",
							path: "/",
							profile
						}));
					}
					await browserToolDeps.browserStop(baseUrl, { profile });
					return jsonResult(await browserToolDeps.browserStatus(baseUrl, { profile }));
				case "profiles":
					if (proxyRequest) return jsonResult(await proxyRequest({
						method: "GET",
						path: "/profiles"
					}));
					return jsonResult({ profiles: await browserToolDeps.browserProfiles(baseUrl) });
				case "tabs": return await executeTabsAction({
					baseUrl,
					profile,
					proxyRequest
				});
				case "open": {
					const targetUrl = readTargetUrlParam(params);
					if (proxyRequest) return jsonResult(await proxyRequest({
						method: "POST",
						path: "/tabs/open",
						profile,
						body: { url: targetUrl }
					}));
					const opened = await browserToolDeps.browserOpenTab(baseUrl, targetUrl, { profile });
					browserToolDeps.trackSessionBrowserTab({
						sessionKey: opts?.agentSessionKey,
						targetId: opened.targetId,
						baseUrl,
						profile
					});
					return jsonResult(opened);
				}
				case "focus": {
					const targetId = readStringParam(params, "targetId", { required: true });
					if (proxyRequest) return jsonResult(await proxyRequest({
						method: "POST",
						path: "/tabs/focus",
						profile,
						body: { targetId }
					}));
					await browserToolDeps.browserFocusTab(baseUrl, targetId, { profile });
					return jsonResult({ ok: true });
				}
				case "close": {
					const targetId = readStringParam(params, "targetId");
					if (proxyRequest) return jsonResult(targetId ? await proxyRequest({
						method: "DELETE",
						path: `/tabs/${encodeURIComponent(targetId)}`,
						profile
					}) : await proxyRequest({
						method: "POST",
						path: "/act",
						profile,
						body: { kind: "close" }
					}));
					if (targetId) {
						await browserToolDeps.browserCloseTab(baseUrl, targetId, { profile });
						browserToolDeps.untrackSessionBrowserTab({
							sessionKey: opts?.agentSessionKey,
							targetId,
							baseUrl,
							profile
						});
					} else await browserToolDeps.browserAct(baseUrl, { kind: "close" }, { profile });
					return jsonResult({ ok: true });
				}
				case "snapshot": return await executeSnapshotAction({
					input: params,
					baseUrl,
					profile,
					proxyRequest
				});
				case "screenshot": {
					const targetId = readStringParam(params, "targetId");
					const fullPage = Boolean(params.fullPage);
					const ref = readStringParam(params, "ref");
					const element = readStringParam(params, "element");
					const type = params.type === "jpeg" ? "jpeg" : "png";
					const result = proxyRequest ? await proxyRequest({
						method: "POST",
						path: "/screenshot",
						profile,
						body: {
							targetId,
							fullPage,
							ref,
							element,
							type
						}
					}) : await browserToolDeps.browserScreenshotAction(baseUrl, {
						targetId,
						fullPage,
						ref,
						element,
						type,
						profile
					});
					return await browserToolDeps.imageResultFromFile({
						label: "browser:screenshot",
						path: result.path,
						details: result
					});
				}
				case "navigate": {
					const targetUrl = readTargetUrlParam(params);
					const targetId = readStringParam(params, "targetId");
					if (proxyRequest) return jsonResult(await proxyRequest({
						method: "POST",
						path: "/navigate",
						profile,
						body: {
							url: targetUrl,
							targetId
						}
					}));
					return jsonResult(await browserToolDeps.browserNavigate(baseUrl, {
						url: targetUrl,
						targetId,
						profile
					}));
				}
				case "console": return await executeConsoleAction({
					input: params,
					baseUrl,
					profile,
					proxyRequest
				});
				case "pdf": {
					const targetId = normalizeOptionalString(params.targetId);
					const result = proxyRequest ? await proxyRequest({
						method: "POST",
						path: "/pdf",
						profile,
						body: { targetId }
					}) : await browserToolDeps.browserPdfSave(baseUrl, {
						targetId,
						profile
					});
					return {
						content: [{
							type: "text",
							text: `FILE:${result.path}`
						}],
						details: result
					};
				}
				case "upload": {
					const paths = Array.isArray(params.paths) ? params.paths.map((p) => String(p)) : [];
					if (paths.length === 0) throw new Error("paths required");
					const uploadPathsResult = await resolveExistingPathsWithinRoot({
						rootDir: DEFAULT_UPLOAD_DIR,
						requestedPaths: paths,
						scopeLabel: `uploads directory (${DEFAULT_UPLOAD_DIR})`
					});
					if (!uploadPathsResult.ok) throw new Error(uploadPathsResult.error);
					const normalizedPaths = uploadPathsResult.paths;
					const ref = readStringParam(params, "ref");
					const inputRef = readStringParam(params, "inputRef");
					const element = readStringParam(params, "element");
					const { targetId, timeoutMs } = readOptionalTargetAndTimeout(params);
					if (proxyRequest) return jsonResult(await proxyRequest({
						method: "POST",
						path: "/hooks/file-chooser",
						profile,
						body: {
							paths: normalizedPaths,
							ref,
							inputRef,
							element,
							targetId,
							timeoutMs
						}
					}));
					return jsonResult(await browserToolDeps.browserArmFileChooser(baseUrl, {
						paths: normalizedPaths,
						ref,
						inputRef,
						element,
						targetId,
						timeoutMs,
						profile
					}));
				}
				case "dialog": {
					const accept = Boolean(params.accept);
					const promptText = readStringValue(params.promptText);
					const { targetId, timeoutMs } = readOptionalTargetAndTimeout(params);
					if (proxyRequest) return jsonResult(await proxyRequest({
						method: "POST",
						path: "/hooks/dialog",
						profile,
						body: {
							accept,
							promptText,
							targetId,
							timeoutMs
						}
					}));
					return jsonResult(await browserToolDeps.browserArmDialog(baseUrl, {
						accept,
						promptText,
						targetId,
						timeoutMs,
						profile
					}));
				}
				case "act": {
					const request = readActRequestParam(params);
					if (!request) throw new Error("request required");
					return await executeActAction({
						request,
						baseUrl,
						profile,
						proxyRequest
					});
				}
				default: throw new Error(`Unknown action: ${action}`);
			}
		}
	};
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-shared.ts
function normalizeQuery(query) {
	if (!query) return;
	const out = {};
	for (const [key, value] of Object.entries(query)) {
		if (value === void 0) continue;
		out[key] = String(value);
	}
	return Object.keys(out).length ? out : void 0;
}
async function callBrowserRequest(opts, params, extra) {
	const resolvedTimeoutMs = typeof extra?.timeoutMs === "number" && Number.isFinite(extra.timeoutMs) ? Math.max(1, Math.floor(extra.timeoutMs)) : typeof opts.timeout === "string" ? Number.parseInt(opts.timeout, 10) : void 0;
	const resolvedTimeout = typeof resolvedTimeoutMs === "number" && Number.isFinite(resolvedTimeoutMs) ? resolvedTimeoutMs : void 0;
	const timeout = typeof resolvedTimeout === "number" ? String(resolvedTimeout) : opts.timeout;
	const payload = await callGatewayFromCli("browser.request", {
		...opts,
		timeout
	}, {
		method: params.method,
		path: params.path,
		query: normalizeQuery(params.query),
		body: params.body,
		timeoutMs: resolvedTimeout
	}, { progress: extra?.progress });
	if (payload === void 0) throw new Error("Unexpected browser.request response");
	return payload;
}
async function callBrowserResize(opts, params, extra) {
	return callBrowserRequest(opts, {
		method: "POST",
		path: "/act",
		query: params.profile ? { profile: params.profile } : void 0,
		body: {
			kind: "resize",
			width: params.width,
			height: params.height,
			targetId: normalizeOptionalString(params.targetId)
		}
	}, extra);
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-actions-input/shared.ts
function resolveBrowserActionContext(cmd, parentOpts) {
	const parent = parentOpts(cmd);
	return {
		parent,
		profile: parent?.browserProfile
	};
}
async function callBrowserAct(params) {
	return await callBrowserRequest(params.parent, {
		method: "POST",
		path: "/act",
		query: params.profile ? { profile: params.profile } : void 0,
		body: params.body
	}, { timeoutMs: params.timeoutMs ?? 2e4 });
}
function logBrowserActionResult(parent, result, successMessage) {
	if (parent?.json) {
		defaultRuntime.writeJson(result);
		return;
	}
	defaultRuntime.log(successMessage);
}
function requireRef(ref) {
	const refValue = typeof ref === "string" ? ref.trim() : "";
	if (!refValue) {
		defaultRuntime.error(danger("ref is required"));
		defaultRuntime.exit(1);
		return null;
	}
	return refValue;
}
async function readFile(path) {
	return await (await import("node:fs/promises")).readFile(path, "utf8");
}
async function readFields(opts) {
	const payload = opts.fieldsFile ? await readFile(opts.fieldsFile) : opts.fields ?? "";
	if (!payload.trim()) throw new Error("fields are required");
	const parsed = JSON.parse(payload);
	if (!Array.isArray(parsed)) throw new Error("fields must be an array");
	return parsed.map((entry, index) => {
		if (!entry || typeof entry !== "object") throw new Error(`fields[${index}] must be an object`);
		const rec = entry;
		const parsedField = normalizeBrowserFormField(rec);
		if (!parsedField) throw new Error(`fields[${index}] must include ref`);
		if (rec.value === void 0 || rec.value === null || normalizeBrowserFormFieldValue(rec.value) !== void 0) return parsedField;
		throw new Error(`fields[${index}].value must be string, number, boolean, or null`);
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-actions-input/register.element.ts
function registerBrowserElementCommands(browser, parentOpts) {
	const runElementAction = async (params) => {
		const { parent, profile } = resolveBrowserActionContext(params.cmd, parentOpts);
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: params.body,
				timeoutMs: params.timeoutMs
			});
			logBrowserActionResult(parent, result, typeof params.successMessage === "function" ? params.successMessage(result) : params.successMessage);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	};
	browser.command("click").description("Click an element by ref from snapshot").argument("<ref>", "Ref id from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").option("--double", "Double click", false).option("--button <left|right|middle>", "Mouse button to use").option("--modifiers <list>", "Comma-separated modifiers (Shift,Alt,Meta)").action(async (ref, opts, cmd) => {
		const refValue = requireRef(ref);
		if (!refValue) return;
		const modifiers = opts.modifiers ? String(opts.modifiers).split(",").map((v) => v.trim()).filter(Boolean) : void 0;
		await runElementAction({
			cmd,
			body: {
				kind: "click",
				ref: refValue,
				targetId: normalizeOptionalString(opts.targetId),
				doubleClick: Boolean(opts.double),
				button: normalizeOptionalString(opts.button),
				modifiers
			},
			successMessage: (result) => {
				const url = result.url;
				return `clicked ref ${refValue}${typeof url === "string" && url ? ` on ${url}` : ""}`;
			}
		});
	});
	browser.command("type").description("Type into an element by ref from snapshot").argument("<ref>", "Ref id from snapshot").argument("<text>", "Text to type").option("--submit", "Press Enter after typing", false).option("--slowly", "Type slowly (human-like)", false).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (ref, text, opts, cmd) => {
		const refValue = requireRef(ref);
		if (!refValue) return;
		await runElementAction({
			cmd,
			body: {
				kind: "type",
				ref: refValue,
				text,
				submit: Boolean(opts.submit),
				slowly: Boolean(opts.slowly),
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `typed into ref ${refValue}`
		});
	});
	browser.command("press").description("Press a key").argument("<key>", "Key to press (e.g. Enter)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (key, opts, cmd) => {
		await runElementAction({
			cmd,
			body: {
				kind: "press",
				key,
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `pressed ${key}`
		});
	});
	browser.command("hover").description("Hover an element by ai ref").argument("<ref>", "Ref id from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (ref, opts, cmd) => {
		await runElementAction({
			cmd,
			body: {
				kind: "hover",
				ref,
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `hovered ref ${ref}`
		});
	});
	browser.command("scrollintoview").description("Scroll an element into view by ref from snapshot").argument("<ref>", "Ref id from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for scroll (default: 20000)", (v) => Number(v)).action(async (ref, opts, cmd) => {
		const refValue = requireRef(ref);
		if (!refValue) return;
		const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0;
		await runElementAction({
			cmd,
			body: {
				kind: "scrollIntoView",
				ref: refValue,
				targetId: normalizeOptionalString(opts.targetId),
				timeoutMs
			},
			timeoutMs,
			successMessage: `scrolled into view: ${refValue}`
		});
	});
	browser.command("drag").description("Drag from one ref to another").argument("<startRef>", "Start ref id").argument("<endRef>", "End ref id").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (startRef, endRef, opts, cmd) => {
		await runElementAction({
			cmd,
			body: {
				kind: "drag",
				startRef,
				endRef,
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `dragged ${startRef} → ${endRef}`
		});
	});
	browser.command("select").description("Select option(s) in a select element").argument("<ref>", "Ref id from snapshot").argument("<values...>", "Option values to select").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (ref, values, opts, cmd) => {
		await runElementAction({
			cmd,
			body: {
				kind: "select",
				ref,
				values,
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `selected ${values.join(", ")}`
		});
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-actions-input/register.files-downloads.ts
async function normalizeUploadPaths(paths) {
	const result = await resolveExistingPathsWithinRoot({
		rootDir: DEFAULT_UPLOAD_DIR,
		requestedPaths: paths,
		scopeLabel: `uploads directory (${DEFAULT_UPLOAD_DIR})`
	});
	if (!result.ok) throw new Error(result.error);
	return result.paths;
}
async function runBrowserPostAction(params) {
	try {
		const result = await callBrowserRequest(params.parent, {
			method: "POST",
			path: params.path,
			query: params.profile ? { profile: params.profile } : void 0,
			body: params.body
		}, { timeoutMs: params.timeoutMs });
		if (params.parent?.json) {
			defaultRuntime.writeJson(result);
			return;
		}
		defaultRuntime.log(params.describeSuccess(result));
	} catch (err) {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	}
}
function registerBrowserFilesAndDownloadsCommands(browser, parentOpts) {
	const resolveTimeoutAndTarget = (opts) => {
		return {
			timeoutMs: Number.isFinite(opts.timeoutMs) ? Number(opts.timeoutMs) : void 0,
			targetId: normalizeOptionalString(opts.targetId)
		};
	};
	const runDownloadCommand = async (cmd, opts, request) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		const { timeoutMs, targetId } = resolveTimeoutAndTarget(opts);
		await runBrowserPostAction({
			parent,
			profile,
			path: request.path,
			body: {
				...request.body,
				targetId,
				timeoutMs
			},
			timeoutMs: timeoutMs ?? 2e4,
			describeSuccess: (result) => `downloaded: ${shortenHomePath(result.download.path)}`
		});
	};
	browser.command("upload").description("Arm file upload for the next file chooser").argument("<paths...>", "File paths to upload (must be within OpenClaw temp uploads dir, e.g. /tmp/openclaw/uploads/file.pdf)").option("--ref <ref>", "Ref id from snapshot to click after arming").option("--input-ref <ref>", "Ref id for <input type=file> to set directly").option("--element <selector>", "CSS selector for <input type=file>").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the next file chooser (default: 120000)", (v) => Number(v)).action(async (paths, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		const normalizedPaths = await normalizeUploadPaths(paths);
		const { timeoutMs, targetId } = resolveTimeoutAndTarget(opts);
		await runBrowserPostAction({
			parent,
			profile,
			path: "/hooks/file-chooser",
			body: {
				paths: normalizedPaths,
				ref: normalizeOptionalString(opts.ref),
				inputRef: normalizeOptionalString(opts.inputRef),
				element: normalizeOptionalString(opts.element),
				targetId,
				timeoutMs
			},
			timeoutMs: timeoutMs ?? 2e4,
			describeSuccess: () => `upload armed for ${paths.length} file(s)`
		});
	});
	browser.command("waitfordownload").description("Wait for the next download (and save it)").argument("[path]", "Save path within openclaw temp downloads dir (default: /tmp/openclaw/downloads/...; fallback: os.tmpdir()/openclaw/downloads/...)").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the next download (default: 120000)", (v) => Number(v)).action(async (outPath, opts, cmd) => {
		await runDownloadCommand(cmd, opts, {
			path: "/wait/download",
			body: { path: normalizeOptionalString(outPath) }
		});
	});
	browser.command("download").description("Click a ref and save the resulting download").argument("<ref>", "Ref id from snapshot to click").argument("<path>", "Save path within openclaw temp downloads dir (e.g. report.pdf or /tmp/openclaw/downloads/report.pdf)").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the download to start (default: 120000)", (v) => Number(v)).action(async (ref, outPath, opts, cmd) => {
		await runDownloadCommand(cmd, opts, {
			path: "/download",
			body: {
				ref,
				path: outPath
			}
		});
	});
	browser.command("dialog").description("Arm the next modal dialog (alert/confirm/prompt)").option("--accept", "Accept the dialog", false).option("--dismiss", "Dismiss the dialog", false).option("--prompt <text>", "Prompt response text").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the next dialog (default: 120000)", (v) => Number(v)).action(async (opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		const accept = opts.accept ? true : opts.dismiss ? false : void 0;
		if (accept === void 0) {
			defaultRuntime.error(danger("Specify --accept or --dismiss"));
			defaultRuntime.exit(1);
			return;
		}
		const { timeoutMs, targetId } = resolveTimeoutAndTarget(opts);
		await runBrowserPostAction({
			parent,
			profile,
			path: "/hooks/dialog",
			body: {
				accept,
				promptText: normalizeOptionalString(opts.prompt),
				targetId,
				timeoutMs
			},
			timeoutMs: timeoutMs ?? 2e4,
			describeSuccess: () => "dialog armed"
		});
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-actions-input/register.form-wait-eval.ts
function registerBrowserFormWaitEvalCommands(browser, parentOpts) {
	browser.command("fill").description("Fill a form with JSON field descriptors").option("--fields <json>", "JSON array of field objects").option("--fields-file <path>", "Read JSON array from a file").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const fields = await readFields({
				fields: opts.fields,
				fieldsFile: opts.fieldsFile
			});
			logBrowserActionResult(parent, await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "fill",
					fields,
					targetId: normalizeOptionalString(opts.targetId)
				}
			}), `filled ${fields.length} field(s)`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("wait").description("Wait for time, selector, URL, load state, or JS conditions").argument("[selector]", "CSS selector to wait for (visible)").option("--time <ms>", "Wait for N milliseconds", (v) => Number(v)).option("--text <value>", "Wait for text to appear").option("--text-gone <value>", "Wait for text to disappear").option("--url <pattern>", "Wait for URL (supports globs like **/dash)").option("--load <load|domcontentloaded|networkidle>", "Wait for load state").option("--fn <js>", "Wait for JS condition (passed to waitForFunction)").option("--timeout-ms <ms>", "How long to wait for each condition (default: 20000)", (v) => Number(v)).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (selector, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const sel = normalizeOptionalString(selector);
			const load = opts.load === "load" || opts.load === "domcontentloaded" || opts.load === "networkidle" ? opts.load : void 0;
			const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0;
			logBrowserActionResult(parent, await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "wait",
					timeMs: Number.isFinite(opts.time) ? opts.time : void 0,
					text: normalizeOptionalString(opts.text),
					textGone: normalizeOptionalString(opts.textGone),
					selector: sel,
					url: normalizeOptionalString(opts.url),
					loadState: load,
					fn: normalizeOptionalString(opts.fn),
					targetId: normalizeOptionalString(opts.targetId),
					timeoutMs
				},
				timeoutMs
			}), "wait complete");
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("evaluate").description("Evaluate a function against the page or a ref").option("--fn <code>", "Function source, e.g. (el) => el.textContent").option("--ref <id>", "Ref from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		if (!opts.fn) {
			defaultRuntime.error(danger("Missing --fn"));
			defaultRuntime.exit(1);
			return;
		}
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "evaluate",
					fn: opts.fn,
					ref: normalizeOptionalString(opts.ref),
					targetId: normalizeOptionalString(opts.targetId)
				}
			});
			if (parent?.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			defaultRuntime.writeJson(result.result ?? null);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-resize.ts
async function runBrowserResizeWithOutput(params) {
	const { width, height } = params;
	if (!Number.isFinite(width) || !Number.isFinite(height)) {
		defaultRuntime.error(danger("width and height must be numbers"));
		defaultRuntime.exit(1);
		return;
	}
	const result = await callBrowserResize(params.parent, {
		profile: params.profile,
		width,
		height,
		targetId: params.targetId
	}, { timeoutMs: params.timeoutMs ?? 2e4 });
	if (params.parent?.json) {
		defaultRuntime.writeJson(result);
		return;
	}
	defaultRuntime.log(params.successMessage);
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-actions-input/register.navigation.ts
function registerBrowserNavigationCommands(browser, parentOpts) {
	browser.command("navigate").description("Navigate the current tab to a URL").argument("<url>", "URL to navigate to").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (url, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/navigate",
				query: profile ? { profile } : void 0,
				body: {
					url,
					targetId: normalizeOptionalString(opts.targetId)
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			defaultRuntime.log(`navigated to ${result.url ?? url}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("resize").description("Resize the viewport").argument("<width>", "Viewport width", (v) => Number(v)).argument("<height>", "Viewport height", (v) => Number(v)).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (width, height, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			await runBrowserResizeWithOutput({
				parent,
				profile,
				width,
				height,
				targetId: opts.targetId,
				timeoutMs: 2e4,
				successMessage: `resized to ${width}x${height}`
			});
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-actions-input/register.ts
function registerBrowserActionInputCommands(browser, parentOpts) {
	registerBrowserNavigationCommands(browser, parentOpts);
	registerBrowserElementCommands(browser, parentOpts);
	registerBrowserFilesAndDownloadsCommands(browser, parentOpts);
	registerBrowserFormWaitEvalCommands(browser, parentOpts);
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-actions-observe.ts
function runBrowserObserve(action) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	});
}
function registerBrowserActionObserveCommands(browser, parentOpts) {
	browser.command("console").description("Get recent console messages").option("--level <level>", "Filter by level (error, warn, info)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserObserve(async () => {
			const result = await callBrowserRequest(parent, {
				method: "GET",
				path: "/console",
				query: {
					level: normalizeOptionalString(opts.level),
					targetId: normalizeOptionalString(opts.targetId),
					profile
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			defaultRuntime.writeJson(result.messages);
		});
	});
	browser.command("pdf").description("Save page as PDF").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserObserve(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/pdf",
				query: profile ? { profile } : void 0,
				body: { targetId: normalizeOptionalString(opts.targetId) }
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			defaultRuntime.log(`PDF: ${shortenHomePath(result.path)}`);
		});
	});
	browser.command("responsebody").description("Wait for a network response and return its body").argument("<url>", "URL (exact, substring, or glob like **/api)").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the response (default: 20000)", (v) => Number(v)).option("--max-chars <n>", "Max body chars to return (default: 200000)", (v) => Number(v)).action(async (url, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserObserve(async () => {
			const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0;
			const maxChars = Number.isFinite(opts.maxChars) ? opts.maxChars : void 0;
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/response/body",
				query: profile ? { profile } : void 0,
				body: {
					url,
					targetId: normalizeOptionalString(opts.targetId),
					timeoutMs,
					maxChars
				}
			}, { timeoutMs: timeoutMs ?? 2e4 });
			if (parent?.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			defaultRuntime.log(result.response.body);
		});
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-debug.ts
const BROWSER_DEBUG_TIMEOUT_MS = 2e4;
function runBrowserDebug(action) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	});
}
async function withDebugContext(cmd, parentOpts, action) {
	const parent = parentOpts(cmd);
	await runBrowserDebug(() => action({
		parent,
		profile: parent.browserProfile
	}));
}
function printJsonResult$1(parent, result) {
	if (!parent.json) return false;
	defaultRuntime.writeJson(result);
	return true;
}
async function callDebugRequest(parent, params) {
	return callBrowserRequest(parent, params, { timeoutMs: BROWSER_DEBUG_TIMEOUT_MS });
}
function resolveProfileQuery$1(profile) {
	return profile ? { profile } : void 0;
}
function resolveDebugQuery(params) {
	return {
		targetId: normalizeOptionalString(params.targetId),
		filter: normalizeOptionalString(params.filter),
		clear: Boolean(params.clear),
		profile: params.profile
	};
}
function registerBrowserDebugCommands(browser, parentOpts) {
	browser.command("highlight").description("Highlight an element by ref").argument("<ref>", "Ref id from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (ref, opts, cmd) => {
		await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
			if (printJsonResult$1(parent, await callDebugRequest(parent, {
				method: "POST",
				path: "/highlight",
				query: resolveProfileQuery$1(profile),
				body: {
					ref: ref.trim(),
					targetId: normalizeOptionalString(opts.targetId)
				}
			}))) return;
			defaultRuntime.log(`highlighted ${ref.trim()}`);
		});
	});
	browser.command("errors").description("Get recent page errors").option("--clear", "Clear stored errors after reading", false).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
			const result = await callDebugRequest(parent, {
				method: "GET",
				path: "/errors",
				query: resolveDebugQuery({
					targetId: opts.targetId,
					clear: opts.clear,
					profile
				})
			});
			if (printJsonResult$1(parent, result)) return;
			if (!result.errors.length) {
				defaultRuntime.log("No page errors.");
				return;
			}
			defaultRuntime.log(result.errors.map((e) => `${e.timestamp} ${e.name ? `${e.name}: ` : ""}${e.message}`).join("\n"));
		});
	});
	browser.command("requests").description("Get recent network requests (best-effort)").option("--filter <text>", "Only show URLs that contain this substring").option("--clear", "Clear stored requests after reading", false).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
			const result = await callDebugRequest(parent, {
				method: "GET",
				path: "/requests",
				query: resolveDebugQuery({
					targetId: opts.targetId,
					filter: opts.filter,
					clear: opts.clear,
					profile
				})
			});
			if (printJsonResult$1(parent, result)) return;
			if (!result.requests.length) {
				defaultRuntime.log("No requests recorded.");
				return;
			}
			defaultRuntime.log(result.requests.map((r) => {
				const status = typeof r.status === "number" ? ` ${r.status}` : "";
				const ok = r.ok === true ? " ok" : r.ok === false ? " fail" : "";
				const fail = r.failureText ? ` (${r.failureText})` : "";
				return `${r.timestamp} ${r.method}${status}${ok} ${r.url}${fail}`;
			}).join("\n"));
		});
	});
	const trace = browser.command("trace").description("Record a Playwright trace");
	trace.command("start").description("Start trace recording").option("--target-id <id>", "CDP target id (or unique prefix)").option("--no-screenshots", "Disable screenshots").option("--no-snapshots", "Disable snapshots").option("--sources", "Include sources (bigger traces)", false).action(async (opts, cmd) => {
		await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
			if (printJsonResult$1(parent, await callDebugRequest(parent, {
				method: "POST",
				path: "/trace/start",
				query: resolveProfileQuery$1(profile),
				body: {
					targetId: normalizeOptionalString(opts.targetId),
					screenshots: Boolean(opts.screenshots),
					snapshots: Boolean(opts.snapshots),
					sources: Boolean(opts.sources)
				}
			}))) return;
			defaultRuntime.log("trace started");
		});
	});
	trace.command("stop").description("Stop trace recording and write a .zip").option("--out <path>", "Output path within openclaw temp dir (e.g. trace.zip or /tmp/openclaw/trace.zip)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		await withDebugContext(cmd, parentOpts, async ({ parent, profile }) => {
			const result = await callDebugRequest(parent, {
				method: "POST",
				path: "/trace/stop",
				query: resolveProfileQuery$1(profile),
				body: {
					targetId: normalizeOptionalString(opts.targetId),
					path: normalizeOptionalString(opts.out)
				}
			});
			if (printJsonResult$1(parent, result)) return;
			defaultRuntime.log(`TRACE:${shortenHomePath(result.path)}`);
		});
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-examples.ts
const browserCoreExamples = [
	"openclaw browser status",
	"openclaw browser start",
	"openclaw browser stop",
	"openclaw browser tabs",
	"openclaw browser open https://example.com",
	"openclaw browser focus abcd1234",
	"openclaw browser close abcd1234",
	"openclaw browser screenshot",
	"openclaw browser screenshot --full-page",
	"openclaw browser screenshot --ref 12",
	"openclaw browser snapshot",
	"openclaw browser snapshot --format aria --limit 200",
	"openclaw browser snapshot --efficient",
	"openclaw browser snapshot --labels"
];
const browserActionExamples = [
	"openclaw browser navigate https://example.com",
	"openclaw browser resize 1280 720",
	"openclaw browser click 12 --double",
	"openclaw browser type 23 \"hello\" --submit",
	"openclaw browser press Enter",
	"openclaw browser hover 44",
	"openclaw browser drag 10 11",
	"openclaw browser select 9 OptionA OptionB",
	"openclaw browser upload /tmp/openclaw/uploads/file.pdf",
	"openclaw browser fill --fields '[{\"ref\":\"1\",\"value\":\"Ada\"}]'",
	"openclaw browser dialog --accept",
	"openclaw browser wait --text \"Done\"",
	"openclaw browser evaluate --fn '(el) => el.textContent' --ref 7",
	"openclaw browser console --level error",
	"openclaw browser pdf"
];
//#endregion
//#region extensions/browser/src/cli/browser-cli-inspect.ts
function registerBrowserInspectCommands(browser, parentOpts) {
	browser.command("screenshot").description("Capture a screenshot (MEDIA:<path>)").argument("[targetId]", "CDP target id (or unique prefix)").option("--full-page", "Capture full scrollable page", false).option("--ref <ref>", "ARIA ref from ai snapshot").option("--element <selector>", "CSS selector for element screenshot").option("--type <png|jpeg>", "Output type (default: png)", "png").action(async (targetId, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		try {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/screenshot",
				query: profile ? { profile } : void 0,
				body: {
					targetId: normalizeOptionalString(targetId),
					fullPage: Boolean(opts.fullPage),
					ref: normalizeOptionalString(opts.ref),
					element: normalizeOptionalString(opts.element),
					type: opts.type === "jpeg" ? "jpeg" : "png"
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			defaultRuntime.log(`MEDIA:${shortenHomePath(result.path)}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("snapshot").description("Capture a snapshot (default: ai; aria is the accessibility tree)").option("--format <aria|ai>", "Snapshot format (default: ai)", "ai").option("--target-id <id>", "CDP target id (or unique prefix)").option("--limit <n>", "Max nodes (default: 500/800)", (v) => Number(v)).option("--mode <efficient>", "Snapshot preset (efficient)").option("--efficient", "Use the efficient snapshot preset", false).option("--interactive", "Role snapshot: interactive elements only", false).option("--compact", "Role snapshot: compact output", false).option("--depth <n>", "Role snapshot: max depth", (v) => Number(v)).option("--selector <sel>", "Role snapshot: scope to CSS selector").option("--frame <sel>", "Role snapshot: scope to an iframe selector").option("--labels", "Include viewport label overlay screenshot", false).option("--out <path>", "Write snapshot to a file").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		const format = opts.format === "aria" ? "aria" : "ai";
		const configMode = format === "ai" && loadConfig().browser?.snapshotDefaults?.mode === "efficient" ? "efficient" : void 0;
		const mode = opts.efficient === true || opts.mode === "efficient" ? "efficient" : configMode;
		try {
			const result = await callBrowserRequest(parent, {
				method: "GET",
				path: "/snapshot",
				query: {
					format,
					targetId: normalizeOptionalString(opts.targetId),
					limit: Number.isFinite(opts.limit) ? opts.limit : void 0,
					interactive: opts.interactive ? true : void 0,
					compact: opts.compact ? true : void 0,
					depth: Number.isFinite(opts.depth) ? opts.depth : void 0,
					selector: normalizeOptionalString(opts.selector),
					frame: normalizeOptionalString(opts.frame),
					labels: opts.labels ? true : void 0,
					mode,
					profile
				}
			}, { timeoutMs: 2e4 });
			if (opts.out) {
				const fs = await import("node:fs/promises");
				if (result.format === "ai") await fs.writeFile(opts.out, result.snapshot, "utf8");
				else {
					const payload = JSON.stringify(result, null, 2);
					await fs.writeFile(opts.out, payload, "utf8");
				}
				if (parent?.json) defaultRuntime.writeJson({
					ok: true,
					out: opts.out,
					...result.format === "ai" && result.imagePath ? { imagePath: result.imagePath } : {}
				});
				else {
					defaultRuntime.log(shortenHomePath(opts.out));
					if (result.format === "ai" && result.imagePath) defaultRuntime.log(`MEDIA:${shortenHomePath(result.imagePath)}`);
				}
				return;
			}
			if (parent?.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			if (result.format === "ai") {
				defaultRuntime.log(result.snapshot);
				if (result.imagePath) defaultRuntime.log(`MEDIA:${shortenHomePath(result.imagePath)}`);
				return;
			}
			const nodes = "nodes" in result ? result.nodes : [];
			defaultRuntime.log(nodes.map((n) => {
				const indent = "  ".repeat(Math.min(20, n.depth));
				const name = n.name ? ` "${n.name}"` : "";
				const value = n.value ? ` = "${n.value}"` : "";
				return `${indent}- ${n.role}${name}${value}`;
			}).join("\n"));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-manage.ts
const BROWSER_MANAGE_REQUEST_TIMEOUT_MS = 45e3;
function resolveProfileQuery(profile) {
	return profile ? { profile } : void 0;
}
function printJsonResult(parent, payload) {
	if (!parent?.json) return false;
	defaultRuntime.writeJson(payload);
	return true;
}
async function callTabAction(parent, profile, body) {
	return callBrowserRequest(parent, {
		method: "POST",
		path: "/tabs/action",
		query: resolveProfileQuery(profile),
		body
	}, { timeoutMs: BROWSER_MANAGE_REQUEST_TIMEOUT_MS });
}
async function fetchBrowserStatus(parent, profile) {
	return await callBrowserRequest(parent, {
		method: "GET",
		path: "/",
		query: resolveProfileQuery(profile)
	}, { timeoutMs: BROWSER_MANAGE_REQUEST_TIMEOUT_MS });
}
async function runBrowserToggle(parent, params) {
	await callBrowserRequest(parent, {
		method: "POST",
		path: params.path,
		query: resolveProfileQuery(params.profile)
	});
	const status = await fetchBrowserStatus(parent, params.profile);
	if (printJsonResult(parent, status)) return;
	const name = status.profile ?? "openclaw";
	defaultRuntime.log(info(`🦞 browser [${name}] running: ${status.running}`));
}
function runBrowserCommand$1(action) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	});
}
function logBrowserTabs(tabs, json) {
	if (json) {
		defaultRuntime.writeJson({ tabs });
		return;
	}
	if (tabs.length === 0) {
		defaultRuntime.log("No tabs (browser closed or no targets).");
		return;
	}
	defaultRuntime.log(tabs.map((t, i) => `${i + 1}. ${t.title || "(untitled)"}\n   ${t.url}\n   id: ${t.targetId}`).join("\n"));
}
function usesChromeMcpTransport(params) {
	return params.transport === "chrome-mcp" || params.driver === "existing-session";
}
function formatBrowserConnectionSummary(params) {
	if (usesChromeMcpTransport(params)) {
		const userDataDir = params.userDataDir ? shortenHomePath(params.userDataDir) : null;
		return userDataDir ? `transport: chrome-mcp, userDataDir: ${userDataDir}` : "transport: chrome-mcp";
	}
	if (params.isRemote) return `cdpUrl: ${params.cdpUrl ?? "(unset)"}`;
	return `port: ${params.cdpPort ?? "(unset)"}`;
}
function registerBrowserManageCommands(browser, parentOpts) {
	browser.command("status").description("Show browser status").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		await runBrowserCommand$1(async () => {
			const status = await fetchBrowserStatus(parent, parent?.browserProfile);
			if (printJsonResult(parent, status)) return;
			const detectedPath = status.detectedExecutablePath ?? status.executablePath;
			const detectedDisplay = detectedPath ? shortenHomePath(detectedPath) : "auto";
			defaultRuntime.log([
				`profile: ${status.profile ?? "openclaw"}`,
				`enabled: ${status.enabled}`,
				`running: ${status.running}`,
				`transport: ${usesChromeMcpTransport(status) ? "chrome-mcp" : status.transport ?? "cdp"}`,
				...!usesChromeMcpTransport(status) ? [`cdpPort: ${status.cdpPort ?? "(unset)"}`, `cdpUrl: ${redactCdpUrl(status.cdpUrl ?? `http://127.0.0.1:${status.cdpPort}`)}`] : status.userDataDir ? [`userDataDir: ${shortenHomePath(status.userDataDir)}`] : [],
				`browser: ${status.chosenBrowser ?? "unknown"}`,
				`detectedBrowser: ${status.detectedBrowser ?? "unknown"}`,
				`detectedPath: ${detectedDisplay}`,
				`profileColor: ${status.color}`,
				...status.detectError ? [`detectError: ${status.detectError}`] : []
			].join("\n"));
		});
	});
	browser.command("start").description("Start the browser (no-op if already running)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			await runBrowserToggle(parent, {
				profile,
				path: "/start"
			});
		});
	});
	browser.command("stop").description("Stop the browser (best-effort)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			await runBrowserToggle(parent, {
				profile,
				path: "/stop"
			});
		});
	});
	browser.command("reset-profile").description("Reset browser profile (moves it to Trash)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/reset-profile",
				query: resolveProfileQuery(profile)
			}, { timeoutMs: 2e4 });
			if (printJsonResult(parent, result)) return;
			if (!result.moved) {
				defaultRuntime.log(info(`🦞 browser profile already missing.`));
				return;
			}
			const dest = result.to ?? result.from;
			defaultRuntime.log(info(`🦞 browser profile moved to Trash (${dest})`));
		});
	});
	browser.command("tabs").description("List open tabs").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			logBrowserTabs((await callBrowserRequest(parent, {
				method: "GET",
				path: "/tabs",
				query: resolveProfileQuery(profile)
			}, { timeoutMs: BROWSER_MANAGE_REQUEST_TIMEOUT_MS })).tabs ?? [], parent?.json);
		});
	});
	const tab = browser.command("tab").description("Tab shortcuts (index-based)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			logBrowserTabs((await callBrowserRequest(parent, {
				method: "POST",
				path: "/tabs/action",
				query: resolveProfileQuery(profile),
				body: { action: "list" }
			}, { timeoutMs: BROWSER_MANAGE_REQUEST_TIMEOUT_MS })).tabs ?? [], parent?.json);
		});
	});
	tab.command("new").description("Open a new tab (about:blank)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			if (printJsonResult(parent, await callTabAction(parent, profile, { action: "new" }))) return;
			defaultRuntime.log("opened new tab");
		});
	});
	tab.command("select").description("Focus tab by index (1-based)").argument("<index>", "Tab index (1-based)", (v) => Number(v)).action(async (index, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		if (!Number.isFinite(index) || index < 1) {
			defaultRuntime.error(danger("index must be a positive number"));
			defaultRuntime.exit(1);
			return;
		}
		await runBrowserCommand$1(async () => {
			if (printJsonResult(parent, await callTabAction(parent, profile, {
				action: "select",
				index: Math.floor(index) - 1
			}))) return;
			defaultRuntime.log(`selected tab ${Math.floor(index)}`);
		});
	});
	tab.command("close").description("Close tab by index (1-based); default: first tab").argument("[index]", "Tab index (1-based)", (v) => Number(v)).action(async (index, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		const idx = typeof index === "number" && Number.isFinite(index) ? Math.floor(index) - 1 : void 0;
		if (typeof idx === "number" && idx < 0) {
			defaultRuntime.error(danger("index must be >= 1"));
			defaultRuntime.exit(1);
			return;
		}
		await runBrowserCommand$1(async () => {
			if (printJsonResult(parent, await callTabAction(parent, profile, {
				action: "close",
				index: idx
			}))) return;
			defaultRuntime.log("closed tab");
		});
	});
	browser.command("open").description("Open a URL in a new tab").argument("<url>", "URL to open").action(async (url, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			const tab = await callBrowserRequest(parent, {
				method: "POST",
				path: "/tabs/open",
				query: resolveProfileQuery(profile),
				body: { url }
			}, { timeoutMs: BROWSER_MANAGE_REQUEST_TIMEOUT_MS });
			if (printJsonResult(parent, tab)) return;
			defaultRuntime.log(`opened: ${tab.url}\nid: ${tab.targetId}`);
		});
	});
	browser.command("focus").description("Focus a tab by target id (or unique prefix)").argument("<targetId>", "Target id or unique prefix").action(async (targetId, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			await callBrowserRequest(parent, {
				method: "POST",
				path: "/tabs/focus",
				query: resolveProfileQuery(profile),
				body: { targetId }
			}, { timeoutMs: BROWSER_MANAGE_REQUEST_TIMEOUT_MS });
			if (printJsonResult(parent, { ok: true })) return;
			defaultRuntime.log(`focused tab ${targetId}`);
		});
	});
	browser.command("close").description("Close a tab (target id optional)").argument("[targetId]", "Target id or unique prefix (optional)").action(async (targetId, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			if (targetId?.trim()) await callBrowserRequest(parent, {
				method: "DELETE",
				path: `/tabs/${encodeURIComponent(targetId.trim())}`,
				query: resolveProfileQuery(profile)
			}, { timeoutMs: BROWSER_MANAGE_REQUEST_TIMEOUT_MS });
			else await callBrowserRequest(parent, {
				method: "POST",
				path: "/act",
				query: resolveProfileQuery(profile),
				body: { kind: "close" }
			}, { timeoutMs: BROWSER_MANAGE_REQUEST_TIMEOUT_MS });
			if (printJsonResult(parent, { ok: true })) return;
			defaultRuntime.log("closed tab");
		});
	});
	browser.command("profiles").description("List all browser profiles").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		await runBrowserCommand$1(async () => {
			const profiles = (await callBrowserRequest(parent, {
				method: "GET",
				path: "/profiles"
			}, { timeoutMs: BROWSER_MANAGE_REQUEST_TIMEOUT_MS })).profiles ?? [];
			if (printJsonResult(parent, { profiles })) return;
			if (profiles.length === 0) {
				defaultRuntime.log("No profiles configured.");
				return;
			}
			defaultRuntime.log(profiles.map((p) => {
				const status = p.running ? "running" : "stopped";
				const tabs = p.running ? ` (${p.tabCount} tabs)` : "";
				const def = p.isDefault ? " [default]" : "";
				const loc = formatBrowserConnectionSummary(p);
				const remote = p.isRemote ? " [remote]" : "";
				const driver = p.driver !== "openclaw" ? ` [${p.driver}]` : "";
				return `${p.name}: ${status}${tabs}${def}${remote}${driver}\n  ${loc}, color: ${p.color}`;
			}).join("\n"));
		});
	});
	browser.command("create-profile").description("Create a new browser profile").requiredOption("--name <name>", "Profile name (lowercase, numbers, hyphens)").option("--color <hex>", "Profile color (hex format, e.g. #0066CC)").option("--cdp-url <url>", "CDP URL for remote Chrome (http/https)").option("--user-data-dir <path>", "User data dir for existing-session Chromium attach").option("--driver <driver>", "Profile driver (openclaw|existing-session). Default: openclaw").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		await runBrowserCommand$1(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/profiles/create",
				body: {
					name: opts.name,
					color: opts.color,
					cdpUrl: opts.cdpUrl,
					userDataDir: opts.userDataDir,
					driver: opts.driver === "existing-session" ? "existing-session" : void 0
				}
			}, { timeoutMs: 1e4 });
			if (printJsonResult(parent, result)) return;
			const loc = `  ${formatBrowserConnectionSummary(result)}`;
			defaultRuntime.log(info(`🦞 Created profile "${result.profile}"\n${loc}\n  color: ${result.color}${result.userDataDir ? `\n  userDataDir: ${shortenHomePath(result.userDataDir)}` : ""}${opts.driver === "existing-session" ? "\n  driver: existing-session" : ""}`));
		});
	});
	browser.command("delete-profile").description("Delete a browser profile").requiredOption("--name <name>", "Profile name to delete").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		await runBrowserCommand$1(async () => {
			const result = await callBrowserRequest(parent, {
				method: "DELETE",
				path: `/profiles/${encodeURIComponent(opts.name)}`
			}, { timeoutMs: 2e4 });
			if (printJsonResult(parent, result)) return;
			const msg = result.deleted ? `🦞 Deleted profile "${result.profile}" (user data removed)` : `🦞 Deleted profile "${result.profile}" (no user data found)`;
			defaultRuntime.log(info(msg));
		});
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-state.cookies-storage.ts
function resolveUrl(opts, command) {
	return normalizeOptionalString(opts.url) ?? normalizeOptionalString(inheritOptionFromParent(command, "url"));
}
function resolveTargetId(rawTargetId, command) {
	return normalizeOptionalString(rawTargetId) ?? normalizeOptionalString(inheritOptionFromParent(command, "targetId"));
}
async function runMutationRequest(params) {
	try {
		const result = await callBrowserRequest(params.parent, params.request, { timeoutMs: 2e4 });
		if (params.parent?.json) {
			defaultRuntime.writeJson(result);
			return;
		}
		defaultRuntime.log(params.successMessage);
	} catch (err) {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	}
}
function registerBrowserCookiesAndStorageCommands(browser, parentOpts) {
	const cookies = browser.command("cookies").description("Read/write cookies");
	cookies.option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		const targetId = resolveTargetId(opts.targetId, cmd);
		try {
			const result = await callBrowserRequest(parent, {
				method: "GET",
				path: "/cookies",
				query: {
					targetId,
					profile
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			defaultRuntime.writeJson(result.cookies ?? []);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	cookies.command("set").description("Set a cookie (requires --url or domain+path)").argument("<name>", "Cookie name").argument("<value>", "Cookie value").option("--url <url>", "Cookie URL scope (recommended)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (name, value, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		const targetId = resolveTargetId(opts.targetId, cmd);
		const url = resolveUrl(opts, cmd);
		if (!url) {
			defaultRuntime.error(danger("Missing required --url option for cookies set"));
			defaultRuntime.exit(1);
			return;
		}
		await runMutationRequest({
			parent,
			request: {
				method: "POST",
				path: "/cookies/set",
				query: profile ? { profile } : void 0,
				body: {
					targetId,
					cookie: {
						name,
						value,
						url
					}
				}
			},
			successMessage: `cookie set: ${name}`
		});
	});
	cookies.command("clear").description("Clear all cookies").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		const targetId = resolveTargetId(opts.targetId, cmd);
		await runMutationRequest({
			parent,
			request: {
				method: "POST",
				path: "/cookies/clear",
				query: profile ? { profile } : void 0,
				body: { targetId }
			},
			successMessage: "cookies cleared"
		});
	});
	const storage = browser.command("storage").description("Read/write localStorage/sessionStorage");
	function registerStorageKind(kind) {
		const cmd = storage.command(kind).description(`${kind}Storage commands`);
		cmd.command("get").description(`Get ${kind}Storage (all keys or one key)`).argument("[key]", "Key (optional)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (key, opts, cmd2) => {
			const parent = parentOpts(cmd2);
			const profile = parent?.browserProfile;
			const targetId = resolveTargetId(opts.targetId, cmd2);
			try {
				const result = await callBrowserRequest(parent, {
					method: "GET",
					path: `/storage/${kind}`,
					query: {
						key: normalizeOptionalString(key),
						targetId,
						profile
					}
				}, { timeoutMs: 2e4 });
				if (parent?.json) {
					defaultRuntime.writeJson(result);
					return;
				}
				defaultRuntime.writeJson(result.values ?? {});
			} catch (err) {
				defaultRuntime.error(danger(String(err)));
				defaultRuntime.exit(1);
			}
		});
		cmd.command("set").description(`Set a ${kind}Storage key`).argument("<key>", "Key").argument("<value>", "Value").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (key, value, opts, cmd2) => {
			const parent = parentOpts(cmd2);
			const profile = parent?.browserProfile;
			const targetId = resolveTargetId(opts.targetId, cmd2);
			await runMutationRequest({
				parent,
				request: {
					method: "POST",
					path: `/storage/${kind}/set`,
					query: profile ? { profile } : void 0,
					body: {
						key,
						value,
						targetId
					}
				},
				successMessage: `${kind}Storage set: ${key}`
			});
		});
		cmd.command("clear").description(`Clear all ${kind}Storage keys`).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd2) => {
			const parent = parentOpts(cmd2);
			const profile = parent?.browserProfile;
			const targetId = resolveTargetId(opts.targetId, cmd2);
			await runMutationRequest({
				parent,
				request: {
					method: "POST",
					path: `/storage/${kind}/clear`,
					query: profile ? { profile } : void 0,
					body: { targetId }
				},
				successMessage: `${kind}Storage cleared`
			});
		});
	}
	registerStorageKind("local");
	registerStorageKind("session");
}
//#endregion
//#region extensions/browser/src/cli/browser-cli-state.ts
function parseOnOff(raw) {
	const parsed = parseBooleanValue(raw);
	return parsed === void 0 ? null : parsed;
}
function runBrowserCommand(action) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	});
}
async function runBrowserSetRequest(params) {
	await runBrowserCommand(async () => {
		const profile = params.parent?.browserProfile;
		const result = await callBrowserRequest(params.parent, {
			method: "POST",
			path: params.path,
			query: profile ? { profile } : void 0,
			body: params.body
		}, { timeoutMs: 2e4 });
		if (params.parent?.json) {
			defaultRuntime.writeJson(result);
			return;
		}
		defaultRuntime.log(params.successMessage);
	});
}
function registerBrowserStateCommands(browser, parentOpts) {
	registerBrowserCookiesAndStorageCommands(browser, parentOpts);
	const set = browser.command("set").description("Browser environment settings");
	set.command("viewport").description("Set viewport size (alias for resize)").argument("<width>", "Viewport width", (v) => Number(v)).argument("<height>", "Viewport height", (v) => Number(v)).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (width, height, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand(async () => {
			await runBrowserResizeWithOutput({
				parent,
				profile,
				width,
				height,
				targetId: opts.targetId,
				timeoutMs: 2e4,
				successMessage: `viewport set: ${width}x${height}`
			});
		});
	});
	set.command("offline").description("Toggle offline mode").argument("<on|off>", "on/off").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (value, opts, cmd) => {
		const parent = parentOpts(cmd);
		const offline = parseOnOff(value);
		if (offline === null) {
			defaultRuntime.error(danger("Expected on|off"));
			defaultRuntime.exit(1);
			return;
		}
		await runBrowserSetRequest({
			parent,
			path: "/set/offline",
			body: {
				offline,
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `offline: ${offline}`
		});
	});
	set.command("headers").description("Set extra HTTP headers (JSON object)").argument("[headersJson]", "JSON object of headers (alternative to --headers-json)").option("--headers-json <json>", "JSON object of headers").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (headersJson, opts, cmd) => {
		const parent = parentOpts(cmd);
		await runBrowserCommand(async () => {
			const headersJsonValue = normalizeOptionalString(opts.headersJson) ?? normalizeOptionalString(headersJson);
			if (!headersJsonValue) throw new Error("Missing headers JSON (pass --headers-json or positional JSON argument)");
			const parsed = JSON.parse(headersJsonValue);
			if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Headers JSON must be a JSON object");
			const headers = {};
			for (const [k, v] of Object.entries(parsed)) if (typeof v === "string") headers[k] = v;
			const profile = parent?.browserProfile;
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/set/headers",
				query: profile ? { profile } : void 0,
				body: {
					headers,
					targetId: normalizeOptionalString(opts.targetId)
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.writeJson(result);
				return;
			}
			defaultRuntime.log("headers set");
		});
	});
	set.command("credentials").description("Set HTTP basic auth credentials").option("--clear", "Clear credentials", false).argument("[username]", "Username").argument("[password]", "Password").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (username, password, opts, cmd) => {
		await runBrowserSetRequest({
			parent: parentOpts(cmd),
			path: "/set/credentials",
			body: {
				username: normalizeOptionalString(username),
				password,
				clear: Boolean(opts.clear),
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: opts.clear ? "credentials cleared" : "credentials set"
		});
	});
	set.command("geo").description("Set geolocation (and grant permission)").option("--clear", "Clear geolocation + permissions", false).argument("[latitude]", "Latitude", (v) => Number(v)).argument("[longitude]", "Longitude", (v) => Number(v)).option("--accuracy <m>", "Accuracy in meters", (v) => Number(v)).option("--origin <origin>", "Origin to grant permissions for").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (latitude, longitude, opts, cmd) => {
		await runBrowserSetRequest({
			parent: parentOpts(cmd),
			path: "/set/geolocation",
			body: {
				latitude: Number.isFinite(latitude) ? latitude : void 0,
				longitude: Number.isFinite(longitude) ? longitude : void 0,
				accuracy: Number.isFinite(opts.accuracy) ? opts.accuracy : void 0,
				origin: normalizeOptionalString(opts.origin),
				clear: Boolean(opts.clear),
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: opts.clear ? "geolocation cleared" : "geolocation set"
		});
	});
	set.command("media").description("Emulate prefers-color-scheme").argument("<dark|light|none>", "dark/light/none").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (value, opts, cmd) => {
		const parent = parentOpts(cmd);
		const v = normalizeOptionalLowercaseString(value);
		const colorScheme = v === "dark" ? "dark" : v === "light" ? "light" : v === "none" ? "none" : null;
		if (!colorScheme) {
			defaultRuntime.error(danger("Expected dark|light|none"));
			defaultRuntime.exit(1);
			return;
		}
		await runBrowserSetRequest({
			parent,
			path: "/set/media",
			body: {
				colorScheme,
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `media colorScheme: ${colorScheme}`
		});
	});
	set.command("timezone").description("Override timezone (CDP)").argument("<timezoneId>", "Timezone ID (e.g. America/New_York)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (timezoneId, opts, cmd) => {
		await runBrowserSetRequest({
			parent: parentOpts(cmd),
			path: "/set/timezone",
			body: {
				timezoneId,
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `timezone: ${timezoneId}`
		});
	});
	set.command("locale").description("Override locale (CDP)").argument("<locale>", "Locale (e.g. en-US)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (locale, opts, cmd) => {
		await runBrowserSetRequest({
			parent: parentOpts(cmd),
			path: "/set/locale",
			body: {
				locale,
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `locale: ${locale}`
		});
	});
	set.command("device").description("Apply a Playwright device descriptor (e.g. \"iPhone 14\")").argument("<name>", "Device name (Playwright devices)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (name, opts, cmd) => {
		await runBrowserSetRequest({
			parent: parentOpts(cmd),
			path: "/set/device",
			body: {
				name,
				targetId: normalizeOptionalString(opts.targetId)
			},
			successMessage: `device: ${name}`
		});
	});
}
//#endregion
//#region extensions/browser/src/cli/browser-cli.ts
function registerBrowserCli(program) {
	const browser = program.command("browser").description("Manage OpenClaw's dedicated browser (Chrome/Chromium)").option("--browser-profile <name>", "Browser profile name (default from config)").option("--json", "Output machine-readable JSON", false).addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([...browserCoreExamples, ...browserActionExamples].map((cmd) => [cmd, ""]), true)}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/browser", "docs.openclaw.ai/cli/browser")}\n`).action(() => {
		browser.outputHelp();
		defaultRuntime.error(danger(`Missing subcommand. Try: "${formatCliCommand("openclaw browser status")}"`));
		defaultRuntime.exit(1);
	});
	addGatewayClientOptions(browser);
	const parentOpts = (cmd) => cmd.parent?.opts?.();
	registerBrowserManageCommands(browser, parentOpts);
	registerBrowserInspectCommands(browser, parentOpts);
	registerBrowserActionInputCommands(browser, parentOpts);
	registerBrowserActionObserveCommands(browser, parentOpts);
	registerBrowserDebugCommands(browser, parentOpts);
	registerBrowserStateCommands(browser, parentOpts);
}
//#endregion
//#region extensions/browser/src/gateway/browser-request.ts
function isBrowserNode(node) {
	const caps = Array.isArray(node.caps) ? node.caps : [];
	const commands = Array.isArray(node.commands) ? node.commands : [];
	return caps.includes("browser") || commands.includes("browser.proxy");
}
function normalizeNodeKey(value) {
	return normalizeLowercaseStringOrEmpty(value).replace(/[^a-z0-9]+/g, "");
}
function resolveBrowserNode(nodes, query) {
	const q = normalizeOptionalString(query) ?? "";
	if (!q) return null;
	const qNorm = normalizeNodeKey(q);
	const matches = nodes.filter((node) => {
		if (node.nodeId === q) return true;
		if (typeof node.remoteIp === "string" && node.remoteIp === q) return true;
		const name = typeof node.displayName === "string" ? node.displayName : "";
		if (name && normalizeNodeKey(name) === qNorm) return true;
		if (q.length >= 6 && node.nodeId.startsWith(q)) return true;
		return false;
	});
	if (matches.length === 1) return matches[0] ?? null;
	if (matches.length === 0) return null;
	throw new Error(`ambiguous node: ${q} (matches: ${matches.map((node) => node.displayName || node.remoteIp || node.nodeId).join(", ")})`);
}
function resolveBrowserNodeTarget(params) {
	const policy = params.cfg.gateway?.nodes?.browser;
	const mode = policy?.mode ?? "auto";
	if (mode === "off") return null;
	const browserNodes = params.nodes.filter((node) => isBrowserNode(node));
	if (browserNodes.length === 0) {
		if (normalizeOptionalString(policy?.node)) throw new Error("No connected browser-capable nodes.");
		return null;
	}
	const requested = normalizeOptionalString(policy?.node) ?? "";
	if (requested) {
		const resolved = resolveBrowserNode(browserNodes, requested);
		if (!resolved) throw new Error(`Configured browser node not connected: ${requested}`);
		return resolved;
	}
	if (mode === "manual") return null;
	if (browserNodes.length === 1) return browserNodes[0] ?? null;
	return null;
}
async function persistProxyFiles(files) {
	return await persistBrowserProxyFiles(files);
}
function applyProxyPaths(result, mapping) {
	applyBrowserProxyPaths(result, mapping);
}
async function handleBrowserGatewayRequest({ params, respond, context }) {
	const typed = params;
	const methodRaw = (normalizeOptionalString(typed.method) ?? "").toUpperCase();
	const path = normalizeOptionalString(typed.path) ?? "";
	const query = typed.query && typeof typed.query === "object" ? typed.query : void 0;
	const body = typed.body;
	const timeoutMs = typeof typed.timeoutMs === "number" && Number.isFinite(typed.timeoutMs) ? Math.max(1, Math.floor(typed.timeoutMs)) : void 0;
	if (!methodRaw || !path) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "method and path are required"));
		return;
	}
	if (methodRaw !== "GET" && methodRaw !== "POST" && methodRaw !== "DELETE") {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "method must be GET, POST, or DELETE"));
		return;
	}
	if (isPersistentBrowserProfileMutation(methodRaw, path)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "browser.request cannot mutate persistent browser profiles"));
		return;
	}
	const cfg = loadConfig();
	let nodeTarget = null;
	try {
		nodeTarget = resolveBrowserNodeTarget({
			cfg,
			nodes: context.nodeRegistry.listConnected()
		});
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
		return;
	}
	if (nodeTarget) {
		const allowlist = resolveNodeCommandAllowlist(cfg, nodeTarget);
		const allowed = isNodeCommandAllowed({
			command: "browser.proxy",
			declaredCommands: nodeTarget.commands,
			allowlist
		});
		if (!allowed.ok) {
			const platform = nodeTarget.platform ?? "unknown";
			const hint = `node command not allowed: ${allowed.reason} (platform: ${platform}, command: browser.proxy)`;
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, hint, { details: {
				reason: allowed.reason,
				command: "browser.proxy"
			} }));
			return;
		}
		const proxyParams = {
			method: methodRaw,
			path,
			query,
			body,
			timeoutMs,
			profile: resolveRequestedBrowserProfile({
				query,
				body
			})
		};
		const res = await context.nodeRegistry.invoke({
			nodeId: nodeTarget.nodeId,
			command: "browser.proxy",
			params: proxyParams,
			timeoutMs,
			idempotencyKey: crypto.randomUUID()
		});
		if (!respondUnavailableOnNodeInvokeError(respond, res)) return;
		const payload = res.payloadJSON ? safeParseJson(res.payloadJSON) : res.payload;
		const proxy = payload && typeof payload === "object" ? payload : null;
		if (!proxy || !("result" in proxy)) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "browser proxy failed"));
			return;
		}
		const mapping = await persistProxyFiles(proxy.files);
		applyProxyPaths(proxy.result, mapping);
		respond(true, proxy.result);
		return;
	}
	if (!await startBrowserControlServiceFromConfig()) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "browser control is disabled"));
		return;
	}
	let dispatcher;
	try {
		dispatcher = createBrowserRouteDispatcher(createBrowserControlContext());
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
		return;
	}
	let result;
	try {
		result = timeoutMs ? await withTimeout((signal) => dispatcher.dispatch({
			method: methodRaw,
			path,
			query,
			body,
			signal
		}), timeoutMs, "browser request") : await dispatcher.dispatch({
			method: methodRaw,
			path,
			query,
			body
		});
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
		return;
	}
	if (result.status >= 400) {
		const message = result.body && typeof result.body === "object" && "error" in result.body ? String(result.body.error) : `browser request failed (${result.status})`;
		respond(false, void 0, errorShape(result.status >= 500 ? ErrorCodes.UNAVAILABLE : ErrorCodes.INVALID_REQUEST, message, { details: result.body }));
		return;
	}
	respond(true, result.body);
}
const browserHandlers = { "browser.request": handleBrowserGatewayRequest };
//#endregion
//#region extensions/browser/src/plugin-service.ts
const UNSAFE_BROWSER_CONTROL_OVERRIDE_SPECIFIER = /^(?:data|http|https|node):/i;
function validateBrowserControlOverrideSpecifier(specifier) {
	const trimmed = specifier.trim();
	if (UNSAFE_BROWSER_CONTROL_OVERRIDE_SPECIFIER.test(trimmed)) throw new Error(`Refusing unsafe browser control override specifier: ${trimmed}`);
	return trimmed;
}
function createBrowserPluginService() {
	let handle = null;
	return {
		id: "browser-control",
		start: async () => {
			if (handle) return;
			handle = await startLazyPluginServiceModule({
				skipEnvVar: "OPENCLAW_SKIP_BROWSER_CONTROL_SERVER",
				overrideEnvVar: "OPENCLAW_BROWSER_CONTROL_MODULE",
				validateOverrideSpecifier: validateBrowserControlOverrideSpecifier,
				loadDefaultModule: async () => await import("./server-fXp-lTTj.js"),
				startExportNames: ["startBrowserControlServiceFromConfig", "startBrowserControlServerFromConfig"],
				stopExportNames: ["stopBrowserControlService", "stopBrowserControlServer"]
			});
		},
		stop: async () => {
			const current = handle;
			handle = null;
			if (!current) return;
			await current.stop().catch(() => {});
		}
	};
}
//#endregion
export { createBrowserTool as a, registerBrowserCli as i, browserHandlers as n, handleBrowserGatewayRequest as r, createBrowserPluginService as t };
