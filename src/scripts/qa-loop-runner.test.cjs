const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  localApiHeaders,
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
