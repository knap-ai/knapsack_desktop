import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { c as normalizeResolvedSecretInputString } from "./types.secrets-DTXJhyWe.js";
import { n as resolveNormalizedAccountEntry } from "./account-lookup-DI_0omIr.js";
import "./account-core-C5WQtrMO.js";
import { i as tryReadSecretFileSync } from "./secret-file-DtXtlZpO.js";
import "./core-BghMcc08.js";
import "./routing-Br1fEo8A.js";
import "./secret-input-C8U7qpTM.js";
//#region extensions/telegram/src/token.ts
function resolveTelegramToken(cfg, opts = {}) {
	const accountId = normalizeAccountId(opts.accountId);
	const telegramCfg = cfg?.channels?.telegram;
	const resolveAccountCfg = (id) => {
		const accounts = telegramCfg?.accounts;
		return Array.isArray(accounts) ? void 0 : resolveNormalizedAccountEntry(accounts, id, normalizeAccountId);
	};
	const accountCfg = resolveAccountCfg(accountId !== "default" ? accountId : DEFAULT_ACCOUNT_ID);
	if (accountId !== "default" && !accountCfg) {
		const accounts = telegramCfg?.accounts;
		if (!!accounts && typeof accounts === "object" && !Array.isArray(accounts) && Object.keys(accounts).length > 0) {
			opts.logMissingFile?.(`channels.telegram.accounts: unknown accountId "${accountId}" — not found in config, refusing channel-level fallback`);
			return {
				token: "",
				source: "none"
			};
		}
	}
	const accountTokenFile = accountCfg?.tokenFile?.trim();
	if (accountTokenFile) {
		const token = tryReadSecretFileSync(accountTokenFile, `channels.telegram.accounts.${accountId}.tokenFile`, { rejectSymlink: true });
		if (token) return {
			token,
			source: "tokenFile"
		};
		opts.logMissingFile?.(`channels.telegram.accounts.${accountId}.tokenFile not found or unreadable: ${accountTokenFile}`);
		return {
			token: "",
			source: "none"
		};
	}
	const accountToken = normalizeResolvedSecretInputString({
		value: accountCfg?.botToken,
		path: `channels.telegram.accounts.${accountId}.botToken`
	});
	if (accountToken) return {
		token: accountToken,
		source: "config"
	};
	const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
	const tokenFile = telegramCfg?.tokenFile?.trim();
	if (tokenFile) {
		const token = tryReadSecretFileSync(tokenFile, "channels.telegram.tokenFile", { rejectSymlink: true });
		if (token) return {
			token,
			source: "tokenFile"
		};
		opts.logMissingFile?.(`channels.telegram.tokenFile not found or unreadable: ${tokenFile}`);
		return {
			token: "",
			source: "none"
		};
	}
	const configToken = normalizeResolvedSecretInputString({
		value: telegramCfg?.botToken,
		path: "channels.telegram.botToken"
	});
	if (configToken) return {
		token: configToken,
		source: "config"
	};
	const envToken = allowEnv ? (opts.envToken ?? process.env.TELEGRAM_BOT_TOKEN)?.trim() : "";
	if (envToken) return {
		token: envToken,
		source: "env"
	};
	return {
		token: "",
		source: "none"
	};
}
//#endregion
export { resolveTelegramToken as t };
