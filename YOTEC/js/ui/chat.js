// ============================================================
// YOTEC — Chat Panel (CEO ↔ ARIA)
// ============================================================

import { store, generateId } from '../state.js';
import { ExecutiveAssistant } from '../ai-engine.js';

const ea = new ExecutiveAssistant();

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function timeStr(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function bubbleHTML(msg) {
  const isCEO = msg.from === 'ceo';
  const isEA = msg.from === 'ea';
  const isMgr = msg.type === 'manager-ack';
  const bubbleClass = isCEO ? 'chat-bubble ceo' : isMgr ? 'chat-bubble mgr-bubble' : 'chat-bubble ea-bubble';
  const avatarClass = isCEO ? 'bubble-avatar ceo-avatar' : isMgr ? 'bubble-avatar mgr-avatar' : 'bubble-avatar ea-avatar';
  const avatarEmoji = isCEO ? '👑' : isEA ? '🤖' : '💼';
  const name = isCEO ? 'Biniam (CEO)' : msg.fromName || 'ARIA';

  let extraContent = '';
  if (msg.type === 'ea-message' && msg.content.includes('EXECUTION COMPLETE')) {
    const artifactMatch = msg.content.match(/Artifact posted to output repo: `(.+?)`/);
    const artifactPath = artifactMatch ? artifactMatch[1] : null;

    extraContent += `
            <div class="bubble-actions">
                <button class="btn-icon tts-btn" data-message="${msg.content}">🔊</button>
                ${artifactPath ? `<a href="${artifactPath}" target="_blank" class="btn-icon artifact-link">📦 Artifact</a>` : ''}
            </div>
        `;
  }

  return `
    <div class="${bubbleClass}">
      <div class="${avatarClass}">${avatarEmoji}</div>
      <div class="bubble-content">
        <div class="bubble-name">${name}</div>
        <div class="bubble-text">${renderMarkdown(msg.content)}</div>
        ${extraContent}
        <div class="bubble-time">${timeStr(msg.timestamp)}</div>
      </div>
    </div>
  `;
}

export function renderChat(container) {
  const state = store.state;
  // const messages = state.messages; // This line was not in the original code, but was in the provided diff. Keeping original.

  container.innerHTML = `
    <div class="page-header" style="margin-bottom:12px;">
      <div>
        <div class="page-title">💬 Command ARIA</div>
        <div class="page-subtitle">Your direct line to EA Intelligence. Issue assignments, trigger tasks, and request functional outputs.</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" id="chat-clear-btn" style="border-color:rgba(255,77,109,0.25);color:var(--accent-red);">🗑️ Clear Memory</button>
        <span class="ea-online-dot"></span>ARIA Online · Energy 98%
      </div>
    </div>

    <div class="card" style="padding:0;overflow:hidden;height:calc(100vh - var(--topbar-h) - 120px);display:flex;flex-direction:column;">
      <!-- Messages -->
      <div class="chat-messages" id="chat-messages-scroll">
        ${store.state.chatHistory.map(bubbleHTML).join('')}
      </div>

      <!-- Typing indicator -->
      <div class="typing-indicator" id="typing-indicator">
        <div class="bubble-avatar ea-avatar" style="width:28px;height:28px;font-size:0.8rem;">🤖</div>
        <div class="typing-dots">
          <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
        <span style="font-size:0.75rem;color:var(--text-muted);">ARIA is processing…</span>
      </div>

      <!-- Broadcast log -->
      <div id="broadcast-log-wrap" style="padding:0 14px 0;">
        <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px;padding:0 2px;text-transform:uppercase;letter-spacing:0.08em;">Internal AI Broadcasts</div>
        <div class="broadcast-log" id="broadcast-log">
          <div class="broadcast-entry"><span class="bcast-sender">[ARIA]</span> System initialized. All AI employees active and monitoring.</div>
        </div>
      </div>

      <!-- Suggested actions -->
      <div style="padding:10px 14px 0;">
        <div class="chat-suggestions">
          <button class="suggestion-chip" data-msg="Give me a full status report on all projects.">📋 Status Report</button>
          <button class="suggestion-chip" data-msg="Show me the energy levels of all teams.">⚡ Energy Report</button>
          <button class="suggestion-chip" data-msg="Launch a new social media campaign to boost brand awareness.">📱 New Campaign</button>
          <button class="suggestion-chip" data-msg="I need a meeting with all department managers immediately.">🤝 All-Hands Meeting</button>
          <button class="suggestion-chip" data-msg="Develop a new AI learning module for onboarding new users.">📚 New Learning Module</button>
          <button class="suggestion-chip" data-msg="Run a full QA audit across all active projects.">🛡️ QA Audit</button>
        </div>
      </div>

      <!-- Input area -->
      <div class="chat-input-area">
        <div class="chat-input-row">
          <textarea 
            class="chat-input" 
            id="ceo-input" 
            placeholder="Give ARIA a command, start a new project, or ask for a status report…"
            rows="1"
          ></textarea>
          <button class="send-btn" id="send-btn">➤</button>
        </div>
      </div>
    </div>
  `;

  const messagesEl = container.querySelector('#chat-messages-scroll');
  const inputEl = container.querySelector('#ceo-input');
  const sendBtn = container.querySelector('#send-btn');
  const typingEl = container.querySelector('#typing-indicator');
  const broadcastEl = container.querySelector('#broadcast-log');

  function scrollToBottom() {
    setTimeout(() => { messagesEl.scrollTop = messagesEl.scrollHeight; }, 50);
  }
  scrollToBottom();

  // Auto-resize textarea
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  });

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;

    const ceoMsg = { id: generateId('msg'), from: 'ceo', fromName: 'Biniam', content: text, timestamp: Date.now(), type: 'ceo-message' };
    store.dispatch({ type: 'ADD_MESSAGE', payload: ceoMsg });
    messagesEl.insertAdjacentHTML('beforeend', bubbleHTML(ceoMsg));
    scrollToBottom();

    // Show typing
    typingEl.classList.add('visible');
    scrollToBottom();

    // AI processing delay (humanlike)
    const delay = 1200 + Math.random() * 1200;
    await new Promise(r => setTimeout(r, delay));

    const result = await ea.processMessage(text);
    typingEl.classList.remove('visible');

    const eaMsg = { id: generateId('msg'), from: 'ea', fromName: 'ARIA', content: result.response, timestamp: Date.now(), type: 'ea-message' };
    store.dispatch({ type: 'ADD_MESSAGE', payload: eaMsg });
    messagesEl.insertAdjacentHTML('beforeend', bubbleHTML(eaMsg));
    scrollToBottom();

    sendBtn.disabled = false;

    // Handle action
    if (result.action?.type === 'open-meeting') {
      setTimeout(() => window._yotec.switchPanel('meetings'), 1500);
    }
    if (result.action?.type === 'new-project') {
      addBroadcast(broadcastEl, 'ARIA', `Task routed → ${result.action.deptId?.toUpperCase()} dept.`);
    }

    inputEl.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // Suggestion chips
  container.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => { inputEl.value = chip.dataset.msg; sendMessage(); });
  });

  // Subscribe to new manager-ack messages
  store.subscribe(state => {
    const lastMsg = state.chatHistory[state.chatHistory.length - 1];
    if (lastMsg?.type === 'manager-ack') {
      const existing = messagesEl.querySelector(`[data-msgid="${lastMsg.id}"]`);
      if (!existing) {
        const wrap = document.createElement('div');
        wrap.setAttribute('data-msgid', lastMsg.id);
        wrap.innerHTML = bubbleHTML(lastMsg);
        messagesEl.appendChild(wrap.firstElementChild);
        scrollToBottom();
        addBroadcast(broadcastEl, lastMsg.fromName, lastMsg.content.split('\n')[2]?.trim() || 'Task acknowledged.');
      }
    }
  });
}

function addBroadcast(el, sender, text) {
  if (!el) return;
  const entry = document.createElement('div');
  entry.className = 'broadcast-entry';
  entry.innerHTML = `<span class="bcast-sender">[${sender}]</span> ${text?.substring(0, 100) || ''}`;
  el.appendChild(entry);
  el.scrollTop = el.scrollHeight;
}
