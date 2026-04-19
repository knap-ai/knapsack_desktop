import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { t as parseDurationMs } from "./parse-duration-DHL2gXIv.js";
import { n as listProfilesForProvider, o as upsertAuthProfile } from "./profiles-CVErLX2C.js";
import { n as suggestOAuthProfileIdForLegacyDefault } from "./repair-taA0zK8p.js";
import { c as cloneFirstTemplateModel } from "./provider-model-shared-DyDnBaDe.js";
import "./text-runtime-DTMxvodz.js";
import { n as validateAnthropicSetupToken, t as buildTokenProfileId } from "./provider-auth-token-Bu2yYHAT.js";
import { t as applyAuthProfileConfig } from "./provider-auth-helpers-DKL5bJRR.js";
import { t as createProviderApiKeyAuthMethod } from "./provider-api-key-auth-nkL4zxbI.js";
import "./provider-auth-DWLaZig-.js";
import "./cli-runtime-BnYqsyQB.js";
import { a as fetchClaudeUsage } from "./provider-usage-G4no-csD.js";
import { n as readClaudeCliCredentialsForSetup, r as readClaudeCliCredentialsForSetupNonInteractive, t as readClaudeCliCredentialsForRuntime } from "./cli-auth-seam-BwQas59D.js";
import { i as CLAUDE_CLI_DEFAULT_MODEL_REF, r as CLAUDE_CLI_DEFAULT_ALLOWLIST_REFS, t as CLAUDE_CLI_BACKEND_ID } from "./cli-shared-D-OMKlVw.js";
import { t as buildAnthropicCliBackend } from "./cli-backend-Sl9e48XC.js";
import { t as buildAnthropicCliMigrationResult } from "./cli-migration-Bbj2zv_H.js";
import { n as normalizeAnthropicProviderConfig, t as applyAnthropicConfigDefaults } from "./config-defaults-BTfbVwym.js";
import { t as anthropicMediaUnderstandingProvider } from "./media-understanding-provider-7FYbMUkG.js";
import { t as buildReplayPolicy } from "./replay-policy-BVv_FzWw.js";
import { c as wrapAnthropicProviderStream } from "./stream-wrappers-CB3W0s4Y.js";
//#region extensions/anthropic/register.runtime.ts
const PROVIDER_ID = "anthropic";
const DEFAULT_ANTHROPIC_MODEL = "anthropic/claude-opus-4-7";
const ANTHROPIC_OPUS_47_MODEL_ID = "claude-opus-4-7";
const ANTHROPIC_OPUS_47_DOT_MODEL_ID = "claude-opus-4.7";
const ANTHROPIC_OPUS_46_MODEL_ID = "claude-opus-4-6";
const ANTHROPIC_OPUS_46_DOT_MODEL_ID = "claude-opus-4.6";
const ANTHROPIC_OPUS_47_TEMPLATE_MODEL_IDS = [
	ANTHROPIC_OPUS_46_MODEL_ID,
	ANTHROPIC_OPUS_46_DOT_MODEL_ID,
	"claude-opus-4-5",
	"claude-opus-4.5"
];
const ANTHROPIC_OPUS_TEMPLATE_MODEL_IDS = ["claude-opus-4-5", "claude-opus-4.5"];
const ANTHROPIC_SONNET_46_MODEL_ID = "claude-sonnet-4-6";
const ANTHROPIC_SONNET_46_DOT_MODEL_ID = "claude-sonnet-4.6";
const ANTHROPIC_SONNET_TEMPLATE_MODEL_IDS = ["claude-sonnet-4-5", "claude-sonnet-4.5"];
const ANTHROPIC_MODERN_MODEL_PREFIXES = [
	"claude-opus-4-7",
	"claude-opus-4-6",
	"claude-sonnet-4-6",
	"claude-opus-4-5",
	"claude-sonnet-4-5",
	"claude-haiku-4-5"
];
const ANTHROPIC_SETUP_TOKEN_NOTE_LINES = [
	"Anthropic setup-token auth is supported in OpenClaw.",
	"OpenClaw prefers Claude CLI reuse when it is available on the host.",
	"Anthropic staff told us this OpenClaw path is allowed again.",
	`If you want a direct API billing path instead, use ${formatCliCommand("openclaw models auth login --provider anthropic --method api-key --set-default")} or ${formatCliCommand("openclaw models auth login --provider anthropic --method cli --set-default")}.`
];
function normalizeAnthropicSetupTokenInput(value) {
	return value.replaceAll(/\s+/g, "").trim();
}
function resolveAnthropicSetupTokenProfileId(rawProfileId) {
	if (typeof rawProfileId === "string") {
		const trimmed = rawProfileId.trim();
		if (trimmed.length > 0) {
			if (trimmed.startsWith(`${PROVIDER_ID}:`)) return trimmed;
			return buildTokenProfileId({
				provider: PROVIDER_ID,
				name: trimmed
			});
		}
	}
	return `${PROVIDER_ID}:default`;
}
function resolveAnthropicSetupTokenExpiry(rawExpiresIn) {
	if (typeof rawExpiresIn !== "string" || rawExpiresIn.trim().length === 0) return;
	return Date.now() + parseDurationMs(rawExpiresIn.trim(), { defaultUnit: "d" });
}
async function runAnthropicSetupTokenAuth(ctx) {
	const token = (typeof ctx.opts?.token === "string" && ctx.opts.token.trim().length > 0 ? normalizeAnthropicSetupTokenInput(ctx.opts.token) : void 0) ?? normalizeAnthropicSetupTokenInput(await ctx.prompter.text({
		message: "Paste Anthropic setup-token",
		validate: (value) => validateAnthropicSetupToken(normalizeAnthropicSetupTokenInput(value))
	}));
	const tokenError = validateAnthropicSetupToken(token);
	if (tokenError) throw new Error(tokenError);
	const profileId = resolveAnthropicSetupTokenProfileId(ctx.opts?.tokenProfileId);
	const expires = resolveAnthropicSetupTokenExpiry(ctx.opts?.tokenExpiresIn);
	return {
		profiles: [{
			profileId,
			credential: {
				type: "token",
				provider: PROVIDER_ID,
				token,
				...expires ? { expires } : {}
			}
		}],
		defaultModel: DEFAULT_ANTHROPIC_MODEL,
		notes: [...ANTHROPIC_SETUP_TOKEN_NOTE_LINES]
	};
}
async function runAnthropicSetupTokenNonInteractive(ctx) {
	const rawToken = typeof ctx.opts.token === "string" ? normalizeAnthropicSetupTokenInput(ctx.opts.token) : "";
	const tokenError = validateAnthropicSetupToken(rawToken);
	if (tokenError) {
		ctx.runtime.error(["Anthropic setup-token auth requires --token with a valid setup-token.", tokenError].join("\n"));
		ctx.runtime.exit(1);
		return null;
	}
	const profileId = resolveAnthropicSetupTokenProfileId(ctx.opts.tokenProfileId);
	const expires = resolveAnthropicSetupTokenExpiry(ctx.opts.tokenExpiresIn);
	upsertAuthProfile({
		profileId,
		credential: {
			type: "token",
			provider: PROVIDER_ID,
			token: rawToken,
			...expires ? { expires } : {}
		},
		agentDir: ctx.agentDir
	});
	ctx.runtime.log(ANTHROPIC_SETUP_TOKEN_NOTE_LINES[0]);
	ctx.runtime.log(ANTHROPIC_SETUP_TOKEN_NOTE_LINES[1]);
	const withProfile = applyAuthProfileConfig(ctx.config, {
		profileId,
		provider: PROVIDER_ID,
		mode: "token"
	});
	const existingModelConfig = withProfile.agents?.defaults?.model && typeof withProfile.agents.defaults.model === "object" ? withProfile.agents.defaults.model : {};
	return {
		...withProfile,
		agents: {
			...withProfile.agents,
			defaults: {
				...withProfile.agents?.defaults,
				model: {
					...existingModelConfig,
					primary: DEFAULT_ANTHROPIC_MODEL
				}
			}
		}
	};
}
function resolveAnthropic46ForwardCompatModel(params) {
	const trimmedModelId = params.ctx.modelId.trim();
	const lower = normalizeLowercaseStringOrEmpty(trimmedModelId);
	if (!(lower === params.dashModelId || lower === params.dotModelId || lower.startsWith(`${params.dashModelId}-`) || lower.startsWith(`${params.dotModelId}-`))) return;
	const templateIds = [];
	if (lower.startsWith(params.dashModelId)) templateIds.push(lower.replace(params.dashModelId, params.dashTemplateId));
	if (lower.startsWith(params.dotModelId)) templateIds.push(lower.replace(params.dotModelId, params.dotTemplateId));
	templateIds.push(...params.fallbackTemplateIds);
	return cloneFirstTemplateModel({
		providerId: PROVIDER_ID,
		modelId: trimmedModelId,
		templateIds,
		ctx: params.ctx,
		patch: normalizeLowercaseStringOrEmpty(params.ctx.provider) === "claude-cli" ? { provider: CLAUDE_CLI_BACKEND_ID } : void 0
	});
}
function resolveAnthropicForwardCompatModel(ctx) {
	return resolveAnthropic46ForwardCompatModel({
		ctx,
		dashModelId: ANTHROPIC_OPUS_47_MODEL_ID,
		dotModelId: ANTHROPIC_OPUS_47_DOT_MODEL_ID,
		dashTemplateId: ANTHROPIC_OPUS_46_MODEL_ID,
		dotTemplateId: ANTHROPIC_OPUS_46_DOT_MODEL_ID,
		fallbackTemplateIds: ANTHROPIC_OPUS_47_TEMPLATE_MODEL_IDS
	}) ?? resolveAnthropic46ForwardCompatModel({
		ctx,
		dashModelId: ANTHROPIC_OPUS_46_MODEL_ID,
		dotModelId: ANTHROPIC_OPUS_46_DOT_MODEL_ID,
		dashTemplateId: "claude-opus-4-5",
		dotTemplateId: "claude-opus-4.5",
		fallbackTemplateIds: ANTHROPIC_OPUS_TEMPLATE_MODEL_IDS
	}) ?? resolveAnthropic46ForwardCompatModel({
		ctx,
		dashModelId: ANTHROPIC_SONNET_46_MODEL_ID,
		dotModelId: ANTHROPIC_SONNET_46_DOT_MODEL_ID,
		dashTemplateId: "claude-sonnet-4-5",
		dotTemplateId: "claude-sonnet-4.5",
		fallbackTemplateIds: ANTHROPIC_SONNET_TEMPLATE_MODEL_IDS
	});
}
function shouldUseAnthropicAdaptiveThinkingDefault(modelId) {
	const lowerModelId = normalizeLowercaseStringOrEmpty(modelId);
	return lowerModelId.startsWith(ANTHROPIC_OPUS_47_MODEL_ID) || lowerModelId.startsWith(ANTHROPIC_OPUS_47_DOT_MODEL_ID) || lowerModelId.startsWith(ANTHROPIC_OPUS_46_MODEL_ID) || lowerModelId.startsWith(ANTHROPIC_OPUS_46_DOT_MODEL_ID) || lowerModelId.startsWith(ANTHROPIC_SONNET_46_MODEL_ID) || lowerModelId.startsWith(ANTHROPIC_SONNET_46_DOT_MODEL_ID);
}
function matchesAnthropicModernModel(modelId) {
	const lower = normalizeLowercaseStringOrEmpty(modelId);
	return ANTHROPIC_MODERN_MODEL_PREFIXES.some((prefix) => lower.startsWith(prefix));
}
function buildAnthropicAuthDoctorHint(params) {
	const legacyProfileId = params.profileId ?? "anthropic:default";
	const suggested = suggestOAuthProfileIdForLegacyDefault({
		cfg: params.config,
		store: params.store,
		provider: PROVIDER_ID,
		legacyProfileId
	});
	if (!suggested || suggested === legacyProfileId) return "";
	const storeOauthProfiles = listProfilesForProvider(params.store, PROVIDER_ID).filter((id) => params.store.profiles[id]?.type === "oauth").join(", ");
	const cfgMode = params.config?.auth?.profiles?.[legacyProfileId]?.mode;
	const cfgProvider = params.config?.auth?.profiles?.[legacyProfileId]?.provider;
	return [
		"Doctor hint (for GitHub issue):",
		`- provider: ${PROVIDER_ID}`,
		`- config: ${legacyProfileId}${cfgProvider || cfgMode ? ` (provider=${cfgProvider ?? "?"}, mode=${cfgMode ?? "?"})` : ""}`,
		`- auth store oauth profiles: ${storeOauthProfiles || "(none)"}`,
		`- suggested profile: ${suggested}`,
		`Fix: run "${formatCliCommand("openclaw doctor --yes")}"`
	].join("\n");
}
function resolveClaudeCliSyntheticAuth() {
	const credential = readClaudeCliCredentialsForRuntime();
	if (!credential) return;
	return credential.type === "oauth" ? {
		apiKey: credential.access,
		source: "Claude CLI native auth",
		mode: "oauth"
	} : {
		apiKey: credential.token,
		source: "Claude CLI native auth",
		mode: "token"
	};
}
async function runAnthropicCliMigration(ctx) {
	const credential = readClaudeCliCredentialsForSetup();
	if (!credential) throw new Error(["Claude CLI is not authenticated on this host.", `Run ${formatCliCommand("claude auth login")} first, then re-run this setup.`].join("\n"));
	return buildAnthropicCliMigrationResult(ctx.config, credential);
}
async function runAnthropicCliMigrationNonInteractive(ctx) {
	const credential = readClaudeCliCredentialsForSetupNonInteractive();
	if (!credential) {
		ctx.runtime.error(["Auth choice \"anthropic-cli\" requires Claude CLI auth on this host.", `Run ${formatCliCommand("claude auth login")} first.`].join("\n"));
		ctx.runtime.exit(1);
		return null;
	}
	const result = buildAnthropicCliMigrationResult(ctx.config, credential);
	const currentDefaults = ctx.config.agents?.defaults;
	const currentModel = currentDefaults?.model;
	const currentFallbacks = currentModel && typeof currentModel === "object" && "fallbacks" in currentModel ? currentModel.fallbacks : void 0;
	const migratedModel = result.configPatch?.agents?.defaults?.model;
	const migratedFallbacks = migratedModel && typeof migratedModel === "object" && "fallbacks" in migratedModel ? migratedModel.fallbacks : void 0;
	const nextFallbacks = Array.isArray(migratedFallbacks) ? migratedFallbacks : currentFallbacks;
	return {
		...ctx.config,
		...result.configPatch,
		agents: {
			...ctx.config.agents,
			...result.configPatch?.agents,
			defaults: {
				...currentDefaults,
				...result.configPatch?.agents?.defaults,
				model: {
					...Array.isArray(nextFallbacks) ? { fallbacks: nextFallbacks } : {},
					primary: result.defaultModel
				}
			}
		}
	};
}
function registerAnthropicPlugin(api) {
	const providerId = "anthropic";
	const defaultAnthropicModel = DEFAULT_ANTHROPIC_MODEL;
	api.registerCliBackend(buildAnthropicCliBackend());
	api.registerProvider({
		id: providerId,
		label: "Anthropic",
		docsPath: "/providers/models",
		hookAliases: [CLAUDE_CLI_BACKEND_ID],
		envVars: ["ANTHROPIC_OAUTH_TOKEN", "ANTHROPIC_API_KEY"],
		oauthProfileIdRepairs: [{
			legacyProfileId: "anthropic:default",
			promptLabel: "Anthropic"
		}],
		auth: [
			{
				id: "cli",
				label: "Claude CLI",
				hint: "Reuse a local Claude CLI login and switch model selection to claude-cli/*",
				kind: "custom",
				wizard: {
					choiceId: "anthropic-cli",
					choiceLabel: "Anthropic Claude CLI",
					choiceHint: "Reuse a local Claude CLI login on this host",
					assistantPriority: -20,
					groupId: "anthropic",
					groupLabel: "Anthropic",
					groupHint: "Claude CLI + API key",
					modelAllowlist: {
						allowedKeys: [...CLAUDE_CLI_DEFAULT_ALLOWLIST_REFS],
						initialSelections: [CLAUDE_CLI_DEFAULT_MODEL_REF],
						message: "Claude CLI models"
					}
				},
				run: async (ctx) => await runAnthropicCliMigration(ctx),
				runNonInteractive: async (ctx) => await runAnthropicCliMigrationNonInteractive({
					config: ctx.config,
					runtime: ctx.runtime,
					agentDir: ctx.agentDir
				})
			},
			{
				id: "setup-token",
				label: "Anthropic setup-token",
				hint: "Manual bearer token path",
				kind: "token",
				wizard: {
					choiceId: "setup-token",
					choiceLabel: "Anthropic setup-token",
					choiceHint: "Manual token path",
					assistantPriority: 40,
					groupId: "anthropic",
					groupLabel: "Anthropic",
					groupHint: "Claude CLI + API key + token"
				},
				run: async (ctx) => await runAnthropicSetupTokenAuth(ctx),
				runNonInteractive: async (ctx) => await runAnthropicSetupTokenNonInteractive(ctx)
			},
			createProviderApiKeyAuthMethod({
				providerId,
				methodId: "api-key",
				label: "Anthropic API key",
				hint: "Direct Anthropic API key",
				optionKey: "anthropicApiKey",
				flagName: "--anthropic-api-key",
				envVar: "ANTHROPIC_API_KEY",
				promptMessage: "Enter Anthropic API key",
				defaultModel: defaultAnthropicModel,
				expectedProviders: ["anthropic"],
				wizard: {
					choiceId: "apiKey",
					choiceLabel: "Anthropic API key",
					groupId: "anthropic",
					groupLabel: "Anthropic",
					groupHint: "Claude CLI + API key"
				}
			})
		],
		normalizeConfig: ({ providerConfig }) => normalizeAnthropicProviderConfig(providerConfig),
		applyConfigDefaults: ({ config, env }) => applyAnthropicConfigDefaults({
			config,
			env
		}),
		resolveDynamicModel: (ctx) => resolveAnthropicForwardCompatModel(ctx),
		resolveSyntheticAuth: ({ provider }) => normalizeLowercaseStringOrEmpty(provider) === "claude-cli" ? resolveClaudeCliSyntheticAuth() : void 0,
		buildReplayPolicy,
		isModernModelRef: ({ modelId }) => matchesAnthropicModernModel(modelId),
		resolveReasoningOutputMode: () => "native",
		wrapStreamFn: wrapAnthropicProviderStream,
		resolveDefaultThinkingLevel: ({ modelId }) => matchesAnthropicModernModel(modelId) && shouldUseAnthropicAdaptiveThinkingDefault(modelId) ? "adaptive" : void 0,
		resolveUsageAuth: async (ctx) => await ctx.resolveOAuthToken(),
		fetchUsageSnapshot: async (ctx) => await fetchClaudeUsage(ctx.token, ctx.timeoutMs, ctx.fetchFn),
		isCacheTtlEligible: () => true,
		buildAuthDoctorHint: (ctx) => buildAnthropicAuthDoctorHint({
			config: ctx.config,
			store: ctx.store,
			profileId: ctx.profileId
		})
	});
	api.registerMediaUnderstandingProvider(anthropicMediaUnderstandingProvider);
}
//#endregion
export { registerAnthropicPlugin as t };
