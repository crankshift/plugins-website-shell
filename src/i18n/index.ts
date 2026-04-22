import type { LocaleSpec } from '../types'

export const HREFLANG_PRESETS = {
  en: 'en',
  ua: 'uk',
  pl: 'pl',
  de: 'de',
  fr: 'fr',
  es: 'es',
  it: 'it',
  pt: 'pt',
  ja: 'ja',
  zh: 'zh',
  ko: 'ko',
  ru: 'ru',
} as const

export const OG_LOCALE_PRESETS = {
  en: 'en_US',
  ua: 'uk_UA',
  pl: 'pl_PL',
  de: 'de_DE',
  fr: 'fr_FR',
  es: 'es_ES',
  it: 'it_IT',
  pt: 'pt_PT',
  ja: 'ja_JP',
  zh: 'zh_CN',
  ko: 'ko_KR',
  ru: 'ru_RU',
} as const

export function isLang<L extends string>(
  value: string | undefined,
  locales: readonly { code: L }[],
): value is L {
  if (value === undefined) return false
  return locales.some((l) => l.code === value)
}

export function getT<T>(lang: string, dicts: Record<string, T>): T {
  const dict = dicts[lang]
  if (!dict) throw new Error(`No dictionary for locale: ${lang}`)
  return dict
}

export function marketplaceSlugOf(repo: string): string {
  const parts = repo.split('/')
  return parts[parts.length - 1] ?? repo
}

export function marketplaceAddCommand(
  repo: string,
  override?: string,
): string {
  return override ?? `/plugin marketplace add ${repo}`
}

export function pluginInstallCommand(
  pluginCode: string,
  slug: string,
): string {
  return `/plugin install ${pluginCode}@${slug}`
}

export function reloadCommand(override?: string): string {
  return override ?? '/reload-plugins'
}

export type { LocaleSpec }
