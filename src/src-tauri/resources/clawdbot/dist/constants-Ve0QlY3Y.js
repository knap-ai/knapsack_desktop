import { t as CHANNEL_IDS } from "./ids-2bZIXJNM.js";
import { r as STATE_DIR } from "./paths-BG0ad0P6.js";
import path from "node:path";
//#region src/agents/sandbox/constants.ts
const DEFAULT_SANDBOX_WORKSPACE_ROOT = path.join(STATE_DIR, "sandboxes");
const DEFAULT_SANDBOX_IMAGE = "openclaw-sandbox:bookworm-slim";
const DEFAULT_SANDBOX_CONTAINER_PREFIX = "openclaw-sbx-";
const DEFAULT_SANDBOX_WORKDIR = "/workspace";
const DEFAULT_TOOL_ALLOW = [
	"exec",
	"process",
	"read",
	"write",
	"edit",
	"apply_patch",
	"image",
	"sessions_list",
	"sessions_history",
	"sessions_send",
	"sessions_spawn",
	"sessions_yield",
	"subagents",
	"session_status"
];
const DEFAULT_TOOL_DENY = [
	"browser",
	"canvas",
	"nodes",
	"cron",
	"gateway",
	...CHANNEL_IDS
];
const DEFAULT_SANDBOX_BROWSER_IMAGE = "openclaw-sandbox-browser:bookworm-slim";
const DEFAULT_SANDBOX_COMMON_IMAGE = "openclaw-sandbox-common:bookworm-slim";
const SANDBOX_BROWSER_SECURITY_HASH_EPOCH = "2026-04-05-cdp-source-range";
const DEFAULT_SANDBOX_BROWSER_PREFIX = "openclaw-sbx-browser-";
const DEFAULT_SANDBOX_BROWSER_NETWORK = "openclaw-sandbox-browser";
const DEFAULT_SANDBOX_BROWSER_CDP_PORT = 9222;
const DEFAULT_SANDBOX_BROWSER_VNC_PORT = 5900;
const DEFAULT_SANDBOX_BROWSER_NOVNC_PORT = 6080;
const DEFAULT_SANDBOX_BROWSER_AUTOSTART_TIMEOUT_MS = 12e3;
const SANDBOX_AGENT_WORKSPACE_MOUNT = "/agent";
const SANDBOX_STATE_DIR = path.join(STATE_DIR, "sandbox");
const SANDBOX_REGISTRY_PATH = path.join(SANDBOX_STATE_DIR, "containers.json");
const SANDBOX_BROWSER_REGISTRY_PATH = path.join(SANDBOX_STATE_DIR, "browsers.json");
//#endregion
export { SANDBOX_BROWSER_SECURITY_HASH_EPOCH as _, DEFAULT_SANDBOX_BROWSER_NOVNC_PORT as a, DEFAULT_SANDBOX_COMMON_IMAGE as c, DEFAULT_SANDBOX_WORKDIR as d, DEFAULT_SANDBOX_WORKSPACE_ROOT as f, SANDBOX_BROWSER_REGISTRY_PATH as g, SANDBOX_AGENT_WORKSPACE_MOUNT as h, DEFAULT_SANDBOX_BROWSER_NETWORK as i, DEFAULT_SANDBOX_CONTAINER_PREFIX as l, DEFAULT_TOOL_DENY as m, DEFAULT_SANDBOX_BROWSER_CDP_PORT as n, DEFAULT_SANDBOX_BROWSER_PREFIX as o, DEFAULT_TOOL_ALLOW as p, DEFAULT_SANDBOX_BROWSER_IMAGE as r, DEFAULT_SANDBOX_BROWSER_VNC_PORT as s, DEFAULT_SANDBOX_BROWSER_AUTOSTART_TIMEOUT_MS as t, DEFAULT_SANDBOX_IMAGE as u, SANDBOX_REGISTRY_PATH as v };
