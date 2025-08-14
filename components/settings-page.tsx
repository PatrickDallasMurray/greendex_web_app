"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings, Car, Bus, Train, Bike, User, RotateCcw, Save, AlertTriangle, Info, Download } from "lucide-react"
import { useEmissionSettings } from "@/hooks/use-emission-settings"
import { emissionsCalculator, DEFAULT_EMISSION_SETTINGS } from "@/lib/emissions-calculator"
import { useBadgeSystem } from "@/hooks/use-badge-system"
import { ExportDialog } from "@/components/export-dialog"
import type { Trip } from "@/app/page"

interface SettingsPageProps {
  onClose?: () => void
  trips?: Trip[]
}

const TRANSPORT_MODES = [
  { key: "car_gas", label: "Car (Gas)", icon: Car, description: "Gasoline-powered personal vehicle" },
  { key: "rideshare", label: "Rideshare", icon: Car, description: "Uber, Lyft, taxi services" },
  { key: "bus", label: "Bus", icon: Bus, description: "Public bus transportation" },
  { key: "subway_metro", label: "Subway/Metro", icon: Train, description: "Underground rail systems" },
  { key: "train_commuter", label: "Commuter Train", icon: Train, description: "Above-ground rail transit" },
  { key: "bike", label: "Bicycle", icon: Bike, description: "Human-powered cycling" },
  { key: "walk", label: "Walking", icon: User, description: "On foot transportation" },
] as const

export function SettingsPage({ onClose, trips = [] }: SettingsPageProps) {
  const { settings, updateSettings, resetToDefaults } = useEmissionSettings()
  const { clearNewBadges } = useBadgeSystem()

  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFactorChange = (mode: string, value: string) => {
    const numValue = Number.parseFloat(value)
    const newSettings = {
      ...localSettings,
      factors: {
        ...localSettings.factors,
        [mode]: numValue,
      },
    }
    setLocalSettings(newSettings)
    setHasChanges(true)

    // Validate
    const newErrors = { ...errors }
    if (isNaN(numValue) || !emissionsCalculator.validateEmissionFactor(numValue)) {
      newErrors[mode] = "Must be between 0 and 10 kg CO₂e per mile"
    } else {
      delete newErrors[mode]
    }
    setErrors(newErrors)
  }

  const handleOccupancyChange = (value: string) => {
    const numValue = Number.parseFloat(value)
    const newSettings = {
      ...localSettings,
      rideshareOccupancy: numValue,
    }
    setLocalSettings(newSettings)
    setHasChanges(true)

    // Validate
    const newErrors = { ...errors }
    if (isNaN(numValue) || !emissionsCalculator.validateOccupancy(numValue)) {
      newErrors.occupancy = "Must be between 0.1 and 10 passengers"
    } else {
      delete newErrors.occupancy
    }
    setErrors(newErrors)
  }

  const handleUnitChange = (value: "mi" | "km") => {
    const newSettings = {
      ...localSettings,
      defaultUnit: value,
    }
    setLocalSettings(newSettings)
    setHasChanges(true)
  }

  const handleSave = () => {
    if (Object.keys(errors).length > 0) {
      return
    }

    updateSettings(localSettings)
    setHasChanges(false)
    if (onClose) onClose()
  }

  const handleReset = () => {
    setLocalSettings(DEFAULT_EMISSION_SETTINGS)
    setHasChanges(true)
    setErrors({})
  }

  const handleResetAllData = () => {
    // Clear trips
    localStorage.removeItem("carbon-tracker-trips")

    // Clear badges
    localStorage.removeItem("carbon-tracker-badges")
    clearNewBadges()

    // Reset settings
    resetToDefaults()
    setLocalSettings(DEFAULT_EMISSION_SETTINGS)
    setHasChanges(false)
    setErrors({})

    // Reload the page to reset all state
    window.location.reload()
  }

  const hasValidationErrors = Object.keys(errors).length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>
        {hasChanges && (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
          >
            Unsaved changes
          </Badge>
        )}
      </div>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>Export your trip history for backup or analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download all your logged trips as a CSV file including dates, transport modes, distances, emissions, and
                savings.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {trips.length} trip{trips.length !== 1 ? "s" : ""} available for export
              </p>
            </div>
            <ExportDialog trips={trips} />
          </div>
        </CardContent>
      </Card>

      {/* Emission Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Emission Factors</CardTitle>
          <CardDescription>
            Customize CO₂e emission factors (kg per mile) for different transport modes. These affect all future trip
            calculations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {TRANSPORT_MODES.map((mode) => {
            const IconComponent = mode.icon
            const currentValue = localSettings.factors[mode.key as keyof typeof localSettings.factors]
            const hasError = errors[mode.key]

            return (
              <div key={mode.key} className="space-y-2">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <Label htmlFor={mode.key} className="text-sm font-medium">
                      {mode.label}
                    </Label>
                    <p className="text-xs text-gray-500">{mode.description}</p>
                  </div>
                  <div className="w-32">
                    <Input
                      id={mode.key}
                      type="number"
                      step="0.001"
                      min="0"
                      max="10"
                      value={currentValue}
                      onChange={(e) => handleFactorChange(mode.key, e.target.value)}
                      className={hasError ? "border-red-500" : ""}
                    />
                    {hasError && <p className="text-xs text-red-500 mt-1">{hasError}</p>}
                  </div>
                  <div className="text-xs text-gray-500 w-20">kg CO₂e/mi</div>
                </div>
              </div>
            )
          })}

          <Separator />

          {/* Rideshare Occupancy */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Car className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <Label htmlFor="occupancy" className="text-sm font-medium">
                  Rideshare Occupancy
                </Label>
                <p className="text-xs text-gray-500">Average number of passengers per rideshare trip</p>
              </div>
              <div className="w-32">
                <Input
                  id="occupancy"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={localSettings.rideshareOccupancy}
                  onChange={(e) => handleOccupancyChange(e.target.value)}
                  className={errors.occupancy ? "border-red-500" : ""}
                />
                {errors.occupancy && <p className="text-xs text-red-500 mt-1">{errors.occupancy}</p>}
              </div>
              <div className="text-xs text-gray-500 w-20">passengers</div>
            </div>
            <div className="ml-7 text-xs text-blue-600 dark:text-blue-400">
              <Info className="h-3 w-3 inline mr-1" />
              Rideshare emissions = {localSettings.factors.rideshare.toFixed(3)} ÷ {localSettings.rideshareOccupancy} ={" "}
              {(localSettings.factors.rideshare / localSettings.rideshareOccupancy).toFixed(3)} kg CO₂e/mi
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure default preferences for the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultUnit">Default Distance Unit</Label>
            <Select value={localSettings.defaultUnit} onValueChange={handleUnitChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mi">Miles</SelectItem>
                <SelectItem value="km">Kilometers</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Default unit for new trip entries</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Data Management</CardTitle>
          <CardDescription>Manage your stored data and reset the application</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All logged trips</li>
                    <li>All earned badges</li>
                    <li>Custom emission factor settings</li>
                  </ul>
                  The application will be reset to its initial state.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetAllData} className="bg-red-600 hover:bg-red-700">
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs text-gray-500 mt-2">
            This will clear all your trips, badges, and settings. Use with caution.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} disabled={!hasChanges || hasValidationErrors} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>

      {hasValidationErrors && (
        <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Please fix validation errors before saving
        </div>
      )}
    </div>
  )
}
