import { a as __require, s as __toESM, t as __commonJSMin } from "./chunk-iyeSoAlh.js";
import { r as formatErrorMessage } from "./errors-Bs2h5H8p.js";
import { t as isVerbose } from "./global-state-DUuMGgts.js";
import { p as createNonExitingRuntime, t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { n as ensureAuthProfileStore } from "./store-CY-e50gT.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { g as resolveDefaultModelForAgent } from "./model-selection-8a6zD_aX.js";
import { _ as resolveStateDir } from "./paths-CD8i0MSg.js";
import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { a as shouldLogVerbose, r as logVerbose, s as warn, t as danger } from "./globals-BJZkpw-q.js";
import { r as normalizeStringEntries } from "./string-normalization-De1VSx5S.js";
import { n as logError, t as logDebug } from "./logger-Dr2uNJI4.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { i as withFileLock } from "./file-lock-B6EjeH4S.js";
import { a as clearExpiredCooldowns, f as resolveProfilesUnavailableReason, s as isProfileInCooldown } from "./order-CJ_D8C7W.js";
import { d as updateSessionStore, i as loadSessionStore, o as readSessionUpdatedAt } from "./store-BGmy-Wot.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { a as resolveNativeSkillsEnabled, i as resolveNativeCommandsEnabled, n as isNativeCommandsExplicitlyDisabled } from "./commands-Cgp2RFyz.js";
import { v as getPluginCommandSpecs } from "./types-BKsOYeOd.js";
import { n as writeJsonFileAtomically, t as readJsonFileWithFallback } from "./json-store-Bwo-RrS7.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, i as resolveOpenProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy, t as GROUP_POLICY_BLOCKED_LABEL } from "./runtime-group-policy-Dj5ka44z.js";
import { i as resolveHumanDelayConfig } from "./identity-BVAU5Jb3.js";
import { r as enqueueSystemEvent } from "./system-events-DOxYwk9w.js";
import { c as getExecApprovalApproverDmNoticeText, n as buildExecApprovalActionDescriptors } from "./exec-approval-reply-B909d7mK.js";
import { m as resolveTextChunksWithFallback, p as resolveSendableOutboundReplyParts } from "./reply-payload-SzVz53hc.js";
import { c as resolveTextChunkLimit, s as resolveChunkMode } from "./chunk-D6CtZg6q.js";
import { n as getAgentScopedMediaLocalRoots } from "./local-roots-CaV3b967.js";
import { i as formatDurationSeconds } from "./format-duration-C_A6mVzb.js";
import { t as loadWebMedia } from "./web-media-4TOxrRxF.js";
import { i as resolveAgentRoute } from "./resolve-route-DID7K3Jm.js";
import { n as wrapFetchWithAbortSignal } from "./fetch-DXie9oiC.js";
import { i as matchPluginCommand, n as executePluginCommand } from "./commands-IPE8R0rg.js";
import { c as listChatCommands, d as listNativeCommandSpecsForConfig, g as resolveCommandArgMenu, h as resolveCommandArgChoices, m as parseCommandArgs, n as buildCommandTextFromArgs, r as findCommandByNativeName, v as serializeCommandArgs } from "./commands-registry-dA2_ExHR.js";
import { g as formatThreadBindingDurationLabel } from "./thread-bindings-policy-ypJ47uk9.js";
import "./routing-Br1fEo8A.js";
import { t as finalizeInboundContext } from "./inbound-context-1KETU_yq.js";
import { a as resolveEnvelopeFormatOptions, r as formatInboundEnvelope } from "./envelope-CTj2Ympv.js";
import { n as dispatchReplyWithDispatcher } from "./provider-dispatcher-B2dh4tuq.js";
import { t as resolveCommandAuthorizedFromAuthorizers } from "./command-gating-Ch_OhMao.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-DAbwMp5F.js";
import { t as buildPairingReply } from "./pairing-messages-CHCwedho.js";
import { d as upsertChannelPairingRequest } from "./pairing-store-DxNrxr_7.js";
import { i as resolveStoredModelOverride } from "./model-selection-CiyK6Yti.js";
import { t as summarizeStringEntries } from "./string-sample-DISN1Om6.js";
import { a as patchAllowlistUsersInConfigEntries, n as buildAllowlistResolutionSummary, o as summarizeMapping, r as canonicalizeAllowlistWithResolvedIds, t as addAllowlistUserEntriesFromConfigEntry } from "./resolve-utils-C87Wj7-V.js";
import { n as readStoreAllowFromForDmPolicy, o as resolveDmGroupAccessWithLists } from "./dm-policy-shared-ikRqobo8.js";
import { t as withTimeout } from "./with-timeout-DUjG22ty.js";
import "./runtime-env-CoykX19-.js";
import { o as resolveExecApprovalCommandDisplay } from "./exec-approval-session-target-C1KSzAWi.js";
import { t as createChannelNativeApprovalRuntime } from "./approval-native-runtime-C3EqZgQD.js";
import { n as isDangerousNameMatchingEnabled } from "./dangerous-name-matching-B1150NOt.js";
import "./config-runtime-CmISCurQ.js";
import "./reply-runtime-DxFWfQpm.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-S26JmiPz.js";
import "./channel-runtime-BQArgtty.js";
import "./infra-runtime-bLI1f-xh.js";
import "./ssrf-runtime-BoGiIhjZ.js";
import "./media-runtime-DdCWeFPm.js";
import { i as resolveConfiguredBindingRoute, r as ensureConfiguredBindingRouteReady } from "./conversation-runtime-DIsQmaYR.js";
import { n as chunkItems } from "./text-runtime-B0ZpmkER.js";
import "./agent-runtime-B7ucOTD-.js";
import "./plugin-runtime-CR3GBFZ-.js";
import { t as security_runtime_exports } from "./security-runtime-DCa00BFS.js";
import { t as createConnectedChannelStatusPatch } from "./gateway-runtime-B7jG4Cjq.js";
import "./markdown-table-runtime-4CgY-jlq.js";
import { t as createChannelPairingChallengeIssuer } from "./channel-pairing-Nk7oRFrM.js";
import { t as resolveNativeCommandSessionTargets } from "./native-command-session-targets-C-trSwJC.js";
import { t as listSkillCommandsForAgents } from "./skill-commands-nVTmVENA.js";
import "./command-auth-Bajp-QXz.js";
import "./command-auth-native-m2se5Aky.js";
import "./web-media-DPyBx-37.js";
import "./channel-inbound-BTUonbdp.js";
import "./fetch-runtime-CrVTOaek.js";
import "./state-paths-DQuHVxrl.js";
import "./native-command-registry-BXAZNUtg.js";
import "./session-store-runtime-DTykXB7W.js";
import { t as normalizeDiscordToken } from "./token-MkG2GNpU.js";
import { c as resolveDiscordMaxLinesPerMessage, o as resolveDiscordAccount } from "./accounts-7Ym6HIvs.js";
import { n as formatDiscordUserTag, t as formatDiscordReactionEmoji } from "./format-CviHuUx2.js";
import { a as resolveDiscordAllowListMatch, d as resolveDiscordOwnerAccess, h as shouldEmitDiscordReactionNotification, i as normalizeDiscordSlug, l as resolveDiscordGuildEntry, m as resolveGroupDmAllow, n as isDiscordGroupAllowedByPolicy, r as normalizeDiscordAllowList, s as resolveDiscordChannelConfigWithFallback, u as resolveDiscordMemberAccessState } from "./allow-list-qE0AJ4XV.js";
import { a as getDiscordExecApprovalApprovers, i as shouldHandleDiscordApprovalRequest, n as createDiscordApprovalCapability, s as isDiscordExecApprovalClientEnabled, t as DiscordUiContainer } from "./ui-Cvzn7c_3.js";
import { n as ButtonStyle$1, o as Routes$1, r as ChannelType$2, t as ApplicationCommandOptionType$1 } from "./v10-BAfWMthH.js";
import { C as stripUndefinedFields, F as chunkDiscordTextWithMode, a as resolveDiscordModalEntry, i as resolveDiscordComponentEntry, j as createDiscordClient } from "./send.components-sVt5Smd7.js";
import { t as formatMention } from "./mentions-XkTIcOKK.js";
import { _ as parseDiscordModalCustomIdForCarbon, g as parseDiscordModalCustomId, h as parseDiscordComponentCustomIdForCarbon, m as parseDiscordComponentCustomId } from "./components-CYCrolfj.js";
import { t as resolveDiscordUserAllowlist } from "./resolve-users-QVP1LD60.js";
import { a as isThreadArchived } from "./thread-bindings.discord-api-WOO9VoBT.js";
import { c as setPresence, i as unregisterGateway, r as registerGateway } from "./gateway-registry-CHn1fno4.js";
import { t as fetchDiscordApplicationId } from "./probe-DgkjlFQq.js";
import { c as normalizeDiscordListenerTimeoutMs, l as runDiscordTaskWithTimeout } from "./timeouts-Rxac5izA.js";
import { c as resolveDiscordThreadParentInfo, p as resolveDiscordChannelInfo } from "./threading-CBvj7nks.js";
import { a as handleDiscordDmCommandDecision, c as buildDirectLabel, d as resolveDiscordSenderIdentity, i as resolveDiscordEffectiveRoute, l as buildGuildLabel, n as resolveDiscordBoundConversationRoute, o as resolveDiscordDmCommandAccess, s as deliverDiscordReply } from "./route-resolution-CuU5jWRE.js";
import { t as authorizeDiscordVoiceIngress } from "./access-Bgr1CliP.js";
import { n as buildDiscordInboundAccessContext, t as buildDiscordGroupSystemPrompt } from "./inbound-context-CHsCnazv.js";
import { t as resolveDiscordChannelAllowlist } from "./resolve-channels-BjmdxRGt.js";
import path from "node:path";
import os from "node:os";
import { inspect } from "node:util";
import * as ws from "ws";
import WebSocket$1 from "ws";
import { EventEmitter } from "node:events";
import * as undici from "undici";
import { ProxyAgent, fetch as fetch$1 } from "undici";
import { Button, ChannelSelectMenu, ChannelType, Client, Command, CommandWithSubcommands, Container, MentionableSelectMenu, MessageCreateListener, MessageReactionAddListener, MessageReactionRemoveListener, Modal, PresenceUpdateListener, RateLimitError, ReadyListener, RoleSelectMenu, Row, Separator, StringSelectMenu, TextDisplay, ThreadUpdateListener, UserSelectMenu, serializePayload } from "@buape/carbon";
import * as httpsProxyAgent from "https-proxy-agent";
//#region node_modules/@buape/carbon/dist/src/abstracts/Plugin.js
/**
* The base class for all plugins
*/
var Plugin = class {};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/BabyCache.js
var BabyCache = class {
	guildCache = /* @__PURE__ */ new Map();
	maxGuilds;
	ttl;
	constructor(maxGuilds = 5e3, ttl = 864e5) {
		this.maxGuilds = maxGuilds;
		this.ttl = ttl;
	}
	setGuild(guildId, entry) {
		if (this.guildCache.size >= this.maxGuilds && !this.guildCache.has(guildId)) {
			let oldestId = null;
			let oldestTime = Number.POSITIVE_INFINITY;
			for (const [id, guild] of this.guildCache.entries()) if (guild.lastEvent < oldestTime) {
				oldestTime = guild.lastEvent;
				oldestId = id;
			}
			if (oldestId) this.guildCache.delete(oldestId);
		}
		this.guildCache.set(guildId, entry);
	}
	getGuild(guildId) {
		const entry = this.guildCache.get(guildId);
		if (!entry) return void 0;
		if (Date.now() - entry.lastEvent > this.ttl) {
			this.guildCache.delete(guildId);
			return;
		}
		return entry;
	}
	removeGuild(guildId) {
		return this.guildCache.delete(guildId);
	}
	cleanup() {
		const now = Date.now();
		let removed = 0;
		for (const [id, entry] of this.guildCache.entries()) if (now - entry.lastEvent > this.ttl) {
			this.guildCache.delete(id);
			removed++;
		}
		return removed;
	}
};
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/gateway/v10.js
var require_v10$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/topics/gateway
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VoiceChannelEffectSendAnimationType = exports.GatewayDispatchEvents = exports.GatewayIntentBits = exports.GatewayCloseCodes = exports.GatewayOpcodes = exports.GatewayVersion = void 0;
	exports.GatewayVersion = "10";
	/**
	* @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes}
	*/
	var GatewayOpcodes;
	(function(GatewayOpcodes) {
		/**
		* An event was dispatched
		*/
		GatewayOpcodes[GatewayOpcodes["Dispatch"] = 0] = "Dispatch";
		/**
		* A bidirectional opcode to maintain an active gateway connection.
		* Fired periodically by the client, or fired by the gateway to request an immediate heartbeat from the client.
		*/
		GatewayOpcodes[GatewayOpcodes["Heartbeat"] = 1] = "Heartbeat";
		/**
		* Starts a new session during the initial handshake
		*/
		GatewayOpcodes[GatewayOpcodes["Identify"] = 2] = "Identify";
		/**
		* Update the client's presence
		*/
		GatewayOpcodes[GatewayOpcodes["PresenceUpdate"] = 3] = "PresenceUpdate";
		/**
		* Used to join/leave or move between voice channels
		*/
		GatewayOpcodes[GatewayOpcodes["VoiceStateUpdate"] = 4] = "VoiceStateUpdate";
		/**
		* Resume a previous session that was disconnected
		*/
		GatewayOpcodes[GatewayOpcodes["Resume"] = 6] = "Resume";
		/**
		* You should attempt to reconnect and resume immediately
		*/
		GatewayOpcodes[GatewayOpcodes["Reconnect"] = 7] = "Reconnect";
		/**
		* Request information about offline guild members in a large guild
		*/
		GatewayOpcodes[GatewayOpcodes["RequestGuildMembers"] = 8] = "RequestGuildMembers";
		/**
		* The session has been invalidated. You should reconnect and identify/resume accordingly
		*/
		GatewayOpcodes[GatewayOpcodes["InvalidSession"] = 9] = "InvalidSession";
		/**
		* Sent immediately after connecting, contains the `heartbeat_interval` to use
		*/
		GatewayOpcodes[GatewayOpcodes["Hello"] = 10] = "Hello";
		/**
		* Sent in response to receiving a heartbeat to acknowledge that it has been received
		*/
		GatewayOpcodes[GatewayOpcodes["HeartbeatAck"] = 11] = "HeartbeatAck";
		/**
		* Request information about soundboard sounds in a set of guilds
		*/
		GatewayOpcodes[GatewayOpcodes["RequestSoundboardSounds"] = 31] = "RequestSoundboardSounds";
	})(GatewayOpcodes || (exports.GatewayOpcodes = GatewayOpcodes = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes}
	*/
	var GatewayCloseCodes;
	(function(GatewayCloseCodes) {
		/**
		* We're not sure what went wrong. Try reconnecting?
		*/
		GatewayCloseCodes[GatewayCloseCodes["UnknownError"] = 4e3] = "UnknownError";
		/**
		* You sent an invalid Gateway opcode or an invalid payload for an opcode. Don't do that!
		*
		* @see {@link https://discord.com/developers/docs/topics/gateway-events#payload-structure}
		*/
		GatewayCloseCodes[GatewayCloseCodes["UnknownOpcode"] = 4001] = "UnknownOpcode";
		/**
		* You sent an invalid payload to us. Don't do that!
		*
		* @see {@link https://discord.com/developers/docs/topics/gateway#sending-events}
		*/
		GatewayCloseCodes[GatewayCloseCodes["DecodeError"] = 4002] = "DecodeError";
		/**
		* You sent us a payload prior to identifying
		*
		* @see {@link https://discord.com/developers/docs/topics/gateway-events#identify}
		*/
		GatewayCloseCodes[GatewayCloseCodes["NotAuthenticated"] = 4003] = "NotAuthenticated";
		/**
		* The account token sent with your identify payload is incorrect
		*
		* @see {@link https://discord.com/developers/docs/topics/gateway-events#identify}
		*/
		GatewayCloseCodes[GatewayCloseCodes["AuthenticationFailed"] = 4004] = "AuthenticationFailed";
		/**
		* You sent more than one identify payload. Don't do that!
		*/
		GatewayCloseCodes[GatewayCloseCodes["AlreadyAuthenticated"] = 4005] = "AlreadyAuthenticated";
		/**
		* The sequence sent when resuming the session was invalid. Reconnect and start a new session
		*
		* @see {@link https://discord.com/developers/docs/topics/gateway-events#resume}
		*/
		GatewayCloseCodes[GatewayCloseCodes["InvalidSeq"] = 4007] = "InvalidSeq";
		/**
		* Woah nelly! You're sending payloads to us too quickly. Slow it down! You will be disconnected on receiving this
		*/
		GatewayCloseCodes[GatewayCloseCodes["RateLimited"] = 4008] = "RateLimited";
		/**
		* Your session timed out. Reconnect and start a new one
		*/
		GatewayCloseCodes[GatewayCloseCodes["SessionTimedOut"] = 4009] = "SessionTimedOut";
		/**
		* You sent us an invalid shard when identifying
		*
		* @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
		*/
		GatewayCloseCodes[GatewayCloseCodes["InvalidShard"] = 4010] = "InvalidShard";
		/**
		* The session would have handled too many guilds - you are required to shard your connection in order to connect
		*
		* @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
		*/
		GatewayCloseCodes[GatewayCloseCodes["ShardingRequired"] = 4011] = "ShardingRequired";
		/**
		* You sent an invalid version for the gateway
		*/
		GatewayCloseCodes[GatewayCloseCodes["InvalidAPIVersion"] = 4012] = "InvalidAPIVersion";
		/**
		* You sent an invalid intent for a Gateway Intent. You may have incorrectly calculated the bitwise value
		*
		* @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
		*/
		GatewayCloseCodes[GatewayCloseCodes["InvalidIntents"] = 4013] = "InvalidIntents";
		/**
		* You sent a disallowed intent for a Gateway Intent. You may have tried to specify an intent that you have not
		* enabled or are not whitelisted for
		*
		* @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
		* @see {@link https://discord.com/developers/docs/topics/gateway#privileged-intents}
		*/
		GatewayCloseCodes[GatewayCloseCodes["DisallowedIntents"] = 4014] = "DisallowedIntents";
	})(GatewayCloseCodes || (exports.GatewayCloseCodes = GatewayCloseCodes = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/gateway#list-of-intents}
	*/
	var GatewayIntentBits;
	(function(GatewayIntentBits) {
		GatewayIntentBits[GatewayIntentBits["Guilds"] = 1] = "Guilds";
		GatewayIntentBits[GatewayIntentBits["GuildMembers"] = 2] = "GuildMembers";
		GatewayIntentBits[GatewayIntentBits["GuildModeration"] = 4] = "GuildModeration";
		/**
		* @deprecated This is the old name for {@link GatewayIntentBits.GuildModeration}
		*/
		GatewayIntentBits[GatewayIntentBits["GuildBans"] = 4] = "GuildBans";
		GatewayIntentBits[GatewayIntentBits["GuildExpressions"] = 8] = "GuildExpressions";
		/**
		* @deprecated This is the old name for {@link GatewayIntentBits.GuildExpressions}
		*/
		GatewayIntentBits[GatewayIntentBits["GuildEmojisAndStickers"] = 8] = "GuildEmojisAndStickers";
		GatewayIntentBits[GatewayIntentBits["GuildIntegrations"] = 16] = "GuildIntegrations";
		GatewayIntentBits[GatewayIntentBits["GuildWebhooks"] = 32] = "GuildWebhooks";
		GatewayIntentBits[GatewayIntentBits["GuildInvites"] = 64] = "GuildInvites";
		GatewayIntentBits[GatewayIntentBits["GuildVoiceStates"] = 128] = "GuildVoiceStates";
		GatewayIntentBits[GatewayIntentBits["GuildPresences"] = 256] = "GuildPresences";
		GatewayIntentBits[GatewayIntentBits["GuildMessages"] = 512] = "GuildMessages";
		GatewayIntentBits[GatewayIntentBits["GuildMessageReactions"] = 1024] = "GuildMessageReactions";
		GatewayIntentBits[GatewayIntentBits["GuildMessageTyping"] = 2048] = "GuildMessageTyping";
		GatewayIntentBits[GatewayIntentBits["DirectMessages"] = 4096] = "DirectMessages";
		GatewayIntentBits[GatewayIntentBits["DirectMessageReactions"] = 8192] = "DirectMessageReactions";
		GatewayIntentBits[GatewayIntentBits["DirectMessageTyping"] = 16384] = "DirectMessageTyping";
		GatewayIntentBits[GatewayIntentBits["MessageContent"] = 32768] = "MessageContent";
		GatewayIntentBits[GatewayIntentBits["GuildScheduledEvents"] = 65536] = "GuildScheduledEvents";
		GatewayIntentBits[GatewayIntentBits["AutoModerationConfiguration"] = 1048576] = "AutoModerationConfiguration";
		GatewayIntentBits[GatewayIntentBits["AutoModerationExecution"] = 2097152] = "AutoModerationExecution";
		GatewayIntentBits[GatewayIntentBits["GuildMessagePolls"] = 16777216] = "GuildMessagePolls";
		GatewayIntentBits[GatewayIntentBits["DirectMessagePolls"] = 33554432] = "DirectMessagePolls";
	})(GatewayIntentBits || (exports.GatewayIntentBits = GatewayIntentBits = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/gateway-events#receive-events}
	*/
	var GatewayDispatchEvents;
	(function(GatewayDispatchEvents) {
		GatewayDispatchEvents["ApplicationCommandPermissionsUpdate"] = "APPLICATION_COMMAND_PERMISSIONS_UPDATE";
		GatewayDispatchEvents["AutoModerationActionExecution"] = "AUTO_MODERATION_ACTION_EXECUTION";
		GatewayDispatchEvents["AutoModerationRuleCreate"] = "AUTO_MODERATION_RULE_CREATE";
		GatewayDispatchEvents["AutoModerationRuleDelete"] = "AUTO_MODERATION_RULE_DELETE";
		GatewayDispatchEvents["AutoModerationRuleUpdate"] = "AUTO_MODERATION_RULE_UPDATE";
		GatewayDispatchEvents["ChannelCreate"] = "CHANNEL_CREATE";
		GatewayDispatchEvents["ChannelDelete"] = "CHANNEL_DELETE";
		GatewayDispatchEvents["ChannelPinsUpdate"] = "CHANNEL_PINS_UPDATE";
		GatewayDispatchEvents["ChannelUpdate"] = "CHANNEL_UPDATE";
		GatewayDispatchEvents["EntitlementCreate"] = "ENTITLEMENT_CREATE";
		GatewayDispatchEvents["EntitlementDelete"] = "ENTITLEMENT_DELETE";
		GatewayDispatchEvents["EntitlementUpdate"] = "ENTITLEMENT_UPDATE";
		GatewayDispatchEvents["GuildAuditLogEntryCreate"] = "GUILD_AUDIT_LOG_ENTRY_CREATE";
		GatewayDispatchEvents["GuildBanAdd"] = "GUILD_BAN_ADD";
		GatewayDispatchEvents["GuildBanRemove"] = "GUILD_BAN_REMOVE";
		GatewayDispatchEvents["GuildCreate"] = "GUILD_CREATE";
		GatewayDispatchEvents["GuildDelete"] = "GUILD_DELETE";
		GatewayDispatchEvents["GuildEmojisUpdate"] = "GUILD_EMOJIS_UPDATE";
		GatewayDispatchEvents["GuildIntegrationsUpdate"] = "GUILD_INTEGRATIONS_UPDATE";
		GatewayDispatchEvents["GuildMemberAdd"] = "GUILD_MEMBER_ADD";
		GatewayDispatchEvents["GuildMemberRemove"] = "GUILD_MEMBER_REMOVE";
		GatewayDispatchEvents["GuildMembersChunk"] = "GUILD_MEMBERS_CHUNK";
		GatewayDispatchEvents["GuildMemberUpdate"] = "GUILD_MEMBER_UPDATE";
		GatewayDispatchEvents["GuildRoleCreate"] = "GUILD_ROLE_CREATE";
		GatewayDispatchEvents["GuildRoleDelete"] = "GUILD_ROLE_DELETE";
		GatewayDispatchEvents["GuildRoleUpdate"] = "GUILD_ROLE_UPDATE";
		GatewayDispatchEvents["GuildScheduledEventCreate"] = "GUILD_SCHEDULED_EVENT_CREATE";
		GatewayDispatchEvents["GuildScheduledEventDelete"] = "GUILD_SCHEDULED_EVENT_DELETE";
		GatewayDispatchEvents["GuildScheduledEventUpdate"] = "GUILD_SCHEDULED_EVENT_UPDATE";
		GatewayDispatchEvents["GuildScheduledEventUserAdd"] = "GUILD_SCHEDULED_EVENT_USER_ADD";
		GatewayDispatchEvents["GuildScheduledEventUserRemove"] = "GUILD_SCHEDULED_EVENT_USER_REMOVE";
		GatewayDispatchEvents["GuildSoundboardSoundCreate"] = "GUILD_SOUNDBOARD_SOUND_CREATE";
		GatewayDispatchEvents["GuildSoundboardSoundDelete"] = "GUILD_SOUNDBOARD_SOUND_DELETE";
		GatewayDispatchEvents["GuildSoundboardSoundsUpdate"] = "GUILD_SOUNDBOARD_SOUNDS_UPDATE";
		GatewayDispatchEvents["GuildSoundboardSoundUpdate"] = "GUILD_SOUNDBOARD_SOUND_UPDATE";
		GatewayDispatchEvents["SoundboardSounds"] = "SOUNDBOARD_SOUNDS";
		GatewayDispatchEvents["GuildStickersUpdate"] = "GUILD_STICKERS_UPDATE";
		GatewayDispatchEvents["GuildUpdate"] = "GUILD_UPDATE";
		GatewayDispatchEvents["IntegrationCreate"] = "INTEGRATION_CREATE";
		GatewayDispatchEvents["IntegrationDelete"] = "INTEGRATION_DELETE";
		GatewayDispatchEvents["IntegrationUpdate"] = "INTEGRATION_UPDATE";
		GatewayDispatchEvents["InteractionCreate"] = "INTERACTION_CREATE";
		GatewayDispatchEvents["InviteCreate"] = "INVITE_CREATE";
		GatewayDispatchEvents["InviteDelete"] = "INVITE_DELETE";
		GatewayDispatchEvents["MessageCreate"] = "MESSAGE_CREATE";
		GatewayDispatchEvents["MessageDelete"] = "MESSAGE_DELETE";
		GatewayDispatchEvents["MessageDeleteBulk"] = "MESSAGE_DELETE_BULK";
		GatewayDispatchEvents["MessagePollVoteAdd"] = "MESSAGE_POLL_VOTE_ADD";
		GatewayDispatchEvents["MessagePollVoteRemove"] = "MESSAGE_POLL_VOTE_REMOVE";
		GatewayDispatchEvents["MessageReactionAdd"] = "MESSAGE_REACTION_ADD";
		GatewayDispatchEvents["MessageReactionRemove"] = "MESSAGE_REACTION_REMOVE";
		GatewayDispatchEvents["MessageReactionRemoveAll"] = "MESSAGE_REACTION_REMOVE_ALL";
		GatewayDispatchEvents["MessageReactionRemoveEmoji"] = "MESSAGE_REACTION_REMOVE_EMOJI";
		GatewayDispatchEvents["MessageUpdate"] = "MESSAGE_UPDATE";
		GatewayDispatchEvents["PresenceUpdate"] = "PRESENCE_UPDATE";
		GatewayDispatchEvents["RateLimited"] = "RATE_LIMITED";
		GatewayDispatchEvents["Ready"] = "READY";
		GatewayDispatchEvents["Resumed"] = "RESUMED";
		GatewayDispatchEvents["StageInstanceCreate"] = "STAGE_INSTANCE_CREATE";
		GatewayDispatchEvents["StageInstanceDelete"] = "STAGE_INSTANCE_DELETE";
		GatewayDispatchEvents["StageInstanceUpdate"] = "STAGE_INSTANCE_UPDATE";
		GatewayDispatchEvents["SubscriptionCreate"] = "SUBSCRIPTION_CREATE";
		GatewayDispatchEvents["SubscriptionDelete"] = "SUBSCRIPTION_DELETE";
		GatewayDispatchEvents["SubscriptionUpdate"] = "SUBSCRIPTION_UPDATE";
		GatewayDispatchEvents["ThreadCreate"] = "THREAD_CREATE";
		GatewayDispatchEvents["ThreadDelete"] = "THREAD_DELETE";
		GatewayDispatchEvents["ThreadListSync"] = "THREAD_LIST_SYNC";
		GatewayDispatchEvents["ThreadMembersUpdate"] = "THREAD_MEMBERS_UPDATE";
		GatewayDispatchEvents["ThreadMemberUpdate"] = "THREAD_MEMBER_UPDATE";
		GatewayDispatchEvents["ThreadUpdate"] = "THREAD_UPDATE";
		GatewayDispatchEvents["TypingStart"] = "TYPING_START";
		GatewayDispatchEvents["UserUpdate"] = "USER_UPDATE";
		GatewayDispatchEvents["VoiceChannelEffectSend"] = "VOICE_CHANNEL_EFFECT_SEND";
		GatewayDispatchEvents["VoiceServerUpdate"] = "VOICE_SERVER_UPDATE";
		GatewayDispatchEvents["VoiceStateUpdate"] = "VOICE_STATE_UPDATE";
		GatewayDispatchEvents["WebhooksUpdate"] = "WEBHOOKS_UPDATE";
	})(GatewayDispatchEvents || (exports.GatewayDispatchEvents = GatewayDispatchEvents = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/gateway-events#voice-channel-effect-send-animation-types}
	*/
	var VoiceChannelEffectSendAnimationType;
	(function(VoiceChannelEffectSendAnimationType) {
		/**
		* A fun animation, sent by a Nitro subscriber
		*/
		VoiceChannelEffectSendAnimationType[VoiceChannelEffectSendAnimationType["Premium"] = 0] = "Premium";
		/**
		* The standard animation
		*/
		VoiceChannelEffectSendAnimationType[VoiceChannelEffectSendAnimationType["Basic"] = 1] = "Basic";
	})(VoiceChannelEffectSendAnimationType || (exports.VoiceChannelEffectSendAnimationType = VoiceChannelEffectSendAnimationType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/globals.js
var require_globals = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FormattingPatterns = void 0;
	const timestampStyles = "DFRSTdfst";
	const timestampLength = 13;
	/**
	* @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
	*/
	exports.FormattingPatterns = {
		User: /<@(?<id>\d{17,20})>/,
		UserWithNickname: /<@!(?<id>\d{17,20})>/,
		UserWithOptionalNickname: /<@!?(?<id>\d{17,20})>/,
		Channel: /<#(?<id>\d{17,20})>/,
		Role: /<@&(?<id>\d{17,20})>/,
		SlashCommand: /<\/(?<fullName>(?<name>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32})(?: (?<subcommandOrGroup>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32}))?(?: (?<subcommand>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32}))?):(?<id>\d{17,20})>/u,
		Emoji: /<(?<animated>a)?:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
		AnimatedEmoji: /<(?<animated>a):(?<name>\w{2,32}):(?<id>\d{17,20})>/,
		StaticEmoji: /<:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
		Timestamp: new RegExp(`<t:(?<timestamp>-?\\d{1,${timestampLength}})(:(?<style>[${timestampStyles}]))?>`),
		DefaultStyledTimestamp: new RegExp(`<t:(?<timestamp>-?\\d{1,${timestampLength}})>`),
		StyledTimestamp: new RegExp(`<t:(?<timestamp>-?\\d{1,${timestampLength}}):(?<style>[${timestampStyles}])>`),
		GuildNavigation: /<id:(?<type>customize|browse|guide|linked-roles)>/,
		LinkedRole: /<id:linked-roles:(?<id>\d{17,20})>/
	};
	/**
	* Freezes the formatting patterns
	*
	* @internal
	*/
	Object.freeze(exports.FormattingPatterns);
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/common.js
var require_common$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PermissionFlagsBits = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags}
	*
	* These flags are exported as `BigInt`s and NOT numbers. Wrapping them in `Number()`
	* may cause issues, try to use BigInts as much as possible or modules that can
	* replicate them in some way
	*/
	exports.PermissionFlagsBits = {
		CreateInstantInvite: 1n << 0n,
		KickMembers: 1n << 1n,
		BanMembers: 1n << 2n,
		Administrator: 1n << 3n,
		ManageChannels: 1n << 4n,
		ManageGuild: 1n << 5n,
		AddReactions: 1n << 6n,
		ViewAuditLog: 1n << 7n,
		PrioritySpeaker: 1n << 8n,
		Stream: 1n << 9n,
		ViewChannel: 1n << 10n,
		SendMessages: 1n << 11n,
		SendTTSMessages: 1n << 12n,
		ManageMessages: 1n << 13n,
		EmbedLinks: 1n << 14n,
		AttachFiles: 1n << 15n,
		ReadMessageHistory: 1n << 16n,
		MentionEveryone: 1n << 17n,
		UseExternalEmojis: 1n << 18n,
		ViewGuildInsights: 1n << 19n,
		Connect: 1n << 20n,
		Speak: 1n << 21n,
		MuteMembers: 1n << 22n,
		DeafenMembers: 1n << 23n,
		MoveMembers: 1n << 24n,
		UseVAD: 1n << 25n,
		ChangeNickname: 1n << 26n,
		ManageNicknames: 1n << 27n,
		ManageRoles: 1n << 28n,
		ManageWebhooks: 1n << 29n,
		ManageEmojisAndStickers: 1n << 30n,
		ManageGuildExpressions: 1n << 30n,
		UseApplicationCommands: 1n << 31n,
		RequestToSpeak: 1n << 32n,
		ManageEvents: 1n << 33n,
		ManageThreads: 1n << 34n,
		CreatePublicThreads: 1n << 35n,
		CreatePrivateThreads: 1n << 36n,
		UseExternalStickers: 1n << 37n,
		SendMessagesInThreads: 1n << 38n,
		UseEmbeddedActivities: 1n << 39n,
		ModerateMembers: 1n << 40n,
		ViewCreatorMonetizationAnalytics: 1n << 41n,
		UseSoundboard: 1n << 42n,
		CreateGuildExpressions: 1n << 43n,
		CreateEvents: 1n << 44n,
		UseExternalSounds: 1n << 45n,
		SendVoiceMessages: 1n << 46n,
		SendPolls: 1n << 49n,
		UseExternalApps: 1n << 50n,
		PinMessages: 1n << 51n,
		BypassSlowmode: 1n << 52n
	};
	/**
	* Freeze the object of bits, preventing any modifications to it
	*
	* @internal
	*/
	Object.freeze(exports.PermissionFlagsBits);
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/application.js
var require_application = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/application
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ApplicationWebhookEventStatus = exports.ApplicationRoleConnectionMetadataType = exports.ApplicationFlags = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/application#application-object-application-flags}
	*/
	var ApplicationFlags;
	(function(ApplicationFlags) {
		/**
		* @unstable This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ApplicationFlags[ApplicationFlags["EmbeddedReleased"] = 2] = "EmbeddedReleased";
		/**
		* @unstable This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ApplicationFlags[ApplicationFlags["ManagedEmoji"] = 4] = "ManagedEmoji";
		/**
		* @unstable This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ApplicationFlags[ApplicationFlags["EmbeddedIAP"] = 8] = "EmbeddedIAP";
		/**
		* @unstable This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ApplicationFlags[ApplicationFlags["GroupDMCreate"] = 16] = "GroupDMCreate";
		/**
		* Indicates if an app uses the Auto Moderation API
		*/
		ApplicationFlags[ApplicationFlags["ApplicationAutoModerationRuleCreateBadge"] = 64] = "ApplicationAutoModerationRuleCreateBadge";
		/**
		* @unstable This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ApplicationFlags[ApplicationFlags["RPCHasConnected"] = 2048] = "RPCHasConnected";
		/**
		* Intent required for bots in 100 or more servers to receive `presence_update` events
		*/
		ApplicationFlags[ApplicationFlags["GatewayPresence"] = 4096] = "GatewayPresence";
		/**
		* Intent required for bots in under 100 servers to receive `presence_update` events, found in Bot Settings
		*/
		ApplicationFlags[ApplicationFlags["GatewayPresenceLimited"] = 8192] = "GatewayPresenceLimited";
		/**
		* Intent required for bots in 100 or more servers to receive member-related events like `guild_member_add`.
		*
		* @see List of member-related events {@link https://discord.com/developers/docs/topics/gateway#list-of-intents | under `GUILD_MEMBERS`}
		*/
		ApplicationFlags[ApplicationFlags["GatewayGuildMembers"] = 16384] = "GatewayGuildMembers";
		/**
		* Intent required for bots in under 100 servers to receive member-related events like `guild_member_add`, found in Bot Settings.
		*
		* @see List of member-related events {@link https://discord.com/developers/docs/topics/gateway#list-of-intents | under `GUILD_MEMBERS`}
		*/
		ApplicationFlags[ApplicationFlags["GatewayGuildMembersLimited"] = 32768] = "GatewayGuildMembersLimited";
		/**
		* Indicates unusual growth of an app that prevents verification
		*/
		ApplicationFlags[ApplicationFlags["VerificationPendingGuildLimit"] = 65536] = "VerificationPendingGuildLimit";
		/**
		* Indicates if an app is embedded within the Discord client (currently unavailable publicly)
		*/
		ApplicationFlags[ApplicationFlags["Embedded"] = 131072] = "Embedded";
		/**
		* Intent required for bots in 100 or more servers to receive {@link https://support-dev.discord.com/hc/articles/6207308062871 | message content}
		*/
		ApplicationFlags[ApplicationFlags["GatewayMessageContent"] = 262144] = "GatewayMessageContent";
		/**
		* Intent required for bots in under 100 servers to receive {@link https://support-dev.discord.com/hc/articles/6207308062871 | message content},
		* found in Bot Settings
		*/
		ApplicationFlags[ApplicationFlags["GatewayMessageContentLimited"] = 524288] = "GatewayMessageContentLimited";
		/**
		* @unstable This application flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ApplicationFlags[ApplicationFlags["EmbeddedFirstParty"] = 1048576] = "EmbeddedFirstParty";
		/**
		* Indicates if an app has registered global {@link https://discord.com/developers/docs/interactions/application-commands | application commands}
		*/
		ApplicationFlags[ApplicationFlags["ApplicationCommandBadge"] = 8388608] = "ApplicationCommandBadge";
	})(ApplicationFlags || (exports.ApplicationFlags = ApplicationFlags = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-type}
	*/
	var ApplicationRoleConnectionMetadataType;
	(function(ApplicationRoleConnectionMetadataType) {
		/**
		* The metadata value (`integer`) is less than or equal to the guild's configured value (`integer`)
		*/
		ApplicationRoleConnectionMetadataType[ApplicationRoleConnectionMetadataType["IntegerLessThanOrEqual"] = 1] = "IntegerLessThanOrEqual";
		/**
		* The metadata value (`integer`) is greater than or equal to the guild's configured value (`integer`)
		*/
		ApplicationRoleConnectionMetadataType[ApplicationRoleConnectionMetadataType["IntegerGreaterThanOrEqual"] = 2] = "IntegerGreaterThanOrEqual";
		/**
		* The metadata value (`integer`) is equal to the guild's configured value (`integer`)
		*/
		ApplicationRoleConnectionMetadataType[ApplicationRoleConnectionMetadataType["IntegerEqual"] = 3] = "IntegerEqual";
		/**
		* The metadata value (`integer`) is not equal to the guild's configured value (`integer`)
		*/
		ApplicationRoleConnectionMetadataType[ApplicationRoleConnectionMetadataType["IntegerNotEqual"] = 4] = "IntegerNotEqual";
		/**
		* The metadata value (`ISO8601 string`) is less than or equal to the guild's configured value (`integer`; days before current date)
		*/
		ApplicationRoleConnectionMetadataType[ApplicationRoleConnectionMetadataType["DatetimeLessThanOrEqual"] = 5] = "DatetimeLessThanOrEqual";
		/**
		* The metadata value (`ISO8601 string`) is greater than or equal to the guild's configured value (`integer`; days before current date)
		*/
		ApplicationRoleConnectionMetadataType[ApplicationRoleConnectionMetadataType["DatetimeGreaterThanOrEqual"] = 6] = "DatetimeGreaterThanOrEqual";
		/**
		* The metadata value (`integer`) is equal to the guild's configured value (`integer`; `1`)
		*/
		ApplicationRoleConnectionMetadataType[ApplicationRoleConnectionMetadataType["BooleanEqual"] = 7] = "BooleanEqual";
		/**
		* The metadata value (`integer`) is not equal to the guild's configured value (`integer`; `1`)
		*/
		ApplicationRoleConnectionMetadataType[ApplicationRoleConnectionMetadataType["BooleanNotEqual"] = 8] = "BooleanNotEqual";
	})(ApplicationRoleConnectionMetadataType || (exports.ApplicationRoleConnectionMetadataType = ApplicationRoleConnectionMetadataType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/application#application-object-application-event-webhook-status}
	*/
	var ApplicationWebhookEventStatus;
	(function(ApplicationWebhookEventStatus) {
		/**
		* Webhook events are disabled by developer
		*/
		ApplicationWebhookEventStatus[ApplicationWebhookEventStatus["Disabled"] = 1] = "Disabled";
		/**
		* Webhook events are enabled by developer
		*/
		ApplicationWebhookEventStatus[ApplicationWebhookEventStatus["Enabled"] = 2] = "Enabled";
		/**
		* Webhook events are disabled by Discord, usually due to inactivity
		*/
		ApplicationWebhookEventStatus[ApplicationWebhookEventStatus["DisabledByDiscord"] = 3] = "DisabledByDiscord";
	})(ApplicationWebhookEventStatus || (exports.ApplicationWebhookEventStatus = ApplicationWebhookEventStatus = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/auditLog.js
var require_auditLog = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/audit-log
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AuditLogOptionsType = exports.AuditLogEvent = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events}
	*/
	var AuditLogEvent;
	(function(AuditLogEvent) {
		AuditLogEvent[AuditLogEvent["GuildUpdate"] = 1] = "GuildUpdate";
		AuditLogEvent[AuditLogEvent["ChannelCreate"] = 10] = "ChannelCreate";
		AuditLogEvent[AuditLogEvent["ChannelUpdate"] = 11] = "ChannelUpdate";
		AuditLogEvent[AuditLogEvent["ChannelDelete"] = 12] = "ChannelDelete";
		AuditLogEvent[AuditLogEvent["ChannelOverwriteCreate"] = 13] = "ChannelOverwriteCreate";
		AuditLogEvent[AuditLogEvent["ChannelOverwriteUpdate"] = 14] = "ChannelOverwriteUpdate";
		AuditLogEvent[AuditLogEvent["ChannelOverwriteDelete"] = 15] = "ChannelOverwriteDelete";
		AuditLogEvent[AuditLogEvent["MemberKick"] = 20] = "MemberKick";
		AuditLogEvent[AuditLogEvent["MemberPrune"] = 21] = "MemberPrune";
		AuditLogEvent[AuditLogEvent["MemberBanAdd"] = 22] = "MemberBanAdd";
		AuditLogEvent[AuditLogEvent["MemberBanRemove"] = 23] = "MemberBanRemove";
		AuditLogEvent[AuditLogEvent["MemberUpdate"] = 24] = "MemberUpdate";
		AuditLogEvent[AuditLogEvent["MemberRoleUpdate"] = 25] = "MemberRoleUpdate";
		AuditLogEvent[AuditLogEvent["MemberMove"] = 26] = "MemberMove";
		AuditLogEvent[AuditLogEvent["MemberDisconnect"] = 27] = "MemberDisconnect";
		AuditLogEvent[AuditLogEvent["BotAdd"] = 28] = "BotAdd";
		AuditLogEvent[AuditLogEvent["RoleCreate"] = 30] = "RoleCreate";
		AuditLogEvent[AuditLogEvent["RoleUpdate"] = 31] = "RoleUpdate";
		AuditLogEvent[AuditLogEvent["RoleDelete"] = 32] = "RoleDelete";
		AuditLogEvent[AuditLogEvent["InviteCreate"] = 40] = "InviteCreate";
		AuditLogEvent[AuditLogEvent["InviteUpdate"] = 41] = "InviteUpdate";
		AuditLogEvent[AuditLogEvent["InviteDelete"] = 42] = "InviteDelete";
		AuditLogEvent[AuditLogEvent["WebhookCreate"] = 50] = "WebhookCreate";
		AuditLogEvent[AuditLogEvent["WebhookUpdate"] = 51] = "WebhookUpdate";
		AuditLogEvent[AuditLogEvent["WebhookDelete"] = 52] = "WebhookDelete";
		AuditLogEvent[AuditLogEvent["EmojiCreate"] = 60] = "EmojiCreate";
		AuditLogEvent[AuditLogEvent["EmojiUpdate"] = 61] = "EmojiUpdate";
		AuditLogEvent[AuditLogEvent["EmojiDelete"] = 62] = "EmojiDelete";
		AuditLogEvent[AuditLogEvent["MessageDelete"] = 72] = "MessageDelete";
		AuditLogEvent[AuditLogEvent["MessageBulkDelete"] = 73] = "MessageBulkDelete";
		AuditLogEvent[AuditLogEvent["MessagePin"] = 74] = "MessagePin";
		AuditLogEvent[AuditLogEvent["MessageUnpin"] = 75] = "MessageUnpin";
		AuditLogEvent[AuditLogEvent["IntegrationCreate"] = 80] = "IntegrationCreate";
		AuditLogEvent[AuditLogEvent["IntegrationUpdate"] = 81] = "IntegrationUpdate";
		AuditLogEvent[AuditLogEvent["IntegrationDelete"] = 82] = "IntegrationDelete";
		AuditLogEvent[AuditLogEvent["StageInstanceCreate"] = 83] = "StageInstanceCreate";
		AuditLogEvent[AuditLogEvent["StageInstanceUpdate"] = 84] = "StageInstanceUpdate";
		AuditLogEvent[AuditLogEvent["StageInstanceDelete"] = 85] = "StageInstanceDelete";
		AuditLogEvent[AuditLogEvent["StickerCreate"] = 90] = "StickerCreate";
		AuditLogEvent[AuditLogEvent["StickerUpdate"] = 91] = "StickerUpdate";
		AuditLogEvent[AuditLogEvent["StickerDelete"] = 92] = "StickerDelete";
		AuditLogEvent[AuditLogEvent["GuildScheduledEventCreate"] = 100] = "GuildScheduledEventCreate";
		AuditLogEvent[AuditLogEvent["GuildScheduledEventUpdate"] = 101] = "GuildScheduledEventUpdate";
		AuditLogEvent[AuditLogEvent["GuildScheduledEventDelete"] = 102] = "GuildScheduledEventDelete";
		AuditLogEvent[AuditLogEvent["ThreadCreate"] = 110] = "ThreadCreate";
		AuditLogEvent[AuditLogEvent["ThreadUpdate"] = 111] = "ThreadUpdate";
		AuditLogEvent[AuditLogEvent["ThreadDelete"] = 112] = "ThreadDelete";
		AuditLogEvent[AuditLogEvent["ApplicationCommandPermissionUpdate"] = 121] = "ApplicationCommandPermissionUpdate";
		AuditLogEvent[AuditLogEvent["SoundboardSoundCreate"] = 130] = "SoundboardSoundCreate";
		AuditLogEvent[AuditLogEvent["SoundboardSoundUpdate"] = 131] = "SoundboardSoundUpdate";
		AuditLogEvent[AuditLogEvent["SoundboardSoundDelete"] = 132] = "SoundboardSoundDelete";
		AuditLogEvent[AuditLogEvent["AutoModerationRuleCreate"] = 140] = "AutoModerationRuleCreate";
		AuditLogEvent[AuditLogEvent["AutoModerationRuleUpdate"] = 141] = "AutoModerationRuleUpdate";
		AuditLogEvent[AuditLogEvent["AutoModerationRuleDelete"] = 142] = "AutoModerationRuleDelete";
		AuditLogEvent[AuditLogEvent["AutoModerationBlockMessage"] = 143] = "AutoModerationBlockMessage";
		AuditLogEvent[AuditLogEvent["AutoModerationFlagToChannel"] = 144] = "AutoModerationFlagToChannel";
		AuditLogEvent[AuditLogEvent["AutoModerationUserCommunicationDisabled"] = 145] = "AutoModerationUserCommunicationDisabled";
		AuditLogEvent[AuditLogEvent["AutoModerationQuarantineUser"] = 146] = "AutoModerationQuarantineUser";
		AuditLogEvent[AuditLogEvent["CreatorMonetizationRequestCreated"] = 150] = "CreatorMonetizationRequestCreated";
		AuditLogEvent[AuditLogEvent["CreatorMonetizationTermsAccepted"] = 151] = "CreatorMonetizationTermsAccepted";
		AuditLogEvent[AuditLogEvent["OnboardingPromptCreate"] = 163] = "OnboardingPromptCreate";
		AuditLogEvent[AuditLogEvent["OnboardingPromptUpdate"] = 164] = "OnboardingPromptUpdate";
		AuditLogEvent[AuditLogEvent["OnboardingPromptDelete"] = 165] = "OnboardingPromptDelete";
		AuditLogEvent[AuditLogEvent["OnboardingCreate"] = 166] = "OnboardingCreate";
		AuditLogEvent[AuditLogEvent["OnboardingUpdate"] = 167] = "OnboardingUpdate";
		AuditLogEvent[AuditLogEvent["HomeSettingsCreate"] = 190] = "HomeSettingsCreate";
		AuditLogEvent[AuditLogEvent["HomeSettingsUpdate"] = 191] = "HomeSettingsUpdate";
	})(AuditLogEvent || (exports.AuditLogEvent = AuditLogEvent = {}));
	var AuditLogOptionsType;
	(function(AuditLogOptionsType) {
		AuditLogOptionsType["Role"] = "0";
		AuditLogOptionsType["Member"] = "1";
	})(AuditLogOptionsType || (exports.AuditLogOptionsType = AuditLogOptionsType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/autoModeration.js
var require_autoModeration = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/auto-moderation
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AutoModerationActionType = exports.AutoModerationRuleEventType = exports.AutoModerationRuleKeywordPresetType = exports.AutoModerationRuleTriggerType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
	*/
	var AutoModerationRuleTriggerType;
	(function(AutoModerationRuleTriggerType) {
		/**
		* Check if content contains words from a user defined list of keywords (Maximum of 6 per guild)
		*/
		AutoModerationRuleTriggerType[AutoModerationRuleTriggerType["Keyword"] = 1] = "Keyword";
		/**
		* Check if content represents generic spam (Maximum of 1 per guild)
		*/
		AutoModerationRuleTriggerType[AutoModerationRuleTriggerType["Spam"] = 3] = "Spam";
		/**
		* Check if content contains words from internal pre-defined wordsets (Maximum of 1 per guild)
		*/
		AutoModerationRuleTriggerType[AutoModerationRuleTriggerType["KeywordPreset"] = 4] = "KeywordPreset";
		/**
		* Check if content contains more mentions than allowed (Maximum of 1 per guild)
		*/
		AutoModerationRuleTriggerType[AutoModerationRuleTriggerType["MentionSpam"] = 5] = "MentionSpam";
		/**
		* Check if member profile contains words from a user defined list of keywords (Maximum of 1 per guild)
		*/
		AutoModerationRuleTriggerType[AutoModerationRuleTriggerType["MemberProfile"] = 6] = "MemberProfile";
	})(AutoModerationRuleTriggerType || (exports.AutoModerationRuleTriggerType = AutoModerationRuleTriggerType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-preset-types}
	*/
	var AutoModerationRuleKeywordPresetType;
	(function(AutoModerationRuleKeywordPresetType) {
		/**
		* Words that may be considered forms of swearing or cursing
		*/
		AutoModerationRuleKeywordPresetType[AutoModerationRuleKeywordPresetType["Profanity"] = 1] = "Profanity";
		/**
		* Words that refer to sexually explicit behavior or activity
		*/
		AutoModerationRuleKeywordPresetType[AutoModerationRuleKeywordPresetType["SexualContent"] = 2] = "SexualContent";
		/**
		* Personal insults or words that may be considered hate speech
		*/
		AutoModerationRuleKeywordPresetType[AutoModerationRuleKeywordPresetType["Slurs"] = 3] = "Slurs";
	})(AutoModerationRuleKeywordPresetType || (exports.AutoModerationRuleKeywordPresetType = AutoModerationRuleKeywordPresetType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types}
	*/
	var AutoModerationRuleEventType;
	(function(AutoModerationRuleEventType) {
		/**
		* When a member sends or edits a message in the guild
		*/
		AutoModerationRuleEventType[AutoModerationRuleEventType["MessageSend"] = 1] = "MessageSend";
		/**
		* When a member edits their profile
		*/
		AutoModerationRuleEventType[AutoModerationRuleEventType["MemberUpdate"] = 2] = "MemberUpdate";
	})(AutoModerationRuleEventType || (exports.AutoModerationRuleEventType = AutoModerationRuleEventType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-types}
	*/
	var AutoModerationActionType;
	(function(AutoModerationActionType) {
		/**
		* Blocks a member's message and prevents it from being posted.
		* A custom explanation can be specified and shown to members whenever their message is blocked
		*/
		AutoModerationActionType[AutoModerationActionType["BlockMessage"] = 1] = "BlockMessage";
		/**
		* Logs user content to a specified channel
		*/
		AutoModerationActionType[AutoModerationActionType["SendAlertMessage"] = 2] = "SendAlertMessage";
		/**
		* Timeout user for specified duration, this action type can be set if the bot has `MODERATE_MEMBERS` permission
		*/
		AutoModerationActionType[AutoModerationActionType["Timeout"] = 3] = "Timeout";
		/**
		* Prevents a member from using text, voice, or other interactions
		*/
		AutoModerationActionType[AutoModerationActionType["BlockMemberInteraction"] = 4] = "BlockMemberInteraction";
	})(AutoModerationActionType || (exports.AutoModerationActionType = AutoModerationActionType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/channel.js
var require_channel$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/channel
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ChannelFlags = exports.ThreadMemberFlags = exports.ThreadAutoArchiveDuration = exports.OverwriteType = exports.VideoQualityMode = exports.ChannelType = exports.ForumLayoutType = exports.SortOrderType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/channel/#channel-object-sort-order-types}
	*/
	var SortOrderType;
	(function(SortOrderType) {
		/**
		* Sort forum posts by activity
		*/
		SortOrderType[SortOrderType["LatestActivity"] = 0] = "LatestActivity";
		/**
		* Sort forum posts by creation time (from most recent to oldest)
		*/
		SortOrderType[SortOrderType["CreationDate"] = 1] = "CreationDate";
	})(SortOrderType || (exports.SortOrderType = SortOrderType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/channel/#channel-object-forum-layout-types}
	*/
	var ForumLayoutType;
	(function(ForumLayoutType) {
		/**
		* No default has been set for forum channel
		*/
		ForumLayoutType[ForumLayoutType["NotSet"] = 0] = "NotSet";
		/**
		* Display posts as a list
		*/
		ForumLayoutType[ForumLayoutType["ListView"] = 1] = "ListView";
		/**
		* Display posts as a collection of tiles
		*/
		ForumLayoutType[ForumLayoutType["GalleryView"] = 2] = "GalleryView";
	})(ForumLayoutType || (exports.ForumLayoutType = ForumLayoutType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
	*/
	var ChannelType;
	(function(ChannelType) {
		/**
		* A text channel within a guild
		*/
		ChannelType[ChannelType["GuildText"] = 0] = "GuildText";
		/**
		* A direct message between users
		*/
		ChannelType[ChannelType["DM"] = 1] = "DM";
		/**
		* A voice channel within a guild
		*/
		ChannelType[ChannelType["GuildVoice"] = 2] = "GuildVoice";
		/**
		* A direct message between multiple users
		*/
		ChannelType[ChannelType["GroupDM"] = 3] = "GroupDM";
		/**
		* An organizational category that contains up to 50 channels
		*
		* @see {@link https://support.discord.com/hc/articles/115001580171}
		*/
		ChannelType[ChannelType["GuildCategory"] = 4] = "GuildCategory";
		/**
		* A channel that users can follow and crosspost into their own guild
		*
		* @see {@link https://support.discord.com/hc/articles/360032008192}
		*/
		ChannelType[ChannelType["GuildAnnouncement"] = 5] = "GuildAnnouncement";
		/**
		* A temporary sub-channel within a Guild Announcement channel
		*/
		ChannelType[ChannelType["AnnouncementThread"] = 10] = "AnnouncementThread";
		/**
		* A temporary sub-channel within a Guild Text or Guild Forum channel
		*/
		ChannelType[ChannelType["PublicThread"] = 11] = "PublicThread";
		/**
		* A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission
		*/
		ChannelType[ChannelType["PrivateThread"] = 12] = "PrivateThread";
		/**
		* A voice channel for hosting events with an audience
		*
		* @see {@link https://support.discord.com/hc/articles/1500005513722}
		*/
		ChannelType[ChannelType["GuildStageVoice"] = 13] = "GuildStageVoice";
		/**
		* The channel in a Student Hub containing the listed servers
		*
		* @see {@link https://support.discord.com/hc/articles/4406046651927}
		*/
		ChannelType[ChannelType["GuildDirectory"] = 14] = "GuildDirectory";
		/**
		* A channel that can only contain threads
		*/
		ChannelType[ChannelType["GuildForum"] = 15] = "GuildForum";
		/**
		* A channel like forum channels but contains media for server subscriptions
		*
		* @see {@link https://creator-support.discord.com/hc/articles/14346342766743}
		*/
		ChannelType[ChannelType["GuildMedia"] = 16] = "GuildMedia";
		/**
		* A channel that users can follow and crosspost into their own guild
		*
		* @deprecated This is the old name for {@link ChannelType.GuildAnnouncement}
		* @see {@link https://support.discord.com/hc/articles/360032008192}
		*/
		ChannelType[ChannelType["GuildNews"] = 5] = "GuildNews";
		/**
		* A temporary sub-channel within a Guild Announcement channel
		*
		* @deprecated This is the old name for {@link ChannelType.AnnouncementThread}
		*/
		ChannelType[ChannelType["GuildNewsThread"] = 10] = "GuildNewsThread";
		/**
		* A temporary sub-channel within a Guild Text channel
		*
		* @deprecated This is the old name for {@link ChannelType.PublicThread}
		*/
		ChannelType[ChannelType["GuildPublicThread"] = 11] = "GuildPublicThread";
		/**
		* A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission
		*
		* @deprecated This is the old name for {@link ChannelType.PrivateThread}
		*/
		ChannelType[ChannelType["GuildPrivateThread"] = 12] = "GuildPrivateThread";
	})(ChannelType || (exports.ChannelType = ChannelType = {}));
	var VideoQualityMode;
	(function(VideoQualityMode) {
		/**
		* Discord chooses the quality for optimal performance
		*/
		VideoQualityMode[VideoQualityMode["Auto"] = 1] = "Auto";
		/**
		* 720p
		*/
		VideoQualityMode[VideoQualityMode["Full"] = 2] = "Full";
	})(VideoQualityMode || (exports.VideoQualityMode = VideoQualityMode = {}));
	var OverwriteType;
	(function(OverwriteType) {
		OverwriteType[OverwriteType["Role"] = 0] = "Role";
		OverwriteType[OverwriteType["Member"] = 1] = "Member";
	})(OverwriteType || (exports.OverwriteType = OverwriteType = {}));
	var ThreadAutoArchiveDuration;
	(function(ThreadAutoArchiveDuration) {
		ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["OneHour"] = 60] = "OneHour";
		ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["OneDay"] = 1440] = "OneDay";
		ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["ThreeDays"] = 4320] = "ThreeDays";
		ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["OneWeek"] = 10080] = "OneWeek";
	})(ThreadAutoArchiveDuration || (exports.ThreadAutoArchiveDuration = ThreadAutoArchiveDuration = {}));
	var ThreadMemberFlags;
	(function(ThreadMemberFlags) {
		/**
		* @unstable This thread member flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ThreadMemberFlags[ThreadMemberFlags["HasInteracted"] = 1] = "HasInteracted";
		/**
		* @unstable This thread member flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ThreadMemberFlags[ThreadMemberFlags["AllMessages"] = 2] = "AllMessages";
		/**
		* @unstable This thread member flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ThreadMemberFlags[ThreadMemberFlags["OnlyMentions"] = 4] = "OnlyMentions";
		/**
		* @unstable This thread member flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ThreadMemberFlags[ThreadMemberFlags["NoMessages"] = 8] = "NoMessages";
	})(ThreadMemberFlags || (exports.ThreadMemberFlags = ThreadMemberFlags = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-flags}
	*/
	var ChannelFlags;
	(function(ChannelFlags) {
		/**
		* @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ChannelFlags[ChannelFlags["GuildFeedRemoved"] = 1] = "GuildFeedRemoved";
		/**
		* This thread is pinned to the top of its parent forum channel
		*/
		ChannelFlags[ChannelFlags["Pinned"] = 2] = "Pinned";
		/**
		* @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ChannelFlags[ChannelFlags["ActiveChannelsRemoved"] = 4] = "ActiveChannelsRemoved";
		/**
		* Whether a tag is required to be specified when creating a thread in a forum channel.
		* Tags are specified in the `applied_tags` field
		*/
		ChannelFlags[ChannelFlags["RequireTag"] = 16] = "RequireTag";
		/**
		* @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ChannelFlags[ChannelFlags["IsSpam"] = 32] = "IsSpam";
		/**
		* @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ChannelFlags[ChannelFlags["IsGuildResourceChannel"] = 128] = "IsGuildResourceChannel";
		/**
		* @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ChannelFlags[ChannelFlags["ClydeAI"] = 256] = "ClydeAI";
		/**
		* @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ChannelFlags[ChannelFlags["IsScheduledForDeletion"] = 512] = "IsScheduledForDeletion";
		/**
		* Whether media download options are hidden.
		*/
		ChannelFlags[ChannelFlags["HideMediaDownloadOptions"] = 32768] = "HideMediaDownloadOptions";
	})(ChannelFlags || (exports.ChannelFlags = ChannelFlags = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/gateway.js
var require_gateway = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from
	*  - https://discord.com/developers/docs/topics/gateway
	*  - https://discord.com/developers/docs/topics/gateway-events
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ActivityFlags = exports.StatusDisplayType = exports.ActivityType = exports.ActivityPlatform = exports.PresenceUpdateStatus = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/topics/gateway-events#update-presence-status-types}
	*/
	var PresenceUpdateStatus;
	(function(PresenceUpdateStatus) {
		PresenceUpdateStatus["Online"] = "online";
		PresenceUpdateStatus["DoNotDisturb"] = "dnd";
		PresenceUpdateStatus["Idle"] = "idle";
		/**
		* Invisible and shown as offline
		*/
		PresenceUpdateStatus["Invisible"] = "invisible";
		PresenceUpdateStatus["Offline"] = "offline";
	})(PresenceUpdateStatus || (exports.PresenceUpdateStatus = PresenceUpdateStatus = {}));
	/**
	* @unstable This enum is currently not documented by Discord but has known values which we will try to keep up to date.
	* Values might be added or removed without a major version bump.
	*/
	var ActivityPlatform;
	(function(ActivityPlatform) {
		ActivityPlatform["Desktop"] = "desktop";
		ActivityPlatform["Xbox"] = "xbox";
		ActivityPlatform["Samsung"] = "samsung";
		ActivityPlatform["IOS"] = "ios";
		ActivityPlatform["Android"] = "android";
		ActivityPlatform["Embedded"] = "embedded";
		ActivityPlatform["PS4"] = "ps4";
		ActivityPlatform["PS5"] = "ps5";
	})(ActivityPlatform || (exports.ActivityPlatform = ActivityPlatform = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types}
	*/
	var ActivityType;
	(function(ActivityType) {
		/**
		* Playing \{game\}
		*/
		ActivityType[ActivityType["Playing"] = 0] = "Playing";
		/**
		* Streaming \{details\}
		*/
		ActivityType[ActivityType["Streaming"] = 1] = "Streaming";
		/**
		* Listening to \{name\}
		*/
		ActivityType[ActivityType["Listening"] = 2] = "Listening";
		/**
		* Watching \{details\}
		*/
		ActivityType[ActivityType["Watching"] = 3] = "Watching";
		/**
		* \{emoji\} \{state\}
		*/
		ActivityType[ActivityType["Custom"] = 4] = "Custom";
		/**
		* Competing in \{name\}
		*/
		ActivityType[ActivityType["Competing"] = 5] = "Competing";
	})(ActivityType || (exports.ActivityType = ActivityType = {}));
	/**
	* Controls which field is used in the user's status message
	*
	* @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-status-display-types}
	*/
	var StatusDisplayType;
	(function(StatusDisplayType) {
		/**
		* Playing \{name\}
		*/
		StatusDisplayType[StatusDisplayType["Name"] = 0] = "Name";
		/**
		* Playing \{state\}
		*/
		StatusDisplayType[StatusDisplayType["State"] = 1] = "State";
		/**
		* Playing \{details\}
		*/
		StatusDisplayType[StatusDisplayType["Details"] = 2] = "Details";
	})(StatusDisplayType || (exports.StatusDisplayType = StatusDisplayType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-flags}
	*/
	var ActivityFlags;
	(function(ActivityFlags) {
		ActivityFlags[ActivityFlags["Instance"] = 1] = "Instance";
		ActivityFlags[ActivityFlags["Join"] = 2] = "Join";
		ActivityFlags[ActivityFlags["Spectate"] = 4] = "Spectate";
		ActivityFlags[ActivityFlags["JoinRequest"] = 8] = "JoinRequest";
		ActivityFlags[ActivityFlags["Sync"] = 16] = "Sync";
		ActivityFlags[ActivityFlags["Play"] = 32] = "Play";
		ActivityFlags[ActivityFlags["PartyPrivacyFriends"] = 64] = "PartyPrivacyFriends";
		ActivityFlags[ActivityFlags["PartyPrivacyVoiceChannel"] = 128] = "PartyPrivacyVoiceChannel";
		ActivityFlags[ActivityFlags["Embedded"] = 256] = "Embedded";
	})(ActivityFlags || (exports.ActivityFlags = ActivityFlags = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/guild.js
var require_guild = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/guild
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GuildOnboardingPromptType = exports.GuildOnboardingMode = exports.MembershipScreeningFieldType = exports.GuildWidgetStyle = exports.IntegrationExpireBehavior = exports.GuildMemberFlags = exports.GuildFeature = exports.GuildSystemChannelFlags = exports.GuildHubType = exports.GuildPremiumTier = exports.GuildVerificationLevel = exports.GuildNSFWLevel = exports.GuildMFALevel = exports.GuildExplicitContentFilter = exports.GuildDefaultMessageNotifications = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level}
	*/
	var GuildDefaultMessageNotifications;
	(function(GuildDefaultMessageNotifications) {
		GuildDefaultMessageNotifications[GuildDefaultMessageNotifications["AllMessages"] = 0] = "AllMessages";
		GuildDefaultMessageNotifications[GuildDefaultMessageNotifications["OnlyMentions"] = 1] = "OnlyMentions";
	})(GuildDefaultMessageNotifications || (exports.GuildDefaultMessageNotifications = GuildDefaultMessageNotifications = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level}
	*/
	var GuildExplicitContentFilter;
	(function(GuildExplicitContentFilter) {
		GuildExplicitContentFilter[GuildExplicitContentFilter["Disabled"] = 0] = "Disabled";
		GuildExplicitContentFilter[GuildExplicitContentFilter["MembersWithoutRoles"] = 1] = "MembersWithoutRoles";
		GuildExplicitContentFilter[GuildExplicitContentFilter["AllMembers"] = 2] = "AllMembers";
	})(GuildExplicitContentFilter || (exports.GuildExplicitContentFilter = GuildExplicitContentFilter = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mfa-level}
	*/
	var GuildMFALevel;
	(function(GuildMFALevel) {
		GuildMFALevel[GuildMFALevel["None"] = 0] = "None";
		GuildMFALevel[GuildMFALevel["Elevated"] = 1] = "Elevated";
	})(GuildMFALevel || (exports.GuildMFALevel = GuildMFALevel = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level}
	*/
	var GuildNSFWLevel;
	(function(GuildNSFWLevel) {
		GuildNSFWLevel[GuildNSFWLevel["Default"] = 0] = "Default";
		GuildNSFWLevel[GuildNSFWLevel["Explicit"] = 1] = "Explicit";
		GuildNSFWLevel[GuildNSFWLevel["Safe"] = 2] = "Safe";
		GuildNSFWLevel[GuildNSFWLevel["AgeRestricted"] = 3] = "AgeRestricted";
	})(GuildNSFWLevel || (exports.GuildNSFWLevel = GuildNSFWLevel = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level}
	*/
	var GuildVerificationLevel;
	(function(GuildVerificationLevel) {
		/**
		* Unrestricted
		*/
		GuildVerificationLevel[GuildVerificationLevel["None"] = 0] = "None";
		/**
		* Must have verified email on account
		*/
		GuildVerificationLevel[GuildVerificationLevel["Low"] = 1] = "Low";
		/**
		* Must be registered on Discord for longer than 5 minutes
		*/
		GuildVerificationLevel[GuildVerificationLevel["Medium"] = 2] = "Medium";
		/**
		* Must be a member of the guild for longer than 10 minutes
		*/
		GuildVerificationLevel[GuildVerificationLevel["High"] = 3] = "High";
		/**
		* Must have a verified phone number
		*/
		GuildVerificationLevel[GuildVerificationLevel["VeryHigh"] = 4] = "VeryHigh";
	})(GuildVerificationLevel || (exports.GuildVerificationLevel = GuildVerificationLevel = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-object-premium-tier}
	*/
	var GuildPremiumTier;
	(function(GuildPremiumTier) {
		GuildPremiumTier[GuildPremiumTier["None"] = 0] = "None";
		GuildPremiumTier[GuildPremiumTier["Tier1"] = 1] = "Tier1";
		GuildPremiumTier[GuildPremiumTier["Tier2"] = 2] = "Tier2";
		GuildPremiumTier[GuildPremiumTier["Tier3"] = 3] = "Tier3";
	})(GuildPremiumTier || (exports.GuildPremiumTier = GuildPremiumTier = {}));
	var GuildHubType;
	(function(GuildHubType) {
		GuildHubType[GuildHubType["Default"] = 0] = "Default";
		GuildHubType[GuildHubType["HighSchool"] = 1] = "HighSchool";
		GuildHubType[GuildHubType["College"] = 2] = "College";
	})(GuildHubType || (exports.GuildHubType = GuildHubType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags}
	*/
	var GuildSystemChannelFlags;
	(function(GuildSystemChannelFlags) {
		/**
		* Suppress member join notifications
		*/
		GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressJoinNotifications"] = 1] = "SuppressJoinNotifications";
		/**
		* Suppress server boost notifications
		*/
		GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressPremiumSubscriptions"] = 2] = "SuppressPremiumSubscriptions";
		/**
		* Suppress server setup tips
		*/
		GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressGuildReminderNotifications"] = 4] = "SuppressGuildReminderNotifications";
		/**
		* Hide member join sticker reply buttons
		*/
		GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressJoinNotificationReplies"] = 8] = "SuppressJoinNotificationReplies";
		/**
		* Suppress role subscription purchase and renewal notifications
		*/
		GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressRoleSubscriptionPurchaseNotifications"] = 16] = "SuppressRoleSubscriptionPurchaseNotifications";
		/**
		* Hide role subscription sticker reply buttons
		*/
		GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressRoleSubscriptionPurchaseNotificationReplies"] = 32] = "SuppressRoleSubscriptionPurchaseNotificationReplies";
	})(GuildSystemChannelFlags || (exports.GuildSystemChannelFlags = GuildSystemChannelFlags = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-features}
	*/
	var GuildFeature;
	(function(GuildFeature) {
		/**
		* Guild has access to set an animated guild banner image
		*/
		GuildFeature["AnimatedBanner"] = "ANIMATED_BANNER";
		/**
		* Guild has access to set an animated guild icon
		*/
		GuildFeature["AnimatedIcon"] = "ANIMATED_ICON";
		/**
		* Guild is using the old permissions configuration behavior
		*
		* @see {@link https://discord.com/developers/docs/change-log#upcoming-application-command-permission-changes}
		*/
		GuildFeature["ApplicationCommandPermissionsV2"] = "APPLICATION_COMMAND_PERMISSIONS_V2";
		/**
		* Guild has set up auto moderation rules
		*/
		GuildFeature["AutoModeration"] = "AUTO_MODERATION";
		/**
		* Guild has access to set a guild banner image
		*/
		GuildFeature["Banner"] = "BANNER";
		/**
		* Guild can enable welcome screen, Membership Screening and discovery, and receives community updates
		*/
		GuildFeature["Community"] = "COMMUNITY";
		/**
		* Guild has enabled monetization
		*/
		GuildFeature["CreatorMonetizableProvisional"] = "CREATOR_MONETIZABLE_PROVISIONAL";
		/**
		* Guild has enabled the role subscription promo page
		*/
		GuildFeature["CreatorStorePage"] = "CREATOR_STORE_PAGE";
		/**
		* Guild has been set as a support server on the App Directory
		*/
		GuildFeature["DeveloperSupportServer"] = "DEVELOPER_SUPPORT_SERVER";
		/**
		* Guild is able to be discovered in the directory
		*/
		GuildFeature["Discoverable"] = "DISCOVERABLE";
		/**
		* Guild is able to be featured in the directory
		*/
		GuildFeature["Featurable"] = "FEATURABLE";
		/**
		* Guild is listed in a directory channel
		*/
		GuildFeature["HasDirectoryEntry"] = "HAS_DIRECTORY_ENTRY";
		/**
		* Guild is a Student Hub
		*
		* @see {@link https://support.discord.com/hc/articles/4406046651927}
		* @unstable This feature is currently not documented by Discord, but has known value
		*/
		GuildFeature["Hub"] = "HUB";
		/**
		* Guild has disabled invite usage, preventing users from joining
		*/
		GuildFeature["InvitesDisabled"] = "INVITES_DISABLED";
		/**
		* Guild has access to set an invite splash background
		*/
		GuildFeature["InviteSplash"] = "INVITE_SPLASH";
		/**
		* Guild is in a Student Hub
		*
		* @see {@link https://support.discord.com/hc/articles/4406046651927}
		* @unstable This feature is currently not documented by Discord, but has known value
		*/
		GuildFeature["LinkedToHub"] = "LINKED_TO_HUB";
		/**
		* Guild has enabled Membership Screening
		*/
		GuildFeature["MemberVerificationGateEnabled"] = "MEMBER_VERIFICATION_GATE_ENABLED";
		/**
		* Guild has increased custom soundboard sound slots
		*/
		GuildFeature["MoreSoundboard"] = "MORE_SOUNDBOARD";
		/**
		* Guild has enabled monetization
		*
		* @unstable This feature is no longer documented by Discord
		*/
		GuildFeature["MonetizationEnabled"] = "MONETIZATION_ENABLED";
		/**
		* Guild has increased custom sticker slots
		*/
		GuildFeature["MoreStickers"] = "MORE_STICKERS";
		/**
		* Guild has access to create news channels
		*/
		GuildFeature["News"] = "NEWS";
		/**
		* Guild is partnered
		*/
		GuildFeature["Partnered"] = "PARTNERED";
		/**
		* Guild can be previewed before joining via Membership Screening or the directory
		*/
		GuildFeature["PreviewEnabled"] = "PREVIEW_ENABLED";
		/**
		* Guild has access to create private threads
		*/
		GuildFeature["PrivateThreads"] = "PRIVATE_THREADS";
		/**
		* Guild has disabled alerts for join raids in the configured safety alerts channel
		*/
		GuildFeature["RaidAlertsDisabled"] = "RAID_ALERTS_DISABLED";
		GuildFeature["RelayEnabled"] = "RELAY_ENABLED";
		/**
		* Guild is able to set role icons
		*/
		GuildFeature["RoleIcons"] = "ROLE_ICONS";
		/**
		* Guild has role subscriptions that can be purchased
		*/
		GuildFeature["RoleSubscriptionsAvailableForPurchase"] = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE";
		/**
		* Guild has enabled role subscriptions
		*/
		GuildFeature["RoleSubscriptionsEnabled"] = "ROLE_SUBSCRIPTIONS_ENABLED";
		/**
		* Guild has created soundboard sounds
		*/
		GuildFeature["Soundboard"] = "SOUNDBOARD";
		/**
		* Guild has enabled ticketed events
		*/
		GuildFeature["TicketedEventsEnabled"] = "TICKETED_EVENTS_ENABLED";
		/**
		* Guild has access to set a vanity URL
		*/
		GuildFeature["VanityURL"] = "VANITY_URL";
		/**
		* Guild is verified
		*/
		GuildFeature["Verified"] = "VERIFIED";
		/**
		* Guild has access to set 384kbps bitrate in voice (previously VIP voice servers)
		*/
		GuildFeature["VIPRegions"] = "VIP_REGIONS";
		/**
		* Guild has enabled the welcome screen
		*/
		GuildFeature["WelcomeScreenEnabled"] = "WELCOME_SCREEN_ENABLED";
		/**
		* Guild has access to set guild tags
		*/
		GuildFeature["GuildTags"] = "GUILD_TAGS";
		/**
		* Guild is able to set gradient colors to roles
		*/
		GuildFeature["EnhancedRoleColors"] = "ENHANCED_ROLE_COLORS";
		/**
		* Guild has access to guest invites
		*/
		GuildFeature["GuestsEnabled"] = "GUESTS_ENABLED";
		/**
		* Guild has migrated to the new pin messages permission
		*
		* @unstable This feature is currently not documented by Discord, but has known value
		*/
		GuildFeature["PinPermissionMigrationComplete"] = "PIN_PERMISSION_MIGRATION_COMPLETE";
	})(GuildFeature || (exports.GuildFeature = GuildFeature = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags}
	*/
	var GuildMemberFlags;
	(function(GuildMemberFlags) {
		/**
		* Member has left and rejoined the guild
		*/
		GuildMemberFlags[GuildMemberFlags["DidRejoin"] = 1] = "DidRejoin";
		/**
		* Member has completed onboarding
		*/
		GuildMemberFlags[GuildMemberFlags["CompletedOnboarding"] = 2] = "CompletedOnboarding";
		/**
		* Member is exempt from guild verification requirements
		*/
		GuildMemberFlags[GuildMemberFlags["BypassesVerification"] = 4] = "BypassesVerification";
		/**
		* Member has started onboarding
		*/
		GuildMemberFlags[GuildMemberFlags["StartedOnboarding"] = 8] = "StartedOnboarding";
		/**
		* Member is a guest and can only access the voice channel they were invited to
		*/
		GuildMemberFlags[GuildMemberFlags["IsGuest"] = 16] = "IsGuest";
		/**
		* Member has started Server Guide new member actions
		*/
		GuildMemberFlags[GuildMemberFlags["StartedHomeActions"] = 32] = "StartedHomeActions";
		/**
		* Member has completed Server Guide new member actions
		*/
		GuildMemberFlags[GuildMemberFlags["CompletedHomeActions"] = 64] = "CompletedHomeActions";
		/**
		* Member's username, display name, or nickname is blocked by AutoMod
		*/
		GuildMemberFlags[GuildMemberFlags["AutomodQuarantinedUsernameOrGuildNickname"] = 128] = "AutomodQuarantinedUsernameOrGuildNickname";
		/**
		* @deprecated
		* {@link https://github.com/discord/discord-api-docs/pull/7113 | discord-api-docs#7113}
		*/
		GuildMemberFlags[GuildMemberFlags["AutomodQuarantinedBio"] = 256] = "AutomodQuarantinedBio";
		/**
		* Member has dismissed the DM settings upsell
		*/
		GuildMemberFlags[GuildMemberFlags["DmSettingsUpsellAcknowledged"] = 512] = "DmSettingsUpsellAcknowledged";
		/**
		* Member's guild tag is blocked by AutoMod
		*/
		GuildMemberFlags[GuildMemberFlags["AutoModQuarantinedGuildTag"] = 1024] = "AutoModQuarantinedGuildTag";
	})(GuildMemberFlags || (exports.GuildMemberFlags = GuildMemberFlags = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors}
	*/
	var IntegrationExpireBehavior;
	(function(IntegrationExpireBehavior) {
		IntegrationExpireBehavior[IntegrationExpireBehavior["RemoveRole"] = 0] = "RemoveRole";
		IntegrationExpireBehavior[IntegrationExpireBehavior["Kick"] = 1] = "Kick";
	})(IntegrationExpireBehavior || (exports.IntegrationExpireBehavior = IntegrationExpireBehavior = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options}
	*/
	var GuildWidgetStyle;
	(function(GuildWidgetStyle) {
		/**
		* Shield style widget with Discord icon and guild members online count
		*/
		GuildWidgetStyle["Shield"] = "shield";
		/**
		* Large image with guild icon, name and online count. "POWERED BY DISCORD" as the footer of the widget
		*/
		GuildWidgetStyle["Banner1"] = "banner1";
		/**
		* Smaller widget style with guild icon, name and online count. Split on the right with Discord logo
		*/
		GuildWidgetStyle["Banner2"] = "banner2";
		/**
		* Large image with guild icon, name and online count. In the footer, Discord logo on the left and "Chat Now" on the right
		*/
		GuildWidgetStyle["Banner3"] = "banner3";
		/**
		* Large Discord logo at the top of the widget. Guild icon, name and online count in the middle portion of the widget
		* and a "JOIN MY SERVER" button at the bottom
		*/
		GuildWidgetStyle["Banner4"] = "banner4";
	})(GuildWidgetStyle || (exports.GuildWidgetStyle = GuildWidgetStyle = {}));
	/**
	* @unstable https://github.com/discord/discord-api-docs/pull/2547
	*/
	var MembershipScreeningFieldType;
	(function(MembershipScreeningFieldType) {
		/**
		* Server Rules
		*/
		MembershipScreeningFieldType["Terms"] = "TERMS";
	})(MembershipScreeningFieldType || (exports.MembershipScreeningFieldType = MembershipScreeningFieldType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode}
	*/
	var GuildOnboardingMode;
	(function(GuildOnboardingMode) {
		/**
		* Counts only Default Channels towards constraints
		*/
		GuildOnboardingMode[GuildOnboardingMode["OnboardingDefault"] = 0] = "OnboardingDefault";
		/**
		* Counts Default Channels and Questions towards constraints
		*/
		GuildOnboardingMode[GuildOnboardingMode["OnboardingAdvanced"] = 1] = "OnboardingAdvanced";
	})(GuildOnboardingMode || (exports.GuildOnboardingMode = GuildOnboardingMode = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types}
	*/
	var GuildOnboardingPromptType;
	(function(GuildOnboardingPromptType) {
		GuildOnboardingPromptType[GuildOnboardingPromptType["MultipleChoice"] = 0] = "MultipleChoice";
		GuildOnboardingPromptType[GuildOnboardingPromptType["Dropdown"] = 1] = "Dropdown";
	})(GuildOnboardingPromptType || (exports.GuildOnboardingPromptType = GuildOnboardingPromptType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/guildScheduledEvent.js
var require_guildScheduledEvent = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GuildScheduledEventPrivacyLevel = exports.GuildScheduledEventStatus = exports.GuildScheduledEventEntityType = exports.GuildScheduledEventRecurrenceRuleMonth = exports.GuildScheduledEventRecurrenceRuleWeekday = exports.GuildScheduledEventRecurrenceRuleFrequency = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-frequency}
	*/
	var GuildScheduledEventRecurrenceRuleFrequency;
	(function(GuildScheduledEventRecurrenceRuleFrequency) {
		GuildScheduledEventRecurrenceRuleFrequency[GuildScheduledEventRecurrenceRuleFrequency["Yearly"] = 0] = "Yearly";
		GuildScheduledEventRecurrenceRuleFrequency[GuildScheduledEventRecurrenceRuleFrequency["Monthly"] = 1] = "Monthly";
		GuildScheduledEventRecurrenceRuleFrequency[GuildScheduledEventRecurrenceRuleFrequency["Weekly"] = 2] = "Weekly";
		GuildScheduledEventRecurrenceRuleFrequency[GuildScheduledEventRecurrenceRuleFrequency["Daily"] = 3] = "Daily";
	})(GuildScheduledEventRecurrenceRuleFrequency || (exports.GuildScheduledEventRecurrenceRuleFrequency = GuildScheduledEventRecurrenceRuleFrequency = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-weekday}
	*/
	var GuildScheduledEventRecurrenceRuleWeekday;
	(function(GuildScheduledEventRecurrenceRuleWeekday) {
		GuildScheduledEventRecurrenceRuleWeekday[GuildScheduledEventRecurrenceRuleWeekday["Monday"] = 0] = "Monday";
		GuildScheduledEventRecurrenceRuleWeekday[GuildScheduledEventRecurrenceRuleWeekday["Tuesday"] = 1] = "Tuesday";
		GuildScheduledEventRecurrenceRuleWeekday[GuildScheduledEventRecurrenceRuleWeekday["Wednesday"] = 2] = "Wednesday";
		GuildScheduledEventRecurrenceRuleWeekday[GuildScheduledEventRecurrenceRuleWeekday["Thursday"] = 3] = "Thursday";
		GuildScheduledEventRecurrenceRuleWeekday[GuildScheduledEventRecurrenceRuleWeekday["Friday"] = 4] = "Friday";
		GuildScheduledEventRecurrenceRuleWeekday[GuildScheduledEventRecurrenceRuleWeekday["Saturday"] = 5] = "Saturday";
		GuildScheduledEventRecurrenceRuleWeekday[GuildScheduledEventRecurrenceRuleWeekday["Sunday"] = 6] = "Sunday";
	})(GuildScheduledEventRecurrenceRuleWeekday || (exports.GuildScheduledEventRecurrenceRuleWeekday = GuildScheduledEventRecurrenceRuleWeekday = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-month}
	*/
	var GuildScheduledEventRecurrenceRuleMonth;
	(function(GuildScheduledEventRecurrenceRuleMonth) {
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["January"] = 1] = "January";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["February"] = 2] = "February";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["March"] = 3] = "March";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["April"] = 4] = "April";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["May"] = 5] = "May";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["June"] = 6] = "June";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["July"] = 7] = "July";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["August"] = 8] = "August";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["September"] = 9] = "September";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["October"] = 10] = "October";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["November"] = 11] = "November";
		GuildScheduledEventRecurrenceRuleMonth[GuildScheduledEventRecurrenceRuleMonth["December"] = 12] = "December";
	})(GuildScheduledEventRecurrenceRuleMonth || (exports.GuildScheduledEventRecurrenceRuleMonth = GuildScheduledEventRecurrenceRuleMonth = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types}
	*/
	var GuildScheduledEventEntityType;
	(function(GuildScheduledEventEntityType) {
		GuildScheduledEventEntityType[GuildScheduledEventEntityType["StageInstance"] = 1] = "StageInstance";
		GuildScheduledEventEntityType[GuildScheduledEventEntityType["Voice"] = 2] = "Voice";
		GuildScheduledEventEntityType[GuildScheduledEventEntityType["External"] = 3] = "External";
	})(GuildScheduledEventEntityType || (exports.GuildScheduledEventEntityType = GuildScheduledEventEntityType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status}
	*/
	var GuildScheduledEventStatus;
	(function(GuildScheduledEventStatus) {
		GuildScheduledEventStatus[GuildScheduledEventStatus["Scheduled"] = 1] = "Scheduled";
		GuildScheduledEventStatus[GuildScheduledEventStatus["Active"] = 2] = "Active";
		GuildScheduledEventStatus[GuildScheduledEventStatus["Completed"] = 3] = "Completed";
		GuildScheduledEventStatus[GuildScheduledEventStatus["Canceled"] = 4] = "Canceled";
	})(GuildScheduledEventStatus || (exports.GuildScheduledEventStatus = GuildScheduledEventStatus = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level}
	*/
	var GuildScheduledEventPrivacyLevel;
	(function(GuildScheduledEventPrivacyLevel) {
		/**
		* The scheduled event is only accessible to guild members
		*/
		GuildScheduledEventPrivacyLevel[GuildScheduledEventPrivacyLevel["GuildOnly"] = 2] = "GuildOnly";
	})(GuildScheduledEventPrivacyLevel || (exports.GuildScheduledEventPrivacyLevel = GuildScheduledEventPrivacyLevel = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/shared.js
var require_shared = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ApplicationCommandOptionType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type}
	*/
	var ApplicationCommandOptionType;
	(function(ApplicationCommandOptionType) {
		ApplicationCommandOptionType[ApplicationCommandOptionType["Subcommand"] = 1] = "Subcommand";
		ApplicationCommandOptionType[ApplicationCommandOptionType["SubcommandGroup"] = 2] = "SubcommandGroup";
		ApplicationCommandOptionType[ApplicationCommandOptionType["String"] = 3] = "String";
		ApplicationCommandOptionType[ApplicationCommandOptionType["Integer"] = 4] = "Integer";
		ApplicationCommandOptionType[ApplicationCommandOptionType["Boolean"] = 5] = "Boolean";
		ApplicationCommandOptionType[ApplicationCommandOptionType["User"] = 6] = "User";
		ApplicationCommandOptionType[ApplicationCommandOptionType["Channel"] = 7] = "Channel";
		ApplicationCommandOptionType[ApplicationCommandOptionType["Role"] = 8] = "Role";
		ApplicationCommandOptionType[ApplicationCommandOptionType["Mentionable"] = 9] = "Mentionable";
		ApplicationCommandOptionType[ApplicationCommandOptionType["Number"] = 10] = "Number";
		ApplicationCommandOptionType[ApplicationCommandOptionType["Attachment"] = 11] = "Attachment";
	})(ApplicationCommandOptionType || (exports.ApplicationCommandOptionType = ApplicationCommandOptionType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/chatInput.js
var require_chatInput = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$7) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$7, p)) __createBinding(exports$7, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_shared(), exports);
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/permissions.js
var require_permissions$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.APIApplicationCommandPermissionsConstant = exports.ApplicationCommandPermissionType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permission-type}
	*/
	var ApplicationCommandPermissionType;
	(function(ApplicationCommandPermissionType) {
		ApplicationCommandPermissionType[ApplicationCommandPermissionType["Role"] = 1] = "Role";
		ApplicationCommandPermissionType[ApplicationCommandPermissionType["User"] = 2] = "User";
		ApplicationCommandPermissionType[ApplicationCommandPermissionType["Channel"] = 3] = "Channel";
	})(ApplicationCommandPermissionType || (exports.ApplicationCommandPermissionType = ApplicationCommandPermissionType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-constants}
	*/
	exports.APIApplicationCommandPermissionsConstant = {
		Everyone: (guildId) => String(guildId),
		AllChannels: (guildId) => String(BigInt(guildId) - 1n)
	};
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/_interactions/applicationCommands.js
var require_applicationCommands = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$6) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$6, p)) __createBinding(exports$6, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EntryPointCommandHandlerType = exports.InteractionContextType = exports.ApplicationIntegrationType = exports.ApplicationCommandType = void 0;
	__exportStar(require_chatInput(), exports);
	__exportStar(require_permissions$1(), exports);
	/**
	* @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types}
	*/
	var ApplicationCommandType;
	(function(ApplicationCommandType) {
		/**
		* Slash commands; a text-based command that shows up when a user types `/`
		*/
		ApplicationCommandType[ApplicationCommandType["ChatInput"] = 1] = "ChatInput";
		/**
		* A UI-based command that shows up when you right click or tap on a user
		*/
		ApplicationCommandType[ApplicationCommandType["User"] = 2] = "User";
		/**
		* A UI-based command that shows up when you right click or tap on a message
		*/
		ApplicationCommandType[ApplicationCommandType["Message"] = 3] = "Message";
		/**
		* A UI-based command that represents the primary way to invoke an app's Activity
		*/
		ApplicationCommandType[ApplicationCommandType["PrimaryEntryPoint"] = 4] = "PrimaryEntryPoint";
	})(ApplicationCommandType || (exports.ApplicationCommandType = ApplicationCommandType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types}
	*/
	var ApplicationIntegrationType;
	(function(ApplicationIntegrationType) {
		/**
		* App is installable to servers
		*/
		ApplicationIntegrationType[ApplicationIntegrationType["GuildInstall"] = 0] = "GuildInstall";
		/**
		* App is installable to users
		*/
		ApplicationIntegrationType[ApplicationIntegrationType["UserInstall"] = 1] = "UserInstall";
	})(ApplicationIntegrationType || (exports.ApplicationIntegrationType = ApplicationIntegrationType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types}
	*/
	var InteractionContextType;
	(function(InteractionContextType) {
		/**
		* Interaction can be used within servers
		*/
		InteractionContextType[InteractionContextType["Guild"] = 0] = "Guild";
		/**
		* Interaction can be used within DMs with the app's bot user
		*/
		InteractionContextType[InteractionContextType["BotDM"] = 1] = "BotDM";
		/**
		* Interaction can be used within Group DMs and DMs other than the app's bot user
		*/
		InteractionContextType[InteractionContextType["PrivateChannel"] = 2] = "PrivateChannel";
	})(InteractionContextType || (exports.InteractionContextType = InteractionContextType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-entry-point-command-handler-types}
	*/
	var EntryPointCommandHandlerType;
	(function(EntryPointCommandHandlerType) {
		/**
		* The app handles the interaction using an interaction token
		*/
		EntryPointCommandHandlerType[EntryPointCommandHandlerType["AppHandler"] = 1] = "AppHandler";
		/**
		* Discord handles the interaction by launching an Activity and sending a follow-up message without coordinating with
		* the app
		*/
		EntryPointCommandHandlerType[EntryPointCommandHandlerType["DiscordLaunchActivity"] = 2] = "DiscordLaunchActivity";
	})(EntryPointCommandHandlerType || (exports.EntryPointCommandHandlerType = EntryPointCommandHandlerType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/_interactions/responses.js
var require_responses = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InteractionResponseType = exports.InteractionType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type}
	*/
	var InteractionType;
	(function(InteractionType) {
		InteractionType[InteractionType["Ping"] = 1] = "Ping";
		InteractionType[InteractionType["ApplicationCommand"] = 2] = "ApplicationCommand";
		InteractionType[InteractionType["MessageComponent"] = 3] = "MessageComponent";
		InteractionType[InteractionType["ApplicationCommandAutocomplete"] = 4] = "ApplicationCommandAutocomplete";
		InteractionType[InteractionType["ModalSubmit"] = 5] = "ModalSubmit";
	})(InteractionType || (exports.InteractionType = InteractionType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type}
	*/
	var InteractionResponseType;
	(function(InteractionResponseType) {
		/**
		* ACK a `Ping`
		*/
		InteractionResponseType[InteractionResponseType["Pong"] = 1] = "Pong";
		/**
		* Respond to an interaction with a message
		*/
		InteractionResponseType[InteractionResponseType["ChannelMessageWithSource"] = 4] = "ChannelMessageWithSource";
		/**
		* ACK an interaction and edit to a response later, the user sees a loading state
		*/
		InteractionResponseType[InteractionResponseType["DeferredChannelMessageWithSource"] = 5] = "DeferredChannelMessageWithSource";
		/**
		* ACK a button interaction and update it to a loading state
		*/
		InteractionResponseType[InteractionResponseType["DeferredMessageUpdate"] = 6] = "DeferredMessageUpdate";
		/**
		* ACK a button interaction and edit the message to which the button was attached
		*/
		InteractionResponseType[InteractionResponseType["UpdateMessage"] = 7] = "UpdateMessage";
		/**
		* For autocomplete interactions
		*/
		InteractionResponseType[InteractionResponseType["ApplicationCommandAutocompleteResult"] = 8] = "ApplicationCommandAutocompleteResult";
		/**
		* Respond to an interaction with an modal for a user to fill-out
		*/
		InteractionResponseType[InteractionResponseType["Modal"] = 9] = "Modal";
		/**
		* Respond to an interaction with an upgrade button, only available for apps with monetization enabled
		*
		* @deprecated Send a button with Premium type instead.
		* {@link https://discord.com/developers/docs/change-log#premium-apps-new-premium-button-style-deep-linking-url-schemes | Learn more here}
		*/
		InteractionResponseType[InteractionResponseType["PremiumRequired"] = 10] = "PremiumRequired";
		/**
		* Launch the Activity associated with the app.
		*
		* @remarks
		* Only available for apps with Activities enabled
		*/
		InteractionResponseType[InteractionResponseType["LaunchActivity"] = 12] = "LaunchActivity";
	})(InteractionResponseType || (exports.InteractionResponseType = InteractionResponseType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/interactions.js
var require_interactions = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$5) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$5, p)) __createBinding(exports$5, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_applicationCommands(), exports);
	__exportStar(require_responses(), exports);
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/invite.js
var require_invite = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/invite
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InviteTargetType = exports.InviteType = exports.InviteFlags = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/invite#invite-object-guild-invite-flags}
	*/
	var InviteFlags;
	(function(InviteFlags) {
		InviteFlags[InviteFlags["IsGuestInvite"] = 1] = "IsGuestInvite";
	})(InviteFlags || (exports.InviteFlags = InviteFlags = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types}
	*/
	var InviteType;
	(function(InviteType) {
		InviteType[InviteType["Guild"] = 0] = "Guild";
		InviteType[InviteType["GroupDM"] = 1] = "GroupDM";
		InviteType[InviteType["Friend"] = 2] = "Friend";
	})(InviteType || (exports.InviteType = InviteType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types}
	*/
	var InviteTargetType;
	(function(InviteTargetType) {
		InviteTargetType[InviteTargetType["Stream"] = 1] = "Stream";
		InviteTargetType[InviteTargetType["EmbeddedApplication"] = 2] = "EmbeddedApplication";
	})(InviteTargetType || (exports.InviteTargetType = InviteTargetType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/message.js
var require_message = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SeparatorSpacingSize = exports.UnfurledMediaItemLoadingState = exports.SelectMenuDefaultValueType = exports.TextInputStyle = exports.ButtonStyle = exports.ComponentType = exports.AllowedMentionsTypes = exports.AttachmentFlags = exports.EmbedType = exports.MessageFlags = exports.MessageReferenceType = exports.MessageActivityType = exports.MessageType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/message#message-object-message-types}
	*/
	var MessageType;
	(function(MessageType) {
		MessageType[MessageType["Default"] = 0] = "Default";
		MessageType[MessageType["RecipientAdd"] = 1] = "RecipientAdd";
		MessageType[MessageType["RecipientRemove"] = 2] = "RecipientRemove";
		MessageType[MessageType["Call"] = 3] = "Call";
		MessageType[MessageType["ChannelNameChange"] = 4] = "ChannelNameChange";
		MessageType[MessageType["ChannelIconChange"] = 5] = "ChannelIconChange";
		MessageType[MessageType["ChannelPinnedMessage"] = 6] = "ChannelPinnedMessage";
		MessageType[MessageType["UserJoin"] = 7] = "UserJoin";
		MessageType[MessageType["GuildBoost"] = 8] = "GuildBoost";
		MessageType[MessageType["GuildBoostTier1"] = 9] = "GuildBoostTier1";
		MessageType[MessageType["GuildBoostTier2"] = 10] = "GuildBoostTier2";
		MessageType[MessageType["GuildBoostTier3"] = 11] = "GuildBoostTier3";
		MessageType[MessageType["ChannelFollowAdd"] = 12] = "ChannelFollowAdd";
		MessageType[MessageType["GuildDiscoveryDisqualified"] = 14] = "GuildDiscoveryDisqualified";
		MessageType[MessageType["GuildDiscoveryRequalified"] = 15] = "GuildDiscoveryRequalified";
		MessageType[MessageType["GuildDiscoveryGracePeriodInitialWarning"] = 16] = "GuildDiscoveryGracePeriodInitialWarning";
		MessageType[MessageType["GuildDiscoveryGracePeriodFinalWarning"] = 17] = "GuildDiscoveryGracePeriodFinalWarning";
		MessageType[MessageType["ThreadCreated"] = 18] = "ThreadCreated";
		MessageType[MessageType["Reply"] = 19] = "Reply";
		MessageType[MessageType["ChatInputCommand"] = 20] = "ChatInputCommand";
		MessageType[MessageType["ThreadStarterMessage"] = 21] = "ThreadStarterMessage";
		MessageType[MessageType["GuildInviteReminder"] = 22] = "GuildInviteReminder";
		MessageType[MessageType["ContextMenuCommand"] = 23] = "ContextMenuCommand";
		MessageType[MessageType["AutoModerationAction"] = 24] = "AutoModerationAction";
		MessageType[MessageType["RoleSubscriptionPurchase"] = 25] = "RoleSubscriptionPurchase";
		MessageType[MessageType["InteractionPremiumUpsell"] = 26] = "InteractionPremiumUpsell";
		MessageType[MessageType["StageStart"] = 27] = "StageStart";
		MessageType[MessageType["StageEnd"] = 28] = "StageEnd";
		MessageType[MessageType["StageSpeaker"] = 29] = "StageSpeaker";
		/**
		* @unstable https://github.com/discord/discord-api-docs/pull/5927#discussion_r1107678548
		*/
		MessageType[MessageType["StageRaiseHand"] = 30] = "StageRaiseHand";
		MessageType[MessageType["StageTopic"] = 31] = "StageTopic";
		MessageType[MessageType["GuildApplicationPremiumSubscription"] = 32] = "GuildApplicationPremiumSubscription";
		MessageType[MessageType["GuildIncidentAlertModeEnabled"] = 36] = "GuildIncidentAlertModeEnabled";
		MessageType[MessageType["GuildIncidentAlertModeDisabled"] = 37] = "GuildIncidentAlertModeDisabled";
		MessageType[MessageType["GuildIncidentReportRaid"] = 38] = "GuildIncidentReportRaid";
		MessageType[MessageType["GuildIncidentReportFalseAlarm"] = 39] = "GuildIncidentReportFalseAlarm";
		MessageType[MessageType["PurchaseNotification"] = 44] = "PurchaseNotification";
		MessageType[MessageType["PollResult"] = 46] = "PollResult";
	})(MessageType || (exports.MessageType = MessageType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/message#message-object-message-activity-types}
	*/
	var MessageActivityType;
	(function(MessageActivityType) {
		MessageActivityType[MessageActivityType["Join"] = 1] = "Join";
		MessageActivityType[MessageActivityType["Spectate"] = 2] = "Spectate";
		MessageActivityType[MessageActivityType["Listen"] = 3] = "Listen";
		MessageActivityType[MessageActivityType["JoinRequest"] = 5] = "JoinRequest";
	})(MessageActivityType || (exports.MessageActivityType = MessageActivityType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/message#message-reference-types}
	*/
	var MessageReferenceType;
	(function(MessageReferenceType) {
		/**
		* A standard reference used by replies
		*/
		MessageReferenceType[MessageReferenceType["Default"] = 0] = "Default";
		/**
		* Reference used to point to a message at a point in time
		*/
		MessageReferenceType[MessageReferenceType["Forward"] = 1] = "Forward";
	})(MessageReferenceType || (exports.MessageReferenceType = MessageReferenceType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/message#message-object-message-flags}
	*/
	var MessageFlags;
	(function(MessageFlags) {
		/**
		* This message has been published to subscribed channels (via Channel Following)
		*/
		MessageFlags[MessageFlags["Crossposted"] = 1] = "Crossposted";
		/**
		* This message originated from a message in another channel (via Channel Following)
		*/
		MessageFlags[MessageFlags["IsCrosspost"] = 2] = "IsCrosspost";
		/**
		* Do not include any embeds when serializing this message
		*/
		MessageFlags[MessageFlags["SuppressEmbeds"] = 4] = "SuppressEmbeds";
		/**
		* The source message for this crosspost has been deleted (via Channel Following)
		*/
		MessageFlags[MessageFlags["SourceMessageDeleted"] = 8] = "SourceMessageDeleted";
		/**
		* This message came from the urgent message system
		*/
		MessageFlags[MessageFlags["Urgent"] = 16] = "Urgent";
		/**
		* This message has an associated thread, which shares its id
		*/
		MessageFlags[MessageFlags["HasThread"] = 32] = "HasThread";
		/**
		* This message is only visible to the user who invoked the Interaction
		*/
		MessageFlags[MessageFlags["Ephemeral"] = 64] = "Ephemeral";
		/**
		* This message is an Interaction Response and the bot is "thinking"
		*/
		MessageFlags[MessageFlags["Loading"] = 128] = "Loading";
		/**
		* This message failed to mention some roles and add their members to the thread
		*/
		MessageFlags[MessageFlags["FailedToMentionSomeRolesInThread"] = 256] = "FailedToMentionSomeRolesInThread";
		/**
		* @unstable This message flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		MessageFlags[MessageFlags["ShouldShowLinkNotDiscordWarning"] = 1024] = "ShouldShowLinkNotDiscordWarning";
		/**
		* This message will not trigger push and desktop notifications
		*/
		MessageFlags[MessageFlags["SuppressNotifications"] = 4096] = "SuppressNotifications";
		/**
		* This message is a voice message
		*/
		MessageFlags[MessageFlags["IsVoiceMessage"] = 8192] = "IsVoiceMessage";
		/**
		* This message has a snapshot (via Message Forwarding)
		*/
		MessageFlags[MessageFlags["HasSnapshot"] = 16384] = "HasSnapshot";
		/**
		* Allows you to create fully component-driven messages
		*
		* @see {@link https://discord.com/developers/docs/components/overview}
		*/
		MessageFlags[MessageFlags["IsComponentsV2"] = 32768] = "IsComponentsV2";
	})(MessageFlags || (exports.MessageFlags = MessageFlags = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/message#embed-object-embed-types}
	*/
	var EmbedType;
	(function(EmbedType) {
		/**
		* Generic embed rendered from embed attributes
		*/
		EmbedType["Rich"] = "rich";
		/**
		* Image embed
		*/
		EmbedType["Image"] = "image";
		/**
		* Video embed
		*/
		EmbedType["Video"] = "video";
		/**
		* Animated gif image embed rendered as a video embed
		*/
		EmbedType["GIFV"] = "gifv";
		/**
		* Article embed
		*/
		EmbedType["Article"] = "article";
		/**
		* Link embed
		*/
		EmbedType["Link"] = "link";
		/**
		* Auto moderation alert embed
		*
		* @unstable This embed type is currently not documented by Discord, but it is returned in the auto moderation system messages.
		*/
		EmbedType["AutoModerationMessage"] = "auto_moderation_message";
		/**
		* Poll result embed
		*/
		EmbedType["PollResult"] = "poll_result";
	})(EmbedType || (exports.EmbedType = EmbedType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure-attachment-flags}
	*/
	var AttachmentFlags;
	(function(AttachmentFlags) {
		/**
		* This attachment has been edited using the remix feature on mobile
		*/
		AttachmentFlags[AttachmentFlags["IsRemix"] = 4] = "IsRemix";
	})(AttachmentFlags || (exports.AttachmentFlags = AttachmentFlags = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/message#allowed-mentions-object-allowed-mention-types}
	*/
	var AllowedMentionsTypes;
	(function(AllowedMentionsTypes) {
		/**
		* Controls `@everyone` and `@here` mentions
		*/
		AllowedMentionsTypes["Everyone"] = "everyone";
		/**
		* Controls role mentions
		*/
		AllowedMentionsTypes["Role"] = "roles";
		/**
		* Controls user mentions
		*/
		AllowedMentionsTypes["User"] = "users";
	})(AllowedMentionsTypes || (exports.AllowedMentionsTypes = AllowedMentionsTypes = {}));
	/**
	* @see {@link https://discord.com/developers/docs/components/reference#component-object-component-types}
	*/
	var ComponentType;
	(function(ComponentType) {
		/**
		* Container to display a row of interactive components
		*/
		ComponentType[ComponentType["ActionRow"] = 1] = "ActionRow";
		/**
		* Button component
		*/
		ComponentType[ComponentType["Button"] = 2] = "Button";
		/**
		* Select menu for picking from defined text options
		*/
		ComponentType[ComponentType["StringSelect"] = 3] = "StringSelect";
		/**
		* Text Input component
		*/
		ComponentType[ComponentType["TextInput"] = 4] = "TextInput";
		/**
		* Select menu for users
		*/
		ComponentType[ComponentType["UserSelect"] = 5] = "UserSelect";
		/**
		* Select menu for roles
		*/
		ComponentType[ComponentType["RoleSelect"] = 6] = "RoleSelect";
		/**
		* Select menu for users and roles
		*/
		ComponentType[ComponentType["MentionableSelect"] = 7] = "MentionableSelect";
		/**
		* Select menu for channels
		*/
		ComponentType[ComponentType["ChannelSelect"] = 8] = "ChannelSelect";
		/**
		* Container to display text alongside an accessory component
		*/
		ComponentType[ComponentType["Section"] = 9] = "Section";
		/**
		* Markdown text
		*/
		ComponentType[ComponentType["TextDisplay"] = 10] = "TextDisplay";
		/**
		* Small image that can be used as an accessory
		*/
		ComponentType[ComponentType["Thumbnail"] = 11] = "Thumbnail";
		/**
		* Display images and other media
		*/
		ComponentType[ComponentType["MediaGallery"] = 12] = "MediaGallery";
		/**
		* Displays an attached file
		*/
		ComponentType[ComponentType["File"] = 13] = "File";
		/**
		* Component to add vertical padding between other components
		*/
		ComponentType[ComponentType["Separator"] = 14] = "Separator";
		/**
		* @unstable This component type is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		ComponentType[ComponentType["ContentInventoryEntry"] = 16] = "ContentInventoryEntry";
		/**
		* Container that visually groups a set of components
		*/
		ComponentType[ComponentType["Container"] = 17] = "Container";
		/**
		* Container associating a label and description with a component
		*/
		ComponentType[ComponentType["Label"] = 18] = "Label";
		/**
		* Component for uploading files
		*/
		ComponentType[ComponentType["FileUpload"] = 19] = "FileUpload";
		/**
		* Select menu for picking from defined text options
		*
		* @deprecated This is the old name for {@link ComponentType.StringSelect}
		*/
		ComponentType[ComponentType["SelectMenu"] = 3] = "SelectMenu";
	})(ComponentType || (exports.ComponentType = ComponentType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/components/reference#button-button-styles}
	*/
	var ButtonStyle;
	(function(ButtonStyle) {
		/**
		* The most important or recommended action in a group of options
		*/
		ButtonStyle[ButtonStyle["Primary"] = 1] = "Primary";
		/**
		* Alternative or supporting actions
		*/
		ButtonStyle[ButtonStyle["Secondary"] = 2] = "Secondary";
		/**
		* Positive confirmation or completion actions
		*/
		ButtonStyle[ButtonStyle["Success"] = 3] = "Success";
		/**
		* An action with irreversible consequences
		*/
		ButtonStyle[ButtonStyle["Danger"] = 4] = "Danger";
		/**
		* Navigates to a URL
		*/
		ButtonStyle[ButtonStyle["Link"] = 5] = "Link";
		/**
		* Purchase
		*/
		ButtonStyle[ButtonStyle["Premium"] = 6] = "Premium";
	})(ButtonStyle || (exports.ButtonStyle = ButtonStyle = {}));
	/**
	* @see {@link https://discord.com/developers/docs/components/reference#text-input-text-input-styles}
	*/
	var TextInputStyle;
	(function(TextInputStyle) {
		/**
		* Single-line input
		*/
		TextInputStyle[TextInputStyle["Short"] = 1] = "Short";
		/**
		* Multi-line input
		*/
		TextInputStyle[TextInputStyle["Paragraph"] = 2] = "Paragraph";
	})(TextInputStyle || (exports.TextInputStyle = TextInputStyle = {}));
	/**
	* @see {@link https://discord.com/developers/docs/components/reference#user-select-select-default-value-structure}
	*/
	var SelectMenuDefaultValueType;
	(function(SelectMenuDefaultValueType) {
		SelectMenuDefaultValueType["Channel"] = "channel";
		SelectMenuDefaultValueType["Role"] = "role";
		SelectMenuDefaultValueType["User"] = "user";
	})(SelectMenuDefaultValueType || (exports.SelectMenuDefaultValueType = SelectMenuDefaultValueType = {}));
	var UnfurledMediaItemLoadingState;
	(function(UnfurledMediaItemLoadingState) {
		UnfurledMediaItemLoadingState[UnfurledMediaItemLoadingState["Unknown"] = 0] = "Unknown";
		UnfurledMediaItemLoadingState[UnfurledMediaItemLoadingState["Loading"] = 1] = "Loading";
		UnfurledMediaItemLoadingState[UnfurledMediaItemLoadingState["LoadedSuccess"] = 2] = "LoadedSuccess";
		UnfurledMediaItemLoadingState[UnfurledMediaItemLoadingState["LoadedNotFound"] = 3] = "LoadedNotFound";
	})(UnfurledMediaItemLoadingState || (exports.UnfurledMediaItemLoadingState = UnfurledMediaItemLoadingState = {}));
	/**
	* @see {@link https://discord.com/developers/docs/components/reference#separator}
	*/
	var SeparatorSpacingSize;
	(function(SeparatorSpacingSize) {
		SeparatorSpacingSize[SeparatorSpacingSize["Small"] = 1] = "Small";
		SeparatorSpacingSize[SeparatorSpacingSize["Large"] = 2] = "Large";
	})(SeparatorSpacingSize || (exports.SeparatorSpacingSize = SeparatorSpacingSize = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/monetization.js
var require_monetization$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SubscriptionStatus = exports.SKUType = exports.SKUFlags = exports.EntitlementType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/monetization/entitlements#entitlement-object-entitlement-types}
	*/
	var EntitlementType;
	(function(EntitlementType) {
		/**
		* Entitlement was purchased by user
		*/
		EntitlementType[EntitlementType["Purchase"] = 1] = "Purchase";
		/**
		* Entitlement for Discord Nitro subscription
		*/
		EntitlementType[EntitlementType["PremiumSubscription"] = 2] = "PremiumSubscription";
		/**
		* Entitlement was gifted by developer
		*/
		EntitlementType[EntitlementType["DeveloperGift"] = 3] = "DeveloperGift";
		/**
		* Entitlement was purchased by a dev in application test mode
		*/
		EntitlementType[EntitlementType["TestModePurchase"] = 4] = "TestModePurchase";
		/**
		* Entitlement was granted when the SKU was free
		*/
		EntitlementType[EntitlementType["FreePurchase"] = 5] = "FreePurchase";
		/**
		* Entitlement was gifted by another user
		*/
		EntitlementType[EntitlementType["UserGift"] = 6] = "UserGift";
		/**
		* Entitlement was claimed by user for free as a Nitro Subscriber
		*/
		EntitlementType[EntitlementType["PremiumPurchase"] = 7] = "PremiumPurchase";
		/**
		* Entitlement was purchased as an app subscription
		*/
		EntitlementType[EntitlementType["ApplicationSubscription"] = 8] = "ApplicationSubscription";
	})(EntitlementType || (exports.EntitlementType = EntitlementType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/monetization/skus#sku-object-sku-flags}
	*/
	var SKUFlags;
	(function(SKUFlags) {
		/**
		* SKU is available for purchase
		*/
		SKUFlags[SKUFlags["Available"] = 4] = "Available";
		/**
		* Recurring SKU that can be purchased by a user and applied to a single server.
		* Grants access to every user in that server.
		*/
		SKUFlags[SKUFlags["GuildSubscription"] = 128] = "GuildSubscription";
		/**
		* Recurring SKU purchased by a user for themselves. Grants access to the purchasing user in every server.
		*/
		SKUFlags[SKUFlags["UserSubscription"] = 256] = "UserSubscription";
	})(SKUFlags || (exports.SKUFlags = SKUFlags = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-types}
	*/
	var SKUType;
	(function(SKUType) {
		/**
		* Durable one-time purchase
		*/
		SKUType[SKUType["Durable"] = 2] = "Durable";
		/**
		* Consumable one-time purchase
		*/
		SKUType[SKUType["Consumable"] = 3] = "Consumable";
		/**
		* Represents a recurring subscription
		*/
		SKUType[SKUType["Subscription"] = 5] = "Subscription";
		/**
		* System-generated group for each Subscription SKU created
		*/
		SKUType[SKUType["SubscriptionGroup"] = 6] = "SubscriptionGroup";
	})(SKUType || (exports.SKUType = SKUType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/subscription#subscription-statuses}
	*/
	var SubscriptionStatus;
	(function(SubscriptionStatus) {
		/**
		* Subscription is active and scheduled to renew.
		*/
		SubscriptionStatus[SubscriptionStatus["Active"] = 0] = "Active";
		/**
		* Subscription is active but will not renew.
		*/
		SubscriptionStatus[SubscriptionStatus["Ending"] = 1] = "Ending";
		/**
		* Subscription is inactive and not being charged.
		*/
		SubscriptionStatus[SubscriptionStatus["Inactive"] = 2] = "Inactive";
	})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/oauth2.js
var require_oauth2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/topics/oauth2
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.OAuth2Scopes = void 0;
	var OAuth2Scopes;
	(function(OAuth2Scopes) {
		/**
		* For oauth2 bots, this puts the bot in the user's selected guild by default
		*/
		OAuth2Scopes["Bot"] = "bot";
		/**
		* Allows {@link https://discord.com/developers/docs/resources/user#get-user-connections | `/users/@me/connections`}
		* to return linked third-party accounts
		*
		* @see {@link https://discord.com/developers/docs/resources/user#get-user-connections}
		*/
		OAuth2Scopes["Connections"] = "connections";
		/**
		* Allows your app to see information about the user's DMs and group DMs - requires Discord approval
		*/
		OAuth2Scopes["DMChannelsRead"] = "dm_channels.read";
		/**
		* Enables {@link https://discord.com/developers/docs/resources/user#get-current-user | `/users/@me`} to return an `email`
		*
		* @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
		*/
		OAuth2Scopes["Email"] = "email";
		/**
		* Allows {@link https://discord.com/developers/docs/resources/user#get-current-user | `/users/@me`} without `email`
		*
		* @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
		*/
		OAuth2Scopes["Identify"] = "identify";
		/**
		* Allows {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds | `/users/@me/guilds`}
		* to return basic information about all of a user's guilds
		*
		* @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
		*/
		OAuth2Scopes["Guilds"] = "guilds";
		/**
		* Allows {@link https://discord.com/developers/docs/resources/guild#add-guild-member | `/guilds/[guild.id]/members/[user.id]`}
		* to be used for joining users to a guild
		*
		* @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member}
		*/
		OAuth2Scopes["GuildsJoin"] = "guilds.join";
		/**
		* Allows /users/\@me/guilds/\{guild.id\}/member to return a user's member information in a guild
		*
		* @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
		*/
		OAuth2Scopes["GuildsMembersRead"] = "guilds.members.read";
		/**
		* Allows your app to join users to a group dm
		*
		* @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient}
		*/
		OAuth2Scopes["GroupDMJoins"] = "gdm.join";
		/**
		* For local rpc server api access, this allows you to read messages from all client channels
		* (otherwise restricted to channels/guilds your app creates)
		*/
		OAuth2Scopes["MessagesRead"] = "messages.read";
		/**
		* Allows your app to update a user's connection and metadata for the app
		*/
		OAuth2Scopes["RoleConnectionsWrite"] = "role_connections.write";
		/**
		* For local rpc server access, this allows you to control a user's local Discord client - requires Discord approval
		*/
		OAuth2Scopes["RPC"] = "rpc";
		/**
		* For local rpc server access, this allows you to update a user's activity - requires Discord approval
		*/
		OAuth2Scopes["RPCActivitiesWrite"] = "rpc.activities.write";
		/**
		* For local rpc server access, this allows you to read a user's voice settings and listen for voice events - requires Discord approval
		*/
		OAuth2Scopes["RPCVoiceRead"] = "rpc.voice.read";
		/**
		* For local rpc server access, this allows you to update a user's voice settings - requires Discord approval
		*/
		OAuth2Scopes["RPCVoiceWrite"] = "rpc.voice.write";
		/**
		* For local rpc server api access, this allows you to receive notifications pushed out to the user - requires Discord approval
		*/
		OAuth2Scopes["RPCNotificationsRead"] = "rpc.notifications.read";
		/**
		* This generates a webhook that is returned in the oauth token response for authorization code grants
		*/
		OAuth2Scopes["WebhookIncoming"] = "webhook.incoming";
		/**
		* Allows your app to connect to voice on user's behalf and see all the voice members - requires Discord approval
		*/
		OAuth2Scopes["Voice"] = "voice";
		/**
		* Allows your app to upload/update builds for a user's applications - requires Discord approval
		*/
		OAuth2Scopes["ApplicationsBuildsUpload"] = "applications.builds.upload";
		/**
		* Allows your app to read build data for a user's applications
		*/
		OAuth2Scopes["ApplicationsBuildsRead"] = "applications.builds.read";
		/**
		* Allows your app to read and update store data (SKUs, store listings, achievements, etc.) for a user's applications
		*/
		OAuth2Scopes["ApplicationsStoreUpdate"] = "applications.store.update";
		/**
		* Allows your app to read entitlements for a user's applications
		*/
		OAuth2Scopes["ApplicationsEntitlements"] = "applications.entitlements";
		/**
		* Allows your app to know a user's friends and implicit relationships - requires Discord approval
		*/
		OAuth2Scopes["RelationshipsRead"] = "relationships.read";
		/**
		* Allows your app to fetch data from a user's "Now Playing/Recently Played" list - requires Discord approval
		*/
		OAuth2Scopes["ActivitiesRead"] = "activities.read";
		/**
		* Allows your app to update a user's activity - requires Discord approval (NOT REQUIRED FOR GAMESDK ACTIVITY MANAGER)
		*
		* @see {@link https://discord.com/developers/docs/game-sdk/activities}
		*/
		OAuth2Scopes["ActivitiesWrite"] = "activities.write";
		/**
		* Allows your app to use Application Commands in a guild
		*
		* @see {@link https://discord.com/developers/docs/interactions/application-commands}
		*/
		OAuth2Scopes["ApplicationsCommands"] = "applications.commands";
		/**
		* Allows your app to update its Application Commands via this bearer token - client credentials grant only
		*
		* @see {@link https://discord.com/developers/docs/interactions/application-commands}
		*/
		OAuth2Scopes["ApplicationsCommandsUpdate"] = "applications.commands.update";
		/**
		* Allows your app to update permissions for its commands using a Bearer token - client credentials grant only
		*
		* @see {@link https://discord.com/developers/docs/interactions/application-commands}
		*/
		OAuth2Scopes["ApplicationCommandsPermissionsUpdate"] = "applications.commands.permissions.update";
	})(OAuth2Scopes || (exports.OAuth2Scopes = OAuth2Scopes = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/permissions.js
var require_permissions = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/topics/permissions
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RoleFlags = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
	*/
	var RoleFlags;
	(function(RoleFlags) {
		/**
		* Role can be selected by members in an onboarding prompt
		*/
		RoleFlags[RoleFlags["InPrompt"] = 1] = "InPrompt";
	})(RoleFlags || (exports.RoleFlags = RoleFlags = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/poll.js
var require_poll = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/poll
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PollLayoutType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
	*/
	var PollLayoutType;
	(function(PollLayoutType) {
		/**
		* The, uhm, default layout type
		*/
		PollLayoutType[PollLayoutType["Default"] = 1] = "Default";
	})(PollLayoutType || (exports.PollLayoutType = PollLayoutType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/stageInstance.js
var require_stageInstance = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.StageInstancePrivacyLevel = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level}
	*/
	var StageInstancePrivacyLevel;
	(function(StageInstancePrivacyLevel) {
		/**
		* The stage instance is visible publicly, such as on stage discovery
		*
		* @deprecated
		* {@link https://github.com/discord/discord-api-docs/pull/4296 | discord-api-docs#4296}
		*/
		StageInstancePrivacyLevel[StageInstancePrivacyLevel["Public"] = 1] = "Public";
		/**
		* The stage instance is visible to only guild members
		*/
		StageInstancePrivacyLevel[StageInstancePrivacyLevel["GuildOnly"] = 2] = "GuildOnly";
	})(StageInstancePrivacyLevel || (exports.StageInstancePrivacyLevel = StageInstancePrivacyLevel = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/sticker.js
var require_sticker = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/sticker
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.StickerFormatType = exports.StickerType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types}
	*/
	var StickerType;
	(function(StickerType) {
		/**
		* An official sticker in a pack
		*/
		StickerType[StickerType["Standard"] = 1] = "Standard";
		/**
		* A sticker uploaded to a guild for the guild's members
		*/
		StickerType[StickerType["Guild"] = 2] = "Guild";
	})(StickerType || (exports.StickerType = StickerType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types}
	*/
	var StickerFormatType;
	(function(StickerFormatType) {
		StickerFormatType[StickerFormatType["PNG"] = 1] = "PNG";
		StickerFormatType[StickerFormatType["APNG"] = 2] = "APNG";
		StickerFormatType[StickerFormatType["Lottie"] = 3] = "Lottie";
		StickerFormatType[StickerFormatType["GIF"] = 4] = "GIF";
	})(StickerFormatType || (exports.StickerFormatType = StickerFormatType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/teams.js
var require_teams = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/topics/teams
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TeamMemberRole = exports.TeamMemberMembershipState = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum}
	*/
	var TeamMemberMembershipState;
	(function(TeamMemberMembershipState) {
		TeamMemberMembershipState[TeamMemberMembershipState["Invited"] = 1] = "Invited";
		TeamMemberMembershipState[TeamMemberMembershipState["Accepted"] = 2] = "Accepted";
	})(TeamMemberMembershipState || (exports.TeamMemberMembershipState = TeamMemberMembershipState = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/teams#team-member-roles-team-member-role-types}
	*/
	var TeamMemberRole;
	(function(TeamMemberRole) {
		TeamMemberRole["Admin"] = "admin";
		TeamMemberRole["Developer"] = "developer";
		TeamMemberRole["ReadOnly"] = "read_only";
	})(TeamMemberRole || (exports.TeamMemberRole = TeamMemberRole = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/user.js
var require_user = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/user
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NameplatePalette = exports.ConnectionVisibility = exports.ConnectionService = exports.UserPremiumType = exports.UserFlags = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
	*/
	var UserFlags;
	(function(UserFlags) {
		/**
		* Discord Employee
		*/
		UserFlags[UserFlags["Staff"] = 1] = "Staff";
		/**
		* Partnered Server Owner
		*/
		UserFlags[UserFlags["Partner"] = 2] = "Partner";
		/**
		* HypeSquad Events Member
		*/
		UserFlags[UserFlags["Hypesquad"] = 4] = "Hypesquad";
		/**
		* Bug Hunter Level 1
		*/
		UserFlags[UserFlags["BugHunterLevel1"] = 8] = "BugHunterLevel1";
		/**
		* @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		UserFlags[UserFlags["MFASMS"] = 16] = "MFASMS";
		/**
		* @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		UserFlags[UserFlags["PremiumPromoDismissed"] = 32] = "PremiumPromoDismissed";
		/**
		* House Bravery Member
		*/
		UserFlags[UserFlags["HypeSquadOnlineHouse1"] = 64] = "HypeSquadOnlineHouse1";
		/**
		* House Brilliance Member
		*/
		UserFlags[UserFlags["HypeSquadOnlineHouse2"] = 128] = "HypeSquadOnlineHouse2";
		/**
		* House Balance Member
		*/
		UserFlags[UserFlags["HypeSquadOnlineHouse3"] = 256] = "HypeSquadOnlineHouse3";
		/**
		* Early Nitro Supporter
		*/
		UserFlags[UserFlags["PremiumEarlySupporter"] = 512] = "PremiumEarlySupporter";
		/**
		* User is a {@link https://discord.com/developers/docs/topics/teams | team}
		*/
		UserFlags[UserFlags["TeamPseudoUser"] = 1024] = "TeamPseudoUser";
		/**
		* @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		UserFlags[UserFlags["HasUnreadUrgentMessages"] = 8192] = "HasUnreadUrgentMessages";
		/**
		* Bug Hunter Level 2
		*/
		UserFlags[UserFlags["BugHunterLevel2"] = 16384] = "BugHunterLevel2";
		/**
		* Verified Bot
		*/
		UserFlags[UserFlags["VerifiedBot"] = 65536] = "VerifiedBot";
		/**
		* Early Verified Bot Developer
		*/
		UserFlags[UserFlags["VerifiedDeveloper"] = 131072] = "VerifiedDeveloper";
		/**
		* Moderator Programs Alumni
		*/
		UserFlags[UserFlags["CertifiedModerator"] = 262144] = "CertifiedModerator";
		/**
		* Bot uses only {@link https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction | HTTP interactions} and is shown in the online member list
		*/
		UserFlags[UserFlags["BotHTTPInteractions"] = 524288] = "BotHTTPInteractions";
		/**
		* User has been identified as spammer
		*
		* @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		UserFlags[UserFlags["Spammer"] = 1048576] = "Spammer";
		/**
		* @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		*/
		UserFlags[UserFlags["DisablePremium"] = 2097152] = "DisablePremium";
		/**
		* User is an {@link https://support-dev.discord.com/hc/articles/10113997751447 | Active Developer}
		*/
		UserFlags[UserFlags["ActiveDeveloper"] = 4194304] = "ActiveDeveloper";
		/**
		* User's account has been {@link https://support.discord.com/hc/articles/6461420677527 | quarantined} based on recent activity
		*
		* @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		* @privateRemarks
		*
		* This value would be `1 << 44`, but bit shifting above `1 << 30` requires bigints
		*/
		UserFlags[UserFlags["Quarantined"] = 17592186044416] = "Quarantined";
		/**
		* @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		* @privateRemarks
		*
		* This value would be `1 << 50`, but bit shifting above `1 << 30` requires bigints
		*/
		UserFlags[UserFlags["Collaborator"] = 0x4000000000000] = "Collaborator";
		/**
		* @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
		* @privateRemarks
		*
		* This value would be `1 << 51`, but bit shifting above `1 << 30` requires bigints
		*/
		UserFlags[UserFlags["RestrictedCollaborator"] = 0x8000000000000] = "RestrictedCollaborator";
	})(UserFlags || (exports.UserFlags = UserFlags = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
	*/
	var UserPremiumType;
	(function(UserPremiumType) {
		UserPremiumType[UserPremiumType["None"] = 0] = "None";
		UserPremiumType[UserPremiumType["NitroClassic"] = 1] = "NitroClassic";
		UserPremiumType[UserPremiumType["Nitro"] = 2] = "Nitro";
		UserPremiumType[UserPremiumType["NitroBasic"] = 3] = "NitroBasic";
	})(UserPremiumType || (exports.UserPremiumType = UserPremiumType = {}));
	var ConnectionService;
	(function(ConnectionService) {
		ConnectionService["AmazonMusic"] = "amazon-music";
		ConnectionService["BattleNet"] = "battlenet";
		ConnectionService["Bluesky"] = "bluesky";
		ConnectionService["BungieNet"] = "bungie";
		ConnectionService["Crunchyroll"] = "crunchyroll";
		ConnectionService["Domain"] = "domain";
		ConnectionService["eBay"] = "ebay";
		ConnectionService["EpicGames"] = "epicgames";
		ConnectionService["Facebook"] = "facebook";
		ConnectionService["GitHub"] = "github";
		ConnectionService["Instagram"] = "instagram";
		ConnectionService["LeagueOfLegends"] = "leagueoflegends";
		ConnectionService["Mastodon"] = "mastodon";
		ConnectionService["PayPal"] = "paypal";
		ConnectionService["PlayStationNetwork"] = "playstation";
		ConnectionService["Reddit"] = "reddit";
		ConnectionService["RiotGames"] = "riotgames";
		ConnectionService["Roblox"] = "roblox";
		ConnectionService["Spotify"] = "spotify";
		ConnectionService["Skype"] = "skype";
		ConnectionService["Steam"] = "steam";
		ConnectionService["TikTok"] = "tiktok";
		ConnectionService["Twitch"] = "twitch";
		ConnectionService["X"] = "twitter";
		/**
		* @deprecated This is the old name for {@link ConnectionService.X}
		*/
		ConnectionService["Twitter"] = "twitter";
		ConnectionService["Xbox"] = "xbox";
		ConnectionService["YouTube"] = "youtube";
	})(ConnectionService || (exports.ConnectionService = ConnectionService = {}));
	var ConnectionVisibility;
	(function(ConnectionVisibility) {
		/**
		* Invisible to everyone except the user themselves
		*/
		ConnectionVisibility[ConnectionVisibility["None"] = 0] = "None";
		/**
		* Visible to everyone
		*/
		ConnectionVisibility[ConnectionVisibility["Everyone"] = 1] = "Everyone";
	})(ConnectionVisibility || (exports.ConnectionVisibility = ConnectionVisibility = {}));
	/**
	* Background color of a nameplate.
	*/
	var NameplatePalette;
	(function(NameplatePalette) {
		NameplatePalette["Berry"] = "berry";
		NameplatePalette["BubbleGum"] = "bubble_gum";
		NameplatePalette["Clover"] = "clover";
		NameplatePalette["Cobalt"] = "cobalt";
		NameplatePalette["Crimson"] = "crimson";
		NameplatePalette["Forest"] = "forest";
		NameplatePalette["Lemon"] = "lemon";
		NameplatePalette["Sky"] = "sky";
		NameplatePalette["Teal"] = "teal";
		NameplatePalette["Violet"] = "violet";
		NameplatePalette["White"] = "white";
	})(NameplatePalette || (exports.NameplatePalette = NameplatePalette = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/webhook.js
var require_webhook = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Types extracted from https://discord.com/developers/docs/resources/webhook
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WebhookType = exports.ApplicationWebhookEventType = exports.ApplicationWebhookType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/events/webhook-events#webhook-types}
	*/
	var ApplicationWebhookType;
	(function(ApplicationWebhookType) {
		/**
		* PING event sent to verify your Webhook Event URL is active
		*/
		ApplicationWebhookType[ApplicationWebhookType["Ping"] = 0] = "Ping";
		/**
		* Webhook event (details for event in event body object)
		*/
		ApplicationWebhookType[ApplicationWebhookType["Event"] = 1] = "Event";
	})(ApplicationWebhookType || (exports.ApplicationWebhookType = ApplicationWebhookType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/events/webhook-events#event-types}
	*/
	var ApplicationWebhookEventType;
	(function(ApplicationWebhookEventType) {
		/**
		* Sent when an app was authorized by a user to a server or their account
		*/
		ApplicationWebhookEventType["ApplicationAuthorized"] = "APPLICATION_AUTHORIZED";
		/**
		* Sent when an app was deauthorized by a user
		*/
		ApplicationWebhookEventType["ApplicationDeauthorized"] = "APPLICATION_DEAUTHORIZED";
		/**
		* Entitlement was created
		*/
		ApplicationWebhookEventType["EntitlementCreate"] = "ENTITLEMENT_CREATE";
		/**
		* Entitlement was updated
		*
		* @unstable This event is not yet documented but can be enabled from the developer portal
		*/
		ApplicationWebhookEventType["EntitlementUpdate"] = "ENTITLEMENT_UPDATE";
		/**
		* Entitlement was deleted
		*
		* @unstable This event is not yet documented but can be enabled from the developer portal
		*/
		ApplicationWebhookEventType["EntitlementDelete"] = "ENTITLEMENT_DELETE";
		/**
		* User was added to a Quest (currently unavailable)
		*/
		ApplicationWebhookEventType["QuestUserEnrollment"] = "QUEST_USER_ENROLLMENT";
	})(ApplicationWebhookEventType || (exports.ApplicationWebhookEventType = ApplicationWebhookEventType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
	*/
	var WebhookType;
	(function(WebhookType) {
		/**
		* Incoming Webhooks can post messages to channels with a generated token
		*/
		WebhookType[WebhookType["Incoming"] = 1] = "Incoming";
		/**
		* Channel Follower Webhooks are internal webhooks used with Channel Following to post new messages into channels
		*/
		WebhookType[WebhookType["ChannelFollower"] = 2] = "ChannelFollower";
		/**
		* Application webhooks are webhooks used with Interactions
		*/
		WebhookType[WebhookType["Application"] = 3] = "Application";
	})(WebhookType || (exports.WebhookType = WebhookType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/payloads/v10/index.js
var require_v10$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$4) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$4, p)) __createBinding(exports$4, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_common$2(), exports);
	__exportStar(require_application(), exports);
	__exportStar(require_auditLog(), exports);
	__exportStar(require_autoModeration(), exports);
	__exportStar(require_channel$1(), exports);
	__exportStar(require_gateway(), exports);
	__exportStar(require_guild(), exports);
	__exportStar(require_guildScheduledEvent(), exports);
	__exportStar(require_interactions(), exports);
	__exportStar(require_invite(), exports);
	__exportStar(require_message(), exports);
	__exportStar(require_monetization$1(), exports);
	__exportStar(require_oauth2(), exports);
	__exportStar(require_permissions(), exports);
	__exportStar(require_poll(), exports);
	__exportStar(require_stageInstance(), exports);
	__exportStar(require_sticker(), exports);
	__exportStar(require_teams(), exports);
	__exportStar(require_user(), exports);
	__exportStar(require_webhook(), exports);
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/utils/internals.js
var require_internals = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.urlSafeCharacters = void 0;
	const pattern = /^[\d%A-Za-z-_]+$/g;
	exports.urlSafeCharacters = { test(input) {
		const result = pattern.test(input);
		pattern.lastIndex = 0;
		return result;
	} };
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/rest/common.js
var require_common$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Locale = exports.RESTJSONErrorCodes = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes}
	*/
	var RESTJSONErrorCodes;
	(function(RESTJSONErrorCodes) {
		RESTJSONErrorCodes[RESTJSONErrorCodes["GeneralError"] = 0] = "GeneralError";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownAccount"] = 10001] = "UnknownAccount";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownApplication"] = 10002] = "UnknownApplication";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownChannel"] = 10003] = "UnknownChannel";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuild"] = 10004] = "UnknownGuild";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownIntegration"] = 10005] = "UnknownIntegration";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownInvite"] = 10006] = "UnknownInvite";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownMember"] = 10007] = "UnknownMember";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownMessage"] = 10008] = "UnknownMessage";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownPermissionOverwrite"] = 10009] = "UnknownPermissionOverwrite";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownProvider"] = 10010] = "UnknownProvider";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownRole"] = 10011] = "UnknownRole";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownToken"] = 10012] = "UnknownToken";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownUser"] = 10013] = "UnknownUser";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownEmoji"] = 10014] = "UnknownEmoji";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownWebhook"] = 10015] = "UnknownWebhook";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownWebhookService"] = 10016] = "UnknownWebhookService";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownSession"] = 10020] = "UnknownSession";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownAsset"] = 10021] = "UnknownAsset";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownBan"] = 10026] = "UnknownBan";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownSKU"] = 10027] = "UnknownSKU";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownStoreListing"] = 10028] = "UnknownStoreListing";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownEntitlement"] = 10029] = "UnknownEntitlement";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownBuild"] = 10030] = "UnknownBuild";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownLobby"] = 10031] = "UnknownLobby";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownBranch"] = 10032] = "UnknownBranch";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownStoreDirectoryLayout"] = 10033] = "UnknownStoreDirectoryLayout";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownRedistributable"] = 10036] = "UnknownRedistributable";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGiftCode"] = 10038] = "UnknownGiftCode";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownStream"] = 10049] = "UnknownStream";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownPremiumServerSubscribeCooldown"] = 10050] = "UnknownPremiumServerSubscribeCooldown";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildTemplate"] = 10057] = "UnknownGuildTemplate";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownDiscoverableServerCategory"] = 10059] = "UnknownDiscoverableServerCategory";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownSticker"] = 10060] = "UnknownSticker";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownStickerPack"] = 10061] = "UnknownStickerPack";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownInteraction"] = 10062] = "UnknownInteraction";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownApplicationCommand"] = 10063] = "UnknownApplicationCommand";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownVoiceState"] = 10065] = "UnknownVoiceState";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownApplicationCommandPermissions"] = 10066] = "UnknownApplicationCommandPermissions";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownStageInstance"] = 10067] = "UnknownStageInstance";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildMemberVerificationForm"] = 10068] = "UnknownGuildMemberVerificationForm";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildWelcomeScreen"] = 10069] = "UnknownGuildWelcomeScreen";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildScheduledEvent"] = 10070] = "UnknownGuildScheduledEvent";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildScheduledEventUser"] = 10071] = "UnknownGuildScheduledEventUser";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownTag"] = 10087] = "UnknownTag";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownSound"] = 10097] = "UnknownSound";
		RESTJSONErrorCodes[RESTJSONErrorCodes["BotsCannotUseThisEndpoint"] = 20001] = "BotsCannotUseThisEndpoint";
		RESTJSONErrorCodes[RESTJSONErrorCodes["OnlyBotsCanUseThisEndpoint"] = 20002] = "OnlyBotsCanUseThisEndpoint";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ExplicitContentCannotBeSentToTheDesiredRecipient"] = 20009] = "ExplicitContentCannotBeSentToTheDesiredRecipient";
		RESTJSONErrorCodes[RESTJSONErrorCodes["NotAuthorizedToPerformThisActionOnThisApplication"] = 20012] = "NotAuthorizedToPerformThisActionOnThisApplication";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ActionCannotBePerformedDueToSlowmodeRateLimit"] = 20016] = "ActionCannotBePerformedDueToSlowmodeRateLimit";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TheMazeIsntMeantForYou"] = 20017] = "TheMazeIsntMeantForYou";
		RESTJSONErrorCodes[RESTJSONErrorCodes["OnlyTheOwnerOfThisAccountCanPerformThisAction"] = 20018] = "OnlyTheOwnerOfThisAccountCanPerformThisAction";
		RESTJSONErrorCodes[RESTJSONErrorCodes["AnnouncementEditLimitExceeded"] = 20022] = "AnnouncementEditLimitExceeded";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UnderMinimumAge"] = 20024] = "UnderMinimumAge";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ChannelSendRateLimit"] = 20028] = "ChannelSendRateLimit";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ServerSendRateLimit"] = 20029] = "ServerSendRateLimit";
		RESTJSONErrorCodes[RESTJSONErrorCodes["StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords"] = 20031] = "StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords";
		RESTJSONErrorCodes[RESTJSONErrorCodes["GuildPremiumSubscriptionLevelTooLow"] = 20035] = "GuildPremiumSubscriptionLevelTooLow";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfGuildsReached"] = 30001] = "MaximumNumberOfGuildsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfFriendsReached"] = 30002] = "MaximumNumberOfFriendsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfPinsReachedForTheChannel"] = 30003] = "MaximumNumberOfPinsReachedForTheChannel";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfRecipientsReached"] = 30004] = "MaximumNumberOfRecipientsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfGuildRolesReached"] = 30005] = "MaximumNumberOfGuildRolesReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfWebhooksReached"] = 30007] = "MaximumNumberOfWebhooksReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfEmojisReached"] = 30008] = "MaximumNumberOfEmojisReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfReactionsReached"] = 30010] = "MaximumNumberOfReactionsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfGroupDMsReached"] = 30011] = "MaximumNumberOfGroupDMsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfGuildChannelsReached"] = 30013] = "MaximumNumberOfGuildChannelsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfAttachmentsInAMessageReached"] = 30015] = "MaximumNumberOfAttachmentsInAMessageReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfInvitesReached"] = 30016] = "MaximumNumberOfInvitesReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfAnimatedEmojisReached"] = 30018] = "MaximumNumberOfAnimatedEmojisReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfServerMembersReached"] = 30019] = "MaximumNumberOfServerMembersReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfServerCategoriesReached"] = 30030] = "MaximumNumberOfServerCategoriesReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["GuildAlreadyHasTemplate"] = 30031] = "GuildAlreadyHasTemplate";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfApplicationCommandsReached"] = 30032] = "MaximumNumberOfApplicationCommandsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumThreadParticipantsReached"] = 30033] = "MaximumThreadParticipantsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumDailyApplicationCommandCreatesReached"] = 30034] = "MaximumDailyApplicationCommandCreatesReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfNonGuildMemberBansHasBeenExceeded"] = 30035] = "MaximumNumberOfNonGuildMemberBansHasBeenExceeded";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfBanFetchesHasBeenReached"] = 30037] = "MaximumNumberOfBanFetchesHasBeenReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfUncompletedGuildScheduledEventsReached"] = 30038] = "MaximumNumberOfUncompletedGuildScheduledEventsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfStickersReached"] = 30039] = "MaximumNumberOfStickersReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfPruneRequestsHasBeenReached"] = 30040] = "MaximumNumberOfPruneRequestsHasBeenReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached"] = 30042] = "MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfSoundboardSoundsReached"] = 30045] = "MaximumNumberOfSoundboardSoundsReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfEditsToMessagesOlderThanOneHourReached"] = 30046] = "MaximumNumberOfEditsToMessagesOlderThanOneHourReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfPinnedThreadsInForumHasBeenReached"] = 30047] = "MaximumNumberOfPinnedThreadsInForumHasBeenReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfTagsInForumHasBeenReached"] = 30048] = "MaximumNumberOfTagsInForumHasBeenReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["BitrateIsTooHighForChannelOfThisType"] = 30052] = "BitrateIsTooHighForChannelOfThisType";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfPremiumEmojisReached"] = 30056] = "MaximumNumberOfPremiumEmojisReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfWebhooksPerGuildReached"] = 30058] = "MaximumNumberOfWebhooksPerGuildReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfChannelPermissionOverwritesReached"] = 30060] = "MaximumNumberOfChannelPermissionOverwritesReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TheChannelsForThisGuildAreTooLarge"] = 30061] = "TheChannelsForThisGuildAreTooLarge";
		RESTJSONErrorCodes[RESTJSONErrorCodes["Unauthorized"] = 40001] = "Unauthorized";
		RESTJSONErrorCodes[RESTJSONErrorCodes["VerifyYourAccount"] = 40002] = "VerifyYourAccount";
		RESTJSONErrorCodes[RESTJSONErrorCodes["OpeningDirectMessagesTooFast"] = 40003] = "OpeningDirectMessagesTooFast";
		RESTJSONErrorCodes[RESTJSONErrorCodes["SendMessagesHasBeenTemporarilyDisabled"] = 40004] = "SendMessagesHasBeenTemporarilyDisabled";
		RESTJSONErrorCodes[RESTJSONErrorCodes["RequestEntityTooLarge"] = 40005] = "RequestEntityTooLarge";
		RESTJSONErrorCodes[RESTJSONErrorCodes["FeatureTemporarilyDisabledServerSide"] = 40006] = "FeatureTemporarilyDisabledServerSide";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UserBannedFromThisGuild"] = 40007] = "UserBannedFromThisGuild";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ConnectionHasBeenRevoked"] = 40012] = "ConnectionHasBeenRevoked";
		RESTJSONErrorCodes[RESTJSONErrorCodes["OnlyConsumableSKUsCanBeConsumed"] = 40018] = "OnlyConsumableSKUsCanBeConsumed";
		RESTJSONErrorCodes[RESTJSONErrorCodes["YouCanOnlyDeleteSandboxEntitlements"] = 40019] = "YouCanOnlyDeleteSandboxEntitlements";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TargetUserIsNotConnectedToVoice"] = 40032] = "TargetUserIsNotConnectedToVoice";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ThisMessageWasAlreadyCrossposted"] = 40033] = "ThisMessageWasAlreadyCrossposted";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ApplicationCommandWithThatNameAlreadyExists"] = 40041] = "ApplicationCommandWithThatNameAlreadyExists";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ApplicationInteractionFailedToSend"] = 40043] = "ApplicationInteractionFailedToSend";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotSendAMessageInAForumChannel"] = 40058] = "CannotSendAMessageInAForumChannel";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InteractionHasAlreadyBeenAcknowledged"] = 40060] = "InteractionHasAlreadyBeenAcknowledged";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TagNamesMustBeUnique"] = 40061] = "TagNamesMustBeUnique";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ServiceResourceIsBeingRateLimited"] = 40062] = "ServiceResourceIsBeingRateLimited";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ThereAreNoTagsAvailableThatCanBeSetByNonModerators"] = 40066] = "ThereAreNoTagsAvailableThatCanBeSetByNonModerators";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TagRequiredToCreateAForumPostInThisChannel"] = 40067] = "TagRequiredToCreateAForumPostInThisChannel";
		RESTJSONErrorCodes[RESTJSONErrorCodes["AnEntitlementHasAlreadyBeenGrantedForThisResource"] = 40074] = "AnEntitlementHasAlreadyBeenGrantedForThisResource";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ThisInteractionHasHitTheMaximumNumberOfFollowUpMessages"] = 40094] = "ThisInteractionHasHitTheMaximumNumberOfFollowUpMessages";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CloudflareIsBlockingYourRequest"] = 40333] = "CloudflareIsBlockingYourRequest";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MissingAccess"] = 50001] = "MissingAccess";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidAccountType"] = 50002] = "InvalidAccountType";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotExecuteActionOnDMChannel"] = 50003] = "CannotExecuteActionOnDMChannel";
		RESTJSONErrorCodes[RESTJSONErrorCodes["GuildWidgetDisabled"] = 50004] = "GuildWidgetDisabled";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotEditMessageAuthoredByAnotherUser"] = 50005] = "CannotEditMessageAuthoredByAnotherUser";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotSendAnEmptyMessage"] = 50006] = "CannotSendAnEmptyMessage";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotSendMessagesToThisUser"] = 50007] = "CannotSendMessagesToThisUser";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotSendMessagesInNonTextChannel"] = 50008] = "CannotSendMessagesInNonTextChannel";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ChannelVerificationLevelTooHighForYouToGainAccess"] = 50009] = "ChannelVerificationLevelTooHighForYouToGainAccess";
		RESTJSONErrorCodes[RESTJSONErrorCodes["OAuth2ApplicationDoesNotHaveBot"] = 50010] = "OAuth2ApplicationDoesNotHaveBot";
		RESTJSONErrorCodes[RESTJSONErrorCodes["OAuth2ApplicationLimitReached"] = 50011] = "OAuth2ApplicationLimitReached";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidOAuth2State"] = 50012] = "InvalidOAuth2State";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MissingPermissions"] = 50013] = "MissingPermissions";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidToken"] = 50014] = "InvalidToken";
		RESTJSONErrorCodes[RESTJSONErrorCodes["NoteWasTooLong"] = 50015] = "NoteWasTooLong";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ProvidedTooFewOrTooManyMessagesToDelete"] = 50016] = "ProvidedTooFewOrTooManyMessagesToDelete";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidMFALevel"] = 50017] = "InvalidMFALevel";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MessageCanOnlyBePinnedInTheChannelItWasSentIn"] = 50019] = "MessageCanOnlyBePinnedInTheChannelItWasSentIn";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InviteCodeInvalidOrTaken"] = 50020] = "InviteCodeInvalidOrTaken";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotExecuteActionOnSystemMessage"] = 50021] = "CannotExecuteActionOnSystemMessage";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotExecuteActionOnThisChannelType"] = 50024] = "CannotExecuteActionOnThisChannelType";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidOAuth2AccessToken"] = 50025] = "InvalidOAuth2AccessToken";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MissingRequiredOAuth2Scope"] = 50026] = "MissingRequiredOAuth2Scope";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidWebhookToken"] = 50027] = "InvalidWebhookToken";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidRole"] = 50028] = "InvalidRole";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidRecipients"] = 50033] = "InvalidRecipients";
		RESTJSONErrorCodes[RESTJSONErrorCodes["OneOfTheMessagesProvidedWasTooOldForBulkDelete"] = 50034] = "OneOfTheMessagesProvidedWasTooOldForBulkDelete";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidFormBodyOrContentType"] = 50035] = "InvalidFormBodyOrContentType";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InviteAcceptedToGuildWithoutTheBotBeingIn"] = 50036] = "InviteAcceptedToGuildWithoutTheBotBeingIn";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidActivityAction"] = 50039] = "InvalidActivityAction";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidAPIVersion"] = 50041] = "InvalidAPIVersion";
		RESTJSONErrorCodes[RESTJSONErrorCodes["FileUploadedExceedsMaximumSize"] = 50045] = "FileUploadedExceedsMaximumSize";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidFileUploaded"] = 50046] = "InvalidFileUploaded";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotSelfRedeemThisGift"] = 50054] = "CannotSelfRedeemThisGift";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidGuild"] = 50055] = "InvalidGuild";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidSKU"] = 50057] = "InvalidSKU";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidRequestOrigin"] = 50067] = "InvalidRequestOrigin";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidMessageType"] = 50068] = "InvalidMessageType";
		RESTJSONErrorCodes[RESTJSONErrorCodes["PaymentSourceRequiredToRedeemGift"] = 50070] = "PaymentSourceRequiredToRedeemGift";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotModifyASystemWebhook"] = 50073] = "CannotModifyASystemWebhook";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotDeleteChannelRequiredForCommunityGuilds"] = 50074] = "CannotDeleteChannelRequiredForCommunityGuilds";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotEditStickersWithinMessage"] = 50080] = "CannotEditStickersWithinMessage";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidStickerSent"] = 50081] = "InvalidStickerSent";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidActionOnArchivedThread"] = 50083] = "InvalidActionOnArchivedThread";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidThreadNotificationSettings"] = 50084] = "InvalidThreadNotificationSettings";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ParameterEarlierThanCreation"] = 50085] = "ParameterEarlierThanCreation";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CommunityServerChannelsMustBeTextChannels"] = 50086] = "CommunityServerChannelsMustBeTextChannels";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor"] = 50091] = "TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ServerNotAvailableInYourLocation"] = 50095] = "ServerNotAvailableInYourLocation";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ServerNeedsMonetizationEnabledToPerformThisAction"] = 50097] = "ServerNeedsMonetizationEnabledToPerformThisAction";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ServerNeedsMoreBoostsToPerformThisAction"] = 50101] = "ServerNeedsMoreBoostsToPerformThisAction";
		RESTJSONErrorCodes[RESTJSONErrorCodes["RequestBodyContainsInvalidJSON"] = 50109] = "RequestBodyContainsInvalidJSON";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ProvidedFileIsInvalid"] = 50110] = "ProvidedFileIsInvalid";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ProvidedFileTypeIsInvalid"] = 50123] = "ProvidedFileTypeIsInvalid";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ProvidedFileDurationExceedsMaximumLength"] = 50124] = "ProvidedFileDurationExceedsMaximumLength";
		RESTJSONErrorCodes[RESTJSONErrorCodes["OwnerCannotBePendingMember"] = 50131] = "OwnerCannotBePendingMember";
		RESTJSONErrorCodes[RESTJSONErrorCodes["OwnershipCannotBeMovedToABotUser"] = 50132] = "OwnershipCannotBeMovedToABotUser";
		RESTJSONErrorCodes[RESTJSONErrorCodes["FailedToResizeAssetBelowTheMinimumSize"] = 50138] = "FailedToResizeAssetBelowTheMinimumSize";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji"] = 50144] = "CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotConvertBetweenPremiumEmojiAndNormalEmoji"] = 50145] = "CannotConvertBetweenPremiumEmojiAndNormalEmoji";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UploadedFileNotFound"] = 50146] = "UploadedFileNotFound";
		RESTJSONErrorCodes[RESTJSONErrorCodes["SpecifiedEmojiIsInvalid"] = 50151] = "SpecifiedEmojiIsInvalid";
		RESTJSONErrorCodes[RESTJSONErrorCodes["VoiceMessagesDoNotSupportAdditionalContent"] = 50159] = "VoiceMessagesDoNotSupportAdditionalContent";
		RESTJSONErrorCodes[RESTJSONErrorCodes["VoiceMessagesMustHaveASingleAudioAttachment"] = 50160] = "VoiceMessagesMustHaveASingleAudioAttachment";
		RESTJSONErrorCodes[RESTJSONErrorCodes["VoiceMessagesMustHaveSupportingMetadata"] = 50161] = "VoiceMessagesMustHaveSupportingMetadata";
		RESTJSONErrorCodes[RESTJSONErrorCodes["VoiceMessagesCannotBeEdited"] = 50162] = "VoiceMessagesCannotBeEdited";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotDeleteGuildSubscriptionIntegration"] = 50163] = "CannotDeleteGuildSubscriptionIntegration";
		RESTJSONErrorCodes[RESTJSONErrorCodes["YouCannotSendVoiceMessagesInThisChannel"] = 50173] = "YouCannotSendVoiceMessagesInThisChannel";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TheUserAccountMustFirstBeVerified"] = 50178] = "TheUserAccountMustFirstBeVerified";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ProvidedFileDoesNotHaveAValidDuration"] = 50192] = "ProvidedFileDoesNotHaveAValidDuration";
		RESTJSONErrorCodes[RESTJSONErrorCodes["YouDoNotHavePermissionToSendThisSticker"] = 50600] = "YouDoNotHavePermissionToSendThisSticker";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TwoFactorAuthenticationIsRequired"] = 60003] = "TwoFactorAuthenticationIsRequired";
		RESTJSONErrorCodes[RESTJSONErrorCodes["NoUsersWithDiscordTagExist"] = 80004] = "NoUsersWithDiscordTagExist";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ReactionWasBlocked"] = 90001] = "ReactionWasBlocked";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UserCannotUseBurstReactions"] = 90002] = "UserCannotUseBurstReactions";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ApplicationNotYetAvailable"] = 110001] = "ApplicationNotYetAvailable";
		RESTJSONErrorCodes[RESTJSONErrorCodes["APIResourceOverloaded"] = 13e4] = "APIResourceOverloaded";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TheStageIsAlreadyOpen"] = 150006] = "TheStageIsAlreadyOpen";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotReplyWithoutPermissionToReadMessageHistory"] = 160002] = "CannotReplyWithoutPermissionToReadMessageHistory";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ThreadAlreadyCreatedForMessage"] = 160004] = "ThreadAlreadyCreatedForMessage";
		RESTJSONErrorCodes[RESTJSONErrorCodes["ThreadLocked"] = 160005] = "ThreadLocked";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumActiveThreads"] = 160006] = "MaximumActiveThreads";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumActiveAnnouncementThreads"] = 160007] = "MaximumActiveAnnouncementThreads";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidJSONForUploadedLottieFile"] = 170001] = "InvalidJSONForUploadedLottieFile";
		RESTJSONErrorCodes[RESTJSONErrorCodes["UploadedLottiesCannotContainRasterizedImages"] = 170002] = "UploadedLottiesCannotContainRasterizedImages";
		RESTJSONErrorCodes[RESTJSONErrorCodes["StickerMaximumFramerateExceeded"] = 170003] = "StickerMaximumFramerateExceeded";
		RESTJSONErrorCodes[RESTJSONErrorCodes["StickerFrameCountExceedsMaximumOf1000Frames"] = 170004] = "StickerFrameCountExceedsMaximumOf1000Frames";
		RESTJSONErrorCodes[RESTJSONErrorCodes["LottieAnimationMaximumDimensionsExceeded"] = 170005] = "LottieAnimationMaximumDimensionsExceeded";
		RESTJSONErrorCodes[RESTJSONErrorCodes["StickerFramerateIsTooSmallOrTooLarge"] = 170006] = "StickerFramerateIsTooSmallOrTooLarge";
		RESTJSONErrorCodes[RESTJSONErrorCodes["StickerAnimationDurationExceedsMaximumOf5Seconds"] = 170007] = "StickerAnimationDurationExceedsMaximumOf5Seconds";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotUpdateAFinishedEvent"] = 18e4] = "CannotUpdateAFinishedEvent";
		RESTJSONErrorCodes[RESTJSONErrorCodes["FailedToCreateStageNeededForStageEvent"] = 180002] = "FailedToCreateStageNeededForStageEvent";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MessageWasBlockedByAutomaticModeration"] = 2e5] = "MessageWasBlockedByAutomaticModeration";
		RESTJSONErrorCodes[RESTJSONErrorCodes["TitleWasBlockedByAutomaticModeration"] = 200001] = "TitleWasBlockedByAutomaticModeration";
		RESTJSONErrorCodes[RESTJSONErrorCodes["WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId"] = 220001] = "WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId";
		RESTJSONErrorCodes[RESTJSONErrorCodes["WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId"] = 220002] = "WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId";
		RESTJSONErrorCodes[RESTJSONErrorCodes["WebhooksCanOnlyCreateThreadsInForumChannels"] = 220003] = "WebhooksCanOnlyCreateThreadsInForumChannels";
		RESTJSONErrorCodes[RESTJSONErrorCodes["WebhookServicesCannotBeUsedInForumChannels"] = 220004] = "WebhookServicesCannotBeUsedInForumChannels";
		RESTJSONErrorCodes[RESTJSONErrorCodes["MessageBlockedByHarmfulLinksFilter"] = 24e4] = "MessageBlockedByHarmfulLinksFilter";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotEnableOnboardingRequirementsAreNotMet"] = 35e4] = "CannotEnableOnboardingRequirementsAreNotMet";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotUpdateOnboardingWhileBelowRequirements"] = 350001] = "CannotUpdateOnboardingWhileBelowRequirements";
		RESTJSONErrorCodes[RESTJSONErrorCodes["AccessToFileUploadsHasBeenLimitedForThisGuild"] = 400001] = "AccessToFileUploadsHasBeenLimitedForThisGuild";
		RESTJSONErrorCodes[RESTJSONErrorCodes["FailedToBanUsers"] = 5e5] = "FailedToBanUsers";
		RESTJSONErrorCodes[RESTJSONErrorCodes["PollVotingBlocked"] = 52e4] = "PollVotingBlocked";
		RESTJSONErrorCodes[RESTJSONErrorCodes["PollExpired"] = 520001] = "PollExpired";
		RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidChannelTypeForPollCreation"] = 520002] = "InvalidChannelTypeForPollCreation";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotEditAPollMessage"] = 520003] = "CannotEditAPollMessage";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotUseAnEmojiIncludedWithThePoll"] = 520004] = "CannotUseAnEmojiIncludedWithThePoll";
		RESTJSONErrorCodes[RESTJSONErrorCodes["CannotExpireANonPollMessage"] = 520006] = "CannotExpireANonPollMessage";
	})(RESTJSONErrorCodes || (exports.RESTJSONErrorCodes = RESTJSONErrorCodes = {}));
	/**
	* @see {@link https://discord.com/developers/docs/reference#locales}
	*/
	var Locale;
	(function(Locale) {
		Locale["Indonesian"] = "id";
		Locale["EnglishUS"] = "en-US";
		Locale["EnglishGB"] = "en-GB";
		Locale["Bulgarian"] = "bg";
		Locale["ChineseCN"] = "zh-CN";
		Locale["ChineseTW"] = "zh-TW";
		Locale["Croatian"] = "hr";
		Locale["Czech"] = "cs";
		Locale["Danish"] = "da";
		Locale["Dutch"] = "nl";
		Locale["Finnish"] = "fi";
		Locale["French"] = "fr";
		Locale["German"] = "de";
		Locale["Greek"] = "el";
		Locale["Hindi"] = "hi";
		Locale["Hungarian"] = "hu";
		Locale["Italian"] = "it";
		Locale["Japanese"] = "ja";
		Locale["Korean"] = "ko";
		Locale["Lithuanian"] = "lt";
		Locale["Norwegian"] = "no";
		Locale["Polish"] = "pl";
		Locale["PortugueseBR"] = "pt-BR";
		Locale["Romanian"] = "ro";
		Locale["Russian"] = "ru";
		Locale["SpanishES"] = "es-ES";
		Locale["SpanishLATAM"] = "es-419";
		Locale["Swedish"] = "sv-SE";
		Locale["Thai"] = "th";
		Locale["Turkish"] = "tr";
		Locale["Ukrainian"] = "uk";
		Locale["Vietnamese"] = "vi";
	})(Locale || (exports.Locale = Locale = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/rest/v10/channel.js
var require_channel = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ReactionType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/channel#get-reactions-reaction-types}
	*/
	var ReactionType;
	(function(ReactionType) {
		ReactionType[ReactionType["Normal"] = 0] = "Normal";
		ReactionType[ReactionType["Super"] = 1] = "Super";
	})(ReactionType || (exports.ReactionType = ReactionType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/rest/v10/monetization.js
var require_monetization = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EntitlementOwnerType = void 0;
	/**
	* @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement}
	*/
	var EntitlementOwnerType;
	(function(EntitlementOwnerType) {
		EntitlementOwnerType[EntitlementOwnerType["Guild"] = 1] = "Guild";
		EntitlementOwnerType[EntitlementOwnerType["User"] = 2] = "User";
	})(EntitlementOwnerType || (exports.EntitlementOwnerType = EntitlementOwnerType = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/rest/v10/index.js
var require_v10$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$3) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$3, p)) __createBinding(exports$3, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.OAuth2Routes = exports.RouteBases = exports.CDNRoutes = exports.ImageFormat = exports.StickerPackApplicationId = exports.Routes = exports.APIVersion = void 0;
	const internals_1 = require_internals();
	__exportStar(require_common$1(), exports);
	__exportStar(require_channel(), exports);
	__exportStar(require_monetization(), exports);
	exports.APIVersion = "10";
	exports.Routes = {
		applicationRoleConnectionMetadata(applicationId) {
			return `/applications/${applicationId}/role-connections/metadata`;
		},
		guildAutoModerationRules(guildId) {
			return `/guilds/${guildId}/auto-moderation/rules`;
		},
		guildAutoModerationRule(guildId, ruleId) {
			return `/guilds/${guildId}/auto-moderation/rules/${ruleId}`;
		},
		guildAuditLog(guildId) {
			return `/guilds/${guildId}/audit-logs`;
		},
		channel(channelId) {
			return `/channels/${channelId}`;
		},
		channelMessages(channelId) {
			return `/channels/${channelId}/messages`;
		},
		channelMessage(channelId, messageId) {
			return `/channels/${channelId}/messages/${messageId}`;
		},
		channelMessageCrosspost(channelId, messageId) {
			return `/channels/${channelId}/messages/${messageId}/crosspost`;
		},
		channelMessageOwnReaction(channelId, messageId, emoji) {
			return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`;
		},
		channelMessageUserReaction(channelId, messageId, emoji, userId) {
			return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}`;
		},
		channelMessageReaction(channelId, messageId, emoji) {
			return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}`;
		},
		channelMessageAllReactions(channelId, messageId) {
			return `/channels/${channelId}/messages/${messageId}/reactions`;
		},
		channelBulkDelete(channelId) {
			return `/channels/${channelId}/messages/bulk-delete`;
		},
		channelPermission(channelId, overwriteId) {
			return `/channels/${channelId}/permissions/${overwriteId}`;
		},
		channelInvites(channelId) {
			return `/channels/${channelId}/invites`;
		},
		channelFollowers(channelId) {
			return `/channels/${channelId}/followers`;
		},
		channelTyping(channelId) {
			return `/channels/${channelId}/typing`;
		},
		channelMessagesPins(channelId) {
			return `/channels/${channelId}/messages/pins`;
		},
		channelMessagesPin(channelId, messageId) {
			return `/channels/${channelId}/messages/pins/${messageId}`;
		},
		channelPins(channelId) {
			return `/channels/${channelId}/pins`;
		},
		channelPin(channelId, messageId) {
			return `/channels/${channelId}/pins/${messageId}`;
		},
		channelRecipient(channelId, userId) {
			return `/channels/${channelId}/recipients/${userId}`;
		},
		guildEmojis(guildId) {
			return `/guilds/${guildId}/emojis`;
		},
		guildEmoji(guildId, emojiId) {
			return `/guilds/${guildId}/emojis/${emojiId}`;
		},
		guilds() {
			return "/guilds";
		},
		guild(guildId) {
			return `/guilds/${guildId}`;
		},
		guildPreview(guildId) {
			return `/guilds/${guildId}/preview`;
		},
		guildChannels(guildId) {
			return `/guilds/${guildId}/channels`;
		},
		guildMember(guildId, userId = "@me") {
			return `/guilds/${guildId}/members/${userId}`;
		},
		guildMembers(guildId) {
			return `/guilds/${guildId}/members`;
		},
		guildMembersSearch(guildId) {
			return `/guilds/${guildId}/members/search`;
		},
		guildCurrentMemberNickname(guildId) {
			return `/guilds/${guildId}/members/@me/nick`;
		},
		guildMemberRole(guildId, memberId, roleId) {
			return `/guilds/${guildId}/members/${memberId}/roles/${roleId}`;
		},
		guildMFA(guildId) {
			return `/guilds/${guildId}/mfa`;
		},
		guildBans(guildId) {
			return `/guilds/${guildId}/bans`;
		},
		guildBan(guildId, userId) {
			return `/guilds/${guildId}/bans/${userId}`;
		},
		guildRoles(guildId) {
			return `/guilds/${guildId}/roles`;
		},
		guildRole(guildId, roleId) {
			return `/guilds/${guildId}/roles/${roleId}`;
		},
		guildRoleMemberCounts(guildId) {
			return `/guilds/${guildId}/roles/member-counts`;
		},
		guildPrune(guildId) {
			return `/guilds/${guildId}/prune`;
		},
		guildVoiceRegions(guildId) {
			return `/guilds/${guildId}/regions`;
		},
		guildInvites(guildId) {
			return `/guilds/${guildId}/invites`;
		},
		guildIntegrations(guildId) {
			return `/guilds/${guildId}/integrations`;
		},
		guildIntegration(guildId, integrationId) {
			return `/guilds/${guildId}/integrations/${integrationId}`;
		},
		guildWidgetSettings(guildId) {
			return `/guilds/${guildId}/widget`;
		},
		guildWidgetJSON(guildId) {
			return `/guilds/${guildId}/widget.json`;
		},
		guildVanityUrl(guildId) {
			return `/guilds/${guildId}/vanity-url`;
		},
		guildWidgetImage(guildId) {
			return `/guilds/${guildId}/widget.png`;
		},
		invite(code) {
			return `/invites/${code}`;
		},
		template(code) {
			return `/guilds/templates/${code}`;
		},
		guildTemplates(guildId) {
			return `/guilds/${guildId}/templates`;
		},
		guildTemplate(guildId, code) {
			return `/guilds/${guildId}/templates/${code}`;
		},
		pollAnswerVoters(channelId, messageId, answerId) {
			return `/channels/${channelId}/polls/${messageId}/answers/${answerId}`;
		},
		expirePoll(channelId, messageId) {
			return `/channels/${channelId}/polls/${messageId}/expire`;
		},
		threads(parentId, messageId) {
			const parts = [
				"",
				"channels",
				parentId
			];
			if (messageId) parts.push("messages", messageId);
			parts.push("threads");
			return parts.join("/");
		},
		guildActiveThreads(guildId) {
			return `/guilds/${guildId}/threads/active`;
		},
		channelThreads(channelId, archivedStatus) {
			return `/channels/${channelId}/threads/archived/${archivedStatus}`;
		},
		channelJoinedArchivedThreads(channelId) {
			return `/channels/${channelId}/users/@me/threads/archived/private`;
		},
		threadMembers(threadId, userId) {
			const parts = [
				"",
				"channels",
				threadId,
				"thread-members"
			];
			if (userId) parts.push(userId);
			return parts.join("/");
		},
		user(userId = "@me") {
			return `/users/${userId}`;
		},
		userApplicationRoleConnection(applicationId) {
			return `/users/@me/applications/${applicationId}/role-connection`;
		},
		userGuilds() {
			return `/users/@me/guilds`;
		},
		userGuildMember(guildId) {
			return `/users/@me/guilds/${guildId}/member`;
		},
		userGuild(guildId) {
			return `/users/@me/guilds/${guildId}`;
		},
		userChannels() {
			return `/users/@me/channels`;
		},
		userConnections() {
			return `/users/@me/connections`;
		},
		voiceRegions() {
			return `/voice/regions`;
		},
		channelWebhooks(channelId) {
			return `/channels/${channelId}/webhooks`;
		},
		guildWebhooks(guildId) {
			return `/guilds/${guildId}/webhooks`;
		},
		webhook(webhookId, webhookToken) {
			const parts = [
				"",
				"webhooks",
				webhookId
			];
			if (webhookToken) parts.push(webhookToken);
			return parts.join("/");
		},
		webhookMessage(webhookId, webhookToken, messageId = "@original") {
			return `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`;
		},
		webhookPlatform(webhookId, webhookToken, platform) {
			return `/webhooks/${webhookId}/${webhookToken}/${platform}`;
		},
		gateway() {
			return `/gateway`;
		},
		gatewayBot() {
			return `/gateway/bot`;
		},
		oauth2CurrentApplication() {
			return `/oauth2/applications/@me`;
		},
		oauth2CurrentAuthorization() {
			return `/oauth2/@me`;
		},
		oauth2Authorization() {
			return `/oauth2/authorize`;
		},
		oauth2TokenExchange() {
			return `/oauth2/token`;
		},
		oauth2TokenRevocation() {
			return `/oauth2/token/revoke`;
		},
		applicationCommands(applicationId) {
			return `/applications/${applicationId}/commands`;
		},
		applicationCommand(applicationId, commandId) {
			return `/applications/${applicationId}/commands/${commandId}`;
		},
		applicationGuildCommands(applicationId, guildId) {
			return `/applications/${applicationId}/guilds/${guildId}/commands`;
		},
		applicationGuildCommand(applicationId, guildId, commandId) {
			return `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}`;
		},
		interactionCallback(interactionId, interactionToken) {
			return `/interactions/${interactionId}/${interactionToken}/callback`;
		},
		guildMemberVerification(guildId) {
			return `/guilds/${guildId}/member-verification`;
		},
		guildVoiceState(guildId, userId = "@me") {
			return `/guilds/${guildId}/voice-states/${userId}`;
		},
		guildApplicationCommandsPermissions(applicationId, guildId) {
			return `/applications/${applicationId}/guilds/${guildId}/commands/permissions`;
		},
		applicationCommandPermissions(applicationId, guildId, commandId) {
			return `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions`;
		},
		guildWelcomeScreen(guildId) {
			return `/guilds/${guildId}/welcome-screen`;
		},
		stageInstances() {
			return `/stage-instances`;
		},
		stageInstance(channelId) {
			return `/stage-instances/${channelId}`;
		},
		sticker(stickerId) {
			return `/stickers/${stickerId}`;
		},
		stickerPacks() {
			return "/sticker-packs";
		},
		stickerPack(packId) {
			return `/sticker-packs/${packId}`;
		},
		nitroStickerPacks() {
			return "/sticker-packs";
		},
		guildStickers(guildId) {
			return `/guilds/${guildId}/stickers`;
		},
		guildSticker(guildId, stickerId) {
			return `/guilds/${guildId}/stickers/${stickerId}`;
		},
		guildScheduledEvents(guildId) {
			return `/guilds/${guildId}/scheduled-events`;
		},
		guildScheduledEvent(guildId, guildScheduledEventId) {
			return `/guilds/${guildId}/scheduled-events/${guildScheduledEventId}`;
		},
		guildScheduledEventUsers(guildId, guildScheduledEventId) {
			return `/guilds/${guildId}/scheduled-events/${guildScheduledEventId}/users`;
		},
		guildOnboarding(guildId) {
			return `/guilds/${guildId}/onboarding`;
		},
		guildIncidentActions(guildId) {
			return `/guilds/${guildId}/incident-actions`;
		},
		currentApplication() {
			return "/applications/@me";
		},
		entitlements(applicationId) {
			return `/applications/${applicationId}/entitlements`;
		},
		entitlement(applicationId, entitlementId) {
			return `/applications/${applicationId}/entitlements/${entitlementId}`;
		},
		skus(applicationId) {
			return `/applications/${applicationId}/skus`;
		},
		guildBulkBan(guildId) {
			return `/guilds/${guildId}/bulk-ban`;
		},
		consumeEntitlement(applicationId, entitlementId) {
			return `/applications/${applicationId}/entitlements/${entitlementId}/consume`;
		},
		applicationEmojis(applicationId) {
			return `/applications/${applicationId}/emojis`;
		},
		applicationEmoji(applicationId, emojiId) {
			return `/applications/${applicationId}/emojis/${emojiId}`;
		},
		skuSubscriptions(skuId) {
			return `/skus/${skuId}/subscriptions`;
		},
		skuSubscription(skuId, subscriptionId) {
			return `/skus/${skuId}/subscriptions/${subscriptionId}`;
		},
		sendSoundboardSound(channelId) {
			return `/channels/${channelId}/send-soundboard-sound`;
		},
		soundboardDefaultSounds() {
			return "/soundboard-default-sounds";
		},
		guildSoundboardSounds(guildId) {
			return `/guilds/${guildId}/soundboard-sounds`;
		},
		guildSoundboardSound(guildId, soundId) {
			return `/guilds/${guildId}/soundboard-sounds/${soundId}`;
		}
	};
	for (const [key, fn] of Object.entries(exports.Routes)) exports.Routes[key] = (...args) => {
		const escaped = args.map((arg) => {
			if (arg) {
				if (internals_1.urlSafeCharacters.test(String(arg))) return arg;
				return encodeURIComponent(arg);
			}
			return arg;
		});
		return fn.call(null, ...escaped);
	};
	Object.freeze(exports.Routes);
	exports.StickerPackApplicationId = "710982414301790216";
	var ImageFormat;
	(function(ImageFormat) {
		ImageFormat["JPEG"] = "jpeg";
		ImageFormat["PNG"] = "png";
		ImageFormat["WebP"] = "webp";
		ImageFormat["GIF"] = "gif";
		ImageFormat["Lottie"] = "json";
	})(ImageFormat || (exports.ImageFormat = ImageFormat = {}));
	exports.CDNRoutes = {
		emoji(emojiId, format) {
			return `/emojis/${emojiId}.${format}`;
		},
		guildIcon(guildId, guildIcon, format) {
			return `/icons/${guildId}/${guildIcon}.${format}`;
		},
		guildSplash(guildId, guildSplash, format) {
			return `/splashes/${guildId}/${guildSplash}.${format}`;
		},
		guildDiscoverySplash(guildId, guildDiscoverySplash, format) {
			return `/discovery-splashes/${guildId}/${guildDiscoverySplash}.${format}`;
		},
		guildBanner(guildId, guildBanner, format) {
			return `/banners/${guildId}/${guildBanner}.${format}`;
		},
		userBanner(userId, userBanner, format) {
			return `/banners/${userId}/${userBanner}.${format}`;
		},
		defaultUserAvatar(index) {
			return `/embed/avatars/${index}.png`;
		},
		userAvatar(userId, userAvatar, format) {
			return `/avatars/${userId}/${userAvatar}.${format}`;
		},
		guildMemberAvatar(guildId, userId, memberAvatar, format) {
			return `/guilds/${guildId}/users/${userId}/avatars/${memberAvatar}.${format}`;
		},
		userAvatarDecoration(userId, userAvatarDecoration) {
			return `/avatar-decorations/${userId}/${userAvatarDecoration}.png`;
		},
		avatarDecoration(avatarDecorationDataAsset) {
			return `/avatar-decoration-presets/${avatarDecorationDataAsset}.png`;
		},
		applicationIcon(applicationId, applicationIcon, format) {
			return `/app-icons/${applicationId}/${applicationIcon}.${format}`;
		},
		applicationCover(applicationId, applicationCoverImage, format) {
			return `/app-icons/${applicationId}/${applicationCoverImage}.${format}`;
		},
		applicationAsset(applicationId, applicationAssetId, format) {
			return `/app-assets/${applicationId}/${applicationAssetId}.${format}`;
		},
		achievementIcon(applicationId, achievementId, achievementIconHash, format) {
			return `/app-assets/${applicationId}/achievements/${achievementId}/icons/${achievementIconHash}.${format}`;
		},
		stickerPackBanner(stickerPackBannerAssetId, format) {
			return `/app-assets/${exports.StickerPackApplicationId}/store/${stickerPackBannerAssetId}.${format}`;
		},
		storePageAsset(applicationId, assetId, format = ImageFormat.PNG) {
			return `/app-assets/${applicationId}/store/${assetId}.${format}`;
		},
		teamIcon(teamId, teamIcon, format) {
			return `/team-icons/${teamId}/${teamIcon}.${format}`;
		},
		sticker(stickerId, format) {
			return `/stickers/${stickerId}.${format}`;
		},
		roleIcon(roleId, roleIcon, format) {
			return `/role-icons/${roleId}/${roleIcon}.${format}`;
		},
		guildScheduledEventCover(guildScheduledEventId, guildScheduledEventCoverImage, format) {
			return `/guild-events/${guildScheduledEventId}/${guildScheduledEventCoverImage}.${format}`;
		},
		guildMemberBanner(guildId, userId, guildMemberBanner, format) {
			return `/guilds/${guildId}/users/${userId}/banners/${guildMemberBanner}.${format}`;
		},
		soundboardSound(soundId) {
			return `/soundboard-sounds/${soundId}`;
		},
		guildTagBadge(guildId, guildTagBadge, format) {
			return `/guild-tag-badges/${guildId}/${guildTagBadge}.${format}`;
		}
	};
	for (const [key, fn] of Object.entries(exports.CDNRoutes)) exports.CDNRoutes[key] = (...args) => {
		const escaped = args.map((arg) => {
			if (arg) {
				if (internals_1.urlSafeCharacters.test(String(arg))) return arg;
				return encodeURIComponent(arg);
			}
			return arg;
		});
		return fn.call(null, ...escaped);
	};
	Object.freeze(exports.CDNRoutes);
	exports.RouteBases = {
		api: `https://discord.com/api/v${exports.APIVersion}`,
		cdn: "https://cdn.discordapp.com",
		media: "https://media.discordapp.net",
		invite: "https://discord.gg",
		template: "https://discord.new",
		gift: "https://discord.gift",
		scheduledEvent: "https://discord.com/events"
	};
	Object.freeze(exports.RouteBases);
	exports.OAuth2Routes = {
		authorizationURL: `${exports.RouteBases.api}${exports.Routes.oauth2Authorization()}`,
		tokenURL: `${exports.RouteBases.api}${exports.Routes.oauth2TokenExchange()}`,
		tokenRevocationURL: `${exports.RouteBases.api}${exports.Routes.oauth2TokenRevocation()}`
	};
	Object.freeze(exports.OAuth2Routes);
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/rpc/common.js
var require_common = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RPCCloseEventCodes = exports.RPCErrorCodes = exports.RelationshipType = exports.VoiceConnectionStates = exports.RPCVoiceShortcutKeyComboKeyType = exports.RPCVoiceSettingsModeType = exports.RPCDeviceType = void 0;
	var RPCDeviceType;
	(function(RPCDeviceType) {
		RPCDeviceType["AudioInput"] = "audioinput";
		RPCDeviceType["AudioOutput"] = "audiooutput";
		RPCDeviceType["VideoInput"] = "videoinput";
	})(RPCDeviceType || (exports.RPCDeviceType = RPCDeviceType = {}));
	var RPCVoiceSettingsModeType;
	(function(RPCVoiceSettingsModeType) {
		RPCVoiceSettingsModeType["PushToTalk"] = "PUSH_TO_TALK";
		RPCVoiceSettingsModeType["VoiceActivity"] = "VOICE_ACTIVITY";
	})(RPCVoiceSettingsModeType || (exports.RPCVoiceSettingsModeType = RPCVoiceSettingsModeType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/rpc#getvoicesettings-key-types}
	*/
	var RPCVoiceShortcutKeyComboKeyType;
	(function(RPCVoiceShortcutKeyComboKeyType) {
		RPCVoiceShortcutKeyComboKeyType[RPCVoiceShortcutKeyComboKeyType["KeyboardKey"] = 0] = "KeyboardKey";
		RPCVoiceShortcutKeyComboKeyType[RPCVoiceShortcutKeyComboKeyType["MouseButton"] = 1] = "MouseButton";
		RPCVoiceShortcutKeyComboKeyType[RPCVoiceShortcutKeyComboKeyType["KeyboardModifierKey"] = 2] = "KeyboardModifierKey";
		RPCVoiceShortcutKeyComboKeyType[RPCVoiceShortcutKeyComboKeyType["GamepadButton"] = 3] = "GamepadButton";
	})(RPCVoiceShortcutKeyComboKeyType || (exports.RPCVoiceShortcutKeyComboKeyType = RPCVoiceShortcutKeyComboKeyType = {}));
	var VoiceConnectionStates;
	(function(VoiceConnectionStates) {
		/**
		* TCP disconnected
		*/
		VoiceConnectionStates["Disconnected"] = "DISCONNECTED";
		/**
		* Waiting for voice endpoint
		*/
		VoiceConnectionStates["AwaitingEndpoint"] = "AWAITING_ENDPOINT";
		/**
		* TCP authenticating
		*/
		VoiceConnectionStates["Authenticating"] = "AUTHENTICATING";
		/**
		* TCP connecting
		*/
		VoiceConnectionStates["Connecting"] = "CONNECTING";
		/**
		* TCP connected
		*/
		VoiceConnectionStates["Connected"] = "CONNECTED";
		/**
		* TCP connected, Voice disconnected
		*/
		VoiceConnectionStates["VoiceDisconnected"] = "VOICE_DISCONNECTED";
		/**
		* TCP connected, Voice connecting
		*/
		VoiceConnectionStates["VoiceConnecting"] = "VOICE_CONNECTING";
		/**
		* TCP connected, Voice connected
		*/
		VoiceConnectionStates["VoiceConnected"] = "VOICE_CONNECTED";
		/**
		* No route to host
		*/
		VoiceConnectionStates["NoRoute"] = "NO_ROUTE";
		/**
		* WebRTC ice checking
		*/
		VoiceConnectionStates["IceChecking"] = "ICE_CHECKING";
	})(VoiceConnectionStates || (exports.VoiceConnectionStates = VoiceConnectionStates = {}));
	/**
	* @unstable
	*/
	var RelationshipType;
	(function(RelationshipType) {
		RelationshipType[RelationshipType["None"] = 0] = "None";
		RelationshipType[RelationshipType["Friend"] = 1] = "Friend";
		RelationshipType[RelationshipType["Blocked"] = 2] = "Blocked";
		RelationshipType[RelationshipType["PendingIncoming"] = 3] = "PendingIncoming";
		RelationshipType[RelationshipType["PendingOutgoing"] = 4] = "PendingOutgoing";
		RelationshipType[RelationshipType["Implicit"] = 5] = "Implicit";
	})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-error-codes}
	*/
	var RPCErrorCodes;
	(function(RPCErrorCodes) {
		/**
		* An unknown error occurred.
		*/
		RPCErrorCodes[RPCErrorCodes["UnknownError"] = 1e3] = "UnknownError";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["ServiceUnavailable"] = 1001] = "ServiceUnavailable";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["TransactionAborted"] = 1002] = "TransactionAborted";
		/**
		* You sent an invalid payload.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidPayload"] = 4e3] = "InvalidPayload";
		/**
		* Invalid command name specified.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidCommand"] = 4002] = "InvalidCommand";
		/**
		* Invalid guild ID specified.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidGuild"] = 4003] = "InvalidGuild";
		/**
		* Invalid event name specified.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidEvent"] = 4004] = "InvalidEvent";
		/**
		* Invalid channel ID specified.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidChannel"] = 4005] = "InvalidChannel";
		/**
		* You lack permissions to access the given resource.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidPermissions"] = 4006] = "InvalidPermissions";
		/**
		* An invalid OAuth2 application ID was used to authorize or authenticate with.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidClientId"] = 4007] = "InvalidClientId";
		/**
		* An invalid OAuth2 application origin was used to authorize or authenticate with.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidOrigin"] = 4008] = "InvalidOrigin";
		/**
		* An invalid OAuth2 token was used to authorize or authenticate with.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidToken"] = 4009] = "InvalidToken";
		/**
		* The specified user ID was invalid.
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidUser"] = 4010] = "InvalidUser";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidInvite"] = 4011] = "InvalidInvite";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidActivityJoinRequest"] = 4012] = "InvalidActivityJoinRequest";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidEntitlement"] = 4013] = "InvalidEntitlement";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidGiftCode"] = 4014] = "InvalidGiftCode";
		/**
		* A standard OAuth2 error occurred; check the data object for the OAuth2 error details.
		*/
		RPCErrorCodes[RPCErrorCodes["OAuth2Error"] = 5e3] = "OAuth2Error";
		/**
		* An asynchronous `SELECT_TEXT_CHANNEL`/`SELECT_VOICE_CHANNEL` command timed out.
		*/
		RPCErrorCodes[RPCErrorCodes["SelectChannelTimedOut"] = 5001] = "SelectChannelTimedOut";
		/**
		* An asynchronous `GET_GUILD` command timed out.
		*/
		RPCErrorCodes[RPCErrorCodes["GetGuildTimedOut"] = 5002] = "GetGuildTimedOut";
		/**
		* You tried to join a user to a voice channel but the user was already in one.
		*/
		RPCErrorCodes[RPCErrorCodes["SelectVoiceForceRequired"] = 5003] = "SelectVoiceForceRequired";
		/**
		* You tried to capture more than one shortcut key at once.
		*/
		RPCErrorCodes[RPCErrorCodes["CaptureShortcutAlreadyListening"] = 5004] = "CaptureShortcutAlreadyListening";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["InvalidActivitySecret"] = 5005] = "InvalidActivitySecret";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["NoEligibleActivity"] = 5006] = "NoEligibleActivity";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["PurchaseCanceled"] = 5007] = "PurchaseCanceled";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["PurchaseError"] = 5008] = "PurchaseError";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["UnauthorizedForAchievement"] = 5009] = "UnauthorizedForAchievement";
		/**
		* @unstable
		*/
		RPCErrorCodes[RPCErrorCodes["RateLimited"] = 5010] = "RateLimited";
	})(RPCErrorCodes || (exports.RPCErrorCodes = RPCErrorCodes = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-close-event-codes}
	*/
	var RPCCloseEventCodes;
	(function(RPCCloseEventCodes) {
		/**
		* @unstable
		*/
		RPCCloseEventCodes[RPCCloseEventCodes["CloseNormal"] = 1e3] = "CloseNormal";
		/**
		* @unstable
		*/
		RPCCloseEventCodes[RPCCloseEventCodes["CloseUnsupported"] = 1003] = "CloseUnsupported";
		/**
		* @unstable
		*/
		RPCCloseEventCodes[RPCCloseEventCodes["CloseAbnormal"] = 1006] = "CloseAbnormal";
		/**
		* You connected to the RPC server with an invalid client ID.
		*/
		RPCCloseEventCodes[RPCCloseEventCodes["InvalidClientId"] = 4e3] = "InvalidClientId";
		/**
		* You connected to the RPC server with an invalid origin.
		*/
		RPCCloseEventCodes[RPCCloseEventCodes["InvalidOrigin"] = 4001] = "InvalidOrigin";
		/**
		* You are being rate limited.
		*/
		RPCCloseEventCodes[RPCCloseEventCodes["RateLimited"] = 4002] = "RateLimited";
		/**
		* The OAuth2 token associated with a connection was revoked, get a new one!
		*/
		RPCCloseEventCodes[RPCCloseEventCodes["TokenRevoked"] = 4003] = "TokenRevoked";
		/**
		* The RPC Server version specified in the connection string was not valid.
		*/
		RPCCloseEventCodes[RPCCloseEventCodes["InvalidVersion"] = 4004] = "InvalidVersion";
		/**
		* The encoding specified in the connection string was not valid.
		*/
		RPCCloseEventCodes[RPCCloseEventCodes["InvalidEncoding"] = 4005] = "InvalidEncoding";
	})(RPCCloseEventCodes || (exports.RPCCloseEventCodes = RPCCloseEventCodes = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/rpc/v10.js
var require_v10$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$2) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$2, p)) __createBinding(exports$2, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RPCEvents = exports.RPCCommands = exports.RPCVersion = void 0;
	__exportStar(require_common(), exports);
	exports.RPCVersion = "1";
	/**
	* @see {@link https://discord.com/developers/docs/topics/rpc#commands-and-events-rpc-commands}
	*/
	var RPCCommands;
	(function(RPCCommands) {
		/**
		* @unstable
		*/
		RPCCommands["AcceptActivityInvite"] = "ACCEPT_ACTIVITY_INVITE";
		/**
		* @unstable
		*/
		RPCCommands["ActivityInviteUser"] = "ACTIVITY_INVITE_USER";
		/**
		* Used to authenticate an existing client with your app
		*/
		RPCCommands["Authenticate"] = "AUTHENTICATE";
		/**
		* Used to authorize a new client with your app
		*/
		RPCCommands["Authorize"] = "AUTHORIZE";
		/**
		* @unstable
		*/
		RPCCommands["BraintreePopupBridgeCallback"] = "BRAINTREE_POPUP_BRIDGE_CALLBACK";
		/**
		* @unstable
		*/
		RPCCommands["BrowserHandoff"] = "BROWSER_HANDOFF";
		/**
		* 	used to reject a Rich Presence Ask to Join request
		*
		* @unstable the documented similarly named command `CLOSE_ACTIVITY_REQUEST` does not exist, but `CLOSE_ACTIVITY_JOIN_REQUEST` does
		*/
		RPCCommands["CloseActivityJoinRequest"] = "CLOSE_ACTIVITY_JOIN_REQUEST";
		/**
		* @unstable
		*/
		RPCCommands["ConnectionsCallback"] = "CONNECTIONS_CALLBACK";
		RPCCommands["CreateChannelInvite"] = "CREATE_CHANNEL_INVITE";
		/**
		* @unstable
		*/
		RPCCommands["DeepLink"] = "DEEP_LINK";
		/**
		* Event dispatch
		*/
		RPCCommands["Dispatch"] = "DISPATCH";
		/**
		* @unstable
		*/
		RPCCommands["GetApplicationTicket"] = "GET_APPLICATION_TICKET";
		/**
		* Used to retrieve channel information from the client
		*/
		RPCCommands["GetChannel"] = "GET_CHANNEL";
		/**
		* Used to retrieve a list of channels for a guild from the client
		*/
		RPCCommands["GetChannels"] = "GET_CHANNELS";
		/**
		* @unstable
		*/
		RPCCommands["GetEntitlementTicket"] = "GET_ENTITLEMENT_TICKET";
		/**
		* @unstable
		*/
		RPCCommands["GetEntitlements"] = "GET_ENTITLEMENTS";
		/**
		* Used to retrieve guild information from the client
		*/
		RPCCommands["GetGuild"] = "GET_GUILD";
		/**
		* Used to retrieve a list of guilds from the client
		*/
		RPCCommands["GetGuilds"] = "GET_GUILDS";
		/**
		* @unstable
		*/
		RPCCommands["GetImage"] = "GET_IMAGE";
		/**
		* @unstable
		*/
		RPCCommands["GetNetworkingConfig"] = "GET_NETWORKING_CONFIG";
		/**
		* @unstable
		*/
		RPCCommands["GetRelationships"] = "GET_RELATIONSHIPS";
		/**
		* Used to get the current voice channel the client is in
		*/
		RPCCommands["GetSelectedVoiceChannel"] = "GET_SELECTED_VOICE_CHANNEL";
		/**
		* @unstable
		*/
		RPCCommands["GetSkus"] = "GET_SKUS";
		/**
		* @unstable
		*/
		RPCCommands["GetUser"] = "GET_USER";
		/**
		* Used to retrieve the client's voice settings
		*/
		RPCCommands["GetVoiceSettings"] = "GET_VOICE_SETTINGS";
		/**
		* @unstable
		*/
		RPCCommands["GiftCodeBrowser"] = "GIFT_CODE_BROWSER";
		/**
		* @unstable
		*/
		RPCCommands["GuildTemplateBrowser"] = "GUILD_TEMPLATE_BROWSER";
		/**
		* @unstable
		*/
		RPCCommands["InviteBrowser"] = "INVITE_BROWSER";
		/**
		* @unstable
		*/
		RPCCommands["NetworkingCreateToken"] = "NETWORKING_CREATE_TOKEN";
		/**
		* @unstable
		*/
		RPCCommands["NetworkingPeerMetrics"] = "NETWORKING_PEER_METRICS";
		/**
		* @unstable
		*/
		RPCCommands["NetworkingSystemMetrics"] = "NETWORKING_SYSTEM_METRICS";
		/**
		* @unstable
		*/
		RPCCommands["OpenOverlayActivityInvite"] = "OPEN_OVERLAY_ACTIVITY_INVITE";
		/**
		* @unstable
		*/
		RPCCommands["OpenOverlayGuildInvite"] = "OPEN_OVERLAY_GUILD_INVITE";
		/**
		* @unstable
		*/
		RPCCommands["OpenOverlayVoiceSettings"] = "OPEN_OVERLAY_VOICE_SETTINGS";
		/**
		* @unstable
		*/
		RPCCommands["Overlay"] = "OVERLAY";
		/**
		* Used to join or leave a text channel, group dm, or dm
		*/
		RPCCommands["SelectTextChannel"] = "SELECT_TEXT_CHANNEL";
		/**
		* Used to join or leave a voice channel, group dm, or dm
		*/
		RPCCommands["SelectVoiceChannel"] = "SELECT_VOICE_CHANNEL";
		/**
		* Used to consent to a Rich Presence Ask to Join request
		*/
		RPCCommands["SendActivityJoinInvite"] = "SEND_ACTIVITY_JOIN_INVITE";
		/**
		* Used to update a user's Rich Presence
		*/
		RPCCommands["SetActivity"] = "SET_ACTIVITY";
		/**
		* Used to send info about certified hardware devices
		*/
		RPCCommands["SetCertifiedDevices"] = "SET_CERTIFIED_DEVICES";
		/**
		* @unstable
		*/
		RPCCommands["SetOverlayLocked"] = "SET_OVERLAY_LOCKED";
		/**
		* Used to change voice settings of users in voice channels
		*/
		RPCCommands["SetUserVoiceSettings"] = "SET_USER_VOICE_SETTINGS";
		RPCCommands["SetUserVoiceSettings2"] = "SET_USER_VOICE_SETTINGS_2";
		/**
		* Used to set the client's voice settings
		*/
		RPCCommands["SetVoiceSettings"] = "SET_VOICE_SETTINGS";
		RPCCommands["SetVoiceSettings2"] = "SET_VOICE_SETTINGS_2";
		/**
		* @unstable
		*/
		RPCCommands["StartPurchase"] = "START_PURCHASE";
		/**
		* Used to subscribe to an RPC event
		*/
		RPCCommands["Subscribe"] = "SUBSCRIBE";
		/**
		* Used to unsubscribe from an RPC event
		*/
		RPCCommands["Unsubscribe"] = "UNSUBSCRIBE";
		/**
		* @unstable
		*/
		RPCCommands["ValidateApplication"] = "VALIDATE_APPLICATION";
	})(RPCCommands || (exports.RPCCommands = RPCCommands = {}));
	/**
	* @see {@link https://discord.com/developers/docs/topics/rpc#commands-and-events-rpc-events}
	*/
	var RPCEvents;
	(function(RPCEvents) {
		/**
		* @unstable
		*/
		RPCEvents["ActivityInvite"] = "ACTIVITY_INVITE";
		RPCEvents["ActivityJoin"] = "ACTIVITY_JOIN";
		RPCEvents["ActivityJoinRequest"] = "ACTIVITY_JOIN_REQUEST";
		RPCEvents["ActivitySpectate"] = "ACTIVITY_SPECTATE";
		RPCEvents["ChannelCreate"] = "CHANNEL_CREATE";
		RPCEvents["CurrentUserUpdate"] = "CURRENT_USER_UPDATE";
		/**
		* @unstable
		*/
		RPCEvents["EntitlementCreate"] = "ENTITLEMENT_CREATE";
		/**
		* @unstable
		*/
		RPCEvents["EntitlementDelete"] = "ENTITLEMENT_DELETE";
		RPCEvents["Error"] = "ERROR";
		/**
		* @unstable
		*/
		RPCEvents["GameJoin"] = "GAME_JOIN";
		/**
		* @unstable
		*/
		RPCEvents["GameSpectate"] = "GAME_SPECTATE";
		RPCEvents["GuildCreate"] = "GUILD_CREATE";
		RPCEvents["GuildStatus"] = "GUILD_STATUS";
		/**
		* Dispatches message objects, with the exception of deletions, which only contains the id in the message object.
		*/
		RPCEvents["MessageCreate"] = "MESSAGE_CREATE";
		/**
		* Dispatches message objects, with the exception of deletions, which only contains the id in the message object.
		*/
		RPCEvents["MessageDelete"] = "MESSAGE_DELETE";
		/**
		* Dispatches message objects, with the exception of deletions, which only contains the id in the message object.
		*/
		RPCEvents["MessageUpdate"] = "MESSAGE_UPDATE";
		/**
		* This event requires the `rpc.notifications.read` {@link https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes | OAuth2 scope}.
		*/
		RPCEvents["NotificationCreate"] = "NOTIFICATION_CREATE";
		/**
		* @unstable
		*/
		RPCEvents["Overlay"] = "OVERLAY";
		/**
		* @unstable
		*/
		RPCEvents["OverlayUpdate"] = "OVERLAY_UPDATE";
		RPCEvents["Ready"] = "READY";
		/**
		* @unstable
		*/
		RPCEvents["RelationshipUpdate"] = "RELATIONSHIP_UPDATE";
		RPCEvents["SpeakingStart"] = "SPEAKING_START";
		RPCEvents["SpeakingStop"] = "SPEAKING_STOP";
		RPCEvents["VoiceChannelSelect"] = "VOICE_CHANNEL_SELECT";
		RPCEvents["VoiceConnectionStatus"] = "VOICE_CONNECTION_STATUS";
		RPCEvents["VoiceSettingsUpdate"] = "VOICE_SETTINGS_UPDATE";
		/**
		* @unstable
		*/
		RPCEvents["VoiceSettingsUpdate2"] = "VOICE_SETTINGS_UPDATE_2";
		/**
		* Dispatches channel voice state objects
		*/
		RPCEvents["VoiceStateCreate"] = "VOICE_STATE_CREATE";
		/**
		* Dispatches channel voice state objects
		*/
		RPCEvents["VoiceStateDelete"] = "VOICE_STATE_DELETE";
		/**
		* Dispatches channel voice state objects
		*/
		RPCEvents["VoiceStateUpdate"] = "VOICE_STATE_UPDATE";
	})(RPCEvents || (exports.RPCEvents = RPCEvents = {}));
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/utils/v10.js
var require_v10$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isDMInteraction = isDMInteraction;
	exports.isGuildInteraction = isGuildInteraction;
	exports.isApplicationCommandDMInteraction = isApplicationCommandDMInteraction;
	exports.isApplicationCommandGuildInteraction = isApplicationCommandGuildInteraction;
	exports.isMessageComponentDMInteraction = isMessageComponentDMInteraction;
	exports.isMessageComponentGuildInteraction = isMessageComponentGuildInteraction;
	exports.isLinkButton = isLinkButton;
	exports.isInteractionButton = isInteractionButton;
	exports.isModalSubmitInteraction = isModalSubmitInteraction;
	exports.isMessageComponentInteraction = isMessageComponentInteraction;
	exports.isMessageComponentButtonInteraction = isMessageComponentButtonInteraction;
	exports.isMessageComponentSelectMenuInteraction = isMessageComponentSelectMenuInteraction;
	exports.isChatInputApplicationCommandInteraction = isChatInputApplicationCommandInteraction;
	exports.isContextMenuApplicationCommandInteraction = isContextMenuApplicationCommandInteraction;
	const index_1 = require_v10$4();
	/**
	* A type guard check for DM interactions
	*
	* @param interaction - The interaction to check against
	* @returns A boolean that indicates if the interaction was received in a DM channel
	*/
	function isDMInteraction(interaction) {
		return Reflect.has(interaction, "user");
	}
	/**
	* A type guard check for guild interactions
	*
	* @param interaction - The interaction to check against
	* @returns A boolean that indicates if the interaction was received in a guild
	*/
	function isGuildInteraction(interaction) {
		return Reflect.has(interaction, "guild_id");
	}
	/**
	* A type guard check for DM application command interactions
	*
	* @param interaction - The application command interaction to check against
	* @returns A boolean that indicates if the application command interaction was received in a DM channel
	*/
	function isApplicationCommandDMInteraction(interaction) {
		return isDMInteraction(interaction);
	}
	/**
	* A type guard check for guild application command interactions
	*
	* @param interaction - The interaction to check against
	* @returns A boolean that indicates if the application command interaction was received in a guild
	*/
	function isApplicationCommandGuildInteraction(interaction) {
		return isGuildInteraction(interaction);
	}
	/**
	* A type guard check for DM message component interactions
	*
	* @param interaction - The message component interaction to check against
	* @returns A boolean that indicates if the message component interaction was received in a DM channel
	*/
	function isMessageComponentDMInteraction(interaction) {
		return isDMInteraction(interaction);
	}
	/**
	* A type guard check for guild message component interactions
	*
	* @param interaction - The interaction to check against
	* @returns A boolean that indicates if the message component interaction was received in a guild
	*/
	function isMessageComponentGuildInteraction(interaction) {
		return isGuildInteraction(interaction);
	}
	/**
	* A type guard check for buttons that have a `url` attached to them.
	*
	* @param component - The button to check against
	* @returns A boolean that indicates if the button has a `url` attached to it
	*/
	function isLinkButton(component) {
		return component.style === index_1.ButtonStyle.Link;
	}
	/**
	* A type guard check for buttons that have a `custom_id` attached to them.
	*
	* @param component - The button to check against
	* @returns A boolean that indicates if the button has a `custom_id` attached to it
	*/
	function isInteractionButton(component) {
		return ![index_1.ButtonStyle.Link, index_1.ButtonStyle.Premium].includes(component.style);
	}
	/**
	* A type guard check for modals submit interactions
	*
	* @param interaction - The interaction to check against
	* @returns A boolean that indicates if the interaction is a modal submission
	*/
	function isModalSubmitInteraction(interaction) {
		return interaction.type === index_1.InteractionType.ModalSubmit;
	}
	/**
	* A type guard check for message component interactions
	*
	* @param interaction - The interaction to check against
	* @returns A boolean that indicates if the interaction is a message component
	*/
	function isMessageComponentInteraction(interaction) {
		return interaction.type === index_1.InteractionType.MessageComponent;
	}
	/**
	* A type guard check for button message component interactions
	*
	* @param interaction - The message component interaction to check against
	* @returns A boolean that indicates if the message component is a button
	*/
	function isMessageComponentButtonInteraction(interaction) {
		return interaction.data.component_type === index_1.ComponentType.Button;
	}
	/**
	* A type guard check for select menu message component interactions
	*
	* @param interaction - The message component interaction to check against
	* @returns A boolean that indicates if the message component is a select menu
	*/
	function isMessageComponentSelectMenuInteraction(interaction) {
		return [
			index_1.ComponentType.StringSelect,
			index_1.ComponentType.UserSelect,
			index_1.ComponentType.RoleSelect,
			index_1.ComponentType.MentionableSelect,
			index_1.ComponentType.ChannelSelect
		].includes(interaction.data.component_type);
	}
	/**
	* A type guard check for chat input application commands.
	*
	* @param interaction - The interaction to check against
	* @returns A boolean that indicates if the interaction is a chat input application command
	*/
	function isChatInputApplicationCommandInteraction(interaction) {
		return interaction.data.type === index_1.ApplicationCommandType.ChatInput;
	}
	/**
	* A type guard check for context menu application commands.
	*
	* @param interaction - The interaction to check against
	* @returns A boolean that indicates if the interaction is a context menu application command
	*/
	function isContextMenuApplicationCommandInteraction(interaction) {
		return interaction.data.type === index_1.ApplicationCommandType.Message || interaction.data.type === index_1.ApplicationCommandType.User;
	}
}));
//#endregion
//#region node_modules/@buape/carbon/node_modules/discord-api-types/v10.mjs
var import_v10 = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Utils = void 0;
	__exportStar(require_v10$5(), exports);
	__exportStar(require_globals(), exports);
	__exportStar(require_v10$4(), exports);
	__exportStar(require_v10$3(), exports);
	__exportStar(require_v10$2(), exports);
	__exportStar(require_internals(), exports);
	exports.Utils = require_v10$1();
})))(), 1);
import_v10.default.APIApplicationCommandPermissionsConstant;
import_v10.default.APIVersion;
import_v10.default.ActivityFlags;
import_v10.default.ActivityPlatform;
import_v10.default.ActivityType;
import_v10.default.AllowedMentionsTypes;
const ApplicationCommandOptionType = import_v10.default.ApplicationCommandOptionType;
import_v10.default.ApplicationCommandPermissionType;
const ApplicationCommandType = import_v10.default.ApplicationCommandType;
import_v10.default.ApplicationFlags;
const ApplicationIntegrationType = import_v10.default.ApplicationIntegrationType;
import_v10.default.ApplicationRoleConnectionMetadataType;
import_v10.default.ApplicationWebhookEventStatus;
const ApplicationWebhookEventType = import_v10.default.ApplicationWebhookEventType;
const ApplicationWebhookType = import_v10.default.ApplicationWebhookType;
import_v10.default.AttachmentFlags;
import_v10.default.AuditLogEvent;
import_v10.default.AuditLogOptionsType;
import_v10.default.AutoModerationActionType;
import_v10.default.AutoModerationRuleEventType;
import_v10.default.AutoModerationRuleKeywordPresetType;
import_v10.default.AutoModerationRuleTriggerType;
const ButtonStyle = import_v10.default.ButtonStyle;
import_v10.default.CDNRoutes;
import_v10.default.ChannelFlags;
const ChannelType$1 = import_v10.default.ChannelType;
const ComponentType = import_v10.default.ComponentType;
import_v10.default.ConnectionService;
import_v10.default.ConnectionVisibility;
import_v10.default.EmbedType;
import_v10.default.EntitlementOwnerType;
import_v10.default.EntitlementType;
import_v10.default.EntryPointCommandHandlerType;
import_v10.default.FormattingPatterns;
import_v10.default.ForumLayoutType;
const GatewayCloseCodes$1 = import_v10.default.GatewayCloseCodes;
const GatewayDispatchEvents = import_v10.default.GatewayDispatchEvents;
const GatewayIntentBits = import_v10.default.GatewayIntentBits;
const GatewayOpcodes$1 = import_v10.default.GatewayOpcodes;
import_v10.default.GatewayVersion;
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
import_v10.default.ImageFormat;
import_v10.default.IntegrationExpireBehavior;
const InteractionContextType = import_v10.default.InteractionContextType;
const InteractionResponseType = import_v10.default.InteractionResponseType;
const InteractionType = import_v10.default.InteractionType;
import_v10.default.InviteFlags;
import_v10.default.InviteTargetType;
import_v10.default.InviteType;
import_v10.default.Locale;
import_v10.default.MembershipScreeningFieldType;
import_v10.default.MessageActivityType;
const MessageFlags = import_v10.default.MessageFlags;
const MessageReferenceType = import_v10.default.MessageReferenceType;
import_v10.default.MessageType;
import_v10.default.NameplatePalette;
import_v10.default.OAuth2Routes;
import_v10.default.OAuth2Scopes;
import_v10.default.OverwriteType;
const PermissionFlagsBits = import_v10.default.PermissionFlagsBits;
import_v10.default.PollLayoutType;
import_v10.default.PresenceUpdateStatus;
import_v10.default.RESTJSONErrorCodes;
import_v10.default.RPCCloseEventCodes;
import_v10.default.RPCCommands;
import_v10.default.RPCDeviceType;
import_v10.default.RPCErrorCodes;
import_v10.default.RPCEvents;
import_v10.default.RPCVersion;
import_v10.default.RPCVoiceSettingsModeType;
import_v10.default.RPCVoiceShortcutKeyComboKeyType;
import_v10.default.ReactionType;
import_v10.default.RelationshipType;
import_v10.default.RoleFlags;
import_v10.default.RouteBases;
const Routes = import_v10.default.Routes;
import_v10.default.SKUFlags;
import_v10.default.SKUType;
import_v10.default.SelectMenuDefaultValueType;
import_v10.default.SeparatorSpacingSize;
import_v10.default.SortOrderType;
import_v10.default.StageInstancePrivacyLevel;
import_v10.default.StatusDisplayType;
import_v10.default.StickerFormatType;
import_v10.default.StickerPackApplicationId;
import_v10.default.StickerType;
import_v10.default.SubscriptionStatus;
import_v10.default.TeamMemberMembershipState;
import_v10.default.TeamMemberRole;
const TextInputStyle = import_v10.default.TextInputStyle;
import_v10.default.ThreadAutoArchiveDuration;
import_v10.default.ThreadMemberFlags;
import_v10.default.UnfurledMediaItemLoadingState;
import_v10.default.UserFlags;
import_v10.default.UserPremiumType;
import_v10.default.Utils;
const VideoQualityMode = import_v10.default.VideoQualityMode;
import_v10.default.VoiceChannelEffectSendAnimationType;
import_v10.default.VoiceConnectionStates;
import_v10.default.WebhookType;
import_v10.default.urlSafeCharacters;
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseListener.js
/**
* Base class for creating event listeners that handle Discord gateway events.
* This abstract class defines the structure for event listeners and provides type safety for event handling.
* @abstract
*/
var BaseListener = class {};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/Base.js
/**
* The base class that all classes extend from
* @hidden
*/
var Base = class {
	client;
	constructor(client) {
		this.client = client;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseChannel.js
var BaseChannel = class extends Base {
	constructor(client, rawDataOrId) {
		super(client);
		if (typeof rawDataOrId === "string") this.id = rawDataOrId;
		else {
			this._rawData = rawDataOrId;
			this.id = rawDataOrId.id;
			this.setData(rawDataOrId);
		}
	}
	/**
	* The raw data of the channel.
	*/
	_rawData = null;
	setData(data) {
		if (!data) throw new Error("Cannot set data without having data... smh");
		this._rawData = data;
	}
	setField(field, value) {
		if (!this._rawData) throw new Error("Cannot set field without having data... smh");
		this._rawData[field] = value;
	}
	/**
	* The raw Discord API data for this channel
	*/
	get rawData() {
		if (!this._rawData) throw new Error("Cannot access rawData on partial Channel. Use fetch() to populate data.");
		return this._rawData;
	}
	/**
	* The id of the channel.
	*/
	id;
	/**
	* Whether the channel is a partial channel (meaning it does not have all the data).
	* If this is true, you should use {@link BaseChannel.fetch} to get the full data of the channel.
	*/
	get partial() {
		return this._rawData === null;
	}
	/**
	* The type of the channel.
	*/
	get type() {
		if (!this._rawData) return void 0;
		return this._rawData.type;
	}
	/**
	* The flags of the channel in a bitfield.
	* @see https://discord.com/developers/docs/resources/channel#channel-object-channel-flags
	*/
	get flags() {
		if (!this._rawData) return void 0;
		return this._rawData.flags;
	}
	/**
	* Fetches the channel from the API.
	* @returns A Promise that resolves to a non-partial channel
	*/
	async fetch() {
		const newData = await this.client.rest.get(Routes.channel(this.id));
		if (!newData) throw new Error(`Channel ${this.id} not found`);
		this.setData(newData);
		return this;
	}
	/**
	* Delete the channel
	*/
	async delete() {
		await this.client.rest.delete(Routes.channel(this.id));
	}
	/**
	* Returns the Discord mention format for this channel
	* @returns The mention string in the format <#channelId>
	*/
	toString() {
		return `<#${this.id}>`;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/utils/cdn.js
/**
* Builds a Discord CDN URL with optional format and size parameters
* @param baseUrl The base URL without extension or query parameters
* @param hash The image hash (returns null if hash is null/undefined)
* @param options Optional format and size parameters
* @returns The complete CDN URL or null if hash is not provided
*/
function buildCDNUrl(baseUrl, hash, options = {}) {
	if (!hash) return null;
	const url = `${baseUrl}/${hash}.${options.format ?? "png"}`;
	if (options.size) return `${url}?size=${options.size}`;
	return url;
}
//#endregion
//#region node_modules/@buape/carbon/dist/src/utils/customIdParser.js
const parseCustomId$1 = (id) => {
	const colonIndex = id.indexOf(":");
	const key = colonIndex === -1 ? id : id.slice(0, colonIndex);
	const rawData = colonIndex === -1 ? "" : id.slice(colonIndex + 1);
	if (!key) throw new Error(`Invalid component ID: ${id}`);
	if (!rawData) return {
		key,
		data: {}
	};
	return {
		key,
		data: Object.fromEntries(rawData.split(";").filter((pair) => pair.length > 0).map((pair) => {
			const [k, v] = pair.split("=", 2);
			if (v === void 0) return [k, k];
			if (v === "true") return [k, true];
			if (v === "false") return [k, false];
			if (v === "") return [k, ""];
			const numValue = Number(v);
			if (Number.isNaN(numValue)) return [k, v];
			if (Number.isInteger(numValue) && !Number.isSafeInteger(numValue)) return [k, v];
			return [k, numValue];
		}))
	};
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/utils/payload.js
const serializePayload$1 = (payload, defaultEphemeral = false) => {
	if (typeof payload === "string") return {
		content: payload,
		flags: defaultEphemeral ? 64 : void 0
	};
	if (payload.components?.some((component) => component.isV2)) payload.flags = payload.flags ? payload.flags | MessageFlags.IsComponentsV2 : MessageFlags.IsComponentsV2;
	if (payload.ephemeral !== void 0) if (payload.ephemeral) payload.flags = payload.flags ? payload.flags | MessageFlags.Ephemeral : MessageFlags.Ephemeral;
	else payload.flags = payload.flags ? payload.flags & ~MessageFlags.Ephemeral : void 0;
	if (payload.flags && (payload.flags & MessageFlags.IsVoiceMessage) === MessageFlags.IsVoiceMessage) {
		if (payload.content) throw new Error("You cannot send a voice message with content. Voice messages must only include an audio attachment.");
		if (!payload.files || payload.files.length !== 1) throw new Error("Voice messages must include exactly one audio file attachment.");
		const voiceFile = payload.files[0];
		if (!voiceFile || voiceFile.duration_secs === void 0 || voiceFile.waveform === void 0) throw new Error("Voice message attachments must include duration_secs and waveform metadata.");
	}
	if (payload.flags && (payload.flags & MessageFlags.IsComponentsV2) === MessageFlags.IsComponentsV2) {
		if (payload.content) throw new Error("You cannot send a message with both content and v2 components. Use the TextDisplay component as a replacement for the content property in the message. https://carbon.buape.com/classes/components/text-display");
		if (payload.embeds) throw new Error("You cannot send a message with both embeds and v2 components. Use the Container component as a replacement for the embeds in the message. https://carbon.buape.com/classes/components/container");
	}
	const { ephemeral, ...payloadWithoutEphemeral } = payload;
	const data = {
		...payloadWithoutEphemeral,
		allowed_mentions: payload.allowedMentions,
		embeds: payload.embeds?.map((embed) => embed.serialize()),
		components: payload.components?.map((row) => row.serialize()),
		poll: payload.poll ? {
			...payload.poll,
			answers: payload.poll.answers.map((answer) => ({ poll_media: {
				text: answer.text,
				emoji: answer.emoji
			} })),
			allow_multiselect: payload.poll.allowMultiselect,
			layout_type: payload.poll.layoutType ?? 1
		} : void 0,
		sticker_ids: payload.stickers
	};
	if (payload.ephemeral === void 0 && defaultEphemeral) data.flags = payload.flags ? payload.flags | MessageFlags.Ephemeral : MessageFlags.Ephemeral;
	return data;
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/utils/verification.js
function getSubtleCrypto() {
	if (typeof window !== "undefined" && window.crypto) return window.crypto.subtle;
	if (typeof globalThis !== "undefined" && globalThis.crypto) return globalThis.crypto.subtle;
	if (typeof crypto !== "undefined") return crypto.subtle;
	if (typeof __require === "function") return __require("node:crypto").webcrypto.subtle;
	throw new Error("No Web Crypto API implementation found");
}
const subtleCrypto = getSubtleCrypto();
function valueToUint8Array(value, format) {
	if (value == null) return new Uint8Array();
	if (typeof value === "string") {
		if (format === "hex") {
			const matches = value.match(/.{1,2}/g);
			if (matches == null) throw new Error("Value is not a valid hex string");
			const hexVal = matches.map((byte) => Number.parseInt(byte, 16));
			return new Uint8Array(hexVal);
		}
		return new TextEncoder().encode(value);
	}
	if (Buffer.isBuffer(value)) return new Uint8Array(value);
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	if (value instanceof Uint8Array) return value;
	throw new Error("Unrecognized value type, must be one of: string, Buffer, ArrayBuffer, Uint8Array");
}
function concatUint8Arrays(arr1, arr2) {
	const merged = new Uint8Array(arr1.length + arr2.length);
	merged.set(arr1);
	merged.set(arr2, arr1.length);
	return merged;
}
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/Embed.js
/**
* Represents an embed in a message.
*/
var Embed$1 = class {
	/**
	* The title of the embed
	*/
	title;
	/**
	* The description of the embed
	*/
	description;
	/**
	* The URL of the embed
	*/
	url;
	/**
	* The timestamp of the embed
	*/
	timestamp;
	/**
	* The color of the embed
	*/
	color;
	/**
	* The footer of the embed
	*/
	footer;
	/**
	* The image URL of the embed
	*/
	image;
	/**
	* The thumbnail URL of the embed
	*/
	thumbnail;
	author;
	fields;
	/**
	* Create an embed from an API embed
	*/
	constructor(embed) {
		if (embed) {
			this.title = embed.title;
			this.description = embed.description;
			this.url = embed.url;
			this.timestamp = embed.timestamp;
			this.color = embed.color;
			this.footer = embed.footer;
			this.image = embed.image?.url;
			this.thumbnail = embed.thumbnail?.url;
			this.author = embed.author;
			this.fields = embed.fields;
		}
	}
	/**
	* Serialize the embed to an API embed
	* @internal
	*/
	serialize() {
		return {
			title: this.title,
			description: this.description,
			url: this.url,
			timestamp: this.timestamp,
			color: this.color,
			footer: this.footer,
			image: this.image ? { url: this.image } : void 0,
			thumbnail: this.thumbnail ? { url: this.thumbnail } : void 0,
			author: this.author,
			fields: this.fields
		};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/functions/errorsMapper.js
const errorMapper = (data) => {
	const result = [];
	if (data && "components" in data) {
		for (const component of data.components) result.push({
			code: "0",
			location: component,
			message: `Unknown error at component index ${component} - https://github.com/buape/carbon/issues/247`
		});
		return result;
	}
	if (!data?.errors) return [];
	const traverse = (obj, path) => {
		if (typeof obj === "object" && obj !== null) if (Array.isArray(obj)) for (let i = 0; i < obj.length; i++) traverse(obj[i], [...path, i.toString()]);
		else for (const [key, value] of Object.entries(obj)) if (key === "_errors") for (const error of value) result.push({
			code: error.code,
			location: path.length > 0 ? path.join(".") : "errors",
			message: error.message
		});
		else traverse(value, [...path, key]);
	};
	traverse(data.errors, []);
	return result;
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/errors/BaseError.js
var BaseError = class extends Error {};
//#endregion
//#region node_modules/@buape/carbon/dist/src/errors/DiscordError.js
var DiscordError = class extends BaseError {
	/**
	* The HTTP status code of the response from Discord
	* @see https://discord.com/developers/docs/topics/opcodes-and-status-codes#http
	*/
	status;
	/**
	* The Discord error code
	* @see https://discord.com/developers/docs/topics/opcodes-and-status-codes#json
	*/
	discordCode;
	/**
	* An array of the errors that were returned by Discord
	*/
	errors;
	/**
	* The raw body of the error from Discord
	* @internal
	*/
	rawBody;
	constructor(response, body) {
		super(body.message);
		this.rawBody = body;
		this.status = response.status;
		this.discordCode = body.code;
		this.errors = errorMapper(body);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/User.js
var User = class extends Base {
	constructor(client, rawDataOrId) {
		super(client);
		if (typeof rawDataOrId === "string") this.id = rawDataOrId;
		else {
			this._rawData = rawDataOrId;
			this.id = rawDataOrId.id;
			this.setData(rawDataOrId);
		}
	}
	_rawData = null;
	setData(data) {
		if (!data) throw new Error("Cannot set data without having data... smh");
		this._rawData = data;
	}
	/**
	* The raw Discord API data for this user
	*/
	get rawData() {
		if (!this._rawData) throw new Error("Cannot access rawData on partial User. Use fetch() to populate data.");
		return this._rawData;
	}
	/**
	* The ID of the user
	*/
	id;
	/**
	* Whether the user is a partial user (meaning it does not have all the data).
	* If this is true, you should use {@link User.fetch} to get the full data of the user.
	*/
	get partial() {
		return this._rawData === null;
	}
	/**
	* The username of the user.
	*/
	get username() {
		if (!this._rawData) return void 0;
		return this._rawData.username;
	}
	/**
	* The global name of the user.
	*/
	get globalName() {
		if (!this._rawData) return void 0;
		return this._rawData.global_name;
	}
	/**
	* The discriminator of the user.
	*/
	get discriminator() {
		if (!this._rawData) return void 0;
		return this._rawData.discriminator;
	}
	/**
	* Is this user a bot?
	*/
	get bot() {
		if (!this._rawData) return void 0;
		return this._rawData.bot ?? false;
	}
	/**
	* Is this user a system user?
	*/
	get system() {
		if (!this._rawData) return void 0;
		return this._rawData.system ?? false;
	}
	/**
	* The public flags of the user. (Bitfield)
	* @see https://discord.com/developers/docs/resources/user#user-object-user-flags
	*/
	get flags() {
		if (!this._rawData) return void 0;
		return this._rawData.public_flags;
	}
	/**
	* The avatar hash of the user.
	* You can use {@link User.avatarUrl} to get the URL of the avatar.
	*/
	get avatar() {
		if (!this._rawData) return void 0;
		return this._rawData.avatar;
	}
	/**
	* Get the URL of the user's avatar with default settings (png format)
	*/
	get avatarUrl() {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/avatars/${this.id}`, this.avatar);
	}
	/**
	* Get the URL of the user's avatar with custom format and size options
	* @param options Optional format and size parameters
	* @returns The avatar URL or null if no avatar is set
	*/
	getAvatarUrl(options) {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/avatars/${this.id}`, this.avatar, options);
	}
	/**
	* The banner hash of the user.
	* You can use {@link User.bannerUrl} to get the URL of the banner.
	*/
	get banner() {
		if (!this._rawData) return void 0;
		return this._rawData.banner ?? null;
	}
	/**
	* Get the URL of the user's banner with default settings (png format)
	*/
	get bannerUrl() {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/banners/${this.id}`, this.banner);
	}
	/**
	* Get the URL of the user's banner with custom format and size options
	* @param options Optional format and size parameters
	* @returns The banner URL or null if no banner is set
	*/
	getBannerUrl(options) {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/banners/${this.id}`, this.banner, options);
	}
	/**
	* The accent color of the user.
	*/
	get accentColor() {
		if (!this._rawData) return void 0;
		return this._rawData.accent_color ?? null;
	}
	/**
	* Returns the Discord mention format for this user
	* @returns The mention string in the format <@userId>
	*/
	toString() {
		return `<@${this.id}>`;
	}
	/**
	* Fetch updated data for this user.
	* If the user is partial, this will fetch all the data for the user and populate the fields.
	* If the user is not partial, all fields will be updated with new values from Discord.
	* @returns A Promise that resolves to a non-partial User
	*/
	async fetch() {
		const newData = await this.client.rest.get(Routes.user(this.id));
		if (!newData) throw new Error(`User ${this.id} not found`);
		this.setData(newData);
		return this;
	}
	/**
	* Instantiate a new DM channel with this user.
	*/
	async createDm() {
		return await this.client.rest.post(Routes.userChannels(), { body: { recipient_id: this.id } });
	}
	/**
	* Send a message to this user.
	*/
	async send(data) {
		const dmChannel = await this.createDm();
		const message = await this.client.rest.post(Routes.channelMessages(dmChannel.id), { body: serializePayload$1(data) });
		return new Message(this.client, message);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/Emoji.js
var BaseEmoji = class extends Base {
	_rawData;
	constructor(client, rawData) {
		super(client);
		this._rawData = rawData;
	}
	/**
	* The ID of the emoji
	*/
	get id() {
		return this._rawData.id;
	}
	/**
	* The name of the emoji
	*/
	get name() {
		return this._rawData.name;
	}
	/**
	* The roles that can use the emoji
	*/
	get roles() {
		return this._rawData.roles;
	}
	/**
	* The user that created the emoji
	*/
	get user() {
		if (!this._rawData.user) return void 0;
		return new User(this.client, this._rawData.user);
	}
	/**
	* Whether the emoji requires colons
	*/
	get requireColons() {
		return this._rawData.require_colons;
	}
	/**
	* Whether the emoji is managed
	*/
	get managed() {
		return this._rawData.managed;
	}
	/**
	* Whether the emoji is animated
	*/
	get animated() {
		return this._rawData.animated;
	}
	/**
	* Whether the emoji is available (may be false due to loss of Server Boosts)
	*/
	get available() {
		return this._rawData.available;
	}
	/**
	* Get the URL of the emoji with default settings (uses gif for animated, png otherwise)
	*/
	get url() {
		if (!this.id) return null;
		const format = this.animated ? "gif" : "png";
		return buildCDNUrl(`https://cdn.discordapp.com/emojis`, this.id, { format });
	}
	/**
	* Get the URL of the emoji with custom format and size options
	* @param options Optional format and size parameters
	* @returns The emoji URL or null if no ID is set
	*/
	getUrl(options) {
		if (!this.id) return null;
		return buildCDNUrl(`https://cdn.discordapp.com/emojis`, this.id, options);
	}
	toString() {
		return `<${this.animated ? "a" : ""}:${this.name}:${this.id}>`;
	}
};
var ApplicationEmoji = class extends BaseEmoji {
	applicationId;
	constructor(client, rawData, applicationId) {
		super(client, rawData);
		this.applicationId = applicationId;
	}
	get rawData() {
		return this._rawData;
	}
	setData(data) {
		if (!data) throw new Error("Cannot set data without having data... smh");
		this._rawData = data;
	}
	async setName(name) {
		if (!this.id) throw new Error("Emoji ID is required");
		const updatedEmoji = await this.client.rest.patch(Routes.applicationEmoji(this.applicationId, this.id), { body: { name } });
		this.setData(updatedEmoji);
	}
	async delete() {
		if (!this.id) throw new Error("Emoji ID is required");
		await this.client.rest.delete(Routes.applicationEmoji(this.applicationId, this.id));
	}
};
var GuildEmoji = class extends BaseEmoji {
	guildId;
	constructor(client, rawData, guildId) {
		super(client, rawData);
		this.guildId = guildId;
	}
	get rawData() {
		return this._rawData;
	}
	setData(data) {
		if (!data) throw new Error("Cannot set data without having data... smh");
		this._rawData = data;
	}
	async setName(name) {
		if (!this.id) throw new Error("Emoji ID is required");
		if (!this.guildId) throw new Error("Guild ID is required");
		const updatedEmoji = await this.client.rest.patch(Routes.guildEmoji(this.guildId, this.id), { body: { name } });
		this.setData(updatedEmoji);
	}
	/**
	* Set the roles that can use the emoji
	* @param roles The roles to set
	*/
	async setRoles(roles) {
		if (!this.id) throw new Error("Emoji ID is required");
		if (!this.guildId) throw new Error("Guild ID is required");
		const updatedEmoji = await this.client.rest.patch(Routes.guildEmoji(this.guildId, this.id), { body: { roles: roles.map((role) => typeof role === "string" ? role : role.id) } });
		this.setData(updatedEmoji);
	}
	async delete() {
		if (!this.id) throw new Error("Emoji ID is required");
		if (!this.guildId) throw new Error("Guild ID is required");
		await this.client.rest.delete(Routes.guildEmoji(this.guildId, this.id));
	}
};
const maxPermissions = Object.values(PermissionFlagsBits);
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/Role.js
var Role = class extends Base {
	constructor(client, rawDataOrId, guildId) {
		super(client);
		this._guildId = guildId;
		if (typeof rawDataOrId === "string") this.id = rawDataOrId;
		else {
			this._rawData = rawDataOrId;
			this.id = rawDataOrId.id;
			this.setData(rawDataOrId);
		}
	}
	_rawData = null;
	_guildId;
	setData(data) {
		if (!data) throw new Error("Cannot set data without having data... smh");
		this._rawData = data;
	}
	setField(key, value) {
		if (!this._rawData) throw new Error("Cannot set field without having data... smh");
		Reflect.set(this._rawData, key, value);
	}
	/**
	* The raw Discord API data for this role
	*/
	get rawData() {
		if (!this._rawData) throw new Error("Cannot access rawData on partial Role. Use fetch() to populate data.");
		return this._rawData;
	}
	/**
	* The ID of the role.
	*/
	id;
	/**
	* The ID of the guild this role belongs to
	*/
	get guildId() {
		if (!this._guildId) throw new Error("Guild ID is not available for this role. Use guild.fetchRole() to get a role with guild context.");
		return this._guildId;
	}
	/**
	* Whether the role is a partial role (meaning it does not have all the data).
	* If this is true, you should use {@link Role.fetch} to get the full data of the role.
	*/
	get partial() {
		return this._rawData === null;
	}
	/**
	* The name of the role.
	*/
	get name() {
		if (!this._rawData) return void 0;
		return this._rawData.name;
	}
	/**
	* The color of the role.
	*/
	get color() {
		if (!this._rawData) return void 0;
		return this._rawData.color;
	}
	/**
	* The icon hash of the role.
	* You can use {@link Role.iconUrl} to get the URL of the icon.
	*/
	get icon() {
		if (!this._rawData) return void 0;
		return this._rawData.icon ?? null;
	}
	/**
	* Get the URL of the role's icon with default settings (png format)
	*/
	get iconUrl() {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/role-icons/${this.id}`, this.icon);
	}
	/**
	* Get the URL of the role's icon with custom format and size options
	* @param options Optional format and size parameters
	* @returns The icon URL or null if no icon is set
	*/
	getIconUrl(options) {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/role-icons/${this.id}`, this.icon, options);
	}
	/**
	* If this role is mentionable.
	*/
	get mentionable() {
		if (!this._rawData) return void 0;
		return this._rawData.mentionable;
	}
	/**
	* If this role is hoisted.
	*/
	get hoisted() {
		if (!this._rawData) return void 0;
		return this._rawData.hoist;
	}
	/**
	* The position of the role.
	*/
	get position() {
		if (!this._rawData) return void 0;
		return this._rawData.position;
	}
	/**
	* The permissions of the role.
	*/
	get permissions() {
		if (!this._rawData) return void 0;
		return BigInt(this._rawData.permissions);
	}
	/**
	* If this role is managed by an integration.
	*/
	get managed() {
		if (!this._rawData) return void 0;
		return this._rawData.managed;
	}
	/**
	* The unicode emoji for the role.
	*/
	get unicodeEmoji() {
		if (!this._rawData) return void 0;
		return this._rawData.unicode_emoji ?? null;
	}
	/**
	* The flags of this role.
	* @see https://discord.com/developers/docs/topics/permissions#role-object-role-flags
	*/
	get flags() {
		if (!this._rawData) return void 0;
		return this._rawData.flags;
	}
	/**
	* The tags of this role.
	* @see https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure
	*/
	get tags() {
		if (!this._rawData) return void 0;
		return this._rawData.tags;
	}
	/**
	* Returns the Discord mention format for this role
	* @returns The mention string in the format <@&roleId>
	*/
	toString() {
		return `<@&${this.id}>`;
	}
	/**
	* Fetch updated data for this role.
	* If the role is partial, this will fetch all the data for the role and populate the fields.
	* If the role is not partial, all fields will be updated with new values from Discord.
	* @returns A Promise that resolves to a non-partial Role
	*/
	async fetch() {
		const newData = await this.client.rest.get(Routes.guildRole(this.guildId, this.id));
		if (!newData) throw new Error(`Role ${this.id} not found`);
		this.setData(newData);
		return this;
	}
	/**
	* Set the name of the role
	* @param name The new name for the role
	* @param reason The reason for changing the name (will be shown in audit log)
	*/
	async setName(name, reason) {
		await this.client.rest.patch(Routes.guildRole(this.guildId, this.id), {
			body: { name },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("name", name);
	}
	/**
	* Set the color of the role
	* @param color The new color for the role
	* @param reason The reason for changing the color (will be shown in audit log)
	*/
	async setColor(color, reason) {
		await this.client.rest.patch(Routes.guildRole(this.guildId, this.id), {
			body: { color },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("color", color);
	}
	/**
	* Set the icon of the role
	* @param icon The unicode emoji or icon URL to set
	* @param reason The reason for changing the icon (will be shown in audit log)
	*/
	async setIcon(icon, reason) {
		await this.client.rest.patch(Routes.guildRole(this.guildId, this.id), {
			body: { icon },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("icon", icon);
	}
	/**
	* Set the mentionable status of the role
	* @param mentionable Whether the role should be mentionable
	* @param reason The reason for changing the mentionable status (will be shown in audit log)
	*/
	async setMentionable(mentionable, reason) {
		await this.client.rest.patch(Routes.guildRole(this.guildId, this.id), {
			body: { mentionable },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("mentionable", mentionable);
	}
	/**
	* Set the hoisted status of the role
	* @param hoisted Whether the role should be hoisted
	* @param reason The reason for changing the hoisted status (will be shown in audit log)
	*/
	async setHoisted(hoisted, reason) {
		await this.client.rest.patch(Routes.guildRole(this.guildId, this.id), {
			body: { hoist: hoisted },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("hoist", hoisted);
	}
	/**
	* Set the position of the role
	* @param position The new position for the role
	* @param reason The reason for changing the position (will be shown in audit log)
	*/
	async setPosition(position, reason) {
		await this.client.rest.patch(Routes.guildRole(this.guildId, this.id), {
			body: { position },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("position", position);
	}
	/**
	* Set the permissions of the role
	* @param permissions The permissions to set
	* @param reason The reason for changing the permissions (will be shown in audit log)
	*/
	async setPermissions(permissions, reason) {
		const permValue = permissions.reduce((acc, perm) => acc | perm, BigInt(0));
		await this.client.rest.patch(Routes.guildRole(this.guildId, this.id), {
			body: { permissions: permValue.toString() },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("permissions", permValue.toString());
	}
	/**
	* Delete the role
	* @param reason The reason for deleting the role (will be shown in audit log)
	*/
	async delete(reason) {
		await this.client.rest.delete(Routes.guildRole(this.guildId, this.id), { headers: reason ? { "X-Audit-Log-Reason": reason } : void 0 });
	}
	/**
	* Get the member count for this role
	* @returns A Promise that resolves to the number of members with this role
	*/
	async fetchMemberCount() {
		return (await new Guild(this.client, this.guildId).fetchRoleMemberCounts()).find((r) => r.id === this.id)?.count ?? 0;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GuildMember.js
var GuildMember = class extends Base {
	constructor(client, rawData, guild) {
		super(client);
		this._rawData = rawData;
		this.guild = guild;
		this.user = new User(client, rawData.user);
		this.setData(rawData);
	}
	_rawData = null;
	setData(data) {
		if (!data) throw new Error("Cannot set data without having data... smh");
		this._rawData = data;
	}
	setField(key, value) {
		if (!this._rawData) throw new Error("Cannot set field without having data... smh");
		Reflect.set(this._rawData, key, value);
	}
	/**
	* The raw Discord API data for this guild member
	*/
	get rawData() {
		if (!this._rawData) throw new Error("Cannot access rawData on partial GuildMember. Use fetch() to populate data.");
		return this._rawData;
	}
	/**
	* The guild object of the member.
	*/
	guild;
	/**
	* The user object of the member.
	*/
	user;
	/**
	* The guild-specific nickname of the member.
	*/
	get nickname() {
		if (!this._rawData) return void 0;
		return this._rawData.nick ?? null;
	}
	/**
	* The guild-specific avatar hash of the member.
	* You can use {@link GuildMember.avatarUrl} to get the URL of the avatar.
	*/
	get avatar() {
		if (!this._rawData) return void 0;
		return this._rawData.avatar ?? null;
	}
	/**
	* Get the URL of the member's guild-specific avatar with default settings (png format)
	*/
	get avatarUrl() {
		if (!this._rawData) return void 0;
		if (!this.user) return null;
		return buildCDNUrl(`https://cdn.discordapp.com/guilds/${this.guild.id}/users/${this.user.id}/avatars`, this.avatar);
	}
	/**
	* Get the URL of the member's guild-specific avatar with custom format and size options
	* @param options Optional format and size parameters
	* @returns The avatar URL or null if no avatar is set
	*/
	getAvatarUrl(options) {
		if (!this._rawData) return void 0;
		if (!this.user) return null;
		return buildCDNUrl(`https://cdn.discordapp.com/guilds/${this.guild.id}/users/${this.user.id}/avatars`, this.avatar, options);
	}
	/**
	* Is this member muted in Voice Channels?
	*/
	get mute() {
		if (!this._rawData) return void 0;
		return this._rawData.mute;
	}
	/**
	* Is this member deafened in Voice Channels?
	*/
	get deaf() {
		if (!this._rawData) return void 0;
		return this._rawData.deaf;
	}
	/**
	* The date since this member boosted the guild, if applicable.
	*/
	get premiumSince() {
		if (!this._rawData) return void 0;
		return this._rawData.premium_since ?? null;
	}
	/**
	* The flags of the member.
	* @see https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags
	*/
	get flags() {
		if (!this._rawData) return void 0;
		return this._rawData.flags;
	}
	/**
	* The roles of the member
	*/
	get roles() {
		if (!this._rawData) return void 0;
		return (this._rawData.roles ?? []).map((role) => new Role(this.client, role, this.guild.id));
	}
	/**
	* The joined date of the member
	*/
	get joinedAt() {
		if (!this._rawData) return void 0;
		return this._rawData.joined_at;
	}
	/**
	* The date when the member's communication privileges (timeout) will be reinstated
	*/
	get communicationDisabledUntil() {
		if (!this._rawData) return void 0;
		return this._rawData.communication_disabled_until ?? null;
	}
	/**
	* Is this member yet to pass the guild's Membership Screening requirements?
	*/
	get pending() {
		if (!this._rawData) return void 0;
		return this._rawData.pending ?? false;
	}
	async getVoiceState() {
		const voiceState = await this.client.rest.get(`/guilds/${this.guild.id}/members/${this.user.id}/voice`);
		if (!voiceState) return null;
		return {
			channelId: voiceState.channel_id ?? null,
			guildId: this.guild.id,
			userId: this.user.id,
			sessionId: voiceState.session_id,
			deaf: voiceState.deaf ?? false,
			mute: voiceState.mute ?? false,
			selfDeaf: voiceState.self_deaf ?? false,
			selfMute: voiceState.self_mute ?? false,
			selfStream: voiceState.self_stream ?? false,
			selfVideo: voiceState.self_video ?? false,
			suppress: voiceState.suppress ?? false,
			requestToSpeakTimestamp: voiceState.request_to_speak_timestamp ?? null
		};
	}
	async getPermissions() {
		if (!this._rawData) return void 0;
		if (this.guild.ownerId === this.user.id) return maxPermissions;
		return (await Promise.all(this.roles.map(async (x) => {
			if (x.partial) await x.fetch();
			if (!x.permissions) return void 0;
			return BigInt(x.permissions);
		}))).filter((x) => x !== void 0);
	}
	/**
	* Set the nickname of the member
	*/
	async setNickname(nickname, reason) {
		await this.client.rest.patch(`/guilds/${this.guild?.id}/members/${this.user?.id}`, {
			body: { nick: nickname },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("nick", nickname);
	}
	/**
	* Set the member's guild-specific data
	* This will only work if the current member is the bot itself, and will throw an error if it is not
	*/
	async setMemberData(data, reason) {
		await this.client.rest.patch(`/guilds/${this.guild?.id}/members/${this.user?.id}`, {
			body: data,
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		if ("banner" in data) this.setField("banner", data.banner ?? null);
		if ("avatar" in data) this.setField("avatar", data.avatar ?? null);
	}
	/**
	* Add a role to the member
	*/
	async addRole(roleId, reason) {
		await this.client.rest.put(`/guilds/${this.guild?.id}/members/${this.user?.id}/roles/${roleId}`, { headers: reason ? { "X-Audit-Log-Reason": reason } : void 0 });
		const ids = this._rawData?.roles ?? [];
		if (!ids.includes(roleId)) this.setField("roles", [...ids, roleId]);
	}
	/**
	* Remove a role from the member
	*/
	async removeRole(roleId, reason) {
		await this.client.rest.delete(`/guilds/${this.guild?.id}/members/${this.user?.id}/roles/${roleId}`, { headers: reason ? { "X-Audit-Log-Reason": reason } : void 0 });
		const ids = (this._rawData?.roles ?? []).filter((id) => id !== roleId);
		this.setField("roles", ids);
	}
	/**
	* Kick the member from the guild
	*/
	async kick(reason) {
		await this.client.rest.delete(`/guilds/${this.guild?.id}/members/${this.user?.id}`, { headers: reason ? { "X-Audit-Log-Reason": reason } : void 0 });
	}
	/**
	* Ban the member from the guild
	*/
	async ban(options = {}) {
		await this.client.rest.put(`/guilds/${this.guild?.id}/bans/${this.user?.id}`, {
			body: {
				reason: options.reason,
				delete_message_days: options.deleteMessageDays
			},
			headers: options.reason ? { "X-Audit-Log-Reason": options.reason } : void 0
		});
	}
	/**
	* Mute a member in voice channels
	*/
	async muteMember(reason) {
		await this.client.rest.patch(`/guilds/${this.guild?.id}/members/${this.user?.id}`, {
			body: { mute: true },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("mute", true);
	}
	/**
	* Unmute a member in voice channels
	*/
	async unmuteMember(reason) {
		await this.client.rest.patch(`/guilds/${this.guild?.id}/members/${this.user?.id}`, {
			body: { mute: false },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("mute", false);
	}
	/**
	* Deafen a member in voice channels
	*/
	async deafenMember(reason) {
		await this.client.rest.patch(`/guilds/${this.guild?.id}/members/${this.user?.id}`, {
			body: { deaf: true },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("deaf", true);
	}
	/**
	* Undeafen a member in voice channels
	*/
	async undeafenMember(reason) {
		await this.client.rest.patch(`/guilds/${this.guild?.id}/members/${this.user?.id}`, {
			body: { deaf: false },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("deaf", false);
	}
	/**
	* Set or remove a timeout for a member in the guild
	*/
	async timeoutMember(communicationDisabledUntil, reason) {
		await this.client.rest.patch(`/guilds/${this.guild?.id}/members/${this.user?.id}`, {
			body: { communication_disabled_until: communicationDisabledUntil },
			headers: reason ? { "X-Audit-Log-Reason": reason } : void 0
		});
		this.setField("communication_disabled_until", communicationDisabledUntil);
	}
	async fetch() {
		const newData = await this.client.rest.get(Routes.guildMember(this.guild.id, this.user.id));
		if (!newData) throw new Error(`Member ${this.user.id} not found`);
		this.setData(newData);
		return this;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GuildScheduledEvent.js
var GuildScheduledEvent = class extends Base {
	constructor(client, rawDataOrId, guildId) {
		super(client);
		if (typeof rawDataOrId === "string") {
			this.id = rawDataOrId;
			this.guildId = guildId;
		} else {
			this._rawData = rawDataOrId;
			this.id = rawDataOrId.id;
			this.guildId = rawDataOrId.guild_id;
			this.setData(rawDataOrId);
		}
	}
	_rawData = null;
	setData(data) {
		if (!data) throw new Error("Cannot set data without having data... smh");
		this._rawData = data;
	}
	/**
	* The raw Discord API data for this scheduled event
	*/
	get rawData() {
		if (!this._rawData) throw new Error("Cannot access rawData on partial GuildScheduledEvent. Use fetch() to populate data.");
		return this._rawData;
	}
	/**
	* The ID of the scheduled event
	*/
	id;
	/**
	* The ID of the guild this scheduled event belongs to
	*/
	guildId;
	/**
	* Whether the scheduled event is a partial scheduled event (meaning it does not have all the data).
	* If this is true, you should use {@link GuildScheduledEvent.fetch} to get the full data of the scheduled event.
	*/
	get partial() {
		return this._rawData === null;
	}
	/**
	* The name of the scheduled event
	*/
	get name() {
		if (!this._rawData) return void 0;
		return this._rawData.name;
	}
	/**
	* The description of the scheduled event
	*/
	get description() {
		if (!this._rawData) return void 0;
		return this._rawData.description;
	}
	/**
	* The time the scheduled event will start
	*/
	get scheduledStartTime() {
		if (!this._rawData) return void 0;
		return this._rawData.scheduled_start_time;
	}
	/**
	* The time the scheduled event will end, or null if the event does not have a scheduled end time
	*/
	get scheduledEndTime() {
		if (!this._rawData) return void 0;
		return this._rawData.scheduled_end_time;
	}
	/**
	* The privacy level of the scheduled event
	*/
	get privacyLevel() {
		if (!this._rawData) return void 0;
		return this._rawData.privacy_level;
	}
	/**
	* The status of the scheduled event
	*/
	get status() {
		if (!this._rawData) return void 0;
		return this._rawData.status;
	}
	/**
	* The type of the scheduled event
	*/
	get entityType() {
		if (!this._rawData) return void 0;
		return this._rawData.entity_type;
	}
	/**
	* The ID of the channel where the scheduled event will be hosted, or null if entity_type is EXTERNAL
	*/
	get channelId() {
		if (!this._rawData) return void 0;
		return this._rawData.channel_id;
	}
	/**
	* Additional metadata for the scheduled event
	*/
	get entityMetadata() {
		if (!this._rawData) return void 0;
		return this._rawData.entity_metadata;
	}
	/**
	* The user that created the scheduled event
	*/
	get creator() {
		if (!this._rawData) return void 0;
		return this._rawData.creator ? new User(this.client, this._rawData.creator) : null;
	}
	/**
	* The number of users subscribed to the scheduled event
	*/
	get userCount() {
		if (!this._rawData) return void 0;
		return this._rawData.user_count;
	}
	/**
	* The cover image hash of the scheduled event
	*/
	get image() {
		if (!this._rawData) return void 0;
		return this._rawData.image;
	}
	/**
	* Get the URL of the scheduled event's cover image
	*/
	get imageUrl() {
		if (!this._rawData) return void 0;
		if (!this.image) return null;
		return `https://cdn.discordapp.com/guild-events/${this.id}/${this.image}.png`;
	}
	/**
	* Fetch updated data for this scheduled event.
	* If the scheduled event is partial, this will fetch all the data for the scheduled event and populate the fields.
	* If the scheduled event is not partial, all fields will be updated with new values from Discord.
	* @returns A Promise that resolves to a non-partial GuildScheduledEvent
	*/
	async fetch() {
		const newData = await this.client.rest.get(Routes.guildScheduledEvent(this.guildId, this.id));
		if (!newData) throw new Error(`Scheduled event ${this.id} not found`);
		this.setData(newData);
		return this;
	}
	/**
	* Edit the scheduled event
	* @param data The data to update the scheduled event with
	* @returns A Promise that resolves to the updated scheduled event
	*/
	async edit(data) {
		const body = {};
		if (data.name !== void 0) body.name = data.name;
		if (data.description !== void 0) body.description = data.description;
		if (data.scheduledStartTime !== void 0) body.scheduled_start_time = data.scheduledStartTime;
		if (data.scheduledEndTime !== void 0) body.scheduled_end_time = data.scheduledEndTime;
		if (data.privacyLevel !== void 0) body.privacy_level = data.privacyLevel;
		if (data.entityType !== void 0) body.entity_type = data.entityType;
		if (data.channelId !== void 0) body.channel_id = data.channelId;
		if (data.entityMetadata !== void 0) body.entity_metadata = data.entityMetadata;
		if (data.image !== void 0) body.image = data.image;
		const updatedData = await this.client.rest.patch(Routes.guildScheduledEvent(this.guildId, this.id), { body });
		this.setData(updatedData);
		return this;
	}
	/**
	* Delete the scheduled event
	*/
	async delete() {
		await this.client.rest.delete(Routes.guildScheduledEvent(this.guildId, this.id));
	}
	/**
	* Get the guild this scheduled event belongs to
	*/
	async getGuild() {
		return await new Guild(this.client, this.guildId).fetch();
	}
	/**
	* Fetch the users subscribed to this scheduled event
	* @param options The options for fetching the users
	* @returns A Promise that resolves to an array of Users
	*/
	async fetchUsers(options) {
		const queryParams = {};
		if (options?.before) queryParams.before = options.before;
		if (options?.after) queryParams.after = options.after;
		if (options?.limit) queryParams.limit = options.limit.toString();
		return (await this.client.rest.get(Routes.guildScheduledEventUsers(this.guildId, this.id), queryParams)).map((userData) => new User(this.client, userData.user));
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/Guild.js
var Guild = class Guild extends Base {
	constructor(client, rawDataOrId) {
		super(client);
		if (typeof rawDataOrId === "string") this.id = rawDataOrId;
		else {
			this._rawData = rawDataOrId;
			this.id = rawDataOrId.id;
			this.setData(rawDataOrId);
		}
	}
	_rawData = null;
	setData(data) {
		if (!data) throw new Error("Cannot set data without having data... smh");
		this._rawData = data;
	}
	setField(key, value) {
		if (!this._rawData) throw new Error("Cannot set field without having data... smh");
		Reflect.set(this._rawData, key, value);
	}
	/**
	* The raw Discord API data for this guild
	*/
	get rawData() {
		if (!this._rawData) throw new Error("Cannot access rawData on partial Guild. Use fetch() to populate data.");
		return this._rawData;
	}
	/**
	* The ID of the guild
	*/
	id;
	/**
	* Whether the guild is a partial guild (meaning it does not have all the data).
	* If this is true, you should use {@link Guild.fetch} to get the full data of the guild.
	*/
	get partial() {
		return this._rawData === null;
	}
	/**
	* The name of the guild.
	*/
	get name() {
		if (!this._rawData) return void 0;
		return this._rawData.name;
	}
	/**
	* The description of the guild.
	*/
	get description() {
		if (!this._rawData) return void 0;
		return this._rawData.description;
	}
	/**
	* The icon hash of the guild.
	* You can use {@link Guild.iconUrl} to get the URL of the icon.
	*/
	get icon() {
		if (!this._rawData) return void 0;
		return this._rawData.icon;
	}
	/**
	* Get the URL of the guild's icon with default settings (png format)
	*/
	get iconUrl() {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/icons/${this.id}`, this.icon);
	}
	/**
	* Get the URL of the guild's icon with custom format and size options
	* @param options Optional format and size parameters
	* @returns The icon URL or null if no icon is set
	*/
	getIconUrl(options) {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/icons/${this.id}`, this.icon, options);
	}
	/**
	* The splash hash of the guild.
	* You can use {@link Guild.splashUrl} to get the URL of the splash.
	*/
	get splash() {
		if (!this._rawData) return void 0;
		return this._rawData.splash;
	}
	/**
	* Get the URL of the guild's splash with default settings (png format)
	*/
	get splashUrl() {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/splashes/${this.id}`, this.splash);
	}
	/**
	* Get the URL of the guild's splash with custom format and size options
	* @param options Optional format and size parameters
	* @returns The splash URL or null if no splash is set
	*/
	getSplashUrl(options) {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/splashes/${this.id}`, this.splash, options);
	}
	/**
	* The ID of the owner of the guild.
	*/
	get ownerId() {
		if (!this._rawData) return void 0;
		return this._rawData.owner_id;
	}
	/**
	* Get all roles in the guild
	*/
	get roles() {
		if (!this._rawData) return void 0;
		const roles = this._rawData?.roles;
		if (!roles) throw new Error("Cannot get roles without having data... smh");
		return roles.map((role) => new Role(this.client, role, this.id));
	}
	/**
	* The preferred locale of the guild.
	*/
	get preferredLocale() {
		if (!this._rawData) return void 0;
		return this._rawData.preferred_locale;
	}
	/**
	* The discovery splash hash of the guild.
	* You can use {@link Guild.discoverySplashUrl} to get the URL of the discovery splash.
	*/
	get discoverySplash() {
		if (!this._rawData) return void 0;
		return this._rawData.discovery_splash;
	}
	/**
	* Get the URL of the guild's discovery splash with default settings (png format)
	*/
	get discoverySplashUrl() {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/discovery-splashes/${this.id}`, this.discoverySplash);
	}
	/**
	* Get the URL of the guild's discovery splash with custom format and size options
	* @param options Optional format and size parameters
	* @returns The discovery splash URL or null if no discovery splash is set
	*/
	getDiscoverySplashUrl(options) {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/discovery-splashes/${this.id}`, this.discoverySplash, options);
	}
	/**
	* Whether the user is the owner of the guild
	*/
	get owner() {
		if (!this._rawData) return void 0;
		return this._rawData.owner ?? false;
	}
	/**
	* Total permissions for the user in the guild (excludes overrides)
	*/
	get permissions() {
		if (!this._rawData) return void 0;
		return this._rawData.permissions;
	}
	/**
	* ID of afk channel
	*/
	get afkChannelId() {
		if (!this._rawData) return void 0;
		return this._rawData.afk_channel_id;
	}
	/**
	* afk timeout in seconds, can be set to: `60`, `300`, `900`, `1800`, `3600`
	*/
	get afkTimeout() {
		if (!this._rawData) return void 0;
		return this._rawData.afk_timeout;
	}
	/**
	* Whether the guild widget is enabled
	*/
	get widgetEnabled() {
		if (!this._rawData) return void 0;
		return this._rawData.widget_enabled ?? false;
	}
	/**
	* The channel id that the widget will generate an invite to, or `null` if set to no invite
	*/
	get widgetChannelId() {
		if (!this._rawData) return void 0;
		return this._rawData.widget_channel_id ?? null;
	}
	/**
	* Verification level required for the guild
	*/
	get verificationLevel() {
		if (!this._rawData) return void 0;
		return this._rawData.verification_level;
	}
	/**
	* Default message notifications level
	*/
	get defaultMessageNotifications() {
		if (!this._rawData) return void 0;
		return this._rawData.default_message_notifications;
	}
	/**
	* Explicit content filter level
	*/
	get explicitContentFilter() {
		if (!this._rawData) return void 0;
		return this._rawData.explicit_content_filter;
	}
	/**
	* Custom guild emojis
	*/
	get emojis() {
		if (!this._rawData) return void 0;
		return this._rawData.emojis.map((emoji) => new GuildEmoji(this.client, emoji, this.id));
	}
	/**
	* Enabled guild features
	*/
	get features() {
		if (!this._rawData) return void 0;
		return this._rawData.features;
	}
	/**
	* Required MFA level for the guild
	*/
	get mfaLevel() {
		if (!this._rawData) return void 0;
		return this._rawData.mfa_level;
	}
	/**
	* Application id of the guild creator if it is bot-created
	*/
	get applicationId() {
		if (!this._rawData) return void 0;
		return this._rawData.application_id;
	}
	/**
	* The id of the channel where guild notices such as welcome messages and boost events are posted
	*/
	get systemChannelId() {
		if (!this._rawData) return void 0;
		return this._rawData.system_channel_id;
	}
	/**
	* System channel flags
	*/
	get systemChannelFlags() {
		if (!this._rawData) return void 0;
		return this._rawData.system_channel_flags;
	}
	/**
	* The id of the channel where Community guilds can display rules and/or guidelines
	*/
	get rulesChannelId() {
		if (!this._rawData) return void 0;
		return this._rawData.rules_channel_id;
	}
	/**
	* The maximum number of presences for the guild (`null` is always returned, apart from the largest of guilds)
	*/
	get maxPresences() {
		if (!this._rawData) return void 0;
		return this._rawData.max_presences ?? null;
	}
	/**
	* The maximum number of members for the guild
	*/
	get maxMembers() {
		if (!this._rawData) return void 0;
		return this._rawData.max_members ?? 0;
	}
	/**
	* The vanity url code for the guild
	*/
	get vanityUrlCode() {
		if (!this._rawData) return void 0;
		return this._rawData.vanity_url_code;
	}
	/**
	* Banner hash
	* You can use {@link Guild.bannerUrl} to get the URL of the banner.
	*/
	get banner() {
		if (!this._rawData) return void 0;
		return this._rawData.banner;
	}
	/**
	* Get the URL of the guild's banner with default settings (png format)
	*/
	get bannerUrl() {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/banners/${this.id}`, this.banner);
	}
	/**
	* Get the URL of the guild's banner with custom format and size options
	* @param options Optional format and size parameters
	* @returns The banner URL or null if no banner is set
	*/
	getBannerUrl(options) {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/banners/${this.id}`, this.banner, options);
	}
	/**
	* Premium tier (Server Boost level)
	*/
	get premiumTier() {
		if (!this._rawData) return void 0;
		return this._rawData.premium_tier;
	}
	/**
	* The number of boosts this guild currently has
	*/
	get premiumSubscriptionCount() {
		if (!this._rawData) return void 0;
		return this._rawData.premium_subscription_count ?? 0;
	}
	/**
	* The id of the channel where admins and moderators of Community guilds receive notices from Discord
	*/
	get publicUpdatesChannelId() {
		if (!this._rawData) return void 0;
		return this._rawData.public_updates_channel_id;
	}
	/**
	* The maximum amount of users in a video channel
	*/
	get maxVideoChannelUsers() {
		if (!this._rawData) return void 0;
		return this._rawData.max_video_channel_users ?? 0;
	}
	/**
	* The maximum amount of users in a stage video channel
	*/
	get maxStageVideoChannelUsers() {
		if (!this._rawData) return void 0;
		return this._rawData.max_stage_video_channel_users ?? 0;
	}
	/**
	* Approximate number of members in this guild
	*/
	get approximateMemberCount() {
		if (!this._rawData) return void 0;
		return this._rawData.approximate_member_count ?? 0;
	}
	/**
	* Approximate number of non-offline members in this guild
	*/
	get approximatePresenceCount() {
		if (!this._rawData) return void 0;
		return this._rawData.approximate_presence_count ?? 0;
	}
	/**
	* The welcome screen of a Community guild, shown to new members
	*/
	get welcomeScreen() {
		if (!this._rawData) return void 0;
		return this._rawData.welcome_screen;
	}
	/**
	* The nsfw level of the guild
	*/
	get nsfwLevel() {
		if (!this._rawData) return void 0;
		return this._rawData.nsfw_level;
	}
	/**
	* Custom guild stickers
	*/
	get stickers() {
		if (!this._rawData) return void 0;
		return this._rawData.stickers;
	}
	/**
	* Whether the guild has the boost progress bar enabled
	*/
	get premiumProgressBarEnabled() {
		if (!this._rawData) return void 0;
		return this._rawData.premium_progress_bar_enabled;
	}
	/**
	* The type of Student Hub the guild is
	*/
	get hubType() {
		if (!this._rawData) return void 0;
		return this._rawData.hub_type;
	}
	/**
	* The id of the channel where admins and moderators of Community guilds receive safety alerts from Discord
	*/
	get safetyAlertsChannelId() {
		if (!this._rawData) return void 0;
		return this._rawData.safety_alerts_channel_id;
	}
	/**
	* The incidents data for this guild
	*/
	get incidentsData() {
		if (!this._rawData) return void 0;
		return this._rawData.incidents_data;
	}
	/**
	* Fetch updated data for this guild.
	* If the guild is partial, this will fetch all the data for the guild and populate the fields.
	* If the guild is not partial, all fields will be updated with new values from Discord.
	* @returns A Promise that resolves to a non-partial Guild
	*/
	async fetch() {
		const newData = await this.client.rest.get(Routes.guild(this.id));
		if (!newData) throw new Error(`Guild ${this.id} not found`);
		this.setData(newData);
		return this;
	}
	/**
	* Leave the guild
	*/
	async leave() {
		await this.client.rest.delete(Routes.guild(this.id));
	}
	/**
	* Create a role in the guild
	*/
	async createRole(data) {
		const role = await this.client.rest.post(Routes.guildRoles(this.id), { body: { ...data } });
		const roleClass = new Role(this.client, role, this.id);
		this.setField("roles", Array.isArray(this.roles) ? [...this.roles, roleClass] : [roleClass]);
		return roleClass;
	}
	/**
	* Get a member in the guild by ID
	* @param memberId The ID of the member to fetch
	* @returns A Promise that resolves to a GuildMember or null if not found
	*/
	async fetchMember(memberId) {
		try {
			const partialGuild = new Guild(this.client, this.id);
			const member = await this.client.rest.get(Routes.guildMember(this.id, memberId));
			return new GuildMember(this.client, member, partialGuild);
		} catch (e) {
			if (e instanceof DiscordError) {
				if (e.status === 404) return null;
			}
			throw e;
		}
	}
	/**
	* Fetch all members in the guild
	* @param limit The maximum number of members to fetch (max 1000, default 100, set to "all" to fetch all members)
	* @returns A Promise that resolves to an array of GuildMember objects
	* @experimental
	*/
	async fetchMembers(limit = 100) {
		if (limit === "all") {
			const members = [];
			let after;
			let hasMore = true;
			while (hasMore) {
				const newMembers = await this.client.rest.get(Routes.guildMembers(this.id), {
					limit: "1000",
					...after ? { after } : {}
				});
				if (newMembers.length === 0) hasMore = false;
				else {
					members.push(...newMembers);
					after = newMembers[newMembers.length - 1]?.user.id;
				}
			}
			return members.map((member) => new GuildMember(this.client, member, this));
		}
		const cappedLimit = Math.min(limit, 1e3);
		return (await this.client.rest.get(Routes.guildMembers(this.id), { limit: cappedLimit.toString() })).map((member) => new GuildMember(this.client, member, this));
	}
	/**
	* Fetch a channel from the guild by ID
	*/
	async fetchChannel(channelId) {
		try {
			const channel = await this.client.rest.get(Routes.channel(channelId));
			return channelFactory(this.client, channel);
		} catch (e) {
			if (e instanceof DiscordError) {
				if (e.status === 404) return null;
			}
			throw e;
		}
	}
	/**
	* Fetch all channels in the guild
	* @returns A Promise that resolves to an array of channel objects
	*/
	async fetchChannels() {
		return (await this.client.rest.get(Routes.guildChannels(this.id))).map((channel) => channelFactory(this.client, channel));
	}
	/**
	* Fetch a role from the guild by ID
	*/
	async fetchRole(roleId) {
		const role = await this.client.rest.get(Routes.guildRole(this.id, roleId));
		return new Role(this.client, role, this.id);
	}
	/**
	* Fetch all roles in the guild
	* @returns A Promise that resolves to an array of Role objects
	*/
	async fetchRoles() {
		return (await this.client.rest.get(Routes.guildRoles(this.id))).map((role) => new Role(this.client, role, this.id));
	}
	async getEmoji(id) {
		const emoji = await this.client.rest.get(Routes.guildEmoji(this.id, id));
		return new GuildEmoji(this.client, emoji, this.id);
	}
	getEmojiByName(name) {
		return this.emojis?.find((emoji) => emoji.name === name);
	}
	/**
	* Upload a new emoji to the application
	* @param name The name of the emoji
	* @param image The image of the emoji in base64 format
	* @returns The created ApplicationEmoji
	*/
	async createEmoji(name, image) {
		const emoji = await this.client.rest.post(Routes.guildEmojis(this.id), { body: {
			name,
			image
		} });
		return new GuildEmoji(this.client, emoji, this.id);
	}
	async deleteEmoji(id) {
		await this.client.rest.delete(Routes.guildEmoji(this.id, id));
	}
	/**
	* Fetch all scheduled events for the guild
	* @param withUserCount Whether to include the user count in the response
	* @returns A Promise that resolves to an array of GuildScheduledEvent objects
	*/
	async fetchScheduledEvents(withUserCount = false) {
		return (await this.client.rest.get(Routes.guildScheduledEvents(this.id), withUserCount ? { with_user_count: "true" } : void 0)).map((event) => new GuildScheduledEvent(this.client, event, this.id));
	}
	/**
	* Fetch a specific scheduled event by ID
	* @param eventId The ID of the scheduled event to fetch
	* @param withUserCount Whether to include the user count in the response
	* @returns A Promise that resolves to a GuildScheduledEvent or null if not found
	*/
	async fetchScheduledEvent(eventId, withUserCount = false) {
		try {
			const scheduledEvent = await this.client.rest.get(Routes.guildScheduledEvent(this.id, eventId), withUserCount ? { with_user_count: "true" } : void 0);
			return new GuildScheduledEvent(this.client, scheduledEvent, this.id);
		} catch (e) {
			if (e instanceof DiscordError) {
				if (e.status === 404) return null;
			}
			throw e;
		}
	}
	/**
	* Create a new scheduled event
	* @param data The data for the scheduled event
	* @returns A Promise that resolves to the created GuildScheduledEvent
	*/
	async createScheduledEvent(data) {
		const scheduledEvent = await this.client.rest.post(Routes.guildScheduledEvents(this.id), { body: {
			name: data.name,
			description: data.description ?? null,
			scheduled_start_time: data.scheduledStartTime,
			scheduled_end_time: data.scheduledEndTime ?? null,
			privacy_level: data.privacyLevel,
			entity_type: data.entityType,
			channel_id: data.channelId ?? null,
			entity_metadata: data.entityMetadata,
			image: data.image ?? null
		} });
		return new GuildScheduledEvent(this.client, scheduledEvent, this.id);
	}
	/**
	* Edit a scheduled event
	* @param eventId The ID of the scheduled event to edit
	* @param data The data to update the scheduled event with
	* @returns A Promise that resolves to the updated GuildScheduledEvent
	*/
	async editScheduledEvent(eventId, data) {
		const body = {};
		if (data.name !== void 0) body.name = data.name;
		if (data.description !== void 0) body.description = data.description;
		if (data.scheduledStartTime !== void 0) body.scheduled_start_time = data.scheduledStartTime;
		if (data.scheduledEndTime !== void 0) body.scheduled_end_time = data.scheduledEndTime;
		if (data.privacyLevel !== void 0) body.privacy_level = data.privacyLevel;
		if (data.entityType !== void 0) body.entity_type = data.entityType;
		if (data.channelId !== void 0) body.channel_id = data.channelId;
		if (data.entityMetadata !== void 0) body.entity_metadata = data.entityMetadata;
		if (data.image !== void 0) body.image = data.image;
		const scheduledEvent = await this.client.rest.patch(Routes.guildScheduledEvent(this.id, eventId), { body });
		return new GuildScheduledEvent(this.client, scheduledEvent, this.id);
	}
	/**
	* Delete a scheduled event
	* @param eventId The ID of the scheduled event to delete
	*/
	async deleteScheduledEvent(eventId) {
		await this.client.rest.delete(Routes.guildScheduledEvent(this.id, eventId));
	}
	/**
	* Get member counts for each role in the guild
	* @returns A Promise that resolves to an array of objects containing role ID, partial Role, and member count
	*/
	async fetchRoleMemberCounts() {
		const memberCounts = await this.client.rest.get(`/guilds/${this.id}/roles/member-counts`);
		return Object.entries(memberCounts).map(([roleId, count]) => ({
			id: roleId,
			role: new Role(this.client, roleId, this.id),
			count
		}));
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseGuildChannel.js
var BaseGuildChannel = class extends BaseChannel {
	/**
	* The name of the channel.
	*/
	get name() {
		if (!this.rawData) return void 0;
		return this.rawData.name;
	}
	/**
	* The ID of the guild this channel is in
	*/
	get guildId() {
		if (!this.rawData) return void 0;
		return this.rawData.guild_id;
	}
	/**
	* The ID of the parent category for the channel.
	*/
	get parentId() {
		if (!this.rawData) return void 0;
		return this.rawData.parent_id ?? null;
	}
	/**
	* Whether the channel is marked as nsfw.
	*/
	get nsfw() {
		if (!this.rawData) return void 0;
		return this.rawData.nsfw ?? false;
	}
	/**
	* The guild this channel is in
	*/
	get guild() {
		if (!this.rawData) return void 0;
		if (!this.guildId) throw new Error("Cannot get guild without guild ID");
		return new Guild(this.client, this.guildId);
	}
	/**
	* Set the name of the channel
	* @param name The new name of the channel
	*/
	async setName(name) {
		await this.client.rest.patch(Routes.channel(this.id), { body: { name } });
		this.setField("name", name);
	}
	/**
	* Set the parent ID of the channel
	* @param parent The new category channel or ID to set
	*/
	async setParent(parent) {
		if (typeof parent === "string") {
			await this.client.rest.patch(Routes.channel(this.id), { body: { parent_id: parent } });
			this.setField("parent_id", parent);
		} else {
			await this.client.rest.patch(Routes.channel(this.id), { body: { parent_id: parent.id } });
			this.setField("parent_id", parent.id);
		}
	}
	/**
	* Set whether the channel is nsfw
	* @param nsfw The new nsfw status of the channel
	*/
	async setNsfw(nsfw) {
		await this.client.rest.patch(Routes.channel(this.id), { body: { nsfw } });
		this.setField("nsfw", nsfw);
	}
	/**
	* Send a message to the channel
	*/
	async send(message) {
		const data = await this.client.rest.post(Routes.channelMessages(this.id), { body: serializePayload$1(message) });
		return new Message(this.client, data);
	}
	/**
	* Get the invites for the channel
	*/
	async getInvites() {
		return await this.client.rest.get(Routes.channelInvites(this.id));
	}
	/**
	* Create an invite for the channel
	*/
	async createInvite(options) {
		return await this.client.rest.post(Routes.channelInvites(this.id), { body: { ...options } });
	}
	/**
	* Trigger a typing indicator in the channel (this will expire after 10 seconds)
	*/
	async triggerTyping() {
		await this.client.rest.post(Routes.channelTyping(this.id), {});
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GuildThreadChannel.js
var GuildThreadChannel = class extends BaseGuildChannel {
	/**
	* Whether the thread is archived.
	*/
	get archived() {
		if (!this.rawData) return void 0;
		return this.rawData.thread_metadata?.archived;
	}
	/**
	* The duration until the thread is auto archived.
	*/
	get autoArchiveDuration() {
		if (!this.rawData) return void 0;
		return this.rawData.thread_metadata?.auto_archive_duration;
	}
	/**
	* The timestamp of when the thread was archived.
	*/
	get archiveTimestamp() {
		if (!this.rawData) return void 0;
		return this.rawData.thread_metadata?.archive_timestamp;
	}
	/**
	* Whether the thread is locked.
	*/
	get locked() {
		if (!this.rawData) return void 0;
		return this.rawData.thread_metadata?.locked;
	}
	/**
	* Whether non-moderators can add other non-moderators to a thread; only available on private threads
	*/
	get invitable() {
		if (!this.rawData) return void 0;
		return this.rawData.thread_metadata?.invitable;
	}
	/**
	* The timestamp of when the thread was created.
	*/
	get createTimestamp() {
		if (!this.rawData) return void 0;
		return this.rawData.thread_metadata?.create_timestamp;
	}
	/**
	* The number of messages in the thread.
	*/
	get messageCount() {
		if (!this.rawData) return void 0;
		return this.rawData.message_count;
	}
	/**
	* The number of members in the thread.
	*
	* @remarks
	* This is only accurate until 50, after that, Discord stops counting.
	*/
	get memberCount() {
		if (!this.rawData) return void 0;
		return this.rawData.member_count;
	}
	/**
	* The ID of the owner of the thread.
	*/
	get ownerId() {
		if (!this.rawData) return void 0;
		return this.rawData.owner_id;
	}
	/**
	* The number of messages sent in the thread.
	*/
	get totalMessageSent() {
		if (!this.rawData) return void 0;
		return this.rawData.total_message_sent;
	}
	/**
	* The tags applied to the thread.
	*/
	get appliedTags() {
		if (!this.rawData) return void 0;
		return this.rawData.applied_tags;
	}
	/**
	* Join the thread
	*/
	async join() {
		await this.addMember("@me");
	}
	/**
	* Add a member to the thread
	*/
	async addMember(userId) {
		await this.client.rest.put(Routes.threadMembers(this.id, userId));
	}
	/**
	* Leave the thread
	*/
	async leave() {
		await this.removeMember("@me");
	}
	/**
	* Get the pinned messages in the thread
	*/
	async removeMember(userId) {
		await this.client.rest.delete(Routes.threadMembers(this.id, userId));
	}
	/**
	* Archive the thread
	*/
	async archive() {
		await this.client.rest.patch(Routes.channel(this.id), { body: { archive: true } });
		Reflect.set(this.rawData?.thread_metadata ?? {}, "archived", true);
	}
	/**
	* Unarchive the thread
	*/
	async unarchive() {
		await this.client.rest.patch(Routes.channel(this.id), { body: { archive: false } });
		Reflect.set(this.rawData?.thread_metadata ?? {}, "archived", false);
	}
	/**
	* Set the auto archive duration of the thread
	*/
	async setAutoArchiveDuration(duration) {
		await this.client.rest.patch(Routes.channel(this.id), { body: { auto_archive_duration: duration } });
		Reflect.set(this.rawData?.thread_metadata ?? {}, "auto_archive_duration", duration);
	}
	/**
	* Lock the thread
	*/
	async lock() {
		await this.client.rest.put(Routes.channel(this.id), { body: { locked: true } });
		Reflect.set(this.rawData?.thread_metadata ?? {}, "locked", true);
	}
	/**
	* Unlock the thread
	*/
	async unlock() {
		await this.client.rest.put(Routes.channel(this.id), { body: { locked: false } });
		Reflect.set(this.rawData?.thread_metadata ?? {}, "locked", false);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseComponent.js
var BaseComponent = class {
	/**
	* 32 bit integer used as an optional identifier for component
	* The id field is optional and is used to identify components in the response from an interaction that aren't interactive components.
	* The id must be unique within the message and is generated sequentially by Discord if left empty.
	* Generation of ids won't use another id that exists in the message if you have one defined for another component.
	*/
	id;
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseMessageInteractiveComponent.js
var BaseMessageInteractiveComponent = class extends BaseComponent {
	isV2 = false;
	/**
	* Whether the component response should be automatically deferred.
	* Can be a boolean or a function that receives the interaction and returns a boolean.
	*/
	defer = false;
	/**
	* Whether the component response should be ephemeral.
	* Can be a boolean or a function that receives the interaction and returns a boolean.
	*/
	ephemeral = false;
	/**
	* This function is called by the handler when a component is received, and is used to parse the custom ID into a key and data object.
	* By default, the ID is parsed in this format: `key:arg1=true;arg2=2;arg3=cheese`, where `arg1`, `arg2`, and `arg3` are the data arguments.
	* It will also automatically parse `true` and `false` as booleans, and will parse numbers as numbers.
	*
	* You can override this to parse the ID in a different format as you see fit, but it must follow these rules:
	* - The ID must have a `key` somewhere in the ID that can be returned by the parser. This key is what Carbon's component handler will use to identify the component and pass an interaction to the correct component.
	* - The data must be able to be arbitrary as far as Carbon's handler is concerned, meaning that any component with the same base key can be treated as the same component with logic within the component's logic methods to handle the data.
	*
	* @param id - The custom ID of the component as received from an interaction event
	* @returns The base key and the data object
	*/
	customIdParser = parseCustomId$1;
	run(interaction, data) {}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/AnySelectMenu.js
var AnySelectMenu = class extends BaseMessageInteractiveComponent {
	run(interaction, data) {}
	minValues;
	maxValues;
	/**
	* Not available in modals, will throw an error if used
	*/
	disabled;
	placeholder;
	/**
	* Defaults to true in modals, ignored in messages
	*/
	required;
	serialize = () => {
		const options = this.serializeOptions();
		const extra = this.serializeExtra();
		const data = {
			...options,
			custom_id: this.customId,
			placeholder: this.placeholder,
			min_values: this.minValues,
			max_values: this.maxValues,
			required: this.required,
			...extra
		};
		if (this.disabled) data.disabled = true;
		return data;
	};
	serializeExtra() {
		return {};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseInteraction.js
/**
* This is the base type interaction, all interaction types extend from this
*/
var BaseInteraction = class extends Base {
	/**
	* The type of interaction
	*/
	type;
	/**
	* The internal raw data of the interaction
	*/
	_rawData;
	/**
	* The raw Discord API data for this interaction
	*/
	get rawData() {
		return this._rawData;
	}
	/**
	* The user who sent the interaction
	*/
	userId;
	/**
	* Whether the interaction is deferred already
	* @internal
	*/
	_deferred = false;
	defaultEphemeral = false;
	constructor(client, data, defaults) {
		super(client);
		this._rawData = data;
		this.type = data.type;
		this.userId = this._rawData.user?.id || this._rawData.member?.user.id || void 0;
		if (defaults.ephemeral) this.defaultEphemeral = defaults.ephemeral;
	}
	get embeds() {
		if (!this._rawData.message) return null;
		return this._rawData.message.embeds.map((embed) => new Embed$1(embed));
	}
	get message() {
		if (!this._rawData.message) return null;
		return new Message(this.client, this._rawData.message);
	}
	get guild() {
		if (!this._rawData.guild_id) return null;
		return new Guild(this.client, this._rawData.guild_id);
	}
	get user() {
		if (this._rawData.user) return new User(this.client, this._rawData.user);
		if (this._rawData.member) return new User(this.client, this._rawData.member.user);
		return null;
	}
	get channel() {
		if (!this._rawData.channel) return null;
		return channelFactory(this.client, this._rawData.channel);
	}
	get member() {
		if (!this._rawData.member) return null;
		if (!this.guild) return null;
		return new GuildMember(this.client, this._rawData.member, this.guild);
	}
	/**
	* @internal
	* Automatically register components found in a message payload when sending the message.
	*/
	_internalAutoRegisterComponentsOnSend(data) {
		if (typeof data !== "string" && data.components) this._internalRegisterComponentsOnSend(data.components);
	}
	/**
	* @internal
	* Register components found in a message payload when sending the message.
	*/
	_internalRegisterComponentsOnSend(components) {
		for (const component of components) if (component instanceof Row$1) {
			for (const childComponent of component.components) if (childComponent instanceof BaseMessageInteractiveComponent) {
				const key = childComponent.customIdParser(childComponent.customId).key;
				if (!this.client.componentHandler.hasComponentWithKey(key, childComponent.type)) this.client.componentHandler.registerComponent(childComponent);
			}
		} else if (component instanceof Section$1) {
			if (component.accessory instanceof BaseMessageInteractiveComponent) {
				const key = component.accessory.customIdParser(component.accessory.customId).key;
				if (!this.client.componentHandler.hasComponentWithKey(key, component.accessory.type)) this.client.componentHandler.registerComponent(component.accessory);
			}
		} else if (component instanceof Container$1) this._internalRegisterComponentsOnSend(component.components);
	}
	/**
	* Reply to an interaction.
	* If the interaction is deferred, this will edit the original response.
	* @param data The message data to send
	*/
	async reply(data, overrideAutoRegister = false) {
		const serialized = serializePayload$1(data, this.defaultEphemeral);
		if (!overrideAutoRegister) this._internalAutoRegisterComponentsOnSend(data);
		if (this._deferred) {
			const message = await this.client.rest.patch(Routes.webhookMessage(this.client.options.clientId, this._rawData.token, "@original"), { body: serialized });
			return new Message(this.client, message);
		}
		const done = await this.client.rest.post(Routes.interactionCallback(this._rawData.id, this._rawData.token), { body: {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: serialized
		} }, { with_response: true });
		if (!done.resource?.message) throw new Error(`No resource returned for message from interaction callback: ${done.resource}`);
		return new Message(this.client, done.resource.message);
	}
	/**
	* Set the default ephemeral value for this interaction
	* @internal
	*/
	setDefaultEphemeral(ephemeral) {
		this.defaultEphemeral = ephemeral;
	}
	/**
	* Defer the interaction response. This is used automatically by commands that are set to defer.
	* If the interaction is already deferred, this will do nothing.
	* @internal
	*/
	async defer({ ephemeral = false } = {}) {
		if (this._deferred) return;
		this._deferred = true;
		await this.client.rest.post(Routes.interactionCallback(this._rawData.id, this._rawData.token), { body: {
			type: InteractionResponseType.DeferredChannelMessageWithSource,
			data: { flags: ephemeral || this.defaultEphemeral ? MessageFlags.Ephemeral : void 0 }
		} });
	}
	/**
	* Show a modal to the user
	* This can only be used if the interaction is not deferred
	*/
	async showModal(modal) {
		if (this._deferred) throw new Error("You cannot defer an interaction that shows a modal");
		const key = modal.customIdParser(modal.customId).key;
		if (!this.client.modalHandler.modals.find((m) => m.customIdParser(m.customId).key === key)) this.client.modalHandler.registerModal(modal);
		await this.client.rest.post(Routes.interactionCallback(this._rawData.id, this._rawData.token), { body: {
			type: InteractionResponseType.Modal,
			data: modal.serialize()
		} });
	}
	/**
	* Send a followup message to the interaction
	*/
	async followUp(reply) {
		const serialized = serializePayload$1(reply);
		this._internalAutoRegisterComponentsOnSend(reply);
		await this.client.rest.post(Routes.webhook(this.client.options.clientId, this._rawData.token), { body: { ...serialized } });
	}
	/**
	* This function will reply to the interaction and wait for a component to be pressed.
	* Any components passed in the message will not have run() functions called and
	* will only trigger the interaction.acknowledge() function.
	* This function will also return a promise that resolves
	* to the custom ID of the component that was pressed.
	*
	* @param data The message data to send
	* @param timeout After this many milliseconds, the promise will resolve to null
	*/
	async replyAndWaitForComponent(data, timeout = 3e5) {
		const message = await this.reply(data, true);
		const id = `${message.id}-${message.channelId}`;
		return new Promise((resolve) => {
			const timer = setTimeout(() => {
				this.client.componentHandler.oneOffComponents.delete(id);
				resolve({
					success: false,
					message,
					reason: "timed out"
				});
			}, timeout);
			this.client.componentHandler.oneOffComponents.set(id, { resolve: (data) => {
				clearTimeout(timer);
				this.client.componentHandler.oneOffComponents.delete(id);
				resolve({
					success: true,
					customId: data.custom_id,
					message,
					values: "values" in data ? data.values : void 0
				});
			} });
		});
	}
	/**
	* This function will edit to the interaction and wait for a component to be pressed.
	* Any components passed in the message will not have run() functions called and
	* will only trigger the interaction.acknowledge() function.
	* This function will also return a promise that resolves
	* to the custom ID of the component that was pressed.
	*
	* @param data The message data to send
	* @param message The message to edit (defaults to the interaction's original message)
	* @param {number} [timeout=300000] After this many milliseconds, the promise will resolve to null
	*
	* @returns Will return null if the interaction has not yet been replied to or if the message provided no longer exists
	*/
	async editAndWaitForComponent(data, message, timeout = 3e5) {
		const editedMessage = message ? await message.edit(data) : await this.message?.edit(data);
		if (!editedMessage) return null;
		const id = `${editedMessage.id}-${editedMessage.channelId}`;
		return new Promise((resolve) => {
			const timer = setTimeout(() => {
				this.client.componentHandler.oneOffComponents.delete(id);
				resolve({
					success: false,
					message: editedMessage,
					reason: "timed out"
				});
			}, timeout);
			this.client.componentHandler.oneOffComponents.set(id, { resolve: (data) => {
				clearTimeout(timer);
				this.client.componentHandler.oneOffComponents.delete(id);
				resolve({
					success: true,
					customId: data.custom_id,
					message: editedMessage,
					values: "values" in data ? data.values : void 0
				});
			} });
		});
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseComponentInteraction.js
var BaseComponentInteraction = class extends BaseInteraction {
	componentType;
	constructor(client, data, defaults) {
		super(client, data, defaults);
		if (!data.data) throw new Error("Invalid interaction data was used to create this class");
		this.componentType = data.data.component_type;
	}
	/**
	* Acknowledge the interaction, the user does not see a loading state.
	* This can only be used for component interactions
	*/
	async acknowledge() {
		await this.client.rest.post(Routes.interactionCallback(this.rawData.id, this.rawData.token), { body: { type: InteractionResponseType.DeferredMessageUpdate } });
		this._deferred = true;
	}
	/**
	* Update the original message of the component
	*/
	async update(data) {
		const serialized = serializePayload$1(data);
		this._internalAutoRegisterComponentsOnSend(data);
		await this.client.rest.post(Routes.interactionCallback(this.rawData.id, this.rawData.token), { body: {
			type: InteractionResponseType.UpdateMessage,
			data: { ...serialized }
		} });
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/AnySelectMenuInteraction.js
var AnySelectMenuInteraction = class extends BaseComponentInteraction {
	constructor(client, data, defaults) {
		super(client, data, defaults);
		if (!data.data) throw new Error("Invalid interaction data was used to create this class");
		if (data.type !== InteractionType.MessageComponent) throw new Error("Invalid interaction type was used to create this class");
	}
	/**
	* The raw IDs of the selected options (either role/string/channel IDs or the IDs you provided in your options)
	*/
	get values() {
		return this.rawData.data.values;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseCommand.js
/**
* Represents the base data of a command that the user creates
*/
var BaseCommand = class {
	id;
	/**
	* A description of the command
	*/
	description;
	/**
	* The localized name of the command
	* @see https://discord.com/developers/docs/interactions/application-commands#localization
	*/
	nameLocalizations;
	/**
	* The localized description of the command
	* @see https://discord.com/developers/docs/interactions/application-commands#localization
	*/
	descriptionLocalizations;
	/**
	* Whether the command response should be automatically deferred.
	* Can be a boolean or a function that receives the interaction and returns a boolean.
	*/
	defer = false;
	/**
	* Whether the command response should be ephemeral.
	* Can be a boolean or a function that receives the interaction and returns a boolean.
	*/
	ephemeral = false;
	/**
	* The places this command can be used in
	*/
	integrationTypes = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
	/**
	* The contexts this command can be used in
	*/
	contexts = [
		InteractionContextType.Guild,
		InteractionContextType.BotDM,
		InteractionContextType.PrivateChannel
	];
	/**
	* The default permission that a user needs to have to use this command.
	* This can be overridden by server admins.
	*/
	permission;
	/**
	* The components that this command uses.
	* These will be registered with the client when the command is initialized.
	*/
	components;
	/**
	* The guild IDs this command should be deployed to (guild-specific deployment).
	* If not set, the command is deployed globally.
	*/
	guildIds;
	/**
	* The handler for an entry point command.
	* Only used for command type `PrimaryEntryPoint`.
	*/
	handler;
	/**
	* Serializes the command into a JSON object that can be sent to Discord
	* @internal
	*/
	serialize() {
		if (this.type === ApplicationCommandType.PrimaryEntryPoint && this.guildIds && this.guildIds.length > 0) throw new Error("Primary Entry Point commands cannot be guild-scoped");
		if (this.type === ApplicationCommandType.ChatInput) return {
			name: this.name,
			name_localizations: this.nameLocalizations,
			description: this.description ?? "",
			description_localizations: this.descriptionLocalizations,
			type: this.type,
			options: this.serializeOptions(),
			integration_types: this.integrationTypes,
			contexts: this.contexts,
			default_member_permissions: Array.isArray(this.permission) ? this.permission.reduce((a, p) => a | p, 0n).toString() : this.permission ? `${this.permission}` : null
		};
		if (this.type === ApplicationCommandType.PrimaryEntryPoint) return {
			name: this.name,
			name_localizations: this.nameLocalizations,
			type: this.type,
			handler: this.handler,
			integration_types: this.integrationTypes,
			contexts: this.contexts,
			default_member_permissions: Array.isArray(this.permission) ? this.permission.reduce((a, p) => a | p, 0n).toString() : this.permission ? `${this.permission}` : null
		};
		return {
			name: this.name,
			name_localizations: this.nameLocalizations,
			type: this.type,
			options: this.serializeOptions(),
			integration_types: this.integrationTypes,
			contexts: this.contexts,
			default_member_permissions: Array.isArray(this.permission) ? this.permission.reduce((a, p) => a | p, 0n).toString() : this.permission ? `${this.permission}` : null
		};
	}
	async getMention(client) {
		if (this.id) return `</${this.name}:${this.id}>`;
		const commands = await client.getDiscordCommands();
		const match = this.findMatchingCommand(commands);
		if (!match) return `/${this.name}`;
		this.id = match.id;
		return `</${this.name}:${this.id}>`;
	}
	findMatchingCommand(commands) {
		return commands.find((cmd) => {
			if (cmd.name !== this.name) return false;
			if (cmd.type !== this.type) return false;
			if (!cmd.guild_id) return !this.guildIds || this.guildIds.length === 0;
			return this.guildIds?.includes(cmd.guild_id) ?? true;
		});
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseGuildTextChannel.js
var BaseGuildTextChannel = class extends BaseGuildChannel {
	/**
	* The topic of the channel.
	*/
	get topic() {
		if (!this.rawData) return void 0;
		return this.rawData.topic ?? null;
	}
	/**
	* The ID of the last message sent in the channel.
	*
	* @remarks
	* This might not always resolve to a message. The ID still stays a part of the channel's data, even if the message is deleted.
	*/
	get lastMessageId() {
		if (!this.rawData) return void 0;
		return this.rawData.last_message_id ?? null;
	}
	/**
	* The timestamp of the last pin in the channel.
	*/
	get lastPinTimestamp() {
		if (!this.rawData) return void 0;
		return this.rawData.last_pin_timestamp ?? null;
	}
	/**
	* The rate limit per user for the channel, in seconds.
	*/
	get rateLimitPerUser() {
		if (!this.rawData) return void 0;
		return this.rawData.rate_limit_per_user;
	}
	/**
	* The last message sent in the channel.
	*
	* @remarks
	* This might not always resolve to a message. The ID still stays a part of the channel's data, even if the message is deleted.
	* This will always return a partial message, so you can use {@link Message.fetch} to get the full message data.
	*
	*/
	get lastMessage() {
		if (!this.rawData) return void 0;
		if (!this.lastMessageId) return null;
		return new Message(this.client, {
			id: this.lastMessageId,
			channelId: this.id
		});
	}
	/**
	* Get the pinned messages in the channel using paginated API
	* @param options Optional pagination parameters
	*/
	async getChannelPins(options) {
		const queryParams = {};
		if (options?.before) queryParams.before = options.before;
		if (options?.limit) queryParams.limit = options.limit.toString();
		const result = await this.client.rest.get(Routes.channelMessagesPins(this.id), Object.keys(queryParams).length > 0 ? queryParams : void 0);
		return {
			pins: result.items.map((pin) => ({
				pinnedAt: pin.pinned_at,
				message: new Message(this.client, pin.message)
			})),
			hasMore: result.has_more
		};
	}
	/**
	* Start a thread without an associated start message.
	* If you want to start a thread with a start message, use {@link Message.startThread}
	*/
	async startThread(data) {
		const thread = await this.client.rest.post(Routes.threads(this.id), { body: { ...data } });
		return new GuildThreadChannel(this.client, thread);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/GuildThreadOnlyChannel.js
var GuildThreadOnlyChannel = class extends BaseGuildChannel {
	/**
	* The position of the channel in the channel list.
	*/
	get position() {
		if (!this.rawData) return void 0;
		return this.rawData.position;
	}
	/**
	* Set the position of the channel
	* @param position The new position of the channel
	*/
	async setPosition(position) {
		await this.client.rest.patch(Routes.channel(this.id), { body: { position } });
		this.setField("position", position);
	}
	/**
	* The topic of the channel.
	*/
	get topic() {
		if (!this.rawData) return void 0;
		return this.rawData.topic ?? null;
	}
	/**
	* The default auto archive duration of the channel.
	*/
	get defaultAutoArchiveDuration() {
		if (!this.rawData) return void 0;
		return this.rawData.default_auto_archive_duration ?? null;
	}
	/**
	* The default thread rate limit per user for the channel.
	*/
	get defaultThreadRateLimitPerUser() {
		if (!this.rawData) return void 0;
		return this.rawData.default_thread_rate_limit_per_user ?? null;
	}
	/**
	* The available tags to set on posts in the channel.
	*/
	get availableTags() {
		if (!this.rawData) return void 0;
		return this.rawData.available_tags ?? [];
	}
	/**
	* The default reaction emoji for the channel.
	*/
	get defaultReactionEmoji() {
		if (!this.rawData) return void 0;
		return this.rawData.default_reaction_emoji;
	}
	/**
	* The default sort order for the channel, by latest activity or by creation date.
	*/
	get defaultSortOrder() {
		if (!this.rawData) return void 0;
		return this.rawData.default_sort_order;
	}
	/**
	* You cannot send a message directly to a forum or media channel, so this method throws an error.
	* Use {@link GuildThreadChannel.send} instead, or the alias {@link GuildThreadOnlyChannel.sendToPost} instead, to send a message to the channel's posts.
	*/
	async send() {
		throw new Error("You cannot send a message directly to a forum or media channel. Use GuildThreadChannel.send instead, or the alias GuildThreadOnlyChannel.sendToPost instead, to send a message to the channel's posts.");
	}
	/**
	* Send a message to a post in the channel
	* @remarks
	* This is an alias for {@link GuildThreadChannel.send} that will fetch the channel, but if you already have the channel, you can use {@link GuildThreadChannel.send} instead.
	*/
	async sendToPost(message, postId) {
		return await new GuildThreadChannel(this.client, postId).send(message);
	}
	async createPost(name, message, options) {
		const response = await this.client.rest.post(Routes.threads(this.id), { body: {
			name,
			message,
			auto_archive_duration: options?.autoArchiveDuration,
			rate_limit_per_user: options?.rateLimitPerUser,
			applied_tags: options?.appliedTags
		} });
		return new GuildThreadChannel(this.client, response);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/abstracts/BaseModalComponent.js
var BaseModalComponent = class extends BaseComponent {
	isV2 = true;
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/Button.js
var BaseButton = class extends BaseMessageInteractiveComponent {
	type = ComponentType.Button;
	isV2 = false;
	/**
	* The emoji of the button
	*/
	emoji;
	/**
	* The style of the button
	*/
	style = ButtonStyle.Primary;
	/**
	* The disabled state of the button
	*/
	disabled = false;
};
var Button$1 = class extends BaseButton {
	run(interaction, data) {}
	serialize = () => {
		if (this.style === ButtonStyle.Link) throw new Error("Link buttons cannot be serialized. Are you using the right class?");
		if (this.style === ButtonStyle.Premium) throw new Error("Premium buttons cannot be serialized. Are you using the right class?");
		return {
			type: ComponentType.Button,
			style: this.style,
			label: this.label,
			custom_id: this.customId,
			disabled: this.disabled,
			emoji: this.emoji
		};
	};
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/ChannelSelectMenu.js
var ChannelSelectMenu$1 = class extends AnySelectMenu {
	type = ComponentType.ChannelSelect;
	isV2 = false;
	channelTypes;
	defaultValues;
	run(interaction, data) {}
	serializeOptions() {
		return {
			type: this.type,
			default_values: this.defaultValues,
			channel_types: this.channelTypes
		};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/functions/enforceChoicesLimit.js
function enforceChoicesLimit(options) {
	if (!options) return options;
	return options.map((option) => {
		const newOption = { ...option };
		if (Array.isArray(newOption.choices) && newOption.choices.length > 25) {
			console.warn(`[Carbon] Command option '${newOption.name}' has ${newOption.choices.length} choices. Only the first 25 will be sent.`);
			newOption.choices = newOption.choices.slice(0, 25);
		}
		if (Array.isArray(newOption.options)) newOption.options = enforceChoicesLimit(newOption.options);
		return newOption;
	});
}
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/Command.js
/**
* Represents a standard command that the user creates
*/
var Command$1 = class extends BaseCommand {
	/**
	* The options that the user passes along with the command in Discord
	*/
	options;
	/**
	* The type of command, either ChatInput, User, or Message. User and Message are context menu commands.
	* @default ChatInput
	*/
	type = ApplicationCommandType.ChatInput;
	/**
	* The function that is called when the command's autocomplete is triggered.
	* @param interaction The interaction that triggered the autocomplete
	* @remarks You are expected to `override` this function to provide your own autocomplete functionality.
	*/
	async autocomplete(interaction) {
		throw new Error(`The ${interaction.rawData.data.name} command does not support autocomplete`);
	}
	/**
	* The function that is called before the command is ran.
	* You can use this to run things such as cooldown checks, extra permission checks, etc.
	* If this returns anything other than `true`, the command will not run.
	* @param interaction The interaction that triggered the command
	* @returns Whether the command should continue to run
	*/
	async preCheck(interaction) {
		return !!interaction;
	}
	/**
	* @internal
	*/
	serializeOptions() {
		const processedOptions = this.options?.map((option) => {
			if ("autocomplete" in option && typeof option.autocomplete === "function") {
				const { autocomplete, ...rest } = option;
				return {
					...rest,
					autocomplete: true
				};
			}
			return option;
		});
		return enforceChoicesLimit(processedOptions);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/CommandWithSubcommands.js
/**
* Represents a subcommand command that the user creates.
* You make this instead of a {@link Command} class when you want to have subcommands in your options.
*/
var CommandWithSubcommands$1 = class extends BaseCommand {
	type = ApplicationCommandType.ChatInput;
	/**
	* @internal
	*/
	serializeOptions() {
		return this.subcommands.map((subcommand) => ({
			...subcommand.serialize(),
			type: ApplicationCommandOptionType.Subcommand
		}));
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/CommandWithSubcommandGroups.js
/**
* Represents a subcommand group command that the user creates.
* You make this instead of a {@link Command} class when you want to have subcommand groups in your options.
*/
var CommandWithSubcommandGroups = class extends CommandWithSubcommands$1 {
	/**
	* The subcommands that the user can use
	*/
	subcommands = [];
	/**
	* @internal
	*/
	serializeOptions() {
		const subcommands = this.subcommands.map((subcommand) => ({
			...subcommand.serialize(),
			type: ApplicationCommandOptionType.Subcommand
		}));
		const subcommandGroups = this.subcommandGroups.map((subcommandGroup) => ({
			...subcommandGroup.serialize(),
			type: ApplicationCommandOptionType.SubcommandGroup
		}));
		return [...subcommands, ...subcommandGroups];
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/OptionsHandler.js
/**
* This class is used to parse the options of a command, and provide errors for any missing or invalid options.
* It is used internally by the Command class.
*/
var OptionsHandler = class extends Base {
	/**
	* The raw options that were in the interaction data, before they were parsed.
	*/
	raw;
	/**
	* The resolved data from the interaction.
	*/
	resolved;
	guildId;
	interactionData;
	definitions;
	constructor({ client, options, interactionData, definitions, guildId }) {
		super(client);
		this.raw = [];
		this.interactionData = interactionData;
		this.definitions = definitions;
		this.resolved = interactionData.resolved ?? {};
		this.guildId = guildId;
		for (const option of options) if (option.type === ApplicationCommandOptionType.Subcommand) for (const subOption of option.options ?? []) this.raw.push(subOption);
		else if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
			for (const subOption of option.options ?? []) if (subOption.options) for (const subSubOption of subOption.options ?? []) this.raw.push(subSubOption);
		} else this.raw.push(option);
	}
	getString(key, required = false) {
		const value = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.String)?.value;
		if (required) {
			if (!value || typeof value !== "string") throw new Error(`Missing required option: ${key}`);
		} else if (!value || typeof value !== "string") return void 0;
		this.checkAgainstDefinition(key, value);
		return value;
	}
	getInteger(key, required = false) {
		const value = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.Integer)?.value;
		if (required) {
			if (!value || typeof value !== "number" || !Number.isSafeInteger(value)) throw new Error(`Missing required option: ${key}`);
		} else if (!value || typeof value !== "number" || !Number.isSafeInteger(value)) return void 0;
		this.checkAgainstDefinition(key, value);
		return value;
	}
	getNumber(key, required = false) {
		const value = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.Number)?.value;
		if (required) {
			if (!value || typeof value !== "number") throw new Error(`Missing required option: ${key}`);
		} else if (!value || typeof value !== "number") return void 0;
		this.checkAgainstDefinition(key, value);
		return value;
	}
	getBoolean(key, required = false) {
		const value = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.Boolean)?.value;
		if (required) {
			if (!value || typeof value !== "boolean") throw new Error(`Missing required option: ${key}`);
		} else if (!value || typeof value !== "boolean") return void 0;
		return value;
	}
	getUser(key, required = false) {
		const id = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.User)?.value;
		if (required) {
			if (!id || typeof id !== "string") throw new Error(`Missing required option: ${key}`);
		} else if (!id || typeof id !== "string") return void 0;
		const user = this.resolved.users?.[id];
		if (!user) throw new Error(`Discord failed to resolve user for ${key}, this is a bug.`);
		return new User(this.client, user);
	}
	getMember(key, required = false) {
		const id = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.User)?.value;
		if (required) {
			if (!id || typeof id !== "string") throw new Error(`Missing required option: ${key}`);
		} else if (!id || typeof id !== "string") return void 0;
		const user = this.resolved.users?.[id];
		if (!user) throw new Error(`Discord failed to resolve user for ${key}, this is a bug.`);
		const rawMember = this.resolved.members?.[id];
		const guildId = this.guildId;
		let member = null;
		if (rawMember && guildId) member = new GuildMember(this.client, {
			...rawMember,
			mute: void 0,
			deaf: void 0,
			user
		}, new Guild(this.client, guildId));
		return member;
	}
	async getChannelId(key, required = false) {
		const id = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.Channel)?.value;
		if (required) {
			if (!id || typeof id !== "string") throw new Error(`Missing required option: ${key}`);
		} else if (!id || typeof id !== "string") return void 0;
		return id;
	}
	async getChannel(key, required = false) {
		const id = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.Channel)?.value;
		if (required) {
			if (!id || typeof id !== "string") throw new Error(`Missing required option: ${key}`);
		} else if (!id || typeof id !== "string") return void 0;
		return await this.client.fetchChannel(id) ?? void 0;
	}
	getRole(key, required = false) {
		const id = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.Role)?.value;
		if (required) {
			if (!id || typeof id !== "string") throw new Error(`Missing required option: ${key}`);
		} else if (!id || typeof id !== "string") return void 0;
		const role = this.resolved.roles?.[id];
		if (!role) throw new Error(`Discord failed to resolve role for ${key}, this is a bug.`);
		if (!this.guildId) throw new Error("Guild ID is not available for this interaction");
		return new Role(this.client, role, this.guildId);
	}
	getMentionable(key, required = false) {
		const id = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.Mentionable)?.value;
		if (required) {
			if (!id || typeof id !== "string") throw new Error(`Missing required option: ${key}`);
		} else if (!id || typeof id !== "string") return void 0;
		const user = this.resolved.users?.[id];
		if (user) return new User(this.client, user);
		const role = this.resolved.roles?.[id];
		if (role) {
			if (!this.guildId) throw new Error("Guild ID is not available for this interaction");
			return new Role(this.client, role, this.guildId);
		}
		throw new Error(`Discord failed to resolve mentionable for ${key}, this is a bug.`);
	}
	getAttachment(key, required = false) {
		if (!this.interactionData) throw new Error("Interaction data is not available, this is a bug in Carbon.");
		const id = this.raw.find((x) => x.name === key && x.type === ApplicationCommandOptionType.Attachment)?.value;
		if (required) {
			if (!id || typeof id !== "string") throw new Error(`Missing required option: ${key}`);
		} else if (!id || typeof id !== "string") return void 0;
		const attachment = this.interactionData.resolved?.attachments?.[id];
		if (!attachment) {
			if (required) throw new Error(`Missing required option: ${key}`);
			return;
		}
		return attachment;
	}
	checkAgainstDefinition(key, value) {
		const definition = this.definitions?.find((x) => x.name === key);
		if (!definition) return;
		if (definition.type === ApplicationCommandOptionType.String && typeof value === "string") {
			if ("max_length" in definition && definition.max_length && value.length > definition.max_length) throw new Error(`Invalid length for option ${key}: Should be less than ${definition.max_length} characters but is ${value.length} characters`);
			if ("min_length" in definition && definition.min_length && value.length < definition.min_length) throw new Error(`Invalid length for option ${key}: Should be more than ${definition.min_length} characters but is ${value.length} characters`);
		}
		if ((definition.type === ApplicationCommandOptionType.Integer || definition.type === ApplicationCommandOptionType.Number) && typeof value === "number") {
			if ("min_value" in definition && definition.min_value && value < definition.min_value) throw new Error(`Invalid value for option ${key}: Should be more than ${definition.min_value} but is ${value}`);
			if ("max_value" in definition && definition.max_value && value > definition.max_value) throw new Error(`Invalid value for option ${key}: Should be less than ${definition.max_value} but is ${value}`);
		}
		if ("choices" in definition && definition.choices) {
			if (!definition.choices.find((x) => x.value === value)) throw new Error(`Invalid choice for option ${key}: Should be one of ${definition.choices?.map((x) => x.value).join(", ")} but is ${value}`);
		}
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/AutocompleteInteraction.js
var AutocompleteInteraction = class extends BaseInteraction {
	/**
	* This is the options of the commands, parsed from the interaction data.
	*/
	options;
	constructor({ client, data, defaults, processingCommand }) {
		super(client, data, defaults);
		if (data.type !== InteractionType.ApplicationCommandAutocomplete) throw new Error("Invalid interaction type was used to create this class");
		if (data.data.type !== ApplicationCommandType.ChatInput) throw new Error("Invalid command type was used to create this class");
		this.options = new AutocompleteOptionsHandler({
			client,
			options: data.data.options ?? [],
			interactionData: data.data,
			definitions: processingCommand?.options ?? []
		});
	}
	async defer() {
		throw new Error("Defer is not available for autocomplete interactions");
	}
	async reply() {
		throw new Error("Reply is not available for autocomplete interactions");
	}
	/**
	* Respond with the choices for an autocomplete interaction
	*/
	async respond(choices) {
		let safeChoices = choices;
		if (choices.length > 25) {
			console.warn(`[Carbon] Autocomplete only supports up to 25 choices. Received ${choices.length}. Only the first 25 will be sent.`);
			safeChoices = choices.slice(0, 25);
		}
		await this.client.rest.post(Routes.interactionCallback(this.rawData.id, this.rawData.token), { body: {
			type: InteractionResponseType.ApplicationCommandAutocompleteResult,
			data: { choices: safeChoices }
		} });
	}
};
var AutocompleteOptionsHandler = class extends OptionsHandler {
	/**
	* Get the focused option (the one that is being autocompleted)
	*/
	getFocused() {
		const focused = this.raw.find((x) => "focused" in x && x.focused);
		if (!focused) return null;
		const value = focused.type === ApplicationCommandOptionType.String ? this.getString(focused.name) : focused.type === ApplicationCommandOptionType.Integer ? this.getInteger(focused.name) : focused.type === ApplicationCommandOptionType.Number ? this.getNumber(focused.name) : focused.type === ApplicationCommandOptionType.Boolean ? this.getBoolean(focused.name) : null;
		return {
			name: focused.name,
			type: focused.type,
			value
		};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/CommandInteraction.js
/**
* Represents a command interaction
*/
var CommandInteraction = class extends BaseInteraction {
	/**
	* This is the options of the commands, parsed from the interaction data.
	* It will not have any options in it if the command is not a ChatInput command.
	*/
	options;
	constructor({ client, data, defaults, processingCommand }) {
		super(client, data, defaults);
		if (data.type !== InteractionType.ApplicationCommand) throw new Error("Invalid interaction type was used to create this class");
		this.options = new OptionsHandler({
			client,
			options: data.data.type === ApplicationCommandType.ChatInput ? data.data.options ?? [] : [],
			interactionData: this.rawData.data,
			definitions: processingCommand?.options ?? [],
			guildId: data.guild_id
		});
	}
	get targetMessage() {
		const interactionData = this.rawData.data;
		if (interactionData.type !== ApplicationCommandType.Message || !("resolved" in interactionData)) return null;
		const { target_id: targetId, resolved } = interactionData;
		if (!resolved?.messages) return null;
		const rawMessage = targetId ? resolved.messages[targetId] : Object.values(resolved.messages)[0];
		return rawMessage ? new Message(this.client, rawMessage) : null;
	}
	get targetUser() {
		const interactionData = this.rawData.data;
		if (interactionData.type !== ApplicationCommandType.User || !("resolved" in interactionData)) return null;
		const { target_id: targetId, resolved } = interactionData;
		if (!resolved?.users) return null;
		const rawUser = targetId ? resolved.users[targetId] : Object.values(resolved.users)[0];
		return rawUser ? new User(this.client, rawUser) : null;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/CommandHandler.js
var CommandHandler = class extends Base {
	getSubcommand(command, rawInteraction) {
		if (rawInteraction.data.type !== ApplicationCommandType.ChatInput) throw new Error("Subcommands must be used with ChatInput");
		const data = rawInteraction.data;
		const subcommand = command.subcommands.find((x) => x.name === data.options?.[0]?.name);
		if (!subcommand) throw new Error("Subcommand not found");
		return subcommand;
	}
	getCommand(rawInteraction) {
		let command = this.client.commands.find((x) => x.name === rawInteraction.data.name);
		if (!command) command = this.client.commands.find((x) => x.name === "*");
		if (!command) throw new Error("Command not found");
		if (command instanceof CommandWithSubcommandGroups) {
			if (rawInteraction.data.type !== ApplicationCommandType.ChatInput) throw new Error("Subcommand groups must be used with ChatInput");
			const data = rawInteraction.data;
			const subcommandGroupName = data.options?.find((x) => x.type === ApplicationCommandOptionType.SubcommandGroup)?.name;
			if (!subcommandGroupName) try {
				return this.getSubcommand(command, rawInteraction);
			} catch {
				throw new Error("No subcommand group name or subcommand found");
			}
			const subcommandGroup = command.subcommandGroups.find((x) => x.name === subcommandGroupName);
			if (!subcommandGroup) throw new Error("Subcommand group not found");
			const subcommandName = (data.options?.find((x) => x.type === ApplicationCommandOptionType.SubcommandGroup)).options?.find((x) => x.type === ApplicationCommandOptionType.Subcommand)?.name;
			if (!subcommandName) throw new Error("No subcommand name");
			const subcommand = subcommandGroup.subcommands.find((x) => x.name === subcommandName);
			if (!subcommand) throw new Error("Subcommand not found");
			return subcommand;
		}
		if (command instanceof CommandWithSubcommands$1) return this.getSubcommand(command, rawInteraction);
		if (command instanceof Command$1) return command;
		throw new Error("Command is not a valid command type");
	}
	/**
	* Handle a command interaction
	* @internal
	*/
	async handleCommandInteraction(rawInteraction) {
		const command = this.getCommand(rawInteraction);
		if (!command) return false;
		if (command.components) for (const component of command.components) this.client.componentHandler.registerComponent(component);
		const interaction = new CommandInteraction({
			client: this.client,
			data: rawInteraction,
			defaults: { ephemeral: typeof command.ephemeral === "function" ? false : command.ephemeral },
			processingCommand: command
		});
		try {
			const command = this.getCommand(rawInteraction);
			if (typeof command.ephemeral === "function") interaction.setDefaultEphemeral(command.ephemeral(interaction));
			if (typeof command.defer === "function" ? command.defer(interaction) : command.defer) await interaction.defer();
			if (command.preCheck) {
				if (!await command.preCheck(interaction)) return false;
			}
			return await command.run(interaction);
		} catch (e) {
			if (e instanceof Error) console.error(e.message);
			console.error(e);
		}
	}
	async handleAutocompleteInteraction(rawInteraction) {
		const command = this.getCommand(rawInteraction);
		if (!command) return false;
		const interaction = new AutocompleteInteraction({
			client: this.client,
			data: rawInteraction,
			defaults: { ephemeral: typeof command.ephemeral === "function" ? false : command.ephemeral },
			processingCommand: command
		});
		try {
			const command = this.getCommand(rawInteraction);
			const focusedOption = interaction.options.getFocused();
			if (focusedOption && command.options) {
				const optionDefinition = command.options.find((opt) => opt.name === focusedOption.name);
				if (optionDefinition && "autocomplete" in optionDefinition && typeof optionDefinition.autocomplete === "function") return await optionDefinition.autocomplete(interaction);
			}
			return await command.autocomplete(interaction);
		} catch (e) {
			if (e instanceof Error) console.error(e.message);
			console.error(e);
		}
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/MentionableSelectMenu.js
var MentionableSelectMenu$1 = class extends AnySelectMenu {
	type = ComponentType.MentionableSelect;
	isV2 = false;
	defaultValues;
	run(interaction, data) {}
	serializeOptions() {
		return {
			type: this.type,
			default_values: this.defaultValues
		};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/RoleSelectMenu.js
var RoleSelectMenu$1 = class extends AnySelectMenu {
	type = ComponentType.RoleSelect;
	isV2 = false;
	defaultValues;
	run(interaction, data) {}
	serializeOptions() {
		return {
			type: this.type,
			default_values: this.defaultValues
		};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/StringSelectMenu.js
var StringSelectMenu$1 = class extends AnySelectMenu {
	type = ComponentType.StringSelect;
	isV2 = false;
	run(interaction, data) {}
	serializeOptions() {
		return {
			type: this.type,
			options: this.options
		};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/UserSelectMenu.js
var UserSelectMenu$1 = class extends AnySelectMenu {
	type = ComponentType.UserSelect;
	isV2 = false;
	defaultValues;
	run(interaction, data) {}
	serializeOptions() {
		return {
			type: this.type,
			default_values: this.defaultValues
		};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/utils/LRUCache.js
/**
* Simple LRU (Least Recently Used) cache implementation
* Automatically evicts least recently used items when capacity is reached
*/
var LRUCache = class {
	cache;
	maxSize;
	constructor(maxSize = 1e4) {
		this.cache = /* @__PURE__ */ new Map();
		this.maxSize = maxSize;
	}
	/**
	* Get a value from the cache
	* @param key The key to retrieve
	* @returns The value if found, undefined otherwise
	*/
	get(key) {
		const value = this.cache.get(key);
		if (value !== void 0) {
			this.cache.delete(key);
			this.cache.set(key, value);
		}
		return value;
	}
	/**
	* Set a value in the cache
	* @param key The key to set
	* @param value The value to store
	*/
	set(key, value) {
		this.cache.delete(key);
		if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value;
			if (firstKey !== void 0) this.cache.delete(firstKey);
		}
		this.cache.set(key, value);
	}
	/**
	* Check if a key exists in the cache
	* @param key The key to check
	* @returns true if the key exists
	*/
	has(key) {
		return this.cache.has(key);
	}
	/**
	* Delete a key from the cache
	* @param key The key to delete
	* @returns true if the key was deleted
	*/
	delete(key) {
		return this.cache.delete(key);
	}
	/**
	* Get the current size of the cache
	*/
	get size() {
		return this.cache.size;
	}
	/**
	* Get all values in the cache
	*/
	values() {
		return this.cache.values();
	}
	/**
	* Clear all entries from the cache
	*/
	clear() {
		this.cache.clear();
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/ButtonInteraction.js
var ButtonInteraction = class extends BaseComponentInteraction {
	constructor(client, data, defaults) {
		super(client, data, defaults);
		if (!data.data) throw new Error("Invalid interaction data was used to create this class");
		if (data.type !== InteractionType.MessageComponent) throw new Error("Invalid interaction type was used to create this class");
		if (data.data.component_type !== ComponentType.Button) throw new Error("Invalid component type was used to create this class");
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/ChannelSelectMenuInteraction.js
var ChannelSelectMenuInteraction = class extends AnySelectMenuInteraction {
	constructor(client, data, defaults) {
		super(client, data, defaults);
		if (data.data.component_type !== ComponentType.ChannelSelect) throw new Error("Invalid component type was used to create this class");
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/MentionableSelectMenuInteraction.js
var MentionableSelectMenuInteraction = class extends AnySelectMenuInteraction {
	constructor(client, data, defaults) {
		super(client, data, defaults);
		if (data.data.component_type !== ComponentType.MentionableSelect) throw new Error("Invalid component type was used to create this class");
	}
	get values() {
		return this.rawData.data.values;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/RoleSelectMenuInteraction.js
var RoleSelectMenuInteraction = class extends AnySelectMenuInteraction {
	constructor(client, data, defaults) {
		super(client, data, defaults);
		if (data.data.component_type !== ComponentType.RoleSelect) throw new Error("Invalid component type was used to create this class");
	}
	get values() {
		return this.rawData.data.values;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/StringSelectMenuInteraction.js
var StringSelectMenuInteraction = class extends AnySelectMenuInteraction {
	constructor(client, data, defaults) {
		super(client, data, defaults);
		if (data.data.component_type !== ComponentType.StringSelect) throw new Error("Invalid component type was used to create this class");
	}
	get values() {
		return this.rawData.data.values;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/UserSelectMenuInteraction.js
var UserSelectMenuInteraction = class extends AnySelectMenuInteraction {
	constructor(client, data, defaults) {
		super(client, data, defaults);
		if (data.data.component_type !== ComponentType.UserSelect) throw new Error("Invalid component type was used to create this class");
	}
	get values() {
		return this.rawData.data.values;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/ComponentHandler.js
var ComponentHandler = class extends Base {
	componentCache = new LRUCache(1e4);
	oneOffComponents = /* @__PURE__ */ new Map();
	getComponentCacheKey(key, componentType) {
		return `${componentType}:${key}`;
	}
	registerComponent(component) {
		const componentKey = component.customIdParser(component.customId).key;
		const cacheKey = this.getComponentCacheKey(componentKey, component.type);
		if (!this.componentCache.has(cacheKey)) this.componentCache.set(cacheKey, component);
	}
	hasComponentWithKey(key, componentType) {
		for (const component of this.componentCache.values()) {
			if (component.customIdParser(component.customId).key !== key) continue;
			if (componentType === void 0 || component.type === componentType) return true;
		}
		return false;
	}
	findComponent(customId, componentType) {
		for (const component of this.componentCache.values()) if (component.customIdParser(component.customId).key === component.customIdParser(customId).key && component.type === componentType) return component;
		for (const component of this.componentCache.values()) if (component.customIdParser(component.customId).key === "*" && component.type === componentType) return component;
	}
	async handleInteraction(data) {
		const oneOffComponent = this.oneOffComponents.get(`${data.message.id}-${data.message.channel_id}`);
		if (oneOffComponent) {
			oneOffComponent.resolve(data.data);
			this.oneOffComponents.delete(`${data.message.id}-${data.message.channel_id}`);
			await this.client.rest.post(Routes.interactionCallback(data.id, data.token), { body: { type: InteractionResponseType.DeferredMessageUpdate } }).catch(() => {
				console.warn(`Failed to acknowledge one-off component interaction for message ${data.message.id}`);
			});
			return;
		}
		const component = this.findComponent(data.data.custom_id, data.data.component_type);
		if (!component) throw new Error(`Unknown component with type ${data.data.component_type} and custom ID ${data.data.custom_id} was received, did you forget to register the component? See https://carbon.buape.com/concepts/component-registration for more information.`);
		const parsed = component.customIdParser(data.data.custom_id);
		if (component instanceof Button$1) {
			const interaction = new ButtonInteraction(this.client, data, { ephemeral: typeof component.ephemeral === "function" ? false : component.ephemeral });
			if (typeof component.ephemeral === "function") interaction.setDefaultEphemeral(component.ephemeral(interaction));
			if (typeof component.defer === "function" ? component.defer(interaction) : component.defer) await interaction.defer();
			await component.run(interaction, parsed.data);
		} else if (component instanceof RoleSelectMenu$1) {
			const interaction = new RoleSelectMenuInteraction(this.client, data, { ephemeral: typeof component.ephemeral === "function" ? false : component.ephemeral });
			if (typeof component.ephemeral === "function") interaction.setDefaultEphemeral(component.ephemeral(interaction));
			if (typeof component.defer === "function" ? component.defer(interaction) : component.defer) await interaction.defer();
			await component.run(interaction, parsed.data);
		} else if (component instanceof ChannelSelectMenu$1) {
			const interaction = new ChannelSelectMenuInteraction(this.client, data, { ephemeral: typeof component.ephemeral === "function" ? false : component.ephemeral });
			if (typeof component.ephemeral === "function") interaction.setDefaultEphemeral(component.ephemeral(interaction));
			if (typeof component.defer === "function" ? component.defer(interaction) : component.defer) await interaction.defer();
			await component.run(interaction, parsed.data);
		} else if (component instanceof MentionableSelectMenu$1) {
			const interaction = new MentionableSelectMenuInteraction(this.client, data, { ephemeral: typeof component.ephemeral === "function" ? false : component.ephemeral });
			if (typeof component.ephemeral === "function") interaction.setDefaultEphemeral(component.ephemeral(interaction));
			if (typeof component.defer === "function" ? component.defer(interaction) : component.defer) await interaction.defer();
			await component.run(interaction, parsed.data);
		} else if (component instanceof StringSelectMenu$1) {
			const interaction = new StringSelectMenuInteraction(this.client, data, { ephemeral: typeof component.ephemeral === "function" ? false : component.ephemeral });
			if (typeof component.ephemeral === "function") interaction.setDefaultEphemeral(component.ephemeral(interaction));
			if (typeof component.defer === "function" ? component.defer(interaction) : component.defer) await interaction.defer();
			await component.run(interaction, parsed.data);
		} else if (component instanceof UserSelectMenu$1) {
			const interaction = new UserSelectMenuInteraction(this.client, data, { ephemeral: typeof component.ephemeral === "function" ? false : component.ephemeral });
			if (typeof component.ephemeral === "function") interaction.setDefaultEphemeral(component.ephemeral(interaction));
			if (typeof component.defer === "function" ? component.defer(interaction) : component.defer) await interaction.defer();
			await component.run(interaction, parsed.data);
		} else throw new Error(`Unknown component with type ${data.data.component_type} and custom ID ${data.data.custom_id}`);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/EmojiHandler.js
/**
* This class is specifically used for application emojis that you manage from the Discord Developer Portal
*/
var EmojiHandler = class extends Base {
	async list() {
		return (await this.client.rest.get(Routes.applicationEmojis(this.client.options.clientId))).items.map((emoji) => new ApplicationEmoji(this.client, emoji, this.client.options.clientId));
	}
	async get(id) {
		const emoji = await this.client.rest.get(Routes.applicationEmoji(this.client.options.clientId, id));
		return new ApplicationEmoji(this.client, emoji, this.client.options.clientId);
	}
	async getByName(name) {
		return (await this.list()).find((emoji) => emoji.name === name);
	}
	/**
	* Upload a new emoji to the application
	* @param name The name of the emoji
	* @param image The image of the emoji in base64 format
	* @returns The created ApplicationEmoji
	*/
	async create(name, image) {
		const emoji = await this.client.rest.post(Routes.applicationEmojis(this.client.options.clientId), { body: {
			name,
			image
		} });
		return new ApplicationEmoji(this.client, emoji, this.client.options.clientId);
	}
	async delete(id) {
		await this.client.rest.delete(Routes.applicationEmoji(this.client.options.clientId, id));
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/EventQueue.js
var EventQueue = class {
	client;
	queue = [];
	processing = 0;
	options;
	lastYieldAt = 0;
	processedCount = 0;
	droppedCount = 0;
	timeoutCount = 0;
	constructor(client, options = {}) {
		this.client = client;
		this.options = {
			maxQueueSize: options.maxQueueSize ?? 1e4,
			maxConcurrency: options.maxConcurrency ?? 50,
			listenerTimeout: options.listenerTimeout ?? 3e4,
			listenerConcurrency: options.listenerConcurrency ?? 10,
			yieldIntervalMs: options.yieldIntervalMs ?? 0,
			logSlowListeners: options.logSlowListeners ?? true,
			slowListenerThreshold: options.slowListenerThreshold ?? 1e3
		};
	}
	enqueue(payload, type) {
		if (this.queue.length >= this.options.maxQueueSize) {
			this.droppedCount++;
			return false;
		}
		this.queue.push({
			payload,
			type,
			timestamp: Date.now()
		});
		this.processNext();
		return true;
	}
	async processNext() {
		if (this.processing >= this.options.maxConcurrency || this.queue.length === 0) return;
		const event = this.queue.shift();
		if (!event) return;
		this.processing++;
		this.processEvent(event).catch((error) => {
			console.error("[EventQueue] Unexpected error processing event:", error);
		}).finally(() => {
			this.processing--;
			this.processedCount++;
			if (this.queue.length > 0) this.processNext();
		});
	}
	async processEvent(event) {
		const listeners = this.client.listeners.filter((x) => x.type === event.type);
		const concurrency = this.options.listenerConcurrency <= 0 ? listeners.length : this.options.listenerConcurrency;
		let index = 0;
		const runNext = async () => {
			while (index < listeners.length) {
				const listener = listeners[index++];
				if (!listener) continue;
				await this.maybeYield();
				await this.processListener(listener, event);
			}
		};
		const workers = Array.from({ length: Math.min(concurrency, listeners.length) }, () => runNext());
		await Promise.allSettled(workers);
	}
	async processListener(listener, event) {
		const startTime = Date.now();
		try {
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => {
					reject(/* @__PURE__ */ new Error(`Listener timeout after ${this.options.listenerTimeout}ms`));
				}, this.options.listenerTimeout);
			});
			const data = listener.parseRawData(event.payload, this.client);
			await Promise.race([listener.handle({
				...data,
				clientId: event.payload.clientId
			}, this.client), timeoutPromise]);
			const duration = Date.now() - startTime;
			if (this.options.logSlowListeners && duration >= this.options.slowListenerThreshold) console.warn(`[EventQueue] Slow listener detected: ${listener.constructor.name} took ${duration}ms for event ${String(event.type)}`);
		} catch (error) {
			if (error instanceof Error && error.message.includes("timeout")) {
				this.timeoutCount++;
				console.error(`[EventQueue] Listener ${listener.constructor.name} timed out after ${this.options.listenerTimeout}ms for event ${String(event.type)}`);
			} else console.error(`[EventQueue] Listener ${listener.constructor.name} failed for event ${String(event.type)}:`, error);
		}
	}
	async maybeYield() {
		if (this.options.yieldIntervalMs <= 0) return;
		const now = Date.now();
		if (now - this.lastYieldAt >= this.options.yieldIntervalMs) {
			this.lastYieldAt = now;
			await new Promise((resolve) => setImmediate(resolve));
		}
	}
	getMetrics() {
		return {
			queueSize: this.queue.length,
			processing: this.processing,
			processed: this.processedCount,
			dropped: this.droppedCount,
			timeouts: this.timeoutCount,
			maxQueueSize: this.options.maxQueueSize,
			maxConcurrency: this.options.maxConcurrency
		};
	}
	hasCapacity() {
		return this.queue.length < this.options.maxQueueSize;
	}
	getUtilization() {
		return this.queue.length / this.options.maxQueueSize;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/EventHandler.js
/**
* Handles Discord gateway events and dispatches them to registered listeners.
* @internal
*/
var EventHandler = class extends Base {
	eventQueue;
	constructor(client) {
		super(client);
		this.eventQueue = new EventQueue(client, client.options.eventQueue);
	}
	handleEvent(payload, type) {
		return this.eventQueue.enqueue(payload, type);
	}
	getMetrics() {
		return this.eventQueue.getMetrics();
	}
	hasCapacity() {
		return this.eventQueue.hasCapacity();
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/FieldsHandler.js
/**
* This class is used to parse the fields of a modal submit interaction.
* It is used internally by the Modal class.
*/
var FieldsHandler = class extends Base {
	/**
	* The raw data from the interaction.
	*/
	rawData = {};
	/**
	* The resolved data from the interaction.
	*/
	resolved;
	guildId;
	constructor(client, interaction) {
		super(client);
		this.resolved = interaction.data.resolved ?? {};
		this.guildId = interaction.guild_id;
		interaction.data.components.forEach((component) => {
			if (component.type === ComponentType.Label) {
				const subComponent = component.component;
				if (subComponent.type === ComponentType.TextInput) this.rawData[subComponent.custom_id] = [subComponent.value];
				else this.rawData[subComponent.custom_id] = subComponent.values;
			}
		});
	}
	getText(key, required = false) {
		const value = this.rawData[key]?.[0];
		if (required) {
			if (!value || typeof value !== "string") throw new Error(`Missing required field: ${key}`);
		} else if (!value || typeof value !== "string") return void 0;
		return value;
	}
	getStringSelect(key, required = false) {
		const value = this.rawData[key];
		if (required) {
			if (!value || !Array.isArray(value)) throw new Error(`Missing required field: ${key}`);
		} else if (!value || !Array.isArray(value)) return void 0;
		return value;
	}
	getChannelSelectIds(key, required = false) {
		const value = this.rawData[key];
		if (!value || !Array.isArray(value)) {
			if (required) throw new Error(`Missing required field: ${key}`);
			return;
		}
		return value;
	}
	async getChannelSelect(key, required = false) {
		const value = this.rawData[key];
		if (!value || !Array.isArray(value)) {
			if (required) throw new Error(`Missing required field: ${key}`);
			return;
		}
		return await Promise.all(value.map((id) => this.client.fetchChannel(id)));
	}
	getUserSelect(key, required = false) {
		const value = this.rawData[key];
		if (!value || !Array.isArray(value)) {
			if (required) throw new Error(`Missing required field: ${key}`);
			return;
		}
		const resolved = value.map((id) => this.resolved.users?.[id]);
		if (!resolved.every((user) => user !== void 0)) throw new Error(`Discord failed to resolve all users for ${key}, this is a bug.`);
		return resolved.filter((user) => user !== void 0).map((user) => new User(this.client, user));
	}
	getRoleSelect(key, required = false) {
		const value = this.rawData[key];
		if (!value || !Array.isArray(value)) {
			if (required) throw new Error(`Missing required field: ${key}`);
			return;
		}
		const resolved = value.map((id) => this.resolved.roles?.[id]);
		if (!resolved.every((role) => role !== void 0)) throw new Error(`Discord failed to resolve all roles for ${key}, this is a bug.`);
		if (!this.guildId) throw new Error("Guild ID is not available for this interaction");
		const guildId = this.guildId;
		return resolved.filter((role) => role !== void 0).map((role) => new Role(this.client, role, guildId));
	}
	getMentionableSelect(key, required = false) {
		const value = this.rawData[key];
		if (!value || !Array.isArray(value)) {
			if (required) throw new Error(`Missing required field: ${key}`);
			return;
		}
		if (!this.guildId) throw new Error("Guild ID is not available for this interaction");
		const guildId = this.guildId;
		const resolvedRoles = value.map((id) => this.resolved.roles?.[id]);
		const resolvedUsers = value.map((id) => this.resolved.users?.[id]);
		const result = {
			roles: resolvedRoles.filter((role) => role !== void 0).map((role) => new Role(this.client, role, guildId)),
			users: resolvedUsers.filter((user) => user !== void 0).map((user) => new User(this.client, user))
		};
		if (result.roles.length + result.users.length !== value.length) throw new Error(`Discord failed to resolve all mentionables for ${key}, this is a bug.`);
		return result;
	}
	getFile(key, required = false) {
		const value = this.rawData[key];
		if (!value || !Array.isArray(value)) {
			if (required) throw new Error(`Missing required field: ${key}`);
			return;
		}
		const resolved = value.map((id) => this.resolved.attachments?.[id]);
		if (!resolved.every((attachment) => attachment !== void 0)) throw new Error(`Discord failed to resolve all attachments for ${key}, this is a bug.`);
		return resolved.filter((attachment) => attachment !== void 0);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/ModalInteraction.js
var ModalInteraction = class extends BaseInteraction {
	customId;
	fields;
	constructor(client, data, defaults) {
		super(client, data, defaults);
		this.customId = data.data.custom_id;
		this.fields = new FieldsHandler(client, data);
	}
	/**
	* Acknowledge the interaction, the user does not see a loading state.
	* This can only be used for modals triggered from components
	*/
	async acknowledge() {
		await this.client.rest.post(Routes.interactionCallback(this.rawData.id, this.rawData.token), { body: { type: InteractionResponseType.DeferredMessageUpdate } });
		this._deferred = true;
	}
	/**
	* Update the original message of the component.
	* This can only be used for modals triggered from components
	*/
	async update(data) {
		const serialized = serializePayload$1(data);
		await this.client.rest.post(Routes.interactionCallback(this.rawData.id, this.rawData.token), { body: {
			type: InteractionResponseType.UpdateMessage,
			data: { ...serialized }
		} });
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/ModalHandler.js
var ModalHandler = class extends Base {
	modals = [];
	/**
	* Register a modal with the handler
	* @internal
	*/
	registerModal(modal) {
		if (!this.modals.find((x) => x.customId === modal.customId)) this.modals.push(modal);
	}
	/**
	* Handle an interaction
	* @internal
	*/
	async handleInteraction(data) {
		let modal = this.modals.find((x) => {
			return x.customIdParser(x.customId).key === x.customIdParser(data.data.custom_id).key;
		});
		if (!modal) modal = this.modals.find((x) => {
			return x.customIdParser(x.customId).key === "*";
		});
		if (!modal) return false;
		return await modal.run(new ModalInteraction(this.client, data, {}), modal.customIdParser(data.data.custom_id).data);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/internals/TemporaryListenerManager.js
var TemporaryListenerManager = class {
	client;
	listeners = /* @__PURE__ */ new Map();
	defaultTimeout;
	constructor(client, defaultTimeout = 3e5) {
		this.client = client;
		this.defaultTimeout = defaultTimeout;
	}
	register(listener, timeoutMs) {
		const id = this.generateId(listener);
		const timeout = timeoutMs ?? this.defaultTimeout;
		this.unregister(id);
		const timeoutHandle = setTimeout(() => {
			this.unregister(id);
			console.warn(`[TemporaryListenerManager] Listener ${listener.constructor.name} (${id}) timed out after ${timeout}ms and was automatically removed`);
		}, timeout);
		this.listeners.set(id, {
			listener,
			timeout: timeoutHandle,
			timestamp: Date.now()
		});
		this.client.registerListener(listener);
		return () => this.unregister(id);
	}
	unregister(id) {
		const listenerId = typeof id === "string" ? id : this.generateId(id);
		const entry = this.listeners.get(listenerId);
		if (!entry) return false;
		clearTimeout(entry.timeout);
		const idx = this.client.listeners.indexOf(entry.listener);
		if (idx > -1) this.client.listeners.splice(idx, 1);
		this.listeners.delete(listenerId);
		return true;
	}
	generateId(listener) {
		return `${listener.type}_${listener.constructor.name}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
	}
	getCount() {
		return this.listeners.size;
	}
	cleanup() {
		for (const id of this.listeners.keys()) this.unregister(id);
	}
	getMetrics() {
		const ages = Array.from(this.listeners.values()).map((entry) => Date.now() - entry.timestamp);
		return {
			count: this.listeners.size,
			oldestAge: ages.length > 0 ? Math.max(...ages) : 0,
			newestAge: ages.length > 0 ? Math.min(...ages) : 0,
			averageAge: ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0
		};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/errors/RatelimitError.js
/**
* A RateLimitError is thrown when the bot is rate limited by Discord, and you don't have requests set to queue.
*/
var RateLimitError$1 = class extends DiscordError {
	retryAfter;
	scope;
	bucket;
	request;
	method;
	url;
	constructor(response, body, request) {
		super(response, body);
		if (this.status !== 429) throw new Error("Invalid status code for RateLimitError");
		this.retryAfter = body.retry_after;
		this.scope = response.headers.get("X-RateLimit-Scope");
		this.bucket = response.headers.get("X-RateLimit-Bucket");
		this.request = request;
		this.method = request.method;
		this.url = request.url;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/RequestClient.js
const defaultOptions = {
	tokenHeader: "Bot",
	baseUrl: "https://discord.com/api",
	apiVersion: 10,
	userAgent: "DiscordBot (https://github.com/buape/carbon, v0.0.0)",
	timeout: 15e3,
	queueRequests: true,
	maxQueueSize: 1e3
};
/**
* This is the main class that handles making requests to the Discord API.
* It is used internally by Carbon, and you should not need to use it directly, but feel free to if you feel like living dangerously.
*/
var RequestClient$1 = class {
	/**
	* The options used to initialize the client
	*/
	options;
	queue = [];
	token;
	customFetch;
	abortController = null;
	processingQueue = false;
	routeBuckets = /* @__PURE__ */ new Map();
	bucketStates = /* @__PURE__ */ new Map();
	globalRateLimitUntil = 0;
	constructor(token, options) {
		this.token = token;
		this.customFetch = options?.fetch;
		this.options = {
			...defaultOptions,
			...options
		};
	}
	async get(path, query) {
		return await this.request("GET", path, { query });
	}
	async post(path, data, query) {
		return await this.request("POST", path, {
			data,
			query
		});
	}
	async patch(path, data, query) {
		return await this.request("PATCH", path, {
			data,
			query
		});
	}
	async put(path, data, query) {
		return await this.request("PUT", path, {
			data,
			query
		});
	}
	async delete(path, data, query) {
		return await this.request("DELETE", path, {
			data,
			query
		});
	}
	async request(method, path, { data, query }) {
		const routeKey = this.getRouteKey(method, path);
		if (this.options.queueRequests) {
			if (typeof this.options.maxQueueSize === "number" && this.options.maxQueueSize > 0 && this.queue.length >= this.options.maxQueueSize) {
				const stats = this.queue.reduce((acc, item) => {
					const count = (acc.counts.get(item.routeKey) ?? 0) + 1;
					acc.counts.set(item.routeKey, count);
					if (count > acc.topCount) {
						acc.topCount = count;
						acc.topRoute = item.routeKey;
					}
					return acc;
				}, {
					counts: new Map([[routeKey, 1]]),
					topRoute: routeKey,
					topCount: 1
				});
				throw new Error(`Request queue is full (${this.queue.length} / ${this.options.maxQueueSize}), you should implement a queuing system in your requests or raise the queue size in Carbon. Top offender: ${stats.topRoute}`);
			}
			return new Promise((resolve, reject) => {
				this.queue.push({
					method,
					path,
					data,
					query,
					resolve,
					reject,
					routeKey
				});
				this.processQueue();
			});
		}
		return new Promise((resolve, reject) => {
			this.executeRequest({
				method,
				path,
				data,
				query,
				resolve,
				reject,
				routeKey
			}).then(resolve).catch((err) => {
				reject(err);
			});
		});
	}
	async executeRequest(request) {
		const { method, path, data, query, routeKey } = request;
		await this.waitForBucket(routeKey);
		const queryString = query ? `?${Object.entries(query).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&")}` : "";
		const url = `${this.options.baseUrl}${path}${queryString}`;
		const originalRequest = new Request(url, { method });
		const headers = this.token === "webhook" ? new Headers() : new Headers({ Authorization: `${this.options.tokenHeader} ${this.token}` });
		if (data?.headers) for (const [key, value] of Object.entries(data.headers)) headers.set(key, value);
		this.abortController = new AbortController();
		const timeoutMs = typeof this.options.timeout === "number" && this.options.timeout > 0 ? this.options.timeout : void 0;
		let body;
		if (data?.body && typeof data.body === "object") {
			const bodyObject = data.body;
			const topLevelFiles = "files" in bodyObject ? bodyObject.files : void 0;
			const nestedData = "data" in bodyObject && bodyObject.data && typeof bodyObject.data === "object" ? bodyObject.data : void 0;
			const nestedFiles = nestedData && "files" in nestedData ? nestedData.files : void 0;
			let payloadJson = null;
			let filesContainer = null;
			let files = [];
			if (topLevelFiles !== void 0) {
				payloadJson = { ...bodyObject };
				filesContainer = payloadJson;
				files = topLevelFiles ?? [];
			} else if (nestedFiles !== void 0 && nestedData) {
				payloadJson = {
					...bodyObject,
					data: { ...nestedData }
				};
				filesContainer = payloadJson.data;
				files = nestedFiles ?? [];
			}
			if (payloadJson && filesContainer && files.length > 0) {
				const formData = new FormData();
				const existingAttachments = Array.isArray(filesContainer.attachments) ? [...filesContainer.attachments] : [];
				const uploadedAttachments = [];
				for (const [index, file] of files.entries()) {
					let { data: fileData } = file;
					if (!(fileData instanceof Blob)) fileData = new Blob([fileData]);
					const attachmentId = existingAttachments.length + index;
					formData.append(`files[${attachmentId}]`, fileData, file.name);
					uploadedAttachments.push({
						id: attachmentId,
						filename: file.name,
						...file.description !== void 0 ? { description: file.description } : {},
						...file.duration_secs !== void 0 ? { duration_secs: file.duration_secs } : {},
						...file.waveform !== void 0 ? { waveform: file.waveform } : {}
					});
				}
				filesContainer.attachments = [...existingAttachments, ...uploadedAttachments];
				delete filesContainer.files;
				formData.append("payload_json", JSON.stringify(payloadJson));
				body = formData;
			} else {
				headers.set("Content-Type", "application/json");
				if (data.rawBody) body = data.body;
				else body = JSON.stringify(data.body);
			}
		} else if (data?.body != null) {
			headers.set("Content-Type", "application/json");
			if (data.rawBody) body = data.body;
			else body = JSON.stringify(data.body);
		}
		let timeoutId;
		if (timeoutMs !== void 0) timeoutId = setTimeout(() => {
			this.abortController?.abort();
		}, timeoutMs);
		let response;
		const fetchFn = this.customFetch ?? fetch;
		try {
			response = await fetchFn(url, {
				method,
				headers,
				body,
				signal: this.abortController.signal
			});
		} finally {
			if (timeoutId) clearTimeout(timeoutId);
		}
		let rawBody = "";
		let parsedBody;
		try {
			rawBody = await response.text();
		} catch {
			rawBody = "";
		}
		if (rawBody.length > 0) try {
			parsedBody = JSON.parse(rawBody);
		} catch {
			parsedBody = void 0;
		}
		if (response.status === 429) {
			const rateLimitBody = parsedBody && typeof parsedBody === "object" && "retry_after" in parsedBody && "message" in parsedBody ? parsedBody : {
				message: typeof parsedBody === "string" ? parsedBody : rawBody || "You are being rate limited.",
				retry_after: (() => {
					const retryAfterHeader = response.headers.get("Retry-After");
					if (retryAfterHeader && !Number.isNaN(Number(retryAfterHeader))) return Number(retryAfterHeader);
					return 1;
				})(),
				global: response.headers.get("X-RateLimit-Scope") === "global"
			};
			const rateLimitError = new RateLimitError$1(response, rateLimitBody, originalRequest);
			this.scheduleRateLimit(routeKey, path, rateLimitError);
			throw rateLimitError;
		}
		this.updateBucketFromHeaders(routeKey, path, response);
		if (response.status >= 400 && response.status < 600) throw new DiscordError(response, parsedBody && typeof parsedBody === "object" ? parsedBody : {
			message: rawBody || "Discord API error",
			code: 0
		});
		if (parsedBody !== void 0) return parsedBody;
		if (rawBody.length > 0) return rawBody;
		return null;
	}
	async processQueue() {
		if (this.processingQueue) return;
		this.processingQueue = true;
		while (this.queue.length > 0) {
			const queueItem = this.queue.shift();
			if (!queueItem) continue;
			const { resolve, reject } = queueItem;
			try {
				resolve(await this.executeRequest(queueItem));
			} catch (error) {
				if (error instanceof RateLimitError$1 && this.options.queueRequests) this.queue.unshift(queueItem);
				else if (error instanceof Error) reject(error);
				else reject(new Error("Unknown error during request", { cause: error }));
			} finally {
				this.abortController = null;
			}
		}
		this.processingQueue = false;
		if (this.queue.length > 0) this.processQueue();
	}
	async waitForBucket(routeKey) {
		while (true) {
			const now = Date.now();
			if (this.globalRateLimitUntil > now) {
				await sleep(this.globalRateLimitUntil - now);
				continue;
			}
			const bucketKey = this.routeBuckets.get(routeKey) ?? routeKey;
			const bucket = this.bucketStates.get(bucketKey);
			if (bucket && bucket.delayUntil > now) {
				await sleep(bucket.delayUntil - now);
				continue;
			}
			break;
		}
	}
	scheduleRateLimit(routeKey, path, error) {
		const bucketKey = error.bucket ? this.getBucketKey(routeKey, path, error.bucket) : this.routeBuckets.get(routeKey) ?? routeKey;
		const waitTime = Math.max(0, Math.ceil(error.retryAfter * 1e3));
		const now = Date.now();
		const bucket = this.bucketStates.get(bucketKey) ?? {
			delayUntil: 0,
			extraBackoff: 0,
			remaining: 0
		};
		const extraBackoff = bucket.delayUntil <= now ? Math.min(bucket.extraBackoff ? bucket.extraBackoff * 2 : 1e3, 6e4) : bucket.extraBackoff ?? 0;
		const nextAvailable = now + waitTime + extraBackoff;
		this.bucketStates.set(bucketKey, {
			delayUntil: nextAvailable,
			extraBackoff,
			remaining: 0
		});
		this.routeBuckets.set(routeKey, bucketKey);
		if (error.scope === "global") this.globalRateLimitUntil = nextAvailable;
	}
	updateBucketFromHeaders(routeKey, path, response) {
		const bucketId = response.headers.get("X-RateLimit-Bucket");
		const remainingRaw = response.headers.get("X-RateLimit-Remaining");
		const resetAfterRaw = response.headers.get("X-RateLimit-Reset-After");
		if (!(!!bucketId || !!remainingRaw || !!resetAfterRaw)) return;
		const key = bucketId ? this.getBucketKey(routeKey, path, bucketId) : this.routeBuckets.get(routeKey) ?? routeKey;
		if (bucketId) this.routeBuckets.set(routeKey, key);
		const remaining = remainingRaw ? Number(remainingRaw) : void 0;
		const resetAfter = resetAfterRaw ? Number(resetAfterRaw) * 1e3 : void 0;
		const now = Date.now();
		const bucket = this.bucketStates.get(key) ?? {
			delayUntil: 0,
			extraBackoff: 0,
			remaining: 1
		};
		if (typeof remaining === "number" && !Number.isNaN(remaining)) bucket.remaining = remaining;
		if (typeof resetAfter === "number" && !Number.isNaN(resetAfter) && bucket.remaining <= 0) bucket.delayUntil = now + resetAfter;
		else if (bucket.remaining > 0) bucket.delayUntil = 0;
		bucket.extraBackoff = 0;
		this.bucketStates.set(key, bucket);
	}
	getBucketKey(routeKey, path, bucketId) {
		if (!bucketId) return routeKey;
		const major = this.getMajorParameter(path);
		return major ? `${bucketId}:${major}` : bucketId;
	}
	getMajorParameter(path) {
		const segments = path.split("/");
		for (let index = 0; index < segments.length; index += 1) {
			const segment = segments[index];
			const prev = segments[index - 1];
			if (prev === "channels" || prev === "guilds") return segment;
			if (prev === "webhooks") {
				const webhookToken = segments[index + 1];
				return webhookToken ? `${segment}/${webhookToken}` : segment;
			}
		}
		return null;
	}
	getRouteKey(method, path) {
		const segments = path.split("/");
		return `${method}:${segments.map((segment, index) => {
			if (!/^\d{16,}$/.test(segment)) return segment;
			const prev = segments[index - 1];
			if (prev && ["channels", "guilds"].includes(prev)) return segment;
			if (prev === "webhooks") return segment;
			if (segments[index - 2] === "webhooks") return segment;
			return ":id";
		}).join("/")}`;
	}
	clearQueue() {
		this.queue = [];
	}
	get queueSize() {
		return this.queue.length;
	}
	abortAllRequests() {
		if (this.abortController) this.abortController.abort();
		this.clearQueue();
	}
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(ms, 0)));
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/Webhook.js
var Webhook = class {
	rest;
	constructor(input) {
		if (!input) throw new Error(`Missing input, currently set to ${input}`);
		if (typeof input === "string") {
			const url = new URL(input);
			if (url.protocol !== "https:") throw new Error("Invalid URL");
			const [id, token] = url.pathname.split("/").slice(3);
			if (!id || !token) throw new Error("Invalid URL");
			this.id = id;
			this.token = token;
			this.threadId = url.searchParams.get("thread_id") ?? void 0;
		} else {
			if ("channel_id" in input) this.setData(input);
			this.id = input.id;
			this.token = input.token;
			this.threadId = "threadId" in input ? input.threadId : void 0;
		}
		this.rest = new RequestClient$1("webhook");
	}
	_rawData = null;
	setData(data) {
		if (!data) throw new Error("Cannot set data without having data... smh");
		this._rawData = data;
	}
	/**
	* The raw Discord API data for this webhook
	*/
	get rawData() {
		if (!this._rawData) throw new Error("Cannot access rawData on partial Webhook. Use fetch() to populate data.");
		return this._rawData;
	}
	/**
	* The ID of the webhook
	*/
	id;
	/**
	* The token of the webhook
	*/
	token;
	/**
	* The thread ID this webhook is for
	*/
	threadId;
	/**
	* Whether the webhook is a partial webhook (meaning it does not have all the data).
	* If this is true, you should use {@link Webhook.fetch} to get the full data of the webhook.
	*/
	get partial() {
		return this._rawData === null;
	}
	/**
	* The type of the webhook
	* @see https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types
	*/
	get type() {
		if (!this._rawData) return void 0;
		return this._rawData.type;
	}
	/**
	* The guild id this webhook is for
	*/
	get guildId() {
		if (!this._rawData) return void 0;
		return this._rawData.guild_id;
	}
	/**
	* The channel id this webhook is for
	*/
	get channelId() {
		if (!this._rawData) return void 0;
		return this._rawData.channel_id;
	}
	/**
	* The user this webhook was created by
	* Not returned when getting a webhook with its token
	*/
	get user() {
		if (!this._rawData?.user) return void 0;
		return this._rawData.user;
	}
	/**
	* The default name of the webhook
	*/
	get name() {
		if (!this._rawData) return void 0;
		return this._rawData.name;
	}
	/**
	* The default avatar of the webhook
	*/
	get avatar() {
		if (!this._rawData) return void 0;
		return this._rawData.avatar;
	}
	/**
	* Get the URL of the webhook's avatar with default settings (png format)
	*/
	get avatarUrl() {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/avatars/${this.id}`, this.avatar);
	}
	/**
	* Get the URL of the webhook's avatar with custom format and size options
	* @param options Optional format and size parameters
	* @returns The avatar URL or null if no avatar is set
	*/
	getAvatarUrl(options) {
		if (!this._rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/avatars/${this.id}`, this.avatar, options);
	}
	/**
	* The bot/OAuth2 application that created this webhook
	*/
	get applicationId() {
		if (!this._rawData) return void 0;
		return this._rawData.application_id;
	}
	/**
	* The guild of the channel that this webhook is following
	* Only returned for Channel Follower Webhooks
	*/
	get sourceGuild() {
		if (!this._rawData) return void 0;
		return this._rawData.source_guild;
	}
	/**
	* The channel that this webhook is following
	* Only returned for Channel Follower Webhooks
	*/
	get sourceChannel() {
		if (!this._rawData) return void 0;
		return this._rawData.source_channel;
	}
	/**
	* The url used for executing the webhook
	* Only returned by the webhooks OAuth2 flow
	*/
	get url() {
		return `https://discord.com/api/webhooks/${this.id}/${this.token}`;
	}
	buildQuery({ threadId, wait, withComponents, useDefaultThread = false }) {
		const query = {};
		const resolvedThreadId = useDefaultThread ? threadId ?? this.threadId : threadId;
		if (resolvedThreadId) query.thread_id = resolvedThreadId;
		if (wait) query.wait = "true";
		if (withComponents) query.with_components = "true";
		return query;
	}
	normalizeQuery(query) {
		return Object.keys(query).length > 0 ? query : void 0;
	}
	urlWithOptions({ wait, threadId, withComponents }) {
		let base = `/webhooks/${this.id}/${this.token}`;
		const query = this.buildQuery({
			threadId,
			wait,
			withComponents
		});
		const queryString = new URLSearchParams(query).toString();
		if (queryString) base += `?${queryString}`;
		return base;
	}
	/**
	* Fetch this webhook's data
	* @returns A Promise that resolves to a non-partial Webhook
	*/
	async fetch() {
		const newData = await this.rest.get(Routes.webhook(this.id));
		if (!newData) throw new Error(`Webhook ${this.id} not found`);
		this.setData(newData);
		return this;
	}
	/**
	* Modify this webhook
	* @param data The data to modify the webhook with
	* @returns A Promise that resolves to the modified webhook
	*/
	async modify(data) {
		const newData = await this.rest.patch(Routes.webhook(this.id), { body: data });
		this.setData(newData);
		return this;
	}
	/**
	* Delete this webhook
	* @returns A Promise that resolves when the webhook is deleted
	*/
	async delete() {
		await this.rest.delete(Routes.webhook(this.id));
	}
	/**
	* Send a message through this webhook
	* @param data The data to send with the webhook
	* @param threadId Optional ID of the thread to send the message to. If not provided, uses the webhook's thread ID.
	*/
	async send(data, threadId, wait) {
		if (!this.token) throw new Error("Cannot send webhook message without token");
		const serialized = serializePayload$1(data);
		const shouldEnableComponents = Boolean(serialized.components?.length);
		const query = this.buildQuery({
			threadId,
			wait,
			useDefaultThread: true,
			withComponents: shouldEnableComponents
		});
		return await this.rest.post(`/webhooks/${this.id}/${this.token}`, { body: serialized }, this.normalizeQuery(query));
	}
	/**
	* Edit a message sent by this webhook
	* @param messageId The ID of the message to edit
	* @param data The data to edit the message with
	* @param threadId Optional ID of the thread to edit the message in. If not provided, uses the webhook's thread ID.
	*/
	async edit(messageId, data, threadId) {
		if (!this.token) throw new Error("Cannot edit webhook message without token");
		const serialized = serializePayload$1(data);
		const shouldEnableComponents = Boolean(serialized.components?.length);
		const query = this.buildQuery({
			threadId,
			useDefaultThread: true,
			withComponents: shouldEnableComponents
		});
		return await this.rest.patch(Routes.webhookMessage(this.id, this.token, messageId), { body: serialized }, this.normalizeQuery(query));
	}
	/**
	* Delete a message sent by this webhook
	* @param messageId The ID of the message to delete
	* @param threadId Optional ID of the thread to delete the message from. If not provided, uses the webhook's thread ID.
	* @returns A Promise that resolves when the message is deleted
	*/
	async deleteMessage(messageId, threadId) {
		if (!this.token) throw new Error("Cannot delete webhook message without token");
		const query = this.buildQuery({
			threadId,
			useDefaultThread: true
		});
		await this.rest.delete(Routes.webhookMessage(this.id, this.token, messageId), void 0, this.normalizeQuery(query));
	}
	/**
	* Get a message sent by this webhook
	* @param messageId The ID of the message to get
	* @param threadId Optional ID of the thread to get the message from. If not provided, uses the webhook's thread ID.
	* @returns The raw data of the message, which you can then use to create a Message instance
	*/
	async getMessage(messageId, threadId) {
		if (!this.token) throw new Error("Cannot get webhook message without token");
		const query = this.buildQuery({
			threadId,
			useDefaultThread: true
		});
		return await this.rest.get(Routes.webhookMessage(this.id, this.token, messageId), this.normalizeQuery(query));
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/Client.js
/**
* The main client used to interact with Discord
*/
var Client$1 = class {
	/**
	* The routes that the client will handle
	*/
	routes = [];
	/**
	* The plugins that the client has registered
	*/
	plugins = [];
	/**
	* The options used to initialize the client
	*/
	options;
	/**
	* The commands that the client has registered
	*/
	commands;
	/**
	* The event listeners that the client has registered
	*/
	listeners = [];
	/**
	* The rest client used to interact with the Discord API
	*/
	rest;
	/**
	* The handler for the component interactions sent from Discord
	* @internal
	*/
	componentHandler;
	/**
	* The handler for the modal interactions sent from Discord
	* @internal
	*/
	commandHandler;
	/**
	* The handler for the modal interactions sent from Discord
	* @internal
	*/
	modalHandler;
	/**
	* The handler for events sent from Discord
	* @internal
	*/
	eventHandler;
	/**
	* The manager for temporary event listeners with automatic cleanup
	*/
	temporaryListeners;
	/**
	* The handler for application emojis for this application
	*/
	emoji;
	cachedGlobalCommands = null;
	/**
	* The ID of the shard this client is running on, if sharding is enabled
	*/
	shardId;
	/**
	* The total number of shards, if sharding is enabled
	*/
	totalShards;
	/**
	* Creates a new client
	* @param options The options used to initialize the client
	* @param handlers The handlers that the client has registered
	* @param plugins The plugins that the client should use
	*/
	constructor(options, handlers, plugins = []) {
		if (!options.clientId) throw new Error("Missing client ID");
		if (!options.publicKey) throw new Error("Missing public key");
		if (!options.token) throw new Error("Missing token");
		if (!options.deploySecret && !options.disableDeployRoute) throw new Error("Missing deploy secret");
		this.options = options;
		this.commands = handlers.commands ?? [];
		this.listeners = handlers.listeners ?? [];
		options.baseUrl = options.baseUrl.replace(/\/+$/, "");
		this.commandHandler = new CommandHandler(this);
		this.componentHandler = new ComponentHandler(this);
		this.modalHandler = new ModalHandler(this);
		this.eventHandler = new EventHandler(this);
		this.temporaryListeners = new TemporaryListenerManager(this);
		this.emoji = new EmojiHandler(this);
		for (const component of handlers.components ?? []) this.componentHandler.registerComponent(component);
		for (const command of this.commands) for (const component of command.components ?? []) this.componentHandler.registerComponent(component);
		for (const modal of handlers.modals ?? []) this.modalHandler.registerModal(modal);
		this.rest = new RequestClient$1(options.token, options.requestOptions);
		this.appendRoutes();
		for (const plugin of plugins) {
			plugin.registerClient?.(this);
			plugin.registerRoutes?.(this);
			this.plugins.push({
				id: plugin.id,
				plugin
			});
		}
		if (options.autoDeploy) this.deployCommands();
	}
	getPlugin(id) {
		return this.plugins.find((p) => p.id === id)?.plugin;
	}
	appendRoutes() {
		this.routes.push({
			method: "GET",
			path: "/deploy",
			handler: this.handleDeployRequest.bind(this),
			protected: true,
			disabled: this.options.disableDeployRoute
		});
		this.routes.push({
			method: "POST",
			path: "/interactions",
			handler: this.handleInteractionsRequest.bind(this),
			disabled: this.options.disableInteractionsRoute
		});
		this.routes.push({
			method: "POST",
			path: "/events",
			handler: this.handleEventsRequest.bind(this),
			disabled: this.options.disableEventsRoute
		});
	}
	/**
	* Handle a request to deploy the commands to Discord
	* @returns A response
	*/
	async handleDeployRequest(req) {
		let mode;
		if (req) {
			const value = new URL(req.url).searchParams.get("mode");
			if (value === "overwrite" || value === "reconcile") mode = value;
		}
		if ((await this.deployCommands({ mode })).usedDevGuilds) return new Response("OK (devGuilds)", { status: 202 });
		return new Response("OK", { status: 202 });
	}
	async deployCommands(options = {}) {
		const commands = this.commands.filter((c) => c.name !== "*");
		const globalCommands = commands.filter((c) => !c.guildIds);
		const guildCommandsMap = {};
		const mode = options.mode ?? this.options.commandDeploymentMode ?? "overwrite";
		for (const command of commands) if (command.guildIds) for (const guildId of command.guildIds) {
			if (!guildCommandsMap[guildId]) guildCommandsMap[guildId] = [];
			guildCommandsMap[guildId].push(command.serialize());
		}
		if (this.options.devGuilds && this.options.devGuilds.length > 0) {
			const devGuildCommands = commands.filter((command) => command.type !== ApplicationCommandType.PrimaryEntryPoint);
			for (const guildId of this.options.devGuilds) {
				const deployed = await this.rest.put(Routes.applicationGuildCommands(this.options.clientId, guildId), { body: devGuildCommands.map((c) => c.serialize()) });
				this.updateCommandIdsFromDeployment(deployed);
			}
			const primaryEntryPointCommands = commands.filter((command) => command.type === ApplicationCommandType.PrimaryEntryPoint);
			if (primaryEntryPointCommands.length > 0) {
				const deployed = await this.rest.put(Routes.applicationCommands(this.options.clientId), { body: primaryEntryPointCommands.map((command) => command.serialize()) });
				this.updateCommandIdsFromDeployment(deployed);
				this.cachedGlobalCommands = deployed;
			}
			return {
				mode,
				usedDevGuilds: true
			};
		}
		for (const [guildId, cmds] of Object.entries(guildCommandsMap)) {
			const deployed = await this.rest.put(Routes.applicationGuildCommands(this.options.clientId, guildId), { body: cmds });
			this.updateCommandIdsFromDeployment(deployed);
		}
		if (mode === "reconcile") await this.reconcileGlobalCommands(globalCommands);
		else if (globalCommands.length > 0) {
			const deployed = await this.rest.put(Routes.applicationCommands(this.options.clientId), { body: globalCommands.map((c) => c.serialize()) });
			this.updateCommandIdsFromDeployment(deployed);
			this.cachedGlobalCommands = deployed;
		}
		return {
			mode,
			usedDevGuilds: false
		};
	}
	async reconcileCommands() {
		return await this.deployCommands({ mode: "reconcile" });
	}
	/**
	* Handle an interaction request from Discord
	* @param req The request to handle
	* @returns A response
	*/
	async handleEventsRequest(req) {
		if (!await this.validateDiscordRequest(req)) return new Response("Unauthorized", { status: 401 });
		const payload = await req.json();
		if (payload.type === ApplicationWebhookType.Ping) return new Response(null, { status: 204 });
		if (!this.eventHandler.handleEvent({
			...payload.event.data,
			clientId: this.options.clientId
		}, payload.event.type)) return new Response("Event queue full, retry later", { status: 429 });
		return new Response(null, { status: 204 });
	}
	/**
	* Handle an interaction request from Discord
	* @param req The request to handle
	* @param ctx The context for the request
	* @returns A response
	*/
	async handleInteractionsRequest(req, ctx) {
		if (!await this.validateDiscordRequest(req)) return new Response("Unauthorized", { status: 401 });
		const interaction = await req.json();
		if (interaction.type === InteractionType.Ping) return Response.json({ type: InteractionResponseType.Pong });
		await this.handleInteraction(interaction, ctx);
		return new Response("OK", { status: 202 });
	}
	/**
	* Handle an interaction request from Discord
	* @param interaction The interaction to handle
	* @param ctx The context for the request
	* @returns A response
	*/
	async handleInteraction(interaction, ctx) {
		if (interaction.type === InteractionType.ApplicationCommand) {
			const promise = this.commandHandler.handleCommandInteraction(interaction);
			if (ctx?.waitUntil) ctx.waitUntil(promise);
			else await promise;
		}
		if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			const promise = this.commandHandler.handleAutocompleteInteraction(interaction);
			if (ctx?.waitUntil) ctx.waitUntil(promise);
			else await promise;
		}
		if (interaction.type === InteractionType.MessageComponent) {
			const promise = this.componentHandler.handleInteraction(interaction);
			if (ctx?.waitUntil) ctx.waitUntil(promise);
			else await promise;
		}
		if (interaction.type === InteractionType.ModalSubmit) {
			const promise = this.modalHandler.handleInteraction(interaction);
			if (ctx?.waitUntil) ctx.waitUntil(promise);
			else await promise;
		}
	}
	/**
	* Validate a request from Discord
	* @param req The request to validate
	*/
	async validateDiscordRequest(req) {
		const body = await req.clone().text();
		const signature = req.headers.get("X-Signature-Ed25519");
		const timestamp = req.headers.get("X-Signature-Timestamp");
		if (!timestamp || !signature || req.method !== "POST" || !body) return false;
		try {
			const message = concatUint8Arrays(valueToUint8Array(timestamp), valueToUint8Array(body));
			const publicKeys = Array.isArray(this.options.publicKey) ? this.options.publicKey : [this.options.publicKey];
			for (const publicKey of publicKeys) try {
				const publicKeyBuffer = valueToUint8Array(publicKey, "hex");
				const signatureBuffer = valueToUint8Array(signature, "hex");
				const publicKeyArrayBuffer = new ArrayBuffer(publicKeyBuffer.length);
				new Uint8Array(publicKeyArrayBuffer).set(publicKeyBuffer);
				const signatureArrayBuffer = new ArrayBuffer(signatureBuffer.length);
				new Uint8Array(signatureArrayBuffer).set(signatureBuffer);
				const messageArrayBuffer = new ArrayBuffer(message.length);
				new Uint8Array(messageArrayBuffer).set(message);
				if (await subtleCrypto.verify({ name: "ed25519" }, await subtleCrypto.importKey("raw", publicKeyArrayBuffer, {
					name: "ed25519",
					namedCurve: "ed25519"
				}, false, ["verify"]), signatureArrayBuffer, messageArrayBuffer)) return true;
			} catch {}
			return false;
		} catch (_) {
			return false;
		}
	}
	/**
	* Register an event listener with the client.
	* This method provides type-safe listener registration without requiring
	* manual type casting at the call site.
	* @param listener The listener to register
	*/
	registerListener(listener) {
		this.listeners.push(listener);
	}
	/**
	* Fetch a user from the Discord API
	* @param id The ID of the user to fetch
	* @returns The user data
	*/
	async fetchUser(id) {
		const user = await this.rest.get(Routes.user(id));
		return new User(this, user);
	}
	/**
	* Fetch a guild from the Discord API
	* @param id The ID of the guild to fetch
	* @returns The guild data
	*/
	async fetchGuild(id) {
		const guild = await this.rest.get(Routes.guild(id));
		return new Guild(this, guild);
	}
	/**
	* Fetch a channel from the Discord API
	* @param id The ID of the channel to fetch
	* @returns The channel data
	*/
	async fetchChannel(id) {
		const channel = await this.rest.get(Routes.channel(id));
		return channelFactory(this, channel);
	}
	/**
	* Fetch a role from the Discord API
	* @param guildId The ID of the guild the role is in
	* @param id The ID of the role to fetch
	* @returns The role data
	*/
	async fetchRole(guildId, id) {
		const role = await this.rest.get(Routes.guildRole(guildId, id));
		return new Role(this, role, guildId);
	}
	/**
	* Fetch a member from the Discord API
	* @param guildId The ID of the guild the member is in
	* @param id The ID of the member to fetch
	* @returns The member data
	*/
	async fetchMember(guildId, id) {
		const member = await this.rest.get(Routes.guildMember(guildId, id));
		return new GuildMember(this, member, new Guild(this, guildId));
	}
	/**
	* Fetch a message from the Discord API
	* @param channelId The ID of the channel the message is in
	* @param messageId The ID of the message to fetch
	* @returns The message data
	*/
	async fetchMessage(channelId, messageId) {
		const message = await this.rest.get(Routes.channelMessage(channelId, messageId));
		return new Message(this, message);
	}
	/**
	* Fetch a webhook from the Discord API
	* @param input The webhook data, ID and token, or webhook URL
	* @returns The webhook data
	*/
	async fetchWebhook(input) {
		return new Webhook(input).fetch();
	}
	async getDiscordCommands(force = false) {
		if (!force && this.cachedGlobalCommands) return this.cachedGlobalCommands;
		const commands = await this.rest.get(Routes.applicationCommands(this.options.clientId));
		this.cachedGlobalCommands = commands;
		this.updateCommandIdsFromDeployment(commands);
		return commands;
	}
	updateCommandIdsFromDeployment(commands) {
		for (const deployed of commands) {
			const match = this.commands.find((command) => {
				if (command.name !== deployed.name) return false;
				if (command.type !== deployed.type) return false;
				if (deployed.guild_id) {
					if (!command.guildIds || command.guildIds.length === 0) return true;
					return command.guildIds.includes(deployed.guild_id);
				}
				return !command.guildIds || command.guildIds.length === 0;
			});
			if (match) match.id = deployed.id;
		}
	}
	async reconcileGlobalCommands(commands) {
		const discordCommandResponseOnlyFields = new Set([
			"application_id",
			"description_localized",
			"dm_permission",
			"guild_id",
			"id",
			"name_localized",
			"nsfw",
			"version"
		]);
		const discordSubcommandOnlyFields = new Set([
			"description_localizations",
			"integration_types",
			"contexts",
			"default_member_permissions",
			"name_localizations"
		]);
		const discordUnorderedArrayFields = new Set([
			"channel_types",
			"contexts",
			"integration_types"
		]);
		const normalizeCommandDefinitionValue = (value, path = []) => {
			if (Array.isArray(value)) {
				const normalized = value.map((entry) => normalizeCommandDefinitionValue(entry, path));
				const key = path.at(-1);
				if (key && discordUnorderedArrayFields.has(key) && normalized.every((entry) => typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean")) return [...normalized].sort();
				return normalized;
			}
			if (value && typeof value === "object") {
				const normalizedEntries = Object.entries(value).flatMap(([key, entry]) => {
					if (path.includes("options") && discordSubcommandOnlyFields.has(key)) return [];
					if ((key === "required" || key === "autocomplete") && entry === false) return [];
					const normalized = normalizeCommandDefinitionValue(entry, [...path, key]);
					if (normalized === void 0) return [];
					return [[key, normalized]];
				});
				return Object.fromEntries(normalizedEntries.sort(([left], [right]) => left.localeCompare(right)));
			}
			return value;
		};
		const normalizeLiveCommandDefinition = (command) => {
			return normalizeCommandDefinitionValue(Object.fromEntries(Object.entries(command).filter(([key]) => !discordCommandResponseOnlyFields.has(key))));
		};
		const liveCommands = await this.rest.get(Routes.applicationCommands(this.options.clientId));
		const liveByKey = new Map(liveCommands.map((command) => [`${command.type}:${command.name}`, command]));
		const desiredCommands = commands.map((command) => ({
			body: command.serialize(),
			key: `${command.type}:${command.name}`
		}));
		const desiredKeys = new Set(desiredCommands.map((command) => command.key));
		for (const live of liveCommands) {
			const key = `${live.type}:${live.name}`;
			if (desiredKeys.has(key)) continue;
			await this.rest.delete(Routes.applicationCommand(this.options.clientId, live.id));
			liveByKey.delete(key);
		}
		for (const desired of desiredCommands) {
			const existing = liveByKey.get(desired.key);
			if (!existing) continue;
			if (JSON.stringify(normalizeLiveCommandDefinition(existing)) === JSON.stringify(normalizeCommandDefinitionValue(desired.body))) continue;
			const updated = await this.rest.patch(Routes.applicationCommand(this.options.clientId, existing.id), { body: desired.body });
			liveByKey.set(desired.key, updated);
		}
		for (const desired of desiredCommands) {
			if (liveByKey.has(desired.key)) continue;
			const created = await this.rest.post(Routes.applicationCommands(this.options.clientId), { body: desired.body });
			liveByKey.set(desired.key, created);
		}
		const deployed = desiredCommands.map((desired) => liveByKey.get(desired.key)).filter((command) => Boolean(command));
		this.cachedGlobalCommands = deployed;
		this.updateCommandIdsFromDeployment(deployed);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/Modal.js
var Modal$1 = class {
	/**
	* The components of the modal
	*/
	components = [];
	/**
	* This function is called by the handler when a component is received, and is used to parse the custom ID into a key and data object.
	* By default, the ID is parsed in this format: `key:arg1=true;arg2=2;arg3=cheese`, where `arg1`, `arg2`, and `arg3` are the data arguments.
	* It will also automatically parse `true` and `false` as booleans, and will parse numbers as numbers.
	*
	* You can override this to parse the ID in a different format as you see fit, but it must follow these rules:
	* - The ID must have a `key` somewhere in the ID that can be returned by the parser. This key is what Carbon's component handler will use to identify the component and pass an interaction to the correct component.
	* - The data must be able to be arbitrary as far as Carbon's handler is concerned, meaning that any component with the same base key can be treated as the same component with logic within the component's logic methods to handle the data.
	*
	* @param id - The custom ID of the component as received from an interaction event
	* @returns The base key and the data object
	*/
	customIdParser = parseCustomId$1;
	serialize = () => {
		return {
			title: this.title,
			custom_id: this.customId,
			components: this.components.map((label) => label.serialize())
		};
	};
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/Row.js
var Row$1 = class extends BaseComponent {
	type = ComponentType.ActionRow;
	isV2 = false;
	/**
	* The components in the action row
	*/
	components = [];
	constructor(components = []) {
		super();
		this.components = components;
	}
	/**
	* Add a component to the action row
	* @param component The component to add
	*/
	addComponent(component) {
		this.components.push(component);
	}
	/**
	* Remove a component from the action row
	* @param component The component to remove
	*/
	removeComponent(component) {
		const index = this.components.indexOf(component);
		if (index === -1) return;
		this.components.splice(index, 1);
	}
	/**
	* Remove all components from the action row
	*/
	removeAllComponents() {
		this.components = [];
	}
	serialize = () => {
		return {
			type: ComponentType.ActionRow,
			components: this.components.map((component) => component.serialize())
		};
	};
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/TextInput.js
var TextInput$1 = class extends BaseModalComponent {
	type = ComponentType.TextInput;
	/**
	* This function is called by the handler when a component is received, and is used to parse the custom ID into a key and data object.
	* By default, the ID is parsed in this format: `key:arg1=true;arg2=2;arg3=cheese`, where `arg1`, `arg2`, and `arg3` are the data arguments.
	* It will also automatically parse `true` and `false` as booleans, and will parse numbers as numbers.
	*
	* You can override this to parse the ID in a different format as you see fit, but it must follow these rules:
	* - The ID must have a `key` somewhere in the ID that can be returned by the parser. This key is what Carbon's component handler will use to identify the component and pass an interaction to the correct component.
	* - The data must be able to be arbitrary as far as Carbon's handler is concerned, meaning that any component with the same base key can be treated as the same component with logic within the component's logic methods to handle the data.
	*
	* @param id - The custom ID of the component as received from an interaction event
	* @returns The base key and the data object
	*/
	customIdParser = parseCustomId$1;
	/**
	* The style of the text input
	* @default TextInputStyle.Short
	*/
	style = TextInputStyle.Short;
	/**
	* The minimum length of the text input
	*/
	minLength;
	/**
	* The maximum length of the text input
	*/
	maxLength;
	/**
	* Whether the text input is required
	*/
	required;
	/**
	* The value of the text input
	*/
	value;
	/**
	* The placeholder of the text input
	*/
	placeholder;
	serialize = () => {
		return {
			type: ComponentType.TextInput,
			custom_id: this.customId,
			style: this.style,
			min_length: this.minLength,
			max_length: this.maxLength,
			required: this.required,
			value: this.value,
			placeholder: this.placeholder
		};
	};
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/Label.js
var Label$1 = class extends BaseModalComponent {
	type = ComponentType.Label;
	/**
	* The description of the label (optional)
	*/
	description;
	/**
	* The component within this label
	*/
	component;
	/**
	* The custom ID of the label - required by BaseModalComponent
	*/
	customId = "label";
	constructor(component) {
		super();
		if (component) this.component = component;
	}
	serialize = () => {
		if (!this.component) throw new Error("Label must have a component, either assign it ahead of time or pass it to the constructor");
		return {
			type: this.type,
			label: this.label,
			description: this.description,
			component: this.component.serialize()
		};
	};
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/Container.js
var Container$1 = class extends BaseComponent {
	type = ComponentType.Container;
	isV2 = true;
	components = [];
	/**
	* The accent color of the container
	*/
	accentColor;
	/**
	* Whether the container should be marked a spoiler
	*/
	spoiler = false;
	constructor(components = [], options = {}) {
		super();
		this.components = components;
		if (options.accentColor) this.accentColor = options.accentColor;
		if (options.spoiler) this.spoiler = options.spoiler;
	}
	serialize = () => {
		return {
			type: this.type,
			components: this.components.map((component) => component.serialize()),
			accent_color: this.accentColor ? typeof this.accentColor === "string" ? Number.parseInt(this.accentColor.slice(1), 16) : this.accentColor : void 0,
			spoiler: this.spoiler
		};
	};
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/components/Section.js
var Section$1 = class extends BaseComponent {
	type = ComponentType.Section;
	isV2 = true;
	/**
	* This is the main text that will be displayed in the section.
	* You can have 1-3 TextDisplays in a Section
	*/
	components = [];
	/**
	* The Thumbnail or Button that will be displayed to the right of the main text.
	* You can only have 1 Thumbnail or Button in a Section.
	* If you don't want an accessory, you should be just using the TextDisplay directly.
	*/
	accessory;
	constructor(components = [], accessory) {
		super();
		this.components = components;
		this.accessory = accessory;
	}
	serialize = () => {
		if (!this.components || this.components.length === 0) throw new Error("Sections must contain at least one TextDisplay component");
		if (!this.accessory) throw new Error("Sections must have an accessory component");
		return {
			type: this.type,
			id: this.id,
			components: this.components.map((component) => component.serialize()),
			accessory: this.accessory.serialize()
		};
	};
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GroupDmChannel.js
/**
* Represents a group DM channel.
*/
var GroupDmChannel = class extends BaseChannel {
	/**
	* The name of the channel.
	*/
	get name() {
		if (!this.rawData) return void 0;
		return this.rawData.name;
	}
	/**
	* The recipients of the channel.
	*/
	get recipients() {
		if (!this.rawData) return void 0;
		return (this.rawData.recipients ?? []).map((u) => new User(this.client, u));
	}
	/**
	* The ID of the application that created the channel, if it was created by a bot.
	*/
	get applicationId() {
		if (!this.rawData) return void 0;
		return this.rawData.application_id ?? null;
	}
	/**
	* The icon hash of the channel.
	*/
	get icon() {
		if (!this.rawData) return void 0;
		return this.rawData.icon ?? null;
	}
	/**
	* Get the URL of the channel's icon with default settings (png format)
	*/
	get iconUrl() {
		if (!this.rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/channel-icons/${this.id}`, this.icon);
	}
	/**
	* Get the URL of the channel's icon with custom format and size options
	* @param options Optional format and size parameters
	* @returns The icon URL or null if no icon is set
	*/
	getIconUrl(options) {
		if (!this.rawData) return void 0;
		return buildCDNUrl(`https://cdn.discordapp.com/channel-icons/${this.id}`, this.icon, options);
	}
	/**
	* The ID of the user who created the channel.
	*/
	get ownerId() {
		if (!this.rawData) return void 0;
		return this.rawData.owner_id ?? null;
	}
	/**
	* The ID of the last message sent in the channel.
	*
	* @remarks
	* This might not always resolve to a message. The ID still stays a part of the channel's data, even if the message is deleted.
	*/
	get lastMessageId() {
		if (!this.rawData) return void 0;
		return this.rawData.last_message_id ?? null;
	}
	/**
	* Whether the channel is managed by an Oauth2 application.
	*/
	get managed() {
		if (!this.rawData) return void 0;
		return this.rawData.managed ?? false;
	}
	/**
	* Get the owner of the channel.
	*/
	get owner() {
		if (!this.ownerId) throw new Error("Cannot get owner without owner ID");
		return new User(this.client, this.ownerId);
	}
	/**
	* The last message sent in the channel.
	*
	* @remarks
	* This might not always resolve to a message. The ID still stays a part of the channel's data, even if the message is deleted.
	* This will always return a partial message, so you can use {@link Message.fetch} to get the full message data.
	*
	*/
	get lastMessage() {
		if (!this.lastMessageId) return null;
		return new Message(this.client, {
			id: this.lastMessageId,
			channelId: this.id
		});
	}
	/**
	* Set the name of the channel
	* @param name The new name of the channel
	*/
	async setName(name) {
		await this.client.rest.patch(Routes.channel(this.id), { body: { name } });
		this.setField("name", name);
	}
	/**
	* Trigger a typing indicator in the channel (this will expire after 10 seconds)
	*/
	async triggerTyping() {
		await this.client.rest.post(Routes.channelTyping(this.id), {});
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GuildAnnouncementChannel.js
/**
* Represents a guild announcement channel.
*/
var GuildAnnouncementChannel = class extends BaseGuildTextChannel {
	/**
	* The position of the channel in the channel list.
	*/
	get position() {
		if (!this.rawData) return void 0;
		return this.rawData.position;
	}
	/**
	* Set the position of the channel
	* @param position The new position of the channel
	*/
	async setPosition(position) {
		await this.client.rest.patch(Routes.channel(this.id), { body: { position } });
		this.setField("position", position);
	}
	async follow(targetChannel) {
		await this.client.rest.put(Routes.channelFollowers(this.id), { body: { webhook_channel_id: typeof targetChannel === "string" ? targetChannel : targetChannel.id } });
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GuildCategoryChannel.js
/**
* Represents a guild category channel.
*/
var GuildCategoryChannel = class extends BaseGuildChannel {
	/**
	* The position of the channel in the channel list.
	*/
	get position() {
		if (!this.rawData) return void 0;
		return this.rawData.position;
	}
	/**
	* Set the position of the channel
	* @param position The new position of the channel
	*/
	async setPosition(position) {
		await this.client.rest.patch(Routes.channel(this.id), { body: { position } });
		this.setField("position", position);
	}
	/**
	* You cannot send a message to a category channel, so this method throws an error
	*/
	async send() {
		throw new Error("Category channels cannot be sent to");
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GuildForumChannel.js
/**
* Represents a guild forum channel.
*/
var GuildForumChannel = class extends GuildThreadOnlyChannel {
	/**
	* The default forum layout of the channel.
	*/
	get defaultForumLayout() {
		if (!this.rawData) return void 0;
		return this.rawData.default_forum_layout;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GuildMediaChannel.js
/**
* Represents a guild media channel (a forum channel)
*/
var GuildMediaChannel = class extends GuildThreadOnlyChannel {};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GuildStageOrVoiceChannel.js
var GuildStageOrVoiceChannel = class extends BaseGuildChannel {
	/**
	* The position of the channel in the channel list.
	*/
	get position() {
		if (!this.rawData) return void 0;
		return this.rawData.position;
	}
	/**
	* Set the position of the channel
	* @param position The new position of the channel
	*/
	async setPosition(position) {
		await this.client.rest.patch(Routes.channel(this.id), { body: { position } });
		this.setField("position", position);
	}
	/**
	* The bitrate of the channel.
	*/
	get bitrate() {
		if (!this.rawData) return void 0;
		return this.rawData.bitrate;
	}
	/**
	* The user limit of the channel.
	*/
	get userLimit() {
		if (!this.rawData) return void 0;
		return this.rawData.user_limit;
	}
	/**
	* The RTC region of the channel.
	* This is automatic when set to `null`.
	*/
	get rtcRegion() {
		if (!this.rawData) return void 0;
		return this.rawData.rtc_region ?? null;
	}
	/**
	* The video quality mode of the channel.
	* 1 when not present.
	*/
	get videoQualityMode() {
		if (!this.rawData) return void 0;
		return this.rawData.video_quality_mode ?? VideoQualityMode.Auto;
	}
};
var GuildStageChannel = class extends GuildStageOrVoiceChannel {};
var GuildVoiceChannel = class extends GuildStageOrVoiceChannel {};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/GuildTextChannel.js
var GuildTextChannel = class extends BaseGuildTextChannel {
	/**
	* The position of the channel in the channel list.
	*/
	get position() {
		if (!this.rawData) return void 0;
		return this.rawData.position;
	}
	/**
	* Set the position of the channel
	* @param position The new position of the channel
	*/
	async setPosition(position) {
		await this.client.rest.patch(Routes.channel(this.id), { body: { position } });
		this.setField("position", position);
	}
	/**
	* The default auto archive duration of threads in the channel.
	*/
	get defaultAutoArchiveDuration() {
		if (!this.rawData) return void 0;
		return this.rawData.default_auto_archive_duration ?? null;
	}
	/**
	* The default thread rate limit per user of the channel.
	*/
	get defaultThreadRateLimitPerUser() {
		if (!this.rawData) return void 0;
		return this.rawData.default_thread_rate_limit_per_user ?? null;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/paginator/GoToPageModal.js
var GoToPageModal = class extends Modal$1 {
	title = "Go to Page";
	customId;
	components = [new PageNumberLabel()];
	constructor(paginatorId, maxPages) {
		super();
		this.customId = `paginator-goto:id=${paginatorId};max=${maxPages}`;
	}
	async run(interaction, data) {
		const pageInput = interaction.fields.getText("page", true);
		const pageNumber = Number.parseInt(pageInput, 10);
		const paginatorId = data.id;
		const maxPages = data.max;
		if (Number.isNaN(pageNumber) || pageNumber < 1 || pageNumber > maxPages) return interaction.reply({
			content: `Please enter a valid page number between 1 and ${maxPages}.`,
			flags: MessageFlags.Ephemeral
		});
		const paginator = interaction.client.paginators.find((p) => p.id === paginatorId);
		if (!paginator) return interaction.reply({
			content: "Paginator not found in memory.",
			flags: MessageFlags.Ephemeral
		});
		if (paginator.userId && paginator.userId !== interaction.user?.id) return interaction.acknowledge();
		await paginator.goToPageFromModal(pageNumber - 1, interaction);
	}
};
var PageNumberLabel = class extends Label$1 {
	label = "Page Number";
	description = "Enter the page number you want to go to";
	constructor() {
		super(new PageNumberInput());
	}
};
var PageNumberInput = class extends TextInput$1 {
	customId = "page";
	style = TextInputStyle.Short;
	placeholder = "Enter page number...";
	minLength = 1;
	maxLength = 10;
	required = true;
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/paginator/Paginator.js
var Paginator = class {
	pages;
	id;
	currentPage = 0;
	timeout = null;
	timeoutDuration;
	/**
	* The user ID who is allowed to interact with the paginator
	*/
	userId;
	constructor(pages, { client, timeoutDuration = 3e5, userId }) {
		if (pages.length === 0) throw new Error("Paginator must have at least one page");
		this.pages = pages;
		this.timeoutDuration = timeoutDuration;
		this.userId = userId;
		this.id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
		client.paginators.push(this);
		this.startTimeout();
	}
	startTimeout() {
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.disableButtons();
		}, this.timeoutDuration);
	}
	disableButtons() {
		const page = this.getCurrentPage();
		if (!page.components) return;
		const row = this.createNavigationButtons();
		for (const component of row.components) if ("disabled" in component) component.disabled = true;
		page.components = [...page.components.slice(0, -1), row];
	}
	destroy() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	}
	getCurrentPage() {
		const page = this.pages[this.currentPage];
		if (!page) throw new Error("Invalid page index");
		return page;
	}
	async goToPage(pageIndex, interaction) {
		if (pageIndex < 0 || pageIndex >= this.pages.length) return interaction.reply({ content: "Invalid page number" });
		this.currentPage = pageIndex;
		this.startTimeout();
		await interaction.update(this.getCurrentPageWithButtons());
	}
	async goToPageFromModal(pageIndex, interaction) {
		if (pageIndex < 0 || pageIndex >= this.pages.length) return interaction.reply({
			content: "Invalid page number",
			flags: MessageFlags.Ephemeral
		});
		this.currentPage = pageIndex;
		this.startTimeout();
		await interaction.update(this.getCurrentPageWithButtons());
	}
	createNavigationButtons(disabled = false) {
		return new Row$1([
			new DirectionButton({
				paginatorId: this.id,
				goToPage: this.currentPage - 1,
				disabled: disabled || this.currentPage === 0,
				label: "Back"
			}),
			new PageNumberButton(this.id, this.currentPage, this.pages.length, disabled),
			new DirectionButton({
				paginatorId: this.id,
				goToPage: this.currentPage + 1,
				disabled: disabled || this.currentPage === this.pages.length - 1,
				label: "Next"
			})
		]);
	}
	getCurrentPageWithButtons() {
		const page = this.getCurrentPage();
		return {
			...page,
			components: [...page.components || [], this.createNavigationButtons()]
		};
	}
	getInitialPage() {
		return this.getCurrentPageWithButtons();
	}
	/**
	* Sends the paginator message using the provided interaction
	* @param interaction The interaction to use for sending the message
	*/
	async send(interaction) {
		await interaction.reply(this.getInitialPage());
	}
};
var DirectionButton = class extends Button$1 {
	label;
	customId;
	style = ButtonStyle.Secondary;
	disabled = false;
	constructor({ paginatorId, goToPage, disabled, label }) {
		super();
		this.customId = `paginator:paginatorId=${paginatorId};goToPage=${goToPage}`;
		this.label = label;
		this.disabled = disabled;
	}
	async run(interaction, data) {
		const paginatorId = data.paginatorId;
		const goToPage = Number.parseInt(`${data.goToPage}`, 10);
		const paginator = interaction.client.paginators.find((p) => p.id === paginatorId);
		if (!paginator) return interaction.reply({ content: `Paginator ${paginatorId} not found in memory` });
		if (paginator.userId && paginator.userId !== interaction.user?.id) return interaction.acknowledge();
		await paginator.goToPage(goToPage, interaction);
	}
};
var PageNumberButton = class extends Button$1 {
	label;
	customId;
	style = ButtonStyle.Secondary;
	disabled;
	constructor(paginatorId, currentPage, totalPages, disabled) {
		super();
		this.label = `${currentPage + 1} / ${totalPages}`;
		this.customId = `paginator-page:id=${paginatorId};max=${totalPages}`;
		this.disabled = disabled || totalPages <= 1;
	}
	async run(interaction, data) {
		const paginatorId = data.id;
		const maxPages = data.max;
		const paginator = interaction.client.paginators.find((p) => p.id === paginatorId);
		if (!paginator) return interaction.reply({
			content: "Paginator not found in memory",
			flags: MessageFlags.Ephemeral
		});
		if (paginator.userId && paginator.userId !== interaction.user?.id) return interaction.acknowledge();
		const modal = new GoToPageModal(paginatorId, maxPages);
		await interaction.showModal(modal);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/paginator/index.js
Object.assign(Client$1.prototype, {
	Paginator,
	paginators: []
});
//#endregion
//#region node_modules/@buape/carbon/dist/src/types/listeners.js
const WebhookEvent = { ...ApplicationWebhookEventType };
const ListenerEvent = {
	...GatewayDispatchEvents,
	...WebhookEvent,
	GuildAvailable: "GUILD_AVAILABLE",
	GuildUnavailable: "GUILD_UNAVAILABLE"
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/Poll.js
var Poll = class extends Base {
	channelId;
	messageId;
	_rawData;
	constructor(client, { channelId, messageId, data }) {
		super(client);
		this.channelId = channelId;
		this.messageId = messageId;
		this._rawData = data;
	}
	/**
	* The raw Discord API data for this poll
	*/
	get rawData() {
		return this._rawData;
	}
	get question() {
		return this._rawData.question;
	}
	get answers() {
		return this._rawData.answers;
	}
	get allowMultiselect() {
		return this._rawData.allow_multiselect;
	}
	get layoutType() {
		return this._rawData.layout_type;
	}
	get results() {
		return this._rawData.results;
	}
	get expiry() {
		return this._rawData.expiry;
	}
	get isFinalized() {
		return this._rawData.results !== void 0;
	}
	async getAnswerVoters(answerId) {
		return (await this.client.rest.get(Routes.pollAnswerVoters(this.channelId, this.messageId, answerId))).users.map((userData) => new User(this.client, userData));
	}
	async end() {
		const updatedMessage = await this.client.rest.post(Routes.expirePoll(this.channelId, this.messageId), {});
		return new Message(this.client, updatedMessage);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/Message.js
var Message = class Message extends Base {
	constructor(client, rawDataOrIds) {
		super(client);
		if (Object.keys(rawDataOrIds).length === 2 && "id" in rawDataOrIds && "channelId" in rawDataOrIds) {
			this.id = rawDataOrIds.id;
			this.channelId = rawDataOrIds.channelId || "";
		} else {
			const data = rawDataOrIds;
			this.id = data.id;
			this.channelId = data.channel_id;
			this.setData(data);
		}
	}
	_rawData = null;
	setData(data) {
		this._rawData = data;
		if (!data) throw new Error("Cannot set data without having data... smh");
	}
	/**
	* The raw Discord API data for this message
	*/
	get rawData() {
		if (!this._rawData) throw new Error("Cannot access rawData on partial Message. Use fetch() to populate data.");
		return this._rawData;
	}
	/**
	* The ID of the message
	*/
	id;
	/**
	* The ID of the channel the message is in
	*/
	channelId;
	/**
	* Whether the message is a partial message (meaning it does not have all the data).
	* If this is true, you should use {@link Message.fetch} to get the full data of the message.
	*/
	get partial() {
		return this._rawData === null;
	}
	/**
	* If this message is a response to an interaction, this is the ID of the interaction's application
	*/
	get applicationId() {
		if (!this._rawData) return void 0;
		return this._rawData.application_id;
	}
	/**
	* The attachments of the message
	*/
	get attachments() {
		if (!this._rawData) return void 0;
		return this._rawData.attachments ?? [];
	}
	/**
	* The components of the message
	*/
	get components() {
		if (!this._rawData) return void 0;
		return this._rawData.components ?? [];
	}
	/**
	* The content of the message
	*/
	get content() {
		if (!this._rawData) return void 0;
		return this._rawData.content ?? "";
	}
	get embeds() {
		if (!this._rawData) return void 0;
		if (!this._rawData?.embeds) return [];
		return this._rawData.embeds.map((embed) => new Embed$1(embed));
	}
	/**
	* If this message was edited, this is the timestamp of the edit
	*/
	get editedTimestamp() {
		if (!this._rawData) return void 0;
		return this._rawData.edited_timestamp;
	}
	/**
	* The flags of the message
	*/
	get flags() {
		if (!this._rawData) return void 0;
		return this._rawData.flags;
	}
	/**
	* The interaction metadata of the message
	*/
	get interactionMetadata() {
		if (!this._rawData) return void 0;
		return this._rawData.interaction_metadata;
	}
	/**
	* Whether the message mentions everyone
	*/
	get mentionedEveryone() {
		if (!this._rawData) return void 0;
		return this._rawData.mention_everyone;
	}
	/**
	* The users mentioned in the message
	*/
	get mentionedUsers() {
		if (!this._rawData) return void 0;
		if (!this._rawData?.mentions) return [];
		return this._rawData.mentions.map((mention) => new User(this.client, mention));
	}
	/**
	* The roles mentioned in the message
	*/
	get mentionedRoles() {
		if (!this._rawData) return void 0;
		if (!this._rawData?.mention_roles) return [];
		return this._rawData.mention_roles.map((mention) => new Role(this.client, mention));
	}
	/**
	* The data about the referenced message. You can use {@link Message.referencedMessage} to get the referenced message itself.
	*/
	get messageReference() {
		if (!this._rawData) return void 0;
		return this._rawData.message_reference;
	}
	/**
	* The referenced message itself
	*/
	get referencedMessage() {
		if (!this._rawData?.referenced_message) return null;
		return new Message(this.client, this._rawData?.referenced_message);
	}
	/**
	* Whether the message is pinned
	*/
	get pinned() {
		if (!this._rawData) return void 0;
		return this._rawData.pinned;
	}
	/**
	* The poll contained in the message
	*/
	get poll() {
		if (!this._rawData?.poll) return void 0;
		return new Poll(this.client, {
			channelId: this.channelId,
			messageId: this.id,
			data: this._rawData.poll
		});
	}
	/**
	* The approximate position of the message in the channel
	*/
	get position() {
		if (!this._rawData) return void 0;
		return this._rawData.position;
	}
	/**
	* The reactions on the message
	*/
	get reactions() {
		if (!this._rawData) return void 0;
		return this._rawData.reactions ?? [];
	}
	/**
	* The stickers in the message
	*/
	get stickers() {
		if (!this._rawData) return void 0;
		return this._rawData.sticker_items ?? [];
	}
	/**
	* The timestamp of the original message
	*/
	get timestamp() {
		if (!this._rawData) return void 0;
		return this._rawData.timestamp;
	}
	/**
	* Whether the message is a TTS message
	*/
	get tts() {
		if (!this._rawData) return void 0;
		return this._rawData.tts;
	}
	/**
	* The type of the message
	*/
	get type() {
		if (!this._rawData) return void 0;
		return this._rawData.type;
	}
	/**
	* Get the author of the message
	*/
	get author() {
		if (!this._rawData) return null;
		if (this._rawData?.webhook_id) return null;
		return new User(this.client, this._rawData.author);
	}
	/**
	* Get the thread associated with this message, if there is one
	*/
	get thread() {
		if (!this.rawData) return null;
		if (!this._rawData?.thread) return null;
		return channelFactory(this.client, this._rawData?.thread);
	}
	/**
	* Fetch updated data for this message.
	* If the message is partial, this will fetch all the data for the message and populate the fields.
	* If the message is not partial, all fields will be updated with new values from Discord.
	* @returns A Promise that resolves to a non-partial Message
	*/
	async fetch() {
		if (!this.channelId) throw new Error("Cannot fetch message without channel ID");
		const newData = await this.client.rest.get(Routes.channelMessage(this.channelId, this.id));
		if (!newData) throw new Error(`Message ${this.id} not found`);
		this.setData(newData);
		return this;
	}
	/**
	* Delete this message from Discord
	*/
	async delete() {
		if (!this.channelId) throw new Error("Cannot delete message without channel ID");
		await this.client.rest.delete(Routes.channelMessage(this.channelId, this.id));
	}
	/**
	* Get the channel the message was sent in
	*/
	async fetchChannel() {
		if (!this.channelId) throw new Error("Cannot fetch channel without channel ID");
		const data = await this.client.rest.get(Routes.channel(this.channelId));
		return channelFactory(this.client, data);
	}
	/**
	* Pin this message
	*/
	async pin() {
		if (!this.channelId) throw new Error("Cannot pin message without channel ID");
		await this.client.rest.put(Routes.channelMessagesPin(this.channelId, this.id));
	}
	/**
	* Unpin this message
	*/
	async unpin() {
		if (!this.channelId) throw new Error("Cannot unpin message without channel ID");
		await this.client.rest.delete(Routes.channelMessagesPin(this.channelId, this.id));
	}
	/**
	* Start a thread with this message as the associated start message.
	* If you want to start a thread without a start message, use {@link BaseGuildTextChannel.startThread}
	*/
	async startThread(data) {
		if (!this.channelId) throw new Error("Cannot start thread without channel ID");
		const thread = await this.client.rest.post(Routes.threads(this.channelId, this.id), { body: { ...data } });
		return new GuildThreadChannel(this.client, thread);
	}
	/**
	* Edit this message
	* @param data - The data to edit the message with
	* @returns A Promise that resolves to the edited message
	*/
	async edit(data) {
		if (!this.channelId) throw new Error("Cannot edit message without channel ID");
		const serialized = serializePayload$1(data);
		const newMessage = await this.client.rest.patch(Routes.channelMessage(this.channelId, this.id), { body: { ...serialized } });
		this.setData(newMessage);
		return this;
	}
	/**
	* Forward this message to a different channel
	* @param channelId - The ID of the channel to forward the message to
	* @returns A Promise that resolves to the forwarded message
	*/
	async forward(channelId) {
		if (!this.channelId) throw new Error("Cannot forward message without channel ID");
		const channel = await this.client.fetchChannel(channelId);
		if (!channel) throw new Error(`Channel ${channelId} not found`);
		if (!("send" in channel)) throw new Error(`Cannot forward message to channel ${channelId}`);
		const message = await this.client.rest.post(Routes.channelMessages(channelId), { body: { message_reference: {
			type: MessageReferenceType.Forward,
			message_id: this.id,
			channel_id: this.channelId
		} } });
		return new Message(this.client, message);
	}
	/**
	* Reply to this message
	* @param data - The data to reply with
	* @returns A Promise that resolves to the replied message
	*/
	async reply(data) {
		if (!this.channelId) throw new Error("Cannot reply to message without channel ID");
		const serialized = serializePayload$1(data);
		const message = await this.client.rest.post(Routes.channelMessages(this.channelId), { body: {
			...serialized,
			message_reference: {
				type: MessageReferenceType.Default,
				message_id: this.id
			}
		} });
		return new Message(this.client, message);
	}
	/**
	* Disable all buttons on the message except for link buttons
	*/
	async disableAllButtons() {
		if (!this._rawData) return;
		if (!this._rawData.components) return;
		const patched = await this.client.rest.patch(Routes.channelMessage(this.channelId, this.id), { body: {
			...this._rawData,
			components: this._rawData.components?.map((component) => {
				const disable = (component) => {
					if (component.type === ComponentType.ActionRow) return {
						...component,
						components: component.components.map((c) => ({
							...c,
							..."disabled" in c ? { disabled: true } : {}
						}))
					};
					if (component.type === ComponentType.Section) return {
						...component,
						accessory: "disabled" in component.accessory ? {
							...component.accessory,
							disabled: true
						} : component.accessory
					};
					return component;
				};
				if (component.type === ComponentType.Container) return {
					...component,
					components: component.components.map((c) => disable(c))
				};
				return disable(component);
			}) ?? []
		} });
		this.setData(patched);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/structures/DmChannel.js
/**
* Represents a DM between two users.
*/
var DmChannel = class extends BaseChannel {
	/**
	* The name of the channel. This is always null for DM channels.
	*/
	get name() {
		if (!this.rawData) return void 0;
		return null;
	}
	/**
	* Send a message to the channel
	*/
	async send(message) {
		const data = await this.client.rest.post(Routes.channelMessages(this.id), { body: serializePayload$1(message) });
		return new Message(this.client, data);
	}
	/**
	* Trigger a typing indicator in the channel (this will expire after 10 seconds)
	*/
	async triggerTyping() {
		await this.client.rest.post(Routes.channelTyping(this.id), {});
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/functions/channelFactory.js
const channelFactory = (client, channelData) => {
	switch (channelData.type) {
		case ChannelType$1.DM: return new DmChannel(client, channelData);
		case ChannelType$1.GroupDM: return new GroupDmChannel(client, channelData);
		case ChannelType$1.GuildText: return new GuildTextChannel(client, channelData);
		case ChannelType$1.GuildVoice: return new GuildVoiceChannel(client, channelData);
		case ChannelType$1.GuildCategory: return new GuildCategoryChannel(client, channelData);
		case ChannelType$1.GuildAnnouncement: return new GuildAnnouncementChannel(client, channelData);
		case ChannelType$1.AnnouncementThread:
		case ChannelType$1.PublicThread:
		case ChannelType$1.PrivateThread: return new GuildThreadChannel(client, channelData);
		case ChannelType$1.GuildStageVoice: return new GuildStageChannel(client, channelData);
		case ChannelType$1.GuildForum: return new GuildForumChannel(client, channelData);
		case ChannelType$1.GuildMedia: return new GuildMediaChannel(client, channelData);
		default: return null;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/classes/Listener.js
var GuildDeleteListener = class extends BaseListener {
	type = ListenerEvent.GuildDelete;
	parseRawData(data, client) {
		return {
			guild: new Guild(client, data.id),
			...data
		};
	}
};
var InteractionCreateListener = class extends BaseListener {
	type = ListenerEvent.InteractionCreate;
	parseRawData(data, client) {
		return {
			guild: data.guild_id ? new Guild(client, data.guild_id) : void 0,
			user: data.user ? new User(client, data.user) : void 0,
			rawUser: data.user,
			...data
		};
	}
};
var VoiceServerUpdateListener = class extends BaseListener {
	type = ListenerEvent.VoiceServerUpdate;
	parseRawData(data, client) {
		return {
			guild: new Guild(client, data.guild_id),
			...data
		};
	}
};
var VoiceStateUpdateListener = class extends BaseListener {
	type = ListenerEvent.VoiceStateUpdate;
	parseRawData(data, client) {
		const guild = "guild_id" in data && typeof data.guild_id === "string" ? new Guild(client, data.guild_id) : void 0;
		const member = guild && data.member ? new GuildMember(client, data.member, guild) : void 0;
		return {
			...data,
			rawMember: data.member,
			guild,
			member
		};
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/InteractionEventListener.js
var InteractionEventListener = class extends InteractionCreateListener {
	type = ListenerEvent.InteractionCreate;
	async handle(data, client) {
		await client.handleInteraction(data, {});
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/types.js
const listenerEvents = new Set(Object.values(ListenerEvent));
const fatalGatewayCloseCodes = new Set([
	GatewayCloseCodes$1.AuthenticationFailed,
	GatewayCloseCodes$1.InvalidShard,
	GatewayCloseCodes$1.ShardingRequired,
	GatewayCloseCodes$1.InvalidAPIVersion,
	GatewayCloseCodes$1.InvalidIntents,
	GatewayCloseCodes$1.DisallowedIntents
]);
const nonResumableGatewayCloseCodes = new Set([
	GatewayCloseCodes$1.InvalidSeq,
	GatewayCloseCodes$1.SessionTimedOut,
	GatewayCloseCodes$1.NotAuthenticated,
	GatewayCloseCodes$1.AlreadyAuthenticated
]);
const reconnectDefaults = {
	baseDelay: 1e3,
	maxDelay: 3e4,
	maxAttempts: 5
};
const GatewayOpcodes = GatewayOpcodes$1;
const GatewayCloseCodes = GatewayCloseCodes$1;
const GatewayIntents = GatewayIntentBits;
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/utils/heartbeat.js
function startHeartbeat(manager, options) {
	stopHeartbeat(manager);
	manager.lastHeartbeatAck = true;
	const jitter = Math.random();
	const initialDelay = Math.floor(options.interval * jitter);
	const interval = options.interval;
	const sendHeartbeat = () => {
		if (!manager.lastHeartbeatAck) {
			options.reconnectCallback();
			return;
		}
		manager.lastHeartbeatAck = false;
		try {
			manager.send({
				op: GatewayOpcodes.Heartbeat,
				d: manager.sequence
			});
		} catch {
			options.reconnectCallback();
		}
	};
	manager.firstHeartbeatTimeout = setTimeout(() => {
		sendHeartbeat();
		manager.heartbeatInterval = setInterval(sendHeartbeat, interval);
	}, initialDelay);
}
function stopHeartbeat(manager) {
	if (manager.firstHeartbeatTimeout) {
		clearTimeout(manager.firstHeartbeatTimeout);
		manager.firstHeartbeatTimeout = void 0;
	}
	if (manager.heartbeatInterval) {
		clearInterval(manager.heartbeatInterval);
		manager.heartbeatInterval = void 0;
	}
}
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/utils/monitor.js
var ConnectionMonitor = class extends EventEmitter {
	metrics = {
		latency: 0,
		uptime: 0,
		reconnects: 0,
		zombieConnections: 0,
		messagesReceived: 0,
		messagesSent: 0,
		errors: 0
	};
	startTime = Date.now();
	lastHeartbeat = 0;
	metricsInterval;
	config;
	constructor(config = {}) {
		super();
		this.config = {
			interval: config.interval ?? 6e4,
			latencyThreshold: config.latencyThreshold ?? 1e3
		};
		this.metricsInterval = this.createMetricsInterval();
	}
	createMetricsInterval() {
		return setInterval(() => {
			this.metrics.uptime = Date.now() - this.startTime;
			this.emit("metrics", this.getMetrics());
			if (this.metrics.latency > this.config.latencyThreshold) this.emit("warning", `High latency detected: ${this.metrics.latency}ms`);
			const errorRate = (this.metrics.errors / (this.metrics.uptime / 6e4)).toFixed(1);
			if (Number(errorRate) > 5) this.emit("warning", `High error rate detected: ${errorRate} errors/minute`);
		}, this.config.interval);
	}
	recordError() {
		this.metrics.errors++;
	}
	recordZombieConnection() {
		this.metrics.zombieConnections++;
	}
	recordHeartbeat() {
		this.lastHeartbeat = Date.now();
	}
	recordHeartbeatAck() {
		if (this.lastHeartbeat > 0) this.metrics.latency = Date.now() - this.lastHeartbeat;
	}
	recordReconnect() {
		this.metrics.reconnects++;
	}
	recordMessageReceived() {
		this.metrics.messagesReceived++;
	}
	recordMessageSent() {
		this.metrics.messagesSent++;
	}
	resetUptime() {
		clearInterval(this.metricsInterval);
		this.metrics.uptime = 0;
		this.startTime = Date.now();
		this.metricsInterval = this.createMetricsInterval();
	}
	getMetrics() {
		return { ...this.metrics };
	}
	reset() {
		this.metrics = {
			latency: 0,
			uptime: 0,
			reconnects: 0,
			zombieConnections: 0,
			messagesReceived: 0,
			messagesSent: 0,
			errors: 0
		};
		this.startTime = Date.now();
		this.lastHeartbeat = 0;
	}
	destroy() {
		clearInterval(this.metricsInterval);
		this.removeAllListeners();
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/utils/payload.js
function validatePayload(data) {
	try {
		const payload = JSON.parse(data);
		if (!payload || typeof payload !== "object") {
			console.error("[Gateway] Invalid payload: Not an object", { data });
			return null;
		}
		if (!("op" in payload) || typeof payload.op !== "number") {
			console.error("[Gateway] Invalid payload: Missing or invalid op code", { data });
			return null;
		}
		return payload;
	} catch (error) {
		console.error("[Gateway] Failed to validate payload:", error, { data });
		return null;
	}
}
function createIdentifyPayload(data) {
	return {
		op: GatewayOpcodes.Identify,
		d: {
			token: data.token,
			properties: data.properties,
			intents: data.intents,
			...data.shard ? { shard: data.shard } : {}
		}
	};
}
function createResumePayload(data) {
	return {
		op: GatewayOpcodes.Resume,
		d: {
			token: data.token,
			session_id: data.sessionId,
			seq: data.sequence
		}
	};
}
function createUpdatePresencePayload(data) {
	return {
		op: GatewayOpcodes.PresenceUpdate,
		d: data
	};
}
function createUpdateVoiceStatePayload(data) {
	return {
		op: GatewayOpcodes.VoiceStateUpdate,
		d: data
	};
}
function createRequestGuildMembersPayload(data) {
	return {
		op: GatewayOpcodes.RequestGuildMembers,
		d: data
	};
}
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/utils/rateLimit.js
var GatewayRateLimit = class {
	events = [];
	config;
	constructor(config = {
		maxEvents: 120,
		windowMs: 6e4
	}) {
		this.config = config;
	}
	/**
	* Check if sending an event would exceed the rate limit
	* @returns true if the event can be sent, false if rate limited
	*/
	canSend() {
		this.cleanupOldEvents();
		return this.events.length < this.config.maxEvents;
	}
	/**
	* Record that an event was sent
	*/
	recordEvent() {
		this.events.push(Date.now());
	}
	/**
	* Get the current number of events in the time window
	*/
	getCurrentEventCount() {
		this.cleanupOldEvents();
		return this.events.length;
	}
	/**
	* Get remaining events before hitting rate limit
	*/
	getRemainingEvents() {
		return Math.max(0, this.config.maxEvents - this.getCurrentEventCount());
	}
	/**
	* Get time until rate limit resets (in milliseconds)
	*/
	getResetTime() {
		this.cleanupOldEvents();
		if (this.events.length === 0) return 0;
		const oldestEvent = this.events[0];
		if (!oldestEvent) return 0;
		return Math.max(0, this.config.windowMs - (Date.now() - oldestEvent));
	}
	/**
	* Remove events outside the current time window
	*/
	cleanupOldEvents() {
		const cutoff = Date.now() - this.config.windowMs;
		this.events = this.events.filter((timestamp) => timestamp > cutoff);
	}
	/**
	* Reset the rate limiter
	*/
	reset() {
		this.events = [];
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/GatewayPlugin.js
var GatewayPlugin = class extends Plugin {
	id = "gateway";
	client;
	options;
	state;
	ws = null;
	monitor;
	rateLimit;
	heartbeatInterval;
	firstHeartbeatTimeout;
	sequence = null;
	lastHeartbeatAck = true;
	emitter;
	reconnectAttempts = 0;
	shardId;
	totalShards;
	gatewayInfo;
	isConnected = false;
	pings = [];
	babyCache;
	reconnectTimeout;
	isConnecting = false;
	socketGeneration = 0;
	shouldReconnect = false;
	nextConnectionShouldResume = false;
	silentSocketClosures = /* @__PURE__ */ new WeakSet();
	consecutiveResumeFailures = 0;
	constructor(options, gatewayInfo) {
		super();
		this.options = {
			reconnect: {
				...reconnectDefaults,
				...options.reconnect
			},
			...options,
			intents: options.intents ?? 0
		};
		this.state = {
			sequence: null,
			sessionId: null,
			resumeGatewayUrl: null
		};
		this.monitor = new ConnectionMonitor();
		this.rateLimit = new GatewayRateLimit();
		this.emitter = new EventEmitter();
		this.gatewayInfo = gatewayInfo;
		this.babyCache = new BabyCache();
		this.monitor.on("metrics", (metrics) => this.emitter.emit("metrics", metrics));
		this.monitor.on("warning", (warning) => this.emitter.emit("warning", warning));
	}
	get ping() {
		return this.pings.length ? this.pings.reduce((a, b) => a + b, 0) / this.pings.length : null;
	}
	/**
	* Bootstraps gateway metadata and opens the initial websocket connection.
	*/
	async registerClient(client) {
		this.client = client;
		if (!this.gatewayInfo) {
			const response = await fetch("https://discord.com/api/v10/gateway/bot", { headers: { Authorization: `Bot ${client.options.token}` } });
			if (!response.ok) throw new Error(`Failed to get gateway information from Discord: ${response.status} ${response.statusText}`);
			this.gatewayInfo = await response.json();
		}
		if (this.options.shard) {
			client.shardId = this.options.shard[0];
			client.totalShards = this.options.shard[1];
		}
		if (this.options.autoInteractions) this.client.registerListener(new InteractionEventListener());
		this.shouldReconnect = true;
		this.connect(false);
	}
	/**
	* Opens a new websocket connection and prepares either IDENTIFY or RESUME on HELLO.
	*/
	connect(resume = false) {
		if (this.isConnecting) return;
		this.shouldReconnect = true;
		this.clearReconnectTimeout();
		stopHeartbeat(this);
		this.lastHeartbeatAck = true;
		const oldSocket = this.ws;
		if (oldSocket) {
			this.silentSocketClosures.add(oldSocket);
			oldSocket.terminate();
		}
		const baseUrl = resume && this.state.resumeGatewayUrl ? this.state.resumeGatewayUrl : this.gatewayInfo?.url ?? this.options.url ?? "wss://gateway.discord.gg/";
		const url = this.ensureGatewayParams(baseUrl);
		this.nextConnectionShouldResume = resume;
		this.socketGeneration++;
		this.ws = this.createWebSocket(url);
		this.isConnecting = true;
		this.isConnected = false;
		this.setupWebSocket();
	}
	/**
	* Stops heartbeats, clears reconnect state, and closes the active socket intentionally.
	*/
	disconnect() {
		this.shouldReconnect = false;
		this.clearReconnectTimeout();
		stopHeartbeat(this);
		this.lastHeartbeatAck = true;
		this.monitor.resetUptime();
		this.rateLimit.reset();
		if (this.ws) {
			this.silentSocketClosures.add(this.ws);
			this.ws.close(1e3, "Client disconnect");
		}
		this.ws = null;
		this.isConnecting = false;
		this.isConnected = false;
		this.reconnectAttempts = 0;
		this.consecutiveResumeFailures = 0;
		this.pings = [];
	}
	/**
	* Creates the websocket instance for a gateway URL. Override in tests if needed.
	*/
	createWebSocket(url) {
		if (!url) throw new Error("Gateway URL is required");
		return new WebSocket$1(url);
	}
	/**
	* Attaches websocket lifecycle handlers for open, message, close, and error.
	*/
	setupWebSocket() {
		if (!this.ws) return;
		const socket = this.ws;
		const generation = this.socketGeneration;
		socket.on("open", () => {
			if (!this.isCurrentSocket(socket, generation)) return;
			this.isConnecting = false;
			this.emitter.emit("debug", "Gateway websocket opened");
		});
		socket.on("message", (data) => {
			if (!this.isCurrentSocket(socket, generation)) return;
			this.monitor.recordMessageReceived();
			const payload = validatePayload(data.toString());
			if (!payload) {
				this.monitor.recordError();
				this.emitter.emit("error", /* @__PURE__ */ new Error("Invalid gateway payload"));
				return;
			}
			if (payload.s !== null && payload.s !== void 0) {
				this.sequence = payload.s;
				this.state.sequence = payload.s;
			}
			switch (payload.op) {
				case GatewayOpcodes.Hello:
					this.handleHello(payload.d, generation);
					break;
				case GatewayOpcodes.HeartbeatAck:
					this.handleHeartbeatAck();
					break;
				case GatewayOpcodes.Heartbeat:
					this.sendHeartbeatNow();
					break;
				case GatewayOpcodes.Dispatch:
					this.handleDispatch(payload);
					break;
				case GatewayOpcodes.InvalidSession:
					this.handleInvalidSession(payload.d);
					break;
				case GatewayOpcodes.Reconnect:
					this.handleReconnectOpcode();
					break;
			}
		});
		socket.on("close", (code) => {
			if (!this.isCurrentSocket(socket, generation)) return;
			this.isConnecting = false;
			this.isConnected = false;
			stopHeartbeat(this);
			this.lastHeartbeatAck = true;
			if (this.silentSocketClosures.has(socket)) {
				this.silentSocketClosures.delete(socket);
				return;
			}
			this.monitor.recordReconnect();
			this.emitter.emit("debug", `Gateway websocket closed: ${code}`);
			this.handleClose(code);
		});
		socket.on("error", (error) => {
			if (!this.isCurrentSocket(socket, generation)) return;
			this.isConnecting = false;
			this.monitor.recordError();
			this.emitter.emit("error", error);
		});
	}
	/**
	* Handles close codes and decides whether reconnection should resume or re-identify.
	*/
	handleClose(code) {
		if (!this.shouldReconnect) return;
		if (fatalGatewayCloseCodes.has(code)) {
			this.shouldReconnect = false;
			this.emitter.emit("error", /* @__PURE__ */ new Error(`Fatal gateway close code: ${code}`));
			this.disconnect();
			return;
		}
		if (nonResumableGatewayCloseCodes.has(code)) this.resetSessionState();
		this.scheduleReconnect({
			code,
			reason: "close",
			preferResume: !nonResumableGatewayCloseCodes.has(code)
		});
	}
	/**
	* Handles missing heartbeat acknowledgements by forcing a reconnect flow.
	*/
	handleZombieConnection() {
		this.monitor.recordZombieConnection();
		this.scheduleReconnect({
			reason: "zombie",
			preferResume: true
		});
		this.reconnectWithSocketRestart();
	}
	/**
	* Compatibility wrapper that maps to reconnect opcode handling.
	*/
	handleReconnect() {
		this.handleReconnectOpcode();
	}
	/**
	* Returns whether session_id and sequence are both available for RESUME.
	*/
	canResume() {
		return Boolean(this.state.sessionId && this.sequence !== null);
	}
	/**
	* Sends a RESUME payload using cached session_id and latest sequence.
	*/
	resume() {
		if (!this.client || !this.state.sessionId || this.sequence === null) return;
		const payload = createResumePayload({
			token: this.client.options.token,
			sessionId: this.state.sessionId,
			sequence: this.sequence
		});
		this.send(payload, true);
	}
	/**
	* Sends a gateway payload with size and rate-limit safeguards.
	*/
	send(payload, skipRateLimit = false) {
		if (!this.ws || this.ws.readyState !== WebSocket$1.OPEN) throw new Error("Gateway websocket is not open");
		const isEssentialEvent = payload.op === GatewayOpcodes.Heartbeat || payload.op === GatewayOpcodes.Identify || payload.op === GatewayOpcodes.Resume;
		if (!skipRateLimit && !isEssentialEvent && !this.rateLimit.canSend()) throw new Error(`Gateway rate limit exceeded. ${this.rateLimit.getRemainingEvents()} events remaining. Reset in ${this.rateLimit.getResetTime()}ms`);
		const encodedPayload = JSON.stringify(payload);
		if (Buffer.byteLength(encodedPayload, "utf8") > 4096) throw new Error("Gateway payload exceeds 4096-byte Discord limit");
		this.ws.send(encodedPayload);
		this.monitor.recordMessageSent();
		if (!isEssentialEvent) this.rateLimit.recordEvent();
		if (payload.op === GatewayOpcodes.Heartbeat) this.monitor.recordHeartbeat();
	}
	/**
	* Sends an IDENTIFY payload for a fresh gateway session.
	*/
	identify() {
		if (!this.client) return;
		const payload = createIdentifyPayload({
			token: this.client.options.token,
			intents: this.options.intents,
			properties: {
				os: process.platform,
				browser: "@buape/carbon - https://carbon.buape.com",
				device: "@buape/carbon - https://carbon.buape.com"
			},
			...this.options.shard ? { shard: this.options.shard } : {}
		});
		this.send(payload, true);
	}
	/**
	* Updates bot presence over the gateway connection.
	*/
	updatePresence(data) {
		if (!this.isConnected) throw new Error("Gateway is not connected");
		this.send(createUpdatePresencePayload(data));
	}
	/**
	* Updates bot voice state for a guild over the gateway connection.
	*/
	updateVoiceState(data) {
		if (!this.isConnected) throw new Error("Gateway is not connected");
		this.send(createUpdateVoiceStatePayload(data));
	}
	/**
	* Requests guild members and validates required intents/options.
	*/
	requestGuildMembers(data) {
		if (!this.isConnected) throw new Error("Gateway is not connected");
		if (!((this.options.intents & GatewayIntents.GuildMembers) !== 0)) throw new Error("GUILD_MEMBERS intent is required for requestGuildMembers operation");
		if (data.presences) {
			if (!((this.options.intents & GatewayIntents.GuildPresences) !== 0)) throw new Error("GUILD_PRESENCES intent is required when requesting presences");
		}
		if (!data.query && data.query !== "" && !data.user_ids) throw new Error("Either 'query' or 'user_ids' field is required for requestGuildMembers");
		this.send(createRequestGuildMembersPayload(data));
	}
	/**
	* Returns the current outbound gateway rate-limit snapshot.
	*/
	getRateLimitStatus() {
		return {
			remainingEvents: this.rateLimit.getRemainingEvents(),
			resetTime: this.rateLimit.getResetTime(),
			currentEventCount: this.rateLimit.getCurrentEventCount()
		};
	}
	/**
	* Returns helpers describing which intents are currently enabled.
	*/
	getIntentsInfo() {
		return {
			intents: this.options.intents,
			hasGuilds: (this.options.intents & GatewayIntents.Guilds) !== 0,
			hasGuildMembers: (this.options.intents & GatewayIntents.GuildMembers) !== 0,
			hasGuildPresences: (this.options.intents & GatewayIntents.GuildPresences) !== 0,
			hasGuildMessages: (this.options.intents & GatewayIntents.GuildMessages) !== 0,
			hasMessageContent: (this.options.intents & GatewayIntents.MessageContent) !== 0
		};
	}
	/**
	* Checks if a specific intent bit is enabled.
	*/
	hasIntent(intent) {
		return (this.options.intents & intent) !== 0;
	}
	/**
	* Guards handlers from acting on stale websocket instances.
	*/
	isCurrentSocket(socket, generation) {
		return this.ws === socket && this.socketGeneration === generation;
	}
	/**
	* Processes HELLO, starts heartbeat scheduling, then sends RESUME or IDENTIFY.
	*/
	handleHello(data, generation) {
		const heartbeatInterval = data?.heartbeat_interval;
		if (typeof heartbeatInterval !== "number" || heartbeatInterval <= 0) {
			this.monitor.recordError();
			this.emitter.emit("error", /* @__PURE__ */ new Error("Gateway HELLO missing heartbeat"));
			this.handleZombieConnection();
			return;
		}
		startHeartbeat(this, {
			interval: heartbeatInterval,
			reconnectCallback: () => {
				if (this.socketGeneration !== generation) return;
				this.handleZombieConnection();
			}
		});
		const shouldResume = this.nextConnectionShouldResume && this.canResume();
		this.nextConnectionShouldResume = false;
		try {
			if (shouldResume) {
				this.resume();
				return;
			}
			this.identify();
		} catch {
			this.handleZombieConnection();
		}
	}
	/**
	* Marks heartbeat acknowledged and updates rolling ping metrics.
	*/
	handleHeartbeatAck() {
		this.lastHeartbeatAck = true;
		this.monitor.recordHeartbeatAck();
		const latency = this.monitor.getMetrics().latency;
		if (latency > 0) {
			this.pings.push(latency);
			if (this.pings.length > 10) this.pings.shift();
		}
	}
	/**
	* Immediately sends a heartbeat in response to gateway heartbeat requests.
	*/
	sendHeartbeatNow() {
		this.lastHeartbeatAck = false;
		try {
			this.send({
				op: GatewayOpcodes.Heartbeat,
				d: this.sequence
			});
		} catch {
			this.handleZombieConnection();
		}
	}
	/**
	* Processes dispatch events, session caching, and Carbon event forwarding.
	*/
	handleDispatch(payload) {
		const type = payload.t;
		if (!listenerEvents.has(type)) return;
		if (type === "READY") {
			const readyData = payload.d;
			this.state.sessionId = readyData.session_id;
			this.state.resumeGatewayUrl = readyData.resume_gateway_url;
		}
		if (type === "READY" || type === "RESUMED") {
			this.isConnected = true;
			this.reconnectAttempts = 0;
			this.consecutiveResumeFailures = 0;
		}
		if (!this.client) return;
		if (this.options.eventFilter && !this.options.eventFilter(type)) return;
		if (type === "READY") payload.d.guilds.forEach((guild) => {
			this.babyCache.setGuild(guild.id, {
				available: false,
				lastEvent: Date.now()
			});
		});
		if (type === "GUILD_CREATE") {
			const guildCreateData = payload.d;
			const existingGuild = this.babyCache.getGuild(guildCreateData.id);
			if (existingGuild && !existingGuild.available) {
				this.babyCache.setGuild(guildCreateData.id, {
					available: true,
					lastEvent: Date.now()
				});
				this.client.eventHandler.handleEvent({
					...guildCreateData,
					clientId: this.client.options.clientId
				}, "GUILD_AVAILABLE");
				return;
			}
		}
		if (type === "GUILD_DELETE") {
			const guildDeleteData = payload.d;
			if (this.babyCache.getGuild(guildDeleteData.id)?.available && guildDeleteData.unavailable) {
				this.babyCache.setGuild(guildDeleteData.id, {
					available: false,
					lastEvent: Date.now()
				});
				this.client.eventHandler.handleEvent({
					...guildDeleteData,
					clientId: this.client.options.clientId
				}, "GUILD_UNAVAILABLE");
				return;
			}
			if (!guildDeleteData.unavailable) this.babyCache.removeGuild(guildDeleteData.id);
		}
		this.client.eventHandler.handleEvent({
			...payload.d,
			clientId: this.client.options.clientId
		}, type);
	}
	/**
	* Handles INVALID_SESSION and schedules reconnect with Discord-compliant delay.
	*/
	handleInvalidSession(data) {
		const isResumable = Boolean(data) && this.canResume();
		if (!isResumable) this.resetSessionState();
		const discordRequiredDelay = 1e3 + Math.floor(Math.random() * 4e3);
		this.scheduleReconnect({
			reason: "invalid-session",
			preferResume: isResumable,
			minDelayMs: discordRequiredDelay
		});
		this.reconnectWithSocketRestart();
	}
	/**
	* Handles RECONNECT opcode by scheduling reconnect with resume preference.
	*/
	handleReconnectOpcode() {
		this.scheduleReconnect({
			reason: "reconnect-opcode",
			preferResume: true,
			allowImmediateFirstAttempt: true
		});
		this.reconnectWithSocketRestart();
	}
	/**
	* Terminates the current socket after reconnect has been scheduled.
	*/
	reconnectWithSocketRestart() {
		stopHeartbeat(this);
		this.lastHeartbeatAck = true;
		if (!this.ws) return;
		this.silentSocketClosures.add(this.ws);
		this.ws.terminate();
	}
	/**
	* Schedules a single reconnect attempt with backoff and attempt limits.
	*/
	scheduleReconnect(options) {
		if (!this.shouldReconnect || this.reconnectTimeout || this.isConnecting) return;
		const maxAttempts = this.options.reconnect?.maxAttempts ?? reconnectDefaults.maxAttempts;
		if (Number.isFinite(maxAttempts) && this.reconnectAttempts >= maxAttempts) {
			this.shouldReconnect = false;
			this.emitter.emit("error", /* @__PURE__ */ new Error(`Max reconnect attempts (${maxAttempts}) reached${options.code ? ` after close code ${options.code}` : ""}`));
			return;
		}
		let shouldResume = options.preferResume && this.canResume();
		const resumeFailureThreshold = 3;
		if (shouldResume && this.consecutiveResumeFailures >= resumeFailureThreshold) {
			this.resetSessionState();
			shouldResume = false;
			this.emitter.emit("debug", `Gateway forcing fresh IDENTIFY after ${resumeFailureThreshold} failed resume attempts`);
		}
		const delay = this.computeReconnectDelay(options);
		if (shouldResume) this.consecutiveResumeFailures++;
		else this.consecutiveResumeFailures = 0;
		this.reconnectAttempts++;
		this.emitter.emit("debug", `Gateway reconnect scheduled in ${delay}ms (${options.reason}, resume=${String(shouldResume)})`);
		this.reconnectTimeout = setTimeout(() => {
			this.reconnectTimeout = void 0;
			this.connect(shouldResume);
		}, delay);
	}
	/**
	* Computes exponential reconnect delay with jitter and optional minimum delay.
	*/
	computeReconnectDelay(options) {
		const baseDelay = this.options.reconnect?.baseDelay ?? reconnectDefaults.baseDelay;
		const maxDelay = this.options.reconnect?.maxDelay ?? reconnectDefaults.maxDelay;
		if (options.allowImmediateFirstAttempt && this.reconnectAttempts === 0 && (options.minDelayMs ?? 0) === 0) return 0;
		const exponentialDelay = Math.min(baseDelay * 2 ** this.reconnectAttempts, maxDelay);
		const jitterFactor = .85 + Math.random() * .3;
		const jitteredDelay = Math.floor(exponentialDelay * jitterFactor);
		return Math.max(options.minDelayMs ?? 0, jitteredDelay);
	}
	/**
	* Clears any pending reconnect timer.
	*/
	clearReconnectTimeout() {
		if (!this.reconnectTimeout) return;
		clearTimeout(this.reconnectTimeout);
		this.reconnectTimeout = void 0;
	}
	/**
	* Clears resume-related session state after non-resumable failures.
	*/
	resetSessionState() {
		this.state.sessionId = null;
		this.state.resumeGatewayUrl = null;
		this.state.sequence = null;
		this.sequence = null;
		this.consecutiveResumeFailures = 0;
		this.pings = [];
	}
	/**
	* Ensures gateway URLs include v=10 and encoding=json query parameters.
	*/
	ensureGatewayParams(url) {
		try {
			const parsed = new URL(url);
			if (!parsed.searchParams.get("v")) parsed.searchParams.set("v", "10");
			if (!parsed.searchParams.get("encoding")) parsed.searchParams.set("encoding", "json");
			return parsed.toString();
		} catch {
			const hasQuery = url.includes("?");
			const hasV = url.includes("v=");
			const hasEncoding = url.includes("encoding=");
			const separator = hasQuery ? "&" : "?";
			const parts = [];
			if (!hasV) parts.push("v=10");
			if (!hasEncoding) parts.push("encoding=json");
			return parts.length ? `${url}${separator}${parts.join("&")}` : url;
		}
	}
};
//#endregion
//#region extensions/discord/src/voice/command.ts
const VOICE_CHANNEL_TYPES = [ChannelType$2.GuildVoice, ChannelType$2.GuildStageVoice];
async function authorizeVoiceCommand(interaction, params, options) {
	const channelOverride = options?.channelOverride;
	const channel = channelOverride ? void 0 : interaction.channel;
	if (!interaction.guild) return {
		ok: false,
		message: "Voice commands are only available in guilds."
	};
	const user = interaction.user;
	if (!user) return {
		ok: false,
		message: "Unable to resolve command user."
	};
	const channelId = channelOverride?.id ?? channel?.id ?? "";
	const rawChannelName = channelOverride?.name ?? (channel && "name" in channel ? channel.name : void 0);
	const rawParentId = channelOverride?.parentId ?? ("parentId" in (channel ?? {}) ? channel.parentId ?? void 0 : void 0);
	const channelInfo = channelId ? await resolveDiscordChannelInfo(interaction.client, channelId) : null;
	const channelName = rawChannelName ?? channelInfo?.name;
	const channelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
	const isThreadChannel = channelInfo?.type === ChannelType.PublicThread || channelInfo?.type === ChannelType.PrivateThread || channelInfo?.type === ChannelType.AnnouncementThread;
	let parentId;
	let parentName;
	let parentSlug;
	if (isThreadChannel && channelId) {
		const parentInfo = await resolveDiscordThreadParentInfo({
			client: interaction.client,
			threadChannel: {
				id: channelId,
				name: channelName,
				parentId: rawParentId ?? channelInfo?.parentId,
				parent: void 0
			},
			channelInfo
		});
		parentId = parentInfo.id;
		parentName = parentInfo.name;
		parentSlug = parentName ? normalizeDiscordSlug(parentName) : void 0;
	}
	const memberRoleIds = Array.isArray(interaction.rawData.member?.roles) ? interaction.rawData.member.roles.map((roleId) => String(roleId)) : [];
	const sender = resolveDiscordSenderIdentity({
		author: user,
		member: interaction.rawData.member
	});
	const access = await authorizeDiscordVoiceIngress({
		cfg: params.cfg,
		discordConfig: params.discordConfig,
		groupPolicy: params.groupPolicy,
		useAccessGroups: params.useAccessGroups,
		guild: interaction.guild,
		guildId: interaction.guild.id,
		channelId,
		channelName,
		channelSlug,
		parentId,
		parentName,
		parentSlug,
		scope: isThreadChannel ? "thread" : "channel",
		channelLabel: channelId ? formatMention({ channelId }) : "This channel",
		memberRoleIds,
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		}
	});
	if (!access.ok) return {
		ok: false,
		message: access.message
	};
	return {
		ok: true,
		guildId: interaction.guild.id
	};
}
async function resolveVoiceCommandRuntimeContext(interaction, params) {
	const guildId = interaction.guild?.id;
	if (!guildId) {
		await interaction.reply({
			content: "Unable to resolve guild for this command.",
			ephemeral: true
		});
		return null;
	}
	const manager = params.getManager();
	if (!manager) {
		await interaction.reply({
			content: "Voice manager is not available yet.",
			ephemeral: true
		});
		return null;
	}
	return {
		guildId,
		manager
	};
}
async function ensureVoiceCommandAccess(params) {
	const access = await authorizeVoiceCommand(params.interaction, params.context, { channelOverride: params.channelOverride });
	if (access.ok) return true;
	await params.interaction.reply({
		content: access.message ?? "Not authorized.",
		ephemeral: true
	});
	return false;
}
function createDiscordVoiceCommand(params) {
	const resolveSessionChannelId = (manager, guildId) => manager.status().find((entry) => entry.guildId === guildId)?.channelId;
	class JoinCommand extends Command {
		constructor(..._args) {
			super(..._args);
			this.name = "join";
			this.description = "Join a voice channel";
			this.defer = true;
			this.ephemeral = params.ephemeralDefault;
			this.options = [{
				name: "channel",
				description: "Voice channel to join",
				type: ApplicationCommandOptionType$1.Channel,
				required: true,
				channel_types: VOICE_CHANNEL_TYPES
			}];
		}
		async run(interaction) {
			const channel = await interaction.options.getChannel("channel", true);
			if (!channel || !("id" in channel)) {
				await interaction.reply({
					content: "Voice channel not found.",
					ephemeral: true
				});
				return;
			}
			const access = await authorizeVoiceCommand(interaction, params, { channelOverride: {
				id: channel.id,
				name: "name" in channel ? channel.name : void 0,
				parentId: "parentId" in channel ? channel.parentId ?? void 0 : void 0
			} });
			if (!access.ok) {
				await interaction.reply({
					content: access.message ?? "Not authorized.",
					ephemeral: true
				});
				return;
			}
			if (!isVoiceChannelType(channel.type)) {
				await interaction.reply({
					content: "That is not a voice channel.",
					ephemeral: true
				});
				return;
			}
			const guildId = access.guildId ?? ("guildId" in channel ? channel.guildId : void 0);
			if (!guildId) {
				await interaction.reply({
					content: "Unable to resolve guild for this voice channel.",
					ephemeral: true
				});
				return;
			}
			const manager = params.getManager();
			if (!manager) {
				await interaction.reply({
					content: "Voice manager is not available yet.",
					ephemeral: true
				});
				return;
			}
			const result = await manager.join({
				guildId,
				channelId: channel.id
			});
			await interaction.reply({
				content: result.message,
				ephemeral: true
			});
		}
	}
	class LeaveCommand extends Command {
		constructor(..._args2) {
			super(..._args2);
			this.name = "leave";
			this.description = "Leave the current voice channel";
			this.defer = true;
			this.ephemeral = params.ephemeralDefault;
		}
		async run(interaction) {
			const runtimeContext = await resolveVoiceCommandRuntimeContext(interaction, params);
			if (!runtimeContext) return;
			const sessionChannelId = resolveSessionChannelId(runtimeContext.manager, runtimeContext.guildId);
			if (!await ensureVoiceCommandAccess({
				interaction,
				context: params,
				channelOverride: sessionChannelId ? { id: sessionChannelId } : void 0
			})) return;
			const result = await runtimeContext.manager.leave({ guildId: runtimeContext.guildId });
			await interaction.reply({
				content: result.message,
				ephemeral: true
			});
		}
	}
	class StatusCommand extends Command {
		constructor(..._args3) {
			super(..._args3);
			this.name = "status";
			this.description = "Show active voice sessions";
			this.defer = true;
			this.ephemeral = params.ephemeralDefault;
		}
		async run(interaction) {
			const runtimeContext = await resolveVoiceCommandRuntimeContext(interaction, params);
			if (!runtimeContext) return;
			const sessions = runtimeContext.manager.status().filter((entry) => entry.guildId === runtimeContext.guildId);
			const sessionChannelId = sessions[0]?.channelId;
			if (!await ensureVoiceCommandAccess({
				interaction,
				context: params,
				channelOverride: sessionChannelId ? { id: sessionChannelId } : void 0
			})) return;
			if (sessions.length === 0) {
				await interaction.reply({
					content: "No active voice sessions.",
					ephemeral: true
				});
				return;
			}
			const lines = sessions.map((entry) => `• ${formatMention({ channelId: entry.channelId })} (guild ${entry.guildId})`);
			await interaction.reply({
				content: lines.join("\n"),
				ephemeral: true
			});
		}
	}
	return new class extends CommandWithSubcommands {
		constructor(..._args4) {
			super(..._args4);
			this.name = "vc";
			this.description = "Voice channel controls";
			this.subcommands = [
				new JoinCommand(),
				new LeaveCommand(),
				new StatusCommand()
			];
		}
	}();
}
function isVoiceChannelType(type) {
	return type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice;
}
//#endregion
//#region extensions/discord/src/monitor/agent-components-helpers.ts
const AGENT_BUTTON_KEY = "agent";
const AGENT_SELECT_KEY = "agentsel";
function formatUsername(user) {
	if (user.discriminator && user.discriminator !== "0") return `${user.username}#${user.discriminator}`;
	return user.username;
}
function isThreadChannelType(channelType) {
	return channelType === ChannelType$2.PublicThread || channelType === ChannelType$2.PrivateThread || channelType === ChannelType$2.AnnouncementThread;
}
function readParsedComponentId(data) {
	if (!data || typeof data !== "object") return;
	return "cid" in data ? data.cid : data.componentId;
}
function normalizeComponentId(value) {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed ? trimmed : void 0;
	}
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
}
function mapOptionLabels(options, values) {
	if (!options || options.length === 0) return values;
	const map = new Map(options.map((option) => [option.value, option.label]));
	return values.map((value) => map.get(value) ?? value);
}
const { resolvePinnedMainDmOwnerFromAllowlist } = security_runtime_exports;
function resolveAgentComponentRoute(params) {
	return resolveAgentRoute({
		cfg: params.ctx.cfg,
		channel: "discord",
		accountId: params.ctx.accountId,
		guildId: params.rawGuildId,
		memberRoleIds: params.memberRoleIds,
		peer: {
			kind: params.isDirectMessage ? "direct" : params.isGroupDm ? "group" : "channel",
			id: params.isDirectMessage ? params.userId : params.channelId
		},
		parentPeer: params.parentId ? {
			kind: "channel",
			id: params.parentId
		} : void 0
	});
}
async function ackComponentInteraction(params) {
	try {
		await params.interaction.reply({
			content: "✓",
			...params.replyOpts
		});
	} catch (err) {
		logError(`${params.label}: failed to acknowledge interaction: ${String(err)}`);
	}
}
function resolveDiscordChannelContext(interaction) {
	const channel = interaction.channel;
	const channelName = channel && "name" in channel ? channel.name : void 0;
	const channelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
	const channelType = channel && "type" in channel ? channel.type : void 0;
	const isThread = isThreadChannelType(channelType);
	let parentId;
	let parentName;
	let parentSlug = "";
	if (isThread && channel && "parentId" in channel) {
		parentId = channel.parentId ?? void 0;
		if ("parent" in channel) {
			const parent = channel.parent;
			if (parent?.name) {
				parentName = parent.name;
				parentSlug = normalizeDiscordSlug(parentName);
			}
		}
	}
	return {
		channelName,
		channelSlug,
		channelType,
		isThread,
		parentId,
		parentName,
		parentSlug
	};
}
async function resolveComponentInteractionContext(params) {
	const { interaction, label } = params;
	const channelId = interaction.rawData.channel_id;
	if (!channelId) {
		logError(`${label}: missing channel_id in interaction`);
		return null;
	}
	const user = interaction.user;
	if (!user) {
		logError(`${label}: missing user in interaction`);
		return null;
	}
	const shouldDefer = params.defer !== false && "defer" in interaction;
	let didDefer = false;
	if (shouldDefer) try {
		await interaction.defer({ ephemeral: true });
		didDefer = true;
	} catch (err) {
		logError(`${label}: failed to defer interaction: ${String(err)}`);
	}
	const replyOpts = didDefer ? {} : { ephemeral: true };
	const username = formatUsername(user);
	const userId = user.id;
	const rawGuildId = interaction.rawData.guild_id;
	const channelType = resolveDiscordChannelContext(interaction).channelType;
	const isGroupDm = channelType === ChannelType$2.GroupDM;
	return {
		channelId,
		user,
		username,
		userId,
		replyOpts,
		rawGuildId,
		isDirectMessage: channelType === ChannelType$2.DM || !rawGuildId && !isGroupDm && channelType == null,
		isGroupDm,
		memberRoleIds: Array.isArray(interaction.rawData.member?.roles) ? interaction.rawData.member.roles.map((roleId) => String(roleId)) : []
	};
}
async function ensureGuildComponentMemberAllowed(params) {
	const { interaction, guildInfo, channelId, rawGuildId, channelCtx, memberRoleIds, user, replyOpts, componentLabel, unauthorizedReply } = params;
	if (!rawGuildId) return true;
	async function replyUnauthorized() {
		try {
			await interaction.reply({
				content: unauthorizedReply,
				...replyOpts
			});
		} catch {}
	}
	const channelConfig = resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId,
		channelName: channelCtx.channelName,
		channelSlug: channelCtx.channelSlug,
		parentId: channelCtx.parentId,
		parentName: channelCtx.parentName,
		parentSlug: channelCtx.parentSlug,
		scope: channelCtx.isThread ? "thread" : "channel"
	});
	if (channelConfig?.enabled === false) {
		await replyUnauthorized();
		return false;
	}
	const channelAllowlistConfigured = Boolean(guildInfo?.channels) && Object.keys(guildInfo?.channels ?? {}).length > 0;
	const channelAllowed = channelConfig?.allowed !== false;
	if (!isDiscordGroupAllowedByPolicy({
		groupPolicy: params.groupPolicy,
		guildAllowlisted: Boolean(guildInfo),
		channelAllowlistConfigured,
		channelAllowed
	})) {
		await replyUnauthorized();
		return false;
	}
	if (channelConfig?.allowed === false) {
		await replyUnauthorized();
		return false;
	}
	const { memberAllowed } = resolveDiscordMemberAccessState({
		channelConfig,
		guildInfo,
		memberRoleIds,
		sender: {
			id: user.id,
			name: user.username,
			tag: user.discriminator ? `${user.username}#${user.discriminator}` : void 0
		},
		allowNameMatching: params.allowNameMatching
	});
	if (memberAllowed) return true;
	logVerbose(`agent ${componentLabel}: blocked user ${user.id} (not in users/roles allowlist)`);
	await replyUnauthorized();
	return false;
}
async function ensureComponentUserAllowed(params) {
	const allowList = normalizeDiscordAllowList(params.entry.allowedUsers, [
		"discord:",
		"user:",
		"pk:"
	]);
	if (!allowList) return true;
	if (resolveDiscordAllowListMatch({
		allowList,
		candidate: {
			id: params.user.id,
			name: params.user.username,
			tag: formatDiscordUserTag(params.user)
		},
		allowNameMatching: params.allowNameMatching
	}).allowed) return true;
	logVerbose(`discord component ${params.componentLabel}: blocked user ${params.user.id} (not in allowedUsers)`);
	try {
		await params.interaction.reply({
			content: params.unauthorizedReply,
			...params.replyOpts
		});
	} catch {}
	return false;
}
async function ensureAgentComponentInteractionAllowed(params) {
	const guildInfo = resolveDiscordGuildEntry({
		guild: params.interaction.guild ?? void 0,
		guildId: params.rawGuildId,
		guildEntries: params.ctx.guildEntries
	});
	const channelCtx = resolveDiscordChannelContext(params.interaction);
	if (!await ensureGuildComponentMemberAllowed({
		interaction: params.interaction,
		guildInfo,
		channelId: params.channelId,
		rawGuildId: params.rawGuildId,
		channelCtx,
		memberRoleIds: params.memberRoleIds,
		user: params.user,
		replyOpts: params.replyOpts,
		componentLabel: params.componentLabel,
		unauthorizedReply: params.unauthorizedReply,
		allowNameMatching: isDangerousNameMatchingEnabled(params.ctx.discordConfig),
		groupPolicy: resolveOpenProviderRuntimeGroupPolicy({
			providerConfigPresent: params.ctx.cfg.channels?.discord !== void 0,
			groupPolicy: params.ctx.discordConfig?.groupPolicy,
			defaultGroupPolicy: params.ctx.cfg.channels?.defaults?.groupPolicy
		}).groupPolicy
	})) return null;
	return { parentId: channelCtx.parentId };
}
function parseAgentComponentData(data) {
	const raw = readParsedComponentId(data);
	const decodeSafe = (value) => {
		if (!value.includes("%")) return value;
		if (!/%[0-9A-Fa-f]{2}/.test(value)) return value;
		try {
			return decodeURIComponent(value);
		} catch {
			return value;
		}
	};
	const componentId = typeof raw === "string" ? decodeSafe(raw) : typeof raw === "number" ? String(raw) : null;
	if (!componentId) return null;
	return { componentId };
}
async function ensureDmComponentAuthorized(params) {
	const { ctx, interaction, user, componentLabel, replyOpts } = params;
	const allowFromPrefixes = [
		"discord:",
		"user:",
		"pk:"
	];
	const resolveAllowMatch = (entries) => {
		const allowList = normalizeDiscordAllowList(entries, allowFromPrefixes);
		return allowList ? resolveDiscordAllowListMatch({
			allowList,
			candidate: {
				id: user.id,
				name: user.username,
				tag: formatDiscordUserTag(user)
			},
			allowNameMatching: isDangerousNameMatchingEnabled(ctx.discordConfig)
		}) : { allowed: false };
	};
	const dmPolicy = ctx.dmPolicy ?? "pairing";
	if (dmPolicy === "disabled") {
		logVerbose(`agent ${componentLabel}: blocked (DM policy disabled)`);
		try {
			await interaction.reply({
				content: "DM interactions are disabled.",
				...replyOpts
			});
		} catch {}
		return false;
	}
	if (dmPolicy === "open") return true;
	if (dmPolicy === "allowlist") {
		if (resolveAllowMatch(ctx.allowFrom ?? []).allowed) return true;
		logVerbose(`agent ${componentLabel}: blocked DM user ${user.id} (not in allowFrom)`);
		try {
			await interaction.reply({
				content: `You are not authorized to use this ${componentLabel}.`,
				...replyOpts
			});
		} catch {}
		return false;
	}
	const storeAllowFrom = await readStoreAllowFromForDmPolicy({
		provider: "discord",
		accountId: ctx.accountId,
		dmPolicy
	});
	if (resolveAllowMatch([...ctx.allowFrom ?? [], ...storeAllowFrom]).allowed) return true;
	if (dmPolicy === "pairing") {
		if (!(await createChannelPairingChallengeIssuer({
			channel: "discord",
			upsertPairingRequest: async ({ id, meta }) => await upsertChannelPairingRequest({
				channel: "discord",
				id,
				accountId: ctx.accountId,
				meta
			})
		})({
			senderId: user.id,
			senderIdLine: `Your Discord user id: ${user.id}`,
			meta: {
				tag: formatDiscordUserTag(user),
				name: user.username
			},
			sendPairingReply: async (text) => {
				await interaction.reply({
					content: text,
					...replyOpts
				});
			}
		})).created) try {
			await interaction.reply({
				content: "Pairing already requested. Ask the bot owner to approve your code.",
				...replyOpts
			});
		} catch {}
		return false;
	}
	logVerbose(`agent ${componentLabel}: blocked DM user ${user.id} (not in allowFrom)`);
	try {
		await interaction.reply({
			content: `You are not authorized to use this ${componentLabel}.`,
			...replyOpts
		});
	} catch {}
	return false;
}
async function ensureGroupDmComponentAuthorized(params) {
	const { ctx, interaction, channelId, componentLabel, replyOpts } = params;
	if (!(ctx.discordConfig?.dm?.groupEnabled ?? false)) {
		logVerbose(`agent ${componentLabel}: blocked group dm ${channelId} (group DMs disabled)`);
		try {
			await interaction.reply({
				content: "Group DM interactions are disabled.",
				...replyOpts
			});
		} catch {}
		return false;
	}
	const channelCtx = resolveDiscordChannelContext(interaction);
	if (resolveGroupDmAllow({
		channels: ctx.discordConfig?.dm?.groupChannels,
		channelId,
		channelName: channelCtx.channelName,
		channelSlug: channelCtx.channelSlug
	})) return true;
	logVerbose(`agent ${componentLabel}: blocked group dm ${channelId} (not allowlisted)`);
	try {
		await interaction.reply({
			content: `You are not authorized to use this ${componentLabel}.`,
			...replyOpts
		});
	} catch {}
	return false;
}
async function resolveInteractionContextWithDmAuth(params) {
	const interactionCtx = await resolveComponentInteractionContext({
		interaction: params.interaction,
		label: params.label,
		defer: params.defer
	});
	if (!interactionCtx) return null;
	if (interactionCtx.isDirectMessage) {
		if (!await ensureDmComponentAuthorized({
			ctx: params.ctx,
			interaction: params.interaction,
			user: interactionCtx.user,
			componentLabel: params.componentLabel,
			replyOpts: interactionCtx.replyOpts
		})) return null;
	}
	if (interactionCtx.isGroupDm) {
		if (!await ensureGroupDmComponentAuthorized({
			ctx: params.ctx,
			interaction: params.interaction,
			channelId: interactionCtx.channelId,
			componentLabel: params.componentLabel,
			replyOpts: interactionCtx.replyOpts
		})) return null;
	}
	return interactionCtx;
}
function parseDiscordComponentData(data, customId) {
	if (!data || typeof data !== "object") return null;
	const rawComponentId = readParsedComponentId(data);
	const rawModalId = "mid" in data ? data.mid : data.modalId;
	let componentId = normalizeComponentId(rawComponentId);
	let modalId = normalizeComponentId(rawModalId);
	if (!componentId && customId) {
		const parsed = parseDiscordComponentCustomId(customId);
		if (parsed) {
			componentId = parsed.componentId;
			modalId = parsed.modalId;
		}
	}
	if (!componentId) return null;
	return {
		componentId,
		modalId
	};
}
function parseDiscordModalId(data, customId) {
	if (data && typeof data === "object") {
		const modalId = normalizeComponentId("mid" in data ? data.mid : data.modalId);
		if (modalId) return modalId;
	}
	if (customId) return parseDiscordModalCustomId(customId);
	return null;
}
function resolveInteractionCustomId(interaction) {
	if (!interaction?.rawData || typeof interaction.rawData !== "object") return;
	if (!("data" in interaction.rawData)) return;
	const customId = interaction.rawData.data?.custom_id;
	if (typeof customId !== "string") return;
	const trimmed = customId.trim();
	return trimmed ? trimmed : void 0;
}
function mapSelectValues(entry, values) {
	if (entry.selectType === "string") return mapOptionLabels(entry.options, values);
	if (entry.selectType === "user") return values.map((value) => `user:${value}`);
	if (entry.selectType === "role") return values.map((value) => `role:${value}`);
	if (entry.selectType === "mentionable") return values.map((value) => `mentionable:${value}`);
	if (entry.selectType === "channel") return values.map((value) => `channel:${value}`);
	return values;
}
function resolveModalFieldValues(field, interaction) {
	const fields = interaction.fields;
	const optionLabels = field.options?.map((option) => ({
		value: option.value,
		label: option.label
	}));
	const required = field.required === true;
	try {
		switch (field.type) {
			case "text": {
				const value = required ? fields.getText(field.id, true) : fields.getText(field.id);
				return value ? [value] : [];
			}
			case "select":
			case "checkbox":
			case "radio": return mapOptionLabels(optionLabels, required ? fields.getStringSelect(field.id, true) : fields.getStringSelect(field.id) ?? []);
			case "role-select": try {
				return (required ? fields.getRoleSelect(field.id, true) : fields.getRoleSelect(field.id) ?? []).map((role) => role.name ?? role.id);
			} catch {
				return required ? fields.getStringSelect(field.id, true) : fields.getStringSelect(field.id) ?? [];
			}
			case "user-select": return (required ? fields.getUserSelect(field.id, true) : fields.getUserSelect(field.id) ?? []).map((user) => formatDiscordUserTag(user));
			default: return [];
		}
	} catch (err) {
		logError(`agent modal: failed to read field ${field.id}: ${String(err)}`);
		return [];
	}
}
function formatModalSubmissionText(entry, interaction) {
	const lines = [`Form "${entry.title}" submitted.`];
	for (const field of entry.fields) {
		const values = resolveModalFieldValues(field, interaction);
		if (values.length === 0) continue;
		lines.push(`- ${field.label}: ${values.join(", ")}`);
	}
	if (lines.length === 1) lines.push("- (no values)");
	return lines.join("\n");
}
function resolveDiscordInteractionId(interaction) {
	const rawId = interaction.rawData && typeof interaction.rawData === "object" && "id" in interaction.rawData ? interaction.rawData.id : void 0;
	if (typeof rawId === "string" && rawId.trim()) return rawId.trim();
	if (typeof rawId === "number" && Number.isFinite(rawId)) return String(rawId);
	return `discord-interaction:${Date.now()}`;
}
function resolveComponentCommandAuthorized(params) {
	const { ctx, interactionCtx, channelConfig, guildInfo } = params;
	if (interactionCtx.isDirectMessage) return true;
	const { ownerAllowList, ownerAllowed: ownerOk } = resolveDiscordOwnerAccess({
		allowFrom: ctx.allowFrom,
		sender: {
			id: interactionCtx.user.id,
			name: interactionCtx.user.username,
			tag: formatDiscordUserTag(interactionCtx.user)
		},
		allowNameMatching: params.allowNameMatching
	});
	const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
		channelConfig,
		guildInfo,
		memberRoleIds: interactionCtx.memberRoleIds,
		sender: {
			id: interactionCtx.user.id,
			name: interactionCtx.user.username,
			tag: formatDiscordUserTag(interactionCtx.user)
		},
		allowNameMatching: params.allowNameMatching
	});
	const useAccessGroups = ctx.cfg.commands?.useAccessGroups !== false;
	return resolveCommandAuthorizedFromAuthorizers({
		useAccessGroups,
		authorizers: useAccessGroups ? [{
			configured: ownerAllowList != null,
			allowed: ownerOk
		}, {
			configured: hasAccessRestrictions,
			allowed: memberAllowed
		}] : [{
			configured: hasAccessRestrictions,
			allowed: memberAllowed
		}],
		modeWhenAccessGroupsOff: "configured"
	});
}
//#endregion
//#region extensions/discord/src/monitor/agent-components.ts
let conversationRuntimePromise;
let componentsRuntimePromise;
let pluginRuntimePromise;
let replyRuntimePromise;
let replyPipelineRuntimePromise;
let sendComponentsRuntimePromise;
let typingRuntimePromise;
async function loadConversationRuntime() {
	conversationRuntimePromise ??= import("./plugin-sdk/conversation-runtime.js");
	return await conversationRuntimePromise;
}
async function loadComponentsRuntime() {
	componentsRuntimePromise ??= import("./components-BRqstv8j.js");
	return await componentsRuntimePromise;
}
async function loadPluginRuntime() {
	pluginRuntimePromise ??= import("./plugin-sdk/plugin-runtime.js");
	return await pluginRuntimePromise;
}
async function loadReplyRuntime() {
	replyRuntimePromise ??= import("./plugin-sdk/reply-runtime.js");
	return await replyRuntimePromise;
}
async function loadReplyPipelineRuntime() {
	replyPipelineRuntimePromise ??= import("./plugin-sdk/channel-reply-pipeline.js");
	return await replyPipelineRuntimePromise;
}
async function loadSendComponentsRuntime() {
	sendComponentsRuntimePromise ??= import("./send.components-BGRZmQdG.js");
	return await sendComponentsRuntimePromise;
}
async function loadTypingRuntime() {
	typingRuntimePromise ??= import("./typing-dktAc2mT.js");
	return await typingRuntimePromise;
}
function resolveComponentGroupPolicy(ctx) {
	return resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: ctx.cfg.channels?.discord !== void 0,
		groupPolicy: ctx.discordConfig?.groupPolicy,
		defaultGroupPolicy: ctx.cfg.channels?.defaults?.groupPolicy
	}).groupPolicy;
}
function buildDiscordComponentConversationLabel(params) {
	if (params.interactionCtx.isDirectMessage) return buildDirectLabel(params.interactionCtx.user);
	if (params.interactionCtx.isGroupDm) return `Group DM #${params.channelCtx.channelName ?? params.interactionCtx.channelId} channel id:${params.interactionCtx.channelId}`;
	return buildGuildLabel({
		guild: params.interaction.guild ?? void 0,
		channelName: params.channelCtx.channelName ?? params.interactionCtx.channelId,
		channelId: params.interactionCtx.channelId
	});
}
function resolveDiscordComponentChatType(interactionCtx) {
	if (interactionCtx.isDirectMessage) return "direct";
	if (interactionCtx.isGroupDm) return "group";
	return "channel";
}
async function dispatchPluginDiscordInteractiveEvent(params) {
	const normalizedConversationId = params.interactionCtx.rawGuildId || params.channelCtx.channelType === ChannelType$2.GroupDM ? `channel:${params.interactionCtx.channelId}` : `user:${params.interactionCtx.userId}`;
	let responded = false;
	let acknowledged = false;
	const updateOriginalMessage = async (input) => {
		const payload = {
			...input.text !== void 0 ? { content: input.text } : {},
			...input.components !== void 0 ? { components: input.components } : {}
		};
		if (acknowledged) {
			await params.interaction.reply(payload);
			return;
		}
		if (!("update" in params.interaction) || typeof params.interaction.update !== "function") throw new Error("Discord interaction cannot update the source message");
		await params.interaction.update(payload);
	};
	const respond = {
		acknowledge: async () => {
			if (responded) return;
			await params.interaction.acknowledge();
			acknowledged = true;
			responded = true;
		},
		reply: async ({ text, ephemeral = true }) => {
			responded = true;
			await params.interaction.reply({
				content: text,
				ephemeral
			});
		},
		followUp: async ({ text, ephemeral = true }) => {
			responded = true;
			await params.interaction.followUp({
				content: text,
				ephemeral
			});
		},
		editMessage: async (input) => {
			const { text, components } = input;
			responded = true;
			await updateOriginalMessage({
				text,
				components
			});
		},
		clearComponents: async (input) => {
			responded = true;
			await updateOriginalMessage({
				text: input?.text,
				components: []
			});
		}
	};
	const conversationRuntime = await loadConversationRuntime();
	const pluginBindingApproval = conversationRuntime.parsePluginBindingApprovalCustomId(params.data);
	if (pluginBindingApproval) {
		const { buildPluginBindingResolvedText, resolvePluginConversationBindingApproval } = conversationRuntime;
		if (!pluginBindingApproval) return "unmatched";
		try {
			await respond.acknowledge();
		} catch {}
		const resolved = await resolvePluginConversationBindingApproval({
			approvalId: pluginBindingApproval.approvalId,
			decision: pluginBindingApproval.decision,
			senderId: params.interactionCtx.userId
		});
		const approvalMessageId = params.messageId?.trim() || params.interaction.message?.id?.trim();
		if (approvalMessageId) try {
			const { editDiscordComponentMessage } = await loadSendComponentsRuntime();
			await editDiscordComponentMessage(normalizedConversationId, approvalMessageId, { text: buildPluginBindingResolvedText(resolved) }, { accountId: params.ctx.accountId });
		} catch (err) {
			logError(`discord plugin binding approval: failed to clear prompt: ${String(err)}`);
		}
		if (resolved.status !== "approved") try {
			await respond.followUp({
				text: buildPluginBindingResolvedText(resolved),
				ephemeral: true
			});
		} catch (err) {
			logError(`discord plugin binding approval: failed to follow up: ${String(err)}`);
		}
		return "handled";
	}
	const { dispatchPluginInteractiveHandler } = await loadPluginRuntime();
	const dispatched = await dispatchPluginInteractiveHandler({
		channel: "discord",
		data: params.data,
		interactionId: resolveDiscordInteractionId(params.interaction),
		ctx: {
			accountId: params.ctx.accountId,
			interactionId: resolveDiscordInteractionId(params.interaction),
			conversationId: normalizedConversationId,
			parentConversationId: params.channelCtx.parentId,
			guildId: params.interactionCtx.rawGuildId,
			senderId: params.interactionCtx.userId,
			senderUsername: params.interactionCtx.username,
			auth: { isAuthorizedSender: params.isAuthorizedSender },
			interaction: {
				kind: params.kind,
				messageId: params.messageId,
				values: params.values,
				fields: params.fields
			}
		},
		respond,
		onMatched: async () => {
			try {
				await respond.acknowledge();
			} catch {}
		}
	});
	if (!dispatched.matched) return "unmatched";
	if (dispatched.handled) {
		if (!responded) try {
			await respond.acknowledge();
		} catch {}
		return "handled";
	}
	return "unmatched";
}
async function dispatchDiscordComponentEvent(params) {
	const { ctx, interaction, interactionCtx, channelCtx, guildInfo, eventText } = params;
	const runtime = ctx.runtime ?? createNonExitingRuntime();
	const route = resolveAgentComponentRoute({
		ctx,
		rawGuildId: interactionCtx.rawGuildId,
		memberRoleIds: interactionCtx.memberRoleIds,
		isDirectMessage: interactionCtx.isDirectMessage,
		isGroupDm: interactionCtx.isGroupDm,
		userId: interactionCtx.userId,
		channelId: interactionCtx.channelId,
		parentId: channelCtx.parentId
	});
	const sessionKey = params.routeOverrides?.sessionKey ?? route.sessionKey;
	const agentId = params.routeOverrides?.agentId ?? route.agentId;
	const accountId = params.routeOverrides?.accountId ?? route.accountId;
	const fromLabel = buildDiscordComponentConversationLabel({
		interactionCtx,
		interaction,
		channelCtx
	});
	const chatType = resolveDiscordComponentChatType(interactionCtx);
	const senderName = interactionCtx.user.globalName ?? interactionCtx.user.username;
	const senderUsername = interactionCtx.user.username;
	const senderTag = formatDiscordUserTag(interactionCtx.user);
	const groupChannel = !interactionCtx.isDirectMessage && channelCtx.channelSlug ? `#${channelCtx.channelSlug}` : void 0;
	const groupSubject = interactionCtx.isDirectMessage ? void 0 : groupChannel;
	const channelConfig = resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId: interactionCtx.channelId,
		channelName: channelCtx.channelName,
		channelSlug: channelCtx.channelSlug,
		parentId: channelCtx.parentId,
		parentName: channelCtx.parentName,
		parentSlug: channelCtx.parentSlug,
		scope: channelCtx.isThread ? "thread" : "channel"
	});
	const allowNameMatching = isDangerousNameMatchingEnabled(ctx.discordConfig);
	const { ownerAllowFrom } = buildDiscordInboundAccessContext({
		channelConfig,
		guildInfo,
		sender: {
			id: interactionCtx.user.id,
			name: interactionCtx.user.username,
			tag: senderTag
		},
		allowNameMatching,
		isGuild: !interactionCtx.isDirectMessage
	});
	const groupSystemPrompt = buildDiscordGroupSystemPrompt(channelConfig);
	const pinnedMainDmOwner = interactionCtx.isDirectMessage ? resolvePinnedMainDmOwnerFromAllowlist({
		dmScope: ctx.cfg.session?.dmScope,
		allowFrom: channelConfig?.users ?? guildInfo?.users,
		normalizeEntry: (entry) => {
			const candidate = normalizeDiscordAllowList([entry], [
				"discord:",
				"user:",
				"pk:"
			])?.ids.values().next().value;
			return typeof candidate === "string" && /^\d+$/.test(candidate) ? candidate : void 0;
		}
	}) : null;
	const commandAuthorized = resolveComponentCommandAuthorized({
		ctx,
		interactionCtx,
		channelConfig,
		guildInfo,
		allowNameMatching
	});
	const storePath = resolveStorePath(ctx.cfg.session?.store, { agentId });
	const envelopeOptions = resolveEnvelopeFormatOptions(ctx.cfg);
	const previousTimestamp = readSessionUpdatedAt({
		storePath,
		sessionKey
	});
	const timestamp = Date.now();
	const combinedBody = formatInboundEnvelope({
		channel: "Discord",
		from: fromLabel,
		timestamp,
		body: eventText,
		chatType,
		senderLabel: senderName,
		previousTimestamp,
		envelope: envelopeOptions
	});
	const { createReplyReferencePlanner, dispatchReplyWithBufferedBlockDispatcher, finalizeInboundContext, resolveChunkMode, resolveTextChunkLimit, recordInboundSession } = await (async () => {
		const replyRuntime = await loadReplyRuntime();
		const conversationRuntime = await loadConversationRuntime();
		return {
			...replyRuntime,
			recordInboundSession: conversationRuntime.recordInboundSession
		};
	})();
	const ctxPayload = finalizeInboundContext({
		Body: combinedBody,
		BodyForAgent: eventText,
		RawBody: eventText,
		CommandBody: eventText,
		From: interactionCtx.isDirectMessage ? `discord:${interactionCtx.userId}` : interactionCtx.isGroupDm ? `discord:group:${interactionCtx.channelId}` : `discord:channel:${interactionCtx.channelId}`,
		To: `channel:${interactionCtx.channelId}`,
		SessionKey: sessionKey,
		AccountId: accountId,
		ChatType: chatType,
		ConversationLabel: fromLabel,
		SenderName: senderName,
		SenderId: interactionCtx.userId,
		SenderUsername: senderUsername,
		SenderTag: senderTag,
		GroupSubject: groupSubject,
		GroupChannel: groupChannel,
		GroupSystemPrompt: interactionCtx.isDirectMessage ? void 0 : groupSystemPrompt,
		GroupSpace: guildInfo?.id ?? guildInfo?.slug ?? interactionCtx.rawGuildId ?? void 0,
		OwnerAllowFrom: ownerAllowFrom,
		Provider: "discord",
		Surface: "discord",
		WasMentioned: true,
		CommandAuthorized: commandAuthorized,
		CommandSource: "text",
		MessageSid: interaction.rawData.id,
		Timestamp: timestamp,
		OriginatingChannel: "discord",
		OriginatingTo: `channel:${interactionCtx.channelId}`
	});
	await recordInboundSession({
		storePath,
		sessionKey: ctxPayload.SessionKey ?? sessionKey,
		ctx: ctxPayload,
		updateLastRoute: interactionCtx.isDirectMessage ? {
			sessionKey: route.mainSessionKey,
			channel: "discord",
			to: `user:${interactionCtx.userId}`,
			accountId,
			mainDmOwnerPin: pinnedMainDmOwner ? {
				ownerRecipient: pinnedMainDmOwner,
				senderRecipient: interactionCtx.userId,
				onSkip: ({ ownerRecipient, senderRecipient }) => {
					logVerbose(`discord: skip main-session last route for ${senderRecipient} (pinned owner ${ownerRecipient})`);
				}
			} : void 0
		} : void 0,
		onRecordError: (err) => {
			logVerbose(`discord: failed updating component session meta: ${String(err)}`);
		}
	});
	const deliverTarget = `channel:${interactionCtx.channelId}`;
	const typingChannelId = interactionCtx.channelId;
	const { createChannelReplyPipeline } = await loadReplyPipelineRuntime();
	const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
		cfg: ctx.cfg,
		agentId,
		channel: "discord",
		accountId
	});
	const tableMode = resolveMarkdownTableMode({
		cfg: ctx.cfg,
		channel: "discord",
		accountId
	});
	const textLimit = resolveTextChunkLimit(ctx.cfg, "discord", accountId, { fallbackLimit: 2e3 });
	const token = ctx.token ?? "";
	const mediaLocalRoots = getAgentScopedMediaLocalRoots(ctx.cfg, agentId);
	const replyToMode = ctx.discordConfig?.replyToMode ?? ctx.cfg.channels?.discord?.replyToMode ?? "off";
	const replyReference = createReplyReferencePlanner({
		replyToMode,
		startId: params.replyToId
	});
	await dispatchReplyWithBufferedBlockDispatcher({
		ctx: ctxPayload,
		cfg: ctx.cfg,
		replyOptions: { onModelSelected },
		dispatcherOptions: {
			...replyPipeline,
			humanDelay: resolveHumanDelayConfig(ctx.cfg, agentId),
			deliver: async (payload) => {
				const replyToId = replyReference.use();
				await deliverDiscordReply({
					cfg: ctx.cfg,
					replies: [payload],
					target: deliverTarget,
					token,
					accountId,
					rest: interaction.client.rest,
					runtime,
					replyToId,
					replyToMode,
					textLimit,
					maxLinesPerMessage: resolveDiscordMaxLinesPerMessage({
						cfg: ctx.cfg,
						discordConfig: ctx.discordConfig,
						accountId
					}),
					tableMode,
					chunkMode: resolveChunkMode(ctx.cfg, "discord", accountId),
					mediaLocalRoots
				});
				replyReference.markSent();
			},
			onReplyStart: async () => {
				try {
					const { sendTyping } = await loadTypingRuntime();
					await sendTyping({
						client: interaction.client,
						channelId: typingChannelId
					});
				} catch (err) {
					logVerbose(`discord: typing failed for component reply: ${String(err)}`);
				}
			},
			onError: (err) => {
				logError(`discord component dispatch failed: ${String(err)}`);
			}
		}
	});
}
async function handleDiscordComponentEvent(params) {
	const parsed = parseDiscordComponentData(params.data, resolveInteractionCustomId(params.interaction));
	if (!parsed) {
		logError(`${params.label}: failed to parse component data`);
		try {
			await params.interaction.reply({
				content: "This component is no longer valid.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const entry = resolveDiscordComponentEntry({
		id: parsed.componentId,
		consume: false
	});
	if (!entry) {
		try {
			await params.interaction.reply({
				content: "This component has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const interactionCtx = await resolveInteractionContextWithDmAuth({
		ctx: params.ctx,
		interaction: params.interaction,
		label: params.label,
		componentLabel: params.componentLabel,
		defer: false
	});
	if (!interactionCtx) return;
	const { channelId, user, replyOpts, rawGuildId, memberRoleIds } = interactionCtx;
	const guildInfo = resolveDiscordGuildEntry({
		guild: params.interaction.guild ?? void 0,
		guildId: rawGuildId,
		guildEntries: params.ctx.guildEntries
	});
	const channelCtx = resolveDiscordChannelContext(params.interaction);
	const allowNameMatching = isDangerousNameMatchingEnabled(params.ctx.discordConfig);
	const channelConfig = resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId,
		channelName: channelCtx.channelName,
		channelSlug: channelCtx.channelSlug,
		parentId: channelCtx.parentId,
		parentName: channelCtx.parentName,
		parentSlug: channelCtx.parentSlug,
		scope: channelCtx.isThread ? "thread" : "channel"
	});
	const unauthorizedReply = `You are not authorized to use this ${params.componentLabel}.`;
	if (!await ensureGuildComponentMemberAllowed({
		interaction: params.interaction,
		guildInfo,
		channelId,
		rawGuildId,
		channelCtx,
		memberRoleIds,
		user,
		replyOpts,
		componentLabel: params.componentLabel,
		unauthorizedReply,
		allowNameMatching,
		groupPolicy: resolveComponentGroupPolicy(params.ctx)
	})) return;
	if (!await ensureComponentUserAllowed({
		entry,
		interaction: params.interaction,
		user,
		replyOpts,
		componentLabel: params.componentLabel,
		unauthorizedReply,
		allowNameMatching
	})) return;
	const commandAuthorized = resolveComponentCommandAuthorized({
		ctx: params.ctx,
		interactionCtx,
		channelConfig,
		guildInfo,
		allowNameMatching
	});
	const consumed = resolveDiscordComponentEntry({
		id: parsed.componentId,
		consume: !entry.reusable
	});
	if (!consumed) {
		try {
			await params.interaction.reply({
				content: "This component has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	if (consumed.kind === "modal-trigger") {
		try {
			await params.interaction.reply({
				content: "This form is no longer available.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const values = params.values ? mapSelectValues(consumed, params.values) : void 0;
	if (consumed.callbackData) {
		if (await dispatchPluginDiscordInteractiveEvent({
			ctx: params.ctx,
			interaction: params.interaction,
			interactionCtx,
			channelCtx,
			isAuthorizedSender: commandAuthorized,
			data: consumed.callbackData,
			kind: consumed.kind === "select" ? "select" : "button",
			values,
			messageId: consumed.messageId ?? params.interaction.message?.id
		}) === "handled") return;
	}
	const eventText = (consumed.kind === "button" ? consumed.callbackData?.trim() : void 0) || (await loadComponentsRuntime()).formatDiscordComponentEventText({
		kind: consumed.kind === "select" ? "select" : "button",
		label: consumed.label,
		values
	});
	try {
		await params.interaction.reply({
			content: "✓",
			...replyOpts
		});
	} catch (err) {
		logError(`${params.label}: failed to acknowledge interaction: ${String(err)}`);
	}
	await dispatchDiscordComponentEvent({
		ctx: params.ctx,
		interaction: params.interaction,
		interactionCtx,
		channelCtx,
		guildInfo,
		eventText,
		replyToId: consumed.messageId ?? params.interaction.message?.id,
		routeOverrides: {
			sessionKey: consumed.sessionKey,
			agentId: consumed.agentId,
			accountId: consumed.accountId
		}
	});
}
async function handleDiscordModalTrigger(params) {
	const parsed = parseDiscordComponentData(params.data, resolveInteractionCustomId(params.interaction));
	if (!parsed) {
		logError(`${params.label}: failed to parse modal trigger data`);
		try {
			await params.interaction.reply({
				content: "This button is no longer valid.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const entry = resolveDiscordComponentEntry({
		id: parsed.componentId,
		consume: false
	});
	if (!entry || entry.kind !== "modal-trigger") {
		try {
			await params.interaction.reply({
				content: "This button has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const modalId = entry.modalId ?? parsed.modalId;
	if (!modalId) {
		try {
			await params.interaction.reply({
				content: "This form is no longer available.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const interactionCtx = params.interactionCtx ?? await resolveInteractionContextWithDmAuth({
		ctx: params.ctx,
		interaction: params.interaction,
		label: params.label,
		componentLabel: "form",
		defer: false
	});
	if (!interactionCtx) return;
	const { channelId, user, replyOpts, rawGuildId, memberRoleIds } = interactionCtx;
	const guildInfo = resolveDiscordGuildEntry({
		guild: params.interaction.guild ?? void 0,
		guildId: rawGuildId,
		guildEntries: params.ctx.guildEntries
	});
	const channelCtx = resolveDiscordChannelContext(params.interaction);
	const unauthorizedReply = "You are not authorized to use this form.";
	if (!await ensureGuildComponentMemberAllowed({
		interaction: params.interaction,
		guildInfo,
		channelId,
		rawGuildId,
		channelCtx,
		memberRoleIds,
		user,
		replyOpts,
		componentLabel: "form",
		unauthorizedReply,
		allowNameMatching: isDangerousNameMatchingEnabled(params.ctx.discordConfig),
		groupPolicy: resolveComponentGroupPolicy(params.ctx)
	})) return;
	if (!await ensureComponentUserAllowed({
		entry,
		interaction: params.interaction,
		user,
		replyOpts,
		componentLabel: "form",
		unauthorizedReply,
		allowNameMatching: isDangerousNameMatchingEnabled(params.ctx.discordConfig)
	})) return;
	const consumed = resolveDiscordComponentEntry({
		id: parsed.componentId,
		consume: !entry.reusable
	});
	if (!consumed) {
		try {
			await params.interaction.reply({
				content: "This form has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const modalEntry = resolveDiscordModalEntry({
		id: consumed.modalId ?? modalId,
		consume: false
	});
	if (!modalEntry) {
		try {
			await params.interaction.reply({
				content: "This form has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	try {
		await params.interaction.showModal((await loadComponentsRuntime()).createDiscordFormModal(modalEntry));
	} catch (err) {
		logError(`${params.label}: failed to show modal: ${String(err)}`);
	}
}
var AgentComponentButton = class extends Button {
	constructor(ctx) {
		super();
		this.label = AGENT_BUTTON_KEY;
		this.customId = `${AGENT_BUTTON_KEY}:seed=1`;
		this.style = ButtonStyle$1.Primary;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		const parsed = parseAgentComponentData(data);
		if (!parsed) {
			logError("agent button: failed to parse component data");
			try {
				await interaction.reply({
					content: "This button is no longer valid.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const { componentId } = parsed;
		const interactionCtx = await resolveInteractionContextWithDmAuth({
			ctx: this.ctx,
			interaction,
			label: "agent button",
			componentLabel: "button",
			defer: false
		});
		if (!interactionCtx) return;
		const { channelId, user, username, userId, replyOpts, rawGuildId, isDirectMessage, isGroupDm, memberRoleIds } = interactionCtx;
		const allowed = await ensureAgentComponentInteractionAllowed({
			ctx: this.ctx,
			interaction,
			channelId,
			rawGuildId,
			memberRoleIds,
			user,
			replyOpts,
			componentLabel: "button",
			unauthorizedReply: "You are not authorized to use this button."
		});
		if (!allowed) return;
		const { parentId } = allowed;
		const route = resolveAgentComponentRoute({
			ctx: this.ctx,
			rawGuildId,
			memberRoleIds,
			isDirectMessage,
			isGroupDm,
			userId,
			channelId,
			parentId
		});
		const eventText = `[Discord component: ${componentId} clicked by ${username} (${userId})]`;
		logDebug(`agent button: enqueuing event for channel ${channelId}: ${eventText}`);
		enqueueSystemEvent(eventText, {
			sessionKey: route.sessionKey,
			contextKey: `discord:agent-button:${channelId}:${componentId}:${userId}`
		});
		await ackComponentInteraction({
			interaction,
			replyOpts,
			label: "agent button"
		});
	}
};
var AgentSelectMenu = class extends StringSelectMenu {
	constructor(ctx) {
		super();
		this.customId = `${AGENT_SELECT_KEY}:seed=1`;
		this.options = [];
		this.ctx = ctx;
	}
	async run(interaction, data) {
		const parsed = parseAgentComponentData(data);
		if (!parsed) {
			logError("agent select: failed to parse component data");
			try {
				await interaction.reply({
					content: "This select menu is no longer valid.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const { componentId } = parsed;
		const interactionCtx = await resolveInteractionContextWithDmAuth({
			ctx: this.ctx,
			interaction,
			label: "agent select",
			componentLabel: "select menu",
			defer: false
		});
		if (!interactionCtx) return;
		const { channelId, user, username, userId, replyOpts, rawGuildId, isDirectMessage, isGroupDm, memberRoleIds } = interactionCtx;
		const allowed = await ensureAgentComponentInteractionAllowed({
			ctx: this.ctx,
			interaction,
			channelId,
			rawGuildId,
			memberRoleIds,
			user,
			replyOpts,
			componentLabel: "select",
			unauthorizedReply: "You are not authorized to use this select menu."
		});
		if (!allowed) return;
		const { parentId } = allowed;
		const values = interaction.values ?? [];
		const valuesText = values.length > 0 ? ` (selected: ${values.join(", ")})` : "";
		const route = resolveAgentComponentRoute({
			ctx: this.ctx,
			rawGuildId,
			memberRoleIds,
			isDirectMessage,
			isGroupDm,
			userId,
			channelId,
			parentId
		});
		const eventText = `[Discord select menu: ${componentId} interacted by ${username} (${userId})${valuesText}]`;
		logDebug(`agent select: enqueuing event for channel ${channelId}: ${eventText}`);
		enqueueSystemEvent(eventText, {
			sessionKey: route.sessionKey,
			contextKey: `discord:agent-select:${channelId}:${componentId}:${userId}`
		});
		await ackComponentInteraction({
			interaction,
			replyOpts,
			label: "agent select"
		});
	}
};
var DiscordComponentButton = class extends Button {
	constructor(ctx) {
		super();
		this.label = "component";
		this.customId = "__openclaw_discord_component_button_wildcard__";
		this.style = ButtonStyle$1.Primary;
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		if (parseDiscordComponentData(data, resolveInteractionCustomId(interaction))?.modalId) {
			const interactionCtx = await resolveInteractionContextWithDmAuth({
				ctx: this.ctx,
				interaction,
				label: "discord component button",
				componentLabel: "form",
				defer: false
			});
			if (!interactionCtx) return;
			await handleDiscordModalTrigger({
				ctx: this.ctx,
				interaction,
				data,
				label: "discord component modal",
				interactionCtx
			});
			return;
		}
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "button",
			label: "discord component button"
		});
	}
};
var DiscordComponentStringSelect = class extends StringSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_string_select_wildcard__";
		this.options = [];
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "select menu",
			label: "discord component select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentUserSelect = class extends UserSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_user_select_wildcard__";
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "user select",
			label: "discord component user select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentRoleSelect = class extends RoleSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_role_select_wildcard__";
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "role select",
			label: "discord component role select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentMentionableSelect = class extends MentionableSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_mentionable_select_wildcard__";
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "mentionable select",
			label: "discord component mentionable select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentChannelSelect = class extends ChannelSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_channel_select_wildcard__";
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "channel select",
			label: "discord component channel select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentModal = class extends Modal {
	constructor(ctx) {
		super();
		this.title = "OpenClaw form";
		this.customId = "__openclaw_discord_component_modal_wildcard__";
		this.components = [];
		this.customIdParser = parseDiscordModalCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		const modalId = parseDiscordModalId(data, resolveInteractionCustomId(interaction));
		if (!modalId) {
			logError("discord component modal: missing modal id");
			try {
				await interaction.reply({
					content: "This form is no longer valid.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const modalEntry = resolveDiscordModalEntry({
			id: modalId,
			consume: false
		});
		if (!modalEntry) {
			try {
				await interaction.reply({
					content: "This form has expired.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const interactionCtx = await resolveInteractionContextWithDmAuth({
			ctx: this.ctx,
			interaction,
			label: "discord component modal",
			componentLabel: "form",
			defer: false
		});
		if (!interactionCtx) return;
		const { channelId, user, replyOpts, rawGuildId, memberRoleIds } = interactionCtx;
		const guildInfo = resolveDiscordGuildEntry({
			guild: interaction.guild ?? void 0,
			guildId: rawGuildId,
			guildEntries: this.ctx.guildEntries
		});
		const channelCtx = resolveDiscordChannelContext(interaction);
		const allowNameMatching = isDangerousNameMatchingEnabled(this.ctx.discordConfig);
		const channelConfig = resolveDiscordChannelConfigWithFallback({
			guildInfo,
			channelId,
			channelName: channelCtx.channelName,
			channelSlug: channelCtx.channelSlug,
			parentId: channelCtx.parentId,
			parentName: channelCtx.parentName,
			parentSlug: channelCtx.parentSlug,
			scope: channelCtx.isThread ? "thread" : "channel"
		});
		if (!await ensureGuildComponentMemberAllowed({
			interaction,
			guildInfo,
			channelId,
			rawGuildId,
			channelCtx,
			memberRoleIds,
			user,
			replyOpts,
			componentLabel: "form",
			unauthorizedReply: "You are not authorized to use this form.",
			allowNameMatching,
			groupPolicy: resolveComponentGroupPolicy(this.ctx)
		})) return;
		if (!await ensureComponentUserAllowed({
			entry: {
				id: modalEntry.id,
				kind: "button",
				label: modalEntry.title,
				allowedUsers: modalEntry.allowedUsers
			},
			interaction,
			user,
			replyOpts,
			componentLabel: "form",
			unauthorizedReply: "You are not authorized to use this form.",
			allowNameMatching
		})) return;
		const commandAuthorized = resolveComponentCommandAuthorized({
			ctx: this.ctx,
			interactionCtx,
			channelConfig,
			guildInfo,
			allowNameMatching
		});
		const consumed = resolveDiscordModalEntry({
			id: modalId,
			consume: !modalEntry.reusable
		});
		if (!consumed) {
			try {
				await interaction.reply({
					content: "This form has expired.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		if (consumed.callbackData) {
			const fields = consumed.fields.map((field) => ({
				id: field.id,
				name: field.name,
				values: resolveModalFieldValues(field, interaction)
			}));
			if (await dispatchPluginDiscordInteractiveEvent({
				ctx: this.ctx,
				interaction,
				interactionCtx,
				channelCtx,
				isAuthorizedSender: commandAuthorized,
				data: consumed.callbackData,
				kind: "modal",
				fields,
				messageId: consumed.messageId
			}) === "handled") return;
		}
		try {
			await interaction.acknowledge();
		} catch (err) {
			logError(`discord component modal: failed to acknowledge: ${String(err)}`);
		}
		const eventText = formatModalSubmissionText(consumed, interaction);
		await dispatchDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			interactionCtx,
			channelCtx,
			guildInfo,
			eventText,
			replyToId: consumed.messageId,
			routeOverrides: {
				sessionKey: consumed.sessionKey,
				agentId: consumed.agentId,
				accountId: consumed.accountId
			}
		});
	}
};
function createAgentComponentButton(ctx) {
	return new AgentComponentButton(ctx);
}
function createAgentSelectMenu(ctx) {
	return new AgentSelectMenu(ctx);
}
function createDiscordComponentButton(ctx) {
	return new DiscordComponentButton(ctx);
}
function createDiscordComponentStringSelect(ctx) {
	return new DiscordComponentStringSelect(ctx);
}
function createDiscordComponentUserSelect(ctx) {
	return new DiscordComponentUserSelect(ctx);
}
function createDiscordComponentRoleSelect(ctx) {
	return new DiscordComponentRoleSelect(ctx);
}
function createDiscordComponentMentionableSelect(ctx) {
	return new DiscordComponentMentionableSelect(ctx);
}
function createDiscordComponentChannelSelect(ctx) {
	return new DiscordComponentChannelSelect(ctx);
}
function createDiscordComponentModal(ctx) {
	return new DiscordComponentModal(ctx);
}
//#endregion
//#region extensions/discord/src/monitor/presence.ts
const DEFAULT_CUSTOM_ACTIVITY_TYPE$1 = 4;
const CUSTOM_STATUS_NAME$1 = "Custom Status";
function resolveDiscordPresenceUpdate(config) {
	const activityText = typeof config.activity === "string" ? config.activity.trim() : "";
	const status = typeof config.status === "string" ? config.status.trim() : "";
	const activityType = config.activityType;
	const activityUrl = typeof config.activityUrl === "string" ? config.activityUrl.trim() : "";
	const hasActivity = Boolean(activityText);
	if (!hasActivity && !Boolean(status)) return {
		since: null,
		activities: [],
		status: "online",
		afk: false
	};
	const activities = [];
	if (hasActivity) {
		const resolvedType = activityType ?? DEFAULT_CUSTOM_ACTIVITY_TYPE$1;
		const activity = resolvedType === DEFAULT_CUSTOM_ACTIVITY_TYPE$1 ? {
			name: CUSTOM_STATUS_NAME$1,
			type: resolvedType,
			state: activityText
		} : {
			name: activityText,
			type: resolvedType
		};
		if (resolvedType === 1 && activityUrl) activity.url = activityUrl;
		activities.push(activity);
	}
	return {
		since: null,
		activities,
		status: status || "online",
		afk: false
	};
}
//#endregion
//#region extensions/discord/src/monitor/auto-presence.ts
const DEFAULT_CUSTOM_ACTIVITY_TYPE = 4;
const CUSTOM_STATUS_NAME = "Custom Status";
const DEFAULT_INTERVAL_MS = 3e4;
const DEFAULT_MIN_UPDATE_INTERVAL_MS = 15e3;
const MIN_INTERVAL_MS = 5e3;
const MIN_UPDATE_INTERVAL_MS = 1e3;
function normalizeOptionalText(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function clampPositiveInt(value, fallback, minValue) {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	const rounded = Math.round(value);
	if (rounded <= 0) return fallback;
	return Math.max(minValue, rounded);
}
function resolveAutoPresenceConfig(config) {
	const intervalMs = clampPositiveInt(config?.intervalMs, DEFAULT_INTERVAL_MS, MIN_INTERVAL_MS);
	const minUpdateIntervalMs = clampPositiveInt(config?.minUpdateIntervalMs, DEFAULT_MIN_UPDATE_INTERVAL_MS, MIN_UPDATE_INTERVAL_MS);
	return {
		enabled: config?.enabled === true,
		intervalMs,
		minUpdateIntervalMs,
		healthyText: normalizeOptionalText(config?.healthyText),
		degradedText: normalizeOptionalText(config?.degradedText),
		exhaustedText: normalizeOptionalText(config?.exhaustedText)
	};
}
function buildCustomStatusActivity(text) {
	return {
		name: CUSTOM_STATUS_NAME,
		type: DEFAULT_CUSTOM_ACTIVITY_TYPE,
		state: text
	};
}
function renderTemplate(template, vars) {
	const rendered = template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_full, key) => vars[key] ?? "").replace(/\s+/g, " ").trim();
	return rendered.length > 0 ? rendered : void 0;
}
function isExhaustedUnavailableReason(reason) {
	if (!reason) return false;
	return reason === "rate_limit" || reason === "overloaded" || reason === "billing" || reason === "auth" || reason === "auth_permanent";
}
function formatUnavailableReason(reason) {
	if (!reason) return "unknown";
	return reason.replace(/_/g, " ");
}
function resolveAuthAvailability(params) {
	const profileIds = Object.keys(params.store.profiles);
	if (profileIds.length === 0) return {
		state: "degraded",
		unavailableReason: null
	};
	clearExpiredCooldowns(params.store, params.now);
	if (profileIds.some((profileId) => !isProfileInCooldown(params.store, profileId, params.now))) return {
		state: "healthy",
		unavailableReason: null
	};
	const unavailableReason = resolveProfilesUnavailableReason({
		store: params.store,
		profileIds,
		now: params.now
	});
	if (isExhaustedUnavailableReason(unavailableReason)) return {
		state: "exhausted",
		unavailableReason
	};
	return {
		state: "degraded",
		unavailableReason
	};
}
function resolvePresenceActivities(params) {
	const reasonLabel = formatUnavailableReason(params.unavailableReason ?? null);
	if (params.state === "healthy") {
		if (params.cfg.healthyText) return [buildCustomStatusActivity(params.cfg.healthyText)];
		return params.basePresence?.activities ?? [];
	}
	if (params.state === "degraded") {
		const text = renderTemplate(params.cfg.degradedText ?? "runtime degraded", { reason: reasonLabel });
		return text ? [buildCustomStatusActivity(text)] : [];
	}
	const defaultTemplate = isExhaustedUnavailableReason(params.unavailableReason ?? null) ? "token exhausted" : "model unavailable ({reason})";
	const text = renderTemplate(params.cfg.exhaustedText ?? defaultTemplate, { reason: reasonLabel });
	return text ? [buildCustomStatusActivity(text)] : [];
}
function resolvePresenceStatus(state) {
	if (state === "healthy") return "online";
	if (state === "exhausted") return "dnd";
	return "idle";
}
function resolveDiscordAutoPresenceDecision(params) {
	const autoPresence = resolveAutoPresenceConfig(params.discordConfig.autoPresence);
	if (!autoPresence.enabled) return null;
	const now = params.now ?? Date.now();
	const basePresence = resolveDiscordPresenceUpdate(params.discordConfig);
	const availability = resolveAuthAvailability({
		store: params.authStore,
		now
	});
	const state = params.gatewayConnected ? availability.state : "degraded";
	const unavailableReason = params.gatewayConnected ? availability.unavailableReason : availability.unavailableReason ?? "unknown";
	return {
		state,
		unavailableReason,
		presence: {
			since: null,
			activities: resolvePresenceActivities({
				state,
				cfg: autoPresence,
				basePresence,
				unavailableReason
			}),
			status: resolvePresenceStatus(state),
			afk: false
		}
	};
}
function stablePresenceSignature(payload) {
	return JSON.stringify({
		status: payload.status,
		afk: payload.afk,
		since: payload.since,
		activities: payload.activities.map((activity) => ({
			type: activity.type,
			name: activity.name,
			state: activity.state,
			url: activity.url
		}))
	});
}
function createDiscordAutoPresenceController(params) {
	const autoCfg = resolveAutoPresenceConfig(params.discordConfig.autoPresence);
	if (!autoCfg.enabled) return {
		enabled: false,
		start: () => void 0,
		stop: () => void 0,
		refresh: () => void 0,
		runNow: () => void 0
	};
	const loadAuthStore = params.loadAuthStore ?? (() => ensureAuthProfileStore());
	const now = params.now ?? (() => Date.now());
	const setIntervalFn = params.setIntervalFn ?? setInterval;
	const clearIntervalFn = params.clearIntervalFn ?? clearInterval;
	let timer;
	let lastAppliedSignature = null;
	let lastAppliedAt = 0;
	const runEvaluation = (options) => {
		let decision = null;
		try {
			decision = resolveDiscordAutoPresenceDecision({
				discordConfig: params.discordConfig,
				authStore: loadAuthStore(),
				gatewayConnected: params.gateway.isConnected,
				now: now()
			});
		} catch (err) {
			params.log?.(warn(`discord: auto-presence evaluation failed for account ${params.accountId}: ${String(err)}`));
			return;
		}
		if (!decision || !params.gateway.isConnected) return;
		const forceApply = options?.force === true;
		const ts = now();
		const signature = stablePresenceSignature(decision.presence);
		if (!forceApply && signature === lastAppliedSignature) return;
		if (!forceApply && lastAppliedAt > 0 && ts - lastAppliedAt < autoCfg.minUpdateIntervalMs) return;
		params.gateway.updatePresence(decision.presence);
		lastAppliedSignature = signature;
		lastAppliedAt = ts;
	};
	return {
		enabled: true,
		runNow: () => runEvaluation(),
		refresh: () => runEvaluation({ force: true }),
		start: () => {
			if (timer) return;
			runEvaluation({ force: true });
			timer = setIntervalFn(() => runEvaluation(), autoCfg.intervalMs);
		},
		stop: () => {
			if (!timer) return;
			clearIntervalFn(timer);
			timer = void 0;
		}
	};
}
//#endregion
//#region extensions/discord/src/monitor/commands.ts
function resolveDiscordSlashCommandConfig(raw) {
	return { ephemeral: raw?.ephemeral !== false };
}
//#endregion
//#region extensions/discord/src/monitor/exec-approvals.ts
const EXEC_APPROVAL_KEY = "execapproval";
function buildDiscordApprovalDmRedirectNotice() {
	return { content: getExecApprovalApproverDmNoticeText() };
}
function resolveApprovalKindFromId(approvalId) {
	return approvalId.startsWith("plugin:") ? "plugin" : "exec";
}
function isPluginApprovalRequest(request) {
	return resolveApprovalKindFromId(request.id) === "plugin";
}
function encodeCustomIdValue$1(value) {
	return encodeURIComponent(value);
}
function decodeCustomIdValue$1(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
function buildExecApprovalCustomId(approvalId, action) {
	return [`${EXEC_APPROVAL_KEY}:id=${encodeCustomIdValue$1(approvalId)}`, `action=${action}`].join(";");
}
function parseExecApprovalData(data) {
	if (!data || typeof data !== "object") return null;
	const coerce = (value) => typeof value === "string" || typeof value === "number" ? String(value) : "";
	const rawId = coerce(data.id);
	const rawAction = coerce(data.action);
	if (!rawId || !rawAction) return null;
	const action = rawAction;
	if (action !== "allow-once" && action !== "allow-always" && action !== "deny") return null;
	return {
		approvalId: decodeCustomIdValue$1(rawId),
		action
	};
}
var ExecApprovalContainer = class extends DiscordUiContainer {
	constructor(params) {
		const components = [new TextDisplay(`## ${params.title}`)];
		if (params.description) components.push(new TextDisplay(params.description));
		components.push(new Separator({
			divider: true,
			spacing: "small"
		}));
		components.push(new TextDisplay(`### Command\n\`\`\`\n${params.commandPreview}\n\`\`\``));
		if (params.commandSecondaryPreview) components.push(new TextDisplay(`### Shell Preview\n\`\`\`\n${params.commandSecondaryPreview}\n\`\`\``));
		if (params.metadataLines?.length) components.push(new TextDisplay(params.metadataLines.join("\n")));
		if (params.actionRow) components.push(params.actionRow);
		if (params.footer) {
			components.push(new Separator({
				divider: false,
				spacing: "small"
			}));
			components.push(new TextDisplay(`-# ${params.footer}`));
		}
		super({
			cfg: params.cfg,
			accountId: params.accountId,
			components,
			accentColor: params.accentColor
		});
	}
};
var ExecApprovalActionButton = class extends Button {
	constructor(params) {
		super();
		this.customId = buildExecApprovalCustomId(params.approvalId, params.descriptor.decision);
		this.label = params.descriptor.label;
		this.style = params.descriptor.style === "success" ? ButtonStyle$1.Success : params.descriptor.style === "primary" ? ButtonStyle$1.Primary : params.descriptor.style === "danger" ? ButtonStyle$1.Danger : ButtonStyle$1.Secondary;
	}
};
var ExecApprovalActionRow = class extends Row {
	constructor(params) {
		super([...buildExecApprovalActionDescriptors({
			approvalCommandId: params.approvalId,
			ask: params.ask,
			allowedDecisions: params.allowedDecisions
		}).map((descriptor) => new ExecApprovalActionButton({
			approvalId: params.approvalId,
			descriptor
		}))]);
	}
};
function createApprovalActionRow(request) {
	if (isPluginApprovalRequest(request)) return new ExecApprovalActionRow({ approvalId: request.id });
	return new ExecApprovalActionRow({
		approvalId: request.id,
		ask: request.request.ask,
		allowedDecisions: request.request.allowedDecisions
	});
}
function buildExecApprovalMetadataLines(request) {
	const lines = [];
	if (request.request.cwd) lines.push(`- Working Directory: ${request.request.cwd}`);
	if (request.request.host) lines.push(`- Host: ${request.request.host}`);
	if (Array.isArray(request.request.envKeys) && request.request.envKeys.length > 0) lines.push(`- Env Overrides: ${request.request.envKeys.join(", ")}`);
	if (request.request.agentId) lines.push(`- Agent: ${request.request.agentId}`);
	return lines;
}
function buildPluginApprovalMetadataLines(request) {
	const lines = [];
	const severity = request.request.severity ?? "warning";
	lines.push(`- Severity: ${severity === "critical" ? "Critical" : severity === "info" ? "Info" : "Warning"}`);
	if (request.request.toolName) lines.push(`- Tool: ${request.request.toolName}`);
	if (request.request.pluginId) lines.push(`- Plugin: ${request.request.pluginId}`);
	if (request.request.agentId) lines.push(`- Agent: ${request.request.agentId}`);
	return lines;
}
function buildExecApprovalPayload(container) {
	return { components: [container] };
}
function formatCommandPreview(commandText, maxChars) {
	return (commandText.length > maxChars ? `${commandText.slice(0, maxChars)}...` : commandText).replace(/`/g, "​`");
}
function formatOptionalCommandPreview(commandText, maxChars) {
	if (!commandText) return null;
	return formatCommandPreview(commandText, maxChars);
}
function resolveExecApprovalPreviews(request, maxChars, secondaryMaxChars) {
	const { commandText, commandPreview: secondaryPreview } = resolveExecApprovalCommandDisplay(request);
	return {
		commandPreview: formatCommandPreview(commandText, maxChars),
		commandSecondaryPreview: formatOptionalCommandPreview(secondaryPreview, secondaryMaxChars)
	};
}
function createExecApprovalRequestContainer(params) {
	const { commandPreview, commandSecondaryPreview } = resolveExecApprovalPreviews(params.request.request, 1e3, 500);
	const expiresAtSeconds = Math.max(0, Math.floor(params.request.expiresAtMs / 1e3));
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Exec Approval Required",
		description: "A command needs your approval.",
		commandPreview,
		commandSecondaryPreview,
		metadataLines: buildExecApprovalMetadataLines(params.request),
		actionRow: params.actionRow,
		footer: `Expires <t:${expiresAtSeconds}:R> · ID: ${params.request.id}`,
		accentColor: "#FFA500"
	});
}
function createPluginApprovalRequestContainer(params) {
	const expiresAtSeconds = Math.max(0, Math.floor(params.request.expiresAtMs / 1e3));
	const severity = params.request.request.severity ?? "warning";
	const accentColor = severity === "critical" ? "#ED4245" : severity === "info" ? "#5865F2" : "#FAA61A";
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Plugin Approval Required",
		description: "A plugin action needs your approval.",
		commandPreview: formatCommandPreview(params.request.request.title, 700),
		commandSecondaryPreview: formatOptionalCommandPreview(params.request.request.description, 1e3),
		metadataLines: buildPluginApprovalMetadataLines(params.request),
		actionRow: params.actionRow,
		footer: `Expires <t:${expiresAtSeconds}:R> · ID: ${params.request.id}`,
		accentColor
	});
}
function createExecResolvedContainer(params) {
	const { commandPreview, commandSecondaryPreview } = resolveExecApprovalPreviews(params.request.request, 500, 300);
	const decisionLabel = params.decision === "allow-once" ? "Allowed (once)" : params.decision === "allow-always" ? "Allowed (always)" : "Denied";
	const accentColor = params.decision === "deny" ? "#ED4245" : params.decision === "allow-always" ? "#5865F2" : "#57F287";
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: `Exec Approval: ${decisionLabel}`,
		description: params.resolvedBy ? `Resolved by ${params.resolvedBy}` : "Resolved",
		commandPreview,
		commandSecondaryPreview,
		footer: `ID: ${params.request.id}`,
		accentColor
	});
}
function createPluginResolvedContainer(params) {
	const decisionLabel = params.decision === "allow-once" ? "Allowed (once)" : params.decision === "allow-always" ? "Allowed (always)" : "Denied";
	const accentColor = params.decision === "deny" ? "#ED4245" : params.decision === "allow-always" ? "#5865F2" : "#57F287";
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: `Plugin Approval: ${decisionLabel}`,
		description: params.resolvedBy ? `Resolved by ${params.resolvedBy}` : "Resolved",
		commandPreview: formatCommandPreview(params.request.request.title, 700),
		commandSecondaryPreview: formatOptionalCommandPreview(params.request.request.description, 1e3),
		metadataLines: buildPluginApprovalMetadataLines(params.request),
		footer: `ID: ${params.request.id}`,
		accentColor
	});
}
function createExecExpiredContainer(params) {
	const { commandPreview, commandSecondaryPreview } = resolveExecApprovalPreviews(params.request.request, 500, 300);
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Exec Approval: Expired",
		description: "This approval request has expired.",
		commandPreview,
		commandSecondaryPreview,
		footer: `ID: ${params.request.id}`,
		accentColor: "#99AAB5"
	});
}
function createPluginExpiredContainer(params) {
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Plugin Approval: Expired",
		description: "This approval request has expired.",
		commandPreview: formatCommandPreview(params.request.request.title, 700),
		commandSecondaryPreview: formatOptionalCommandPreview(params.request.request.description, 1e3),
		metadataLines: buildPluginApprovalMetadataLines(params.request),
		footer: `ID: ${params.request.id}`,
		accentColor: "#99AAB5"
	});
}
var DiscordExecApprovalHandler = class {
	constructor(opts) {
		this.opts = opts;
		this.runtime = createChannelNativeApprovalRuntime({
			label: "discord/exec-approvals",
			clientDisplayName: "Discord Exec Approvals",
			cfg: this.opts.cfg,
			accountId: this.opts.accountId,
			gatewayUrl: this.opts.gatewayUrl,
			eventKinds: ["exec", "plugin"],
			nativeAdapter: createDiscordApprovalCapability(this.opts.config).native,
			isConfigured: () => isDiscordExecApprovalClientEnabled({
				cfg: this.opts.cfg,
				accountId: this.opts.accountId,
				configOverride: this.opts.config
			}),
			shouldHandle: (request) => this.shouldHandle(request),
			buildPendingContent: ({ request }) => {
				const actionRow = createApprovalActionRow(request);
				return { body: stripUndefinedFields(serializePayload(buildExecApprovalPayload(isPluginApprovalRequest(request) ? createPluginApprovalRequestContainer({
					request,
					cfg: this.opts.cfg,
					accountId: this.opts.accountId,
					actionRow
				}) : createExecApprovalRequestContainer({
					request,
					cfg: this.opts.cfg,
					accountId: this.opts.accountId,
					actionRow
				})))) };
			},
			sendOriginNotice: async ({ originTarget }) => {
				const { rest, request: discordRequest } = createDiscordClient({
					token: this.opts.token,
					accountId: this.opts.accountId
				}, this.opts.cfg);
				await discordRequest(() => rest.post(Routes$1.channelMessages(originTarget.to), { body: buildDiscordApprovalDmRedirectNotice() }), "send-approval-dm-redirect-notice");
			},
			prepareTarget: async ({ plannedTarget }) => {
				const { rest, request: discordRequest } = createDiscordClient({
					token: this.opts.token,
					accountId: this.opts.accountId
				}, this.opts.cfg);
				if (plannedTarget.surface === "origin") return {
					dedupeKey: plannedTarget.target.to,
					target: { discordChannelId: plannedTarget.target.to }
				};
				const userId = plannedTarget.target.to;
				const dmChannel = await discordRequest(() => rest.post(Routes$1.userChannels(), { body: { recipient_id: userId } }), "dm-channel");
				if (!dmChannel?.id) {
					logError(`discord exec approvals: failed to create DM for user ${userId}`);
					return null;
				}
				return {
					dedupeKey: dmChannel.id,
					target: {
						discordChannelId: dmChannel.id,
						recipientUserId: userId
					}
				};
			},
			deliverTarget: async ({ plannedTarget, preparedTarget, pendingContent, request }) => {
				const { rest, request: discordRequest } = createDiscordClient({
					token: this.opts.token,
					accountId: this.opts.accountId
				}, this.opts.cfg);
				const message = await discordRequest(() => rest.post(Routes$1.channelMessages(preparedTarget.discordChannelId), { body: pendingContent.body }), plannedTarget.surface === "origin" ? "send-approval-channel" : "send-approval");
				if (!message?.id) {
					if (plannedTarget.surface === "origin") logError("discord exec approvals: failed to send to channel");
					else if (preparedTarget.recipientUserId) logError(`discord exec approvals: failed to send message to user ${preparedTarget.recipientUserId}`);
					return null;
				}
				return {
					discordMessageId: message.id,
					discordChannelId: preparedTarget.discordChannelId
				};
			},
			onOriginNoticeError: ({ error }) => {
				logError(`discord exec approvals: failed to send DM redirect notice: ${String(error)}`);
			},
			onDuplicateSkipped: ({ preparedTarget, request }) => {
				logDebug(`discord exec approvals: skipping duplicate approval ${request.id} for channel ${preparedTarget.dedupeKey}`);
			},
			onDelivered: ({ plannedTarget, preparedTarget, request }) => {
				if (plannedTarget.surface === "origin") {
					logDebug(`discord exec approvals: sent approval ${request.id} to channel ${preparedTarget.target.discordChannelId}`);
					return;
				}
				logDebug(`discord exec approvals: sent approval ${request.id} to user ${plannedTarget.target.to}`);
			},
			onDeliveryError: ({ error, plannedTarget }) => {
				if (plannedTarget.surface === "origin") {
					logError(`discord exec approvals: failed to send to channel: ${String(error)}`);
					return;
				}
				logError(`discord exec approvals: failed to notify user ${plannedTarget.target.to}: ${String(error)}`);
			},
			finalizeResolved: async ({ request, resolved, entries }) => {
				await this.finalizeResolved(request, resolved, entries);
			},
			finalizeExpired: async ({ request, entries }) => {
				await this.finalizeExpired(request, entries);
			}
		});
	}
	shouldHandle(request) {
		return shouldHandleDiscordApprovalRequest({
			cfg: this.opts.cfg,
			accountId: this.opts.accountId,
			request,
			configOverride: this.opts.config
		});
	}
	async start() {
		await this.runtime.start();
	}
	async stop() {
		await this.runtime.stop();
	}
	async handleApprovalRequested(request) {
		await this.runtime.handleRequested(request);
	}
	async handleApprovalResolved(resolved) {
		await this.runtime.handleResolved(resolved);
	}
	async handleApprovalTimeout(approvalId, _source) {
		await this.runtime.handleExpired(approvalId);
	}
	async finalizeResolved(request, resolved, entries) {
		const container = isPluginApprovalRequest(request) ? createPluginResolvedContainer({
			request,
			decision: resolved.decision,
			resolvedBy: resolved.resolvedBy,
			cfg: this.opts.cfg,
			accountId: this.opts.accountId
		}) : createExecResolvedContainer({
			request,
			decision: resolved.decision,
			resolvedBy: resolved.resolvedBy,
			cfg: this.opts.cfg,
			accountId: this.opts.accountId
		});
		for (const pending of entries) await this.finalizeMessage(pending.discordChannelId, pending.discordMessageId, container);
	}
	async finalizeExpired(request, entries) {
		const container = isPluginApprovalRequest(request) ? createPluginExpiredContainer({
			request,
			cfg: this.opts.cfg,
			accountId: this.opts.accountId
		}) : createExecExpiredContainer({
			request,
			cfg: this.opts.cfg,
			accountId: this.opts.accountId
		});
		for (const pending of entries) await this.finalizeMessage(pending.discordChannelId, pending.discordMessageId, container);
	}
	async finalizeMessage(channelId, messageId, container) {
		if (!this.opts.config.cleanupAfterResolve) {
			await this.updateMessage(channelId, messageId, container);
			return;
		}
		try {
			const { rest, request: discordRequest } = createDiscordClient({
				token: this.opts.token,
				accountId: this.opts.accountId
			}, this.opts.cfg);
			await discordRequest(() => rest.delete(Routes$1.channelMessage(channelId, messageId)), "delete-approval");
		} catch (err) {
			logError(`discord exec approvals: failed to delete message: ${String(err)}`);
			await this.updateMessage(channelId, messageId, container);
		}
	}
	async updateMessage(channelId, messageId, container) {
		try {
			const { rest, request: discordRequest } = createDiscordClient({
				token: this.opts.token,
				accountId: this.opts.accountId
			}, this.opts.cfg);
			const payload = buildExecApprovalPayload(container);
			await discordRequest(() => rest.patch(Routes$1.channelMessage(channelId, messageId), { body: stripUndefinedFields(serializePayload(payload)) }), "update-approval");
		} catch (err) {
			logError(`discord exec approvals: failed to update message: ${String(err)}`);
		}
	}
	async resolveApproval(approvalId, decision) {
		const method = resolveApprovalKindFromId(approvalId) === "plugin" ? "plugin.approval.resolve" : "exec.approval.resolve";
		logDebug(`discord exec approvals: resolving ${approvalId} with ${decision} via ${method}`);
		try {
			await this.runtime.request(method, {
				id: approvalId,
				decision
			});
			logDebug(`discord exec approvals: resolved ${approvalId} successfully`);
			return true;
		} catch (err) {
			logError(`discord exec approvals: resolve failed: ${String(err)}`);
			return false;
		}
	}
	/** Return the list of configured approver IDs. */
	getApprovers() {
		return getDiscordExecApprovalApprovers({
			cfg: this.opts.cfg,
			accountId: this.opts.accountId,
			configOverride: this.opts.config
		});
	}
};
var ExecApprovalButton = class extends Button {
	constructor(ctx) {
		super();
		this.label = "execapproval";
		this.customId = `${EXEC_APPROVAL_KEY}:seed=1`;
		this.style = ButtonStyle$1.Primary;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		const parsed = parseExecApprovalData(data);
		if (!parsed) {
			try {
				await interaction.reply({
					content: "This approval is no longer valid.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const approvers = this.ctx.handler.getApprovers();
		const userId = interaction.userId;
		if (!approvers.some((id) => String(id) === userId)) {
			try {
				await interaction.reply({
					content: "⛔ You are not authorized to approve exec requests.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const decisionLabel = parsed.action === "allow-once" ? "Allowed (once)" : parsed.action === "allow-always" ? "Allowed (always)" : "Denied";
		try {
			await interaction.acknowledge();
		} catch {}
		if (!await this.ctx.handler.resolveApproval(parsed.approvalId, parsed.action)) try {
			await interaction.followUp({
				content: `Failed to submit approval decision for **${decisionLabel}**. The request may have expired or already been resolved.`,
				ephemeral: true
			});
		} catch {}
	}
};
function createExecApprovalButton(ctx) {
	return new ExecApprovalButton(ctx);
}
//#endregion
//#region extensions/discord/src/monitor/gateway-plugin.ts
const DISCORD_GATEWAY_BOT_URL = "https://discord.com/api/v10/gateway/bot";
const DEFAULT_DISCORD_GATEWAY_URL = "wss://gateway.discord.gg/";
const DISCORD_GATEWAY_INFO_TIMEOUT_MS = 1e4;
function resolveDiscordGatewayIntents(intentsConfig) {
	let intents = GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent | GatewayIntents.DirectMessages | GatewayIntents.GuildMessageReactions | GatewayIntents.DirectMessageReactions | GatewayIntents.GuildVoiceStates;
	if (intentsConfig?.presence) intents |= GatewayIntents.GuildPresences;
	if (intentsConfig?.guildMembers) intents |= GatewayIntents.GuildMembers;
	return intents;
}
function summarizeGatewayResponseBody(body) {
	const normalized = body.trim().replace(/\s+/g, " ");
	if (!normalized) return "<empty>";
	return normalized.slice(0, 240);
}
function isTransientDiscordGatewayResponse(status, body) {
	if (status >= 500) return true;
	const normalized = body.toLowerCase();
	return normalized.includes("upstream connect error") || normalized.includes("disconnect/reset before headers") || normalized.includes("reset reason:");
}
function createGatewayMetadataError(params) {
	const error = new Error(params.transient ? "Failed to get gateway information from Discord: fetch failed" : `Failed to get gateway information from Discord: ${params.detail}`, { cause: params.cause ?? (params.transient ? new Error(params.detail) : void 0) });
	Object.defineProperty(error, "transient", {
		value: params.transient,
		enumerable: false
	});
	return error;
}
function isTransientGatewayMetadataError(error) {
	return Boolean(error?.transient);
}
function createDefaultGatewayInfo() {
	return {
		url: DEFAULT_DISCORD_GATEWAY_URL,
		shards: 1,
		session_start_limit: {
			total: 1,
			remaining: 1,
			reset_after: 0,
			max_concurrency: 1
		}
	};
}
async function fetchDiscordGatewayInfo(params) {
	let response;
	try {
		response = await params.fetchImpl(DISCORD_GATEWAY_BOT_URL, {
			...params.fetchInit,
			headers: {
				...params.fetchInit?.headers,
				Authorization: `Bot ${params.token}`
			}
		});
	} catch (error) {
		throw createGatewayMetadataError({
			detail: error instanceof Error ? error.message : String(error),
			transient: true,
			cause: error
		});
	}
	let body;
	try {
		body = await response.text();
	} catch (error) {
		throw createGatewayMetadataError({
			detail: error instanceof Error ? error.message : String(error),
			transient: true,
			cause: error
		});
	}
	const summary = summarizeGatewayResponseBody(body);
	const transient = isTransientDiscordGatewayResponse(response.status, body);
	if (!response.ok) throw createGatewayMetadataError({
		detail: `Discord API /gateway/bot failed (${response.status}): ${summary}`,
		transient
	});
	try {
		const parsed = JSON.parse(body);
		return {
			...parsed,
			url: typeof parsed.url === "string" && parsed.url.trim() ? parsed.url : DEFAULT_DISCORD_GATEWAY_URL
		};
	} catch (error) {
		throw createGatewayMetadataError({
			detail: `Discord API /gateway/bot returned invalid JSON: ${summary}`,
			transient,
			cause: error
		});
	}
}
async function fetchDiscordGatewayInfoWithTimeout(params) {
	const timeoutMs = Math.max(1, params.timeoutMs ?? DISCORD_GATEWAY_INFO_TIMEOUT_MS);
	const abortController = new AbortController();
	let timeoutId;
	const timeoutPromise = new Promise((_, reject) => {
		timeoutId = setTimeout(() => {
			abortController.abort();
			reject(createGatewayMetadataError({
				detail: `Discord API /gateway/bot timed out after ${timeoutMs}ms`,
				transient: true,
				cause: /* @__PURE__ */ new Error("gateway metadata timeout")
			}));
		}, timeoutMs);
		timeoutId.unref?.();
	});
	try {
		return await Promise.race([fetchDiscordGatewayInfo({
			token: params.token,
			fetchImpl: params.fetchImpl,
			fetchInit: {
				...params.fetchInit,
				signal: abortController.signal
			}
		}), timeoutPromise]);
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
	}
}
function resolveGatewayInfoWithFallback(params) {
	if (!isTransientGatewayMetadataError(params.error)) throw params.error;
	const message = params.error instanceof Error ? params.error.message : String(params.error);
	params.runtime?.log?.(`discord: gateway metadata lookup failed transiently; using default gateway url (${message})`);
	return {
		info: createDefaultGatewayInfo(),
		usedFallback: true
	};
}
function createGatewayPlugin(params) {
	class SafeGatewayPlugin extends GatewayPlugin {
		constructor() {
			super(params.options);
			this.gatewayInfoUsedFallback = false;
		}
		async registerClient(client) {
			if (!this.gatewayInfo || this.gatewayInfoUsedFallback) {
				const resolved = await fetchDiscordGatewayInfoWithTimeout({
					token: client.options.token,
					fetchImpl: params.fetchImpl,
					fetchInit: params.fetchInit
				}).then((info) => ({
					info,
					usedFallback: false
				})).catch((error) => resolveGatewayInfoWithFallback({
					runtime: params.runtime,
					error
				}));
				this.gatewayInfo = resolved.info;
				this.gatewayInfoUsedFallback = resolved.usedFallback;
			}
			if (params.testing?.registerClient) {
				await params.testing.registerClient(this, client);
				return;
			}
			return super.registerClient(client);
		}
		createWebSocket(url) {
			if (!params.wsAgent) return super.createWebSocket(url);
			return new (params.testing?.webSocketCtor ?? ws.default)(url, { agent: params.wsAgent });
		}
	}
	return new SafeGatewayPlugin();
}
function createDiscordGatewayPlugin(params) {
	const intents = resolveDiscordGatewayIntents(params.discordConfig?.intents);
	const proxy = params.discordConfig?.proxy?.trim();
	const options = {
		reconnect: { maxAttempts: 50 },
		intents,
		autoInteractions: true
	};
	if (!proxy) return createGatewayPlugin({
		options,
		fetchImpl: (input, init) => fetch(input, init),
		runtime: params.runtime,
		testing: params.__testing ? {
			registerClient: params.__testing.registerClient,
			webSocketCtor: params.__testing.webSocketCtor
		} : void 0
	});
	try {
		const HttpsProxyAgentCtor = params.__testing?.HttpsProxyAgentCtor ?? httpsProxyAgent.HttpsProxyAgent;
		const ProxyAgentCtor = params.__testing?.ProxyAgentCtor ?? undici.ProxyAgent;
		const wsAgent = new HttpsProxyAgentCtor(proxy);
		const fetchAgent = new ProxyAgentCtor(proxy);
		params.runtime.log?.("discord: gateway proxy enabled");
		return createGatewayPlugin({
			options,
			fetchImpl: (input, init) => (params.__testing?.undiciFetch ?? undici.fetch)(input, init),
			fetchInit: { dispatcher: fetchAgent },
			wsAgent,
			runtime: params.runtime,
			testing: params.__testing ? {
				registerClient: params.__testing.registerClient,
				webSocketCtor: params.__testing.webSocketCtor
			} : void 0
		});
	} catch (err) {
		params.runtime.error?.(danger(`discord: invalid gateway proxy: ${String(err)}`));
		return createGatewayPlugin({
			options,
			fetchImpl: (input, init) => fetch(input, init),
			runtime: params.runtime,
			testing: params.__testing ? {
				registerClient: params.__testing.registerClient,
				webSocketCtor: params.__testing.webSocketCtor
			} : void 0
		});
	}
}
//#endregion
//#region extensions/discord/src/monitor.gateway.ts
function getDiscordGatewayEmitter(gateway) {
	return gateway?.emitter;
}
async function waitForDiscordGatewayStop(params) {
	const { gateway, abortSignal } = params;
	return await new Promise((resolve, reject) => {
		let settled = false;
		const cleanup = () => {
			abortSignal?.removeEventListener("abort", onAbort);
			params.gatewaySupervisor?.detachLifecycle();
		};
		const finishResolve = () => {
			if (settled) return;
			settled = true;
			try {
				gateway?.disconnect?.();
			} finally {
				cleanup();
				resolve();
			}
		};
		const finishReject = (err) => {
			if (settled) return;
			settled = true;
			try {
				gateway?.disconnect?.();
			} finally {
				cleanup();
				reject(err);
			}
		};
		const onAbort = () => {
			finishResolve();
		};
		const onGatewayEvent = (event) => {
			if ((params.onGatewayEvent?.(event) ?? "stop") === "stop") finishReject(event.err);
		};
		const onForceStop = (err) => {
			finishReject(err);
		};
		if (abortSignal?.aborted) {
			onAbort();
			return;
		}
		abortSignal?.addEventListener("abort", onAbort, { once: true });
		params.gatewaySupervisor?.attachLifecycle(onGatewayEvent);
		params.registerForceStop?.(onForceStop);
	});
}
//#endregion
//#region extensions/discord/src/monitor/gateway-supervisor.ts
function classifyDiscordGatewayEvent(params) {
	const message = String(params.err);
	if (params.isDisallowedIntentsError(params.err)) return {
		type: "disallowed-intents",
		err: params.err,
		message,
		shouldStopLifecycle: true
	};
	if (message.includes("Max reconnect attempts")) return {
		type: "reconnect-exhausted",
		err: params.err,
		message,
		shouldStopLifecycle: true
	};
	if (message.includes("Fatal Gateway error")) return {
		type: "fatal",
		err: params.err,
		message,
		shouldStopLifecycle: true
	};
	return {
		type: "other",
		err: params.err,
		message,
		shouldStopLifecycle: false
	};
}
function createDiscordGatewaySupervisor(params) {
	const emitter = getDiscordGatewayEmitter(params.gateway);
	const pending = [];
	if (!emitter) return {
		attachLifecycle: () => {},
		detachLifecycle: () => {},
		drainPending: () => "continue",
		dispose: () => {},
		emitter
	};
	let lifecycleHandler;
	let phase = "buffering";
	const logLateEvent = (state) => (event) => {
		params.runtime.error?.(danger(`discord: suppressed late gateway ${event.type} error ${state === "disposed" ? "after dispose" : "during teardown"}: ${event.message}`));
	};
	const onGatewayError = (err) => {
		const event = classifyDiscordGatewayEvent({
			err,
			isDisallowedIntentsError: params.isDisallowedIntentsError
		});
		switch (phase) {
			case "disposed":
				logLateEvent("disposed")(event);
				return;
			case "active":
				lifecycleHandler?.(event);
				return;
			case "teardown":
				logLateEvent("teardown")(event);
				return;
			case "buffering":
				pending.push(event);
				return;
		}
	};
	emitter.on("error", onGatewayError);
	return {
		emitter,
		attachLifecycle: (handler) => {
			lifecycleHandler = handler;
			phase = "active";
		},
		detachLifecycle: () => {
			lifecycleHandler = void 0;
			phase = "teardown";
		},
		drainPending: (handler) => {
			if (pending.length === 0) return "continue";
			const queued = [...pending];
			pending.length = 0;
			for (const event of queued) if (handler(event) === "stop") return "stop";
			return "continue";
		},
		dispose: () => {
			if (phase === "disposed") return;
			lifecycleHandler = void 0;
			phase = "disposed";
			pending.length = 0;
		}
	};
}
//#endregion
//#region extensions/discord/src/monitor/thread-session-close.ts
/**
* Marks every session entry in the store whose key contains {@link threadId}
* as "reset" by setting `updatedAt` to 0.
*
* This mirrors how the daily / idle session reset works: zeroing `updatedAt`
* makes `evaluateSessionFreshness` treat the session as stale on the next
* inbound message, so the bot starts a fresh conversation without deleting
* any on-disk transcript history.
*/
async function closeDiscordThreadSessions(params) {
	const { cfg, accountId, threadId } = params;
	const normalizedThreadId = threadId.trim().toLowerCase();
	if (!normalizedThreadId) return 0;
	const segmentRe = new RegExp(`:${normalizedThreadId}(?::|$)`, "i");
	function sessionKeyContainsThreadId(key) {
		return segmentRe.test(key);
	}
	const storePath = resolveStorePath(cfg.session?.store, { agentId: accountId });
	let resetCount = 0;
	await updateSessionStore(storePath, (store) => {
		for (const [key, entry] of Object.entries(store)) {
			if (!entry || !sessionKeyContainsThreadId(key)) continue;
			if (entry.updatedAt === 0) continue;
			entry.updatedAt = 0;
			resetCount += 1;
		}
		return resetCount;
	});
	return resetCount;
}
//#endregion
//#region extensions/discord/src/monitor/listeners.ts
const DISCORD_SLOW_LISTENER_THRESHOLD_MS = 3e4;
const discordEventQueueLog = createSubsystemLogger("discord/event-queue");
function formatListenerContextValue(value) {
	if (value === void 0 || value === null) return null;
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	}
	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
	return null;
}
function formatListenerContextSuffix(context) {
	if (!context) return "";
	const entries = Object.entries(context).flatMap(([key, value]) => {
		const formatted = formatListenerContextValue(value);
		return formatted ? [`${key}=${formatted}`] : [];
	});
	if (entries.length === 0) return "";
	return ` (${entries.join(" ")})`;
}
function logSlowDiscordListener(params) {
	if (params.durationMs < DISCORD_SLOW_LISTENER_THRESHOLD_MS) return;
	const duration = formatDurationSeconds(params.durationMs, {
		decimals: 1,
		unit: "seconds"
	});
	const message = `Slow listener detected: ${params.listener} took ${duration} for event ${params.event}`;
	(params.logger ?? discordEventQueueLog).warn("Slow listener detected", {
		listener: params.listener,
		event: params.event,
		durationMs: params.durationMs,
		duration,
		...params.context,
		consoleMessage: `${message}${formatListenerContextSuffix(params.context)}`
	});
}
async function runDiscordListenerWithSlowLog(params) {
	const startedAt = Date.now();
	const timeoutMs = normalizeDiscordListenerTimeoutMs(params.timeoutMs);
	const logger = params.logger ?? discordEventQueueLog;
	let timedOut = false;
	try {
		timedOut = await runDiscordTaskWithTimeout({
			run: params.run,
			timeoutMs,
			onTimeout: (resolvedTimeoutMs) => {
				logger.error(danger(`discord handler timed out after ${formatDurationSeconds(resolvedTimeoutMs, {
					decimals: 1,
					unit: "seconds"
				})}${formatListenerContextSuffix(params.context)}`));
			},
			onAbortAfterTimeout: () => {
				logger.warn(`discord handler canceled after timeout${formatListenerContextSuffix(params.context)}`);
			},
			onErrorAfterTimeout: (err) => {
				logger.error(danger(`discord handler failed after timeout: ${String(err)}${formatListenerContextSuffix(params.context)}`));
			}
		});
		if (timedOut) return;
	} catch (err) {
		if (params.onError) {
			params.onError(err);
			return;
		}
		throw err;
	} finally {
		if (!timedOut) logSlowDiscordListener({
			logger: params.logger,
			listener: params.listener,
			event: params.event,
			durationMs: Date.now() - startedAt,
			context: params.context
		});
	}
}
function registerDiscordListener(listeners, listener) {
	if (listeners.some((existing) => existing.constructor === listener.constructor)) return false;
	listeners.push(listener);
	return true;
}
var DiscordMessageListener = class extends MessageCreateListener {
	constructor(handler, logger, onEvent, _options) {
		super();
		this.handler = handler;
		this.logger = logger;
		this.onEvent = onEvent;
	}
	async handle(data, client) {
		this.onEvent?.();
		Promise.resolve().then(() => this.handler(data, client)).catch((err) => {
			(this.logger ?? discordEventQueueLog).error(danger(`discord handler failed: ${String(err)}`));
		});
	}
};
var DiscordReactionListener = class extends MessageReactionAddListener {
	constructor(params) {
		super();
		this.params = params;
	}
	async handle(data, client) {
		this.params.onEvent?.();
		await runDiscordReactionHandler({
			data,
			client,
			action: "added",
			handlerParams: this.params,
			listener: this.constructor.name,
			event: this.type
		});
	}
};
var DiscordReactionRemoveListener = class extends MessageReactionRemoveListener {
	constructor(params) {
		super();
		this.params = params;
	}
	async handle(data, client) {
		this.params.onEvent?.();
		await runDiscordReactionHandler({
			data,
			client,
			action: "removed",
			handlerParams: this.params,
			listener: this.constructor.name,
			event: this.type
		});
	}
};
async function runDiscordReactionHandler(params) {
	await runDiscordListenerWithSlowLog({
		logger: params.handlerParams.logger,
		listener: params.listener,
		event: params.event,
		run: async () => handleDiscordReactionEvent({
			data: params.data,
			client: params.client,
			action: params.action,
			cfg: params.handlerParams.cfg,
			accountId: params.handlerParams.accountId,
			botUserId: params.handlerParams.botUserId,
			dmEnabled: params.handlerParams.dmEnabled,
			groupDmEnabled: params.handlerParams.groupDmEnabled,
			groupDmChannels: params.handlerParams.groupDmChannels,
			dmPolicy: params.handlerParams.dmPolicy,
			allowFrom: params.handlerParams.allowFrom,
			groupPolicy: params.handlerParams.groupPolicy,
			allowNameMatching: params.handlerParams.allowNameMatching,
			guildEntries: params.handlerParams.guildEntries,
			logger: params.handlerParams.logger
		})
	});
}
async function authorizeDiscordReactionIngress(params) {
	if (params.isDirectMessage && !params.dmEnabled) return {
		allowed: false,
		reason: "dm-disabled"
	};
	if (params.isGroupDm && !params.groupDmEnabled) return {
		allowed: false,
		reason: "group-dm-disabled"
	};
	if (params.isDirectMessage) {
		const storeAllowFrom = await readStoreAllowFromForDmPolicy({
			provider: "discord",
			accountId: params.accountId,
			dmPolicy: params.dmPolicy
		});
		const access = resolveDmGroupAccessWithLists({
			isGroup: false,
			dmPolicy: params.dmPolicy,
			groupPolicy: params.groupPolicy,
			allowFrom: params.allowFrom,
			groupAllowFrom: [],
			storeAllowFrom,
			isSenderAllowed: (allowEntries) => {
				const allowList = normalizeDiscordAllowList(allowEntries, [
					"discord:",
					"user:",
					"pk:"
				]);
				return (allowList ? resolveDiscordAllowListMatch({
					allowList,
					candidate: {
						id: params.user.id,
						name: params.user.username,
						tag: formatDiscordUserTag(params.user)
					},
					allowNameMatching: params.allowNameMatching
				}) : { allowed: false }).allowed;
			}
		});
		if (access.decision !== "allow") return {
			allowed: false,
			reason: access.reason
		};
	}
	if (params.isGroupDm && !resolveGroupDmAllow({
		channels: params.groupDmChannels,
		channelId: params.channelId,
		channelName: params.channelName,
		channelSlug: params.channelSlug
	})) return {
		allowed: false,
		reason: "group-dm-not-allowlisted"
	};
	if (!params.isGuildMessage) return { allowed: true };
	const channelAllowlistConfigured = Boolean(params.guildInfo?.channels) && Object.keys(params.guildInfo?.channels ?? {}).length > 0;
	const channelAllowed = params.channelConfig?.allowed !== false;
	if (!isDiscordGroupAllowedByPolicy({
		groupPolicy: params.groupPolicy,
		guildAllowlisted: Boolean(params.guildInfo),
		channelAllowlistConfigured,
		channelAllowed
	})) return {
		allowed: false,
		reason: "guild-policy"
	};
	if (params.channelConfig?.allowed === false) return {
		allowed: false,
		reason: "guild-channel-denied"
	};
	const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
		channelConfig: params.channelConfig,
		guildInfo: params.guildInfo,
		memberRoleIds: params.memberRoleIds,
		sender: {
			id: params.user.id,
			name: params.user.username,
			tag: formatDiscordUserTag(params.user)
		},
		allowNameMatching: params.allowNameMatching
	});
	if (hasAccessRestrictions && !memberAllowed) return {
		allowed: false,
		reason: "guild-member-denied"
	};
	return { allowed: true };
}
async function handleDiscordReactionEvent(params) {
	try {
		const { data, client, action, botUserId, guildEntries } = params;
		if (!("user" in data)) return;
		const user = data.user;
		if (!user || user.bot) return;
		if (botUserId && user.id === botUserId) return;
		const isGuildMessage = Boolean(data.guild_id);
		const guildInfo = isGuildMessage ? resolveDiscordGuildEntry({
			guild: data.guild ?? void 0,
			guildId: data.guild_id ?? void 0,
			guildEntries
		}) : null;
		if (isGuildMessage && guildEntries && Object.keys(guildEntries).length > 0 && !guildInfo) return;
		const channel = await client.fetchChannel(data.channel_id);
		if (!channel) return;
		const channelName = "name" in channel ? channel.name ?? void 0 : void 0;
		const channelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
		const channelType = "type" in channel ? channel.type : void 0;
		const isDirectMessage = channelType === ChannelType.DM;
		const isGroupDm = channelType === ChannelType.GroupDM;
		const isThreadChannel = channelType === ChannelType.PublicThread || channelType === ChannelType.PrivateThread || channelType === ChannelType.AnnouncementThread;
		const memberRoleIds = Array.isArray(data.rawMember?.roles) ? data.rawMember.roles.map((roleId) => String(roleId)) : [];
		const reactionIngressBase = {
			accountId: params.accountId,
			user,
			memberRoleIds,
			isDirectMessage,
			isGroupDm,
			isGuildMessage,
			channelId: data.channel_id,
			channelName,
			channelSlug,
			dmEnabled: params.dmEnabled,
			groupDmEnabled: params.groupDmEnabled,
			groupDmChannels: params.groupDmChannels,
			dmPolicy: params.dmPolicy,
			allowFrom: params.allowFrom,
			groupPolicy: params.groupPolicy,
			allowNameMatching: params.allowNameMatching,
			guildInfo
		};
		if (!isGuildMessage) {
			const ingressAccess = await authorizeDiscordReactionIngress(reactionIngressBase);
			if (!ingressAccess.allowed) {
				logVerbose(`discord reaction blocked sender=${user.id} (reason=${ingressAccess.reason})`);
				return;
			}
		}
		let parentId = "parentId" in channel ? channel.parentId ?? void 0 : void 0;
		let parentName;
		let parentSlug = "";
		let reactionBase = null;
		const resolveReactionBase = () => {
			if (reactionBase) return reactionBase;
			const emojiLabel = formatDiscordReactionEmoji(data.emoji);
			reactionBase = {
				baseText: `Discord reaction ${action}: ${emojiLabel} by ${formatDiscordUserTag(user)} on ${guildInfo?.slug || (data.guild?.name ? normalizeDiscordSlug(data.guild.name) : data.guild_id ?? (isGroupDm ? "group-dm" : "dm"))} ${channelSlug ? `#${channelSlug}` : channelName ? `#${normalizeDiscordSlug(channelName)}` : `#${data.channel_id}`} msg ${data.message_id}`,
				contextKey: `discord:reaction:${action}:${data.message_id}:${user.id}:${emojiLabel}`
			};
			return reactionBase;
		};
		const emitReaction = (text, parentPeerId) => {
			const { contextKey } = resolveReactionBase();
			enqueueSystemEvent(text, {
				sessionKey: resolveAgentRoute({
					cfg: params.cfg,
					channel: "discord",
					accountId: params.accountId,
					guildId: data.guild_id ?? void 0,
					memberRoleIds,
					peer: {
						kind: isDirectMessage ? "direct" : isGroupDm ? "group" : "channel",
						id: isDirectMessage ? user.id : data.channel_id
					},
					parentPeer: parentPeerId ? {
						kind: "channel",
						id: parentPeerId
					} : void 0
				}).sessionKey,
				contextKey
			});
		};
		const shouldNotifyReaction = (options) => shouldEmitDiscordReactionNotification({
			mode: options.mode,
			botId: botUserId,
			messageAuthorId: options.messageAuthorId,
			userId: user.id,
			userName: user.username,
			userTag: formatDiscordUserTag(user),
			channelConfig: options.channelConfig,
			guildInfo,
			memberRoleIds,
			allowNameMatching: params.allowNameMatching
		});
		const emitReactionWithAuthor = (message) => {
			const { baseText } = resolveReactionBase();
			const authorLabel = message?.author ? formatDiscordUserTag(message.author) : void 0;
			emitReaction(authorLabel ? `${baseText} from ${authorLabel}` : baseText, parentId);
		};
		const loadThreadParentInfo = async () => {
			if (!parentId) return;
			parentName = (await resolveDiscordChannelInfo(client, parentId))?.name;
			parentSlug = parentName ? normalizeDiscordSlug(parentName) : "";
		};
		const resolveThreadChannelConfig = () => resolveDiscordChannelConfigWithFallback({
			guildInfo,
			channelId: data.channel_id,
			channelName,
			channelSlug,
			parentId,
			parentName,
			parentSlug,
			scope: "thread"
		});
		const authorizeReactionIngressForChannel = async (channelConfig) => await authorizeDiscordReactionIngress({
			...reactionIngressBase,
			channelConfig
		});
		const resolveThreadChannelAccess = async (channelInfo) => {
			parentId = channelInfo?.parentId;
			await loadThreadParentInfo();
			const channelConfig = resolveThreadChannelConfig();
			return {
				access: await authorizeReactionIngressForChannel(channelConfig),
				channelConfig
			};
		};
		if (isThreadChannel) {
			const reactionMode = guildInfo?.reactionNotifications ?? "own";
			if (reactionMode === "off") return;
			const channelInfoPromise = parentId ? Promise.resolve({ parentId }) : resolveDiscordChannelInfo(client, data.channel_id);
			if (reactionMode === "all" || reactionMode === "allowlist") {
				const { access: threadAccess, channelConfig: threadChannelConfig } = await resolveThreadChannelAccess(await channelInfoPromise);
				if (!threadAccess.allowed) return;
				if (!shouldNotifyReaction({
					mode: reactionMode,
					channelConfig: threadChannelConfig
				})) return;
				const { baseText } = resolveReactionBase();
				emitReaction(baseText, parentId);
				return;
			}
			const messagePromise = data.message.fetch().catch(() => null);
			const [channelInfo, message] = await Promise.all([channelInfoPromise, messagePromise]);
			const { access: threadAccess, channelConfig: threadChannelConfig } = await resolveThreadChannelAccess(channelInfo);
			if (!threadAccess.allowed) return;
			if (!shouldNotifyReaction({
				mode: reactionMode,
				messageAuthorId: message?.author?.id ?? void 0,
				channelConfig: threadChannelConfig
			})) return;
			emitReactionWithAuthor(message);
			return;
		}
		const channelConfig = resolveDiscordChannelConfigWithFallback({
			guildInfo,
			channelId: data.channel_id,
			channelName,
			channelSlug,
			parentId,
			parentName,
			parentSlug,
			scope: "channel"
		});
		if (isGuildMessage) {
			if (!(await authorizeReactionIngressForChannel(channelConfig)).allowed) return;
		}
		const reactionMode = guildInfo?.reactionNotifications ?? "own";
		if (reactionMode === "off") return;
		if (reactionMode === "all" || reactionMode === "allowlist") {
			if (!shouldNotifyReaction({
				mode: reactionMode,
				channelConfig
			})) return;
			const { baseText } = resolveReactionBase();
			emitReaction(baseText, parentId);
			return;
		}
		const message = await data.message.fetch().catch(() => null);
		if (!shouldNotifyReaction({
			mode: reactionMode,
			messageAuthorId: message?.author?.id ?? void 0,
			channelConfig
		})) return;
		emitReactionWithAuthor(message);
	} catch (err) {
		params.logger.error(danger(`discord reaction handler failed: ${String(err)}`));
	}
}
var DiscordPresenceListener = class extends PresenceUpdateListener {
	constructor(params) {
		super();
		this.logger = params.logger;
		this.accountId = params.accountId;
	}
	async handle(data) {
		try {
			const userId = "user" in data && data.user && typeof data.user === "object" && "id" in data.user ? String(data.user.id) : void 0;
			if (!userId) return;
			setPresence(this.accountId, userId, data);
		} catch (err) {
			(this.logger ?? discordEventQueueLog).error(danger(`discord presence handler failed: ${String(err)}`));
		}
	}
};
var DiscordThreadUpdateListener = class extends ThreadUpdateListener {
	constructor(cfg, accountId, logger) {
		super();
		this.cfg = cfg;
		this.accountId = accountId;
		this.logger = logger;
	}
	async handle(data) {
		await runDiscordListenerWithSlowLog({
			logger: this.logger,
			listener: this.constructor.name,
			event: this.type,
			run: async () => {
				if (!isThreadArchived(data)) return;
				const threadId = "id" in data && typeof data.id === "string" ? data.id : void 0;
				if (!threadId) return;
				const logger = this.logger ?? discordEventQueueLog;
				const count = await closeDiscordThreadSessions({
					cfg: this.cfg,
					accountId: this.accountId,
					threadId
				});
				if (count > 0) logger.info("Discord thread archived — reset sessions", {
					threadId,
					count
				});
			},
			onError: (err) => {
				(this.logger ?? discordEventQueueLog).error(danger(`discord thread-update handler failed: ${String(err)}`));
			}
		});
	}
};
//#endregion
//#region extensions/discord/src/monitor/native-command-context.ts
function buildDiscordNativeCommandContext(params) {
	const conversationLabel = params.isDirectMessage ? params.user.globalName ?? params.user.username : params.channelId;
	const { groupSystemPrompt, ownerAllowFrom, untrustedContext } = buildDiscordInboundAccessContext({
		channelConfig: params.channelConfig,
		guildInfo: params.guildInfo,
		sender: params.sender,
		allowNameMatching: params.allowNameMatching,
		isGuild: params.isGuild,
		channelTopic: params.channelTopic
	});
	return finalizeInboundContext({
		Body: params.prompt,
		BodyForAgent: params.prompt,
		RawBody: params.prompt,
		CommandBody: params.prompt,
		CommandArgs: params.commandArgs,
		From: params.isDirectMessage ? `discord:${params.user.id}` : params.isGroupDm ? `discord:group:${params.channelId}` : `discord:channel:${params.channelId}`,
		To: `slash:${params.user.id}`,
		SessionKey: params.sessionKey,
		CommandTargetSessionKey: params.commandTargetSessionKey,
		AccountId: params.accountId ?? void 0,
		ChatType: params.isDirectMessage ? "direct" : params.isGroupDm ? "group" : "channel",
		ConversationLabel: conversationLabel,
		GroupSubject: params.isGuild ? params.guildName : void 0,
		GroupSystemPrompt: groupSystemPrompt,
		UntrustedContext: untrustedContext,
		OwnerAllowFrom: ownerAllowFrom,
		SenderName: params.user.globalName ?? params.user.username,
		SenderId: params.user.id,
		SenderUsername: params.user.username,
		SenderTag: params.sender.tag,
		Provider: "discord",
		Surface: "discord",
		WasMentioned: true,
		MessageSid: params.interactionId,
		MessageThreadId: params.isThreadChannel ? params.channelId : void 0,
		Timestamp: params.timestampMs ?? Date.now(),
		CommandAuthorized: params.commandAuthorized,
		CommandSource: "native",
		OriginatingChannel: "discord",
		OriginatingTo: params.isDirectMessage ? `user:${params.user.id}` : `channel:${params.channelId}`,
		ThreadParentId: params.isThreadChannel ? params.threadParentId : void 0
	});
}
//#endregion
//#region extensions/discord/src/monitor/native-command-route.ts
async function resolveDiscordNativeInteractionRouteState(params) {
	const route = resolveDiscordBoundConversationRoute({
		cfg: params.cfg,
		accountId: params.accountId,
		guildId: params.guildId,
		memberRoleIds: params.memberRoleIds,
		isDirectMessage: params.isDirectMessage,
		isGroupDm: params.isGroupDm,
		directUserId: params.directUserId,
		conversationId: params.conversationId,
		parentConversationId: params.parentConversationId
	});
	const configuredRoute = params.threadBinding == null ? resolveConfiguredBindingRoute({
		cfg: params.cfg,
		route,
		conversation: {
			channel: "discord",
			accountId: params.accountId,
			conversationId: params.conversationId,
			parentConversationId: params.parentConversationId
		}
	}) : null;
	const configuredBinding = configuredRoute?.bindingResolution ?? null;
	const configuredBoundSessionKey = configuredRoute?.boundSessionKey?.trim() || void 0;
	const boundSessionKey = params.threadBinding?.targetSessionKey?.trim() || configuredBoundSessionKey;
	return {
		route,
		effectiveRoute: resolveDiscordEffectiveRoute({
			route,
			boundSessionKey,
			configuredRoute,
			matchedBy: configuredBinding ? "binding.channel" : void 0
		}),
		boundSessionKey,
		configuredRoute,
		configuredBinding,
		bindingReadiness: params.enforceConfiguredBindingReadiness && configuredBinding ? await ensureConfiguredBindingRouteReady({
			cfg: params.cfg,
			bindingResolution: configuredBinding
		}) : null
	};
}
//#endregion
//#region extensions/discord/src/monitor/model-picker-preferences.ts
const MODEL_PICKER_PREFERENCES_LOCK_OPTIONS = {
	retries: {
		retries: 8,
		factor: 2,
		minTimeout: 50,
		maxTimeout: 5e3,
		randomize: true
	},
	stale: 15e3
};
const DEFAULT_RECENT_LIMIT = 5;
function resolvePreferencesStorePath(env = process.env) {
	const stateDir = resolveStateDir(env, os.homedir);
	return path.join(stateDir, "discord", "model-picker-preferences.json");
}
function normalizeId(value) {
	return value?.trim() ?? "";
}
function buildDiscordModelPickerPreferenceKey(scope) {
	const userId = normalizeId(scope.userId);
	if (!userId) return null;
	const accountId = normalizeAccountId(scope.accountId);
	const guildId = normalizeId(scope.guildId);
	if (guildId) return `discord:${accountId}:guild:${guildId}:user:${userId}`;
	return `discord:${accountId}:dm:user:${userId}`;
}
function normalizeModelRef(raw) {
	const value = raw?.trim();
	if (!value) return null;
	const slashIndex = value.indexOf("/");
	if (slashIndex <= 0 || slashIndex >= value.length - 1) return null;
	const provider = normalizeProviderId(value.slice(0, slashIndex));
	const model = value.slice(slashIndex + 1).trim();
	if (!provider || !model) return null;
	return `${provider}/${model}`;
}
function sanitizeRecentModels(models, limit) {
	const deduped = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of models ?? []) {
		const normalized = normalizeModelRef(item);
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		deduped.push(normalized);
		if (deduped.length >= limit) break;
	}
	return deduped;
}
async function readPreferencesStore(filePath) {
	const { value } = await readJsonFileWithFallback(filePath, {
		version: 1,
		entries: {}
	});
	if (!value || typeof value !== "object" || value.version !== 1) return {
		version: 1,
		entries: {}
	};
	return {
		version: 1,
		entries: value.entries && typeof value.entries === "object" ? value.entries : {}
	};
}
async function readDiscordModelPickerRecentModels(params) {
	const key = buildDiscordModelPickerPreferenceKey(params.scope);
	if (!key) return [];
	const limit = Math.max(1, Math.min(params.limit ?? DEFAULT_RECENT_LIMIT, 10));
	const entry = (await readPreferencesStore(resolvePreferencesStorePath(params.env))).entries[key];
	const recent = sanitizeRecentModels(entry?.recent, limit);
	if (!params.allowedModelRefs || params.allowedModelRefs.size === 0) return recent;
	return recent.filter((modelRef) => params.allowedModelRefs?.has(modelRef));
}
async function recordDiscordModelPickerRecentModel(params) {
	const key = buildDiscordModelPickerPreferenceKey(params.scope);
	const normalizedModelRef = normalizeModelRef(params.modelRef);
	if (!key || !normalizedModelRef) return;
	const limit = Math.max(1, Math.min(params.limit ?? DEFAULT_RECENT_LIMIT, 10));
	const filePath = resolvePreferencesStorePath(params.env);
	await withFileLock(filePath, MODEL_PICKER_PREFERENCES_LOCK_OPTIONS, async () => {
		const store = await readPreferencesStore(filePath);
		const next = [normalizedModelRef, ...sanitizeRecentModels(store.entries[key]?.recent, limit).filter((entry) => entry !== normalizedModelRef)].slice(0, limit);
		store.entries[key] = {
			recent: next,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await writeJsonFileAtomically(filePath, store);
	});
}
//#endregion
//#region extensions/discord/src/monitor/model-picker.ts
const DISCORD_MODEL_PICKER_CUSTOM_ID_KEY = "mdlpk";
const DISCORD_PROVIDER_BUTTON_LABEL_MAX_CHARS = 18;
const COMMAND_CONTEXTS = ["model", "models"];
const PICKER_ACTIONS = [
	"open",
	"provider",
	"model",
	"submit",
	"quick",
	"back",
	"reset",
	"cancel",
	"recents"
];
const PICKER_VIEWS = [
	"providers",
	"models",
	"recents"
];
let modelsProviderRuntimePromise;
async function loadModelsProviderRuntime() {
	modelsProviderRuntimePromise ??= import("./plugin-sdk/models-provider-runtime.js");
	return await modelsProviderRuntimePromise;
}
function encodeCustomIdValue(value) {
	return encodeURIComponent(value);
}
function decodeCustomIdValue(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
function isValidCommandContext(value) {
	return COMMAND_CONTEXTS.includes(value);
}
function isValidPickerAction(value) {
	return PICKER_ACTIONS.includes(value);
}
function isValidPickerView(value) {
	return PICKER_VIEWS.includes(value);
}
function normalizePage(value) {
	const numeric = typeof value === "number" ? value : NaN;
	if (!Number.isFinite(numeric)) return 1;
	return Math.max(1, Math.floor(numeric));
}
function parseRawPage(value) {
	if (typeof value === "number") return normalizePage(value);
	if (typeof value === "string" && value.trim()) {
		const parsed = Number.parseInt(value, 10);
		if (Number.isFinite(parsed)) return normalizePage(parsed);
	}
	return 1;
}
function parseRawPositiveInt(value) {
	if (typeof value !== "string" && typeof value !== "number") return;
	const parsed = Number.parseInt(String(value), 10);
	if (!Number.isFinite(parsed) || parsed < 1) return;
	return Math.floor(parsed);
}
function coerceString(value) {
	return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
function clampPageSize(rawPageSize, max, fallback) {
	if (!Number.isFinite(rawPageSize)) return fallback;
	return Math.min(max, Math.max(1, Math.floor(rawPageSize ?? fallback)));
}
function paginateItems(params) {
	const totalItems = params.items.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
	const page = Math.max(1, Math.min(params.page, totalPages));
	const startIndex = (page - 1) * params.pageSize;
	const endIndexExclusive = Math.min(totalItems, startIndex + params.pageSize);
	return {
		items: params.items.slice(startIndex, endIndexExclusive),
		page,
		pageSize: params.pageSize,
		totalPages,
		totalItems,
		hasPrev: page > 1,
		hasNext: page < totalPages
	};
}
function parseCurrentModelRef(raw) {
	const match = (raw?.trim())?.match(/^([^/]+)\/(.+)$/u);
	if (!match) return null;
	const provider = normalizeProviderId(match[1]);
	const model = match[2];
	if (!provider || !model) return null;
	return {
		provider,
		model
	};
}
function formatCurrentModelLine(currentModel) {
	const parsed = parseCurrentModelRef(currentModel);
	if (!parsed) return "Current model: default";
	return `Current model: ${parsed.provider}/${parsed.model}`;
}
function formatProviderButtonLabel(provider) {
	if (provider.length <= DISCORD_PROVIDER_BUTTON_LABEL_MAX_CHARS) return provider;
	return `${provider.slice(0, DISCORD_PROVIDER_BUTTON_LABEL_MAX_CHARS - 1)}…`;
}
function chunkProvidersForRows(items) {
	if (items.length === 0) return [];
	const rowCount = Math.max(1, Math.ceil(items.length / 5));
	const minPerRow = Math.floor(items.length / rowCount);
	const rowsWithExtraItem = items.length % rowCount;
	const counts = Array.from({ length: rowCount }, (_, index) => index < rowCount - rowsWithExtraItem ? minPerRow : minPerRow + 1);
	const rows = [];
	let cursor = 0;
	for (const count of counts) {
		rows.push(items.slice(cursor, cursor + count));
		cursor += count;
	}
	return rows;
}
function createModelPickerButton(params) {
	class DiscordModelPickerButton extends Button {
		constructor(..._args) {
			super(..._args);
			this.label = params.label;
			this.customId = params.customId;
			this.style = params.style ?? ButtonStyle$1.Secondary;
			this.disabled = params.disabled ?? false;
		}
	}
	return new DiscordModelPickerButton();
}
function createModelSelect(params) {
	class DiscordModelPickerSelect extends StringSelectMenu {
		constructor(..._args2) {
			super(..._args2);
			this.customId = params.customId;
			this.options = params.options;
			this.minValues = 1;
			this.maxValues = 1;
			this.placeholder = params.placeholder;
			this.disabled = params.disabled ?? false;
		}
	}
	return new DiscordModelPickerSelect();
}
function buildRenderedShell(params) {
	if (params.layout === "classic") return {
		layout: "classic",
		content: [
			params.title,
			...params.detailLines,
			"",
			params.footer
		].filter(Boolean).join("\n"),
		components: params.rows
	};
	const containerComponents = [new TextDisplay(`## ${params.title}`)];
	if (params.detailLines.length > 0) containerComponents.push(new TextDisplay(params.detailLines.join("\n")));
	containerComponents.push(new Separator({
		divider: true,
		spacing: "small"
	}));
	if (params.preRowText) containerComponents.push(new TextDisplay(params.preRowText));
	containerComponents.push(...params.rows);
	if (params.trailingRows && params.trailingRows.length > 0) {
		containerComponents.push(new Separator({
			divider: true,
			spacing: "small"
		}));
		containerComponents.push(...params.trailingRows);
	}
	if (params.footer) {
		containerComponents.push(new Separator({
			divider: false,
			spacing: "small"
		}));
		containerComponents.push(new TextDisplay(`-# ${params.footer}`));
	}
	return {
		layout: "v2",
		components: [new Container(containerComponents)]
	};
}
function buildProviderRows(params) {
	return chunkProvidersForRows(params.page.items).map((providers) => new Row(providers.map((provider) => {
		const style = provider.id === params.currentProvider ? ButtonStyle$1.Primary : ButtonStyle$1.Secondary;
		return createModelPickerButton({
			label: formatProviderButtonLabel(provider.id),
			style,
			customId: buildDiscordModelPickerCustomId({
				command: params.command,
				action: "provider",
				view: "models",
				provider: provider.id,
				page: params.page.page,
				userId: params.userId
			})
		});
	})));
}
function buildModelRows(params) {
	const parsedCurrentModel = parseCurrentModelRef(params.currentModel);
	const parsedPendingModel = parseCurrentModelRef(params.pendingModel);
	const rows = [];
	const hasQuickModels = (params.quickModels ?? []).length > 0;
	const providerPage = getDiscordModelPickerProviderPage({
		data: params.data,
		page: params.providerPage
	});
	const providerOptions = providerPage.items.map((provider) => ({
		label: provider.id,
		value: provider.id,
		default: provider.id === params.modelPage.provider
	}));
	rows.push(new Row([createModelSelect({
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "provider",
			view: "models",
			provider: params.modelPage.provider,
			page: providerPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		}),
		options: providerOptions,
		placeholder: "Select provider"
	})]));
	const selectedModelRef = parsedPendingModel ?? parsedCurrentModel;
	const modelOptions = params.modelPage.items.map((model) => ({
		label: model,
		value: model,
		default: selectedModelRef ? selectedModelRef.provider === params.modelPage.provider && selectedModelRef.model === model : false
	}));
	rows.push(new Row([createModelSelect({
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "model",
			view: "models",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		}),
		options: modelOptions,
		placeholder: `Select ${params.modelPage.provider} model`
	})]));
	const resolvedDefault = params.data.resolvedDefault;
	const shouldDisableReset = Boolean(parsedCurrentModel) && parsedCurrentModel?.provider === resolvedDefault.provider && parsedCurrentModel?.model === resolvedDefault.model;
	const hasPendingSelection = Boolean(parsedPendingModel) && parsedPendingModel?.provider === params.modelPage.provider && typeof params.pendingModelIndex === "number" && params.pendingModelIndex > 0;
	const buttonRowItems = [createModelPickerButton({
		label: "Cancel",
		style: ButtonStyle$1.Secondary,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "cancel",
			view: "models",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		})
	}), createModelPickerButton({
		label: "Reset to default",
		style: ButtonStyle$1.Secondary,
		disabled: shouldDisableReset,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "reset",
			view: "models",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		})
	})];
	if (hasQuickModels) buttonRowItems.push(createModelPickerButton({
		label: "Recents",
		style: ButtonStyle$1.Secondary,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "recents",
			view: "recents",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		})
	}));
	buttonRowItems.push(createModelPickerButton({
		label: "Submit",
		style: ButtonStyle$1.Primary,
		disabled: !hasPendingSelection,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "submit",
			view: "models",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			modelIndex: params.pendingModelIndex,
			userId: params.userId
		})
	}));
	return {
		rows,
		buttonRow: new Row(buttonRowItems)
	};
}
/**
* Source-of-truth data for Discord picker views. This intentionally reuses the
* same provider/model resolver used by text and Telegram model commands.
*/
async function loadDiscordModelPickerData(cfg, agentId) {
	const { buildModelsProviderData } = await loadModelsProviderRuntime();
	return buildModelsProviderData(cfg, agentId);
}
function buildDiscordModelPickerCustomId(params) {
	const userId = params.userId.trim();
	if (!userId) throw new Error("Discord model picker custom_id requires userId");
	const page = normalizePage(params.page);
	const providerPage = typeof params.providerPage === "number" && Number.isFinite(params.providerPage) ? Math.max(1, Math.floor(params.providerPage)) : void 0;
	const normalizedProvider = params.provider ? normalizeProviderId(params.provider) : void 0;
	const modelIndex = typeof params.modelIndex === "number" && Number.isFinite(params.modelIndex) ? Math.max(1, Math.floor(params.modelIndex)) : void 0;
	const recentSlot = typeof params.recentSlot === "number" && Number.isFinite(params.recentSlot) ? Math.max(1, Math.floor(params.recentSlot)) : void 0;
	const parts = [
		`${DISCORD_MODEL_PICKER_CUSTOM_ID_KEY}:c=${encodeCustomIdValue(params.command)}`,
		`a=${encodeCustomIdValue(params.action)}`,
		`v=${encodeCustomIdValue(params.view)}`,
		`u=${encodeCustomIdValue(userId)}`,
		`g=${String(page)}`
	];
	if (normalizedProvider) parts.push(`p=${encodeCustomIdValue(normalizedProvider)}`);
	if (providerPage) parts.push(`pp=${String(providerPage)}`);
	if (modelIndex) parts.push(`mi=${String(modelIndex)}`);
	if (recentSlot) parts.push(`rs=${String(recentSlot)}`);
	const customId = parts.join(";");
	if (customId.length > 100) throw new Error(`Discord model picker custom_id exceeds 100 chars (${customId.length})`);
	return customId;
}
function parseDiscordModelPickerData(data) {
	if (!data || typeof data !== "object") return null;
	const command = decodeCustomIdValue(coerceString(data.c ?? data.cmd));
	const action = decodeCustomIdValue(coerceString(data.a ?? data.act));
	const view = decodeCustomIdValue(coerceString(data.v ?? data.view));
	const userId = decodeCustomIdValue(coerceString(data.u));
	const providerRaw = decodeCustomIdValue(coerceString(data.p));
	const page = parseRawPage(data.g ?? data.pg);
	const providerPage = parseRawPositiveInt(data.pp);
	const modelIndex = parseRawPositiveInt(data.mi);
	const recentSlot = parseRawPositiveInt(data.rs);
	if (!isValidCommandContext(command) || !isValidPickerAction(action) || !isValidPickerView(view)) return null;
	const trimmedUserId = userId.trim();
	if (!trimmedUserId) return null;
	return {
		command,
		action,
		view,
		userId: trimmedUserId,
		provider: providerRaw ? normalizeProviderId(providerRaw) : void 0,
		page,
		...typeof providerPage === "number" ? { providerPage } : {},
		...typeof modelIndex === "number" ? { modelIndex } : {},
		...typeof recentSlot === "number" ? { recentSlot } : {}
	};
}
function buildDiscordModelPickerProviderItems(data) {
	return data.providers.map((provider) => ({
		id: provider,
		count: data.byProvider.get(provider)?.size ?? 0
	}));
}
function getDiscordModelPickerProviderPage(params) {
	const items = buildDiscordModelPickerProviderItems(params.data);
	const maxPageSize = items.length <= 25 ? 25 : 20;
	const pageSize = clampPageSize(params.pageSize, maxPageSize, maxPageSize);
	return paginateItems({
		items,
		page: normalizePage(params.page),
		pageSize
	});
}
function getDiscordModelPickerModelPage(params) {
	const provider = normalizeProviderId(params.provider);
	const modelSet = params.data.byProvider.get(provider);
	if (!modelSet) return null;
	const pageSize = clampPageSize(params.pageSize, 25, 25);
	return {
		...paginateItems({
			items: [...modelSet].toSorted(),
			page: normalizePage(params.page),
			pageSize
		}),
		provider
	};
}
function renderDiscordModelPickerProvidersView(params) {
	const page = getDiscordModelPickerProviderPage({
		data: params.data,
		page: params.page
	});
	const parsedCurrent = parseCurrentModelRef(params.currentModel);
	const rows = buildProviderRows({
		command: params.command,
		userId: params.userId,
		page,
		currentProvider: parsedCurrent?.provider
	});
	const detailLines = [formatCurrentModelLine(params.currentModel), `Select a provider (${page.totalItems} available).`];
	return buildRenderedShell({
		layout: params.layout ?? "v2",
		title: "Model Picker",
		detailLines,
		rows,
		footer: `All ${page.totalItems} providers shown`
	});
}
function renderDiscordModelPickerModelsView(params) {
	const providerPage = normalizePage(params.providerPage);
	const modelPage = getDiscordModelPickerModelPage({
		data: params.data,
		provider: params.provider,
		page: params.page
	});
	if (!modelPage) {
		const rows = [new Row([createModelPickerButton({
			label: "Back",
			customId: buildDiscordModelPickerCustomId({
				command: params.command,
				action: "back",
				view: "providers",
				page: providerPage,
				userId: params.userId
			})
		})])];
		return buildRenderedShell({
			layout: params.layout ?? "v2",
			title: "Model Picker",
			detailLines: [formatCurrentModelLine(params.currentModel), `Provider not found: ${normalizeProviderId(params.provider)}`],
			rows,
			footer: "Choose a different provider."
		});
	}
	const { rows, buttonRow } = buildModelRows({
		command: params.command,
		userId: params.userId,
		data: params.data,
		providerPage,
		modelPage,
		currentModel: params.currentModel,
		pendingModel: params.pendingModel,
		pendingModelIndex: params.pendingModelIndex,
		quickModels: params.quickModels
	});
	const defaultModel = `${params.data.resolvedDefault.provider}/${params.data.resolvedDefault.model}`;
	const pendingLine = params.pendingModel ? `Selected: ${params.pendingModel} (press Submit)` : "Select a model, then press Submit.";
	return buildRenderedShell({
		layout: params.layout ?? "v2",
		title: "Model Picker",
		detailLines: [formatCurrentModelLine(params.currentModel), `Default: ${defaultModel}`],
		preRowText: pendingLine,
		rows,
		trailingRows: [buttonRow]
	});
}
function formatRecentsButtonLabel(modelRef, suffix) {
	const maxLen = 80;
	const label = suffix ? `${modelRef} ${suffix}` : modelRef;
	if (label.length <= maxLen) return label;
	return suffix ? `${modelRef.slice(0, maxLen - suffix.length - 2)}… ${suffix}` : `${modelRef.slice(0, maxLen - 1)}…`;
}
function renderDiscordModelPickerRecentsView(params) {
	const defaultModelRef = `${params.data.resolvedDefault.provider}/${params.data.resolvedDefault.model}`;
	const rows = [];
	const dedupedQuickModels = params.quickModels.filter((modelRef) => modelRef !== defaultModelRef);
	rows.push(new Row([createModelPickerButton({
		label: formatRecentsButtonLabel(defaultModelRef, "(default)"),
		style: ButtonStyle$1.Secondary,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "submit",
			view: "recents",
			recentSlot: 1,
			provider: params.provider,
			page: params.page,
			providerPage: params.providerPage,
			userId: params.userId
		})
	})]));
	for (let i = 0; i < dedupedQuickModels.length; i++) {
		const modelRef = dedupedQuickModels[i];
		rows.push(new Row([createModelPickerButton({
			label: formatRecentsButtonLabel(modelRef),
			style: ButtonStyle$1.Secondary,
			customId: buildDiscordModelPickerCustomId({
				command: params.command,
				action: "submit",
				view: "recents",
				recentSlot: i + 2,
				provider: params.provider,
				page: params.page,
				providerPage: params.providerPage,
				userId: params.userId
			})
		})]));
	}
	const backRow = new Row([createModelPickerButton({
		label: "Back",
		style: ButtonStyle$1.Secondary,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "back",
			view: "models",
			provider: params.provider,
			page: params.page,
			providerPage: params.providerPage,
			userId: params.userId
		})
	})]);
	return buildRenderedShell({
		layout: params.layout ?? "v2",
		title: "Recents",
		detailLines: ["Models you've previously selected appear here.", formatCurrentModelLine(params.currentModel)],
		preRowText: "Tap a model to switch.",
		rows,
		trailingRows: [backRow]
	});
}
function toDiscordModelPickerMessagePayload(view) {
	if (view.layout === "classic") return {
		content: view.content,
		components: view.components
	};
	return { components: view.components };
}
//#endregion
//#region extensions/discord/src/monitor/native-command-ui.ts
const DISCORD_COMMAND_ARG_CUSTOM_ID_KEY = "cmdarg";
function createCommandArgsWithValue(params) {
	return { values: { [params.argName]: params.value } };
}
function encodeDiscordCommandArgValue(value) {
	return encodeURIComponent(value);
}
function decodeDiscordCommandArgValue(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
function buildDiscordCommandArgCustomId(params) {
	return [
		`${DISCORD_COMMAND_ARG_CUSTOM_ID_KEY}:command=${encodeDiscordCommandArgValue(params.command)}`,
		`arg=${encodeDiscordCommandArgValue(params.arg)}`,
		`value=${encodeDiscordCommandArgValue(params.value)}`,
		`user=${encodeDiscordCommandArgValue(params.userId)}`
	].join(";");
}
function parseDiscordCommandArgData(data) {
	if (!data || typeof data !== "object") return null;
	const coerce = (value) => typeof value === "string" || typeof value === "number" ? String(value) : "";
	const rawCommand = coerce(data.command);
	const rawArg = coerce(data.arg);
	const rawValue = coerce(data.value);
	const rawUser = coerce(data.user);
	if (!rawCommand || !rawArg || !rawValue || !rawUser) return null;
	return {
		command: decodeDiscordCommandArgValue(rawCommand),
		arg: decodeDiscordCommandArgValue(rawArg),
		value: decodeDiscordCommandArgValue(rawValue),
		userId: decodeDiscordCommandArgValue(rawUser)
	};
}
function resolveDiscordModelPickerCommandContext(command) {
	const normalized = (command.nativeName ?? command.key).trim().toLowerCase();
	if (normalized === "model" || normalized === "models") return normalized;
	return null;
}
function resolveCommandArgStringValue(args, key) {
	const value = args?.values?.[key];
	if (typeof value !== "string") return "";
	return value.trim();
}
function shouldOpenDiscordModelPickerFromCommand(params) {
	const context = resolveDiscordModelPickerCommandContext(params.command);
	if (!context) return null;
	const serializedArgs = serializeCommandArgs(params.command, params.commandArgs)?.trim() ?? "";
	if (context === "model") return !resolveCommandArgStringValue(params.commandArgs, "model") && !serializedArgs ? context : null;
	return serializedArgs ? null : context;
}
function buildDiscordModelPickerCurrentModel(defaultProvider, defaultModel) {
	return `${defaultProvider}/${defaultModel}`;
}
function buildDiscordModelPickerAllowedModelRefs(data) {
	const out = /* @__PURE__ */ new Set();
	for (const provider of data.providers) {
		const models = data.byProvider.get(provider);
		if (!models) continue;
		for (const model of models) out.add(`${provider}/${model}`);
	}
	return out;
}
function resolveDiscordModelPickerPreferenceScope(params) {
	return {
		accountId: params.accountId,
		guildId: params.interaction.guild?.id ?? void 0,
		userId: params.userId
	};
}
function buildDiscordModelPickerNoticePayload(message) {
	return { components: [new Container([new TextDisplay(message)])] };
}
async function resolveDiscordModelPickerRouteState(params) {
	const { interaction, cfg, accountId } = params;
	const channel = interaction.channel;
	const channelType = channel?.type;
	const isDirectMessage = channelType === ChannelType.DM;
	const isGroupDm = channelType === ChannelType.GroupDM;
	const isThreadChannel = channelType === ChannelType.PublicThread || channelType === ChannelType.PrivateThread || channelType === ChannelType.AnnouncementThread;
	const rawChannelId = channel?.id ?? "unknown";
	const memberRoleIds = Array.isArray(interaction.rawData.member?.roles) ? interaction.rawData.member.roles.map((roleId) => String(roleId)) : [];
	let threadParentId;
	if (interaction.guild && channel && isThreadChannel && rawChannelId) {
		const channelInfo = await resolveDiscordChannelInfo(interaction.client, rawChannelId);
		threadParentId = (await resolveDiscordThreadParentInfo({
			client: interaction.client,
			threadChannel: {
				id: rawChannelId,
				name: "name" in channel ? channel.name : void 0,
				parentId: "parentId" in channel ? channel.parentId ?? void 0 : void 0,
				parent: void 0
			},
			channelInfo
		})).id;
	}
	const threadBinding = isThreadChannel ? params.threadBindings.getByThreadId(rawChannelId) : void 0;
	return await resolveDiscordNativeInteractionRouteState({
		cfg,
		accountId,
		guildId: interaction.guild?.id ?? void 0,
		memberRoleIds,
		isDirectMessage,
		isGroupDm,
		directUserId: interaction.user?.id ?? rawChannelId,
		conversationId: rawChannelId,
		parentConversationId: threadParentId,
		threadBinding,
		enforceConfiguredBindingReadiness: params.enforceConfiguredBindingReadiness
	});
}
async function resolveDiscordModelPickerRoute(params) {
	return (await resolveDiscordModelPickerRouteState(params)).effectiveRoute;
}
async function resolveDiscordNativeChoiceContext(params) {
	try {
		const resolved = await resolveDiscordModelPickerRouteState({
			interaction: params.interaction,
			cfg: params.cfg,
			accountId: params.accountId,
			threadBindings: params.threadBindings,
			enforceConfiguredBindingReadiness: true
		});
		if (resolved.bindingReadiness && !resolved.bindingReadiness.ok) return null;
		const route = resolved.effectiveRoute;
		const fallback = resolveDefaultModelForAgent({
			cfg: params.cfg,
			agentId: route.agentId
		});
		const sessionStore = loadSessionStore(resolveStorePath(params.cfg.session?.store, { agentId: route.agentId }));
		const sessionEntry = sessionStore[route.sessionKey];
		const override = resolveStoredModelOverride({
			sessionEntry,
			sessionStore,
			sessionKey: route.sessionKey
		});
		if (!override?.model) return {
			provider: fallback.provider,
			model: fallback.model
		};
		return {
			provider: override.provider || fallback.provider,
			model: override.model
		};
	} catch {
		return null;
	}
}
function resolveDiscordModelPickerCurrentModel(params) {
	const fallback = buildDiscordModelPickerCurrentModel(params.data.resolvedDefault.provider, params.data.resolvedDefault.model);
	try {
		const sessionStore = loadSessionStore(resolveStorePath(params.cfg.session?.store, { agentId: params.route.agentId }), { skipCache: true });
		const sessionEntry = sessionStore[params.route.sessionKey];
		const override = resolveStoredModelOverride({
			sessionEntry,
			sessionStore,
			sessionKey: params.route.sessionKey
		});
		if (!override?.model) return fallback;
		const provider = (override.provider || params.data.resolvedDefault.provider).trim();
		if (!provider) return fallback;
		return `${provider}/${override.model}`;
	} catch {
		return fallback;
	}
}
async function replyWithDiscordModelPickerProviders(params) {
	const route = await resolveDiscordModelPickerRoute({
		interaction: params.interaction,
		cfg: params.cfg,
		accountId: params.accountId,
		threadBindings: params.threadBindings
	});
	const data = await loadDiscordModelPickerData(params.cfg, route.agentId);
	const currentModel = resolveDiscordModelPickerCurrentModel({
		cfg: params.cfg,
		route,
		data
	});
	const quickModels = await readDiscordModelPickerRecentModels({
		scope: resolveDiscordModelPickerPreferenceScope({
			interaction: params.interaction,
			accountId: params.accountId,
			userId: params.userId
		}),
		allowedModelRefs: buildDiscordModelPickerAllowedModelRefs(data),
		limit: 5
	});
	const payload = {
		...toDiscordModelPickerMessagePayload(renderDiscordModelPickerModelsView({
			command: params.command,
			userId: params.userId,
			data,
			provider: splitDiscordModelRef(currentModel ?? "")?.provider ?? data.resolvedDefault.provider,
			page: 1,
			providerPage: 1,
			currentModel,
			quickModels
		})),
		ephemeral: true
	};
	await params.safeInteractionCall("model picker reply", async () => {
		if (params.preferFollowUp) {
			await params.interaction.followUp(payload);
			return;
		}
		await params.interaction.reply(payload);
	});
}
function resolveModelPickerSelectionValue(interaction) {
	const rawValues = interaction.values;
	if (!Array.isArray(rawValues) || rawValues.length === 0) return null;
	const first = rawValues[0];
	if (typeof first !== "string") return null;
	return first.trim() || null;
}
function buildDiscordModelPickerSelectionCommand(params) {
	const commandDefinition = findCommandByNativeName("model", "discord") ?? listChatCommands().find((entry) => entry.key === "model");
	if (!commandDefinition) return null;
	const commandArgs = {
		values: { model: params.modelRef },
		raw: params.modelRef
	};
	return {
		command: commandDefinition,
		args: commandArgs,
		prompt: buildCommandTextFromArgs(commandDefinition, commandArgs)
	};
}
function listDiscordModelPickerProviderModels(data, provider) {
	const modelSet = data.byProvider.get(provider);
	if (!modelSet) return [];
	return [...modelSet].toSorted();
}
function resolveDiscordModelPickerModelIndex(params) {
	const models = listDiscordModelPickerProviderModels(params.data, params.provider);
	if (!models.length) return null;
	const index = models.indexOf(params.model);
	if (index < 0) return null;
	return index + 1;
}
function resolveDiscordModelPickerModelByIndex(params) {
	if (!params.modelIndex || params.modelIndex < 1) return null;
	const models = listDiscordModelPickerProviderModels(params.data, params.provider);
	if (!models.length) return null;
	return models[params.modelIndex - 1] ?? null;
}
function splitDiscordModelRef(modelRef) {
	const trimmed = modelRef.trim();
	const slashIndex = trimmed.indexOf("/");
	if (slashIndex <= 0 || slashIndex >= trimmed.length - 1) return null;
	const provider = trimmed.slice(0, slashIndex).trim();
	const model = trimmed.slice(slashIndex + 1).trim();
	if (!provider || !model) return null;
	return {
		provider,
		model
	};
}
async function handleDiscordModelPickerInteraction(params) {
	const { interaction, data, ctx } = params;
	const parsed = parseDiscordModelPickerData(data);
	if (!parsed) {
		await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, that model picker interaction is no longer available.")));
		return;
	}
	if (interaction.user?.id && interaction.user.id !== parsed.userId) {
		await params.safeInteractionCall("model picker ack", () => interaction.acknowledge());
		return;
	}
	const route = await resolveDiscordModelPickerRoute({
		interaction,
		cfg: ctx.cfg,
		accountId: ctx.accountId,
		threadBindings: ctx.threadBindings
	});
	const pickerData = await loadDiscordModelPickerData(ctx.cfg, route.agentId);
	const currentModelRef = resolveDiscordModelPickerCurrentModel({
		cfg: ctx.cfg,
		route,
		data: pickerData
	});
	const allowedModelRefs = buildDiscordModelPickerAllowedModelRefs(pickerData);
	const preferenceScope = resolveDiscordModelPickerPreferenceScope({
		interaction,
		accountId: ctx.accountId,
		userId: parsed.userId
	});
	const quickModels = await readDiscordModelPickerRecentModels({
		scope: preferenceScope,
		allowedModelRefs,
		limit: 5
	});
	if (parsed.action === "recents") {
		const rendered = renderDiscordModelPickerRecentsView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			quickModels,
			currentModel: currentModelRef,
			provider: parsed.provider,
			page: parsed.page,
			providerPage: parsed.providerPage
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "back" && parsed.view === "providers") {
		const rendered = renderDiscordModelPickerProvidersView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			page: parsed.page,
			currentModel: currentModelRef
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "back" && parsed.view === "models") {
		const provider = parsed.provider ?? splitDiscordModelRef(currentModelRef ?? "")?.provider ?? pickerData.resolvedDefault.provider;
		const rendered = renderDiscordModelPickerModelsView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			provider,
			page: parsed.page ?? 1,
			providerPage: parsed.providerPage ?? 1,
			currentModel: currentModelRef,
			quickModels
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "provider") {
		const selectedProvider = resolveModelPickerSelectionValue(interaction) ?? parsed.provider;
		if (!selectedProvider || !pickerData.byProvider.has(selectedProvider)) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, that provider isn't available anymore.")));
			return;
		}
		const rendered = renderDiscordModelPickerModelsView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			provider: selectedProvider,
			page: 1,
			providerPage: parsed.providerPage ?? parsed.page,
			currentModel: currentModelRef,
			quickModels
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "model") {
		const selectedModel = resolveModelPickerSelectionValue(interaction);
		const provider = parsed.provider;
		if (!provider || !selectedModel) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, I couldn't read that model selection.")));
			return;
		}
		const modelIndex = resolveDiscordModelPickerModelIndex({
			data: pickerData,
			provider,
			model: selectedModel
		});
		if (!modelIndex) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, that model isn't available anymore.")));
			return;
		}
		const modelRef = `${provider}/${selectedModel}`;
		const rendered = renderDiscordModelPickerModelsView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			provider,
			page: parsed.page,
			providerPage: parsed.providerPage ?? 1,
			currentModel: currentModelRef,
			pendingModel: modelRef,
			pendingModelIndex: modelIndex,
			quickModels
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "submit" || parsed.action === "reset" || parsed.action === "quick") {
		let modelRef = null;
		if (parsed.action === "reset") modelRef = `${pickerData.resolvedDefault.provider}/${pickerData.resolvedDefault.model}`;
		else if (parsed.action === "quick") {
			const slot = parsed.recentSlot ?? 0;
			modelRef = slot >= 1 ? quickModels[slot - 1] ?? null : null;
		} else if (parsed.view === "recents") {
			const defaultModelRef = `${pickerData.resolvedDefault.provider}/${pickerData.resolvedDefault.model}`;
			const dedupedRecents = quickModels.filter((ref) => ref !== defaultModelRef);
			const slot = parsed.recentSlot ?? 0;
			if (slot === 1) modelRef = defaultModelRef;
			else if (slot >= 2) modelRef = dedupedRecents[slot - 2] ?? null;
		} else {
			const provider = parsed.provider;
			const selectedModel = resolveDiscordModelPickerModelByIndex({
				data: pickerData,
				provider: provider ?? "",
				modelIndex: parsed.modelIndex
			});
			modelRef = provider && selectedModel ? `${provider}/${selectedModel}` : null;
		}
		const parsedModelRef = modelRef ? splitDiscordModelRef(modelRef) : null;
		if (!parsedModelRef || !pickerData.byProvider.get(parsedModelRef.provider)?.has(parsedModelRef.model)) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("That selection expired. Please choose a model again.")));
			return;
		}
		const resolvedModelRef = `${parsedModelRef.provider}/${parsedModelRef.model}`;
		const selectionCommand = buildDiscordModelPickerSelectionCommand({ modelRef: resolvedModelRef });
		if (!selectionCommand) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, /model is unavailable right now.")));
			return;
		}
		if (await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload(`Applying model change to ${resolvedModelRef}...`))) === null) return;
		try {
			await withTimeout(params.dispatchCommandInteraction({
				interaction,
				prompt: selectionCommand.prompt,
				command: selectionCommand.command,
				commandArgs: selectionCommand.args,
				cfg: ctx.cfg,
				discordConfig: ctx.discordConfig,
				accountId: ctx.accountId,
				sessionPrefix: ctx.sessionPrefix,
				preferFollowUp: true,
				threadBindings: ctx.threadBindings,
				suppressReplies: true
			}), 12e3);
		} catch (error) {
			if (error instanceof Error && error.message === "timeout") {
				await params.safeInteractionCall("model picker follow-up", () => interaction.followUp({
					...buildDiscordModelPickerNoticePayload(`⏳ Model change to ${resolvedModelRef} is still processing. Check /status in a few seconds.`),
					ephemeral: true
				}));
				return;
			}
			await params.safeInteractionCall("model picker follow-up", () => interaction.followUp({
				...buildDiscordModelPickerNoticePayload(`❌ Failed to apply ${resolvedModelRef}. Try /model ${resolvedModelRef} directly.`),
				ephemeral: true
			}));
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
		const effectiveModelRef = resolveDiscordModelPickerCurrentModel({
			cfg: ctx.cfg,
			route,
			data: pickerData
		});
		const persisted = effectiveModelRef === resolvedModelRef;
		if (!persisted) logVerbose(`discord: model picker override mismatch — expected ${resolvedModelRef} but read ${effectiveModelRef} from session key ${route.sessionKey}`);
		if (persisted) await recordDiscordModelPickerRecentModel({
			scope: preferenceScope,
			modelRef: resolvedModelRef,
			limit: 5
		}).catch(() => void 0);
		await params.safeInteractionCall("model picker follow-up", () => interaction.followUp({
			...buildDiscordModelPickerNoticePayload(persisted ? `✅ Model set to ${resolvedModelRef}.` : `⚠️ Tried to set ${resolvedModelRef}, but current model is ${effectiveModelRef}.`),
			ephemeral: true
		}));
		return;
	}
	if (parsed.action === "cancel") {
		const displayModel = currentModelRef ?? "default";
		await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload(`ℹ️ Model kept as ${displayModel}.`)));
	}
}
async function handleDiscordCommandArgInteraction(params) {
	const { interaction, data, ctx } = params;
	const parsed = parseDiscordCommandArgData(data);
	if (!parsed) {
		await params.safeInteractionCall("command arg update", () => interaction.update({
			content: "Sorry, that selection is no longer available.",
			components: []
		}));
		return;
	}
	if (interaction.user?.id && interaction.user.id !== parsed.userId) {
		await params.safeInteractionCall("command arg ack", () => interaction.acknowledge());
		return;
	}
	const commandDefinition = findCommandByNativeName(parsed.command, "discord") ?? listChatCommands().find((entry) => entry.key === parsed.command);
	if (!commandDefinition) {
		await params.safeInteractionCall("command arg update", () => interaction.update({
			content: "Sorry, that command is no longer available.",
			components: []
		}));
		return;
	}
	if (await params.safeInteractionCall("command arg update", () => interaction.update({
		content: `✅ Selected ${parsed.value}.`,
		components: []
	})) === null) return;
	const commandArgs = createCommandArgsWithValue({
		argName: parsed.arg,
		value: parsed.value
	});
	const commandArgsWithRaw = {
		...commandArgs,
		raw: serializeCommandArgs(commandDefinition, commandArgs)
	};
	const prompt = buildCommandTextFromArgs(commandDefinition, commandArgsWithRaw);
	await params.dispatchCommandInteraction({
		interaction,
		prompt,
		command: commandDefinition,
		commandArgs: commandArgsWithRaw,
		cfg: ctx.cfg,
		discordConfig: ctx.discordConfig,
		accountId: ctx.accountId,
		sessionPrefix: ctx.sessionPrefix,
		preferFollowUp: true,
		threadBindings: ctx.threadBindings
	});
}
var DiscordCommandArgButton = class extends Button {
	constructor(params) {
		super();
		this.style = ButtonStyle$1.Secondary;
		this.label = params.label;
		this.customId = params.customId;
		this.ctx = params.ctx;
		this.safeInteractionCall = params.safeInteractionCall;
		this.dispatchCommandInteraction = params.dispatchCommandInteraction;
	}
	async run(interaction, data) {
		await handleDiscordCommandArgInteraction({
			interaction,
			data,
			ctx: this.ctx,
			safeInteractionCall: this.safeInteractionCall,
			dispatchCommandInteraction: this.dispatchCommandInteraction
		});
	}
};
function buildDiscordCommandArgMenu(params) {
	const { command, menu, interaction } = params;
	const commandLabel = command.nativeName ?? command.key;
	const userId = interaction.user?.id ?? "";
	const rows = chunkItems(menu.choices, 4).map((choices) => {
		return new Row(choices.map((choice) => new DiscordCommandArgButton({
			label: choice.label,
			customId: buildDiscordCommandArgCustomId({
				command: commandLabel,
				arg: menu.arg.name,
				value: choice.value,
				userId
			}),
			ctx: params.ctx,
			safeInteractionCall: params.safeInteractionCall,
			dispatchCommandInteraction: params.dispatchCommandInteraction
		})));
	});
	return {
		content: menu.title ?? `Choose ${menu.arg.description || menu.arg.name} for /${commandLabel}.`,
		components: rows
	};
}
var DiscordCommandArgFallbackButton = class extends Button {
	constructor(params) {
		super();
		this.label = "cmdarg";
		this.customId = "cmdarg:seed=1";
		this.ctx = params.ctx;
		this.safeInteractionCall = params.safeInteractionCall;
		this.dispatchCommandInteraction = params.dispatchCommandInteraction;
	}
	async run(interaction, data) {
		await handleDiscordCommandArgInteraction({
			interaction,
			data,
			ctx: this.ctx,
			safeInteractionCall: this.safeInteractionCall,
			dispatchCommandInteraction: this.dispatchCommandInteraction
		});
	}
};
var DiscordModelPickerFallbackButton = class extends Button {
	constructor(params) {
		super();
		this.label = "modelpick";
		this.customId = `${DISCORD_MODEL_PICKER_CUSTOM_ID_KEY}:seed=btn`;
		this.ctx = params.ctx;
		this.safeInteractionCall = params.safeInteractionCall;
		this.dispatchCommandInteraction = params.dispatchCommandInteraction;
	}
	async run(interaction, data) {
		await handleDiscordModelPickerInteraction({
			interaction,
			data,
			ctx: this.ctx,
			safeInteractionCall: this.safeInteractionCall,
			dispatchCommandInteraction: this.dispatchCommandInteraction
		});
	}
};
var DiscordModelPickerFallbackSelect = class extends StringSelectMenu {
	constructor(params) {
		super();
		this.customId = `${DISCORD_MODEL_PICKER_CUSTOM_ID_KEY}:seed=sel`;
		this.options = [];
		this.ctx = params.ctx;
		this.safeInteractionCall = params.safeInteractionCall;
		this.dispatchCommandInteraction = params.dispatchCommandInteraction;
	}
	async run(interaction, data) {
		await handleDiscordModelPickerInteraction({
			interaction,
			data,
			ctx: this.ctx,
			safeInteractionCall: this.safeInteractionCall,
			dispatchCommandInteraction: this.dispatchCommandInteraction
		});
	}
};
function createDiscordCommandArgFallbackButton$1(params) {
	return new DiscordCommandArgFallbackButton(params);
}
function createDiscordModelPickerFallbackButton$1(params) {
	return new DiscordModelPickerFallbackButton(params);
}
function createDiscordModelPickerFallbackSelect$1(params) {
	return new DiscordModelPickerFallbackSelect(params);
}
//#endregion
//#region extensions/discord/src/monitor/native-command.ts
const log = createSubsystemLogger("discord/native-command");
const DISCORD_COMMAND_DESCRIPTION_MAX = 100;
let matchPluginCommandImpl = matchPluginCommand;
let executePluginCommandImpl = executePluginCommand;
let dispatchReplyWithDispatcherImpl = dispatchReplyWithDispatcher;
let resolveDiscordNativeInteractionRouteStateImpl = resolveDiscordNativeInteractionRouteState;
function truncateDiscordCommandDescription(params) {
	const { value, label } = params;
	if (value.length <= DISCORD_COMMAND_DESCRIPTION_MAX) return value;
	log.warn(`discord: truncating native command description (${label}) from ${value.length} to ${DISCORD_COMMAND_DESCRIPTION_MAX}: ${JSON.stringify(value)}`);
	return value.slice(0, DISCORD_COMMAND_DESCRIPTION_MAX);
}
function resolveDiscordCommandLogLabel(command) {
	if (typeof command.nativeName === "string" && command.nativeName.trim().length > 0) return command.nativeName;
	return command.key;
}
function resolveDiscordNativeCommandAllowlistAccess(params) {
	const commandsAllowFrom = params.cfg.commands?.allowFrom;
	if (!commandsAllowFrom || typeof commandsAllowFrom !== "object") return {
		configured: false,
		allowed: false
	};
	const rawAllowList = Array.isArray(commandsAllowFrom.discord) ? commandsAllowFrom.discord : commandsAllowFrom["*"];
	if (!Array.isArray(rawAllowList)) return {
		configured: false,
		allowed: false
	};
	const guildId = params.guildId?.trim();
	if (guildId) for (const entry of rawAllowList) {
		const text = String(entry).trim();
		if (text.startsWith("guild:") && text.slice(6) === guildId) return {
			configured: true,
			allowed: true
		};
	}
	const allowList = normalizeDiscordAllowList(rawAllowList.map(String), [
		"discord:",
		"user:",
		"pk:"
	]);
	if (!allowList) return {
		configured: true,
		allowed: false
	};
	return {
		configured: true,
		allowed: resolveDiscordAllowListMatch({
			allowList,
			candidate: params.sender,
			allowNameMatching: false
		}).allowed
	};
}
function buildDiscordCommandOptions(params) {
	const { command, cfg, authorizeChoiceContext, resolveChoiceContext } = params;
	const commandLabel = resolveDiscordCommandLogLabel(command);
	const args = command.args;
	if (!args || args.length === 0) return;
	return args.map((arg) => {
		const required = arg.required ?? false;
		if (arg.type === "number") return {
			name: arg.name,
			description: truncateDiscordCommandDescription({
				value: arg.description,
				label: `command:${commandLabel} arg:${arg.name}`
			}),
			type: ApplicationCommandOptionType$1.Number,
			required
		};
		if (arg.type === "boolean") return {
			name: arg.name,
			description: truncateDiscordCommandDescription({
				value: arg.description,
				label: `command:${commandLabel} arg:${arg.name}`
			}),
			type: ApplicationCommandOptionType$1.Boolean,
			required
		};
		const resolvedChoices = resolveCommandArgChoices({
			command,
			arg,
			cfg
		});
		const autocomplete = arg.preferAutocomplete === true || resolvedChoices.length > 0 && (typeof arg.choices === "function" || resolvedChoices.length > 25) ? async (interaction) => {
			if (typeof arg.choices === "function" && resolveChoiceContext && authorizeChoiceContext && !await authorizeChoiceContext(interaction)) {
				await interaction.respond([]);
				return;
			}
			const focused = interaction.options.getFocused();
			const focusValue = typeof focused?.value === "string" ? focused.value.trim().toLowerCase() : "";
			const context = typeof arg.choices === "function" && resolveChoiceContext ? await resolveChoiceContext(interaction) : null;
			const choices = resolveCommandArgChoices({
				command,
				arg,
				cfg,
				provider: context?.provider,
				model: context?.model
			});
			const filtered = focusValue ? choices.filter((choice) => choice.label.toLowerCase().includes(focusValue)) : choices;
			await interaction.respond(filtered.slice(0, 25).map((choice) => ({
				name: choice.label,
				value: choice.value
			})));
		} : void 0;
		const choices = resolvedChoices.length > 0 && !autocomplete ? resolvedChoices.slice(0, 25).map((choice) => ({
			name: choice.label,
			value: choice.value
		})) : void 0;
		return {
			name: arg.name,
			description: truncateDiscordCommandDescription({
				value: arg.description,
				label: `command:${commandLabel} arg:${arg.name}`
			}),
			type: ApplicationCommandOptionType$1.String,
			required,
			choices,
			autocomplete
		};
	});
}
function shouldBypassConfiguredAcpEnsure(commandName) {
	const normalized = commandName.trim().toLowerCase();
	return normalized === "acp" || normalized === "new" || normalized === "reset";
}
function resolveDiscordNativeGroupDmAccess(params) {
	if (!params.isGroupDm) return { allowed: true };
	if (params.groupEnabled === false) return {
		allowed: false,
		reason: "disabled"
	};
	if (!resolveGroupDmAllow({
		channels: params.groupChannels,
		channelId: params.channelId,
		channelName: params.channelName,
		channelSlug: params.channelSlug
	})) return {
		allowed: false,
		reason: "not-allowlisted"
	};
	return { allowed: true };
}
async function resolveDiscordNativeAutocompleteAuthorized(params) {
	const { interaction, cfg, discordConfig, accountId } = params;
	const user = interaction.user;
	if (!user) return false;
	const sender = resolveDiscordSenderIdentity({
		author: user,
		pluralkitInfo: null
	});
	const channel = interaction.channel;
	const channelType = channel?.type;
	const isDirectMessage = channelType === ChannelType.DM;
	const isGroupDm = channelType === ChannelType.GroupDM;
	const isThreadChannel = channelType === ChannelType.PublicThread || channelType === ChannelType.PrivateThread || channelType === ChannelType.AnnouncementThread;
	const channelName = channel && "name" in channel ? channel.name : void 0;
	const channelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
	const rawChannelId = channel?.id ?? "";
	const memberRoleIds = Array.isArray(interaction.rawData.member?.roles) ? interaction.rawData.member.roles.map((roleId) => String(roleId)) : [];
	const allowNameMatching = isDangerousNameMatchingEnabled(discordConfig);
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const { ownerAllowList, ownerAllowed: ownerOk } = resolveDiscordOwnerAccess({
		allowFrom: discordConfig?.allowFrom ?? discordConfig?.dm?.allowFrom ?? [],
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		},
		allowNameMatching
	});
	const commandsAllowFromAccess = resolveDiscordNativeCommandAllowlistAccess({
		cfg,
		accountId,
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		},
		chatType: isDirectMessage ? "direct" : isThreadChannel ? "thread" : interaction.guild ? "channel" : "group",
		conversationId: rawChannelId || void 0,
		guildId: interaction.guild?.id
	});
	const guildInfo = resolveDiscordGuildEntry({
		guild: interaction.guild ?? void 0,
		guildId: interaction.guild?.id ?? void 0,
		guildEntries: discordConfig?.guilds
	});
	let threadParentId;
	let threadParentName;
	let threadParentSlug = "";
	if (interaction.guild && channel && isThreadChannel && rawChannelId) {
		const channelInfo = await resolveDiscordChannelInfo(interaction.client, rawChannelId);
		const parentInfo = await resolveDiscordThreadParentInfo({
			client: interaction.client,
			threadChannel: {
				id: rawChannelId,
				name: channelName,
				parentId: "parentId" in channel ? channel.parentId ?? void 0 : void 0,
				parent: void 0
			},
			channelInfo
		});
		threadParentId = parentInfo.id;
		threadParentName = parentInfo.name;
		threadParentSlug = threadParentName ? normalizeDiscordSlug(threadParentName) : "";
	}
	const channelConfig = interaction.guild ? resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId: rawChannelId,
		channelName,
		channelSlug,
		parentId: threadParentId,
		parentName: threadParentName,
		parentSlug: threadParentSlug,
		scope: isThreadChannel ? "thread" : "channel"
	}) : null;
	if (channelConfig?.enabled === false) return false;
	if (interaction.guild && channelConfig?.allowed === false) return false;
	if (useAccessGroups && interaction.guild) {
		const channelAllowlistConfigured = Boolean(guildInfo?.channels) && Object.keys(guildInfo?.channels ?? {}).length > 0;
		const channelAllowed = channelConfig?.allowed !== false;
		const { groupPolicy } = resolveOpenProviderRuntimeGroupPolicy({
			providerConfigPresent: cfg.channels?.discord !== void 0,
			groupPolicy: discordConfig?.groupPolicy,
			defaultGroupPolicy: cfg.channels?.defaults?.groupPolicy
		});
		if (!isDiscordGroupAllowedByPolicy({
			groupPolicy,
			guildAllowlisted: Boolean(guildInfo),
			channelAllowlistConfigured,
			channelAllowed
		})) return false;
	}
	const dmEnabled = discordConfig?.dm?.enabled ?? true;
	const dmPolicy = discordConfig?.dmPolicy ?? discordConfig?.dm?.policy ?? "pairing";
	if (isDirectMessage) {
		if (!dmEnabled || dmPolicy === "disabled") return false;
		if ((await resolveDiscordDmCommandAccess({
			accountId,
			dmPolicy,
			configuredAllowFrom: discordConfig?.allowFrom ?? discordConfig?.dm?.allowFrom ?? [],
			sender: {
				id: sender.id,
				name: sender.name,
				tag: sender.tag
			},
			allowNameMatching,
			useAccessGroups
		})).decision !== "allow") return false;
	}
	if (!resolveDiscordNativeGroupDmAccess({
		isGroupDm,
		groupEnabled: discordConfig?.dm?.groupEnabled,
		groupChannels: discordConfig?.dm?.groupChannels,
		channelId: rawChannelId,
		channelName,
		channelSlug
	}).allowed) return false;
	if (!isDirectMessage) {
		const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
			channelConfig,
			guildInfo,
			memberRoleIds,
			sender,
			allowNameMatching
		});
		return resolveCommandAuthorizedFromAuthorizers({
			useAccessGroups,
			authorizers: useAccessGroups ? [
				{
					configured: commandsAllowFromAccess.configured,
					allowed: commandsAllowFromAccess.allowed
				},
				{
					configured: ownerAllowList != null,
					allowed: ownerOk
				},
				{
					configured: hasAccessRestrictions,
					allowed: memberAllowed
				}
			] : [{
				configured: commandsAllowFromAccess.configured,
				allowed: commandsAllowFromAccess.allowed
			}, {
				configured: hasAccessRestrictions,
				allowed: memberAllowed
			}],
			modeWhenAccessGroupsOff: "configured"
		});
	}
	return true;
}
function readDiscordCommandArgs(interaction, definitions) {
	if (!definitions || definitions.length === 0) return;
	const values = {};
	for (const definition of definitions) {
		let value;
		if (definition.type === "number") value = interaction.options.getNumber(definition.name) ?? null;
		else if (definition.type === "boolean") value = interaction.options.getBoolean(definition.name) ?? null;
		else value = interaction.options.getString(definition.name) ?? null;
		if (value != null) values[definition.name] = value;
	}
	return Object.keys(values).length > 0 ? { values } : void 0;
}
function isDiscordUnknownInteraction(error) {
	if (!error || typeof error !== "object") return false;
	const err = error;
	if (err.discordCode === 10062 || err.rawBody?.code === 10062) return true;
	if (err.status === 404 && /Unknown interaction/i.test(err.message ?? "")) return true;
	if (/Unknown interaction/i.test(err.rawBody?.message ?? "")) return true;
	return false;
}
function hasRenderableReplyPayload(payload) {
	if (resolveSendableOutboundReplyParts(payload).hasContent) return true;
	const discordData = payload.channelData?.discord;
	if (Array.isArray(discordData?.components) && discordData.components.length > 0) return true;
	return false;
}
async function safeDiscordInteractionCall(label, fn) {
	try {
		return await fn();
	} catch (error) {
		if (isDiscordUnknownInteraction(error)) {
			logVerbose(`discord: ${label} skipped (interaction expired)`);
			return null;
		}
		throw error;
	}
}
function createDiscordNativeCommand(params) {
	const { command, cfg, discordConfig, accountId, sessionPrefix, ephemeralDefault, threadBindings } = params;
	const commandDefinition = findCommandByNativeName(command.name, "discord") ?? {
		key: command.name,
		nativeName: command.name,
		description: command.description,
		textAliases: [],
		acceptsArgs: command.acceptsArgs,
		args: command.args,
		argsParsing: "none",
		scope: "native"
	};
	const argDefinitions = commandDefinition.args ?? command.args;
	const commandOptions = buildDiscordCommandOptions({
		command: commandDefinition,
		cfg,
		authorizeChoiceContext: async (interaction) => await resolveDiscordNativeAutocompleteAuthorized({
			interaction,
			cfg,
			discordConfig,
			accountId
		}),
		resolveChoiceContext: async (interaction) => resolveDiscordNativeChoiceContext({
			interaction,
			cfg,
			accountId,
			threadBindings
		})
	});
	const options = commandOptions ? commandOptions : command.acceptsArgs ? [{
		name: "input",
		description: "Command input",
		type: ApplicationCommandOptionType$1.String,
		required: false
	}] : void 0;
	return new class extends Command {
		constructor(..._args) {
			super(..._args);
			this.name = command.name;
			this.description = truncateDiscordCommandDescription({
				value: command.description,
				label: `command:${command.name}`
			});
			this.defer = true;
			this.ephemeral = ephemeralDefault;
			this.options = options;
		}
		async run(interaction) {
			const commandArgs = argDefinitions?.length ? readDiscordCommandArgs(interaction, argDefinitions) : command.acceptsArgs ? parseCommandArgs(commandDefinition, interaction.options.getString("input") ?? "") : void 0;
			const commandArgsWithRaw = commandArgs ? {
				...commandArgs,
				raw: serializeCommandArgs(commandDefinition, commandArgs) ?? commandArgs.raw
			} : void 0;
			await dispatchDiscordCommandInteraction({
				interaction,
				prompt: buildCommandTextFromArgs(commandDefinition, commandArgsWithRaw),
				command: commandDefinition,
				commandArgs: commandArgsWithRaw,
				cfg,
				discordConfig,
				accountId,
				sessionPrefix,
				preferFollowUp: false,
				threadBindings
			});
		}
	}();
}
async function dispatchDiscordCommandInteraction(params) {
	const { interaction, prompt, command, commandArgs, cfg, discordConfig, accountId, sessionPrefix, preferFollowUp, threadBindings, suppressReplies } = params;
	const respond = async (content, options) => {
		const payload = {
			content,
			...options?.ephemeral !== void 0 ? { ephemeral: options.ephemeral } : {}
		};
		await safeDiscordInteractionCall("interaction reply", async () => {
			if (preferFollowUp) {
				await interaction.followUp(payload);
				return;
			}
			await interaction.reply(payload);
		});
	};
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const user = interaction.user;
	if (!user) return;
	const sender = resolveDiscordSenderIdentity({
		author: user,
		pluralkitInfo: null
	});
	const channel = interaction.channel;
	const channelType = channel?.type;
	const isDirectMessage = channelType === ChannelType.DM;
	const isGroupDm = channelType === ChannelType.GroupDM;
	const isThreadChannel = channelType === ChannelType.PublicThread || channelType === ChannelType.PrivateThread || channelType === ChannelType.AnnouncementThread;
	const channelName = channel && "name" in channel ? channel.name : void 0;
	const channelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
	const rawChannelId = channel?.id ?? "";
	const memberRoleIds = Array.isArray(interaction.rawData.member?.roles) ? interaction.rawData.member.roles.map((roleId) => String(roleId)) : [];
	const allowNameMatching = isDangerousNameMatchingEnabled(discordConfig);
	const { ownerAllowList, ownerAllowed: ownerOk } = resolveDiscordOwnerAccess({
		allowFrom: discordConfig?.allowFrom ?? discordConfig?.dm?.allowFrom ?? [],
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		},
		allowNameMatching
	});
	const commandsAllowFromAccess = resolveDiscordNativeCommandAllowlistAccess({
		cfg,
		accountId,
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		},
		chatType: isDirectMessage ? "direct" : isThreadChannel ? "thread" : interaction.guild ? "channel" : "group",
		conversationId: rawChannelId || void 0,
		guildId: interaction.guild?.id
	});
	const guildInfo = resolveDiscordGuildEntry({
		guild: interaction.guild ?? void 0,
		guildId: interaction.guild?.id ?? void 0,
		guildEntries: discordConfig?.guilds
	});
	let threadParentId;
	let threadParentName;
	let threadParentSlug = "";
	if (interaction.guild && channel && isThreadChannel && rawChannelId) {
		const channelInfo = await resolveDiscordChannelInfo(interaction.client, rawChannelId);
		const parentInfo = await resolveDiscordThreadParentInfo({
			client: interaction.client,
			threadChannel: {
				id: rawChannelId,
				name: channelName,
				parentId: "parentId" in channel ? channel.parentId ?? void 0 : void 0,
				parent: void 0
			},
			channelInfo
		});
		threadParentId = parentInfo.id;
		threadParentName = parentInfo.name;
		threadParentSlug = threadParentName ? normalizeDiscordSlug(threadParentName) : "";
	}
	const channelConfig = interaction.guild ? resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId: rawChannelId,
		channelName,
		channelSlug,
		parentId: threadParentId,
		parentName: threadParentName,
		parentSlug: threadParentSlug,
		scope: isThreadChannel ? "thread" : "channel"
	}) : null;
	if (channelConfig?.enabled === false) {
		await respond("This channel is disabled.");
		return;
	}
	if (interaction.guild && channelConfig?.allowed === false) {
		await respond("This channel is not allowed.");
		return;
	}
	if (useAccessGroups && interaction.guild) {
		const channelAllowlistConfigured = Boolean(guildInfo?.channels) && Object.keys(guildInfo?.channels ?? {}).length > 0;
		const channelAllowed = channelConfig?.allowed !== false;
		const { groupPolicy } = resolveOpenProviderRuntimeGroupPolicy({
			providerConfigPresent: cfg.channels?.discord !== void 0,
			groupPolicy: discordConfig?.groupPolicy,
			defaultGroupPolicy: cfg.channels?.defaults?.groupPolicy
		});
		if (!isDiscordGroupAllowedByPolicy({
			groupPolicy,
			guildAllowlisted: Boolean(guildInfo),
			channelAllowlistConfigured,
			channelAllowed
		})) {
			await respond("This channel is not allowed.");
			return;
		}
	}
	const dmEnabled = discordConfig?.dm?.enabled ?? true;
	const dmPolicy = discordConfig?.dmPolicy ?? discordConfig?.dm?.policy ?? "pairing";
	let commandAuthorized = true;
	if (isDirectMessage) {
		if (!dmEnabled || dmPolicy === "disabled") {
			await respond("Discord DMs are disabled.");
			return;
		}
		const dmAccess = await resolveDiscordDmCommandAccess({
			accountId,
			dmPolicy,
			configuredAllowFrom: discordConfig?.allowFrom ?? discordConfig?.dm?.allowFrom ?? [],
			sender: {
				id: sender.id,
				name: sender.name,
				tag: sender.tag
			},
			allowNameMatching,
			useAccessGroups
		});
		commandAuthorized = dmAccess.commandAuthorized;
		if (dmAccess.decision !== "allow") {
			await handleDiscordDmCommandDecision({
				dmAccess,
				accountId,
				sender: {
					id: user.id,
					tag: sender.tag,
					name: sender.name
				},
				onPairingCreated: async (code) => {
					await respond(buildPairingReply({
						channel: "discord",
						idLine: `Your Discord user id: ${user.id}`,
						code
					}), { ephemeral: true });
				},
				onUnauthorized: async () => {
					await respond("You are not authorized to use this command.", { ephemeral: true });
				}
			});
			return;
		}
	}
	const groupDmAccess = resolveDiscordNativeGroupDmAccess({
		isGroupDm,
		groupEnabled: discordConfig?.dm?.groupEnabled,
		groupChannels: discordConfig?.dm?.groupChannels,
		channelId: rawChannelId,
		channelName,
		channelSlug
	});
	if (!groupDmAccess.allowed) {
		await respond(groupDmAccess.reason === "disabled" ? "Discord group DMs are disabled." : "This group DM is not allowed.");
		return;
	}
	if (!isDirectMessage) {
		const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
			channelConfig,
			guildInfo,
			memberRoleIds,
			sender,
			allowNameMatching
		});
		commandAuthorized = resolveCommandAuthorizedFromAuthorizers({
			useAccessGroups,
			authorizers: useAccessGroups ? [
				{
					configured: commandsAllowFromAccess.configured,
					allowed: commandsAllowFromAccess.allowed
				},
				{
					configured: ownerAllowList != null,
					allowed: ownerOk
				},
				{
					configured: hasAccessRestrictions,
					allowed: memberAllowed
				}
			] : [{
				configured: commandsAllowFromAccess.configured,
				allowed: commandsAllowFromAccess.allowed
			}, {
				configured: hasAccessRestrictions,
				allowed: memberAllowed
			}],
			modeWhenAccessGroupsOff: "configured"
		});
		if (!commandAuthorized) {
			await respond("You are not authorized to use this command.", { ephemeral: true });
			return;
		}
	}
	const menu = resolveCommandArgMenu({
		command,
		args: commandArgs,
		cfg
	});
	if (menu) {
		const menuPayload = buildDiscordCommandArgMenu({
			command,
			menu,
			interaction,
			ctx: {
				cfg,
				discordConfig,
				accountId,
				sessionPrefix,
				threadBindings
			},
			safeInteractionCall: safeDiscordInteractionCall,
			dispatchCommandInteraction: dispatchDiscordCommandInteraction
		});
		if (preferFollowUp) {
			await safeDiscordInteractionCall("interaction follow-up", () => interaction.followUp({
				content: menuPayload.content,
				components: menuPayload.components,
				ephemeral: true
			}));
			return;
		}
		await safeDiscordInteractionCall("interaction reply", () => interaction.reply({
			content: menuPayload.content,
			components: menuPayload.components,
			ephemeral: true
		}));
		return;
	}
	const pluginMatch = matchPluginCommandImpl(prompt);
	let nativeRouteStatePromise;
	const getNativeRouteState = () => nativeRouteStatePromise ??= resolveDiscordNativeInteractionRouteStateImpl({
		cfg,
		accountId,
		guildId: interaction.guild?.id ?? void 0,
		memberRoleIds,
		isDirectMessage,
		isGroupDm,
		directUserId: user.id,
		conversationId: rawChannelId || "unknown",
		parentConversationId: threadParentId,
		threadBinding: isThreadChannel ? threadBindings.getByThreadId(rawChannelId) : void 0,
		enforceConfiguredBindingReadiness: !shouldBypassConfiguredAcpEnsure(command.nativeName ?? command.key)
	});
	if (pluginMatch) {
		if (suppressReplies) return;
		const channelId = rawChannelId || "unknown";
		const isThreadChannel = interaction.channel?.type === ChannelType.PublicThread || interaction.channel?.type === ChannelType.PrivateThread || interaction.channel?.type === ChannelType.AnnouncementThread;
		const messageThreadId = !isDirectMessage && isThreadChannel ? channelId : void 0;
		const threadParentId = !isDirectMessage && isThreadChannel ? interaction.channel.parentId ?? void 0 : void 0;
		const { effectiveRoute } = await getNativeRouteState();
		const pluginReply = await executePluginCommandImpl({
			command: pluginMatch.command,
			args: pluginMatch.args,
			senderId: sender.id,
			channel: "discord",
			channelId,
			isAuthorizedSender: commandAuthorized,
			sessionKey: effectiveRoute.sessionKey,
			commandBody: prompt,
			config: cfg,
			from: isDirectMessage ? `discord:${user.id}` : isGroupDm ? `discord:group:${channelId}` : `discord:channel:${channelId}`,
			to: `slash:${user.id}`,
			accountId,
			messageThreadId,
			threadParentId
		});
		if (!hasRenderableReplyPayload(pluginReply)) {
			await respond("Done.");
			return;
		}
		await deliverDiscordInteractionReply({
			interaction,
			payload: pluginReply,
			textLimit: resolveTextChunkLimit(cfg, "discord", accountId, { fallbackLimit: 2e3 }),
			maxLinesPerMessage: resolveDiscordMaxLinesPerMessage({
				cfg,
				discordConfig,
				accountId
			}),
			preferFollowUp,
			chunkMode: resolveChunkMode(cfg, "discord", accountId)
		});
		return;
	}
	const pickerCommandContext = shouldOpenDiscordModelPickerFromCommand({
		command,
		commandArgs
	});
	if (pickerCommandContext) {
		await replyWithDiscordModelPickerProviders({
			interaction,
			cfg,
			command: pickerCommandContext,
			userId: user.id,
			accountId,
			threadBindings,
			preferFollowUp,
			safeInteractionCall: safeDiscordInteractionCall
		});
		return;
	}
	const isGuild = Boolean(interaction.guild);
	const channelId = rawChannelId || "unknown";
	const interactionId = interaction.rawData.id;
	const routeState = await getNativeRouteState();
	if (routeState.bindingReadiness && !routeState.bindingReadiness.ok) {
		const configuredBinding = routeState.configuredBinding;
		if (configuredBinding) {
			logVerbose(`discord native command: configured ACP binding unavailable for channel ${configuredBinding.record.conversation.conversationId}: ${routeState.bindingReadiness.error}`);
			await respond("Configured ACP binding is unavailable right now. Please try again.");
			return;
		}
	}
	const boundSessionKey = routeState.boundSessionKey;
	const effectiveRoute = routeState.effectiveRoute;
	const { sessionKey, commandTargetSessionKey } = resolveNativeCommandSessionTargets({
		agentId: effectiveRoute.agentId,
		sessionPrefix,
		userId: user.id,
		targetSessionKey: effectiveRoute.sessionKey,
		boundSessionKey
	});
	const ctxPayload = buildDiscordNativeCommandContext({
		prompt,
		commandArgs: commandArgs ?? {},
		sessionKey,
		commandTargetSessionKey,
		accountId: effectiveRoute.accountId,
		interactionId,
		channelId,
		threadParentId,
		guildName: interaction.guild?.name,
		channelTopic: channel && "topic" in channel ? channel.topic ?? void 0 : void 0,
		channelConfig,
		guildInfo,
		allowNameMatching,
		commandAuthorized,
		isDirectMessage,
		isGroupDm,
		isGuild,
		isThreadChannel,
		user: {
			id: user.id,
			username: user.username,
			globalName: user.globalName
		},
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		}
	});
	const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
		cfg,
		agentId: effectiveRoute.agentId,
		channel: "discord",
		accountId: effectiveRoute.accountId
	});
	const mediaLocalRoots = getAgentScopedMediaLocalRoots(cfg, effectiveRoute.agentId);
	let didReply = false;
	const dispatchResult = await dispatchReplyWithDispatcherImpl({
		ctx: ctxPayload,
		cfg,
		dispatcherOptions: {
			...replyPipeline,
			humanDelay: resolveHumanDelayConfig(cfg, effectiveRoute.agentId),
			deliver: async (payload) => {
				if (suppressReplies) return;
				try {
					await deliverDiscordInteractionReply({
						interaction,
						payload,
						mediaLocalRoots,
						textLimit: resolveTextChunkLimit(cfg, "discord", accountId, { fallbackLimit: 2e3 }),
						maxLinesPerMessage: resolveDiscordMaxLinesPerMessage({
							cfg,
							discordConfig,
							accountId
						}),
						preferFollowUp: preferFollowUp || didReply,
						chunkMode: resolveChunkMode(cfg, "discord", accountId)
					});
				} catch (error) {
					if (isDiscordUnknownInteraction(error)) {
						logVerbose("discord: interaction reply skipped (interaction expired)");
						return;
					}
					throw error;
				}
				didReply = true;
			},
			onError: (err, info) => {
				const message = err instanceof Error ? err.stack ?? err.message : String(err);
				log.error(`discord slash ${info.kind} reply failed: ${message}`);
			}
		},
		replyOptions: {
			skillFilter: channelConfig?.skills,
			disableBlockStreaming: typeof discordConfig?.blockStreaming === "boolean" ? !discordConfig.blockStreaming : void 0,
			onModelSelected
		}
	});
	if (!suppressReplies && !didReply && dispatchResult.counts.final === 0 && dispatchResult.counts.block === 0 && dispatchResult.counts.tool === 0) await safeDiscordInteractionCall("interaction empty fallback", async () => {
		const payload = {
			content: "✅ Done.",
			ephemeral: true
		};
		if (preferFollowUp) {
			await interaction.followUp(payload);
			return;
		}
		await interaction.reply(payload);
	});
}
function createDiscordCommandArgFallbackButton(params) {
	return createDiscordCommandArgFallbackButton$1({
		ctx: params,
		safeInteractionCall: safeDiscordInteractionCall,
		dispatchCommandInteraction: dispatchDiscordCommandInteraction
	});
}
function createDiscordModelPickerFallbackButton(params) {
	return createDiscordModelPickerFallbackButton$1({
		ctx: params,
		safeInteractionCall: safeDiscordInteractionCall,
		dispatchCommandInteraction: dispatchDiscordCommandInteraction
	});
}
function createDiscordModelPickerFallbackSelect(params) {
	return createDiscordModelPickerFallbackSelect$1({
		ctx: params,
		safeInteractionCall: safeDiscordInteractionCall,
		dispatchCommandInteraction: dispatchDiscordCommandInteraction
	});
}
async function deliverDiscordInteractionReply(params) {
	const { interaction, payload, textLimit, maxLinesPerMessage, preferFollowUp, chunkMode } = params;
	const reply = resolveSendableOutboundReplyParts(payload);
	const discordData = payload.channelData?.discord;
	let firstMessageComponents = Array.isArray(discordData?.components) && discordData.components.length > 0 ? discordData.components : void 0;
	let hasReplied = false;
	const sendMessage = async (content, files, components) => {
		const payload = files && files.length > 0 ? {
			content,
			...components ? { components } : {},
			files: files.map((file) => {
				if (file.data instanceof Blob) return {
					name: file.name,
					data: file.data
				};
				const arrayBuffer = Uint8Array.from(file.data).buffer;
				return {
					name: file.name,
					data: new Blob([arrayBuffer])
				};
			})
		} : {
			content,
			...components ? { components } : {}
		};
		await safeDiscordInteractionCall("interaction send", async () => {
			if (!preferFollowUp && !hasReplied) {
				await interaction.reply(payload);
				hasReplied = true;
				firstMessageComponents = void 0;
				return;
			}
			await interaction.followUp(payload);
			hasReplied = true;
			firstMessageComponents = void 0;
		});
	};
	if (reply.hasMedia) {
		const media = await Promise.all(reply.mediaUrls.map(async (url) => {
			const loaded = await loadWebMedia(url, { localRoots: params.mediaLocalRoots });
			return {
				name: loaded.fileName ?? "upload",
				data: loaded.buffer
			};
		}));
		const chunks = resolveTextChunksWithFallback(reply.text, chunkDiscordTextWithMode(reply.text, {
			maxChars: textLimit,
			maxLines: maxLinesPerMessage,
			chunkMode
		}));
		await sendMessage(chunks[0] ?? "", media, firstMessageComponents);
		for (const chunk of chunks.slice(1)) {
			if (!chunk.trim()) continue;
			await interaction.followUp({ content: chunk });
		}
		return;
	}
	if (!reply.hasText && !firstMessageComponents) return;
	const chunks = reply.text || firstMessageComponents ? resolveTextChunksWithFallback(reply.text, chunkDiscordTextWithMode(reply.text, {
		maxChars: textLimit,
		maxLines: maxLinesPerMessage,
		chunkMode
	})) : [];
	for (const chunk of chunks) {
		if (!chunk.trim() && !firstMessageComponents) continue;
		await sendMessage(chunk, void 0, firstMessageComponents);
	}
}
//#endregion
//#region extensions/discord/src/monitor/provider.allowlist.ts
function formatResolutionLogDetails(base, details) {
	const nonEmpty = details.map((value) => value?.trim()).filter((value) => Boolean(value));
	return nonEmpty.length > 0 ? `${base} (${nonEmpty.join("; ")})` : base;
}
function formatResolvedBase(input, target) {
	if (!target) return input;
	return input === target ? input : `${input}→${target}`;
}
function formatDiscordChannelResolved(entry) {
	const target = entry.channelId ? `${entry.guildId}/${entry.channelId}` : entry.guildId;
	return formatResolutionLogDetails(formatResolvedBase(entry.input, target), [
		entry.guildName ? `guild:${entry.guildName}` : void 0,
		entry.channelName ? `channel:${entry.channelName}` : void 0,
		entry.note
	]);
}
function formatDiscordChannelUnresolved(entry) {
	return formatResolutionLogDetails(entry.input, [
		entry.guildName ? `guild:${entry.guildName}` : entry.guildId ? `guildId:${entry.guildId}` : void 0,
		entry.channelName ? `channel:${entry.channelName}` : entry.channelId ? `channelId:${entry.channelId}` : void 0,
		entry.note
	]);
}
function formatDiscordUserResolved(entry) {
	const displayName = entry.name?.trim();
	const target = displayName || entry.id;
	return formatResolutionLogDetails(formatResolvedBase(entry.input, target), [
		displayName && entry.id ? `id:${entry.id}` : void 0,
		entry.guildName ? `guild:${entry.guildName}` : void 0,
		entry.note
	]);
}
function formatDiscordUserUnresolved(entry) {
	return formatResolutionLogDetails(entry.input, [
		entry.name ? `name:${entry.name}` : void 0,
		entry.guildName ? `guild:${entry.guildName}` : void 0,
		entry.note
	]);
}
function toGuildEntries(value) {
	if (!value || typeof value !== "object") return {};
	const out = {};
	for (const [key, entry] of Object.entries(value)) {
		if (!entry || typeof entry !== "object") continue;
		out[key] = entry;
	}
	return out;
}
function toAllowlistEntries(value) {
	if (!Array.isArray(value)) return;
	return value.map((entry) => String(entry).trim()).filter((entry) => Boolean(entry));
}
function hasGuildEntries(value) {
	return Object.keys(value).length > 0;
}
function collectChannelResolutionInputs(guildEntries) {
	const entries = [];
	for (const [guildKey, guildCfg] of Object.entries(guildEntries)) {
		if (guildKey === "*") continue;
		const channels = guildCfg?.channels ?? {};
		const channelKeys = Object.keys(channels).filter((key) => key !== "*");
		if (channelKeys.length === 0) {
			const input = /^\d+$/.test(guildKey) ? `guild:${guildKey}` : guildKey;
			entries.push({
				input,
				guildKey
			});
			continue;
		}
		for (const channelKey of channelKeys) entries.push({
			input: `${guildKey}/${channelKey}`,
			guildKey,
			channelKey
		});
	}
	return entries;
}
async function resolveGuildEntriesByChannelAllowlist(params) {
	const entries = collectChannelResolutionInputs(params.guildEntries);
	if (entries.length === 0) return params.guildEntries;
	try {
		const resolved = await resolveDiscordChannelAllowlist({
			token: params.token,
			entries: entries.map((entry) => entry.input),
			fetcher: params.fetcher
		});
		const sourceByInput = new Map(entries.map((entry) => [entry.input, entry]));
		const nextGuilds = { ...params.guildEntries };
		const mapping = [];
		const unresolved = [];
		for (const entry of resolved) {
			const source = sourceByInput.get(entry.input);
			if (!source) continue;
			const sourceGuild = params.guildEntries[source.guildKey] ?? {};
			if (!entry.resolved || !entry.guildId) {
				unresolved.push(formatDiscordChannelUnresolved(entry));
				continue;
			}
			mapping.push(formatDiscordChannelResolved(entry));
			const existing = nextGuilds[entry.guildId] ?? {};
			const mergedChannels = {
				...sourceGuild.channels,
				...existing.channels
			};
			const mergedGuild = {
				...sourceGuild,
				...existing,
				channels: mergedChannels
			};
			nextGuilds[entry.guildId] = mergedGuild;
			if (source.channelKey && entry.channelId) {
				const sourceChannel = sourceGuild.channels?.[source.channelKey];
				if (sourceChannel) nextGuilds[entry.guildId] = {
					...mergedGuild,
					channels: {
						...mergedChannels,
						[entry.channelId]: {
							...sourceChannel,
							...mergedChannels[entry.channelId]
						}
					}
				};
			}
		}
		summarizeMapping("discord channels", mapping, unresolved, params.runtime);
		return nextGuilds;
	} catch (err) {
		params.runtime.log?.(`discord channel resolve failed; using config entries. ${formatErrorMessage(err)}`);
		return params.guildEntries;
	}
}
async function resolveAllowFromByUserAllowlist(params) {
	const allowEntries = normalizeStringEntries(params.allowFrom).filter((entry) => entry !== "*");
	if (allowEntries.length === 0) return params.allowFrom;
	try {
		const { resolvedMap, mapping, unresolved } = buildAllowlistResolutionSummary(await resolveDiscordUserAllowlist({
			token: params.token,
			entries: allowEntries,
			fetcher: params.fetcher
		}), {
			formatResolved: formatDiscordUserResolved,
			formatUnresolved: formatDiscordUserUnresolved
		});
		const allowFrom = canonicalizeAllowlistWithResolvedIds({
			existing: params.allowFrom,
			resolvedMap
		});
		summarizeMapping("discord users", mapping, unresolved, params.runtime);
		return allowFrom;
	} catch (err) {
		params.runtime.log?.(`discord user resolve failed; using config entries. ${formatErrorMessage(err)}`);
		return params.allowFrom;
	}
}
function collectGuildUserEntries(guildEntries) {
	const userEntries = /* @__PURE__ */ new Set();
	for (const guild of Object.values(guildEntries)) {
		if (!guild || typeof guild !== "object") continue;
		addAllowlistUserEntriesFromConfigEntry(userEntries, guild);
		const channels = guild.channels ?? {};
		for (const channel of Object.values(channels)) addAllowlistUserEntriesFromConfigEntry(userEntries, channel);
	}
	return userEntries;
}
async function resolveGuildEntriesByUserAllowlist(params) {
	const userEntries = collectGuildUserEntries(params.guildEntries);
	if (userEntries.size === 0) return params.guildEntries;
	try {
		const { resolvedMap, mapping, unresolved } = buildAllowlistResolutionSummary(await resolveDiscordUserAllowlist({
			token: params.token,
			entries: Array.from(userEntries),
			fetcher: params.fetcher
		}), {
			formatResolved: formatDiscordUserResolved,
			formatUnresolved: formatDiscordUserUnresolved
		});
		const nextGuilds = { ...params.guildEntries };
		for (const [guildKey, guildConfig] of Object.entries(params.guildEntries)) {
			if (!guildConfig || typeof guildConfig !== "object") continue;
			const nextGuild = { ...guildConfig };
			const users = guildConfig.users;
			if (Array.isArray(users) && users.length > 0) nextGuild.users = canonicalizeAllowlistWithResolvedIds({
				existing: users,
				resolvedMap
			});
			const channels = guildConfig.channels ?? {};
			if (channels && typeof channels === "object") nextGuild.channels = patchAllowlistUsersInConfigEntries({
				entries: channels,
				resolvedMap,
				strategy: "canonicalize"
			});
			nextGuilds[guildKey] = nextGuild;
		}
		summarizeMapping("discord channel users", mapping, unresolved, params.runtime);
		return nextGuilds;
	} catch (err) {
		params.runtime.log?.(`discord channel user resolve failed; using config entries. ${formatErrorMessage(err)}`);
		return params.guildEntries;
	}
}
async function resolveDiscordAllowlistConfig(params) {
	let guildEntries = toGuildEntries(params.guildEntries);
	let allowFrom = toAllowlistEntries(params.allowFrom);
	if (hasGuildEntries(guildEntries)) guildEntries = await resolveGuildEntriesByChannelAllowlist({
		token: params.token,
		guildEntries,
		fetcher: params.fetcher,
		runtime: params.runtime
	});
	allowFrom = await resolveAllowFromByUserAllowlist({
		token: params.token,
		allowFrom,
		fetcher: params.fetcher,
		runtime: params.runtime
	});
	if (hasGuildEntries(guildEntries)) guildEntries = await resolveGuildEntriesByUserAllowlist({
		token: params.token,
		guildEntries,
		fetcher: params.fetcher,
		runtime: params.runtime
	});
	return {
		guildEntries: hasGuildEntries(guildEntries) ? guildEntries : void 0,
		allowFrom
	};
}
//#endregion
//#region extensions/discord/src/gateway-logging.ts
const INFO_DEBUG_MARKERS = [
	"Gateway websocket closed",
	"Gateway reconnect scheduled in",
	"Gateway forcing fresh IDENTIFY after"
];
const shouldPromoteGatewayDebug = (message) => INFO_DEBUG_MARKERS.some((marker) => message.includes(marker));
const formatGatewayMetrics = (metrics) => {
	if (metrics === null || metrics === void 0) return String(metrics);
	if (typeof metrics === "string") return metrics;
	if (typeof metrics === "number" || typeof metrics === "boolean" || typeof metrics === "bigint") return String(metrics);
	try {
		return JSON.stringify(metrics);
	} catch {
		return "[unserializable metrics]";
	}
};
function attachDiscordGatewayLogging(params) {
	const { emitter, runtime } = params;
	if (!emitter) return () => {};
	const onGatewayDebug = (msg) => {
		const message = String(msg);
		logVerbose(`discord gateway: ${message}`);
		if (shouldPromoteGatewayDebug(message)) runtime.log?.(`discord gateway: ${message}`);
	};
	const onGatewayWarning = (warning) => {
		logVerbose(`discord gateway warning: ${String(warning)}`);
	};
	const onGatewayMetrics = (metrics) => {
		logVerbose(`discord gateway metrics: ${formatGatewayMetrics(metrics)}`);
	};
	emitter.on("debug", onGatewayDebug);
	emitter.on("warning", onGatewayWarning);
	emitter.on("metrics", onGatewayMetrics);
	return () => {
		emitter.removeListener("debug", onGatewayDebug);
		emitter.removeListener("warning", onGatewayWarning);
		emitter.removeListener("metrics", onGatewayMetrics);
	};
}
//#endregion
//#region extensions/discord/src/monitor/provider.lifecycle.ts
const DISCORD_GATEWAY_READY_TIMEOUT_MS = 15e3;
const DISCORD_GATEWAY_RUNTIME_READY_TIMEOUT_MS = 3e4;
const DISCORD_GATEWAY_READY_POLL_MS = 250;
const DISCORD_GATEWAY_STARTUP_DISCONNECT_DRAIN_TIMEOUT_MS = 5e3;
const DISCORD_GATEWAY_STARTUP_TERMINATE_CLOSE_TIMEOUT_MS = 1e3;
async function restartGatewayAfterReadyTimeout(params) {
	if (!params.gateway || params.abortSignal?.aborted) return;
	const socket = params.gateway.ws;
	if (!socket) {
		params.gateway.disconnect();
		if (!params.abortSignal?.aborted) params.gateway.connect(false);
		return;
	}
	await new Promise((resolve, reject) => {
		let settled = false;
		let drainTimeout;
		let terminateCloseTimeout;
		const ignoreSocketError = () => {};
		const clearTimers = () => {
			if (drainTimeout) {
				clearTimeout(drainTimeout);
				drainTimeout = void 0;
			}
			if (terminateCloseTimeout) {
				clearTimeout(terminateCloseTimeout);
				terminateCloseTimeout = void 0;
			}
		};
		const cleanup = () => {
			clearTimers();
			socket.removeListener("close", onClose);
			socket.removeListener("error", ignoreSocketError);
		};
		const finishResolve = () => {
			if (settled) return;
			settled = true;
			cleanup();
			resolve();
		};
		const finishReject = (error) => {
			if (params.abortSignal?.aborted) {
				finishResolve();
				return;
			}
			if (settled) return;
			settled = true;
			cleanup();
			reject(error);
		};
		const onClose = () => {
			finishResolve();
		};
		socket.on("error", ignoreSocketError);
		socket.on("close", onClose);
		params.gateway?.disconnect();
		drainTimeout = setTimeout(() => {
			if (settled) return;
			if (typeof socket.terminate !== "function") {
				finishReject(/* @__PURE__ */ new Error(`discord gateway socket did not close within ${DISCORD_GATEWAY_STARTUP_DISCONNECT_DRAIN_TIMEOUT_MS}ms before restart`));
				return;
			}
			params.runtime.error?.(danger(`discord: startup restart waiting on a stale gateway socket for ${DISCORD_GATEWAY_STARTUP_DISCONNECT_DRAIN_TIMEOUT_MS}ms; forcing terminate before reconnect`));
			try {
				socket.terminate();
			} catch {
				finishReject(/* @__PURE__ */ new Error(`discord gateway socket did not close within ${DISCORD_GATEWAY_STARTUP_DISCONNECT_DRAIN_TIMEOUT_MS}ms before restart`));
				return;
			}
			terminateCloseTimeout = setTimeout(() => {
				finishReject(/* @__PURE__ */ new Error(`discord gateway socket did not close within ${DISCORD_GATEWAY_STARTUP_DISCONNECT_DRAIN_TIMEOUT_MS}ms before restart`));
			}, DISCORD_GATEWAY_STARTUP_TERMINATE_CLOSE_TIMEOUT_MS);
			terminateCloseTimeout.unref?.();
		}, DISCORD_GATEWAY_STARTUP_DISCONNECT_DRAIN_TIMEOUT_MS);
		drainTimeout.unref?.();
	});
	if (!params.abortSignal?.aborted) params.gateway.connect(false);
}
function parseGatewayCloseCode(message) {
	const match = /Gateway websocket closed:\s*(\d{3,5})/.exec(message);
	if (!match?.[1]) return;
	const code = Number.parseInt(match[1], 10);
	return Number.isFinite(code) ? code : void 0;
}
function createGatewayStatusObserver(params) {
	let forceStopHandler;
	let queuedForceStopError;
	let readyPollId;
	let readyTimeoutId;
	const shouldStop = () => params.abortSignal?.aborted || params.isLifecycleStopping();
	const clearReadyWatch = () => {
		if (readyPollId) {
			clearInterval(readyPollId);
			readyPollId = void 0;
		}
		if (readyTimeoutId) {
			clearTimeout(readyTimeoutId);
			readyTimeoutId = void 0;
		}
	};
	const triggerForceStop = (err) => {
		if (forceStopHandler) {
			forceStopHandler(err);
			return;
		}
		queuedForceStopError = err;
	};
	const pushConnectedStatus = (at) => {
		params.pushStatus({
			...createConnectedChannelStatusPatch(at),
			lastDisconnect: null,
			lastError: null
		});
	};
	const startReadyWatch = () => {
		clearReadyWatch();
		const pollConnected = () => {
			if (shouldStop()) {
				clearReadyWatch();
				return;
			}
			if (!params.gateway?.isConnected) return;
			clearReadyWatch();
			pushConnectedStatus(Date.now());
		};
		pollConnected();
		if (!readyTimeoutId) {
			readyPollId = setInterval(pollConnected, DISCORD_GATEWAY_READY_POLL_MS);
			readyPollId.unref?.();
			readyTimeoutId = setTimeout(() => {
				clearReadyWatch();
				if (shouldStop() || params.gateway?.isConnected) return;
				const at = Date.now();
				const error = /* @__PURE__ */ new Error(`discord gateway opened but did not reach READY within ${DISCORD_GATEWAY_RUNTIME_READY_TIMEOUT_MS}ms`);
				params.pushStatus({
					connected: false,
					lastEventAt: at,
					lastDisconnect: {
						at,
						error: "runtime-not-ready"
					},
					lastError: "runtime-not-ready"
				});
				params.runtime.error?.(danger(error.message));
				triggerForceStop(error);
			}, DISCORD_GATEWAY_RUNTIME_READY_TIMEOUT_MS);
			readyTimeoutId.unref?.();
		}
	};
	const onGatewayDebug = (msg) => {
		if (shouldStop()) return;
		const at = Date.now();
		const message = String(msg);
		if (message.includes("Gateway websocket opened")) {
			params.pushStatus({
				connected: false,
				lastEventAt: at
			});
			startReadyWatch();
			return;
		}
		if (message.includes("Gateway websocket closed")) {
			clearReadyWatch();
			const code = parseGatewayCloseCode(message);
			params.pushStatus({
				connected: false,
				lastEventAt: at,
				lastDisconnect: {
					at,
					...code !== void 0 ? { status: code } : {}
				}
			});
			return;
		}
		if (message.includes("Gateway reconnect scheduled in")) {
			clearReadyWatch();
			params.pushStatus({
				connected: false,
				lastEventAt: at,
				lastError: message
			});
		}
	};
	return {
		onGatewayDebug,
		clearReadyWatch,
		registerForceStop: (handler) => {
			forceStopHandler = handler;
			if (queuedForceStopError !== void 0) {
				const err = queuedForceStopError;
				queuedForceStopError = void 0;
				handler(err);
			}
		},
		dispose: () => {
			clearReadyWatch();
			forceStopHandler = void 0;
			queuedForceStopError = void 0;
		}
	};
}
async function waitForGatewayReady(params) {
	const waitUntilReady = async () => {
		const deadlineAt = Date.now() + DISCORD_GATEWAY_READY_TIMEOUT_MS;
		while (!params.abortSignal?.aborted) {
			if (await params.beforePoll?.() === "stop") return "stopped";
			if (params.gateway?.isConnected ?? true) {
				const at = Date.now();
				params.pushStatus?.({
					...createConnectedChannelStatusPatch(at),
					lastDisconnect: null,
					lastError: null
				});
				return "ready";
			}
			if (Date.now() >= deadlineAt) return "timeout";
			await new Promise((resolve) => {
				setTimeout(resolve, DISCORD_GATEWAY_READY_POLL_MS).unref?.();
			});
		}
		return "stopped";
	};
	if (await waitUntilReady() !== "timeout") return;
	if (!params.gateway) throw new Error(`discord gateway did not reach READY within ${DISCORD_GATEWAY_READY_TIMEOUT_MS}ms`);
	const restartAt = Date.now();
	params.runtime.error?.(danger(`discord: gateway was not ready after ${DISCORD_GATEWAY_READY_TIMEOUT_MS}ms; restarting gateway`));
	params.pushStatus?.({
		connected: false,
		lastEventAt: restartAt,
		lastDisconnect: {
			at: restartAt,
			error: "startup-not-ready"
		},
		lastError: "startup-not-ready"
	});
	if (params.abortSignal?.aborted) return;
	await params.beforeRestart?.();
	await restartGatewayAfterReadyTimeout({
		gateway: params.gateway,
		abortSignal: params.abortSignal,
		runtime: params.runtime
	});
	if (await waitUntilReady() === "timeout") throw new Error(`discord gateway did not reach READY within ${DISCORD_GATEWAY_READY_TIMEOUT_MS}ms after restart`);
}
async function runDiscordGatewayLifecycle(params) {
	const gateway = params.gateway;
	if (gateway) registerGateway(params.accountId, gateway);
	const gatewayEmitter = params.gatewaySupervisor.emitter ?? getDiscordGatewayEmitter(gateway);
	const stopGatewayLogging = attachDiscordGatewayLogging({
		emitter: gatewayEmitter,
		runtime: params.runtime
	});
	let lifecycleStopping = false;
	const pushStatus = (patch) => {
		params.statusSink?.(patch);
	};
	const statusObserver = createGatewayStatusObserver({
		gateway,
		abortSignal: params.abortSignal,
		runtime: params.runtime,
		pushStatus,
		isLifecycleStopping: () => lifecycleStopping
	});
	gatewayEmitter?.on("debug", statusObserver.onGatewayDebug);
	let sawDisallowedIntents = false;
	const handleGatewayEvent = (event) => {
		if (event.type === "disallowed-intents") {
			lifecycleStopping = true;
			sawDisallowedIntents = true;
			params.runtime.error?.(danger("discord: gateway closed with code 4014 (missing privileged gateway intents). Enable the required intents in the Discord Developer Portal or disable them in config."));
			return "stop";
		}
		if (event.shouldStopLifecycle) lifecycleStopping = true;
		params.runtime.error?.(danger(`discord gateway error: ${event.message}`));
		return event.shouldStopLifecycle ? "stop" : "continue";
	};
	const drainPendingGatewayErrors = () => params.gatewaySupervisor.drainPending((event) => {
		if (handleGatewayEvent(event) !== "stop") return "continue";
		if (event.type === "disallowed-intents") return "stop";
		throw event.err;
	});
	try {
		if (params.execApprovalsHandler) await params.execApprovalsHandler.start();
		if (drainPendingGatewayErrors() === "stop") return;
		await waitForGatewayReady({
			gateway,
			abortSignal: params.abortSignal,
			beforePoll: drainPendingGatewayErrors,
			pushStatus,
			runtime: params.runtime,
			beforeRestart: statusObserver.clearReadyWatch
		});
		if (drainPendingGatewayErrors() === "stop") return;
		await waitForDiscordGatewayStop({
			gateway: gateway ? { disconnect: () => gateway.disconnect() } : void 0,
			abortSignal: params.abortSignal,
			gatewaySupervisor: params.gatewaySupervisor,
			onGatewayEvent: handleGatewayEvent,
			registerForceStop: statusObserver.registerForceStop
		});
	} catch (err) {
		if (!sawDisallowedIntents && !params.isDisallowedIntentsError(err)) throw err;
	} finally {
		lifecycleStopping = true;
		params.gatewaySupervisor.detachLifecycle();
		unregisterGateway(params.accountId);
		stopGatewayLogging();
		statusObserver.dispose();
		gatewayEmitter?.removeListener("debug", statusObserver.onGatewayDebug);
		if (params.voiceManager) {
			await params.voiceManager.destroy();
			params.voiceManagerRef.current = null;
		}
		if (params.execApprovalsHandler) await params.execApprovalsHandler.stop();
		params.threadBindings.stop();
	}
}
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/voice/GuildDeleteListener.js
var GuildDelete = class extends GuildDeleteListener {
	async handle(data, client) {
		const voice = client.getPlugin("voice");
		if (voice) {
			const guild_id = data.guild.id;
			voice.adapters.get(guild_id)?.destroy();
		}
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/voice/VoiceServerUpdateListener.js
/**
* Forwards VOICE_SERVER_UPDATE events to voice adapters.
*/
var VoiceServerUpdate = class extends VoiceServerUpdateListener {
	async handle(data, client) {
		const voice = client.getPlugin("voice");
		if (!voice) return;
		const guildId = data.guild_id;
		if (guildId) voice.adapters.get(guildId)?.onVoiceServerUpdate(data);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/voice/VoiceStateUpdateListener.js
/**
* Forwards VOICE_STATE_UPDATE events to voice adapters.
*/
var VoiceStateUpdate = class extends VoiceStateUpdateListener {
	async handle(data, client) {
		const voice = client.getPlugin("voice");
		if (!voice) return;
		const guildId = data.guild_id;
		if (guildId) {
			const raw = {
				...data,
				member: data.rawMember
			};
			voice.adapters.get(guildId)?.onVoiceStateUpdate(raw);
		}
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/voice/VoicePlugin.js
var VoicePlugin = class extends Plugin {
	id = "voice";
	client;
	adapters = /* @__PURE__ */ new Map();
	shardingPlugin;
	gatewayPlugin;
	async registerClient(client) {
		this.client = client;
		const sharding = this.client.getPlugin("sharding");
		if (sharding) this.shardingPlugin = sharding;
		const gateway = this.client.getPlugin("gateway");
		if (gateway) this.gatewayPlugin = gateway;
		if (!this.gatewayPlugin && !this.shardingPlugin) throw new Error("Voice cannot be used without a gateway connection.");
		this.client.registerListener(new GuildDelete());
		this.client.registerListener(new VoiceStateUpdate());
		this.client.registerListener(new VoiceServerUpdate());
	}
	getGateway(guild_id) {
		if (this.shardingPlugin) return this.shardingPlugin.getShardForGuild(guild_id);
		return this.gatewayPlugin;
	}
	getGatewayAdapterCreator(guild_id) {
		const gateway = this.getGateway(guild_id);
		if (!gateway) throw new Error("Voice cannot be used without a gateway connection.");
		return (methods) => {
			this.adapters.set(guild_id, methods);
			return {
				sendPayload(payload) {
					try {
						gateway.send(payload, true);
						return true;
					} catch {
						return false;
					}
				},
				destroy: () => {
					this.adapters.delete(guild_id);
				}
			};
		};
	}
};
//#endregion
//#region extensions/discord/src/monitor/provider.startup.ts
function createDiscordStatusReadyListener(params) {
	return new class DiscordStatusReadyListener extends ReadyListener {
		async handle(_data, client) {
			const autoPresenceController = params.getAutoPresenceController();
			if (autoPresenceController?.enabled) {
				autoPresenceController.refresh();
				return;
			}
			const gateway = client.getPlugin("gateway");
			if (!gateway) return;
			const presence = resolveDiscordPresenceUpdate(params.discordConfig);
			if (!presence) return;
			gateway.updatePresence(presence);
		}
	}();
}
function createDiscordMonitorClient(params) {
	let autoPresenceController = null;
	const clientPlugins = [params.createGatewayPlugin({
		discordConfig: params.discordConfig,
		runtime: params.runtime
	})];
	if (params.voiceEnabled) clientPlugins.push(new VoicePlugin());
	const eventQueueOpts = {
		listenerTimeout: 12e4,
		...params.discordConfig.eventQueue
	};
	const readyListener = createDiscordStatusReadyListener({
		discordConfig: params.discordConfig,
		getAutoPresenceController: () => autoPresenceController
	});
	const client = params.createClient({
		baseUrl: "http://localhost",
		deploySecret: "a",
		clientId: params.applicationId,
		publicKey: "a",
		token: params.token,
		autoDeploy: false,
		eventQueue: eventQueueOpts
	}, {
		commands: params.commands,
		listeners: [readyListener],
		components: params.components,
		modals: params.modals
	}, clientPlugins);
	const gateway = client.getPlugin("gateway");
	const gatewaySupervisor = params.createGatewaySupervisor({
		gateway,
		isDisallowedIntentsError: params.isDisallowedIntentsError,
		runtime: params.runtime
	});
	if (gateway) {
		autoPresenceController = params.createAutoPresenceController({
			accountId: params.accountId,
			discordConfig: params.discordConfig,
			gateway,
			log: (message) => params.runtime.log?.(message)
		});
		autoPresenceController.start();
	}
	return {
		client,
		gateway,
		gatewaySupervisor,
		autoPresenceController,
		eventQueueOpts
	};
}
async function fetchDiscordBotIdentity(params) {
	params.logStartupPhase("fetch-bot-identity:start");
	try {
		const botUser = await params.client.fetchUser("@me");
		const botUserId = botUser?.id;
		const botUserName = botUser?.username?.trim() || botUser?.globalName?.trim() || void 0;
		params.logStartupPhase("fetch-bot-identity:done", `botUserId=${botUserId ?? "<missing>"} botUserName=${botUserName ?? "<missing>"}`);
		return {
			botUserId,
			botUserName
		};
	} catch (err) {
		params.runtime.error?.(danger(`discord: failed to fetch bot identity: ${String(err)}`));
		params.logStartupPhase("fetch-bot-identity:error", String(err));
		return {
			botUserId: void 0,
			botUserName: void 0
		};
	}
}
function registerDiscordMonitorListeners(params) {
	registerDiscordListener(params.client.listeners, new DiscordMessageListener(params.messageHandler, params.logger, params.trackInboundEvent, { timeoutMs: params.eventQueueListenerTimeoutMs }));
	const reactionListenerOptions = {
		cfg: params.cfg,
		accountId: params.accountId,
		runtime: params.runtime,
		botUserId: params.botUserId,
		dmEnabled: params.dmEnabled,
		groupDmEnabled: params.groupDmEnabled,
		groupDmChannels: params.groupDmChannels ?? [],
		dmPolicy: params.dmPolicy,
		allowFrom: params.allowFrom ?? [],
		groupPolicy: params.groupPolicy,
		allowNameMatching: isDangerousNameMatchingEnabled(params.discordConfig),
		guildEntries: params.guildEntries,
		logger: params.logger,
		onEvent: params.trackInboundEvent
	};
	registerDiscordListener(params.client.listeners, new DiscordReactionListener(reactionListenerOptions));
	registerDiscordListener(params.client.listeners, new DiscordReactionRemoveListener(reactionListenerOptions));
	registerDiscordListener(params.client.listeners, new DiscordThreadUpdateListener(params.cfg, params.accountId, params.logger));
	if (params.discordConfig.intents?.presence) {
		registerDiscordListener(params.client.listeners, new DiscordPresenceListener({
			logger: params.logger,
			accountId: params.accountId
		}));
		params.runtime.log?.("discord: GuildPresences intent enabled — presence listener registered");
	}
}
//#endregion
//#region extensions/discord/src/monitor/rest-fetch.ts
function resolveDiscordRestFetch(proxyUrl, runtime) {
	const proxy = proxyUrl?.trim();
	if (!proxy) return fetch;
	try {
		const agent = new ProxyAgent(proxy);
		const fetcher = ((input, init) => fetch$1(input, {
			...init,
			dispatcher: agent
		}));
		runtime.log?.("discord: rest proxy enabled");
		return wrapFetchWithAbortSignal(fetcher);
	} catch (err) {
		runtime.error?.(danger(`discord: invalid rest proxy: ${String(err)}`));
		return fetch;
	}
}
//#endregion
//#region extensions/discord/src/monitor/startup-status.ts
function formatDiscordStartupStatusMessage(params) {
	const identitySuffix = params.botIdentity ? ` as ${params.botIdentity}` : "";
	if (params.gatewayReady) return `logged in to discord${identitySuffix}`;
	return `discord client initialized${identitySuffix}; awaiting gateway readiness`;
}
//#endregion
//#region extensions/discord/src/monitor/provider.ts
let discordVoiceRuntimePromise;
let discordProviderSessionRuntimePromise;
let fetchDiscordApplicationIdForTesting;
let createDiscordNativeCommandForTesting;
let runDiscordGatewayLifecycleForTesting;
let createDiscordGatewayPluginForTesting;
let createDiscordGatewaySupervisorForTesting;
let createClientForTesting;
let getPluginCommandSpecsForTesting;
let resolveDiscordAccountForTesting;
let resolveNativeCommandsEnabledForTesting;
let resolveNativeSkillsEnabledForTesting;
let listNativeCommandSpecsForConfigForTesting;
let listSkillCommandsForAgentsForTesting;
let isVerboseForTesting;
let shouldLogVerboseForTesting;
async function loadDiscordVoiceRuntime() {
	discordVoiceRuntimePromise ??= import("./manager.runtime-Ct8g7s7u.js");
	return await discordVoiceRuntimePromise;
}
async function loadDiscordProviderSessionRuntime() {
	discordProviderSessionRuntimePromise ??= import("./provider-session.runtime-CjKH-DqP.js");
	return await discordProviderSessionRuntimePromise;
}
function formatThreadBindingDurationForConfigLabel(durationMs) {
	const label = formatThreadBindingDurationLabel(durationMs);
	return label === "disabled" ? "off" : label;
}
function appendPluginCommandSpecs(params) {
	const merged = [...params.commandSpecs];
	const existingNames = new Set(merged.map((spec) => spec.name.trim().toLowerCase()).filter(Boolean));
	for (const pluginCommand of (getPluginCommandSpecsForTesting ?? getPluginCommandSpecs)("discord")) {
		const normalizedName = pluginCommand.name.trim().toLowerCase();
		if (!normalizedName) continue;
		if (existingNames.has(normalizedName)) {
			params.runtime.error?.(danger(`discord: plugin command "/${normalizedName}" duplicates an existing native command. Skipping.`));
			continue;
		}
		existingNames.add(normalizedName);
		merged.push({
			name: pluginCommand.name,
			description: pluginCommand.description,
			acceptsArgs: pluginCommand.acceptsArgs
		});
	}
	return merged;
}
const DISCORD_ACP_STATUS_PROBE_TIMEOUT_MS = 8e3;
const DISCORD_ACP_STALE_RUNNING_ACTIVITY_MS = 120 * 1e3;
function isLegacyMissingSessionError(message) {
	return message.includes("Session is not ACP-enabled") || message.includes("ACP session metadata missing");
}
function classifyAcpStatusProbeError(params) {
	if (params.isAcpRuntimeError(params.error) && params.error.code === "ACP_SESSION_INIT_FAILED") return {
		status: "stale",
		reason: "session-init-failed"
	};
	if (isLegacyMissingSessionError(params.error instanceof Error ? params.error.message : String(params.error))) return {
		status: "stale",
		reason: "session-missing"
	};
	return params.isStaleRunning ? {
		status: "stale",
		reason: "status-error-running-stale"
	} : {
		status: "uncertain",
		reason: "status-error"
	};
}
async function probeDiscordAcpBindingHealth(params) {
	const { getAcpSessionManager, isAcpRuntimeError } = await loadDiscordProviderSessionRuntime();
	const manager = getAcpSessionManager();
	const statusProbeAbortController = new AbortController();
	const statusPromise = manager.getSessionStatus({
		cfg: params.cfg,
		sessionKey: params.sessionKey,
		signal: statusProbeAbortController.signal
	}).then((status) => ({
		kind: "status",
		status
	})).catch((error) => ({
		kind: "error",
		error
	}));
	let timeoutTimer = null;
	const timeoutPromise = new Promise((resolve) => {
		timeoutTimer = setTimeout(() => resolve({ kind: "timeout" }), DISCORD_ACP_STATUS_PROBE_TIMEOUT_MS);
		timeoutTimer.unref?.();
	});
	const result = await Promise.race([statusPromise, timeoutPromise]);
	if (timeoutTimer) clearTimeout(timeoutTimer);
	if (result.kind === "timeout") statusProbeAbortController.abort();
	const runningForMs = params.storedState === "running" && Number.isFinite(params.lastActivityAt) ? Date.now() - Math.max(0, Math.floor(params.lastActivityAt ?? 0)) : 0;
	const isStaleRunning = params.storedState === "running" && runningForMs >= DISCORD_ACP_STALE_RUNNING_ACTIVITY_MS;
	if (result.kind === "timeout") return isStaleRunning ? {
		status: "stale",
		reason: "status-timeout-running-stale"
	} : {
		status: "uncertain",
		reason: "status-timeout"
	};
	if (result.kind === "error") return classifyAcpStatusProbeError({
		error: result.error,
		isStaleRunning,
		isAcpRuntimeError
	});
	if (result.status.state === "error") return {
		status: "uncertain",
		reason: "status-error-state"
	};
	return { status: "healthy" };
}
async function deployDiscordCommands(params) {
	if (!params.enabled) return;
	const startupStartedAt = params.startupStartedAt ?? Date.now();
	const accountId = params.accountId ?? "default";
	const maxAttempts = 3;
	const maxRetryDelayMs = 15e3;
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
	const isDailyCreateLimit = (err) => err instanceof RateLimitError && err.discordCode === 30034 && /daily application command creates/i.test(err.message);
	const restClient = params.client.rest;
	const originalPut = restClient.put.bind(restClient);
	const previousQueueRequests = restClient.options?.queueRequests;
	restClient.put = async (path, data, query) => {
		const startedAt = Date.now();
		const body = data && typeof data === "object" && "body" in data ? data.body : void 0;
		const commandCount = Array.isArray(body) ? body.length : void 0;
		const bodyBytes = body === void 0 ? void 0 : Buffer.byteLength(typeof body === "string" ? body : JSON.stringify(body), "utf8");
		if ((shouldLogVerboseForTesting ?? shouldLogVerbose)()) params.runtime.log?.(`discord startup [${accountId}] deploy-rest:put:start ${Math.max(0, Date.now() - startupStartedAt)}ms path=${path}${typeof commandCount === "number" ? ` commands=${commandCount}` : ""}${typeof bodyBytes === "number" ? ` bytes=${bodyBytes}` : ""}`);
		try {
			const result = await originalPut(path, data, query);
			if ((shouldLogVerboseForTesting ?? shouldLogVerbose)()) params.runtime.log?.(`discord startup [${accountId}] deploy-rest:put:done ${Math.max(0, Date.now() - startupStartedAt)}ms path=${path} requestMs=${Date.now() - startedAt}`);
			return result;
		} catch (err) {
			attachDiscordDeployRequestBody(err, body);
			const details = formatDiscordDeployErrorDetails(err);
			params.runtime.error?.(`discord startup [${accountId}] deploy-rest:put:error ${Math.max(0, Date.now() - startupStartedAt)}ms path=${path} requestMs=${Date.now() - startedAt} error=${formatErrorMessage(err)}${details}`);
			throw err;
		}
	};
	try {
		if (restClient.options) restClient.options.queueRequests = false;
		logVerbose("discord: native commands using Carbon reconcile path");
		for (let attempt = 1; attempt <= maxAttempts; attempt += 1) try {
			await params.client.handleDeployRequest();
			return;
		} catch (err) {
			if (isDailyCreateLimit(err)) {
				params.runtime.log?.(warn(`discord: native command deploy skipped for ${accountId}; daily application command create limit reached. Existing slash commands stay active until Discord resets the quota.`));
				return;
			}
			if (!(err instanceof RateLimitError) || attempt >= maxAttempts) throw err;
			const retryAfterMs = Math.max(0, Math.ceil(err.retryAfter * 1e3));
			if (retryAfterMs > maxRetryDelayMs) {
				params.runtime.log?.(warn(`discord: native command deploy skipped for ${accountId}; retry_after=${retryAfterMs}ms exceeds startup budget. Existing slash commands stay active.`));
				return;
			}
			if ((shouldLogVerboseForTesting ?? shouldLogVerbose)()) params.runtime.log?.(`discord startup [${accountId}] deploy-retry ${Math.max(0, Date.now() - startupStartedAt)}ms attempt=${attempt}/${maxAttempts - 1} retryAfterMs=${retryAfterMs} scope=${err.scope ?? "unknown"} code=${err.discordCode ?? "unknown"}`);
			await sleep(retryAfterMs);
		}
	} catch (err) {
		const details = formatDiscordDeployErrorDetails(err);
		params.runtime.error?.(danger(`discord: failed to deploy native commands: ${formatErrorMessage(err)}${details}`));
	} finally {
		if (restClient.options) restClient.options.queueRequests = previousQueueRequests;
		restClient.put = originalPut;
	}
}
function formatDiscordStartupGatewayState(gateway) {
	if (!gateway) return "gateway=missing";
	const reconnectAttempts = gateway.reconnectAttempts;
	return `gatewayConnected=${gateway.isConnected ? "true" : "false"} reconnectAttempts=${typeof reconnectAttempts === "number" ? reconnectAttempts : "na"}`;
}
function logDiscordStartupPhase(params) {
	if (!(isVerboseForTesting ?? isVerbose)()) return;
	const elapsedMs = Math.max(0, Date.now() - params.startAt);
	const suffix = [params.details, formatDiscordStartupGatewayState(params.gateway)].filter((value) => Boolean(value)).join(" ");
	params.runtime.log?.(`discord startup [${params.accountId}] ${params.phase} ${elapsedMs}ms${suffix ? ` ${suffix}` : ""}`);
}
const DISCORD_DEPLOY_REJECTED_ENTRY_LIMIT = 3;
function attachDiscordDeployRequestBody(err, body) {
	if (!err || typeof err !== "object" || body === void 0) return;
	const deployErr = err;
	if (deployErr.deployRequestBody === void 0) deployErr.deployRequestBody = body;
}
function stringifyDiscordDeployField(value) {
	if (typeof value === "string") return JSON.stringify(value);
	try {
		return JSON.stringify(value);
	} catch {
		return inspect(value, {
			depth: 2,
			breakLength: 120
		});
	}
}
function readDiscordDeployRejectedFields(value) {
	if (Array.isArray(value)) return value.filter((entry) => typeof entry === "string").slice(0, 6);
	if (!value || typeof value !== "object") return [];
	return Object.keys(value).slice(0, 6);
}
function resolveDiscordRejectedDeployEntriesSource(rawBody) {
	if (!rawBody || typeof rawBody !== "object") return null;
	const payload = rawBody;
	const source = (payload.errors && typeof payload.errors === "object" ? payload.errors : void 0) ?? rawBody;
	return source && typeof source === "object" ? source : null;
}
function formatDiscordRejectedDeployEntries(params) {
	const requestBody = Array.isArray(params.requestBody) ? params.requestBody : null;
	const rejectedEntriesSource = resolveDiscordRejectedDeployEntriesSource(params.rawBody);
	if (!rejectedEntriesSource || !requestBody || requestBody.length === 0) return [];
	return Object.entries(rejectedEntriesSource).filter(([key]) => /^\d+$/.test(key)).slice(0, DISCORD_DEPLOY_REJECTED_ENTRY_LIMIT).flatMap(([key, value]) => {
		const index = Number.parseInt(key, 10);
		if (!Number.isFinite(index) || index < 0 || index >= requestBody.length) return [];
		const command = requestBody[index];
		if (!command || typeof command !== "object") return [`#${index} fields=${readDiscordDeployRejectedFields(value).join("|") || "unknown"}`];
		const payload = command;
		const parts = [`#${index}`, `fields=${readDiscordDeployRejectedFields(value).join("|") || "unknown"}`];
		if (typeof payload.name === "string" && payload.name.trim().length > 0) parts.push(`name=${payload.name}`);
		if (payload.description !== void 0) parts.push(`description=${stringifyDiscordDeployField(payload.description)}`);
		if (Array.isArray(payload.options) && payload.options.length > 0) parts.push(`options=${payload.options.length}`);
		return [parts.join(" ")];
	});
}
function formatDiscordDeployErrorDetails(err) {
	if (!err || typeof err !== "object") return "";
	const status = err.status;
	const discordCode = err.discordCode;
	const rawBody = err.rawBody;
	const requestBody = err.deployRequestBody;
	const details = [];
	if (typeof status === "number") details.push(`status=${status}`);
	if (typeof discordCode === "number" || typeof discordCode === "string") details.push(`code=${discordCode}`);
	if (rawBody !== void 0) {
		let bodyText = "";
		try {
			bodyText = JSON.stringify(rawBody);
		} catch {
			bodyText = typeof rawBody === "string" ? rawBody : inspect(rawBody, {
				depth: 3,
				breakLength: 120
			});
		}
		if (bodyText) {
			const maxLen = 800;
			const trimmed = bodyText.length > maxLen ? `${bodyText.slice(0, maxLen)}...` : bodyText;
			details.push(`body=${trimmed}`);
		}
	}
	const rejectedEntries = formatDiscordRejectedDeployEntries({
		rawBody,
		requestBody
	});
	if (rejectedEntries.length > 0) details.push(`rejected=${rejectedEntries.join("; ")}`);
	return details.length > 0 ? ` (${details.join(", ")})` : "";
}
const DISCORD_DISALLOWED_INTENTS_CODE = GatewayCloseCodes.DisallowedIntents;
function isDiscordDisallowedIntentsError(err) {
	if (!err) return false;
	return formatErrorMessage(err).includes(String(DISCORD_DISALLOWED_INTENTS_CODE));
}
async function monitorDiscordProvider(opts = {}) {
	const startupStartedAt = Date.now();
	const cfg = opts.config ?? loadConfig();
	const account = (resolveDiscordAccountForTesting ?? resolveDiscordAccount)({
		cfg,
		accountId: opts.accountId
	});
	const token = normalizeDiscordToken(opts.token ?? void 0, "channels.discord.token") ?? account.token;
	if (!token) throw new Error(`Discord bot token missing for account "${account.accountId}" (set discord.accounts.${account.accountId}.token or DISCORD_BOT_TOKEN for default).`);
	const runtime = opts.runtime ?? createNonExitingRuntime();
	const rawDiscordCfg = account.config;
	const discordRootThreadBindings = cfg.channels?.discord?.threadBindings;
	const discordAccountThreadBindings = cfg.channels?.discord?.accounts?.[account.accountId]?.threadBindings;
	const discordRestFetch = resolveDiscordRestFetch(rawDiscordCfg.proxy, runtime);
	const dmConfig = rawDiscordCfg.dm;
	let guildEntries = rawDiscordCfg.guilds;
	const defaultGroupPolicy = resolveDefaultGroupPolicy(cfg);
	const { groupPolicy, providerMissingFallbackApplied } = resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: cfg.channels?.discord !== void 0,
		groupPolicy: rawDiscordCfg.groupPolicy,
		defaultGroupPolicy
	});
	const discordCfg = rawDiscordCfg.groupPolicy === groupPolicy ? rawDiscordCfg : {
		...rawDiscordCfg,
		groupPolicy
	};
	warnMissingProviderGroupPolicyFallbackOnce({
		providerMissingFallbackApplied,
		providerKey: "discord",
		accountId: account.accountId,
		blockedLabel: GROUP_POLICY_BLOCKED_LABEL.guild,
		log: (message) => runtime.log?.(warn(message))
	});
	let allowFrom = discordCfg.allowFrom ?? dmConfig?.allowFrom;
	const mediaMaxBytes = (opts.mediaMaxMb ?? discordCfg.mediaMaxMb ?? 8) * 1024 * 1024;
	const textLimit = resolveTextChunkLimit(cfg, "discord", account.accountId, { fallbackLimit: 2e3 });
	const historyLimit = Math.max(0, opts.historyLimit ?? discordCfg.historyLimit ?? cfg.messages?.groupChat?.historyLimit ?? 20);
	const replyToMode = opts.replyToMode ?? discordCfg.replyToMode ?? "off";
	const dmEnabled = dmConfig?.enabled ?? true;
	const dmPolicy = discordCfg.dmPolicy ?? dmConfig?.policy ?? "pairing";
	const discordProviderSessionRuntime = await loadDiscordProviderSessionRuntime();
	const threadBindingIdleTimeoutMs = discordProviderSessionRuntime.resolveThreadBindingIdleTimeoutMs({
		channelIdleHoursRaw: discordAccountThreadBindings?.idleHours ?? discordRootThreadBindings?.idleHours,
		sessionIdleHoursRaw: cfg.session?.threadBindings?.idleHours
	});
	const threadBindingMaxAgeMs = discordProviderSessionRuntime.resolveThreadBindingMaxAgeMs({
		channelMaxAgeHoursRaw: discordAccountThreadBindings?.maxAgeHours ?? discordRootThreadBindings?.maxAgeHours,
		sessionMaxAgeHoursRaw: cfg.session?.threadBindings?.maxAgeHours
	});
	const threadBindingsEnabled = discordProviderSessionRuntime.resolveThreadBindingsEnabled({
		channelEnabledRaw: discordAccountThreadBindings?.enabled ?? discordRootThreadBindings?.enabled,
		sessionEnabledRaw: cfg.session?.threadBindings?.enabled
	});
	const groupDmEnabled = dmConfig?.groupEnabled ?? false;
	const groupDmChannels = dmConfig?.groupChannels;
	const nativeEnabled = (resolveNativeCommandsEnabledForTesting ?? resolveNativeCommandsEnabled)({
		providerId: "discord",
		providerSetting: discordCfg.commands?.native,
		globalSetting: cfg.commands?.native
	});
	const nativeSkillsEnabled = (resolveNativeSkillsEnabledForTesting ?? resolveNativeSkillsEnabled)({
		providerId: "discord",
		providerSetting: discordCfg.commands?.nativeSkills,
		globalSetting: cfg.commands?.nativeSkills
	});
	const nativeDisabledExplicit = isNativeCommandsExplicitlyDisabled({
		providerSetting: discordCfg.commands?.native,
		globalSetting: cfg.commands?.native
	});
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const slashCommand = resolveDiscordSlashCommandConfig(discordCfg.slashCommand);
	const sessionPrefix = "discord:slash";
	const ephemeralDefault = slashCommand.ephemeral;
	const voiceEnabled = discordCfg.voice?.enabled !== false;
	const allowlistResolved = await resolveDiscordAllowlistConfig({
		token,
		guildEntries,
		allowFrom,
		fetcher: discordRestFetch,
		runtime
	});
	guildEntries = allowlistResolved.guildEntries;
	allowFrom = allowlistResolved.allowFrom;
	if ((shouldLogVerboseForTesting ?? shouldLogVerbose)()) {
		const allowFromSummary = summarizeStringEntries({
			entries: allowFrom ?? [],
			limit: 4,
			emptyText: "any"
		});
		const groupDmChannelSummary = summarizeStringEntries({
			entries: groupDmChannels ?? [],
			limit: 4,
			emptyText: "any"
		});
		const guildSummary = summarizeStringEntries({
			entries: Object.keys(guildEntries ?? {}),
			limit: 4,
			emptyText: "any"
		});
		logVerbose(`discord: config dm=${dmEnabled ? "on" : "off"} dmPolicy=${dmPolicy} allowFrom=${allowFromSummary} groupDm=${groupDmEnabled ? "on" : "off"} groupDmChannels=${groupDmChannelSummary} groupPolicy=${groupPolicy} guilds=${guildSummary} historyLimit=${historyLimit} mediaMaxMb=${Math.round(mediaMaxBytes / (1024 * 1024))} native=${nativeEnabled ? "on" : "off"} nativeSkills=${nativeSkillsEnabled ? "on" : "off"} accessGroups=${useAccessGroups ? "on" : "off"} threadBindings=${threadBindingsEnabled ? "on" : "off"} threadIdleTimeout=${formatThreadBindingDurationForConfigLabel(threadBindingIdleTimeoutMs)} threadMaxAge=${formatThreadBindingDurationForConfigLabel(threadBindingMaxAgeMs)}`);
	}
	logDiscordStartupPhase({
		runtime,
		accountId: account.accountId,
		phase: "fetch-application-id:start",
		startAt: startupStartedAt
	});
	const applicationId = await (fetchDiscordApplicationIdForTesting ?? fetchDiscordApplicationId)(token, 4e3, discordRestFetch);
	if (!applicationId) throw new Error("Failed to resolve Discord application id");
	logDiscordStartupPhase({
		runtime,
		accountId: account.accountId,
		phase: "fetch-application-id:done",
		startAt: startupStartedAt,
		details: `applicationId=${applicationId}`
	});
	const maxDiscordCommands = 100;
	let skillCommands = nativeEnabled && nativeSkillsEnabled ? (listSkillCommandsForAgentsForTesting ?? listSkillCommandsForAgents)({ cfg }) : [];
	let commandSpecs = nativeEnabled ? (listNativeCommandSpecsForConfigForTesting ?? listNativeCommandSpecsForConfig)(cfg, {
		skillCommands,
		provider: "discord"
	}) : [];
	if (nativeEnabled) commandSpecs = appendPluginCommandSpecs({
		commandSpecs,
		runtime
	});
	const initialCommandCount = commandSpecs.length;
	if (nativeEnabled && nativeSkillsEnabled && commandSpecs.length > maxDiscordCommands) {
		skillCommands = [];
		commandSpecs = (listNativeCommandSpecsForConfigForTesting ?? listNativeCommandSpecsForConfig)(cfg, {
			skillCommands: [],
			provider: "discord"
		});
		commandSpecs = appendPluginCommandSpecs({
			commandSpecs,
			runtime
		});
		runtime.log?.(warn(`discord: ${initialCommandCount} commands exceeds limit; removing per-skill commands and keeping /skill.`));
	}
	if (nativeEnabled && commandSpecs.length > maxDiscordCommands) runtime.log?.(warn(`discord: ${commandSpecs.length} commands exceeds limit; some commands may fail to deploy.`));
	const voiceManagerRef = { current: null };
	const threadBindings = threadBindingsEnabled ? discordProviderSessionRuntime.createThreadBindingManager({
		accountId: account.accountId,
		token,
		cfg,
		idleTimeoutMs: threadBindingIdleTimeoutMs,
		maxAgeMs: threadBindingMaxAgeMs
	}) : discordProviderSessionRuntime.createNoopThreadBindingManager(account.accountId);
	if (threadBindingsEnabled) {
		const uncertainProbeKeys = /* @__PURE__ */ new Set();
		const reconciliation = await discordProviderSessionRuntime.reconcileAcpThreadBindingsOnStartup({
			cfg,
			accountId: account.accountId,
			sendFarewell: false,
			healthProbe: async ({ sessionKey, session }) => {
				const probe = await probeDiscordAcpBindingHealth({
					cfg,
					sessionKey,
					storedState: session.acp?.state,
					lastActivityAt: session.acp?.lastActivityAt
				});
				if (probe.status === "uncertain") uncertainProbeKeys.add(`${sessionKey}${probe.reason ? ` (${probe.reason})` : ""}`);
				return probe;
			}
		});
		if (reconciliation.removed > 0) logVerbose(`discord: removed ${reconciliation.removed}/${reconciliation.checked} stale ACP thread bindings on startup for account ${account.accountId}: ${reconciliation.staleSessionKeys.join(", ")}`);
		if (uncertainProbeKeys.size > 0) logVerbose(`discord: ACP thread-binding health probe uncertain for account ${account.accountId}: ${[...uncertainProbeKeys].join(", ")}`);
	}
	let lifecycleStarted = false;
	let gatewaySupervisor;
	let deactivateMessageHandler;
	let autoPresenceController = null;
	let lifecycleGateway;
	let earlyGatewayEmitter = gatewaySupervisor?.emitter;
	let onEarlyGatewayDebug;
	try {
		const commands = commandSpecs.map((spec) => (createDiscordNativeCommandForTesting ?? createDiscordNativeCommand)({
			command: spec,
			cfg,
			discordConfig: discordCfg,
			accountId: account.accountId,
			sessionPrefix,
			ephemeralDefault,
			threadBindings
		}));
		if (nativeEnabled && voiceEnabled) commands.push(createDiscordVoiceCommand({
			cfg,
			discordConfig: discordCfg,
			accountId: account.accountId,
			groupPolicy,
			useAccessGroups,
			getManager: () => voiceManagerRef.current,
			ephemeralDefault
		}));
		const execApprovalsConfig = discordCfg.execApprovals ?? {};
		const execApprovalsHandler = isDiscordExecApprovalClientEnabled({
			cfg,
			accountId: account.accountId,
			configOverride: execApprovalsConfig
		}) ? new DiscordExecApprovalHandler({
			token,
			accountId: account.accountId,
			config: execApprovalsConfig,
			cfg,
			runtime
		}) : null;
		const agentComponentsEnabled = (discordCfg.agentComponents ?? {}).enabled ?? true;
		const components = [
			createDiscordCommandArgFallbackButton({
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				sessionPrefix,
				threadBindings
			}),
			createDiscordModelPickerFallbackButton({
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				sessionPrefix,
				threadBindings
			}),
			createDiscordModelPickerFallbackSelect({
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				sessionPrefix,
				threadBindings
			})
		];
		const modals = [];
		if (execApprovalsHandler) components.push(createExecApprovalButton({ handler: execApprovalsHandler }));
		if (agentComponentsEnabled) {
			const componentContext = {
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				guildEntries,
				allowFrom,
				dmPolicy,
				runtime,
				token
			};
			components.push(createAgentComponentButton(componentContext));
			components.push(createAgentSelectMenu(componentContext));
			components.push(createDiscordComponentButton(componentContext));
			components.push(createDiscordComponentStringSelect(componentContext));
			components.push(createDiscordComponentUserSelect(componentContext));
			components.push(createDiscordComponentRoleSelect(componentContext));
			components.push(createDiscordComponentMentionableSelect(componentContext));
			components.push(createDiscordComponentChannelSelect(componentContext));
			modals.push(createDiscordComponentModal(componentContext));
		}
		const { client, gateway, gatewaySupervisor: createdGatewaySupervisor, autoPresenceController: createdAutoPresenceController, eventQueueOpts } = createDiscordMonitorClient({
			accountId: account.accountId,
			applicationId,
			token,
			commands,
			components,
			modals,
			voiceEnabled,
			discordConfig: discordCfg,
			runtime,
			createClient: createClientForTesting ?? ((...args) => new Client(...args)),
			createGatewayPlugin: createDiscordGatewayPluginForTesting ?? createDiscordGatewayPlugin,
			createGatewaySupervisor: createDiscordGatewaySupervisorForTesting ?? createDiscordGatewaySupervisor,
			createAutoPresenceController: createDiscordAutoPresenceController,
			isDisallowedIntentsError: isDiscordDisallowedIntentsError
		});
		lifecycleGateway = gateway;
		gatewaySupervisor = createdGatewaySupervisor;
		autoPresenceController = createdAutoPresenceController;
		earlyGatewayEmitter = gatewaySupervisor.emitter;
		onEarlyGatewayDebug = (msg) => {
			if (!(isVerboseForTesting ?? isVerbose)()) return;
			runtime.log?.(`discord startup [${account.accountId}] gateway-debug ${Math.max(0, Date.now() - startupStartedAt)}ms ${String(msg)}`);
		};
		earlyGatewayEmitter?.on("debug", onEarlyGatewayDebug);
		logDiscordStartupPhase({
			runtime,
			accountId: account.accountId,
			phase: "deploy-commands:start",
			startAt: startupStartedAt,
			gateway: lifecycleGateway,
			details: `native=${nativeEnabled ? "on" : "off"} reconcile=on commandCount=${commands.length}`
		});
		await deployDiscordCommands({
			client,
			runtime,
			enabled: nativeEnabled,
			accountId: account.accountId,
			startupStartedAt
		});
		logDiscordStartupPhase({
			runtime,
			accountId: account.accountId,
			phase: "deploy-commands:done",
			startAt: startupStartedAt,
			gateway: lifecycleGateway
		});
		const logger = createSubsystemLogger("discord/monitor");
		const guildHistories = /* @__PURE__ */ new Map();
		let { botUserId, botUserName } = await fetchDiscordBotIdentity({
			client,
			runtime,
			logStartupPhase: (phase, details) => logDiscordStartupPhase({
				runtime,
				accountId: account.accountId,
				phase,
				startAt: startupStartedAt,
				gateway: lifecycleGateway,
				details
			})
		});
		let voiceManager = null;
		if (nativeDisabledExplicit) {
			logDiscordStartupPhase({
				runtime,
				accountId: account.accountId,
				phase: "clear-native-commands:start",
				startAt: startupStartedAt,
				gateway: lifecycleGateway
			});
			await clearDiscordNativeCommands({
				client,
				applicationId,
				runtime
			});
			logDiscordStartupPhase({
				runtime,
				accountId: account.accountId,
				phase: "clear-native-commands:done",
				startAt: startupStartedAt,
				gateway: lifecycleGateway
			});
		}
		if (voiceEnabled) {
			const { DiscordVoiceManager, DiscordVoiceReadyListener } = await loadDiscordVoiceRuntime();
			voiceManager = new DiscordVoiceManager({
				client,
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				runtime,
				botUserId
			});
			voiceManagerRef.current = voiceManager;
			registerDiscordListener(client.listeners, new DiscordVoiceReadyListener(voiceManager));
		}
		const messageHandler = discordProviderSessionRuntime.createDiscordMessageHandler({
			cfg,
			discordConfig: discordCfg,
			accountId: account.accountId,
			token,
			runtime,
			setStatus: opts.setStatus,
			abortSignal: opts.abortSignal,
			workerRunTimeoutMs: discordCfg.inboundWorker?.runTimeoutMs,
			botUserId,
			guildHistories,
			historyLimit,
			mediaMaxBytes,
			textLimit,
			replyToMode,
			dmEnabled,
			groupDmEnabled,
			groupDmChannels,
			allowFrom,
			guildEntries,
			threadBindings,
			discordRestFetch
		});
		deactivateMessageHandler = messageHandler.deactivate;
		const trackInboundEvent = opts.setStatus ? () => {
			const at = Date.now();
			opts.setStatus?.({
				lastEventAt: at,
				lastInboundAt: at
			});
		} : void 0;
		registerDiscordMonitorListeners({
			cfg,
			client,
			accountId: account.accountId,
			discordConfig: discordCfg,
			runtime,
			botUserId,
			dmEnabled,
			groupDmEnabled,
			groupDmChannels,
			dmPolicy,
			allowFrom,
			groupPolicy,
			guildEntries,
			logger,
			messageHandler,
			trackInboundEvent,
			eventQueueListenerTimeoutMs: eventQueueOpts.listenerTimeout
		});
		const botIdentity = botUserId && botUserName ? `${botUserId} (${botUserName})` : botUserId ?? botUserName ?? "";
		runtime.log?.(formatDiscordStartupStatusMessage({
			gatewayReady: lifecycleGateway?.isConnected === true,
			botIdentity: botIdentity || void 0
		}));
		if (lifecycleGateway?.isConnected) opts.setStatus?.(createConnectedChannelStatusPatch());
		lifecycleStarted = true;
		earlyGatewayEmitter?.removeListener("debug", onEarlyGatewayDebug);
		onEarlyGatewayDebug = void 0;
		await (runDiscordGatewayLifecycleForTesting ?? runDiscordGatewayLifecycle)({
			accountId: account.accountId,
			gateway: lifecycleGateway,
			runtime,
			abortSignal: opts.abortSignal,
			statusSink: opts.setStatus,
			isDisallowedIntentsError: isDiscordDisallowedIntentsError,
			voiceManager,
			voiceManagerRef,
			execApprovalsHandler,
			threadBindings,
			gatewaySupervisor
		});
	} finally {
		deactivateMessageHandler?.();
		autoPresenceController?.stop();
		opts.setStatus?.({ connected: false });
		if (onEarlyGatewayDebug) earlyGatewayEmitter?.removeListener("debug", onEarlyGatewayDebug);
		if (!lifecycleStarted) try {
			lifecycleGateway?.disconnect();
		} catch (err) {
			runtime.error?.(danger(`discord: failed to disconnect gateway during startup cleanup: ${String(err)}`));
		}
		gatewaySupervisor?.dispose();
		if (!lifecycleStarted) threadBindings.stop();
	}
}
async function clearDiscordNativeCommands(params) {
	try {
		await params.client.rest.put(Routes$1.applicationCommands(params.applicationId), { body: [] });
		logVerbose("discord: cleared native commands (commands.native=false)");
	} catch (err) {
		params.runtime.error?.(danger(`discord: failed to clear native commands: ${String(err)}`));
	}
}
const resolveDiscordRuntimeGroupPolicy = resolveOpenProviderRuntimeGroupPolicy;
//#endregion
export { createDiscordGatewayPlugin as a, registerDiscordListener as i, resolveDiscordRuntimeGroupPolicy as n, resolveDiscordGatewayIntents as o, createDiscordNativeCommand as r, monitorDiscordProvider as t };
