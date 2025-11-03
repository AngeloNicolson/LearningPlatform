/**
 * @file vite-env.d.ts
 * @author Angelo Nicolson
 * @brief Vite environment type declarations
 * @description TypeScript type declarations for Vite-specific imports and environment variables. Provides type safety for Vite's import.meta and module imports.
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
