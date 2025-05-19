"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// POST /api/chat - Send a message and get AI response (streaming or batch)
router.post('/', async (req, res) => {
    // TODO: Integrate with Ollama for LLM inference
    const { message, stream } = req.body;
    // For now, return a mock response
    if (stream) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });
        // Simulate streaming
        const tokens = [
            'This', ' is', ' a', ' streaming', ' response', ' from', ' Psychy', ' AI.'
        ];
        for (const token of tokens) {
            await new Promise(r => setTimeout(r, 200));
            res.write(`data: ${token}\n\n`);
        }
        res.write('data: [END]\n\n');
        res.end();
    }
    else {
        res.json({ reply: 'This is a batch response from Psychy AI.' });
    }
});
exports.default = router;
