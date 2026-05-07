import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const createSchema = z.object({
  nome: z.string().min(2),
  cargo: z.string().min(2),
  email: z.string().email().optional().nullable(),
  telefone: z.string().optional().nullable(),
  emailLogin: z.string().email().optional().nullable(),
  senha: z.string().min(8).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'ceb')
  if (!auth) return

  const cebId = auth.cebId!

  if (req.method === 'GET') {
    const conselheiros = await prisma.conselheiroComunitario.findMany({
      where: { cebId },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, cargo: true, email: true, telefone: true, emailLogin: true, status: true },
    })
    return res.status(200).json(conselheiros)
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const { senha, ...data } = parsed.data
    const senhaHash = senha ? await bcrypt.hash(senha, 12) : null
    const c = await prisma.conselheiroComunitario.create({ data: { ...data, senhaHash, cebId } })
    return res.status(201).json({ ...c, senhaHash: undefined })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
