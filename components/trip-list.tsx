"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Car, Bus, Train, Bike, User } from "lucide-react"
import { ExportDialog } from "@/components/export-dialog"
import type { Trip } from "@/app/page"

interface TripListProps {
  trips: Trip[]
  onDelete: (id: string) => void
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
  car_gas: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  rideshare: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  bus: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  subway_metro: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  train_commuter: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
  bike: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  walk: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
}

const TRANSPORT_LABELS = {
  car_gas: "Car (Gas)",
  rideshare: "Rideshare",
  bus: "Bus",
  subway_metro: "Subway/Metro",
  train_commuter: "Train",
  bike: "Bike",
  walk: "Walk",
}

export function TripList({ trips, onDelete }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No trips logged yet</p>
        <p>Start tracking your commute to see your environmental impact!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <ExportDialog trips={trips} />
      </div>

      {/* Trip List */}
      <div className="space-y-3">
        {trips.map((trip) => {
          const IconComponent = TRANSPORT_ICONS[trip.mode]
          const colorClass = TRANSPORT_COLORS[trip.mode]

          return (
            <Card key={trip.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{TRANSPORT_LABELS[trip.mode]}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(trip.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-medium">{trip.distance}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">{trip.unit}</span>
                      </div>

                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {trip.emissions.toFixed(3)} kg CO₂e
                        </div>
                        {trip.savings > 0 && (
                          <div className="text-green-600 dark:text-green-400 text-xs">
                            -{trip.savings.toFixed(3)} kg saved
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(trip.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {trip.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{trip.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
