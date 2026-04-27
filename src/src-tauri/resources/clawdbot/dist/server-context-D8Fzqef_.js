import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { r as createConfigIO } from "./io-Dv_xNAZB.js";
import { r as getRuntimeConfigSnapshot } from "./runtime-snapshot-C5PRsFS9.js";
import { d as isPrivateNetworkAllowedByPolicy } from "./ssrf-MkDHylX_.js";
import "./text-runtime-B1c54bxG.js";
import "./control-auth-B88kj1mG.js";
import { n as resolveProfile, t as resolveBrowserConfig } from "./config-M802LKai.js";
import { C as resolveCdpReachabilityTimeouts, S as PROFILE_ATTACH_RETRY_TIMEOUT_MS, a as fetchOk, f as redactCdpUrl, h as CDP_JSON_NEW_TIMEOUT_MS, i as fetchJson, l as normalizeCdpHttpBaseForJsonEndpoints, m as withAllowedHostname, n as assertCdpEndpointAllowed, t as appendCdpPath, w as usesFastLoopbackCdpProbeClass, y as CHROME_MCP_ATTACH_READY_WINDOW_MS } from "./cdp.helpers-2643q7gc.js";
import { a as BrowserProfileUnavailableError, c as BrowserTabNotFoundError, d as toBrowserErrorResponse, i as BrowserProfileNotFoundError, l as BrowserTargetAmbiguousError, o as BrowserResetUnsupportedError } from "./errors-zZtFFUsY.js";
import { n as getPwAiModule, r as getBrowserProfileCapabilities, t as resolveTargetIdFromTabs } from "./target-id-fnO4XRxy.js";
import { _ as assertBrowserNavigationAllowed, a as resolveOpenClawUserDataDir, b as requiresInspectableBrowserNavigationRedirectsForUrl, c as formatChromeCdpDiagnostic, d as createTargetViaCdp, g as InvalidBrowserNavigationUrlError, h as resolveBrowserNavigationProxyMode, i as launchOpenClawChrome, n as isChromeCdpReady, o as stopOpenClawChrome, p as normalizeCdpWsUrl, r as isChromeReachable, s as diagnoseChromeCdp, x as withBrowserNavigationPolicy, y as assertBrowserNavigationResultAllowed } from "./chrome-DGcTHilm.js";
import { g as listChromeMcpTabs } from "./chrome-mcp-HnUM7wVx.js";
import { t as movePathToTrash } from "./trash-B6FljgC3.js";
import fs from "node:fs";
//#region extensions/browser/src/browser/cdp-reachability-policy.ts
function withCdpHostnameAllowed(profile, ssrfPolicy) {
	if (!ssrfPolicy || !profile.cdpHost) return ssrfPolicy;
	if (isPrivateNetworkAllowedByPolicy(ssrfPolicy)) return ssrfPolicy;
	return withAllowedHostname(ssrfPolicy, profile.cdpHost);
}
function resolveCdpReachabilityPolicy(profile, ssrfPolicy) {
	if (!getBrowserProfileCapabilities(profile).isRemote && profile.cdpIsLoopback && profile.driver === "openclaw") return;
	return withCdpHostnameAllowed(profile, ssrfPolicy);
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
	const currentUsesLocalManagedLaunch = current.driver === "openclaw" && !current.attachOnly && current.cdpIsLoopback;
	const nextUsesLocalManagedLaunch = next.driver === "openclaw" && !next.attachOnly && next.cdpIsLoopback;
	if (current.cdpUrl !== next.cdpUrl) changed.push("cdpUrl");
	if (current.cdpPort !== next.cdpPort) changed.push("cdpPort");
	if (current.driver !== next.driver) changed.push("driver");
	if (currentUsesLocalManagedLaunch && nextUsesLocalManagedLaunch && current.headless !== next.headless) changed.push("headless");
	if (currentUsesLocalManagedLaunch && nextUsesLocalManagedLaunch && current.executablePath !== next.executablePath) changed.push("executablePath");
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
//#region extensions/browser/src/browser/chrome-mcp.runtime.ts
async function getChromeMcpModule() {
	return await import("./chrome-mcp-B9EglAbe.js");
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
async function closePlaywrightBrowserConnectionForProfile(cdpUrl) {
	try {
		await (await getPwAiModule({ mode: "soft" }))?.closePlaywrightBrowserConnection(cdpUrl ? { cdpUrl } : void 0);
	} catch {}
}
//#endregion
//#region extensions/browser/src/browser/server-context.availability.ts
function createProfileAvailability({ opts, profile, state, getProfileState, setProfileRunning }) {
	const redactedProfileCdpUrl = redactCdpUrl(profile.cdpUrl) ?? profile.cdpUrl;
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
			const { listChromeMcpTabs } = await getChromeMcpModule();
			await listChromeMcpTabs(profile.name, profile.userDataDir);
			return true;
		}
		const { httpTimeoutMs, wsTimeoutMs } = resolveTimeouts(timeoutMs);
		return await isChromeCdpReady(profile.cdpUrl, httpTimeoutMs, wsTimeoutMs, getCdpReachabilityPolicy());
	};
	const isTransportAvailable = async (timeoutMs) => {
		if (capabilities.usesChromeMcp) {
			const { ensureChromeMcpAvailable } = await getChromeMcpModule();
			await ensureChromeMcpAvailable(profile.name, profile.userDataDir, {
				ephemeral: true,
				timeoutMs
			});
			return true;
		}
		return await isReachable(timeoutMs);
	};
	const isHttpReachable = async (timeoutMs) => {
		if (capabilities.usesChromeMcp) return await isTransportAvailable(timeoutMs);
		const { httpTimeoutMs } = resolveTimeouts(timeoutMs);
		return await isChromeReachable(profile.cdpUrl, httpTimeoutMs, getCdpReachabilityPolicy());
	};
	const describeCdpFailure = async (timeoutMs) => {
		const { httpTimeoutMs, wsTimeoutMs } = resolveTimeouts(timeoutMs);
		return formatChromeCdpDiagnostic(await diagnoseChromeCdp(profile.cdpUrl, httpTimeoutMs, wsTimeoutMs, getCdpReachabilityPolicy()));
	};
	const attachRunning = (running) => {
		setProfileRunning(running);
		running.proc.on("exit", () => {
			if (!opts.getState()) return;
			if (getProfileState().running?.pid === running.pid) setProfileRunning(null);
		});
	};
	const formatChromeMcpAttachFailure = (lastError) => {
		const detail = lastError instanceof Error ? ` Last error: ${lastError.message}` : "";
		const message = lastError instanceof Error ? lastError.message : "";
		if (message.includes("DevToolsActivePort") || message.includes("Could not connect to Chrome")) return `Chrome MCP existing-session attach for profile "${profile.name}" could not connect to Chrome. Enable remote debugging in the browser inspect page, keep the browser open, approve the attach prompt, and retry. If you do not need your signed-in browser session, use the managed "openclaw" profile instead.` + detail;
		return `Chrome MCP existing-session attach for profile "${profile.name}" timed out waiting for tabs to become available. Approve the browser attach prompt, keep the browser open, and retry.${detail}`;
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
		if (getBrowserProfileCapabilities(previousProfile).usesChromeMcp) {
			const { closeChromeMcpSession } = await getChromeMcpModule();
			await closeChromeMcpSession(previousProfile.name).catch(() => false);
		}
		await closePlaywrightBrowserConnectionForProfile(previousProfile.cdpUrl);
		if (previousProfile.cdpUrl !== profile.cdpUrl) await closePlaywrightBrowserConnectionForProfile(profile.cdpUrl);
	};
	const waitForCdpReadyAfterLaunch = async () => {
		const deadlineMs = Date.now() + CDP_READY_AFTER_LAUNCH_WINDOW_MS;
		while (Date.now() < deadlineMs) {
			const remainingMs = Math.max(0, deadlineMs - Date.now());
			if (await isReachable(Math.max(75, Math.min(250, remainingMs)))) return;
			await new Promise((r) => setTimeout(r, 100));
		}
		throw new Error(`Chrome CDP websocket for profile "${profile.name}" is not reachable after start. ${await describeCdpFailure(250)}`);
	};
	const waitForChromeMcpReadyAfterAttach = async () => {
		const deadlineMs = Date.now() + CHROME_MCP_ATTACH_READY_WINDOW_MS;
		let lastError;
		while (Date.now() < deadlineMs) {
			try {
				const { listChromeMcpTabs } = await getChromeMcpModule();
				await listChromeMcpTabs(profile.name, profile.userDataDir);
				return;
			} catch (err) {
				lastError = err;
			}
			await new Promise((r) => setTimeout(r, 200));
		}
		throw new BrowserProfileUnavailableError(formatChromeMcpAttachFailure(lastError));
	};
	let inflightEnsureBrowserAvailable = null;
	const ensureBrowserAvailableOnce = async () => {
		await reconcileProfileRuntime();
		if (capabilities.usesChromeMcp) {
			if (profile.userDataDir && !fs.existsSync(profile.userDataDir)) throw new BrowserProfileUnavailableError(`Browser user data directory not found for profile "${profile.name}": ${profile.userDataDir}`);
			const { ensureChromeMcpAvailable } = await getChromeMcpModule();
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
			if (attachOnly || remoteCdp) throw new BrowserProfileUnavailableError(remoteCdp ? `Remote CDP for profile "${profile.name}" is not reachable at ${redactedProfileCdpUrl}.` : `Browser attachOnly is enabled and profile "${profile.name}" is not running.`);
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
			const detail = await describeCdpFailure(PROFILE_ATTACH_RETRY_TIMEOUT_MS);
			throw new BrowserProfileUnavailableError(remoteCdp ? `Remote CDP websocket for profile "${profile.name}" is not reachable. ${detail}` : `Browser attachOnly is enabled and CDP websocket for profile "${profile.name}" is not reachable. ${detail}`);
		}
		if (!profileState.running) {
			const detail = await describeCdpFailure(PROFILE_ATTACH_RETRY_TIMEOUT_MS);
			throw new BrowserProfileUnavailableError(`Port ${profile.cdpPort} is in use for profile "${profile.name}" but not by openclaw. Run action=reset-profile profile=${profile.name} to kill the process. ${detail}`);
		}
		await stopOpenClawChrome(profileState.running);
		setProfileRunning(null);
		attachRunning(await launchOpenClawChrome(current.resolved, profile));
		if (!await isReachable(600)) throw new Error(`Chrome CDP websocket for profile "${profile.name}" is not reachable after restart. ${await describeCdpFailure(600)}`);
	};
	const ensureBrowserAvailable = async () => {
		if (inflightEnsureBrowserAvailable) return inflightEnsureBrowserAvailable;
		inflightEnsureBrowserAvailable = ensureBrowserAvailableOnce().finally(() => {
			inflightEnsureBrowserAvailable = null;
		});
		return inflightEnsureBrowserAvailable;
	};
	const stopRunningBrowser = async () => {
		await reconcileProfileRuntime();
		if (capabilities.usesChromeMcp) {
			const { closeChromeMcpSession } = await getChromeMcpModule();
			return { stopped: await closeChromeMcpSession(profile.name) };
		}
		const profileState = getProfileState();
		if (!profileState.running) {
			const idleStop = resolveIdleProfileStopOutcome(profile);
			if (idleStop.closePlaywright) await closePlaywrightBrowserConnectionForProfile(profile.cdpUrl);
			return { stopped: idleStop.stopped };
		}
		await stopOpenClawChrome(profileState.running);
		setProfileRunning(null);
		return { stopped: true };
	};
	return {
		isHttpReachable,
		isTransportAvailable,
		isReachable,
		ensureBrowserAvailable,
		stopRunningBrowser
	};
}
//#endregion
//#region extensions/browser/src/browser/server-context.reset.ts
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
		if (!chosen) throw new BrowserTabNotFoundError(targetId ? { input: targetId } : void 0);
		profileState.lastTargetId = chosen.targetId;
		return chosen;
	};
	const resolveTargetIdOrThrow = async (targetId) => {
		const resolved = resolveTargetIdFromTabs(targetId, await listTabs());
		if (!resolved.ok) {
			if (resolved.reason === "ambiguous") throw new BrowserTargetAmbiguousError();
			throw new BrowserTabNotFoundError({ input: targetId });
		}
		return resolved.targetId;
	};
	const focusTab = async (targetId) => {
		const resolvedTargetId = await resolveTargetIdOrThrow(targetId);
		if (capabilities.usesChromeMcp) {
			const { focusChromeMcpTab } = await getChromeMcpModule();
			await focusChromeMcpTab(profile.name, resolvedTargetId, profile.userDataDir);
			const profileState = getProfileState();
			profileState.lastTargetId = resolvedTargetId;
			return;
		}
		if (capabilities.usesPersistentPlaywright) {
			const focusPageByTargetIdViaPlaywright = (await getPwAiModule({ mode: "strict" }))?.focusPageByTargetIdViaPlaywright;
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
			const { closeChromeMcpTab } = await getChromeMcpModule();
			await closeChromeMcpTab(profile.name, resolvedTargetId, profile.userDataDir);
			return;
		}
		if (capabilities.usesPersistentPlaywright) {
			const closePageByTargetIdViaPlaywright = (await getPwAiModule({ mode: "strict" }))?.closePageByTargetIdViaPlaywright;
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
const TAB_LABEL_PATTERN = /^[A-Za-z0-9_.:-]{1,64}$/;
function normalizeTabLabel(label) {
	const trimmed = label.trim();
	if (!TAB_LABEL_PATTERN.test(trimmed)) throw new Error("tab label must be 1-64 chars and use only letters, numbers, _, ., :, or -");
	return trimmed;
}
function getTabAliasState(profileState) {
	profileState.tabAliases ??= {
		nextTabNumber: 1,
		byTargetId: {}
	};
	return profileState.tabAliases;
}
function assignTabAlias(params) {
	const aliases = getTabAliasState(params.profileState);
	let entry = aliases.byTargetId[params.tab.targetId];
	if (!entry) {
		entry = { tabId: `t${aliases.nextTabNumber}` };
		aliases.nextTabNumber += 1;
		aliases.byTargetId[params.tab.targetId] = entry;
	}
	if (params.label) {
		const label = normalizeTabLabel(params.label);
		for (const [targetId, current] of Object.entries(aliases.byTargetId)) if (targetId !== params.tab.targetId && current.label === label) delete current.label;
		entry.label = label;
	}
	const labelFields = entry.label ? { label: entry.label } : {};
	return {
		...params.tab,
		suggestedTargetId: entry.label ?? entry.tabId,
		tabId: entry.tabId,
		...labelFields
	};
}
function assignTabAliases(profileState, tabs) {
	const aliases = getTabAliasState(profileState);
	const liveTargetIds = new Set(tabs.map((tab) => tab.targetId));
	for (const targetId of Object.keys(aliases.byTargetId)) if (!liveTargetIds.has(targetId)) delete aliases.byTargetId[targetId];
	return tabs.map((tab) => assignTabAlias({
		profileState,
		tab
	}));
}
function createProfileTabOps({ profile, state, getProfileState }) {
	const cdpHttpBase = normalizeCdpHttpBaseForJsonEndpoints(profile.cdpUrl);
	const capabilities = getBrowserProfileCapabilities(profile);
	const getCdpControlPolicy = () => resolveCdpControlPolicy(profile, state().resolved.ssrfPolicy);
	const getNavigationPolicy = () => withBrowserNavigationPolicy(state().resolved.ssrfPolicy, { browserProxyMode: resolveBrowserNavigationProxyMode({
		resolved: state().resolved,
		profile
	}) });
	const readTabs = async () => {
		if (capabilities.usesChromeMcp) {
			const { listChromeMcpTabs } = await getChromeMcpModule();
			return await listChromeMcpTabs(profile.name, profile.userDataDir);
		}
		if (capabilities.usesPersistentPlaywright) {
			const listPagesViaPlaywright = (await getPwAiModule({ mode: "strict" }))?.listPagesViaPlaywright;
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
	const listTabs = async () => {
		const tabs = await readTabs();
		return assignTabAliases(getProfileState(), tabs);
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
	const openTab = async (url, opts) => {
		const ssrfPolicyOpts = getNavigationPolicy();
		if (capabilities.usesChromeMcp) {
			await assertBrowserNavigationAllowed({
				url,
				...ssrfPolicyOpts
			});
			const { openChromeMcpTab } = await getChromeMcpModule();
			const page = await openChromeMcpTab(profile.name, url, profile.userDataDir);
			const profileState = getProfileState();
			profileState.lastTargetId = page.targetId;
			await assertBrowserNavigationResultAllowed({
				url: page.url,
				...ssrfPolicyOpts
			});
			return assignTabAlias({
				profileState,
				tab: page,
				label: opts?.label
			});
		}
		if (capabilities.usesPersistentPlaywright) {
			const createPageViaPlaywright = (await getPwAiModule({ mode: "strict" }))?.createPageViaPlaywright;
			if (typeof createPageViaPlaywright === "function") {
				const page = await createPageViaPlaywright({
					cdpUrl: profile.cdpUrl,
					url,
					...ssrfPolicyOpts
				});
				const profileState = getProfileState();
				profileState.lastTargetId = page.targetId;
				triggerManagedTabLimit(page.targetId);
				return assignTabAlias({
					profileState,
					label: opts?.label,
					tab: {
						targetId: page.targetId,
						title: page.title,
						url: page.url,
						type: page.type
					}
				});
			}
		}
		if (requiresInspectableBrowserNavigationRedirectsForUrl(url, state().resolved.ssrfPolicy)) throw new InvalidBrowserNavigationUrlError("Navigation blocked: strict browser SSRF policy requires Playwright-backed redirect-hop inspection");
		await assertBrowserNavigationAllowed({
			url,
			...ssrfPolicyOpts
		});
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
					return assignTabAlias({
						profileState,
						tab: found,
						label: opts?.label
					});
				}
				await new Promise((r) => setTimeout(r, 100));
			}
			triggerManagedTabLimit(createdViaCdp);
			return assignTabAlias({
				profileState,
				tab: {
					targetId: createdViaCdp,
					title: "",
					url,
					type: "page"
				},
				label: opts?.label
			});
		}
		const encoded = encodeURIComponent(url);
		const endpointUrl = new URL(appendCdpPath(cdpHttpBase, "/json/new"));
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
		return assignTabAlias({
			profileState,
			label: opts?.label,
			tab: {
				targetId: created.id,
				title: created.title ?? "",
				url: resolvedUrl,
				wsUrl: normalizeWsUrl(created.webSocketDebuggerUrl, profile.cdpUrl),
				type: created.type
			}
		});
	};
	const labelTab = async (targetId, label) => {
		const normalizedLabel = normalizeTabLabel(label);
		const tabs = await listTabs();
		const resolved = resolveTargetIdFromTabs(targetId, tabs);
		if (!resolved.ok) {
			if (resolved.reason === "ambiguous") throw new BrowserTargetAmbiguousError();
			throw new BrowserTabNotFoundError({ input: targetId });
		}
		const tab = tabs.find((candidate) => candidate.targetId === resolved.targetId);
		if (!tab) throw new BrowserTabNotFoundError({ input: targetId });
		return assignTabAlias({
			profileState: getProfileState(),
			tab,
			label: normalizedLabel
		});
	};
	return {
		listTabs,
		openTab,
		labelTab
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
	const { listTabs, openTab, labelTab } = createProfileTabOps({
		profile,
		state,
		getProfileState
	});
	const { ensureBrowserAvailable, isHttpReachable, isTransportAvailable, isReachable, stopRunningBrowser } = createProfileAvailability({
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
		isTransportAvailable,
		isReachable,
		listTabs,
		openTab,
		labelTab,
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
				running = await profileCtx.isTransportAvailable(300);
				if (running) tabCount = (await listChromeMcpTabs(profile.name, profile.userDataDir, { ephemeral: true }).catch(() => [])).filter((t) => t.type === "page").length;
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
		isTransportAvailable: (timeoutMs) => getDefaultContext().isTransportAvailable(timeoutMs),
		isReachable: (timeoutMs) => getDefaultContext().isReachable(timeoutMs),
		listTabs: () => getDefaultContext().listTabs(),
		openTab: (url, opts) => getDefaultContext().openTab(url, opts),
		labelTab: (targetId, label) => getDefaultContext().labelTab(targetId, label),
		focusTab: (targetId) => getDefaultContext().focusTab(targetId),
		closeTab: (targetId) => getDefaultContext().closeTab(targetId),
		stopRunningBrowser: () => getDefaultContext().stopRunningBrowser(),
		resetProfile: () => getDefaultContext().resetProfile(),
		mapTabError
	};
}
//#endregion
export { listKnownProfileNames as n, createBrowserRouteContext as t };
