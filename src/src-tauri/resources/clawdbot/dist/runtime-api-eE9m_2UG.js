import "./ssrf-runtime-BoGiIhjZ.js";
import "./matrix-runtime-heavy-Bcjh_DGe.js";
import "./matrix-B6o2CAmR.js";
//#region extensions/matrix/src/runtime-api.ts
function buildTimeoutAbortSignal(params) {
	const { timeoutMs, signal } = params;
	if (!timeoutMs && !signal) return {
		signal: void 0,
		cleanup: () => {}
	};
	if (!timeoutMs) return {
		signal,
		cleanup: () => {}
	};
	const controller = new AbortController();
	const timeoutId = setTimeout(controller.abort.bind(controller), timeoutMs);
	const onAbort = () => controller.abort();
	if (signal) if (signal.aborted) controller.abort();
	else signal.addEventListener("abort", onAbort, { once: true });
	return {
		signal: controller.signal,
		cleanup: () => {
			clearTimeout(timeoutId);
			signal?.removeEventListener("abort", onAbort);
		}
	};
}
//#endregion
export { buildTimeoutAbortSignal as t };
