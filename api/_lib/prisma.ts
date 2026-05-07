import './loadEnv'
import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL não definida. Configure .env/.env.local ou variáveis do ambiente Vercel.')
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
