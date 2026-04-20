import { i as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/line-surface.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "line",
		artifactBasename: "runtime-api.js"
	});
}
const createActionCard = ((...args) => loadFacadeModule()["createActionCard"](...args));
const createAgendaCard = ((...args) => loadFacadeModule()["createAgendaCard"](...args));
const createAppleTvRemoteCard = ((...args) => loadFacadeModule()["createAppleTvRemoteCard"](...args));
const createDeviceControlCard = ((...args) => loadFacadeModule()["createDeviceControlCard"](...args));
const createEventCard = ((...args) => loadFacadeModule()["createEventCard"](...args));
const createImageCard = ((...args) => loadFacadeModule()["createImageCard"](...args));
const createInfoCard = ((...args) => loadFacadeModule()["createInfoCard"](...args));
const createListCard = ((...args) => loadFacadeModule()["createListCard"](...args));
const createMediaPlayerCard = ((...args) => loadFacadeModule()["createMediaPlayerCard"](...args));
const createReceiptCard = ((...args) => loadFacadeModule()["createReceiptCard"](...args));
const LineConfigSchema = createLazyFacadeObjectValue(() => loadFacadeModule()["LineConfigSchema"]);
const listLineAccountIds = ((...args) => loadFacadeModule()["listLineAccountIds"](...args));
const normalizeAccountId = ((...args) => loadFacadeModule()["normalizeAccountId"](...args));
const processLineMessage = ((...args) => loadFacadeModule()["processLineMessage"](...args));
const resolveDefaultLineAccountId = ((...args) => loadFacadeModule()["resolveDefaultLineAccountId"](...args));
const resolveExactLineGroupConfigKey = ((...args) => loadFacadeModule()["resolveExactLineGroupConfigKey"](...args));
const resolveLineAccount = ((...args) => loadFacadeModule()["resolveLineAccount"](...args));
//#endregion
export { resolveLineAccount as _, createDeviceControlCard as a, createInfoCard as c, createReceiptCard as d, listLineAccountIds as f, resolveExactLineGroupConfigKey as g, resolveDefaultLineAccountId as h, createAppleTvRemoteCard as i, createListCard as l, processLineMessage as m, createActionCard as n, createEventCard as o, normalizeAccountId as p, createAgendaCard as r, createImageCard as s, LineConfigSchema as t, createMediaPlayerCard as u };
