// ============================================================
// YOTEC — App Entry Point & Orchestrator
// ============================================================

import { store } from './state.js';
import { startAutonomousTick } from './ai-engine.js';
import { renderDashboard, refreshDashboard } from './ui/dashboard.js';
import { renderChat } from './ui/chat.js';
import { renderProjects } from './ui/projects.js';
import { renderTeam } from './ui/team.js';
import { renderOrbital } from './ui/orbital.js';
import { renderMeetings } from './ui/meetings.js';
import { renderOutputs, downloadArtifact } from './ui/outputs.js';
import { renderExecute } from './ui/execute.js';

// ---- Panel registry ----
const PANELS = {
    dashboard: { render: renderDashboard, label: '🏠 Dashboard', id: 'panel-dashboard' },
    chat: { render: renderChat, label: '💬 Chat', id: 'panel-chat' },
    projects: { render: renderProjects, label: '📋 Projects', id: 'panel-projects' },
    team: { render: renderTeam, label: '🏢 Team', id: 'panel-team' },
    orbital: { render: renderOrbital, label: '🌌 Orbital', id: 'panel-orbital' },
    meetings: { render: renderMeetings, label: '🤝 Meetings', id: 'panel-meetings' },
    outputs: { render: renderOutputs, label: '📦 Repo', id: 'panel-outputs' },
    execute: { render: renderExecute, label: '⚡ Execute', id: 'panel-execute' },
};

let currentPanel = 'dashboard';

function switchPanel(panelKey) {
    if (!PANELS[panelKey]) return;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.panel === panelKey);
    });

    // Show/hide panels
    document.querySelectorAll('.panel').forEach(el => el.classList.remove('active'));
    const panelEl = document.getElementById(PANELS[panelKey].id);
    if (panelEl) panelEl.classList.add('active');

    // Always re-render on switch (live data)
    PANELS[panelKey].render(panelEl);
    currentPanel = panelKey;
    store.dispatch({ type: 'SET_PANEL', payload: panelKey });
}

function initClock() {
    const el = document.getElementById('topbar-clock');
    function tick() {
        if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    tick();
    setInterval(tick, 1000);
}

function showToast(title, message, border = 'var(--accent-cyan)') {
    const tc = document.getElementById('toast-container');
    if (!tc) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = border;
    toast.innerHTML = `<div class="toast-title">${title}</div><div>${message}</div>`;
    tc.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
}

function updateNotifBadge() {
    const state = store.state;
    const badge = document.getElementById('notif-badge');
    if (badge) badge.textContent = Math.min(state.notifications.length, 9);
}

function exportTranscript(meetingId) {
    const meet = store.state.meetings.find(m => m.id === meetingId);
    if (!meet) return;
    const lines = meet.transcript.map(l => `[${l.speaker}] ${l.text}`).join('\n');
    const actions = meet.actionItems.map(a => `• [${a.owner}] ${a.text}`).join('\n');
    const text = `YOTEC MEETING TRANSCRIPT\n${'='.repeat(40)}\n${meet.title}\n${new Date(meet.date).toLocaleString()}\nAttendees: ${meet.attendees.map(a => a.name).join(', ')}\n\nAGENDA: ${meet.agenda}\n\n${'='.repeat(40)}\nTRANSCRIPT\n${'='.repeat(40)}\n${lines}\n\n${'='.repeat(40)}\nACTION ITEMS\n${'='.repeat(40)}\n${actions}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YOTEC-Meeting-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// ---- Main Init ----
function init() {
    // Build nav
    const navEl = document.getElementById('main-nav');
    if (navEl) {
        const navItems = [
            { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { key: 'chat', icon: '💬', label: 'Command ARIA' },
            { key: 'execute', icon: '⚡', label: 'Execute Task' },
            { key: 'projects', icon: '📋', label: 'Projects' },
            { key: 'team', icon: '🏢', label: 'AI Team' },
            { key: 'outputs', icon: '📦', label: 'Artifact Repo' },
            { key: 'orbital', icon: '🌌', label: 'Orbital View' },
            { key: 'meetings', icon: '🤝', label: 'Meetings' },
        ];
        navEl.innerHTML = navItems.map(item => `
      <div class="nav-item ${item.key === 'dashboard' ? 'active' : ''}" data-panel="${item.key}" tabindex="0">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </div>
    `).join('');

        navEl.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => switchPanel(item.dataset.panel));
            item.addEventListener('keydown', e => { if (e.key === 'Enter') switchPanel(item.dataset.panel); });
        });
    }

    // Build panel containers
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        Object.entries(PANELS).forEach(([key, p]) => {
            const div = document.createElement('div');
            div.className = `panel ${key === 'dashboard' ? 'active' : ''}`;
            div.id = p.id;
            mainContent.appendChild(div);
        });
    }

    // Expose global API
    window._yotec = { switchPanel, showToast, exportTranscript, downloadArtifact };

    // Init clock
    initClock();

    // Render initial dashboard
    const dashPanel = document.getElementById('panel-dashboard');
    if (dashPanel) renderDashboard(dashPanel);

    // Subscribe to state changes for auto-refresh & notifications
    store.subscribe(state => {
        updateNotifBadge();
        // Refresh active panel on tick (live feel)
        if (state.tick > 0 && state.tick % 1 === 0) {
            const active = document.querySelector('.panel.active');
            if (active && currentPanel !== 'chat') {
                PANELS[currentPanel]?.render(active);
            }
        }
        // Pop toast for new notifications
        const latestNotif = state.notifications[0];
        if (latestNotif && Date.now() - latestNotif.time < 3000) {
            showToast(latestNotif.title, latestNotif.message);
        }
    });

    // Start autonomous AI tick
    startAutonomousTick();

    console.log('🚀 YOTEC AI Company System initialized.');
}

document.addEventListener('DOMContentLoaded', init);
