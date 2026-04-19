import { t as loadPluginManifestRegistry } from "./manifest-registry-Bd3A4lqx.js";
import "./provider-env-vars-Sj-BhOn9.js";
import { a as normalizePluginsConfig, o as resolveEffectiveEnableState } from "./config-state-CcN3bZ9D.js";
//#region src/plugins/provider-auth-choices.ts
const PROVIDER_AUTH_CHOICE_ORIGIN_PRIORITY = {
	config: 0,
	bundled: 1,
	global: 2,
	workspace: 3
};
function resolveProviderAuthChoiceOriginPriority(origin) {
	if (!origin) return Number.MAX_SAFE_INTEGER;
	return PROVIDER_AUTH_CHOICE_ORIGIN_PRIORITY[origin] ?? Number.MAX_SAFE_INTEGER;
}
function toProviderAuthChoiceCandidate(params) {
	const { pluginId, origin, choice } = params;
	return {
		pluginId,
		origin,
		providerId: choice.provider,
		methodId: choice.method,
		choiceId: choice.choiceId,
		choiceLabel: choice.choiceLabel ?? choice.choiceId,
		...choice.choiceHint ? { choiceHint: choice.choiceHint } : {},
		...choice.assistantPriority !== void 0 ? { assistantPriority: choice.assistantPriority } : {},
		...choice.assistantVisibility ? { assistantVisibility: choice.assistantVisibility } : {},
		...choice.deprecatedChoiceIds ? { deprecatedChoiceIds: choice.deprecatedChoiceIds } : {},
		...choice.groupId ? { groupId: choice.groupId } : {},
		...choice.groupLabel ? { groupLabel: choice.groupLabel } : {},
		...choice.groupHint ? { groupHint: choice.groupHint } : {},
		...choice.optionKey ? { optionKey: choice.optionKey } : {},
		...choice.cliFlag ? { cliFlag: choice.cliFlag } : {},
		...choice.cliOption ? { cliOption: choice.cliOption } : {},
		...choice.cliDescription ? { cliDescription: choice.cliDescription } : {},
		...choice.onboardingScopes ? { onboardingScopes: choice.onboardingScopes } : {}
	};
}
function stripChoiceOrigin(choice) {
	const { origin: _origin, ...metadata } = choice;
	return metadata;
}
function resolveManifestProviderAuthChoiceCandidates(params) {
	const registry = loadPluginManifestRegistry({
		config: params?.config,
		workspaceDir: params?.workspaceDir,
		env: params?.env
	});
	const normalizedConfig = normalizePluginsConfig(params?.config?.plugins);
	return registry.plugins.flatMap((plugin) => {
		if (plugin.origin === "workspace" && params?.includeUntrustedWorkspacePlugins === false && !resolveEffectiveEnableState({
			id: plugin.id,
			origin: plugin.origin,
			config: normalizedConfig,
			rootConfig: params?.config
		}).enabled) return [];
		return (plugin.providerAuthChoices ?? []).map((choice) => toProviderAuthChoiceCandidate({
			pluginId: plugin.id,
			origin: plugin.origin,
			choice
		}));
	});
}
function pickPreferredManifestAuthChoice(candidates) {
	let preferred;
	for (const candidate of candidates) {
		if (!preferred) {
			preferred = candidate;
			continue;
		}
		if (resolveProviderAuthChoiceOriginPriority(candidate.origin) < resolveProviderAuthChoiceOriginPriority(preferred.origin)) preferred = candidate;
	}
	return preferred;
}
function resolvePreferredManifestAuthChoicesByChoiceId(candidates) {
	const preferredByChoiceId = /* @__PURE__ */ new Map();
	for (const candidate of candidates) {
		const normalizedChoiceId = candidate.choiceId.trim();
		if (!normalizedChoiceId) continue;
		const existing = preferredByChoiceId.get(normalizedChoiceId);
		if (!existing || resolveProviderAuthChoiceOriginPriority(candidate.origin) < resolveProviderAuthChoiceOriginPriority(existing.origin)) preferredByChoiceId.set(normalizedChoiceId, candidate);
	}
	return [...preferredByChoiceId.values()];
}
function resolveManifestProviderAuthChoices(params) {
	return resolvePreferredManifestAuthChoicesByChoiceId(resolveManifestProviderAuthChoiceCandidates(params)).map(stripChoiceOrigin);
}
function resolveManifestProviderAuthChoice(choiceId, params) {
	const normalized = choiceId.trim();
	if (!normalized) return;
	const preferred = pickPreferredManifestAuthChoice(resolveManifestProviderAuthChoiceCandidates(params).filter((choice) => choice.choiceId === normalized));
	return preferred ? stripChoiceOrigin(preferred) : void 0;
}
function resolveManifestDeprecatedProviderAuthChoice(choiceId, params) {
	const normalized = choiceId.trim();
	if (!normalized) return;
	const preferred = pickPreferredManifestAuthChoice(resolveManifestProviderAuthChoiceCandidates(params).filter((choice) => choice.deprecatedChoiceIds?.includes(normalized)));
	return preferred ? stripChoiceOrigin(preferred) : void 0;
}
function resolveManifestProviderOnboardAuthFlags(params) {
	const preferredByFlag = /* @__PURE__ */ new Map();
	for (const choice of resolveManifestProviderAuthChoiceCandidates(params)) {
		if (!choice.optionKey || !choice.cliFlag || !choice.cliOption) continue;
		const normalizedChoice = {
			...choice,
			optionKey: choice.optionKey,
			cliFlag: choice.cliFlag,
			cliOption: choice.cliOption
		};
		const dedupeKey = `${choice.optionKey}::${choice.cliFlag}`;
		const existing = preferredByFlag.get(dedupeKey);
		if (existing && resolveProviderAuthChoiceOriginPriority(normalizedChoice.origin) >= resolveProviderAuthChoiceOriginPriority(existing.origin)) continue;
		preferredByFlag.set(dedupeKey, normalizedChoice);
	}
	const flags = [];
	for (const choice of preferredByFlag.values()) flags.push({
		optionKey: choice.optionKey,
		authChoice: choice.choiceId,
		cliFlag: choice.cliFlag,
		cliOption: choice.cliOption,
		description: choice.cliDescription ?? choice.choiceLabel
	});
	return flags;
}
//#endregion
//#region src/commands/auth-choice-legacy.ts
function resolveLegacyCliBackendChoice(choice, params) {
	if (!choice.endsWith("-cli")) return;
	return resolveManifestDeprecatedProviderAuthChoice(choice, params);
}
function resolveReplacementLabel(choiceLabel) {
	return choiceLabel.trim() || "the replacement auth choice";
}
function resolveLegacyAuthChoiceAliasesForCli(params) {
	return resolveManifestProviderAuthChoices(params).flatMap((choice) => choice.deprecatedChoiceIds ?? []).filter((choice) => choice.endsWith("-cli")).toSorted((left, right) => left.localeCompare(right));
}
function normalizeLegacyOnboardAuthChoice(authChoice, params) {
	if (authChoice === "oauth") return "setup-token";
	if (typeof authChoice === "string") {
		const deprecatedChoice = resolveLegacyCliBackendChoice(authChoice, params);
		if (deprecatedChoice) return deprecatedChoice.choiceId;
	}
	return authChoice;
}
function isDeprecatedAuthChoice(authChoice, params) {
	return typeof authChoice === "string" && Boolean(resolveLegacyCliBackendChoice(authChoice, params));
}
function resolveDeprecatedAuthChoiceReplacement(authChoice, params) {
	if (typeof authChoice !== "string") return;
	const deprecatedChoice = resolveLegacyCliBackendChoice(authChoice, params);
	if (!deprecatedChoice) return;
	const replacementLabel = resolveReplacementLabel(deprecatedChoice.choiceLabel);
	return {
		normalized: deprecatedChoice.choiceId,
		message: `Auth choice "${authChoice}" is deprecated; using ${replacementLabel} setup instead.`
	};
}
function formatDeprecatedNonInteractiveAuthChoiceError(authChoice, params) {
	const replacement = resolveDeprecatedAuthChoiceReplacement(authChoice, params);
	if (!replacement) return;
	return [`Auth choice "${authChoice}" is deprecated.`, `Use "--auth-choice ${replacement.normalized}".`].join("\n");
}
//#endregion
export { resolveLegacyAuthChoiceAliasesForCli as a, resolveManifestProviderOnboardAuthFlags as c, resolveDeprecatedAuthChoiceReplacement as i, isDeprecatedAuthChoice as n, resolveManifestDeprecatedProviderAuthChoice as o, normalizeLegacyOnboardAuthChoice as r, resolveManifestProviderAuthChoice as s, formatDeprecatedNonInteractiveAuthChoiceError as t };
