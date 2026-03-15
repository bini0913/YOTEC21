// ============================================================
// YOTEC — Meetings Panel
// ============================================================

import { store, generateId } from '../state.js';
import { DEPARTMENTS } from '../data.js';
import { MeetingSimulator } from '../ai-engine.js';

export function renderMeetings(container) {
    const state = store.state;
    const meetings = state.meetings;

    container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">🤝 Meetings</div>
        <div class="page-subtitle">AI-simulated meetings with full transcripts and action items</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" id="new-meeting-btn">+ Start Meeting</button>
      </div>
    </div>

    <!-- Quick-start form -->
    <div id="meeting-form" style="display:none;margin-bottom:16px;">
      <div class="card" style="border-color:rgba(123,108,246,0.25);">
        <div class="card-header"><div class="card-title">🤝 Convene a Meeting</div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:4px;">Meeting Type</label>
            <select id="meet-type" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:8px 12px;color:var(--text-primary);font-size:0.85rem;outline:none;">
              <option value="all-hands">All-Hands (All Managers)</option>
              ${DEPARTMENTS.map(d => `<option value="${d.id}">${d.icon} ${d.name} Team</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:4px;">Agenda</label>
            <input id="meet-agenda" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:8px 12px;color:var(--text-primary);font-size:0.85rem;outline:none;" placeholder="e.g. Review Q1 progress and plan next sprint" value="Review current project status and plan next sprint">
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary btn-sm" id="meet-start">Start Meeting</button>
          <button class="btn btn-secondary btn-sm" id="meet-cancel">Cancel</button>
        </div>
      </div>
    </div>

    <div class="meetings-layout" style="height:calc(100vh - var(--topbar-h) - ${meetings.length ? '140px' : '80px'});">
      <!-- Meeting list -->
      <div>
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">Past Meetings</div>
        <div class="meetings-list" id="meetings-list">
          ${meetings.length ? meetings.map((m, i) => meetingListItem(m, i === 0)).join('') : `
            <div class="empty-state">
              <div class="empty-state-icon">🤝</div>
              <div class="empty-state-text">No meetings yet.<br>Start one to generate a transcript.</div>
            </div>
          `}
        </div>
      </div>

      <!-- Transcript viewer -->
      <div class="meeting-transcript" id="transcript-panel">
        ${meetings.length ? transcriptHTML(meetings[0]) : emptyTranscript()}
      </div>
    </div>
  `;

    // Toggle form
    container.querySelector('#new-meeting-btn').addEventListener('click', () => {
        const form = container.querySelector('#meeting-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
    container.querySelector('#meet-cancel').addEventListener('click', () => {
        container.querySelector('#meeting-form').style.display = 'none';
    });

    // Start meeting
    container.querySelector('#meet-start').addEventListener('click', () => {
        const type = container.querySelector('#meet-type').value;
        const agenda = container.querySelector('#meet-agenda').value.trim() || 'General review';

        let attendees = [];
        if (type === 'all-hands') {
            attendees = DEPARTMENTS.map(d => d.manager);
        } else {
            const dept = DEPARTMENTS.find(d => d.id === type);
            if (dept) attendees = [dept.manager, ...dept.workers];
        }

        const meetId = generateId('meet');
        const transcript = MeetingSimulator.generateTranscript(attendees, agenda, meetId);
        store.dispatch({ type: 'ADD_MEETING', payload: transcript });
        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: { id: generateId('act'), time: Date.now(), type: 'meeting', icon: '🤝', text: `Meeting convened: "${agenda.substring(0, 50)}…"` }
        });

        container.querySelector('#meeting-form').style.display = 'none';
        renderMeetings(container);
    });

    // Meeting list item clicks
    container.querySelectorAll('.meeting-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const mid = item.dataset.mid;
            const meet = store.state.meetings.find(m => m.id === mid);
            if (!meet) return;
            container.querySelectorAll('.meeting-list-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            container.querySelector('#transcript-panel').innerHTML = transcriptHTML(meet);
        });
    });
}

function meetingListItem(m, active = false) {
    const date = new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const time = new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `
    <div class="meeting-list-item ${active ? 'active' : ''}" data-mid="${m.id}">
      <div class="meeting-list-title">${m.title}</div>
      <div class="meeting-list-meta">${date} · ${time} · ${m.attendees.length} attendees</div>
      <div class="meeting-list-meta" style="margin-top:2px;">${m.actionItems.length} action items</div>
    </div>
  `;
}

function transcriptHTML(m) {
    const date = new Date(m.date).toLocaleString();
    return `
    <div class="meeting-transcript-header">
      <div class="meeting-transcript-title">${m.title}</div>
      <div class="meeting-transcript-meta">${date} · Attendees: ${m.attendees.map(a => a.name).join(', ')}</div>
    </div>
    <div class="transcript-scroll">
      <div style="background:var(--bg-elevated);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:8px;">
        <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;">📋 Agenda</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);">${m.agenda}</div>
      </div>
      ${m.transcript.map(line => `
        <div class="transcript-line">
          <div class="transcript-speaker ${line.speaker === 'ARIA' ? 'aria-speaker' : ''}">${line.speaker}</div>
          <div class="transcript-text ${line.speaker === 'ARIA' ? 'aria-line' : ''}">${line.text}</div>
        </div>
      `).join('')}
      ${m.actionItems.length ? `
        <div style="background:rgba(0,255,157,0.05);border:1px solid rgba(0,255,157,0.15);border-radius:var(--radius-md);padding:12px 14px;margin-top:8px;">
          <div style="font-size:0.7rem;font-weight:700;color:var(--accent-green);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">✅ Action Items</div>
          ${m.actionItems.map(a => `
            <div style="display:flex;gap:8px;font-size:0.82rem;margin-bottom:5px;">
              <span style="color:var(--accent-cyan);font-weight:600;min-width:70px;">${a.owner}</span>
              <span style="color:var(--text-secondary);">${a.text}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    <div class="meeting-actions">
      <button class="btn btn-secondary btn-sm" onclick="window._yotec.exportTranscript('${m.id}')">📄 Export Transcript</button>
      <button class="btn btn-ghost btn-sm" onclick="window._yotec.switchPanel('chat')">💬 Discuss in Chat</button>
    </div>
  `;
}

function emptyTranscript() {
    return `
    <div class="empty-state" style="height:100%;justify-content:center;">
      <div class="empty-state-icon">🎙️</div>
      <div class="empty-state-text">Start a meeting to generate<br>an AI-simulated transcript here.</div>
    </div>
  `;
}
