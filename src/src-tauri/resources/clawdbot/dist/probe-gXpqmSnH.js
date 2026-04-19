import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { n as withProgress } from "./progress-plFYyayR.js";
//#region src/cli/daemon-cli/probe.ts
function resolveProbeFailureMessage(result) {
	const closeHint = result.close ? `gateway closed (${result.close.code}): ${result.close.reason}` : null;
	if (closeHint && (!result.error || result.error === "timeout")) return closeHint;
	return result.error ?? closeHint ?? "gateway probe failed";
}
async function probeGatewayStatus(opts) {
	try {
		const result = await withProgress({
			label: "Checking gateway status...",
			indeterminate: true,
			enabled: opts.json !== true
		}, async () => {
			if (opts.requireRpc) {
				const { callGateway } = await import("./call-BVShKaZ4.js");
				await callGateway({
					url: opts.url,
					token: opts.token,
					password: opts.password,
					tlsFingerprint: opts.tlsFingerprint,
					method: "status",
					timeoutMs: opts.timeoutMs,
					...opts.configPath ? { configPath: opts.configPath } : {}
				});
				return { ok: true };
			}
			const { probeGateway } = await import("./probe-DCsktpkl.js");
			return await probeGateway({
				url: opts.url,
				auth: {
					token: opts.token,
					password: opts.password
				},
				tlsFingerprint: opts.tlsFingerprint,
				timeoutMs: opts.timeoutMs,
				includeDetails: false
			});
		});
		if (result.ok) return { ok: true };
		return {
			ok: false,
			error: resolveProbeFailureMessage(result)
		};
	} catch (err) {
		return {
			ok: false,
			error: formatErrorMessage(err)
		};
	}
}
//#endregion
export { probeGatewayStatus };
