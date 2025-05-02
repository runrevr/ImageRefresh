import { useState, useEffect } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    fetch('/api/status')
      .then(response => response.json())
      .then(data => {
        setStatus(JSON.stringify(data, null, 2));
      })
      .catch(error => {
        setStatus(`Error: ${error.message}`);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Application Status Test Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre>{status}</pre>
      </div>
    </div>
  );
}