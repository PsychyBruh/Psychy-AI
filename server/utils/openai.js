const OpenAI = require('openai');
const config = require('config');

const oa = new OpenAI({
  apiKey: config.get('openaiApiKey'),
});

async function chatCompletion(messages) {
  const res = await oa.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
  });
  return res.choices[0].message.content;
}

async function createImage(prompt) {
  const res = await oa.images.generate({
    prompt,
    n: 1,
    size: '512x512',
  });
  return res.data[0].url;
}

module.exports = { chatCompletion, createImage };
