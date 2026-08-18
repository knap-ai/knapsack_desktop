const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  evaluateBrowserPersistenceCapabilities,
  lastSuccessfulChatCheck,
  localApiHeaders,
  providerSwitchAppliedButStillStarting,
  qaSetProviderTimeoutMs,
  setApiAuthStateDirForTest,
} = require("./qa-loop-runner.cjs");

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
  assert.equal(qaSetProviderTimeoutMs(undefined), 150_000);
  assert.equal(qaSetProviderTimeoutMs("180000"), 180_000);
  assert.equal(qaSetProviderTimeoutMs("invalid"), 150_000);
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
