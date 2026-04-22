import type { SiteConfig } from 'claude-plugins-site/types'

export const PLAYGROUND_AGENTS_UA = [
  'claim-drafter',
  'response-drafter',
  'appeal-drafter',
] as const
export type PlaygroundUaAgent = (typeof PLAYGROUND_AGENTS_UA)[number]

export const PLAYGROUND_SKILLS_UA = [
  'fetching-zakon-rada',
  'citing-ukrainian-law',
] as const
export type PlaygroundUaSkill = (typeof PLAYGROUND_SKILLS_UA)[number]

export const PLAYGROUND_AGENTS_PL = [
  'claim-drafter',
  'response-drafter',
] as const
export type PlaygroundPlAgent = (typeof PLAYGROUND_AGENTS_PL)[number]

export const PLAYGROUND_SKILLS_PL = [
  'fetching-isap-sejm',
  'citing-polish-law',
] as const
export type PlaygroundPlSkill = (typeof PLAYGROUND_SKILLS_PL)[number]

export const PLUGIN_CODES = ['ua', 'pl'] as const
export type PluginCode = (typeof PLUGIN_CODES)[number]

export const LOCALE_CODES = ['en', 'ua', 'pl'] as const
export type LocaleCode = (typeof LOCALE_CODES)[number]

export const site: SiteConfig<PluginCode, LocaleCode> = {
  brand: 'playpowers',
  tagline: 'Playground sample data for claude-plugins-site shell development.',
  repo: 'crankshift/playpowers',
  url: 'https://example.test',
  defaultLocale: 'en',
  locales: [
    { code: 'en', hreflang: 'en', ogLocale: 'en_US', displayName: 'EN' },
    { code: 'ua', hreflang: 'uk', ogLocale: 'uk_UA', displayName: 'УКР' },
    { code: 'pl', hreflang: 'pl', ogLocale: 'pl_PL', displayName: 'PL' },
  ],
  plugins: [
    {
      code: 'ua',
      agents: PLAYGROUND_AGENTS_UA,
      skills: PLAYGROUND_SKILLS_UA,
      sources: [
        { name: 'zakon.rada.gov.ua', url: 'zakon.rada.gov.ua' },
        { name: 'ЄДРСР', url: 'reyestr.court.gov.ua' },
      ],
    },
    {
      code: 'pl',
      agents: PLAYGROUND_AGENTS_PL,
      skills: PLAYGROUND_SKILLS_PL,
      sources: [
        { name: 'ISAP Sejm', url: 'isap.sejm.gov.pl' },
        { name: 'Portal Orzeczeń', url: 'orzeczenia.ms.gov.pl' },
      ],
    },
  ],
}
