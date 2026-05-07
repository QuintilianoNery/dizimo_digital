import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import type { ConfiguracaoParoquia } from '../../types'
import ParoquialLayout from '../../components/layout/ParoquialLayout'

interface DashStats {
  totalCebs: number
  totalDizimistas: number
  totalDoacoes: number
  valorTotalDoacoes: number
  configAtual: ConfiguracaoParoquia | null
}

export default function ParoquialDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null)

  useEffect(() => {
    api.paroquial.dashboard().then(d => setStats(d as DashStats))
  }, [])

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <ParoquialLayout>
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Dashboard</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--text-muted)', fontSize: 14 }}>Resumo da sua paróquia</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'CEBs ativos', value: stats?.totalCebs ?? '—', color: 'var(--primary)' },
          { label: 'Dizimistas ativos', value: stats?.totalDizimistas ?? '—', color: '#0891b2' },
          { label: 'Total de doações', value: stats?.totalDoacoes ?? '—', color: '#7c3aed' },
          { label: 'Valor total', value: stats ? fmt(stats.valorTotalDoacoes) : '—', color: '#16a34a' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 24,
            boxShadow: 'var(--shadow)', borderTop: `4px solid ${card.color}`,
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {stats?.configAtual && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Configuração de percentuais (ativa)</h2>
            <Link to="/paroquial/configuracao" style={{ fontSize: 14, color: 'var(--primary)' }}>Gerenciar →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Repasse dízimo CEBs', value: stats.configAtual.percentualRepasseDizimoCebs },
              { label: 'Repasse oferta CEBs', value: stats.configAtual.percentualRepasseOfertaCebs },
              { label: 'Cúria diocesana', value: stats.configAtual.percentualRepaseCuriaDiocesana },
              { label: 'Diocese', value: stats.configAtual.percentualRepasseDiocese },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{item.value}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ParoquialLayout>
  )
}
