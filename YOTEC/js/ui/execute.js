// ============================================================
// YOTEC — Task Execution Panel (Manual CEO Trigger)
// ============================================================

import { store } from '../state.js';
import { DEPARTMENTS } from '../data.js';
import { ExecutionEngine } from '../execution-engine.js';

export function renderExecute(container) {
    const state = store.state;

    const allWorkers = [];
    DEPARTMENTS.forEach(dept => {
        dept.workers.forEach(w => allWorkers.push({ ...w, deptIcon: dept.icon, deptName: dept.name }));
    });

    container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">⚡ Execute Task</div>
        <div class="page-subtitle">Directly trigger an AI worker to generate a functional output</div>
      </div>
    </div>

    <div class="main-side">
      
      <!-- Execution Form -->
      <div class="card" style="border-color:rgba(0,212,255,0.25);">
        <div class="card-header"><div class="card-title">📝 Execution Parameters</div></div>
        
        <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:20px;">
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:6px;font-weight:600;">ASSIGN WORKER</label>
            <select id="exec-worker" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:10px 14px;color:var(--text-primary);font-size:0.85rem;outline:none;">
              <option value="" disabled selected>Select an AI Employee...</option>
              ${allWorkers.map(w => `<option value="${w.id}">${w.deptIcon} ${w.name} — ${w.role}</option>`).join('')}
            </select>
          </div>
          
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:6px;font-weight:600;">OUTPUT TITLE</label>
            <input id="exec-title" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:10px 14px;color:var(--text-primary);font-size:0.85rem;outline:none;" placeholder="e.g. Q3 Analytics Report">
          </div>
          
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:6px;font-weight:600;">INSTRUCTIONS / PROMPT</label>
            <textarea id="exec-prompt" rows="4" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:10px 14px;color:var(--text-primary);font-size:0.85rem;outline:none;resize:vertical;" placeholder="Describe exactly what the AI should generate..."></textarea>
          </div>
        </div>
        
        <button class="btn btn-primary" id="btn-run" style="width:100%;padding:12px;font-size:0.95rem;">⚡ Generate Output</button>
      </div>
      
      <!-- Execution Terminal / Log -->
      <div class="card" style="background:#000;border:1px solid #333;display:flex;flex-direction:column;">
        <div class="card-header" style="border-bottom:1px solid #333;padding-bottom:10px;margin-bottom:10px;">
          <div class="card-title" style="font-family:var(--font-mono);font-size:0.85rem;color:var(--accent-green);">> execution_log.sh</div>
        </div>
        <div id="exec-log" style="flex:1;overflow-y:auto;font-family:var(--font-mono);font-size:0.7rem;color:#8892b0;line-height:1.6;display:flex;flex-direction:column;gap:4px;">
          <div>[SYSTEM] Execution engine idle. Waiting for CEO triggers.</div>
        </div>
      </div>
      
    </div>
  `;

    const btnRun = container.querySelector('#btn-run');
    const logDiv = container.querySelector('#exec-log');

    function logItem(msg, color = '#8892b0') {
        const time = new Date().toLocaleTimeString([], { hour12: false });
        logDiv.insertAdjacentHTML('beforeend', `<div style="color:${color}"><span style="color:#555;">[${time}]</span> ${msg}</div>`);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    btnRun.addEventListener('click', async () => {
        const workerId = container.querySelector('#exec-worker').value;
        const title = container.querySelector('#exec-title').value.trim();
        const prompt = container.querySelector('#exec-prompt').value.trim();

        if (!workerId || !title || !prompt) {
            logItem('ERROR: Missing parameters.', 'var(--accent-red)');
            return;
        }

        btnRun.disabled = true;
        btnRun.textContent = 'Executing...';

        const worker = store.getWorker(workerId);

        logItem(`> INIT EXECUTION: ${worker.name} (${worker.role})`, 'var(--accent-cyan)');
        logItem(`Target output: "${title}"`);
        logItem(`Compiling context matrices...`);

        setTimeout(() => logItem(`Analyzing prompt parameters...`), 600);
        setTimeout(() => logItem(`Allocating processing threads... Generating...`, 'var(--accent-gold)'), 1500);

        const output = await ExecutionEngine.runTask(workerId, title, prompt);

        if (output) {
            logItem(`SUCCESS: Artifact generated! Format: .${output.format}`, 'var(--accent-green)');
            logItem(`Saving to Output Repository...`);
            logItem(`Executing QA handoff protocol...`);
            setTimeout(() => {
                btnRun.disabled = false;
                btnRun.textContent = '⚡ Generate Output';
                window._yotec.switchPanel('outputs');
            }, 1500);
        }
    });
}
