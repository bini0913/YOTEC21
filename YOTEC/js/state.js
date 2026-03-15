// ============================================================
// YOTEC — State Management
// ============================================================

import { SAMPLE_PROJECTS, DEPARTMENTS } from './data.js';

const STORAGE_KEY = 'yotec_state_v1';

function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { }
    return null;
}

function saveToStorage(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { }
}

function buildInitialWorkerStates() {
    const states = {};
    for (const dept of DEPARTMENTS) {
        states[dept.manager.id] = {
            ...dept.manager,
            deptId: dept.id,
            currentTaskId: null,
            taskQueue: [],
        };
        for (const worker of dept.workers) {
            states[worker.id] = {
                ...worker,
                deptId: dept.id,
                managerId: dept.manager.id,
                currentTaskId: null,
                taskQueue: [],
            };
        }
    }
    return states;
}

function buildInitialState() {
    return {
        projects: SAMPLE_PROJECTS.map(p => ({ ...p, subtasks: generateSubtasks(p), workerAssignments: [] })),
        messages: [],
        notifications: [],
        meetings: [],
        outputs: [], // Artifact repository
        alerts: [], // Deadline/QA warnings
        suggestions: [], // AI business proposals
        workers: buildInitialWorkerStates(),
        selectedPanel: 'dashboard',
        activeProject: null,
        activeMeeting: null,
        chatHistory: [
            {
                id: generateId('msg'),
                from: 'ea',
                fromName: 'ARIA',
                content: `Good morning, Biniam! YOTEC systems are fully operational. I'm currently tracking **${SAMPLE_PROJECTS.length} active projects** across all departments. Your team of **10 Manager AIs** and **30 Worker AIs** are at an average energy level of **86%**.\n\nHow can I assist you today? You can assign a new project, request a team meeting, or ask me for a status report on any department.`,
                timestamp: Date.now() - 60000,
                type: 'ea-message'
            }
        ],
        activityFeed: [],
        tick: 0
    };
}

function generateSubtasks(project) {
    const base = [
        { id: generateId('st'), title: 'Planning & Requirements', status: 'completed', progress: 100 },
        { id: generateId('st'), title: 'Core Implementation', status: project.progress > 40 ? 'in-progress' : 'pending', progress: Math.min(project.progress * 1.2, 100) },
        { id: generateId('st'), title: 'Testing & QA', status: project.progress > 80 ? 'in-progress' : 'pending', progress: project.progress > 80 ? 60 : 0 },
        { id: generateId('st'), title: 'Final Review & Delivery', status: project.status === 'completed' ? 'completed' : 'pending', progress: project.status === 'completed' ? 100 : 0 },
    ];
    return base;
}

// ---- Reactive Store ----
class Store {
    constructor() {
        const saved = loadFromStorage();
        this._state = saved || buildInitialState();
        if (!saved) this._addInitialActivity();
        this._listeners = [];
    }

    _addInitialActivity() {
        const feed = [
            { id: generateId('act'), time: Date.now() - 300000, type: 'project', icon: '✅', text: 'SENTINEL approved "Analytics Dashboard v3" — project marked complete.' },
            { id: generateId('act'), time: Date.now() - 180000, type: 'qa', icon: '🛡️', text: 'SENTINEL is reviewing "Q1 Growth Marketing Campaign" — awaiting sign-off.' },
            { id: generateId('act'), time: Date.now() - 90000, type: 'worker', icon: '💻', text: 'BYTE completed API integration milestone on "YOTEC Platform v2.0 Launch".' },
            { id: generateId('act'), time: Date.now() - 30000, type: 'manager', icon: '📊', text: 'ORACLE flagged a data anomaly — reassigning SAGE to investigate.' },
            { id: generateId('act'), time: Date.now(), type: 'system', icon: '🤖', text: 'ARIA online. All functional execution systems initialized.' }
        ];
        this._state.activityFeed = feed;

        this._state.alerts = [
            { id: generateId('alt'), type: 'warning', message: 'Project "AI Learning Module Suite" is trending behind sprint schedule.', time: Date.now() - 600000 }
        ];

        this._state.suggestions = [
            { id: generateId('sug'), title: 'Process Optimization', content: 'Our QA rejection rate for frontend modules is 12%. I suggest enforcing automated lint hooks prior to SENTINEL review.', by: 'FORGE (Ops)', energyImpact: '+5%' }
        ];

        this._state.outputs = [
            { id: generateId('out'), workerId: 'w-cnt-1', taskType: 'Copywriter AI', title: 'Q1 Launch Press Release', content: 'YOTEC sets a new standard for functional autonomous AI teams...', format: 'txt', timestamp: Date.now() - 7200000, qaStatus: 'approved' }
        ];
    }

    get state() {
        return this._state;
    }

    subscribe(listener) {
        this._listeners.push(listener);
        return () => { this._listeners = this._listeners.filter(l => l !== listener); };
    }

    _notify() {
        saveToStorage(this._state);
        for (const l of this._listeners) l(this._state);
    }

    dispatch(action) {
        this._state = reducer(this._state, action);
        this._notify();
    }

    getProject(id) {
        return this._state.projects.find(p => p.id === id);
    }

    getWorker(id) {
        return this._state.workers[id];
    }

    getDeptWorkers(deptId) {
        return Object.values(this._state.workers).filter(w => w.deptId === deptId && !w.role.includes('Manager'));
    }

    getDeptManager(deptId) {
        return Object.values(this._state.workers).find(w => w.deptId === deptId && w.id.startsWith('mgr-'));
    }
}

function reducer(state, action) {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return { ...state, chatHistory: [...state.chatHistory, action.payload] };

        case 'ADD_ACTIVITY':
            return { ...state, activityFeed: [action.payload, ...state.activityFeed].slice(0, 50) };

        case 'ADD_PROJECT': {
            const project = {
                id: action.payload.id || generateId('proj'),
                ...action.payload,
                subtasks: generateSubtasks(action.payload),
                workerAssignments: [],
                progress: 0,
                status: 'pending',
                energy: 50,
                dateStart: new Date().toISOString().split('T')[0],
                dateEnd: action.payload.dateEnd || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
            };
            return { ...state, projects: [...state.projects, project] };
        }

        case 'UPDATE_PROJECT': {
            const projects = state.projects.map(p =>
                p.id === action.payload.id ? { ...p, ...action.payload } : p
            );
            return { ...state, projects };
        }

        case 'UPDATE_WORKER': {
            const workers = { ...state.workers, [action.payload.id]: { ...state.workers[action.payload.id], ...action.payload } };
            return { ...state, workers };
        }

        case 'ADD_NOTIFICATION':
            return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 20) };

        case 'ADD_MEETING':
            return { ...state, meetings: [action.payload, ...state.meetings] };

        case 'ADD_OUTPUT':
            return { ...state, outputs: [action.payload, ...state.outputs] };

        case 'UPDATE_OUTPUT':
            const outputs = state.outputs.map(o => o.id === action.payload.id ? { ...o, ...action.payload } : o);
            return { ...state, outputs };

        case 'ADD_ALERT':
            return { ...state, alerts: [action.payload, ...state.alerts].slice(0, 10) };

        case 'ADD_SUGGESTION':
            return { ...state, suggestions: [action.payload, ...state.suggestions].slice(0, 5) };

        case 'SET_PANEL':
            return { ...state, selectedPanel: action.payload };

        case 'SET_ACTIVE_PROJECT':
            return { ...state, activeProject: action.payload };

        case 'TICK':
            return { ...state, tick: state.tick + 1 };

        case 'RESET':
            localStorage.removeItem(STORAGE_KEY);
            return buildInitialState();

        default:
            return state;
    }
}

export const store = new Store();
export { generateId };
