import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const updateSchema = z.object({
  tipo: z.enum(['dizimo', 'oferta', 'campanha']).optional(),
  valor: z.number().positive().optional(),
  data: z.string().datetime().optional(),
  observacao: z.string().optional().nullable(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'ceb')
  if (!auth) return

  const { id } = req.query as { id: string }
  const cebId = auth.cebId!

  const doacao = await prisma.doacao.findFirst({ where: { id, cebId } })
  if (!doacao) return res.status(404).json({ error: 'Doação não encontrada' })

  if (req.method === 'GET') {
    const full = await prisma.doacao.findUnique({ where: { id }, include: { dizimista: true } })
    return res.status(200).json(full)
  }

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const updated = await prisma.doacao.update({
      where: { id },
      data: {
        ...parsed.data,
        data: parsed.data.data ? new Date(parsed.data.data) : undefined,
      },
    })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.doacao.delete({ where: { id } })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
