import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/' — required for real client-side routing (BrowserRouter): a route
// loaded directly at a nested path (e.g. ologos.co/ventures) needs assets
// resolved from the domain root, not relative to the current path segment.
// DNS is confirmed pointed at the apex custom domain (ologos.co is the sole
// canonical target per GH Pages settings), so the earlier dual-URL relative-
// base compatibility this replaced is no longer needed.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
