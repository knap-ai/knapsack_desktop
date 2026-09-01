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
