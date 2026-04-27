//#region extensions/codex/src/app-server/client-factory.ts
const defaultCodexAppServerClientFactory = (startOptions, authProfileId) => import("./shared-client-C3NXWlxU.js").then((n) => n.r).then(({ getSharedCodexAppServerClient }) => getSharedCodexAppServerClient({
	startOptions,
	authProfileId
}));
function createCodexAppServerClientFactoryTestHooks(setFactory) {
	return {
		setCodexAppServerClientFactoryForTests(factory) {
			setFactory(factory);
		},
		resetCodexAppServerClientFactoryForTests() {
			setFactory(defaultCodexAppServerClientFactory);
		}
	};
}
//#endregion
export { defaultCodexAppServerClientFactory as n, createCodexAppServerClientFactoryTestHooks as t };
