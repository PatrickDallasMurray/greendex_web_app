"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Car, Bus, Bike, User, Train, Calendar, Zap } from "lucide-react"
import type { Trip } from "@/app/page"

interface ProgressMetricsProps {
  trips: Trip[]
}

const TRANSPORT_ICONS = {
  car_gas: Car,
  rideshare: Car,
  bus: Bus,
  subway_metro: Train,
  train_commuter: Train,
  bike: Bike,
  walk: User,
}

const TRANSPORT_COLORS = {
  car_gas: "bg-red-500",
  rideshare: "bg-orange-500",
  bus: "bg-blue-500",
  subway_metro: "bg-purple-500",
  train_commuter: "bg-indigo-500",
  bike: "bg-green-500",
  walk: "bg-emerald-500",
}

export function ProgressMetrics({ trips }: ProgressMetricsProps) {
  // Calculate mode distribution
  const modeStats = trips.reduce(
    (acc, trip) => {
      if (!acc[trip.mode]) {
        acc[trip.mode] = { count: 0, emissions: 0, savings: 0, distance: 0 }
      }
      acc[trip.mode].count++
      acc[trip.mode].emissions += trip.emissions
      acc[trip.mode].savings += trip.savings
      acc[trip.mode].distance += trip.distance
      return acc
    },
    {} as Record<string, { count: number; emissions: number; savings: number; distance: number }>,
  )

  const totalTrips = trips.length
  const sortedModes = Object.entries(modeStats).sort(([, a], [, b]) => b.count - a.count)

  // Calculate weekly patterns
  const weeklyPattern = trips.reduce(
    (acc, trip) => {
      const date = new Date(trip.date)
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const dayName = dayNames[dayOfWeek]

      if (!acc[dayName]) {
        acc[dayName] = { count: 0, emissions: 0, savings: 0 }
      }
      acc[dayName].count++
      acc[dayName].emissions += trip.emissions
      acc[dayName].savings += trip.savings
      return acc
    },
    {} as Record<string, { count: number; emissions: number; savings: number }>,
  )

  const sortedDays = Object.entries(weeklyPattern).sort(([, a], [, b]) => b.count - a.count)

  // Calculate achievements
  const totalSavings = trips.reduce((sum, trip) => sum + trip.savings, 0)
  const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0)
  const greenTrips = trips.filter((trip) => trip.mode !== "car_gas").length
  const greenPercentage = totalTrips > 0 ? (greenTrips / totalTrips) * 100 : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Transport Mode Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Transport Mode Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedModes.map(([mode, stats]) => {
            const IconComponent = TRANSPORT_ICONS[mode as keyof typeof TRANSPORT_ICONS]
            const percentage = totalTrips > 0 ? (stats.count / totalTrips) * 100 : 0
            const colorClass = TRANSPORT_COLORS[mode as keyof typeof TRANSPORT_COLORS]

            return (
              <div key={mode} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${colorClass}`}>
                      <IconComponent className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium capitalize">{mode.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stats.count} trips
                    </Badge>
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{stats.distance.toFixed(1)} total miles</span>
                  <span>
                    {stats.savings > 0
                      ? `${stats.savings.toFixed(2)} kg saved`
                      : `${stats.emissions.toFixed(2)} kg emitted`}
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Weekly Pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Commute Pattern
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedDays.map(([day, stats]) => {
            const maxCount = Math.max(...Object.values(weeklyPattern).map((d) => d.count))
            const percentage = maxCount > 0 ? (stats.count / maxCount) * 100 : 0

            return (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stats.count} trips
                    </Badge>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{stats.emissions.toFixed(2)} kg emitted</span>
                  <span>{stats.savings.toFixed(2)} kg saved</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Achievement Metrics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Your Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalSavings.toFixed(1)}</div>
              <div className="text-sm text-gray-500">kg CO₂e Saved</div>
              <div className="text-xs text-gray-400 mt-1">vs. driving everywhere</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalDistance.toFixed(0)}</div>
              <div className="text-sm text-gray-500">Miles Traveled</div>
              <div className="text-xs text-gray-400 mt-1">across all modes</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {greenPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">Green Trips</div>
              <div className="text-xs text-gray-400 mt-1">non-car transportation</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totalTrips}</div>
              <div className="text-sm text-gray-500">Total Trips</div>
              <div className="text-xs text-gray-400 mt-1">logged so far</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
