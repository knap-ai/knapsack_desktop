import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/cli/startup-metadata.ts
const STARTUP_METADATA_FILE = "cli-startup-metadata.json";
function resolveStartupMetadataPathCandidates(moduleUrl) {
	const moduleDir = path.dirname(fileURLToPath(moduleUrl));
	return [path.resolve(moduleDir, STARTUP_METADATA_FILE), path.resolve(moduleDir, "..", STARTUP_METADATA_FILE)];
}
function readCliStartupMetadata(moduleUrl) {
	for (const metadataPath of resolveStartupMetadataPathCandidates(moduleUrl)) try {
		return JSON.parse(fs.readFileSync(metadataPath, "utf8"));
	} catch {}
	return null;
}
//#endregion
export { readCliStartupMetadata as t };
