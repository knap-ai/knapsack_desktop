import { runGatewayCommand } from "./run-BG5Tcrgc.js";
import { t as startBrowserControlServiceFromConfig } from "./control-service-QFP_AmWr.js";

setTimeout(() => {
	startBrowserControlServiceFromConfig().catch((err) => {
		console.warn(`[gateway] early browser-control warm start failed: ${String(err)}`);
	});
}, 0);

await runGatewayCommand({
	allowUnconfigured: true,
	bind: "loopback",
	auth: "token",
	token: process.env.OPENCLAW_GATEWAY_TOKEN,
	port: process.env.OPENCLAW_GATEWAY_PORT ?? "18789"
});
