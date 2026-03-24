import "./redact-BDinS1q9.js";
import "./errors-BxyFnvP3.js";
import "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import { r as theme } from "./theme-CdOoMzRk.js";
import "./globals-DBUMOBZ8.js";
import { h as writeRuntimeJson, m as defaultRuntime } from "./subsystem-DISldKSB.js";
import "./ansi-BEJF8NKS.js";
import "./boolean-C3GkJetE.js";
import "./env-Dnra1IpT.js";
import { y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { t as formatDocsLink } from "./links-8xRhWBQL.js";
import "./agent-scope-bjWqU22i.js";
import "./boundary-path-Dm0QJ7-y.js";
import "./boundary-file-read-DcZxlWD8.js";
import "./logger-BmpSCz93.js";
import "./exec-B5_AYfQG.js";
import "./workspace-D4K6QX9X.js";
import "./model-selection-BnFtDmP7.js";
import "./io-y3Az_Onx.js";
import "./shell-env-BOu7XeT_.js";
import "./safe-text-yavot2qw.js";
import "./version-CD3oP1-d.js";
import "./env-substitution-O6uabUmO.js";
import "./includes-Bj3eLUWH.js";
import "./zod-schema.providers-core-COy5nBQ0.js";
import "./legacy-web-search-BB-ZHEhz.js";
import "./registry-C5UkPpaO.js";
import "./config-state-Br0ucqMb.js";
import "./min-host-version-RMBWtIAR.js";
import "./manifest-registry-B5JNQdOM.js";
import "./runtime-guard-PhQ6PwQa.js";
import "./avatar-policy-B5nOfso_.js";
import "./ip-Ce8EDTBZ.js";
import "./zod-schema.agent-runtime-Dtg4Jy6G.js";
import "./zod-schema.core-BuVz8Rk7.js";
import "./config-D4zN4BRl.js";
import { t as formatHelpExamples } from "./help-format-C_5MeE_w.js";
import { n as formatBackupCreateSummary, t as createBackupArchive } from "./backup-create-BuxXJpr7.js";
import { n as runCommandWithRuntime } from "./cli-utils-C5ijQCJ_.js";
import path from "node:path";
import * as tar from "tar";
//#region src/commands/backup-verify.ts
const WINDOWS_ABSOLUTE_ARCHIVE_PATH_RE = /^[A-Za-z]:[\\/]/;
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function stripTrailingSlashes(value) {
	return value.replace(/\/+$/u, "");
}
function normalizeArchivePath(entryPath, label) {
	const trimmed = stripTrailingSlashes(entryPath.trim());
	if (!trimmed) throw new Error(`${label} is empty.`);
	if (trimmed.startsWith("/") || WINDOWS_ABSOLUTE_ARCHIVE_PATH_RE.test(trimmed)) throw new Error(`${label} must be relative: ${entryPath}`);
	if (trimmed.includes("\\")) throw new Error(`${label} must use forward slashes: ${entryPath}`);
	if (trimmed.split("/").some((segment) => segment === "." || segment === "..")) throw new Error(`${label} contains path traversal segments: ${entryPath}`);
	const normalized = stripTrailingSlashes(path.posix.normalize(trimmed));
	if (!normalized || normalized === "." || normalized === ".." || normalized.startsWith("../")) throw new Error(`${label} resolves outside the archive root: ${entryPath}`);
	return normalized;
}
function normalizeArchiveRoot(rootName) {
	const normalized = normalizeArchivePath(rootName, "Backup manifest archiveRoot");
	if (normalized.includes("/")) throw new Error(`Backup manifest archiveRoot must be a single path segment: ${rootName}`);
	return normalized;
}
function isArchivePathWithin(child, parent) {
	const relative = path.posix.relative(parent, child);
	return relative === "" || !relative.startsWith("../") && relative !== "..";
}
function parseManifest(raw) {
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch (err) {
		throw new Error(`Backup manifest is not valid JSON: ${String(err)}`, { cause: err });
	}
	if (!isRecord(parsed)) throw new Error("Backup manifest must be an object.");
	if (parsed.schemaVersion !== 1) throw new Error(`Unsupported backup manifest schemaVersion: ${String(parsed.schemaVersion)}`);
	if (typeof parsed.archiveRoot !== "string" || !parsed.archiveRoot.trim()) throw new Error("Backup manifest is missing archiveRoot.");
	if (typeof parsed.createdAt !== "string" || !parsed.createdAt.trim()) throw new Error("Backup manifest is missing createdAt.");
	if (!Array.isArray(parsed.assets)) throw new Error("Backup manifest is missing assets.");
	const assets = [];
	for (const asset of parsed.assets) {
		if (!isRecord(asset)) throw new Error("Backup manifest contains a non-object asset.");
		if (typeof asset.kind !== "string" || !asset.kind.trim()) throw new Error("Backup manifest asset is missing kind.");
		if (typeof asset.sourcePath !== "string" || !asset.sourcePath.trim()) throw new Error("Backup manifest asset is missing sourcePath.");
		if (typeof asset.archivePath !== "string" || !asset.archivePath.trim()) throw new Error("Backup manifest asset is missing archivePath.");
		assets.push({
			kind: asset.kind,
			sourcePath: asset.sourcePath,
			archivePath: asset.archivePath
		});
	}
	return {
		schemaVersion: 1,
		archiveRoot: parsed.archiveRoot,
		createdAt: parsed.createdAt,
		runtimeVersion: typeof parsed.runtimeVersion === "string" && parsed.runtimeVersion.trim() ? parsed.runtimeVersion : "unknown",
		platform: typeof parsed.platform === "string" ? parsed.platform : "unknown",
		nodeVersion: typeof parsed.nodeVersion === "string" ? parsed.nodeVersion : "unknown",
		options: isRecord(parsed.options) ? { includeWorkspace: parsed.options.includeWorkspace } : void 0,
		paths: isRecord(parsed.paths) ? {
			stateDir: typeof parsed.paths.stateDir === "string" ? parsed.paths.stateDir : void 0,
			configPath: typeof parsed.paths.configPath === "string" ? parsed.paths.configPath : void 0,
			oauthDir: typeof parsed.paths.oauthDir === "string" ? parsed.paths.oauthDir : void 0,
			workspaceDirs: Array.isArray(parsed.paths.workspaceDirs) ? parsed.paths.workspaceDirs.filter((entry) => typeof entry === "string") : void 0
		} : void 0,
		assets,
		skipped: Array.isArray(parsed.skipped) ? parsed.skipped : void 0
	};
}
async function listArchiveEntries(archivePath) {
	const entries = [];
	await tar.t({
		file: archivePath,
		gzip: true,
		onentry: (entry) => {
			entries.push(entry.path);
		}
	});
	return entries;
}
async function extractManifest(params) {
	let manifestContentPromise;
	await tar.t({
		file: params.archivePath,
		gzip: true,
		onentry: (entry) => {
			if (entry.path !== params.manifestEntryPath) {
				entry.resume();
				return;
			}
			manifestContentPromise = new Promise((resolve, reject) => {
				const chunks = [];
				entry.on("data", (chunk) => {
					chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
				});
				entry.on("error", reject);
				entry.on("end", () => {
					resolve(Buffer.concat(chunks).toString("utf8"));
				});
			});
		}
	});
	if (!manifestContentPromise) throw new Error(`Archive is missing manifest entry: ${params.manifestEntryPath}`);
	return await manifestContentPromise;
}
function isRootManifestEntry(entryPath) {
	const parts = entryPath.split("/");
	return parts.length === 2 && parts[0] !== "" && parts[1] === "manifest.json";
}
function verifyManifestAgainstEntries(manifest, entries) {
	const archiveRoot = normalizeArchiveRoot(manifest.archiveRoot);
	const manifestEntryPath = path.posix.join(archiveRoot, "manifest.json");
	const normalizedEntries = [...entries];
	const normalizedEntrySet = new Set(normalizedEntries);
	if (!normalizedEntrySet.has(manifestEntryPath)) throw new Error(`Archive is missing manifest entry: ${manifestEntryPath}`);
	for (const entry of normalizedEntries) if (!isArchivePathWithin(entry, archiveRoot)) throw new Error(`Archive entry is outside the declared archive root: ${entry}`);
	const payloadRoot = path.posix.join(archiveRoot, "payload");
	for (const asset of manifest.assets) {
		const assetArchivePath = normalizeArchivePath(asset.archivePath, "Backup manifest asset path");
		if (!isArchivePathWithin(assetArchivePath, payloadRoot)) throw new Error(`Manifest asset path is outside payload root: ${asset.archivePath}`);
		const exact = normalizedEntrySet.has(assetArchivePath);
		const nested = normalizedEntries.some((entry) => entry !== assetArchivePath && isArchivePathWithin(entry, assetArchivePath));
		if (!exact && !nested) throw new Error(`Archive is missing payload for manifest asset: ${assetArchivePath}`);
	}
}
function formatResult(result) {
	return [
		`Backup archive OK: ${result.archivePath}`,
		`Archive root: ${result.archiveRoot}`,
		`Created at: ${result.createdAt}`,
		`Runtime version: ${result.runtimeVersion}`,
		`Assets verified: ${result.assetCount}`,
		`Archive entries scanned: ${result.entryCount}`
	].join("\n");
}
function findDuplicateNormalizedEntryPath(entries) {
	const seen = /* @__PURE__ */ new Set();
	for (const entry of entries) {
		if (seen.has(entry.normalized)) return entry.normalized;
		seen.add(entry.normalized);
	}
}
async function backupVerifyCommand(runtime, opts) {
	const archivePath = resolveUserPath(opts.archive);
	const rawEntries = await listArchiveEntries(archivePath);
	if (rawEntries.length === 0) throw new Error("Backup archive is empty.");
	const entries = rawEntries.map((entry) => ({
		raw: entry,
		normalized: normalizeArchivePath(entry, "Archive entry")
	}));
	const normalizedEntrySet = new Set(entries.map((entry) => entry.normalized));
	const manifestMatches = entries.filter((entry) => isRootManifestEntry(entry.normalized));
	if (manifestMatches.length !== 1) throw new Error(`Expected exactly one backup manifest entry, found ${manifestMatches.length}.`);
	const duplicateEntryPath = findDuplicateNormalizedEntryPath(entries);
	if (duplicateEntryPath) throw new Error(`Archive contains duplicate entry path: ${duplicateEntryPath}`);
	const manifestEntryPath = manifestMatches[0]?.raw;
	if (!manifestEntryPath) throw new Error("Backup archive manifest entry could not be resolved.");
	const manifest = parseManifest(await extractManifest({
		archivePath,
		manifestEntryPath
	}));
	verifyManifestAgainstEntries(manifest, normalizedEntrySet);
	const result = {
		ok: true,
		archivePath,
		archiveRoot: manifest.archiveRoot,
		createdAt: manifest.createdAt,
		runtimeVersion: manifest.runtimeVersion,
		assetCount: manifest.assets.length,
		entryCount: rawEntries.length
	};
	if (opts.json) writeRuntimeJson(runtime, result);
	else runtime.log(formatResult(result));
	return result;
}
//#endregion
//#region src/commands/backup.ts
async function backupCreateCommand(runtime, opts = {}) {
	const result = await createBackupArchive(opts);
	if (opts.verify && !opts.dryRun) {
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
