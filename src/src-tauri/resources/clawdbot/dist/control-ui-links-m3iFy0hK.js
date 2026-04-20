import { u as isValidIPv4 } from "./net-lBInRHnX.js";
import { n as pickBestEffortPrimaryLanIPv4, t as inspectBestEffortPrimaryTailnetIPv4 } from "./network-discovery-display-CXEbPtF0.js";
import { r as normalizeControlUiBasePath } from "./control-ui-shared-DLBboEro.js";
//#region src/gateway/control-ui-links.ts
function resolveControlUiLinks(params) {
	const port = params.port;
	const bind = params.bind ?? "loopback";
	const customBindHost = params.customBindHost?.trim();
	const { tailnetIPv4 } = inspectBestEffortPrimaryTailnetIPv4();
	const host = (() => {
		if (bind === "custom" && customBindHost && isValidIPv4(customBindHost)) return customBindHost;
		if (bind === "tailnet" && tailnetIPv4) return tailnetIPv4 ?? "127.0.0.1";
		if (bind === "lan") return pickBestEffortPrimaryLanIPv4() ?? "127.0.0.1";
		return "127.0.0.1";
	})();
	const basePath = normalizeControlUiBasePath(params.basePath);
	const uiPath = basePath ? `${basePath}/` : "/";
	const wsPath = basePath ? basePath : "";
	return {
		httpUrl: `http://${host}:${port}${uiPath}`,
		wsUrl: `ws://${host}:${port}${wsPath}`
	};
}
//#endregion
export { resolveControlUiLinks as t };
