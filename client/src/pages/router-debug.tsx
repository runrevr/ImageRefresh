import { useEffect, useState } from "react";
import { useLocation } from "wouter";

// Simple page to debug the router
export default function RouterDebug() {
  const [location] = useLocation();
  const [count, setCount] = useState(0);
  
  // Test updating the component
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "800px", 
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <h1 style={{ marginBottom: "20px" }}>Router Debug Page</h1>
      
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#f0f4f8", 
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <h2>Current Location</h2>
        <p><strong>Current path:</strong> {location}</p>
        <p><strong>Seconds on page:</strong> {count}</p>
      </div>
      
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        flexDirection: "column"
      }}>
        <h2>Test Navigation</h2>
        <a 
          href="/" 
          style={{
            display: "inline-block",
            padding: "10px 15px",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "500"
          }}
        >
          Go Home
        </a>
        
        <a 
          href="/product-enhancement-webhook" 
          style={{
            display: "inline-block",
            padding: "10px 15px",
            backgroundColor: "#8b5cf6",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "500"
          }}
        >
          Go to Product Enhancement Webhook
        </a>
        
        <a 
          href="/test-product-enhancement.html" 
          style={{
            display: "inline-block",
            padding: "10px 15px",
            backgroundColor: "#10b981",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "500"
          }}
        >
          Go to Test Page
        </a>
      </div>
    </div>
  );
}