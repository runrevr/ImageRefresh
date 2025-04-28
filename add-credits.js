// Simple script to add credits to the user account (DEVELOPMENT MODE ONLY)
import fetch from 'node-fetch';

// Add a check to determine if we're in a development environment
// This is a simple check - in a real deployment you'd use environment variables
function isProductionEnvironment() {
  return process.env.NODE_ENV === 'production';
}

async function addCredits() {
  if (isProductionEnvironment()) {
    console.error('⚠️ This script should not be run in production environments!');
    console.error('⚠️ It is meant for development and testing purposes only.');
    process.exit(1);
    return;
  }

  try {
    const userId = 1; // Default user ID
    const response = await fetch(`http://localhost:5000/api/add-credits/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('✅ Credits added successfully for development/testing purposes.');
  } catch (error) {
    console.error('Error adding credits:', error);
  }
}

addCredits();