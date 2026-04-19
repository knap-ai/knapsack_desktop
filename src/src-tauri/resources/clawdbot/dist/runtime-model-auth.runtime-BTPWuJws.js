import { a as prepareProviderRuntimeAuth } from "./provider-runtime.runtime-CA-FBfBB.js";
import { r as getApiKeyForModel, s as resolveApiKeyForProvider } from "./model-auth-KKLbMBGv.js";
//#region src/plugins/runtime/runtime-model-auth.runtime.ts
/**
* Resolve request-ready auth for a runtime model, applying any provider-owned
* `prepareRuntimeAuth` exchange on top of the standard credential lookup.
*/
async function getRuntimeAuthForModel(params) {
	const resolvedAuth = await getApiKeyForModel({
		model: params.model,
		cfg: params.cfg
	});
	if (!resolvedAuth.apiKey || resolvedAuth.mode === "aws-sdk") return resolvedAuth;
	const preparedAuth = await prepareProviderRuntimeAuth({
		provider: params.model.provider,
		config: params.cfg,
		workspaceDir: params.workspaceDir,
		env: process.env,
		context: {
			config: params.cfg,
			workspaceDir: params.workspaceDir,
			env: process.env,
			provider: params.model.provider,
			modelId: params.model.id,
			model: params.model,
			apiKey: resolvedAuth.apiKey,
			authMode: resolvedAuth.mode,
			profileId: resolvedAuth.profileId
		}
	});
	if (!preparedAuth) return resolvedAuth;
	return {
		...resolvedAuth,
		...preparedAuth,
		apiKey: preparedAuth.apiKey ?? resolvedAuth.apiKey
	};
}
//#endregion
export { getApiKeyForModel, getRuntimeAuthForModel, resolveApiKeyForProvider };
