import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { t as stripUrlUserInfo } from "./url-userinfo-D8TE3MuH.js";
import { n as DISCORD_DEFAULT_LISTENER_TIMEOUT_MS, t as DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS } from "./timeouts-BnOxp0oI.js";
import JSON5 from "json5";
import { isDeepStrictEqual } from "node:util";
import "zod";
//#region src/config/redact-snapshot.raw.ts
function replaceSensitiveValuesInRaw(params) {
	const values = [...params.sensitiveValues].toSorted((a, b) => b.length - a.length);
	let result = params.raw;
	for (const value of values) result = result.replaceAll(value, params.redactedSentinel);
	return result;
}
function shouldFallbackToStructuredRawRedaction(params) {
	try {
		const parsed = JSON5.parse(params.redactedRaw);
		const restored = params.restoreParsed(parsed);
		if (!restored.ok) return true;
		return !isDeepStrictEqual(restored.result, params.originalConfig);
	} catch {
		return true;
	}
}
//#endregion
//#region src/config/redact-snapshot.secret-ref.ts
function isSecretRefShape(value) {
	return typeof value.source === "string" && typeof value.id === "string";
}
function redactSecretRefId(params) {
	const { value, values, redactedSentinel, isEnvVarPlaceholder } = params;
	const redacted = { ...value };
	if (!isEnvVarPlaceholder(value.id)) {
		values.push(value.id);
		redacted.id = redactedSentinel;
	}
	return redacted;
}
//#endregion
//#region src/config/media-audio-field-metadata.ts
const MEDIA_AUDIO_FIELD_HELP = {
	"tools.media.audio.enabled": "Enable audio understanding so voice notes or audio clips can be transcribed/summarized for agent context. Disable when audio ingestion is outside policy or unnecessary for your workflows.",
	"tools.media.audio.maxBytes": "Maximum accepted audio payload size in bytes before processing is rejected or clipped by policy. Set this based on expected recording length and upstream provider limits.",
	"tools.media.audio.maxChars": "Maximum characters retained from audio understanding output to prevent oversized transcript injection. Increase for long-form dictation, or lower to keep conversational turns compact.",
	"tools.media.audio.prompt": "Instruction template guiding audio understanding output style, such as concise summary versus near-verbatim transcript. Keep wording consistent so downstream automations can rely on output format.",
	"tools.media.audio.timeoutSeconds": "Timeout in seconds for audio understanding execution before the operation is cancelled. Use longer timeouts for long recordings and tighter ones for interactive chat responsiveness.",
	"tools.media.audio.language": "Preferred language hint for audio understanding/transcription when provider support is available. Set this to improve recognition accuracy for known primary languages.",
	"tools.media.audio.attachments": "Attachment policy for audio inputs indicating which uploaded files are eligible for audio processing. Keep restrictive defaults in mixed-content channels to avoid unintended audio workloads.",
	"tools.media.audio.models": "Ordered model preferences specifically for audio understanding, used before shared media model fallback. Choose models optimized for transcription quality in your primary language/domain.",
	"tools.media.audio.scope": "Scope selector for when audio understanding runs across inbound messages and attachments. Keep focused scopes in high-volume channels to reduce cost and avoid accidental transcription.",
	"tools.media.audio.echoTranscript": "Echo the audio transcript back to the originating chat before agent processing. When enabled, users immediately see what was heard from their voice note, helping them verify transcription accuracy before the agent acts on it. Default: false.",
	"tools.media.audio.echoFormat": "Format string for the echoed transcript message. Use `{transcript}` as a placeholder for the transcribed text. Default: '📝 \"{transcript}\"'."
};
const MEDIA_AUDIO_FIELD_LABELS = {
	"tools.media.audio.enabled": "Enable Audio Understanding",
	"tools.media.audio.maxBytes": "Audio Understanding Max Bytes",
	"tools.media.audio.maxChars": "Audio Understanding Max Chars",
	"tools.media.audio.prompt": "Audio Understanding Prompt",
	"tools.media.audio.timeoutSeconds": "Audio Understanding Timeout (sec)",
	"tools.media.audio.language": "Audio Understanding Language",
	"tools.media.audio.attachments": "Audio Understanding Attachment Policy",
	"tools.media.audio.models": "Audio Understanding Models",
	"tools.media.audio.scope": "Audio Understanding Scope",
	"tools.media.audio.echoTranscript": "Echo Transcript to Chat",
	"tools.media.audio.echoFormat": "Transcript Echo Format"
};
//#endregion
//#region src/config/schema.irc.ts
const IRC_FIELD_LABELS = {
	"channels.irc": "IRC",
	"channels.irc.dmPolicy": "IRC DM Policy",
	"channels.irc.nickserv.enabled": "IRC NickServ Enabled",
	"channels.irc.nickserv.service": "IRC NickServ Service",
	"channels.irc.nickserv.password": "IRC NickServ Password",
	"channels.irc.nickserv.passwordFile": "IRC NickServ Password File",
	"channels.irc.nickserv.register": "IRC NickServ Register",
	"channels.irc.nickserv.registerEmail": "IRC NickServ Register Email"
};
const IRC_FIELD_HELP = {
	"channels.irc.configWrites": "Allow IRC to write config in response to channel events/commands (default: true).",
	"channels.irc.dmPolicy": "Direct message access control (\"pairing\" recommended). \"open\" requires channels.irc.allowFrom=[\"*\"].",
	"channels.irc.nickserv.enabled": "Enable NickServ identify/register after connect (defaults to enabled when password is configured).",
	"channels.irc.nickserv.service": "NickServ service nick (default: NickServ).",
	"channels.irc.nickserv.password": "NickServ password used for IDENTIFY/REGISTER (sensitive).",
	"channels.irc.nickserv.passwordFile": "Optional file path containing NickServ password.",
	"channels.irc.nickserv.register": "If true, send NickServ REGISTER on every connect. Use once for initial registration, then disable.",
	"channels.irc.nickserv.registerEmail": "Email used with NickServ REGISTER (required when register=true)."
};
//#endregion
//#region src/config/talk-defaults.ts
const TALK_SILENCE_TIMEOUT_MS_BY_PLATFORM = {
	macos: 700,
	android: 700,
	ios: 900
};
function describeTalkSilenceTimeoutDefaults() {
	return `${TALK_SILENCE_TIMEOUT_MS_BY_PLATFORM.macos} ms on macOS and Android, ${TALK_SILENCE_TIMEOUT_MS_BY_PLATFORM.ios} ms on iOS`;
}
`${describeTalkSilenceTimeoutDefaults()}`, { ...MEDIA_AUDIO_FIELD_HELP }, { ...IRC_FIELD_HELP }, `${DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS}`, `${DISCORD_DEFAULT_LISTENER_TIMEOUT_MS}`;
({ ...MEDIA_AUDIO_FIELD_LABELS }), { ...IRC_FIELD_LABELS };
//#endregion
//#region src/config/schema.tags.ts
const CONFIG_TAGS = [
	"security",
	"auth",
	"network",
	"access",
	"privacy",
	"observability",
	"performance",
	"reliability",
	"storage",
	"models",
	"media",
	"automation",
	"channels",
	"tools",
	"advanced"
];
const TAG_PRIORITY = {
	security: 0,
	auth: 1,
	access: 2,
	network: 3,
	privacy: 4,
	observability: 5,
	reliability: 6,
	performance: 7,
	storage: 8,
	models: 9,
	media: 10,
	automation: 11,
	channels: 12,
	tools: 13,
	advanced: 14
};
const TAG_OVERRIDES = {
	"gateway.auth.token": [
		"security",
		"auth",
		"access",
		"network"
	],
	"gateway.auth.password": [
		"security",
		"auth",
		"access",
		"network"
	],
	"gateway.push.apns.relay.baseUrl": ["network", "advanced"],
	"gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback": [
		"security",
		"access",
		"network",
		"advanced"
	],
	"gateway.controlUi.dangerouslyDisableDeviceAuth": [
		"security",
		"access",
		"network",
		"advanced"
	],
	"gateway.controlUi.allowInsecureAuth": [
		"security",
		"access",
		"network",
		"advanced"
	],
	"tools.exec.applyPatch.workspaceOnly": [
		"tools",
		"security",
		"access",
		"advanced"
	]
};
const PREFIX_RULES = [
	{
		prefix: "channels.",
		tags: ["channels", "network"]
	},
	{
		prefix: "tools.",
		tags: ["tools"]
	},
	{
		prefix: "gateway.",
		tags: ["network"]
	},
	{
		prefix: "nodehost.",
		tags: ["network"]
	},
	{
		prefix: "discovery.",
		tags: ["network"]
	},
	{
		prefix: "auth.",
		tags: ["auth", "access"]
	},
	{
		prefix: "memory.",
		tags: ["storage"]
	},
	{
		prefix: "models.",
		tags: ["models"]
	},
	{
		prefix: "diagnostics.",
		tags: ["observability"]
	},
	{
		prefix: "logging.",
		tags: ["observability"]
	},
	{
		prefix: "cron.",
		tags: ["automation"]
	},
	{
		prefix: "talk.",
		tags: ["media"]
	},
	{
		prefix: "audio.",
		tags: ["media"]
	}
];
const KEYWORD_RULES = [
	{
		pattern: /(token|password|secret|api[_.-]?key|tlsfingerprint)/i,
		tags: ["security", "auth"]
	},
	{
		pattern: /(allow|deny|owner|permission|policy|access)/i,
		tags: ["access"]
	},
	{
		pattern: /(timeout|debounce|interval|concurrency|max|limit|cachettl)/i,
		tags: ["performance"]
	},
	{
		pattern: /(retry|backoff|fallback|circuit|health|reload|probe)/i,
		tags: ["reliability"]
	},
	{
		pattern: /(path|dir|file|store|db|session|cache)/i,
		tags: ["storage"]
	},
	{
		pattern: /(telemetry|trace|metrics|logs|diagnostic)/i,
		tags: ["observability"]
	},
	{
		pattern: /(experimental|dangerously|insecure)/i,
		tags: ["advanced", "security"]
	},
	{
		pattern: /(privacy|redact|sanitize|anonym|pseudonym)/i,
		tags: ["privacy"]
	}
];
const MODEL_PATH_PATTERN = /(^|\.)(model|models|modelid|imagemodel)(\.|$)/i;
const MEDIA_PATH_PATTERN = /(tools\.media\.|^audio\.|^talk\.|image|video|stt|tts)/i;
const AUTOMATION_PATH_PATTERN = /(cron|heartbeat|schedule|onstart|watchdebounce)/i;
const AUTH_KEYWORD_PATTERN = /(token|password|secret|api[_.-]?key|credential|oauth)/i;
function normalizeTag(tag) {
	const normalized = tag.trim().toLowerCase();
	return CONFIG_TAGS.includes(normalized) ? normalized : null;
}
function normalizeTags(tags) {
	const out = /* @__PURE__ */ new Set();
	for (const tag of tags) {
		const normalized = normalizeTag(tag);
		if (normalized) out.add(normalized);
	}
	return [...out].toSorted((a, b) => TAG_PRIORITY[a] - TAG_PRIORITY[b]);
}
function patternToRegExp(pattern) {
	const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^.]+");
	return new RegExp(`^${escaped}$`, "i");
}
function resolveOverride(path) {
	const direct = TAG_OVERRIDES[path];
	if (direct) return direct;
	for (const [pattern, tags] of Object.entries(TAG_OVERRIDES)) {
		if (!pattern.includes("*")) continue;
		if (patternToRegExp(pattern).test(path)) return tags;
	}
}
function addTags(set, tags) {
	for (const tag of tags) set.add(tag);
}
function deriveTagsForPath(path, hint) {
	const lowerPath = path.toLowerCase();
	const override = resolveOverride(path);
	if (override) return normalizeTags(override);
	const tags = /* @__PURE__ */ new Set();
	for (const rule of PREFIX_RULES) if (lowerPath.startsWith(rule.prefix)) addTags(tags, rule.tags);
	for (const rule of KEYWORD_RULES) if (rule.pattern.test(path)) addTags(tags, rule.tags);
	if (MODEL_PATH_PATTERN.test(path)) tags.add("models");
	if (MEDIA_PATH_PATTERN.test(path)) tags.add("media");
	if (AUTOMATION_PATH_PATTERN.test(path)) tags.add("automation");
	if (hint?.sensitive) {
		tags.add("security");
		if (AUTH_KEYWORD_PATTERN.test(path)) tags.add("auth");
	}
	if (hint?.advanced) tags.add("advanced");
	if (tags.size === 0) tags.add("advanced");
	return normalizeTags([...tags]);
}
function applyDerivedTags(hints) {
	const next = {};
	for (const [path, hint] of Object.entries(hints)) {
		const existingTags = Array.isArray(hint?.tags) ? hint.tags : [];
		const tags = normalizeTags([...deriveTagsForPath(path, hint), ...existingTags]);
		next[path] = {
			...hint,
			tags
		};
	}
	return next;
}
createSubsystemLogger("config/schema");
const NORMALIZED_SENSITIVE_KEY_WHITELIST_SUFFIXES = [
	"maxtokens",
	"maxoutputtokens",
	"maxinputtokens",
	"maxcompletiontokens",
	"contexttokens",
	"totaltokens",
	"tokencount",
	"tokenlimit",
	"tokenbudget",
	"passwordFile"
].map((suffix) => suffix.toLowerCase());
const SENSITIVE_PATTERNS = [
	/token$/i,
	/password/i,
	/secret/i,
	/api.?key/i,
	/serviceaccount(?:ref)?$/i
];
function isWhitelistedSensitivePath(path) {
	const lowerPath = path.toLowerCase();
	return NORMALIZED_SENSITIVE_KEY_WHITELIST_SUFFIXES.some((suffix) => lowerPath.endsWith(suffix));
}
function matchesSensitivePattern(path) {
	return SENSITIVE_PATTERNS.some((pattern) => pattern.test(path));
}
function isSensitiveConfigPath(path) {
	return !isWhitelistedSensitivePath(path) && matchesSensitivePattern(path);
}
function applySensitiveHints(hints, allowedKeys) {
	const next = { ...hints };
	for (const key of Object.keys(next)) {
		if (allowedKeys && !allowedKeys.has(key)) continue;
		if (next[key]?.sensitive !== void 0) continue;
		if (isSensitiveConfigPath(key)) next[key] = {
			...next[key],
			sensitive: true
		};
	}
	return next;
}
//#endregion
//#region src/config/redact-snapshot.ts
const log = createSubsystemLogger("config/redaction");
const ENV_VAR_PLACEHOLDER_PATTERN = /^\$\{[^}]*\}$/;
function isSensitivePath(path) {
	if (path.endsWith("[]")) return isSensitiveConfigPath(path.slice(0, -2));
	else return isSensitiveConfigPath(path);
}
function isEnvVarPlaceholder(value) {
	return ENV_VAR_PLACEHOLDER_PATTERN.test(value.trim());
}
function isWholeObjectSensitivePath(path) {
	const lowered = path.toLowerCase();
	return lowered.endsWith("serviceaccount") || lowered.endsWith("serviceaccountref");
}
function isUserInfoUrlPath(path) {
	return path.endsWith(".baseUrl") || path.endsWith(".httpUrl");
}
function collectSensitiveStrings(value, values) {
	if (typeof value === "string") {
		if (!isEnvVarPlaceholder(value)) values.push(value);
		return;
	}
	if (Array.isArray(value)) {
		for (const item of value) collectSensitiveStrings(item, values);
		return;
	}
	if (value && typeof value === "object") {
		const obj = value;
		if (isSecretRefShape(obj)) {
			if (!isEnvVarPlaceholder(obj.id)) values.push(obj.id);
			return;
		}
		for (const item of Object.values(obj)) collectSensitiveStrings(item, values);
	}
}
function isExplicitlyNonSensitivePath(hints, paths) {
	if (!hints) return false;
	return paths.some((path) => hints[path]?.sensitive === false);
}
/**
* Sentinel value used to replace sensitive config fields in gateway responses.
* Write-side handlers (config.set, config.apply, config.patch) detect this
* sentinel and restore the original value from the on-disk config, so a
* round-trip through the Web UI does not corrupt credentials.
*/
const REDACTED_SENTINEL = "__OPENCLAW_REDACTED__";
function buildRedactionLookup(hints) {
	let result = /* @__PURE__ */ new Set();
	for (const [path, hint] of Object.entries(hints)) {
		if (!hint.sensitive) continue;
		const parts = path.split(".");
		let joinedPath = parts.shift() ?? "";
		result.add(joinedPath);
		if (joinedPath.endsWith("[]")) result.add(joinedPath.slice(0, -2));
		for (const part of parts) {
			if (part.endsWith("[]")) result.add(`${joinedPath}.${part.slice(0, -2)}`);
			joinedPath = `${joinedPath}.${part}`;
			result.add(joinedPath);
		}
	}
	if (result.size !== 0) result.add("");
	return result;
}
/**
* Deep-walk an object and replace string values at sensitive paths
* with the redaction sentinel.
*/
function redactObject(obj, hints) {
	if (hints) {
		const lookup = buildRedactionLookup(hints);
		return lookup.has("") ? redactObjectWithLookup(obj, lookup, "", [], hints) : redactObjectGuessing(obj, "", [], hints);
	} else return redactObjectGuessing(obj, "", []);
}
/**
* Collect all sensitive string values from a config object.
* Used for text-based redaction of the raw JSON5 source.
*/
function collectSensitiveValues(obj, hints) {
	const result = [];
	if (hints) {
		const lookup = buildRedactionLookup(hints);
		if (lookup.has("")) redactObjectWithLookup(obj, lookup, "", result, hints);
		else redactObjectGuessing(obj, "", result, hints);
	} else redactObjectGuessing(obj, "", result);
	return result;
}
/**
* Worker for redactObject() and collectSensitiveValues().
* Used when there are ConfigUiHints available.
*/
function redactObjectWithLookup(obj, lookup, prefix, values, hints) {
	if (obj === null || obj === void 0) return obj;
	if (Array.isArray(obj)) {
		const path = `${prefix}[]`;
		if (!lookup.has(path)) return redactObjectGuessing(obj, prefix, values, hints);
		return obj.map((item) => {
			if (typeof item === "string" && !isEnvVarPlaceholder(item)) {
				values.push(item);
				return REDACTED_SENTINEL;
			}
			return redactObjectWithLookup(item, lookup, path, values, hints);
		});
	}
	if (typeof obj === "object") {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			const path = prefix ? `${prefix}.${key}` : key;
			const wildcardPath = prefix ? `${prefix}.*` : "*";
			let matched = false;
			for (const candidate of [path, wildcardPath]) {
				result[key] = value;
				if (lookup.has(candidate)) {
					matched = true;
					if (typeof value === "string" && !isEnvVarPlaceholder(value)) {
						result[key] = REDACTED_SENTINEL;
						values.push(value);
					} else if (typeof value === "object" && value !== null) if (hints[candidate]?.sensitive === true && !Array.isArray(value)) {
						const objectValue = value;
						if (isSecretRefShape(objectValue)) result[key] = redactSecretRefId({
							value: objectValue,
							values,
							redactedSentinel: REDACTED_SENTINEL,
							isEnvVarPlaceholder
						});
						else {
							collectSensitiveStrings(objectValue, values);
							result[key] = REDACTED_SENTINEL;
						}
					} else result[key] = redactObjectWithLookup(value, lookup, candidate, values, hints);
					else if (hints[candidate]?.sensitive === true && value !== void 0 && value !== null) result[key] = REDACTED_SENTINEL;
					else if (typeof value === "string" && isUserInfoUrlPath(path)) if (stripUrlUserInfo(value) !== value) {
						values.push(value);
						result[key] = REDACTED_SENTINEL;
					} else result[key] = value;
					break;
				}
			}
			if (!matched) {
				const markedNonSensitive = isExplicitlyNonSensitivePath(hints, [path, wildcardPath]);
				if (typeof value === "string" && !markedNonSensitive && isSensitivePath(path) && !isEnvVarPlaceholder(value)) {
					result[key] = REDACTED_SENTINEL;
					values.push(value);
				} else if (typeof value === "string" && isUserInfoUrlPath(path)) if (stripUrlUserInfo(value) !== value) {
					values.push(value);
					result[key] = REDACTED_SENTINEL;
				} else result[key] = value;
				else if (typeof value === "object" && value !== null) result[key] = redactObjectGuessing(value, path, values, hints);
			}
		}
		return result;
	}
	return obj;
}
/**
* Worker for redactObject() and collectSensitiveValues().
* Used when ConfigUiHints are NOT available.
*/
function redactObjectGuessing(obj, prefix, values, hints) {
	if (obj === null || obj === void 0) return obj;
	if (Array.isArray(obj)) return obj.map((item) => {
		const path = `${prefix}[]`;
		if (!isExplicitlyNonSensitivePath(hints, [path]) && isSensitivePath(path) && typeof item === "string" && !isEnvVarPlaceholder(item)) {
			values.push(item);
			return REDACTED_SENTINEL;
		}
		return redactObjectGuessing(item, path, values, hints);
	});
	if (typeof obj === "object") {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			const dotPath = prefix ? `${prefix}.${key}` : key;
			const wildcardPath = prefix ? `${prefix}.*` : "*";
			if (!isExplicitlyNonSensitivePath(hints, [dotPath, wildcardPath]) && isSensitivePath(dotPath) && typeof value === "string" && !isEnvVarPlaceholder(value)) {
				result[key] = REDACTED_SENTINEL;
				values.push(value);
			} else if (!isExplicitlyNonSensitivePath(hints, [dotPath, wildcardPath]) && isSensitivePath(dotPath) && isWholeObjectSensitivePath(dotPath) && value && typeof value === "object" && !Array.isArray(value)) {
				collectSensitiveStrings(value, values);
				result[key] = REDACTED_SENTINEL;
			} else if (typeof value === "string" && isUserInfoUrlPath(dotPath)) if (stripUrlUserInfo(value) !== value) {
				values.push(value);
				result[key] = REDACTED_SENTINEL;
			} else result[key] = value;
			else if (typeof value === "object" && value !== null) result[key] = redactObjectGuessing(value, dotPath, values, hints);
			else result[key] = value;
		}
		return result;
	}
	return obj;
}
/**
* Replace known sensitive values in a raw JSON5 string with the sentinel.
* Values are replaced longest-first to avoid partial matches.
*/
function redactRawText(raw, config, hints) {
	return replaceSensitiveValuesInRaw({
		raw,
		sensitiveValues: collectSensitiveValues(config, hints),
		redactedSentinel: REDACTED_SENTINEL
	});
}
let suppressRestoreWarnings = false;
function withRestoreWarningsSuppressed(fn) {
	const prev = suppressRestoreWarnings;
	suppressRestoreWarnings = true;
	try {
		return fn();
	} finally {
		suppressRestoreWarnings = prev;
	}
}
/**
* Returns a copy of the config snapshot with all sensitive fields
* replaced by {@link REDACTED_SENTINEL}. The `hash` is preserved
* (it tracks config identity, not content).
*
* Both `config` (the parsed object) and `raw` (the JSON5 source) are scrubbed
* so no credential can leak through either path.
*
* When `uiHints` are provided, sensitivity is determined from the schema hints.
* Without hints, falls back to regex-based detection via `isSensitivePath()`.
*/
/**
* Redact sensitive fields from a plain config object (not a full snapshot).
* Used by write endpoints (config.set, config.patch, config.apply) to avoid
* leaking credentials in their responses.
*/
function redactConfigObject(value, uiHints) {
	return redactObject(value, uiHints);
}
function redactConfigSnapshot(snapshot, uiHints) {
	if (!snapshot.valid) return {
		...snapshot,
		config: {},
		raw: null,
		parsed: null,
		resolved: {}
	};
	const redactedConfig = redactObject(snapshot.config, uiHints);
	const redactedParsed = snapshot.parsed ? redactObject(snapshot.parsed, uiHints) : snapshot.parsed;
	let redactedRaw = snapshot.raw ? redactRawText(snapshot.raw, snapshot.config, uiHints) : null;
	if (redactedRaw && shouldFallbackToStructuredRawRedaction({
		redactedRaw,
		originalConfig: snapshot.config,
		restoreParsed: (parsed) => withRestoreWarningsSuppressed(() => restoreRedactedValues(parsed, snapshot.config, uiHints))
	})) redactedRaw = JSON5.stringify(redactedParsed ?? redactedConfig, null, 2);
	const redactedResolved = redactConfigObject(snapshot.resolved, uiHints);
	return {
		...snapshot,
		config: redactedConfig,
		raw: redactedRaw,
		parsed: redactedParsed,
		resolved: redactedResolved
	};
}
/**
* Deep-walk `incoming` and replace any {@link REDACTED_SENTINEL} values
* (on sensitive paths) with the corresponding value from `original`.
*
* This is called by config.set / config.apply / config.patch before writing,
* so that credentials survive a Web UI round-trip unmodified.
*/
function restoreRedactedValues(incoming, original, hints) {
	if (incoming === null || incoming === void 0) return {
		ok: false,
		error: "no input"
	};
	if (typeof incoming !== "object") return {
		ok: false,
		error: "input not an object"
	};
	try {
		if (hints) {
			const lookup = buildRedactionLookup(hints);
			if (lookup.has("")) return {
				ok: true,
				result: restoreRedactedValuesWithLookup(incoming, original, lookup, "", hints)
			};
			else return {
				ok: true,
				result: restoreRedactedValuesGuessing(incoming, original, "", hints)
			};
		} else return {
			ok: true,
			result: restoreRedactedValuesGuessing(incoming, original, "")
		};
	} catch (err) {
		if (err instanceof RedactionError) return {
			ok: false,
			humanReadableMessage: `Sentinel value "${REDACTED_SENTINEL}" in key ${err.key} is not valid as real data`
		};
		throw err;
	}
}
var RedactionError = class extends Error {
	constructor(key) {
		super("internal error class---should never escape");
		this.key = key;
		this.name = "RedactionError";
	}
};
function restoreOriginalValueOrThrow(params) {
	if (params.key in params.original) return params.original[params.key];
	if (!suppressRestoreWarnings) log.warn(`Cannot un-redact config key ${params.path} as it doesn't have any value`);
	throw new RedactionError(params.path);
}
function mapRedactedArray(params) {
	const originalArray = Array.isArray(params.original) ? params.original : [];
	if (params.incoming.length < originalArray.length) log.warn(`Redacted config array key ${params.path} has been truncated`);
	return params.incoming.map((item, index) => params.mapItem(item, index, originalArray));
}
function toObjectRecord(value) {
	if (value && typeof value === "object" && !Array.isArray(value)) return value;
	return {};
}
function shouldPassThroughRestoreValue(incoming) {
	return incoming === null || incoming === void 0 || typeof incoming !== "object";
}
function toRestoreArrayContext(incoming, prefix) {
	if (!Array.isArray(incoming)) return null;
	return {
		incoming,
		path: `${prefix}[]`
	};
}
function restoreArrayItemWithLookup(params) {
	if (params.item === "__OPENCLAW_REDACTED__") return params.originalArray[params.index];
	return restoreRedactedValuesWithLookup(params.item, params.originalArray[params.index], params.lookup, params.path, params.hints);
}
function restoreArrayItemWithGuessing(params) {
	if (!isExplicitlyNonSensitivePath(params.hints, [params.path]) && isSensitivePath(params.path) && params.item === "__OPENCLAW_REDACTED__") return params.originalArray[params.index];
	return restoreRedactedValuesGuessing(params.item, params.originalArray[params.index], params.path, params.hints);
}
function restoreGuessingArray(incoming, original, path, hints) {
	return mapRedactedArray({
		incoming,
		original,
		path,
		mapItem: (item, index, originalArray) => restoreArrayItemWithGuessing({
			item,
			index,
			originalArray,
			path,
			hints
		})
	});
}
/**
* Worker for restoreRedactedValues().
* Used when there are ConfigUiHints available.
*/
function restoreRedactedValuesWithLookup(incoming, original, lookup, prefix, hints) {
	if (shouldPassThroughRestoreValue(incoming)) return incoming;
	const arrayContext = toRestoreArrayContext(incoming, prefix);
	if (arrayContext) {
		const { incoming: incomingArray, path } = arrayContext;
		if (!lookup.has(path)) return restoreRedactedValuesGuessing(incomingArray, original, prefix, hints);
		return mapRedactedArray({
			incoming: incomingArray,
			original,
			path,
			mapItem: (item, index, originalArray) => restoreArrayItemWithLookup({
				item,
				index,
				originalArray,
				lookup,
				path,
				hints
			})
		});
	}
	const orig = toObjectRecord(original);
	const result = {};
	for (const [key, value] of Object.entries(incoming)) {
		result[key] = value;
		const path = prefix ? `${prefix}.${key}` : key;
		const wildcardPath = prefix ? `${prefix}.*` : "*";
		let matched = false;
		for (const candidate of [path, wildcardPath]) if (lookup.has(candidate)) {
			matched = true;
			if (value === "__OPENCLAW_REDACTED__" && (hints[candidate]?.sensitive === true || isUserInfoUrlPath(path))) result[key] = restoreOriginalValueOrThrow({
				key,
				path: candidate,
				original: orig
			});
			else if (typeof value === "object" && value !== null) result[key] = restoreRedactedValuesWithLookup(value, orig[key], lookup, candidate, hints);
			break;
		}
		if (!matched) {
			if (!isExplicitlyNonSensitivePath(hints, [path, wildcardPath]) && value === "__OPENCLAW_REDACTED__" && (isSensitivePath(path) || isUserInfoUrlPath(path))) result[key] = restoreOriginalValueOrThrow({
				key,
				path,
				original: orig
			});
			else if (typeof value === "object" && value !== null) result[key] = restoreRedactedValuesGuessing(value, orig[key], path, hints);
		}
	}
	return result;
}
/**
* Worker for restoreRedactedValues().
* Used when ConfigUiHints are NOT available.
*/
function restoreRedactedValuesGuessing(incoming, original, prefix, hints) {
	if (shouldPassThroughRestoreValue(incoming)) return incoming;
	const arrayContext = toRestoreArrayContext(incoming, prefix);
	if (arrayContext) {
		const { incoming: incomingArray, path } = arrayContext;
		return restoreGuessingArray(incomingArray, original, path, hints);
	}
	const orig = toObjectRecord(original);
	const result = {};
	for (const [key, value] of Object.entries(incoming)) {
		const path = prefix ? `${prefix}.${key}` : key;
		if (!isExplicitlyNonSensitivePath(hints, [path, prefix ? `${prefix}.*` : "*"]) && value === "__OPENCLAW_REDACTED__" && (isSensitivePath(path) || isUserInfoUrlPath(path))) result[key] = restoreOriginalValueOrThrow({
			key,
			path,
			original: orig
		});
		else if (typeof value === "object" && value !== null) result[key] = restoreRedactedValuesGuessing(value, orig[key], path, hints);
		else result[key] = value;
	}
	return result;
}
//#endregion
export { applyDerivedTags as a, applySensitiveHints as i, redactConfigSnapshot as n, restoreRedactedValues as r, redactConfigObject as t };
