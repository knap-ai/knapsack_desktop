#!/usr/bin/env node
const process = require("node:process");

const DEFAULT_CDP = "http://127.0.0.1:9223";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, timeoutMs = 2_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function parseArgs() {
  const opts = {
    cdp: process.env.KNAPSACK_QA_CDP_URL || DEFAULT_CDP,
    timeoutMs: Number(process.env.KNAPSACK_QA_RENDERED_TIMEOUT_MS || 30_000),
  };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--cdp=")) opts.cdp = arg.slice("--cdp=".length);
    if (arg.startsWith("--timeout-ms=")) {
      const value = Number(arg.slice("--timeout-ms=".length));
      if (Number.isFinite(value)) opts.timeoutMs = value;
    }
  }
  opts.cdp = opts.cdp.replace(/\/$/, "");
  return opts;
}

async function waitForTarget(cdpBase, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const targets = await fetchJson(`${cdpBase}/json/list`, 2_000);
      const pages = Array.isArray(targets)
        ? targets.filter((target) => target.type === "page" && target.webSocketDebuggerUrl)
        : [];
      const appPage =
        pages.find((target) => /\/home(?:$|[?#])/i.test(target.url || "")) ||
        pages.find((target) => /(?:^|\/)index\.html(?:$|[?#])/i.test(target.url || "")) ||
        pages.find((target) =>
          /tauri|localhost|127\.0\.0\.1|home|index/i.test(`${target.url || ""} ${target.title || ""}`),
        ) ||
        pages[0];
      if (appPage) return appPage;
    } catch (error) {
      lastError = error;
    }
    await sleep(500);
  }
  throw new Error(`no debuggable app page found at ${cdpBase}: ${lastError?.message || "timed out"}`);
}

function connectCdp(webSocketDebuggerUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(webSocketDebuggerUrl);
    let nextId = 1;
    const callbacks = new Map();
    const timeout = setTimeout(() => reject(new Error("CDP websocket connection timed out")), 5_000);

    ws.addEventListener("open", () => {
      clearTimeout(timeout);
      resolve({
        send(method, params = {}) {
          const id = nextId++;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((innerResolve, innerReject) => {
            callbacks.set(id, { resolve: innerResolve, reject: innerReject });
          });
        },
        close() {
          ws.close();
        },
      });
    });
    ws.addEventListener("error", () => reject(new Error("CDP websocket connection failed")));
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !callbacks.has(message.id)) return;
      const callback = callbacks.get(message.id);
      callbacks.delete(message.id);
      if (message.error) {
        callback.reject(new Error(message.error.message || JSON.stringify(message.error)));
      } else {
        callback.resolve(message.result);
      }
    });
  });
}

async function evaluate(client, expression, timeoutMs = 5_000) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    timeout: timeoutMs,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return result.result?.value;
}

function renderedSmokeExpression() {
  return `(${async function qaRenderedSmoke() {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const visible = (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    };
    const waitFor = async (selector, timeoutMs = 10_000) => {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const el = document.querySelector(selector);
        if (visible(el)) return el;
        await sleep(150);
      }
      throw new Error("missing visible selector: " + selector);
    };
    const waitForAny = async (selectors, timeoutMs = 10_000) => {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (visible(el)) return { el, selector };
        }
        await sleep(150);
      }
      throw new Error("missing visible selector: " + selectors.join(", "));
    };
    const textIncludes = (el, text) => (el?.textContent || "").toLowerCase().includes(text.toLowerCase());
    const findVisibleByText = (selector, text) =>
      Array.from(document.querySelectorAll(selector)).find((el) => visible(el) && textIncludes(el, text));
    const waitForVisibleText = async (selector, text, timeoutMs = 10_000) => {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const el = findVisibleByText(selector, text);
        if (el) return el;
        await sleep(150);
      }
      throw new Error(`missing visible text "${text}" in ${selector}`);
    };
    const click = async (selector) => {
      const el = await waitFor(selector);
      if (typeof el.click === "function") {
        el.click();
      } else {
        el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      }
      await sleep(250);
      return true;
    };
    const clickAny = async (selectors, fallbackSelector, fallbackText) => {
      try {
        const found = await waitForAny(selectors, 2_500);
        if (typeof found.el.click === "function") found.el.click();
        else found.el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        await sleep(250);
        return found.selector;
      } catch {
        const el = await waitForVisibleText(fallbackSelector, fallbackText, 10_000);
        if (typeof el.click === "function") el.click();
        else el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        await sleep(250);
        return `${fallbackSelector}:text(${fallbackText})`;
      }
    };

    const chatInput = await waitFor('[data-testid="qa-clawd-chat-input"]', 15_000);
    if (typeof chatInput.focus === "function") {
      chatInput.focus();
    }
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    if (setter) {
      setter.call(chatInput, "QA rendered typing smoke");
    } else {
      chatInput.value = "QA rendered typing smoke";
    }
    chatInput.dispatchEvent(new Event("input", { bubbles: true }));
    chatInput.dispatchEvent(new Event("change", { bubbles: true }));
    if (chatInput.value !== "QA rendered typing smoke") {
      throw new Error("chat input did not accept typed text");
    }

    const emailNavSelector = await clickAny(
      [
        '[data-testid="qa-nav-email-autopilot"]',
        'button[title="Email Autopilot"]',
      ],
      "button",
      "Email",
    );
    const emailPanel = await waitForAny(
      [
        '[data-testid="qa-email-autopilot-panel"]',
        ".EmailTabView",
        ".EmailAutopilot",
      ],
      10_000,
    );

    const gbrainNavSelector = await clickAny(
      [
        '[data-testid="qa-nav-gbrain"]',
        'button[title="GBrain"]',
      ],
      "button",
      "GBrain",
    );
    const gbrainPanel = await waitForAny(
      [
        '[data-testid="qa-gbrain-panel"]',
        ".GBrain",
        ".GBrainHeader",
      ],
      10_000,
    ).catch(async () => ({ el: await waitForVisibleText("body", "GBrain", 10_000), selector: "body:text(GBrain)" }));

    return {
      ok: true,
      title: document.title,
      url: location.href,
      checks: {
        chatInputTyped: true,
        emailAutopilotRendered: true,
        gbrainRendered: true,
      },
      selectors: {
        emailNav: emailNavSelector,
        emailPanel: emailPanel.selector,
        gbrainNav: gbrainNavSelector,
        gbrainPanel: gbrainPanel.selector,
      },
    };
  }.toString()})()`;
}

async function main() {
  const opts = parseArgs();
  const target = await waitForTarget(opts.cdp, opts.timeoutMs);
  const client = await connectCdp(target.webSocketDebuggerUrl);
  try {
    await client.send("Runtime.enable");
    const result = await evaluate(client, renderedSmokeExpression(), opts.timeoutMs);
    console.log(`[qa-rendered-ui] target: ${target.title || "(untitled)"} ${target.url || ""}`);
    console.log(`[qa-rendered-ui] result: ${JSON.stringify(result)}`);
    if (!result?.ok) {
      process.exitCode = 1;
    }
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(`[qa-rendered-ui] failed: ${error?.stack || error}`);
  process.exit(1);
});
