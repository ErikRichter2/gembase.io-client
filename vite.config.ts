import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
    return {
        publicDir: 'public',
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        build: {
            sourcemap: false,
            assetsDir: 'static/assets',
            rollupOptions: {
                output: {
                    manualChunks: {
                        vue_core: ['vue', 'pinia', 'vue-router'],
                        amcharts: ['@amcharts/amcharts5'],
                    },
                },
            },
        },
    }
})
