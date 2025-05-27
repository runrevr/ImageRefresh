
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Wand2, Download } from 'lucide-react';

export default function CustomPromptsBeta() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!selectedFile || !prompt.trim()) {
      alert('Please select an image and enter a prompt');
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('prompt', prompt);

    try {
      const response = await fetch('/api/beta/custom-prompt-transform', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.resultId);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Transform error:', error);
      alert('An error occurred during transformation');
    } finally {
      setIsProcessing(false);
    }
  };

  const addPromptHelper = (text: string) => {
    setPrompt(prev => prev ? `${prev} ${text}` : text);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Custom AI Product Prompts (Beta)
          </h1>
          <p className="text-xl text-gray-600">
            Upload your product image and describe how you want it transformed
          </p>
        </div>

        <div className="grid gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Product Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {preview ? (
                    <div className="space-y-4">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="mx-auto max-h-64 rounded-lg"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview('');
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto w-12 h-12 text-gray-400" />
                      <div>
                        <p className="text-lg text-gray-600 mb-2">
                          Drag & drop your product image here
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-input"
                        />
                        <label htmlFor="file-input">
                          <Button variant="outline" className="cursor-pointer">
                            Select Image
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Section */}
          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Describe Your Transformation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: floating on white background with soft shadows and reflections"
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={500}
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addPromptHelper('on white background')}
                    >
                      + White Background
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addPromptHelper('with shadows and reflections')}
                    >
                      + Shadows
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addPromptHelper('floating product shot')}
                    >
                      + Floating
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addPromptHelper('lifestyle setting')}
                    >
                      + Lifestyle
                    </Button>
                  </div>

                  <Button 
                    onClick={handleTransform}
                    disabled={isProcessing || !prompt.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Transform Image
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Transformation Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-green-600 mb-4">
                    ✅ Transformation completed! Result ID: {result}
                  </p>
                  <p className="text-gray-600">
                    Your transformed image will be available shortly.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
