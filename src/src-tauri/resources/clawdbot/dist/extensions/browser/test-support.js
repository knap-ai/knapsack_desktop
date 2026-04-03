import { c as globalExpect } from "../../dist-CmA5gUW3.js";
import { C as createCliRuntimeCapture, a as captureEnv, i as cleanupSessionStateForTest, o as withEnv, s as withEnvAsync, v as isLiveTestEnabled } from "../../testing-BpSX8QqM.js";
import { t as withFetchPreconnect } from "../../fetch-mock-CFMoc-Jb.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
//#region src/test-utils/auth-token-assertions.ts
function expectGeneratedTokenPersistedToGatewayAuth(params) {
	globalExpect(params.generatedToken).toMatch(/^[0-9a-f]{48}$/);
	globalExpect(params.authToken).toBe(params.generatedToken);
	globalExpect(params.persistedConfig?.gateway?.auth?.mode).toBe("token");
	globalExpect(params.persistedConfig?.gateway?.auth?.token).toBe(params.generatedToken);
}
//#endregion
//#region src/test-utils/temp-home.ts
const HOME_ENV_KEYS = [
	"HOME",
	"USERPROFILE",
	"HOMEDRIVE",
	"HOMEPATH",
	"OPENCLAW_STATE_DIR"
];
async function createTempHomeEnv(prefix) {
	const home = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
	await fs.mkdir(path.join(home, ".openclaw"), { recursive: true });
	const snapshot = captureEnv([...HOME_ENV_KEYS]);
	process.env.HOME = home;
	process.env.USERPROFILE = home;
	process.env.OPENCLAW_STATE_DIR = path.join(home, ".openclaw");
	if (process.platform === "win32") {
		const match = home.match(/^([A-Za-z]:)(.*)$/);
		if (match) {
			process.env.HOMEDRIVE = match[1];
			process.env.HOMEPATH = match[2] || "\\";
		}
	}
	return {
		home,
		restore: async () => {
			await cleanupSessionStateForTest().catch(() => void 0);
			snapshot.restore();
			await fs.rm(home, {
				recursive: true,
				force: true
			});
		}
	};
}
//#endregion
export { createCliRuntimeCapture, createTempHomeEnv, expectGeneratedTokenPersistedToGatewayAuth, isLiveTestEnabled, withEnv, withEnvAsync, withFetchPreconnect };
