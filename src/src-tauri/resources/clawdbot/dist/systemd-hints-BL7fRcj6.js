import { t as formatCliCommand } from "./command-format-ChfKqObn.js";

//#region src/daemon/systemd-hints.ts
function isSystemdUnavailableDetail(detail) {
	if (!detail) return false;
	const normalized = detail.toLowerCase();
	return normalized.includes("systemctl --user unavailable") || normalized.includes("systemctl not available") || normalized.includes("not been booted with systemd") || normalized.includes("failed to connect to bus") || normalized.includes("systemd user services are required");
}
function renderSystemdUnavailableHints(options = {}) {
	if (options.wsl) return [
		"WSL2 needs systemd enabled: edit /etc/wsl.conf with [boot]\\nsystemd=true",
		"Then run: wsl --shutdown (from PowerShell) and reopen your distro.",
		"Verify: systemctl --user status"
	];
	return ["systemd user services are unavailable; install/enable systemd or run the gateway under your supervisor.", `If you're in a container, run the gateway in the foreground instead of \`${formatCliCommand("openclaw gateway")}\`.`];
}

//#endregion
export { renderSystemdUnavailableHints as n, isSystemdUnavailableDetail as t };