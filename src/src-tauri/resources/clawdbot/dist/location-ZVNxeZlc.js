//#region src/channels/location.ts
function resolveLocation(location) {
	const source = location.source ?? (location.isLive ? "live" : location.name || location.address ? "place" : "pin");
	const isLive = Boolean(location.isLive ?? source === "live");
	return {
		...location,
		source,
		isLive
	};
}
function formatAccuracy(accuracy) {
	if (!Number.isFinite(accuracy)) return "";
	return ` ±${Math.round(accuracy ?? 0)}m`;
}
function formatCoords(latitude, longitude) {
	return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
function formatLocationText(location) {
	const resolved = resolveLocation(location);
	const coords = formatCoords(resolved.latitude, resolved.longitude);
	const accuracy = formatAccuracy(resolved.accuracy);
	const caption = resolved.caption?.trim();
	let header = "";
	if (resolved.source === "live" || resolved.isLive) header = `🛰 Live location: ${coords}${accuracy}`;
	else if (resolved.name || resolved.address) header = `📍 ${[resolved.name, resolved.address].filter(Boolean).join(" — ")} (${coords}${accuracy})`;
	else header = `📍 ${coords}${accuracy}`;
	return caption ? `${header}\n${caption}` : header;
}
function toLocationContext(location) {
	const resolved = resolveLocation(location);
	return {
		LocationLat: resolved.latitude,
		LocationLon: resolved.longitude,
		LocationAccuracy: resolved.accuracy,
		LocationName: resolved.name,
		LocationAddress: resolved.address,
		LocationSource: resolved.source,
		LocationIsLive: resolved.isLive
	};
}
//#endregion
export { toLocationContext as n, formatLocationText as t };
