import "./paths-DVBShlw6.js";
import { u as defaultRuntime } from "./subsystem-QRNIBE7-.js";
import "./utils-CrauP1IK.js";
import "./pi-embedded-helpers-BMGOFUCT.js";
import { S as resolveGatewaySessionStoreTarget, b as loadSessionEntry, mt as requestHeartbeatNow, wr as enqueueSystemEvent, x as pruneLegacyStoreKeys } from "./reply-BNEkWD6b.js";
import { u as normalizeMainKey } from "./session-key-BWxPj0z_.js";
import "./exec-BDyx_yxc.js";
import "./agent-scope-DMGrQp5u.js";
import "./model-selection-D37iyQY4.js";
import "./github-copilot-token-CiF5Iyi2.js";
import "./boolean-BgXe2hyu.js";
import "./env-BSjH4KuP.js";
import { i as loadConfig } from "./config-CWifpzL_.js";
import "./manifest-registry-DFR7U7LS.js";
import { r as normalizeChannelId } from "./plugins-CLo5nH74.js";
import { l as updateSessionStore } from "./sessions-ezP1qtWM.js";
import "./runner-BDxtyEy4.js";
import "./image-w4Unf0wW.js";
import "./pi-model-discovery-EwKVHlZB.js";
import "./sandbox-BOXx_Lgl.js";
import "./chrome-CGPBw-bD.js";
import "./skills-Dj7GqTPz.js";
import "./routes-CyIJmYmu.js";
import "./server-context-DGqqHDqz.js";
import "./image-ops-DS83Z7J2.js";
import "./store-DFW2MnP3.js";
import "./ports-DAxLoOFv.js";
import "./message-channel-BA527_ar.js";
import "./logging-CcxUDNcI.js";
import "./accounts-DmCS3XF8.js";
import "./send-CUpDmT_F.js";
import "./send-C8AhSqO8.js";
import "./paths-BuQbsACT.js";
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
import "./call-i9290XP8.js";
import "./channel-activity-Ds_g7OEt.js";
import "./tables-1llcV3qs.js";
import "./send-oaAcLlhT.js";
import "./links-DKVbBuQN.js";
import "./progress-DitCFjx_.js";
import "./pairing-store-88eMFj2v.js";
import "./pi-tools.policy-BKT9HswJ.js";
import "./send-DbQ_i4Qf.js";
import "./onboard-helpers-tLA-tN_l.js";
import "./prompt-style-ciYaT-3f.js";
import "./pairing-labels-C_rjFixf.js";
import "./session-cost-usage-CbsU4YHL.js";
import "./nodes-screen-BeEWwXR4.js";
import "./auth-DT6fiHDK.js";
import "./control-auth-Drf7IiLj.js";
import "./control-service-BKUh8p7b.js";
import "./channel-selection-BN6_hiIf.js";
import "./delivery-queue-46I6nBfA.js";
import { t as agentCommand } from "./agent-CYvhbrs3.js";
import { t as formatForLog } from "./ws-log-Djujhbh-.js";
import { randomUUID } from "node:crypto";

//#region src/gateway/server-node-events.ts
const handleNodeEvent = async (ctx, nodeId, evt) => {
	switch (evt.event) {
		case "voice.transcript": {
			if (!evt.payloadJSON) return;
			let payload;
			try {
				payload = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const obj = typeof payload === "object" && payload !== null ? payload : {};
			const text = typeof obj.text === "string" ? obj.text.trim() : "";
			if (!text) return;
			if (text.length > 2e4) return;
			const sessionKeyRaw = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
			const cfg = loadConfig();
			const rawMainKey = normalizeMainKey(cfg.session?.mainKey);
			const sessionKey = sessionKeyRaw.length > 0 ? sessionKeyRaw : rawMainKey;
			const { storePath, entry, canonicalKey } = loadSessionEntry(sessionKey);
			const now = Date.now();
			const sessionId = entry?.sessionId ?? randomUUID();
			if (storePath) await updateSessionStore(storePath, (store) => {
				const target = resolveGatewaySessionStoreTarget({
					cfg,
					key: sessionKey,
					store
				});
				pruneLegacyStoreKeys({
					store,
					canonicalKey: target.canonicalKey,
					candidates: target.storeKeys
				});
				store[canonicalKey] = {
					sessionId,
					updatedAt: now,
					thinkingLevel: entry?.thinkingLevel,
					verboseLevel: entry?.verboseLevel,
					reasoningLevel: entry?.reasoningLevel,
					systemSent: entry?.systemSent,
					sendPolicy: entry?.sendPolicy,
					lastChannel: entry?.lastChannel,
					lastTo: entry?.lastTo
				};
			});
			ctx.addChatRun(sessionId, {
				sessionKey: canonicalKey,
				clientRunId: `voice-${randomUUID()}`
			});
			agentCommand({
				message: text,
				sessionId,
				sessionKey: canonicalKey,
				thinking: "low",
				deliver: false,
				messageChannel: "node"
			}, defaultRuntime, ctx.deps).catch((err) => {
				ctx.logGateway.warn(`agent failed node=${nodeId}: ${formatForLog(err)}`);
			});
			return;
		}
		case "agent.request": {
			if (!evt.payloadJSON) return;
			let link = null;
			try {
				link = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const message = (link?.message ?? "").trim();
			if (!message) return;
			if (message.length > 2e4) return;
			const channel = normalizeChannelId(typeof link?.channel === "string" ? link.channel.trim() : "") ?? void 0;
			const to = typeof link?.to === "string" && link.to.trim() ? link.to.trim() : void 0;
			const deliver = Boolean(link?.deliver) && Boolean(channel);
			const sessionKeyRaw = (link?.sessionKey ?? "").trim();
			const sessionKey = sessionKeyRaw.length > 0 ? sessionKeyRaw : `node-${nodeId}`;
			const cfg = loadConfig();
			const { storePath, entry, canonicalKey } = loadSessionEntry(sessionKey);
			const now = Date.now();
			const sessionId = entry?.sessionId ?? randomUUID();
			if (storePath) await updateSessionStore(storePath, (store) => {
				const target = resolveGatewaySessionStoreTarget({
					cfg,
					key: sessionKey,
					store
				});
				pruneLegacyStoreKeys({
					store,
					canonicalKey: target.canonicalKey,
					candidates: target.storeKeys
				});
				store[canonicalKey] = {
					sessionId,
					updatedAt: now,
					thinkingLevel: entry?.thinkingLevel,
					verboseLevel: entry?.verboseLevel,
					reasoningLevel: entry?.reasoningLevel,
					systemSent: entry?.systemSent,
					sendPolicy: entry?.sendPolicy,
					lastChannel: entry?.lastChannel,
					lastTo: entry?.lastTo
				};
			});
			agentCommand({
				message,
				sessionId,
				sessionKey: canonicalKey,
				thinking: link?.thinking ?? void 0,
				deliver,
				to,
				channel,
				timeout: typeof link?.timeoutSeconds === "number" ? link.timeoutSeconds.toString() : void 0,
				messageChannel: "node"
			}, defaultRuntime, ctx.deps).catch((err) => {
				ctx.logGateway.warn(`agent failed node=${nodeId}: ${formatForLog(err)}`);
			});
			return;
		}
		case "chat.subscribe": {
			if (!evt.payloadJSON) return;
			let payload;
			try {
				payload = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const obj = typeof payload === "object" && payload !== null ? payload : {};
			const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
			if (!sessionKey) return;
			ctx.nodeSubscribe(nodeId, sessionKey);
			return;
		}
		case "chat.unsubscribe": {
			if (!evt.payloadJSON) return;
			let payload;
			try {
				payload = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const obj = typeof payload === "object" && payload !== null ? payload : {};
			const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
			if (!sessionKey) return;
			ctx.nodeUnsubscribe(nodeId, sessionKey);
			return;
		}
		case "exec.started":
		case "exec.finished":
		case "exec.denied": {
			if (!evt.payloadJSON) return;
			let payload;
			try {
				payload = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			const obj = typeof payload === "object" && payload !== null ? payload : {};
			const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : `node-${nodeId}`;
			if (!sessionKey) return;
			const runId = typeof obj.runId === "string" ? obj.runId.trim() : "";
			const command = typeof obj.command === "string" ? obj.command.trim() : "";
			const exitCode = typeof obj.exitCode === "number" && Number.isFinite(obj.exitCode) ? obj.exitCode : void 0;
			const timedOut = obj.timedOut === true;
			const output = typeof obj.output === "string" ? obj.output.trim() : "";
			const reason = typeof obj.reason === "string" ? obj.reason.trim() : "";
			let text = "";
			if (evt.event === "exec.started") {
				text = `Exec started (node=${nodeId}${runId ? ` id=${runId}` : ""})`;
				if (command) text += `: ${command}`;
			} else if (evt.event === "exec.finished") {
				const exitLabel = timedOut ? "timeout" : `code ${exitCode ?? "?"}`;
				text = `Exec finished (node=${nodeId}${runId ? ` id=${runId}` : ""}, ${exitLabel})`;
				if (output) text += `\n${output}`;
			} else {
				text = `Exec denied (node=${nodeId}${runId ? ` id=${runId}` : ""}${reason ? `, ${reason}` : ""})`;
				if (command) text += `: ${command}`;
			}
			enqueueSystemEvent(text, {
				sessionKey,
				contextKey: runId ? `exec:${runId}` : "exec"
			});
			requestHeartbeatNow({ reason: "exec-event" });
			return;
		}
		default: return;
	}
};

//#endregion
export { handleNodeEvent };