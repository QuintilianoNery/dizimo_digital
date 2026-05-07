import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  role: UserRole
  redirectTo: string
}

export default function ProtectedRoute({ children, role, redirectTo }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>Carregando...</span>
      </div>
    )
  }

  if (!user || user.role !== role) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
