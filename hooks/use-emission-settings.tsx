"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { DEFAULT_EMISSION_SETTINGS, emissionsCalculator, type EmissionSettings } from "@/lib/emissions-calculator"

interface EmissionSettingsContextType {
  settings: EmissionSettings
  updateSettings: (newSettings: Partial<EmissionSettings>) => void
  resetToDefaults: () => void
}

const EmissionSettingsContext = createContext<EmissionSettingsContextType | undefined>(undefined)

const STORAGE_KEY = "carbon-tracker-emission-settings"

export function EmissionSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EmissionSettings>(DEFAULT_EMISSION_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        emissionsCalculator.updateSettings(parsed)
      } catch (error) {
        console.error("Failed to parse saved emission settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    emissionsCalculator.updateSettings(settings)
  }, [settings])

  const updateSettings = (newSettings: Partial<EmissionSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetToDefaults = () => {
    setSettings(DEFAULT_EMISSION_SETTINGS)
  }

  return (
    <EmissionSettingsContext.Provider value={{ settings, updateSettings, resetToDefaults }}>
      {children}
    </EmissionSettingsContext.Provider>
  )
}

export function useEmissionSettings() {
  const context = useContext(EmissionSettingsContext)
  if (context === undefined) {
    throw new Error("useEmissionSettings must be used within an EmissionSettingsProvider")
  }
  return context
}
