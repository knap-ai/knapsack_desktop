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
    /getGoogleDriveFileText\([\s\S]*?Array\.from\(userEmailSet\)/,
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

test("meeting identity is available from the calendar event before connections load", () => {
  const meeting = read("src/components/organisms/MeetingNotesMode/index.tsx");
  const calendar = read("src/hooks/dataSources/useCalendar.tsx");
  const search = read("src-tauri/src/search.rs");

  assert.match(search, /pub calendar_account_email: String/);
  assert.match(
    search,
    /calendar_account_email: calendar_event\.calendar_account_email/,
  );
  assert.match(calendar, /calendar_account_email: event\.calendar_account_email \|\| ''/);
  assert.match(
    meeting,
    /new Set\(\[userEmail, meeting\?\.calendar_account_email, \.\.\.userEmails\]/,
  );
  assert.match(
    meeting,
    /userEmailSet\.has\(p\.email\.trim\(\)\.toLowerCase\(\)\)/,
  );
  assert.match(meeting, /The user's email identities are:/);
  assert.match(
    meeting,
    /contextualUserEmail = meeting\?\.calendar_account_email\?\.trim\(\) \|\| userEmail/,
  );
  assert.match(meeting, /connectionOwnerEmail = userEmail \|\| contextualUserEmail/);
  assert.match(
    meeting,
    /getDriveDocumentsIds\(otherParticipantEmails, connectionOwnerEmail\)/,
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

test("meeting notes stream visibly while synthesis is still running", () => {
  const meeting = read("src/components/organisms/MeetingNotesMode/index.tsx");
  const synthesis = read("src/hooks/useMeetingMode.tsx");
  const styles = read("src/main.css");

  assert.match(synthesis, /setStreamingMarkdown\(normalizeMeetingNotesMarkdown\(content\)\)/);
  assert.match(synthesis, /await new Promise<void>/);
  assert.match(meeting, /aria-busy="true" aria-live="polite"/);
  assert.match(meeting, /markdown=\{streamingMarkdown\}/);
  assert.match(meeting, /The first lines will appear here shortly/);
  assert.match(styles, /notetaker-note__processing-track/);
});

test("missing action-item deadlines are omitted instead of rendered as placeholders", () => {
  const prompts = read("src/prompts.ts");
  const normalization = read("src/utils/meetingNotesMarkdown.ts");

  assert.match(prompts, /omit the \*\*Due:\*\* field entirely/);
  assert.doesNotMatch(prompts, /date or "Not specified"/);
  assert.match(normalization, /Not specified/);
});

test("stopping a meeting cannot toggle the feed back into recording", () => {
  const feed = read("src/hooks/feed/useFeed.tsx");
  const sidebar = read("src/components/organisms/NotetakerSidebar/index.tsx");

  assert.match(feed, /isRecording === undefined \? !feedItem\.isRecording : isRecording/);
  assert.match(sidebar, /if \(hasCompletedNotes\) return/);
  assert.match(sidebar, /const meetingHasEnded = recordingHasEnded \|\|/);
});

test("copy notes produces Slack-native emphasis, tasks, links, and tables", () => {
  const meeting = read("src/components/organisms/MeetingNotesMode/index.tsx");
  const formatter = read("src/utils/slackMeetingNotes.ts");
  const copyButton = read("src/components/molecules/CopyButton/index.tsx");

  assert.match(meeting, /formatMeetingNotesForSlack/);
  assert.match(formatter, /Slack has no native Markdown table syntax/);
  assert.match(formatter, /'☑ ' : '☐ '/);
  assert.match(formatter, /'<\$2\|\$1>'/);
  assert.match(formatter, /renderSlackTable/);
  assert.match(copyButton, /Copy for Slack/);
});

test("the dedicated Email tab refreshes connected inboxes before claiming a category is empty", () => {
  const app = read("src/App.tsx");
  const emailTab = read("src/components/organisms/EmailTabView/index.tsx");
  const emailView = read("src/components/molecules/EmailAutopilot/index.tsx");

  assert.match(app, /const refreshEmailAutopilot = useCallback/);
  assert.match(app, /key === ConnectionKeys\.GOOGLE_GMAIL \|\| key === ConnectionKeys\.MICROSOFT_OUTLOOK/);
  assert.match(app, /await syncConnections\(userEmail, emailConnections\)/);
  assert.match(app, /await feed\.runEmailAutopilot\(\)/);
  assert.match(emailTab, /refreshStartedRef\.current = true/);
  assert.match(emailTab, /void onRefresh\(\)/);
  assert.match(emailView, /Email refresh did not finish/);
  assert.match(emailView, /No emails in this category/);
  assert.doesNotMatch(emailView, /You're all caught up!/);
});

test("Brain self-heals an enabled gateway during its startup window", () => {
  const browser = read("src-tauri/src/clawd/browser.rs");
  const brain = read("src/components/organisms/GBrainView/index.tsx");
  const agentRun = browser.slice(
    browser.indexOf('#[post("/api/clawd/agent-run")]'),
    browser.indexOf('#[post("/api/clawd/chat")]'),
  );

  assert.match(agentRun, /gateway_client::ensure_gateway_and_wait\(\)\.await/);
  assert.match(agentRun, /if !gateway_client::is_gateway_port_open\(\)\.await/);
  assert.match(brain, /answer service is still starting/);
  assert.doesNotMatch(brain, /Start Knapsack Chat, then try again/);
});
