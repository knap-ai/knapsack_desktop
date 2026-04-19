import { createRequire } from "node:module";
//#region src/infra/net/undici-runtime.ts
const TEST_UNDICI_RUNTIME_DEPS_KEY = "__OPENCLAW_TEST_UNDICI_RUNTIME_DEPS__";
const HTTP1_ONLY_DISPATCHER_OPTIONS = Object.freeze({ allowH2: false });
function isUndiciRuntimeDeps(value) {
	return typeof value === "object" && value !== null && typeof value.Agent === "function" && typeof value.EnvHttpProxyAgent === "function" && typeof value.ProxyAgent === "function" && typeof value.fetch === "function";
}
function loadUndiciRuntimeDeps() {
	const override = globalThis[TEST_UNDICI_RUNTIME_DEPS_KEY];
	if (isUndiciRuntimeDeps(override)) return override;
	const undici = createRequire(import.meta.url)("undici");
	return {
		Agent: undici.Agent,
		EnvHttpProxyAgent: undici.EnvHttpProxyAgent,
		FormData: undici.FormData,
		ProxyAgent: undici.ProxyAgent,
		fetch: undici.fetch
	};
}
function withHttp1OnlyDispatcherOptions(options) {
	if (!options) return { ...HTTP1_ONLY_DISPATCHER_OPTIONS };
	return {
		...options,
		...HTTP1_ONLY_DISPATCHER_OPTIONS
	};
}
function createHttp1Agent(options) {
	const { Agent } = loadUndiciRuntimeDeps();
	return new Agent(withHttp1OnlyDispatcherOptions(options));
}
function createHttp1EnvHttpProxyAgent(options) {
	const { EnvHttpProxyAgent } = loadUndiciRuntimeDeps();
	return new EnvHttpProxyAgent(withHttp1OnlyDispatcherOptions(options));
}
function createHttp1ProxyAgent(options) {
	const { ProxyAgent } = loadUndiciRuntimeDeps();
	if (typeof options === "string" || options instanceof URL) return new ProxyAgent(withHttp1OnlyDispatcherOptions({ uri: options.toString() }));
	return new ProxyAgent(withHttp1OnlyDispatcherOptions(options));
}
//#endregion
export { loadUndiciRuntimeDeps as i, createHttp1EnvHttpProxyAgent as n, createHttp1ProxyAgent as r, createHttp1Agent as t };
