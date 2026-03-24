import { g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { Hb as defineChannelPluginEntry, Ju as resolveSignalPeerId, Ku as looksLikeUuid, Lu as signalMessageActions, Vb as createChatChannelPlugin, Xu as resolveSignalSender, Yu as resolveSignalRecipient, bl as looksLikeSignalTargetId, ed as resolveSignalAccount, gg as resolveChannelMediaMaxBytes, xl as normalizeSignalMessagingTarget, yl as markdownToSignalTextChunks } from "./pi-embedded-CbCYZxIb.js";
import { n as buildOutboundBaseSessionKey } from "./routing-zOQ0wwtV.js";
import { r as resolveOutboundSendDep } from "./outbound-runtime-m-y0nd6F.js";
import { S as resolveTextChunkLimit } from "./text-runtime-DVXt5xhi.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-CO3iC4WE.js";
import { l as createComputedAccountStatusAdapter, n as buildBaseChannelStatusSummary, s as collectStatusIssuesFromLastError, u as createDefaultChannelRuntimeState } from "./status-helpers-Cflmo90d.js";
import { n as attachChannelToResults, t as attachChannelToResult } from "./channel-send-result-DDWpviAF.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-BrG9NqjP.js";
import { l as resolveMarkdownTableMode } from "./config-runtime-BYNizC50.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
import { n as buildDmGroupAccountAllowlistAdapter } from "./allowlist-config-edit-DBeLbvpH.js";
import { o as signalSetupAdapter } from "./setup-core-BnluiWdh.js";
import { i as signalSetupWizard, n as signalConfigAdapter, r as signalSecurityAdapter, t as createSignalPluginBase } from "./shared-twzds-Nk.js";
//#region extensions/signal/src/runtime.ts
const { setRuntime: setSignalRuntime, getRuntime: getSignalRuntime } = createPluginRuntimeStore("Signal runtime not initialized");
//#endregion
//#region extensions/signal/src/channel.ts
function resolveSignalSendContext(params) {
	return {
		send: resolveOutboundSendDep(params.deps, "signal") ?? getSignalRuntime().channel.signal.sendMessageSignal,
		maxBytes: resolveChannelMediaMaxBytes({
			cfg: params.cfg,
			resolveChannelLimitMb: ({ cfg, accountId }) => cfg.channels?.signal?.accounts?.[accountId]?.mediaMaxMb ?? cfg.channels?.signal?.mediaMaxMb,
			accountId: params.accountId
		})
	};
}
async function sendSignalOutbound(params) {
	const { send, maxBytes } = resolveSignalSendContext(params);
	return await send(params.to, params.text, {
		cfg: params.cfg,
		...params.mediaUrl ? { mediaUrl: params.mediaUrl } : {},
		...params.mediaLocalRoots?.length ? { mediaLocalRoots: params.mediaLocalRoots } : {},
		maxBytes,
		accountId: params.accountId ?? void 0
	});
}
function inferSignalTargetChatType(rawTo) {
	let to = rawTo.trim();
	if (!to) return;
	if (/^signal:/i.test(to)) to = to.replace(/^signal:/i, "").trim();
	if (!to) return;
	const lower = to.toLowerCase();
	if (lower.startsWith("group:")) return "group";
	if (lower.startsWith("username:") || lower.startsWith("u:")) return "direct";
	return "direct";
}
function parseSignalExplicitTarget(raw) {
	const normalized = normalizeSignalMessagingTarget(raw);
	if (!normalized) return null;
	return {
		to: normalized,
		chatType: inferSignalTargetChatType(normalized)
	};
}
function buildSignalBaseSessionKey(params) {
	return buildOutboundBaseSessionKey({
		...params,
		channel: "signal"
	});
}
function resolveSignalOutboundSessionRoute(params) {
	const stripped = params.target.replace(/^signal:/i, "").trim();
	const lowered = stripped.toLowerCase();
	if (lowered.startsWith("group:")) {
		const groupId = stripped.slice(6).trim();
		if (!groupId) return null;
		const peer = {
			kind: "group",
			id: groupId
		};
		const baseSessionKey = buildSignalBaseSessionKey({
			cfg: params.cfg,
			agentId: params.agentId,
			accountId: params.accountId,
			peer
		});
		return {
			sessionKey: baseSessionKey,
			baseSessionKey,
			peer,
			chatType: "group",
			from: `group:${groupId}`,
			to: `group:${groupId}`
		};
	}
	let recipient = stripped.trim();
	if (lowered.startsWith("username:")) recipient = stripped.slice(9).trim();
	else if (lowered.startsWith("u:")) recipient = stripped.slice(2).trim();
	if (!recipient) return null;
	const uuidCandidate = recipient.toLowerCase().startsWith("uuid:") ? recipient.slice(5) : recipient;
	const sender = resolveSignalSender({
		sourceUuid: looksLikeUuid(uuidCandidate) ? uuidCandidate : null,
		sourceNumber: looksLikeUuid(uuidCandidate) ? null : recipient
	});
	const peerId = sender ? resolveSignalPeerId(sender) : recipient;
	const displayRecipient = sender ? resolveSignalRecipient(sender) : recipient;
	const peer = {
		kind: "direct",
		id: peerId
	};
	const baseSessionKey = buildSignalBaseSessionKey({
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
		from: `signal:${displayRecipient}`,
		to: `signal:${displayRecipient}`
	};
}
async function sendFormattedSignalText(ctx) {
	const { send, maxBytes } = resolveSignalSendContext({
		cfg: ctx.cfg,
		accountId: ctx.accountId ?? void 0,
		deps: ctx.deps
	});
	const limit = resolveTextChunkLimit(ctx.cfg, "signal", ctx.accountId ?? void 0, { fallbackLimit: 4e3 });
	const tableMode = resolveMarkdownTableMode({
		cfg: ctx.cfg,
		channel: "signal",
		accountId: ctx.accountId ?? void 0
	});
	let chunks = limit === void 0 ? markdownToSignalTextChunks(ctx.text, Number.POSITIVE_INFINITY, { tableMode }) : markdownToSignalTextChunks(ctx.text, limit, { tableMode });
	if (chunks.length === 0 && ctx.text) chunks = [{
		text: ctx.text,
		styles: []
	}];
	const results = [];
	for (const chunk of chunks) {
		ctx.abortSignal?.throwIfAborted();
		const result = await send(ctx.to, chunk.text, {
			cfg: ctx.cfg,
			maxBytes,
			accountId: ctx.accountId ?? void 0,
			textMode: "plain",
			textStyles: chunk.styles
		});
		results.push(result);
	}
	return attachChannelToResults("signal", results);
}
async function sendFormattedSignalMedia(ctx) {
	ctx.abortSignal?.throwIfAborted();
	const { send, maxBytes } = resolveSignalSendContext({
		cfg: ctx.cfg,
		accountId: ctx.accountId ?? void 0,
		deps: ctx.deps
	});
	const tableMode = resolveMarkdownTableMode({
		cfg: ctx.cfg,
		channel: "signal",
		accountId: ctx.accountId ?? void 0
	});
	const formatted = markdownToSignalTextChunks(ctx.text, Number.POSITIVE_INFINITY, { tableMode })[0] ?? {
		text: ctx.text,
		styles: []
	};
	return attachChannelToResult("signal", await send(ctx.to, formatted.text, {
		cfg: ctx.cfg,
		mediaUrl: ctx.mediaUrl,
		mediaLocalRoots: ctx.mediaLocalRoots,
		maxBytes,
		accountId: ctx.accountId ?? void 0,
		textMode: "plain",
		textStyles: formatted.styles
	}));
}
const signalPlugin = createChatChannelPlugin({
	base: {
		...createSignalPluginBase({
			setupWizard: signalSetupWizard,
			setup: signalSetupAdapter
		}),
		actions: signalMessageActions,
		allowlist: buildDmGroupAccountAllowlistAdapter({
			channelId: "signal",
			resolveAccount: resolveSignalAccount,
			normalize: ({ cfg, accountId, values }) => signalConfigAdapter.formatAllowFrom({
				cfg,
				accountId,
				allowFrom: values
			}),
			resolveDmAllowFrom: (account) => account.config.allowFrom,
			resolveGroupAllowFrom: (account) => account.config.groupAllowFrom,
			resolveDmPolicy: (account) => account.config.dmPolicy,
			resolveGroupPolicy: (account) => account.config.groupPolicy
		}),
		messaging: {
			normalizeTarget: normalizeSignalMessagingTarget,
			parseExplicitTarget: ({ raw }) => parseSignalExplicitTarget(raw),
			inferTargetChatType: ({ to }) => inferSignalTargetChatType(to),
			resolveOutboundSessionRoute: (params) => resolveSignalOutboundSessionRoute(params),
			targetResolver: {
				looksLikeId: looksLikeSignalTargetId,
				hint: "<E.164|uuid:ID|group:ID|signal:group:ID|signal:+E.164>"
			}
		},
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
			collectStatusIssues: (accounts) => collectStatusIssuesFromLastError("signal", accounts),
			buildChannelSummary: ({ snapshot }) => buildBaseChannelStatusSummary(snapshot, {
				baseUrl: snapshot.baseUrl ?? null,
				probe: snapshot.probe,
				lastProbeAt: snapshot.lastProbeAt ?? null
			}),
			probeAccount: async ({ account, timeoutMs }) => {
				const baseUrl = account.baseUrl;
				return await getSignalRuntime().channel.signal.probeSignal(baseUrl, timeoutMs);
			},
			formatCapabilitiesProbe: ({ probe }) => probe?.version ? [{ text: `Signal daemon: ${probe.version}` }] : [],
			resolveAccountSnapshot: ({ account }) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: account.configured,
				extra: { baseUrl: account.baseUrl }
			})
		}),
		gateway: { startAccount: async (ctx) => {
			const account = ctx.account;
			ctx.setStatus({
				accountId: account.accountId,
				baseUrl: account.baseUrl
			});
			ctx.log?.info(`[${account.accountId}] starting provider (${account.baseUrl})`);
			return getSignalRuntime().channel.signal.monitorSignalProvider({
				accountId: account.accountId,
				config: ctx.cfg,
				runtime: ctx.runtime,
				abortSignal: ctx.abortSignal,
				mediaMaxMb: account.config.mediaMaxMb
			});
		} }
	},
	pairing: { text: {
		idLabel: "signalNumber",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: createPairingPrefixStripper(/^signal:/i),
		notify: async ({ id, message }) => {
			await getSignalRuntime().channel.signal.sendMessageSignal(id, message);
		}
	} },
	security: signalSecurityAdapter,
	outbound: {
		base: {
			deliveryMode: "direct",
			chunker: (text, limit) => getSignalRuntime().channel.text.chunkText(text, limit),
			chunkerMode: "text",
			textChunkLimit: 4e3,
			sendFormattedText: async ({ cfg, to, text, accountId, deps, abortSignal }) => await sendFormattedSignalText({
				cfg,
				to,
				text,
				accountId,
				deps,
				abortSignal
			}),
			sendFormattedMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps, abortSignal }) => await sendFormattedSignalMedia({
				cfg,
				to,
				text,
				mediaUrl,
				mediaLocalRoots,
				accountId,
				deps,
				abortSignal
			})
		},
		attachedResults: {
			channel: "signal",
			sendText: async ({ cfg, to, text, accountId, deps }) => await sendSignalOutbound({
				cfg,
				to,
				text,
				accountId: accountId ?? void 0,
				deps
			}),
			sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps }) => await sendSignalOutbound({
				cfg,
				to,
				text,
				mediaUrl,
				mediaLocalRoots,
				accountId: accountId ?? void 0,
				deps
			})
		}
	}
});
//#endregion
//#region extensions/signal/index.ts
var signal_default = defineChannelPluginEntry({
	id: "signal",
	name: "Signal",
	description: "Signal channel plugin",
	plugin: signalPlugin,
	setRuntime: setSignalRuntime
});
//#endregion
export { signalPlugin as n, setSignalRuntime as r, signal_default as t };
