import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Global diagnostic safety net: Intercept Response.prototype.json to prevent cryptic
// "Unexpected token '<', '<!doctype' ... is not valid JSON" crashes.
// This occurs when a fetch request to /api receives Vite's HTML fallback (e.g. server starting, offline, or incorrect routing).
const originalJson = Response.prototype.json;
Response.prototype.json = async function () {
  try {
    const clone = this.clone();
    const text = await clone.text();
    if (text.trim().startsWith("<")) {
      console.warn("⚠️ HTML Response intercepted instead of JSON! URL:", this.url, "Status:", this.status);
      throw new SyntaxError(
        `پاسخ سرور نامعتبر است (دریافت HTML به جای اطلاعات JSON). این خطا معمولاً به دلیل قطع بودن موقت وب‌سرور، در حال راه‌اندازی بودن آن، یا اشتباه بودن آدرس API رخ می‌دهد. لطفاً چند لحظه دیگر تلاش کنید.`
      );
    }
  } catch (e) {
    // If cloning or reading text fails, let the original JSON handler handle it or throw
    if (e instanceof SyntaxError) throw e;
  }
  return originalJson.call(this);
};

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


