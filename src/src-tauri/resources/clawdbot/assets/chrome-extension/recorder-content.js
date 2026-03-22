/**
 * OpenClaw Workflow Recorder - Content Script
 *
 * Injected into pages when recording is active. Captures user interactions
 * (clicks, typing, navigation, form fills) and sends them to the background
 * service worker via chrome.runtime messages.
 *
 * The recording produces an array of RecordedAction objects with multi-strategy
 * ElementSelector metadata for resilient playback.
 */

(function () {
  'use strict';

  if (window.__openclawRecorderActive) return;
  window.__openclawRecorderActive = true;

  const recordingStartTime = Date.now();
  let lastInputTarget = null;
  let inputDebounceTimer = null;

  /**
   * Build a multi-strategy selector for an element.
   * Captures as many identifying attributes as possible so the playback
   * engine can try multiple strategies to find the element.
   */
  function buildSelector(el) {
    if (!el || !el.tagName) return null;

    const selector = {
      tagName: el.tagName.toLowerCase(),
      id: el.id || null,
      className: el.className && typeof el.className === 'string' ? el.className : null,
      textContent: getVisibleText(el),
      ariaLabel: el.getAttribute('aria-label') || null,
      ariaRole: el.getAttribute('role') || el.tagName.toLowerCase(),
      placeholder: el.getAttribute('placeholder') || null,
      name: el.getAttribute('name') || null,
      cssSelector: getCssSelector(el),
      xpath: null, // Omitted for size; CSS selector is usually sufficient
      outerHtmlPreview: el.outerHTML ? el.outerHTML.substring(0, 200) : null,
    };

    return selector;
  }

  /**
   * Get visible text content, truncated to avoid huge payloads
   */
  function getVisibleText(el) {
    const text = el.textContent || el.innerText || '';
    const trimmed = text.trim();
    return trimmed.length > 200 ? trimmed.substring(0, 200) : trimmed;
  }

  /**
   * Generate a reasonably unique CSS selector for an element
   */
  function getCssSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;

    const parts = [];
    let current = el;
    let depth = 0;

    while (current && current !== document.body && depth < 5) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector = `#${CSS.escape(current.id)}`;
        parts.unshift(selector);
        break;
      }

      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).slice(0, 2);
        if (classes.length > 0 && classes[0]) {
          selector += '.' + classes.map(c => CSS.escape(c)).join('.');
        }
      }

      // Add nth-child if needed for specificity
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (s) => s.tagName === current.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }
      }

      parts.unshift(selector);
      current = current.parentElement;
      depth++;
    }

    return parts.join(' > ');
  }

  function sendAction(action) {
    chrome.runtime.sendMessage({
      type: 'OPENCLAW_RECORDER_ACTION',
      action: action,
    });
  }

  // --- Click handler ---
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target;
      sendAction({
        actionType: 'click',
        timestampMs: Date.now() - recordingStartTime,
        selector: buildSelector(el),
        url: null,
        value: null,
      });
    },
    true
  );

  // --- Input/typing handler (debounced) ---
  document.addEventListener(
    'input',
    (e) => {
      const el = e.target;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
        lastInputTarget = el;
        clearTimeout(inputDebounceTimer);
        inputDebounceTimer = setTimeout(() => {
          const value =
            el.isContentEditable ? el.textContent : el.value;
          sendAction({
            actionType: 'type',
            timestampMs: Date.now() - recordingStartTime,
            selector: buildSelector(el),
            url: null,
            value: value,
          });
          lastInputTarget = null;
        }, 500); // Debounce 500ms to capture full input
      }
    },
    true
  );

  // --- Select/dropdown handler ---
  document.addEventListener(
    'change',
    (e) => {
      const el = e.target;
      if (el.tagName === 'SELECT') {
        sendAction({
          actionType: 'select',
          timestampMs: Date.now() - recordingStartTime,
          selector: buildSelector(el),
          url: null,
          value: el.value,
        });
      }
    },
    true
  );

  // --- Form submit handler ---
  document.addEventListener(
    'submit',
    (e) => {
      // Flush any pending input
      if (lastInputTarget) {
        clearTimeout(inputDebounceTimer);
        const value = lastInputTarget.isContentEditable
          ? lastInputTarget.textContent
          : lastInputTarget.value;
        sendAction({
          actionType: 'type',
          timestampMs: Date.now() - recordingStartTime,
          selector: buildSelector(lastInputTarget),
          url: null,
          value: value,
        });
        lastInputTarget = null;
      }

      sendAction({
        actionType: 'submit',
        timestampMs: Date.now() - recordingStartTime,
        selector: buildSelector(e.target),
        url: null,
        value: null,
      });
    },
    true
  );

  // --- Visual recording indicator ---
  const indicator = document.createElement('div');
  indicator.id = 'openclaw-recording-indicator';
  indicator.innerHTML = `
    <div style="
      position: fixed;
      top: 8px;
      right: 8px;
      z-index: 2147483647;
      background: #ff4444;
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      user-select: none;
    ">
      <span style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        animation: openclaw-pulse 1.5s ease-in-out infinite;
      "></span>
      Recording
    </div>
    <style>
      @keyframes openclaw-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    </style>
  `;
  document.documentElement.appendChild(indicator);

  // Click indicator to stop recording
  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPENCLAW_RECORDER_STOP' });
    cleanup();
  });

  function cleanup() {
    window.__openclawRecorderActive = false;
    const el = document.getElementById('openclaw-recording-indicator');
    if (el) el.remove();
  }

  // Listen for stop message from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'OPENCLAW_RECORDER_CLEANUP') {
      cleanup();
    }
  });
})();
