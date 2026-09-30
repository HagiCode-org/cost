import { useEffect } from "react"
import { Provider } from "react-redux"

import App from "@/App"
import { ThemeProvider } from "@/contexts/theme-context"
import i18n, { defaultLanguage, persistLanguagePreference, resolveInitialLanguage } from "@/i18n/config"
import { setLocale, store } from "@/lib/store"
import { syncRegionPreferenceFromUrl } from "@/lib/region"
import { bootstrapAnalytics } from "@/lib/analytics/bootstrap"

function ClientPreferences() {
  useEffect(() => {
    syncRegionPreferenceFromUrl()

    const language = resolveInitialLanguage()
    store.dispatch(setLocale(language))
    persistLanguagePreference(language)
    if (language !== defaultLanguage) {
      void i18n.changeLanguage(language)
    }

    void bootstrapAnalytics().catch((error) => {
      console.warn("[51LA Analytics] Bootstrap failed", error)
    })
  }, [])

  return <App />
}

export default function IncomeTokenExperienceIsland() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light">
        <ClientPreferences />
      </ThemeProvider>
    </Provider>
  )
}
