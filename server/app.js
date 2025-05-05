const express = require('express');
const cors    = require('cors');
const bodyParser = require('body-parser');
const config  = require('config');
require('dotenv').config();
const authR   = require('./routes/auth');
const chatR   = require('./routes/chat');
const searchR = require('./routes/search');
const imageR  = require('./routes/image');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://psychypc.tail2c9bfb.ts.net'
  ],
  credentials: true
}));
app.use(bodyParser.json());

app.use('/api/auth', authR);
app.use('/api/chat', chatR);
app.use('/api/search', searchR);
app.use('/api/image', imageR);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
