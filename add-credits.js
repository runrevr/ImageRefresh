// Simple script to add 10 credits to the user account
import fetch from 'node-fetch';

async function addCredits() {
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
  } catch (error) {
    console.error('Error adding credits:', error);
  }
}

addCredits();