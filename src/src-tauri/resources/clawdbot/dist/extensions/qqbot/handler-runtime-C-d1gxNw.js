import { n as getBridgeLogger, t as ensurePlatformAdapter } from "./bootstrap-DP2UpEF-.js";
import { a as resolveApprovalTarget, n as buildExecApprovalText, r as buildPluginApprovalText, t as buildApprovalKeyboard } from "./approval-cg0SVahb.js";
import { a as resolveQQBotAccount } from "./config--Jdei9fe.js";
import { a as resolveQQBotExecApprovalConfig, i as matchesQQBotApprovalAccount, o as shouldHandleQQBotExecApprovalRequest, r as isQQBotExecApprovalClientEnabled } from "./exec-approvals-CGQVvXNn.js";
import { c as getMessageApi, t as accountToCreds } from "./sender-BZ_TJkxQ.js";
import { resolveApprovalRequestSessionConversation } from "openclaw/plugin-sdk/approval-native-runtime";
import { createChannelApprovalNativeRuntimeAdapter } from "openclaw/plugin-sdk/approval-handler-runtime";
//#region extensions/qqbot/src/bridge/approval/handler-runtime.ts
function isExecRequest(request) {
	return "expiresAtMs" in request;
}
function resolveQQTarget(request) {
	const sessionConversation = resolveApprovalRequestSessionConversation({
		request,
		channel: "qqbot",
		bundledFallback: true
	});
	const target = resolveApprovalTarget(request.request.sessionKey ?? null, request.request.turnSourceTo ?? null);
	if (target) return target;
	if (sessionConversation?.id) return {
		type: sessionConversation.kind === "group" ? "group" : "c2c",
		id: sessionConversation.id
	};
	return null;
}
const qqbotApprovalNativeRuntime = createChannelApprovalNativeRuntimeAdapter({
	eventKinds: ["exec", "plugin"],
	availability: {
		isConfigured: ({ cfg, accountId }) => {
			if (resolveQQBotExecApprovalConfig({
				cfg,
				accountId
			}) !== void 0) {
				const result = isQQBotExecApprovalClientEnabled({
					cfg,
					accountId
				});
				getBridgeLogger().debug?.(`[qqbot:approval-runtime] isConfigured(profile) accountId=${accountId} → ${result}`);
				return result;
			}
			const account = resolveQQBotAccount(cfg, accountId ?? void 0);
			const result = account.enabled && account.secretSource !== "none";
			getBridgeLogger().debug?.(`[qqbot:approval-runtime] isConfigured(fallback) accountId=${accountId} enabled=${account.enabled} secretSource=${account.secretSource} → ${result}`);
			return result;
		},
		shouldHandle: ({ cfg, accountId, request }) => {
			if (resolveQQBotExecApprovalConfig({
				cfg,
				accountId
			}) !== void 0) {
				const result = shouldHandleQQBotExecApprovalRequest({
					cfg,
					accountId,
					request
				});
				getBridgeLogger().debug?.(`[qqbot:approval-runtime] shouldHandle(profile) accountId=${accountId} → ${result}`);
				return result;
			}
			const target = resolveQQTarget(request);
			if (target === null) {
				getBridgeLogger().debug?.(`[qqbot:approval-runtime] shouldHandle(fallback) accountId=${accountId} target=null → false`);
				return false;
			}
			const accountMatches = matchesQQBotApprovalAccount({
				cfg,
				accountId,
				request
			});
			getBridgeLogger().debug?.(`[qqbot:approval-runtime] shouldHandle(fallback) accountId=${accountId} target=${JSON.stringify(target)} accountMatches=${accountMatches} → ${accountMatches}`);
			return accountMatches;
		}
	},
	presentation: {
		buildPendingPayload: ({ request, view }) => {
			const req = request;
			const text = isExecRequest(req) ? buildExecApprovalText(req) : buildPluginApprovalText(req);
			const keyboard = buildApprovalKeyboard(req.id, view.actions.map((action) => action.decision));
			getBridgeLogger().debug?.(`[qqbot:approval-runtime] buildPendingPayload requestId=${req.id} kind=${isExecRequest(req) ? "exec" : "plugin"}`);
			return {
				text,
				keyboard
			};
		},
		buildResolvedResult: () => ({ kind: "leave" }),
		buildExpiredResult: () => ({ kind: "leave" })
	},
	transport: {
		prepareTarget: ({ request }) => {
			const target = resolveQQTarget(request);
			getBridgeLogger().debug?.(`[qqbot:approval-runtime] prepareTarget requestId=${request.id} target=${JSON.stringify(target)}`);
			if (!target) return null;
			return {
				target,
				dedupeKey: `${target.type}:${target.id}`
			};
		},
		deliverPending: async ({ cfg, accountId, preparedTarget, pendingPayload }) => {
			ensurePlatformAdapter();
			const account = resolveQQBotAccount(cfg, accountId ?? void 0);
			const creds = accountToCreds(account);
			const messageApi = getMessageApi(account.appId);
			let result;
			try {
				getBridgeLogger().debug?.(`[qqbot:approval-runtime] deliverPending accountId=${accountId} target=${preparedTarget.type}:${preparedTarget.id}`);
				result = await messageApi.sendMessage(preparedTarget.type, preparedTarget.id, pendingPayload.text, creds, { inlineKeyboard: pendingPayload.keyboard });
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				throw new Error(`Failed to send approval message to ${preparedTarget.type}:${preparedTarget.id}: ${msg}`, { cause: err });
			}
			getBridgeLogger().debug?.(`[qqbot:approval-runtime] deliverPending success accountId=${accountId} messageId=${result.id ?? ""}`);
			return {
				messageId: result.id,
				targetType: preparedTarget.type,
				targetId: preparedTarget.id
			};
		}
	}
});
//#endregion
export { qqbotApprovalNativeRuntime };
