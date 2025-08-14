"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Zap, Calendar } from "lucide-react"
import { AddTripForm } from "@/components/add-trip-form"
import { TripList } from "@/components/trip-list"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { BadgeDisplay } from "@/components/badge-display"
import { BadgeNotification } from "@/components/badge-notification"
import { SettingsDialog } from "@/components/settings-dialog"
import { useBadgeSystem } from "@/hooks/use-badge-system"

export interface Trip {
  id: string
  date: string
  mode: "car_gas" | "rideshare" | "bus" | "subway_metro" | "train_commuter" | "bike" | "walk"
  distance: number
  unit: "mi" | "km"
  notes?: string
  emissions: number
  savings: number
}

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const { checkForNewBadges } = useBadgeSystem()

  // Load trips from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem("carbon-tracker-trips")
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips))
    }
  }, [])

  // Save trips to localStorage whenever trips change
  useEffect(() => {
    localStorage.setItem("carbon-tracker-trips", JSON.stringify(trips))
  }, [trips])

  // Check for new badges whenever trips change
  useEffect(() => {
    if (trips.length > 0) {
      checkForNewBadges(trips)
    }
  }, [trips, checkForNewBadges])

  const addTrip = (trip: Omit<Trip, "id">) => {
    const newTrip = {
      ...trip,
      id: Date.now().toString(),
    }
    setTrips((prev) => [newTrip, ...prev])
    setShowAddForm(false)
  }

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((trip) => trip.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Badge Notification */}
        <BadgeNotification />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Greendex</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Log your commute in seconds, see your footprint instantly, and earn badges for greener habits.
          </p>
          <div className="mt-4">
            <SettingsDialog trips={trips} />
          </div>
        </div>

        {/* Progress Dashboard */}
        <div className="mb-8">
          <ProgressDashboard trips={trips} />
        </div>

        {/* Badge Display - Compact */}
        <div className="mb-8">
          <BadgeDisplay trips={trips} compact />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex-1 h-12 text-base font-medium bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Log New Trip
          </Button>
        </div>

        {/* Add Trip Form */}
        {showAddForm && (
          <Card className="mb-8 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Trip
              </CardTitle>
              <CardDescription>Log your commute to track emissions and savings</CardDescription>
            </CardHeader>
            <CardContent>
              <AddTripForm onSubmit={addTrip} onCancel={() => setShowAddForm(false)} />
            </CardContent>
          </Card>
        )}

        {/* Recent Trips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Trips
            </CardTitle>
            <CardDescription>Your logged commutes and their environmental impact</CardDescription>
          </CardHeader>
          <CardContent>
            <TripList trips={trips} onDelete={deleteTrip} />
          </CardContent>
        </Card>

        {/* Full Badge Display */}
        <BadgeDisplay trips={trips} />
      </div>
    </div>
  )
}
