import {
  createWaSocket,
  waitForWaConnection,
  webAuthExists,
  logoutWeb,
  resolveWhatsAppAccount,
  type GatewayRequestHandlerOptions,
} from "openclaw/plugin-sdk";
import { getWhatsAppRuntime } from "./runtime.js";

/**
 * Gateway method handler for `web.login.phone`.
 *
 * Accepts `{ phoneNumber: string, force?: boolean, accountId?: string }` and
 * returns `{ pairingCode: string, message: string }` on success.
 *
 * The user enters the 8-character pairing code in WhatsApp on their phone
 * via Settings → Linked Devices → Link a Device → Link with phone number.
 */
export const handleLoginWithPhone = async ({
  params,
  respond,
}: GatewayRequestHandlerOptions): Promise<void> => {
  const phoneNumber =
    typeof params.phoneNumber === "string" ? params.phoneNumber.replace(/[^0-9]/g, "") : "";
  if (!phoneNumber || phoneNumber.length < 7) {
    respond(false, undefined, {
      code: -32602,
      message: "Invalid phone number. Provide a full E.164 number (e.g. 12025551234).",
    });
    return;
  }

  const force = Boolean(params.force);
  const accountId = typeof params.accountId === "string" ? params.accountId : undefined;

  try {
    const runtime = getWhatsAppRuntime();
    const cfg = runtime.config.loadConfig();
    const account = resolveWhatsAppAccount({ cfg, accountId });

    // Clear stale auth if forced
    if (force) {
      const hasWeb = await webAuthExists(account.authDir);
      if (hasWeb) {
        await logoutWeb({ authDir: account.authDir, isLegacyAuthDir: account.isLegacyAuthDir });
      }
    }

    // Create a Baileys socket without QR printing
    const sock = await createWaSocket(false, false, { authDir: account.authDir });

    // Request a pairing code from WhatsApp servers
    const pairingCode = await sock.requestPairingCode(phoneNumber);

    // Format the code with a dash for readability (e.g. "ABCD-EFGH")
    const formatted =
      pairingCode.length === 8
        ? `${pairingCode.slice(0, 4)}-${pairingCode.slice(4)}`
        : pairingCode;

    // Wait for connection in the background and close socket after
    waitForWaConnection(sock)
      .then(() => {
        console.log("[whatsapp] Phone pairing completed successfully.");
      })
      .catch((err: unknown) => {
        console.error("[whatsapp] Phone pairing connection failed:", err);
      })
      .finally(() => {
        setTimeout(() => {
          try {
            sock.ws?.close();
          } catch {}
        }, 500);
      });

    respond(true, {
      pairingCode: formatted,
      message: `Enter code ${formatted} in WhatsApp → Linked Devices → Link with phone number.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    respond(false, undefined, { code: -32603, message: `Phone pairing failed: ${message}` });
  }
};
