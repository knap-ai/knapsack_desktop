import { bt as ensureModelAllowlistEntry } from "./provider-models-BKjzpTsb.js";
//#region src/commands/auth-choice.default-model.ts
async function applyDefaultModelChoice(params) {
	if (params.setDefaultModel) {
		const next = params.applyDefaultConfig(params.config);
		if (params.noteDefault) await params.prompter.note(`Default model set to ${params.noteDefault}`, "Model configured");
		return { config: next };
	}
	const nextWithModel = ensureModelAllowlistEntry({
		cfg: params.applyProviderConfig(params.config),
		modelRef: params.defaultModel
	});
	await params.noteAgentModel(params.defaultModel);
	return {
		config: nextWithModel,
		agentModelOverride: params.defaultModel
	};
}
//#endregion
//#region src/commands/auth-choice.apply-helpers.ts
function createAuthChoiceAgentModelNoter(params) {
	return async (model) => {
		if (!params.agentId) return;
		await params.prompter.note(`Default model set to ${model} for agent "${params.agentId}".`, "Model configured");
	};
}
function createAuthChoiceModelStateBridge(bindings) {
	return {
		get config() {
			return bindings.getConfig();
		},
		set config(config) {
			bindings.setConfig(config);
		},
		get agentModelOverride() {
			return bindings.getAgentModelOverride();
		},
		set agentModelOverride(model) {
			bindings.setAgentModelOverride(model);
		}
	};
}
function createAuthChoiceDefaultModelApplier(params, state) {
	const noteAgentModel = createAuthChoiceAgentModelNoter(params);
	return async (options) => {
		const applied = await applyDefaultModelChoice({
			config: state.config,
			setDefaultModel: params.setDefaultModel,
			noteAgentModel,
			prompter: params.prompter,
			...options
		});
		state.config = applied.config;
		state.agentModelOverride = applied.agentModelOverride ?? state.agentModelOverride;
	};
}
function createAuthChoiceDefaultModelApplierForMutableState(params, getConfig, setConfig, getAgentModelOverride, setAgentModelOverride) {
	return createAuthChoiceDefaultModelApplier(params, createAuthChoiceModelStateBridge({
		getConfig,
		setConfig,
		getAgentModelOverride,
		setAgentModelOverride
	}));
}
//#endregion
export { createAuthChoiceDefaultModelApplierForMutableState as t };
