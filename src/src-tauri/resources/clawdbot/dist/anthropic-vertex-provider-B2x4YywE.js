import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-BsX1agd_.js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";
//#region src/agents/anthropic-vertex-provider.ts
const ANTHROPIC_VERTEX_DEFAULT_REGION = "global";
const ANTHROPIC_VERTEX_REGION_RE = /^[a-z0-9-]+$/;
const GCLOUD_DEFAULT_ADC_PATH = join(homedir(), ".config", "gcloud", "application_default_credentials.json");
function resolveAnthropicVertexProjectId(env = process.env) {
	return normalizeOptionalSecretInput(env.ANTHROPIC_VERTEX_PROJECT_ID) || normalizeOptionalSecretInput(env.GOOGLE_CLOUD_PROJECT) || normalizeOptionalSecretInput(env.GOOGLE_CLOUD_PROJECT_ID) || resolveAnthropicVertexProjectIdFromAdc(env);
}
function resolveAnthropicVertexRegion(env = process.env) {
	const region = normalizeOptionalSecretInput(env.GOOGLE_CLOUD_LOCATION) || normalizeOptionalSecretInput(env.CLOUD_ML_REGION);
	return region && ANTHROPIC_VERTEX_REGION_RE.test(region) ? region : ANTHROPIC_VERTEX_DEFAULT_REGION;
}
function resolveAnthropicVertexRegionFromBaseUrl(baseUrl) {
	const trimmed = baseUrl?.trim();
	if (!trimmed) return;
	try {
		const host = new URL(trimmed).hostname.toLowerCase();
		if (host === "aiplatform.googleapis.com") return "global";
		return /^([a-z0-9-]+)-aiplatform\.googleapis\.com$/.exec(host)?.[1];
	} catch {
		return;
	}
}
function resolveAnthropicVertexClientRegion(params) {
	return resolveAnthropicVertexRegionFromBaseUrl(params?.baseUrl) || resolveAnthropicVertexRegion(params?.env);
}
function hasAnthropicVertexMetadataServerAdc(env = process.env) {
	const explicitMetadataOptIn = normalizeOptionalSecretInput(env.ANTHROPIC_VERTEX_USE_GCP_METADATA);
	return explicitMetadataOptIn === "1" || explicitMetadataOptIn?.toLowerCase() === "true";
}
function resolveAnthropicVertexDefaultAdcPath(env = process.env) {
	return platform() === "win32" ? join(env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "gcloud", "application_default_credentials.json") : GCLOUD_DEFAULT_ADC_PATH;
}
function resolveAnthropicVertexAdcCredentialsPath(env = process.env) {
	const explicitCredentialsPath = normalizeOptionalSecretInput(env.GOOGLE_APPLICATION_CREDENTIALS);
	if (explicitCredentialsPath) return existsSync(explicitCredentialsPath) ? explicitCredentialsPath : void 0;
	const defaultAdcPath = resolveAnthropicVertexDefaultAdcPath(env);
	return existsSync(defaultAdcPath) ? defaultAdcPath : void 0;
}
function resolveAnthropicVertexProjectIdFromAdc(env = process.env) {
	const credentialsPath = resolveAnthropicVertexAdcCredentialsPath(env);
	if (!credentialsPath) return;
	try {
		const parsed = JSON.parse(readFileSync(credentialsPath, "utf8"));
		return normalizeOptionalSecretInput(parsed.project_id) || normalizeOptionalSecretInput(parsed.quota_project_id);
	} catch {
		return;
	}
}
function hasAnthropicVertexCredentials(env = process.env) {
	return hasAnthropicVertexMetadataServerAdc(env) || resolveAnthropicVertexAdcCredentialsPath(env) !== void 0;
}
function hasAnthropicVertexAvailableAuth(env = process.env) {
	return hasAnthropicVertexCredentials(env);
}
//#endregion
export { resolveAnthropicVertexRegion as i, resolveAnthropicVertexClientRegion as n, resolveAnthropicVertexProjectId as r, hasAnthropicVertexAvailableAuth as t };
