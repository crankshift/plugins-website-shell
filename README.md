# powers-landing-shell

Generic Astro shell for Claude Code plugin landing pages — used by
[`lawpowers`](https://github.com/crankshift/lawpowers),
[`businesspowers`](https://github.com/crankshift/businesspowers),
and future `*powers` repos.

Ship a landing page by writing a `config.ts` + three locale files. The shell
owns layout, components, SEO, i18n, and design tokens.

## Quick start

In a consumer repo (e.g. `lawpowers/site/`):

```bash
pnpm add github:crankshift/powers-landing-shell
```

Create `src/config.ts`:

```ts
import type { SiteConfig } from 'powers-landing-shell'

export const site: SiteConfig = {
  brand: 'lawpowers',
  brandSymbol: '%',            // optional; defaults to '§'
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
import { PageShell, isLang } from 'powers-landing-shell'
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
import { RedirectShell } from 'powers-landing-shell'
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

## `brandSymbol`

`SiteConfig.brandSymbol` is an optional string that overrides the default `§`
symbol rendered by `BrandMark`. When set, the symbol propagates to all four
locations that display it:

- **Nav** brand mark (top-left)
- **Footer** brand mark
- **Disclaimer** warning mark
- **BaseLayout** favicon (inline SVG)

When `brandSymbol` is omitted the `§` default renders everywhere.

| Consumer | `brandSymbol` | Renders |
|---|---|---|
| lawpowers | _(not set)_ | `§` |
| businesspowers | `'%'` | `%` |

## Local development

```bash
pnpm install
pnpm --filter powers-landing-shell-dev dev
```

Opens the playground at `http://localhost:4321/` with sample plugin data.

## Tech

Astro 6 source-only package. No build step on the shell side — consumers'
Astro pipelines compile `.astro` and `.ts` directly. `peerDependencies.astro`
pins compatibility.
