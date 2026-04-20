import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as CONFIG_DIR } from "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { a as isLoopbackHost } from "./net-lBInRHnX.js";
import { r as ensurePortAvailable } from "./ports-BQYvWPfn.js";
import { t as rawDataToString } from "./ws-BjBhlcWu.js";
import "./text-runtime-DTMxvodz.js";
import "./logging-core-CqXBUxbp.js";
import "./browser-security-runtime-DCYxvSMK.js";
import { s as DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME } from "./utils-DSPbCLVw.js";
import { P as assertBrowserNavigationAllowed, R as withBrowserNavigationPolicy, f as withCdpSocket, g as CHROME_LAUNCH_READY_WINDOW_MS, h as CHROME_BOOTSTRAP_PREFS_TIMEOUT_MS, i as fetchJson, l as openCdpWebSocket, m as CHROME_BOOTSTRAP_EXIT_TIMEOUT_MS, n as assertCdpEndpointAllowed, r as fetchCdpChecked, s as isWebSocketUrl, t as appendCdpPath, v as CHROME_STDERR_HINT_MAX_CHARS, y as CHROME_STOP_TIMEOUT_MS } from "./cdp.helpers-CJUeV0SO.js";
import { r as resolveBrowserExecutableForPlatform } from "./chrome.executables-WqX45Anh.js";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";
//#region extensions/browser/src/browser/url-pattern.ts
function matchBrowserUrlPattern(pattern, url) {
	const trimmedPattern = pattern.trim();
	if (!trimmedPattern) return false;
	if (trimmedPattern === url) return true;
	if (trimmedPattern.includes("*")) {
		const escaped = trimmedPattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
		return new RegExp(`^${escaped.replace(/\*\*/g, ".*").replace(/\*/g, ".*")}$`).test(url);
	}
	return url.includes(trimmedPattern);
}
//#endregion
//#region extensions/browser/src/browser/act-policy.ts
const ACT_MAX_CLICK_DELAY_MS = 5e3;
const ACT_MAX_WAIT_TIME_MS = 3e4;
const ACT_MIN_TIMEOUT_MS = 500;
const ACT_MAX_INTERACTION_TIMEOUT_MS = 6e4;
const ACT_MAX_WAIT_TIMEOUT_MS = 12e4;
const ACT_DEFAULT_INTERACTION_TIMEOUT_MS = 8e3;
const ACT_DEFAULT_WAIT_TIMEOUT_MS = 2e4;
function normalizeActBoundedNonNegativeMs(value, fieldName, maxMs) {
	if (value === void 0) return;
	if (!Number.isFinite(value) || value < 0) throw new Error(`${fieldName} must be >= 0`);
	const normalized = Math.floor(value);
	if (normalized > maxMs) throw new Error(`${fieldName} exceeds maximum of ${maxMs}ms`);
	return normalized;
}
function resolveActInteractionTimeoutMs(timeoutMs) {
	return Math.max(ACT_MIN_TIMEOUT_MS, Math.min(ACT_MAX_INTERACTION_TIMEOUT_MS, typeof timeoutMs === "number" && Number.isFinite(timeoutMs) ? Math.floor(timeoutMs) : ACT_DEFAULT_INTERACTION_TIMEOUT_MS));
}
function resolveActWaitTimeoutMs(timeoutMs) {
	return Math.max(ACT_MIN_TIMEOUT_MS, Math.min(ACT_MAX_WAIT_TIMEOUT_MS, typeof timeoutMs === "number" && Number.isFinite(timeoutMs) ? Math.floor(timeoutMs) : ACT_DEFAULT_WAIT_TIMEOUT_MS));
}
//#endregion
//#region extensions/browser/src/browser/form-fields.ts
const DEFAULT_FILL_FIELD_TYPE = "text";
function normalizeBrowserFormFieldRef(value) {
	return normalizeOptionalString(value) ?? "";
}
function normalizeBrowserFormFieldType(value) {
	return (normalizeOptionalString(value) ?? "") || "text";
}
function normalizeBrowserFormFieldValue(value) {
	return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : void 0;
}
function normalizeBrowserFormField(record) {
	const ref = normalizeBrowserFormFieldRef(record.ref);
	if (!ref) return null;
	const type = normalizeBrowserFormFieldType(record.type);
	const value = normalizeBrowserFormFieldValue(record.value);
	return value === void 0 ? {
		ref,
		type
	} : {
		ref,
		type,
		value
	};
}
//#endregion
//#region extensions/browser/src/browser/cdp.ts
function normalizeCdpWsUrl(wsUrl, cdpUrl) {
	const ws = new URL(wsUrl);
	const cdp = new URL(cdpUrl);
	const isWildcardBind = ws.hostname === "0.0.0.0" || ws.hostname === "[::]";
	if ((isLoopbackHost(ws.hostname) || isWildcardBind) && !isLoopbackHost(cdp.hostname)) {
		ws.hostname = cdp.hostname;
		const cdpPort = cdp.port || (cdp.protocol === "https:" ? "443" : "80");
		if (cdpPort) ws.port = cdpPort;
		ws.protocol = cdp.protocol === "https:" ? "wss:" : "ws:";
	}
	if (cdp.protocol === "https:" && ws.protocol === "ws:") ws.protocol = "wss:";
	if (!ws.username && !ws.password && (cdp.username || cdp.password)) {
		ws.username = cdp.username;
		ws.password = cdp.password;
	}
	for (const [key, value] of cdp.searchParams.entries()) if (!ws.searchParams.has(key)) ws.searchParams.append(key, value);
	return ws.toString();
}
async function captureScreenshot(opts) {
	return await withCdpSocket(opts.wsUrl, async (send) => {
		await send("Page.enable");
		let savedVp;
		if (opts.fullPage) {
			const metrics = await send("Page.getLayoutMetrics");
			const size = metrics?.cssContentSize ?? metrics?.contentSize;
			const contentWidth = size?.width ?? 0;
			const contentHeight = size?.height ?? 0;
			if (contentWidth > 0 && contentHeight > 0) {
				const v = (await send("Runtime.evaluate", {
					expression: "({ w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio, sw: screen.width, sh: screen.height })",
					returnByValue: true
				}))?.result?.value;
				const currentW = v?.w ?? 0;
				const currentH = v?.h ?? 0;
				savedVp = {
					w: currentW,
					h: currentH,
					dpr: v?.dpr ?? 1,
					sw: v?.sw ?? currentW,
					sh: v?.sh ?? currentH
				};
				await send("Emulation.setDeviceMetricsOverride", {
					width: Math.ceil(Math.max(currentW, contentWidth)),
					height: Math.ceil(Math.max(currentH, contentHeight)),
					deviceScaleFactor: savedVp.dpr,
					mobile: false,
					screenWidth: savedVp.sw,
					screenHeight: savedVp.sh
				});
			}
		}
		const format = opts.format ?? "png";
		const quality = format === "jpeg" ? Math.max(0, Math.min(100, Math.round(opts.quality ?? 85))) : void 0;
		try {
			const base64 = (await send("Page.captureScreenshot", {
				format,
				...quality !== void 0 ? { quality } : {},
				captureBeyondViewport: true
			}))?.data;
			if (!base64) throw new Error("Screenshot failed: missing data");
			return Buffer.from(base64, "base64");
		} finally {
			if (savedVp) {
				await send("Emulation.clearDeviceMetricsOverride").catch(() => {});
				try {
					const p = (await send("Runtime.evaluate", {
						expression: "({ w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio })",
						returnByValue: true
					}))?.result?.value;
					if (p?.w !== savedVp.w || p?.h !== savedVp.h || p?.dpr !== savedVp.dpr) await send("Emulation.setDeviceMetricsOverride", {
						width: savedVp.w,
						height: savedVp.h,
						deviceScaleFactor: savedVp.dpr,
						mobile: false,
						screenWidth: savedVp.sw,
						screenHeight: savedVp.sh
					});
				} catch {}
			}
		}
	});
}
async function createTargetViaCdp(opts) {
	await assertBrowserNavigationAllowed({
		url: opts.url,
		...withBrowserNavigationPolicy(opts.ssrfPolicy)
	});
	let wsUrl;
	if (isWebSocketUrl(opts.cdpUrl)) {
		await assertCdpEndpointAllowed(opts.cdpUrl, opts.ssrfPolicy);
		wsUrl = opts.cdpUrl;
	} else {
		const wsUrlRaw = (await fetchJson(appendCdpPath(opts.cdpUrl, "/json/version"), 1500, void 0, opts.ssrfPolicy))?.webSocketDebuggerUrl?.trim() ?? "";
		wsUrl = wsUrlRaw ? normalizeCdpWsUrl(wsUrlRaw, opts.cdpUrl) : "";
		if (!wsUrl) throw new Error("CDP /json/version missing webSocketDebuggerUrl");
		await assertCdpEndpointAllowed(wsUrl, opts.ssrfPolicy);
	}
	return await withCdpSocket(wsUrl, async (send) => {
		const targetId = (await send("Target.createTarget", { url: opts.url }))?.targetId?.trim() ?? "";
		if (!targetId) throw new Error("CDP Target.createTarget returned no targetId");
		return { targetId };
	});
}
function axValue(v) {
	if (!v || typeof v !== "object") return "";
	const value = v.value;
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return "";
}
function formatAriaSnapshot(nodes, limit) {
	const byId = /* @__PURE__ */ new Map();
	for (const n of nodes) if (n.nodeId) byId.set(n.nodeId, n);
	const referenced = /* @__PURE__ */ new Set();
	for (const n of nodes) for (const c of n.childIds ?? []) referenced.add(c);
	const root = nodes.find((n) => n.nodeId && !referenced.has(n.nodeId)) ?? nodes[0];
	if (!root?.nodeId) return [];
	const out = [];
	const stack = [{
		id: root.nodeId,
		depth: 0
	}];
	while (stack.length && out.length < limit) {
		const popped = stack.pop();
		if (!popped) break;
		const { id, depth } = popped;
		const n = byId.get(id);
		if (!n) continue;
		const role = axValue(n.role);
		const name = axValue(n.name);
		const value = axValue(n.value);
		const description = axValue(n.description);
		const ref = `ax${out.length + 1}`;
		out.push({
			ref,
			role: role || "unknown",
			name: name || "",
			...value ? { value } : {},
			...description ? { description } : {},
			...typeof n.backendDOMNodeId === "number" ? { backendDOMNodeId: n.backendDOMNodeId } : {},
			depth
		});
		const children = (n.childIds ?? []).filter((c) => byId.has(c));
		for (let i = children.length - 1; i >= 0; i--) {
			const child = children[i];
			if (child) stack.push({
				id: child,
				depth: depth + 1
			});
		}
	}
	return out;
}
async function snapshotAria(opts) {
	const limit = Math.max(1, Math.min(2e3, Math.floor(opts.limit ?? 500)));
	return await withCdpSocket(opts.wsUrl, async (send) => {
		await send("Accessibility.enable").catch(() => {});
		const res = await send("Accessibility.getFullAXTree");
		return { nodes: formatAriaSnapshot(Array.isArray(res?.nodes) ? res.nodes : [], limit) };
	});
}
//#endregion
//#region extensions/browser/src/browser/snapshot-roles.ts
/**
* Shared ARIA role classification sets used by both the Playwright and Chrome MCP
* snapshot paths. Keep these in sync — divergence causes the two drivers to produce
* different snapshot output for the same page.
*/
/** Roles that represent user-interactive elements and always get a ref. */
const INTERACTIVE_ROLES = new Set([
	"button",
	"checkbox",
	"combobox",
	"link",
	"listbox",
	"menuitem",
	"menuitemcheckbox",
	"menuitemradio",
	"option",
	"radio",
	"searchbox",
	"slider",
	"spinbutton",
	"switch",
	"tab",
	"textbox",
	"treeitem"
]);
/** Roles that carry meaningful content and get a ref when named. */
const CONTENT_ROLES = new Set([
	"article",
	"cell",
	"columnheader",
	"gridcell",
	"heading",
	"listitem",
	"main",
	"navigation",
	"region",
	"rowheader"
]);
/** Structural/container roles — typically skipped in compact mode. */
const STRUCTURAL_ROLES = new Set([
	"application",
	"directory",
	"document",
	"generic",
	"grid",
	"group",
	"ignored",
	"list",
	"menu",
	"menubar",
	"none",
	"presentation",
	"row",
	"rowgroup",
	"table",
	"tablist",
	"toolbar",
	"tree",
	"treegrid"
]);
//#endregion
//#region extensions/browser/src/browser/pw-role-snapshot.ts
function getRoleSnapshotStats(snapshot, refs) {
	const interactive = Object.values(refs).filter((r) => INTERACTIVE_ROLES.has(r.role)).length;
	return {
		lines: snapshot.split("\n").length,
		chars: snapshot.length,
		refs: Object.keys(refs).length,
		interactive
	};
}
function getIndentLevel(line) {
	const match = line.match(/^(\s*)/);
	return match ? Math.floor(match[1].length / 2) : 0;
}
function matchInteractiveSnapshotLine(line, options) {
	const depth = getIndentLevel(line);
	if (options.maxDepth !== void 0 && depth > options.maxDepth) return null;
	const match = line.match(/^(\s*-\s*)(\w+)(?:\s+"([^"]*)")?(.*)$/);
	if (!match) return null;
	const [, , roleRaw, name, suffix] = match;
	if (roleRaw.startsWith("/")) return null;
	return {
		roleRaw,
		role: normalizeLowercaseStringOrEmpty(roleRaw),
		...name ? { name } : {},
		suffix
	};
}
function createRoleNameTracker() {
	const counts = /* @__PURE__ */ new Map();
	const refsByKey = /* @__PURE__ */ new Map();
	return {
		counts,
		refsByKey,
		getKey(role, name) {
			return `${role}:${name ?? ""}`;
		},
		getNextIndex(role, name) {
			const key = this.getKey(role, name);
			const current = counts.get(key) ?? 0;
			counts.set(key, current + 1);
			return current;
		},
		trackRef(role, name, ref) {
			const key = this.getKey(role, name);
			const list = refsByKey.get(key) ?? [];
			list.push(ref);
			refsByKey.set(key, list);
		},
		getDuplicateKeys() {
			const out = /* @__PURE__ */ new Set();
			for (const [key, refs] of refsByKey) if (refs.length > 1) out.add(key);
			return out;
		}
	};
}
function removeNthFromNonDuplicates(refs, tracker) {
	const duplicates = tracker.getDuplicateKeys();
	for (const [ref, data] of Object.entries(refs)) {
		const key = tracker.getKey(data.role, data.name);
		if (!duplicates.has(key)) delete refs[ref]?.nth;
	}
}
function compactTree(tree) {
	const lines = tree.split("\n");
	const result = [];
	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i];
		if (line.includes("[ref=")) {
			result.push(line);
			continue;
		}
		if (line.includes(":") && !line.trimEnd().endsWith(":")) {
			result.push(line);
			continue;
		}
		const currentIndent = getIndentLevel(line);
		let hasRelevantChildren = false;
		for (let j = i + 1; j < lines.length; j += 1) {
			if (getIndentLevel(lines[j]) <= currentIndent) break;
			if (lines[j]?.includes("[ref=")) {
				hasRelevantChildren = true;
				break;
			}
		}
		if (hasRelevantChildren) result.push(line);
	}
	return result.join("\n");
}
function processLine(line, refs, options, tracker, nextRef) {
	const depth = getIndentLevel(line);
	if (options.maxDepth !== void 0 && depth > options.maxDepth) return null;
	const match = line.match(/^(\s*-\s*)(\w+)(?:\s+"([^"]*)")?(.*)$/);
	if (!match) return options.interactive ? null : line;
	const [, prefix, roleRaw, name, suffix] = match;
	if (roleRaw.startsWith("/")) return options.interactive ? null : line;
	const role = normalizeLowercaseStringOrEmpty(roleRaw);
	const isInteractive = INTERACTIVE_ROLES.has(role);
	const isContent = CONTENT_ROLES.has(role);
	const isStructural = STRUCTURAL_ROLES.has(role);
	if (options.interactive && !isInteractive) return null;
	if (options.compact && isStructural && !name) return null;
	if (!(isInteractive || isContent && name)) return line;
	const ref = nextRef();
	const nth = tracker.getNextIndex(role, name);
	tracker.trackRef(role, name, ref);
	refs[ref] = {
		role,
		name,
		nth
	};
	let enhanced = `${prefix}${roleRaw}`;
	if (name) enhanced += ` "${name}"`;
	enhanced += ` [ref=${ref}]`;
	if (nth > 0) enhanced += ` [nth=${nth}]`;
	if (suffix) enhanced += suffix;
	return enhanced;
}
function buildInteractiveSnapshotLines(params) {
	const out = [];
	for (const line of params.lines) {
		const parsed = matchInteractiveSnapshotLine(line, params.options);
		if (!parsed) continue;
		if (!INTERACTIVE_ROLES.has(parsed.role)) continue;
		const resolved = params.resolveRef(parsed);
		if (!resolved?.ref) continue;
		params.recordRef(parsed, resolved.ref, resolved.nth);
		let enhanced = `- ${parsed.roleRaw}`;
		if (parsed.name) enhanced += ` "${parsed.name}"`;
		enhanced += ` [ref=${resolved.ref}]`;
		if ((resolved.nth ?? 0) > 0) enhanced += ` [nth=${resolved.nth}]`;
		if (params.includeSuffix(parsed.suffix)) enhanced += parsed.suffix;
		out.push(enhanced);
	}
	return out;
}
function parseRoleRef(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const normalized = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed.startsWith("ref=") ? trimmed.slice(4) : trimmed;
	return /^e\d+$/.test(normalized) ? normalized : null;
}
function buildRoleSnapshotFromAriaSnapshot(ariaSnapshot, options = {}) {
	const lines = ariaSnapshot.split("\n");
	const refs = {};
	const tracker = createRoleNameTracker();
	let counter = 0;
	const nextRef = () => {
		counter += 1;
		return `e${counter}`;
	};
	if (options.interactive) {
		const result = buildInteractiveSnapshotLines({
			lines,
			options,
			resolveRef: ({ role, name }) => {
				const ref = nextRef();
				const nth = tracker.getNextIndex(role, name);
				tracker.trackRef(role, name, ref);
				return {
					ref,
					nth
				};
			},
			recordRef: ({ role, name }, ref, nth) => {
				refs[ref] = {
					role,
					name,
					nth
				};
			},
			includeSuffix: (suffix) => suffix.includes("[")
		});
		removeNthFromNonDuplicates(refs, tracker);
		return {
			snapshot: result.join("\n") || "(no interactive elements)",
			refs
		};
	}
	const result = [];
	for (const line of lines) {
		const processed = processLine(line, refs, options, tracker, nextRef);
		if (processed !== null) result.push(processed);
	}
	removeNthFromNonDuplicates(refs, tracker);
	const tree = result.join("\n") || "(empty)";
	return {
		snapshot: options.compact ? compactTree(tree) : tree,
		refs
	};
}
function parseAiSnapshotRef(suffix) {
	const match = suffix.match(/\[ref=(e\d+)\]/i);
	return match ? match[1] : null;
}
/**
* Build a role snapshot from Playwright's AI snapshot output while preserving Playwright's own
* aria-ref ids (e.g. ref=e13). This makes the refs self-resolving across calls.
*/
function buildRoleSnapshotFromAiSnapshot(aiSnapshot, options = {}) {
	const lines = aiSnapshot.split("\n");
	const refs = {};
	if (options.interactive) return {
		snapshot: buildInteractiveSnapshotLines({
			lines,
			options,
			resolveRef: ({ suffix }) => {
				const ref = parseAiSnapshotRef(suffix);
				return ref ? { ref } : null;
			},
			recordRef: ({ role, name }, ref) => {
				refs[ref] = {
					role,
					...name ? { name } : {}
				};
			},
			includeSuffix: () => true
		}).join("\n") || "(no interactive elements)",
		refs
	};
	const out = [];
	for (const line of lines) {
		const depth = getIndentLevel(line);
		if (options.maxDepth !== void 0 && depth > options.maxDepth) continue;
		const match = line.match(/^(\s*-\s*)(\w+)(?:\s+"([^"]*)")?(.*)$/);
		if (!match) {
			out.push(line);
			continue;
		}
		const [, , roleRaw, name, suffix] = match;
		if (roleRaw.startsWith("/")) {
			out.push(line);
			continue;
		}
		const role = normalizeLowercaseStringOrEmpty(roleRaw);
		const isStructural = STRUCTURAL_ROLES.has(role);
		if (options.compact && isStructural && !name) continue;
		const ref = parseAiSnapshotRef(suffix);
		if (ref) refs[ref] = {
			role,
			...name ? { name } : {}
		};
		out.push(line);
	}
	const tree = out.join("\n") || "(empty)";
	return {
		snapshot: options.compact ? compactTree(tree) : tree,
		refs
	};
}
//#endregion
//#region extensions/browser/src/browser/chrome.profile-decoration.ts
function decoratedMarkerPath(userDataDir) {
	return path.join(userDataDir, ".openclaw-profile-decorated");
}
function safeReadJson(filePath) {
	try {
		if (!fs.existsSync(filePath)) return null;
		const raw = fs.readFileSync(filePath, "utf-8");
		const parsed = JSON.parse(raw);
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}
function safeWriteJson(filePath, data) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
function setDeep(obj, keys, value) {
	let node = obj;
	for (const key of keys.slice(0, -1)) {
		const next = node[key];
		if (typeof next !== "object" || next === null || Array.isArray(next)) node[key] = {};
		node = node[key];
	}
	node[keys[keys.length - 1] ?? ""] = value;
}
function parseHexRgbToSignedArgbInt(hex) {
	const cleaned = hex.trim().replace(/^#/, "");
	if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
	const argbUnsigned = 255 << 24 | Number.parseInt(cleaned, 16);
	return argbUnsigned > 2147483647 ? argbUnsigned - 4294967296 : argbUnsigned;
}
function isProfileDecorated(userDataDir, desiredName, desiredColorHex) {
	const desiredColorInt = parseHexRgbToSignedArgbInt(desiredColorHex);
	const localStatePath = path.join(userDataDir, "Local State");
	const preferencesPath = path.join(userDataDir, "Default", "Preferences");
	const profile = safeReadJson(localStatePath)?.profile;
	const infoCache = typeof profile === "object" && profile !== null && !Array.isArray(profile) ? profile.info_cache : null;
	const info = typeof infoCache === "object" && infoCache !== null && !Array.isArray(infoCache) && typeof infoCache.Default === "object" && infoCache.Default !== null && !Array.isArray(infoCache.Default) ? infoCache.Default : null;
	const prefs = safeReadJson(preferencesPath);
	const browserTheme = (() => {
		const browser = prefs?.browser;
		const theme = typeof browser === "object" && browser !== null && !Array.isArray(browser) ? browser.theme : null;
		return typeof theme === "object" && theme !== null && !Array.isArray(theme) ? theme : null;
	})();
	const autogeneratedTheme = (() => {
		const autogenerated = prefs?.autogenerated;
		const theme = typeof autogenerated === "object" && autogenerated !== null && !Array.isArray(autogenerated) ? autogenerated.theme : null;
		return typeof theme === "object" && theme !== null && !Array.isArray(theme) ? theme : null;
	})();
	const nameOk = typeof info?.name === "string" ? info.name === desiredName : true;
	if (desiredColorInt == null) return nameOk;
	const localSeedOk = typeof info?.profile_color_seed === "number" ? info.profile_color_seed === desiredColorInt : false;
	const prefOk = typeof browserTheme?.user_color2 === "number" && browserTheme.user_color2 === desiredColorInt || typeof autogeneratedTheme?.color === "number" && autogeneratedTheme.color === desiredColorInt;
	return nameOk && localSeedOk && prefOk;
}
/**
* Best-effort profile decoration (name + lobster-orange). Chrome preference keys
* vary by version; we keep this conservative and idempotent.
*/
function decorateOpenClawProfile(userDataDir, opts) {
	const desiredName = opts?.name ?? "openclaw";
	const desiredColor = (opts?.color ?? "#FF4500").toUpperCase();
	const desiredColorInt = parseHexRgbToSignedArgbInt(desiredColor);
	const localStatePath = path.join(userDataDir, "Local State");
	const preferencesPath = path.join(userDataDir, "Default", "Preferences");
	const localState = safeReadJson(localStatePath) ?? {};
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"name"
	], desiredName);
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"shortcut_name"
	], desiredName);
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"user_name"
	], desiredName);
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"profile_color"
	], desiredColor);
	setDeep(localState, [
		"profile",
		"info_cache",
		"Default",
		"user_color"
	], desiredColor);
	if (desiredColorInt != null) {
		setDeep(localState, [
			"profile",
			"info_cache",
			"Default",
			"profile_color_seed"
		], desiredColorInt);
		setDeep(localState, [
			"profile",
			"info_cache",
			"Default",
			"profile_highlight_color"
		], desiredColorInt);
		setDeep(localState, [
			"profile",
			"info_cache",
			"Default",
			"default_avatar_fill_color"
		], desiredColorInt);
		setDeep(localState, [
			"profile",
			"info_cache",
			"Default",
			"default_avatar_stroke_color"
		], desiredColorInt);
	}
	safeWriteJson(localStatePath, localState);
	const prefs = safeReadJson(preferencesPath) ?? {};
	setDeep(prefs, ["profile", "name"], desiredName);
	setDeep(prefs, ["profile", "profile_color"], desiredColor);
	setDeep(prefs, ["profile", "user_color"], desiredColor);
	if (desiredColorInt != null) {
		setDeep(prefs, [
			"autogenerated",
			"theme",
			"color"
		], desiredColorInt);
		setDeep(prefs, [
			"browser",
			"theme",
			"user_color2"
		], desiredColorInt);
	}
	safeWriteJson(preferencesPath, prefs);
	try {
		fs.writeFileSync(decoratedMarkerPath(userDataDir), `${Date.now()}\n`, "utf-8");
	} catch {}
}
function ensureProfileCleanExit(userDataDir) {
	const preferencesPath = path.join(userDataDir, "Default", "Preferences");
	const prefs = safeReadJson(preferencesPath) ?? {};
	setDeep(prefs, ["exit_type"], "Normal");
	setDeep(prefs, ["exited_cleanly"], true);
	safeWriteJson(preferencesPath, prefs);
}
//#endregion
//#region extensions/browser/src/browser/chrome.ts
const log = createSubsystemLogger("browser").child("chrome");
function exists(filePath) {
	try {
		return fs.existsSync(filePath);
	} catch {
		return false;
	}
}
function resolveBrowserExecutable(resolved) {
	return resolveBrowserExecutableForPlatform(resolved, process.platform);
}
function resolveOpenClawUserDataDir(profileName = DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME) {
	return path.join(CONFIG_DIR, "browser", profileName, "user-data");
}
function cdpUrlForPort(cdpPort) {
	return `http://127.0.0.1:${cdpPort}`;
}
function buildOpenClawChromeLaunchArgs(params) {
	const { resolved, profile, userDataDir } = params;
	const args = [
		`--remote-debugging-port=${profile.cdpPort}`,
		`--user-data-dir=${userDataDir}`,
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-sync",
		"--disable-background-networking",
		"--disable-component-update",
		"--disable-features=Translate,MediaRouter",
		"--disable-session-crashed-bubble",
		"--hide-crash-restore-bubble",
		"--password-store=basic"
	];
	if (resolved.headless) {
		args.push("--headless=new");
		args.push("--disable-gpu");
	}
	if (resolved.noSandbox) {
		args.push("--no-sandbox");
		args.push("--disable-setuid-sandbox");
	}
	if (process.platform === "linux") args.push("--disable-dev-shm-usage");
	if (resolved.extraArgs.length > 0) args.push(...resolved.extraArgs);
	return args;
}
async function canOpenWebSocket(url, timeoutMs) {
	return new Promise((resolve) => {
		const ws = openCdpWebSocket(url, { handshakeTimeoutMs: timeoutMs });
		ws.once("open", () => {
			try {
				ws.close();
			} catch {}
			resolve(true);
		});
		ws.once("error", () => resolve(false));
	});
}
async function isChromeReachable(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	try {
		await assertCdpEndpointAllowed(cdpUrl, ssrfPolicy);
		if (isWebSocketUrl(cdpUrl)) return await canOpenWebSocket(cdpUrl, timeoutMs);
		const version = await fetchChromeVersion(cdpUrl, timeoutMs, ssrfPolicy);
		return Boolean(version);
	} catch {
		return false;
	}
}
async function fetchChromeVersion(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	const ctrl = new AbortController();
	const t = setTimeout(ctrl.abort.bind(ctrl), timeoutMs);
	try {
		const { response, release } = await fetchCdpChecked(appendCdpPath(cdpUrl, "/json/version"), timeoutMs, { signal: ctrl.signal }, ssrfPolicy);
		try {
			const data = await response.json();
			if (!data || typeof data !== "object") return null;
			return data;
		} finally {
			await release();
		}
	} catch {
		return null;
	} finally {
		clearTimeout(t);
	}
}
async function getChromeWebSocketUrl(cdpUrl, timeoutMs = 500, ssrfPolicy) {
	await assertCdpEndpointAllowed(cdpUrl, ssrfPolicy);
	if (isWebSocketUrl(cdpUrl)) return cdpUrl;
	const wsUrl = normalizeOptionalString((await fetchChromeVersion(cdpUrl, timeoutMs, ssrfPolicy))?.webSocketDebuggerUrl) ?? "";
	if (!wsUrl) return null;
	const normalizedWsUrl = normalizeCdpWsUrl(wsUrl, cdpUrl);
	await assertCdpEndpointAllowed(normalizedWsUrl, ssrfPolicy);
	return normalizedWsUrl;
}
async function canRunCdpHealthCommand(wsUrl, timeoutMs = 800) {
	return await new Promise((resolve) => {
		const ws = openCdpWebSocket(wsUrl, { handshakeTimeoutMs: timeoutMs });
		let settled = false;
		const onMessage = (raw) => {
			if (settled) return;
			let parsed = null;
			try {
				parsed = JSON.parse(rawDataToString(raw));
			} catch {
				return;
			}
			if (parsed?.id !== 1) return;
			finish(Boolean(parsed.result && typeof parsed.result === "object"));
		};
		const finish = (value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			ws.off("message", onMessage);
			try {
				ws.close();
			} catch {}
			resolve(value);
		};
		const timer = setTimeout(() => {
			try {
				ws.terminate();
			} catch {}
			finish(false);
		}, Math.max(50, timeoutMs + 25));
		ws.once("open", () => {
			try {
				ws.send(JSON.stringify({
					id: 1,
					method: "Browser.getVersion"
				}));
			} catch {
				finish(false);
			}
		});
		ws.on("message", onMessage);
		ws.once("error", () => {
			finish(false);
		});
		ws.once("close", () => {
			finish(false);
		});
	});
}
async function isChromeCdpReady(cdpUrl, timeoutMs = 500, handshakeTimeoutMs = 800, ssrfPolicy) {
	const wsUrl = await getChromeWebSocketUrl(cdpUrl, timeoutMs, ssrfPolicy).catch(() => null);
	if (!wsUrl) return false;
	return await canRunCdpHealthCommand(wsUrl, handshakeTimeoutMs);
}
async function launchOpenClawChrome(resolved, profile) {
	if (!profile.cdpIsLoopback) throw new Error(`Profile "${profile.name}" is remote; cannot launch local Chrome.`);
	await ensurePortAvailable(profile.cdpPort);
	const exe = resolveBrowserExecutable(resolved);
	if (!exe) throw new Error("No supported browser found (Chrome/Brave/Edge/Chromium on macOS, Linux, or Windows).");
	const userDataDir = resolveOpenClawUserDataDir(profile.name);
	fs.mkdirSync(userDataDir, { recursive: true });
	const needsDecorate = !isProfileDecorated(userDataDir, profile.name, (profile.color ?? "#FF4500").toUpperCase());
	const spawnOnce = () => {
		const args = buildOpenClawChromeLaunchArgs({
			resolved,
			profile,
			userDataDir
		});
		return spawn(exe.path, args, {
			stdio: [
				"ignore",
				"ignore",
				"pipe"
			],
			env: {
				...process.env,
				HOME: os.homedir()
			}
		});
	};
	const startedAt = Date.now();
	const localStatePath = path.join(userDataDir, "Local State");
	const preferencesPath = path.join(userDataDir, "Default", "Preferences");
	if (!exists(localStatePath) || !exists(preferencesPath)) {
		const bootstrap = spawnOnce();
		const deadline = Date.now() + CHROME_BOOTSTRAP_PREFS_TIMEOUT_MS;
		while (Date.now() < deadline) {
			if (exists(localStatePath) && exists(preferencesPath)) break;
			await new Promise((r) => setTimeout(r, 100));
		}
		try {
			bootstrap.kill("SIGTERM");
		} catch {}
		const exitDeadline = Date.now() + CHROME_BOOTSTRAP_EXIT_TIMEOUT_MS;
		while (Date.now() < exitDeadline) {
			if (bootstrap.exitCode != null) break;
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	if (needsDecorate) try {
		decorateOpenClawProfile(userDataDir, {
			name: profile.name,
			color: profile.color
		});
		log.info(`🦞 openclaw browser profile decorated (${profile.color})`);
	} catch (err) {
		log.warn(`openclaw browser profile decoration failed: ${String(err)}`);
	}
	try {
		ensureProfileCleanExit(userDataDir);
	} catch (err) {
		log.warn(`openclaw browser clean-exit prefs failed: ${String(err)}`);
	}
	const proc = spawnOnce();
	const stderrChunks = [];
	const onStderr = (chunk) => {
		stderrChunks.push(chunk);
	};
	proc.stderr?.on("data", onStderr);
	const readyDeadline = Date.now() + CHROME_LAUNCH_READY_WINDOW_MS;
	while (Date.now() < readyDeadline) {
		if (await isChromeReachable(profile.cdpUrl)) break;
		await new Promise((r) => setTimeout(r, 200));
	}
	if (!await isChromeReachable(profile.cdpUrl)) {
		const stderrOutput = normalizeOptionalString(Buffer.concat(stderrChunks).toString("utf8")) ?? "";
		const stderrHint = stderrOutput ? `\nChrome stderr:\n${stderrOutput.slice(0, CHROME_STDERR_HINT_MAX_CHARS)}` : "";
		const sandboxHint = process.platform === "linux" && !resolved.noSandbox ? "\nHint: If running in a container or as root, try setting browser.noSandbox: true in config." : "";
		try {
			proc.kill("SIGKILL");
		} catch {}
		throw new Error(`Failed to start Chrome CDP on port ${profile.cdpPort} for profile "${profile.name}".${sandboxHint}${stderrHint}`);
	}
	proc.stderr?.off("data", onStderr);
	stderrChunks.length = 0;
	const pid = proc.pid ?? -1;
	log.info(`🦞 openclaw browser started (${exe.kind}) profile "${profile.name}" on 127.0.0.1:${profile.cdpPort} (pid ${pid})`);
	return {
		pid,
		exe,
		userDataDir,
		cdpPort: profile.cdpPort,
		startedAt,
		proc
	};
}
async function stopOpenClawChrome(running, timeoutMs = CHROME_STOP_TIMEOUT_MS) {
	const proc = running.proc;
	if (proc.killed) return;
	try {
		proc.kill("SIGTERM");
	} catch {}
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (!proc.exitCode && proc.killed) break;
		if (!await isChromeReachable(cdpUrlForPort(running.cdpPort), 200)) return;
		await new Promise((r) => setTimeout(r, 100));
	}
	try {
		proc.kill("SIGKILL");
	} catch {}
}
//#endregion
export { ACT_MAX_WAIT_TIME_MS as C, matchBrowserUrlPattern as D, resolveActWaitTimeoutMs as E, ACT_MAX_CLICK_DELAY_MS as S, resolveActInteractionTimeoutMs as T, normalizeCdpWsUrl as _, resolveOpenClawUserDataDir as a, normalizeBrowserFormField as b, buildRoleSnapshotFromAriaSnapshot as c, CONTENT_ROLES as d, INTERACTIVE_ROLES as f, formatAriaSnapshot as g, createTargetViaCdp as h, launchOpenClawChrome as i, getRoleSnapshotStats as l, captureScreenshot as m, isChromeCdpReady as n, stopOpenClawChrome as o, STRUCTURAL_ROLES as p, isChromeReachable as r, buildRoleSnapshotFromAiSnapshot as s, getChromeWebSocketUrl as t, parseRoleRef as u, snapshotAria as v, normalizeActBoundedNonNegativeMs as w, normalizeBrowserFormFieldValue as x, DEFAULT_FILL_FIELD_TYPE as y };
