import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import test from 'node:test';

// Exercise the shipped planner with registry boundaries stubbed; no gateway
// or installed-user configuration is changed by these regression tests.
const source = readFileSync(new URL('../src-tauri/resources/clawdbot/dist/config-reload-plan-el2pIdzi.js', import.meta.url), 'utf8')
  .replace(/^import .*;$/gm, '').replace(/^export .*;$/gm, '');
const {plan, diff} = new Function('isPlainObject', 'getActivePluginRegistry',
  'getActivePluginChannelRegistryVersion', 'getActivePluginRegistryVersion',
  'listChannelPlugins', 'isDeepStrictEqual', source + '\nreturn {plan:buildGatewayReloadPlan,diff:diffConfigPaths};')(
  value => value !== null && typeof value === 'object' && !Array.isArray(value),
  () => null, () => 0, () => 0,
  () => [{id:'slack', reload:{configPrefixes:['channels.slack']}}], isDeepStrictEqual);

test('workspace access migration refreshes running channel configuration', () => {
  const cfg = access => ({agents:{defaults:{sandbox:{workspaceAccess:access}}}});
  const result = plan(diff(cfg('none'),cfg('rw')));
  assert.equal(result.restartGateway,true);
  assert.deepEqual(result.restartReasons,['agents.defaults.sandbox.workspaceAccess']);
  assert.deepEqual(result.noopPaths,[]);
});

test('unchanged workspace policy does not restart the gateway', () => {
  const cfg = {agents:{defaults:{sandbox:{workspaceAccess:'rw'}}}};
  assert.equal(plan(diff(cfg,structuredClone(cfg))).restartGateway,false);
});

test('existing Slack-only reload remains a channel hot reload', () => {
  const result = plan(['channels.slack.channels']);
  assert.equal(result.restartGateway,false);
  assert.equal(result.restartChannels.has('slack'),true);
});
