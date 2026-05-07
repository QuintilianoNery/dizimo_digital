import '../_lib/loadEnv'
import '../_lib/loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../_lib/prisma'
import { setSessionCookie } from '../_lib/auth'

const schema = z.object({
  paroquiaIdentifier: z.string().min(1),
  cebIdentifier: z.string().min(1),
  senha: z.string().min(1),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

  const { paroquiaIdentifier, cebIdentifier, senha } = parsed.data

  const paroquia = await prisma.paroquia.findFirst({
    where: {
      OR: [{ id: paroquiaIdentifier }, { codigoParoquia: paroquiaIdentifier }],
      status: 'ativo',
    },
  })
  if (!paroquia) return res.status(401).json({ error: 'Credenciais inválidas' })

  const ceb = await prisma.ceb.findFirst({
    where: {
      paroquiaId: paroquia.id,
      OR: [{ id: cebIdentifier }, { codigoCeb: cebIdentifier }],
      status: 'ativo',
    },
  })
  if (!ceb) return res.status(401).json({ error: 'Credenciais inválidas' })

  const valid = await bcrypt.compare(senha, ceb.senhaHash)
  if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })

  setSessionCookie(res, { id: ceb.id, role: 'ceb', paroquiaId: paroquia.id, cebId: ceb.id })
  return res.status(200).json({
    id: ceb.id,
    nome: ceb.nome,
    codigoCeb: ceb.codigoCeb,
    paroquiaNome: paroquia.nome,
    role: 'ceb',
  })
}
