import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function N8NTestPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState<'n8n' | 'local'>('n8n');

  const webhookUrl = 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9';
  const localUrl = '/api/test-webhook';

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);
    setResponse(null);
    setError(null);

    try {
      const url = testMode === 'n8n' ? webhookUrl : localUrl;
      console.log(`Testing connection to ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: 'N8N Test Page'
        }),
        ...(testMode === 'n8n' ? { mode: 'cors', credentials: 'include' } : {})
      });

      if (response.ok) {
        setResult('success');
        const data = await response.json();
        setResponse(data);
        
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${testMode === 'n8n' ? 'N8N webhook' : 'local API'}`
        });
      } else {
        setResult('error');
        setError(`HTTP error: ${response.status} ${response.statusText}`);
        
        toast({
          title: "Connection Failed",
          description: `Failed to connect to ${testMode === 'n8n' ? 'N8N webhook' : 'local API'}: ${response.status} ${response.statusText}`,
          variant: "destructive"
        });
      }
    } catch (err) {
      setResult('error');
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      
      toast({
        title: "Connection Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">N8N Webhook Connection Test</h1>
      <p className="mb-6 text-muted-foreground">
        Use this page to verify the connection between the Product Image Lab and the N8N webhook.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Card className="p-4 flex-1">
          <h2 className="text-xl font-semibold mb-4">Test Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button 
                variant={testMode === 'n8n' ? "default" : "outline"}
                onClick={() => setTestMode('n8n')}
              >
                Test N8N Webhook
              </Button>
              
              <Button 
                variant={testMode === 'local' ? "default" : "outline"} 
                onClick={() => setTestMode('local')}
              >
                Test Local API
              </Button>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {testMode === 'n8n' 
                  ? `Testing external N8N webhook: ${webhookUrl}` 
                  : `Testing local fallback API: ${localUrl}`}
              </p>
              
              <Button 
                onClick={testConnection} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Run Connection Test'}
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 flex-1">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {result === null && !error && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run Connection Test" to see results
            </div>
          )}
          
          {result === 'success' && (
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
                <h3 className="font-bold">✓ Connection Successful</h3>
                <p>Successfully connected to {testMode === 'n8n' ? 'N8N webhook' : 'local API'}</p>
              </div>
              
              {response && (
                <div>
                  <h3 className="font-semibold mt-4 mb-2">Response:</h3>
                  <pre className="bg-slate-50 p-3 rounded text-sm overflow-auto max-h-48">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {result === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              <h3 className="font-bold">✗ Connection Failed</h3>
              <p>{error}</p>
            </div>
          )}
        </Card>
      </div>
      
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">About N8N Integration</h2>
        <p className="mb-2">
          The Product Image Lab connects to an N8N webhook to process image transformations. 
          If the N8N webhook is not available, the app will automatically fall back to local processing.
        </p>
        <p className="text-sm text-muted-foreground">
          N8N Webhook URL: {webhookUrl}<br />
          Local Fallback URL: {localUrl}
        </p>
      </Card>
    </div>
  );
}