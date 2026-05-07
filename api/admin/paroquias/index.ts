import '../../_lib/loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const createSchema = z.object({
  codigoParoquia: z.string().min(1),
  nome: z.string().min(2),
  emailLoginSecretaria: z.string().email(),
  senha: z.string().min(8),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  fundacao: z.string().optional(),
  cnpj: z.string().optional(),
  paroco: z.string().optional(),
  logoUrl: z.string().url().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'admin')
  if (!auth) return

  if (req.method === 'GET') {
    const { q, status } = req.query
    const where: Record<string, unknown> = {}
    if (status) where.status = String(status)
    if (q) {
      where.OR = [
        { nome: { contains: String(q), mode: 'insensitive' } },
        { codigoParoquia: { contains: String(q), mode: 'insensitive' } },
      ]
    }
    const paroquias = await prisma.paroquia.findMany({
      where,
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, codigoParoquia: true, emailLoginSecretaria: true, logoUrl: true, status: true, email: true, telefone: true, paroco: true, createdAt: true },
    })
    return res.status(200).json(paroquias)
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

    const { senha, ...data } = parsed.data
    const senhaHash = await bcrypt.hash(senha, 12)

    try {
      const paroquia = await prisma.paroquia.create({
        data: { ...data, senhaHash, administradorCriouId: auth.id },
      })
      return res.status(201).json({ ...paroquia, senhaHash: undefined })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Unique constraint')) {
        return res.status(409).json({ error: 'Código ou email já cadastrado' })
      }
      throw e
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
