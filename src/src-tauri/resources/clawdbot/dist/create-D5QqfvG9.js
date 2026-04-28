import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import "./text-runtime-DfALcXL5.js";
import { n as createGoogleMeetSpace } from "./meet-cl7wP0I6.js";
import { t as createMeetWithBrowserProxyOnNode } from "./chrome-create-C5hnKQN_.js";
import { u as resolveGoogleMeetAccessToken } from "./oauth-BwCXCvyY.js";
//#region extensions/google-meet/src/create.ts
function normalizeTransport(value) {
	return value === "chrome" || value === "chrome-node" || value === "twilio" ? value : void 0;
}
function normalizeMode(value) {
	return value === "realtime" || value === "transcribe" ? value : void 0;
}
async function createSpaceFromParams(config, raw) {
	const token = await resolveGoogleMeetAccessToken({
		clientId: normalizeOptionalString(raw.clientId) ?? config.oauth.clientId,
		clientSecret: normalizeOptionalString(raw.clientSecret) ?? config.oauth.clientSecret,
		refreshToken: normalizeOptionalString(raw.refreshToken) ?? config.oauth.refreshToken,
		accessToken: normalizeOptionalString(raw.accessToken) ?? config.oauth.accessToken,
		expiresAt: typeof raw.expiresAt === "number" ? raw.expiresAt : config.oauth.expiresAt
	});
	return {
		source: "api",
		token,
		...await createGoogleMeetSpace({ accessToken: token.accessToken })
	};
}
function hasGoogleMeetOAuth(config, raw) {
	return Boolean(normalizeOptionalString(raw.accessToken) ?? normalizeOptionalString(raw.refreshToken) ?? config.oauth.accessToken ?? config.oauth.refreshToken);
}
async function createMeetFromParams(params) {
	if (hasGoogleMeetOAuth(params.config, params.raw)) {
		const { token: _token, ...result } = await createSpaceFromParams(params.config, params.raw);
		return {
			...result,
			joined: false,
			nextAction: "URL-only creation was requested. Call google_meet with action=join and url=meetingUri to enter the meeting."
		};
	}
	const browser = await createMeetWithBrowserProxyOnNode({
		runtime: params.runtime,
		config: params.config
	});
	return {
		source: browser.source,
		meetingUri: browser.meetingUri,
		joined: false,
		nextAction: "URL-only creation was requested. Call google_meet with action=join and url=meetingUri to enter the meeting.",
		space: {
			name: `browser/${browser.meetingUri.split("/").pop()}`,
			meetingUri: browser.meetingUri
		},
		browser: {
			nodeId: browser.nodeId,
			targetId: browser.targetId,
			browserUrl: browser.browserUrl,
			browserTitle: browser.browserTitle,
			notes: browser.notes
		}
	};
}
async function createAndJoinMeetFromParams(params) {
	const created = await createMeetFromParams(params);
	const join = await (await params.ensureRuntime()).join({
		url: created.meetingUri,
		transport: normalizeTransport(params.raw.transport),
		mode: normalizeMode(params.raw.mode),
		dialInNumber: normalizeOptionalString(params.raw.dialInNumber),
		pin: normalizeOptionalString(params.raw.pin),
		dtmfSequence: normalizeOptionalString(params.raw.dtmfSequence),
		message: normalizeOptionalString(params.raw.message)
	});
	return {
		...created,
		joined: true,
		nextAction: "Share meetingUri with participants; the OpenClaw agent has started the join flow.",
		join
	};
}
//#endregion
export { createAndJoinMeetFromParams, createMeetFromParams };
