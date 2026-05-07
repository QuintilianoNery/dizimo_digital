import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../_lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  const { q } = req.query
  const where = q
    ? {
        OR: [
          { nome: { contains: String(q), mode: 'insensitive' as const } },
          { codigoParoquia: { contains: String(q), mode: 'insensitive' as const } },
        ],
        status: 'ativo',
      }
    : { status: 'ativo' }

  const paroquias = await prisma.paroquia.findMany({
    where,
    select: { id: true, nome: true, codigoParoquia: true, logoUrl: true },
    orderBy: { nome: 'asc' },
    take: 20,
  })

  return res.status(200).json(paroquias)
}
