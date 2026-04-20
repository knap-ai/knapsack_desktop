import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { b as truncateUtf16Safe } from "./utils-D5DtWkEu.js";
import { s as stripHeartbeatToken } from "./heartbeat-DYyKvnDp.js";
import { p as resolveSendableOutboundReplyParts, s as hasOutboundReplyContent } from "./reply-payload-Db_8BQiX.js";
//#region src/cron/heartbeat-policy.ts
function shouldSkipHeartbeatOnlyDelivery(payloads, ackMaxChars) {
	if (payloads.length === 0) return true;
	if (payloads.some((payload) => resolveSendableOutboundReplyParts(payload).hasMedia)) return false;
	return payloads.some((payload) => {
		return stripHeartbeatToken(payload.text, {
			mode: "heartbeat",
			maxAckChars: ackMaxChars
		}).shouldSkip;
	});
}
//#endregion
//#region src/cron/isolated-agent/helpers.ts
function pickSummaryFromOutput(text) {
	const clean = (text ?? "").trim();
	if (!clean) return;
	const limit = 2e3;
	return clean.length > limit ? `${truncateUtf16Safe(clean, limit)}…` : clean;
}
function pickSummaryFromPayloads(payloads) {
	for (let i = payloads.length - 1; i >= 0; i--) {
		if (payloads[i]?.isError) continue;
		const summary = pickSummaryFromOutput(payloads[i]?.text);
		if (summary) return summary;
	}
	for (let i = payloads.length - 1; i >= 0; i--) {
		const summary = pickSummaryFromOutput(payloads[i]?.text);
		if (summary) return summary;
	}
}
function pickLastNonEmptyTextFromPayloads(payloads) {
	for (let i = payloads.length - 1; i >= 0; i--) {
		if (payloads[i]?.isError) continue;
		const clean = (payloads[i]?.text ?? "").trim();
		if (clean) return clean;
	}
	for (let i = payloads.length - 1; i >= 0; i--) {
		const clean = (payloads[i]?.text ?? "").trim();
		if (clean) return clean;
	}
}
function isDeliverablePayload(payload) {
	if (!payload) return false;
	const hasInteractive = (payload.interactive?.blocks?.length ?? 0) > 0;
	const hasChannelData = Object.keys(payload.channelData ?? {}).length > 0;
	return hasOutboundReplyContent(payload, { trimText: true }) || hasInteractive || hasChannelData;
}
function payloadHasStructuredDeliveryContent(payload) {
	if (!payload) return false;
	return payload.mediaUrl !== void 0 || (payload.mediaUrls?.length ?? 0) > 0 || (payload.interactive?.blocks?.length ?? 0) > 0 || Object.keys(payload.channelData ?? {}).length > 0;
}
function pickLastDeliverablePayload(payloads) {
	for (let i = payloads.length - 1; i >= 0; i--) {
		if (payloads[i]?.isError) continue;
		if (isDeliverablePayload(payloads[i])) return payloads[i];
	}
	for (let i = payloads.length - 1; i >= 0; i--) if (isDeliverablePayload(payloads[i])) return payloads[i];
}
function pickDeliverablePayloads(payloads) {
	const successfulDeliverablePayloads = payloads.filter((payload) => payload != null && payload.isError !== true && isDeliverablePayload(payload));
	if (successfulDeliverablePayloads.length > 0) return successfulDeliverablePayloads;
	const lastDeliverablePayload = pickLastDeliverablePayload(payloads);
	return lastDeliverablePayload ? [lastDeliverablePayload] : [];
}
/**
* Check if delivery should be skipped because the agent signaled no user-visible update.
* Returns true when any payload is a heartbeat ack token and no payload contains media.
*/
function isHeartbeatOnlyResponse(payloads, ackMaxChars) {
	return shouldSkipHeartbeatOnlyDelivery(payloads, ackMaxChars);
}
function resolveHeartbeatAckMaxChars(agentCfg) {
	const raw = agentCfg?.heartbeat?.ackMaxChars ?? 300;
	return Math.max(0, raw);
}
function resolveCronPayloadOutcome(params) {
	const firstText = params.payloads[0]?.text ?? "";
	const fallbackSummary = pickSummaryFromPayloads(params.payloads) ?? pickSummaryFromOutput(firstText);
	const fallbackOutputText = pickLastNonEmptyTextFromPayloads(params.payloads);
	const deliveryPayload = pickLastDeliverablePayload(params.payloads);
	const selectedDeliveryPayloads = pickDeliverablePayloads(params.payloads);
	const deliveryPayloadHasStructuredContent = payloadHasStructuredDeliveryContent(deliveryPayload);
	const hasErrorPayload = params.payloads.some((payload) => payload?.isError === true);
	const lastErrorPayloadIndex = params.payloads.findLastIndex((payload) => payload?.isError === true);
	const hasSuccessfulPayloadAfterLastError = !params.runLevelError && lastErrorPayloadIndex >= 0 && params.payloads.slice(lastErrorPayloadIndex + 1).some((payload) => payload?.isError !== true && Boolean(payload?.text?.trim()));
	const hasFatalErrorPayload = hasErrorPayload && !hasSuccessfulPayloadAfterLastError;
	const normalizedFinalAssistantVisibleText = normalizeOptionalString(params.finalAssistantVisibleText);
	const hasStructuredDeliveryPayloads = selectedDeliveryPayloads.some((payload) => payloadHasStructuredDeliveryContent(payload));
	const shouldUseFinalAssistantVisibleText = params.preferFinalAssistantVisibleText === true && normalizedFinalAssistantVisibleText !== void 0 && !hasFatalErrorPayload && !hasStructuredDeliveryPayloads;
	const summary = shouldUseFinalAssistantVisibleText ? pickSummaryFromOutput(normalizedFinalAssistantVisibleText) ?? fallbackSummary : fallbackSummary;
	const outputText = shouldUseFinalAssistantVisibleText ? normalizedFinalAssistantVisibleText : fallbackOutputText;
	const synthesizedText = normalizeOptionalString(outputText) ?? normalizeOptionalString(summary);
	const resolvedDeliveryPayloads = shouldUseFinalAssistantVisibleText ? [{ text: normalizedFinalAssistantVisibleText }] : selectedDeliveryPayloads.length > 0 ? selectedDeliveryPayloads : synthesizedText ? [{ text: synthesizedText }] : [];
	const lastErrorPayloadText = [...params.payloads].toReversed().find((payload) => payload?.isError === true && Boolean(payload?.text?.trim()))?.text?.trim();
	return {
		summary,
		outputText,
		synthesizedText,
		deliveryPayload,
		deliveryPayloads: resolvedDeliveryPayloads,
		deliveryPayloadHasStructuredContent,
		hasFatalErrorPayload,
		embeddedRunError: hasFatalErrorPayload ? lastErrorPayloadText ?? "cron isolated run returned an error payload" : void 0
	};
}
//#endregion
export { resolveHeartbeatAckMaxChars as a, resolveCronPayloadOutcome as i, pickLastNonEmptyTextFromPayloads as n, pickSummaryFromOutput as r, isHeartbeatOnlyResponse as t };
