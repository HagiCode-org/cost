import { describe, expect, it } from 'vitest'

import { resolveCostFooterSiteLinks } from './footer-site-links'

describe('cost footer site links', () => {
  it('returns localized footer metadata for French pages', () => {
    const links = resolveCostFooterSiteLinks('fr-FR')

    expect(links.find((link) => link.siteId === 'hagicode-docs')).toMatchObject({
      label: 'HagiCode Docs',
      description: 'Guides et références officiels.',
    })
  })

  it('keeps the current cost calculator site out of related links', () => {
    const links = resolveCostFooterSiteLinks('zh-CN')

    expect(links.some((link) => link.href === 'https://cost.hagicode.com/')).toBe(false)
  })
})
