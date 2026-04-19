import { n as requiresExplicitMatrixDefaultAccount, o as isRecord } from "./account-selection-Dbr-o5gC.js";
import { s as resolveMatrixAccountConfig, t as resolveMatrixConfigFieldPath } from "./config-paths-DE1oT8pD.js";
import { l as resolveValidatedMatrixHomeserverUrl, s as resolveMatrixEnvAuthReadiness, u as validateMatrixHomeserverUrl } from "./config-CjEkxZYF.js";
import "./env-auth-BtG17DuM.js";
import { i as resolveMatrixAccount, r as resolveDefaultMatrixAccountId, t as listMatrixAccountIds } from "./accounts-B8C2wBWb.js";
import { N as splitSetupEntries, _ as normalizeAccountId$1, b as promptChannelAccessConfig, f as hasConfiguredSecretInput, g as mergeAllowFromEntries, l as formatDocsLink, p as isPrivateOrLoopbackHost, r as addWildcardAllowFrom, y as promptAccountId } from "./runtime-api-CvFdrnSv.js";
import { n as moveSingleMatrixAccountConfigToNamedAccount } from "./setup-core-bc_eggTU.js";
import { n as updateMatrixAccountConfig } from "./config-update-CZrXhUGk.js";
import "./client-DqoFZ3x6.js";
import { n as listMatrixDirectoryGroupsLive, t as resolveMatrixTargets } from "./resolve-targets-DuKsiJul.js";
import { i as isMatrixSdkAvailable, r as ensureMatrixSdkInstalled } from "./deps-D02bAKQY.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString, normalizeStringifiedOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk/account-id";
import { hasLegacyFlatAllowPrivateNetworkAlias, isPrivateNetworkOptInEnabled, migrateLegacyFlatAllowPrivateNetworkAlias } from "openclaw/plugin-sdk/ssrf-runtime";
//#region extensions/matrix/src/doctor-contract.ts
function hasLegacyMatrixRoomAllowAlias(value) {
	const room = isRecord(value) ? value : null;
	return Boolean(room && typeof room.allow === "boolean");
}
function hasLegacyMatrixRoomMapAllowAliases(value) {
	const rooms = isRecord(value) ? value : null;
	return Boolean(rooms && Object.values(rooms).some((room) => hasLegacyMatrixRoomAllowAlias(room)));
}
function hasLegacyMatrixAccountRoomAllowAliases(value) {
	const accounts = isRecord(value) ? value : null;
	if (!accounts) return false;
	return Object.values(accounts).some((account) => {
		if (!isRecord(account)) return false;
		return hasLegacyMatrixRoomMapAllowAliases(account.groups) || hasLegacyMatrixRoomMapAllowAliases(account.rooms);
	});
}
function hasLegacyMatrixAccountPrivateNetworkAliases(value) {
	const accounts = isRecord(value) ? value : null;
	if (!accounts) return false;
	return Object.values(accounts).some((account) => hasLegacyFlatAllowPrivateNetworkAlias(isRecord(account) ? account : {}));
}
function hasLegacyTrustedDmPolicy(value) {
	const root = isRecord(value) ? value : null;
	if (!root) return false;
	return (isRecord(root.dm) ? root.dm : null)?.policy === "trusted";
}
function hasLegacyMatrixAccountTrustedDmPolicies(value) {
	const accounts = isRecord(value) ? value : null;
	if (!accounts) return false;
	return Object.values(accounts).some((account) => hasLegacyTrustedDmPolicy(account));
}
function migrateLegacyTrustedDmPolicy(params) {
	const dm = isRecord(params.entry.dm) ? params.entry.dm : null;
	if (!dm || dm.policy !== "trusted") return {
		entry: params.entry,
		changed: false
	};
	const allowFromRaw = dm.allowFrom;
	const allowFromEntries = Array.isArray(allowFromRaw) ? allowFromRaw.filter((entry) => typeof entry === "string" && entry.trim().length > 0).length : 0;
	const nextPolicy = allowFromEntries > 0 ? "allowlist" : "pairing";
	const nextDm = {
		...dm,
		policy: nextPolicy
	};
	params.changes.push(`Migrated ${params.pathPrefix}.dm.policy "trusted" → "${nextPolicy}" (legacy alias removed; ${allowFromEntries > 0 ? `preserved ${allowFromEntries} ${params.pathPrefix}.dm.allowFrom ${allowFromEntries === 1 ? "entry" : "entries"}` : "no allowFrom entries present, defaulting to pairing for safety"}).`);
	return {
		entry: {
			...params.entry,
			dm: nextDm
		},
		changed: true
	};
}
function normalizeMatrixRoomAllowAliases(params) {
	let changed = false;
	const nextRooms = { ...params.rooms };
	for (const [roomId, roomValue] of Object.entries(params.rooms)) {
		const room = isRecord(roomValue) ? roomValue : null;
		if (!room || typeof room.allow !== "boolean") continue;
		const nextRoom = { ...room };
		if (typeof nextRoom.enabled !== "boolean") nextRoom.enabled = room.allow;
		delete nextRoom.allow;
		nextRooms[roomId] = nextRoom;
		changed = true;
		params.changes.push(`Moved ${params.pathPrefix}.${roomId}.allow → ${params.pathPrefix}.${roomId}.enabled (${String(nextRoom.enabled)}).`);
	}
	return {
		rooms: nextRooms,
		changed
	};
}
const legacyConfigRules = [
	{
		path: ["channels", "matrix"],
		message: "channels.matrix.allowPrivateNetwork is legacy; use channels.matrix.network.dangerouslyAllowPrivateNetwork instead. Run \"openclaw doctor --fix\".",
		match: (value) => hasLegacyFlatAllowPrivateNetworkAlias(isRecord(value) ? value : {})
	},
	{
		path: [
			"channels",
			"matrix",
			"accounts"
		],
		message: "channels.matrix.accounts.<id>.allowPrivateNetwork is legacy; use channels.matrix.accounts.<id>.network.dangerouslyAllowPrivateNetwork instead. Run \"openclaw doctor --fix\".",
		match: hasLegacyMatrixAccountPrivateNetworkAliases
	},
	{
		path: [
			"channels",
			"matrix",
			"groups"
		],
		message: "channels.matrix.groups.<room>.allow is legacy; use channels.matrix.groups.<room>.enabled instead. Run \"openclaw doctor --fix\".",
		match: hasLegacyMatrixRoomMapAllowAliases
	},
	{
		path: [
			"channels",
			"matrix",
			"rooms"
		],
		message: "channels.matrix.rooms.<room>.allow is legacy; use channels.matrix.rooms.<room>.enabled instead. Run \"openclaw doctor --fix\".",
		match: hasLegacyMatrixRoomMapAllowAliases
	},
	{
		path: [
			"channels",
			"matrix",
			"accounts"
		],
		message: "channels.matrix.accounts.<id>.{groups,rooms}.<room>.allow is legacy; use channels.matrix.accounts.<id>.{groups,rooms}.<room>.enabled instead. Run \"openclaw doctor --fix\".",
		match: hasLegacyMatrixAccountRoomAllowAliases
	},
	{
		path: ["channels", "matrix"],
		message: "channels.matrix.dm.policy \"trusted\" is legacy; use \"allowlist\" (with allowFrom entries) or \"pairing\" instead. Run \"openclaw doctor --fix\".",
		match: hasLegacyTrustedDmPolicy
	},
	{
		path: [
			"channels",
			"matrix",
			"accounts"
		],
		message: "channels.matrix.accounts.<id>.dm.policy \"trusted\" is legacy; use \"allowlist\" (with allowFrom entries) or \"pairing\" instead. Run \"openclaw doctor --fix\".",
		match: hasLegacyMatrixAccountTrustedDmPolicies
	}
];
function normalizeCompatibilityConfig({ cfg }) {
	const channels = isRecord(cfg.channels) ? cfg.channels : null;
	const matrix = isRecord(channels?.matrix) ? channels.matrix : null;
	if (!matrix) return {
		config: cfg,
		changes: []
	};
	const changes = [];
	let updatedMatrix = matrix;
	let changed = false;
	const topLevelPrivateNetwork = migrateLegacyFlatAllowPrivateNetworkAlias({
		entry: updatedMatrix,
		pathPrefix: "channels.matrix",
		changes
	});
	updatedMatrix = topLevelPrivateNetwork.entry;
	changed = changed || topLevelPrivateNetwork.changed;
	const topLevelTrustedDmPolicy = migrateLegacyTrustedDmPolicy({
		entry: updatedMatrix,
		pathPrefix: "channels.matrix",
		changes
	});
	updatedMatrix = topLevelTrustedDmPolicy.entry;
	changed = changed || topLevelTrustedDmPolicy.changed;
	const normalizeTopLevelRoomScope = (key) => {
		const rooms = isRecord(updatedMatrix[key]) ? updatedMatrix[key] : null;
		if (!rooms) return;
		const normalized = normalizeMatrixRoomAllowAliases({
			rooms,
			pathPrefix: `channels.matrix.${key}`,
			changes
		});
		if (normalized.changed) {
			updatedMatrix = {
				...updatedMatrix,
				[key]: normalized.rooms
			};
			changed = true;
		}
	};
	normalizeTopLevelRoomScope("groups");
	normalizeTopLevelRoomScope("rooms");
	const accounts = isRecord(updatedMatrix.accounts) ? updatedMatrix.accounts : null;
	if (accounts) {
		let accountsChanged = false;
		const nextAccounts = { ...accounts };
		for (const [accountId, accountValue] of Object.entries(accounts)) {
			const account = isRecord(accountValue) ? accountValue : null;
			if (!account) continue;
			let nextAccount = account;
			let accountChanged = false;
			const privateNetworkMigration = migrateLegacyFlatAllowPrivateNetworkAlias({
				entry: nextAccount,
				pathPrefix: `channels.matrix.accounts.${accountId}`,
				changes
			});
			if (privateNetworkMigration.changed) {
				nextAccount = privateNetworkMigration.entry;
				accountChanged = true;
			}
			const accountTrustedDmPolicy = migrateLegacyTrustedDmPolicy({
				entry: nextAccount,
				pathPrefix: `channels.matrix.accounts.${accountId}`,
				changes
			});
			if (accountTrustedDmPolicy.changed) {
				nextAccount = accountTrustedDmPolicy.entry;
				accountChanged = true;
			}
			for (const key of ["groups", "rooms"]) {
				const rooms = isRecord(nextAccount[key]) ? nextAccount[key] : null;
				if (!rooms) continue;
				const normalized = normalizeMatrixRoomAllowAliases({
					rooms,
					pathPrefix: `channels.matrix.accounts.${accountId}.${key}`,
					changes
				});
				if (normalized.changed) {
					nextAccount = {
						...nextAccount,
						[key]: normalized.rooms
					};
					accountChanged = true;
				}
			}
			if (accountChanged) {
				nextAccounts[accountId] = nextAccount;
				accountsChanged = true;
			}
		}
		if (accountsChanged) {
			updatedMatrix = {
				...updatedMatrix,
				accounts: nextAccounts
			};
			changed = true;
		}
	}
	if (!changed) return {
		config: cfg,
		changes: []
	};
	return {
		config: {
			...cfg,
			channels: {
				...cfg.channels,
				matrix: updatedMatrix
			}
		},
		changes
	};
}
//#endregion
//#region extensions/matrix/src/onboarding.ts
const channel = "matrix";
const matrixInviteAutoJoinOptions = [
	{
		value: "allowlist",
		label: "Allowlist (recommended)"
	},
	{
		value: "always",
		label: "Always (join every invite)"
	},
	{
		value: "off",
		label: "Off (do not auto-join invites)"
	}
];
function isMatrixInviteAutoJoinPolicy(value) {
	return value === "allowlist" || value === "always" || value === "off";
}
function isMatrixInviteAutoJoinTarget(entry) {
	return entry === "*" || entry.startsWith("!") && entry.includes(":") || entry.startsWith("#") && entry.includes(":");
}
function normalizeMatrixInviteAutoJoinTargets(entries) {
	return [...new Set(entries.map((entry) => normalizeOptionalString(entry)).filter((entry) => Boolean(entry)))];
}
function resolveMatrixOnboardingAccountId(cfg, accountId) {
	return normalizeAccountId$1(normalizeOptionalString(accountId) || resolveDefaultMatrixAccountId(cfg) || DEFAULT_ACCOUNT_ID);
}
function setMatrixDmPolicy(cfg, policy, accountId) {
	const resolvedAccountId = resolveMatrixOnboardingAccountId(cfg, accountId);
	const existing = resolveMatrixAccountConfig({
		cfg,
		accountId: resolvedAccountId
	});
	const allowFrom = policy === "open" ? addWildcardAllowFrom(existing.dm?.allowFrom) : void 0;
	return updateMatrixAccountConfig(cfg, resolvedAccountId, { dm: {
		...existing.dm,
		policy,
		...allowFrom ? { allowFrom } : {}
	} });
}
async function noteMatrixAuthHelp(prompter) {
	await prompter.note([
		"Matrix requires a homeserver URL.",
		"Use an access token (recommended) or password login to an existing account.",
		"With access token: user ID is fetched automatically.",
		"Env vars supported: MATRIX_HOMESERVER, MATRIX_USER_ID, MATRIX_ACCESS_TOKEN, MATRIX_PASSWORD, MATRIX_DEVICE_ID, MATRIX_DEVICE_NAME.",
		"Per-account env vars: MATRIX_<ACCOUNT_ID>_HOMESERVER, MATRIX_<ACCOUNT_ID>_USER_ID, MATRIX_<ACCOUNT_ID>_ACCESS_TOKEN, MATRIX_<ACCOUNT_ID>_PASSWORD, MATRIX_<ACCOUNT_ID>_DEVICE_ID, MATRIX_<ACCOUNT_ID>_DEVICE_NAME.",
		`Docs: ${formatDocsLink("/channels/matrix", "channels/matrix")}`
	].join("\n"), "Matrix setup");
}
function requiresMatrixPrivateNetworkOptIn(homeserver) {
	try {
		const parsed = new URL(homeserver);
		return parsed.protocol === "http:" && !isPrivateOrLoopbackHost(parsed.hostname);
	} catch {
		return false;
	}
}
async function promptMatrixAllowFrom(params) {
	const { cfg, prompter } = params;
	const accountId = resolveMatrixOnboardingAccountId(cfg, params.accountId);
	const existingConfig = resolveMatrixAccountConfig({
		cfg,
		accountId
	});
	const existingAllowFrom = existingConfig.dm?.allowFrom ?? [];
	const canResolve = resolveMatrixAccount({
		cfg,
		accountId
	}).configured;
	const isFullUserId = (value) => value.startsWith("@") && value.includes(":");
	while (true) {
		const parts = splitSetupEntries(await prompter.text({
			message: "Matrix allowFrom (full @user:server; display name only if unique)",
			placeholder: "@user:server",
			initialValue: existingAllowFrom[0] ? String(existingAllowFrom[0]) : void 0,
			validate: (value) => normalizeOptionalString(value) ? void 0 : "Required"
		}));
		const resolvedIds = [];
		const pending = [];
		const unresolved = [];
		const unresolvedNotes = [];
		for (const part of parts) {
			if (isFullUserId(part)) {
				resolvedIds.push(part);
				continue;
			}
			if (!canResolve) {
				unresolved.push(part);
				continue;
			}
			pending.push(part);
		}
		if (pending.length > 0) {
			const results = await resolveMatrixTargets({
				cfg,
				accountId,
				inputs: pending,
				kind: "user"
			}).catch(() => []);
			for (const result of results) {
				if (result?.resolved && result.id) {
					resolvedIds.push(result.id);
					continue;
				}
				if (result?.input) {
					unresolved.push(result.input);
					if (result.note) unresolvedNotes.push(`${result.input}: ${result.note}`);
				}
			}
		}
		if (unresolved.length > 0) {
			const details = unresolvedNotes.length > 0 ? unresolvedNotes : unresolved;
			await prompter.note(`Could not resolve:\n${details.join("\n")}\nUse full @user:server IDs.`, "Matrix allowlist");
			continue;
		}
		const unique = mergeAllowFromEntries(existingAllowFrom, resolvedIds);
		return updateMatrixAccountConfig(cfg, accountId, { dm: {
			...existingConfig.dm,
			policy: "allowlist",
			allowFrom: unique
		} });
	}
}
function setMatrixGroupPolicy(cfg, groupPolicy, accountId) {
	return updateMatrixAccountConfig(cfg, resolveMatrixOnboardingAccountId(cfg, accountId), { groupPolicy });
}
function setMatrixGroupRooms(cfg, roomKeys, accountId) {
	const groups = Object.fromEntries(roomKeys.map((key) => [key, { enabled: true }]));
	return updateMatrixAccountConfig(cfg, resolveMatrixOnboardingAccountId(cfg, accountId), {
		groups,
		rooms: null
	});
}
function setMatrixAutoJoin(cfg, autoJoin, autoJoinAllowlist, accountId) {
	return updateMatrixAccountConfig(cfg, resolveMatrixOnboardingAccountId(cfg, accountId), {
		autoJoin,
		autoJoinAllowlist: autoJoin === "allowlist" ? autoJoinAllowlist : null
	});
}
async function configureMatrixInviteAutoJoin(params) {
	const accountId = resolveMatrixOnboardingAccountId(params.cfg, params.accountId);
	const existingConfig = resolveMatrixAccountConfig({
		cfg: params.cfg,
		accountId
	});
	const currentPolicy = existingConfig.autoJoin ?? "off";
	const currentAllowlist = (existingConfig.autoJoinAllowlist ?? []).map((entry) => String(entry));
	const hasExistingConfig = existingConfig.autoJoin !== void 0 || currentAllowlist.length > 0;
	await params.prompter.note([
		"WARNING: Matrix invite auto-join defaults to off.",
		"OpenClaw agents will not join invited rooms or fresh DM-style invites unless you set autoJoin.",
		"Choose \"allowlist\" to restrict joins or \"always\" to join every invite."
	].join("\n"), "Matrix invite auto-join");
	if (!await params.prompter.confirm({
		message: hasExistingConfig ? "Update Matrix invite auto-join?" : "Configure Matrix invite auto-join?",
		initialValue: hasExistingConfig ? currentPolicy !== "off" : true
	})) return params.cfg;
	const selectedPolicy = await params.prompter.select({
		message: "Matrix invite auto-join",
		options: matrixInviteAutoJoinOptions,
		initialValue: currentPolicy
	});
	if (!isMatrixInviteAutoJoinPolicy(selectedPolicy)) throw new Error(`Unsupported Matrix invite auto-join policy: ${String(selectedPolicy)}`);
	const policy = selectedPolicy;
	if (policy === "off") {
		await params.prompter.note(["Matrix invite auto-join remains off.", "Agents will not join invited rooms or fresh DM-style invites until you change autoJoin."].join("\n"), "Matrix invite auto-join");
		return setMatrixAutoJoin(params.cfg, policy, [], accountId);
	}
	if (policy === "always") return setMatrixAutoJoin(params.cfg, policy, [], accountId);
	while (true) {
		const allowlist = normalizeMatrixInviteAutoJoinTargets(splitSetupEntries(await params.prompter.text({
			message: "Matrix invite auto-join allowlist (comma-separated)",
			placeholder: "!roomId:server, #alias:server, *",
			initialValue: currentAllowlist[0] ? currentAllowlist.join(", ") : void 0,
			validate: (value) => {
				return splitSetupEntries(value).length > 0 ? void 0 : "Required";
			}
		})));
		const invalidEntries = allowlist.filter((entry) => !isMatrixInviteAutoJoinTarget(entry));
		if (allowlist.length === 0 || invalidEntries.length > 0) {
			await params.prompter.note(["Use only stable Matrix invite targets for auto-join: !roomId:server, #alias:server, or *.", invalidEntries.length > 0 ? `Invalid: ${invalidEntries.join(", ")}` : void 0].filter(Boolean).join("\n"), "Matrix invite auto-join");
			continue;
		}
		return setMatrixAutoJoin(params.cfg, "allowlist", allowlist, accountId);
	}
}
async function configureMatrixAccessPrompts(params) {
	let next = params.cfg;
	if (params.forceAllowFrom) next = await promptMatrixAllowFrom({
		cfg: next,
		prompter: params.prompter,
		accountId: params.accountId
	});
	const existingAccountConfig = resolveMatrixAccountConfig({
		cfg: next,
		accountId: params.accountId
	});
	const existingGroups = existingAccountConfig.groups ?? existingAccountConfig.rooms;
	const accessConfig = await promptChannelAccessConfig({
		prompter: params.prompter,
		label: "Matrix rooms",
		currentPolicy: existingAccountConfig.groupPolicy ?? "allowlist",
		currentEntries: Object.keys(existingGroups ?? {}),
		placeholder: "!roomId:server, #alias:server, Project Room",
		updatePrompt: Boolean(existingGroups)
	});
	if (accessConfig) if (accessConfig.policy !== "allowlist") next = setMatrixGroupPolicy(next, accessConfig.policy, params.accountId);
	else {
		let roomKeys = accessConfig.entries;
		if (accessConfig.entries.length > 0) try {
			const resolvedIds = [];
			const unresolved = [];
			for (const entry of accessConfig.entries) {
				const trimmed = normalizeOptionalString(entry) ?? "";
				if (!trimmed) continue;
				const cleaned = trimmed.replace(/^(room|channel):/i, "").trim();
				if (cleaned.startsWith("!") && cleaned.includes(":")) {
					resolvedIds.push(cleaned);
					continue;
				}
				const matches = await listMatrixDirectoryGroupsLive({
					cfg: next,
					accountId: params.accountId,
					query: trimmed,
					limit: 10
				});
				const best = matches.find((match) => normalizeLowercaseStringOrEmpty(match.name) === normalizeLowercaseStringOrEmpty(trimmed)) ?? matches[0];
				if (best?.id) resolvedIds.push(best.id);
				else unresolved.push(entry);
			}
			roomKeys = [...resolvedIds, ...unresolved.map((entry) => normalizeOptionalString(entry)).filter((entry) => Boolean(entry))];
			if (resolvedIds.length > 0 || unresolved.length > 0) await params.prompter.note([resolvedIds.length > 0 ? `Resolved: ${resolvedIds.join(", ")}` : void 0, unresolved.length > 0 ? `Unresolved (kept as typed): ${unresolved.join(", ")}` : void 0].filter(Boolean).join("\n"), "Matrix rooms");
		} catch (err) {
			await params.prompter.note(`Room lookup failed; keeping entries as typed. ${String(err)}`, "Matrix rooms");
		}
		next = setMatrixGroupPolicy(next, "allowlist", params.accountId);
		next = setMatrixGroupRooms(next, roomKeys, params.accountId);
	}
	return await configureMatrixInviteAutoJoin({
		cfg: next,
		prompter: params.prompter,
		accountId: params.accountId
	});
}
const dmPolicy = {
	label: "Matrix",
	channel,
	policyKey: "channels.matrix.dm.policy",
	allowFromKey: "channels.matrix.dm.allowFrom",
	resolveConfigKeys: (cfg, accountId) => {
		const effectiveAccountId = resolveMatrixOnboardingAccountId(cfg, accountId);
		return {
			policyKey: resolveMatrixConfigFieldPath(cfg, effectiveAccountId, "dm.policy"),
			allowFromKey: resolveMatrixConfigFieldPath(cfg, effectiveAccountId, "dm.allowFrom")
		};
	},
	getCurrent: (cfg, accountId) => resolveMatrixAccountConfig({
		cfg,
		accountId: resolveMatrixOnboardingAccountId(cfg, accountId)
	}).dm?.policy ?? "pairing",
	setPolicy: (cfg, policy, accountId) => setMatrixDmPolicy(cfg, policy, accountId),
	promptAllowFrom: promptMatrixAllowFrom
};
async function runMatrixConfigure(params) {
	let next = params.cfg;
	await ensureMatrixSdkInstalled({
		runtime: params.runtime,
		confirm: async (message) => await params.prompter.confirm({
			message,
			initialValue: true
		})
	});
	const defaultAccountId = resolveDefaultMatrixAccountId(next);
	let accountId = defaultAccountId || DEFAULT_ACCOUNT_ID;
	if (params.intent === "add-account") {
		const enteredName = normalizeStringifiedOptionalString(await params.prompter.text({
			message: "Matrix account name",
			validate: (value) => normalizeOptionalString(value) ? void 0 : "Required"
		})) ?? "";
		accountId = normalizeAccountId$1(enteredName);
		if (enteredName !== accountId) await params.prompter.note(`Account id will be "${accountId}".`, "Matrix account");
		if (accountId !== DEFAULT_ACCOUNT_ID) next = moveSingleMatrixAccountConfigToNamedAccount(next);
		next = updateMatrixAccountConfig(next, accountId, {
			name: enteredName,
			enabled: true
		});
	} else {
		const override = normalizeOptionalString(params.accountOverrides?.[channel]);
		if (override) accountId = normalizeAccountId$1(override);
		else if (params.shouldPromptAccountIds) accountId = await promptAccountId({
			cfg: next,
			prompter: params.prompter,
			label: "Matrix",
			currentId: accountId,
			listAccountIds: (inputCfg) => listMatrixAccountIds(inputCfg),
			defaultAccountId
		});
	}
	const existing = resolveMatrixAccountConfig({
		cfg: next,
		accountId
	});
	if (!resolveMatrixAccount({
		cfg: next,
		accountId
	}).configured) await noteMatrixAuthHelp(params.prompter);
	const envReadiness = resolveMatrixEnvAuthReadiness(accountId, process.env);
	const envReady = envReadiness.ready;
	const envHomeserver = envReadiness.homeserver;
	const envUserId = envReadiness.userId;
	if (envReady && !existing.homeserver && !existing.userId && !existing.accessToken && !existing.password) {
		if (await params.prompter.confirm({
			message: `Matrix env vars detected (${envReadiness.sourceHint}). Use env values?`,
			initialValue: true
		})) {
			next = updateMatrixAccountConfig(next, accountId, { enabled: true });
			next = await configureMatrixAccessPrompts({
				cfg: next,
				prompter: params.prompter,
				forceAllowFrom: params.forceAllowFrom,
				accountId
			});
			return {
				cfg: next,
				accountId
			};
		}
	}
	const homeserver = normalizeStringifiedOptionalString(await params.prompter.text({
		message: "Matrix homeserver URL",
		initialValue: existing.homeserver ?? envHomeserver,
		validate: (value) => {
			try {
				validateMatrixHomeserverUrl(value, { allowPrivateNetwork: true });
				return;
			} catch (error) {
				return error instanceof Error ? error.message : "Invalid Matrix homeserver URL";
			}
		}
	})) ?? "";
	const requiresAllowPrivateNetwork = requiresMatrixPrivateNetworkOptIn(homeserver);
	const shouldPromptAllowPrivateNetwork = requiresAllowPrivateNetwork || isPrivateNetworkOptInEnabled(existing);
	const allowPrivateNetwork = shouldPromptAllowPrivateNetwork ? await params.prompter.confirm({
		message: "Allow private/internal Matrix homeserver traffic for this account?",
		initialValue: isPrivateNetworkOptInEnabled(existing) || requiresAllowPrivateNetwork
	}) : false;
	if (requiresAllowPrivateNetwork && !allowPrivateNetwork) throw new Error("Matrix homeserver requires explicit private-network opt-in");
	await resolveValidatedMatrixHomeserverUrl(homeserver, { dangerouslyAllowPrivateNetwork: allowPrivateNetwork });
	let accessToken = existing.accessToken;
	let password = existing.password;
	let userId = existing.userId ?? "";
	if (hasConfiguredSecretInput(accessToken) || hasConfiguredSecretInput(password)) {
		if (!await params.prompter.confirm({
			message: "Matrix credentials already configured. Keep them?",
			initialValue: true
		})) {
			accessToken = void 0;
			password = void 0;
			userId = "";
		}
	}
	if (!hasConfiguredSecretInput(accessToken) && !hasConfiguredSecretInput(password)) if (await params.prompter.select({
		message: "Matrix auth method",
		options: [{
			value: "token",
			label: "Access token (user ID fetched automatically)"
		}, {
			value: "password",
			label: "Password (requires user ID)"
		}]
	}) === "token") {
		accessToken = normalizeStringifiedOptionalString(await params.prompter.text({
			message: "Matrix access token",
			validate: (value) => normalizeOptionalString(value) ? void 0 : "Required"
		})) ?? "";
		password = void 0;
		userId = "";
	} else {
		userId = normalizeStringifiedOptionalString(await params.prompter.text({
			message: "Matrix user ID",
			initialValue: existing.userId ?? envUserId,
			validate: (value) => {
				const raw = normalizeOptionalString(value) ?? "";
				if (!raw) return "Required";
				if (!raw.startsWith("@")) return "Matrix user IDs should start with @";
				if (!raw.includes(":")) return "Matrix user IDs should include a server (:server)";
			}
		})) ?? "";
		password = normalizeStringifiedOptionalString(await params.prompter.text({
			message: "Matrix password",
			validate: (value) => normalizeOptionalString(value) ? void 0 : "Required"
		})) ?? "";
		accessToken = void 0;
	}
	const deviceName = normalizeStringifiedOptionalString(await params.prompter.text({
		message: "Matrix device name (optional)",
		initialValue: existing.deviceName ?? "OpenClaw Gateway"
	})) ?? "";
	const enableEncryption = await params.prompter.confirm({
		message: "Enable end-to-end encryption (E2EE)?",
		initialValue: existing.encryption ?? false
	});
	next = updateMatrixAccountConfig(next, accountId, {
		enabled: true,
		homeserver,
		...shouldPromptAllowPrivateNetwork ? { allowPrivateNetwork: allowPrivateNetwork ? true : null } : {},
		userId: userId || null,
		accessToken: accessToken ?? null,
		password: password ?? null,
		deviceName: deviceName || null,
		encryption: enableEncryption
	});
	next = await configureMatrixAccessPrompts({
		cfg: next,
		prompter: params.prompter,
		forceAllowFrom: params.forceAllowFrom,
		accountId
	});
	return {
		cfg: next,
		accountId
	};
}
const matrixOnboardingAdapter = {
	channel,
	getStatus: async ({ cfg, accountOverrides }) => {
		const resolvedCfg = cfg;
		const sdkReady = isMatrixSdkAvailable();
		if (!accountOverrides[channel] && requiresExplicitMatrixDefaultAccount(resolvedCfg)) return {
			channel,
			configured: false,
			statusLines: ["Matrix: set \"channels.matrix.defaultAccount\" to select a named account"],
			selectionHint: !sdkReady ? "install Matrix deps" : "set defaultAccount"
		};
		const configured = resolveMatrixAccount({
			cfg: resolvedCfg,
			accountId: resolveMatrixOnboardingAccountId(resolvedCfg, accountOverrides[channel])
		}).configured;
		return {
			channel,
			configured,
			statusLines: [`Matrix: ${configured ? "configured" : "needs homeserver + access token or password"}`],
			selectionHint: !sdkReady ? "install Matrix deps" : configured ? "configured" : "needs auth"
		};
	},
	configure: async ({ cfg, runtime, prompter, forceAllowFrom, accountOverrides, shouldPromptAccountIds }) => await runMatrixConfigure({
		cfg,
		runtime,
		prompter,
		forceAllowFrom,
		accountOverrides,
		shouldPromptAccountIds,
		intent: "update"
	}),
	configureInteractive: async ({ cfg, runtime, prompter, forceAllowFrom, accountOverrides, shouldPromptAccountIds, configured }) => {
		if (!configured) return await runMatrixConfigure({
			cfg,
			runtime,
			prompter,
			forceAllowFrom,
			accountOverrides,
			shouldPromptAccountIds,
			intent: "update"
		});
		const action = await prompter.select({
			message: "Matrix already configured. What do you want to do?",
			options: [
				{
					value: "update",
					label: "Modify settings"
				},
				{
					value: "add-account",
					label: "Add account"
				},
				{
					value: "skip",
					label: "Skip (leave as-is)"
				}
			],
			initialValue: "update"
		});
		if (action === "skip") return "skip";
		return await runMatrixConfigure({
			cfg,
			runtime,
			prompter,
			forceAllowFrom,
			accountOverrides,
			shouldPromptAccountIds,
			intent: action === "add-account" ? "add-account" : "update"
		});
	},
	afterConfigWritten: async ({ previousCfg, cfg, accountId, runtime }) => {
		const { runMatrixSetupBootstrapAfterConfigWrite } = await import("./setup-bootstrap-ITc78zmA.js");
		await runMatrixSetupBootstrapAfterConfigWrite({
			previousCfg,
			cfg,
			accountId,
			runtime
		});
	},
	dmPolicy,
	disable: (cfg) => ({
		...cfg,
		channels: {
			...cfg.channels,
			matrix: {
				...cfg.channels?.["matrix"],
				enabled: false
			}
		}
	})
};
//#endregion
export { legacyConfigRules as n, normalizeCompatibilityConfig as r, matrixOnboardingAdapter as t };
