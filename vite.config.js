import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // '@' will point to the 'src' folder
      { find: '@', replacement: path.resolve(__dirname, 'src') }
    ],
  },
  server: {
    // optional: disable the overlay if you want
    hmr: {
      overlay: true
    }
  }
});


