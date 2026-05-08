//#region extensions/google-meet/src/transports/chrome-browser-proxy.ts
function normalizeMeetUrlForReuse(url) {
	if (!url) return;
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "meet.google.com") return;
		const match = parsed.pathname.match(/^\/(new|[a-z]{3}-[a-z]{4}-[a-z]{3})(?:\/)?$/i);
		if (!match?.[1]) return;
		return `https://meet.google.com/${match[1].toLowerCase()}`;
	} catch {
		return;
	}
}
function isSameMeetUrlForReuse(a, b) {
	const normalizedA = normalizeMeetUrlForReuse(a);
	const normalizedB = normalizeMeetUrlForReuse(b);
	return Boolean(normalizedA && normalizedB && normalizedA === normalizedB);
}
function isGoogleMeetNode(node) {
	const commands = Array.isArray(node.commands) ? node.commands : [];
	const caps = Array.isArray(node.caps) ? node.caps : [];
	return node.connected === true && commands.includes("googlemeet.chrome") && (commands.includes("browser.proxy") || caps.includes("browser"));
}
function matchesRequestedNode(node, requested) {
	return [
		node.nodeId,
		node.displayName,
		node.remoteIp
	].some((value) => value === requested);
}
function formatNodeLabel(node) {
	const parts = [
		node.displayName,
		node.nodeId,
		node.remoteIp
	].filter(Boolean);
	return parts.length > 0 ? parts.join(" / ") : "unknown node";
}
function describeNodeUsabilityIssues(node) {
	const commands = Array.isArray(node.commands) ? node.commands : [];
	const caps = Array.isArray(node.caps) ? node.caps : [];
	const issues = [];
	if (node.connected !== true) issues.push("offline");
	if (!commands.includes("googlemeet.chrome")) issues.push("missing googlemeet.chrome");
	if (!commands.includes("browser.proxy") && !caps.includes("browser")) issues.push("missing browser.proxy/browser capability");
	return issues;
}
async function listGoogleMeetNodes(runtime, params) {
	try {
		return params ? await runtime.nodes.list(params) : await runtime.nodes.list();
	} catch (error) {
		throw new Error("Google Meet node inventory unavailable", { cause: error });
	}
}
async function resolveChromeNodeInfo(params) {
	const requested = params.requestedNode?.trim();
	if (requested) {
		const matches = (await listGoogleMeetNodes(params.runtime)).nodes.filter((node) => matchesRequestedNode(node, requested));
		if (matches.length === 1) {
			const [node] = matches;
			if (isGoogleMeetNode(node)) return node;
			throw new Error(`Configured Google Meet node ${requested} is not usable (${formatNodeLabel(node)}): ${describeNodeUsabilityIssues(node).join("; ")}. Start or reinstall \`openclaw node run\` on that Chrome host, approve pairing, and allow googlemeet.chrome plus browser.proxy.`);
		}
		if (matches.length > 1) throw new Error(`Configured Google Meet node ${requested} is ambiguous (${matches.length} matches). Pin chromeNode.node to a unique node id, display name, or remote IP.`);
		throw new Error(`Configured Google Meet node ${requested} was not found. Run \`openclaw nodes status\` and start or approve the Chrome node.`);
	}
	const nodes = (await listGoogleMeetNodes(params.runtime, { connected: true })).nodes.filter(isGoogleMeetNode);
	if (nodes.length === 0) throw new Error("No connected Google Meet-capable node with browser proxy. Run `openclaw node run` on the Chrome host with browser proxy enabled, approve pairing, and allow googlemeet.chrome plus browser.proxy.");
	if (nodes.length === 1) return nodes[0];
	throw new Error("Multiple Google Meet-capable nodes connected. Set plugins.entries.google-meet.config.chromeNode.node.");
}
async function resolveChromeNode(params) {
	const node = await resolveChromeNodeInfo(params);
	if (!node.nodeId) throw new Error("Google Meet node did not include a node id.");
	return node.nodeId;
}
function unwrapNodeInvokePayload(raw) {
	const record = raw && typeof raw === "object" ? raw : {};
	if (typeof record.payloadJSON === "string" && record.payloadJSON.trim()) return JSON.parse(record.payloadJSON);
	if ("payload" in record) return record.payload;
	return raw;
}
function parseBrowserProxyResult(raw) {
	const payload = unwrapNodeInvokePayload(raw);
	const proxy = payload && typeof payload === "object" ? payload : void 0;
	if (!proxy || !("result" in proxy)) throw new Error("Google Meet browser proxy returned an invalid result.");
	return proxy.result;
}
async function callBrowserProxyOnNode(params) {
	return parseBrowserProxyResult(await params.runtime.nodes.invoke({
		nodeId: params.nodeId,
		command: "browser.proxy",
		params: {
			method: params.method,
			path: params.path,
			body: params.body,
			timeoutMs: params.timeoutMs
		},
		timeoutMs: params.timeoutMs + 5e3
	}));
}
function asBrowserTabs(result) {
	const record = result && typeof result === "object" ? result : {};
	return Array.isArray(record.tabs) ? record.tabs : [];
}
function readBrowserTab(result) {
	return result && typeof result === "object" ? result : void 0;
}
//#endregion
//#region extensions/google-meet/src/transports/chrome-create.ts
const GOOGLE_MEET_NEW_URL = "https://meet.google.com/new";
const GOOGLE_MEET_BROWSER_CREATE_TIMEOUT_MS = 6e4;
const GOOGLE_MEET_BROWSER_STEP_TIMEOUT_MS = 1e4;
const GOOGLE_MEET_BROWSER_NAVIGATION_RETRY_MS = 1e3;
const GOOGLE_MEET_BROWSER_POLL_MS = 500;
var GoogleMeetBrowserManualActionError = class extends Error {
	constructor(payload) {
		const prefix = payload.manualActionReason ? `${payload.manualActionReason}: ` : "";
		super(`${prefix}${payload.manualActionMessage}`);
		this.name = "GoogleMeetBrowserManualActionError";
		this.payload = {
			source: "browser",
			error: this.message,
			...payload
		};
	}
};
function isGoogleMeetBrowserManualActionError(error) {
	return error instanceof GoogleMeetBrowserManualActionError;
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function formatBrowserAutomationError(error) {
	if (error instanceof Error) return error.message;
	try {
		return JSON.stringify(error);
	} catch {
		return "unknown error";
	}
}
function isBrowserNavigationInterruption(error) {
	return /execution context was destroyed|navigation|target closed/i.test(formatBrowserAutomationError(error));
}
function isGoogleMeetCreateTab(tab) {
	const url = tab.url ?? "";
	if (/^https:\/\/meet\.google\.com\/(?:new|[a-z]{3}-[a-z]{4}-[a-z]{3})(?:$|[/?#])/i.test(url)) return true;
	return url.startsWith("https://accounts.google.com/") && /sign in|google accounts|meet/i.test(tab.title ?? "");
}
async function findGoogleMeetCreateTab(params) {
	return asBrowserTabs(await callBrowserProxyOnNode({
		runtime: params.runtime,
		nodeId: params.nodeId,
		method: "GET",
		path: "/tabs",
		timeoutMs: params.timeoutMs
	})).find(isGoogleMeetCreateTab);
}
async function focusBrowserTab(params) {
	await callBrowserProxyOnNode({
		runtime: params.runtime,
		nodeId: params.nodeId,
		method: "POST",
		path: "/tabs/focus",
		body: { targetId: params.targetId },
		timeoutMs: params.timeoutMs
	});
}
function readStringArray(value) {
	return Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : void 0;
}
function readBrowserCreateResult(result) {
	const record = result && typeof result === "object" ? result : {};
	const nested = record.result && typeof record.result === "object" ? record.result : record;
	return {
		meetingUri: typeof nested.meetingUri === "string" ? nested.meetingUri : void 0,
		browserUrl: typeof nested.browserUrl === "string" ? nested.browserUrl : void 0,
		browserTitle: typeof nested.browserTitle === "string" ? nested.browserTitle : void 0,
		manualAction: typeof nested.manualAction === "string" ? nested.manualAction : void 0,
		manualActionReason: typeof nested.manualActionReason === "string" ? nested.manualActionReason : void 0,
		notes: readStringArray(nested.notes),
		retryAfterMs: typeof nested.retryAfterMs === "number" && Number.isFinite(nested.retryAfterMs) ? nested.retryAfterMs : void 0
	};
}
const CREATE_MEET_FROM_BROWSER_SCRIPT = `async () => {
  const meetUrlPattern = /^https:\\/\\/meet\\.google\\.com\\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:$|[/?#])/i;
  const text = (node) => (node?.innerText || node?.textContent || "").trim();
  const current = () => location.href;
  const notes = [];
  const findButton = (pattern) =>
    [...document.querySelectorAll("button")].find((button) => {
      const label = [
        button.getAttribute("aria-label"),
        button.getAttribute("data-tooltip"),
        text(button),
      ]
        .filter(Boolean)
        .join(" ");
      return pattern.test(label) && !button.disabled;
    });
  const clickButton = (pattern, note) => {
    const button = findButton(pattern);
    if (!button) {
      return false;
    }
    button.click();
    notes.push(note);
    return true;
  };
  if (!current().startsWith("https://meet.google.com/")) {
    return {
      manualActionReason: "google-login-required",
      manualAction: "Sign in to Google in the OpenClaw browser profile, then retry meeting creation.",
      browserUrl: current(),
      browserTitle: document.title,
      notes,
    };
  }
  const href = current();
  if (meetUrlPattern.test(href)) {
    return { meetingUri: href, browserUrl: href, browserTitle: document.title, notes };
  }
  const pageText = text(document.body);
  if (clickButton(/\\buse microphone\\b/i, "Accepted Meet microphone prompt with browser automation.")) {
    return { browserUrl: href, browserTitle: document.title, notes, retryAfterMs: 1000 };
  }
  if (
    clickButton(
      /continue without microphone/i,
      "Continued through Meet microphone prompt with browser automation.",
    )
  ) {
    return { browserUrl: href, browserTitle: document.title, notes, retryAfterMs: 1000 };
  }
  if (/do you want people to hear you in the meeting/i.test(pageText)) {
    return {
      manualActionReason: "meet-audio-choice-required",
      manualAction: "Meet is showing the microphone choice. Click Use microphone in the OpenClaw browser profile, then retry meeting creation.",
      browserUrl: href,
      browserTitle: document.title,
      notes,
    };
  }
  if (/allow.*(microphone|camera)|blocked.*(microphone|camera)|permission.*(microphone|camera)/i.test(pageText)) {
    return {
      manualActionReason: "meet-permission-required",
      manualAction: "Allow microphone/camera permissions for Meet in the OpenClaw browser profile, then retry meeting creation.",
      browserUrl: href,
      browserTitle: document.title,
      notes,
    };
  }
  if (/couldn't create|unable to create/i.test(pageText)) {
    return {
      manualAction: "Resolve the Google Meet page prompt in the OpenClaw browser profile, then retry meeting creation.",
      browserUrl: href,
      browserTitle: document.title,
      notes,
    };
  }
  if (location.hostname.toLowerCase() === "accounts.google.com" || /use your google account|to continue to google meet|choose an account|sign in to (join|continue)/i.test(pageText)) {
    return {
      manualActionReason: "google-login-required",
      manualAction: "Sign in to Google in the OpenClaw browser profile, then retry meeting creation.",
      browserUrl: href,
      browserTitle: document.title,
      notes,
    };
  }
  return {
    retryAfterMs: 500,
    browserUrl: current(),
    browserTitle: document.title,
    notes,
  };
}`;
async function createMeetWithBrowserProxyOnNode(params) {
	const nodeId = await resolveChromeNode({
		runtime: params.runtime,
		requestedNode: params.config.chromeNode.node
	});
	const timeoutMs = Math.max(GOOGLE_MEET_BROWSER_CREATE_TIMEOUT_MS, params.config.chrome.joinTimeoutMs);
	const stepTimeoutMs = Math.min(timeoutMs, GOOGLE_MEET_BROWSER_STEP_TIMEOUT_MS);
	let tab = await findGoogleMeetCreateTab({
		runtime: params.runtime,
		nodeId,
		timeoutMs: stepTimeoutMs
	});
	if (tab?.targetId) await focusBrowserTab({
		runtime: params.runtime,
		nodeId,
		targetId: tab.targetId,
		timeoutMs: stepTimeoutMs
	});
	else tab = readBrowserTab(await callBrowserProxyOnNode({
		runtime: params.runtime,
		nodeId,
		method: "POST",
		path: "/tabs/open",
		body: { url: GOOGLE_MEET_NEW_URL },
		timeoutMs: stepTimeoutMs
	}));
	const targetId = tab?.targetId;
	if (!targetId) throw new Error("Browser fallback opened Google Meet but did not return a targetId.");
	const notes = /* @__PURE__ */ new Set();
	let lastResult;
	let lastError;
	const deadline = Date.now() + timeoutMs;
	while (Date.now() <= deadline) try {
		const result = readBrowserCreateResult(await callBrowserProxyOnNode({
			runtime: params.runtime,
			nodeId,
			method: "POST",
			path: "/act",
			body: {
				kind: "evaluate",
				targetId,
				fn: CREATE_MEET_FROM_BROWSER_SCRIPT
			},
			timeoutMs: stepTimeoutMs
		}));
		lastResult = result;
		for (const note of result.notes ?? []) notes.add(note);
		if (result.meetingUri) return {
			source: "browser",
			nodeId,
			targetId,
			meetingUri: result.meetingUri,
			browserUrl: result.browserUrl,
			browserTitle: result.browserTitle,
			notes: [...notes]
		};
		if (result.manualAction) throw new GoogleMeetBrowserManualActionError({
			manualActionRequired: true,
			manualActionReason: result.manualActionReason,
			manualActionMessage: result.manualAction,
			browser: {
				nodeId,
				targetId,
				browserUrl: result.browserUrl,
				browserTitle: result.browserTitle,
				notes: [...notes]
			}
		});
		await sleep(result.retryAfterMs ?? GOOGLE_MEET_BROWSER_POLL_MS);
	} catch (error) {
		lastError = error;
		if (!isBrowserNavigationInterruption(error)) throw error;
		await sleep(GOOGLE_MEET_BROWSER_NAVIGATION_RETRY_MS);
	}
	throw new Error(lastResult?.manualAction ?? `Google Meet did not return a meeting URL from the browser create flow before timeout.${lastError ? ` Last browser automation error: ${formatBrowserAutomationError(lastError)}` : ""}`);
}
//#endregion
export { isSameMeetUrlForReuse as a, resolveChromeNode as c, callBrowserProxyOnNode as i, resolveChromeNodeInfo as l, isGoogleMeetBrowserManualActionError as n, normalizeMeetUrlForReuse as o, asBrowserTabs as r, readBrowserTab as s, createMeetWithBrowserProxyOnNode as t };
