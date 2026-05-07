import '../../../_lib/loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const createSchema = z.object({
  nome: z.string().min(2),
  dataNascimento: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  endereco: z.string().optional().nullable(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'ceb')
  if (!auth) return

  const cebId = auth.cebId!

  if (req.method === 'GET') {
    const dizimistas = await prisma.dizimista.findMany({
      where: { cebId },
      orderBy: { nome: 'asc' },
    })
    return res.status(200).json(dizimistas)
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const d = await prisma.dizimista.create({
      data: {
        ...parsed.data,
        dataNascimento: parsed.data.dataNascimento ? new Date(parsed.data.dataNascimento) : null,
        cebId,
      },
    })
    return res.status(201).json(d)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
