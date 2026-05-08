import { a as markMigrationItemError, i as markMigrationItemConflict, n as MIGRATION_REASON_TARGET_EXISTS, o as markMigrationItemSkipped, r as createMigrationItem } from "./migration-W015rITt.js";
import { a as isRecord, d as sanitizeName, n as childRecord, o as readJsonObject } from "./helpers-89ezfCfr.js";
//#region extensions/migrate-claude/config.ts
const CONFIG_RUNTIME_UNAVAILABLE = "config runtime unavailable";
const MISSING_CONFIG_PATCH = "missing config patch";
var ConfigPatchConflictError = class extends Error {
	constructor(reason) {
		super(reason);
		this.reason = reason;
		this.name = "ConfigPatchConflictError";
	}
};
function readPath(root, path) {
	let current = root;
	for (const segment of path) {
		if (!isRecord(current)) return;
		current = current[segment];
	}
	return current;
}
function mergeValue(left, right) {
	if (!isRecord(left) || !isRecord(right)) return structuredClone(right);
	const next = { ...left };
	for (const [key, value] of Object.entries(right)) next[key] = mergeValue(next[key], value);
	return next;
}
function writePath(root, path, value) {
	let current = root;
	for (const segment of path.slice(0, -1)) {
		const existing = current[segment];
		if (!isRecord(existing)) current[segment] = {};
		current = current[segment];
	}
	const leaf = path.at(-1);
	if (!leaf) return;
	current[leaf] = mergeValue(current[leaf], value);
}
function hasPatchConflict(config, path, value) {
	if (!isRecord(value)) return readPath(config, path) !== void 0;
	const existing = readPath(config, path);
	if (!isRecord(existing)) return false;
	return Object.keys(value).some((key) => existing[key] !== void 0);
}
function createConfigPatchItem(params) {
	return createMigrationItem({
		id: params.id,
		kind: "config",
		action: "merge",
		source: params.source,
		target: params.target,
		status: params.conflict ? "conflict" : "planned",
		reason: params.conflict ? params.reason ?? "target exists" : void 0,
		message: params.message,
		details: {
			...params.details,
			path: params.path,
			value: params.value
		}
	});
}
function createManualItem(params) {
	return createMigrationItem({
		id: params.id,
		kind: "manual",
		action: "manual",
		source: params.source,
		status: "skipped",
		message: params.message,
		reason: params.recommendation
	});
}
function mapMcpServers(raw) {
	if (!isRecord(raw)) return;
	const mapped = {};
	for (const [name, value] of Object.entries(raw)) {
		if (!name.trim() || !isRecord(value)) continue;
		const next = {};
		for (const key of [
			"command",
			"args",
			"env",
			"cwd",
			"workingDirectory",
			"url",
			"type",
			"transport",
			"headers",
			"connectionTimeoutMs"
		]) if (value[key] !== void 0) next[key] = value[key];
		if (Object.keys(next).length > 0) mapped[name] = next;
	}
	return Object.keys(mapped).length > 0 ? mapped : void 0;
}
async function collectMcpSources(source) {
	const sources = [];
	const projectMcp = await readJsonObject(source.projectMcpPath);
	const projectServers = mapMcpServers(projectMcp.mcpServers ?? projectMcp);
	if (projectServers && source.projectMcpPath) sources.push({
		sourceId: "project-mcp",
		sourceLabel: "project .mcp.json",
		sourcePath: source.projectMcpPath,
		servers: projectServers
	});
	const claudeJson = await readJsonObject(source.userClaudeJsonPath);
	const userServers = mapMcpServers(claudeJson.mcpServers);
	if (userServers && source.userClaudeJsonPath) sources.push({
		sourceId: "user-claude-json",
		sourceLabel: "user ~/.claude.json",
		sourcePath: source.userClaudeJsonPath,
		servers: userServers
	});
	if (source.projectDir) {
		const projectScopedServers = mapMcpServers(childRecord(childRecord(claudeJson, "projects"), source.projectDir).mcpServers);
		if (projectScopedServers && source.userClaudeJsonPath) sources.push({
			sourceId: "user-claude-json-project",
			sourceLabel: "project entry in ~/.claude.json",
			sourcePath: source.userClaudeJsonPath,
			servers: projectScopedServers
		});
	}
	const desktopServers = mapMcpServers((await readJsonObject(source.desktopConfigPath)).mcpServers);
	if (desktopServers && source.desktopConfigPath) sources.push({
		sourceId: "desktop",
		sourceLabel: "Claude Desktop config",
		sourcePath: source.desktopConfigPath,
		servers: desktopServers
	});
	return sources;
}
async function buildConfigItems(params) {
	const items = [];
	const mcpSources = await collectMcpSources(params.source);
	const counts = /* @__PURE__ */ new Map();
	for (const mcpSource of mcpSources) for (const name of Object.keys(mcpSource.servers)) counts.set(name, (counts.get(name) ?? 0) + 1);
	for (const mcpSource of mcpSources) for (const [name, value] of Object.entries(mcpSource.servers)) {
		const patch = { [name]: value };
		const duplicate = (counts.get(name) ?? 0) > 1;
		const conflict = duplicate || !params.ctx.overwrite && hasPatchConflict(params.ctx.config, ["mcp", "servers"], patch);
		items.push(createConfigPatchItem({
			id: `config:mcp-server:${sanitizeName(mcpSource.sourceId)}:${sanitizeName(name)}`,
			source: mcpSource.sourcePath,
			target: `mcp.servers.${name}`,
			path: ["mcp", "servers"],
			value: patch,
			message: `Import Claude MCP server "${name}" from ${mcpSource.sourceLabel}.`,
			conflict,
			reason: duplicate ? `multiple Claude MCP sources define "${name}"` : MIGRATION_REASON_TARGET_EXISTS,
			details: { sourceLabel: mcpSource.sourceLabel }
		}));
	}
	for (const settingsPath of [
		params.source.userSettingsPath,
		params.source.userLocalSettingsPath,
		params.source.projectSettingsPath,
		params.source.projectLocalSettingsPath
	]) {
		const settings = await readJsonObject(settingsPath);
		if (settingsPath && settings.hooks !== void 0) items.push(createManualItem({
			id: `manual:hooks:${sanitizeName(settingsPath)}`,
			source: settingsPath,
			message: "Claude hooks were found but are not enabled automatically.",
			recommendation: "Review hook commands before recreating equivalent OpenClaw automation."
		}));
		if (settingsPath && settings.permissions !== void 0) items.push(createManualItem({
			id: `manual:permissions:${sanitizeName(settingsPath)}`,
			source: settingsPath,
			message: "Claude permission settings were found but are not translated automatically.",
			recommendation: "Review deny and allow rules manually. Do not import broad allow rules without a policy review."
		}));
		if (settingsPath && settings.env !== void 0) items.push(createManualItem({
			id: `manual:env:${sanitizeName(settingsPath)}`,
			source: settingsPath,
			message: "Claude environment defaults were found but are not copied automatically.",
			recommendation: "Move non-secret values manually and store credentials through OpenClaw credential flows."
		}));
	}
	return items;
}
function readConfigPatchDetails(item) {
	const path = item.details?.path;
	if (!Array.isArray(path) || !path.every((segment) => typeof segment === "string")) return;
	return {
		path,
		value: item.details?.value
	};
}
async function applyConfigItem(ctx, item) {
	if (item.status !== "planned") return item;
	const details = readConfigPatchDetails(item);
	if (!details) return markMigrationItemError(item, MISSING_CONFIG_PATCH);
	const configApi = ctx.runtime?.config;
	if (!configApi?.current || !configApi.mutateConfigFile) return markMigrationItemError(item, CONFIG_RUNTIME_UNAVAILABLE);
	try {
		const currentConfig = configApi.current();
		if (!ctx.overwrite && hasPatchConflict(currentConfig, details.path, details.value)) return markMigrationItemConflict(item, MIGRATION_REASON_TARGET_EXISTS);
		await configApi.mutateConfigFile({
			base: "runtime",
			afterWrite: { mode: "auto" },
			mutate(draft) {
				if (!ctx.overwrite && hasPatchConflict(draft, details.path, details.value)) throw new ConfigPatchConflictError(MIGRATION_REASON_TARGET_EXISTS);
				writePath(draft, details.path, details.value);
			}
		});
		return {
			...item,
			status: "migrated"
		};
	} catch (err) {
		if (err instanceof ConfigPatchConflictError) return markMigrationItemConflict(item, err.reason);
		return markMigrationItemError(item, err instanceof Error ? err.message : String(err));
	}
}
function applyManualItem(item) {
	return markMigrationItemSkipped(item, item.reason ?? "manual follow-up required");
}
//#endregion
export { applyManualItem as n, buildConfigItems as r, applyConfigItem as t };
