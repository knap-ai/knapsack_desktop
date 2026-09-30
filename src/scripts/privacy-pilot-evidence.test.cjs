const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

async function loadModule() {
  const filename = new URL(
    "../src/utils/privacyPilotEvidence.ts",
    `file://${__filename}`,
  );
  const source = await fs.readFile(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const storage = new Map();
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module,
    exports: module.exports,
    Date,
    JSON,
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  });
  return { api: module.exports, storage };
}

const base = {
  trackingId: "paid-click",
  experimentId: "privacy-openclaw-2026-09",
  landingVariant: "lawyer",
  role: "privacy-lawyer",
  receivedAt: Date.parse("2026-09-01T00:00:00Z"),
  experimentWeek: 0,
  inferenceSurface: "direct_chat",
  privacyModeEnabled: true,
  gclid: "paid-click",
  utmSource: "google",
  utmMedium: "cpc",
};

test("Privacy Mode evidence stays local and records no content or account identity", async () => {
  const { api, storage } = await loadModule();
  const receipt = api.recordPrivacyPilotEvidence({
    ...base,
    now: Date.parse("2026-09-01T01:00:00Z"),
    connectedDataSources: ["local_file_attachment"],
  });

  assert.equal(storage.size, 1);
  assert.equal(receipt.privacy_mode, true);
  assert.deepEqual(Array.from(receipt.active_weeks), [0]);
  assert.equal(receipt.connected_data_usage[0].source, "local_file_attachment");
  assert.equal(JSON.stringify(receipt).includes("email"), false);
  assert.equal(JSON.stringify(receipt).includes("content"), false);
});

test("weekly return and connected sources are deduplicated", async () => {
  const { api } = await loadModule();
  api.recordPrivacyPilotEvidence({
    ...base,
    now: Date.parse("2026-09-01T01:00:00Z"),
  });
  api.recordPrivacyPilotEvidence({
    ...base,
    experimentWeek: 1,
    inferenceSurface: "agent_chat",
    connectedDataSources: [
      "native_google_email_calendar",
      "local_file_attachment",
    ],
    now: Date.parse("2026-09-08T01:00:00Z"),
  });
  const receipt = api.recordPrivacyPilotEvidence({
    ...base,
    experimentWeek: 1,
    inferenceSurface: "agent_chat",
    connectedDataSources: [
      "native_google_email_calendar",
      "local_file_attachment",
    ],
    now: Date.parse("2026-09-08T02:00:00Z"),
  });

  assert.deepEqual(Array.from(receipt.active_weeks), [0, 1]);
  assert.deepEqual(Array.from(receipt.inference_surfaces), [
    "direct_chat",
    "agent_chat",
  ]);
  assert.deepEqual(
    Array.from(receipt.connected_data_usage, (item) => item.source),
    ["native_google_email_calendar", "local_file_attachment"],
  );
  assert.equal(
    receipt.last_successful_inference_at,
    "2026-09-08T02:00:00.000Z",
  );
});

test("normal mode never creates a privacy receipt", async () => {
  const { api, storage } = await loadModule();
  assert.equal(
    api.recordPrivacyPilotEvidence({ ...base, privacyModeEnabled: false }),
    null,
  );
  assert.equal(storage.size, 0);
});
