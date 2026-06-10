#!/usr/bin/env node
/**
 * fix-rollup-native.cjs
 *
 * Workaround for macOS Apple-silicon Rollup native loading failures caused by
 * strict code-signature checks in signed Node runtimes.
 */

const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const PROJECT_DIR = path.resolve(__dirname, "..");
const NPM_ROOT = path.join(PROJECT_DIR, "node_modules");
const ROLLOPT_DIR = path.join(NPM_ROOT, "@rollup", "rollup-darwin-arm64");
const ROLLUP_NATIVE = path.join(NPM_ROOT, "rollup", "dist", "native.js");
const ROLLUP_DARWIN_INDEX = path.join(ROLLOPT_DIR, "index.js");
const WASM_DIR = path.join(NPM_ROOT, "@rollup", "wasm-node");
const WASM_PACKAGE_JSON = path.join(WASM_DIR, "package.json");

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https:") ? https : http;
    protocol
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          requestJson(res.headers.location).then(resolve).catch(reject);
          res.resume();
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`Unexpected status ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

function downloadToFile(url, destination) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https:") ? https : http;
    protocol
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadToFile(res.headers.location, destination).then(resolve).catch(reject);
          res.resume();
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`Download failed (${res.statusCode}) for ${url}`));
          return;
        }
        const stream = fs.createWriteStream(destination);
        res.pipe(stream);
        stream.on("finish", () => resolve());
        stream.on("error", reject);
      })
      .on("error", reject);
  });
}

function canRequireFresh(target) {
  try {
    const resolved = require.resolve(target);
    delete require.cache[resolved];
    const value = require(target);
    return { ok: true, value, error: null, resolved };
  } catch (error) {
    return { ok: false, value: null, error };
  }
}

function isRollupNativeBlockingError(error) {
  const cause = error?.cause;
  const text = `${error?.message || ""}\n${cause?.message || ""}`;
  return /ERR_DLOPEN_FAILED|code signature|non-platform|different Team IDs|code signature in|Cannot find module @rollup\/rollup-darwin-arm64|npm has a bug related to optional dependencies/i.test(text);
}

function isRollupPackageUsable() {
  const result = canRequireFresh("@rollup/rollup-darwin-arm64");
  if (!result.ok) {
    return false;
  }
  const pkg = result.value;
  return typeof pkg?.parse === "function" && typeof pkg?.parseAsync === "function";
}

function inspectNativeRollup() {
  if (!fs.existsSync(ROLLUP_NATIVE)) {
    return { blocked: false, message: "missing-rollup-native" };
  }
  const result = canRequireFresh(ROLLUP_NATIVE);
  if (result.ok) {
    return { blocked: false };
  }
  if (isRollupNativeBlockingError(result.error)) {
    return { blocked: true, message: result.error?.message || "rollup native blocked by signature" };
  }
  return { blocked: false, unexpected: true, message: result.error?.message || "unknown rollup native error" };
}

function ensureWasmFallbackPackage() {
  const shim = `
const wasmNative = require("@rollup/wasm-node/dist/native.js");

module.exports.parse = wasmNative.parse;
module.exports.parseAsync = async (code, allowReturnOutsideFunction, jsx, signal) =>
  wasmNative.parseAsync(code, allowReturnOutsideFunction, jsx, signal);
module.exports.xxhashBase64Url = wasmNative.xxhashBase64Url;
module.exports.xxhashBase36 = wasmNative.xxhashBase36;
module.exports.xxhashBase16 = wasmNative.xxhashBase16;
`;
  fs.writeFileSync(ROLLUP_DARWIN_INDEX, shim.trimStart());

  const packageJsonPath = path.join(ROLLOPT_DIR, "package.json");
  const packageJson = fs.existsSync(packageJsonPath)
    ? JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
    : {};
  if (packageJson.main !== "./index.js") {
    packageJson.main = "./index.js";
  }
  if (!Array.isArray(packageJson.files)) {
    packageJson.files = [];
  }
  if (!packageJson.files.includes("index.js")) {
    packageJson.files.push("index.js");
  }
  packageJson._knapsackRollupFallback = "wasm";
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

async function ensureWasmNodePackage() {
  if (fs.existsSync(WASM_PACKAGE_JSON)) return;
  console.log("[rollup-native-fix] installing @rollup/wasm-node fallback package");
  const metadata = await requestJson("https://registry.npmjs.org/@rollup/wasm-node");
  const latest = metadata?.["dist-tags"]?.latest || Object.keys(metadata?.versions || {})[0];
  const tarball = metadata?.versions?.[latest]?.dist?.tarball;
  if (!tarball) {
    throw new Error("Could not resolve @rollup/wasm-node tarball URL from registry metadata");
  }

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "knap-rollup-wasm-"));
  const tgz = path.join(tmpRoot, "wasm-node.tgz");
  await downloadToFile(tarball, tgz);
  try {
    execFileSync("tar", ["-xzf", tgz, "-C", tmpRoot], {
      stdio: "ignore",
    });
    fs.rmSync(WASM_DIR, { recursive: true, force: true });
    fs.cpSync(path.join(tmpRoot, "package"), WASM_DIR, { recursive: true });
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

async function applyRollupWasmFallback() {
  if (process.platform !== "darwin" || process.arch !== "arm64") {
    return;
  }

  if (!fs.existsSync(ROLLOPT_DIR) || !fs.existsSync(ROLLUP_NATIVE)) {
    return;
  }

  if (isRollupPackageUsable()) {
    return;
  }

  const nativeStatus = inspectNativeRollup();
  if (!nativeStatus.blocked) {
    if (nativeStatus.unexpected) {
      throw new Error(`[rollup-native-fix] ${nativeStatus.message}`);
    }
    return;
  }

  await ensureWasmNodePackage();
  ensureWasmFallbackPackage();

  try {
    delete require.cache[require.resolve("@rollup/rollup-darwin-arm64")];
  } catch {}
  if (!isRollupPackageUsable()) {
    throw new Error("Rollup fallback shim could not load after patching");
  }
  console.log("[rollup-native-fix] Rollup native signature blocker fixed with wasm fallback");
}

(async () => {
  try {
    await applyRollupWasmFallback();
  } catch (error) {
    console.error(`[rollup-native-fix] ${error.message}`);
    process.exitCode = 1;
  }
})();
