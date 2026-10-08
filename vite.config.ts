import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const pureCatalogSchemaPlugin = {
  name: 'pure-catalog-schema',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    const normalizedId = id.replaceAll('\\', '/')

    if (!normalizedId.endsWith('/features/catalog/api/catalog.schemas.ts')) {
      return null
    }

    return { code, map: null, moduleSideEffects: false }
  },
}

export default defineConfig({
  plugins: [pureCatalogSchemaPlugin, react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'mocking',
              test: /node_modules[\\/](?:msw|@mswjs|@open-draft|headers-polyfill|is-node-process|outvariant|path-to-regexp|statuses|strict-event-emitter|until-async)[\\/]/,
            },
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
            },
            {
              name: 'tanstack-vendor',
              test: /node_modules[\\/]@tanstack[\\/]/,
            },
            {
              name: 'validation-vendor',
              test: /node_modules[\\/]zod[\\/]/,
            },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
