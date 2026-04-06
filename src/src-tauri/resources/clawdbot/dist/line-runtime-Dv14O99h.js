import { i as loadActivatedBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/line-runtime.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "line",
		artifactBasename: "runtime-api.js"
	});
}
const buildTemplateMessageFromPayload = ((...args) => loadFacadeModule()["buildTemplateMessageFromPayload"](...args));
const cancelDefaultRichMenu = ((...args) => loadFacadeModule()["cancelDefaultRichMenu"](...args));
const createActionCard = ((...args) => loadFacadeModule()["createActionCard"](...args));
const createAgendaCard = ((...args) => loadFacadeModule()["createAgendaCard"](...args));
const createAppleTvRemoteCard = ((...args) => loadFacadeModule()["createAppleTvRemoteCard"](...args));
const createCarousel = ((...args) => loadFacadeModule()["createCarousel"](...args));
const createDefaultMenuConfig = ((...args) => loadFacadeModule()["createDefaultMenuConfig"](...args));
const createDeviceControlCard = ((...args) => loadFacadeModule()["createDeviceControlCard"](...args));
const createEventCard = ((...args) => loadFacadeModule()["createEventCard"](...args));
const createGridLayout = ((...args) => loadFacadeModule()["createGridLayout"](...args));
const createImageCard = ((...args) => loadFacadeModule()["createImageCard"](...args));
const createInfoCard = ((...args) => loadFacadeModule()["createInfoCard"](...args));
const createListCard = ((...args) => loadFacadeModule()["createListCard"](...args));
const createMediaPlayerCard = ((...args) => loadFacadeModule()["createMediaPlayerCard"](...args));
const createNotificationBubble = ((...args) => loadFacadeModule()["createNotificationBubble"](...args));
const createQuickReplyItems = ((...args) => loadFacadeModule()["createQuickReplyItems"](...args));
const createReceiptCard = ((...args) => loadFacadeModule()["createReceiptCard"](...args));
const createRichMenu = ((...args) => loadFacadeModule()["createRichMenu"](...args));
const createRichMenuAlias = ((...args) => loadFacadeModule()["createRichMenuAlias"](...args));
const datetimePickerAction = ((...args) => loadFacadeModule()["datetimePickerAction"](...args));
const deleteRichMenu = ((...args) => loadFacadeModule()["deleteRichMenu"](...args));
const deleteRichMenuAlias = ((...args) => loadFacadeModule()["deleteRichMenuAlias"](...args));
const downloadLineMedia = ((...args) => loadFacadeModule()["downloadLineMedia"](...args));
const firstDefined = ((...args) => loadFacadeModule()["firstDefined"](...args));
const getDefaultRichMenuId = ((...args) => loadFacadeModule()["getDefaultRichMenuId"](...args));
const getRichMenu = ((...args) => loadFacadeModule()["getRichMenu"](...args));
const getRichMenuIdOfUser = ((...args) => loadFacadeModule()["getRichMenuIdOfUser"](...args));
const getRichMenuList = ((...args) => loadFacadeModule()["getRichMenuList"](...args));
const isSenderAllowed = ((...args) => loadFacadeModule()["isSenderAllowed"](...args));
const linkRichMenuToUser = ((...args) => loadFacadeModule()["linkRichMenuToUser"](...args));
const linkRichMenuToUsers = ((...args) => loadFacadeModule()["linkRichMenuToUsers"](...args));
const messageAction = ((...args) => loadFacadeModule()["messageAction"](...args));
const monitorLineProvider = ((...args) => loadFacadeModule()["monitorLineProvider"](...args));
const normalizeAllowFrom = ((...args) => loadFacadeModule()["normalizeAllowFrom"](...args));
const normalizeDmAllowFromWithStore = ((...args) => loadFacadeModule()["normalizeDmAllowFromWithStore"](...args));
const postbackAction = ((...args) => loadFacadeModule()["postbackAction"](...args));
const probeLineBot = ((...args) => loadFacadeModule()["probeLineBot"](...args));
const pushFlexMessage = ((...args) => loadFacadeModule()["pushFlexMessage"](...args));
const pushLocationMessage = ((...args) => loadFacadeModule()["pushLocationMessage"](...args));
const pushMessageLine = ((...args) => loadFacadeModule()["pushMessageLine"](...args));
const pushMessagesLine = ((...args) => loadFacadeModule()["pushMessagesLine"](...args));
const pushTemplateMessage = ((...args) => loadFacadeModule()["pushTemplateMessage"](...args));
const pushTextMessageWithQuickReplies = ((...args) => loadFacadeModule()["pushTextMessageWithQuickReplies"](...args));
const sendMessageLine = ((...args) => loadFacadeModule()["sendMessageLine"](...args));
const setDefaultRichMenu = ((...args) => loadFacadeModule()["setDefaultRichMenu"](...args));
const toFlexMessage = ((...args) => loadFacadeModule()["toFlexMessage"](...args));
const unlinkRichMenuFromUser = ((...args) => loadFacadeModule()["unlinkRichMenuFromUser"](...args));
const unlinkRichMenuFromUsers = ((...args) => loadFacadeModule()["unlinkRichMenuFromUsers"](...args));
const uploadRichMenuImage = ((...args) => loadFacadeModule()["uploadRichMenuImage"](...args));
const uriAction = ((...args) => loadFacadeModule()["uriAction"](...args));
//#endregion
export { linkRichMenuToUser as A, pushMessageLine as B, downloadLineMedia as C, getRichMenuIdOfUser as D, getRichMenu as E, normalizeDmAllowFromWithStore as F, setDefaultRichMenu as G, pushTemplateMessage as H, postbackAction as I, unlinkRichMenuFromUsers as J, toFlexMessage as K, probeLineBot as L, messageAction as M, monitorLineProvider as N, getRichMenuList as O, normalizeAllowFrom as P, pushFlexMessage as R, deleteRichMenuAlias as S, getDefaultRichMenuId as T, pushTextMessageWithQuickReplies as U, pushMessagesLine as V, sendMessageLine as W, uriAction as X, uploadRichMenuImage as Y, createReceiptCard as _, createAppleTvRemoteCard as a, datetimePickerAction as b, createDeviceControlCard as c, createImageCard as d, createInfoCard as f, createQuickReplyItems as g, createNotificationBubble as h, createAgendaCard as i, linkRichMenuToUsers as j, isSenderAllowed as k, createEventCard as l, createMediaPlayerCard as m, cancelDefaultRichMenu as n, createCarousel as o, createListCard as p, unlinkRichMenuFromUser as q, createActionCard as r, createDefaultMenuConfig as s, buildTemplateMessageFromPayload as t, createGridLayout as u, createRichMenu as v, firstDefined as w, deleteRichMenu as x, createRichMenuAlias as y, pushLocationMessage as z };
