/**
 * @file main.tsx
 * @author Angelo Nicolson
 * @brief React application entry point
 * @description Main entry point for the DebateRank client application. Renders the root App component
 * in React StrictMode for development warnings and best practices enforcement. Mounts the application
 * to the DOM root element and imports global CSS styles.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)