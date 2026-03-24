import { a as resolveOpenClawAgentDir } from "./paths-C4Oy7wjk.js";
import { a as resolveAgentDir, m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-bjWqU22i.js";
import { g as resolveDefaultAgentWorkspaceDir } from "./workspace-D4K6QX9X.js";
import { a as upsertAuthProfile } from "./profiles-COPO-hHI.js";
import { t as applyAuthProfileConfig } from "./provider-auth-helpers-Do3RFvdi.js";
import { n as openUrl, t as isRemoteEnvironment } from "./setup-browser-C8lmlIf9.js";
import { t as createVpsAwareOAuthHandlers } from "./provider-oauth-flow-CcUD5KdK.js";
import { n as mergeConfigPatch, t as applyDefaultModel } from "./provider-auth-choice-helpers-CT6THg0x.js";
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
async function loadPluginProviderRuntime() {
	return import("./provider-auth-choice.runtime-D-pVS7jd.js");
}
async function runProviderPluginAuthMethod(params) {
	const agentId = params.agentId ?? resolveDefaultAgentId(params.config);
	const defaultAgentId = resolveDefaultAgentId(params.config);
	const agentDir = params.agentDir ?? (agentId === defaultAgentId ? resolveOpenClawAgentDir() : resolveAgentDir(params.config, agentId));
	const workspaceDir = params.workspaceDir ?? resolveAgentWorkspaceDir(params.config, agentId) ?? resolveDefaultAgentWorkspaceDir();
	const result = await params.method.run({
		config: params.config,
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
	if (result.configPatch) nextConfig = mergeConfigPatch(nextConfig, result.configPatch);
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
			..."email" in profile.credential && profile.credential.email ? { email: profile.credential.email } : {}
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
	const { resolvePluginProviders, resolveProviderPluginChoice, runProviderModelSelectedHook } = await loadPluginProviderRuntime();
	const resolved = resolveProviderPluginChoice({
		providers: resolvePluginProviders({
			config: params.config,
			workspaceDir,
			bundledProviderAllowlistCompat: true,
			bundledProviderVitestCompat: true
		}),
		choice: params.authChoice
	});
	if (!resolved) return null;
	const applied = await runProviderPluginAuthMethod({
		config: params.config,
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
	let nextConfig = applied.config;
	let agentModelOverride;
	if (applied.defaultModel) {
		if (params.setDefaultModel) {
			nextConfig = applyDefaultModel(nextConfig, applied.defaultModel);
			await runProviderModelSelectedHook({
				config: nextConfig,
				model: applied.defaultModel,
				prompter: params.prompter,
				agentDir: params.agentDir,
				workspaceDir
			});
			await params.prompter.note(`Default model set to ${applied.defaultModel}`, "Model configured");
			return { config: nextConfig };
		}
		nextConfig = restoreConfiguredPrimaryModel(nextConfig, params.config);
		agentModelOverride = applied.defaultModel;
	}
	return {
		config: nextConfig,
		agentModelOverride
	};
}
//#endregion
export { runProviderPluginAuthMethod as n, applyAuthChoiceLoadedPluginProvider as t };
