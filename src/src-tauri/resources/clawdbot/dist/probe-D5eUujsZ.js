import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { n as withProgress } from "./progress-CmC4nq1O.js";
//#region src/cli/daemon-cli/probe.ts
let probeGatewayModulePromise;
async function loadProbeGatewayModule() {
	probeGatewayModulePromise ??= import("./probe-B_5x5xHD.js");
	return await probeGatewayModulePromise;
}
function resolveProbeFailureMessage(result) {
	const closeHint = result.close ? `gateway closed (${result.close.code}): ${result.close.reason}` : null;
	if (closeHint && (!result.error || result.error === "timeout")) return closeHint;
	return result.error ?? closeHint ?? "gateway probe failed";
}
async function probeGatewayStatus(opts) {
	const kind = opts.requireRpc ? "read" : "connect";
	try {
		const result = await withProgress({
			label: "Checking gateway status...",
			indeterminate: true,
			enabled: opts.json !== true
		}, async () => {
			const { probeGateway } = await loadProbeGatewayModule();
			const probeOpts = {
				url: opts.url,
				auth: {
					token: opts.token,
					password: opts.password
				},
				tlsFingerprint: opts.tlsFingerprint,
				timeoutMs: opts.timeoutMs,
				includeDetails: false
			};
			if (opts.requireRpc) {
				const { callGateway } = await import("./call-DH9e33Y7.js");
				await callGateway({
					url: opts.url,
					token: opts.token,
					password: opts.password,
					tlsFingerprint: opts.tlsFingerprint,
					method: "status",
					timeoutMs: opts.timeoutMs,
					...opts.configPath ? { configPath: opts.configPath } : {}
				});
				return {
					ok: true,
					authProbe: await probeGateway(probeOpts).catch(() => null)
				};
			}
			return await probeGateway(probeOpts);
		});
		const auth = "auth" in result ? result.auth : result.authProbe?.auth;
		if (result.ok) return {
			ok: true,
			kind,
			capability: kind === "read" ? auth?.capability && auth.capability !== "unknown" ? auth.capability : "read_only" : auth?.capability,
			auth
		};
		return {
			ok: false,
			kind,
			capability: auth?.capability,
			auth,
			error: resolveProbeFailureMessage(result)
		};
	} catch (err) {
		return {
			ok: false,
			kind,
			error: formatErrorMessage(err)
		};
	}
}
//#endregion
export { probeGatewayStatus };
