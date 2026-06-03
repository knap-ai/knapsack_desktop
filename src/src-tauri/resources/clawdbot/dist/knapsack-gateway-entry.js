import { runGatewayCommand } from "./run-BG5Tcrgc.js";

setTimeout(async () => {
	try {
		const { t: startBrowserControlServiceFromConfig } = await import("./control-service-QFP_AmWr.js");
		await startBrowserControlServiceFromConfig();
	} catch (err) {
		console.warn(`[gateway] early browser-control warm start failed: ${String(err)}`);
	}
}, 7500);

await runGatewayCommand({
	allowUnconfigured: true,
	bind: "loopback",
	auth: "token",
	token: process.env.OPENCLAW_GATEWAY_TOKEN,
	port: process.env.OPENCLAW_GATEWAY_PORT ?? "18789"
});
