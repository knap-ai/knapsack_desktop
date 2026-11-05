// Synthetic UI fixture: no native backend, audio device, account, or Slack writes.
import React from "react";
import { createRoot } from "react-dom/client";
import "src/main.css";
const state = {
  notes:
    "# Synthetic planning meeting\n\n## Decisions\n\n- **Owner:** Jo\n- Keep the release review focused.\n\n## Action items\n\n| Owner | Task | Status |\n| --- | --- | --- |\n| Jo | Review one\\|two options | Open |\n| Sam | Confirm timeline | Ready |\n\n" +
    Array.from(
      { length: 35 },
      (_, i) =>
        `## Discussion ${i + 1}\n\nSynthetic discussion notes for scrolling and keyboard validation.\n\n`,
    ).join(""),
  failSave: false,
  copies: [] as string[],
  requests: [] as string[],
  pending: 0,
  authError: "",
  reconnected: 0,
};
(window as any).notesQA = state;
window.addEventListener(
  "knapsack:reconnect-transcription",
  () => state.reconnected++,
);
const mockIpc = ({ cmd, callback, error, ...args }: any) => {
  if (/start_recording|audio_microphone|test_audio/.test(cmd))
    return (window as any)[`_${error}`](
      "Audio is disabled in this synthetic fixture",
    );
  let value: any = null;
  if (JSON.stringify(args).includes("/desktop-connect?")) state.reconnected++;
  if (cmd === "transcription_recovery_status")
    value = { pending: state.pending };
  if (cmd === "resume_saved_transcription") {
    state.pending = 0;
    state.authError = "";
  }
  if (cmd === "tauri") value = 0;
  queueMicrotask(() => (window as any)[`_${callback}`](value));
};
// Native Tauri freezes its IPC bridge. The serve-only QA SDK facade routes
// mocked requests through this separate hook without replacing that bridge.
if (import.meta.env.VITE_KNAPSACK_LOCAL_QA_SAFE === "1")
  (window as any).__knapsackQaTransport__ = mockIpc;
else (window as any).__TAURI_IPC__ = mockIpc;
window.fetch = async (input, init) => {
  const url = String(input);
  state.requests.push(`${init?.method || "GET"} ${url}`);
  let body: any = { success: true, data: [] };
  if (url.includes("recording_status"))
    body = {
      success: true,
      isRecording: false,
      threadId: 42,
      transcriptionError: state.authError,
    };
  else if (/notes\/42/.test(url))
    body = {
      success: true,
      data: { thread_id: 42, exists: true, notes: state.notes },
    };
  else if (url.endsWith("/notes") && init?.method === "POST") {
    if (state.failSave)
      return new Response(
        JSON.stringify({ success: false, error: "Synthetic save failure" }),
        { status: 500 },
      );
    state.notes = JSON.parse(String(init.body)).notes;
    body = { success: true, data: { thread_id: 42 } };
  } else if (url.includes("slack-notes/workspaces"))
    body = {
      success: true,
      data: {
        owner: "synthetic@example.test",
        accounts: [
          { accountId: "qa", teamId: "T-QA", name: "Synthetic workspace" },
        ],
      },
    };
  else if (url.includes("slack-notes/channels"))
    body = {
      success: true,
      data: {
        channels: [{ id: "C-QA", name: "synthetic-review", private: false }],
      },
    };
  else if (url.includes("slack-notes/send"))
    throw new Error("Posting is disabled in synthetic QA");
  else if (url.includes("transcript"))
    body = {
      success: true,
      data: { content: "Synthetic transcript", thread_id: 42 },
    };
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
};
const useNativeClipboard = import.meta.env.VITE_KNAPSACK_LOCAL_QA_SAFE === "1" && new URLSearchParams(location.search).get("nativeClipboard") === "1";
if (!useNativeClipboard) Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: async (text: string) => {
      state.copies.push(text);
    },
    write: async (items: ClipboardItem[]) => {
      state.copies.push(await (await items[0].getType("text/plain")).text());
    },
  },
});
const noop = () => {};
const recording: any = {
  isRecording: () => false,
  setIsRecording: noop,
  isLoadingNotes: () => false,
  hasSynthesized: () => false,
  isAnyRecording: false,
  activeRecordingThreadId: null,
  startingRecordingThreadId: null,
  isPaused: false,
  startRecording: () => {
    throw Error("Audio disabled");
  },
  stopRecording: noop,
  pauseRecording: noop,
};
const props: any = {
  thread: {
    id: 42,
    subtitle: "Synthetic planning meeting",
    recorded: true,
    threadType: "meeting",
    savedTranscript: "synthetic",
  },
  item: {},
  meeting: undefined,
  timestamp: new Date("2026-11-03T00:00:00Z"),
  feed: { meetings: {}, feedContent: {}, renameMeeting: noop },
  synthesisState: false,
  onSynthesisFinish: noop,
  setFeedIsRecording: noop,
  handleOpenTemplates: async () => {},
  handleOpenTranscript: noop,
  handleErrorContact: noop,
  closeTranscript: noop,
  closeTasks: noop,
  recordingHandlers: recording,
  userEmail: "synthetic@example.test",
  userName: "Synthetic user",
};
// Install synthetic boundaries before importing components with module-level IPC.
const { default: MeetingNotesMode } = await import("src/components/organisms/MeetingNotesMode");
// Avoid importing app-level providers or starting any native lifecycle.
createRoot(document.getElementById("root")!).render(
  <div style={{ height: "100vh" }}>
    <MeetingNotesMode {...props} />
  </div>,
);

if (useNativeClipboard) {
  const section = document.createElement('section');
  section.style.cssText = 'position:fixed;bottom:0;right:0;width:380px;background:white;border:2px solid #666;padding:8px;z-index:99999;color:black';
  section.innerHTML = '<label>Plain clipboard paste target<textarea aria-label="Plain clipboard paste target" style="width:100%;height:80px"></textarea></label><label>Rich clipboard paste target<div aria-label="Rich clipboard paste target" role="textbox" contenteditable="true" style="min-height:80px;max-height:180px;overflow:auto;border:1px solid #888"></div></label>';
  const link = document.createElement('a'); link.href = '/qa-fixtures/meeting-release.html'; link.textContent = 'Open synthetic chat, account and email QA'; section.prepend(link);
  document.body.append(section);
}
