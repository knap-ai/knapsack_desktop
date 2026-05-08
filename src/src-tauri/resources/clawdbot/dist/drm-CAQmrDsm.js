import { a as __require, t as __commonJSMin } from "./chunk-A-jGZS85.js";
//#region node_modules/node-edge-tts/dist/drm.js
var require_drm = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateSecMsGecToken = exports.TRUSTED_CLIENT_TOKEN = exports.CHROMIUM_FULL_VERSION = void 0;
	const node_crypto_1 = __require("node:crypto");
	exports.CHROMIUM_FULL_VERSION = "143.0.3650.75";
	exports.TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
	const WINDOWS_FILE_TIME_EPOCH = 11644473600n;
	function generateSecMsGecToken() {
		const ticks = BigInt(Math.floor(Date.now() / 1e3 + Number(WINDOWS_FILE_TIME_EPOCH))) * 10000000n;
		const strToHash = `${ticks - ticks % 3000000000n}${exports.TRUSTED_CLIENT_TOKEN}`;
		const hash = (0, node_crypto_1.createHash)("sha256");
		hash.update(strToHash, "ascii");
		return hash.digest("hex").toUpperCase();
	}
	exports.generateSecMsGecToken = generateSecMsGecToken;
}));
//#endregion
export { require_drm as t };
