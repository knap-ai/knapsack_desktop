import { t as createSubsystemLogger } from "./subsystem-BDbeCphF.js";
import "./paths-dQ_clcF4.js";
import "./theme-H80Q3Qtv.js";
import "./boolean-DTgd5CzD.js";
import { $p as installBrowserCommonMiddleware, Bm as ensureBrowserControlAuth, Qp as installBrowserAuthMiddleware, Vm as resolveBrowserControlAuth, _m as createBrowserRouteContext, em as registerBrowserRoutes, gm as stopBrowserRuntime, hm as createBrowserRuntimeState, jg as loadConfig, xm as resolveBrowserConfig } from "./auth-profiles-DRjqKE3G.js";
import "./agent-scope-CZIF93u7.js";
import "./utils-B88a096J.js";
import "./boundary-file-read-Bb0WDUIN.js";
import "./logger-D0msxOz2.js";
import "./exec-CdZJtviz.js";
import "./github-copilot-token-DQd7axD5.js";
import "./registry-DtTKJfN8.js";
import "./skills-CtzUimzY.js";
import "./frontmatter-D0K3qXQH.js";
import "./env-overrides-D7R3RscC.js";
import "./version-DcA9ITyc.js";
import "./search-manager-CR5cykjp.js";
import "./plugins-C-z6VZlO.js";
import "./query-expansion-E78fX0en.js";
import "./redact-DrUa2v4S.js";
import "./errors-Bgu5Y3JI.js";
import "./fetch-BmEnSimV.js";
import "./path-alias-guards-C2fEXRX9.js";
import "./cmd-argv-Cnl266PT.js";
import "./delivery-queue-uotfwRH3.js";
import "./paths-B9q4Ev3T.js";
import "./session-cost-usage-B7YSslo_.js";
import "./prompt-style-C94HXvSH.js";
import "./links-BuWtQKK5.js";
import "./cli-utils-CCDylRkX.js";
import express from "express";
//#region src/browser/server.ts
let state = null;
const logServer = createSubsystemLogger("browser").child("server");
async function startBrowserControlServerFromConfig() {
	if (state) return state;
	const cfg = loadConfig();
	const resolved = resolveBrowserConfig(cfg.browser, cfg);
	if (!resolved.enabled) return null;
	let browserAuth = resolveBrowserControlAuth(cfg);
	let browserAuthBootstrapFailed = false;
	try {
		const ensured = await ensureBrowserControlAuth({ cfg });
		browserAuth = ensured.auth;
		if (ensured.generatedToken) logServer.info("No browser auth configured; generated gateway.auth.token automatically.");
	} catch (err) {
		logServer.warn(`failed to auto-configure browser auth: ${String(err)}`);
		browserAuthBootstrapFailed = true;
	}
	if (browserAuthBootstrapFailed && !browserAuth.token && !browserAuth.password) {
		logServer.error("browser control startup aborted: authentication bootstrap failed and no fallback auth is configured.");
		return null;
	}
	const app = express();
	installBrowserCommonMiddleware(app);
	installBrowserAuthMiddleware(app, browserAuth);
	registerBrowserRoutes(app, createBrowserRouteContext({
		getState: () => state,
		refreshConfigFromDisk: true
	}));
	const port = resolved.controlPort;
	const server = await new Promise((resolve, reject) => {
		const s = app.listen(port, "127.0.0.1", () => resolve(s));
		s.once("error", reject);
	}).catch((err) => {
		logServer.error(`openclaw browser server failed to bind 127.0.0.1:${port}: ${String(err)}`);
		return null;
	});
	if (!server) return null;
	state = await createBrowserRuntimeState({
		server,
		port,
		resolved,
		onWarn: (message) => logServer.warn(message)
	});
	const authMode = browserAuth.token ? "token" : browserAuth.password ? "password" : "off";
	logServer.info(`Browser control listening on http://127.0.0.1:${port}/ (auth=${authMode})`);
	return state;
}
async function stopBrowserControlServer() {
	await stopBrowserRuntime({
		current: state,
		getState: () => state,
		clearState: () => {
			state = null;
		},
		closeServer: true,
		onWarn: (message) => logServer.warn(message)
	});
}
//#endregion
export { startBrowserControlServerFromConfig, stopBrowserControlServer };
