import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutPath = resolve(process.cwd(), 'src/layouts/BaseLayout.astro');
const configPath = resolve(process.cwd(), 'astro.config.mjs');
const islandPath = resolve(process.cwd(), 'src/components/IncomeTokenExperienceIsland.tsx');

describe('Cost BaseLayout Hagilight integration', () => {
  it('mounts the shared footer and banner around the React island', async () => {
    const source = await readFile(layoutPath, 'utf8');

    expect(source).toContain('import Footer from "@hagicode/hagilight/Footer"');
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

  it('renders the static head through the Hagilight SEO component', async () => {
    const source = await readFile(layoutPath, 'utf8');

    expect(source).toContain('import SEOHead from "@hagicode/hagilight/SEOHead"');
    expect(source).toContain('<SEOHead');
    expect(source).toContain('head={seoHeadEntries}');
    expect(source).toContain('resolveSEOConfig(defaultLanguage)');
    expect(source).toContain('buildAllSchemas(defaultLanguage)');
    expect(source).toContain('json-ld-${id}');
    expect(source).not.toMatch(/["'](\/)?favicon\.(ico|svg)["']|sitemap\.xml/u);
  });

  it('leaves og:url, og:type, og:site_name, og:locale and twitter:card to the Hagilight SEO component', async () => {
    const source = await readFile(layoutPath, 'utf8');

    expect(source).toContain('siteSeo={{ title: metadata.siteName }}');
    expect(source).toContain('locale={metadata.locale}');
    expect(source).not.toMatch(/property: "og:(url|type|site_name|locale)"|name: "twitter:card"/u);
  });

  it('loads 51LA through the shared component with the VITE_51LA_ID override and default ID', async () => {
    const source = await readFile(layoutPath, 'utf8');

    expect(source).toContain('import Analytics51LA from "@hagicode/hagilight-core/Analytics51LA"');
    expect(source).toContain('<Analytics51LA siteId={import.meta.env.VITE_51LA_ID || "L6b88a5yK4h2Xnci"} />');
    expect(source).not.toContain('bootstrapAnalytics');
  });

  it('keeps the island free of the local 51LA bootstrap', async () => {
    const source = await readFile(islandPath, 'utf8');

    expect(source).not.toContain('bootstrapAnalytics');
    expect(source).not.toContain('@/lib/analytics');
  });

  it('registers the Hagilight integration and favicon in the Astro config', async () => {
    const source = await readFile(configPath, 'utf8');

    expect(source).toMatch(/import \{ hagilight, hagilightFavicon \} from "@hagicode\/hagilight\/integration"/u);
    expect(source).toMatch(/integrations:\s*\[react\(\),\s*hagilightFavicon\(\),\s*hagilight\(\)\]/u);
  });
});
