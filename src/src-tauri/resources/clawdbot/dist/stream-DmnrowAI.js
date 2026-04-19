import { r as streamWithPayloadPatch } from "./moonshot-thinking-stream-wrappers-B057G_9z.js";
import { t as applyAnthropicEphemeralCacheControlMarkers } from "./anthropic-payload-policy-DKgsteMF.js";
import { r as hasCopilotVisionInput, t as buildCopilotDynamicHeaders } from "./copilot-dynamic-headers-CYppRNbP.js";
import "./provider-stream-shared-DisAYlnl.js";
import { streamSimple } from "@mariozechner/pi-ai";
//#region extensions/github-copilot/stream.ts
function wrapCopilotAnthropicStream(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (model.provider !== "github-copilot" || model.api !== "anthropic-messages") return underlying(model, context, options);
		return streamWithPayloadPatch(underlying, model, context, {
			...options,
			headers: {
				...buildCopilotDynamicHeaders({
					messages: context.messages,
					hasImages: hasCopilotVisionInput(context.messages)
				}),
				...options?.headers
			}
		}, applyAnthropicEphemeralCacheControlMarkers);
	};
}
function wrapCopilotProviderStream(ctx) {
	return wrapCopilotAnthropicStream(ctx.streamFn);
}
//#endregion
export { wrapCopilotProviderStream as n, wrapCopilotAnthropicStream as t };
