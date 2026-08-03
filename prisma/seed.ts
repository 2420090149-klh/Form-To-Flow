import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  console.log("Seeding demo data...")

  const password = await bcrypt.hash("password123", 10)

  // Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: password,
    },
  })

  // Demo Event
  const demoEvent = await prisma.event.create({
    data: {
      title: "Global Tech Summit 2026",
      description: "The biggest technology conference of the year.",
      date: new Date("2026-10-15T09:00:00Z"),
      location: "San Francisco Moscone Center",
      ownerId: demoUser.id,
      templateConfig: JSON.stringify({ template: "modern", color: "#6366f1", textColor: "#ffffff" })
    }
  })

  // Demo Attendees
  await prisma.attendee.createMany({
    data: [
      {
        eventId: demoEvent.id,
        name: "Alice Smith",
        email: "alice@example.com",
        phone: "555-0101",
        ticketCode: "ALICE123",
      },
      {
        eventId: demoEvent.id,
        name: "Bob Jones",
        email: "bob@example.com",
        phone: "555-0102",
        ticketCode: "BOB456",
      },
      {
        eventId: demoEvent.id,
        name: "Charlie Davis",
        email: "charlie@example.com",
        phone: "555-0103",
        ticketCode: "CHARLIE789",
      }
    ]
  })

  console.log("Demo data created successfully!")
  console.log("Login with:")
  console.log("Email: demo@example.com")
  console.log("Password: password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
