import "./github-copilot-token-C4Aasre6.js";
import { g as normalizeAccountId, h as DEFAULT_ACCOUNT_ID } from "./session-key-CbP51u9x.js";
import { V as formatPairingApproveHint } from "./channel-config-helpers-BAi2qlAE.js";
import { $a as resolveTelegramGroupToolPolicy, Ea as listTelegramDirectoryPeersFromConfig, Hn as parseTelegramThreadId, Qa as resolveTelegramGroupRequireMention, Ta as listTelegramDirectoryGroupsFromConfig, Vn as parseTelegramReplyToMessageId, Xt as resolveConfiguredFromCredentialStatuses, Yt as projectCredentialSnapshotFields, ao as resolveTelegramAccount, bs as getChatChannelMeta, io as resolveDefaultTelegramAccountId, m as TelegramConfigSchema, no as inspectTelegramAccount, ro as listTelegramAccountIds } from "./thread-bindings-SYAnWHuW.js";
import "./paths-WR8OhEmw.js";
import "./logger-s5D1BfzX.js";
import "./tmp-openclaw-dir-DEAexD45.js";
import "./subsystem-7GlwMGJM.js";
import "./utils-B2utBG_m.js";
import "./fetch-CtE9nADJ.js";
import "./exec-CbLkwGIT.js";
import "./thinking-D7ZEZ42s.js";
import "./query-expansion-DrxgDYz1.js";
import "./logger-DD_BJ94Q.js";
import { B as clearAccountEntryFields, H as setAccountEnabledInConfigSection, V as deleteAccountFromConfigSection } from "./zod-schema.core-CtLVNGPW.js";
import "./redact-HAC0uPMW.js";
import "./http-registry-7Lsnrxx9.js";
import "./pairing-token-DNSESXf3.js";
import "./ssrf-BC5-OCfy.js";
import "./fetch-guard-RV5sCukz.js";
import { i as resolveDefaultGroupPolicy, r as resolveAllowlistProviderRuntimeGroupPolicy } from "./runtime-group-policy-KevvtwrL.js";
import "./registry-B_tf98QY.js";
import "./http-body-CdacFz6y.js";
import { t as emptyPluginConfigSchema } from "./config-schema-D5FeRBQU.js";
import { o as buildTokenChannelStatusSummary } from "./status-helpers-D4rJShOo.js";
import "./provider-env-vars-DNcS2Y9_.js";
import { D as applyAccountNameToChannelSection, k as migrateBaseNameToDefaultAccount } from "./helpers-uRGq4pbi.js";
import { i as buildChannelConfigSchema } from "./config-schema-HN6oil5E.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-DR1mMCCi.js";
import "./shared-Br_iEHnn.js";
import { i as telegramOnboardingAdapter, n as looksLikeTelegramTargetId, r as normalizeTelegramMessagingTarget, t as collectTelegramStatusIssues } from "./telegram-C9F6UM13.js";
//#region src/channels/plugins/outbound/direct-text-media.ts
function resolvePayloadMediaUrls(payload) {
	return payload.mediaUrls?.length ? payload.mediaUrls : payload.mediaUrl ? [payload.mediaUrl] : [];
}
async function sendPayloadMediaSequence(params) {
	let lastResult;
	for (let i = 0; i < params.mediaUrls.length; i += 1) {
		const mediaUrl = params.mediaUrls[i];
		if (!mediaUrl) continue;
		lastResult = await params.send({
			text: i === 0 ? params.text : "",
			mediaUrl,
			index: i,
			isFirst: i === 0
		});
	}
	return lastResult;
}
//#endregion
//#region src/channels/plugins/outbound/telegram.ts
async function sendTelegramPayloadMessages(params) {
	const telegramData = params.payload.channelData?.telegram;
	const quoteText = typeof telegramData?.quoteText === "string" ? telegramData.quoteText : void 0;
	const text = params.payload.text ?? "";
	const mediaUrls = resolvePayloadMediaUrls(params.payload);
	const payloadOpts = {
		...params.baseOpts,
		quoteText
	};
	if (mediaUrls.length === 0) return await params.send(params.to, text, {
		...payloadOpts,
		buttons: telegramData?.buttons
	});
	return await sendPayloadMediaSequence({
		text,
		mediaUrls,
		send: async ({ text, mediaUrl, isFirst }) => await params.send(params.to, text, {
			...payloadOpts,
			mediaUrl,
			...isFirst ? { buttons: telegramData?.buttons } : {}
		})
	}) ?? {
		messageId: "unknown",
		chatId: params.to
	};
}
//#endregion
export { DEFAULT_ACCOUNT_ID, PAIRING_APPROVED_MESSAGE, TelegramConfigSchema, applyAccountNameToChannelSection, buildChannelConfigSchema, buildTokenChannelStatusSummary, clearAccountEntryFields, collectTelegramStatusIssues, deleteAccountFromConfigSection, emptyPluginConfigSchema, formatPairingApproveHint, getChatChannelMeta, inspectTelegramAccount, listTelegramAccountIds, listTelegramDirectoryGroupsFromConfig, listTelegramDirectoryPeersFromConfig, looksLikeTelegramTargetId, migrateBaseNameToDefaultAccount, normalizeAccountId, normalizeTelegramMessagingTarget, parseTelegramReplyToMessageId, parseTelegramThreadId, projectCredentialSnapshotFields, resolveAllowlistProviderRuntimeGroupPolicy, resolveConfiguredFromCredentialStatuses, resolveDefaultGroupPolicy, resolveDefaultTelegramAccountId, resolveTelegramAccount, resolveTelegramGroupRequireMention, resolveTelegramGroupToolPolicy, sendTelegramPayloadMessages, setAccountEnabledInConfigSection, telegramOnboardingAdapter };
