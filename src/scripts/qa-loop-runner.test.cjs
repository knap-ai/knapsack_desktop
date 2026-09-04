const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  buildGroupChatQaRequest,
  evaluateBrowserPersistenceCapabilities,
  findManagedBrowserCommandLine,
  lastSuccessfulChatCheck,
  localApiHeaders,
  parseListenerPids,
  providerSwitchAppliedButStillStarting,
  qaSetProviderTimeoutMs,
  readinessProviderModels,
  setApiAuthStateDirForTest,
  shouldPreserveExistingQaState,
} = require("./qa-loop-runner.cjs");

test("QA port cleanup parses unique listener pids", () => {
  assert.deepEqual(parseListenerPids("123\n456\n123\ninvalid\n"), [123, 456]);
});

test.afterEach(() => setApiAuthStateDirForTest(null));

test("local API requests use the active QA state token", () => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), "knapsack-qa-loop-"));
  fs.writeFileSync(
    path.join(stateDir, "tokens.json"),
    JSON.stringify({ desktop_api_token: "qa-desktop-token" }),
  );
  setApiAuthStateDirForTest(stateDir);

  assert.equal(
    localApiHeaders("http://127.0.0.1:8897/api/clawd/service/status")["x-knapsack-api-token"],
    "qa-desktop-token",
  );
  fs.rmSync(stateDir, { recursive: true, force: true });
});

test("non-local requests never receive the desktop API token", () => {
  setApiAuthStateDirForTest("/path/that/does/not/matter");
  assert.deepEqual(localApiHeaders("https://api.knapsack.ai/health", { accept: "application/json" }), {
    accept: "application/json",
  });
});

test("provider switching waits longer than the backend restart budget", () => {
  assert.equal(qaSetProviderTimeoutMs(undefined), 240_000);
  assert.equal(qaSetProviderTimeoutMs("180000"), 240_000);
  assert.equal(qaSetProviderTimeoutMs("300000"), 300_000);
  assert.equal(qaSetProviderTimeoutMs("invalid"), 240_000);
});

test("Google QA provider alias routes through the native Gemini provider", () => {
  assert.deepEqual(readinessProviderModels({
    providers: ["google"],
    modelOverride: "gemini-3.8-flash",
  }), [["gemini", ["gemini-3.8-flash"]]]);
});

test("an applied provider switch can recover readiness without switching again", () => {
  assert.equal(
    providerSwitchAppliedButStillStarting(503, {
      message: "Provider switched, but gateway did not become ready within 45s",
    }),
    true,
  );
  assert.equal(
    providerSwitchAppliedButStillStarting(503, {
      message: "API key saved, but gateway did not become ready within 45s",
    }),
    true,
  );
  assert.equal(providerSwitchAppliedButStillStarting(503, { message: "API key cannot be empty" }), false);
  assert.equal(providerSwitchAppliedButStillStarting(200, { message: "Switched to Gemini" }), false);
});

test("agent capabilities continue on the provider left active by the chat loop", () => {
  const checks = [
    { provider: "gemini", model: "gemini-2.5-flash", ok: true, skipped: false },
    { provider: "groq", model: "openai/gpt-oss-120b", ok: false, skipped: false },
    { provider: "openrouter", model: "openrouter/auto", ok: true, skipped: false },
  ];
  assert.deepEqual(lastSuccessfulChatCheck(checks), checks[2]);
  assert.equal(lastSuccessfulChatCheck([{ ok: false }, { ok: true, skipped: true }]), null);
});

test("group chat QA uses structured members and never runtime agent ids", () => {
  const request = buildGroupChatQaRequest("qa-group-regression");
  assert.equal(request.sessionId, "qa-group-regression");
  assert.equal(request.noFallback, true);
  assert.deepEqual(request.teamMembers.map(({ id, name }) => ({ id, name })), [
    { id: "scout", name: "Scout" },
    { id: "atlas", name: "Atlas" },
  ]);
  assert.equal(JSON.stringify(request).includes("agentId"), false);
  assert.equal(JSON.stringify(request).includes("sessions_spawn"), false);
});

test("managed browser persistence rejects sync and insecure password-store blockers", () => {
  assert.deepEqual(
    evaluateBrowserPersistenceCapabilities({
      commandLine: "chrome --disable-sync --password-store=basic",
      preferences: {},
    }),
    {
      ok: false,
      blockedFlags: ["--disable-sync", "--password-store=basic"],
      passwordSavingEnabled: true,
      paymentSavingEnabled: true,
    },
  );
});

test("managed browser persistence accepts enabled password and payment storage", () => {
  assert.deepEqual(
    evaluateBrowserPersistenceCapabilities({
      commandLine: "chrome --user-data-dir=/tmp/knapsack-browser",
      preferences: {
        credentials_enable_service: true,
        autofill: { credit_card_enabled: true },
      },
    }),
    {
      ok: true,
      blockedFlags: [],
      passwordSavingEnabled: true,
      paymentSavingEnabled: true,
    },
  );
  assert.equal(
    evaluateBrowserPersistenceCapabilities({
      commandLine: "chrome",
      preferences: { autofill: { credit_card_enabled: false } },
    }).ok,
    false,
  );
});

test("managed browser command line falls back to the dedicated debugging port", () => {
  const output = [
    "chrome --user-data-dir=/Users/mark/Library/Application Support/Google/Chrome",
    "chrome --remote-debugging-port=18800 --user-data-dir=/tmp/managed-browser",
  ].join("\n");

  assert.equal(
    findManagedBrowserCommandLine(output, "/tmp/profile-not-visible-in-process-list"),
    "chrome --remote-debugging-port=18800 --user-data-dir=/tmp/managed-browser",
  );
});

test("existing isolated OAuth state is preserved unless explicitly disabled", () => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), "knapsack-qa-state-"));
  fs.writeFileSync(path.join(stateDir, "tokens.json"), "{}\n");

  assert.equal(shouldPreserveExistingQaState({}, stateDir), true);
  assert.equal(
    shouldPreserveExistingQaState({ KNAPSACK_QA_PRESERVE_STATE: "0" }, stateDir),
    false,
  );
  assert.equal(
    shouldPreserveExistingQaState({ KNAPSACK_QA_PRESERVE_STATE: "1" }, stateDir),
    true,
  );
  fs.rmSync(stateDir, { recursive: true, force: true });
});
