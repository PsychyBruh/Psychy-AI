// run-all.js
// Orchestrator script to launch Ollama, backend, and frontend for Psychy AI

// This script is designed to be run after the InstallAI.js script
// It assumes that Ollama is already installed and models are pulled
const { spawn } = require('child_process');
const path = require('path');

let runningProcs = [];
function startProcess(command, args, options = {}) {
  const proc = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
  runningProcs.push(proc);
  proc.on('close', code => {
    if (code !== 0) {
      console.error(`${command} exited with code ${code}`);
      process.exit(code);
    }
  });
  return proc;
}

function healthCheck(url, name, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      require('http').get(url, res => {
        if (res.statusCode === 200) {
          console.log(`${name} healthy at ${url}`);
          resolve();
        } else {
          retry();
        }
      }).on('error', () => retry());
    };
    function retry() {
      if (Date.now() - start > timeout) {
        reject(new Error(`${name} failed health check at ${url}`));
      } else {
        setTimeout(check, 1000);
      }
    }
    check();
  });
}

async function main() {
  console.log('Starting Psychy AI stack...');
  // Start Ollama (if not running)
  let ollamaProc;
  try {
    require('child_process').execSync('ollama --version', { stdio: 'ignore' });
    console.log('Ollama already installed.');
  } catch {
    console.error('Ollama is not installed. Please run InstallAI.js first.');
    process.exit(1);
  }
  try {
    require('child_process').execSync('ollama list', { stdio: 'ignore' });
    console.log('Ollama is running.');
  } catch {
    console.log('Starting Ollama...');
    ollamaProc = startProcess('ollama', ['serve']);
    await healthCheck('http://localhost:11434', 'Ollama', 30000);
  }
  // Start backend
  const backendProc = startProcess('npm', ['run', 'dev'], { cwd: path.join(__dirname, 'server') });
  backendProc.stdout && backendProc.stdout.on('data', data => process.stdout.write(`[backend] ${data}`));
  backendProc.stderr && backendProc.stderr.on('data', data => process.stderr.write(`[backend] ${data}`));
  backendProc.on('exit', code => {
    console.error(`Backend process exited with code ${code}`);
    process.exit(code || 1);
  });
  await healthCheck('http://localhost:3001/api/health', 'Backend', 60000);
  // Start frontend
  const frontendProc = startProcess('npm', ['run', 'dev'], { cwd: __dirname });
  frontendProc.stdout && frontendProc.stdout.on('data', data => process.stdout.write(`[frontend] ${data}`));
  frontendProc.stderr && frontendProc.stderr.on('data', data => process.stderr.write(`[frontend] ${data}`));
  frontendProc.on('exit', code => {
    console.error(`Frontend process exited with code ${code}`);
    process.exit(code || 1);
  });
  await healthCheck('http://localhost:3000', 'Frontend', 60000);
  console.log('All services started. Psychy AI is ready!');
  // Keep processes alive
  [ollamaProc, backendProc, frontendProc].forEach(proc => proc && proc.on('exit', () => process.exit(1)));
}

function shutdownAll() {
  console.log('\nShutting down all services...');
  runningProcs.forEach(proc => {
    if (proc && !proc.killed) {
      try { proc.kill('SIGTERM'); } catch {}
    }
  });
  process.exit(0);
}

process.on('SIGINT', shutdownAll);
process.on('SIGTERM', shutdownAll);
process.on('exit', shutdownAll);

if (require.main === module) {
  main();
}
// --- End of script ---
