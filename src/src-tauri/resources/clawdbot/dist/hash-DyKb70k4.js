import crypto from "node:crypto";
//#region src/memory-host-sdk/host/hash.ts
function hashText(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
//#endregion
export { hashText as t };
