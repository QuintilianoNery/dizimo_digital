import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const createSchema = z.object({
  nome: z.string().min(2),
  cargo: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().optional().nullable(),
  pastoralMovimentoId: z.string().uuid().optional().nullable(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'ceb')
  if (!auth) return

  const cebId = auth.cebId!

  if (req.method === 'GET') {
    const conselheiros = await prisma.conselheiroComunitario.findMany({
      where: { cebId },
      orderBy: { nome: 'asc' },
    })
    return res.status(200).json(conselheiros)
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

    const c = await prisma.conselheiroComunitario.create({
      data: {
        ...parsed.data,
        cebId,
      },
    })

    return res.status(201).json(c)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
