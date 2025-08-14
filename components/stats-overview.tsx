"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Calendar, Flame, Target } from "lucide-react"
import type { Trip } from "@/app/page"

interface StatsOverviewProps {
  trips: Trip[]
}

export function StatsOverview({ trips }: StatsOverviewProps) {
  // Calculate stats
  const today = new Date().toISOString().split("T")[0]
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const todayTrips = trips.filter((trip) => trip.date === today)
  const weekTrips = trips.filter((trip) => trip.date >= oneWeekAgo)

  const todayEmissions = todayTrips.reduce((sum, trip) => sum + trip.emissions, 0)
  const todaySavings = todayTrips.reduce((sum, trip) => sum + trip.savings, 0)

  const weekEmissions = weekTrips.reduce((sum, trip) => sum + trip.emissions, 0)
  const weekSavings = weekTrips.reduce((sum, trip) => sum + trip.savings, 0)

  const lifetimeEmissions = trips.reduce((sum, trip) => sum + trip.emissions, 0)
  const lifetimeSavings = trips.reduce((sum, trip) => sum + trip.savings, 0)

  // Calculate streak
  const calculateStreak = () => {
    if (trips.length === 0) return 0

    const sortedDates = [...new Set(trips.map((trip) => trip.date))].sort().reverse()
    let streak = 0
    let currentDate = new Date()

    for (const dateStr of sortedDates) {
      const tripDate = new Date(dateStr)
      const daysDiff = Math.floor((currentDate.getTime() - tripDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === streak) {
        streak++
        currentDate = tripDate
      } else if (daysDiff === streak + 1 && streak === 0) {
        // Allow for today not having a trip yet
        streak++
        currentDate = tripDate
      } else {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()

  const stats = [
    {
      title: "Today",
      emissions: todayEmissions,
      savings: todaySavings,
      trips: todayTrips.length,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "This Week",
      emissions: weekEmissions,
      savings: weekSavings,
      trips: weekTrips.length,
      icon: TrendingDown,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Lifetime",
      emissions: lifetimeEmissions,
      savings: lifetimeSavings,
      trips: trips.length,
      icon: Target,
      color: "text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => {
        const IconComponent = stat.icon
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                <span className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  {stat.title}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {stat.trips} trips
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.emissions.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">kg CO₂e emitted</div>
                </div>
                {stat.savings > 0 && (
                  <div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      -{stat.savings.toFixed(2)}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">kg CO₂e saved vs car</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Streak Card */}
      <Card className="md:col-span-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {streak} day{streak !== 1 ? "s" : ""}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current logging streak</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Keep it up! 🎯</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
