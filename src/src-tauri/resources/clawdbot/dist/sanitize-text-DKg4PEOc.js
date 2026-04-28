//#region src/infra/outbound/sanitize-text.ts
/**
* Sanitize model output for plain-text messaging surfaces.
*
* LLMs occasionally produce HTML tags (`<br>`, `<b>`, `<i>`, etc.) that render
* correctly on web but appear as literal text on WhatsApp, Signal, SMS, and IRC.
*
* Converts common inline HTML to lightweight-markup equivalents used by
* WhatsApp/Signal/Telegram and strips any remaining tags.
*
* @see https://github.com/openclaw/openclaw/issues/31884
* @see https://github.com/openclaw/openclaw/issues/18558
*/
/**
* Convert common HTML tags to their plain-text/lightweight-markup equivalents
* and strip anything that remains.
*
* The function is intentionally conservative — it only targets tags that models
* are known to produce and avoids false positives on angle brackets in normal
* prose (e.g. `a < b`).
*/
function sanitizeForPlainText(text) {
	return text.replace(/<((?:https?:\/\/|mailto:)[^<>\s]+)>/gi, "$1").replace(/<br\s*\/?>/gi, "\n").replace(/<\/?(p|div)>/gi, "\n").replace(/<(b|strong)>(.*?)<\/\1>/gi, "*$2*").replace(/<(i|em)>(.*?)<\/\1>/gi, "_$2_").replace(/<(s|strike|del)>(.*?)<\/\1>/gi, "~$2~").replace(/<code>(.*?)<\/code>/gi, "`$1`").replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n*$1*\n").replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n").replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, "").replace(/\n{3,}/g, "\n\n");
}
//#endregion
export { sanitizeForPlainText as t };
