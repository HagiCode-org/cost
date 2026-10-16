import { gaEventAttributes } from "@hagicode/hagilight-core/analytics-events"
import { getExternalLinkRel } from "@/lib/link-policy"

const HAGICODE_HREF = "https://hagicode.com"
const HAGICODE_LINK_PROPS = {
  href: HAGICODE_HREF,
  target: "_blank",
  rel: getExternalLinkRel(HAGICODE_HREF),
} as const

const HAGICODE_PATTERN = /(HagiCode|HAGICODE)/g

export function LinkHagicode({ children }: { children: React.ReactNode }) {
  if (typeof children !== "string") return <>{children}</>

  const parts = children.split(HAGICODE_PATTERN)

  return (
    <>
      {parts.map((part, i) =>
        /^(HagiCode|HAGICODE)$/.test(part) ? (
          <a
            key={i}
            {...HAGICODE_LINK_PROPS}
            {...gaEventAttributes({ category: "navigation", label: "hagicode_brand", location: "cost_body" })}
            className="underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  )
}
