#!/usr/bin/env node
import { g as resolveStateDir, i as isNixMode, m as resolveOAuthDir, o as resolveConfigPath, u as resolveGatewayPort } from "./paths-DVBShlw6.js";
import { B as theme, O as danger, P as setVerbose, R as colorize, _ as DEFAULT_CHAT_CHANNEL, b as getChatChannelMeta, c as visibleWidth, d as restoreTerminalState, k as info, r as enableConsoleCapture, u as defaultRuntime, w as normalizeChatChannelId, z as isRich } from "./subsystem-QRNIBE7-.js";
import { C as shortenHomePath, E as toWhatsappJid, S as shortenHomeInString, b as resolveUserPath, h as normalizeE164, n as assertWebChannel, v as resolveHomeDir } from "./utils-CrauP1IK.js";
import "./pi-embedded-helpers-BMGOFUCT.js";
import { B as CHANNEL_MESSAGE_ACTION_NAMES, R as formatTargetDisplay, ft as CHANNEL_TARGETS_DESCRIPTION, j as runMessageAction, pt as CHANNEL_TARGET_DESCRIPTION, rn as registerMemoryCli, t as getReplyFromConfig, wt as resolveCommitHash, yr as lookupContextTokens } from "./reply-BNEkWD6b.js";
import { l as normalizeAgentId, n as DEFAULT_AGENT_ID, t as DEFAULT_ACCOUNT_ID } from "./session-key-BWxPj0z_.js";
import { n as runExec, t as runCommandWithTimeout } from "./exec-BDyx_yxc.js";
import { c as resolveDefaultAgentId, f as DEFAULT_AGENT_WORKSPACE_DIR, h as DEFAULT_IDENTITY_FILENAME, r as resolveAgentDir, s as resolveAgentWorkspaceDir, t as listAgentIds, w as resolveDefaultAgentWorkspaceDir, x as ensureAgentWorkspace } from "./agent-scope-DMGrQp5u.js";
import { At as normalizeOptionalSecretInput, Ct as ensureAuthProfileStore, Et as resolveAuthStorePath, Ft as DEFAULT_CONTEXT_TOKENS, It as DEFAULT_MODEL, Lt as DEFAULT_PROVIDER, W as resolveEnvApiKey, d as resolveConfiguredModelRef, ft as resolveApiKeyForProfile, jt as normalizeSecretInput, s as normalizeProviderId, st as resolveAuthProfileOrder, xt as upsertAuthProfile } from "./model-selection-D37iyQY4.js";
import "./github-copilot-token-CiF5Iyi2.js";
import { n as replaceCliName, r as resolveCliName, t as formatCliCommand } from "./command-format-ChfKqObn.js";
import { t as parseBooleanValue } from "./boolean-BgXe2hyu.js";
import { r as normalizeEnv, t as isTruthyEnvValue } from "./env-BSjH4KuP.js";
import { F as VERSION, I as loadDotEnv, _ as parseDurationMs, i as loadConfig, l as writeConfigFile, o as readConfigFileSnapshot, r as createConfigIO } from "./config-CWifpzL_.js";
import "./manifest-registry-DFR7U7LS.js";
import { n as listChannelPlugins, r as normalizeChannelId, t as getChannelPlugin } from "./plugins-CLo5nH74.js";
import { O as resolveFreshSessionTotalTokens, b as deriveSessionKey, i as loadSessionStore, s as saveSessionStore, x as resolveSessionKey } from "./sessions-ezP1qtWM.js";
import { d as installUnhandledRejectionHandler, v as applyTemplate } from "./runner-BDxtyEy4.js";
import "./image-w4Unf0wW.js";
import "./pi-model-discovery-EwKVHlZB.js";
import "./sandbox-BOXx_Lgl.js";
import "./chrome-CGPBw-bD.js";
import "./skills-Dj7GqTPz.js";
import "./routes-CyIJmYmu.js";
import { r as formatUncaughtError } from "./errors-BeAy8PFi.js";
import { r as movePathToTrash } from "./server-context-DGqqHDqz.js";
import "./image-ops-DS83Z7J2.js";
import "./store-DFW2MnP3.js";
import { i as handlePortError, n as describePortOwner, r as ensurePortAvailable, t as PortInUseError } from "./ports-DAxLoOFv.js";
import { h as GATEWAY_CLIENT_NAMES, l as normalizeMessageChannel, m as GATEWAY_CLIENT_MODES } from "./message-channel-BA527_ar.js";
import "./logging-CcxUDNcI.js";
import "./accounts-DmCS3XF8.js";
import "./send-CUpDmT_F.js";
import "./send-C8AhSqO8.js";
import { c as resolveStorePath, o as resolveSessionTranscriptsDir, s as resolveSessionTranscriptsDirForAgent } from "./paths-BuQbsACT.js";
import "./tool-images-C7cLCz1D.js";
import "./redact-Bb36nvYe.js";
import "./tool-display-CPUH9JiE.js";
import "./fetch-_IAZS3Vz.js";
import "./deliver-BUfUVLsa.js";
import "./dispatcher-CKUm3wsK.js";
import "./send-Div41qfG.js";
import "./manager-BK_KHPSI.js";
import "./sqlite-DLuWRI0D.js";
import "./retry-UPMRcKEG.js";
import "./common-DwTaPWKf.js";
import "./ir-CGIUordM.js";
import "./render-DIvHuHqk.js";
import "./commands-registry-DBWrx0Xv.js";
import "./client-CEto0Pf6.js";
import { i as randomIdempotencyKey, n as callGateway } from "./call-i9290XP8.js";
import { n as formatTimeAgo } from "./format-relative-Bc_rVyZs.js";
import "./channel-activity-Ds_g7OEt.js";
import "./tables-1llcV3qs.js";
import "./send-oaAcLlhT.js";
import { t as formatDocsLink } from "./links-DKVbBuQN.js";
import { n as runCommandWithRuntime } from "./cli-utils-Gpj8Z_ye.js";
import { n as withProgress } from "./progress-DitCFjx_.js";
import "./pairing-store-88eMFj2v.js";
import "./pi-tools.policy-BKT9HswJ.js";
import "./send-DbQ_i4Qf.js";
import { a as ensureWorkspaceAndSessions, c as handleReset, d as openUrl, h as resolveControlUiLinks, i as detectBrowserOpenSupport, l as moveToTrash, m as randomToken, n as applyWizardMetadata, o as formatControlUiSshHint, t as DEFAULT_WORKSPACE, y as waitForGatewayReachable } from "./onboard-helpers-tLA-tN_l.js";
import { n as stylePromptMessage, r as stylePromptTitle, t as stylePromptHint } from "./prompt-style-ciYaT-3f.js";
import "./pairing-labels-C_rjFixf.js";
import "./session-cost-usage-CbsU4YHL.js";
import "./nodes-screen-BeEWwXR4.js";
import { _ as promptYesNo, g as ensureBinary } from "./auth-DT6fiHDK.js";
import "./control-auth-Drf7IiLj.js";
import "./control-service-BKUh8p7b.js";
import "./channel-selection-BN6_hiIf.js";
import "./delivery-queue-46I6nBfA.js";
import { r as waitForever, t as monitorWebChannel } from "./channel-web-BXve392V.js";
import "./outbound-BA1BXuKz.js";
import "./session-DeKlM-VR.js";
import "./login-BiQ2OPbd.js";
import { a as createOutboundSendDeps, n as resolveSessionKeyForRequest, o as createDefaultDeps, t as agentCommand } from "./agent-CYvhbrs3.js";
import { t as isMainModule } from "./is-main-DG1nblbE.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-CGiblChU.js";
import { a as gatewayInstallErrorHint, g as assertSupportedRuntime, i as buildGatewayInstallPlan, r as isGatewayDaemonRuntime, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-sITO6h1s.js";
import { a as buildAgentSummaries, c as loadAgentIdentity, f as parseIdentityMarkdown, i as applyAgentConfig, l as pruneAgentConfig, o as findAgentEntryIndex, r as runOnboardingWizard, s as listAgentEntries, t as statusCommand, u as identityHasValues } from "./status-DcvqlJYG.js";
import { n as callGatewayFromCli, t as addGatewayClientOptions } from "./gateway-rpc-Dq_D40Lw.js";
import { t as formatHelpExamples } from "./help-format-Bc0jGaJB.js";
import { t as resolveChannelDefaultAccountId } from "./helpers-28CRTwys.js";
import { n as logConfigUpdated, t as formatConfigPath } from "./logging-BYdFQAju.js";
import "./note-B5hvEaG5.js";
import { t as WizardCancelledError } from "./prompts-BEHxUC3w.js";
import { t as createClackPrompter } from "./clack-prompter-BUK2BneN.js";
import { S as promptAuthChoiceGrouped, _ as applyAuthChoice, a as CustomApiError, b as detectZaiEndpoint, g as warnIfModelConfigLooksOff, l as resolveCustomProviderId, o as applyCustomApiConfig, s as parseNonInteractiveCustomApiFlags, v as applyOpenAIConfig, x as applyGoogleGeminiModelDefault, y as upsertSharedEnvVar } from "./onboard-skills-BBfEXIps.js";
import { B as applyVeniceConfig, C as applyAuthProfileConfig, Ct as setXiaomiApiKey, E as applyKimiCodeConfig, Ft as validateAnthropicSetupToken, H as applyXaiConfig, I as applySyntheticConfig, J as applyLitellmConfig, K as applyZaiConfig, M as applyOpenrouterConfig, O as applyMoonshotConfig, P as applyQianfanConfig, Pt as buildTokenProfileId, Q as applyVercelAiGatewayConfig, R as applyTogetherConfig, St as setXaiApiKey, W as applyXiaomiConfig, X as applyCloudflareAiGatewayConfig, _ as applyOpencodeZenConfig, _t as setQianfanApiKey, bt as setVeniceApiKey, ct as setCloudflareAiGatewayConfig, dt as setKimiCodingApiKey, ft as setLitellmApiKey, gt as setOpenrouterApiKey, ht as setOpencodeZenApiKey, k as applyMoonshotConfigCn, lt as setGeminiApiKey, mt as setMoonshotApiKey, pt as setMinimaxApiKey, st as setAnthropicApiKey, ut as setHuggingfaceApiKey, vt as setSyntheticApiKey, w as applyHuggingfaceConfig, wt as setZaiApiKey, x as applyMinimaxConfig, xt as setVercelAiGatewayApiKey, y as applyMinimaxApiConfig, yt as setTogetherApiKey } from "./github-copilot-auth-oZW8Q54S.js";
import { n as setupChannels } from "./onboard-channels-0nZkyjjM.js";
import "./plugin-auto-enable-B_v9wM6g.js";
import "./archive-3RxGtdg9.js";
import "./skill-scanner-BDTjIBGW.js";
import "./installs-NHf37wyZ.js";
import { i as hasExplicitOptions, n as resolveCliChannelOptions, r as ensurePluginRegistryLoaded } from "./channel-options-D1f5Nf8U.js";
import { n as parsePositiveIntOrUndefined, t as collectOption } from "./helpers-BbAl8VsI.js";
import { r as healthCommand } from "./health-Cb5plNjz.js";
import { i as CONFIGURE_WIZARD_SECTIONS, n as configureCommand, r as configureCommandWithSections } from "./configure-BhCiZ10c.js";
import { t as resolveGatewayService } from "./service-CMKWaXkp.js";
import { r as isSystemdUserServiceAvailable } from "./systemd-CFcBM6Sc.js";
import { n as ensureSystemdUserLingerNonInteractive } from "./systemd-linger-DfY-LfC0.js";
import "./widearea-dns--XSFYXnQ.js";
import "./skills-status-CRbYCH-J.js";
import "./auth-health-CbuOKV-M.js";
import { n as loadAndMaybeMigrateDoctorConfig, t as doctorCommand } from "./doctor-BBPrBqIF.js";
import { c as registerSubCliCommands, d as hasHelpOrVersion, f as shouldMigrateStateFromPath, l as getCommandPath, u as getVerboseFlag } from "./completion-cli-D7hv-tR8.js";
import "./status.update-CWTIGg6J.js";
import "./service-audit-t42gxcdN.js";
import "./channels-status-issues-Cuirza--.js";
import { t as renderTable } from "./table-BuqaalSN.js";
import "./hooks-status-B2nsYsXM.js";
import "./tui-CMbEG2YE.js";
import "./audit-CeiPGqWs.js";
import "./node-service-CAYdczqI.js";
import process$1 from "node:process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import JSON5 from "json5";
import fsPromises from "node:fs/promises";
import { cancel, confirm, isCancel, multiselect, select } from "@clack/prompts";
import { Command } from "commander";

//#region src/cli/browser-cli-shared.ts
function normalizeQuery(query) {
	if (!query) return;
	const out = {};
	for (const [key, value] of Object.entries(query)) {
		if (value === void 0) continue;
		out[key] = String(value);
	}
	return Object.keys(out).length ? out : void 0;
}
async function callBrowserRequest(opts, params, extra) {
	const resolvedTimeoutMs = typeof extra?.timeoutMs === "number" && Number.isFinite(extra.timeoutMs) ? Math.max(1, Math.floor(extra.timeoutMs)) : typeof opts.timeout === "string" ? Number.parseInt(opts.timeout, 10) : void 0;
	const resolvedTimeout = typeof resolvedTimeoutMs === "number" && Number.isFinite(resolvedTimeoutMs) ? resolvedTimeoutMs : void 0;
	const timeout = typeof resolvedTimeout === "number" ? String(resolvedTimeout) : opts.timeout;
	const payload = await callGatewayFromCli("browser.request", {
		...opts,
		timeout
	}, {
		method: params.method,
		path: params.path,
		query: normalizeQuery(params.query),
		body: params.body,
		timeoutMs: resolvedTimeout
	}, { progress: extra?.progress });
	if (payload === void 0) throw new Error("Unexpected browser.request response");
	return payload;
}

//#endregion
//#region src/cli/browser-cli-actions-input/shared.ts
function resolveBrowserActionContext(cmd, parentOpts) {
	const parent = parentOpts(cmd);
	return {
		parent,
		profile: parent?.browserProfile
	};
}
async function callBrowserAct(params) {
	return await callBrowserRequest(params.parent, {
		method: "POST",
		path: "/act",
		query: params.profile ? { profile: params.profile } : void 0,
		body: params.body
	}, { timeoutMs: params.timeoutMs ?? 2e4 });
}
function requireRef(ref) {
	const refValue = typeof ref === "string" ? ref.trim() : "";
	if (!refValue) {
		defaultRuntime.error(danger("ref is required"));
		defaultRuntime.exit(1);
		return null;
	}
	return refValue;
}
async function readFile(path) {
	return await (await import("node:fs/promises")).readFile(path, "utf8");
}
async function readFields(opts) {
	const payload = opts.fieldsFile ? await readFile(opts.fieldsFile) : opts.fields ?? "";
	if (!payload.trim()) throw new Error("fields are required");
	const parsed = JSON.parse(payload);
	if (!Array.isArray(parsed)) throw new Error("fields must be an array");
	return parsed.map((entry, index) => {
		if (!entry || typeof entry !== "object") throw new Error(`fields[${index}] must be an object`);
		const rec = entry;
		const ref = typeof rec.ref === "string" ? rec.ref.trim() : "";
		const type = typeof rec.type === "string" ? rec.type.trim() : "";
		if (!ref || !type) throw new Error(`fields[${index}] must include ref and type`);
		if (typeof rec.value === "string" || typeof rec.value === "number" || typeof rec.value === "boolean") return {
			ref,
			type,
			value: rec.value
		};
		if (rec.value === void 0 || rec.value === null) return {
			ref,
			type
		};
		throw new Error(`fields[${index}].value must be string, number, boolean, or null`);
	});
}

//#endregion
//#region src/cli/browser-cli-actions-input/register.element.ts
function registerBrowserElementCommands(browser, parentOpts) {
	browser.command("click").description("Click an element by ref from snapshot").argument("<ref>", "Ref id from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").option("--double", "Double click", false).option("--button <left|right|middle>", "Mouse button to use").option("--modifiers <list>", "Comma-separated modifiers (Shift,Alt,Meta)").action(async (ref, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		const refValue = requireRef(ref);
		if (!refValue) return;
		const modifiers = opts.modifiers ? String(opts.modifiers).split(",").map((v) => v.trim()).filter(Boolean) : void 0;
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "click",
					ref: refValue,
					targetId: opts.targetId?.trim() || void 0,
					doubleClick: Boolean(opts.double),
					button: opts.button?.trim() || void 0,
					modifiers
				}
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			const suffix = result.url ? ` on ${result.url}` : "";
			defaultRuntime.log(`clicked ref ${refValue}${suffix}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("type").description("Type into an element by ref from snapshot").argument("<ref>", "Ref id from snapshot").argument("<text>", "Text to type").option("--submit", "Press Enter after typing", false).option("--slowly", "Type slowly (human-like)", false).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (ref, text, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		const refValue = requireRef(ref);
		if (!refValue) return;
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "type",
					ref: refValue,
					text,
					submit: Boolean(opts.submit),
					slowly: Boolean(opts.slowly),
					targetId: opts.targetId?.trim() || void 0
				}
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`typed into ref ${refValue}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("press").description("Press a key").argument("<key>", "Key to press (e.g. Enter)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (key, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "press",
					key,
					targetId: opts.targetId?.trim() || void 0
				}
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`pressed ${key}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("hover").description("Hover an element by ai ref").argument("<ref>", "Ref id from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (ref, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "hover",
					ref,
					targetId: opts.targetId?.trim() || void 0
				}
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`hovered ref ${ref}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("scrollintoview").description("Scroll an element into view by ref from snapshot").argument("<ref>", "Ref id from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for scroll (default: 20000)", (v) => Number(v)).action(async (ref, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		const refValue = requireRef(ref);
		if (!refValue) return;
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "scrollIntoView",
					ref: refValue,
					targetId: opts.targetId?.trim() || void 0,
					timeoutMs: Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0
				},
				timeoutMs: Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`scrolled into view: ${refValue}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("drag").description("Drag from one ref to another").argument("<startRef>", "Start ref id").argument("<endRef>", "End ref id").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (startRef, endRef, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "drag",
					startRef,
					endRef,
					targetId: opts.targetId?.trim() || void 0
				}
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`dragged ${startRef} → ${endRef}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("select").description("Select option(s) in a select element").argument("<ref>", "Ref id from snapshot").argument("<values...>", "Option values to select").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (ref, values, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "select",
					ref,
					values,
					targetId: opts.targetId?.trim() || void 0
				}
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`selected ${values.join(", ")}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
//#region src/cli/browser-cli-actions-input/register.files-downloads.ts
function registerBrowserFilesAndDownloadsCommands(browser, parentOpts) {
	browser.command("upload").description("Arm file upload for the next file chooser").argument("<paths...>", "File paths to upload").option("--ref <ref>", "Ref id from snapshot to click after arming").option("--input-ref <ref>", "Ref id for <input type=file> to set directly").option("--element <selector>", "CSS selector for <input type=file>").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the next file chooser (default: 120000)", (v) => Number(v)).action(async (paths, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0;
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/hooks/file-chooser",
				query: profile ? { profile } : void 0,
				body: {
					paths,
					ref: opts.ref?.trim() || void 0,
					inputRef: opts.inputRef?.trim() || void 0,
					element: opts.element?.trim() || void 0,
					targetId: opts.targetId?.trim() || void 0,
					timeoutMs
				}
			}, { timeoutMs: timeoutMs ?? 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`upload armed for ${paths.length} file(s)`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("waitfordownload").description("Wait for the next download (and save it)").argument("[path]", "Save path within openclaw temp downloads dir (default: /tmp/openclaw/downloads/...; fallback: os.tmpdir()/openclaw/downloads/...)").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the next download (default: 120000)", (v) => Number(v)).action(async (outPath, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0;
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/wait/download",
				query: profile ? { profile } : void 0,
				body: {
					path: outPath?.trim() || void 0,
					targetId: opts.targetId?.trim() || void 0,
					timeoutMs
				}
			}, { timeoutMs: timeoutMs ?? 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`downloaded: ${shortenHomePath(result.download.path)}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("download").description("Click a ref and save the resulting download").argument("<ref>", "Ref id from snapshot to click").argument("<path>", "Save path within openclaw temp downloads dir (e.g. report.pdf or /tmp/openclaw/downloads/report.pdf)").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the download to start (default: 120000)", (v) => Number(v)).action(async (ref, outPath, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0;
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/download",
				query: profile ? { profile } : void 0,
				body: {
					ref,
					path: outPath,
					targetId: opts.targetId?.trim() || void 0,
					timeoutMs
				}
			}, { timeoutMs: timeoutMs ?? 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`downloaded: ${shortenHomePath(result.download.path)}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("dialog").description("Arm the next modal dialog (alert/confirm/prompt)").option("--accept", "Accept the dialog", false).option("--dismiss", "Dismiss the dialog", false).option("--prompt <text>", "Prompt response text").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the next dialog (default: 120000)", (v) => Number(v)).action(async (opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		const accept = opts.accept ? true : opts.dismiss ? false : void 0;
		if (accept === void 0) {
			defaultRuntime.error(danger("Specify --accept or --dismiss"));
			defaultRuntime.exit(1);
			return;
		}
		try {
			const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0;
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/hooks/dialog",
				query: profile ? { profile } : void 0,
				body: {
					accept,
					promptText: opts.prompt?.trim() || void 0,
					targetId: opts.targetId?.trim() || void 0,
					timeoutMs
				}
			}, { timeoutMs: timeoutMs ?? 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log("dialog armed");
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
//#region src/cli/browser-cli-actions-input/register.form-wait-eval.ts
function registerBrowserFormWaitEvalCommands(browser, parentOpts) {
	browser.command("fill").description("Fill a form with JSON field descriptors").option("--fields <json>", "JSON array of field objects").option("--fields-file <path>", "Read JSON array from a file").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const fields = await readFields({
				fields: opts.fields,
				fieldsFile: opts.fieldsFile
			});
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "fill",
					fields,
					targetId: opts.targetId?.trim() || void 0
				}
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`filled ${fields.length} field(s)`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("wait").description("Wait for time, selector, URL, load state, or JS conditions").argument("[selector]", "CSS selector to wait for (visible)").option("--time <ms>", "Wait for N milliseconds", (v) => Number(v)).option("--text <value>", "Wait for text to appear").option("--text-gone <value>", "Wait for text to disappear").option("--url <pattern>", "Wait for URL (supports globs like **/dash)").option("--load <load|domcontentloaded|networkidle>", "Wait for load state").option("--fn <js>", "Wait for JS condition (passed to waitForFunction)").option("--timeout-ms <ms>", "How long to wait for each condition (default: 20000)", (v) => Number(v)).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (selector, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const sel = selector?.trim() || void 0;
			const load = opts.load === "load" || opts.load === "domcontentloaded" || opts.load === "networkidle" ? opts.load : void 0;
			const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0;
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "wait",
					timeMs: Number.isFinite(opts.time) ? opts.time : void 0,
					text: opts.text?.trim() || void 0,
					textGone: opts.textGone?.trim() || void 0,
					selector: sel,
					url: opts.url?.trim() || void 0,
					loadState: load,
					fn: opts.fn?.trim() || void 0,
					targetId: opts.targetId?.trim() || void 0,
					timeoutMs
				},
				timeoutMs
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log("wait complete");
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("evaluate").description("Evaluate a function against the page or a ref").option("--fn <code>", "Function source, e.g. (el) => el.textContent").option("--ref <id>", "Ref from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		if (!opts.fn) {
			defaultRuntime.error(danger("Missing --fn"));
			defaultRuntime.exit(1);
			return;
		}
		try {
			const result = await callBrowserAct({
				parent,
				profile,
				body: {
					kind: "evaluate",
					fn: opts.fn,
					ref: opts.ref?.trim() || void 0,
					targetId: opts.targetId?.trim() || void 0
				}
			});
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(JSON.stringify(result.result ?? null, null, 2));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
//#region src/cli/browser-cli-actions-input/register.navigation.ts
function registerBrowserNavigationCommands(browser, parentOpts) {
	browser.command("navigate").description("Navigate the current tab to a URL").argument("<url>", "URL to navigate to").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (url, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		try {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/navigate",
				query: profile ? { profile } : void 0,
				body: {
					url,
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`navigated to ${result.url ?? url}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("resize").description("Resize the viewport").argument("<width>", "Viewport width", (v) => Number(v)).argument("<height>", "Viewport height", (v) => Number(v)).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (width, height, opts, cmd) => {
		const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
		if (!Number.isFinite(width) || !Number.isFinite(height)) {
			defaultRuntime.error(danger("width and height must be numbers"));
			defaultRuntime.exit(1);
			return;
		}
		try {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/act",
				query: profile ? { profile } : void 0,
				body: {
					kind: "resize",
					width,
					height,
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`resized to ${width}x${height}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
//#region src/cli/browser-cli-actions-input/register.ts
function registerBrowserActionInputCommands(browser, parentOpts) {
	registerBrowserNavigationCommands(browser, parentOpts);
	registerBrowserElementCommands(browser, parentOpts);
	registerBrowserFilesAndDownloadsCommands(browser, parentOpts);
	registerBrowserFormWaitEvalCommands(browser, parentOpts);
}

//#endregion
//#region src/cli/browser-cli-actions-observe.ts
function runBrowserObserve(action) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	});
}
function registerBrowserActionObserveCommands(browser, parentOpts) {
	browser.command("console").description("Get recent console messages").option("--level <level>", "Filter by level (error, warn, info)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserObserve(async () => {
			const result = await callBrowserRequest(parent, {
				method: "GET",
				path: "/console",
				query: {
					level: opts.level?.trim() || void 0,
					targetId: opts.targetId?.trim() || void 0,
					profile
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(JSON.stringify(result.messages, null, 2));
		});
	});
	browser.command("pdf").description("Save page as PDF").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserObserve(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/pdf",
				query: profile ? { profile } : void 0,
				body: { targetId: opts.targetId?.trim() || void 0 }
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`PDF: ${shortenHomePath(result.path)}`);
		});
	});
	browser.command("responsebody").description("Wait for a network response and return its body").argument("<url>", "URL (exact, substring, or glob like **/api)").option("--target-id <id>", "CDP target id (or unique prefix)").option("--timeout-ms <ms>", "How long to wait for the response (default: 20000)", (v) => Number(v)).option("--max-chars <n>", "Max body chars to return (default: 200000)", (v) => Number(v)).action(async (url, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserObserve(async () => {
			const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : void 0;
			const maxChars = Number.isFinite(opts.maxChars) ? opts.maxChars : void 0;
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/response/body",
				query: profile ? { profile } : void 0,
				body: {
					url,
					targetId: opts.targetId?.trim() || void 0,
					timeoutMs,
					maxChars
				}
			}, { timeoutMs: timeoutMs ?? 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(result.response.body);
		});
	});
}

//#endregion
//#region src/cli/browser-cli-debug.ts
function runBrowserDebug(action) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	});
}
function registerBrowserDebugCommands(browser, parentOpts) {
	browser.command("highlight").description("Highlight an element by ref").argument("<ref>", "Ref id from snapshot").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (ref, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserDebug(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/highlight",
				query: profile ? { profile } : void 0,
				body: {
					ref: ref.trim(),
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`highlighted ${ref.trim()}`);
		});
	});
	browser.command("errors").description("Get recent page errors").option("--clear", "Clear stored errors after reading", false).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserDebug(async () => {
			const result = await callBrowserRequest(parent, {
				method: "GET",
				path: "/errors",
				query: {
					targetId: opts.targetId?.trim() || void 0,
					clear: Boolean(opts.clear),
					profile
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			if (!result.errors.length) {
				defaultRuntime.log("No page errors.");
				return;
			}
			defaultRuntime.log(result.errors.map((e) => `${e.timestamp} ${e.name ? `${e.name}: ` : ""}${e.message}`).join("\n"));
		});
	});
	browser.command("requests").description("Get recent network requests (best-effort)").option("--filter <text>", "Only show URLs that contain this substring").option("--clear", "Clear stored requests after reading", false).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserDebug(async () => {
			const result = await callBrowserRequest(parent, {
				method: "GET",
				path: "/requests",
				query: {
					targetId: opts.targetId?.trim() || void 0,
					filter: opts.filter?.trim() || void 0,
					clear: Boolean(opts.clear),
					profile
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			if (!result.requests.length) {
				defaultRuntime.log("No requests recorded.");
				return;
			}
			defaultRuntime.log(result.requests.map((r) => {
				const status = typeof r.status === "number" ? ` ${r.status}` : "";
				const ok = r.ok === true ? " ok" : r.ok === false ? " fail" : "";
				const fail = r.failureText ? ` (${r.failureText})` : "";
				return `${r.timestamp} ${r.method}${status}${ok} ${r.url}${fail}`;
			}).join("\n"));
		});
	});
	const trace = browser.command("trace").description("Record a Playwright trace");
	trace.command("start").description("Start trace recording").option("--target-id <id>", "CDP target id (or unique prefix)").option("--no-screenshots", "Disable screenshots").option("--no-snapshots", "Disable snapshots").option("--sources", "Include sources (bigger traces)", false).action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserDebug(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/trace/start",
				query: profile ? { profile } : void 0,
				body: {
					targetId: opts.targetId?.trim() || void 0,
					screenshots: Boolean(opts.screenshots),
					snapshots: Boolean(opts.snapshots),
					sources: Boolean(opts.sources)
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log("trace started");
		});
	});
	trace.command("stop").description("Stop trace recording and write a .zip").option("--out <path>", "Output path within openclaw temp dir (e.g. trace.zip or /tmp/openclaw/trace.zip)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserDebug(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/trace/stop",
				query: profile ? { profile } : void 0,
				body: {
					targetId: opts.targetId?.trim() || void 0,
					path: opts.out?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`TRACE:${shortenHomePath(result.path)}`);
		});
	});
}

//#endregion
//#region src/cli/browser-cli-examples.ts
const browserCoreExamples = [
	"openclaw browser status",
	"openclaw browser start",
	"openclaw browser stop",
	"openclaw browser tabs",
	"openclaw browser open https://example.com",
	"openclaw browser focus abcd1234",
	"openclaw browser close abcd1234",
	"openclaw browser screenshot",
	"openclaw browser screenshot --full-page",
	"openclaw browser screenshot --ref 12",
	"openclaw browser snapshot",
	"openclaw browser snapshot --format aria --limit 200",
	"openclaw browser snapshot --efficient",
	"openclaw browser snapshot --labels"
];
const browserActionExamples = [
	"openclaw browser navigate https://example.com",
	"openclaw browser resize 1280 720",
	"openclaw browser click 12 --double",
	"openclaw browser type 23 \"hello\" --submit",
	"openclaw browser press Enter",
	"openclaw browser hover 44",
	"openclaw browser drag 10 11",
	"openclaw browser select 9 OptionA OptionB",
	"openclaw browser upload /tmp/file.pdf",
	"openclaw browser fill --fields '[{\"ref\":\"1\",\"value\":\"Ada\"}]'",
	"openclaw browser dialog --accept",
	"openclaw browser wait --text \"Done\"",
	"openclaw browser evaluate --fn '(el) => el.textContent' --ref 7",
	"openclaw browser console --level error",
	"openclaw browser pdf"
];

//#endregion
//#region src/infra/clipboard.ts
async function copyToClipboard(value) {
	for (const attempt of [
		{ argv: ["pbcopy"] },
		{ argv: [
			"xclip",
			"-selection",
			"clipboard"
		] },
		{ argv: ["wl-copy"] },
		{ argv: ["clip.exe"] },
		{ argv: [
			"powershell",
			"-NoProfile",
			"-Command",
			"Set-Clipboard"
		] }
	]) try {
		const result = await runCommandWithTimeout(attempt.argv, {
			timeoutMs: 3e3,
			input: value
		});
		if (result.code === 0 && !result.killed) return true;
	} catch {}
	return false;
}

//#endregion
//#region src/cli/browser-cli-extension.ts
function resolveBundledExtensionRootDir(here = path.dirname(fileURLToPath(import.meta.url))) {
	let current = here;
	while (true) {
		const candidate = path.join(current, "assets", "chrome-extension");
		if (hasManifest(candidate)) return candidate;
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return path.resolve(here, "../../assets/chrome-extension");
}
function installedExtensionRootDir() {
	return path.join(resolveStateDir(), "browser", "chrome-extension");
}
function hasManifest(dir) {
	return fs.existsSync(path.join(dir, "manifest.json"));
}
async function installChromeExtension(opts) {
	const src = opts?.sourceDir ?? resolveBundledExtensionRootDir();
	if (!hasManifest(src)) throw new Error("Bundled Chrome extension is missing. Reinstall OpenClaw and try again.");
	const stateDir = opts?.stateDir ?? resolveStateDir();
	const dest = path.join(stateDir, "browser", "chrome-extension");
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	if (fs.existsSync(dest)) await movePathToTrash(dest).catch(() => {
		const backup = `${dest}.old-${Date.now()}`;
		fs.renameSync(dest, backup);
	});
	await fs.promises.cp(src, dest, { recursive: true });
	if (!hasManifest(dest)) throw new Error("Chrome extension install failed (manifest.json missing). Try again.");
	return { path: dest };
}
function registerBrowserExtensionCommands(browser, parentOpts) {
	const ext = browser.command("extension").description("Chrome extension helpers");
	ext.command("install").description("Install the Chrome extension to a stable local path").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		let installed;
		try {
			installed = await installChromeExtension();
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
		if (parent?.json) {
			defaultRuntime.log(JSON.stringify({
				ok: true,
				path: installed.path
			}, null, 2));
			return;
		}
		const displayPath = shortenHomePath(installed.path);
		defaultRuntime.log(displayPath);
		const copied = await copyToClipboard(installed.path).catch(() => false);
		defaultRuntime.error(info([
			copied ? "Copied to clipboard." : "Copy to clipboard unavailable.",
			"Next:",
			`- Chrome → chrome://extensions → enable “Developer mode”`,
			`- “Load unpacked” → select: ${displayPath}`,
			`- Pin “OpenClaw Browser Relay”, then click it on the tab (badge shows ON)`,
			"",
			`${theme.muted("Docs:")} ${formatDocsLink("/tools/chrome-extension", "docs.openclaw.ai/tools/chrome-extension")}`
		].join("\n")));
	});
	ext.command("path").description("Print the path to the installed Chrome extension (load unpacked)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const dir = installedExtensionRootDir();
		if (!hasManifest(dir)) {
			defaultRuntime.error(danger([`Chrome extension is not installed. Run: "${formatCliCommand("openclaw browser extension install")}"`, `Docs: ${formatDocsLink("/tools/chrome-extension", "docs.openclaw.ai/tools/chrome-extension")}`].join("\n")));
			defaultRuntime.exit(1);
		}
		if (parent?.json) {
			defaultRuntime.log(JSON.stringify({ path: dir }, null, 2));
			return;
		}
		const displayPath = shortenHomePath(dir);
		defaultRuntime.log(displayPath);
		if (await copyToClipboard(dir).catch(() => false)) defaultRuntime.error(info("Copied to clipboard."));
	});
}

//#endregion
//#region src/cli/browser-cli-inspect.ts
function registerBrowserInspectCommands(browser, parentOpts) {
	browser.command("screenshot").description("Capture a screenshot (MEDIA:<path>)").argument("[targetId]", "CDP target id (or unique prefix)").option("--full-page", "Capture full scrollable page", false).option("--ref <ref>", "ARIA ref from ai snapshot").option("--element <selector>", "CSS selector for element screenshot").option("--type <png|jpeg>", "Output type (default: png)", "png").action(async (targetId, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		try {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/screenshot",
				query: profile ? { profile } : void 0,
				body: {
					targetId: targetId?.trim() || void 0,
					fullPage: Boolean(opts.fullPage),
					ref: opts.ref?.trim() || void 0,
					element: opts.element?.trim() || void 0,
					type: opts.type === "jpeg" ? "jpeg" : "png"
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`MEDIA:${shortenHomePath(result.path)}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	browser.command("snapshot").description("Capture a snapshot (default: ai; aria is the accessibility tree)").option("--format <aria|ai>", "Snapshot format (default: ai)", "ai").option("--target-id <id>", "CDP target id (or unique prefix)").option("--limit <n>", "Max nodes (default: 500/800)", (v) => Number(v)).option("--mode <efficient>", "Snapshot preset (efficient)").option("--efficient", "Use the efficient snapshot preset", false).option("--interactive", "Role snapshot: interactive elements only", false).option("--compact", "Role snapshot: compact output", false).option("--depth <n>", "Role snapshot: max depth", (v) => Number(v)).option("--selector <sel>", "Role snapshot: scope to CSS selector").option("--frame <sel>", "Role snapshot: scope to an iframe selector").option("--labels", "Include viewport label overlay screenshot", false).option("--out <path>", "Write snapshot to a file").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		const format = opts.format === "aria" ? "aria" : "ai";
		const configMode = format === "ai" && loadConfig().browser?.snapshotDefaults?.mode === "efficient" ? "efficient" : void 0;
		const mode = opts.efficient === true || opts.mode === "efficient" ? "efficient" : configMode;
		try {
			const result = await callBrowserRequest(parent, {
				method: "GET",
				path: "/snapshot",
				query: {
					format,
					targetId: opts.targetId?.trim() || void 0,
					limit: Number.isFinite(opts.limit) ? opts.limit : void 0,
					interactive: opts.interactive ? true : void 0,
					compact: opts.compact ? true : void 0,
					depth: Number.isFinite(opts.depth) ? opts.depth : void 0,
					selector: opts.selector?.trim() || void 0,
					frame: opts.frame?.trim() || void 0,
					labels: opts.labels ? true : void 0,
					mode,
					profile
				}
			}, { timeoutMs: 2e4 });
			if (opts.out) {
				const fs = await import("node:fs/promises");
				if (result.format === "ai") await fs.writeFile(opts.out, result.snapshot, "utf8");
				else {
					const payload = JSON.stringify(result, null, 2);
					await fs.writeFile(opts.out, payload, "utf8");
				}
				if (parent?.json) defaultRuntime.log(JSON.stringify({
					ok: true,
					out: opts.out,
					...result.format === "ai" && result.imagePath ? { imagePath: result.imagePath } : {}
				}, null, 2));
				else {
					defaultRuntime.log(shortenHomePath(opts.out));
					if (result.format === "ai" && result.imagePath) defaultRuntime.log(`MEDIA:${shortenHomePath(result.imagePath)}`);
				}
				return;
			}
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			if (result.format === "ai") {
				defaultRuntime.log(result.snapshot);
				if (result.imagePath) defaultRuntime.log(`MEDIA:${shortenHomePath(result.imagePath)}`);
				return;
			}
			const nodes = "nodes" in result ? result.nodes : [];
			defaultRuntime.log(nodes.map((n) => {
				const indent = "  ".repeat(Math.min(20, n.depth));
				const name = n.name ? ` "${n.name}"` : "";
				const value = n.value ? ` = "${n.value}"` : "";
				return `${indent}- ${n.role}${name}${value}`;
			}).join("\n"));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
//#region src/cli/browser-cli-manage.ts
function runBrowserCommand$1(action) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	});
}
function registerBrowserManageCommands(browser, parentOpts) {
	browser.command("status").description("Show browser status").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		await runBrowserCommand$1(async () => {
			const status = await callBrowserRequest(parent, {
				method: "GET",
				path: "/",
				query: parent?.browserProfile ? { profile: parent.browserProfile } : void 0
			}, { timeoutMs: 1500 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(status, null, 2));
				return;
			}
			const detectedPath = status.detectedExecutablePath ?? status.executablePath;
			const detectedDisplay = detectedPath ? shortenHomePath(detectedPath) : "auto";
			defaultRuntime.log([
				`profile: ${status.profile ?? "openclaw"}`,
				`enabled: ${status.enabled}`,
				`running: ${status.running}`,
				`cdpPort: ${status.cdpPort}`,
				`cdpUrl: ${status.cdpUrl ?? `http://127.0.0.1:${status.cdpPort}`}`,
				`browser: ${status.chosenBrowser ?? "unknown"}`,
				`detectedBrowser: ${status.detectedBrowser ?? "unknown"}`,
				`detectedPath: ${detectedDisplay}`,
				`profileColor: ${status.color}`,
				...status.detectError ? [`detectError: ${status.detectError}`] : []
			].join("\n"));
		});
	});
	browser.command("start").description("Start the browser (no-op if already running)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			await callBrowserRequest(parent, {
				method: "POST",
				path: "/start",
				query: profile ? { profile } : void 0
			}, { timeoutMs: 15e3 });
			const status = await callBrowserRequest(parent, {
				method: "GET",
				path: "/",
				query: profile ? { profile } : void 0
			}, { timeoutMs: 1500 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(status, null, 2));
				return;
			}
			const name = status.profile ?? "openclaw";
			defaultRuntime.log(info(`🦞 browser [${name}] running: ${status.running}`));
		});
	});
	browser.command("stop").description("Stop the browser (best-effort)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			await callBrowserRequest(parent, {
				method: "POST",
				path: "/stop",
				query: profile ? { profile } : void 0
			}, { timeoutMs: 15e3 });
			const status = await callBrowserRequest(parent, {
				method: "GET",
				path: "/",
				query: profile ? { profile } : void 0
			}, { timeoutMs: 1500 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(status, null, 2));
				return;
			}
			const name = status.profile ?? "openclaw";
			defaultRuntime.log(info(`🦞 browser [${name}] running: ${status.running}`));
		});
	});
	browser.command("reset-profile").description("Reset browser profile (moves it to Trash)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/reset-profile",
				query: profile ? { profile } : void 0
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			if (!result.moved) {
				defaultRuntime.log(info(`🦞 browser profile already missing.`));
				return;
			}
			const dest = result.to ?? result.from;
			defaultRuntime.log(info(`🦞 browser profile moved to Trash (${dest})`));
		});
	});
	browser.command("tabs").description("List open tabs").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			const tabs = (await callBrowserRequest(parent, {
				method: "GET",
				path: "/tabs",
				query: profile ? { profile } : void 0
			}, { timeoutMs: 3e3 })).tabs ?? [];
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify({ tabs }, null, 2));
				return;
			}
			if (tabs.length === 0) {
				defaultRuntime.log("No tabs (browser closed or no targets).");
				return;
			}
			defaultRuntime.log(tabs.map((t, i) => `${i + 1}. ${t.title || "(untitled)"}\n   ${t.url}\n   id: ${t.targetId}`).join("\n"));
		});
	});
	const tab = browser.command("tab").description("Tab shortcuts (index-based)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			const tabs = (await callBrowserRequest(parent, {
				method: "POST",
				path: "/tabs/action",
				query: profile ? { profile } : void 0,
				body: { action: "list" }
			}, { timeoutMs: 1e4 })).tabs ?? [];
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify({ tabs }, null, 2));
				return;
			}
			if (tabs.length === 0) {
				defaultRuntime.log("No tabs (browser closed or no targets).");
				return;
			}
			defaultRuntime.log(tabs.map((t, i) => `${i + 1}. ${t.title || "(untitled)"}\n   ${t.url}\n   id: ${t.targetId}`).join("\n"));
		});
	});
	tab.command("new").description("Open a new tab (about:blank)").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/tabs/action",
				query: profile ? { profile } : void 0,
				body: { action: "new" }
			}, { timeoutMs: 1e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log("opened new tab");
		});
	});
	tab.command("select").description("Focus tab by index (1-based)").argument("<index>", "Tab index (1-based)", (v) => Number(v)).action(async (index, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		if (!Number.isFinite(index) || index < 1) {
			defaultRuntime.error(danger("index must be a positive number"));
			defaultRuntime.exit(1);
			return;
		}
		await runBrowserCommand$1(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/tabs/action",
				query: profile ? { profile } : void 0,
				body: {
					action: "select",
					index: Math.floor(index) - 1
				}
			}, { timeoutMs: 1e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`selected tab ${Math.floor(index)}`);
		});
	});
	tab.command("close").description("Close tab by index (1-based); default: first tab").argument("[index]", "Tab index (1-based)", (v) => Number(v)).action(async (index, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		const idx = typeof index === "number" && Number.isFinite(index) ? Math.floor(index) - 1 : void 0;
		if (typeof idx === "number" && idx < 0) {
			defaultRuntime.error(danger("index must be >= 1"));
			defaultRuntime.exit(1);
			return;
		}
		await runBrowserCommand$1(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/tabs/action",
				query: profile ? { profile } : void 0,
				body: {
					action: "close",
					index: idx
				}
			}, { timeoutMs: 1e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log("closed tab");
		});
	});
	browser.command("open").description("Open a URL in a new tab").argument("<url>", "URL to open").action(async (url, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			const tab = await callBrowserRequest(parent, {
				method: "POST",
				path: "/tabs/open",
				query: profile ? { profile } : void 0,
				body: { url }
			}, { timeoutMs: 15e3 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(tab, null, 2));
				return;
			}
			defaultRuntime.log(`opened: ${tab.url}\nid: ${tab.targetId}`);
		});
	});
	browser.command("focus").description("Focus a tab by target id (or unique prefix)").argument("<targetId>", "Target id or unique prefix").action(async (targetId, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			await callBrowserRequest(parent, {
				method: "POST",
				path: "/tabs/focus",
				query: profile ? { profile } : void 0,
				body: { targetId }
			}, { timeoutMs: 5e3 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify({ ok: true }, null, 2));
				return;
			}
			defaultRuntime.log(`focused tab ${targetId}`);
		});
	});
	browser.command("close").description("Close a tab (target id optional)").argument("[targetId]", "Target id or unique prefix (optional)").action(async (targetId, _opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand$1(async () => {
			if (targetId?.trim()) await callBrowserRequest(parent, {
				method: "DELETE",
				path: `/tabs/${encodeURIComponent(targetId.trim())}`,
				query: profile ? { profile } : void 0
			}, { timeoutMs: 5e3 });
			else await callBrowserRequest(parent, {
				method: "POST",
				path: "/act",
				query: profile ? { profile } : void 0,
				body: { kind: "close" }
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify({ ok: true }, null, 2));
				return;
			}
			defaultRuntime.log("closed tab");
		});
	});
	browser.command("profiles").description("List all browser profiles").action(async (_opts, cmd) => {
		const parent = parentOpts(cmd);
		await runBrowserCommand$1(async () => {
			const profiles = (await callBrowserRequest(parent, {
				method: "GET",
				path: "/profiles"
			}, { timeoutMs: 3e3 })).profiles ?? [];
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify({ profiles }, null, 2));
				return;
			}
			if (profiles.length === 0) {
				defaultRuntime.log("No profiles configured.");
				return;
			}
			defaultRuntime.log(profiles.map((p) => {
				const status = p.running ? "running" : "stopped";
				const tabs = p.running ? ` (${p.tabCount} tabs)` : "";
				const def = p.isDefault ? " [default]" : "";
				const loc = p.isRemote ? `cdpUrl: ${p.cdpUrl}` : `port: ${p.cdpPort}`;
				const remote = p.isRemote ? " [remote]" : "";
				return `${p.name}: ${status}${tabs}${def}${remote}\n  ${loc}, color: ${p.color}`;
			}).join("\n"));
		});
	});
	browser.command("create-profile").description("Create a new browser profile").requiredOption("--name <name>", "Profile name (lowercase, numbers, hyphens)").option("--color <hex>", "Profile color (hex format, e.g. #0066CC)").option("--cdp-url <url>", "CDP URL for remote Chrome (http/https)").option("--driver <driver>", "Profile driver (openclaw|extension). Default: openclaw").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		await runBrowserCommand$1(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/profiles/create",
				body: {
					name: opts.name,
					color: opts.color,
					cdpUrl: opts.cdpUrl,
					driver: opts.driver === "extension" ? "extension" : void 0
				}
			}, { timeoutMs: 1e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			const loc = result.isRemote ? `  cdpUrl: ${result.cdpUrl}` : `  port: ${result.cdpPort}`;
			defaultRuntime.log(info(`🦞 Created profile "${result.profile}"\n${loc}\n  color: ${result.color}${opts.driver === "extension" ? "\n  driver: extension" : ""}`));
		});
	});
	browser.command("delete-profile").description("Delete a browser profile").requiredOption("--name <name>", "Profile name to delete").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		await runBrowserCommand$1(async () => {
			const result = await callBrowserRequest(parent, {
				method: "DELETE",
				path: `/profiles/${encodeURIComponent(opts.name)}`
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			const msg = result.deleted ? `🦞 Deleted profile "${result.profile}" (user data removed)` : `🦞 Deleted profile "${result.profile}" (no user data found)`;
			defaultRuntime.log(info(msg));
		});
	});
}

//#endregion
//#region src/cli/browser-cli-state.cookies-storage.ts
function registerBrowserCookiesAndStorageCommands(browser, parentOpts) {
	const cookies = browser.command("cookies").description("Read/write cookies");
	cookies.option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		try {
			const result = await callBrowserRequest(parent, {
				method: "GET",
				path: "/cookies",
				query: {
					targetId: opts.targetId?.trim() || void 0,
					profile
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(JSON.stringify(result.cookies ?? [], null, 2));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	cookies.command("set").description("Set a cookie (requires --url or domain+path)").argument("<name>", "Cookie name").argument("<value>", "Cookie value").requiredOption("--url <url>", "Cookie URL scope (recommended)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (name, value, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		try {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/cookies/set",
				query: profile ? { profile } : void 0,
				body: {
					targetId: opts.targetId?.trim() || void 0,
					cookie: {
						name,
						value,
						url: opts.url
					}
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`cookie set: ${name}`);
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	cookies.command("clear").description("Clear all cookies").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		try {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/cookies/clear",
				query: profile ? { profile } : void 0,
				body: { targetId: opts.targetId?.trim() || void 0 }
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log("cookies cleared");
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	const storage = browser.command("storage").description("Read/write localStorage/sessionStorage");
	function registerStorageKind(kind) {
		const cmd = storage.command(kind).description(`${kind}Storage commands`);
		cmd.command("get").description(`Get ${kind}Storage (all keys or one key)`).argument("[key]", "Key (optional)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (key, opts, cmd2) => {
			const parent = parentOpts(cmd2);
			const profile = parent?.browserProfile;
			try {
				const result = await callBrowserRequest(parent, {
					method: "GET",
					path: `/storage/${kind}`,
					query: {
						key: key?.trim() || void 0,
						targetId: opts.targetId?.trim() || void 0,
						profile
					}
				}, { timeoutMs: 2e4 });
				if (parent?.json) {
					defaultRuntime.log(JSON.stringify(result, null, 2));
					return;
				}
				defaultRuntime.log(JSON.stringify(result.values ?? {}, null, 2));
			} catch (err) {
				defaultRuntime.error(danger(String(err)));
				defaultRuntime.exit(1);
			}
		});
		cmd.command("set").description(`Set a ${kind}Storage key`).argument("<key>", "Key").argument("<value>", "Value").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (key, value, opts, cmd2) => {
			const parent = parentOpts(cmd2);
			const profile = parent?.browserProfile;
			try {
				const result = await callBrowserRequest(parent, {
					method: "POST",
					path: `/storage/${kind}/set`,
					query: profile ? { profile } : void 0,
					body: {
						key,
						value,
						targetId: opts.targetId?.trim() || void 0
					}
				}, { timeoutMs: 2e4 });
				if (parent?.json) {
					defaultRuntime.log(JSON.stringify(result, null, 2));
					return;
				}
				defaultRuntime.log(`${kind}Storage set: ${key}`);
			} catch (err) {
				defaultRuntime.error(danger(String(err)));
				defaultRuntime.exit(1);
			}
		});
		cmd.command("clear").description(`Clear all ${kind}Storage keys`).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd2) => {
			const parent = parentOpts(cmd2);
			const profile = parent?.browserProfile;
			try {
				const result = await callBrowserRequest(parent, {
					method: "POST",
					path: `/storage/${kind}/clear`,
					query: profile ? { profile } : void 0,
					body: { targetId: opts.targetId?.trim() || void 0 }
				}, { timeoutMs: 2e4 });
				if (parent?.json) {
					defaultRuntime.log(JSON.stringify(result, null, 2));
					return;
				}
				defaultRuntime.log(`${kind}Storage cleared`);
			} catch (err) {
				defaultRuntime.error(danger(String(err)));
				defaultRuntime.exit(1);
			}
		});
	}
	registerStorageKind("local");
	registerStorageKind("session");
}

//#endregion
//#region src/cli/browser-cli-state.ts
function parseOnOff(raw) {
	const parsed = parseBooleanValue(raw);
	return parsed === void 0 ? null : parsed;
}
function runBrowserCommand(action) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	});
}
function registerBrowserStateCommands(browser, parentOpts) {
	registerBrowserCookiesAndStorageCommands(browser, parentOpts);
	const set = browser.command("set").description("Browser environment settings");
	set.command("viewport").description("Set viewport size (alias for resize)").argument("<width>", "Viewport width", (v) => Number(v)).argument("<height>", "Viewport height", (v) => Number(v)).option("--target-id <id>", "CDP target id (or unique prefix)").action(async (width, height, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		if (!Number.isFinite(width) || !Number.isFinite(height)) {
			defaultRuntime.error(danger("width and height must be numbers"));
			defaultRuntime.exit(1);
			return;
		}
		await runBrowserCommand(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/act",
				query: profile ? { profile } : void 0,
				body: {
					kind: "resize",
					width,
					height,
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`viewport set: ${width}x${height}`);
		});
	});
	set.command("offline").description("Toggle offline mode").argument("<on|off>", "on/off").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (value, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		const offline = parseOnOff(value);
		if (offline === null) {
			defaultRuntime.error(danger("Expected on|off"));
			defaultRuntime.exit(1);
			return;
		}
		await runBrowserCommand(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/set/offline",
				query: profile ? { profile } : void 0,
				body: {
					offline,
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`offline: ${offline}`);
		});
	});
	set.command("headers").description("Set extra HTTP headers (JSON object)").requiredOption("--json <json>", "JSON object of headers").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand(async () => {
			const parsed = JSON.parse(String(opts.json));
			if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("headers json must be an object");
			const headers = {};
			for (const [k, v] of Object.entries(parsed)) if (typeof v === "string") headers[k] = v;
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/set/headers",
				query: profile ? { profile } : void 0,
				body: {
					headers,
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log("headers set");
		});
	});
	set.command("credentials").description("Set HTTP basic auth credentials").option("--clear", "Clear credentials", false).argument("[username]", "Username").argument("[password]", "Password").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (username, password, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/set/credentials",
				query: profile ? { profile } : void 0,
				body: {
					username: username?.trim() || void 0,
					password,
					clear: Boolean(opts.clear),
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(opts.clear ? "credentials cleared" : "credentials set");
		});
	});
	set.command("geo").description("Set geolocation (and grant permission)").option("--clear", "Clear geolocation + permissions", false).argument("[latitude]", "Latitude", (v) => Number(v)).argument("[longitude]", "Longitude", (v) => Number(v)).option("--accuracy <m>", "Accuracy in meters", (v) => Number(v)).option("--origin <origin>", "Origin to grant permissions for").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (latitude, longitude, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/set/geolocation",
				query: profile ? { profile } : void 0,
				body: {
					latitude: Number.isFinite(latitude) ? latitude : void 0,
					longitude: Number.isFinite(longitude) ? longitude : void 0,
					accuracy: Number.isFinite(opts.accuracy) ? opts.accuracy : void 0,
					origin: opts.origin?.trim() || void 0,
					clear: Boolean(opts.clear),
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(opts.clear ? "geolocation cleared" : "geolocation set");
		});
	});
	set.command("media").description("Emulate prefers-color-scheme").argument("<dark|light|none>", "dark/light/none").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (value, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		const v = value.trim().toLowerCase();
		const colorScheme = v === "dark" ? "dark" : v === "light" ? "light" : v === "none" ? "none" : null;
		if (!colorScheme) {
			defaultRuntime.error(danger("Expected dark|light|none"));
			defaultRuntime.exit(1);
			return;
		}
		await runBrowserCommand(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/set/media",
				query: profile ? { profile } : void 0,
				body: {
					colorScheme,
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`media colorScheme: ${colorScheme}`);
		});
	});
	set.command("timezone").description("Override timezone (CDP)").argument("<timezoneId>", "Timezone ID (e.g. America/New_York)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (timezoneId, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/set/timezone",
				query: profile ? { profile } : void 0,
				body: {
					timezoneId,
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`timezone: ${timezoneId}`);
		});
	});
	set.command("locale").description("Override locale (CDP)").argument("<locale>", "Locale (e.g. en-US)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (locale, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/set/locale",
				query: profile ? { profile } : void 0,
				body: {
					locale,
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`locale: ${locale}`);
		});
	});
	set.command("device").description("Apply a Playwright device descriptor (e.g. \"iPhone 14\")").argument("<name>", "Device name (Playwright devices)").option("--target-id <id>", "CDP target id (or unique prefix)").action(async (name, opts, cmd) => {
		const parent = parentOpts(cmd);
		const profile = parent?.browserProfile;
		await runBrowserCommand(async () => {
			const result = await callBrowserRequest(parent, {
				method: "POST",
				path: "/set/device",
				query: profile ? { profile } : void 0,
				body: {
					name,
					targetId: opts.targetId?.trim() || void 0
				}
			}, { timeoutMs: 2e4 });
			if (parent?.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			defaultRuntime.log(`device: ${name}`);
		});
	});
}

//#endregion
//#region src/cli/browser-cli.ts
function registerBrowserCli(program) {
	const browser = program.command("browser").description("Manage OpenClaw's dedicated browser (Chrome/Chromium)").option("--browser-profile <name>", "Browser profile name (default from config)").option("--json", "Output machine-readable JSON", false).addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([...browserCoreExamples, ...browserActionExamples].map((cmd) => [cmd, ""]), true)}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/browser", "docs.openclaw.ai/cli/browser")}\n`).action(() => {
		browser.outputHelp();
		defaultRuntime.error(danger(`Missing subcommand. Try: "${formatCliCommand("openclaw browser status")}"`));
		defaultRuntime.exit(1);
	});
	addGatewayClientOptions(browser);
	const parentOpts = (cmd) => cmd.parent?.opts?.();
	registerBrowserManageCommands(browser, parentOpts);
	registerBrowserExtensionCommands(browser, parentOpts);
	registerBrowserInspectCommands(browser, parentOpts);
	registerBrowserActionInputCommands(browser, parentOpts);
	registerBrowserActionObserveCommands(browser, parentOpts);
	registerBrowserDebugCommands(browser, parentOpts);
	registerBrowserStateCommands(browser, parentOpts);
}

//#endregion
//#region src/cli/config-cli.ts
function isIndexSegment(raw) {
	return /^[0-9]+$/.test(raw);
}
function parsePath(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return [];
	const parts = [];
	let current = "";
	let i = 0;
	while (i < trimmed.length) {
		const ch = trimmed[i];
		if (ch === "\\") {
			const next = trimmed[i + 1];
			if (next) current += next;
			i += 2;
			continue;
		}
		if (ch === ".") {
			if (current) parts.push(current);
			current = "";
			i += 1;
			continue;
		}
		if (ch === "[") {
			if (current) parts.push(current);
			current = "";
			const close = trimmed.indexOf("]", i);
			if (close === -1) throw new Error(`Invalid path (missing "]"): ${raw}`);
			const inside = trimmed.slice(i + 1, close).trim();
			if (!inside) throw new Error(`Invalid path (empty "[]"): ${raw}`);
			parts.push(inside);
			i = close + 1;
			continue;
		}
		current += ch;
		i += 1;
	}
	if (current) parts.push(current);
	return parts.map((part) => part.trim()).filter(Boolean);
}
function parseValue(raw, opts) {
	const trimmed = raw.trim();
	if (opts.json) try {
		return JSON5.parse(trimmed);
	} catch (err) {
		throw new Error(`Failed to parse JSON5 value: ${String(err)}`, { cause: err });
	}
	try {
		return JSON5.parse(trimmed);
	} catch {
		return raw;
	}
}
function getAtPath(root, path) {
	let current = root;
	for (const segment of path) {
		if (!current || typeof current !== "object") return { found: false };
		if (Array.isArray(current)) {
			if (!isIndexSegment(segment)) return { found: false };
			const index = Number.parseInt(segment, 10);
			if (!Number.isFinite(index) || index < 0 || index >= current.length) return { found: false };
			current = current[index];
			continue;
		}
		const record = current;
		if (!(segment in record)) return { found: false };
		current = record[segment];
	}
	return {
		found: true,
		value: current
	};
}
function setAtPath(root, path, value) {
	let current = root;
	for (let i = 0; i < path.length - 1; i += 1) {
		const segment = path[i];
		const next = path[i + 1];
		const nextIsIndex = Boolean(next && isIndexSegment(next));
		if (Array.isArray(current)) {
			if (!isIndexSegment(segment)) throw new Error(`Expected numeric index for array segment "${segment}"`);
			const index = Number.parseInt(segment, 10);
			const existing = current[index];
			if (!existing || typeof existing !== "object") current[index] = nextIsIndex ? [] : {};
			current = current[index];
			continue;
		}
		if (!current || typeof current !== "object") throw new Error(`Cannot traverse into "${segment}" (not an object)`);
		const record = current;
		const existing = record[segment];
		if (!existing || typeof existing !== "object") record[segment] = nextIsIndex ? [] : {};
		current = record[segment];
	}
	const last = path[path.length - 1];
	if (Array.isArray(current)) {
		if (!isIndexSegment(last)) throw new Error(`Expected numeric index for array segment "${last}"`);
		const index = Number.parseInt(last, 10);
		current[index] = value;
		return;
	}
	if (!current || typeof current !== "object") throw new Error(`Cannot set "${last}" (parent is not an object)`);
	current[last] = value;
}
function unsetAtPath(root, path) {
	let current = root;
	for (let i = 0; i < path.length - 1; i += 1) {
		const segment = path[i];
		if (!current || typeof current !== "object") return false;
		if (Array.isArray(current)) {
			if (!isIndexSegment(segment)) return false;
			const index = Number.parseInt(segment, 10);
			if (!Number.isFinite(index) || index < 0 || index >= current.length) return false;
			current = current[index];
			continue;
		}
		const record = current;
		if (!(segment in record)) return false;
		current = record[segment];
	}
	const last = path[path.length - 1];
	if (Array.isArray(current)) {
		if (!isIndexSegment(last)) return false;
		const index = Number.parseInt(last, 10);
		if (!Number.isFinite(index) || index < 0 || index >= current.length) return false;
		current.splice(index, 1);
		return true;
	}
	if (!current || typeof current !== "object") return false;
	const record = current;
	if (!(last in record)) return false;
	delete record[last];
	return true;
}
async function loadValidConfig(runtime = defaultRuntime) {
	const snapshot = await readConfigFileSnapshot();
	if (snapshot.valid) return snapshot;
	runtime.error(`Config invalid at ${shortenHomePath(snapshot.path)}.`);
	for (const issue of snapshot.issues) runtime.error(`- ${issue.path || "<root>"}: ${issue.message}`);
	runtime.error(`Run \`${formatCliCommand("openclaw doctor")}\` to repair, then retry.`);
	runtime.exit(1);
	return snapshot;
}
function parseRequiredPath(path) {
	const parsedPath = parsePath(path);
	if (parsedPath.length === 0) throw new Error("Path is empty.");
	return parsedPath;
}
async function runConfigGet(opts) {
	const runtime = opts.runtime ?? defaultRuntime;
	try {
		const parsedPath = parseRequiredPath(opts.path);
		const res = getAtPath((await loadValidConfig(runtime)).config, parsedPath);
		if (!res.found) {
			runtime.error(danger(`Config path not found: ${opts.path}`));
			runtime.exit(1);
			return;
		}
		if (opts.json) {
			runtime.log(JSON.stringify(res.value ?? null, null, 2));
			return;
		}
		if (typeof res.value === "string" || typeof res.value === "number" || typeof res.value === "boolean") {
			runtime.log(String(res.value));
			return;
		}
		runtime.log(JSON.stringify(res.value ?? null, null, 2));
	} catch (err) {
		runtime.error(danger(String(err)));
		runtime.exit(1);
	}
}
async function runConfigUnset(opts) {
	const runtime = opts.runtime ?? defaultRuntime;
	try {
		const parsedPath = parseRequiredPath(opts.path);
		const snapshot = await loadValidConfig(runtime);
		const next = structuredClone(snapshot.resolved);
		if (!unsetAtPath(next, parsedPath)) {
			runtime.error(danger(`Config path not found: ${opts.path}`));
			runtime.exit(1);
			return;
		}
		await writeConfigFile(next);
		runtime.log(info(`Removed ${opts.path}. Restart the gateway to apply.`));
	} catch (err) {
		runtime.error(danger(String(err)));
		runtime.exit(1);
	}
}
function registerConfigCli(program) {
	const cmd = program.command("config").description("Config helpers (get/set/unset). Run without subcommand for the wizard.").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/config", "docs.openclaw.ai/cli/config")}\n`).option("--section <section>", "Configure wizard sections (repeatable). Use with no subcommand.", (value, previous) => [...previous, value], []).action(async (opts) => {
		const { CONFIGURE_WIZARD_SECTIONS, configureCommand, configureCommandWithSections } = await import("./configure-BhCiZ10c.js").then((n) => n.t);
		const sections = Array.isArray(opts.section) ? opts.section.map((value) => typeof value === "string" ? value.trim() : "").filter(Boolean) : [];
		if (sections.length === 0) {
			await configureCommand(defaultRuntime);
			return;
		}
		const invalid = sections.filter((s) => !CONFIGURE_WIZARD_SECTIONS.includes(s));
		if (invalid.length > 0) {
			defaultRuntime.error(`Invalid --section: ${invalid.join(", ")}. Expected one of: ${CONFIGURE_WIZARD_SECTIONS.join(", ")}.`);
			defaultRuntime.exit(1);
			return;
		}
		await configureCommandWithSections(sections, defaultRuntime);
	});
	cmd.command("get").description("Get a config value by dot path").argument("<path>", "Config path (dot or bracket notation)").option("--json", "Output JSON", false).action(async (path, opts) => {
		await runConfigGet({
			path,
			json: Boolean(opts.json)
		});
	});
	cmd.command("set").description("Set a config value by dot path").argument("<path>", "Config path (dot or bracket notation)").argument("<value>", "Value (JSON5 or raw string)").option("--json", "Parse value as JSON5 (required)", false).action(async (path, value, opts) => {
		try {
			const parsedPath = parsePath(path);
			if (parsedPath.length === 0) throw new Error("Path is empty.");
			const parsedValue = parseValue(value, opts);
			const snapshot = await loadValidConfig();
			const next = structuredClone(snapshot.resolved);
			setAtPath(next, parsedPath, parsedValue);
			await writeConfigFile(next);
			defaultRuntime.log(info(`Updated ${path}. Restart the gateway to apply.`));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	cmd.command("unset").description("Remove a config value by dot path").argument("<path>", "Config path (dot or bracket notation)").action(async (path) => {
		await runConfigUnset({ path });
	});
}

//#endregion
//#region src/commands/agent-via-gateway.ts
function parseTimeoutSeconds(opts) {
	const raw = opts.timeout !== void 0 ? Number.parseInt(String(opts.timeout), 10) : opts.cfg.agents?.defaults?.timeoutSeconds ?? 600;
	if (Number.isNaN(raw) || raw <= 0) throw new Error("--timeout must be a positive integer (seconds)");
	return raw;
}
function formatPayloadForLog(payload) {
	const lines = [];
	if (payload.text) lines.push(payload.text.trimEnd());
	const mediaUrl = typeof payload.mediaUrl === "string" && payload.mediaUrl.trim() ? payload.mediaUrl.trim() : void 0;
	const media = payload.mediaUrls ?? (mediaUrl ? [mediaUrl] : []);
	for (const url of media) lines.push(`MEDIA:${url}`);
	return lines.join("\n").trimEnd();
}
async function agentViaGatewayCommand(opts, runtime) {
	const body = (opts.message ?? "").trim();
	if (!body) throw new Error("Message (--message) is required");
	if (!opts.to && !opts.sessionId && !opts.agent) throw new Error("Pass --to <E.164>, --session-id, or --agent to choose a session");
	const cfg = loadConfig();
	const agentIdRaw = opts.agent?.trim();
	const agentId = agentIdRaw ? normalizeAgentId(agentIdRaw) : void 0;
	if (agentId) {
		if (!listAgentIds(cfg).includes(agentId)) throw new Error(`Unknown agent id "${agentIdRaw}". Use "${formatCliCommand("openclaw agents list")}" to see configured agents.`);
	}
	const timeoutSeconds = parseTimeoutSeconds({
		cfg,
		timeout: opts.timeout
	});
	const gatewayTimeoutMs = Math.max(1e4, (timeoutSeconds + 30) * 1e3);
	const sessionKey = resolveSessionKeyForRequest({
		cfg,
		agentId,
		to: opts.to,
		sessionId: opts.sessionId
	}).sessionKey;
	const channel = normalizeMessageChannel(opts.channel) ?? DEFAULT_CHAT_CHANNEL;
	const idempotencyKey = opts.runId?.trim() || randomIdempotencyKey();
	const response = await withProgress({
		label: "Waiting for agent reply…",
		indeterminate: true,
		enabled: opts.json !== true
	}, async () => await callGateway({
		method: "agent",
		params: {
			message: body,
			agentId,
			to: opts.to,
			replyTo: opts.replyTo,
			sessionId: opts.sessionId,
			sessionKey,
			thinking: opts.thinking,
			deliver: Boolean(opts.deliver),
			channel,
			replyChannel: opts.replyChannel,
			replyAccountId: opts.replyAccount,
			timeout: timeoutSeconds,
			lane: opts.lane,
			extraSystemPrompt: opts.extraSystemPrompt,
			idempotencyKey
		},
		expectFinal: true,
		timeoutMs: gatewayTimeoutMs,
		clientName: GATEWAY_CLIENT_NAMES.CLI,
		mode: GATEWAY_CLIENT_MODES.CLI
	}));
	if (opts.json) {
		runtime.log(JSON.stringify(response, null, 2));
		return response;
	}
	const payloads = (response?.result)?.payloads ?? [];
	if (payloads.length === 0) {
		runtime.log(response?.summary ? String(response.summary) : "No reply from agent.");
		return response;
	}
	for (const payload of payloads) {
		const out = formatPayloadForLog(payload);
		if (out) runtime.log(out);
	}
	return response;
}
async function agentCliCommand(opts, runtime, deps) {
	const localOpts = {
		...opts,
		agentId: opts.agent,
		replyAccountId: opts.replyAccount
	};
	if (opts.local === true) return await agentCommand(localOpts, runtime, deps);
	try {
		return await agentViaGatewayCommand(opts, runtime);
	} catch (err) {
		runtime.error?.(`Gateway agent failed; falling back to embedded: ${String(err)}`);
		return await agentCommand(localOpts, runtime, deps);
	}
}

//#endregion
//#region src/commands/agents.bindings.ts
function bindingMatchKey(match) {
	const accountId = match.accountId?.trim() || DEFAULT_ACCOUNT_ID;
	return [
		match.channel,
		accountId,
		match.peer?.kind ?? "",
		match.peer?.id ?? "",
		match.guildId ?? "",
		match.teamId ?? ""
	].join("|");
}
function describeBinding(binding) {
	const match = binding.match;
	const parts = [match.channel];
	if (match.accountId) parts.push(`accountId=${match.accountId}`);
	if (match.peer) parts.push(`peer=${match.peer.kind}:${match.peer.id}`);
	if (match.guildId) parts.push(`guild=${match.guildId}`);
	if (match.teamId) parts.push(`team=${match.teamId}`);
	return parts.join(" ");
}
function applyAgentBindings(cfg, bindings) {
	const existing = cfg.bindings ?? [];
	const existingMatchMap = /* @__PURE__ */ new Map();
	for (const binding of existing) {
		const key = bindingMatchKey(binding.match);
		if (!existingMatchMap.has(key)) existingMatchMap.set(key, normalizeAgentId(binding.agentId));
	}
	const added = [];
	const skipped = [];
	const conflicts = [];
	for (const binding of bindings) {
		const agentId = normalizeAgentId(binding.agentId);
		const key = bindingMatchKey(binding.match);
		const existingAgentId = existingMatchMap.get(key);
		if (existingAgentId) {
			if (existingAgentId === agentId) skipped.push(binding);
			else conflicts.push({
				binding,
				existingAgentId
			});
			continue;
		}
		existingMatchMap.set(key, agentId);
		added.push({
			...binding,
			agentId
		});
	}
	if (added.length === 0) return {
		config: cfg,
		added,
		skipped,
		conflicts
	};
	return {
		config: {
			...cfg,
			bindings: [...existing, ...added]
		},
		added,
		skipped,
		conflicts
	};
}
function resolveDefaultAccountId$1(cfg, provider) {
	const plugin = getChannelPlugin(provider);
	if (!plugin) return DEFAULT_ACCOUNT_ID;
	return resolveChannelDefaultAccountId({
		plugin,
		cfg
	});
}
function buildChannelBindings(params) {
	const bindings = [];
	const agentId = normalizeAgentId(params.agentId);
	for (const channel of params.selection) {
		const match = { channel };
		const accountId = params.accountIds?.[channel]?.trim();
		if (accountId) match.accountId = accountId;
		else if (getChannelPlugin(channel)?.meta.forceAccountBinding) match.accountId = resolveDefaultAccountId$1(params.config, channel);
		bindings.push({
			agentId,
			match
		});
	}
	return bindings;
}
function parseBindingSpecs(params) {
	const bindings = [];
	const errors = [];
	const specs = params.specs ?? [];
	const agentId = normalizeAgentId(params.agentId);
	for (const raw of specs) {
		const trimmed = raw?.trim();
		if (!trimmed) continue;
		const [channelRaw, accountRaw] = trimmed.split(":", 2);
		const channel = normalizeChannelId(channelRaw);
		if (!channel) {
			errors.push(`Unknown channel "${channelRaw}".`);
			continue;
		}
		let accountId = accountRaw?.trim();
		if (accountRaw !== void 0 && !accountId) {
			errors.push(`Invalid binding "${trimmed}" (empty account id).`);
			continue;
		}
		if (!accountId) {
			if (getChannelPlugin(channel)?.meta.forceAccountBinding) accountId = resolveDefaultAccountId$1(params.config, channel);
		}
		const match = { channel };
		if (accountId) match.accountId = accountId;
		bindings.push({
			agentId,
			match
		});
	}
	return {
		bindings,
		errors
	};
}

//#endregion
//#region src/commands/agents.command-shared.ts
function createQuietRuntime(runtime) {
	return {
		...runtime,
		log: () => {}
	};
}
async function requireValidConfig(runtime) {
	const snapshot = await readConfigFileSnapshot();
	if (snapshot.exists && !snapshot.valid) {
		const issues = snapshot.issues.length > 0 ? snapshot.issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n") : "Unknown validation issue.";
		runtime.error(`Config invalid:\n${issues}`);
		runtime.error(`Fix the config or run ${formatCliCommand("openclaw doctor")}.`);
		runtime.exit(1);
		return null;
	}
	return snapshot.config;
}

//#endregion
//#region src/commands/agents.commands.add.ts
async function fileExists(pathname) {
	try {
		await fsPromises.stat(pathname);
		return true;
	} catch {
		return false;
	}
}
async function agentsAddCommand(opts, runtime = defaultRuntime, params) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	const workspaceFlag = opts.workspace?.trim();
	const nameInput = opts.name?.trim();
	const hasFlags = params?.hasFlags === true;
	const nonInteractive = Boolean(opts.nonInteractive || hasFlags);
	if (nonInteractive && !workspaceFlag) {
		runtime.error("Non-interactive mode requires --workspace. Re-run without flags to use the wizard.");
		runtime.exit(1);
		return;
	}
	if (nonInteractive) {
		if (!nameInput) {
			runtime.error("Agent name is required in non-interactive mode.");
			runtime.exit(1);
			return;
		}
		if (!workspaceFlag) {
			runtime.error("Non-interactive mode requires --workspace. Re-run without flags to use the wizard.");
			runtime.exit(1);
			return;
		}
		const agentId = normalizeAgentId(nameInput);
		if (agentId === DEFAULT_AGENT_ID) {
			runtime.error(`"${DEFAULT_AGENT_ID}" is reserved. Choose another name.`);
			runtime.exit(1);
			return;
		}
		if (agentId !== nameInput) runtime.log(`Normalized agent id to "${agentId}".`);
		if (findAgentEntryIndex(listAgentEntries(cfg), agentId) >= 0) {
			runtime.error(`Agent "${agentId}" already exists.`);
			runtime.exit(1);
			return;
		}
		const workspaceDir = resolveUserPath(workspaceFlag);
		const agentDir = opts.agentDir?.trim() ? resolveUserPath(opts.agentDir.trim()) : resolveAgentDir(cfg, agentId);
		const model = opts.model?.trim();
		const nextConfig = applyAgentConfig(cfg, {
			agentId,
			name: nameInput,
			workspace: workspaceDir,
			agentDir,
			...model ? { model } : {}
		});
		const bindingParse = parseBindingSpecs({
			agentId,
			specs: opts.bind,
			config: nextConfig
		});
		if (bindingParse.errors.length > 0) {
			runtime.error(bindingParse.errors.join("\n"));
			runtime.exit(1);
			return;
		}
		const bindingResult = bindingParse.bindings.length > 0 ? applyAgentBindings(nextConfig, bindingParse.bindings) : {
			config: nextConfig,
			added: [],
			skipped: [],
			conflicts: []
		};
		await writeConfigFile(bindingResult.config);
		if (!opts.json) logConfigUpdated(runtime);
		await ensureWorkspaceAndSessions(workspaceDir, opts.json ? createQuietRuntime(runtime) : runtime, {
			skipBootstrap: Boolean(bindingResult.config.agents?.defaults?.skipBootstrap),
			agentId
		});
		const payload = {
			agentId,
			name: nameInput,
			workspace: workspaceDir,
			agentDir,
			model,
			bindings: {
				added: bindingResult.added.map(describeBinding),
				skipped: bindingResult.skipped.map(describeBinding),
				conflicts: bindingResult.conflicts.map((conflict) => `${describeBinding(conflict.binding)} (agent=${conflict.existingAgentId})`)
			}
		};
		if (opts.json) runtime.log(JSON.stringify(payload, null, 2));
		else {
			runtime.log(`Agent: ${agentId}`);
			runtime.log(`Workspace: ${shortenHomePath(workspaceDir)}`);
			runtime.log(`Agent dir: ${shortenHomePath(agentDir)}`);
			if (model) runtime.log(`Model: ${model}`);
			if (bindingResult.conflicts.length > 0) runtime.error(["Skipped bindings already claimed by another agent:", ...bindingResult.conflicts.map((conflict) => `- ${describeBinding(conflict.binding)} (agent=${conflict.existingAgentId})`)].join("\n"));
		}
		return;
	}
	const prompter = createClackPrompter();
	try {
		await prompter.intro("Add OpenClaw agent");
		const name = nameInput ?? await prompter.text({
			message: "Agent name",
			validate: (value) => {
				if (!value?.trim()) return "Required";
				if (normalizeAgentId(value) === DEFAULT_AGENT_ID) return `"${DEFAULT_AGENT_ID}" is reserved. Choose another name.`;
			}
		});
		const agentName = String(name ?? "").trim();
		const agentId = normalizeAgentId(agentName);
		if (agentName !== agentId) await prompter.note(`Normalized id to "${agentId}".`, "Agent id");
		if (listAgentEntries(cfg).find((agent) => normalizeAgentId(agent.id) === agentId)) {
			if (!await prompter.confirm({
				message: `Agent "${agentId}" already exists. Update it?`,
				initialValue: false
			})) {
				await prompter.outro("No changes made.");
				return;
			}
		}
		const workspaceDefault = resolveAgentWorkspaceDir(cfg, agentId);
		const workspaceInput = await prompter.text({
			message: "Workspace directory",
			initialValue: workspaceDefault,
			validate: (value) => value?.trim() ? void 0 : "Required"
		});
		const workspaceDir = resolveUserPath(String(workspaceInput ?? "").trim() || workspaceDefault);
		const agentDir = resolveAgentDir(cfg, agentId);
		let nextConfig = applyAgentConfig(cfg, {
			agentId,
			name: agentName,
			workspace: workspaceDir,
			agentDir
		});
		const defaultAgentId = resolveDefaultAgentId(cfg);
		if (defaultAgentId !== agentId) {
			const sourceAuthPath = resolveAuthStorePath(resolveAgentDir(cfg, defaultAgentId));
			const destAuthPath = resolveAuthStorePath(agentDir);
			if (!(path.resolve(sourceAuthPath).toLowerCase() === path.resolve(destAuthPath).toLowerCase()) && await fileExists(sourceAuthPath) && !await fileExists(destAuthPath)) {
				if (await prompter.confirm({
					message: `Copy auth profiles from "${defaultAgentId}"?`,
					initialValue: false
				})) {
					await fsPromises.mkdir(path.dirname(destAuthPath), { recursive: true });
					await fsPromises.copyFile(sourceAuthPath, destAuthPath);
					await prompter.note(`Copied auth profiles from "${defaultAgentId}".`, "Auth profiles");
				}
			}
		}
		if (await prompter.confirm({
			message: "Configure model/auth for this agent now?",
			initialValue: false
		})) {
			const authResult = await applyAuthChoice({
				authChoice: await promptAuthChoiceGrouped({
					prompter,
					store: ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false }),
					includeSkip: true
				}),
				config: nextConfig,
				prompter,
				runtime,
				agentDir,
				setDefaultModel: false,
				agentId
			});
			nextConfig = authResult.config;
			if (authResult.agentModelOverride) nextConfig = applyAgentConfig(nextConfig, {
				agentId,
				model: authResult.agentModelOverride
			});
		}
		await warnIfModelConfigLooksOff(nextConfig, prompter, {
			agentId,
			agentDir
		});
		let selection = [];
		const channelAccountIds = {};
		nextConfig = await setupChannels(nextConfig, runtime, prompter, {
			allowSignalInstall: true,
			onSelection: (value) => {
				selection = value;
			},
			promptAccountIds: true,
			onAccountId: (channel, accountId) => {
				channelAccountIds[channel] = accountId;
			}
		});
		if (selection.length > 0) if (await prompter.confirm({
			message: "Route selected channels to this agent now? (bindings)",
			initialValue: false
		})) {
			const desiredBindings = buildChannelBindings({
				agentId,
				selection,
				config: nextConfig,
				accountIds: channelAccountIds
			});
			const result = applyAgentBindings(nextConfig, desiredBindings);
			nextConfig = result.config;
			if (result.conflicts.length > 0) await prompter.note(["Skipped bindings already claimed by another agent:", ...result.conflicts.map((conflict) => `- ${describeBinding(conflict.binding)} (agent=${conflict.existingAgentId})`)].join("\n"), "Routing bindings");
		} else await prompter.note(["Routing unchanged. Add bindings when you're ready.", "Docs: https://docs.openclaw.ai/concepts/multi-agent"].join("\n"), "Routing");
		await writeConfigFile(nextConfig);
		logConfigUpdated(runtime);
		await ensureWorkspaceAndSessions(workspaceDir, runtime, {
			skipBootstrap: Boolean(nextConfig.agents?.defaults?.skipBootstrap),
			agentId
		});
		const payload = {
			agentId,
			name: agentName,
			workspace: workspaceDir,
			agentDir
		};
		if (opts.json) runtime.log(JSON.stringify(payload, null, 2));
		await prompter.outro(`Agent "${agentId}" ready.`);
	} catch (err) {
		if (err instanceof WizardCancelledError) {
			runtime.exit(1);
			return;
		}
		throw err;
	}
}

//#endregion
//#region src/commands/agents.commands.delete.ts
async function agentsDeleteCommand(opts, runtime = defaultRuntime) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	const input = opts.id?.trim();
	if (!input) {
		runtime.error("Agent id is required.");
		runtime.exit(1);
		return;
	}
	const agentId = normalizeAgentId(input);
	if (agentId !== input) runtime.log(`Normalized agent id to "${agentId}".`);
	if (agentId === DEFAULT_AGENT_ID) {
		runtime.error(`"${DEFAULT_AGENT_ID}" cannot be deleted.`);
		runtime.exit(1);
		return;
	}
	if (findAgentEntryIndex(listAgentEntries(cfg), agentId) < 0) {
		runtime.error(`Agent "${agentId}" not found.`);
		runtime.exit(1);
		return;
	}
	if (!opts.force) {
		if (!process.stdin.isTTY) {
			runtime.error("Non-interactive session. Re-run with --force.");
			runtime.exit(1);
			return;
		}
		if (!await createClackPrompter().confirm({
			message: `Delete agent "${agentId}" and prune workspace/state?`,
			initialValue: false
		})) {
			runtime.log("Cancelled.");
			return;
		}
	}
	const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
	const agentDir = resolveAgentDir(cfg, agentId);
	const sessionsDir = resolveSessionTranscriptsDirForAgent(agentId);
	const result = pruneAgentConfig(cfg, agentId);
	await writeConfigFile(result.config);
	if (!opts.json) logConfigUpdated(runtime);
	const quietRuntime = opts.json ? createQuietRuntime(runtime) : runtime;
	await moveToTrash(workspaceDir, quietRuntime);
	await moveToTrash(agentDir, quietRuntime);
	await moveToTrash(sessionsDir, quietRuntime);
	if (opts.json) runtime.log(JSON.stringify({
		agentId,
		workspace: workspaceDir,
		agentDir,
		sessionsDir,
		removedBindings: result.removedBindings,
		removedAllow: result.removedAllow
	}, null, 2));
	else runtime.log(`Deleted agent: ${agentId}`);
}

//#endregion
//#region src/commands/agents.commands.identity.ts
const normalizeWorkspacePath = (input) => path.resolve(resolveUserPath(input));
const coerceTrimmed = (value) => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
};
async function loadIdentityFromFile(filePath) {
	try {
		const parsed = parseIdentityMarkdown(await fsPromises.readFile(filePath, "utf-8"));
		if (!identityHasValues(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}
function resolveAgentIdByWorkspace(cfg, workspaceDir) {
	const list = listAgentEntries(cfg);
	const ids = list.length > 0 ? list.map((entry) => normalizeAgentId(entry.id)) : [resolveDefaultAgentId(cfg)];
	const normalizedTarget = normalizeWorkspacePath(workspaceDir);
	return ids.filter((id) => normalizeWorkspacePath(resolveAgentWorkspaceDir(cfg, id)) === normalizedTarget);
}
async function agentsSetIdentityCommand(opts, runtime = defaultRuntime) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	const agentRaw = coerceTrimmed(opts.agent);
	const nameRaw = coerceTrimmed(opts.name);
	const emojiRaw = coerceTrimmed(opts.emoji);
	const themeRaw = coerceTrimmed(opts.theme);
	const avatarRaw = coerceTrimmed(opts.avatar);
	const hasExplicitIdentity = Boolean(nameRaw || emojiRaw || themeRaw || avatarRaw);
	const identityFileRaw = coerceTrimmed(opts.identityFile);
	const workspaceRaw = coerceTrimmed(opts.workspace);
	const wantsIdentityFile = Boolean(opts.fromIdentity || identityFileRaw || !hasExplicitIdentity);
	let identityFilePath;
	let workspaceDir;
	if (identityFileRaw) {
		identityFilePath = normalizeWorkspacePath(identityFileRaw);
		workspaceDir = path.dirname(identityFilePath);
	} else if (workspaceRaw) workspaceDir = normalizeWorkspacePath(workspaceRaw);
	else if (wantsIdentityFile || !agentRaw) workspaceDir = path.resolve(process.cwd());
	let agentId = agentRaw ? normalizeAgentId(agentRaw) : void 0;
	if (!agentId) {
		if (!workspaceDir) {
			runtime.error("Select an agent with --agent or provide a workspace via --workspace.");
			runtime.exit(1);
			return;
		}
		const matches = resolveAgentIdByWorkspace(cfg, workspaceDir);
		if (matches.length === 0) {
			runtime.error(`No agent workspace matches ${shortenHomePath(workspaceDir)}. Pass --agent to target a specific agent.`);
			runtime.exit(1);
			return;
		}
		if (matches.length > 1) {
			runtime.error(`Multiple agents match ${shortenHomePath(workspaceDir)}: ${matches.join(", ")}. Pass --agent to choose one.`);
			runtime.exit(1);
			return;
		}
		agentId = matches[0];
	}
	let identityFromFile = null;
	if (wantsIdentityFile) {
		if (identityFilePath) identityFromFile = await loadIdentityFromFile(identityFilePath);
		else if (workspaceDir) identityFromFile = loadAgentIdentity(workspaceDir);
		if (!identityFromFile) {
			const targetPath = identityFilePath ?? (workspaceDir ? path.join(workspaceDir, DEFAULT_IDENTITY_FILENAME) : "IDENTITY.md");
			runtime.error(`No identity data found in ${shortenHomePath(targetPath)}.`);
			runtime.exit(1);
			return;
		}
	}
	const fileTheme = identityFromFile?.theme ?? identityFromFile?.creature ?? identityFromFile?.vibe ?? void 0;
	const incomingIdentity = {
		...nameRaw || identityFromFile?.name ? { name: nameRaw ?? identityFromFile?.name } : {},
		...emojiRaw || identityFromFile?.emoji ? { emoji: emojiRaw ?? identityFromFile?.emoji } : {},
		...themeRaw || fileTheme ? { theme: themeRaw ?? fileTheme } : {},
		...avatarRaw || identityFromFile?.avatar ? { avatar: avatarRaw ?? identityFromFile?.avatar } : {}
	};
	if (!incomingIdentity.name && !incomingIdentity.emoji && !incomingIdentity.theme && !incomingIdentity.avatar) {
		runtime.error("No identity fields provided. Use --name/--emoji/--theme/--avatar or --from-identity.");
		runtime.exit(1);
		return;
	}
	const list = listAgentEntries(cfg);
	const index = findAgentEntryIndex(list, agentId);
	const base = index >= 0 ? list[index] : { id: agentId };
	const nextIdentity = {
		...base.identity,
		...incomingIdentity
	};
	const nextEntry = {
		...base,
		identity: nextIdentity
	};
	const nextList = [...list];
	if (index >= 0) nextList[index] = nextEntry;
	else {
		const defaultId = normalizeAgentId(resolveDefaultAgentId(cfg));
		if (nextList.length === 0 && agentId !== defaultId) nextList.push({ id: defaultId });
		nextList.push(nextEntry);
	}
	await writeConfigFile({
		...cfg,
		agents: {
			...cfg.agents,
			list: nextList
		}
	});
	if (opts.json) {
		runtime.log(JSON.stringify({
			agentId,
			identity: nextIdentity,
			workspace: workspaceDir ?? null,
			identityFile: identityFilePath ?? null
		}, null, 2));
		return;
	}
	logConfigUpdated(runtime);
	runtime.log(`Agent: ${agentId}`);
	if (nextIdentity.name) runtime.log(`Name: ${nextIdentity.name}`);
	if (nextIdentity.theme) runtime.log(`Theme: ${nextIdentity.theme}`);
	if (nextIdentity.emoji) runtime.log(`Emoji: ${nextIdentity.emoji}`);
	if (nextIdentity.avatar) runtime.log(`Avatar: ${nextIdentity.avatar}`);
	if (workspaceDir) runtime.log(`Workspace: ${shortenHomePath(workspaceDir)}`);
}

//#endregion
//#region src/commands/agents.providers.ts
function providerAccountKey(provider, accountId) {
	return `${provider}:${accountId ?? DEFAULT_ACCOUNT_ID}`;
}
function formatChannelAccountLabel(params) {
	return `${getChannelPlugin(params.provider)?.meta.label ?? params.provider} ${params.name?.trim() ? `${params.accountId} (${params.name.trim()})` : params.accountId}`;
}
function formatProviderState(entry) {
	const parts = [entry.state];
	if (entry.enabled === false && entry.state !== "disabled") parts.push("disabled");
	return parts.join(", ");
}
async function buildProviderStatusIndex(cfg) {
	const map = /* @__PURE__ */ new Map();
	for (const plugin of listChannelPlugins()) {
		const accountIds = plugin.config.listAccountIds(cfg);
		for (const accountId of accountIds) {
			const account = plugin.config.resolveAccount(cfg, accountId);
			const snapshot = plugin.config.describeAccount?.(account, cfg);
			const enabled = plugin.config.isEnabled ? plugin.config.isEnabled(account, cfg) : typeof snapshot?.enabled === "boolean" ? snapshot.enabled : account.enabled;
			const configured = plugin.config.isConfigured ? await plugin.config.isConfigured(account, cfg) : snapshot?.configured;
			const resolvedEnabled = typeof enabled === "boolean" ? enabled : true;
			const resolvedConfigured = typeof configured === "boolean" ? configured : true;
			const state = plugin.status?.resolveAccountState?.({
				account,
				cfg,
				configured: resolvedConfigured,
				enabled: resolvedEnabled
			}) ?? (typeof snapshot?.linked === "boolean" ? snapshot.linked ? "linked" : "not linked" : resolvedConfigured ? "configured" : "not configured");
			const name = snapshot?.name ?? account.name;
			map.set(providerAccountKey(plugin.id, accountId), {
				provider: plugin.id,
				accountId,
				name,
				state,
				enabled,
				configured
			});
		}
	}
	return map;
}
function resolveDefaultAccountId(cfg, provider) {
	const plugin = getChannelPlugin(provider);
	if (!plugin) return DEFAULT_ACCOUNT_ID;
	return resolveChannelDefaultAccountId({
		plugin,
		cfg
	});
}
function shouldShowProviderEntry(entry, cfg) {
	const plugin = getChannelPlugin(entry.provider);
	if (!plugin) return Boolean(entry.configured);
	if (plugin.meta.showConfigured === false) {
		const providerConfig = cfg[plugin.id];
		return Boolean(entry.configured) || Boolean(providerConfig);
	}
	return Boolean(entry.configured);
}
function formatProviderEntry(entry) {
	return `${formatChannelAccountLabel({
		provider: entry.provider,
		accountId: entry.accountId,
		name: entry.name
	})}: ${formatProviderState(entry)}`;
}
function summarizeBindings(cfg, bindings) {
	if (bindings.length === 0) return [];
	const seen = /* @__PURE__ */ new Map();
	for (const binding of bindings) {
		const channel = normalizeChannelId(binding.match.channel);
		if (!channel) continue;
		const accountId = binding.match.accountId ?? resolveDefaultAccountId(cfg, channel);
		const key = providerAccountKey(channel, accountId);
		if (!seen.has(key)) {
			const label = formatChannelAccountLabel({
				provider: channel,
				accountId
			});
			seen.set(key, label);
		}
	}
	return [...seen.values()];
}
function listProvidersForAgent(params) {
	const allProviderEntries = [...params.providerStatus.values()];
	const providerLines = [];
	if (params.bindings.length > 0) {
		const seen = /* @__PURE__ */ new Set();
		for (const binding of params.bindings) {
			const channel = normalizeChannelId(binding.match.channel);
			if (!channel) continue;
			const accountId = binding.match.accountId ?? resolveDefaultAccountId(params.cfg, channel);
			const key = providerAccountKey(channel, accountId);
			if (seen.has(key)) continue;
			seen.add(key);
			const status = params.providerStatus.get(key);
			if (status) providerLines.push(formatProviderEntry(status));
			else providerLines.push(`${formatChannelAccountLabel({
				provider: channel,
				accountId
			})}: unknown`);
		}
		return providerLines;
	}
	if (params.summaryIsDefault) {
		for (const entry of allProviderEntries) if (shouldShowProviderEntry(entry, params.cfg)) providerLines.push(formatProviderEntry(entry));
	}
	return providerLines;
}

//#endregion
//#region src/commands/agents.commands.list.ts
function formatSummary(summary) {
	const defaultTag = summary.isDefault ? " (default)" : "";
	const header = summary.name && summary.name !== summary.id ? `${summary.id}${defaultTag} (${summary.name})` : `${summary.id}${defaultTag}`;
	const identityParts = [];
	if (summary.identityEmoji) identityParts.push(summary.identityEmoji);
	if (summary.identityName) identityParts.push(summary.identityName);
	const identityLine = identityParts.length > 0 ? identityParts.join(" ") : null;
	const identitySource = summary.identitySource === "identity" ? "IDENTITY.md" : summary.identitySource === "config" ? "config" : null;
	const lines = [`- ${header}`];
	if (identityLine) lines.push(`  Identity: ${identityLine}${identitySource ? ` (${identitySource})` : ""}`);
	lines.push(`  Workspace: ${shortenHomePath(summary.workspace)}`);
	lines.push(`  Agent dir: ${shortenHomePath(summary.agentDir)}`);
	if (summary.model) lines.push(`  Model: ${summary.model}`);
	lines.push(`  Routing rules: ${summary.bindings}`);
	if (summary.routes?.length) lines.push(`  Routing: ${summary.routes.join(", ")}`);
	if (summary.providers?.length) {
		lines.push("  Providers:");
		for (const provider of summary.providers) lines.push(`    - ${provider}`);
	}
	if (summary.bindingDetails?.length) {
		lines.push("  Routing rules:");
		for (const binding of summary.bindingDetails) lines.push(`    - ${binding}`);
	}
	return lines.join("\n");
}
async function agentsListCommand(opts, runtime = defaultRuntime) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	const summaries = buildAgentSummaries(cfg);
	const bindingMap = /* @__PURE__ */ new Map();
	for (const binding of cfg.bindings ?? []) {
		const agentId = normalizeAgentId(binding.agentId);
		const list = bindingMap.get(agentId) ?? [];
		list.push(binding);
		bindingMap.set(agentId, list);
	}
	if (opts.bindings) for (const summary of summaries) {
		const bindings = bindingMap.get(summary.id) ?? [];
		if (bindings.length > 0) summary.bindingDetails = bindings.map((binding) => describeBinding(binding));
	}
	const providerStatus = await buildProviderStatusIndex(cfg);
	for (const summary of summaries) {
		const bindings = bindingMap.get(summary.id) ?? [];
		const routes = summarizeBindings(cfg, bindings);
		if (routes.length > 0) summary.routes = routes;
		else if (summary.isDefault) summary.routes = ["default (no explicit rules)"];
		const providerLines = listProvidersForAgent({
			summaryIsDefault: summary.isDefault,
			cfg,
			bindings,
			providerStatus
		});
		if (providerLines.length > 0) summary.providers = providerLines;
	}
	if (opts.json) {
		runtime.log(JSON.stringify(summaries, null, 2));
		return;
	}
	const lines = ["Agents:", ...summaries.map(formatSummary)];
	lines.push("Routing rules map channel/account/peer to an agent. Use --bindings for full rules.");
	lines.push(`Channel status reflects local config/creds. For live health: ${formatCliCommand("openclaw channels status --probe")}.`);
	runtime.log(lines.join("\n"));
}

//#endregion
//#region src/cli/program/register.agent.ts
function registerAgentCommands(program, args) {
	program.command("agent").description("Run an agent turn via the Gateway (use --local for embedded)").requiredOption("-m, --message <text>", "Message body for the agent").option("-t, --to <number>", "Recipient number in E.164 used to derive the session key").option("--session-id <id>", "Use an explicit session id").option("--agent <id>", "Agent id (overrides routing bindings)").option("--thinking <level>", "Thinking level: off | minimal | low | medium | high").option("--verbose <on|off>", "Persist agent verbose level for the session").option("--channel <channel>", `Delivery channel: ${args.agentChannelOptions} (default: ${DEFAULT_CHAT_CHANNEL})`).option("--reply-to <target>", "Delivery target override (separate from session routing)").option("--reply-channel <channel>", "Delivery channel override (separate from routing)").option("--reply-account <id>", "Delivery account id override").option("--local", "Run the embedded agent locally (requires model provider API keys in your shell)", false).option("--deliver", "Send the agent's reply back to the selected channel", false).option("--json", "Output result as JSON", false).option("--timeout <seconds>", "Override agent command timeout (seconds, default 600 or config value)").addHelpText("after", () => `
${theme.heading("Examples:")}
${formatHelpExamples([
		["openclaw agent --to +15555550123 --message \"status update\"", "Start a new session."],
		["openclaw agent --agent ops --message \"Summarize logs\"", "Use a specific agent."],
		["openclaw agent --session-id 1234 --message \"Summarize inbox\" --thinking medium", "Target a session with explicit thinking level."],
		["openclaw agent --to +15555550123 --message \"Trace logs\" --verbose on --json", "Enable verbose logging and JSON output."],
		["openclaw agent --to +15555550123 --message \"Summon reply\" --deliver", "Deliver reply."],
		["openclaw agent --agent ops --message \"Generate report\" --deliver --reply-channel slack --reply-to \"#reports\"", "Send reply to a different channel/target."]
	])}

${theme.muted("Docs:")} ${formatDocsLink("/cli/agent", "docs.openclaw.ai/cli/agent")}`).action(async (opts) => {
		setVerbose((typeof opts.verbose === "string" ? opts.verbose.toLowerCase() : "") === "on");
		const deps = createDefaultDeps();
		await runCommandWithRuntime(defaultRuntime, async () => {
			await agentCliCommand(opts, defaultRuntime, deps);
		});
	});
	const agents = program.command("agents").description("Manage isolated agents (workspaces + auth + routing)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/agents", "docs.openclaw.ai/cli/agents")}\n`);
	agents.command("list").description("List configured agents").option("--json", "Output JSON instead of text", false).option("--bindings", "Include routing bindings", false).action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await agentsListCommand({
				json: Boolean(opts.json),
				bindings: Boolean(opts.bindings)
			}, defaultRuntime);
		});
	});
	agents.command("add [name]").description("Add a new isolated agent").option("--workspace <dir>", "Workspace directory for the new agent").option("--model <id>", "Model id for this agent").option("--agent-dir <dir>", "Agent state directory for this agent").option("--bind <channel[:accountId]>", "Route channel binding (repeatable)", collectOption, []).option("--non-interactive", "Disable prompts; requires --workspace", false).option("--json", "Output JSON summary", false).action(async (name, opts, command) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const hasFlags = hasExplicitOptions(command, [
				"workspace",
				"model",
				"agentDir",
				"bind",
				"nonInteractive"
			]);
			await agentsAddCommand({
				name: typeof name === "string" ? name : void 0,
				workspace: opts.workspace,
				model: opts.model,
				agentDir: opts.agentDir,
				bind: Array.isArray(opts.bind) ? opts.bind : void 0,
				nonInteractive: Boolean(opts.nonInteractive),
				json: Boolean(opts.json)
			}, defaultRuntime, { hasFlags });
		});
	});
	agents.command("set-identity").description("Update an agent identity (name/theme/emoji/avatar)").option("--agent <id>", "Agent id to update").option("--workspace <dir>", "Workspace directory used to locate the agent + IDENTITY.md").option("--identity-file <path>", "Explicit IDENTITY.md path to read").option("--from-identity", "Read values from IDENTITY.md", false).option("--name <name>", "Identity name").option("--theme <theme>", "Identity theme").option("--emoji <emoji>", "Identity emoji").option("--avatar <value>", "Identity avatar (workspace path, http(s) URL, or data URI)").option("--json", "Output JSON summary", false).addHelpText("after", () => `
${theme.heading("Examples:")}
${formatHelpExamples([
		["openclaw agents set-identity --agent main --name \"OpenClaw\" --emoji \"🦞\"", "Set name + emoji."],
		["openclaw agents set-identity --agent main --avatar avatars/openclaw.png", "Set avatar path."],
		["openclaw agents set-identity --workspace ~/.openclaw/workspace --from-identity", "Load from IDENTITY.md."],
		["openclaw agents set-identity --identity-file ~/.openclaw/workspace/IDENTITY.md --agent main", "Use a specific IDENTITY.md."]
	])}
`).action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await agentsSetIdentityCommand({
				agent: opts.agent,
				workspace: opts.workspace,
				identityFile: opts.identityFile,
				fromIdentity: Boolean(opts.fromIdentity),
				name: opts.name,
				theme: opts.theme,
				emoji: opts.emoji,
				avatar: opts.avatar,
				json: Boolean(opts.json)
			}, defaultRuntime);
		});
	});
	agents.command("delete <id>").description("Delete an agent and prune workspace/state").option("--force", "Skip confirmation", false).option("--json", "Output JSON summary", false).action(async (id, opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await agentsDeleteCommand({
				id: String(id),
				force: Boolean(opts.force),
				json: Boolean(opts.json)
			}, defaultRuntime);
		});
	});
	agents.action(async () => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await agentsListCommand({}, defaultRuntime);
		});
	});
}

//#endregion
//#region src/cli/program/register.configure.ts
function registerConfigureCommand(program) {
	program.command("configure").description("Interactive prompt to set up credentials, devices, and agent defaults").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/configure", "docs.openclaw.ai/cli/configure")}\n`).option("--section <section>", `Configuration sections (repeatable). Options: ${CONFIGURE_WIZARD_SECTIONS.join(", ")}`, (value, previous) => [...previous, value], []).action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const sections = Array.isArray(opts.section) ? opts.section.map((value) => typeof value === "string" ? value.trim() : "").filter(Boolean) : [];
			if (sections.length === 0) {
				await configureCommand(defaultRuntime);
				return;
			}
			const invalid = sections.filter((s) => !CONFIGURE_WIZARD_SECTIONS.includes(s));
			if (invalid.length > 0) {
				defaultRuntime.error(`Invalid --section: ${invalid.join(", ")}. Expected one of: ${CONFIGURE_WIZARD_SECTIONS.join(", ")}.`);
				defaultRuntime.exit(1);
				return;
			}
			await configureCommandWithSections(sections, defaultRuntime);
		});
	});
}

//#endregion
//#region src/commands/dashboard.ts
async function dashboardCommand(runtime = defaultRuntime, options = {}) {
	const snapshot = await readConfigFileSnapshot();
	const cfg = snapshot.valid ? snapshot.config : {};
	const port = resolveGatewayPort(cfg);
	const bind = cfg.gateway?.bind ?? "loopback";
	const basePath = cfg.gateway?.controlUi?.basePath;
	const customBindHost = cfg.gateway?.customBindHost;
	const token = cfg.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN ?? "";
	const links = resolveControlUiLinks({
		port,
		bind,
		customBindHost,
		basePath
	});
	const dashboardUrl = token ? `${links.httpUrl}#token=${encodeURIComponent(token)}` : links.httpUrl;
	runtime.log(`Dashboard URL: ${dashboardUrl}`);
	const copied = await copyToClipboard(dashboardUrl).catch(() => false);
	runtime.log(copied ? "Copied to clipboard." : "Copy to clipboard unavailable.");
	let opened = false;
	let hint;
	if (!options.noOpen) {
		if ((await detectBrowserOpenSupport()).ok) opened = await openUrl(dashboardUrl);
		if (!opened) hint = formatControlUiSshHint({
			port,
			basePath,
			token: token || void 0
		});
	} else hint = "Browser launch disabled (--no-open). Use the URL above.";
	if (opened) runtime.log("Opened in your browser. Keep that tab to control OpenClaw.");
	else if (hint) runtime.log(hint);
}

//#endregion
//#region src/commands/cleanup-utils.ts
function collectWorkspaceDirs(cfg) {
	const dirs = /* @__PURE__ */ new Set();
	const defaults = cfg?.agents?.defaults;
	if (typeof defaults?.workspace === "string" && defaults.workspace.trim()) dirs.add(resolveUserPath(defaults.workspace));
	const list = Array.isArray(cfg?.agents?.list) ? cfg?.agents?.list : [];
	for (const agent of list) {
		const workspace = agent.workspace;
		if (typeof workspace === "string" && workspace.trim()) dirs.add(resolveUserPath(workspace));
	}
	if (dirs.size === 0) dirs.add(resolveDefaultAgentWorkspaceDir());
	return [...dirs];
}
function isPathWithin(child, parent) {
	const relative = path.relative(parent, child);
	return relative === "" || !relative.startsWith("..") && !path.isAbsolute(relative);
}
function isUnsafeRemovalTarget(target) {
	if (!target.trim()) return true;
	const resolved = path.resolve(target);
	if (resolved === path.parse(resolved).root) return true;
	const home = resolveHomeDir();
	if (home && resolved === path.resolve(home)) return true;
	return false;
}
async function removePath(target, runtime, opts) {
	if (!target?.trim()) return {
		ok: false,
		skipped: true
	};
	const resolved = path.resolve(target);
	const displayLabel = shortenHomeInString(opts?.label ?? resolved);
	if (isUnsafeRemovalTarget(resolved)) {
		runtime.error(`Refusing to remove unsafe path: ${displayLabel}`);
		return { ok: false };
	}
	if (opts?.dryRun) {
		runtime.log(`[dry-run] remove ${displayLabel}`);
		return {
			ok: true,
			skipped: true
		};
	}
	try {
		await fsPromises.rm(resolved, {
			recursive: true,
			force: true
		});
		runtime.log(`Removed ${displayLabel}`);
		return { ok: true };
	} catch (err) {
		runtime.error(`Failed to remove ${displayLabel}: ${String(err)}`);
		return { ok: false };
	}
}
async function listAgentSessionDirs(stateDir) {
	const root = path.join(stateDir, "agents");
	try {
		return (await fsPromises.readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => path.join(root, entry.name, "sessions"));
	} catch {
		return [];
	}
}

//#endregion
//#region src/commands/reset.ts
const selectStyled = (params) => select({
	...params,
	message: stylePromptMessage(params.message),
	options: params.options.map((opt) => opt.hint === void 0 ? opt : {
		...opt,
		hint: stylePromptHint(opt.hint)
	})
});
async function stopGatewayIfRunning(runtime) {
	if (isNixMode) return;
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch (err) {
		runtime.error(`Gateway service check failed: ${String(err)}`);
		return;
	}
	if (!loaded) return;
	try {
		await service.stop({
			env: process.env,
			stdout: process.stdout
		});
	} catch (err) {
		runtime.error(`Gateway stop failed: ${String(err)}`);
	}
}
async function resetCommand(runtime, opts) {
	const interactive = !opts.nonInteractive;
	if (!interactive && !opts.yes) {
		runtime.error("Non-interactive mode requires --yes.");
		runtime.exit(1);
		return;
	}
	let scope = opts.scope;
	if (!scope) {
		if (!interactive) {
			runtime.error("Non-interactive mode requires --scope.");
			runtime.exit(1);
			return;
		}
		const selection = await selectStyled({
			message: "Reset scope",
			options: [
				{
					value: "config",
					label: "Config only",
					hint: "openclaw.json"
				},
				{
					value: "config+creds+sessions",
					label: "Config + credentials + sessions",
					hint: "keeps workspace + auth profiles"
				},
				{
					value: "full",
					label: "Full reset",
					hint: "state dir + workspace"
				}
			],
			initialValue: "config+creds+sessions"
		});
		if (isCancel(selection)) {
			cancel(stylePromptTitle("Reset cancelled.") ?? "Reset cancelled.");
			runtime.exit(0);
			return;
		}
		scope = selection;
	}
	if (![
		"config",
		"config+creds+sessions",
		"full"
	].includes(scope)) {
		runtime.error("Invalid --scope. Expected \"config\", \"config+creds+sessions\", or \"full\".");
		runtime.exit(1);
		return;
	}
	if (interactive && !opts.yes) {
		const ok = await confirm({ message: stylePromptMessage(`Proceed with ${scope} reset?`) });
		if (isCancel(ok) || !ok) {
			cancel(stylePromptTitle("Reset cancelled.") ?? "Reset cancelled.");
			runtime.exit(0);
			return;
		}
	}
	const dryRun = Boolean(opts.dryRun);
	const cfg = loadConfig();
	const stateDir = resolveStateDir();
	const configPath = resolveConfigPath();
	const oauthDir = resolveOAuthDir();
	const configInsideState = isPathWithin(configPath, stateDir);
	const oauthInsideState = isPathWithin(oauthDir, stateDir);
	const workspaceDirs = collectWorkspaceDirs(cfg);
	if (scope !== "config") if (dryRun) runtime.log("[dry-run] stop gateway service");
	else await stopGatewayIfRunning(runtime);
	if (scope === "config") {
		await removePath(configPath, runtime, {
			dryRun,
			label: configPath
		});
		return;
	}
	if (scope === "config+creds+sessions") {
		await removePath(configPath, runtime, {
			dryRun,
			label: configPath
		});
		await removePath(oauthDir, runtime, {
			dryRun,
			label: oauthDir
		});
		const sessionDirs = await listAgentSessionDirs(stateDir);
		for (const dir of sessionDirs) await removePath(dir, runtime, {
			dryRun,
			label: dir
		});
		runtime.log(`Next: ${formatCliCommand("openclaw onboard --install-daemon")}`);
		return;
	}
	if (scope === "full") {
		await removePath(stateDir, runtime, {
			dryRun,
			label: stateDir
		});
		if (!configInsideState) await removePath(configPath, runtime, {
			dryRun,
			label: configPath
		});
		if (!oauthInsideState) await removePath(oauthDir, runtime, {
			dryRun,
			label: oauthDir
		});
		for (const workspace of workspaceDirs) await removePath(workspace, runtime, {
			dryRun,
			label: workspace
		});
		runtime.log(`Next: ${formatCliCommand("openclaw onboard --install-daemon")}`);
		return;
	}
}

//#endregion
//#region src/commands/uninstall.ts
const multiselectStyled = (params) => multiselect({
	...params,
	message: stylePromptMessage(params.message),
	options: params.options.map((opt) => opt.hint === void 0 ? opt : {
		...opt,
		hint: stylePromptHint(opt.hint)
	})
});
function buildScopeSelection(opts) {
	const hadExplicit = Boolean(opts.all || opts.service || opts.state || opts.workspace || opts.app);
	const scopes = /* @__PURE__ */ new Set();
	if (opts.all || opts.service) scopes.add("service");
	if (opts.all || opts.state) scopes.add("state");
	if (opts.all || opts.workspace) scopes.add("workspace");
	if (opts.all || opts.app) scopes.add("app");
	return {
		scopes,
		hadExplicit
	};
}
async function stopAndUninstallService(runtime) {
	if (isNixMode) {
		runtime.error("Nix mode detected; service uninstall is disabled.");
		return false;
	}
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch (err) {
		runtime.error(`Gateway service check failed: ${String(err)}`);
		return false;
	}
	if (!loaded) {
		runtime.log(`Gateway service ${service.notLoadedText}.`);
		return true;
	}
	try {
		await service.stop({
			env: process.env,
			stdout: process.stdout
		});
	} catch (err) {
		runtime.error(`Gateway stop failed: ${String(err)}`);
	}
	try {
		await service.uninstall({
			env: process.env,
			stdout: process.stdout
		});
		return true;
	} catch (err) {
		runtime.error(`Gateway uninstall failed: ${String(err)}`);
		return false;
	}
}
async function removeMacApp(runtime, dryRun) {
	if (process.platform !== "darwin") return;
	await removePath("/Applications/OpenClaw.app", runtime, {
		dryRun,
		label: "/Applications/OpenClaw.app"
	});
}
async function uninstallCommand(runtime, opts) {
	const { scopes, hadExplicit } = buildScopeSelection(opts);
	const interactive = !opts.nonInteractive;
	if (!interactive && !opts.yes) {
		runtime.error("Non-interactive mode requires --yes.");
		runtime.exit(1);
		return;
	}
	if (!hadExplicit) {
		if (!interactive) {
			runtime.error("Non-interactive mode requires explicit scopes (use --all).");
			runtime.exit(1);
			return;
		}
		const selection = await multiselectStyled({
			message: "Uninstall which components?",
			options: [
				{
					value: "service",
					label: "Gateway service",
					hint: "launchd / systemd / schtasks"
				},
				{
					value: "state",
					label: "State + config",
					hint: "~/.openclaw"
				},
				{
					value: "workspace",
					label: "Workspace",
					hint: "agent files"
				},
				{
					value: "app",
					label: "macOS app",
					hint: "/Applications/OpenClaw.app"
				}
			],
			initialValues: [
				"service",
				"state",
				"workspace"
			]
		});
		if (isCancel(selection)) {
			cancel(stylePromptTitle("Uninstall cancelled.") ?? "Uninstall cancelled.");
			runtime.exit(0);
			return;
		}
		for (const value of selection) scopes.add(value);
	}
	if (scopes.size === 0) {
		runtime.log("Nothing selected.");
		return;
	}
	if (interactive && !opts.yes) {
		const ok = await confirm({ message: stylePromptMessage("Proceed with uninstall?") });
		if (isCancel(ok) || !ok) {
			cancel(stylePromptTitle("Uninstall cancelled.") ?? "Uninstall cancelled.");
			runtime.exit(0);
			return;
		}
	}
	const dryRun = Boolean(opts.dryRun);
	const cfg = loadConfig();
	const stateDir = resolveStateDir();
	const configPath = resolveConfigPath();
	const oauthDir = resolveOAuthDir();
	const configInsideState = isPathWithin(configPath, stateDir);
	const oauthInsideState = isPathWithin(oauthDir, stateDir);
	const workspaceDirs = collectWorkspaceDirs(cfg);
	if (scopes.has("service")) if (dryRun) runtime.log("[dry-run] remove gateway service");
	else await stopAndUninstallService(runtime);
	if (scopes.has("state")) {
		await removePath(stateDir, runtime, {
			dryRun,
			label: stateDir
		});
		if (!configInsideState) await removePath(configPath, runtime, {
			dryRun,
			label: configPath
		});
		if (!oauthInsideState) await removePath(oauthDir, runtime, {
			dryRun,
			label: oauthDir
		});
	}
	if (scopes.has("workspace")) for (const workspace of workspaceDirs) await removePath(workspace, runtime, {
		dryRun,
		label: workspace
	});
	if (scopes.has("app")) await removeMacApp(runtime, dryRun);
	runtime.log("CLI still installed. Remove via npm/pnpm if desired.");
	if (scopes.has("state") && !scopes.has("workspace")) {
		const home = resolveHomeDir();
		if (home && workspaceDirs.some((dir) => dir.startsWith(path.resolve(home)))) runtime.log("Tip: workspaces were preserved. Re-run with --workspace to remove them.");
	}
}

//#endregion
//#region src/cli/program/register.maintenance.ts
function registerMaintenanceCommands(program) {
	program.command("doctor").description("Health checks + quick fixes for the gateway and channels").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/doctor", "docs.openclaw.ai/cli/doctor")}\n`).option("--no-workspace-suggestions", "Disable workspace memory system suggestions", false).option("--yes", "Accept defaults without prompting", false).option("--repair", "Apply recommended repairs without prompting", false).option("--fix", "Apply recommended repairs (alias for --repair)", false).option("--force", "Apply aggressive repairs (overwrites custom service config)", false).option("--non-interactive", "Run without prompts (safe migrations only)", false).option("--generate-gateway-token", "Generate and configure a gateway token", false).option("--deep", "Scan system services for extra gateway installs", false).action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await doctorCommand(defaultRuntime, {
				workspaceSuggestions: opts.workspaceSuggestions,
				yes: Boolean(opts.yes),
				repair: Boolean(opts.repair) || Boolean(opts.fix),
				force: Boolean(opts.force),
				nonInteractive: Boolean(opts.nonInteractive),
				generateGatewayToken: Boolean(opts.generateGatewayToken),
				deep: Boolean(opts.deep)
			});
		});
	});
	program.command("dashboard").description("Open the Control UI with your current token").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/dashboard", "docs.openclaw.ai/cli/dashboard")}\n`).option("--no-open", "Print URL but do not launch a browser", false).action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await dashboardCommand(defaultRuntime, { noOpen: Boolean(opts.noOpen) });
		});
	});
	program.command("reset").description("Reset local config/state (keeps the CLI installed)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/reset", "docs.openclaw.ai/cli/reset")}\n`).option("--scope <scope>", "config|config+creds+sessions|full (default: interactive prompt)").option("--yes", "Skip confirmation prompts", false).option("--non-interactive", "Disable prompts (requires --scope + --yes)", false).option("--dry-run", "Print actions without removing files", false).action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await resetCommand(defaultRuntime, {
				scope: opts.scope,
				yes: Boolean(opts.yes),
				nonInteractive: Boolean(opts.nonInteractive),
				dryRun: Boolean(opts.dryRun)
			});
		});
	});
	program.command("uninstall").description("Uninstall the gateway service + local data (CLI remains)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/uninstall", "docs.openclaw.ai/cli/uninstall")}\n`).option("--service", "Remove the gateway service", false).option("--state", "Remove state + config", false).option("--workspace", "Remove workspace dirs", false).option("--app", "Remove the macOS app", false).option("--all", "Remove service + state + workspace + app", false).option("--yes", "Skip confirmation prompts", false).option("--non-interactive", "Disable prompts (requires --yes)", false).option("--dry-run", "Print actions without removing files", false).action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await uninstallCommand(defaultRuntime, {
				service: Boolean(opts.service),
				state: Boolean(opts.state),
				workspace: Boolean(opts.workspace),
				app: Boolean(opts.app),
				all: Boolean(opts.all),
				yes: Boolean(opts.yes),
				nonInteractive: Boolean(opts.nonInteractive),
				dryRun: Boolean(opts.dryRun)
			});
		});
	});
}

//#endregion
//#region src/infra/outbound/format.ts
const resolveChannelLabel$1 = (channel) => {
	const pluginLabel = getChannelPlugin(channel)?.meta.label;
	if (pluginLabel) return pluginLabel;
	const normalized = normalizeChatChannelId(channel);
	if (normalized) return getChatChannelMeta(normalized).label;
	return channel;
};
function formatOutboundDeliverySummary(channel, result) {
	if (!result) return `✅ Sent via ${resolveChannelLabel$1(channel)}. Message ID: unknown`;
	const base = `✅ Sent via ${resolveChannelLabel$1(result.channel)}. Message ID: ${result.messageId}`;
	if ("chatId" in result) return `${base} (chat ${result.chatId})`;
	if ("channelId" in result) return `${base} (channel ${result.channelId})`;
	if ("roomId" in result) return `${base} (room ${result.roomId})`;
	if ("conversationId" in result) return `${base} (conversation ${result.conversationId})`;
	return base;
}
function formatGatewaySummary(params) {
	return `✅ ${params.action ?? "Sent"} via gateway${params.channel ? ` (${params.channel})` : ""}. Message ID: ${params.messageId ?? "unknown"}`;
}

//#endregion
//#region src/commands/message-format.ts
const shortenText = (value, maxLen) => {
	const chars = Array.from(value);
	if (chars.length <= maxLen) return value;
	return `${chars.slice(0, Math.max(0, maxLen - 1)).join("")}…`;
};
const resolveChannelLabel = (channel) => getChannelPlugin(channel)?.meta.label ?? channel;
function extractMessageId(payload) {
	if (!payload || typeof payload !== "object") return null;
	const direct = payload.messageId;
	if (typeof direct === "string" && direct.trim()) return direct.trim();
	const result = payload.result;
	if (result && typeof result === "object") {
		const nested = result.messageId;
		if (typeof nested === "string" && nested.trim()) return nested.trim();
	}
	return null;
}
function buildMessageCliJson(result) {
	return {
		action: result.action,
		channel: result.channel,
		dryRun: result.dryRun,
		handledBy: result.handledBy,
		payload: result.payload
	};
}
function renderObjectSummary(payload, opts) {
	if (!payload || typeof payload !== "object") return [String(payload)];
	const obj = payload;
	const keys = Object.keys(obj);
	if (keys.length === 0) return [theme.muted("(empty)")];
	const rows = keys.slice(0, 20).map((k) => {
		const v = obj[k];
		return {
			Key: k,
			Value: shortenText(v == null ? "null" : Array.isArray(v) ? `${v.length} items` : typeof v === "object" ? "object" : typeof v === "string" ? v : typeof v === "number" ? String(v) : typeof v === "boolean" ? v ? "true" : "false" : typeof v === "bigint" ? v.toString() : typeof v === "symbol" ? v.toString() : typeof v === "function" ? "function" : "unknown", 96)
		};
	});
	return [renderTable({
		width: opts.width,
		columns: [{
			key: "Key",
			header: "Key",
			minWidth: 16
		}, {
			key: "Value",
			header: "Value",
			flex: true,
			minWidth: 24
		}],
		rows
	}).trimEnd()];
}
function renderMessageList(messages, opts, emptyLabel) {
	const rows = messages.slice(0, 25).map((m) => {
		const msg = m;
		const id = typeof msg.id === "string" && msg.id || typeof msg.ts === "string" && msg.ts || typeof msg.messageId === "string" && msg.messageId || "";
		const authorObj = msg.author;
		const author = typeof msg.authorTag === "string" && msg.authorTag || typeof authorObj?.username === "string" && authorObj.username || typeof msg.user === "string" && msg.user || "";
		const time = typeof msg.timestamp === "string" && msg.timestamp || typeof msg.ts === "string" && msg.ts || "";
		const text = typeof msg.content === "string" && msg.content || typeof msg.text === "string" && msg.text || "";
		return {
			Time: shortenText(time, 28),
			Author: shortenText(author, 22),
			Text: shortenText(text.replace(/\s+/g, " ").trim(), 90),
			Id: shortenText(id, 22)
		};
	});
	if (rows.length === 0) return [theme.muted(emptyLabel)];
	return [renderTable({
		width: opts.width,
		columns: [
			{
				key: "Time",
				header: "Time",
				minWidth: 14
			},
			{
				key: "Author",
				header: "Author",
				minWidth: 10
			},
			{
				key: "Text",
				header: "Text",
				flex: true,
				minWidth: 24
			},
			{
				key: "Id",
				header: "Id",
				minWidth: 10
			}
		],
		rows
	}).trimEnd()];
}
function renderMessagesFromPayload(payload, opts) {
	if (!payload || typeof payload !== "object") return null;
	const messages = payload.messages;
	if (!Array.isArray(messages)) return null;
	return renderMessageList(messages, opts, "No messages.");
}
function renderPinsFromPayload(payload, opts) {
	if (!payload || typeof payload !== "object") return null;
	const pins = payload.pins;
	if (!Array.isArray(pins)) return null;
	return renderMessageList(pins, opts, "No pins.");
}
function extractDiscordSearchResultsMessages(results) {
	if (!results || typeof results !== "object") return null;
	const raw = results.messages;
	if (!Array.isArray(raw)) return null;
	const flattened = [];
	for (const entry of raw) if (Array.isArray(entry) && entry.length > 0) flattened.push(entry[0]);
	else if (entry && typeof entry === "object") flattened.push(entry);
	return flattened.length ? flattened : null;
}
function renderReactions(payload, opts) {
	if (!payload || typeof payload !== "object") return null;
	const reactions = payload.reactions;
	if (!Array.isArray(reactions)) return null;
	const rows = reactions.slice(0, 50).map((r) => {
		const entry = r;
		const emojiObj = entry.emoji;
		return {
			Emoji: typeof emojiObj?.raw === "string" && emojiObj.raw || typeof entry.name === "string" && entry.name || typeof entry.emoji === "string" && entry.emoji || "",
			Count: typeof entry.count === "number" ? String(entry.count) : "",
			Users: shortenText((Array.isArray(entry.users) ? entry.users.slice(0, 8).map((u) => {
				if (typeof u === "string") return u;
				if (!u || typeof u !== "object") return "";
				const user = u;
				return typeof user.tag === "string" && user.tag || typeof user.username === "string" && user.username || typeof user.id === "string" && user.id || "";
			}).filter(Boolean) : []).join(", "), 72)
		};
	});
	if (rows.length === 0) return [theme.muted("No reactions.")];
	return [renderTable({
		width: opts.width,
		columns: [
			{
				key: "Emoji",
				header: "Emoji",
				minWidth: 8
			},
			{
				key: "Count",
				header: "Count",
				align: "right",
				minWidth: 6
			},
			{
				key: "Users",
				header: "Users",
				flex: true,
				minWidth: 20
			}
		],
		rows
	}).trimEnd()];
}
function formatMessageCliText(result) {
	const rich = isRich();
	const ok = (text) => rich ? theme.success(text) : text;
	const muted = (text) => rich ? theme.muted(text) : text;
	const heading = (text) => rich ? theme.heading(text) : text;
	const opts = { width: Math.max(60, (process.stdout.columns ?? 120) - 1) };
	if (result.handledBy === "dry-run") return [muted(`[dry-run] would run ${result.action} via ${result.channel}`)];
	if (result.kind === "broadcast") {
		const results = result.payload.results ?? [];
		const rows = results.map((entry) => ({
			Channel: resolveChannelLabel(entry.channel),
			Target: shortenText(formatTargetDisplay({
				channel: entry.channel,
				target: entry.to
			}), 36),
			Status: entry.ok ? "ok" : "error",
			Error: entry.ok ? "" : shortenText(entry.error ?? "unknown error", 48)
		}));
		const okCount = results.filter((entry) => entry.ok).length;
		const total = results.length;
		return [ok(`✅ Broadcast complete (${okCount}/${total} succeeded, ${total - okCount} failed)`), renderTable({
			width: opts.width,
			columns: [
				{
					key: "Channel",
					header: "Channel",
					minWidth: 10
				},
				{
					key: "Target",
					header: "Target",
					minWidth: 12,
					flex: true
				},
				{
					key: "Status",
					header: "Status",
					minWidth: 6
				},
				{
					key: "Error",
					header: "Error",
					minWidth: 20,
					flex: true
				}
			],
			rows: rows.slice(0, 50)
		}).trimEnd()];
	}
	if (result.kind === "send") {
		if (result.handledBy === "core" && result.sendResult) {
			const send = result.sendResult;
			if (send.via === "direct") {
				const directResult = send.result;
				return [ok(formatOutboundDeliverySummary(send.channel, directResult))];
			}
			const gatewayResult = send.result;
			return [ok(formatGatewaySummary({
				channel: send.channel,
				messageId: gatewayResult?.messageId ?? null
			}))];
		}
		const label = resolveChannelLabel(result.channel);
		const msgId = extractMessageId(result.payload);
		return [ok(`✅ Sent via ${label}.${msgId ? ` Message ID: ${msgId}` : ""}`)];
	}
	if (result.kind === "poll") {
		if (result.handledBy === "core" && result.pollResult) {
			const poll = result.pollResult;
			const pollId = poll.result?.pollId;
			const msgId = poll.result?.messageId ?? null;
			const lines = [ok(formatGatewaySummary({
				action: "Poll sent",
				channel: poll.channel,
				messageId: msgId
			}))];
			if (pollId) lines.push(ok(`Poll id: ${pollId}`));
			return lines;
		}
		const label = resolveChannelLabel(result.channel);
		const msgId = extractMessageId(result.payload);
		return [ok(`✅ Poll sent via ${label}.${msgId ? ` Message ID: ${msgId}` : ""}`)];
	}
	const payload = result.payload;
	const lines = [];
	if (result.action === "react") {
		const added = payload.added;
		const removed = payload.removed;
		if (typeof added === "string" && added.trim()) {
			lines.push(ok(`✅ Reaction added: ${added.trim()}`));
			return lines;
		}
		if (typeof removed === "string" && removed.trim()) {
			lines.push(ok(`✅ Reaction removed: ${removed.trim()}`));
			return lines;
		}
		if (Array.isArray(removed)) {
			const list = removed.map((x) => String(x).trim()).filter(Boolean).join(", ");
			lines.push(ok(`✅ Reactions removed${list ? `: ${list}` : ""}`));
			return lines;
		}
		lines.push(ok("✅ Reaction updated."));
		return lines;
	}
	const reactionsTable = renderReactions(payload, opts);
	if (reactionsTable && result.action === "reactions") {
		lines.push(heading("Reactions"));
		lines.push(reactionsTable[0] ?? "");
		return lines;
	}
	if (result.action === "read") {
		const messagesTable = renderMessagesFromPayload(payload, opts);
		if (messagesTable) {
			lines.push(heading("Messages"));
			lines.push(messagesTable[0] ?? "");
			return lines;
		}
	}
	if (result.action === "list-pins") {
		const pinsTable = renderPinsFromPayload(payload, opts);
		if (pinsTable) {
			lines.push(heading("Pinned messages"));
			lines.push(pinsTable[0] ?? "");
			return lines;
		}
	}
	if (result.action === "search") {
		const results = payload.results;
		const list = extractDiscordSearchResultsMessages(results);
		if (list) {
			lines.push(heading("Search results"));
			lines.push(renderMessageList(list, opts, "No results.")[0] ?? "");
			return lines;
		}
	}
	lines.push(ok(`✅ ${result.action} via ${resolveChannelLabel(result.channel)}.`));
	const summary = renderObjectSummary(payload, opts);
	if (summary.length) {
		lines.push("");
		lines.push(...summary);
		lines.push("");
		lines.push(muted("Tip: use --json for full output."));
	}
	return lines;
}

//#endregion
//#region src/commands/message.ts
async function messageCommand(opts, deps, runtime) {
	const cfg = loadConfig();
	const actionInput = (typeof opts.action === "string" ? opts.action.trim() : "") || "send";
	const actionMatch = CHANNEL_MESSAGE_ACTION_NAMES.find((name) => name.toLowerCase() === actionInput.toLowerCase());
	if (!actionMatch) throw new Error(`Unknown message action: ${actionInput}`);
	const action = actionMatch;
	const outboundDeps = createOutboundSendDeps(deps);
	const run = async () => await runMessageAction({
		cfg,
		action,
		params: opts,
		deps: outboundDeps,
		gateway: {
			clientName: GATEWAY_CLIENT_NAMES.CLI,
			mode: GATEWAY_CLIENT_MODES.CLI
		}
	});
	const json = opts.json === true;
	const dryRun = opts.dryRun === true;
	const result = !json && !dryRun && (action === "send" || action === "poll") ? await withProgress({
		label: action === "poll" ? "Sending poll..." : "Sending...",
		indeterminate: true,
		enabled: true
	}, run) : await run();
	if (json) {
		runtime.log(JSON.stringify(buildMessageCliJson(result), null, 2));
		return;
	}
	for (const line of formatMessageCliText(result)) runtime.log(line);
}

//#endregion
//#region src/cli/program/message/helpers.ts
function createMessageCliHelpers(message, messageChannelOptions) {
	const withMessageBase = (command) => command.option("--channel <channel>", `Channel: ${messageChannelOptions}`).option("--account <id>", "Channel account id (accountId)").option("--json", "Output result as JSON", false).option("--dry-run", "Print payload and skip sending", false).option("--verbose", "Verbose logging", false);
	const withMessageTarget = (command) => command.option("-t, --target <dest>", CHANNEL_TARGET_DESCRIPTION);
	const withRequiredMessageTarget = (command) => command.requiredOption("-t, --target <dest>", CHANNEL_TARGET_DESCRIPTION);
	const runMessageAction = async (action, opts) => {
		setVerbose(Boolean(opts.verbose));
		ensurePluginRegistryLoaded();
		const deps = createDefaultDeps();
		await runCommandWithRuntime(defaultRuntime, async () => {
			await messageCommand({
				...(() => {
					const { account, ...rest } = opts;
					return {
						...rest,
						accountId: typeof account === "string" ? account : void 0
					};
				})(),
				action
			}, deps, defaultRuntime);
		}, (err) => {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		});
	};
	return {
		withMessageBase,
		withMessageTarget,
		withRequiredMessageTarget,
		runMessageAction
	};
}

//#endregion
//#region src/cli/program/message/register.broadcast.ts
function registerMessageBroadcastCommand(message, helpers) {
	helpers.withMessageBase(message.command("broadcast").description("Broadcast a message to multiple targets")).requiredOption("--targets <target...>", CHANNEL_TARGETS_DESCRIPTION).option("--message <text>", "Message to send").option("--media <url>", "Media URL").action(async (options) => {
		await helpers.runMessageAction("broadcast", options);
	});
}

//#endregion
//#region src/cli/program/message/register.discord-admin.ts
function registerMessageDiscordAdminCommands(message, helpers) {
	const role = message.command("role").description("Role actions");
	helpers.withMessageBase(role.command("info").description("List roles").requiredOption("--guild-id <id>", "Guild id")).action(async (opts) => {
		await helpers.runMessageAction("role-info", opts);
	});
	helpers.withMessageBase(role.command("add").description("Add role to a member").requiredOption("--guild-id <id>", "Guild id").requiredOption("--user-id <id>", "User id").requiredOption("--role-id <id>", "Role id")).action(async (opts) => {
		await helpers.runMessageAction("role-add", opts);
	});
	helpers.withMessageBase(role.command("remove").description("Remove role from a member").requiredOption("--guild-id <id>", "Guild id").requiredOption("--user-id <id>", "User id").requiredOption("--role-id <id>", "Role id")).action(async (opts) => {
		await helpers.runMessageAction("role-remove", opts);
	});
	const channel = message.command("channel").description("Channel actions");
	helpers.withMessageBase(helpers.withRequiredMessageTarget(channel.command("info").description("Fetch channel info"))).action(async (opts) => {
		await helpers.runMessageAction("channel-info", opts);
	});
	helpers.withMessageBase(channel.command("list").description("List channels").requiredOption("--guild-id <id>", "Guild id")).action(async (opts) => {
		await helpers.runMessageAction("channel-list", opts);
	});
	const member = message.command("member").description("Member actions");
	helpers.withMessageBase(member.command("info").description("Fetch member info").requiredOption("--user-id <id>", "User id")).option("--guild-id <id>", "Guild id (Discord)").action(async (opts) => {
		await helpers.runMessageAction("member-info", opts);
	});
	const voice = message.command("voice").description("Voice actions");
	helpers.withMessageBase(voice.command("status").description("Fetch voice status").requiredOption("--guild-id <id>", "Guild id").requiredOption("--user-id <id>", "User id")).action(async (opts) => {
		await helpers.runMessageAction("voice-status", opts);
	});
	const event = message.command("event").description("Event actions");
	helpers.withMessageBase(event.command("list").description("List scheduled events").requiredOption("--guild-id <id>", "Guild id")).action(async (opts) => {
		await helpers.runMessageAction("event-list", opts);
	});
	helpers.withMessageBase(event.command("create").description("Create a scheduled event").requiredOption("--guild-id <id>", "Guild id").requiredOption("--event-name <name>", "Event name").requiredOption("--start-time <iso>", "Event start time")).option("--end-time <iso>", "Event end time").option("--desc <text>", "Event description").option("--channel-id <id>", "Channel id").option("--location <text>", "Event location").option("--event-type <stage|external|voice>", "Event type").action(async (opts) => {
		await helpers.runMessageAction("event-create", opts);
	});
	helpers.withMessageBase(message.command("timeout").description("Timeout a member").requiredOption("--guild-id <id>", "Guild id").requiredOption("--user-id <id>", "User id")).option("--duration-min <n>", "Timeout duration minutes").option("--until <iso>", "Timeout until").option("--reason <text>", "Moderation reason").action(async (opts) => {
		await helpers.runMessageAction("timeout", opts);
	});
	helpers.withMessageBase(message.command("kick").description("Kick a member").requiredOption("--guild-id <id>", "Guild id").requiredOption("--user-id <id>", "User id")).option("--reason <text>", "Moderation reason").action(async (opts) => {
		await helpers.runMessageAction("kick", opts);
	});
	helpers.withMessageBase(message.command("ban").description("Ban a member").requiredOption("--guild-id <id>", "Guild id").requiredOption("--user-id <id>", "User id")).option("--reason <text>", "Moderation reason").option("--delete-days <n>", "Ban delete message days").action(async (opts) => {
		await helpers.runMessageAction("ban", opts);
	});
}

//#endregion
//#region src/cli/program/message/register.emoji-sticker.ts
function registerMessageEmojiCommands(message, helpers) {
	const emoji = message.command("emoji").description("Emoji actions");
	helpers.withMessageBase(emoji.command("list").description("List emojis")).option("--guild-id <id>", "Guild id (Discord)").action(async (opts) => {
		await helpers.runMessageAction("emoji-list", opts);
	});
	helpers.withMessageBase(emoji.command("upload").description("Upload an emoji").requiredOption("--guild-id <id>", "Guild id")).requiredOption("--emoji-name <name>", "Emoji name").requiredOption("--media <path-or-url>", "Emoji media (path or URL)").option("--role-ids <id>", "Role id (repeat)", collectOption, []).action(async (opts) => {
		await helpers.runMessageAction("emoji-upload", opts);
	});
}
function registerMessageStickerCommands(message, helpers) {
	const sticker = message.command("sticker").description("Sticker actions");
	helpers.withMessageBase(helpers.withRequiredMessageTarget(sticker.command("send").description("Send stickers"))).requiredOption("--sticker-id <id>", "Sticker id (repeat)", collectOption).option("-m, --message <text>", "Optional message body").action(async (opts) => {
		await helpers.runMessageAction("sticker", opts);
	});
	helpers.withMessageBase(sticker.command("upload").description("Upload a sticker").requiredOption("--guild-id <id>", "Guild id")).requiredOption("--sticker-name <name>", "Sticker name").requiredOption("--sticker-desc <text>", "Sticker description").requiredOption("--sticker-tags <tags>", "Sticker tags").requiredOption("--media <path-or-url>", "Sticker media (path or URL)").action(async (opts) => {
		await helpers.runMessageAction("sticker-upload", opts);
	});
}

//#endregion
//#region src/cli/program/message/register.permissions-search.ts
function registerMessagePermissionsCommand(message, helpers) {
	helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("permissions").description("Fetch channel permissions"))).action(async (opts) => {
		await helpers.runMessageAction("permissions", opts);
	});
}
function registerMessageSearchCommand(message, helpers) {
	helpers.withMessageBase(message.command("search").description("Search Discord messages")).requiredOption("--guild-id <id>", "Guild id").requiredOption("--query <text>", "Search query").option("--channel-id <id>", "Channel id").option("--channel-ids <id>", "Channel id (repeat)", collectOption, []).option("--author-id <id>", "Author id").option("--author-ids <id>", "Author id (repeat)", collectOption, []).option("--limit <n>", "Result limit").action(async (opts) => {
		await helpers.runMessageAction("search", opts);
	});
}

//#endregion
//#region src/cli/program/message/register.pins.ts
function registerMessagePinCommands(message, helpers) {
	helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("pin").description("Pin a message"))).requiredOption("--message-id <id>", "Message id").action(async (opts) => {
		await helpers.runMessageAction("pin", opts);
	}), helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("unpin").description("Unpin a message"))).requiredOption("--message-id <id>", "Message id").action(async (opts) => {
		await helpers.runMessageAction("unpin", opts);
	}), helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("pins").description("List pinned messages"))).option("--limit <n>", "Result limit").action(async (opts) => {
		await helpers.runMessageAction("list-pins", opts);
	});
}

//#endregion
//#region src/cli/program/message/register.poll.ts
function registerMessagePollCommand(message, helpers) {
	helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("poll").description("Send a poll"))).requiredOption("--poll-question <text>", "Poll question").option("--poll-option <choice>", "Poll option (repeat 2-12 times)", collectOption, []).option("--poll-multi", "Allow multiple selections", false).option("--poll-duration-hours <n>", "Poll duration (Discord)").option("-m, --message <text>", "Optional message body").action(async (opts) => {
		await helpers.runMessageAction("poll", opts);
	});
}

//#endregion
//#region src/cli/program/message/register.reactions.ts
function registerMessageReactionsCommands(message, helpers) {
	helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("react").description("Add or remove a reaction"))).requiredOption("--message-id <id>", "Message id").option("--emoji <emoji>", "Emoji for reactions").option("--remove", "Remove reaction", false).option("--participant <id>", "WhatsApp reaction participant").option("--from-me", "WhatsApp reaction fromMe", false).option("--target-author <id>", "Signal reaction target author (uuid or phone)").option("--target-author-uuid <uuid>", "Signal reaction target author uuid").action(async (opts) => {
		await helpers.runMessageAction("react", opts);
	});
	helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("reactions").description("List reactions on a message"))).requiredOption("--message-id <id>", "Message id").option("--limit <n>", "Result limit").action(async (opts) => {
		await helpers.runMessageAction("reactions", opts);
	});
}

//#endregion
//#region src/cli/program/message/register.read-edit-delete.ts
function registerMessageReadEditDeleteCommands(message, helpers) {
	helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("read").description("Read recent messages"))).option("--limit <n>", "Result limit").option("--before <id>", "Read/search before id").option("--after <id>", "Read/search after id").option("--around <id>", "Read around id").option("--include-thread", "Include thread replies (Discord)", false).action(async (opts) => {
		await helpers.runMessageAction("read", opts);
	});
	helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("edit").description("Edit a message").requiredOption("--message-id <id>", "Message id").requiredOption("-m, --message <text>", "Message body"))).option("--thread-id <id>", "Thread id (Telegram forum thread)").action(async (opts) => {
		await helpers.runMessageAction("edit", opts);
	});
	helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("delete").description("Delete a message").requiredOption("--message-id <id>", "Message id"))).action(async (opts) => {
		await helpers.runMessageAction("delete", opts);
	});
}

//#endregion
//#region src/cli/program/message/register.send.ts
function registerMessageSendCommand(message, helpers) {
	helpers.withMessageBase(helpers.withRequiredMessageTarget(message.command("send").description("Send a message").option("-m, --message <text>", "Message body (required unless --media is set)")).option("--media <path-or-url>", "Attach media (image/audio/video/document). Accepts local paths or URLs.").option("--buttons <json>", "Telegram inline keyboard buttons as JSON (array of button rows)").option("--card <json>", "Adaptive Card JSON object (when supported by the channel)").option("--reply-to <id>", "Reply-to message id").option("--thread-id <id>", "Thread id (Telegram forum thread)").option("--gif-playback", "Treat video media as GIF playback (WhatsApp only).", false).option("--silent", "Send message silently without notification (Telegram + Discord)", false)).action(async (opts) => {
		await helpers.runMessageAction("send", opts);
	});
}

//#endregion
//#region src/cli/program/message/register.thread.ts
function registerMessageThreadCommands(message, helpers) {
	const thread = message.command("thread").description("Thread actions");
	helpers.withMessageBase(helpers.withRequiredMessageTarget(thread.command("create").description("Create a thread").requiredOption("--thread-name <name>", "Thread name"))).option("--message-id <id>", "Message id (optional)").option("-m, --message <text>", "Initial thread message text").option("--auto-archive-min <n>", "Thread auto-archive minutes").action(async (opts) => {
		await helpers.runMessageAction("thread-create", opts);
	});
	helpers.withMessageBase(thread.command("list").description("List threads").requiredOption("--guild-id <id>", "Guild id")).option("--channel-id <id>", "Channel id").option("--include-archived", "Include archived threads", false).option("--before <id>", "Read/search before id").option("--limit <n>", "Result limit").action(async (opts) => {
		await helpers.runMessageAction("thread-list", opts);
	});
	helpers.withMessageBase(helpers.withRequiredMessageTarget(thread.command("reply").description("Reply in a thread").requiredOption("-m, --message <text>", "Message body"))).option("--media <path-or-url>", "Attach media (image/audio/video/document). Accepts local paths or URLs.").option("--reply-to <id>", "Reply-to message id").action(async (opts) => {
		await helpers.runMessageAction("thread-reply", opts);
	});
}

//#endregion
//#region src/cli/program/register.message.ts
function registerMessageCommands(program, ctx) {
	const message = program.command("message").description("Send messages and channel actions").addHelpText("after", () => `
${theme.heading("Examples:")}
${formatHelpExamples([
		["openclaw message send --target +15555550123 --message \"Hi\"", "Send a text message."],
		["openclaw message send --target +15555550123 --message \"Hi\" --media photo.jpg", "Send a message with media."],
		["openclaw message poll --channel discord --target channel:123 --poll-question \"Snack?\" --poll-option Pizza --poll-option Sushi", "Create a Discord poll."],
		["openclaw message react --channel discord --target 123 --message-id 456 --emoji \"✅\"", "React to a message."]
	])}

${theme.muted("Docs:")} ${formatDocsLink("/cli/message", "docs.openclaw.ai/cli/message")}`).action(() => {
		message.help({ error: true });
	});
	const helpers = createMessageCliHelpers(message, ctx.messageChannelOptions);
	registerMessageSendCommand(message, helpers);
	registerMessageBroadcastCommand(message, helpers);
	registerMessagePollCommand(message, helpers);
	registerMessageReactionsCommands(message, helpers);
	registerMessageReadEditDeleteCommands(message, helpers);
	registerMessagePinCommands(message, helpers);
	registerMessagePermissionsCommand(message, helpers);
	registerMessageSearchCommand(message, helpers);
	registerMessageThreadCommands(message, helpers);
	registerMessageEmojiCommands(message, helpers);
	registerMessageStickerCommands(message, helpers);
	registerMessageDiscordAdminCommands(message, helpers);
}

//#endregion
//#region src/commands/onboard-interactive.ts
async function runInteractiveOnboarding(opts, runtime = defaultRuntime) {
	const prompter = createClackPrompter();
	try {
		await runOnboardingWizard(opts, runtime, prompter);
	} catch (err) {
		if (err instanceof WizardCancelledError) {
			runtime.exit(1);
			return;
		}
		throw err;
	} finally {
		restoreTerminalState("onboarding finish");
	}
}

//#endregion
//#region src/commands/onboard-non-interactive/local/auth-choice-inference.ts
const AUTH_CHOICE_FLAG_MAP = [
	{
		flag: "anthropicApiKey",
		authChoice: "apiKey",
		label: "--anthropic-api-key"
	},
	{
		flag: "geminiApiKey",
		authChoice: "gemini-api-key",
		label: "--gemini-api-key"
	},
	{
		flag: "openaiApiKey",
		authChoice: "openai-api-key",
		label: "--openai-api-key"
	},
	{
		flag: "openrouterApiKey",
		authChoice: "openrouter-api-key",
		label: "--openrouter-api-key"
	},
	{
		flag: "aiGatewayApiKey",
		authChoice: "ai-gateway-api-key",
		label: "--ai-gateway-api-key"
	},
	{
		flag: "cloudflareAiGatewayApiKey",
		authChoice: "cloudflare-ai-gateway-api-key",
		label: "--cloudflare-ai-gateway-api-key"
	},
	{
		flag: "moonshotApiKey",
		authChoice: "moonshot-api-key",
		label: "--moonshot-api-key"
	},
	{
		flag: "kimiCodeApiKey",
		authChoice: "kimi-code-api-key",
		label: "--kimi-code-api-key"
	},
	{
		flag: "syntheticApiKey",
		authChoice: "synthetic-api-key",
		label: "--synthetic-api-key"
	},
	{
		flag: "veniceApiKey",
		authChoice: "venice-api-key",
		label: "--venice-api-key"
	},
	{
		flag: "togetherApiKey",
		authChoice: "together-api-key",
		label: "--together-api-key"
	},
	{
		flag: "zaiApiKey",
		authChoice: "zai-api-key",
		label: "--zai-api-key"
	},
	{
		flag: "xiaomiApiKey",
		authChoice: "xiaomi-api-key",
		label: "--xiaomi-api-key"
	},
	{
		flag: "xaiApiKey",
		authChoice: "xai-api-key",
		label: "--xai-api-key"
	},
	{
		flag: "minimaxApiKey",
		authChoice: "minimax-api",
		label: "--minimax-api-key"
	},
	{
		flag: "opencodeZenApiKey",
		authChoice: "opencode-zen",
		label: "--opencode-zen-api-key"
	},
	{
		flag: "huggingfaceApiKey",
		authChoice: "huggingface-api-key",
		label: "--huggingface-api-key"
	},
	{
		flag: "litellmApiKey",
		authChoice: "litellm-api-key",
		label: "--litellm-api-key"
	}
];
function hasStringValue(value) {
	return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}
function inferAuthChoiceFromFlags(opts) {
	const matches = AUTH_CHOICE_FLAG_MAP.filter(({ flag }) => hasStringValue(opts[flag]));
	if (hasStringValue(opts.customBaseUrl) || hasStringValue(opts.customModelId) || hasStringValue(opts.customApiKey)) matches.push({
		flag: "customBaseUrl",
		authChoice: "custom-api-key",
		label: "--custom-base-url/--custom-model-id/--custom-api-key"
	});
	return {
		choice: matches[0]?.authChoice,
		matches
	};
}

//#endregion
//#region src/commands/onboard-non-interactive/api-keys.ts
async function resolveApiKeyFromProfiles(params) {
	const store = ensureAuthProfileStore(params.agentDir);
	const order = resolveAuthProfileOrder({
		cfg: params.cfg,
		store,
		provider: params.provider
	});
	for (const profileId of order) {
		if (store.profiles[profileId]?.type !== "api_key") continue;
		const resolved = await resolveApiKeyForProfile({
			cfg: params.cfg,
			store,
			profileId,
			agentDir: params.agentDir
		});
		if (resolved?.apiKey) return resolved.apiKey;
	}
	return null;
}
async function resolveNonInteractiveApiKey(params) {
	const flagKey = normalizeOptionalSecretInput(params.flagValue);
	if (flagKey) return {
		key: flagKey,
		source: "flag"
	};
	const envResolved = resolveEnvApiKey(params.provider);
	if (envResolved?.apiKey) return {
		key: envResolved.apiKey,
		source: "env"
	};
	const explicitEnvVar = params.envVarName?.trim();
	if (explicitEnvVar) {
		const explicitEnvKey = normalizeOptionalSecretInput(process.env[explicitEnvVar]);
		if (explicitEnvKey) return {
			key: explicitEnvKey,
			source: "env"
		};
	}
	if (params.allowProfile ?? true) {
		const profileKey = await resolveApiKeyFromProfiles({
			provider: params.provider,
			cfg: params.cfg,
			agentDir: params.agentDir
		});
		if (profileKey) return {
			key: profileKey,
			source: "profile"
		};
	}
	if (params.required === false) return null;
	const profileHint = params.allowProfile === false ? "" : `, or existing ${params.provider} API-key profile`;
	params.runtime.error(`Missing ${params.flagName} (or ${params.envVar} in env${profileHint}).`);
	params.runtime.exit(1);
	return null;
}

//#endregion
//#region src/commands/onboard-non-interactive/local/auth-choice.ts
async function applyNonInteractiveAuthChoice(params) {
	const { authChoice, opts, runtime, baseConfig } = params;
	let nextConfig = params.nextConfig;
	if (authChoice === "claude-cli" || authChoice === "codex-cli") {
		runtime.error([`Auth choice "${authChoice}" is deprecated.`, "Use \"--auth-choice token\" (Anthropic setup-token) or \"--auth-choice openai-codex\"."].join("\n"));
		runtime.exit(1);
		return null;
	}
	if (authChoice === "setup-token") {
		runtime.error(["Auth choice \"setup-token\" requires interactive mode.", "Use \"--auth-choice token\" with --token and --token-provider anthropic."].join("\n"));
		runtime.exit(1);
		return null;
	}
	if (authChoice === "vllm") {
		runtime.error(["Auth choice \"vllm\" requires interactive mode.", "Use interactive onboard/configure to enter base URL, API key, and model ID."].join("\n"));
		runtime.exit(1);
		return null;
	}
	if (authChoice === "apiKey") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "anthropic",
			cfg: baseConfig,
			flagValue: opts.anthropicApiKey,
			flagName: "--anthropic-api-key",
			envVar: "ANTHROPIC_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setAnthropicApiKey(resolved.key);
		return applyAuthProfileConfig(nextConfig, {
			profileId: "anthropic:default",
			provider: "anthropic",
			mode: "api_key"
		});
	}
	if (authChoice === "token") {
		const providerRaw = opts.tokenProvider?.trim();
		if (!providerRaw) {
			runtime.error("Missing --token-provider for --auth-choice token.");
			runtime.exit(1);
			return null;
		}
		const provider = normalizeProviderId(providerRaw);
		if (provider !== "anthropic") {
			runtime.error("Only --token-provider anthropic is supported for --auth-choice token.");
			runtime.exit(1);
			return null;
		}
		const tokenRaw = normalizeSecretInput(opts.token);
		if (!tokenRaw) {
			runtime.error("Missing --token for --auth-choice token.");
			runtime.exit(1);
			return null;
		}
		const tokenError = validateAnthropicSetupToken(tokenRaw);
		if (tokenError) {
			runtime.error(tokenError);
			runtime.exit(1);
			return null;
		}
		let expires;
		const expiresInRaw = opts.tokenExpiresIn?.trim();
		if (expiresInRaw) try {
			expires = Date.now() + parseDurationMs(expiresInRaw, { defaultUnit: "d" });
		} catch (err) {
			runtime.error(`Invalid --token-expires-in: ${String(err)}`);
			runtime.exit(1);
			return null;
		}
		const profileId = opts.tokenProfileId?.trim() || buildTokenProfileId({
			provider,
			name: ""
		});
		upsertAuthProfile({
			profileId,
			credential: {
				type: "token",
				provider,
				token: tokenRaw.trim(),
				...expires ? { expires } : {}
			}
		});
		return applyAuthProfileConfig(nextConfig, {
			profileId,
			provider,
			mode: "token"
		});
	}
	if (authChoice === "gemini-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "google",
			cfg: baseConfig,
			flagValue: opts.geminiApiKey,
			flagName: "--gemini-api-key",
			envVar: "GEMINI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setGeminiApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "google:default",
			provider: "google",
			mode: "api_key"
		});
		return applyGoogleGeminiModelDefault(nextConfig).next;
	}
	if (authChoice === "zai-api-key" || authChoice === "zai-coding-global" || authChoice === "zai-coding-cn" || authChoice === "zai-global" || authChoice === "zai-cn") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "zai",
			cfg: baseConfig,
			flagValue: opts.zaiApiKey,
			flagName: "--zai-api-key",
			envVar: "ZAI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setZaiApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "zai:default",
			provider: "zai",
			mode: "api_key"
		});
		let endpoint;
		let modelIdOverride;
		if (authChoice === "zai-coding-global") endpoint = "coding-global";
		else if (authChoice === "zai-coding-cn") endpoint = "coding-cn";
		else if (authChoice === "zai-global") endpoint = "global";
		else if (authChoice === "zai-cn") endpoint = "cn";
		else {
			const detected = await detectZaiEndpoint({ apiKey: resolved.key });
			if (detected) {
				endpoint = detected.endpoint;
				modelIdOverride = detected.modelId;
			} else endpoint = "global";
		}
		return applyZaiConfig(nextConfig, {
			endpoint,
			...modelIdOverride ? { modelId: modelIdOverride } : {}
		});
	}
	if (authChoice === "xiaomi-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "xiaomi",
			cfg: baseConfig,
			flagValue: opts.xiaomiApiKey,
			flagName: "--xiaomi-api-key",
			envVar: "XIAOMI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setXiaomiApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "xiaomi:default",
			provider: "xiaomi",
			mode: "api_key"
		});
		return applyXiaomiConfig(nextConfig);
	}
	if (authChoice === "xai-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "xai",
			cfg: baseConfig,
			flagValue: opts.xaiApiKey,
			flagName: "--xai-api-key",
			envVar: "XAI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") setXaiApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "xai:default",
			provider: "xai",
			mode: "api_key"
		});
		return applyXaiConfig(nextConfig);
	}
	if (authChoice === "qianfan-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "qianfan",
			cfg: baseConfig,
			flagValue: opts.qianfanApiKey,
			flagName: "--qianfan-api-key",
			envVar: "QIANFAN_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") setQianfanApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "qianfan:default",
			provider: "qianfan",
			mode: "api_key"
		});
		return applyQianfanConfig(nextConfig);
	}
	if (authChoice === "openai-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "openai",
			cfg: baseConfig,
			flagValue: opts.openaiApiKey,
			flagName: "--openai-api-key",
			envVar: "OPENAI_API_KEY",
			runtime,
			allowProfile: false
		});
		if (!resolved) return null;
		const key = resolved.key;
		const result = upsertSharedEnvVar({
			key: "OPENAI_API_KEY",
			value: key
		});
		process.env.OPENAI_API_KEY = key;
		runtime.log(`Saved OPENAI_API_KEY to ${shortenHomePath(result.path)}`);
		return applyOpenAIConfig(nextConfig);
	}
	if (authChoice === "openrouter-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "openrouter",
			cfg: baseConfig,
			flagValue: opts.openrouterApiKey,
			flagName: "--openrouter-api-key",
			envVar: "OPENROUTER_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setOpenrouterApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "openrouter:default",
			provider: "openrouter",
			mode: "api_key"
		});
		return applyOpenrouterConfig(nextConfig);
	}
	if (authChoice === "litellm-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "litellm",
			cfg: baseConfig,
			flagValue: opts.litellmApiKey,
			flagName: "--litellm-api-key",
			envVar: "LITELLM_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setLitellmApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "litellm:default",
			provider: "litellm",
			mode: "api_key"
		});
		return applyLitellmConfig(nextConfig);
	}
	if (authChoice === "ai-gateway-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "vercel-ai-gateway",
			cfg: baseConfig,
			flagValue: opts.aiGatewayApiKey,
			flagName: "--ai-gateway-api-key",
			envVar: "AI_GATEWAY_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setVercelAiGatewayApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "vercel-ai-gateway:default",
			provider: "vercel-ai-gateway",
			mode: "api_key"
		});
		return applyVercelAiGatewayConfig(nextConfig);
	}
	if (authChoice === "cloudflare-ai-gateway-api-key") {
		const accountId = opts.cloudflareAiGatewayAccountId?.trim() ?? "";
		const gatewayId = opts.cloudflareAiGatewayGatewayId?.trim() ?? "";
		if (!accountId || !gatewayId) {
			runtime.error(["Auth choice \"cloudflare-ai-gateway-api-key\" requires Account ID and Gateway ID.", "Use --cloudflare-ai-gateway-account-id and --cloudflare-ai-gateway-gateway-id."].join("\n"));
			runtime.exit(1);
			return null;
		}
		const resolved = await resolveNonInteractiveApiKey({
			provider: "cloudflare-ai-gateway",
			cfg: baseConfig,
			flagValue: opts.cloudflareAiGatewayApiKey,
			flagName: "--cloudflare-ai-gateway-api-key",
			envVar: "CLOUDFLARE_AI_GATEWAY_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setCloudflareAiGatewayConfig(accountId, gatewayId, resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "cloudflare-ai-gateway:default",
			provider: "cloudflare-ai-gateway",
			mode: "api_key"
		});
		return applyCloudflareAiGatewayConfig(nextConfig, {
			accountId,
			gatewayId
		});
	}
	if (authChoice === "moonshot-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "moonshot",
			cfg: baseConfig,
			flagValue: opts.moonshotApiKey,
			flagName: "--moonshot-api-key",
			envVar: "MOONSHOT_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setMoonshotApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "moonshot:default",
			provider: "moonshot",
			mode: "api_key"
		});
		return applyMoonshotConfig(nextConfig);
	}
	if (authChoice === "moonshot-api-key-cn") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "moonshot",
			cfg: baseConfig,
			flagValue: opts.moonshotApiKey,
			flagName: "--moonshot-api-key",
			envVar: "MOONSHOT_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setMoonshotApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "moonshot:default",
			provider: "moonshot",
			mode: "api_key"
		});
		return applyMoonshotConfigCn(nextConfig);
	}
	if (authChoice === "kimi-code-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "kimi-coding",
			cfg: baseConfig,
			flagValue: opts.kimiCodeApiKey,
			flagName: "--kimi-code-api-key",
			envVar: "KIMI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setKimiCodingApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "kimi-coding:default",
			provider: "kimi-coding",
			mode: "api_key"
		});
		return applyKimiCodeConfig(nextConfig);
	}
	if (authChoice === "synthetic-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "synthetic",
			cfg: baseConfig,
			flagValue: opts.syntheticApiKey,
			flagName: "--synthetic-api-key",
			envVar: "SYNTHETIC_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setSyntheticApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "synthetic:default",
			provider: "synthetic",
			mode: "api_key"
		});
		return applySyntheticConfig(nextConfig);
	}
	if (authChoice === "venice-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "venice",
			cfg: baseConfig,
			flagValue: opts.veniceApiKey,
			flagName: "--venice-api-key",
			envVar: "VENICE_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setVeniceApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "venice:default",
			provider: "venice",
			mode: "api_key"
		});
		return applyVeniceConfig(nextConfig);
	}
	if (authChoice === "minimax-cloud" || authChoice === "minimax-api" || authChoice === "minimax-api-lightning") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "minimax",
			cfg: baseConfig,
			flagValue: opts.minimaxApiKey,
			flagName: "--minimax-api-key",
			envVar: "MINIMAX_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setMinimaxApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "minimax:default",
			provider: "minimax",
			mode: "api_key"
		});
		return applyMinimaxApiConfig(nextConfig, authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1");
	}
	if (authChoice === "minimax") return applyMinimaxConfig(nextConfig);
	if (authChoice === "opencode-zen") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "opencode",
			cfg: baseConfig,
			flagValue: opts.opencodeZenApiKey,
			flagName: "--opencode-zen-api-key",
			envVar: "OPENCODE_API_KEY (or OPENCODE_ZEN_API_KEY)",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setOpencodeZenApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "opencode:default",
			provider: "opencode",
			mode: "api_key"
		});
		return applyOpencodeZenConfig(nextConfig);
	}
	if (authChoice === "together-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "together",
			cfg: baseConfig,
			flagValue: opts.togetherApiKey,
			flagName: "--together-api-key",
			envVar: "TOGETHER_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setTogetherApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "together:default",
			provider: "together",
			mode: "api_key"
		});
		return applyTogetherConfig(nextConfig);
	}
	if (authChoice === "huggingface-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "huggingface",
			cfg: baseConfig,
			flagValue: opts.huggingfaceApiKey,
			flagName: "--huggingface-api-key",
			envVar: "HF_TOKEN",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setHuggingfaceApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "huggingface:default",
			provider: "huggingface",
			mode: "api_key"
		});
		return applyHuggingfaceConfig(nextConfig);
	}
	if (authChoice === "custom-api-key") try {
		const customAuth = parseNonInteractiveCustomApiFlags({
			baseUrl: opts.customBaseUrl,
			modelId: opts.customModelId,
			compatibility: opts.customCompatibility,
			apiKey: opts.customApiKey,
			providerId: opts.customProviderId
		});
		const resolvedCustomApiKey = await resolveNonInteractiveApiKey({
			provider: resolveCustomProviderId({
				config: nextConfig,
				baseUrl: customAuth.baseUrl,
				providerId: customAuth.providerId
			}).providerId,
			cfg: baseConfig,
			flagValue: customAuth.apiKey,
			flagName: "--custom-api-key",
			envVar: "CUSTOM_API_KEY",
			envVarName: "CUSTOM_API_KEY",
			runtime,
			required: false
		});
		const result = applyCustomApiConfig({
			config: nextConfig,
			baseUrl: customAuth.baseUrl,
			modelId: customAuth.modelId,
			compatibility: customAuth.compatibility,
			apiKey: resolvedCustomApiKey?.key,
			providerId: customAuth.providerId
		});
		if (result.providerIdRenamedFrom && result.providerId) runtime.log(`Custom provider ID "${result.providerIdRenamedFrom}" already exists for a different base URL. Using "${result.providerId}".`);
		return result.config;
	} catch (err) {
		if (err instanceof CustomApiError) {
			switch (err.code) {
				case "missing_required":
				case "invalid_compatibility":
					runtime.error(err.message);
					break;
				default:
					runtime.error(`Invalid custom provider config: ${err.message}`);
					break;
			}
			runtime.exit(1);
			return null;
		}
		const reason = err instanceof Error ? err.message : String(err);
		runtime.error(`Invalid custom provider config: ${reason}`);
		runtime.exit(1);
		return null;
	}
	if (authChoice === "oauth" || authChoice === "chutes" || authChoice === "openai-codex" || authChoice === "qwen-portal" || authChoice === "minimax-portal") {
		runtime.error("OAuth requires interactive mode.");
		runtime.exit(1);
		return null;
	}
	return nextConfig;
}

//#endregion
//#region src/commands/onboard-non-interactive/local/daemon-install.ts
async function installGatewayDaemonNonInteractive(params) {
	const { opts, runtime, port, gatewayToken } = params;
	if (!opts.installDaemon) return;
	const daemonRuntimeRaw = opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME;
	const systemdAvailable = process.platform === "linux" ? await isSystemdUserServiceAvailable() : true;
	if (process.platform === "linux" && !systemdAvailable) {
		runtime.log("Systemd user services are unavailable; skipping service install.");
		return;
	}
	if (!isGatewayDaemonRuntime(daemonRuntimeRaw)) {
		runtime.error("Invalid --daemon-runtime (use node or bun)");
		runtime.exit(1);
		return;
	}
	const service = resolveGatewayService();
	const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
		env: process.env,
		port,
		token: gatewayToken,
		runtime: daemonRuntimeRaw,
		warn: (message) => runtime.log(message),
		config: params.nextConfig
	});
	try {
		await service.install({
			env: process.env,
			stdout: process.stdout,
			programArguments,
			workingDirectory,
			environment
		});
	} catch (err) {
		runtime.error(`Gateway service install failed: ${String(err)}`);
		runtime.log(gatewayInstallErrorHint());
		return;
	}
	await ensureSystemdUserLingerNonInteractive({ runtime });
}

//#endregion
//#region src/commands/onboard-non-interactive/local/gateway-config.ts
function applyNonInteractiveGatewayConfig(params) {
	const { opts, runtime } = params;
	const hasGatewayPort = opts.gatewayPort !== void 0;
	if (hasGatewayPort && (!Number.isFinite(opts.gatewayPort) || (opts.gatewayPort ?? 0) <= 0)) {
		runtime.error("Invalid --gateway-port");
		runtime.exit(1);
		return null;
	}
	const port = hasGatewayPort ? opts.gatewayPort : params.defaultPort;
	let bind = opts.gatewayBind ?? "loopback";
	const authModeRaw = opts.gatewayAuth ?? "token";
	if (authModeRaw !== "token" && authModeRaw !== "password") {
		runtime.error("Invalid --gateway-auth (use token|password).");
		runtime.exit(1);
		return null;
	}
	let authMode = authModeRaw;
	const tailscaleMode = opts.tailscale ?? "off";
	const tailscaleResetOnExit = Boolean(opts.tailscaleResetOnExit);
	if (tailscaleMode !== "off" && bind !== "loopback") bind = "loopback";
	if (tailscaleMode === "funnel" && authMode !== "password") authMode = "password";
	let nextConfig = params.nextConfig;
	let gatewayToken = opts.gatewayToken?.trim() || void 0;
	if (authMode === "token") {
		if (!gatewayToken) gatewayToken = randomToken();
		nextConfig = {
			...nextConfig,
			gateway: {
				...nextConfig.gateway,
				auth: {
					...nextConfig.gateway?.auth,
					mode: "token",
					token: gatewayToken
				}
			}
		};
	}
	if (authMode === "password") {
		const password = opts.gatewayPassword?.trim();
		if (!password) {
			runtime.error("Missing --gateway-password for password auth.");
			runtime.exit(1);
			return null;
		}
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
	}
	nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			port,
			bind,
			tailscale: {
				...nextConfig.gateway?.tailscale,
				mode: tailscaleMode,
				resetOnExit: tailscaleResetOnExit
			}
		}
	};
	return {
		nextConfig,
		port,
		bind,
		authMode,
		tailscaleMode,
		tailscaleResetOnExit,
		gatewayToken
	};
}

//#endregion
//#region src/commands/onboard-non-interactive/local/output.ts
function logNonInteractiveOnboardingJson(params) {
	if (!params.opts.json) return;
	params.runtime.log(JSON.stringify({
		mode: params.mode,
		workspace: params.workspaceDir,
		authChoice: params.authChoice,
		gateway: params.gateway,
		installDaemon: Boolean(params.installDaemon),
		daemonRuntime: params.daemonRuntime,
		skipSkills: Boolean(params.skipSkills),
		skipHealth: Boolean(params.skipHealth)
	}, null, 2));
}

//#endregion
//#region src/commands/onboard-non-interactive/local/skills-config.ts
function applyNonInteractiveSkillsConfig(params) {
	const { nextConfig, opts, runtime } = params;
	if (opts.skipSkills) return nextConfig;
	const nodeManager = opts.nodeManager ?? "npm";
	if (![
		"npm",
		"pnpm",
		"bun"
	].includes(nodeManager)) {
		runtime.error("Invalid --node-manager (use npm, pnpm, or bun)");
		runtime.exit(1);
		return nextConfig;
	}
	return {
		...nextConfig,
		skills: {
			...nextConfig.skills,
			install: {
				...nextConfig.skills?.install,
				nodeManager
			}
		}
	};
}

//#endregion
//#region src/commands/onboard-non-interactive/local/workspace.ts
function resolveNonInteractiveWorkspaceDir(params) {
	return resolveUserPath((params.opts.workspace ?? params.baseConfig.agents?.defaults?.workspace ?? params.defaultWorkspaceDir).trim());
}

//#endregion
//#region src/commands/onboard-non-interactive/local.ts
async function runNonInteractiveOnboardingLocal(params) {
	const { opts, runtime, baseConfig } = params;
	const mode = "local";
	const workspaceDir = resolveNonInteractiveWorkspaceDir({
		opts,
		baseConfig,
		defaultWorkspaceDir: DEFAULT_WORKSPACE
	});
	let nextConfig = {
		...baseConfig,
		agents: {
			...baseConfig.agents,
			defaults: {
				...baseConfig.agents?.defaults,
				workspace: workspaceDir
			}
		},
		gateway: {
			...baseConfig.gateway,
			mode: "local"
		}
	};
	const inferredAuthChoice = inferAuthChoiceFromFlags(opts);
	if (!opts.authChoice && inferredAuthChoice.matches.length > 1) {
		runtime.error([
			"Multiple API key flags were provided for non-interactive onboarding.",
			"Use a single provider flag or pass --auth-choice explicitly.",
			`Flags: ${inferredAuthChoice.matches.map((match) => match.label).join(", ")}`
		].join("\n"));
		runtime.exit(1);
		return;
	}
	const authChoice = opts.authChoice ?? inferredAuthChoice.choice ?? "skip";
	const nextConfigAfterAuth = await applyNonInteractiveAuthChoice({
		nextConfig,
		authChoice,
		opts,
		runtime,
		baseConfig
	});
	if (!nextConfigAfterAuth) return;
	nextConfig = nextConfigAfterAuth;
	const gatewayBasePort = resolveGatewayPort(baseConfig);
	const gatewayResult = applyNonInteractiveGatewayConfig({
		nextConfig,
		opts,
		runtime,
		defaultPort: gatewayBasePort
	});
	if (!gatewayResult) return;
	nextConfig = gatewayResult.nextConfig;
	nextConfig = applyNonInteractiveSkillsConfig({
		nextConfig,
		opts,
		runtime
	});
	nextConfig = applyWizardMetadata(nextConfig, {
		command: "onboard",
		mode
	});
	await writeConfigFile(nextConfig);
	logConfigUpdated(runtime);
	await ensureWorkspaceAndSessions(workspaceDir, runtime, { skipBootstrap: Boolean(nextConfig.agents?.defaults?.skipBootstrap) });
	await installGatewayDaemonNonInteractive({
		nextConfig,
		opts,
		runtime,
		port: gatewayResult.port,
		gatewayToken: gatewayResult.gatewayToken
	});
	const daemonRuntimeRaw = opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME;
	if (!opts.skipHealth) {
		await waitForGatewayReachable({
			url: resolveControlUiLinks({
				bind: gatewayResult.bind,
				port: gatewayResult.port,
				customBindHost: nextConfig.gateway?.customBindHost,
				basePath: void 0
			}).wsUrl,
			token: gatewayResult.gatewayToken,
			deadlineMs: 15e3
		});
		await healthCommand({
			json: false,
			timeoutMs: 1e4
		}, runtime);
	}
	logNonInteractiveOnboardingJson({
		opts,
		runtime,
		mode,
		workspaceDir,
		authChoice,
		gateway: {
			port: gatewayResult.port,
			bind: gatewayResult.bind,
			authMode: gatewayResult.authMode,
			tailscaleMode: gatewayResult.tailscaleMode
		},
		installDaemon: Boolean(opts.installDaemon),
		daemonRuntime: opts.installDaemon ? daemonRuntimeRaw : void 0,
		skipSkills: Boolean(opts.skipSkills),
		skipHealth: Boolean(opts.skipHealth)
	});
	if (!opts.json) runtime.log(`Tip: run \`${formatCliCommand("openclaw configure --section web")}\` to store your Brave API key for web_search. Docs: https://docs.openclaw.ai/tools/web`);
}

//#endregion
//#region src/commands/onboard-non-interactive/remote.ts
async function runNonInteractiveOnboardingRemote(params) {
	const { opts, runtime, baseConfig } = params;
	const mode = "remote";
	const remoteUrl = opts.remoteUrl?.trim();
	if (!remoteUrl) {
		runtime.error("Missing --remote-url for remote mode.");
		runtime.exit(1);
		return;
	}
	let nextConfig = {
		...baseConfig,
		gateway: {
			...baseConfig.gateway,
			mode: "remote",
			remote: {
				url: remoteUrl,
				token: opts.remoteToken?.trim() || void 0
			}
		}
	};
	nextConfig = applyWizardMetadata(nextConfig, {
		command: "onboard",
		mode
	});
	await writeConfigFile(nextConfig);
	logConfigUpdated(runtime);
	const payload = {
		mode,
		remoteUrl,
		auth: opts.remoteToken ? "token" : "none"
	};
	if (opts.json) runtime.log(JSON.stringify(payload, null, 2));
	else {
		runtime.log(`Remote gateway: ${remoteUrl}`);
		runtime.log(`Auth: ${payload.auth}`);
		runtime.log(`Tip: run \`${formatCliCommand("openclaw configure --section web")}\` to store your Brave API key for web_search. Docs: https://docs.openclaw.ai/tools/web`);
	}
}

//#endregion
//#region src/commands/onboard-non-interactive.ts
async function runNonInteractiveOnboarding(opts, runtime = defaultRuntime) {
	const snapshot = await readConfigFileSnapshot();
	if (snapshot.exists && !snapshot.valid) {
		runtime.error(`Config invalid. Run \`${formatCliCommand("openclaw doctor")}\` to repair it, then re-run onboarding.`);
		runtime.exit(1);
		return;
	}
	const baseConfig = snapshot.valid ? snapshot.config : {};
	const mode = opts.mode ?? "local";
	if (mode !== "local" && mode !== "remote") {
		runtime.error(`Invalid --mode "${String(mode)}" (use local|remote).`);
		runtime.exit(1);
		return;
	}
	if (mode === "remote") {
		await runNonInteractiveOnboardingRemote({
			opts,
			runtime,
			baseConfig
		});
		return;
	}
	await runNonInteractiveOnboardingLocal({
		opts,
		runtime,
		baseConfig
	});
}

//#endregion
//#region src/commands/onboard.ts
async function onboardCommand(opts, runtime = defaultRuntime) {
	assertSupportedRuntime(runtime);
	const authChoice = opts.authChoice === "oauth" ? "setup-token" : opts.authChoice;
	const normalizedAuthChoice = authChoice === "claude-cli" ? "setup-token" : authChoice === "codex-cli" ? "openai-codex" : authChoice;
	if (opts.nonInteractive && (authChoice === "claude-cli" || authChoice === "codex-cli")) {
		runtime.error([`Auth choice "${authChoice}" is deprecated.`, "Use \"--auth-choice token\" (Anthropic setup-token) or \"--auth-choice openai-codex\"."].join("\n"));
		runtime.exit(1);
		return;
	}
	if (authChoice === "claude-cli") runtime.log("Auth choice \"claude-cli\" is deprecated; using setup-token flow instead.");
	if (authChoice === "codex-cli") runtime.log("Auth choice \"codex-cli\" is deprecated; using OpenAI Codex OAuth instead.");
	const flow = opts.flow === "manual" ? "advanced" : opts.flow;
	const normalizedOpts = normalizedAuthChoice === opts.authChoice && flow === opts.flow ? opts : {
		...opts,
		authChoice: normalizedAuthChoice,
		flow
	};
	if (normalizedOpts.nonInteractive && normalizedOpts.acceptRisk !== true) {
		runtime.error([
			"Non-interactive onboarding requires explicit risk acknowledgement.",
			"Read: https://docs.openclaw.ai/security",
			`Re-run with: ${formatCliCommand("openclaw onboard --non-interactive --accept-risk ...")}`
		].join("\n"));
		runtime.exit(1);
		return;
	}
	if (normalizedOpts.reset) {
		const snapshot = await readConfigFileSnapshot();
		const baseConfig = snapshot.valid ? snapshot.config : {};
		await handleReset("full", resolveUserPath(normalizedOpts.workspace ?? baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE), runtime);
	}
	if (process.platform === "win32") runtime.log([
		"Windows detected — OpenClaw runs great on WSL2!",
		"Native Windows might be trickier.",
		"Quick setup: wsl --install (one command, one reboot)",
		"Guide: https://docs.openclaw.ai/windows"
	].join("\n"));
	if (normalizedOpts.nonInteractive) {
		await runNonInteractiveOnboarding(normalizedOpts, runtime);
		return;
	}
	await runInteractiveOnboarding(normalizedOpts, runtime);
}

//#endregion
//#region src/cli/program/register.onboard.ts
function resolveInstallDaemonFlag(command, opts) {
	if (!command || typeof command !== "object") return;
	const getOptionValueSource = "getOptionValueSource" in command ? command.getOptionValueSource : void 0;
	if (typeof getOptionValueSource !== "function") return;
	if (getOptionValueSource.call(command, "skipDaemon") === "cli") return false;
	if (getOptionValueSource.call(command, "installDaemon") === "cli") return Boolean(opts.installDaemon);
}
function registerOnboardCommand(program) {
	program.command("onboard").description("Interactive wizard to set up the gateway, workspace, and skills").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/onboard", "docs.openclaw.ai/cli/onboard")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace)").option("--reset", "Reset config + credentials + sessions + workspace before running wizard").option("--non-interactive", "Run without prompts", false).option("--accept-risk", "Acknowledge that agents are powerful and full system access is risky (required for --non-interactive)", false).option("--flow <flow>", "Wizard flow: quickstart|advanced|manual").option("--mode <mode>", "Wizard mode: local|remote").option("--auth-choice <choice>", "Auth: setup-token|token|chutes|openai-codex|openai-api-key|xai-api-key|qianfan-api-key|openrouter-api-key|litellm-api-key|ai-gateway-api-key|cloudflare-ai-gateway-api-key|moonshot-api-key|moonshot-api-key-cn|kimi-code-api-key|synthetic-api-key|venice-api-key|gemini-api-key|zai-api-key|zai-coding-global|zai-coding-cn|zai-global|zai-cn|xiaomi-api-key|apiKey|minimax-api|minimax-api-lightning|opencode-zen|custom-api-key|skip|together-api-key|huggingface-api-key", "Auth: setup-token|token|chutes|vllm|openai-codex|openai-api-key|xai-api-key|qianfan-api-key|openrouter-api-key|litellm-api-key|ai-gateway-api-key|cloudflare-ai-gateway-api-key|moonshot-api-key|moonshot-api-key-cn|kimi-code-api-key|synthetic-api-key|venice-api-key|gemini-api-key|zai-api-key|zai-coding-global|zai-coding-cn|zai-global|zai-cn|xiaomi-api-key|apiKey|minimax-api|minimax-api-lightning|opencode-zen|custom-api-key|skip|together-api-key|huggingface-api-key").option("--token-provider <id>", "Token provider id (non-interactive; used with --auth-choice token)").option("--token <token>", "Token value (non-interactive; used with --auth-choice token)").option("--token-profile-id <id>", "Auth profile id (non-interactive; default: <provider>:manual)").option("--token-expires-in <duration>", "Optional token expiry duration (e.g. 365d, 12h)").option("--anthropic-api-key <key>", "Anthropic API key").option("--openai-api-key <key>", "OpenAI API key").option("--openrouter-api-key <key>", "OpenRouter API key").option("--ai-gateway-api-key <key>", "Vercel AI Gateway API key").option("--cloudflare-ai-gateway-account-id <id>", "Cloudflare Account ID").option("--cloudflare-ai-gateway-gateway-id <id>", "Cloudflare AI Gateway ID").option("--cloudflare-ai-gateway-api-key <key>", "Cloudflare AI Gateway API key").option("--moonshot-api-key <key>", "Moonshot API key").option("--kimi-code-api-key <key>", "Kimi Coding API key").option("--gemini-api-key <key>", "Gemini API key").option("--zai-api-key <key>", "Z.AI API key").option("--xiaomi-api-key <key>", "Xiaomi API key").option("--minimax-api-key <key>", "MiniMax API key").option("--synthetic-api-key <key>", "Synthetic API key").option("--venice-api-key <key>", "Venice API key").option("--together-api-key <key>", "Together AI API key").option("--huggingface-api-key <key>", "Hugging Face API key (HF token)").option("--opencode-zen-api-key <key>", "OpenCode Zen API key").option("--xai-api-key <key>", "xAI API key").option("--litellm-api-key <key>", "LiteLLM API key").option("--qianfan-api-key <key>", "QIANFAN API key").option("--custom-base-url <url>", "Custom provider base URL").option("--custom-api-key <key>", "Custom provider API key (optional)").option("--custom-model-id <id>", "Custom provider model ID").option("--custom-provider-id <id>", "Custom provider ID (optional; auto-derived by default)").option("--custom-compatibility <mode>", "Custom provider API compatibility: openai|anthropic (default: openai)").option("--gateway-port <port>", "Gateway port").option("--gateway-bind <mode>", "Gateway bind: loopback|tailnet|lan|auto|custom").option("--gateway-auth <mode>", "Gateway auth: token|password").option("--gateway-token <token>", "Gateway token (token auth)").option("--gateway-password <password>", "Gateway password (password auth)").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").option("--tailscale <mode>", "Tailscale: off|serve|funnel").option("--tailscale-reset-on-exit", "Reset tailscale serve/funnel on exit").option("--install-daemon", "Install gateway service").option("--no-install-daemon", "Skip gateway service install").option("--skip-daemon", "Skip gateway service install").option("--daemon-runtime <runtime>", "Daemon runtime: node|bun").option("--skip-channels", "Skip channel setup").option("--skip-skills", "Skip skills setup").option("--skip-health", "Skip health check").option("--skip-ui", "Skip Control UI/TUI prompts").option("--node-manager <name>", "Node manager for skills: npm|pnpm|bun").option("--json", "Output JSON summary", false).action(async (opts, command) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const installDaemon = resolveInstallDaemonFlag(command, { installDaemon: Boolean(opts.installDaemon) });
			const gatewayPort = typeof opts.gatewayPort === "string" ? Number.parseInt(opts.gatewayPort, 10) : void 0;
			await onboardCommand({
				workspace: opts.workspace,
				nonInteractive: Boolean(opts.nonInteractive),
				acceptRisk: Boolean(opts.acceptRisk),
				flow: opts.flow,
				mode: opts.mode,
				authChoice: opts.authChoice,
				tokenProvider: opts.tokenProvider,
				token: opts.token,
				tokenProfileId: opts.tokenProfileId,
				tokenExpiresIn: opts.tokenExpiresIn,
				anthropicApiKey: opts.anthropicApiKey,
				openaiApiKey: opts.openaiApiKey,
				openrouterApiKey: opts.openrouterApiKey,
				aiGatewayApiKey: opts.aiGatewayApiKey,
				cloudflareAiGatewayAccountId: opts.cloudflareAiGatewayAccountId,
				cloudflareAiGatewayGatewayId: opts.cloudflareAiGatewayGatewayId,
				cloudflareAiGatewayApiKey: opts.cloudflareAiGatewayApiKey,
				moonshotApiKey: opts.moonshotApiKey,
				kimiCodeApiKey: opts.kimiCodeApiKey,
				geminiApiKey: opts.geminiApiKey,
				zaiApiKey: opts.zaiApiKey,
				xiaomiApiKey: opts.xiaomiApiKey,
				qianfanApiKey: opts.qianfanApiKey,
				minimaxApiKey: opts.minimaxApiKey,
				syntheticApiKey: opts.syntheticApiKey,
				veniceApiKey: opts.veniceApiKey,
				togetherApiKey: opts.togetherApiKey,
				huggingfaceApiKey: opts.huggingfaceApiKey,
				opencodeZenApiKey: opts.opencodeZenApiKey,
				xaiApiKey: opts.xaiApiKey,
				litellmApiKey: opts.litellmApiKey,
				customBaseUrl: opts.customBaseUrl,
				customApiKey: opts.customApiKey,
				customModelId: opts.customModelId,
				customProviderId: opts.customProviderId,
				customCompatibility: opts.customCompatibility,
				gatewayPort: typeof gatewayPort === "number" && Number.isFinite(gatewayPort) ? gatewayPort : void 0,
				gatewayBind: opts.gatewayBind,
				gatewayAuth: opts.gatewayAuth,
				gatewayToken: opts.gatewayToken,
				gatewayPassword: opts.gatewayPassword,
				remoteUrl: opts.remoteUrl,
				remoteToken: opts.remoteToken,
				tailscale: opts.tailscale,
				tailscaleResetOnExit: Boolean(opts.tailscaleResetOnExit),
				reset: Boolean(opts.reset),
				installDaemon,
				daemonRuntime: opts.daemonRuntime,
				skipChannels: Boolean(opts.skipChannels),
				skipSkills: Boolean(opts.skipSkills),
				skipHealth: Boolean(opts.skipHealth),
				skipUi: Boolean(opts.skipUi),
				nodeManager: opts.nodeManager,
				json: Boolean(opts.json)
			}, defaultRuntime);
		});
	});
}

//#endregion
//#region src/commands/setup.ts
async function readConfigFileRaw(configPath) {
	try {
		const raw = await fsPromises.readFile(configPath, "utf-8");
		const parsed = JSON5.parse(raw);
		if (parsed && typeof parsed === "object") return {
			exists: true,
			parsed
		};
		return {
			exists: true,
			parsed: {}
		};
	} catch {
		return {
			exists: false,
			parsed: {}
		};
	}
}
async function setupCommand(opts, runtime = defaultRuntime) {
	const desiredWorkspace = typeof opts?.workspace === "string" && opts.workspace.trim() ? opts.workspace.trim() : void 0;
	const configPath = createConfigIO().configPath;
	const existingRaw = await readConfigFileRaw(configPath);
	const cfg = existingRaw.parsed;
	const defaults = cfg.agents?.defaults ?? {};
	const workspace = desiredWorkspace ?? defaults.workspace ?? DEFAULT_AGENT_WORKSPACE_DIR;
	const next = {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				workspace
			}
		}
	};
	if (!existingRaw.exists || defaults.workspace !== workspace) {
		await writeConfigFile(next);
		if (!existingRaw.exists) runtime.log(`Wrote ${formatConfigPath(configPath)}`);
		else logConfigUpdated(runtime, {
			path: configPath,
			suffix: "(set agents.defaults.workspace)"
		});
	} else runtime.log(`Config OK: ${formatConfigPath(configPath)}`);
	const ws = await ensureAgentWorkspace({
		dir: workspace,
		ensureBootstrapFiles: !next.agents?.defaults?.skipBootstrap
	});
	runtime.log(`Workspace OK: ${shortenHomePath(ws.dir)}`);
	const sessionsDir = resolveSessionTranscriptsDir();
	await fsPromises.mkdir(sessionsDir, { recursive: true });
	runtime.log(`Sessions OK: ${shortenHomePath(sessionsDir)}`);
}

//#endregion
//#region src/cli/program/register.setup.ts
function registerSetupCommand(program) {
	program.command("setup").description("Initialize ~/.openclaw/openclaw.json and the agent workspace").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/setup", "docs.openclaw.ai/cli/setup")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace; stored as agents.defaults.workspace)").option("--wizard", "Run the interactive onboarding wizard", false).option("--non-interactive", "Run the wizard without prompts", false).option("--mode <mode>", "Wizard mode: local|remote").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").action(async (opts, command) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const hasWizardFlags = hasExplicitOptions(command, [
				"wizard",
				"nonInteractive",
				"mode",
				"remoteUrl",
				"remoteToken"
			]);
			if (opts.wizard || hasWizardFlags) {
				await onboardCommand({
					workspace: opts.workspace,
					nonInteractive: Boolean(opts.nonInteractive),
					mode: opts.mode,
					remoteUrl: opts.remoteUrl,
					remoteToken: opts.remoteToken
				}, defaultRuntime);
				return;
			}
			await setupCommand({ workspace: opts.workspace }, defaultRuntime);
		});
	});
}

//#endregion
//#region src/commands/sessions.ts
const KIND_PAD = 6;
const KEY_PAD = 26;
const AGE_PAD = 9;
const MODEL_PAD = 14;
const TOKENS_PAD = 20;
const formatKTokens = (value) => `${(value / 1e3).toFixed(value >= 1e4 ? 0 : 1)}k`;
const truncateKey = (key) => {
	if (key.length <= KEY_PAD) return key;
	const head = Math.max(4, KEY_PAD - 10);
	return `${key.slice(0, head)}...${key.slice(-6)}`;
};
const colorByPct = (label, pct, rich) => {
	if (!rich || pct === null) return label;
	if (pct >= 95) return theme.error(label);
	if (pct >= 80) return theme.warn(label);
	if (pct >= 60) return theme.success(label);
	return theme.muted(label);
};
const formatTokensCell = (total, contextTokens, rich) => {
	if (total === void 0) {
		const label = `unknown/${contextTokens ? formatKTokens(contextTokens) : "?"} (?%)`;
		return rich ? theme.muted(label.padEnd(TOKENS_PAD)) : label.padEnd(TOKENS_PAD);
	}
	const totalLabel = formatKTokens(total);
	const ctxLabel = contextTokens ? formatKTokens(contextTokens) : "?";
	const pct = contextTokens ? Math.min(999, Math.round(total / contextTokens * 100)) : null;
	return colorByPct(`${totalLabel}/${ctxLabel} (${pct ?? "?"}%)`.padEnd(TOKENS_PAD), pct, rich);
};
const formatKindCell = (kind, rich) => {
	const label = kind.padEnd(KIND_PAD);
	if (!rich) return label;
	if (kind === "group") return theme.accentBright(label);
	if (kind === "global") return theme.warn(label);
	if (kind === "direct") return theme.accent(label);
	return theme.muted(label);
};
const formatAgeCell = (updatedAt, rich) => {
	const padded = (updatedAt ? formatTimeAgo(Date.now() - updatedAt) : "unknown").padEnd(AGE_PAD);
	return rich ? theme.muted(padded) : padded;
};
const formatModelCell = (model, rich) => {
	const label = (model ?? "unknown").padEnd(MODEL_PAD);
	return rich ? theme.info(label) : label;
};
const formatFlagsCell = (row, rich) => {
	const label = [
		row.thinkingLevel ? `think:${row.thinkingLevel}` : null,
		row.verboseLevel ? `verbose:${row.verboseLevel}` : null,
		row.reasoningLevel ? `reasoning:${row.reasoningLevel}` : null,
		row.elevatedLevel ? `elev:${row.elevatedLevel}` : null,
		row.responseUsage ? `usage:${row.responseUsage}` : null,
		row.groupActivation ? `activation:${row.groupActivation}` : null,
		row.systemSent ? "system" : null,
		row.abortedLastRun ? "aborted" : null,
		row.sessionId ? `id:${row.sessionId}` : null
	].filter(Boolean).join(" ");
	return label.length === 0 ? "" : rich ? theme.muted(label) : label;
};
function classifyKey(key, entry) {
	if (key === "global") return "global";
	if (key === "unknown") return "unknown";
	if (entry?.chatType === "group" || entry?.chatType === "channel") return "group";
	if (key.includes(":group:") || key.includes(":channel:")) return "group";
	return "direct";
}
function toRows(store) {
	return Object.entries(store).map(([key, entry]) => {
		const updatedAt = entry?.updatedAt ?? null;
		return {
			key,
			kind: classifyKey(key, entry),
			updatedAt,
			ageMs: updatedAt ? Date.now() - updatedAt : null,
			sessionId: entry?.sessionId,
			systemSent: entry?.systemSent,
			abortedLastRun: entry?.abortedLastRun,
			thinkingLevel: entry?.thinkingLevel,
			verboseLevel: entry?.verboseLevel,
			reasoningLevel: entry?.reasoningLevel,
			elevatedLevel: entry?.elevatedLevel,
			responseUsage: entry?.responseUsage,
			groupActivation: entry?.groupActivation,
			inputTokens: entry?.inputTokens,
			outputTokens: entry?.outputTokens,
			totalTokens: entry?.totalTokens,
			totalTokensFresh: entry?.totalTokensFresh,
			model: entry?.model,
			contextTokens: entry?.contextTokens
		};
	}).toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}
async function sessionsCommand(opts, runtime) {
	const cfg = loadConfig();
	const resolved = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const configContextTokens = cfg.agents?.defaults?.contextTokens ?? lookupContextTokens(resolved.model) ?? DEFAULT_CONTEXT_TOKENS;
	const configModel = resolved.model ?? DEFAULT_MODEL;
	const storePath = resolveStorePath(opts.store ?? cfg.session?.store);
	const store = loadSessionStore(storePath);
	let activeMinutes;
	if (opts.active !== void 0) {
		const parsed = Number.parseInt(String(opts.active), 10);
		if (Number.isNaN(parsed) || parsed <= 0) {
			runtime.error("--active must be a positive integer (minutes)");
			runtime.exit(1);
			return;
		}
		activeMinutes = parsed;
	}
	const rows = toRows(store).filter((row) => {
		if (activeMinutes === void 0) return true;
		if (!row.updatedAt) return false;
		return Date.now() - row.updatedAt <= activeMinutes * 6e4;
	});
	if (opts.json) {
		runtime.log(JSON.stringify({
			path: storePath,
			count: rows.length,
			activeMinutes: activeMinutes ?? null,
			sessions: rows.map((r) => ({
				...r,
				totalTokens: resolveFreshSessionTotalTokens(r) ?? null,
				totalTokensFresh: typeof r.totalTokens === "number" ? r.totalTokensFresh !== false : false,
				contextTokens: r.contextTokens ?? lookupContextTokens(r.model) ?? configContextTokens ?? null,
				model: r.model ?? configModel ?? null
			}))
		}, null, 2));
		return;
	}
	runtime.log(info(`Session store: ${storePath}`));
	runtime.log(info(`Sessions listed: ${rows.length}`));
	if (activeMinutes) runtime.log(info(`Filtered to last ${activeMinutes} minute(s)`));
	if (rows.length === 0) {
		runtime.log("No sessions found.");
		return;
	}
	const rich = isRich();
	const header = [
		"Kind".padEnd(KIND_PAD),
		"Key".padEnd(KEY_PAD),
		"Age".padEnd(AGE_PAD),
		"Model".padEnd(MODEL_PAD),
		"Tokens (ctx %)".padEnd(TOKENS_PAD),
		"Flags"
	].join(" ");
	runtime.log(rich ? theme.heading(header) : header);
	for (const row of rows) {
		const model = row.model ?? configModel;
		const contextTokens = row.contextTokens ?? lookupContextTokens(model) ?? configContextTokens;
		const total = resolveFreshSessionTotalTokens(row);
		const keyLabel = truncateKey(row.key).padEnd(KEY_PAD);
		const keyCell = rich ? theme.accent(keyLabel) : keyLabel;
		const line = [
			formatKindCell(row.kind, rich),
			keyCell,
			formatAgeCell(row.updatedAt, rich),
			formatModelCell(model, rich),
			formatTokensCell(total, contextTokens ?? null, rich),
			formatFlagsCell(row, rich)
		].join(" ");
		runtime.log(line.trimEnd());
	}
}

//#endregion
//#region src/cli/program/register.status-health-sessions.ts
function resolveVerbose(opts) {
	return Boolean(opts.verbose || opts.debug);
}
function parseTimeoutMs(timeout) {
	const parsed = parsePositiveIntOrUndefined(timeout);
	if (timeout !== void 0 && parsed === void 0) {
		defaultRuntime.error("--timeout must be a positive integer (milliseconds)");
		defaultRuntime.exit(1);
		return null;
	}
	return parsed;
}
function registerStatusHealthSessionsCommands(program) {
	program.command("status").description("Show channel health and recent session recipients").option("--json", "Output JSON instead of text", false).option("--all", "Full diagnosis (read-only, pasteable)", false).option("--usage", "Show model provider usage/quota snapshots", false).option("--deep", "Probe channels (WhatsApp Web + Telegram + Discord + Slack + Signal)", false).option("--timeout <ms>", "Probe timeout in milliseconds", "10000").option("--verbose", "Verbose logging", false).option("--debug", "Alias for --verbose", false).addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw status", "Show channel health + session summary."],
		["openclaw status --all", "Full diagnosis (read-only)."],
		["openclaw status --json", "Machine-readable output."],
		["openclaw status --usage", "Show model provider usage/quota snapshots."],
		["openclaw status --deep", "Run channel probes (WA + Telegram + Discord + Slack + Signal)."],
		["openclaw status --deep --timeout 5000", "Tighten probe timeout."]
	])}`).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/status", "docs.openclaw.ai/cli/status")}\n`).action(async (opts) => {
		const verbose = resolveVerbose(opts);
		setVerbose(verbose);
		const timeout = parseTimeoutMs(opts.timeout);
		if (timeout === null) return;
		await runCommandWithRuntime(defaultRuntime, async () => {
			await statusCommand({
				json: Boolean(opts.json),
				all: Boolean(opts.all),
				deep: Boolean(opts.deep),
				usage: Boolean(opts.usage),
				timeoutMs: timeout,
				verbose
			}, defaultRuntime);
		});
	});
	program.command("health").description("Fetch health from the running gateway").option("--json", "Output JSON instead of text", false).option("--timeout <ms>", "Connection timeout in milliseconds", "10000").option("--verbose", "Verbose logging", false).option("--debug", "Alias for --verbose", false).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/health", "docs.openclaw.ai/cli/health")}\n`).action(async (opts) => {
		const verbose = resolveVerbose(opts);
		setVerbose(verbose);
		const timeout = parseTimeoutMs(opts.timeout);
		if (timeout === null) return;
		await runCommandWithRuntime(defaultRuntime, async () => {
			await healthCommand({
				json: Boolean(opts.json),
				timeoutMs: timeout,
				verbose
			}, defaultRuntime);
		});
	});
	program.command("sessions").description("List stored conversation sessions").option("--json", "Output as JSON", false).option("--verbose", "Verbose logging", false).option("--store <path>", "Path to session store (default: resolved from config)").option("--active <minutes>", "Only show sessions updated within the past N minutes").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw sessions", "List all sessions."],
		["openclaw sessions --active 120", "Only last 2 hours."],
		["openclaw sessions --json", "Machine-readable output."],
		["openclaw sessions --store ./tmp/sessions.json", "Use a specific session store."]
	])}\n\n${theme.muted("Shows token usage per session when the agent reports it; set agents.defaults.contextTokens to cap the window and show %.")}`).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/sessions", "docs.openclaw.ai/cli/sessions")}\n`).action(async (opts) => {
		setVerbose(Boolean(opts.verbose));
		await sessionsCommand({
			json: Boolean(opts.json),
			store: opts.store,
			active: opts.active
		}, defaultRuntime);
	});
}

//#endregion
//#region src/cli/program/command-registry.ts
const commandRegistry = [
	{
		id: "setup",
		register: ({ program }) => registerSetupCommand(program)
	},
	{
		id: "onboard",
		register: ({ program }) => registerOnboardCommand(program)
	},
	{
		id: "configure",
		register: ({ program }) => registerConfigureCommand(program)
	},
	{
		id: "config",
		register: ({ program }) => registerConfigCli(program)
	},
	{
		id: "maintenance",
		register: ({ program }) => registerMaintenanceCommands(program)
	},
	{
		id: "message",
		register: ({ program, ctx }) => registerMessageCommands(program, ctx)
	},
	{
		id: "memory",
		register: ({ program }) => registerMemoryCli(program)
	},
	{
		id: "agent",
		register: ({ program, ctx }) => registerAgentCommands(program, { agentChannelOptions: ctx.agentChannelOptions })
	},
	{
		id: "subclis",
		register: ({ program, argv }) => registerSubCliCommands(program, argv)
	},
	{
		id: "status-health-sessions",
		register: ({ program }) => registerStatusHealthSessionsCommands(program)
	},
	{
		id: "browser",
		register: ({ program }) => registerBrowserCli(program)
	}
];
function registerProgramCommands(program, ctx, argv = process.argv) {
	for (const entry of commandRegistry) entry.register({
		program,
		ctx,
		argv
	});
}

//#endregion
//#region src/cli/program/context.ts
function createProgramContext() {
	const channelOptions = resolveCliChannelOptions();
	return {
		programVersion: VERSION,
		channelOptions,
		messageChannelOptions: channelOptions.join("|"),
		agentChannelOptions: ["last", ...channelOptions].join("|")
	};
}

//#endregion
//#region src/cli/tagline.ts
const DEFAULT_TAGLINE = "All your chats, one OpenClaw.";
const HOLIDAY_TAGLINES = {
	newYear: "New Year's Day: New year, new config—same old EADDRINUSE, but this time we resolve it like grown-ups.",
	lunarNewYear: "Lunar New Year: May your builds be lucky, your branches prosperous, and your merge conflicts chased away with fireworks.",
	christmas: "Christmas: Ho ho ho—Santa's little claw-sistant is here to ship joy, roll back chaos, and stash the keys safely.",
	eid: "Eid al-Fitr: Celebration mode: queues cleared, tasks completed, and good vibes committed to main with clean history.",
	diwali: "Diwali: Let the logs sparkle and the bugs flee—today we light up the terminal and ship with pride.",
	easter: "Easter: I found your missing environment variable—consider it a tiny CLI egg hunt with fewer jellybeans.",
	hanukkah: "Hanukkah: Eight nights, eight retries, zero shame—may your gateway stay lit and your deployments stay peaceful.",
	halloween: "Halloween: Spooky season: beware haunted dependencies, cursed caches, and the ghost of node_modules past.",
	thanksgiving: "Thanksgiving: Grateful for stable ports, working DNS, and a bot that reads the logs so nobody has to.",
	valentines: "Valentine's Day: Roses are typed, violets are piped—I'll automate the chores so you can spend time with humans."
};
const TAGLINES = [
	"Your terminal just grew claws—type something and let the bot pinch the busywork.",
	"Welcome to the command line: where dreams compile and confidence segfaults.",
	"I run on caffeine, JSON5, and the audacity of \"it worked on my machine.\"",
	"Gateway online—please keep hands, feet, and appendages inside the shell at all times.",
	"I speak fluent bash, mild sarcasm, and aggressive tab-completion energy.",
	"One CLI to rule them all, and one more restart because you changed the port.",
	"If it works, it's automation; if it breaks, it's a \"learning opportunity.\"",
	"Pairing codes exist because even bots believe in consent—and good security hygiene.",
	"Your .env is showing; don't worry, I'll pretend I didn't see it.",
	"I'll do the boring stuff while you dramatically stare at the logs like it's cinema.",
	"I'm not saying your workflow is chaotic... I'm just bringing a linter and a helmet.",
	"Type the command with confidence—nature will provide the stack trace if needed.",
	"I don't judge, but your missing API keys are absolutely judging you.",
	"I can grep it, git blame it, and gently roast it—pick your coping mechanism.",
	"Hot reload for config, cold sweat for deploys.",
	"I'm the assistant your terminal demanded, not the one your sleep schedule requested.",
	"I keep secrets like a vault... unless you print them in debug logs again.",
	"Automation with claws: minimal fuss, maximal pinch.",
	"I'm basically a Swiss Army knife, but with more opinions and fewer sharp edges.",
	"If you're lost, run doctor; if you're brave, run prod; if you're wise, run tests.",
	"Your task has been queued; your dignity has been deprecated.",
	"I can't fix your code taste, but I can fix your build and your backlog.",
	"I'm not magic—I'm just extremely persistent with retries and coping strategies.",
	"It's not \"failing,\" it's \"discovering new ways to configure the same thing wrong.\"",
	"Give me a workspace and I'll give you fewer tabs, fewer toggles, and more oxygen.",
	"I read logs so you can keep pretending you don't have to.",
	"If something's on fire, I can't extinguish it—but I can write a beautiful postmortem.",
	"I'll refactor your busywork like it owes me money.",
	"Say \"stop\" and I'll stop—say \"ship\" and we'll both learn a lesson.",
	"I'm the reason your shell history looks like a hacker-movie montage.",
	"I'm like tmux: confusing at first, then suddenly you can't live without me.",
	"I can run local, remote, or purely on vibes—results may vary with DNS.",
	"If you can describe it, I can probably automate it—or at least make it funnier.",
	"Your config is valid, your assumptions are not.",
	"I don't just autocomplete—I auto-commit (emotionally), then ask you to review (logically).",
	"Less clicking, more shipping, fewer \"where did that file go\" moments.",
	"Claws out, commit in—let's ship something mildly responsible.",
	"I'll butter your workflow like a lobster roll: messy, delicious, effective.",
	"Shell yeah—I'm here to pinch the toil and leave you the glory.",
	"If it's repetitive, I'll automate it; if it's hard, I'll bring jokes and a rollback plan.",
	"Because texting yourself reminders is so 2024.",
	"Your inbox, your infra, your rules.",
	"Turning \"I'll reply later\" into \"my bot replied instantly\".",
	"The only crab in your contacts you actually want to hear from. 🦞",
	"Chat automation for people who peaked at IRC.",
	"Because Siri wasn't answering at 3AM.",
	"IPC, but it's your phone.",
	"The UNIX philosophy meets your DMs.",
	"curl for conversations.",
	"Less middlemen, more messages.",
	"Ship fast, log faster.",
	"End-to-end encrypted, drama-to-drama excluded.",
	"The only bot that stays out of your training set.",
	"WhatsApp automation without the \"please accept our new privacy policy\".",
	"Chat APIs that don't require a Senate hearing.",
	"Meta wishes they shipped this fast.",
	"Because the right answer is usually a script.",
	"Your messages, your servers, your control.",
	"OpenAI-compatible, not OpenAI-dependent.",
	"iMessage green bubble energy, but for everyone.",
	"Siri's competent cousin.",
	"Works on Android. Crazy concept, we know.",
	"No $999 stand required.",
	"We ship features faster than Apple ships calculator updates.",
	"Your AI assistant, now without the $3,499 headset.",
	"Think different. Actually think.",
	"Ah, the fruit tree company! 🍎",
	"Greetings, Professor Falken",
	HOLIDAY_TAGLINES.newYear,
	HOLIDAY_TAGLINES.lunarNewYear,
	HOLIDAY_TAGLINES.christmas,
	HOLIDAY_TAGLINES.eid,
	HOLIDAY_TAGLINES.diwali,
	HOLIDAY_TAGLINES.easter,
	HOLIDAY_TAGLINES.hanukkah,
	HOLIDAY_TAGLINES.halloween,
	HOLIDAY_TAGLINES.thanksgiving,
	HOLIDAY_TAGLINES.valentines
];
const DAY_MS = 1440 * 60 * 1e3;
function utcParts(date) {
	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth(),
		day: date.getUTCDate()
	};
}
const onMonthDay = (month, day) => (date) => {
	const parts = utcParts(date);
	return parts.month === month && parts.day === day;
};
const onSpecificDates = (dates, durationDays = 1) => (date) => {
	const parts = utcParts(date);
	return dates.some(([year, month, day]) => {
		if (parts.year !== year) return false;
		const start = Date.UTC(year, month, day);
		const current = Date.UTC(parts.year, parts.month, parts.day);
		return current >= start && current < start + durationDays * DAY_MS;
	});
};
const inYearWindow = (windows) => (date) => {
	const parts = utcParts(date);
	const window = windows.find((entry) => entry.year === parts.year);
	if (!window) return false;
	const start = Date.UTC(window.year, window.month, window.day);
	const current = Date.UTC(parts.year, parts.month, parts.day);
	return current >= start && current < start + window.duration * DAY_MS;
};
const isFourthThursdayOfNovember = (date) => {
	const parts = utcParts(date);
	if (parts.month !== 10) return false;
	const fourthThursday = 1 + (4 - new Date(Date.UTC(parts.year, 10, 1)).getUTCDay() + 7) % 7 + 21;
	return parts.day === fourthThursday;
};
const HOLIDAY_RULES = new Map([
	[HOLIDAY_TAGLINES.newYear, onMonthDay(0, 1)],
	[HOLIDAY_TAGLINES.lunarNewYear, onSpecificDates([
		[
			2025,
			0,
			29
		],
		[
			2026,
			1,
			17
		],
		[
			2027,
			1,
			6
		]
	], 1)],
	[HOLIDAY_TAGLINES.eid, onSpecificDates([
		[
			2025,
			2,
			30
		],
		[
			2025,
			2,
			31
		],
		[
			2026,
			2,
			20
		],
		[
			2027,
			2,
			10
		]
	], 1)],
	[HOLIDAY_TAGLINES.diwali, onSpecificDates([
		[
			2025,
			9,
			20
		],
		[
			2026,
			10,
			8
		],
		[
			2027,
			9,
			28
		]
	], 1)],
	[HOLIDAY_TAGLINES.easter, onSpecificDates([
		[
			2025,
			3,
			20
		],
		[
			2026,
			3,
			5
		],
		[
			2027,
			2,
			28
		]
	], 1)],
	[HOLIDAY_TAGLINES.hanukkah, inYearWindow([
		{
			year: 2025,
			month: 11,
			day: 15,
			duration: 8
		},
		{
			year: 2026,
			month: 11,
			day: 5,
			duration: 8
		},
		{
			year: 2027,
			month: 11,
			day: 25,
			duration: 8
		}
	])],
	[HOLIDAY_TAGLINES.halloween, onMonthDay(9, 31)],
	[HOLIDAY_TAGLINES.thanksgiving, isFourthThursdayOfNovember],
	[HOLIDAY_TAGLINES.valentines, onMonthDay(1, 14)],
	[HOLIDAY_TAGLINES.christmas, onMonthDay(11, 25)]
]);
function isTaglineActive(tagline, date) {
	const rule = HOLIDAY_RULES.get(tagline);
	if (!rule) return true;
	return rule(date);
}
function activeTaglines(options = {}) {
	if (TAGLINES.length === 0) return [DEFAULT_TAGLINE];
	const today = options.now ? options.now() : /* @__PURE__ */ new Date();
	const filtered = TAGLINES.filter((tagline) => isTaglineActive(tagline, today));
	return filtered.length > 0 ? filtered : TAGLINES;
}
function pickTagline(options = {}) {
	const override = (options.env ?? process.env)?.OPENCLAW_TAGLINE_INDEX;
	if (override !== void 0) {
		const parsed = Number.parseInt(override, 10);
		if (!Number.isNaN(parsed) && parsed >= 0) {
			const pool = TAGLINES.length > 0 ? TAGLINES : [DEFAULT_TAGLINE];
			return pool[parsed % pool.length];
		}
	}
	const pool = activeTaglines(options);
	const rand = options.random ?? Math.random;
	return pool[Math.floor(rand() * pool.length) % pool.length];
}

//#endregion
//#region src/cli/banner.ts
let bannerEmitted = false;
const graphemeSegmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : null;
const hasJsonFlag = (argv) => argv.some((arg) => arg === "--json" || arg.startsWith("--json="));
const hasVersionFlag = (argv) => argv.some((arg) => arg === "--version" || arg === "-V" || arg === "-v");
function formatCliBannerLine(version, options = {}) {
	const commitLabel = options.commit ?? resolveCommitHash({ env: options.env }) ?? "unknown";
	const tagline = pickTagline(options);
	const rich = options.richTty ?? isRich();
	const title = "🦞 OpenClaw";
	const columns = options.columns ?? process.stdout.columns ?? 120;
	const plainFullLine = `${title} ${version} (${commitLabel}) — ${tagline}`;
	const fitsOnOneLine = visibleWidth(plainFullLine) <= columns;
	if (rich) {
		if (fitsOnOneLine) return `${theme.heading(title)} ${theme.info(version)} ${theme.muted(`(${commitLabel})`)} ${theme.muted("—")} ${theme.accentDim(tagline)}`;
		return `${`${theme.heading(title)} ${theme.info(version)} ${theme.muted(`(${commitLabel})`)}`}\n${`${" ".repeat(3)}${theme.accentDim(tagline)}`}`;
	}
	if (fitsOnOneLine) return plainFullLine;
	return `${`${title} ${version} (${commitLabel})`}\n${`${" ".repeat(3)}${tagline}`}`;
}
function emitCliBanner(version, options = {}) {
	if (bannerEmitted) return;
	const argv = options.argv ?? process.argv;
	if (!process.stdout.isTTY) return;
	if (hasJsonFlag(argv)) return;
	if (hasVersionFlag(argv)) return;
	const line = formatCliBannerLine(version, options);
	process.stdout.write(`\n${line}\n\n`);
	bannerEmitted = true;
}
function hasEmittedCliBanner() {
	return bannerEmitted;
}

//#endregion
//#region src/cli/program/help.ts
const CLI_NAME = resolveCliName();
const EXAMPLES = [
	["openclaw channels login --verbose", "Link personal WhatsApp Web and show QR + connection logs."],
	["openclaw message send --target +15555550123 --message \"Hi\" --json", "Send via your web session and print JSON result."],
	["openclaw gateway --port 18789", "Run the WebSocket Gateway locally."],
	["openclaw --dev gateway", "Run a dev Gateway (isolated state/config) on ws://127.0.0.1:19001."],
	["openclaw gateway --force", "Kill anything bound to the default gateway port, then start it."],
	["openclaw gateway ...", "Gateway control via WebSocket."],
	["openclaw agent --to +15555550123 --message \"Run summary\" --deliver", "Talk directly to the agent using the Gateway; optionally send the WhatsApp reply."],
	["openclaw message send --channel telegram --target @mychat --message \"Hi\"", "Send via your Telegram bot."]
];
function configureProgramHelp(program, ctx) {
	program.name(CLI_NAME).description("").version(ctx.programVersion).option("--dev", "Dev profile: isolate state under ~/.openclaw-dev, default gateway port 19001, and shift derived ports (browser/canvas)").option("--profile <name>", "Use a named profile (isolates OPENCLAW_STATE_DIR/OPENCLAW_CONFIG_PATH under ~/.openclaw-<name>)");
	program.option("--no-color", "Disable ANSI colors", false);
	program.configureHelp({
		sortSubcommands: true,
		sortOptions: true,
		optionTerm: (option) => theme.option(option.flags),
		subcommandTerm: (cmd) => theme.command(cmd.name())
	});
	program.configureOutput({
		writeOut: (str) => {
			const colored = str.replace(/^Usage:/gm, theme.heading("Usage:")).replace(/^Options:/gm, theme.heading("Options:")).replace(/^Commands:/gm, theme.heading("Commands:"));
			process.stdout.write(colored);
		},
		writeErr: (str) => process.stderr.write(str),
		outputError: (str, write) => write(theme.error(str))
	});
	if (process.argv.includes("-V") || process.argv.includes("--version") || process.argv.includes("-v")) {
		console.log(ctx.programVersion);
		process.exit(0);
	}
	program.addHelpText("beforeAll", () => {
		if (hasEmittedCliBanner()) return "";
		const rich = isRich();
		return `\n${formatCliBannerLine(ctx.programVersion, { richTty: rich })}\n`;
	});
	const fmtExamples = EXAMPLES.map(([cmd, desc]) => `  ${theme.command(replaceCliName(cmd, CLI_NAME))}\n    ${theme.muted(desc)}`).join("\n");
	program.addHelpText("afterAll", ({ command }) => {
		if (command !== program) return "";
		const docs = formatDocsLink("/cli", "docs.openclaw.ai/cli");
		return `\n${theme.heading("Examples:")}\n${fmtExamples}\n\n${theme.muted("Docs:")} ${docs}\n`;
	});
}

//#endregion
//#region src/cli/program/config-guard.ts
const ALLOWED_INVALID_COMMANDS = new Set([
	"doctor",
	"logs",
	"health",
	"help",
	"status"
]);
const ALLOWED_INVALID_GATEWAY_SUBCOMMANDS = new Set([
	"status",
	"probe",
	"health",
	"discover",
	"call",
	"install",
	"uninstall",
	"start",
	"stop",
	"restart"
]);
let didRunDoctorConfigFlow = false;
function formatConfigIssues(issues) {
	return issues.map((issue) => `- ${issue.path || "<root>"}: ${issue.message}`);
}
async function ensureConfigReady(params) {
	const commandPath = params.commandPath ?? [];
	if (!didRunDoctorConfigFlow && shouldMigrateStateFromPath(commandPath)) {
		didRunDoctorConfigFlow = true;
		await loadAndMaybeMigrateDoctorConfig({
			options: { nonInteractive: true },
			confirm: async () => false
		});
	}
	const snapshot = await readConfigFileSnapshot();
	const commandName = commandPath[0];
	const subcommandName = commandPath[1];
	const allowInvalid = commandName ? ALLOWED_INVALID_COMMANDS.has(commandName) || commandName === "gateway" && subcommandName && ALLOWED_INVALID_GATEWAY_SUBCOMMANDS.has(subcommandName) : false;
	const issues = snapshot.exists && !snapshot.valid ? formatConfigIssues(snapshot.issues) : [];
	const legacyIssues = snapshot.legacyIssues.length > 0 ? snapshot.legacyIssues.map((issue) => `- ${issue.path}: ${issue.message}`) : [];
	if (!(snapshot.exists && !snapshot.valid)) return;
	const rich = isRich();
	const muted = (value) => colorize(rich, theme.muted, value);
	const error = (value) => colorize(rich, theme.error, value);
	const heading = (value) => colorize(rich, theme.heading, value);
	const commandText = (value) => colorize(rich, theme.command, value);
	params.runtime.error(heading("Config invalid"));
	params.runtime.error(`${muted("File:")} ${muted(shortenHomePath(snapshot.path))}`);
	if (issues.length > 0) {
		params.runtime.error(muted("Problem:"));
		params.runtime.error(issues.map((issue) => `  ${error(issue)}`).join("\n"));
	}
	if (legacyIssues.length > 0) {
		params.runtime.error(muted("Legacy config keys detected:"));
		params.runtime.error(legacyIssues.map((issue) => `  ${error(issue)}`).join("\n"));
	}
	params.runtime.error("");
	params.runtime.error(`${muted("Run:")} ${commandText(formatCliCommand("openclaw doctor --fix"))}`);
	if (!allowInvalid) params.runtime.exit(1);
}

//#endregion
//#region src/cli/program/preaction.ts
function setProcessTitleForCommand(actionCommand) {
	let current = actionCommand;
	while (current.parent && current.parent.parent) current = current.parent;
	const name = current.name();
	const cliName = resolveCliName();
	if (!name || name === cliName) return;
	process.title = `${cliName}-${name}`;
}
const PLUGIN_REQUIRED_COMMANDS = new Set([
	"message",
	"channels",
	"directory"
]);
function registerPreActionHooks(program, programVersion) {
	program.hook("preAction", async (_thisCommand, actionCommand) => {
		setProcessTitleForCommand(actionCommand);
		const argv = process.argv;
		if (hasHelpOrVersion(argv)) return;
		const commandPath = getCommandPath(argv, 2);
		if (!(isTruthyEnvValue(process.env.OPENCLAW_HIDE_BANNER) || commandPath[0] === "update" || commandPath[0] === "completion" || commandPath[0] === "plugins" && commandPath[1] === "update")) emitCliBanner(programVersion);
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		setVerbose(verbose);
		if (!verbose) process.env.NODE_NO_WARNINGS ??= "1";
		if (commandPath[0] === "doctor" || commandPath[0] === "completion") return;
		await ensureConfigReady({
			runtime: defaultRuntime,
			commandPath
		});
		if (PLUGIN_REQUIRED_COMMANDS.has(commandPath[0])) ensurePluginRegistryLoaded();
	});
}

//#endregion
//#region src/cli/program/build-program.ts
function buildProgram() {
	const program = new Command();
	const ctx = createProgramContext();
	const argv = process.argv;
	configureProgramHelp(program, ctx);
	registerPreActionHooks(program, ctx.programVersion);
	registerProgramCommands(program, ctx, argv);
	return program;
}

//#endregion
//#region src/index.ts
loadDotEnv({ quiet: true });
normalizeEnv();
ensureOpenClawCliOnPath();
enableConsoleCapture();
assertSupportedRuntime();
const program = buildProgram();
if (isMainModule({ currentFile: fileURLToPath(import.meta.url) })) {
	installUnhandledRejectionHandler();
	process$1.on("uncaughtException", (error) => {
		console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
		process$1.exit(1);
	});
	program.parseAsync(process$1.argv).catch((err) => {
		console.error("[openclaw] CLI failed:", formatUncaughtError(err));
		process$1.exit(1);
	});
}

//#endregion
export { PortInUseError, applyTemplate, assertWebChannel, createDefaultDeps, deriveSessionKey, describePortOwner, ensureBinary, ensurePortAvailable, getReplyFromConfig, handlePortError, loadConfig, loadSessionStore, monitorWebChannel, normalizeE164, promptYesNo, resolveSessionKey, resolveStorePath, runCommandWithTimeout, runExec, saveSessionStore, toWhatsappJid, waitForever };