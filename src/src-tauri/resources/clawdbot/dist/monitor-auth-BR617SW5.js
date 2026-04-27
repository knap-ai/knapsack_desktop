import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-C1IzJjqi.js";
import { a as resolveAllowlistMatchSimple } from "./allowlist-match-CVN8Gyua.js";
import "./text-runtime-B1c54bxG.js";
import "./core-C7AkvHZx.js";
import { n as resolveControlCommandGate } from "./command-gating-iPAl2C9q.js";
import "./channel-policy-z64fOzIr.js";
import { n as isDangerousNameMatchingEnabled } from "./dangerous-name-matching-wQgGIYE0.js";
import { i as evaluateSenderGroupAccessForPolicy } from "./group-access-Dzf-PegR.js";
import { s as resolveEffectiveAllowFromLists } from "./dm-policy-shared-CF1kNTSS.js";
import "./reply-history-BYivZoKy.js";
import "./channel-reply-pipeline-zp0MNhbR.js";
import "./channel-pairing-DF6gWII4.js";
import "./webhook-targets-BxJSNvH9.js";
import "./webhook-ingress-S9T0oiq6.js";
import "./config-runtime-Dutm3Ah0.js";
import "./agent-media-payload-CEcSGySl.js";
import "./outbound-media-Crb_x_N8.js";
import "./media-runtime-CaqK85Sx.js";
import "./command-auth-Cu1JGJnK.js";
import "./channel-feedback-iuIIZw6L.js";
import "./channel-inbound-CKcvqgS4.js";
//#region extensions/mattermost/src/mattermost/monitor-auth.ts
function normalizeMattermostAllowEntry(entry) {
	const trimmed = entry.trim();
	if (!trimmed) return "";
	if (trimmed === "*") return "*";
	return trimmed.replace(/^(mattermost|user):/i, "").replace(/^@/, "").trim() ? normalizeLowercaseStringOrEmpty(trimmed.replace(/^(mattermost|user):/i, "").replace(/^@/, "")) : "";
}
function normalizeMattermostAllowList(entries) {
	const normalized = entries.map((entry) => normalizeMattermostAllowEntry(String(entry))).filter(Boolean);
	return Array.from(new Set(normalized));
}
function resolveMattermostEffectiveAllowFromLists(params) {
	return resolveEffectiveAllowFromLists({
		allowFrom: normalizeMattermostAllowList(params.allowFrom ?? []),
		groupAllowFrom: normalizeMattermostAllowList(params.groupAllowFrom ?? []),
		storeAllowFrom: normalizeMattermostAllowList(params.storeAllowFrom ?? []),
		dmPolicy: params.dmPolicy
	});
}
function isMattermostSenderAllowed(params) {
	const allowFrom = normalizeMattermostAllowList(params.allowFrom);
	if (allowFrom.length === 0) return false;
	return resolveAllowlistMatchSimple({
		allowFrom,
		senderId: normalizeMattermostAllowEntry(params.senderId),
		senderName: params.senderName ? normalizeMattermostAllowEntry(params.senderName) : void 0,
		allowNameMatching: params.allowNameMatching
	}).allowed;
}
function mapMattermostChannelKind(channelType) {
	const normalized = channelType?.trim().toUpperCase();
	if (normalized === "D") return "direct";
	if (normalized === "G" || normalized === "P") return "group";
	return "channel";
}
function authorizeMattermostCommandInvocation(params) {
	const { account, cfg, senderId, senderName, channelId, channelInfo, storeAllowFrom, allowTextCommands, hasControlCommand } = params;
	if (!channelInfo) return {
		ok: false,
		denyReason: "unknown-channel",
		commandAuthorized: false,
		channelInfo: null,
		kind: "channel",
		chatType: "channel",
		channelName: "",
		channelDisplay: "",
		roomLabel: `#${channelId}`
	};
	const kind = mapMattermostChannelKind(channelInfo.type);
	const chatType = kind;
	const channelName = channelInfo.name ?? "";
	const channelDisplay = channelInfo.display_name ?? channelName;
	const roomLabel = channelName ? `#${channelName}` : channelDisplay || `#${channelId}`;
	const dmPolicy = account.config.dmPolicy ?? "pairing";
	const defaultGroupPolicy = cfg.channels?.defaults?.groupPolicy;
	const groupPolicy = account.config.groupPolicy ?? defaultGroupPolicy ?? "allowlist";
	const allowNameMatching = isDangerousNameMatchingEnabled(account.config);
	const configAllowFrom = normalizeMattermostAllowList(account.config.allowFrom ?? []);
	const configGroupAllowFrom = normalizeMattermostAllowList(account.config.groupAllowFrom ?? []);
	const { effectiveAllowFrom, effectiveGroupAllowFrom } = resolveMattermostEffectiveAllowFromLists({
		allowFrom: configAllowFrom,
		groupAllowFrom: configGroupAllowFrom,
		storeAllowFrom: normalizeMattermostAllowList(storeAllowFrom ?? []),
		dmPolicy
	});
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const commandDmAllowFrom = kind === "direct" ? effectiveAllowFrom : configAllowFrom;
	const commandGroupAllowFrom = kind === "direct" ? effectiveGroupAllowFrom : configGroupAllowFrom.length > 0 ? configGroupAllowFrom : configAllowFrom;
	const senderAllowedForCommands = isMattermostSenderAllowed({
		senderId,
		senderName,
		allowFrom: commandDmAllowFrom,
		allowNameMatching
	});
	const groupAllowedForCommands = isMattermostSenderAllowed({
		senderId,
		senderName,
		allowFrom: commandGroupAllowFrom,
		allowNameMatching
	});
	const commandGate = resolveControlCommandGate({
		useAccessGroups,
		authorizers: [{
			configured: commandDmAllowFrom.length > 0,
			allowed: senderAllowedForCommands
		}, {
			configured: commandGroupAllowFrom.length > 0,
			allowed: groupAllowedForCommands
		}],
		allowTextCommands,
		hasControlCommand: allowTextCommands && hasControlCommand
	});
	const commandAuthorized = kind === "direct" ? dmPolicy === "open" || senderAllowedForCommands : commandGate.commandAuthorized;
	if (kind === "direct") {
		if (dmPolicy === "disabled") return {
			ok: false,
			denyReason: "dm-disabled",
			commandAuthorized: false,
			channelInfo,
			kind,
			chatType,
			channelName,
			channelDisplay,
			roomLabel
		};
		if (dmPolicy !== "open" && !senderAllowedForCommands) return {
			ok: false,
			denyReason: dmPolicy === "pairing" ? "dm-pairing" : "unauthorized",
			commandAuthorized: false,
			channelInfo,
			kind,
			chatType,
			channelName,
			channelDisplay,
			roomLabel
		};
	} else {
		const senderGroupAccess = evaluateSenderGroupAccessForPolicy({
			groupPolicy,
			groupAllowFrom: effectiveGroupAllowFrom,
			senderId,
			isSenderAllowed: (_senderId, allowFrom) => isMattermostSenderAllowed({
				senderId,
				senderName,
				allowFrom,
				allowNameMatching
			})
		});
		if (!senderGroupAccess.allowed && senderGroupAccess.reason === "disabled") return {
			ok: false,
			denyReason: "channels-disabled",
			commandAuthorized: false,
			channelInfo,
			kind,
			chatType,
			channelName,
			channelDisplay,
			roomLabel
		};
		if (!senderGroupAccess.allowed && senderGroupAccess.reason === "empty_allowlist") return {
			ok: false,
			denyReason: "channel-no-allowlist",
			commandAuthorized: false,
			channelInfo,
			kind,
			chatType,
			channelName,
			channelDisplay,
			roomLabel
		};
		if (!senderGroupAccess.allowed && senderGroupAccess.reason === "sender_not_allowlisted") return {
			ok: false,
			denyReason: "unauthorized",
			commandAuthorized: false,
			channelInfo,
			kind,
			chatType,
			channelName,
			channelDisplay,
			roomLabel
		};
		if (commandGate.shouldBlock) return {
			ok: false,
			denyReason: "unauthorized",
			commandAuthorized: false,
			channelInfo,
			kind,
			chatType,
			channelName,
			channelDisplay,
			roomLabel
		};
	}
	return {
		ok: true,
		commandAuthorized,
		channelInfo,
		kind,
		chatType,
		channelName,
		channelDisplay,
		roomLabel
	};
}
//#endregion
export { isMattermostSenderAllowed as n, normalizeMattermostAllowList as r, authorizeMattermostCommandInvocation as t };
