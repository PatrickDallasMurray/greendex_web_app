"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { SettingsPage } from "@/components/settings-page"
import { useState } from "react"
import type { Trip } from "@/app/page"

interface SettingsDialogProps {
  trips?: Trip[]
}

export function SettingsDialog({ trips = [] }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
        </DialogHeader>
        <SettingsPage onClose={() => setOpen(false)} trips={trips} />
      </DialogContent>
    </Dialog>
  )
}
