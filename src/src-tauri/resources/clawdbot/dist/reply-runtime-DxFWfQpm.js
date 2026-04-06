import { g as resolveDefaultModelForAgent } from "./model-selection-8a6zD_aX.js";
import { r as logVerbose } from "./globals-BJZkpw-q.js";
import "./tokens-Bot0VGKf.js";
import "./heartbeat-CguHGkad.js";
import { t as requireApiKey } from "./model-auth-runtime-shared-DSbChRle.js";
import { r as getApiKeyForModel } from "./model-auth-BxuwOp1l.js";
import "./chunk-D6CtZg6q.js";
import { r as resolveModelAsync } from "./anthropic-vertex-stream-DeiIH5Mp.js";
import "./dispatch-C2z_6KF9.js";
import "./provider-dispatcher-B2dh4tuq.js";
import "./reply-BilMVRVo.js";
import "./abort-CNknHetJ.js";
import "./btw-command-BCEsTWw2.js";
import { t as prepareModelForSimpleCompletion } from "./simple-completion-transport-BK70SV4M.js";
import { completeSimple } from "@mariozechner/pi-ai";
//#region src/auto-reply/reply/reply-reference.ts
function createReplyReferencePlanner(options) {
	let hasReplied = options.hasReplied ?? false;
	const allowReference = options.allowReference !== false;
	const existingId = options.existingId?.trim();
	const startId = options.startId?.trim();
	const use = () => {
		if (!allowReference) return;
		if (options.replyToMode === "off") return;
		const id = existingId ?? startId;
		if (!id) return;
		if (options.replyToMode === "all") {
			hasReplied = true;
			return id;
		}
		if (!hasReplied) {
			hasReplied = true;
			return id;
		}
	};
	const markSent = () => {
		hasReplied = true;
	};
	return {
		use,
		markSent,
		hasReplied: () => hasReplied
	};
}
//#endregion
//#region src/auto-reply/reply/auto-topic-label-config.ts
const AUTO_TOPIC_LABEL_DEFAULT_PROMPT = "Generate a very short topic label (2-4 words, max 25 chars) for a chat conversation based on the user's first message below. No emoji. Use the same language as the message. Be concise and descriptive. Return ONLY the topic name, nothing else.";
/**
* Resolve whether auto topic labeling is enabled and get the prompt.
* Returns null if disabled.
*/
function resolveAutoTopicLabelConfig(directConfig, accountConfig) {
	const config = directConfig ?? accountConfig;
	if (config === void 0 || config === true) return {
		enabled: true,
		prompt: AUTO_TOPIC_LABEL_DEFAULT_PROMPT
	};
	if (config === false) return null;
	if (config.enabled === false) return null;
	return {
		enabled: true,
		prompt: config.prompt?.trim() || "Generate a very short topic label (2-4 words, max 25 chars) for a chat conversation based on the user's first message below. No emoji. Use the same language as the message. Be concise and descriptive. Return ONLY the topic name, nothing else."
	};
}
//#endregion
//#region src/auto-reply/reply/auto-topic-label.ts
/**
* Auto-rename Telegram DM forum topics on first message using LLM.
*
* This module provides LLM-based label generation.
* Config resolution is in auto-topic-label-config.ts (lightweight, testable).
* The actual topic rename call is channel-specific and handled by the caller.
*/
const MAX_LABEL_LENGTH = 128;
const TIMEOUT_MS = 15e3;
function isTextContentBlock(block) {
	return block.type === "text";
}
/**
* Generate a topic label using LLM.
* Returns the generated label or null on failure.
*/
async function generateTopicLabel(params) {
	const { userMessage, prompt, cfg, agentId, agentDir } = params;
	const modelRef = resolveDefaultModelForAgent({
		cfg,
		agentId
	});
	const resolved = await resolveModelAsync(modelRef.provider, modelRef.model, agentDir, cfg);
	if (!resolved.model) {
		logVerbose(`auto-topic-label: failed to resolve model ${modelRef.provider}/${modelRef.model}`);
		return null;
	}
	const completionModel = prepareModelForSimpleCompletion({
		model: resolved.model,
		cfg
	});
	const apiKey = requireApiKey(await getApiKeyForModel({
		model: completionModel,
		cfg,
		agentDir
	}), modelRef.provider);
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const text = (await completeSimple(completionModel, { messages: [{
			role: "user",
			content: `${prompt}\n\n${userMessage}`,
			timestamp: Date.now()
		}] }, {
			apiKey,
			maxTokens: 100,
			temperature: .3,
			signal: controller.signal
		})).content.filter(isTextContentBlock).map((b) => b.text).join("").trim();
		if (!text) return null;
		return text.slice(0, MAX_LABEL_LENGTH);
	} finally {
		clearTimeout(timeout);
	}
}
//#endregion
export { resolveAutoTopicLabelConfig as n, createReplyReferencePlanner as r, generateTopicLabel as t };
