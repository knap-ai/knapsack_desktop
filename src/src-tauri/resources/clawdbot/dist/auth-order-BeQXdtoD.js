import { g as shortenHomePath } from "./utils-DvkbxKCZ.js";
import { r as writeRuntimeJson } from "./runtime-izpjJukX.js";
import { S as resolveDefaultAgentId, b as resolveAgentDir } from "./agent-scope-i10se9ty.js";
import { s as normalizeStringEntries } from "./string-normalization-Cz5hTdB3.js";
import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import { c as resolveAuthStatePathForDisplay } from "./source-check-DsALcHaU.js";
import { n as ensureAuthProfileStore } from "./store-D-8DaAtv.js";
import "./model-selection-GlsOqTDm.js";
import "./auth-profiles-BOEvF4Rg.js";
import { r as setAuthProfileOrder } from "./profiles-CrHNjqxk.js";
import { s as resolveKnownAgentId } from "./shared-CbfwZExx.js";
import { t as loadModelsConfig } from "./load-config-CYQugdzh.js";
//#region src/commands/models/auth-order.ts
function resolveTargetAgent(cfg, raw) {
	const agentId = resolveKnownAgentId({
		cfg,
		rawAgentId: raw
	}) ?? resolveDefaultAgentId(cfg);
	return {
		agentId,
		agentDir: resolveAgentDir(cfg, agentId)
	};
}
function describeOrder(store, provider) {
	const providerKey = normalizeProviderId(provider);
	const order = store.order?.[providerKey];
	return Array.isArray(order) ? order : [];
}
async function resolveAuthOrderContext(opts, runtime) {
	const rawProvider = opts.provider?.trim();
	if (!rawProvider) throw new Error("Missing --provider.");
	const provider = normalizeProviderId(rawProvider);
	const cfg = await loadModelsConfig({
		commandName: "models auth-order",
		runtime
	});
	const { agentId, agentDir } = resolveTargetAgent(cfg, opts.agent);
	return {
		cfg,
		agentId,
		agentDir,
		provider
	};
}
async function modelsAuthOrderGetCommand(opts, runtime) {
	const { agentId, agentDir, provider } = await resolveAuthOrderContext(opts, runtime);
	const order = describeOrder(ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false }), provider);
	if (opts.json) {
		writeRuntimeJson(runtime, {
			agentId,
			agentDir,
			provider,
			authStatePath: shortenHomePath(resolveAuthStatePathForDisplay(agentDir)),
			order: order.length > 0 ? order : null
		});
		return;
	}
	runtime.log(`Agent: ${agentId}`);
	runtime.log(`Provider: ${provider}`);
	runtime.log(`Auth state file: ${shortenHomePath(resolveAuthStatePathForDisplay(agentDir))}`);
	runtime.log(order.length > 0 ? `Order override: ${order.join(", ")}` : "Order override: (none)");
}
async function modelsAuthOrderClearCommand(opts, runtime) {
	const { agentId, agentDir, provider } = await resolveAuthOrderContext(opts, runtime);
	if (!await setAuthProfileOrder({
		agentDir,
		provider,
		order: null
	})) throw new Error("Failed to update auth-state.json (lock busy?).");
	runtime.log(`Agent: ${agentId}`);
	runtime.log(`Provider: ${provider}`);
	runtime.log("Cleared per-agent order override.");
}
async function modelsAuthOrderSetCommand(opts, runtime) {
	const { agentId, agentDir, provider } = await resolveAuthOrderContext(opts, runtime);
	const store = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
	const providerKey = provider;
	const requested = normalizeStringEntries(opts.order ?? []);
	if (requested.length === 0) throw new Error("Missing profile ids. Provide one or more profile ids.");
	for (const profileId of requested) {
		const cred = store.profiles[profileId];
		if (!cred) throw new Error(`Auth profile "${profileId}" not found in ${agentDir}.`);
		if (normalizeProviderId(cred.provider) !== providerKey) throw new Error(`Auth profile "${profileId}" is for ${cred.provider}, not ${provider}.`);
	}
	const updated = await setAuthProfileOrder({
		agentDir,
		provider,
		order: requested
	});
	if (!updated) throw new Error("Failed to update auth-state.json (lock busy?).");
	runtime.log(`Agent: ${agentId}`);
	runtime.log(`Provider: ${provider}`);
	runtime.log(`Order override: ${describeOrder(updated, provider).join(", ")}`);
}
//#endregion
export { modelsAuthOrderClearCommand, modelsAuthOrderGetCommand, modelsAuthOrderSetCommand };
