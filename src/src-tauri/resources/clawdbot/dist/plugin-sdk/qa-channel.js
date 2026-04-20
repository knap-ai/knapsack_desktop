import { i as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "../facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/qa-channel.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "qa-channel",
		artifactBasename: "api.js"
	});
}
const buildQaTarget = ((...args) => loadFacadeModule().buildQaTarget(...args));
const formatQaTarget = ((...args) => loadFacadeModule().buildQaTarget(...args));
const createQaBusThread = ((...args) => loadFacadeModule().createQaBusThread(...args));
const deleteQaBusMessage = ((...args) => loadFacadeModule().deleteQaBusMessage(...args));
const editQaBusMessage = ((...args) => loadFacadeModule().editQaBusMessage(...args));
const getQaBusState = ((...args) => loadFacadeModule().getQaBusState(...args));
const injectQaBusInboundMessage = ((...args) => loadFacadeModule().injectQaBusInboundMessage(...args));
const normalizeQaTarget = ((...args) => loadFacadeModule().normalizeQaTarget(...args));
const parseQaTarget = ((...args) => loadFacadeModule().parseQaTarget(...args));
const pollQaBus = ((...args) => loadFacadeModule().pollQaBus(...args));
const qaChannelPlugin = createLazyFacadeObjectValue(() => loadFacadeModule().qaChannelPlugin);
const reactToQaBusMessage = ((...args) => loadFacadeModule().reactToQaBusMessage(...args));
const readQaBusMessage = ((...args) => loadFacadeModule().readQaBusMessage(...args));
const searchQaBusMessages = ((...args) => loadFacadeModule().searchQaBusMessages(...args));
const sendQaBusMessage = ((...args) => loadFacadeModule().sendQaBusMessage(...args));
const setQaChannelRuntime = ((...args) => loadFacadeModule().setQaChannelRuntime(...args));
//#endregion
export { buildQaTarget, createQaBusThread, deleteQaBusMessage, editQaBusMessage, formatQaTarget, getQaBusState, injectQaBusInboundMessage, normalizeQaTarget, parseQaTarget, pollQaBus, qaChannelPlugin, reactToQaBusMessage, readQaBusMessage, searchQaBusMessages, sendQaBusMessage, setQaChannelRuntime };
