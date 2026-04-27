//#region extensions/opencode-go/provider-catalog.ts
const OPENCODE_GO_OPENAI_BASE_URL = "https://opencode.ai/zen/go/v1";
const OPENCODE_GO_ANTHROPIC_BASE_URL = "https://opencode.ai/zen/go";
function normalizeBaseUrl(baseUrl) {
	return (baseUrl ?? "").trim().replace(/\/+$/, "");
}
function normalizeOpencodeGoBaseUrl(params) {
	const normalized = normalizeBaseUrl(params.baseUrl);
	if (!normalized) return;
	if (normalized === "https://opencode.ai/zen/go/v1") return OPENCODE_GO_OPENAI_BASE_URL;
	if (normalized === "https://opencode.ai/zen/go") return OPENCODE_GO_ANTHROPIC_BASE_URL;
	if (normalized === "https://opencode.ai/go") return OPENCODE_GO_ANTHROPIC_BASE_URL;
	if (normalized === "https://opencode.ai/go/v1") return params.api === "anthropic-messages" ? OPENCODE_GO_ANTHROPIC_BASE_URL : OPENCODE_GO_OPENAI_BASE_URL;
}
//#endregion
export { OPENCODE_GO_OPENAI_BASE_URL as n, normalizeOpencodeGoBaseUrl as r, OPENCODE_GO_ANTHROPIC_BASE_URL as t };
