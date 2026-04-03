import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/telegram-surface.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "telegram",
		artifactBasename: "api.js"
	});
}
const buildBrowseProvidersButton = ((...args) => loadFacadeModule()["buildBrowseProvidersButton"](...args));
const buildModelsKeyboard = ((...args) => loadFacadeModule()["buildModelsKeyboard"](...args));
const buildProviderKeyboard = ((...args) => loadFacadeModule()["buildProviderKeyboard"](...args));
const buildTelegramGroupPeerId = ((...args) => loadFacadeModule()["buildTelegramGroupPeerId"](...args));
const calculateTotalPages = ((...args) => loadFacadeModule()["calculateTotalPages"](...args));
const createTelegramActionGate = ((...args) => loadFacadeModule()["createTelegramActionGate"](...args));
const fetchTelegramChatId = ((...args) => loadFacadeModule()["fetchTelegramChatId"](...args));
const getCacheStats = ((...args) => loadFacadeModule()["getCacheStats"](...args));
const getModelsPageSize = ((...args) => loadFacadeModule()["getModelsPageSize"](...args));
const inspectTelegramAccount = ((...args) => loadFacadeModule()["inspectTelegramAccount"](...args));
const isTelegramExecApprovalApprover = ((...args) => loadFacadeModule()["isTelegramExecApprovalApprover"](...args));
const isTelegramExecApprovalAuthorizedSender = ((...args) => loadFacadeModule()["isTelegramExecApprovalAuthorizedSender"](...args));
const isTelegramExecApprovalClientEnabled = ((...args) => loadFacadeModule()["isTelegramExecApprovalClientEnabled"](...args));
const isTelegramExecApprovalTargetRecipient = ((...args) => loadFacadeModule()["isTelegramExecApprovalTargetRecipient"](...args));
const listTelegramAccountIds = ((...args) => loadFacadeModule()["listTelegramAccountIds"](...args));
const listTelegramDirectoryGroupsFromConfig = ((...args) => loadFacadeModule()["listTelegramDirectoryGroupsFromConfig"](...args));
const listTelegramDirectoryPeersFromConfig = ((...args) => loadFacadeModule()["listTelegramDirectoryPeersFromConfig"](...args));
const looksLikeTelegramTargetId = ((...args) => loadFacadeModule()["looksLikeTelegramTargetId"](...args));
const lookupTelegramChatId = ((...args) => loadFacadeModule()["lookupTelegramChatId"](...args));
const normalizeTelegramMessagingTarget = ((...args) => loadFacadeModule()["normalizeTelegramMessagingTarget"](...args));
const parseTelegramReplyToMessageId = ((...args) => loadFacadeModule()["parseTelegramReplyToMessageId"](...args));
const parseTelegramTarget = ((...args) => loadFacadeModule()["parseTelegramTarget"](...args));
const parseTelegramThreadId = ((...args) => loadFacadeModule()["parseTelegramThreadId"](...args));
const resolveTelegramAutoThreadId = ((...args) => loadFacadeModule()["resolveTelegramAutoThreadId"](...args));
const resolveTelegramGroupRequireMention = ((...args) => loadFacadeModule()["resolveTelegramGroupRequireMention"](...args));
const resolveTelegramGroupToolPolicy = ((...args) => loadFacadeModule()["resolveTelegramGroupToolPolicy"](...args));
const resolveTelegramInlineButtonsScope = ((...args) => loadFacadeModule()["resolveTelegramInlineButtonsScope"](...args));
const resolveTelegramPollActionGateState = ((...args) => loadFacadeModule()["resolveTelegramPollActionGateState"](...args));
const resolveTelegramReactionLevel = ((...args) => loadFacadeModule()["resolveTelegramReactionLevel"](...args));
const resolveTelegramTargetChatType = ((...args) => loadFacadeModule()["resolveTelegramTargetChatType"](...args));
const searchStickers = ((...args) => loadFacadeModule()["searchStickers"](...args));
const sendTelegramPayloadMessages = ((...args) => loadFacadeModule()["sendTelegramPayloadMessages"](...args));
//#endregion
export { buildBrowseProvidersButton, buildModelsKeyboard, buildProviderKeyboard, buildTelegramGroupPeerId, calculateTotalPages, createTelegramActionGate, fetchTelegramChatId, getCacheStats, getModelsPageSize, inspectTelegramAccount, isTelegramExecApprovalApprover, isTelegramExecApprovalAuthorizedSender, isTelegramExecApprovalClientEnabled, isTelegramExecApprovalTargetRecipient, listTelegramAccountIds, listTelegramDirectoryGroupsFromConfig, listTelegramDirectoryPeersFromConfig, looksLikeTelegramTargetId, lookupTelegramChatId, normalizeTelegramMessagingTarget, parseTelegramReplyToMessageId, parseTelegramTarget, parseTelegramThreadId, resolveTelegramAutoThreadId, resolveTelegramGroupRequireMention, resolveTelegramGroupToolPolicy, resolveTelegramInlineButtonsScope, resolveTelegramPollActionGateState, resolveTelegramReactionLevel, resolveTelegramTargetChatType, searchStickers, sendTelegramPayloadMessages };
