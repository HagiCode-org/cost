interface CostSiteNoticeProps {
  disclaimerTitle: string
  disclaimer: string
  extensionNote: string
}

/**
 * Site-owned notice that preserves Cost's non-link legal/disclaimer copy after the
 * shared Hagilight footer took over the navigational link sections. This is intentionally
 * kept outside the shared navigation and rendered adjacent to the shared footer.
 */
export function CostSiteNotice({
  disclaimerTitle,
  disclaimer,
  extensionNote,
}: CostSiteNoticeProps) {
  return (
    <section
      className="cost-site-notice px-4 pb-6 pt-2 sm:px-6 lg:px-8"
      aria-label={disclaimerTitle}
      data-testid="cost-site-notice"
    >
      <div className="mx-auto max-w-7xl">
        <p className="mono-label text-primary">{disclaimerTitle}</p>
        <p className="mt-2 max-w-3xl text-xs leading-6 text-muted-foreground">{disclaimer}</p>
        <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">{extensionNote}</p>
      </div>
    </section>
  )
}