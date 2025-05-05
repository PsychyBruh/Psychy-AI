// InstallAI.js: Automated AI model and llama.cpp installer
const os = require('os');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const extract = require('extract-zip'); // npm install extract-zip
const { execSync, spawnSync } = require('child_process');

const MODELS = [
  {
    name: 'Mistral 7B Instruct',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q5_0.gguf'
  },
  {
    name: 'Llama 2 7B Chat',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q5_0.gguf'
  },
  {
    name: 'Llama 2 13B Chat',
    size: '13B',
    ram: 24,
    cpu: '16 cores',
    url: 'https://huggingface.co/TheBloke/Llama-2-13B-Chat-GGUF/resolve/main/llama-2-13b-chat.Q5_0.gguf'
  },
  {
    name: 'Llama 2 70B Chat',
    size: '70B',
    ram: 128,
    cpu: '32+ cores',
    url: 'https://huggingface.co/TheBloke/Llama-2-70B-Chat-GGUF/resolve/main/llama-2-70b-chat.Q5_0.gguf'
  },
  {
    name: 'Phi-2',
    size: '2.7B',
    ram: 5,
    cpu: '4 cores',
    url: 'https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q5_0.gguf'
  },
  {
    name: 'TinyLlama 1.1B',
    size: '1.1B',
    ram: 3,
    cpu: '2 cores',
    url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q5_0.gguf'
  },
  {
    name: 'OpenHermes 2.5 Mistral 7B',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/teknium/OpenHermes-2.5-Mistral-7B-GGUF/resolve/main/openhermes-2.5-mistral-7b.Q5_0.gguf'
  },
  {
    name: 'Nous Hermes 2 Mistral 7B',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/TheBloke/Nous-Hermes-2-Mistral-7B-DPO-GGUF/resolve/main/nous-hermes-2-mistral-7b-dpo.Q5_0.gguf'
  },
  {
    name: 'CapybaraHermes 2.5 Mistral 7B',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/TheBloke/CapybaraHermes-2.5-Mistral-7B-GGUF/resolve/main/capybara-hermes-2.5-mistral-7b.Q5_0.gguf'
  },
  {
    name: 'Dolphin 2.6 Mistral 7B',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/TheBloke/dolphin-2.6-mistral-7B-GGUF/resolve/main/dolphin-2.6-mistral-7b.Q5_0.gguf'
  },
  {
    name: 'WestLake 7B v2',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/TheBloke/WestLake-7B-v2-GGUF/resolve/main/westlake-7b-v2.Q5_0.gguf'
  },
  {
    name: 'Tess 10.7B v1.5b',
    size: '10.7B',
    ram: 18,
    cpu: '12 cores',
    url: 'https://huggingface.co/TheBloke/Tess-10.7B-v1.5b-GGUF/resolve/main/tess-10.7b-v1.5b.Q5_0.gguf'
  },
  {
    name: 'CodeLlama 7B Instruct',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/TheBloke/CodeLlama-7B-Instruct-GGUF/resolve/main/codellama-7b-instruct.Q5_0.gguf'
  },
  {
    name: 'CodeLlama 13B Instruct',
    size: '13B',
    ram: 24,
    cpu: '16 cores',
    url: 'https://huggingface.co/TheBloke/CodeLlama-13B-Instruct-GGUF/resolve/main/codellama-13b-instruct.Q5_0.gguf'
  },
  {
    name: 'Stable Code 3B',
    size: '3B',
    ram: 6,
    cpu: '4 cores',
    url: 'https://huggingface.co/TheBloke/stable-code-3b-GGUF/resolve/main/stable-code-3b.Q5_0.gguf'
  },
  {
    name: 'Phi-2 Orange',
    size: '2.7B',
    ram: 5,
    cpu: '4 cores',
    url: 'https://huggingface.co/TheBloke/phi-2-orange-GGUF/resolve/main/phi-2-orange.Q5_0.gguf'
  },
  {
    name: 'TenyxChat 7B v1',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/TheBloke/TenyxChat-7B-v1-GGUF/resolve/main/tenyxchat-7b-v1.Q5_0.gguf'
  },
  {
    name: 'Dr Samantha 7B',
    size: '7B',
    ram: 13,
    cpu: '8 cores',
    url: 'https://huggingface.co/TheBloke/Dr_Samantha-7B-GGUF/resolve/main/dr_samantha-7b.Q5_0.gguf'
  },
];

function getRecommendedModel() {
  const totalGB = Math.floor(os.totalmem() / 1024 / 1024 / 1024);
  for (let i = MODELS.length - 1; i >= 0; i--) {
    if (totalGB >= MODELS[i].ram) return MODELS[i];
  }
  return MODELS[0];
}

function promptUser(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
}

// Benchmark token speed
async function benchmarkTokens(llamaBin, modelPath) {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    const args = [
      '--model', modelPath,
      '--n-predict', '20',
      '--prompt', 'Hello, this is a quick benchmark.',
      '--log-disable',
      '--silent-prompt',
      '--port', '0'
    ];
    const start = Date.now();
    const proc = spawn(llamaBin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    proc.on('close', () => {
      const elapsed = (Date.now() - start) / 1000;
      const tokensPerSec = 20 / elapsed;
      resolve(tokensPerSec);
    });
  });
}

async function main() {
  console.log('=== Emerald AI Installer ===');
  const platform = os.platform();
  const arch = os.arch();
  const totalGB = Math.floor(os.totalmem() / 1024 / 1024 / 1024);
  console.log(`Detected OS: ${platform}, CPU: ${arch}, RAM: ${totalGB} GB`);

  // Prompt for Hugging Face token if not set
  let hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    hfToken = await promptUser('Enter your Hugging Face access token (https://huggingface.co/settings/tokens): ');
    if (!hfToken) {
      console.error('A Hugging Face token is required to download this model.');
      process.exit(1);
    }
  }

  // Check for existing model
  const modelDir = path.join(__dirname, 'llama-models');
  if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir);
  const existingModel = fs.readdirSync(modelDir).find(f => f.endsWith('.gguf'));
  let model;
  if (existingModel) {
    console.log(`Detected existing model: ${existingModel}`);
    const change = await promptUser('Would you like to change the model? (y/N): ');
    if (change.trim().toLowerCase() === 'y') {
      // Recommend model
      const rec = getRecommendedModel();
      console.log(`Recommended model: ${rec.name} (needs ~${rec.ram}GB RAM)`);
      let ans = await promptUser(`Install recommended model? (Y/n): `);
      model = rec;
      if (ans.trim().toLowerCase() === 'n') {
        console.log('Available models:');
        MODELS.forEach((m, i) => console.log(`${i + 1}. ${m.name} (${m.size}) - Recommended: ${m.ram}GB RAM, ${m.cpu}`));
        let idx = await promptUser('Choose model number: ');
        model = MODELS[parseInt(idx) - 1] || rec;
      }
    } else {
      model = MODELS.find(m => existingModel.includes(m.url.split('/').pop())) || getRecommendedModel();
      console.log(`Continuing with existing model: ${model.name}`);
    }
  } else {
    // Recommend model
    const rec = getRecommendedModel();
    console.log(`Recommended model: ${rec.name} (needs ~${rec.ram}GB RAM)`);
    let ans = await promptUser(`Install recommended model? (Y/n): `);
    model = rec;
    if (ans.trim().toLowerCase() === 'n') {
      console.log('Available models:');
      MODELS.forEach((m, i) => console.log(`${i + 1}. ${m.name} (${m.size}) - Recommended: ${m.ram}GB RAM, ${m.cpu}`));
      let idx = await promptUser('Choose model number: ');
      model = MODELS[parseInt(idx) - 1] || rec;
    }
  }

  // Download model if not present
  const modelPath = path.join(modelDir, model.url.split('/').pop());
  if (!fs.existsSync(modelPath)) {
    console.log(`Downloading ${model.name}...`);
    // Use curl for all platforms for progress bar and auth
    const dlCmd = `curl -L -H "Authorization: Bearer ${hfToken}" "${model.url}" -o "${modelPath}"`;
    try {
      execSync(dlCmd, { stdio: 'inherit' });
    } catch (e) {
      console.error('Model download failed.');
      process.exit(1);
    }
  } else {
    console.log('Model already exists.');
  }

  // Download llama.cpp binary (now distributed as a zip)
  let llamaBin, llamaUrl, zipName, binName;
  if (platform === 'win32') {
    llamaBin = 'llama_bin.exe';
    llamaUrl = 'https://github.com/ggml-org/llama.cpp/releases/latest/download/llama-b5287-bin-win-cpu-x64.zip';
    zipName = 'llama-b5287-bin-win-cpu-x64.zip';
    binName = 'llama-server.exe';
  } else if (platform === 'linux') {
    llamaBin = 'llama_bin';
    llamaUrl = 'https://github.com/ggml-org/llama.cpp/releases/latest/download/llama-b5287-bin-ubuntu-x64.zip';
    zipName = 'llama-b5287-bin-ubuntu-x64.zip';
    binName = 'llama-server';
  } else if (platform === 'darwin') {
    llamaBin = 'llama_bin';
    llamaUrl = 'https://github.com/ggml-org/llama.cpp/releases/latest/download/llama-b5287-bin-macos-x64.zip';
    zipName = 'llama-b5287-bin-macos-x64.zip';
    binName = 'llama-server';
  } else {
    console.error('Unsupported OS for auto-install.');
    process.exit(1);
  }
  const llamaDir = path.join(__dirname, 'server', 'utils');
  if (!fs.existsSync(llamaDir)) fs.mkdirSync(llamaDir, { recursive: true });
  const llamaPath = path.join(llamaDir, llamaBin);
  if (!fs.existsSync(llamaPath)) {
    console.log('Downloading llama.cpp server binary zip...');
    const zipPath = path.join(llamaDir, zipName);
    const dlCmd = `curl -L "${llamaUrl}" -o "${zipPath}"`;
    try {
      execSync(dlCmd, { stdio: 'inherit' });
      // Check zip file size (should be >100KB)
      const stat = fs.statSync(zipPath);
      if (stat.size < 100000) {
        console.error('Downloaded zip is too small. Possible GitHub rate limit, redirect, or bad URL.');
        console.error('Please check your internet connection or download the llama.cpp zip manually from:');
        console.error('https://github.com/ggml-org/llama.cpp/releases');
        process.exit(1);
      }
      // Extract the zip
      if (platform === 'win32') {
        await extract(zipPath, { dir: llamaDir });
        fs.renameSync(path.join(llamaDir, binName), llamaPath);
      } else {
        execSync(`unzip -o "${zipPath}" -d "${llamaDir}"`, { stdio: 'inherit' });
        fs.renameSync(path.join(llamaDir, binName), llamaPath);
        execSync(`chmod +x "${llamaPath}"`);
      }
      fs.unlinkSync(zipPath);
    } catch (e) {
      console.error('llama.cpp binary download or extraction failed.');
      process.exit(1);
    }
  } else {
    console.log('llama_bin already exists.');
  }

  // Benchmark token speed
  let tokensPerSec = 2; // fallback default
  try {
    tokensPerSec = await benchmarkTokens(llamaPath, modelPath);
    console.log(`\n[Benchmark] Your system can generate ~${tokensPerSec.toFixed(2)} tokens/sec with this model.`);
  } catch (e) {
    console.warn('Benchmark failed, using default token/sec.');
  }
  // Recommend max_tokens based on speed and RAM
  let maxTokens;
  if (tokensPerSec < 2) maxTokens = 192;
  else if (tokensPerSec < 5) maxTokens = 320;
  else maxTokens = 512;
  console.log(`[Recommendation] Set max_tokens to ${maxTokens} in your backend config for best balance of speed and completeness.\n`);

  // Check for cmake/g++ if building from source is needed
  if (!fs.existsSync(llamaPath)) {
    const ans = await promptUser('llama_bin not found. Build from source? (Y/n): ');
    if (ans.trim().toLowerCase() !== 'n') {
      if (platform === 'win32') {
        console.log('Please install CMake and a C++ compiler (e.g., MSVC/Build Tools) manually.');
      } else {
        try {
          execSync('cmake --version', { stdio: 'ignore' });
        } catch {
          console.log('CMake not found. Installing...');
          execSync('sudo apt update && sudo apt install -y cmake', { stdio: 'inherit' });
        }
        try {
          execSync('g++ --version', { stdio: 'ignore' });
        } catch {
          console.log('g++ not found. Installing...');
          execSync('sudo apt install -y build-essential', { stdio: 'inherit' });
        }
        // Clone and build llama.cpp
        const srcDir = path.join(__dirname, 'llama.cpp');
        if (!fs.existsSync(srcDir)) {
          execSync('git clone https://github.com/ggerganov/llama.cpp.git', { cwd: __dirname, stdio: 'inherit' });
        }
        execSync('cmake -B build', { cwd: srcDir, stdio: 'inherit' });
        execSync('cmake --build build --target server', { cwd: srcDir, stdio: 'inherit' });
        fs.copyFileSync(path.join(srcDir, 'build', 'bin', 'llama-server'), llamaPath);
        execSync(`chmod +x '${llamaPath}'`);
      }
    }
  }

  console.log('\n=== Setup Complete! ===');
  console.log(`Model: ${model.url.split('/').pop()} in llama-models/`);
  console.log(`llama_bin: ${llamaPath}`);
  console.log('You can now run your AI backend!');
}

main();
