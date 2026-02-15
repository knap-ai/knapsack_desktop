import { B as theme } from "./subsystem-QRNIBE7-.js";
import { t as createCliProgress } from "./progress-DitCFjx_.js";
import { n as stylePromptMessage, r as stylePromptTitle, t as stylePromptHint } from "./prompt-style-ciYaT-3f.js";
import { t as note$1 } from "./note-B5hvEaG5.js";
import { t as WizardCancelledError } from "./prompts-BEHxUC3w.js";
import { cancel, confirm, intro, isCancel, multiselect, outro, select, spinner, text } from "@clack/prompts";

//#region src/wizard/clack-prompter.ts
function guardCancel(value) {
	if (isCancel(value)) {
		cancel(stylePromptTitle("Setup cancelled.") ?? "Setup cancelled.");
		throw new WizardCancelledError();
	}
	return value;
}
function createClackPrompter() {
	return {
		intro: async (title) => {
			intro(stylePromptTitle(title) ?? title);
		},
		outro: async (message) => {
			outro(stylePromptTitle(message) ?? message);
		},
		note: async (message, title) => {
			note$1(message, title);
		},
		select: async (params) => guardCancel(await select({
			message: stylePromptMessage(params.message),
			options: params.options.map((opt) => {
				const base = {
					value: opt.value,
					label: opt.label
				};
				return opt.hint === void 0 ? base : {
					...base,
					hint: stylePromptHint(opt.hint)
				};
			}),
			initialValue: params.initialValue
		})),
		multiselect: async (params) => guardCancel(await multiselect({
			message: stylePromptMessage(params.message),
			options: params.options.map((opt) => {
				const base = {
					value: opt.value,
					label: opt.label
				};
				return opt.hint === void 0 ? base : {
					...base,
					hint: stylePromptHint(opt.hint)
				};
			}),
			initialValues: params.initialValues
		})),
		text: async (params) => {
			const validate = params.validate;
			return guardCancel(await text({
				message: stylePromptMessage(params.message),
				initialValue: params.initialValue,
				placeholder: params.placeholder,
				validate: validate ? (value) => validate(value ?? "") : void 0
			}));
		},
		confirm: async (params) => guardCancel(await confirm({
			message: stylePromptMessage(params.message),
			initialValue: params.initialValue
		})),
		progress: (label) => {
			const spin = spinner();
			spin.start(theme.accent(label));
			const osc = createCliProgress({
				label,
				indeterminate: true,
				enabled: true,
				fallback: "none"
			});
			return {
				update: (message) => {
					spin.message(theme.accent(message));
					osc.setLabel(message);
				},
				stop: (message) => {
					osc.done();
					spin.stop(message);
				}
			};
		}
	};
}

//#endregion
export { createClackPrompter as t };