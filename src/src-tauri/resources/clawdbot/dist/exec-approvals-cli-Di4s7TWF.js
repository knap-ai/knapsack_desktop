import { M as theme, h as defaultRuntime, j as isRich } from "./entry.js";
import "./auth-profiles-DnpV8DWM.js";
import "./utils-q1rHOG-N.js";
import "./exec-B52LZOrO.js";
import "./agent-scope-Bu62UIQZ.js";
import "./github-copilot-token-C4G0wDDt.js";
import "./config-BJWIHf6x.js";
import "./manifest-registry-DlFh5LWe.js";
import "./message-channel-D-iPIX3C.js";
import "./client-DV6vI7ic.js";
import "./call-FZUZ5EU4.js";
import { n as formatTimeAgo } from "./format-relative-qvxMEk-R.js";
import { t as formatDocsLink } from "./links-C_tOT2wV.js";
import "./progress-C4IJwa0T.js";
import { f as saveExecApprovals, o as readExecApprovalsSnapshot } from "./exec-approvals-Bj53aIIP.js";
import { n as callGatewayFromCli } from "./gateway-rpc-BUTCXFoL.js";
import "./service-q_Baxtp9.js";
import "./systemd-BmDw_juR.js";
import { t as renderTable } from "./table-DvO2pSzv.js";
import { t as describeUnknownError } from "./shared-CsNqJtaM.js";
import { n as nodesCallOpts, r as resolveNodeId } from "./rpc-DaYVxRAa.js";
import JSON5 from "json5";
import fs from "node:fs/promises";

//#region src/cli/exec-approvals-cli.ts
async function readStdin() {
	const chunks = [];
	for await (const chunk of process.stdin) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
	return Buffer.concat(chunks).toString("utf8");
}
async function resolveTargetNodeId(opts) {
	if (opts.gateway) return null;
	const raw = opts.node?.trim() ?? "";
	if (!raw) return null;
	return await resolveNodeId(opts, raw);
}
async function loadSnapshot(opts, nodeId) {
	return await callGatewayFromCli(nodeId ? "exec.approvals.node.get" : "exec.approvals.get", opts, nodeId ? { nodeId } : {});
}
function loadSnapshotLocal() {
	const snapshot = readExecApprovalsSnapshot();
	return {
		path: snapshot.path,
		exists: snapshot.exists,
		hash: snapshot.hash,
		file: snapshot.file
	};
}
function saveSnapshotLocal(file) {
	saveExecApprovals(file);
	return loadSnapshotLocal();
}
async function loadSnapshotTarget(opts) {
	if (!opts.gateway && !opts.node) return {
		snapshot: loadSnapshotLocal(),
		nodeId: null,
		source: "local"
	};
	const nodeId = await resolveTargetNodeId(opts);
	return {
		snapshot: await loadSnapshot(opts, nodeId),
		nodeId,
		source: nodeId ? "node" : "gateway"
	};
}
function formatCliError(err) {
	const msg = describeUnknownError(err);
	return msg.includes("\n") ? msg.split("\n")[0] : msg;
}
function renderApprovalsSnapshot(snapshot, targetLabel) {
	const rich = isRich();
	const heading = (text) => rich ? theme.heading(text) : text;
	const muted = (text) => rich ? theme.muted(text) : text;
	const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
	const file = snapshot.file ?? { version: 1 };
	const defaults = file.defaults ?? {};
	const defaultsParts = [
		defaults.security ? `security=${defaults.security}` : null,
		defaults.ask ? `ask=${defaults.ask}` : null,
		defaults.askFallback ? `askFallback=${defaults.askFallback}` : null,
		typeof defaults.autoAllowSkills === "boolean" ? `autoAllowSkills=${defaults.autoAllowSkills ? "on" : "off"}` : null
	].filter(Boolean);
	const agents = file.agents ?? {};
	const allowlistRows = [];
	const now = Date.now();
	for (const [agentId, agent] of Object.entries(agents)) {
		const allowlist = Array.isArray(agent.allowlist) ? agent.allowlist : [];
		for (const entry of allowlist) {
			const pattern = entry?.pattern?.trim() ?? "";
			if (!pattern) continue;
			const lastUsedAt = typeof entry.lastUsedAt === "number" ? entry.lastUsedAt : null;
			allowlistRows.push({
				Target: targetLabel,
				Agent: agentId,
				Pattern: pattern,
				LastUsed: lastUsedAt ? formatTimeAgo(Math.max(0, now - lastUsedAt)) : muted("unknown")
			});
		}
	}
	const summaryRows = [
		{
			Field: "Target",
			Value: targetLabel
		},
		{
			Field: "Path",
			Value: snapshot.path
		},
		{
			Field: "Exists",
			Value: snapshot.exists ? "yes" : "no"
		},
		{
			Field: "Hash",
			Value: snapshot.hash
		},
		{
			Field: "Version",
			Value: String(file.version ?? 1)
		},
		{
			Field: "Socket",
			Value: file.socket?.path ?? "default"
		},
		{
			Field: "Defaults",
			Value: defaultsParts.length > 0 ? defaultsParts.join(", ") : "none"
		},
		{
			Field: "Agents",
			Value: String(Object.keys(agents).length)
		},
		{
			Field: "Allowlist",
			Value: String(allowlistRows.length)
		}
	];
	defaultRuntime.log(heading("Approvals"));
	defaultRuntime.log(renderTable({
		width: tableWidth,
		columns: [{
			key: "Field",
			header: "Field",
			minWidth: 8
		}, {
			key: "Value",
			header: "Value",
			minWidth: 24,
			flex: true
		}],
		rows: summaryRows
	}).trimEnd());
	if (allowlistRows.length === 0) {
		defaultRuntime.log("");
		defaultRuntime.log(muted("No allowlist entries."));
		return;
	}
	defaultRuntime.log("");
	defaultRuntime.log(heading("Allowlist"));
	defaultRuntime.log(renderTable({
		width: tableWidth,
		columns: [
			{
				key: "Target",
				header: "Target",
				minWidth: 10
			},
			{
				key: "Agent",
				header: "Agent",
				minWidth: 8
			},
			{
				key: "Pattern",
				header: "Pattern",
				minWidth: 20,
				flex: true
			},
			{
				key: "LastUsed",
				header: "Last Used",
				minWidth: 10
			}
		],
		rows: allowlistRows
	}).trimEnd());
}
async function saveSnapshot(opts, nodeId, file, baseHash) {
	return await callGatewayFromCli(nodeId ? "exec.approvals.node.set" : "exec.approvals.set", opts, nodeId ? {
		nodeId,
		file,
		baseHash
	} : {
		file,
		baseHash
	});
}
function resolveAgentKey(value) {
	const trimmed = value?.trim() ?? "";
	return trimmed ? trimmed : "*";
}
function normalizeAllowlistEntry(entry) {
	const pattern = entry?.pattern?.trim() ?? "";
	return pattern ? pattern : null;
}
function ensureAgent(file, agentKey) {
	const agents = file.agents ?? {};
	const entry = agents[agentKey] ?? {};
	file.agents = agents;
	return entry;
}
function isEmptyAgent(agent) {
	const allowlist = Array.isArray(agent.allowlist) ? agent.allowlist : [];
	return !agent.security && !agent.ask && !agent.askFallback && agent.autoAllowSkills === void 0 && allowlist.length === 0;
}
function registerExecApprovalsCli(program) {
	const formatExample = (cmd, desc) => `  ${theme.command(cmd)}\n    ${theme.muted(desc)}`;
	const approvals = program.command("approvals").alias("exec-approvals").description("Manage exec approvals (gateway or node host)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/approvals", "docs.openclaw.ai/cli/approvals")}\n`);
	nodesCallOpts(approvals.command("get").description("Fetch exec approvals snapshot").option("--node <node>", "Target node id/name/IP").option("--gateway", "Force gateway approvals", false).action(async (opts) => {
		try {
			const { snapshot, nodeId, source } = await loadSnapshotTarget(opts);
			if (opts.json) {
				defaultRuntime.log(JSON.stringify(snapshot));
				return;
			}
			const muted = (text) => isRich() ? theme.muted(text) : text;
			if (source === "local") {
				defaultRuntime.log(muted("Showing local approvals."));
				defaultRuntime.log("");
			}
			renderApprovalsSnapshot(snapshot, source === "local" ? "local" : nodeId ? `node:${nodeId}` : "gateway");
		} catch (err) {
			defaultRuntime.error(formatCliError(err));
			defaultRuntime.exit(1);
		}
	}));
	nodesCallOpts(approvals.command("set").description("Replace exec approvals with a JSON file").option("--node <node>", "Target node id/name/IP").option("--gateway", "Force gateway approvals", false).option("--file <path>", "Path to JSON file to upload").option("--stdin", "Read JSON from stdin", false).action(async (opts) => {
		try {
			if (!opts.file && !opts.stdin) {
				defaultRuntime.error("Provide --file or --stdin.");
				defaultRuntime.exit(1);
				return;
			}
			if (opts.file && opts.stdin) {
				defaultRuntime.error("Use either --file or --stdin (not both).");
				defaultRuntime.exit(1);
				return;
			}
			const { snapshot, nodeId, source } = await loadSnapshotTarget(opts);
			if (source === "local") defaultRuntime.log(theme.muted("Writing local approvals."));
			const targetLabel = source === "local" ? "local" : nodeId ? `node:${nodeId}` : "gateway";
			if (!snapshot.hash) {
				defaultRuntime.error("Exec approvals hash missing; reload and retry.");
				defaultRuntime.exit(1);
				return;
			}
			const raw = opts.stdin ? await readStdin() : await fs.readFile(String(opts.file), "utf8");
			let file;
			try {
				file = JSON5.parse(raw);
			} catch (err) {
				defaultRuntime.error(`Failed to parse approvals JSON: ${String(err)}`);
				defaultRuntime.exit(1);
				return;
			}
			file.version = 1;
			const next = source === "local" ? saveSnapshotLocal(file) : await saveSnapshot(opts, nodeId, file, snapshot.hash);
			if (opts.json) {
				defaultRuntime.log(JSON.stringify(next));
				return;
			}
			defaultRuntime.log(theme.muted(`Target: ${targetLabel}`));
			renderApprovalsSnapshot(next, targetLabel);
		} catch (err) {
			defaultRuntime.error(formatCliError(err));
			defaultRuntime.exit(1);
		}
	}));
	const allowlist = approvals.command("allowlist").description("Edit the per-agent allowlist").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatExample("openclaw approvals allowlist add \"~/Projects/**/bin/rg\"", "Allowlist a local binary pattern for the main agent.")}\n${formatExample("openclaw approvals allowlist add --agent main --node <id|name|ip> \"/usr/bin/uptime\"", "Allowlist on a specific node/agent.")}\n${formatExample("openclaw approvals allowlist add --agent \"*\" \"/usr/bin/uname\"", "Allowlist for all agents (wildcard).")}\n${formatExample("openclaw approvals allowlist remove \"~/Projects/**/bin/rg\"", "Remove an allowlist pattern.")}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/approvals", "docs.openclaw.ai/cli/approvals")}\n`);
	nodesCallOpts(allowlist.command("add <pattern>").description("Add a glob pattern to an allowlist").option("--node <node>", "Target node id/name/IP").option("--gateway", "Force gateway approvals", false).option("--agent <id>", "Agent id (defaults to \"*\")").action(async (pattern, opts) => {
		try {
			const trimmed = pattern.trim();
			if (!trimmed) {
				defaultRuntime.error("Pattern required.");
				defaultRuntime.exit(1);
				return;
			}
			const { snapshot, nodeId, source } = await loadSnapshotTarget(opts);
			if (source === "local") defaultRuntime.log(theme.muted("Writing local approvals."));
			const targetLabel = source === "local" ? "local" : nodeId ? `node:${nodeId}` : "gateway";
			if (!snapshot.hash) {
				defaultRuntime.error("Exec approvals hash missing; reload and retry.");
				defaultRuntime.exit(1);
				return;
			}
			const file = snapshot.file ?? { version: 1 };
			file.version = 1;
			const agentKey = resolveAgentKey(opts.agent);
			const agent = ensureAgent(file, agentKey);
			const allowlistEntries = Array.isArray(agent.allowlist) ? agent.allowlist : [];
			if (allowlistEntries.some((entry) => normalizeAllowlistEntry(entry) === trimmed)) {
				defaultRuntime.log("Already allowlisted.");
				return;
			}
			allowlistEntries.push({
				pattern: trimmed,
				lastUsedAt: Date.now()
			});
			agent.allowlist = allowlistEntries;
			file.agents = {
				...file.agents,
				[agentKey]: agent
			};
			const next = source === "local" ? saveSnapshotLocal(file) : await saveSnapshot(opts, nodeId, file, snapshot.hash);
			if (opts.json) {
				defaultRuntime.log(JSON.stringify(next));
				return;
			}
			defaultRuntime.log(theme.muted(`Target: ${targetLabel}`));
			renderApprovalsSnapshot(next, targetLabel);
		} catch (err) {
			defaultRuntime.error(formatCliError(err));
			defaultRuntime.exit(1);
		}
	}));
	nodesCallOpts(allowlist.command("remove <pattern>").description("Remove a glob pattern from an allowlist").option("--node <node>", "Target node id/name/IP").option("--gateway", "Force gateway approvals", false).option("--agent <id>", "Agent id (defaults to \"*\")").action(async (pattern, opts) => {
		try {
			const trimmed = pattern.trim();
			if (!trimmed) {
				defaultRuntime.error("Pattern required.");
				defaultRuntime.exit(1);
				return;
			}
			const { snapshot, nodeId, source } = await loadSnapshotTarget(opts);
			if (source === "local") defaultRuntime.log(theme.muted("Writing local approvals."));
			const targetLabel = source === "local" ? "local" : nodeId ? `node:${nodeId}` : "gateway";
			if (!snapshot.hash) {
				defaultRuntime.error("Exec approvals hash missing; reload and retry.");
				defaultRuntime.exit(1);
				return;
			}
			const file = snapshot.file ?? { version: 1 };
			file.version = 1;
			const agentKey = resolveAgentKey(opts.agent);
			const agent = ensureAgent(file, agentKey);
			const allowlistEntries = Array.isArray(agent.allowlist) ? agent.allowlist : [];
			const nextEntries = allowlistEntries.filter((entry) => normalizeAllowlistEntry(entry) !== trimmed);
			if (nextEntries.length === allowlistEntries.length) {
				defaultRuntime.log("Pattern not found.");
				return;
			}
			if (nextEntries.length === 0) delete agent.allowlist;
			else agent.allowlist = nextEntries;
			if (isEmptyAgent(agent)) {
				const agents = { ...file.agents };
				delete agents[agentKey];
				file.agents = Object.keys(agents).length > 0 ? agents : void 0;
			} else file.agents = {
				...file.agents,
				[agentKey]: agent
			};
			const next = source === "local" ? saveSnapshotLocal(file) : await saveSnapshot(opts, nodeId, file, snapshot.hash);
			if (opts.json) {
				defaultRuntime.log(JSON.stringify(next));
				return;
			}
			defaultRuntime.log(theme.muted(`Target: ${targetLabel}`));
			renderApprovalsSnapshot(next, targetLabel);
		} catch (err) {
			defaultRuntime.error(formatCliError(err));
			defaultRuntime.exit(1);
		}
	}));
}

//#endregion
export { registerExecApprovalsCli };