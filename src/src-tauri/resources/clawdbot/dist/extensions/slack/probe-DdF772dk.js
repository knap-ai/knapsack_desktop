import { t as __exportAll } from "./rolldown-runtime-CiIaOW0V.js";
import { r as createSlackWebClient } from "./client-BfPZ6k8d.js";
import { withTimeout } from "openclaw/plugin-sdk/text-runtime";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
//#region extensions/slack/src/probe.ts
var probe_exports = /* @__PURE__ */ __exportAll({ probeSlack: () => probeSlack });
async function probeSlack(token, timeoutMs = 2500) {
	const client = createSlackWebClient(token);
	const start = Date.now();
	try {
		const result = await withTimeout(client.auth.test(), timeoutMs);
		if (!result.ok) return {
			ok: false,
			status: 200,
			error: result.error ?? "unknown",
			elapsedMs: Date.now() - start
		};
		return {
			ok: true,
			status: 200,
			elapsedMs: Date.now() - start,
			bot: {
				id: result.user_id,
				name: result.user
			},
			team: {
				id: result.team_id,
				name: result.team
			}
		};
	} catch (err) {
		const message = formatErrorMessage(err);
		return {
			ok: false,
			status: typeof err.status === "number" ? err.status : null,
			error: message,
			elapsedMs: Date.now() - start
		};
	}
}
//#endregion
export { probe_exports as n, probeSlack as t };
