// ============================================================
// YOTEC — Team Panel (Departments + Workers)
// ============================================================

import { store } from '../state.js';
import { DEPARTMENTS, QA_AI } from '../data.js';

function energyColor(e) {
  if (e >= 85) return 'var(--accent-green)';
  if (e >= 65) return 'var(--accent-cyan)';
  if (e >= 45) return 'var(--accent-orange)';
  return 'var(--accent-red)';
}

export function renderTeam(container) {
  const state = store.state;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">🏢 AI Team</div>
        <div class="page-subtitle">10 departments · 40 AI employees · All active</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="window._yotec.switchPanel('chat')">💬 Brief a Team</button>
      </div>
    </div>

    <!-- Executive Layer -->
    <div class="card" style="margin-bottom:20px;border-color:rgba(0,212,255,0.2);">
      <div class="card-header"><div class="card-title" style="color:var(--accent-cyan);">👑 Executive Layer</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${executiveCard({ name: 'Biniam', role: 'CEO & Founder', avatar: '👑', energy: 100, specialty: 'Strategic vision, company leadership, final decisions', type: 'human', color: '#7b6cf6' })}
        ${executiveCard({ name: 'ARIA', role: 'Executive Assistant AI', avatar: '🤖', energy: 98, specialty: 'Task routing, CEO liaison, cross-department coordination', type: 'ai', color: '#00d4ff' })}
      </div>
    </div>

    <!-- QA Master -->
    <div class="card" style="margin-bottom:20px;border-color:rgba(0,255,157,0.2);">
      <div class="card-header"><div class="card-title" style="color:var(--accent-green);">🛡️ Quality Assurance Intelligence</div></div>
      ${executiveCard({ ...QA_AI, energy: QA_AI.energy, color: '#00ff9d' })}
    </div>

    <!-- Department Grid -->
    <div style="grid-column:1/-1;">
      <div class="section-title" style="margin-bottom:16px;">Operational Departments</div>
      <div class="dept-grid">
        ${DEPARTMENTS.map(d => renderDeptCard(d, state)).join('')}
      </div>
    </div>
  `;

  refreshTeamListeners(container);
}

function executiveCard(person) {
  return `
    <div class="manager-row" style="padding:14px;background:var(--bg-elevated);border-radius:var(--radius-md);">
      <div class="ai-avatar" style="width:48px;height:48px;font-size:1.4rem;border-color:${person.color};">${person.avatar}</div>
      <div style="flex:1;min-width:0;">
        <div class="ai-name" style="font-size:0.95rem;">${person.name}</div>
        <div class="ai-role" style="margin-bottom:4px;">${person.role || person.fullName}</div>
        <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:6px;line-height:1.4;">${person.specialty}</div>
        <div class="energy-label"><span>Energy</span><span>${person.energy}%</span></div>
        <div class="energy-bar-track"><div class="energy-bar-fill" style="width:${person.energy}%;--energy-color:${person.color}"></div></div>
      </div>
    </div>
  `;
}

function renderDeptCard(dept, state) {
  const manager = state.workers[dept.manager.id] || dept.manager;
  const workers = dept.workers.map(w => state.workers[w.id] || w);
  const avgEnergy = Math.round([manager, ...workers].reduce((s, w) => s + (w?.energy || 80), 0) / 4);

  return `
    <div class="dept-card" style="--dept-color:${dept.color}">
      <div class="dept-card-header">
        <div class="dept-icon">${dept.icon}</div>
        <div>
          <div class="dept-name">${dept.name}</div>
          <div class="dept-manager-name">${manager.name} · ${avgEnergy}% team energy</div>
        </div>
        <span class="dept-expand-icon" style="margin-left:auto;color:var(--text-muted);font-size:0.7rem;">▼</span>
      </div>
      <div class="dept-card-body">
        <!-- Manager row -->
        <div class="manager-row" style="border:1px solid rgba(255,255,255,0.06);">
          <div class="ai-avatar" style="border-color:${dept.color};">${dept.manager.avatar}</div>
          <div style="flex:1;min-width:0;">
            <div class="ai-name">${manager.name}</div>
            <div class="ai-role">${dept.manager.role}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.7rem;font-weight:700;color:${energyColor(manager.energy)};font-family:var(--font-mono);">${manager.energy}%</div>
            <div class="mini-bar"><div class="mini-bar-fill" style="width:${manager.energy}%;background:${energyColor(manager.energy)};"></div></div>
          </div>
        </div>

        <!-- Workers -->
        <div class="workers-list">
          ${workers.map(w => workerCard(w, dept.color)).join('')}
        </div>

        <!-- Dept energy bar -->
        <div style="margin-top:10px;">
          <div class="energy-label"><span>Team Energy</span><span>${avgEnergy}%</span></div>
          <div class="energy-bar-track"><div class="energy-bar-fill" style="width:${avgEnergy}%;--energy-color:${dept.color}"></div></div>
        </div>
      </div>
    </div>
  `;
}

function workerRow(worker, deptColor) {
  const color = energyColor(worker.energy);
  const skills = (worker.skills || []).slice(0, 3);
  return `
    <div class="worker-row">
      <div class="worker-avatar">${worker.avatar}</div>
      <div class="worker-info">
        <div class="worker-name">${worker.name}</div>
        <div class="worker-role">${worker.role}</div>
        <div class="skill-tags">${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
      </div>
      <div class="worker-energy-wrap">
        <div>
          <div class="worker-energy-num">${worker.energy}%</div>
          <div class="mini-bar"><div class="mini-bar-fill" style="width:${worker.energy}%;background:${color};"></div></div>
        </div>
      </div>
    </div>
  `;
}
