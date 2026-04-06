//#region src/plugins/api-builder.ts
const noopRegisterTool = () => {};
const noopRegisterHook = () => {};
const noopRegisterHttpRoute = () => {};
const noopRegisterChannel = () => {};
const noopRegisterGatewayMethod = () => {};
const noopRegisterCli = () => {};
const noopRegisterService = () => {};
const noopRegisterCliBackend = () => {};
const noopRegisterProvider = () => {};
const noopRegisterSpeechProvider = () => {};
const noopRegisterMediaUnderstandingProvider = () => {};
const noopRegisterImageGenerationProvider = () => {};
const noopRegisterWebFetchProvider = () => {};
const noopRegisterWebSearchProvider = () => {};
const noopRegisterInteractiveHandler = () => {};
const noopOnConversationBindingResolved = () => {};
const noopRegisterCommand = () => {};
const noopRegisterContextEngine = () => {};
const noopRegisterMemoryPromptSection = () => {};
const noopRegisterMemoryFlushPlan = () => {};
const noopRegisterMemoryRuntime = () => {};
const noopRegisterMemoryEmbeddingProvider = () => {};
const noopOn = () => {};
function buildPluginApi(params) {
	const handlers = params.handlers ?? {};
	return {
		id: params.id,
		name: params.name,
		version: params.version,
		description: params.description,
		source: params.source,
		rootDir: params.rootDir,
		registrationMode: params.registrationMode,
		config: params.config,
		pluginConfig: params.pluginConfig,
		runtime: params.runtime,
		logger: params.logger,
		registerTool: handlers.registerTool ?? noopRegisterTool,
		registerHook: handlers.registerHook ?? noopRegisterHook,
		registerHttpRoute: handlers.registerHttpRoute ?? noopRegisterHttpRoute,
		registerChannel: handlers.registerChannel ?? noopRegisterChannel,
		registerGatewayMethod: handlers.registerGatewayMethod ?? noopRegisterGatewayMethod,
		registerCli: handlers.registerCli ?? noopRegisterCli,
		registerService: handlers.registerService ?? noopRegisterService,
		registerCliBackend: handlers.registerCliBackend ?? noopRegisterCliBackend,
		registerProvider: handlers.registerProvider ?? noopRegisterProvider,
		registerSpeechProvider: handlers.registerSpeechProvider ?? noopRegisterSpeechProvider,
		registerMediaUnderstandingProvider: handlers.registerMediaUnderstandingProvider ?? noopRegisterMediaUnderstandingProvider,
		registerImageGenerationProvider: handlers.registerImageGenerationProvider ?? noopRegisterImageGenerationProvider,
		registerWebFetchProvider: handlers.registerWebFetchProvider ?? noopRegisterWebFetchProvider,
		registerWebSearchProvider: handlers.registerWebSearchProvider ?? noopRegisterWebSearchProvider,
		registerInteractiveHandler: handlers.registerInteractiveHandler ?? noopRegisterInteractiveHandler,
		onConversationBindingResolved: handlers.onConversationBindingResolved ?? noopOnConversationBindingResolved,
		registerCommand: handlers.registerCommand ?? noopRegisterCommand,
		registerContextEngine: handlers.registerContextEngine ?? noopRegisterContextEngine,
		registerMemoryPromptSection: handlers.registerMemoryPromptSection ?? noopRegisterMemoryPromptSection,
		registerMemoryFlushPlan: handlers.registerMemoryFlushPlan ?? noopRegisterMemoryFlushPlan,
		registerMemoryRuntime: handlers.registerMemoryRuntime ?? noopRegisterMemoryRuntime,
		registerMemoryEmbeddingProvider: handlers.registerMemoryEmbeddingProvider ?? noopRegisterMemoryEmbeddingProvider,
		resolvePath: params.resolvePath,
		on: handlers.on ?? noopOn
	};
}
//#endregion
export { buildPluginApi as t };
