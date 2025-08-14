export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  requirement: string
  category: "milestone" | "streak" | "savings"
}

export interface EarnedBadge {
  badgeId: string
  earnedAt: string
  progress?: number
}

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: "first_log",
    name: "First Steps",
    description: "Logged your first trip",
    icon: "🎯",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    requirement: "Log 1 trip",
    category: "milestone",
  },
  {
    id: "streak_3",
    name: "Getting Started",
    description: "3-day logging streak",
    icon: "⚡",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    requirement: "Log trips for 3 consecutive days",
    category: "streak",
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "7-day logging streak",
    icon: "🔥",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    requirement: "Log trips for 7 consecutive days",
    category: "streak",
  },
  {
    id: "savings_5kg",
    name: "Eco Saver",
    description: "Saved 5 kg CO₂e vs car",
    icon: "🌱",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    requirement: "Save 5 kg CO₂e compared to driving",
    category: "savings",
  },
  {
    id: "savings_25kg",
    name: "Climate Champion",
    description: "Saved 25 kg CO₂e vs car",
    icon: "🏆",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    requirement: "Save 25 kg CO₂e compared to driving",
    category: "savings",
  },
]

export class BadgeSystem {
  private earnedBadges: EarnedBadge[] = []

  constructor(earnedBadges: EarnedBadge[] = []) {
    this.earnedBadges = earnedBadges
  }

  getEarnedBadges(): EarnedBadge[] {
    return [...this.earnedBadges]
  }

  hasBadge(badgeId: string): boolean {
    return this.earnedBadges.some((earned) => earned.badgeId === badgeId)
  }

  awardBadge(badgeId: string): boolean {
    if (this.hasBadge(badgeId)) return false

    this.earnedBadges.push({
      badgeId,
      earnedAt: new Date().toISOString(),
    })
    return true
  }

  calculateStreak(trips: Array<{ date: string }>): number {
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

  checkAndAwardBadges(trips: Array<{ date: string; savings: number }>): string[] {
    const newBadges: string[] = []

    // First Log Badge
    if (trips.length >= 1 && !this.hasBadge("first_log")) {
      if (this.awardBadge("first_log")) {
        newBadges.push("first_log")
      }
    }

    // Streak Badges
    const currentStreak = this.calculateStreak(trips)

    if (currentStreak >= 3 && !this.hasBadge("streak_3")) {
      if (this.awardBadge("streak_3")) {
        newBadges.push("streak_3")
      }
    }

    if (currentStreak >= 7 && !this.hasBadge("streak_7")) {
      if (this.awardBadge("streak_7")) {
        newBadges.push("streak_7")
      }
    }

    // Savings Badges
    const totalSavings = trips.reduce((sum, trip) => sum + trip.savings, 0)

    if (totalSavings >= 5 && !this.hasBadge("savings_5kg")) {
      if (this.awardBadge("savings_5kg")) {
        newBadges.push("savings_5kg")
      }
    }

    if (totalSavings >= 25 && !this.hasBadge("savings_25kg")) {
      if (this.awardBadge("savings_25kg")) {
        newBadges.push("savings_25kg")
      }
    }

    return newBadges
  }

  getBadgeProgress(badgeId: string, trips: Array<{ date: string; savings: number }>): number {
    switch (badgeId) {
      case "first_log":
        return Math.min(trips.length, 1)
      case "streak_3":
        return Math.min(this.calculateStreak(trips), 3)
      case "streak_7":
        return Math.min(this.calculateStreak(trips), 7)
      case "savings_5kg": {
        const totalSavings = trips.reduce((sum, trip) => sum + trip.savings, 0)
        return Math.min(totalSavings, 5)
      }
      case "savings_25kg": {
        const totalSavings = trips.reduce((sum, trip) => sum + trip.savings, 0)
        return Math.min(totalSavings, 25)
      }
      default:
        return 0
    }
  }

  getProgressPercentage(badgeId: string, trips: Array<{ date: string; savings: number }>): number {
    const progress = this.getBadgeProgress(badgeId, trips)

    switch (badgeId) {
      case "first_log":
        return (progress / 1) * 100
      case "streak_3":
        return (progress / 3) * 100
      case "streak_7":
        return (progress / 7) * 100
      case "savings_5kg":
        return (progress / 5) * 100
      case "savings_25kg":
        return (progress / 25) * 100
      default:
        return 0
    }
  }
}
