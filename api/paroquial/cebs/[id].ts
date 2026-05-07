import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../_lib/prisma'
import { requireAuth } from '../../_lib/auth'

const updateSchema = z.object({
  nome: z.string().min(2).optional(),
  emailLogin: z.string().email().optional(),
  telefone: z.string().optional().nullable(),
  status: z.enum(['ativo', 'inativo']).optional(),
})

const resetSchema = z.object({ novaSenha: z.string().min(8) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res, 'paroquial')
  if (!auth) return

  const { id } = req.query as { id: string }
  const paroquiaId = auth.paroquiaId!

  const ceb = await prisma.ceb.findFirst({ where: { id, paroquiaId } })
  if (!ceb) return res.status(404).json({ error: 'CEB não encontrado' })

  if (req.method === 'GET') {
    return res.status(200).json({ ...ceb, senhaHash: undefined })
  }

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const updated = await prisma.ceb.update({ where: { id }, data: parsed.data })
    return res.status(200).json({ ...updated, senhaHash: undefined })
  }

  if (req.method === 'DELETE') {
    await prisma.ceb.update({ where: { id }, data: { status: 'inativo' } })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'PATCH') {
    const parsed = resetSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    const senhaHash = await bcrypt.hash(parsed.data.novaSenha, 12)
    await prisma.ceb.update({ where: { id }, data: { senhaHash } })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
