interface AgentScaleIndicatorProps {
  title: string
  value: string
  badge: string
  summary: string
  position: number
  direction: "danger" | "value"
  ticks: string[]
  compact?: boolean
  beforePosition?: number
  beforeValue?: string
}

export function AgentScaleIndicator({
  title,
  value,
  badge,
  summary,
  position,
  direction,
  ticks,
  compact = false,
  beforePosition,
  beforeValue,
}: AgentScaleIndicatorProps) {
  const segments =
    direction === "danger"
      ? [
          "bg-emerald-500/18 text-emerald-700 dark:text-emerald-300",
          "bg-amber-500/18 text-amber-700 dark:text-amber-300",
          "bg-destructive/18 text-destructive",
        ]
      : [
          "bg-destructive/18 text-destructive",
          "bg-amber-500/18 text-amber-700 dark:text-amber-300",
          "bg-emerald-500/18 text-emerald-700 dark:text-emerald-300",
        ]

  return (
    <div className={compact ? "space-y-3" : "rounded-2xl border bg-background/78 p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className={compact ? "display-type text-xl font-bold" : "display-type text-2xl font-bold"}>{value}</p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
          {badge}
        </span>
      </div>

      <div>
        <div className="relative" role="img" aria-label={`${title}: ${value}, ${badge}. ${summary}${beforeValue ? `. Before: ${beforeValue}` : ""}`}>
          <div className="grid grid-cols-3 gap-1">
            {segments.map((segmentClass, index) => (
              <div
                key={index}
                className={`${compact ? "h-2.5" : "h-3"} rounded-full ${segmentClass}`}
                aria-hidden="true"
              />
            ))}
          </div>

          {beforePosition != null ? (
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${beforePosition}%` }}
              aria-hidden="true"
            >
              <div className="flex flex-col items-center">
                <div className={`${compact ? "size-3" : "size-3.5"} rounded-full border-2 border-background bg-muted-foreground/40 shadow-sm`} />
                <div className={`${compact ? "h-2" : "h-3"} mt-1 w-px bg-muted-foreground/30`} />
              </div>
            </div>
          ) : null}

          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${position}%` }}
            aria-hidden="true"
          >
            <div className="flex flex-col items-center">
              <div
                className={`${compact ? "size-3.5" : "size-4"} rounded-full border-2 border-background bg-foreground shadow-sm`}
              />
              <div className={`${compact ? "h-3" : "h-4"} mt-1 w-px bg-foreground/50`} />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>

      <p className={`${compact ? "text-[11px]" : "text-xs"} leading-relaxed text-muted-foreground`}>{summary}</p>
    </div>
  )
}
