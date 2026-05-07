import '../../_lib/loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  const auth = requireAuth(req, res, 'paroquial')
  if (!auth) return

  const paroquiaId = auth.paroquiaId!

  const [totalCebs, totalDizimistas, totalDoacoes, configAtual] = await Promise.all([
    prisma.ceb.count({ where: { paroquiaId, status: 'ativo' } }),
    prisma.dizimista.count({ where: { ceb: { paroquiaId }, status: 'ativo' } }),
    prisma.doacao.aggregate({ where: { ceb: { paroquiaId } }, _sum: { valor: true }, _count: true }),
    prisma.configuracaoParoquia.findFirst({ where: { paroquiaId, ativa: true }, orderBy: { vigenteDesde: 'desc' } }),
  ])

  return res.status(200).json({
    totalCebs,
    totalDizimistas,
    totalDoacoes: totalDoacoes._count,
    valorTotalDoacoes: totalDoacoes._sum.valor ?? 0,
    configAtual,
  })
}
