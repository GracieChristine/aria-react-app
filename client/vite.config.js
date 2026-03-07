import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const serverPort = process.env.PORT ?? 5001

const proxy = {
  '/api': {
    target: `http://localhost:${serverPort}`,
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
})
