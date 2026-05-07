import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyToken } from '../_lib/auth'
import { prisma } from '../_lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  const payload = verifyToken(req)
  if (!payload) return res.status(200).json({ authenticated: false })

  try {
    if (payload.role === 'admin') {
      const admin = await prisma.administrador.findUnique({ where: { id: payload.id } })
      if (!admin) return res.status(200).json({ authenticated: false })
      return res.status(200).json({ authenticated: true, role: 'admin', user: { id: admin.id, nome: admin.nome, email: admin.emailLogin } })
    }

    if (payload.role === 'paroquial' && payload.paroquiaId) {
      const paroquia = await prisma.paroquia.findUnique({ where: { id: payload.paroquiaId } })
      if (!paroquia) return res.status(200).json({ authenticated: false })
      return res.status(200).json({
        authenticated: true,
        role: 'paroquial',
        user: { id: paroquia.id, nome: paroquia.nome, codigoParoquia: paroquia.codigoParoquia, logoUrl: paroquia.logoUrl },
      })
    }

    if (payload.role === 'ceb' && payload.cebId) {
      const ceb = await prisma.ceb.findUnique({ where: { id: payload.cebId }, include: { paroquia: true } })
      if (!ceb) return res.status(200).json({ authenticated: false })
      return res.status(200).json({
        authenticated: true,
        role: 'ceb',
        user: { id: ceb.id, nome: ceb.nome, codigoCeb: ceb.codigoCeb, paroquiaId: ceb.paroquiaId, paroquiaNome: ceb.paroquia.nome },
      })
    }

    return res.status(200).json({ authenticated: false })
  } catch {
    return res.status(200).json({ authenticated: false })
  }
}
