import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { t as installProcessWarningFilter } from "./warning-filter-BArCOGlQ.js";
import { createRequire } from "node:module";
//#region src/infra/node-sqlite.ts
const require = createRequire(import.meta.url);
function requireNodeSqlite() {
	installProcessWarningFilter();
	try {
		return require("node:sqlite");
	} catch (err) {
		const message = formatErrorMessage(err);
		throw new Error(`SQLite support is unavailable in this Node runtime (missing node:sqlite). ${message}`, { cause: err });
	}
}
//#endregion
export { requireNodeSqlite as t };
