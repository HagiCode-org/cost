import { act } from "@testing-library/react"
import { vi } from "vitest"

type MatchMediaListener = (event: MediaQueryListEvent) => void

const MOBILE_QUERY = "(max-width: 767px)"
const listeners = new Set<MatchMediaListener>()

let installed = false

export function installViewportMock() {
  if (installed) {
    return
  }

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: window.innerWidth < 768,
      media: query,
      onchange: null,
      addEventListener: (event: string, listener: MatchMediaListener) => {
        if (event === "change") {
          listeners.add(listener)
        }
      },
      removeEventListener: (event: string, listener: MatchMediaListener) => {
        if (event === "change") {
          listeners.delete(listener)
        }
      },
      addListener: (listener: MatchMediaListener) => listeners.add(listener),
      removeListener: (listener: MatchMediaListener) => listeners.delete(listener),
      dispatchEvent: () => true,
    })),
  })

  installed = true
}

export function setViewportWidth(width: number) {
  act(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: width,
    })

    const event = {
      matches: width < 768,
      media: MOBILE_QUERY,
    } as MediaQueryListEvent

    listeners.forEach((listener) => listener(event))
    window.dispatchEvent(new Event("resize"))
  })
}
