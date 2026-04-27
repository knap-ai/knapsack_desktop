import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { r as STATE_DIR } from "./paths-BG0ad0P6.js";
//#region src/plugins/services.ts
const log = createSubsystemLogger("plugins");
function createPluginLogger() {
	return {
		info: (msg) => log.info(msg),
		warn: (msg) => log.warn(msg),
		error: (msg) => log.error(msg),
		debug: (msg) => log.debug(msg)
	};
}
function createServiceContext(params) {
	return {
		config: params.config,
		workspaceDir: params.workspaceDir,
		stateDir: STATE_DIR,
		logger: createPluginLogger()
	};
}
async function startPluginServices(params) {
	const running = [];
	const serviceContext = createServiceContext({
		config: params.config,
		workspaceDir: params.workspaceDir
	});
	for (const entry of params.registry.services) {
		const service = entry.service;
		try {
			await service.start(serviceContext);
			running.push({
				id: service.id,
				stop: service.stop ? () => service.stop?.(serviceContext) : void 0
			});
		} catch (err) {
			const error = err;
			const stack = error?.stack?.trim();
			log.error(`plugin service failed (${service.id}, plugin=${entry.pluginId}, root=${entry.rootDir ?? "unknown"}): ${error?.message ?? String(err)}${stack ? `\n${stack}` : ""}`);
		}
	}
	return { stop: async () => {
		for (const entry of running.toReversed()) {
			if (!entry.stop) continue;
			try {
				await entry.stop();
			} catch (err) {
				log.warn(`plugin service stop failed (${entry.id}): ${String(err)}`);
			}
		}
	} };
}
//#endregion
export { startPluginServices };
