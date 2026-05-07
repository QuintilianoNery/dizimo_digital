import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import type { Paroquia } from '../../types'
import AdminLayout from '../../components/layout/AdminLayout'

interface Stats { total: number; ativos: number; inativos: number }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [paroquias, setParoquias] = useState<Paroquia[]>([])

  useEffect(() => {
    api.admin.paroquias.list().then((data) => {
      const list = data as Paroquia[]
      setParoquias(list)
      setStats({
        total: list.length,
        ativos: list.filter(p => p.status === 'ativo').length,
        inativos: list.filter(p => p.status === 'inativo').length,
      })
    })
  }, [])

  return (
    <AdminLayout>
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Dashboard</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--text-muted)', fontSize: 14 }}>Visão geral do sistema</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total de Paróquias', value: stats?.total ?? '—', color: 'var(--primary)' },
          { label: 'Paróquias Ativas', value: stats?.ativos ?? '—', color: '#16a34a' },
          { label: 'Paróquias Inativas', value: stats?.inativos ?? '—', color: '#dc2626' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 24,
            boxShadow: 'var(--shadow)', borderTop: `4px solid ${card.color}`,
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Paróquias recentes</h2>
          <Link to="/admin/paroquias" style={{ fontSize: 14, color: 'var(--primary)' }}>Ver todas →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)', fontWeight: 500 }}>Nome</th>
              <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)', fontWeight: 500 }}>Código</th>
              <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paroquias.slice(0, 5).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 0' }}>{p.nome}</td>
                <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>{p.codigoParoquia}</td>
                <td style={{ padding: '10px 0' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: p.status === 'ativo' ? '#dcfce7' : '#fee2e2',
                    color: p.status === 'ativo' ? '#166534' : '#991b1b',
                  }}>{p.status}</span>
                </td>
              </tr>
            ))}
            {paroquias.length === 0 && (
              <tr><td colSpan={3} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma paróquia cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
