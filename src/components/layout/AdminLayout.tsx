import { type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/admin', label: '🏠 Dashboard', exact: true },
  { to: '/admin/paroquias', label: '⛪ Paróquias' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        width: 220, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>✝ Dízimo Digital</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Administrador</div>
        </div>
        {navItems.map(item => {
          const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                padding: '10px 20px', textDecoration: 'none', fontSize: 14,
                color: active ? 'var(--primary)' : 'var(--text)',
                background: active ? 'var(--primary-light)' : 'transparent',
                fontWeight: active ? 600 : 400,
                borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
              }}
            >
              {item.label}
            </Link>
          )
        })}
        <div style={{ marginTop: 'auto', padding: '0 20px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '10px', background: 'none', border: '1px solid var(--border)',
              borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)',
            }}
          >
            🚪 Sair
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}
