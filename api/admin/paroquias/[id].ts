import '../../../_lib/loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const updateSchema = z.object({
  nome: z.string().min(2).optional(),
  emailLoginSecretaria: z.string().email().optional(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  fundacao: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  paroco: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  status: z.enum(['ativo', 'inativo']).optional(),
})

const resetSchema = z.object({ novaSenha: z.string().min(8) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'admin')
  if (!auth) return

  const { id } = req.query as { id: string }

  const paroquia = await prisma.paroquia.findUnique({ where: { id } })
  if (!paroquia) return res.status(404).json({ error: 'Paróquia não encontrada' })

  if (req.method === 'GET') {
    return res.status(200).json({ ...paroquia, senhaHash: undefined })
  }

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const updated = await prisma.paroquia.update({ where: { id }, data: parsed.data })
    return res.status(200).json({ ...updated, senhaHash: undefined })
  }

  if (req.method === 'DELETE') {
    await prisma.paroquia.update({ where: { id }, data: { status: 'inativo' } })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'PATCH') {
    const parsed = resetSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const senhaHash = await bcrypt.hash(parsed.data.novaSenha, 12)
    await prisma.paroquia.update({ where: { id }, data: { senhaHash } })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
