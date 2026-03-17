import "./paths-tuenh9TL.js";
import "./subsystem-D2xHvZZd.js";
import "./theme-CipOb_We.js";
import "./utils-DwZbjiC4.js";
import { At as randomToken, Pt as validateGatewayPasswordInput, Tt as normalizeGatewayTokenInput, Z_ as ensureControlUiAllowedOriginsForNonLoopbackBind, mg as findTailscaleBinary } from "./reply-Bm8VrLQh.js";
import "./agent-scope-DvYJ0Ktc.js";
import "./openclaw-root-3m-COvjr.js";
import "./logger-BZyLeV9r.js";
import "./exec-BQevMHrc.js";
import { d as resolveSecretInputRef, l as normalizeSecretInputString } from "./types.secrets-ZqKzSyNC.js";
import "./github-copilot-token-Dz62-0BI.js";
import "./boolean-CJxfhBkG.js";
import "./env-CqXKEsUZ.js";
import "./env-overrides-DfvB37sI.js";
import "./registry-DIAhVWwq.js";
import "./skills-CZKYRFRI.js";
import "./frontmatter-7FVJq8_7.js";
import "./plugins-Csb211Yn.js";
import "./query-expansion-CxfqvqXX.js";
import "./redact-BaAECW8K.js";
import "./path-alias-guards-DSeY3vyo.js";
import "./fetch-DdL1XWlW.js";
import "./errors-C1t_6llh.js";
import "./cmd-argv-GXSSysSW.js";
import "./delivery-queue-B182HpX5.js";
import "./paths-DBVuZIGo.js";
import "./session-cost-usage-BlB91_zm.js";
import "./prompt-style-ytG4p-pp.js";
import "./links-D1S6as3q.js";
import "./cli-utils-BSURvrmb.js";
import "./provider-env-vars-LOwkO_0R.js";
import { c as resolveSecretInputModeForEnvSelection, s as promptSecretRefForOnboarding } from "./auth-choice.apply-helpers-CXpFCGqS.js";
import { t as resolveOnboardingSecretInputString } from "./onboarding.secret-input-D5jZMbjF.js";
import { t as DEFAULT_DANGEROUS_NODE_COMMANDS } from "./node-command-policy-CBt-HNiN.js";
import { a as maybeAddTailnetOriginToControlUiAllowedOrigins, i as TAILSCALE_MISSING_BIN_NOTE_LINES, n as TAILSCALE_DOCS_LINES, r as TAILSCALE_EXPOSURE_OPTIONS, t as validateIPv4AddressInput } from "./ipv4-CdTqLXVq.js";
//#region src/wizard/onboarding.gateway-config.ts
async function configureGatewayForOnboarding(opts) {
	const { flow, localPort, quickstartGateway, prompter } = opts;
	let { nextConfig } = opts;
	const port = flow === "quickstart" ? quickstartGateway.port : Number.parseInt(String(await prompter.text({
		message: "Gateway port",
		initialValue: String(localPort),
		validate: (value) => Number.isFinite(Number(value)) ? void 0 : "Invalid port"
	})), 10);
	let bind = flow === "quickstart" ? quickstartGateway.bind : await prompter.select({
		message: "Gateway bind",
		options: [
			{
				value: "loopback",
				label: "Loopback (127.0.0.1)"
			},
			{
				value: "lan",
				label: "LAN (0.0.0.0)"
			},
			{
				value: "tailnet",
				label: "Tailnet (Tailscale IP)"
			},
			{
				value: "auto",
				label: "Auto (Loopback → LAN)"
			},
			{
				value: "custom",
				label: "Custom IP"
			}
		]
	});
	let customBindHost = quickstartGateway.customBindHost;
	if (bind === "custom") {
		if (flow !== "quickstart" || !customBindHost) {
			const input = await prompter.text({
				message: "Custom IP address",
				placeholder: "192.168.1.100",
				initialValue: customBindHost ?? "",
				validate: validateIPv4AddressInput
			});
			customBindHost = typeof input === "string" ? input.trim() : void 0;
		}
	}
	let authMode = flow === "quickstart" ? quickstartGateway.authMode : await prompter.select({
		message: "Gateway auth",
		options: [{
			value: "token",
			label: "Token",
			hint: "Recommended default (local + remote)"
		}, {
			value: "password",
			label: "Password"
		}],
		initialValue: "token"
	});
	const tailscaleMode = flow === "quickstart" ? quickstartGateway.tailscaleMode : await prompter.select({
		message: "Tailscale exposure",
		options: [...TAILSCALE_EXPOSURE_OPTIONS]
	});
	let tailscaleBin = null;
	if (tailscaleMode !== "off") {
		tailscaleBin = await findTailscaleBinary();
		if (!tailscaleBin) await prompter.note(TAILSCALE_MISSING_BIN_NOTE_LINES.join("\n"), "Tailscale Warning");
	}
	let tailscaleResetOnExit = flow === "quickstart" ? quickstartGateway.tailscaleResetOnExit : false;
	if (tailscaleMode !== "off" && flow !== "quickstart") {
		await prompter.note(TAILSCALE_DOCS_LINES.join("\n"), "Tailscale");
		tailscaleResetOnExit = Boolean(await prompter.confirm({
			message: "Reset Tailscale serve/funnel on exit?",
			initialValue: false
		}));
	}
	if (tailscaleMode !== "off" && bind !== "loopback") {
		await prompter.note("Tailscale requires bind=loopback. Adjusting bind to loopback.", "Note");
		bind = "loopback";
		customBindHost = void 0;
	}
	if (tailscaleMode === "funnel" && authMode !== "password") {
		await prompter.note("Tailscale funnel requires password auth.", "Note");
		authMode = "password";
	}
	let gatewayToken;
	let gatewayTokenInput;
	if (authMode === "token") {
		const quickstartTokenString = normalizeSecretInputString(quickstartGateway.token);
		const quickstartTokenRef = resolveSecretInputRef({
			value: quickstartGateway.token,
			defaults: nextConfig.secrets?.defaults
		}).ref;
		if ((flow === "quickstart" && opts.secretInputMode !== "ref" ? quickstartTokenRef ? "ref" : "plaintext" : await resolveSecretInputModeForEnvSelection({
			prompter,
			explicitMode: opts.secretInputMode,
			copy: {
				modeMessage: "How do you want to provide the gateway token?",
				plaintextLabel: "Generate/store plaintext token",
				plaintextHint: "Default",
				refLabel: "Use SecretRef",
				refHint: "Store a reference instead of plaintext"
			}
		})) === "ref") if (flow === "quickstart" && quickstartTokenRef) {
			gatewayTokenInput = quickstartTokenRef;
			gatewayToken = await resolveOnboardingSecretInputString({
				config: nextConfig,
				value: quickstartTokenRef,
				path: "gateway.auth.token",
				env: process.env
			});
		} else {
			const resolved = await promptSecretRefForOnboarding({
				provider: "gateway-auth-token",
				config: nextConfig,
				prompter,
				preferredEnvVar: "OPENCLAW_GATEWAY_TOKEN",
				copy: {
					sourceMessage: "Where is this gateway token stored?",
					envVarPlaceholder: "OPENCLAW_GATEWAY_TOKEN"
				}
			});
			gatewayTokenInput = resolved.ref;
			gatewayToken = resolved.resolvedValue;
		}
		else if (flow === "quickstart") {
			gatewayToken = (quickstartTokenString ?? normalizeGatewayTokenInput(process.env.OPENCLAW_GATEWAY_TOKEN)) || randomToken();
			gatewayTokenInput = gatewayToken;
		} else {
			gatewayToken = normalizeGatewayTokenInput(await prompter.text({
				message: "Gateway token (blank to generate)",
				placeholder: "Needed for multi-machine or non-loopback access",
				initialValue: quickstartTokenString ?? normalizeGatewayTokenInput(process.env.OPENCLAW_GATEWAY_TOKEN) ?? ""
			})) || randomToken();
			gatewayTokenInput = gatewayToken;
		}
	}
	if (authMode === "password") {
		let password = flow === "quickstart" && quickstartGateway.password ? quickstartGateway.password : void 0;
		if (!password) if (await resolveSecretInputModeForEnvSelection({
			prompter,
			explicitMode: opts.secretInputMode,
			copy: {
				modeMessage: "How do you want to provide the gateway password?",
				plaintextLabel: "Enter password now",
				plaintextHint: "Stores the password directly in OpenClaw config"
			}
		}) === "ref") password = (await promptSecretRefForOnboarding({
			provider: "gateway-auth-password",
			config: nextConfig,
			prompter,
			preferredEnvVar: "OPENCLAW_GATEWAY_PASSWORD",
			copy: {
				sourceMessage: "Where is this gateway password stored?",
				envVarPlaceholder: "OPENCLAW_GATEWAY_PASSWORD"
			}
		})).ref;
		else password = String(await prompter.text({
			message: "Gateway password",
			validate: validateGatewayPasswordInput
		}) ?? "").trim();
		nextConfig = {
			...nextConfig,
			gateway: {
				...nextConfig.gateway,
				auth: {
					...nextConfig.gateway?.auth,
					mode: "password",
					password
				}
			}
		};
	} else if (authMode === "token") nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			auth: {
				...nextConfig.gateway?.auth,
				mode: "token",
				token: gatewayTokenInput
			}
		}
	};
	nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			port,
			bind,
			...bind === "custom" && customBindHost ? { customBindHost } : {},
			tailscale: {
				...nextConfig.gateway?.tailscale,
				mode: tailscaleMode,
				resetOnExit: tailscaleResetOnExit
			}
		}
	};
	nextConfig = ensureControlUiAllowedOriginsForNonLoopbackBind(nextConfig, { requireControlUiEnabled: true }).config;
	nextConfig = await maybeAddTailnetOriginToControlUiAllowedOrigins({
		config: nextConfig,
		tailscaleMode,
		tailscaleBin
	});
	if (!quickstartGateway.hasExisting && nextConfig.gateway?.nodes?.denyCommands === void 0 && nextConfig.gateway?.nodes?.allowCommands === void 0 && nextConfig.gateway?.nodes?.browser === void 0) nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			nodes: {
				...nextConfig.gateway?.nodes,
				denyCommands: [...DEFAULT_DANGEROUS_NODE_COMMANDS]
			}
		}
	};
	return {
		nextConfig,
		settings: {
			port,
			bind,
			customBindHost: bind === "custom" ? customBindHost : void 0,
			authMode,
			gatewayToken,
			tailscaleMode,
			tailscaleResetOnExit
		}
	};
}
//#endregion
export { configureGatewayForOnboarding };
