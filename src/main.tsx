import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"

import App from "./App"
import { ThemeProvider } from "./contexts/theme-context"
import { getResolvedLanguage } from "./i18n/config"
import "./index.css"
import { bootstrapAnalytics } from "./lib/analytics/bootstrap"
import { injectAllSchemas } from "./lib/seo/schema-generator"
import { initializeDefaultSEO } from "./lib/seo/utils"
import { store } from "./lib/store"

const initialLanguage = getResolvedLanguage()

initializeDefaultSEO(initialLanguage)
injectAllSchemas(initialLanguage)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="light">
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)

void bootstrapAnalytics().catch((error) => {
  console.warn("[51LA Analytics] Bootstrap failed", error)
})
