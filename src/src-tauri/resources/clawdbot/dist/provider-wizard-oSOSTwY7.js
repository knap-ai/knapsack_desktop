import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import { r as DEFAULT_PROVIDER } from "./defaults-CRz26M83.js";
import { a as resolvePluginSetupProvider } from "./setup-registry-CAkjagL1.js";
import { n as resolvePluginProviders } from "./providers.runtime-h1H6iyrA.js";
import "./model-selection-GlsOqTDm.js";
//#region src/plugins/provider-wizard.ts
const PROVIDER_PLUGIN_CHOICE_PREFIX = "provider-plugin:";
function resolveWizardSetupChoiceId(provider, wizard) {
	const explicit = normalizeOptionalString(wizard.choiceId);
	if (explicit) return explicit;
	const explicitMethodId = normalizeOptionalString(wizard.methodId);
	if (explicitMethodId) return buildProviderPluginMethodChoice(provider.id, explicitMethodId);
	if (provider.auth.length === 1) return provider.id;
	return buildProviderPluginMethodChoice(provider.id, provider.auth[0]?.id ?? "default");
}
function resolveMethodById(provider, methodId) {
	const normalizedMethodId = normalizeOptionalLowercaseString(methodId);
	if (!normalizedMethodId) return provider.auth[0];
	return provider.auth.find((method) => normalizeOptionalLowercaseString(method.id) === normalizedMethodId);
}
function listMethodWizardSetups(provider) {
	return provider.auth.map((method) => method.wizard ? {
		method,
		wizard: method.wizard
	} : null).filter((entry) => Boolean(entry));
}
function buildProviderPluginMethodChoice(providerId, methodId) {
	return `${PROVIDER_PLUGIN_CHOICE_PREFIX}${normalizeOptionalString(providerId) ?? ""}:${normalizeOptionalString(methodId) ?? ""}`;
}
function resolveProviderWizardProviders(params) {
	return resolvePluginProviders({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		mode: "setup"
	});
}
function resolveModelPickerChoiceValue(provider, modelPicker) {
	const explicitMethodId = normalizeOptionalString(modelPicker.methodId);
	if (explicitMethodId) return buildProviderPluginMethodChoice(provider.id, explicitMethodId);
	if (provider.auth.length === 1) return provider.id;
	return buildProviderPluginMethodChoice(provider.id, provider.auth[0]?.id ?? "default");
}
function resolveProviderModelPickerEntries(params) {
	const providers = resolveProviderWizardProviders(params);
	const entries = [];
	for (const provider of providers) {
		const modelPicker = provider.wizard?.modelPicker;
		if (!modelPicker) continue;
		entries.push({
			value: resolveModelPickerChoiceValue(provider, modelPicker),
			label: normalizeOptionalString(modelPicker.label) || `${provider.label} (custom)`,
			hint: normalizeOptionalString(modelPicker.hint)
		});
	}
	return entries;
}
function resolveProviderPluginChoice(params) {
	const choice = normalizeOptionalString(params.choice) ?? "";
	if (!choice) return null;
	if (choice.startsWith("provider-plugin:")) {
		const payload = choice.slice(16);
		const separator = payload.indexOf(":");
		const providerId = separator >= 0 ? payload.slice(0, separator) : payload;
		const methodId = separator >= 0 ? payload.slice(separator + 1) : void 0;
		const provider = params.providers.find((entry) => normalizeProviderId(entry.id) === normalizeProviderId(providerId));
		if (!provider) return null;
		const method = resolveMethodById(provider, methodId);
		return method ? {
			provider,
			method
		} : null;
	}
	for (const provider of params.providers) {
		for (const { method, wizard } of listMethodWizardSetups(provider)) if ((normalizeOptionalString(normalizeOptionalString(wizard.choiceId) || buildProviderPluginMethodChoice(provider.id, method.id)) ?? "") === choice) return {
			provider,
			method,
			wizard
		};
		const setup = provider.wizard?.setup;
		if (setup) {
			if ((normalizeOptionalString(resolveWizardSetupChoiceId(provider, setup)) ?? "") === choice) {
				const method = resolveMethodById(provider, setup.methodId);
				if (method) return {
					provider,
					method,
					wizard: setup
				};
			}
		}
		if (normalizeProviderId(provider.id) === normalizeProviderId(choice) && provider.auth.length > 0) return {
			provider,
			method: provider.auth[0]
		};
	}
	return null;
}
async function runProviderModelSelectedHook(params) {
	const rawModel = params.model.trim();
	if (!rawModel) return;
	const slashIndex = rawModel.indexOf("/");
	const selectedProviderId = slashIndex === -1 ? DEFAULT_PROVIDER : normalizeProviderId(rawModel.slice(0, slashIndex).trim());
	if (!selectedProviderId || slashIndex !== -1 && !rawModel.slice(slashIndex + 1).trim()) return;
	const provider = resolvePluginSetupProvider({
		provider: selectedProviderId,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}) ?? resolveProviderWizardProviders({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).find((entry) => normalizeProviderId(entry.id) === selectedProviderId);
	if (!provider?.onModelSelected) return;
	await provider.onModelSelected({
		config: params.config,
		model: params.model,
		prompter: params.prompter,
		agentDir: params.agentDir,
		workspaceDir: params.workspaceDir
	});
}
//#endregion
export { resolveProviderPluginChoice as n, runProviderModelSelectedHook as r, resolveProviderModelPickerEntries as t };
