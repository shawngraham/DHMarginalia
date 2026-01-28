import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // Don't inline assets — sustainability: keep all assets local
  },
  publicDir: 'public',
  // Ensure YAML and CSV are served correctly in dev
  assetsInclude: ['**/*.yaml', '**/*.yml', '**/*.csv'],
});
