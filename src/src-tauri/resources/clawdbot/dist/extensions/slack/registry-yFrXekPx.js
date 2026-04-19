//#region extensions/slack/src/http/paths.ts
function normalizeSlackWebhookPath(path) {
	const trimmed = path?.trim();
	if (!trimmed) return "/slack/events";
	return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
//#endregion
//#region extensions/slack/src/http/registry.ts
const slackHttpRoutes = /* @__PURE__ */ new Map();
function registerSlackHttpHandler(params) {
	const normalizedPath = normalizeSlackWebhookPath(params.path);
	if (slackHttpRoutes.has(normalizedPath)) {
		const suffix = params.accountId ? ` for account "${params.accountId}"` : "";
		params.log?.(`slack: webhook path ${normalizedPath} already registered${suffix}`);
		return () => {};
	}
	slackHttpRoutes.set(normalizedPath, params.handler);
	return () => {
		slackHttpRoutes.delete(normalizedPath);
	};
}
async function handleSlackHttpRequest(req, res) {
	const url = new URL(req.url ?? "/", "http://localhost");
	const handler = slackHttpRoutes.get(url.pathname);
	if (!handler) return false;
	await handler(req, res);
	return true;
}
//#endregion
export { registerSlackHttpHandler as n, normalizeSlackWebhookPath as r, handleSlackHttpRequest as t };
