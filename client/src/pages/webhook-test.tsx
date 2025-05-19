import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function WebhookTestPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9');
  const [testPayload, setTestPayload] = useState(JSON.stringify({ 
    test: true,
    timestamp: new Date().toISOString(),
    client: 'ImageRefresh App'
  }, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [useCors, setUseCors] = useState(true);
  const [requestLogs, setRequestLogs] = useState<any[]>([]);

  const testWebhook = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = Date.now();
      
      // Log the attempt
      const newLog = {
        id: Date.now(),
        url: webhookUrl,
        payload: JSON.parse(testPayload),
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      setRequestLogs(prev => [newLog, ...prev]);
      
      // Attempt to send the request
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: testPayload,
        mode: useCors ? 'cors' : 'no-cors',
        credentials: 'include'
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // If we're using no-cors mode, we can't access the response
      if (!useCors) {
        toast({
          title: "Request sent in no-cors mode",
          description: "Cannot read response details in no-cors mode"
        });
        
        // Update the log
        setRequestLogs(prev => prev.map(log => 
          log.id === newLog.id 
            ? { 
                ...log, 
                status: 'sent-no-cors',
                responseTime
              } 
            : log
        ));
        
        return;
      }
      
      // Try to parse the response as JSON
      let responseData: any = null;
      let responseText = '';
      
      try {
        responseText = await response.text();
        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            // Not JSON, use text
            responseData = { text: responseText };
          }
        }
      } catch (e) {
        console.error('Error reading response:', e);
      }
      
      // Update the state
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
        responseTime
      });
      
      // Update the log
      setRequestLogs(prev => prev.map(log => 
        log.id === newLog.id 
          ? { 
              ...log, 
              status: response.ok ? 'success' : 'error',
              statusCode: response.status,
              statusText: response.statusText,
              response: responseData,
              responseTime
            } 
          : log
      ));
      
      // Show toast
      if (response.ok) {
        toast({
          title: "Success",
          description: `Webhook responded with status ${response.status}`
        });
      } else {
        toast({
          title: "Error",
          description: `Webhook responded with status ${response.status}: ${response.statusText}`,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Webhook test error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Update the log
      const existingLog = requestLogs[0];
      if (existingLog) {
        setRequestLogs(prev => prev.map(log => 
          log.id === existingLog.id 
            ? { 
                ...log, 
                status: 'exception',
                error: errorMessage
              } 
            : log
        ));
      }
      
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testFallback = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = Date.now();
      
      // Log the attempt
      const newLog = {
        id: Date.now(),
        url: '/api/test-webhook',
        payload: JSON.parse(testPayload),
        timestamp: new Date().toISOString(),
        status: 'pending',
        type: 'fallback'
      };
      
      setRequestLogs(prev => [newLog, ...prev]);
      
      // Attempt to send the request to the local fallback API
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: testPayload
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Try to parse the response as JSON
      let responseData: any = null;
      let responseText = '';
      
      try {
        responseText = await response.text();
        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            // Not JSON, use text
            responseData = { text: responseText };
          }
        }
      } catch (e) {
        console.error('Error reading response:', e);
      }
      
      // Update the log
      setRequestLogs(prev => prev.map(log => 
        log.id === newLog.id 
          ? { 
              ...log, 
              status: response.ok ? 'success' : 'error',
              statusCode: response.status,
              statusText: response.statusText,
              response: responseData,
              responseTime
            } 
          : log
      ));
      
      // Show toast
      if (response.ok) {
        toast({
          title: "Fallback Success",
          description: `Local API responded with status ${response.status}`
        });
      } else {
        toast({
          title: "Fallback Error",
          description: `Local API responded with status ${response.status}: ${response.statusText}`,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Local API test error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      toast({
        title: "Fallback Request Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">N8N Webhook Test Page</h1>
      <p className="mb-6 text-gray-600">
        Use this page to test the connection to the N8N webhook service and verify that CORS is properly configured.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Webhook Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Webhook URL</label>
              <Input 
                value={webhookUrl} 
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="Enter the N8N webhook URL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Test Payload (JSON)</label>
              <Textarea 
                value={testPayload} 
                onChange={e => setTestPayload(e.target.value)}
                placeholder="Enter JSON payload"
                rows={5}
              />
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox"
                id="use-cors"
                checked={useCors}
                onChange={e => setUseCors(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="use-cors" className="text-sm">
                Use CORS mode (enables reading response)
              </label>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={testWebhook} 
                disabled={isLoading}
              >
                {isLoading ? 'Testing...' : 'Test Webhook'}
              </Button>
              
              <Button 
                onClick={testFallback}
                disabled={isLoading}
                variant="outline"
              >
                Test Local Fallback
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Response Details</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
              <h3 className="font-bold">Error:</h3>
              <p>{error}</p>
            </div>
          )}
          
          {response && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-semibold">Status:</span> {response.status}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-semibold">Status Text:</span> {response.statusText}
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-semibold">Response Time:</span> {response.responseTime}ms
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mt-4 mb-2">Response Data:</h3>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-60">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mt-4 mb-2">Response Headers:</h3>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-60">
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {!response && !error && (
            <div className="text-gray-500 italic">
              Test the webhook to see response details
            </div>
          )}
        </Card>
      </div>
      
      <Card className="p-4 mt-6">
        <h2 className="text-xl font-semibold mb-4">Request History</h2>
        
        {requestLogs.length === 0 ? (
          <div className="text-gray-500 italic">No requests made yet</div>
        ) : (
          <div className="space-y-4">
            {requestLogs.map(log => (
              <div key={log.id} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'error' ? 'bg-red-100 text-red-800' :
                      log.status === 'exception' ? 'bg-red-100 text-red-800' :
                      log.status === 'sent-no-cors' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    } mr-2`}>
                      {log.type === 'fallback' ? 'FALLBACK' : 'WEBHOOK'}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'error' ? 'bg-red-100 text-red-800' :
                      log.status === 'exception' ? 'bg-red-100 text-red-800' :
                      log.status === 'sent-no-cors' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.status === 'success' ? 'SUCCESS' :
                       log.status === 'error' ? 'ERROR' :
                       log.status === 'exception' ? 'EXCEPTION' :
                       log.status === 'sent-no-cors' ? 'SENT (NO CORS)' :
                       'PENDING'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
                
                <div className="mt-2">
                  <div className="text-sm"><strong>URL:</strong> {log.url}</div>
                  {log.responseTime && (
                    <div className="text-sm"><strong>Response Time:</strong> {log.responseTime}ms</div>
                  )}
                  {(log.statusCode !== undefined) && (
                    <div className="text-sm"><strong>Status:</strong> {log.statusCode} {log.statusText}</div>
                  )}
                  {log.error && (
                    <div className="text-sm text-red-600"><strong>Error:</strong> {log.error}</div>
                  )}
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs font-semibold mb-1">Payload:</div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                  
                  {log.response && (
                    <div>
                      <div className="text-xs font-semibold mb-1">Response:</div>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}