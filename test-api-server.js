const express = require('express');
const { storage } = require('./server/storage.js');

const app = express();
const port = 3001;

app.use(express.json());

// Test endpoint to fetch user images
app.get('/api/user-images/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    console.log(`Testing getUserImages for user ${userId}`);
    
    const images = await storage.getUserImages(userId);
    console.log(`Found ${images.length} images`);
    
    res.json(images);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});