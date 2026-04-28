import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { g as shortenHomePath } from "./utils-DvkbxKCZ.js";
import { l as normalizeTrimmedStringList } from "./string-normalization-Cz5hTdB3.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-CXpW6f0a.js";
import { n as safeParseWithSchema, t as safeParseJsonWithSchema } from "./zod-parse-BzTcxszB.js";
import { t as note } from "./note-B6LXIgud.js";
import fs from "node:fs";
import { z } from "zod";
//#region src/commands/doctor-plugin-manifests.ts
const LEGACY_MANIFEST_CONTRACT_KEYS = [
	"speechProviders",
	"mediaUnderstandingProviders",
	"imageGenerationProviders"
];
const JsonRecordSchema = z.record(z.string(), z.unknown());
function readManifestJson(manifestPath) {
	try {
		return safeParseJsonWithSchema(JsonRecordSchema, fs.readFileSync(manifestPath, "utf-8"));
	} catch {
		return null;
	}
}
function buildLegacyManifestContractMigration(params) {
	const nextRaw = { ...params.raw };
	const parsedContracts = safeParseWithSchema(JsonRecordSchema, params.raw.contracts);
	const nextContracts = parsedContracts ? { ...parsedContracts } : {};
	const changeLines = [];
	for (const key of LEGACY_MANIFEST_CONTRACT_KEYS) {
		if (!(key in params.raw)) continue;
		const legacyValues = normalizeTrimmedStringList(params.raw[key]);
		const contractValues = normalizeTrimmedStringList(nextContracts[key]);
		if (legacyValues.length > 0 && contractValues.length === 0) {
			nextContracts[key] = legacyValues;
			changeLines.push(`- ${shortenHomePath(params.manifestPath)}: moved ${key} to contracts.${key}`);
		} else changeLines.push(`- ${shortenHomePath(params.manifestPath)}: removed legacy ${key} (kept contracts.${key})`);
		delete nextRaw[key];
	}
	if (changeLines.length === 0) return null;
	if (Object.keys(nextContracts).length > 0) nextRaw.contracts = nextContracts;
	else delete nextRaw.contracts;
	const pluginId = normalizeOptionalString(params.raw.id) ?? params.manifestPath;
	return {
		manifestPath: params.manifestPath,
		pluginId,
		nextRaw,
		changeLines
	};
}
function collectLegacyPluginManifestContractMigrations(params) {
	const seen = /* @__PURE__ */ new Set();
	const migrations = [];
	for (const plugin of loadPluginManifestRegistry({
		cache: false,
		...params?.env ? { env: params.env } : {}
	}).plugins) {
		if (seen.has(plugin.manifestPath)) continue;
		seen.add(plugin.manifestPath);
		const raw = readManifestJson(plugin.manifestPath);
		if (!raw) continue;
		const migration = buildLegacyManifestContractMigration({
			manifestPath: plugin.manifestPath,
			raw
		});
		if (migration) migrations.push(migration);
	}
	return migrations.toSorted((left, right) => left.manifestPath.localeCompare(right.manifestPath));
}
async function maybeRepairLegacyPluginManifestContracts(params) {
	const migrations = collectLegacyPluginManifestContractMigrations(params.env ? { env: params.env } : void 0);
	if (migrations.length === 0) return;
	const emitNote = params.note ?? note;
	emitNote(["Legacy plugin manifest capability keys detected.", ...migrations.flatMap((migration) => migration.changeLines)].join("\n"), "Plugin manifests");
	if (!(params.prompter.shouldRepair || await params.prompter.confirmAutoFix({
		message: "Rewrite legacy plugin manifest capability keys into contracts now?",
		initialValue: true
	}))) return;
	const applied = [];
	for (const migration of migrations) try {
		fs.writeFileSync(migration.manifestPath, `${JSON.stringify(migration.nextRaw, null, 2)}\n`, "utf-8");
		applied.push(...migration.changeLines);
	} catch (error) {
		params.runtime.error(`Failed to rewrite legacy plugin manifest at ${migration.manifestPath}: ${String(error)}`);
	}
	if (applied.length > 0) emitNote(applied.join("\n"), "Doctor changes");
}
//#endregion
export { maybeRepairLegacyPluginManifestContracts };
