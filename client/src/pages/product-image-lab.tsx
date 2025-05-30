import React, { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCredits } from '@/hooks/useCredits'

export default function ProductImageLabPage() {
  const { data: userCredits } = useCredits();
  const freeCredits = userCredits?.freeCreditsUsed ? 0 : 1;
  const paidCredits = userCredits?.paidCredits || 0;

  // State management
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedIdeas, setSelectedIdeas] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [showIdeas, setShowIdeas] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const fileInputRef = useRef(null);
  const uploadAreaRef = useRef(null);

  // Sample product images for rotating display
  const productImages = [
    '/api/placeholder/800/400',
    '/api/placeholder/800/400',
    '/api/placeholder/800/400'
  ];

  // Handle file upload
  const handleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            file,
            url: e.target.result,
            name: file.name
          };
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    uploadAreaRef.current?.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    uploadAreaRef.current?.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    uploadAreaRef.current?.classList.remove('dragover');
    handleFileUpload(e.dataTransfer.files);
  };

  // Generate ideas for uploaded images
  const generateIdeas = async () => {
    if (uploadedImages.length === 0) return;
    
    setProcessing(true);
    
    // Simulate API call to generate enhancement ideas
    setTimeout(() => {
      const mockIdeas = [
        { id: 1, title: 'Remove Background', description: 'Clean white background', preview: '/api/placeholder/220/150' },
        { id: 2, title: 'Enhanced Lighting', description: 'Professional studio lighting', preview: '/api/placeholder/220/150' },
        { id: 3, title: 'Add Shadows', description: 'Natural drop shadows', preview: '/api/placeholder/220/150' },
        { id: 4, title: 'Color Enhancement', description: 'Vibrant colors', preview: '/api/placeholder/220/150' },
        { id: 5, title: 'Lifestyle Context', description: 'Real-world setting', preview: '/api/placeholder/220/150' }
      ];
      setIdeas(mockIdeas);
      setShowIdeas(true);
      setProcessing(false);
    }, 2000);
  };

  // Toggle idea selection
  const toggleIdea = (ideaId) => {
    const imageId = uploadedImages[currentImageIndex]?.id;
    if (!imageId) return;

    setSelectedIdeas(prev => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        [ideaId]: !prev[imageId]?.[ideaId]
      }
    }));
  };

  // Process selected ideas
  const processSelections = async () => {
    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
      alert('Processing complete! Check your My Images page for results.');
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-5 max-w-6xl">
          {/* Hero Section with Image Slider */}
          <div className="text-center py-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-4">
              Product Image Lab
            </h1>
            <h3 className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your product photos with AI-powered enhancements. Upload, enhance, and download professional-quality images in minutes.
            </h3>
            
            {/* Before/After Image Slider */}
            <div className="relative w-4/5 max-w-4xl mx-auto h-96 rounded-xl overflow-hidden shadow-lg mb-8">
              <div 
                className="absolute inset-0 bg-cover bg-center z-10"
                style={{ backgroundImage: `url(${productImages[0]})` }}
              />
              <div 
                className="absolute inset-0 bg-cover bg-center z-20"
                style={{ 
                  backgroundImage: `url(${productImages[1]})`,
                  clipPath: `inset(0 ${100-sliderPosition}% 0 0)`
                }}
              />
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white z-30 cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={(e) => {
                  const handleMouseMove = (e) => {
                    const rect = e.currentTarget.parentElement.getBoundingClientRect();
                    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
                    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                  }, { once: true });
                }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-3 border-teal-600 rounded-full" />
              </div>
            </div>
            
            <button 
              onClick={() => setActiveTab('upload')}
              className="bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Try It Now - Free
            </button>
          </div>

          {/* How It Works */}
          <div className="py-16 bg-white rounded-xl mb-8">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl text-blue-500 mb-4">📤</div>
                <h3 className="text-xl font-medium mb-2">Upload</h3>
                <p className="text-gray-600">Upload your product images (up to 5 images, max 10MB each)</p>
              </div>
              <div className="text-center">
                <div className="text-5xl text-blue-500 mb-4">✨</div>
                <h3 className="text-xl font-medium mb-2">Enhance</h3>
                <p className="text-gray-600">Select from AI-generated enhancement ideas</p>
              </div>
              <div className="text-center">
                <div className="text-5xl text-blue-500 mb-4">💾</div>
                <h3 className="text-xl font-medium mb-2">Download</h3>
                <p className="text-gray-600">Get your enhanced images in high resolution</p>
              </div>
            </div>
          </div>

          {/* Main Tool Interface */}
          <div className="bg-white rounded-xl shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-6 py-4 font-medium border-b-3 transition-colors ${
                    activeTab === 'upload' 
                      ? 'text-teal-600 border-teal-600' 
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Upload & Enhance
                </button>
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`px-6 py-4 font-medium border-b-3 transition-colors ${
                    activeTab === 'generate' 
                      ? 'text-teal-600 border-teal-600' 
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Generate Images
                </button>
              </nav>
            </div>

            {/* Upload Tab Content */}
            {activeTab === 'upload' && (
              <div className="p-8">
                {!showIdeas ? (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Upload Your Product Images</h2>
                    
                    {/* Upload Area */}
                    <div
                      ref={uploadAreaRef}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:border-blue-500 transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-5xl text-gray-400 mb-4">📁</div>
                      <p className="text-lg text-gray-600 mb-2">
                        Drag and drop your images here, or click to select files
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports JPG, PNG • Max 10MB per file • Up to 5 images
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </div>

                    {/* Uploaded Images */}
                    {uploadedImages.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Uploaded Images ({uploadedImages.length})</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                          {uploadedImages.map((image, index) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <button
                                  onClick={() => setUploadedImages(prev => prev.filter(img => img.id !== image.id))}
                                  className="text-white text-xl"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-center">
                          <button
                            onClick={generateIdeas}
                            disabled={processing}
                            className="bg-lime-400 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-lime-500 transition-colors disabled:opacity-50"
                          >
                            {processing ? 'Generating Ideas...' : 'Generate Enhancement Ideas'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Examples */}
                    <div className="mt-12">
                      <h3 className="text-lg font-medium mb-4">Example Transformations</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          'Background Removal',
                          'Enhanced Lighting', 
                          'Color Enhancement',
                          'Shadow Effects'
                        ].map((example, index) => (
                          <div key={index} className="relative group">
                            <div className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500 text-sm">{example}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Ideas Selection */
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Select Enhancement Ideas</h2>
                    
                    {/* Image Navigator */}
                    <div className="flex items-center mb-6">
                      <span className="text-lg font-medium">
                        Image {currentImageIndex + 1} of {uploadedImages.length}
                      </span>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                          disabled={currentImageIndex === 0}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(Math.min(uploadedImages.length - 1, currentImageIndex + 1))}
                          disabled={currentImageIndex === uploadedImages.length - 1}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50"
                        >
                          →
                        </button>
                      </div>
                    </div>

                    {/* Ideas Display */}
                    <div className="flex gap-8 mb-8">
                      {/* Original Image */}
                      <div className="w-80 h-80 rounded-lg overflow-hidden relative">
                        <img
                          src={uploadedImages[currentImageIndex]?.url}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                          Original
                        </div>
                      </div>

                      {/* Ideas Grid */}
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4">
                          {ideas.map((idea) => {
                            const imageId = uploadedImages[currentImageIndex]?.id;
                            const isSelected = selectedIdeas[imageId]?.[idea.id];
                            
                            return (
                              <div
                                key={idea.id}
                                className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                  isSelected ? 'border-lime-400' : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => toggleIdea(idea.id)}
                              >
                                <div className="h-36 bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url(${idea.preview})` }} />
                                <div className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-4 h-4 border-2 rounded ${isSelected ? 'bg-lime-400 border-lime-400' : 'border-gray-400'}`}>
                                      {isSelected && <span className="text-xs">✓</span>}
                                    </div>
                                    <h3 className="font-medium">{idea.title}</h3>
                                  </div>
                                  <p className="text-sm text-gray-600">{idea.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between">
                      <button
                        onClick={() => setShowIdeas(false)}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                      >
                        Back to Upload
                      </button>
                      <div className="flex gap-4">
                        <button
                          onClick={processSelections}
                          disabled={processing || Object.keys(selectedIdeas).length === 0}
                          className="bg-lime-400 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-lime-500 transition-colors disabled:opacity-50"
                        >
                          {processing ? 'Processing...' : 'Process Selected Ideas'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generate Tab Content */}
            {activeTab === 'generate' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">Generate Product Images</h2>
                <p className="text-gray-600 mb-4">Create new product images from text descriptions</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Description</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Describe the product you want to create..."
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Style</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>Professional Product Shot</option>
                        <option>Lifestyle Context</option>
                        <option>Minimalist Studio</option>
                        <option>Artistic/Creative</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Images</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>1 Image</option>
                        <option>2 Images</option>
                        <option>3 Images</option>
                        <option>4 Images</option>
                      </select>
                    </div>
                  </div>
                  
                  <button className="bg-lime-400 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-lime-500 transition-colors">
                    Generate Images
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}