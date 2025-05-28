import { createContext, ReactNode, useContext } from "react";

// Minimal auth context with NO imports
const TestAuthContext = createContext<any>(null);

export function TestAuthProvider({ children }: { children: ReactNode }) {
  console.log("✅ TestAuthProvider rendering");
  return (
    <TestAuthContext.Provider value={{ test: true }}>
      {children}
    </TestAuthContext.Provider>
  );
}

export function useTestAuth() {
  const context = useContext(TestAuthContext);
  if (!context) {
    throw new Error("useTestAuth must be used within TestAuthProvider");
  }
  return context;
}