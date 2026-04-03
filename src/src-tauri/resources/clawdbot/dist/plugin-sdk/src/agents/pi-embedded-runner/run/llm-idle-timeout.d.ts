import type { StreamFn } from "@mariozechner/pi-agent-core";
import type { OpenClawConfig } from "../../../config/config.js";
/**
 * Default idle timeout for LLM streaming responses in milliseconds.
 * If no token is received within this time, the request is aborted.
 * Set to 0 to disable (never timeout).
 * Default: 60 seconds.
 */
export declare const DEFAULT_LLM_IDLE_TIMEOUT_MS = 60000;
/**
 * Resolves the LLM idle timeout from configuration.
 * @param cfg - OpenClaw configuration
 * @returns Idle timeout in milliseconds, or 0 to disable
 */
export declare function resolveLlmIdleTimeoutMs(cfg?: OpenClawConfig): number;
/**
 * Wraps a stream function with idle timeout detection.
 * If no token is received within the specified timeout, the request is aborted.
 *
 * @param baseFn - The base stream function to wrap
 * @param timeoutMs - Idle timeout in milliseconds
 * @param onIdleTimeout - Optional callback invoked when idle timeout triggers
 * @returns A wrapped stream function with idle timeout detection
 */
export declare function streamWithIdleTimeout(baseFn: StreamFn, timeoutMs: number, onIdleTimeout?: (error: Error) => void): StreamFn;
