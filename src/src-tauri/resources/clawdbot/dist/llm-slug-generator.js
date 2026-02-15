import "./paths-BZtyHNCi.js";
import "./workspace-CUznpDHg.js";
import "./exec-DBtWJ4Ld.js";
import { c as resolveDefaultAgentId, r as resolveAgentDir, s as resolveAgentWorkspaceDir } from "./agent-scope-xZu8sXcF.js";
import "./deliver-aThCVOeQ.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-D69Ciu0d.js";
import "./image-ops-CQkyIkuI.js";
import "./boolean-Bb19hm9Y.js";
import "./model-auth-BffKC6OJ.js";
import "./config-DAGaFnCt.js";
import "./send-oeFwp37b.js";
import "./send-Cv6A4K4k.js";
import "./send-BWIKm-Ci.js";
import "./github-copilot-token-BRNzgUa_.js";
import "./pi-model-discovery-Cexg1XRf.js";
import "./pi-embedded-helpers-mrBZwZ9b.js";
import "./chrome-DdEflVKx.js";
import "./frontmatter-Uu27Y56g.js";
import "./store-l7p5BQMc.js";
import "./paths-CpGplyYJ.js";
import "./tool-images-BVaD9DCP.js";
import "./image-CZapiPj9.js";
import "./manager-TKJUwtha.js";
import "./sqlite-Dashr12i.js";
import "./retry-BhlI4gtw.js";
import "./redact-DcuzVizL.js";
import "./common-fdrT4FYK.js";
import "./ir-XjRYsEjJ.js";
import "./fetch-BUVoWGPC.js";
import "./render-CiikiGbn.js";
import "./runner-C0QyHqy1.js";
import "./send-B9PAu0LZ.js";
import "./send-CV8EAKqp.js";
import "./channel-activity-BHDtnoEK.js";
import "./tables-BY2rftQn.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/llm-slug-generator.ts
/**
* LLM-based slug generator for session memory filenames
*/
/**
* Generate a short 1-2 word filename slug from session content using LLM
*/
async function generateSlugViaLLM(params) {
	let tempSessionFile = null;
	try {
		const agentId = resolveDefaultAgentId(params.cfg);
		const workspaceDir = resolveAgentWorkspaceDir(params.cfg, agentId);
		const agentDir = resolveAgentDir(params.cfg, agentId);
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-slug-"));
		tempSessionFile = path.join(tempDir, "session.jsonl");
		const prompt = `Based on this conversation, generate a short 1-2 word filename slug (lowercase, hyphen-separated, no file extension).

Conversation summary:
${params.sessionContent.slice(0, 2e3)}

Reply with ONLY the slug, nothing else. Examples: "vendor-pitch", "api-design", "bug-fix"`;
		const result = await runEmbeddedPiAgent({
			sessionId: `slug-generator-${Date.now()}`,
			sessionKey: "temp:slug-generator",
			agentId,
			sessionFile: tempSessionFile,
			workspaceDir,
			agentDir,
			config: params.cfg,
			prompt,
			timeoutMs: 15e3,
			runId: `slug-gen-${Date.now()}`
		});
		if (result.payloads && result.payloads.length > 0) {
			const text = result.payloads[0]?.text;
			if (text) return text.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || null;
		}
		return null;
	} catch (err) {
		console.error("[llm-slug-generator] Failed to generate slug:", err);
		return null;
	} finally {
		if (tempSessionFile) try {
			await fs.rm(path.dirname(tempSessionFile), {
				recursive: true,
				force: true
			});
		} catch {}
	}
}

//#endregion
export { generateSlugViaLLM };