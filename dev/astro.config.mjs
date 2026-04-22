// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://example.test',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ua', 'pl'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
})
