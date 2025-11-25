import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Setting the third parameter to '' allows loading variables without the VITE_ prefix (like API_KEY).
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Secara paksa mengganti 'process.env.API_KEY' di dalam kode dengan nilai string dari Environment Vercel
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});