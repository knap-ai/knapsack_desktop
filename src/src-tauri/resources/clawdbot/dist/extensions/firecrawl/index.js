import { c as jsonResult, d as readNumberParam, h as readStringParam, p as readStringArrayParam } from "../../common-RGbDbB5n.js";
import "../../provider-web-search-BvBfxXst.js";
import { t as enablePluginInConfig } from "../../enable-CpDMTfhy.js";
import { t as definePluginEntry } from "../../plugin-entry-DA7dUJNL.js";
import "../../provider-web-fetch-kEPvX-ux.js";
import { n as runFirecrawlSearch, t as runFirecrawlScrape } from "../../firecrawl-client-CaC60Tes.js";
import { t as createFirecrawlWebSearchProvider } from "../../firecrawl-search-provider-B4JLEE7p.js";
import { Type } from "@sinclair/typebox";
//#region extensions/firecrawl/src/firecrawl-fetch-provider.ts
function createFirecrawlWebFetchProvider() {
	return {
		id: "firecrawl",
		label: "Firecrawl",
		hint: "Fetch pages with Firecrawl for JS-heavy or bot-protected sites.",
		envVars: ["FIRECRAWL_API_KEY"],
		placeholder: "fc-...",
		signupUrl: "https://www.firecrawl.dev/",
		docsUrl: "https://docs.firecrawl.dev",
		autoDetectOrder: 50,
		credentialPath: "plugins.entries.firecrawl.config.webFetch.apiKey",
		inactiveSecretPaths: ["plugins.entries.firecrawl.config.webFetch.apiKey", "tools.web.fetch.firecrawl.apiKey"],
		getCredentialValue: (fetchConfig) => {
			if (!fetchConfig || typeof fetchConfig !== "object") return;
			const legacy = fetchConfig.firecrawl;
			if (!legacy || typeof legacy !== "object" || Array.isArray(legacy)) return;
			if (legacy.enabled === false) return;
			return legacy.apiKey;
		},
		setCredentialValue: (fetchConfigTarget, value) => {
			const existing = fetchConfigTarget.firecrawl;
			const firecrawl = existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {};
			firecrawl.apiKey = value;
			fetchConfigTarget.firecrawl = firecrawl;
		},
		getConfiguredCredentialValue: (config) => (config?.plugins?.entries?.firecrawl?.config)?.webFetch?.apiKey,
		setConfiguredCredentialValue: (configTarget, value) => {
			const plugins = configTarget.plugins ??= {};
			const entries = plugins.entries ??= {};
			const firecrawlEntry = entries.firecrawl ??= {};
			const pluginConfig = firecrawlEntry.config && typeof firecrawlEntry.config === "object" && !Array.isArray(firecrawlEntry.config) ? firecrawlEntry.config : (firecrawlEntry.config = {}, firecrawlEntry.config);
			const webFetch = pluginConfig.webFetch && typeof pluginConfig.webFetch === "object" && !Array.isArray(pluginConfig.webFetch) ? pluginConfig.webFetch : (pluginConfig.webFetch = {}, pluginConfig.webFetch);
			webFetch.apiKey = value;
		},
		applySelectionConfig: (config) => enablePluginInConfig(config, "firecrawl").config,
		createTool: ({ config }) => ({
			description: "Fetch a page using Firecrawl.",
			parameters: {},
			execute: async (args) => {
				const url = typeof args.url === "string" ? args.url : "";
				const extractMode = args.extractMode === "text" ? "text" : "markdown";
				const maxChars = typeof args.maxChars === "number" && Number.isFinite(args.maxChars) ? Math.floor(args.maxChars) : void 0;
				const proxy = args.proxy === "basic" || args.proxy === "stealth" || args.proxy === "auto" ? args.proxy : void 0;
				const storeInCache = typeof args.storeInCache === "boolean" ? args.storeInCache : void 0;
				return await runFirecrawlScrape({
					cfg: config,
					url,
					extractMode,
					maxChars,
					...proxy ? { proxy } : {},
					...storeInCache !== void 0 ? { storeInCache } : {}
				});
			}
		})
	};
}
//#endregion
//#region extensions/firecrawl/src/firecrawl-scrape-tool.ts
function optionalStringEnum(values, options = {}) {
	return Type.Optional(Type.Unsafe({
		type: "string",
		enum: [...values],
		...options
	}));
}
const FirecrawlScrapeToolSchema = Type.Object({
	url: Type.String({ description: "HTTP or HTTPS URL to scrape via Firecrawl." }),
	extractMode: optionalStringEnum(["markdown", "text"], { description: "Extraction mode (\"markdown\" or \"text\"). Default: markdown." }),
	maxChars: Type.Optional(Type.Number({
		description: "Maximum characters to return.",
		minimum: 100
	})),
	onlyMainContent: Type.Optional(Type.Boolean({ description: "Keep only main content when Firecrawl supports it." })),
	maxAgeMs: Type.Optional(Type.Number({
		description: "Maximum Firecrawl cache age in milliseconds.",
		minimum: 0
	})),
	proxy: optionalStringEnum([
		"auto",
		"basic",
		"stealth"
	], { description: "Firecrawl proxy mode (\"auto\", \"basic\", or \"stealth\")." }),
	storeInCache: Type.Optional(Type.Boolean({ description: "Whether Firecrawl should store the scrape in its cache." })),
	timeoutSeconds: Type.Optional(Type.Number({
		description: "Timeout in seconds for the Firecrawl scrape request.",
		minimum: 1
	}))
}, { additionalProperties: false });
function createFirecrawlScrapeTool(api) {
	return {
		name: "firecrawl_scrape",
		label: "Firecrawl Scrape",
		description: "Scrape a page using Firecrawl v2/scrape. Useful for JS-heavy or bot-protected pages where plain web_fetch is weak.",
		parameters: FirecrawlScrapeToolSchema,
		execute: async (_toolCallId, rawParams) => {
			const url = readStringParam(rawParams, "url", { required: true });
			const extractMode = readStringParam(rawParams, "extractMode") === "text" ? "text" : "markdown";
			const maxChars = readNumberParam(rawParams, "maxChars", { integer: true });
			const maxAgeMs = readNumberParam(rawParams, "maxAgeMs", { integer: true });
			const timeoutSeconds = readNumberParam(rawParams, "timeoutSeconds", { integer: true });
			const proxyRaw = readStringParam(rawParams, "proxy");
			const proxy = proxyRaw === "basic" || proxyRaw === "stealth" || proxyRaw === "auto" ? proxyRaw : void 0;
			const onlyMainContent = typeof rawParams.onlyMainContent === "boolean" ? rawParams.onlyMainContent : void 0;
			const storeInCache = typeof rawParams.storeInCache === "boolean" ? rawParams.storeInCache : void 0;
			return jsonResult(await runFirecrawlScrape({
				cfg: api.config,
				url,
				extractMode,
				maxChars,
				onlyMainContent,
				maxAgeMs,
				proxy,
				storeInCache,
				timeoutSeconds
			}));
		}
	};
}
//#endregion
//#region extensions/firecrawl/src/firecrawl-search-tool.ts
const FirecrawlSearchToolSchema = Type.Object({
	query: Type.String({ description: "Search query string." }),
	count: Type.Optional(Type.Number({
		description: "Number of results to return (1-10).",
		minimum: 1,
		maximum: 10
	})),
	sources: Type.Optional(Type.Array(Type.String(), { description: "Optional sources list, for example [\"web\"], [\"news\"], or [\"images\"]." })),
	categories: Type.Optional(Type.Array(Type.String(), { description: "Optional Firecrawl categories, for example [\"github\"] or [\"research\"]." })),
	scrapeResults: Type.Optional(Type.Boolean({ description: "Include scraped result content when Firecrawl returns it." })),
	timeoutSeconds: Type.Optional(Type.Number({
		description: "Timeout in seconds for the Firecrawl Search request.",
		minimum: 1
	}))
}, { additionalProperties: false });
function createFirecrawlSearchTool(api) {
	return {
		name: "firecrawl_search",
		label: "Firecrawl Search",
		description: "Search the web using Firecrawl v2/search. Can optionally include scraped content from result pages.",
		parameters: FirecrawlSearchToolSchema,
		execute: async (_toolCallId, rawParams) => {
			const query = readStringParam(rawParams, "query", { required: true });
			const count = readNumberParam(rawParams, "count", { integer: true });
			const timeoutSeconds = readNumberParam(rawParams, "timeoutSeconds", { integer: true });
			const sources = readStringArrayParam(rawParams, "sources");
			const categories = readStringArrayParam(rawParams, "categories");
			const scrapeResults = rawParams.scrapeResults === true;
			return jsonResult(await runFirecrawlSearch({
				cfg: api.config,
				query,
				count,
				timeoutSeconds,
				sources,
				categories,
				scrapeResults
			}));
		}
	};
}
//#endregion
//#region extensions/firecrawl/index.ts
var firecrawl_default = definePluginEntry({
	id: "firecrawl",
	name: "Firecrawl Plugin",
	description: "Bundled Firecrawl search and scrape plugin",
	register(api) {
		api.registerWebFetchProvider(createFirecrawlWebFetchProvider());
		api.registerWebSearchProvider(createFirecrawlWebSearchProvider());
		api.registerTool(createFirecrawlSearchTool(api));
		api.registerTool(createFirecrawlScrapeTool(api));
	}
});
//#endregion
export { firecrawl_default as default };
