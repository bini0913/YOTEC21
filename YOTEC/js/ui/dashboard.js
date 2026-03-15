// ============================================================
// YOTEC — Dashboard Panel
// ============================================================

import { store } from '../state.js';
import { DEPARTMENTS } from '../data.js';

function getEnergyColor(pct) {
  if (pct >= 85) return 'var(--accent-green)';
  if (pct >= 65) return 'var(--accent-cyan)';
  if (pct >= 45) return 'var(--accent-orange)';
  return 'var(--accent-red)';
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function makeBadge(status) {
  const map = {
    'pending': 'badge-pending',
    'in-progress': 'badge-in-progress',
    'qa-review': 'badge-qa-review',
    'completed': 'badge-completed',
    'revision-needed': 'badge-revision'
  };
  const label = { 'pending': 'Pending', 'in-progress': 'In Progress', 'qa-review': 'QA Review', 'completed': 'Completed', 'revision-needed': 'Revision' };
  return `<span class="badge ${map[status] || 'badge-pending'}">${label[status] || status}</span>`;
}

export function renderDashboard(container) {
  const state = store.state;
  const projects = state.projects;
  const workers = Object.values(state.workers);

  const activeCount = projects.filter(p => p.status === 'in-progress').length;
  const qaCount = projects.filter(p => p.status === 'qa-review').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const avgEnergy = Math.round(workers.reduce((s, w) => s + w.energy, 0) / workers.length);

  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">👑 CEO Dashboard</div>
        <div class="page-subtitle">Welcome back, Biniam — here's your YOTEC overview for today</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" id="dash-reset-btn">🔄 Reset State</button>
        <button class="btn btn-primary btn-sm" onclick="window._yotec.switchPanel('chat')">💬 Command ARIA</button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card" style="--kpi-color:var(--accent-cyan)">
        <div class="kpi-icon">📁</div>
        <div class="kpi-value">${projects.length}</div>
        <div class="kpi-label">Total Projects</div>
        <div class="kpi-delta">↑ ${projects.length - completedCount} active</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--accent-gold)">
        <div class="kpi-icon">🔄</div>
        <div class="kpi-value">${activeCount}</div>
        <div class="kpi-label">In Progress</div>
        <div class="kpi-delta">${qaCount} awaiting QA</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--accent-green)">
        <div class="kpi-icon">✅</div>
        <div class="kpi-value">${completedCount}</div>
        <div class="kpi-label">Completed</div>
        <div class="kpi-delta">↑ 100% quality</div>
      </div>
      <div class="kpi-card" style="--kpi-color:${getEnergyColor(avgEnergy)}">
        <div class="kpi-icon">⚡</div>
        <div class="kpi-value">${avgEnergy}%</div>
        <div class="kpi-label">Avg Team Energy</div>
        <div class="kpi-delta">40 AI employees</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--accent-purple)">
        <div class="kpi-icon">🏢</div>
        <div class="kpi-value">10</div>
        <div class="kpi-label">Departments</div>
        <div class="kpi-delta">All operational</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--accent-pink)">
        <div class="kpi-icon">🤖</div>
        <div class="kpi-value">40</div>
        <div class="kpi-label">AI Employees</div>
        <div class="kpi-delta">1 EA · 10 Mgr · 30 Workers</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-side" style="margin-bottom:16px;">
      <!-- Activity Feed -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📡 Live Activity Feed</div>
            <div class="card-subtitle">Real-time updates from all departments</div>
          </div>
        </div>
        <div class="activity-feed" id="dash-activity-feed">
          ${renderActivityItems(state.activityFeed.slice(0, 10))}
        </div>
      </div>

      <!-- Right Column -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- QA Queue -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">🛡️ QA Queue</div>
          </div>
          <div class="qa-panel" id="dash-qa-panel">
            ${renderQAQueue(projects)}
          </div>
        </div>

        <!-- Department Energy -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">⚡ Department Energy</div>
          </div>
      <div class="card" style="grid-row: span 2;">
        <div class="card-header"><div class="card-title">Live Activity</div></div>
        <div class="activity-feed">
          ${state.activityFeed.map(act => `
            <div class="activity-item">
              <div class="activity-icon">${act.icon}</div>
              <div class="activity-content">
                <div class="activity-text">${act.text}</div>
                <div class="activity-time">${timeAgo(act.time)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- System Alerts & Suggestions -->
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div class="card" style="${state.alerts.length ? 'border-color:var(--accent-red);box-shadow:0 0 15px rgba(255,77,109,0.15);' : ''}">
          <div class="card-header">
            <div class="card-title" style="${state.alerts.length ? 'color:var(--accent-red);' : ''}">🔔 System Alerts</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${state.alerts.length ? state.alerts.slice(0, 3).map(a => `
              <div style="background:rgba(255,77,109,0.1);border-left:2px solid var(--accent-red);padding:8px 12px;border-radius:0 4px 4px 0;">
                <div style="font-size:0.8rem;color:var(--text-primary);margin-bottom:4px;">${a.message}</div>
                <div style="font-size:0.65rem;color:var(--accent-red);">${timeAgo(a.time)}</div>
              </div>
            `).join('') : '<div class="empty-state-text" style="font-size:0.8rem;padding:10px 0;">All systems nominal. No alerts.</div>'}
          </div>
        </div>

        <div class="card" style="border-color:rgba(255,140,66,0.2);">
          <div class="card-header">
            <div class="card-title" style="color:var(--accent-gold);">💡 AI Suggestions</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${state.suggestions.slice(0, 2).map(s => `
              <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);padding:12px;border-radius:var(--radius-md);">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span style="font-size:0.8rem;font-weight:700;color:var(--accent-gold);">${s.title}</span>
                  <span style="font-size:0.65rem;color:var(--accent-green);">${s.energyImpact}</span>
                </div>
                <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px;line-height:1.4;">"${s.content}"</div>
                <div style="font-size:0.65rem;color:var(--text-muted);text-align:right;">— ${s.by}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- QA Queue -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">QA Approval Queue</div>
          <div class="badge badge-pending">${state.projects.filter(p => p.status === 'qa-review').length + state.outputs.filter(o => o.qaStatus === 'pending').length} Pending</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${renderQAQueue(state)}
        </div>
      </div>
      
      <!-- Recent Outputs -->
      <div class="card" style="grid-column: span 2;">
        <div class="card-header">
            <div class="card-title">Recent Artifacts</div>
            <button class="btn btn-ghost btn-sm" onclick="window._yotec.switchPanel('outputs')">View Repo →</button>
        </div>
        <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:10px;">
          ${state.outputs.slice(0, 4).map(out => `
             <div style="min-width:200px;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:4px;padding:10px;">
               <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;">${out.format.toUpperCase()} · ${out.qaStatus}</div>
               <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${out.title}</div>
               <button class="btn btn-secondary btn-sm" style="width:100%;font-size:0.7rem;" onclick="window._yotec.downloadArtifact('${out.id}')">Download</button>
             </div>
          `).join('')}
          ${state.outputs.length === 0 ? '<div style="font-size:0.8rem;color:var(--text-muted);">No outputs generated yet.</div>' : ''}
        </div>
      </div>
      
    </div>

    <div class="main-side" style="margin-bottom:16px;">
      <!-- Department Energy -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">⚡ Department Energy</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${DEPARTMENTS.map(dept => {
    const mgr = state.workers[dept.manager.id];
    const wkrs = dept.workers.map(w => state.workers[w.id] || w);
    const avg = Math.round([mgr, ...wkrs].reduce((s, w) => s + (w?.energy || 80), 0) / 4);
    return `
              <div>
                <div class="energy-label"><span>${dept.icon} ${dept.name}</span><span>${avg}%</span></div>
                <div class="energy-bar-track">
                  <div class="energy-bar-fill" style="width:${avg}%;--energy-color:${dept.color}"></div>
                </div>
              </div>
            `;
  }).join('')}
        </div>
      </div>
    </div>

    <!-- Project Overview -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">📊 Project Overview</div>
        <button class="btn btn-secondary btn-sm" onclick="window._yotec.switchPanel('projects')">View Kanban →</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${projects.map(p => {
    const dept = DEPARTMENTS.find(d => d.id === p.deptId);
    return `
            <div class="project-card" style="--dept-color:${dept?.color || 'var(--accent-cyan)'}" onclick="window._yotec.switchPanel('projects')">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <div class="project-card-title">${p.title}</div>
                ${makeBadge(p.status)}
              </div>
              <div class="project-card-meta">
                <span class="project-dept-tag" style="--dept-color:${dept?.color || 'var(--accent-cyan)'}">${dept?.icon || '📁'} ${p.category}</span>
                <span class="priority-${p.priority}">${p.priority?.toUpperCase()}</span>
                <span style="font-size:0.7rem;color:var(--text-muted);margin-left:auto;">Due ${p.dateEnd}</span>
              </div>
              <div class="energy-bar-track"><div class="energy-bar-fill" style="width:${p.progress}%;--energy-color:${dept?.color || 'var(--accent-cyan)'}"></div></div>
              <div style="font-size:0.65rem;color:var(--text-muted);margin-top:4px;">${p.progress}% complete</div>
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;

  // Reset button
  container.querySelector('#dash-reset-btn')?.addEventListener('click', () => {
    if (confirm('Reset all YOTEC state to defaults?')) {
      store.dispatch({ type: 'RESET' });
      renderDashboard(container);
    }
  });
}

function renderActivityItems(feed) {
  // This function is no longer used as activity feed is rendered inline
  // Keeping it for now in case it's used elsewhere or for future changes.
  if (!feed.length) return '<div class="empty-state"><div class="empty-state-icon">📡</div><div class="empty-state-text">No activity yet</div></div>';
  return feed.map(item => `
    <div class="activity-item">
      <div class="activity-icon">${item.icon}</div>
      <div>
        <div class="activity-text">${item.text}</div>
        <div class="activity-time">${timeAgo(item.time)}</div>
      </div>
    </div>
  `).join('');
}

function renderQAQueue(state) {
  const qaProjects = state.projects.filter(p => p.status === 'qa-review');
  const qaOutputs = state.outputs.filter(o => o.qaStatus === 'pending');

  if (qaProjects.length === 0 && qaOutputs.length === 0) {
    return `<div class="empty-state-text" style="font-size:0.85rem;">Queue is empty.</div>`;
  }

  let html = '';

  qaProjects.slice(0, 3).forEach(p => {
    html += `
      <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary);">${p.title}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Project · ${p.category}</div>
        </div>
        <button class="btn btn-primary btn-sm btn-qa-approve" data-pid="${p.id}" style="padding:4px 10px;font-size:0.75rem;">Approve</button>
      </div>
    `;
  });

  qaOutputs.slice(0, 3).forEach(o => {
    html += `
      <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${o.title}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Artifact · ${o.workerId}</div>
        </div>
        <button class="btn btn-primary btn-sm btn-qa-approve-out" data-oid="${o.id}" style="padding:4px 10px;font-size:0.75rem;">Approve</button>
      </div>
    `;
  });

  return html;
}

// Binds internal listeners for the dashboard
export function refreshDashboard() {
  const container = document.getElementById('panel-dashboard');
  if (!container) return;

  container.querySelectorAll('.btn-qa-approve').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = store.state.projects.find(p => p.id === btn.dataset.pid);
      if (p) { QAEngine.review(p); renderDashboard(container); }
    });
  });

  container.querySelectorAll('.btn-qa-approve-out').forEach(btn => {
    btn.addEventListener('click', () => {
      const o = store.state.outputs.find(o => o.id === btn.dataset.oid);
      if (o) { QAEngine.review(o); renderDashboard(container); }
    });
  });
}

