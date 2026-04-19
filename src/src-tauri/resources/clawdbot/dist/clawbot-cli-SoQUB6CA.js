import { t as formatDocsLink } from "./links-Dp5-Wbn2.js";
import { r as theme } from "./theme-D5sxSdHD.js";
import { t as registerQrCli } from "./qr-cli-Z3gWMQdU.js";
//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}
//#endregion
export { registerClawbotCli };
