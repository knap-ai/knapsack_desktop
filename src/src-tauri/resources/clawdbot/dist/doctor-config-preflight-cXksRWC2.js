import { f as resolveHomeDir } from "./utils-DvkbxKCZ.js";
import { g as recoverConfigFromJsonRootSuffix, u as readConfigFileSnapshot } from "./io-CFdEhZuM.js";
import { n as formatConfigIssueLines } from "./issue-format-DUq-EpQO.js";
import { t as note } from "./note-B6LXIgud.js";
import { n as noteIncludeConfinementWarning } from "./doctor-config-analysis-Cnu2PafQ.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/commands/doctor-config-preflight.ts
async function maybeMigrateLegacyConfig() {
	const changes = [];
	const home = resolveHomeDir();
	if (!home) return changes;
	const targetDir = path.join(home, ".openclaw");
	const targetPath = path.join(targetDir, "openclaw.json");
	try {
		await fs.access(targetPath);
		return changes;
	} catch {}
	const legacyCandidates = [path.join(home, ".clawdbot", "clawdbot.json")];
	let legacyPath = null;
	for (const candidate of legacyCandidates) try {
		await fs.access(candidate);
		legacyPath = candidate;
		break;
	} catch {}
	if (!legacyPath) return changes;
	await fs.mkdir(targetDir, { recursive: true });
	try {
		await fs.copyFile(legacyPath, targetPath, fs.constants.COPYFILE_EXCL);
		changes.push(`Migrated legacy config: ${legacyPath} -> ${targetPath}`);
	} catch {}
	return changes;
}
async function runDoctorConfigPreflight(options = {}) {
	if (options.migrateState !== false) {
		const { autoMigrateLegacyStateDir } = await import("./doctor-state-migrations-KnHNg3bb.js");
		const stateDirResult = await autoMigrateLegacyStateDir({ env: process.env });
		if (stateDirResult.changes.length > 0) note(stateDirResult.changes.map((entry) => `- ${entry}`).join("\n"), "Doctor changes");
		if (stateDirResult.warnings.length > 0) note(stateDirResult.warnings.map((entry) => `- ${entry}`).join("\n"), "Doctor warnings");
	}
	if (options.migrateLegacyConfig !== false) {
		const legacyConfigChanges = await maybeMigrateLegacyConfig();
		if (legacyConfigChanges.length > 0) note(legacyConfigChanges.map((entry) => `- ${entry}`).join("\n"), "Doctor changes");
	}
	let snapshot = await readConfigFileSnapshot();
	if (options.repairPrefixedConfig === true && snapshot.exists && !snapshot.valid && await recoverConfigFromJsonRootSuffix(snapshot)) {
		note("Removed non-JSON prefix from openclaw.json; original saved as .clobbered.*.", "Config");
		snapshot = await readConfigFileSnapshot();
	}
	const invalidConfigNote = options.invalidConfigNote ?? "Config invalid; doctor will run with best-effort config.";
	if (invalidConfigNote && snapshot.exists && !snapshot.valid && snapshot.legacyIssues.length === 0) {
		note(invalidConfigNote, "Config");
		noteIncludeConfinementWarning(snapshot);
	}
	const warnings = snapshot.warnings ?? [];
	if (warnings.length > 0) note(formatConfigIssueLines(warnings, "-").join("\n"), "Config warnings");
	return {
		snapshot,
		baseConfig: snapshot.sourceConfig ?? snapshot.config ?? {}
	};
}
//#endregion
export { runDoctorConfigPreflight as t };
