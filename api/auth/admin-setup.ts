import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../_lib/prisma'
import { setSessionCookie } from '../_lib/auth'

const schema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const count = await prisma.administrador.count()
  if (count > 0) return res.status(409).json({ error: 'Administrador já configurado' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

  const { nome, email, senha } = parsed.data
  const senhaHash = await bcrypt.hash(senha, 12)

  const admin = await prisma.administrador.create({
    data: { nome, emailLogin: email, senhaHash },
  })

  setSessionCookie(res, { id: admin.id, role: 'admin' })
  return res.status(201).json({ id: admin.id, nome: admin.nome, email: admin.emailLogin, role: 'admin' })
}
