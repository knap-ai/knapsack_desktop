import { t as formatDocsLink } from "./links-Ce33eXq9.js";
import { r as theme } from "./theme-D-TumEpz.js";
import { t as registerQrCli } from "./qr-cli-DACCeEfN.js";
//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}
//#endregion
export { registerClawbotCli };
