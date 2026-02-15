// Legacy shim for pre-tsdown update-cli imports.
import * as daemonCli from "../daemon-cli-BS_4J_PM.js";
export const registerDaemonCli = daemonCli.t.registerDaemonCli;
export const runDaemonInstall = daemonCli.s;
export const runDaemonRestart = daemonCli.r;
export const runDaemonStart = daemonCli.i;
export const runDaemonStatus = daemonCli.n;
export const runDaemonStop = daemonCli.a;
export const runDaemonUninstall = daemonCli.o;
