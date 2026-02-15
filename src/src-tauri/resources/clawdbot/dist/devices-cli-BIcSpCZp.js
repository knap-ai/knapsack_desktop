import { M as theme, h as defaultRuntime } from "./entry.js";
import "./auth-profiles-DnpV8DWM.js";
import "./utils-q1rHOG-N.js";
import "./exec-B52LZOrO.js";
import "./agent-scope-Bu62UIQZ.js";
import "./github-copilot-token-C4G0wDDt.js";
import "./config-BJWIHf6x.js";
import "./manifest-registry-DlFh5LWe.js";
import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-D-iPIX3C.js";
import "./client-DV6vI7ic.js";
import { n as callGateway } from "./call-FZUZ5EU4.js";
import { n as formatTimeAgo } from "./format-relative-qvxMEk-R.js";
import { n as withProgress } from "./progress-C4IJwa0T.js";
import { t as renderTable } from "./table-DvO2pSzv.js";

//#region src/cli/devices-cli.ts
const devicesCallOpts = (cmd, defaults) => cmd.option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (password auth)").option("--timeout <ms>", "Timeout in ms", String(defaults?.timeoutMs ?? 1e4)).option("--json", "Output JSON", false);
const callGatewayCli = async (method, opts, params) => withProgress({
	label: `Devices ${method}`,
	indeterminate: true,
	enabled: opts.json !== true
}, async () => await callGateway({
	url: opts.url,
	token: opts.token,
	password: opts.password,
	method,
	params,
	timeoutMs: Number(opts.timeout ?? 1e4),
	clientName: GATEWAY_CLIENT_NAMES.CLI,
	mode: GATEWAY_CLIENT_MODES.CLI
}));
function parseDevicePairingList(value) {
	const obj = typeof value === "object" && value !== null ? value : {};
	return {
		pending: Array.isArray(obj.pending) ? obj.pending : [],
		paired: Array.isArray(obj.paired) ? obj.paired : []
	};
}
function formatTokenSummary(tokens) {
	if (!tokens || tokens.length === 0) return "none";
	return tokens.map((t) => `${t.role}${t.revokedAtMs ? " (revoked)" : ""}`).toSorted((a, b) => a.localeCompare(b)).join(", ");
}
function registerDevicesCli(program) {
	const devices = program.command("devices").description("Device pairing and auth tokens");
	devicesCallOpts(devices.command("list").description("List pending and paired devices").action(async (opts) => {
		const list = parseDevicePairingList(await callGatewayCli("device.pair.list", opts, {}));
		if (opts.json) {
			defaultRuntime.log(JSON.stringify(list, null, 2));
			return;
		}
		if (list.pending?.length) {
			const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
			defaultRuntime.log(`${theme.heading("Pending")} ${theme.muted(`(${list.pending.length})`)}`);
			defaultRuntime.log(renderTable({
				width: tableWidth,
				columns: [
					{
						key: "Request",
						header: "Request",
						minWidth: 10
					},
					{
						key: "Device",
						header: "Device",
						minWidth: 16,
						flex: true
					},
					{
						key: "Role",
						header: "Role",
						minWidth: 8
					},
					{
						key: "IP",
						header: "IP",
						minWidth: 12
					},
					{
						key: "Age",
						header: "Age",
						minWidth: 8
					},
					{
						key: "Flags",
						header: "Flags",
						minWidth: 8
					}
				],
				rows: list.pending.map((req) => ({
					Request: req.requestId,
					Device: req.displayName || req.deviceId,
					Role: req.role ?? "",
					IP: req.remoteIp ?? "",
					Age: typeof req.ts === "number" ? formatTimeAgo(Date.now() - req.ts) : "",
					Flags: req.isRepair ? "repair" : ""
				}))
			}).trimEnd());
		}
		if (list.paired?.length) {
			const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
			defaultRuntime.log(`${theme.heading("Paired")} ${theme.muted(`(${list.paired.length})`)}`);
			defaultRuntime.log(renderTable({
				width: tableWidth,
				columns: [
					{
						key: "Device",
						header: "Device",
						minWidth: 16,
						flex: true
					},
					{
						key: "Roles",
						header: "Roles",
						minWidth: 12,
						flex: true
					},
					{
						key: "Scopes",
						header: "Scopes",
						minWidth: 12,
						flex: true
					},
					{
						key: "Tokens",
						header: "Tokens",
						minWidth: 12,
						flex: true
					},
					{
						key: "IP",
						header: "IP",
						minWidth: 12
					}
				],
				rows: list.paired.map((device) => ({
					Device: device.displayName || device.deviceId,
					Roles: device.roles?.length ? device.roles.join(", ") : "",
					Scopes: device.scopes?.length ? device.scopes.join(", ") : "",
					Tokens: formatTokenSummary(device.tokens),
					IP: device.remoteIp ?? ""
				}))
			}).trimEnd());
		}
		if (!list.pending?.length && !list.paired?.length) defaultRuntime.log(theme.muted("No device pairing entries."));
	}));
	devicesCallOpts(devices.command("approve").description("Approve a pending device pairing request").argument("<requestId>", "Pending request id").action(async (requestId, opts) => {
		const result = await callGatewayCli("device.pair.approve", opts, { requestId });
		if (opts.json) {
			defaultRuntime.log(JSON.stringify(result, null, 2));
			return;
		}
		const deviceId = result?.device?.deviceId;
		defaultRuntime.log(`${theme.success("Approved")} ${theme.command(deviceId ?? "ok")}`);
	}));
	devicesCallOpts(devices.command("reject").description("Reject a pending device pairing request").argument("<requestId>", "Pending request id").action(async (requestId, opts) => {
		const result = await callGatewayCli("device.pair.reject", opts, { requestId });
		if (opts.json) {
			defaultRuntime.log(JSON.stringify(result, null, 2));
			return;
		}
		const deviceId = result?.deviceId;
		defaultRuntime.log(`${theme.warn("Rejected")} ${theme.command(deviceId ?? "ok")}`);
	}));
	devicesCallOpts(devices.command("rotate").description("Rotate a device token for a role").requiredOption("--device <id>", "Device id").requiredOption("--role <role>", "Role name").option("--scope <scope...>", "Scopes to attach to the token (repeatable)").action(async (opts) => {
		const deviceId = String(opts.device ?? "").trim();
		const role = String(opts.role ?? "").trim();
		if (!deviceId || !role) {
			defaultRuntime.error("--device and --role required");
			defaultRuntime.exit(1);
			return;
		}
		const result = await callGatewayCli("device.token.rotate", opts, {
			deviceId,
			role,
			scopes: Array.isArray(opts.scope) ? opts.scope : void 0
		});
		defaultRuntime.log(JSON.stringify(result, null, 2));
	}));
	devicesCallOpts(devices.command("revoke").description("Revoke a device token for a role").requiredOption("--device <id>", "Device id").requiredOption("--role <role>", "Role name").action(async (opts) => {
		const deviceId = String(opts.device ?? "").trim();
		const role = String(opts.role ?? "").trim();
		if (!deviceId || !role) {
			defaultRuntime.error("--device and --role required");
			defaultRuntime.exit(1);
			return;
		}
		const result = await callGatewayCli("device.token.revoke", opts, {
			deviceId,
			role
		});
		defaultRuntime.log(JSON.stringify(result, null, 2));
	}));
}

//#endregion
export { registerDevicesCli };