import { l as isRecord } from "./utils-BMRcljdi.js";
import { n as isPathInside } from "./scan-paths-DJpPaKAg.js";
import { H as formatInvalidConfigDetails, T as validateConfigObjectWithPlugins, U as maintainConfigBackups, V as createInvalidConfigError, d as readConfigFileSnapshotForWrite, v as resolveConfigSnapshotHash, y as writeConfigFile } from "./io-Dv_xNAZB.js";
import { r as INCLUDE_KEY } from "./includes-D78R0cWm.js";
import path from "node:path";
import fs from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import crypto from "node:crypto";
//#region src/config/mutate.ts
var ConfigMutationConflictError = class extends Error {
	constructor(message, params) {
		super(message);
		this.name = "ConfigMutationConflictError";
		this.currentHash = params.currentHash;
	}
};
function assertBaseHashMatches(snapshot, expectedHash) {
	const currentHash = resolveConfigSnapshotHash(snapshot) ?? null;
	if (expectedHash !== void 0 && expectedHash !== currentHash) throw new ConfigMutationConflictError("config changed since last load", { currentHash });
	return currentHash;
}
function getChangedTopLevelKeys(base, next) {
	if (!isRecord(base) || !isRecord(next)) return isDeepStrictEqual(base, next) ? [] : ["<root>"];
	return [...new Set([...Object.keys(base), ...Object.keys(next)])].filter((key) => !isDeepStrictEqual(base[key], next[key]));
}
function getSingleTopLevelIncludeTarget(params) {
	if (!isRecord(params.snapshot.parsed)) return null;
	const authoredSection = params.snapshot.parsed[params.key];
	if (!isRecord(authoredSection)) return null;
	const keys = Object.keys(authoredSection);
	const includeValue = authoredSection[INCLUDE_KEY];
	if (keys.length !== 1 || typeof includeValue !== "string") return null;
	const rootDir = path.dirname(params.snapshot.path);
	const resolved = path.normalize(path.isAbsolute(includeValue) ? includeValue : path.resolve(rootDir, includeValue));
	if (!isPathInside(rootDir, resolved)) return null;
	return resolved;
}
async function writeJsonFileAtomic(filePath, value) {
	const dir = path.dirname(filePath);
	const tmp = path.join(dir, `${path.basename(filePath)}.${process.pid}.${crypto.randomUUID()}.tmp`);
	try {
		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, {
			encoding: "utf-8",
			mode: 384
		});
		await fs.access(filePath).then(async () => await maintainConfigBackups(filePath, fs), () => void 0);
		await fs.rename(tmp, filePath);
		await fs.chmod(filePath, 384).catch(() => {});
	} catch (err) {
		await fs.unlink(tmp).catch(() => {});
		throw err;
	}
}
async function tryWriteSingleTopLevelIncludeMutation(params) {
	const changedKeys = getChangedTopLevelKeys(params.snapshot.sourceConfig, params.nextConfig);
	if (changedKeys.length !== 1 || changedKeys[0] === "<root>") return false;
	const key = changedKeys[0];
	const includePath = getSingleTopLevelIncludeTarget({
		snapshot: params.snapshot,
		key
	});
	if (!includePath || !isRecord(params.nextConfig) || !(key in params.nextConfig)) return false;
	const nextConfigRecord = params.nextConfig;
	const validated = validateConfigObjectWithPlugins(params.nextConfig);
	if (!validated.ok) throw createInvalidConfigError(params.snapshot.path, formatInvalidConfigDetails(validated.issues));
	await writeJsonFileAtomic(includePath, nextConfigRecord[key]);
	return true;
}
async function replaceConfigFile(params) {
	const { snapshot, writeOptions } = params.snapshot && params.writeOptions ? {
		snapshot: params.snapshot,
		writeOptions: params.writeOptions
	} : await readConfigFileSnapshotForWrite();
	const previousHash = assertBaseHashMatches(snapshot, params.baseHash);
	if (!await tryWriteSingleTopLevelIncludeMutation({
		snapshot,
		nextConfig: params.nextConfig
	})) await writeConfigFile(params.nextConfig, {
		baseSnapshot: snapshot,
		...writeOptions,
		...params.writeOptions
	});
	return {
		path: snapshot.path,
		previousHash,
		snapshot,
		nextConfig: params.nextConfig
	};
}
async function mutateConfigFile(params) {
	const { snapshot, writeOptions } = await readConfigFileSnapshotForWrite();
	const previousHash = assertBaseHashMatches(snapshot, params.baseHash);
	const baseConfig = params.base === "runtime" ? snapshot.runtimeConfig : snapshot.sourceConfig;
	const draft = structuredClone(baseConfig);
	const result = await params.mutate(draft, {
		snapshot,
		previousHash
	});
	if (!await tryWriteSingleTopLevelIncludeMutation({
		snapshot,
		nextConfig: draft
	})) await writeConfigFile(draft, {
		...writeOptions,
		...params.writeOptions
	});
	return {
		path: snapshot.path,
		previousHash,
		snapshot,
		nextConfig: draft,
		result
	};
}
//#endregion
export { mutateConfigFile as n, replaceConfigFile as r, ConfigMutationConflictError as t };
