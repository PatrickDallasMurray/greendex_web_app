"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingDown, Calendar, Flame, Target, BarChart3, TrendingUp } from "lucide-react"
import { EmissionsChart } from "@/components/emissions-chart"
import { ProgressMetrics } from "@/components/progress-metrics"
import type { Trip } from "@/app/page"

interface ProgressDashboardProps {
  trips: Trip[]
}

export function ProgressDashboard({ trips }: ProgressDashboardProps) {
  // Calculate comprehensive stats
  const today = new Date().toISOString().split("T")[0]
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const todayTrips = trips.filter((trip) => trip.date === today)
  const weekTrips = trips.filter((trip) => trip.date >= oneWeekAgo)
  const twoWeekTrips = trips.filter((trip) => trip.date >= twoWeeksAgo)

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
        streak++
        currentDate = tripDate
      } else {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()

  // Calculate trends (comparing this week vs last week)
  const lastWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const lastWeekEnd = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const lastWeekTrips = trips.filter((trip) => trip.date >= lastWeekStart && trip.date < lastWeekEnd)

  const lastWeekEmissions = lastWeekTrips.reduce((sum, trip) => sum + trip.emissions, 0)
  const lastWeekSavings = lastWeekTrips.reduce((sum, trip) => sum + trip.savings, 0)

  const emissionsTrend = lastWeekEmissions > 0 ? ((weekEmissions - lastWeekEmissions) / lastWeekEmissions) * 100 : 0
  const savingsTrend = lastWeekSavings > 0 ? ((weekSavings - lastWeekSavings) / lastWeekSavings) * 100 : 0

  const stats = [
    {
      title: "Today",
      emissions: todayEmissions,
      savings: todaySavings,
      trips: todayTrips.length,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "This Week",
      emissions: weekEmissions,
      savings: weekSavings,
      trips: weekTrips.length,
      icon: TrendingDown,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      trend: {
        emissions: emissionsTrend,
        savings: savingsTrend,
      },
    },
    {
      title: "Lifetime",
      emissions: lifetimeEmissions,
      savings: lifetimeSavings,
      trips: trips.length,
      icon: Target,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Card key={stat.title} className={`relative overflow-hidden ${stat.bgColor} ${stat.borderColor}`}>
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
                <div className="space-y-3">
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

                  {/* Trend indicators */}
                  {stat.trend && (
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        {stat.trend.emissions < 0 ? (
                          <TrendingDown className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        )}
                        <span className={stat.trend.emissions < 0 ? "text-green-600" : "text-red-600"}>
                          {Math.abs(stat.trend.emissions).toFixed(1)}% emissions
                        </span>
                      </div>
                      {stat.trend.savings !== 0 && (
                        <div className="flex items-center gap-1">
                          {stat.trend.savings > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={stat.trend.savings > 0 ? "text-green-600" : "text-red-600"}>
                            {Math.abs(stat.trend.savings).toFixed(1)}% savings
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Streak Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {streak} day{streak !== 1 ? "s" : ""}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current logging streak</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "🎯"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {streak >= 7 ? "On fire!" : streak >= 3 ? "Great job!" : "Keep going!"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <EmissionsChart trips={twoWeekTrips} />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <ProgressMetrics trips={trips} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
