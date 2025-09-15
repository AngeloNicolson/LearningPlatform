import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// WASM module loading - use any to avoid conflicts with existing types

// Initialize the app after WASM loads
function initApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Load the WASM module first
const script = document.createElement('script');
script.src = '/debate_platform.js';
script.onload = () => {
  // Wait for module to be ready
  if ((window as any).Module && typeof (window as any).Module === 'object') {
    (window as any).Module.onRuntimeInitialized = () => {
      console.log('Debate Platform WASM ready');
      initApp();
    };
  } else {
    // Set up the callback for when Module is defined
    let checkInterval = setInterval(() => {
      if ((window as any).Module) {
        clearInterval(checkInterval);
        (window as any).Module.onRuntimeInitialized = () => {
          console.log('Debate Platform WASM ready');
          initApp();
        };
      }
    }, 50);
  }
};
script.onerror = () => {
  console.error('Failed to load WASM module');
  // Load app anyway with error state
  initApp();
};
document.head.appendChild(script);