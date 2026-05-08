import { b as resolveAgentDir, x as resolveAgentWorkspaceDir } from "./agent-scope-i10se9ty.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-CRz26M83.js";
import { p as resolveThinkingDefault } from "./model-selection-GlsOqTDm.js";
import { n as resolveAgentIdentity } from "./identity-CviweAtG.js";
import { i as resolveSessionFilePath, u as resolveStorePath } from "./paths-CHP3g1Fg.js";
import { t as loadSessionStore } from "./store-load-DLuD4etm.js";
import { i as saveSessionStore } from "./store-CR7YmZjp.js";
import "./sessions-CLHVJJOI.js";
import { l as ensureAgentWorkspace } from "./workspace-Ddypv-c6.js";
import { t as resolveAgentTimeoutMs } from "./timeout-DEUZP4Cb.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-aAN5CWPb.js";
//#region src/extensionAPI.ts
if (process.env.VITEST !== "true" && process.env.OPENCLAW_SUPPRESS_EXTENSION_API_WARNING !== "1") process.emitWarning("openclaw/extension-api is deprecated. Migrate to api.runtime.agent.* or focused openclaw/plugin-sdk/<subpath> imports. See https://docs.openclaw.ai/plugins/sdk-migration", {
	code: "OPENCLAW_EXTENSION_API_DEPRECATED",
	detail: "This compatibility bridge is temporary. Bundled plugins should use the injected plugin runtime instead of importing host-side agent helpers directly. Migration guide: https://docs.openclaw.ai/plugins/sdk-migration"
});
//#endregion
export { DEFAULT_MODEL, DEFAULT_PROVIDER, ensureAgentWorkspace, loadSessionStore, resolveAgentDir, resolveAgentIdentity, resolveAgentTimeoutMs, resolveAgentWorkspaceDir, resolveSessionFilePath, resolveStorePath, resolveThinkingDefault, runEmbeddedPiAgent, saveSessionStore };
