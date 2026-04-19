import { t as buildPluginApi } from "./api-builder-PBijLo-P.js";
//#region src/plugins/captured-registration.ts
function createCapturedPluginRegistration(params) {
	const providers = [];
	const agentHarnesses = [];
	const cliRegistrars = [];
	const cliBackends = [];
	const textTransforms = [];
	const speechProviders = [];
	const realtimeTranscriptionProviders = [];
	const realtimeVoiceProviders = [];
	const mediaUnderstandingProviders = [];
	const imageGenerationProviders = [];
	const videoGenerationProviders = [];
	const musicGenerationProviders = [];
	const webFetchProviders = [];
	const webSearchProviders = [];
	const memoryEmbeddingProviders = [];
	const tools = [];
	return {
		providers,
		agentHarnesses,
		cliRegistrars,
		cliBackends,
		textTransforms,
		speechProviders,
		realtimeTranscriptionProviders,
		realtimeVoiceProviders,
		mediaUnderstandingProviders,
		imageGenerationProviders,
		videoGenerationProviders,
		musicGenerationProviders,
		webFetchProviders,
		webSearchProviders,
		memoryEmbeddingProviders,
		tools,
		api: buildPluginApi({
			id: "captured-plugin-registration",
			name: "Captured Plugin Registration",
			source: "captured-plugin-registration",
			registrationMode: params?.registrationMode ?? "full",
			config: params?.config ?? {},
			runtime: {},
			logger: {
				info() {},
				warn() {},
				error() {},
				debug() {}
			},
			resolvePath: (input) => input,
			handlers: {
				registerCli(registrar, opts) {
					const descriptors = (opts?.descriptors ?? []).map((descriptor) => ({
						name: descriptor.name.trim(),
						description: descriptor.description.trim(),
						hasSubcommands: descriptor.hasSubcommands
					})).filter((descriptor) => descriptor.name && descriptor.description);
					const commands = [...opts?.commands ?? [], ...descriptors.map((descriptor) => descriptor.name)].map((command) => command.trim()).filter(Boolean);
					if (commands.length === 0) return;
					cliRegistrars.push({
						register: registrar,
						commands,
						descriptors
					});
				},
				registerProvider(provider) {
					providers.push(provider);
				},
				registerAgentHarness(harness) {
					agentHarnesses.push(harness);
				},
				registerCliBackend(backend) {
					cliBackends.push(backend);
				},
				registerTextTransforms(transforms) {
					textTransforms.push(transforms);
				},
				registerSpeechProvider(provider) {
					speechProviders.push(provider);
				},
				registerRealtimeTranscriptionProvider(provider) {
					realtimeTranscriptionProviders.push(provider);
				},
				registerRealtimeVoiceProvider(provider) {
					realtimeVoiceProviders.push(provider);
				},
				registerMediaUnderstandingProvider(provider) {
					mediaUnderstandingProviders.push(provider);
				},
				registerImageGenerationProvider(provider) {
					imageGenerationProviders.push(provider);
				},
				registerVideoGenerationProvider(provider) {
					videoGenerationProviders.push(provider);
				},
				registerMusicGenerationProvider(provider) {
					musicGenerationProviders.push(provider);
				},
				registerWebFetchProvider(provider) {
					webFetchProviders.push(provider);
				},
				registerWebSearchProvider(provider) {
					webSearchProviders.push(provider);
				},
				registerMemoryEmbeddingProvider(adapter) {
					memoryEmbeddingProviders.push(adapter);
				},
				registerTool(tool) {
					if (typeof tool !== "function") tools.push(tool);
				}
			}
		})
	};
}
function capturePluginRegistration(params) {
	const captured = createCapturedPluginRegistration();
	params.register(captured.api);
	return captured;
}
//#endregion
export { createCapturedPluginRegistration as n, capturePluginRegistration as t };
