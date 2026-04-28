import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as sanitizeForLog } from "./ansi-Dqm1lzVL.js";
import { t as asObjectRecord } from "./object-BfccA70Y.js";
import { t as getDoctorChannelCapabilities } from "./channel-capabilities-DaBbWH43.js";
//#region src/commands/doctor/shared/allow-from-mode.ts
function resolveAllowFromMode(channelName) {
	return getDoctorChannelCapabilities(channelName).dmAllowFromMode;
}
//#endregion
//#region src/commands/doctor/shared/open-policy-allowfrom.ts
function hasWildcard(list) {
	return list?.some((v) => normalizeOptionalString(String(v)) === "*") ?? false;
}
function collectOpenPolicyAllowFromWarnings(params) {
	if (params.changes.length === 0) return [];
	return [...params.changes.map((line) => sanitizeForLog(line)), `- Run "${params.doctorFixCommand}" to add missing allowFrom wildcards.`];
}
function maybeRepairOpenPolicyAllowFrom(cfg) {
	const channels = cfg.channels;
	if (!channels || typeof channels !== "object") return {
		config: cfg,
		changes: []
	};
	const next = structuredClone(cfg);
	const changes = [];
	const ensureWildcard = (account, prefix, mode) => {
		const dmEntry = account.dm;
		const dm = dmEntry && typeof dmEntry === "object" && !Array.isArray(dmEntry) ? dmEntry : void 0;
		const dmPolicy = account.dmPolicy ?? dm?.policy ?? void 0;
		const canCanonicalizeTopLevel = mode !== "nestedOnly";
		const hadNestedOpenPolicy = canCanonicalizeTopLevel && account.dmPolicy === void 0 && dm?.policy === "open";
		if (dmPolicy !== "open") return;
		const topAllowFrom = account.allowFrom;
		const nestedAllowFrom = dm?.allowFrom;
		if (hadNestedOpenPolicy) {
			account.dmPolicy = "open";
			delete dm.policy;
			changes.push(`- ${prefix}.dmPolicy: set to "open" (migrated from ${prefix}.dm.policy)`);
		}
		if (canCanonicalizeTopLevel && !Array.isArray(topAllowFrom) && Array.isArray(nestedAllowFrom) && hasWildcard(nestedAllowFrom)) {
			account.allowFrom = [...nestedAllowFrom];
			delete dm?.allowFrom;
			changes.push(`- ${prefix}.allowFrom: moved ${hasWildcard(nestedAllowFrom) ? "wildcard " : ""}allowlist from ${prefix}.dm.allowFrom`);
		}
		if (dm && Object.keys(dm).length === 0) delete account.dm;
		if (mode === "nestedOnly") {
			if (hasWildcard(nestedAllowFrom)) return;
			if (dm && Array.isArray(nestedAllowFrom)) {
				dm.allowFrom = [...nestedAllowFrom, "*"];
				changes.push(`- ${prefix}.dm.allowFrom: added "*" (required by dmPolicy="open")`);
			} else {
				const nextDm = dm ?? {};
				nextDm.allowFrom = ["*"];
				account.dm = nextDm;
				changes.push(`- ${prefix}.dm.allowFrom: set to ["*"] (required by dmPolicy="open")`);
			}
			return;
		}
		if (mode === "topOrNested") {
			if (hasWildcard(topAllowFrom) || hasWildcard(nestedAllowFrom)) return;
			if (Array.isArray(topAllowFrom)) {
				account.allowFrom = [...topAllowFrom, "*"];
				changes.push(`- ${prefix}.allowFrom: added "*" (required by dmPolicy="open")`);
			} else if (dm && Array.isArray(nestedAllowFrom)) {
				dm.allowFrom = [...nestedAllowFrom, "*"];
				changes.push(`- ${prefix}.dm.allowFrom: added "*" (required by dmPolicy="open")`);
			} else {
				account.allowFrom = ["*"];
				changes.push(`- ${prefix}.allowFrom: set to ["*"] (required by dmPolicy="open")`);
			}
			return;
		}
		if (hasWildcard(topAllowFrom)) return;
		if (Array.isArray(topAllowFrom)) {
			account.allowFrom = [...topAllowFrom, "*"];
			changes.push(`- ${prefix}.allowFrom: added "*" (required by dmPolicy="open")`);
		} else {
			account.allowFrom = ["*"];
			changes.push(`- ${prefix}.allowFrom: set to ["*"] (required by dmPolicy="open")`);
		}
	};
	const nextChannels = next.channels;
	for (const [channelName, channelConfig] of Object.entries(nextChannels)) {
		if (!channelConfig || typeof channelConfig !== "object") continue;
		const allowFromMode = resolveAllowFromMode(channelName);
		ensureWildcard(channelConfig, `channels.${channelName}`, allowFromMode);
		const accounts = asObjectRecord(channelConfig.accounts);
		if (!accounts) continue;
		for (const [accountName, accountConfig] of Object.entries(accounts)) if (accountConfig && typeof accountConfig === "object") ensureWildcard(accountConfig, `channels.${channelName}.accounts.${accountName}`, allowFromMode);
	}
	if (changes.length === 0) return {
		config: cfg,
		changes: []
	};
	return {
		config: next,
		changes
	};
}
//#endregion
export { maybeRepairOpenPolicyAllowFrom as n, resolveAllowFromMode as r, collectOpenPolicyAllowFromWarnings as t };
