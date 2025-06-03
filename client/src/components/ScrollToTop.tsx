
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Immediate scroll to top
    window.scrollTo(0, 0);
    
    // Also scroll to top after a brief delay to handle any async content loading
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    // Additional scroll on next frame to ensure it takes effect
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    
    return () => clearTimeout(timeoutId);
  }, [location]);
  
  // Also scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return null;
}
