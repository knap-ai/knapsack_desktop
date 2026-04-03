import { t as hasAnthropicVertexAvailableAuth } from "./region-BCAVTxn2.js";
import { n as buildAnthropicVertexProvider } from "./provider-catalog-BoJbZrNZ.js";
//#region extensions/anthropic-vertex/api.ts
function mergeImplicitAnthropicVertexProvider(params) {
	const { existing, implicit } = params;
	if (!existing) return implicit;
	return {
		...implicit,
		...existing,
		models: Array.isArray(existing.models) && existing.models.length > 0 ? existing.models : implicit.models
	};
}
function resolveImplicitAnthropicVertexProvider(params) {
	const env = params?.env ?? process.env;
	if (!hasAnthropicVertexAvailableAuth(env)) return null;
	return buildAnthropicVertexProvider({ env });
}
//#endregion
export { resolveImplicitAnthropicVertexProvider as n, mergeImplicitAnthropicVertexProvider as t };
