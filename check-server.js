// Script to check server status
import http from 'http';

const checkServer = () => {
  http.get('http://localhost:5000', res => {
    console.log('✅ Server is running at http://localhost:5000');
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers));
    
    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response length:', data.length);
      console.log('First 100 chars:', data.substring(0, 100));
    });
  }).on('error', err => {
    console.error('❌ Server check failed:', err.message);
  });
};

// Check immediately
checkServer();

// Check again after 5 seconds
setTimeout(checkServer, 5000);