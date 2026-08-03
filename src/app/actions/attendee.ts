"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteAttendees(eventId: string, attendeeIds: string[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify that the user is the owner or a manager of the event
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { ownerId: session.user.id },
        {
          teamMembers: {
            some: {
              userId: session.user.id,
              role: "MANAGER"
            }
          }
        }
      ]
    }
  })

  if (!event) {
    throw new Error("Forbidden: You do not have permission to delete attendees for this event.")
  }

  if (attendeeIds.length === 0) return

  await prisma.attendee.deleteMany({
    where: {
      eventId: eventId,
      id: { in: attendeeIds }
    }
  })

  revalidatePath(`/dashboard/events/${eventId}`)
  revalidatePath(`/dashboard/events/${eventId}/attendees`)
  revalidatePath(`/dashboard/events/${eventId}/dispatch`)
}
