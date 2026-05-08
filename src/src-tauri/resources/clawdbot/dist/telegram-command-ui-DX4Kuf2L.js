//#region src/plugin-sdk/telegram-command-ui.ts
function buildCommandsPaginationKeyboard(currentPage, totalPages, agentId) {
	const buttons = [];
	const suffix = agentId ? `:${agentId}` : "";
	if (currentPage > 1) buttons.push({
		text: "◀ Prev",
		callback_data: `commands_page_${currentPage - 1}${suffix}`
	});
	buttons.push({
		text: `${currentPage}/${totalPages}`,
		callback_data: `commands_page_noop${suffix}`
	});
	if (currentPage < totalPages) buttons.push({
		text: "Next ▶",
		callback_data: `commands_page_${currentPage + 1}${suffix}`
	});
	return [buttons];
}
//#endregion
export { buildCommandsPaginationKeyboard as t };
