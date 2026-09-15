const READER_PROXY_HOST = "r.jina.ai";
const DOCUMENT_PATH_RE = /\.(?:pdf|docx?|xlsx?|pptx?|odt|ods|odp)(?:$|[?#])/i;

/**
 * Return the original public URL embedded in a Jina Reader proxy URL.
 *
 * The returned URL still goes through OpenClaw's guarded fetch path, so this
 * does not weaken SSRF protection. Invalid or non-Jina URLs are left alone.
 */
export function resolveReaderProxyTarget(rawUrl) {
	let parsed;
	try {
		parsed = new URL(rawUrl);
	} catch {
		return;
	}
	if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== READER_PROXY_HOST) return;
	const embedded = parsed.pathname.slice(1);
	if (!embedded.startsWith("http://") && !embedded.startsWith("https://")) return;
	const candidate = `${embedded}${parsed.search}${parsed.hash}`;
	try {
		const target = new URL(candidate);
		if (target.protocol !== "http:" && target.protocol !== "https:") return;
		// Reader links frequently embed an http:// source even when the public
		// document is served over HTTPS. Prefer the secure origin; guarded fetch
		// still validates the destination before connecting.
		if (target.protocol === "http:") target.protocol = "https:";
		return target.toString();
	} catch {
		return;
	}
}

export function isLikelyDocumentUrl(rawUrl) {
	return DOCUMENT_PATH_RE.test(rawUrl);
}

export function isReaderProxyAccessFailure(status) {
	return status === 401 || status === 403;
}

export function isDocumentContentType(contentType) {
	const normalized = String(contentType || "").toLowerCase();
	return normalized.includes("application/pdf")
		|| normalized.includes("application/msword")
		|| normalized.includes("application/vnd.openxmlformats-officedocument")
		|| normalized.includes("application/vnd.oasis.opendocument");
}

export function buildDocumentHandoffText(url, contentType) {
	const isPdf = String(contentType || "").toLowerCase().includes("pdf") || /\.pdf(?:$|[?#])/i.test(url);
	return isPdf
		? `The PDF is available at its original URL: ${url}\nUse the pdf tool with this URL to read and answer from the document.`
		: `The document is available at its original URL: ${url}\nOpen this URL with the browser tool to inspect the document.`;
}

export function buildReaderProxyRecoveryFailureMessage() {
	return "Scout could not read this document directly or through the web fallback. Open it in Browser or attach the file and try again.";
}
