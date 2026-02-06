import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Electron desktop app - static build
// For Cloudflare deployment, switch to 'server' with cloudflare adapter
export default defineConfig({
    output: 'static',
    base: './',  // Relative paths for Electron file:// protocol
    integrations: [react()],
    vite: {
        ssr: {
            external: ['node:async_hooks']
        },
        build: {
            assetsDir: '_astro',
            rollupOptions: {
                output: {
                    assetFileNames: '_astro/[name].[hash][extname]',
                    chunkFileNames: '_astro/[name].[hash].js',
                    entryFileNames: '_astro/[name].[hash].js'
                }
            }
        }
    },
    build: {
        inlineStylesheets: 'auto',
        assets: '_astro'
    }
});
