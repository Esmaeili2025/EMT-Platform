import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Add global diagnostic handlers to capture and log any unhandled runtime exceptions
window.addEventListener('error', (event) => {
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


