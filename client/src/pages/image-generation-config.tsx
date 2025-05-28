import React from 'react';

// Simple component without any auth dependencies
const ImageGenerationConfigPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0'
    }}>
      <h1>Image Config Page (No Auth)</h1>
      <p>This is a test page without authentication.</p>
      <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
        Go to Home
      </a>
    </div>
  );
};

export default ImageGenerationConfigPage;