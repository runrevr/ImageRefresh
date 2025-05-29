import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PricingPage from "@/pages/pricing";
import AuthPage from "@/pages/auth-page";
import IdeasPage from "@/pages/ideas-page";
import HelpPage from "@/pages/help";
import KidsDrawingPage from "@/pages/kids-drawing";
import AboutPage from "@/pages/about";
import ProductEnhancementPage from "@/pages/product-enhancement";
import ProductEnhancementWebhookPage from "@/pages/product-enhancement-webhook";
import ProductEnhancementDebugPage from "@/pages/product-enhancement-debug";
import ProductEnhancementWebhookSimplePage from "@/pages/product-enhancement-webhook-simple";
import ProductImageLabPage from "@/pages/product-image-lab";
import SimpleProductLabPage from "@/pages/simple-product-lab";
import ProductImageLabStaticPage from "@/pages/product-image-lab-static";
import ProductImageLabEnhancedPage from "@/pages/product-image-lab-enhanced";
import ProductImageFixedPage from "@/pages/product-image-fixed";
import FixedProductLabPage from "@/pages/fixed-product-lab";
import RouterDebugPage from "@/pages/router-debug";
import DemoPage from "@/pages/demo";
import FeaturesDemoPage from "@/pages/features-demo";
import ImageGenerationConfigPage from "@/pages/image-generation-config";
import TextToImageInputPage from "@/pages/text-to-image-input";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import DeviceFingerprint from "@/components/DeviceFingerprint";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import protected routes and account pages
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AccountPage from "@/pages/account";
import TransformationsPage from "@/pages/transformations";
import CheckoutPage from "@/pages/checkout";
import SubscribePage from "@/pages/subscribe";
import BuyCreditsPage from "@/pages/buy-credits";
import CheckoutDemoPage from "@/pages/checkout-demo";
import CheckoutFlowDemoPage from "@/pages/checkout-flow-demo";
import UploadPage from "@/pages/upload";
import UploadEnhancePage from "@/pages/upload-enhance";
import SelectIdeasPage from "@/pages/select-ideas";
import GenerateEnhancementsPage from "@/pages/generate-enhancements";
import ResultsPage from "@/pages/results";

function Router() {
  console.log("🚀 Router component rendering");

  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={() => (
          <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
            <h1>🎉 App is Working!</h1>
            <p>Router is functioning correctly</p>
            <p>Current path: {window.location.pathname}</p>
            <div style={{ marginTop: '20px' }}>
              <a href="/test-simple" style={{ padding: '10px', background: 'blue', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                Test Simple Route
              </a>
            </div>
          </div>
        )} />
        <Route path="/old-home" component={Home} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/ideas" component={IdeasPage} />
        <Route path="/help" component={HelpPage} />
        <Route path="/kids-drawing" component={KidsDrawingPage} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/upload-enhance" component={UploadEnhancePage} />
        <Route path="/select-ideas" component={SelectIdeasPage} />
        <Route
          path="/generate-enhancements"
          component={GenerateEnhancementsPage}
        />
        <Route path="/results" component={ResultsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/product-enhancement" component={ProductEnhancementPage} />
        <Route
          path="/product-enhancement-webhook"
          component={ProductEnhancementWebhookPage}
        />
        <Route
          path="/product-enhancement-webhook-simple"
          component={ProductEnhancementWebhookSimplePage}
        />
        <Route
          path="/product-enhancement-debug"
          component={ProductEnhancementDebugPage}
        />
        <Route path="/product-image-lab" component={ProductImageFixedPage} />
        <Route
          path="/product-image-lab-simple"
          component={SimpleProductLabPage}
        />
        <Route
          path="/product-image-lab-static"
          component={ProductImageLabStaticPage}
        />
        <Route
          path="/product-image-lab-complex"
          component={ProductImageLabPage}
        />
        <Route path="/fixed-product-lab" component={FixedProductLabPage} />
        <Route path="/features-demo" component={FeaturesDemoPage} />
        <Route path="/create-image" component={ImageGenerationConfigPage} />
        <Route path="/text-to-image" component={TextToImageInputPage} />
        <Route
          path="/webhook-test"
          component={() => {
            // This is a simpler way to import the component without TypeScript errors
            const WebhookTest = require("../pages/webhook-test").default;
            return <WebhookTest />;
          }}
        />
        <Route
          path="/n8n-test"
          component={() => {
            // Import the N8N test page
            const N8NTest = require("../pages/n8n-test").default;
            return <N8NTest />;
          }}
        />
        <Route path="/router-debug" component={RouterDebugPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/login">{() => <Redirect to="/auth?tab=login" />}</Route>
        <Route path="/register">{() => <Redirect to="/auth" />}</Route>
        <Route
          path="/account"
          component={() => <ProtectedRoute component={AccountPage} />}
        />
        <Route
          path="/transformations"
          component={() => <ProtectedRoute component={TransformationsPage} />}
        />
        <Route
          path="/checkout"
          component={() => <ProtectedRoute component={CheckoutPage} />}
        />
        <Route
          path="/subscribe"
          component={() => <ProtectedRoute component={SubscribePage} />}
        />
        <Route
          path="/buy-credits"
          component={() => <ProtectedRoute component={BuyCreditsPage} />}
        />
        <Route path="/checkout-demo" component={CheckoutDemoPage} />
        <Route path="/checkout-flow-demo" component={CheckoutFlowDemoPage} />
        <Route
          path="/test-simple"
          component={() => (
            <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
              <h1>✅ Simple Test Route Works!</h1>
              <p>
                <strong>Current URL:</strong> {window.location.pathname}
              </p>
              <p>
                <strong>Status:</strong> Wouter routing is working correctly
              </p>
              <div style={{ marginTop: "20px" }}>
                <a
                  href="/debug-routes"
                  style={{
                    marginRight: "10px",
                    padding: "10px 15px",
                    background: "#0066cc",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                  }}
                >
                  Try Debug Routes
                </a>
                <a
                  href="/text-to-image"
                  style={{
                    marginRight: "10px",
                    padding: "10px 15px",
                    background: "#00aa00",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                  }}
                >
                  Try Text to Image
                </a>
                <a
                  href="/create-image"
                  style={{
                    padding: "10px 15px",
                    background: "#aa0000",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                  }}
                >
                  Try Create Image
                </a>
              </div>
            </div>
          )}
        />
        <Route
          path="/debug-routes"
          component={() => (
            <div style={{ padding: "20px", fontFamily: "monospace" }}>
              <h1>Route Debug Info</h1>
              <p>
                <strong>Current URL:</strong> {window.location.pathname}
              </p>
              <p>
                <strong>Available Routes:</strong>
              </p>
              <ul>
                <li>/text-to-image - Text input page</li>
                <li>/create-image - Image generation config page</li>
                <li>/debug-routes - This debug page</li>
                <li>/test-simple - Simple test route</li>
              </ul>
              <div style={{ marginTop: "20px" }}>
                <a
                  href="/text-to-image"
                  style={{
                    marginRight: "10px",
                    padding: "5px 10px",
                    background: "#0066cc",
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  Test /text-to-image
                </a>
                <a
                  href="/create-image"
                  style={{
                    marginRight: "10px",
                    padding: "5px 10px",
                    background: "#00aa00",
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  Test /create-image
                </a>
                <a
                  href="/test-simple"
                  style={{
                    padding: "5px 10px",
                    background: "#aa0000",
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  Test /test-simple
                </a>
              </div>
            </div>
          )}
        />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  console.log("🚀 App component is rendering");

  return (
    <div style={{
      padding: '50px',
      backgroundColor: 'red',
      color: 'white',
      fontSize: '24px',
      minHeight: '100vh'
    }}>
      <h1>MINIMAL TEST - App Working</h1>
      <p>If you see this, React is working</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default App;
