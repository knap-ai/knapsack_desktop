import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/cli/root-help-metadata.ts
let precomputedRootHelpText;
function loadPrecomputedRootHelpText() {
	if (precomputedRootHelpText !== void 0) return precomputedRootHelpText;
	try {
		const metadataPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "cli-startup-metadata.json");
		const raw = fs.readFileSync(metadataPath, "utf8");
		const parsed = JSON.parse(raw);
		if (typeof parsed.rootHelpText === "string" && parsed.rootHelpText.length > 0) {
			precomputedRootHelpText = parsed.rootHelpText;
			return precomputedRootHelpText;
		}
	} catch {}
	precomputedRootHelpText = null;
	return null;
}
function outputPrecomputedRootHelpText() {
	const rootHelpText = loadPrecomputedRootHelpText();
	if (!rootHelpText) return false;
	process.stdout.write(rootHelpText);
	return true;
}
//#endregion
export { outputPrecomputedRootHelpText };
