import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: "prompt",
    includeAssets: ["icons/apple-touch-icon.png"],
    manifest: {
      id: "/",
      name: "Finanças",
      short_name: "Finanças",
      description: "Organize suas finanças, cartões e investimentos.",
      lang: "pt-BR",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#f8fafc",
      theme_color: "#0f172a",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
      // Only frontend routes receive the SPA fallback. API responses are never cached.
      navigateFallbackAllowlist: [/^\/$/, /^\/(dashboard|financas|checklist|planejamento-ganhos|categorias|estatisticas|comparativo|cartoes|investimentos|regras-percentuais|configuracoes|register|forgot-password|reset-password)\/?$/],
      cleanupOutdatedCaches: true,
    },
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
