//#region src/infra/npm-install-env.ts
const NPM_CONFIG_KEYS_TO_RESET = new Set([
	"npm_config_cache",
	"npm_config_global",
	"npm_config_location",
	"npm_config_prefix"
]);
function createNpmProjectInstallEnv(env, options = {}) {
	const nextEnv = { ...env };
	for (const key of Object.keys(nextEnv)) if (NPM_CONFIG_KEYS_TO_RESET.has(key.toLowerCase())) delete nextEnv[key];
	return {
		...nextEnv,
		npm_config_global: "false",
		npm_config_location: "project",
		npm_config_package_lock: "false",
		npm_config_save: "false",
		...options.cacheDir ? { npm_config_cache: options.cacheDir } : {}
	};
}
//#endregion
export { createNpmProjectInstallEnv as t };
