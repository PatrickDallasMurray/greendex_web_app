"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, XAxis, YAxis, ResponsiveContainer, ComposedChart, Area, AreaChart } from "recharts"
import { BarChart3, TrendingDown } from "lucide-react"
import type { Trip } from "@/app/page"

interface EmissionsChartProps {
  trips: Trip[]
}

export function EmissionsChart({ trips }: EmissionsChartProps) {
  // Generate 14-day data
  const generateChartData = () => {
    const data = []
    const today = new Date()

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayTrips = trips.filter((trip) => trip.date === dateStr)
      const emissions = dayTrips.reduce((sum, trip) => sum + trip.emissions, 0)
      const savings = dayTrips.reduce((sum, trip) => sum + trip.savings, 0)
      const tripCount = dayTrips.length

      data.push({
        date: dateStr,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        shortDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        emissions: Math.round(emissions * 1000) / 1000,
        savings: Math.round(savings * 1000) / 1000,
        trips: tripCount,
      })
    }

    return data
  }

  const chartData = generateChartData()
  const totalEmissions = chartData.reduce((sum, day) => sum + day.emissions, 0)
  const totalSavings = chartData.reduce((sum, day) => sum + day.savings, 0)
  const totalTrips = chartData.reduce((sum, day) => sum + day.trips, 0)

  const chartConfig = {
    emissions: {
      label: "Emissions",
      color: "hsl(var(--chart-1))",
    },
    savings: {
      label: "Savings",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Emissions vs Savings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            14-Day Emissions & Savings
          </CardTitle>
          <CardDescription>Daily CO₂e emissions and savings compared to car travel</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  label={{ value: "kg CO₂e", angle: -90, position: "insideLeft" }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return `${payload[0].payload.shortDate} (${payload[0].payload.trips} trips)`
                    }
                    return value
                  }}
                />
                <Bar dataKey="emissions" fill="var(--color-emissions)" radius={[2, 2, 0, 0]} name="Emissions" />
                <Bar dataKey="savings" fill="var(--color-savings)" radius={[2, 2, 0, 0]} name="Savings" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cumulative Savings Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Cumulative Savings Trend
          </CardTitle>
          <CardDescription>Your growing environmental impact over 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalEmissions.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Total Emissions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalSavings.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Total Savings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTrips}</div>
              <div className="text-xs text-gray-500">Total Trips</div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData.map((item, index) => ({
                  ...item,
                  cumulativeSavings: chartData.slice(0, index + 1).reduce((sum, day) => sum + day.savings, 0),
                }))}
              >
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return `${payload[0].payload.shortDate}`
                    }
                    return value
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeSavings"
                  stroke="var(--color-savings)"
                  fill="var(--color-savings)"
                  fillOpacity={0.3}
                  name="Cumulative Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
