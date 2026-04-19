import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as parseSemver, n as isAtLeast } from "./runtime-guard-BWDkLtoT.js";
//#region src/plugins/min-host-version.ts
const MIN_HOST_VERSION_FORMAT = "openclaw.install.minHostVersion must use a semver floor in the form \">=x.y.z\"";
const MIN_HOST_VERSION_RE = /^>=(\d+)\.(\d+)\.(\d+)$/;
function parseMinHostVersionRequirement(raw) {
	if (typeof raw !== "string") return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const match = trimmed.match(MIN_HOST_VERSION_RE);
	if (!match) return null;
	const minimumLabel = `${match[1]}.${match[2]}.${match[3]}`;
	if (!parseSemver(minimumLabel)) return null;
	return {
		raw: trimmed,
		minimumLabel
	};
}
function checkMinHostVersion(params) {
	if (params.minHostVersion === void 0) return {
		ok: true,
		requirement: null
	};
	const requirement = parseMinHostVersionRequirement(params.minHostVersion);
	if (!requirement) return {
		ok: false,
		kind: "invalid",
		error: MIN_HOST_VERSION_FORMAT
	};
	const currentVersion = normalizeOptionalString(params.currentVersion) || "unknown";
	const currentSemver = parseSemver(currentVersion);
	if (!currentSemver) return {
		ok: false,
		kind: "unknown_host_version",
		requirement
	};
	if (!isAtLeast(currentSemver, parseSemver(requirement.minimumLabel))) return {
		ok: false,
		kind: "incompatible",
		requirement,
		currentVersion
	};
	return {
		ok: true,
		requirement
	};
}
//#endregion
export { checkMinHostVersion as t };
