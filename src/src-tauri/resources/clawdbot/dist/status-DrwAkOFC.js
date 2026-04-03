import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { o as resolveCompatibilityHostVersion } from "./version-TiEvEN12.js";
import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { g as resolveDefaultAgentWorkspaceDir } from "./workspace-R-NeOkBt.js";
import { S as normalizeOpenClawVersionBase, c as loadConfig } from "./io-DhtVmzAJ.js";
import { s as listImportedRuntimePluginIds } from "./runtime-DZz1f0_h.js";
import { a as normalizePluginsConfig } from "./config-state-zclcq4hc.js";
import { n as withBundledPluginEnablementCompat, t as withBundledPluginAllowlistCompat } from "./bundled-compat-Qt2_tpRE.js";
import "./config-CJQx-9zo.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { r as listImportedBundledPluginFacadeIds } from "./facade-runtime-D_0VC8Qr.js";
import { t as resolveBundledProviderCompatPluginIds } from "./providers-4eDlTtuF.js";
import { n as loadOpenClawPlugins, s as inspectBundleMcpRuntimeSupport } from "./loader-BkOjign1.js";
import { t as createPluginLoaderLogger } from "./logger-D1mGp2bM.js";
import { t as inspectBundleLspRuntimeSupport } from "./bundle-lsp-fPrg3vVN.js";
//#region src/plugins/status.ts
function buildCompatibilityNoticesForInspect(inspect) {
	const warnings = [];
	if (inspect.usesLegacyBeforeAgentStart) warnings.push({
		pluginId: inspect.plugin.id,
		code: "legacy-before-agent-start",
		severity: "warn",
		message: "still uses legacy before_agent_start; keep regression coverage on this plugin, and prefer before_model_resolve/before_prompt_build for new work."
	});
	if (inspect.shape === "hook-only") warnings.push({
		pluginId: inspect.plugin.id,
		code: "hook-only",
		severity: "info",
		message: "is hook-only. This remains a supported compatibility path, but it has not migrated to explicit capability registration yet."
	});
	return warnings;
}
const log = createSubsystemLogger("plugins");
function resolveStatusConfig(config, env) {
	return applyPluginAutoEnable({
		config,
		env: env ?? process.env
	});
}
function resolveReportedPluginVersion(plugin, env) {
	if (plugin.origin !== "bundled") return plugin.version;
	return normalizeOpenClawVersionBase(resolveCompatibilityHostVersion(env)) ?? normalizeOpenClawVersionBase(plugin.version) ?? plugin.version;
}
function buildPluginReport(params, loadModules) {
	const rawConfig = params?.config ?? loadConfig();
	const autoEnabled = resolveStatusConfig(rawConfig, params?.env);
	const config = autoEnabled.config;
	const workspaceDir = params?.workspaceDir ? params.workspaceDir : resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config)) ?? resolveDefaultAgentWorkspaceDir();
	const bundledProviderIds = resolveBundledProviderCompatPluginIds({
		config,
		workspaceDir,
		env: params?.env
	});
	const registry = loadOpenClawPlugins({
		config: withBundledPluginEnablementCompat({
			config: withBundledPluginAllowlistCompat({
				config,
				pluginIds: bundledProviderIds
			}),
			pluginIds: bundledProviderIds
		}),
		activationSourceConfig: rawConfig,
		autoEnabledReasons: autoEnabled.autoEnabledReasons,
		workspaceDir,
		env: params?.env,
		logger: createPluginLoaderLogger(log),
		activate: false,
		cache: false,
		loadModules
	});
	const importedPluginIds = new Set([
		...loadModules ? registry.plugins.filter((plugin) => plugin.status === "loaded" && plugin.format !== "bundle").map((plugin) => plugin.id) : [],
		...listImportedRuntimePluginIds(),
		...listImportedBundledPluginFacadeIds()
	]);
	return {
		workspaceDir,
		...registry,
		plugins: registry.plugins.map((plugin) => ({
			...plugin,
			imported: plugin.format !== "bundle" && importedPluginIds.has(plugin.id),
			version: resolveReportedPluginVersion(plugin, params?.env)
		}))
	};
}
function buildPluginSnapshotReport(params) {
	return buildPluginReport(params, false);
}
function buildPluginDiagnosticsReport(params) {
	return buildPluginReport(params, true);
}
function buildCapabilityEntries(plugin) {
	return [
		{
			kind: "cli-backend",
			ids: plugin.cliBackendIds ?? []
		},
		{
			kind: "text-inference",
			ids: plugin.providerIds
		},
		{
			kind: "speech",
			ids: plugin.speechProviderIds
		},
		{
			kind: "media-understanding",
			ids: plugin.mediaUnderstandingProviderIds
		},
		{
			kind: "image-generation",
			ids: plugin.imageGenerationProviderIds
		},
		{
			kind: "web-search",
			ids: plugin.webSearchProviderIds
		},
		{
			kind: "channel",
			ids: plugin.channelIds
		}
	].filter((entry) => entry.ids.length > 0);
}
function deriveInspectShape(params) {
	if (params.capabilityCount > 1) return "hybrid-capability";
	if (params.capabilityCount === 1) return "plain-capability";
	if (params.typedHookCount + params.customHookCount > 0 && params.toolCount === 0 && params.commandCount === 0 && params.cliCount === 0 && params.serviceCount === 0 && params.gatewayMethodCount === 0 && params.httpRouteCount === 0) return "hook-only";
	return "non-capability";
}
function buildPluginInspectReport(params) {
	const rawConfig = params.config ?? loadConfig();
	const config = resolveStatusConfig(rawConfig, params.env).config;
	const report = params.report ?? buildPluginDiagnosticsReport({
		config: rawConfig,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	const plugin = report.plugins.find((entry) => entry.id === params.id || entry.name === params.id);
	if (!plugin) return null;
	const capabilities = buildCapabilityEntries(plugin);
	const typedHooks = report.typedHooks.filter((entry) => entry.pluginId === plugin.id).map((entry) => ({
		name: entry.hookName,
		priority: entry.priority
	})).toSorted((a, b) => a.name.localeCompare(b.name));
	const customHooks = report.hooks.filter((entry) => entry.pluginId === plugin.id).map((entry) => ({
		name: entry.entry.hook.name,
		events: [...entry.events].toSorted()
	})).toSorted((a, b) => a.name.localeCompare(b.name));
	const tools = report.tools.filter((entry) => entry.pluginId === plugin.id).map((entry) => ({
		names: [...entry.names],
		optional: entry.optional
	}));
	const diagnostics = report.diagnostics.filter((entry) => entry.pluginId === plugin.id);
	const policyEntry = normalizePluginsConfig(config.plugins).entries[plugin.id];
	const capabilityCount = capabilities.length;
	const shape = deriveInspectShape({
		capabilityCount,
		typedHookCount: typedHooks.length,
		customHookCount: customHooks.length,
		toolCount: tools.length,
		commandCount: plugin.commands.length,
		cliCount: plugin.cliCommands.length,
		serviceCount: plugin.services.length,
		gatewayMethodCount: plugin.gatewayMethods.length,
		httpRouteCount: plugin.httpRoutes
	});
	let mcpServers = [];
	if (plugin.format === "bundle" && plugin.bundleFormat && plugin.rootDir) {
		const mcpSupport = inspectBundleMcpRuntimeSupport({
			pluginId: plugin.id,
			rootDir: plugin.rootDir,
			bundleFormat: plugin.bundleFormat
		});
		mcpServers = [...mcpSupport.supportedServerNames.map((name) => ({
			name,
			hasStdioTransport: true
		})), ...mcpSupport.unsupportedServerNames.map((name) => ({
			name,
			hasStdioTransport: false
		}))];
	}
	let lspServers = [];
	if (plugin.format === "bundle" && plugin.bundleFormat && plugin.rootDir) {
		const lspSupport = inspectBundleLspRuntimeSupport({
			pluginId: plugin.id,
			rootDir: plugin.rootDir,
			bundleFormat: plugin.bundleFormat
		});
		lspServers = [...lspSupport.supportedServerNames.map((name) => ({
			name,
			hasStdioTransport: true
		})), ...lspSupport.unsupportedServerNames.map((name) => ({
			name,
			hasStdioTransport: false
		}))];
	}
	const usesLegacyBeforeAgentStart = typedHooks.some((entry) => entry.name === "before_agent_start");
	const compatibility = buildCompatibilityNoticesForInspect({
		plugin,
		shape,
		usesLegacyBeforeAgentStart
	});
	return {
		workspaceDir: report.workspaceDir,
		plugin,
		shape,
		capabilityMode: capabilityCount === 0 ? "none" : capabilityCount === 1 ? "plain" : "hybrid",
		capabilityCount,
		capabilities,
		typedHooks,
		customHooks,
		tools,
		commands: [...plugin.commands],
		cliCommands: [...plugin.cliCommands],
		services: [...plugin.services],
		gatewayMethods: [...plugin.gatewayMethods],
		mcpServers,
		lspServers,
		httpRouteCount: plugin.httpRoutes,
		bundleCapabilities: plugin.bundleCapabilities ?? [],
		diagnostics,
		policy: {
			allowPromptInjection: policyEntry?.hooks?.allowPromptInjection,
			allowModelOverride: policyEntry?.subagent?.allowModelOverride,
			allowedModels: [...policyEntry?.subagent?.allowedModels ?? []],
			hasAllowedModelsConfig: policyEntry?.subagent?.hasAllowedModelsConfig === true
		},
		usesLegacyBeforeAgentStart,
		compatibility
	};
}
function buildAllPluginInspectReports(params) {
	const rawConfig = params?.config ?? loadConfig();
	const report = params?.report ?? buildPluginDiagnosticsReport({
		config: rawConfig,
		workspaceDir: params?.workspaceDir,
		env: params?.env
	});
	return report.plugins.map((plugin) => buildPluginInspectReport({
		id: plugin.id,
		config: rawConfig,
		report
	})).filter((entry) => entry !== null);
}
function buildPluginCompatibilityWarnings(params) {
	return buildPluginCompatibilityNotices(params).map(formatPluginCompatibilityNotice);
}
function buildPluginCompatibilityNotices(params) {
	return buildAllPluginInspectReports(params).flatMap((inspect) => inspect.compatibility);
}
function formatPluginCompatibilityNotice(notice) {
	return `${notice.pluginId} ${notice.message}`;
}
function summarizePluginCompatibility(notices) {
	return {
		noticeCount: notices.length,
		pluginCount: new Set(notices.map((notice) => notice.pluginId)).size
	};
}
//#endregion
export { buildPluginInspectReport as a, summarizePluginCompatibility as c, buildPluginDiagnosticsReport as i, buildPluginCompatibilityNotices as n, buildPluginSnapshotReport as o, buildPluginCompatibilityWarnings as r, formatPluginCompatibilityNotice as s, buildAllPluginInspectReports as t };
