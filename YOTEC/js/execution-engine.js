// ============================================================
// YOTEC — Execution Engine
// ============================================================

import { store, generateId } from './state.js';

const TASK_CATALOG = {
    web_dev: { outputFormat: 'ts', executeFunction: 'generate_react_component' },
    ui_design: { outputFormat: 'svg', executeFunction: 'generate_visual_asset' },
    learning_content: { outputFormat: 'md', executeFunction: 'generate_learning_module' },
    content_strategy: { outputFormat: 'md', executeFunction: 'generate_content_pack' },
    analytics_report: { outputFormat: 'json', executeFunction: 'generate_analytics_report' },
    automation_ops: { outputFormat: 'txt', executeFunction: 'run_operational_playbook' },
    general: { outputFormat: 'txt', executeFunction: 'generate_general_output' }
};

function inferTaskTypeFromRole(role) {
    if (/Backend|Frontend|DevOps/.test(role)) return 'web_dev';
    if (/Designer|Visual/.test(role)) return 'ui_design';
    if (/Curriculum|Learning|Knowledge/.test(role)) return 'learning_content';
    if (/Copywriter|Storyteller|Social|Writer/.test(role)) return 'content_strategy';
    if (/Data|Analyst|BI/.test(role)) return 'analytics_report';
    if (/Operations|Support|Automation|Compliance/.test(role)) return 'automation_ops';
    return 'general';
}

class OutputGenerator {
    static generateResponse(workerId, role, title, instructions, options = {}) {
        const timestamp = Date.now();
        const id = generateId('out');
        const taskType = options.taskType || inferTaskTypeFromRole(role);
        const taskProfile = TASK_CATALOG[taskType] || TASK_CATALOG.general;

        let content = '';
        let format = taskProfile.outputFormat;
        let qaStatus = 'pending';

        if (format === 'ts') {
            content = `// ==========================================================
// YOTEC Auto-Generated Module
// Task: ${title}
// Author: ${workerId} (${role})
// ==========================================================

import React, { useState, useEffect } from 'react';

/**
 * Instruction context:
 * ${instructions}
 */

export const GeneratedComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setData({ status: 'active', metric: 98.5 });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="loader blur-pulse">Initializing System...</div>;

  return (
    <div className="yotec-module-container">
      <h3>{data.status === 'active' ? 'System Online' : 'System Offline'}</h3>
      <div className="metric-display">Efficiency: {data.metric}%</div>
    </div>
  );
};

export default GeneratedComponent;
`;
        } else if (format === 'svg') {
            const color1 = ['#00d4ff', '#ff6bff', '#ffd700', '#00ff9d'][Math.floor(Math.random() * 4)];
            const color2 = ['#7b6cf6', '#ff4d6d', '#ff8c42', '#4cc9f0'][Math.floor(Math.random() * 4)];
            content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#070915" />
  <g transform="translate(200, 140)">
    <circle cx="0" cy="0" r="60" fill="none" stroke="url(#grad1)" stroke-width="8" />
    <polygon points="0,-30 25,15 -25,15" fill="url(#grad1)" />
  </g>
  <text x="50%" y="260" font-family="'Space Grotesk', sans-serif" font-size="28" font-weight="700" fill="#e8eaf6" text-anchor="middle" letter-spacing="4">${title.toUpperCase()}</text>
</svg>`;
        } else if (format === 'md' && taskType === 'learning_content') {
            content = `# 📚 Learning Module: ${title}

## Overview
${instructions}

## Objectives
- Understand core concept
- Complete practical exercise
- Submit to QA for validation

## Quiz
1. What is the primary dependency in this workflow?
2. What triggers QA review?
`;
        } else if (format === 'md') {
            content = `# 📣 Content Draft: ${title}

## Summary
${instructions}

## Suggested Channels
- Blog
- LinkedIn
- X / Twitter

## CTA
Book a strategy call with YOTEC.
`;
        } else if (format === 'json') {
            content = JSON.stringify({
                reportTitle: title,
                generatedBy: workerId,
                taskType,
                timestamp: new Date().toISOString(),
                insights: [
                    'Dependency risk identified in sprint critical path.',
                    'Energy trend remains healthy for assigned workers.',
                    'QA readiness estimated above 80% if blockers stay resolved.'
                ],
                metrics: {
                    uptime: 99.99,
                    avgTaskCompletionSeconds: 12.4,
                    errorRate: 0.003
                }
            }, null, 2);
        } else {
            content = `Task Report: ${title}\nExecutor: ${workerId}\nTask Type: ${taskType}\n\nInstructions:\n"${instructions}"\n\nExecution complete. Awaiting SENTINEL QA review.`;
        }

        const outputPath = options.outputPath || `/artifacts/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${format}`;

        return {
            id,
            workerId,
            taskType,
            title,
            content,
            format,
            timestamp,
            qaStatus,
            executeFunction: options.executeFunction || taskProfile.executeFunction,
            outputPath,
            instructions
        };
    }
}

export class ExecutionEngine {
    static async runTask(workerId, title, instructions, options = {}) {
        const state = store.state;
        const worker = state.workers[workerId];
        if (!worker) return null;

        const waitTime = 1500 + Math.random() * 2500;
        await new Promise(r => setTimeout(r, waitTime));

        const output = OutputGenerator.generateResponse(workerId, worker.role, title, instructions, options);

        store.dispatch({ type: 'ADD_OUTPUT', payload: output });

        const newEnergy = Math.max(10, worker.energy - Math.floor(Math.random() * 8 + 2));
        store.dispatch({ type: 'UPDATE_WORKER', payload: { id: workerId, energy: newEnergy } });

        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: {
                id: generateId('act'),
                time: Date.now(),
                type: 'execution',
                icon: '⚙️',
                text: `${worker.name} executed ${output.taskType} via ${output.executeFunction} and generated "${title}"`
            }
        });

        return output;
    }
}

export { TASK_CATALOG, inferTaskTypeFromRole };
