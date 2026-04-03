export { removeAckReactionAfterReply, shouldAckReaction } from "../channels/ack-reactions.js";
export { createSlackOutboundPayloadHarness, expectChannelInboundContextContract, primeChannelOutboundSendMock, } from "../channels/plugins/contracts/suites.js";
export { buildDispatchInboundCaptureMock } from "../channels/plugins/contracts/inbound-testkit.js";
export { createCliRuntimeCapture, firstWrittenJsonArg, spyRuntimeErrors, spyRuntimeJson, spyRuntimeLogs, } from "../cli/test-runtime-capture.js";
export type { CliMockOutputRuntime, CliRuntimeCapture } from "../cli/test-runtime-capture.js";
export { setDefaultChannelPluginRegistryForTests } from "../commands/channel-test-helpers.js";
export type { ChannelAccountSnapshot, ChannelGatewayContext } from "../channels/plugins/types.js";
export type { OpenClawConfig } from "../config/config.js";
export { callGateway } from "../gateway/call.js";
export { createEmptyPluginRegistry } from "../plugins/registry.js";
export { getActivePluginRegistry, resetPluginRuntimeStateForTest, setActivePluginRegistry, } from "../plugins/runtime.js";
export { capturePluginRegistration } from "../plugins/captured-registration.js";
export { resolveProviderPluginChoice } from "../plugins/provider-auth-choice.runtime.js";
export type { PluginRuntime } from "../plugins/runtime/types.js";
export type { RuntimeEnv } from "../runtime.js";
export type { MockFn } from "../test-utils/vitest-mock-fn.js";
export { createAuthCaptureJsonFetch, createRequestCaptureJsonFetch, installPinnedHostnameTestHooks, } from "../media-understanding/audio.test-helpers.ts";
export { isLiveTestEnabled } from "../agents/live-test-helpers.js";
export { createSandboxTestContext } from "../agents/sandbox/test-fixtures.js";
export { writeSkill } from "../agents/skills.e2e-test-helpers.js";
export { __testing } from "../acp/control-plane/manager.js";
export { __testing as acpManagerTesting } from "../acp/control-plane/manager.js";
export { runAcpRuntimeAdapterContract } from "../acp/runtime/adapter-contract.testkit.js";
export { handleAcpCommand } from "../auto-reply/reply/commands-acp.js";
export { buildCommandTestParams } from "../auto-reply/reply/commands-spawn.test-harness.js";
export { peekSystemEvents, resetSystemEventsForTest } from "../infra/system-events.js";
export { jsonResponse, requestBodyText, requestUrl } from "../test-helpers/http.js";
export { mockPinnedHostnameResolution } from "../test-helpers/ssrf.js";
export { createWhatsAppPollFixture, expectWhatsAppPollSent, } from "../test-helpers/whatsapp-outbound.js";
export { sanitizeTerminalText } from "../terminal/safe-text.js";
export { withStateDirEnv } from "../test-helpers/state-dir-env.js";
/** Create a tiny Windows `.cmd` shim fixture for plugin tests that spawn CLIs. */
export declare function createWindowsCmdShimFixture(params: {
    shimPath: string;
    scriptPath: string;
    shimLine: string;
}): Promise<void>;
type ResolveTargetMode = "explicit" | "implicit" | "heartbeat";
type ResolveTargetResult = {
    ok: boolean;
    to?: string;
    error?: unknown;
};
type ResolveTargetFn = (params: {
    to?: string;
    mode: ResolveTargetMode;
    allowFrom: string[];
}) => ResolveTargetResult;
/** Install a shared test matrix for target-resolution error handling. */
export declare function installCommonResolveTargetErrorCases(params: {
    resolveTarget: ResolveTargetFn;
    implicitAllowFrom: string[];
}): void;
