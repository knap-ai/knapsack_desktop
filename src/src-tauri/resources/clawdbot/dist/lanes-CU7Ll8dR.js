//#region src/process/lanes.ts
let CommandLane = /* @__PURE__ */ function(CommandLane) {
	CommandLane["Main"] = "main";
	CommandLane["Cron"] = "cron";
	CommandLane["Subagent"] = "subagent";
	CommandLane["Nested"] = "nested";
	return CommandLane;
}({});
//#endregion
export { CommandLane as t };
