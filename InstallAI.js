// --- Production-Ready Psychy AI Hardware & Model Installer ---
const { execSync, spawnSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const readline = require('readline');

// Model list with recommended RAM (GB) and CPU cores
const MODEL_LIST = [
  { key: 'mistral7b',   name: 'Mistral 7B Instruct',         ram: 8,  cpu: 4 },
  { key: 'llama7b',     name: 'Llama 2 7B Chat',            ram: 8,  cpu: 4 },
  { key: 'llama13b',    name: 'Llama 2 13B Chat',           ram: 16, cpu: 6 },
  { key: 'llama70b',    name: 'Llama 2 70B Chat',           ram: 32, cpu: 8 },
  { key: 'phi2',        name: 'Phi-2 (2.7B)',               ram: 4,  cpu: 2 },
  { key: 'tinyllama',   name: 'TinyLlama 1.1B',             ram: 3,  cpu: 2 },
  { key: 'openhermes',  name: 'OpenHermes 2.5 Mistral 7B',  ram: 8,  cpu: 4 },
  { key: 'noushermes',  name: 'Nous Hermes 2 Mistral 7B',   ram: 8,  cpu: 4 },
  { key: 'capybarah',   name: 'CapybaraHermes 2.5 Mistral', ram: 8,  cpu: 4 },
  { key: 'dolphin',     name: 'Dolphin 2.6 Mistral 7B',     ram: 8,  cpu: 4 },
  { key: 'westlake',    name: 'WestLake 7B v2',             ram: 8,  cpu: 4 },
  { key: 'tess',        name: 'Tess 10.7B v1.5b',           ram: 12, cpu: 6 },
  { key: 'codellama7',  name: 'CodeLlama 7B Instruct',      ram: 8,  cpu: 4 },
  { key: 'codellama13', name: 'CodeLlama 13B Instruct',     ram: 16, cpu: 6 },
  { key: 'stablecode',  name: 'Stable Code 3B',             ram: 6,  cpu: 2 },
  { key: 'phi2orange',  name: 'Phi-2 Orange (2.7B)',        ram: 4,  cpu: 2 },
  { key: 'tenyx',       name: 'TenyxChat 7B v1',            ram: 8,  cpu: 4 },
  { key: 'drsamantha',  name: 'Dr Samantha 7B',             ram: 8,  cpu: 4 },
  { key: 'phi3mini',    name: 'Phi-3 Mini (3.8B)',           ram: 6,  cpu: 2 },
];

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
  // Recommend models that fit user's RAM and CPU
  return MODEL_LIST.filter(m => hardware.ramGB >= m.ram && hardware.cores >= m.cpu);
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

function promptUser(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  console.log('Psychy AI Hardware & Model Installer');
  const hardware = detectHardware();
  console.log('Detected hardware:', hardware);
  const recommended = recommendModels(hardware);
  if (recommended.length === 0) {
    console.log('No models are recommended for your hardware.');
    return;
  }
  console.log('\nRecommended models for your system:');
  recommended.forEach(m => {
    console.log(`- ${m.name} (key: ${m.key}) | RAM: ${m.ram}GB | CPU: ${m.cpu}+ cores`);
  });
  const ans = await promptUser('\nDo you want to install all recommended models? (y/n): ');
  if (ans.trim().toLowerCase() === 'y') {
    if (ensureOllamaInstalled()) {
      installModels(recommended.map(m => m.key));
      console.log('All recommended models installed.');
    } else {
      console.error('Failed to install Ollama. Please install manually.');
      process.exit(1);
    }
  } else {
    console.log('\nYou can install any of the following models:');
    MODEL_LIST.forEach(m => {
      console.log(`- ${m.name} (key: ${m.key}) | RAM: ${m.ram}GB | CPU: ${m.cpu}+ cores`);
    });
    console.log('\nTo install a model, run: ollama pull <model-key>');
  }
}

if (require.main === module) {
  main();
}
// --- End of script ---
