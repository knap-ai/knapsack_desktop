import { n as __reExport, t as __exportAll } from "./rolldown-runtime-RkAeH_Qm.js";
import { r as resolveDefaultWhatsAppAccountId, t as listAccountIds } from "./account-ids-DG18xddX.js";
import { a as resolveWhatsAppAccount, i as listWhatsAppAuthDirs, n as hasAnyWhatsAppAuth, o as resolveWhatsAppAuthDir, r as listEnabledWhatsAppAccounts, s as resolveWhatsAppMediaMaxBytes, t as DEFAULT_WHATSAPP_MEDIA_MAX_MB } from "./accounts-BDqgpFEB.js";
import { a as normalizeWhatsAppMessagingTarget, i as normalizeWhatsAppAllowFromEntries, n as isWhatsAppUserTarget, o as normalizeWhatsAppTarget, r as looksLikeWhatsAppTargetId, t as isWhatsAppGroupJid } from "./normalize-target-BSx79XmS.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-muaeoILm.js";
import { a as markdownToWhatsApp, i as jidToE164, n as assertWebChannel, o as resolveJidToE164, r as isSelfChatMode, s as toWhatsappJid, t as text_runtime_exports } from "./text-runtime-BvOFWrFo.js";
import { t as whatsappPlugin } from "./channel-Br4BwOEr.js";
import { n as WHATSAPP_LEGACY_OUTBOUND_SEND_DEP_KEYS } from "./outbound-base-DSLEOtaz.js";
import { t as whatsappCommandPolicy } from "./command-policy-O8sRnqUV.js";
import { n as resolveWhatsAppGroupToolPolicy, r as resolveWhatsAppGroupIntroHint, t as resolveWhatsAppGroupRequireMention } from "./group-policy-BDmO10Lm.js";
import { t as whatsappSetupPlugin } from "./channel.setup-CG-4CoQy.js";
import { t as DEFAULT_WEB_MEDIA_BYTES } from "./constants-w1BoViXF.js";
import { n as listWhatsAppDirectoryGroupsFromConfig, r as listWhatsAppDirectoryPeersFromConfig } from "./directory-config-CiANMx84.js";
import "./runtime-api-Dg-_xJkJ.js";
import { t as __testing } from "./access-control-DCqks_qR.js";
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
	listWhatsAppAccountIds: () => listAccountIds,
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
export { DEFAULT_WEB_MEDIA_BYTES, DEFAULT_WHATSAPP_MEDIA_MAX_MB, WHATSAPP_LEGACY_OUTBOUND_SEND_DEP_KEYS, assertWebChannel, hasAnyWhatsAppAuth, isSelfChatMode, isWhatsAppGroupJid, isWhatsAppUserTarget, jidToE164, listEnabledWhatsAppAccounts, listAccountIds as listWhatsAppAccountIds, listWhatsAppAuthDirs, listWhatsAppDirectoryGroupsFromConfig, listWhatsAppDirectoryPeersFromConfig, looksLikeWhatsAppTargetId, markdownToWhatsApp, normalizeWhatsAppAllowFromEntries, normalizeWhatsAppMessagingTarget, normalizeWhatsAppTarget, resolveDefaultWhatsAppAccountId, resolveJidToE164, resolveWhatsAppAccount, resolveWhatsAppAuthDir, resolveWhatsAppGroupIntroHint, resolveWhatsAppGroupRequireMention, resolveWhatsAppGroupToolPolicy, resolveWhatsAppMediaMaxBytes, resolveWhatsAppOutboundTarget, toWhatsappJid, __testing as whatsappAccessControlTesting, whatsappCommandPolicy, whatsappPlugin, whatsappSetupPlugin };
