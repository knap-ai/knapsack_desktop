import { i as normalizeProviderIdForAuth } from "./provider-id-CTiEzT1T.js";
import { t as getShellEnvAppliedKeys } from "./shell-env-Dihl7qUt.js";
import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import { _ as PROVIDER_ENV_API_KEY_CANDIDATES, n as GCP_VERTEX_CREDENTIALS_MARKER } from "./model-auth-markers-BjPX15EF.js";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";
import { getEnvApiKey } from "@mariozechner/pi-ai";
//#region src/plugin-sdk/anthropic-vertex-auth-presence.ts
const GCLOUD_DEFAULT_ADC_PATH = join(homedir(), ".config", "gcloud", "application_default_credentials.json");
function hasAnthropicVertexMetadataServerAdc(env = process.env) {
	const explicitMetadataOptIn = normalizeOptionalSecretInput(env.ANTHROPIC_VERTEX_USE_GCP_METADATA);
	return explicitMetadataOptIn === "1" || explicitMetadataOptIn?.toLowerCase() === "true";
}
function resolveAnthropicVertexDefaultAdcPath(env = process.env) {
	return platform() === "win32" ? join(env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "gcloud", "application_default_credentials.json") : GCLOUD_DEFAULT_ADC_PATH;
}
function resolveAnthropicVertexAdcCredentialsPath(env = process.env) {
	const explicitCredentialsPath = env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
	if (explicitCredentialsPath) return existsSync(explicitCredentialsPath) ? explicitCredentialsPath : void 0;
	const defaultAdcPath = resolveAnthropicVertexDefaultAdcPath(env);
	return existsSync(defaultAdcPath) ? defaultAdcPath : void 0;
}
function hasAnthropicVertexAvailableAuth(env = process.env) {
	return hasAnthropicVertexMetadataServerAdc(env) || resolveAnthropicVertexAdcCredentialsPath(env) !== void 0;
}
//#endregion
//#region src/agents/model-auth-env.ts
function resolveEnvApiKey(provider, env = process.env) {
	const normalized = normalizeProviderIdForAuth(provider);
	const applied = new Set(getShellEnvAppliedKeys());
	const pick = (envVar) => {
		const value = normalizeOptionalSecretInput(env[envVar]);
		if (!value) return null;
		return {
			apiKey: value,
			source: applied.has(envVar) ? `shell env: ${envVar}` : `env: ${envVar}`
		};
	};
	const candidates = PROVIDER_ENV_API_KEY_CANDIDATES[normalized];
	if (candidates) for (const envVar of candidates) {
		const resolved = pick(envVar);
		if (resolved) return resolved;
	}
	if (normalized === "google-vertex") {
		const envKey = getEnvApiKey(normalized);
		if (!envKey) return null;
		return {
			apiKey: envKey,
			source: "gcloud adc"
		};
	}
	if (normalized === "anthropic-vertex") {
		if (hasAnthropicVertexAvailableAuth(env)) return {
			apiKey: GCP_VERTEX_CREDENTIALS_MARKER,
			source: "gcloud adc"
		};
		return null;
	}
	return null;
}
//#endregion
export { resolveEnvApiKey as t };
