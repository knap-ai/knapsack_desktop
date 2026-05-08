import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import "./text-runtime-DfALcXL5.js";
import { t as normalizeWebhookPath } from "./webhook-path-Bsl9dK_8.js";
//#region extensions/bluebubbles/src/webhook-shared.ts
const DEFAULT_WEBHOOK_PATH = "/bluebubbles-webhook";
function resolveWebhookPathFromConfig(config) {
	const raw = normalizeOptionalString(config?.webhookPath);
	if (raw) return normalizeWebhookPath(raw);
	return DEFAULT_WEBHOOK_PATH;
}
//#endregion
export { resolveWebhookPathFromConfig as n, DEFAULT_WEBHOOK_PATH as t };
