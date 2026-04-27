import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import "./text-runtime-B1c54bxG.js";
import { t as normalizeWebhookPath } from "./webhook-path-fOHmFm_o.js";
//#region extensions/bluebubbles/src/webhook-shared.ts
const DEFAULT_WEBHOOK_PATH = "/bluebubbles-webhook";
function resolveWebhookPathFromConfig(config) {
	const raw = normalizeOptionalString(config?.webhookPath);
	if (raw) return normalizeWebhookPath(raw);
	return DEFAULT_WEBHOOK_PATH;
}
//#endregion
export { resolveWebhookPathFromConfig as n, DEFAULT_WEBHOOK_PATH as t };
