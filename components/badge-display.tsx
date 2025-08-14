"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Lock } from "lucide-react"
import { AVAILABLE_BADGES, type Badge as BadgeType } from "@/lib/badge-system"
import { useBadgeSystem } from "@/hooks/use-badge-system"
import type { Trip } from "@/app/page"

interface BadgeDisplayProps {
  trips: Trip[]
  compact?: boolean
}

export function BadgeDisplay({ trips, compact = false }: BadgeDisplayProps) {
  const { badgeSystem, earnedBadges } = useBadgeSystem()

  const getBadgeWithStatus = (badge: BadgeType) => {
    const isEarned = badgeSystem.hasBadge(badge.id)
    const progress = badgeSystem.getBadgeProgress(badge.id, trips)
    const progressPercentage = badgeSystem.getProgressPercentage(badge.id, trips)
    const earnedBadge = earnedBadges.find((eb) => eb.badgeId === badge.id)

    return {
      ...badge,
      isEarned,
      progress,
      progressPercentage,
      earnedAt: earnedBadge?.earnedAt,
    }
  }

  const badgesWithStatus = AVAILABLE_BADGES.map(getBadgeWithStatus)
  const earnedCount = badgesWithStatus.filter((b) => b.isEarned).length

  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {earnedCount} of {AVAILABLE_BADGES.length} Badges
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Keep logging to earn more!</div>
              </div>
            </div>
            <div className="flex gap-1">
              {badgesWithStatus.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className={`text-lg ${badge.isEarned ? "" : "grayscale opacity-50"}`}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
              {badgesWithStatus.length > 3 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">+{badgesWithStatus.length - 3}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements ({earnedCount}/{AVAILABLE_BADGES.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badgesWithStatus.map((badge) => (
            <Card
              key={badge.id}
              className={`relative overflow-hidden transition-all ${
                badge.isEarned
                  ? `${badge.bgColor} ${badge.borderColor} shadow-md`
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`text-2xl ${badge.isEarned ? "" : "grayscale opacity-50"} flex-shrink-0`}>
                    {badge.isEarned ? badge.icon : <Lock className="h-6 w-6 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold text-sm ${
                          badge.isEarned ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {badge.name}
                      </h3>
                      {badge.isEarned && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-xs mb-2 ${
                        badge.isEarned ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {badge.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{badge.requirement}</p>

                    {!badge.isEarned && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-500">
                            {badge.id.includes("savings")
                              ? `${badge.progress.toFixed(1)} / ${badge.id.includes("25kg") ? "25" : "5"} kg`
                              : badge.id.includes("streak")
                                ? `${badge.progress} / ${badge.id.includes("7") ? "7" : "3"} days`
                                : `${badge.progress} / 1`}
                          </span>
                        </div>
                        <Progress value={badge.progressPercentage} className="h-1" />
                      </div>
                    )}

                    {badge.isEarned && badge.earnedAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
