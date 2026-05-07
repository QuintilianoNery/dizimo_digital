import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const createSchema = z.object({
  codigoCeb: z.string().min(1),
  nome: z.string().min(2),
  emailLogin: z.string().email(),
  senha: z.string().min(8),
  telefone: z.string().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'paroquial')
  if (!auth) return

  const paroquiaId = auth.paroquiaId!

  if (req.method === 'GET') {
    const cebs = await prisma.ceb.findMany({
      where: { paroquiaId },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, codigoCeb: true, emailLogin: true, telefone: true, status: true, createdAt: true },
    })
    return res.status(200).json(cebs)
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

    const { senha, ...data } = parsed.data
    const senhaHash = await bcrypt.hash(senha, 12)

    try {
      const ceb = await prisma.ceb.create({ data: { ...data, senhaHash, paroquiaId } })
      return res.status(201).json({ ...ceb, senhaHash: undefined })
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Unique constraint')) {
        return res.status(409).json({ error: 'Código já cadastrado' })
      }
      throw e
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
