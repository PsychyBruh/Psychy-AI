# Emerald AI

Emerald AI is a local, privacy-focused AI chat platform that runs on your own hardware. It supports multiple open-source LLMs (like Mistral, Llama 2, TinyLlama, etc.), a modern web UI, and easy setup for Windows, Linux, and MacOS.

## Features
- Local LLM chat (no cloud required)
- Model auto-detection and guided install script (`InstallAI.js`)
- Modern Next.js/React frontend
- Node.js/Express backend
- User authentication (JWT)
- Dark/light mode
- Search and image routes
- One-command startup for the entire stack (`start-all.js`)
- Automatic llama.cpp server management
- Hugging Face model/token support
- .env-based configuration for secrets
- Hardware-aware token recommendation (auto-benchmarks your system)

## Quick Start

### 1. Clone the repo
```sh
git clone <your-repo-url>
cd Psychy\ AI
```

### 2. Install dependencies
```sh
cd server && npm install
cd ../client && npm install
npm install extract-zip # for InstallAI.js
```

### 3. Configure environment variables
Create a `.env` file in `server/` with:
```
OPENAI_API_KEY=your-openai-key
SERP_API_KEY=your-serpapi-key
JWT_SECRET=your-jwt-secret
DB_PATH=./emerald.db
```

### 4. Run the AI/model installer
```sh
node InstallAI.js
```
- Follow the prompts to select and download a model and the llama.cpp server binary for your OS.
- You will need a Hugging Face account/token for model downloads.
- The script will benchmark your hardware and recommend a max_tokens value for best performance.

### 5. Start the full stack
```sh
node start-all.js
```
- This will automatically start the llama server, backend, and frontend in order.
- The script will auto-detect your model in `llama-models/` and wait for the server to be ready before starting the backend and frontend.

- Backend: http://localhost:4000
- Frontend: http://localhost:3000

## Model Management
- Models are stored in `llama-models/` (ignored by git)
- To change models, re-run `node InstallAI.js`
- The system supports a wide range of GGUF models (see script for list)

## Notes
- Requires Node.js 18+, npm, and (for some models) a Hugging Face account/token.
- For Windows, Linux, and MacOS (auto-detects platform for llama.cpp binary).
- For best performance, use an SSD and as much RAM as possible.
- All binaries, DLLs, and models are ignored by git via `.gitignore`.

## Security & Config
- All secrets and API keys are loaded from `.env` (never hardcoded)
- Backend uses `dotenv` to load environment variables
- JWT authentication for user sessions

## Dropping the AI
If you want to remove the AI functionality, you can:
- Delete or ignore the `llama-models/` folder and all llama.cpp binaries in `server/utils/`.
- Remove or comment out AI-related code in the backend and frontend.
- The rest of the stack (Node.js backend, Next.js frontend, authentication, search, etc.) will continue to work.

## License
MIT
