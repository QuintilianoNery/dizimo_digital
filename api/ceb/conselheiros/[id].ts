import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const updateSchema = z.object({
  nome: z.string().min(2).optional(),
  cargo: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().optional().nullable(),
  pastoralMovimentoId: z.string().uuid().optional().nullable(),
  status: z.enum(['ativo', 'inativo']).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'ceb')
  if (!auth) return

  const { id } = req.query as { id: string }
  const cebId = auth.cebId!

  const c = await prisma.conselheiroComunitario.findFirst({ where: { id, cebId } })
  if (!c) return res.status(404).json({ error: 'Conselheiro não encontrado' })

  if (req.method === 'GET') return res.status(200).json(c)

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const updated = await prisma.conselheiroComunitario.update({ where: { id }, data: parsed.data })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.conselheiroComunitario.update({ where: { id }, data: { status: 'inativo' } })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
