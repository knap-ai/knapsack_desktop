import { s as getPairingAdapter } from "./pairing-store-88eMFj2v.js";

//#region src/pairing/pairing-labels.ts
function resolvePairingIdLabel(channel) {
	return getPairingAdapter(channel)?.idLabel ?? "userId";
}

//#endregion
export { resolvePairingIdLabel as t };