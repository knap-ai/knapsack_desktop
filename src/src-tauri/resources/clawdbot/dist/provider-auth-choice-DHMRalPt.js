import { t as clearPluginDiscoveryCache } from "./discovery-DmIzxmAL.js";
import { t as sanitizeTerminalText } from "./safe-text-D7y8Lw2W.js";
import { v as resolveDefaultAgentWorkspaceDir } from "./workspace-DiB6mKpP.js";
import { b as resolveAgentWorkspaceDir, x as resolveDefaultAgentId, y as resolveAgentDir } from "./agent-scope-_6dFncNS.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-Df60yWjf.js";
import "./auth-profiles-DFHxywz9.js";
import { i as upsertAuthProfile } from "./profiles-RuCKjoVP.js";
import { t as applyAuthProfileConfig } from "./provider-auth-helpers-BIVX-4NW.js";
import { t as enablePluginInConfig } from "./enable-y339R98P.js";
import { t as isRemoteEnvironment } from "./remote-env-CdsZb06N.js";
import { t as createVpsAwareOAuthHandlers } from "./provider-oauth-flow-BXMq8mCp.js";
import { n as applyProviderAuthConfigPatch, t as applyDefaultModel } from "./provider-auth-choice-helpers-BsVugK5R.js";
import { t as ensureOnboardingPluginInstalled } from "./onboarding-plugin-install-VmGUwJh-.js";
import { n as openUrl } from "./browser-open-KkeOII5_.js";
import { n as resolveProviderInstallCatalogEntry } from "./provider-install-catalog-Dez8CCbZ.js";
//#region src/plugins/provider-auth-choice.ts
function restoreConfiguredPrimaryModel(nextConfig, originalConfig) {
	const originalModel = originalConfig.agents?.defaults?.model;
	const nextAgents = nextConfig.agents;
	const nextDefaults = nextAgents?.defaults;
	if (!nextDefaults) return nextConfig;
	if (originalModel !== void 0) return {
		...nextConfig,
		agents: {
			...nextAgents,
			defaults: {
				...nextDefaults,
				model: originalModel
			}
		}
	};
	const { model: _model, ...restDefaults } = nextDefaults;
	return {
		...nextConfig,
		agents: {
			...nextAgents,
			defaults: restDefaults
		}
	};
}
function resolveConfiguredDefaultModelPrimary(cfg) {
	const model = cfg.agents?.defaults?.model;
	if (typeof model === "string") return model;
	if (model && typeof model === "object" && typeof model.primary === "string") return model.primary;
}
async function noteDefaultModelResult(params) {
	if (params.preserveExistingDefaultModel === true && params.previousPrimary && params.previousPrimary !== params.selectedModel) {
		await params.prompter.note(`Kept existing default model ${params.previousPrimary}; ${params.selectedModel} is available.`, "Model configured");
		return;
	}
	await params.prompter.note(`Default model set to ${params.selectedModel}`, "Model configured");
}
async function applyDefaultModelFromAuthChoice(params) {
	const previousPrimary = resolveConfiguredDefaultModelPrimary(params.config);
	const preservesDifferentPrimary = params.preserveExistingDefaultModel === true && previousPrimary !== void 0 && previousPrimary !== params.selectedModel;
	const nextConfig = applyDefaultModel(params.config, params.selectedModel, { preserveExistingPrimary: params.preserveExistingDefaultModel === true });
	if (!preservesDifferentPrimary) await params.runSelectedModelHook(nextConfig);
	await noteDefaultModelResult({
		previousPrimary,
		selectedModel: params.selectedModel,
		preserveExistingDefaultModel: params.preserveExistingDefaultModel,
		prompter: params.prompter
	});
	return nextConfig;
}
let providerAuthChoiceDeps = { loadPluginProviderRuntime: async () => import("./provider-auth-choice.runtime-q4BLejEP.js") };
async function loadPluginProviderRuntime() {
	return await providerAuthChoiceDeps.loadPluginProviderRuntime();
}
async function runProviderPluginAuthMethod(params) {
	const agentId = params.agentId ?? resolveDefaultAgentId(params.config);
	const defaultAgentId = resolveDefaultAgentId(params.config);
	const agentDir = params.agentDir ?? (agentId === defaultAgentId ? resolveOpenClawAgentDir() : resolveAgentDir(params.config, agentId));
	const workspaceDir = params.workspaceDir ?? resolveAgentWorkspaceDir(params.config, agentId) ?? resolveDefaultAgentWorkspaceDir();
	const result = await params.method.run({
		config: params.config,
		env: params.env,
		agentDir,
		workspaceDir,
		prompter: params.prompter,
		runtime: params.runtime,
		opts: params.opts,
		secretInputMode: params.secretInputMode,
		allowSecretRefPrompt: params.allowSecretRefPrompt,
		isRemote: isRemoteEnvironment(),
		openUrl: async (url) => {
			await openUrl(url);
		},
		oauth: { createVpsAwareHandlers: (opts) => createVpsAwareOAuthHandlers(opts) }
	});
	let nextConfig = params.config;
	if (result.configPatch) nextConfig = applyProviderAuthConfigPatch(nextConfig, result.configPatch, { replaceDefaultModels: result.replaceDefaultModels });
	for (const profile of result.profiles) {
		upsertAuthProfile({
			profileId: profile.profileId,
			credential: profile.credential,
			agentDir
		});
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: profile.profileId,
			provider: profile.credential.provider,
			mode: profile.credential.type === "token" ? "token" : profile.credential.type,
			..."email" in profile.credential && profile.credential.email ? { email: profile.credential.email } : {},
			..."displayName" in profile.credential && profile.credential.displayName ? { displayName: profile.credential.displayName } : {}
		});
	}
	if (params.emitNotes !== false && result.notes && result.notes.length > 0) await params.prompter.note(result.notes.join("\n"), "Provider notes");
	return {
		config: nextConfig,
		defaultModel: result.defaultModel
	};
}
async function applyAuthChoiceLoadedPluginProvider(params) {
	const agentId = params.agentId ?? resolveDefaultAgentId(params.config);
	const workspaceDir = resolveAgentWorkspaceDir(params.config, agentId) ?? resolveDefaultAgentWorkspaceDir();
	let nextConfig = params.config;
	let enabledConfig = params.config;
	const { resolvePluginProviders, resolveProviderPluginChoice, runProviderModelSelectedHook } = await loadPluginProviderRuntime();
	const installCatalogEntry = resolveProviderInstallCatalogEntry(params.authChoice, {
		config: nextConfig,
		workspaceDir,
		env: params.env,
		includeUntrustedWorkspacePlugins: false
	});
	if (installCatalogEntry) {
		const enableResult = enablePluginInConfig(nextConfig, installCatalogEntry.pluginId);
		if (!enableResult.enabled) {
			const safeLabel = sanitizeTerminalText(installCatalogEntry.label);
			await params.prompter.note(`${safeLabel} plugin is disabled (${enableResult.reason ?? "blocked"}).`, safeLabel);
			return { config: nextConfig };
		}
		enabledConfig = enableResult.config;
	}
	let providers = resolvePluginProviders({
		config: enabledConfig,
		workspaceDir,
		env: params.env,
		mode: "setup"
	});
	let resolved = resolveProviderPluginChoice({
		providers,
		choice: params.authChoice
	});
	if (!resolved && installCatalogEntry) {
		const installResult = await ensureOnboardingPluginInstalled({
			cfg: nextConfig,
			entry: {
				pluginId: installCatalogEntry.pluginId,
				label: installCatalogEntry.label,
				install: installCatalogEntry.install
			},
			prompter: params.prompter,
			runtime: params.runtime,
			workspaceDir
		});
		if (!installResult.installed) return {
			config: installResult.cfg,
			retrySelection: true
		};
		nextConfig = installResult.cfg;
		clearPluginDiscoveryCache();
		providers = resolvePluginProviders({
			config: nextConfig,
			workspaceDir,
			env: params.env,
			mode: "setup"
		});
		resolved = resolveProviderPluginChoice({
			providers,
			choice: params.authChoice
		});
	}
	if (!resolved) return nextConfig === params.config ? null : {
		config: nextConfig,
		retrySelection: true
	};
	if (nextConfig === params.config && enabledConfig !== params.config) nextConfig = enabledConfig;
	const applied = await runProviderPluginAuthMethod({
		config: nextConfig,
		env: params.env,
		runtime: params.runtime,
		prompter: params.prompter,
		method: resolved.method,
		agentDir: params.agentDir,
		agentId: params.agentId,
		workspaceDir,
		secretInputMode: params.opts?.secretInputMode,
		allowSecretRefPrompt: false,
		opts: params.opts
	});
	nextConfig = applied.config;
	let agentModelOverride;
	if (applied.defaultModel) {
		const selectedModel = applied.defaultModel;
		if (params.setDefaultModel) {
			nextConfig = await applyDefaultModelFromAuthChoice({
				config: nextConfig,
				selectedModel,
				preserveExistingDefaultModel: params.preserveExistingDefaultModel,
				prompter: params.prompter,
				runSelectedModelHook: async (config) => {
					await runProviderModelSelectedHook({
						config,
						model: selectedModel,
						prompter: params.prompter,
						agentDir: params.agentDir,
						workspaceDir
					});
				}
			});
			return { config: nextConfig };
		}
		nextConfig = restoreConfiguredPrimaryModel(nextConfig, params.config);
		agentModelOverride = selectedModel;
	}
	return {
		config: nextConfig,
		agentModelOverride
	};
}
//#endregion
export { runProviderPluginAuthMethod as n, applyAuthChoiceLoadedPluginProvider as t };
