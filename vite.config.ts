import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Em desenvolvimento, as chamadas para /api são encaminhadas ao backend do agente.
// Ajuste o destino com VITE_PROXY_TARGET no arquivo .env.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
