const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const sourceRoot = path.resolve(__dirname, '..', 'src')

test('upcoming calendar events use the full one-week fetch window', () => {
  const source = fs.readFileSync(path.join(sourceRoot, 'hooks/feed/useFeed.tsx'), 'utf8')

  assert.match(source, /endOfUpcomingWindowSeconds = nowSeconds \+ 7 \* 24 \* 60 \* 60/)
  assert.doesNotMatch(source, /endOfTomorrow/)
})

test('sidebar uses an abbreviated month inside a non-wrapping date label', () => {
  const component = fs.readFileSync(
    path.join(sourceRoot, 'components/organisms/NotetakerSidebar/index.tsx'),
    'utf8',
  )
  const styles = fs.readFileSync(
    path.join(sourceRoot, 'components/organisms/NotetakerSidebar/style.scss'),
    'utf8',
  )

  assert.match(component, /date\.format\('MMM'\)/)
  assert.doesNotMatch(component, /Object\.entries\(upcomingEvents\)\s*\.slice\(0, 5\)/)
  assert.match(styles, /&__calendar-date-meta\s*\{[^}]*white-space:\s*nowrap;/s)
})
