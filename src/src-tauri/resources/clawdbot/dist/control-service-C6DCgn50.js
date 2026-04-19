import { c as escapeRegExp } from "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import "./chrome-DKrTqDG1.js";
import "./utils-DSPbCLVw.js";
import { r as registerBrowserRoutes, t as createBrowserRouteContext } from "./server-context-qgfDaRbE.js";
import { t as ensureBrowserControlAuth } from "./control-auth-hABiqRrk.js";
import { t as resolveBrowserConfig } from "./config-DldYxDHs.js";
import { n as createBrowserRuntimeState, r as stopBrowserRuntime, t as isDefaultBrowserPluginEnabled } from "./plugin-enabled-CC19dRLd.js";
//#region extensions/browser/src/browser/routes/dispatcher.ts
function compileRoute(path) {
	const paramNames = [];
	const parts = path.split("/").map((part) => {
		if (part.startsWith(":")) {
			const name = part.slice(1);
			paramNames.push(name);
			return "([^/]+)";
		}
		return escapeRegExp(part);
	});
	return {
		regex: new RegExp(`^${parts.join("/")}$`),
		paramNames
	};
}
function createRegistry() {
	const routes = [];
	const register = (method) => (path, handler) => {
		const { regex, paramNames } = compileRoute(path);
		routes.push({
			method,
			path,
			regex,
			paramNames,
			handler
		});
	};
	return {
		routes,
		router: {
			get: register("GET"),
			post: register("POST"),
			delete: register("DELETE")
		}
	};
}
function normalizePath(path) {
	if (!path) return "/";
	return path.startsWith("/") ? path : `/${path}`;
}
function createBrowserRouteDispatcher(ctx) {
	const registry = createRegistry();
	registerBrowserRoutes(registry.router, ctx);
	return { dispatch: async (req) => {
		const method = req.method;
		const path = normalizePath(req.path);
		const query = req.query ?? {};
		const body = req.body;
		const signal = req.signal;
		const match = registry.routes.find((route) => {
			if (route.method !== method) return false;
			return route.regex.test(path);
		});
		if (!match) return {
			status: 404,
			body: { error: "Not Found" }
		};
		const exec = match.regex.exec(path);
		const params = {};
		if (exec) for (const [idx, name] of match.paramNames.entries()) {
			const value = exec[idx + 1];
			if (typeof value === "string") try {
				params[name] = decodeURIComponent(value);
			} catch {
				return {
					status: 400,
					body: { error: `invalid path parameter encoding: ${name}` }
				};
			}
		}
		let status = 200;
		let payload = void 0;
		const res = {
			status(code) {
				status = code;
				return res;
			},
			json(bodyValue) {
				payload = bodyValue;
			}
		};
		try {
			await match.handler({
				params,
				query,
				body,
				signal
			}, res);
		} catch (err) {
			return {
				status: 500,
				body: { error: String(err) }
			};
		}
		return {
			status,
			body: payload
		};
	} };
}
//#endregion
//#region extensions/browser/src/control-service.ts
let state = null;
const logService = createSubsystemLogger("browser").child("service");
function getBrowserControlState() {
	return state;
}
function createBrowserControlContext() {
	return createBrowserRouteContext({
		getState: () => state,
		refreshConfigFromDisk: true
	});
}
async function startBrowserControlServiceFromConfig() {
	if (state) return state;
	const cfg = loadConfig();
	if (!isDefaultBrowserPluginEnabled(cfg)) return null;
	const resolved = resolveBrowserConfig(cfg.browser, cfg);
	if (!resolved.enabled) return null;
	try {
		if ((await ensureBrowserControlAuth({ cfg })).generatedToken) logService.info("No browser auth configured; generated gateway.auth.token automatically.");
	} catch (err) {
		logService.warn(`failed to auto-configure browser auth: ${String(err)}`);
	}
	state = await createBrowserRuntimeState({
		server: null,
		port: resolved.controlPort,
		resolved,
		onWarn: (message) => logService.warn(message)
	});
	logService.info(`Browser control service ready (profiles=${Object.keys(resolved.profiles).length})`);
	return state;
}
async function stopBrowserControlService() {
	await stopBrowserRuntime({
		current: state,
		getState: () => state,
		clearState: () => {
			state = null;
		},
		onWarn: (message) => logService.warn(message)
	});
}
//#endregion
export { createBrowserRouteDispatcher as a, stopBrowserControlService as i, getBrowserControlState as n, startBrowserControlServiceFromConfig as r, createBrowserControlContext as t };
