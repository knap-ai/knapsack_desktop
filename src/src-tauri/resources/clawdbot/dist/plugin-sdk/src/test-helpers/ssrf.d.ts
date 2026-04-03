import * as ssrf from "../infra/net/ssrf.js";
export declare function mockPinnedHostnameResolution(addresses?: string[]): import("vitest").Mock<typeof ssrf.resolvePinnedHostname>;
