import { PrismaClient } from "@/generated/prisma/client"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"


const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const connectionString = "file:./dev.db"

function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  // In Prisma v7, the adapter takes a config object with the database URL
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" })
  
  const client = new PrismaClient({ 
    adapter,
  })
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
  }
  
  return client
}

export const prisma = getPrismaClient()
