// ============================================================
// YOTEC — Orbital Visualization Panel
// ============================================================

import { store } from '../state.js';
import { DEPARTMENTS } from '../data.js';

export function renderOrbital(container) {
    const state = store.state;

    // Place 10 departments in 3 concentric rings (4-3-3 layout for visual balance)
    const ringLayouts = [
        { radius: 80, depts: DEPARTMENTS.slice(0, 2) }, // 2 inner
        { radius: 130, depts: DEPARTMENTS.slice(2, 6) }, // 4 middle
        { radius: 195, depts: DEPARTMENTS.slice(6, 10) }, // 4 outer
    ];

    const WRAP = 560; // SVG/canvas viewBox size
    const CX = WRAP / 2;
    const CY = WRAP / 2;

    function nodesHTML() {
        const nodes = [];
        for (const ring of ringLayouts) {
            const count = ring.depts.length;
            ring.depts.forEach((dept, i) => {
                const angle = (2 * Math.PI * i / count) - Math.PI / 2;
                const x = CX + ring.radius * Math.cos(angle);
                const y = CY + ring.radius * Math.sin(angle);
                const manager = state.workers[dept.manager.id] || dept.manager;
                const workers = dept.workers.map(w => state.workers[w.id] || w);
                const avgE = Math.round([manager, ...workers].reduce((s, w) => s + (w?.energy || 80), 0) / 4);

                nodes.push(`
          <div class="dept-node" 
               style="left:${x}px;top:${y}px;--dept-color:${dept.color};" 
               title="${dept.name} — ${manager.name}\nTeam Energy: ${avgE}%"
               onclick="window._yotec.switchPanel('team')">
            <div class="dept-node-icon">${dept.icon}</div>
            <div class="dept-node-label">${dept.name}</div>
            <div class="dept-node-energy">${avgE}%</div>
          </div>
        `);
            });
        }
        return nodes.join('');
    }

    // SVG connection lines between related projects
    const svgLines = buildConnectionLines(state.projects, ringLayouts, CX, CY);

    const projects = state.projects;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const avgE = Math.round(Object.values(state.workers).reduce((s, w) => s + w.energy, 0) / Object.values(state.workers).length);

    container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">🌌 Orbital View</div>
        <div class="page-subtitle">Live visualization of YOTEC's AI structure — click any node to explore</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 280px;gap:20px;align-items:start;">
      <!-- Orbital Map -->
      <div class="card" style="display:flex;justify-content:center;align-items:center;padding:30px;min-height:620px;">
        <div class="orbital-canvas-wrap" style="width:${WRAP}px;height:${WRAP}px;">
          <!-- Animated rings -->
          <div class="orbital-ring r1 animate-cw"></div>
          <div class="orbital-ring" style="width:230px;height:230px;left:50%;top:50%;transform:translate(-50%,-50%);"></div>
          <div class="orbital-ring r2 animate-ccw" style="width:300px;height:300px;"></div>
          <div class="orbital-ring r3 animate-cw" style="width:430px;height:430px;"></div>
          <div class="orbital-ring r4" style="width:530px;height:530px;"></div>

          <!-- SVG connections -->
          <svg style="position:absolute;left:0;top:0;width:${WRAP}px;height:${WRAP}px;pointer-events:none;" viewBox="0 0 ${WRAP} ${WRAP}">
            ${svgLines}
          </svg>

          <!-- Center YOTEC hub -->
          <div class="orbital-center" title="YOTEC Central HQ">🏢</div>

          <!-- EA node (just inside inner ring) -->
          <div class="dept-node" style="left:${CX}px;top:${CY - 55}px;--dept-color:var(--accent-cyan);" onclick="window._yotec.switchPanel('chat')">
            <div class="dept-node-icon" style="border-color:var(--accent-cyan);background:rgba(0,212,255,0.12);">🤖</div>
            <div class="dept-node-label" style="color:var(--accent-cyan);">ARIA</div>
          </div>

          <!-- Department nodes -->
          ${nodesHTML()}
        </div>
      </div>

      <!-- Right panel: stats -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        <!-- Company Stats -->
        <div class="card">
          <div class="card-title" style="margin-bottom:14px;">📊 Live Stats</div>
          ${[
            { label: 'Active Projects', value: inProgress, color: 'var(--accent-cyan)' },
            { label: 'Completed Today', value: completed, color: 'var(--accent-green)' },
            { label: 'Avg Team Energy', value: avgE + '%', color: avgE >= 80 ? 'var(--accent-green)' : 'var(--accent-orange)' },
            { label: 'AI Employees', value: 40, color: 'var(--accent-purple)' },
            { label: 'Departments', value: 10, color: 'var(--accent-gold)' },
        ].map(s => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-subtle);">
              <span style="font-size:0.82rem;color:var(--text-muted);">${s.label}</span>
              <span style="font-size:1rem;font-weight:700;color:${s.color};font-family:var(--font-mono);">${s.value}</span>
            </div>
          `).join('')}
        </div>

        <!-- Department Legend -->
        <div class="card">
          <div class="card-title" style="margin-bottom:12px;">🏢 Departments</div>
          ${DEPARTMENTS.map(dept => {
            const manager = state.workers[dept.manager.id] || dept.manager;
            const workers = dept.workers.map(w => state.workers[w.id] || w);
            const avgE2 = Math.round([manager, ...workers].reduce((s, w) => s + (w?.energy || 80), 0) / 4);
            return `
              <div style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;" onclick="window._yotec.switchPanel('team')">
                <div style="width:10px;height:10px;border-radius:50%;background:${dept.color};flex-shrink:0;box-shadow:0 0 5px ${dept.color};"></div>
                <span style="font-size:0.8rem;color:var(--text-secondary);flex:1;">${dept.name}</span>
                <span style="font-size:0.7rem;font-family:var(--font-mono);color:${dept.color};">${avgE2}%</span>
              </div>
            `;
        }).join('')}
        </div>

        <button class="btn btn-primary" onclick="window._yotec.switchPanel('team')" style="width:100%;">🏢 Explore Team →</button>
      </div>
    </div>
  `;
}

function buildConnectionLines(projects, ringLayouts, CX, CY) {
    // Flatten all dept nodes with their positions
    const positions = {};
    for (const ring of ringLayouts) {
        const count = ring.depts.length;
        ring.depts.forEach((dept, i) => {
            const angle = (2 * Math.PI * i / count) - Math.PI / 2;
            positions[dept.id] = {
                x: CX + ring.radius * Math.cos(angle),
                y: CY + ring.radius * Math.sin(angle)
            };
        });
    }

    const lines = [];
    for (const proj of projects) {
        for (const relId of (proj.relatedIds || [])) {
            const relProj = projects.find(p => p.id === relId);
            if (!relProj) continue;
            const from = positions[proj.deptId];
            const to = positions[relProj.deptId];
            if (!from || !to) continue;
            lines.push(`<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="rgba(0,212,255,0.12)" stroke-width="1.5" stroke-dasharray="4,4"/>`);
        }
    }
    return lines.join('');
}
