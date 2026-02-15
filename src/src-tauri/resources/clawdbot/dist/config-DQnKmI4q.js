import path from "node:path";
import fs from "node:fs";
import JSON5 from "json5";

//#region src/hooks/config.ts
function resolveHookConfig(config, hookKey) {
	const hooks = config?.hooks?.internal?.entries;
	if (!hooks || typeof hooks !== "object") return;
	const entry = hooks[hookKey];
	if (!entry || typeof entry !== "object") return;
	return entry;
}

//#endregion
export { resolveHookConfig as t };