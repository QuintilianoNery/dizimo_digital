import '../../../_lib/loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const schema = z.object({
  nome: z.string().min(2),
  tipo: z.enum(['pastoral', 'movimento']),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'paroquial')
  if (!auth) return

  if (req.method === 'GET') {
    const pastorais = await prisma.pastoralMovimento.findMany({
      orderBy: [{ tipo: 'asc' }, { nome: 'asc' }],
    })
    return res.status(200).json(pastorais)
  }

  if (req.method === 'POST') {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const item = await prisma.pastoralMovimento.create({ data: parsed.data })
    return res.status(201).json(item)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
