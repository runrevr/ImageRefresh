import React, { useState } from 'react';
import ProductImageLab from '../src/components/product-lab/product-image-lab';

const TestPage = () => {
  const [isLabVisible, setIsLabVisible] = useState(false);
  const [credits, setCredits] = useState(10);

  const handleCreditChange = (newCredits: number) => {
    console.log('Credits changed:', newCredits);
    setCredits(newCredits);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Image Lab Test</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex flex-col gap-4">
          <div>
            <p>Available Credits: <span className="font-bold">{credits}</span></p>
            <div className="flex gap-2 mt-2">
              <button 
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setCredits(prev => prev + 5)}
              >
                Add 5 Credits
              </button>
              <button 
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setCredits(10)}
              >
                Reset Credits
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => setIsLabVisible(!isLabVisible)}
            >
              {isLabVisible ? 'Hide Product Lab' : 'Show Product Lab'}
            </button>
          </div>
        </div>
      </div>
      
      <ProductImageLab 
        isVisible={isLabVisible}
        onClose={() => setIsLabVisible(false)}
        initialCredits={credits}
        onCreditChange={handleCreditChange}
        maxUploads={5}
      />
    </div>
  );
};

export default TestPage;