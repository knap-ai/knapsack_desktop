import { n as fetchWithSsrFGuard } from "./fetch-guard-8smVA_M-.js";
import "./ssrf-runtime-CIV6CU_8.js";
//#region extensions/google-meet/src/google-api-errors.ts
const REAUTH_HINT = "Re-run `openclaw googlemeet auth login` and store the refreshed oauth block.";
function scopeText(scopes) {
	return scopes.map((scope) => `\`${scope}\``).join(", ");
}
async function googleApiError(params) {
	const scopeHint = params.scopes && params.scopes.length > 0 ? ` Required OAuth scope: ${scopeText(params.scopes)}. ${REAUTH_HINT}` : "";
	return /* @__PURE__ */ new Error(`${params.prefix} failed (${params.response.status}): ${params.detail}${scopeHint}`);
}
//#endregion
//#region extensions/google-meet/src/drive.ts
const GOOGLE_DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3";
const GOOGLE_DRIVE_API_HOST = "www.googleapis.com";
const GOOGLE_DRIVE_MEET_SCOPE = "https://www.googleapis.com/auth/drive.meet.readonly";
const TEXT_PLAIN_MIME = "text/plain";
function appendQuery$1(url, query) {
	const parsed = new URL(url);
	for (const [key, value] of Object.entries(query)) if (value !== void 0) parsed.searchParams.set(key, value);
	return parsed.toString();
}
function extractGoogleDriveDocumentId(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed) return;
	if (/^https?:\/\//i.test(trimmed)) try {
		return new URL(trimmed).pathname.match(/\/document\/d\/([^/]+)/)?.[1];
	} catch {
		return;
	}
	return trimmed.split("/").filter(Boolean).at(-1);
}
async function exportGoogleDriveDocumentText(params) {
	const { response, release } = await fetchWithSsrFGuard({
		url: appendQuery$1(`${GOOGLE_DRIVE_API_BASE_URL}/files/${encodeURIComponent(params.documentId)}/export`, { mimeType: TEXT_PLAIN_MIME }),
		init: { headers: {
			Authorization: `Bearer ${params.accessToken}`,
			Accept: TEXT_PLAIN_MIME
		} },
		policy: { allowedHostnames: [GOOGLE_DRIVE_API_HOST] },
		auditContext: "google-meet.drive.files.export"
	});
	try {
		if (!response.ok) throw await googleApiError({
			response,
			detail: await response.text(),
			prefix: "Google Drive files.export",
			scopes: [GOOGLE_DRIVE_MEET_SCOPE]
		});
		return await response.text();
	} finally {
		await release();
	}
}
//#endregion
//#region extensions/google-meet/src/meet.ts
const GOOGLE_MEET_API_BASE_URL = `https://meet.googleapis.com/v2`;
const GOOGLE_MEET_URL_HOST = "meet.google.com";
const GOOGLE_MEET_API_HOST = "meet.googleapis.com";
const GOOGLE_MEET_MEDIA_SCOPE = "https://www.googleapis.com/auth/meetings.conference.media.readonly";
const GOOGLE_MEET_SPACE_SCOPE = "https://www.googleapis.com/auth/meetings.space.readonly";
function normalizeGoogleMeetSpaceName(input) {
	const trimmed = input.trim();
	if (!trimmed) throw new Error("Meeting input is required");
	if (trimmed.startsWith("spaces/")) {
		const suffix = trimmed.slice(7).trim();
		if (!suffix) throw new Error("spaces/ input must include a meeting code or space id");
		return `spaces/${suffix}`;
	}
	if (/^https?:\/\//i.test(trimmed)) {
		const url = new URL(trimmed);
		if (url.hostname !== GOOGLE_MEET_URL_HOST) throw new Error(`Expected a ${GOOGLE_MEET_URL_HOST} URL, received ${url.hostname}`);
		const firstSegment = url.pathname.split("/").map((segment) => segment.trim()).find(Boolean);
		if (!firstSegment) throw new Error("Google Meet URL did not include a meeting code");
		return `spaces/${firstSegment}`;
	}
	return `spaces/${trimmed}`;
}
function encodeSpaceNameForPath(name) {
	return name.split("/").map(encodeURIComponent).join("/");
}
function encodeResourceNameForPath(name) {
	const trimmed = name.trim();
	if (!trimmed) throw new Error("Google Meet resource name is required");
	return trimmed.split("/").map(encodeURIComponent).join("/");
}
function normalizeConferenceRecordName(input) {
	const trimmed = input.trim();
	if (!trimmed) throw new Error("Conference record is required");
	return trimmed.startsWith("conferenceRecords/") ? trimmed : `conferenceRecords/${trimmed}`;
}
function appendQuery(url, query) {
	if (!query) return url;
	const parsed = new URL(url);
	for (const [key, value] of Object.entries(query)) if (value !== void 0) parsed.searchParams.set(key, String(value));
	return parsed.toString();
}
function assertResourceArray(value, key, context) {
	if (value === void 0) return [];
	if (!Array.isArray(value)) throw new Error(`Google Meet ${context} response had non-array ${key}`);
	const resources = value;
	for (const resource of resources) if (!resource.name?.trim()) throw new Error(`Google Meet ${context} response included a resource without name`);
	return resources;
}
function getErrorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
async function fetchGoogleMeetJson(params) {
	const { response, release } = await fetchWithSsrFGuard({
		url: appendQuery(`${GOOGLE_MEET_API_BASE_URL}/${params.path}`, params.query),
		init: { headers: {
			Authorization: `Bearer ${params.accessToken}`,
			Accept: "application/json"
		} },
		policy: { allowedHostnames: [GOOGLE_MEET_API_HOST] },
		auditContext: params.auditContext
	});
	try {
		if (!response.ok) throw await googleApiError({
			response,
			detail: await response.text(),
			prefix: params.errorPrefix,
			scopes: [GOOGLE_MEET_MEDIA_SCOPE]
		});
		return await response.json();
	} finally {
		await release();
	}
}
async function listGoogleMeetCollection(params) {
	const items = [];
	let pageToken;
	do {
		const payload = await fetchGoogleMeetJson({
			accessToken: params.accessToken,
			path: params.path,
			query: {
				...params.query,
				pageToken
			},
			auditContext: params.auditContext,
			errorPrefix: params.errorPrefix
		});
		const pageItems = assertResourceArray(payload[params.collectionKey], params.collectionKey, params.errorPrefix);
		const remaining = typeof params.maxItems === "number" ? Math.max(params.maxItems - items.length, 0) : void 0;
		items.push(...remaining === void 0 ? pageItems : pageItems.slice(0, remaining));
		if (typeof params.maxItems === "number" && items.length >= params.maxItems) break;
		pageToken = typeof payload.nextPageToken === "string" ? payload.nextPageToken : void 0;
	} while (pageToken);
	return items;
}
async function fetchGoogleMeetSpace(params) {
	const { response, release } = await fetchWithSsrFGuard({
		url: `${GOOGLE_MEET_API_BASE_URL}/${encodeSpaceNameForPath(normalizeGoogleMeetSpaceName(params.meeting))}`,
		init: { headers: {
			Authorization: `Bearer ${params.accessToken}`,
			Accept: "application/json"
		} },
		policy: { allowedHostnames: [GOOGLE_MEET_API_HOST] },
		auditContext: "google-meet.spaces.get"
	});
	try {
		if (!response.ok) throw await googleApiError({
			response,
			detail: await response.text(),
			prefix: "Google Meet spaces.get",
			scopes: [GOOGLE_MEET_SPACE_SCOPE]
		});
		const payload = await response.json();
		if (!payload.name?.trim()) throw new Error("Google Meet spaces.get response was missing name");
		return payload;
	} finally {
		await release();
	}
}
async function createGoogleMeetSpace(params) {
	const { response, release } = await fetchWithSsrFGuard({
		url: `${GOOGLE_MEET_API_BASE_URL}/spaces`,
		init: {
			method: "POST",
			headers: {
				Authorization: `Bearer ${params.accessToken}`,
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: "{}"
		},
		policy: { allowedHostnames: [GOOGLE_MEET_API_HOST] },
		auditContext: "google-meet.spaces.create"
	});
	try {
		if (!response.ok) throw await googleApiError({
			response,
			detail: await response.text(),
			prefix: "Google Meet spaces.create",
			scopes: ["https://www.googleapis.com/auth/meetings.space.created"]
		});
		const payload = await response.json();
		if (!payload.name?.trim()) throw new Error("Google Meet spaces.create response was missing name");
		const meetingUri = payload.meetingUri?.trim();
		if (!meetingUri) throw new Error("Google Meet spaces.create response was missing meetingUri");
		return {
			space: payload,
			meetingUri
		};
	} finally {
		await release();
	}
}
async function fetchGoogleMeetConferenceRecord(params) {
	const name = normalizeConferenceRecordName(params.conferenceRecord);
	const payload = await fetchGoogleMeetJson({
		accessToken: params.accessToken,
		path: encodeResourceNameForPath(name),
		auditContext: "google-meet.conferenceRecords.get",
		errorPrefix: "Google Meet conferenceRecords.get"
	});
	if (!payload.name?.trim()) throw new Error("Google Meet conferenceRecords.get response was missing name");
	return payload;
}
async function listGoogleMeetConferenceRecords(params) {
	const filter = params.meeting ? `space.name = "${normalizeGoogleMeetSpaceName(params.meeting)}"` : void 0;
	return listGoogleMeetCollection({
		accessToken: params.accessToken,
		path: "conferenceRecords",
		collectionKey: "conferenceRecords",
		query: {
			pageSize: params.pageSize,
			filter
		},
		maxItems: params.maxItems,
		auditContext: "google-meet.conferenceRecords.list",
		errorPrefix: "Google Meet conferenceRecords.list"
	});
}
async function fetchLatestGoogleMeetConferenceRecord(params) {
	const space = await fetchGoogleMeetSpace({
		accessToken: params.accessToken,
		meeting: params.meeting
	});
	const [conferenceRecord] = await listGoogleMeetConferenceRecords({
		accessToken: params.accessToken,
		meeting: space.name,
		pageSize: 1,
		maxItems: 1
	});
	return {
		input: params.meeting,
		space,
		...conferenceRecord ? { conferenceRecord } : {}
	};
}
async function listGoogleMeetParticipants(params) {
	const parent = normalizeConferenceRecordName(params.conferenceRecord);
	return listGoogleMeetCollection({
		accessToken: params.accessToken,
		path: `${encodeResourceNameForPath(parent)}/participants`,
		collectionKey: "participants",
		query: { pageSize: params.pageSize },
		auditContext: "google-meet.conferenceRecords.participants.list",
		errorPrefix: "Google Meet conferenceRecords.participants.list"
	});
}
async function listGoogleMeetParticipantSessions(params) {
	return listGoogleMeetCollection({
		accessToken: params.accessToken,
		path: `${encodeResourceNameForPath(params.participant)}/participantSessions`,
		collectionKey: "participantSessions",
		query: { pageSize: params.pageSize },
		auditContext: "google-meet.conferenceRecords.participants.participantSessions.list",
		errorPrefix: "Google Meet conferenceRecords.participants.participantSessions.list"
	});
}
async function listGoogleMeetRecordings(params) {
	const parent = normalizeConferenceRecordName(params.conferenceRecord);
	return listGoogleMeetCollection({
		accessToken: params.accessToken,
		path: `${encodeResourceNameForPath(parent)}/recordings`,
		collectionKey: "recordings",
		query: { pageSize: params.pageSize },
		auditContext: "google-meet.conferenceRecords.recordings.list",
		errorPrefix: "Google Meet conferenceRecords.recordings.list"
	});
}
async function listGoogleMeetTranscripts(params) {
	const parent = normalizeConferenceRecordName(params.conferenceRecord);
	return listGoogleMeetCollection({
		accessToken: params.accessToken,
		path: `${encodeResourceNameForPath(parent)}/transcripts`,
		collectionKey: "transcripts",
		query: { pageSize: params.pageSize },
		auditContext: "google-meet.conferenceRecords.transcripts.list",
		errorPrefix: "Google Meet conferenceRecords.transcripts.list"
	});
}
async function listGoogleMeetTranscriptEntries(params) {
	return listGoogleMeetCollection({
		accessToken: params.accessToken,
		path: `${encodeResourceNameForPath(params.transcript)}/entries`,
		collectionKey: "transcriptEntries",
		query: { pageSize: params.pageSize },
		auditContext: "google-meet.conferenceRecords.transcripts.entries.list",
		errorPrefix: "Google Meet conferenceRecords.transcripts.entries.list"
	});
}
async function listGoogleMeetSmartNotes(params) {
	const parent = normalizeConferenceRecordName(params.conferenceRecord);
	return listGoogleMeetCollection({
		accessToken: params.accessToken,
		path: `${encodeResourceNameForPath(parent)}/smartNotes`,
		collectionKey: "smartNotes",
		query: { pageSize: params.pageSize },
		auditContext: "google-meet.conferenceRecords.smartNotes.list",
		errorPrefix: "Google Meet conferenceRecords.smartNotes.list"
	});
}
function getParticipantDisplayName(participant) {
	return participant.signedinUser?.displayName ?? participant.anonymousUser?.displayName ?? participant.phoneUser?.displayName;
}
function getParticipantUser(participant) {
	return participant.signedinUser?.user;
}
function getDocsDestinationDocumentId(destination) {
	return extractGoogleDriveDocumentId(destination?.document) ?? extractGoogleDriveDocumentId(destination?.documentId) ?? extractGoogleDriveDocumentId(destination?.file);
}
async function attachDocumentText(params) {
	const documentId = getDocsDestinationDocumentId(params.resource.docsDestination);
	if (!documentId) return params.resource;
	try {
		return {
			...params.resource,
			documentText: await exportGoogleDriveDocumentText({
				accessToken: params.accessToken,
				documentId
			})
		};
	} catch (error) {
		return {
			...params.resource,
			documentTextError: getErrorMessage(error)
		};
	}
}
function parseGoogleMeetTimestamp(value) {
	if (!value?.trim()) return;
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : void 0;
}
function isoFromMs(value) {
	return typeof value === "number" && Number.isFinite(value) ? new Date(value).toISOString() : void 0;
}
function minTimestamp(values) {
	const parsed = values.map(parseGoogleMeetTimestamp).filter((value) => typeof value === "number");
	return parsed.length > 0 ? isoFromMs(Math.min(...parsed)) : void 0;
}
function maxTimestamp(values) {
	const parsed = values.map(parseGoogleMeetTimestamp).filter((value) => typeof value === "number");
	return parsed.length > 0 ? isoFromMs(Math.max(...parsed)) : void 0;
}
function sumSessionDurationMs(sessions, fallbackStart, fallbackEnd) {
	const sessionTotal = sessions.reduce((total, session) => {
		const startMs = parseGoogleMeetTimestamp(session.startTime);
		const endMs = parseGoogleMeetTimestamp(session.endTime);
		return startMs !== void 0 && endMs !== void 0 && endMs > startMs ? total + (endMs - startMs) : total;
	}, 0);
	if (sessionTotal > 0) return sessionTotal;
	const startMs = parseGoogleMeetTimestamp(fallbackStart);
	const endMs = parseGoogleMeetTimestamp(fallbackEnd);
	return startMs !== void 0 && endMs !== void 0 && endMs > startMs ? endMs - startMs : void 0;
}
function attendanceMergeKey(row) {
	return (row.user ?? row.displayName ?? row.participant).trim().toLocaleLowerCase();
}
function sortSessions(sessions) {
	return sessions.toSorted((left, right) => (parseGoogleMeetTimestamp(left.startTime) ?? 0) - (parseGoogleMeetTimestamp(right.startTime) ?? 0));
}
function decorateAttendanceRow(row, conferenceRecord, params) {
	const sessions = sortSessions(row.sessions);
	const firstJoinTime = minTimestamp([row.earliestStartTime, ...sessions.map((session) => session.startTime)]);
	const lastLeaveTime = maxTimestamp([row.latestEndTime, ...sessions.map((session) => session.endTime)]);
	const durationMs = sumSessionDurationMs(sessions, firstJoinTime, lastLeaveTime);
	const conferenceStartMs = parseGoogleMeetTimestamp(conferenceRecord.startTime);
	const conferenceEndMs = parseGoogleMeetTimestamp(conferenceRecord.endTime);
	const firstJoinMs = parseGoogleMeetTimestamp(firstJoinTime);
	const lastLeaveMs = parseGoogleMeetTimestamp(lastLeaveTime);
	const lateGraceMs = (params.lateAfterMinutes ?? 5) * 6e4;
	const earlyGraceMs = (params.earlyBeforeMinutes ?? 5) * 6e4;
	const lateByMs = conferenceStartMs !== void 0 && firstJoinMs !== void 0 ? Math.max(firstJoinMs - conferenceStartMs, 0) : void 0;
	const earlyLeaveByMs = conferenceEndMs !== void 0 && lastLeaveMs !== void 0 ? Math.max(conferenceEndMs - lastLeaveMs, 0) : void 0;
	const decorated = {
		...row,
		sessions,
		participants: row.participants ?? [row.participant]
	};
	decorated.earliestStartTime = firstJoinTime ?? row.earliestStartTime;
	decorated.latestEndTime = lastLeaveTime ?? row.latestEndTime;
	if (firstJoinTime) decorated.firstJoinTime = firstJoinTime;
	if (lastLeaveTime) decorated.lastLeaveTime = lastLeaveTime;
	if (durationMs !== void 0) decorated.durationMs = durationMs;
	if (lateByMs !== void 0) {
		decorated.late = lateByMs > lateGraceMs;
		if (decorated.late) decorated.lateByMs = lateByMs;
	}
	if (earlyLeaveByMs !== void 0) {
		decorated.earlyLeave = earlyLeaveByMs > earlyGraceMs;
		if (decorated.earlyLeave) decorated.earlyLeaveByMs = earlyLeaveByMs;
	}
	return decorated;
}
function mergeAttendanceRows(rows, conferenceRecord, params) {
	if (params.mergeDuplicateParticipants === false) return rows.map((row) => decorateAttendanceRow(row, conferenceRecord, params));
	const grouped = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const key = attendanceMergeKey(row);
		const existing = grouped.get(key);
		if (!existing) {
			grouped.set(key, {
				...row,
				participants: [row.participant]
			});
			continue;
		}
		existing.participants = [...new Set([...existing.participants ?? [existing.participant], row.participant])];
		existing.sessions.push(...row.sessions);
		existing.displayName ??= row.displayName;
		existing.user ??= row.user;
		existing.earliestStartTime = minTimestamp([existing.earliestStartTime, row.earliestStartTime]);
		existing.latestEndTime = maxTimestamp([existing.latestEndTime, row.latestEndTime]);
	}
	return [...grouped.values()].map((row) => decorateAttendanceRow(row, conferenceRecord, params));
}
async function resolveConferenceRecordQuery(params) {
	if (params.conferenceRecord?.trim()) {
		const conferenceRecord = await fetchGoogleMeetConferenceRecord({
			accessToken: params.accessToken,
			conferenceRecord: params.conferenceRecord
		});
		return {
			input: params.conferenceRecord.trim(),
			conferenceRecords: [conferenceRecord]
		};
	}
	if (!params.meeting?.trim()) throw new Error("Meeting input or conference record is required");
	const space = await fetchGoogleMeetSpace({
		accessToken: params.accessToken,
		meeting: params.meeting
	});
	const conferenceRecords = await listGoogleMeetConferenceRecords({
		accessToken: params.accessToken,
		meeting: space.name,
		pageSize: params.allConferenceRecords ? params.pageSize : 1,
		maxItems: params.allConferenceRecords ? void 0 : 1
	});
	return {
		input: params.meeting,
		space,
		conferenceRecords
	};
}
async function fetchGoogleMeetArtifacts(params) {
	const resolved = await resolveConferenceRecordQuery(params);
	const artifacts = await Promise.all(resolved.conferenceRecords.map(async (conferenceRecord) => {
		const [participants, recordings, transcripts, smartNotesResult] = await Promise.all([
			listGoogleMeetParticipants({
				accessToken: params.accessToken,
				conferenceRecord: conferenceRecord.name,
				pageSize: params.pageSize
			}),
			listGoogleMeetRecordings({
				accessToken: params.accessToken,
				conferenceRecord: conferenceRecord.name,
				pageSize: params.pageSize
			}),
			listGoogleMeetTranscripts({
				accessToken: params.accessToken,
				conferenceRecord: conferenceRecord.name,
				pageSize: params.pageSize
			}),
			listGoogleMeetSmartNotes({
				accessToken: params.accessToken,
				conferenceRecord: conferenceRecord.name,
				pageSize: params.pageSize
			}).then((smartNotes) => ({ smartNotes })).catch((error) => ({
				smartNotes: [],
				smartNotesError: getErrorMessage(error)
			}))
		]);
		const transcriptEntries = params.includeTranscriptEntries === false ? [] : await Promise.all(transcripts.map(async (transcript) => {
			try {
				return {
					transcript: transcript.name,
					entries: await listGoogleMeetTranscriptEntries({
						accessToken: params.accessToken,
						transcript: transcript.name,
						pageSize: params.pageSize
					})
				};
			} catch (error) {
				return {
					transcript: transcript.name,
					entries: [],
					entriesError: getErrorMessage(error)
				};
			}
		}));
		return {
			conferenceRecord,
			participants,
			recordings,
			transcripts: params.includeDocumentBodies === true ? await Promise.all(transcripts.map((transcript) => attachDocumentText({
				accessToken: params.accessToken,
				resource: transcript
			}))) : transcripts,
			transcriptEntries,
			smartNotes: params.includeDocumentBodies === true ? await Promise.all(smartNotesResult.smartNotes.map((smartNote) => attachDocumentText({
				accessToken: params.accessToken,
				resource: smartNote
			}))) : smartNotesResult.smartNotes,
			...smartNotesResult.smartNotesError ? { smartNotesError: smartNotesResult.smartNotesError } : {}
		};
	}));
	return {
		input: resolved.input,
		space: resolved.space,
		conferenceRecords: resolved.conferenceRecords,
		artifacts
	};
}
async function fetchGoogleMeetAttendance(params) {
	const resolved = await resolveConferenceRecordQuery(params);
	const nestedRows = await Promise.all(resolved.conferenceRecords.map(async (conferenceRecord) => {
		const participants = await listGoogleMeetParticipants({
			accessToken: params.accessToken,
			conferenceRecord: conferenceRecord.name,
			pageSize: params.pageSize
		});
		return mergeAttendanceRows(await Promise.all(participants.map(async (participant) => ({
			conferenceRecord: conferenceRecord.name,
			participant: participant.name,
			displayName: getParticipantDisplayName(participant),
			user: getParticipantUser(participant),
			earliestStartTime: participant.earliestStartTime,
			latestEndTime: participant.latestEndTime,
			sessions: await listGoogleMeetParticipantSessions({
				accessToken: params.accessToken,
				participant: participant.name,
				pageSize: params.pageSize
			})
		}))), conferenceRecord, params);
	}));
	return {
		input: resolved.input,
		space: resolved.space,
		conferenceRecords: resolved.conferenceRecords,
		attendance: nestedRows.flat()
	};
}
function buildGoogleMeetPreflightReport(params) {
	const blockers = [];
	if (!params.previewAcknowledged) blockers.push("Set preview.enrollmentAcknowledged=true after confirming your Cloud project, OAuth principal, and meeting participants are enrolled in the Google Workspace Developer Preview Program.");
	return {
		input: params.input,
		resolvedSpaceName: params.space.name,
		meetingCode: params.space.meetingCode,
		meetingUri: params.space.meetingUri,
		hasActiveConference: Boolean(params.space.activeConference),
		previewAcknowledged: params.previewAcknowledged,
		tokenSource: params.tokenSource,
		blockers
	};
}
//#endregion
export { fetchGoogleMeetSpace as a, fetchGoogleMeetAttendance as i, createGoogleMeetSpace as n, fetchLatestGoogleMeetConferenceRecord as o, fetchGoogleMeetArtifacts as r, googleApiError as s, buildGoogleMeetPreflightReport as t };
