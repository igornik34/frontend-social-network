import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
    return {
        plugins: [
            react(),
            basicSsl(),
            tailwindcss(),
        ],
        server: {
            port: 443,
            hmr: {
                protocol: 'wss', // Use WSS for HTTPS
                host: 'f.hs.fgis-saturn.ru', // Replace with your actual host
                port: 443, // Match the server port
            },
        },
        build: {
            rollupOptions: {
                onwarn(warning, warn) {
                    if (warning.message.includes('"/*#__PURE__*/"')) {
                        return
                    }
                    warn(warning)
                },
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) return id.toString().split('node_modules/')[1].split('/')[0].toString()
                    },
                }
            }
        },
    }
})