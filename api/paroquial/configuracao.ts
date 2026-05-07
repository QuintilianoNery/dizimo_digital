import '../../_lib/loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const schema = z.object({
  percentualRepasseDizimoCebs: z.number().min(0).max(100),
  percentualRepasseOfertaCebs: z.number().min(0).max(100),
  percentualRepaseCuriaDiocesana: z.number().min(0).max(100),
  percentualRepasseDiocese: z.number().min(0).max(100),
  vigenteDesde: z.string().datetime(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'paroquial')
  if (!auth) return

  const paroquiaId = auth.paroquiaId!

  if (req.method === 'GET') {
    const config = await prisma.configuracaoParoquia.findFirst({
      where: { paroquiaId, ativa: true },
      orderBy: { vigenteDesde: 'desc' },
    })
    const historico = await prisma.configuracaoParoquia.findMany({
      where: { paroquiaId },
      orderBy: { vigenteDesde: 'desc' },
    })
    return res.status(200).json({ atual: config, historico })
  }

  if (req.method === 'POST') {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

    const now = new Date()

    // Close previous active config
    const previous = await prisma.configuracaoParoquia.findFirst({
      where: { paroquiaId, ativa: true },
      orderBy: { vigenteDesde: 'desc' },
    })

    if (previous) {
      await prisma.configuracaoParoquia.update({
        where: { id: previous.id },
        data: { ativa: false, vigenteAte: now },
      })
    }

    const nova = await prisma.configuracaoParoquia.create({
      data: {
        paroquiaId,
        ...parsed.data,
        vigenteDesde: new Date(parsed.data.vigenteDesde),
        alteradoPorId: auth.id,
      },
    })

    // Create alerts for all active CEBs of this paroquia
    if (previous) {
      const cebs = await prisma.ceb.findMany({ where: { paroquiaId, status: 'ativo' } })
      for (const ceb of cebs) {
        await prisma.alertaAlteracaoPercentual.create({
          data: {
            paroquiaId,
            cebId: ceb.id,
            configuracaoParoquiaId: nova.id,
            percentualAnterior: previous.percentualRepasseDizimoCebs,
            percentualNovo: nova.percentualRepasseDizimoCebs,
            mensagem: `Os percentuais de repasse foram atualizados. Novo percentual dízimo: ${nova.percentualRepasseDizimoCebs}%`,
          },
        })
      }
    }

    return res.status(201).json(nova)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
