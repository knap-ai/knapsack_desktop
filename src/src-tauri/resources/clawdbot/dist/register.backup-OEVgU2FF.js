import { n as defaultRuntime, r as writeRuntimeJson } from "./runtime-Dx7oeLYq.js";
import { t as formatDocsLink } from "./links-rWevNMpC.js";
import { r as theme } from "./theme-BrRleVfL.js";
import { n as formatBackupCreateSummary, t as createBackupArchive } from "./backup-create-C3OjbiPz.js";
import { n as runCommandWithRuntime } from "./cli-utils-CsLPn__A.js";
import { t as formatHelpExamples } from "./help-format-Cn2mAwEx.js";
import { t as backupVerifyCommand } from "./backup-verify-CHb0_e1n.js";
//#region src/commands/backup.ts
let backupVerifyRuntimePromise;
function loadBackupVerifyRuntime() {
	backupVerifyRuntimePromise ??= import("./backup-verify-DkByfTOT.js");
	return backupVerifyRuntimePromise;
}
async function backupCreateCommand(runtime, opts = {}) {
	const result = await createBackupArchive(opts);
	if (opts.verify && !opts.dryRun) {
		const { backupVerifyCommand } = await loadBackupVerifyRuntime();
		await backupVerifyCommand({
			...runtime,
			log: () => {}
		}, {
			archive: result.archivePath,
			json: false
		});
		result.verified = true;
	}
	if (opts.json) writeRuntimeJson(runtime, result);
	else runtime.log(formatBackupCreateSummary(result).join("\n"));
	return result;
}
//#endregion
//#region src/cli/program/register.backup.ts
function registerBackupCommand(program) {
	const backup = program.command("backup").description("Create and verify local backup archives for OpenClaw state").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/backup", "docs.openclaw.ai/cli/backup")}\n`);
	backup.command("create").description("Write a backup archive for config, credentials, sessions, and workspaces").option("--output <path>", "Archive path or destination directory").option("--json", "Output JSON", false).option("--dry-run", "Print the backup plan without writing the archive", false).option("--verify", "Verify the archive after writing it", false).option("--only-config", "Back up only the active JSON config file", false).option("--no-include-workspace", "Exclude workspace directories from the backup").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw backup create", "Create a timestamped backup in the current directory."],
		["openclaw backup create --output ~/Backups", "Write the archive into an existing backup directory."],
		["openclaw backup create --dry-run --json", "Preview the archive plan without writing any files."],
		["openclaw backup create --verify", "Create the archive and immediately validate its manifest and payload layout."],
		["openclaw backup create --no-include-workspace", "Back up state/config without agent workspace files."],
		["openclaw backup create --only-config", "Back up only the active JSON config file."]
	])}`).action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await backupCreateCommand(defaultRuntime, {
				output: opts.output,
				json: Boolean(opts.json),
				dryRun: Boolean(opts.dryRun),
				verify: Boolean(opts.verify),
				onlyConfig: Boolean(opts.onlyConfig),
				includeWorkspace: opts.includeWorkspace
			});
		});
	});
	backup.command("verify <archive>").description("Validate a backup archive and its embedded manifest").option("--json", "Output JSON", false).addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([["openclaw backup verify ./2026-03-09T00-00-00.000Z-openclaw-backup.tar.gz", "Check that the archive structure and manifest are intact."], ["openclaw backup verify ~/Backups/latest.tar.gz --json", "Emit machine-readable verification output."]])}`).action(async (archive, opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await backupVerifyCommand(defaultRuntime, {
				archive,
				json: Boolean(opts.json)
			});
		});
	});
}
//#endregion
export { registerBackupCommand };
