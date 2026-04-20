import { o as OPENROUTER_THINKING_STREAM_HOOKS } from "./provider-stream-DMhSzU-H.js";
import "./provider-stream-family-CjEB-fh0.js";
//#region extensions/openrouter/stream.ts
function injectOpenRouterRouting(baseStreamFn, providerRouting) {
	if (!providerRouting) return baseStreamFn;
	return (model, context, options) => (baseStreamFn ?? ((nextModel) => {
		throw new Error(`OpenRouter routing wrapper requires an underlying streamFn for ${nextModel.id}.`);
	}))({
		...model,
		compat: {
			...model.compat,
			openRouterRouting: providerRouting
		}
	}, context, options);
}
function wrapOpenRouterProviderStream(ctx) {
	const providerRouting = ctx.extraParams?.provider != null && typeof ctx.extraParams.provider === "object" ? ctx.extraParams.provider : void 0;
	const routedStreamFn = providerRouting ? injectOpenRouterRouting(ctx.streamFn, providerRouting) : ctx.streamFn;
	const wrapStreamFn = OPENROUTER_THINKING_STREAM_HOOKS.wrapStreamFn ?? void 0;
	if (!wrapStreamFn) return routedStreamFn;
	return wrapStreamFn({
		...ctx,
		streamFn: routedStreamFn
	}) ?? void 0;
}
//#endregion
export { wrapOpenRouterProviderStream as t };
