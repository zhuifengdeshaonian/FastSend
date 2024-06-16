// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path'
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  modules: [
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    'nuxt-primevue',
    '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
    'nuxt-icon'
  ],

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
      link: [{ rel: 'icon', href: '/favicon.webp' }]
    }
  },

  site: {
    // url: 'http://localhost:3000',
    url: 'https://fastsync.ing',
    name: 'FastSync',
    // 一个基于WebRTC实现点对点快速目录同步和文件传输的工具站
    description:
      'A tool station based on WebRTC to achieve point-to-point fast directory synchronization and file transfer'
    // defaultLocale: 'zh'
  },

  i18n: {
    vueI18n: './i18n.config.ts',
    baseUrl: 'https://fastsync.ing',
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'zh', iso: 'zh-CN' }
    ],
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  ogImage: {
    enabled: false
  },

  primevue: {
    options: {
      unstyled: true,
      ripple: true
    },
    importPT: { from: path.resolve(__dirname, './presets/aura/') } // Import and apply preset
    // For Windows
    // importPT: { as: 'Aura', from: '~/presets/aura' }
  },

  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',

    workbox: {
      runtimeCaching: [
        {
          urlPattern: () => true,
          handler: 'NetworkOnly'
        }
      ]
    },

    manifest: {
      name: 'FastSync',
      short_name: 'FastSync',
      theme_color: '#ffffff',

      icons: [
        {
          src: '/favicon.webp',
          sizes: '512x512',
          type: 'image/webp',
          purpose: 'any'
        }
      ]
    }
  },

  nitro: {
    experimental: {
      websocket: true
    }
  }
})
