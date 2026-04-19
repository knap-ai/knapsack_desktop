import "./paths-Dvv9VRAc.js";
import "./types.secrets-CeL3gSMO.js";
import { g as writeConfigFile, h as resolveConfigSnapshotHash, u as readConfigFileSnapshotForWrite } from "./io-5pxHCi7V.js";
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
async function replaceConfigFile(params) {
	const { snapshot, writeOptions } = params.snapshot && params.writeOptions ? {
		snapshot: params.snapshot,
		writeOptions: params.writeOptions
	} : await readConfigFileSnapshotForWrite();
	const previousHash = assertBaseHashMatches(snapshot, params.baseHash);
	await writeConfigFile(params.nextConfig, {
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
	await writeConfigFile(draft, {
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
