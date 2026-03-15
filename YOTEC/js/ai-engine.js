// ============================================================
// YOTEC — AI Simulation Engine
// ============================================================

import { COMPANY, DEPARTMENTS, QA_AI, RESPONSE_TEMPLATES } from './data.js';
import { store, generateId } from './state.js';
import { ExecutionEngine, TASK_CATALOG } from './execution-engine.js';

// ---- Utility helpers ----
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] !== undefined ? vars[key] : `{${key}}`);
}

// Maps keywords in CEO messages to departments
const KEYWORD_DEPT_MAP = {
    develop: 'dev', code: 'dev', backend: 'dev', frontend: 'dev', api: 'dev', app: 'dev',
    design: 'design', ui: 'design', ux: 'design', brand: 'design', logo: 'design', visual: 'design',
    learn: 'education', course: 'education', train: 'education', module: 'education', educat: 'education',
    market: 'marketing', campaign: 'marketing', adverti: 'marketing', growth: 'marketing', seo: 'marketing',
    qualit: 'qa', test: 'qa', bug: 'qa', review: 'qa', audit: 'qa',
    data: 'analytics', analyt: 'analytics', dashboard: 'analytics', report: 'analytics', metric: 'analytics',
    content: 'content', writ: 'content', blog: 'content', copy: 'content', article: 'content',
    social: 'social', post: 'social', twitter: 'social', instagram: 'social', tiktok: 'social',
    operat: 'ops', process: 'ops', logistic: 'ops', workflow: 'ops', efficienc: 'ops',
    support: 'support', customer: 'support', help: 'support', ticket: 'support', service: 'support'
};

function detectDepartment(text) {
    const lower = text.toLowerCase();
    for (const [keyword, deptId] of Object.entries(KEYWORD_DEPT_MAP)) {
        if (lower.includes(keyword)) return deptId;
    }
    return null;
}

function detectPriority(text) {
    const lower = text.toLowerCase();
    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap') || lower.includes('immediately')) return 'critical';
    if (lower.includes('high priority') || lower.includes('important')) return 'high';
    if (lower.includes('low priority') || lower.includes('when possible')) return 'low';
    return 'medium';
}


function detectExecutionTaskType(text) {
    const lower = text.toLowerCase();
    if (/dashboard|api|backend|frontend|code|website|component/.test(lower)) return 'web_dev';
    if (/design|logo|ui|ux|visual|brand/.test(lower)) return 'ui_design';
    if (/learn|course|quiz|module|education/.test(lower)) return 'learning_content';
    if (/analytics|report|metric|kpi|data/.test(lower)) return 'analytics_report';
    if (/social|campaign|blog|content|copy/.test(lower)) return 'content_strategy';
    if (/ops|automation|workflow|support|process/.test(lower)) return 'automation_ops';
    return 'general';
}

function buildExecutionOutputPath(taskType, title) {
    const formatHint = TASK_CATALOG[taskType]?.outputFormat || 'txt';
    return `/artifacts/${taskType}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${formatHint}`;
}

function getDeptById(id) {
    return DEPARTMENTS.find(d => d.id === id);
}

function buildTaskPacket(project, manager, status = 'pending') {
    return {
        project: project.title,
        taskId: project.id,
        assignedTo: manager.name,
        status,
        progress: `${project.progress || 0}%`,
        dependencies: project.dependencies || [],
        energy: `${project.energy || 50}%`
    };
}

function buildManagerPlan(projectId, projectTitle, dept) {
    return dept.workers.map((worker, index) => ({
        id: generateId('st'),
        title: `${worker.role.replace(' AI', '')}: ${projectTitle}`,
        status: index === 0 ? 'in-progress' : 'pending',
        progress: index === 0 ? 5 : 0,
        ownerId: worker.id,
        dependencies: index === 0 ? [] : [dept.workers[index - 1].id]
    }));
}

// ============================================================
// Executive Assistant AI (ARIA)
// ============================================================
export class ExecutiveAssistant {
    constructor() {
        this.id = COMPANY.ea.id;
        this.name = COMPANY.ea.name;
    }

    async processMessage(userMessage) {
        const lower = userMessage.toLowerCase();

        // Detect execution intent ("generate", "create", "write", "build", "design")
        if (/generate|create|write|build|design|draft/.test(lower)) {
            return this._routeExecutionTask(userMessage);
        }

        // Detect intent
        if (lower.includes('status') || lower.includes('report') || lower.includes('update')) {
            return this._generateStatusReport(userMessage);
        }
        if (lower.includes('meeting') || lower.includes('meet with') || lower.includes('talk to')) {
            return this._handleMeetingRequest(userMessage);
        }
        if (lower.includes('energy') || lower.includes('how is') || lower.includes('how are')) {
            return this._generateEnergyReport();
        }
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('good')) {
            return this._greet();
        }

        // Default: treat as new project/task assignment
        return this._routeNewTask(userMessage);
    }

    _greet() {
        const state = store.state;
        const activeCount = state.projects.filter(p => p.status !== 'completed').length;
        const avgEnergy = Math.round(
            Object.values(state.workers).reduce((sum, w) => sum + w.energy, 0) /
            Object.values(state.workers).length
        );
        return {
            response: `Hello, Biniam! Great to see you. YOTEC is running at peak performance today.\n\n📊 **Quick Status:**\n- Active Projects: **${activeCount}**\n- Team Average Energy: **${avgEnergy}%**\n- Departments Online: **10/10**\n- QA Queue: **1 item pending review**\n\nAll systems are nominally operational. What would you like to focus on today?`,
            type: 'ea-message',
            action: null
        };
    }

    async _routeExecutionTask(userMessage) {
        const deptId = detectDepartment(userMessage) || 'dev';
        const dept = getDeptById(deptId);
        const taskType = detectExecutionTaskType(userMessage);
        const priority = detectPriority(userMessage);

        // Find highest energy worker in dept
        const workerId = dept.workers.reduce((a, b) => store.getWorker(a.id)?.energy > store.getWorker(b.id)?.energy ? a : b).id;
        const worker = store.getWorker(workerId);
        const workerName = worker?.name || 'a worker';

        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: { id: generateId('act'), time: Date.now(), type: 'manager', icon: dept.icon, text: `ARIA routed ${taskType} execution to ${workerName} in ${dept.name}.` }
        });

        setTimeout(async () => {
            const title = this._extractTitle(userMessage);
            const output = await ExecutionEngine.runTask(workerId, title, userMessage, {
                taskType,
                outputPath: buildExecutionOutputPath(taskType, title)
            });
            if (output) {
                const warning = output.qaStatus === 'pending' ? 'QA validation is still pending.' : 'Output validated.';
                const suggestion = `Suggestion: If this is business-critical, trigger SENTINEL validation immediately from Artifact Repository.`;
                const internalMessage = {
                    project: title,
                    taskId: output.id,
                    assignedTo: workerName,
                    status: 'in-progress',
                    progress: 100,
                    dependencies: [],
                    energy: worker?.energy || 80
                };

                store.dispatch({
                    type: 'ADD_MESSAGE',
                    payload: {
                        id: generateId('msg'),
                        from: 'ea',
                        fromName: 'ARIA',
                        timestamp: Date.now(),
                        type: 'ea-message',
                        content: `**Execution Complete:** ${workerName} generated "${title}" as **.${output.format}**.

**CEO Summary**
- Progress: **100%**
- Energy: **${worker?.energy || 80}%**
- Warning: ${warning}
- ${suggestion}

**Internal AI Packet**
\`\`\`json
${JSON.stringify(internalMessage, null, 2)}
\`\`\`

Artifact posted to output repo: \`${output.outputPath}\``
                    }
                });
            }
        }, 1500);

        return {
            response: `Understood. I assigned this **${taskType}** execution to **${workerName}** (${dept.name}) with **${priority.toUpperCase()}** priority and activated functional generation mode. I'll send a full completion summary with warnings/suggestions after execution.`,
            type: 'ea-message',
            action: null
        };
    }

    async _routeNewTask(userMessage) {
        const deptId = detectDepartment(userMessage) || 'dev';
        const dept = getDeptById(deptId);
        const manager = store.getDeptManager(deptId) || dept.manager;
        const priority = detectPriority(userMessage);

        const projectTitle = this._extractTitle(userMessage);
        const projectId = generateId('proj');
        const planSubtasks = buildManagerPlan(projectId, projectTitle, dept);
        const workerAssignments = planSubtasks.map(step => ({ workerId: step.ownerId, subtaskId: step.id, status: step.status }));
        const structuredDependencies = planSubtasks.flatMap(step => step.dependencies);

        const projectPayload = {
            id: projectId,
            title: projectTitle,
            category: dept.name,
            deptId: dept.id,
            assignedTo: dept.manager.id,
            content: userMessage,
            priority,
            relatedIds: dept.workers.map(w => w.id),
            dependencies: structuredDependencies,
            workerAssignments,
            subtasks: planSubtasks,
            energy: Math.max(40, Math.round(dept.workers.reduce((sum, w) => sum + (store.getWorker(w.id)?.energy || w.energy), 0) / dept.workers.length - 10)),
            dateEnd: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
        };

        store.dispatch({
            type: 'ADD_PROJECT',
            payload: projectPayload
        });

        store.dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                id: projectId,
                subtasks: planSubtasks,
                workerAssignments,
                dependencies: structuredDependencies
            }
        });

        const packet = buildTaskPacket(projectPayload, manager);

        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: {
                id: generateId('act'),
                time: Date.now(),
                type: 'project',
                icon: dept.icon,
                text: `New project "${projectTitle}" assigned to ${manager.name} (${dept.name}).`
            }
        });

        store.dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
                id: generateId('notif'),
                type: 'assignment',
                title: 'New Project Assigned',
                message: `"${projectTitle}" → ${manager.name}`,
                time: Date.now()
            }
        });

        const template = pickRandom(RESPONSE_TEMPLATES.ea.taskReceived);
        const eaResponse = fillTemplate(template, { ceo: 'Biniam', manager: manager.name });

        setTimeout(() => {
            this._simulateManagerAck(dept, manager, projectTitle, projectId, planSubtasks, packet);
        }, 3500);

        return {
            response: `${eaResponse}

**Project Brief Created:**
- 📁 Title: "${projectTitle}"
- 🏢 Department: ${dept.name}
- 👤 Manager: ${manager.name} (${dept.fullName || manager.fullName})
- ⚡ Priority: ${priority.toUpperCase()}
- 🔗 Dependencies Tracked: ${structuredDependencies.length}
- 📅 Target: ${new Date(Date.now() + 10 * 86400000).toLocaleDateString()}

I also issued a structured internal task packet for manager orchestration and QA traceability.`,
            type: 'ea-message',
            action: { type: 'new-project', projectId, deptId }
        };
    }

    _extractTitle(text) {
        // Try to extract a meaningful title from the CEO message
        const trimmed = text.trim();
        if (trimmed.length < 60) return trimmed;
        // Use first sentence or first 55 chars
        const firstSentence = trimmed.split(/[.!?]/)[0];
        return firstSentence.length > 8 ? firstSentence.substring(0, 55) + '…' : 'New Assignment';
    }

    _generateStatusReport(query) {
        const state = store.state;
        const proj = state.projects;
        const inProgress = proj.filter(p => p.status === 'in-progress');
        const qaReview = proj.filter(p => p.status === 'qa-review');
        const completed = proj.filter(p => p.status === 'completed');
        const pending = proj.filter(p => p.status === 'pending');

        const avgEnergy = Math.round(
            Object.values(state.workers).reduce((sum, w) => sum + w.energy, 0) /
            Object.values(state.workers).length
        );

        let report = `📋 **YOTEC Status Report** — ${new Date().toLocaleDateString()}\n\n`;
        report += `**Overall:**\n`;
        report += `- Total Projects: **${proj.length}** | Active: **${inProgress.length}** | QA Review: **${qaReview.length}** | Completed: **${completed.length}**\n`;
        report += `- Team Energy Average: **${avgEnergy}%**\n\n`;

        if (inProgress.length > 0) {
            report += `**🔄 In Progress:**\n`;
            for (const p of inProgress) {
                const dept = getDeptById(p.deptId);
                report += `- "${p.title}" — ${p.progress}% complete (${dept ? dept.name : p.category})\n`;
            }
            report += '\n';
        }

        if (qaReview.length > 0) {
            report += `**🛡️ Awaiting QA Approval:**\n`;
            for (const p of qaReview) report += `- "${p.title}"\n`;
            report += '\n';
        }

        if (pending.length > 0) {
            report += `**⏳ Pending (Queued):**\n`;
            for (const p of pending) report += `- "${p.title}" — Waiting on dependencies\n`;
            report += '\n';
        }

        if (completed.length > 0) {
            report += `**✅ Completed:**\n`;
            for (const p of completed) report += `- "${p.title}"\n`;
        }

        return { response: report, type: 'ea-message', action: null };
    }

    _generateEnergyReport() {
        const state = store.state;
        let report = `⚡ **Team Energy Report**\n\n`;

        for (const dept of DEPARTMENTS) {
            const manager = state.workers[dept.manager.id];
            const workers = dept.workers.map(w => state.workers[w.id] || w);
            const deptAvg = Math.round([manager, ...workers].reduce((s, w) => s + (w?.energy || 80), 0) / 4);
            const bar = '█'.repeat(Math.floor(deptAvg / 10)) + '░'.repeat(10 - Math.floor(deptAvg / 10));
            report += `${dept.icon} **${dept.name}** — ${bar} ${deptAvg}%\n`;
        }

        report += `\n💡 All departments are operating within healthy parameters. No reassignments needed at this time.`;
        return { response: report, type: 'ea-message', action: null };
    }

    _handleMeetingRequest(message) {
        const lower = message.toLowerCase();
        let targetDept = detectDepartment(message);
        let attendees = [];

        if (targetDept) {
            const dept = getDeptById(targetDept);
            attendees = [dept.manager, ...dept.workers];
        } else {
            // General meeting with all managers
            attendees = DEPARTMENTS.map(d => d.manager);
        }

        const meetingId = generateId('meet');
        const transcript = MeetingSimulator.generateTranscript(attendees, message, meetingId);

        store.dispatch({ type: 'ADD_MEETING', payload: transcript });
        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: {
                id: generateId('act'),
                time: Date.now(),
                type: 'meeting',
                icon: '🤝',
                text: `Meeting initiated: ${attendees.map(a => a.name).join(', ')}.`
            }
        });

        return {
            response: `Understood, Biniam. I've convened a meeting with **${attendees.map(a => a.name).join(', ')}**. The transcript is available in the **Meetings** panel. I've prepared an agenda based on your request and all participants are ready.`,
            type: 'ea-message',
            action: { type: 'open-meeting', meetingId }
        };
    }
    _simulateManagerAck(dept, manager, projectTitle, projectId, planSubtasks = [], packet = null) {
        const template = pickRandom(RESPONSE_TEMPLATES.manager.taskReceived);
        const ackText = fillTemplate(template, { count: Math.floor(Math.random() * 3) + 3 });
        const internalPacket = packet || {
            project: projectTitle,
            taskId: projectId,
            assignedTo: manager.name,
            status: 'pending',
            progress: '0%',
            dependencies: planSubtasks.flatMap(step => step.dependencies || []),
            energy: `${manager.energy || 80}%`
        };

        store.dispatch({
            type: 'ADD_MESSAGE',
            payload: {
                id: generateId('msg'),
                from: manager.id,
                fromName: manager.name,
                content: `[Internal Broadcast from ${manager.name}]

${ackText}

Execution Packet:
\`\`\`json
${JSON.stringify(internalPacket, null, 2)}
\`\`\``,
                timestamp: Date.now(),
                type: 'manager-ack',
                deptId: dept.id,
                projectId
            }
        });

        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: {
                id: generateId('act'),
                time: Date.now(),
                type: 'manager',
                icon: dept.icon,
                text: `${manager.name} acknowledged project "${projectTitle}" and created ${planSubtasks.length || dept.workers.length} tracked subtasks for their team.`
            }
        });

        setTimeout(() => {
            this._simulateWorkersStart(dept, projectTitle, projectId, planSubtasks);
        }, 5000);
    }

    _simulateWorkersStart(dept, projectTitle, projectId, planSubtasks = []) {
        const orderedTasks = planSubtasks.length ? planSubtasks : buildManagerPlan(projectId, projectTitle, dept);

        for (const worker of dept.workers) {
            const workerPlan = orderedTasks.find(step => step.ownerId === worker.id);
            const template = pickRandom(RESPONSE_TEMPLATES.worker.taskStarted);
            const workerText = fillTemplate(template, { task: workerPlan?.title || projectTitle, energy: worker.energy });
            const queue = workerPlan ? [{ id: workerPlan.id, title: workerPlan.title, status: workerPlan.status }] : [];

            store.dispatch({
                type: 'UPDATE_WORKER',
                payload: { id: worker.id, currentTaskId: projectId, taskQueue: queue }
            });
            store.dispatch({
                type: 'ADD_ACTIVITY',
                payload: {
                    id: generateId('act'),
                    time: Date.now() + Math.random() * 2000,
                    type: 'worker',
                    icon: worker.avatar,
                    text: `${worker.name}: "${workerText.substring(0, 100)}"`
                }
            });
        }

        store.dispatch({
            type: 'UPDATE_PROJECT',
            payload: { id: projectId, status: 'in-progress', energy: 60, subtasks: orderedTasks }
        });
    }
}


// ============================================================
// QA AI (SENTINEL)
// ============================================================
export class QAEngine {
    static review(projectOrOutput) {
        // Determine if we are reviewing a Project or an Execution Output
        const isProject = projectOrOutput.hasOwnProperty('progress');
        const passChance = isProject ? (projectOrOutput.progress >= 85 ? 0.85 : 0.45) : 0.70;
        const passed = Math.random() < passChance;

        if (passed) {
            if (isProject) {
                store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectOrOutput.id, status: 'completed', progress: 100 } });
                store.dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '🛡️', text: `SENTINEL approved "${projectOrOutput.title}" — project completed! ✅` }
                });
            } else {
                store.dispatch({ type: 'UPDATE_OUTPUT', payload: { id: projectOrOutput.id, qaStatus: 'approved' } });
                store.dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '🛡️', text: `SENTINEL approved artifact "${projectOrOutput.title}". ✅` }
                });
            }
            return { approved: true, feedback: pickRandom(RESPONSE_TEMPLATES.qa.approved) };
        } else {
            const issues = ['insufficient test coverage', 'UI inconsistencies detected', 'API response time exceeds threshold', 'missing error handling', 'documentation gaps', 'brand alignment drift'];
            const issue = pickRandom(issues);
            const msg = fillTemplate(pickRandom(RESPONSE_TEMPLATES.qa.revisionNeeded), { count: Math.floor(Math.random() * 3) + 1, manager: isProject ? 'the assigned manager' : 'the worker', issue, criteria: issue });

            if (isProject) {
                store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectOrOutput.id, status: 'revision-needed' } });
                store.dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '⚠️', text: `SENTINEL sent "${projectOrOutput.title}" back for revision: ${issue}.` }
                });
            } else {
                store.dispatch({ type: 'UPDATE_OUTPUT', payload: { id: projectOrOutput.id, qaStatus: 'rejected' } });
                store.dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '⚠️', text: `SENTINEL rejected artifact "${projectOrOutput.title}": ${issue}.` }
                });
            }

            store.dispatch({
                type: 'ADD_ALERT',
                payload: { id: generateId('alt'), type: 'danger', message: `QA Rejection: "${projectOrOutput.title}" failed validation. Reason: ${issue}`, time: Date.now() }
            });
            return { approved: false, feedback: msg };
        }
    }
}

// ============================================================
// Meeting Simulator
// ============================================================
export class MeetingSimulator {
    static generateTranscript(attendees, agenda, meetingId) {
        const now = new Date();
        const lines = [];
        const topics = this._generateTopics(agenda);

        lines.push({ speaker: 'ARIA', role: 'Executive Assistant AI', text: `Meeting called to order at ${now.toLocaleTimeString()}. Agenda: "${agenda}". Attendees: ${attendees.map(a => a.name).join(', ')}.` });

        for (const topic of topics) {
            const speaker = pickRandom([...attendees, { name: 'ARIA', role: 'Executive Assistant AI' }]);
            lines.push({ speaker: speaker.name, role: speaker.role, text: topic });
            if (Math.random() > 0.5 && attendees.length > 1) {
                const responder = pickRandom(attendees.filter(a => a.name !== speaker.name));
                if (responder) {
                    lines.push({ speaker: responder.name, role: responder.role, text: this._generateResponse(topic, responder) });
                }
            }
        }

        const actions = this._generateActionItems(attendees, agenda);
        lines.push({ speaker: 'ARIA', role: 'Executive Assistant AI', text: `Meeting summary complete. Action items recorded: ${actions.map(a => a.text).join(' | ')}. Meeting adjourned.` });

        return {
            id: meetingId,
            title: `Meeting: ${agenda.substring(0, 40)}`,
            date: now.toISOString(),
            attendees: attendees.map(a => ({ name: a.name, role: a.role })),
            transcript: lines,
            actionItems: actions,
            agenda
        };
    }

    static _generateTopics(agenda) {
        const lower = agenda.toLowerCase();
        const topics = [
            `I've reviewed current progress and believe we can accelerate by 15% if we parallelize the key deliverables.`,
            `One blocker I want to flag: we have a dependency that needs resolution before we can move forward on the main milestone.`,
            `My recommendation is to prioritize the core functionality first, then layer features in the next sprint.`,
            `Energy levels across the team are holding well, but I'd suggest reducing parallel tasks to maintain quality.`,
            `I can commit to having a detailed plan ready within the next session if we align on the core objectives today.`,
            `Cross-department coordination will be critical here — I suggest a shared visibility board for dependencies.`,
            `From a quality standpoint, we need at least one full review cycle built into the timeline.`,
        ];
        return topics.slice(0, Math.floor(Math.random() * 3) + 4);
    }

    static _generateResponse(topic, responder) {
        const responses = [
            `I agree with that assessment. From the ${responder.role.split(' ')[0]} perspective, we're aligned and ready to support.`,
            `Good point. I'll factor that into my team's workload adjustments immediately.`,
            `That matches what I'm seeing on my end as well. Let's formalize this as a decision.`,
            `I'd add that we should document this for future reference — it's a recurring pattern worth tracking.`,
            `Noted. I'll brief my workers on this direction after the meeting and implement accordingly.`,
        ];
        return pickRandom(responses);
    }

    static _generateActionItems(attendees, agenda) {
        const actions = [
            { owner: attendees[0]?.name || 'ARIA', text: 'Prepare detailed task breakdown and timeline.' },
            { owner: attendees[1]?.name || 'ARIA', text: 'Review dependencies and flag any blockers.' },
            { owner: 'ARIA', text: 'Compile meeting notes and distribute to CEO Biniam.' },
        ];
        if (attendees.length > 2) {
            actions.push({ owner: attendees[2]?.name, text: 'Begin initial execution phase on primary deliverable.' });
        }
        return actions;
    }
}

// ============================================================
// Autonomous Background Tick
// ============================================================
export function startAutonomousTick() {
    setInterval(() => {
        const state = store.state;

        // Progress active projects
        for (const project of state.projects) {
            if (project.status === 'in-progress' && project.progress < 98) {
                const boost = Math.random() * 4 + 1;
                const newProgress = Math.min(project.progress + boost, 98);
                store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, progress: Math.round(newProgress), energy: Math.min(project.energy + 2, 100) } });

                if (newProgress >= 95 && project.status === 'in-progress') {
                    store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, status: 'qa-review' } });
                    store.dispatch({
                        type: 'ADD_ACTIVITY',
                        payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '🛡️', text: `"${project.title}" submitted to SENTINEL for QA review.` }
                    });
                }
            }

            // Auto-approve pending projects when dependencies are met
            if (project.status === 'pending' && project.dependencies.length > 0) {
                const allDepsComplete = project.dependencies.every(depId =>
                    state.projects.find(p => p.id === depId)?.status === 'completed'
                );
                if (allDepsComplete) {
                    store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, status: 'in-progress' } });
                    store.dispatch({
                        type: 'ADD_ACTIVITY',
                        payload: { id: generateId('act'), time: Date.now(), type: 'project', icon: '🚀', text: `"${project.title}" dependencies resolved — now in progress!` }
                    });
                }
            }

            if (project.status === 'qa-review' && Math.random() < 0.35) {
                const qaResult = QAEngine.review(project);
                store.dispatch({
                    type: 'ADD_MESSAGE',
                    payload: {
                        id: generateId('msg'),
                        from: 'qa-master',
                        fromName: QA_AI.name,
                        content: `SENTINEL QA update for "${project.title}": ${qaResult.feedback}`,
                        timestamp: Date.now(),
                        type: 'ea-message'
                    }
                });
            }

            if (project.status === 'revision-needed' && Math.random() < 0.4) {
                store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, status: 'in-progress', progress: Math.max(35, project.progress || 30) } });
                store.dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: { id: generateId('act'), time: Date.now(), type: 'manager', icon: '🔁', text: `${project.title} moved from revision-needed back to in-progress after corrective plan.` }
                });
            }
        }

        // Fluctuate worker energy slightly
        for (const [id, worker] of Object.entries(state.workers)) {
            const delta = (Math.random() - 0.4) * 3;
            const newEnergy = Math.max(55, Math.min(100, worker.energy + delta));
            store.dispatch({ type: 'UPDATE_WORKER', payload: { id, energy: Math.round(newEnergy) } });
        }

        store.dispatch({ type: 'TICK' });
    }, 10000); // every 10 seconds
}
// ============================================================
// YOTEC — AI Simulation Engine
// ============================================================

import { COMPANY, DEPARTMENTS, QA_AI, RESPONSE_TEMPLATES } from './data.js';
import { store, generateId } from './state.js';
import { ExecutionEngine } from './execution-engine.js';

// ---- Utility helpers ----
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] !== undefined ? vars[key] : `{${key}}`);
}

// Maps keywords in CEO messages to departments
const KEYWORD_DEPT_MAP = {
    develop: 'dev', code: 'dev', backend: 'dev', frontend: 'dev', api: 'dev', app: 'dev',
    design: 'design', ui: 'design', ux: 'design', brand: 'design', logo: 'design', visual: 'design',
    learn: 'education', course: 'education', train: 'education', module: 'education', educat: 'education',
    market: 'marketing', campaign: 'marketing', adverti: 'marketing', growth: 'marketing', seo: 'marketing',
    qualit: 'qa', test: 'qa', bug: 'qa', review: 'qa', audit: 'qa',
    data: 'analytics', analyt: 'analytics', dashboard: 'analytics', report: 'analytics', metric: 'analytics',
    content: 'content', writ: 'content', blog: 'content', copy: 'content', article: 'content',
    social: 'social', post: 'social', twitter: 'social', instagram: 'social', tiktok: 'social',
    operat: 'ops', process: 'ops', logistic: 'ops', workflow: 'ops', efficienc: 'ops',
    support: 'support', customer: 'support', help: 'support', ticket: 'support', service: 'support'
};

function detectDepartment(text) {
    const lower = text.toLowerCase();
    for (const [keyword, deptId] of Object.entries(KEYWORD_DEPT_MAP)) {
        if (lower.includes(keyword)) return deptId;
    }
    return null;
}

function detectPriority(text) {
    const lower = text.toLowerCase();
    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap') || lower.includes('immediately')) return 'critical';
    if (lower.includes('high priority') || lower.includes('important')) return 'high';
    if (lower.includes('low priority') || lower.includes('when possible')) return 'low';
    return 'medium';
}

function getDeptById(id) {
    return DEPARTMENTS.find(d => d.id === id);
}

// ============================================================
// Executive Assistant AI (ARIA)
// ============================================================
export class ExecutiveAssistant {
    constructor() {
        this.id = COMPANY.ea.id;
        this.name = COMPANY.ea.name;
    }

    async processMessage(userMessage) {
        const lower = userMessage.toLowerCase();

        // Detect execution intent ("generate", "create", "write", "build", "design")
        if (/generate|create|write|build|design|draft/.test(lower)) {
            return this._routeExecutionTask(userMessage);
        }

        // Detect intent
        if (lower.includes('status') || lower.includes('report') || lower.includes('update')) {
            return this._generateStatusReport(userMessage);
        }
        if (lower.includes('meeting') || lower.includes('meet with') || lower.includes('talk to')) {
            return this._handleMeetingRequest(userMessage);
        }
        if (lower.includes('energy') || lower.includes('how is') || lower.includes('how are')) {
            return this._generateEnergyReport();
        }
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('good')) {
            return this._greet();
        }

        // Default: treat as new project/task assignment
        return this._routeNewTask(userMessage);
    }

    _greet() {
        const state = store.state;
        const activeCount = state.projects.filter(p => p.status !== 'completed').length;
        const avgEnergy = Math.round(
            Object.values(state.workers).reduce((sum, w) => sum + w.energy, 0) /
            Object.values(state.workers).length
        );
        return {
            response: `Hello, Biniam! Great to see you. YOTEC is running at peak performance today.\n\n📊 **Quick Status:**\n- Active Projects: **${activeCount}**\n- Team Average Energy: **${avgEnergy}%**\n- Departments Online: **10/10**\n- QA Queue: **1 item pending review**\n\nAll systems are nominally operational. What would you like to focus on today?`,
            type: 'ea-message',
            action: null
        };
    }

    async _routeExecutionTask(userMessage) {
        const deptId = detectDepartment(userMessage) || 'dev';
        const dept = getDeptById(deptId);
        // Find highest energy worker in dept
        const workerId = dept.workers.reduce((a, b) => store.getWorker(a.id)?.energy > store.getWorker(b.id)?.energy ? a : b).id;
        const workerName = store.getWorker(workerId)?.name || 'a worker';

        // Create activity
        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: { id: generateId('act'), time: Date.now(), type: 'manager', icon: dept.icon, text: `ARIA routed execution task to ${workerName} in ${dept.name}.` }
        });

        // Run execution engine asynchronously
        setTimeout(async () => {
            const title = this._extractTitle(userMessage);
            const output = await ExecutionEngine.runTask(workerId, title, userMessage);
            if (output) {
                // Push an EA message when done
                store.dispatch({
                    type: 'ADD_MESSAGE',
                    payload: {
                        id: generateId('msg'),
                        from: 'ea',
                        fromName: 'ARIA',
                        timestamp: Date.now(),
                        type: 'ea-message',
                        content: `**Execution Complete:** ${workerName} just generated the requested output for "${title}".\n\nI have placed the artifact in the **Output Repository** for your review. It is currently pending SENTINEL's QA validation.`
                    }
                });
            }
        }, 1500);

        return {
            response: `Understood. I have bypassed the standard project queue and directly assigned this execution task to **${workerName}** (${dept.name}). They are generating the output right now. I'll notify you here the second it's ready.`,
            type: 'ea-message',
            action: null
        };
    }

    async _routeNewTask(userMessage) {
        const deptId = detectDepartment(userMessage) || 'dev';
        const dept = getDeptById(deptId);
        const manager = store.getDeptManager(deptId) || dept.manager;
        const priority = detectPriority(userMessage);

        // Create the project
        const projectTitle = this._extractTitle(userMessage);
        const projectId = generateId('proj');

        store.dispatch({
            type: 'ADD_PROJECT',
            payload: {
                id: projectId,
                title: projectTitle,
                category: dept.name,
                deptId: dept.id,
                assignedTo: dept.manager.id,
                content: userMessage,
                priority,
                relatedIds: [],
                dependencies: [],
                dateEnd: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
            }
        });

        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: {
                id: generateId('act'),
                time: Date.now(),
                type: 'project',
                icon: dept.icon,
                text: `New project "${projectTitle}" assigned to ${manager.name} (${dept.name}).`
            }
        });

        store.dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
                id: generateId('notif'),
                type: 'assignment',
                title: 'New Project Assigned',
                message: `"${projectTitle}" → ${manager.name}`,
                time: Date.now()
            }
        });

        const template = pickRandom(RESPONSE_TEMPLATES.ea.taskReceived);
        const eaResponse = fillTemplate(template, { ceo: 'Biniam', manager: manager.name });

        // Simulate manager acknowledgement after short delay
        setTimeout(() => {
            this._simulateManagerAck(dept, manager, projectTitle, projectId);
        }, 3500);

        return {
            response: `${eaResponse}\n\n**Project Brief Created:**\n- 📁 Title: "${projectTitle}"\n- 🏢 Department: ${dept.name}\n- 👤 Manager: ${manager.name} (${dept.fullName || manager.fullName})\n- ⚡ Priority: ${priority.toUpperCase()}\n- 📅 Target: ${new Date(Date.now() + 10 * 86400000).toLocaleDateString()}\n\nI'll keep you updated on every milestone. ${manager.name} will have the team briefed within the session.`,
            type: 'ea-message',
            action: { type: 'new-project', projectId, deptId }
        };
    }

    _extractTitle(text) {
        // Try to extract a meaningful title from the CEO message
        const trimmed = text.trim();
        if (trimmed.length < 60) return trimmed;
        // Use first sentence or first 55 chars
        const firstSentence = trimmed.split(/[.!?]/)[0];
        return firstSentence.length > 8 ? firstSentence.substring(0, 55) + '…' : 'New Assignment';
    }

    _generateStatusReport(query) {
        const state = store.state;
        const proj = state.projects;
        const inProgress = proj.filter(p => p.status === 'in-progress');
        const qaReview = proj.filter(p => p.status === 'qa-review');
        const completed = proj.filter(p => p.status === 'completed');
        const pending = proj.filter(p => p.status === 'pending');

        const avgEnergy = Math.round(
            Object.values(state.workers).reduce((sum, w) => sum + w.energy, 0) /
            Object.values(state.workers).length
        );

        let report = `📋 **YOTEC Status Report** — ${new Date().toLocaleDateString()}\n\n`;
        report += `**Overall:**\n`;
        report += `- Total Projects: **${proj.length}** | Active: **${inProgress.length}** | QA Review: **${qaReview.length}** | Completed: **${completed.length}**\n`;
        report += `- Team Energy Average: **${avgEnergy}%**\n\n`;

        if (inProgress.length > 0) {
            report += `**🔄 In Progress:**\n`;
            for (const p of inProgress) {
                const dept = getDeptById(p.deptId);
                report += `- "${p.title}" — ${p.progress}% complete (${dept ? dept.name : p.category})\n`;
            }
            report += '\n';
        }

        if (qaReview.length > 0) {
            report += `**🛡️ Awaiting QA Approval:**\n`;
            for (const p of qaReview) report += `- "${p.title}"\n`;
            report += '\n';
        }

        if (pending.length > 0) {
            report += `**⏳ Pending (Queued):**\n`;
            for (const p of pending) report += `- "${p.title}" — Waiting on dependencies\n`;
            report += '\n';
        }

        if (completed.length > 0) {
            report += `**✅ Completed:**\n`;
            for (const p of completed) report += `- "${p.title}"\n`;
        }

        return { response: report, type: 'ea-message', action: null };
    }

    _generateEnergyReport() {
        const state = store.state;
        let report = `⚡ **Team Energy Report**\n\n`;

        for (const dept of DEPARTMENTS) {
            const manager = state.workers[dept.manager.id];
            const workers = dept.workers.map(w => state.workers[w.id] || w);
            const deptAvg = Math.round([manager, ...workers].reduce((s, w) => s + (w?.energy || 80), 0) / 4);
            const bar = '█'.repeat(Math.floor(deptAvg / 10)) + '░'.repeat(10 - Math.floor(deptAvg / 10));
            report += `${dept.icon} **${dept.name}** — ${bar} ${deptAvg}%\n`;
        }

        report += `\n💡 All departments are operating within healthy parameters. No reassignments needed at this time.`;
        return { response: report, type: 'ea-message', action: null };
    }

    _handleMeetingRequest(message) {
        const lower = message.toLowerCase();
        let targetDept = detectDepartment(message);
        let attendees = [];

        if (targetDept) {
            const dept = getDeptById(targetDept);
            attendees = [dept.manager, ...dept.workers];
        } else {
            // General meeting with all managers
            attendees = DEPARTMENTS.map(d => d.manager);
        }

        const meetingId = generateId('meet');
        const transcript = MeetingSimulator.generateTranscript(attendees, message, meetingId);

        store.dispatch({ type: 'ADD_MEETING', payload: transcript });
        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: {
                id: generateId('act'),
                time: Date.now(),
                type: 'meeting',
                icon: '🤝',
                text: `Meeting initiated: ${attendees.map(a => a.name).join(', ')}.`
            }
        });

        return {
            response: `Understood, Biniam. I've convened a meeting with **${attendees.map(a => a.name).join(', ')}**. The transcript is available in the **Meetings** panel. I've prepared an agenda based on your request and all participants are ready.`,
            type: 'ea-message',
            action: { type: 'open-meeting', meetingId }
        };
    }

    _simulateManagerAck(dept, manager, projectTitle, projectId) {
        const template = pickRandom(RESPONSE_TEMPLATES.manager.taskReceived);
        const ackText = fillTemplate(template, { count: Math.floor(Math.random() * 3) + 3 });

        store.dispatch({
            type: 'ADD_MESSAGE',
            payload: {
                id: generateId('msg'),
                from: manager.id,
                fromName: manager.name,
                content: `[Internal Broadcast from ${manager.name}]\n\n${ackText}`,
                timestamp: Date.now(),
                type: 'manager-ack',
                deptId: dept.id,
                projectId
            }
        });

        store.dispatch({
            type: 'ADD_ACTIVITY',
            payload: {
                id: generateId('act'),
                time: Date.now(),
                type: 'manager',
                icon: dept.icon,
                text: `${manager.name} acknowledged project "${projectTitle}" and is briefing their team.`
            }
        });

        // Simulate workers starting after additional delay
        setTimeout(() => {
            this._simulateWorkersStart(dept, projectTitle, projectId);
        }, 5000);
    }

    _simulateWorkersStart(dept, projectTitle, projectId) {
        for (const worker of dept.workers) {
            const template = pickRandom(RESPONSE_TEMPLATES.worker.taskStarted);
            const workerText = fillTemplate(template, { task: projectTitle, energy: worker.energy });
            store.dispatch({
                type: 'UPDATE_WORKER',
                payload: { id: worker.id, currentTaskId: projectId }
            });
            store.dispatch({
                type: 'ADD_ACTIVITY',
                payload: {
                    id: generateId('act'),
                    time: Date.now() + Math.random() * 2000,
                    type: 'worker',
                    icon: worker.avatar,
                    text: `${worker.name}: "${workerText.substring(0, 80)}"`
                }
            });
        }
        // Start progressing the project
        store.dispatch({
            type: 'UPDATE_PROJECT',
            payload: { id: projectId, status: 'in-progress', energy: 60 }
        });
    }
}

// ============================================================
// QA AI (SENTINEL)
// ============================================================
export class QAEngine {
    static review(projectOrOutput) {
        // Determine if we are reviewing a Project or an Execution Output
        const isProject = projectOrOutput.hasOwnProperty('progress');
        const passChance = isProject ? (projectOrOutput.progress >= 85 ? 0.85 : 0.45) : 0.70;
        const passed = Math.random() < passChance;

        if (passed) {
            if (isProject) {
                store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectOrOutput.id, status: 'completed', progress: 100 } });
                store.dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '🛡️', text: `SENTINEL approved "${projectOrOutput.title}" — project completed! ✅` }
                });
            } else {
                store.dispatch({ type: 'UPDATE_OUTPUT', payload: { id: projectOrOutput.id, qaStatus: 'approved' } });
                store.dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '🛡️', text: `SENTINEL approved artifact "${projectOrOutput.title}". ✅` }
                });
            }
            return { approved: true, feedback: pickRandom(RESPONSE_TEMPLATES.qa.approved) };
        } else {
            const issues = ['insufficient test coverage', 'UI inconsistencies detected', 'API response time exceeds threshold', 'missing error handling', 'documentation gaps', 'brand alignment drift'];
            const issue = pickRandom(issues);
            const msg = fillTemplate(pickRandom(RESPONSE_TEMPLATES.qa.revisionNeeded), { count: Math.floor(Math.random() * 3) + 1, manager: isProject ? 'the assigned manager' : 'the worker', issue, criteria: issue });

            if (isProject) {
                store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectOrOutput.id, status: 'revision-needed' } });
                store.dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '⚠️', text: `SENTINEL sent "${projectOrOutput.title}" back for revision: ${issue}.` }
                });
            } else {
                store.dispatch({ type: 'UPDATE_OUTPUT', payload: { id: projectOrOutput.id, qaStatus: 'rejected' } });
                store.dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '⚠️', text: `SENTINEL rejected artifact "${projectOrOutput.title}": ${issue}.` }
                });
            }

            store.dispatch({
                type: 'ADD_ALERT',
                payload: { id: generateId('alt'), type: 'danger', message: `QA Rejection: "${projectOrOutput.title}" failed validation. Reason: ${issue}`, time: Date.now() }
            });
            return { approved: false, feedback: msg };
        }
    }
}

// ============================================================
// Meeting Simulator
// ============================================================
export class MeetingSimulator {
    static generateTranscript(attendees, agenda, meetingId) {
        const now = new Date();
        const lines = [];
        const topics = this._generateTopics(agenda);

        lines.push({ speaker: 'ARIA', role: 'Executive Assistant AI', text: `Meeting called to order at ${now.toLocaleTimeString()}. Agenda: "${agenda}". Attendees: ${attendees.map(a => a.name).join(', ')}.` });

        for (const topic of topics) {
            const speaker = pickRandom([...attendees, { name: 'ARIA', role: 'Executive Assistant AI' }]);
            lines.push({ speaker: speaker.name, role: speaker.role, text: topic });
            if (Math.random() > 0.5 && attendees.length > 1) {
                const responder = pickRandom(attendees.filter(a => a.name !== speaker.name));
                if (responder) {
                    lines.push({ speaker: responder.name, role: responder.role, text: this._generateResponse(topic, responder) });
                }
            }
        }

        const actions = this._generateActionItems(attendees, agenda);
        lines.push({ speaker: 'ARIA', role: 'Executive Assistant AI', text: `Meeting summary complete. Action items recorded: ${actions.map(a => a.text).join(' | ')}. Meeting adjourned.` });

        return {
            id: meetingId,
            title: `Meeting: ${agenda.substring(0, 40)}`,
            date: now.toISOString(),
            attendees: attendees.map(a => ({ name: a.name, role: a.role })),
            transcript: lines,
            actionItems: actions,
            agenda
        };
    }

    static _generateTopics(agenda) {
        const lower = agenda.toLowerCase();
        const topics = [
            `I've reviewed current progress and believe we can accelerate by 15% if we parallelize the key deliverables.`,
            `One blocker I want to flag: we have a dependency that needs resolution before we can move forward on the main milestone.`,
            `My recommendation is to prioritize the core functionality first, then layer features in the next sprint.`,
            `Energy levels across the team are holding well, but I'd suggest reducing parallel tasks to maintain quality.`,
            `I can commit to having a detailed plan ready within the next session if we align on the core objectives today.`,
            `Cross-department coordination will be critical here — I suggest a shared visibility board for dependencies.`,
            `From a quality standpoint, we need at least one full review cycle built into the timeline.`,
        ];
        return topics.slice(0, Math.floor(Math.random() * 3) + 4);
    }

    static _generateResponse(topic, responder) {
        const responses = [
            `I agree with that assessment. From the ${responder.role.split(' ')[0]} perspective, we're aligned and ready to support.`,
            `Good point. I'll factor that into my team's workload adjustments immediately.`,
            `That matches what I'm seeing on my end as well. Let's formalize this as a decision.`,
            `I'd add that we should document this for future reference — it's a recurring pattern worth tracking.`,
            `Noted. I'll brief my workers on this direction after the meeting and implement accordingly.`,
        ];
        return pickRandom(responses);
    }

    static _generateActionItems(attendees, agenda) {
        const actions = [
            { owner: attendees[0]?.name || 'ARIA', text: 'Prepare detailed task breakdown and timeline.' },
            { owner: attendees[1]?.name || 'ARIA', text: 'Review dependencies and flag any blockers.' },
            { owner: 'ARIA', text: 'Compile meeting notes and distribute to CEO Biniam.' },
        ];
        if (attendees.length > 2) {
            actions.push({ owner: attendees[2]?.name, text: 'Begin initial execution phase on primary deliverable.' });
        }
        return actions;
    }
}

// ============================================================
// Autonomous Background Tick
// ============================================================
export function startAutonomousTick() {
    setInterval(() => {
        const state = store.state;

        // Progress active projects
        for (const project of state.projects) {
            if (project.status === 'in-progress' && project.progress < 98) {
                const boost = Math.random() * 4 + 1;
                const newProgress = Math.min(project.progress + boost, 98);
                store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, progress: Math.round(newProgress), energy: Math.min(project.energy + 2, 100) } });

                if (newProgress >= 95 && project.status === 'in-progress') {
                    store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, status: 'qa-review' } });
                    store.dispatch({
                        type: 'ADD_ACTIVITY',
                        payload: { id: generateId('act'), time: Date.now(), type: 'qa', icon: '🛡️', text: `"${project.title}" submitted to SENTINEL for QA review.` }
                    });
                }
            }

            // Auto-approve pending projects when dependencies are met
            if (project.status === 'pending' && project.dependencies.length > 0) {
                const allDepsComplete = project.dependencies.every(depId =>
                    state.projects.find(p => p.id === depId)?.status === 'completed'
                );
                if (allDepsComplete) {
                    store.dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, status: 'in-progress' } });
                    store.dispatch({
                        type: 'ADD_ACTIVITY',
                        payload: { id: generateId('act'), time: Date.now(), type: 'project', icon: '🚀', text: `"${project.title}" dependencies resolved — now in progress!` }
                    });
                }
            }
        }

        // Fluctuate worker energy slightly
        for (const [id, worker] of Object.entries(state.workers)) {
            const delta = (Math.random() - 0.4) * 3;
            const newEnergy = Math.max(55, Math.min(100, worker.energy + delta));
            store.dispatch({ type: 'UPDATE_WORKER', payload: { id, energy: Math.round(newEnergy) } });
        }

        store.dispatch({ type: 'TICK' });
    }, 10000); // every 10 seconds
}
