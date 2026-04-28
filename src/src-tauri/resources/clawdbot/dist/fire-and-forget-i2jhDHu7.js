import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { n as resolveGlobalSingleton } from "./global-singleton-COlWgaGc.js";
import { r as logVerbose } from "./globals-CJu56k75.js";
//#region src/hooks/fire-and-forget.ts
const DEFAULT_MAX_CONCURRENT_FIRE_AND_FORGET_HOOKS = 16;
const DEFAULT_MAX_QUEUED_FIRE_AND_FORGET_HOOKS = 256;
const DEFAULT_FIRE_AND_FORGET_HOOK_TIMEOUT_MS = 2e3;
const MAX_HOOK_LOG_MESSAGE_LENGTH = 500;
const getFireAndForgetHookState = () => resolveGlobalSingleton(Symbol.for("openclaw.fireAndForgetHookState"), () => ({
	active: 0,
	queue: []
}));
function positiveIntegerOrDefault(value, fallback) {
	return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;
}
function replaceLogControlCharacters(value) {
	let result = "";
	for (const char of value) {
		const codePoint = char.codePointAt(0);
		if (codePoint === void 0 || codePoint <= 31 || codePoint === 127 || codePoint === 8232 || codePoint === 8233) {
			result += " ";
			continue;
		}
		result += char;
	}
	return result;
}
function formatHookErrorForLog(err) {
	return (replaceLogControlCharacters(formatErrorMessage(err)).replace(/\s+/g, " ").trim() || "unknown error").slice(0, MAX_HOOK_LOG_MESSAGE_LENGTH);
}
function fireAndForgetHook(task, label, logger = logVerbose) {
	task.catch((err) => {
		logger(`${label}: ${formatHookErrorForLog(err)}`);
	});
}
function runFireAndForgetHookJob(state, job, limits) {
	state.active += 1;
	let didLogTimeout = false;
	const timeout = job.timeoutMs > 0 ? setTimeout(() => {
		didLogTimeout = true;
		job.logger(`${job.label}: timed out after ${job.timeoutMs}ms`);
	}, job.timeoutMs) : void 0;
	Promise.resolve().then(job.task).catch((err) => {
		if (!didLogTimeout) job.logger(`${job.label}: ${formatHookErrorForLog(err)}`);
	}).finally(() => {
		if (timeout) clearTimeout(timeout);
		state.active -= 1;
		drainFireAndForgetHookQueue(state, limits);
	});
}
function drainFireAndForgetHookQueue(state, limits) {
	while (state.active < limits.maxConcurrency) {
		const next = state.queue.shift();
		if (!next) return;
		runFireAndForgetHookJob(state, next, limits);
	}
}
function fireAndForgetBoundedHook(task, label, logger = logVerbose, options = {}) {
	const state = getFireAndForgetHookState();
	const maxConcurrency = positiveIntegerOrDefault(options.maxConcurrency, DEFAULT_MAX_CONCURRENT_FIRE_AND_FORGET_HOOKS);
	const maxQueue = positiveIntegerOrDefault(options.maxQueue, DEFAULT_MAX_QUEUED_FIRE_AND_FORGET_HOOKS);
	const timeoutMs = positiveIntegerOrDefault(options.timeoutMs, DEFAULT_FIRE_AND_FORGET_HOOK_TIMEOUT_MS);
	if (state.active >= maxConcurrency && state.queue.length >= maxQueue) {
		logger(`${label}: queue full; dropping hook`);
		return;
	}
	state.queue.push({
		task,
		label,
		logger,
		timeoutMs
	});
	drainFireAndForgetHookQueue(state, { maxConcurrency });
}
//#endregion
export { fireAndForgetHook as n, formatHookErrorForLog as r, fireAndForgetBoundedHook as t };
