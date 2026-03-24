import { g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { Hb as defineChannelPluginEntry, Vb as createChatChannelPlugin, ad as normalizeIMessageHandle, bd as resolveIMessageAccount, gd as resolveIMessageGroupToolPolicy, hd as resolveIMessageGroupRequireMention, id as looksLikeIMessageExplicitTargetId, nd as inferIMessageTargetChatType, rx as formatTrimmedAllowFromEntries, sd as parseIMessageTarget } from "./pi-embedded-CbCYZxIb.js";
import { n as buildOutboundBaseSessionKey } from "./routing-zOQ0wwtV.js";
import { l as createComputedAccountStatusAdapter, s as collectStatusIssuesFromLastError, u as createDefaultChannelRuntimeState } from "./status-helpers-Cflmo90d.js";
import { r as createLazyRuntimeModule } from "./lazy-runtime-CPDBPNrj.js";
import { a as normalizeIMessageMessagingTarget } from "./imessage-BRjuIPul.js";
import { n as buildDmGroupAccountAllowlistAdapter } from "./allowlist-config-edit-DBeLbvpH.js";
import { n as buildPassiveProbedChannelStatusSummary } from "./extension-shared-B8dMu-tU.js";
import { n as setIMessageRuntime, t as getIMessageRuntime } from "./runtime-DGI-s6ww.js";
import { a as imessageSetupAdapter } from "./setup-core-vcqRwDmU.js";
import { n as imessageSecurityAdapter, r as imessageSetupWizard, t as createIMessagePluginBase } from "./shared-9ze9PBZv.js";
//#region extensions/imessage/src/channel.ts
const loadIMessageChannelRuntime = createLazyRuntimeModule(() => import("./channel.runtime-EaRkh5AY.js"));
function buildIMessageBaseSessionKey(params) {
	return buildOutboundBaseSessionKey({
		...params,
		channel: "imessage"
	});
}
function resolveIMessageOutboundSessionRoute(params) {
	const parsed = parseIMessageTarget(params.target);
	if (parsed.kind === "handle") {
		const handle = normalizeIMessageHandle(parsed.to);
		if (!handle) return null;
		const peer = {
			kind: "direct",
			id: handle
		};
		const baseSessionKey = buildIMessageBaseSessionKey({
			cfg: params.cfg,
			agentId: params.agentId,
			accountId: params.accountId,
			peer
		});
		return {
			sessionKey: baseSessionKey,
			baseSessionKey,
			peer,
			chatType: "direct",
			from: `imessage:${handle}`,
			to: `imessage:${handle}`
		};
	}
	const peerId = parsed.kind === "chat_id" ? String(parsed.chatId) : parsed.kind === "chat_guid" ? parsed.chatGuid : parsed.chatIdentifier;
	if (!peerId) return null;
	const peer = {
		kind: "group",
		id: peerId
	};
	const baseSessionKey = buildIMessageBaseSessionKey({
		cfg: params.cfg,
		agentId: params.agentId,
		accountId: params.accountId,
		peer
	});
	const toPrefix = parsed.kind === "chat_id" ? "chat_id" : parsed.kind === "chat_guid" ? "chat_guid" : "chat_identifier";
	return {
		sessionKey: baseSessionKey,
		baseSessionKey,
		peer,
		chatType: "group",
		from: `imessage:group:${peerId}`,
		to: `${toPrefix}:${peerId}`
	};
}
const imessagePlugin = createChatChannelPlugin({
	base: {
		...createIMessagePluginBase({
			setupWizard: imessageSetupWizard,
			setup: imessageSetupAdapter
		}),
		allowlist: buildDmGroupAccountAllowlistAdapter({
			channelId: "imessage",
			resolveAccount: resolveIMessageAccount,
			normalize: ({ values }) => formatTrimmedAllowFromEntries(values),
			resolveDmAllowFrom: (account) => account.config.allowFrom,
			resolveGroupAllowFrom: (account) => account.config.groupAllowFrom,
			resolveDmPolicy: (account) => account.config.dmPolicy,
			resolveGroupPolicy: (account) => account.config.groupPolicy
		}),
		groups: {
			resolveRequireMention: resolveIMessageGroupRequireMention,
			resolveToolPolicy: resolveIMessageGroupToolPolicy
		},
		messaging: {
			normalizeTarget: normalizeIMessageMessagingTarget,
			inferTargetChatType: ({ to }) => inferIMessageTargetChatType(to),
			resolveOutboundSessionRoute: (params) => resolveIMessageOutboundSessionRoute(params),
			targetResolver: {
				looksLikeId: looksLikeIMessageExplicitTargetId,
				hint: "<handle|chat_id:ID>",
				resolveTarget: async ({ normalized }) => {
					const to = normalized?.trim();
					if (!to) return null;
					const chatType = inferIMessageTargetChatType(to);
					if (!chatType) return null;
					return {
						to,
						kind: chatType === "direct" ? "user" : "group",
						source: "normalized"
					};
				}
			}
		},
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID, {
				cliPath: null,
				dbPath: null
			}),
			collectStatusIssues: (accounts) => collectStatusIssuesFromLastError("imessage", accounts),
			buildChannelSummary: ({ snapshot }) => buildPassiveProbedChannelStatusSummary(snapshot, {
				cliPath: snapshot.cliPath ?? null,
				dbPath: snapshot.dbPath ?? null
			}),
			probeAccount: async ({ timeoutMs }) => await (await loadIMessageChannelRuntime()).probeIMessageAccount(timeoutMs),
			resolveAccountSnapshot: ({ account, runtime }) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: account.configured,
				extra: {
					cliPath: runtime?.cliPath ?? account.config.cliPath ?? null,
					dbPath: runtime?.dbPath ?? account.config.dbPath ?? null
				}
			}),
			resolveAccountState: ({ enabled }) => enabled ? "enabled" : "disabled"
		}),
		gateway: { startAccount: async (ctx) => await (await loadIMessageChannelRuntime()).startIMessageGatewayAccount(ctx) }
	},
	pairing: { text: {
		idLabel: "imessageSenderId",
		message: "OpenClaw: your access has been approved.",
		notify: async ({ id }) => await (await loadIMessageChannelRuntime()).notifyIMessageApproval(id)
	} },
	security: imessageSecurityAdapter,
	outbound: {
		base: {
			deliveryMode: "direct",
			chunker: (text, limit) => getIMessageRuntime().channel.text.chunkText(text, limit),
			chunkerMode: "text",
			textChunkLimit: 4e3
		},
		attachedResults: {
			channel: "imessage",
			sendText: async ({ cfg, to, text, accountId, deps, replyToId }) => await (await loadIMessageChannelRuntime()).sendIMessageOutbound({
				cfg,
				to,
				text,
				accountId: accountId ?? void 0,
				deps,
				replyToId: replyToId ?? void 0
			}),
			sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId }) => await (await loadIMessageChannelRuntime()).sendIMessageOutbound({
				cfg,
				to,
				text,
				mediaUrl,
				mediaLocalRoots,
				accountId: accountId ?? void 0,
				deps,
				replyToId: replyToId ?? void 0
			})
		}
	}
});
//#endregion
//#region extensions/imessage/index.ts
var imessage_default = defineChannelPluginEntry({
	id: "imessage",
	name: "iMessage",
	description: "iMessage channel plugin",
	plugin: imessagePlugin,
	setRuntime: setIMessageRuntime
});
//#endregion
export { imessagePlugin as n, imessage_default as t };
