import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast toast-hydration border border-border/80 bg-background/96 text-foreground shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-border/70 dark:bg-popover/96 dark:text-popover-foreground",
          title: "text-sm font-semibold text-foreground",
          description: "text-sm leading-6 text-muted-foreground",
          success:
            "border-emerald-300/70 bg-[color-mix(in_oklab,var(--background)_88%,white_12%)] text-foreground dark:border-emerald-700/60 dark:bg-[color-mix(in_oklab,var(--popover)_92%,black_8%)]",
          error:
            "border-destructive/40 bg-[color-mix(in_oklab,var(--background)_90%,white_10%)] text-foreground dark:bg-[color-mix(in_oklab,var(--popover)_92%,black_8%)]",
          warning:
            "border-amber-300/70 bg-[color-mix(in_oklab,var(--background)_90%,white_10%)] text-foreground dark:border-amber-700/60 dark:bg-[color-mix(in_oklab,var(--popover)_92%,black_8%)]",
          info:
            "border-sky-300/70 bg-[color-mix(in_oklab,var(--background)_90%,white_10%)] text-foreground dark:border-sky-700/60 dark:bg-[color-mix(in_oklab,var(--popover)_92%,black_8%)]",
          icon: "text-foreground/90",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
