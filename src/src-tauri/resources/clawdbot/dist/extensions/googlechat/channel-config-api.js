import { GoogleChatConfigSchema, buildChannelConfigSchema } from "openclaw/plugin-sdk/googlechat";
//#region extensions/googlechat/src/config-schema.ts
const GoogleChatChannelConfigSchema = buildChannelConfigSchema(GoogleChatConfigSchema);
//#endregion
export { GoogleChatChannelConfigSchema };
