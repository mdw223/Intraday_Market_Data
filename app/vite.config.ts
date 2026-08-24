import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // expose the dev server to the network inside container
    watch: {
      usePolling: true, // use polling to watch for file changes
      interval: 500, // poll every 500ms
    },
    allowedHosts: true, // allow all hosts to access the dev server
  }
})
