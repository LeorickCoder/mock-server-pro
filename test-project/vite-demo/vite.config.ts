import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createMockMiddleware } from 'mock-server-pro'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'mock-server',
      configureServer(server) {
        server.middlewares.use(createMockMiddleware({
          base: {
            prefix: '/api',
            prefixConfig: {
              mode: 'auto',
              detectBasePath: true
            }
          },
          modules: {
            dir: path.resolve(__dirname, 'src/mocks'),
            pattern: '**/*.{js,ts}',
            recursive: true
          },
          typescript: {
            sourcemap: true
          }
        }))
      }
    }
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // 确保生成 sourcemap
  build: {
    sourcemap: true
  }
}) 