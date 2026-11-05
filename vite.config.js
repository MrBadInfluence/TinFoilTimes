import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Always use port 5173 — and if it's taken, STOP with an error instead
  // of quietly moving to 5174. Why so strict? The API's CORS rule only
  // lets in requests from http://localhost:5173. If Vite drifted to 5174
  // the page would load but every fetch would be blocked, and it would
  // look like the server was broken. Like a bouncer with a guest list:
  // better to be told "your usual table is taken" than to sit somewhere
  // the waiter never comes.
  server: {
    port: 5173,
    strictPort: true,
  },
})
