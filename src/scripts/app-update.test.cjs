const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const test = require("node:test");
const { transform } = require("esbuild");

let appUpdateModule;

async function loadAppUpdateModule() {
  if (appUpdateModule) return appUpdateModule;
  const source = await fs.readFile(
    new URL("../src/utils/appUpdate.ts", `file://${__filename}`),
    "utf8",
  );
  const { code } = await transform(source, {
    loader: "ts",
    format: "esm",
    target: "es2022",
  });
  appUpdateModule = await import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
  return appUpdateModule;
}

test("native updater waits for installation to finish before returning", async () => {
  const { installAppUpdate } = await loadAppUpdateModule();
  const calls = [];
  let finishInstall;
  const installPending = new Promise((resolve) => {
    finishInstall = resolve;
  });

  let completed = false;
  const update = installAppUpdate(
    async () => {
      calls.push("prepare");
    },
    async () => {
      calls.push("install");
      await installPending;
    },
  ).then(() => {
    completed = true;
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls, ["prepare", "install"]);
  assert.equal(completed, false);

  finishInstall();
  await update;
  assert.equal(completed, true);
});

test("native updater never starts installation when preparation fails", async () => {
  const { installAppUpdate } = await loadAppUpdateModule();
  let installed = false;

  await assert.rejects(
    installAppUpdate(
      async () => {
        throw new Error("preparation failed");
      },
      async () => {
        installed = true;
      },
    ),
    /preparation failed/,
  );
  assert.equal(installed, false);
});

test("stubbed updater check reports availability without install or relaunch capability", async () => {
  const { checkAppUpdateStatus } = await loadAppUpdateModule();
  const calls = [];
  const result = await checkAppUpdateStatus("3.4.2+20261013", async () => {
    calls.push("check");
    return { shouldUpdate: true, manifest: { version: "v3.4.3" } };
  });

  assert.deepEqual(calls, ["check"]);
  assert.deepEqual(result, { status: "available", version: "3.4.3" });
});

test("stubbed updater check treats same normalized version as up to date", async () => {
  const { checkAppUpdateStatus } = await loadAppUpdateModule();
  const result = await checkAppUpdateStatus("v3.4.2+12", async () => ({
    shouldUpdate: true,
    manifest: { version: "3.4.2+99" },
  }));

  assert.deepEqual(result, { status: "up-to-date" });
});

test("tray update action reaches the updater hook with visible user feedback and a repeat guard", async () => {
  const main = await fs.readFile(new URL("../src-tauri/src/main.rs", `file://${__filename}`), "utf8");
  const hook = await fs.readFile(new URL("../src/hooks/useAppUpdate.tsx", `file://${__filename}`), "utf8");
  const banner = await fs.readFile(new URL("../src/components/molecules/UpdateBanner/index.tsx", `file://${__filename}`), "utf8");

  assert.match(main, /emit\("check_for_updates"/);
  assert.match(hook, /listen\('check_for_updates'/);
  assert.match(hook, /if \(checkInFlightRef\.current\) \{/);
  assert.match(hook, /checkSourceRef\.current = 'user'/);
  assert.match(hook, /status: 'up-to-date', source: checkSourceRef\.current/);
  assert.match(banner, /Checking for Knapsack updates/);
  assert.match(banner, /Knapsack is up to date/);
});
