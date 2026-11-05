const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(
  process.env.KNAPSACK_QA_PLAYWRIGHT_PATH || "playwright",
);
const output =
  process.env.KNAPSACK_NOTES_QA_OUTPUT ||
  path.resolve(__dirname, "../../../review");
fs.mkdirSync(output, { recursive: true });
const fixture =
  process.env.KNAPSACK_NOTES_QA_URL ||
  "http://127.0.0.1:1465/qa-fixtures/meeting-notes.html";
(async () => {
  const browser = await chromium.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-first-run", "--disable-background-networking"],
  });
  const page = await browser.newPage({
    viewport: { width: 1120, height: 800 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    window.__TAURI_IPC__ = ({ callback }) =>
      queueMicrotask(() => window[`_${callback}`]?.(null));
  });
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === new URL(fixture).origin
      ? route.continue()
      : route.abort(),
  );
  await page.goto(fixture);
  await page.getByRole("button", { name: "Edit", exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Copy for Slack", exact: true })
    .click();
  await page.waitForFunction(() => window.notesQA.copies.length === 1);
  assert(
    (await page.evaluate(() => window.notesQA.copies[0])).includes(
      "• Owner: Jo",
    ),
  );
  assert.equal(
    await page.evaluate(
      () =>
        window.notesQA.requests.filter((s) => s.includes("slack-notes")).length,
    ),
    0,
  );
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByRole("button", { name: "Done", exact: true }).waitFor();
  const p = page
    .locator(".ProseMirror p")
    .filter({ hasText: "Synthetic discussion notes" })
    .first();
  await p.click();
  await page.keyboard.press("End");
  await page.keyboard.type(" Added synthetic edit.");
  await page.waitForTimeout(800);
  await page
    .locator(".notetaker-note__scroll-area")
    .evaluate((e) => (e.scrollTop = e.scrollHeight));
  await page.waitForTimeout(100);
  const box = await page
    .getByRole("button", { name: "Done", exact: true })
    .boundingBox();
  assert(box.y >= 0 && box.y < 180);
  await page.screenshot({
    path: path.join(output, "notes-ui-long-scroll.png"),
  });
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).waitFor();
  assert.equal(await page.locator("table tr").count(), 3);
  assert((await page.locator("table").innerText()).includes("one|two"));
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.evaluate(() => (window.notesQA.failSave = true));
  await page
    .locator(".ProseMirror p")
    .filter({ hasText: "Synthetic discussion notes" })
    .first()
    .click();
  await page.keyboard.press("End");
  await page.keyboard.type(" Unsaved synthetic edit.");
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByText("Could not save. Your draft is kept on this device.")
    .waitFor();
  assert(
    await page.getByRole("button", { name: "Done", exact: true }).isVisible(),
  );
  assert(
    (
      await page.evaluate(() => localStorage.getItem("meeting-notes-draft:42"))
    ).includes("Unsaved synthetic edit."),
  );
  await page.evaluate(() => (window.notesQA.failSave = false));
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).waitFor();
  await page
    .locator(".notetaker-note__scroll-area")
    .evaluate((e) => (e.scrollTop = 0));
  await page.getByRole("button", { name: "Share to Slack…" }).click();
  await page.getByLabel("Slack workspace").selectOption("qa");
  await page.getByLabel("Slack channel").selectOption("C-QA");
  await page.getByRole("button", { name: "Preview send to channel" }).click();
  await page.getByRole("region", { name: "Slack send preview" }).waitFor();
  await page.screenshot({ path: path.join(output, "notes-ui-slack.png") });
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(
    await page.evaluate(
      () =>
        window.notesQA.requests.filter((s) => s.includes("slack-notes/send"))
          .length,
    ),
    0,
  );
  await page.setViewportSize({ width: 460, height: 760 });
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .locator(".notetaker-note__scroll-area")
    .evaluate((e) => (e.scrollTop = e.scrollHeight));
  await page.waitForTimeout(100);
  const narrow = await page
    .getByRole("button", { name: "Done", exact: true })
    .boundingBox();
  assert(narrow.y >= 0 && narrow.y < 220);
  await page.screenshot({ path: path.join(output, "notes-ui-narrow.png") });
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.evaluate(() => {
    window.notesQA.pending = 2;
    window.notesQA.authError =
      "Knapsack auth failed — please sign in to Knapsack again";
  });
  await page.getByRole("button", { name: "Sign in to Knapsack" }).waitFor();
  await page
    .locator(".notetaker-note__scroll-area")
    .evaluate((e) => (e.scrollTop = 0));
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelector(".notetaker-note__scroll-area").scrollTop = 0;
  });
  await page.screenshot({ path: path.join(output, "notes-ui-auth.png") });
  await page.getByRole("button", { name: "Sign in to Knapsack" }).click();
  assert.equal(await page.evaluate(() => window.notesQA.reconnected), 1);
  await page.getByRole("button", { name: "Retry saved audio" }).click();
  await page
    .getByText("Transcription needs attention")
    .waitFor({ state: "hidden" });
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    "PASS: immediate copy, structured-table editing/save, long-scroll Done, failed-save draft retention/retry, explicit Slack preview/cancel/no-post, narrow layout, inline sign-in handoff and synthetic recovery state.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
