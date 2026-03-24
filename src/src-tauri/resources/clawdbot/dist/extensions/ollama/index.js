import "../../logger-kwZIqwuw.js";
import "../../paths-ViKUYWUK.js";
import "../../tmp-openclaw-dir-idKIOMmb.js";
import "../../theme-CdOoMzRk.js";
import "../../globals-DBUMOBZ8.js";
import "../../subsystem-DISldKSB.js";
import "../../ansi-BEJF8NKS.js";
import "../../utils-CS0Ikux6.js";
import "../../agent-scope-bjWqU22i.js";
import "../../boundary-path-Dm0QJ7-y.js";
import "../../boundary-file-read-DcZxlWD8.js";
import "../../logger-BmpSCz93.js";
import "../../exec-B5_AYfQG.js";
import "../../workspace-D4K6QX9X.js";
import "../../model-selection-BnFtDmP7.js";
import "../../provider-model-minimax-DSmX4BNO.js";
import { rt as resolveOllamaApiBase } from "../../provider-models-BKjzpTsb.js";
import "../../anthropic-vertex-provider-B2x4YywE.js";
import { t as OLLAMA_DEFAULT_BASE_URL } from "../../ollama-defaults-h0YFzsNK.js";
import { t as definePluginEntry } from "../../plugin-entry-B2shVOQl.js";
//#region extensions/ollama/index.ts
const PROVIDER_ID = "ollama";
const DEFAULT_API_KEY = "ollama-local";
async function loadProviderSetup() {
	return await import("../../plugin-sdk/ollama-setup.js");
}
var ollama_default = definePluginEntry({
	id: "ollama",
	name: "Ollama Provider",
	description: "Bundled Ollama provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "Ollama",
			docsPath: "/providers/ollama",
			envVars: ["OLLAMA_API_KEY"],
			auth: [{
				id: "local",
				label: "Ollama",
				hint: "Cloud and local open models",
				kind: "custom",
				run: async (ctx) => {
					const result = await (await loadProviderSetup()).promptAndConfigureOllama({
						cfg: ctx.config,
						prompter: ctx.prompter
					});
					return {
						profiles: [{
							profileId: "ollama:default",
							credential: {
								type: "api_key",
								provider: PROVIDER_ID,
								key: DEFAULT_API_KEY
							}
						}],
						configPatch: result.config
					};
				},
				runNonInteractive: async (ctx) => {
					return await (await loadProviderSetup()).configureOllamaNonInteractive({
						nextConfig: ctx.config,
						opts: ctx.opts,
						runtime: ctx.runtime
					});
				}
			}],
			discovery: {
				order: "late",
				run: async (ctx) => {
					const explicit = ctx.config.models?.providers?.ollama;
					const hasExplicitModels = Array.isArray(explicit?.models) && explicit.models.length > 0;
					const ollamaKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
					if (hasExplicitModels && explicit) return { provider: {
						...explicit,
						baseUrl: typeof explicit.baseUrl === "string" && explicit.baseUrl.trim() ? resolveOllamaApiBase(explicit.baseUrl) : OLLAMA_DEFAULT_BASE_URL,
						api: explicit.api ?? "ollama",
						apiKey: ollamaKey ?? explicit.apiKey ?? DEFAULT_API_KEY
					} };
					const provider = await (await loadProviderSetup()).buildOllamaProvider(explicit?.baseUrl, { quiet: !ollamaKey && !explicit });
					if (provider.models.length === 0 && !ollamaKey && !explicit?.apiKey) return null;
					return { provider: {
						...provider,
						apiKey: ollamaKey ?? explicit?.apiKey ?? DEFAULT_API_KEY
					} };
				}
			},
			wizard: {
				setup: {
					choiceId: "ollama",
					choiceLabel: "Ollama",
					choiceHint: "Cloud and local open models",
					groupId: "ollama",
					groupLabel: "Ollama",
					groupHint: "Cloud and local open models",
					methodId: "local"
				},
				modelPicker: {
					label: "Ollama (custom)",
					hint: "Detect models from a local or remote Ollama instance",
					methodId: "local"
				}
			},
			onModelSelected: async ({ config, model, prompter }) => {
				if (!model.startsWith("ollama/")) return;
				await (await loadProviderSetup()).ensureOllamaModelPulled({
					config,
					model,
					prompter
				});
			}
		});
	}
});
//#endregion
export { ollama_default as default };
