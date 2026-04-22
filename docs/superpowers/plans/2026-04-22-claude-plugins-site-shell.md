# claude-plugins-site shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `claude-plugins-site` as an Astro source-only component library that exports layouts, components, types, i18n helpers, and CSS tokens so `lawpowers`, `businesspowers`, and future `*powers` repos can produce a landing page by supplying data only.

**Architecture:** Raw-source npm package (no build step). Consumer's Astro/Vite pipeline compiles the `.astro`/`.ts` files at build time. `peerDependencies: { astro: "^6.1.8" }`. Distribution: `file:` link in phase 1, npm publish in phase 2. Shell ships a `PageShell` layout with named slots for every section (default fallback = shell's own component); consumers override by providing slotted content. Design tokens live in `src/styles/global.css` as CSS custom properties.

**Tech Stack:** Astro 6.1.8, TypeScript 6.0.2, Node 22.12+, pnpm, CSS custom properties (oklch).

**Reference implementation:** Every component in this plan is a generalization of a corresponding file in `/Users/yurii/Projects/lawpowers/site/src/`. When a task says "port from lawpowers X.astro," start by copying that file verbatim, then apply the listed transformations. Styling (`<style>` blocks) is preserved verbatim — the design is already done; we are only changing the data plumbing.

**Verification discipline:** There is no unit-test framework in v1. Per-task verification is (a) `pnpm --filter dev check` passes (TypeScript + astro), (b) `pnpm --filter dev build` succeeds, (c) manual visual spot-check in the dev playground when rendering changes.

**Commits:** One commit per task. Conventional commit prefix: `feat:` for new files, `refactor:` for ports, `chore:` for config/tooling.

---

## File map

```
claude-plugins-site/
  .gitignore                        T1
  package.json                      T1, T20
  pnpm-workspace.yaml               T1
  tsconfig.json                     T1
  README.md                         T21
  src/
    index.ts                        T20
    types.ts                        T2
    i18n/
      index.ts                      T3
    styles/
      global.css                    T4
    layouts/
      BaseLayout.astro              T6
      PageShell.astro               T18
    components/
      CopyButton.astro              T7
      BrandMark.astro               T8
      Nav.astro                     T9
      Hero.astro                    T10
      PluginCard.astro              T11
      Plugins.astro                 T12
      Install.astro                 T13
      Principles.astro              T14
      Sources.astro                 T15
      Disclaimer.astro              T16
      Footer.astro                  T17
      RedirectShell.astro           T19
  dev/
    .gitignore                      T5
    package.json                    T5
    astro.config.mjs                T5
    tsconfig.json                   T5
    public/og.png                   T5
    src/
      config.ts                     T5
      locales/
        en.ts                       T5
        ua.ts                       T5
        pl.ts                       T5
      pages/
        index.astro                 T19
        [locale]/
          index.astro               T6, T20
```

---

## Task 1: Repo skeleton (package.json, workspace, tsconfig, .gitignore)

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "claude-plugins-site",
  "type": "module",
  "version": "0.1.0",
  "description": "Generic Astro shell for Claude Code plugin landing pages (lawpowers, businesspowers, …).",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/crankshift/claude-plugins-site.git"
  },
  "engines": {
    "node": ">=22.12.0"
  },
  "files": [
    "src",
    "README.md",
    "LICENSE"
  ],
  "exports": {
    ".": "./src/index.ts",
    "./i18n": "./src/i18n/index.ts",
    "./types": "./src/types.ts",
    "./styles/global.css": "./src/styles/global.css",
    "./components/*": "./src/components/*",
    "./layouts/*": "./src/layouts/*"
  },
  "peerDependencies": {
    "astro": "^6.1.8"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.8",
    "astro": "^6.1.8",
    "typescript": "~6.0.2"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild",
      "sharp"
    ]
  }
}
```

- [ ] **Step 2: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - '.'
  - 'dev'
```

This lets `pnpm --filter dev <cmd>` target the dev playground.

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src/**/*"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {}
  }
}
```

- [ ] **Step 4: Write `.gitignore`**

```
node_modules
dist
.astro
.firebase
.DS_Store
*.log
```

- [ ] **Step 5: Install dependencies**

Run: `pnpm install`

Expected: creates `node_modules/` and `pnpm-lock.yaml` without error.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.json .gitignore pnpm-lock.yaml
git commit -m "chore: initial package, workspace, tsconfig, gitignore"
```

---

## Task 2: Types (`src/types.ts`)

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Write the file**

```ts
export interface LocaleSpec {
  /** URL path segment, e.g. 'en', 'ua', 'pl'. */
  code: string
  /** ISO 639-1 for hreflang + <html lang>. e.g. 'uk' for Ukrainian. */
  hreflang: string
  /** Open Graph locale, e.g. 'uk_UA'. */
  ogLocale: string
  /** Native name for the language switcher, e.g. 'EN', 'УКР', 'PL'. */
  displayName: string
}

export interface Source {
  name: string
  url: string
}

export interface Plugin<
  Code extends string = string,
  Agent extends string = string,
  Skill extends string = string,
> {
  /** Command prefix + URL fragment. e.g. 'ua', 'pl'. */
  code: Code
  agents: readonly Agent[]
  skills: readonly Skill[]
  sources: readonly Source[]
  /**
   * Optional flag / logo. Astro component or raw HTML snippet rendered via set:html.
   * Left unknown on purpose — consumers pass whatever Astro accepts and the
   * PluginCard renders it as-is. If omitted, PluginCard skips the flag slot.
   */
  flag?: unknown
}

export interface SiteConfig<
  Codes extends string = string,
  Locales extends string = string,
> {
  /** Brand name, e.g. 'lawpowers'. Used in title, OG, footer, JSON-LD. */
  brand: string
  /** Short tagline (hero / footer). Optional — defaults to empty. */
  tagline?: string
  /** 'crankshift/lawpowers' — used to derive GitHub URLs, marketplace command, JSON-LD sameAs. */
  repo: string
  /** Canonical production URL, no trailing slash. e.g. 'https://lawpowers.web.app'. */
  url: string
  /** Path to OG image. Default: '/og.png'. */
  ogImage?: string
  /** Theme accent color override (any CSS value applied as --accent on :root inline). */
  accent?: string
  /** Default URL locale code. Must appear in locales[]. */
  defaultLocale: Locales
  /** All supported locales; drives hreflang, language switcher, and redirect logic. */
  locales: readonly LocaleSpec[]
  /** Plugin cards rendered in the Plugins section and referenced across Hero/Install/Sources/Footer. */
  plugins: readonly Plugin[]
  /** Marketplace add command. Default: `/plugin marketplace add <repo>`. */
  marketplaceInstall?: string
  /** Slug used in per-plugin install commands. Default: last path segment of `repo`. */
  marketplaceSlug?: string
  /** Reload command. Default: '/reload-plugins'. */
  reloadCmd?: string
}

export interface ShellTranslation {
  locale: string
  seo: { title: string; description: string }
  nav: {
    plugins: string
    install: string
    principles: string
    sources: string
    repo: string
  }
  hero: {
    eyebrow: string
    title_a: string
    title_b: string
    title_c: string
    sub: string
    install_label: string
    install_hint: string
    install_done: string
    install_copy: string
    no_claude_prefix: string
    get_claude_code: string
    cta_primary: string
    cta_secondary: string
    stat_plugins: string
    stat_agents: string
    stat_skills: string
    stat_license: string
  }
  plugins: {
    section_eyebrow: string
    section_title: string
    section_sub: string
    install_in: string
    docs: string
    agents: string
    skills: string
    lang: string
    commands: string
  }
  install: {
    eyebrow: string
    title: string
    sub: string
    step1: string
    step2: string
    pick: string
    prereq_heading: string
    prereq_sub: string
    verify_line: string
    cli_title: string
    cli_body: string
    cli_cta: string
    desktop_title: string
    desktop_body: string
    desktop_cta: string
    vscode_badge: string
    vscode_title: string
    vscode_body: string
    vscode_step1: string
    vscode_step2: string
    vscode_cta: string
  }
  principles: {
    eyebrow: string
    title: string
    items: Array<{ k: string; v: string }>
  }
  sources: {
    eyebrow: string
    title: string
    sub: string
    /** One entry per plugin code. */
    headings: Record<string, string>
  }
  disclaimer: { tag: string; title: string; body: string }
  footer: {
    tagline: string
    links_title: string
    repo: string
    releases: string
    changelog: string
    license: string
    plugins_title: string
    legal_title: string
    rights: string
  }
  a11y: {
    switch_lang: string
    toggle_theme_to_light: string
    toggle_theme_to_dark: string
    brand_home: string
  }
  /** Per-plugin display metadata, keyed by plugin code. */
  plugin_meta: Record<string, { name: string; tag: string; lang_value: string }>
  /** Per-plugin agent label maps. Consumer narrows with `satisfies Record<AgentId, string>`. */
  agents: Record<string, Record<string, string>>
  /** Per-plugin skill label maps. */
  skills: Record<string, Record<string, string>>
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`

Expected: exits 0, no output.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add public types — ShellTranslation, Plugin, SiteConfig, LocaleSpec"
```

---

## Task 3: i18n helpers (`src/i18n/index.ts`)

**Files:**
- Create: `src/i18n/index.ts`

- [ ] **Step 1: Write the file**

```ts
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

/** Unused-import stub so this module is a module even when nothing is imported. */
export type { LocaleSpec }
```

- [ ] **Step 2: Type-check**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/index.ts
git commit -m "feat: add i18n helpers — getT, isLang, hreflang/og presets, install-command builders"
```

---

## Task 4: Design tokens (`src/styles/global.css`)

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write the file**

Paste the entire contents of `/Users/yurii/Projects/lawpowers/site/src/styles/global.css` verbatim (tokens, typography resets, `.container`, `.section`, `.section-head`, `.eyebrow`). It is exactly the shell default. No changes.

Reference: `/Users/yurii/Projects/lawpowers/site/src/styles/global.css` (166 lines).

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add default CSS design tokens and layout primitives"
```

---

## Task 5: Dev playground skeleton

**Files:**
- Create: `dev/package.json`
- Create: `dev/astro.config.mjs`
- Create: `dev/tsconfig.json`
- Create: `dev/.gitignore`
- Create: `dev/public/og.png`
- Create: `dev/src/config.ts`
- Create: `dev/src/locales/en.ts`
- Create: `dev/src/locales/ua.ts`
- Create: `dev/src/locales/pl.ts`

Purpose: a minimal Astro site inside the shell repo that consumes the shell via `file:..`. Lets us type-check and build incrementally as components land. Contains **sample data** shaped like lawpowers but explicitly fake — not the real lawpowers copy.

- [ ] **Step 1: Write `dev/package.json`**

```json
{
  "name": "claude-plugins-site-dev",
  "type": "module",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "check": "astro check",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^6.1.8",
    "claude-plugins-site": "workspace:*"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.8",
    "typescript": "~6.0.2"
  }
}
```

- [ ] **Step 2: Write `dev/astro.config.mjs`**

```js
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
```

- [ ] **Step 3: Write `dev/tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src/**/*", ".astro/types.d.ts"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Write `dev/.gitignore`**

```
node_modules
dist
.astro
.DS_Store
```

- [ ] **Step 5: Create a placeholder `dev/public/og.png`**

Run: `convert -size 1200x630 xc:'#272320' dev/public/og.png 2>/dev/null || cp /Users/yurii/Projects/lawpowers/site/public/og.png dev/public/og.png`

Expected: a 1200×630 PNG exists at `dev/public/og.png`. Either path works; just needs a real PNG for OG tests.

- [ ] **Step 6: Write `dev/src/config.ts`**

```ts
import type { SiteConfig } from 'claude-plugins-site/types'

export const PLAYGROUND_AGENTS_UA = [
  'claim-drafter',
  'response-drafter',
  'appeal-drafter',
] as const
export type PlaygroundUaAgent = typeof PLAYGROUND_AGENTS_UA[number]

export const PLAYGROUND_SKILLS_UA = [
  'fetching-zakon-rada',
  'citing-ukrainian-law',
] as const
export type PlaygroundUaSkill = typeof PLAYGROUND_SKILLS_UA[number]

export const PLAYGROUND_AGENTS_PL = [
  'claim-drafter',
  'response-drafter',
] as const
export type PlaygroundPlAgent = typeof PLAYGROUND_AGENTS_PL[number]

export const PLAYGROUND_SKILLS_PL = [
  'fetching-isap-sejm',
  'citing-polish-law',
] as const
export type PlaygroundPlSkill = typeof PLAYGROUND_SKILLS_PL[number]

export const PLUGIN_CODES = ['ua', 'pl'] as const
export type PluginCode = typeof PLUGIN_CODES[number]

export const LOCALE_CODES = ['en', 'ua', 'pl'] as const
export type LocaleCode = typeof LOCALE_CODES[number]

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
```

- [ ] **Step 7: Write `dev/src/locales/en.ts`**

```ts
import type { ShellTranslation } from 'claude-plugins-site/types'
import type {
  PlaygroundUaAgent,
  PlaygroundUaSkill,
  PlaygroundPlAgent,
  PlaygroundPlSkill,
  PluginCode,
} from '../config'

export const en = {
  locale: 'EN',
  seo: {
    title: 'playpowers — dev playground',
    description: 'Shell playground sample data. Not a real site.',
  },
  nav: {
    plugins: 'Plugins',
    install: 'Install',
    principles: 'Principles',
    sources: 'Sources',
    repo: 'GitHub',
  },
  hero: {
    eyebrow: 'Shell playground',
    title_a: 'Placeholder',
    title_b: 'hero',
    title_c: 'title copy.',
    sub: 'This is playground sample data used to develop claude-plugins-site.',
    install_label: 'Quick install',
    install_hint: 'Paste into a running Claude Code session.',
    install_done: 'Copied',
    install_copy: 'Copy',
    no_claude_prefix: "Don't have Claude Code yet?",
    get_claude_code: 'Install it here',
    cta_primary: 'Browse plugins',
    cta_secondary: 'View on GitHub',
    stat_plugins: 'Plugins',
    stat_agents: 'Subagents',
    stat_skills: 'Skills',
    stat_license: 'License',
  },
  plugins: {
    section_eyebrow: 'Plugins',
    section_title: 'Pick a plugin.',
    section_sub: 'Sample plugin cards for the playground.',
    install_in: 'Install',
    docs: 'Read the docs',
    agents: 'Subagents',
    skills: 'Skills',
    lang: 'Working language',
    commands: 'Command prefix',
  },
  install: {
    eyebrow: 'Install',
    title: 'Two steps.',
    sub: 'Playground install copy.',
    step1: 'Step 1 — add the marketplace',
    step2: 'Step 2 — install plugins',
    pick: 'Pick a plugin',
    prereq_heading: 'Before you install',
    prereq_sub: 'Pick how you run Claude.',
    verify_line: 'After install, /plugin lists marketplaces.',
    cli_title: 'Claude Code (CLI)',
    cli_body: 'Terminal agent.',
    cli_cta: 'Install Claude Code',
    desktop_title: 'Claude Desktop',
    desktop_body: 'Mac/Windows app.',
    desktop_cta: 'Download Claude',
    vscode_badge: 'Recommended',
    vscode_title: 'Claude Code + VS Code',
    vscode_body: 'Editor integration.',
    vscode_step1: 'Download VS Code.',
    vscode_step2: 'Install the Claude Code extension.',
    vscode_cta: 'Download VS Code',
  },
  principles: {
    eyebrow: 'How it works',
    title: 'Shell principles.',
    items: [
      { k: 'Placeholder rule 1', v: 'Sample body text for rule one.' },
      { k: 'Placeholder rule 2', v: 'Sample body text for rule two.' },
      { k: 'Placeholder rule 3', v: 'Sample body text for rule three.' },
    ],
  },
  sources: {
    eyebrow: 'Primary sources',
    title: 'Where citations come from.',
    sub: 'Per-plugin source lists.',
    headings: { ua: 'Ukraine (sample)', pl: 'Poland (sample)' } satisfies Record<PluginCode, string>,
  },
  disclaimer: {
    tag: 'Read before installing',
    title: 'Playground disclaimer.',
    body: 'This is sample playground text, not legal or tax advice.',
  },
  footer: {
    tagline: 'Shell playground footer tagline.',
    links_title: 'Links',
    repo: 'Repository',
    releases: 'Releases',
    changelog: 'Changelog',
    license: 'MIT License',
    plugins_title: 'Plugins',
    legal_title: 'Legal',
    rights: 'MIT licensed. Playground data.',
  },
  a11y: {
    switch_lang: 'Switch language',
    toggle_theme_to_light: 'Switch to light theme',
    toggle_theme_to_dark: 'Switch to dark theme',
    brand_home: 'playpowers — home',
  },
  plugin_meta: {
    ua: { name: 'Ukraine (sample)', tag: 'Sample tag line', lang_value: 'Ukrainian' },
    pl: { name: 'Poland (sample)', tag: 'Sample tag line', lang_value: 'Polish' },
  } satisfies Record<PluginCode, { name: string; tag: string; lang_value: string }>,
  agents: {
    ua: {
      'claim-drafter': 'Claim drafter',
      'response-drafter': 'Response drafter',
      'appeal-drafter': 'Appeal drafter',
    } satisfies Record<PlaygroundUaAgent, string>,
    pl: {
      'claim-drafter': 'Claim drafter',
      'response-drafter': 'Response drafter',
    } satisfies Record<PlaygroundPlAgent, string>,
  },
  skills: {
    ua: {
      'fetching-zakon-rada': 'zakon.rada fetch',
      'citing-ukrainian-law': 'Citation format',
    } satisfies Record<PlaygroundUaSkill, string>,
    pl: {
      'fetching-isap-sejm': 'ISAP statute fetch',
      'citing-polish-law': 'Citation format',
    } satisfies Record<PlaygroundPlSkill, string>,
  },
} satisfies ShellTranslation

export type Translation = typeof en
```

- [ ] **Step 8: Write `dev/src/locales/ua.ts`**

```ts
import type { Translation } from './en'

export const ua: Translation = {
  locale: 'UA',
  seo: {
    title: 'playpowers — тестовий майданчик',
    description: 'Зразкові дані для розробки shell.',
  },
  nav: {
    plugins: 'Плагіни',
    install: 'Встановлення',
    principles: 'Принципи',
    sources: 'Джерела',
    repo: 'GitHub',
  },
  hero: {
    eyebrow: 'Shell playground',
    title_a: 'Заголовок',
    title_b: 'приклад',
    title_c: 'у трьох частинах.',
    sub: 'Зразкові тексти майданчика.',
    install_label: 'Швидке встановлення',
    install_hint: 'Вставити у Claude Code.',
    install_done: 'Скопійовано',
    install_copy: 'Копіювати',
    no_claude_prefix: 'Ще немає Claude Code?',
    get_claude_code: 'Встановити',
    cta_primary: 'Переглянути плагіни',
    cta_secondary: 'GitHub',
    stat_plugins: 'Плагіни',
    stat_agents: 'Субагенти',
    stat_skills: 'Скіли',
    stat_license: 'Ліцензія',
  },
  plugins: {
    section_eyebrow: 'Плагіни',
    section_title: 'Оберіть плагін.',
    section_sub: 'Зразкові картки.',
    install_in: 'Встановити',
    docs: 'Документація',
    agents: 'Субагенти',
    skills: 'Скіли',
    lang: 'Робоча мова',
    commands: 'Префікс',
  },
  install: {
    eyebrow: 'Встановлення',
    title: 'Два кроки.',
    sub: 'Зразковий текст.',
    step1: 'Крок 1 — додати маркетплейс',
    step2: 'Крок 2 — встановити плагіни',
    pick: 'Оберіть плагін',
    prereq_heading: 'Перед встановленням',
    prereq_sub: 'Спосіб запуску Claude.',
    verify_line: 'Після встановлення /plugin показує маркетплейси.',
    cli_title: 'Claude Code (CLI)',
    cli_body: 'Термінальний агент.',
    cli_cta: 'Встановити Claude Code',
    desktop_title: 'Claude Desktop',
    desktop_body: 'Додаток для Mac/Windows.',
    desktop_cta: 'Завантажити Claude',
    vscode_badge: 'Рекомендовано',
    vscode_title: 'Claude Code + VS Code',
    vscode_body: 'Інтеграція з редактором.',
    vscode_step1: 'Встановіть VS Code.',
    vscode_step2: 'Встановіть розширення Claude Code.',
    vscode_cta: 'Завантажити VS Code',
  },
  principles: {
    eyebrow: 'Як це працює',
    title: 'Принципи shell.',
    items: [
      { k: 'Правило 1', v: 'Зразковий текст 1.' },
      { k: 'Правило 2', v: 'Зразковий текст 2.' },
      { k: 'Правило 3', v: 'Зразковий текст 3.' },
    ],
  },
  sources: {
    eyebrow: 'Першоджерела',
    title: 'Звідки цитати.',
    sub: 'Зразкові списки.',
    headings: { ua: 'Україна (зразок)', pl: 'Польща (зразок)' },
  },
  disclaimer: {
    tag: 'Читати перед встановленням',
    title: 'Зразковий дисклеймер.',
    body: 'Це зразковий текст, не юридична порада.',
  },
  footer: {
    tagline: 'Тестовий слоган футера.',
    links_title: 'Посилання',
    repo: 'Репозиторій',
    releases: 'Релізи',
    changelog: 'Changelog',
    license: 'MIT',
    plugins_title: 'Плагіни',
    legal_title: 'Правове',
    rights: 'MIT. Зразкові дані.',
  },
  a11y: {
    switch_lang: 'Змінити мову',
    toggle_theme_to_light: 'Світла тема',
    toggle_theme_to_dark: 'Темна тема',
    brand_home: 'playpowers — на головну',
  },
  plugin_meta: {
    ua: { name: 'Україна (зразок)', tag: 'Зразковий тег', lang_value: 'Українська' },
    pl: { name: 'Польща (зразок)', tag: 'Зразковий тег', lang_value: 'Польська' },
  },
  agents: {
    ua: {
      'claim-drafter': 'Позов',
      'response-drafter': 'Відзив',
      'appeal-drafter': 'Апеляція',
    },
    pl: {
      'claim-drafter': 'Pozew',
      'response-drafter': 'Odpowiedź',
    },
  },
  skills: {
    ua: {
      'fetching-zakon-rada': 'zakon.rada',
      'citing-ukrainian-law': 'Цитування',
    },
    pl: {
      'fetching-isap-sejm': 'ISAP',
      'citing-polish-law': 'Cytowanie',
    },
  },
}
```

- [ ] **Step 9: Write `dev/src/locales/pl.ts`**

```ts
import type { Translation } from './en'

export const pl: Translation = {
  locale: 'PL',
  seo: {
    title: 'playpowers — plac zabaw',
    description: 'Przykładowe dane dla shella.',
  },
  nav: {
    plugins: 'Wtyczki',
    install: 'Instalacja',
    principles: 'Zasady',
    sources: 'Źródła',
    repo: 'GitHub',
  },
  hero: {
    eyebrow: 'Shell playground',
    title_a: 'Przykładowy',
    title_b: 'nagłówek',
    title_c: 'w trzech częściach.',
    sub: 'Przykładowy tekst dla placu zabaw.',
    install_label: 'Szybka instalacja',
    install_hint: 'Wklej do Claude Code.',
    install_done: 'Skopiowano',
    install_copy: 'Kopiuj',
    no_claude_prefix: 'Nie masz jeszcze Claude Code?',
    get_claude_code: 'Zainstaluj',
    cta_primary: 'Zobacz wtyczki',
    cta_secondary: 'GitHub',
    stat_plugins: 'Wtyczki',
    stat_agents: 'Subagenty',
    stat_skills: 'Skille',
    stat_license: 'Licencja',
  },
  plugins: {
    section_eyebrow: 'Wtyczki',
    section_title: 'Wybierz wtyczkę.',
    section_sub: 'Przykładowe karty.',
    install_in: 'Zainstaluj',
    docs: 'Dokumentacja',
    agents: 'Subagenty',
    skills: 'Skille',
    lang: 'Język pracy',
    commands: 'Prefiks',
  },
  install: {
    eyebrow: 'Instalacja',
    title: 'Dwa kroki.',
    sub: 'Przykładowy tekst.',
    step1: 'Krok 1 — dodaj marketplace',
    step2: 'Krok 2 — zainstaluj wtyczki',
    pick: 'Wybierz wtyczkę',
    prereq_heading: 'Przed instalacją',
    prereq_sub: 'Sposób uruchamiania Claude.',
    verify_line: 'Po instalacji /plugin pokazuje marketplace.',
    cli_title: 'Claude Code (CLI)',
    cli_body: 'Agent terminalowy.',
    cli_cta: 'Zainstaluj Claude Code',
    desktop_title: 'Claude Desktop',
    desktop_body: 'Aplikacja Mac/Windows.',
    desktop_cta: 'Pobierz Claude',
    vscode_badge: 'Polecane',
    vscode_title: 'Claude Code + VS Code',
    vscode_body: 'Integracja z edytorem.',
    vscode_step1: 'Zainstaluj VS Code.',
    vscode_step2: 'Zainstaluj rozszerzenie Claude Code.',
    vscode_cta: 'Pobierz VS Code',
  },
  principles: {
    eyebrow: 'Jak to działa',
    title: 'Zasady shella.',
    items: [
      { k: 'Zasada 1', v: 'Przykładowy tekst 1.' },
      { k: 'Zasada 2', v: 'Przykładowy tekst 2.' },
      { k: 'Zasada 3', v: 'Przykładowy tekst 3.' },
    ],
  },
  sources: {
    eyebrow: 'Źródła pierwotne',
    title: 'Skąd cytaty.',
    sub: 'Przykładowe listy.',
    headings: { ua: 'Ukraina (próbka)', pl: 'Polska (próbka)' },
  },
  disclaimer: {
    tag: 'Przeczytaj przed instalacją',
    title: 'Przykładowy disclaimer.',
    body: 'To tekst przykładowy, nie porada prawna.',
  },
  footer: {
    tagline: 'Przykładowy slogan stopki.',
    links_title: 'Linki',
    repo: 'Repozytorium',
    releases: 'Wydania',
    changelog: 'Changelog',
    license: 'MIT',
    plugins_title: 'Wtyczki',
    legal_title: 'Prawne',
    rights: 'MIT. Dane przykładowe.',
  },
  a11y: {
    switch_lang: 'Zmień język',
    toggle_theme_to_light: 'Jasny motyw',
    toggle_theme_to_dark: 'Ciemny motyw',
    brand_home: 'playpowers — strona główna',
  },
  plugin_meta: {
    ua: { name: 'Ukraina (próbka)', tag: 'Przykładowy tag', lang_value: 'Ukraiński' },
    pl: { name: 'Polska (próbka)', tag: 'Przykładowy tag', lang_value: 'Polski' },
  },
  agents: {
    ua: {
      'claim-drafter': 'Pozew',
      'response-drafter': 'Odpowiedź',
      'appeal-drafter': 'Apelacja',
    },
    pl: {
      'claim-drafter': 'Pozew',
      'response-drafter': 'Odpowiedź',
    },
  },
  skills: {
    ua: {
      'fetching-zakon-rada': 'zakon.rada',
      'citing-ukrainian-law': 'Cytowanie',
    },
    pl: {
      'fetching-isap-sejm': 'ISAP',
      'citing-polish-law': 'Cytowanie',
    },
  },
}
```

- [ ] **Step 10: Create `dev/src/locales/index.ts`**

```ts
import { en } from './en'
import { ua } from './ua'
import { pl } from './pl'
import type { Translation } from './en'
import type { LocaleCode } from '../config'

export const dicts: Record<LocaleCode, Translation> = { en, ua, pl }
export type { Translation }
```

- [ ] **Step 11: Install playground deps**

Run: `pnpm install`

Expected: `dev/node_modules/claude-plugins-site` is a symlink to `../..`.

- [ ] **Step 12: Type-check (playground)**

Run: `pnpm --filter claude-plugins-site-dev exec astro check`

Expected: 0 errors, 0 warnings. Any TypeScript error here means types from Task 2 don't match what the playground uses — fix Task 2's types or the playground config, then rerun.

Note: `astro check` will also mention "no pages found" — that's fine at this stage.

- [ ] **Step 13: Commit**

```bash
git add dev/
git commit -m "chore: add dev playground skeleton with sample site config and locales"
```

---

## Task 6: BaseLayout (`src/layouts/BaseLayout.astro`)

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `dev/src/pages/[locale]/index.astro`

- [ ] **Step 1: Port from lawpowers**

Start from `/Users/yurii/Projects/lawpowers/site/src/layouts/BaseLayout.astro` (130 lines). Apply these transformations:

**Frontmatter changes:**
- Replace imports:
  ```ts
  import '../styles/global.css'
  import { LANGS, HREFLANG, OG_LOCALE, type Lang } from '../i18n'
  ```
  with:
  ```ts
  import '../styles/global.css'
  import type { ShellTranslation, SiteConfig } from '../types'
  ```
- Replace `Props` interface:
  ```ts
  interface Props {
    lang: string
    t: ShellTranslation
    site: SiteConfig
  }
  const { lang, t, site } = Astro.props
  ```
- Replace derivations:
  ```ts
  const siteUrl = site.url.replace(/\/$/, '')
  const canonical = `${siteUrl}/${lang}/`
  const localeSpec = site.locales.find((l) => l.code === lang)
  if (!localeSpec) throw new Error(`Unknown locale: ${lang}`)
  const htmlLang = localeSpec.hreflang
  const ogLocale = localeSpec.ogLocale
  const ogImage = `${siteUrl}${site.ogImage ?? '/og.png'}`
  const title = t.seo.title
  const description = t.seo.description
  ```
- Replace JSON-LD brand/url/logo with `site.brand`, `siteUrl`, `ogImage`, and `sameAs: [\`https://github.com/${site.repo}\`]`.

**Markup changes:**
- Replace `<html lang={htmlLang} data-theme="light">` — unchanged.
- `<title>{title}</title>` and `<meta description>` — unchanged.
- Hreflang alternates: iterate `site.locales`:
  ```astro
  {site.locales.map((l) => (
    <link rel="alternate" hreflang={l.hreflang} href={`${siteUrl}/${l.code}/`} />
  ))}
  <link rel="alternate" hreflang="x-default" href={`${siteUrl}/${site.defaultLocale}/`} />
  ```
- OG / Twitter tags: replace `'lawpowers'` with `site.brand`, use `ogLocale`, `ogImage`, and for `og:locale:alternate` iterate `site.locales.filter((l) => l.code !== lang)`.
- Keep `<meta name="theme-color">` tags verbatim.
- Keep the SVG favicon data-URL (shell default `§` mark).
- Keep font preconnect + Google Fonts link verbatim.
- Remove `<link rel="sitemap" href="/sitemap-index.xml" />` — sitemap is a consumer-level concern configured in their `astro.config.mjs`. If the consumer wants it, they can insert `<link rel="sitemap">` via a consumer wrapper (future v2 head slot).
- Keep the `<script type="application/ld+json">` JSON-LD block; update the object to use `site.brand`, `siteUrl`, and `sameAs: [\`https://github.com/${site.repo}\`]`.
- Theme bootstrap script: **rename the localStorage key** from `'lp-theme'` to `'cps-theme'`. Keep logic identical.
- Add `site.accent` handling: before `</head>`, insert:
  ```astro
  {site.accent && <style is:inline set:html={`:root { --accent: ${site.accent}; }`} />}
  ```
- `<body>` contains `<slot />` — unchanged.

- [ ] **Step 2: Write `dev/src/pages/[locale]/index.astro` (minimal wiring for verification)**

```astro
---
import BaseLayout from 'claude-plugins-site/layouts/BaseLayout.astro'
import { isLang } from 'claude-plugins-site/i18n'
import { site } from '../../config'
import { dicts } from '../../locales'

export function getStaticPaths() {
  return site.locales.map(({ code }) => ({ params: { locale: code } }))
}

const { locale } = Astro.params
if (!isLang(locale, site.locales)) {
  throw new Error(`Unsupported locale: ${locale}`)
}
const t = dicts[locale]
---

<BaseLayout lang={locale} t={t} site={site}>
  <main style="padding: 80px 20px; font-family: var(--font-sans)">
    <h1>BaseLayout wired for /{locale}/</h1>
    <p>Brand: {site.brand}. Locale: {t.locale}.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Build the playground**

Run: `pnpm --filter claude-plugins-site-dev build`

Expected: exits 0. Produces `dev/dist/en/index.html`, `dev/dist/ua/index.html`, `dev/dist/pl/index.html`. If Astro fails to resolve `.astro` from the `file:` dep with an error like "Cannot find module 'claude-plugins-site/layouts/BaseLayout.astro'", add to `dev/astro.config.mjs`:
```js
export default defineConfig({
  // …existing…
  vite: {
    ssr: { noExternal: ['claude-plugins-site'] },
  },
})
```
and rerun. Document this discovery in the dev playground commit message if you have to add it.

- [ ] **Step 4: Visual spot-check**

Run: `pnpm --filter claude-plugins-site-dev dev` and open `http://localhost:4321/en/`.

Expected: page shows "BaseLayout wired for /en/", fonts load, theme toggle stub is absent (Nav lands in Task 9), no console errors. Switch to `/ua/` and `/pl/` — page renders, hreflang alternates are in the head (view source). Kill dev server with Ctrl-C when done.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro dev/src/pages/
git commit -m "feat: add BaseLayout — SEO, hreflang, OG, JSON-LD, theme bootstrap"
```

If `vite.ssr.noExternal` was added in Step 3, include `dev/astro.config.mjs` in the commit and expand the message accordingly.

---

## Task 7: CopyButton (`src/components/CopyButton.astro`)

**Files:**
- Create: `src/components/CopyButton.astro`

- [ ] **Step 1: Port verbatim**

Copy `/Users/yurii/Projects/lawpowers/site/src/components/CopyButton.astro` verbatim into `src/components/CopyButton.astro`. No transformations — it's already generic (takes `text`, `labelCopy`, `labelDone`, `size` as props, uses event-delegated clipboard write).

- [ ] **Step 2: Build**

Run: `pnpm --filter claude-plugins-site-dev build`

Expected: exits 0 (no consumer of CopyButton yet, but shell still needs to type-check).

- [ ] **Step 3: Commit**

```bash
git add src/components/CopyButton.astro
git commit -m "feat: add CopyButton — clipboard copy with animated confirmation"
```

---

## Task 8: BrandMark (`src/components/BrandMark.astro`)

**Files:**
- Create: `src/components/BrandMark.astro`

- [ ] **Step 1: Port with glyph slot**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/BrandMark.astro`. Replace the hardcoded `§` with a default slot so consumers can supply their own glyph. Write the full file:

```astro
---
// Small seal used in the nav / footer. Default glyph is '§'; override via default slot.
---

<span class="brand-mark" aria-hidden="true"><span><slot>§</slot></span></span>

<style>
  .brand-mark {
    width: 28px;
    height: 28px;
    border: 1.5px solid var(--ink);
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 400;
    background: var(--bg);
    position: relative;
    flex-shrink: 0;
  }
  .brand-mark::before {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    border: 1px solid var(--ink);
    opacity: 0.35;
  }
  .brand-mark > span {
    position: relative;
    z-index: 1;
    font-style: italic;
  }
</style>
```

- [ ] **Step 2: Build**

Run: `pnpm --filter claude-plugins-site-dev build`

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/BrandMark.astro
git commit -m "feat: add BrandMark with slottable glyph (default §)"
```

---

## Task 9: Nav (`src/components/Nav.astro`)

**Files:**
- Create: `src/components/Nav.astro`

- [ ] **Step 1: Port with generalizations**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/Nav.astro` (234 lines). Apply:

**Frontmatter changes:**
- Replace imports:
  ```ts
  import BrandMark from './BrandMark.astro'
  import type { ShellTranslation, SiteConfig } from '../types'
  ```
- Replace `Props`:
  ```ts
  interface Props {
    lang: string
    t: ShellTranslation
    site: SiteConfig
  }
  const { lang, t, site } = Astro.props
  const repoUrl = `https://github.com/${site.repo}`
  ```

**Markup changes:**
- Replace `<span class="brand-name">law<em>·</em>powers</span>` with `<span class="brand-name">{site.brand}</span>`. (Consumers who want the em-treatment override the whole Nav via slot; v1 is plain text.)
- Replace `<a href="#jurisdictions">{t.nav.jurisdictions}</a>` with `<a href="#plugins">{t.nav.plugins}</a>`.
- Replace `<a href={REPO_URL} ...>` with `<a href={repoUrl} ...>`.
- Language switcher iteration: replace `LANGS.map((code) => …)` with `site.locales.map(({ code, displayName }) => …)`; render `displayName` instead of `code.toUpperCase()`.

**Script changes:**
- Rename `STORAGE_KEY = 'lp-theme'` to `STORAGE_KEY = 'cps-theme'`.
- Keep all other logic identical.

**Style block:** keep verbatim.

- [ ] **Step 2: Wire into playground**

Modify `dev/src/pages/[locale]/index.astro` — replace the `<main>` placeholder with:

```astro
<BaseLayout lang={locale} t={t} site={site}>
  <Nav lang={locale} t={t} site={site} />
  <main style="padding: 80px 20px; font-family: var(--font-sans)">
    <h1>Nav wired</h1>
    <p>Try the theme toggle and language pills.</p>
  </main>
</BaseLayout>
```

Add at top: `import Nav from 'claude-plugins-site/components/Nav.astro'`.

- [ ] **Step 3: Build**

Run: `pnpm --filter claude-plugins-site-dev build`

Expected: exits 0.

- [ ] **Step 4: Visual spot-check**

Run: `pnpm --filter claude-plugins-site-dev dev` and open `http://localhost:4321/en/`.

Expected: sticky nav visible with `playpowers` brand, 4 nav links (Plugins / Install / Principles / Sources / GitHub), language pills EN/УКР/PL, theme toggle. Clicking theme toggle flips tokens and persists across reload. Clicking `УКР` navigates to `/ua/`. Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.astro dev/src/pages/[locale]/index.astro
git commit -m "feat: add Nav — brand, section links, language switcher, theme toggle"
```

---

## Task 10: Hero (`src/components/Hero.astro`)

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Port with generalizations**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/Hero.astro` (338 lines). Apply:

**Frontmatter changes:**
- Replace imports:
  ```ts
  import type { ShellTranslation, SiteConfig } from '../types'
  import {
    marketplaceAddCommand,
    marketplaceSlugOf,
    pluginInstallCommand,
    reloadCommand,
  } from '../i18n'
  import CopyButton from './CopyButton.astro'
  ```
- Replace `Props`:
  ```ts
  interface Props {
    t: ShellTranslation
    site: SiteConfig
  }
  const { t, site } = Astro.props
  const repoUrl = `https://github.com/${site.repo}`
  const slug = site.marketplaceSlug ?? marketplaceSlugOf(site.repo)
  const INSTALL_LINES = [
    marketplaceAddCommand(site.repo, site.marketplaceInstall),
    ...site.plugins.map((p) => pluginInstallCommand(p.code, slug)),
    reloadCommand(site.reloadCmd),
  ]
  const agentCount = site.plugins.reduce((sum, p) => sum + p.agents.length, 0)
  const skillCount = site.plugins.reduce((sum, p) => sum + p.skills.length, 0)
  const pluginCount = site.plugins.length
  ```

**Markup changes:**
- Replace `<a class="btn primary" href="#jurisdictions">` with `<a class="btn primary" href="#plugins">`.
- Replace `href={REPO_URL}` with `href={repoUrl}`.
- In the stats, replace the hardcoded `<em>2</em>` with `<em>{pluginCount}</em>`. Keep `{agentCount}` and `{skillCount}` — they are already derived.
- Keep the `INSTALL_LINES.map(...)` rendering block; the derivation above makes it N-plugin aware automatically.

**Style block:** keep verbatim.

- [ ] **Step 2: Wire into playground**

Modify `dev/src/pages/[locale]/index.astro`: replace the `<main>` placeholder with:

```astro
<main>
  <Hero t={t} site={site} />
</main>
```

Add `import Hero from 'claude-plugins-site/components/Hero.astro'`.

- [ ] **Step 3: Build + visual check**

Run: `pnpm --filter claude-plugins-site-dev build`; then `pnpm --filter claude-plugins-site-dev dev` and open `http://localhost:4321/en/`.

Expected: hero renders with sample title, install block with 4 commands (marketplace add + 2 plugin installs + reload), stats `2 Plugins / 5 Subagents / 4 Skills / MIT`. Copy buttons work. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro dev/src/pages/[locale]/index.astro
git commit -m "feat: add Hero — install block, CTAs, stats (all derived from site.plugins)"
```

---

## Task 11: PluginCard (`src/components/PluginCard.astro`)

**Files:**
- Create: `src/components/PluginCard.astro`

- [ ] **Step 1: Port with generalizations**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/PluginCard.astro` (248 lines). Apply:

**Frontmatter changes:**
- Replace imports:
  ```ts
  import CopyButton from './CopyButton.astro'
  import type { ShellTranslation, SiteConfig, Plugin } from '../types'
  import { marketplaceSlugOf, pluginInstallCommand } from '../i18n'
  ```
  Note: `Flag` is no longer shell-owned; consumers who want a flag pass it via `plugin.flag` (rendered via `<Fragment set:html={...} />` if it's a string, or as a component if it's renderable — see below).
- Replace `Props`:
  ```ts
  interface Props {
    t: ShellTranslation
    site: SiteConfig
    plugin: Plugin
  }
  const { t, site, plugin } = Astro.props
  const meta = t.plugin_meta[plugin.code] ?? { name: plugin.code, tag: '', lang_value: '' }
  const agentDict: Record<string, string> = t.agents[plugin.code] ?? {}
  const skillDict: Record<string, string> = t.skills[plugin.code] ?? {}
  const slug = site.marketplaceSlug ?? marketplaceSlugOf(site.repo)
  const installCmd = pluginInstallCommand(plugin.code, slug)
  ```

**Markup changes:**
- Replace `<Flag code={code} />` with:
  ```astro
  {plugin.flag && typeof plugin.flag === 'string' && (
    <Fragment set:html={plugin.flag} />
  )}
  ```
  (For v1 the playground passes no `flag`, so this is inert. A future `plugin.flag` component pattern can be added in v2.)
- Replace `data.tag` / `data.name` / `data.lang_value` (destructured from old `t.plugins[code]`) with `meta.tag` / `meta.name` / `meta.lang_value`.
- Replace `{code}` used in `/{code}:…` and `/{code}` display strings with `{plugin.code}`.
- Replace `agents` / `skills` prop arrays: these are now `plugin.agents` / `plugin.skills`. Change the `.map` calls accordingly.
- Replace `agentDict[k] ?? k` / `skillDict[k] ?? k` — unchanged, but the dicts are now derived locally (see Frontmatter).

**Style block:** keep verbatim.

- [ ] **Step 2: Build**

Run: `pnpm --filter claude-plugins-site-dev build`

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/PluginCard.astro
git commit -m "feat: add PluginCard — renders one plugin with meta, agent/skill lists, install cmd"
```

---

## Task 12: Plugins (`src/components/Plugins.astro`)

**Files:**
- Create: `src/components/Plugins.astro`

- [ ] **Step 1: Port with generalizations**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/Plugins.astro` (53 lines). Apply:

**Frontmatter changes:**
- Replace imports:
  ```ts
  import PluginCard from './PluginCard.astro'
  import type { ShellTranslation, SiteConfig } from '../types'
  ```
- Replace `Props`:
  ```ts
  interface Props {
    t: ShellTranslation
    site: SiteConfig
  }
  const { t, site } = Astro.props
  ```

**Markup changes:**
- Replace `id="jurisdictions"` with `id="plugins"`.
- Replace the two hardcoded `<PluginCard ... />` with:
  ```astro
  <div class="plugin-grid">
    {site.plugins.map((plugin) => (
      <PluginCard t={t} site={site} plugin={plugin} />
    ))}
  </div>
  ```

**Style block:**

- The `.plugin-grid` currently uses `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)` (two-column). With N plugins this still works but breaks down for 1 or 3+. Replace with:
  ```css
  .plugin-grid {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    grid-auto-rows: auto;
    align-items: stretch;
  }
  @media (max-width: 960px) {
    .plugin-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  ```
- Drop the `grid-template-rows: subgrid` block in `PluginCard.astro`'s card — it assumed a 6-row subgrid. Keep `PluginCard` self-sizing. (Already handled if you skipped subgrid in Task 11; if not, remove those lines from `PluginCard.astro` now and amend its commit: `git commit --amend --no-edit`.)

- [ ] **Step 2: Wire into playground**

Modify `dev/src/pages/[locale]/index.astro` — add `<Plugins t={t} site={site} />` after `<Hero />`. Import it.

- [ ] **Step 3: Build + visual check**

Run: `pnpm --filter claude-plugins-site-dev build`; `pnpm --filter claude-plugins-site-dev dev`, open `/en/`.

Expected: two plugin cards side-by-side on desktop, stacked on mobile. Each shows plugin code, meta name/tag, agent list, skill list, install command with copy button.

- [ ] **Step 4: Commit**

```bash
git add src/components/Plugins.astro dev/src/pages/[locale]/index.astro
git commit -m "feat: add Plugins section — iterates site.plugins, responsive auto-fit grid"
```

If you had to amend `PluginCard.astro` to drop the subgrid hint, mention it in the message.

---

## Task 13: Install (`src/components/Install.astro`)

**Files:**
- Create: `src/components/Install.astro`

- [ ] **Step 1: Port with generalizations**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/Install.astro` (442 lines). Apply:

**Frontmatter changes:**
- Replace imports:
  ```ts
  import CopyButton from './CopyButton.astro'
  import type { ShellTranslation, SiteConfig } from '../types'
  import {
    marketplaceAddCommand,
    marketplaceSlugOf,
    pluginInstallCommand,
    reloadCommand,
  } from '../i18n'
  ```
- Replace `Props`:
  ```ts
  interface Props {
    t: ShellTranslation
    site: SiteConfig
  }
  const { t, site } = Astro.props
  ```
- Replace the hardcoded `TAB_COMMANDS` / `TABS` / `TAB_LABEL` / `DEFAULT_TAB` constants with a derivation from `site.plugins`:
  ```ts
  const MARKETPLACE = marketplaceAddCommand(site.repo, site.marketplaceInstall)
  const RELOAD = reloadCommand(site.reloadCmd)
  const slug = site.marketplaceSlug ?? marketplaceSlugOf(site.repo)

  type TabEntry = { key: string; label: string; commands: readonly string[] }

  const perPlugin: TabEntry[] = site.plugins.map((p) => ({
    key: p.code,
    label: p.code.toUpperCase(),
    commands: [MARKETPLACE, pluginInstallCommand(p.code, slug), RELOAD],
  }))

  const allTab: TabEntry | null = site.plugins.length >= 2
    ? {
        key: 'all',
        label: site.plugins.map((p) => p.code.toUpperCase()).join(' + '),
        commands: [
          MARKETPLACE,
          ...site.plugins.map((p) => pluginInstallCommand(p.code, slug)),
          RELOAD,
        ],
      }
    : null

  const TABS: readonly TabEntry[] = allTab ? [...perPlugin, allTab] : perPlugin
  const DEFAULT_TAB_KEY = allTab ? 'all' : perPlugin[0]?.key ?? ''
  ```

**Markup changes:**
- Replace the `TABS.map((key) => ...)` tab-button loop with an iteration over the new `TABS` array: `{TABS.map((tab) => ...)}` — use `tab.key` and `tab.label` and compare against `DEFAULT_TAB_KEY`.
- Replace the `TABS.map((key) => { const [step1, ...rest] = TAB_COMMANDS[key] ... })` panel loop with:
  ```astro
  {TABS.map((tab) => {
    const [step1, ...rest] = tab.commands
    return (
      <div class="tab-panel" data-panel={tab.key} hidden={tab.key !== DEFAULT_TAB_KEY}>
        <div class="line">
          <span class="prompt" aria-hidden="true">›</span>
          <span class="cmd">{step1}</span>
          <CopyButton text={step1!} labelCopy={t.hero.install_copy} labelDone={t.hero.install_done} size="sm" />
        </div>
        <div class="spacer"></div>
        <div class="line">
          <span class="comment"># {t.install.step2}</span>
        </div>
        {rest.map((line) => (
          <div class="line">
            <span class="prompt" aria-hidden="true">›</span>
            <span class="cmd">{line}</span>
            <CopyButton text={line} labelCopy={t.hero.install_copy} labelDone={t.hero.install_done} size="sm" />
          </div>
        ))}
      </div>
    )
  })}
  ```
- Prereq cards (CLI / Desktop / VS Code) and verify-line: keep verbatim (no hardcoded consumer data there).

**Script:** keep verbatim — already reads `data-tab` / `data-panel` generically.

**Style block:** keep verbatim.

- [ ] **Step 2: Wire into playground**

Add `<Install t={t} site={site} />` after `<Plugins />` in the dev page. Import it.

- [ ] **Step 3: Build + visual check**

Run build + dev server. Expected: install section renders with 3 prereq cards, terminal block with 3 tabs (UA / PL / UA + PL), tab switching works, all copy buttons work.

- [ ] **Step 4: Commit**

```bash
git add src/components/Install.astro dev/src/pages/[locale]/index.astro
git commit -m "feat: add Install — N-plugin tabs + 'all' tab, derived from site.plugins"
```

---

## Task 14: Principles (`src/components/Principles.astro`)

**Files:**
- Create: `src/components/Principles.astro`

- [ ] **Step 1: Port with generalizations**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/Principles.astro` (94 lines). Apply:

**Frontmatter changes:**
- Replace `import type { Translation } from '../locales/en'` with `import type { ShellTranslation } from '../types'`.
- Replace `interface Props { t: Translation }` with `interface Props { t: ShellTranslation }`.

No other changes — the component is already generic (renders `t.principles.items`).

- [ ] **Step 2: Wire into playground**

Add `<Principles t={t} />` after `<Install />`. Import it.

- [ ] **Step 3: Build + visual check**

Expected: three numbered rows with keys and values from sample data.

- [ ] **Step 4: Commit**

```bash
git add src/components/Principles.astro dev/src/pages/[locale]/index.astro
git commit -m "feat: add Principles — numbered list from t.principles.items"
```

---

## Task 15: Sources (`src/components/Sources.astro`)

**Files:**
- Create: `src/components/Sources.astro`

- [ ] **Step 1: Port with generalizations**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/Sources.astro` (108 lines). Apply:

**Frontmatter changes:**
- Replace imports:
  ```ts
  import type { ShellTranslation, SiteConfig } from '../types'
  ```
- Replace `Props`:
  ```ts
  interface Props {
    t: ShellTranslation
    site: SiteConfig
  }
  const { t, site } = Astro.props
  ```

**Markup changes:**
- Replace the two hardcoded `.col` blocks (UA and PL) with an iteration:
  ```astro
  <div class="grid" data-cols={site.plugins.length}>
    {site.plugins.map((plugin) => (
      <div class="col">
        <h3><em>{plugin.code.toUpperCase()}</em> · {t.sources.headings[plugin.code] ?? plugin.code}</h3>
        <div class="col-sub">{plugin.sources.map((s) => s.name).join(' · ')}</div>
        <ul>
          {plugin.sources.map((s) => (
            <li>
              <span class="s-name">{s.name}</span>
              <span class="s-url">{s.url}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
  ```
  The `col-sub` secondary label is now auto-derived from the source names rather than a hardcoded string.

**Style changes:**
- Replace `grid-template-columns: 1fr 1fr` with responsive auto-fit:
  ```css
  .grid {
    display: grid;
    gap: 48px;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  @media (max-width: 960px) {
    .grid {
      gap: 32px;
    }
  }
  ```
  Keep the rest of the style block verbatim.

- [ ] **Step 2: Wire into playground**

Add `<Sources t={t} site={site} />` after `<Principles />`. Import it.

- [ ] **Step 3: Build + visual check**

Expected: two columns for UA / PL sample sources with headings and URL lists.

- [ ] **Step 4: Commit**

```bash
git add src/components/Sources.astro dev/src/pages/[locale]/index.astro
git commit -m "feat: add Sources — iterates site.plugins, auto-fit responsive grid"
```

---

## Task 16: Disclaimer (`src/components/Disclaimer.astro`)

**Files:**
- Create: `src/components/Disclaimer.astro`

- [ ] **Step 1: Port verbatim with minor type fix**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/Disclaimer.astro` (102 lines). Apply:

**Frontmatter changes:**
- Replace `import type { Translation } from '../locales/en'` with `import type { ShellTranslation } from '../types'`.
- Replace `interface Props { t: Translation }` with `interface Props { t: ShellTranslation }`.

No other changes. The `<span>§</span>` glyph stays hardcoded — consumers override the whole component via slot if they want a different glyph. (Alternative: add a `glyph` prop default `'§'`. Not worth the ceremony for v1.)

- [ ] **Step 2: Wire into playground**

Add `<Disclaimer t={t} />` after `<Sources />`. Import it.

- [ ] **Step 3: Build + visual check**

Expected: warning circle with `§`, tag line, title, body paragraph.

- [ ] **Step 4: Commit**

```bash
git add src/components/Disclaimer.astro dev/src/pages/[locale]/index.astro
git commit -m "feat: add Disclaimer — warn-mark + tag/title/body from t.disclaimer"
```

---

## Task 17: Footer (`src/components/Footer.astro`)

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Port with generalizations**

Start from `/Users/yurii/Projects/lawpowers/site/src/components/Footer.astro` (191 lines). Apply:

**Frontmatter changes:**
- Replace imports:
  ```ts
  import BrandMark from './BrandMark.astro'
  import type { ShellTranslation, SiteConfig } from '../types'
  ```
- Replace `Props`:
  ```ts
  interface Props {
    t: ShellTranslation
    site: SiteConfig
  }
  const { t, site } = Astro.props
  const YEAR = new Date().getFullYear()
  const repoUrl = `https://github.com/${site.repo}`
  ```
- Remove the `extIcon` constant's `set:html` usage — leave it, it's a helper. Still needed by the external-link icon.

**Markup changes:**
- Replace `<span>law<em>·</em>powers</span>` with `<span>{site.brand}</span>` in the `foot-brand` block.
- Replace `REPO_URL` references with `repoUrl`.
- Replace the two hardcoded plugin list items (`ua` and `pl`) with:
  ```astro
  <div class="foot-col">
    <h5>{t.footer.plugins_title}</h5>
    <ul>
      {site.plugins.map((plugin) => (
        <li>
          <a href={`${repoUrl}/tree/main/plugins/${plugin.code}`} target="_blank" rel="noopener noreferrer">
            {plugin.code} — {t.plugin_meta[plugin.code]?.name ?? plugin.code}
          </a>
        </li>
      ))}
    </ul>
  </div>
  ```
- Replace `<span>crankshift/lawpowers</span>` at the bottom with `<span>{site.repo}</span>`.

**Style block:** keep verbatim.

- [ ] **Step 2: Wire into playground**

Add `<Footer t={t} site={site} />` at the bottom (outside `<main>`, after `<Disclaimer />`). Import it.

- [ ] **Step 3: Build + visual check**

Expected: footer with brand, 3 link columns (Links / Plugins / Legal), year stamp, site.repo string. Plugins column lists UA and PL.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro dev/src/pages/[locale]/index.astro
git commit -m "feat: add Footer — brand, links, iterated plugin list, site.repo"
```

---

## Task 18: PageShell (`src/layouts/PageShell.astro`)

**Files:**
- Create: `src/layouts/PageShell.astro`

Purpose: one-line consumer API that composes all sections with named slots + fallback content.

- [ ] **Step 1: Write the file**

```astro
---
import BaseLayout from './BaseLayout.astro'
import Nav from '../components/Nav.astro'
import Hero from '../components/Hero.astro'
import Plugins from '../components/Plugins.astro'
import Install from '../components/Install.astro'
import Principles from '../components/Principles.astro'
import Sources from '../components/Sources.astro'
import Disclaimer from '../components/Disclaimer.astro'
import Footer from '../components/Footer.astro'
import type { ShellTranslation, SiteConfig } from '../types'

interface Props {
  lang: string
  t: ShellTranslation
  site: SiteConfig
}

const { lang, t, site } = Astro.props
---

<BaseLayout lang={lang} t={t} site={site}>
  <slot name="nav">
    <Nav lang={lang} t={t} site={site} />
  </slot>
  <main>
    <slot name="hero">
      <Hero t={t} site={site} />
    </slot>
    <slot name="plugins">
      <Plugins t={t} site={site} />
    </slot>
    <slot name="install">
      <Install t={t} site={site} />
    </slot>
    <slot name="principles">
      <Principles t={t} />
    </slot>
    <slot name="sources">
      <Sources t={t} site={site} />
    </slot>
    <slot name="disclaimer">
      <Disclaimer t={t} />
    </slot>
    <slot />
  </main>
  <slot name="footer">
    <Footer t={t} site={site} />
  </slot>
</BaseLayout>
```

- [ ] **Step 2: Replace playground page with single-line PageShell usage**

Overwrite `dev/src/pages/[locale]/index.astro`:

```astro
---
import PageShell from 'claude-plugins-site/layouts/PageShell.astro'
import { isLang } from 'claude-plugins-site/i18n'
import { site } from '../../config'
import { dicts } from '../../locales'

export function getStaticPaths() {
  return site.locales.map(({ code }) => ({ params: { locale: code } }))
}

const { locale } = Astro.params
if (!isLang(locale, site.locales)) {
  throw new Error(`Unsupported locale: ${locale}`)
}
const t = dicts[locale]
---

<PageShell lang={locale} t={t} site={site} />
```

- [ ] **Step 3: Build + visual check**

Run: `pnpm --filter claude-plugins-site-dev build`

Expected: every locale renders the full page (Nav + Hero + Plugins + Install + Principles + Sources + Disclaimer + Footer).

Run: `pnpm --filter claude-plugins-site-dev dev` and inspect `/en/`, `/ua/`, `/pl/`. Verify every section appears once and the order is correct.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/PageShell.astro dev/src/pages/[locale]/index.astro
git commit -m "feat: add PageShell — named-slot composition of full landing page"
```

---

## Task 19: RedirectShell + root page

**Files:**
- Create: `src/components/RedirectShell.astro`
- Create: `dev/src/pages/index.astro`

- [ ] **Step 1: Write `RedirectShell.astro`**

Port from `/Users/yurii/Projects/lawpowers/site/src/pages/index.astro` (58 lines). Apply:

```astro
---
import type { SiteConfig } from '../types'

interface Props {
  site: SiteConfig
}

const { site } = Astro.props
const siteUrl = site.url.replace(/\/$/, '')
const defaultPath = `/${site.defaultLocale}/`

/* Build the supported-language map for the client-side picker.
 * Key format: both the ISO 639-1 hreflang code (e.g. 'uk') and the URL
 * path segment (e.g. 'ua') point to the same URL, so navigator.languages
 * matches against whichever the user's browser reports. */
const localeMap: Record<string, string> = {}
for (const l of site.locales) {
  const path = `/${l.code}/`
  localeMap[l.hreflang] = path
  localeMap[l.code] = path
}
const localeMapJson = JSON.stringify(localeMap)
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, follow" />
    <title>{site.brand}</title>
    <meta name="description" content={site.tagline ?? ''} />
    <meta http-equiv="refresh" content={`0; url=${defaultPath}`} />
    <link rel="canonical" href={`${siteUrl}${defaultPath}`} />
    {site.locales.map((l) => (
      <link rel="alternate" hreflang={l.hreflang} href={`${siteUrl}/${l.code}/`} />
    ))}
    <link rel="alternate" hreflang="x-default" href={`${siteUrl}${defaultPath}`} />
    <script is:inline set:html={`
      (function () {
        try {
          var supported = ${localeMapJson};
          var fallback = ${JSON.stringify(defaultPath)};
          var candidates = [];
          if (navigator.languages && navigator.languages.length) {
            for (var j = 0; j < navigator.languages.length; j++) {
              candidates.push(navigator.languages[j]);
            }
          }
          if (navigator.language) candidates.unshift(navigator.language);
          for (var i = 0; i < candidates.length; i++) {
            var base = String(candidates[i] || '').toLowerCase().split('-')[0];
            var target = supported[base];
            if (target) { window.location.replace(target); return; }
          }
          window.location.replace(fallback);
        } catch (e) {
          window.location.replace(${JSON.stringify(defaultPath)});
        }
      })();
    `} />
  </head>
  <body>
    <noscript>
      <p>Select a language:</p>
      <ul>
        {site.locales.map((l) => (
          <li><a href={`/${l.code}/`}>{l.displayName}</a></li>
        ))}
      </ul>
    </noscript>
  </body>
</html>
```

- [ ] **Step 2: Write `dev/src/pages/index.astro`**

```astro
---
import RedirectShell from 'claude-plugins-site/components/RedirectShell.astro'
import { site } from '../config'
---
<RedirectShell site={site} />
```

- [ ] **Step 3: Build + check**

Run: `pnpm --filter claude-plugins-site-dev build`

Expected: `dev/dist/index.html` contains the redirect shell with the generated JS picker and meta-refresh pointing at `/en/`.

Run: `pnpm --filter claude-plugins-site-dev dev`, open `http://localhost:4321/`. Expected: immediate redirect to `/en/` (or whichever locale matches your browser's `navigator.language`).

- [ ] **Step 4: Commit**

```bash
git add src/components/RedirectShell.astro dev/src/pages/index.astro
git commit -m "feat: add RedirectShell — noindex meta-refresh + navigator.languages picker"
```

---

## Task 20: Public exports (`src/index.ts`) + playground switches to top-level import

**Files:**
- Create: `src/index.ts`
- Modify: `dev/src/pages/[locale]/index.astro`
- Modify: `dev/src/pages/index.astro`

- [ ] **Step 1: Write `src/index.ts`**

```ts
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
```

- [ ] **Step 2: Switch playground imports to top-level**

Overwrite `dev/src/pages/[locale]/index.astro`:

```astro
---
import { PageShell, isLang } from 'claude-plugins-site'
import { site } from '../../config'
import { dicts } from '../../locales'

export function getStaticPaths() {
  return site.locales.map(({ code }) => ({ params: { locale: code } }))
}

const { locale } = Astro.params
if (!isLang(locale, site.locales)) {
  throw new Error(`Unsupported locale: ${locale}`)
}
const t = dicts[locale]
---

<PageShell lang={locale} t={t} site={site} />
```

Overwrite `dev/src/pages/index.astro`:

```astro
---
import { RedirectShell } from 'claude-plugins-site'
import { site } from '../config'
---
<RedirectShell site={site} />
```

- [ ] **Step 3: Build**

Run: `pnpm --filter claude-plugins-site-dev build`

Expected: identical output to Task 19's build — just proves that top-level re-exports work.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts dev/src/pages/
git commit -m "feat: add public index — one-import API for consumers"
```

---

## Task 21: Package README + final verification

**Files:**
- Create: `README.md`
- Create: `LICENSE` (MIT)

- [ ] **Step 1: Write `LICENSE`**

Standard MIT license. Use `[year]` = 2026, `[author]` = `crankshift`. The full text is stable and well-known; paste the canonical MIT text.

- [ ] **Step 2: Write `README.md`**

```markdown
# claude-plugins-site

Generic Astro shell for Claude Code plugin landing pages — used by
[`lawpowers`](https://github.com/crankshift/lawpowers),
[`businesspowers`](https://github.com/crankshift/businesspowers),
and future `*powers` repos.

Ship a landing page by writing a `config.ts` + three locale files. The shell
owns layout, components, SEO, i18n, and design tokens.

## Quick start

In a consumer repo (e.g. `lawpowers/site/`):

```bash
pnpm add claude-plugins-site@file:../../claude-plugins-site
# or: pnpm add @crankshift/claude-plugins-site (once published to npm)
```

Create `src/config.ts`:

```ts
import type { SiteConfig } from 'claude-plugins-site'

export const site: SiteConfig = {
  brand: 'lawpowers',
  repo: 'crankshift/lawpowers',
  url: 'https://lawpowers.web.app',
  defaultLocale: 'en',
  locales: [
    { code: 'en', hreflang: 'en', ogLocale: 'en_US', displayName: 'EN' },
    { code: 'ua', hreflang: 'uk', ogLocale: 'uk_UA', displayName: 'УКР' },
    { code: 'pl', hreflang: 'pl', ogLocale: 'pl_PL', displayName: 'PL' },
  ],
  plugins: [
    { code: 'ua', agents: [...], skills: [...], sources: [...] },
    { code: 'pl', agents: [...], skills: [...], sources: [...] },
  ],
}
```

Create `src/locales/{en,ua,pl}.ts` satisfying `ShellTranslation`. See the
playground in `dev/src/locales/` for the full shape.

Write `src/pages/[locale]/index.astro`:

```astro
---
import { PageShell, isLang } from 'claude-plugins-site'
import { site } from '../../config'
import { dicts } from '../../locales'

export function getStaticPaths() {
  return site.locales.map(({ code }) => ({ params: { locale: code } }))
}
const { locale } = Astro.params
if (!isLang(locale, site.locales)) throw new Error(`Unsupported locale: ${locale}`)
const t = dicts[locale]
---
<PageShell lang={locale} t={t} site={site} />
```

And `src/pages/index.astro`:

```astro
---
import { RedirectShell } from 'claude-plugins-site'
import { site } from '../config'
---
<RedirectShell site={site} />
```

## Overriding a section

`PageShell` exposes a named slot for every section. Pass content with
`slot="..."` to override; the default fallback component renders otherwise.

```astro
<PageShell lang={locale} t={t} site={site}>
  <MyCustomHero slot="hero" />
  <Testimonials />  <!-- default slot, appears after disclaimer -->
</PageShell>
```

Slot names: `nav`, `hero`, `plugins`, `install`, `principles`, `sources`,
`disclaimer`, `footer`.

## Local development

```bash
pnpm install
pnpm --filter claude-plugins-site-dev dev
```

Opens the playground at `http://localhost:4321/` with sample plugin data.

## Tech

Astro 6 source-only package. No build step on the shell side — consumers'
Astro pipelines compile `.astro` and `.ts` directly. `peerDependencies.astro`
pins compatibility.
```

- [ ] **Step 3: Final verification**

Run in order:

```bash
pnpm install
pnpm --filter claude-plugins-site-dev check   # astro check
pnpm --filter claude-plugins-site-dev build   # astro build
```

Expected: all three exit 0. `dev/dist/` contains `en/index.html`, `ua/index.html`, `pl/index.html`, and `index.html` (the redirect shell).

- [ ] **Step 4: Manual visual walkthrough**

Run: `pnpm --filter claude-plugins-site-dev dev`

Walk through each locale:
1. `http://localhost:4321/` redirects to `/en/` (or your `navigator.language`).
2. `/en/` renders: Nav → Hero → Plugins → Install → Principles → Sources → Disclaimer → Footer.
3. Copy buttons work on Hero install block, PluginCard install row, and Install terminal block.
4. Install-tab switching works (UA / PL / UA + PL).
5. Theme toggle flips the palette and persists across reload.
6. Language pills switch between `/en/`, `/ua/`, `/pl/`.
7. Responsive: resize to 600px and verify each section degrades correctly (plugin cards stack, hero stats become 2x2, foot-grid becomes 1 column).

Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add README.md LICENSE
git commit -m "docs: add README with consumer quick-start and slot override reference"
```

- [ ] **Step 6: Tag v0.1.0 (optional, for future `github:#v0.1.0` installs)**

```bash
git tag v0.1.0
```

(Don't push yet — this is a local marker the user can push when they're ready.)

---

## Done criteria

- [x] `pnpm --filter claude-plugins-site-dev check` exits 0.
- [x] `pnpm --filter claude-plugins-site-dev build` exits 0.
- [x] All 7 body sections + Nav + Footer render on each locale.
- [x] Theme toggle + language switcher work and persist.
- [x] All copy buttons copy.
- [x] Install tabs derive from `site.plugins` and include an "all" tab when `plugins.length >= 2`.
- [x] `src/index.ts` re-exports the full public API.
- [x] `README.md` covers consumer quick-start + slot override model.

## Follow-on work (not in this plan)

1. **Lawpowers migration** (separate spec + plan). Replace `lawpowers/site/src/components/*` and `BaseLayout.astro` with `file:` imports from `claude-plugins-site`. Verify visual parity with pre-migration build.
2. **Businesspowers site scaffold** (separate spec + plan). Authored against the shell from day one.
3. **npm publish** under a scope (e.g. `@crankshift/claude-plugins-site`). One-time setup: scope registration, `publishConfig.access: "public"`, a tiny release script. Then consumers switch from `file:` to semver range.
