import { r as theme } from "./theme-CdOoMzRk.js";
import { t as formatDocsLink } from "./links-8xRhWBQL.js";
import { t as formatHelpExamples } from "./help-format-C_5MeE_w.js";
//#region src/cli/memory-cli.ts
let memoryCliRuntimePromise = null;
async function loadMemoryCliRuntime() {
	memoryCliRuntimePromise ??= import("./memory-cli.runtime-D9Nj83Vn.js");
	return await memoryCliRuntimePromise;
}
async function runMemoryStatus(opts) {
	await (await loadMemoryCliRuntime()).runMemoryStatus(opts);
}
async function runMemoryIndex(opts) {
	await (await loadMemoryCliRuntime()).runMemoryIndex(opts);
}
async function runMemorySearch(queryArg, opts) {
	await (await loadMemoryCliRuntime()).runMemorySearch(queryArg, opts);
}
function registerMemoryCli(program) {
	const memory = program.command("memory").description("Search, inspect, and reindex memory files").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw memory status", "Show index and provider status."],
		["openclaw memory status --deep", "Probe embedding provider readiness."],
		["openclaw memory index --force", "Force a full reindex."],
		["openclaw memory search \"meeting notes\"", "Quick search using positional query."],
		["openclaw memory search --query \"deployment\" --max-results 20", "Limit results for focused troubleshooting."],
		["openclaw memory status --json", "Output machine-readable JSON (good for scripts)."]
	])}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/memory", "docs.openclaw.ai/cli/memory")}\n`);
	memory.command("status").description("Show memory search index status").option("--agent <id>", "Agent id (default: default agent)").option("--json", "Print JSON").option("--deep", "Probe embedding provider availability").option("--index", "Reindex if dirty (implies --deep)").option("--verbose", "Verbose logging", false).action(async (opts) => {
		await runMemoryStatus(opts);
	});
	memory.command("index").description("Reindex memory files").option("--agent <id>", "Agent id (default: default agent)").option("--force", "Force full reindex", false).option("--verbose", "Verbose logging", false).action(async (opts) => {
		await runMemoryIndex(opts);
	});
	memory.command("search").description("Search memory files").argument("[query]", "Search query").option("--query <text>", "Search query (alternative to positional argument)").option("--agent <id>", "Agent id (default: default agent)").option("--max-results <n>", "Max results", (value) => Number(value)).option("--min-score <n>", "Minimum score", (value) => Number(value)).option("--json", "Print JSON").action(async (queryArg, opts) => {
		await runMemorySearch(queryArg, opts);
	});
}
//#endregion
export { runMemoryStatus as n, registerMemoryCli as t };
