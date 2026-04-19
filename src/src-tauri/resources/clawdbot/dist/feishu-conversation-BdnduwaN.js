import { i as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue, t as createLazyFacadeArrayValue } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/feishu-conversation.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "feishu",
		artifactBasename: "contract-api.js"
	});
}
const buildFeishuConversationId = ((...args) => loadFacadeModule()["buildFeishuConversationId"](...args));
const createFeishuThreadBindingManager = ((...args) => loadFacadeModule()["createFeishuThreadBindingManager"](...args));
const feishuSessionBindingAdapterChannels = createLazyFacadeArrayValue(() => loadFacadeModule()["feishuSessionBindingAdapterChannels"]);
const feishuThreadBindingTesting = createLazyFacadeObjectValue(() => loadFacadeModule()["feishuThreadBindingTesting"]);
const parseFeishuDirectConversationId = ((...args) => loadFacadeModule()["parseFeishuDirectConversationId"](...args));
const parseFeishuConversationId = ((...args) => loadFacadeModule()["parseFeishuConversationId"](...args));
const parseFeishuTargetId = ((...args) => loadFacadeModule()["parseFeishuTargetId"](...args));
//#endregion
export { parseFeishuConversationId as a, feishuThreadBindingTesting as i, createFeishuThreadBindingManager as n, parseFeishuDirectConversationId as o, feishuSessionBindingAdapterChannels as r, parseFeishuTargetId as s, buildFeishuConversationId as t };
