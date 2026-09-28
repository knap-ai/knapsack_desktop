const { spawnSync } = require('node:child_process');

function isProtectedInstalledKnapsackProcess(commandLine) {
  const command = String(commandLine || '').trim().replace(/\\/g, '/').toLowerCase();
  // Node rewrites argv to this title: the installed resource path disappears.
  return !command || /^(?:openclaw|openclaw-gateway)(?:\s|$)/.test(command)
    || command.includes('/applications/knapsack.app/')
    || /\/program files(?: \(x86\))?\/knapsack\//.test(command)
    || /\/appdata\/local\/knapsack\//.test(command);
}

function processInfo(pid) {
  if (process.platform === 'win32') {
    const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      `Get-CimInstance Win32_Process -Filter "ProcessId = ${Number(pid)}" | Select-Object ParentProcessId,CommandLine | ConvertTo-Json -Compress`], { encoding: 'utf8', windowsHide: true });
    try {
      const value = JSON.parse(result.stdout);
      return { parent: Number(value.ParentProcessId), command: value.CommandLine || '' };
    } catch { return { parent: 0, command: '' }; }
  }
  const result = spawnSync('ps', ['-p', String(pid), '-o', 'ppid=', '-o', 'command='], { encoding: 'utf8' });
  const match = String(result.stdout || '').trim().match(/^(\d+)\s+(.*)$/);
  return match ? { parent: Number(match[1]), command: match[2] } : { parent: 0, command: '' };
}

function isQaDescendant(pid, lookup = processInfo, owner = process.pid) {
  const seen = new Set();
  let current = Number(pid);
  while (current > 1 && !seen.has(current)) {
    if (current === owner) return true;
    seen.add(current);
    current = lookup(current).parent;
  }
  return false;
}

function assertNoInstalledKnapsackListeners(pids, lookup = processInfo, owner = process.pid) {
  const protectedPids = [...new Set([...pids].map(Number))].filter(pid =>
    !isQaDescendant(pid, lookup, owner) && isProtectedInstalledKnapsackProcess(lookup(pid).command));
  if (protectedPids.length) {
    throw new Error(`QA cannot interrupt an existing Knapsack/OpenClaw service (PID ${protectedPids.join(', ')}). Stop the app and its background gateway before running QA, or use a separate machine. No processes were terminated.`);
  }
}

module.exports = { isProtectedInstalledKnapsackProcess, assertNoInstalledKnapsackListeners, isQaDescendant };
