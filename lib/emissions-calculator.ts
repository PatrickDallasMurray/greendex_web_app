export interface EmissionFactors {
  car_gas: number
  rideshare: number // Base factor, will be divided by occupancy
  bus: number
  subway_metro: number
  train_commuter: number
  bike: number
  walk: number
}

export interface EmissionSettings {
  factors: EmissionFactors
  rideshareOccupancy: number
  defaultUnit: "mi" | "km"
}

// Default emission factors from PRD (kg CO₂e per mile)
export const DEFAULT_EMISSION_FACTORS: EmissionFactors = {
  car_gas: 0.404,
  rideshare: 0.404, // Will be divided by occupancy
  bus: 0.18,
  subway_metro: 0.09,
  train_commuter: 0.14,
  bike: 0,
  walk: 0,
}

export const DEFAULT_EMISSION_SETTINGS: EmissionSettings = {
  factors: DEFAULT_EMISSION_FACTORS,
  rideshareOccupancy: 1.5,
  defaultUnit: "mi",
}

export class EmissionsCalculator {
  private settings: EmissionSettings

  constructor(settings: EmissionSettings = DEFAULT_EMISSION_SETTINGS) {
    this.settings = settings
  }

  updateSettings(newSettings: Partial<EmissionSettings>) {
    this.settings = { ...this.settings, ...newSettings }
  }

  getSettings(): EmissionSettings {
    return { ...this.settings }
  }

  private convertToMiles(distance: number, unit: "mi" | "km"): number {
    return unit === "km" ? distance * 0.621371 : distance
  }

  private getEffectiveFactor(mode: keyof EmissionFactors): number {
    if (mode === "rideshare") {
      return this.settings.factors.rideshare / this.settings.rideshareOccupancy
    }
    return this.settings.factors[mode]
  }

  calculateEmissions(mode: keyof EmissionFactors, distance: number, unit: "mi" | "km"): number {
    const distanceInMiles = this.convertToMiles(distance, unit)
    const factor = this.getEffectiveFactor(mode)
    return distanceInMiles * factor
  }

  calculateSavings(mode: keyof EmissionFactors, distance: number, unit: "mi" | "km"): number {
    if (mode === "car_gas") return 0

    const distanceInMiles = this.convertToMiles(distance, unit)
    const carFactor = this.settings.factors.car_gas
    const modeFactor = this.getEffectiveFactor(mode)

    return Math.max(0, distanceInMiles * (carFactor - modeFactor))
  }

  calculateTrip(mode: keyof EmissionFactors, distance: number, unit: "mi" | "km") {
    const emissions = this.calculateEmissions(mode, distance, unit)
    const savings = this.calculateSavings(mode, distance, unit)

    return {
      emissions: Math.round(emissions * 1000) / 1000, // Round to 3 decimal places
      savings: Math.round(savings * 1000) / 1000,
    }
  }

  // Validation methods
  validateDistance(distance: number): boolean {
    return distance > 0 && distance <= 10000 // Reasonable limits
  }

  validateEmissionFactor(factor: number): boolean {
    return factor >= 0 && factor <= 10 // Reasonable limits for kg CO₂e per mile
  }

  validateOccupancy(occupancy: number): boolean {
    return occupancy > 0 && occupancy <= 10 // Reasonable limits
  }
}

// Singleton instance for global use
export const emissionsCalculator = new EmissionsCalculator()
