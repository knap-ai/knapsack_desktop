import { o as getTailnetHostname } from "./tailscale-BZvX3b19.js";
import { n as getActiveMemorySearchManager } from "./memory-runtime-Cwhkcxba.js";
//#region src/commands/status.scan.deps.runtime.ts
async function getMemorySearchManager(params) {
	const { manager } = await getActiveMemorySearchManager(params);
	if (!manager) return { manager: null };
	return { manager: {
		async probeVectorAvailability() {
			return await manager.probeVectorAvailability();
		},
		status() {
			return manager.status();
		},
		close: manager.close ? async () => await manager.close?.() : void 0
	} };
}
//#endregion
export { getMemorySearchManager, getTailnetHostname };
