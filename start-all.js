const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function logPipe(proc, prefix) {
  proc.stdout.on('data', data => process.stdout.write(`[${prefix}] ${data}`));
  proc.stderr.on('data', data => process.stderr.write(`[${prefix} ERROR] ${data}`));
}

function waitForOutput(proc, match, cb) {
  let triggered = false;
  function handler(data) {
    if (!triggered && data.toString().includes(match)) {
      triggered = true;
      cb();
    }
  }
  proc.stdout.on('data', handler);
  proc.stderr.on('data', handler);
}

// Auto-detect llama_bin for platform
const llamaBin = process.platform === 'win32'
  ? path.join(__dirname, 'server', 'utils', 'llama_bin.exe')
  : path.join(__dirname, 'server', 'utils', 'llama_bin');

// Auto-detect first .gguf model
const modelDir = path.join(__dirname, 'llama-models');
const modelFile = fs.readdirSync(modelDir).find(f => f.endsWith('.gguf'));
if (!modelFile) {
  console.error('No .gguf model found in llama-models/. Please add a model first.');
  process.exit(1);
}
const modelPath = path.join(modelDir, modelFile);

const llamaArgs = [
  '--model', modelPath,
  '--port', '8080',
  '-v'
];
console.log('Starting llama server...');
const llama = spawn(llamaBin, llamaArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
logPipe(llama, 'llama');

waitForOutput(llama, 'main: server is listening on', () => {
  console.log('llama server ready. Starting backend...');
  const backend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'server'),
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  logPipe(backend, 'backend');
  waitForOutput(backend, 'Server listening', () => {
    console.log('Backend ready. Starting frontend...');
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'client'),
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    logPipe(frontend, 'frontend');
    // Graceful shutdown
    function shutdown() {
      llama.kill();
      backend.kill();
      frontend.kill();
      process.exit();
    }
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });
});
