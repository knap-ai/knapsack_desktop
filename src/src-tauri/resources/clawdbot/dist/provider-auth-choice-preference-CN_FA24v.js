import { o as normalizeTokenProviderInput } from "./provider-auth-input-cJfyGWtW.js";
import { n as resolveManifestProviderApiKeyChoice, r as resolveManifestProviderAuthChoice } from "./provider-auth-choices-BMktcfgd.js";
import { r as normalizeLegacyOnboardAuthChoice } from "./auth-choice-legacy-kUSVj66v.js";
import "./auth-choice.apply-helpers-CyRb9Amz.js";
//#region src/commands/auth-choice.apply.api-providers.ts
function normalizeApiKeyTokenProviderAuthChoice(params) {
	if (params.authChoice !== "apiKey" || !params.tokenProvider) return params.authChoice;
	const normalizedTokenProvider = normalizeTokenProviderInput(params.tokenProvider);
	if (!normalizedTokenProvider) return params.authChoice;
	return resolveManifestProviderApiKeyChoice({
		providerId: normalizedTokenProvider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	})?.choiceId ?? params.authChoice;
}
async function applyAuthChoiceApiProviders(_params) {
	return null;
}
//#endregion
//#region src/plugins/provider-auth-choice-preference.ts
function normalizeLegacyAuthChoice(choice, env) {
	return normalizeLegacyOnboardAuthChoice(choice, { env }) ?? choice;
}
async function resolvePreferredProviderForAuthChoice(params) {
	const choice = normalizeLegacyAuthChoice(params.choice, params.env) ?? params.choice;
	const manifestResolved = resolveManifestProviderAuthChoice(choice, params);
	if (manifestResolved) return manifestResolved.providerId;
	const { resolveProviderPluginChoice, resolvePluginProviders } = await import("./provider-auth-choice.runtime-CbjtrFX4.js");
	const pluginResolved = resolveProviderPluginChoice({
		providers: resolvePluginProviders({
			config: params.config,
			workspaceDir: params.workspaceDir,
			env: params.env,
			bundledProviderAllowlistCompat: true,
			bundledProviderVitestCompat: true
		}),
		choice
	});
	if (pluginResolved) return pluginResolved.provider.id;
	if (choice === "custom-api-key") return "custom";
}
//#endregion
export { applyAuthChoiceApiProviders as n, normalizeApiKeyTokenProviderAuthChoice as r, resolvePreferredProviderForAuthChoice as t };
