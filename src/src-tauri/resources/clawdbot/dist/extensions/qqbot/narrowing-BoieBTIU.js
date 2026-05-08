//#region extensions/qqbot/src/bridge/narrowing.ts
/**
* Map resolved plugin account to the engine gateway account shape (single assertion on nested config).
*/
function toGatewayAccount(account) {
	return {
		accountId: account.accountId,
		appId: account.appId,
		clientSecret: account.clientSecret,
		markdownSupport: account.markdownSupport,
		systemPrompt: account.systemPrompt,
		config: account.config
	};
}
/**
* Persist OpenClaw config through the injected plugin runtime (typed entry point).
*/
async function writeOpenClawConfigThroughRuntime(runtime, cfg) {
	await runtime.config.replaceConfigFile({
		nextConfig: cfg,
		afterWrite: { mode: "auto" }
	});
}
//#endregion
export { writeOpenClawConfigThroughRuntime as n, toGatewayAccount as t };
