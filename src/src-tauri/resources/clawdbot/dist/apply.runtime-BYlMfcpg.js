import "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import "./theme-CdOoMzRk.js";
import { a as logVerbose, l as shouldLogVerbose } from "./globals-DBUMOBZ8.js";
import "./subsystem-DISldKSB.js";
import "./ansi-BEJF8NKS.js";
import "./utils-CS0Ikux6.js";
import "./agent-scope-bjWqU22i.js";
import "./boundary-path-Dm0QJ7-y.js";
import "./boundary-file-read-DcZxlWD8.js";
import "./logger-BmpSCz93.js";
import { r as runExec } from "./exec-B5_AYfQG.js";
import "./workspace-D4K6QX9X.js";
import "./model-selection-BnFtDmP7.js";
import "./ip-Ce8EDTBZ.js";
import { s as isBlockedHostnameOrIp } from "./ssrf-0bPJMoZR.js";
import { E as finalizeInboundContext, c as resolveTimeoutMs, h as CLI_OUTPUT_MAX_BUFFER, l as normalizeMediaUnderstandingChatType, t as applyTemplate, u as resolveMediaUnderstandingScope } from "./templating-BDXRiJUh.js";
//#region src/link-understanding/format.ts
function formatLinkUnderstandingBody(params) {
	const outputs = params.outputs.map((output) => output.trim()).filter(Boolean);
	if (outputs.length === 0) return params.body ?? "";
	const base = (params.body ?? "").trim();
	if (!base) return outputs.join("\n");
	return `${base}\n\n${outputs.join("\n")}`;
}
//#endregion
//#region src/link-understanding/detect.ts
const MARKDOWN_LINK_RE = /\[[^\]]*]\((https?:\/\/\S+?)\)/gi;
const BARE_LINK_RE = /https?:\/\/\S+/gi;
function stripMarkdownLinks(message) {
	return message.replace(MARKDOWN_LINK_RE, " ");
}
function resolveMaxLinks(value) {
	if (typeof value === "number" && Number.isFinite(value) && value > 0) return Math.floor(value);
	return 3;
}
function isAllowedUrl(raw) {
	try {
		const parsed = new URL(raw);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
		if (isBlockedHostnameOrIp(parsed.hostname)) return false;
		return true;
	} catch {
		return false;
	}
}
function extractLinksFromMessage(message, opts) {
	const source = message?.trim();
	if (!source) return [];
	const maxLinks = resolveMaxLinks(opts?.maxLinks);
	const sanitized = stripMarkdownLinks(source);
	const seen = /* @__PURE__ */ new Set();
	const results = [];
	for (const match of sanitized.matchAll(BARE_LINK_RE)) {
		const raw = match[0]?.trim();
		if (!raw) continue;
		if (!isAllowedUrl(raw)) continue;
		if (seen.has(raw)) continue;
		seen.add(raw);
		results.push(raw);
		if (results.length >= maxLinks) break;
	}
	return results;
}
//#endregion
//#region src/link-understanding/runner.ts
function resolveScopeDecision(params) {
	return resolveMediaUnderstandingScope({
		scope: params.config?.scope,
		sessionKey: params.ctx.SessionKey,
		channel: params.ctx.Surface ?? params.ctx.Provider,
		chatType: normalizeMediaUnderstandingChatType(params.ctx.ChatType)
	});
}
function resolveTimeoutMsFromConfig(params) {
	return resolveTimeoutMs(params.entry.timeoutSeconds ?? params.config?.timeoutSeconds, 30);
}
async function runCliEntry(params) {
	if ((params.entry.type ?? "cli") !== "cli") return null;
	const command = params.entry.command.trim();
	if (!command) return null;
	const args = params.entry.args ?? [];
	const timeoutMs = resolveTimeoutMsFromConfig({
		config: params.config,
		entry: params.entry
	});
	const templCtx = {
		...params.ctx,
		LinkUrl: params.url
	};
	const argv = [command, ...args].map((part, index) => index === 0 ? part : applyTemplate(part, templCtx));
	if (shouldLogVerbose()) logVerbose(`Link understanding via CLI: ${argv.join(" ")}`);
	const { stdout } = await runExec(argv[0], argv.slice(1), {
		timeoutMs,
		maxBuffer: CLI_OUTPUT_MAX_BUFFER
	});
	return stdout.trim() || null;
}
async function runLinkEntries(params) {
	let lastError;
	for (const entry of params.entries) try {
		const output = await runCliEntry({
			entry,
			ctx: params.ctx,
			url: params.url,
			config: params.config
		});
		if (output) return output;
	} catch (err) {
		lastError = err;
		if (shouldLogVerbose()) logVerbose(`Link understanding failed for ${params.url}: ${String(err)}`);
	}
	if (lastError && shouldLogVerbose()) logVerbose(`Link understanding exhausted for ${params.url}`);
	return null;
}
async function runLinkUnderstanding(params) {
	const config = params.cfg.tools?.links;
	if (!config || config.enabled === false) return {
		urls: [],
		outputs: []
	};
	if (resolveScopeDecision({
		config,
		ctx: params.ctx
	}) === "deny") {
		if (shouldLogVerbose()) logVerbose("Link understanding disabled by scope policy.");
		return {
			urls: [],
			outputs: []
		};
	}
	const links = extractLinksFromMessage(params.message ?? params.ctx.CommandBody ?? params.ctx.RawBody ?? params.ctx.Body ?? "", { maxLinks: config?.maxLinks });
	if (links.length === 0) return {
		urls: [],
		outputs: []
	};
	const entries = config?.models ?? [];
	if (entries.length === 0) return {
		urls: links,
		outputs: []
	};
	const outputs = [];
	for (const url of links) {
		const output = await runLinkEntries({
			entries,
			ctx: params.ctx,
			url,
			config
		});
		if (output) outputs.push(output);
	}
	return {
		urls: links,
		outputs
	};
}
//#endregion
//#region src/link-understanding/apply.ts
async function applyLinkUnderstanding(params) {
	const result = await runLinkUnderstanding({
		cfg: params.cfg,
		ctx: params.ctx
	});
	if (result.outputs.length === 0) return result;
	params.ctx.LinkUnderstanding = [...params.ctx.LinkUnderstanding ?? [], ...result.outputs];
	params.ctx.Body = formatLinkUnderstandingBody({
		body: params.ctx.Body,
		outputs: result.outputs
	});
	finalizeInboundContext(params.ctx, {
		forceBodyForAgent: true,
		forceBodyForCommands: true
	});
	return result;
}
//#endregion
export { applyLinkUnderstanding };
