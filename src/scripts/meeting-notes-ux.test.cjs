const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

const loadTypeScriptModule = (relativePath) => {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const loaded = { exports: {} };
  Function(
    "exports",
    "module",
    "require",
    compiled,
  )(loaded.exports, loaded, id => id.startsWith('.')
    ? loadTypeScriptModule(path.join(path.dirname(relativePath), id + '.ts'))
    : require(id));
  return loaded.exports;
};

test("Slack copy uses rich HTML with a marker-free plain-text fallback", () => {
  const { buildSlackClipboardPayload } = loadTypeScriptModule(
    "src/utils/slackMeetingNotes.ts",
  );
  const markdown = `## Decisions
- **Pilot:** Ship now

## Action items
- [ ] **Mark** — Send recap

| Metric | Result |
|---|---:|
| Lift | 3% |

[Open brief](https://example.com)`;

  const payload = buildSlackClipboardPayload(markdown, "Demo Meeting");
  // Slack preserves paragraph-level bold more reliably than heading elements.
  assert.match(payload.html, /<p><strong>Demo Meeting<\/strong><\/p>/);
  assert.match(payload.html, /<strong>Pilot:<\/strong> Ship now/);
  assert.match(payload.html, /<a href="https:\/\/example\.com">Open brief<\/a>/);
  assert.match(payload.html, /<p><strong>Metric:<\/strong> Lift<br><strong>Result:<\/strong> 3%<\/p>/);
  assert.doesNotMatch(payload.html, /<table|<script/i);
  assert.match(payload.text, /• Metric: Lift\n• Result: 3%/);
  assert.doesNotMatch(payload.text, /\*Demo Meeting\*/);
  assert.match(payload.text, /Decisions\n• Pilot: Ship now/);
});

test("legacy missing-deadline placeholders disappear from displayed notes", () => {
  const { normalizeMeetingNotesMarkdown } = loadTypeScriptModule(
    "src/utils/meetingNotesMarkdown.ts",
  );
  assert.equal(
    normalizeMeetingNotesMarkdown(
      "## Action items\n- [ ] **Mark** — Send recap — **Due:** Not specified",
    ),
    "## Action items\n\n- [ ] **Mark** — Send recap",
  );
});

test("meeting chat stays centered without hiding recording state or stop control", () => {
  const meetingMode = fs.readFileSync(
    path.join(root, "src/components/organisms/MeetingNotesMode/index.tsx"),
    "utf8",
  );
  const styles = fs.readFileSync(path.join(root, "src/main.css"), "utf8");

  assert.doesNotMatch(meetingMode, /Privately transcribing/);
  // The launcher opens the mounted chat panel; it is no longer a fake input.
  assert.match(meetingMode, /onClick=\{openMeetingChat\}/);
  assert.match(meetingMode, /'Ask about this meeting'/);
  assert.match(meetingMode, /<MeetingChatPanel[\s\S]*?minimized=\{meetingChatLifecycle\.minimized\}/);
  assert.match(meetingMode, /Knapsack is[\s\S]*?transcribing[\s\S]*?your meeting\./);
  assert.match(meetingMode, /aria-label="Stop recording"/);
  assert.match(styles, /\.notetaker-note__bottom-bar \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) minmax\(220px, 420px\) minmax\(0, 1fr\)/);
  assert.match(styles, /\.notetaker-note__bottom-chat \{[\s\S]*?grid-column: 2/);
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*?grid-template-columns: auto minmax\(0, 1fr\) auto/);
});
