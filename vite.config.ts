// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname) },
      { find: '@components', replacement: resolve(__dirname, 'components') },
      { find: '@lib', replacement: resolve(__dirname, 'lib') }
    ]
  }
})