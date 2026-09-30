import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react"

export type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

interface ThemeStore {
  getSnapshot: () => Theme
  getServerSnapshot: () => Theme
  subscribe: (listener: () => void) => () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark"
}

function createThemeStore(defaultTheme: Theme): ThemeStore {
  let themeSnapshot: Theme | undefined
  const listeners = new Set<() => void>()

  function getSnapshot(): Theme {
    if (typeof window === "undefined") {
      return defaultTheme
    }

    if (!themeSnapshot) {
      const searchTheme = new URLSearchParams(window.location.search).get("theme")
      if (isTheme(searchTheme)) {
        themeSnapshot = searchTheme
      } else {
        try {
          const storedTheme = window.localStorage.getItem("theme")
          themeSnapshot = isTheme(storedTheme) ? storedTheme : defaultTheme
        } catch {
          themeSnapshot = defaultTheme
        }
      }
    }

    return themeSnapshot
  }

  return {
    getSnapshot,
    getServerSnapshot: () => defaultTheme,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    setTheme(theme) {
      themeSnapshot = theme
      listeners.forEach((listener) => listener())
    },
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: ReactNode
  defaultTheme?: Theme
}) {
  const store = useMemo(() => createThemeStore(defaultTheme), [defaultTheme])
  const theme = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    try {
      window.localStorage.setItem("theme", theme)
    } catch {
      // Keep the theme usable when storage is unavailable.
    }
  }, [theme])

  const value = {
    theme,
    setTheme: store.setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
