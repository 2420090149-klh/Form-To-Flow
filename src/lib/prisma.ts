import { PrismaClient } from "@/generated/prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const client = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
  }
  
  return client
}

export const prisma = getPrismaClient()
