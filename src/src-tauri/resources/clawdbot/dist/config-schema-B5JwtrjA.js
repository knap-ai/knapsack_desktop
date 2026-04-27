import { r as buildChannelConfigSchema } from "./config-schema-BEuj464I.js";
import { i as MSTeamsConfigSchema } from "./zod-schema.providers-core-Bl_XI-8U.js";
import "./channel-config-schema-Dy1n7pCO.js";
//#endregion
//#region extensions/msteams/src/config-schema.ts
const MSTeamsChannelConfigSchema = buildChannelConfigSchema(MSTeamsConfigSchema, { uiHints: {
	"": {
		label: "MS Teams",
		help: "Microsoft Teams channel provider configuration and provider-specific policy toggles. Use this section to isolate Teams behavior from other enterprise chat providers."
	},
	configWrites: {
		label: "MS Teams Config Writes",
		help: "Allow Microsoft Teams to write config in response to channel events/commands (default: true)."
	}
} });
//#endregion
export { MSTeamsChannelConfigSchema as t };
