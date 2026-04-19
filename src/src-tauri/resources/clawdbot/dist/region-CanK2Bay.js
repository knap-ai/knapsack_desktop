import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { n as resolveProviderEndpoint } from "./provider-attribution-BJhkfmfB.js";
import "./text-runtime-DTMxvodz.js";
import "./provider-http--wdeUhlc.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";
//#region extensions/anthropic-vertex/region.ts
const ANTHROPIC_VERTEX_DEFAULT_REGION = "global";
const ANTHROPIC_VERTEX_REGION_RE = /^[a-z0-9-]+$/;
const GCP_VERTEX_CREDENTIALS_MARKER = "gcp-vertex-credentials";
const GCLOUD_DEFAULT_ADC_PATH = join(homedir(), ".config", "gcloud", "application_default_credentials.json");
function normalizeOptionalSecretInput(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function resolveAnthropicVertexRegion(env = process.env) {
	const region = normalizeOptionalSecretInput(env.GOOGLE_CLOUD_LOCATION) || normalizeOptionalSecretInput(env.CLOUD_ML_REGION);
	return region && ANTHROPIC_VERTEX_REGION_RE.test(region) ? region : ANTHROPIC_VERTEX_DEFAULT_REGION;
}
function resolveAnthropicVertexProjectId(env = process.env) {
	return normalizeOptionalSecretInput(env.ANTHROPIC_VERTEX_PROJECT_ID) || normalizeOptionalSecretInput(env.GOOGLE_CLOUD_PROJECT) || normalizeOptionalSecretInput(env.GOOGLE_CLOUD_PROJECT_ID) || resolveAnthropicVertexProjectIdFromAdc(env);
}
function resolveAnthropicVertexRegionFromBaseUrl(baseUrl) {
	const endpoint = resolveProviderEndpoint(baseUrl);
	return endpoint.endpointClass === "google-vertex" ? endpoint.googleVertexRegion : void 0;
}
function resolveAnthropicVertexClientRegion(params) {
	return resolveAnthropicVertexRegionFromBaseUrl(params?.baseUrl) || resolveAnthropicVertexRegion(params?.env);
}
function hasAnthropicVertexMetadataServerAdc(env = process.env) {
	const explicitMetadataOptIn = normalizeOptionalSecretInput(env.ANTHROPIC_VERTEX_USE_GCP_METADATA);
	return explicitMetadataOptIn === "1" || normalizeLowercaseStringOrEmpty(explicitMetadataOptIn) === "true";
}
function resolveAnthropicVertexDefaultAdcPath(env = process.env) {
	return platform() === "win32" ? join(env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "gcloud", "application_default_credentials.json") : GCLOUD_DEFAULT_ADC_PATH;
}
function resolveAnthropicVertexAdcCredentialsPathCandidate(env = process.env) {
	const explicit = normalizeOptionalSecretInput(env.GOOGLE_APPLICATION_CREDENTIALS);
	if (explicit) return explicit;
	if (env !== process.env) return;
	return resolveAnthropicVertexDefaultAdcPath(env);
}
function canReadAnthropicVertexAdc(env = process.env) {
	const credentialsPath = resolveAnthropicVertexAdcCredentialsPathCandidate(env);
	if (!credentialsPath) return false;
	try {
		readFileSync(credentialsPath, "utf8");
		return true;
	} catch {
		return false;
	}
}
function resolveAnthropicVertexProjectIdFromAdc(env = process.env) {
	const credentialsPath = resolveAnthropicVertexAdcCredentialsPathCandidate(env);
	if (!credentialsPath) return;
	try {
		const parsed = JSON.parse(readFileSync(credentialsPath, "utf8"));
		return normalizeOptionalSecretInput(parsed.project_id) || normalizeOptionalSecretInput(parsed.quota_project_id);
	} catch {
		return;
	}
}
function hasAnthropicVertexCredentials(env = process.env) {
	return hasAnthropicVertexMetadataServerAdc(env) || canReadAnthropicVertexAdc(env);
}
function hasAnthropicVertexAvailableAuth(env = process.env) {
	return hasAnthropicVertexCredentials(env);
}
function resolveAnthropicVertexConfigApiKey(env = process.env) {
	return hasAnthropicVertexAvailableAuth(env) ? GCP_VERTEX_CREDENTIALS_MARKER : void 0;
}
//#endregion
export { resolveAnthropicVertexProjectId as a, resolveAnthropicVertexConfigApiKey as i, hasAnthropicVertexCredentials as n, resolveAnthropicVertexRegion as o, resolveAnthropicVertexClientRegion as r, resolveAnthropicVertexRegionFromBaseUrl as s, hasAnthropicVertexAvailableAuth as t };
