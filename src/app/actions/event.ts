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
  const durationDaysStr = formData.get("durationDays") as string
  const location = formData.get("location") as string

  if (!title) throw new Error("Title is required")
  if (!dateStr) throw new Error("Start date is required")

  const durationDays = parseInt(durationDaysStr) || 1;

  const event = await prisma.event.create({
    data: {
      title,
      description,
      location,
      date: new Date(dateStr),
      durationDays,
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
export async function updateEventSettings(eventId: string, data: { slug?: string, landingTemplate?: string, formSchema?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerId: session.user.id }
  })

  if (!event) throw new Error("Event not found or unauthorized")

  // Check if slug is unique if provided
  if (data.slug) {
    const existing = await prisma.event.findFirst({ where: { slug: data.slug, id: { not: eventId } } })
    if (existing) throw new Error("Slug is already taken")
  }

  let parsedSchema = null
  if (data.formSchema) {
    try {
      parsedSchema = JSON.parse(data.formSchema)
    } catch (e) {
      throw new Error("Invalid JSON in Form Schema")
    }
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      slug: data.slug || null,
      landingTemplate: data.landingTemplate || "minimal",
      formSchema: parsedSchema || null
    }
  })
}
