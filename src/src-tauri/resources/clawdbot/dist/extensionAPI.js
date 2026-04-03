import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-BwiMD7ye.js";
import { S as resolveThinkingDefault } from "./model-selection-8a6zD_aX.js";
import { a as resolveAgentDir, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { d as ensureAgentWorkspace } from "./workspace-R-NeOkBt.js";
import { i as loadSessionStore, l as saveSessionStore } from "./store-BGmy-Wot.js";
import "./sessions-DC7OiAdD.js";
import { l as resolveStorePath, r as resolveSessionFilePath } from "./paths-DBIQqSpZ.js";
import { n as resolveAgentIdentity } from "./identity-BVAU5Jb3.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-BYdcxQ5A.js";
import { n as resolveAgentTimeoutMs } from "./content-blocks-CWb2xgCb.js";
//#region src/extensionAPI.ts
if (process.env.VITEST !== "true" && process.env.OPENCLAW_SUPPRESS_EXTENSION_API_WARNING !== "1") process.emitWarning("openclaw/extension-api is deprecated. Migrate to api.runtime.agent.* or focused openclaw/plugin-sdk/<subpath> imports. See https://docs.openclaw.ai/plugins/sdk-migration", {
	code: "OPENCLAW_EXTENSION_API_DEPRECATED",
	detail: "This compatibility bridge is temporary. Bundled plugins should use the injected plugin runtime instead of importing host-side agent helpers directly. Migration guide: https://docs.openclaw.ai/plugins/sdk-migration"
});
//#endregion
export { DEFAULT_MODEL, DEFAULT_PROVIDER, ensureAgentWorkspace, loadSessionStore, resolveAgentDir, resolveAgentIdentity, resolveAgentTimeoutMs, resolveAgentWorkspaceDir, resolveSessionFilePath, resolveStorePath, resolveThinkingDefault, runEmbeddedPiAgent, saveSessionStore };
