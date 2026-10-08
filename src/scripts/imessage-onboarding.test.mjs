import test from "node:test";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import {
  proof,
  run,
  normalizeHandle,
} from "../src-tauri/resources/clawdbot/imessage-onboarding.mjs";
const issued = 1800000000,
  challenge = "11111111-1111-4111-8111-111111111111",
  handle = "owner@example.invalid";
const input = {
  handle,
  chat_id: 7,
  challenge,
  issued_at: issued,
  expires_at: issued + 600,
};
const message = (text, guid, time) => ({
  sender: handle,
  destination_caller_id: handle,
  chat_identifier: handle,
  chat_id: 7,
  is_group: false,
  is_from_me: true,
  guid,
  created_at: new Date(time * 1000).toISOString(),
  text,
});
const sent = message(
    `Knapsack test ${challenge}. Reply: KN ${challenge}`,
    "test-guid",
    issued + 1,
  ),
  reply = message(`KN ${challenge}`, "reply-guid", issued + 2);
test("read probe never claims send or gateway verified", async () => {
  const calls = [];
  const value = await run(
    { operation: "readiness" },
    {
      request: async (...args) => {
        calls.push(args);
        return { chats: [] };
      },
    },
  );
  assert.equal(value.send_verified, false);
  assert.equal(value.gateway_verified, false);
  assert.deepEqual(calls[0].slice(0, 2), ["chats.list", { limit: 1 }]);
});
test("requires actual observed test and distinct later reply", () => {
  assert.equal(proof([sent, reply], input, (issued + 3) * 1000).verified, true);
  for (const rows of [
    [],
    [sent],
    [reply],
    [sent, { ...reply, guid: sent.guid }],
    [sent, { ...reply, created_at: sent.created_at }],
  ])
    assert.equal(proof(rows, input, (issued + 3) * 1000).verified, false);
});
test("rejects groups, ambiguous identity, wrong account handle and stale history", () => {
  for (const change of [
    { is_group: true },
    { service: "SMS" },
    { destination_caller_id: undefined },
    { sender: "other@example.invalid" },
    { chat_identifier: "other@example.invalid" },
    { chat_id: 8 },
    { is_from_me: false },
    { created_at: new Date((issued - 1) * 1000).toISOString() },
  ])
    assert.equal(
      proof([sent, { ...reply, ...change }], input, (issued + 3) * 1000)
        .verified,
      false,
    );
  assert.throws(() => proof([sent, reply], input, (issued + 601) * 1000));
});
test("send forces iMessage exact chat and never treats ok as delivery", async () => {
  const calls = [];
  const result = await run(
    {
      ...input,
      expires_at: Math.floor(Date.now() / 1000) + 60,
      operation: "send-test",
    },
    {
      request: async (...args) => {
        calls.push(args);
        return { ok: true };
      },
    },
  );
  assert.equal(result.verified, false);
  assert.equal(calls[0][0], "send");
  assert.equal(calls[0][1].service, "imessage");
  assert.equal(calls[0][1].chat_id, 7);
  assert.equal(calls[0][1].to, undefined);
});
test("unknown send throws once without automatic resend", async () => {
  let calls = 0;
  await assert.rejects(() =>
    run(
      {
        ...input,
        expires_at: Math.floor(Date.now() / 1000) + 60,
        operation: "send-test",
      },
      {
        request: async () => {
          calls++;
          throw Error("unknown receipt");
        },
      },
    ),
  );
  assert.equal(calls, 1);
});
test("destination lookup is bounded and rejects missing self identity", async () => {
  let calls = [];
  const client = {
    request: async (method, params) => {
      calls.push([method, params]);
      return method === "chats.list"
        ? { chats: [{ id: 7, identifier: handle }] }
        : { messages: [sent] };
    },
  };
  assert.equal(
    (await run({ operation: "resolve", handle }, client)).chat_id,
    7,
  );
  assert.equal(calls[0][1].limit, 20);
  assert.equal(calls[1][1].limit, 5);
  await assert.rejects(() =>
    run(
      { operation: "resolve", handle },
      {
        request: async (method) =>
          method === "chats.list"
            ? { chats: [{ id: 7, identifier: handle }] }
            : { messages: [{ ...sent, destination_caller_id: undefined }] },
      },
    ),
  );
  assert.throws(() => normalizeHandle("owner@example.invalid\nsecret"));
});

const reminder = () => ({
  operation: "deliver-reminder",
  handle,
  chat_id: 7,
  handle_hash: createHash("sha256").update(handle).digest("hex"),
  event_key: "a".repeat(64),
  not_after: Math.floor(Date.now() / 1000) + 10,
});
test("generic reminder never includes source content and uses pinned imessage self-thread", async () => {
  const calls = [];
  const result = await run(
    { ...reminder(), text: "SECRET BRIEF", draft: "SECRET DRAFT" },
    {
      request: async (method, params) => {
        calls.push([method, params]);
        return { messages: [{ ...sent, service: "iMessage" }] };
      },
    },
  );
  assert.equal(result.status, "submitted_unverified");
  assert.deepEqual(calls[0], [
    "messages.history",
    { chat_id: 7, limit: 5, attachments: false },
  ]);
  assert.equal(calls[1][0], "send");
  assert.equal(calls[1][1].service, "imessage");
  assert.equal(calls[1][1].chat_id, 7);
  assert.doesNotMatch(calls[1][1].text, /SECRET/);
});
test("changed binding, expired lease, group, SMS or ambiguous destination never sends", async () => {
  for (const change of [
    { not_after: 1 },
    { handle_hash: "b".repeat(64) },
    { chat_id: 0 },
  ]) {
    let called = false;
    await assert.rejects(
      run(
        { ...reminder(), ...change },
        {
          request: async () => {
            called = true;
          },
        },
      ),
    );
    assert.equal(called, false);
  }
  for (const change of [
    { is_group: true },
    { service: "SMS" },
    { destination_caller_id: "other@example.invalid" },
  ]) {
    const calls = [];
    await assert.rejects(
      run(reminder(), {
        request: async (method) => {
          calls.push(method);
          return { messages: [{ ...sent, ...change }] };
        },
      }),
    );
    assert.deepEqual(calls, ["messages.history"]);
  }
});
test("uncertain transport send attempts once without retry or fallback", async () => {
  let sends = 0;
  await assert.rejects(
    run(reminder(), {
      request: async (method) => {
        if (method === "send") {
          sends++;
          throw Error("uncertain");
        }
        return { messages: [sent] };
      },
    }),
  );
  assert.equal(sends, 1);
});
