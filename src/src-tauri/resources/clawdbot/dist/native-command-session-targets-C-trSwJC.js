//#region src/channels/native-command-session-targets.ts
function resolveNativeCommandSessionTargets(params) {
	const rawSessionKey = params.boundSessionKey ?? `agent:${params.agentId}:${params.sessionPrefix}:${params.userId}`;
	return {
		sessionKey: params.lowercaseSessionKey ? rawSessionKey.toLowerCase() : rawSessionKey,
		commandTargetSessionKey: params.boundSessionKey ?? params.targetSessionKey
	};
}
//#endregion
export { resolveNativeCommandSessionTargets as t };
