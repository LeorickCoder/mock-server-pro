import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'mock-server-pro': resolve(__dirname, '../src')
    }
  },
  
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/dev-server.ts',
      exportName: 'app',
      tsCompiler: 'typescript',
      swcOptions: {}
    })
  ],
  
  server: {
    port: 3000,
    hmr: true,
    watch: {
      usePolling: true,
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  },
  
  optimizeDeps: {
    exclude: ['mock-server-pro']
  },
  
  build: {
    sourcemap: true,
    outDir: 'dist',
    minify: false
  },
  
  // 添加对 Node.js 内置模块的支持
  ssr: {
    // 关闭 SSR 预构建警告
    external: ['express', 'cors', 'body-parser', 'path', 'fs', 'url']
  }
}); 