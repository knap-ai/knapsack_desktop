const test =
    process.env.KNAPSACK_CONVERSATION_QA === "1"
      ? () => {}
      : require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path"),
  vm = require("vm"),
  ts = require("typescript");
const crypto = require("node:crypto").webcrypto;
const flush = () => new Promise((resolve) => setImmediate(resolve));
const compile = (name) =>
  ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "../src", name), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText;
const helperExports = {};
vm.runInNewContext(compile("utils/accountConversationState.ts"), {
  exports: helperExports,
  require: () => {
    throw Error("Unexpected live dependency");
  },
  TextEncoder,
});
const id = "11111111-1111-4111-8111-111111111111",
  other = "22222222-2222-4222-8222-222222222222";
const messages = [
  { id: "stable-user", role: "user", text: "Find follow-ups I owe", ts: 100 },
  {
    id: "stable-assistant",
    role: "assistant",
    text: "Review the draft before sending.",
    ts: 200,
  },
];
const document = {
  schemaVersion: 1,
  conversationId: id,
  title: "Follow-ups",
  messages,
};
const receipt = {
  conversation_id: id,
  revision: 2,
  mutation_id: other,
  source_device_id: other,
  key_version: other,
  sha256: "a".repeat(64),
  updated_at: 1791331200,
};
const record = { account_id: "501", receipt, document };
const devices = {
  account_id: "501",
  current_device_id: id,
  devices: [
    { device_id: id, name: "MacBook", platform: "macos", revoked: false },
    { device_id: other, name: "Mac Studio", platform: "macos", revoked: false },
  ],
  account: {
    account_id: "501",
    epoch: 3,
    recovery_mode: "account_recovery_v1",
    account_recovery_available: true,
  },
};
const directory = {
  account_id: "501",
  conversations: [receipt],
  execution_location: "local",
  remote_execution_available: false,
  automatic_sync_available: false,
};
function mount(overrides = {}, listener) {
  const slots = [],
    effects = [],
    calls = [],
    events = new Map(),
    storage = new Map(),
    adoptions = [],
    scopes = [];
  let cursor = 0,
    dirty = false,
    tree,
    active = true;
  let props = {
    chatId: "main",
    title: "Follow-ups",
    messages,
    accountHint: "fixture@example.invalid",
    busy: false,
    onBusy: (value) => calls.push({ name: "busy", args: [value] }),
    onScope: (value) => scopes.push(value),
    onAdopt: (value, binding) => {
      adoptions.push({ messages: value, binding });
      props.messages = value;
      dirty = true;
    },
    onReset: () => calls.push({ name: "reset", args: [] }),
  };
  const api = {
    stateBackupErrorMessage: (error) => error.message || String(error),
  };
  const defaults = {
    getAccountDevices: async () => devices,
    listAccountConversations: async () => directory,
    readAccountConversation: async () => record,
    publishAccountConversation: async (account, expected, doc) => ({
      ...receipt,
      conversation_id: doc.conversationId,
      revision: expected + 1,
    }),
    revokeAccountDevice: async () => {},
    cancelStateBackupOperation: async () => {},
    ...overrides,
  };
  for (const [name, fn] of Object.entries(defaults))
    api[name] = (...args) => {
      calls.push({ name, args });
      return fn(...args);
    };
  const hooks = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots))
        slots[i] = typeof initial === "function" ? initial() : initial;
      return [
        slots[i],
        (next) => {
          const value = typeof next === "function" ? next(slots[i]) : next;
          if (!Object.is(value, slots[i])) {
            slots[i] = value;
            dirty = true;
          }
        },
      ];
    },
    useRef(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: initial };
      return slots[i];
    },
    useEffect(fn, deps) {
      const i = cursor++;
      if (
        !slots[i] ||
        deps.some((dep, n) => !Object.is(dep, slots[i].deps[n]))
      ) {
        const old = slots[i];
        slots[i] = { deps };
        effects.push(() => {
          old?.cleanup?.();
          slots[i].cleanup = fn();
        });
      }
    },
  };
  const jsx = (type, props) => ({ type, props }),
    exports = {};
  vm.runInNewContext(
    compile("components/organisms/SharedConversationPanel.tsx"),
    {
      exports,
      crypto,
      TextEncoder,
      localStorage: {
        getItem: (key) => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value),
      },
      require(name) {
        if (name === "react") return hooks;
        if (name === "react/jsx-runtime")
          return { jsx, jsxs: jsx, Fragment: "fragment" };
        if (name === "src/utils/accountConversationState") return helperExports;
        if (
          name === "src/api/stateBackup" ||
          name === "src/api/accountConversations"
        )
          return api;
        if (name === "@tauri-apps/api/event")
          return {
            listen:
              listener ||
              (async (event, callback) => {
                events.set(event, callback);
                return () => events.delete(event);
              }),
          };
        throw Error(name);
      },
    },
  );
  function render() {
    dirty = false;
    cursor = 0;
    tree = exports.default(props);
    effects.splice(0).forEach((fn) => fn());
  }
  function elements(node) {
    if (arguments.length === 0) node = tree;
    if (Array.isArray(node)) return node.flatMap((value) => elements(value));
    if (!node || typeof node !== "object") return [];
    return [node, ...elements(node.props?.children ?? null)];
  }
  function text(node) {
    if (arguments.length === 0) node = tree;
    if (Array.isArray(node)) return node.map((value) => text(value)).join(" ");
    if (node == null || typeof node === "boolean") return "";
    if (typeof node !== "object") return String(node);
    return text(node.props?.children ?? null);
  }
  const app = {
    calls,
    storage,
    adoptions,
    scopes,
    text,
    elements,
    tree: () => tree,
    async settle() {
      for (let i = 0; i < 30; i++) {
        await flush();
        if (!active || !dirty) return;
        render();
      }
      throw Error("Did not settle");
    },
    button(label) {
      return elements().find(
        (el) =>
          el.type === "button" &&
          text(el).replace(/\s+/g, " ").trim() === label,
      );
    },
    async click(label) {
      const el = this.button(label);
      assert.ok(el, `Missing ${label}`);
      assert.equal(!!el.props.disabled, false, `Disabled ${label}`);
      el.props.onClick();
      await this.settle();
    },
    async consent() {
      const label = elements().find(
        (el) =>
          el.type === "label" &&
          text(el).includes("I reviewed this conversation"),
      );
      elements(label)
        .find((el) => el.type === "input")
        .props.onChange({ target: { checked: true } });
      await this.settle();
    },
    async emit(event) {
      events.get(event)?.({ payload: {} });
      await this.settle();
    },
    async update(next) {
      props = { ...props, ...next };
      render();
      await this.settle();
    },
    unmount() {
      active = false;
      slots.forEach((slot) => slot?.cleanup?.());
    },
  };
  render();
  return app;
}
const open = async (app) => {
  await app.settle();
  await app.click("Continue conversation across computers");
  await app.click("Check shared account conversations");
};
const reviewButton = (app) =>
  app
    .elements()
    .find(
      (el) =>
        el.type === "button" && app.text(el).startsWith("Review conversation"),
    );

test("opening sharing never uploads, reads account or activates work", async () => {
  const app = mount();
  await app.settle();
  await app.click("Continue conversation across computers");
  assert.equal(
    app.calls.filter((c) =>
      [
        "getAccountDevices",
        "publishAccountConversation",
        "readAccountConversation",
      ].includes(c.name),
    ).length,
    0,
  );
  assert.match(app.text(), /Execution: this computer/);
  assert.match(
    app.text(),
    /Remote execution and automatic synchronization are unavailable/,
  );
});
test("publish requires consent and repeated clicks dispatch once", async () => {
  let finish;
  const app = mount({
    publishAccountConversation: () =>
      new Promise((resolve) => (finish = resolve)),
  });
  await open(app);
  assert.equal(app.button("Publish this conversation").props.disabled, true);
  await app.consent();
  const publish = app.button("Publish this conversation");
  publish.props.onClick();
  publish.props.onClick();
  await app.settle();
  const call = app.calls.find((c) => c.name === "publishAccountConversation");
  assert.equal(
    app.calls.filter((c) => c.name === "publishAccountConversation").length,
    1,
  );
  assert.equal(call.args[0], "501");
  assert.equal(call.args[1], 0);
  assert.equal(call.args[3], true);
  finish({
    ...receipt,
    conversation_id: call.args[2].conversationId,
    revision: 1,
  });
  await app.settle();
  assert.match(app.text(), /Published account revision 1/);
});
test("interrupted publish retries the same stable conversation and revision", async () => {
  const app = mount({
    publishAccountConversation: async () => {
      throw Error("Network interrupted");
    },
  });
  await open(app);
  await app.consent();
  await app.click("Publish this conversation");
  await app.click("Publish this conversation");
  const calls = app.calls.filter(
    (c) => c.name === "publishAccountConversation",
  );
  assert.equal(calls.length, 2);
  assert.equal(
    calls[0].args[2].conversationId,
    calls[1].args[2].conversationId,
  );
  assert.equal(calls[0].args[1], calls[1].args[1]);
  assert.ok([...app.storage.keys()].every((key) => key.includes(":501:")));
  assert.equal(app.adoptions.length, 0);
});
test("remote history remains a preview until reviewed and has no executable metadata", async () => {
  const app = mount();
  await open(app);
  reviewButton(app).props.onClick();
  await app.settle();
  assert.equal(app.adoptions.length, 0);
  await app.consent();
  await app.click("Continue reviewed history here");
  assert.equal(app.adoptions.length, 1);
  assert.deepEqual(
    JSON.parse(JSON.stringify(app.adoptions[0].messages)),
    messages,
  );
  assert.equal(
    app.calls.filter((c) => c.name === "publishAccountConversation").length,
    0,
  );
});
test("changed local draft blocks a stale review without overwriting it", async () => {
  const app = mount();
  await open(app);
  reviewButton(app).props.onClick();
  await app.settle();
  await app.consent();
  await app.update({
    messages: [
      ...messages,
      { id: "new-local", role: "user", text: "New draft", ts: 300 },
    ],
  });
  await app.click("Continue reviewed history here");
  assert.equal(app.adoptions.length, 0);
  assert.match(app.text(), /draft changed during review/);
});
test("account switch fences pending decrypt results and clears consent", async () => {
  let finish;
  const app = mount({
    readAccountConversation: () => new Promise((resolve) => (finish = resolve)),
  });
  await open(app);
  reviewButton(app).props.onClick();
  await app.settle();
  await app.emit("knapsack-disconnected");
  finish(record);
  await app.settle();
  assert.equal(app.adoptions.length, 0);
  assert.equal(app.button("Continue reviewed history here"), undefined);
  assert.ok(app.calls.some((c) => c.name === "cancelStateBackupOperation"));
});
test("cancel and unmount ignore late publish outcomes and never replay requests", async () => {
  let finish;
  const app = mount({
    publishAccountConversation: () =>
      new Promise((resolve) => (finish = resolve)),
  });
  await open(app);
  await app.consent();
  await app.click("Publish this conversation");
  await app.click("Cancel shared operation");
  app.unmount();
  finish({ ...receipt, revision: 1 });
  await app.settle();
  assert.equal(app.adoptions.length, 0);
  assert.equal(
    app.calls.filter((c) => c.name === "publishAccountConversation").length,
    1,
  );
  assert.ok(app.calls.some((c) => c.name === "cancelStateBackupOperation"));
});
test("account change listener failure blocks sharing", async () => {
  const app = mount({}, async () => {
    throw Error("Listener missing");
  });
  await app.settle();
  await app.click("Continue conversation across computers");
  assert.equal(
    app.button("Check shared account conversations").props.disabled,
    true,
  );
  assert.match(app.text(), /Sharing is blocked/);
});
test("revoked current computer cannot publish", async () => {
  const app = mount({
    getAccountDevices: async () => ({
      ...devices,
      devices: devices.devices.map((row) => ({ ...row, revoked: true })),
    }),
  });
  await open(app);
  await app.consent();
  assert.equal(app.button("Publish this conversation").props.disabled, true);
});
test("shared text projection drops approvals, prompt actions, attachments and system messages", () => {
  const result = helperExports.projectSharedMessages([
    {
      ...messages[0],
      confirmedActionPrompts: ["send"],
      promptActions: [{ prompt: "execute" }],
      attachments: ["secret"],
    },
    { id: "system", role: "system", text: "run", ts: 1 },
    { id: "welcome-one", role: "assistant", text: "welcome", ts: 1 },
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), [messages[0]]);
});
test("reviewed merge keeps stable IDs and catches competing edits to the same message", () => {
  const local = {
    ...document,
    messages: [
      ...messages,
      { id: "local", role: "user", text: "Local offline edit", ts: 500 },
    ],
  };
  const remote = {
    ...document,
    messages: [
      ...messages,
      { id: "remote", role: "assistant", text: "Other computer edit", ts: 400 },
    ],
  };
  assert.equal(
    helperExports.mergeSharedConversation(remote, local).messages.length,
    4,
  );
  assert.throws(
    () =>
      helperExports.mergeSharedConversation(remote, {
        ...document,
        messages: [{ ...messages[0], text: "Different same-ID content" }],
      }),
    /edited on both computers/,
  );
});
test("account and conversation identity must match before adoption", () => {
  assert.throws(
    () => helperExports.reviewedConversation(record, "502", id),
    /Account or conversation changed/,
  );
  assert.throws(
    () => helperExports.reviewedConversation(record, "501", other),
    /Account or conversation changed/,
  );
});

module.exports = { mount, open, reviewButton };

test("actual agent response boundary rejects a success delivered after account reset", async () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/components/organisms/ClawdChat/index.tsx"),
    "utf8",
  );
  const start = source.indexOf("const agentOut = (await agentRes.json())");
  const end = source.indexOf("if (!agentRes.ok && agentOut.noFallback)", start);
  const code = ts.transpileModule(
    `exports.deliver = async function(agentRes,executionEpoch,sharedChatEpoch,controller,onAccepted){${source.slice(start, end)}onAccepted(agentOut);}`,
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText;
  const output = {};
  vm.runInNewContext(code, { exports: output, DOMException });
  let resolve,
    accepted = 0;
  const epoch = { current: 1 },
    controller = new AbortController();
  const pending = output.deliver(
    { json: () => new Promise((done) => (resolve = done)) },
    1,
    epoch,
    controller,
    () => accepted++,
  );
  epoch.current = 2;
  resolve({ ok: true, reply: "Old account private reply" });
  await assert.rejects(pending, (error) => error.name === "AbortError");
  assert.equal(accepted, 0);
  await output.deliver(
    { json: async () => ({ ok: true, reply: "Current account reply" }) },
    2,
    epoch,
    controller,
    () => accepted++,
  );
  assert.equal(accepted, 1);
});

test("partial account listener registration is cleaned up when the second listener fails", async () => {
  let stopped = 0;
  const app = mount({}, async (event) => {
    if (event === "knapsack-connected")
      return () => {
        stopped++;
      };
    throw Error("Second listener unavailable");
  });
  await app.settle();
  await app.click("Continue conversation across computers");
  assert.equal(
    app.button("Check shared account conversations").props.disabled,
    true,
  );
  assert.equal(stopped, 1);
  app.unmount();
  assert.equal(stopped, 1);
});
