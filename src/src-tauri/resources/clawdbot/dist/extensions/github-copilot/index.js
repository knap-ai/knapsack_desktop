import { s as normalizeOptionalLowercaseString } from "../../string-coerce-C1IzJjqi.js";
import { n as ensureAuthProfileStore } from "../../store-CfHec0eX.js";
import "../../text-runtime-B1c54bxG.js";
import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import "../../provider-auth-B7ecZcum.js";
import { r as resolvePluginConfigObject } from "../../config-runtime-Dutm3Ah0.js";
import { n as resolveCopilotForwardCompatModel, t as PROVIDER_ID } from "../../models-CZL3_C6Y.js";
import { t as resolveFirstGithubToken } from "../../auth-1881MV1_.js";
import { t as githubCopilotMemoryEmbeddingProviderAdapter } from "../../embeddings-FPLzhgGC.js";
import { t as buildGithubCopilotReplayPolicy } from "../../replay-policy-D269bmn3.js";
import { r as wrapCopilotProviderStream } from "../../stream-Dy0kutKG.js";
//#region extensions/github-copilot/index.ts
const COPILOT_ENV_VARS = [
	"COPILOT_GITHUB_TOKEN",
	"GH_TOKEN",
	"GITHUB_TOKEN"
];
const COPILOT_XHIGH_MODEL_IDS = [
	"gpt-5.4",
	"gpt-5.2",
	"gpt-5.2-codex"
];
async function loadGithubCopilotRuntime() {
	return await import("./register.runtime.js");
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
					profileId: "github-copilot:github",
					credential
				}],
				defaultModel: "github-copilot/claude-opus-4.7"
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
				run: async (ctx) => await runGitHubCopilotAuth(ctx)
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
