import { n as runCommandWithTimeout } from "./exec-B5_AYfQG.js";
import { r as isWSLEnv, t as isWSL } from "./wsl-BVCo-dpy.js";
import { t as detectBinary } from "./setup-binary-C2MYZTCc.js";
//#region src/plugins/setup-browser.ts
function shouldSkipBrowserOpenInTests() {
	if (process.env.VITEST) return true;
	return false;
}
async function resolveBrowserOpenCommand() {
	const platform = process.platform;
	const hasDisplay = Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);
	if ((Boolean(process.env.SSH_CLIENT) || Boolean(process.env.SSH_TTY) || Boolean(process.env.SSH_CONNECTION)) && !hasDisplay && platform !== "win32") return { argv: null };
	if (platform === "win32") return {
		argv: [
			"cmd",
			"/c",
			"start",
			""
		],
		command: "cmd",
		quoteUrl: true
	};
	if (platform === "darwin") return await detectBinary("open") ? {
		argv: ["open"],
		command: "open"
	} : { argv: null };
	if (platform === "linux") {
		const wsl = await isWSL();
		if (!hasDisplay && !wsl) return { argv: null };
		if (wsl) {
			if (await detectBinary("wslview")) return {
				argv: ["wslview"],
				command: "wslview"
			};
			if (!hasDisplay) return { argv: null };
		}
		return await detectBinary("xdg-open") ? {
			argv: ["xdg-open"],
			command: "xdg-open"
		} : { argv: null };
	}
	return { argv: null };
}
function isRemoteEnvironment() {
	if (process.env.SSH_CLIENT || process.env.SSH_TTY || process.env.SSH_CONNECTION) return true;
	if (process.env.REMOTE_CONTAINERS || process.env.CODESPACES) return true;
	if (process.platform === "linux" && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY && !isWSLEnv()) return true;
	return false;
}
async function openUrl(url) {
	if (shouldSkipBrowserOpenInTests()) return false;
	const resolved = await resolveBrowserOpenCommand();
	if (!resolved.argv) return false;
	const quoteUrl = resolved.quoteUrl === true;
	const command = [...resolved.argv];
	if (quoteUrl) {
		if (command.at(-1) === "") command[command.length - 1] = "\"\"";
		command.push(`"${url}"`);
	} else command.push(url);
	try {
		await runCommandWithTimeout(command, {
			timeoutMs: 5e3,
			windowsVerbatimArguments: quoteUrl
		});
		return true;
	} catch {
		return false;
	}
}
//#endregion
export { openUrl as n, isRemoteEnvironment as t };
