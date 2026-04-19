import { a as markdownToWhatsApp, c as __exportAll, i as jidToE164, l as __reExport, n as assertWebChannel, o as resolveJidToE164, r as isSelfChatMode, s as toWhatsappJid, t as text_runtime_exports } from "./text-runtime-Daz12Pek.js";
import { a as listWhatsAppAuthDirs, c as resolveWhatsAppAuthDir, i as listWhatsAppAccountIds, l as resolveWhatsAppMediaMaxBytes, n as hasAnyWhatsAppAuth, o as resolveDefaultWhatsAppAccountId, r as listEnabledWhatsAppAccounts, s as resolveWhatsAppAccount, t as DEFAULT_WHATSAPP_MEDIA_MAX_MB } from "./accounts-DgAsOTS-.js";
import { a as normalizeWhatsAppMessagingTarget, i as normalizeWhatsAppAllowFromEntries, n as isWhatsAppUserTarget, o as normalizeWhatsAppTarget, r as looksLikeWhatsAppTargetId, t as isWhatsAppGroupJid } from "./normalize-target-DzehiMvp.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-CbM5UJum.js";
import { t as whatsappPlugin } from "./channel-DB5pERiT.js";
import { r as WHATSAPP_LEGACY_OUTBOUND_SEND_DEP_KEYS } from "./heartbeat-recipients-DZfPzRUS.js";
import { t as whatsappCommandPolicy } from "./command-policy-DylLtVOg.js";
import { n as resolveWhatsAppGroupToolPolicy, r as resolveWhatsAppGroupIntroHint, t as resolveWhatsAppGroupRequireMention } from "./group-policy-sF_4utMT.js";
import { t as whatsappSetupPlugin } from "./channel.setup-ngXlQBTA.js";
import { t as DEFAULT_WEB_MEDIA_BYTES } from "./constants-f5LlBu0G.js";
import { n as listWhatsAppDirectoryGroupsFromConfig, r as listWhatsAppDirectoryPeersFromConfig } from "./directory-config-BUOWZJW_.js";
import "./runtime-api-vb71a5Kp.js";
import { t as __testing } from "./access-control-D0WpKaWO.js";
export * from "openclaw/plugin-sdk/text-runtime";
__reExport(/* @__PURE__ */ __exportAll({
	DEFAULT_WEB_MEDIA_BYTES: () => DEFAULT_WEB_MEDIA_BYTES,
	DEFAULT_WHATSAPP_MEDIA_MAX_MB: () => 50,
	WHATSAPP_LEGACY_OUTBOUND_SEND_DEP_KEYS: () => WHATSAPP_LEGACY_OUTBOUND_SEND_DEP_KEYS,
	assertWebChannel: () => assertWebChannel,
	hasAnyWhatsAppAuth: () => hasAnyWhatsAppAuth,
	isSelfChatMode: () => isSelfChatMode,
	isWhatsAppGroupJid: () => isWhatsAppGroupJid,
	isWhatsAppUserTarget: () => isWhatsAppUserTarget,
	jidToE164: () => jidToE164,
	listEnabledWhatsAppAccounts: () => listEnabledWhatsAppAccounts,
	listWhatsAppAccountIds: () => listWhatsAppAccountIds,
	listWhatsAppAuthDirs: () => listWhatsAppAuthDirs,
	listWhatsAppDirectoryGroupsFromConfig: () => listWhatsAppDirectoryGroupsFromConfig,
	listWhatsAppDirectoryPeersFromConfig: () => listWhatsAppDirectoryPeersFromConfig,
	looksLikeWhatsAppTargetId: () => looksLikeWhatsAppTargetId,
	markdownToWhatsApp: () => markdownToWhatsApp,
	normalizeWhatsAppAllowFromEntries: () => normalizeWhatsAppAllowFromEntries,
	normalizeWhatsAppMessagingTarget: () => normalizeWhatsAppMessagingTarget,
	normalizeWhatsAppTarget: () => normalizeWhatsAppTarget,
	resolveDefaultWhatsAppAccountId: () => resolveDefaultWhatsAppAccountId,
	resolveJidToE164: () => resolveJidToE164,
	resolveWhatsAppAccount: () => resolveWhatsAppAccount,
	resolveWhatsAppAuthDir: () => resolveWhatsAppAuthDir,
	resolveWhatsAppGroupIntroHint: () => resolveWhatsAppGroupIntroHint,
	resolveWhatsAppGroupRequireMention: () => resolveWhatsAppGroupRequireMention,
	resolveWhatsAppGroupToolPolicy: () => resolveWhatsAppGroupToolPolicy,
	resolveWhatsAppMediaMaxBytes: () => resolveWhatsAppMediaMaxBytes,
	resolveWhatsAppOutboundTarget: () => resolveWhatsAppOutboundTarget,
	toWhatsappJid: () => toWhatsappJid,
	whatsappAccessControlTesting: () => __testing,
	whatsappCommandPolicy: () => whatsappCommandPolicy,
	whatsappPlugin: () => whatsappPlugin,
	whatsappSetupPlugin: () => whatsappSetupPlugin
}), text_runtime_exports);
//#endregion
export { DEFAULT_WEB_MEDIA_BYTES, DEFAULT_WHATSAPP_MEDIA_MAX_MB, WHATSAPP_LEGACY_OUTBOUND_SEND_DEP_KEYS, assertWebChannel, hasAnyWhatsAppAuth, isSelfChatMode, isWhatsAppGroupJid, isWhatsAppUserTarget, jidToE164, listEnabledWhatsAppAccounts, listWhatsAppAccountIds, listWhatsAppAuthDirs, listWhatsAppDirectoryGroupsFromConfig, listWhatsAppDirectoryPeersFromConfig, looksLikeWhatsAppTargetId, markdownToWhatsApp, normalizeWhatsAppAllowFromEntries, normalizeWhatsAppMessagingTarget, normalizeWhatsAppTarget, resolveDefaultWhatsAppAccountId, resolveJidToE164, resolveWhatsAppAccount, resolveWhatsAppAuthDir, resolveWhatsAppGroupIntroHint, resolveWhatsAppGroupRequireMention, resolveWhatsAppGroupToolPolicy, resolveWhatsAppMediaMaxBytes, resolveWhatsAppOutboundTarget, toWhatsappJid, __testing as whatsappAccessControlTesting, whatsappCommandPolicy, whatsappPlugin, whatsappSetupPlugin };
