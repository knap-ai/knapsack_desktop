//#region src/hooks/internal-hooks.ts
/** Registry of hook handlers by event key */
const handlers = /* @__PURE__ */ new Map();
/**
* Register a hook handler for a specific event type or event:action combination
*
* @param eventKey - Event type (e.g., 'command') or specific action (e.g., 'command:new')
* @param handler - Function to call when the event is triggered
*
* @example
* ```ts
* // Listen to all command events
* registerInternalHook('command', async (event) => {
*   console.log('Command:', event.action);
* });
*
* // Listen only to /new commands
* registerInternalHook('command:new', async (event) => {
*   await saveSessionToMemory(event);
* });
* ```
*/
function registerInternalHook(eventKey, handler) {
	if (!handlers.has(eventKey)) handlers.set(eventKey, []);
	handlers.get(eventKey).push(handler);
}
/**
* Trigger a hook event
*
* Calls all handlers registered for:
* 1. The general event type (e.g., 'command')
* 2. The specific event:action combination (e.g., 'command:new')
*
* Handlers are called in registration order. Errors are caught and logged
* but don't prevent other handlers from running.
*
* @param event - The event to trigger
*/
async function triggerInternalHook(event) {
	const typeHandlers = handlers.get(event.type) ?? [];
	const specificHandlers = handlers.get(`${event.type}:${event.action}`) ?? [];
	const allHandlers = [...typeHandlers, ...specificHandlers];
	if (allHandlers.length === 0) return;
	for (const handler of allHandlers) try {
		await handler(event);
	} catch (err) {
		console.error(`Hook error [${event.type}:${event.action}]:`, err instanceof Error ? err.message : String(err));
	}
}
/**
* Create a hook event with common fields filled in
*
* @param type - The event type
* @param action - The action within that type
* @param sessionKey - The session key
* @param context - Additional context
*/
function createInternalHookEvent(type, action, sessionKey, context = {}) {
	return {
		type,
		action,
		sessionKey,
		context,
		timestamp: /* @__PURE__ */ new Date(),
		messages: []
	};
}
function isAgentBootstrapEvent(event) {
	if (event.type !== "agent" || event.action !== "bootstrap") return false;
	const context = event.context;
	if (!context || typeof context !== "object") return false;
	if (typeof context.workspaceDir !== "string") return false;
	return Array.isArray(context.bootstrapFiles);
}

//#endregion
export { triggerInternalHook as i, isAgentBootstrapEvent as n, registerInternalHook as r, createInternalHookEvent as t };