import { setTimeout } from "node:timers/promises";
//#region src/infra/backoff.ts
function computeBackoff(policy, attempt) {
	const base = policy.initialMs * policy.factor ** Math.max(attempt - 1, 0);
	const jitter = base * policy.jitter * Math.random();
	return Math.min(policy.maxMs, Math.round(base + jitter));
}
async function sleepWithAbort(ms, abortSignal) {
	if (ms <= 0) return;
	try {
		await setTimeout(ms, void 0, { signal: abortSignal });
	} catch (err) {
		if (abortSignal?.aborted) throw new Error("aborted", { cause: err });
		throw err;
	}
}
//#endregion
export { sleepWithAbort as n, computeBackoff as t };
