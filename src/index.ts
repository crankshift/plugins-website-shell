// Layouts
export { default as BaseLayout } from './layouts/BaseLayout.astro'
export { default as PageShell } from './layouts/PageShell.astro'

// Components
export { default as Nav } from './components/Nav.astro'
export { default as Hero } from './components/Hero.astro'
export { default as Plugins } from './components/Plugins.astro'
export { default as PluginCard } from './components/PluginCard.astro'
export { default as Install } from './components/Install.astro'
export { default as Principles } from './components/Principles.astro'
export { default as Sources } from './components/Sources.astro'
export { default as Disclaimer } from './components/Disclaimer.astro'
export { default as Footer } from './components/Footer.astro'
export { default as CopyButton } from './components/CopyButton.astro'
export { default as BrandMark } from './components/BrandMark.astro'
export { default as RedirectShell } from './components/RedirectShell.astro'

// Helpers
export {
  getT,
  isLang,
  HREFLANG_PRESETS,
  OG_LOCALE_PRESETS,
  marketplaceSlugOf,
  marketplaceAddCommand,
  pluginInstallCommand,
  reloadCommand,
} from './i18n'

// Types
export type {
  ShellTranslation,
  Plugin,
  SiteConfig,
  LocaleSpec,
  Source,
} from './types'
