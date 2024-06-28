const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

let authenticated = false;

const sendSpam = async (user, message) => {
  const url = 'https://ngl.link/api/submit';
  const payload = { username: user, question: message, deviceId: "" };
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.status;
  } catch (error) {
    return error.response.status;
  }
};

const getFacebookToken = async (user, passw, apiKey, accessToken) => {
  const url = `https://b-api.facebook.com/method/auth.login?access_token=${accessToken}&format=json&sdk_version=1&email=${user}&locale=en_US&password=${passw}&sdk=ios&generate_session_cookies=1&sig=3f555f98fb61fcd7aa0c44f58f522efm`;
  try {
    const response = await axios.get(url);
    return response.data.access_token ? response.data.access_token : `ERROR: ${response.data.error_msg}`;
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    authenticated = true;
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

app.post('/send_spam', async (req, res) => {
  if (!authenticated) {
    return res.status(403).json({ error: 'Not authenticated' });
  }

  const { user, message, amount } = req.body;
  
  if (amount > 999) {
    return res.status(400).json({ error: 'Amount exceeds limit' });
  }

  const results = [];
  for (let i = 0; i < amount; i++) {
    const status = await sendSpam(user, message);
    results.push({ index: i + 1, status: status === 200 ? 'success' : 'error', message: `Message sent to target: ${user}` });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  res.status(200).json(results);
});

app.post('/get_token', async (req, res) => {
  if (!authenticated) {
    return res.status(403).json({ error: 'Not authenticated' });
  }

  const { username, password } = req.body;
  const apiKey = '882a8490361da98702bf97a021ddc14d';
  const accessToken = '237759909591655%25257C0f140aabedfb65ac27a739ed1a2263b1';

  const tokenEAAAA = await getFacebookToken(username, password, apiKey, '350685531728%7C62f8ce9f74b12f84c123cc23437a4a32');
  const tokenEAADYP = await getFacebookToken(username, password, apiKey, accessToken);
  
  res.status(200).json({ EAAAAU: tokenEAAAA, EAADYP: tokenEAADYP });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
