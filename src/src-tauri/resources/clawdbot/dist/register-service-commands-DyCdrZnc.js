import { n as inheritOptionFromParent } from "./command-options-0jYAGXoL.js";
//#region src/cli/daemon-cli/register-service-commands.ts
let daemonInstallModulePromise;
let daemonLifecycleModulePromise;
let daemonStatusModulePromise;
function loadDaemonInstallModule() {
	daemonInstallModulePromise ??= import("./install.runtime-8gxteKEA.js");
	return daemonInstallModulePromise;
}
function loadDaemonLifecycleModule() {
	daemonLifecycleModulePromise ??= import("./lifecycle.runtime-DZ3TSSmz.js");
	return daemonLifecycleModulePromise;
}
function loadDaemonStatusModule() {
	daemonStatusModulePromise ??= import("./status.runtime-BnTe-Qkj.js");
	return daemonStatusModulePromise;
}
function resolveInstallOptions(cmdOpts, command) {
	const parentForce = inheritOptionFromParent(command, "force");
	const parentPort = inheritOptionFromParent(command, "port");
	const parentToken = inheritOptionFromParent(command, "token");
	return {
		...cmdOpts,
		force: Boolean(cmdOpts.force || parentForce),
		port: cmdOpts.port ?? parentPort,
		token: cmdOpts.token ?? parentToken
	};
}
function resolveRpcOptions(cmdOpts, command) {
	const parentToken = inheritOptionFromParent(command, "token");
	const parentPassword = inheritOptionFromParent(command, "password");
	return {
		...cmdOpts,
		token: cmdOpts.token ?? parentToken,
		password: cmdOpts.password ?? parentPassword
	};
}
function addGatewayServiceCommands(parent, opts) {
	parent.command("status").description(opts?.statusDescription ?? "Show gateway service status + probe the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to config/remote/local)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (password auth)").option("--timeout <ms>", "Timeout in ms", "10000").option("--no-probe", "Skip RPC probe").option("--require-rpc", "Exit non-zero when the RPC probe fails", false).option("--deep", "Scan system-level services", false).option("--json", "Output JSON", false).action(async (cmdOpts, command) => {
		const { runDaemonStatus } = await loadDaemonStatusModule();
		await runDaemonStatus({
			rpc: resolveRpcOptions(cmdOpts, command),
			probe: Boolean(cmdOpts.probe),
			requireRpc: Boolean(cmdOpts.requireRpc),
			deep: Boolean(cmdOpts.deep),
			json: Boolean(cmdOpts.json)
		});
	});
	parent.command("install").description("Install the Gateway service (launchd/systemd/schtasks)").option("--port <port>", "Gateway port").option("--runtime <runtime>", "Daemon runtime (node|bun). Default: node").option("--token <token>", "Gateway token (token auth)").option("--force", "Reinstall/overwrite if already installed", false).option("--json", "Output JSON", false).action(async (cmdOpts, command) => {
		const { runDaemonInstall } = await loadDaemonInstallModule();
		await runDaemonInstall(resolveInstallOptions(cmdOpts, command));
	});
	parent.command("uninstall").description("Uninstall the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (cmdOpts) => {
		const { runDaemonUninstall } = await loadDaemonLifecycleModule();
		await runDaemonUninstall(cmdOpts);
	});
	parent.command("start").description("Start the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (cmdOpts) => {
		const { runDaemonStart } = await loadDaemonLifecycleModule();
		await runDaemonStart(cmdOpts);
	});
	parent.command("stop").description("Stop the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (cmdOpts) => {
		const { runDaemonStop } = await loadDaemonLifecycleModule();
		await runDaemonStop(cmdOpts);
	});
	parent.command("restart").description("Restart the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (cmdOpts) => {
		const { runDaemonRestart } = await loadDaemonLifecycleModule();
		await runDaemonRestart(cmdOpts);
	});
}
//#endregion
export { addGatewayServiceCommands as t };
