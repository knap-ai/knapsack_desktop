import { d as resolveSecretInputRef, l as normalizeSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-DqcJmob1.js";
import "./common-BWtun2If.js";
import "./external-content-Ds7ZVhiZ.js";
import { d as withStrictWebToolsEndpoint } from "./web-shared-BfvYKFo5.js";
import "./web-search-provider-common-EFbs_Gas.js";
import "./enable-CYwosJmY.js";
//#region src/agents/tools/web-search-citation-redirect.ts
const REDIRECT_TIMEOUT_MS = 5e3;
/**
* Resolve a citation redirect URL to its final destination using a HEAD request.
* Returns the original URL if resolution fails or times out.
*/
async function resolveCitationRedirectUrl(url) {
	try {
		return await withStrictWebToolsEndpoint({
			url,
			init: { method: "HEAD" },
			timeoutMs: REDIRECT_TIMEOUT_MS
		}, async ({ finalUrl }) => finalUrl || url);
	} catch {
		return url;
	}
}
//#endregion
//#region src/agents/tools/web-search-provider-credentials.ts
function resolveWebSearchProviderCredential(params) {
	const fromConfig = normalizeSecretInput(normalizeSecretInputString(params.credentialValue));
	if (fromConfig) return fromConfig;
	const credentialRef = resolveSecretInputRef({ value: params.credentialValue }).ref;
	if (credentialRef?.source === "env") {
		const fromEnvRef = normalizeSecretInput(process.env[credentialRef.id]);
		if (fromEnvRef) return fromEnvRef;
	}
	for (const envVar of params.envVars) {
		const fromEnv = normalizeSecretInput(process.env[envVar]);
		if (fromEnv) return fromEnv;
	}
}
//#endregion
//#region src/plugin-sdk/provider-web-search.ts
/**
* @deprecated Implement provider-owned `createTool(...)` directly on the
* returned WebSearchProviderPlugin instead of routing through core.
*/
function createPluginBackedWebSearchProvider(provider) {
	return {
		...provider,
		createTool: () => {
			throw new Error(`createPluginBackedWebSearchProvider(${provider.id}) is no longer supported. Define provider-owned createTool(...) directly in the extension's WebSearchProviderPlugin.`);
		}
	};
}
//#endregion
export { resolveWebSearchProviderCredential as n, resolveCitationRedirectUrl as r, createPluginBackedWebSearchProvider as t };
