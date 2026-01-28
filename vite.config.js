import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, existsSync } from 'fs';

// Copy config.yaml, data/, and assets/ into dist at build time,
// so scholars edit files at the project root (not inside public/).
function copyProjectData() {
  return {
    name: 'copy-project-data',
    closeBundle() {
      const root = resolve(import.meta.dirname);
      const outDir = resolve(root, 'dist');
      const filesToCopy = ['config.yaml'];
      const dirsToCopy = ['data', 'assets'];

      for (const file of filesToCopy) {
        const src = resolve(root, file);
        if (existsSync(src)) {
          cpSync(src, resolve(outDir, file));
        }
      }
      for (const dir of dirsToCopy) {
        const src = resolve(root, dir);
        if (existsSync(src)) {
          cpSync(src, resolve(outDir, dir), { recursive: true });
        }
      }
    },
  };
}

export default defineConfig({
  base: '/DHMarginalia/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  plugins: [copyProjectData()],
  assetsInclude: ['**/*.yaml', '**/*.yml', '**/*.csv'],
});
