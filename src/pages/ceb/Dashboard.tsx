import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import type { AlertaAlteracaoPercentual, ConfiguracaoParoquia } from '../../types'
import CebLayout from '../../components/layout/CebLayout'
import Button from '../../components/ui/Button'

interface DashboardData {
  totalDizimistas: number
  totalDoacoes: number
  valorTotalDoacoes: number
  configAtual: ConfiguracaoParoquia | null
}

export default function CebDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [alertas, setAlertas] = useState<AlertaAlteracaoPercentual[]>([])

  const load = async () => {
    const [dash, alerts] = await Promise.all([api.ceb.dashboard(), api.ceb.alertas.list()])
    setData(dash as DashboardData)
    setAlertas(alerts as AlertaAlteracaoPercentual[])
  }

  useEffect(() => {
    void load()
  }, [])

  const marcarLidos = async () => {
    await api.ceb.alertas.markAllRead()
    await load()
  }

  return (
    <CebLayout>
      <h1 style={{ marginBottom: 16, fontSize: 22 }}>Dashboard CEB</h1>

      {alertas.filter(a => !a.lidoEm).length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 10, padding: 14, marginBottom: 18 }}>
          <strong>Alertas de alteração de percentual</strong>
          <ul>
            {alertas.filter(a => !a.lidoEm).map(a => (
              <li key={a.id}>{a.mensagem} ({a.percentualAnterior}% → {a.percentualNovo}%)</li>
            ))}
          </ul>
          <Button variant="secondary" onClick={() => { void marcarLidos() }}>Marcar alertas como lidos</Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <Card label="Dizimistas" value={data?.totalDizimistas ?? 0} />
        <Card label="Doações" value={data?.totalDoacoes ?? 0} />
        <Card label="Valor total" value={(data?.valorTotalDoacoes ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
      </div>

      <div style={{ marginTop: 16, background: 'var(--bg-card)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow)' }}>
        <h2 style={{ fontSize: 16 }}>Percentuais vigentes da paróquia</h2>
        {data?.configAtual ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 }}>
            <div>Dízimo CEB: <strong>{data.configAtual.percentualRepasseDizimoCebs}%</strong></div>
            <div>Oferta CEB: <strong>{data.configAtual.percentualRepasseOfertaCebs}%</strong></div>
            <div>Cúria: <strong>{data.configAtual.percentualRepaseCuriaDiocesana}%</strong></div>
            <div>Diocese: <strong>{data.configAtual.percentualRepasseDiocese}%</strong></div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Sem configuração vigente.</p>
        )}
      </div>

      <div style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
        Exportação Excel/PDF: <strong>TODO</strong>
      </div>
    </CebLayout>
  )
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 14, boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
