"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar, BarChart3, TrendingDown, MapPin } from "lucide-react"
import { DataExporter } from "@/lib/export-utils"
import type { Trip } from "@/app/page"

interface ExportDialogProps {
  trips: Trip[]
}

export function ExportDialog({ trips }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const summary = DataExporter.getExportSummary(trips)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500))
      DataExporter.exportTripsToCSV(trips)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Trip Data
          </DialogTitle>
          <DialogDescription>Download your trip history as a CSV file for analysis or backup</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Summary</CardTitle>
              <CardDescription>Overview of data to be exported</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalTrips}</div>
                  <div className="text-sm text-gray-500">Total Trips</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalDistance}</div>
                  <div className="text-sm text-gray-500">Total Distance</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalEmissions}</div>
                  <div className="text-sm text-gray-500">kg CO₂e Emitted</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalSavings}</div>
                  <div className="text-sm text-gray-500">kg CO₂e Saved</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Date Range:</span>
                  <Badge variant="secondary">{summary.dateRange}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Format Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CSV Format</CardTitle>
              <CardDescription>The exported file will include the following columns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Date
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">Trip date (YYYY-MM-DD)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Transport Mode
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">Type of transportation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Distance
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">Trip distance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Unit
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">Distance unit (mi/km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Emissions
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">CO₂e emissions (kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Savings
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">CO₂e savings vs car (kg)</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <Badge variant="outline" className="text-xs">
                    Notes
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">Optional trip notes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={trips.length === 0 || isExporting}
              className="flex-1 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Download CSV"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>

          {trips.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No trips to export. Start logging your commutes to build your data!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
