import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"

import type { SupportedLanguage } from "@/i18n/config"

export type FutureFeatureId = "job-profile" | "task-breakdown" | "result-brief" | "action-path"

interface FutureFeature {
  id: FutureFeatureId
  status: "planned" | "research" | "ready-for-ui"
}

export type ExperiencePhase = "landing" | "loading" | "results"

interface SiteState {
  locale: SupportedLanguage
  foundationStatus: "baseline-ready"
  futureFeatures: FutureFeature[]
  experiencePhase: ExperiencePhase
}

const initialState: SiteState = {
  locale: "zh-CN",
  foundationStatus: "baseline-ready",
  futureFeatures: [
    { id: "job-profile", status: "ready-for-ui" },
    { id: "task-breakdown", status: "research" },
    { id: "result-brief", status: "planned" },
    { id: "action-path", status: "planned" },
  ],
  experiencePhase: "landing",
}

const siteSlice = createSlice({
  name: "site",
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<SupportedLanguage>) {
      state.locale = action.payload
    },
    setExperiencePhase(state, action: PayloadAction<ExperiencePhase>) {
      state.experiencePhase = action.payload
    },
    resetExperience(state) {
      state.experiencePhase = "landing"
    },
  },
})

export const { setLocale, setExperiencePhase, resetExperience } = siteSlice.actions

export const store = configureStore({
  reducer: {
    site: siteSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
