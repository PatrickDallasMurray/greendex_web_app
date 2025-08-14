"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, X } from "lucide-react"
import { AVAILABLE_BADGES } from "@/lib/badge-system"
import { useBadgeSystem } from "@/hooks/use-badge-system"

export function BadgeNotification() {
  const { newBadgeIds, clearNewBadges } = useBadgeSystem()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (newBadgeIds.length > 0) {
      setIsVisible(true)
    }
  }, [newBadgeIds])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      clearNewBadges()
    }, 300)
  }

  if (!isVisible || newBadgeIds.length === 0) {
    return null
  }

  const newBadges = newBadgeIds.map((id) => AVAILABLE_BADGES.find((badge) => badge.id === id)).filter(Boolean)

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-500">
      <Card className="w-80 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg flex-shrink-0">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {newBadges.length === 1 ? "New Badge Earned!" : "New Badges Earned!"}
              </h3>
              <div className="space-y-2">
                {newBadges.map((badge) => (
                  <div key={badge?.id} className="flex items-center gap-2">
                    <span className="text-lg">{badge?.icon}</span>
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{badge?.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{badge?.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="flex-shrink-0 h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
