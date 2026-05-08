import { t as __exportAll } from "./rolldown-runtime-RkAeH_Qm.js";
import { a as resolveWhatsAppAccount } from "./accounts-BDqgpFEB.js";
import { y as restoreCredsFromBackupIfNeeded } from "./auth-store-Da7U_n_T.js";
import { a as waitForWhatsAppLoginResult, i as closeWaSocketSoon, o as createWaSocket } from "./connection-controller-BwKWE-K2.js";
import { logInfo } from "openclaw/plugin-sdk/text-runtime";
import { formatCliCommand } from "openclaw/plugin-sdk/cli-runtime";
import { danger, defaultRuntime, success } from "openclaw/plugin-sdk/runtime-env";
import { getRuntimeConfig } from "openclaw/plugin-sdk/runtime-config-snapshot";
//#region extensions/whatsapp/src/login.ts
var login_exports = /* @__PURE__ */ __exportAll({ loginWeb: () => loginWeb });
async function loginWeb(verbose, waitForConnection, runtime = defaultRuntime, accountId) {
	const account = resolveWhatsAppAccount({
		cfg: getRuntimeConfig(),
		accountId
	});
	const restoredFromBackup = await restoreCredsFromBackupIfNeeded(account.authDir);
	let sock = await createWaSocket(true, verbose, { authDir: account.authDir });
	logInfo("Waiting for WhatsApp connection...", runtime);
	try {
		const result = await waitForWhatsAppLoginResult({
			sock,
			authDir: account.authDir,
			isLegacyAuthDir: account.isLegacyAuthDir,
			verbose,
			runtime,
			waitForConnection,
			onSocketReplaced: (replacementSock) => {
				sock = replacementSock;
			}
		});
		if (result.outcome === "connected") {
			console.log(success(result.restarted ? "✅ Linked after restart; web session ready." : restoredFromBackup ? "✅ Recovered from creds.json.bak; web session ready." : "✅ Linked! Credentials saved for future sends."));
			return;
		}
		if (result.outcome === "logged-out") {
			console.error(danger(`WhatsApp reported the session is logged out. Cleared cached web session; please rerun ${formatCliCommand("openclaw channels login")} and scan the QR again.`));
			throw new Error("Session logged out; cache cleared. Re-run login.", { cause: result.error });
		}
		console.error(danger(`WhatsApp Web connection ended before fully opening. ${result.message}`));
		throw new Error(result.message, { cause: result.error });
	} finally {
		closeWaSocketSoon(sock);
	}
}
//#endregion
export { login_exports as n, loginWeb as t };
