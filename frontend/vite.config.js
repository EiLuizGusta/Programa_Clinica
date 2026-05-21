import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // expõe em 0.0.0.0 — acessível via IP externo/rede local
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000,
  },
});
