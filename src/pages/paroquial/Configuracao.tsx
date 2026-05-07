import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../services/api'
import type { ConfiguracaoParoquia } from '../../types'
import ParoquialLayout from '../../components/layout/ParoquialLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const schema = z.object({
  percentualRepasseDizimoCebs: z.coerce.number().min(0).max(100),
  percentualRepasseOfertaCebs: z.coerce.number().min(0).max(100),
  percentualRepaseCuriaDiocesana: z.coerce.number().min(0).max(100),
  percentualRepasseDiocese: z.coerce.number().min(0).max(100),
  vigenteDesde: z.string().min(1, 'Obrigatório'),
})
type FormData = z.infer<typeof schema>

export default function Configuracao() {
  const [configAtual, setConfigAtual] = useState<ConfiguracaoParoquia | null>(null)
  const [historico, setHistorico] = useState<ConfiguracaoParoquia[]>([])
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const load = useCallback(() => {
    api.paroquial.configuracao.get().then((d: unknown) => {
      const data = d as { atual: ConfiguracaoParoquia | null; historico: ConfiguracaoParoquia[] }
      setConfigAtual(data.atual)
      setHistorico(data.historico)
      if (data.atual) {
        reset({
          percentualRepasseDizimoCebs: data.atual.percentualRepasseDizimoCebs,
          percentualRepasseOfertaCebs: data.atual.percentualRepasseOfertaCebs,
          percentualRepaseCuriaDiocesana: data.atual.percentualRepaseCuriaDiocesana,
          percentualRepasseDiocese: data.atual.percentualRepasseDiocese,
          vigenteDesde: new Date().toISOString().slice(0, 16),
        })
      }
    })
  }, [reset])

  useEffect(() => { load() }, [load])

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await api.paroquial.configuracao.create({
        ...data,
        vigenteDesde: new Date(data.vigenteDesde).toISOString(),
      })
      setSuccess('Configuração salva! Os CEBs foram notificados.')
      load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  return (
    <ParoquialLayout>
      <h1 style={{ margin: '0 0 24px', fontSize: 22 }}>Configuração de Percentuais</h1>

      {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} onClose={() => setError('')} /></div>}
      {success && <div style={{ marginBottom: 16 }}><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

      <div style={{ display: 'grid', gridTemplateColumns: configAtual ? '1fr 1fr' : '1fr', gap: 24, maxWidth: 900 }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 16 }}>Nova configuração</h2>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Repasse dízimo CEBs (%)" type="number" step="0.01" {...register('percentualRepasseDizimoCebs')} error={errors.percentualRepasseDizimoCebs?.message} />
            <Input label="Repasse oferta CEBs (%)" type="number" step="0.01" {...register('percentualRepasseOfertaCebs')} error={errors.percentualRepasseOfertaCebs?.message} />
            <Input label="Cúria diocesana (%)" type="number" step="0.01" {...register('percentualRepaseCuriaDiocesana')} error={errors.percentualRepaseCuriaDiocesana?.message} />
            <Input label="Diocese (%)" type="number" step="0.01" {...register('percentualRepasseDiocese')} error={errors.percentualRepasseDiocese?.message} />
            <Input label="Vigente desde" type="datetime-local" {...register('vigenteDesde')} error={errors.vigenteDesde?.message} />
            <Button type="submit" loading={isSubmitting}>Salvar e notificar CEBs</Button>
          </form>
        </div>

        {historico.length > 0 && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 16 }}>Histórico</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {historico.map(c => (
                <div key={c.id} style={{
                  padding: 12, borderRadius: 8, border: '1px solid var(--border)',
                  background: c.ativa ? 'var(--primary-light)' : undefined,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.ativa ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {c.ativa ? '● Ativa' : '○ Encerrada'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(c.vigenteDesde).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Dízimo: {c.percentualRepasseDizimoCebs}% · Oferta: {c.percentualRepasseOfertaCebs}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ParoquialLayout>
  )
}
