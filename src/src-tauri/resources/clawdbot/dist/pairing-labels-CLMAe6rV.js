import { f as getPairingAdapter } from "./pairing-store-BqyKPFa6.js";
//#region src/pairing/pairing-labels.ts
function resolvePairingIdLabel(channel) {
	return getPairingAdapter(channel)?.idLabel ?? "userId";
}
//#endregion
export { resolvePairingIdLabel as t };
