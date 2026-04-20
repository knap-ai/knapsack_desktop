import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import "./text-runtime-DTMxvodz.js";
import { Type } from "@sinclair/typebox";
//#region extensions/brave/src/brave-web-search-provider.shared.ts
const BRAVE_COUNTRY_CODES = new Set([
	"AR",
	"AU",
	"AT",
	"BE",
	"BR",
	"CA",
	"CL",
	"DK",
	"FI",
	"FR",
	"DE",
	"GR",
	"HK",
	"IN",
	"ID",
	"IT",
	"JP",
	"KR",
	"MY",
	"MX",
	"NL",
	"NZ",
	"NO",
	"CN",
	"PL",
	"PT",
	"PH",
	"RU",
	"SA",
	"ZA",
	"ES",
	"SE",
	"CH",
	"TW",
	"TR",
	"GB",
	"US",
	"ALL"
]);
const BRAVE_SEARCH_LANG_CODES = new Set([
	"ar",
	"eu",
	"bn",
	"bg",
	"ca",
	"zh-hans",
	"zh-hant",
	"hr",
	"cs",
	"da",
	"nl",
	"en",
	"en-gb",
	"et",
	"fi",
	"fr",
	"gl",
	"de",
	"el",
	"gu",
	"he",
	"hi",
	"hu",
	"is",
	"it",
	"jp",
	"kn",
	"ko",
	"lv",
	"lt",
	"ms",
	"ml",
	"mr",
	"nb",
	"pl",
	"pt-br",
	"pt-pt",
	"pa",
	"ro",
	"ru",
	"sr",
	"sk",
	"sl",
	"es",
	"sv",
	"ta",
	"te",
	"th",
	"tr",
	"uk",
	"vi"
]);
const BRAVE_SEARCH_LANG_ALIASES = {
	ja: "jp",
	zh: "zh-hans",
	"zh-cn": "zh-hans",
	"zh-hk": "zh-hant",
	"zh-sg": "zh-hans",
	"zh-tw": "zh-hant"
};
const BRAVE_UI_LANG_LOCALE = /^([a-z]{2})-([a-z]{2})$/i;
const MAX_BRAVE_SEARCH_COUNT = 10;
function normalizeBraveSearchLang(value) {
	if (!value) return;
	const trimmed = value.trim();
	if (!trimmed) return;
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
	const canonical = BRAVE_SEARCH_LANG_ALIASES[lower] ?? lower;
	if (!BRAVE_SEARCH_LANG_CODES.has(canonical)) return;
	return canonical;
}
function normalizeBraveCountry(value) {
	if (!value) return;
	const trimmed = value.trim();
	if (!trimmed) return;
	const canonical = trimmed.toUpperCase();
	return BRAVE_COUNTRY_CODES.has(canonical) ? canonical : "ALL";
}
function normalizeBraveUiLang(value) {
	if (!value) return;
	const trimmed = value.trim();
	if (!trimmed) return;
	const match = trimmed.match(BRAVE_UI_LANG_LOCALE);
	if (!match) return;
	const [, language, region] = match;
	return `${normalizeLowercaseStringOrEmpty(language)}-${region.toUpperCase()}`;
}
function resolveBraveConfig(searchConfig) {
	const brave = searchConfig?.brave;
	return brave && typeof brave === "object" && !Array.isArray(brave) ? brave : {};
}
function resolveBraveMode(brave) {
	return brave?.mode === "llm-context" ? "llm-context" : "web";
}
function normalizeBraveLanguageParams(params) {
	const rawSearchLang = normalizeOptionalString(params.search_lang);
	const rawUiLang = normalizeOptionalString(params.ui_lang);
	let searchLangCandidate = rawSearchLang;
	let uiLangCandidate = rawUiLang;
	if (normalizeBraveUiLang(rawSearchLang) && normalizeBraveSearchLang(rawUiLang)) {
		searchLangCandidate = rawUiLang;
		uiLangCandidate = rawSearchLang;
	}
	const search_lang = normalizeBraveSearchLang(searchLangCandidate);
	if (searchLangCandidate && !search_lang) return { invalidField: "search_lang" };
	const ui_lang = normalizeBraveUiLang(uiLangCandidate);
	if (uiLangCandidate && !ui_lang) return { invalidField: "ui_lang" };
	return {
		search_lang,
		ui_lang
	};
}
function resolveSiteName(url) {
	if (!url) return;
	try {
		return new URL(url).hostname;
	} catch {
		return;
	}
}
function mapBraveLlmContextResults(data) {
	return (Array.isArray(data.grounding?.generic) ? data.grounding.generic : []).map((entry) => ({
		url: entry.url ?? "",
		title: entry.title ?? "",
		snippets: (entry.snippets ?? []).filter((snippet) => typeof snippet === "string" && snippet.length > 0),
		siteName: resolveSiteName(entry.url) || void 0
	}));
}
function createBraveSchema() {
	return Type.Object({
		query: Type.String({ description: "Search query string." }),
		count: Type.Optional(Type.Number({
			description: "Number of results to return (1-10).",
			minimum: 1,
			maximum: MAX_BRAVE_SEARCH_COUNT
		})),
		country: Type.Optional(Type.String({ description: "2-letter country code for region-specific results (e.g., 'DE', 'US', 'ALL'). Default: 'US'." })),
		language: Type.Optional(Type.String({ description: "ISO 639-1 language code for results (e.g., 'en', 'de', 'fr')." })),
		freshness: Type.Optional(Type.String({ description: "Filter by time: 'day' (24h), 'week', 'month', or 'year'." })),
		date_after: Type.Optional(Type.String({ description: "Only results published after this date (YYYY-MM-DD)." })),
		date_before: Type.Optional(Type.String({ description: "Only results published before this date (YYYY-MM-DD)." })),
		search_lang: Type.Optional(Type.String({ description: "Brave language code for search results (e.g., 'en', 'de', 'en-gb', 'zh-hans', 'zh-hant', 'pt-br')." })),
		ui_lang: Type.Optional(Type.String({ description: "Locale code for UI elements in language-region format (e.g., 'en-US', 'de-DE', 'fr-FR', 'tr-TR'). Must include region subtag." }))
	});
}
//#endregion
export { resolveBraveConfig as a, normalizeBraveLanguageParams as i, mapBraveLlmContextResults as n, resolveBraveMode as o, normalizeBraveCountry as r, createBraveSchema as t };
