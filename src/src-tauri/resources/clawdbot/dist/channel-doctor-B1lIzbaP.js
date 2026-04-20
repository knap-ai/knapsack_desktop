import { c as listBundledChannelPlugins, n as getBundledChannelPlugin } from "./bundled-CGMeVzvo.js";
import { r as listChannelPlugins, t as getChannelPlugin } from "./registry-Delpa74L.js";
//#region src/commands/doctor/shared/channel-doctor.ts
function collectConfiguredChannelIds(cfg) {
	const channels = cfg.channels && typeof cfg.channels === "object" && !Array.isArray(cfg.channels) ? cfg.channels : null;
	if (!channels) return [];
	return Object.keys(channels).filter((channelId) => channelId !== "defaults").toSorted();
}
function safeListActiveChannelPlugins() {
	try {
		return listChannelPlugins();
	} catch {
		return [];
	}
}
function safeListBundledChannelPlugins() {
	try {
		return listBundledChannelPlugins();
	} catch {
		return [];
	}
}
function listChannelDoctorEntries(channelIds) {
	const byId = /* @__PURE__ */ new Map();
	const selectedIds = channelIds ? new Set(channelIds) : null;
	const plugins = selectedIds ? [...selectedIds].flatMap((id) => {
		let activeOrBundledPlugin;
		try {
			activeOrBundledPlugin = getChannelPlugin(id);
		} catch {
			activeOrBundledPlugin = void 0;
		}
		if (activeOrBundledPlugin?.doctor) return [activeOrBundledPlugin];
		const bundledPlugin = getBundledChannelPlugin(id);
		return bundledPlugin ? [bundledPlugin] : [];
	}) : [...safeListActiveChannelPlugins(), ...safeListBundledChannelPlugins()];
	for (const plugin of plugins) {
		if (!plugin.doctor) continue;
		if (!byId.get(plugin.id)) byId.set(plugin.id, {
			channelId: plugin.id,
			doctor: plugin.doctor
		});
	}
	return [...byId.values()];
}
async function runChannelDoctorConfigSequences(params) {
	const changeNotes = [];
	const warningNotes = [];
	for (const entry of listChannelDoctorEntries(collectConfiguredChannelIds(params.cfg))) {
		const result = await entry.doctor.runConfigSequence?.(params);
		if (!result) continue;
		changeNotes.push(...result.changeNotes);
		warningNotes.push(...result.warningNotes);
	}
	return {
		changeNotes,
		warningNotes
	};
}
function collectChannelDoctorCompatibilityMutations(cfg) {
	const channelIds = collectConfiguredChannelIds(cfg);
	if (channelIds.length === 0) return [];
	const mutations = [];
	let nextCfg = cfg;
	for (const entry of listChannelDoctorEntries(channelIds)) {
		const mutation = entry.doctor.normalizeCompatibilityConfig?.({ cfg: nextCfg });
		if (!mutation || mutation.changes.length === 0) continue;
		mutations.push(mutation);
		nextCfg = mutation.config;
	}
	return mutations;
}
async function collectChannelDoctorStaleConfigMutations(cfg) {
	const mutations = [];
	let nextCfg = cfg;
	for (const entry of listChannelDoctorEntries(collectConfiguredChannelIds(cfg))) {
		const mutation = await entry.doctor.cleanStaleConfig?.({ cfg: nextCfg });
		if (!mutation || mutation.changes.length === 0) continue;
		mutations.push(mutation);
		nextCfg = mutation.config;
	}
	return mutations;
}
async function collectChannelDoctorPreviewWarnings(params) {
	const warnings = [];
	for (const entry of listChannelDoctorEntries(collectConfiguredChannelIds(params.cfg))) {
		const lines = await entry.doctor.collectPreviewWarnings?.(params);
		if (lines?.length) warnings.push(...lines);
	}
	return warnings;
}
async function collectChannelDoctorMutableAllowlistWarnings(params) {
	const warnings = [];
	for (const entry of listChannelDoctorEntries(collectConfiguredChannelIds(params.cfg))) {
		const lines = await entry.doctor.collectMutableAllowlistWarnings?.(params);
		if (lines?.length) warnings.push(...lines);
	}
	return warnings;
}
async function collectChannelDoctorRepairMutations(params) {
	const mutations = [];
	let nextCfg = params.cfg;
	for (const entry of listChannelDoctorEntries(collectConfiguredChannelIds(params.cfg))) {
		const mutation = await entry.doctor.repairConfig?.({
			cfg: nextCfg,
			doctorFixCommand: params.doctorFixCommand
		});
		if (!mutation || mutation.changes.length === 0) {
			if (mutation?.warnings?.length) mutations.push({
				config: nextCfg,
				changes: [],
				warnings: mutation.warnings
			});
			continue;
		}
		mutations.push(mutation);
		nextCfg = mutation.config;
	}
	return mutations;
}
function collectChannelDoctorEmptyAllowlistExtraWarnings(params) {
	const warnings = [];
	for (const entry of listChannelDoctorEntries([params.channelName])) {
		const lines = entry.doctor.collectEmptyAllowlistExtraWarnings?.(params);
		if (lines?.length) warnings.push(...lines);
	}
	return warnings;
}
function shouldSkipChannelDoctorDefaultEmptyGroupAllowlistWarning(params) {
	return listChannelDoctorEntries([params.channelName]).some((entry) => entry.doctor.shouldSkipDefaultEmptyGroupAllowlistWarning?.(params) === true);
}
//#endregion
export { collectChannelDoctorRepairMutations as a, shouldSkipChannelDoctorDefaultEmptyGroupAllowlistWarning as c, collectChannelDoctorPreviewWarnings as i, collectChannelDoctorEmptyAllowlistExtraWarnings as n, collectChannelDoctorStaleConfigMutations as o, collectChannelDoctorMutableAllowlistWarnings as r, runChannelDoctorConfigSequences as s, collectChannelDoctorCompatibilityMutations as t };
