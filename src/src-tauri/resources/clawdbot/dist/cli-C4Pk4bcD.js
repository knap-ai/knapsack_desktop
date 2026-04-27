import { a as fetchGoogleMeetSpace, i as fetchGoogleMeetAttendance, n as createGoogleMeetSpace, o as fetchLatestGoogleMeetConferenceRecord, r as fetchGoogleMeetArtifacts, t as buildGoogleMeetPreflightReport } from "./meet-CxbS-CzY.js";
import { a as buildGoogleMeetAuthUrl, c as exchangeGoogleMeetAuthCode, f as waitForGoogleMeetAuthCode, o as createGoogleMeetOAuthState, s as createGoogleMeetPkce, u as resolveGoogleMeetAccessToken } from "./oauth-dnHE5_Ub.js";
import { writeFile } from "node:fs/promises";
import { format } from "node:util";
import { createInterface } from "node:readline/promises";
//#region extensions/google-meet/src/cli.ts
function writeStdoutJson(value) {
	process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
function writeStdoutLine(...values) {
	process.stdout.write(`${format(...values)}\n`);
}
async function writeCliOutput(options, text) {
	if (options.output?.trim()) {
		await writeFile(options.output, text.endsWith("\n") ? text : `${text}\n`, "utf8");
		writeStdoutLine("wrote: %s", options.output);
		return;
	}
	process.stdout.write(text.endsWith("\n") ? text : `${text}\n`);
}
async function promptInput(message) {
	const rl = createInterface({
		input: process.stdin,
		output: process.stderr
	});
	try {
		return await rl.question(message);
	} finally {
		rl.close();
	}
}
function parseOptionalNumber(value) {
	if (!value?.trim()) return;
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) throw new Error(`Expected a numeric value, received ${value}`);
	return parsed;
}
function writeSetupStatus(status) {
	writeStdoutLine("Google Meet setup: %s", status.ok ? "OK" : "needs attention");
	for (const check of status.checks) writeStdoutLine("[%s] %s: %s", check.ok ? "ok" : "fail", check.id, check.message);
}
function formatBoolean(value) {
	return typeof value === "boolean" ? value ? "yes" : "no" : "unknown";
}
function formatOptional(value) {
	return typeof value === "string" && value.trim() ? value : "n/a";
}
function writeDoctorStatus(status) {
	if (!status.found) {
		writeStdoutLine("Google Meet session: not found");
		return;
	}
	const sessions = status.session ? [status.session] : status.sessions ?? [];
	if (sessions.length === 0) {
		writeStdoutLine("Google Meet sessions: none");
		return;
	}
	writeStdoutLine("Google Meet sessions: %d", sessions.length);
	for (const session of sessions) {
		const health = session.chrome?.health;
		writeStdoutLine("");
		writeStdoutLine("session: %s", session.id);
		writeStdoutLine("url: %s", session.url);
		writeStdoutLine("state: %s", session.state);
		writeStdoutLine("transport: %s", session.transport);
		writeStdoutLine("mode: %s", session.mode);
		writeStdoutLine("node: %s", session.chrome?.nodeId ?? "local/none");
		writeStdoutLine("audio bridge: %s", session.chrome?.audioBridge?.type ?? "none");
		writeStdoutLine("provider: %s", session.chrome?.audioBridge?.provider ?? session.realtime.provider ?? "n/a");
		writeStdoutLine("in call: %s", formatBoolean(health?.inCall));
		writeStdoutLine("manual action: %s", formatBoolean(health?.manualActionRequired));
		if (health?.manualActionRequired) {
			writeStdoutLine("manual reason: %s", formatOptional(health.manualActionReason));
			writeStdoutLine("manual message: %s", formatOptional(health.manualActionMessage));
		}
		writeStdoutLine("provider connected: %s", formatBoolean(health?.providerConnected));
		writeStdoutLine("realtime ready: %s", formatBoolean(health?.realtimeReady));
		writeStdoutLine("audio input active: %s", formatBoolean(health?.audioInputActive));
		writeStdoutLine("audio output active: %s", formatBoolean(health?.audioOutputActive));
		writeStdoutLine("last input: %s (%s bytes)", formatOptional(health?.lastInputAt), health?.lastInputBytes ?? 0);
		writeStdoutLine("last output: %s (%s bytes)", formatOptional(health?.lastOutputAt), health?.lastOutputBytes ?? 0);
		writeStdoutLine("bridge closed: %s", formatBoolean(health?.bridgeClosed));
		writeStdoutLine("browser url: %s", formatOptional(health?.browserUrl));
	}
}
function sanitizeOAuthErrorMessage(error) {
	return (error instanceof Error ? error.message : String(error)).replace(/(access_token["'=:\s]+)[^"',\s&]+/gi, "$1[redacted]").replace(/(refresh_token["'=:\s]+)[^"',\s&]+/gi, "$1[redacted]").replace(/(client_secret["'=:\s]+)[^"',\s&]+/gi, "$1[redacted]");
}
async function buildOAuthDoctorReport(config, options) {
	const clientId = options.clientId?.trim() || config.oauth.clientId;
	const clientSecret = options.clientSecret?.trim() || config.oauth.clientSecret;
	const refreshToken = options.refreshToken?.trim() || config.oauth.refreshToken;
	const accessToken = options.accessToken?.trim() || config.oauth.accessToken;
	const expiresAt = parseOptionalNumber(options.expiresAt) ?? config.oauth.expiresAt;
	const checks = [];
	const hasRefreshConfig = Boolean(clientId && refreshToken);
	if (!hasRefreshConfig && !Boolean(accessToken)) {
		checks.push({
			id: "oauth-config",
			ok: false,
			message: "Missing Google Meet OAuth credentials. Configure oauth.clientId and oauth.refreshToken, or pass --client-id and --refresh-token."
		});
		return {
			ok: false,
			configured: false,
			checks
		};
	}
	checks.push({
		id: "oauth-config",
		ok: true,
		message: hasRefreshConfig ? "Google Meet OAuth refresh credentials are configured" : "Google Meet cached access token is configured"
	});
	let token;
	try {
		token = await resolveGoogleMeetAccessToken({
			clientId,
			clientSecret,
			refreshToken,
			accessToken,
			expiresAt
		});
		checks.push({
			id: "oauth-token",
			ok: true,
			message: token.refreshed ? "Refresh token minted an access token" : "Cached access token is still valid"
		});
	} catch (error) {
		checks.push({
			id: "oauth-token",
			ok: false,
			message: sanitizeOAuthErrorMessage(error)
		});
		return {
			ok: false,
			configured: true,
			checks
		};
	}
	const report = {
		ok: true,
		configured: true,
		tokenSource: token.refreshed ? "refresh-token" : "cached-access-token",
		expiresAt: token.expiresAt,
		checks
	};
	const meeting = options.meeting?.trim();
	if (meeting) try {
		const space = await fetchGoogleMeetSpace({
			accessToken: token.accessToken,
			meeting
		});
		checks.push({
			id: "meet-spaces-get",
			ok: true,
			message: `Resolved ${space.name}`
		});
		report.meetingUri = space.meetingUri;
	} catch (error) {
		checks.push({
			id: "meet-spaces-get",
			ok: false,
			message: sanitizeOAuthErrorMessage(error)
		});
	}
	if (options.createSpace) try {
		const created = await createGoogleMeetSpace({ accessToken: token.accessToken });
		checks.push({
			id: "meet-spaces-create",
			ok: true,
			message: `Created ${created.space.name}`
		});
		report.createdSpace = created.space.name;
		report.meetingUri = created.meetingUri;
	} catch (error) {
		checks.push({
			id: "meet-spaces-create",
			ok: false,
			message: sanitizeOAuthErrorMessage(error)
		});
	}
	report.ok = checks.every((check) => check.ok);
	return report;
}
function writeOAuthDoctorReport(report) {
	writeStdoutLine("Google Meet OAuth: %s", report.ok ? "OK" : "needs attention");
	writeStdoutLine("configured: %s", report.configured ? "yes" : "no");
	if (report.tokenSource) writeStdoutLine("token source: %s", report.tokenSource);
	if (report.meetingUri) writeStdoutLine("meeting uri: %s", report.meetingUri);
	for (const check of report.checks) writeStdoutLine("[%s] %s: %s", check.ok ? "ok" : "fail", check.id, check.message);
}
function writeRecoverCurrentTabResult(result) {
	writeStdoutLine("Google Meet current tab: %s", result.found ? "found" : "not found");
	writeStdoutLine("node: %s", result.nodeId);
	if (result.targetId) writeStdoutLine("target: %s", result.targetId);
	if (result.tab?.url) writeStdoutLine("tab url: %s", result.tab.url);
	writeStdoutLine("message: %s", result.message);
	if (result.browser) writeDoctorStatus({
		found: true,
		session: {
			id: "current-tab",
			url: result.browser.browserUrl ?? result.tab?.url ?? "unknown",
			transport: "chrome-node",
			mode: "transcribe",
			state: "active",
			createdAt: "",
			updatedAt: "",
			participantIdentity: "signed-in Google Chrome profile on a paired node",
			realtime: {
				enabled: false,
				toolPolicy: "safe-read-only"
			},
			chrome: {
				audioBackend: "blackhole-2ch",
				launched: true,
				nodeId: result.nodeId,
				health: result.browser
			},
			notes: []
		}
	});
}
function resolveMeetingInput(config, value) {
	const meeting = value?.trim() || config.defaults.meeting;
	if (!meeting) throw new Error("Meeting input is required. Pass a URL/meeting code or configure defaults.meeting.");
	return meeting;
}
function resolveTokenOptions(config, options) {
	return {
		meeting: resolveMeetingInput(config, options.meeting),
		clientId: options.clientId?.trim() || config.oauth.clientId,
		clientSecret: options.clientSecret?.trim() || config.oauth.clientSecret,
		refreshToken: options.refreshToken?.trim() || config.oauth.refreshToken,
		accessToken: options.accessToken?.trim() || config.oauth.accessToken,
		expiresAt: parseOptionalNumber(options.expiresAt) ?? config.oauth.expiresAt
	};
}
function resolveCreateTokenOptions(config, options) {
	return {
		clientId: options.clientId?.trim() || config.oauth.clientId,
		clientSecret: options.clientSecret?.trim() || config.oauth.clientSecret,
		refreshToken: options.refreshToken?.trim() || config.oauth.refreshToken,
		accessToken: options.accessToken?.trim() || config.oauth.accessToken,
		expiresAt: parseOptionalNumber(options.expiresAt) ?? config.oauth.expiresAt
	};
}
function resolveArtifactTokenOptions(config, options) {
	const meeting = options.meeting?.trim() || config.defaults.meeting;
	const conferenceRecord = options.conferenceRecord?.trim();
	if (!meeting && !conferenceRecord) throw new Error("Meeting input or conference record is required. Pass --meeting, --conference-record, or configure defaults.meeting.");
	return {
		meeting,
		conferenceRecord,
		clientId: options.clientId?.trim() || config.oauth.clientId,
		clientSecret: options.clientSecret?.trim() || config.oauth.clientSecret,
		refreshToken: options.refreshToken?.trim() || config.oauth.refreshToken,
		accessToken: options.accessToken?.trim() || config.oauth.accessToken,
		expiresAt: parseOptionalNumber(options.expiresAt) ?? config.oauth.expiresAt,
		pageSize: parseOptionalNumber(options.pageSize),
		includeTranscriptEntries: options.transcriptEntries !== false,
		allConferenceRecords: Boolean(options.allConferenceRecords)
	};
}
function hasCreateOAuth(config, options) {
	return Boolean(options.accessToken?.trim() || options.refreshToken?.trim() || config.oauth.accessToken || config.oauth.refreshToken);
}
function writeArtifactsSummary(result) {
	if (result.input) writeStdoutLine("input: %s", result.input);
	if (result.space) writeStdoutLine("space: %s", result.space.name);
	writeStdoutLine("conference records: %d", result.conferenceRecords.length);
	for (const entry of result.artifacts) {
		writeStdoutLine("");
		writeStdoutLine("record: %s", entry.conferenceRecord.name);
		writeStdoutLine("started: %s", formatOptional(entry.conferenceRecord.startTime));
		writeStdoutLine("ended: %s", formatOptional(entry.conferenceRecord.endTime));
		writeStdoutLine("participants: %d", entry.participants.length);
		writeStdoutLine("recordings: %d", entry.recordings.length);
		writeStdoutLine("transcripts: %d", entry.transcripts.length);
		writeStdoutLine("transcript entries: %d", entry.transcriptEntries.reduce((count, transcript) => count + transcript.entries.length, 0));
		writeStdoutLine("smart notes: %d", entry.smartNotes.length);
		if (entry.smartNotesError) writeStdoutLine("smart notes warning: %s", entry.smartNotesError);
		for (const recording of entry.recordings) writeStdoutLine("- recording: %s", recording.name);
		for (const transcript of entry.transcripts) writeStdoutLine("- transcript: %s", transcript.name);
		for (const transcriptEntries of entry.transcriptEntries) if (transcriptEntries.entriesError) writeStdoutLine("- transcript entries warning: %s: %s", transcriptEntries.transcript, transcriptEntries.entriesError);
		for (const smartNote of entry.smartNotes) writeStdoutLine("- smart note: %s", smartNote.name);
	}
}
function writeAttendanceSummary(result) {
	if (result.input) writeStdoutLine("input: %s", result.input);
	if (result.space) writeStdoutLine("space: %s", result.space.name);
	writeStdoutLine("conference records: %d", result.conferenceRecords.length);
	writeStdoutLine("attendance rows: %d", result.attendance.length);
	for (const row of result.attendance) {
		const identity = row.displayName || row.user || row.participant;
		writeStdoutLine("");
		writeStdoutLine("participant: %s", identity);
		writeStdoutLine("record: %s", row.conferenceRecord);
		writeStdoutLine("resource: %s", row.participant);
		writeStdoutLine("first joined: %s", formatOptional(row.earliestStartTime));
		writeStdoutLine("last left: %s", formatOptional(row.latestEndTime));
		writeStdoutLine("sessions: %d", row.sessions.length);
		for (const session of row.sessions) writeStdoutLine("- %s: %s -> %s", session.name, formatOptional(session.startTime), formatOptional(session.endTime));
	}
}
function writeLatestConferenceRecordSummary(result) {
	writeStdoutLine("input: %s", result.input);
	writeStdoutLine("space: %s", result.space.name);
	if (!result.conferenceRecord) {
		writeStdoutLine("conference record: none");
		return;
	}
	writeStdoutLine("conference record: %s", result.conferenceRecord.name);
	writeStdoutLine("started: %s", formatOptional(result.conferenceRecord.startTime));
	writeStdoutLine("ended: %s", formatOptional(result.conferenceRecord.endTime));
}
function pushMarkdownLine(lines, text = "") {
	lines.push(text);
}
function formatMarkdownOptional(value) {
	return typeof value === "string" && value.trim() ? value : "n/a";
}
function formatMarkdownIdentity(row) {
	return row.displayName || row.user || row.participant;
}
function renderArtifactsMarkdown(result) {
	const lines = ["# Google Meet Artifacts"];
	if (result.input) pushMarkdownLine(lines, `Input: ${result.input}`);
	if (result.space) pushMarkdownLine(lines, `Space: ${result.space.name}`);
	pushMarkdownLine(lines);
	pushMarkdownLine(lines, `Conference records: ${result.conferenceRecords.length}`);
	for (const entry of result.artifacts) {
		pushMarkdownLine(lines);
		pushMarkdownLine(lines, `## ${entry.conferenceRecord.name}`);
		pushMarkdownLine(lines, `Started: ${formatMarkdownOptional(entry.conferenceRecord.startTime)}`);
		pushMarkdownLine(lines, `Ended: ${formatMarkdownOptional(entry.conferenceRecord.endTime)}`);
		pushMarkdownLine(lines);
		pushMarkdownLine(lines, `Participants: ${entry.participants.length}`);
		pushMarkdownLine(lines, `Recordings: ${entry.recordings.length}`);
		pushMarkdownLine(lines, `Transcripts: ${entry.transcripts.length}`);
		pushMarkdownLine(lines, `Transcript entries: ${entry.transcriptEntries.reduce((count, transcript) => count + transcript.entries.length, 0)}`);
		pushMarkdownLine(lines, `Smart notes: ${entry.smartNotes.length}`);
		if (entry.recordings.length > 0) {
			pushMarkdownLine(lines);
			pushMarkdownLine(lines, "### Recordings");
			for (const recording of entry.recordings) pushMarkdownLine(lines, `- ${recording.name}`);
		}
		if (entry.transcripts.length > 0) {
			pushMarkdownLine(lines);
			pushMarkdownLine(lines, "### Transcripts");
			for (const transcript of entry.transcripts) pushMarkdownLine(lines, `- ${transcript.name}`);
		}
		for (const transcriptEntries of entry.transcriptEntries) {
			pushMarkdownLine(lines);
			pushMarkdownLine(lines, `### Transcript Entries: ${transcriptEntries.transcript}`);
			if (transcriptEntries.entriesError) {
				pushMarkdownLine(lines, `Warning: ${transcriptEntries.entriesError}`);
				continue;
			}
			if (transcriptEntries.entries.length === 0) {
				pushMarkdownLine(lines, "_No transcript entries._");
				continue;
			}
			for (const transcriptEntry of transcriptEntries.entries) {
				const times = transcriptEntry.startTime || transcriptEntry.endTime ? ` (${formatMarkdownOptional(transcriptEntry.startTime)} -> ${formatMarkdownOptional(transcriptEntry.endTime)})` : "";
				pushMarkdownLine(lines, `- ${transcriptEntry.participant ? `${transcriptEntry.participant}: ` : ""}${transcriptEntry.text ?? ""}${times}`);
			}
		}
		if (entry.smartNotes.length > 0) {
			pushMarkdownLine(lines);
			pushMarkdownLine(lines, "### Smart Notes");
			for (const smartNote of entry.smartNotes) pushMarkdownLine(lines, `- ${smartNote.name}`);
		}
	}
	return `${lines.join("\n")}\n`;
}
function renderAttendanceMarkdown(result) {
	const lines = ["# Google Meet Attendance"];
	if (result.input) pushMarkdownLine(lines, `Input: ${result.input}`);
	if (result.space) pushMarkdownLine(lines, `Space: ${result.space.name}`);
	pushMarkdownLine(lines);
	pushMarkdownLine(lines, `Conference records: ${result.conferenceRecords.length}`);
	pushMarkdownLine(lines, `Attendance rows: ${result.attendance.length}`);
	for (const row of result.attendance) {
		pushMarkdownLine(lines);
		pushMarkdownLine(lines, `## ${formatMarkdownIdentity(row)}`);
		pushMarkdownLine(lines, `Record: ${row.conferenceRecord}`);
		pushMarkdownLine(lines, `Resource: ${row.participant}`);
		pushMarkdownLine(lines, `First joined: ${formatMarkdownOptional(row.earliestStartTime)}`);
		pushMarkdownLine(lines, `Last left: ${formatMarkdownOptional(row.latestEndTime)}`);
		pushMarkdownLine(lines, `Sessions: ${row.sessions.length}`);
		for (const session of row.sessions) pushMarkdownLine(lines, `- ${session.name}: ${formatMarkdownOptional(session.startTime)} -> ${formatMarkdownOptional(session.endTime)}`);
	}
	return `${lines.join("\n")}\n`;
}
function registerGoogleMeetCli(params) {
	const root = params.program.command("googlemeet").description("Google Meet participant utilities").addHelpText("after", () => `\nDocs: https://docs.openclaw.ai/plugins/google-meet\n`);
	root.command("auth").description("Google Meet OAuth helpers").command("login").description("Run a PKCE OAuth flow and print refresh-token JSON to store in plugin config").option("--client-id <id>", "OAuth client id override").option("--client-secret <secret>", "OAuth client secret override").option("--manual", "Use copy/paste callback flow instead of localhost callback").option("--json", "Print the token payload as JSON", false).option("--timeout-sec <n>", "Local callback timeout in seconds", "300").action(async (options) => {
		const clientId = options.clientId?.trim() || params.config.oauth.clientId;
		const clientSecret = options.clientSecret?.trim() || params.config.oauth.clientSecret;
		if (!clientId) throw new Error("Missing Google Meet OAuth client id. Configure oauth.clientId or pass --client-id.");
		const { verifier, challenge } = createGoogleMeetPkce();
		const state = createGoogleMeetOAuthState();
		const authUrl = buildGoogleMeetAuthUrl({
			clientId,
			challenge,
			state
		});
		const tokens = await exchangeGoogleMeetAuthCode({
			clientId,
			clientSecret,
			code: await waitForGoogleMeetAuthCode({
				state,
				manual: Boolean(options.manual),
				timeoutMs: (parseOptionalNumber(options.timeoutSec) ?? 300) * 1e3,
				authUrl,
				promptInput,
				writeLine: (message) => writeStdoutLine("%s", message)
			}),
			verifier
		});
		if (!tokens.refreshToken) throw new Error("Google OAuth did not return a refresh token. Re-run the flow with consent and offline access.");
		const payload = {
			oauth: {
				clientId,
				...clientSecret ? { clientSecret } : {},
				refreshToken: tokens.refreshToken,
				accessToken: tokens.accessToken,
				expiresAt: tokens.expiresAt
			},
			scope: tokens.scope,
			tokenType: tokens.tokenType
		};
		if (!options.json) writeStdoutLine("Paste this into plugins.entries.google-meet.config:");
		writeStdoutJson(payload);
	});
	root.command("create").description("Create a new Google Meet space and print its meeting URL").option("--access-token <token>", "Access token override").option("--refresh-token <token>", "Refresh token override").option("--client-id <id>", "OAuth client id override").option("--client-secret <secret>", "OAuth client secret override").option("--expires-at <ms>", "Cached access token expiry as unix epoch milliseconds").option("--no-join", "Only create the meeting URL; do not join it").option("--transport <transport>", "Join transport: chrome, chrome-node, or twilio").option("--mode <mode>", "Join mode: realtime for live talk-back, transcribe for observe/control").option("--message <text>", "Realtime speech to trigger after join").option("--dial-in-number <phone>", "Meet dial-in number for Twilio transport").option("--pin <pin>", "Meet phone PIN; # is appended if omitted").option("--dtmf-sequence <sequence>", "Explicit Twilio DTMF sequence").option("--json", "Print JSON output", false).action(async (options) => {
		if (!hasCreateOAuth(params.config, options)) {
			const rt = await params.ensureRuntime();
			const result = await rt.createViaBrowser();
			const join = options.join !== false ? await rt.join({
				url: result.meetingUri,
				transport: options.transport,
				mode: options.mode,
				message: options.message,
				dialInNumber: options.dialInNumber,
				pin: options.pin,
				dtmfSequence: options.dtmfSequence
			}) : void 0;
			const payload = {
				source: result.source,
				meetingUri: result.meetingUri,
				joined: Boolean(join),
				...join ? { join } : {},
				browser: {
					nodeId: result.nodeId,
					targetId: result.targetId,
					browserUrl: result.browserUrl,
					browserTitle: result.browserTitle
				}
			};
			if (options.json) {
				writeStdoutJson(payload);
				return;
			}
			writeStdoutLine("meeting uri: %s", result.meetingUri);
			writeStdoutLine("source: browser");
			writeStdoutLine("node: %s", result.nodeId);
			if (join) writeStdoutLine("joined: %s", join.session.id);
			else writeStdoutLine("joined: no (run `openclaw googlemeet join %s`)", result.meetingUri);
			return;
		}
		const token = await resolveGoogleMeetAccessToken(resolveCreateTokenOptions(params.config, options));
		const result = await createGoogleMeetSpace({ accessToken: token.accessToken });
		const join = options.join !== false ? await (await params.ensureRuntime()).join({
			url: result.meetingUri,
			transport: options.transport,
			mode: options.mode,
			message: options.message,
			dialInNumber: options.dialInNumber,
			pin: options.pin,
			dtmfSequence: options.dtmfSequence
		}) : void 0;
		if (options.json) {
			writeStdoutJson({
				...result,
				tokenSource: token.refreshed ? "refresh-token" : "cached-access-token",
				joined: Boolean(join),
				...join ? { join } : {}
			});
			return;
		}
		writeStdoutLine("meeting uri: %s", result.meetingUri);
		writeStdoutLine("space: %s", result.space.name);
		if (result.space.meetingCode) writeStdoutLine("meeting code: %s", result.space.meetingCode);
		writeStdoutLine("token source: %s", token.refreshed ? "refresh-token" : "cached-access-token");
		if (join) writeStdoutLine("joined: %s", join.session.id);
		else writeStdoutLine("joined: no (run `openclaw googlemeet join %s`)", result.meetingUri);
	});
	root.command("join").argument("[url]", "Explicit https://meet.google.com/... URL").option("--transport <transport>", "Transport: chrome, chrome-node, or twilio").option("--mode <mode>", "Mode: realtime for live talk-back, transcribe to join without the realtime voice bridge").option("--message <text>", "Realtime speech to trigger after join").option("--dial-in-number <phone>", "Meet dial-in number for Twilio transport").option("--pin <pin>", "Meet phone PIN; # is appended if omitted").option("--dtmf-sequence <sequence>", "Explicit Twilio DTMF sequence").action(async (url, options) => {
		writeStdoutJson((await (await params.ensureRuntime()).join({
			url: resolveMeetingInput(params.config, url),
			transport: options.transport,
			mode: options.mode,
			message: options.message,
			dialInNumber: options.dialInNumber,
			pin: options.pin,
			dtmfSequence: options.dtmfSequence
		})).session);
	});
	root.command("test-speech").argument("[url]", "Explicit https://meet.google.com/... URL").option("--transport <transport>", "Transport: chrome, chrome-node, or twilio").option("--mode <mode>", "Mode: realtime for live talk-back, transcribe to join without the realtime voice bridge").option("--message <text>", "Realtime speech to trigger", "Say exactly: Google Meet speech test complete.").action(async (url, options) => {
		writeStdoutJson(await (await params.ensureRuntime()).testSpeech({
			url: resolveMeetingInput(params.config, url),
			transport: options.transport,
			mode: options.mode,
			message: options.message
		}));
	});
	root.command("resolve-space").description("Resolve a Meet URL, meeting code, or spaces/{id} to its canonical space").option("--meeting <value>", "Meet URL, meeting code, or spaces/{id}").option("--access-token <token>", "Access token override").option("--refresh-token <token>", "Refresh token override").option("--client-id <id>", "OAuth client id override").option("--client-secret <secret>", "OAuth client secret override").option("--expires-at <ms>", "Cached access token expiry as unix epoch milliseconds").option("--json", "Print JSON output", false).action(async (options) => {
		const resolved = resolveTokenOptions(params.config, options);
		const token = await resolveGoogleMeetAccessToken(resolved);
		const space = await fetchGoogleMeetSpace({
			accessToken: token.accessToken,
			meeting: resolved.meeting
		});
		if (options.json) {
			writeStdoutJson(space);
			return;
		}
		writeStdoutLine("input: %s", resolved.meeting);
		writeStdoutLine("space: %s", space.name);
		if (space.meetingCode) writeStdoutLine("meeting code: %s", space.meetingCode);
		if (space.meetingUri) writeStdoutLine("meeting uri: %s", space.meetingUri);
		writeStdoutLine("active conference: %s", space.activeConference ? "yes" : "no");
		writeStdoutLine("token source: %s", token.refreshed ? "refresh-token" : "cached-access-token");
	});
	root.command("preflight").description("Validate OAuth + meeting resolution prerequisites for Meet media work").option("--meeting <value>", "Meet URL, meeting code, or spaces/{id}").option("--access-token <token>", "Access token override").option("--refresh-token <token>", "Refresh token override").option("--client-id <id>", "OAuth client id override").option("--client-secret <secret>", "OAuth client secret override").option("--expires-at <ms>", "Cached access token expiry as unix epoch milliseconds").option("--json", "Print JSON output", false).action(async (options) => {
		const resolved = resolveTokenOptions(params.config, options);
		const token = await resolveGoogleMeetAccessToken(resolved);
		const space = await fetchGoogleMeetSpace({
			accessToken: token.accessToken,
			meeting: resolved.meeting
		});
		const report = buildGoogleMeetPreflightReport({
			input: resolved.meeting,
			space,
			previewAcknowledged: params.config.preview.enrollmentAcknowledged,
			tokenSource: token.refreshed ? "refresh-token" : "cached-access-token"
		});
		if (options.json) {
			writeStdoutJson(report);
			return;
		}
		writeStdoutLine("input: %s", report.input);
		writeStdoutLine("resolved space: %s", report.resolvedSpaceName);
		if (report.meetingCode) writeStdoutLine("meeting code: %s", report.meetingCode);
		if (report.meetingUri) writeStdoutLine("meeting uri: %s", report.meetingUri);
		writeStdoutLine("active conference: %s", report.hasActiveConference ? "yes" : "no");
		writeStdoutLine("preview acknowledged: %s", report.previewAcknowledged ? "yes" : "no");
		writeStdoutLine("token source: %s", report.tokenSource);
		if (report.blockers.length === 0) {
			writeStdoutLine("blockers: none");
			return;
		}
		writeStdoutLine("blockers:");
		for (const blocker of report.blockers) writeStdoutLine("- %s", blocker);
	});
	root.command("latest").description("Find the latest Meet conference record for a meeting").option("--meeting <value>", "Meet URL, meeting code, or spaces/{id}").option("--access-token <token>", "Access token override").option("--refresh-token <token>", "Refresh token override").option("--client-id <id>", "OAuth client id override").option("--client-secret <secret>", "OAuth client secret override").option("--expires-at <ms>", "Cached access token expiry as unix epoch milliseconds").option("--json", "Print JSON output", false).action(async (options) => {
		const resolved = resolveTokenOptions(params.config, options);
		const token = await resolveGoogleMeetAccessToken(resolved);
		const result = await fetchLatestGoogleMeetConferenceRecord({
			accessToken: token.accessToken,
			meeting: resolved.meeting
		});
		if (options.json) {
			writeStdoutJson({
				...result,
				tokenSource: token.refreshed ? "refresh-token" : "cached-access-token"
			});
			return;
		}
		writeLatestConferenceRecordSummary(result);
		writeStdoutLine("token source: %s", token.refreshed ? "refresh-token" : "cached-access-token");
	});
	root.command("artifacts").description("List Meet conference records and available participant/artifact metadata").option("--meeting <value>", "Meet URL, meeting code, or spaces/{id}").option("--conference-record <name>", "Conference record name or id").option("--access-token <token>", "Access token override").option("--refresh-token <token>", "Refresh token override").option("--client-id <id>", "OAuth client id override").option("--client-secret <secret>", "OAuth client secret override").option("--expires-at <ms>", "Cached access token expiry as unix epoch milliseconds").option("--page-size <n>", "Max resources per Meet API page").option("--all-conference-records", "Fetch every conference record for --meeting").option("--no-transcript-entries", "Skip structured transcript entry lookup").option("--format <format>", "Output format: summary or markdown", "summary").option("--output <path>", "Write output to a file instead of stdout").option("--json", "Print JSON output", false).action(async (options) => {
		const resolved = resolveArtifactTokenOptions(params.config, options);
		const token = await resolveGoogleMeetAccessToken(resolved);
		const result = await fetchGoogleMeetArtifacts({
			accessToken: token.accessToken,
			meeting: resolved.meeting,
			conferenceRecord: resolved.conferenceRecord,
			pageSize: resolved.pageSize,
			includeTranscriptEntries: resolved.includeTranscriptEntries,
			allConferenceRecords: resolved.allConferenceRecords
		});
		if (options.json) {
			await writeCliOutput(options, JSON.stringify({
				...result,
				tokenSource: token.refreshed ? "refresh-token" : "cached-access-token"
			}, null, 2));
			return;
		}
		if (options.format === "markdown") {
			await writeCliOutput(options, renderArtifactsMarkdown(result));
			return;
		}
		if (options.format && options.format !== "summary") throw new Error("Unsupported format. Expected summary or markdown.");
		writeArtifactsSummary(result);
		writeStdoutLine("token source: %s", token.refreshed ? "refresh-token" : "cached-access-token");
	});
	root.command("attendance").description("List Meet participants and participant sessions").option("--meeting <value>", "Meet URL, meeting code, or spaces/{id}").option("--conference-record <name>", "Conference record name or id").option("--access-token <token>", "Access token override").option("--refresh-token <token>", "Refresh token override").option("--client-id <id>", "OAuth client id override").option("--client-secret <secret>", "OAuth client secret override").option("--expires-at <ms>", "Cached access token expiry as unix epoch milliseconds").option("--page-size <n>", "Max resources per Meet API page").option("--all-conference-records", "Fetch every conference record for --meeting").option("--format <format>", "Output format: summary or markdown", "summary").option("--output <path>", "Write output to a file instead of stdout").option("--json", "Print JSON output", false).action(async (options) => {
		const resolved = resolveArtifactTokenOptions(params.config, options);
		const token = await resolveGoogleMeetAccessToken(resolved);
		const result = await fetchGoogleMeetAttendance({
			accessToken: token.accessToken,
			meeting: resolved.meeting,
			conferenceRecord: resolved.conferenceRecord,
			pageSize: resolved.pageSize,
			allConferenceRecords: resolved.allConferenceRecords
		});
		if (options.json) {
			await writeCliOutput(options, JSON.stringify({
				...result,
				tokenSource: token.refreshed ? "refresh-token" : "cached-access-token"
			}, null, 2));
			return;
		}
		if (options.format === "markdown") {
			await writeCliOutput(options, renderAttendanceMarkdown(result));
			return;
		}
		if (options.format && options.format !== "summary") throw new Error("Unsupported format. Expected summary or markdown.");
		writeAttendanceSummary(result);
		writeStdoutLine("token source: %s", token.refreshed ? "refresh-token" : "cached-access-token");
	});
	root.command("status").argument("[session-id]", "Meet session ID").action(async (sessionId) => {
		writeStdoutJson((await params.ensureRuntime()).status(sessionId));
	});
	root.command("doctor").description("Show human-readable Meet session/browser/realtime health").argument("[session-id]", "Meet session ID").option("--oauth", "Verify Google Meet OAuth token refresh without printing secrets", false).option("--meeting <value>", "Also verify spaces.get for a Meet URL, code, or spaces/{id}").option("--create-space", "Also verify spaces.create by creating a throwaway Meet space", false).option("--access-token <token>", "Access token override").option("--refresh-token <token>", "Refresh token override").option("--client-id <id>", "OAuth client id override").option("--client-secret <secret>", "OAuth client secret override").option("--expires-at <ms>", "Cached access token expiry as unix epoch milliseconds").option("--json", "Print JSON output", false).action(async (sessionId, options) => {
		if (options.oauth) {
			const report = await buildOAuthDoctorReport(params.config, options);
			if (options.json) {
				writeStdoutJson(report);
				return;
			}
			writeOAuthDoctorReport(report);
			return;
		}
		const status = (await params.ensureRuntime()).status(sessionId);
		if (options.json) {
			writeStdoutJson(status);
			return;
		}
		writeDoctorStatus(status);
	});
	root.command("recover-tab").description("Focus and inspect an existing Google Meet tab on the Chrome node").argument("[url]", "Optional Meet URL to match").option("--json", "Print JSON output", false).action(async (url, options) => {
		const result = await (await params.ensureRuntime()).recoverCurrentTab({ url });
		if (options.json) {
			writeStdoutJson(result);
			return;
		}
		writeRecoverCurrentTabResult(result);
	});
	root.command("setup").description("Show Google Meet transport setup status").option("--json", "Print JSON output", false).action(async (options) => {
		const status = await (await params.ensureRuntime()).setupStatus();
		if (options.json) {
			writeStdoutJson(status);
			return;
		}
		writeSetupStatus(status);
	});
	root.command("leave").argument("<session-id>", "Meet session ID").action(async (sessionId) => {
		if (!(await (await params.ensureRuntime()).leave(sessionId)).found) throw new Error("session not found");
		writeStdoutLine("left %s", sessionId);
	});
	root.command("speak").argument("<session-id>", "Meet session ID").argument("[message]", "Realtime instructions to speak now").action(async (sessionId, message) => {
		const result = (await params.ensureRuntime()).speak(sessionId, message);
		if (!result.found) throw new Error("session not found");
		if (!result.spoken) throw new Error("session has no active realtime audio bridge");
		writeStdoutLine("speaking on %s", sessionId);
	});
}
//#endregion
export { registerGoogleMeetCli };
