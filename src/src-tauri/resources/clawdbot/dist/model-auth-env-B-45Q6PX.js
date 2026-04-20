import { t as getShellEnvAppliedKeys } from "./shell-env-DTnWMCId.js";
import { o as resolveProviderIdForAuth } from "./provider-env-vars-Sj-BhOn9.js";
import { r as resolvePluginSetupProvider } from "./setup-registry-ytDuF5P6.js";
import { _ as resolveProviderEnvApiKeyCandidates, n as GCP_VERTEX_CREDENTIALS_MARKER } from "./model-auth-markers-ve-OgG6R.js";
import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-DqcJmob1.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
//#region src/agents/model-auth-env.ts
function hasGoogleVertexAdcCredentials(env) {
	const explicitCredentialsPath = normalizeOptionalSecretInput(env.GOOGLE_APPLICATION_CREDENTIALS);
	if (explicitCredentialsPath) return fs.existsSync(explicitCredentialsPath);
	const homeDir = normalizeOptionalSecretInput(env.HOME) ?? os.homedir();
	return fs.existsSync(path.join(homeDir, ".config", "gcloud", "application_default_credentials.json"));
}
function resolveGoogleVertexEnvApiKey(env) {
	const explicitApiKey = normalizeOptionalSecretInput(env.GOOGLE_CLOUD_API_KEY);
	if (explicitApiKey) return explicitApiKey;
	const hasProject = Boolean(env.GOOGLE_CLOUD_PROJECT || env.GCLOUD_PROJECT);
	const hasLocation = Boolean(env.GOOGLE_CLOUD_LOCATION);
	return hasProject && hasLocation && hasGoogleVertexAdcCredentials(env) ? GCP_VERTEX_CREDENTIALS_MARKER : void 0;
}
function resolveEnvApiKey(provider, env = process.env) {
	const normalized = resolveProviderIdForAuth(provider, { env });
	const candidateMap = resolveProviderEnvApiKeyCandidates({ env });
	const applied = new Set(getShellEnvAppliedKeys());
	const pick = (envVar) => {
		const value = normalizeOptionalSecretInput(env[envVar]);
		if (!value) return null;
		return {
			apiKey: value,
			source: applied.has(envVar) ? `shell env: ${envVar}` : `env: ${envVar}`
		};
	};
	const candidates = Object.hasOwn(candidateMap, normalized) ? candidateMap[normalized] : void 0;
	if (Array.isArray(candidates)) {
		for (const envVar of candidates) {
			const resolved = pick(envVar);
			if (resolved) return resolved;
		}
		return null;
	}
	if (normalized === "google-vertex") {
		const envKey = resolveGoogleVertexEnvApiKey(env);
		if (!envKey) return null;
		return {
			apiKey: envKey,
			source: "gcloud adc"
		};
	}
	const setupProvider = resolvePluginSetupProvider({
		provider: normalized,
		env
	});
	if (setupProvider?.resolveConfigApiKey) {
		const resolved = setupProvider.resolveConfigApiKey({
			provider: normalized,
			env
		});
		if (resolved?.trim()) return {
			apiKey: resolved,
			source: resolved === "gcp-vertex-credentials" ? "gcloud adc" : "env"
		};
	}
	return null;
}
//#endregion
export { resolveEnvApiKey as t };
