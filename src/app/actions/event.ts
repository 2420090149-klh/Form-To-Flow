"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function createEvent(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const dateStr = formData.get("date") as string
  const location = formData.get("location") as string

  if (!title) throw new Error("Title is required")

  const event = await prisma.event.create({
    data: {
      title,
      description,
      location,
      date: dateStr ? new Date(dateStr) : null,
      ownerId: session.user.id
    }
  })

  redirect(`/dashboard/events/${event.id}`)
}

export async function deleteEvent(eventId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event || event.ownerId !== session.user.id) {
    throw new Error("Forbidden: Only the owner can delete this event")
  }

  await prisma.event.delete({
    where: { id: eventId }
  })

  redirect("/dashboard")
}
