/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_API_EXTERNAL_URL?: string
  readonly VITE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
