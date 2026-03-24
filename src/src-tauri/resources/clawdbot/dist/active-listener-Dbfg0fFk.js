import { n as resolveGlobalSingleton } from "./global-singleton-D9TlHTN5.js";
import { g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { t as formatCliCommand } from "./command-format-DBQUhADm.js";
//#region extensions/whatsapp/src/active-listener.ts
const state = resolveGlobalSingleton(Symbol.for("openclaw.whatsapp.activeListenerState"), () => ({
	listeners: /* @__PURE__ */ new Map(),
	current: null
}));
function setCurrentListener(listener) {
	state.current = listener;
}
function resolveWebAccountId(accountId) {
	return (accountId ?? "").trim() || "default";
}
function requireActiveWebListener(accountId) {
	const id = resolveWebAccountId(accountId);
	const listener = state.listeners.get(id) ?? null;
	if (!listener) throw new Error(`No active WhatsApp Web listener (account: ${id}). Start the gateway, then link WhatsApp with: ${formatCliCommand(`openclaw channels login --channel whatsapp --account ${id}`)}.`);
	return {
		accountId: id,
		listener
	};
}
function setActiveWebListener(accountIdOrListener, maybeListener) {
	const { accountId, listener } = typeof accountIdOrListener === "string" ? {
		accountId: accountIdOrListener,
		listener: maybeListener ?? null
	} : {
		accountId: DEFAULT_ACCOUNT_ID,
		listener: accountIdOrListener ?? null
	};
	const id = resolveWebAccountId(accountId);
	if (!listener) state.listeners.delete(id);
	else state.listeners.set(id, listener);
	if (id === "default") setCurrentListener(listener);
}
function getActiveWebListener(accountId) {
	const id = resolveWebAccountId(accountId);
	return state.listeners.get(id) ?? null;
}
//#endregion
export { setActiveWebListener as i, requireActiveWebListener as n, resolveWebAccountId as r, getActiveWebListener as t };
