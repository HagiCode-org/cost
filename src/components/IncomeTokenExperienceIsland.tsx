import { useEffect } from "react"
import { Provider } from "react-redux"

import App from "@/App"
import { ThemeProvider } from "@/contexts/theme-context"
import i18n, { defaultLanguage, persistLanguagePreference, resolveInitialLanguage } from "@/i18n/config"
import { setLocale, store } from "@/lib/store"
import { syncRegionPreferenceFromUrl } from "@/lib/region"

function ClientPreferences() {
  useEffect(() => {
    syncRegionPreferenceFromUrl()

    const language = resolveInitialLanguage()
    store.dispatch(setLocale(language))
    persistLanguagePreference(language)
    if (language !== defaultLanguage) {
      void i18n.changeLanguage(language)
    }
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
