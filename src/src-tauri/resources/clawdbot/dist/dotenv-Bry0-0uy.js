import { _ as resolveStateDir } from "./paths-CD8i0MSg.js";
import { n as loadRuntimeDotEnvFile, r as loadWorkspaceDotEnvFile } from "./dotenv-BMiHUUlZ.js";
import path from "node:path";
//#region src/cli/dotenv.ts
function loadCliDotEnv(opts) {
	const quiet = opts?.quiet ?? true;
	loadWorkspaceDotEnvFile(path.join(process.cwd(), ".env"), { quiet });
	loadRuntimeDotEnvFile(path.join(resolveStateDir(process.env), ".env"), { quiet });
}
//#endregion
export { loadCliDotEnv };
