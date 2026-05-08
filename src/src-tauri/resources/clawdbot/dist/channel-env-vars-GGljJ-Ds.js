import { n as loadPluginManifestRegistryForPluginRegistry } from "./plugin-registry-CZ8QXP5l.js";
//#region src/secrets/channel-env-vars.ts
function appendUniqueEnvVarCandidates(target, channelId, keys) {
	const normalizedChannelId = channelId.trim();
	if (!normalizedChannelId || keys.length === 0) return;
	const bucket = target[normalizedChannelId] ??= [];
	const seen = new Set(bucket);
	for (const key of keys) {
		const normalizedKey = key.trim();
		if (!normalizedKey || seen.has(normalizedKey)) continue;
		seen.add(normalizedKey);
		bucket.push(normalizedKey);
	}
}
function resolveChannelEnvVars(params) {
	const registry = loadPluginManifestRegistryForPluginRegistry({
		config: params?.config,
		workspaceDir: params?.workspaceDir,
		env: params?.env,
		includeDisabled: true
	});
	const candidates = {};
	for (const plugin of registry.plugins) {
		if (!plugin.channelEnvVars) continue;
		for (const [channelId, keys] of Object.entries(plugin.channelEnvVars).toSorted(([left], [right]) => left.localeCompare(right))) appendUniqueEnvVarCandidates(candidates, channelId, keys);
	}
	return candidates;
}
function getChannelEnvVars(channelId, params) {
	const channelEnvVars = resolveChannelEnvVars(params);
	const envVars = Object.hasOwn(channelEnvVars, channelId) ? channelEnvVars[channelId] : void 0;
	return Array.isArray(envVars) ? [...envVars] : [];
}
function listKnownChannelEnvVarNames(params) {
	return [...new Set(Object.values(resolveChannelEnvVars(params)).flatMap((keys) => keys))];
}
//#endregion
export { listKnownChannelEnvVarNames as n, getChannelEnvVars as t };
