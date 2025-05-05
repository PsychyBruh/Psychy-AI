const axios = require('axios');

async function runLlama(messages, onToken, opts = {}) {
  // Use llama-server's OpenAI-compatible endpoint with streaming
  const response = await axios({
    method: 'post',
    url: 'http://localhost:8080/v1/chat/completions',
    data: {
      model: 'mistral-7b-instruct-v0.1.Q5_0.gguf',
      messages, // pass the array directly
      stream: true,
      max_tokens: 512, // Increased for longer responses
      stop: ["<|im_end|>"]
    },
    responseType: 'stream'
  });

  // Stream the response chunks as they arrive
  return new Promise((resolve, reject) => {
    let full = '';
    response.data.on('data', chunk => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') return;
          try {
            const payload = JSON.parse(dataStr);
            const content = payload.choices?.[0]?.delta?.content || '';
            if (content) {
              full += content;
              onToken(content);
            }
          } catch (e) {}
        }
      }
    });
    response.data.on('end', () => resolve({ text: full, avgLogProb: 0 }));
    response.data.on('error', reject);
  });
}

module.exports = { runLlama };
