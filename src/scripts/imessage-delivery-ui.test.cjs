process.env.KNAPSACK_IMESSAGE_QA = "1";
const { mount } = require("./imessage-ui.test.cjs"),
  test = require("node:test"),
  assert = require("node:assert/strict");
const props = {
  accountId: "501",
  intentId: "11111111-1111-4111-8111-111111111111",
  handle: "owner@example.invalid",
};
const make = (invoke) =>
  mount({ invoke }, undefined, "IMessageFollowUpDelivery", props);
const enable = "Enable generic follow-up reminders on this Mac";
test("mount only reads status; separate consent required before enable", async () => {
  const app = make(async () => ({ enabled: false }));
  await app.settle();
  assert.deepEqual(
    app.calls.filter((c) => c.name === "invoke").map((c) => c.args[0]),
    ["kn_imessage_delivery_status"],
  );
  assert.equal(app.button(enable).props.disabled, true);
  await app.consent();
  await app.click(enable);
  const call = app.calls.find(
    (c) => c.args[0] === "kn_imessage_delivery_consent",
  );
  assert.equal(call.args[1].confirm, true);
  assert.equal(call.args[1].expectedAccountId, "501");
  assert.equal(call.args[1].enable, true);
  app.unmount();
});
test("pause is local first and remains visibly paused when network fails", async () => {
  const app = make(async (name) => {
    if (name === "kn_imessage_delivery_status")
      return { enabled: true, intent_id: props.intentId };
    if (name === "kn_imessage_delivery_consent") throw Error("offline");
  });
  await app.settle();
  await app.click("Pause reminder delivery");
  const calls = app.calls
    .filter((c) => c.name === "invoke")
    .map((c) => c.args[0]);
  assert.deepEqual(calls.slice(-2), [
    "kn_imessage_delivery_pause_local",
    "kn_imessage_delivery_consent",
  ]);
  assert.match(app.text(), /Paused locally; account pause may be unconfirmed/);
  app.unmount();
});
test("repeated enable clicks dispatch once and unmounted completion cannot update UI", async () => {
  let finish;
  const app = make(async (name) =>
    name === "kn_imessage_delivery_status"
      ? {}
      : new Promise((r) => (finish = r)),
  );
  await app.settle();
  await app.consent();
  const click = app.button(enable).props.onClick;
  click();
  click();
  await app.settle();
  assert.equal(
    app.calls.filter((c) => c.args[0] === "kn_imessage_delivery_consent")
      .length,
    1,
  );
  app.unmount();
  finish({ enabled: true });
  await app.settle();
});
