import { a as resolveCodexComputerUseConfig, i as resolveCodexAppServerRuntimeOptions } from "./config-T2qWvCZA.js";
import { i as withTimeout, n as getSharedCodexAppServerClient } from "./shared-client-MLSTUxlJ.js";
import { n as describeControlFailure } from "./capabilities-C09uIsnb.js";
//#region extensions/codex/src/app-server/request.ts
async function requestCodexAppServerJson(params) {
	const timeoutMs = params.timeoutMs ?? 6e4;
	return await withTimeout((async () => {
		return await (await getSharedCodexAppServerClient({
			startOptions: params.startOptions,
			timeoutMs,
			authProfileId: params.authProfileId
		})).request(params.method, params.requestParams, { timeoutMs });
	})(), timeoutMs, `codex app-server ${params.method} timed out`);
}
//#endregion
//#region extensions/codex/src/app-server/computer-use.ts
var CodexComputerUseSetupError = class extends Error {
	constructor(status) {
		super(status.message);
		this.name = "CodexComputerUseSetupError";
		this.status = status;
	}
};
const CURATED_MARKETPLACE_POLL_INTERVAL_MS = 2e3;
const COMPUTER_USE_MARKETPLACE_NAME_PRIORITY = [
	"openai-bundled",
	"openai-curated",
	"local"
];
async function readCodexComputerUseStatus(params = {}) {
	const config = resolveComputerUseConfig(params);
	if (!config.enabled) return disabledStatus(config);
	try {
		return await inspectCodexComputerUse({
			...params,
			config,
			installPlugin: false
		});
	} catch (error) {
		return unavailableStatus(config, `Computer Use check failed: ${describeControlFailure(error)}`);
	}
}
async function ensureCodexComputerUse(params = {}) {
	const config = resolveComputerUseConfig(params);
	if (!config.enabled) return disabledStatus(config);
	const status = await inspectCodexComputerUse({
		...params,
		config,
		installPlugin: false
	});
	if (status.ready) return status;
	if (config.autoInstall) {
		const blockedAutoInstallStatus = blockUnsafeAutoInstallStatus(config);
		if (blockedAutoInstallStatus) throw new CodexComputerUseSetupError(blockedAutoInstallStatus);
		const installedStatus = await inspectCodexComputerUse({
			...params,
			config,
			installPlugin: true
		});
		if (!installedStatus.ready) throw new CodexComputerUseSetupError(installedStatus);
		return installedStatus;
	}
	if (!status.ready) throw new CodexComputerUseSetupError(status);
	return status;
}
async function installCodexComputerUse(params = {}) {
	const config = resolveComputerUseConfig({
		...params,
		forceEnable: true,
		overrides: {
			...params.overrides,
			enabled: true,
			autoInstall: true
		}
	});
	const status = await inspectCodexComputerUse({
		...params,
		config,
		installPlugin: true
	});
	if (!status.ready) throw new CodexComputerUseSetupError(status);
	return status;
}
async function inspectCodexComputerUse(params) {
	const request = createComputerUseRequest(params);
	if (params.installPlugin) await request("experimentalFeature/enablement/set", { enablement: { plugins: true } });
	const marketplace = await resolveMarketplaceRef({
		request,
		config: params.config,
		allowAdd: params.installPlugin,
		signal: params.signal
	});
	if (!marketplace.marketplace) return unavailableStatus(params.config, marketplace.message ?? `No Codex marketplace containing ${params.config.pluginName} is registered. Configure computerUse.marketplaceSource or computerUse.marketplacePath, then run /codex computer-use install.`);
	let plugin = await readComputerUsePlugin(request, marketplace.marketplace, params.config.pluginName);
	if (!plugin.summary.installed || !plugin.summary.enabled) {
		if (!params.installPlugin) return statusFromPlugin({
			config: params.config,
			plugin,
			tools: [],
			message: `Computer Use is available but not installed. Run /codex computer-use install or enable computerUse.autoInstall.`
		});
		await request("plugin/install", pluginRequestParams(marketplace.marketplace, params.config.pluginName));
		await reloadMcpServers(request);
		plugin = await readComputerUsePlugin(request, marketplace.marketplace, params.config.pluginName);
	}
	let server = await readMcpServerStatus(request, params.config.mcpServerName);
	if (!server && params.installPlugin) {
		await reloadMcpServers(request);
		server = await readMcpServerStatus(request, params.config.mcpServerName);
	}
	if (!server) return statusFromPlugin({
		config: params.config,
		plugin,
		tools: [],
		message: `Computer Use is installed, but the ${params.config.mcpServerName} MCP server is not available.`
	});
	return statusFromPlugin({
		config: params.config,
		plugin,
		tools: Object.keys(server.tools).toSorted(),
		message: "Computer Use is ready."
	});
}
async function resolveMarketplaceRef(params) {
	let preferredMarketplaceName = params.config.marketplaceName;
	if (params.config.marketplaceSource && params.allowAdd) {
		const added = await params.request("marketplace/add", { source: params.config.marketplaceSource });
		preferredMarketplaceName ??= added.marketplaceName;
	}
	if (params.config.marketplacePath) return { marketplace: preferredMarketplaceName ? {
		name: preferredMarketplaceName,
		path: params.config.marketplacePath
	} : { path: params.config.marketplacePath } };
	let candidates = [];
	const waitUntil = marketplaceDiscoveryWaitUntil(params);
	while (candidates.length === 0) {
		candidates = findComputerUseMarketplaces(await params.request("plugin/list", { cwds: [] }), params.config.pluginName);
		if (candidates.length > 0) break;
		if (Date.now() >= waitUntil) break;
		await delay(Math.min(CURATED_MARKETPLACE_POLL_INTERVAL_MS, waitUntil - Date.now()), params.signal);
	}
	if (preferredMarketplaceName) {
		const preferred = candidates.find((candidate) => candidate.name === preferredMarketplaceName);
		if (preferred) return { marketplace: preferred };
		return { message: `Configured Codex marketplace ${preferredMarketplaceName} was not found or does not contain ${params.config.pluginName}. Run /codex computer-use install with a source or path to install from a new marketplace.` };
	}
	if (candidates.length > 1) {
		const preferred = chooseKnownComputerUseMarketplace(candidates);
		if (preferred) return { marketplace: preferred };
		return { message: `Multiple Codex marketplaces contain ${params.config.pluginName}. Configure computerUse.marketplaceName or computerUse.marketplacePath to choose one.` };
	}
	if (params.config.marketplaceSource && !params.allowAdd && candidates.length === 0) return { message: "Computer Use marketplace source is configured but has not been registered. Run /codex computer-use install to register it." };
	const marketplace = candidates[0];
	return marketplace ? { marketplace } : {};
}
function blockUnsafeAutoInstallStatus(config) {
	if (!config.marketplaceSource && !config.marketplacePath) return;
	return unavailableStatus(config, "Computer Use auto-install only uses marketplaces Codex app-server has already discovered. Run /codex computer-use install to install from a configured marketplace source or path.");
}
function findComputerUseMarketplaces(listed, pluginName) {
	return listed.marketplaces.filter((marketplace) => marketplace.plugins.some((plugin) => plugin.name === pluginName || plugin.id === pluginName || plugin.id === `${pluginName}@${marketplace.name}`)).map((marketplace) => {
		if (marketplace.path) return {
			name: marketplace.name,
			path: marketplace.path
		};
		return {
			name: marketplace.name,
			remoteMarketplaceName: marketplace.name
		};
	});
}
function chooseKnownComputerUseMarketplace(candidates) {
	for (const marketplaceName of COMPUTER_USE_MARKETPLACE_NAME_PRIORITY) {
		const candidate = candidates.find((marketplace) => marketplace.name === marketplaceName);
		if (candidate) return candidate;
	}
}
function marketplaceDiscoveryWaitUntil(params) {
	if (params.allowAdd && !params.config.marketplaceSource && !params.config.marketplacePath && !params.config.marketplaceName) return Date.now() + params.config.marketplaceDiscoveryTimeoutMs;
	return 0;
}
async function delay(ms, signal) {
	if (signal?.aborted) throw abortError(signal);
	await new Promise((resolve, reject) => {
		let timer;
		const onAbort = () => {
			clearTimeout(timer);
			signal?.removeEventListener("abort", onAbort);
			reject(abortError(signal));
		};
		timer = setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, ms);
		signal?.addEventListener("abort", onAbort, { once: true });
	});
}
function abortError(signal) {
	const reason = signal?.reason;
	return reason instanceof Error ? reason : /* @__PURE__ */ new Error("Computer Use setup was aborted.");
}
async function readComputerUsePlugin(request, marketplace, pluginName) {
	return (await request("plugin/read", pluginRequestParams(marketplace, pluginName))).plugin;
}
async function readMcpServerStatus(request, serverName) {
	let cursor;
	do {
		const response = await request("mcpServerStatus/list", {
			cursor,
			limit: 100,
			detail: "toolsAndAuthOnly"
		});
		const found = response.data.find((server) => server.name === serverName);
		if (found) return found;
		cursor = response.nextCursor;
	} while (cursor);
}
async function reloadMcpServers(request) {
	await request("config/mcpServer/reload", void 0);
}
function pluginRequestParams(marketplace, pluginName) {
	return {
		...marketplace.path ? { marketplacePath: marketplace.path } : {},
		...!marketplace.path && marketplace.remoteMarketplaceName ? { remoteMarketplaceName: marketplace.remoteMarketplaceName } : {},
		pluginName
	};
}
function statusFromPlugin(params) {
	return {
		enabled: true,
		ready: params.plugin.summary.installed && params.plugin.summary.enabled && params.tools.length > 0,
		installed: params.plugin.summary.installed,
		pluginEnabled: params.plugin.summary.enabled,
		mcpServerAvailable: params.tools.length > 0,
		pluginName: params.config.pluginName,
		mcpServerName: params.config.mcpServerName,
		marketplaceName: params.plugin.marketplaceName,
		...params.plugin.marketplacePath ? { marketplacePath: params.plugin.marketplacePath } : {},
		tools: params.tools,
		message: params.message
	};
}
function disabledStatus(config) {
	return {
		enabled: false,
		ready: false,
		installed: false,
		pluginEnabled: false,
		mcpServerAvailable: false,
		pluginName: config.pluginName,
		mcpServerName: config.mcpServerName,
		tools: [],
		message: "Computer Use is disabled."
	};
}
function unavailableStatus(config, message) {
	return {
		enabled: true,
		ready: false,
		installed: false,
		pluginEnabled: false,
		mcpServerAvailable: false,
		pluginName: config.pluginName,
		mcpServerName: config.mcpServerName,
		...config.marketplaceName ? { marketplaceName: config.marketplaceName } : {},
		...config.marketplacePath ? { marketplacePath: config.marketplacePath } : {},
		tools: [],
		message
	};
}
function createComputerUseRequest(params) {
	if (params.request) return params.request;
	if (params.client) return async (method, requestParams) => await params.client.request(method, requestParams, {
		timeoutMs: params.timeoutMs,
		signal: params.signal
	});
	const runtime = resolveCodexAppServerRuntimeOptions({ pluginConfig: params.pluginConfig });
	return async (method, requestParams) => await requestCodexAppServerJson({
		method,
		requestParams,
		timeoutMs: params.timeoutMs ?? runtime.requestTimeoutMs,
		startOptions: runtime.start
	});
}
function resolveComputerUseConfig(params) {
	const overrides = params.forceEnable ? {
		...params.overrides,
		enabled: true
	} : params.overrides;
	return resolveCodexComputerUseConfig({
		pluginConfig: params.pluginConfig,
		overrides
	});
}
//#endregion
export { requestCodexAppServerJson as i, installCodexComputerUse as n, readCodexComputerUseStatus as r, ensureCodexComputerUse as t };
