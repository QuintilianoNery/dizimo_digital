import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const createSchema = z.object({
  dizimistaId: z.string().uuid(),
  tipo: z.enum(['dizimo', 'oferta', 'campanha']),
  valor: z.number().positive(),
  data: z.string().datetime(),
  observacao: z.string().optional().nullable(),
})

const filterSchema = z.object({
  dizimistaId: z.string().uuid().optional(),
  tipo: z.enum(['dizimo', 'oferta', 'campanha']).optional(),
  de: z.string().optional(),
  ate: z.string().optional(),
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
        ...(filters.tipo ? { tipo: filters.tipo } : {}),
        ...(filters.de || filters.ate
          ? {
              data: {
                ...(filters.de ? { gte: new Date(filters.de) } : {}),
                ...(filters.ate ? { lte: new Date(filters.ate) } : {}),
              },
            }
          : {}),
      },
      orderBy: { data: 'desc' },
      include: { dizimista: { select: { nome: true } } },
    })
    return res.status(200).json(doacoes)
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

    const dizimista = await prisma.dizimista.findFirst({ where: { id: parsed.data.dizimistaId, cebId } })
    if (!dizimista) return res.status(403).json({ error: 'Dizimista não pertence a este CEB' })

    const doacao = await prisma.doacao.create({
      data: {
        ...parsed.data,
        data: new Date(parsed.data.data),
        cebId,
        registradoPorId: auth.id,
      },
      include: { dizimista: { select: { nome: true } } },
    })
    return res.status(201).json(doacao)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
