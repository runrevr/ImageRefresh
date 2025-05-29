
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🟢 main.tsx - Starting React application");

// Check if root element exists
const rootElement = document.getElementById("root");
console.log("🟢 Root element found:", !!rootElement);
console.log("🟢 Root element:", rootElement);

if (!rootElement) {
  console.error("❌ Root element not found!");
  document.body.innerHTML = '<div style="padding: 50px; background: red; color: white; font-size: 24px;">ERROR: Root element not found</div>';
} else {
  try {
    console.log("🟢 Creating React root...");
    const root = createRoot(rootElement);
    console.log("🟢 React root created, rendering App...");
    root.render(<App />);
    console.log("🟢 App rendered successfully");
  } catch (error) {
    console.error("❌ Error rendering React app:", error);
    document.body.innerHTML = '<div style="padding: 50px; background: red; color: white; font-size: 24px;">ERROR: ' + error + '</div>';
  }
}
