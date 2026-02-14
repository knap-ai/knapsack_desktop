/**
 * gateway_mock.ts – Standalone mock of the Clawdbot Gateway WebSocket server.
 *
 * Implements the exact JSON‑RPC‑style protocol that Knapsack Desktop's Rust
 * client (gateway_ws.rs) expects:
 *
 *   1. On connect → server sends an EventFrame {type:"event", event:"connect.challenge"}
 *   2. Client sends RequestFrame {type:"req", method:"connect", id, params: ConnectParams}
 *   3. Server responds with ResponseFrame {id, ok:true, result:{protocol:3}}
 *   4. Client sends further RequestFrames; server echoes back {id, ok:true, result:{echo:…}}
 *   5. Server sends heartbeat EventFrames every 5 s.
 *
 * Additionally serves a minimal HTTP health endpoint at GET /health on the
 * same port so the Desktop health‑check passes.
 *
 * Usage:
 *   pnpm install && pnpm start        # or: npm install && npm start
 *   # → listening on ws://127.0.0.1:18789 + http://127.0.0.1:18789/health
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { WebSocketServer, WebSocket } from "ws";

// ─── Protocol types (mirror gateway_ws.rs field names exactly) ───────────────

/** Inbound frame sent by the Rust client */
interface RequestFrame {
  type: "req";
  method: string;
  id: string | number;
  params?: Record<string, unknown>;
}

/** Outbound response we send back */
interface ResponseFrame {
  type: "res";
  id: string;
  ok: boolean;
  result?: unknown;
  error?: unknown;
}

/** Outbound event we push to the client */
interface EventFrame {
  type: "event";
  event: string;
  payload?: unknown;
}

/** ConnectParams.client as sent by the Desktop client */
interface ClientInfo {
  id: string;         // "gateway-client"
  displayName: string; // "Knapsack"
  version: string;    // e.g. "0.9.23"
  platform: string;   // e.g. "macos", "linux", "windows"
  mode: string;       // "backend"
}

/** ConnectParams as sent by the Desktop client */
interface ConnectParams {
  minProtocol: number; // 3
  maxProtocol: number; // 3
  client: ClientInfo;
  auth?: { token: string };
  role: string;        // "operator"
  scopes: string[];    // ["operator.admin"]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PORT = Number(process.env.GATEWAY_MOCK_PORT ?? 18789);

function ts(): string {
  return new Date().toISOString();
}

function logInbound(label: string, data: unknown): void {
  console.log(`[${ts()}]  ← IN  (${label}):`, JSON.stringify(data));
}

function logOutbound(label: string, data: unknown): void {
  console.log(`[${ts()}]  → OUT (${label}):`, JSON.stringify(data));
}

function sendFrame(ws: WebSocket, frame: ResponseFrame | EventFrame, label: string): void {
  const json = JSON.stringify(frame);
  logOutbound(label, frame);
  ws.send(json);
}

/** Coerce an inbound id (string | number) to string for the response. */
function toStringId(id: string | number | undefined): string {
  if (id === undefined) return "0";
  return String(id);
}

// ─── HTTP server (for /health) ───────────────────────────────────────────────

const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET" && req.url === "/health") {
    console.log(`[${ts()}]  HTTP GET /health → 200`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  console.log(`[${ts()}]  HTTP ${req.method} ${req.url} → 404`);
  res.writeHead(404);
  res.end("Not found");
});

// ─── WebSocket server ────────────────────────────────────────────────────────

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const remote = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
  console.log(`\n[${ts()}]  WS connection from ${remote}`);

  // Step 1: send connect.challenge immediately
  const challenge: EventFrame = {
    type: "event",
    event: "connect.challenge",
    payload: { ts: Date.now() },
  };
  sendFrame(ws, challenge, "connect.challenge");

  // Heartbeat interval – cleared on close
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const hb: EventFrame = {
        type: "event",
        event: "gateway.heartbeat",
        payload: { ts: Date.now() },
      };
      sendFrame(ws, hb, "heartbeat");
    }
  }, 5_000);

  ws.on("message", (raw: Buffer | string) => {
    const text = typeof raw === "string" ? raw : raw.toString("utf-8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error(`[${ts()}]  ← IN  (invalid JSON): ${text.slice(0, 300)}`);
      return;
    }

    const frame = parsed as RequestFrame;
    logInbound(frame.method ?? "unknown", frame);

    // Only handle "req" type frames
    if (frame.type !== "req") {
      console.log(`[${ts()}]  (ignoring non-req frame type="${frame.type}")`);
      return;
    }

    const id = toStringId(frame.id);

    if (frame.method === "connect") {
      // Step 3: respond to the connect handshake
      const params = frame.params as unknown as ConnectParams | undefined;
      if (params) {
        console.log(
          `[${ts()}]  Client: id=${params.client?.id} name=${params.client?.displayName} ` +
            `v=${params.client?.version} proto=${params.minProtocol}-${params.maxProtocol} ` +
            `role=${params.role} scopes=${params.scopes?.join(",")}`,
        );
      }
      const res: ResponseFrame = {
        type: "res",
        id,
        ok: true,
        result: { protocol: 3 },
      };
      sendFrame(ws, res, "connect-response");
      return;
    }

    // Generic echo response so Desktop never hangs
    const res: ResponseFrame = {
      type: "res",
      id,
      ok: true,
      result: { echo: frame.params ?? null, method: frame.method },
    };
    sendFrame(ws, res, `response:${frame.method}`);
  });

  ws.on("close", (code: number, reason: Buffer) => {
    clearInterval(heartbeat);
    console.log(
      `[${ts()}]  WS closed (code=${code} reason=${reason.toString("utf-8") || "none"}) ${remote}`,
    );
  });

  ws.on("error", (err: Error) => {
    console.error(`[${ts()}]  WS error: ${err.message}`);
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

httpServer.listen(PORT, "127.0.0.1", () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Clawdbot Gateway Mock Server                                ║
║                                                              ║
║  WebSocket : ws://127.0.0.1:${String(PORT).padEnd(5)}                         ║
║  Health    : http://127.0.0.1:${String(PORT).padEnd(5)}/health                ║
║                                                              ║
║  Protocol version: 3                                         ║
║  Heartbeat interval: 5 s                                     ║
╚══════════════════════════════════════════════════════════════╝
`);
});
