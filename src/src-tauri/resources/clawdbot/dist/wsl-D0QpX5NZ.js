import { readFileSync } from "node:fs";
import fs$1 from "node:fs/promises";

//#region src/infra/wsl.ts
let wslCached = null;
function isWSLEnv() {
	if (process.env.WSL_INTEROP || process.env.WSL_DISTRO_NAME || process.env.WSLENV) return true;
	return false;
}
async function isWSL() {
	if (wslCached !== null) return wslCached;
	if (isWSLEnv()) {
		wslCached = true;
		return wslCached;
	}
	try {
		const release = await fs$1.readFile("/proc/sys/kernel/osrelease", "utf8");
		wslCached = release.toLowerCase().includes("microsoft") || release.toLowerCase().includes("wsl");
	} catch {
		wslCached = false;
	}
	return wslCached;
}

//#endregion
export { isWSLEnv as n, isWSL as t };