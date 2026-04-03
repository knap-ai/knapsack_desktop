import { t as runFirecrawlScrape } from "../../firecrawl-client-CaC60Tes.js";
//#region extensions/firecrawl/api.ts
async function fetchFirecrawlContent(params) {
	const result = await runFirecrawlScrape({
		cfg: { plugins: { entries: { firecrawl: {
			enabled: true,
			config: { webFetch: {
				apiKey: params.apiKey,
				baseUrl: params.baseUrl,
				onlyMainContent: params.onlyMainContent,
				maxAgeMs: params.maxAgeMs,
				timeoutSeconds: params.timeoutSeconds
			} }
		} } } },
		url: params.url,
		extractMode: params.extractMode,
		maxChars: params.maxChars,
		proxy: params.proxy,
		storeInCache: params.storeInCache,
		onlyMainContent: params.onlyMainContent,
		maxAgeMs: params.maxAgeMs,
		timeoutSeconds: params.timeoutSeconds
	});
	return {
		text: typeof result.text === "string" ? result.text : "",
		title: typeof result.title === "string" ? result.title : void 0,
		finalUrl: typeof result.finalUrl === "string" ? result.finalUrl : void 0,
		status: typeof result.status === "number" ? result.status : void 0,
		warning: typeof result.warning === "string" ? result.warning : void 0
	};
}
//#endregion
export { fetchFirecrawlContent };
