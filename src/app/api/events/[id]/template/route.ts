import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const maxDuration = 60; // Give it extra time if payload is large

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const resolvedParams = await params
    const eventId = resolvedParams.id
    
    // Verify permission
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        ownerId: session.user.id
      }
    })

    if (!event) {
      return new Response("Forbidden (Only owner can change template)", { status: 403 })
    }

    const { template, color, textColor, customTemplateImage, customTemplateLayout } = await req.json()

    await prisma.event.update({
      where: { id: eventId },
      data: {
        templateConfig: JSON.stringify({ template, color, textColor }),
        customTemplateImage: customTemplateImage || null,
        customTemplateLayout: customTemplateLayout || null
      }
    })

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Save template error:", error)
    return new Response("Internal Error", { status: 500 })
  }
}
