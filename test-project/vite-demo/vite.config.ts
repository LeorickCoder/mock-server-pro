import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createMockMiddleware, createMockServer } from 'mock-server-pro'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'mock-server',
      async configureServer(server) {
        // 创建独立的 mock 服务器
        const mockApp = await createMockServer({
          base: {
            prefix: '/api'
          },
          modules: {
            dir: path.resolve(__dirname, 'mock'),
            pattern: '**/*.{js,ts}',
            recursive: true,
            ignore: ['**/node_modules/**']
          },
          hotReload: {
            enabled: true,
            ignored: ['**/node_modules/**']
          },
        })
        // 将 mock 服务器作为中间件挂载到根路径
        server.middlewares.use(mockApp)
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // 确保生成 sourcemap
  build: {
    sourcemap: true
  }
}) 