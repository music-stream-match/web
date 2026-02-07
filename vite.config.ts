import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({mode}) => ({
    plugins: [react(), tailwindcss()],
    base: '/',
    esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        allowedHosts: ['localhost-vite.mobulum.xyz', 'music-stream-match.github.io', 'music-stream-match.space'],
    },
}))