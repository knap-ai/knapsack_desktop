import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { a as resolveWhatsAppAccount } from "./accounts-BPYgj8Fv.js";
import { b as restoreCredsFromBackupIfNeeded } from "./auth-store-GTQvJznL.js";
import { a as renderQrTerminal, i as resolveWhatsAppSocketTiming, t as createWaSocket } from "./session-CPsgRMMa.js";
import { a as closeWaSocketSoon, o as waitForWhatsAppLoginResult } from "./connection-controller-9TXWZRhx.js";
import { formatCliCommand } from "openclaw/plugin-sdk/cli-runtime";
import { logInfo } from "openclaw/plugin-sdk/logging-core";
import { danger, defaultRuntime, success } from "openclaw/plugin-sdk/runtime-env";
import { getRuntimeConfig } from "openclaw/plugin-sdk/runtime-config-snapshot";
//#region extensions/whatsapp/src/login.ts
var login_exports = /* @__PURE__ */ __exportAll({ loginWeb: () => loginWeb });
async function loginWeb(verbose, waitForConnection, runtime = defaultRuntime, accountId) {
	const cfg = getRuntimeConfig();
	const account = resolveWhatsAppAccount({
		cfg,
		accountId
	});
	const socketTiming = resolveWhatsAppSocketTiming(cfg);
	const restoredFromBackup = await restoreCredsFromBackupIfNeeded(account.authDir);
	const onQr = (qr) => {
		runtime.log("Open the WhatsApp app, go to Linked Devices, then scan this QR:");
		renderQrTerminal(qr).then((output) => {
			runtime.log(output.endsWith("\n") ? output.slice(0, -1) : output);
		}).catch((err) => {
			runtime.error(`failed rendering WhatsApp QR: ${String(err)}`);
		});
	};
	let sock = await createWaSocket(false, verbose, {
		authDir: account.authDir,
		...socketTiming,
		onQr
	});
	logInfo("Waiting for WhatsApp connection...", runtime);
	try {
		const result = await waitForWhatsAppLoginResult({
			sock,
			authDir: account.authDir,
			isLegacyAuthDir: account.isLegacyAuthDir,
			verbose,
			runtime,
			waitForConnection,
			socketTiming,
			onQr,
			onSocketReplaced: (replacementSock) => {
				sock = replacementSock;
			}
		});
		if (result.outcome === "connected") {
			runtime.log(success(result.restarted ? "✅ Linked after restart; web session ready." : restoredFromBackup ? "✅ Recovered from creds.json.bak; web session ready." : "✅ Linked! Credentials saved for future sends."));
			return;
		}
		if (result.outcome === "logged-out") {
			runtime.error(danger(`WhatsApp reported the session is logged out. Cleared cached web session; please rerun ${formatCliCommand("openclaw channels login")} and scan the QR again.`));
			throw new Error("Session logged out; cache cleared. Re-run login.", { cause: result.error });
		}
		runtime.error(danger(`WhatsApp Web connection ended before fully opening. ${result.message}`));
		throw new Error(result.message, { cause: result.error });
	} finally {
		closeWaSocketSoon(sock);
	}
}
//#endregion
export { login_exports as n, loginWeb as t };
