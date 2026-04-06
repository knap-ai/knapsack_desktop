import { n as ensureAuthProfileStore } from "../../store-CY-e50gT.js";
import { n as listProfilesForProvider } from "../../profiles-RmR8EAZC.js";
import "../../model-auth-markers-BjPX15EF.js";
import { n as fetchMinimaxUsage } from "../../provider-usage.fetch-M75Vjeyz.js";
import { t as definePluginEntry } from "../../plugin-entry-DA7dUJNL.js";
import "../../provider-auth-rTeK2_Yu.js";
import { t as createProviderApiKeyAuthMethod } from "../../provider-api-key-auth-BF3kHzmf.js";
import { t as buildOauthProviderAuthResult } from "../../provider-auth-result-BhR-PQxr.js";
import "../../provider-auth-api-key-g0GKEM-Y.js";
import "../../provider-usage-CSda3T6F.js";
import { o as isMiniMaxModernModelId, t as MINIMAX_DEFAULT_MODEL_ID } from "../../provider-models-CMMAzTC5.js";
import { n as buildMinimaxProvider, t as buildMinimaxPortalProvider } from "../../provider-catalog-CiDXLzet.js";
import { n as applyMinimaxApiConfigCn, t as applyMinimaxApiConfig } from "../../onboard-CSpunfXc.js";
import "../../api-BdHh35jB.js";
import { n as buildMinimaxPortalImageGenerationProvider, t as buildMinimaxImageGenerationProvider } from "../../image-generation-provider-Ca5RllYs.js";
import { n as minimaxPortalMediaUnderstandingProvider, t as minimaxMediaUnderstandingProvider } from "../../media-understanding-provider-Dbx-TV_a.js";
//#region extensions/minimax/index.ts
const API_PROVIDER_ID = "minimax";
const PORTAL_PROVIDER_ID = "minimax-portal";
const PROVIDER_LABEL = "MiniMax";
const DEFAULT_MODEL = MINIMAX_DEFAULT_MODEL_ID;
const DEFAULT_BASE_URL_CN = "https://api.minimaxi.com/anthropic";
const DEFAULT_BASE_URL_GLOBAL = "https://api.minimax.io/anthropic";
function getDefaultBaseUrl(region) {
	return region === "cn" ? DEFAULT_BASE_URL_CN : DEFAULT_BASE_URL_GLOBAL;
}
function apiModelRef(modelId) {
	return `${API_PROVIDER_ID}/${modelId}`;
}
function portalModelRef(modelId) {
	return `${PORTAL_PROVIDER_ID}/${modelId}`;
}
function buildPortalProviderCatalog(params) {
	return {
		...buildMinimaxPortalProvider(),
		baseUrl: params.baseUrl,
		apiKey: params.apiKey
	};
}
function resolveApiCatalog(ctx) {
	const apiKey = ctx.resolveProviderApiKey(API_PROVIDER_ID).apiKey;
	if (!apiKey) return null;
	return { provider: {
		...buildMinimaxProvider(),
		apiKey
	} };
}
function resolvePortalCatalog(ctx) {
	const explicitProvider = ctx.config.models?.providers?.[PORTAL_PROVIDER_ID];
	const envApiKey = ctx.resolveProviderApiKey(PORTAL_PROVIDER_ID).apiKey;
	const hasProfiles = listProfilesForProvider(ensureAuthProfileStore(ctx.agentDir, { allowKeychainPrompt: false }), PORTAL_PROVIDER_ID).length > 0;
	const explicitApiKey = typeof explicitProvider?.apiKey === "string" ? explicitProvider.apiKey.trim() : void 0;
	const apiKey = envApiKey ?? explicitApiKey ?? (hasProfiles ? "minimax-oauth" : void 0);
	if (!apiKey) return null;
	return { provider: buildPortalProviderCatalog({
		baseUrl: (typeof explicitProvider?.baseUrl === "string" ? explicitProvider.baseUrl.trim() : void 0) || DEFAULT_BASE_URL_GLOBAL,
		apiKey
	}) };
}
function createOAuthHandler(region) {
	const defaultBaseUrl = getDefaultBaseUrl(region);
	const regionLabel = region === "cn" ? "CN" : "Global";
	return async (ctx) => {
		const progress = ctx.prompter.progress(`Starting MiniMax OAuth (${regionLabel})…`);
		try {
			const { loginMiniMaxPortalOAuth } = await import("./oauth.runtime.js");
			const result = await loginMiniMaxPortalOAuth({
				openUrl: ctx.openUrl,
				note: ctx.prompter.note,
				progress,
				region
			});
			progress.stop("MiniMax OAuth complete");
			if (result.notification_message) await ctx.prompter.note(result.notification_message, "MiniMax OAuth");
			const baseUrl = result.resourceUrl || defaultBaseUrl;
			return buildOauthProviderAuthResult({
				providerId: PORTAL_PROVIDER_ID,
				defaultModel: portalModelRef(DEFAULT_MODEL),
				access: result.access,
				refresh: result.refresh,
				expires: result.expires,
				configPatch: {
					models: { providers: { [PORTAL_PROVIDER_ID]: {
						baseUrl,
						models: []
					} } },
					agents: { defaults: { models: {
						[portalModelRef("MiniMax-M2.7")]: { alias: "minimax-m2.7" },
						[portalModelRef("MiniMax-M2.7-highspeed")]: { alias: "minimax-m2.7-highspeed" }
					} } }
				},
				notes: [
					"MiniMax OAuth tokens auto-refresh. Re-run login if refresh fails or access is revoked.",
					`Base URL defaults to ${defaultBaseUrl}. Override models.providers.${PORTAL_PROVIDER_ID}.baseUrl if needed.`,
					...result.notification_message ? [result.notification_message] : []
				]
			});
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			progress.stop(`MiniMax OAuth failed: ${errorMsg}`);
			await ctx.prompter.note("If OAuth fails, verify your MiniMax account has portal access and try again.", "MiniMax OAuth");
			throw err;
		}
	};
}
var minimax_default = definePluginEntry({
	id: API_PROVIDER_ID,
	name: "MiniMax",
	description: "Bundled MiniMax API-key and OAuth provider plugin",
	register(api) {
		api.registerProvider({
			id: API_PROVIDER_ID,
			label: PROVIDER_LABEL,
			docsPath: "/providers/minimax",
			aliases: ["minimax-cn"],
			envVars: ["MINIMAX_API_KEY"],
			resolveReasoningOutputMode: () => "native",
			auth: [createProviderApiKeyAuthMethod({
				providerId: API_PROVIDER_ID,
				methodId: "api-global",
				label: "MiniMax API key (Global)",
				hint: "Global endpoint - api.minimax.io",
				optionKey: "minimaxApiKey",
				flagName: "--minimax-api-key",
				envVar: "MINIMAX_API_KEY",
				promptMessage: "Enter MiniMax API key (sk-api- or sk-cp-)\nhttps://platform.minimax.io/user-center/basic-information/interface-key",
				profileId: "minimax:global",
				allowProfile: false,
				defaultModel: apiModelRef(DEFAULT_MODEL),
				expectedProviders: ["minimax"],
				applyConfig: (cfg) => applyMinimaxApiConfig(cfg),
				wizard: {
					choiceId: "minimax-global-api",
					choiceLabel: "MiniMax API key (Global)",
					choiceHint: "Global endpoint - api.minimax.io",
					groupId: "minimax",
					groupLabel: "MiniMax",
					groupHint: "M2.7 (recommended)"
				}
			}), createProviderApiKeyAuthMethod({
				providerId: API_PROVIDER_ID,
				methodId: "api-cn",
				label: "MiniMax API key (CN)",
				hint: "CN endpoint - api.minimaxi.com",
				optionKey: "minimaxApiKey",
				flagName: "--minimax-api-key",
				envVar: "MINIMAX_API_KEY",
				promptMessage: "Enter MiniMax CN API key (sk-api- or sk-cp-)\nhttps://platform.minimaxi.com/user-center/basic-information/interface-key",
				profileId: "minimax:cn",
				allowProfile: false,
				defaultModel: apiModelRef(DEFAULT_MODEL),
				expectedProviders: ["minimax", "minimax-cn"],
				applyConfig: (cfg) => applyMinimaxApiConfigCn(cfg),
				wizard: {
					choiceId: "minimax-cn-api",
					choiceLabel: "MiniMax API key (CN)",
					choiceHint: "CN endpoint - api.minimaxi.com",
					groupId: "minimax",
					groupLabel: "MiniMax",
					groupHint: "M2.7 (recommended)"
				}
			})],
			catalog: {
				order: "simple",
				run: async (ctx) => resolveApiCatalog(ctx)
			},
			resolveUsageAuth: async (ctx) => {
				const apiKey = ctx.resolveApiKeyFromConfigAndStore({ envDirect: [ctx.env.MINIMAX_CODE_PLAN_KEY, ctx.env.MINIMAX_API_KEY] });
				return apiKey ? { token: apiKey } : null;
			},
			isModernModelRef: ({ modelId }) => isMiniMaxModernModelId(modelId),
			fetchUsageSnapshot: async (ctx) => await fetchMinimaxUsage(ctx.token, ctx.timeoutMs, ctx.fetchFn)
		});
		api.registerMediaUnderstandingProvider(minimaxMediaUnderstandingProvider);
		api.registerMediaUnderstandingProvider(minimaxPortalMediaUnderstandingProvider);
		api.registerProvider({
			id: PORTAL_PROVIDER_ID,
			label: PROVIDER_LABEL,
			docsPath: "/providers/minimax",
			envVars: ["MINIMAX_OAUTH_TOKEN", "MINIMAX_API_KEY"],
			resolveReasoningOutputMode: () => "native",
			catalog: { run: async (ctx) => resolvePortalCatalog(ctx) },
			auth: [{
				id: "oauth",
				label: "MiniMax OAuth (Global)",
				hint: "Global endpoint - api.minimax.io",
				kind: "device_code",
				wizard: {
					choiceId: "minimax-global-oauth",
					choiceLabel: "MiniMax OAuth (Global)",
					choiceHint: "Global endpoint - api.minimax.io",
					groupId: "minimax",
					groupLabel: "MiniMax",
					groupHint: "M2.7 (recommended)"
				},
				run: createOAuthHandler("global")
			}, {
				id: "oauth-cn",
				label: "MiniMax OAuth (CN)",
				hint: "CN endpoint - api.minimaxi.com",
				kind: "device_code",
				wizard: {
					choiceId: "minimax-cn-oauth",
					choiceLabel: "MiniMax OAuth (CN)",
					choiceHint: "CN endpoint - api.minimaxi.com",
					groupId: "minimax",
					groupLabel: "MiniMax",
					groupHint: "M2.7 (recommended)"
				},
				run: createOAuthHandler("cn")
			}],
			isModernModelRef: ({ modelId }) => isMiniMaxModernModelId(modelId)
		});
		api.registerImageGenerationProvider(buildMinimaxImageGenerationProvider());
		api.registerImageGenerationProvider(buildMinimaxPortalImageGenerationProvider());
	}
});
//#endregion
export { minimax_default as default };
