import { render } from "@testing-library/react"
import type { ReactElement } from "react"
import { Provider } from "react-redux"

import { ThemeProvider } from "@/contexts/theme-context"
import "@/i18n/config"
import { store } from "@/lib/store"

export function renderWithProviders(ui: ReactElement) {
  return render(
    <Provider store={store}>
      <ThemeProvider defaultTheme="light">{ui}</ThemeProvider>
    </Provider>,
  )
}
