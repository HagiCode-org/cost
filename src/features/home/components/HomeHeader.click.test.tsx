import { fireEvent, screen } from "@testing-library/react"
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { HomeHeader } from "./HomeHeader"
import i18n from "@/i18n/config"
import { installGaEventTracking } from "@hagicode/hagilight-core/analytics-events"
import { renderWithProviders } from "@/test/render"
import { currentGtag, installGtagStub, readGtagWindow, removeGtag, type GtagStub } from "@/test/gtag"
import { installViewportMock, setViewportWidth } from "@/test/viewport"

const DOCS_URL = "https://docs.hagicode.com/"
const OFFICIAL_URL = "https://hagicode.com/"

type GtagCall = [string, string, Record<string, unknown>]

function gtagCalls(stub: GtagStub | undefined): GtagCall[] {
  return (stub?.mock.calls ?? []) as GtagCall[]
}

beforeAll(() => {
  installViewportMock()
  // Installs the one document-level listener that Cost's GoogleAnalytics component installs in production.
  installGaEventTracking(document, readGtagWindow())
})

beforeEach(async () => {
  document.body.innerHTML = ""
  window.history.replaceState({}, "", "/")
  installGtagStub()
  await i18n.changeLanguage("zh-CN")
})

afterEach(() => {
  removeGtag()
})

describe("HomeHeader click tracking", () => {
  it("sends exactly one navigation event for a desktop header product link", async () => {
    setViewportWidth(1280)
    renderWithProviders(<HomeHeader />)

    const docsLink = document.querySelector<HTMLAnchorElement>(`nav a[href="${DOCS_URL}"]`)
    expect(docsLink).not.toBeNull()
    fireEvent.click(docsLink as HTMLAnchorElement)

    const calls = gtagCalls(currentGtag())
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual([
      "event",
      "link_click",
      {
        event_category: "navigation",
        event_label: "docs",
        link_location: "cost_header",
        link_url: DOCS_URL,
        transport_type: "beacon",
      },
    ])
  })

  it("sends the same label with the mobile-menu location for a link inside the navigation sheet", async () => {
    setViewportWidth(375)
    renderWithProviders(<HomeHeader />)

    fireEvent.click(await screen.findByRole("button", { name: "首页导航" }))
    const dialog = await screen.findByRole("dialog")
    const sheetLink = dialog.querySelector<HTMLAnchorElement>(`a[href="${OFFICIAL_URL}"]`)
    expect(sheetLink).not.toBeNull()

    fireEvent.click(sheetLink as HTMLAnchorElement)

    const calls = gtagCalls(currentGtag())
    expect(calls).toHaveLength(1)
    expect(calls[0][2]).toMatchObject({
      event_category: "navigation",
      event_label: "official",
      link_location: "cost_mobile_menu",
      link_url: OFFICIAL_URL,
    })
  })

  it("uses the identical label under zh-CN and en-US", async () => {
    setViewportWidth(1280)
    const { unmount } = renderWithProviders(<HomeHeader />)
    fireEvent.click(document.querySelector<HTMLAnchorElement>(`nav a[href="${DOCS_URL}"]`) as HTMLAnchorElement)
    unmount()

    await i18n.changeLanguage("en-US")
    renderWithProviders(<HomeHeader />)
    fireEvent.click(document.querySelector<HTMLAnchorElement>(`nav a[href="${DOCS_URL}"]`) as HTMLAnchorElement)

    const labels = gtagCalls(currentGtag()).map(([, , params]) => params.event_label)
    expect(labels).toEqual(["docs", "docs"])
  })

  it("sends nothing for an in-page anchor that is not tagged", () => {
    const anchor = document.createElement("a")
    anchor.href = "#main-content"
    document.body.appendChild(anchor)

    fireEvent.click(anchor)

    expect(currentGtag()).not.toHaveBeenCalled()
  })

  it("does not throw and still navigates when gtag is absent", () => {
    removeGtag()
    setViewportWidth(1280)
    renderWithProviders(<HomeHeader />)

    const docsLink = document.querySelector<HTMLAnchorElement>(`nav a[href="${DOCS_URL}"]`) as HTMLAnchorElement
    expect(() => fireEvent.click(docsLink)).not.toThrow()
    expect(docsLink.getAttribute("href")).toBe(DOCS_URL)
  })
})
