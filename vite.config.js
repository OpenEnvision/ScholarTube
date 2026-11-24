import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        // Keep the catalog, React, and the application code in separate hashed
        // files. The catalog changes with every weekly update while the other
        // two rarely do, so returning visitors only re-download the catalog and
        // the tiny entry file that points at it.
        codeSplitting: {
          groups: [
            { name: 'catalog', test: /[\\/]data[\\/]scholar_tube_resources\.json$/ },
            { name: 'react', test: /[\\/]node_modules[\\/]/ },
            // Everything under src/ except the main.jsx entry, which imports the catalog.
            { name: 'app', test: /[\\/]src[\\/](?:components[\\/]|App\.jsx$|icons\.jsx$|[\w-]+\.js$)/ },
          ],
        },
      },
    },
  },
})
