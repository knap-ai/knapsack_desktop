import { c as getDebugProxyCaptureStore, d as resolveDebugProxySettings, i as initializeDebugProxyCapture, l as applyDebugProxyEnv, r as finalizeDebugProxyCapture, s as closeDebugProxyCaptureStore } from "./runtime-CdS7ehWO.js";
import { t as resolveSystemBin } from "./resolve-system-bin-CkNzNGgY.js";
import { t as buildDebugProxyCoverageReport } from "./coverage-LjL5dPTc.js";
import process from "node:process";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import net from "node:net";
import { createServer as createServer$1, request } from "node:http";
import { request as request$1 } from "node:https";
//#region src/proxy-capture/ca.ts
const execFileAsync = promisify(execFile);
async function ensureDebugProxyCa(certDir) {
	fs.mkdirSync(certDir, { recursive: true });
	const certPath = path.join(certDir, "root-ca.pem");
	const keyPath = path.join(certDir, "root-ca-key.pem");
	if (fs.existsSync(certPath) && fs.existsSync(keyPath)) return {
		certPath,
		keyPath
	};
	const openssl = resolveSystemBin("openssl");
	if (!openssl) throw new Error("openssl is required to generate debug proxy certificates");
	await execFileAsync(openssl, [
		"req",
		"-x509",
		"-newkey",
		"rsa:2048",
		"-sha256",
		"-days",
		"7",
		"-nodes",
		"-keyout",
		keyPath,
		"-out",
		certPath,
		"-subj",
		"/CN=OpenClaw Debug Proxy"
	]);
	return {
		certPath,
		keyPath
	};
}
//#endregion
//#region src/proxy-capture/proxy-server.ts
function parseConnectTarget(rawTarget) {
	const trimmed = rawTarget?.trim() ?? "";
	if (!trimmed) return {
		hostname: "127.0.0.1",
		port: 443
	};
	const bracketedMatch = trimmed.match(/^\[([^\]]+)\](?::(\d+))?$/);
	if (bracketedMatch) {
		const hostname = bracketedMatch[1]?.trim() || "127.0.0.1";
		const port = Number(bracketedMatch[2] || 443);
		if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid CONNECT target port");
		return {
			hostname,
			port
		};
	}
	const lastColon = trimmed.lastIndexOf(":");
	if (lastColon <= 0 || lastColon === trimmed.length - 1) return {
		hostname: trimmed,
		port: 443
	};
	const hostname = trimmed.slice(0, lastColon).trim() || "127.0.0.1";
	const portText = trimmed.slice(lastColon + 1).trim();
	const port = Number(portText);
	if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid CONNECT target port");
	return {
		hostname,
		port
	};
}
function normalizeTargetUrl(req) {
	if (req.url?.startsWith("http://") || req.url?.startsWith("https://")) return new URL(req.url);
	return new URL(`http://${req.headers.host ?? "127.0.0.1"}${req.url ?? "/"}`);
}
async function readBody(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	return Buffer.concat(chunks);
}
async function startDebugProxyServer(params) {
	await ensureDebugProxyCa(params.settings.certDir);
	const store = getDebugProxyCaptureStore(params.settings.dbPath, params.settings.blobDir);
	const host = params.host?.trim() || "127.0.0.1";
	const server = createServer$1(async (req, res) => {
		const flowId = randomUUID();
		const target = normalizeTargetUrl(req);
		const body = await readBody(req);
		store.recordEvent({
			sessionId: params.settings.sessionId,
			ts: Date.now(),
			sourceScope: "openclaw",
			sourceProcess: params.settings.sourceProcess,
			protocol: target.protocol === "https:" ? "https" : "http",
			direction: "outbound",
			kind: "request",
			flowId,
			method: req.method,
			host: target.host,
			path: `${target.pathname}${target.search}`,
			headersJson: JSON.stringify(req.headers),
			dataText: body.subarray(0, 8192).toString("utf8")
		});
		const upstream = (target.protocol === "https:" ? request$1 : request)(target, {
			method: req.method,
			headers: req.headers
		}, (upstreamRes) => {
			const chunks = [];
			upstreamRes.on("data", (chunk) => {
				const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
				chunks.push(buffer);
				res.write(buffer);
			});
			upstreamRes.on("end", () => {
				const responseBody = Buffer.concat(chunks);
				store.recordEvent({
					sessionId: params.settings.sessionId,
					ts: Date.now(),
					sourceScope: "openclaw",
					sourceProcess: params.settings.sourceProcess,
					protocol: target.protocol === "https:" ? "https" : "http",
					direction: "inbound",
					kind: "response",
					flowId,
					method: req.method,
					host: target.host,
					path: `${target.pathname}${target.search}`,
					status: upstreamRes.statusCode ?? void 0,
					headersJson: JSON.stringify(upstreamRes.headers),
					dataText: responseBody.subarray(0, 8192).toString("utf8")
				});
				res.end();
			});
			res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
		});
		upstream.on("error", (error) => {
			store.recordEvent({
				sessionId: params.settings.sessionId,
				ts: Date.now(),
				sourceScope: "openclaw",
				sourceProcess: params.settings.sourceProcess,
				protocol: target.protocol === "https:" ? "https" : "http",
				direction: "local",
				kind: "error",
				flowId,
				method: req.method,
				host: target.host,
				path: `${target.pathname}${target.search}`,
				errorText: error.message
			});
			res.statusCode = 502;
			res.end(error.message);
		});
		if (body.byteLength > 0) upstream.write(body);
		upstream.end();
	});
	server.on("connect", (req, clientSocket, head) => {
		const flowId = randomUUID();
		let hostname = "127.0.0.1";
		let port = 443;
		try {
			const parsed = parseConnectTarget(req.url);
			hostname = parsed.hostname;
			port = parsed.port;
		} catch (error) {
			store.recordEvent({
				sessionId: params.settings.sessionId,
				ts: Date.now(),
				sourceScope: "openclaw",
				sourceProcess: params.settings.sourceProcess,
				protocol: "connect",
				direction: "local",
				kind: "error",
				flowId,
				host: hostname,
				path: req.url ?? "",
				errorText: error instanceof Error ? error.message : String(error)
			});
			clientSocket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
			return;
		}
		store.recordEvent({
			sessionId: params.settings.sessionId,
			ts: Date.now(),
			sourceScope: "openclaw",
			sourceProcess: params.settings.sourceProcess,
			protocol: "connect",
			direction: "local",
			kind: "connect",
			flowId,
			host: hostname,
			path: req.url ?? "",
			headersJson: JSON.stringify(req.headers)
		});
		const upstreamSocket = net.connect(port, hostname, () => {
			clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
			if (head.length > 0) upstreamSocket.write(head);
			clientSocket.pipe(upstreamSocket);
			upstreamSocket.pipe(clientSocket);
		});
		upstreamSocket.on("error", (error) => {
			store.recordEvent({
				sessionId: params.settings.sessionId,
				ts: Date.now(),
				sourceScope: "openclaw",
				sourceProcess: params.settings.sourceProcess,
				protocol: "connect",
				direction: "local",
				kind: "error",
				flowId,
				host: hostname,
				path: req.url ?? "",
				errorText: error.message
			});
			clientSocket.end();
		});
	});
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(params.port ?? 0, host, () => {
			server.off("error", reject);
			resolve();
		});
	});
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("Failed to resolve debug proxy server address");
	return {
		proxyUrl: `http://${host}:${address.port}`,
		stop: async () => await new Promise((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve();
			});
		})
	};
}
//#endregion
//#region src/cli/proxy-cli.runtime.ts
async function runDebugProxyStartCommand(opts) {
	const settings = resolveDebugProxySettings();
	const store = getDebugProxyCaptureStore(settings.dbPath, settings.blobDir);
	store.upsertSession({
		id: settings.sessionId,
		startedAt: Date.now(),
		mode: "proxy-start",
		sourceScope: "openclaw",
		sourceProcess: "openclaw",
		proxyUrl: settings.proxyUrl,
		dbPath: settings.dbPath,
		blobDir: settings.blobDir
	});
	initializeDebugProxyCapture("proxy-start", settings);
	const ca = await ensureDebugProxyCa(settings.certDir);
	const server = await startDebugProxyServer({
		host: opts.host,
		port: opts.port,
		settings
	});
	process.stdout.write(`Debug proxy: ${server.proxyUrl}\n`);
	process.stdout.write(`CA cert: ${ca.certPath}\n`);
	process.stdout.write(`Capture DB: ${settings.dbPath}\n`);
	process.stdout.write("Press Ctrl+C to stop.\n");
	const shutdown = async () => {
		process.off("SIGINT", onSignal);
		process.off("SIGTERM", onSignal);
		await server.stop();
		if (settings.enabled) finalizeDebugProxyCapture(settings);
		else {
			store.endSession(settings.sessionId);
			closeDebugProxyCaptureStore();
		}
		process.exit(0);
	};
	const onSignal = () => {
		shutdown();
	};
	process.on("SIGINT", onSignal);
	process.on("SIGTERM", onSignal);
	await new Promise(() => void 0);
}
async function runDebugProxyRunCommand(opts) {
	if (opts.commandArgs.length === 0) throw new Error("proxy run requires a command after --");
	const sessionId = randomUUID();
	const settings = {
		...resolveDebugProxySettings(),
		sessionId
	};
	getDebugProxyCaptureStore(settings.dbPath, settings.blobDir).upsertSession({
		id: sessionId,
		startedAt: Date.now(),
		mode: "proxy-run",
		sourceScope: "openclaw",
		sourceProcess: "openclaw",
		proxyUrl: void 0,
		dbPath: settings.dbPath,
		blobDir: settings.blobDir
	});
	const server = await startDebugProxyServer({
		host: opts.host,
		port: opts.port,
		settings
	});
	const [command, ...args] = opts.commandArgs;
	const childEnv = applyDebugProxyEnv(process.env, {
		proxyUrl: server.proxyUrl,
		sessionId,
		dbPath: settings.dbPath,
		blobDir: settings.blobDir,
		certDir: settings.certDir
	});
	try {
		await new Promise((resolve, reject) => {
			const child = spawn(command, args, {
				stdio: "inherit",
				env: childEnv,
				cwd: process.cwd()
			});
			child.once("error", reject);
			child.once("exit", (code, signal) => {
				process.exitCode = signal ? 1 : code ?? 1;
				resolve();
			});
		});
	} finally {
		await server.stop();
		getDebugProxyCaptureStore(settings.dbPath, settings.blobDir).endSession(sessionId);
	}
}
async function runDebugProxySessionsCommand(opts) {
	const settings = resolveDebugProxySettings();
	const sessions = getDebugProxyCaptureStore(settings.dbPath, settings.blobDir).listSessions(opts.limit ?? 20);
	process.stdout.write(`${JSON.stringify(sessions, null, 2)}\n`);
	closeDebugProxyCaptureStore();
}
async function runDebugProxyQueryCommand(opts) {
	const settings = resolveDebugProxySettings();
	const rows = getDebugProxyCaptureStore(settings.dbPath, settings.blobDir).queryPreset(opts.preset, opts.sessionId);
	process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
	closeDebugProxyCaptureStore();
}
async function runDebugProxyCoverageCommand() {
	process.stdout.write(`${JSON.stringify(buildDebugProxyCoverageReport(), null, 2)}\n`);
	closeDebugProxyCaptureStore();
}
async function runDebugProxyPurgeCommand() {
	const settings = resolveDebugProxySettings();
	const result = getDebugProxyCaptureStore(settings.dbPath, settings.blobDir).purgeAll();
	process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
	closeDebugProxyCaptureStore();
}
async function readDebugProxyBlobCommand(opts) {
	const settings = resolveDebugProxySettings();
	const content = getDebugProxyCaptureStore(settings.dbPath, settings.blobDir).readBlob(opts.blobId);
	if (content == null) {
		closeDebugProxyCaptureStore();
		throw new Error(`Unknown blob: ${opts.blobId}`);
	}
	process.stdout.write(content);
	closeDebugProxyCaptureStore();
}
//#endregion
export { readDebugProxyBlobCommand, runDebugProxyCoverageCommand, runDebugProxyPurgeCommand, runDebugProxyQueryCommand, runDebugProxyRunCommand, runDebugProxySessionsCommand, runDebugProxyStartCommand };
