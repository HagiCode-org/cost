import { fireEvent, render } from "@testing-library/react"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

import { LinkHagicode } from "./link-hagicode"
import { installGaEventTracking } from "@hagicode/hagilight-core/analytics-events"
import { installGtagStub, readGtagWindow, removeGtag, currentGtag } from "@/test/gtag"

beforeAll(() => {
  installGaEventTracking(document, readGtagWindow())
})

beforeEach(() => {
  installGtagStub()
})

describe("LinkHagicode click tracking", () => {
  it("tags the HagiCode brand link with one event for the body location", () => {
    const { getByRole } = render(<LinkHagicode>Powered by HagiCode</LinkHagicode>)

    fireEvent.click(getByRole("link", { name: "HagiCode" }))

    expect(currentGtag()).toHaveBeenCalledTimes(1)
    expect(currentGtag()).toHaveBeenCalledWith(
      "event",
      "link_click",
      expect.objectContaining({
        event_category: "navigation",
        event_label: "hagicode_brand",
        link_location: "cost_body",
        link_url: "https://hagicode.com/",
      }),
    )
  })

  it("keeps the same label for every HagiCode mention in a string", () => {
    const { getAllByRole } = render(<LinkHagicode>HagiCode and HAGICODE</LinkHagicode>)

    getAllByRole("link").forEach((link) => fireEvent.click(link))

    const labels = currentGtag()!.mock.calls.map((call) => (call[2] as { event_label: string }).event_label)
    expect(labels).toEqual(["hagicode_brand", "hagicode_brand"])
  })

  it("renders the first-party brand link with opener protection and without noreferrer", () => {
    const { getByRole } = render(<LinkHagicode>Powered by HagiCode</LinkHagicode>)

    const link = getByRole("link", { name: "HagiCode" })
    expect(link.getAttribute("target")).toBe("_blank")
    expect(link.getAttribute("rel")).toBe("noopener")
  })

  it("does not throw when gtag is absent", () => {
    removeGtag()
    const { getByRole } = render(<LinkHagicode>HagiCode</LinkHagicode>)

    expect(() => fireEvent.click(getByRole("link", { name: "HagiCode" }))).not.toThrow()
  })
})
