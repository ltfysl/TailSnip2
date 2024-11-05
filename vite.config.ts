import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
    plugins: [
        vue(),
        renderer({
            nodeIntegration: true,
        }),
    ],
    base: process.env.ELECTRON === 'true' ? './' : '/',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        }
    },
    optimizeDeps: {
        exclude: ['better-sqlite3']
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html')
            }
        }
    },
    server: {
        port: 5173
    },
    css: {
        postcss: {
            plugins: [
                tailwindcss,
                autoprefixer,
            ],
        },
    },
});
