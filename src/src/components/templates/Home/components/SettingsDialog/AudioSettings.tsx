import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

type Devices = {
  microphone: string | null;
  inputs: string[];
  outputs: string[];
  defaultInput: string | null;
  defaultOutput: string | null;
  canSelectSpeaker: boolean;
  transcriptionError: string | null;
  knapsackTranscription: boolean;
};
export default function AudioSettings() {
  const [devices, setDevices] = useState<Devices | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState<number | null>(null);
  const refresh = async () =>
    setDevices(await invoke<Devices>("audio_devices"));
  useEffect(() => {
    refresh().catch((e) => setError(String(e)));
  }, []);
  const action = async (task: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await task();
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="p-6 flex flex-col gap-4" aria-label="Audio settings">
      <h2 className="text-lg font-semibold">Audio & recording</h2>
      <p className="text-sm text-zinc-600">
        Choose the microphone for your next recording. Changes won’t switch an
        ongoing recording.
      </p>
      <label className="flex flex-col gap-2">
        Microphone
        <select
          disabled={busy || !devices}
          className="border rounded p-2 bg-white"
          value={devices?.microphone ?? ""}
          onChange={(e) => {
            setLevel(null);
            void action(() =>
              invoke("set_audio_microphone", {
                microphone: e.target.value || null,
              }),
            );
          }}
        >
          <option value="">
            System default
            {devices?.defaultInput
              ? ` — ${devices.defaultInput}`
              : " — no microphone"}
          </option>
          {devices?.microphone &&
            !devices.inputs.includes(devices.microphone) && (
              <option value={devices.microphone}>
                {devices.microphone} (disconnected)
              </option>
            )}
          {devices?.inputs.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-3 items-center">
        <button
          disabled={busy || !devices}
          className="border rounded px-3 py-2 disabled:opacity-50"
          onClick={() =>
            void action(async () => {
              setLevel(null);
              setLevel(await invoke<number>("test_audio_microphone"));
            })
          }
        >
          Test microphone (3 seconds)
        </button>
        <button
          disabled={busy}
          className="border rounded px-3 py-2"
          onClick={() => void action(refresh)}
        >
          Refresh devices
        </button>
        <button
          className="underline"
          onClick={() => void action(() => invoke("open_microphone_settings"))}
        >
          Microphone permissions
        </button>
      </div>
      <p className="text-sm text-zinc-600">
        Speak while testing. The test measures sound locally; nothing is saved
        or uploaded.
      </p>
      <div role="status" aria-live="polite">
        {busy ? (
          "Checking audio settings… Speak now if testing the microphone."
        ) : level !== null ? (
          <>
            <meter
              min={0}
              max={1}
              value={level}
              aria-label="Microphone peak level"
            />{" "}
            {level > 0.01
              ? "Microphone signal detected."
              : "Very little sound detected. Speak closer, check hardware mute, or choose another microphone."}
          </>
        ) : null}
      </div>
      <label className="flex flex-col gap-2">
        Speakers (system output)
        <select
          disabled={busy || !devices?.canSelectSpeaker}
          className="border rounded p-2 bg-white"
          value={devices?.defaultOutput ?? ""}
          onChange={(e) =>
            void action(() =>
              invoke("set_audio_speaker", { name: e.target.value }),
            )
          }
        >
          {!devices?.defaultOutput && (
            <option value="">No speakers available</option>
          )}
          {devices?.outputs.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm text-zinc-600">
        On Mac, this changes the system playback device. Meeting apps with their
        own speaker selection may need updating too.
      </p>
      <div className="border rounded p-3" role="status">
        <strong>Transcription</strong>
        <p className="text-sm mt-1">
          {devices?.transcriptionError
            ? devices.transcriptionError
            : devices
              ? devices.knapsackTranscription
                ? "Transcription through Knapsack (powered by Groq). No separate API key needed. Audio is sent through Knapsack to Groq for processing; Knapsack does not retain it on its servers."
                : "Speech-to-text provider configured. A recording still requires a working microphone and permission."
              : "Checking…"}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
