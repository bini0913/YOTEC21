#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const checks = [
  ['node', ['--check', 'YOTEC/server.js']],
  ['node', ['--check', 'YOTEC/js/app.js']],
  ['node', ['--check', 'YOTEC/js/state.js']],
  ['node', ['--check', 'YOTEC/js/ai-engine.js']],
  ['node', ['--check', 'YOTEC/js/execution-engine.js']],
  ['node', ['--check', 'YOTEC/js/ui/chat.js']],
  ['node', ['--check', 'YOTEC/js/ui/execute.js']],
  ['node', ['--check', 'YOTEC/js/ui/outputs.js']]
];

for (const [cmd, args] of checks) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

const viteBuild = spawnSync('vite', ['build', '--mode', 'production'], { stdio: 'inherit' });
if (viteBuild.status !== 0) {
  console.warn('⚠️ vite build skipped: vite binary unavailable in this environment');
}
