# powers-landing-shell

Astro 6 source-only shell package for Claude Code plugin landing pages. No build step on the shell side -- consumers' Astro pipelines compile `.astro` and `.ts` directly. Consumers write `config.ts` + locale files + two one-liner pages and get a full landing site.

## Repo structure

```
powers-landing-shell/
├── package.json              # exports: '.', './i18n', './types', './styles/global.css',
│                             #          './components/*', './layouts/*'
├── src/
│   ├── index.ts              # barrel: re-exports layouts, components, helpers, types
│   ├── types.ts              # SiteConfig, ShellTranslation, Plugin, LocaleSpec, Source
│   ├── i18n/index.ts         # isLang(), getT(), marketplaceSlugOf(), marketplaceAddCommand(),
│   │                         # pluginInstallCommand(), reloadCommand(), HREFLANG_PRESETS, OG_LOCALE_PRESETS
│   ├── styles/global.css     # design tokens (oklch CSS custom properties, light/dark themes)
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── Plugins.astro
│   │   ├── PluginCard.astro
│   │   ├── Install.astro
│   │   ├── Principles.astro
│   │   ├── Sources.astro
│   │   ├── Disclaimer.astro
│   │   ├── Footer.astro
│   │   ├── BrandMark.astro
│   │   ├── CopyButton.astro
│   │   └── RedirectShell.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro  # SEO, meta tags, JSON-LD, favicon, theme bootstrap
│   │   └── PageShell.astro   # composes all sections; exposes named slots for overrides
│   └── pages/                # empty -- consumers provide their own pages
├── dev/                      # playground consumer (powers-landing-shell-dev)
│   ├── package.json
│   ├── astro.config.mjs
│   └── src/
└── CLAUDE.md                 # this file
```

## Key types

- **`SiteConfig`** -- brand, brandSymbol?, tagline?, repo, url, ogImage?, accent?, defaultLocale, locales, plugins, marketplaceInstall?, marketplaceSlug?, reloadCmd?
- **`ShellTranslation`** -- all UI text: seo, nav, hero, plugins, install, principles, sources, disclaimer, footer, a11y, plugin_meta, agents, skills
- **`Plugin`** -- code, agents[], skills[], sources[], flag?
- **`LocaleSpec`** -- code, hreflang, ogLocale, displayName
- **`Source`** -- name, url

## Layouts

- **`BaseLayout`** -- wraps `<html>`. Handles SEO meta, Open Graph, hreflang alternates, JSON-LD Organization schema, inline favicon SVG (uses `brandSymbol`), Google Fonts, global CSS import, and dark/light theme bootstrap script.
- **`PageShell`** -- composes all section components in order. Exposes named slots (`nav`, `hero`, `plugins`, `install`, `principles`, `sources`, `disclaimer`, `footer`) so consumers can override individual sections. Default slot content appears after the disclaimer.

## Components

| Component | Purpose |
|---|---|
| `Nav` | Top navigation bar with brand mark, section links, locale switcher, theme toggle |
| `Hero` | Above-the-fold section with stats, install command, CTAs |
| `Plugins` | Section listing all plugins |
| `PluginCard` | Individual plugin card with agents/skills lists |
| `Install` | Three-column install instructions (CLI, Desktop, VS Code) |
| `Principles` | Key-value list of project principles |
| `Sources` | Primary legal/official sources table per plugin |
| `Disclaimer` | Legal disclaimer block with warn mark |
| `Footer` | Site footer with links, plugin list, legal text, brand mark |
| `BrandMark` | Circled symbol (`<slot>` defaults to `§`) used in Nav, Footer, Disclaimer |
| `CopyButton` | Click-to-copy button with success feedback |
| `RedirectShell` | Root index page that redirects to browser-preferred locale |

## i18n helpers

- `isLang(value, locales)` -- type guard confirming a string is a valid locale code
- `getT(lang, dicts)` -- retrieve the dictionary for a locale or throw
- `marketplaceSlugOf(repo)` -- extract slug from `owner/repo` string
- `marketplaceAddCommand(repo, override?)` -- full `/plugin marketplace add ...` command
- `pluginInstallCommand(pluginCode, slug)` -- `/plugin install <code>@<slug>`
- `reloadCommand(override?)` -- defaults to `/reload-plugins`
- `HREFLANG_PRESETS`, `OG_LOCALE_PRESETS` -- lookup tables for common locale codes

## `brandSymbol` pattern

Optional field on `SiteConfig`. Defaults to `§` via the `BrandMark` slot fallback. When set, four locations reflect it:

1. **Nav** -- `BrandMark` in the top-left brand link
2. **Footer** -- `BrandMark` next to the brand name
3. **Disclaimer** -- `.warn-mark` element
4. **BaseLayout** -- inline SVG favicon

When `brandSymbol` is undefined (lawpowers), the `§` default renders. When set (businesspowers uses `'%'`), all four swap to the configured character.

## Design tokens

`src/styles/global.css` defines CSS custom properties using `oklch()` color space. Two themes:

- Light (`:root` default)
- Dark (`:root[data-theme='dark']`)

Tokens cover: accent color (h/c/l decomposed), backgrounds (`--bg`, `--bg-2`, `--bg-3`), ink colors, rules, code background, font stacks (display serif, sans, mono), border radii, max width.

Consumers import via `powers-landing-shell/styles/global.css` in their `BaseLayout` usage.

## Dev playground

```bash
pnpm install
pnpm --filter powers-landing-shell-dev dev
```

Opens at `http://localhost:4321/` with sample plugin data. The playground lives in `dev/` and is a minimal consumer that exercises all shell features.

## Consumer pattern

A consumer repo (e.g. `lawpowers/site/`, `businesspowers/site/`) needs:

1. `src/config.ts` -- export a `SiteConfig`
2. `src/locales/{en,ua,pl,...}.ts` -- one `ShellTranslation` per locale
3. `src/pages/index.astro` -- one-liner using `RedirectShell`
4. `src/pages/[locale]/index.astro` -- one-liner using `PageShell`

Install: `pnpm add github:crankshift/powers-landing-shell`

## Current consumers

| Repo | Domain | `brandSymbol` |
|---|---|---|
| [lawpowers](https://github.com/crankshift/lawpowers) | Legal | _(default `§`)_ |
| [businesspowers](https://github.com/crankshift/businesspowers) | Tax / business | `'%'` |

## Conventions

- No runtime framework -- vanilla JS in `<script>` blocks only.
- No build step in this package. Consumers compile everything via their own Astro pipeline.
- Exports are source files (`.ts`, `.astro`, `.css`), not compiled artifacts.
- Keep component props minimal; pass `site: SiteConfig` and `t: ShellTranslation` through the tree.
