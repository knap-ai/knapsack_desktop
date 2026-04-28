import { h as readSourceConfigSnapshotForWrite, i as getRuntimeConfig } from "./io-CFdEhZuM.js";
import { _ as setRuntimeConfigSnapshot } from "./runtime-snapshot-DLisEE8Y.js";
import "./config--k_1dtUP.js";
import "./command-secret-gateway-Bz9ocmUm.js";
import { i as getModelsCommandSecretTargetIds } from "./command-secret-targets-Cj5-iVXn.js";
import { t as resolveCommandConfigWithSecrets } from "./command-config-resolution-DGbcXrNp.js";
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
