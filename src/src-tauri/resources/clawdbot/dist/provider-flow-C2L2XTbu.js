import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as resolvePluginProviders } from "./providers.runtime-Qry7Vql_.js";
import { r as resolveProviderWizardOptions, t as resolveProviderModelPickerEntries } from "./provider-wizard-GqRVqhaY.js";
import { t as sortFlowContributionsByLabel } from "./types-BlqjI16Z.js";
//#region src/flows/provider-flow.ts
const DEFAULT_PROVIDER_FLOW_SCOPE = "text-inference";
function includesProviderFlowScope(scopes, scope) {
	return scopes ? scopes.includes(scope) : scope === DEFAULT_PROVIDER_FLOW_SCOPE;
}
function resolveProviderDocsById(params) {
	return new Map(resolvePluginProviders({
		config: params?.config,
		workspaceDir: params?.workspaceDir,
		env: params?.env,
		mode: "setup"
	}).filter((provider) => Boolean(normalizeOptionalString(provider.docsPath))).map((provider) => [provider.id, normalizeOptionalString(provider.docsPath)]));
}
function resolveProviderSetupFlowContributions(params) {
	const scope = params?.scope ?? DEFAULT_PROVIDER_FLOW_SCOPE;
	const docsByProvider = resolveProviderDocsById(params ?? {});
	return sortFlowContributionsByLabel(resolveProviderWizardOptions(params ?? {}).filter((option) => includesProviderFlowScope(option.onboardingScopes, scope)).map((option) => ({
		id: `provider:setup:${option.value}`,
		kind: "provider",
		surface: "setup",
		providerId: option.groupId,
		option: {
			value: option.value,
			label: option.label,
			...option.hint ? { hint: option.hint } : {},
			...option.assistantPriority !== void 0 ? { assistantPriority: option.assistantPriority } : {},
			...option.assistantVisibility ? { assistantVisibility: option.assistantVisibility } : {},
			group: {
				id: option.groupId,
				label: option.groupLabel,
				...option.groupHint ? { hint: option.groupHint } : {}
			},
			...docsByProvider.get(option.groupId) ? { docs: { path: docsByProvider.get(option.groupId) } } : {}
		},
		...option.onboardingScopes ? { onboardingScopes: [...option.onboardingScopes] } : {},
		source: "runtime"
	})));
}
function resolveProviderModelPickerFlowEntries(params) {
	return resolveProviderModelPickerFlowContributions(params).map((contribution) => contribution.option);
}
function resolveProviderModelPickerFlowContributions(params) {
	const docsByProvider = resolveProviderDocsById(params ?? {});
	return sortFlowContributionsByLabel(resolveProviderModelPickerEntries(params ?? {}).map((entry) => {
		const providerId = entry.value.startsWith("provider-plugin:") ? entry.value.slice(16).split(":")[0] : entry.value;
		return {
			id: `provider:model-picker:${entry.value}`,
			kind: "provider",
			surface: "model-picker",
			providerId,
			option: {
				value: entry.value,
				label: entry.label,
				...entry.hint ? { hint: entry.hint } : {},
				...docsByProvider.get(providerId) ? { docs: { path: docsByProvider.get(providerId) } } : {}
			},
			source: "runtime"
		};
	}));
}
//#endregion
export { resolveProviderModelPickerFlowEntries as n, resolveProviderSetupFlowContributions as r, resolveProviderModelPickerFlowContributions as t };
