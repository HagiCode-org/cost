import { vi } from "vitest"

/** Test-only view of the global that Hagilight's click tracking reads (`globalThis.gtag`). */
type GtagWindow = Window & { gtag?: (...args: unknown[]) => void }

export type GtagStub = ReturnType<typeof vi.fn>

export function installGtagStub(): GtagStub {
  const stub = vi.fn()
  ;(window as GtagWindow).gtag = stub
  return stub
}

export function removeGtag() {
  delete (window as GtagWindow).gtag
}

export function currentGtag(): GtagStub | undefined {
  return (window as GtagWindow).gtag as GtagStub | undefined
}

export function readGtagWindow(): () => unknown {
  return () => (window as GtagWindow).gtag
}
