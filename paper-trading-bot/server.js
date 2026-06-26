const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const DATA_FILE = path.join(__dirname, 'data.json');

const DEFAULT_STATE = {
  balance: 100.00,
  tradesCount: 0,
  wins: 0,
  losses: 0,
  history: []
};

function readState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Read error:', e.message);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function writeState(state) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Write error:', e.message);
    return false;
  }
}

// Get trade state from server
app.get('/api/state', (req, res) => {
  const state = readState();
  res.json(state);
});

// Save trade state to server
app.post('/api/state', (req, res) => {
  const ok = writeState(req.body);
  res.json({ ok: ok });
});

// Reset all trade data on server
app.post('/api/reset', (req, res) => {
  const ok = writeState(JSON.parse(JSON.stringify(DEFAULT_STATE)));
  res.json({ ok: ok });
});

// Health check (keeps Render free tier awake)
app.get('/api/ping', (req, res) => {
  res.json({ alive: true, time: new Date().toISOString() });
});

// Catch-all: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Create data file if missing, then start server
if (!fs.existsSync(DATA_FILE)) {
  writeState(JSON.parse(JSON.stringify(DEFAULT_STATE)));
}

app.listen(PORT, () => {
  console.log('Paper Trading Bot server running on port ' + PORT);
});