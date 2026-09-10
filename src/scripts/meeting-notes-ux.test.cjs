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
  )(loaded.exports, loaded, require);
  return loaded.exports;
};

test("Slack copy uses rich Slack conventions and aligned tables", () => {
  const { formatMeetingNotesForSlack } = loadTypeScriptModule(
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

  assert.equal(
    formatMeetingNotesForSlack(markdown, "Demo Meeting"),
    `*Demo Meeting*

*Decisions*
• *Pilot:* Ship now

*Action items*
☐ *Mark* — Send recap

\`\`\`
Metric  |  Result
────────┼────────
Lift    |  3%
\`\`\`

<https://example.com|Open brief>`,
  );
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
