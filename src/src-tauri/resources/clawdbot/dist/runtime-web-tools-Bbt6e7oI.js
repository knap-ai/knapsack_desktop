import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { qt as listBundledWebSearchPluginIds } from "./io-DhtVmzAJ.js";
import { d as resolveSecretInputRef, i as coerceSecretRef } from "./types.secrets-DTXJhyWe.js";
import { u as secretRefKey } from "./ref-contract-BW7up38N.js";
import { a as BUNDLED_WEB_FETCH_PLUGIN_IDS$1 } from "./bundled-capability-metadata-D5qf8V45.js";
import { a as normalizePluginsConfig, c as resolveEnableState, o as resolveEffectiveEnableState } from "./config-state-zclcq4hc.js";
import { n as withBundledPluginEnablementCompat, r as withBundledPluginVitestCompat, t as withBundledPluginAllowlistCompat } from "./bundled-compat-Qt2_tpRE.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import { n as isNonEmptyString, r as isRecord$1 } from "./shared-CkQ4yE36.js";
import { o as resolveSecretRefValues } from "./resolve-eBylNaNU.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import { o as createGatewayCredentialPlan } from "./credentials-DyjdApQe.js";
import { n as resolveBundledWebFetchPluginId, t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { d as getPath, r as discoverConfigSecretTargetsByIds } from "./target-registry-CO65L87H.js";
import { n as getMatrixScopedEnvVarNames } from "./matrix-config-helpers-B5EXOHUL.js";
import { c as resolveBundledWebSearchPluginId, o as loadBundledCapabilityRuntimeRegistry, r as sortWebSearchProvidersForAutoDetect } from "./web-search-providers.shared-CiXeJJJg.js";
import { t as resolveBundledPluginWebSearchProviders } from "./web-search-providers-ihUOk3z4.js";
import { t as resolvePluginWebSearchProviders } from "./web-search-providers.runtime-BGcv6M1I.js";
//#region src/secrets/secret-value.ts
function isExpectedResolvedSecretValue(value, expected) {
	if (expected === "string") return isNonEmptyString(value);
	return isNonEmptyString(value) || isRecord$1(value);
}
function hasConfiguredPlaintextSecretValue(value, expected) {
	if (expected === "string") return isNonEmptyString(value);
	return isNonEmptyString(value) || isRecord$1(value) && Object.keys(value).length > 0;
}
function assertExpectedResolvedSecretValue(params) {
	if (!isExpectedResolvedSecretValue(params.value, params.expected)) throw new Error(params.errorMessage);
}
//#endregion
//#region src/secrets/command-config.ts
function analyzeCommandSecretAssignmentsFromSnapshot(params) {
	const defaults = params.sourceConfig.secrets?.defaults;
	const assignments = [];
	const diagnostics = [];
	const unresolved = [];
	const inactive = [];
	for (const target of discoverConfigSecretTargetsByIds(params.sourceConfig, params.targetIds)) {
		if (params.allowedPaths && !params.allowedPaths.has(target.path)) continue;
		const { explicitRef, ref } = resolveSecretInputRef({
			value: target.value,
			refValue: target.refValue,
			defaults
		});
		const inlineCandidateRef = explicitRef ? coerceSecretRef(target.value, defaults) : null;
		if (!ref) continue;
		const resolved = getPath(params.resolvedConfig, target.pathSegments);
		if (!isExpectedResolvedSecretValue(resolved, target.entry.expectedResolvedValue)) {
			if (params.inactiveRefPaths?.has(target.path)) {
				diagnostics.push(`${target.path}: secret ref is configured on an inactive surface; skipping command-time assignment.`);
				inactive.push({
					path: target.path,
					pathSegments: [...target.pathSegments]
				});
				continue;
			}
			unresolved.push({
				path: target.path,
				pathSegments: [...target.pathSegments]
			});
			continue;
		}
		assignments.push({
			path: target.path,
			pathSegments: [...target.pathSegments],
			value: resolved
		});
		if (target.entry.secretShape === "sibling_ref" && explicitRef && inlineCandidateRef) diagnostics.push(`${target.path}: both inline and sibling ref were present; sibling ref took precedence.`);
	}
	return {
		assignments,
		diagnostics,
		unresolved,
		inactive
	};
}
function collectCommandSecretAssignmentsFromSnapshot(params) {
	const analyzed = analyzeCommandSecretAssignmentsFromSnapshot({
		sourceConfig: params.sourceConfig,
		resolvedConfig: params.resolvedConfig,
		targetIds: params.targetIds,
		inactiveRefPaths: params.inactiveRefPaths,
		allowedPaths: params.allowedPaths
	});
	if (analyzed.unresolved.length > 0) throw new Error(`${params.commandName}: ${analyzed.unresolved[0]?.path ?? "target"} is unresolved in the active runtime snapshot.`);
	return {
		assignments: analyzed.assignments,
		diagnostics: analyzed.diagnostics
	};
}
//#endregion
//#region src/secrets/runtime-shared.ts
function createResolverContext(params) {
	return {
		sourceConfig: params.sourceConfig,
		env: params.env,
		cache: {},
		warnings: [],
		warningKeys: /* @__PURE__ */ new Set(),
		assignments: []
	};
}
function pushAssignment(context, assignment) {
	context.assignments.push(assignment);
}
function pushWarning(context, warning) {
	const warningKey = `${warning.code}:${warning.path}:${warning.message}`;
	if (context.warningKeys.has(warningKey)) return;
	context.warningKeys.add(warningKey);
	context.warnings.push(warning);
}
function pushInactiveSurfaceWarning(params) {
	pushWarning(params.context, {
		code: "SECRETS_REF_IGNORED_INACTIVE_SURFACE",
		path: params.path,
		message: params.details && params.details.trim().length > 0 ? `${params.path}: ${params.details}` : `${params.path}: secret ref is configured on an inactive surface; skipping resolution until it becomes active.`
	});
}
function collectSecretInputAssignment(params) {
	const ref = coerceSecretRef(params.value, params.defaults);
	if (!ref) return;
	if (params.active === false) {
		pushInactiveSurfaceWarning({
			context: params.context,
			path: params.path,
			details: params.inactiveReason
		});
		return;
	}
	pushAssignment(params.context, {
		ref,
		path: params.path,
		expected: params.expected,
		apply: params.apply
	});
}
function applyResolvedAssignments(params) {
	for (const assignment of params.assignments) {
		const key = secretRefKey(assignment.ref);
		if (!params.resolved.has(key)) throw new Error(`Secret reference "${key}" resolved to no value.`);
		const value = params.resolved.get(key);
		assertExpectedResolvedSecretValue({
			value,
			expected: assignment.expected,
			errorMessage: assignment.expected === "string" ? `${assignment.path} resolved to a non-string or empty value.` : `${assignment.path} resolved to an unsupported value type.`
		});
		assignment.apply(value);
	}
}
function hasOwnProperty(record, key) {
	return Object.prototype.hasOwnProperty.call(record, key);
}
function isEnabledFlag(value) {
	if (!isRecord$1(value)) return true;
	return value.enabled !== false;
}
function isChannelAccountEffectivelyEnabled(channel, account) {
	return isEnabledFlag(channel) && isEnabledFlag(account);
}
//#endregion
//#region src/secrets/runtime-config-collectors-tts.ts
function collectProviderApiKeyAssignment(params) {
	collectSecretInputAssignment({
		value: params.providerConfig.apiKey,
		path: `${params.pathPrefix}.providers.${params.providerId}.apiKey`,
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		active: params.active,
		inactiveReason: params.inactiveReason,
		apply: (value) => {
			params.providerConfig.apiKey = value;
		}
	});
}
function collectTtsApiKeyAssignments(params) {
	const providers = params.tts.providers;
	if (isRecord$1(providers)) {
		for (const [providerId, providerConfig] of Object.entries(providers)) {
			if (!isRecord$1(providerConfig)) continue;
			collectProviderApiKeyAssignment({
				providerId,
				providerConfig,
				pathPrefix: params.pathPrefix,
				defaults: params.defaults,
				context: params.context,
				active: params.active,
				inactiveReason: params.inactiveReason
			});
		}
		return;
	}
}
//#endregion
//#region src/secrets/runtime-config-collectors-channels.ts
function getChannelRecord(config, channelKey) {
	const channels = config.channels;
	if (!isRecord$1(channels)) return;
	const channel = channels[channelKey];
	return isRecord$1(channel) ? channel : void 0;
}
function getChannelSurface(config, channelKey) {
	const channel = getChannelRecord(config, channelKey);
	if (!channel) return null;
	return {
		channel,
		surface: resolveChannelAccountSurface(channel)
	};
}
function resolveChannelAccountSurface(channel) {
	const channelEnabled = isEnabledFlag(channel);
	const accounts = channel.accounts;
	if (!isRecord$1(accounts) || Object.keys(accounts).length === 0) return {
		hasExplicitAccounts: false,
		channelEnabled,
		accounts: [{
			accountId: "default",
			account: channel,
			enabled: channelEnabled
		}]
	};
	const accountEntries = [];
	for (const [accountId, account] of Object.entries(accounts)) {
		if (!isRecord$1(account)) continue;
		accountEntries.push({
			accountId,
			account,
			enabled: isChannelAccountEffectivelyEnabled(channel, account)
		});
	}
	return {
		hasExplicitAccounts: true,
		channelEnabled,
		accounts: accountEntries
	};
}
function isBaseFieldActiveForChannelSurface(surface, rootKey) {
	if (!surface.channelEnabled) return false;
	if (!surface.hasExplicitAccounts) return true;
	return surface.accounts.some(({ account, enabled }) => enabled && !hasOwnProperty(account, rootKey));
}
function normalizeSecretStringValue(value) {
	return typeof value === "string" ? value.trim() : "";
}
function hasConfiguredSecretInputValue(value, defaults) {
	return normalizeSecretStringValue(value).length > 0 || coerceSecretRef(value, defaults) !== null;
}
function collectSimpleChannelFieldAssignments(params) {
	collectSecretInputAssignment({
		value: params.channel[params.field],
		path: `channels.${params.channelKey}.${params.field}`,
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		active: isBaseFieldActiveForChannelSurface(params.surface, params.field),
		inactiveReason: params.topInactiveReason,
		apply: (value) => {
			params.channel[params.field] = value;
		}
	});
	if (!params.surface.hasExplicitAccounts) return;
	for (const { accountId, account, enabled } of params.surface.accounts) {
		if (!hasOwnProperty(account, params.field)) continue;
		collectSecretInputAssignment({
			value: account[params.field],
			path: `channels.${params.channelKey}.accounts.${accountId}.${params.field}`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: enabled,
			inactiveReason: params.accountInactiveReason,
			apply: (value) => {
				account[params.field] = value;
			}
		});
	}
}
function isConditionalTopLevelFieldActive(params) {
	if (!params.surface.channelEnabled) return false;
	if (!params.surface.hasExplicitAccounts) return params.activeWithoutAccounts;
	return params.surface.accounts.some(params.inheritedAccountActive);
}
function collectConditionalChannelFieldAssignments(params) {
	collectSecretInputAssignment({
		value: params.channel[params.field],
		path: `channels.${params.channelKey}.${params.field}`,
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		active: isConditionalTopLevelFieldActive({
			surface: params.surface,
			activeWithoutAccounts: params.topLevelActiveWithoutAccounts,
			inheritedAccountActive: params.topLevelInheritedAccountActive
		}),
		inactiveReason: params.topInactiveReason,
		apply: (value) => {
			params.channel[params.field] = value;
		}
	});
	if (!params.surface.hasExplicitAccounts) return;
	for (const entry of params.surface.accounts) {
		if (!hasOwnProperty(entry.account, params.field)) continue;
		collectSecretInputAssignment({
			value: entry.account[params.field],
			path: `channels.${params.channelKey}.accounts.${entry.accountId}.${params.field}`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: params.accountActive(entry),
			inactiveReason: typeof params.accountInactiveReason === "function" ? params.accountInactiveReason(entry) : params.accountInactiveReason,
			apply: (value) => {
				entry.account[params.field] = value;
			}
		});
	}
}
function collectNestedChannelFieldAssignments(params) {
	const topLevelNested = params.channel[params.nestedKey];
	if (isRecord$1(topLevelNested)) collectSecretInputAssignment({
		value: topLevelNested[params.field],
		path: `channels.${params.channelKey}.${params.nestedKey}.${params.field}`,
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		active: params.topLevelActive,
		inactiveReason: params.topInactiveReason,
		apply: (value) => {
			topLevelNested[params.field] = value;
		}
	});
	if (!params.surface.hasExplicitAccounts) return;
	for (const entry of params.surface.accounts) {
		const nested = entry.account[params.nestedKey];
		if (!isRecord$1(nested)) continue;
		collectSecretInputAssignment({
			value: nested[params.field],
			path: `channels.${params.channelKey}.accounts.${entry.accountId}.${params.nestedKey}.${params.field}`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: params.accountActive(entry),
			inactiveReason: typeof params.accountInactiveReason === "function" ? params.accountInactiveReason(entry) : params.accountInactiveReason,
			apply: (value) => {
				nested[params.field] = value;
			}
		});
	}
}
function collectNestedChannelTtsAssignments(params) {
	const topLevelNested = params.channel[params.nestedKey];
	if (isRecord$1(topLevelNested) && isRecord$1(topLevelNested.tts)) collectTtsApiKeyAssignments({
		tts: topLevelNested.tts,
		pathPrefix: `channels.${params.channelKey}.${params.nestedKey}.tts`,
		defaults: params.defaults,
		context: params.context,
		active: params.topLevelActive,
		inactiveReason: params.topInactiveReason
	});
	if (!params.surface.hasExplicitAccounts) return;
	for (const entry of params.surface.accounts) {
		const nested = entry.account[params.nestedKey];
		if (!isRecord$1(nested) || !isRecord$1(nested.tts)) continue;
		collectTtsApiKeyAssignments({
			tts: nested.tts,
			pathPrefix: `channels.${params.channelKey}.accounts.${entry.accountId}.${params.nestedKey}.tts`,
			defaults: params.defaults,
			context: params.context,
			active: params.accountActive(entry),
			inactiveReason: typeof params.accountInactiveReason === "function" ? params.accountInactiveReason(entry) : params.accountInactiveReason
		});
	}
}
function collectTelegramAssignments(params) {
	const resolved = getChannelSurface(params.config, "telegram");
	if (!resolved) return;
	const { channel: telegram, surface } = resolved;
	const baseTokenFile = typeof telegram.tokenFile === "string" ? telegram.tokenFile.trim() : "";
	const accountTokenFile = (account) => typeof account.tokenFile === "string" ? account.tokenFile.trim() : "";
	collectConditionalChannelFieldAssignments({
		channelKey: "telegram",
		field: "botToken",
		channel: telegram,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: baseTokenFile.length === 0,
		topLevelInheritedAccountActive: ({ account, enabled }) => {
			if (!enabled || baseTokenFile.length > 0) return false;
			return !hasConfiguredSecretInputValue(account.botToken, params.defaults) && accountTokenFile(account).length === 0;
		},
		accountActive: ({ account, enabled }) => enabled && accountTokenFile(account).length === 0,
		topInactiveReason: "no enabled Telegram surface inherits this top-level botToken (tokenFile is configured).",
		accountInactiveReason: "Telegram account is disabled or tokenFile is configured."
	});
	const baseWebhookUrl = typeof telegram.webhookUrl === "string" ? telegram.webhookUrl.trim() : "";
	const accountWebhookUrl = (account) => hasOwnProperty(account, "webhookUrl") ? typeof account.webhookUrl === "string" ? account.webhookUrl.trim() : "" : baseWebhookUrl;
	collectConditionalChannelFieldAssignments({
		channelKey: "telegram",
		field: "webhookSecret",
		channel: telegram,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: baseWebhookUrl.length > 0,
		topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !hasOwnProperty(account, "webhookSecret") && accountWebhookUrl(account).length > 0,
		accountActive: ({ account, enabled }) => enabled && accountWebhookUrl(account).length > 0,
		topInactiveReason: "no enabled Telegram webhook surface inherits this top-level webhookSecret (webhook mode is not active).",
		accountInactiveReason: "Telegram account is disabled or webhook mode is not active for this account."
	});
}
function collectSlackAssignments(params) {
	const resolved = getChannelSurface(params.config, "slack");
	if (!resolved) return;
	const { channel: slack, surface } = resolved;
	const baseMode = slack.mode === "http" || slack.mode === "socket" ? slack.mode : "socket";
	for (const field of ["botToken", "userToken"]) collectSimpleChannelFieldAssignments({
		channelKey: "slack",
		field,
		channel: slack,
		surface,
		defaults: params.defaults,
		context: params.context,
		topInactiveReason: `no enabled account inherits this top-level Slack ${field}.`,
		accountInactiveReason: "Slack account is disabled."
	});
	const resolveAccountMode = (account) => account.mode === "http" || account.mode === "socket" ? account.mode : baseMode;
	collectConditionalChannelFieldAssignments({
		channelKey: "slack",
		field: "appToken",
		channel: slack,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: baseMode !== "http",
		topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !hasOwnProperty(account, "appToken") && resolveAccountMode(account) !== "http",
		accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) !== "http",
		topInactiveReason: "no enabled Slack socket-mode surface inherits this top-level appToken.",
		accountInactiveReason: "Slack account is disabled or not running in socket mode."
	});
	collectConditionalChannelFieldAssignments({
		channelKey: "slack",
		field: "signingSecret",
		channel: slack,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: baseMode === "http",
		topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !hasOwnProperty(account, "signingSecret") && resolveAccountMode(account) === "http",
		accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) === "http",
		topInactiveReason: "no enabled Slack HTTP-mode surface inherits this top-level signingSecret.",
		accountInactiveReason: "Slack account is disabled or not running in HTTP mode."
	});
}
function collectDiscordAssignments(params) {
	const resolved = getChannelSurface(params.config, "discord");
	if (!resolved) return;
	const { channel: discord, surface } = resolved;
	collectSimpleChannelFieldAssignments({
		channelKey: "discord",
		field: "token",
		channel: discord,
		surface,
		defaults: params.defaults,
		context: params.context,
		topInactiveReason: "no enabled account inherits this top-level Discord token.",
		accountInactiveReason: "Discord account is disabled."
	});
	collectNestedChannelFieldAssignments({
		channelKey: "discord",
		nestedKey: "pluralkit",
		field: "token",
		channel: discord,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActive: isBaseFieldActiveForChannelSurface(surface, "pluralkit") && isRecord$1(discord.pluralkit) && isEnabledFlag(discord.pluralkit),
		topInactiveReason: "no enabled Discord surface inherits this top-level PluralKit config or PluralKit is disabled.",
		accountActive: ({ account, enabled }) => enabled && isRecord$1(account.pluralkit) && isEnabledFlag(account.pluralkit),
		accountInactiveReason: "Discord account is disabled or PluralKit is disabled for this account."
	});
	collectNestedChannelTtsAssignments({
		channelKey: "discord",
		nestedKey: "voice",
		channel: discord,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActive: isBaseFieldActiveForChannelSurface(surface, "voice") && isRecord$1(discord.voice) && isEnabledFlag(discord.voice),
		topInactiveReason: "no enabled Discord surface inherits this top-level voice config or voice is disabled.",
		accountActive: ({ account, enabled }) => enabled && isRecord$1(account.voice) && isEnabledFlag(account.voice),
		accountInactiveReason: "Discord account is disabled or voice is disabled for this account."
	});
}
function collectIrcAssignments(params) {
	const resolved = getChannelSurface(params.config, "irc");
	if (!resolved) return;
	const { channel: irc, surface } = resolved;
	collectSimpleChannelFieldAssignments({
		channelKey: "irc",
		field: "password",
		channel: irc,
		surface,
		defaults: params.defaults,
		context: params.context,
		topInactiveReason: "no enabled account inherits this top-level IRC password.",
		accountInactiveReason: "IRC account is disabled."
	});
	collectNestedChannelFieldAssignments({
		channelKey: "irc",
		nestedKey: "nickserv",
		field: "password",
		channel: irc,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActive: isBaseFieldActiveForChannelSurface(surface, "nickserv") && isRecord$1(irc.nickserv) && isEnabledFlag(irc.nickserv),
		topInactiveReason: "no enabled account inherits this top-level IRC nickserv config or NickServ is disabled.",
		accountActive: ({ account, enabled }) => enabled && isRecord$1(account.nickserv) && isEnabledFlag(account.nickserv),
		accountInactiveReason: "IRC account is disabled or NickServ is disabled for this account."
	});
}
function collectBlueBubblesAssignments(params) {
	const resolved = getChannelSurface(params.config, "bluebubbles");
	if (!resolved) return;
	const { channel: bluebubbles, surface } = resolved;
	collectSimpleChannelFieldAssignments({
		channelKey: "bluebubbles",
		field: "password",
		channel: bluebubbles,
		surface,
		defaults: params.defaults,
		context: params.context,
		topInactiveReason: "no enabled account inherits this top-level BlueBubbles password.",
		accountInactiveReason: "BlueBubbles account is disabled."
	});
}
function collectMSTeamsAssignments(params) {
	const msteams = getChannelRecord(params.config, "msteams");
	if (!msteams) return;
	collectSecretInputAssignment({
		value: msteams.appPassword,
		path: "channels.msteams.appPassword",
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		active: msteams.enabled !== false,
		inactiveReason: "Microsoft Teams channel is disabled.",
		apply: (value) => {
			msteams.appPassword = value;
		}
	});
}
function collectMattermostAssignments(params) {
	const resolved = getChannelSurface(params.config, "mattermost");
	if (!resolved) return;
	const { channel: mattermost, surface } = resolved;
	collectSimpleChannelFieldAssignments({
		channelKey: "mattermost",
		field: "botToken",
		channel: mattermost,
		surface,
		defaults: params.defaults,
		context: params.context,
		topInactiveReason: "no enabled account inherits this top-level Mattermost botToken.",
		accountInactiveReason: "Mattermost account is disabled."
	});
}
function collectMatrixAssignments(params) {
	const resolved = getChannelSurface(params.config, "matrix");
	if (!resolved) return;
	const { channel: matrix, surface } = resolved;
	const envAccessTokenConfigured = normalizeSecretStringValue(params.context.env.MATRIX_ACCESS_TOKEN).length > 0;
	const defaultScopedAccessTokenConfigured = normalizeSecretStringValue(params.context.env[getMatrixScopedEnvVarNames("default").accessToken]).length > 0;
	const defaultAccountAccessTokenConfigured = surface.accounts.some(({ accountId, account }) => normalizeAccountId(accountId) === "default" && hasConfiguredSecretInputValue(account.accessToken, params.defaults));
	const baseAccessTokenConfigured = hasConfiguredSecretInputValue(matrix.accessToken, params.defaults);
	collectSecretInputAssignment({
		value: matrix.accessToken,
		path: "channels.matrix.accessToken",
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		active: surface.channelEnabled,
		inactiveReason: "Matrix channel is disabled.",
		apply: (value) => {
			matrix.accessToken = value;
		}
	});
	collectSecretInputAssignment({
		value: matrix.password,
		path: "channels.matrix.password",
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		active: surface.channelEnabled && !(baseAccessTokenConfigured || envAccessTokenConfigured || defaultScopedAccessTokenConfigured || defaultAccountAccessTokenConfigured),
		inactiveReason: "Matrix channel is disabled or access-token auth is configured for the default Matrix account.",
		apply: (value) => {
			matrix.password = value;
		}
	});
	if (!surface.hasExplicitAccounts) return;
	for (const { accountId, account, enabled } of surface.accounts) {
		if (hasOwnProperty(account, "accessToken")) collectSecretInputAssignment({
			value: account.accessToken,
			path: `channels.matrix.accounts.${accountId}.accessToken`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: enabled,
			inactiveReason: "Matrix account is disabled.",
			apply: (value) => {
				account.accessToken = value;
			}
		});
		if (!hasOwnProperty(account, "password")) continue;
		const accountAccessTokenConfigured = hasConfiguredSecretInputValue(account.accessToken, params.defaults);
		const scopedEnvAccessTokenConfigured = normalizeSecretStringValue(params.context.env[getMatrixScopedEnvVarNames(accountId).accessToken]).length > 0;
		const inheritedDefaultAccountAccessTokenConfigured = normalizeAccountId(accountId) === "default" && (baseAccessTokenConfigured || envAccessTokenConfigured);
		collectSecretInputAssignment({
			value: account.password,
			path: `channels.matrix.accounts.${accountId}.password`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: enabled && !(accountAccessTokenConfigured || scopedEnvAccessTokenConfigured || inheritedDefaultAccountAccessTokenConfigured),
			inactiveReason: "Matrix account is disabled or this account has an accessToken configured.",
			apply: (value) => {
				account.password = value;
			}
		});
	}
}
function collectZaloAssignments(params) {
	const resolved = getChannelSurface(params.config, "zalo");
	if (!resolved) return;
	const { channel: zalo, surface } = resolved;
	collectConditionalChannelFieldAssignments({
		channelKey: "zalo",
		field: "botToken",
		channel: zalo,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: true,
		topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !hasOwnProperty(account, "botToken"),
		accountActive: ({ enabled }) => enabled,
		topInactiveReason: "no enabled Zalo surface inherits this top-level botToken.",
		accountInactiveReason: "Zalo account is disabled."
	});
	const baseWebhookUrl = normalizeSecretStringValue(zalo.webhookUrl);
	const resolveAccountWebhookUrl = (account) => hasOwnProperty(account, "webhookUrl") ? normalizeSecretStringValue(account.webhookUrl) : baseWebhookUrl;
	collectConditionalChannelFieldAssignments({
		channelKey: "zalo",
		field: "webhookSecret",
		channel: zalo,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: baseWebhookUrl.length > 0,
		topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !hasOwnProperty(account, "webhookSecret") && resolveAccountWebhookUrl(account).length > 0,
		accountActive: ({ account, enabled }) => enabled && resolveAccountWebhookUrl(account).length > 0,
		topInactiveReason: "no enabled Zalo webhook surface inherits this top-level webhookSecret (webhook mode is not active).",
		accountInactiveReason: "Zalo account is disabled or webhook mode is not active for this account."
	});
}
function collectFeishuAssignments(params) {
	const resolved = getChannelSurface(params.config, "feishu");
	if (!resolved) return;
	const { channel: feishu, surface } = resolved;
	collectSimpleChannelFieldAssignments({
		channelKey: "feishu",
		field: "appSecret",
		channel: feishu,
		surface,
		defaults: params.defaults,
		context: params.context,
		topInactiveReason: "no enabled account inherits this top-level Feishu appSecret.",
		accountInactiveReason: "Feishu account is disabled."
	});
	const baseConnectionMode = normalizeSecretStringValue(feishu.connectionMode) === "webhook" ? "webhook" : "websocket";
	const resolveAccountMode = (account) => hasOwnProperty(account, "connectionMode") ? normalizeSecretStringValue(account.connectionMode) : baseConnectionMode;
	collectConditionalChannelFieldAssignments({
		channelKey: "feishu",
		field: "encryptKey",
		channel: feishu,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: baseConnectionMode === "webhook",
		topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !hasOwnProperty(account, "encryptKey") && resolveAccountMode(account) === "webhook",
		accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) === "webhook",
		topInactiveReason: "no enabled Feishu webhook-mode surface inherits this top-level encryptKey.",
		accountInactiveReason: "Feishu account is disabled or not running in webhook mode."
	});
	collectConditionalChannelFieldAssignments({
		channelKey: "feishu",
		field: "verificationToken",
		channel: feishu,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: baseConnectionMode === "webhook",
		topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !hasOwnProperty(account, "verificationToken") && resolveAccountMode(account) === "webhook",
		accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) === "webhook",
		topInactiveReason: "no enabled Feishu webhook-mode surface inherits this top-level verificationToken.",
		accountInactiveReason: "Feishu account is disabled or not running in webhook mode."
	});
}
function collectNextcloudTalkAssignments(params) {
	const resolved = getChannelSurface(params.config, "nextcloud-talk");
	if (!resolved) return;
	const { channel: nextcloudTalk, surface } = resolved;
	const inheritsField = (field) => ({ account, enabled }) => enabled && !hasOwnProperty(account, field);
	collectConditionalChannelFieldAssignments({
		channelKey: "nextcloud-talk",
		field: "botSecret",
		channel: nextcloudTalk,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: true,
		topLevelInheritedAccountActive: inheritsField("botSecret"),
		accountActive: ({ enabled }) => enabled,
		topInactiveReason: "no enabled Nextcloud Talk surface inherits this top-level botSecret.",
		accountInactiveReason: "Nextcloud Talk account is disabled."
	});
	collectConditionalChannelFieldAssignments({
		channelKey: "nextcloud-talk",
		field: "apiPassword",
		channel: nextcloudTalk,
		surface,
		defaults: params.defaults,
		context: params.context,
		topLevelActiveWithoutAccounts: true,
		topLevelInheritedAccountActive: inheritsField("apiPassword"),
		accountActive: ({ enabled }) => enabled,
		topInactiveReason: "no enabled Nextcloud Talk surface inherits this top-level apiPassword.",
		accountInactiveReason: "Nextcloud Talk account is disabled."
	});
}
function collectGoogleChatAccountAssignment(params) {
	const { explicitRef, ref } = resolveSecretInputRef({
		value: params.target.serviceAccount,
		refValue: params.target.serviceAccountRef,
		defaults: params.defaults
	});
	if (!ref) return;
	if (params.active === false) {
		pushInactiveSurfaceWarning({
			context: params.context,
			path: `${params.path}.serviceAccount`,
			details: params.inactiveReason
		});
		return;
	}
	if (explicitRef && params.target.serviceAccount !== void 0 && !coerceSecretRef(params.target.serviceAccount, params.defaults)) pushWarning(params.context, {
		code: "SECRETS_REF_OVERRIDES_PLAINTEXT",
		path: params.path,
		message: `${params.path}: serviceAccountRef is set; runtime will ignore plaintext serviceAccount.`
	});
	pushAssignment(params.context, {
		ref,
		path: `${params.path}.serviceAccount`,
		expected: "string-or-object",
		apply: (value) => {
			params.target.serviceAccount = value;
		}
	});
}
function collectGoogleChatAssignments(params) {
	const googleChatRecord = params.googleChat;
	const surface = resolveChannelAccountSurface(googleChatRecord);
	const topLevelServiceAccountActive = !surface.channelEnabled ? false : !surface.hasExplicitAccounts ? true : surface.accounts.some(({ account, enabled }) => enabled && !hasOwnProperty(account, "serviceAccount") && !hasOwnProperty(account, "serviceAccountRef"));
	collectGoogleChatAccountAssignment({
		target: params.googleChat,
		path: "channels.googlechat",
		defaults: params.defaults,
		context: params.context,
		active: topLevelServiceAccountActive,
		inactiveReason: "no enabled account inherits this top-level Google Chat serviceAccount."
	});
	if (!surface.hasExplicitAccounts) return;
	for (const { accountId, account, enabled } of surface.accounts) {
		if (!hasOwnProperty(account, "serviceAccount") && !hasOwnProperty(account, "serviceAccountRef")) continue;
		collectGoogleChatAccountAssignment({
			target: account,
			path: `channels.googlechat.accounts.${accountId}`,
			defaults: params.defaults,
			context: params.context,
			active: enabled,
			inactiveReason: "Google Chat account is disabled."
		});
	}
}
function collectChannelConfigAssignments(params) {
	const googleChat = getChannelRecord(params.config, "googlechat");
	if (googleChat) collectGoogleChatAssignments({
		googleChat,
		defaults: params.defaults,
		context: params.context
	});
	collectTelegramAssignments(params);
	collectSlackAssignments(params);
	collectDiscordAssignments(params);
	collectIrcAssignments(params);
	collectBlueBubblesAssignments(params);
	collectMattermostAssignments(params);
	collectMatrixAssignments(params);
	collectMSTeamsAssignments(params);
	collectNextcloudTalkAssignments(params);
	collectFeishuAssignments(params);
	collectZaloAssignments(params);
}
//#endregion
//#region src/secrets/runtime-gateway-auth-surfaces.ts
const GATEWAY_AUTH_SURFACE_PATHS = [
	"gateway.auth.token",
	"gateway.auth.password",
	"gateway.remote.token",
	"gateway.remote.password"
];
function formatAuthMode(mode) {
	return mode ?? "unset";
}
function describeRemoteConfiguredSurface(parts) {
	const reasons = [];
	if (parts.remoteMode) reasons.push("gateway.mode is \"remote\"");
	if (parts.remoteUrlConfigured) reasons.push("gateway.remote.url is configured");
	if (parts.tailscaleRemoteExposure) reasons.push("gateway.tailscale.mode is \"serve\" or \"funnel\"");
	return reasons.join("; ");
}
function createState(params) {
	return {
		path: params.path,
		active: params.active,
		reason: params.reason,
		hasSecretRef: params.hasSecretRef
	};
}
function evaluateGatewayAuthSurfaceStates(params) {
	const gateway = params.config.gateway;
	if (!isRecord$1(gateway)) return {
		"gateway.auth.token": createState({
			path: "gateway.auth.token",
			active: false,
			reason: "gateway configuration is not set.",
			hasSecretRef: false
		}),
		"gateway.auth.password": createState({
			path: "gateway.auth.password",
			active: false,
			reason: "gateway configuration is not set.",
			hasSecretRef: false
		}),
		"gateway.remote.token": createState({
			path: "gateway.remote.token",
			active: false,
			reason: "gateway configuration is not set.",
			hasSecretRef: false
		}),
		"gateway.remote.password": createState({
			path: "gateway.remote.password",
			active: false,
			reason: "gateway configuration is not set.",
			hasSecretRef: false
		})
	};
	const auth = isRecord$1(gateway?.auth) ? gateway.auth : void 0;
	const remote = isRecord$1(gateway?.remote) ? gateway.remote : void 0;
	const plan = createGatewayCredentialPlan({
		config: params.config,
		env: params.env,
		defaults: params.defaults
	});
	const authPasswordReason = (() => {
		if (!auth) return "gateway.auth is not configured.";
		if (plan.passwordCanWin) return plan.authMode === "password" ? "gateway.auth.mode is \"password\"." : "no token source can win, so password auth can win.";
		if (plan.authMode === "token" || plan.authMode === "none" || plan.authMode === "trusted-proxy") return `gateway.auth.mode is "${plan.authMode}".`;
		if (plan.envToken) return "gateway token env var is configured.";
		if (plan.localToken.configured) return "gateway.auth.token is configured.";
		if (plan.remoteToken.configured) return "gateway.remote.token is configured.";
		return "token auth can win.";
	})();
	const authTokenReason = (() => {
		if (!auth) return "gateway.auth is not configured.";
		if (plan.authMode === "token") return plan.envToken ? "gateway token env var is configured." : "gateway.auth.mode is \"token\".";
		if (plan.authMode === "password" || plan.authMode === "none" || plan.authMode === "trusted-proxy") return `gateway.auth.mode is "${plan.authMode}".`;
		if (plan.envToken) return "gateway token env var is configured.";
		if (plan.envPassword) return "gateway password env var is configured.";
		if (plan.localPassword.configured) return "gateway.auth.password is configured.";
		return "token auth can win (mode is unset and no password source is configured).";
	})();
	const remoteSurfaceReason = describeRemoteConfiguredSurface({
		remoteMode: plan.remoteMode,
		remoteUrlConfigured: plan.remoteUrlConfigured,
		tailscaleRemoteExposure: plan.tailscaleRemoteExposure
	});
	const remoteTokenReason = (() => {
		if (!remote) return "gateway.remote is not configured.";
		if (plan.remoteConfiguredSurface) return `remote surface is active: ${remoteSurfaceReason}.`;
		if (plan.remoteTokenFallbackActive) return "local token auth can win and no env/auth token is configured.";
		if (!plan.localTokenCanWin) return `token auth cannot win with gateway.auth.mode="${formatAuthMode(plan.authMode)}".`;
		if (plan.envToken) return "gateway token env var is configured.";
		if (plan.localToken.configured) return "gateway.auth.token is configured.";
		return "remote token fallback is not active.";
	})();
	const remotePasswordReason = (() => {
		if (!remote) return "gateway.remote is not configured.";
		if (plan.remoteConfiguredSurface) return `remote surface is active: ${remoteSurfaceReason}.`;
		if (plan.remotePasswordFallbackActive) return "password auth can win and no env/auth password is configured.";
		if (!plan.passwordCanWin) {
			if (plan.authMode === "token" || plan.authMode === "none" || plan.authMode === "trusted-proxy") return `password auth cannot win with gateway.auth.mode="${plan.authMode}".`;
			return "a token source can win, so password auth cannot win.";
		}
		if (plan.envPassword) return "gateway password env var is configured.";
		if (plan.localPassword.configured) return "gateway.auth.password is configured.";
		return "remote password fallback is not active.";
	})();
	return {
		"gateway.auth.token": createState({
			path: "gateway.auth.token",
			active: plan.localTokenSurfaceActive,
			reason: authTokenReason,
			hasSecretRef: plan.localToken.hasSecretRef
		}),
		"gateway.auth.password": createState({
			path: "gateway.auth.password",
			active: plan.passwordCanWin,
			reason: authPasswordReason,
			hasSecretRef: plan.localPassword.hasSecretRef
		}),
		"gateway.remote.token": createState({
			path: "gateway.remote.token",
			active: plan.remoteTokenActive,
			reason: remoteTokenReason,
			hasSecretRef: plan.remoteToken.hasSecretRef
		}),
		"gateway.remote.password": createState({
			path: "gateway.remote.password",
			active: plan.remotePasswordActive,
			reason: remotePasswordReason,
			hasSecretRef: plan.remotePassword.hasSecretRef
		})
	};
}
//#endregion
//#region src/secrets/runtime-config-collectors-core.ts
function collectModelProviderAssignments(params) {
	for (const [providerId, provider] of Object.entries(params.providers)) {
		const providerIsActive = provider.enabled !== false;
		collectSecretInputAssignment({
			value: provider.apiKey,
			path: `models.providers.${providerId}.apiKey`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: providerIsActive,
			inactiveReason: "provider is disabled.",
			apply: (value) => {
				provider.apiKey = value;
			}
		});
		const headers = isRecord$1(provider.headers) ? provider.headers : void 0;
		if (!headers) continue;
		for (const [headerKey, headerValue] of Object.entries(headers)) collectSecretInputAssignment({
			value: headerValue,
			path: `models.providers.${providerId}.headers.${headerKey}`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: providerIsActive,
			inactiveReason: "provider is disabled.",
			apply: (value) => {
				headers[headerKey] = value;
			}
		});
	}
}
function collectSkillAssignments(params) {
	for (const [skillKey, entry] of Object.entries(params.entries)) collectSecretInputAssignment({
		value: entry.apiKey,
		path: `skills.entries.${skillKey}.apiKey`,
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		active: entry.enabled !== false,
		inactiveReason: "skill entry is disabled.",
		apply: (value) => {
			entry.apiKey = value;
		}
	});
}
function collectAgentMemorySearchAssignments(params) {
	const agents = params.config.agents;
	if (!isRecord$1(agents)) return;
	const defaultsConfig = isRecord$1(agents.defaults) ? agents.defaults : void 0;
	const defaultsMemorySearch = isRecord$1(defaultsConfig?.memorySearch) ? defaultsConfig.memorySearch : void 0;
	const defaultsEnabled = defaultsMemorySearch?.enabled !== false;
	const list = Array.isArray(agents.list) ? agents.list : [];
	let hasEnabledAgentWithoutOverride = false;
	for (const rawAgent of list) {
		if (!isRecord$1(rawAgent)) continue;
		if (rawAgent.enabled === false) continue;
		const memorySearch = isRecord$1(rawAgent.memorySearch) ? rawAgent.memorySearch : void 0;
		if (memorySearch?.enabled === false) continue;
		if (!memorySearch || !Object.prototype.hasOwnProperty.call(memorySearch, "remote")) {
			hasEnabledAgentWithoutOverride = true;
			continue;
		}
		const remote = isRecord$1(memorySearch.remote) ? memorySearch.remote : void 0;
		if (!remote || !Object.prototype.hasOwnProperty.call(remote, "apiKey")) {
			hasEnabledAgentWithoutOverride = true;
			continue;
		}
	}
	if (defaultsMemorySearch && isRecord$1(defaultsMemorySearch.remote)) {
		const remote = defaultsMemorySearch.remote;
		collectSecretInputAssignment({
			value: remote.apiKey,
			path: "agents.defaults.memorySearch.remote.apiKey",
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: defaultsEnabled && (hasEnabledAgentWithoutOverride || list.length === 0),
			inactiveReason: hasEnabledAgentWithoutOverride ? void 0 : "all enabled agents override memorySearch.remote.apiKey.",
			apply: (value) => {
				remote.apiKey = value;
			}
		});
	}
	list.forEach((rawAgent, index) => {
		if (!isRecord$1(rawAgent)) return;
		const memorySearch = isRecord$1(rawAgent.memorySearch) ? rawAgent.memorySearch : void 0;
		if (!memorySearch) return;
		const remote = isRecord$1(memorySearch.remote) ? memorySearch.remote : void 0;
		if (!remote || !Object.prototype.hasOwnProperty.call(remote, "apiKey")) return;
		const enabled = rawAgent.enabled !== false && memorySearch.enabled !== false;
		collectSecretInputAssignment({
			value: remote.apiKey,
			path: `agents.list.${index}.memorySearch.remote.apiKey`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: enabled,
			inactiveReason: "agent or memorySearch override is disabled.",
			apply: (value) => {
				remote.apiKey = value;
			}
		});
	});
}
function collectTalkAssignments(params) {
	const talk = params.config.talk;
	if (!isRecord$1(talk)) return;
	collectSecretInputAssignment({
		value: talk.apiKey,
		path: "talk.apiKey",
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		apply: (value) => {
			talk.apiKey = value;
		}
	});
	const providers = talk.providers;
	if (!isRecord$1(providers)) return;
	for (const [providerId, providerConfig] of Object.entries(providers)) {
		if (!isRecord$1(providerConfig)) continue;
		collectSecretInputAssignment({
			value: providerConfig.apiKey,
			path: `talk.providers.${providerId}.apiKey`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			apply: (value) => {
				providerConfig.apiKey = value;
			}
		});
	}
}
function collectGatewayAssignments(params) {
	const gateway = params.config.gateway;
	if (!isRecord$1(gateway)) return;
	const auth = isRecord$1(gateway.auth) ? gateway.auth : void 0;
	const remote = isRecord$1(gateway.remote) ? gateway.remote : void 0;
	const gatewaySurfaceStates = evaluateGatewayAuthSurfaceStates({
		config: params.config,
		env: params.context.env,
		defaults: params.defaults
	});
	if (auth) {
		collectSecretInputAssignment({
			value: auth.token,
			path: "gateway.auth.token",
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: gatewaySurfaceStates["gateway.auth.token"].active,
			inactiveReason: gatewaySurfaceStates["gateway.auth.token"].reason,
			apply: (value) => {
				auth.token = value;
			}
		});
		collectSecretInputAssignment({
			value: auth.password,
			path: "gateway.auth.password",
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: gatewaySurfaceStates["gateway.auth.password"].active,
			inactiveReason: gatewaySurfaceStates["gateway.auth.password"].reason,
			apply: (value) => {
				auth.password = value;
			}
		});
	}
	if (remote) {
		collectSecretInputAssignment({
			value: remote.token,
			path: "gateway.remote.token",
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: gatewaySurfaceStates["gateway.remote.token"].active,
			inactiveReason: gatewaySurfaceStates["gateway.remote.token"].reason,
			apply: (value) => {
				remote.token = value;
			}
		});
		collectSecretInputAssignment({
			value: remote.password,
			path: "gateway.remote.password",
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: gatewaySurfaceStates["gateway.remote.password"].active,
			inactiveReason: gatewaySurfaceStates["gateway.remote.password"].reason,
			apply: (value) => {
				remote.password = value;
			}
		});
	}
}
function collectMessagesTtsAssignments(params) {
	const messages = params.config.messages;
	if (!isRecord$1(messages) || !isRecord$1(messages.tts)) return;
	collectTtsApiKeyAssignments({
		tts: messages.tts,
		pathPrefix: "messages.tts",
		defaults: params.defaults,
		context: params.context
	});
}
function collectCronAssignments(params) {
	const cron = params.config.cron;
	if (!isRecord$1(cron)) return;
	collectSecretInputAssignment({
		value: cron.webhookToken,
		path: "cron.webhookToken",
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		apply: (value) => {
			cron.webhookToken = value;
		}
	});
}
function collectSandboxSshAssignments(params) {
	const agents = isRecord$1(params.config.agents) ? params.config.agents : void 0;
	if (!agents) return;
	const defaultsAgent = isRecord$1(agents.defaults) ? agents.defaults : void 0;
	const defaultsSandbox = isRecord$1(defaultsAgent?.sandbox) ? defaultsAgent.sandbox : void 0;
	const defaultsSsh = isRecord$1(defaultsSandbox?.ssh) ? defaultsSandbox.ssh : void 0;
	const defaultsBackend = typeof defaultsSandbox?.backend === "string" ? defaultsSandbox.backend : void 0;
	const defaultsMode = typeof defaultsSandbox?.mode === "string" ? defaultsSandbox.mode : void 0;
	const inheritedDefaultsUsage = {
		identityData: false,
		certificateData: false,
		knownHostsData: false
	};
	(Array.isArray(agents.list) ? agents.list : []).forEach((rawAgent, index) => {
		const agentRecord = isRecord$1(rawAgent) ? rawAgent : null;
		if (!agentRecord || agentRecord.enabled === false) return;
		const sandbox = isRecord$1(agentRecord.sandbox) ? agentRecord.sandbox : void 0;
		const ssh = isRecord$1(sandbox?.ssh) ? sandbox.ssh : void 0;
		const effectiveBackend = (typeof sandbox?.backend === "string" ? sandbox.backend : void 0) ?? defaultsBackend ?? "docker";
		const effectiveMode = (typeof sandbox?.mode === "string" ? sandbox.mode : void 0) ?? defaultsMode ?? "off";
		const active = effectiveBackend.trim().toLowerCase() === "ssh" && effectiveMode !== "off";
		for (const key of [
			"identityData",
			"certificateData",
			"knownHostsData"
		]) if (ssh && Object.prototype.hasOwnProperty.call(ssh, key)) collectSecretInputAssignment({
			value: ssh[key],
			path: `agents.list.${index}.sandbox.ssh.${key}`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active,
			inactiveReason: "sandbox SSH backend is not active for this agent.",
			apply: (value) => {
				ssh[key] = value;
			}
		});
		else if (active) inheritedDefaultsUsage[key] = true;
	});
	if (!defaultsSsh) return;
	const defaultsActive = defaultsBackend?.trim().toLowerCase() === "ssh" && defaultsMode !== "off" || inheritedDefaultsUsage.identityData || inheritedDefaultsUsage.certificateData || inheritedDefaultsUsage.knownHostsData;
	for (const key of [
		"identityData",
		"certificateData",
		"knownHostsData"
	]) collectSecretInputAssignment({
		value: defaultsSsh[key],
		path: `agents.defaults.sandbox.ssh.${key}`,
		expected: "string",
		defaults: params.defaults,
		context: params.context,
		active: defaultsActive || inheritedDefaultsUsage[key],
		inactiveReason: "sandbox SSH backend is not active.",
		apply: (value) => {
			defaultsSsh[key] = value;
		}
	});
}
function collectCoreConfigAssignments(params) {
	const providers = params.config.models?.providers;
	if (providers) collectModelProviderAssignments({
		providers,
		defaults: params.defaults,
		context: params.context
	});
	const skillEntries = params.config.skills?.entries;
	if (skillEntries) collectSkillAssignments({
		entries: skillEntries,
		defaults: params.defaults,
		context: params.context
	});
	collectAgentMemorySearchAssignments(params);
	collectTalkAssignments(params);
	collectGatewayAssignments(params);
	collectSandboxSshAssignments(params);
	collectMessagesTtsAssignments(params);
	collectCronAssignments(params);
}
//#endregion
//#region src/secrets/runtime-config-collectors-plugins.ts
const ACPX_PLUGIN_ID = "acpx";
/**
* Walk plugin config entries and collect SecretRef assignments for MCP server
* env vars. Without this, SecretRefs in paths like
* `plugins.entries.acpx.config.mcpServers.*.env.*` are never resolved and
* remain as raw objects at runtime.
*
* This surface is intentionally scoped to ACPX. Third-party plugins may define
* their own `mcpServers`-shaped config, but that is not a documented SecretRef
* surface and should not be rewritten here.
*
* When `loadablePluginOrigins` is provided, entries whose ID is not in the map
* are treated as inactive (stale config entries for plugins that are no longer
* installed). This prevents resolution failures for SecretRefs belonging to
* non-loadable plugins from blocking startup or preflight validation.
*/
function collectPluginConfigAssignments(params) {
	const entries = params.config.plugins?.entries;
	if (!isRecord$1(entries)) return;
	const normalizedConfig = normalizePluginsConfig(params.config.plugins);
	for (const [pluginId, entry] of Object.entries(entries)) {
		if (pluginId !== ACPX_PLUGIN_ID) continue;
		if (!isRecord$1(entry)) continue;
		const pluginConfig = entry.config;
		if (!isRecord$1(pluginConfig)) continue;
		const pluginOrigin = params.loadablePluginOrigins?.get(pluginId);
		if (params.loadablePluginOrigins && !pluginOrigin) {
			collectMcpServerEnvAssignments({
				pluginId,
				pluginConfig,
				active: false,
				inactiveReason: "plugin is not loadable (stale config entry).",
				defaults: params.defaults,
				context: params.context
			});
			continue;
		}
		const enableState = resolveEnableState(pluginId, pluginOrigin ?? "config", normalizedConfig);
		collectMcpServerEnvAssignments({
			pluginId,
			pluginConfig,
			active: enableState.enabled,
			inactiveReason: enableState.reason ?? "plugin is disabled.",
			defaults: params.defaults,
			context: params.context
		});
	}
}
function collectMcpServerEnvAssignments(params) {
	const mcpServers = params.pluginConfig.mcpServers;
	if (!isRecord$1(mcpServers)) return;
	for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
		if (!isRecord$1(serverConfig)) continue;
		const env = serverConfig.env;
		if (!isRecord$1(env)) continue;
		for (const [envKey, envValue] of Object.entries(env)) collectSecretInputAssignment({
			value: envValue,
			path: `plugins.entries.${params.pluginId}.config.mcpServers.${serverName}.env.${envKey}`,
			expected: "string",
			defaults: params.defaults,
			context: params.context,
			active: params.active,
			inactiveReason: `plugin "${params.pluginId}": ${params.inactiveReason}`,
			apply: (value) => {
				env[envKey] = value;
			}
		});
	}
}
//#endregion
//#region src/secrets/runtime-config-collectors.ts
function collectConfigAssignments(params) {
	const defaults = params.context.sourceConfig.secrets?.defaults;
	collectCoreConfigAssignments({
		config: params.config,
		defaults,
		context: params.context
	});
	collectChannelConfigAssignments({
		config: params.config,
		defaults,
		context: params.context
	});
	collectPluginConfigAssignments({
		config: params.config,
		defaults,
		context: params.context,
		loadablePluginOrigins: params.loadablePluginOrigins
	});
}
//#endregion
//#region src/plugins/bundled-web-fetch-ids.ts
const BUNDLED_WEB_FETCH_PLUGIN_IDS = BUNDLED_WEB_FETCH_PLUGIN_IDS$1;
//#endregion
//#region src/plugins/bundled-web-fetch.ts
let bundledWebFetchProvidersCache = null;
function loadBundledWebFetchProviders() {
	if (!bundledWebFetchProvidersCache) bundledWebFetchProvidersCache = loadBundledCapabilityRuntimeRegistry({
		pluginIds: BUNDLED_WEB_FETCH_PLUGIN_IDS,
		pluginSdkResolution: "dist"
	}).webFetchProviders.map((entry) => ({
		pluginId: entry.pluginId,
		...entry.provider
	}));
	return bundledWebFetchProvidersCache;
}
function resolveBundledWebFetchPluginIds(params) {
	const bundledWebFetchPluginIdSet = new Set(BUNDLED_WEB_FETCH_PLUGIN_IDS);
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => plugin.origin === "bundled" && bundledWebFetchPluginIdSet.has(plugin.id)).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function listBundledWebFetchProviders$1() {
	return loadBundledWebFetchProviders();
}
//#endregion
//#region src/plugins/web-fetch-providers.shared.ts
function resolveBundledWebFetchCompatPluginIds(params) {
	return resolveBundledWebFetchPluginIds({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
}
function compareWebFetchProvidersAlphabetically(left, right) {
	return left.id.localeCompare(right.id) || left.pluginId.localeCompare(right.pluginId);
}
function sortWebFetchProviders(providers) {
	return providers.toSorted(compareWebFetchProvidersAlphabetically);
}
function sortWebFetchProvidersForAutoDetect(providers) {
	return providers.toSorted((left, right) => {
		const leftOrder = left.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
		const rightOrder = right.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
		if (leftOrder !== rightOrder) return leftOrder - rightOrder;
		return compareWebFetchProvidersAlphabetically(left, right);
	});
}
function resolveBundledWebFetchResolutionConfig(params) {
	const autoEnabledConfig = params.config !== void 0 ? applyPluginAutoEnable({
		config: params.config,
		env: params.env ?? process.env
	}).config : void 0;
	const bundledCompatPluginIds = resolveBundledWebFetchCompatPluginIds({
		config: autoEnabledConfig,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	const config = withBundledPluginVitestCompat({
		config: withBundledPluginEnablementCompat({
			config: params.bundledAllowlistCompat ? withBundledPluginAllowlistCompat({
				config: autoEnabledConfig,
				pluginIds: bundledCompatPluginIds
			}) : autoEnabledConfig,
			pluginIds: bundledCompatPluginIds
		}),
		pluginIds: bundledCompatPluginIds,
		env: params.env
	});
	return {
		config,
		normalized: normalizePluginsConfig(config?.plugins)
	};
}
//#endregion
//#region src/plugins/web-fetch-providers.ts
function listBundledWebFetchProviders() {
	return sortWebFetchProviders(listBundledWebFetchProviders$1());
}
function resolveBundledPluginWebFetchProviders(params) {
	const { config, normalized } = resolveBundledWebFetchResolutionConfig(params);
	const onlyPluginIdSet = params.onlyPluginIds && params.onlyPluginIds.length > 0 ? new Set(params.onlyPluginIds) : null;
	return listBundledWebFetchProviders().filter((provider) => {
		if (onlyPluginIdSet && !onlyPluginIdSet.has(provider.pluginId)) return false;
		return resolveEffectiveEnableState({
			id: provider.pluginId,
			origin: "bundled",
			config: normalized,
			rootConfig: config
		}).enabled;
	});
}
//#endregion
//#region src/secrets/runtime-web-tools.ts
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeProvider(value, providers) {
	if (typeof value !== "string") return;
	const normalized = value.trim().toLowerCase();
	if (providers.some((provider) => provider.id === normalized)) return normalized;
}
function normalizeFetchProvider(value, providers) {
	if (typeof value !== "string") return;
	const normalized = value.trim().toLowerCase();
	if (providers.some((provider) => provider.id === normalized)) return normalized;
}
function hasCustomWebSearchPluginRisk(config) {
	const plugins = config.plugins;
	if (!plugins) return false;
	if (Array.isArray(plugins.load?.paths) && plugins.load.paths.length > 0) return true;
	if (plugins.installs && Object.keys(plugins.installs).length > 0) return true;
	const bundledPluginIds = new Set(listBundledWebSearchPluginIds());
	const hasNonBundledPluginId = (pluginId) => !bundledPluginIds.has(pluginId.trim());
	if (Array.isArray(plugins.allow) && plugins.allow.some(hasNonBundledPluginId)) return true;
	if (Array.isArray(plugins.deny) && plugins.deny.some(hasNonBundledPluginId)) return true;
	if (plugins.entries && Object.keys(plugins.entries).some(hasNonBundledPluginId)) return true;
	return false;
}
function readNonEmptyEnvValue(env, names) {
	for (const envVar of names) {
		const value = normalizeSecretInput(env[envVar]);
		if (value) return {
			value,
			envVar
		};
	}
	return {};
}
function buildUnresolvedReason(params) {
	if (params.kind === "non-string") return `${params.path} SecretRef resolved to a non-string value.`;
	if (params.kind === "empty") return `${params.path} SecretRef resolved to an empty value.`;
	return `${params.path} SecretRef is unresolved (${params.refLabel}).`;
}
async function resolveSecretInputWithEnvFallback(params) {
	const { ref } = resolveSecretInputRef({
		value: params.value,
		defaults: params.defaults
	});
	if (!ref) {
		const configValue = normalizeSecretInput(params.value);
		if (configValue) return {
			value: configValue,
			source: "config",
			secretRefConfigured: false,
			fallbackUsedAfterRefFailure: false
		};
		const fallback = readNonEmptyEnvValue(params.context.env, params.envVars);
		if (fallback.value) return {
			value: fallback.value,
			source: "env",
			fallbackEnvVar: fallback.envVar,
			secretRefConfigured: false,
			fallbackUsedAfterRefFailure: false
		};
		return {
			source: "missing",
			secretRefConfigured: false,
			fallbackUsedAfterRefFailure: false
		};
	}
	const refLabel = `${ref.source}:${ref.provider}:${ref.id}`;
	let resolvedFromRef;
	let unresolvedRefReason;
	if (params.restrictEnvRefsToEnvVars === true && ref.source === "env" && !params.envVars.includes(ref.id)) unresolvedRefReason = `${params.path} SecretRef env var "${ref.id}" is not allowed.`;
	else try {
		const resolvedValue = (await resolveSecretRefValues([ref], {
			config: params.sourceConfig,
			env: params.context.env,
			cache: params.context.cache
		})).get(secretRefKey(ref));
		if (typeof resolvedValue !== "string") unresolvedRefReason = buildUnresolvedReason({
			path: params.path,
			kind: "non-string",
			refLabel
		});
		else {
			resolvedFromRef = normalizeSecretInput(resolvedValue);
			if (!resolvedFromRef) unresolvedRefReason = buildUnresolvedReason({
				path: params.path,
				kind: "empty",
				refLabel
			});
		}
	} catch {
		unresolvedRefReason = buildUnresolvedReason({
			path: params.path,
			kind: "unresolved",
			refLabel
		});
	}
	if (resolvedFromRef) return {
		value: resolvedFromRef,
		source: "secretRef",
		secretRefConfigured: true,
		fallbackUsedAfterRefFailure: false
	};
	const fallback = readNonEmptyEnvValue(params.context.env, params.envVars);
	if (fallback.value) return {
		value: fallback.value,
		source: "env",
		fallbackEnvVar: fallback.envVar,
		unresolvedRefReason,
		secretRefConfigured: true,
		fallbackUsedAfterRefFailure: true
	};
	return {
		source: "missing",
		unresolvedRefReason,
		secretRefConfigured: true,
		fallbackUsedAfterRefFailure: false
	};
}
function ensureObject(target, key) {
	const current = target[key];
	if (isRecord(current)) return current;
	const next = {};
	target[key] = next;
	return next;
}
function setResolvedWebSearchApiKey(params) {
	const search = ensureObject(ensureObject(ensureObject(params.resolvedConfig, "tools"), "web"), "search");
	if (params.provider.setConfiguredCredentialValue) {
		params.provider.setConfiguredCredentialValue(params.resolvedConfig, params.value);
		if (params.provider.id !== "brave") return;
	}
	params.provider.setCredentialValue(search, params.value);
}
function keyPathForProvider(provider) {
	return provider.credentialPath;
}
function readConfiguredProviderCredential(params) {
	return params.provider.getConfiguredCredentialValue?.(params.config) ?? params.provider.getCredentialValue(params.search);
}
function inactivePathsForProvider(provider) {
	if (provider.requiresCredential === false) return [];
	return provider.inactiveSecretPaths?.length ? provider.inactiveSecretPaths : [provider.credentialPath];
}
function setResolvedWebFetchApiKey(params) {
	const fetch = ensureObject(ensureObject(ensureObject(params.resolvedConfig, "tools"), "web"), "fetch");
	if (params.provider.setConfiguredCredentialValue) {
		params.provider.setConfiguredCredentialValue(params.resolvedConfig, params.value);
		return;
	}
	params.provider.setCredentialValue(fetch, params.value);
}
function keyPathForFetchProvider(provider) {
	return provider.credentialPath;
}
function readConfiguredFetchProviderCredential(params) {
	return params.provider.getConfiguredCredentialValue?.(params.config) ?? params.provider.getCredentialValue(params.fetch);
}
function inactivePathsForFetchProvider(provider) {
	if (provider.requiresCredential === false) return [];
	return provider.inactiveSecretPaths?.length ? provider.inactiveSecretPaths : [provider.credentialPath];
}
function hasConfiguredSecretRef(value, defaults) {
	return Boolean(resolveSecretInputRef({
		value,
		defaults
	}).ref);
}
async function resolveRuntimeWebTools(params) {
	const defaults = params.sourceConfig.secrets?.defaults;
	const diagnostics = [];
	const tools = isRecord(params.sourceConfig.tools) ? params.sourceConfig.tools : void 0;
	const web = isRecord(tools?.web) ? tools.web : void 0;
	const search = isRecord(web?.search) ? web.search : void 0;
	const rawProvider = typeof search?.provider === "string" ? search.provider.trim().toLowerCase() : "";
	const configuredBundledPluginId = resolveBundledWebSearchPluginId(rawProvider);
	const searchMetadata = {
		providerSource: "none",
		diagnostics: []
	};
	const searchProviders = sortWebSearchProvidersForAutoDetect(configuredBundledPluginId ? resolveBundledPluginWebSearchProviders({
		config: params.sourceConfig,
		env: {
			...process.env,
			...params.context.env
		},
		bundledAllowlistCompat: true,
		onlyPluginIds: [configuredBundledPluginId]
	}) : !hasCustomWebSearchPluginRisk(params.sourceConfig) ? resolveBundledPluginWebSearchProviders({
		config: params.sourceConfig,
		env: {
			...process.env,
			...params.context.env
		},
		bundledAllowlistCompat: true
	}) : resolvePluginWebSearchProviders({
		config: params.sourceConfig,
		env: {
			...process.env,
			...params.context.env
		},
		bundledAllowlistCompat: true
	}));
	const hasConfiguredSearchSurface = Boolean(search) || searchProviders.some((provider) => {
		if (provider.requiresCredential === false) return false;
		return readConfiguredProviderCredential({
			provider,
			config: params.sourceConfig,
			search
		}) !== void 0;
	});
	const searchEnabled = hasConfiguredSearchSurface && search?.enabled !== false;
	const providers = hasConfiguredSearchSurface ? searchProviders : [];
	const configuredProvider = normalizeProvider(rawProvider, providers);
	if (rawProvider && !configuredProvider) {
		const diagnostic = {
			code: "WEB_SEARCH_PROVIDER_INVALID_AUTODETECT",
			message: `tools.web.search.provider is "${rawProvider}". Falling back to auto-detect precedence.`,
			path: "tools.web.search.provider"
		};
		diagnostics.push(diagnostic);
		searchMetadata.diagnostics.push(diagnostic);
		pushWarning(params.context, {
			code: "WEB_SEARCH_PROVIDER_INVALID_AUTODETECT",
			path: "tools.web.search.provider",
			message: diagnostic.message
		});
	}
	if (configuredProvider) {
		searchMetadata.providerConfigured = configuredProvider;
		searchMetadata.providerSource = "configured";
	}
	if (searchEnabled) {
		const candidates = configuredProvider ? providers.filter((provider) => provider.id === configuredProvider) : providers;
		const unresolvedWithoutFallback = [];
		let selectedProvider;
		let selectedResolution;
		let keylessFallbackProvider;
		for (const provider of candidates) {
			if (provider.requiresCredential === false) {
				if (!keylessFallbackProvider) keylessFallbackProvider = provider;
				if (configuredProvider) {
					selectedProvider = provider.id;
					break;
				}
				continue;
			}
			const path = keyPathForProvider(provider);
			const value = readConfiguredProviderCredential({
				provider,
				config: params.sourceConfig,
				search
			});
			const resolution = await resolveSecretInputWithEnvFallback({
				sourceConfig: params.sourceConfig,
				context: params.context,
				defaults,
				value,
				path,
				envVars: provider.envVars
			});
			if (resolution.secretRefConfigured && resolution.fallbackUsedAfterRefFailure) {
				const diagnostic = {
					code: "WEB_SEARCH_KEY_UNRESOLVED_FALLBACK_USED",
					message: `${path} SecretRef could not be resolved; using ${resolution.fallbackEnvVar ?? "env fallback"}. ` + (resolution.unresolvedRefReason ?? "").trim(),
					path
				};
				diagnostics.push(diagnostic);
				searchMetadata.diagnostics.push(diagnostic);
				pushWarning(params.context, {
					code: "WEB_SEARCH_KEY_UNRESOLVED_FALLBACK_USED",
					path,
					message: diagnostic.message
				});
			}
			if (resolution.secretRefConfigured && !resolution.value && resolution.unresolvedRefReason) unresolvedWithoutFallback.push({
				provider: provider.id,
				path,
				reason: resolution.unresolvedRefReason
			});
			if (configuredProvider) {
				selectedProvider = provider.id;
				selectedResolution = resolution;
				if (resolution.value) setResolvedWebSearchApiKey({
					resolvedConfig: params.resolvedConfig,
					provider,
					value: resolution.value
				});
				break;
			}
			if (resolution.value) {
				selectedProvider = provider.id;
				selectedResolution = resolution;
				setResolvedWebSearchApiKey({
					resolvedConfig: params.resolvedConfig,
					provider,
					value: resolution.value
				});
				break;
			}
		}
		if (!selectedProvider && keylessFallbackProvider) {
			selectedProvider = keylessFallbackProvider.id;
			selectedResolution = {
				source: "missing",
				secretRefConfigured: false,
				fallbackUsedAfterRefFailure: false
			};
		}
		const failUnresolvedSearchNoFallback = (unresolved) => {
			const diagnostic = {
				code: "WEB_SEARCH_KEY_UNRESOLVED_NO_FALLBACK",
				message: unresolved.reason,
				path: unresolved.path
			};
			diagnostics.push(diagnostic);
			searchMetadata.diagnostics.push(diagnostic);
			pushWarning(params.context, {
				code: "WEB_SEARCH_KEY_UNRESOLVED_NO_FALLBACK",
				path: unresolved.path,
				message: unresolved.reason
			});
			throw new Error(`[WEB_SEARCH_KEY_UNRESOLVED_NO_FALLBACK] ${unresolved.reason}`);
		};
		if (configuredProvider) {
			const unresolved = unresolvedWithoutFallback[0];
			if (unresolved) failUnresolvedSearchNoFallback(unresolved);
		} else {
			if (!selectedProvider && unresolvedWithoutFallback.length > 0) failUnresolvedSearchNoFallback(unresolvedWithoutFallback[0]);
			if (selectedProvider) {
				const diagnostic = {
					code: "WEB_SEARCH_AUTODETECT_SELECTED",
					message: providers.find((entry) => entry.id === selectedProvider)?.requiresCredential === false ? `tools.web.search auto-detected keyless provider "${selectedProvider}" as the default fallback.` : `tools.web.search auto-detected provider "${selectedProvider}" from available credentials.`,
					path: "tools.web.search.provider"
				};
				diagnostics.push(diagnostic);
				searchMetadata.diagnostics.push(diagnostic);
			}
		}
		if (selectedProvider) {
			searchMetadata.selectedProvider = selectedProvider;
			searchMetadata.selectedProviderKeySource = selectedResolution?.source;
			if (!configuredProvider) searchMetadata.providerSource = "auto-detect";
			const provider = providers.find((entry) => entry.id === selectedProvider);
			if (provider?.resolveRuntimeMetadata) Object.assign(searchMetadata, await provider.resolveRuntimeMetadata({
				config: params.sourceConfig,
				searchConfig: search,
				runtimeMetadata: searchMetadata,
				resolvedCredential: selectedResolution ? {
					value: selectedResolution.value,
					source: selectedResolution.source,
					fallbackEnvVar: selectedResolution.fallbackEnvVar
				} : void 0
			}));
		}
	}
	if (searchEnabled && !configuredProvider && searchMetadata.selectedProvider) for (const provider of providers) {
		if (provider.id === searchMetadata.selectedProvider) continue;
		if (!hasConfiguredSecretRef(readConfiguredProviderCredential({
			provider,
			config: params.sourceConfig,
			search
		}), defaults)) continue;
		for (const path of inactivePathsForProvider(provider)) pushInactiveSurfaceWarning({
			context: params.context,
			path,
			details: `tools.web.search auto-detected provider is "${searchMetadata.selectedProvider}".`
		});
	}
	else if (search && !searchEnabled) for (const provider of providers) {
		if (!hasConfiguredSecretRef(readConfiguredProviderCredential({
			provider,
			config: params.sourceConfig,
			search
		}), defaults)) continue;
		for (const path of inactivePathsForProvider(provider)) pushInactiveSurfaceWarning({
			context: params.context,
			path,
			details: "tools.web.search is disabled."
		});
	}
	if (searchEnabled && search && configuredProvider) for (const provider of providers) {
		if (provider.id === configuredProvider) continue;
		if (!hasConfiguredSecretRef(readConfiguredProviderCredential({
			provider,
			config: params.sourceConfig,
			search
		}), defaults)) continue;
		for (const path of inactivePathsForProvider(provider)) pushInactiveSurfaceWarning({
			context: params.context,
			path,
			details: `tools.web.search.provider is "${configuredProvider}".`
		});
	}
	const fetch = isRecord(web?.fetch) ? web.fetch : void 0;
	const rawFetchProvider = typeof fetch?.provider === "string" ? fetch.provider.trim().toLowerCase() : "";
	const configuredBundledFetchPluginId = resolveBundledWebFetchPluginId(rawFetchProvider);
	const fetchMetadata = {
		providerSource: "none",
		diagnostics: []
	};
	const fetchProviders = sortWebFetchProvidersForAutoDetect(configuredBundledFetchPluginId ? resolveBundledPluginWebFetchProviders({
		config: params.sourceConfig,
		env: {
			...process.env,
			...params.context.env
		},
		bundledAllowlistCompat: true,
		onlyPluginIds: [configuredBundledFetchPluginId]
	}) : resolveBundledPluginWebFetchProviders({
		config: params.sourceConfig,
		env: {
			...process.env,
			...params.context.env
		},
		bundledAllowlistCompat: true
	}));
	const fetchEnabled = (Boolean(fetch) || fetchProviders.some((provider) => {
		return readConfiguredFetchProviderCredential({
			provider,
			config: params.sourceConfig,
			fetch
		}) !== void 0;
	})) && fetch?.enabled !== false;
	const configuredFetchProvider = normalizeFetchProvider(rawFetchProvider, fetchProviders);
	if (rawFetchProvider && !configuredFetchProvider) {
		const diagnostic = {
			code: "WEB_FETCH_PROVIDER_INVALID_AUTODETECT",
			message: `tools.web.fetch.provider is "${rawFetchProvider}". Falling back to auto-detect precedence.`,
			path: "tools.web.fetch.provider"
		};
		diagnostics.push(diagnostic);
		fetchMetadata.diagnostics.push(diagnostic);
		pushWarning(params.context, {
			code: "WEB_FETCH_PROVIDER_INVALID_AUTODETECT",
			path: "tools.web.fetch.provider",
			message: diagnostic.message
		});
	}
	if (configuredFetchProvider) {
		fetchMetadata.providerConfigured = configuredFetchProvider;
		fetchMetadata.providerSource = "configured";
	}
	if (fetchEnabled) {
		const candidates = configuredFetchProvider ? fetchProviders.filter((provider) => provider.id === configuredFetchProvider) : fetchProviders;
		const unresolvedWithoutFallback = [];
		let selectedProvider;
		let selectedResolution;
		for (const provider of candidates) {
			if (provider.requiresCredential === false) {
				selectedProvider = provider.id;
				selectedResolution = {
					source: "missing",
					secretRefConfigured: false,
					fallbackUsedAfterRefFailure: false
				};
				break;
			}
			const path = keyPathForFetchProvider(provider);
			const value = readConfiguredFetchProviderCredential({
				provider,
				config: params.sourceConfig,
				fetch
			});
			const resolution = await resolveSecretInputWithEnvFallback({
				sourceConfig: params.sourceConfig,
				context: params.context,
				defaults,
				value,
				path,
				envVars: provider.envVars,
				restrictEnvRefsToEnvVars: true
			});
			if (resolution.secretRefConfigured && resolution.fallbackUsedAfterRefFailure) {
				const diagnostic = {
					code: "WEB_FETCH_PROVIDER_KEY_UNRESOLVED_FALLBACK_USED",
					message: `${path} SecretRef could not be resolved; using ${resolution.fallbackEnvVar ?? "env fallback"}. ` + (resolution.unresolvedRefReason ?? "").trim(),
					path
				};
				diagnostics.push(diagnostic);
				fetchMetadata.diagnostics.push(diagnostic);
				pushWarning(params.context, {
					code: "WEB_FETCH_PROVIDER_KEY_UNRESOLVED_FALLBACK_USED",
					path,
					message: diagnostic.message
				});
			}
			if (resolution.secretRefConfigured && !resolution.value && resolution.unresolvedRefReason) unresolvedWithoutFallback.push({
				provider: provider.id,
				path,
				reason: resolution.unresolvedRefReason
			});
			if (configuredFetchProvider) {
				selectedProvider = provider.id;
				selectedResolution = resolution;
				if (resolution.value) setResolvedWebFetchApiKey({
					resolvedConfig: params.resolvedConfig,
					provider,
					value: resolution.value
				});
				break;
			}
			if (resolution.value) {
				selectedProvider = provider.id;
				selectedResolution = resolution;
				setResolvedWebFetchApiKey({
					resolvedConfig: params.resolvedConfig,
					provider,
					value: resolution.value
				});
				break;
			}
		}
		const failUnresolvedFetchNoFallback = (unresolved) => {
			const diagnostic = {
				code: "WEB_FETCH_PROVIDER_KEY_UNRESOLVED_NO_FALLBACK",
				message: unresolved.reason,
				path: unresolved.path
			};
			diagnostics.push(diagnostic);
			fetchMetadata.diagnostics.push(diagnostic);
			pushWarning(params.context, {
				code: "WEB_FETCH_PROVIDER_KEY_UNRESOLVED_NO_FALLBACK",
				path: unresolved.path,
				message: unresolved.reason
			});
			throw new Error(`[WEB_FETCH_PROVIDER_KEY_UNRESOLVED_NO_FALLBACK] ${unresolved.reason}`);
		};
		if (configuredFetchProvider) {
			const unresolved = unresolvedWithoutFallback[0];
			if (unresolved) failUnresolvedFetchNoFallback(unresolved);
		} else {
			if (!selectedProvider && unresolvedWithoutFallback.length > 0) failUnresolvedFetchNoFallback(unresolvedWithoutFallback[0]);
			if (selectedProvider) {
				const diagnostic = {
					code: "WEB_FETCH_AUTODETECT_SELECTED",
					message: fetchProviders.find((entry) => entry.id === selectedProvider)?.requiresCredential === false ? `tools.web.fetch auto-detected keyless provider "${selectedProvider}" as the default fallback.` : `tools.web.fetch auto-detected provider "${selectedProvider}" from available credentials.`,
					path: "tools.web.fetch.provider"
				};
				diagnostics.push(diagnostic);
				fetchMetadata.diagnostics.push(diagnostic);
			}
		}
		if (selectedProvider) {
			fetchMetadata.selectedProvider = selectedProvider;
			fetchMetadata.selectedProviderKeySource = selectedResolution?.source;
			if (!configuredFetchProvider) fetchMetadata.providerSource = "auto-detect";
			const provider = fetchProviders.find((entry) => entry.id === selectedProvider);
			if (provider?.resolveRuntimeMetadata) Object.assign(fetchMetadata, await provider.resolveRuntimeMetadata({
				config: params.sourceConfig,
				fetchConfig: fetch,
				runtimeMetadata: fetchMetadata,
				resolvedCredential: selectedResolution ? {
					value: selectedResolution.value,
					source: selectedResolution.source,
					fallbackEnvVar: selectedResolution.fallbackEnvVar
				} : void 0
			}));
		}
	}
	if (fetchEnabled && !configuredFetchProvider && fetchMetadata.selectedProvider) for (const provider of fetchProviders) {
		if (provider.id === fetchMetadata.selectedProvider) continue;
		if (!hasConfiguredSecretRef(readConfiguredFetchProviderCredential({
			provider,
			config: params.sourceConfig,
			fetch
		}), defaults)) continue;
		for (const path of inactivePathsForFetchProvider(provider)) pushInactiveSurfaceWarning({
			context: params.context,
			path,
			details: `tools.web.fetch auto-detected provider is "${fetchMetadata.selectedProvider}".`
		});
	}
	else if (fetch && !fetchEnabled) for (const provider of fetchProviders) {
		if (!hasConfiguredSecretRef(readConfiguredFetchProviderCredential({
			provider,
			config: params.sourceConfig,
			fetch
		}), defaults)) continue;
		for (const path of inactivePathsForFetchProvider(provider)) pushInactiveSurfaceWarning({
			context: params.context,
			path,
			details: "tools.web.fetch is disabled."
		});
	}
	if (fetchEnabled && fetch && configuredFetchProvider) for (const provider of fetchProviders) {
		if (provider.id === configuredFetchProvider) continue;
		if (!hasConfiguredSecretRef(readConfiguredFetchProviderCredential({
			provider,
			config: params.sourceConfig,
			fetch
		}), defaults)) continue;
		for (const path of inactivePathsForFetchProvider(provider)) pushInactiveSurfaceWarning({
			context: params.context,
			path,
			details: `tools.web.fetch.provider is "${configuredFetchProvider}".`
		});
	}
	return {
		search: searchMetadata,
		fetch: fetchMetadata,
		diagnostics
	};
}
//#endregion
export { GATEWAY_AUTH_SURFACE_PATHS as a, createResolverContext as c, analyzeCommandSecretAssignmentsFromSnapshot as d, collectCommandSecretAssignmentsFromSnapshot as f, isExpectedResolvedSecretValue as h, collectConfigAssignments as i, pushAssignment as l, hasConfiguredPlaintextSecretValue as m, resolveBundledPluginWebFetchProviders as n, evaluateGatewayAuthSurfaceStates as o, assertExpectedResolvedSecretValue as p, sortWebFetchProvidersForAutoDetect as r, applyResolvedAssignments as s, resolveRuntimeWebTools as t, pushWarning as u };
