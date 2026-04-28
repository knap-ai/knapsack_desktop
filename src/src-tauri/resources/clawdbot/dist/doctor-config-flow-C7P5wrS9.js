import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as sanitizeForLog } from "./ansi-Dqm1lzVL.js";
import { t as CONFIG_PATH } from "./paths-B2cMK-wd.js";
import { t as formatCliCommand } from "./command-format-BORwwHyH.js";
import { r as normalizeChatChannelId } from "./ids-C5uBFLeA.js";
import { n as normalizeAccountId, r as normalizeOptionalAccountId } from "./account-id-DhSD7lhD.js";
import { B as findLegacyConfigIssues, D as validateConfigObjectWithPlugins, dt as applyChannelDoctorCompatibilityMigrations, et as normalizeBaseCompatibilityConfigValues, j as migrateLegacySecretRefEnvMarkers, nt as normalizeLegacyOpenAICodexModelsAddMetadata, tt as normalizeLegacyCommandsConfig, ut as applyLegacyDoctorMigrations } from "./io-CFdEhZuM.js";
import { n as formatConfigIssueLines } from "./issue-format-DUq-EpQO.js";
import { s as runPluginSetupConfigMigrations } from "./setup-registry-CAkjagL1.js";
import { i as listRouteBindings } from "./bindings-CW4fwMhh.js";
import { n as formatSetExplicitDefaultInstruction, r as formatSetExplicitDefaultToConfiguredInstruction, t as formatChannelAccountsDefaultPath } from "./default-account-warnings-D5-paUBE.js";
import { t as note } from "./note-B6LXIgud.js";
import { a as stripUnknownConfigKeys, r as noteOpencodeProviderOverrides } from "./doctor-config-analysis-Cnu2PafQ.js";
import { t as runDoctorConfigPreflight } from "./doctor-config-preflight-cXksRWC2.js";
import { t as applyDoctorConfigMutation } from "./config-mutation-state--Un8nIf2.js";
import { t as asObjectRecord } from "./object-BfccA70Y.js";
//#region src/commands/doctor/shared/legacy-config-core-migrate.ts
function normalizeCompatibilityConfigValues(cfg) {
	const changes = [];
	let next = normalizeBaseCompatibilityConfigValues(cfg, changes, (config) => {
		const setupMigration = runPluginSetupConfigMigrations({ config });
		if (setupMigration.changes.length === 0) return config;
		changes.push(...setupMigration.changes);
		return setupMigration.config;
	});
	const channelMigrations = applyChannelDoctorCompatibilityMigrations(next);
	if (channelMigrations.changes.length > 0) {
		next = channelMigrations.next;
		changes.push(...channelMigrations.changes);
	}
	const secretRefMarkers = migrateLegacySecretRefEnvMarkers(next);
	if (secretRefMarkers.changes.length > 0) {
		next = secretRefMarkers.config;
		changes.push(...secretRefMarkers.changes);
	}
	next = normalizeLegacyCommandsConfig(next, changes);
	next = normalizeLegacyOpenAICodexModelsAddMetadata(next, changes);
	return {
		config: next,
		changes
	};
}
//#endregion
//#region src/commands/doctor/emit-notes.ts
function sanitizeDoctorNote(note) {
	return note.split("\n").map((line) => sanitizeForLog(line)).join("\n");
}
function emitDoctorNotes(params) {
	for (const change of params.changeNotes ?? []) params.note(sanitizeDoctorNote(change), "Doctor changes");
	for (const warning of params.warningNotes ?? []) params.note(sanitizeDoctorNote(warning), "Doctor warnings");
}
//#endregion
//#region src/commands/doctor/finalize-config-flow.ts
async function finalizeDoctorConfigFlow(params) {
	if (!params.shouldRepair && params.pendingChanges) {
		if (await params.confirm({
			message: "Apply recommended config repairs now?",
			initialValue: true
		})) return {
			cfg: params.candidate,
			shouldWriteConfig: true
		};
		if (params.fixHints.length > 0) params.note(params.fixHints.join("\n"), "Doctor");
		return {
			cfg: params.cfg,
			shouldWriteConfig: false
		};
	}
	if (params.shouldRepair && params.pendingChanges) return {
		cfg: params.cfg,
		shouldWriteConfig: true
	};
	return {
		cfg: params.cfg,
		shouldWriteConfig: false
	};
}
//#endregion
//#region src/commands/doctor/shared/legacy-config-migrate.ts
function migrateLegacyConfig(raw) {
	const { next, changes } = applyLegacyDoctorMigrations(raw);
	if (!next) return {
		config: null,
		changes: []
	};
	const validated = validateConfigObjectWithPlugins(next);
	if (!validated.ok) {
		changes.push("Migration applied, but config still invalid; fix remaining issues manually.");
		return {
			config: null,
			changes
		};
	}
	return {
		config: validated.config,
		changes
	};
}
//#endregion
//#region src/commands/doctor/shared/config-flow-steps.ts
function applyLegacyCompatibilityStep(params) {
	if (params.snapshot.legacyIssues.length === 0) return {
		state: params.state,
		issueLines: [],
		changeLines: []
	};
	const issueLines = formatConfigIssueLines(params.snapshot.legacyIssues, "-");
	const { config: migrated, changes } = migrateLegacyConfig(params.snapshot.parsed);
	if (!migrated) return {
		state: {
			...params.state,
			pendingChanges: params.state.pendingChanges || params.snapshot.legacyIssues.length > 0,
			fixHints: params.shouldRepair ? params.state.fixHints : [...params.state.fixHints, `Run "${params.doctorFixCommand}" to migrate legacy config keys.`]
		},
		issueLines,
		changeLines: changes
	};
	return {
		state: {
			cfg: migrated,
			candidate: migrated,
			pendingChanges: params.state.pendingChanges || params.snapshot.legacyIssues.length > 0,
			fixHints: params.shouldRepair ? params.state.fixHints : [...params.state.fixHints, `Run "${params.doctorFixCommand}" to migrate legacy config keys.`]
		},
		issueLines,
		changeLines: changes
	};
}
function applyUnknownConfigKeyStep(params) {
	const unknown = stripUnknownConfigKeys(params.state.candidate);
	if (unknown.removed.length === 0) return {
		state: params.state,
		removed: []
	};
	return {
		state: {
			cfg: params.shouldRepair ? unknown.config : params.state.cfg,
			candidate: unknown.config,
			pendingChanges: true,
			fixHints: params.shouldRepair ? params.state.fixHints : [...params.state.fixHints, `Run "${params.doctorFixCommand}" to remove these keys.`]
		},
		removed: unknown.removed
	};
}
//#endregion
//#region src/commands/doctor/shared/default-account-warnings.ts
function normalizeBindingChannelKey(raw) {
	const normalized = normalizeChatChannelId(raw);
	if (normalized) return normalized;
	return normalizeLowercaseStringOrEmpty(raw);
}
function collectChannelsMissingDefaultAccount(cfg) {
	const channels = asObjectRecord(cfg.channels);
	if (!channels) return [];
	const contexts = [];
	for (const [channelKey, rawChannel] of Object.entries(channels)) {
		const channel = asObjectRecord(rawChannel);
		if (!channel) continue;
		const accounts = asObjectRecord(channel.accounts);
		if (!accounts) continue;
		const normalizedAccountIds = Array.from(new Set(Object.keys(accounts).map((accountId) => normalizeAccountId(accountId)).filter(Boolean))).toSorted((a, b) => a.localeCompare(b));
		if (normalizedAccountIds.length === 0 || normalizedAccountIds.includes("default")) continue;
		contexts.push({
			channelKey,
			channel,
			normalizedAccountIds
		});
	}
	return contexts;
}
function collectMissingDefaultAccountBindingWarnings(cfg) {
	const bindings = listRouteBindings(cfg);
	const warnings = [];
	for (const { channelKey, normalizedAccountIds } of collectChannelsMissingDefaultAccount(cfg)) {
		const accountIdSet = new Set(normalizedAccountIds);
		const channelPattern = normalizeBindingChannelKey(channelKey);
		let hasWildcardBinding = false;
		const coveredAccountIds = /* @__PURE__ */ new Set();
		for (const binding of bindings) {
			const bindingRecord = asObjectRecord(binding);
			if (!bindingRecord) continue;
			const match = asObjectRecord(bindingRecord.match);
			if (!match) continue;
			const matchChannel = typeof match.channel === "string" ? normalizeBindingChannelKey(match.channel) : "";
			if (!matchChannel || matchChannel !== channelPattern) continue;
			const rawAccountId = normalizeOptionalString(match.accountId) ?? "";
			if (!rawAccountId) continue;
			if (rawAccountId === "*") {
				hasWildcardBinding = true;
				continue;
			}
			const normalizedBindingAccountId = normalizeAccountId(rawAccountId);
			if (accountIdSet.has(normalizedBindingAccountId)) coveredAccountIds.add(normalizedBindingAccountId);
		}
		if (hasWildcardBinding) continue;
		const uncoveredAccountIds = normalizedAccountIds.filter((accountId) => !coveredAccountIds.has(accountId));
		if (uncoveredAccountIds.length === 0) continue;
		if (coveredAccountIds.size > 0) {
			warnings.push(`- channels.${channelKey}: accounts.default is missing and account bindings only cover a subset of configured accounts. Uncovered accounts: ${uncoveredAccountIds.join(", ")}. Add bindings[].match.accountId for uncovered accounts (or "*"), or add ${formatChannelAccountsDefaultPath(channelKey)}.`);
			continue;
		}
		warnings.push(`- channels.${channelKey}: accounts.default is missing and no valid account-scoped binding exists for configured accounts (${normalizedAccountIds.join(", ")}). Channel-only bindings (no accountId) match only default. Add bindings[].match.accountId for one of these accounts (or "*"), or add ${formatChannelAccountsDefaultPath(channelKey)}.`);
	}
	return warnings;
}
function collectMissingExplicitDefaultAccountWarnings(cfg) {
	const warnings = [];
	for (const { channelKey, channel, normalizedAccountIds } of collectChannelsMissingDefaultAccount(cfg)) {
		if (normalizedAccountIds.length < 2) continue;
		const preferredDefault = normalizeOptionalAccountId(typeof channel.defaultAccount === "string" ? channel.defaultAccount : void 0);
		if (preferredDefault) {
			if (normalizedAccountIds.includes(preferredDefault)) continue;
			warnings.push(`- channels.${channelKey}: defaultAccount is set to "${preferredDefault}" but does not match configured accounts (${normalizedAccountIds.join(", ")}). ${formatSetExplicitDefaultToConfiguredInstruction({ channelKey })} to avoid fallback routing.`);
			continue;
		}
		warnings.push(`- channels.${channelKey}: multiple accounts are configured but no explicit default is set. ${formatSetExplicitDefaultInstruction(channelKey)} to avoid fallback routing.`);
	}
	return warnings;
}
//#endregion
//#region src/commands/doctor-config-flow.ts
function hasLegacyInternalHookHandlers(raw) {
	const handlers = raw?.hooks?.internal?.handlers;
	return Array.isArray(handlers) && handlers.length > 0;
}
function collectConfiguredChannelIds(cfg) {
	const channels = cfg.channels && typeof cfg.channels === "object" && !Array.isArray(cfg.channels) ? cfg.channels : null;
	if (!channels) return [];
	return Object.keys(channels).filter((channelId) => channelId !== "defaults");
}
async function loadAndMaybeMigrateDoctorConfig(params) {
	const shouldRepair = params.options.repair === true || params.options.yes === true;
	const preflight = await runDoctorConfigPreflight({ repairPrefixedConfig: shouldRepair });
	let snapshot = preflight.snapshot;
	const baseCfg = preflight.baseConfig;
	let cfg = baseCfg;
	let candidate = structuredClone(baseCfg);
	let pendingChanges = false;
	let fixHints = [];
	const doctorFixCommand = formatCliCommand("openclaw doctor --fix");
	const legacyStep = applyLegacyCompatibilityStep({
		snapshot,
		state: {
			cfg,
			candidate,
			pendingChanges,
			fixHints
		},
		shouldRepair,
		doctorFixCommand
	});
	({cfg, candidate, pendingChanges, fixHints} = legacyStep.state);
	const pluginLegacyIssues = await (async () => {
		if (snapshot.parsed === snapshot.sourceConfig) return [];
		const { collectRelevantDoctorPluginIds, listPluginDoctorLegacyConfigRules } = await import("./doctor-contract-registry-DJOr2UcV.js");
		return findLegacyConfigIssues(snapshot.parsed, snapshot.parsed, listPluginDoctorLegacyConfigRules({ pluginIds: collectRelevantDoctorPluginIds(snapshot.parsed) }));
	})();
	const seenLegacyIssues = new Set(snapshot.legacyIssues.map((issue) => `${issue.path}:${issue.message}`));
	const pluginIssueLines = pluginLegacyIssues.filter((issue) => {
		const key = `${issue.path}:${issue.message}`;
		if (seenLegacyIssues.has(key)) return false;
		seenLegacyIssues.add(key);
		return true;
	}).map((issue) => `- ${issue.path}: ${issue.message}`);
	const legacyIssueLines = [...legacyStep.issueLines, ...pluginIssueLines];
	if (pluginIssueLines.length > 0 && !shouldRepair && !fixHints.includes(`Run "${doctorFixCommand}" to migrate legacy config keys.`)) fixHints = [...fixHints, `Run "${doctorFixCommand}" to migrate legacy config keys.`];
	if (legacyIssueLines.length > 0) note(legacyIssueLines.join("\n"), "Legacy config keys detected");
	if (legacyStep.changeLines.length > 0) note(legacyStep.changeLines.join("\n"), "Doctor changes");
	if (hasLegacyInternalHookHandlers(snapshot.parsed)) note([
		"- hooks.internal.handlers: legacy inline hook modules are no longer part of the public config surface.",
		"- Migrate each entry to a managed or workspace hook directory with HOOK.md + handler.js, then enable it through hooks.internal.entries.<hookKey> as needed.",
		"- openclaw doctor --fix does not rewrite this shape automatically."
	].join("\n"), "Legacy config keys detected");
	const normalized = normalizeCompatibilityConfigValues(candidate);
	if (normalized.changes.length > 0) {
		note(normalized.changes.join("\n"), "Doctor changes");
		({cfg, candidate, pendingChanges, fixHints} = applyDoctorConfigMutation({
			state: {
				cfg,
				candidate,
				pendingChanges,
				fixHints
			},
			mutation: normalized,
			shouldRepair,
			fixHint: `Run "${doctorFixCommand}" to apply these changes.`
		}));
	}
	const { applyPluginAutoEnable } = await import("./plugin-auto-enable-WbZGhMcE.js");
	const autoEnable = applyPluginAutoEnable({
		config: candidate,
		env: process.env
	});
	if (autoEnable.changes.length > 0) {
		note(autoEnable.changes.join("\n"), "Doctor changes");
		({cfg, candidate, pendingChanges, fixHints} = applyDoctorConfigMutation({
			state: {
				cfg,
				candidate,
				pendingChanges,
				fixHints
			},
			mutation: autoEnable,
			shouldRepair,
			fixHint: `Run "${doctorFixCommand}" to apply these changes.`
		}));
	}
	if (params.runtime && params.prompter) {
		const { maybeRepairBundledPluginRuntimeDeps } = await import("./doctor-bundled-plugin-runtime-deps-CiQxW0ig.js");
		await maybeRepairBundledPluginRuntimeDeps({
			runtime: params.runtime,
			prompter: params.prompter,
			config: candidate,
			includeConfiguredChannels: true
		});
	}
	const hasConfiguredChannels = collectConfiguredChannelIds(candidate).length > 0;
	let collectMutableAllowlistWarnings;
	if (hasConfiguredChannels) {
		const channelDoctor = await import("./channel-doctor-BnLhwCBB.js");
		collectMutableAllowlistWarnings = channelDoctor.collectChannelDoctorMutableAllowlistWarnings;
		const channelDoctorSequence = await channelDoctor.runChannelDoctorConfigSequences({
			cfg: candidate,
			env: process.env,
			shouldRepair
		});
		emitDoctorNotes({
			note,
			changeNotes: channelDoctorSequence.changeNotes,
			warningNotes: channelDoctorSequence.warningNotes
		});
		for (const staleCleanup of await channelDoctor.collectChannelDoctorStaleConfigMutations(candidate, { env: process.env })) {
			if (staleCleanup.changes.length === 0) continue;
			note(sanitizeDoctorNote(staleCleanup.changes.join("\n")), "Doctor changes");
			({cfg, candidate, pendingChanges, fixHints} = applyDoctorConfigMutation({
				state: {
					cfg,
					candidate,
					pendingChanges,
					fixHints
				},
				mutation: staleCleanup,
				shouldRepair,
				fixHint: `Run "${doctorFixCommand}" to remove stale channel plugin references.`
			}));
		}
	}
	const missingDefaultAccountBindingWarnings = collectMissingDefaultAccountBindingWarnings(candidate);
	if (missingDefaultAccountBindingWarnings.length > 0) note(missingDefaultAccountBindingWarnings.join("\n"), "Doctor warnings");
	const missingExplicitDefaultWarnings = collectMissingExplicitDefaultAccountWarnings(candidate);
	if (missingExplicitDefaultWarnings.length > 0) note(missingExplicitDefaultWarnings.join("\n"), "Doctor warnings");
	if (shouldRepair) {
		const { runDoctorRepairSequence } = await import("./repair-sequencing-BBG0gaFY.js");
		const repairSequence = await runDoctorRepairSequence({
			state: {
				cfg,
				candidate,
				pendingChanges,
				fixHints
			},
			doctorFixCommand,
			env: process.env
		});
		({cfg, candidate, pendingChanges, fixHints} = repairSequence.state);
		emitDoctorNotes({
			note,
			changeNotes: repairSequence.changeNotes,
			warningNotes: repairSequence.warningNotes
		});
	} else {
		const { collectDoctorPreviewWarnings } = await import("./preview-warnings-1oNkUWlj.js");
		emitDoctorNotes({
			note,
			warningNotes: await collectDoctorPreviewWarnings({
				cfg: candidate,
				doctorFixCommand,
				env: process.env
			})
		});
	}
	const mutableAllowlistWarnings = collectMutableAllowlistWarnings ? await collectMutableAllowlistWarnings({
		cfg: candidate,
		env: process.env
	}) : [];
	if (mutableAllowlistWarnings.length > 0) note(sanitizeDoctorNote(mutableAllowlistWarnings.join("\n")), "Doctor warnings");
	const unknownStep = applyUnknownConfigKeyStep({
		state: {
			cfg,
			candidate,
			pendingChanges,
			fixHints
		},
		shouldRepair,
		doctorFixCommand
	});
	({cfg, candidate, pendingChanges, fixHints} = unknownStep.state);
	if (unknownStep.removed.length > 0) note(unknownStep.removed.map((path) => `- ${path}`).join("\n"), shouldRepair ? "Doctor changes" : "Unknown config keys");
	const finalized = await finalizeDoctorConfigFlow({
		cfg,
		candidate,
		pendingChanges,
		shouldRepair,
		fixHints,
		confirm: params.confirm,
		note
	});
	cfg = finalized.cfg;
	noteOpencodeProviderOverrides(cfg);
	return {
		cfg,
		path: snapshot.path ?? CONFIG_PATH,
		shouldWriteConfig: finalized.shouldWriteConfig,
		sourceConfigValid: snapshot.valid
	};
}
//#endregion
export { loadAndMaybeMigrateDoctorConfig };
