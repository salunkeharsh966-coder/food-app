import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_TARGET || 'http://localhost:4000';

  return {
    base: './',
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': { target, changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
  };
});
