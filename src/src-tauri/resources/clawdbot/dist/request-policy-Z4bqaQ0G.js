//#region src/browser/request-policy.ts
function normalizeBrowserRequestPath(value) {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
	if (withLeadingSlash.length <= 1) return withLeadingSlash;
	return withLeadingSlash.replace(/\/+$/, "");
}
function isPersistentBrowserProfileMutation(method, path) {
	const normalizedPath = normalizeBrowserRequestPath(path);
	if (method === "POST" && normalizedPath === "/profiles/create") return true;
	return method === "DELETE" && /^\/profiles\/[^/]+$/.test(normalizedPath);
}
function resolveRequestedBrowserProfile(params) {
	const queryProfile = typeof params.query?.profile === "string" ? params.query.profile.trim() : void 0;
	if (queryProfile) return queryProfile;
	if (params.body && typeof params.body === "object") {
		const bodyProfile = "profile" in params.body && typeof params.body.profile === "string" ? params.body.profile.trim() : void 0;
		if (bodyProfile) return bodyProfile;
	}
	return (typeof params.profile === "string" ? params.profile.trim() : void 0) || void 0;
}
//#endregion
export { normalizeBrowserRequestPath as n, resolveRequestedBrowserProfile as r, isPersistentBrowserProfileMutation as t };
