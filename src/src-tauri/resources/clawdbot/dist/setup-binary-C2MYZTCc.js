import { y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { n as runCommandWithTimeout } from "./exec-B5_AYfQG.js";
import { t as isSafeExecutableValue } from "./exec-safety-CNibhD0r.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/plugins/setup-binary.ts
async function detectBinary(name) {
	if (!name?.trim()) return false;
	if (!isSafeExecutableValue(name)) return false;
	const resolved = name.startsWith("~") ? resolveUserPath(name) : name;
	if (path.isAbsolute(resolved) || resolved.startsWith(".") || resolved.includes("/") || resolved.includes("\\")) try {
		await fs.access(resolved);
		return true;
	} catch {
		return false;
	}
	const command = process.platform === "win32" ? ["where", name] : [
		"/usr/bin/env",
		"which",
		name
	];
	try {
		const result = await runCommandWithTimeout(command, { timeoutMs: 2e3 });
		return result.code === 0 && result.stdout.trim().length > 0;
	} catch {
		return false;
	}
}
//#endregion
export { detectBinary as t };
