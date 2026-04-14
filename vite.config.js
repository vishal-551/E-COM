import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@supabase/supabase-js': fileURLToPath(new URL('./src/vendor/supabase-js.js', import.meta.url)),
    },
  },
});
