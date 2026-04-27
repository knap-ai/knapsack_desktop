import { i as formatErrorMessage } from "./errors-Jbvi20TW.js";
import { a as normalizeLowercaseStringOrEmpty, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { u as isNonSecretApiKeyMarker } from "./model-auth-markers-CZrGSAU9.js";
import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-CkOd5v2f.js";
import { a as upsertAuthProfileWithLock } from "./profiles-RuCKjoVP.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-DKbwHPzH.js";
import "./text-runtime-B1c54bxG.js";
import { i as normalizeApiKeyInput, n as ensureApiKeyFromOptionEnvOrPrompt, s as validateApiKeyInput } from "./provider-auth-input-BHhtM4mz.js";
import "./provider-auth-B7ecZcum.js";
import "./error-runtime-D8vVwCEz.js";
import { t as WizardCancelledError } from "./prompts-ocoL7LgP.js";
import "./setup-Bk02jGjc.js";
import "./ssrf-runtime-DjO5-xxH.js";
import { n as applyAgentDefaultModelPrimary } from "./provider-onboard-VLZPCYnL.js";
import { o as OLLAMA_DEFAULT_MODEL, t as OLLAMA_CLOUD_BASE_URL } from "./defaults-DOKD5eTO.js";
import { a as fetchOllamaModels, i as enrichOllamaModelsWithContext, l as resolveOllamaApiBase, n as buildOllamaModelDefinition, t as buildOllamaBaseUrlSsrFPolicy } from "./provider-models-13s6KSAW.js";
//#region extensions/ollama/src/setup.ts
const OLLAMA_SUGGESTED_MODELS_LOCAL = [OLLAMA_DEFAULT_MODEL];
const OLLAMA_SUGGESTED_MODELS_CLOUD = [
	"kimi-k2.5:cloud",
	"minimax-m2.7:cloud",
	"glm-5.1:cloud"
];
const OLLAMA_CONTEXT_ENRICH_LIMIT = 200;
const OLLAMA_CLOUD_MAX_DISCOVERED_MODELS = 500;
const HOST_BACKED_OLLAMA_MODE_CONFIG = {
	"cloud-local": {
		includeCloudModels: true,
		noteTitle: "Ollama Cloud + Local"
	},
	"local-only": {
		includeCloudModels: false,
		noteTitle: "Ollama"
	}
};
function buildOllamaUnreachableLines(baseUrl) {
	return [
		`Ollama could not be reached at ${baseUrl}.`,
		"Download it at https://ollama.com/download",
		"",
		"Start Ollama and re-run setup."
	];
}
function buildOllamaCloudSigninLines(signinUrl) {
	return [
		"Cloud models on this Ollama host need `ollama signin`.",
		signinUrl ?? "Run `ollama signin` on the configured Ollama host.",
		"",
		"Continuing with local models only for now."
	];
}
function normalizeOllamaModelName(value) {
	const trimmed = value?.trim();
	if (!trimmed) return;
	if (normalizeLowercaseStringOrEmpty(trimmed).startsWith("ollama/")) return trimmed.slice(7).trim() || void 0;
	return trimmed;
}
function isOllamaCloudModel(modelName) {
	return normalizeOptionalLowercaseString(modelName)?.endsWith(":cloud") === true;
}
function formatOllamaPullStatus(status) {
	const trimmed = status.trim();
	const partStatusMatch = trimmed.match(/^([a-z-]+)\s+(?:sha256:)?[a-f0-9]{8,}$/i);
	if (partStatusMatch) return {
		text: `${partStatusMatch[1]} part`,
		hidePercent: false
	};
	if (/^verifying\b.*\bdigest\b/i.test(trimmed)) return {
		text: "verifying digest",
		hidePercent: true
	};
	return {
		text: trimmed,
		hidePercent: false
	};
}
async function checkOllamaCloudAuth(baseUrl) {
	try {
		const apiBase = resolveOllamaApiBase(baseUrl);
		const { response, release } = await fetchWithSsrFGuard({
			url: `${apiBase}/api/me`,
			init: {
				method: "POST",
				signal: AbortSignal.timeout(5e3)
			},
			policy: buildOllamaBaseUrlSsrFPolicy(apiBase),
			auditContext: "ollama-setup.me"
		});
		try {
			if (response.status === 401) return {
				signedIn: false,
				signinUrl: (await response.json()).signin_url
			};
			if (!response.ok) return { signedIn: false };
			return { signedIn: true };
		} finally {
			await release();
		}
	} catch {
		return { signedIn: false };
	}
}
async function pullOllamaModelCore(params) {
	const baseUrl = resolveOllamaApiBase(params.baseUrl);
	const modelName = normalizeOllamaModelName(params.modelName) ?? params.modelName.trim();
	try {
		const { response, release } = await fetchWithSsrFGuard({
			url: `${baseUrl}/api/pull`,
			init: {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: modelName })
			},
			policy: buildOllamaBaseUrlSsrFPolicy(baseUrl),
			auditContext: "ollama-setup.pull"
		});
		try {
			if (!response.ok) return {
				ok: false,
				message: `Failed to download ${modelName} (HTTP ${response.status})`
			};
			if (!response.body) return {
				ok: false,
				message: `Failed to download ${modelName} (no response body)`
			};
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			const layers = /* @__PURE__ */ new Map();
			const parseLine = (line) => {
				const trimmed = line.trim();
				if (!trimmed) return { ok: true };
				try {
					const chunk = JSON.parse(trimmed);
					if (chunk.error) return {
						ok: false,
						message: `Download failed: ${chunk.error}`
					};
					if (!chunk.status) return { ok: true };
					if (chunk.total && chunk.completed !== void 0) {
						layers.set(chunk.status, {
							total: chunk.total,
							completed: chunk.completed
						});
						let totalSum = 0;
						let completedSum = 0;
						for (const layer of layers.values()) {
							totalSum += layer.total;
							completedSum += layer.completed;
						}
						params.onStatus?.(chunk.status, totalSum > 0 ? Math.round(completedSum / totalSum * 100) : null);
					} else params.onStatus?.(chunk.status, null);
				} catch {}
				return { ok: true };
			};
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";
				for (const line of lines) {
					const parsed = parseLine(line);
					if (!parsed.ok) return parsed;
				}
			}
			const trailing = buffer.trim();
			if (trailing) {
				const parsed = parseLine(trailing);
				if (!parsed.ok) return parsed;
			}
			return { ok: true };
		} finally {
			await release();
		}
	} catch (err) {
		return {
			ok: false,
			message: `Failed to download ${modelName}: ${formatErrorMessage(err)}`
		};
	}
}
async function pullOllamaModel(baseUrl, modelName, prompter) {
	const spinner = prompter.progress(`Downloading ${modelName}...`);
	const result = await pullOllamaModelCore({
		baseUrl,
		modelName,
		onStatus: (status, percent) => {
			const displayStatus = formatOllamaPullStatus(status);
			if (displayStatus.hidePercent) spinner.update(`Downloading ${modelName} - ${displayStatus.text}`);
			else spinner.update(`Downloading ${modelName} - ${displayStatus.text} - ${percent ?? 0}%`);
		}
	});
	if (!result.ok) {
		spinner.stop(result.message);
		return false;
	}
	spinner.stop(`Downloaded ${modelName}`);
	return true;
}
async function pullOllamaModelNonInteractive(baseUrl, modelName, runtime) {
	runtime.log(`Downloading ${modelName}...`);
	const result = await pullOllamaModelCore({
		baseUrl,
		modelName
	});
	if (!result.ok) {
		runtime.error(result.message);
		return false;
	}
	runtime.log(`Downloaded ${modelName}`);
	return true;
}
async function promptForOllamaCloudCredential(params) {
	const captured = {};
	const optionToken = normalizeOptionalSecretInput(params.opts?.ollamaApiKey);
	await ensureApiKeyFromOptionEnvOrPrompt({
		token: optionToken ?? normalizeOptionalSecretInput(params.opts?.token),
		tokenProvider: optionToken ? "ollama" : normalizeOptionalSecretInput(params.opts?.tokenProvider),
		secretInputMode: params.allowSecretRefPrompt === false ? params.secretInputMode ?? "plaintext" : params.secretInputMode,
		config: params.cfg,
		env: params.env,
		expectedProviders: ["ollama"],
		provider: "ollama",
		envLabel: "OLLAMA_API_KEY",
		promptMessage: "Ollama API key",
		normalize: normalizeApiKeyInput,
		validate: validateApiKeyInput,
		prompter: params.prompter,
		setCredential: async (apiKey, mode) => {
			captured.credential = apiKey;
			captured.credentialMode = mode;
		}
	});
	if (!captured.credential) throw new Error("Missing Ollama API key input.");
	if (typeof captured.credential === "string" && isNonSecretApiKeyMarker(captured.credential, { includeEnvVarName: false })) throw new Error("Cloud-only Ollama setup requires a real OLLAMA_API_KEY.");
	return {
		credential: captured.credential,
		credentialMode: captured.credentialMode
	};
}
function buildOllamaModelsConfig(modelNames, discoveredModelsByName) {
	return modelNames.map((name) => {
		const discovered = discoveredModelsByName?.get(name);
		const capabilities = discovered?.capabilities ?? (name === "kimi-k2.5:cloud" ? ["vision"] : void 0);
		return buildOllamaModelDefinition(name, discovered?.contextWindow, capabilities);
	});
}
function mergeUniqueModelNames(...groups) {
	const seen = /* @__PURE__ */ new Set();
	const merged = [];
	for (const group of groups) for (const name of group) {
		if (seen.has(name)) continue;
		seen.add(name);
		merged.push(name);
	}
	return merged;
}
function applyOllamaProviderConfig(cfg, baseUrl, modelNames, discoveredModelsByName, apiKey = "OLLAMA_API_KEY") {
	return {
		...cfg,
		models: {
			...cfg.models,
			mode: cfg.models?.mode ?? "merge",
			providers: {
				...cfg.models?.providers,
				ollama: {
					baseUrl,
					api: "ollama",
					apiKey,
					models: buildOllamaModelsConfig(modelNames, discoveredModelsByName)
				}
			}
		}
	};
}
async function storeOllamaCredential(agentDir) {
	await upsertAuthProfileWithLock({
		profileId: "ollama:default",
		credential: {
			type: "api_key",
			provider: "ollama",
			key: "ollama-local"
		},
		agentDir
	});
}
async function promptForOllamaBaseUrl(prompter) {
	return resolveOllamaApiBase((await prompter.text({
		message: "Ollama base URL",
		initialValue: "http://127.0.0.1:11434",
		placeholder: "http://127.0.0.1:11434",
		validate: (value) => value?.trim() ? void 0 : "Required"
	}) ?? "").trim().replace(/\/+$/, ""));
}
async function resolveHostBackedSuggestedModelNames(params) {
	const modeConfig = HOST_BACKED_OLLAMA_MODE_CONFIG[params.mode];
	if (!modeConfig.includeCloudModels) return OLLAMA_SUGGESTED_MODELS_LOCAL;
	const auth = await checkOllamaCloudAuth(params.baseUrl);
	if (auth.signedIn) return mergeUniqueModelNames(OLLAMA_SUGGESTED_MODELS_LOCAL, OLLAMA_SUGGESTED_MODELS_CLOUD);
	await params.prompter.note(buildOllamaCloudSigninLines(auth.signinUrl).join("\n"), modeConfig.noteTitle);
	return OLLAMA_SUGGESTED_MODELS_LOCAL;
}
async function promptAndConfigureHostBackedOllama(params) {
	const baseUrl = await promptForOllamaBaseUrl(params.prompter);
	const { reachable, models } = await fetchOllamaModels(baseUrl);
	if (!reachable) {
		await params.prompter.note(buildOllamaUnreachableLines(baseUrl).join("\n"), "Ollama");
		throw new WizardCancelledError("Ollama not reachable");
	}
	const enrichedModels = await enrichOllamaModelsWithContext(baseUrl, models.slice(0, OLLAMA_CONTEXT_ENRICH_LIMIT));
	const discoveredModelsByName = new Map(enrichedModels.map((model) => [model.name, model]));
	const discoveredModelNames = models.map((model) => model.name);
	const suggestedModelNames = await resolveHostBackedSuggestedModelNames({
		mode: params.mode,
		baseUrl,
		prompter: params.prompter
	});
	return {
		credential: "ollama-local",
		config: applyOllamaProviderConfig(params.cfg, baseUrl, mergeUniqueModelNames(suggestedModelNames, discoveredModelNames), discoveredModelsByName)
	};
}
async function promptAndConfigureOllama(params) {
	const mode = await params.prompter.select({
		message: "Ollama mode",
		options: [
			{
				value: "cloud-local",
				label: "Cloud + Local",
				hint: "Route cloud and local models through your Ollama host"
			},
			{
				value: "cloud-only",
				label: "Cloud only",
				hint: "Hosted Ollama models via ollama.com"
			},
			{
				value: "local-only",
				label: "Local only",
				hint: "Local models only"
			}
		]
	});
	if (mode === "cloud-only") {
		const { credential, credentialMode } = await promptForOllamaCloudCredential({
			cfg: params.cfg,
			env: params.env,
			opts: params.opts,
			prompter: params.prompter,
			secretInputMode: params.secretInputMode,
			allowSecretRefPrompt: params.allowSecretRefPrompt
		});
		const { reachable, models: rawDiscoveredModels } = await fetchOllamaModels(OLLAMA_CLOUD_BASE_URL);
		const discoveredModels = rawDiscoveredModels.slice(0, OLLAMA_CLOUD_MAX_DISCOVERED_MODELS);
		const enrichedModels = reachable && discoveredModels.length > 0 ? await enrichOllamaModelsWithContext(OLLAMA_CLOUD_BASE_URL, discoveredModels.slice(0, OLLAMA_CONTEXT_ENRICH_LIMIT)) : [];
		const discoveredModelsByName = new Map(enrichedModels.map((model) => [model.name, model]));
		const discoveredModelNames = discoveredModels.map((model) => model.name);
		const modelNames = discoveredModelNames.length > 0 ? mergeUniqueModelNames(OLLAMA_SUGGESTED_MODELS_CLOUD, discoveredModelNames) : OLLAMA_SUGGESTED_MODELS_CLOUD;
		return {
			credential,
			credentialMode,
			config: applyOllamaProviderConfig(params.cfg, OLLAMA_CLOUD_BASE_URL, modelNames, discoveredModelsByName, credential)
		};
	}
	return await promptAndConfigureHostBackedOllama({
		cfg: params.cfg,
		mode,
		prompter: params.prompter
	});
}
async function configureOllamaNonInteractive(params) {
	const baseUrl = resolveOllamaApiBase((params.opts.customBaseUrl?.trim() || "http://127.0.0.1:11434").replace(/\/+$/, ""));
	const { reachable, models } = await fetchOllamaModels(baseUrl);
	const explicitModel = normalizeOllamaModelName(params.opts.customModelId);
	if (!reachable) {
		params.runtime.error(buildOllamaUnreachableLines(baseUrl).slice(0, 2).join("\n"));
		params.runtime.exit(1);
		return params.nextConfig;
	}
	await storeOllamaCredential(params.agentDir);
	const enrichedModels = await enrichOllamaModelsWithContext(baseUrl, models.slice(0, OLLAMA_CONTEXT_ENRICH_LIMIT));
	const discoveredModelsByName = new Map(enrichedModels.map((model) => [model.name, model]));
	const modelNames = models.map((model) => model.name);
	const orderedModelNames = [...OLLAMA_SUGGESTED_MODELS_LOCAL, ...modelNames.filter((name) => !OLLAMA_SUGGESTED_MODELS_LOCAL.includes(name))];
	const requestedDefaultModelId = explicitModel ?? OLLAMA_SUGGESTED_MODELS_LOCAL[0];
	const availableModelNames = new Set(modelNames);
	const requestedCloudModel = isOllamaCloudModel(requestedDefaultModelId);
	let pulledRequestedModel = false;
	if (requestedCloudModel) availableModelNames.add(requestedDefaultModelId);
	else if (!modelNames.includes(requestedDefaultModelId)) {
		pulledRequestedModel = await pullOllamaModelNonInteractive(baseUrl, requestedDefaultModelId, params.runtime);
		if (pulledRequestedModel) availableModelNames.add(requestedDefaultModelId);
	}
	let allModelNames = orderedModelNames;
	let defaultModelId = requestedDefaultModelId;
	if ((pulledRequestedModel || requestedCloudModel) && !allModelNames.includes(requestedDefaultModelId)) allModelNames = [...allModelNames, requestedDefaultModelId];
	if (!availableModelNames.has(requestedDefaultModelId)) {
		if (availableModelNames.size === 0) {
			params.runtime.error([`No Ollama models are available at ${baseUrl}.`, "Pull a model first, then re-run setup."].join("\n"));
			params.runtime.exit(1);
			return params.nextConfig;
		}
		defaultModelId = allModelNames.find((name) => availableModelNames.has(name)) ?? Array.from(availableModelNames)[0];
		params.runtime.log(`Ollama model ${requestedDefaultModelId} was not available; using ${defaultModelId} instead.`);
	}
	const config = applyOllamaProviderConfig(params.nextConfig, baseUrl, allModelNames, discoveredModelsByName);
	params.runtime.log(`Default Ollama model: ${defaultModelId}`);
	return applyAgentDefaultModelPrimary(config, `ollama/${defaultModelId}`);
}
async function ensureOllamaModelPulled(params) {
	if (!params.model.startsWith("ollama/")) return;
	const baseUrl = params.config.models?.providers?.ollama?.baseUrl ?? "http://127.0.0.1:11434";
	const modelName = params.model.slice(7);
	if (isOllamaCloudModel(modelName)) return;
	const { models } = await fetchOllamaModels(baseUrl);
	if (models.some((model) => model.name === modelName)) return;
	if (!await pullOllamaModel(baseUrl, modelName, params.prompter)) throw new WizardCancelledError("Failed to download selected Ollama model");
}
//#endregion
export { promptAndConfigureOllama as i, configureOllamaNonInteractive as n, ensureOllamaModelPulled as r, checkOllamaCloudAuth as t };
