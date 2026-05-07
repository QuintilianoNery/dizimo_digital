import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../_lib/prisma'
import { setSessionCookie } from '../_lib/auth'

const schema = z.object({
  paroquiaIdentifier: z.string().min(1),
  senha: z.string().min(1),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

  const { paroquiaIdentifier, senha } = parsed.data

  const paroquia = await prisma.paroquia.findFirst({
    where: {
      OR: [
        { id: paroquiaIdentifier },
        { codigoParoquia: paroquiaIdentifier },
        { emailLoginSecretaria: paroquiaIdentifier },
      ],
      status: 'ativo',
    },
  })

  if (!paroquia) return res.status(401).json({ error: 'Credenciais inválidas' })

  const valid = await bcrypt.compare(senha, paroquia.senhaHash)
  if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })

  setSessionCookie(res, { id: paroquia.id, role: 'paroquial', paroquiaId: paroquia.id })
  return res.status(200).json({
    id: paroquia.id,
    nome: paroquia.nome,
    codigoParoquia: paroquia.codigoParoquia,
    logoUrl: paroquia.logoUrl,
    role: 'paroquial',
  })
}
