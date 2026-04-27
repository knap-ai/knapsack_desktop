import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { o as normalizePluginsConfig, s as resolveEffectiveEnableState } from "./config-state-UvzNc3si.js";
import { n as resolvePluginProviders } from "./providers.runtime-w64xsk4r.js";
import { r as resolveProviderWizardOptions, t as resolveProviderModelPickerEntries } from "./provider-wizard-BoI6tZRr.js";
import { r as resolveManifestProviderAuthChoices } from "./provider-auth-choices-DUlXFm-t.js";
import { t as resolveProviderInstallCatalogEntries } from "./provider-install-catalog-Dez8CCbZ.js";
import { t as sortFlowContributionsByLabel } from "./types-BCnuVj1E.js";
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
function resolveInstallCatalogProviderSetupFlowContributions(params) {
	const scope = params?.scope ?? DEFAULT_PROVIDER_FLOW_SCOPE;
	const normalizedPluginsConfig = normalizePluginsConfig(params?.config?.plugins);
	return resolveProviderInstallCatalogEntries({
		...params,
		includeUntrustedWorkspacePlugins: false
	}).filter((entry) => includesProviderFlowScope(entry.onboardingScopes, scope) && resolveEffectiveEnableState({
		id: entry.pluginId,
		origin: entry.origin,
		config: normalizedPluginsConfig,
		rootConfig: params?.config,
		enabledByDefault: true
	}).enabled).map((entry) => {
		const groupId = entry.groupId ?? entry.providerId;
		const groupLabel = entry.groupLabel ?? entry.label;
		return Object.assign({
			id: `provider:setup:${entry.choiceId}`,
			kind: `provider`,
			surface: `setup`,
			providerId: entry.providerId,
			pluginId: entry.pluginId,
			option: {
				value: entry.choiceId,
				label: entry.choiceLabel,
				...entry.choiceHint ? { hint: entry.choiceHint } : {},
				...entry.assistantPriority !== void 0 ? { assistantPriority: entry.assistantPriority } : {},
				...entry.assistantVisibility ? { assistantVisibility: entry.assistantVisibility } : {},
				group: {
					id: groupId,
					label: groupLabel,
					...entry.groupHint ? { hint: entry.groupHint } : {}
				}
			}
		}, entry.onboardingScopes ? { onboardingScopes: [...entry.onboardingScopes] } : {}, { source: `install-catalog` });
	});
}
function resolveManifestProviderSetupFlowContributions(params) {
	const scope = params?.scope ?? DEFAULT_PROVIDER_FLOW_SCOPE;
	return resolveManifestProviderAuthChoices({
		...params,
		includeUntrustedWorkspacePlugins: false
	}).filter((choice) => includesProviderFlowScope(choice.onboardingScopes, scope)).map((choice) => {
		const groupId = choice.groupId ?? choice.providerId;
		const groupLabel = choice.groupLabel ?? choice.choiceLabel;
		return Object.assign({
			id: `provider:setup:${choice.choiceId}`,
			kind: `provider`,
			surface: `setup`,
			providerId: choice.providerId,
			pluginId: choice.pluginId,
			option: {
				value: choice.choiceId,
				label: choice.choiceLabel,
				...choice.choiceHint ? { hint: choice.choiceHint } : {},
				...choice.assistantPriority !== void 0 ? { assistantPriority: choice.assistantPriority } : {},
				...choice.assistantVisibility ? { assistantVisibility: choice.assistantVisibility } : {},
				group: {
					id: groupId,
					label: groupLabel,
					...choice.groupHint ? { hint: choice.groupHint } : {}
				}
			}
		}, choice.onboardingScopes ? { onboardingScopes: [...choice.onboardingScopes] } : {}, { source: `manifest` });
	});
}
function resolveProviderSetupFlowContributions(params) {
	const scope = params?.scope ?? DEFAULT_PROVIDER_FLOW_SCOPE;
	const docsByProvider = resolveProviderDocsById(params ?? {});
	const manifestContributions = resolveManifestProviderSetupFlowContributions({
		...params,
		scope
	});
	const seenOptionValues = new Set(manifestContributions.map((contribution) => contribution.option.value));
	const runtimeContributions = resolveProviderWizardOptions(params ?? {}).filter((option) => includesProviderFlowScope(option.onboardingScopes, scope)).filter((option) => !seenOptionValues.has(option.value)).map((option) => Object.assign({
		id: `provider:setup:${option.value}`,
		kind: `provider`,
		surface: `setup`,
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
		}
	}, option.onboardingScopes ? { onboardingScopes: [...option.onboardingScopes] } : {}, { source: `runtime` }));
	for (const contribution of runtimeContributions) seenOptionValues.add(contribution.option.value);
	const installCatalogContributions = resolveInstallCatalogProviderSetupFlowContributions({
		...params,
		scope
	}).filter((contribution) => !seenOptionValues.has(contribution.option.value));
	return sortFlowContributionsByLabel([
		...manifestContributions,
		...runtimeContributions,
		...installCatalogContributions
	]);
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
