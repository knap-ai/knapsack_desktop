import "./redact-BDinS1q9.js";
import "./errors-BxyFnvP3.js";
import "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import { n as isRich, r as theme } from "./theme-CdOoMzRk.js";
import "./globals-DBUMOBZ8.js";
import { m as defaultRuntime } from "./subsystem-DISldKSB.js";
import "./ansi-BEJF8NKS.js";
import "./boolean-C3GkJetE.js";
import "./env-Dnra1IpT.js";
import "./utils-CS0Ikux6.js";
import { t as formatDocsLink } from "./links-8xRhWBQL.js";
import "./agent-scope-bjWqU22i.js";
import "./boundary-path-Dm0QJ7-y.js";
import "./boundary-file-read-DcZxlWD8.js";
import "./logger-BmpSCz93.js";
import { n as runCommandWithTimeout } from "./exec-B5_AYfQG.js";
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
import { t as formatCliCommand } from "./command-format-DBQUhADm.js";
import "./path-alias-guards-CwRM04O1.js";
import "./sandbox-paths-Cn8i8Jxm.js";
import { f as hasBinary } from "./frontmatter-CP5371Rm.js";
import "./env-overrides-BNSo89u5.js";
import "./skills-M0AZJeXx.js";
import { n as runCommandWithRuntime } from "./cli-utils-C5ijQCJ_.js";
//#region src/commands/docs.ts
const SEARCH_TOOL = "https://docs.openclaw.ai/mcp.SearchOpenClaw";
const SEARCH_TIMEOUT_MS = 3e4;
const DEFAULT_SNIPPET_MAX = 220;
function resolveNodeRunner() {
	if (hasBinary("pnpm")) return {
		cmd: "pnpm",
		args: ["dlx"]
	};
	if (hasBinary("npx")) return {
		cmd: "npx",
		args: ["-y"]
	};
	throw new Error("Missing pnpm or npx; install a Node package runner.");
}
async function runNodeTool(tool, toolArgs, options = {}) {
	const runner = resolveNodeRunner();
	return await runCommandWithTimeout([
		runner.cmd,
		...runner.args,
		tool,
		...toolArgs
	], {
		timeoutMs: options.timeoutMs ?? SEARCH_TIMEOUT_MS,
		input: options.input
	});
}
async function runTool(tool, toolArgs, options = {}) {
	if (hasBinary(tool)) return await runCommandWithTimeout([tool, ...toolArgs], {
		timeoutMs: options.timeoutMs ?? SEARCH_TIMEOUT_MS,
		input: options.input
	});
	return await runNodeTool(tool, toolArgs, options);
}
function extractLine(lines, prefix) {
	const line = lines.find((value) => value.startsWith(prefix));
	if (!line) return;
	return line.slice(prefix.length).trim();
}
function normalizeSnippet(raw, fallback) {
	const cleaned = (raw && raw.trim().length > 0 ? raw : fallback).replace(/\s+/g, " ").trim();
	if (!cleaned) return "";
	if (cleaned.length <= DEFAULT_SNIPPET_MAX) return cleaned;
	return `${cleaned.slice(0, DEFAULT_SNIPPET_MAX - 3)}...`;
}
function firstParagraph(text) {
	return text.split(/\n\s*\n/).map((chunk) => chunk.trim()).filter(Boolean)[0] ?? "";
}
function parseSearchOutput(raw) {
	const blocks = raw.replace(/\r/g, "").split(/\n(?=Title: )/g).map((chunk) => chunk.trim()).filter(Boolean);
	const results = [];
	for (const block of blocks) {
		const lines = block.split("\n");
		const title = extractLine(lines, "Title:");
		const link = extractLine(lines, "Link:");
		if (!title || !link) continue;
		const content = extractLine(lines, "Content:");
		const contentIndex = lines.findIndex((line) => line.startsWith("Content:"));
		const snippet = normalizeSnippet(content, firstParagraph(contentIndex >= 0 ? lines.slice(contentIndex + 1).join("\n").trim() : ""));
		results.push({
			title,
			link,
			snippet: snippet || void 0
		});
	}
	return results;
}
function escapeMarkdown(text) {
	return text.replace(/[()[\]]/g, "\\$&");
}
function buildMarkdown(query, results) {
	const lines = [`# Docs search: ${escapeMarkdown(query)}`, ""];
	if (results.length === 0) {
		lines.push("_No results._");
		return lines.join("\n");
	}
	for (const item of results) {
		const title = escapeMarkdown(item.title);
		const snippet = item.snippet ? escapeMarkdown(item.snippet) : "";
		const suffix = snippet ? ` - ${snippet}` : "";
		lines.push(`- [${title}](${item.link})${suffix}`);
	}
	return lines.join("\n");
}
function formatLinkLabel(link) {
	return link.replace(/^https?:\/\//i, "");
}
function renderRichResults(query, results, runtime) {
	runtime.log(`${theme.heading("Docs search:")} ${theme.info(query)}`);
	if (results.length === 0) {
		runtime.log(theme.muted("No results."));
		return;
	}
	for (const item of results) {
		const linkLabel = formatLinkLabel(item.link);
		const link = formatDocsLink(item.link, linkLabel);
		runtime.log(`${theme.muted("-")} ${theme.command(item.title)} ${theme.muted("(")}${link}${theme.muted(")")}`);
		if (item.snippet) runtime.log(`  ${theme.muted(item.snippet)}`);
	}
}
async function renderMarkdown(markdown, runtime) {
	runtime.log(markdown.trimEnd());
}
async function docsSearchCommand(queryParts, runtime) {
	const query = queryParts.join(" ").trim();
	if (!query) {
		const docs = formatDocsLink("/", "docs.openclaw.ai");
		if (isRich()) {
			runtime.log(`${theme.muted("Docs:")} ${docs}`);
			runtime.log(`${theme.muted("Search:")} ${formatCliCommand("openclaw docs \"your query\"")}`);
		} else {
			runtime.log("Docs: https://docs.openclaw.ai/");
			runtime.log(`Search: ${formatCliCommand("openclaw docs \"your query\"")}`);
		}
		return;
	}
	const res = await runTool("mcporter", [
		"call",
		SEARCH_TOOL,
		"--args",
		JSON.stringify({ query }),
		"--output",
		"text"
	], { timeoutMs: SEARCH_TIMEOUT_MS });
	if (res.code !== 0) {
		const err = res.stderr.trim() || res.stdout.trim() || `exit ${res.code}`;
		runtime.error(`Docs search failed: ${err}`);
		runtime.exit(1);
		return;
	}
	const results = parseSearchOutput(res.stdout);
	if (isRich()) {
		renderRichResults(query, results, runtime);
		return;
	}
	await renderMarkdown(buildMarkdown(query, results), runtime);
}
//#endregion
//#region src/cli/docs-cli.ts
function registerDocsCli(program) {
	program.command("docs").description("Search the live OpenClaw docs").argument("[query...]", "Search query").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/docs", "docs.openclaw.ai/cli/docs")}\n`).action(async (queryParts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await docsSearchCommand(queryParts, defaultRuntime);
		});
	});
}
//#endregion
export { registerDocsCli };
