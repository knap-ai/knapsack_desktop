import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { whatsappPlugin } from "./src/channel.js";
import { setWhatsAppRuntime } from "./src/runtime.js";
import { handleLoginWithPhone } from "./src/login-phone.js";

const plugin = {
  id: "whatsapp",
  name: "WhatsApp",
  description: "WhatsApp channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setWhatsAppRuntime(api.runtime);
    api.registerChannel({ plugin: whatsappPlugin });
    api.registerGatewayMethod("web.login.phone", handleLoginWithPhone);
  },
};

export default plugin;
