import { n as isRich, r as theme } from "./theme-D-TumEpz.js";
import { n as VERSION } from "./version-TiEvEN12.js";
import { u as resolveGatewayPort } from "./paths-CD8i0MSg.js";
import { p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { i as runExec } from "./exec-nWahKiCu.js";
import { t as resolveOpenClawPackageRoot } from "./openclaw-root-Q4UoS1xk.js";
import { d as readBestEffortConfig, f as readConfigFileSnapshot } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { t as formatCliCommand } from "./command-format-CkCGNdQh.js";
import { s as readTailscaleStatusJson } from "./tailscale-BZvX3b19.js";
import { i as loadSessionStore } from "./store-BGmy-Wot.js";
import "./sessions-DC7OiAdD.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { n as buildGatewayConnectionDetails, r as callGateway } from "./call-CQ0eH9Ew.js";
import { r as normalizeControlUiBasePath } from "./control-ui-shared-D5ESzql0.js";
import { f as resolveControlUiLinks } from "./onboard-helpers-CHbAUAiB.js";
import { c as resolveGatewayLogPaths } from "./launchd-BPnToG40.js";
import { r as resolveGatewayService } from "./service-BaabAHxx.js";
import { a as inspectPortUsage, c as isDualStackLoopbackGatewayListeners, s as formatPortDiagnostics } from "./ports-C5dh_OwP.js";
import { i as probeGateway } from "./probe-DQJC7Z64.js";
import { t as formatConfigIssueLine } from "./issue-format-DnqtJUII.js";
import { t as readLastGatewayErrorLine } from "./diagnostics-BG9TH9c2.js";
import { r as resolveGatewayProbeAuthSafeWithSecretInputs } from "./probe-auth-Bic6D6VC.js";
import { n as withProgress } from "./progress-DI2x2XU2.js";
import { r as formatDurationPrecise } from "./format-duration-C_A6mVzb.js";
import { a as summarizeRestartSentinel, i as readRestartSentinel } from "./restart-sentinel-CVZLtNbX.js";
import { t as resolveCommandSecretRefsViaGateway } from "./command-secret-gateway-D6E4pqJn.js";
import { s as getStatusCommandSecretTargetIds } from "./command-secret-targets-DenfdcDu.js";
import { n as formatTimeAgo } from "./format-relative-hwB9KFeB.js";
import { t as getRemoteSkillEligibility } from "./skills-remote-fYLkhhDd.js";
import { t as buildWorkspaceSkillStatus } from "./skills-status-6dqJ2gft.js";
import { n as buildPluginCompatibilityNotices, s as formatPluginCompatibilityNotice } from "./status-DrwAkOFC.js";
import { n as renderTable, t as getTerminalTableWidth } from "./table-BjlagKDo.js";
import { t as pickGatewaySelfPresence } from "./gateway-presence-knOZNiV4.js";
import { l as resolveUpdateChannelDisplay, s as normalizeUpdateChannel } from "./update-channels-SLpbr_hy.js";
import { a as formatGitInstallLabel, t as checkUpdateStatus } from "./update-check-DTdDwACj.js";
import { t as resolveNodeService } from "./node-service-D-iO0n5j.js";
import { t as readServiceStatusSummary } from "./status.service-summary-0ETTiZYW.js";
import { t as listGatewayAgentsBasic } from "./agent-list-DujzmnBG.js";
import { n as redactSecrets, t as formatGatewayAuthUsed } from "./format-DOVndEAT.js";
import { t as collectChannelStatusIssues } from "./channels-status-issues-C6xIygWI.js";
import { n as formatUpdateOneLiner } from "./status.update-BQunyrw9.js";
import { t as resolveOsSummary } from "./os-summary-BocLsUSg.js";
import { t as buildChannelsTable } from "./channels-BXWjc43Z.js";
import { t as groupChannelIssuesByChannel } from "./channel-issues-DXpnzyV6.js";
import { t as resolveNodeOnlyGatewayInfo } from "./status.node-mode-ABfAg_P_.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/commands/status-all/agents.ts
async function fileExists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}
async function getAgentLocalStatuses(cfg) {
	const agentList = listGatewayAgentsBasic(cfg);
	const now = Date.now();
	const agents = await Promise.all(agentList.agents.map(async (agent) => {
		const workspaceDir = (() => {
			try {
				return resolveAgentWorkspaceDir(cfg, agent.id);
			} catch {
				return null;
			}
		})();
		const bootstrapPending = workspaceDir != null ? await fileExists(path.join(workspaceDir, "BOOTSTRAP.md")) : null;
		const sessionsPath = resolveStorePath(cfg.session?.store, { agentId: agent.id });
		const store = (() => {
			try {
				return loadSessionStore(sessionsPath);
			} catch {
				return {};
			}
		})();
		const updatedAt = Object.values(store).reduce((max, entry) => Math.max(max, entry?.updatedAt ?? 0), 0);
		const lastUpdatedAt = updatedAt > 0 ? updatedAt : null;
		const lastActiveAgeMs = lastUpdatedAt ? now - lastUpdatedAt : null;
		const sessionsCount = Object.keys(store).filter((k) => k !== "global" && k !== "unknown").length;
		return {
			id: agent.id,
			name: agent.name,
			workspaceDir,
			bootstrapPending,
			sessionsPath,
			sessionsCount,
			lastUpdatedAt,
			lastActiveAgeMs
		};
	}));
	const totalSessions = agents.reduce((sum, a) => sum + a.sessionsCount, 0);
	const bootstrapPendingCount = agents.reduce((sum, a) => sum + (a.bootstrapPending ? 1 : 0), 0);
	return {
		defaultId: agentList.defaultId,
		agents,
		totalSessions,
		bootstrapPendingCount
	};
}
//#endregion
//#region src/commands/status-all/gateway.ts
async function readFileTailLines(filePath, maxLines) {
	const raw = await fs.readFile(filePath, "utf8").catch(() => "");
	if (!raw.trim()) return [];
	const lines = raw.replace(/\r/g, "").split("\n");
	return lines.slice(Math.max(0, lines.length - maxLines)).map((line) => line.trimEnd()).filter((line) => line.trim().length > 0);
}
function countMatches(haystack, needle) {
	if (!haystack || !needle) return 0;
	return haystack.split(needle).length - 1;
}
function shorten(message, maxLen) {
	const cleaned = message.replace(/\s+/g, " ").trim();
	if (cleaned.length <= maxLen) return cleaned;
	return `${cleaned.slice(0, Math.max(0, maxLen - 1))}…`;
}
function normalizeGwsLine(line) {
	return line.replace(/\s+runId=[^\s]+/g, "").replace(/\s+conn=[^\s]+/g, "").replace(/\s+id=[^\s]+/g, "").replace(/\s+error=Error:.*$/g, "").trim();
}
function consumeJsonBlock(lines, startIndex) {
	const startLine = lines[startIndex] ?? "";
	const braceAt = startLine.indexOf("{");
	if (braceAt < 0) return null;
	const parts = [startLine.slice(braceAt)];
	let depth = countMatches(parts[0] ?? "", "{") - countMatches(parts[0] ?? "", "}");
	let i = startIndex;
	while (depth > 0 && i + 1 < lines.length) {
		i += 1;
		const next = lines[i] ?? "";
		parts.push(next);
		depth += countMatches(next, "{") - countMatches(next, "}");
	}
	return {
		json: parts.join("\n"),
		endIndex: i
	};
}
function summarizeLogTail(rawLines, opts) {
	const maxLines = Math.max(6, opts?.maxLines ?? 26);
	const out = [];
	const groups = /* @__PURE__ */ new Map();
	const addGroup = (key, base) => {
		const existing = groups.get(key);
		if (existing) {
			existing.count += 1;
			return;
		}
		groups.set(key, {
			count: 1,
			index: out.length,
			base
		});
		out.push(base);
	};
	const addLine = (line) => {
		const trimmed = line.trimEnd();
		if (!trimmed) return;
		out.push(trimmed);
	};
	const lines = rawLines.map((line) => line.trimEnd()).filter(Boolean);
	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i] ?? "";
		const trimmedStart = line.trimStart();
		if ((trimmedStart.startsWith("\"") || trimmedStart === "}" || trimmedStart === "{" || trimmedStart.startsWith("}") || trimmedStart.startsWith("{")) && !trimmedStart.startsWith("[") && !trimmedStart.startsWith("#")) continue;
		const tokenRefresh = line.match(/^\[([^\]]+)\]\s+Token refresh failed:\s*(\d+)\s*(\{)?\s*$/);
		if (tokenRefresh) {
			const tag = tokenRefresh[1] ?? "unknown";
			const status = tokenRefresh[2] ?? "unknown";
			const block = consumeJsonBlock(lines, i);
			if (block) {
				i = block.endIndex;
				const parsed = (() => {
					try {
						return JSON.parse(block.json);
					} catch {
						return null;
					}
				})();
				const code = parsed?.error?.code?.trim() || null;
				const msg = parsed?.error?.message?.trim() || null;
				const msgShort = msg ? msg.toLowerCase().includes("signing in again") ? "re-auth required" : shorten(msg, 52) : null;
				const base = `[${tag}] token refresh ${status}${code ? ` ${code}` : ""}${msgShort ? ` · ${msgShort}` : ""}`;
				addGroup(`token:${tag}:${status}:${code ?? ""}:${msgShort ?? ""}`, base);
				continue;
			}
		}
		const embedded = line.match(/^Embedded agent failed before reply:\s+OAuth token refresh failed for ([^:]+):/);
		if (embedded) {
			const provider = embedded[1]?.trim() || "unknown";
			addGroup(`embedded:${provider}`, `Embedded agent: OAuth token refresh failed (${provider})`);
			continue;
		}
		if (line.startsWith("[gws]") && line.includes("errorCode=UNAVAILABLE") && line.includes("OAuth token refresh failed")) {
			const normalized = normalizeGwsLine(line);
			addGroup(`gws:${normalized}`, normalized);
			continue;
		}
		addLine(line);
	}
	for (const g of groups.values()) {
		if (g.count <= 1) continue;
		out[g.index] = `${g.base} ×${g.count}`;
	}
	const deduped = [];
	for (const line of out) {
		if (deduped[deduped.length - 1] === line) continue;
		deduped.push(line);
	}
	if (deduped.length <= maxLines) return deduped;
	const head = Math.min(6, Math.floor(maxLines / 3));
	const tail = Math.max(1, maxLines - head - 1);
	return [
		...deduped.slice(0, head),
		`… ${deduped.length - head - tail} lines omitted …`,
		...deduped.slice(-tail)
	];
}
//#endregion
//#region src/commands/status-all/diagnosis.ts
async function appendStatusAllDiagnosis(params) {
	const { lines, muted, ok, warn, fail } = params;
	const emitCheck = (label, status) => {
		const icon = status === "ok" ? ok("✓") : status === "warn" ? warn("!") : fail("✗");
		const colored = status === "ok" ? ok(label) : status === "warn" ? warn(label) : fail(label);
		lines.push(`${icon} ${colored}`);
	};
	lines.push("");
	lines.push(muted("Gateway connection details:"));
	for (const line of redactSecrets(params.connectionDetailsForReport).split("\n").map((l) => l.trimEnd())) lines.push(`  ${muted(line)}`);
	lines.push("");
	if (params.snap) {
		const status = !params.snap.exists ? "fail" : params.snap.valid ? "ok" : "warn";
		emitCheck(`Config: ${params.snap.path ?? "(unknown)"}`, status);
		const issues = [...params.snap.legacyIssues ?? [], ...params.snap.issues ?? []];
		const uniqueIssues = issues.filter((issue, index) => issues.findIndex((x) => x.path === issue.path && x.message === issue.message) === index);
		for (const issue of uniqueIssues.slice(0, 12)) lines.push(`  ${formatConfigIssueLine(issue, "-")}`);
		if (uniqueIssues.length > 12) lines.push(`  ${muted(`… +${uniqueIssues.length - 12} more`)}`);
	} else emitCheck("Config: read failed", "warn");
	if (params.remoteUrlMissing) {
		lines.push("");
		emitCheck("Gateway remote mode misconfigured (gateway.remote.url missing)", "warn");
		lines.push(`  ${muted("Fix: set gateway.remote.url, or set gateway.mode=local.")}`);
	}
	emitCheck(`Secret diagnostics (${params.secretDiagnostics.length})`, params.secretDiagnostics.length === 0 ? "ok" : "warn");
	for (const diagnostic of params.secretDiagnostics.slice(0, 10)) lines.push(`  - ${muted(redactSecrets(diagnostic))}`);
	if (params.secretDiagnostics.length > 10) lines.push(`  ${muted(`… +${params.secretDiagnostics.length - 10} more`)}`);
	if (params.sentinel?.payload) {
		emitCheck("Restart sentinel present", "warn");
		lines.push(`  ${muted(`${summarizeRestartSentinel(params.sentinel.payload)} · ${formatTimeAgo(Date.now() - params.sentinel.payload.ts)}`)}`);
	} else emitCheck("Restart sentinel: none", "ok");
	const lastErrClean = params.lastErr?.trim() ?? "";
	const isTrivialLastErr = lastErrClean.length < 8 || lastErrClean === "}" || lastErrClean === "{";
	if (lastErrClean && !isTrivialLastErr) {
		lines.push("");
		lines.push(muted("Gateway last log line:"));
		lines.push(`  ${muted(redactSecrets(lastErrClean))}`);
	}
	if (params.portUsage) {
		const benignDualStackLoopback = isDualStackLoopbackGatewayListeners(params.portUsage.listeners, params.port);
		const portOk = params.portUsage.listeners.length === 0 || benignDualStackLoopback;
		emitCheck(`Port ${params.port}`, portOk ? "ok" : "warn");
		if (!portOk) for (const line of formatPortDiagnostics(params.portUsage)) lines.push(`  ${muted(line)}`);
		else if (benignDualStackLoopback) lines.push(`  ${muted("Detected dual-stack loopback listeners (127.0.0.1 + ::1) for one gateway process.")}`);
	}
	{
		const backend = params.tailscale.backendState ?? "unknown";
		const okBackend = backend === "Running";
		const hasDns = Boolean(params.tailscale.dnsName);
		emitCheck(params.tailscaleMode === "off" ? `Tailscale: off · ${backend}${params.tailscale.dnsName ? ` · ${params.tailscale.dnsName}` : ""}` : `Tailscale: ${params.tailscaleMode} · ${backend}${params.tailscale.dnsName ? ` · ${params.tailscale.dnsName}` : ""}`, okBackend && (params.tailscaleMode === "off" || hasDns) ? "ok" : "warn");
		if (params.tailscale.error) lines.push(`  ${muted(`error: ${params.tailscale.error}`)}`);
		if (params.tailscale.ips.length > 0) lines.push(`  ${muted(`ips: ${params.tailscale.ips.slice(0, 3).join(", ")}${params.tailscale.ips.length > 3 ? "…" : ""}`)}`);
		if (params.tailscaleHttpsUrl) lines.push(`  ${muted(`https: ${params.tailscaleHttpsUrl}`)}`);
	}
	if (params.skillStatus) {
		const eligible = params.skillStatus.skills.filter((s) => s.eligible).length;
		const missing = params.skillStatus.skills.filter((s) => s.eligible && Object.values(s.missing).some((arr) => arr.length)).length;
		emitCheck(`Skills: ${eligible} eligible · ${missing} missing · ${params.skillStatus.workspaceDir}`, missing === 0 ? "ok" : "warn");
	}
	emitCheck(`Plugin compatibility (${params.pluginCompatibility.length || "none"})`, params.pluginCompatibility.length === 0 ? "ok" : "warn");
	for (const notice of params.pluginCompatibility.slice(0, 12)) {
		const severity = notice.severity === "warn" ? "warn" : "info";
		lines.push(`  - [${severity}] ${formatPluginCompatibilityNotice(notice)}`);
	}
	if (params.pluginCompatibility.length > 12) lines.push(`  ${muted(`… +${params.pluginCompatibility.length - 12} more`)}`);
	params.progress.setLabel("Reading logs…");
	const logPaths = (() => {
		try {
			return resolveGatewayLogPaths(process.env);
		} catch {
			return null;
		}
	})();
	if (logPaths) {
		params.progress.setLabel("Reading logs…");
		const [stderrTail, stdoutTail] = await Promise.all([readFileTailLines(logPaths.stderrPath, 40).catch(() => []), readFileTailLines(logPaths.stdoutPath, 40).catch(() => [])]);
		if (stderrTail.length > 0 || stdoutTail.length > 0) {
			lines.push("");
			lines.push(muted(`Gateway logs (tail, summarized): ${logPaths.logDir}`));
			lines.push(`  ${muted(`# stderr: ${logPaths.stderrPath}`)}`);
			for (const line of summarizeLogTail(stderrTail, { maxLines: 22 }).map(redactSecrets)) lines.push(`  ${muted(line)}`);
			lines.push(`  ${muted(`# stdout: ${logPaths.stdoutPath}`)}`);
			for (const line of summarizeLogTail(stdoutTail, { maxLines: 22 }).map(redactSecrets)) lines.push(`  ${muted(line)}`);
		}
	}
	params.progress.tick();
	if (params.channelsStatus) {
		emitCheck(`Channel issues (${params.channelIssues.length || "none"})`, params.channelIssues.length === 0 ? "ok" : "warn");
		for (const issue of params.channelIssues.slice(0, 12)) {
			const fixText = issue.fix ? ` · fix: ${issue.fix}` : "";
			lines.push(`  - ${issue.channel}[${issue.accountId}] ${issue.kind}: ${issue.message}${fixText}`);
		}
		if (params.channelIssues.length > 12) lines.push(`  ${muted(`… +${params.channelIssues.length - 12} more`)}`);
	} else if (params.nodeOnlyGateway) emitCheck(`Channel issues skipped (node-only mode; query ${params.nodeOnlyGateway.gatewayTarget})`, "ok");
	else emitCheck(`Channel issues skipped (gateway ${params.gatewayReachable ? "query failed" : "unreachable"})`, "warn");
	const healthErr = (() => {
		if (!params.health || typeof params.health !== "object") return "";
		const record = params.health;
		if (!("error" in record)) return "";
		const value = record.error;
		if (!value) return "";
		if (typeof value === "string") return value;
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return "[unserializable error]";
		}
	})();
	if (healthErr) {
		lines.push("");
		lines.push(muted("Gateway health:"));
		lines.push(`  ${muted(redactSecrets(healthErr))}`);
	}
	lines.push("");
	lines.push(muted("Pasteable debug report. Auth tokens redacted."));
	lines.push("Troubleshooting: https://docs.openclaw.ai/troubleshooting");
	lines.push("");
}
//#endregion
//#region src/commands/status-all/report-lines.ts
async function buildStatusAllReportLines(params) {
	const rich = isRich();
	const heading = (text) => rich ? theme.heading(text) : text;
	const ok = (text) => rich ? theme.success(text) : text;
	const warn = (text) => rich ? theme.warn(text) : text;
	const fail = (text) => rich ? theme.error(text) : text;
	const muted = (text) => rich ? theme.muted(text) : text;
	const tableWidth = getTerminalTableWidth();
	const overview = renderTable({
		width: tableWidth,
		columns: [{
			key: "Item",
			header: "Item",
			minWidth: 10
		}, {
			key: "Value",
			header: "Value",
			flex: true,
			minWidth: 24
		}],
		rows: params.overviewRows
	});
	const channelRows = params.channels.rows.map((row) => ({
		channelId: row.id,
		Channel: row.label,
		Enabled: row.enabled ? ok("ON") : muted("OFF"),
		State: row.state === "ok" ? ok("OK") : row.state === "warn" ? warn("WARN") : row.state === "off" ? muted("OFF") : theme.accentDim("SETUP"),
		Detail: row.detail
	}));
	const channelIssuesByChannel = groupChannelIssuesByChannel(params.channelIssues);
	const channelsTable = renderTable({
		width: tableWidth,
		columns: [
			{
				key: "Channel",
				header: "Channel",
				minWidth: 10
			},
			{
				key: "Enabled",
				header: "Enabled",
				minWidth: 7
			},
			{
				key: "State",
				header: "State",
				minWidth: 8
			},
			{
				key: "Detail",
				header: "Detail",
				flex: true,
				minWidth: 28
			}
		],
		rows: channelRows.map((row) => {
			const issues = channelIssuesByChannel.get(row.channelId) ?? [];
			if (issues.length === 0) return row;
			const issue = issues[0];
			const suffix = ` · ${warn(`gateway: ${String(issue.message).slice(0, 90)}`)}`;
			return {
				...row,
				State: warn("WARN"),
				Detail: `${row.Detail}${suffix}`
			};
		})
	});
	const agentsTable = renderTable({
		width: tableWidth,
		columns: [
			{
				key: "Agent",
				header: "Agent",
				minWidth: 12
			},
			{
				key: "BootstrapFile",
				header: "Bootstrap file",
				minWidth: 14
			},
			{
				key: "Sessions",
				header: "Sessions",
				align: "right",
				minWidth: 8
			},
			{
				key: "Active",
				header: "Active",
				minWidth: 10
			},
			{
				key: "Store",
				header: "Store",
				flex: true,
				minWidth: 34
			}
		],
		rows: params.agentStatus.agents.map((a) => ({
			Agent: a.name?.trim() ? `${a.id} (${a.name.trim()})` : a.id,
			BootstrapFile: a.bootstrapPending === true ? warn("PRESENT") : a.bootstrapPending === false ? ok("ABSENT") : "unknown",
			Sessions: String(a.sessionsCount),
			Active: a.lastActiveAgeMs != null ? formatTimeAgo(a.lastActiveAgeMs) : "unknown",
			Store: a.sessionsPath
		}))
	});
	const lines = [];
	lines.push(heading("OpenClaw status --all"));
	lines.push("");
	lines.push(heading("Overview"));
	lines.push(overview.trimEnd());
	lines.push("");
	lines.push(heading("Channels"));
	lines.push(channelsTable.trimEnd());
	for (const detail of params.channels.details) {
		lines.push("");
		lines.push(heading(detail.title));
		lines.push(renderTable({
			width: tableWidth,
			columns: detail.columns.map((c) => ({
				key: c,
				header: c,
				flex: c === "Notes",
				minWidth: c === "Notes" ? 28 : 10
			})),
			rows: detail.rows.map((r) => ({
				...r,
				...r.Status === "OK" ? { Status: ok("OK") } : r.Status === "WARN" ? { Status: warn("WARN") } : {}
			}))
		}).trimEnd());
	}
	lines.push("");
	lines.push(heading("Agents"));
	lines.push(agentsTable.trimEnd());
	lines.push("");
	lines.push(heading("Diagnosis (read-only)"));
	await appendStatusAllDiagnosis({
		lines,
		progress: params.progress,
		muted,
		ok,
		warn,
		fail,
		connectionDetailsForReport: params.connectionDetailsForReport,
		...params.diagnosis
	});
	return lines;
}
//#endregion
//#region src/commands/status-all.ts
async function statusAllCommand(runtime, opts) {
	await withProgress({
		label: "Scanning status --all…",
		total: 11
	}, async (progress) => {
		progress.setLabel("Loading config…");
		const loadedRaw = await readBestEffortConfig();
		const { resolvedConfig: cfg, diagnostics: secretDiagnostics } = await resolveCommandSecretRefsViaGateway({
			config: loadedRaw,
			commandName: "status --all",
			targetIds: getStatusCommandSecretTargetIds(),
			mode: "read_only_status"
		});
		const osSummary = resolveOsSummary();
		const snap = await readConfigFileSnapshot().catch(() => null);
		progress.tick();
		progress.setLabel("Checking Tailscale…");
		const tailscaleMode = cfg.gateway?.tailscale?.mode ?? "off";
		const tailscale = await (async () => {
			try {
				const parsed = await readTailscaleStatusJson(runExec, { timeoutMs: 1200 });
				const backendState = typeof parsed.BackendState === "string" ? parsed.BackendState : null;
				const self = typeof parsed.Self === "object" && parsed.Self !== null ? parsed.Self : null;
				const dnsNameRaw = self && typeof self.DNSName === "string" ? self.DNSName : null;
				return {
					ok: true,
					backendState,
					dnsName: dnsNameRaw ? dnsNameRaw.replace(/\.$/, "") : null,
					ips: self && Array.isArray(self.TailscaleIPs) ? self.TailscaleIPs.filter((v) => typeof v === "string" && v.trim().length > 0).map((v) => v.trim()) : [],
					error: null
				};
			} catch (err) {
				return {
					ok: false,
					backendState: null,
					dnsName: null,
					ips: [],
					error: String(err)
				};
			}
		})();
		const tailscaleHttpsUrl = tailscaleMode !== "off" && tailscale.dnsName ? `https://${tailscale.dnsName}${normalizeControlUiBasePath(cfg.gateway?.controlUi?.basePath)}` : null;
		progress.tick();
		progress.setLabel("Checking for updates…");
		const update = await checkUpdateStatus({
			root: await resolveOpenClawPackageRoot({
				moduleUrl: import.meta.url,
				argv1: process.argv[1],
				cwd: process.cwd()
			}),
			timeoutMs: 6500,
			fetchGit: true,
			includeRegistry: true
		});
		const channelLabel = resolveUpdateChannelDisplay({
			configChannel: normalizeUpdateChannel(cfg.update?.channel),
			installKind: update.installKind,
			gitTag: update.git?.tag ?? null,
			gitBranch: update.git?.branch ?? null
		}).label;
		const gitLabel = formatGitInstallLabel(update);
		progress.tick();
		progress.setLabel("Probing gateway…");
		const connection = buildGatewayConnectionDetails({ config: cfg });
		const isRemoteMode = cfg.gateway?.mode === "remote";
		const remoteUrlRaw = typeof cfg.gateway?.remote?.url === "string" ? cfg.gateway.remote.url.trim() : "";
		const remoteUrlMissing = isRemoteMode && !remoteUrlRaw;
		const gatewayMode = isRemoteMode ? "remote" : "local";
		const probeAuthResolution = await resolveGatewayProbeAuthSafeWithSecretInputs({
			cfg,
			mode: isRemoteMode && !remoteUrlMissing ? "remote" : "local",
			env: process.env
		});
		const probeAuth = probeAuthResolution.auth;
		const gatewayProbe = await probeGateway({
			url: connection.url,
			auth: probeAuth,
			timeoutMs: Math.min(5e3, opts?.timeoutMs ?? 1e4)
		}).catch(() => null);
		const gatewayReachable = gatewayProbe?.ok === true;
		const gatewaySelf = pickGatewaySelfPresence(gatewayProbe?.presence ?? null);
		progress.tick();
		progress.setLabel("Checking services…");
		const readServiceSummary = async (service) => {
			try {
				const summary = await readServiceStatusSummary(service, service.label);
				return {
					label: summary.label,
					installed: summary.installed,
					externallyManaged: summary.externallyManaged,
					managedByOpenClaw: summary.managedByOpenClaw,
					loaded: summary.loaded,
					loadedText: summary.loadedText,
					runtime: summary.runtime
				};
			} catch {
				return null;
			}
		};
		const daemon = await readServiceSummary(resolveGatewayService());
		const nodeService = await readServiceSummary(resolveNodeService());
		const nodeOnlyGateway = daemon && nodeService ? await resolveNodeOnlyGatewayInfo({
			daemon,
			node: nodeService
		}) : null;
		progress.tick();
		progress.setLabel("Scanning agents…");
		const agentStatus = await getAgentLocalStatuses(cfg);
		progress.tick();
		progress.setLabel("Summarizing channels…");
		const channels = await buildChannelsTable(cfg, {
			showSecrets: false,
			sourceConfig: loadedRaw
		});
		progress.tick();
		const connectionDetailsForReport = (() => {
			if (nodeOnlyGateway) return nodeOnlyGateway.connectionDetails;
			if (!remoteUrlMissing) return connection.message;
			const bindMode = cfg.gateway?.bind ?? "loopback";
			return [
				"Gateway mode: remote",
				"Gateway target: (missing gateway.remote.url)",
				`Config: ${snap?.path?.trim() ? snap.path.trim() : "(unknown config path)"}`,
				`Bind: ${bindMode}`,
				`Local fallback (used for probes): ${connection.url}`,
				"Fix: set gateway.remote.url, or set gateway.mode=local."
			].join("\n");
		})();
		const callOverrides = remoteUrlMissing ? {
			url: connection.url,
			token: probeAuthResolution.auth.token,
			password: probeAuthResolution.auth.password
		} : {};
		progress.setLabel("Querying gateway…");
		const health = nodeOnlyGateway ? void 0 : gatewayReachable ? await callGateway({
			config: cfg,
			method: "health",
			timeoutMs: Math.min(8e3, opts?.timeoutMs ?? 1e4),
			...callOverrides
		}).catch((err) => ({ error: String(err) })) : { error: gatewayProbe?.error ?? "gateway unreachable" };
		const channelsStatus = gatewayReachable ? await callGateway({
			config: cfg,
			method: "channels.status",
			params: {
				probe: false,
				timeoutMs: opts?.timeoutMs ?? 1e4
			},
			timeoutMs: Math.min(8e3, opts?.timeoutMs ?? 1e4),
			...callOverrides
		}).catch(() => null) : null;
		const channelIssues = channelsStatus ? collectChannelStatusIssues(channelsStatus) : [];
		progress.tick();
		progress.setLabel("Checking local state…");
		const sentinel = await readRestartSentinel().catch(() => null);
		const lastErr = await readLastGatewayErrorLine(process.env).catch(() => null);
		const port = resolveGatewayPort(cfg);
		const portUsage = await inspectPortUsage(port).catch(() => null);
		progress.tick();
		const defaultWorkspace = agentStatus.agents.find((a) => a.id === agentStatus.defaultId)?.workspaceDir ?? agentStatus.agents[0]?.workspaceDir ?? null;
		const skillStatus = defaultWorkspace != null ? (() => {
			try {
				return buildWorkspaceSkillStatus(defaultWorkspace, {
					config: cfg,
					eligibility: { remote: getRemoteSkillEligibility() }
				});
			} catch {
				return null;
			}
		})() : null;
		const pluginCompatibility = buildPluginCompatibilityNotices({ config: cfg });
		const dashboard = cfg.gateway?.controlUi?.enabled ?? true ? resolveControlUiLinks({
			port,
			bind: cfg.gateway?.bind,
			customBindHost: cfg.gateway?.customBindHost,
			basePath: cfg.gateway?.controlUi?.basePath
		}).httpUrl : null;
		const updateLine = formatUpdateOneLiner(update).replace(/^Update:\s*/i, "");
		const gatewayTarget = remoteUrlMissing ? `fallback ${connection.url}` : connection.url;
		const gatewayStatus = gatewayReachable ? `reachable ${formatDurationPrecise(gatewayProbe?.connectLatencyMs ?? 0)}` : gatewayProbe?.error ? `unreachable (${gatewayProbe.error})` : "unreachable";
		const gatewayAuth = gatewayReachable ? ` · auth ${formatGatewayAuthUsed(probeAuth)}` : "";
		const gatewayValue = nodeOnlyGateway?.gatewayValue ?? `${gatewayMode}${remoteUrlMissing ? " (remote.url missing)" : ""} · ${gatewayTarget} (${connection.urlSource}) · ${gatewayStatus}${gatewayAuth}`;
		const gatewaySelfLine = gatewaySelf?.host || gatewaySelf?.ip || gatewaySelf?.version || gatewaySelf?.platform ? [
			gatewaySelf.host ? gatewaySelf.host : null,
			gatewaySelf.ip ? `(${gatewaySelf.ip})` : null,
			gatewaySelf.version ? `app ${gatewaySelf.version}` : null,
			gatewaySelf.platform ? gatewaySelf.platform : null
		].filter(Boolean).join(" ") : null;
		const aliveThresholdMs = 10 * 6e4;
		const aliveAgents = agentStatus.agents.filter((a) => a.lastActiveAgeMs != null && a.lastActiveAgeMs <= aliveThresholdMs).length;
		const lines = await buildStatusAllReportLines({
			progress,
			overviewRows: [
				{
					Item: "Version",
					Value: VERSION
				},
				{
					Item: "OS",
					Value: osSummary.label
				},
				{
					Item: "Node",
					Value: process.versions.node
				},
				{
					Item: "Config",
					Value: snap?.path?.trim() ? snap.path.trim() : "(unknown config path)"
				},
				dashboard ? {
					Item: "Dashboard",
					Value: dashboard
				} : {
					Item: "Dashboard",
					Value: "disabled"
				},
				{
					Item: "Tailscale",
					Value: tailscaleMode === "off" ? `off${tailscale.backendState ? ` · ${tailscale.backendState}` : ""}${tailscale.dnsName ? ` · ${tailscale.dnsName}` : ""}` : tailscale.dnsName && tailscaleHttpsUrl ? `${tailscaleMode} · ${tailscale.backendState ?? "unknown"} · ${tailscale.dnsName} · ${tailscaleHttpsUrl}` : `${tailscaleMode} · ${tailscale.backendState ?? "unknown"} · magicdns unknown`
				},
				{
					Item: "Channel",
					Value: channelLabel
				},
				...gitLabel ? [{
					Item: "Git",
					Value: gitLabel
				}] : [],
				{
					Item: "Update",
					Value: updateLine
				},
				{
					Item: "Gateway",
					Value: gatewayValue
				},
				...probeAuthResolution.warning ? [{
					Item: "Gateway auth warning",
					Value: probeAuthResolution.warning
				}] : [],
				{
					Item: "Security",
					Value: `Run: ${formatCliCommand("openclaw security audit --deep")}`
				},
				gatewaySelfLine ? {
					Item: "Gateway self",
					Value: gatewaySelfLine
				} : {
					Item: "Gateway self",
					Value: "unknown"
				},
				daemon ? {
					Item: "Gateway service",
					Value: !daemon.installed ? `${daemon.label} not installed` : `${daemon.label} ${daemon.managedByOpenClaw ? "installed · " : ""}${daemon.loadedText}${daemon.runtime?.status ? ` · ${daemon.runtime.status}` : ""}${daemon.runtime?.pid ? ` (pid ${daemon.runtime.pid})` : ""}`
				} : {
					Item: "Gateway service",
					Value: "unknown"
				},
				nodeService ? {
					Item: "Node service",
					Value: !nodeService.installed ? `${nodeService.label} not installed` : `${nodeService.label} ${nodeService.managedByOpenClaw ? "installed · " : ""}${nodeService.loadedText}${nodeService.runtime?.status ? ` · ${nodeService.runtime.status}` : ""}${nodeService.runtime?.pid ? ` (pid ${nodeService.runtime.pid})` : ""}`
				} : {
					Item: "Node service",
					Value: "unknown"
				},
				{
					Item: "Agents",
					Value: `${agentStatus.agents.length} total · ${agentStatus.bootstrapPendingCount} bootstrapping · ${aliveAgents} active · ${agentStatus.totalSessions} sessions`
				},
				{
					Item: "Secrets",
					Value: secretDiagnostics.length > 0 ? `${secretDiagnostics.length} diagnostic${secretDiagnostics.length === 1 ? "" : "s"}` : "none"
				}
			],
			channels,
			channelIssues: channelIssues.map((issue) => ({
				channel: issue.channel,
				message: issue.message
			})),
			agentStatus,
			connectionDetailsForReport,
			diagnosis: {
				snap,
				remoteUrlMissing,
				secretDiagnostics,
				sentinel,
				lastErr,
				port,
				portUsage,
				tailscaleMode,
				tailscale,
				tailscaleHttpsUrl,
				skillStatus,
				pluginCompatibility,
				channelsStatus,
				channelIssues,
				gatewayReachable,
				health,
				nodeOnlyGateway
			}
		});
		progress.setLabel("Rendering…");
		runtime.log(lines.join("\n"));
		progress.tick();
	});
}
//#endregion
export { statusAllCommand };
