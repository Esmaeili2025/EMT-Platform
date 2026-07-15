import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Add global diagnostic handlers to capture and log any unhandled runtime exceptions
window.addEventListener('error', (event) => {
  if (!event.message) return;
  const msg = String(event.message).toLowerCase();
  // Filter out benign environment and dev server issues
  if (
    msg.includes("websocket") ||
    msg.includes("hmr") ||
    msg.includes("vite") ||
    msg.includes("extension") ||
    msg.includes("scrolling")
  ) {
    return;
  }
  console.error("=== GLOBAL ERROR CAPTURED ===");
  console.error("Message:", event.message);
  console.error("Source:", event.filename);
  console.error("Line:", event.lineno, "Column:", event.colno);
  console.error("Error Object:", event.error);
  if (event.error?.stack) {
    console.error("Stack Trace:\n", event.error.stack);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // Ignore empty/undefined rejection reasons or benign environment/hot-reloading/extension issues
  if (!event.reason) {
    return;
  }
  const reasonStr = String(event.reason.message || event.reason).toLowerCase();
  if (
    reasonStr.includes("vite") || 
    reasonStr.includes("websocket") || 
    reasonStr.includes("hmr") || 
    reasonStr.includes("extension") ||
    reasonStr.includes("scrolling")
  ) {
    console.warn("Benign unhandled rejection ignored:", event.reason);
    return;
  }

  console.error("=== UNHANDLED REJECTION CAPTURED ===");
  console.error("Reason:", event.reason);
  if (event.reason?.stack) {
    console.error("Stack Trace:\n", event.reason.stack);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


