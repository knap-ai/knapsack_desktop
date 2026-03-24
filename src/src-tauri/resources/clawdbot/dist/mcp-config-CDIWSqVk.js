import { d as readConfigFileSnapshot, g as writeConfigFile, x as validateConfigObjectWithPlugins } from "./io-y3Az_Onx.js";
//#region src/config/mcp-config.ts
function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function normalizeConfiguredMcpServers(value) {
	if (!isRecord(value)) return {};
	return Object.fromEntries(Object.entries(value).filter(([, server]) => isRecord(server)).map(([name, server]) => [name, { ...server }]));
}
async function listConfiguredMcpServers() {
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid) return {
		ok: false,
		path: snapshot.path,
		error: "Config file is invalid; fix it before using MCP config commands."
	};
	return {
		ok: true,
		path: snapshot.path,
		config: structuredClone(snapshot.resolved),
		mcpServers: normalizeConfiguredMcpServers(snapshot.resolved.mcp?.servers)
	};
}
async function setConfiguredMcpServer(params) {
	const name = params.name.trim();
	if (!name) return {
		ok: false,
		path: "",
		error: "MCP server name is required."
	};
	if (!isRecord(params.server)) return {
		ok: false,
		path: "",
		error: "MCP server config must be a JSON object."
	};
	const loaded = await listConfiguredMcpServers();
	if (!loaded.ok) return loaded;
	const next = structuredClone(loaded.config);
	const servers = normalizeConfiguredMcpServers(next.mcp?.servers);
	servers[name] = { ...params.server };
	next.mcp = {
		...next.mcp,
		servers
	};
	const validated = validateConfigObjectWithPlugins(next);
	if (!validated.ok) {
		const issue = validated.issues[0];
		return {
			ok: false,
			path: loaded.path,
			error: `Config invalid after MCP set (${issue.path}: ${issue.message}).`
		};
	}
	await writeConfigFile(validated.config);
	return {
		ok: true,
		path: loaded.path,
		config: validated.config,
		mcpServers: servers
	};
}
async function unsetConfiguredMcpServer(params) {
	const name = params.name.trim();
	if (!name) return {
		ok: false,
		path: "",
		error: "MCP server name is required."
	};
	const loaded = await listConfiguredMcpServers();
	if (!loaded.ok) return loaded;
	if (!Object.hasOwn(loaded.mcpServers, name)) return {
		ok: true,
		path: loaded.path,
		config: loaded.config,
		mcpServers: loaded.mcpServers,
		removed: false
	};
	const next = structuredClone(loaded.config);
	const servers = normalizeConfiguredMcpServers(next.mcp?.servers);
	delete servers[name];
	if (Object.keys(servers).length > 0) next.mcp = {
		...next.mcp,
		servers
	};
	else if (next.mcp) {
		delete next.mcp.servers;
		if (Object.keys(next.mcp).length === 0) delete next.mcp;
	}
	const validated = validateConfigObjectWithPlugins(next);
	if (!validated.ok) {
		const issue = validated.issues[0];
		return {
			ok: false,
			path: loaded.path,
			error: `Config invalid after MCP unset (${issue.path}: ${issue.message}).`
		};
	}
	await writeConfigFile(validated.config);
	return {
		ok: true,
		path: loaded.path,
		config: validated.config,
		mcpServers: servers,
		removed: true
	};
}
//#endregion
export { unsetConfiguredMcpServer as i, normalizeConfiguredMcpServers as n, setConfiguredMcpServer as r, listConfiguredMcpServers as t };
