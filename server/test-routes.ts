// Test file to check routes
import express from 'express';
import { createServer } from 'http';
import { registerRoutes } from './routes';

async function testRoutes() {
  console.log('Testing payment history routes...');
  
  try {
    const app = express();
    const server = await registerRoutes(app);
    
    console.log('Routes registered successfully!');
    console.log('Server would be ready to listen on port 5000');
    
    // Don't actually start the server for testing
    // server.listen(5000, '0.0.0.0');
    
    // Instead, close it right away
    server.close();
    
    console.log('Test complete');
  } catch (error) {
    console.error('Error registering routes:', error);
  }
}

testRoutes().catch(err => console.error('Test failed:', err));
