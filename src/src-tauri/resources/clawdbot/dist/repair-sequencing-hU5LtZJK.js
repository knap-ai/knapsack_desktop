import { s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { r as normalizeChatChannelId } from "./ids-2bZIXJNM.js";
import { t as sanitizeForLog } from "./ansi-BZHMLcUk.js";
import { s as normalizeStringEntries } from "./string-normalization-Bvcn03I9.js";
import { n as normalizeAccountId } from "./account-id-C3j_3_su.js";
import { a as readChannelAllowFromStore } from "./pairing-store-BqyKPFa6.js";
import { a as collectChannelDoctorRepairMutations, s as createChannelDoctorEmptyAllowlistPolicyHooks } from "./channel-doctor-DUcrDoUh.js";
import { t as applyDoctorConfigMutation } from "./config-mutation-state-BnZ8wjUs.js";
import { t as asObjectRecord } from "./object-DG5cjPE5.js";
import { n as maybeRepairOpenPolicyAllowFrom, r as resolveAllowFromMode } from "./open-policy-allowfrom-IxBSDNBq.js";
import { n as hasAllowFromEntries, t as scanEmptyAllowlistPolicyWarnings } from "./empty-allowlist-scan-CecsqJ95.js";
import { n as maybeRepairBundledPluginLoadPaths } from "./bundled-plugin-load-paths-78z1hWHR.js";
import { r as maybeRepairExecSafeBinProfiles } from "./exec-safe-bins-BSU1VDsG.js";
import { n as maybeRepairLegacyToolsBySenderKeys } from "./legacy-tools-by-sender-ghTyDBaR.js";
import { r as maybeRepairStalePluginConfig } from "./stale-plugin-config-Cc96PZ8x.js";
//#region src/commands/doctor/shared/allowlist-policy-repair.ts
async function maybeRepairAllowlistPolicyAllowFrom(cfg) {
	const channels = cfg.channels;
	if (!channels || typeof channels !== "object") return {
		config: cfg,
		changes: []
	};
	const next = structuredClone(cfg);
	const changes = [];
	const applyRecoveredAllowFrom = (params) => {
		const count = params.allowFrom.length;
		const noun = count === 1 ? "entry" : "entries";
		if (params.mode === "nestedOnly") {
			const dmEntry = params.account.dm;
			const dm = dmEntry && typeof dmEntry === "object" && !Array.isArray(dmEntry) ? dmEntry : {};
			dm.allowFrom = params.allowFrom;
			params.account.dm = dm;
			changes.push(`- ${params.prefix}.dm.allowFrom: restored ${count} sender ${noun} from pairing store (dmPolicy="allowlist").`);
			return;
		}
		if (params.mode === "topOrNested") {
			const dmEntry = params.account.dm;
			const dm = dmEntry && typeof dmEntry === "object" && !Array.isArray(dmEntry) ? dmEntry : void 0;
			const nestedAllowFrom = dm?.allowFrom;
			if (dm && !Array.isArray(params.account.allowFrom) && Array.isArray(nestedAllowFrom)) {
				dm.allowFrom = params.allowFrom;
				changes.push(`- ${params.prefix}.dm.allowFrom: restored ${count} sender ${noun} from pairing store (dmPolicy="allowlist").`);
				return;
			}
		}
		params.account.allowFrom = params.allowFrom;
		changes.push(`- ${params.prefix}.allowFrom: restored ${count} sender ${noun} from pairing store (dmPolicy="allowlist").`);
	};
	const recoverAllowFromForAccount = async (params) => {
		const dmEntry = params.account.dm;
		const dm = dmEntry && typeof dmEntry === "object" && !Array.isArray(dmEntry) ? dmEntry : void 0;
		if ((params.account.dmPolicy ?? dm?.policy) !== "allowlist") return;
		const topAllowFrom = params.account.allowFrom;
		const nestedAllowFrom = dm?.allowFrom;
		if (hasAllowFromEntries(topAllowFrom) || hasAllowFromEntries(nestedAllowFrom)) return;
		const normalizedChannelId = normalizeOptionalLowercaseString(normalizeChatChannelId(params.channelName) ?? params.channelName);
		if (!normalizedChannelId) return;
		const normalizedAccountId = normalizeAccountId(params.accountId) || "default";
		const fromStore = await readChannelAllowFromStore(normalizedChannelId, process.env, normalizedAccountId).catch(() => []);
		const recovered = Array.from(new Set(normalizeStringEntries(fromStore)));
		if (recovered.length === 0) return;
		applyRecoveredAllowFrom({
			account: params.account,
			allowFrom: recovered,
			mode: resolveAllowFromMode(params.channelName),
			prefix: params.prefix
		});
	};
	const nextChannels = next.channels;
	for (const [channelName, channelConfig] of Object.entries(nextChannels)) {
		if (!channelConfig || typeof channelConfig !== "object") continue;
		if (channelConfig.enabled === false) continue;
		await recoverAllowFromForAccount({
			channelName,
			account: channelConfig,
			prefix: `channels.${channelName}`
		});
		const accounts = asObjectRecord(channelConfig.accounts);
		if (!accounts) continue;
		for (const [accountId, accountConfig] of Object.entries(accounts)) {
			if (!accountConfig || typeof accountConfig !== "object") continue;
			if (accountConfig.enabled === false) continue;
			await recoverAllowFromForAccount({
				channelName,
				account: accountConfig,
				accountId,
				prefix: `channels.${channelName}.accounts.${accountId}`
			});
		}
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
//#region src/commands/doctor/repair-sequencing.ts
async function runDoctorRepairSequence(params) {
	let state = params.state;
	const changeNotes = [];
	const warningNotes = [];
	const env = params.env ?? process.env;
	const sanitizeLines = (lines) => lines.map((line) => sanitizeForLog(line)).join("\n");
	const applyMutation = (mutation) => {
		if (mutation.changes.length > 0) {
			changeNotes.push(sanitizeLines(mutation.changes));
			state = applyDoctorConfigMutation({
				state,
				mutation,
				shouldRepair: true
			});
		}
		if (mutation.warnings && mutation.warnings.length > 0) warningNotes.push(sanitizeLines(mutation.warnings));
	};
	for (const mutation of await collectChannelDoctorRepairMutations({
		cfg: state.candidate,
		doctorFixCommand: params.doctorFixCommand,
		env
	})) applyMutation(mutation);
	applyMutation(maybeRepairOpenPolicyAllowFrom(state.candidate));
	applyMutation(maybeRepairBundledPluginLoadPaths(state.candidate, env));
	applyMutation(maybeRepairStalePluginConfig(state.candidate, env));
	applyMutation(await maybeRepairAllowlistPolicyAllowFrom(state.candidate));
	const emptyAllowlistWarnings = scanEmptyAllowlistPolicyWarnings(state.candidate, {
		doctorFixCommand: params.doctorFixCommand,
		...createChannelDoctorEmptyAllowlistPolicyHooks({
			cfg: state.candidate,
			env
		})
	});
	if (emptyAllowlistWarnings.length > 0) warningNotes.push(sanitizeLines(emptyAllowlistWarnings));
	applyMutation(maybeRepairLegacyToolsBySenderKeys(state.candidate));
	applyMutation(maybeRepairExecSafeBinProfiles(state.candidate));
	return {
		state,
		changeNotes,
		warningNotes
	};
}
//#endregion
export { runDoctorRepairSequence };
