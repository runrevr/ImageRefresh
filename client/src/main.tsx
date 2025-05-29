console.log("🟢 main.tsx - File loaded");
import { createRoot } from "react-dom/client";
console.log("🟢 main.tsx - After React import");
import App from "./App";
console.log("🟢 main.tsx - After App import");
import "./index.css";
console.log("🟢 main.tsx - About to render");
createRoot(document.getElementById("root")!).render(<App />);
console.log("🟢 main.tsx - Render called");