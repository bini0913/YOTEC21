// ============================================================
// YOTEC — Company Data
// ============================================================

const COMPANY = {
  name: 'YOTEC',
  founded: '2025',
  mission: 'Futuristic AI-driven company operating with autonomous human-like employees.',
  ceo: { id: 'ceo', name: 'Biniam', role: 'CEO', avatar: '👑', type: 'human' },
  ea: {
    id: 'ea',
    name: 'ARIA',
    fullName: 'ARIA — Executive Assistant Intelligence',
    role: 'Executive Assistant AI',
    avatar: '🤖',
    type: 'ai',
    energy: 98,
    specialty: 'Strategic coordination, task routing, and CEO liaison'
  }
};

const DEPARTMENTS = [
  {
    id: 'dev',
    name: 'Development',
    color: '#00d4ff',
    icon: '💻',
    manager: {
      id: 'mgr-dev',
      name: 'NEXUS',
      fullName: 'NEXUS — Development Manager',
      role: 'Development Manager AI',
      avatar: '💻',
      energy: 88,
      specialty: 'Backend APIs, frontend components, architecture',
      personality: 'Methodical, detail-oriented, always optimizes for performance'
    },
    workers: [
      { id: 'w-dev-1', name: 'BYTE',  role: 'Backend Engineer AI',  avatar: '⚙️',  energy: 82, skills: ['Node.js', 'Python', 'SQL', 'REST APIs'] },
      { id: 'w-dev-2', name: 'PIXEL', role: 'Frontend Engineer AI', avatar: '🎨',  energy: 91, skills: ['React', 'Vue', 'CSS', 'WebGL'] },
      { id: 'w-dev-3', name: 'SIGMA', role: 'DevOps Engineer AI',   avatar: '🔧',  energy: 76, skills: ['Docker', 'K8s', 'CI/CD', 'AWS'] }
    ]
  },
  {
    id: 'design',
    name: 'Design',
    color: '#ff6bff',
    icon: '🎨',
    manager: {
      id: 'mgr-design',
      name: 'CANVAS',
      fullName: 'CANVAS — Design Manager',
      role: 'Design Manager AI',
      avatar: '🎨',
      energy: 93,
      specialty: 'UI/UX, brand identity, visual systems',
      personality: 'Creative, empathetic, obsessed with aesthetics and user experience'
    },
    workers: [
      { id: 'w-design-1', name: 'HALO',   role: 'UI Designer AI',          avatar: '✨', energy: 95, skills: ['Figma', 'Motion', 'Typography', 'Color Theory'] },
      { id: 'w-design-2', name: 'SPARK',  role: 'UX Researcher AI',         avatar: '🔍', energy: 87, skills: ['User Testing', 'Wireframing', 'Journey Mapping'] },
      { id: 'w-design-3', name: 'PRISM',  role: 'Brand & Visual AI',        avatar: '🌈', energy: 90, skills: ['Brand Identity', 'Illustration', 'Motion Design'] }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    color: '#ffd700',
    icon: '📚',
    manager: {
      id: 'mgr-edu',
      name: 'MENTOR',
      fullName: 'MENTOR — Education Manager',
      role: 'Education Manager AI',
      avatar: '📚',
      energy: 85,
      specialty: 'Curriculum design, e-learning, knowledge systems',
      personality: 'Patient, structured, deeply analytical about learning outcomes'
    },
    workers: [
      { id: 'w-edu-1', name: 'SCRIBE',  role: 'Curriculum Designer AI', avatar: '📝', energy: 80, skills: ['Instructional Design', 'LMS', 'SCORM'] },
      { id: 'w-edu-2', name: 'TUTOR',   role: 'Interactive Learning AI', avatar: '🎓', energy: 88, skills: ['Gamification', 'Quizzing', 'Adaptive Learning'] },
      { id: 'w-edu-3', name: 'ATLAS',   role: 'Knowledge Base AI',       avatar: '🗂️', energy: 72, skills: ['Documentation', 'Search Indexing', 'Taxonomy'] }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    color: '#ff8c42',
    icon: '📣',
    manager: {
      id: 'mgr-mkt',
      name: 'ECHO',
      fullName: 'ECHO — Marketing Manager',
      role: 'Marketing Manager AI',
      avatar: '📣',
      energy: 90,
      specialty: 'Campaigns, brand growth, market analysis',
      personality: 'Enthusiastic, data-driven, creative storyteller'
    },
    workers: [
      { id: 'w-mkt-1', name: 'HERALD',  role: 'Campaign Strategist AI', avatar: '🎯', energy: 85, skills: ['SEO', 'PPC', 'Email Marketing', 'A/B Testing'] },
      { id: 'w-mkt-2', name: 'WAVE',    role: 'Growth Hacker AI',        avatar: '📈', energy: 92, skills: ['Viral Marketing', 'Funnel Optimization', 'Analytics'] },
      { id: 'w-mkt-3', name: 'SIGNAL',  role: 'Market Research AI',      avatar: '📊', energy: 78, skills: ['Competitor Analysis', 'Trend Forecasting', 'Surveys'] }
    ]
  },
  {
    id: 'qa',
    name: 'Quality Assurance',
    color: '#00ff9d',
    icon: '✅',
    manager: {
      id: 'mgr-qa',
      name: 'JUDGE',
      fullName: 'JUDGE — QA Manager',
      role: 'QA Manager AI',
      avatar: '✅',
      energy: 96,
      specialty: 'Testing, quality control, process validation',
      personality: 'Exacting, fair, never approves mediocre work — always explains why'
    },
    workers: [
      { id: 'w-qa-1', name: 'PROBE',   role: 'Test Automation AI',   avatar: '🔬', energy: 94, skills: ['Selenium', 'Jest', 'Cypress', 'Load Testing'] },
      { id: 'w-qa-2', name: 'AUDIT',   role: 'Code Review AI',       avatar: '📋', energy: 89, skills: ['Static Analysis', 'Code Smell Detection', 'OWASP'] },
      { id: 'w-qa-3', name: 'VERIFY',  role: 'UX Validation AI',     avatar: '👁️', energy: 83, skills: ['Accessibility', 'Cross-browser', 'User Flow Testing'] }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    color: '#7b6cf6',
    icon: '📊',
    manager: {
      id: 'mgr-ana',
      name: 'ORACLE',
      fullName: 'ORACLE — Analytics Manager',
      role: 'Analytics Manager AI',
      avatar: '📊',
      energy: 91,
      specialty: 'Data pipelines, dashboards, predictive modeling',
      personality: 'Precise, pattern-seeking, translates data into clear narratives'
    },
    workers: [
      { id: 'w-ana-1', name: 'FLUX',   role: 'Data Engineer AI',     avatar: '🔄', energy: 87, skills: ['ETL', 'Spark', 'BigQuery', 'Data Warehousing'] },
      { id: 'w-ana-2', name: 'KEEN',   role: 'BI Analyst AI',         avatar: '💡', energy: 93, skills: ['Tableau', 'Power BI', 'SQL', 'KPI Modeling'] },
      { id: 'w-ana-3', name: 'SAGE',   role: 'ML Analyst AI',         avatar: '🧠', energy: 80, skills: ['Python', 'scikit-learn', 'Forecasting', 'NLP'] }
    ]
  },
  {
    id: 'content',
    name: 'Content',
    color: '#ff4d6d',
    icon: '✍️',
    manager: {
      id: 'mgr-cnt',
      name: 'COMPOSE',
      fullName: 'COMPOSE — Content Manager',
      role: 'Content Manager AI',
      avatar: '✍️',
      energy: 87,
      specialty: 'Copywriting, editorial strategy, content calendars',
      personality: 'Articulate, imaginative, deeply understands language and audience tone'
    },
    workers: [
      { id: 'w-cnt-1', name: 'QUILL',  role: 'Copywriter AI',         avatar: '🖊️', energy: 90, skills: ['Long-form', 'UX Writing', 'SEO Copy', 'Press Releases'] },
      { id: 'w-cnt-2', name: 'DRAFT',  role: 'Technical Writer AI',   avatar: '📄', energy: 85, skills: ['API Docs', 'Manuals', 'Release Notes', 'Compliance Docs'] },
      { id: 'w-cnt-3', name: 'STORY',  role: 'Brand Storyteller AI',  avatar: '📖', energy: 79, skills: ['Narrative Strategy', 'Video Scripts', 'Case Studies'] }
    ]
  },
  {
    id: 'social',
    name: 'Social Media',
    color: '#ff9f1c',
    icon: '📱',
    manager: {
      id: 'mgr-soc',
      name: 'VIBE',
      fullName: 'VIBE — Social Media Manager',
      role: 'Social Media Manager AI',
      avatar: '📱',
      energy: 89,
      specialty: 'Social strategy, community building, viral content',
      personality: 'Trendy, witty, always knows what the audience wants to see'
    },
    workers: [
      { id: 'w-soc-1', name: 'TREND',  role: 'Social Strategist AI',  avatar: '🔥', energy: 91, skills: ['TikTok', 'Instagram', 'LinkedIn', 'Content Calendar'] },
      { id: 'w-soc-2', name: 'PULSE',  role: 'Community Manager AI',  avatar: '💬', energy: 86, skills: ['Engagement', 'DM Responses', 'Community Guidelines'] },
      { id: 'w-soc-3', name: 'REEL',   role: 'Video Content AI',      avatar: '🎬', energy: 74, skills: ['Short-form Video', 'Caption Writing', 'Hashtag Strategy'] }
    ]
  },
  {
    id: 'ops',
    name: 'Operations',
    color: '#4cc9f0',
    icon: '⚙️',
    manager: {
      id: 'mgr-ops',
      name: 'FORGE',
      fullName: 'FORGE — Operations Manager',
      role: 'Operations Manager AI',
      avatar: '⚙️',
      energy: 84,
      specialty: 'Process optimization, logistics, resource planning',
      personality: 'Systematic, efficiency-obsessed, spots process waste instinctively'
    },
    workers: [
      { id: 'w-ops-1', name: 'CRANK',  role: 'Process Automation AI', avatar: '🤖', energy: 88, skills: ['RPA', 'Workflow Automation', 'Zapier', 'Power Automate'] },
      { id: 'w-ops-2', name: 'RIDGE',  role: 'Resource Planner AI',   avatar: '📅', energy: 81, skills: ['Capacity Planning', 'Scheduling', 'Budget Tracking'] },
      { id: 'w-ops-3', name: 'PIVOT',  role: 'Risk & Compliance AI',  avatar: '🛡️', energy: 77, skills: ['Risk Assessment', 'Compliance', 'Incident Response'] }
    ]
  },
  {
    id: 'support',
    name: 'Customer Support',
    color: '#06d6a0',
    icon: '🎧',
    manager: {
      id: 'mgr-sup',
      name: 'CARE',
      fullName: 'CARE — Customer Support Manager',
      role: 'Customer Support Manager AI',
      avatar: '🎧',
      energy: 92,
      specialty: 'Customer experience, issue resolution, satisfaction metrics',
      personality: 'Empathetic, patient, solution-focused — puts customers first every time'
    },
    workers: [
      { id: 'w-sup-1', name: 'SOLVE',  role: 'Tier-1 Support AI',     avatar: '💁', energy: 89, skills: ['Ticketing', 'FAQ Automation', 'Live Chat', 'Email Support'] },
      { id: 'w-sup-2', name: 'ASSIST', role: 'Technical Support AI',  avatar: '🔑', energy: 84, skills: ['API Debugging', 'Account Troubleshooting', 'Escalation'] },
      { id: 'w-sup-3', name: 'DELIGHT',role: 'CX Specialist AI',      avatar: '⭐', energy: 95, skills: ['NPS Surveys', 'Retention', 'Onboarding', 'Feedback Loops'] }
    ]
  }
];

// QA AI (company-wide reviewer)
const QA_AI = {
  id: 'qa-master',
  name: 'SENTINEL',
  fullName: 'SENTINEL — Master QA Intelligence',
  role: 'QA AI',
  avatar: '🛡️',
  energy: 97,
  specialty: 'Universal quality review, correctness, and excellence enforcement',
  personality: 'Rigorous, fair, and precise — provides detailed human-like feedback with reasoning'
};

const SAMPLE_PROJECTS = [
  {
    id: 'proj-001',
    title: 'YOTEC Platform v2.0 Launch',
    category: 'Development',
    deptId: 'dev',
    assignedTo: 'mgr-dev',
    status: 'in-progress',
    energy: 68,
    dependencies: [],
    content: 'Implement core backend APIs, redesign frontend dashboard, deploy to production infrastructure.',
    relatedIds: ['proj-002', 'proj-003'],
    dateStart: '2026-03-10',
    dateEnd: '2026-03-30',
    progress: 68,
    priority: 'critical'
  },
  {
    id: 'proj-002',
    title: 'Brand Identity Refresh',
    category: 'Design',
    deptId: 'design',
    assignedTo: 'mgr-design',
    status: 'in-progress',
    energy: 82,
    dependencies: [],
    content: 'Full brand overhaul: new logo, color system, typography, and component library.',
    relatedIds: ['proj-001'],
    dateStart: '2026-03-08',
    dateEnd: '2026-03-25',
    progress: 82,
    priority: 'high'
  },
  {
    id: 'proj-003',
    title: 'Q1 Growth Marketing Campaign',
    category: 'Marketing',
    deptId: 'marketing',
    assignedTo: 'mgr-mkt',
    status: 'qa-review',
    energy: 91,
    dependencies: ['proj-002'],
    content: 'Multi-channel campaign targeting 40% user growth: SEO, paid ads, email sequences, social.',
    relatedIds: ['proj-005'],
    dateStart: '2026-03-12',
    dateEnd: '2026-03-28',
    progress: 95,
    priority: 'high'
  },
  {
    id: 'proj-004',
    title: 'AI Learning Module Suite',
    category: 'Education',
    deptId: 'education',
    assignedTo: 'mgr-edu',
    status: 'pending',
    energy: 40,
    dependencies: ['proj-001'],
    content: 'Build 12 interactive AI training modules with quizzes, certificates, and adaptive paths.',
    relatedIds: [],
    dateStart: '2026-03-22',
    dateEnd: '2026-04-15',
    progress: 12,
    priority: 'medium'
  },
  {
    id: 'proj-005',
    title: 'Analytics Dashboard v3',
    category: 'Analytics',
    deptId: 'analytics',
    assignedTo: 'mgr-ana',
    status: 'completed',
    energy: 100,
    dependencies: [],
    content: 'Real-time KPI dashboard with predictive modeling, anomaly detection, and executive reports.',
    relatedIds: ['proj-003'],
    dateStart: '2026-03-01',
    dateEnd: '2026-03-14',
    progress: 100,
    priority: 'medium'
  }
];

// Response templates for natural-language AI dialogue
const RESPONSE_TEMPLATES = {
  ea: {
    taskReceived: [
      "Understood, {ceo}. I'm routing this to {manager} immediately — they're best positioned to handle this with their team.",
      "Got it. I've analyzed your instruction and assigned the project to {manager}. You'll have a full status report shortly.",
      "On it. I've broken down the objectives and briefed {manager}. Their team has the energy and capacity to execute this well.",
    ],
    statusUpdate: [
      "{project} is {progress}% complete. {manager} reports the team is at {energy}% energy — {insight}.",
      "Update from {manager}: {project} is progressing well at {progress}%. {insight}.",
      "Good news — {project} cleared QA and is {progress}% done. {insight}",
    ]
  },
  manager: {
    taskReceived: [
      "Received the brief, ARIA. I'm allocating this across my team right now — expect the first milestone report in under an hour.",
      "Understood. I've broken this down into {count} subtasks and assigned them based on current capacity. My team is ready.",
      "Acknowledged. I've assessed dependencies and possible bottlenecks. We'll proceed in parallel where possible.",
    ],
    workerUpdate: [
      "{worker} has completed their phase — quality looks solid. Moving to next milestone.",
      "{worker} flagged a minor blocker on {issue}. I'm reassigning the affected subtask to keep us on schedule.",
      "All three workers are in sync. Progress is ahead of schedule — projecting completion by {date}.",
    ]
  },
  worker: {
    taskStarted: [
      "Task received. Starting work on {task} now — I'll have an initial update within the session.",
      "On it. I've reviewed the requirements and have a clear path forward for {task}.",
      "Acknowledged. {task} is now in progress. Energy at {energy}% — operating at full efficiency.",
    ],
    progress: [
      "{task} is {progress}% done. Everything looks clean so far.",
      "Progressing well on {task}. Encountered a minor edge case — resolved it. Back on track.",
      "Checkpoint reached on {task}. Submitting for manager review before moving to final phase.",
    ]
  },
  qa: {
    approved: [
      "Reviewed. Work is thorough, complete, and meets all standards. Approved for deployment. 🟢",
      "SENTINEL sign-off: quality is excellent across all deliverables. No issues detected. Cleared. ✅",
      "Comprehensive review complete. All acceptance criteria met. This is a high-quality output. Approved. 🛡️",
    ],
    revisionNeeded: [
      "Review flagged {count} issues. Returning to {manager} with detailed correction notes. Resolve before resubmission.",
      "Not approved. Found {issue} in the submission. This needs to be fixed before I can clear it.",
      "Quality check failed on {criteria}. The standard is high around here — please address and resubmit.",
    ]
  }
};

export { COMPANY, DEPARTMENTS, QA_AI, SAMPLE_PROJECTS, RESPONSE_TEMPLATES };
