const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const sourceRoot = path.resolve(__dirname, '..', 'src')

test('agent composer exposes an explicit emoji picker', () => {
  const sidebar = fs.readFileSync(
    path.join(sourceRoot, 'components/organisms/NotetakerSidebar/index.tsx'),
    'utf8',
  )

  assert.match(sidebar, /TEAM_EMOJI_OPTIONS/)
  assert.match(sidebar, /Choose an emoji/)
  assert.match(sidebar, /onClick=\{\(\) => setEmoji\(option\)\}/)
})

test('background agent replies produce unread indicators until selected', () => {
  const home = fs.readFileSync(path.join(sourceRoot, 'components/templates/Home/Home.tsx'), 'utf8')
  const sidebar = fs.readFileSync(
    path.join(sourceRoot, 'components/organisms/NotetakerSidebar/index.tsx'),
    'utf8',
  )
  const chat = fs.readFileSync(
    path.join(sourceRoot, 'components/organisms/ClawdChat/index.tsx'),
    'utf8',
  )

  assert.match(home, /const \[unreadChatIds, setUnreadChatIds\]/)
  assert.match(home, /respondingChatId === activeChatIdRef\.current[\s\S]*?currentTab === TabChoices\.Openclaw/)
  assert.match(home, /const \[mountedChatIds, setMountedChatIds\]/)
  assert.match(home, /Array\.from\(mountedChatIds\)\.map/)
  assert.match(home, /active=\{isActiveChat\}/)
  assert.match(home, /new Set\(current\)\.add\(`agent-\$\{agent\.id\}`\)/)
  assert.doesNotMatch(home, /<ClawdChat\s+key=\{activeChatId\}/)
  assert.match(home, /next\.delete\(`agent-\$\{agent\.id\}`\)/)
  assert.match(sidebar, /notetaker-sidebar__team-unread/)
  assert.match(chat, /onAssistantMessage\?\.\(chatId\)/)
  assert.match(chat, /if \(!active\) return/)
  assert.match(chat, /providerSelectionRefreshRef\.current = refresh/)
  assert.match(chat, /await providerSelectionRefreshRef\.current/)
  assert.match(chat, /providerReady=\{!providerSelectionRefreshing\}/)
  assert.match(chat, /disabled=\{isRecording \|\| !providerReady\}/)
  assert.ok((chat.match(/onAssistantMessage\?\.\(chatId\)/g) || []).length >= 3)
  assert.match(chat, /const advancedModeAtSend = localStorage\.getItem\(ADVANCED_MODE_STORAGE\) === 'true'/)
  assert.match(chat, /advancedMode: advancedModeAtSend/)
  assert.match(chat, /cancelled \|\| !activeRef\.current/)
  assert.match(chat, /tauri:\/\/file-drop/)
  assert.match(chat, /useEffect\(\(\) => \{\s*if \(!active\) return\s*let cancelled = false/)
  assert.match(chat, /chatInputElementRef\.current\?\.focus\(\)/)
  assert.doesNotMatch(chat, /document\.querySelector<HTMLTextAreaElement>\('\.ClawdChatInput textarea'\)/)
})

test('browser launcher reserves header space instead of overlapping controls', () => {
  const home = fs.readFileSync(path.join(sourceRoot, 'components/templates/Home/Home.tsx'), 'utf8')
  const styles = fs.readFileSync(path.join(sourceRoot, 'components/templates/Home/Home.scss'), 'utf8')

  assert.match(home, /has-embedded-browser-launcher/)
  assert.match(styles, /\.has-embedded-browser-launcher \.ClawdChatHeader/)
  assert.match(styles, /padding-right: 104px/)
})
