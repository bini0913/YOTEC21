// ============================================================
// YOTEC — Projects Panel (Kanban Board)
// ============================================================

import { store } from '../state.js';
import { DEPARTMENTS } from '../data.js';
import { QAEngine } from '../ai-engine.js';

const STATUSES = [
    { key: 'pending', label: 'Pending', color: 'var(--accent-orange)' },
    { key: 'in-progress', label: 'In Progress', color: 'var(--accent-cyan)' },
    { key: 'qa-review', label: 'QA Review', color: 'var(--accent-purple)' },
    { key: 'revision-needed', label: 'Revision', color: 'var(--accent-red)' },
    { key: 'completed', label: 'Completed', color: 'var(--accent-green)' }
];

function getDept(deptId) {
    return DEPARTMENTS.find(d => d.id === deptId) || { color: 'var(--accent-cyan)', icon: '📁', name: 'General' };
}

function priorityDot(p) {
    const colors = { critical: 'var(--accent-red)', high: 'var(--accent-orange)', medium: 'var(--accent-gold)', low: 'var(--text-muted)' };
    return `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${colors[p] || colors.medium};margin-right:4px;"></span>`;
}

function projectCard(proj) {
    const dept = getDept(proj.deptId);
    const manager = store.getDeptManager(proj.deptId);
    return `
    <div class="project-card" style="--dept-color:${dept.color};margin-bottom:0;" data-pid="${proj.id}">
      <div class="project-card-title">${proj.title}</div>
      <div class="project-card-meta">
        <span class="project-dept-tag" style="--dept-color:${dept.color}">${dept.icon} ${proj.category}</span>
        ${priorityDot(proj.priority)}<span class="priority-${proj.priority}">${proj.priority?.toUpperCase()}</span>
      </div>
      ${proj.status === 'in-progress' || proj.status === 'qa-review' ? `
        <div class="energy-bar-track" style="margin:6px 0 4px"><div class="energy-bar-fill" style="width:${proj.progress}%;--energy-color:${dept.color}"></div></div>
        <div style="font-size:0.65rem;color:var(--text-muted);">${proj.progress}%  · Due ${proj.dateEnd}</div>
      ` : `<div style="font-size:0.65rem;color:var(--text-muted);margin-top:4px;">Due ${proj.dateEnd}</div>`}
      ${manager ? `<div style="font-size:0.65rem;color:var(--text-muted);margin-top:4px;">${dept.manager?.avatar || '💼'} ${manager.name}</div>` : ''}
      ${proj.status === 'qa-review' ? `<button class="qa-approve-btn" data-pid="${proj.id}" style="margin-top:6px;width:100%;">🛡️ Run QA Review</button>` : ''}
    </div>
  `;
}

export function renderProjects(container) {
    const state = store.state;
    const projects = state.projects;

    container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">📋 Project Board</div>
        <div class="page-subtitle">Kanban view of all YOTEC projects across departments</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn btn-primary btn-sm" id="new-project-btn">+ New Project</button>
      </div>
    </div>

    <!-- New Project Modal (inline) -->
    <div id="new-proj-form" style="display:none;margin-bottom:20px;">
      <div class="card" style="border-color:rgba(0,212,255,0.25);">
        <div class="card-header"><div class="card-title">➕ Create New Project</div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px;">
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:4px;">Title</label>
            <input id="np-title" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:8px 12px;color:var(--text-primary);font-size:0.85rem;outline:none;" placeholder="Project name…">
          </div>
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:4px;">Department</label>
            <select id="np-dept" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:8px 12px;color:var(--text-primary);font-size:0.85rem;outline:none;">
              ${DEPARTMENTS.map(d => `<option value="${d.id}">${d.icon} ${d.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:4px;">Priority</label>
            <select id="np-priority" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:8px 12px;color:var(--text-primary);font-size:0.85rem;outline:none;">
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium" selected>🟡 Medium</option>
              <option value="low">⚪ Low</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:4px;">Description</label>
          <textarea id="np-content" rows="2" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:8px 12px;color:var(--text-primary);font-size:0.85rem;outline:none;resize:vertical;" placeholder="What should the team accomplish?"></textarea>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary btn-sm" id="np-create">Create Project</button>
          <button class="btn btn-secondary btn-sm" id="np-cancel">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Kanban -->
    <div class="kanban-board" id="kanban-board">
      ${STATUSES.map(s => {
        const cols = projects.filter(p => p.status === s.key);
        return `
          <div class="kanban-col">
            <div class="kanban-col-header">
              <span class="kanban-col-title" style="color:${s.color}">${s.label}</span>
              <span class="kanban-count">${cols.length}</span>
            </div>
            <div class="kanban-items" data-status="${s.key}">
              ${cols.length ? cols.map(projectCard).join('') : '<div style="font-size:0.78rem;color:var(--text-muted);padding:8px;">No projects</div>'}
            </div>
          </div>
        `;
    }).join('')}
    </div>
  `;

    // New project form toggle
    container.querySelector('#new-project-btn').addEventListener('click', () => {
        const form = container.querySelector('#new-proj-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
    container.querySelector('#np-cancel').addEventListener('click', () => {
        container.querySelector('#new-proj-form').style.display = 'none';
    });
    container.querySelector('#np-create').addEventListener('click', () => {
        const title = container.querySelector('#np-title').value.trim();
        const deptId = container.querySelector('#np-dept').value;
        const priority = container.querySelector('#np-priority').value;
        const content = container.querySelector('#np-content').value.trim();
        if (!title) return;
        const dept = getDept(deptId);
        store.dispatch({
            type: 'ADD_PROJECT',
            payload: { title, deptId, category: dept.name, priority, content, assignedTo: dept.manager?.id, relatedIds: [], dependencies: [] }
        });
        store.dispatch({ type: 'ADD_ACTIVITY', payload: { id: `act-${Date.now()}`, time: Date.now(), type: 'project', icon: dept.icon, text: `New project "${title}" created in ${dept.name}.` } });
        container.querySelector('#new-proj-form').style.display = 'none';
        renderProjects(container);
    });

    // QA review buttons
    container.querySelectorAll('.qa-approve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const proj = store.getProject(btn.dataset.pid);
            if (!proj) return;
            const result = QAEngine.review(proj);
            btn.textContent = result.approved ? '✅ Approved!' : '⚠️ Revision needed';
            btn.disabled = true;
            setTimeout(() => renderProjects(container), 1500);
        });
    });
}
