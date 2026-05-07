import '../../../_lib/loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const updateSchema = z.object({
  nome: z.string().min(2).optional(),
  tipo: z.enum(['pastoral', 'movimento']).optional(),
  status: z.enum(['ativo', 'inativo']).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'paroquial')
  if (!auth) return

  const { id } = req.query as { id: string }

  const item = await prisma.pastoralMovimento.findUnique({ where: { id } })
  if (!item) return res.status(404).json({ error: 'Não encontrado' })

  if (req.method === 'GET') return res.status(200).json(item)

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const updated = await prisma.pastoralMovimento.update({ where: { id }, data: parsed.data })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.pastoralMovimento.update({ where: { id }, data: { status: 'inativo' } })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
