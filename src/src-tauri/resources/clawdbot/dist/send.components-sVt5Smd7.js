import { s as __toESM } from "./chunk-iyeSoAlh.js";
import { t as resolveGlobalMap } from "./global-singleton-BuWJMSMa.js";
import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { n as extensionForMime } from "./mime-C9472kP8.js";
import { m as resolveTextChunksWithFallback } from "./reply-payload-SzVz53hc.js";
import { n as normalizePollInput, t as normalizePollDurationHours } from "./polls-Dua9EwFF.js";
import { i as chunkMarkdownTextWithMode } from "./chunk-D6CtZg6q.js";
import { t as loadWebMedia } from "./web-media-4TOxrRxF.js";
import { t as buildOutboundMediaLoadOptions } from "./load-options-3Kn0T7Wg.js";
import "./routing-Br1fEo8A.js";
import { c as recordChannelActivity } from "./heartbeat-visibility-CIk_o9BM.js";
import "./config-runtime-CmISCurQ.js";
import "./reply-chunking-CIe6J6dn.js";
import "./channel-runtime-BQArgtty.js";
import { n as createRateLimitRetryRunner } from "./retry-policy-Bcco4yaL.js";
import "./media-runtime-DdCWeFPm.js";
import "./web-media-DPyBx-37.js";
import { t as loadOutboundMediaFromUrl } from "./outbound-media-Cj_f0fBE.js";
import "./retry-runtime-Bbb3_EMn.js";
import { t as normalizeDiscordToken } from "./token-MkG2GNpU.js";
import { i as mergeDiscordAccountConfig, o as resolveDiscordAccount } from "./accounts-7Ym6HIvs.js";
import { i as resolveDiscordTarget, n as parseDiscordTarget } from "./runtime-api-B2wCPqWw.js";
import { a as PermissionFlagsBits$1, l as require_v10, o as Routes, r as ChannelType$2 } from "./v10-BAfWMthH.js";
import { c as resolveDiscordComponentAttachmentName, i as buildDiscordComponentMessageFlags, r as buildDiscordComponentMessage } from "./components-CYCrolfj.js";
import { Embed, RateLimitError, RequestClient, serializePayload } from "@buape/carbon";
//#region node_modules/discord-api-types/payloads/v10/index.mjs
var import_v10 = /* @__PURE__ */ __toESM(require_v10(), 1);
import_v10.default.APIApplicationCommandPermissionsConstant;
import_v10.default.ActivityFlags;
import_v10.default.ActivityLocationKind;
import_v10.default.ActivityPlatform;
import_v10.default.ActivityType;
import_v10.default.AllowedMentionsTypes;
import_v10.default.ApplicationCommandOptionType;
import_v10.default.ApplicationCommandPermissionType;
import_v10.default.ApplicationCommandType;
import_v10.default.ApplicationFlags;
import_v10.default.ApplicationIntegrationType;
import_v10.default.ApplicationRoleConnectionMetadataType;
import_v10.default.ApplicationWebhookEventStatus;
import_v10.default.ApplicationWebhookEventType;
import_v10.default.ApplicationWebhookType;
import_v10.default.AttachmentFlags;
import_v10.default.AuditLogEvent;
import_v10.default.AuditLogOptionsType;
import_v10.default.AutoModerationActionType;
import_v10.default.AutoModerationRuleEventType;
import_v10.default.AutoModerationRuleKeywordPresetType;
import_v10.default.AutoModerationRuleTriggerType;
import_v10.default.BaseThemeType;
import_v10.default.ButtonStyle;
import_v10.default.ChannelFlags;
import_v10.default.ChannelType;
import_v10.default.ComponentType;
import_v10.default.ConnectionService;
import_v10.default.ConnectionVisibility;
import_v10.default.EmbedType;
import_v10.default.EntitlementType;
import_v10.default.EntryPointCommandHandlerType;
import_v10.default.ForumLayoutType;
import_v10.default.GuildDefaultMessageNotifications;
import_v10.default.GuildExplicitContentFilter;
import_v10.default.GuildFeature;
import_v10.default.GuildHubType;
import_v10.default.GuildMFALevel;
import_v10.default.GuildMemberFlags;
import_v10.default.GuildNSFWLevel;
import_v10.default.GuildOnboardingMode;
import_v10.default.GuildOnboardingPromptType;
import_v10.default.GuildPremiumTier;
import_v10.default.GuildScheduledEventEntityType;
import_v10.default.GuildScheduledEventPrivacyLevel;
import_v10.default.GuildScheduledEventRecurrenceRuleFrequency;
import_v10.default.GuildScheduledEventRecurrenceRuleMonth;
import_v10.default.GuildScheduledEventRecurrenceRuleWeekday;
import_v10.default.GuildScheduledEventStatus;
import_v10.default.GuildSystemChannelFlags;
import_v10.default.GuildVerificationLevel;
import_v10.default.GuildWidgetStyle;
import_v10.default.IntegrationExpireBehavior;
import_v10.default.InteractionContextType;
import_v10.default.InteractionResponseType;
import_v10.default.InteractionType;
import_v10.default.InviteFlags;
import_v10.default.InviteTargetType;
import_v10.default.InviteType;
import_v10.default.MembershipScreeningFieldType;
import_v10.default.MessageActivityType;
import_v10.default.MessageFlags;
import_v10.default.MessageReferenceType;
import_v10.default.MessageSearchAuthorType;
import_v10.default.MessageSearchEmbedType;
import_v10.default.MessageSearchHasType;
import_v10.default.MessageSearchSortMode;
import_v10.default.MessageType;
import_v10.default.NameplatePalette;
import_v10.default.OAuth2Scopes;
import_v10.default.OverwriteType;
import_v10.default.PermissionFlagsBits;
const PollLayoutType = import_v10.default.PollLayoutType;
import_v10.default.PresenceUpdateStatus;
import_v10.default.RoleFlags;
import_v10.default.SKUFlags;
import_v10.default.SKUType;
import_v10.default.SelectMenuDefaultValueType;
import_v10.default.SeparatorSpacingSize;
import_v10.default.SortOrderType;
import_v10.default.StageInstancePrivacyLevel;
import_v10.default.StatusDisplayType;
import_v10.default.StickerFormatType;
import_v10.default.StickerType;
import_v10.default.SubscriptionStatus;
import_v10.default.TeamMemberMembershipState;
import_v10.default.TeamMemberRole;
import_v10.default.TextInputStyle;
import_v10.default.ThreadAutoArchiveDuration;
import_v10.default.ThreadMemberFlags;
import_v10.default.UnfurledMediaItemLoadingState;
import_v10.default.UserFlags;
import_v10.default.UserPremiumType;
import_v10.default.VideoQualityMode;
import_v10.default.WebhookType;
//#endregion
//#region extensions/discord/src/chunk.ts
const DEFAULT_MAX_CHARS = 2e3;
const DEFAULT_MAX_LINES = 17;
const FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;
function countLines(text) {
	if (!text) return 0;
	return text.split("\n").length;
}
function parseFenceLine(line) {
	const match = line.match(FENCE_RE);
	if (!match) return null;
	const indent = match[1] ?? "";
	const marker = match[2] ?? "";
	return {
		indent,
		markerChar: marker[0] ?? "`",
		markerLen: marker.length,
		openLine: line
	};
}
function closeFenceLine(openFence) {
	return `${openFence.indent}${openFence.markerChar.repeat(openFence.markerLen)}`;
}
function closeFenceIfNeeded(text, openFence) {
	if (!openFence) return text;
	const closeLine = closeFenceLine(openFence);
	if (!text) return closeLine;
	if (!text.endsWith("\n")) return `${text}\n${closeLine}`;
	return `${text}${closeLine}`;
}
function splitLongLine(line, maxChars, opts) {
	const limit = Math.max(1, Math.floor(maxChars));
	if (line.length <= limit) return [line];
	const out = [];
	let remaining = line;
	while (remaining.length > limit) {
		if (opts.preserveWhitespace) {
			out.push(remaining.slice(0, limit));
			remaining = remaining.slice(limit);
			continue;
		}
		const window = remaining.slice(0, limit);
		let breakIdx = -1;
		for (let i = window.length - 1; i >= 0; i--) if (/\s/.test(window[i])) {
			breakIdx = i;
			break;
		}
		if (breakIdx <= 0) breakIdx = limit;
		out.push(remaining.slice(0, breakIdx));
		remaining = remaining.slice(breakIdx);
	}
	if (remaining.length) out.push(remaining);
	return out;
}
/**
* Chunks outbound Discord text by both character count and (soft) line count,
* while keeping fenced code blocks balanced across chunks.
*/
function chunkDiscordText(text, opts = {}) {
	const maxChars = Math.max(1, Math.floor(opts.maxChars ?? DEFAULT_MAX_CHARS));
	const maxLines = Math.max(1, Math.floor(opts.maxLines ?? DEFAULT_MAX_LINES));
	const body = text ?? "";
	if (!body) return [];
	if (body.length <= maxChars && countLines(body) <= maxLines) return [body];
	const lines = body.split("\n");
	const chunks = [];
	let current = "";
	let currentLines = 0;
	let openFence = null;
	const flush = () => {
		if (!current) return;
		const payload = closeFenceIfNeeded(current, openFence);
		if (payload.trim().length) chunks.push(payload);
		current = "";
		currentLines = 0;
		if (openFence) {
			current = openFence.openLine;
			currentLines = 1;
		}
	};
	for (const originalLine of lines) {
		const fenceInfo = parseFenceLine(originalLine);
		const wasInsideFence = openFence !== null;
		let nextOpenFence = openFence;
		if (fenceInfo) {
			if (!openFence) nextOpenFence = fenceInfo;
			else if (openFence.markerChar === fenceInfo.markerChar && fenceInfo.markerLen >= openFence.markerLen) nextOpenFence = null;
		}
		const reserveChars = nextOpenFence ? closeFenceLine(nextOpenFence).length + 1 : 0;
		const reserveLines = nextOpenFence ? 1 : 0;
		const effectiveMaxChars = maxChars - reserveChars;
		const effectiveMaxLines = maxLines - reserveLines;
		const charLimit = effectiveMaxChars > 0 ? effectiveMaxChars : maxChars;
		const lineLimit = effectiveMaxLines > 0 ? effectiveMaxLines : maxLines;
		const prefixLen = current.length > 0 ? current.length + 1 : 0;
		const segments = splitLongLine(originalLine, Math.max(1, charLimit - prefixLen), { preserveWhitespace: wasInsideFence });
		for (let segIndex = 0; segIndex < segments.length; segIndex++) {
			const segment = segments[segIndex];
			const isLineContinuation = segIndex > 0;
			const addition = `${isLineContinuation ? "" : current.length > 0 ? "\n" : ""}${segment}`;
			const nextLen = current.length + addition.length;
			const nextLines = currentLines + (isLineContinuation ? 0 : 1);
			if ((nextLen > charLimit || nextLines > lineLimit) && current.length > 0) flush();
			if (current.length > 0) {
				current += addition;
				if (!isLineContinuation) currentLines += 1;
			} else {
				current = segment;
				currentLines = 1;
			}
		}
		openFence = nextOpenFence;
	}
	if (current.length) {
		const payload = closeFenceIfNeeded(current, openFence);
		if (payload.trim().length) chunks.push(payload);
	}
	return rebalanceReasoningItalics(text, chunks);
}
function chunkDiscordTextWithMode(text, opts) {
	if ((opts.chunkMode ?? "length") !== "newline") return chunkDiscordText(text, opts);
	const lineChunks = chunkMarkdownTextWithMode(text, Math.max(1, Math.floor(opts.maxChars ?? DEFAULT_MAX_CHARS)), "newline");
	const chunks = [];
	for (const line of lineChunks) {
		const nested = chunkDiscordText(line, opts);
		if (!nested.length && line) {
			chunks.push(line);
			continue;
		}
		chunks.push(...nested);
	}
	return chunks;
}
function rebalanceReasoningItalics(source, chunks) {
	if (chunks.length <= 1) return chunks;
	if (!(source.startsWith("Reasoning:\n_") && source.trimEnd().endsWith("_"))) return chunks;
	const adjusted = [...chunks];
	for (let i = 0; i < adjusted.length; i++) {
		const isLast = i === adjusted.length - 1;
		const current = adjusted[i];
		if (!current.trimEnd().endsWith("_")) adjusted[i] = `${current}_`;
		if (isLast) break;
		const next = adjusted[i + 1];
		const leadingWhitespaceLen = next.length - next.trimStart().length;
		const leadingWhitespace = next.slice(0, leadingWhitespaceLen);
		const nextBody = next.slice(leadingWhitespaceLen);
		if (!nextBody.startsWith("_")) adjusted[i + 1] = `${leadingWhitespace}_${nextBody}`;
	}
	return adjusted;
}
//#endregion
//#region extensions/discord/src/retry.ts
const DISCORD_RETRY_DEFAULTS = {
	attempts: 3,
	minDelayMs: 500,
	maxDelayMs: 3e4,
	jitter: .1
};
function createDiscordRetryRunner(params) {
	return createRateLimitRetryRunner({
		...params,
		defaults: DISCORD_RETRY_DEFAULTS,
		logLabel: "discord",
		shouldRetry: (err) => err instanceof RateLimitError,
		retryAfterMs: (err) => err instanceof RateLimitError ? err.retryAfter * 1e3 : void 0
	});
}
//#endregion
//#region extensions/discord/src/client.ts
function resolveToken(params) {
	const fallback = normalizeDiscordToken(params.fallbackToken, "channels.discord.token");
	if (!fallback) throw new Error(`Discord bot token missing for account "${params.accountId}" (set discord.accounts.${params.accountId}.token or DISCORD_BOT_TOKEN for default).`);
	return fallback;
}
function resolveRest(token, rest) {
	return rest ?? new RequestClient(token);
}
function resolveAccountWithoutToken(params) {
	const accountId = normalizeAccountId(params.accountId);
	const merged = mergeDiscordAccountConfig(params.cfg, accountId);
	const baseEnabled = params.cfg.channels?.discord?.enabled !== false;
	const accountEnabled = merged.enabled !== false;
	return {
		accountId,
		enabled: baseEnabled && accountEnabled,
		name: merged.name?.trim() || void 0,
		token: "",
		tokenSource: "none",
		config: merged
	};
}
function createDiscordRestClient(opts, cfg) {
	const resolvedCfg = opts.cfg ?? cfg ?? loadConfig();
	const explicitToken = normalizeDiscordToken(opts.token, "channels.discord.token");
	const account = explicitToken ? resolveAccountWithoutToken({
		cfg: resolvedCfg,
		accountId: opts.accountId
	}) : resolveDiscordAccount({
		cfg: resolvedCfg,
		accountId: opts.accountId
	});
	const token = explicitToken ?? resolveToken({
		accountId: account.accountId,
		fallbackToken: account.token
	});
	return {
		token,
		rest: resolveRest(token, opts.rest),
		account
	};
}
function createDiscordClient(opts, cfg) {
	const { token, rest, account } = createDiscordRestClient(opts, opts.cfg ?? cfg);
	return {
		token,
		rest,
		request: createDiscordRetryRunner({
			retry: opts.retry,
			configRetry: account.config.retry,
			verbose: opts.verbose
		})
	};
}
function resolveDiscordRest(opts) {
	return createDiscordRestClient(opts, opts.cfg).rest;
}
//#endregion
//#region extensions/discord/src/send.permissions.ts
const PERMISSION_ENTRIES = Object.entries(PermissionFlagsBits$1).filter(([, value]) => typeof value === "bigint");
const ALL_PERMISSIONS = PERMISSION_ENTRIES.reduce((acc, [, value]) => acc | value, 0n);
const ADMINISTRATOR_BIT = PermissionFlagsBits$1.Administrator;
function addPermissionBits(base, add) {
	if (!add) return base;
	return base | BigInt(add);
}
function removePermissionBits(base, deny) {
	if (!deny) return base;
	return base & ~BigInt(deny);
}
function bitfieldToPermissions(bitfield) {
	return PERMISSION_ENTRIES.filter(([, value]) => (bitfield & value) === value).map(([name]) => name).toSorted();
}
function hasAdministrator(bitfield) {
	return (bitfield & ADMINISTRATOR_BIT) === ADMINISTRATOR_BIT;
}
function hasPermissionBit(bitfield, permission) {
	return (bitfield & permission) === permission;
}
function isThreadChannelType(channelType) {
	return channelType === ChannelType$2.GuildNewsThread || channelType === ChannelType$2.GuildPublicThread || channelType === ChannelType$2.GuildPrivateThread;
}
async function fetchBotUserId(rest) {
	const me = await rest.get(Routes.user("@me"));
	if (!me?.id) throw new Error("Failed to resolve bot user id");
	return me.id;
}
/**
* Fetch guild-level permissions for a user. This does not include channel-specific overwrites.
*/
async function fetchMemberGuildPermissionsDiscord(guildId, userId, opts = {}) {
	const rest = resolveDiscordRest(opts);
	try {
		const [guild, member] = await Promise.all([rest.get(Routes.guild(guildId)), rest.get(Routes.guildMember(guildId, userId))]);
		const rolesById = new Map((guild.roles ?? []).map((role) => [role.id, role]));
		const everyoneRole = rolesById.get(guildId);
		let permissions = 0n;
		if (everyoneRole?.permissions) permissions = addPermissionBits(permissions, everyoneRole.permissions);
		for (const roleId of member.roles ?? []) {
			const role = rolesById.get(roleId);
			if (role?.permissions) permissions = addPermissionBits(permissions, role.permissions);
		}
		return permissions;
	} catch {
		return null;
	}
}
/**
* Returns true when the user has ADMINISTRATOR or required permission bits
* matching the provided predicate.
*/
async function hasGuildPermissionsDiscord(guildId, userId, requiredPermissions, check, opts = {}) {
	const permissions = await fetchMemberGuildPermissionsDiscord(guildId, userId, opts);
	if (permissions === null) return false;
	if (hasAdministrator(permissions)) return true;
	return check(permissions, requiredPermissions);
}
/**
* Returns true when the user has ADMINISTRATOR or any required permission bit.
*/
async function hasAnyGuildPermissionDiscord(guildId, userId, requiredPermissions, opts = {}) {
	return await hasGuildPermissionsDiscord(guildId, userId, requiredPermissions, (permissions, required) => required.some((permission) => hasPermissionBit(permissions, permission)), opts);
}
/**
* Returns true when the user has ADMINISTRATOR or all required permission bits.
*/
async function hasAllGuildPermissionsDiscord(guildId, userId, requiredPermissions, opts = {}) {
	return await hasGuildPermissionsDiscord(guildId, userId, requiredPermissions, (permissions, required) => required.every((permission) => hasPermissionBit(permissions, permission)), opts);
}
async function fetchChannelPermissionsDiscord(channelId, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const channel = await rest.get(Routes.channel(channelId));
	const channelType = "type" in channel ? channel.type : void 0;
	const guildId = "guild_id" in channel ? channel.guild_id : void 0;
	if (!guildId) return {
		channelId,
		permissions: [],
		raw: "0",
		isDm: true,
		channelType
	};
	const botId = await fetchBotUserId(rest);
	const [guild, member] = await Promise.all([rest.get(Routes.guild(guildId)), rest.get(Routes.guildMember(guildId, botId))]);
	const rolesById = new Map((guild.roles ?? []).map((role) => [role.id, role]));
	const everyoneRole = rolesById.get(guildId);
	let base = 0n;
	if (everyoneRole?.permissions) base = addPermissionBits(base, everyoneRole.permissions);
	for (const roleId of member.roles ?? []) {
		const role = rolesById.get(roleId);
		if (role?.permissions) base = addPermissionBits(base, role.permissions);
	}
	if (hasAdministrator(base)) return {
		channelId,
		guildId,
		permissions: bitfieldToPermissions(ALL_PERMISSIONS),
		raw: ALL_PERMISSIONS.toString(),
		isDm: false,
		channelType
	};
	let permissions = base;
	const overwrites = "permission_overwrites" in channel ? channel.permission_overwrites ?? [] : [];
	for (const overwrite of overwrites) if (overwrite.id === guildId) {
		permissions = removePermissionBits(permissions, overwrite.deny ?? "0");
		permissions = addPermissionBits(permissions, overwrite.allow ?? "0");
	}
	for (const overwrite of overwrites) if (member.roles?.includes(overwrite.id)) {
		permissions = removePermissionBits(permissions, overwrite.deny ?? "0");
		permissions = addPermissionBits(permissions, overwrite.allow ?? "0");
	}
	for (const overwrite of overwrites) if (overwrite.id === botId) {
		permissions = removePermissionBits(permissions, overwrite.deny ?? "0");
		permissions = addPermissionBits(permissions, overwrite.allow ?? "0");
	}
	return {
		channelId,
		guildId,
		permissions: bitfieldToPermissions(permissions),
		raw: permissions.toString(),
		isDm: false,
		channelType
	};
}
//#endregion
//#region extensions/discord/src/send.types.ts
var DiscordSendError = class extends Error {
	constructor(message, opts) {
		super(message);
		this.name = "DiscordSendError";
		if (opts) Object.assign(this, opts);
	}
	toString() {
		return this.message;
	}
};
const DISCORD_MAX_EMOJI_BYTES = 256 * 1024;
const DISCORD_MAX_STICKER_BYTES = 512 * 1024;
//#endregion
//#region extensions/discord/src/send.shared.ts
const DISCORD_TEXT_LIMIT = 2e3;
const DISCORD_MAX_STICKERS = 3;
const DISCORD_POLL_MAX_ANSWERS = 10;
const DISCORD_POLL_MAX_DURATION_HOURS = 768;
const DISCORD_MISSING_PERMISSIONS = 50013;
const DISCORD_CANNOT_DM = 50007;
function normalizeReactionEmoji(raw) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("emoji required");
	const customMatch = trimmed.match(/^<a?:([^:>]+):(\d+)>$/);
	const identifier = customMatch ? `${customMatch[1]}:${customMatch[2]}` : trimmed.replace(/[\uFE0E\uFE0F]/g, "");
	return encodeURIComponent(identifier);
}
/**
* Parse and resolve Discord recipient, including username lookup.
* This enables sending DMs by username (e.g., "john.doe") by querying
* the Discord directory to resolve usernames to user IDs.
*
* @param raw - The recipient string (username, ID, or known format)
* @param accountId - Discord account ID to use for directory lookup
* @returns Parsed DiscordRecipient with resolved user ID if applicable
*/
async function parseAndResolveRecipient(raw, accountId, cfg) {
	const resolvedCfg = cfg ?? loadConfig();
	const accountInfo = resolveDiscordAccount({
		cfg: resolvedCfg,
		accountId
	});
	const trimmed = raw.trim();
	const parseOptions = { ambiguousMessage: `Ambiguous Discord recipient "${trimmed}". Use "user:${trimmed}" for DMs or "channel:${trimmed}" for channel messages.` };
	const resolved = await resolveDiscordTarget(raw, {
		cfg: resolvedCfg,
		accountId: accountInfo.accountId
	}, parseOptions);
	if (resolved) return {
		kind: resolved.kind,
		id: resolved.id
	};
	const parsed = parseDiscordTarget(raw, parseOptions);
	if (!parsed) throw new Error("Recipient is required for Discord sends");
	return {
		kind: parsed.kind,
		id: parsed.id
	};
}
function normalizeStickerIds(raw) {
	const ids = raw.map((entry) => entry.trim()).filter(Boolean);
	if (ids.length === 0) throw new Error("At least one sticker id is required");
	if (ids.length > DISCORD_MAX_STICKERS) throw new Error("Discord supports up to 3 stickers per message");
	return ids;
}
function normalizeEmojiName(raw, label) {
	const name = raw.trim();
	if (!name) throw new Error(`${label} is required`);
	return name;
}
function normalizeDiscordPollInput(input) {
	const poll = normalizePollInput(input, { maxOptions: DISCORD_POLL_MAX_ANSWERS });
	const duration = normalizePollDurationHours(poll.durationHours, {
		defaultHours: 24,
		maxHours: DISCORD_POLL_MAX_DURATION_HOURS
	});
	return {
		question: { text: poll.question },
		answers: poll.options.map((answer) => ({ poll_media: { text: answer } })),
		duration,
		allow_multiselect: poll.maxSelections > 1,
		layout_type: PollLayoutType.Default
	};
}
function getDiscordErrorCode(err) {
	if (!err || typeof err !== "object") return;
	const candidate = "code" in err && err.code !== void 0 ? err.code : "rawError" in err && err.rawError && typeof err.rawError === "object" ? err.rawError.code : void 0;
	if (typeof candidate === "number") return candidate;
	if (typeof candidate === "string" && /^\d+$/.test(candidate)) return Number(candidate);
}
async function buildDiscordSendError(err, ctx) {
	if (err instanceof DiscordSendError) return err;
	const code = getDiscordErrorCode(err);
	if (code === DISCORD_CANNOT_DM) return new DiscordSendError("discord dm failed: user blocks dms or privacy settings disallow it", { kind: "dm-blocked" });
	if (code !== DISCORD_MISSING_PERMISSIONS) return err;
	let missing = [];
	try {
		const permissions = await fetchChannelPermissionsDiscord(ctx.channelId, {
			rest: ctx.rest,
			token: ctx.token
		});
		const current = new Set(permissions.permissions);
		const required = ["ViewChannel", "SendMessages"];
		if (isThreadChannelType(permissions.channelType)) required.push("SendMessagesInThreads");
		if (ctx.hasMedia) required.push("AttachFiles");
		missing = required.filter((permission) => !current.has(permission));
	} catch {}
	return new DiscordSendError(`${missing.length ? `missing permissions in channel ${ctx.channelId}: ${missing.join(", ")}` : `missing permissions in channel ${ctx.channelId}`}. bot might be muted or blocked by role/channel overrides`, {
		kind: "missing-permissions",
		channelId: ctx.channelId,
		missingPermissions: missing
	});
}
async function resolveChannelId(rest, recipient, request) {
	if (recipient.kind === "channel") return { channelId: recipient.id };
	const dmChannel = await request(() => rest.post(Routes.userChannels(), { body: { recipient_id: recipient.id } }), "dm-channel");
	if (!dmChannel?.id) throw new Error("Failed to create Discord DM channel");
	return {
		channelId: dmChannel.id,
		dm: true
	};
}
async function resolveDiscordChannelType(rest, channelId) {
	try {
		return (await rest.get(Routes.channel(channelId)))?.type;
	} catch {
		return;
	}
}
const SUPPRESS_NOTIFICATIONS_FLAG = 4096;
function buildDiscordTextChunks(text, opts = {}) {
	if (!text) return [];
	return resolveTextChunksWithFallback(text, chunkDiscordTextWithMode(text, {
		maxChars: opts.maxChars ?? DISCORD_TEXT_LIMIT,
		maxLines: opts.maxLinesPerMessage,
		chunkMode: opts.chunkMode
	}));
}
function hasV2Components(components) {
	return Boolean(components?.some((component) => "isV2" in component && component.isV2));
}
function resolveDiscordSendComponents(params) {
	if (!params.components || !params.isFirst) return;
	return typeof params.components === "function" ? params.components(params.text) : params.components;
}
function normalizeDiscordEmbeds(embeds) {
	if (!embeds?.length) return;
	return embeds.map((embed) => embed instanceof Embed ? embed : new Embed(embed));
}
function resolveDiscordSendEmbeds(params) {
	if (!params.embeds || !params.isFirst) return;
	return normalizeDiscordEmbeds(params.embeds);
}
function buildDiscordMessagePayload(params) {
	const payload = {};
	const hasV2 = hasV2Components(params.components);
	const trimmed = params.text.trim();
	if (!hasV2 && trimmed) payload.content = params.text;
	if (params.components?.length) payload.components = params.components;
	if (!hasV2 && params.embeds?.length) payload.embeds = params.embeds;
	if (params.flags !== void 0) payload.flags = params.flags;
	if (params.files?.length) payload.files = params.files;
	return payload;
}
function stripUndefinedFields(value) {
	return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== void 0));
}
function toDiscordFileBlob(data) {
	if (data instanceof Blob) return data;
	const arrayBuffer = new ArrayBuffer(data.byteLength);
	new Uint8Array(arrayBuffer).set(data);
	return new Blob([arrayBuffer]);
}
async function sendDiscordText(rest, channelId, text, replyTo, request, maxLinesPerMessage, components, embeds, chunkMode, silent) {
	if (!text.trim()) throw new Error("Message must be non-empty for Discord sends");
	const messageReference = replyTo ? {
		message_id: replyTo,
		fail_if_not_exists: false
	} : void 0;
	const flags = silent ? SUPPRESS_NOTIFICATIONS_FLAG : void 0;
	const chunks = buildDiscordTextChunks(text, {
		maxLinesPerMessage,
		chunkMode
	});
	const sendChunk = async (chunk, isFirst) => {
		const body = stripUndefinedFields({
			...serializePayload(buildDiscordMessagePayload({
				text: chunk,
				components: resolveDiscordSendComponents({
					components,
					text: chunk,
					isFirst
				}),
				embeds: resolveDiscordSendEmbeds({
					embeds,
					isFirst
				}),
				flags
			})),
			...messageReference ? { message_reference: messageReference } : {}
		});
		return await request(() => rest.post(Routes.channelMessages(channelId), { body }), "text");
	};
	if (chunks.length === 1) return await sendChunk(chunks[0], true);
	let last = null;
	for (const [index, chunk] of chunks.entries()) last = await sendChunk(chunk, index === 0);
	if (!last) throw new Error("Discord send failed (empty chunk result)");
	return last;
}
async function sendDiscordMedia(rest, channelId, text, mediaUrl, filename, mediaLocalRoots, mediaReadFile, maxBytes, replyTo, request, maxLinesPerMessage, components, embeds, chunkMode, silent) {
	const media = await loadWebMedia(mediaUrl, buildOutboundMediaLoadOptions({
		maxBytes,
		mediaLocalRoots,
		mediaReadFile
	}));
	const resolvedFileName = filename?.trim() || media.fileName || (media.contentType ? `upload${extensionForMime(media.contentType) ?? ""}` : "") || "upload";
	const chunks = text ? buildDiscordTextChunks(text, {
		maxLinesPerMessage,
		chunkMode
	}) : [];
	const caption = chunks[0] ?? "";
	const messageReference = replyTo ? {
		message_id: replyTo,
		fail_if_not_exists: false
	} : void 0;
	const flags = silent ? SUPPRESS_NOTIFICATIONS_FLAG : void 0;
	const fileData = toDiscordFileBlob(media.buffer);
	const payload = buildDiscordMessagePayload({
		text: caption,
		components: resolveDiscordSendComponents({
			components,
			text: caption,
			isFirst: true
		}),
		embeds: resolveDiscordSendEmbeds({
			embeds,
			isFirst: true
		}),
		flags,
		files: [{
			data: fileData,
			name: resolvedFileName
		}]
	});
	const res = await request(() => rest.post(Routes.channelMessages(channelId), { body: stripUndefinedFields({
		...serializePayload(payload),
		...messageReference ? { message_reference: messageReference } : {}
	}) }), "media");
	for (const chunk of chunks.slice(1)) {
		if (!chunk.trim()) continue;
		await sendDiscordText(rest, channelId, chunk, replyTo, request, maxLinesPerMessage, void 0, void 0, chunkMode, silent);
	}
	return res;
}
function buildReactionIdentifier(emoji) {
	if (emoji.id && emoji.name) return `${emoji.name}:${emoji.id}`;
	return emoji.name ?? "";
}
function formatReactionEmoji(emoji) {
	return buildReactionIdentifier(emoji);
}
//#endregion
//#region extensions/discord/src/components-registry.ts
const DEFAULT_COMPONENT_TTL_MS = 1800 * 1e3;
const DISCORD_COMPONENT_ENTRIES_KEY = Symbol.for("openclaw.discord.componentEntries");
const DISCORD_MODAL_ENTRIES_KEY = Symbol.for("openclaw.discord.modalEntries");
let componentEntries;
let modalEntries;
function getComponentEntries() {
	componentEntries ??= resolveGlobalMap(DISCORD_COMPONENT_ENTRIES_KEY);
	return componentEntries;
}
function getModalEntries() {
	modalEntries ??= resolveGlobalMap(DISCORD_MODAL_ENTRIES_KEY);
	return modalEntries;
}
function isExpired(entry, now) {
	return typeof entry.expiresAt === "number" && entry.expiresAt <= now;
}
function normalizeEntryTimestamps(entry, now, ttlMs) {
	const createdAt = entry.createdAt ?? now;
	const expiresAt = entry.expiresAt ?? createdAt + ttlMs;
	return {
		...entry,
		createdAt,
		expiresAt
	};
}
function registerEntries(entries, store, params) {
	for (const entry of entries) {
		const normalized = normalizeEntryTimestamps({
			...entry,
			messageId: params.messageId ?? entry.messageId
		}, params.now, params.ttlMs);
		store.set(entry.id, normalized);
	}
}
function resolveEntry(store, params) {
	const entry = store.get(params.id);
	if (!entry) return null;
	if (isExpired(entry, Date.now())) {
		store.delete(params.id);
		return null;
	}
	if (params.consume !== false) store.delete(params.id);
	return entry;
}
function registerDiscordComponentEntries(params) {
	const now = Date.now();
	const ttlMs = params.ttlMs ?? DEFAULT_COMPONENT_TTL_MS;
	registerEntries(params.entries, getComponentEntries(), {
		now,
		ttlMs,
		messageId: params.messageId
	});
	registerEntries(params.modals, getModalEntries(), {
		now,
		ttlMs,
		messageId: params.messageId
	});
}
function resolveDiscordComponentEntry(params) {
	return resolveEntry(getComponentEntries(), params);
}
function resolveDiscordModalEntry(params) {
	return resolveEntry(getModalEntries(), params);
}
//#endregion
//#region extensions/discord/src/send.components.ts
const DISCORD_FORUM_LIKE_TYPES = new Set([ChannelType$2.GuildForum, ChannelType$2.GuildMedia]);
function extractComponentAttachmentNames(spec) {
	const names = [];
	for (const block of spec.blocks ?? []) if (block.type === "file") names.push(resolveDiscordComponentAttachmentName(block.file));
	return names;
}
function registerBuiltDiscordComponentMessage(params) {
	registerDiscordComponentEntries({
		entries: params.buildResult.entries,
		modals: params.buildResult.modals,
		messageId: params.messageId
	});
}
async function buildDiscordComponentPayload(params) {
	const buildResult = buildDiscordComponentMessage({
		spec: params.spec,
		sessionKey: params.opts.sessionKey,
		agentId: params.opts.agentId,
		accountId: params.accountId
	});
	const flags = buildDiscordComponentMessageFlags(buildResult.components);
	const finalFlags = params.opts.silent ? (flags ?? 0) | SUPPRESS_NOTIFICATIONS_FLAG : flags ?? void 0;
	const messageReference = params.opts.replyTo ? {
		message_id: params.opts.replyTo,
		fail_if_not_exists: false
	} : void 0;
	const attachmentNames = extractComponentAttachmentNames(params.spec);
	const uniqueAttachmentNames = [...new Set(attachmentNames)];
	if (uniqueAttachmentNames.length > 1) throw new Error("Discord component attachments currently support a single file. Use media-gallery for multiple files.");
	const expectedAttachmentName = uniqueAttachmentNames[0];
	let files;
	if (params.opts.mediaUrl) {
		const media = await loadOutboundMediaFromUrl(params.opts.mediaUrl, {
			mediaAccess: params.opts.mediaAccess,
			mediaLocalRoots: params.opts.mediaLocalRoots,
			mediaReadFile: params.opts.mediaReadFile
		});
		const fileName = params.opts.filename?.trim() || media.fileName || "upload";
		if (expectedAttachmentName && expectedAttachmentName !== fileName) throw new Error(`Component file block expects attachment "${expectedAttachmentName}", but the uploaded file is "${fileName}". Update components.blocks[].file or provide a matching filename.`);
		files = [{
			data: toDiscordFileBlob(media.buffer),
			name: fileName
		}];
	} else if (expectedAttachmentName) throw new Error("Discord component file blocks require a media attachment (media/path/filePath).");
	return {
		body: stripUndefinedFields({
			...serializePayload({
				components: buildResult.components,
				...finalFlags ? { flags: finalFlags } : {},
				...files ? { files } : {}
			}),
			...messageReference ? { message_reference: messageReference } : {}
		}),
		buildResult
	};
}
async function sendDiscordComponentMessage(to, spec, opts = {}) {
	const cfg = opts.cfg ?? loadConfig();
	const accountInfo = resolveDiscordAccount({
		cfg,
		accountId: opts.accountId
	});
	const { token, rest, request } = createDiscordClient(opts, cfg);
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, opts.accountId, cfg), request);
	const channelType = await resolveDiscordChannelType(rest, channelId);
	if (channelType && DISCORD_FORUM_LIKE_TYPES.has(channelType)) throw new Error("Discord components are not supported in forum-style channels");
	const { body, buildResult } = await buildDiscordComponentPayload({
		spec,
		opts,
		accountId: accountInfo.accountId
	});
	let result;
	try {
		result = await request(() => rest.post(Routes.channelMessages(channelId), { body }), "components");
	} catch (err) {
		throw await buildDiscordSendError(err, {
			channelId,
			rest,
			token,
			hasMedia: Boolean(opts.mediaUrl)
		});
	}
	registerBuiltDiscordComponentMessage({
		buildResult,
		messageId: result.id
	});
	recordChannelActivity({
		channel: "discord",
		accountId: accountInfo.accountId,
		direction: "outbound"
	});
	return {
		messageId: result.id ?? "unknown",
		channelId: result.channel_id ?? channelId
	};
}
async function editDiscordComponentMessage(to, messageId, spec, opts = {}) {
	const cfg = opts.cfg ?? loadConfig();
	const accountInfo = resolveDiscordAccount({
		cfg,
		accountId: opts.accountId
	});
	const { token, rest, request } = createDiscordClient(opts, cfg);
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, opts.accountId, cfg), request);
	const { body, buildResult } = await buildDiscordComponentPayload({
		spec,
		opts,
		accountId: accountInfo.accountId
	});
	let result;
	try {
		result = await request(() => rest.patch(Routes.channelMessage(channelId, messageId), { body }), "components");
	} catch (err) {
		throw await buildDiscordSendError(err, {
			channelId,
			rest,
			token,
			hasMedia: Boolean(opts.mediaUrl)
		});
	}
	registerBuiltDiscordComponentMessage({
		buildResult,
		messageId: result.id ?? messageId
	});
	recordChannelActivity({
		channel: "discord",
		accountId: accountInfo.accountId,
		direction: "outbound"
	});
	return {
		messageId: result.id ?? messageId,
		channelId: result.channel_id ?? channelId
	};
}
//#endregion
export { hasAnyGuildPermissionDiscord as A, stripUndefinedFields as C, fetchChannelPermissionsDiscord as D, DiscordSendError as E, chunkDiscordTextWithMode as F, createDiscordRestClient as M, resolveDiscordRest as N, fetchMemberGuildPermissionsDiscord as O, createDiscordRetryRunner as P, sendDiscordText as S, DISCORD_MAX_STICKER_BYTES as T, resolveChannelId as _, resolveDiscordModalEntry as a, resolveDiscordSendEmbeds as b, buildDiscordSendError as c, formatReactionEmoji as d, normalizeDiscordPollInput as f, parseAndResolveRecipient as g, normalizeStickerIds as h, resolveDiscordComponentEntry as i, createDiscordClient as j, hasAllGuildPermissionsDiscord as k, buildDiscordTextChunks as l, normalizeReactionEmoji as m, registerBuiltDiscordComponentMessage as n, SUPPRESS_NOTIFICATIONS_FLAG as o, normalizeEmojiName as p, sendDiscordComponentMessage as r, buildDiscordMessagePayload as s, editDiscordComponentMessage as t, buildReactionIdentifier as u, resolveDiscordChannelType as v, DISCORD_MAX_EMOJI_BYTES as w, sendDiscordMedia as x, resolveDiscordSendComponents as y };
