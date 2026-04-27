import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-C1IzJjqi.js";
import { C as isYes, S as isVerbose } from "./logger-x0IvPL2B.js";
import "./globals-DeRFSEIV.js";
import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";
//#region src/cli/prompt.ts
async function promptYesNo(question, defaultYes = false) {
	if (isVerbose() && isYes()) return true;
	if (isYes()) return true;
	const rl = readline.createInterface({
		input: stdin,
		output: stdout
	});
	const suffix = defaultYes ? " [Y/n] " : " [y/N] ";
	const answer = normalizeLowercaseStringOrEmpty(await rl.question(`${question}${suffix}`));
	rl.close();
	if (!answer) return defaultYes;
	return answer.startsWith("y");
}
//#endregion
export { promptYesNo as t };
