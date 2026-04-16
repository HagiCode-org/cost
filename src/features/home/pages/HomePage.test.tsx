import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { HomePage } from "./HomePage"
import i18n from "@/i18n/config"
import * as regionModule from "@/lib/region"
import { formatAppVersion, getAppVersion } from "@/lib/version"
import { renderWithProviders } from "@/test/render"

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  document.head.innerHTML = ""
  window.history.replaceState({}, "", "/")
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  })
  vi.spyOn(regionModule, "detectRegion").mockReturnValue("cn-mainland")
  void i18n.changeLanguage("zh-CN")
})

describe("HomePage", () => {
  it("renders the assessment landing form", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole("heading", { level: 1, name: /Agent 时代，你会不会被淘汰/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/你的年薪是/)).toBeInTheDocument()
    expect(screen.getByText(`版本 ${formatAppVersion(getAppVersion())}`)).toBeInTheDocument()
  })

  it("switches the page copy to English", async () => {
    renderWithProviders(<HomePage />)

    fireEvent.click(screen.getByRole("button", { name: /^EN$/i }))

    expect(await screen.findByRole("heading", { level: 1, name: /Calculate whether the Agent era makes you replaceable/i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: "Smart" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: "Efficient" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: "Interesting" })).toBeInTheDocument()
  })

  it("keeps China-mainland city labels after switching the UI language", async () => {
    renderWithProviders(<HomePage />)

    fireEvent.click(screen.getByRole("button", { name: /^EN$/i }))

    expect(await screen.findByText(/Current default region: China mainland/)).toBeInTheDocument()
    expect(
      screen.getByRole("option", { name: "Beijing / Shanghai / Shenzhen / Guangzhou" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: /Global tier 1 metro/ }),
    ).not.toBeInTheDocument()
  })

  it("hydrates the form from query parameters", () => {
    window.history.replaceState(
      {},
      "",
      "/?incomePreset=40&income=40&city=tier2&model=deepseek-v3&multiplier=3&dailyTokens=120"
    )

    renderWithProviders(<HomePage />)

    expect(screen.getByRole("radio", { name: "40 万" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByLabelText(/你的城市更接近哪座典型城市/)).toHaveValue("tier2")
    expect(screen.getByLabelText(/你用的最多的模型是什么/)).toHaveValue("deepseek-v3")
    expect(screen.getByLabelText(/用了这个模型，你的效率是以前的几倍/)).toHaveValue(3)
    expect(screen.getByLabelText(/这个模型你每天大概需要多少 M Token/)).toHaveValue(120)
  })

  it("writes the current selections into the query string", () => {
    renderWithProviders(<HomePage />)

    fireEvent.click(screen.getByRole("radio", { name: "60 万" }))
    fireEvent.change(screen.getByLabelText(/这个模型你每天大概需要多少 M Token/), {
      target: { value: "180" },
    })

    const params = new URLSearchParams(window.location.search)
    expect(params.get("incomePreset")).toBe("60")
    expect(params.get("income")).toBe("60")
    expect(params.get("dailyTokens")).toBe("180")
  })

  it("uses the zero-token path to show a toast for craftsman-spirit without rendering normal result sections", async () => {
    renderWithProviders(<HomePage />)

    fireEvent.change(screen.getByLabelText(/这个模型你每天大概需要多少 M Token/), {
      target: { value: "0" },
    })

    expect(await screen.findByText("获得新称号")).toBeInTheDocument()
    expect(screen.getByText("已解锁：匠人精神")).toBeInTheDocument()
    expect(screen.getByText(/匠人精神/)).toBeInTheDocument()
    expect(screen.queryByText("模型成本与 Token 预算")).not.toBeInTheDocument()
  })

  it("shows newly earned titles in a toast for a valid non-zero configuration", async () => {
    renderWithProviders(<HomePage />)

    fireEvent.change(screen.getByLabelText(/你用的最多的模型是什么/), {
      target: { value: "deepseek-v3" },
    })
    fireEvent.change(screen.getByLabelText(/用了这个模型，你的效率是以前的几倍/), {
      target: { value: "6" },
    })
    fireEvent.change(screen.getByLabelText(/这个模型你每天大概需要多少 M Token/), {
      target: { value: "20" },
    })

    expect(await screen.findByText("获得新称号")).toBeInTheDocument()
    expect(screen.getByText(/提示词炼金师/)).toBeInTheDocument()
    expect(screen.getByText(/成本驯兽师/)).toBeInTheDocument()
    expect(screen.getByText(/危险先知/)).toBeInTheDocument()
    expect(screen.getByText(/预算统筹官/)).toBeInTheDocument()
    expect(screen.getByText("模型成本与 Token 预算")).toBeInTheDocument()
  })

  it("keeps previously earned titles as earned after a refresh", async () => {
    renderWithProviders(<HomePage />)

    fireEvent.change(screen.getByLabelText(/这个模型你每天大概需要多少 M Token/), {
      target: { value: "0" },
    })

    expect(await screen.findByText("获得新称号")).toBeInTheDocument()
    await waitFor(() =>
      expect(localStorage.getItem("cost-special-titles")).toContain("craftsman-spirit")
    )

    cleanup()
    window.history.replaceState(
      {},
      "",
      "/?incomePreset=26&income=26&city=tier1&model=gpt-5&multiplier=5&dailyTokens=0"
    )

    renderWithProviders(<HomePage />)

    expect(screen.queryByText("获得新称号")).not.toBeInTheDocument()
    expect(screen.queryByText("匠人精神")).not.toBeInTheDocument()
  })

  it("copies the current page link from the header share button", async () => {
    renderWithProviders(<HomePage />)

    fireEvent.click(screen.getByRole("button", { name: "复制当前页面链接" }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("lang=zh-CN")
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("theme=light")
    )
    expect(await screen.findByRole("button", { name: "复制当前页面链接" })).toHaveTextContent("链接已复制")
  })

  it("renders share buttons for the agent report and Hagicode boost panels", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getAllByRole("button", { name: "复制当前页面链接，并包含语言与主题设置" })).toHaveLength(3)
  })

  it("shows filing links sourced for the footer registration area", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole("link", { name: "查看 ICP 备案信息" })).toHaveAttribute("href", "https://beian.miit.gov.cn/")
    expect(screen.getByRole("link", { name: "查看公安备案信息" })).toHaveAttribute(
      "href",
      "http://www.beian.gov.cn/portal/registerSystemInfo",
    )
  })

  it("renders snapshot-backed related sites while keeping GitHub and pricing references in the footer", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole("link", { name: /HagiCode 主站\s*产品入口/ })).toHaveAttribute("href", "https://hagicode.com/")
    expect(screen.getByRole("link", { name: /Docker Compose Builder\s*Docker 部署 Hagicode/ })).toHaveAttribute("href", "https://builder.hagicode.com/")
    expect(screen.getByRole("link", { name: "GitHub 仓库" })).toHaveAttribute("href", "https://github.com/HagiCode-org/site")
    expect(screen.getByRole("link", { name: "Steam" })).toHaveAttribute("href", "https://store.steampowered.com/app/4625540/Hagicode/")
    expect(screen.getByRole("link", { name: "Steam" })).toHaveAttribute("target", "_blank")
    expect(screen.getByRole("link", { name: "Steam" })).toHaveAttribute("rel", "noreferrer")
    expect(screen.getByRole("link", { name: "定价参考来源" })).toHaveAttribute("href", "https://openai.com/api/pricing/")
    expect(screen.queryByRole("link", { name: /AI Replacement Calculator/ })).not.toBeInTheDocument()
  })

  it("renders the Hagicode feature showcase before the footer with all three panels", () => {
    renderWithProviders(<HomePage />)

    const showcaseTitle = screen.getByRole("heading", { level: 2, name: "HagiCode 三大核心能力" })
    const showcase = showcaseTitle.closest("section")
    const footer = screen.getByRole("contentinfo")

    expect(showcase).not.toBeNull()
    const showcaseElement = showcase as HTMLElement
    expect(
      showcaseElement.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    const showcaseScope = within(showcaseElement)
    expect(showcaseScope.getByRole("heading", { level: 3, name: "智能" })).toBeInTheDocument()
    expect(showcaseScope.getByRole("heading", { level: 3, name: "高效" })).toBeInTheDocument()
    expect(showcaseScope.getByRole("heading", { level: 3, name: "有趣" })).toBeInTheDocument()
  })
})
