// Simple server with just the /api/config endpoint
const express = require('express');
const app = express();

app.get('/api/config', (req, res) => {
  console.log('Config endpoint hit');
  res.json({
    featureFlags: {
      newUI: true
    },
    openaiConfigured: true,
    stripeConfigured: true,
    maxUploadSize: 10 * 1024 * 1024 // 10MB
  });
});

// Add /api/health endpoint
app.get('/api/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ status: 'ok' });
});

// Add /api/credits/:id endpoint
app.get('/api/credits/:id', (req, res) => {
  console.log(`Credits endpoint hit for user ${req.params.id}`);
  res.json({
    credits: 5,
    paidCredits: 0,
    freeCreditsUsed: false
  });
});

// Add /api/user-credits/:id endpoint
app.get('/api/user-credits/:id', (req, res) => {
  console.log(`User credits endpoint hit for user ${req.params.id}`);
  res.json({
    credits: 5,
    paidCredits: 0,
    freeCreditsUsed: false
  });
});

// Fallback route
app.get('*', (req, res) => {
  res.send('Hello from test server');
});

const port = 5002;
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
});