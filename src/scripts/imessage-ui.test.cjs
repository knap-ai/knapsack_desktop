const test =
    process.env.KNAPSACK_IMESSAGE_QA === "1" ? () => {} : require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path"),
  vm = require("vm"),
  ts = require("typescript"),
  crypto = require("node:crypto").webcrypto;
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
const id = "11111111-1111-4111-8111-111111111111",
  messages = [],
  devices = {},
  directory = {},
  record = {},
  receipt = {};
const intent = {
  intent_id: id,
  device_id: id,
  revision: 1,
  status: "pending",
  challenge: id,
  expires_at: 1800000000,
  updates_opt_in: false,
  updates_delivery_available: false,
};
function mount(
  overrides = {},
  listener,
  component = "MacIMessageSetup",
  initialProps = {},
) {
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
    ...initialProps,
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
    invoke: async (name) =>
      name === "kn_imessage_setup_list"
        ? { account_id: "501", current_device_id: id, intents: [intent] }
        : { message: "fixture readiness: send unverified" },
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
  vm.runInNewContext(compile(`components/organisms/${component}.tsx`), {
    exports,
    window: {
      addEventListener: (event, fn) => events.set(event, fn),
      removeEventListener: (event) => events.delete(event),
      setInterval: () => 1,
      clearInterval: () => {},
    },
    crypto,
    TextEncoder,
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
    require(name) {
      if (name === "./IMessageFollowUpDelivery") return { default: () => null };
      if (name === "react") return hooks;
      if (name === "react/jsx-runtime")
        return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (name === "@tauri-apps/api/tauri") return { invoke: api.invoke };
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
  });
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
          /I consent to this selected step|I separately opt in/.test(text(el)),
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
module.exports = { mount };
test("opening optional setup never reads Messages or sends", async () => {
  const app = mount();
  await app.settle();
  await app.click("Get follow-ups in iMessage · optional");
  assert.equal(app.calls.filter((call) => call.name === "invoke").length, 0);
  assert.equal(app.button("Check Mac permissions").props.disabled, true);
});
test("readiness requires explicit consent and repeated clicks are fenced", async () => {
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  const app = mount({
    invoke: async () => {
      await pending;
      return { message: "read only" };
    },
  });
  await app.settle();
  await app.click("Get follow-ups in iMessage · optional");
  await app.consent();
  const button = app.button("Check Mac permissions");
  button.props.onClick();
  button.props.onClick();
  await app.settle();
  assert.equal(app.calls.filter((call) => call.name === "invoke").length, 1);
  release();
  await app.settle();
  assert.match(app.text(), /read only/);
});
test("resume lists durable requests without replaying claim or send", async () => {
  const app = mount();
  await app.settle();
  await app.click("Get follow-ups in iMessage · optional");
  await app.click("Check saved setup requests");
  const calls = app.calls.filter((call) => call.name === "invoke");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].args[0], "kn_imessage_setup_list");
  assert.equal(
    app.button("Continue on this selected Mac").props.disabled,
    true,
  );
});
test("account switch invalidates an in-flight result and clears consent", async () => {
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  const app = mount({
    invoke: async () => {
      await pending;
      return { account_id: "501", current_device_id: id, intents: [intent] };
    },
  });
  await app.settle();
  await app.click("Get follow-ups in iMessage · optional");
  app.button("Check saved setup requests").props.onClick();
  await app.settle();
  await app.emit("knapsack-disconnected");
  release();
  await app.settle();
  assert.equal(app.text().includes("Continue on this selected Mac"), false);
  assert.match(app.text(), /Account changed/);
  assert.equal(app.button("Check Mac permissions").props.disabled, true);
});
test("listener failure disables all setup actions", async () => {
  const app = mount({}, async () => {
    throw Error("unavailable");
  });
  await app.settle();
  await app.click("Get follow-ups in iMessage · optional");
  assert.equal(app.button("Check saved setup requests").props.disabled, true);
  assert.match(app.text(), /monitoring is unavailable/);
});

test("confirmed closed request allows a fresh UUID while uncertain attempts retain theirs", async () => {
  let saved = null;
  const ids = [];
  const app = mount({
    invoke: async (name, args) => {
      if (name === "kn_imessage_setup_list")
        return {
          account_id: "501",
          current_device_id: id,
          intents: saved ? [saved] : [],
        };
      if (name === "kn_imessage_setup_create") {
        ids.push(args.intentId);
        saved = {
          ...intent,
          intent_id: args.intentId,
          expires_at: Math.floor(Date.now() / 1000) + 600,
        };
        return { intent: saved };
      }
    },
  });
  await app.settle();
  await app.click("Get follow-ups in iMessage · optional");
  await app.click("Check saved setup requests");
  await app.consent();
  await app.click("Save setup request for this Mac");
  assert.equal(ids.length, 1);
  assert.equal(
    app.button("Save setup request for this Mac").props.disabled,
    true,
  );
  saved = { ...saved, status: "disconnected" };
  await app.click("Check saved setup requests");
  await app.consent();
  await app.click("Save setup request for this Mac");
  assert.equal(ids.length, 2);
  assert.notEqual(ids[0], ids[1]);
  app.unmount();
});
