import { g as resolveDefaultModelForAgent } from "./model-selection-8a6zD_aX.js";
import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { v as resolveSessionAgentId, y as resolveSessionAgentIds } from "./agent-scope-CYXg_wTS.js";
import { i as loadSessionStore } from "./store-BGmy-Wot.js";
import { i as resolveSessionFilePathOptions, n as resolveDefaultSessionStorePath, r as resolveSessionFilePath } from "./paths-DBIQqSpZ.js";
import { a as resolveFreshSessionTotalTokens } from "./types-KyI2zD1Y.js";
import { $ as buildCommandsMessagePaginated, Q as buildCommandsMessage, Z as buildStatusReply, a as buildSystemPromptReport, c as analyzeBootstrapBudget, et as buildHelpMessage, o as buildSystemPromptParams, qr as resolveBootstrapContextForRun, tt as buildToolsMessage, v as buildToolSummaryMap, w as createOpenClawCodingTools, y as buildAgentSystemPrompt } from "./pi-embedded-BYdcxQ5A.js";
import { n as buildTtsSystemPromptHint } from "./speech-runtime-DncpdrLW.js";
import "./tts-DmlPQvyr.js";
import { Y as resolveBootstrapMaxChars, Z as resolveBootstrapTotalMaxChars } from "./pi-embedded-helpers-CGU2Pfj9.js";
import { n as resolveSandboxRuntimeStatus } from "./runtime-status-CbUPNPyH.js";
import "./sandbox-DD2udaMP.js";
import { s as resolveReplyToMode } from "./reply-payloads-esYr_ziX.js";
import { r as buildWorkspaceSkillSnapshot } from "./skills-C4NiYd5P.js";
import { n as estimateTokensFromChars } from "./cjk-chars-Dh3V4Dam.js";
import { t as extractExplicitGroupId } from "./group-id-gPGl6fAY.js";
import { _ as getSkillsSnapshotVersion, t as getRemoteSkillEligibility } from "./skills-remote-fYLkhhDd.js";
import { t as listSkillCommandsForAgents } from "./skill-commands-nVTmVENA.js";
import { t as resolveEffectiveToolInventory } from "./tools-effective-inventory-DYRa6us3.js";
import { n as buildThreadingToolContext } from "./agent-runner-utils-B-C2CPDc.js";
import { fileURLToPath } from "node:url";
import fsSync from "node:fs";
import path from "node:path";
import { SessionManager } from "@mariozechner/pi-coding-agent";
//#region src/auto-reply/reply/commands-system-prompt.ts
async function resolveCommandsSystemPromptBundle(params) {
	const workspaceDir = params.workspaceDir;
	const { bootstrapFiles, contextFiles: injectedFiles } = await resolveBootstrapContextForRun({
		workspaceDir,
		config: params.cfg,
		sessionKey: params.sessionKey,
		sessionId: params.sessionEntry?.sessionId
	});
	const skillsPrompt = (() => {
		try {
			return buildWorkspaceSkillSnapshot(workspaceDir, {
				config: params.cfg,
				eligibility: { remote: getRemoteSkillEligibility() },
				snapshotVersion: getSkillsSnapshotVersion(workspaceDir)
			});
		} catch {
			return {
				prompt: "",
				skills: [],
				resolvedSkills: []
			};
		}
	})().prompt ?? "";
	const sandboxRuntime = resolveSandboxRuntimeStatus({
		cfg: params.cfg,
		sessionKey: params.ctx.SessionKey ?? params.sessionKey
	});
	const tools = (() => {
		try {
			return createOpenClawCodingTools({
				config: params.cfg,
				agentId: params.agentId,
				workspaceDir,
				sessionKey: params.sessionKey,
				allowGatewaySubagentBinding: true,
				messageProvider: params.command.channel,
				groupId: params.sessionEntry?.groupId ?? void 0,
				groupChannel: params.sessionEntry?.groupChannel ?? void 0,
				groupSpace: params.sessionEntry?.space ?? void 0,
				spawnedBy: params.sessionEntry?.spawnedBy ?? void 0,
				senderIsOwner: params.command.senderIsOwner,
				modelProvider: params.provider,
				modelId: params.model
			});
		} catch {
			return [];
		}
	})();
	const toolSummaries = buildToolSummaryMap(tools);
	const toolNames = tools.map((t) => t.name);
	const { sessionAgentId } = resolveSessionAgentIds({
		sessionKey: params.sessionKey,
		config: params.cfg,
		agentId: params.agentId
	});
	const defaultModelRef = resolveDefaultModelForAgent({
		cfg: params.cfg,
		agentId: sessionAgentId
	});
	const defaultModelLabel = `${defaultModelRef.provider}/${defaultModelRef.model}`;
	const { runtimeInfo, userTimezone, userTime, userTimeFormat } = buildSystemPromptParams({
		config: params.cfg,
		agentId: sessionAgentId,
		workspaceDir,
		cwd: process.cwd(),
		runtime: {
			host: "unknown",
			os: "unknown",
			arch: "unknown",
			node: process.version,
			model: `${params.provider}/${params.model}`,
			defaultModel: defaultModelLabel
		}
	});
	const sandboxInfo = sandboxRuntime.sandboxed ? {
		enabled: true,
		workspaceDir,
		workspaceAccess: "rw",
		elevated: {
			allowed: params.elevated.allowed,
			defaultLevel: params.resolvedElevatedLevel ?? "off"
		}
	} : { enabled: false };
	const ttsHint = params.cfg ? buildTtsSystemPromptHint(params.cfg) : void 0;
	return {
		systemPrompt: buildAgentSystemPrompt({
			workspaceDir,
			defaultThinkLevel: params.resolvedThinkLevel,
			reasoningLevel: params.resolvedReasoningLevel,
			extraSystemPrompt: void 0,
			ownerNumbers: void 0,
			reasoningTagHint: false,
			toolNames,
			toolSummaries,
			modelAliasLines: [],
			userTimezone,
			userTime,
			userTimeFormat,
			contextFiles: injectedFiles,
			skillsPrompt,
			heartbeatPrompt: void 0,
			ttsHint,
			acpEnabled: params.cfg?.acp?.enabled !== false,
			runtimeInfo,
			sandboxInfo,
			memoryCitationsMode: params.cfg?.memory?.citations
		}),
		tools,
		skillsPrompt,
		bootstrapFiles,
		injectedFiles,
		sandboxRuntime
	};
}
//#endregion
//#region src/auto-reply/reply/commands-context-report.ts
function formatInt(n) {
	return new Intl.NumberFormat("en-US").format(n);
}
function formatCharsAndTokens(chars) {
	return `${formatInt(chars)} chars (~${formatInt(estimateTokensFromChars(chars))} tok)`;
}
function parseContextArgs(commandBodyNormalized) {
	if (commandBodyNormalized === "/context") return "";
	if (commandBodyNormalized.startsWith("/context ")) return commandBodyNormalized.slice(8).trim();
	return "";
}
function formatListTop(entries, cap) {
	const sorted = [...entries].toSorted((a, b) => b.value - a.value);
	const top = sorted.slice(0, cap);
	const omitted = Math.max(0, sorted.length - top.length);
	return {
		lines: top.map((e) => `- ${e.name}: ${formatCharsAndTokens(e.value)}`),
		omitted
	};
}
async function resolveContextReport(params) {
	const existing = params.sessionEntry?.systemPromptReport;
	if (existing && existing.source === "run") return existing;
	const bootstrapMaxChars = resolveBootstrapMaxChars(params.cfg);
	const bootstrapTotalMaxChars = resolveBootstrapTotalMaxChars(params.cfg);
	const { systemPrompt, tools, skillsPrompt, bootstrapFiles, injectedFiles, sandboxRuntime } = await resolveCommandsSystemPromptBundle(params);
	return buildSystemPromptReport({
		source: "estimate",
		generatedAt: Date.now(),
		sessionId: params.sessionEntry?.sessionId,
		sessionKey: params.sessionKey,
		provider: params.provider,
		model: params.model,
		workspaceDir: params.workspaceDir,
		bootstrapMaxChars,
		bootstrapTotalMaxChars,
		sandbox: {
			mode: sandboxRuntime.mode,
			sandboxed: sandboxRuntime.sandboxed
		},
		systemPrompt,
		bootstrapFiles,
		injectedFiles,
		skillsPrompt,
		tools
	});
}
async function buildContextReply(params) {
	const sub = parseContextArgs(params.command.commandBodyNormalized).split(/\s+/).filter(Boolean)[0]?.toLowerCase() ?? "";
	if (!sub || sub === "help") return { text: [
		"🧠 /context",
		"",
		"What counts as context (high-level), plus a breakdown mode.",
		"",
		"Try:",
		"- /context list   (short breakdown)",
		"- /context detail (per-file + per-tool + per-skill + system prompt size)",
		"- /context json   (same, machine-readable)",
		"",
		"Inline shortcut = a command token inside a normal message (e.g. “hey /status”). It runs immediately (allowlisted senders only) and is stripped before the model sees the remaining text."
	].join("\n") };
	const report = await resolveContextReport(params);
	const cachedContextUsageTokens = resolveFreshSessionTotalTokens(params.sessionEntry);
	const session = {
		totalTokens: params.sessionEntry?.totalTokens ?? null,
		totalTokensFresh: params.sessionEntry?.totalTokensFresh ?? null,
		inputTokens: params.sessionEntry?.inputTokens ?? null,
		outputTokens: params.sessionEntry?.outputTokens ?? null,
		contextTokens: params.contextTokens ?? null
	};
	if (sub === "json") return { text: JSON.stringify({
		report,
		session
	}, null, 2) };
	if (sub !== "list" && sub !== "show" && sub !== "detail" && sub !== "deep") return { text: ["Unknown /context mode.", "Use: /context, /context list, /context detail, or /context json"].join("\n") };
	const fileLines = report.injectedWorkspaceFiles.map((f) => {
		const status = f.missing ? "MISSING" : f.truncated ? "TRUNCATED" : "OK";
		const raw = f.missing ? "0" : formatCharsAndTokens(f.rawChars);
		const injected = f.missing ? "0" : formatCharsAndTokens(f.injectedChars);
		return `- ${f.name}: ${status} | raw ${raw} | injected ${injected}`;
	});
	const sandboxLine = `Sandbox: mode=${report.sandbox?.mode ?? "unknown"} sandboxed=${report.sandbox?.sandboxed ?? false}`;
	const toolSchemaLine = `Tool schemas (JSON): ${formatCharsAndTokens(report.tools.schemaChars)} (counts toward context; not shown as text)`;
	const toolListLine = `Tool list (system prompt text): ${formatCharsAndTokens(report.tools.listChars)}`;
	const skillNameSet = new Set(report.skills.entries.map((s) => s.name));
	const skillNames = Array.from(skillNameSet);
	const toolNames = report.tools.entries.map((t) => t.name);
	const formatNameList = (names, cap) => names.length <= cap ? names.join(", ") : `${names.slice(0, cap).join(", ")}, … (+${names.length - cap} more)`;
	const skillsLine = `Skills list (system prompt text): ${formatCharsAndTokens(report.skills.promptChars)} (${skillNameSet.size} skills)`;
	const skillsNamesLine = skillNameSet.size ? `Skills: ${formatNameList(skillNames, 20)}` : "Skills: (none)";
	const toolsNamesLine = toolNames.length ? `Tools: ${formatNameList(toolNames, 30)}` : "Tools: (none)";
	const systemPromptLine = `System prompt (${report.source}): ${formatCharsAndTokens(report.systemPrompt.chars)} (Project Context ${formatCharsAndTokens(report.systemPrompt.projectContextChars)})`;
	const workspaceLabel = report.workspaceDir ?? params.workspaceDir;
	const bootstrapMaxChars = typeof report.bootstrapMaxChars === "number" && Number.isFinite(report.bootstrapMaxChars) && report.bootstrapMaxChars > 0 ? report.bootstrapMaxChars : resolveBootstrapMaxChars(params.cfg);
	const bootstrapTotalMaxChars = typeof report.bootstrapTotalMaxChars === "number" && Number.isFinite(report.bootstrapTotalMaxChars) && report.bootstrapTotalMaxChars > 0 ? report.bootstrapTotalMaxChars : resolveBootstrapTotalMaxChars(params.cfg);
	const bootstrapMaxLabel = `${formatInt(bootstrapMaxChars)} chars`;
	const bootstrapTotalLabel = `${formatInt(bootstrapTotalMaxChars)} chars`;
	const bootstrapAnalysis = analyzeBootstrapBudget({
		files: report.injectedWorkspaceFiles,
		bootstrapMaxChars,
		bootstrapTotalMaxChars
	});
	const truncatedBootstrapFiles = bootstrapAnalysis.truncatedFiles;
	const truncationCauseCounts = truncatedBootstrapFiles.reduce((acc, file) => {
		for (const cause of file.causes) if (cause === "per-file-limit") acc.perFile += 1;
		else if (cause === "total-limit") acc.total += 1;
		return acc;
	}, {
		perFile: 0,
		total: 0
	});
	const truncationCauseParts = [truncationCauseCounts.perFile > 0 ? `${truncationCauseCounts.perFile} file(s) exceeded max/file` : null, truncationCauseCounts.total > 0 ? `${truncationCauseCounts.total} file(s) hit max/total` : null].filter(Boolean);
	const bootstrapWarningLines = truncatedBootstrapFiles.length > 0 ? [
		`⚠ Bootstrap context is over configured limits: ${truncatedBootstrapFiles.length} file(s) truncated (${formatInt(bootstrapAnalysis.totals.rawChars)} raw chars -> ${formatInt(bootstrapAnalysis.totals.injectedChars)} injected chars).`,
		...truncationCauseParts.length ? [`Causes: ${truncationCauseParts.join("; ")}.`] : [],
		"Tip: increase `agents.defaults.bootstrapMaxChars` and/or `agents.defaults.bootstrapTotalMaxChars` if this truncation is not intentional."
	] : [];
	const contextWindowLabel = session.contextTokens != null ? formatInt(session.contextTokens) : "?";
	const totalsLine = cachedContextUsageTokens != null ? `Session tokens (cached): ${formatInt(cachedContextUsageTokens)} total / ctx=${contextWindowLabel}` : `Session tokens (cached): unknown / ctx=${contextWindowLabel}`;
	const sharedContextLines = [
		`Workspace: ${workspaceLabel}`,
		`Bootstrap max/file: ${bootstrapMaxLabel}`,
		`Bootstrap max/total: ${bootstrapTotalLabel}`,
		sandboxLine,
		systemPromptLine,
		...bootstrapWarningLines.length ? ["", ...bootstrapWarningLines] : [],
		"",
		"Injected workspace files:",
		...fileLines,
		"",
		skillsLine,
		skillsNamesLine
	];
	if (sub === "detail" || sub === "deep") {
		const perSkill = formatListTop(report.skills.entries.map((s) => ({
			name: s.name,
			value: s.blockChars
		})), 30);
		const perToolSchema = formatListTop(report.tools.entries.map((t) => ({
			name: t.name,
			value: t.schemaChars
		})), 30);
		const perToolSummary = formatListTop(report.tools.entries.map((t) => ({
			name: t.name,
			value: t.summaryChars
		})), 30);
		const toolPropsLines = report.tools.entries.filter((t) => t.propertiesCount != null).toSorted((a, b) => (b.propertiesCount ?? 0) - (a.propertiesCount ?? 0)).slice(0, 30).map((t) => `- ${t.name}: ${t.propertiesCount} params`);
		const trackedPromptChars = report.systemPrompt.chars + report.tools.schemaChars;
		const trackedPromptLine = `Tracked prompt estimate: ${formatCharsAndTokens(trackedPromptChars)}`;
		const actualContextLine = cachedContextUsageTokens != null ? `Actual context usage (cached): ${formatInt(cachedContextUsageTokens)} tok` : "Actual context usage (cached): unavailable";
		const overheadTokens = cachedContextUsageTokens != null ? cachedContextUsageTokens - estimateTokensFromChars(trackedPromptChars) : null;
		const overheadLine = overheadTokens == null ? null : overheadTokens > 0 ? `Untracked provider/runtime overhead: ~${formatInt(overheadTokens)} tok` : "Untracked provider/runtime overhead: not observed in cached usage";
		return { text: [
			"🧠 Context breakdown (detailed)",
			...sharedContextLines,
			...perSkill.lines.length ? ["Top skills (prompt entry size):", ...perSkill.lines] : [],
			...perSkill.omitted ? [`… (+${perSkill.omitted} more skills)`] : [],
			"",
			toolListLine,
			toolSchemaLine,
			toolsNamesLine,
			"Top tools (schema size):",
			...perToolSchema.lines,
			...perToolSchema.omitted ? [`… (+${perToolSchema.omitted} more tools)`] : [],
			"",
			"Top tools (summary text size):",
			...perToolSummary.lines,
			...perToolSummary.omitted ? [`… (+${perToolSummary.omitted} more tools)`] : [],
			...toolPropsLines.length ? [
				"",
				"Tools (param count):",
				...toolPropsLines
			] : [],
			"",
			trackedPromptLine,
			actualContextLine,
			...overheadLine ? [overheadLine] : [],
			"",
			totalsLine,
			"",
			"Inline shortcut: a command token inside normal text (e.g. “hey /status”) that runs immediately (allowlisted senders only) and is stripped before the model sees the remaining message."
		].filter(Boolean).join("\n") };
	}
	return { text: [
		"🧠 Context breakdown",
		...sharedContextLines,
		toolListLine,
		toolSchemaLine,
		toolsNamesLine,
		"",
		totalsLine,
		"",
		"Inline shortcut: a command token inside normal text (e.g. “hey /status”) that runs immediately (allowlisted senders only) and is stripped before the model sees the remaining message."
	].join("\n") };
}
//#endregion
//#region src/auto-reply/reply/commands-export-session.ts
const EXPORT_HTML_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "export-html");
function loadTemplate(fileName) {
	return fsSync.readFileSync(path.join(EXPORT_HTML_DIR, fileName), "utf-8");
}
function generateHtml(sessionData) {
	const template = loadTemplate("template.html");
	const templateCss = loadTemplate("template.css");
	const templateJs = loadTemplate("template.js");
	const markedJs = loadTemplate(path.join("vendor", "marked.min.js"));
	const hljsJs = loadTemplate(path.join("vendor", "highlight.min.js"));
	const themeVars = `
    --cyan: #00d7ff;
    --blue: #5f87ff;
    --green: #b5bd68;
    --red: #cc6666;
    --yellow: #ffff00;
    --gray: #808080;
    --dimGray: #666666;
    --darkGray: #505050;
    --accent: #8abeb7;
    --selectedBg: #3a3a4a;
    --userMsgBg: #343541;
    --toolPendingBg: #282832;
    --toolSuccessBg: #283228;
    --toolErrorBg: #3c2828;
    --customMsgBg: #2d2838;
    --text: #e0e0e0;
    --dim: #666666;
    --muted: #808080;
    --border: #5f87ff;
    --borderAccent: #00d7ff;
    --borderMuted: #505050;
    --success: #b5bd68;
    --error: #cc6666;
    --warning: #ffff00;
    --thinkingText: #808080;
    --userMessageBg: #343541;
    --userMessageText: #e0e0e0;
    --customMessageBg: #2d2838;
    --customMessageText: #e0e0e0;
    --customMessageLabel: #9575cd;
    --toolTitle: #e0e0e0;
    --toolOutput: #808080;
    --mdHeading: #f0c674;
    --mdLink: #81a2be;
    --mdLinkUrl: #666666;
    --mdCode: #8abeb7;
    --mdCodeBlock: #b5bd68;
  `;
	const bodyBg = "#1e1e28";
	const containerBg = "#282832";
	const infoBg = "#343541";
	const sessionDataBase64 = Buffer.from(JSON.stringify(sessionData)).toString("base64");
	const css = templateCss.replace("/* {{THEME_VARS}} */", themeVars.trim()).replace("/* {{BODY_BG_DECL}} */", `--body-bg: ${bodyBg};`).replace("/* {{CONTAINER_BG_DECL}} */", `--container-bg: ${containerBg};`).replace("/* {{INFO_BG_DECL}} */", `--info-bg: ${infoBg};`);
	return template.replace("{{CSS}}", css).replace("{{JS}}", templateJs).replace("{{SESSION_DATA}}", sessionDataBase64).replace("{{MARKED_JS}}", markedJs).replace("{{HIGHLIGHT_JS}}", hljsJs);
}
function parseExportArgs(commandBodyNormalized) {
	const normalized = commandBodyNormalized.trim();
	if (normalized === "/export-session" || normalized === "/export") return {};
	return { outputPath: normalized.replace(/^\/(export-session|export)\s*/, "").trim().split(/\s+/).find((part) => !part.startsWith("-")) };
}
async function buildExportSessionReply(params) {
	const args = parseExportArgs(params.command.commandBodyNormalized);
	if (!params.sessionEntry?.sessionId) return { text: "❌ No active session found." };
	const storePath = resolveDefaultSessionStorePath(params.agentId);
	const entry = loadSessionStore(storePath, { skipCache: true })[params.sessionKey];
	if (!entry?.sessionId) return { text: `❌ Session not found: ${params.sessionKey}` };
	let sessionFile;
	try {
		sessionFile = resolveSessionFilePath(entry.sessionId, entry, resolveSessionFilePathOptions({
			agentId: params.agentId,
			storePath
		}));
	} catch (err) {
		return { text: `❌ Failed to resolve session file: ${err instanceof Error ? err.message : String(err)}` };
	}
	if (!fsSync.existsSync(sessionFile)) return { text: `❌ Session file not found: ${sessionFile}` };
	const sessionManager = SessionManager.open(sessionFile);
	const entries = sessionManager.getEntries();
	const header = sessionManager.getHeader();
	const leafId = sessionManager.getLeafId();
	const { systemPrompt, tools } = await resolveCommandsSystemPromptBundle(params);
	const html = generateHtml({
		header,
		entries,
		leafId,
		systemPrompt,
		tools: tools.map((t) => ({
			name: t.name,
			description: t.description,
			parameters: t.parameters
		}))
	});
	const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
	const defaultFileName = `openclaw-session-${entry.sessionId.slice(0, 8)}-${timestamp}.html`;
	const outputPath = args.outputPath ? path.resolve(args.outputPath.startsWith("~") ? args.outputPath.replace("~", process.env.HOME ?? "") : args.outputPath) : path.join(params.workspaceDir, defaultFileName);
	const outputDir = path.dirname(outputPath);
	if (!fsSync.existsSync(outputDir)) fsSync.mkdirSync(outputDir, { recursive: true });
	fsSync.writeFileSync(outputPath, html, "utf-8");
	const relativePath = path.relative(params.workspaceDir, outputPath);
	return { text: [
		"✅ Session exported!",
		"",
		`📄 File: ${relativePath.startsWith("..") ? outputPath : relativePath}`,
		`📊 Entries: ${entries.length}`,
		`🧠 System prompt: ${systemPrompt.length.toLocaleString()} chars`,
		`🔧 Tools: ${tools.length}`
	].join("\n") };
}
//#endregion
//#region src/auto-reply/reply/commands-info.ts
const handleHelpCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/help") return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /help from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	return {
		shouldContinue: false,
		reply: { text: buildHelpMessage(params.cfg) }
	};
};
const handleCommandsListCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/commands") return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /commands from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const skillCommands = params.skillCommands ?? listSkillCommandsForAgents({
		cfg: params.cfg,
		agentIds: params.agentId ? [params.agentId] : void 0
	});
	const surface = params.ctx.Surface;
	if (surface === "telegram") {
		const result = buildCommandsMessagePaginated(params.cfg, skillCommands, {
			page: 1,
			surface
		});
		if (result.totalPages > 1) return {
			shouldContinue: false,
			reply: {
				text: result.text,
				channelData: { telegram: { buttons: buildCommandsPaginationKeyboard(result.currentPage, result.totalPages, params.agentId) } }
			}
		};
		return {
			shouldContinue: false,
			reply: { text: result.text }
		};
	}
	return {
		shouldContinue: false,
		reply: { text: buildCommandsMessage(params.cfg, skillCommands, { surface }) }
	};
};
const handleToolsCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	let verbose = false;
	if (normalized === "/tools" || normalized === "/tools compact") verbose = false;
	else if (normalized === "/tools verbose") verbose = true;
	else if (normalized.startsWith("/tools ")) return {
		shouldContinue: false,
		reply: { text: "Usage: /tools [compact|verbose]" }
	};
	else return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /tools from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	try {
		const agentId = params.agentId ?? resolveSessionAgentId({
			sessionKey: params.sessionKey,
			config: params.cfg
		});
		const threadingContext = buildThreadingToolContext({
			sessionCtx: params.ctx,
			config: params.cfg,
			hasRepliedRef: void 0
		});
		return {
			shouldContinue: false,
			reply: { text: buildToolsMessage(resolveEffectiveToolInventory({
				cfg: params.cfg,
				agentId,
				sessionKey: params.sessionKey,
				workspaceDir: params.workspaceDir,
				agentDir: params.agentDir,
				modelProvider: params.provider,
				modelId: params.model,
				messageProvider: params.command.channel,
				senderIsOwner: params.command.senderIsOwner,
				senderId: params.command.senderId,
				senderName: params.ctx.SenderName,
				senderUsername: params.ctx.SenderUsername,
				senderE164: params.ctx.SenderE164,
				accountId: params.ctx.AccountId,
				currentChannelId: threadingContext.currentChannelId,
				currentThreadTs: typeof params.ctx.MessageThreadId === "string" || typeof params.ctx.MessageThreadId === "number" ? String(params.ctx.MessageThreadId) : void 0,
				currentMessageId: threadingContext.currentMessageId,
				groupId: params.sessionEntry?.groupId ?? extractExplicitGroupId(params.ctx.From),
				groupChannel: params.sessionEntry?.groupChannel ?? params.ctx.GroupChannel ?? params.ctx.GroupSubject,
				groupSpace: params.sessionEntry?.space ?? params.ctx.GroupSpace,
				replyToMode: resolveReplyToMode(params.cfg, params.ctx.OriginatingChannel ?? params.ctx.Provider, params.ctx.AccountId, params.ctx.ChatType)
			}), { verbose }) }
		};
	} catch (err) {
		return {
			shouldContinue: false,
			reply: { text: String(err).includes("missing scope:") ? "You do not have permission to view available tools." : "Couldn't load available tools right now. Try again in a moment." }
		};
	}
};
function buildCommandsPaginationKeyboard(currentPage, totalPages, agentId) {
	const buttons = [];
	const suffix = agentId ? `:${agentId}` : "";
	if (currentPage > 1) buttons.push({
		text: "◀ Prev",
		callback_data: `commands_page_${currentPage - 1}${suffix}`
	});
	buttons.push({
		text: `${currentPage}/${totalPages}`,
		callback_data: `commands_page_noop${suffix}`
	});
	if (currentPage < totalPages) buttons.push({
		text: "Next ▶",
		callback_data: `commands_page_${currentPage + 1}${suffix}`
	});
	return [buttons];
}
const handleStatusCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (!(params.directives.hasStatusDirective || params.command.commandBodyNormalized === "/status")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /status from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	return {
		shouldContinue: false,
		reply: await buildStatusReply({
			cfg: params.cfg,
			command: params.command,
			sessionEntry: params.sessionEntry,
			sessionKey: params.sessionKey,
			parentSessionKey: params.ctx.ParentSessionKey,
			sessionScope: params.sessionScope,
			provider: params.provider,
			model: params.model,
			contextTokens: params.contextTokens,
			resolvedThinkLevel: params.resolvedThinkLevel,
			resolvedVerboseLevel: params.resolvedVerboseLevel,
			resolvedReasoningLevel: params.resolvedReasoningLevel,
			resolvedElevatedLevel: params.resolvedElevatedLevel,
			resolveDefaultThinkingLevel: params.resolveDefaultThinkingLevel,
			isGroup: params.isGroup,
			defaultGroupActivation: params.defaultGroupActivation,
			mediaDecisions: params.ctx.MediaUnderstandingDecisions
		})
	};
};
const handleContextCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/context" && !normalized.startsWith("/context ")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /context from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	return {
		shouldContinue: false,
		reply: await buildContextReply(params)
	};
};
const handleExportSessionCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/export-session" && !normalized.startsWith("/export-session ") && normalized !== "/export" && !normalized.startsWith("/export ")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /export-session from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	return {
		shouldContinue: false,
		reply: await buildExportSessionReply(params)
	};
};
const handleWhoamiCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/whoami") return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /whoami from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const senderId = params.ctx.SenderId ?? "";
	const senderUsername = params.ctx.SenderUsername ?? "";
	const lines = ["🧭 Identity", `Channel: ${params.command.channel}`];
	if (senderId) lines.push(`User id: ${senderId}`);
	if (senderUsername) {
		const handle = senderUsername.startsWith("@") ? senderUsername : `@${senderUsername}`;
		lines.push(`Username: ${handle}`);
	}
	if (params.ctx.ChatType === "group" && params.ctx.From) lines.push(`Chat: ${params.ctx.From}`);
	if (params.ctx.MessageThreadId != null) lines.push(`Thread: ${params.ctx.MessageThreadId}`);
	if (senderId) lines.push(`AllowFrom: ${senderId}`);
	return {
		shouldContinue: false,
		reply: { text: lines.join("\n") }
	};
};
//#endregion
export { handleHelpCommand as a, handleWhoamiCommand as c, handleExportSessionCommand as i, handleCommandsListCommand as n, handleStatusCommand as o, handleContextCommand as r, handleToolsCommand as s, buildCommandsPaginationKeyboard as t };
