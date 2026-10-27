import { act, cleanup, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "@/contexts/theme-context"
import "@/i18n/config"
import { useShareCurrentSite } from "./use-share-current-site"

type FakePostHog = {
  __loaded: boolean
  capture: ReturnType<typeof vi.fn>
  has_opted_out_capturing: ReturnType<typeof vi.fn>
}

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
}

function setClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  })
}

describe("useShareCurrentSite assessment_shared", () => {
  let fake: FakePostHog

  beforeEach(() => {
    fake = {
      __loaded: true,
      capture: vi.fn(),
      has_opted_out_capturing: vi.fn(() => false),
    }
    ;(window as unknown as { posthog?: FakePostHog }).posthog = fake
  })

  afterEach(() => {
    cleanup()
    Reflect.deleteProperty(window, "posthog")
    Reflect.deleteProperty(navigator, "clipboard")
  })

  it("sends assessment_shared with has_result true when the share happens with a result", async () => {
    setClipboard(vi.fn(async () => undefined))
    const { result } = renderHook(() => useShareCurrentSite({ hasResult: true }), { wrapper })

    await act(async () => {
      await result.current.shareCurrentSite("summary text")
    })

    expect(result.current.shareState).toBe("copied")
    expect(fake.capture).toHaveBeenCalledTimes(1)
    expect(fake.capture).toHaveBeenCalledWith("assessment_shared", { has_result: true })
  })

  it("sends assessment_shared with has_result false when the share happens before any result", async () => {
    setClipboard(vi.fn(async () => undefined))
    const { result } = renderHook(() => useShareCurrentSite({ hasResult: false }), { wrapper })

    await act(async () => {
      await result.current.shareCurrentSite()
    })

    expect(fake.capture).toHaveBeenCalledTimes(1)
    expect(fake.capture).toHaveBeenCalledWith("assessment_shared", { has_result: false })
  })

  it("sends no event and reports the error state when the clipboard write fails", async () => {
    setClipboard(vi.fn(async () => {
      throw new Error("permission denied")
    }))
    const { result } = renderHook(() => useShareCurrentSite({ hasResult: true }), { wrapper })

    await act(async () => {
      await result.current.shareCurrentSite()
    })

    expect(result.current.shareState).toBe("error")
    expect(fake.capture).not.toHaveBeenCalled()
  })

  it("sends only the has_result key, never the share URL or the share text", async () => {
    const writeText = vi.fn(async () => undefined)
    setClipboard(writeText)
    const { result } = renderHook(() => useShareCurrentSite({ hasResult: true }), { wrapper })

    await act(async () => {
      await result.current.shareCurrentSite("income 250000 CNY https://example.test/?income=250000")
    })

    expect(writeText).toHaveBeenCalledTimes(1)
    const [, payload] = fake.capture.mock.calls[0] as [string, Record<string, unknown>]
    expect(Object.keys(payload)).toEqual(["has_result"])
    expect(JSON.stringify(payload)).not.toMatch(/https?:|250000/)
  })
})
