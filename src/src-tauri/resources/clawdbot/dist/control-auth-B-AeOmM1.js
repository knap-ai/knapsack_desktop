import { i as loadConfig, l as writeConfigFile } from "./config-BJWIHf6x.js";
import { i as resolveGatewayAuth } from "./auth-DaQXd14b.js";
import crypto from "node:crypto";

//#region src/browser/control-auth.ts
function resolveBrowserControlAuth(cfg, env = process.env) {
	const auth = resolveGatewayAuth({
		authConfig: cfg?.gateway?.auth,
		env,
		tailscaleMode: cfg?.gateway?.tailscale?.mode
	});
	const token = typeof auth.token === "string" ? auth.token.trim() : "";
	const password = typeof auth.password === "string" ? auth.password.trim() : "";
	return {
		token: token || void 0,
		password: password || void 0
	};
}
function shouldAutoGenerateBrowserAuth(env) {
	if ((env.NODE_ENV ?? "").trim().toLowerCase() === "test") return false;
	const vitest = (env.VITEST ?? "").trim().toLowerCase();
	if (vitest && vitest !== "0" && vitest !== "false" && vitest !== "off") return false;
	return true;
}
async function ensureBrowserControlAuth(params) {
	const env = params.env ?? process.env;
	const auth = resolveBrowserControlAuth(params.cfg, env);
	if (auth.token || auth.password) return { auth };
	if (!shouldAutoGenerateBrowserAuth(env)) return { auth };
	if (params.cfg.gateway?.auth?.mode === "password") return { auth };
	const latestCfg = loadConfig();
	const latestAuth = resolveBrowserControlAuth(latestCfg, env);
	if (latestAuth.token || latestAuth.password) return { auth: latestAuth };
	if (latestCfg.gateway?.auth?.mode === "password") return { auth: latestAuth };
	const generatedToken = crypto.randomBytes(24).toString("hex");
	await writeConfigFile({
		...latestCfg,
		gateway: {
			...latestCfg.gateway,
			auth: {
				...latestCfg.gateway?.auth,
				mode: "token",
				token: generatedToken
			}
		}
	});
	return {
		auth: { token: generatedToken },
		generatedToken
	};
}

//#endregion
export { resolveBrowserControlAuth as n, ensureBrowserControlAuth as t };