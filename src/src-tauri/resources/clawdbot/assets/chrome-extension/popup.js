// Popup script for Knapsack Browser Relay
// Shows quick-start guide and relay status, delegates attach/detach to background.

const DEFAULT_PORT = 18792

const statusDot = document.getElementById('status-dot')
const statusText = document.getElementById('status-text')
const toggleBtn = document.getElementById('toggle-btn')
const optionsLink = document.getElementById('options-link')

// Open the options page when clicking settings
optionsLink.addEventListener('click', (e) => {
  e.preventDefault()
  chrome.runtime.openOptionsPage()
})

// Attach / detach the active tab (same behavior as the old action.onClicked)
toggleBtn.addEventListener('click', async () => {
  // Send a message to the background service worker to toggle
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return
    // The background script listens for this message
    chrome.runtime.sendMessage({ type: 'POPUP_TOGGLE_TAB', tabId: tab.id })
    // Close popup after triggering
    window.close()
  } catch (err) {
    console.error('Toggle failed:', err)
  }
})

// Check relay reachability and update status indicator
async function checkRelay() {
  const { port } = await chrome.storage.local.get('port')
  const relayPort = port || DEFAULT_PORT
  try {
    const resp = await fetch(`http://127.0.0.1:${relayPort}/json/version`, {
      signal: AbortSignal.timeout(3000),
    })
    if (resp.ok) {
      statusDot.className = 'dot connected'
      statusText.textContent = 'Relay connected'
    } else {
      statusDot.className = 'dot disconnected'
      statusText.textContent = 'Relay returned an error'
    }
  } catch {
    statusDot.className = 'dot disconnected'
    statusText.textContent = 'Relay not reachable'
  }
}

// Update attach button label based on tab state
async function updateToggleButton() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return
    const title = await chrome.action.getTitle({ tabId: tab.id })
    if (title.includes('attached') || title.includes('ON')) {
      toggleBtn.textContent = 'Detach from this tab'
    } else {
      toggleBtn.textContent = 'Attach to this tab'
    }
  } catch {
    // ignore
  }
}

checkRelay()
updateToggleButton()
