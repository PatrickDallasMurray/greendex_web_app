"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import type { Trip } from "@/app/page"
import { emissionsCalculator } from "@/lib/emissions-calculator"
import { useEmissionSettings } from "@/hooks/use-emission-settings"

interface AddTripFormProps {
  onSubmit: (trip: Omit<Trip, "id">) => void
  onCancel: () => void
}

const TRANSPORT_MODES = [
  { value: "car_gas", label: "Car (Gas)", icon: "🚗" },
  { value: "rideshare", label: "Rideshare", icon: "🚕" },
  { value: "bus", label: "Bus", icon: "🚌" },
  { value: "subway_metro", label: "Subway/Metro", icon: "🚇" },
  { value: "train_commuter", label: "Train", icon: "🚆" },
  { value: "bike", label: "Bike", icon: "🚴" },
  { value: "walk", label: "Walk", icon: "🚶" },
] as const

export function AddTripForm({ onSubmit, onCancel }: AddTripFormProps) {
  const { settings } = useEmissionSettings()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    mode: "" as Trip["mode"],
    distance: "",
    unit: settings.defaultUnit,
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.mode || !formData.distance) return

    const distance = Number.parseFloat(formData.distance)

    if (!emissionsCalculator.validateDistance(distance)) {
      alert("Please enter a valid distance between 0 and 10,000")
      return
    }

    const { emissions, savings } = emissionsCalculator.calculateTrip(formData.mode, distance, formData.unit)

    onSubmit({
      date: formData.date,
      mode: formData.mode,
      distance,
      unit: formData.unit,
      notes: formData.notes || undefined,
      emissions,
      savings,
    })
  }

  const getPreview = () => {
    if (!formData.mode || !formData.distance) return null

    const distance = Number.parseFloat(formData.distance) || 0
    return emissionsCalculator.calculateTrip(formData.mode, distance, formData.unit)
  }

  const preview = getPreview()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        {/* Transport Mode */}
        <div className="space-y-2">
          <Label htmlFor="mode">Transport Mode</Label>
          <Select
            value={formData.mode}
            onValueChange={(value: Trip["mode"]) => setFormData((prev) => ({ ...prev, mode: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transport mode" />
            </SelectTrigger>
            <SelectContent>
              {TRANSPORT_MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  <span className="flex items-center gap-2">
                    <span>{mode.icon}</span>
                    {mode.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Distance */}
        <div className="space-y-2">
          <Label htmlFor="distance">Distance</Label>
          <Input
            id="distance"
            type="number"
            step="0.1"
            min="0"
            max="10000"
            placeholder="0.0"
            value={formData.distance}
            onChange={(e) => setFormData((prev) => ({ ...prev, distance: e.target.value }))}
            required
          />
        </div>

        {/* Unit */}
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Select
            value={formData.unit}
            onValueChange={(value: "mi" | "km") => setFormData((prev) => ({ ...prev, unit: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mi">Miles</SelectItem>
              <SelectItem value="km">Kilometers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this trip..."
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      {/* Preview */}
      {preview && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="text-sm space-y-1">
            <div className="font-medium text-green-800 dark:text-green-200">Trip Preview:</div>
            <div className="text-green-700 dark:text-green-300">Emissions: {preview.emissions.toFixed(3)} kg CO₂e</div>
            {formData.mode !== "car_gas" && preview.savings > 0 && (
              <div className="text-green-700 dark:text-green-300">
                Savings vs car: {preview.savings.toFixed(3)} kg CO₂e
              </div>
            )}
            <div className="text-xs text-green-600 dark:text-green-400 mt-2">
              Using factor:{" "}
              {formData.mode === "rideshare"
                ? `${settings.factors.rideshare.toFixed(3)} ÷ ${settings.rideshareOccupancy} = ${(settings.factors.rideshare / settings.rideshareOccupancy).toFixed(3)}`
                : settings.factors[formData.mode as keyof typeof settings.factors]?.toFixed(3)}{" "}
              kg CO₂e per mile
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          Add Trip
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </form>
  )
}
