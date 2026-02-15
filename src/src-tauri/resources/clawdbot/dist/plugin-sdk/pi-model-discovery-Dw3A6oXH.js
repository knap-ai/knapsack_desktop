import { createRequire } from "node:module";
import path from "node:path";
import { AuthStorage, AuthStorage as AuthStorage$1, ModelRegistry, ModelRegistry as ModelRegistry$1 } from "@mariozechner/pi-coding-agent";

//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) {
		__defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	}
	if (!no_symbols) {
		__defProp(target, Symbol.toStringTag, { value: "Module" });
	}
	return target;
};

//#endregion
//#region src/agents/pi-model-discovery.ts
var pi_model_discovery_exports = /* @__PURE__ */ __exportAll({
	AuthStorage: () => AuthStorage$1,
	ModelRegistry: () => ModelRegistry$1,
	discoverAuthStorage: () => discoverAuthStorage,
	discoverModels: () => discoverModels
});
function discoverAuthStorage(agentDir) {
	return new AuthStorage(path.join(agentDir, "auth.json"));
}
function discoverModels(authStorage, agentDir) {
	return new ModelRegistry(authStorage, path.join(agentDir, "models.json"));
}

//#endregion
export { pi_model_discovery_exports as t };