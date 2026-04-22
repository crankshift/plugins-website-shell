import type { ShellTranslation } from 'powers-landing-shell/types'
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
    sub: 'This is playground sample data used to develop powers-landing-shell.',
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
    headings: {
      ua: 'Ukraine (sample)',
      pl: 'Poland (sample)',
    } satisfies Record<PluginCode, string>,
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
    ua: {
      name: 'Ukraine (sample)',
      tag: 'Sample tag line',
      lang_value: 'Ukrainian',
    },
    pl: {
      name: 'Poland (sample)',
      tag: 'Sample tag line',
      lang_value: 'Polish',
    },
  } satisfies Record<
    PluginCode,
    { name: string; tag: string; lang_value: string }
  >,
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
