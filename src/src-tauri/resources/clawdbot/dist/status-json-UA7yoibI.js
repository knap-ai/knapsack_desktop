import { t as runStatusJsonCommand } from "./status-json-command-DI8GDJl0.js";
import { t as scanStatusJsonFast } from "./status.scan.fast-json-QPjsr6eU.js";
//#region src/commands/status-json.ts
async function statusJsonCommand(opts, runtime) {
	await runStatusJsonCommand({
		opts,
		runtime,
		scanStatusJsonFast,
		includeSecurityAudit: opts.all === true,
		suppressHealthErrors: true
	});
}
//#endregion
export { statusJsonCommand };
