import { i as formatErrorMessage } from "../errors-D8p6rxH8.js";
import { c as routeLogsToStderr } from "../subsystem-Cgmckbux.js";
import { n as VERSION } from "../version-Bk5OW-rN.js";
import { a as loadConfig } from "../io-5pxHCi7V.js";
import "../config-Q9XZc_2I.js";
import { d as resolvePluginTools } from "../channel-tools-DdZyHuyK.js";
import { a as wrapToolWithBeforeToolCallHook, r as isToolWrappedWithBeforeToolCallHook } from "../pi-tools.before-tool-call-C0me_HAs.js";
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
//#region src/mcp/plugin-tools-serve.ts
/**
* Standalone MCP server that exposes OpenClaw plugin-registered tools
* (e.g. memory-lancedb's memory_recall, memory_store, memory_forget)
* so ACP sessions running Claude Code can use them.
*
* Run via: node --import tsx src/mcp/plugin-tools-serve.ts
* Or: bun src/mcp/plugin-tools-serve.ts
*/
function resolveJsonSchemaForTool(tool) {
	const params = tool.parameters;
	if (params && typeof params === "object" && "type" in params) return params;
	return {
		type: "object",
		properties: {}
	};
}
function resolveTools(config) {
	return resolvePluginTools({
		context: { config },
		suppressNameConflicts: true
	});
}
function createPluginToolsMcpServer(params = {}) {
	const cfg = params.config ?? loadConfig();
	const tools = (params.tools ?? resolveTools(cfg)).map((tool) => {
		if (isToolWrappedWithBeforeToolCallHook(tool)) return tool;
		return wrapToolWithBeforeToolCallHook(tool);
	});
	const toolMap = /* @__PURE__ */ new Map();
	for (const tool of tools) toolMap.set(tool.name, tool);
	const server = new Server({
		name: "openclaw-plugin-tools",
		version: VERSION
	}, { capabilities: { tools: {} } });
	server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: tools.map((tool) => ({
		name: tool.name,
		description: tool.description ?? "",
		inputSchema: resolveJsonSchemaForTool(tool)
	})) }));
	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const tool = toolMap.get(request.params.name);
		if (!tool) return {
			content: [{
				type: "text",
				text: `Unknown tool: ${request.params.name}`
			}],
			isError: true
		};
		try {
			const result = await tool.execute(`mcp-${Date.now()}`, request.params.arguments ?? {});
			return { content: Array.isArray(result.content) ? result.content : [{
				type: "text",
				text: String(result.content)
			}] };
		} catch (err) {
			return {
				content: [{
					type: "text",
					text: `Tool error: ${formatErrorMessage(err)}`
				}],
				isError: true
			};
		}
	});
	return server;
}
async function servePluginToolsMcp() {
	routeLogsToStderr();
	const config = loadConfig();
	const tools = resolveTools(config);
	const server = createPluginToolsMcpServer({
		config,
		tools
	});
	if (tools.length === 0) process.stderr.write("plugin-tools-serve: no plugin tools found\n");
	const transport = new StdioServerTransport();
	let shuttingDown = false;
	const shutdown = () => {
		if (shuttingDown) return;
		shuttingDown = true;
		process.stdin.off("end", shutdown);
		process.stdin.off("close", shutdown);
		process.off("SIGINT", shutdown);
		process.off("SIGTERM", shutdown);
		server.close();
	};
	process.stdin.once("end", shutdown);
	process.stdin.once("close", shutdown);
	process.once("SIGINT", shutdown);
	process.once("SIGTERM", shutdown);
	await server.connect(transport);
}
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) servePluginToolsMcp().catch((err) => {
	process.stderr.write(`plugin-tools-serve: ${formatErrorMessage(err)}\n`);
	process.exit(1);
});
//#endregion
export { createPluginToolsMcpServer, servePluginToolsMcp };
