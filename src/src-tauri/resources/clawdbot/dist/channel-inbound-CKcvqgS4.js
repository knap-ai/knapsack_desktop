import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { t as hasControlCommand } from "./command-detection-C6edkeaW.js";
import { n as resolveInboundDebounceMs, t as createInboundDebouncer } from "./inbound-debounce-a9Z7UIuW.js";
import "./mentions-8V4_s3MO.js";
import "./direct-dm-DBZYYeR4.js";
import "./session-envelope-CuB14LAP.js";
//#region src/channels/inbound-debounce-policy.ts
function shouldDebounceTextInbound(params) {
	if (params.allowDebounce === false) return false;
	if (params.hasMedia) return false;
	const text = normalizeOptionalString(params.text) ?? "";
	if (!text) return false;
	return !hasControlCommand(text, params.cfg, params.commandOptions);
}
function createChannelInboundDebouncer(params) {
	const debounceMs = resolveInboundDebounceMs({
		cfg: params.cfg,
		channel: params.channel,
		overrideMs: params.debounceMsOverride
	});
	const { cfg: _cfg, channel: _channel, debounceMsOverride: _override, ...rest } = params;
	return {
		debounceMs,
		debouncer: createInboundDebouncer({
			debounceMs,
			...rest
		})
	};
}
//#endregion
export { shouldDebounceTextInbound as n, createChannelInboundDebouncer as t };
