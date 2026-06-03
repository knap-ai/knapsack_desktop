import { runGatewayCommand } from "./run-BG5Tcrgc.js";

await runGatewayCommand({
	allowUnconfigured: true,
	bind: "loopback",
	auth: "token",
	token: process.env.OPENCLAW_GATEWAY_TOKEN,
	port: process.env.OPENCLAW_GATEWAY_PORT ?? "18789"
});
