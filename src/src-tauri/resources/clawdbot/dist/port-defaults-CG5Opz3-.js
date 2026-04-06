//#region src/config/port-defaults.ts
function isValidPort(port) {
	return Number.isFinite(port) && port > 0 && port <= 65535;
}
function clampPort(port, fallback) {
	return isValidPort(port) ? port : fallback;
}
function derivePort(base, offset, fallback) {
	return clampPort(base + offset, fallback);
}
const DEFAULT_BROWSER_CONTROL_PORT = 18791;
const DEFAULT_BROWSER_CDP_PORT_RANGE_START = 18800;
const DEFAULT_BROWSER_CDP_PORT_RANGE_END = 18899;
function deriveDefaultBrowserControlPort(gatewayPort) {
	return derivePort(gatewayPort, 2, DEFAULT_BROWSER_CONTROL_PORT);
}
function deriveDefaultBrowserCdpPortRange(browserControlPort) {
	const start = derivePort(browserControlPort, 9, DEFAULT_BROWSER_CDP_PORT_RANGE_START);
	const end = clampPort(start + (DEFAULT_BROWSER_CDP_PORT_RANGE_END - DEFAULT_BROWSER_CDP_PORT_RANGE_START), DEFAULT_BROWSER_CDP_PORT_RANGE_END);
	if (end < start) return {
		start,
		end: start
	};
	return {
		start,
		end
	};
}
//#endregion
export { deriveDefaultBrowserCdpPortRange as n, deriveDefaultBrowserControlPort as r, DEFAULT_BROWSER_CONTROL_PORT as t };
