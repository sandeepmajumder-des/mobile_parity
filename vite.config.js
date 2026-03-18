import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const figmaToken = env.VITE_FIGMA_ACCESS_TOKEN

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/figma-api': {
          target: 'https://api.figma.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/figma-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (figmaToken) proxyReq.setHeader('X-Figma-Token', figmaToken)
            })
          },
        },
      },
    },
  }
})
