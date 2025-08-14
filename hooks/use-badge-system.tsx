"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { BadgeSystem, type EarnedBadge } from "@/lib/badge-system"

interface BadgeSystemContextType {
  badgeSystem: BadgeSystem
  earnedBadges: EarnedBadge[]
  checkForNewBadges: (trips: Array<{ date: string; savings: number }>) => string[]
  newBadgeIds: string[]
  clearNewBadges: () => void
}

const BadgeSystemContext = createContext<BadgeSystemContextType | undefined>(undefined)

const STORAGE_KEY = "carbon-tracker-badges"

export function BadgeSystemProvider({ children }: { children: ReactNode }) {
  const [badgeSystem, setBadgeSystem] = useState<BadgeSystem>(new BadgeSystem())
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([])

  // Load badges from localStorage on mount
  useEffect(() => {
    const savedBadges = localStorage.getItem(STORAGE_KEY)
    if (savedBadges) {
      try {
        const parsed: EarnedBadge[] = JSON.parse(savedBadges)
        const system = new BadgeSystem(parsed)
        setBadgeSystem(system)
        setEarnedBadges(parsed)
      } catch (error) {
        console.error("Failed to parse saved badges:", error)
      }
    }
  }, [])

  // Save badges to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(earnedBadges))
  }, [earnedBadges])

  const checkForNewBadges = (trips: Array<{ date: string; savings: number }>): string[] => {
    const newBadges = badgeSystem.checkAndAwardBadges(trips)
    if (newBadges.length > 0) {
      const updatedEarnedBadges = badgeSystem.getEarnedBadges()
      setEarnedBadges(updatedEarnedBadges)
      setNewBadgeIds(newBadges)
    }
    return newBadges
  }

  const clearNewBadges = () => {
    setNewBadgeIds([])
  }

  return (
    <BadgeSystemContext.Provider
      value={{
        badgeSystem,
        earnedBadges,
        checkForNewBadges,
        newBadgeIds,
        clearNewBadges,
      }}
    >
      {children}
    </BadgeSystemContext.Provider>
  )
}

export function useBadgeSystem() {
  const context = useContext(BadgeSystemContext)
  if (context === undefined) {
    throw new Error("useBadgeSystem must be used within a BadgeSystemProvider")
  }
  return context
}
