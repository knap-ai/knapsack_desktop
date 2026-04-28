import { s as normalizeOptionalLowercaseString } from "../../string-coerce-Bje8XVt9.js";
import { a as coerceSecretRef } from "../../types.secrets-ClP-vJ-P.js";
import { l as resolveDefaultSecretProviderAlias } from "../../ref-contract-DYUJg6ZQ.js";
import { n as ensureAuthProfileStore } from "../../store-D-8DaAtv.js";
import { t as normalizeOptionalSecretInput } from "../../normalize-secret-input-xONgR3PN.js";
import { n as listProfilesForProvider } from "../../profile-list-zV5Cv5VC.js";
import { a as upsertAuthProfileWithLock } from "../../profiles-CrHNjqxk.js";
import "../../text-runtime-DfALcXL5.js";
import { t as definePluginEntry } from "../../plugin-entry-BBPiA0af.js";
import { t as applyAuthProfileConfig } from "../../provider-auth-helpers-byAcxGN1.js";
import "../../provider-auth-LNc11avL.js";
import { r as resolvePluginConfigObject } from "../../plugin-config-runtime-CZjU72lW.js";
import { n as resolveCopilotForwardCompatModel, t as PROVIDER_ID } from "../../models-CVzS8osi.js";
import { t as resolveFirstGithubToken } from "../../auth-JmW8SYNK.js";
import { t as githubCopilotMemoryEmbeddingProviderAdapter } from "../../embeddings-Bt8FUPUV.js";
import { t as buildGithubCopilotReplayPolicy } from "../../replay-policy-DewZLrEC.js";
import { r as wrapCopilotProviderStream } from "../../stream-BrNQazbE.js";
//#region extensions/github-copilot/index.ts
const COPILOT_ENV_VARS = [
	"COPILOT_GITHUB_TOKEN",
	"GH_TOKEN",
	"GITHUB_TOKEN"
];
const DEFAULT_COPILOT_MODEL = "github-copilot/claude-opus-4.7";
const DEFAULT_COPILOT_PROFILE_ID = "github-copilot:github";
const COPILOT_XHIGH_MODEL_IDS = [
	"gpt-5.4",
	"gpt-5.3-codex",
	"gpt-5.2",
	"gpt-5.2-codex"
];
async function loadGithubCopilotRuntime() {
	return await import("./register.runtime.js");
}
function applyCopilotDefaultModel(cfg) {
	const defaults = cfg.agents?.defaults;
	const existingModel = defaults?.model;
	if (typeof existingModel === "string" ? existingModel.trim() : typeof existingModel === "object" && typeof existingModel?.primary === "string" ? existingModel.primary.trim() : "") return cfg;
	const fallbacks = typeof existingModel === "object" && existingModel !== null && "fallbacks" in existingModel ? existingModel.fallbacks : void 0;
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				model: {
					...fallbacks ? { fallbacks } : void 0,
					primary: DEFAULT_COPILOT_MODEL
				},
				models: {
					...defaults?.models,
					[DEFAULT_COPILOT_MODEL]: defaults?.models?.[DEFAULT_COPILOT_MODEL] ?? {}
				}
			}
		}
	};
}
function resolveExistingCopilotTokenProfileId(agentDir) {
	const authStore = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
	return listProfilesForProvider(authStore, PROVIDER_ID).find((profileId) => {
		const profile = authStore.profiles[profileId];
		if (profile?.type !== "token") return false;
		return Boolean(normalizeOptionalSecretInput(profile.token) || coerceSecretRef(profile.tokenRef)?.id.trim());
	});
}
async function resolveCopilotNonInteractiveToken(ctx, flagValue) {
	const resolveFromEnvChain = async () => {
		for (const envVar of COPILOT_ENV_VARS) {
			const resolved = await ctx.resolveApiKey({
				provider: PROVIDER_ID,
				flagName: "--github-copilot-token",
				envVar,
				envVarName: envVar,
				allowProfile: false,
				required: false
			});
			if (resolved) return resolved;
		}
		return null;
	};
	if (ctx.opts.secretInputMode === "ref") {
		const resolved = await resolveFromEnvChain();
		if (resolved) return resolved;
		if (flagValue) {
			ctx.runtime.error(["--github-copilot-token cannot be used with --secret-input-mode ref unless COPILOT_GITHUB_TOKEN, GH_TOKEN, or GITHUB_TOKEN is set in env.", "Set one of those env vars and omit --github-copilot-token, or use --secret-input-mode plaintext."].join("\n"));
			ctx.runtime.exit(1);
		}
		return null;
	}
	const primary = await ctx.resolveApiKey({
		provider: PROVIDER_ID,
		flagValue,
		flagName: "--github-copilot-token",
		envVar: COPILOT_ENV_VARS[0],
		envVarName: COPILOT_ENV_VARS[0],
		allowProfile: false,
		required: false
	});
	if (primary || flagValue) return primary;
	for (const envVar of COPILOT_ENV_VARS.slice(1)) {
		const resolved = await ctx.resolveApiKey({
			provider: PROVIDER_ID,
			flagName: "--github-copilot-token",
			envVar,
			envVarName: envVar,
			allowProfile: false,
			required: false
		});
		if (resolved) return resolved;
	}
	return null;
}
async function runGitHubCopilotNonInteractiveAuth(ctx) {
	const opts = ctx.opts;
	const flagValue = normalizeOptionalSecretInput(opts?.githubCopilotToken);
	const resolved = await resolveCopilotNonInteractiveToken(ctx, flagValue);
	let profileId = DEFAULT_COPILOT_PROFILE_ID;
	if (resolved) {
		const useTokenRef = ctx.opts.secretInputMode === "ref" && resolved.source === "env";
		if (useTokenRef && !resolved.envVarName) {
			ctx.runtime.error(["--secret-input-mode ref requires an explicit environment variable for provider \"github-copilot\".", "Set COPILOT_GITHUB_TOKEN in env and retry, or use --secret-input-mode plaintext."].join("\n"));
			ctx.runtime.exit(1);
			return null;
		}
		await upsertAuthProfileWithLock({
			profileId,
			credential: {
				type: "token",
				provider: PROVIDER_ID,
				...useTokenRef ? { tokenRef: {
					source: "env",
					provider: resolveDefaultSecretProviderAlias(ctx.baseConfig, "env", { preferFirstProviderForSource: true }),
					id: resolved.envVarName
				} } : { token: resolved.key }
			},
			agentDir: ctx.agentDir
		});
	} else {
		if (flagValue && ctx.opts.secretInputMode === "ref") return null;
		const existingProfileId = resolveExistingCopilotTokenProfileId(ctx.agentDir);
		if (!existingProfileId) {
			ctx.runtime.error("Missing --github-copilot-token (or COPILOT_GITHUB_TOKEN / GH_TOKEN / GITHUB_TOKEN env var) for --auth-choice github-copilot.");
			ctx.runtime.exit(1);
			return null;
		}
		profileId = existingProfileId;
	}
	return applyCopilotDefaultModel(applyAuthProfileConfig(ctx.config, {
		profileId,
		provider: PROVIDER_ID,
		mode: "token"
	}));
}
var github_copilot_default = definePluginEntry({
	id: "github-copilot",
	name: "GitHub Copilot Provider",
	description: "Bundled GitHub Copilot provider plugin",
	register(api) {
		const startupPluginConfig = api.pluginConfig ?? {};
		function resolveCurrentPluginConfig(config) {
			const runtimePluginConfig = resolvePluginConfigObject(config, "github-copilot");
			if (runtimePluginConfig) return runtimePluginConfig;
			return config ? {} : startupPluginConfig;
		}
		async function runGitHubCopilotAuth(ctx) {
			const { githubCopilotLoginCommand } = await loadGithubCopilotRuntime();
			await ctx.prompter.note(["This will open a GitHub device login to authorize Copilot.", "Requires an active GitHub Copilot subscription."].join("\n"), "GitHub Copilot");
			if (!process.stdin.isTTY) {
				await ctx.prompter.note("GitHub Copilot login requires an interactive TTY.", "GitHub Copilot");
				return { profiles: [] };
			}
			try {
				await githubCopilotLoginCommand({
					yes: true,
					profileId: "github-copilot:github"
				}, ctx.runtime);
			} catch (err) {
				await ctx.prompter.note(`GitHub Copilot login failed: ${String(err)}`, "GitHub Copilot");
				return { profiles: [] };
			}
			const credential = ensureAuthProfileStore(void 0, { allowKeychainPrompt: false }).profiles["github-copilot:github"];
			if (!credential || credential.type !== "token") return { profiles: [] };
			return {
				profiles: [{
					profileId: DEFAULT_COPILOT_PROFILE_ID,
					credential
				}],
				defaultModel: DEFAULT_COPILOT_MODEL
			};
		}
		api.registerMemoryEmbeddingProvider(githubCopilotMemoryEmbeddingProviderAdapter);
		api.registerProvider({
			id: PROVIDER_ID,
			label: "GitHub Copilot",
			docsPath: "/providers/models",
			envVars: COPILOT_ENV_VARS,
			auth: [{
				id: "device",
				label: "GitHub device login",
				hint: "Browser device-code flow",
				kind: "device_code",
				run: async (ctx) => await runGitHubCopilotAuth(ctx),
				runNonInteractive: async (ctx) => await runGitHubCopilotNonInteractiveAuth(ctx)
			}],
			wizard: { setup: {
				choiceId: "github-copilot",
				choiceLabel: "GitHub Copilot",
				choiceHint: "Device login with your GitHub account",
				methodId: "device"
			} },
			catalog: {
				order: "late",
				run: async (ctx) => {
					if ((resolveCurrentPluginConfig(ctx.config).discovery?.enabled ?? ctx.config?.models?.copilotDiscovery?.enabled) === false) return null;
					const { DEFAULT_COPILOT_API_BASE_URL, resolveCopilotApiToken } = await loadGithubCopilotRuntime();
					const { githubToken, hasProfile } = await resolveFirstGithubToken({
						agentDir: ctx.agentDir,
						config: ctx.config,
						env: ctx.env
					});
					if (!hasProfile && !githubToken) return null;
					let baseUrl = DEFAULT_COPILOT_API_BASE_URL;
					if (githubToken) try {
						baseUrl = (await resolveCopilotApiToken({
							githubToken,
							env: ctx.env
						})).baseUrl;
					} catch {
						baseUrl = DEFAULT_COPILOT_API_BASE_URL;
					}
					return { provider: {
						baseUrl,
						models: []
					} };
				}
			},
			resolveDynamicModel: (ctx) => resolveCopilotForwardCompatModel(ctx),
			wrapStreamFn: wrapCopilotProviderStream,
			buildReplayPolicy: ({ modelId }) => buildGithubCopilotReplayPolicy(modelId),
			resolveThinkingProfile: ({ modelId }) => ({ levels: [
				{ id: "off" },
				{ id: "minimal" },
				{ id: "low" },
				{ id: "medium" },
				{ id: "high" },
				...COPILOT_XHIGH_MODEL_IDS.includes(normalizeOptionalLowercaseString(modelId) ?? "") ? [{ id: "xhigh" }] : []
			] }),
			prepareRuntimeAuth: async (ctx) => {
				const { resolveCopilotApiToken } = await loadGithubCopilotRuntime();
				const token = await resolveCopilotApiToken({
					githubToken: ctx.apiKey,
					env: ctx.env
				});
				return {
					apiKey: token.token,
					baseUrl: token.baseUrl,
					expiresAt: token.expiresAt
				};
			},
			resolveUsageAuth: async (ctx) => await ctx.resolveOAuthToken(),
			fetchUsageSnapshot: async (ctx) => {
				const { fetchCopilotUsage } = await loadGithubCopilotRuntime();
				return await fetchCopilotUsage(ctx.token, ctx.timeoutMs, ctx.fetchFn);
			}
		});
	}
});
//#endregion
export { github_copilot_default as default };
