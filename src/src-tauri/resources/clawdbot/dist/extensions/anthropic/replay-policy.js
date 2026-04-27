import { NATIVE_ANTHROPIC_REPLAY_HOOKS } from "openclaw/plugin-sdk/provider-model-shared";
//#region extensions/anthropic/replay-policy.ts
const { buildReplayPolicy } = NATIVE_ANTHROPIC_REPLAY_HOOKS;
if (!buildReplayPolicy) throw new Error("Expected native Anthropic replay hooks to expose buildReplayPolicy.");
//#endregion
export { buildReplayPolicy as buildAnthropicReplayPolicy };
