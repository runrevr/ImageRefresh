import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface WebhookTesterProps {
  webhookUrl: string;
  onResult?: (success: boolean, data: any) => void;
}

/**
 * WebhookTester component
 * A simple component to test webhook connectivity
 */
export default function WebhookTester({ webhookUrl, onResult }: WebhookTesterProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Test the webhook connection
  const testWebhook = async () => {
    try {
      setIsLoading(true);
      setLastError(null);
      
      console.log(`Testing webhook connection to: ${webhookUrl}`);
      
      // Prepare a simple test payload
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'WebhookTester Component'
      };
      
      // First try with JSON
      try {
        const jsonResponse = await fetch(`${webhookUrl}/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(testData),
          mode: 'cors'
        });
        
        if (jsonResponse.ok) {
          const data = await jsonResponse.json();
          console.log('JSON webhook test successful:', data);
          setLastResult(data);
          
          toast({
            title: "Webhook Test Successful",
            description: "Successfully connected to the webhook endpoint using JSON"
          });
          
          if (onResult) onResult(true, data);
          return;
        }
        
        console.log(`JSON test failed with status: ${jsonResponse.status}`);
      } catch (jsonError) {
        console.error('JSON webhook test failed:', jsonError);
      }
      
      // Try with FormData as a fallback
      try {
        const formData = new FormData();
        Object.entries(testData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        
        // Create a small test image (1x1 pixel transparent PNG)
        const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        const byteString = atob(base64Image);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        
        const testBlob = new Blob([uint8Array], { type: 'image/png' });
        formData.append('image', testBlob, 'test-image.png');
        formData.append('transformationType', 'test-transform');
        
        const formResponse = await fetch(`${webhookUrl}/test`, {
          method: 'POST',
          body: formData,
          mode: 'cors'
        });
        
        if (formResponse.ok) {
          try {
            const data = await formResponse.json();
            console.log('FormData webhook test successful:', data);
            setLastResult(data);
            
            toast({
              title: "Webhook Test Successful",
              description: "Successfully connected to the webhook endpoint using FormData"
            });
            
            if (onResult) onResult(true, data);
            return;
          } catch (parseError) {
            const text = await formResponse.text();
            console.log('FormData response (text):', text);
            setLastResult({ text });
            
            toast({
              title: "Webhook Response Received",
              description: "Received a non-JSON response from the webhook"
            });
            
            if (onResult) onResult(true, { text });
            return;
          }
        }
        
        console.log(`FormData test failed with status: ${formResponse.status}`);
        
        // If we got here, both tests failed but we received responses
        setLastError(`Webhook responded with error status: ${formResponse.status}`);
        
        toast({
          title: "Webhook Test Failed",
          description: `The webhook responded with error status: ${formResponse.status}`,
          variant: "destructive"
        });
        
        if (onResult) onResult(false, { status: formResponse.status });
      } catch (formError) {
        console.error('FormData webhook test failed:', formError);
        setLastError(`Connection error: ${formError instanceof Error ? formError.message : 'Unknown error'}`);
        
        toast({
          title: "Webhook Connection Error",
          description: formError instanceof Error ? formError.message : 'Unknown connection error',
          variant: "destructive"
        });
        
        if (onResult) onResult(false, { error: formError instanceof Error ? formError.message : 'Unknown error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 my-4">
      <h3 className="text-lg font-bold mb-2">Webhook Connection Tester</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test the connection to the N8N webhook endpoint: {webhookUrl}
      </p>
      
      <div className="flex gap-4 items-start">
        <Button onClick={testWebhook} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Webhook Connection'}
        </Button>
        
        {lastResult && (
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-600">Last Successful Response:</h4>
            <pre className="text-xs bg-gray-50 p-2 rounded mt-1 max-h-24 overflow-auto">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        )}
        
        {lastError && (
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-600">Last Error:</h4>
            <pre className="text-xs bg-red-50 p-2 rounded mt-1">
              {lastError}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}