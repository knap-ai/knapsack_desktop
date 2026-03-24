import fs from "node:fs";
import path from "node:path";
//#region src/infra/json-file.ts
function loadJsonFile(pathname) {
	try {
		if (!fs.existsSync(pathname)) return;
		const raw = fs.readFileSync(pathname, "utf8");
		return JSON.parse(raw);
	} catch {
		return;
	}
}
function saveJsonFile(pathname, data) {
	const dir = path.dirname(pathname);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, {
		recursive: true,
		mode: 448
	});
	fs.writeFileSync(pathname, `${JSON.stringify(data, null, 2)}\n`, "utf8");
	fs.chmodSync(pathname, 384);
}
//#endregion
export { saveJsonFile as n, loadJsonFile as t };
