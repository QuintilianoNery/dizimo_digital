import '../../_lib/loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  const auth = requireAuth(req, res, 'ceb')
  if (!auth) return

  const cebId = auth.cebId!

  const ceb = await prisma.ceb.findUnique({ where: { id: cebId } })
  if (!ceb) {
    return res.status(404).json({ error: 'CEB não encontrada' })
  }

  const [totalDizimistas, totalDoacoes, ultimasDoacoes, configAtual] = await Promise.all([
    prisma.dizimista.count({ where: { cebId, status: 'ativo' } }),
    prisma.doacao.aggregate({ where: { cebId }, _sum: { valor: true }, _count: true }),
    prisma.doacao.findMany({
      where: { cebId },
      orderBy: [{ competenciaAno: 'desc' }, { competenciaMes: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      include: { dizimista: { select: { nome: true } } },
    }),
    prisma.configuracaoParoquia.findFirst({
      where: { paroquiaId: ceb.paroquiaId, ativa: true },
      orderBy: { vigenteDesde: 'desc' },
    }),
  ])

  return res.status(200).json({
    totalDizimistas,
    totalDoacoes: totalDoacoes._count,
    valorTotalDoacoes: totalDoacoes._sum.valor ?? 0,
    ultimasDoacoes,
    configAtual,
  })
}
