import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutPath = resolve(process.cwd(), 'src/layouts/BaseLayout.astro');

describe('Cost BaseLayout Hagilight integration', () => {
  it('mounts the shared footer and banner around the React island', async () => {
    const source = await readFile(layoutPath, 'utf8');

    expect(source).toContain('import Footer from "@hagicode/hagilight-core/Footer"');
    expect(source).toContain('import PromotoBanner from "@hagicode/hagilight-core/PromotoBanner"');
    expect(source).toContain('<IncomeTokenExperienceIsland client:load />');
    expect(source.indexOf('<IncomeTokenExperienceIsland')).toBeLessThan(source.indexOf('<PromotoBanner'));
    expect(source.indexOf('<PromotoBanner')).toBeLessThan(source.indexOf('<Footer'));
  });

  it('configures the shared footer with Cost site identity and local link options', async () => {
    const source = await readFile(layoutPath, 'utf8');

    expect(source).toContain('cost-calculator');
    expect(source).toContain('costSiteUrl');
    expect(source).toContain('extraLinks');
    expect(source).toContain('footer.links.github');
    expect(source).toContain('footer.links.steam');
    expect(source).toContain('footer.links.pricing');
  });

  it('pre-renders a locale template per secondary language and coordinates the live footer', async () => {
    const source = await readFile(layoutPath, 'utf8');

    expect(source).toContain('template data-locale');
    expect(source).toContain("querySelector('footer.hagilight-footer')");
    expect(source).toContain("document.querySelector(`template[data-locale=");
  });

  it('removes the legacy local promotion card and footer', async () => {
    const source = await readFile(layoutPath, 'utf8');

    expect(source).not.toMatch(/PromoteCard|promote-loader|HomeFooter|data-promote-card/u);
  });
});