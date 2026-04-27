import { i as runExec } from "./exec-BaXt0vsL.js";
import { i as generateSecureToken } from "./secure-random-D0one-pn.js";
import "./browser-node-runtime-BumvO3qI.js";
import "./browser-security-runtime-BrD1-zTV.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
//#region extensions/browser/src/browser/trash.ts
async function movePathToTrash(targetPath) {
	try {
		await runExec("trash", [targetPath], { timeoutMs: 1e4 });
		return targetPath;
	} catch {
		const trashDir = path.join(os.homedir(), ".Trash");
		fs.mkdirSync(trashDir, { recursive: true });
		const base = path.basename(targetPath);
		let dest = path.join(trashDir, `${base}-${Date.now()}`);
		if (fs.existsSync(dest)) dest = path.join(trashDir, `${base}-${Date.now()}-${generateSecureToken(6)}`);
		fs.renameSync(targetPath, dest);
		return dest;
	}
}
//#endregion
export { movePathToTrash as t };
