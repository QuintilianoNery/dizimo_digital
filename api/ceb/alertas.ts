import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'ceb')
  if (!auth) return

  const cebId = auth.cebId!

  if (req.method === 'GET') {
    const alertas = await prisma.alertaAlteracaoPercentual.findMany({
      where: { cebId },
      orderBy: { createdAt: 'desc' },
      include: { configuracaoParoquia: true },
    })
    return res.status(200).json(alertas)
  }

  if (req.method === 'PATCH') {
    await prisma.alertaAlteracaoPercentual.updateMany({
      where: { cebId, lidoEm: null },
      data: { lidoEm: new Date() },
    })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
