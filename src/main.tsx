import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"

import App from "./App"
import { ThemeProvider } from "./contexts/theme-context"
import "./i18n/config"
import "./index.css"
import { injectAllSchemas } from "./lib/seo/schema-generator"
import { initializeDefaultSEO } from "./lib/seo/utils"
import { store } from "./lib/store"

initializeDefaultSEO("zh-CN")
injectAllSchemas("zh-CN")

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="light">
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
