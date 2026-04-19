import { t as formatDocsLink } from "./links-Dp5-Wbn2.js";
import { r as theme } from "./theme-D5sxSdHD.js";
import { t as addGatewayServiceCommands } from "./register-service-commands-DyCdrZnc.js";
import "./install-CUhZoJJ0.js";
import "./lifecycle-CKbsl_IO.js";
import "./status-TqcIdMwO.js";
//#region src/cli/daemon-cli/register.ts
function registerDaemonCli(program) {
	addGatewayServiceCommands(program.command("daemon").description("Manage the Gateway service (launchd/systemd/schtasks)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/gateway", "docs.openclaw.ai/cli/gateway")}\n`), { statusDescription: "Show service install status + probe the Gateway" });
}
//#endregion
export { registerDaemonCli as t };
