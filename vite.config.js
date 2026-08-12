import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    VitePWA({

      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.js",
      /*
       * Kasutaja saab teate, kui rakenduse uus versioon
       * on saadaval.
       */
      registerType: "prompt",

      injectManifest: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"
        ]
      },

      /*
       * Lisab service worker'i registreerimise
       * automaatselt rakendusse.
       */
      /* injectRegister: "null", */

      /*
       * Need public-kausta failid lisatakse
       * service worker'i precache'i.
       */
      includeAssets: [
        "favicon.ico",
        "icon-16x16.png",
        "icon-32x32.png",
        "icon-48x48.png",
        "icon-64x64.png",
        "icon-180x180.png",
        "icon-maskable-512x512.png"
      ],

      manifest: {
        id: "/",
        name: "DuunHub",
        short_name: "DuunHub",

        description:
          "Leia töö või professionaalne teenusepakkuja enda lähedalt.",

        lang: "fi",

        start_url: "/",
        scope: "/",

        display: "standalone",

        background_color: "#ffffff",
        theme_color: "#2563eb",

        /*
         * Proovitakse kasutada standalone-režiimi.
         * Toetatud seadmetes võib kasutada ka
         * minimal-ui režiimi.
         */


        /* display_override: [
          "standalone",
          "minimal-ui"
        ], */

        orientation: "portrait-primary",

        

        categories: [
          "business",
          "productivity",
          "lifestyle"
        ],

        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            /*
             * Sama 512px ikooni kasutatakse ka
             * maskable-ikoonina.
             *
             * Kontrolli, et logo ümber oleks
             * piisavalt läbipaistvat ruumi.
             */
            src: "/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
        ]
      },

      /*
       * Võimaldab testida PWA-d ka npm run dev ajal.
       * Arenduses kasutab service worker tavaliselt
       * lihtsamat režiimi.
       */
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html"
      }
    }),



    vueDevTools(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3007',
        changeOrigin: true,
        // if your backend routes are '/users' (no /api), add:
        // rewrite: (p) => p.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
