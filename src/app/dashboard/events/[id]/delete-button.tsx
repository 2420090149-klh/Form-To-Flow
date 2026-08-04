"use client"

import { Button } from "@/components/ui/button"
import { deleteEvent } from "@/app/actions/event"
import { useState } from "react"

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone and will delete all attendees, templates, and data.")) {
      setLoading(true)
      try {
        await deleteEvent(eventId)
      } catch (e: any) {
        alert(e.message || "Failed to delete event")
        setLoading(false)
      }
    }
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete Event"}
    </Button>
  )
}
