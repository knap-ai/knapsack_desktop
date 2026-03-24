//#region src/shared/net/url-userinfo.ts
function stripUrlUserInfo(value) {
	try {
		const parsed = new URL(value);
		if (!parsed.username && !parsed.password) return value;
		parsed.username = "";
		parsed.password = "";
		return parsed.toString();
	} catch {
		return value;
	}
}
//#endregion
export { stripUrlUserInfo as t };
