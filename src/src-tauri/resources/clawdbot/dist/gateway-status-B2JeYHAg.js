import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { d as readStringValue, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as writeRuntimeJson } from "./runtime-Dx7oeLYq.js";
import { n as isRich, r as theme, t as colorize } from "./theme-D5sxSdHD.js";
import { u as resolveGatewayPort } from "./paths-Dvv9VRAc.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-CeL3gSMO.js";
import { a as isLoopbackHost } from "./net-lBInRHnX.js";
import { c as readBestEffortConfig } from "./io-5pxHCi7V.js";
import "./config-Q9XZc_2I.js";
import { i as probeGateway } from "./probe-BQKUsIcx.js";
import { t as inspectBestEffortPrimaryTailnetIPv4 } from "./network-discovery-display-CXEbPtF0.js";
import { n as parseTimeoutMsWithFallback } from "./parse-timeout-DQBLjOP7.js";
import { n as withProgress } from "./progress-plFYyayR.js";
import { i as resolveWideAreaDiscoveryDomain } from "./widearea-dns-XF4Yk8dn.js";
import { t as discoverGatewayBeacons } from "./bonjour-discovery-BcNhR4O6.js";
import { n as buildGatewayDiscoveryTarget, r as serializeGatewayDiscoveryBeacon } from "./gateway-discovery-targets-CkH9uXgo.js";
import { n as resolveGatewayProbeSurfaceAuth } from "./auth-surface-resolution-NfdjDJ1J.js";
import { t as pickGatewaySelfPresence } from "./gateway-presence-Cv_3NmBw.js";
//#region src/commands/gateway-status/discovery.ts
function inferSshTargetFromRemoteUrl(rawUrl) {
	if (typeof rawUrl !== "string") return null;
	const trimmed = normalizeOptionalString(rawUrl) ?? "";
	if (!trimmed) return null;
	let host = null;
	try {
		host = new URL(trimmed).hostname || null;
	} catch {
		return null;
	}
	if (!host) return null;
	const user = normalizeOptionalString(process.env.USER) ?? "";
	return user ? `${user}@${host}` : host;
}
function buildSshTarget(input) {
	const host = normalizeOptionalString(input.host) ?? "";
	if (!host) return null;
	const user = normalizeOptionalString(input.user) ?? "";
	const base = user ? `${user}@${host}` : host;
	const port = input.port ?? 22;
	if (port && port !== 22) return `${base}:${port}`;
	return base;
}
async function resolveSshTarget(params) {
	const [{ resolveSshConfig }, { parseSshTarget }] = await Promise.all([params.loadSshConfigModule(), params.loadSshTunnelModule()]);
	const parsed = parseSshTarget(params.rawTarget);
	if (!parsed) return null;
	const config = await resolveSshConfig(parsed, {
		identity: params.identity ?? void 0,
		timeoutMs: Math.min(800, params.overallTimeoutMs)
	});
	if (!config) return {
		target: params.rawTarget,
		identity: params.identity ?? void 0
	};
	const target = buildSshTarget({
		user: config.user ?? parsed.user,
		host: config.host ?? parsed.host,
		port: config.port ?? parsed.port
	});
	if (!target) return {
		target: params.rawTarget,
		identity: params.identity ?? void 0
	};
	return {
		target,
		identity: params.identity ?? config.identityFiles.find((entry) => normalizeOptionalString(entry)) ?? void 0
	};
}
function pickAutoSshTargetFromDiscovery(params) {
	for (const beacon of params.discovery) {
		const sshTarget = buildGatewayDiscoveryTarget(beacon, { sshUser: params.sshUser ?? void 0 }).sshTarget;
		if (!sshTarget) continue;
		if (params.parseSshTarget(sshTarget)) return sshTarget;
	}
	return null;
}
//#endregion
//#region src/commands/gateway-status/helpers.ts
const MISSING_SCOPE_PATTERN = /\bmissing scope:\s*[a-z0-9._-]+/i;
function parseIntOrNull(value) {
	const s = typeof value === "string" ? value.trim() : typeof value === "number" || typeof value === "bigint" ? String(value) : "";
	if (!s) return null;
	const n = Number.parseInt(s, 10);
	return Number.isFinite(n) ? n : null;
}
function parseTimeoutMs(raw, fallbackMs) {
	return parseTimeoutMsWithFallback(raw, fallbackMs);
}
function normalizeWsUrl(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (!trimmed.startsWith("ws://") && !trimmed.startsWith("wss://")) return null;
	return trimmed;
}
function resolveTargets(cfg, explicitUrl) {
	const targets = [];
	const add = (t) => {
		if (!targets.some((x) => x.url === t.url)) targets.push(t);
	};
	const explicit = typeof explicitUrl === "string" ? normalizeWsUrl(explicitUrl) : null;
	if (explicit) add({
		id: "explicit",
		kind: "explicit",
		url: explicit,
		active: true
	});
	const remoteUrl = typeof cfg.gateway?.remote?.url === "string" ? normalizeWsUrl(cfg.gateway.remote.url) : null;
	if (remoteUrl) add({
		id: "configRemote",
		kind: "configRemote",
		url: remoteUrl,
		active: cfg.gateway?.mode === "remote"
	});
	const port = resolveGatewayPort(cfg);
	add({
		id: "localLoopback",
		kind: "localLoopback",
		url: `${cfg.gateway?.tls?.enabled === true ? "wss" : "ws"}://127.0.0.1:${port}`,
		active: cfg.gateway?.mode !== "remote"
	});
	return targets;
}
function isLoopbackProbeTarget(target) {
	if (target.kind === "localLoopback") return true;
	try {
		return isLoopbackHost(new URL(target.url).hostname);
	} catch {
		return false;
	}
}
function resolveProbeBudgetMs(overallMs, target) {
	if (target.kind === "sshTunnel") return Math.min(2e3, overallMs);
	if (!isLoopbackProbeTarget(target)) return Math.min(1500, overallMs);
	if (target.kind === "localLoopback" && !target.active) return Math.min(800, overallMs);
	return overallMs;
}
function sanitizeSshTarget(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	return trimmed.replace(/^ssh\\s+/, "");
}
async function resolveAuthForTarget(cfg, target, overrides) {
	const tokenOverride = normalizeOptionalString(overrides.token);
	const passwordOverride = normalizeOptionalString(overrides.password);
	if (tokenOverride || passwordOverride) return {
		token: tokenOverride,
		password: passwordOverride
	};
	return resolveGatewayProbeSurfaceAuth({
		config: cfg,
		surface: target.kind === "configRemote" || target.kind === "sshTunnel" ? "remote" : "local"
	});
}
function extractConfigSummary(snapshotUnknown) {
	const snap = snapshotUnknown;
	const path = typeof snap?.path === "string" ? snap.path : null;
	const exists = Boolean(snap?.exists);
	const valid = Boolean(snap?.valid);
	const issuesRaw = Array.isArray(snap?.issues) ? snap.issues : [];
	const legacyRaw = Array.isArray(snap?.legacyIssues) ? snap.legacyIssues : [];
	const cfg = snap?.config ?? {};
	const gateway = cfg.gateway ?? {};
	const secretDefaults = (cfg.secrets ?? {}).defaults ?? void 0;
	const wideArea = (cfg.discovery ?? {}).wideArea ?? {};
	const remote = gateway.remote ?? {};
	const auth = gateway.auth ?? {};
	const controlUi = gateway.controlUi ?? {};
	const tailscale = gateway.tailscale ?? {};
	const authMode = typeof auth.mode === "string" ? auth.mode : null;
	const authTokenConfigured = hasConfiguredSecretInput(auth.token, secretDefaults);
	const authPasswordConfigured = hasConfiguredSecretInput(auth.password, secretDefaults);
	const remoteUrl = typeof remote.url === "string" ? normalizeWsUrl(remote.url) : null;
	const remoteTokenConfigured = hasConfiguredSecretInput(remote.token, secretDefaults);
	const remotePasswordConfigured = hasConfiguredSecretInput(remote.password, secretDefaults);
	const wideAreaEnabled = typeof wideArea.enabled === "boolean" ? wideArea.enabled : null;
	return {
		path,
		exists,
		valid,
		issues: issuesRaw.filter((i) => i && typeof i.path === "string" && typeof i.message === "string").map((i) => ({
			path: i.path,
			message: i.message
		})),
		legacyIssues: legacyRaw.filter((i) => i && typeof i.path === "string" && typeof i.message === "string").map((i) => ({
			path: i.path,
			message: i.message
		})),
		gateway: {
			mode: typeof gateway.mode === "string" ? gateway.mode : null,
			bind: typeof gateway.bind === "string" ? gateway.bind : null,
			port: parseIntOrNull(gateway.port),
			controlUiEnabled: typeof controlUi.enabled === "boolean" ? controlUi.enabled : null,
			controlUiBasePath: typeof controlUi.basePath === "string" ? controlUi.basePath : null,
			authMode,
			authTokenConfigured,
			authPasswordConfigured,
			remoteUrl,
			remoteTokenConfigured,
			remotePasswordConfigured,
			tailscaleMode: typeof tailscale.mode === "string" ? tailscale.mode : null
		},
		discovery: { wideAreaEnabled }
	};
}
function buildNetworkHints(cfg) {
	const { tailnetIPv4 } = inspectBestEffortPrimaryTailnetIPv4();
	const port = resolveGatewayPort(cfg);
	const localScheme = cfg.gateway?.tls?.enabled === true ? "wss" : "ws";
	return {
		localLoopbackUrl: `${localScheme}://127.0.0.1:${port}`,
		localTailnetUrl: tailnetIPv4 ? `${localScheme}://${tailnetIPv4}:${port}` : null,
		tailnetIPv4: tailnetIPv4 ?? null
	};
}
function renderTargetHeader(target, rich) {
	const kindLabel = target.kind === "localLoopback" ? "Local loopback" : target.kind === "sshTunnel" ? "Remote over SSH" : target.kind === "configRemote" ? target.active ? "Remote (configured)" : "Remote (configured, inactive)" : "URL (explicit)";
	return `${colorize(rich, theme.heading, kindLabel)} ${colorize(rich, theme.muted, target.url)}`;
}
function isScopeLimitedProbeFailure(probe) {
	if (probe.ok || probe.connectLatencyMs == null) return false;
	return MISSING_SCOPE_PATTERN.test(probe.error ?? "");
}
function isProbeReachable(probe) {
	return probe.ok || isScopeLimitedProbeFailure(probe);
}
function renderProbeSummaryLine(probe, rich) {
	if (probe.ok) {
		const latency = typeof probe.connectLatencyMs === "number" ? `${probe.connectLatencyMs}ms` : "unknown";
		return `${colorize(rich, theme.success, "Connect: ok")} (${latency}) · ${colorize(rich, theme.success, "RPC: ok")}`;
	}
	const detail = probe.error ? ` - ${probe.error}` : "";
	if (probe.connectLatencyMs != null) {
		const latency = typeof probe.connectLatencyMs === "number" ? `${probe.connectLatencyMs}ms` : "unknown";
		const rpcStatus = isScopeLimitedProbeFailure(probe) ? colorize(rich, theme.warn, "RPC: limited") : colorize(rich, theme.error, "RPC: failed");
		return `${colorize(rich, theme.success, "Connect: ok")} (${latency}) · ${rpcStatus}${detail}`;
	}
	return `${colorize(rich, theme.error, "Connect: failed")}${detail}`;
}
//#endregion
//#region src/commands/gateway-status/output.ts
function pickPrimaryProbedTarget(probed) {
	const reachable = probed.filter((entry) => isProbeReachable(entry.probe));
	return reachable.find((entry) => entry.target.kind === "explicit") ?? reachable.find((entry) => entry.target.kind === "sshTunnel") ?? reachable.find((entry) => entry.target.kind === "configRemote") ?? reachable.find((entry) => entry.target.kind === "localLoopback") ?? null;
}
function buildGatewayStatusWarnings(params) {
	const reachable = params.probed.filter((entry) => isProbeReachable(entry.probe));
	const degradedScopeLimited = params.probed.filter((entry) => isScopeLimitedProbeFailure(entry.probe));
	const warnings = [];
	if (params.sshTarget && !params.sshTunnelStarted) warnings.push({
		code: "ssh_tunnel_failed",
		message: params.sshTunnelError ? `SSH tunnel failed: ${params.sshTunnelError}` : "SSH tunnel failed to start; falling back to direct probes."
	});
	if (params.localTlsLoadError) warnings.push({
		code: "local_tls_runtime_unavailable",
		message: `Local gateway TLS is enabled but OpenClaw could not load the local certificate fingerprint: ${params.localTlsLoadError}`,
		targetIds: ["localLoopback"]
	});
	if (reachable.length > 1) warnings.push({
		code: "multiple_gateways",
		message: "Unconventional setup: multiple reachable gateways detected. Usually one gateway per network is recommended unless you intentionally run isolated profiles, like a rescue bot (see docs: /gateway#multiple-gateways-same-host).",
		targetIds: reachable.map((entry) => entry.target.id)
	});
	for (const result of params.probed) {
		if (result.authDiagnostics.length === 0 || isProbeReachable(result.probe)) continue;
		for (const diagnostic of result.authDiagnostics) warnings.push({
			code: "auth_secretref_unresolved",
			message: diagnostic,
			targetIds: [result.target.id]
		});
	}
	for (const result of degradedScopeLimited) warnings.push({
		code: "probe_scope_limited",
		message: "Probe diagnostics are limited by gateway scopes (missing operator.read). Connection succeeded, but status details may be incomplete. Hint: pair device identity or use credentials with operator.read.",
		targetIds: [result.target.id]
	});
	return warnings;
}
function writeGatewayStatusJson(params) {
	const reachable = params.probed.filter((entry) => isProbeReachable(entry.probe));
	const degraded = params.probed.some((entry) => isScopeLimitedProbeFailure(entry.probe));
	writeRuntimeJson(params.runtime, {
		ok: reachable.length > 0,
		degraded,
		ts: Date.now(),
		durationMs: Date.now() - params.startedAt,
		timeoutMs: params.overallTimeoutMs,
		primaryTargetId: params.primaryTargetId,
		warnings: params.warnings,
		network: params.network,
		discovery: {
			timeoutMs: params.discoveryTimeoutMs,
			count: params.discovery.length,
			beacons: params.discovery.map((beacon) => serializeGatewayDiscoveryBeacon(beacon))
		},
		targets: params.probed.map((entry) => ({
			id: entry.target.id,
			kind: entry.target.kind,
			url: entry.target.url,
			active: entry.target.active,
			tunnel: entry.target.tunnel ?? null,
			connect: {
				ok: isProbeReachable(entry.probe),
				rpcOk: entry.probe.ok,
				scopeLimited: isScopeLimitedProbeFailure(entry.probe),
				latencyMs: entry.probe.connectLatencyMs,
				error: entry.probe.error,
				close: entry.probe.close
			},
			self: entry.self,
			config: entry.configSummary,
			health: entry.probe.health,
			summary: entry.probe.status,
			presence: entry.probe.presence
		}))
	});
	if (reachable.length === 0) params.runtime.exit(1);
}
function writeGatewayStatusText(params) {
	const ok = params.probed.filter((entry) => isProbeReachable(entry.probe)).length > 0;
	params.runtime.log(colorize(params.rich, theme.heading, "Gateway Status"));
	params.runtime.log(ok ? `${colorize(params.rich, theme.success, "Reachable")}: yes` : `${colorize(params.rich, theme.error, "Reachable")}: no`);
	params.runtime.log(colorize(params.rich, theme.muted, `Probe budget: ${params.overallTimeoutMs}ms`));
	if (params.warnings.length > 0) {
		params.runtime.log("");
		params.runtime.log(colorize(params.rich, theme.warn, "Warning:"));
		for (const warning of params.warnings) params.runtime.log(`- ${warning.message}`);
	}
	params.runtime.log("");
	params.runtime.log(colorize(params.rich, theme.heading, "Discovery (this machine)"));
	const discoveryDomains = params.wideAreaDomain ? `local. + ${params.wideAreaDomain}` : "local.";
	params.runtime.log(params.discovery.length > 0 ? `Found ${params.discovery.length} gateway(s) via Bonjour (${discoveryDomains})` : `Found 0 gateways via Bonjour (${discoveryDomains})`);
	if (params.discovery.length === 0) params.runtime.log(colorize(params.rich, theme.muted, "Tip: if the gateway is remote, mDNS won’t cross networks; use Wide-Area Bonjour (split DNS) or SSH tunnels."));
	params.runtime.log("");
	params.runtime.log(colorize(params.rich, theme.heading, "Targets"));
	for (const result of params.probed) {
		params.runtime.log(renderTargetHeader(result.target, params.rich));
		params.runtime.log(`  ${renderProbeSummaryLine(result.probe, params.rich)}`);
		if (result.target.tunnel?.kind === "ssh") params.runtime.log(`  ${colorize(params.rich, theme.muted, "ssh")}: ${colorize(params.rich, theme.command, result.target.tunnel.target)}`);
		if (result.probe.ok && result.self) {
			const host = result.self.host ?? "unknown";
			const ip = result.self.ip ? ` (${result.self.ip})` : "";
			const platform = result.self.platform ? ` · ${result.self.platform}` : "";
			const version = result.self.version ? ` · app ${result.self.version}` : "";
			params.runtime.log(`  ${colorize(params.rich, theme.info, "Gateway")}: ${host}${ip}${platform}${version}`);
		}
		if (result.configSummary) {
			const wideArea = result.configSummary.discovery.wideAreaEnabled === true ? "enabled" : result.configSummary.discovery.wideAreaEnabled === false ? "disabled" : "unknown";
			params.runtime.log(`  ${colorize(params.rich, theme.info, "Wide-area discovery")}: ${wideArea}`);
		}
		params.runtime.log("");
	}
	if (!ok) params.runtime.exit(1);
}
//#endregion
//#region src/commands/gateway-status/probe-run.ts
async function runGatewayStatusProbePass(params) {
	const discoveryPromise = discoverGatewayBeacons({
		timeoutMs: params.discoveryTimeoutMs,
		wideAreaDomain: params.wideAreaDomain
	});
	let sshTarget = params.sshTarget;
	let sshTunnelError = null;
	let sshTunnelStarted = false;
	const tryStartTunnel = async () => {
		if (!sshTarget) return null;
		try {
			const { startSshPortForward } = await params.loadSshTunnelModule();
			const tunnel = await startSshPortForward({
				target: sshTarget,
				identity: params.sshIdentity ?? void 0,
				localPortPreferred: params.remotePort,
				remotePort: params.remotePort,
				timeoutMs: Math.min(1500, params.overallTimeoutMs)
			});
			sshTunnelStarted = true;
			return tunnel;
		} catch (err) {
			sshTunnelError = formatErrorMessage(err);
			return null;
		}
	};
	const discoveryTask = discoveryPromise.catch(() => []);
	const tunnelTask = sshTarget ? tryStartTunnel() : Promise.resolve(null);
	const [discovery, tunnelFirst] = await Promise.all([discoveryTask, tunnelTask]);
	if (!sshTarget && params.opts.sshAuto) {
		const { parseSshTarget } = await params.loadSshTunnelModule();
		sshTarget = pickAutoSshTargetFromDiscovery({
			discovery,
			parseSshTarget,
			sshUser: normalizeOptionalString(process.env.USER) ?? ""
		});
	}
	const tunnel = tunnelFirst || (sshTarget && !sshTunnelStarted && !sshTunnelError ? await tryStartTunnel() : null);
	const tunnelTarget = tunnel ? {
		id: "sshTunnel",
		kind: "sshTunnel",
		url: `ws://127.0.0.1:${tunnel.localPort}`,
		active: true,
		tunnel: {
			kind: "ssh",
			target: sshTarget ?? "",
			localPort: tunnel.localPort,
			remotePort: params.remotePort,
			pid: tunnel.pid
		}
	} : null;
	const targets = tunnelTarget ? [tunnelTarget, ...params.baseTargets.filter((target) => target.url !== tunnelTarget.url)] : params.baseTargets;
	try {
		return {
			discovery,
			probed: await Promise.all(targets.map(async (target) => {
				const authResolution = await resolveAuthForTarget(params.cfg, target, {
					token: readStringValue(params.opts.token),
					password: readStringValue(params.opts.password)
				});
				const probe = await probeGateway({
					url: target.url,
					auth: {
						token: authResolution.token,
						password: authResolution.password
					},
					tlsFingerprint: target.kind === "localLoopback" && target.url.startsWith("wss://") ? params.localTlsFingerprint : void 0,
					timeoutMs: resolveProbeBudgetMs(params.overallTimeoutMs, target)
				});
				return {
					target,
					probe,
					configSummary: probe.configSnapshot ? extractConfigSummary(probe.configSnapshot) : null,
					self: pickGatewaySelfPresence(probe.presence),
					authDiagnostics: authResolution.diagnostics ?? []
				};
			})),
			sshTarget,
			sshTunnelStarted,
			sshTunnelError
		};
	} finally {
		if (tunnel) try {
			await tunnel.stop();
		} catch {}
	}
}
//#endregion
//#region src/commands/gateway-status.ts
let sshConfigModulePromise;
let sshTunnelModulePromise;
let gatewayTlsModulePromise;
function loadSshConfigModule() {
	sshConfigModulePromise ??= import("./ssh-config-BYIEDja_.js");
	return sshConfigModulePromise;
}
function loadSshTunnelModule() {
	sshTunnelModulePromise ??= import("./ssh-tunnel-C5-ACeMd.js");
	return sshTunnelModulePromise;
}
function loadGatewayTlsModule() {
	gatewayTlsModulePromise ??= import("./gateway-CkoBK47E.js");
	return gatewayTlsModulePromise;
}
async function gatewayStatusCommand(opts, runtime) {
	const startedAt = Date.now();
	const cfg = await readBestEffortConfig();
	const rich = isRich() && opts.json !== true;
	const overallTimeoutMs = parseTimeoutMs(opts.timeout, 3e3);
	const wideAreaDomain = resolveWideAreaDiscoveryDomain({ configDomain: cfg.discovery?.wideArea?.domain });
	const baseTargets = resolveTargets(cfg, opts.url);
	const network = buildNetworkHints(cfg);
	const remotePort = resolveGatewayPort(cfg);
	const discoveryTimeoutMs = Math.min(1200, overallTimeoutMs);
	let sshTarget = sanitizeSshTarget(opts.ssh) ?? sanitizeSshTarget(cfg.gateway?.remote?.sshTarget);
	let sshIdentity = sanitizeSshTarget(opts.sshIdentity) ?? sanitizeSshTarget(cfg.gateway?.remote?.sshIdentity);
	if (!sshTarget) sshTarget = inferSshTargetFromRemoteUrl(cfg.gateway?.remote?.url);
	if (sshTarget) {
		const resolved = await resolveSshTarget({
			rawTarget: sshTarget,
			identity: sshIdentity,
			overallTimeoutMs,
			loadSshConfigModule,
			loadSshTunnelModule
		});
		if (resolved) {
			sshTarget = resolved.target;
			if (!sshIdentity && resolved.identity) sshIdentity = resolved.identity;
		}
	}
	const localTlsRuntime = cfg.gateway?.tls?.enabled === true ? await loadGatewayTlsModule().then(({ loadGatewayTlsRuntime }) => loadGatewayTlsRuntime(cfg.gateway?.tls)) : void 0;
	const probePass = await withProgress({
		label: "Inspecting gateways…",
		indeterminate: true,
		enabled: opts.json !== true
	}, async () => await runGatewayStatusProbePass({
		cfg,
		opts,
		overallTimeoutMs,
		discoveryTimeoutMs,
		wideAreaDomain,
		baseTargets,
		remotePort,
		sshTarget,
		sshIdentity,
		loadSshTunnelModule,
		localTlsFingerprint: localTlsRuntime?.enabled ? localTlsRuntime.fingerprintSha256 : void 0
	}));
	const warnings = buildGatewayStatusWarnings({
		probed: probePass.probed,
		sshTarget: probePass.sshTarget,
		sshTunnelStarted: probePass.sshTunnelStarted,
		sshTunnelError: probePass.sshTunnelError,
		localTlsLoadError: localTlsRuntime && !localTlsRuntime.enabled && localTlsRuntime.required ? localTlsRuntime.error ?? "gateway tls is enabled but local TLS runtime could not load" : null
	});
	const primary = pickPrimaryProbedTarget(probePass.probed);
	if (opts.json) {
		writeGatewayStatusJson({
			runtime,
			startedAt,
			overallTimeoutMs,
			discoveryTimeoutMs,
			network,
			discovery: probePass.discovery,
			probed: probePass.probed,
			warnings,
			primaryTargetId: primary?.target.id ?? null
		});
		return;
	}
	writeGatewayStatusText({
		runtime,
		rich,
		overallTimeoutMs,
		wideAreaDomain,
		discovery: probePass.discovery,
		probed: probePass.probed,
		warnings
	});
}
//#endregion
export { gatewayStatusCommand };
