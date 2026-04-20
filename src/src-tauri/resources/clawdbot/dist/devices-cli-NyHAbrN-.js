import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString, u as normalizeStringifiedOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { r as theme } from "./theme-D5sxSdHD.js";
import { a as isLoopbackHost } from "./net-lBInRHnX.js";
import { g as GATEWAY_CLIENT_NAMES, h as GATEWAY_CLIENT_MODES } from "./message-channel-CBqCPFa_.js";
import { n as buildGatewayConnectionDetails, r as callGateway } from "./call-BA3do6C0.js";
import { n as formatTimeAgo } from "./format-relative-BErnCbgi.js";
import { n as withProgress } from "./progress-plFYyayR.js";
import { c as listDevicePairing, h as summarizeDeviceTokens, i as formatDevicePairingForbiddenMessage, n as approveDevicePairing } from "./device-pairing-CItl9tqB.js";
import { n as renderTable, t as getTerminalTableWidth } from "./table-DnK0gew0.js";
//#region src/cli/devices-cli.ts
const FALLBACK_NOTICE = "Direct scope access failed; using local fallback.";
const DEFAULT_DEVICES_TIMEOUT_MS = 1e4;
const devicesCallOpts = (cmd, defaults) => cmd.option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (password auth)").option("--timeout <ms>", "Timeout in ms", String(defaults?.timeoutMs ?? DEFAULT_DEVICES_TIMEOUT_MS)).option("--json", "Output JSON", false);
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
	timeoutMs: Number(opts.timeout ?? DEFAULT_DEVICES_TIMEOUT_MS),
	clientName: GATEWAY_CLIENT_NAMES.CLI,
	mode: GATEWAY_CLIENT_MODES.CLI
}));
function normalizeErrorMessage(error) {
	if (error instanceof Error) return error.message;
	return String(error);
}
function shouldUseLocalPairingFallback(opts, error) {
	if (!normalizeLowercaseStringOrEmpty(normalizeErrorMessage(error)).includes("pairing required")) return false;
	if (typeof opts.url === "string" && opts.url.trim().length > 0) return false;
	const connection = buildGatewayConnectionDetails();
	if (connection.urlSource !== "local loopback") return false;
	try {
		return isLoopbackHost(new URL(connection.url).hostname);
	} catch {
		return false;
	}
}
function redactLocalPairedDevice(device) {
	const { tokens, ...rest } = device;
	return {
		...rest,
		tokens: summarizeDeviceTokens(tokens)
	};
}
async function listPairingWithFallback(opts) {
	try {
		return parseDevicePairingList(await callGatewayCli("device.pair.list", opts, {}));
	} catch (error) {
		if (!shouldUseLocalPairingFallback(opts, error)) throw error;
		if (opts.json !== true) defaultRuntime.log(theme.warn(FALLBACK_NOTICE));
		const local = await listDevicePairing();
		return {
			pending: local.pending,
			paired: local.paired.map((device) => redactLocalPairedDevice(device))
		};
	}
}
async function approvePairingWithFallback(opts, requestId) {
	try {
		return await callGatewayCli("device.pair.approve", opts, { requestId });
	} catch (error) {
		if (!shouldUseLocalPairingFallback(opts, error)) throw error;
		if (opts.json !== true) defaultRuntime.log(theme.warn(FALLBACK_NOTICE));
		const approved = await approveDevicePairing(requestId, { callerScopes: ["operator.admin"] });
		if (!approved) return null;
		if (approved.status === "forbidden") throw new Error(formatDevicePairingForbiddenMessage(approved), { cause: error });
		return {
			requestId,
			device: redactLocalPairedDevice(approved.device)
		};
	}
}
function parseDevicePairingList(value) {
	const obj = typeof value === "object" && value !== null ? value : {};
	return {
		pending: Array.isArray(obj.pending) ? obj.pending : [],
		paired: Array.isArray(obj.paired) ? obj.paired : []
	};
}
function selectLatestPendingRequest(pending) {
	if (!pending?.length) return null;
	return pending.reduce((latest, current) => {
		const latestTs = typeof latest.ts === "number" ? latest.ts : 0;
		return (typeof current.ts === "number" ? current.ts : 0) > latestTs ? current : latest;
	});
}
function formatTokenSummary(tokens) {
	if (!tokens || tokens.length === 0) return "none";
	return tokens.map((t) => `${t.role}${t.revokedAtMs ? " (revoked)" : ""}`).toSorted((a, b) => a.localeCompare(b)).join(", ");
}
function formatPendingRoles(request) {
	const role = normalizeOptionalString(request.role) ?? "";
	if (role) return role;
	const roles = Array.isArray(request.roles) ? request.roles.map((item) => item.trim()).filter((item) => item.length > 0) : [];
	if (roles.length === 0) return "";
	return roles.join(", ");
}
function formatPendingScopes(request) {
	const scopes = Array.isArray(request.scopes) ? request.scopes.map((item) => item.trim()).filter((item) => item.length > 0) : [];
	if (scopes.length === 0) return "";
	return scopes.join(", ");
}
function formatPendingDeviceIdentity(request) {
	return normalizeOptionalString(request.displayName) ?? request.deviceId;
}
function quoteCliArg(value) {
	if (/^[A-Za-z0-9_/:=.,@%+-]+$/.test(value)) return value;
	return `'${value.replaceAll("'", "'\\''")}'`;
}
function buildExplicitApproveCommand(opts, requestId) {
	const args = [
		"openclaw",
		"devices",
		"approve",
		requestId
	];
	const url = normalizeOptionalString(opts.url);
	if (url) args.push("--url", url);
	const timeout = normalizeOptionalString(opts.timeout);
	if (timeout && timeout !== String(DEFAULT_DEVICES_TIMEOUT_MS)) args.push("--timeout", timeout);
	if (opts.json === true) args.push("--json");
	return args.map(quoteCliArg).join(" ");
}
function formatAuthFlagReminder(opts) {
	const flags = [];
	if (normalizeOptionalString(opts.token)) flags.push("--token");
	if (normalizeOptionalString(opts.password)) flags.push("--password");
	if (flags.length === 0) return "";
	return `Reuse the same ${flags.join("/")} option${flags.length === 1 ? "" : "s"} when rerunning.`;
}
function resolveRequiredDeviceRole(opts) {
	const deviceId = normalizeStringifiedOptionalString(opts.device) ?? "";
	const role = normalizeStringifiedOptionalString(opts.role) ?? "";
	if (deviceId && role) return {
		deviceId,
		role
	};
	defaultRuntime.error("--device and --role required");
	defaultRuntime.exit(1);
	return null;
}
function registerDevicesCli(program) {
	const devices = program.command("devices").description("Device pairing and auth tokens");
	devicesCallOpts(devices.command("list").description("List pending and paired devices").action(async (opts) => {
		const list = await listPairingWithFallback(opts);
		if (opts.json) {
			defaultRuntime.writeJson(list);
			return;
		}
		if (list.pending?.length) {
			const tableWidth = getTerminalTableWidth();
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
						key: "Scopes",
						header: "Scopes",
						minWidth: 14,
						flex: true
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
					Role: formatPendingRoles(req),
					Scopes: formatPendingScopes(req),
					IP: req.remoteIp ?? "",
					Age: typeof req.ts === "number" ? formatTimeAgo(Date.now() - req.ts) : "",
					Flags: req.isRepair ? "repair" : ""
				}))
			}).trimEnd());
		}
		if (list.paired?.length) {
			const tableWidth = getTerminalTableWidth();
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
	devicesCallOpts(devices.command("remove").description("Remove a paired device entry").argument("<deviceId>", "Paired device id").action(async (deviceId, opts) => {
		const trimmed = deviceId.trim();
		if (!trimmed) {
			defaultRuntime.error("deviceId is required");
			defaultRuntime.exit(1);
			return;
		}
		const result = await callGatewayCli("device.pair.remove", opts, { deviceId: trimmed });
		if (opts.json) {
			defaultRuntime.writeJson(result);
			return;
		}
		defaultRuntime.log(`${theme.warn("Removed")} ${theme.command(trimmed)}`);
	}));
	devicesCallOpts(devices.command("clear").description("Clear paired devices from the gateway table").option("--pending", "Also reject all pending pairing requests", false).option("--yes", "Confirm destructive clear", false).action(async (opts) => {
		if (!opts.yes) {
			defaultRuntime.error("Refusing to clear pairing table without --yes");
			defaultRuntime.exit(1);
			return;
		}
		const list = parseDevicePairingList(await callGatewayCli("device.pair.list", opts, {}));
		const removedDeviceIds = [];
		const rejectedRequestIds = [];
		const paired = Array.isArray(list.paired) ? list.paired : [];
		for (const device of paired) {
			const deviceId = normalizeOptionalString(device.deviceId) ?? "";
			if (!deviceId) continue;
			await callGatewayCli("device.pair.remove", opts, { deviceId });
			removedDeviceIds.push(deviceId);
		}
		if (opts.pending) {
			const pending = Array.isArray(list.pending) ? list.pending : [];
			for (const req of pending) {
				const requestId = normalizeOptionalString(req.requestId) ?? "";
				if (!requestId) continue;
				await callGatewayCli("device.pair.reject", opts, { requestId });
				rejectedRequestIds.push(requestId);
			}
		}
		if (opts.json) {
			defaultRuntime.writeJson({
				removedDevices: removedDeviceIds,
				rejectedPending: rejectedRequestIds
			});
			return;
		}
		defaultRuntime.log(`${theme.warn("Cleared")} ${removedDeviceIds.length} paired device${removedDeviceIds.length === 1 ? "" : "s"}`);
		if (opts.pending) defaultRuntime.log(`${theme.warn("Rejected")} ${rejectedRequestIds.length} pending request${rejectedRequestIds.length === 1 ? "" : "s"}`);
	}));
	devicesCallOpts(devices.command("approve").description("Approve a pending device pairing request").argument("[requestId]", "Pending request id").option("--latest", "Show the most recent pending request to approve explicitly", false).action(async (requestId, opts) => {
		let resolvedRequestId = requestId?.trim();
		const usingImplicitSelection = !resolvedRequestId || Boolean(opts.latest);
		let selectedRequest = null;
		if (usingImplicitSelection) {
			selectedRequest = selectLatestPendingRequest((await listPairingWithFallback(opts)).pending);
			resolvedRequestId = selectedRequest?.requestId?.trim();
		}
		if (!resolvedRequestId) {
			defaultRuntime.error("No pending device pairing requests to approve");
			defaultRuntime.exit(1);
			return;
		}
		if (usingImplicitSelection) {
			const req = selectedRequest;
			const approveCommand = buildExplicitApproveCommand(opts, req.requestId);
			const authReminder = formatAuthFlagReminder(opts);
			if (opts.json) {
				defaultRuntime.writeJson({
					selected: req,
					approveCommand,
					requiresAuthFlags: {
						token: Boolean(normalizeOptionalString(opts.token)),
						password: Boolean(normalizeOptionalString(opts.password))
					}
				});
				defaultRuntime.exit(1);
				return;
			}
			defaultRuntime.log(`${theme.warn("Selected pending device request")} ${theme.command(req.requestId)}`);
			defaultRuntime.log(`  Device: ${formatPendingDeviceIdentity(req)}`);
			const role = formatPendingRoles(req);
			if (role) defaultRuntime.log(`  Role:   ${role}`);
			const scopes = formatPendingScopes(req);
			if (scopes) defaultRuntime.log(`  Scopes: ${scopes}`);
			if (req.remoteIp) defaultRuntime.log(`  IP:     ${req.remoteIp}`);
			defaultRuntime.error(`Approve this exact request with: ${approveCommand}`);
			if (authReminder) defaultRuntime.error(authReminder);
			defaultRuntime.exit(1);
			return;
		}
		const result = await approvePairingWithFallback(opts, resolvedRequestId);
		if (!result) {
			defaultRuntime.error("unknown requestId");
			defaultRuntime.exit(1);
			return;
		}
		if (opts.json) {
			defaultRuntime.writeJson(result);
			return;
		}
		const deviceId = result?.device?.deviceId;
		defaultRuntime.log(`${theme.success("Approved")} ${theme.command(deviceId ?? "ok")} ${theme.muted(`(${resolvedRequestId})`)}`);
	}));
	devicesCallOpts(devices.command("reject").description("Reject a pending device pairing request").argument("<requestId>", "Pending request id").action(async (requestId, opts) => {
		const result = await callGatewayCli("device.pair.reject", opts, { requestId });
		if (opts.json) {
			defaultRuntime.writeJson(result);
			return;
		}
		const deviceId = result?.deviceId;
		defaultRuntime.log(`${theme.warn("Rejected")} ${theme.command(deviceId ?? "ok")}`);
	}));
	devicesCallOpts(devices.command("rotate").description("Rotate a device token for a role").requiredOption("--device <id>", "Device id").requiredOption("--role <role>", "Role name").option("--scope <scope...>", "Scopes to attach to the token (repeatable)").action(async (opts) => {
		const required = resolveRequiredDeviceRole(opts);
		if (!required) return;
		const result = await callGatewayCli("device.token.rotate", opts, {
			deviceId: required.deviceId,
			role: required.role,
			scopes: Array.isArray(opts.scope) ? opts.scope : void 0
		});
		defaultRuntime.writeJson(result);
	}));
	devicesCallOpts(devices.command("revoke").description("Revoke a device token for a role").requiredOption("--device <id>", "Device id").requiredOption("--role <role>", "Role name").action(async (opts) => {
		const required = resolveRequiredDeviceRole(opts);
		if (!required) return;
		const result = await callGatewayCli("device.token.revoke", opts, {
			deviceId: required.deviceId,
			role: required.role
		});
		defaultRuntime.writeJson(result);
	}));
}
//#endregion
export { registerDevicesCli };
