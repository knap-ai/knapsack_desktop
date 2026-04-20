import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { d as ensureAgentWorkspace } from "./workspace-hhTlRYqM.js";
import { b as resolveAgentWorkspaceDir, y as resolveAgentDir } from "./agent-scope-KFH9bkHi.js";
import { x as resolveThinkingDefault } from "./model-selection-CTdyYoio.js";
import { n as resolveAgentIdentity } from "./identity-B_Q39IGW.js";
import { o as saveSessionStore } from "./store-DFXcceZJ.js";
import "./sessions-vP2E4vs-.js";
import { i as resolveSessionFilePath, u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-runner-DN0VbqlW.js";
import { t as resolveAgentTimeoutMs } from "./timeout-CxW3WOrq.js";
import "./pi-embedded-B2iivREJ.js";
//#region src/extensionAPI.ts
if (process.env.VITEST !== "true" && process.env.OPENCLAW_SUPPRESS_EXTENSION_API_WARNING !== "1") process.emitWarning("openclaw/extension-api is deprecated. Migrate to api.runtime.agent.* or focused openclaw/plugin-sdk/<subpath> imports. See https://docs.openclaw.ai/plugins/sdk-migration", {
	code: "OPENCLAW_EXTENSION_API_DEPRECATED",
	detail: "This compatibility bridge is temporary. Bundled plugins should use the injected plugin runtime instead of importing host-side agent helpers directly. Migration guide: https://docs.openclaw.ai/plugins/sdk-migration"
});
//#endregion
export { DEFAULT_MODEL, DEFAULT_PROVIDER, ensureAgentWorkspace, loadSessionStore, resolveAgentDir, resolveAgentIdentity, resolveAgentTimeoutMs, resolveAgentWorkspaceDir, resolveSessionFilePath, resolveStorePath, resolveThinkingDefault, runEmbeddedPiAgent, saveSessionStore };
