import type { Trip } from "@/app/page"

export interface ExportData {
  date: string
  mode: string
  distance: number
  unit: string
  emissions: number
  savings: number
  notes: string
}

export class DataExporter {
  static formatModeLabel(mode: string): string {
    const modeLabels: Record<string, string> = {
      car_gas: "Car (Gas)",
      rideshare: "Rideshare",
      bus: "Bus",
      subway_metro: "Subway/Metro",
      train_commuter: "Train",
      bike: "Bike",
      walk: "Walk",
    }
    return modeLabels[mode] || mode
  }

  static prepareExportData(trips: Trip[]): ExportData[] {
    return trips
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date ascending
      .map((trip) => ({
        date: trip.date,
        mode: this.formatModeLabel(trip.mode),
        distance: trip.distance,
        unit: trip.unit,
        emissions: Math.round(trip.emissions * 1000) / 1000, // Round to 3 decimal places
        savings: Math.round(trip.savings * 1000) / 1000,
        notes: trip.notes || "",
      }))
  }

  static convertToCSV(data: ExportData[]): string {
    if (data.length === 0) {
      return "No data to export"
    }

    // CSV headers
    const headers = ["Date", "Transport Mode", "Distance", "Unit", "Emissions (kg CO₂e)", "Savings (kg CO₂e)", "Notes"]

    // Convert data to CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...data.map((row) =>
        [
          row.date,
          `"${row.mode}"`, // Quote mode to handle spaces
          row.distance,
          row.unit,
          row.emissions,
          row.savings,
          `"${row.notes.replace(/"/g, '""')}"`, // Escape quotes in notes
        ].join(","),
      ),
    ]

    return csvRows.join("\n")
  }

  static downloadCSV(csvContent: string, filename = "carbon-tracker-trips.csv"): void {
    // Create blob with CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Create download link
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    URL.revokeObjectURL(url)
  }

  static exportTripsToCSV(trips: Trip[]): void {
    const exportData = this.prepareExportData(trips)
    const csvContent = this.convertToCSV(exportData)

    // Generate filename with current date
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0] // YYYY-MM-DD format
    const filename = `carbon-tracker-export-${dateStr}.csv`

    this.downloadCSV(csvContent, filename)
  }

  static getExportSummary(trips: Trip[]): {
    totalTrips: number
    dateRange: string
    totalEmissions: number
    totalSavings: number
    totalDistance: number
  } {
    if (trips.length === 0) {
      return {
        totalTrips: 0,
        dateRange: "No trips",
        totalEmissions: 0,
        totalSavings: 0,
        totalDistance: 0,
      }
    }

    const sortedTrips = trips.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstDate = new Date(sortedTrips[0].date).toLocaleDateString()
    const lastDate = new Date(sortedTrips[sortedTrips.length - 1].date).toLocaleDateString()

    const totalEmissions = trips.reduce((sum, trip) => sum + trip.emissions, 0)
    const totalSavings = trips.reduce((sum, trip) => sum + trip.savings, 0)
    const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0)

    return {
      totalTrips: trips.length,
      dateRange: firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`,
      totalEmissions: Math.round(totalEmissions * 1000) / 1000,
      totalSavings: Math.round(totalSavings * 1000) / 1000,
      totalDistance: Math.round(totalDistance * 10) / 10,
    }
  }
}
