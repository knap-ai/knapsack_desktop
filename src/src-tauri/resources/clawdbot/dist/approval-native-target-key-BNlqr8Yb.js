import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
//#region src/infra/approval-native-target-key.ts
function buildChannelApprovalNativeTargetKey(target) {
	return `${normalizeOptionalString(target.to) ?? ""}\u0000${target.threadId == null ? "" : normalizeOptionalString(String(target.threadId)) ?? ""}`;
}
//#endregion
export { buildChannelApprovalNativeTargetKey as t };
