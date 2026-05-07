import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../_lib/prisma'
import { setSessionCookie } from '../_lib/auth'

const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

  const { email, senha } = parsed.data

  const admin = await prisma.administrador.findUnique({ where: { emailLogin: email } })
  if (!admin) return res.status(401).json({ error: 'Credenciais inválidas' })

  const valid = await bcrypt.compare(senha, admin.senhaHash)
  if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })

  if (admin.status !== 'ativo') return res.status(403).json({ error: 'Conta inativa' })

  setSessionCookie(res, { id: admin.id, role: 'admin' })
  return res.status(200).json({ id: admin.id, nome: admin.nome, email: admin.emailLogin, role: 'admin' })
}
