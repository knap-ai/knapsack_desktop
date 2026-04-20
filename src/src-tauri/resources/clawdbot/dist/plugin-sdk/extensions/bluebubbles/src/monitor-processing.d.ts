import { type NormalizedWebhookMessage, type NormalizedWebhookReaction } from "./monitor-normalize.js";
import type { BlueBubblesCoreRuntime, BlueBubblesRuntimeEnv, WebhookTarget } from "./monitor-shared.js";
export declare function logVerbose(core: BlueBubblesCoreRuntime, runtime: BlueBubblesRuntimeEnv, message: string): void;
/**
 * Claim → process → finalize/release wrapper around the real inbound flow.
 *
 * Claim before doing any work so restart replays and in-flight concurrent
 * redeliveries both drop cleanly. Finalize (persist the GUID) only when
 * processing completed cleanly AND any reply dispatch reported success;
 * release (let a later replay try again) when processing threw OR the reply
 * pipeline reported a delivery failure via its onError callback.
 *
 * The dedupe key follows the same canonicalization rules as the debouncer
 * (`monitor-debounce.ts`): balloon events (URL previews, stickers) share
 * a logical identity with their originating text message via
 * `associatedMessageGuid`, so balloon-first vs text-first event ordering
 * cannot produce two distinct dedupe keys for the same logical message.
 */
export declare function processMessage(message: NormalizedWebhookMessage, target: WebhookTarget): Promise<void>;
export declare function processReaction(reaction: NormalizedWebhookReaction, target: WebhookTarget): Promise<void>;
