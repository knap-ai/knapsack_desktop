import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { n as isYes, t as isVerbose } from "./global-state-LrCGCReA.js";
import "./globals-De6QTwLG.js";
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
