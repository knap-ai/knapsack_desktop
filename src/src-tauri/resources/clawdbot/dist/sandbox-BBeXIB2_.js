import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-eyAoWbVe.js";
import { c as isPathInside, r as resolveBoundaryPath } from "./file-identity-eQApOIDl.js";
import { r as openBoundaryFile } from "./boundary-file-read-DXLy_w6L.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { a as DEFAULT_IDENTITY_FILENAME, c as DEFAULT_SOUL_FILENAME, d as ensureAgentWorkspace, i as DEFAULT_HEARTBEAT_FILENAME, l as DEFAULT_TOOLS_FILENAME, n as DEFAULT_AGENT_WORKSPACE_DIR, r as DEFAULT_BOOTSTRAP_FILENAME, t as DEFAULT_AGENTS_FILENAME, u as DEFAULT_USER_FILENAME } from "./workspace-hhTlRYqM.js";
import "./config-Q9XZc_2I.js";
import { t as loadActivatedBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-gSGchfr7.js";
import { a as isToolAllowed, f as SANDBOX_BROWSER_SECURITY_HASH_EPOCH, n as resolveSandboxConfigForAgent, t as resolveSandboxBrowserDockerCreateConfig, u as SANDBOX_AGENT_WORKSPACE_MOUNT } from "./config-CWqq9_ZP.js";
import { n as resolveSandboxRuntimeStatus } from "./runtime-status-DhGewqgv.js";
import { t as PATH_ALIAS_POLICIES } from "./path-alias-guards-Bfwx2wkV.js";
import { i as resolveSandboxPath, r as resolveSandboxInputPath } from "./sandbox-paths-C5p25GeS.js";
import { r as getRemoteSkillEligibility, t as canExecRequestNode } from "./exec-defaults-DiCDZt_n.js";
import { l as syncSkillsToWorkspace } from "./skills-Cwx5TftI.js";
import { t as sanitizeEnvVars } from "./sanitize-env-vars-Og3CRoPL.js";
import { n as resolveBrowserControlAuth, t as ensureBrowserControlAuth } from "./browser-control-auth-CuDh_EEK.js";
import { i as DEFAULT_OPENCLAW_BROWSER_COLOR, l as resolveProfile, o as DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME } from "./browser-profiles-DM06n8Uh.js";
import { h as buildDockerExecArgs } from "./bash-tools.exec-runtime-DNTWYnIA.js";
import { C as removeRegistryEntry, E as computeSandboxBrowserConfigHash, S as removeBrowserRegistryEntry, T as updateRegistry, _ as resolveSandboxScopeKey, a as execDockerRaw, b as readBrowserRegistry, c as readDockerNetworkDriver, d as appendWorkspaceMountArgs, g as resolveSandboxAgentId, h as splitSandboxBindSpec, i as execDocker, l as readDockerNetworkGateway, m as resolveSandboxHostPathViaExistingAncestor, n as dockerContainerState, o as readDockerContainerEnvVar, p as validateNetworkMode, r as ensureSandboxContainer, s as readDockerContainerLabel, t as buildSandboxCreateArgs, u as readDockerPort, v as resolveSandboxWorkspaceDir, w as updateBrowserRegistry, x as readRegistry, y as slugifySessionKey } from "./docker-mSot2cJh.js";
import { t as parseSshTarget } from "./ssh-tunnel-BRxSf715.js";
import { n as deriveDefaultBrowserCdpPortRange } from "./port-defaults-BdplfuBS.js";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";
import fs$1 from "node:fs/promises";
import crypto from "node:crypto";
//#region src/agents/sandbox/docker-backend.ts
function resolveConfiguredDockerRuntimeImage(params) {
	const sandboxCfg = resolveSandboxConfigForAgent(params.config, params.agentId);
	switch (params.configLabelKind) {
		case "BrowserImage": return sandboxCfg.browser.image;
		case "Image":
		case void 0:
		default: return sandboxCfg.docker.image;
	}
}
async function createDockerSandboxBackend(params) {
	return createDockerSandboxBackendHandle({
		containerName: await ensureSandboxContainer({
			sessionKey: params.sessionKey,
			workspaceDir: params.workspaceDir,
			agentWorkspaceDir: params.agentWorkspaceDir,
			cfg: params.cfg
		}),
		workdir: params.cfg.docker.workdir,
		env: params.cfg.docker.env,
		image: params.cfg.docker.image
	});
}
function createDockerSandboxBackendHandle(params) {
	return {
		id: "docker",
		runtimeId: params.containerName,
		runtimeLabel: params.containerName,
		workdir: params.workdir,
		env: params.env,
		configLabel: params.image,
		configLabelKind: "Image",
		capabilities: { browser: true },
		async buildExecSpec({ command, workdir, env, usePty }) {
			return {
				argv: ["docker", ...buildDockerExecArgs({
					containerName: params.containerName,
					command,
					workdir: workdir ?? params.workdir,
					env,
					tty: usePty
				})],
				env: process.env,
				stdinMode: usePty ? "pipe-open" : "pipe-closed"
			};
		},
		runShellCommand(command) {
			return runDockerSandboxShellCommand({
				containerName: params.containerName,
				...command
			});
		}
	};
}
function runDockerSandboxShellCommand(params) {
	const dockerArgs = [
		"exec",
		"-i",
		params.containerName,
		"sh",
		"-c",
		params.script,
		"openclaw-sandbox-fs"
	];
	if (params.args?.length) dockerArgs.push(...params.args);
	return execDockerRaw(dockerArgs, {
		input: params.stdin,
		allowFailure: params.allowFailure,
		signal: params.signal
	});
}
const dockerSandboxBackendManager = {
	async describeRuntime({ entry, config, agentId }) {
		const state = await dockerContainerState(entry.containerName);
		let actualConfigLabel = entry.image;
		if (state.exists) try {
			const result = await execDocker([
				"inspect",
				"-f",
				"{{.Config.Image}}",
				entry.containerName
			], { allowFailure: true });
			if (result.code === 0) actualConfigLabel = result.stdout.trim() || actualConfigLabel;
		} catch {}
		const configuredImage = resolveConfiguredDockerRuntimeImage({
			config,
			agentId,
			configLabelKind: entry.configLabelKind
		});
		return {
			running: state.running,
			actualConfigLabel,
			configLabelMatch: actualConfigLabel === configuredImage
		};
	},
	async removeRuntime({ entry }) {
		try {
			await execDocker([
				"rm",
				"-f",
				entry.containerName
			], { allowFailure: true });
		} catch {}
	}
};
//#endregion
//#region src/agents/sandbox/fs-bridge-mutation-helper.ts
const SANDBOX_PINNED_MUTATION_PYTHON_CANDIDATES = [
	"/usr/bin/python3",
	"/usr/local/bin/python3",
	"/opt/homebrew/bin/python3",
	"/bin/python3"
];
const SANDBOX_PINNED_MUTATION_PYTHON = [
	"import errno",
	"import os",
	"import secrets",
	"import stat",
	"import sys",
	"",
	"operation = sys.argv[1]",
	"",
	"DIR_FLAGS = os.O_RDONLY",
	"if hasattr(os, 'O_DIRECTORY'):",
	"    DIR_FLAGS |= os.O_DIRECTORY",
	"if hasattr(os, 'O_NOFOLLOW'):",
	"    DIR_FLAGS |= os.O_NOFOLLOW",
	"",
	"READ_FLAGS = os.O_RDONLY",
	"if hasattr(os, 'O_NOFOLLOW'):",
	"    READ_FLAGS |= os.O_NOFOLLOW",
	"",
	"WRITE_FLAGS = os.O_WRONLY | os.O_CREAT | os.O_EXCL",
	"if hasattr(os, 'O_NOFOLLOW'):",
	"    WRITE_FLAGS |= os.O_NOFOLLOW",
	"",
	"def split_relative(path_value):",
	"    segments = []",
	"    for segment in path_value.split('/'):",
	"        if not segment or segment == '.':",
	"            continue",
	"        if segment == '..':",
	"            raise OSError(errno.EPERM, 'path traversal is not allowed', segment)",
	"        segments.append(segment)",
	"    return segments",
	"",
	"def open_dir(path_value, dir_fd=None):",
	"    return os.open(path_value, DIR_FLAGS, dir_fd=dir_fd)",
	"",
	"def walk_dir(root_fd, rel_path, mkdir_enabled):",
	"    current_fd = os.dup(root_fd)",
	"    try:",
	"        for segment in split_relative(rel_path):",
	"            try:",
	"                next_fd = open_dir(segment, dir_fd=current_fd)",
	"            except FileNotFoundError:",
	"                if not mkdir_enabled:",
	"                    raise",
	"                os.mkdir(segment, 0o777, dir_fd=current_fd)",
	"                next_fd = open_dir(segment, dir_fd=current_fd)",
	"            os.close(current_fd)",
	"            current_fd = next_fd",
	"        return current_fd",
	"    except Exception:",
	"        os.close(current_fd)",
	"        raise",
	"",
	"def create_temp_file(parent_fd, basename):",
	"    prefix = '.openclaw-write-' + basename + '.'",
	"    for _ in range(128):",
	"        candidate = prefix + secrets.token_hex(6)",
	"        try:",
	"            fd = os.open(candidate, WRITE_FLAGS, 0o600, dir_fd=parent_fd)",
	"            return candidate, fd",
	"        except FileExistsError:",
	"            continue",
	"    raise RuntimeError('failed to allocate sandbox temp file')",
	"",
	"def create_temp_dir(parent_fd, basename, mode):",
	"    prefix = '.openclaw-move-' + basename + '.'",
	"    for _ in range(128):",
	"        candidate = prefix + secrets.token_hex(6)",
	"        try:",
	"            os.mkdir(candidate, mode, dir_fd=parent_fd)",
	"            return candidate",
	"        except FileExistsError:",
	"            continue",
	"    raise RuntimeError('failed to allocate sandbox temp directory')",
	"",
	"def write_atomic(parent_fd, basename, stdin_buffer):",
	"    temp_fd = None",
	"    temp_name = None",
	"    try:",
	"        temp_name, temp_fd = create_temp_file(parent_fd, basename)",
	"        while True:",
	"            chunk = stdin_buffer.read(65536)",
	"            if not chunk:",
	"                break",
	"            os.write(temp_fd, chunk)",
	"        os.fsync(temp_fd)",
	"        os.close(temp_fd)",
	"        temp_fd = None",
	"        os.replace(temp_name, basename, src_dir_fd=parent_fd, dst_dir_fd=parent_fd)",
	"        temp_name = None",
	"        os.fsync(parent_fd)",
	"    finally:",
	"        if temp_fd is not None:",
	"            os.close(temp_fd)",
	"        if temp_name is not None:",
	"            try:",
	"                os.unlink(temp_name, dir_fd=parent_fd)",
	"            except FileNotFoundError:",
	"                pass",
	"",
	"def read_file(parent_fd, basename):",
	"    file_fd = os.open(basename, READ_FLAGS, dir_fd=parent_fd)",
	"    try:",
	"        file_stat = os.fstat(file_fd)",
	"        if not stat.S_ISREG(file_stat.st_mode):",
	"            raise OSError(errno.EPERM, 'only regular files are allowed', basename)",
	"        if file_stat.st_nlink > 1:",
	"            raise OSError(errno.EPERM, 'hardlinked file is not allowed', basename)",
	"        while True:",
	"            chunk = os.read(file_fd, 65536)",
	"            if not chunk:",
	"                break",
	"            os.write(1, chunk)",
	"    finally:",
	"        os.close(file_fd)",
	"",
	"def remove_tree(parent_fd, basename):",
	"    entry_stat = os.lstat(basename, dir_fd=parent_fd)",
	"    if not stat.S_ISDIR(entry_stat.st_mode) or stat.S_ISLNK(entry_stat.st_mode):",
	"        os.unlink(basename, dir_fd=parent_fd)",
	"        return",
	"    dir_fd = open_dir(basename, dir_fd=parent_fd)",
	"    try:",
	"        for child in os.listdir(dir_fd):",
	"            remove_tree(dir_fd, child)",
	"    finally:",
	"        os.close(dir_fd)",
	"    os.rmdir(basename, dir_fd=parent_fd)",
	"",
	"def move_entry(src_parent_fd, src_basename, dst_parent_fd, dst_basename):",
	"    try:",
	"        os.rename(src_basename, dst_basename, src_dir_fd=src_parent_fd, dst_dir_fd=dst_parent_fd)",
	"        os.fsync(dst_parent_fd)",
	"        os.fsync(src_parent_fd)",
	"        return",
	"    except OSError as err:",
	"        if err.errno != errno.EXDEV:",
	"            raise",
	"    src_stat = os.lstat(src_basename, dir_fd=src_parent_fd)",
	"    if stat.S_ISDIR(src_stat.st_mode) and not stat.S_ISLNK(src_stat.st_mode):",
	"        temp_dir_name = create_temp_dir(dst_parent_fd, dst_basename, stat.S_IMODE(src_stat.st_mode) or 0o755)",
	"        temp_dir_fd = open_dir(temp_dir_name, dir_fd=dst_parent_fd)",
	"        src_dir_fd = open_dir(src_basename, dir_fd=src_parent_fd)",
	"        try:",
	"            for child in os.listdir(src_dir_fd):",
	"                move_entry(src_dir_fd, child, temp_dir_fd, child)",
	"        finally:",
	"            os.close(src_dir_fd)",
	"            os.close(temp_dir_fd)",
	"        os.rename(temp_dir_name, dst_basename, src_dir_fd=dst_parent_fd, dst_dir_fd=dst_parent_fd)",
	"        os.rmdir(src_basename, dir_fd=src_parent_fd)",
	"        os.fsync(dst_parent_fd)",
	"        os.fsync(src_parent_fd)",
	"        return",
	"    if stat.S_ISLNK(src_stat.st_mode):",
	"        link_target = os.readlink(src_basename, dir_fd=src_parent_fd)",
	"        try:",
	"            os.unlink(dst_basename, dir_fd=dst_parent_fd)",
	"        except FileNotFoundError:",
	"            pass",
	"        os.symlink(link_target, dst_basename, dir_fd=dst_parent_fd)",
	"        os.unlink(src_basename, dir_fd=src_parent_fd)",
	"        os.fsync(dst_parent_fd)",
	"        os.fsync(src_parent_fd)",
	"        return",
	"    src_fd = os.open(src_basename, READ_FLAGS, dir_fd=src_parent_fd)",
	"    temp_fd = None",
	"    temp_name = None",
	"    try:",
	"        src_file_stat = os.fstat(src_fd)",
	"        if not stat.S_ISREG(src_file_stat.st_mode):",
	"            raise OSError(errno.EPERM, 'only regular files are allowed', src_basename)",
	"        if src_file_stat.st_nlink > 1:",
	"            raise OSError(errno.EPERM, 'hardlinked file is not allowed', src_basename)",
	"        temp_name, temp_fd = create_temp_file(dst_parent_fd, dst_basename)",
	"        while True:",
	"            chunk = os.read(src_fd, 65536)",
	"            if not chunk:",
	"                break",
	"            os.write(temp_fd, chunk)",
	"        try:",
	"            os.fchmod(temp_fd, stat.S_IMODE(src_stat.st_mode))",
	"        except AttributeError:",
	"            pass",
	"        os.fsync(temp_fd)",
	"        os.close(temp_fd)",
	"        temp_fd = None",
	"        os.replace(temp_name, dst_basename, src_dir_fd=dst_parent_fd, dst_dir_fd=dst_parent_fd)",
	"        temp_name = None",
	"        os.unlink(src_basename, dir_fd=src_parent_fd)",
	"        os.fsync(dst_parent_fd)",
	"        os.fsync(src_parent_fd)",
	"    finally:",
	"        if temp_fd is not None:",
	"            os.close(temp_fd)",
	"        if temp_name is not None:",
	"            try:",
	"                os.unlink(temp_name, dir_fd=dst_parent_fd)",
	"            except FileNotFoundError:",
	"                pass",
	"        os.close(src_fd)",
	"",
	"if operation == 'write':",
	"    root_fd = open_dir(sys.argv[2])",
	"    parent_fd = None",
	"    try:",
	"        parent_fd = walk_dir(root_fd, sys.argv[3], sys.argv[5] == '1')",
	"        write_atomic(parent_fd, sys.argv[4], sys.stdin.buffer)",
	"    finally:",
	"        if parent_fd is not None:",
	"            os.close(parent_fd)",
	"        os.close(root_fd)",
	"elif operation == 'read':",
	"    root_fd = open_dir(sys.argv[2])",
	"    parent_fd = None",
	"    try:",
	"        parent_fd = walk_dir(root_fd, sys.argv[3], False)",
	"        read_file(parent_fd, sys.argv[4])",
	"    finally:",
	"        if parent_fd is not None:",
	"            os.close(parent_fd)",
	"        os.close(root_fd)",
	"elif operation == 'mkdirp':",
	"    root_fd = open_dir(sys.argv[2])",
	"    target_fd = None",
	"    try:",
	"        target_fd = walk_dir(root_fd, sys.argv[3], True)",
	"        os.fsync(target_fd)",
	"    finally:",
	"        if target_fd is not None:",
	"            os.close(target_fd)",
	"        os.close(root_fd)",
	"elif operation == 'remove':",
	"    root_fd = open_dir(sys.argv[2])",
	"    parent_fd = None",
	"    try:",
	"        parent_fd = walk_dir(root_fd, sys.argv[3], False)",
	"        try:",
	"            if sys.argv[5] == '1':",
	"                remove_tree(parent_fd, sys.argv[4])",
	"            else:",
	"                entry_stat = os.lstat(sys.argv[4], dir_fd=parent_fd)",
	"                if stat.S_ISDIR(entry_stat.st_mode) and not stat.S_ISLNK(entry_stat.st_mode):",
	"                    os.rmdir(sys.argv[4], dir_fd=parent_fd)",
	"                else:",
	"                    os.unlink(sys.argv[4], dir_fd=parent_fd)",
	"            os.fsync(parent_fd)",
	"        except FileNotFoundError:",
	"            if sys.argv[6] != '1':",
	"                raise",
	"    finally:",
	"        if parent_fd is not None:",
	"            os.close(parent_fd)",
	"        os.close(root_fd)",
	"elif operation == 'rename':",
	"    src_root_fd = open_dir(sys.argv[2])",
	"    dst_root_fd = open_dir(sys.argv[5])",
	"    src_parent_fd = None",
	"    dst_parent_fd = None",
	"    try:",
	"        src_parent_fd = walk_dir(src_root_fd, sys.argv[3], False)",
	"        dst_parent_fd = walk_dir(dst_root_fd, sys.argv[6], sys.argv[8] == '1')",
	"        move_entry(src_parent_fd, sys.argv[4], dst_parent_fd, sys.argv[7])",
	"    finally:",
	"        if src_parent_fd is not None:",
	"            os.close(src_parent_fd)",
	"        if dst_parent_fd is not None:",
	"            os.close(dst_parent_fd)",
	"        os.close(src_root_fd)",
	"        os.close(dst_root_fd)",
	"else:",
	"    raise RuntimeError('unknown sandbox mutation operation: ' + operation)"
].join("\n");
const SANDBOX_PINNED_MUTATION_PYTHON_SHELL_LITERAL = `'${SANDBOX_PINNED_MUTATION_PYTHON.replaceAll("'", `'\\''`)}'`;
function buildPinnedMutationPlan(params) {
	return {
		checks: params.checks,
		recheckBeforeCommand: true,
		script: [
			"set -eu",
			"python_cmd=''",
			...SANDBOX_PINNED_MUTATION_PYTHON_CANDIDATES.map((candidate) => `if [ -z "$python_cmd" ] && [ -x '${candidate}' ]; then python_cmd='${candidate}'; fi`),
			"if [ -z \"$python_cmd\" ]; then python_cmd=$(command -v python3 2>/dev/null || command -v python 2>/dev/null || true); fi",
			"if [ -z \"$python_cmd\" ]; then",
			"  echo >&2 'sandbox pinned mutation helper requires python3 or python'",
			"  exit 127",
			"fi",
			`python_script=${SANDBOX_PINNED_MUTATION_PYTHON_SHELL_LITERAL}`,
			"exec \"$python_cmd\" -c \"$python_script\" \"$@\""
		].join("\n"),
		args: params.args
	};
}
function buildPinnedWritePlan(params) {
	return buildPinnedMutationPlan({
		checks: [params.check],
		args: [
			"write",
			params.pinned.mountRootPath,
			params.pinned.relativeParentPath,
			params.pinned.basename,
			params.mkdir ? "1" : "0"
		]
	});
}
function buildPinnedMkdirpPlan(params) {
	return buildPinnedMutationPlan({
		checks: [params.check],
		args: [
			"mkdirp",
			params.pinned.mountRootPath,
			params.pinned.relativePath
		]
	});
}
function buildPinnedRemovePlan(params) {
	return buildPinnedMutationPlan({
		checks: [{
			target: params.check.target,
			options: {
				...params.check.options,
				aliasPolicy: PATH_ALIAS_POLICIES.unlinkTarget
			}
		}],
		args: [
			"remove",
			params.pinned.mountRootPath,
			params.pinned.relativeParentPath,
			params.pinned.basename,
			params.recursive ? "1" : "0",
			params.force === false ? "0" : "1"
		]
	});
}
function buildPinnedRenamePlan(params) {
	return buildPinnedMutationPlan({
		checks: [{
			target: params.fromCheck.target,
			options: {
				...params.fromCheck.options,
				aliasPolicy: PATH_ALIAS_POLICIES.unlinkTarget
			}
		}, params.toCheck],
		args: [
			"rename",
			params.from.mountRootPath,
			params.from.relativeParentPath,
			params.from.basename,
			params.to.mountRootPath,
			params.to.relativeParentPath,
			params.to.basename,
			"1"
		]
	});
}
//#endregion
//#region src/agents/sandbox/fs-bridge-rename-targets.ts
function resolveWritableRenameTargets(params) {
	const action = params.action ?? "rename files";
	const from = params.resolveTarget({
		filePath: params.from,
		cwd: params.cwd
	});
	const to = params.resolveTarget({
		filePath: params.to,
		cwd: params.cwd
	});
	params.ensureWritable(from, action);
	params.ensureWritable(to, action);
	return {
		from,
		to
	};
}
function resolveWritableRenameTargetsForBridge(params, resolveTarget, ensureWritable) {
	return resolveWritableRenameTargets({
		...params,
		resolveTarget,
		ensureWritable
	});
}
function createWritableRenameTargetResolver(resolveTarget, ensureWritable) {
	return (params) => resolveWritableRenameTargetsForBridge(params, resolveTarget, ensureWritable);
}
//#endregion
//#region src/agents/sandbox/path-utils.ts
function normalizeContainerPath$1(value) {
	const normalized = path.posix.normalize(value);
	return normalized === "." ? "/" : normalized;
}
function isPathInsideContainerRoot(root, target) {
	const normalizedRoot = normalizeContainerPath$1(root);
	const normalizedTarget = normalizeContainerPath$1(target);
	if (normalizedRoot === "/") return true;
	return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}/`);
}
//#endregion
//#region src/agents/sandbox/remote-fs-bridge.ts
function createRemoteShellSandboxFsBridge(params) {
	return new RemoteShellSandboxFsBridge(params.sandbox, params.runtime);
}
var RemoteShellSandboxFsBridge = class {
	constructor(sandbox, runtime) {
		this.sandbox = sandbox;
		this.runtime = runtime;
		this.resolveRenameTargets = createWritableRenameTargetResolver((target) => this.resolveTarget(target), (target, action) => this.ensureWritable(target, action));
	}
	resolvePath(params) {
		const target = this.resolveTarget(params);
		return {
			relativePath: target.relativePath,
			containerPath: target.containerPath
		};
	}
	async readFile(params) {
		const target = this.resolveTarget(params);
		const relativePath = path.posix.relative(target.mountRootPath, target.containerPath);
		if (relativePath === "" || relativePath === "." || relativePath.startsWith("..") || path.posix.isAbsolute(relativePath)) throw new Error(`Invalid sandbox entry target: ${target.containerPath}`);
		return (await this.runMutation({
			args: [
				"read",
				target.mountRootPath,
				path.posix.dirname(relativePath) === "." ? "" : path.posix.dirname(relativePath),
				path.posix.basename(relativePath)
			],
			signal: params.signal
		})).stdout;
	}
	async writeFile(params) {
		const target = this.resolveTarget(params);
		this.ensureWritable(target, "write files");
		const pinned = await this.resolvePinnedParent({
			containerPath: target.containerPath,
			action: "write files",
			requireWritable: true
		});
		await this.assertNoHardlinkedFile({
			containerPath: target.containerPath,
			action: "write files",
			signal: params.signal
		});
		const buffer = Buffer.isBuffer(params.data) ? params.data : Buffer.from(params.data, params.encoding ?? "utf8");
		await this.runMutation({
			args: [
				"write",
				pinned.mountRootPath,
				pinned.relativeParentPath,
				pinned.basename,
				params.mkdir !== false ? "1" : "0"
			],
			stdin: buffer,
			signal: params.signal
		});
	}
	async mkdirp(params) {
		const target = this.resolveTarget(params);
		this.ensureWritable(target, "create directories");
		const relativePath = path.posix.relative(target.mountRootPath, target.containerPath);
		if (relativePath.startsWith("..") || path.posix.isAbsolute(relativePath)) throw new Error(`Sandbox path escapes allowed mounts; cannot create directories: ${target.containerPath}`);
		await this.runMutation({
			args: [
				"mkdirp",
				target.mountRootPath,
				relativePath === "." ? "" : relativePath
			],
			signal: params.signal
		});
	}
	async remove(params) {
		const target = this.resolveTarget(params);
		this.ensureWritable(target, "remove files");
		if (!await this.remotePathExists(target.containerPath, params.signal)) {
			if (params.force === false) throw new Error(`Sandbox path not found; cannot remove files: ${target.containerPath}`);
			return;
		}
		const pinned = await this.resolvePinnedParent({
			containerPath: target.containerPath,
			action: "remove files",
			requireWritable: true,
			allowFinalSymlinkForUnlink: true
		});
		await this.runMutation({
			args: [
				"remove",
				pinned.mountRootPath,
				pinned.relativeParentPath,
				pinned.basename,
				params.recursive ? "1" : "0",
				params.force === false ? "0" : "1"
			],
			signal: params.signal,
			allowFailure: params.force !== false
		});
	}
	async rename(params) {
		const { from, to } = this.resolveRenameTargets(params);
		const fromPinned = await this.resolvePinnedParent({
			containerPath: from.containerPath,
			action: "rename files",
			requireWritable: true,
			allowFinalSymlinkForUnlink: true
		});
		const toPinned = await this.resolvePinnedParent({
			containerPath: to.containerPath,
			action: "rename files",
			requireWritable: true
		});
		await this.runMutation({
			args: [
				"rename",
				fromPinned.mountRootPath,
				fromPinned.relativeParentPath,
				fromPinned.basename,
				toPinned.mountRootPath,
				toPinned.relativeParentPath,
				toPinned.basename,
				"1"
			],
			signal: params.signal
		});
	}
	async stat(params) {
		const target = this.resolveTarget(params);
		if (!await this.remotePathExists(target.containerPath, params.signal)) return null;
		const canonical = await this.resolveCanonicalPath({
			containerPath: target.containerPath,
			action: "stat files",
			signal: params.signal
		});
		await this.assertNoHardlinkedFile({
			containerPath: canonical,
			action: "stat files",
			signal: params.signal
		});
		const [kindRaw = "", sizeRaw = "0", mtimeRaw = "0"] = (await this.runRemoteScript({
			script: "set -eu\nstat -c \"%F|%s|%Y\" -- \"$1\"",
			args: [canonical],
			signal: params.signal
		})).stdout.toString("utf8").trim().split("|");
		return {
			type: kindRaw === "directory" ? "directory" : kindRaw === "regular file" ? "file" : "other",
			size: Number(sizeRaw),
			mtimeMs: Number(mtimeRaw) * 1e3
		};
	}
	getMounts() {
		const mounts = [{
			containerRoot: normalizeContainerPath(this.runtime.remoteWorkspaceDir),
			writable: this.sandbox.workspaceAccess === "rw",
			source: "workspace"
		}];
		if (this.sandbox.workspaceAccess !== "none" && path.resolve(this.sandbox.agentWorkspaceDir) !== path.resolve(this.sandbox.workspaceDir)) mounts.push({
			containerRoot: normalizeContainerPath(this.runtime.remoteAgentWorkspaceDir),
			writable: this.sandbox.workspaceAccess === "rw",
			source: "agent"
		});
		return mounts;
	}
	resolveTarget(params) {
		const workspaceRoot = path.resolve(this.sandbox.workspaceDir);
		const agentRoot = path.resolve(this.sandbox.agentWorkspaceDir);
		const workspaceContainerRoot = normalizeContainerPath(this.runtime.remoteWorkspaceDir);
		const agentContainerRoot = normalizeContainerPath(this.runtime.remoteAgentWorkspaceDir);
		const mounts = this.getMounts();
		const input = params.filePath.trim();
		const inputPosix = input.replace(/\\/g, "/");
		const maybeContainerMount = path.posix.isAbsolute(inputPosix) ? this.resolveMountByContainerPath(mounts, normalizeContainerPath(inputPosix)) : null;
		if (maybeContainerMount) return this.toResolvedPath({
			mount: maybeContainerMount,
			containerPath: normalizeContainerPath(inputPosix)
		});
		const hostCwd = params.cwd ? path.resolve(params.cwd) : workspaceRoot;
		const hostCandidate = path.isAbsolute(input) ? path.resolve(input) : path.resolve(hostCwd, input);
		if (isPathInside(workspaceRoot, hostCandidate)) {
			const relative = toPosixRelative(workspaceRoot, hostCandidate);
			return this.toResolvedPath({
				mount: mounts[0],
				containerPath: relative ? path.posix.join(workspaceContainerRoot, relative) : workspaceContainerRoot
			});
		}
		if (mounts[1] && isPathInside(agentRoot, hostCandidate)) {
			const relative = toPosixRelative(agentRoot, hostCandidate);
			return this.toResolvedPath({
				mount: mounts[1],
				containerPath: relative ? path.posix.join(agentContainerRoot, relative) : agentContainerRoot
			});
		}
		if (params.cwd) {
			const cwdPosix = params.cwd.replace(/\\/g, "/");
			if (path.posix.isAbsolute(cwdPosix)) {
				const cwdContainer = normalizeContainerPath(cwdPosix);
				const cwdMount = this.resolveMountByContainerPath(mounts, cwdContainer);
				if (cwdMount) return this.toResolvedPath({
					mount: cwdMount,
					containerPath: normalizeContainerPath(path.posix.resolve(cwdContainer, inputPosix))
				});
			}
		}
		throw new Error(`Sandbox path escapes allowed mounts; cannot access: ${params.filePath}`);
	}
	toResolvedPath(params) {
		const relative = path.posix.relative(params.mount.containerRoot, params.containerPath);
		if (relative.startsWith("..") || path.posix.isAbsolute(relative)) throw new Error(`Sandbox path escapes allowed mounts; cannot access: ${params.containerPath}`);
		return {
			relativePath: params.mount.source === "workspace" ? relative === "." ? "" : relative : relative === "." ? params.mount.containerRoot : `${params.mount.containerRoot}/${relative}`,
			containerPath: params.containerPath,
			writable: params.mount.writable,
			mountRootPath: params.mount.containerRoot,
			source: params.mount.source
		};
	}
	resolveMountByContainerPath(mounts, containerPath) {
		const ordered = [...mounts].toSorted((a, b) => b.containerRoot.length - a.containerRoot.length);
		for (const mount of ordered) if (isPathInsideContainerRoot(mount.containerRoot, containerPath)) return mount;
		return null;
	}
	ensureWritable(target, action) {
		if (this.sandbox.workspaceAccess !== "rw" || !target.writable) throw new Error(`Sandbox path is read-only; cannot ${action}: ${target.containerPath}`);
	}
	async remotePathExists(containerPath, signal) {
		return (await this.runRemoteScript({
			script: "if [ -e \"$1\" ] || [ -L \"$1\" ]; then printf \"1\\n\"; else printf \"0\\n\"; fi",
			args: [containerPath],
			signal
		})).stdout.toString("utf8").trim() === "1";
	}
	async resolveCanonicalPath(params) {
		const script = [
			"set -eu",
			"target=\"$1\"",
			"allow_final=\"$2\"",
			"suffix=\"\"",
			"probe=\"$target\"",
			"if [ \"$allow_final\" = \"1\" ] && [ -L \"$target\" ]; then probe=$(dirname -- \"$target\"); fi",
			"cursor=\"$probe\"",
			"while [ ! -e \"$cursor\" ] && [ ! -L \"$cursor\" ]; do",
			"  parent=$(dirname -- \"$cursor\")",
			"  if [ \"$parent\" = \"$cursor\" ]; then break; fi",
			"  base=$(basename -- \"$cursor\")",
			"  suffix=\"/$base$suffix\"",
			"  cursor=\"$parent\"",
			"done",
			"canonical=$(readlink -f -- \"$cursor\")",
			"printf \"%s%s\\n\" \"$canonical\" \"$suffix\""
		].join("\n");
		const canonical = normalizeContainerPath((await this.runRemoteScript({
			script,
			args: [params.containerPath, params.allowFinalSymlinkForUnlink ? "1" : "0"],
			signal: params.signal
		})).stdout.toString("utf8").trim());
		if (!this.resolveMountByContainerPath(this.getMounts(), canonical)) throw new Error(`Sandbox path escapes allowed mounts; cannot ${params.action}: ${params.containerPath}`);
		return canonical;
	}
	async assertNoHardlinkedFile(params) {
		const output = (await this.runRemoteScript({
			script: [
				"if [ ! -e \"$1\" ] && [ ! -L \"$1\" ]; then exit 0; fi",
				"stats=$(stat -c \"%F|%h\" -- \"$1\")",
				"printf \"%s\\n\" \"$stats\""
			].join("\n"),
			args: [params.containerPath],
			signal: params.signal,
			allowFailure: true
		})).stdout.toString("utf8").trim();
		if (!output) return;
		const [kind = "", linksRaw = "1"] = output.split("|");
		if (kind === "regular file" && Number(linksRaw) > 1) throw new Error(`Hardlinked path is not allowed under sandbox mount root: ${params.containerPath}`);
	}
	async resolvePinnedParent(params) {
		const basename = path.posix.basename(params.containerPath);
		if (!basename || basename === "." || basename === "/") throw new Error(`Invalid sandbox entry target: ${params.containerPath}`);
		const canonicalParent = await this.resolveCanonicalPath({
			containerPath: normalizeContainerPath(path.posix.dirname(params.containerPath)),
			action: params.action,
			allowFinalSymlinkForUnlink: params.allowFinalSymlinkForUnlink
		});
		const mount = this.resolveMountByContainerPath(this.getMounts(), canonicalParent);
		if (!mount) throw new Error(`Sandbox path escapes allowed mounts; cannot ${params.action}: ${params.containerPath}`);
		if (params.requireWritable && !mount.writable) throw new Error(`Sandbox path is read-only; cannot ${params.action}: ${params.containerPath}`);
		const relativeParentPath = path.posix.relative(mount.containerRoot, canonicalParent);
		if (relativeParentPath.startsWith("..") || path.posix.isAbsolute(relativeParentPath)) throw new Error(`Sandbox path escapes allowed mounts; cannot ${params.action}: ${params.containerPath}`);
		return {
			mountRootPath: mount.containerRoot,
			relativeParentPath: relativeParentPath === "." ? "" : relativeParentPath,
			basename
		};
	}
	async runMutation(params) {
		return await this.runRemoteScript({
			script: [
				"set -eu",
				"python3 /dev/fd/3 \"$@\" 3<<'PY'",
				SANDBOX_PINNED_MUTATION_PYTHON,
				"PY"
			].join("\n"),
			args: params.args,
			stdin: params.stdin,
			signal: params.signal,
			allowFailure: params.allowFailure
		});
	}
	async runRemoteScript(params) {
		return await this.runtime.runRemoteShellScript({
			script: params.script,
			args: params.args,
			stdin: params.stdin,
			signal: params.signal,
			allowFailure: params.allowFailure
		});
	}
};
function normalizeContainerPath(value) {
	const normalized = normalizeContainerPath$1(value.trim() || "/");
	return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
function toPosixRelative(root, candidate) {
	return path.relative(root, candidate).split(path.sep).filter(Boolean).join(path.posix.sep);
}
//#endregion
//#region src/agents/sandbox/ssh.ts
function normalizeInlineSshMaterial(contents, filename) {
	const normalizedEscapedNewlines = contents.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n");
	const expanded = filename === "identity" || filename === "certificate.pub" ? normalizedEscapedNewlines.replace(/\\n/g, "\n") : normalizedEscapedNewlines;
	return expanded.endsWith("\n") ? expanded : `${expanded}\n`;
}
function buildSshFailureMessage(stderr, exitCode) {
	const trimmed = stderr.trim();
	if (trimmed.includes("error in libcrypto") && (trimmed.includes("Load key \"") || trimmed.includes("Permission denied (publickey)"))) return `${trimmed}\nSSH sandbox failed to load the configured identity. The private key contents may be malformed (for example CRLF or escaped newlines). Prefer identityFile when possible.`;
	return trimmed || (exitCode !== void 0 ? `ssh exited with code ${exitCode}` : "ssh exited with a non-zero status");
}
function shellEscape(value) {
	return `'${value.replaceAll("'", `'"'"'`)}'`;
}
function buildRemoteCommand(argv) {
	return argv.map((entry) => shellEscape(entry)).join(" ");
}
function buildExecRemoteCommand(params) {
	const body = params.workdir ? `cd ${shellEscape(params.workdir)} && ${params.command}` : params.command;
	return buildRemoteCommand(Object.keys(params.env).length > 0 ? [
		"env",
		...Object.entries(params.env).map(([key, value]) => `${key}=${value}`),
		"/bin/sh",
		"-c",
		body
	] : [
		"/bin/sh",
		"-c",
		body
	]);
}
function buildSshSandboxArgv(params) {
	return [
		params.session.command,
		"-F",
		params.session.configPath,
		...params.tty ? [
			"-tt",
			"-o",
			"RequestTTY=force",
			"-o",
			"SetEnv=TERM=xterm-256color"
		] : [
			"-T",
			"-o",
			"RequestTTY=no"
		],
		params.session.host,
		params.remoteCommand
	];
}
async function createSshSandboxSessionFromConfigText(params) {
	const host = params.host?.trim() || parseSshConfigHost(params.configText);
	if (!host) throw new Error("Failed to parse SSH config output.");
	const configDir = await fs$1.mkdtemp(path.join(resolveSshTmpRoot(), "openclaw-sandbox-ssh-"));
	const configPath = path.join(configDir, "config");
	await fs$1.writeFile(configPath, params.configText, {
		encoding: "utf8",
		mode: 384
	});
	await fs$1.chmod(configPath, 384);
	return {
		command: params.command?.trim() || "ssh",
		configPath,
		host
	};
}
async function createSshSandboxSessionFromSettings(settings) {
	const parsed = parseSshTarget(settings.target);
	if (!parsed) throw new Error(`Invalid sandbox SSH target: ${settings.target}`);
	const configDir = await fs$1.mkdtemp(path.join(resolveSshTmpRoot(), "openclaw-sandbox-ssh-"));
	try {
		const materializedIdentity = settings.identityData ? await writeSecretMaterial(configDir, "identity", settings.identityData) : void 0;
		const materializedCertificate = settings.certificateData ? await writeSecretMaterial(configDir, "certificate.pub", settings.certificateData) : void 0;
		const materializedKnownHosts = settings.knownHostsData ? await writeSecretMaterial(configDir, "known_hosts", settings.knownHostsData) : void 0;
		const identityFile = materializedIdentity ?? resolveOptionalLocalPath(settings.identityFile);
		const certificateFile = materializedCertificate ?? resolveOptionalLocalPath(settings.certificateFile);
		const knownHostsFile = materializedKnownHosts ?? resolveOptionalLocalPath(settings.knownHostsFile);
		const hostAlias = "openclaw-sandbox";
		const configPath = path.join(configDir, "config");
		const lines = [
			`Host ${hostAlias}`,
			`  HostName ${parsed.host}`,
			`  Port ${parsed.port}`,
			"  BatchMode yes",
			"  ConnectTimeout 5",
			"  ServerAliveInterval 15",
			"  ServerAliveCountMax 3",
			`  StrictHostKeyChecking ${settings.strictHostKeyChecking ? "yes" : "no"}`,
			`  UpdateHostKeys ${settings.updateHostKeys ? "yes" : "no"}`
		];
		if (parsed.user) lines.push(`  User ${parsed.user}`);
		if (knownHostsFile) lines.push(`  UserKnownHostsFile ${knownHostsFile}`);
		else if (!settings.strictHostKeyChecking) lines.push("  UserKnownHostsFile /dev/null");
		if (identityFile) lines.push(`  IdentityFile ${identityFile}`);
		if (certificateFile) lines.push(`  CertificateFile ${certificateFile}`);
		if (identityFile || certificateFile) lines.push("  IdentitiesOnly yes");
		await fs$1.writeFile(configPath, `${lines.join("\n")}\n`, {
			encoding: "utf8",
			mode: 384
		});
		await fs$1.chmod(configPath, 384);
		return {
			command: settings.command.trim() || "ssh",
			configPath,
			host: hostAlias
		};
	} catch (error) {
		await fs$1.rm(configDir, {
			recursive: true,
			force: true
		});
		throw error;
	}
}
async function disposeSshSandboxSession(session) {
	await fs$1.rm(path.dirname(session.configPath), {
		recursive: true,
		force: true
	});
}
async function runSshSandboxCommand(params) {
	const argv = buildSshSandboxArgv({
		session: params.session,
		remoteCommand: params.remoteCommand,
		tty: params.tty
	});
	const sshEnv = sanitizeEnvVars(process.env).allowed;
	return await new Promise((resolve, reject) => {
		const child = spawn(argv[0], argv.slice(1), {
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			],
			env: sshEnv,
			signal: params.signal
		});
		const stdoutChunks = [];
		const stderrChunks = [];
		child.stdout.on("data", (chunk) => stdoutChunks.push(Buffer.from(chunk)));
		child.stderr.on("data", (chunk) => stderrChunks.push(Buffer.from(chunk)));
		child.on("error", reject);
		child.on("close", (code) => {
			const stdout = Buffer.concat(stdoutChunks);
			const stderr = Buffer.concat(stderrChunks);
			const exitCode = code ?? 0;
			if (exitCode !== 0 && !params.allowFailure) {
				reject(Object.assign(new Error(buildSshFailureMessage(stderr.toString("utf8"), exitCode)), {
					code: exitCode,
					stdout,
					stderr
				}));
				return;
			}
			resolve({
				stdout,
				stderr,
				code: exitCode
			});
		});
		if (params.stdin !== void 0) {
			child.stdin.end(params.stdin);
			return;
		}
		child.stdin.end();
	});
}
async function uploadDirectoryToSshTarget(params) {
	await assertSafeUploadSymlinks(params.localDir);
	const remoteCommand = buildRemoteCommand([
		"/bin/sh",
		"-c",
		"mkdir -p -- \"$1\" && tar -xf - -C \"$1\"",
		"openclaw-sandbox-upload",
		params.remoteDir
	]);
	const sshArgv = buildSshSandboxArgv({
		session: params.session,
		remoteCommand
	});
	const sshEnv = sanitizeEnvVars(process.env).allowed;
	await new Promise((resolve, reject) => {
		const tar = spawn("tar", [
			"-C",
			params.localDir,
			"-cf",
			"-",
			"."
		], {
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			],
			signal: params.signal
		});
		const ssh = spawn(sshArgv[0], sshArgv.slice(1), {
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			],
			env: sshEnv,
			signal: params.signal
		});
		const tarStderr = [];
		const sshStdout = [];
		const sshStderr = [];
		let tarClosed = false;
		let sshClosed = false;
		let tarCode = 0;
		let sshCode = 0;
		tar.stderr.on("data", (chunk) => tarStderr.push(Buffer.from(chunk)));
		ssh.stdout.on("data", (chunk) => sshStdout.push(Buffer.from(chunk)));
		ssh.stderr.on("data", (chunk) => sshStderr.push(Buffer.from(chunk)));
		const fail = (error) => {
			tar.kill("SIGKILL");
			ssh.kill("SIGKILL");
			reject(error);
		};
		tar.on("error", fail);
		ssh.on("error", fail);
		tar.stdout.pipe(ssh.stdin);
		tar.on("close", (code) => {
			tarClosed = true;
			tarCode = code ?? 0;
			maybeResolve();
		});
		ssh.on("close", (code) => {
			sshClosed = true;
			sshCode = code ?? 0;
			maybeResolve();
		});
		function maybeResolve() {
			if (!tarClosed || !sshClosed) return;
			if (tarCode !== 0) {
				reject(new Error(Buffer.concat(tarStderr).toString("utf8").trim() || `tar exited with code ${tarCode}`));
				return;
			}
			if (sshCode !== 0) {
				reject(new Error(Buffer.concat(sshStderr).toString("utf8").trim() || `ssh exited with code ${sshCode}`));
				return;
			}
			resolve();
		}
	});
}
async function assertSafeUploadSymlinks(localDir) {
	const rootDir = path.resolve(localDir);
	await walkDirectory(rootDir);
	async function walkDirectory(currentDir) {
		const entries = await fs$1.readdir(currentDir, { withFileTypes: true });
		for (const entry of entries) {
			const entryPath = path.join(currentDir, entry.name);
			if (entry.isSymbolicLink()) {
				try {
					await resolveBoundaryPath({
						absolutePath: entryPath,
						rootPath: rootDir,
						boundaryLabel: "SSH sandbox upload tree"
					});
				} catch (error) {
					const relativePath = path.relative(rootDir, entryPath).split(path.sep).join("/");
					throw new Error(`SSH sandbox upload refuses symlink escaping the workspace: ${relativePath}`, { cause: error });
				}
				continue;
			}
			if (entry.isDirectory()) await walkDirectory(entryPath);
		}
	}
}
function parseSshConfigHost(configText) {
	return configText.match(/^\s*Host\s+(\S+)/m)?.[1]?.trim() || null;
}
function resolveSshTmpRoot() {
	return path.resolve(resolvePreferredOpenClawTmpDir() ?? os.tmpdir());
}
function resolveOptionalLocalPath(value) {
	const trimmed = value?.trim();
	return trimmed ? resolveUserPath(trimmed) : void 0;
}
async function writeSecretMaterial(dir, filename, contents) {
	const pathname = path.join(dir, filename);
	await fs$1.writeFile(pathname, normalizeInlineSshMaterial(contents, filename), {
		encoding: "utf8",
		mode: 384
	});
	await fs$1.chmod(pathname, 384);
	return pathname;
}
//#endregion
//#region src/agents/sandbox/ssh-backend.ts
const sshSandboxBackendManager = {
	async describeRuntime({ entry, config, agentId }) {
		const cfg = resolveSandboxConfigForAgent(config, agentId);
		if (cfg.backend !== "ssh" || !cfg.ssh.target) return {
			running: false,
			actualConfigLabel: cfg.ssh.target,
			configLabelMatch: false
		};
		const runtimePaths = resolveSshRuntimePaths(cfg.ssh.workspaceRoot, entry.sessionKey);
		const session = await createSshSandboxSessionFromSettings({
			...cfg.ssh,
			target: cfg.ssh.target
		});
		try {
			return {
				running: (await runSshSandboxCommand({
					session,
					remoteCommand: buildRemoteCommand([
						"/bin/sh",
						"-c",
						"if [ -d \"$1\" ]; then printf \"1\\n\"; else printf \"0\\n\"; fi",
						"openclaw-sandbox-check",
						runtimePaths.runtimeRootDir
					])
				})).stdout.toString("utf8").trim() === "1",
				actualConfigLabel: cfg.ssh.target,
				configLabelMatch: entry.image === cfg.ssh.target
			};
		} finally {
			await disposeSshSandboxSession(session);
		}
	},
	async removeRuntime({ entry, config, agentId }) {
		const cfg = resolveSandboxConfigForAgent(config, agentId);
		if (cfg.backend !== "ssh" || !cfg.ssh.target) return;
		const runtimePaths = resolveSshRuntimePaths(cfg.ssh.workspaceRoot, entry.sessionKey);
		const session = await createSshSandboxSessionFromSettings({
			...cfg.ssh,
			target: cfg.ssh.target
		});
		try {
			await runSshSandboxCommand({
				session,
				remoteCommand: buildRemoteCommand([
					"/bin/sh",
					"-c",
					"rm -rf -- \"$1\"",
					"openclaw-sandbox-remove",
					runtimePaths.runtimeRootDir
				]),
				allowFailure: true
			});
		} finally {
			await disposeSshSandboxSession(session);
		}
	}
};
async function createSshSandboxBackend(params) {
	if ((params.cfg.docker.binds?.length ?? 0) > 0) throw new Error("SSH sandbox backend does not support sandbox.docker.binds.");
	const target = params.cfg.ssh.target;
	if (!target) throw new Error("Sandbox backend \"ssh\" requires agents.defaults.sandbox.ssh.target.");
	return new SshSandboxBackendImpl({
		createParams: params,
		target,
		runtimePaths: resolveSshRuntimePaths(params.cfg.ssh.workspaceRoot, params.scopeKey)
	}).asHandle();
}
var SshSandboxBackendImpl = class {
	constructor(params) {
		this.params = params;
		this.ensurePromise = null;
	}
	asHandle() {
		return {
			id: "ssh",
			runtimeId: this.params.runtimePaths.runtimeId,
			runtimeLabel: this.params.runtimePaths.runtimeId,
			workdir: this.params.runtimePaths.remoteWorkspaceDir,
			env: this.params.createParams.cfg.docker.env,
			configLabel: this.params.target,
			configLabelKind: "Target",
			remoteWorkspaceDir: this.params.runtimePaths.remoteWorkspaceDir,
			remoteAgentWorkspaceDir: this.params.runtimePaths.remoteAgentWorkspaceDir,
			buildExecSpec: async ({ command, workdir, env, usePty }) => {
				await this.ensureRuntime();
				const sshSession = await this.createSession();
				return {
					argv: buildSshSandboxArgv({
						session: sshSession,
						remoteCommand: buildExecRemoteCommand({
							command,
							workdir: workdir ?? this.params.runtimePaths.remoteWorkspaceDir,
							env
						}),
						tty: usePty
					}),
					env: sanitizeEnvVars(process.env).allowed,
					stdinMode: "pipe-open",
					finalizeToken: { sshSession }
				};
			},
			finalizeExec: async ({ token }) => {
				const sshSession = token?.sshSession;
				if (sshSession) await disposeSshSandboxSession(sshSession);
			},
			runShellCommand: async (command) => await this.runRemoteShellScript(command),
			createFsBridge: ({ sandbox }) => createRemoteShellSandboxFsBridge({
				sandbox,
				runtime: this.asHandle()
			}),
			runRemoteShellScript: async (command) => await this.runRemoteShellScript(command)
		};
	}
	async createSession() {
		return await createSshSandboxSessionFromSettings({
			...this.params.createParams.cfg.ssh,
			target: this.params.target
		});
	}
	async ensureRuntime() {
		if (this.ensurePromise) return await this.ensurePromise;
		this.ensurePromise = this.ensureRuntimeInner();
		try {
			await this.ensurePromise;
		} catch (error) {
			this.ensurePromise = null;
			throw error;
		}
	}
	async ensureRuntimeInner() {
		const session = await this.createSession();
		try {
			if ((await runSshSandboxCommand({
				session,
				remoteCommand: buildRemoteCommand([
					"/bin/sh",
					"-c",
					"if [ -d \"$1\" ]; then printf \"1\\n\"; else printf \"0\\n\"; fi",
					"openclaw-sandbox-check",
					this.params.runtimePaths.runtimeRootDir
				])
			})).stdout.toString("utf8").trim() === "1") return;
			await this.replaceRemoteDirectoryFromLocal(session, this.params.createParams.workspaceDir, this.params.runtimePaths.remoteWorkspaceDir);
			if (this.params.createParams.cfg.workspaceAccess !== "none" && path.resolve(this.params.createParams.agentWorkspaceDir) !== path.resolve(this.params.createParams.workspaceDir)) await this.replaceRemoteDirectoryFromLocal(session, this.params.createParams.agentWorkspaceDir, this.params.runtimePaths.remoteAgentWorkspaceDir);
		} finally {
			await disposeSshSandboxSession(session);
		}
	}
	async replaceRemoteDirectoryFromLocal(session, localDir, remoteDir) {
		await runSshSandboxCommand({
			session,
			remoteCommand: buildRemoteCommand([
				"/bin/sh",
				"-c",
				"mkdir -p -- \"$1\" && find \"$1\" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +",
				"openclaw-sandbox-clear",
				remoteDir
			])
		});
		await uploadDirectoryToSshTarget({
			session,
			localDir,
			remoteDir
		});
	}
	async runRemoteShellScript(params) {
		await this.ensureRuntime();
		const session = await this.createSession();
		try {
			return await runSshSandboxCommand({
				session,
				remoteCommand: buildRemoteCommand([
					"/bin/sh",
					"-c",
					params.script,
					"openclaw-sandbox-fs",
					...params.args ?? []
				]),
				stdin: params.stdin,
				allowFailure: params.allowFailure,
				signal: params.signal
			});
		} finally {
			await disposeSshSandboxSession(session);
		}
	}
};
function resolveSshRuntimePaths(workspaceRoot, scopeKey) {
	const runtimeId = buildSshSandboxRuntimeId(scopeKey);
	const runtimeRootDir = path.posix.join(workspaceRoot, runtimeId);
	return {
		runtimeId,
		runtimeRootDir,
		remoteWorkspaceDir: path.posix.join(runtimeRootDir, "workspace"),
		remoteAgentWorkspaceDir: path.posix.join(runtimeRootDir, "agent")
	};
}
function buildSshSandboxRuntimeId(scopeKey) {
	const trimmed = scopeKey.trim() || "session";
	const safe = normalizeLowercaseStringOrEmpty(trimmed).replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
	const hash = Array.from(trimmed).reduce((acc, char) => (acc * 33 ^ char.charCodeAt(0)) >>> 0, 5381);
	return `openclaw-ssh-${safe || "session"}-${hash.toString(16).slice(0, 8)}`;
}
//#endregion
//#region src/agents/sandbox/backend.ts
const SANDBOX_BACKEND_FACTORIES = /* @__PURE__ */ new Map();
function normalizeSandboxBackendId(id) {
	const normalized = normalizeOptionalLowercaseString(id);
	if (!normalized) throw new Error("Sandbox backend id must not be empty.");
	return normalized;
}
function registerSandboxBackend(id, registration) {
	const normalizedId = normalizeSandboxBackendId(id);
	const resolved = typeof registration === "function" ? { factory: registration } : registration;
	const previous = SANDBOX_BACKEND_FACTORIES.get(normalizedId);
	SANDBOX_BACKEND_FACTORIES.set(normalizedId, resolved);
	return () => {
		if (previous) {
			SANDBOX_BACKEND_FACTORIES.set(normalizedId, previous);
			return;
		}
		SANDBOX_BACKEND_FACTORIES.delete(normalizedId);
	};
}
function getSandboxBackendFactory(id) {
	return SANDBOX_BACKEND_FACTORIES.get(normalizeSandboxBackendId(id))?.factory ?? null;
}
function getSandboxBackendManager(id) {
	return SANDBOX_BACKEND_FACTORIES.get(normalizeSandboxBackendId(id))?.manager ?? null;
}
function requireSandboxBackendFactory(id) {
	const factory = getSandboxBackendFactory(id);
	if (factory) return factory;
	throw new Error([`Sandbox backend "${id}" is not registered.`, "Load the plugin that provides it, or set agents.defaults.sandbox.backend=docker."].join("\n"));
}
registerSandboxBackend("docker", {
	factory: createDockerSandboxBackend,
	manager: dockerSandboxBackendManager
});
registerSandboxBackend("ssh", {
	factory: createSshSandboxBackend,
	manager: sshSandboxBackendManager
});
//#endregion
//#region src/plugin-sdk/browser-bridge.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "runtime-api.js"
	});
}
async function startBrowserBridgeServer(params) {
	return await loadFacadeModule().startBrowserBridgeServer(params);
}
async function stopBrowserBridgeServer(server) {
	await loadFacadeModule().stopBrowserBridgeServer(server);
}
//#endregion
//#region src/agents/sandbox/browser-bridges.ts
const BROWSER_BRIDGES = /* @__PURE__ */ new Map();
//#endregion
//#region src/agents/sandbox/novnc-auth.ts
const NOVNC_PASSWORD_ENV_KEY = "OPENCLAW_BROWSER_NOVNC_PASSWORD";
const NOVNC_TOKEN_TTL_MS = 60 * 1e3;
const NOVNC_PASSWORD_LENGTH = 8;
const NOVNC_PASSWORD_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NO_VNC_OBSERVER_TOKENS = /* @__PURE__ */ new Map();
function pruneExpiredNoVncObserverTokens(now) {
	for (const [token, entry] of NO_VNC_OBSERVER_TOKENS) if (entry.expiresAt <= now) NO_VNC_OBSERVER_TOKENS.delete(token);
}
function isNoVncEnabled(params) {
	return params.enableNoVnc && !params.headless;
}
function generateNoVncPassword() {
	let out = "";
	for (let i = 0; i < NOVNC_PASSWORD_LENGTH; i += 1) out += NOVNC_PASSWORD_ALPHABET[crypto.randomInt(0, 62)];
	return out;
}
function issueNoVncObserverToken(params) {
	const now = params.nowMs ?? Date.now();
	pruneExpiredNoVncObserverTokens(now);
	const token = crypto.randomBytes(24).toString("hex");
	NO_VNC_OBSERVER_TOKENS.set(token, {
		noVncPort: params.noVncPort,
		password: normalizeOptionalString(params.password),
		expiresAt: now + Math.max(1, params.ttlMs ?? NOVNC_TOKEN_TTL_MS)
	});
	return token;
}
function consumeNoVncObserverToken(token, nowMs) {
	const now = nowMs ?? Date.now();
	pruneExpiredNoVncObserverTokens(now);
	const normalized = token.trim();
	if (!normalized) return null;
	const entry = NO_VNC_OBSERVER_TOKENS.get(normalized);
	if (!entry) return null;
	NO_VNC_OBSERVER_TOKENS.delete(normalized);
	if (entry.expiresAt <= now) return null;
	return {
		noVncPort: entry.noVncPort,
		password: entry.password
	};
}
function buildNoVncObserverTokenUrl(baseUrl, token) {
	return `${baseUrl}/sandbox/novnc?${new URLSearchParams({ token }).toString()}`;
}
//#endregion
//#region src/agents/sandbox/browser.ts
const HOT_BROWSER_WINDOW_MS = 300 * 1e3;
const CDP_SOURCE_RANGE_ENV_KEY = "OPENCLAW_BROWSER_CDP_SOURCE_RANGE";
async function waitForSandboxCdp(params) {
	const deadline = Date.now() + Math.max(0, params.timeoutMs);
	const url = `http://127.0.0.1:${params.cdpPort}/json/version`;
	while (Date.now() < deadline) {
		try {
			const ctrl = new AbortController();
			const t = setTimeout(ctrl.abort.bind(ctrl), 1e3);
			try {
				if ((await fetch(url, { signal: ctrl.signal })).ok) return true;
			} finally {
				clearTimeout(t);
			}
		} catch {}
		await new Promise((r) => setTimeout(r, 150));
	}
	return false;
}
function buildSandboxBrowserResolvedConfig(params) {
	const cdpHost = "127.0.0.1";
	const cdpPortRange = deriveDefaultBrowserCdpPortRange(params.controlPort);
	return {
		enabled: true,
		evaluateEnabled: params.evaluateEnabled,
		controlPort: params.controlPort,
		cdpProtocol: "http",
		cdpHost,
		cdpIsLoopback: true,
		cdpPortRangeStart: cdpPortRange.start,
		cdpPortRangeEnd: cdpPortRange.end,
		remoteCdpTimeoutMs: 1500,
		remoteCdpHandshakeTimeoutMs: 3e3,
		color: DEFAULT_OPENCLAW_BROWSER_COLOR,
		executablePath: void 0,
		headless: params.headless,
		noSandbox: false,
		attachOnly: true,
		defaultProfile: DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME,
		extraArgs: [],
		profiles: { [DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME]: {
			cdpPort: params.cdpPort,
			color: DEFAULT_OPENCLAW_BROWSER_COLOR
		} }
	};
}
async function ensureSandboxBrowserImage(image) {
	if ((await execDocker([
		"image",
		"inspect",
		image
	], { allowFailure: true })).code === 0) return;
	throw new Error(`Sandbox browser image not found: ${image}. Build it with scripts/sandbox-browser-setup.sh.`);
}
async function ensureDockerNetwork(network, opts) {
	validateNetworkMode(network, { allowContainerNamespaceJoin: opts?.allowContainerNamespaceJoin === true });
	const normalized = normalizeOptionalLowercaseString(network) ?? "";
	if (!normalized || normalized === "bridge" || normalized === "none") return;
	if ((await execDocker([
		"network",
		"inspect",
		network
	], { allowFailure: true })).code === 0) return;
	await execDocker([
		"network",
		"create",
		"--driver",
		"bridge",
		network
	]);
}
async function ensureSandboxBrowser(params) {
	if (!params.cfg.browser.enabled) return null;
	if (!isToolAllowed(params.cfg.tools, "browser")) return null;
	const slug = params.cfg.scope === "shared" ? "shared" : slugifySessionKey(params.scopeKey);
	const containerName = `${params.cfg.browser.containerPrefix}${slug}`.slice(0, 63);
	const state = await dockerContainerState(containerName);
	const browserImage = params.cfg.browser.image ?? "openclaw-sandbox-browser:bookworm-slim";
	const cdpSourceRange = normalizeOptionalString(params.cfg.browser.cdpSourceRange);
	const browserDockerCfg = resolveSandboxBrowserDockerCreateConfig({
		docker: params.cfg.docker,
		browser: {
			...params.cfg.browser,
			image: browserImage
		}
	});
	const expectedHash = computeSandboxBrowserConfigHash({
		docker: browserDockerCfg,
		browser: {
			cdpPort: params.cfg.browser.cdpPort,
			vncPort: params.cfg.browser.vncPort,
			noVncPort: params.cfg.browser.noVncPort,
			headless: params.cfg.browser.headless,
			enableNoVnc: params.cfg.browser.enableNoVnc,
			autoStartTimeoutMs: params.cfg.browser.autoStartTimeoutMs,
			cdpSourceRange
		},
		securityEpoch: SANDBOX_BROWSER_SECURITY_HASH_EPOCH,
		workspaceAccess: params.cfg.workspaceAccess,
		workspaceDir: params.workspaceDir,
		agentWorkspaceDir: params.agentWorkspaceDir,
		mountFormatVersion: 2
	});
	const now = Date.now();
	let hasContainer = state.exists;
	let running = state.running;
	let currentHash = null;
	let hashMismatch = false;
	const noVncEnabled = isNoVncEnabled(params.cfg.browser);
	let noVncPassword;
	if (hasContainer) {
		if (noVncEnabled) noVncPassword = await readDockerContainerEnvVar(containerName, "OPENCLAW_BROWSER_NOVNC_PASSWORD") ?? void 0;
		const registryEntry = (await readBrowserRegistry()).entries.find((entry) => entry.containerName === containerName);
		currentHash = await readDockerContainerLabel(containerName, "openclaw.configHash");
		hashMismatch = !currentHash || currentHash !== expectedHash;
		if (!currentHash) {
			currentHash = registryEntry?.configHash ?? null;
			hashMismatch = !currentHash || currentHash !== expectedHash;
		}
		if (hashMismatch) {
			const lastUsedAtMs = registryEntry?.lastUsedAtMs;
			if (running && (typeof lastUsedAtMs !== "number" || now - lastUsedAtMs < HOT_BROWSER_WINDOW_MS)) {
				const hint = (() => {
					if (params.cfg.scope === "session") return `openclaw sandbox recreate --browser --session ${params.scopeKey}`;
					if (params.cfg.scope === "agent") return `openclaw sandbox recreate --browser --agent ${resolveSandboxAgentId(params.scopeKey) ?? "main"}`;
					return "openclaw sandbox recreate --browser --all";
				})();
				defaultRuntime.log(`Sandbox browser config changed for ${containerName} (recently used). Recreate to apply: ${hint}`);
			} else {
				await execDocker([
					"rm",
					"-f",
					containerName
				], { allowFailure: true });
				hasContainer = false;
				running = false;
			}
		}
	}
	if (!hasContainer) {
		if (noVncEnabled) noVncPassword = generateNoVncPassword();
		await ensureDockerNetwork(browserDockerCfg.network, { allowContainerNamespaceJoin: browserDockerCfg.dangerouslyAllowContainerNamespaceJoin === true });
		await ensureSandboxBrowserImage(browserImage);
		let effectiveCdpSourceRange = cdpSourceRange;
		if (!effectiveCdpSourceRange) {
			const driver = await readDockerNetworkDriver(browserDockerCfg.network);
			if (!driver || driver === "bridge") {
				const gateway = await readDockerNetworkGateway(browserDockerCfg.network);
				if (gateway && !gateway.includes(":")) effectiveCdpSourceRange = `${gateway}/32`;
			}
		}
		if (!effectiveCdpSourceRange && browserDockerCfg.network.trim().toLowerCase() === "none") effectiveCdpSourceRange = "127.0.0.1/32";
		if (!effectiveCdpSourceRange) throw new Error(`Cannot derive CDP source range for sandbox browser on network "${browserDockerCfg.network}". Set agents.defaults.sandbox.browser.cdpSourceRange explicitly.`);
		const args = buildSandboxCreateArgs({
			name: containerName,
			cfg: browserDockerCfg,
			scopeKey: params.scopeKey,
			labels: {
				"openclaw.sandboxBrowser": "1",
				"openclaw.browserConfigEpoch": SANDBOX_BROWSER_SECURITY_HASH_EPOCH
			},
			configHash: expectedHash,
			includeBinds: false,
			bindSourceRoots: [params.workspaceDir, params.agentWorkspaceDir]
		});
		appendWorkspaceMountArgs({
			args,
			workspaceDir: params.workspaceDir,
			agentWorkspaceDir: params.agentWorkspaceDir,
			workdir: params.cfg.docker.workdir,
			workspaceAccess: params.cfg.workspaceAccess
		});
		if (browserDockerCfg.binds?.length) for (const bind of browserDockerCfg.binds) args.push("-v", bind);
		args.push("-p", `127.0.0.1::${params.cfg.browser.cdpPort}`);
		if (noVncEnabled) args.push("-p", `127.0.0.1::${params.cfg.browser.noVncPort}`);
		args.push("-e", `OPENCLAW_BROWSER_HEADLESS=${params.cfg.browser.headless ? "1" : "0"}`);
		args.push("-e", `OPENCLAW_BROWSER_ENABLE_NOVNC=${params.cfg.browser.enableNoVnc ? "1" : "0"}`);
		args.push("-e", `OPENCLAW_BROWSER_CDP_PORT=${params.cfg.browser.cdpPort}`);
		args.push("-e", `OPENCLAW_BROWSER_AUTO_START_TIMEOUT_MS=${params.cfg.browser.autoStartTimeoutMs}`);
		if (effectiveCdpSourceRange) args.push("-e", `${CDP_SOURCE_RANGE_ENV_KEY}=${effectiveCdpSourceRange}`);
		args.push("-e", `OPENCLAW_BROWSER_VNC_PORT=${params.cfg.browser.vncPort}`);
		args.push("-e", `OPENCLAW_BROWSER_NOVNC_PORT=${params.cfg.browser.noVncPort}`);
		args.push("-e", "OPENCLAW_BROWSER_NO_SANDBOX=1");
		if (noVncEnabled && noVncPassword) args.push("-e", `${NOVNC_PASSWORD_ENV_KEY}=${noVncPassword}`);
		args.push(browserImage);
		await execDocker(args);
		await execDocker(["start", containerName]);
	} else if (!running) await execDocker(["start", containerName]);
	const mappedCdp = await readDockerPort(containerName, params.cfg.browser.cdpPort);
	if (!mappedCdp) throw new Error(`Failed to resolve CDP port mapping for ${containerName}.`);
	const mappedNoVnc = noVncEnabled ? await readDockerPort(containerName, params.cfg.browser.noVncPort) : null;
	if (noVncEnabled && !noVncPassword) noVncPassword = await readDockerContainerEnvVar(containerName, "OPENCLAW_BROWSER_NOVNC_PASSWORD") ?? void 0;
	const existing = BROWSER_BRIDGES.get(params.scopeKey);
	const existingProfile = existing ? resolveProfile(existing.bridge.state.resolved, DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME) : null;
	let desiredAuthToken = normalizeOptionalString(params.bridgeAuth?.token);
	let desiredAuthPassword = normalizeOptionalString(params.bridgeAuth?.password);
	if (!desiredAuthToken && !desiredAuthPassword) {
		desiredAuthToken = existing?.authToken;
		desiredAuthPassword = existing?.authPassword;
		if (!desiredAuthToken && !desiredAuthPassword) desiredAuthToken = crypto.randomBytes(24).toString("hex");
	}
	const shouldReuse = existing && existing.containerName === containerName && existingProfile?.cdpPort === mappedCdp;
	const authMatches = !existing || existing.authToken === desiredAuthToken && existing.authPassword === desiredAuthPassword;
	if (existing && !shouldReuse) {
		await stopBrowserBridgeServer(existing.bridge.server).catch(() => void 0);
		BROWSER_BRIDGES.delete(params.scopeKey);
	}
	if (existing && shouldReuse && !authMatches) {
		await stopBrowserBridgeServer(existing.bridge.server).catch(() => void 0);
		BROWSER_BRIDGES.delete(params.scopeKey);
	}
	const bridge = (() => {
		if (shouldReuse && authMatches && existing) return existing.bridge;
		return null;
	})();
	const ensureBridge = async () => {
		if (bridge) return bridge;
		const onEnsureAttachTarget = params.cfg.browser.autoStart ? async () => {
			const currentState = await dockerContainerState(containerName);
			if (currentState.exists && !currentState.running) await execDocker(["start", containerName]);
			if (!await waitForSandboxCdp({
				cdpPort: mappedCdp,
				timeoutMs: params.cfg.browser.autoStartTimeoutMs
			})) {
				await execDocker([
					"rm",
					"-f",
					containerName
				], { allowFailure: true });
				throw new Error(`Sandbox browser CDP did not become reachable on 127.0.0.1:${mappedCdp} within ${params.cfg.browser.autoStartTimeoutMs}ms. The hung container has been forcefully removed.`);
			}
		} : void 0;
		return await startBrowserBridgeServer({
			resolved: buildSandboxBrowserResolvedConfig({
				controlPort: 0,
				cdpPort: mappedCdp,
				headless: params.cfg.browser.headless,
				evaluateEnabled: params.evaluateEnabled ?? true
			}),
			authToken: desiredAuthToken,
			authPassword: desiredAuthPassword,
			onEnsureAttachTarget,
			resolveSandboxNoVncToken: consumeNoVncObserverToken
		});
	};
	const resolvedBridge = await ensureBridge();
	if (!shouldReuse || !authMatches) BROWSER_BRIDGES.set(params.scopeKey, {
		bridge: resolvedBridge,
		containerName,
		authToken: desiredAuthToken,
		authPassword: desiredAuthPassword
	});
	await updateBrowserRegistry({
		containerName,
		sessionKey: params.scopeKey,
		createdAtMs: now,
		lastUsedAtMs: now,
		image: browserImage,
		configHash: hashMismatch && running ? currentHash ?? void 0 : expectedHash,
		cdpPort: mappedCdp,
		noVncPort: mappedNoVnc ?? void 0
	});
	const noVncUrl = mappedNoVnc && noVncEnabled ? (() => {
		const token = issueNoVncObserverToken({
			noVncPort: mappedNoVnc,
			password: noVncPassword
		});
		return buildNoVncObserverTokenUrl(resolvedBridge.baseUrl, token);
	})() : void 0;
	return {
		bridgeUrl: resolvedBridge.baseUrl,
		noVncUrl,
		containerName
	};
}
//#endregion
//#region src/agents/sandbox/fs-bridge-path-safety.ts
var SandboxFsPathGuard = class {
	constructor(params) {
		this.mountsByContainer = params.mountsByContainer;
		this.runCommand = params.runCommand;
	}
	async assertPathChecks(checks) {
		for (const check of checks) await this.assertPathSafety(check.target, check.options);
	}
	async assertPathSafety(target, options) {
		const guarded = await this.openBoundaryWithinRequiredMount(target, options.action, {
			aliasPolicy: options.aliasPolicy,
			allowedType: options.allowedType
		});
		await this.assertGuardedPathSafety(target, options, guarded);
	}
	async openReadableFile(target) {
		const opened = await this.openBoundaryWithinRequiredMount(target, "read files");
		if (!opened.ok) throw opened.error instanceof Error ? opened.error : /* @__PURE__ */ new Error(`Sandbox boundary checks failed; cannot read files: ${target.containerPath}`);
		return opened;
	}
	resolveRequiredMount(containerPath, action) {
		const lexicalMount = this.resolveMountByContainerPath(containerPath);
		if (!lexicalMount) throw new Error(`Sandbox path escapes allowed mounts; cannot ${action}: ${containerPath}`);
		return lexicalMount;
	}
	finalizePinnedEntry(params) {
		const relativeParentPath = path.posix.relative(params.mount.containerRoot, params.parentPath);
		if (relativeParentPath.startsWith("..") || path.posix.isAbsolute(relativeParentPath)) throw new Error(`Sandbox path escapes allowed mounts; cannot ${params.action}: ${params.targetPath}`);
		return {
			mountRootPath: params.mount.containerRoot,
			relativeParentPath: relativeParentPath === "." ? "" : relativeParentPath,
			basename: params.basename
		};
	}
	async assertGuardedPathSafety(target, options, guarded) {
		if (!guarded.ok) {
			if (guarded.reason !== "path") {
				if (!(options.allowedType === "directory" && this.pathIsExistingDirectory(target.hostPath))) throw guarded.error instanceof Error ? guarded.error : /* @__PURE__ */ new Error(`Sandbox boundary checks failed; cannot ${options.action}: ${target.containerPath}`);
			}
		} else fs.closeSync(guarded.fd);
		const canonicalContainerPath = await this.resolveCanonicalContainerPath({
			containerPath: target.containerPath,
			allowFinalSymlinkForUnlink: options.aliasPolicy?.allowFinalSymlinkForUnlink === true
		});
		const canonicalMount = this.resolveRequiredMount(canonicalContainerPath, options.action);
		if (options.requireWritable && !canonicalMount.writable) throw new Error(`Sandbox path is read-only; cannot ${options.action}: ${target.containerPath}`);
	}
	async openBoundaryWithinRequiredMount(target, action, options) {
		const lexicalMount = this.resolveRequiredMount(target.containerPath, action);
		return await openBoundaryFile({
			absolutePath: target.hostPath,
			rootPath: lexicalMount.hostRoot,
			boundaryLabel: "sandbox mount root",
			aliasPolicy: options?.aliasPolicy,
			allowedType: options?.allowedType
		});
	}
	resolvePinnedEntry(target, action) {
		const basename = path.posix.basename(target.containerPath);
		if (!basename || basename === "." || basename === "/") throw new Error(`Invalid sandbox entry target: ${target.containerPath}`);
		const parentPath = normalizeContainerPath$1(path.posix.dirname(target.containerPath));
		const mount = this.resolveRequiredMount(parentPath, action);
		return this.finalizePinnedEntry({
			mount,
			parentPath,
			basename,
			targetPath: target.containerPath,
			action
		});
	}
	async resolveAnchoredSandboxEntry(target, action) {
		const basename = path.posix.basename(target.containerPath);
		if (!basename || basename === "." || basename === "/") throw new Error(`Invalid sandbox entry target: ${target.containerPath}`);
		const parentPath = normalizeContainerPath$1(path.posix.dirname(target.containerPath));
		const canonicalParentPath = await this.resolveCanonicalContainerPath({
			containerPath: parentPath,
			allowFinalSymlinkForUnlink: false
		});
		this.resolveRequiredMount(canonicalParentPath, action);
		return {
			canonicalParentPath,
			basename
		};
	}
	async resolveAnchoredPinnedEntry(target, action) {
		const anchoredTarget = await this.resolveAnchoredSandboxEntry(target, action);
		const mount = this.resolveRequiredMount(anchoredTarget.canonicalParentPath, action);
		return this.finalizePinnedEntry({
			mount,
			parentPath: anchoredTarget.canonicalParentPath,
			basename: anchoredTarget.basename,
			targetPath: target.containerPath,
			action
		});
	}
	resolvePinnedDirectoryEntry(target, action) {
		const mount = this.resolveRequiredMount(target.containerPath, action);
		const relativePath = path.posix.relative(mount.containerRoot, target.containerPath);
		if (relativePath.startsWith("..") || path.posix.isAbsolute(relativePath)) throw new Error(`Sandbox path escapes allowed mounts; cannot ${action}: ${target.containerPath}`);
		return {
			mountRootPath: mount.containerRoot,
			relativePath: relativePath === "." ? "" : relativePath
		};
	}
	pathIsExistingDirectory(hostPath) {
		try {
			return fs.statSync(hostPath).isDirectory();
		} catch {
			return false;
		}
	}
	resolveMountByContainerPath(containerPath) {
		const normalized = normalizeContainerPath$1(containerPath);
		for (const mount of this.mountsByContainer) if (isPathInsideContainerRoot(normalizeContainerPath$1(mount.containerRoot), normalized)) return mount;
		return null;
	}
	async resolveCanonicalContainerPath(params) {
		const script = [
			"set -eu",
			"target=\"$1\"",
			"allow_final=\"$2\"",
			"suffix=\"\"",
			"probe=\"$target\"",
			"if [ \"$allow_final\" = \"1\" ] && [ -L \"$target\" ]; then probe=$(dirname -- \"$target\"); fi",
			"cursor=\"$probe\"",
			"while [ ! -e \"$cursor\" ] && [ ! -L \"$cursor\" ]; do",
			"  parent=$(dirname -- \"$cursor\")",
			"  if [ \"$parent\" = \"$cursor\" ]; then break; fi",
			"  base=$(basename -- \"$cursor\")",
			"  suffix=\"/$base$suffix\"",
			"  cursor=\"$parent\"",
			"done",
			"canonical=$(readlink -f -- \"$cursor\")",
			"printf \"%s%s\\n\" \"$canonical\" \"$suffix\""
		].join("\n");
		const canonical = (await this.runCommand(script, { args: [params.containerPath, params.allowFinalSymlinkForUnlink ? "1" : "0"] })).stdout.toString("utf8").trim();
		if (!canonical.startsWith("/")) throw new Error(`Failed to resolve canonical sandbox path: ${params.containerPath}`);
		return normalizeContainerPath$1(canonical);
	}
};
//#endregion
//#region src/agents/sandbox/fs-bridge-shell-command-plans.ts
function buildStatPlan(target, anchoredTarget) {
	return {
		checks: [{
			target,
			options: { action: "stat files" }
		}],
		script: "set -eu\ncd -- \"$1\"\nstat -c \"%F|%s|%Y\" -- \"$2\"",
		args: [anchoredTarget.canonicalParentPath, anchoredTarget.basename],
		allowFailure: true
	};
}
//#endregion
//#region src/agents/sandbox/fs-paths.ts
function parseSandboxBindMount(spec) {
	const trimmed = spec.trim();
	if (!trimmed) return null;
	const parsed = splitSandboxBindSpec(trimmed);
	if (!parsed) return null;
	const hostToken = parsed.host.trim();
	const containerToken = parsed.container.trim();
	if (!hostToken || !containerToken || !path.posix.isAbsolute(containerToken)) return null;
	const optionsToken = normalizeOptionalLowercaseString(parsed.options) ?? "";
	const writable = !(optionsToken ? optionsToken.split(",").map((entry) => entry.trim()).filter(Boolean) : []).includes("ro");
	return {
		hostRoot: path.resolve(hostToken),
		containerRoot: normalizeContainerPath$1(containerToken),
		writable
	};
}
function buildSandboxFsMounts(sandbox) {
	const mounts = [{
		hostRoot: path.resolve(sandbox.workspaceDir),
		containerRoot: normalizeContainerPath$1(sandbox.containerWorkdir),
		writable: sandbox.workspaceAccess === "rw",
		source: "workspace"
	}];
	if (sandbox.workspaceAccess !== "none" && path.resolve(sandbox.agentWorkspaceDir) !== path.resolve(sandbox.workspaceDir)) mounts.push({
		hostRoot: path.resolve(sandbox.agentWorkspaceDir),
		containerRoot: SANDBOX_AGENT_WORKSPACE_MOUNT,
		writable: sandbox.workspaceAccess === "rw",
		source: "agent"
	});
	for (const bind of sandbox.docker.binds ?? []) {
		const parsed = parseSandboxBindMount(bind);
		if (!parsed) continue;
		mounts.push({
			hostRoot: parsed.hostRoot,
			containerRoot: parsed.containerRoot,
			writable: parsed.writable,
			source: "bind"
		});
	}
	return dedupeMounts(mounts);
}
function resolveSandboxFsPathWithMounts(params) {
	const mountsByContainer = [...params.mounts].toSorted(compareMountsByContainerPath);
	const mountsByHost = [...params.mounts].toSorted(compareMountsByHostPath);
	const input = params.filePath;
	const inputPosix = normalizePosixInput(input);
	if (path.posix.isAbsolute(inputPosix)) {
		const containerMount = findMountByContainerPath(mountsByContainer, inputPosix);
		if (containerMount) {
			const rel = path.posix.relative(containerMount.containerRoot, inputPosix);
			return {
				hostPath: rel ? path.resolve(containerMount.hostRoot, ...toHostSegments(rel)) : containerMount.hostRoot,
				containerPath: rel ? path.posix.join(containerMount.containerRoot, rel) : containerMount.containerRoot,
				relativePath: toDisplayRelative({
					containerPath: rel ? path.posix.join(containerMount.containerRoot, rel) : containerMount.containerRoot,
					defaultContainerRoot: params.defaultContainerRoot
				}),
				writable: containerMount.writable
			};
		}
	}
	const hostResolved = resolveSandboxInputPath(input, params.cwd);
	const hostMount = findMountByHostPath(mountsByHost, hostResolved);
	if (hostMount) {
		const relHost = path.relative(hostMount.hostRoot, hostResolved);
		const relPosix = relHost ? relHost.split(path.sep).join(path.posix.sep) : "";
		const containerPath = relPosix ? path.posix.join(hostMount.containerRoot, relPosix) : hostMount.containerRoot;
		return {
			hostPath: hostResolved,
			containerPath,
			relativePath: toDisplayRelative({
				containerPath,
				defaultContainerRoot: params.defaultContainerRoot
			}),
			writable: hostMount.writable
		};
	}
	resolveSandboxPath({
		filePath: input,
		cwd: params.cwd,
		root: params.defaultWorkspaceRoot
	});
	throw new Error(`Path escapes sandbox root (${params.defaultWorkspaceRoot}): ${input}`);
}
function compareMountsByContainerPath(a, b) {
	const byLength = b.containerRoot.length - a.containerRoot.length;
	if (byLength !== 0) return byLength;
	return mountSourcePriority(b.source) - mountSourcePriority(a.source);
}
function compareMountsByHostPath(a, b) {
	const byLength = b.hostRoot.length - a.hostRoot.length;
	if (byLength !== 0) return byLength;
	return mountSourcePriority(b.source) - mountSourcePriority(a.source);
}
function mountSourcePriority(source) {
	if (source === "bind") return 2;
	if (source === "agent") return 1;
	return 0;
}
function dedupeMounts(mounts) {
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const mount of mounts) {
		const key = `${mount.hostRoot}=>${mount.containerRoot}`;
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(mount);
	}
	return deduped;
}
function findMountByContainerPath(mounts, target) {
	for (const mount of mounts) if (isPathInsideContainerRoot(mount.containerRoot, target)) return mount;
	return null;
}
function findMountByHostPath(mounts, target) {
	for (const mount of mounts) if (isPathInsideHost(mount.hostRoot, target)) return mount;
	return null;
}
function isPathInsideHost(root, target) {
	const canonicalRoot = resolveSandboxHostPathViaExistingAncestor(path.resolve(root));
	const resolvedTarget = path.resolve(target);
	const canonicalTargetParent = resolveSandboxHostPathViaExistingAncestor(path.dirname(resolvedTarget));
	const canonicalTarget = path.resolve(canonicalTargetParent, path.basename(resolvedTarget));
	const rel = path.relative(canonicalRoot, canonicalTarget);
	if (!rel) return true;
	return !(rel.startsWith("..") || path.isAbsolute(rel));
}
function toHostSegments(relativePosix) {
	return relativePosix.split("/").filter(Boolean);
}
function toDisplayRelative(params) {
	const rel = path.posix.relative(params.defaultContainerRoot, params.containerPath);
	if (!rel) return "";
	if (!rel.startsWith("..") && !path.posix.isAbsolute(rel)) return rel;
	return params.containerPath;
}
function normalizePosixInput(value) {
	return value.replace(/\\/g, "/").trim();
}
//#endregion
//#region src/agents/sandbox/fs-bridge.ts
function createSandboxFsBridge(params) {
	return new SandboxFsBridgeImpl(params.sandbox);
}
var SandboxFsBridgeImpl = class {
	constructor(sandbox) {
		this.sandbox = sandbox;
		this.mounts = buildSandboxFsMounts(sandbox);
		this.pathGuard = new SandboxFsPathGuard({
			mountsByContainer: [...this.mounts].toSorted((a, b) => b.containerRoot.length - a.containerRoot.length),
			runCommand: (script, options) => this.runCommand(script, options)
		});
	}
	resolvePath(params) {
		const target = this.resolveResolvedPath(params);
		return {
			hostPath: target.hostPath,
			relativePath: target.relativePath,
			containerPath: target.containerPath
		};
	}
	async readFile(params) {
		const target = this.resolveResolvedPath(params);
		return this.readPinnedFile(target);
	}
	async writeFile(params) {
		const target = this.resolveResolvedPath(params);
		this.ensureWriteAccess(target, "write files");
		const writeCheck = {
			target,
			options: {
				action: "write files",
				requireWritable: true
			}
		};
		await this.pathGuard.assertPathSafety(target, writeCheck.options);
		const buffer = Buffer.isBuffer(params.data) ? params.data : Buffer.from(params.data, params.encoding ?? "utf8");
		const pinnedWriteTarget = await this.pathGuard.resolveAnchoredPinnedEntry(target, "write files");
		await this.runCheckedCommand({
			...buildPinnedWritePlan({
				check: writeCheck,
				pinned: pinnedWriteTarget,
				mkdir: params.mkdir !== false
			}),
			stdin: buffer,
			signal: params.signal
		});
	}
	async mkdirp(params) {
		const target = this.resolveResolvedPath(params);
		this.ensureWriteAccess(target, "create directories");
		const mkdirCheck = {
			target,
			options: {
				action: "create directories",
				requireWritable: true,
				allowedType: "directory"
			}
		};
		await this.runCheckedCommand({
			...buildPinnedMkdirpPlan({
				check: mkdirCheck,
				pinned: this.pathGuard.resolvePinnedDirectoryEntry(target, "create directories")
			}),
			signal: params.signal
		});
	}
	async remove(params) {
		const target = this.resolveResolvedPath(params);
		this.ensureWriteAccess(target, "remove files");
		const removeCheck = {
			target,
			options: {
				action: "remove files",
				requireWritable: true
			}
		};
		await this.runCheckedCommand({
			...buildPinnedRemovePlan({
				check: removeCheck,
				pinned: this.pathGuard.resolvePinnedEntry(target, "remove files"),
				recursive: params.recursive,
				force: params.force
			}),
			signal: params.signal
		});
	}
	async rename(params) {
		const from = this.resolveResolvedPath({
			filePath: params.from,
			cwd: params.cwd
		});
		const to = this.resolveResolvedPath({
			filePath: params.to,
			cwd: params.cwd
		});
		this.ensureWriteAccess(from, "rename files");
		this.ensureWriteAccess(to, "rename files");
		const fromCheck = {
			target: from,
			options: {
				action: "rename files",
				requireWritable: true
			}
		};
		const toCheck = {
			target: to,
			options: {
				action: "rename files",
				requireWritable: true
			}
		};
		await this.runCheckedCommand({
			...buildPinnedRenamePlan({
				fromCheck,
				toCheck,
				from: this.pathGuard.resolvePinnedEntry(from, "rename files"),
				to: this.pathGuard.resolvePinnedEntry(to, "rename files")
			}),
			signal: params.signal
		});
	}
	async stat(params) {
		const target = this.resolveResolvedPath(params);
		const anchoredTarget = await this.pathGuard.resolveAnchoredSandboxEntry(target, "stat files");
		const result = await this.runPlannedCommand(buildStatPlan(target, anchoredTarget), params.signal);
		if (result.code !== 0) {
			const stderr = result.stderr.toString("utf8");
			if (stderr.includes("No such file or directory")) return null;
			const message = stderr.trim() || `stat failed with code ${result.code}`;
			throw new Error(`stat failed for ${target.containerPath}: ${message}`);
		}
		const [typeRaw, sizeRaw, mtimeRaw] = result.stdout.toString("utf8").trim().split("|");
		const size = Number.parseInt(sizeRaw ?? "0", 10);
		const mtime = Number.parseInt(mtimeRaw ?? "0", 10) * 1e3;
		return {
			type: coerceStatType(typeRaw),
			size: Number.isFinite(size) ? size : 0,
			mtimeMs: Number.isFinite(mtime) ? mtime : 0
		};
	}
	async runCommand(script, options = {}) {
		const backend = this.sandbox.backend;
		if (backend) return await backend.runShellCommand({
			script,
			args: options.args,
			stdin: options.stdin,
			allowFailure: options.allowFailure,
			signal: options.signal
		});
		return await runDockerSandboxShellCommand({
			containerName: this.sandbox.containerName,
			script,
			args: options.args,
			stdin: options.stdin,
			allowFailure: options.allowFailure,
			signal: options.signal
		});
	}
	async readPinnedFile(target) {
		const opened = await this.pathGuard.openReadableFile(target);
		try {
			return fs.readFileSync(opened.fd);
		} finally {
			fs.closeSync(opened.fd);
		}
	}
	async runCheckedCommand(plan) {
		await this.pathGuard.assertPathChecks(plan.checks);
		if (plan.recheckBeforeCommand) await this.pathGuard.assertPathChecks(plan.checks);
		return await this.runCommand(plan.script, {
			args: plan.args,
			stdin: plan.stdin,
			allowFailure: plan.allowFailure,
			signal: plan.signal
		});
	}
	async runPlannedCommand(plan, signal) {
		return await this.runCheckedCommand({
			...plan,
			signal
		});
	}
	ensureWriteAccess(target, action) {
		if (!allowsWrites(this.sandbox.workspaceAccess) || !target.writable) throw new Error(`Sandbox path is read-only; cannot ${action}: ${target.containerPath}`);
	}
	resolveResolvedPath(params) {
		return resolveSandboxFsPathWithMounts({
			filePath: params.filePath,
			cwd: params.cwd ?? this.sandbox.workspaceDir,
			defaultWorkspaceRoot: this.sandbox.workspaceDir,
			defaultContainerRoot: this.sandbox.containerWorkdir,
			mounts: this.mounts
		});
	}
};
function allowsWrites(access) {
	return access === "rw";
}
function coerceStatType(typeRaw) {
	if (!typeRaw) return "other";
	const normalized = normalizeOptionalLowercaseString(typeRaw) ?? "";
	if (normalized.includes("directory")) return "directory";
	if (normalized.includes("file")) return "file";
	return "other";
}
//#endregion
//#region src/agents/sandbox/prune.ts
let lastPruneAtMs = 0;
function shouldPruneSandboxEntry(cfg, now, entry) {
	const idleHours = cfg.prune.idleHours;
	const maxAgeDays = cfg.prune.maxAgeDays;
	if (idleHours === 0 && maxAgeDays === 0) return false;
	const idleMs = now - entry.lastUsedAtMs;
	const ageMs = now - entry.createdAtMs;
	return idleHours > 0 && idleMs > idleHours * 60 * 60 * 1e3 || maxAgeDays > 0 && ageMs > maxAgeDays * 24 * 60 * 60 * 1e3;
}
async function pruneSandboxRegistryEntries(params) {
	const now = Date.now();
	if (params.cfg.prune.idleHours === 0 && params.cfg.prune.maxAgeDays === 0) return;
	const registry = await params.read();
	for (const entry of registry.entries) {
		if (!shouldPruneSandboxEntry(params.cfg, now, entry)) continue;
		try {
			await params.removeRuntime(entry);
		} catch {} finally {
			await params.remove(entry.containerName);
			await params.onRemoved?.(entry);
		}
	}
}
async function pruneSandboxContainers(cfg) {
	const config = loadConfig();
	await pruneSandboxRegistryEntries({
		cfg,
		read: readRegistry,
		remove: removeRegistryEntry,
		removeRuntime: async (entry) => {
			await getSandboxBackendManager(entry.backendId ?? "docker")?.removeRuntime({
				entry,
				config
			});
		}
	});
}
async function pruneSandboxBrowsers(cfg) {
	const config = loadConfig();
	await pruneSandboxRegistryEntries({
		cfg,
		read: readBrowserRegistry,
		remove: removeBrowserRegistryEntry,
		removeRuntime: async (entry) => {
			await dockerSandboxBackendManager.removeRuntime({
				entry: {
					...entry,
					backendId: "docker",
					runtimeLabel: entry.containerName,
					configLabelKind: "Image"
				},
				config
			});
		},
		onRemoved: async (entry) => {
			const bridge = BROWSER_BRIDGES.get(entry.sessionKey);
			if (bridge?.containerName === entry.containerName) {
				await stopBrowserBridgeServer(bridge.bridge.server).catch(() => void 0);
				BROWSER_BRIDGES.delete(entry.sessionKey);
			}
		}
	});
}
async function maybePruneSandboxes(cfg) {
	const now = Date.now();
	if (now - lastPruneAtMs < 300 * 1e3) return;
	lastPruneAtMs = now;
	try {
		await pruneSandboxContainers(cfg);
		await pruneSandboxBrowsers(cfg);
	} catch (error) {
		const message = error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error);
		defaultRuntime.error?.(`Sandbox prune failed: ${message ?? "unknown error"}`);
	}
}
//#endregion
//#region src/agents/sandbox/workspace.ts
async function ensureSandboxWorkspace(workspaceDir, seedFrom, skipBootstrap) {
	await fs$1.mkdir(workspaceDir, { recursive: true });
	if (seedFrom) {
		const seed = resolveUserPath(seedFrom);
		const files = [
			DEFAULT_AGENTS_FILENAME,
			DEFAULT_SOUL_FILENAME,
			DEFAULT_TOOLS_FILENAME,
			DEFAULT_IDENTITY_FILENAME,
			DEFAULT_USER_FILENAME,
			DEFAULT_BOOTSTRAP_FILENAME,
			DEFAULT_HEARTBEAT_FILENAME
		];
		for (const name of files) {
			const src = path.join(seed, name);
			const dest = path.join(workspaceDir, name);
			try {
				await fs$1.access(dest);
			} catch {
				try {
					const opened = await openBoundaryFile({
						absolutePath: src,
						rootPath: seed,
						boundaryLabel: "sandbox seed workspace"
					});
					if (!opened.ok) continue;
					try {
						const content = fs.readFileSync(opened.fd, "utf-8");
						await fs$1.writeFile(dest, content, {
							encoding: "utf-8",
							flag: "wx"
						});
					} finally {
						fs.closeSync(opened.fd);
					}
				} catch {}
			}
		}
	}
	await ensureAgentWorkspace({
		dir: workspaceDir,
		ensureBootstrapFiles: !skipBootstrap
	});
}
//#endregion
//#region src/agents/sandbox/context.ts
async function ensureSandboxWorkspaceLayout(params) {
	const { cfg, rawSessionKey } = params;
	const agentWorkspaceDir = resolveUserPath(params.workspaceDir?.trim() || DEFAULT_AGENT_WORKSPACE_DIR);
	const workspaceRoot = resolveUserPath(cfg.workspaceRoot);
	const scopeKey = resolveSandboxScopeKey(cfg.scope, rawSessionKey);
	const sandboxWorkspaceDir = cfg.scope === "shared" ? workspaceRoot : resolveSandboxWorkspaceDir(workspaceRoot, scopeKey);
	const workspaceDir = cfg.workspaceAccess === "rw" ? agentWorkspaceDir : sandboxWorkspaceDir;
	if (workspaceDir === sandboxWorkspaceDir) {
		await ensureSandboxWorkspace(sandboxWorkspaceDir, agentWorkspaceDir, params.config?.agents?.defaults?.skipBootstrap);
		if (cfg.workspaceAccess !== "rw") try {
			await syncSkillsToWorkspace({
				sourceWorkspaceDir: agentWorkspaceDir,
				targetWorkspaceDir: sandboxWorkspaceDir,
				config: params.config,
				agentId: params.agentId,
				eligibility: { remote: getRemoteSkillEligibility({ advertiseExecNode: canExecRequestNode({
					cfg: params.config,
					sessionKey: rawSessionKey,
					agentId: params.agentId
				}) }) }
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : JSON.stringify(error);
			defaultRuntime.error?.(`Sandbox skill sync failed: ${message}`);
		}
	} else await fs$1.mkdir(workspaceDir, { recursive: true });
	return {
		agentWorkspaceDir,
		scopeKey,
		sandboxWorkspaceDir,
		workspaceDir
	};
}
async function resolveSandboxDockerUser(params) {
	if (params.docker.user?.trim()) return params.docker;
	const stat = params.stat ?? ((workspaceDir) => fs$1.stat(workspaceDir));
	try {
		const workspaceStat = await stat(params.workspaceDir);
		const uid = Number.isInteger(workspaceStat.uid) ? workspaceStat.uid : null;
		const gid = Number.isInteger(workspaceStat.gid) ? workspaceStat.gid : null;
		if (uid === null || gid === null || uid < 0 || gid < 0) return params.docker;
		return {
			...params.docker,
			user: `${uid}:${gid}`
		};
	} catch {
		return params.docker;
	}
}
function resolveSandboxSession(params) {
	const rawSessionKey = params.sessionKey?.trim();
	if (!rawSessionKey) return null;
	const runtime = resolveSandboxRuntimeStatus({
		cfg: params.config,
		sessionKey: rawSessionKey
	});
	if (!runtime.sandboxed) return null;
	return {
		rawSessionKey,
		runtime,
		cfg: resolveSandboxConfigForAgent(params.config, runtime.agentId)
	};
}
async function resolveSandboxContext(params) {
	const resolved = resolveSandboxSession(params);
	if (!resolved) return null;
	const { rawSessionKey, cfg, runtime } = resolved;
	await maybePruneSandboxes(cfg);
	const { agentWorkspaceDir, scopeKey, workspaceDir } = await ensureSandboxWorkspaceLayout({
		cfg,
		agentId: runtime.agentId,
		rawSessionKey,
		config: params.config,
		workspaceDir: params.workspaceDir
	});
	const docker = await resolveSandboxDockerUser({
		docker: cfg.docker,
		workspaceDir
	});
	const resolvedCfg = docker === cfg.docker ? cfg : {
		...cfg,
		docker
	};
	const backend = await requireSandboxBackendFactory(resolvedCfg.backend)({
		sessionKey: rawSessionKey,
		scopeKey,
		workspaceDir,
		agentWorkspaceDir,
		cfg: resolvedCfg
	});
	await updateRegistry({
		containerName: backend.runtimeId,
		backendId: backend.id,
		runtimeLabel: backend.runtimeLabel,
		sessionKey: scopeKey,
		createdAtMs: Date.now(),
		lastUsedAtMs: Date.now(),
		image: backend.configLabel ?? resolvedCfg.docker.image,
		configLabelKind: backend.configLabelKind ?? "Image"
	});
	const evaluateEnabled = params.config?.browser?.evaluateEnabled ?? true;
	const bridgeAuth = cfg.browser.enabled ? await (async () => {
		const cfgForAuth = params.config ?? loadConfig();
		let browserAuth = resolveBrowserControlAuth(cfgForAuth);
		try {
			browserAuth = (await ensureBrowserControlAuth({ cfg: cfgForAuth })).auth;
		} catch (error) {
			const message = error instanceof Error ? error.message : JSON.stringify(error);
			defaultRuntime.error?.(`Sandbox browser auth ensure failed: ${message}`);
		}
		return browserAuth;
	})() : void 0;
	if (resolvedCfg.browser.enabled && backend.capabilities?.browser !== true) throw new Error(`Sandbox backend "${resolvedCfg.backend}" does not support browser sandboxes yet.`);
	const browser = resolvedCfg.browser.enabled && backend.capabilities?.browser === true ? await ensureSandboxBrowser({
		scopeKey,
		workspaceDir,
		agentWorkspaceDir,
		cfg: resolvedCfg,
		evaluateEnabled,
		bridgeAuth
	}) : null;
	const sandboxContext = {
		enabled: true,
		backendId: backend.id,
		sessionKey: rawSessionKey,
		workspaceDir,
		agentWorkspaceDir,
		workspaceAccess: resolvedCfg.workspaceAccess,
		runtimeId: backend.runtimeId,
		runtimeLabel: backend.runtimeLabel,
		containerName: backend.runtimeId,
		containerWorkdir: backend.workdir,
		docker: resolvedCfg.docker,
		tools: resolvedCfg.tools,
		browserAllowHostControl: resolvedCfg.browser.allowHostControl,
		browser: browser ?? void 0,
		backend
	};
	sandboxContext.fsBridge = backend.createFsBridge?.({ sandbox: sandboxContext }) ?? createSandboxFsBridge({ sandbox: sandboxContext });
	return sandboxContext;
}
async function ensureSandboxWorkspaceForSession(params) {
	const resolved = resolveSandboxSession(params);
	if (!resolved) return null;
	const { rawSessionKey, cfg, runtime } = resolved;
	const { workspaceDir } = await ensureSandboxWorkspaceLayout({
		cfg,
		agentId: runtime.agentId,
		rawSessionKey,
		config: params.config,
		workspaceDir: params.workspaceDir
	});
	return {
		workspaceDir,
		containerWorkdir: cfg.docker.workdir
	};
}
//#endregion
//#region src/agents/sandbox/manage.ts
function toBrowserDockerRuntimeEntry(entry) {
	return {
		...entry,
		backendId: "docker",
		runtimeLabel: entry.containerName,
		configLabelKind: "BrowserImage"
	};
}
async function listSandboxContainers() {
	const config = loadConfig();
	const registry = await readRegistry();
	const results = [];
	for (const entry of registry.entries) {
		const manager = getSandboxBackendManager(entry.backendId ?? "docker");
		if (!manager) {
			results.push({
				...entry,
				running: false,
				imageMatch: true
			});
			continue;
		}
		const agentId = resolveSandboxAgentId(entry.sessionKey);
		const runtime = await manager.describeRuntime({
			entry,
			config,
			agentId
		});
		results.push({
			...entry,
			image: runtime.actualConfigLabel ?? entry.image,
			running: runtime.running,
			imageMatch: runtime.configLabelMatch
		});
	}
	return results;
}
async function listSandboxBrowsers() {
	const config = loadConfig();
	const registry = await readBrowserRegistry();
	const results = [];
	for (const entry of registry.entries) {
		const agentId = resolveSandboxAgentId(entry.sessionKey);
		const runtime = await dockerSandboxBackendManager.describeRuntime({
			entry: toBrowserDockerRuntimeEntry(entry),
			config,
			agentId
		});
		results.push({
			...entry,
			image: runtime.actualConfigLabel ?? entry.image,
			running: runtime.running,
			imageMatch: runtime.configLabelMatch
		});
	}
	return results;
}
async function removeSandboxContainer(containerName) {
	const config = loadConfig();
	const entry = (await readRegistry()).entries.find((item) => item.containerName === containerName);
	if (entry) await getSandboxBackendManager(entry.backendId ?? "docker")?.removeRuntime({
		entry,
		config,
		agentId: resolveSandboxAgentId(entry.sessionKey)
	});
	await removeRegistryEntry(containerName);
}
async function removeSandboxBrowserContainer(containerName) {
	const config = loadConfig();
	const entry = (await readBrowserRegistry()).entries.find((item) => item.containerName === containerName);
	if (entry) await dockerSandboxBackendManager.removeRuntime({
		entry: toBrowserDockerRuntimeEntry(entry),
		config
	});
	await removeBrowserRegistryEntry(containerName);
	for (const [sessionKey, bridge] of BROWSER_BRIDGES.entries()) if (bridge.containerName === containerName) {
		await stopBrowserBridgeServer(bridge.bridge.server).catch(() => void 0);
		BROWSER_BRIDGES.delete(sessionKey);
	}
}
//#endregion
export { resolveWritableRenameTargetsForBridge as C, resolveWritableRenameTargets as S, runSshSandboxCommand as _, ensureSandboxWorkspaceForSession as a, createRemoteShellSandboxFsBridge as b, getSandboxBackendManager as c, buildExecRemoteCommand as d, buildRemoteCommand as f, disposeSshSandboxSession as g, createSshSandboxSessionFromSettings as h, removeSandboxContainer as i, registerSandboxBackend as l, createSshSandboxSessionFromConfigText as m, listSandboxContainers as n, resolveSandboxContext as o, buildSshSandboxArgv as p, removeSandboxBrowserContainer as r, getSandboxBackendFactory as s, listSandboxBrowsers as t, requireSandboxBackendFactory as u, shellEscape as v, createWritableRenameTargetResolver as x, uploadDirectoryToSshTarget as y };
