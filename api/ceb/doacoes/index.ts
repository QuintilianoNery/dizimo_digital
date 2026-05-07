import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const createSchema = z.object({
  dizimistaId: z.string().uuid().optional().nullable(),
  valor: z.number().positive(),
  competenciaMes: z.number().int().min(1).max(12).optional(),
  competenciaAno: z.number().int().min(2000).optional(),
  tipoDoacao: z.enum(['dizimo', 'oferta', 'doacao']),
  formaPagamento: z.enum(['dinheiro', 'pix', 'transferencia']),
  observacoes: z.string().optional().nullable(),
})

const filterSchema = z.object({
  dizimistaId: z.string().uuid().optional(),
  tipoDoacao: z.enum(['dizimo', 'oferta', 'doacao']).optional(),
  competenciaMes: z.coerce.number().int().min(1).max(12).optional(),
  competenciaAno: z.coerce.number().int().min(2000).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'ceb')
  if (!auth) return

  const cebId = auth.cebId!

  if (req.method === 'GET') {
    const f = filterSchema.safeParse(req.query)
    const filters = f.success ? f.data : {}
    const doacoes = await prisma.doacao.findMany({
      where: {
        cebId,
        ...(filters.dizimistaId ? { dizimistaId: filters.dizimistaId } : {}),
        ...(filters.tipoDoacao ? { tipoDoacao: filters.tipoDoacao } : {}),
        ...(filters.competenciaMes ? { competenciaMes: filters.competenciaMes } : {}),
        ...(filters.competenciaAno ? { competenciaAno: filters.competenciaAno } : {}),
      },
      orderBy: [{ competenciaAno: 'desc' }, { competenciaMes: 'desc' }, { createdAt: 'desc' }],
      include: { dizimista: { select: { nome: true } } },
    })
    return res.status(200).json(doacoes)
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

    if (parsed.data.dizimistaId) {
      const dizimista = await prisma.dizimista.findFirst({ where: { id: parsed.data.dizimistaId, cebId } })
      if (!dizimista) return res.status(403).json({ error: 'Dizimista não pertence a este CEB' })
    }

    const now = new Date()
    const doacao = await prisma.doacao.create({
      data: {
        ...parsed.data,
        dizimistaId: parsed.data.dizimistaId ?? null,
        competenciaMes: parsed.data.competenciaMes ?? now.getMonth() + 1,
        competenciaAno: parsed.data.competenciaAno ?? now.getFullYear(),
      },
      include: { dizimista: { select: { nome: true } } },
    })

    return res.status(201).json(doacao)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
