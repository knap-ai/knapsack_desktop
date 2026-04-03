import { s as SignalConfigSchema } from "./zod-schema.providers-core-BJorTsd7.js";
import { r as buildChannelConfigSchema } from "./config-schema-BoSEJoAt.js";
import "./channel-config-schema-BAlK8Vas.js";
//#endregion
//#region extensions/signal/src/config-schema.ts
const SignalChannelConfigSchema = buildChannelConfigSchema(SignalConfigSchema, { uiHints: {
	"": {
		label: "Signal",
		help: "Signal channel provider configuration including account identity and DM policy behavior. Keep account mapping explicit so routing remains stable across multi-device setups."
	},
	dmPolicy: {
		label: "Signal DM Policy",
		help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.signal.allowFrom=[\"*\"]."
	},
	configWrites: {
		label: "Signal Config Writes",
		help: "Allow Signal to write config in response to channel events/commands (default: true)."
	},
	account: {
		label: "Signal Account",
		help: "Signal account identifier (phone/number handle) used to bind this channel config to a specific Signal identity. Keep this aligned with your linked device/session state."
	}
} });
//#endregion
export { SignalChannelConfigSchema as t };
