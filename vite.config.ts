import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: [
        'makeqrr.ai.studio',
        'ais-dev-fizjlsr4zdd64dnu2uudzm-21131979277.asia-southeast1.run.app',
        'ais-pre-fizjlsr4zdd64dnu2uudzm-21131979277.asia-southeast1.run.app',
      ],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom/')) {
                return 'vendor-react';
              }
              if (id.includes('qr-code-styling') || id.includes('qrcode-generator') || id.includes('jsqr')) {
                return 'vendor-qr';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('canvas-confetti')) {
                return 'vendor-canvas';
              }
              if (id.includes('lenis')) {
                return 'vendor-scroll';
              }
            }
          }
        }
      }
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: [
        'makeqrr.ai.studio',
        'ais-dev-fizjlsr4zdd64dnu2uudzm-21131979277.asia-southeast1.run.app',
        'ais-pre-fizjlsr4zdd64dnu2uudzm-21131979277.asia-southeast1.run.app',
      ],
    },
  };
});
