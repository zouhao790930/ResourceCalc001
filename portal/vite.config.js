import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ResourceCalc001/', // GitHub Pages needs this for proper asset paths
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
