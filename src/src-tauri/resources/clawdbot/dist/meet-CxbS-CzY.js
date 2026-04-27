import { n as fetchWithSsrFGuard } from "./fetch-guard-DKbwHPzH.js";
import "./ssrf-runtime-DjO5-xxH.js";
//#region extensions/google-meet/src/meet.ts
const GOOGLE_MEET_API_BASE_URL = `https://meet.googleapis.com/v2`;
const GOOGLE_MEET_URL_HOST = "meet.google.com";
const GOOGLE_MEET_API_HOST = "meet.googleapis.com";
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
		if (!response.ok) {
			const detail = await response.text();
			throw new Error(`${params.errorPrefix} failed (${response.status}): ${detail}`);
		}
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
		if (!response.ok) {
			const detail = await response.text();
			throw new Error(`Google Meet spaces.get failed (${response.status}): ${detail}`);
		}
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
		if (!response.ok) {
			const detail = await response.text();
			throw new Error(`Google Meet spaces.create failed (${response.status}): ${detail}`);
		}
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
		return {
			conferenceRecord,
			participants,
			recordings,
			transcripts,
			transcriptEntries: params.includeTranscriptEntries === false ? [] : await Promise.all(transcripts.map(async (transcript) => {
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
			})),
			smartNotes: smartNotesResult.smartNotes,
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
		return Promise.all(participants.map(async (participant) => ({
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
		})));
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
export { fetchGoogleMeetSpace as a, fetchGoogleMeetAttendance as i, createGoogleMeetSpace as n, fetchLatestGoogleMeetConferenceRecord as o, fetchGoogleMeetArtifacts as r, buildGoogleMeetPreflightReport as t };
