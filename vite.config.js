import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset URLs relative, so the same build works both at the
// project-pages URL (ologos-repos.github.io/ologos-co/) and at the apex custom
// domain (ologos.co/) once DNS is pointed — no base-path flip needed.
export default defineConfig({
  base: './',
  plugins: [react()],
})
