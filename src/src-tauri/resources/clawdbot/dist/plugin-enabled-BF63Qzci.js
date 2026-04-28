import { a as isSubagentSessionKey, i as isCronSessionKey, n as isAcpSessionKey } from "./session-key-utils-naHBWFyS.js";
import { o as normalizePluginsConfig, s as resolveEffectiveEnableState } from "./config-state-Bw_lAn0M.js";
import { i as getRuntimeConfig } from "./io-CFdEhZuM.js";
import "./routing-C--bwZIc.js";
import "./browser-config-runtime-DzZQEz2T.js";
import { n as resolveBrowserConfig } from "./config-B0K_3bA1.js";
import "./control-auth-C4d-RiVz.js";
import { n as sweepTrackedBrowserTabs } from "./session-tab-registry-C934Hm_3.js";
import { o as stopOpenClawChrome } from "./chrome-D34UDr-8.js";
import { n as getPwAiModule } from "./target-id-BycuV22F.js";
import { t as isPwAiLoaded } from "./pw-ai-state-DQLgq9v_.js";
import { n as listKnownProfileNames, t as createBrowserRouteContext } from "./server-context-BCtsFniv.js";
//#region extensions/browser/src/browser/server-lifecycle.ts
async function ensureExtensionRelayForProfiles(_params) {}
async function stopKnownBrowserProfiles(params) {
	const current = params.getState();
	if (!current) return;
	const ctx = createBrowserRouteContext({
		getState: params.getState,
		refreshConfigFromDisk: true
	});
	try {
		for (const name of listKnownProfileNames(current)) try {
			const runtime = current.profiles.get(name);
			if (runtime?.running) {
				await stopOpenClawChrome(runtime.running);
				runtime.running = null;
				continue;
			}
			await ctx.forProfile(name).stopRunningBrowser();
		} catch {}
	} catch (err) {
		params.onWarn(`openclaw browser stop failed: ${String(err)}`);
	}
}
//#endregion
//#region extensions/browser/src/browser/session-tab-cleanup.ts
const MIN_SWEEP_INTERVAL_MS = 6e4;
function minutesToMs(minutes) {
	return Math.max(0, Math.floor(minutes * 6e4));
}
function isPrimaryTrackedBrowserSessionKey(sessionKey) {
	return !isSubagentSessionKey(sessionKey) && !isCronSessionKey(sessionKey) && !isAcpSessionKey(sessionKey);
}
function resolveBrowserTabCleanupRuntimeConfig() {
	const cfg = getRuntimeConfig();
	return resolveBrowserConfig(cfg.browser, cfg).tabCleanup;
}
async function runTrackedBrowserTabCleanupOnce(params) {
	const cleanup = params?.cleanup ?? resolveBrowserTabCleanupRuntimeConfig();
	if (!cleanup.enabled) return 0;
	return await sweepTrackedBrowserTabs({
		now: params?.now,
		idleMs: minutesToMs(cleanup.idleMinutes),
		maxTabsPerSession: cleanup.maxTabsPerSession,
		sessionFilter: isPrimaryTrackedBrowserSessionKey,
		closeTab: params?.closeTab,
		onWarn: params?.onWarn
	});
}
function startTrackedBrowserTabCleanupTimer(params) {
	let stopped = false;
	let timer = null;
	let running = null;
	const schedule = () => {
		if (stopped) return;
		let sweepMinutes = 5;
		try {
			sweepMinutes = resolveBrowserTabCleanupRuntimeConfig().sweepMinutes;
		} catch (err) {
			params.onWarn(`failed to resolve browser tab cleanup config: ${String(err)}`);
		}
		timer = setTimeout(run, Math.max(MIN_SWEEP_INTERVAL_MS, minutesToMs(sweepMinutes)));
		timer.unref?.();
	};
	const run = () => {
		if (stopped) return;
		if (!running) {
			running = runTrackedBrowserTabCleanupOnce({ onWarn: params.onWarn }).finally(() => {
				running = null;
				schedule();
			});
			return;
		}
		schedule();
	};
	schedule();
	return () => {
		stopped = true;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};
}
//#endregion
//#region extensions/browser/src/browser/runtime-lifecycle.ts
async function createBrowserRuntimeState(params) {
	const state = {
		server: params.server ?? null,
		port: params.port,
		resolved: params.resolved,
		profiles: /* @__PURE__ */ new Map()
	};
	state.stopTrackedTabCleanup = startTrackedBrowserTabCleanupTimer({ onWarn: params.onWarn });
	await ensureExtensionRelayForProfiles({
		resolved: params.resolved,
		onWarn: params.onWarn
	});
	return state;
}
async function stopBrowserRuntime(params) {
	if (!params.current) return;
	params.current.stopTrackedTabCleanup?.();
	await stopKnownBrowserProfiles({
		getState: params.getState,
		onWarn: params.onWarn
	});
	if (params.closeServer && params.current.server) await new Promise((resolve) => {
		params.current?.server?.close(() => resolve());
	});
	params.clearState();
	if (!isPwAiLoaded()) return;
	try {
		await (await getPwAiModule({ mode: "soft" }))?.closePlaywrightBrowserConnection();
	} catch {}
}
//#endregion
//#region extensions/browser/src/plugin-enabled.ts
function isDefaultBrowserPluginEnabled(cfg) {
	return resolveEffectiveEnableState({
		id: "browser",
		origin: "bundled",
		config: normalizePluginsConfig(cfg.plugins),
		rootConfig: cfg,
		enabledByDefault: true
	}).enabled;
}
//#endregion
export { createBrowserRuntimeState as n, stopBrowserRuntime as r, isDefaultBrowserPluginEnabled as t };
