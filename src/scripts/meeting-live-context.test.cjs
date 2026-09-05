const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("meeting chat reads the active transcript before answering catch-up questions", () => {
  const meeting = read("src/components/organisms/MeetingNotesMode/index.tsx");
  const audio = read("src-tauri/src/audio/audio.rs");
  const server = read("src-tauri/src/server/actix.rs");

  assert.match(meeting, /await refreshMeetingTranscriptContext\(\)/);
  assert.match(
    meeting,
    /Summarize only what the live transcript and current notes show/,
  );
  assert.match(meeting, /do not substitute unrelated background context/i);
  assert.match(audio, /live_transcript\/\{thread_id\}/);
  assert.match(server, /get_live_transcript/);
});

test("meeting briefs fetch calendar-linked Google files through connected identities", () => {
  const meeting = read("src/components/organisms/MeetingNotesMode/index.tsx");
  const dataSource = read("src/api/data_source.tsx");

  assert.match(meeting, /extractGoogleDriveLinks\(meeting\.description/);
  assert.match(
    meeting,
    /getGoogleDriveFileText\(url, \[userEmail, \.\.\.userEmails\]\)/,
  );
  assert.match(
    meeting,
    /Linked Google Drive content \(authoritative when present\)/,
  );
  assert.match(
    dataSource,
    /for \(const email of Array\.from\(new Set\(accountEmails\.filter\(Boolean\)\)\)\)/,
  );
});

test("chat capability truth aggregates every locally connected Google account", () => {
  const browser = read("src-tauri/src/clawd/browser.rs");
  const functionBody = browser.slice(
    browser.indexOf("fn connected_google_accounts_for_context"),
    browser.indexOf("fn connected_google_accounts_section"),
  );

  assert.match(functionBody, /User::find_all_with_email/);
  assert.match(functionBody, /combined\.entry\(account\)/);
  assert.doesNotMatch(
    functionBody,
    /if !direct\.is_empty\(\) \{\s*return direct/,
  );
});

test("inline code no longer renders as a full-width code block", () => {
  const markdown = read("src/components/molecules/MarkdownDisplay/index.tsx");
  assert.match(markdown, /const isBlock = String\(children\)\.includes/);
  assert.match(markdown, /px-1 py-0\.5/);
});

test("current user's meeting action items open in the contextual meeting chat", () => {
  const meeting = read("src/components/organisms/MeetingNotesMode/index.tsx");
  const markdown = read("src/components/molecules/MarkdownDisplay/index.tsx");

  assert.match(meeting, /isOwnedByCurrentUser\(taskText, userName, userEmail\)/);
  assert.match(meeting, /`knapsack:\/\/prompt\/\$\{encodeURIComponent\(actionItemPrompt\(taskText\)\)\}`/);
  assert.match(meeting, /taskActionHref=\{actionItemHref\}/);
  assert.match(meeting, /onTaskAction=\{openActionItemInMeetingChat\}/);
  assert.match(meeting, /Help me complete this action item from/);
  assert.match(meeting, /Let me review the plan before sending messages/);
  assert.match(markdown, /classNames\.includes\('task-list-item'\)/);
  assert.match(markdown, /child\.properties\?\.type === 'checkbox'/);
  assert.match(markdown, /event\.preventDefault\(\)/);
  assert.match(markdown, /Open this action item in meeting chat/);
});
