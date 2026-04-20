import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-CeL3gSMO.js";
import { u as isPrivateIpAddress } from "./ssrf-DoOclwFS.js";
import "./text-runtime-DTMxvodz.js";
import "./secret-input-BEMaS7ol.js";
import "./setup-tools-ChX5E-WF.js";
import { o as isPrivateNetworkOptInEnabled } from "./ssrf-policy-CChtVzhj.js";
import { t as hasNonEmptyString } from "./record-shared-DQoQZOFY.js";
import { d as redactCdpUrl } from "./cdp.helpers-CJUeV0SO.js";
import { n as resolveBrowserControlAuth } from "./control-auth-hABiqRrk.js";
import { n as resolveProfile, t as resolveBrowserConfig } from "./config-DldYxDHs.js";
import "./browser-runtime-BNxd-J_h.js";
import "./plugin-service-BY9Z-wOO.js";
//#region extensions/browser/src/security-audit.ts
const BLOCKED_HOSTNAMES = new Set([
	"localhost",
	"localhost.localdomain",
	"metadata.google.internal"
]);
function isTrustedPrivateHostname(hostname) {
	const normalized = normalizeLowercaseStringOrEmpty(hostname);
	return normalized.length > 0 && BLOCKED_HOSTNAMES.has(normalized);
}
function collectBrowserSecurityAuditFindings(ctx) {
	const findings = [];
	let resolved;
	try {
		resolved = resolveBrowserConfig(ctx.config.browser, ctx.config);
	} catch (err) {
		findings.push({
			checkId: "browser.control_invalid_config",
			severity: "warn",
			title: "Browser control config looks invalid",
			detail: String(err),
			remediation: `Fix browser.cdpUrl in ${ctx.configPath} and re-run "${formatCliCommand("openclaw security audit --deep")}".`
		});
		return findings;
	}
	if (!resolved.enabled) return findings;
	const browserAuth = resolveBrowserControlAuth(ctx.config, ctx.env);
	const explicitAuthMode = ctx.config.gateway?.auth?.mode;
	const tokenConfigured = Boolean(browserAuth.token) || hasNonEmptyString(ctx.env.OPENCLAW_GATEWAY_TOKEN) || hasConfiguredSecretInput(ctx.config.gateway?.auth?.token, ctx.config.secrets?.defaults);
	const passwordCanWin = explicitAuthMode === "password" || explicitAuthMode !== "token" && explicitAuthMode !== "none" && explicitAuthMode !== "trusted-proxy" && !tokenConfigured;
	const passwordConfigured = Boolean(browserAuth.password) || passwordCanWin && (hasNonEmptyString(ctx.env.OPENCLAW_GATEWAY_PASSWORD) || hasConfiguredSecretInput(ctx.config.gateway?.auth?.password, ctx.config.secrets?.defaults));
	if (!tokenConfigured && !passwordConfigured) findings.push({
		checkId: "browser.control_no_auth",
		severity: "critical",
		title: "Browser control has no auth",
		detail: "Browser control HTTP routes are enabled but no gateway.auth token/password is configured. Any local process (or SSRF to loopback) can call browser control endpoints.",
		remediation: "Set gateway.auth.token (recommended) or gateway.auth.password so browser control HTTP routes require authentication. Restarting the gateway will auto-generate gateway.auth.token when browser control is enabled."
	});
	for (const name of Object.keys(resolved.profiles)) {
		const profile = resolveProfile(resolved, name);
		if (!profile || profile.cdpIsLoopback) continue;
		let url;
		try {
			url = new URL(profile.cdpUrl);
		} catch {
			continue;
		}
		const redactedCdpUrl = redactCdpUrl(profile.cdpUrl) ?? profile.cdpUrl;
		if (url.protocol === "http:") findings.push({
			checkId: "browser.remote_cdp_http",
			severity: "warn",
			title: "Remote CDP uses HTTP",
			detail: `browser profile "${name}" uses http CDP (${redactedCdpUrl}); this is OK only if it's tailnet-only or behind an encrypted tunnel.`,
			remediation: "Prefer HTTPS/TLS or a tailnet-only endpoint for remote CDP."
		});
		if (isPrivateNetworkOptInEnabled(resolved.ssrfPolicy) && (isTrustedPrivateHostname(url.hostname) || isPrivateIpAddress(url.hostname))) findings.push({
			checkId: "browser.remote_cdp_private_host",
			severity: "warn",
			title: "Remote CDP targets a private/internal host",
			detail: `browser profile "${name}" points at a private/internal CDP host (${redactedCdpUrl}). This is expected for LAN/tailnet/WSL-style setups, but treat it as a trusted-network endpoint.`,
			remediation: "Prefer a tailnet or tunnel for remote CDP. If you want strict blocking, set browser.ssrfPolicy.dangerouslyAllowPrivateNetwork=false and allow only explicit hosts."
		});
	}
	return findings;
}
//#endregion
export { collectBrowserSecurityAuditFindings as t };
