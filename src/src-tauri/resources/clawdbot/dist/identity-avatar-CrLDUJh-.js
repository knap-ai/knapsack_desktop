import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { b as resolveAgentWorkspaceDir } from "./agent-scope-KFH9bkHi.js";
import { i as isAvatarHttpUrl, o as isPathWithinRoot, r as isAvatarDataUrl, s as isSupportedLocalAvatarExtension } from "./avatar-policy-DEMOzJv4.js";
import { n as resolveAgentIdentity } from "./identity-B_Q39IGW.js";
import { n as loadAgentIdentityFromWorkspace } from "./identity-file-DQ369w5A.js";
import fs from "node:fs";
import path from "node:path";
//#region src/agents/identity-avatar.ts
function resolveAvatarSource(cfg, agentId, opts) {
	if (opts?.includeUiOverride) {
		const fromUiConfig = normalizeOptionalString(cfg.ui?.assistant?.avatar) ?? null;
		if (fromUiConfig) return fromUiConfig;
	}
	const fromConfig = normalizeOptionalString(resolveAgentIdentity(cfg, agentId)?.avatar) ?? null;
	if (fromConfig) return fromConfig;
	return normalizeOptionalString(loadAgentIdentityFromWorkspace(resolveAgentWorkspaceDir(cfg, agentId))?.avatar) ?? null;
}
function resolveExistingPath(value) {
	try {
		return fs.realpathSync(value);
	} catch {
		return path.resolve(value);
	}
}
function resolveLocalAvatarPath(params) {
	const workspaceRoot = resolveExistingPath(params.workspaceDir);
	const raw = params.raw;
	const realPath = resolveExistingPath(raw.startsWith("~") || path.isAbsolute(raw) ? resolveUserPath(raw) : path.resolve(workspaceRoot, raw));
	if (!isPathWithinRoot(workspaceRoot, realPath)) return {
		ok: false,
		reason: "outside_workspace"
	};
	if (!isSupportedLocalAvatarExtension(realPath)) return {
		ok: false,
		reason: "unsupported_extension"
	};
	try {
		const stat = fs.statSync(realPath);
		if (!stat.isFile()) return {
			ok: false,
			reason: "missing"
		};
		if (stat.size > 2097152) return {
			ok: false,
			reason: "too_large"
		};
	} catch {
		return {
			ok: false,
			reason: "missing"
		};
	}
	return {
		ok: true,
		filePath: realPath
	};
}
function resolveAgentAvatar(cfg, agentId, opts) {
	const source = resolveAvatarSource(cfg, agentId, opts);
	if (!source) return {
		kind: "none",
		reason: "missing"
	};
	if (isAvatarHttpUrl(source)) return {
		kind: "remote",
		url: source
	};
	if (isAvatarDataUrl(source)) return {
		kind: "data",
		url: source
	};
	const resolved = resolveLocalAvatarPath({
		raw: source,
		workspaceDir: resolveAgentWorkspaceDir(cfg, agentId)
	});
	if (!resolved.ok) return {
		kind: "none",
		reason: resolved.reason
	};
	return {
		kind: "local",
		filePath: resolved.filePath
	};
}
//#endregion
export { resolveAgentAvatar as t };
