import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
//#region src/infra/approval-native-target-key.ts
function buildChannelApprovalNativeTargetKey(target) {
	return `${normalizeOptionalString(target.to) ?? ""}\u0000${target.threadId == null ? "" : normalizeOptionalString(String(target.threadId)) ?? ""}`;
}
//#endregion
export { buildChannelApprovalNativeTargetKey as t };
