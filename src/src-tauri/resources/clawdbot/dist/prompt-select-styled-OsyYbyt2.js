import { n as stylePromptMessage, t as stylePromptHint } from "./prompt-style-rocPqVSR.js";
import { select } from "@clack/prompts";
//#region src/terminal/prompt-select-styled.ts
function selectStyled(params) {
	return select({
		...params,
		message: stylePromptMessage(params.message),
		options: params.options.map((opt) => opt.hint === void 0 ? opt : {
			...opt,
			hint: stylePromptHint(opt.hint)
		})
	});
}
//#endregion
export { selectStyled as t };
