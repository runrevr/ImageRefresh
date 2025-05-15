// Simple server with just the /api/config endpoint
const express = require('express');
const app = express();

app.get('/api/config', (req, res) => {
  console.log('Config endpoint hit');
  res.json({
    someKey: "someValue",
    featureFlags: {
      newUI: true
    },
    openaiConfigured: true,
    stripeConfigured: true,
    maxUploadSize: 10 * 1024 * 1024 // 10MB
  });
});

// Fallback route
app.get('*', (req, res) => {
  res.send('Hello from test server');
});

const port = 5001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
});