// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// El sitio se publica bajo /cv (Cloudflare Tunnel). En dev local se sirve en
// la raíz; el build de producción (deploy.sh) exporta ASTRO_BASE=/cv para
// generar todos los assets con el prefijo /cv/.
const base = process.env.ASTRO_BASE ?? ''

export default defineConfig({
  base,
  vite: {
    plugins: [tailwindcss()],
  },
})
