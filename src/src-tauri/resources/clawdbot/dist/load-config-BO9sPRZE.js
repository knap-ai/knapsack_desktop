import { i as getRuntimeConfig, m as readSourceConfigSnapshotForWrite } from "./io-Dv_xNAZB.js";
import { d as setRuntimeConfigSnapshot } from "./runtime-snapshot-C5PRsFS9.js";
import "./config-yDDhhyz6.js";
import "./command-secret-gateway-CDSwZO_q.js";
import { i as getModelsCommandSecretTargetIds } from "./command-secret-targets-5rfgNL2Q.js";
import { t as resolveCommandConfigWithSecrets } from "./command-config-resolution-y8I6P2R_.js";
//#region src/commands/models/load-config.ts
async function loadSourceConfigSnapshot(fallback) {
	try {
		const { snapshot } = await readSourceConfigSnapshotForWrite();
		if (snapshot.valid) return snapshot.sourceConfig;
	} catch {}
	return fallback;
}
async function loadModelsConfigWithSource(params) {
	const runtimeConfig = getRuntimeConfig();
	const sourceConfig = await loadSourceConfigSnapshot(runtimeConfig);
	const { resolvedConfig, diagnostics } = await resolveCommandConfigWithSecrets({
		config: runtimeConfig,
		commandName: params.commandName,
		targetIds: getModelsCommandSecretTargetIds(),
		runtime: params.runtime
	});
	setRuntimeConfigSnapshot(resolvedConfig, sourceConfig);
	return {
		sourceConfig,
		resolvedConfig,
		diagnostics
	};
}
async function loadModelsConfig(params) {
	return (await loadModelsConfigWithSource(params)).resolvedConfig;
}
//#endregion
export { loadModelsConfigWithSource as n, loadModelsConfig as t };
