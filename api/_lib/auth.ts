import './loadEnv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'

export interface JwtPayload {
  id: string
  role: 'admin' | 'paroquial' | 'ceb'
  paroquiaId?: string
  cebId?: string
}

export function verifyToken(req: VercelRequest): JwtPayload | null {
  try {
    const cookie = req.headers.cookie ?? ''
    const match = cookie.match(/(?:^|;\s*)dizimo_session=([^;]+)/)
    if (!match) return null
    const token = match[1]
    const secret = process.env.JWT_SECRET
    if (!secret) return null
    return jwt.verify(token, secret) as JwtPayload
  } catch {
    return null
  }
}

export function requireAuth(
  req: VercelRequest,
  res: VercelResponse,
  role?: JwtPayload['role']
): JwtPayload | null {
  const payload = verifyToken(req)
  if (!payload) {
    res.status(401).json({ error: 'Não autenticado' })
    return null
  }
  if (role && payload.role !== role) {
    res.status(403).json({ error: 'Acesso negado' })
    return null
  }
  return payload
}

export function setSessionCookie(res: VercelResponse, payload: JwtPayload): void {
  const secret = process.env.JWT_SECRET ?? 'fallback-secret-change-me'
  const token = jwt.sign(payload, secret, { expiresIn: '30d' })
  const isProduction = process.env.NODE_ENV === 'production'
  
  res.setHeader(
    'Set-Cookie',
    `dizimo_session=${token}; Path=/; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}; Max-Age=${30 * 24 * 3600}`
  )
}

export function clearSessionCookie(res: VercelResponse): void {
  res.setHeader('Set-Cookie', 'dizimo_session=; Path=/; HttpOnly; Max-Age=0')
}
