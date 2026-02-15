import { h as defaultRuntime } from "./entry.js";
import "./auth-profiles-DnpV8DWM.js";
import { u as normalizeMainKey } from "./session-key-DVvxnFKg.js";
import "./utils-q1rHOG-N.js";
import "./exec-B52LZOrO.js";
import "./agent-scope-Bu62UIQZ.js";
import "./github-copilot-token-C4G0wDDt.js";
import "./pi-model-discovery-EhM2JAQo.js";
import { i as loadConfig } from "./config-BJWIHf6x.js";
import "./manifest-registry-DlFh5LWe.js";
import { r as normalizeChannelId } from "./plugins-DsHRVW6o.js";
import "./logging-B5vJSgy6.js";
import "./accounts-CXiTuiOz.js";
import "./send-DQh-tTYV.js";
import "./send-C34nHKc5.js";
import { S as resolveGatewaySessionStoreTarget, b as loadSessionEntry, fr as enqueueSystemEvent, mt as requestHeartbeatNow, x as pruneLegacyStoreKeys } from "./reply-DWlAlSNj.js";
import "./media-EWF5qDpT.js";
import "./message-channel-D-iPIX3C.js";
import "./render-DyRjoIgA.js";
import "./tables-DuWEJJJ_.js";
import "./image-ops-BuOO2fiP.js";
import "./fetch-CiM7YqYo.js";
import "./tool-images-Do-zTkGT.js";
import "./common-2Kd-SlSi.js";
import "./server-context-DSQVDg5o.js";
import "./chrome-Biwk6Xdw.js";
import "./auth-DaQXd14b.js";
import "./control-auth-B-AeOmM1.js";
import "./ports-C5vKQsaq.js";
import "./control-service-BWKREGJh.js";
import "./deliver-CPbyDZgw.js";
import "./pi-embedded-helpers-Bgii3Law.js";
import { l as updateSessionStore } from "./sessions-DGtM0qOW.js";
import "./runner-BY_Cu0GM.js";
import "./image-qihRjcmd.js";
import "./models-config-BUvHYVxN.js";
import "./sandbox-yPHyBnUy.js";
import "./skills-C1pxUa-I.js";
import "./routes-BpW33PMu.js";
import "./store-C2n2K571.js";
import "./paths-D9QhlJYC.js";
import "./redact-Bt-krp_b.js";
import "./tool-display-Dq-NBueh.js";
import "./context-DPQWp4WP.js";
import "./dispatcher-CLCH2DxP.js";
import "./send-C0RXgj4W.js";
import "./memory-cli-C--Zm-5F.js";
import "./manager-D5ku6Y-s.js";
import "./sqlite-hOA2wjjf.js";
import "./retry-CO00OgwL.js";
import "./commands-registry-B3DBZLId.js";
import "./client-DV6vI7ic.js";
import "./call-FZUZ5EU4.js";
import "./channel-activity-CuiCbmeL.js";
import "./send-h1nuAso5.js";
import "./links-C_tOT2wV.js";
import "./progress-C4IJwa0T.js";
import "./pairing-store-C9d3jZbc.js";
import "./pi-tools.policy-CTtzXtkF.js";
import "./send-CnpwMynh.js";
import "./onboard-helpers-HBGG6t5A.js";
import "./prompt-style-f1NZuGno.js";
import "./pairing-labels-CxEJEpbD.js";
import "./session-cost-usage-DOubaz12.js";
import "./nodes-screen-ChgT1pbh.js";
import "./channel-selection-CHRRzvpU.js";
import "./delivery-queue-BFRO68fM.js";
import { t as agentCommand } from "./agent-BHfZ5DKY.js";
import { t as formatForLog } from "./ws-log-CWGn1acA.js";
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