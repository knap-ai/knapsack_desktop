import { r as makeProxyFetch } from "./proxy-fetch-Bib4caGq.js";
import { n as resolveTelegramFetch, t as resolveTelegramApiBase } from "./fetch-DttJw83W.js";
//#region extensions/telegram/src/api-fetch.ts
function resolveTelegramChatLookupFetch(params) {
	const proxyUrl = params?.proxyUrl?.trim();
	return resolveTelegramFetch(proxyUrl ? makeProxyFetch(proxyUrl) : void 0, { network: params?.network });
}
async function lookupTelegramChatId(params) {
	return fetchTelegramChatId({
		token: params.token,
		chatId: params.chatId,
		signal: params.signal,
		apiRoot: params.apiRoot,
		fetchImpl: resolveTelegramChatLookupFetch({
			proxyUrl: params.proxyUrl,
			network: params.network
		})
	});
}
async function fetchTelegramChatId(params) {
	const url = `${resolveTelegramApiBase(params.apiRoot)}/bot${params.token}/getChat?chat_id=${encodeURIComponent(params.chatId)}`;
	const fetchImpl = params.fetchImpl ?? fetch;
	try {
		const res = await fetchImpl(url, params.signal ? { signal: params.signal } : void 0);
		if (!res.ok) return null;
		const data = await res.json().catch(() => null);
		const id = data?.ok ? data?.result?.id : void 0;
		if (typeof id === "number" || typeof id === "string") return String(id);
		return null;
	} catch {
		return null;
	}
}
//#endregion
export { lookupTelegramChatId as n, resolveTelegramChatLookupFetch as r, fetchTelegramChatId as t };
