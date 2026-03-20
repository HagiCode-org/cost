const HAGICODE_LINK_PROPS = {
  href: "https://hagicode.com",
  target: "_blank",
  rel: "noopener noreferrer",
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
