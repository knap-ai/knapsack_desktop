import { t as isTruthyEnvValue } from "./env-BiSxzotM.js";
//#region src/plugins/lazy-service-module.ts
function resolveExport(mod, names) {
	for (const name of names) {
		const value = mod[name];
		if (typeof value === "function") return value;
	}
	return null;
}
async function startLazyPluginServiceModule(params) {
	const skipEnvVar = params.skipEnvVar?.trim();
	if (skipEnvVar && isTruthyEnvValue(process.env[skipEnvVar])) return null;
	const overrideEnvVar = params.overrideEnvVar?.trim();
	const override = overrideEnvVar ? process.env[overrideEnvVar]?.trim() : void 0;
	const loadOverrideModule = params.loadOverrideModule ?? (async (specifier) => await import(specifier));
	const validatedOverride = override && params.validateOverrideSpecifier ? params.validateOverrideSpecifier(override) : override;
	const mod = validatedOverride ? await loadOverrideModule(validatedOverride) : await params.loadDefaultModule();
	const start = resolveExport(mod, params.startExportNames);
	if (!start) return null;
	const stop = params.stopExportNames && params.stopExportNames.length > 0 ? resolveExport(mod, params.stopExportNames) : null;
	await start();
	return { stop: stop ?? (async () => {}) };
}
//#endregion
export { startLazyPluginServiceModule as t };
