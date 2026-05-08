import "./defaults-CRz26M83.js";
import { r as resolveStaticAllowlistModelKey } from "./model-ref-shared-1nQh-2FS.js";
//#region src/agents/model-allowlist-entry.ts
function ensureStaticModelAllowlistEntry(params) {
	const rawModelRef = params.modelRef.trim();
	if (!rawModelRef) return params.cfg;
	const models = { ...params.cfg.agents?.defaults?.models };
	const keySet = new Set([rawModelRef]);
	const canonicalKey = resolveStaticAllowlistModelKey(rawModelRef, params.defaultProvider ?? "openai");
	if (canonicalKey) keySet.add(canonicalKey);
	for (const key of keySet) models[key] = { ...models[key] };
	return {
		...params.cfg,
		agents: {
			...params.cfg.agents,
			defaults: {
				...params.cfg.agents?.defaults,
				models
			}
		}
	};
}
//#endregion
export { ensureStaticModelAllowlistEntry as t };
