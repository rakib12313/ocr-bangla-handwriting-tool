import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This is critical: it polyfills process.env.API_KEY so the SDK works in the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevents "process is not defined" errors for other libraries checking process.env
      'process.env': {}
    },
    server: {
      port: 3000
    }
  };
});