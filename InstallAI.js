// --- Production-Ready Psychy AI Hardware & Model Installer ---
const { execSync, spawnSync } = require('child_process');
const os = require('os');
const fs = require('fs');

function detectHardware() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  let gpu = 'Unknown';
  try {
    if (process.platform === 'win32') {
      const output = execSync('wmic path win32_VideoController get name', { encoding: 'utf8' });
      gpu = output.split('\n')[1]?.trim() || 'Unknown';
    } else if (process.platform === 'darwin') {
      const output = execSync('system_profiler SPDisplaysDataType | grep "Chipset Model"', { encoding: 'utf8' });
      gpu = output.split(':')[1]?.trim() || 'Unknown';
    } else {
      const output = execSync('lspci | grep VGA', { encoding: 'utf8' });
      gpu = output.split(':')[1]?.trim() || 'Unknown';
    }
  } catch {}
  return {
    cpu: cpus[0]?.model || 'Unknown',
    cores: cpus.length,
    ramGB: Math.round(totalMem / 1e9),
    gpu,
  };
}

function recommendModels(hardware) {
  const { ramGB } = hardware;
  if (ramGB >= 16) return ['llama3', 'mistral', 'phi3'];
  if (ramGB >= 8) return ['mistral', 'phi3'];
  return ['phi3'];
}

function ensureOllamaInstalled() {
  try {
    execSync('ollama --version', { stdio: 'ignore' });
    return true;
  } catch {
    console.log('Ollama not found. Installing...');
    try {
      if (process.platform === 'win32') {
        execSync('winget install Ollama.Ollama -h', { stdio: 'inherit' });
      } else if (process.platform === 'darwin') {
        execSync('brew install ollama', { stdio: 'inherit' });
      } else {
        execSync('curl -fsSL https://ollama.com/install.sh | sh', { stdio: 'inherit', shell: '/bin/bash' });
      }
      execSync('ollama --version', { stdio: 'ignore' });
      return true;
    } catch (e) {
      console.error('Failed to install Ollama:', e.message);
      return false;
    }
  }
}

function installModels(models) {
  for (const model of models) {
    try {
      console.log(`Installing model: ${model}`);
      execSync(`ollama pull ${model}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to install model ${model}:`, e.message);
    }
  }
}

function main() {
  console.log('Psychy AI Hardware & Model Installer');
  const hardware = detectHardware();
  console.log('Detected hardware:', hardware);
  const models = recommendModels(hardware);
  console.log('Recommended models:', models.join(', '));
  if (ensureOllamaInstalled()) {
    installModels(models);
    console.log('All recommended models installed.');
  } else {
    console.error('Failed to install Ollama. Please install manually.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
// --- End of script ---
