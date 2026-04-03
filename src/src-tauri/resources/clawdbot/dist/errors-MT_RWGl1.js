//#region extensions/matrix/src/matrix/errors.ts
function isMatrixNotFoundError(err) {
	const errObj = err;
	if (errObj?.statusCode === 404 || errObj?.body?.errcode === "M_NOT_FOUND") return true;
	const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
	return message.includes("m_not_found") || message.includes("[404]") || message.includes("not found");
}
//#endregion
export { isMatrixNotFoundError as t };
