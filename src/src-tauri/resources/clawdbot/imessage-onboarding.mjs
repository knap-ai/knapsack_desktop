// Narrow public imsg RPC bridge. No private API, attachments, SMS, or agent dispatch.
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
export function normalizeHandle(value) {
  if (
    typeof value !== "string" ||
    value.length > 254 ||
    /[\s\x00-\x1f]/.test(value)
  )
    throw new Error("Enter your iMessage email or international phone number");
  const result = value.toLowerCase().replace(/^imessage:/, "");
  if (
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(result) &&
    !/^\+[1-9][0-9]{7,14}$/.test(result)
  )
    throw new Error("Use an iMessage email or international phone number");
  return result;
}
export function selfMessage(message, handle, chat) {
  try {
    return (
      message?.is_group === false &&
      (message.service == null ||
        String(message.service).toLowerCase() === "imessage") &&
      message?.is_from_me === true &&
      message.chat_id === chat &&
      normalizeHandle(message.sender) === handle &&
      normalizeHandle(message.chat_identifier) === handle &&
      normalizeHandle(message.destination_caller_id) === handle &&
      typeof message.guid === "string" &&
      /^[A-Za-z0-9:._/-]{1,128}$/.test(message.guid) &&
      Number.isFinite(Date.parse(message.created_at))
    );
  } catch {
    return false;
  }
}
export function proof(messages, input, now = Date.now()) {
  const handle = normalizeHandle(input.handle);

  if (
    !Number.isSafeInteger(input.issued_at) ||
    !Number.isSafeInteger(input.expires_at) ||
    now >= input.expires_at * 1000
  )
    throw new Error("Setup expired");
  const valid = messages.filter(
    (m) =>
      selfMessage(m, handle, input.chat_id) &&
      Date.parse(m.created_at) >= input.issued_at * 1000 &&
      Date.parse(m.created_at) <= now + 5000,
  );
  const test = valid.find(
    (m) =>
      m.text ===
      `Knapsack test ${input.challenge}. Reply: KN ${input.challenge}`,
  );
  const reply = valid.find(
    (m) =>
      m.text === `KN ${input.challenge}` &&
      m.guid !== test?.guid &&
      Date.parse(m.created_at) > Date.parse(test?.created_at),
  );
  if (!test || !reply)
    return {
      verified: false,
      message:
        "Waiting for the test and your distinct reply in the same self-chat. No resend was attempted.",
    };
  return { verified: true, test_guid: test.guid, reply_guid: reply.guid };
}
export async function run(input, client) {
  const request = (method, params) =>
    client.request(method, params, { timeoutMs: 8000 });
  if (input.operation === "readiness") {
    await request("chats.list", { limit: 1 });
    return {
      mac: true,
      imsg_rpc: true,
      messages_read: true,
      send_verified: false,
      gateway_verified: false,
      message:
        "Messages read access works. Sending, destination ownership and the gateway remain unverified.",
    };
  }
  const handle = normalizeHandle(input.handle);
  if (input.operation === "deliver-reminder") {
    if (
      !Number.isSafeInteger(input.chat_id) ||
      input.chat_id < 1 ||
      !Number.isSafeInteger(input.not_after) ||
      Date.now() >= input.not_after * 1000 ||
      !/^[a-f0-9]{64}$/.test(input.event_key) ||
      createHash("sha256").update(handle).digest("hex") !== input.handle_hash
    )
      throw new Error("Reminder binding expired or changed");
    const history = await request("messages.history", {
      chat_id: input.chat_id,
      limit: 5,
      attachments: false,
    });
    if (
      !(history?.messages ?? []).some((m) =>
        selfMessage(m, handle, input.chat_id),
      )
    )
      throw new Error(
        "Verified self-thread no longer available; no send attempted",
      );
    if (Date.now() >= input.not_after * 1000)
      throw new Error("Reminder admission expired");
    await request("send", {
      chat_id: input.chat_id,
      service: "imessage",
      text: `Knapsack: a reviewed follow-up needs attention. Open Knapsack to review it. [${input.event_key.slice(0, 12)}]`,
    });
    return {
      status: "submitted_unverified",
      message:
        "Reminder submitted; delivery is unverified. It will not be automatically resent.",
    };
  }
  if (input.operation === "resolve") {
    const result = await request("chats.list", { limit: 20 });
    const chats = (result?.chats ?? []).filter((c) => {
      try {
        return (
          normalizeHandle(c.identifier) === handle &&
          Number.isSafeInteger(c.id) &&
          c.id > 0
        );
      } catch {
        return false;
      }
    });
    if (chats.length !== 1)
      throw new Error(
        "Open Messages and send a note to your own iMessage address, then retry. Only the 20 most recent chat identifiers were checked.",
      );
    const chat = chats[0].id;
    const history = await request("messages.history", {
      chat_id: chat,
      limit: 5,
      attachments: false,
    });
    if (!(history?.messages ?? []).some((m) => selfMessage(m, handle, chat)))
      throw new Error(
        "A nongroup self-chat could not be verified. Missing destination identity is insufficient; no test was sent.",
      );
    return {
      chat_id: chat,
      handle_hash: createHash("sha256").update(handle).digest("hex"),
    };
  }
  if (
    !Number.isSafeInteger(input.chat_id) ||
    input.chat_id < 1 ||
    !/^[a-f0-9-]{36}$/.test(input.challenge) ||
    Date.now() >= input.expires_at * 1000
  )
    throw new Error("Invalid or expired setup binding");
  if (input.operation === "send-test") {
    // Callers durably move claimed -> testing before invoking this once. Unknown receipt is never delivery proof.
    await request("send", {
      chat_id: input.chat_id,
      service: "imessage",
      text: `Knapsack test ${input.challenge}. Reply: KN ${input.challenge}`,
    });
    return {
      verified: false,
      message:
        "Test submitted. Delivery is unverified until its Messages record and your reply are observed. Do not resend.",
    };
  }
  if (input.operation === "verify") {
    const history = await request("messages.history", {
      chat_id: input.chat_id,
      limit: 20,
      start: new Date(input.issued_at * 1000).toISOString(),
      attachments: false,
    });
    return proof(history?.messages ?? [], input);
  }
  throw new Error("Unsupported setup operation");
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  let client;
  try {
    if (process.platform !== "darwin")
      throw new Error("Finish setup on the selected Mac");
    let text = "";
    for await (const chunk of process.stdin) {
      text += chunk;
      if (text.length > 4096) throw new Error("Setup input too large");
    }
    const input = JSON.parse(text);
    const { t: createIMessageRpcClient } =
      await import("./dist/client-BcN4Qxqo.js");
    client = await createIMessageRpcClient({ cliPath: "imsg" });
    const output = await run(input, client);
    process.stdout.write(JSON.stringify({ success: true, ...output }));
  } catch {
    // Raw transport errors may include chat contents or filesystem paths.
    process.stdout.write(
      JSON.stringify({
        success: false,
        message:
          "Messages setup is unavailable. Check that imsg is installed and Messages permissions are granted on this Mac, then recheck. An interrupted send may have succeeded; check its reply instead of resending.",
      }),
    );
    process.exitCode = 1;
  } finally {
    await client?.stop();
  }
}
